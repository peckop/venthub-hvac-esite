import { describe, expect, it } from 'vitest'

/**
 * INV-PAY-1 · Ödeme yolunun sessiz-çürüme kapıları — `T041-VH` / `T042-VH` / `T044-VH`.
 *
 * Kaynak: `docs/audits/odeme-yolu-denetimi-2026-08-15.md`. Aşağıdaki dördü de **aynı sınıftan**:
 * kod derlenir, testler yeşil kalır, kimse fark etmez — çünkü hiçbiri tip hatası değil.
 *
 *  1) **Sunucu doğrulaması anon anahtarla çağrılıyordu.** `order-validate` kimliği token'dan
 *     alır; anon anahtarın `sub` claim'i yoktur → HER çağrı 401 (ölçüldü, kontrol gruplu).
 *     Yani fiyat doğrulaması hiç çalışmadı.
 *  2) **Hata yutuluyordu.** Çağıran `console.warn` deyip yerel toplamla devam ediyordu →
 *     tahsil edilecek tutarı tarayıcı belirliyordu.
 *  3) **`status === 'paid'` imkânsız bir karşılaştırmaydı.** `venthub_orders_status_check`
 *     yalnız pending/confirmed/processing/shipped/delivered/cancelled kabul ediyor (prod'dan
 *     doğrulandı 2026-08-15) — `paid`/`failed` `payment_status` kolonunun değerleri.
 *     İki kurtarma düzeneği de bu yüzden ölüydü.
 *  4) **`if (isTest) return true`** ödeme akışını testte hiç çalıştırmıyordu; üç bulgunun
 *     birden fark edilmeden yaşamasının sebebi buydu.
 *
 * Bu bekçi statik kaynak taraması yapar. `tsc`/`lint`/`build` bu sınıfı GÖRMEZ.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const RAW: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Anahtar biçimine güvenme (bazı desenler baştaki `/` olmadan döndürüyor). */
const SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries(RAW).map(([p, src]) => [p.replace(/^\//, ''), src]),
)

const ORDER_LIB = 'src/lib/order.ts'
const PAYMENT_HOOK = 'src/hooks/useCheckoutPayment.ts'
const WATCHER = 'src/components/PaymentWatcher.tsx'

/** Yorum satırları hariç. Gerekçe blokları hatalı kalıbı bilerek alıntılıyor. */
function kod(src: string): string {
  return src
    .split('\n')
    .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
    .join('\n')
}

describe('INV-PAY-1 · ödeme yolu bütünlüğü', () => {
  it('bekçinin izlediği dosyalar duruyor (stale-guard)', () => {
    for (const p of [ORDER_LIB, PAYMENT_HOOK, WATCHER]) {
      expect(SOURCES[p], `${p} bulunamadı — taşındıysa bekçinin yolunu güncelle, silme.`).toBeTruthy()
    }
  })

  it('sunucu doğrulaması anon anahtarla çağrılmıyor', () => {
    const src = kod(SOURCES[ORDER_LIB])
    expect(
      /ANON_KEY/.test(src),
      'order.ts anon anahtar kullanıyor. `order-validate` kimliği TOKEN\'dan alır; anon ' +
        'anahtarın `sub` claim\'i yoktur → her çağrı 401 döner ve doğrulama sessizce hiç ' +
        'çalışmaz. `supabase.functions.invoke` kullan (oturum JWT\'sini kendisi ekler).',
    ).toBe(false)
    expect(src, 'order.ts `functions.invoke` ile çağırmıyor.').toMatch(/functions\.invoke/)
  })

  it('doğrulama hatası YUTULMUYOR — ödeme fail-closed', () => {
    const src = kod(SOURCES[PAYMENT_HOOK])

    // `validateServerCart` çağrısını içeren catch bloğu sessizce geçemez.
    const callIndex = src.indexOf('validateServerCart(')
    expect(callIndex, 'validateServerCart çağrısı bulunamadı — akış değiştiyse bekçiyi güncelle.').toBeGreaterThan(-1)

    // Çağrıdan sonraki ilk catch bloğunun gövdesi bir throw içermeli.
    const catchIndex = src.indexOf('catch', callIndex)
    expect(catchIndex, 'validateServerCart bir hata yolu olmadan çağrılıyor.').toBeGreaterThan(-1)
    const catchBody = src.slice(catchIndex, catchIndex + 260)
    expect(
      catchBody,
      'Doğrulama hatası yutuluyor. Sunucu fiyatı doğrulanamıyorsa ödeme BAŞLAMAMALI — ' +
        'aksi hâlde tahsil edilecek tutarı tarayıcı belirler.',
    ).toMatch(/throw/)
    expect(
      /console\.warn\([^)]*validateServerCart/.test(src),
      'Doğrulama hatası `console.warn` ile geçiştiriliyor (eski davranış geri geldi).',
    ).toBe(false)
  })

  it('sipariş durumu `payment_status` üzerinden okunuyor, `status` üzerinden değil', () => {
    // `status === 'paid'` / `'failed'` DB kısıtı gereği ASLA doğru olamaz.
    const YASAK = /\bstatus\s*===\s*['"](paid|failed)['"]/
    const ihlal = [PAYMENT_HOOK, WATCHER]
      .filter((p) => YASAK.test(kod(SOURCES[p]).replace(/payment_status/g, '__ps__')))

    expect(
      ihlal,
      `İmkânsız durum karşılaştırması: ${ihlal.join(', ')}. venthub_orders_status_check ` +
        "yalnız pending/confirmed/processing/shipped/delivered/cancelled kabul ediyor; " +
        "'paid'/'failed' payment_status kolonunun değerleridir. Bu koşul hiç gerçekleşmez " +
        've kurtarma düzeneği sessizce ölür.',
    ).toEqual([])

    for (const p of [PAYMENT_HOOK, WATCHER]) {
      expect(SOURCES[p], `${p} payment_status okumuyor.`).toMatch(/payment_status/)
    }
  })

  it('bekleyen sipariş anahtarı gerçekten YAZILIYOR', () => {
    // Watcher'ın tetikleyicisi. Kimse yazmazsa bileşen hiç başlamaz (eski hâli buydu).
    expect(
      kod(SOURCES[PAYMENT_HOOK]),
      'PENDING_ORDER_KEY hiçbir yerde setItem edilmiyor — PaymentWatcher hiç çalışmaz.',
    ).toMatch(/localStorage\.setItem\(\s*PENDING_ORDER_KEY/)

    // Anahtar adı tek kaynaktan gelmeli; iki tarafta ayrı literal = sessiz ayrışma.
    expect(
      kod(SOURCES[WATCHER]),
      'PaymentWatcher anahtarı kendi literalinden okuyor — tek kaynaktan import etmeli.',
    ).toMatch(/PENDING_ORDER_KEY/)
  })

  it('ödeme akışı testte kısa devre yapmıyor', () => {
    expect(
      /if\s*\(\s*isTest\s*\)\s*return\s+true/.test(kod(SOURCES[PAYMENT_HOOK])),
      '`if (isTest) return true` geri geldi. Bu satır ödeme akışını testte hiç ' +
        'çalıştırmaz, her testi sahte "başarılı" ile geçirir ve tüm hunideki kapıları ' +
        'işlevsiz kılar (T044-VH).',
    ).toBe(false)
  })
})
