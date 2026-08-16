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

# Bölüm B — Hesap Yüzeyi (v0.2, T059)

> **Bekçi:** `src/__tests__/conformance/auth-account-surface.test.ts` (INV-AUTH-2).
> **Doğuş sebebi:** T059 (2026-08-16) — header'ın favoriler butonu var olmayan sayfaya
> gidiyordu (garantili 404); "projeye ekle" modalı kopuk context teli yüzünden sessiz
> no-op'tu; overview'un okuduğu `full_address` alanını form hiç yazmıyordu (hep boş kart).

## B1 — Rotası olan her hesap yolunun sayfası olur

`Routes.account.*`'a eklenen her yol için `/src/app/[lang]/account/<yol>/page.tsx`
**aynı PR'da** eklenir. Merkezi rota tanımı UI'da link üretir; sayfasız rota tanımı
"derlenen 404"tür ve hiçbir statik kapı görmez — INV-AUTH-2 R1 tüm listeyi tarar.

## B2 — Proje context'i tek yerde yaratılır

`createContext` çağrısı yalnız `contexts/ProjectContext.tsx`'te yaşar; provider ve
hook AYNI nesneyi paylaşır. İki ayrı context nesnesi, tüketiciyi sessizce fallback'e
düşürür — çağrı "başarılı" görünür, hiçbir şey yazılmaz (T059'da olan buydu).

## B3 — Favori durumu kalıcı kaynaktan

Ürün kartı/detayındaki kalp `useFavorites`'e bağlanır; yerel `useState` ile favori
tutmak yasaktır (sayfa yenilenince kaybolur = sahte özellik). **v1 sözleşmesi:**
kimlik listesi `localStorage['venthub:favorites:v1']`, senkron `storage` +
`venthub:favorites-changed` olayları. DB'ye (user_favorites) geçiş Recep kararıdır
(migration → kural 13); geçişte hook arayüzü sabit kalır.

## B4 — Overview'un okuduğu her alan ya yazılır ya fallback'lidir

`full_address` formca yazılmaz; gösteren yüzey `address_line + district + city`
fallback'i uygular (checkout'un yaptığı gibi). Genel kural: bir yüzeye alan eklerken
"bu alanı hangi form yazıyor?" sorusunun cevabı yoksa fallback zorunludur.

## B5 — Favoriler yüzeyinde fiyat (bilinçli yok)

Favoriler v1 fiyat GÖSTERMEZ. Fiyat yüzeyi eklemek `rendering-cache-standard.md`'nin
fiyat-yüzeyi kurallarına (INV-PRICE ailesi) tabidir; eklenecekse `display_price`
hattından gelir, ham `price` kolonu çekilmez.

## Kapsam dışı (bilerek)

- `/account/*` middleware guard'ı — ortak mülk, ayrı iş (T056 kapsam dışı bırakıldı).
- CAPTCHA / rate-limit — T060.
- Google OAuth canlı e2e provası — Recep'in canlı ortam provası gerektirir
  (Supabase Dashboard'daki Redirect URL allowlist'i repodan denetlenemez; canlıda
  `https://<domain>/auth/callback` kayıtlı olmalıdır).
- `email_confirmed_at` kod kapısı — 2026-08-16'da CANLIDA ÖLÇÜLDÜ:
  `/auth/v1/settings` → `mailer_autoconfirm: false`; GoTrue doğrulanmamış girişi
  sunucuda zaten reddediyor, istemci kapısı gereksiz. (Ayar değişirse bu satır geçersizleşir.)
- Misafir checkout — Recep kararı (T059 notunda açık bırakıldı).

## Muafiyetler

Yok. Muafiyet gerekirse buraya **adla** yazılır ve INV-AUTH-1/INV-AUTH-2'de aynı adla sabitlenir.
