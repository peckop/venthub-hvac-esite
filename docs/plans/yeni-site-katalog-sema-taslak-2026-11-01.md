# OPS-180 §10 — Sıfırdan katalog şeması (TASLAK, metin; dosya ve migration yok)

> **DURUM: TASLAK** (1 Kasım 2026). Ana belge: [yeni-site-gecis-tek-resim-2026-11-01.md](yeni-site-gecis-tek-resim-2026-11-01.md) §10. Kaynak: OPS ortak notu. Dosya ve migration yok; her migration Recep onayıyla (kural 13).

Plan ajanı, 1 Kasım ~18:25. Kaynak: Venthub New veri dosyaları (yerel önizleme kopyası, assets/veri/*) + src/types/database.types.ts. Bu bölüm taslağın §8'ini ("yerinde sıkılaştırma", GEÇERSİZ) yerine geçer. Çerçeve: katalog tarafı yeni tablolarla sıfırdan; admin, sepet, ödeme, teklif, fiyat motoru korunur ve yeni tablolara bağlanır.

## 0. Her tabloda ortak
- `id uuid PK`, `tenant_id uuid NOT NULL DEFAULT jwt_tenant_id() REFERENCES tenants` + indeks, `created_at`, `updated_at` (tetik).
- `durum IN ('taslak','yayinda','arsiv')`, fiziksel silme yok; `kaynak text`.
- RLS okuma: anon/authenticated yalnız kendi kiracısının `yayinda` satırları. Yazma: `tenant_id = jwt_tenant_id() AND is_user_admin()` (kural 12).
- `denetim_izi_yaz` tetiği → admin_audit_log (kural 11).
- Vitrinde görünen her tabloda `handle_supabase_webhook()` tetiği + route.ts handler dalı + INV-RENDER-2 satırı.
- Slug deseni `^[a-z0-9]+(-[a-z0-9]+)*$`.

## 1. Yeni katalog tabloları
| Tablo | Amaç | Ana kolonlar | Kural |
|---|---|---|---|
| katalog_kategori | 3 kademe (karar 410) | ust_id, kademe, kod (kanonik EN), slug_tr/en, ad_tr/en, kisa_ad_tr/en, ikon, gorsel_yol, aciklama_tr/en, kart_kolonlari[], sira | kademe 1-3, üst+1, döngü yok; (tenant,kod),(tenant,slug_tr),(tenant,slug_en) tekil → karar 407 tek segment adres |
| katalog_kategori_sss | Grup SSS | kategori_id, sira, soru/cevap tr/en | yayında iki dil dolu |
| katalog_marka | Marka | kod, ad, slug, logo_yol, foto_yollari[], mensei_tr/en, kurulus_yili, merkez, grup, web_url, yetkili_distributor, sira | web_url https |
| katalog_aile | Seri (vitrin birimi) | marka_id, kategori_id (yaprak), seri_kodu, ad/kisa_ad/slug/aciklama tr/en, kapak_gorsel_yol, sira | kategori yaprak olmalı (tetik) |
| katalog_model | SKU | aile_id, sku, model_kodu, ad/kisa_aciklama/slug tr/en, teknik jsonb, teklif_modu (vars. true), kdv_orani (vars. 20) | sku `^[A-Z0-9-]+$` tekil; teknik anahtarları katalog_ozellik'te; satıştaysa geçerli standart fiyat şart |
| katalog_model_stok | Yalnız yönetici | model_id PK, stok_adedi, dusuk_stok_esigi, depo_yeri, barkod | anon/authenticated GRANT yok; vitrin yalnız RPC'den `stokta bool` |
| katalog_model_gorsel | Galeri | model_id, yol, sira, alt_tr/en | yol ilk parçası = tenant_id; Storage dosyası yerinde kalır |
| katalog_model_kademe | Ses ve eğri (hız kademesi) | kademe_no, guc_w, akim_a, devir_dk, debi_m3h, basinc_pa, ses_lp_dba, egri_pq/pw, ses_lw/lp jsonb, kalite | eğri [x,y] x artan; kaynak zorunlu |
| katalog_ozellik (+_deger, +_grup) | Özellik sözlüğü | anahtar, etiket_tr/en, grup, birim, sira, bicim | grup listesi; kullanımdaki anahtar silinmez |
| uygulama_alani, uygulama_kumesi, uygulama_bolumu, uygulama_bolum_kalemi, katalog_aile_uygulama, uygulama_mahal, uygulama_mahal_parca | Uygulama alanları, bölümler, mahaller | uygulama-alani.json yapısı | kalem aile_id o kategoride olmalı |
| icerik_yazi, icerik_yazi_aile | Rehber/blog | kod, tur, raf, slug/baslik/ozet tr/en, govde/sss/vurgu jsonb, kaynaklar[], yayin_tarihi, okuma_dk | jsonb dizi CHECK |
| icerik_yasal | Yasal metinler | kod (9 anahtar), baslik/govde tr/en, surum, yururluk | onay kaydı sürüme bağlı |
| vitrin_ayari | Kiracı başına tek satır | garanti_yil, stok_gosterimi (sor/goster/gizle), sirket jsonb, yasal_deger jsonb, satis_kipi | garanti 0-10 |

Kapsam dışı: il listesi (kod sabiti), birim.json, urun-secici.json, mutfak-havalandirma-dw172.json (kodda kalır; dal kimlikleri yayın testiyle katalog_kategori.kod'a karşı denetlenir).

Venthub New alan eşlemesi: katalog.kok/dal/aile/urun → kategori/aile/model/gorsel/fiyat/stok/kademe; kart-dili → kisa_ad + kart_kolonlari; ozellik-sozlugu → ozellik tabloları; lineo-quiet-veri → model_kademe (VRT-<anahtar>); marka-bilgi + logolar → marka (marka fotoğrafı kaynakta yok); uygulama-alani, seri-uygulama-etiket, teklif-sektor-eslem → uygulama tabloları; grup-sss → kategori_sss; rehber.json + makale-*.json → icerik_yazi; yasal-icerik → icerik_yasal + vitrin_ayari; katalog.js kiraci.guven → vitrin_ayari + yetkili_distributor. eskiSlug → adres_yonlendirme. Sayaçlar saklanmaz, görünümden türetilir. Model kodu JSON'da yok, bugünkü products.model_code'dan sku ile alınır.

## 2. Fiyat (karar 412)
- katalog_fiyat_listesi: kod (standart/bayi/kurumsal), segment, para_birimi, geçerlilik, aktif.
- katalog_model_fiyat: model_id, liste_id, net (>0), kdv_orani, brut GENERATED (net×(1+kdv/100)), gecerli_bas/bit, turetilmis; tekil (model, liste, para birimi, gecerli_bas). JSON'daki [101680.55, 122016.66] tam ×1,20. Anon/authenticated için GRANT ve SELECT politikası YOK.
- Teklif modu model düzeyinde; aile, tüm modelleri teklif modundaysa teklif modunda (görünümde türetilir). Satıştaki modelin son standart fiyatı silinemez.
- Görünür fiyatın tek yolu `vitrin_fiyat(uuid[])` (SECURITY DEFINER, en çok 100 kimlik): teklif modu / yayında değil / satış kipi kapalı ise net ve brüt NULL. Anon → standart liste; oturumlu → organizations.tier_level. Yalnız PDP, JSON-LD Offer, sepet, checkout kullanır; quoteModeHesapla sadeleşir.
- Listeleyen RPC'ler fiyat döndürmez. Bekçi testi INV-FIYAT-SIZINTI-3: pg_proc'ta izin listesi dışı katalog_model_fiyat başvurusu ve anon/authenticated SELECT hakkı kırmızı.
- Fiyat motoru (pricing_rule, pricing_policy, product_costs, computePriceFromRule) korunur, FK'leri döner, katalog_model_fiyat'ı yazar.

## 3. Korunan iş tablolarının yeniden bağlanması
- venthub_order_items → katalog_model RESTRICT + product_snapshot jsonb (sku, model kodu, adlar, aile/marka, görsel, teknik özet, liste, net, KDV, brüt); ikiz eski kolonlar tablo boşken düşer.
- venthub_quote_items → RESTRICT + sku ve snapshot eklenir.
- cart_items → model CASCADE, price_list → katalog_fiyat_listesi; snapshot yok, fiyat checkout'ta sunucuda yeniden okunur; teklif modundaki model sepete girmez.
- inventory_movements, purchase_order_items/goods_receipts, product_costs, pricing_rule/policy, project_items (tenant_id eklenir), wizard_selections, product_authorities, product_search_index, search_reindex_queue, category_mapping_rules → yeni tablolar. inventory_summary/velocity, reserved_orders görünümleri yeniden yazılır.
- Yeniden yazılacak RPC'ler: get_family_detail, get_product_families_enriched, get_category_counts, get_display_prices/display_price* (→ vitrin_fiyat), fts_search_products, arama_*, get_search_suggestions, admin_search_products, create_quote_with_items, process_order_stock_reduction/restore, process_goods_receipt, url_takma_ad_coz.
- Test verisi temizliği (devirde, tek migration): sipariş/ödeme/iade/kargo/teklif/sepet/proje tabloları önce depo dışına dökülür (kişisel veri), sonra bağımlılık sırasıyla TRUNCATE, sayaçlar sıfırlanır; durum makineleri ve ödeme defteri kuralları değişmez.

## 4. Doğrulama kapısı ve önizleme (karar 413)
- `katalog_satir_dogrula(tablo, satir jsonb)` tek doğruluk kaynağı: zorunlu alan, desen, FK, yaprak kategori, teknik anahtar/tip, kademe, slug tekilliği; yayında ise EN ad/slug, görsel, uygulama etiketi, satıştaysa fiyat.
- Her katalog tablosunda BEFORE INSERT/UPDATE tetiği bu fonksiyonu çağırır (service_role da atlayamaz); basit kurallar ayrıca CHECK.
- `katalog_onizle(tablo, satirlar)`: yazmaz; satır başına ekle/güncelle/değişmez + hatalar + fark, parti içi ve DB çakışması.
- `katalog_yukle(tablo, satirlar, kuru_kosu=true)`: tek hata → hiçbir satır yazılmaz; upsert (tenant, sku|kod). Panel formu, panel CSV ve katalog betiği aynı RPC. UnoPIM yok.

## 5. Veri yükleme sırası
1. Sözlükler (özellik, marka, kategori + karar 410 ara kademesi).
2. Seri ve modeller: katalog-2026-10-04.json (bugün 441 model, 40 aile) kuru koşu → rapor Recep'e → yazım. 1.000+ model Design İçerik paketinden, aynı şemada gelmeli.
3. Ses/eğri, uygulama alanları, SSS, yazılar, yasal metinler, vitrin_ayari.
4. Eskiden yalnız: görsel yolları (sku eşlemesi, dosya taşınmaz), model kodu, stok (Soru 2), maliyet ve fiyat yapılandırması, price_lists. Fiyatlar kopyalanmaz, motor yeniden üretir; eski/yeni fark sıfır olmalı. Eski adresler adres_yonlendirme'ye (eskiSlug, product_families.slug, products.slug + /urun/<slug>-p-<sku>, categories slug'ları, url_takma_adlari zinciri düzleştirilmiş) → tek 308.
5. Webhook tetikleri toplu yüklemeden SONRA kurulur.

## 6. Geçiş sırası (her migration = prod, her biri Recep onayıyla; kural 13, kod önce)
| Adım | İçerik | Eski site | Geri alma |
|---|---|---|---|
| M1 | Yeni tablolar, CHECK, tetik, RLS, GRANT; veri yok | Çalışır | DROP |
| M2 | Doğrulama/önizleme/yükleme + vitrin RPC'leri + vitrin_fiyat | Çalışır | DROP |
| Yükleme | §5, kuru koşu + onay | Çalışır | TRUNCATE |
| M3 | Webhook tetikleri (handler önce deploy, INV-RENDER-2) | Çalışır | DROP |
| Önizleme | Yeni site yeni tablolardan; anon fiyat sızıntısı curl ile ölçülür | Çalışır | — |
| M4 yayın günü | Eski katalog salt okunur + satış kapalı → test verisi dökülüp TRUNCATE → 14 FK ve RPC'ler döner → yeni site deploy → iyzico duman testi | Kapanır | Ters migration + eski build; pencere kısa |
| M5 (haftalar sonra) | Eski katalog tabloları dökülüp DROP | — | Yalnız dökümden |

## 7. Recep'e açık sorular (OPS-180 ADIM 2'de sorulacak)
1. Tablo adları Türkçe mi İngilizce mi? Önerim Türkçe.
2. products.stock_qty (373 model > 0) gerçek stok mu? Önerim sayımla doğrulanıp açılış hareketi.
3. purchase_orders / goods_receipts test mi? Testse temizlensin.
4. Yeni modelde teklif modu varsayılan açık mı (fiyat girilip kapatılmadıkça satış kapalı)? Önerim evet.
5. Hangi markaların yetkili distribütörüyüz? Liste gelene kadar hepsi false.
6. Sipariş/teklif numara sayaçları sıfırlansın mı? Önerim evet.
7. Dil alanları sabit _tr/_en kolon mu, jsonb mi? Önerim sabit kolon (üçüncü dil planı yoksa).
8. 1.000+ model hangi dosyada, hangi biçimde gelecek? Önerim katalog-2026-10-04 şeması; Lineo alt seri kolonu da birlikte.
