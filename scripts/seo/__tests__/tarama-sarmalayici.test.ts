/**
 * INV-SEO-TARAMA-1 · linkinator ve unlighthouse sarmalayıcılarının ağsız parçaları
 * (cetvel docs/standards/yayin-gorunurluk-denetim-standard.md; plan rec-adres-agac-tek-yayin §7).
 *
 * Kilitlenenler: linkinator CSV'si ayrıştırılır (failureDetails virgül içerebilir), biçim değişirse null
 * (sessiz sıfır yerine "okunamadı"); kırık tekil sayılır, 429 kırık DEĞİL ayrı sayılır; yönlendirme uyarısı
 * ayrı. Unlighthouse raporundan ortalama, SEO < 1 sayfalar; kıyasta SEO ortalaması düşerse işaret.
 * npx kabuksuz çağrılır (Windows cmd `--skip` desenindeki `|` ve `^` karakterlerini bozar).
 */
import { describe, it, expect } from 'vitest'
import { csvAyristir, ozetle as linkOzet, npxYolu } from '../link-tara.mjs'
import { ozetle as kaliteOzet, kiyasla, sayfaRaporlariniTopla } from '../sayfa-kalite.mjs'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CSV = [
  'url,status,state,parent,failureDetails',
  'https://s.test/tr,200,OK,,[]',
  'https://s.test/images/og.jpg,404,BROKEN,https://s.test/tr/category/a,[]',
  'https://s.test/images/og.jpg,404,BROKEN,https://s.test/tr/category/b,[]',
  'https://depo.test/x.webp,429,BROKEN,https://s.test/tr/products/a,[]',
  'https://s.test/tr/products,200,OK,https://s.test/tr,[{"status":308,"message":"redirect, followed"}]',
].join('\n')

describe('INV-SEO-TARAMA-1 · linkinator', () => {
  it('CSV ayrıştırılır; failureDetails içindeki virgül bölünmez', () => {
    const s = csvAyristir(CSV)!
    expect(s).toHaveLength(5)
    expect(s[4].failureDetails).toBe('[{"status":308,"message":"redirect, followed"}]')
  })
  it('biçim değişirse null (sessiz sıfır değil)', () => {
    expect(csvAyristir('')).toBeNull()
    expect(csvAyristir('{"links":[]}')).toBeNull()
  })
  it('kırık tekil sayılır, 429 kırık değil, yönlendirme ayrı', () => {
    const o = linkOzet(csvAyristir(CSV)!)
    expect(o.kirik).toEqual([{ url: 'https://s.test/images/og.jpg', status: 404, ornekSayfa: 'https://s.test/tr/category/a', yer: 2 }])
    expect(o.hizSiniri).toBe(1)
    expect(o.yonlendirme.map((y: { url: string }) => y.url)).toEqual(['https://s.test/tr/products'])
    expect(o.kokSayfa).toBe(1)
  })
  it('npx-cli.js bu makinede bulunur (kabuksuz çağrı yolu)', () => {
    expect(npxYolu()).toMatch(/npx-cli\.js$/)
    expect(npxYolu('/yok/yol/node')).toBeNull()
  })
})

const rapor = (sayfalar: [string, number, number][]) => ({
  routes: sayfalar.map(([path, seo, perf]) => ({ path, categories: { seo: { score: seo }, performance: { score: perf }, accessibility: { score: 0.95 }, 'best-practices': { score: 0.96 } } })),
})

describe('INV-SEO-TARAMA-1 · unlighthouse', () => {
  it('ortalama ve SEO < 1 sayfalar', () => {
    const o = kaliteOzet(rapor([['/tr', 1, 0.6], ['/tr/a', 0.92, 0.7]]))
    expect(o.sayfa).toBe(2)
    expect(o.ortalama.seo).toBe(0.96)
    expect(o.seoEksik.map((s: { yol: string }) => s.yol)).toEqual(['/tr/a'])
  })
  it('⭐toplu rapor yoksa sayfa raporlarından okunur; bozuk rapor atlanır (09-24 vakası: 59/87 sayfada durdu)', () => {
    const d = mkdtempSync(join(tmpdir(), 'unlh-'))
    mkdirSync(join(d, 'a'), { recursive: true }); mkdirSync(join(d, 'b', 'c'), { recursive: true }); mkdirSync(join(d, 'bozuk'))
    writeFileSync(join(d, 'a', 'lighthouse.json'), JSON.stringify({ finalDisplayedUrl: 'https://s.test/tr', categories: { seo: { score: 1 } } }))
    writeFileSync(join(d, 'b', 'c', 'lighthouse.json'), JSON.stringify({ finalUrl: 'https://s.test/tr/a', categories: { seo: { score: 0.9 } } }))
    writeFileSync(join(d, 'bozuk', 'lighthouse.json'), '{yarım')
    const r = sayfaRaporlariniTopla(d)
    expect(r.routes.map((x: { path: string }) => x.path).sort()).toEqual(['/tr', '/tr/a'])
    expect(kaliteOzet(r).seoEksik.map((s: { yol: string }) => s.yol)).toEqual(['/tr/a'])
    expect(sayfaRaporlariniTopla(join(d, 'yok')).routes).toEqual([])
  })
  it('boş rapor sessiz sıfır vermez: ortalama null', () => {
    expect(kaliteOzet({ routes: [] }).ortalama.seo).toBeNull()
  })
  it('⭐kıyas: SEO ortalaması düşerse işaretlenir; aynı yolda düşen sayfa listelenir', () => {
    const once = kaliteOzet(rapor([['/tr', 1, 0.6], ['/tr/a', 1, 0.7]]))
    const sonra = kaliteOzet(rapor([['/tr', 0.92, 0.9], ['/tr/yeni', 1, 0.7]]))
    const k = kiyasla(once, sonra)
    expect(k.seoDustu).toBe(true)
    expect(k.seoDusen).toEqual([{ yol: '/tr', once: 1, sonra: 0.92 }])
    expect(kiyasla(once, once).seoDustu).toBe(false)
  })
})
