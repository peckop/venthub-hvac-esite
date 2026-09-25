/**
 * Karar 115 · kategori EN metni yazım planı (REC-146). Ağa, DB'ye çıkmaz; veri UYDURMA.
 *
 * Kilitlenenler:
 *   1. Temiz girdi → yazılır; yeni metadata TR'yi ve diğer anahtarları AYNEN taşır, yalnız en eklenir.
 *   2. Canlı TR çeviri anındakinden farklı → RED (bayat çeviri yazılmaz).
 *   3. EN boş / Türkçe harfli / kategori yok → RED.
 *   4. Canlı EN aynı → AYNI (ikinci koşum 0 yazım); canlı EN farklı → ÜZERİNE işaretli.
 *   5. Geri okuma kıyası anahtar sırasından bağımsız (jsonb sırayı kendi belirler).
 */
import { describe, it, expect } from 'vitest'
import { enYazimPlani, md5, kanon } from '../kategori-en.mjs'

const TR = 'Havayı kanal hattının içinde taşıyan fanlar. Seçimi belirleyen sorular: kanal çapı, debi.'
const EN = 'Fans that carry air inside the duct line. Questions that decide the selection: duct diameter, airflow.'
const kat = (metadata: Record<string, unknown> | null) => [{ id: 'k1', slug: 'duct-fans', metadata }]
const plan = [{ slug: 'duct-fans', tr_md5: md5(TR) }]

describe('Karar 115 · enYazimPlani', () => {
  it('temiz girdi yazılır; TR ve diğer anahtarlar aynen kalır', () => {
    const meta = { slug: { tr: 'kanal-fanlari', en: 'duct-fans' }, hide_price: false, description_i18n: { tr: TR } }
    const r = enYazimPlani({ kategoriler: kat(meta), plan, en: { 'duct-fans': EN } })
    expect(r.red).toEqual([])
    expect(r.yazilacak).toHaveLength(1)
    const y = r.yazilacak[0]
    expect(y.uzerine).toBe(false)
    expect(y.yeni_metadata).toEqual({ ...meta, description_i18n: { tr: TR, en: EN } })
    expect(y.onceki_metadata).toBe(meta)
  })

  it('SABOTAJ — canlı TR değişmişse bayat çeviri RED', () => {
    const r = enYazimPlani({ kategoriler: kat({ description_i18n: { tr: TR + ' Yeni cümle.' } }), plan, en: { 'duct-fans': EN } })
    expect(r.yazilacak).toEqual([])
    expect(r.red[0].sebep).toMatch(/bayat/)
  })

  it('SABOTAJ — Türkçe harfli, boş EN ve olmayan kategori RED', () => {
    const m = { description_i18n: { tr: TR } }
    expect(enYazimPlani({ kategoriler: kat(m), plan, en: { 'duct-fans': 'Fans for kanal hattı' } }).red[0].sebep).toMatch(/Türkçe/)
    expect(enYazimPlani({ kategoriler: kat(m), plan, en: { 'duct-fans': '  \n ' } }).red[0].sebep).toMatch(/boş/)
    expect(enYazimPlani({ kategoriler: kat(m), plan, en: {} }).red[0].sebep).toMatch(/boş/)
    expect(enYazimPlani({ kategoriler: [], plan, en: { 'duct-fans': EN } }).red[0].sebep).toMatch(/yok/)
    expect(enYazimPlani({ kategoriler: kat(null), plan, en: { 'duct-fans': EN } }).red[0].sebep).toMatch(/bayat/)
  })

  it('idempotent: canlı EN aynıysa yazılmaz; farklıysa ÜZERİNE işaretlenir', () => {
    const ayni = enYazimPlani({ kategoriler: kat({ description_i18n: { tr: TR, en: EN } }), plan, en: { 'duct-fans': `${EN}\n` } })
    expect(ayni.ayni).toEqual(['duct-fans'])
    expect(ayni.yazilacak).toEqual([])
    const farkli = enYazimPlani({ kategoriler: kat({ description_i18n: { tr: TR, en: 'Old text.' } }), plan, en: { 'duct-fans': EN } })
    expect(farkli.yazilacak[0].uzerine).toBe(true)
  })

  it('kanon anahtar sırasından bağımsız, değer farkını görür', () => {
    expect(kanon({ b: 1, a: { d: [1, { y: 2, x: 1 }], c: 'x' } })).toBe(kanon({ a: { c: 'x', d: [1, { x: 1, y: 2 }] }, b: 1 }))
    expect(kanon({ a: { en: 'x' } })).not.toBe(kanon({ a: { en: 'y' } }))
    expect(kanon({ a: [1, 2] })).not.toBe(kanon({ a: [2, 1] }))
  })
})
