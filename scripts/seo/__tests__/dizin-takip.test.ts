/**
 * INV-DIZIN-TAKIP-1 · Dizin takip betiğinin ağsız çekirdeği (Kanban SEO dizin-takip kartı; cetvel
 * docs/standards/dizin-sistemleri-standard.md D7).
 *
 * Kilitlenenler: lastmod sonrası tarama TAMAM; lastmod sonrası istek eşik dolana kadar BEKLE, dolunca TEKRAR (Bing, Yandex;
 * Google'da TEKRAR yok, tek istek: SEO-112); lastmod'a yansımayan değişim --degisen listesiyle YAP üretir (SEO-115); hiç istek yoksa
 * YAP; noindex ATLA (kota boşa gitmez); ölçülemeyen durum YAP DEĞİL OLCULEMEDI; Bing "0001-01-01" yokluk değeri tarama
 * sayılmaz; IndexNow ve Yandex'in kendi kuralları; defterde bozuk satır sessizce yutulmaz (sayılır); içe aktarım iki kez
 * koşulursa çiftlemez; site haritası ve kapsam seçimi. Veri sahtedir (P6: gerçek arama verisi yok).
 */
import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import {
  BING_ARALIK_MS, KAYIT_BASLANGICI, KART_BICIMI, TEKRAR_ESIGI_GUN, TEK_ISTEK_MOTORLARI, defterAyristir, degisenCoz, eskiKayitlariCoz, gorunmeOzeti, haritaCoz, hareketGecerliMi, kapsamSec, karar, kaydetArgumanlariCoz, markdownYaz,
  satirYaz, sonHareket, yedekAl, bagTablosu, istekTarihiBul, sonucSatiriMi, tabloUret, tarihAl, yandexSonTarama, yeniOlanlar, yalnizTarihMi,
} from '../dizin-takip.mjs'

const S = 'https://venthub.com.tr'
const A = `${S}/tr/bilgi-merkezi/ornek`
const B = `${S}/tr/category/ornek`
const gun = (n: number) => `2026-11-${String(n).padStart(2, '0')}T08:00:00.000Z`
const ms = (iso: string) => Date.parse(iso)
const NOW = ms(gun(10))

describe('karar: Google ve Bing', () => {
  it('son tarama lastmod sonrası → TAMAM', () => {
    expect(karar({ motor: 'google', lastmod: gun(3), sonTarama: gun(4), simdi: NOW }).durum).toBe('TAMAM')
  })
  it('tarama tam lastmod anında → TAMAM (sınır dahil)', () => {
    expect(karar({ motor: 'bing', lastmod: gun(3), sonTarama: gun(3), simdi: NOW }).durum).toBe('TAMAM')
  })
  it('tarama lastmod\'dan eski ve istek yok → YAP', () => {
    expect(karar({ motor: 'google', lastmod: gun(5), sonTarama: gun(1), sonHareket: null, simdi: NOW }).durum).toBe('YAP')
  })
  it('hiç taranmamış ve istek yok → YAP', () => {
    expect(karar({ motor: 'bing', lastmod: gun(5), sonTarama: null, simdi: NOW }).durum).toBe('YAP')
  })
  it('istek lastmod sonrası, eşik dolmadı → BEKLE (aynı adrese ikinci istek atılmaz)', () => {
    const k = karar({ motor: 'google', lastmod: gun(5), sonTarama: gun(1), sonHareket: ms(gun(7)), simdi: NOW })
    expect(k.durum).toBe('BEKLE')
  })
  it('SEO-112: Google\'da TEKRAR yok, adres başına tek istek: istek ne kadar eski olursa olsun BEKLE (taranmış ya da hiç taranmamış)', () => {
    expect(TEK_ISTEK_MOTORLARI.has('google')).toBe(true)
    expect((TEKRAR_ESIGI_GUN as Record<string, number>).google).toBeUndefined()
    const lm = '2026-11-01T10:00:00Z'
    const istek = ms('2026-11-02T08:00:00Z')
    for (const simdi of [ms('2026-11-04T08:00:00Z'), ms('2026-11-10T08:00:00Z'), ms('2026-12-20T08:00:00Z')]) {
      expect(karar({ motor: 'google', lastmod: lm, sonTarama: null, sonHareket: istek, simdi }).durum).toBe('BEKLE')
      expect(karar({ motor: 'google', lastmod: lm, sonTarama: '2026-10-20T00:00:00Z', sonHareket: istek, simdi }).durum).toBe('BEKLE')
    }
    expect(karar({ motor: 'google', lastmod: lm, sonTarama: null, sonHareket: istek, simdi: ms('2026-12-20T08:00:00Z') }).neden).toContain('tek istek')
  })
  it('SEO-112: Google\'da içerik istekten SONRA değişirse yeni istek hakkı doğar (tek istek değişim başınadır)', () => {
    expect(karar({ motor: 'google', lastmod: gun(8), sonTarama: gun(1), sonHareket: ms(gun(5)), simdi: NOW }).durum).toBe('YAP')
  })
  it('Bing eşiği 5 gün: 6 gün önceki gönderim TEKRAR, 4 gün önceki BEKLE', () => {
    expect(karar({ motor: 'bing', lastmod: gun(1), sonTarama: null, sonHareket: ms(gun(4)), simdi: NOW }).durum).toBe('TEKRAR')
    expect(karar({ motor: 'bing', lastmod: gun(1), sonTarama: null, sonHareket: ms(gun(6)), simdi: NOW }).durum).toBe('BEKLE')
  })
  it('istek lastmod\'dan ÖNCE ise sayılmaz → YAP (içerik istekten sonra değişti)', () => {
    expect(karar({ motor: 'google', lastmod: gun(8), sonTarama: gun(1), sonHareket: ms(gun(5)), simdi: NOW }).durum).toBe('YAP')
  })
  it('noindex → ATLA, istek geçmişi ne olursa olsun', () => {
    expect(karar({ motor: 'google', lastmod: gun(8), sonTarama: null, noindex: true, simdi: NOW }).durum).toBe('ATLA')
  })
  it('ölçülemeyen durum → OLCULEMEDI, YAP DEĞİL (kör kapı yok)', () => {
    expect(karar({ motor: 'google', lastmod: gun(8), olculemedi: true, simdi: NOW }).durum).toBe('OLCULEMEDI')
  })
  it('lastmod yok: taranmışsa TAMAM, taranmamışsa YAP', () => {
    expect(karar({ motor: 'google', lastmod: null, sonTarama: gun(2), simdi: NOW }).durum).toBe('TAMAM')
    expect(karar({ motor: 'google', lastmod: null, sonTarama: null, simdi: NOW }).durum).toBe('YAP')
  })
  it('Bing yokluk değeri 0001-01-01 tarama sayılmaz', () => {
    expect(tarihAl('0001-01-01T00:00:00.000Z')).toBeNull()
    expect(karar({ motor: 'bing', lastmod: gun(2), sonTarama: '0001-01-01T00:00:00.000Z', simdi: NOW }).durum).toBe('YAP')
  })
})

