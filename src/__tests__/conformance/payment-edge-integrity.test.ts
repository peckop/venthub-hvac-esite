import { describe, expect, it } from 'vitest'

/**
 * INV-PAY-2 · Ödeme yolunun **edge yarısı** — `T041` / `T042` / `T043` / `T045`.
 *
 * Kardeşi `payment-integrity.test.ts` (INV-PAY-1) ön yüzü (`src/**`) kilitler; bu dosya
 * `supabase/functions/**` tarafını kilitler. İkisi ayrı olmak zorunda: edge kaynakları
 * proje `tsconfig`'inde DEĞİL, yani `tsc` onları hiç görmez; `deno check` de tip bakar,
 * anlam bakmaz. Aşağıdaki dördü de derlenen, testleri yeşil bırakan, **çalışan** koddu.
 *
 *  1) **`order-validate` service_role ile çağrılıyordu** (`T041`). O uç kimliği token'dan
 *     alır (`auth.getUser`); service_role'ün `sub` claim'i yoktur → her çağrı 401. `if
 *     (vResp.ok)` bunu sessizce atlıyor, akış istemcinin `cartItems` fiyatlarına düşüyordu:
 *     **tahsil edilecek tutarı tarayıcı belirliyordu.**
 *  2) **`successUrl` doğrulanmadan yönlendiriliyordu** (`T043`). Değer isteğin `Origin`
 *     başlığından türetilip İyzico'ya gönderiliyor, callback de kontrolsüz açıyordu →
 *     gerçek ödemeden hemen sonra kimlik avı sayfasına yönlendirme.
 *  3) **`paid`/`failed` yanlış kolona yazılıyordu** (`T042`). Prod'dan ölçüldü: bu ikisi
 *     `payment_status` sözlüğüne ait; `status` kısıtı reddediyordu. Başarısız dalda geri
 *     dönüş olmadığı için reddedilen ödeme sonsuza kadar `pending` kalıyordu.
 *  4) **Fail-closed sessizdi** (`T045`). Ödemenin iki yarısı da bağımsız olarak
 *     fail-closed yapıldı; ikisi birleşince `order-validate` düşerse kimse satın alamaz ve
 *     **kimse fark etmez**. İki taraf da ayrı ayrı doğru, dikiş yeri sessizce kopuyor.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
    glob(
      pattern: readonly string[],
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

// `!` deseni ŞART (filtre yetmez): eager glob içeriği filtre çalışmadan okur.
// tests/e2e/helpers/denoRuntime.ts, _shared/ içine geçici `*.compiled.<rastgele>.ts`
// yazıp siler; paralel vitest'te glob o dosyayı görüp okuyamadan kaybediyordu (ENOENT).
const RAW: Record<string, string> = import.meta.glob(
  ['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
)

const SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries(RAW).map(([p, src]) => [p.replace(/^\//, ''), src]),
)

const PAYMENT = 'supabase/functions/iyzico-payment/index.ts'
const CALLBACK = 'supabase/functions/iyzico-callback/index.ts'
const ORIGINS = 'supabase/functions/_shared/origins.ts'
const ALARM = 'supabase/functions/_shared/revenue_alarm.ts'

/**
 * Yorum satırları ayıklanır. Bu dosyalardaki gerekçe blokları hatalı kalıbı BİLEREK
 * alıntılıyor ("eskiden `patchStatus('failed')` yazıyordu") — ham metinde arasak
 * kendi belgemiz yüzünden kırmızı yanardık.
 */
function kod(src: string): string {
  return src
    .split('\n')
    .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
    .join('\n')
}

