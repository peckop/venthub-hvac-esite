# Ürün Görseli Standardı — v0.1 TASLAK

> Durum: **TASLAK — Recep onayı bekliyor.** Her madde T139-VH pilotunda YAŞANMIŞ bir adıma
> ya da yakalanmış bir tuzağa dayanır (kanıt: `docs/audits/t139-urun-gorseli-pilotu-2026-08-21.md`);
> hayali madde yoktur. Kardeş cetveller: rendering-cache-standard (tazeleme),
> product-schema-standard (şema SSOT), storefront-design-standard (VentImage/CLS/alt),
> catalog-ingestion-standard (edinme hattı).

## 1. Tek kaynak (SSOT)

- Ürün görselinin tek kaynağı **`product_images`** tablosudur: `product_id`, `tenant_id`
  (ZORUNLU — kural 12), `path`, `alt`, `sort_order`.
- `sort_order = 0` = kapak. Sıralar boşluk içerebilir (ölü-link atlaması); tüketiciler sıraya
  değil `order by sort_order`'a dayanır.
- `path` **bucket-öneksiz** saklanır (`<tenant_id>/<product_id>/<sıra>.webp`); URL üretimi
  yalnız `src/lib/images/productImage.ts` resolver'ındadır. `image_url` alanları MİRAS'tır,
  yeni yüzey `image_url`'e bağlanamaz.

## 2. Depo ve biçim

- Bucket: `product-images` (public). Path şeması: `<tenant_id>/<product_id>/<sıra>.webp`.
- **Tek varyant** webp: kalite 82, genişlik tavanı 1600px, büyütme yok. Boyut varyantı
  ÜRETİLMEZ — küçük boylar Supabase transform / next-image katmanının işidir (aşırı
  mühendislik tuzağı, OPS şart-2).
- Şeffaflık (alpha) KORUNUR; arka plan basılmaz. (Pilot vakası: şeffaf görsel üç farklı
  görüntüleyicide üç farklı zeminle göründü — dosya değil zemin farkıydı.)

## 3. Kaynaktan edinme (üretici sitesi)

- İstekler **SIRALI**, aralık ≥ 1.5sn, paralel indirme YOK, dürüst User-Agent (OPS şart-1).
- Ürün eşlemesi: sayfa URL son parçası = `products.model_code`; dosya adındaki `_<kod>_`
  deseni filtre olarak kullanılır (aksesuar görselleri elenir — Matele vakası).
- HTML gerçekleri hesaba katılır: göreli URL + ters-bölü ayraç normalize edilir.
- **Kaynakta görsel yok** → uydurma/zorlama YOK, ürün fail-visible listeye (61181 vakası;
  zorunlu-alan-uydurma basıncı bilinen sınıftır).
- **Ölü link (404)** → tek görsel hatası koşuyu öldürmez; manifest'e adıyla yazılır.

## 4. Alt metin

- Pilot kararı: **dil-nötr** şablon `"<ürün adı> – <kod> – <sıra>"` (OPS şart-3).
- i18n-alt (TR/EN) tasarımı AÇIK SORU — karar verilmeden `alt` kolonuna dil-özel metin
  yazılamaz.

## 5. Tazeleme zinciri (rendering-cache-standard'a bağ)

- `product_images` INSERT/UPDATE/DELETE → `on_product_images_change` tetiği →
  `handle_supabase_webhook` → route dalı: aile PDP yolları (tr+en) + keşif/home tag +
  sitemap. Zincir 2026-08-21'de İLK kez gerçek veriyle kanıtlandı.
- Yükleme yapan süreç zincire GÜVENMEK yerine ÖLÇER: `net._http_response`'ta taze 200 +
  canlı sayfada yeni path referansı.

## 6. Yetki ve yazım kapısı

- Toplu/betik yazımı **service_role** iledir ve **Recep kapısıdır** (prod yazımı; envanter +
  geri-alma zorunlu — OPS şart-4: yazılan her nesne+satır envanter dosyasına işlenir,
  `--rollback` tek komutla geri alır).
- `product_images`'ta bugün INSERT/DELETE politikası YOK → admin-UI yüklemesi (T069) için
  **politika-önce-ekran**: ekran işi politika migration'ı (Recep kapısı) inmeden başlayamaz.

## 7. Kapı önerileri (henüz yazılmadı — sıradaki iş)

- **INV-IMG-1 (statik):** scripts/media betikleri şartları ihlal edemez — paralel indirme
  deseni, boyut-varyant üretimi, bucket-önekli path yazımı kırmızıdır.
- **INV-IMG-2 (davranışsal, sabotajla kanıtlanacak):** `product_images`'a satır ekleyen test
  akışı üç yüzeyin (keşif RPC + get_family_detail + admin sorgusu) yeni satırı gördüğünü
  doğrular.
