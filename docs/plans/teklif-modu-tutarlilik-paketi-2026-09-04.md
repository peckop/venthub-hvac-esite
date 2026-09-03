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
| 3D'ye referans veren dosya | **39** | `grep -rln 'VentHubCanvas\|MegaMenu3DBackground\|ThreeDAuthority\|Category3DIcon\|@react-three' src` |
| Müşteri yüzeyinde 3D **giriş noktası** | **6** | PDP rozeti · galeri düğmesi · otorite bloğu · kategori paneli · mega menü arkaplanı · /products orbital şerit |
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

**Ne:** Orbital 3D karusel şeridi kaldırılır (bayrakla). Yerine **mevcut kanıtlı desenle**
kategori kartları — sıfır yeni bileşen.

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
| 3D kodu ölü sayılıp knip tarafından silinmeye aday görünür | REC-119 ölü-kod turuna **istisna notu** düşülür: bayrakla kapalı ≠ ölü |
| Boş şerit/ızgara bozulması | Sarmalayıcı koşullu; görsel doğrulama **erişilebilirlik ağacıyla** (ham HTML sayımı yeterli değil — 09-03 dersi) |
| Paket büyür, tek PR taşımaz | 2.4 zaten ayrıldı; kalan üç alt-iş tek PR'da mantıklı çünkü **hepsi aynı bayrağı/aynı tabloyu** paylaşıyor |
| Geri açma | Tek satır: `UC_BOYUT_MUSTERI_YUZEYINDE = true` + §4.5 tablosundaki satırların geri yazımı |

**Migration: YOK.** Bu paket DB'ye dokunmaz.

---

## 5) Kabul ölçütleri

1. Müşteri yüzeyinde 3D giriş noktası sayısı **0** — erişilebilirlik ağacıyla ölçülür (ham HTML değil).
2. `quickOrder` kodda **0**, sözlükte **0**, §4.5 tablosunda **1 satır**.
3. `/products` h1 sayısı **1** (SSR HTML'de ölçülür).
4. Yeni kapı, geçerli bir sabotajla **kırmızı** verir; sabotaj geri alınınca yeşile döner.
5. Beş maddelik merge ritüeli yeşil **ve Recep onayı yazılı.**

---

## 6) Sıra

1. Bu plan → **plan-challenger red-team** (bağımsız alt-ajan, cetvel A2).
2. Red-team raporu + plan → **Recep'e 5 satırlık sunum**.
3. Onay gelirse kod: bayrak dosyası → yamanın uygulanması → kapı → sözlük → cetvel eki.
4. Merge: beş madde + **Recep onayı**.