describe('karar: IndexNow ve Yandex', () => {
  it('IndexNow: bildirim lastmod sonrası TAMAM, önce YAP', () => {
    expect(karar({ motor: 'indexnow', lastmod: gun(3), sonHareket: ms(gun(4)), simdi: NOW }).durum).toBe('TAMAM')
    expect(karar({ motor: 'indexnow', lastmod: gun(5), sonHareket: ms(gun(4)), simdi: NOW }).durum).toBe('YAP')
    expect(karar({ motor: 'indexnow', lastmod: gun(5), sonHareket: null, simdi: NOW }).durum).toBe('YAP')
  })
  it('Yandex: aramada ölçümü son tarama sayılır; yalnız "aramada" sonuçlu olcum', () => {
    const h = [
      { tarih: gun(6), motor: 'yandex', eylem: 'olcum', adres: A, sonuc: 'aramada' },
      { tarih: gun(8), motor: 'yandex', eylem: 'olcum', adres: A, sonuc: 'listede-yok' },
      { tarih: gun(9), motor: 'yandex', eylem: 'olcum', adres: B },
    ]
    expect(yandexSonTarama(h, A)).toBe(ms(gun(6)))
    expect(yandexSonTarama(h, B)).toBeNull()
  })
  it('olcum hareketi istek sayılmaz (sonHareket yalnız istek ve gönderim)', () => {
    const h = [{ tarih: gun(6), motor: 'google', eylem: 'olcum', adres: A }, { tarih: gun(4), motor: 'google', eylem: 'istek', adres: A }]
    expect(sonHareket(h, 'google', A)).toBe(ms(gun(4)))
  })
})

describe('karar: kayıt başlangıcı ve hata metni', () => {
  it('IndexNow: adres bazlı kayıttan ÖNCEKİ lastmod ESKI (günlük görev kapsar), YAP değil', () => {
    expect(KAYIT_BASLANGICI.indexnow).toBe('2026-11-05T00:00:00Z')
    expect(karar({ motor: 'indexnow', lastmod: '2026-11-01T00:00:00.000Z', sonHareket: null, simdi: NOW }).durum).toBe('ESKI')
  })
  it('Yandex: kayıt başlamadan önceki lastmod ESKI, sonrası YAP; kayıtlı istek varsa BEKLE', () => {
    expect(karar({ motor: 'yandex', lastmod: '2026-10-25T00:00:00.000Z', simdi: NOW }).durum).toBe('ESKI')
    expect(karar({ motor: 'yandex', lastmod: gun(4), simdi: NOW }).durum).toBe('YAP')
    expect(karar({ motor: 'yandex', lastmod: gun(4), sonHareket: ms(gun(6)), simdi: NOW }).durum).toBe('BEKLE')
  })
  it('ESKI olan adres "YAPILACAK" satırına girmez', () => {
    const t = tabloUret({ kapsam: [{ adres: A, lastmod: '2026-10-25T00:00:00.000Z' }], hareketler: [], olcum: { google: { [A]: { sonTarama: gun(1) } }, bing: { [A]: { sonTarama: gun(1) } } }, simdi: NOW })
    expect(t[0].yandex.durum).toBe('ESKI')
    expect(t[0].indexnow.durum).toBe('ESKI')
    expect(markdownYaz(t, NOW)).toContain('YAPILACAK → yok')
  })
  it('ölçüm hatası nedeni tabloda görünür (OLCULEMEDI, sessiz sıfır yok)', () => {
    const t = tabloUret({ kapsam: [{ adres: A, lastmod: gun(6) }], hareketler: [], olcum: { bing: { [A]: { hata: 'RATE_LIMIT 429' } } }, simdi: NOW })
    expect(t[0].bing.durum).toBe('OLCULEMEDI')
    expect(t[0].bing.neden).toContain('RATE_LIMIT 429')
  })
})

describe('defter', () => {
  it('geçerli satırlar okunur, bozuk ve yabancı adresli satırlar SAYILIR (sessiz yutma yok)', () => {
    const metin = [
      satirYaz({ tarih: gun(4), motor: 'google', eylem: 'istek', adres: A }),
      '{bozuk json',
      JSON.stringify({ tarih: gun(4), motor: 'google', eylem: 'istek', adres: 'https://baska-site.com/x' }),
      JSON.stringify({ tarih: 'tarih-degil', motor: 'bing', eylem: 'gonderim', adres: A }),
      JSON.stringify({ tarih: gun(4), motor: 'bilinmeyen', eylem: 'istek', adres: A }),
      '',
    ].join('\n')
    const r = defterAyristir(metin)
    expect(r.hareketler).toHaveLength(1)
    expect(r.atlanan).toBe(4)
  })
  it('hareketGecerliMi: eksik alan reddedilir', () => {
    expect(hareketGecerliMi(null)).toBe(false)
    expect(hareketGecerliMi({ tarih: gun(4), motor: 'google', eylem: 'istek' })).toBe(false)
    expect(hareketGecerliMi({ tarih: gun(4), motor: 'google', eylem: 'istek', adres: A })).toBe(true)
  })
})

