# Teklif Modu Tutarlılık Paketi — plan (URUN, 2026-09-04)

> **Durum: PLAN — kod yazılmadı.** Kural 1 (No-Plan-No-Code) gereği önce bu belge,
> sonra plan-challenger red-team, sonra Recep'e sunum, sonra kod.
> **Merge: Recep onayı zorunlu** (vitrinde müşteriye görünür değişiklik).

## KAYNAK/CETVEL

| | |
|---|---|
| **Yöneten cetvel** | `docs/standards/vaat-butunlugu-standard.md` — *"Bir vitrin yüzeyi, arkasında bugün çalışan bir yetenek olmayan hiçbir ticari vaadi yazamaz."* |
| **Yardımcı cetveller** | `docs/standards/3d-webgl-standard.md` (3D yüzeyi) · `docs/standards/quote-standard.md` (teklif modu semantiği) · `docs/standards/rendering-cache-standard.md` (üretim/tazeleme) |
| **Kapı** | `INV-VAAT-SIZINTI-1` → `src/__tests__/conformance/vaat-sizintisi.test.ts` |
| **Karne tazeliği** | Ölçümler 2026-09-04, bu depoda (`C:/tmp/vh-urun-rec89`, taban `origin/master@480352bd`) koşuldu. |
| **YÖNTEM** | Tek şerit (URUN), tek dal, tek PR. Plan aşaması için plan-challenger alt-ajanı (cetvel A2: üretici ≠ yargıç). |

**Cetvel boşluğu — bu işin kapsamında yazılacak:** mevcut cetvel *ticari vaadi* (ödeme,
taksit, kargo) yönetiyor. Bu paket bir sınıf daha ekliyor: **yetenek vaadi** — "Etkileşimli
3D", "Hızlı Sipariş" gibi, arkasında çalışan bir yetenek olmadan **eylem** vaat eden yüzeyler.
Cetvele §1.4 olarak eklenecek ve §4.5 geri-dönüş tablosu genişletilecek.

---

## 0) Niçin — tek cümlelik teşhis

Site teklif modunda: 23 aktif kategorinin 23'ünde `hide_price=true`, çevrimiçi ödeme kapalı.
Buna rağmen vitrin hâlâ **sipariş dili** konuşuyor ("Hızlı Sipariş") ve **var olmayan bir
yetenek** gösteriyor ("Etkileşimli 3D" rozeti + 3D galeri düğmesi). Bu, REC-104'te ölçülen
kusurun aynı sınıfı: *iki yüzeyin birbirinden habersiz konuşması.*

---

## 1) Ölçülmüş mevcut durum (varsayım değil)

