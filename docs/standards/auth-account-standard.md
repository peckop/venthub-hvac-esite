# Auth & Hesap Standardı (cetvel) — v0.1

> **Kapsam:** Şifre sıfırlama zinciri, auth callback yönlendirmesi, login dönüş-yolu ve
> hata gösterimi, hesap-enumerasyon hijyeni.
> **Bekçi:** `src/__tests__/conformance/auth-reset-chain.test.ts` (INV-AUTH-1).
> **Doğuş sebebi:** T056 (2026-08-16) — reset-password rotası repoda hiç yoktu; şifresini
> unutan kullanıcı linke tıklayıp giriş yapıyor ama şifresini ASLA değiştiremiyordu
> (kalıcı hesap kilidi). Hiçbir kapı görmedi çünkü bu cetvel yazılmamıştı.

## A1 — resetPasswordForEmail daima redirectTo ile

`supabase.auth.resetPasswordForEmail` çağrısı **her zaman** `redirectTo` içerir ve hedef
locale'siz `/auth/callback?next=reset-password`'dur. `redirectTo`'suz çağrı Supabase'in
Site URL'ine düşer; kullanıcı giriş yapmış olur ama yeni-şifre ekranına varamaz.

## A2 — Locale'siz /auth/callback giriş noktası kalıcıdır

Dış dünyadan dönen auth trafiği (Google OAuth, e-posta linkleri) locale'siz
`/auth/callback`'e iner. İki parça birlikte yaşar, **ikisi de tek başına yeterli değildir**:

- `middleware.ts` → `isAuthApi` muafiyeti: bu yol locale enjeksiyonundan muaf tutulur
  (307 locale redirect'i `?code=` PKCE değişimini bozabilir; ayrıca hash tabanlı akışta
  fragment sunucuya hiç ulaşmaz).
- `src/app/auth/callback/route.ts` → query'yi AYNEN koruyarak `/{locale}/auth/callback`'e
  307 yönlendirir. Bu handler olmadan locale'siz yol **404**'tür (sayfa yalnız
  `/[lang]/auth/callback`'te yaşar). Hash fragment'ini tarayıcı yönlendirmede kendisi taşır.

Muafiyeti kaldırmak ya da handler'ı silmek zinciri sessizce koparır — INV-AUTH-1 R3 bloklar.

## A3 — Callback sayfası iki akışı ve hedef ayrımını işler

`AuthCallbackPage`:
- **PKCE** (`?code=`): `exchangeCodeForSession` ile oturuma çevirir (OAuth + redirectTo'lu
  e-posta linkleri buraya düşer; `@supabase/ssr` browser client'ın varsayılanı PKCE'dir).
- **Implicit** (hash token): client init'teki `detectSessionInUrl` işleyene dek kısa bekler.
- **Hedef ayrımı:** `?next=reset-password` veya hash'te `type=recovery` → yeni-şifre ekranı;
  aksi halde anasayfa. Yeni bir dönüş hedefi eklenecekse `next` sözleşmesine eklenir,
  yeni parametre icat edilmez.

## A4 — Kurtarma ekranı: mevcut şifre SORULMAZ, politika tam uygulanır

`/[lang]/auth/reset-password` (`ResetPasswordPage`):
- Kimlik kanıtı e-posta linkinin kurduğu **recovery oturumudur**; mevcut şifre sorulmaz
  (kullanıcı onu bilmiyor — T056'nın kök sebebi `AccountSecurityPage`'in bunu zorunlu tutmasıydı).
- Şifre politikası `RegisterPage` ile **birebir aynıdır**: 4 kural (uzunluk/büyük harf/
  rakam/özel karakter) + HIBP k-Anonymity sızıntı kontrolü.
- Yazma yolu `supabase.auth.updateUser({ password })`'dur.
- Oturum yoksa form değil, "bağlantı geçersiz + yeni bağlantı iste" durumu gösterilir.

## A5 — Login dönüş yolu ve hata gösterimi

- `?redirect=` (uygulama içi linkler) ve `?from=` (middleware guard'ı) **eşdeğer** dönüş
  yoludur; LoginPage ikisini de okur. Yönlendirme `localizedHref` ile yapılır (kural 7).
- `?error=` parametresi kullanıcıya **gösterilir** (inline alert, `role="alert"`);
  `?reason=expired` oturum-doldu mesajına çevrilir. Sessizce yutulan hata parametresi,
  kullanıcının aynı kırık akışı sonsuza dek yeniden denemesi demektir.

## A6 — Hesap enumerasyonu sızdırılmaz

Şifre-sıfırlama isteği sonucu, e-postanın kayıtlı olup olmadığını **ele vermez**:
sağlayıcı hatası ne olursa olsun kullanıcıya tek jenerik mesaj gösterilir
("Sıfırlama isteği gönderilemedi"). "User not found" benzeri dallar yasaktır.

---

# Bölüm B — Hesap Yüzeyi (taşındı)

v0.2'de burada duran hesap-yüzeyi kuralları (B1–B6) kendi cetveline taşındı:
**`customer-account-standard.md`** (kardeş cetvel; bekçisi INV-AUTH-2). Bu dosya
yalnız AUTH ZİNCİRİNİ (giriş/şifre/callback, A1–A6) yönetir.

## Kapsam dışı (bilerek)

- `/account/*` middleware guard'ı — ortak mülk, ayrı iş (T056 kapsam dışı bırakıldı).
- CAPTCHA / rate-limit — T060.
- Google OAuth canlı e2e provası — Recep'in canlı ortam provası gerektirir
  (Supabase Dashboard'daki Redirect URL allowlist'i repodan denetlenemez; canlıda
  `https://<domain>/auth/callback` kayıtlı olmalıdır; 2026-08-16'da Recep kaydın
  var olduğunu doğruladı).

## Muafiyetler

Yok. Muafiyet gerekirse buraya **adla** yazılır ve INV-AUTH-1'de aynı adla sabitlenir.
