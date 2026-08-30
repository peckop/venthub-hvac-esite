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

## Binişme ve görünürlük (v1.1, 2026-08-30, REC-89)

Reflow kuralları belgenin **taşmasını** ölçer. Bu bölüm taşma OLMADAN yaşanan kusur
sınıfını kapsar: her şey ekranın içindedir ama **üst üstedir**. `INV-REFLOW-1` bu sınıfı
göremez ve yeşil kalır — bölümün varlık sebebi budur.

**R4. Etkileşimli elemanın metni örtülmez.** Buton/bağlantı metni her kırılım
genişliğinde okunur olmalıdır. Ölçüt "görünür mü" DEĞİL, **"kendi merkezinde en üstte
kim var"**: `document.elementFromPoint(merkez)` elemanın kendisini ya da çocuğunu
döndürmelidir. Yaşandı (REC-89 kusur 1): hero CTA'larının rengi, kontrastı, opaklığı ve
kırpması ÖLÇÜLDÜ ve **hepsi doğruydu**; buna rağmen metin okunmuyordu, çünkü kapsayıcı
0 piksele çöküp mutlak konumlu görsel butonun üzerine binmişti. Yani stil ölçümü bu
kusuru yapısal olarak KAÇIRIR.

**R5. Yapışkan/mutlak katman içerik metnini ezmez.** `sticky`/`absolute` bir katman,
altından akan metnin üzerine binemez. Konumlandırma sınıfı **kırılım kapsamıyla birlikte**
yazılır: iki kolonlu düzen için tasarlanmış yapışkanlık tek kolonlu mobilde yürürlükte
kalmamalıdır. Yaşandı (REC-89 kusur 2): `sticky top-24 z-10` `lg:` öneki olmadan
yazılmıştı; 390 px'te kaydırma sonrası ÜÇ metin düğümü örtülü ölçüldü.

**R6. Kırpma ve gizleme burada da çözüm değildir** (R3'ün bu bölüme uzantısı). Örtülen
metni `overflow`/`z-index` ile saklamak ihlali sürdürür; katman düzeni kökünden düzeltilir.

### Yükleme önceliği ve yer tutucu

**R7. Öncelik FOLD ÜSTÜ ölçütüne bağlanır, sabit sayıya DEĞİL.** Liste görünümlerinde
yalnız ilk ekranda GÖRÜNEN kartlar öncelikli (`priority`) olur; **fold üstünde kart yoksa
hiçbir karta priority verilmez.** Sabit bir N (ör. `index < 4`) yazmak yasaktır: N, sayfa
düzeni değiştiğinde sessizce yanlışa döner ve kimse fark etmez.

*Niçin sabit N reddedildi — ölçümle:* önce "ilk 4 karta priority ver" reçetesi önerildi
ve onaylandı. Uygulamadan önce fold üstü kart sayısı ölçüldü ve reçete ÇÜRÜDÜ:
`/tr/products` → ilk kart 928 px aşağıda, fold üstü kart **0** (üstte 3D karusel var);
`/tr/category/kanal-tipi-fanlar` → ilk kart 7960 px aşağıda, fold üstü kart **0**;
`/tr/products/vortice-lineo-quiet` → ilk kart 4151 px aşağıda, fold üstü kart **0**.
Fold ALTINDAKİ görseli öncelikli yapmak LCP'yi iyileştirmez; gerçek LCP adayıyla bant
genişliği için yarışır ve ölçüyü KÖTÜLEŞTİRİR. Yani reçete uygulansaydı görünürde iş
yapılmış, ölçüm gerilemiş olurdu.

**R8. Yüklenmemiş kart BOŞ bırakılmaz.** Görsel gelene kadar yer tutucu (iskelet ya da
bulanık önizleme) gösterilir; boş renk bloğu yeterli değildir. Yaşandı: müşteri ürün
listesinde "ilk sekiz geldi, sonraki dörtlü şerit boş, ondan sonraki daha erken geldi"
diye bildirdi. Ölçüldü: 42 görselin 42'si `lazy`, hiçbirinde `priority`/`fetchpriority`
yok; kaydırınca hepsi birden tetikleniyor ve tarayıcının eşzamanlı bağlantı sınırı
tamamlanma sırasını karıştırıyor. Bu tarayıcının NORMAL davranışıdır — kusur olan,
bekleyen kartın boş görünmesidir. Yani R8 bir hız kuralı değil **algı** kuralıdır.

**R9. Öncelik kararı BİLİNÇLİ yazılır.** Liste içinde kart render eden her çağrı
`priority` değerini açıkça verir (`true` ya da `false`); sessiz varsayılana bırakılamaz.
Yaşandı: `FamilyCard` `priority` desteğini taşıyor ve **bir** çağrı yerinde kullanılmış,
**altı** çağrı yerinde hiç verilmemişti — kural yazılı olmadığı için hiçbir kapı görmedi.

### Kapı durumu — neyin mekanik, neyin ELLE olduğu

| Kural | Kapı | Tür |
|---|---|---|
| R4 · R5 | `INV-BINISME-1` (e2e, `elementFromPoint`) | mekanik |
| R7 (dolaylı) · token'sız ölçü sınıfı | `INV-TOKEN-SINIF-1` (kaynak, AST) | mekanik |
| R9 | `INV-KART-ONCELIK-1` (kaynak, AST) | mekanik |
| R6 | — | **ELLE DENETİM** |
| R8 (yer tutucunun GÖRSEL kalitesi) | — | **ELLE DENETİM** |

R8'in "yer tutucu VAR mı" kısmı mekanikleştirilebilir; "yeterince iyi mi" kısmı
ölçülemez ve elle denetime bırakılmıştır. Bunu açıkça yazıyoruz ki kapı listesi
sahte-yeşil üretmesin: **kapısı olmayan kural, kapısı varmış gibi gösterilmez.**

## Değişiklik günlüğü

- v1.1 (2026-08-30, REC-89): "Binişme ve görünürlük" bölümü (R4-R6) ve "Yükleme önceliği
  ve yer tutucu" (R7-R9) eklendi. R7'nin sabit-N hâli, uygulanmadan önce yapılan fold
  ölçümüyle çürütüldüğü için fold ölçütüne çevrildi.
- v1.0 (2026-08-16, T050-VH): ilk sürüm — #540'ta elle bulunan taşma sınıfı kalıcı
  kapıya bağlandı; mobil viewport hattı açıldı.
