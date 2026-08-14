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

    // Çağrıyı SAYFA İÇİNDEN yap: gerçek oturum token'ı + gerçek cross-origin CORS.
    const result = await page.evaluate(
      async ({ url, key }) => {
        // Uygulama @supabase/ssr'ın createBrowserClient'ını kullanıyor → oturum ÇEREZDE,
        // localStorage'da DEĞİL. (İlk sürüm localStorage okuyordu ve -1 ile patladı.)
        // Çerez adı `sb-<ref>-auth-token`; 3180 karakteri aşarsa `.0`, `.1` diye parçalanır.
        // Değer ya doğrudan JSON ya da `base64-<base64url>` önekli olabilir.
        const readSessionToken = (): string | null => {
          const chunks = document.cookie
            .split('; ')
            .map((c) => {
              const i = c.indexOf('=')
              return { name: c.slice(0, i), value: c.slice(i + 1) }
            })
            .filter((c) => /^sb-.*-auth-token(\.\d+)?$/.test(c.name))
            .sort((a, b) => {
              const n = (s: string) => Number(s.split('.')[1] ?? 0)
              return n(a.name) - n(b.name)
            })
          if (chunks.length === 0) return null

          let raw = decodeURIComponent(chunks.map((c) => c.value).join(''))
          if (raw.startsWith('base64-')) {
            const b64 = raw.slice(7).replace(/-/g, '+').replace(/_/g, '/')
            raw = atob(b64)
          }
          const parsed = JSON.parse(raw)
          // Bilinen iki şekil: {access_token,...} veya [access_token, refresh_token, ...]
          if (parsed?.access_token) return parsed.access_token as string
          if (Array.isArray(parsed) && typeof parsed[0] === 'string') return parsed[0]
          return null
        }

        let token: string | null = null
        try {
          token = readSessionToken()
        } catch (e) {
          return { status: -3, body: `çerez çözümlenemedi: ${String(e)}` }
        }
        if (!token) {
          // Tanı için hangi sb- çerezlerinin var olduğunu göster.
          const names = document.cookie
            .split('; ')
            .map((c) => c.split('=')[0])
            .filter((n) => n.startsWith('sb-'))
            .join(',')
          return { status: -1, body: `oturum çerezi yok. Mevcut sb- çerezleri: [${names || 'hiç'}]` }
        }

        // Teşhis: token'ın KENDİSİNİ asla loglama (canlı kimlik bilgisi). Yalnız şekli:
        // geçerli bir JWT 3 nokta-ayrımlı parçadan oluşur ve "ey" ile başlar.
        const cookieNames = document.cookie
          .split('; ')
          .map((c) => c.split('=')[0])
          .filter((n) => n.startsWith('sb-'))
        const shape = `len=${token.length} segments=${token.split('.').length} ` +
          `startsWithEy=${token.startsWith('ey')} cookies=[${cookieNames.join(',')}]`

        const resp = await fetch(`${url}/functions/v1/admin-update-shipping`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // BİLEREK boş — mutasyona ulaşmadan doğrulamada durur
        })
        return { status: resp.status, body: `${(await resp.text()).slice(0, 160)} | ${shape}` }
      },
      { url: supabaseUrl as string, key: anonKey as string },
    )

    expect(
      result.status,
      `Beklenen 400 (missing_fields = auth geçti). Alınan ${result.status}: ${result.body}\n` +
        '401 → geçit reddetti (verify_jwt / token).\n' +
        '403 → rol kapısı reddetti (tenant-scoped user_profiles sorgusu adminleri bulamıyor).\n' +
        '-1/-3 → oturum çerezi okunamadı (login akışı ya da çerez formatı değişmiş).',
    ).toBe(400)
  })
})