describe('içe aktarım', () => {
  const elle = `${JSON.stringify({ tarih: gun(4), adres: A })}\n`
  const gunluk = `${JSON.stringify({ tarih: gun(3), google_tamam_adresler: [B, '/tr/category/yol'] })}\n`
  const bing = [
    { alinma: gun(5), kuru: false, partiler: [{ durum: 'GONDERILDI' }], plan: { gonderilecek: [A] } },
    { alinma: gun(6), kuru: true, partiler: [], plan: { gonderilecek: [B] } },
    { alinma: gun(7), kuru: false, partiler: [{ durum: 'HATA' }], plan: { gonderilecek: [B] } },
  ]
  it('elle istek, günlük görev ve Bing gönderimi → hareket; kuru ve hatalı koşu sayılmaz', () => {
    const r = eskiKayitlariCoz({ elleIstek: elle, gunluk, bingDosyalari: bing })
    expect(r.filter((h) => h.motor === 'google')).toHaveLength(3)
    expect(r.filter((h) => h.motor === 'bing')).toEqual([expect.objectContaining({ adres: A, eylem: 'gonderim' })])
    expect(r.some((h) => h.adres === `${S}/tr/category/yol`)).toBe(true)
  })
  it('aynı içe aktarım ikinci kez koşulursa yeni satır üretmez', () => {
    const aday = eskiKayitlariCoz({ elleIstek: elle, gunluk, bingDosyalari: bing })
    const ilk = yeniOlanlar([], aday)
    expect(ilk).toHaveLength(aday.length)
    expect(yeniOlanlar(ilk, aday)).toHaveLength(0)
  })
})

describe('Bing hız sınırı (SEO-102)', () => {
  it('ilk geçiş en az 1 sn aralıklı, yeniden denemeler her turda daha yavaş', () => {
    expect(BING_ARALIK_MS[0]).toBeGreaterThanOrEqual(1000)
    expect(BING_ARALIK_MS.length).toBeGreaterThanOrEqual(2)
    for (let i = 1; i < BING_ARALIK_MS.length; i++) expect(BING_ARALIK_MS[i]).toBeGreaterThan(BING_ARALIK_MS[i - 1])
  })
})

describe('harita ve kapsam', () => {
  const xml = `<urlset><url><loc>${A}</loc><lastmod>${gun(9)}</lastmod></url><url><loc>${B}</loc></url><url><loc>${S}/tr/eski</loc><lastmod>2026-09-01T00:00:00.000Z</lastmod></url></urlset>`
  it('lastmod olmayan adres null döner', () => {
    expect(haritaCoz(xml).map((x) => x.lastmod)).toEqual([gun(9), null, '2026-09-01T00:00:00.000Z'])
  })
  it('kapsam: son 14 günde lastmod ya da hareket; eski ve hareketsiz adres dışarıda', () => {
    const harita = haritaCoz(xml)
    const hareketler = [{ tarih: gun(8), motor: 'bing', eylem: 'gonderim', adres: B }]
    const k = kapsamSec({ harita, hareketler, gun: 14, simdi: NOW })
    expect(k.map((x) => x.adres)).toEqual([A, B].sort())
  })
  it('SEO-100: gun verilmezse kapsam TÜM site haritasıdır (eski, hareketsiz, lastmod yok dahil)', () => {
    const k = kapsamSec({ harita: haritaCoz(xml), hareketler: [], simdi: NOW })
    expect(k.map((x) => x.adres).sort()).toEqual([A, B, `${S}/tr/eski`].sort())
  })
  it('SEO-100: Google taranmış ama dizinde değilse TAMAM değil, YAP; dizinde ise TAMAM', () => {
    const girdi = { motor: 'google', lastmod: gun(5), sonTarama: gun(6), simdi: NOW }
    const yok = karar({ ...girdi, dizinde: false, kapsam: 'Crawled - currently not indexed' })
    expect(yok.durum).toBe('YAP')
    expect(yok.neden).toContain('dizinde değil')
    expect(karar({ ...girdi, dizinde: true }).durum).toBe('TAMAM')
    expect(karar({ ...girdi, dizinde: null }).durum).toBe('TAMAM')
  })
  it('--adres ile elle verilen adres kapsama girer', () => {
    const k = kapsamSec({ harita: haritaCoz(xml), hareketler: [], gun: 1, simdi: NOW, ek: [`${S}/tr/eski`] })
    expect(k.some((x) => x.adres === `${S}/tr/eski`)).toBe(true)
  })
})

