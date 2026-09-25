/**
 * REC-212 · paket tazeliği (OPS hükmü 2026-09-24). Ağa, DB'ye çıkmaz; veri UYDURMA.
 *
 * Kilitlenenler:
 *   1. Aynı veri → aynı iz, anahtar sırası izi değiştirmez; tek hücre değişimi izi değiştirir.
 *   2. Satır sayısı aynı kalsa da içerik değişimi BAYAT (olay: 09-10 paketi 442→442 ama 281 ürün farklıydı).
 *   3. Silinen satır BAYAT — zaman damgası kıyasının göremediği durum.
 *   4. Manifest yok → PAKET YOK; manifest'te olup ölçülemeyen tablo taze sayılmaz.
 *   5. Dışa aktarıcı ve karne izi AYNI fonksiyondan alır (iki ayrı hesap yazılamaz).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parmakIzi, tabloGovdesi, tazelik, tazelikNotu } from '../paket-tazelik.mjs'

const urunler = [
  { id: 'a1', sku: 'TST-1', technical_specs: { rpm_max: 1400 } },
  { id: 'a2', sku: 'TST-2', technical_specs: {} },
]
const manifestOf = (satirlar: object[]) => ({
  uretildi: '2026-09-24T00:00:00.000Z',
  tablolar: { products: { satir: satirlar.length, sha256: parmakIzi(satirlar) } },
})
const canliOf = (satirlar: object[]) => ({ products: { satir: satirlar.length, sha256: parmakIzi(satirlar) } })

describe('parmak izi', () => {
  it('anahtar sırası izi değiştirmez; gövde jsonl biçimindedir', () => {
    const ters = urunler.map((u) => ({ technical_specs: u.technical_specs, sku: u.sku, id: u.id }))
    expect(parmakIzi(ters)).toBe(parmakIzi(urunler))
    expect(tabloGovdesi(urunler).split('\n')).toHaveLength(3)
  })

  it('tek hücre değişimi izi değiştirir', () => {
    const degisik = [urunler[0], { ...urunler[1], technical_specs: { rpm_max: 900 } }]
    expect(parmakIzi(degisik)).not.toBe(parmakIzi(urunler))
  })
})

describe('tazelik', () => {
  it('canlı = paket → TAZE', () => {
    expect(tazelik(manifestOf(urunler), canliOf(urunler))).toMatchObject({ durum: 'TAZE', bayat: [], olculmedi: [] })
  })

  it('satır sayısı aynı, içerik farklı → BAYAT (içerik)', () => {
    const canli = [urunler[0], { ...urunler[1], technical_specs: { ip_rating: 'IP44' } }]
    const t = tazelik(manifestOf(urunler), canliOf(canli))
    expect(t.durum).toBe('BAYAT')
    expect(tazelikNotu(t)).toContain('products 2→2 (içerik)')
  })

  it('silinen satır → BAYAT', () => {
    const t = tazelik(manifestOf(urunler), canliOf([urunler[0]]))
    expect(t.bayat).toEqual([{ tablo: 'products', paket_satir: 2, canli_satir: 1 }])
  })

  it('manifest yok → PAKET YOK; ölçülemeyen tablo taze sayılmaz', () => {
    expect(tazelik(null, {}).durum).toBe('PAKET YOK')
    const t = tazelik(manifestOf(urunler), {})
    expect(t).toMatchObject({ durum: 'BAYAT', olculmedi: ['products'] })
  })
})

describe('tek kaynak', () => {
  const kaynak = (ad: string) => readFileSync(join(__dirname, '..', ad), 'utf8')

  it('dışa aktarıcı ve karne izi paket-tazelik.mjs\'ten alır, kendi hash\'ini hesaplamaz', () => {
    for (const ad of ['katalog-disa-aktar.mjs', 'katalog-karnesi.mjs']) {
      expect(kaynak(ad)).toMatch(/from '\.\/paket-tazelik\.mjs'/)
      expect(kaynak(ad)).not.toMatch(/createHash\(/)
    }
  })

  it('karne --kapi paket tazeliği kırmızıyken çıkış 1 verir', () => {
    expect(kaynak('katalog-karnesi.mjs')).toMatch(/if \(KAPI && tz\.durum !== 'TAZE'\) \{[\s\S]{0,200}process\.exit\(1\)/)
  })
})