| Ne | Ölçüm | Nerede |
|---|---|---|
| 3D'ye referans veren **kaynak** dosya | **39** | aynı grep `--include='*.ts' --include='*.tsx'` **ile**. ⚠Include'suz hâli **72** döner (companion `.md`'leri sayar) — red-team A1 ihlali olarak yakaladı, düzeltildi. |
| Müşteri yüzeyinde 3D **giriş noktası** | **5** (~~6~~) | PDP rozeti · galeri düğmesi · kategori paneli · mega menü arkaplanı · /products orbital şerit |
| ⛔**Otorite bloğu — LİSTEDEN ÇIKARILDI** | `AuthorityRenderer`'ın canlı tek çağıranı **admin** ([CategoryBuilderView.tsx:519](src/views/admin/CategoryBuilderView.tsx#L519)); müşteri sarmalayıcısı `CategoryAuthoritySection` **sıfır tüketicili** (ölü kod) | Küresel bayrak orayı kapatsaydı bir vaadi değil **admin editörünü** kapatırdı — üstelik `src/components/admin/**` benim şeridim değil. Ölü sarmalayıcı REC-119'a bildirilir, dokunulmaz. |
| "Hızlı Sipariş" yüzeyi | **1 kod + 2 sözlük anahtarı** | [StickyHeader.tsx:268](src/components/StickyHeader.tsx#L268) · `tr.ts:720` · `en.ts:744` |
| `/products` üst şeridi | `CategoryOrbitCarousel`, `ssr:false` dinamik | [ProductsDiscoveryView.tsx:79-100](src/views/ProductsDiscoveryView.tsx#L79-L100) |
| Katalog giriş noktası sayısı | **3** (CategoryHubOverlay · EliteMegaMenu · Hızlı Sipariş) | `StickyHeader.tsx:264-292` |
| `src/config/features.ts` | **YOK** — donmuş yama onu içe aktarıyor | `ls src/config/features.ts` → yok |

### ⭐Donmuş yamanın gerçek durumu (tahmin değil, ölçüm)

`stash@{0}` (6 dosya, 168 satır) **taze master üzerinde 6 dosyanın 5'inde temiz uygulanıyor**;
yalnız `ProductDetailPageView.tsx` düşüyor (import bloğu kaydı — tek hunk, elle taşınır).
Yama **bayrak-tabanlı** yazılmış (`UC_BOYUT_MUSTERI_YUZEYINDE`) ama bayrağın yaşadığı
`src/config/features.ts` **hiç yaratılmamış**. Yani yama tek başına derlenmez.

**Sonuç:** "sıfırdan yaz" gerekmiyor; iş = bayrak dosyasını yaz + 5 dosyayı uygula + 1 hunk'ı
elle taşı. Bu, "temiz uygulanması RİSK" şeklindeki önceki tahminimi ölçümle daralttı.

---

## 2) Kapsam — dört alt-iş

### 2.1 · 3D müşteri yüzeyinden tam kapatma

**Ne:** Altı giriş noktasının hepsi tek bayrağın (`UC_BOYUT_MUSTERI_YUZEYINDE = false`)
arkasına alınır. **Bileşenler SİLİNMEZ** — 3D kod ağacı (39 dosya) yerinde kalır.

**Niçin bayrak, niçin silme değil:** (a) 3D geri açılacak bir yetenek, silme geri dönüşü
pahalılaştırır; (b) `3d-webgl-standard.md` yürürlükte bir cetvel — kodu silmek cetveli
öksüz bırakır; (c) tek bayrak, altı yüzeyin **birlikte** açılıp kapanmasını garanti eder —
bugünkü kusur tam da yüzeylerin ayrı ayrı karar vermesiydi.

**Niçin tetikleyici de kapanır:** "tıklanmadıkça yüklenmiyor" savunması müşteri tarafında
geçersiz — müşteri düğmeyi **görür ve tıklar**. Rozet ("Etkileşimli 3D") de bir vaattir.

### 2.2 · `/products` sadeleştirme

**Ne:** Orbital 3D karusel şeridi kaldırılır (bayrakla).

⛔**v1'in "sıfır yeni bileşen, mevcut kanıtlı desen" iddiası KANITSIZDI ve geri çekildi.**
Ölçüldü: o görünümde kategori kartı deseni **yok** (var olan `FamilyCard` = *aile* kartı,
başka şey), ve `initialCategories` prop'u bileşende **destructure bile edilmiyor**.
Yerine ne geleceği **ayrı bir tasarım kararıdır**; bu paket şeridi **kaldırmakla yetinir**.
Boşluk bırakmamak için sarmalayıcı da koşullu (aşağıda).

⚠**İkinci render yolu var:** `ProductsDiscoveryView`, `/products` dışında
[CategoryMasterView.tsx:130](../../src/views/CategoryMasterView.tsx#L130)'da da render
ediliyor (kategori **bulunamadı** dalı). Buraya kart eklenseydi mükerrer üretirdi —
şeridi kaldırmak bu dalda da doğru davranır.

⚠**Sarmalayıcı da koşullu olmalı.** Yalnız içeriği kapatmak, sayfanın üstünde boş bir şerit
ve kenarlık bırakır. Bu, cetvel §2'nin ("vaat kapatılırken düzen de kapatılır") aynı sınıfı.

⚠**h1 korunur.** [ProductsDiscoveryView.tsx](src/views/ProductsDiscoveryView.tsx) içindeki
h1 dün REC-127 ile eklendi (#959); sadeleştirme onu düşürmemeli. Kapı: `INV-SEO-H1-1`.

### 2.3 · "Hızlı Sipariş" kaldırma

**Ne:** Nav düğmesi + iki sözlük anahtarı kaldırılır.

**Niçin:** Sipariş verilemeyen bir sitede "Hızlı Sipariş" **yetenek vaadi**dir; üstelik
gittiği yer `?all=1&sort=bestsellers` — REC-92'de veri-dayanaksız bulunan "çok satanlar"
sıralaması. İki kusur tek düğmede.

**Cetvel §3 gereği:** anahtar silinir, yerine anahtar bırakılmaz; niçin kaldırıldığı
**yorumda** yazılır ve §4.5 geri-dönüş tablosuna satır eklenir.

### 2.4 · Navigasyon birleştirme

**Ne:** Katalog için üç giriş noktası var (kategori paneli, mega menü, Hızlı Sipariş).
2.3 birini zaten kaldırıyor. Kalan ikisinin **hangisi kalacağı bir TASARIM kararıdır** —
bu paket onu **kendi başına vermez**.

⚠**Yapısal karar pakete gömülmez.** Menü yeri/mimarisi Recep'e **tek başına** sorulur.
Bu paket yalnız 3D arkaplanları kapatır; iki menünün birleştirilmesi ayrı karara,
ayrı PR'a bırakılır.

---

## 3) Kapılar — bu paket neyi ölçülebilir yapar

| Kapı | Ne ölçer | Sabotaj (ayırt edici olmak zorunda) |
|---|---|---|
| `INV-UCBOYUT-KAPALI-1` (**yeni**) | Müşteri ağacındaki 3D giriş noktalarının **hepsi** bayrağa bağlı mı | Tek giriş noktasını bayraktan çıkar → KIRMIZI. *Hedef, değişen kuralın YÖNETTİĞİ yüzey olmalı.* |
| `INV-VAAT-SIZINTI-1` | §4.5 tablosunun varlığı + boş olmaması | Tabloya eklenen satırlar silinsin → KIRMIZI |
| `INV-6` (ölü anahtar) | `quickOrder` anahtarı kodda kullanılmadan kalırsa | Anahtarı bırak, kullanımı sil → KIRMIZI |
| `INV-SEO-H1-1` | `/products` h1 tekilliği | h1'i h2'ye düşür → KIRMIZI |

**Kapının göremeyeceği (açıkça yazılıyor):** bayrağın **değeri**. Kapı "her giriş noktası
bayrağa bağlı mı" der, bayrağın `false` olduğunu değil — cetvel §4'ün aynı sınırı.

---

## 4) Risk ve geri alma

| Risk | Karşılık |
|---|---|
| ~~knip 3D kodunu ölü sayar~~ **ABARTILMIŞTI** — knip ne CI'da ne husky'de koşuyor; beş 3D kapısı da kaynak-tarayıcı ve bayrak onları kırmıyor (ölçüldü) | Yine de REC-119 ölü-kod turuna not: **bayrakla kapalı ≠ ölü** |
| ⭐**Bayrak env mi sabit mi — v1 SÖYLEMİYORDU** | Depodaki kanıtlı desen `process.env.NEXT_PUBLIC_ODEME_ACIK === '1'`. Beş tüketicinin hepsi `'use client'` → env seçilirse `NEXT_PUBLIC_` **zorunlu**, unutulursa sessiz kusur. **Hüküm: derleme-zamanı SABİT** (`export const UC_BOYUT_MUSTERI_YUZEYINDE = false`). Bedeli dürüstçe yazıyorum: geri açma "tek satır" değil, **tek satır + PR + deploy**. Karşılığında sessiz env tuzağı yok. |
| **SSOT çatallanması** — `quoteMode.ts` "hüküm TEK yerde yaşar" diyor, bu bayrak ikinci bir küresel sabit | Kabul ediliyor ve gerekçesi yazılıyor: teklif modu **veriye** bağlı (`hide_price`), 3D ise veriye bağlı değil, **kurumsal bir sunum kararı**. Farklı eksen olduğu için ayrı sabit meşru. |
| **Sözlükte bayrağın göremeyeceği metin vaatleri** | `home.hero` içindeki "3D keşif" ifadeleri, `common.view3D`, `pdp.threeDAuthority.*` — bayrak bunları kapatmaz. §4.5 tablosuna **satır satır** girer. |
| **`INV-VAAT-SIZINTI-1` `StickyHeader`'ı taramıyor** (ölçüldü: `VITRIN_YOLLARI`'nda yok) | Yarın aynı yere sipariş dili geri yazılır ve kapı görmez → `StickyHeader.tsx` **kapsama eklenir** |
| Boş şerit/ızgara bozulması | Sarmalayıcı koşullu; görsel doğrulama **erişilebilirlik ağacıyla** (ham HTML sayımı yeterli değil — 09-03 dersi) |
| Paket büyür, tek PR taşımaz | 2.4 zaten ayrıldı; kalan üç alt-iş tek PR'da mantıklı çünkü **hepsi aynı bayrağı/aynı tabloyu** paylaşıyor |
| Geri açma | Tek satır: `UC_BOYUT_MUSTERI_YUZEYINDE = true` + §4.5 tablosundaki satırların geri yazımı |

**Migration: YOK.** Bu paket DB'ye dokunmaz.

---

## 5) Kabul ölçütleri (red-team sonrası düzeltildi)

⛔**v1'in 1. ölçütü SAHTE-YEŞİLDİ ve kaldırıldı.** "Erişilebilirlik ağacıyla 3D giriş noktası
0" diyordum. Ölçüldü: `OrbitalProductsShowcase`, `MegaMenu3DBackground`, `Category3DIcon`,
`CategoryOrbitCarousel` dosyalarında **sıfır** `aria-*`/`role`/`alt` var ve WebGL canvas
a11y ağacına düğüm katmaz — yani ölçüt bayrak **açıkken de kapalıyken de 0** verirdi.
*Ayırt etmeyen gösterge ölçüm değildir* — dünkü dersin aynısı, bu kez kendi planımda.

**Yerine geçen ölçütler:**

1. **Kaynak düzeyinde:** beş 3D giriş noktasının **hepsi** bayrağa bağlı (yeni kapı ölçer).
2. **Davranış düzeyinde:** `/tr/products` SSR **CSR-bailout sayısı 1 → 0'a düşer.**
   ⚠[tests/smoke/ssr-html.spec.ts:29](../../tests/smoke/ssr-html.spec.ts#L29) bunu
   `maxBailouts: 1` ve `toBeLessThanOrEqual` ile yazıyor — şerit kalkınca sayı düşer ama
   **kapı yeşil kalır**, yani kazanç kayda geçmez. Eşiğin `0`'a **indirilmesi** işin parçası.
3. `quickOrder` kodda **0**, sözlükte **0**, §4.5 tablosunda **1 satır**.
4. `/products` h1 sayısı **1**.
5. Yeni kapı geçerli bir sabotajla **kırmızı** verir; sabotaj geri alınınca yeşile döner.
6. Beş maddelik merge ritüeli yeşil **ve Recep onayı yazılı.**

### ⚠Bu kabul ölçütlerinin CI kapısı BUGÜN YOK — işin parçası
`ssr-html.spec.ts` `describe.skipIf(!SMOKE_BASE_URL)` ile korunuyor ve **`SMOKE_BASE_URL`
hiçbir workflow'da tanımlı değil** (ölçüldü). Yani 2. ve 4. ölçüt CI'da hiç koşmuyor.
Ölçütü yazıp koşmayan kapıya bağlamak, "yazıldı sanılan ama var olmayan kapı"dır.

### ⭐Kendi borcum, dün doğdu ve bu pakette kapanır
Aynı spec `/tr/products` için `markers: [/<h2[\s>]/]` bekliyor. **#959 ile o h2'yi h1
yaptım ve sayfada başka h2 kalmadı** — yani belirteç bayat, spec koşulsa **düşerdi**.
Düşmedi çünkü hiç koşmuyor. Belirteç `<h1`'e çekilecek.

---

## 6) Sıra

1. Bu plan → **plan-challenger red-team** (bağımsız alt-ajan, cetvel A2).
2. Red-team raporu + plan → **Recep'e 5 satırlık sunum**.
3. Onay gelirse kod: bayrak dosyası → yamanın uygulanması → kapı → sözlük → cetvel eki.
4. Merge: beş madde + **Recep onayı**.
