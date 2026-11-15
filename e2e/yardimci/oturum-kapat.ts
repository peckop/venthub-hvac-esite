/** Yardımcının ihtiyaç duyduğu en dar Playwright yüzeyi; gerçek `Page` bunu yapısal olarak sağlar. */
export interface OturumSayfasi {
  context(): {
    cookies(): Promise<ReadonlyArray<{ name: string; value: string }>>
    request: {
      post(
        url: string,
        secenek: { headers: Record<string, string>; timeout: number },
      ): Promise<{ ok(): boolean }>
    }
  }
}

/**
 * E2E oturum kapatıcı (ALT-189).
 *
 * Sorun: üç E2E dosyası (admin-smoke, admin-filtre-donma, checkout-smoke) her koşuda gerçek
 * giriş yapıyor ve oturumu hiç kapatmıyordu; CI her koşuda tek hesapta yeni bir `auth.sessions`
 * satırı bırakıyordu (ölçüm: 15 Kasım 2026, ~10.600 satır, kaynak CI girişleri).
 *
 * Çözüm: her test bitince bu testin KENDİ oturumunu sunucuda kapatmak.
 *
 * ⚠️ `scope=local` ZORUNLU. Supabase `/auth/v1/logout` varsayılanı `global`dir ve aynı hesabın
 * TÜM oturumlarını kapatır; E2E hesabı gerçek bir kişinin hesabı olduğundan bu, kişinin açık
 * panel oturumlarını düşürürdü. `local` yalnız belirtecin taşıdığı `session_id`yi siler.
 *
 * Hata yolları: bu işlev TESTİ ASLA KIRMAZ (temizlik en iyi çabadır). Çerez yoksa, ortam
 * değişkeni yoksa, ağ düşerse ya da sunucu 2xx dışı dönerse sessizce `false` döner. Belirteç
 * hiçbir yere yazılmaz.
 */

const CEREZ_DESENI = /^sb-.*-auth-token(\.\d+)?$/

/** @supabase/ssr oturum çerezinden (parçalı olabilir) access_token'ı çıkarır. */
export function erisimBelirteciCikar(
  cerezler: ReadonlyArray<{ name: string; value: string }>,
): string | null {
  const parcalar = cerezler
    .filter((c) => CEREZ_DESENI.test(c.name))
    .sort((a, b) => Number(a.name.split('.')[1] ?? 0) - Number(b.name.split('.')[1] ?? 0))
  if (parcalar.length === 0) return null

  try {
    let ham = decodeURIComponent(parcalar.map((c) => c.value).join(''))
    // Node tarafında çöz: tarayıcı atob() Latin-1 döndürür, Buffer UTF-8'i doğru işler.
    if (ham.startsWith('base64-')) ham = Buffer.from(ham.slice(7), 'base64url').toString('utf8')
    const oturum: unknown = JSON.parse(ham)
    const belirtec =
      Array.isArray(oturum) ? oturum[0] : (oturum as { access_token?: unknown } | null)?.access_token
    return typeof belirtec === 'string' && belirtec.length > 0 ? belirtec : null
  } catch {
    return null
  }
}

/** Sayfanın oturumunu YALNIZ yerel kapsamda kapatır. Başarılıysa true. Asla fırlatmaz. */
export async function oturumuKapat(page: OturumSayfasi): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anahtar = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anahtar) return false

  try {
    const belirtec = erisimBelirteciCikar(await page.context().cookies())
    if (!belirtec) return false

    const yanit = await page.context().request.post(`${url}/auth/v1/logout?scope=local`, {
      headers: { Authorization: `Bearer ${belirtec}`, apikey: anahtar },
      timeout: 10_000,
    })
    return yanit.ok()
  } catch {
    return false
  }
}
