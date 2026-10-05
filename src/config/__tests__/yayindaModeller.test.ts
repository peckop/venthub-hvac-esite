// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { MODEL_AYIRICI } from '../../utils/modelAdresBicimi'
import {
  kanonikModelSku,
  modelAdresiVarMi,
  modelSlugu,
  sitemapModelMi,
  yayindaListesiDogrula,
  yayindaListesiKur,
  yayindaModelKayitlari,
} from '../yayindaModeller'
import veri from '../yayindaModeller.veri.json'
import { sentetikSlug, sentetikVeri } from './yayindaTestKiti'

/**
 * INV-YAYINDA-MODEL-1 — "yayındaki modeller" listesinin BİÇİMİ, TEKİLLİĞİ, SIRASI, model slug'ı ve sürüm
 * hedefi (URN-31). Liste anahtarı SKU'dur; her listedeki SKU'nun `slug_tr` / `slug_en` adres metni VARDIR
 * (kaynak: Faz 2 CSV'si, bkz. scripts/seo/__tests__/yayinda-model-veri-uret.test.ts). Metin yoksa SKU liste içi sayılamaz: aile slug'ına
 * düşülmez, kayıt GEÇERSİZdir (fail-closed).
 * Mekanizma PR'ında liste BOŞTUR; gerçek liste bu kapıdan geçer, sentetik KÖTÜ listeler geçmez (duyarlılık).
 */

/** Değiştirilebilir (readonly olmayan) liste verisi: kötü örnekler iyiden TEK bozulmayla türer. */
interface Mut {
  modeller: Record<string, Record<string, { tr: string; en: string }>>
  surumler: Record<string, { temel: string; tr: string; en: string }>
}

const iyi = (): Mut => {
  const v = sentetikVeri({
    modeller: { 'aile-a': ['AAA-100', 'AAA-200'], 'aile-b': ['BBB-1'] },
    surumler: { 'AAA-101': 'AAA-100' },
  })
  return JSON.parse(JSON.stringify(v)) as Mut
}

/** Derin kopya + değişiklik. */
function boz(degistir: (v: Mut) => void): Mut {
  const kopya = iyi()
  degistir(kopya)
  return kopya
}

describe('gerçek liste (derleme sabiti)', () => {
  it('doğrulayıcıdan geçer', () => {
    expect(yayindaListesiDogrula(veri)).toEqual([])
  })

  it('FAIL-CLOSED ön koşul: mekanizma PR\'ında liste boş → hiçbir SKU model sayfası almaz', () => {
    expect(yayindaModelKayitlari()).toEqual([])
    expect(modelAdresiVarMi('VRT-17170')).toBe(false)
    expect(sitemapModelMi('VRT-17170')).toBe(false)
    expect(kanonikModelSku('VRT-17170')).toBeNull()
    expect(modelSlugu('VRT-17170', 'tr')).toBeNull()
  })
})

describe('doğrulayıcı — iyi liste', () => {
  it('iyi örnek hatasız', () => {
    expect(yayindaListesiDogrula(iyi())).toEqual([])
  })
  it('boş liste geçerli (fail-closed başlangıç)', () => {
    expect(yayindaListesiDogrula({ modeller: {}, surumler: {} })).toEqual([])
  })
})

