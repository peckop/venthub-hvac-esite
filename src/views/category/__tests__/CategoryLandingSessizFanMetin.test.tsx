// URN-135 (U3) — kanal tipi fan kategori sayfasının sessiz fan bölümü: Design D2 (7 SSS) + D3 (H2 + metin), ses sayıları
// SİTEDE CANLI kodların ses verisiyle kesişiminden.
//
// Kanıt biçimi: GERÇEK bölümler (mock yok) ve GERÇEK sözlük (TR/EN), `renderToString` ile SUNUCU HTML'i. `next build`
// yerelde koşulmaz; bu test sunucu çıktısında H2'nin, yedi sorunun ve cevap metinlerinin (görünmeyen akordeon gövdesi dahil
// DOM'da) bulunduğunu ölçer. Canlı ölçüm ayrıdır.
//
//  (a) TR ve EN: yeni H2 ve 7 soru sunucu HTML'inde; cevaplar ve kaynak notu DOM'da
//  (b) ses sayısı koşulsuz basılmaz: "dB(A)" geçen her cümle "3 m" koşulunu taşır (sözlük şablonu + doldurulmuş çıktı)
//  (c) boş kesişim (özet yok / örnek model yok): ses cümleleri çizilmez, ham {{ad}} kalmaz, bölümün kalanı durur
//  (d) sözlük = veri: 17164 değerleri, 1160 m³/h, kademe adları, 31 W / 50 W veri modülüyle tutar
//  (e) kaynak taraması: katalog doğrulamasının çıkardığı ifadeler sözlükte geri gelmez
//  (g) ses özeti prop zinciri: sunucu (kategoriSayfasi) → CategoryPage → CategoryMasterView → CategoryLandingView → bölümler
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import ham from '@/data/sessizFan/lineoQuiet.veri.json'
import { type SesOzeti, sesOzetiHesapla } from '@/data/sessizFan/sesOzeti'
import { kademeAdlari, kademeSesTablosu, sesEtiketi } from '@/data/sessizFan/sesVerisi'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import type { DbCategory } from '@/types/db-rows'
import type { FamilyListItem } from '@/types/ui-models'

import { cumleleriDoldur, type SesCumlesi, sesEtiketSozlugu, sesYerTutucular } from '../../../components/category/sections/silent-fan/sesMetni'
import { mapDatabaseCategoryToDomain } from '../../../lib/type-converters'
import CategoryLanding from '../CategoryLandingView'

const durum = vi.hoisted(() => ({ lang: 'tr' as 'tr' | 'en' }))

vi.mock('@/i18n/I18nProvider', async () => {
  const { getDictValue: oku } = await import('@/i18n/getDictValue')
  const { tr: trSozluk } = await import('@/i18n/dictionaries/tr')
  const { en: enSozluk } = await import('@/i18n/dictionaries/en')
  return {
    useI18n: () => {
      const dict = durum.lang === 'en' ? enSozluk : trSozluk
      return {
        lang: durum.lang,
        dict,
        t: (anahtar: string, parametre?: Record<string, unknown>) =>
          oku(dict, anahtar).replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, ad: string) => String(parametre?.[ad] ?? '')),
      }
    },
  }
})
vi.mock('next/image', () => ({ default: () => null }))
vi.mock('@/components/ui/VentImage', () => ({ default: () => null }))
// Gerçek bölümler (BottomCTA vb.) farklı rota üreticileri okur; hangisi istenirse yol döner.
vi.mock('../../../hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () =>
    new Proxy({} as Record<string, (s?: string) => string>, { get: (_hedef, ad) => (s?: string) => `/tr/${String(ad)}/${s ?? ''}` }),
}))
vi.mock('../../../hooks/useCategoryViewModel', () => ({
  useCategoryViewModel: () => ({
    wrapCategory: (c?: { slug?: string }) => (c ? { displayName: c.slug ?? '', raw: c, imageUrl: null, description: '' } : undefined),
  }),
}))
vi.mock('@/components/navigation/Breadcrumb', () => ({ default: () => null }))
vi.mock('@/components/products/FamilyCard', () => ({ default: () => null }))
vi.mock('@/components/category/EnhancedNeedsWizard', () => ({ default: () => null }))
vi.mock('@/components/category/SilentFanWizard', () => ({ default: () => null }))

