# T139-VH — Ürün Görseli Pilotu (2026-08-21)

> Şerit: GORSEL · Registry: T135-VH (başlıkta [T139-VH]; ikilik bilinçli, OPS notu 08-21 06:44)
> Cetvel: rendering-cache-standard + product-schema-standard + storefront-design-standard +
> catalog-ingestion-standard; görsel-boru-hattı cetveli yoktu → taslak bu PR'da:
> `docs/standards/product-image-standard.md`

## Hazır satır

**5 pilot ürün (5 ayrı aile), 28 görsel uçtan uca CANLI ve ölçülmüş:** vortice.com'dan
indirildi → webp'e dönüştürüldü → `product-images` bucket + `product_images` satırları →
tetik/webhook zinciri KENDİLİĞİNDEN ateşledi → vitrin kartı + PDP galerisi + admin veri
katmanı üç yüzeyde doğrulandı. Migration GEREKMEDİ; her yazım envanterli ve tek komutla
geri alınabilir.

| Kod | Ürün | Aile | Görsel (galeri/ortam/teknik) |
|---|---|---|---|
| 11313 | Punto Evo Flexo MEX 100/4" LL 1S | punto-evo-flexo | 8 (4/3/1) + 1 ölü-link |
| 17160 | Lineo 100 Quiet | lineo-quiet | 3 (1/0/2) |
| 65196 | Air Door AD 1200 | hava-perdesi | 5 (3/1/1) |
| 12106 | Vort HR 350 Avel | isi-geri-kazanim | 5 (3/0/2) |
| 11522 | Vort Quadro Evo QE 100 LL | vort-quadro-evo | 7 (1/4/2) |

## Ölçümler (kanıt zinciri)

1. **Kod kolonu:** 5 haneli Vortice kodu = `products.model_code` (canlı DB; `sku` = `VRT-<kod>` türevi).
2. **URL keşfi KANITLI:** vortice.com ürün sayfası URL'sinin SON parçası = model_code
   (5/5 pilotta doğrulandı). Görsel dosya adları `70_EN_<kod>_Foto_WEB_<ürün_adı>_<sıra>_<id>`
   deseninde — kod VE ad çifte teyit sağlar. Kullanıcı (Recep) bir görseli bağımsız indirip
   kıyasladı: piksel-hash birebir eşleşti.
3. **HTML gerçekleri:** görsel URL'leri GÖRELİ ve çoğunlukla TERS-BÖLÜ ayraçlı
   (`/media2/Export\Inglese\...`); sayfada aksesuar görselleri de var (`/media2/Matele/`,
   kendi kodlarıyla) — ürün filtresi `_<kod>_` deseniyle yapılır.
4. **Dönüşüm:** tek webp varyant (kalite 82, tavan 1600px, büyütme yok), şeffaflık (alpha)
   KORUNUR — ölçüldü (`hasAlpha:true` girdi ve çıktıda). Küçük çıktılar (4.6KB kapak, 2.8KB
   ölçü çizimi) gözle doğrulandı, meşru.
5. **Yükleme:** 28 nesne + 28 satır (08:35). `sort_order 0 = kapak` her üründe; `tenant_id`
   zorunlu ve 28/28 dolu; path bucket-öneksiz `<tenant_id>/<product_id>/<sıra>.webp`.
   Envanter: her satır id + storage path → `--rollback` tek komut.
6. **Tazeleme zinciri İLK GERÇEK-VERİ KANITI:** `on_product_images_change` tetiği (canlı DB,
   enabled) → `handle_supabase_webhook` → route product_images dalı. Yükleme anında
   `net._http_response` 08:35:41-42 taze 200'ler; sayfalara elle dokunulmadı.
7. **Üç yüzey adıyla:**
   - **PDP** `/tr/products/vortice-punto-evo-flexo` canlı HTML: 8 görselin 8'i de next/image
     srcset'lerinde (kapak 41 ref, galeri kareleri 18'er) + alt metinler sayfada. CLS: next/image
     srcset/boyutlandırma mevcut.
   - **Keşif** `/tr/products`: aile kartında storage kapak referansı var.
   - **Admin listesi:** ProductsTableBody `product_images`'ı doğrudan sorguluyor (kod ölçümü +
     mevcut entegrasyon testi). Çalışır-ekran görüntüsü oturum gerektirir → Recep gözle
     doğrulayabilir (AÇIK KALEM).
   - Storage public URL: 200 `image/webp`.

## Ne otomatikti / ne elleydi