describe('SEO-115: lastmod\'a yansımayan değişim (--degisen listesi)', () => {
  const DEGISIM = '2026-11-08T16:08:00Z'
  it('lastmod eski, tarama lastmod sonrası AMA değişimden önce, istek yok → YAP (liste olmadan TAMAM)', () => {
    const ortak = { motor: 'google', lastmod: gun(1), sonTarama: gun(5), sonHareket: null, simdi: NOW }
    expect(karar(ortak).durum).toBe('TAMAM')
    const k = karar({ ...ortak, degisen: DEGISIM })
    expect(k.durum).toBe('YAP')
    expect(k.neden).toContain('değişim (kod yayını)')
  })
  it('istek değişimden ÖNCE ise sayılmaz → YAP; değişimden SONRA ise BEKLE; tarama değişimden sonraysa TAMAM', () => {
    const ortak = { motor: 'google', lastmod: gun(1), degisen: DEGISIM, simdi: NOW }
    expect(karar({ ...ortak, sonTarama: gun(5), sonHareket: ms(gun(7)) }).durum).toBe('YAP')
    expect(karar({ ...ortak, sonTarama: gun(5), sonHareket: ms(gun(9)) }).durum).toBe('BEKLE')
    expect(karar({ ...ortak, sonTarama: gun(9), sonHareket: null }).durum).toBe('TAMAM')
  })
  it('değişim lastmod\'dan ESKİYSE lastmod esas kalır (liste kararı geriye çekmez)', () => {
    expect(karar({ motor: 'google', lastmod: gun(9), degisen: DEGISIM, sonTarama: gun(8), sonHareket: null, simdi: NOW }).durum).toBe('YAP')
    expect(karar({ motor: 'google', lastmod: gun(3), degisen: '2026-11-02T00:00:00Z', sonTarama: gun(4), simdi: NOW }).durum).toBe('TAMAM')
  })
  it('IndexNow: bildirim değişimden önceyse YAP, sonraysa TAMAM; noindex yine ATLA', () => {
    expect(karar({ motor: 'indexnow', lastmod: gun(6), degisen: DEGISIM, sonHareket: ms(gun(7)), simdi: NOW }).durum).toBe('YAP')
    expect(karar({ motor: 'indexnow', lastmod: gun(6), degisen: DEGISIM, sonHareket: ms(gun(9)), simdi: NOW }).durum).toBe('TAMAM')
    expect(karar({ motor: 'google', lastmod: gun(1), degisen: DEGISIM, noindex: true, simdi: NOW }).durum).toBe('ATLA')
  })
  it('degisenCoz: ayırıcılar, göreli yol, yorum; aynı adreste en yeni tarih; bozuk satır SAYILIR', () => {
    const { kayitlar, atlanan } = degisenCoz([
      '# URN-164 konum yolu', '',
      `${A} 2026-11-08T16:08:00Z`,
      `/tr/category/ornek;2026-11-07T10:00:00Z`,
      `${A},2026-11-09T09:00:00Z`,
      `${A}\t2026-11-06T09:00:00Z`,
      'https://baska-site.example/x 2026-11-08T16:08:00Z',
      `${B} tarih-degil`,
      'tek-sutun',
    ].join('\r\n'))
    expect(kayitlar.size).toBe(2)
    expect(kayitlar.get(A)).toBe(ms('2026-11-09T09:00:00Z'))
    expect(kayitlar.get(B)).toBe(ms('2026-11-07T10:00:00Z'))
    expect(atlanan).toBe(3)
    expect(degisenCoz('').kayitlar.size).toBe(0)
  })
  it('tabloUret: listedeki adres YAP olur ve satırda değişim tarihi taşınır; listede olmayan adres etkilenmez', () => {
    const kapsam = [{ adres: A, lastmod: gun(1) }, { adres: B, lastmod: gun(1) }]
    const olcum = { google: { [A]: { sonTarama: gun(5) }, [B]: { sonTarama: gun(5) } }, bing: {} }
    const t = tabloUret({ kapsam, hareketler: [], olcum, simdi: NOW, degisen: new Map([[A, ms(DEGISIM)]]) })
    expect(t[0].google.durum).toBe('YAP')
    expect(t[0].degisen).toBe('2026-11-08T16:08:00.000Z')
    expect(t[1].google.durum).toBe('TAMAM')
    expect('degisen' in t[1]).toBe(false)
  })
})

describe('tablo ve markdown', () => {
  it('YAP ve TEKRAR "YAPILACAK" satırına, TAMAM ve BEKLE girmez', () => {
    const kapsam = [{ adres: A, lastmod: gun(5) }, { adres: B, lastmod: gun(5) }]
    const olcum = { google: { [A]: { sonTarama: gun(1) }, [B]: { sonTarama: gun(6) } }, bing: { [A]: { sonTarama: null }, [B]: { sonTarama: gun(6) } } }
    const hareketler = [{ tarih: gun(8), motor: 'bing', eylem: 'gonderim', adres: A }]
    const t = tabloUret({ kapsam, hareketler, olcum, simdi: NOW })
    expect(t[0].google.durum).toBe('YAP')
    expect(t[0].bing.durum).toBe('BEKLE')
    expect(t[1].google.durum).toBe('TAMAM')
    const md = markdownYaz(t, NOW)
    expect(md).toContain('YAPILACAK → ')
    expect(md).toMatch(/google: \/bilgi-merkezi\/ornek/)
    expect(md).not.toMatch(/bing: \/bilgi-merkezi\/ornek/)
  })
  it('Google, Bing ve IndexNow tamamsa yalnız Yandex (ölçümü yok) YAPILACAK satırında kalır', () => {
    const t = tabloUret({
      kapsam: [{ adres: A, lastmod: gun(6) }], hareketler: [{ tarih: gun(7), motor: 'indexnow', eylem: 'gonderim', adres: A }],
      olcum: { google: { [A]: { sonTarama: gun(7) } }, bing: { [A]: { sonTarama: gun(7) } } }, simdi: NOW,
    })
    // Yandex: istek de ölçüm de yok → YAP; bu yüzden yalnız yandex yapılacak olmalı
    expect(markdownYaz(t, NOW)).toMatch(/YAPILACAK → yandex: /)
  })
})

describe('CLI güvenliği', () => {
  const betik = resolve(__dirname, '..', 'dizin-takip.mjs')
  const kos = (args: string[]) => {
    try {
      execFileSync('node', [betik, ...args], { stdio: 'pipe' })
      return { kod: 0, hata: '' }
    } catch (e) {
      const x = e as { status: number; stderr: Buffer }
      return { kod: x.status, hata: x.stderr.toString() }
    }
  }
  it('depo içi defter yolu reddedilir (exit 2), ağa gitmeden', () => {
    const r = kos(['--durum', '--hareket', resolve(__dirname, 'hareketler.jsonl')])
    expect(r.kod).toBe(2)
    expect(r.hata).toContain('git deposunun içinde')
  })
  it('--kaydet geçersiz motor ya da yabancı adres exit 2', () => {
    const tmp = process.env.TEMP || process.env.TMPDIR || '/tmp'
    expect(kos(['--kaydet', 'bilinmeyen', 'istek', `${S}/tr/x`, '--hareket', `${tmp}/dizin-takip-test-${process.pid}.jsonl`]).kod).toBe(2)
    expect(kos(['--kaydet', 'google', 'istek', 'https://baska.com/x', '--hareket', `${tmp}/dizin-takip-test-${process.pid}.jsonl`]).kod).toBe(2)
  })
})