const SERI = 'vortice-lineo-quiet-sessiz-kanal-fanlari'
const DB_KODLARI = [
  '17160', '17161', '17162', '17164', '17165', '17166',
  '17170', '17171', '17172', '17174', '17175', '17176',
]

const kategoriSatiri: DbCategory = {
  id: 'cat-1',
  tenant_id: 'tenant-1',
  name: 'Duct Fans',
  slug: 'duct-fans',
  parent_id: null,
  level: 0,
  is_active: true,
  is_featured: false,
  sort_order: 0,
  image_url: null,
  seo_title: null,
  seo_desc: null,
  display_mode: null,
  menu_label: null,
  marketing_title: null,
  translation_key: null,
  description: null,
  metadata: null,
  authority_content: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}
const kategori = mapDatabaseCategoryToDomain(kategoriSatiri)

const aile: FamilyListItem = {
  id: SERI,
  name: SERI,
  slug: SERI,
  series_code: null,
  description: null,
  brand_name: null,
  category_id: 'cat-1',
  subcategory_id: null,
  cover_image_path: null,
  variant_count: 1,
  min_price: null,
  total_count: 1,
}

const OZET = sesOzetiHesapla(DB_KODLARI)

beforeAll(() => {
  if (!OZET) throw new Error('12 canlı kodlu özet kurulamadı')
})

function sayfa(lang: 'tr' | 'en', sesOzeti: SesOzeti | null): string {
  durum.lang = lang
  return renderToString(<CategoryLanding category={kategori} families={[aile]} sesOzeti={sesOzeti} />)
}

/** Sözlük cümlesinin metni (düz dize ya da `{ ses }` cümlesi). */
function duz(c: SesCumlesi): string {
  return typeof c === 'string' ? c : c.ses
}

