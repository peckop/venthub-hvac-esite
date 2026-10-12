// @vitest-environment node
/**
 * INV-YAYINDA-MODEL-9 — yayındaki model listesinin adres metinleri Faz 2 CSV'siyle BİREBİR (URN-31).
 *
 * Her liste satırının `slug_tr` / `slug_en` / aile değeri CSV satırıyla aynı olmalı; CSV değişirse liste
 * `node scripts/seo/yayinda-model-veri-uret.mjs --yenile` ile yenilenir, yenilenmezse bu kapı KIRMIZI olur.
 * Mekanizma PR'ında liste boştur: kapı BOŞ listede yeşildir ama SENTETİK dolu listelerde ölçer
 * (CSV'den üretilen liste yeşil, bozulan liste kırmızı).
 */
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { yayindaListesiDogrula } from '../../../src/config/yayindaModeller'
import veri from '../../../src/config/yayindaModeller.veri.json'
import { csvAyristir, csvKarsilastir, csvSatirlari, girdiyiCikar, VARSAYILAN_CSV, veriMetni, veriUret } from '../yayinda-model-veri-uret.mjs'

const satirlar = csvSatirlari(readFileSync(VARSAYILAN_CSV, 'utf8'))
const ilk = (n: number) => satirlar.slice(0, n).map((s) => s.sku)

describe('CSV ön koşulları (boş evrende yeşil kapı ölçüm değildir)', () => {
  it('442 satır, beklenen sütunlar', () => {
    expect(satirlar).toHaveLength(442)
    expect(Object.keys(satirlar[0])).toEqual([
      'sku', 'ad', 'dal', 'marka', 'aile_bugun', 'aile_yeni', 'slug_bugun', 'eski_ek_slug', 'slug_tr', 'slug_en',
      'adres_tr', 'adres_en', 'uzunluk_tr', 'not',
    ])
  })

  it('slug_tr ve slug_en 442/442 dolu ve tekil', () => {
    for (const sutun of ['slug_tr', 'slug_en'] as const) {
      const degerler = satirlar.map((s) => s[sutun])
      expect(degerler.every((d) => d !== '')).toBe(true)
      expect(new Set(degerler).size).toBe(442)
    }
  })

  it('tırnaklı alan ("" kaçışı) doğru okunur: ad sütununda 4" ebadı', () => {
    expect(satirlar.find((s) => s.sku === 'VRT-11313')?.ad).toBe('Vortice Punto Evo Flexo MEX 100/4" LL 1S')
  })

  it('BOM, CRLF, tırnak ve ayraç ayrıştırması', () => {
    expect(csvAyristir('﻿a;b\r\n"x;y";"z""w"\r\n')).toEqual([['a', 'b'], ['x;y', 'z"w']])
  })
})

describe('gerçek liste ↔ CSV', () => {
  it('her liste satırı CSV satırıyla birebir (boş liste dahil geçerli)', () => {
    expect(csvKarsilastir(veri, satirlar)).toEqual([])
  })

  it('--yenile gerçek listeyi DEĞİŞTİRMEZ (CSV ile tutarlı = yenileme sabit nokta)', () => {
    expect(veriMetni(veriUret(satirlar, girdiyiCikar(veri)))).toBe(veriMetni(veri))
  })
})

describe('DUYARLILIK — sentetik dolu listeler (CSV\'den üretilen)', () => {
  // Sürümün ailesi temelinden gelir: aynı aileden bir satır seçilir.
  const ayniAile = satirlar.find((s, i) => i > 12 && s.aile_bugun === satirlar[0].aile_bugun)
  const uretilen = veriUret(satirlar, { modeller: ilk(12), surumler: ayniAile ? { [ayniAile.sku]: satirlar[0].sku } : {} })

  it('CSV\'den üretilen liste doğrulayıcıdan ve CSV karşılaştırmasından geçer', () => {
    expect(ayniAile).toBeDefined()
    expect(yayindaListesiDogrula(uretilen)).toEqual([])
    expect(csvKarsilastir(uretilen, satirlar)).toEqual([])
  })

  it('üretim kararlı: aynı girdi → aynı çıktı, SKU sırası girdi sırasından bağımsız', () => {
    const ters = veriUret(satirlar, { modeller: [...ilk(12)].reverse(), surumler: ayniAile ? { [ayniAile.sku]: satirlar[0].sku } : {} })
    expect(veriMetni(ters)).toBe(veriMetni(uretilen))
  })

  it('slug_tr değişirse KIRMIZI', () => {
    const kopya = JSON.parse(JSON.stringify(uretilen))
    const aile = Object.keys(kopya.modeller)[0]
    const sku = Object.keys(kopya.modeller[aile])[0]
    kopya.modeller[aile][sku].tr += '-x'
    expect(csvKarsilastir(kopya, satirlar).join('\n')).toContain('slug_tr')
  })

  it('slug_en değişirse KIRMIZI', () => {
    const kopya = JSON.parse(JSON.stringify(uretilen))
    const aile = Object.keys(kopya.modeller)[0]
    const sku = Object.keys(kopya.modeller[aile])[0]
    kopya.modeller[aile][sku].en = 'baska'
    expect(csvKarsilastir(kopya, satirlar).join('\n')).toContain('slug_en')
  })

  it('aile yanlışsa KIRMIZI', () => {
    const kopya = JSON.parse(JSON.stringify(uretilen))
    const aile = Object.keys(kopya.modeller)[0]
    kopya.modeller['yanlis-aile'] = kopya.modeller[aile]
    delete kopya.modeller[aile]
    expect(csvKarsilastir(kopya, satirlar).join('\n')).toContain('aile')
  })

  it('CSV\'de olmayan SKU KIRMIZI; üretici de atar', () => {
    expect(csvKarsilastir({ modeller: { a: { 'YOK-1': { tr: 'x', en: 'y' } } }, surumler: {} }, satirlar).length).toBeGreaterThan(0)
    expect(() => veriUret(satirlar, { modeller: ['YOK-1'] })).toThrow(/CSV'de yok/)
  })

  it('CSV değişirse (satır slug\'ı güncellenir) eski liste KIRMIZI olur, yenileme düzeltir', () => {
    const degisen = satirlar.map((s) => (s.sku === satirlar[0].sku ? { ...s, slug_tr: `${s.slug_tr}-yeni` } : s))
    expect(csvKarsilastir(uretilen, degisen).length).toBeGreaterThan(0)
    expect(csvKarsilastir(veriUret(degisen, girdiyiCikar(uretilen)), degisen)).toEqual([])
  })

  it('girdi sürüm eşlemesi temel SKU\'su listede yoksa karşılaştırma KIRMIZI', () => {
    const kopya = JSON.parse(JSON.stringify(uretilen))
    const surum = Object.keys(kopya.surumler)[0]
    kopya.surumler[surum].temel = 'YOK-1'
    expect(csvKarsilastir(kopya, satirlar).join('\n')).toContain('temel')
  })
})