describe('günlük defter yedeği', () => {
  it('yedekAl defteri yedek/hareketler-<gün>.jsonl olarak aynen kopyalar, aynı gün üzerine yazar', () => {
    const d = mkdtempSync(join(tmpdir(), 'dizin-yedek-'))
    try {
      const defter = join(d, 'hareketler.jsonl')
      writeFileSync(defter, 'satir1\n')
      const gun = new Date('2026-11-08T10:00:00Z')
      expect(yedekAl(defter, gun)).toBe(1)
      const yedek = join(d, 'yedek', 'hareketler-2026-11-08.jsonl')
      expect(readFileSync(yedek, 'utf8')).toBe('satir1\n')
      writeFileSync(defter, 'satir1\nsatir2\n')
      yedekAl(defter, gun)
      expect(readFileSync(yedek, 'utf8')).toBe('satir1\nsatir2\n')
      expect(existsSync(join(d, 'yedek', 'hareketler-2026-11-09.jsonl'))).toBe(false)
    } finally { rmSync(d, { recursive: true, force: true }) }
  })
})

describe('karar: yalnız-tarih lastmod (SEO-98, 8 Kasım yanlış-YAP)', () => {
  it('yalnizTarihMi: tarih ve tam gece yarısı UTC yalnız-tarihtir, saatli değer değil', () => {
    expect(yalnizTarihMi('2026-11-08')).toBe(true)
    expect(yalnizTarihMi('2026-11-08T00:00:00.000Z')).toBe(true)
    expect(yalnizTarihMi('2026-11-08T00:00:00Z')).toBe(true)
    expect(yalnizTarihMi('2026-11-08T00:00:00+00:00')).toBe(true)
    expect(yalnizTarihMi('2026-11-08T08:00:00.000Z')).toBe(false)
    expect(yalnizTarihMi('2026-11-08T00:00:01Z')).toBe(false)
    expect(yalnizTarihMi(null)).toBe(false)
  })

  it('istek önceki gün 22:49Z, lastmod gün başı 00:00Z (TR saatiyle aynı gün): Google YAP DEĞİL, BEKLE', () => {
    const k = karar({ motor: 'google', lastmod: '2026-11-08T00:00:00.000Z', sonTarama: null, sonHareket: ms('2026-11-07T22:49:00Z'), simdi: ms('2026-11-08T12:00:00Z') })
    expect(k.durum).toBe('BEKLE')
  })

  it('istek TR gün başından önce (önceki gün 20:59Z): hâlâ YAP (içerik o gün değişmiş olabilir)', () => {
    const k = karar({ motor: 'google', lastmod: '2026-11-08', sonTarama: null, sonHareket: ms('2026-11-07T20:59:00Z'), simdi: ms('2026-11-08T12:00:00Z') })
    expect(k.durum).toBe('YAP')
  })

  it('saatli lastmod için tolerans YOK: 22:49Z isteği ertesi gün 08:00Z lastmod\'undan önce → YAP', () => {
    const k = karar({ motor: 'google', lastmod: '2026-11-08T08:00:00.000Z', sonTarama: null, sonHareket: ms('2026-11-07T22:49:00Z'), simdi: ms('2026-11-08T12:00:00Z') })
    expect(k.durum).toBe('YAP')
  })

  it('IndexNow: aynı tolerans geçerli (gün başı lastmod, önceki gün 22:49Z bildirim → TAMAM)', () => {
    expect(karar({ motor: 'indexnow', lastmod: '2026-11-08T00:00:00.000Z', sonHareket: ms('2026-11-07T22:49:00Z'), simdi: ms('2026-11-08T12:00:00Z') }).durum).toBe('TAMAM')
  })
})

describe('görünme alanı (SEO-109: canlı arama sonucu, sıra değil)', () => {
  const g = (n: number, sonuc: string) => ({ tarih: gun(n), motor: 'google', eylem: 'gorunme', adres: A, sonuc })

  it('geçerli sonuç kabul edilir, bilinmeyen sonuç ve google dışı motor reddedilir', () => {
    expect(hareketGecerliMi(g(5, 'gorundu'))).toBe(true)
    expect(hareketGecerliMi(g(5, 'gorunmuyor'))).toBe(true)
    expect(hareketGecerliMi(g(5, 'sira-3'))).toBe(false)
    expect(hareketGecerliMi({ ...g(5, 'gorundu'), motor: 'bing' })).toBe(false)
    expect(hareketGecerliMi({ ...g(5, 'gorundu'), sonuc: undefined })).toBe(false)
  })
  it('görünme ölçümü istek sayılmaz: sonHareket null kalır, TEKRAR/BEKLE kararını bozmaz', () => {
    expect(sonHareket([g(5, 'gorunmuyor')], 'google', A)).toBeNull()
  })
  it('ilk görünme günü ve lastmod’dan gün farkı; sonra kaybolursa son sonuç gorunmuyor kalır', () => {
    const o = gorunmeOzeti([g(4, 'gorunmuyor'), g(7, 'gorundu'), g(9, 'gorunmuyor')], A, gun(1))
    expect(o.ilkGorundu).toBe(gun(7))
    expect(o.gunFarki).toBe(6)
    expect(o.sonSonuc).toBe('gorunmuyor')
  })
  it('hiç ölçüm yoksa boş özet; yalnız gorunmuyor varsa ilkGorundu null', () => {
    expect(gorunmeOzeti([], A, gun(1))).toEqual({ ilkGorundu: null, son: null, sonSonuc: null, gunFarki: null })
    expect(gorunmeOzeti([g(4, 'gorunmuyor')], A, gun(1)).ilkGorundu).toBeNull()
  })
  it('--durum markdown’ı Görünme sütununu yazar: GÖRÜNMÜYOR, GÖRÜNDÜ, ölçülmedi', () => {
    const kapsam = [{ adres: A, lastmod: gun(1) }, { adres: B, lastmod: gun(1) }]
    const t = tabloUret({ kapsam, hareketler: [g(4, 'gorunmuyor')], olcum: {}, simdi: NOW })
    const md = markdownYaz(t, NOW)
    expect(md).toContain('| Görünme |')
    expect(md).toMatch(/ornek \| .*GÖRÜNMÜYOR \(11-04\)/)
    expect(md).toMatch(/category\/ornek \| .*ölçülmedi/)
    const t2 = tabloUret({ kapsam, hareketler: [g(4, 'gorundu')], olcum: {}, simdi: NOW })
    expect(markdownYaz(t2, NOW)).toMatch(/GÖRÜNDÜ ilk 11-04 \(\+3g\)/)
  })
})

