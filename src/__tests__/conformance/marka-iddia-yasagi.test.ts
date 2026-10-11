/**
 * INV-MARKA-IDDIA-1 — marka kayıtlarında doğrulanamayan üstünlük/oran/ömür iddiası ve kaynaksız kuruluş yılı YOK
 * (URN-79, OPS karar 317, abartı taraması 2026-10-09).
 *
 * NİÇİN (ölçülmüş): `src/data/brands.ts` kayıtları üreticinin KENDİ sitesinden alınmıştı ve vitrinde şu cümleleri
 * basıyordu: "dünya lideri", "standartları belirliyor", "öncüsüdür", "enerji tüketimini %80'e varan oranda azaltır",
 * "dünyanın en geniş ürün gamı", "operatör güvenliğini koruyan uzun ömürlü çözümler", "yüksek performanslı",
 * "Yüksek Verimli Santrifüj Fanlar". Kaynak dizininde karşılığı yoktu (ya da çelişiyordu: Danfoss FC102 kataloğu
 * "%50'den fazla" diyor). Meta açıklamasındaki süzgeç (`ovguAyikla`) bunları arama sonucundan atıyordu ama kayıt, sayfa
 * gövdesi, marka listesi ve Brand JSON-LD ham metni basmaya devam ediyordu — yani süzgeç iddiayı gizledi, kaldırmadı.
 *
 * BU KAPI NE ÖLÇER: (a) kayıtlı her marka metni (açıklama, menşei, merkez, uzmanlık × TR+EN) yasak ifade listesinden
 * temiz; (b) kuruluş yılı yalnız kaynak dizininde kanıtlı markada (Vortice 1954, SEAT 1968) ve metindeki her yıl `founded`
 * ile aynı; (c) DB'den türeyen özet şablonları (`brands.detail.catalog*`) iki dilde aynı yer tutucuları taşır ve üstünlük
 * iddiası içermez.
 * ÖLÇMEDİĞİ: çizilen sayfa (→ `views/__tests__/BrandDetailPage.iddia.test.tsx`), Brand JSON-LD
 * (→ `app/__tests__/markaSayfasiIddia.test.ts`), canlı HTML (→ `scripts/seo/canli-kapi.mjs` VITRIN-IDDIA).
 */
import { describe, expect, it } from 'vitest'

import {
  izinliYillar,
  KAYNAKLI_KURULUS,
  MARKA_YASAK_IFADELER,
  WEB_ATIFLI_OLGU,
  yasakIfadeIhlalleri,
  yillariBul,
} from '../../data/__tests__/markaIddiaListesi'
import { HVAC_BRANDS } from '../../data/brands'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { ovguVarMi } from '../../lib/seo/ovguAyikla'

/** Bir markanın metin alanları: [alan yolu, değer]. İki dil ayrı satır olur. */
function markaMetinleri(b: (typeof HVAC_BRANDS)[number]): [string, string][] {
  const alanlar = { description: b.description, country: b.country, headquarters: b.headquarters, specialty: b.specialty }
  return Object.entries(alanlar).flatMap(([ad, deger]) =>
    deger ? ([[`${b.slug}.${ad}.tr`, deger.tr], [`${b.slug}.${ad}.en`, deger.en]] as [string, string][]) : [],
  )
}

describe('INV-MARKA-IDDIA-1 (a): marka kayıtları yasak iddia ifadesi taşımaz', () => {
  it('ölçüt körelmesin: liste dolu ve her marka en az bir metin alanı taşır', () => {
    expect(MARKA_YASAK_IFADELER.length).toBeGreaterThanOrEqual(10)
    for (const b of HVAC_BRANDS) expect(markaMetinleri(b).length, b.slug).toBeGreaterThan(0)
  })

  it('hiçbir markanın hiçbir metin alanı (TR+EN) yasak ifade içermez', () => {
    const ihlal: string[] = []
    for (const b of HVAC_BRANDS) {
      for (const [yol, metin] of markaMetinleri(b)) {
        for (const { ifade, neden } of yasakIfadeIhlalleri(b.slug, metin)) {
          ihlal.push(`${yol}: ${ifade} — ${neden}\n    "${metin}"`)
        }
      }
    }
    expect(ihlal, ihlal.join('\n')).toEqual([])
  })

  it('açıklama ve uzmanlık alanlarında üstünlük/kıyas kalıbı (ovguAyikla.OVGU_KALIBI) yok: süzgeç artık hiçbir şey ATMAK zorunda kalmaz', () => {
    const ihlal: string[] = []
    for (const b of HVAC_BRANDS) {
      for (const [yol, metin] of markaMetinleri(b)) {
        if (/\.(description|specialty)\./.test(yol) && ovguVarMi(metin)) ihlal.push(`${yol}: "${metin}"`)
      }
    }
    expect(ihlal, ihlal.join('\n')).toEqual([])
  })
})

