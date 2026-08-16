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

## A7 — Oturum kapatma iki katmanlıdır (v0.3, T060)

`sb-claims-cache` çerezi **httpOnly**'dir — client JS onu silemez ve `resolveUserClaims`
geçerli çerezde Supabase'e hiç sormaz. Bu yüzden çıkış İKİ parçadan oluşur ve ikisi de
zorunludur (bekçi: INV-AUTH-3, `auth-session-security.test.ts`):

1. **Sunucu:** `POST /auth/signout` — oturumu sunucuda kapatır ve
   `clearClaimsCacheCookie` ile claims cache'i temizler.
2. **Client:** `supabase.auth.signOut()` — yerel oturum/state temizliği.

`AuthContext.signOut` sunucu ucunu ÇAĞIRMAK zorundadır; yalnız client signOut,
admin'i çıkıştan sonra cache TTL'i (≤900 sn) boyunca `/admin` kapısından geçirir
(T060'ın kök bulgusu: temizleyicinin tek çağıranı hiç kullanılmayan route'tu —
iki parça tek tek doğruydu, kopukluk aradaki teldeydi). Çerez httpOnly + TTL ≤ 900
kalır; httpOnly'yi gevşetmek çerezi XSS'e açar, TTL'i büyütmek çıkış penceresini büyütür.

## A8 — Rate limit politikası: GoTrue'ya emanet (ölçülmüş)

Login/signup/forgot istekleri `supabase.co`'daki GoTrue uçlarına DOĞRUDAN gider —
uygulama sunucumuzdan/middleware'den **geçmez**. Bu yüzden middleware'de auth
rate-limit katmanı kurulamaz (istekleri hiç görmeyiz); `_shared/rate_limit.ts`
deseni yalnız KENDİ edge fonksiyonlarımız içindir. Yürürlükteki koruma GoTrue'nun
kendi limitleridir (ölçüm 2026-08-16, supabase.com/docs/guides/auth/rate-limits):

- `/auth/v1/token` (login + refresh): IP başına 1800/saat, 30'luk burst — sabit.
- `/auth/v1/verify`: IP başına 360/saat, 30 burst — sabit.
- E-posta gönderen uçlar (`signup`/`recover`): kullanıcı başına 60 sn pencere +
  proje genel e-posta limiti (yerleşik SMTP'de saatlik düşük tavan; custom SMTP'de
  yükseltilebilir — canlıya çıkışta custom SMTP zaten gerekiyor).

Ayarlar Dashboard → Authentication → Rate Limits'te yaşar. **Emanet açık yazılsın:**
bu değerler repodan denetlenemez; değiştiren, bu bölümü günceller.

## A9 — CAPTCHA: v1'de YAPILMAYACAK (karar verildi, 2026-08-16)

Kayıt/giriş/şifre-sıfırlama uçlarında CAPTCHA **yok ve v1'de eklenmeyecek** —
Recep'in kararı. Bu bir "sonra bakarız" değil, **kapanmış karardır**: yeniden
gündeme getirmenin tek meşru tetikleyicisi **gözlenmiş istismardır** (bot kayıt
dalgası, credential-stuffing izi, GoTrue rate-limit'in 429 üretmeye başlaması).
Böyle bir gözlem OLMADAN bu maddeyi tekrar öneri olarak açma.

Gerekçe zinciri: A8'deki GoTrue limitleri yürürlükte (IP-bazlı token/verify
tavanları + e-posta uçlarında kullanıcı-başı pencere), lansman ölçeğinde trafik
düşük, ve CAPTCHA'nın bedeli sıfır değil — üçüncü taraf bağımlılığı, kayıt
hunisinde sürtünme, sağlayıcı anahtarı yönetimi.

**İstismar gözlenirse uygulama notu (o gün lazım olacak):** Supabase Auth'un
yerleşik attestation'ı iki sağlayıcıyı destekler — hCaptcha veya Cloudflare
Turnstile. Turnstile'ı varsayılan öneri olarak sunma: Cloudflare bu projede
kullanılmıyor, yani yeni bir hesap/bağımlılık demek; hCaptcha tek başına kurulabilir.
⚠️ **Sıralama kritik:** Supabase tarafındaki CAPTCHA zorunluluğu, client kodu
`captchaToken` göndermeye hazır OLMADAN açılırsa **tüm kayıt/giriş akışı anında
kilitlenir** — önce kod, sonra dashboard.

Not: HIBP kontrolü ağ hatasında bilerek fail-open'dır (kayıt akışını sızıntı
servisine bağımlı kılmamak için) — bu bilinçli tercih burada kayıt altındadır.

## A10 — tenant_id: user_metadata GÜVENİLMEZ, tasarım kararı

Bugün `signUp` tenant_id'yi `user_metadata`'ya yazar (client-kontrollü alan);
RLS ise `app_metadata` okur (kural 12) → signup'taki tenant seçimi yok sayılır.
Tek-tenant v1'de zararsız (varsayılan tenant), multi-tenant'ta sessiz karışma.
**Tasarım (devredilecek, uygulama bu cetvelin işi değil):** tenant ataması
client iddiasından DEĞİL, sunucunun kendi gözleminden türetilir — ilk oturumda
sunucu tarafı (route handler/edge fn) HOST'tan tenant'ı çözer ve service-role
`auth.admin.updateUserById(..., { app_metadata: { tenant_id } })` ile BİR KEZ
yazar; `user_metadata.tenant_id` yalnız görsel/istatistik amaçlıdır, hiçbir
yetki/RLS kararına girmez. Uygulama EDGE şeridine devredildi (T047/T048 ailesiyle
koordineli; `is_admin_user`'a dokunulmaz — ayrı iş emri).

---

# Bölüm B — Hesap Yüzeyi (taşındı)

v0.2'de burada duran hesap-yüzeyi kuralları (B1–B6) kendi cetveline taşındı:
**`customer-account-standard.md`** (kardeş cetvel; bekçisi INV-AUTH-2). Bu dosya
yalnız AUTH ZİNCİRİNİ (giriş/şifre/callback/oturum, A1–A10) yönetir.

## Kapsam dışı (bilerek)

- `/account/*` middleware guard'ı — ortak mülk, ayrı iş (T056 kapsam dışı bırakıldı).
- CAPTCHA — A9'da v1 için KAPANMIŞ karar (yapılmayacak); yeniden açılışı yalnız
  gözlenmiş istismar tetikler.
- tenant_id app_metadata yazımının uygulaması — A10'da tasarım hazır, EDGE'e devredildi.
- Google OAuth canlı e2e provası — Recep'in canlı ortam provası gerektirir
  (Supabase Dashboard'daki Redirect URL allowlist'i repodan denetlenemez; canlıda
  `https://<domain>/auth/callback` kayıtlı olmalıdır; 2026-08-16'da Recep kaydın
  var olduğunu doğruladı).

## Muafiyetler

Yok. Muafiyet gerekirse buraya **adla** yazılır ve INV-AUTH-1/INV-AUTH-3'te aynı adla sabitlenir.