// INV-DIZIN-KAYDET-1 (SEO-127, D7 madde 2): --kaydet sessiz veri kaybı ve yanlış adres yazmaz; gerekçe ve kart satıra yazılır.
describe('SEO-127: --kaydet argüman kapıları (INV-DIZIN-KAYDET-1)', () => {
  const c = (...a: string[]) => kaydetArgumanlariCoz(['--kaydet', ...a])

  it('virgüllü tek argüman geçer (boşluk ve boş parça temizlenir)', () => {
    expect(c('google', 'istek', `${A},${B}`)).toMatchObject({ motor: 'google', eylem: 'istek', adresler: [A, B], neden: null, kart: null })
    expect(c('google', 'istek', ` ${A} , ${B},`)).toMatchObject({ adresler: [A, B] })
  })
  it('boşlukla verilen ikinci ve sonraki adres HATA: eskiden sessizce düşerdi', () => {
    for (const girdi of [[A, B], [A, B, '--sonuc', 'aramada'], [`${A},${B}`, B]]) {
      const r = c('google', 'istek', ...girdi)
      expect(r).toHaveProperty('hata')
      expect((r as { hata: string }).hata).toContain('virgülle tek argüman')
    }
  })
  it('seçenek değerleri fazla argüman sayılmaz; seçenekler --kaydet öncesinde de olabilir', () => {
    const r = c('google', 'istek', A, '--sonuc', 'aramada', '--tarih', '2026-11-04T07:11:00Z', '--hareket', '/x/y.jsonl', '--neden', 'bilerek tekrar', '--kart', 'SEO-127')
    expect(r).toMatchObject({ adresler: [A], neden: 'bilerek tekrar', kart: 'SEO-127' })
    expect(kaydetArgumanlariCoz(['--hareket', '/x/y.jsonl', '--kaydet', 'google', 'istek', A])).toMatchObject({ adresler: [A] })
  })
  it('--neden metnini tırnaksız verirsen ikinci kelime fazla argümandır: HATA', () => {
    expect(c('google', 'istek', A, '--neden', 'bilerek', 'tekrar')).toHaveProperty('hata')
  })
  it('https:// ile başlamayan her adres HATA: göreli yol, http, Git Bash çevirisi, ikinci adres', () => {
    for (const kotu of ['/tr/bilgi-merkezi/x', 'C:/Program Files/Git/tr/bilgi-merkezi/x', 'http://venthub.com.tr/tr/x', 'venthub.com.tr/tr/x', `${A},/tr/x`]) {
      const r = c('google', 'istek', kotu)
      expect(r, kotu).toHaveProperty('hata')
      expect((r as { hata: string }).hata).toContain('https://')
    }
  })
  it('boşluk ya da yeni satır içeren tek argüman HATA: "$(cat kalan.txt)" iki adresi tek bozuk satır yazardı', () => {
    for (const kotu of [`${A}\n${B}`, `${A} ${B}`, `${A}\t${B}`, `${B},${A}\n${B}`]) {
      const r = c('google', 'istek', kotu)
      expect(r, JSON.stringify(kotu)).toHaveProperty('hata')
      expect((r as { hata: string }).hata).toContain('boşluk')
    }
  })
  it('--ad=değer biçimi HATA: --neden=x ve --kart=SEO-1 eskiden sessizce yutulurdu', () => {
    for (const kotu of ['--neden=bilerek tekrar', '--kart=SEO-127', '--kart=seo-bozuk', '--sonuc=aramada']) {
      const r = c('google', 'istek', A, kotu)
      expect(r, kotu).toHaveProperty('hata')
      expect((r as { hata: string }).hata).toContain('--ad=değer')
    }
    expect(kaydetArgumanlariCoz(['--hareket=/x/y.jsonl', '--kaydet', 'google', 'istek', A])).toHaveProperty('hata')
  })
  it('--kaydet ile anlamsız değerli seçenek (--adres B, --kalan B) değeri sessizce düşmez: HATA', () => {
    for (const ad of ['--adres', '--kalan', '--cikti', '--sinir']) expect(c('google', 'istek', A, ad, B), ad).toHaveProperty('hata')
  })
  it('eksik konumsal argüman ya da seçenek adres yerine HATA', () => {
    expect(c('google', 'istek')).toHaveProperty('hata')
    expect(c('google', 'istek', '--sonuc', 'aramada')).toHaveProperty('hata')
  })
  it('--kart yalnız ÖNEK-sayı (büyük harf); değersiz ya da başka bayrakla biten HATA', () => {
    expect(KART_BICIMI.test('SEO-127')).toBe(true)
    for (const kotu of ['seo-127', 'SEO127', 'SEO-', '127', 'SEO-127x', 'SEO-12-3', ' SEO-127']) expect(c('google', 'istek', A, '--kart', kotu), kotu).toHaveProperty('hata')
    expect(c('google', 'istek', A, '--kart')).toHaveProperty('hata')
    expect(c('google', 'istek', A, '--kart', '--neden', 'x')).toHaveProperty('hata')
    expect(c('google', 'istek', A, '--kart', 'URN-5')).toMatchObject({ kart: 'URN-5' })
  })
  it('--neden değersiz, boş ya da başka bayrakla biterse HATA', () => {
    expect(c('google', 'istek', A, '--neden')).toHaveProperty('hata')
    expect(c('google', 'istek', A, '--neden', '  ')).toHaveProperty('hata')
    expect(c('google', 'istek', A, '--neden', '--kart', 'SEO-1')).toHaveProperty('hata')
  })
  it('neden/kart satıra yazılır, yoksa alan hiç yoktur; okuma ve tablo bu alanlardan etkilenmez', () => {
    const temel = { tarih: gun(4), motor: 'google', eylem: 'istek', adres: A }
    const zengin = { ...temel, neden: 'bilerek tekrar: yanlış adres kaydı', kart: 'SEO-127' }
    expect(JSON.parse(satirYaz(zengin))).toMatchObject({ neden: 'bilerek tekrar: yanlış adres kaydı', kart: 'SEO-127' })
    const sade = JSON.parse(satirYaz(temel))
    expect('neden' in sade).toBe(false)
    expect('kart' in sade).toBe(false)
    const r = defterAyristir([satirYaz(zengin), satirYaz(temel)].join('\n'))
    expect(r.hareketler).toHaveLength(2)
    expect(r.atlanan).toBe(0)
    const kapsam = [{ adres: A, lastmod: gun(3) }]
    expect(tabloUret({ kapsam, hareketler: [zengin], olcum: {}, simdi: NOW })).toEqual(tabloUret({ kapsam, hareketler: [temel], olcum: {}, simdi: NOW }))
    expect(yeniOlanlar([temel], [zengin])).toHaveLength(0)
  })
})