describe('doğrulayıcı — her bozukluk KIRMIZI (duyarlılık)', () => {
  const m = (sku: string) => ({ tr: sentetikSlug(sku, 'tr'), en: sentetikSlug(sku, 'en') })
  it.each([
    ['küçük harfli SKU', { modeller: { 'aile-a': { 'aaa-100': m('aaa-100') } }, surumler: {} }],
    ['boşluklu SKU', { modeller: { 'aile-a': { 'AAA 100': m('AAA-100') } }, surumler: {} }],
    ['kenar boşluklu SKU', { modeller: { 'aile-a': { ' AAA-100': m('AAA-100') } }, surumler: {} }],
    ['boş SKU', { modeller: { 'aile-a': { '': m('X') } }, surumler: {} }],
    ['özel karakterli SKU', { modeller: { 'aile-a': { 'AAA/100': m('AAA-100') } }, surumler: {} }],
    ['SKU ayırıcıyla çakışır', { modeller: { 'aile-a': { 'AAA-P-1': m('AAA-1') } }, surumler: {} }],
    ['iki grupta aynı SKU', { modeller: { 'aile-a': { 'AAA-100': m('AAA-100') }, 'aile-b': { 'AAA-100': m('AAA-101') } }, surumler: {} }],
    ['grup içi sırasız', { modeller: { 'aile-a': { 'AAA-200': m('AAA-200'), 'AAA-100': m('AAA-100') } }, surumler: {} }],
    ['gruplar sırasız', { modeller: { 'aile-b': { 'BBB-1': m('BBB-1') }, 'aile-a': { 'AAA-1': m('AAA-1') } }, surumler: {} }],
    ['büyük harfli aile slug', { modeller: { 'Aile-A': { 'AAA-1': m('AAA-1') } }, surumler: {} }],
    ['boşluklu aile slug', { modeller: { 'aile a': { 'AAA-1': m('AAA-1') } }, surumler: {} }],
    ['boş grup', { modeller: { 'aile-a': {} }, surumler: {} }],
    ['grup nesne değil', { modeller: { 'aile-a': ['AAA-1'] }, surumler: {} }],
    ['bilinmeyen üst anahtar', { modeller: {}, surumler: {}, ekstra: 1 }],
    ['modeller yok', { surumler: {} }],
    ['nesne değil', 'liste'],
    ['null', null],
  ])('%s', (_ad, kotu) => {
    expect(yayindaListesiDogrula(kotu).length).toBeGreaterThan(0)
  })

  it.each([
    ['slug_tr yok', (v: ReturnType<typeof iyi>) => { delete (v.modeller['aile-a']['AAA-100'] as Partial<{ tr: string }>).tr }],
    ['slug_en yok', (v: ReturnType<typeof iyi>) => { delete (v.modeller['aile-a']['AAA-100'] as Partial<{ en: string }>).en }],
    ['slug_tr boş', (v: ReturnType<typeof iyi>) => { (v.modeller['aile-a']['AAA-100'] as { tr: string }).tr = '' }],
    ['slug_tr büyük harf', (v: ReturnType<typeof iyi>) => { (v.modeller['aile-a']['AAA-100'] as { tr: string }).tr = 'Abc' }],
    ['slug_tr Türkçe harf', (v: ReturnType<typeof iyi>) => { (v.modeller['aile-a']['AAA-100'] as { tr: string }).tr = 'fanı' }],
    ['slug_en boşluklu', (v: ReturnType<typeof iyi>) => { (v.modeller['aile-a']['AAA-100'] as { en: string }).en = 'a b' }],
    ['slug 70 karakterden uzun', (v: ReturnType<typeof iyi>) => { (v.modeller['aile-a']['AAA-100'] as { tr: string }).tr = 'a'.repeat(71) }],
    ['slug ayırıcı içerir', (v: ReturnType<typeof iyi>) => { (v.modeller['aile-a']['AAA-100'] as { tr: string }).tr = `abc${MODEL_AYIRICI}def` }],
    ['slug_tr iki modelde aynı', (v: ReturnType<typeof iyi>) => { (v.modeller['aile-a']['AAA-200'] as { tr: string }).tr = (v.modeller['aile-a']['AAA-100'] as { tr: string }).tr }],
    ['slug_en iki modelde aynı', (v: ReturnType<typeof iyi>) => { (v.modeller['aile-b']['BBB-1'] as { en: string }).en = (v.modeller['aile-a']['AAA-100'] as { en: string }).en }],
    ['sürümün slug\'ı temelle aynı', (v: ReturnType<typeof iyi>) => { v.surumler['AAA-101'].tr = (v.modeller['aile-a']['AAA-100'] as { tr: string }).tr }],
    ['sürüm slug_tr yok', (v: ReturnType<typeof iyi>) => { delete (v.surumler['AAA-101'] as Partial<{ tr: string }>).tr }],
    ['sürüm hedefi listede yok', (v: ReturnType<typeof iyi>) => { v.surumler['AAA-101'].temel = 'ZZZ-1' }],
    ['sürüm kendi hedefi', (v: ReturnType<typeof iyi>) => { v.surumler['AAA-101'].temel = 'AAA-101' }],
    ['sürüm aynı zamanda liste modeli', (v: ReturnType<typeof iyi>) => { v.modeller['aile-a']['AAA-101'] = { tr: 'x-tr', en: 'x-en' } }],
    ['sürüm zinciri', (v: ReturnType<typeof iyi>) => { v.surumler['AAA-102'] = { temel: 'AAA-101', tr: 'y-tr', en: 'y-en' } }],
    ['küçük harfli sürüm', (v: ReturnType<typeof iyi>) => { v.surumler['aaa-103'] = { temel: 'AAA-100', tr: 'z-tr', en: 'z-en' } }],
  ])('%s', (_ad, degistir) => {
    expect(yayindaListesiDogrula(boz(degistir)).length).toBeGreaterThan(0)
  })
})

