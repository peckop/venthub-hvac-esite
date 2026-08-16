# Vitrin Reflow Cetveli — WCAG 2.2 SC 1.4.10 (v1.0, 2026-08-16, T050-VH)

> Sahip: EDGE-OPS şeridi. Kapı: `e2e/reflow.e2e.ts` (INV-REFLOW-1, `admin-smoke`
> zorunlu kontrolünün parçası — `pnpm exec playwright test` tüm spec'leri toplar).
> Teşhis aracı: `scripts/a11y/reflow-scan.mjs` (ADMIN şeridinde; elle koşulur,
> ağaçta inen kök-kanıtlı ölçüm yapar). İkisi aynı taşma tanımını kullanır.

## Kural

**R1.** Vitrin sayfaları **320 CSS px** genişlikte (≡ 1280px viewport @ %400 zoom)
yatay kaydırma **gerektirmeden** sunulur. Ölçü: `scrollingElement.scrollWidth -
innerWidth ≤ 1px` (sub-pixel payı).

**R2.** 320 tek başına yetmez: dar ekranda düzen mobil dala geçip kurtulur; ölçülen
kırılmalar ~768–1100px bandındaydı (masaüstü dalı devrede, alan dar). Kapı
**320 / 768 / 1024 / 1280** genişliklerinin tamamında ölçer.

**R3. Kırpma çözüm değildir.** `html`/`body` üzerinde `overflow-x: hidden|clip`
YASAK (b6a2e14d'de kaldırıldı): taşmayı kullanıcıdan gizler ama içerik erişilmez
kalır — ihlal sürer; `clip` ayrıca ölçüm aracını körleştirir. Taşma kökünden
düzeltilir (suçlu elemanı `reflow-scan.mjs` ile kanıtla, aday listesiyle yetinme —
atası `overflow:hidden` olan aday belge taşmasına katkı vermez, #540 dersi).

## Ölçüm geçerliliği (kapının kendisi için — üçü de zorunlu)

**M1. Uygulama-gerçekliği:** ölçümden önce sayfanın uygulamaya ait olduğu doğrulanır
(`html[lang]` + site iskeleti). Yaşandı: Vercel deployment-protection sayfası ölçüldü,
8 rota "tertemiz" çıktı — yanlış hedef, sessiz hep-yeşil.

**M2. Enstrüman kanıtı:** her sayfa+genişlikte gerçek ölçümden önce kasıtlı 5000px
taşma enjekte edilir; araç onu göremezse test KIRMIZI (ölçülemedi ≠ geçti). Yaşandı:
`overflow-x: clip` altında `scrollWidth` taşmayı asla raporlayamaz.

**M3. Kapıyı bilerek boz:** kapıya dokunan her değişiklikte sabotaj kanıtı sunulur
(taşma ekle → kırmızı; geri al → yeşil). Kapsamın kendisi kanıt değildir. Sabotaj turunda
her aşama, sunucunun O build'i servis ettiğini imzayla kanıtlamalı — v1 turu bunu yapmadığı
için baştan sona BAYAT artefaktı ölçtü ve üç farklı sabotaj aynı sonucu verdi.

**M4. Mobil emülasyonda viewport YENİDEN BOYUTLANDIRILMAZ.** Ölçüldü: Pixel 7 emülasyonunda
`setViewportSize(1024)` sonrası kasıtlı 5000px enstrüman yalnız **904px** ölçülüyor (mobil
`<meta viewport>` + shrink-to-fit düzeni ölçekliyor) → belge taşması masaüstündeki anlamını
yitiriyor. Mobilde ölçüm CİHAZIN KENDİ genişliğinde yapılır (Pixel 7 → 412px, sentinel
3352px görülüyor). Genişlik taraması masaüstü projesinin işidir.

## Kapının kanıt defteri (2026-08-16, T050-VH)

Her iddianın ateşlendiği gerçek koşul — "kapsam" değil, tetiklenmiş kanıt:

| İddia | Tetikleyen | Sonuç |
|---|---|---|
| R1 taşma | `body { min-width: 2000px }` | 5 KIRMIZI · "belge 1680px yatay taşıyor" |
| R3 kırpma (html) | `html { overflow-x: hidden }` · `html { overflow-x: clip }` | 5 KIRMIZI · "taşmayı GİZLER" |
| R3 kırpma (body) | `body { overflow-x: clip }` | 5 KIRMIZI · "taşmayı GİZLER" |
| M2 enstrüman | mobil emülasyon + viewport resize (GERÇEK koşul) | 5 KIRMIZI · "ÖLÇÜLEMEDİ (904px)" |
| Kontrol grubu | tertemiz kaynak | 10 YEŞİL (masaüstü 5 + mobil 5) |

Not: `body { overflow-x: clip }` enstrümanı KÖRLEŞTİRMEZ (belge `documentElement` üzerinden
ölçülür); kırpma yasağı ile enstrüman körlüğü ayrı koşullarla kanıtlanır.

## Kapsam ve bilinçli sınırlar

- Rotalar: `/tr, /tr/products, /tr/cart, /tr/support, /tr/hakkimizda` (kritik vitrin).
  Yeni kritik vitrin rotası açan, kapının `ROUTES` listesine ekler.
- **Mobil hat:** `mobile-storefront` projesi (Pixel 7 emülasyonu) bu kapıyı bir de
  dokunma/mobil-UA altında koşar. **Checkout hunisi mobil projede DEĞİL** — gerçek login
  ister, parolası CI secret'ı (`E2E_ADMIN_PASSWORD`), yani yerelde doğrulanamıyor.
  Doğrulanmamış bir spec'i zorunlu kontrole sokmak, kırmızıda herkesin merge'ini bloklar.
  Bu adlı ve tarihli bir eksiktir (2026-08-16): mobil huni, kimlik bilgisiyle
  doğrulanabildiği anda eklenir.
- **Admin** kapsam dışı: mobil/dar tasarımı henüz yok (ADMIN Faz-5 ölçümünde kayıtlı
  açık). Kapıya koymak regresyon değil eksik-özellik kırmızısı üretir ve kapı sökülür.
  Admin dar-ekran tasarımı geldiğinde bu muafiyet KALDIRILIR (muafiyet = adlı, süreli).

## Değişiklik günlüğü

- v1.0 (2026-08-16, T050-VH): ilk sürüm — #540'ta elle bulunan taşma sınıfı kalıcı
  kapıya bağlandı; mobil viewport hattı açıldı.