describe('SEO-127: CLI --kaydet (uçtan uca, depo dışı klasör, yedek kapalı)', () => {
  const betik = resolve(__dirname, '..', 'dizin-takip.mjs')
  const calistir = (args: string[]) => {
    try {
      const cikti = execFileSync(process.execPath, [betik, ...args], { encoding: 'utf8', stdio: 'pipe', env: { ...process.env, DIZIN_TAKIP_YEDEK2: '' } })
      return { kod: 0, cikti, hata: '' }
    } catch (e) {
      const x = e as { status: number; stderr: Buffer | string }
      return { kod: x.status, cikti: '', hata: String(x.stderr) }
    }
  }
  const klasor = () => mkdtempSync(join(tmpdir(), 'dizin-kaydet-'))

  it('boşlukla verilen ikinci adres: çıkış 2, deftere HİÇBİR satır yazılmaz', () => {
    const d = klasor()
    try {
      const defter = join(d, 'hareketler.jsonl')
      const r = calistir(['--kaydet', 'google', 'istek', A, B, '--hareket', defter])
      expect(r.kod).toBe(2)
      expect(r.hata).toContain('virgülle tek argüman')
      expect(existsSync(defter)).toBe(false)
    } finally { rmSync(d, { recursive: true, force: true }) }
  })
  it('https olmayan adres (Git Bash çevirisi dahil): çıkış 2, defter yok', () => {
    const d = klasor()
    try {
      const defter = join(d, 'hareketler.jsonl')
      for (const kotu of ['C:/Program Files/Git/tr/bilgi-merkezi/x', '/tr/bilgi-merkezi/x']) {
        const r = calistir(['--kaydet', 'google', 'istek', kotu, '--hareket', defter])
        expect(r.kod, kotu).toBe(2)
        expect(r.hata).toContain('https://')
      }
      expect(existsSync(defter)).toBe(false)
    } finally { rmSync(d, { recursive: true, force: true }) }
  })
  it('bozuk --kart: çıkış 2, defter yok', () => {
    const d = klasor()
    try {
      const defter = join(d, 'hareketler.jsonl')
      const r = calistir(['--kaydet', 'google', 'istek', A, '--kart', 'seo-127', '--hareket', defter])
      expect(r.kod).toBe(2)
      expect(r.hata).toContain('--kart')
      expect(existsSync(defter)).toBe(false)
    } finally { rmSync(d, { recursive: true, force: true }) }
  })
  it('geçerli çağrı: virgüllü iki adres iki satır, neden ve kart her satırda; alansız çağrıda alan yok; defter okunur', () => {
    const d = klasor()
    try {
      const defter = join(d, 'hareketler.jsonl')
      const tarih = '2026-11-20T08:00:00Z'
      const r1 = calistir(['--kaydet', 'google', 'istek', `${A},${B}`, '--neden', 'bilerek tekrar: kota sonrası', '--kart', 'SEO-127', '--tarih', tarih, '--hareket', defter])
      expect(r1.kod).toBe(0)
      expect(r1.cikti).toContain('kaydedildi: 2 hareket')
      const r2 = calistir(['--kaydet', 'bing', 'gonderim', A, '--tarih', tarih, '--hareket', defter])
      expect(r2.kod).toBe(0)
      const satirlar = readFileSync(defter, 'utf8').trim().split('\n').map((s) => JSON.parse(s))
      expect(satirlar).toHaveLength(3)
      expect(satirlar.slice(0, 2).map((s) => s.adres)).toEqual([A, B])
      for (const s of satirlar.slice(0, 2)) expect(s).toMatchObject({ motor: 'google', eylem: 'istek', kaynak: 'kaydet', neden: 'bilerek tekrar: kota sonrası', kart: 'SEO-127' })
      expect('neden' in satirlar[2]).toBe(false)
      expect('kart' in satirlar[2]).toBe(false)
      const ayrisim = defterAyristir(readFileSync(defter, 'utf8'))
      expect(ayrisim.hareketler).toHaveLength(3)
      expect(ayrisim.atlanan).toBe(0)
    } finally { rmSync(d, { recursive: true, force: true }) }
  })
})

