/**
 * radon-ca-rm-fix.mjs — saf kurallar (KTL-48). Ağa çıkmaz.
 * Kilitlenenler: sayı/birim sözleşmesi (§11.6), eski alan yalnız yerine geçeni doluysa kalkar,
 * kolon aynası, BAYATLIK (canlı değer ölçümden sonra değiştiyse yazılmaz), depodaki manifest temiz.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { manifestIhlalleri, hedefHesapla } from '../radon-ca-rm-fix-kurallar.mjs'

const kalem = (o: Record<string, unknown> = {}) => ({
  ad: 'CA-RM 100 ES', kaynak: '191875 s.61',
  onceki: { weight_kg: 4.8, noise_lpa_3m_db: null, noise_level_db_a: 52 },
  yeni: { weight_kg: 3.5, noise_lpa_3m_db: 42.6 },
  kaldir: [{ alan: 'noise_level_db_a', yerine: 'noise_lpa_3m_db' }],
  kolon_onceki: { weight_kg: 4.8 }, kolon: { weight_kg: 3.5 }, ...o,
})
const man = (k = kalem()) => ({ items: { '16277': k } })
const satir = (specs: Record<string, unknown>, kolon: number | null = 4.8) =>
  ({ id: 'x', sku: 'VRT-16277', weight_kg: kolon, technical_specs: specs })

describe('radon-ca-rm-fix manifest kuralları', () => {
  it('temiz kalem GEÇER', () => {
    expect(manifestIhlalleri(man())).toEqual([])
  })
  it('birimli alan METİN olursa DÜŞER (§11.6)', () => {
    expect(manifestIhlalleri(man(kalem({ yeni: { weight_kg: '3,5', noise_lpa_3m_db: 42.6 } })))[0]).toMatch(/SAYI degil/)
  })
  it('makul aralık dışı değer DÜŞER (ses 4 dB, ağırlık 350 kg)', () => {
    expect(manifestIhlalleri(man(kalem({ yeni: { weight_kg: 350, noise_lpa_3m_db: 42.6 }, kolon: { weight_kg: 350 } }))).join('|')).toMatch(/weight_kg=350/)
    expect(manifestIhlalleri(man(kalem({ yeni: { weight_kg: 3.5, noise_lpa_3m_db: 4 } }))).join('|')).toMatch(/noise_lpa_3m_db=4/)
  })
  it('eski alan, yerine geçen YENİ değerde yoksa kaldırılamaz', () => {
    const v = manifestIhlalleri(man(kalem({ yeni: { weight_kg: 3.5 }, onceki: { weight_kg: 4.8, noise_level_db_a: 52 } })))
    expect(v.join('|')).toMatch(/kaldirilamaz/)
  })
  it('yeni alan için onceki beklenen değer yazılmamışsa DÜŞER', () => {
    const v = manifestIhlalleri(man(kalem({ onceki: { weight_kg: 4.8, noise_level_db_a: 52 } })))
    expect(v.join('|')).toMatch(/noise_lpa_3m_db yeni ama onceki/)
  })
  it('kolon ağırlığı specs ağırlığıyla aynı olmalı', () => {
    expect(manifestIhlalleri(man(kalem({ kolon: { weight_kg: 3.6 } }))).join('|')).toMatch(/kolon.weight_kg/)
  })
  it('pq_curve [[q,p],...] metni olmalı', () => {
    const k = kalem({ yeni: { pq_curve: 'x' }, onceki: { pq_curve: '[[0, 1], [1, 0]]' }, kaldir: [], kolon: undefined, kolon_onceki: undefined })
    expect(manifestIhlalleri(man(k)).join('|')).toMatch(/pq_curve/)
    const iyi = kalem({ yeni: { pq_curve: '[[0, 922], [387.5, 691.5], [775, 0]]' }, onceki: { pq_curve: '[[0, 225], [387.5, 168.8], [775, 0]]' }, kaldir: [], kolon: undefined, kolon_onceki: undefined })
    expect(manifestIhlalleri(man(iyi))).toEqual([])
  })
  it('boş manifest düşer', () => {
    expect(manifestIhlalleri({ items: {} })).toEqual(['items bos'])
  })
  it('depodaki Radon manifesti temiz: 8 model, ses yazılan 7, 160 ES sesi TUTULUR', () => {
    const m = JSON.parse(readFileSync(join(__dirname, '..', 'radon-ca-rm-manifest.json'), 'utf8'))
    expect(manifestIhlalleri(m)).toEqual([])
    expect(Object.keys(m.items)).toHaveLength(8)
    const sesli = Object.entries(m.items).filter(([, it]) => (it as { yeni: Record<string, unknown> }).yeni.noise_lpa_3m_db !== undefined)
    expect(sesli).toHaveLength(7)
    expect((m.items['16280'] as { yeni: Record<string, unknown> }).yeni.noise_lpa_3m_db).toBeUndefined()
  })
})

describe('radon-ca-rm-fix hedef hesabı', () => {
  it('farkları üçe ayırır: DEĞİŞTİ, YENİ, KALDIRILDI; kolon da değişir', () => {
    const h = hedefHesapla(satir({ weight_kg: 4.8, noise_level_db_a: 52, ip_rating: 'IPX7' }), kalem())
    expect(h.ihlaller).toEqual([])
    expect(h.yeniSpecs).toEqual({ weight_kg: 3.5, noise_lpa_3m_db: 42.6, ip_rating: 'IPX7' })
    expect(h.farklar.map(f => `${f.kind}:${f.alan}`).sort()).toEqual(
      ['DEGISTI:kolon.weight_kg', 'DEGISTI:weight_kg', 'KALDIRILDI:noise_level_db_a', 'YENI:noise_lpa_3m_db'])
    expect(h.yeniKolon).toEqual({ weight_kg: 3.5 })
  })
  it('dokunulmayan alan (ip_rating) aynen kalır', () => {
    const h = hedefHesapla(satir({ weight_kg: 4.8, noise_level_db_a: 52, ip_rating: 'IPX7', diameter_mm: 97 }), kalem())
    expect(h.yeniSpecs.ip_rating).toBe('IPX7')
    expect(h.yeniSpecs.diameter_mm).toBe(97)
  })
  it('BAYATLIK: canlı ağırlık ölçümden sonra değişmişse ihlal verir', () => {
    const h = hedefHesapla(satir({ weight_kg: 4.9, noise_level_db_a: 52 }), kalem())
    expect(h.ihlaller.join('|')).toMatch(/BAYAT.*weight_kg/)
  })
  it('BAYATLIK: kolon ölçümden sonra değişmişse ihlal verir', () => {
    const h = hedefHesapla(satir({ weight_kg: 4.8, noise_level_db_a: 52 }, 5), kalem())
    expect(h.ihlaller.join('|')).toMatch(/BAYAT.*kolon/)
  })
  it('hedef zaten uygulanmışsa (ikinci koşum) BAYAT diye durur, sessizce üstüne yazmaz', () => {
    const h = hedefHesapla(satir({ weight_kg: 3.5, noise_lpa_3m_db: 42.6 }, 3.5), kalem())
    expect(h.ihlaller.length).toBeGreaterThan(0)
  })
})
