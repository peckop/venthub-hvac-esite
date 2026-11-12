/**
 * INV-DIZIN-DEFTER-1 · Dizin defterinin tutarlılık kontrolü (Kanban SEO-101, OPS-258; cetvel departman-defter-standard D2.4).
 *
 * Kilitlenenler: özet yalnız sayı/tarih/sha256 taşır (ham adres yok); defter özeti anlık görüntüyle birebirse 0; sayı
 * sapınca ya da daha yeni anlık görüntü varken 1; arşiv/anlık görüntü/ÖZET bloğu yokken 2 ("ölçülemedi" tutarlı sayılmaz);
 * bozuk dosya atlanır; CLI çıkış kodları.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { enSonDosya, ozetUret, defterOzeti, karsilastir, BASLA, BITIS } from '../dizin-defter-kontrol.mjs'

const BETIK = resolve(__dirname, '..', 'dizin-defter-kontrol.mjs')
const gecici: string[] = []
const dizin = () => { const d = mkdtempSync(join(tmpdir(), 'dizin-defter-')); gecici.push(d); return d }
afterEach(() => { while (gecici.length) rmSync(gecici.pop() as string, { recursive: true, force: true }) })

const S = 'https://venthub.com.tr'
const satir = (yol: string, g: string, b: string, neden = '') => ({
  adres: `${S}${yol}`, lastmod: null,
  google: { durum: g, neden: '' }, bing: { durum: b, neden }, yandex: { durum: 'ESKI', neden: '' }, indexnow: { durum: 'TAMAM', neden: '' },
})
const anlik = (tablo: unknown[], gun = '2026-11-09') => JSON.stringify({ alinma: `${gun}T08:00:00Z`, tablo })
const yazAnlik = (klasor: string, gun: string, tablo: unknown[]) => writeFileSync(join(klasor, `dizin-takip-${gun}.json`), anlik(tablo, gun))
const TABLO = [
  satir('/tr/bilgi-merkezi/a', 'YAP', 'TAMAM'),
  satir('/tr/products/b', 'TAMAM', 'OLCULEMEDI', 'durum okunamadı: ERROR!!! ThrottleHost; istek atmadan önce yeniden ölç'),
  satir('/tr/category/c', 'TAMAM', 'TAMAM'),
]
const defterMetni = (ozet: unknown) => `# Defter\n\n${BASLA}\n\`\`\`json\n${JSON.stringify(ozet, null, 2)}\n\`\`\`\n${BITIS}\n`
const sonOf = (klasor: string) => enSonDosya(klasor) as NonNullable<ReturnType<typeof enSonDosya>>

describe('özet üretimi', () => {
  it('yalnız sayı, tarih, sha256 ve küme taşır; ham adres sızmaz; ölçülemeyen sebep kısaltılır', () => {
    const k = dizin(); yazAnlik(k, '2026-11-09', TABLO)
    const o = ozetUret(sonOf(k))
    expect(o.adresSayisi).toBe(3)
    expect(o.kapsam).toEqual({ category: 1, 'bilgi-merkezi': 1, products: 1 })
    expect(o.kararlar.google.YAP).toBe(1)
    expect(o.kararlar.google.TAMAM).toBe(2)
    expect(o.kararlar.bing.OLCULEMEDI).toBe(1)
    expect(o.olculemeyen).toEqual({ 'bing: ThrottleHost': 1 })
    expect(o.sha256).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(o)).not.toContain('venthub.com.tr')
  })
  it('en son anlık görüntü seçilir, bozuk dosya atlanır, boş klasör null', () => {
    const k = dizin()
    expect(enSonDosya(k)).toBeNull()
    yazAnlik(k, '2026-11-08', TABLO)
    writeFileSync(join(k, 'dizin-takip-2026-11-09.json'), '{bozuk')
    expect(enSonDosya(k)?.ad).toBe('dizin-takip-2026-11-08.json')
  })
})

describe('karşılaştırma', () => {
  it('defter özeti anlık görüntüyle birebirse 0', () => {
    const k = dizin(); yazAnlik(k, '2026-11-09', TABLO)
    const son = sonOf(k)
    expect(karsilastir(defterMetni(ozetUret(son)), son).kod).toBe(0)
  })
  it('sayı uyuşmazsa 1 ve sapan alan adı mesajda', () => {
    const k = dizin(); yazAnlik(k, '2026-11-09', TABLO)
    const son = sonOf(k)
    const ozet = ozetUret(son); ozet.kararlar.google.YAP = 5
    const r = karsilastir(defterMetni(ozet), son)
    expect(r.kod).toBe(1)
    expect(r.mesaj).toContain('kararlar')
  })
  it('arşivde daha yeni anlık görüntü varsa 1 ve "daha yeni" der', () => {
    const k = dizin(); yazAnlik(k, '2026-11-08', TABLO)
    const eskiOzet = ozetUret(sonOf(k))
    yazAnlik(k, '2026-11-09', TABLO)
    const r = karsilastir(defterMetni(eskiOzet), sonOf(k))
    expect(r.kod).toBe(1)
    expect(r.mesaj).toContain('daha yeni')
  })
  it('arşiv yok, ÖZET bloğu yok ya da JSON bozuksa 2 (ölçülemedi tutarlı sayılmaz)', () => {
    const k = dizin(); yazAnlik(k, '2026-11-09', TABLO)
    const son = sonOf(k)
    expect(karsilastir(defterMetni(ozetUret(son)), null).kod).toBe(2)
    expect(karsilastir('# Defter, özet yok', son).kod).toBe(2)
    expect(karsilastir(`${BASLA}\n\`\`\`json\n{bozuk\n\`\`\`\n${BITIS}`, son).kod).toBe(2)
    expect(karsilastir(null, son).kod).toBe(2)
    expect(defterOzeti('yok')).toBeNull()
  })
})

describe('CLI', () => {
  it('tutarlıysa 0, sapınca 1, arşiv boşken 2; --ozet geçerli JSON basar', () => {
    const k = dizin(); const d = dizin()
    const defter = join(d, 'defter.md')
    const kos = (...a: string[]) => spawnSync(process.execPath, [BETIK, ...a], { encoding: 'utf8', env: { ...process.env, VENTHUB_DIZIN_ARSIV: k, VENTHUB_DIZIN_DEFTER: defter } })
    writeFileSync(defter, defterMetni({}))
    expect(kos().status).toBe(2)
    yazAnlik(k, '2026-11-09', TABLO)
    const ozet = kos('--ozet')
    expect(ozet.status).toBe(0)
    writeFileSync(defter, defterMetni(JSON.parse(ozet.stdout)))
    expect(kos().status).toBe(0)
    writeFileSync(defter, defterMetni({ ...JSON.parse(ozet.stdout), adresSayisi: 99 }))
    expect(kos().status).toBe(1)
  })
})
