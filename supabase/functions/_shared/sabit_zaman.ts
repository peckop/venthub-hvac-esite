// supabase/functions/_shared/sabit_zaman.ts
//
// NİÇİN BU DOSYA VAR (karne 2026-11 K4 · cetvel §3.5 · E17)
// ---------------------------------------------------------
// `===` ilk farklı baytta döner; yanıt süresi beklenen sırrın önekini ölçülebilir kılar.
// Sabit zamanlı karşılaştırma `_shared/caller.ts` içinde vardı ama dışa açık değildi; bu
// yüzden `shipping-webhook`, `returns-webhook`, `release-expired-reservations` ve
// `order-housekeeping` aynı işi `===` ile yapıyordu. Disiplin tek yerdeydi, uçlara
// yayılmamıştı. Artık tek kaynak burası; `edge-security.test.ts` R14 kuralı sır adı taşıyan
// her `===`/`!==` karşılaştırmasını kırmızı yakar.

/**
 * Sabit zamanlı dize karşılaştırması. Uzunluk farkı da zamanlamaya sızmasın diye döngü
 * UZUN olanın boyunda döner ve uzunluk farkı biriktirilen farka XOR'lanır.
 */
export function timingSafeEquals(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const left = encoder.encode(a)
  const right = encoder.encode(b)
  let diff = left.length ^ right.length
  const length = Math.max(left.length, right.length)
  for (let i = 0; i < length; i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0)
  }
  return diff === 0
}

/** Ham gövdenin HMAC-SHA256 imzası, base64. */
async function hmacSha256Base64(secret: string, raw: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw))
  return btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
}

/**
 * Webhook imzası doğru mu? `sha256=` öneki kabul edilir. Sır ya da imza boşsa `false`
 * (fail-closed, cetvel §3.5). Karşılaştırma sabit zamanlıdır.
 */
export async function hmacImzaGecerli(
  secret: string,
  raw: string,
  signatureHeader: string,
): Promise<boolean> {
  if (!secret || !signatureHeader) return false
  try {
    const hesaplanan = await hmacSha256Base64(secret, raw)
    const gelen = signatureHeader.trim().replace(/^sha256=/i, '')
    return timingSafeEquals(gelen, hesaplanan)
  } catch {
    return false
  }
}

/**
 * `Authorization: Bearer <x>` başlığı tam olarak verilen anahtarı mı taşıyor?
 * Başlık ya da anahtar boşsa `false`. Sabit zamanlı.
 */
export function bearerEsitMi(authHeader: string | null, anahtar: string): boolean {
  if (!authHeader || !anahtar) return false
  const gelen = authHeader.replace(/^Bearer\s+/i, '').trim()
  return timingSafeEquals(gelen, anahtar)
}

/**
 * Webhook imzasının kapsadığı metin (ALT-138): `<zaman>.<olay kimliği>.<ham gövde>`.
 *
 * NİÇİN: imza yalnız gövdeyi kapsarken zaman damgası ve olay kimliği imzasızdı. Yakalanmış
 * geçerli bir istek, başlıkları TAZE bir zamanla ve yeni bir olay kimliğiyle değiştirilerek
 * sınırsız tekrar oynatılabiliyordu: replay penceresi de tekilleştirme de saldırganın elindeydi.
 * Üçü birlikte imzalanınca zamanı ya da kimliği değiştirmek imzayı bozar.
 *
 * Zaman ve kimlik başlıkta GELDİĞİ gibi (kırpılmış) imzalanır; sayıya çevirip yeniden yazmak
 * gönderenle bizim aynı baytları imzalamamızı bozardı.
 */
export function webhookImzaMetni(zaman: string, olayKimligi: string, ham: string): string {
  return `${zaman}.${olayKimligi}.${ham}`
}

/**
 * Zaman + olay kimliği + gövdeyi kapsayan webhook imzası doğru mu? Herhangi biri boşsa `false`
 * (fail-closed): imzasız alanla imza doğrulanmış sayılmaz.
 *
 * Zaman ve olay kimliği NOKTA içeremez: içerebilseydi `<zaman>.<olay>.<gövde>` metni birden çok
 * biçimde bölünürdü. Örnek: `2026-11-04T10:00:00.000Z` + `e1` için imzalanan metin, zaman
 * `2026-11-04T10:00:00` ve olay `000Z.e1` olarak da okunur; aynı imzayla YENİ bir olay kimliği
 * üretilir ve tekilleştirme atlatılırdı. İki alan noktasızken bölünme tektir (gövde son alandır).
 * Bu yüzden imzalı yolda zaman ya epoch milisaniye ya da kesirsiz ISO'dur (`2026-11-04T10:00:00Z`).
 */
export function webhookImzaGecerli(
  secret: string,
  zaman: string,
  olayKimligi: string,
  ham: string,
  signatureHeader: string,
): Promise<boolean> {
  if (!zaman || !olayKimligi) return Promise.resolve(false)
  if (zaman.includes('.') || olayKimligi.includes('.')) return Promise.resolve(false)
  return hmacImzaGecerli(secret, webhookImzaMetni(zaman, olayKimligi, ham), signatureHeader)
}
