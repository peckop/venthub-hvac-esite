// Çağıran sınıfı: yardımcı modül (uç değil) — gelir yolunu kesen arızayı GÖRÜNÜR kılar.
//
// NİÇİN VAR (T045-VH · 2026-08-15)
//
// Ödeme akışının iki yarısı da bağımsız olarak **fail-closed** yapıldı:
//   • ön yüz (`useCheckoutPayment`) — `validateServerCart` düşerse ödeme başlatmaz (#536)
//   • sunucu (`iyzico-payment`)     — `order-validate` düşerse ödeme başlatmaz (T041-VH)
//
// Her iki karar da tek başına DOĞRU: alternatifi, tahsil edilecek tutarı tarayıcının
// belirlemesiydi. Ama ikisi birleşince yeni bir sınıf doğdu — bir eş-Controller panodan
// tam olarak bunu işaret etti: **`order-validate` düşerse kimse satın alamaz ve kimse
// fark etmez.** İki taraf da ayrı ayrı doğru, dikiş yeri sessizce kopuyor.
//
// Sessizliğin sebebi, arızanın "hata" gibi görünmemesidir: kullanıcı bir uyarı görür ve
// vazgeçer, sunucu 502 döner ve unutur. Ortada patlayan bir şey yok, yalnız ciro yok.
// Sıfır sipariş, "bugün kimse almadı"dan ayırt edilemez.
//
// BU YÜZDEN ALARM, SENTRY'YE BAĞLI DEĞİL. `_shared/sentry.ts` `SENTRY_DSN` yoksa
// SESSİZCE hiçbir şey yapmaz ve bu projede DSN hiçbir `.env*.example` dosyasında YOK
// (`T014-VH`). Sentry'ye yaslanan bir alarm, kapatılmış bir alarmdır. Kayıt bu yüzden
// `client_errors` tablosuna yazılır: admin panelindeki **Hata Grupları** ekranı zaten
// oraya bakar, yani insanın gözünün değdiği bir yüzey.
//
// Yazma BEST-EFFORT'tur ve ASLA fırlatmaz: alarm mekanizması, alarmı kuran işlemi
// düşürmemelidir. Ama sessizce yutulmaz da — başarısız olursa `console.error` ile
// platform loglarına düşer.

const SOURCE = 'edge:revenue-path'

export type RevenueAlarmInput = {
  /** Kesintiye uğrayan işlev, ör. `iyzico-payment`. */
  fn: string
  /** Makine-okunur sebep, ör. `VALIDATION_UNAVAILABLE`. Gruplama bunun üzerinden yapılır. */
  code: string
  /** İnsan için tek cümle. */
  message: string
  /** Teşhis için ek bağlam — **kişisel veri, token, kart bilgisi KOYMA.** */
  extra?: Record<string, unknown>
}

/**
 * Gelir yolunu kesen bir arızayı kalıcı ve görünür bir yere yazar.
 *
 * `supabaseUrl`/`serviceRoleKey` çağırandan AÇIKÇA geçirilir (DI): modül düzeyinde env
 * okuyan bir yardımcı test edilemez ve import edildiği her yerde yan etki üretir.
 */
export async function raiseRevenueAlarm(
  supabaseUrl: string,
  serviceRoleKey: string,
  input: RevenueAlarmInput,
): Promise<void> {
  const line = `[${SOURCE}] ${input.fn} · ${input.code} — ${input.message}`
  // Önce platform logu: DB yazımı başarısız olsa bile iz kalsın.
  console.error(line, input.extra ?? {})

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(`[${SOURCE}] alarm KAYDEDILEMEDI: SUPABASE_URL/SERVICE_ROLE_KEY yok`)
    return
  }

  try {
    const resp = await fetch(`${supabaseUrl}/rest/v1/client_errors`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        // Mesaj SABİT bir önek taşır ki `error_groups` aynı arızayı tek grupta toplasın
        // ve ani bir artış grafikte tek çizgi olarak görünsün.
        message: `[GELIR-YOLU] ${input.fn}: ${input.code} — ${input.message}`,
        level: 'error',
        url: `edge://${input.fn}`,
        env: 'edge',
        extra: { source: SOURCE, fn: input.fn, code: input.code, ...(input.extra ?? {}) },
      }),
    })
    if (!resp.ok) {
      const detail = await resp.text().catch(() => '')
      console.error(`[${SOURCE}] alarm yazilamadi (${resp.status}): ${detail.slice(0, 200)}`)
    }
  } catch (e) {
    console.error(`[${SOURCE}] alarm yazilamadi:`, e)
  }
}
