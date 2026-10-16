/**
 * airdoor-akim-manifest.json — depodaki manifest iç tutarlılığı ve kaynak hükümleri (KTL-47 madde 37).
 * Kurallar Radon düzeltmesiyle ORTAK (radon-ca-rm-fix-kurallar.mjs); orada ayrıca testli.
 * Ağa çıkmaz.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { manifestIhlalleri, hedefHesapla } from '../radon-ca-rm-fix-kurallar.mjs'

const manifest = JSON.parse(readFileSync(join(__dirname, '..', 'airdoor-akim-manifest.json'), 'utf8'))

describe('airdoor-akim-manifest', () => {
  it('manifest temiz (sayı/birim/aralık, kolon aynası)', () => {
    expect(manifestIhlalleri(manifest)).toEqual([])
  })

  it('tam 4 Air Door ısıtıcılı model, hepsinde kaynak sayfa var', () => {
    expect(Object.keys(manifest.items).sort()).toEqual(['65155', '65156', '65157', '65158'])
    for (const it of Object.values<{ kaynak: string }>(manifest.items)) expect(it.kaynak).toMatch(/189461 s\.6/)
  })

  it('katalog akımları 28 / 10 / 13 / 18 A', () => {
    const a = (k: string) => manifest.items[k].yeni.absorbed_current_a
    expect([a('65155'), a('65156'), a('65157'), a('65158')]).toEqual([28, 10, 13, 18])
  })

  it('heating_power_w ve noise alanlarına DOKUNMAZ (kaynaksız / legacy)', () => {
    for (const it of Object.values<{ yeni: object; onceki: object; kaldir?: unknown[] }>(manifest.items)) {
      expect(Object.keys(it.yeni).filter(k => /heating|noise|voltage/.test(k))).toEqual([])
      expect(it.kaldir ?? []).toEqual([])
    }
  })

  it('canlı değer manifestin onceki ölçümüyle aynıysa fark üretir, farklıysa BAYAT der', () => {
    const it = manifest.items['65158']
    const canli = { id: 'x', sku: 'VRT-65158', weight_kg: 18.5, technical_specs: { absorbed_current_a: 14.77, weight_kg: 18.5, heating_power_w: 10000 } }
    const h = hedefHesapla(canli, it)
    expect(h.ihlaller).toEqual([])
    expect(h.yeniSpecs).toMatchObject({ absorbed_current_a: 18, weight_kg: 18, heating_power_w: 10000 })
    expect(h.yeniKolon).toEqual({ weight_kg: 18 })
    const bayat = hedefHesapla({ ...canli, technical_specs: { ...canli.technical_specs, absorbed_current_a: 15 } }, it)
    expect(bayat.ihlaller.join('|')).toMatch(/BAYAT/)
  })
})
