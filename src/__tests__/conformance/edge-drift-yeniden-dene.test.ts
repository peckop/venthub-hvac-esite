/**
 * INV-EDGE-DRIFT-RETRY-1 — sapma dedektörünün kaynak indirmesi GEÇİCİ hatada tüm koşumu düşürmez,
 * ama hatayı ÖRTMEZ (REC-355 alt işi · 2026-09-30).
 *
 * Ölçülen: `supabase functions download` ağ hatasıyla ara sıra düşüyor (bir koşumda 3/29, sonrakinde
 * 2/29, sonra 1/29). Tek slug inmezse dedektör exit 2 verir; deploy yeşilken iş kırmızı görünürdü.
 *
 * Kilitlenen dört şey:
 *  1. İlk denemede başarıda bekleme ya da fazladan çağrı yok.
 *  2. Geçici hata sonra başarı: yeniden dener, bekleme doğrusal artar, her deneme `haber` ile görünür.
 *  3. SINIRLI: hep hata → son hata deneme sayısıyla döner (sonsuz döngü ve sessiz yutma yok).
 *  4. Kaynakta: yalnız CLI çağrısı sarılır; "hata vermedi ama dosya çıkarmadı" dalı yeniden DENENMEZ
 *     (o yapısal bozulmadır, geçici değil).
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const MODUL = path.join(KOK, 'scripts', 'edge', 'yeniden-dene.mjs')
const DRIFT = path.join(KOK, 'scripts', 'edge', 'drift-check.mjs')

type Sonuc = { error?: string; [k: string]: unknown }
type Ayar = {
  deneme?: number
  beklemeMs?: number
  uyku?: (ms: number) => Promise<void>
  haber?: (deneme: number, hata: string) => void
}
type Yardimci = (islem: (n: number) => Promise<Sonuc>, ayar?: Ayar) => Promise<Sonuc & { denemeSayisi: number }>

async function yukle(): Promise<Yardimci> {
  const mod = (await import(pathToFileURL(MODUL).href)) as { yenidenDene: Yardimci }
  return mod.yenidenDene
}

function kayitliUyku() {
  const beklemeler: number[] = []
  return { beklemeler, uyku: (ms: number) => (beklemeler.push(ms), Promise.resolve()) }
}

describe('yenidenDene — davranış', () => {
  it('ilk denemede başarı: tek çağrı, bekleme yok', async () => {
    const yenidenDene = await yukle()
    const { beklemeler, uyku } = kayitliUyku()
    let cagri = 0
    const s = await yenidenDene(async () => (cagri++, {}), { uyku })
    expect(s.error).toBeUndefined()
    expect(s.denemeSayisi).toBe(1)
    expect(cagri).toBe(1)
    expect(beklemeler).toEqual([])
  })

  it('iki geçici hata sonra başarı: 3. denemede iner, bekleme 2 sn → 4 sn, her hata haber verilir', async () => {
    const yenidenDene = await yukle()
    const { beklemeler, uyku } = kayitliUyku()
    const haberler: Array<[number, string]> = []
    const s = await yenidenDene(async (n) => (n < 3 ? { error: `ag-hatasi-${n}` } : {}), {
      uyku,
      haber: (n, h) => haberler.push([n, h]),
    })
    expect(s.error).toBeUndefined()
    expect(s.denemeSayisi).toBe(3)
    expect(beklemeler).toEqual([2000, 4000])
    expect(haberler).toEqual([
      [1, 'ag-hatasi-1'],
      [2, 'ag-hatasi-2'],
    ])
  })

  it('SINIRLI: hep hata → tam 3 çağrı, SON hata ve deneme sayısı döner (sessiz yutma yok)', async () => {
    const yenidenDene = await yukle()
    const { beklemeler, uyku } = kayitliUyku()
    let cagri = 0
    const s = await yenidenDene(async (n) => (cagri++, { error: `kalici-${n}` }), { uyku })
    expect(cagri).toBe(3)
    expect(s.error).toBe('kalici-3')
    expect(s.denemeSayisi).toBe(3)
    // Son denemeden sonra BEKLENMEZ (boşuna uzatmaz).
    expect(beklemeler).toEqual([2000, 4000])
  })

  it('deneme=1 ise yeniden deneme yok', async () => {
    const yenidenDene = await yukle()
    const { beklemeler, uyku } = kayitliUyku()
    let cagri = 0
    const s = await yenidenDene(async () => (cagri++, { error: 'x' }), { deneme: 1, uyku })
    expect(cagri).toBe(1)
    expect(s.error).toBe('x')
    expect(beklemeler).toEqual([])
  })

  it('geçersiz deneme sayısı (0, negatif) en az 1 denemeye yükselir: işlem ASLA hiç çağrılmamış kalmaz', async () => {
    const yenidenDene = await yukle()
    const { uyku } = kayitliUyku()
    let cagri = 0
    await yenidenDene(async () => (cagri++, {}), { deneme: 0, uyku })
    await yenidenDene(async () => (cagri++, {}), { deneme: -5, uyku })
    expect(cagri).toBe(2)
  })
})

describe('drift-check.mjs — yeniden deneme doğru yere bağlı', () => {
  const kaynak = fs.readFileSync(DRIFT, 'utf8').replace(/\r\n/g, '\n')

  it('indirme adımı yenidenDene ile sarılı ve yardımcı içe aktarılıyor', () => {
    expect(kaynak.includes("from './yeniden-dene.mjs'")).toBe(true)
    expect(kaynak.includes('await yenidenDene(')).toBe(true)
  })

  it('"HİÇ DOSYA çıkarmadı" dalı yeniden deneme sarmalının DIŞINDA (yapısal bozulma geçici sayılmaz)', () => {
    const sarmalSonu = kaynak.indexOf('if (indirme.error)')
    const hicDosya = kaynak.indexOf('HİÇ DOSYA')
    expect(sarmalSonu, 'indirme sonucu kontrolü yok').toBeGreaterThan(-1)
    expect(hicDosya, 'dosya-çıkmadı dalı yok').toBeGreaterThan(sarmalSonu)
  })

  it('başarısız indirme kısmi sonuçla "sapma yok" DEMEZ: fatal yolu duruyor', () => {
    expect(kaynak.includes('Prod kaynağı indirilemedi')).toBe(true)
    expect(kaynak.includes('Sapma raporu ÜRETİLEMEDİ') || kaynak.includes('Kaynak karşılaştırması YAPILAMADI')).toBe(true)
  })
})
