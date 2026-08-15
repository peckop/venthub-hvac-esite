import { describe, expect, it } from 'vitest'

/**
 * INV-LEGAL-1 · Yasal onay kapısı (kalıcı bekçi) — canlıya alma denetimi K7.
 *
 * CANLI AÇIK (2026-08-15'te bulundu): checkout'ta KVKK / Mesafeli Satış / Ön Bilgilendirme /
 * sipariş onayı kutuları VARDI ama `useCheckoutOrchestrator.handleNextStep` bunları HİÇ
 * kontrol etmiyordu — `step === 3` doğrudan `initiatePayment()`'a gidiyordu. `legalConsents`
 * hepsi `false` ile başladığı için tüketici hiçbirini işaretlemeden ödemeye geçebiliyor,
 * `buildPaymentRequest` ise bunu ZAMAN DAMGASIYLA `accepted: false` olarak sipariş kaydına
 * yazıyordu: yani sistem tüketicinin kabul ETMEDİĞİNİN kaydını tutup ödemeyi alıyordu.
 *
 * Mesafeli Sözleşmeler Yönetmeliği, Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesinin
 * sözleşme kurulmadan ÖNCE teyidini zorunlu kılar. Metni yazmak yetmez, ONAYLATILMALI.
 *
 * Neden statik tarama: hook'un bağımlılıkları ağır (supabase/auth/toast/i18n) — renderHook
 * testi kırılgan olurdu. tsc/lint/build bu sınıfı GÖRMEZ (eksik `if` tip hatası değildir);
 * yalnız bu bekçi yakalar. Kapı silinirse veya zorunlu onaylardan biri listeden düşerse KIRMIZI.
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

const ORCHESTRATOR_PATH = '/src/hooks/useCheckoutOrchestrator.ts'

/** MSY gereği ödeme öncesi teyidi ZORUNLU olan onaylar. `marketing` bilinçli olarak YOK:
 *  ticari elektronik ileti onayı opsiyoneldir, zorunlu tutmak 6563'e aykırı olurdu. */
const REQUIRED_CONSENTS = ['kvkk', 'distanceSales', 'preInfo', 'orderConfirm'] as const

describe('INV-LEGAL-1 · yasal onay kapısı', () => {
  const source = SOURCES[ORCHESTRATOR_PATH]

  it('checkout orkestratörü kaynağı bulunabiliyor (stale-guard)', () => {
    // Dosya taşınır/yeniden adlandırılırsa bu test sessizce "geçmez", burada patlar.
    expect(
      source,
      `${ORCHESTRATOR_PATH} bulunamadı — dosya taşındıysa bu bekçinin yolunu güncelle, silme.`,
    ).toBeTruthy()
  })

  it('onay doğrulaması tanımlı ve dört zorunlu onayı da kapsıyor', () => {
    expect(source).toMatch(/validateLegalConsents/)

    for (const consent of REQUIRED_CONSENTS) {
      expect(
        source,
        `'${consent}' zorunlu onay listesinde yok — MSY gereği ödeme öncesi teyidi zorunlu.`,
      ).toMatch(new RegExp(`'${consent}'`))
    }
  })

  it('ödeme başlatma onaysız geçilemiyor (kapı, ödeme DALININ İÇİNDE)', () => {
    // Pencere-tabanlı arama yetersizdi: adım 2'nin kapısı yakında olduğu için ödeme dalının
    // kapısı silinse bile test geçiyordu (bilerek bozma denemesinde yakalandı).
    // Bu yüzden ödeme dalını izole edip kapıyı ORADA arıyoruz.
    const branchStart = source.indexOf('step === 3')
    expect(branchStart, "'step === 3' dalı bulunamadı — akış değiştiyse bekçiyi güncelle.").toBeGreaterThan(-1)

    const payIndex = source.indexOf('initiatePayment()', branchStart)
    expect(payIndex, 'initiatePayment çağrısı bulunamadı.').toBeGreaterThan(-1)

    const branchBody = source.slice(branchStart, payIndex)
    expect(
      branchBody,
      'Ödeme dalında (step === 3) validateLegalConsents() kapısı yok — onaysız ödeme başlatılabilir (K7 nüksetti).',
    ).toMatch(/if \(!validateLegalConsents\(\)\) return/)
  })

  it('onay kutularının bulunduğu adımdan ilerlerken de doğrulanıyor', () => {
    // Kutular StepAddressInfo'da (adım 2). Uyarı kutuların GÖRÜNDÜĞÜ adımda verilmeli,
    // yoksa kullanıcı adım 3'te sebebi göremediği bir hata alır.
    const gateCount = (source.match(/if \(!validateLegalConsents\(\)\) return/g) ?? []).length
    expect(
      gateCount,
      'Onay kapısı iki noktada olmalı: adım 2→3 geçişi (UX) ve ödeme başlatma (savunma).',
    ).toBeGreaterThanOrEqual(2)
  })

  it('onay durumları sipariş kaydına yazılmaya devam ediyor (ispat yükü)', () => {
    const builder = SOURCES['/src/views/checkout/buildPaymentRequest.ts']
    expect(builder, 'buildPaymentRequest.ts bulunamadı — taşındıysa yolu güncelle.').toBeTruthy()
    // Onayın kendisi kadar, onayın ZAMAN DAMGASIYLA kaydedilmesi de gerekir.
    expect(builder).toMatch(/distanceSales:\s*\{\s*accepted:/)
    expect(builder).toMatch(/ts:\s*new Date\(\)\.toISOString\(\)/)
  })
})
