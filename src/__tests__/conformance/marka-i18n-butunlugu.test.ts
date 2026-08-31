/**
 * INV-MARKA-I18N-1 — marka verisi iki dilli ve etiketleri sözlüğe BAĞLI kalmalı.
 *
 * NİÇİN (REC-98, 2026-08-31): `/en/brands/<slug>` canlıda Türkçe içerik gösteriyordu.
 * Sebep sözlüğün eksikliği DEĞİLDİ — arayüz çerçevesi zaten çevriliydi; marka VERİSİ
 * (`HVAC_BRANDS`, `BRAND_DETAILS`) koda tek dilli gömülüydü ve hiçbir kapı bunu görmüyordu:
 * `tsc` görmez (string, string'dir), `lint` görmez, i18n parite kapısı sözlüğe bakar,
 * veriye değil. Kusur tam bu boşlukta yaşadı.
 *
 * İKİNCİ boşluk: kurumsal özet etiketleri artık `t('brands.detail.' + labelKey)` ile
 * DİNAMİK okunuyor. Dinamik anahtarı hiçbir statik araç doğrulayamaz; yanlış yazılmış bir
 * anahtar sessizce HAM KEY render eder. Bu test o anahtarların karşılığını ölçer.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect,it } from 'vitest'

import { type BrandText,HVAC_BRANDS } from '../../data/brands'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'

const KOK = join(process.cwd(), 'src')

const ikiDilli = (v: BrandText | undefined): v is BrandText =>
  !!v && typeof v.tr === 'string' && typeof v.en === 'string'

describe('INV-MARKA-I18N-1: marka verisi iki dilli', () => {
  it('her markanın çevrilebilir alanları tr VE en taşır, ikisi de boş değildir', () => {
    const eksik: string[] = []
    for (const b of HVAC_BRANDS) {
      const alanlar: [string, BrandText | undefined][] = [
        ['description', b.description],
        ['country', b.country],
        ['headquarters', b.headquarters],
        ['specialty', b.specialty],
      ]
      for (const [ad, deger] of alanlar) {
        // headquarters/specialty isteğe bağlı: YOKSA sorun değil, VARSA iki dilli olmalı.
        if (deger === undefined) continue
        if (!ikiDilli(deger)) { eksik.push(`${b.slug}.${ad}: iki dilli değil`); continue }
        if (!deger.tr.trim()) eksik.push(`${b.slug}.${ad}.tr boş`)
        if (!deger.en.trim()) eksik.push(`${b.slug}.${ad}.en boş`)
      }
    }
    expect(eksik).toEqual([])
  })

  it('zorunlu alanlar (description, country) hiçbir markada eksik değil', () => {
    const eksik = HVAC_BRANDS
      .filter(b => !ikiDilli(b.description) || !ikiDilli(b.country))
      .map(b => b.slug)
    expect(eksik).toEqual([])
  })
})

describe('INV-MARKA-I18N-1: dinamik etiket anahtarları sözlükte karşılık bulur', () => {
  const kaynak = readFileSync(join(KOK, 'views', 'BrandDetailPage.tsx'), 'utf8')
  const anahtarlar = [...new Set([...kaynak.matchAll(/labelKey:\s*'([^']+)'/g)].map(m => m[1]))]

  it('kaynakta en az bir labelKey bulunur (ölçüt körelmesin)', () => {
    // Bu iddia KASITLI: `stats` yapısı değişip labelKey kalkarsa aşağıdaki iki test BOŞ
    // küme üzerinde koşup sessizce yeşil kalırdı — ölçüt ayırt etmeyi bırakırdı.
    expect(anahtarlar.length).toBeGreaterThan(0)
  })

  it('her labelKey TÜRKÇE sözlükte brands.detail altında tanımlı', () => {
    const detay = tr.brands.detail
    expect(anahtarlar.filter(k => !(k in detay))).toEqual([])
  })

  it('her labelKey İNGİLİZCE sözlükte brands.detail altında tanımlı', () => {
    const detay = en.brands.detail
    expect(anahtarlar.filter(k => !(k in detay))).toEqual([])
  })
})

describe('INV-MARKA-I18N-1: marka verisi render yolunda dile bağlanır', () => {
  // Kusurun asıl biçimi "veri iki dilli ama okuma yeri dili yok sayıyor" idi.
  // Bu yüzden ham alan erişimi JSX içinde YASAK: hepsi `brandText(..., lang)` üzerinden geçer.
  const dosyalar = ['BrandDetailPage.tsx', 'BrandsPage.tsx']
  const alanlar = ['description', 'country', 'specialty', 'headquarters']

  it('çevrilebilir alanlar JSX içinde doğrudan render edilmez', () => {
    const ihlal: string[] = []
    for (const dosya of dosyalar) {
      const src = readFileSync(join(KOK, 'views', dosya), 'utf8')
      for (const alan of alanlar) {
        const re = new RegExp(`\\{\\s*brand\\.${alan}\\s*\\}`, 'g')
        if (re.test(src)) ihlal.push(`${dosya}: {brand.${alan}}`)
      }
    }
    expect(ihlal).toEqual([])
  })
})
