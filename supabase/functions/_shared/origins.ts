// Çağıran sınıfı: yardımcı modül (uç değil) — köken (origin) allowlist'i tek kaynaktan.
//
// NİÇİN VAR (T043-VH · 2026-08-15)
//
// Ödeme yolunda köken denetimi iki yerde birden gerekiyordu ve ikisi de eksikti:
//
//   1. `iyzico-payment` — `ALLOWED_ORIGINS` boşsa köken denetimi TAMAMEN kapanıyordu
//      (`allowed.length === 0 || ...` = fail-open).
//   2. `iyzico-payment` ödeme sonrası dönülecek adresi (`successUrl`) doğrudan isteğin
//      **`Origin`/`Referer` başlığından** türetip İyzico'ya gönderiyordu; `iyzico-callback`
//      da o adresi query'den okuyup **hiçbir kontrol yapmadan** `location.replace` ile
//      açıyordu.
//
// İkisi birleşince şu zincir oluşuyordu: saldırgan `Origin: https://evil.tld` ile ödeme
// başlatır → İyzico'ya giden callback URL'ine `successUrl=https://evil.tld/...` gömülür →
// **gerçek ödeme tamamlandıktan sonra** müşterinin tarayıcısı saldırganın sayfasına
// yönlendirilir. Müşterinin "ödeme başarısız, kartınızı tekrar girin" ekranına en çok
// inanacağı an tam olarak orasıdır. Bu, CORS meselesi değil, kimlik avı vektörüdür.
//
// TASARIM KARARI — güvenlik özelliği YAPILANDIRMAYA BAĞLI OLMAMALI.
// Hiçbir ortam değişkeni tanımlı değilse bile saldırganın seçtiği adrese yönlendirme
// YAPILMAZ: allowlist boşsa istekten gelen aday tamamen yok sayılır ve yalnız ortamdan
// türetilen kanonik adres kullanılır (o da yoksa yönlendirme hiç yapılmaz).
// Alternatif olan "allowlist boşsa her şeyi reddet" tasarımı, değişken tanımsızsa ödemeyi
// tümden kırardı — güvenlik uğruna açığı kapatıp sistemi durdurmak kabul edilebilir bir
// takas değil; burada ikisine de gerek yok.

/** Bir URL/origin dizesini kanonik `scheme://host[:port]` biçimine indirger. */
export function normalizeOrigin(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim()
  if (!v) return null
  try {
    const u = new URL(v)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.origin
  } catch {
    return null
  }
}

/**
 * İzinli kökenler. Kaynak sırası ANLAMLIDIR: ilk sıradaki "kanonik" adres sayılır ve
 * istekten geçerli bir köken gelmediğinde yönlendirme onun üzerinden kurulur.
 *
 * `ALLOWED_ORIGINS` (virgüllü liste) + site adresi değişkenleri birleştirilir. Site adresi
 * de listeye girer, çünkü pratikte tek doğru köken zaten odur ve böylece `ALLOWED_ORIGINS`
 * hiç tanımlanmamış olsa bile denetim SİLAHLANIR (eski fail-open davranışının kökü buydu).
 */
export function buildAllowedOrigins(env: Record<string, string | undefined>): string[] {
  const out: string[] = []
  const push = (candidate: string | null | undefined) => {
    const n = normalizeOrigin(candidate)
    if (n && !out.includes(n)) out.push(n)
  }

  // Kanonik adres önce: liste başı = yönlendirme için varsayılan.
  push(env.PUBLIC_SITE_URL)
  push(env.FRONTEND_URL)
  push(env.SITE_URL)

  for (const part of (env.ALLOWED_ORIGINS ?? '').split(',')) push(part)

  return out
}

/**
 * İsteğin kökeni kabul edilebilir mi? Liste BOŞSA `true` döner — yani köken denetimi
 * yapılandırılmamışsa istek reddedilmez (bkz. tasarım kararı). Bu tolerans YALNIZ
 * erişim içindir; yönlendirme adresi için `pickRedirectOrigin` çok daha katıdır.
 */
export function isOriginAccepted(allowlist: readonly string[], requestOrigin: string | null | undefined): boolean {
  if (allowlist.length === 0) return true
  const n = normalizeOrigin(requestOrigin)
  return n !== null && allowlist.includes(n)
}

/**
 * Ödeme sonrası dönülecek KÖKEN. Buradaki kural katıdır ve yapılandırmadan bağımsızdır:
 *
 *   • istekten gelen köken allowlist'te ise    → o kullanılır (çok-alanlı kurulum çalışsın)
 *   • değilse / yoksa / allowlist boşsa        → kanonik adres (liste başı)
 *   • kanonik adres de yoksa                   → `null` (yönlendirme YAPILMAZ)
 *
 * İstekten gelen değer allowlist'i GEÇEMEDİĞİ sürece sonuca ASLA sızmaz. Allowlist boşken
 * `isOriginAccepted` toleranslı davranır ama burası davranmaz — erişime izin vermek başka,
 * saldırganın verdiği adrese kullanıcıyı göndermek başka şeydir.
 */
export function pickRedirectOrigin(
  allowlist: readonly string[],
  requestOrigin: string | null | undefined,
): string | null {
  const n = normalizeOrigin(requestOrigin)
  if (n && allowlist.includes(n)) return n
  return allowlist[0] ?? null
}

/**
 * Bir yönlendirme hedefinin (tam URL) izinli olup olmadığı. `iyzico-callback` query'den
 * gelen `successUrl`'ü buradan geçirir; geçemezse parametre YOK SAYILIR ve kanonik
 * adrese düşülür — parametrenin varlığı asla hedefi belirleyemez.
 */
export function isAllowedRedirectTarget(allowlist: readonly string[], target: string | null | undefined): boolean {
  const n = normalizeOrigin(target)
  return n !== null && allowlist.includes(n)
}
