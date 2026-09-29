// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import legalConfig, {
  legalConfigEn,
  legalGorunumEn,
  legalGorunumTr,
  SATIS_ICIN_ZORUNLU_SATICI_ALANLARI,
  satisIcinEksikSaticiAlanlari,
} from '../../config/legal'
import { odemeKarari } from '../../lib/kip/odemeKapisi'
import { CookiePolicyContentEn } from '../../views/legal/components/en/CookiePolicyContent'
import { DistanceSalesAgreementContentEn } from '../../views/legal/components/en/DistanceSalesAgreementContent'
import { KvkkContentEn } from '../../views/legal/components/en/KvkkContent'
import { PreInformationContentEn } from '../../views/legal/components/en/PreInformationContent'
import { PrivacyPolicyContentEn } from '../../views/legal/components/en/PrivacyPolicyContent'
import { TermsOfUseContentEn } from '../../views/legal/components/en/TermsOfUseContent'
import { CookiePolicyContentTr } from '../../views/legal/components/tr/CookiePolicyContent'
import { DistanceSalesAgreementContentTr } from '../../views/legal/components/tr/DistanceSalesAgreementContent'
import { KvkkContentTr } from '../../views/legal/components/tr/KvkkContent'
import { PreInformationContentTr } from '../../views/legal/components/tr/PreInformationContent'
import { PrivacyPolicyContentTr } from '../../views/legal/components/tr/PrivacyPolicyContent'
import { TermsOfUseContentTr } from '../../views/legal/components/tr/TermsOfUseContent'

/**
 * INV-SATIS-KIPI-6 (ödeme adımı satıcı bilgisi olmadan açılmaz) ve INV-LEGAL-GORUNUM-1 (ziyaretçi ham
 * `[YER_TUTUCU]` görmez) — REC-168 B, OPS hükmü 2026-09-29.
 *
 * KORUDUĞU KUSUR: (a) satış anahtarı açılınca ödeme adımı, satıcı unvanı/vergi no/MERSİS/KEP hâlâ yer tutucuyken
 * açılırdı; (b) canlı yasal sayfalarda ham `[SATICI_UNVAN]` görünüyordu (müşteriye görünen kusur).
 *
 * BU KAPI NE ÖLÇMEZ: canlı yayındaki HTML'i (birleşme sonrası ayrıca ölçülür) ve hukukçu teyidini
 * (`legalReviewCompleted` — ayrı kapı, `legal-promise-backing`).
 */
const KOK = path.resolve(__dirname, '../../..')
const oku = (yol: string) => fs.readFileSync(path.join(KOK, yol), 'utf8')

/** Zorunlu alanların hepsi DOLU bir yasal ayar (gerçek veri değil; yalnız kapı davranışını sınamak için). */
function doluAyar() {
  const dolu: Record<string, unknown> = { ...legalConfig }
  for (const alan of SATIS_ICIN_ZORUNLU_SATICI_ALANLARI) dolu[alan] = `Dolu ${alan}`
  return dolu as unknown as typeof legalConfig
}

