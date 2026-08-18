import { describe, expect, it } from 'vitest'

/**
 * INV-FXLOCK-CRUD-1 · Kur kilidi yazma yüzeyinin değişmezleri (FX-LOCK 2/2b).
 *
 * Cetvel: `docs/standards/pricing-standard.md` §8 · karar [D].
 *
 * NİÇİN STATİK TARAMA: aşağıdaki kurallar davranış testiyle de ölçülüyor
 * (`fxLockAdmin.service.test.ts`), ama o testler kararın KENDİSİNİ ölçer.
 * Buradaki kapı, kararın ETRAFINDAN dolaşılmasını engeller: yarın biri forma
 * "kuru elle gir" alanı eklerse ya da ikinci bir kur kaynağı import ederse,
 * davranış testleri yeşil kalır — çünkü onlar o yeni yolu hiç görmez.
 *
 * ÖLÇMEDİĞİ ŞEY (adıyla): bu dosya RENDER'ı çalıştırmaz. "Reddedilen kapsamda
 * Kaydet düğmesi gerçekten pasif mi" sorusunu ölçmez; onu ancak bir DOM testi
 * ya da canlı deneme cevaplar.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const ALL: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const MODAL_PATH = '/src/components/admin/pricing/PricingPolicyFormModal.tsx'
const SERVICE_PATH = '/src/lib/services/fxLockAdmin.service.ts'

/** Yorumları at — kuralı ANLATAN yorum, kuralın İHLALİ sayılmasın. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')
}

const modal = stripComments(ALL[MODAL_PATH] ?? '')
const service = stripComments(ALL[SERVICE_PATH] ?? '')

describe('INV-FXLOCK-CRUD-1 · kapsam (stale-guard)', () => {
  it('iki dosya da BULUNDU ve boş değil', () => {
    /* Yol yazım hatası bu dosyadaki HER testi sessizce "temiz"e çevirirdi. */
    expect(modal.length, `${MODAL_PATH} okunamadı`).toBeGreaterThan(500)
    expect(service.length, `${SERVICE_PATH} okunamadı`).toBeGreaterThan(300)
  })
})

describe('INV-FXLOCK-CRUD-1 · dondurulan kur ELLE girilmez', () => {
  it('formda `fx_frozen_rate` bir girdiye bağlanmıyor', () => {
    /* Kur bir tercih değil ÖLÇÜMDÜR. Elle girilebilir olsaydı kilidin künyesi
       uydurulabilir olurdu ve "bu fiyat neden güncellenmedi" sorusunun cevabı
       denetlenemezdi. */
    const bound = /<input[^>]*(?:frozenRate|fx_frozen_rate)/i.test(modal)
    expect(
      bound,
      'Dondurulan kur bir form girdisine bağlanmış. Kur `resolveFxLockFreeze` ile ÇÖZÜLÜR;\n' +
        'elle girilen bir künye kilidi denetlenemez kılar (pricing-standard §8, karar [D]).',
    ).toBe(false)
  })

  it('form KENDİ kur kaynağını kurmuyor — `resolveFxRate` doğrudan import edilmiyor', () => {
    /* İkinci bir kur yolu, arayüzle motorun sessizce ayrışması demektir
       (INV-PRICE-8: tek çözücü). Form kararı servisten alır, kuru kendi çözmez. */
    expect(
      /from '@\/lib\/services\/fxRate\.service'/.test(modal),
      'Form doğrudan `fxRate.service` import ediyor — ikinci kur kaynağı doğar.\n' +
        'Kur yalnız `resolveFxLockFreeze` üzerinden gelmelidir.',
    ).toBe(false)
    expect(
      /resolveFxLockFreeze/.test(modal),
      'Form kararı `resolveFxLockFreeze` ile almalı.',
    ).toBe(true)
  })
})

describe('INV-FXLOCK-CRUD-1 · kayıt anında YENİDEN ölçüm', () => {
  it('`resolveFxLockFreeze` en az İKİ yerde çağrılıyor (önizleme + kayıt)', () => {
    /* Tek çağrı kalırsa yazan taraf önizlemenin BAYAT sonucunu kullanıyor
       demektir: kapsam ya da kur aradan geçen sürede değişmişse sessizce
       yanlış künye yazılır. */
    const calls = modal.match(/resolveFxLockFreeze\s*\(/g) ?? []
    expect(
      calls.length,
      'Beklenen: en az 2 çağrı (önizleme + kaydederken yeniden ölçüm).\n' +
        `Bulunan: ${calls.length}. Tek çağrı, kaydın bayat önizlemeye güvendiğine işarettir.`,
    ).toBeGreaterThanOrEqual(2)
  })
})

describe('INV-FXLOCK-CRUD-1 · karar servisi kapsamı KENDİ sorgulamıyor', () => {
  it('servis `products` tablosunu doğrudan sorgulamıyor', () => {
    /* Kapsam çözümü (marka ADIYLA, kategori ALT-AĞACIYLA) tek kaynakta yaşar.
       Servis kendi sorgusunu yazsaydı üçüncü bir kopya doğar ve motorla
       arayüzün cevabı zamanla ayrışırdı. */
    expect(
      /\.from\(\s*['"]products['"]\s*\)/.test(service),
      'Karar servisi `products` tablosunu doğrudan sorguluyor — kapsam mantığının\n' +
        'ikinci kopyası. `distinctPurchaseCurrenciesInScope` kullanılmalı.',
    ).toBe(false)
    expect(
      /distinctPurchaseCurrenciesInScope/.test(service),
      'Karar servisi kapsam para birimlerini paylaşılan yardımcıdan almalı.',
    ).toBe(true)
  })
})
