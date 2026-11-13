/**
 * INV-DIZIN-ACILIS-1 · Dizin açılış satırının ağsız doğrulaması (Kanban SEO-98, OPS-256; kalıp ARC-280).
 *
 * Kilitlenenler: satır yalnız Google/Bing/IndexNow'un YAP+TEKRAR sayısını verir (Yandex sayılmaz); bayat anlık
 * görüntü BAYAT diye işaretlenir; bugünün anlık görüntüsü varken arka plan ölçümü BAŞLAMAZ; anlık görüntü yoksa ya da
 * eskiyse bir kez başlar, taze kilit varken ikinci kez başlamaz; vana sessizdir; bozuk arşiv fırlatmaz; CLI çıkış 0.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, utimesSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { kuyrukSatiri, trGun, enSonAnlik, sayilar, satirUret, calistir, kilitTaze, KILIT_OMRU_MS, yayinTarihleri, gorunmeVadesi, hareketOku, vadeOku } from '../dizin-acilis.mjs'

const BETIK = resolve(__dirname, '..', 'dizin-acilis.mjs')
const gecici: string[] = []
const dizin = () => { const d = mkdtempSync(join(tmpdir(), 'dizin-acilis-')); gecici.push(d); return d }
afterEach(() => { while (gecici.length) rmSync(gecici.pop() as string, { recursive: true, force: true }) })

const satir = (g: string, b: string, i: string, y = 'YAP') => ({
  adres: 'https://x/', google: { durum: g }, bing: { durum: b }, yandex: { durum: y }, indexnow: { durum: i },
})
const yaz = (klasor: string, gun: string, tablo: unknown[]) =>
  writeFileSync(join(klasor, `dizin-takip-${gun}.json`), JSON.stringify({ alinma: `${gun}T08:00:00Z`, tablo }))
const SIMDI = Date.parse('2026-11-09T07:00:00Z')

describe('saf parçalar', () => {
  it('YAP ve TEKRAR sayılır; Yandex ve diğer kararlar sayılmaz', () => {
    const s = sayilar([satir('YAP', 'TAMAM', 'TEKRAR'), satir('TEKRAR', 'BEKLE', 'ESKI'), satir('TAMAM', 'OLCULEMEDI', 'YAP')])
    expect(s).toEqual({ google: 2, bing: 0, indexnow: 2 })
  })
  it('satır: sayılar, bekleyen yoksa ayrı metin, bayat işareti, anlık görüntü yok', () => {
    const bugun = '2026-11-09'
    const a = { gun: bugun, alinma: null, tablo: [satir('YAP', 'YAP', 'TAMAM')] }
    expect(satirUret(a, bugun)).toContain('Google 1, Bing 1, IndexNow 0')
    expect(satirUret(a, bugun)).not.toContain('BAYAT')
    expect(satirUret({ ...a, tablo: [satir('TAMAM', 'TAMAM', 'TAMAM')] }, bugun)).toContain('bekleyen istek yok')
    expect(satirUret({ ...a, gun: '2026-11-08' }, bugun)).toContain('BAYAT (2026-11-08)')
    expect(satirUret(null, bugun)).toContain('anlık görüntü yok')
  })
  it('en son anlık görüntü gün adına göre seçilir; bozuk/boş klasör null', () => {
    const k = dizin()
    expect(enSonAnlik(k)).toBeNull()
    yaz(k, '2026-11-07', []); yaz(k, '2026-11-08', [satir('YAP', 'TAMAM', 'TAMAM')])
    writeFileSync(join(k, 'dizin-takip-2026-11-09.json'), '{bozuk')
    expect(enSonAnlik(k)?.gun).toBe('2026-11-08')
  })
})

describe('Türkiye günü', () => {
  it('UTC gece yarısından önceki an TR ertesi günü yazar; anlık görüntü günü alinma saatinden gelir', () => {
    expect(trGun(Date.parse('2026-11-08T21:30:00Z'))).toBe('2026-11-09')
    expect(trGun(Date.parse('2026-11-08T20:59:00Z'))).toBe('2026-11-08')
    const k = dizin()
    writeFileSync(join(k, 'dizin-takip-2026-11-08.json'), JSON.stringify({ alinma: '2026-11-08T22:10:00Z', tablo: [] }))
    expect(enSonAnlik(k)?.gun).toBe('2026-11-09')
  })
})

describe('çekirdek', () => {
  it('bugünün anlık görüntüsü varsa arka plan başlamaz', () => {
    const k = dizin(); yaz(k, '2026-11-09', [satir('YAP', 'TAMAM', 'TAMAM')])
    let n = 0
    const s = calistir({ klasor: k, simdi: SIMDI, env: {}, baslatici: () => { n++ } })
    expect(n).toBe(0)
    expect(s).toContain('Google 1')
  })
  it('anlık görüntü eskiyse bir kez başlar; taze kilit varken ikinci kez başlamaz', () => {
    const k = dizin(); yaz(k, '2020-01-01', [satir('YAP', 'TAMAM', 'TAMAM')])
    let n = 0
    const baslatici = (klasor: string) => { n++; writeFileSync(join(klasor, '.durum-kilit'), 'x') }
    const s1 = calistir({ klasor: k, simdi: Date.now(), env: {}, baslatici })
    expect(n).toBe(1)
    expect(s1).toContain('BAYAT')
    calistir({ klasor: k, simdi: Date.now(), env: {}, baslatici })
    expect(n).toBe(1)
  })
  it('kilit süresi dolunca yeniden başlar', () => {
    const k = dizin(); yaz(k, '2020-01-01', [])
    const kilit = join(k, '.durum-kilit'); writeFileSync(kilit, 'x')
    const eski = new Date(Date.now() - KILIT_OMRU_MS - 60_000)
    utimesSync(kilit, eski, eski)
    expect(kilitTaze(k, Date.now())).toBe(false)
    let n = 0
    calistir({ klasor: k, simdi: Date.now(), env: {}, baslatici: () => { n++ } })
    expect(n).toBe(1)
  })
  it('anlık görüntü hiç yoksa başlatır ve "yok" satırı verir; başlatıcı patlarsa fırlatmaz', () => {
    const k = join(dizin(), 'yok-klasor'); mkdirSync(k)
    const s = calistir({ klasor: k, simdi: SIMDI, env: {}, baslatici: () => { throw new Error('patladı') } })
    expect(s).toContain('anlık görüntü yok')
  })
  it('vana sessizdir, --sadece-satir modu başlatmaz', () => {
    const k = dizin(); let n = 0
    expect(calistir({ klasor: k, simdi: SIMDI, env: { VENTHUB_DIZIN_ACILIS_KAPAT: '1' }, baslatici: () => { n++ } })).toBe('')
    calistir({ klasor: k, simdi: SIMDI, env: {}, baslat: false, baslatici: () => { n++ } })
    expect(n).toBe(0)
  })
})

describe('kuyruk satırı (SEO-103)', () => {
  it('bekleyen sayıyı verir, bayat günü işaretler, boşken "boş" der, anlık görüntü yokken ölçülemedi der', () => {
    const k = dizin(); yaz(k, '2026-11-09', [satir('YAP', 'TAMAM', 'TAMAM'), satir('TEKRAR', 'TAMAM', 'TAMAM'), satir('TAMAM', 'YAP', 'TAMAM')])
    expect(kuyrukSatiri({ klasor: k, simdi: Date.parse('2026-11-09T07:00:00Z') })).toBe('Google dizin kuyruğunda 2 adres bekliyor, ölçüm 09.11')
    expect(kuyrukSatiri({ klasor: k, simdi: Date.parse('2026-11-10T07:00:00Z') })).toContain('BAYAT')
    const bos = dizin(); yaz(bos, '2026-11-09', [satir('TAMAM', 'YAP', 'TAMAM')])
    expect(kuyrukSatiri({ klasor: bos, simdi: Date.parse('2026-11-09T07:00:00Z') })).toContain('kuyruğu boş')
    expect(kuyrukSatiri({ klasor: dizin() })).toContain('ölçülemedi')
  })
  it('CLI --kuyruk tek satır basar, çıkış 0, ham adres basmaz', () => {
    const k = dizin(); yaz(k, '2026-11-09', [satir('YAP', 'TAMAM', 'TAMAM')])
    const r = spawnSync(process.execPath, [BETIK, '--kuyruk'], { encoding: 'utf8', env: { ...process.env, VENTHUB_DIZIN_ARSIV: k } })
    expect(r.status).toBe(0)
    expect(r.stdout.trim().split('\n')).toHaveLength(1)
    expect(r.stdout).toContain('Google dizin kuyruğunda 1 adres bekliyor')
    expect(r.stdout).not.toContain('https://')
  })
})

describe('CLI', () => {
  it('arşiv bozuk/boş olsa da çıkış 0, vana ile çıktı boş', () => {
    const k = dizin()
    const r = spawnSync(process.execPath, [BETIK, '--sadece-satir'], { encoding: 'utf8', env: { ...process.env, VENTHUB_DIZIN_ARSIV: k } })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('anlık görüntü yok')
    const v = spawnSync(process.execPath, [BETIK], { encoding: 'utf8', env: { ...process.env, VENTHUB_DIZIN_ARSIV: k, VENTHUB_DIZIN_ACILIS_KAPAT: '1' } })
    expect(v.status).toBe(0)
    expect(v.stdout).toBe('')
  })
})

describe('görünme vadesi (SEO-114, SEO-113 önerisi B)', () => {
  const yazilar = [
    { slug: 'a-yazi', yayin: '2026-11-01' },
    { slug: 'b-yazi', yayin: '2026-11-08' },
    { slug: 'eski-yazi', yayin: '2026-09-25' },
    { slug: 'yeni-yazi', yayin: '2026-11-12' },
  ]
  const gor = (adres: string, tarih: string, eylem = 'gorunme', motor = 'google') => ({ tarih, motor, eylem, adres: `https://venthub.com.tr/tr/bilgi-merkezi/${adres}`, sonuc: 'gorunmuyor' })

  it('yayinTarihleri: her yayinTarihi için sonraki ilk slug yazının kendisidir', () => {
    const metin = `{ kimlik: 'x', yayinTarihi: '2026-10-11', ilgili: ['vh:yazi/baska'], diller: { tr: { slug: 'radyal-yazi' } } },\n{ yayinTarihi: '2026-11-01', diller: { tr: { slug: 'hava-yazi' } } }`
    expect(yayinTarihleri(metin)).toEqual([{ slug: 'radyal-yazi', yayin: '2026-10-11' }, { slug: 'hava-yazi', yayin: '2026-11-01' }])
  })

  it('vadesi gelen ve gorunme kaydı olmayan yazı sayılır; kırılım en son vadeye göre', () => {
    const v = gorunmeVadesi({ yazilar, hareketler: [], bugun: '2026-11-12' })
    // a-yazi 11-01: 14. gün 11-15 gelmedi, 7. gün (11-08) geçti → 7. gün; b-yazi 11-08: 3. gün (11-11) → 3. gün; eski-yazi 21 günü aştı; yeni-yazi 0. gün
    expect(v.toplam).toBe(2)
    expect(v.kirilim).toEqual({ 3: 1, 7: 1, 14: 0 })
    expect(v.adlar.sort()).toEqual(['a-yazi', 'b-yazi'])
  })

  it('vade gününden sonraki gorunme kaydı yazıyı düşürür; önceki kayıt düşürmez', () => {
    const onceki = gor('a-yazi', '2026-11-05T08:00:00Z') // 7. gün eşiği 11-08'den ÖNCE
    const sonraki = gor('b-yazi', '2026-11-12T08:00:00Z')
    const v = gorunmeVadesi({ yazilar, hareketler: [onceki, sonraki], bugun: '2026-11-12' })
    expect(v.adlar).toEqual(['a-yazi'])
  })

  it('yalnız Google gorunme eylemi sayılır: istek, olcum, Bing ya da başka adres saymaz', () => {
    const sayilmaz = [gor('a-yazi', '2026-11-12T08:00:00Z', 'istek'), gor('a-yazi', '2026-11-12T08:00:00Z', 'olcum'), gor('a-yazi', '2026-11-12T08:00:00Z', 'gorunme', 'bing'), gor('baska', '2026-11-12T08:00:00Z')]
    expect(gorunmeVadesi({ yazilar, hareketler: sayilmaz, bugun: '2026-11-12' }).adlar.sort()).toEqual(['a-yazi', 'b-yazi'])
  })

  it('satır: vade parçası eklenir; vade yoksa ya da null ise satır eskisi gibi kalır', () => {
    const anlik = { gun: '2026-11-12', alinma: null, tablo: [satir('YAP', 'TAMAM', 'TAMAM')] }
    const eski = satirUret(anlik, '2026-11-12')
    expect(satirUret(anlik, '2026-11-12', null)).toBe(eski)
    expect(satirUret(anlik, '2026-11-12', { toplam: 0, kirilim: { 3: 0, 7: 0, 14: 0 }, adlar: [] })).toBe(`${eski} | görünme vadesi: yok`)
    expect(satirUret(anlik, '2026-11-12', { toplam: 2, kirilim: { 3: 1, 7: 1, 14: 0 }, adlar: ['a', 'b'] })).toBe(`${eski} | GÖRÜNME VADESİ: 2 yazı canlı aramayla ölçülmedi (3. gün 1, 7. gün 1)`)
  })

  it('hareketOku bozuk satırı atlar, dosya yoksa []; vadeOku kaynak yoksa null (fail-open)', () => {
    const d = dizin()
    expect(hareketOku(d)).toEqual([])
    writeFileSync(join(d, 'hareketler.jsonl'), `{"motor":"google"}\nBOZUK\n{"eylem":"gorunme"}\n`)
    expect(hareketOku(d)).toHaveLength(2)
    expect(vadeOku({ klasor: d, bugun: '2026-11-12', yazilarYolu: join(d, 'yok.ts') })).toBeNull()
  })

  it('gerçek yazı kaydı okunur ve en az bir yayın tarihi çıkar (kayıt biçimi bozulursa kırmızı)', () => {
    const v = vadeOku({ klasor: dizin(), bugun: '2026-11-12' })
    expect(v).not.toBeNull()
    expect(v?.kirilim).toBeDefined()
  })
})
