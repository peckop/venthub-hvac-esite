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
import { enSonAnlik, sayilar, satirUret, calistir, kilitTaze, KILIT_OMRU_MS } from '../dizin-acilis.mjs'

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
