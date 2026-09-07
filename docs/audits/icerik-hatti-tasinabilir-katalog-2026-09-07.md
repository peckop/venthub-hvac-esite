# Taşınabilir katalog — dışa aktarım (REC-212, birinci yarı)

**Damga:** 2026-09-07 · **Şerit:** URUN-KATALOG · **Kayıt:** REC-212
**Yöntem:** elle (tek oturum) · **Cetvel:** `docs/standards/csv-import-export-standard.md` (dışa
aktarım kolon sözleşmesi orada; bu paket CSV değil JSONL olduğu için cetvele **yeni bölüm
gerekiyor** — yazımı bu işin devamındadır)

## Soruyu doğuran cümle

Recep 2026-09-07:

> "bugün PC alsam ve/veya USB'yi atsam ve bir kullanıcıya versem 'al bunları yükle' desem…
> yükleyebiliyor muyuz? tüm ürünler için"

O gün ölçülen cevap: **hayır**. Katalog yalnız canlı DB'de yaşıyordu. Elimizdeki tek dışa
aktarım admin CSV'siydi ve **7 kolon** veriyor (`id,name,sku,category_id,status,price,stock_qty`)
— 38 kolonluk ürünün beşte biri. Teknik özellik yok, fiyat listesi yok, görsel yok, aile yok.

## Ne yapıldı

`scripts/icerik-hatti/katalog-disa-aktar.mjs` — canlıyı **salt okur**, yedi tabloyu tek pakete yazar.

| Tablo | Satır | Kolon |
|---|---|---|
| brands | 5 | 6 |
| categories | 37 | 21 |
| product_families | 40 | 18 |
| price_lists | 3 | 10 |
| products | 375 | 38 |
| product_prices | 1044 | 17 |
| product_images | 1042 | 7 |
| **toplam** | **2546** | |

Paket boyutu **1,7 MB** — USB'ye de e-postaya da sığar.

## Üç sınav (ikisi sabotaj)

1. **Yeşil hâl:** 7 tablo / 2546 satır yazıldı, manifest'te tablo başına sha256.
2. **Determinizm:** iki koşum, veri dosyaları **bayt-eşit** (damga yalnız manifest'te).
   Böylece "katalog değişti mi" sorusu `cmp` ile cevaplanır.
3. **Sabotaj — eksik veri:** sayfalama tavanı simüle edildi (çekilen 10 ≠ sunucu 37) →
   **çıkış 1, hedef dizin hiç oluşmadı.**
4. **Sabotaj — ölçemediği hâl:** olmayan tablo verildi, kesin sayı alınamadı → **çıkış 1**.

### Sınav sırasında bulunan ve onarılan kusur

İlk sürüm tek fazlıydı: tabloyu okuyup **hemen yazıyordu**. Sabotaj sınavında kapı doğru
kırmızı verdi ama `brands.jsonl` diskte kaldı — **yarım paket**. Yarım paket USB'ye
kopyalandığında tam paketten ayırt edilemez ve manifest'i olmadığı için sessizce eksik yüklenir.
Onarım: iki faz — önce hepsi okunup doğrulanır, **sonra** yazılır. Ya hep ya hiç.

> Kapının kırmızı vermesi yeterli değil; kırmızı verirken **ne bıraktığı** da ölçülmeli.

## Bu paket henüz "taşınabilir katalog" DEĞİL — sınırı

* **Geri yükleyici yok.** Paket, geri yüklenebildiği ölçüde taşınabilirdir; bu yarısı
  ölçülmemiştir. Geri yükleyici canlıya yazacağı için **Recep kapısındadır**.
* **Görsel dosyaları pakette yok** — yalnız `product_images.path` yolları var (1042 satır).
  Görselsiz bir hedefe yüklenirse ürünler görselsiz açılır.
* **`tenant_id` olduğu gibi taşınır** — başka bir kuruluma yüklenirken yeniden eşlenmelidir.
* Betik bu üç sınırı **manifest'in içine de yazar**, çünkü paketi açan kişi bu belgeyi
  okumayabilir.

## Sıradaki adım

Recep'in kendi sıralaması (2026-09-07): *"taşınabilir katalog tarafını halledip sonra benim
veya senin kontrolümden geçirdikten sonra yüklememiz daha doğru değil mi?"* — yani geri
yükleyici + doğrulama, yüklemeden önce.