/** HTML'i düz metne indirir (React'in bitişik metin düğümü ayracı silinir, etiketler atılır, boşluklar tek boşluk). */
function duzMetin(html: string): string {
  return html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

const SORULAR = {
  tr: [
    'Vortice Lineo Quiet nedir?',
    'Lineo Quiet ne kadar sessiz?',
    'Lineo ile Lineo Quiet arasındaki fark nedir?',
    'EC (ES) mi AC mi seçmeliyim?',
    'Hangi kumanda ve sensörler uyar?',
    'Montajı ve bakımı zor mu?',
    'Koruma sınıfı nedir?',
  ],
  en: [
    'What is Vortice Lineo Quiet?',
    'How quiet is Lineo Quiet?',
    'What is the difference between Lineo and Lineo Quiet?',
    'Should I choose EC (ES) or AC?',
    'Which controls and sensors fit?',
    'Is installation and maintenance difficult?',
    'What is the protection grade?',
  ],
} as const

const H2 = {
  tr: 'Sessiz kanal tipi fan: ses emici kaplamalı Lineo Quiet',
  en: 'Silent in-line duct fan: Lineo Quiet with sound-absorbing casing',
} as const

describe('(a) sunucu HTML: yeni H2 ve yedi soru, TR + EN', () => {
  for (const dil of ['tr', 'en'] as const) {
    it(`${dil}: H2 <h2> olarak, yedi soru ve cevapları (kapalı akordeon dahil) DOM'da`, () => {
      const html = sayfa(dil, OZET)
      expect(html).toMatch(new RegExp(`<h2[^>]*>${H2[dil]}</h2>`))
      const metin = duzMetin(html)
      for (const soru of SORULAR[dil]) expect(metin, soru).toContain(soru)
      // Cevaplar akordeonun gizli gövdesinde (max-h-0) ama DOM'da: yedi cevap bloğu, yedi kaynak notu.
      expect(html.match(/id="silent-faq-content-\d+"/g)).toHaveLength(7)
      const kaynakEtiketi = tr.categorySilentFan.ses.kaynakEtiketi
      const etiket = dil === 'tr' ? kaynakEtiketi : en.categorySilentFan.ses.kaynakEtiketi
      expect(metin.split(`${etiket}: Vortice LINEO`).length - 1, 'SSS kaynak notları + H2 kaynak notu').toBe(8)
    })

    it(`${dil}: eski üç SSS sorusunun konusu yeni listede yaşar (nedir / ne kadar sessiz / montaj)`, () => {
      const metin = duzMetin(sayfa(dil, OZET))
      const eski = dil === 'tr' ? ['Vortice Lineo Quiet nedir?', 'ne kadar sessiz', 'Montajı'] : ['What is Vortice Lineo Quiet?', 'How quiet is', 'installation']
      for (const parca of eski) expect(metin).toContain(parca)
    })
  }

  it('TR: ses sayıları veriden ve koşullu basılır (gövde 9,9 · 4 V, emiş en yüksek hız, Ø200 AC)', () => {
    const metin = duzMetin(sayfa('tr', OZET))
    expect(metin).toContain('En düşük gövde değeri 9,9 dB(A) · 4 V · gövde, 3 m (Lineo 100 Quiet ES); en yüksek gövde değeri 48,3 dB(A) · 10 V · gövde, 3 m (Lineo 315 Quiet ES).')
    expect(metin).toContain('Emiş tarafında değerler 20,2 dB(A) · 4 V · emiş, 3 m ile 58,4 dB(A) · en yüksek hız · emiş, 3 m (Lineo 315 Quiet) arasındadır.')
    expect(metin).toContain('Lineo 200 Quiet (17164, 1160 m³/h) 35,5 dB(A) · en yüksek hız · gövde, 3 m ve 48 dB(A) · en yüksek hız · emiş, 3 m;')
    expect(metin).toContain('Örnek Ø150 ES: 13,7 dB(A) · 4 V · gövde, 3 m.')
    expect(metin).toContain('En düşük değer 9,9 dB(A) · 4 V · gövde, 3 m (Lineo 100 Quiet ES).')
  })

  it('EN: ondalık nokta, EN yer ve kademe sözcükleri', () => {
    const metin = duzMetin(sayfa('en', OZET))
    expect(metin).toContain('The lowest casing value is 9.9 dB(A) · 4 V · casing, 3 m (Lineo 100 Quiet ES)')
    expect(metin).toContain('58.4 dB(A) · maximum speed · intake, 3 m (Lineo 315 Quiet)')
    expect(metin).toContain('Lineo 200 Quiet (17164, 1160 m³/h) 35.5 dB(A) · maximum speed · casing, 3 m and 48 dB(A) · maximum speed · intake, 3 m;')
    expect(metin).toContain('Example Ø150 ES: 13.7 dB(A) · 4 V · casing, 3 m.')
  })
})

describe('(b) ses sayısı koşulsuz basılmaz', () => {
  const sozlukler = { tr, en } as const

  it('sözlükte yer tutucu yalnız `{ ses }` cümlesindedir (işaretsiz dizede {{…}} yok), her `{ ses }` en az bir yer tutucu taşır', () => {
    for (const dil of ['tr', 'en'] as const) {
      const blok = sozlukler[dil].categorySilentFan
      const hepsi: SesCumlesi[] = [...blok.problem.intro, ...blok.faq.items.flatMap((s) => s.a)]
      const isaretli = hepsi.filter((c) => typeof c !== 'string')
      expect(isaretli.length, `${dil}: koşullu cümle sayısı`).toBe(6)
      for (const c of hepsi) {
        if (typeof c === 'string') expect(c, c).not.toContain('{{')
        else expect(c.ses, c.ses).toMatch(/\{\{\s*\w+\s*\}\}/)
      }
    }
  })

  it('sözlük şablonlarında "dB(A)" geçen her cümle "3 m" koşulunu taşır', () => {
    const cumleler: string[] = []
    for (const dil of ['tr', 'en'] as const) {
      const blok = sozlukler[dil].categorySilentFan
      cumleler.push(...blok.problem.intro.map(duz))
      for (const soru of blok.faq.items) cumleler.push(...soru.a.map(duz))
    }
    const sesli = cumleler.filter((c) => c.includes('dB(A)'))
    expect(sesli.length, 'tarama boş değil').toBeGreaterThan(0)
    for (const c of sesli) expect(c, c).toMatch(/\b3 m\b/)
  })

  it('doldurulmuş çıktıda da: her "dB(A)" cümlesi "3 m", her ham sayı yer tutucudan gelir (sözlükte çıplak dB sayısı yok)', () => {
    for (const dil of ['tr', 'en'] as const) {
      const blok = sozlukler[dil].categorySilentFan
      const degerler = sesYerTutucular(OZET, dil, sesEtiketSozlugu(blok.ses))
      const cikti = [...cumleleriDoldur(blok.problem.intro, degerler)]
      for (const soru of blok.faq.items) cikti.push(...cumleleriDoldur(soru.a, degerler))
      const sesli = cikti.filter((c) => c.includes('dB(A)'))
      expect(sesli.length).toBeGreaterThan(5)
      for (const c of sesli) expect(c, c).toMatch(/\b3 m\b/)
      // Üreticinin çıktısı yer tutucu değerlerinin kendisinde de koşullu: her değer yer + 3 m taşır.
      for (const [ad, deger] of Object.entries(degerler)) {
        if (/dB\(A\)/.test(deger)) expect(deger, ad).toMatch(/, 3 m$/)
      }
    }
  })

  it('sözlükte çıplak ses sayısı kalıbı yok: "<sayı> dB" yalnız katalogdan sabit 46,9 / 55,4 için ve "dB(A)" biçiminde', () => {
    for (const dil of ['tr', 'en'] as const) {
      const blok = JSON.stringify(sozlukler[dil].categorySilentFan)
      const bulunan = [...blok.matchAll(/(\d+[.,]?\d*)\s*dB/g)].map((m) => m[1]).sort()
      expect(bulunan, dil).toEqual(['46,9', '46,9', '55,4'].map((s) => (dil === 'en' ? s.replace(',', '.') : s)).sort())
    }
  })
})

describe('(c) boş kesişim: ses cümleleri çizilmez, bölümün kalanı durur', () => {
  it('özet yok: SSS ve H2 bölümünde "dB(A)" ve ham {{ad}} yok; yedi soru ve H2 yerinde', () => {
    for (const dil of ['tr', 'en'] as const) {
      const html = sayfa(dil, null)
      const metin = duzMetin(html)
      expect(metin).not.toContain('{{')
      expect(metin).not.toContain('dB(A)')
      expect(html).toMatch(new RegExp(`<h2[^>]*>${H2[dil]}</h2>`))
      for (const soru of SORULAR[dil]) expect(metin, soru).toContain(soru)
    }
  })

  it('özet yok: ses sayısı taşımayan cümleler durur (TR örnek: kaplama / çap / sürümler)', () => {
    const metin = duzMetin(sayfa('tr', null))
    expect(metin).toContain('Katalog her model ve çalışma noktası için emiş, üfleme ve gövde değerini ayrı verir.')
    expect(metin).toContain('Seri Ø100–Ø315 mm yuvarlak kanal çaplarında')
    expect(metin).toContain('Lineo Quiet’in dış gövdesinde ses emici kaplama vardır, Lineo’da yoktur.')
    expect(metin).not.toContain('En düşük gövde değeri')
    expect(metin).not.toContain('En düşük değer')
    expect(metin).not.toContain('Örnek Ø150 ES')
  })

  it('Ø200 AC ve Ø150 ES canlı değilse yalnız o örnek cümleler kalkar; gövde/emiş aralığı durur', () => {
    const ozet = sesOzetiHesapla(DB_KODLARI.filter((k) => k !== '17164' && k !== '17172'))
    const metin = duzMetin(sayfa('tr', ozet))
    expect(metin).toContain('En düşük gövde değeri')
    expect(metin).not.toContain('Lineo 200 Quiet (17164')
    expect(metin).not.toContain('Örnek Ø150 ES')
    expect(metin).not.toContain('{{')
  })

  it('cumleleriDoldur: eksik, boş ve prototip adlı yer tutucu cümleyi atar; yer tutucusuz cümle durur', () => {
    expect(cumleleriDoldur(['düz', { ses: 'a {{x}} b' }, { ses: 'c {{constructor}}' }, { ses: 'd {{y}}' }], { y: 'Y', z: '' })).toEqual(['düz', 'd Y'])
    expect(cumleleriDoldur([{ ses: '{{z}}' }], { z: '' })).toEqual([])
    // işaretsiz düz dize yer tutucu taşısa bile olduğu gibi çizilir: bu yüzden sözlükte işaretsiz {{…}} test ile yasak
    expect(cumleleriDoldur(['düz {{x}}'], {})).toEqual(['düz {{x}}'])
    expect(cumleleriDoldur([], {})).toEqual([])
  })
})

describe('(d) sözlük = veri', () => {
  it('17164: sözlükteki 1160 m³/h en yüksek debidir; 35,5 ve 48 dB(A) veri modülünün satırıdır', () => {
    const veri = (ham as { D: Record<string, { q: number[]; ad: string }> }).D['17164']
    expect(veri.ad).toBe('LINEO 200 QUIET')
    expect(veri.q.at(-1)).toBe(1160)
    const son = kademeSesTablosu('17164')?.at(-1)
    if (!son) throw new Error('17164 tablosu yok')
    const etiket = sesEtiketSozlugu(tr.categorySilentFan.ses)
    expect(sesEtiketi(son.govdeLp, 'tr', etiket)).toBe('35,5 dB(A) · en yüksek hız · gövde, 3 m')
    expect(sesEtiketi(son.emisLp, 'tr', etiket)).toBe('48 dB(A) · en yüksek hız · emiş, 3 m')
    const metin = tr.categorySilentFan.faq.items[2].a.map(duz).join(' ')
    expect(metin).toContain('(17164, 1160 m³/h)')
    expect(metin).toContain('{{q200Govde}}')
    expect(metin).toContain('{{q200Emis}}')
  })

  it('sözlük kod ve debi sabiti "17164" ve "1160" yalnız bu iki yerde (FAQ 3 + yer tutucu) ve veriyle aynı', () => {
    const veri = (ham as { D: Record<string, { q: number[] }> }).D
    expect(Object.keys(veri)).toContain('17164')
    for (const dil of [tr, en]) {
      const blok = JSON.stringify(dil.categorySilentFan)
      expect(blok.match(/17164/g)).toHaveLength(1)
      expect(blok.match(/1160/g)).toHaveLength(1)
    }
  })

  it('"4, 6, 8 ve 10 V" ES kademeleridir; 31 W (10 V) ES 150, 50 W (AC, en yüksek hız) AC 150 son güç değeridir', () => {
    expect(kademeAdlari('17172')).toEqual(['4 V', '6 V', '8 V', '10 V'])
    const veri = (ham as { D: Record<string, { W: number[]; ad: string }> }).D
    expect(veri['17172'].ad).toBe('LINEO 150 QUIET ES')
    expect(veri['17172'].W.at(-1)).toBe(31)
    expect(veri['17162'].ad).toBe('LINEO 150 QUIET')
    expect(veri['17162'].W.at(-1)).toBe(50)
    const trMetin = tr.categorySilentFan.faq.items[3].a.map(duz).join(' ')
    expect(trMetin).toContain('4, 6, 8 ve 10 V')
    expect(trMetin).toContain('31 W (10 V) ile 50 W (AC, en yüksek hız)')
    const enMetin = en.categorySilentFan.faq.items[3].a.map(duz).join(' ')
    expect(enMetin).toContain('4, 6, 8 and 10 V')
    expect(enMetin).toContain('31 W (10 V) against 50 W (AC, maximum speed)')
  })

  it('TR ve EN sözlük aynı yer tutucu adlarını taşır (cümle cümle)', () => {
    const adlar = (c: SesCumlesi) => [...duz(c).matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort().join(',')
    expect(en.categorySilentFan.problem.intro.map(adlar)).toEqual(tr.categorySilentFan.problem.intro.map(adlar))
    expect(en.categorySilentFan.faq.items.map((i) => i.a.map(adlar))).toEqual(tr.categorySilentFan.faq.items.map((i) => i.a.map(adlar)))
  })
})

/**
 * (h) İSTEMCİ DEMETİ — `CategoryLandingView` `'use client'`'tır; import kapanışına giren her modül tarayıcıya gider.
 * Ses VERİ dosyası (`lineoQuiet.veri.json`, tüm eğriler, ~54 KB) ve onu okuyan `sesVerisi.ts` sunucuda kalır; istemciye yalnız
 * JSON'suz biçimleyici (`sesEtiketi.ts`) girer. Çözümleme bilerek basit (`aileMetniLineoQuiet.test.tsx` (e) ile aynı yöntem):
 * `@/` ve göreli yollar, type-only atlanır; JSON belirteci kapanışta dosya olarak değil metin olarak aranır.
 */
const KOK = process.cwd()
const UZANTILAR = ['.ts', '.tsx']

function importBelirtecleri(kaynak: string): string[] {
  const bulunan: string[] = []
  for (const m of kaynak.matchAll(/^(?:import|export)\b(?!\s+type\b)[^'";]*?\bfrom\s*['"]([^'"]+)['"]/gm)) bulunan.push(m[1])
  for (const m of kaynak.matchAll(/^import\s*['"]([^'"]+)['"]/gm)) bulunan.push(m[1])
  return bulunan
}

function belirtecCoz(belirtec: string, kaynakDosya: string): string | null {
  let taban: string
  if (belirtec.startsWith('@/')) taban = join(KOK, 'src', belirtec.slice(2))
  else if (belirtec.startsWith('.')) taban = resolve(dirname(join(KOK, kaynakDosya)), belirtec)
  else return null
  const adaylar = [...UZANTILAR.map((u) => `${taban}${u}`), ...UZANTILAR.map((u) => join(taban, `index${u}`)), taban]
  for (const aday of adaylar) {
    if (!UZANTILAR.includes(extname(aday)) || !existsSync(aday) || !statSync(aday).isFile()) continue
    return relative(KOK, aday).replace(/\\/g, '/')
  }
  return null
}

function importKapanisi(baslangic: string): Set<string> {
  const dosyalar = new Set<string>([baslangic])
  const kuyruk = [baslangic]
  while (kuyruk.length > 0) {
    const dosya = kuyruk.pop() as string
    for (const belirtec of importBelirtecleri(readFileSync(join(KOK, dosya), 'utf8'))) {
      const hedef = belirtecCoz(belirtec, dosya)
      if (!hedef || dosyalar.has(hedef)) continue
      dosyalar.add(hedef)
      kuyruk.push(hedef)
    }
  }
  return dosyalar
}

describe('(h) istemci demeti: ham ses verisi tarayıcıya gitmez', () => {
  const SES_VERISI = 'src/data/sessizFan/sesVerisi.ts'
  const SES_ETIKETI = 'src/data/sessizFan/sesEtiketi.ts'

  it('NEGATİF KONTROL: sunucu modülü kategoriSayfasi ses verisine ULAŞIR, sesVerisi.ts JSON\'u import eder (ölçüt çalışıyor)', () => {
    const sunucu = importKapanisi('src/app/_components/kategoriSayfasi.tsx')
    expect(sunucu.has(SES_VERISI)).toBe(true)
    expect(readFileSync(join(KOK, SES_VERISI), 'utf8')).toContain('lineoQuiet.veri.json')
  })

  it('CategoryLandingView import kapanışı sesVerisi.ts\'e ve lineoQuiet.veri.json\'a girmez; JSON\'suz sesEtiketi.ts girer', () => {
    const dosyalar = importKapanisi('src/views/category/CategoryLandingView.tsx')
    expect(dosyalar.size).toBeGreaterThan(40)
    expect(dosyalar.has('src/components/category/sections/silent-fan/sesMetni.ts'), 'tarama sessiz fan bölümlerine ulaşıyor').toBe(true)
    expect(dosyalar.has(SES_ETIKETI), 'biçimleyici istemcide olmalı').toBe(true)
    // URN-135: rehber geri bağlantısı sunucuda çözülür (`rehberHref: string | null`); büyük yazı veri modülü istemciye girmez.
    for (const yasak of [SES_VERISI, 'src/data/sessizFan/sesOzeti.ts', 'src/data/sessizFan/aileMetinleri.ts', 'src/data/bilgiMerkezi/yazilar.ts', 'src/lib/bilgiMerkezi/sessizFanRehberi.ts']) {
      expect(dosyalar.has(yasak), `${yasak} istemci demetine giriyor`).toBe(false)
    }
    for (const dosya of dosyalar) {
      expect(readFileSync(join(KOK, dosya), 'utf8'), `${dosya} ham ses verisini import ediyor`).not.toMatch(/from\s*['"][^'"]*lineoQuiet\.veri\.json['"]/)
    }
  })
})

describe('(g) ses özeti prop zinciri: sunucu → görünümler → iki bölüm (kopuk halka sayıyı sessizce düşürür)', () => {
  const oku = (...parcalar: string[]) => readFileSync(join(process.cwd(), 'src', ...parcalar), 'utf8')

  it('kategoriSayfasi → CategoryPage → CategoryMasterView (iki Landing çağrısı) → CategoryLandingView → Problem + FAQ', () => {
    expect(oku('app', '_components', 'kategoriSayfasi.tsx')).toMatch(/sesOzeti=\{sesOzeti\}/)
    expect(oku('views', 'CategoryPage.tsx')).toMatch(/sesOzeti=\{sesOzeti\}/)
    expect(oku('views', 'CategoryMasterView.tsx').match(/sesOzeti=\{sesOzeti\}/g)).toHaveLength(2)
    const landing = oku('views', 'category', 'CategoryLandingView.tsx')
    expect(landing).toMatch(/<SilentFanProblem sesOzeti=\{sesOzeti\}/)
    expect(landing).toMatch(/<SilentFanFAQ sesOzeti=\{sesOzeti\}/)
  })

  it('sunucu hesabı yalnız sessiz fan serisi sayfada yapılır ve canlı kodlar önbellekli servisten gelir', () => {
    const sunucu = oku('app', '_components', 'kategoriSayfasi.tsx')
    expect(sunucu).toContain('SESSIZ_FAN_SERI_SLUGLARI')
    expect(sunucu).toMatch(/getSessizFanCanliKodlari\(supabase,/)
    // Kural 12: önbellek anahtarında lang ve tenantId bulunur.
    expect(sunucu).toMatch(/\['sessiz-fan-kodlari', lang, tenantId, familySlug\]/)
    // Hata sayfayı kırmaz: yakalanır ve null döner (ses cümleleri çizilmez).
    expect(sunucu).toMatch(/catch \(hata\)[\s\S]{0,200}sessiz fan canlı model kodları okunamadı[\s\S]{0,80}return null/)
  })
})

describe('(e) kaynak taraması: doğrulamada çıkarılan ifadeler sözlükte geri gelmez', () => {
  const YASAKLI = {
    tr: ['susturucu', 'bakım kapağı', 'yatak odası', 'toplantı odası', 'ofis', 'dört kademe', 'daha uzun', 'kabuk içindeki', 'kabuk içinde', 'sessizliğin kaynağı'],
    en: ['silencer', 'service hatch', 'maintenance hatch', 'bedroom', 'meeting room', 'office', 'four speed', 'longer', 'source of the silence', 'source of quiet'],
  } as const

  for (const dil of ['tr', 'en'] as const) {
    // Kapsam YALNIZ kategori sayfası bölümleridir: sihirbaz sözlüğü (`silentFanWizard`) mahal seçeneği olarak "yatak odası"
    // der ve bu meşrudur; yasak, katalogda dayanağı olmayan ürün iddiasıdır.
    it(`${dil}: categorySilentFan alt ağacında yasaklı ifade yok`, () => {
      const sozluk = dil === 'tr' ? tr : en
      const metin = JSON.stringify(sozluk.categorySilentFan).toLocaleLowerCase(dil === 'tr' ? 'tr-TR' : 'en-US')
      for (const ifade of YASAKLI[dil]) expect(metin, ifade).not.toContain(ifade.toLocaleLowerCase(dil === 'tr' ? 'tr-TR' : 'en-US'))
    })
  }

  it('tarama kendini doğrular: pozitif örnek yakalanır', () => {
    expect(JSON.stringify(tr.categorySilentFan).toLocaleLowerCase('tr-TR')).toContain('ses emici')
    expect(getDictValue(tr, 'categorySilentFan.problem.title')).toContain('Lineo Quiet')
  })
})