// INV-DIZIN-BAG-1 (SEO-132, D7 madde 1): her sonuç satırı (gorunme/olcum) kendinden ÖNCEKİ son isteğe bağlanır; bağ tablosu salt okurdur.
describe('SEO-132: istek → sonuç bağı (INV-DIZIN-BAG-1)', () => {
  const ist = (n: number, adres = A, motor = 'google', eylem = 'istek') => ({ tarih: gun(n), motor, eylem, adres })
  const gor = (n: number, sonuc = 'gorundu', adres = A) => ({ tarih: gun(n), motor: 'google', eylem: 'gorunme', adres, sonuc })

  it('yalnız gorunme ve olcum sonuç satırıdır', () => {
    expect(sonucSatiriMi(gor(5))).toBe(true)
    expect(sonucSatiriMi({ ...ist(5), eylem: 'olcum' })).toBe(true)
    for (const e of ['istek', 'gonderim', 'degisim']) expect(sonucSatiriMi({ ...ist(5), eylem: e }), e).toBe(false)
  })
  it('sonuç, kendinden ÖNCEKİ son isteğe bağlanır; sonraki istek ve başka adres/motor sayılmaz', () => {
    const h = [ist(2), ist(4), ist(9), ist(3, B), ist(5, A, 'bing', 'gonderim'), { ...ist(6), eylem: 'degisim' }]
    expect(istekTarihiBul(h, gor(7))).toBe(gun(4))
    expect(istekTarihiBul(h, gor(1))).toBeNull()
    expect(istekTarihiBul(h, { tarih: gun(7), motor: 'bing', eylem: 'olcum', adres: A })).toBe(gun(5))
    expect(istekTarihiBul(h, ist(7))).toBeNull() // istek satırı sonuç değildir
  })
  it('aynı andaki istek bağlanır (gün 0); 1 ms sonraki istek bağlanmaz', () => {
    expect(istekTarihiBul([ist(5)], gor(5))).toBe(gun(5))
    expect(bagTablosu([ist(5), gor(5)])[0]).toMatchObject({ istekTarihi: gun(5), gun: 0 })
    const birMsSonra = { ...ist(5), tarih: new Date(Date.parse(gun(5)) + 1).toISOString() }
    expect(istekTarihiBul([birMsSonra], gor(5))).toBeNull()
  })
  it('aradaki gün aşağı yuvarlanır (3,5 gün → 3), gorunmeOzeti.gunFarki ile aynı kural', () => {
    const sonuc = { ...gor(5), tarih: '2026-11-05T20:00:00.000Z' }
    expect(bagTablosu([ist(2), sonuc])[0]).toMatchObject({ gun: 3 })
  })
  it('bozuk kayıtlı istekTarihi (satırdan sonra, sayı, metin) yok sayılır, defterden hesaplanır', () => {
    for (const kotu of [gun(9), 12345, 'abc']) {
      const t = bagTablosu([ist(2), { ...gor(5), istekTarihi: kotu }])
      expect(t[0], String(kotu)).toMatchObject({ istekTarihi: gun(2), gun: 3 })
    }
  })
  it('sonHareket oncesi null/NaN verilirse sınır yok sayılır (tüm kayıtları dışlamaz)', () => {
    expect(sonHareket([ist(2), ist(9)], 'google', A, null as unknown as number)).toBe(Date.parse(gun(9)))
    expect(sonHareket([ist(2), ist(9)], 'google', A, Number.NaN)).toBe(Date.parse(gun(9)))
  })
  it('bağ tablosu gün farkını verir; istek yoksa null; kayıtlı istekTarihi hesaptan önce gelir', () => {
    const h = [ist(2), gor(5), gor(3, 'gorunmuyor', B), { ...gor(8), istekTarihi: gun(1) }]
    const t = bagTablosu(h)
    expect(t).toHaveLength(3)
    expect(t[0]).toMatchObject({ adres: B, istekTarihi: null, gun: null })
    expect(t[1]).toMatchObject({ adres: A, tarih: gun(5), istekTarihi: gun(2), gun: 3, sonuc: 'gorundu' })
    expect(t[2]).toMatchObject({ tarih: gun(8), istekTarihi: gun(1), gun: 7 })
  })
  it('istekTarihi satıra yazılır, yoksa alan hiç yoktur; görünme özeti alandan etkilenmez', () => {
    expect(JSON.parse(satirYaz({ ...gor(5), istekTarihi: gun(2) }))).toMatchObject({ istekTarihi: gun(2) })
    expect('istekTarihi' in JSON.parse(satirYaz(gor(5)))).toBe(false)
    expect(gorunmeOzeti([{ ...gor(5), istekTarihi: gun(2) }], A)).toEqual(gorunmeOzeti([gor(5)], A))
    expect(sonHareket([ist(2), ist(9)], 'google', A)).toBe(Date.parse(gun(9))) // eski çağrı biçimi değişmedi
  })
  it('CLI: --kaydet gorunme istek tarihini defterden alır; --bag defteri DEĞİŞTİRMEZ', () => {
    const betik = resolve(__dirname, '..', 'dizin-takip.mjs')
    const d = mkdtempSync(join(tmpdir(), 'dizin-bag-'))
    const kos = (args: string[]) => execFileSync(process.execPath, [betik, ...args, '--hareket', join(d, 'h.jsonl')], { encoding: 'utf8', stdio: 'pipe', env: { ...process.env, DIZIN_TAKIP_YEDEK2: '' } })
    try {
      kos(['--kaydet', 'google', 'istek', A, '--tarih', gun(2)])
      kos(['--kaydet', 'google', 'gorunme', `${A},${B}`, '--sonuc', 'gorundu', '--tarih', gun(6)])
      const satirlar = readFileSync(join(d, 'h.jsonl'), 'utf8').trim().split('\n').map((s) => JSON.parse(s))
      expect(satirlar[1]).toMatchObject({ adres: A, eylem: 'gorunme', istekTarihi: gun(2) })
      expect('istekTarihi' in satirlar[2]).toBe(false)
      kos(['--kaydet', 'yandex', 'olcum', A, '--sonuc', 'aramada\tek', '--tarih', gun(7)])
      const agac = () => readdirSync(d, { recursive: true }).map(String).sort().map((y) => `${y}:${statSync(join(d, y)).isFile() ? `${statSync(join(d, y)).mtimeMs}:${readFileSync(join(d, y), 'utf8')}` : '<klasor>'}`)
      const once = agac()
      const cikti = kos(['--bag'])
      expect(agac()).toEqual(once) // salt okur: defter, yedek klasörü ve yeni dosya yok
      expect(cikti).toContain(`${gun(2)}\t4\t${A}`)
      expect(cikti).toContain(`ISTEK YOK\t-\t${B}`)
      const satirlarBag = cikti.trim().split('\n')
      expect(satirlarBag[0]).toBe('tarih\tmotor\teylem\tsonuc\tistekTarihi\tgun\tadres')
      for (const s of satirlarBag) expect(s.split('\t'), s).toHaveLength(7) // hücredeki sekme kolon kaydırmaz
    } finally { rmSync(d, { recursive: true, force: true }) }
  })
})
