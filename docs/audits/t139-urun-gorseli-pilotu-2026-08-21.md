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

## EK — VORTICE-169 koşumu sonrası bilinen durumlar (2026-08-21, Recep kararı)

**Diyagram-kapak kararı (Recep, 08-21 öğleden sonra):** 16 üründe vortice.com'da GERÇEK
ürün fotoğrafı yok, yalnız teknik çizim/performans eğrisi var — bu ürünlerde kapak şu an
DİYAGRAM görünüyor. Recep kararı: **bilinçli bırakıldı** ("diyagram da olsa boş karttan
iyi; gerekirse yenisini bulur koyarız"). Liste:
- VORT-E ATEX ailesinin tamamı (14): 40320-40333 (E 254-606 M/T ATEX)
- 15274 SLIMROOF 250 M ES
- 43157 VORT QBK SAL KC EVO 400 T4 (kardeş varyantların fotoğrafı VAR — ileride
  kardeş-fotoğrafı bağlama seçeneği mevcut, SEAT-ATEX kararıyla aynı sınıf)

Gelecek iyileştirme adayı (yapılmadı, kayıt): görsel önceliğinde quota (ölçülü ürün
çizimi) eğriden önce gelecek şekilde sıralanabilir; kardeş-varyant fotoğrafı fallback'i
Recep onayına bağlı.

**Koşum sonucu (özet):** 161/173 ürün görselli canlı; 624 satır; görselsiz 12 =
8 kaynakta-yok (16080 + Nordik HVLS 61181-61190) + 4 hayalet-kod (16076-79, PRICING'de).

## EK-2 — SEAT ve Nicotra koşumları (2026-08-21 öğleden sonra)

**SEAT (seat-ventilation.fr, Shopify `products.json`):** 53 SKU eşleşti ve yüklendi;
ATEX eki (Recep kararı: kaynak site ATEX modellerde aynı fotoğrafı kullanıyor →
baz-model fotoğrafı bağlanır) ile toplam **80/81 SEAT ürünü görselli**. Kalan 1:
STORM 10 XRM (ayrı türev, karar yok). Betikler: `seat-image-run.mjs` +
`seat-atex-manifest.mjs`. Fotoğraflarda gömülü "non-contractual photo" ibaresi var —
LEGAL bilgi kalemi olarak OPS'a işlendi.

**Nicotra (avensair.com/nicotra-gebhardt, Recep kaynağı + "eşleşenleri direk bağla"
GO'su):** 28/35 ürün eşleşti ve yüklendi (33 satır; RDH serisinde 2'şer görsel).
Eşleşmeyen 7 (avensair'da yok, vekil-foto-yok kuralı): ADH-500/560 E2, ADH-1000-K,
AT 18/13, RDH-500 E2, DD 9/7 300W (6M0671), DD 9/9 373W (6M0642).
Betik: `avensair-nicotra-run.mjs`. Ölçülen sınıflar:
- **Arama sonucu sorgu başına SINIRLI:** 3 DD ürünü yalnız boyut-bazlı sorguda
  ("DD 10", "DD 12") göründü — keşif tek genel sorguya bırakılamaz.
- **Sipariş kodu iki kaynakta 1↔N yazım farklı** (61090P/6N090P, 6M06HX/6N06HX) →
  eşleme KOD'a değil model tanımlayıcısına (boyut+watt+faz+kutup+hız) yapılır; kod
  rapora yazılır.
- Ürün görseli = sayfa carousel'indeki `thumbnail fancybox` img'leri; teknik tablo
  sekmelerindeki görseller alınmaz. AT/ADH/DD sayfaları seri fotoğrafı paylaşır
  (kaynak sitenin kendi tercihi; Recep GO'su bu kaynağa verildi).

**Gün sonu genel durum: 269/374 ürün görselli** (Vortice 161 + SEAT 80 + Nicotra 28).
Kalan: AVenS 51 (Recep arşivi bekleniyor) + Danfoss 34 (kaynak keşfedilmedi) +
tekil eksikler (yukarıdaki listeler). Kalıcı arşiv: `C:/Users/alize/venthub-media/`
(vortice-/seat-/nicotra-2026-08-21).
