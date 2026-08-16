import { describe, expect, it } from 'vitest'

import legalConfig, { legalConfigEn,unfilledLegalFields } from '@/config/legal'

/**
 * INV-LEGAL-3 · Taahhüt ↔ mekanizma bağı (kalıcı bekçi).
 * Cetvel: `docs/standards/legal-compliance-standard.md`
 *
 * NİÇİN VAR: 2026-08-15/16 denetimleri, yasal metinlerin **doğru yazılmış ama karşılığı
 * hiç yazılmamış** taahhütler taşıdığını ölçtü — "Fatura düzenlenir" (hiçbir fatura
 * üretilmiyordu), "talebiniz 30 gün içinde sonuçlandırılır" (başvuru adresi yer tutucuydu),
 * "iadeniz tamamlandı" (gerçek iade yapılmıyordu).
 *
 * Bu sınıfı hiçbir derleme veya lint göremez, çünkü ortada BOZUK kod yoktur —
 * OLMAYAN kod vardır. Statik bir test de "fatura kesiliyor mu" diye soramaz; sorabileceği
 * şey şudur: **metnin dayandığı konfigürasyon gerçekten dolu ve tutarlı mı.**
 *
 * Kapsam sınırı açıkça yazılıdır (kendini kandırmamak için): bu bekçi mekanizmanın
 * VARLIĞINI değil, taahhüdün DAYANAĞINI denetler. "Yeşil" = metin yayına hazır demek
 * DEĞİL; "kırmızı" = kesinlikle hazır değil demektir.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Cetveller `src/` dışındadır — ayrı glob gerekir. */