describe('INV-MARKA-IDDIA-1 (b): kuruluş yılı yalnız kaynak dizininde kanıtlıysa yazılır', () => {
  it('`founded` alanı yalnız kaynaklı markada var ve kaynaktaki yıla eşit', () => {
    const ihlal = HVAC_BRANDS.flatMap((b) => {
      const kaynakli = KAYNAKLI_KURULUS[b.slug]
      if (b.founded === undefined) return kaynakli ? [`${b.slug}: kaynaklı yıl (${kaynakli.yil}) kayıttan düşmüş`] : []
      if (!kaynakli) return [`${b.slug}: founded=${b.founded} kaynak dizininde marka adıyla geçmiyor`]
      return kaynakli.yil === b.founded ? [] : [`${b.slug}: founded=${b.founded} ≠ kaynaktaki ${kaynakli.yil} (${kaynakli.kaynak})`]
    })
    expect(ihlal).toEqual([])
  })

  it('marka metinlerinde geçen her yıl, o markanın kaynaklı kuruluş yılıdır (metne gömülü "1933\'te", "2010" gibi yıllar yok)', () => {
    const ihlal: string[] = []
    for (const b of HVAC_BRANDS) {
      const izinli = izinliYillar(b.slug)
      for (const [yol, metin] of markaMetinleri(b)) {
        for (const yil of yillariBul(metin)) {
          if (!izinli.includes(yil)) ihlal.push(`${yol}: "${yil}" kaynaksız yıl — "${metin}"`)
        }
      }
    }
    expect(ihlal, ihlal.join('\n')).toEqual([])
  })
})

describe('INV-MARKA-IDDIA-1 (b2): web adresiyle atıflı olgu istisnası dar kalır (URN-82)', () => {
  it('her istisna en az bir resmî web adresi taşır ve markası kayıtlıdır', () => {
    for (const [slug, kayit] of Object.entries(WEB_ATIFLI_OLGU)) {
      expect(HVAC_BRANDS.some((b) => b.slug === slug), `${slug}: marka kaydı yok`).toBe(true)
      expect(kayit.kaynaklar.length, slug).toBeGreaterThan(0)
      for (const k of kayit.kaynaklar) expect(k, `${slug}: kaynak adresi yok`).toMatch(/^https:\/\/www\./)
    }
  })

  it('oran cümlesi yalnız şirkete atfedildiğinde serbest; atıfsız aynı oran KIRMIZI; istisnası olmayan markada KIRMIZI', () => {
    const atifliTr = 'Şirket, motor hızını ayarlayarak enerji tüketiminde %80\'e varan azalma sağlanabileceğini belirtiyor.'
    const atifsizTr = 'Enerji tüketimini %80\'e varan oranda azaltır.'
    const atifliEn = 'The company states that matching motor speed to demand can reduce energy consumption by up to 80%.'
    const atifsizEn = 'It reduces energy consumption by up to 80%.'
    expect(yasakIfadeIhlalleri('danfoss', atifliTr)).toEqual([])
    expect(yasakIfadeIhlalleri('danfoss', atifliEn)).toEqual([])
    expect(yasakIfadeIhlalleri('danfoss', atifsizTr).length).toBeGreaterThan(0)
    expect(yasakIfadeIhlalleri('danfoss', atifsizEn).length).toBeGreaterThan(0)
    expect(yasakIfadeIhlalleri('vortice', atifliTr).length).toBeGreaterThan(0)
    expect(yasakIfadeIhlalleri(undefined, atifliEn).length).toBeGreaterThan(0)
  })

  it('yıl izni yalnız tabloda: Danfoss 1933 ve 1968, kaynaklı kuruluşlu markalar kendi yılı, diğerleri hiçbir yıl', () => {
    expect(izinliYillar('danfoss').sort()).toEqual([1933, 1968])
    expect(izinliYillar('vortice')).toEqual([1954])
    expect(izinliYillar('seat')).toEqual([1968])
    expect(izinliYillar('avens')).toEqual([])
    expect(izinliYillar('nicotra-gebhardt')).toEqual([])
  })
})

describe('INV-MARKA-IDDIA-1 (c): DB\'den türeyen özet şablonları', () => {
  const anahtarlar = ['catalogSummary', 'catalogCategories', 'catalogFamilies', 'catalogFamiliesMore'] as const
  const yerTutucular = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort()

  it('dört şablon iki dilde de tanımlı, boş değil ve aynı yer tutucuları taşır', () => {
    for (const k of anahtarlar) {
      const t = tr.brands.detail[k]
      const e = en.brands.detail[k]
      expect(t.trim(), `tr ${k}`).not.toBe('')
      expect(e.trim(), `en ${k}`).not.toBe('')
      expect(yerTutucular(e), `${k} yer tutucuları tr ↔ en`).toEqual(yerTutucular(t))
      expect(yerTutucular(t).length, `${k} yer tutucusuz`).toBeGreaterThan(0)
    }
  })

  it('şablonlar üstünlük/kıyas iddiası ve yasak ifade taşımaz (yalnız katalogdaki olgu)', () => {
    for (const k of anahtarlar) {
      for (const [dil, metin] of [['tr', tr.brands.detail[k]], ['en', en.brands.detail[k]]] as const) {
        expect(ovguVarMi(metin), `${dil} ${k}: ${metin}`).toBe(false)
        for (const { ifade } of MARKA_YASAK_IFADELER) expect(ifade.test(metin), `${dil} ${k}: ${ifade}`).toBe(false)
      }
    }
  })
})
