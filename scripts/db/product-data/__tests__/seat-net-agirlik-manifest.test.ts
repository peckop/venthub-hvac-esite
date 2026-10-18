/**
 * seat-net-agirlik-manifest.json — depodaki manifest iç tutarlılığı ve kaynak hükümleri (KTL-55, karar 384).
 * Kurallar Radon düzeltmesiyle ORTAK (radon-ca-rm-fix-kurallar.mjs); orada ayrıca testli.
 * Ağa çıkmaz.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { manifestIhlalleri, hedefHesapla } from '../radon-ca-rm-fix-kurallar.mjs'

type Kalem = {
  ad: string
  kaynak: string
  onceki: { weight_kg: number | null }
  yeni: { weight_kg: number }
  kolon?: { weight_kg: number }
  kolon_onceki?: { weight_kg: number }
  kaldir?: unknown[]
}
const manifest = JSON.parse(readFileSync(join(__dirname, '..', 'seat-net-agirlik-manifest.json'), 'utf8')) as {
  items: Record<string, Kalem>
}
const SECENEK = { kodDeseni: /^SEA-\d{8}$/, kodAciklama: 'anahtar SEA-<8 hane> olmali', aralik: { weight_kg: [0.1, 300] as [number, number] } }
const kalem = (sku: string): Kalem => manifest.items[sku]

describe('seat-net-agirlik-manifest', () => {
  it('manifest temiz (sayı/birim/aralık, kolon aynası, sku anahtarı)', () => {
    expect(manifestIhlalleri(manifest, SECENEK)).toEqual([])
  })

  it('seçenek olmadan 5 haneli model_code beklenir (Radon/Air Door davranışı değişmedi)', () => {
    expect(manifestIhlalleri(manifest).join('|')).toMatch(/model_code 5 haneli/)
  })

  it('her kalemin kaynağı SEAT broşürü Kasım 2024 ve yalnız weight_kg yazılır', () => {
    for (const [sku, it_] of Object.entries(manifest.items)) {
      expect(sku).toMatch(/^SEA-\d{8}$/)
      expect(it_.kaynak).toMatch(/^seat-brochure-2024-11\.pdf s\.\d/)
      expect(Object.keys(it_.yeni)).toEqual(['weight_kg'])
      expect(it_.kaldir ?? []).toEqual([])
      if (it_.kolon) expect(it_.kolon.weight_kg).toBe(it_.yeni.weight_kg)
    }
  })

  it('STORM 18 (61183000, 61183003) manifestte YOK: broşür kendi içinde şüpheli', () => {
    expect(manifest.items['SEA-61183000']).toBeUndefined()
    expect(manifest.items['SEA-61183003']).toBeUndefined()
  })

  it('JET 25 2800 d/dk 2,2 kW (71253000) manifestte YOK: broşürde s.34 26,2 ↔ s.39 26,4 çelişiyor', () => {
    expect(manifest.items['SEA-71253000']).toBeUndefined()
  })

  it('KTL-53 sınıflamasındaki bilinen SEAT kalemleri broşür net değerine gider', () => {
    const y = (sku: string) => kalem(sku).yeni.weight_kg
    expect(y('SEA-51201000')).toBe(8.9)
    expect(y('SEA-51202003')).toBe(8.6)
    expect(y('SEA-51302000')).toBe(21.2)
    expect(y('SEA-51302003')).toBe(20.7)
    expect(y('SEA-51350000')).toBe(37.8)
  })

  it('JET net ağırlıkları AVenS sevk ağırlığından küçük (JET 71201000: 21,7 → 12,4)', () => {
    expect(kalem('SEA-71201000').onceki.weight_kg).toBe(21.7)
    expect(kalem('SEA-71201000').yeni.weight_kg).toBe(12.4)
  })

  it('canlı değer manifestin onceki ölçümüyle aynıysa fark üretir, farklıysa BAYAT der', () => {
    const it_ = kalem('SEA-51302000')
    const canli = { id: 'x', sku: 'SEA-51302000', weight_kg: 23.7, technical_specs: { weight_kg: 37.8, rpm_max: 1400 } }
    const h = hedefHesapla(canli, it_)
    expect(h.ihlaller).toEqual([])
    expect(h.yeniSpecs).toMatchObject({ weight_kg: 21.2, rpm_max: 1400 })
    expect(h.yeniKolon).toEqual({ weight_kg: 21.2 })
    const bayat = hedefHesapla({ ...canli, weight_kg: 25 }, it_)
    expect(bayat.ihlaller.join('|')).toMatch(/BAYAT/)
  })
})