describe('INV-PAY-2 · ödeme yolu (edge)', () => {
  it('bekçinin izlediği dosyalar duruyor (stale-guard)', () => {
    for (const p of [PAYMENT, CALLBACK, ORIGINS, ALARM]) {
      expect(SOURCES[p], `${p} bulunamadı — taşındıysa bekçinin yolunu güncelle, SİLME.`).toBeTruthy()
    }
    // Glob boşalırsa aşağıdaki her kural boş kümede "ihlal yok" der.
    expect(Object.keys(SOURCES).length).toBeGreaterThan(20)
  })

  it('T041 · order-validate çağrısı service_role ile yapılmıyor', () => {
    const src = kod(SOURCES[PAYMENT])
    const idx = src.indexOf('order-validate')
    expect(idx, 'order-validate çağrısı bulunamadı — akış değiştiyse bekçiyi güncelle.').toBeGreaterThan(-1)

    // Çağrıyı kuran bloğun başlıkları: service_role oradaysa kimlik yine yanlıştır.
    const blok = src.slice(Math.max(0, idx - 600), idx + 400)
    expect(
      /Authorization[^\n]*serviceRoleKey/.test(blok),
      'order-validate service_role ile çağrılıyor. O uç kimliği TOKEN\'dan alır; ' +
        'service_role\'ün `sub` claim\'i yoktur → çağrı HER ZAMAN 401 döner ve fiyat ' +
        'doğrulaması sessizce hiç çalışmaz. Çağıranın kendi doğrulanmış JWT\'sini ilet.',
    ).toBe(false)
    expect(
      blok,
      'order-validate çağrısı isteğin Authorization başlığını iletmiyor.',
    ).toMatch(/Authorization['"\s:]+[^\n]*(callerAuth|headers\.get\(\s*['"]Authorization)/)
  })

  it('T041 · istemcinin sepet fiyatlarına düşen yedek yol YOK', () => {
    const src = kod(SOURCES[PAYMENT])
    // Eski yedek yol: cartItems -> unit_price eşlemesi ile otoriter listeyi kurmak.
    expect(
      /authoritativeItems\s*=\s*\(?\s*cartItems/.test(src) ||
        /cartItems[\s\S]{0,200}?unit_price:\s*Number\(\s*ci\.price/.test(src),
      'Sunucu doğrulaması başarısızken istemcinin `cartItems` fiyatlarına düşülüyor. ' +
        'Bu, tahsil edilecek tutarı tarayıcıya bırakır. Doğrulama yapılamıyorsa ödeme ' +
        'BAŞLAMAMALI (fail-closed).',
    ).toBe(false)
  })

  it('T041 · doğrulama başarısızlığı ödemeyi DURDURUYOR (fail-closed)', () => {
    const src = kod(SOURCES[PAYMENT])
    expect(
      src,
      'Doğrulama erişilemediğinde erken dönüş yok — akış devam ediyor demektir.',
    ).toMatch(/VALIDATION_UNAVAILABLE/)
    expect(
      src,
      'Sunucu sepeti boşken ödeme durdurulmuyor. `order-validate` boş sepette 200 + ' +
        '`items: []` döner; bu da bir RET sebebidir, aksi hâlde eski yedek yol geri gelir.',
    ).toMatch(/VALIDATION_EMPTY_CART/)
  })

  it('T045 · fail-closed dalları SESSİZ değil (gelir alarmı)', () => {
    const src = kod(SOURCES[PAYMENT])
    expect(
      src,
      'Fail-closed dalında alarm yok. Ödemenin iki yarısı da fail-closed olduğu için ' +
        '`order-validate` düşerse kimse satın alamaz ve KİMSE FARK ETMEZ — sıfır sipariş, ' +
        '"bugün kimse almadı"dan ayırt edilemez. `raiseRevenueAlarm` ile görünür kıl.',
    ).toMatch(/raiseRevenueAlarm/)

    // Alarm Sentry'ye yaslanmamalı: SENTRY_DSN bu projede hiçbir .env*.example'da YOK,
    // yani DSN'e bağlı bir alarm kapatılmış alarmdır.
    const alarm = kod(SOURCES[ALARM])
    expect(
      /SENTRY_DSN/.test(alarm),
      'Gelir alarmı SENTRY_DSN\'e bağlanmış. DSN yoksa `sentry.ts` sessizce hiçbir şey ' +
        'yapmaz ve alarm ölür. Kalıcı bir yüzeye yaz (`client_errors`).',
    ).toBe(false)
    expect(alarm, 'Alarm kalıcı bir yüzeye yazmıyor.').toMatch(/client_errors/)
  })

  it('T042 · `paid`/`failed` `status` kolonuna YAZILMIYOR', () => {
    // Prod'dan ölçüldü: venthub_orders_status_check bu ikisini kabul etmez; onlar
    // `payment_status` sözlüğüne aittir.
    const src = kod(SOURCES[CALLBACK]).replace(/payment_status/g, '__ps__')
    expect(
      /\bstatus\s*:\s*['"](paid|failed)['"]/.test(src),
      '`status` kolonuna `paid`/`failed` yazılıyor. DB kısıtı bunu REDDEDER: başarı ' +
        'dalında sessiz bir yeniden-deneme, başarısızlık dalında ise kalıcı `pending` ' +
        'üretir. Değerleri ait oldukları kolona yaz.',
    ).toBe(false)
  })

  it('T042 · callback ödeme durumunu GERÇEKTEN yazıyor (iki dalda da)', () => {
    const src = kod(SOURCES[CALLBACK])
    expect(
      src,
      'Callback `payment_status` yazmıyor. Ön yüzdeki iki yoklayıcı bu kolonu okur; ' +
        'yazılmazsa ne başarı ne başarısızlık tespit edilebilir.',
    ).toMatch(/payment_status:\s*['"]paid['"]/)
    expect(
      src,
      'Başarısız ödeme işaretlenmiyor — sipariş sonsuza kadar `pending` görünür.',
    ).toMatch(/payment_status:\s*['"]failed['"]/)
  })

  it('T043 · yönlendirme hedefi doğrulanmadan kullanılmıyor', () => {
    const src = kod(SOURCES[CALLBACK])

    // Ham `searchParams.get('successUrl')` sonucu doğrudan bir değişkene atanıp
    // hedef olarak kullanılamaz; allowlist kapısından geçmelidir.
    const hamKullanim = /=\s*url\.searchParams\.get\(\s*['"]successUrl['"]\s*\)/.test(src)
    expect(
      hamKullanim,
      'Query\'den gelen `successUrl` doğrulanmadan kullanılıyor. O değer isteğin `Origin` ' +
        'başlığından türer ve saldırganın kontrolündedir: gerçek ödemeden SONRA müşteri ' +
        'saldırganın sayfasına yönlendirilir. `safeRedirect` ile allowlist\'ten geçir.',
    ).toBe(false)

    expect(src, 'Callback allowlist kapısını kullanmıyor.').toMatch(/safeRedirect\s*\(/)
    expect(src, 'Callback allowlist kurmuyor.').toMatch(/buildAllowedOrigins\s*\(/)
  })

  it('T043 · ödeme ucu köken denetimini yapılandırmaya bırakmıyor', () => {
    const src = kod(SOURCES[PAYMENT])
    expect(
      /allowed\.length\s*===\s*0\s*\|\|/.test(src),
      'Köken denetimi `ALLOWED_ORIGINS` boşken tamamen kapanıyor (fail-open). Allowlist ' +
        'site adresi değişkenlerinden de kurulmalı ki denetim kendiliğinden silahlansın.',
    ).toBe(false)
    expect(src, 'Ödeme ucu ortak allowlist modülünü kullanmıyor.').toMatch(/buildAllowedOrigins\s*\(/)
    expect(
      src,
      'Yönlendirme kökeni allowlist\'ten seçilmiyor — ham başlık sızabilir.',
    ).toMatch(/pickRedirectOrigin\s*\(/)
    expect(
      /clientOrigin\s*=\s*req\.headers\.get/.test(src),
      'Yönlendirme kökeni doğrudan `Origin` başlığından alınıyor.',
    ).toBe(false)
  })

  it('kendi kendini doğrular: yorum ayıklayıcı gerekçe bloklarını ELİYOR', () => {
    // Bu dosyaların başlıkları hatalı kalıbı bilerek alıntılıyor. Ayıklayıcı bozulursa
    // kurallar kendi belgemiz yüzünden kırmızı yanar ve kimse sebebini anlamaz.
    const ornek = [
      "// eskiden status: 'failed' yaziliyordu",
      " * `Authorization: Bearer ${serviceRoleKey}` ile cagriliyordu",
      "const x = 1",
    ].join('\n')
    const temiz = kod(ornek)
    expect(temiz).not.toMatch(/status:\s*'failed'/)
    expect(temiz).not.toMatch(/serviceRoleKey/)
    expect(temiz).toMatch(/const x = 1/)
  })
})