- **Otomatik:** sayfa keşfi (kod→URL arama), görsel çıkarımı/sınıflandırma, sıralı-nazik
  indirme (1.5sn aralık, dürüst UA), webp dönüşüm, yükleme + satır yazımı, envanter.
- **Elle (pilotta insan kararı):** pilot ürün seçimi; 61181'in çıkarılması; küçük-webp
  anomalilerinin gözle doğrulanması; prod-yazım kapısı (Recep GO + dar-adlı-süreli izin).

## Yeni ölçülen sınıflar (374 ölçeklemesi bunlara hazırlanmalı)

- **Kaynakta görsel YOK:** 61181 Nordik HVLS — sayfada yalnız `fakeImg.png` placeholder + PDF'ler
  (çift yöntemle ölçüldü). Davranış: uydurma/zorlama YOK, fail-visible listeye yaz.
- **Ölü link:** sitenin kendi 404 referansı (11313 eğri görseli). Davranış: tek görsel hatası
  koşuyu öldürmez, manifest'e adıyla yazılır, sort_order'da boşluk bırakır.

## ÇELİŞEN-MEVCUT (bugünkü kararlarla çelişen canlı durum)

1. **`image_url` çift başlılığı sürüyor:** `products` tablosunda `image_url` kolonu YOK; ama
   kod yüzeylerinde (resolver fallback'i, buildPaymentRequest, çeşitli tipler) yaşıyor.
   Görsel SSOT = `product_images` kararıyla çelişen bakiye; temizlik AYRI kalem.
2. **PDP resolver kullanmıyor:** ImageGallery/ProductDetailPageView, `lib/images/productImage.ts`
   resolver'ının KOPYASI mantığı taşıyor (W2.2 sahası, bilinçli). Tekilleştirme borcu duruyor.
3. **RLS boşluğu:** `product_images`'ta INSERT ve DELETE politikası YOK (yalnız SELECT-herkes +
   UPDATE-authenticated). Pilot service_role ile yazdı (doğru araç); ama T069 admin-UI
   yüklemesi RLS düzeyinde bugün İMKÂNSIZ → **politika-önce-ekran** (quotes sınıfının aynısı).
4. **İş emrindeki "tetik/webhook YOK" iddiası bayattı:** zincir W4'te kurulmuş; NLM ikizi
   08-16 fotoğrafıydı. Canlıdan ölçüldü, emir düzeltildi (OPS kabul, 08-21 07:04).

## Telif notu

Kaynak: vortice.com (Recep kararı 08-21 sabah; Avensair Vortice distribütörü). Üretici
görselinin bayi/distribütör sitesinde kullanımı sektör teamülü; yazılı izin durumu bu
raporda HÜKÜM DEĞİL, KAYITTIR — karar Recep'te. Dosyalar kaynak URL'leriyle izlenebilir.

## 374'e ölçekleme önerisi

1. **Keşif:** 374 ürünün model_code'u DB'den; kod→sayfa URL'si arama motoru üzerinden toplu
   keşif (vortice.com'a değil aramaya gider) ya da site-haritası taraması; bulunamayanlar
   fail-visible listeye.
2. **Tempo:** sıralı + 1.5sn → ~374 sayfa + tahmini ~1900 görsel ≈ 60-90 dk tek koşu; akşam
   saatinde tek oturumda koşulabilir, resume'lu (manifest zaten kaldığı yerden sürüyor).
3. **Sınıf payları pilottan:** görselsiz ürün (1/6 aday havuzunda), ölü link (1/29 görsel).
   374'te ~%15-20 fail-visible beklenmeli; bu bir hata değil ölçümdür, liste Recep'e gider.
4. **Otomasyon:** pilotta insan kararı gerektiren tek şey seçim ve anomali gözüydü; ölçekte
   anomali kapısı eşiklerle otomatikleştirilir (webp < 2KB VEYA çözünürlük < 300px → gözle
   doğrulama kuyruğu).
5. **Önkoşullar:** dar-adlı izin penceresi yeniden açılır (ya da yükleme Recep terminalinden);
   374 öncesi INSERT politika kararı T069 ile birlikte ele alınmalı.

## Açık sorular (Recep/ilgili şeride)

- **i18n-alt:** `product_images.alt` tek kolon; TR/EN alt tasarımı (JSONB mi, ayrı tablo mu)
  kararı → product-schema-standard genişletmesi.
- **Admin ekran-kanıtı:** oturumlu gözle doğrulama (Recep 1 dk).
- **Dar-adlı iznin kaldırılması:** OPS kuyruğunda; bu PR merge olunca hatırlatılacak.
