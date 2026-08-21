# Ürün Görseli Standardı — v0.2

> Durum: **v0.2 — 2026-08-21 günü 339/374 ürünlük dokuz koşumla ÖLÇÜLMÜŞ.** v0.1 (pilot) maddeleri korunur;
> §8-§11 o günün kararlarından ve tuzaklarından gelir (kanıt: `docs/audits/t139-urun-gorseli-pilotu-2026-08-21.md`
> ve `docs/audits/t139-gun-sonu-raporu-2026-08-21.md`). Hayali madde yoktur.
> Kardeş cetveller: rendering-cache-standard (tazeleme),
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

## 8. İçerik kuralı — hangi fotoğraf bir ürüne bağlanabilir (Recep, 2026-08-21)

Üç kural, öncelik sırasıyla; hepsi `product_images` satırının kaynağını izlenebilir kılar
(manifest `source_url` alanına kaynak URL + karar notu yazılır):

1. **Ürünün KENDİ fotoğrafı varsa yüklenir, yoksa yüklenmez.** Vekil foto YOK: "benzer
   ürün", "aynı boyut başka seri" bağlanmaz (HEATMASTER≠KENTALFAN vakası — motor/boyut
   kodları birebirdi, ürün sınıfı farklıydı; bağlanmadan soruya düşürüldü, doğru çıktı).
2. **Üretici-aynı-foto istisnası, KAYNAKTA doğrulanır:** üretici/kaynak site bir türevde
   (ATEX, seri üyesi) aynı fotoğrafı kullanıyorsa o türeve de bağlanabilir — ama bu
   "sitede o türevin sayfası VAR ve aynı görseli taşıyor" ölçümüyle kanıtlanır (SEAT ATEX:
   Recep siteyi inceledi; KENTALFAN: Casals fanware 14/14 varyant tek seri fotoğrafı;
   Nicotra DD/RDH: aynı seri fotoğrafı). Ölçülmeden "muhtemelen aynıdır" BAĞLANMAZ.
3. **Recep URL-ile-bağlama yetkisi:** Recep bir ürün için kaynak URL verirse o fotoğraf
   bağlanır (danfoss.com resmi sayfaları FC-101/102/51 → kapak; DD 7/7 150W → 2 DD SKU).
   Kapak tercihi Recep'in ("danfossun kendisi kapak olsun"); karar `source_url`'de kalır.

**Diyagram-kapak:** kaynakta yalnız teknik çizim/performans eğrisi varsa kapak diyagram
olarak BİLİNÇLİ bırakılır ("boş karttan iyi"), ürün listesi rapora yazılır (16 Vortice
ürünü: VORT-E ATEX 14 + 15274 + 43157). Eğri yerine ölçülü çizimin öne alınması gelecek
iyileştirme adayıdır.

## 9. Fail-visible listesi politikası

- Eşleşmeyen ürün **sessizce atlanmaz**: manifest `unmatched[]`'e `sku + name + reason`
  ile yazılır, koşum sonunda ekrana dökülür, Recep'e **adıyla** raporlanır.
- Çok-adaylı eşleme (token-altkümesi birden fazla kartı tutuyorsa) = fail-visible, tahmin
  YOK. Tek aday + model-tanımlayıcı birebir = eşleşme.
- Sipariş kodu iki kaynakta farklı yazılabilir (61090P/6N090P, 1↔N) → eşleme KOD'a değil
  model tanımlayıcısına (boyut+watt+faz+kutup+hız) yapılır; kod rapora yazılır.
- Kalan liste "yapılamadı" değil "kaynak işareti bekliyor" sınıfıdır; Recep kaynak
  gösterince `url-fill-manifest.mjs` ile aynı kalıpla kapanır.

## 10. Keşif dersleri (ölçülmüş, tekrar yaşanmasın)

- **Aramada-yok ≠ sitede-yok.** Site araması sorgu başına sonucu SINIRLAYABİLİR
  (avensair: 3 DD yalnız "DD 10"/"DD 12" sorgusunda çıktı) ve bazı terimlerde BOŞ
  dönebilir (hız/kentalfan/plug/isitici). Keşif tek genel sorguya bırakılmaz.
- **Statik HTML tam liste DEĞİLDİR:** "Daha Fazla" butonlu listelemede ürünler JS ile
  gelir. avensair ucu: aynı kategori URL'sine `?offset=9,18,…&_token=<sayfadaki token>`
  GET → JSON `{products:[kart-html], end}`; kartlardaki `title` eşleme için altındır.
- **Doğrudan-URL yoklaması + içerik kapısı:** slug tahminiyle sayfa çekilir; site olmayan
  slug'a da soft-200 dönebilir → ürün görseli (carousel `thumbnail fancybox` img sayısı)
  ayırt eder. **Kontrol kolu zorunlu:** bilinen-olmayan bir slug'la kapının 0 döndüğü
  gösterilir.
- Üst kategori sayfaları alt-kategori KARTI döndürür (duman-egzoz → aksiyal-duman-egzost);
  alt kategoriler ayrıca taranır.
- Vortice: geçerli-kategori+kod HER kodu çözümlüyor (EOL dahil), `_<kod>_` içerik kapısı
  şart; hayalet kodlar (16076-79) 200 döner ama içerik taşımaz.
- Shopify mağazalar: `products.json?limit=250` yapılandırılmış; ad eşlemesi yeter.
- Üretici fotoğraflarında gömülü ibare olabilir ("non-contractual photo", SEAT) — LEGAL
  bilgi kalemi olarak kayda geçer, bağlamayı engellemez (karar Recep'te).

## 11. Marka → kaynak haritası (2026-08-21 itibarıyla)

| Marka | Kaynak | Durum |
|---|---|---|
| Vortice | vortice.com (kod→URL, `_<kod>_` kapısı) | 161/173 |
| SEAT | seat-ventilation.fr (Shopify) + ATEX istisnası | 80/81 (XRM açık) |
| Nicotra Gebhardt | avensair.com/nicotra-gebhardt (+ DD fill Recep) | 35/35 |
| AVenS | avensair.com kategorileri + Daha-Fazla ucu; KENTALFAN = **Casals** fanware | 29/51 |
| Danfoss | avensair DanfossFrekansInventorleri + danfoss.com resmi (kapak) | 34/34 |

Betikler `scripts/media/` (tümü resume'lu, envanterli, `--rollback`'li). Kalan 35 ürün ve
sınıfları gün-sonu raporundadır.