describe('yayindaListesiKur — karar fonksiyonları', () => {
  const l = yayindaListesiKur(iyi())

  it('liste içi model: adres var, sitemap\'te, kanonik kendisi, slug\'ı listeden', () => {
    expect(l.modelAdresiVarMi('AAA-100')).toBe(true)
    expect(l.sitemapModelMi('AAA-100')).toBe(true)
    expect(l.kanonikModelSku('AAA-100')).toBe('AAA-100')
    expect(l.modelSlugu('AAA-100', 'tr')).toBe(sentetikSlug('AAA-100', 'tr'))
    expect(l.modelSlugu('AAA-100', 'en')).toBe(sentetikSlug('AAA-100', 'en'))
  })

  it('sürüm: kendi adresi + kendi slug\'ı var, sitemap\'te YOK, kanonik TEMEL modele (URN-27 asgarisi)', () => {
    expect(l.modelAdresiVarMi('AAA-101')).toBe(true)
    expect(l.sitemapModelMi('AAA-101')).toBe(false)
    expect(l.kanonikModelSku('AAA-101')).toBe('AAA-100')
    expect(l.modelSlugu('AAA-101', 'tr')).toBe(sentetikSlug('AAA-101', 'tr'))
  })

  it('liste dışı / bilinmeyen SKU: hiçbiri', () => {
    for (const sku of ['ZZZ-9', 'AAA-1000', 'VRT-17170']) {
      expect(l.modelAdresiVarMi(sku)).toBe(false)
      expect(l.sitemapModelMi(sku)).toBe(false)
      expect(l.kanonikModelSku(sku)).toBeNull()
      expect(l.modelSlugu(sku, 'tr')).toBeNull()
    }
  })

  it('girdi küçük harf / kenar boşluklu gelse de kimliğe çözülür (DB biçimi büyük harf)', () => {
    expect(l.modelAdresiVarMi('aaa-100')).toBe(true)
    expect(l.modelAdresiVarMi('  AAA-100 ')).toBe(true)
    expect(l.kanonikModelSku('aaa-101')).toBe('AAA-100')
  })

  it('SKU olmayan girdi (boş, null, sayı, nesne) güvenli tarafa düşer: yok', () => {
    for (const girdi of ['', '   ', null, undefined, 42, {}, []]) {
      expect(l.modelAdresiVarMi(girdi)).toBe(false)
      expect(l.sitemapModelMi(girdi)).toBe(false)
      expect(l.kanonikModelSku(girdi)).toBeNull()
      expect(l.modelSlugu(girdi, 'tr')).toBeNull()
    }
  })

  it('kısmi eşleşme yok', () => {
    expect(l.modelAdresiVarMi('AAA 100')).toBe(false)
    expect(l.modelAdresiVarMi('AAA-10')).toBe(false)
  })

  it('kayıtlar: sıralı, aile slug\'ı + slug metni taşır; sürüm ailesini temelinden alır', () => {
    expect(l.kayitlar().map((k) => [k.sku, k.aileSlug, k.temel])).toEqual([
      ['AAA-100', 'aile-a', null],
      ['AAA-200', 'aile-a', null],
      ['BBB-1', 'aile-b', null],
      ['AAA-101', 'aile-a', 'AAA-100'],
    ])
    expect(l.kayitlar()[0].slug).toEqual({ tr: sentetikSlug('AAA-100', 'tr'), en: sentetikSlug('AAA-100', 'en') })
  })

  it('FAIL-CLOSED: slug metni eksik kayıt adres ALMAZ (aile slug\'ına düşülmez)', () => {
    const bozuk = yayindaListesiKur(boz((v) => { delete (v.modeller['aile-a']['AAA-100'] as Partial<{ tr: string }>).tr }))
    expect(bozuk.modelAdresiVarMi('AAA-100')).toBe(false)
    expect(bozuk.modelSlugu('AAA-100', 'tr')).toBeNull()
    expect(bozuk.modelSlugu('AAA-100', 'en')).toBeNull()
  })

  it('FAIL-CLOSED: hedefi listede olmayan sürüm (bozuk veri) adres ALMAZ', () => {
    const bozuk = yayindaListesiKur(boz((v) => { v.surumler['AAA-101'].temel = 'ZZZ-1' }))
    expect(bozuk.modelAdresiVarMi('AAA-101')).toBe(false)
    expect(bozuk.kanonikModelSku('AAA-101')).toBeNull()
  })

  it('FAIL-CLOSED: sürüm zinciri çözülmez (ikinci halka adres almaz)', () => {
    const zincir = yayindaListesiKur(boz((v) => { v.surumler['AAA-102'] = { temel: 'AAA-101', tr: 'y-tr', en: 'y-en' } }))
    expect(zincir.modelAdresiVarMi('AAA-101')).toBe(true)
    expect(zincir.modelAdresiVarMi('AAA-102')).toBe(false)
  })

  it('boş liste: hiçbir SKU adres almaz', () => {
    const bos = yayindaListesiKur({ modeller: {}, surumler: {} })
    expect(bos.kayitlar()).toEqual([])
    expect(bos.modelAdresiVarMi('AAA-100')).toBe(false)
  })
})
