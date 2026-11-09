/**
 * INV-DIZIN-TAKIP-1 · Dizin takip betiğinin ağsız çekirdeği (Kanban SEO dizin-takip kartı; cetvel
 * docs/standards/dizin-sistemleri-standard.md D7).
 *
 * Kilitlenenler: lastmod sonrası tarama TAMAM; lastmod sonrası istek eşik dolana kadar BEKLE, dolunca TEKRAR; hiç istek yoksa
 * YAP; noindex ATLA (kota boşa gitmez); ölçülemeyen durum YAP DEĞİL OLCULEMEDI; Bing "0001-01-01" yokluk değeri tarama
 * sayılmaz; IndexNow ve Yandex'in kendi kuralları; defterde bozuk satır sessizce yutulmaz (sayılır); içe aktarım iki kez
 * koşulursa çiftlemez; site haritası ve kapsam seçimi. Veri sahtedir (P6: gerçek arama verisi yok).
 */
import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import {
  BING_ARALIK_MS, KAYIT_BASLANGICI, TEKRAR_ESIGI_GUN, defterAyristir, eskiKayitlariCoz, haritaCoz, hareketGecerliMi, kapsamSec, karar, markdownYaz,
  satirYaz, sonHareket, yedekAl, tabloUret, tarihAl, yandexSonTarama, yeniOlanlar, yalnizTarihMi,
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
  it('istek lastmod sonrası, Google eşiği (7 gün) doldu → TEKRAR', () => {
    const k = karar({ motor: 'google', lastmod: gun(1), sonTarama: null, sonHareket: ms(gun(2)), simdi: NOW + 0 })
    expect(TEKRAR_ESIGI_GUN.google).toBe(7)
    expect(k.durum).toBe('TEKRAR')
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