describe('INV-SATIS-KIPI-6: ödeme adımı satıcı bilgisi olmadan açılmaz', () => {
  it('anahtar KAPALIyken satıcı bilgisi dolu olsa da ödeme kapalı', () => {
    expect(odemeKarari({ acik: false }, doluAyar())).toEqual({ acik: false, neden: 'anahtar-kapali' })
  })

  it('BUGÜNKÜ gerçek ayar (yer tutuculu): anahtar AÇILSA BİLE ödeme kapalı, eksik alanlar adıyla döner', () => {
    const karar = odemeKarari({ acik: true })
    expect(karar.acik).toBe(false)
    if (karar.acik || karar.neden !== 'satici-bilgisi-eksik') throw new Error('satıcı bilgisi eksik kararı beklenirdi')
    for (const alan of ['sellerTitle', 'taxNumber', 'mersis', 'kepAddress', 'cargoCompanies']) {
      expect(karar.eksikAlanlar, `${alan} eksik sayılmalı`).toContain(alan)
    }
  })

  it('anahtar açık + zorunlu satıcı alanları dolu → ödeme açık', () => {
    expect(odemeKarari({ acik: true }, doluAyar())).toEqual({ acik: true })
  })

  it.each(SATIS_ICIN_ZORUNLU_SATICI_ALANLARI.map((a) => [a]))(
    '%s boş / boşluk / yer tutucu olunca ödeme KAPALI (boş alanla kırmızı)',
    (alan) => {
      for (const bozuk of ['', '   ', `[${alan.toUpperCase()}]`]) {
        const ayar = { ...doluAyar(), [alan]: bozuk } as typeof legalConfig
        const karar = odemeKarari({ acik: true }, ayar)
        expect(karar.acik, `${alan}=${JSON.stringify(bozuk)} ödemeyi kapatmadı`).toBe(false)
        expect(satisIcinEksikSaticiAlanlari(ayar)).toEqual([alan])
      }
    },
  )

  it('checkout sayfası kararı `odemeKarari` ile verir; anahtara doğrudan bağlı `kip.acik ?` KALMADI', () => {
    const sayfa = oku('src/app/[lang]/checkout/page.tsx')
    expect(sayfa, 'checkout odemeKarari() çağırmıyor').toMatch(/odemeKarari\(/)
    expect(sayfa, 'ödeme adımı hâlâ yalnız anahtara bağlı: satıcı bilgisi kapısı atlanır').not.toMatch(/kip\.acik\s*\?/)
  })
})

describe('INV-LEGAL-GORUNUM-1: ziyaretçi ham [YER_TUTUCU] görmez', () => {
  it('görünüm nesnelerinde hiçbir metin alanı köşeli yer tutucu değil; dolu alanlar aynen', () => {
    for (const [ad, gorunum, ham] of [
      ['TR', legalGorunumTr, legalConfig],
      ['EN', legalGorunumEn, legalConfigEn],
    ] as const) {
      for (const [alan, deger] of Object.entries(gorunum)) {
        if (typeof deger === 'string') expect(deger, `${ad}.${alan} ham yer tutucu`).not.toMatch(/^\[[A-Z0-9_]+\]$/)
      }
      expect(gorunum.sellerTitle).toBe(
        ad === 'TR' ? 'Şirket bilgileri kuruluşla eklenecek' : 'Company details will be added upon incorporation',
      )
      // Dolu alanlar ve sayısal eşik DEĞİŞMEZ.
      expect(gorunum.refundTime).toBe(ham.refundTime)
      expect(gorunum.deliveryTime).toBe(ham.deliveryTime)
      expect(gorunum.invoiceIdentityThreshold).toBe(ham.invoiceIdentityThreshold)
    }
  })

  it('ham ayar DEĞİŞMEDİ: kapılar (satış kapısı, hukuki hazırlık) hâlâ yer tutucuyu görür', () => {
    expect(legalConfig.sellerTitle).toBe('[SATICI_UNVAN]')
    expect(satisIcinEksikSaticiAlanlari().length).toBeGreaterThan(0)
  })

  it('12 yasal metin bileşeninin HEPSİ görünüm nesnesinden okur (ham config import eden kırmızı)', () => {
    let sayi = 0
    for (const dil of ['tr', 'en'] as const) {
      const dizin = path.join(KOK, `src/views/legal/components/${dil}`)
      const bilesenler = fs.readdirSync(dizin).filter((d) => d.endsWith('Content.tsx'))
      expect(bilesenler.length, `${dil}: 6 metin bileşeni beklenirdi`).toBe(6)
      for (const dosya of bilesenler) {
        const kaynak = oku(`src/views/legal/components/${dil}/${dosya}`)
        const beklenen = dil === 'tr' ? 'legalGorunumTr' : 'legalGorunumEn'
        expect(kaynak, `${dil}/${dosya} görünüm nesnesini import etmiyor`).toMatch(
          new RegExp(`import \\{ ${beklenen} as legalConfig \\} from '@/config/legal'`),
        )
        expect(kaynak, `${dil}/${dosya} ham yasal ayarı import ediyor`).not.toMatch(
          /import\s+legalConfig\s+from|legalConfigEn\s+as\s+legalConfig/,
        )
        sayi += 1
      }
    }
    expect(sayi).toBe(12)
  })

  it('12 bileşenin GERÇEK çıktısında köşeli yer tutucu ([SATICI_UNVAN] vb.) KALMADI', () => {
    // Liste elle yazılı; yeni bileşen eklenirse yukarıdaki "6 metin bileşeni" sayımı kırmızı olur ve buraya eklenir.
    const bilesenler: Array<[string, 'tr' | 'en', React.FC<{ lang: string }>]> = [
      ['CookiePolicyTr', 'tr', CookiePolicyContentTr],
      ['DistanceSalesTr', 'tr', DistanceSalesAgreementContentTr],
      ['KvkkTr', 'tr', KvkkContentTr],
      ['PreInformationTr', 'tr', PreInformationContentTr],
      ['PrivacyPolicyTr', 'tr', PrivacyPolicyContentTr],
      ['TermsOfUseTr', 'tr', TermsOfUseContentTr],
      ['CookiePolicyEn', 'en', CookiePolicyContentEn],
      ['DistanceSalesEn', 'en', DistanceSalesAgreementContentEn],
      ['KvkkEn', 'en', KvkkContentEn],
      ['PreInformationEn', 'en', PreInformationContentEn],
      ['PrivacyPolicyEn', 'en', PrivacyPolicyContentEn],
      ['TermsOfUseEn', 'en', TermsOfUseContentEn],
    ]
    expect(bilesenler).toHaveLength(12)
    for (const [ad, lang, Bilesen] of bilesenler) {
      const html = renderToStaticMarkup(React.createElement(Bilesen, { lang }))
      expect(html.length, `${ad} boş render etti`).toBeGreaterThan(200)
      const kalan = html.match(/\[[A-Z0-9_]{3,}\]/g)
      expect(kalan, `${ad} çıktısında ham yer tutucu var: ${kalan?.join(', ')}`).toBeNull()
    }
  })
})
