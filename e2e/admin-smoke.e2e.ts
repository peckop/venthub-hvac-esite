import { expect,test } from '@playwright/test'

/**
 * Admin runtime smoke — donma/loop bekçisi.
 *
 * 2026-06-19'da `useRole` her render yeni fonksiyon döndürüp CommandPalette/AdminRealtimeNotifications'ı
 * sonsuz re-render döngüsüne soktu → admin "Yükleniyor"da dondu, HİÇBİR ŞEY tıklanmadı, console TEMİZ.
 * Hiçbir statik kapı (cetvel/INV/tsc/lint/build) bunu görmedi. Bu test gerçek tarayıcıda admin'i boot
 * edip TAM O SEMPTOMU ölçer: (a) shell mount oluyor mu, (b) dashboard "Yükleniyor"da donmuyor mu,
 * (c) client İNTERAKTİF mi (menüye tıkla → gerçekten gidiyor mu; donmuş client tıklamayı işlemez).
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL
const PASSWORD = process.env.E2E_ADMIN_PASSWORD

test.describe('admin runtime smoke', () => {
  // Secret/credential yoksa atla (CI'ı kırma) — ama sebebini açıkça yaz.
  test.skip(!EMAIL || !PASSWORD, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD gerekli (CI var+secret).')

  test('login → /admin boot olur, donmaz ve interaktiftir', async ({ page }) => {
    // 1) Gerçek login (email+şifre)
    await page.goto('/tr/auth/login')
    await page.fill('input[name="email"]', EMAIL as string)
    await page.fill('input[name="password"]', PASSWORD as string)
    await page.click('button[type="submit"]')

    // Login formundan çıkana kadar bekle (session cookie set olsun). Başarısızsa aşağıda net patlar.
    await page
      .waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 25_000 })
      .catch(() => { /* yine de /admin'i deneyeceğiz */ })

    // 2) Admin'e git
    await page.goto('/admin')

    // 3) Shell mount oldu mu — sidebar menü linki görünür (auth çözüldü, spinner geçti)
    const ordersLink = page.locator('a[href="/admin/orders"]').first()
    await expect(ordersLink, 'Admin shell render olmadı (auth/spinner takıldı?)').toBeVisible({
      timeout: 25_000,
    })

    // 4) Dashboard "Yükleniyor"da DONMUYOR — içerik mount oldu (render-loop olsaydı burada kalırdı)
    await expect(
      page.getByTestId('admin-dashboard'),
      'Dashboard mount olmadı — "Yükleniyor"da donmuş olabilir (render-loop?)',
    ).toBeVisible({ timeout: 25_000 })

    // 5) İNTERAKTİF mi — menüye tıkla, GERÇEKTEN gitsin. Donmuş/pegli client tıklamayı işlemez.
    await ordersLink.click()
    await expect(page, 'Menü tıklaması navigasyon yapmadı — client donmuş olabilir').toHaveURL(
      /\/admin\/orders/,
      { timeout: 20_000 },
    )
  })

  /**
   * Edge yetki-zinciri smoke — 2026-08-14 (T018 W1).
   *
   * Yukarıdaki test admin'in AÇILDIĞINI ölçer ama hiçbir edge fonksiyonu ÇAĞIRMAZ.
   * W1'de 17 edge fonksiyonu deploy edildi; ikisi kritik biçimde değişti:
   *   - geçit: verify_jwt false→true (anonim erişim kapandı)
   *   - gövde: rol sorgusuna `.eq('tenant_id', ...)` filtresi eklendi
   * İkincisi yanlışsa admin'in rolü BULUNAMAZ ve panel 403 alır — statik kapıların
   * hiçbiri (tsc/lint/build/INV) bunu göremez, çünkü sorun canlı JWT'nin claim'lerinde.
   *
   * PROD'A YAZMADAN kanıtlama: fonksiyonun kontrol sırası
   *   401 (token yok/geçersiz) → 403 (rol yetersiz) → 400 missing_fields
   * Boş gövde `{}` gönderiyoruz. **400 almak, geçidin VE rol kapısının geçildiğini
   * kanıtlar** — fonksiyon DB mutasyonuna hiç ulaşmaz. 401/403 alırsak zincir kırık.
   */
  test('edge yetki zinciri: gerçek admin oturumu geçit + rol kapısını geçiyor', async ({ page }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    test.skip(!supabaseUrl || !anonKey, 'NEXT_PUBLIC_SUPABASE_URL / ANON_KEY gerekli.')

    await page.goto('/tr/auth/login')
    await page.fill('input[name="email"]', EMAIL as string)
    await page.fill('input[name="password"]', PASSWORD as string)
    await page.click('button[type="submit"]')
    await page.waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 25_000 })

    // Oturumu ÇEREZDEN oku. Uygulama @supabase/ssr'ın createBrowserClient'ını kullanıyor
    // (src/lib/supabase/client.ts) → oturum çerezde, localStorage'da DEĞİL.
    // Çözümlemeyi NODE tarafında yapıyoruz: tarayıcıdaki atob() Latin-1 döndürür ve
    // oturum JSON'undaki Türkçe karakterleri bozar; Buffer UTF-8'i doğru işler.
    const chunks = (await page.context().cookies())
      .filter((c) => /^sb-.*-auth-token(\.\d+)?$/.test(c.name))
      .sort((a, b) => Number(a.name.split('.')[1] ?? 0) - Number(b.name.split('.')[1] ?? 0))

    expect(chunks.length, 'Oturum çerezi bulunamadı — login akışı kurulmamış.').toBeGreaterThan(0)

    let raw = decodeURIComponent(chunks.map((c) => c.value).join(''))
    if (raw.startsWith('base64-')) raw = Buffer.from(raw.slice(7), 'base64url').toString('utf8')
    const parsed = JSON.parse(raw)
    const token: string | undefined =
      parsed?.access_token ?? (Array.isArray(parsed) ? parsed[0] : undefined)
    expect(typeof token, 'Çerezden access_token çıkarılamadı.').toBe('string')

    // JWT gövdesi imzasızdır ve herkese açıktır — sır DEĞİL. Yalnız teşhis alanlarını
    // raporluyoruz (exp/role/aud); token'ın kendisi ASLA loglanmıyor.
    const claims = JSON.parse(
      Buffer.from((token as string).split('.')[1], 'base64url').toString('utf8'),
    )
    const secondsToExpiry = Number(claims.exp) - Math.floor(Date.now() / 1000)
    const diag =
      `exp_in=${secondsToExpiry}s role=${claims.role} aud=${claims.aud} ` +
      `chunks=${chunks.length}`

    // ── İZOLASYON DENEYİ ──────────────────────────────────────────────────────
    // Token süresi dolmamış (exp_in≈3599s) ve role=authenticated. Yine de fonksiyonun
    // gövdesindeki auth.getUser() 401 diyor. Fonksiyonu denklemden çıkarmak için AYNI
    // token + AYNI anon key ile doğrudan Auth'a gidiyoruz:
    //   200 → ikili sağlam, fark fonksiyonun ÇALIŞMA ORTAMINDA (SUPABASE_ANON_KEY?)
    //   401 → token/anon-key ikilisinin kendisi geçersiz (test env'i yanlış key taşıyor)
    // Bu, "fonksiyonun içi mi dışı mı" sorusunu tek istekte kapatır.
    const authProbe = await page.evaluate(
      async ({ url, key, tok }) => {
        const r = await fetch(`${url}/auth/v1/user`, {
          headers: { Authorization: `Bearer ${tok}`, apikey: key },
        })
        return { status: r.status, body: (await r.text()).slice(0, 120) }
      },
      { url: supabaseUrl as string, key: anonKey as string, tok: token as string },
    )

    // Çağrıyı SAYFA İÇİNDEN yap → gerçek cross-origin CORS de sınanmış olur.
    const result = await page.evaluate(
      async ({ url, key, tok }) => {
        const resp = await fetch(`${url}/functions/v1/admin-update-shipping`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tok}`,
            apikey: key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // BİLEREK boş — mutasyona ulaşmadan doğrulamada durur
        })
        return { status: resp.status, body: (await resp.text()).slice(0, 160) }
      },
      { url: supabaseUrl as string, key: anonKey as string, tok: token as string },
    )
    result.body =
      `${result.body} | ${diag} | authProbe=${authProbe.status} ${authProbe.body}`

    expect(
      result.status,
      `Beklenen 400 (missing_fields = auth geçti). Alınan ${result.status}: ${result.body}\n` +
        '401 → geçit reddetti (verify_jwt / token).\n' +
        '403 → rol kapısı reddetti (tenant-scoped user_profiles sorgusu adminleri bulamıyor).\n' +
        '-1/-3 → oturum çerezi okunamadı (login akışı ya da çerez formatı değişmiş).',
    ).toBe(400)
  })
})