const DOCS: Record<string, string> = import.meta.glob('/docs/standards/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Yasal metin bileşenleri — her iki dil. */
const LEGAL_COMPONENTS = Object.entries(SOURCES).filter(([path]) =>
  /^\/src\/views\/legal\/components\/(tr|en)\/.+\.tsx$/.test(path),
)

const EN_COMPONENTS = LEGAL_COMPONENTS.filter(([path]) => path.includes('/en/'))

/** Cetvel §1 sicilinde 🔴 (karşılığı YOK) işaretli satır var mı? */
const STANDARD_PATH = 'docs/standards/legal-compliance-standard.md'

describe('INV-LEGAL-3 · taahhüt ↔ mekanizma bağı', () => {
  it('yasal metin bileşenleri bulunabiliyor (stale-guard)', () => {
    // Dosyalar taşınırsa bu bekçi sessizce "0 dosya taradım, hepsi temiz" demesin.
    expect(LEGAL_COMPONENTS.length).toBeGreaterThanOrEqual(10)
    expect(EN_COMPONENTS.length).toBeGreaterThanOrEqual(5)
  })

  // ── Kural 1 ────────────────────────────────────────────────────────────────────
  it('yer tutucu kalmışken metinler "hukukçu onaylı" ilan edilemez', () => {
    const unfilled = unfilledLegalFields()
    if (legalConfig.legalReviewCompleted) {
      expect(
        unfilled,
        `legalReviewCompleted=true ama şu alanlar hâlâ yer tutucu: ${unfilled.join(', ')}. ` +
          'Doldurulmamış alan, metinde köşeli parantezli olarak YAYINA ÇIKAR.',
      ).toEqual([])
    } else {
      // Henüz onaylanmadıysa kural uygulanmaz; yine de sayacın çalıştığını doğrula.
      expect(Array.isArray(unfilled)).toBe(true)
    }
  })

  // ── Kural 2 ────────────────────────────────────────────────────────────────────
  it('metinlerde okunan her legalConfig alanı tipte tanımlı', () => {
    const bilinen = new Set(Object.keys(legalConfig))
    const eksik: string[] = []

    for (const [path, source] of LEGAL_COMPONENTS) {
      const eslesmeler = source.match(/legalConfig\.([A-Za-z0-9_]+)/g) ?? []
      for (const ham of eslesmeler) {
        const alan = ham.replace('legalConfig.', '')
        if (!bilinen.has(alan)) eksik.push(`${path} → legalConfig.${alan}`)
      }
    }

    expect(
      eksik,
      'Yasal metin, LegalConfig tipinde OLMAYAN bir alan okuyor — sayfa `undefined` render eder:\n' +
        eksik.join('\n'),
    ).toEqual([])
  })

  // ── Kural 3 ────────────────────────────────────────────────────────────────────
  it('İngilizce metinler İngilizce konfigürasyonu okur', () => {
    // 2026-08-16 ölçümü: 6 EN dosyasının hepsi Türkçe `legalConfig`'i import ediyordu,
    // yani İngilizce sözleşmede "14 gün", "10 yıl", "Sipariş özetinde gösterilir" basıyordu.
    // Bunlar pazarlama metni değil sözleşme hükmüdür.
    const yanlisImport = EN_COMPONENTS.filter(([, source]) =>
      /import\s+legalConfig\s+from\s+['"]@\/config\/legal['"]/.test(source),
    ).map(([path]) => path)

    expect(
      yanlisImport,
      'İngilizce yasal metin Türkçe konfigürasyonu okuyor (süre/politika ifadeleri Türkçe basar). ' +
        "Doğrusu: import { legalConfigEn as legalConfig } from '@/config/legal'\n" +
        yanlisImport.join('\n'),
    ).toEqual([])
  })

  it('İngilizce konfigürasyon çevrilebilir alanları gerçekten çevirmiş', () => {
    // Türkçe süre birimi İngilizce değere sızmışsa yakala.
    const turkceKalinti = Object.entries(legalConfigEn)
      .filter(([, value]) => typeof value === 'string')
      .filter(([, value]) => /\b(gün|yıl|ay|hafta|iş günü)\b/i.test(value as string))
      .map(([key, value]) => `${key} = "${value as string}"`)

    expect(
      turkceKalinti,
      'legalConfigEn içinde Türkçe süre ifadesi kalmış — İngilizce sözleşmede Türkçe basar:\n' +
        turkceKalinti.join('\n'),
    ).toEqual([])
  })

  // ── Kural 4 ────────────────────────────────────────────────────────────────────
  it('fatura iletim süresi metne gömülmemiş, konfigürasyondan gelir', () => {
    const sozlesmeler = LEGAL_COMPONENTS.filter(([path]) =>
      path.includes('DistanceSalesAgreementContent'),
    )
    expect(sozlesmeler.length).toBe(2)

    for (const [path, source] of sozlesmeler) {
      // Fatura cümlesini içeren paragrafta süre, `legalConfig.invoiceDeliveryTime`
      // üzerinden gelmeli — sabit "7 gün"/"7 days" yazılmamalı.
      const faturaParagrafi = source
        .split('\n')
        .filter((satir) => /Fatura|The invoice/.test(satir))
        .join('\n')

      expect(
        faturaParagrafi,
        `${path}: fatura paragrafı bulunamadı — cümle taşındıysa bu bekçi körleşir.`,
      ).not.toBe('')

      expect(
        /legalConfig\.invoiceDeliveryTime/.test(faturaParagrafi),
        `${path}: fatura iletim süresi konfigürasyondan okunmuyor. Süre metne gömülürse ` +
          'değiştirildiğinde iki dil ayrışır ve taahhüt sessizce yanlışlanır.',
      ).toBe(true)
    }
  })

  it('VUK m.231/5 tavanı aşılmamış (fatura süresi en çok 7 gün)', () => {
    const gun = Number((legalConfig.invoiceDeliveryTime.match(/\d+/) ?? ['0'])[0])
    expect(gun).toBeGreaterThan(0)
    expect(
      gun,
      'VUK m.231/5: fatura, teslimden itibaren azami YEDİ gün içinde düzenlenir. ' +
        'Sözleşmeye daha uzun bir süre yazmak, kanuna aykırı bir taahhüttür.',
    ).toBeLessThanOrEqual(7)
  })

  // ── Kural 5 ────────────────────────────────────────────────────────────────────
  it('cetvel mevcut ve taahhüt sicilini taşıyor', () => {
    const cetvel = DOCS[`/${STANDARD_PATH}`]

    expect(
      cetvel,
      `${STANDARD_PATH} bulunamadı. Bu bekçinin denetlediği kuralların gerekçesi orada ` +
        'yazılıdır; cetvel silinirse test anlamını kaybeder.',
    ).toBeTypeOf('string')

    // Sicil, cetvelin çekirdeğidir: metne yeni taahhüt eklendiğinde satır eklenir.
    expect(cetvel).toContain('Taahhüt ↔ mekanizma sicili')

    // Sicilde 🔴 (karşılığı YOK) satırı varken metinler onaylı ilan edilemez.
    const kirmiziSatirlar = (cetvel as string)
      .split('\n')
      .filter((satir: string) => satir.startsWith('|') && satir.includes('🔴'))

    if (legalConfig.legalReviewCompleted) {
      expect(
        kirmiziSatirlar,
        'Sicilde karşılığı olmayan (🔴) taahhüt varken legalReviewCompleted=true olamaz:\n' +
          kirmiziSatirlar.join('\n'),
      ).toEqual([])
    }
  })
})
