# Yeni site geçişi · tek resim (OPS-180)

> **DURUM: TASLAK 1** (1 Kasım 2026). Geçiş planı **ADIM 2: Recep doğrulaması bekliyor.**
> Kaynak: OPS ortak notu `ops180-tek-resim-taslak-2026-11-01.md` (§1-9), depoya HARİTA aldı.
> **§8 düzeltildi:** "yerinde sıkılaştırma" önerisi geçersiz; yerine geçen sıfırdan şema §10'da.
> Bu belge iş kaydı değildir; iş durumu Kanban OPS-180 kartındadır.

Kaynaklar: Kanban OPS-180 kartı (83 iptal kartından taşınan şart + 6 şart + karar 407/410/412/413 notları + HRT-90 ekleri), master 67022fc89 üzerinde arka uç envanteri (grep düzeyi; CodeGraph kullanılmadı). Tasarım kaynağı TEK: Claude Design "Venthub New" (4f7164e6); S4/S5 atıfları geçersiz.

## 1. Üç parça, kim ne

| Parça | Durum | Kaynak / sahip |
|---|---|---|
| Vitrin (müşterinin gördüğü sayfalar) | Baştan yazılacak (karar 406) | Tasarım: Venthub New (Design). Kod: ÜRÜN (kapalı; açılış Recep kararı) |
| Arka uç (ödeme, teklif, sipariş, giriş, yönetici paneli, Edge) | İş mantığı KORUNUR | Site deposu master; sahipleri SATIŞ/EDGE/ADMIN (kapalı), ALTYAPI |
| Ürün verisi (1.000+ ürün, aile, kategori, adres) | Yeni tablolar SIFIRDAN + doğrulama veride (karar 413) | KATALOG + Design İçerik; adres kuralı karar 407/410 |

## 2. Korunacak arka uç (ölçülen sayılar)

- 30 Edge Function, 264 migration, ~101 tablo, 27 servis dosyası, 26 yönetici paneli ekranı, 2 API rotası (health, webhook/supabase), 2 auth rotası.
- Arka uç kodu vitrin bileşeni içe aktarmıyor (grep: 0). Ayrılık temiz.
- Gruplar: ödeme (iyzico-payment/callback/refund/reconcile, order-validate), sipariş ve iade durum makineleri (monoton), webhook alıcıları (kargo, iade, ödendi, teklif; HMAC + tekrar koruması), teklif (quote-request-guest: KVKK onayı, idempotency, hız limiti), bildirim (Resend/Twilio uçları), kupon, kur (tcmb günlük), hata kaydı, yönetici paneli (26 ekran, admin_audit_log sarmalayıcısı).
- Emekli uçlar: refund-order-mock, shipping-status (iş yapmıyor).

### Yeni vitrinin uyması gereken 10 sözleşme (kırılırsa sessiz bozulur)

1. Tazeleme yolu: webhook rotası hangi sayfayı tazeleyeceğini ESKİ adres şemasından hesaplıyor (src/lib/adres/*, rotaDili, cache/tags). Yeni yollar buna uyarlanmazsa veri değişir, sayfa değişmez.
2. Middleware: dil öneki + eski adres 301/308 haritası + next.config redirects (~150 satır).
3. Ödeme isteği biçimi (useCheckoutPayment, buildPaymentRequest, PaymentSuccessPage, PaymentWatcher); CSP'de iyzipay kalır.
4. Kupon (useCheckoutCoupon → apply-coupon).
5. Teklif isteği biçimi (KVKK alanı, idempotency anahtarı) + hesabım teklif sayfaları.
6. Satış kipi / fiyat gösterimi (teklifModuSuzgeci, get_display_prices; kartta fiyat yok).
7. Katalog okuma RPC'leri (get_family_detail, get_product_families_enriched, get_category_counts, fts_search_products); kategori adı getCategoryDisplayName.
8. Bağlam sağlayıcıları ve kancalar (Auth, Cart, Category, Project, I18n, Supabase; useLocalizedRoutes).
9. Hesabım ekranları (adres, fatura, iade, veri talebi, proje) servis sözleşmeleri.
10. Sözlük anahtarları yasal/hesap sayfalarıyla paylaşılıyor olabilir: silmeden önce ölç.

Not: CSP bugün Report-Only (zorlamıyor); yeni dış kaynaklar eksikse hata görünmez.

> Not (§8 düzeltmesiyle): katalog tabloları yeniden kurulunca sözleşme 7'deki RPC'ler ve iş mantığının katalog bağları yeni tablolara yeniden bağlanır; sözleşmelerin biçimi korunur.

## 3. Yeni site şartları (99 kalem; tekrarlar birleşince ~85)

| Başlık | Kalem | Öne çıkanlar |
|---|---|---|
| Veri ve şema | 14 | teklif modunda fiyat hiçbir açık yükte yok; doğrulama tabloda; her satırda tenant; marka tek kaynak DB; quote_only bayrağı; product_costs yeri |
| Adres, yönlendirme, harita, dizin | 16 | alt kategori tek kademe adres (407); eski→yeni 308; sayfalı harita; IndexNow kuralı; vercel.app kanonik |
| Vitrin sayfaları | 13 | sunucu HTML'i eksiksiz (çift gövde, "-" kategori, çift H1 yok); aile model tablosu; sayaçlar canlı veriden |
| Arama ve ürün seçici | 15 | EN arama, yazım hatası toleransı, SKU araması; karar 262 seçici kümesi; hesap motoru kaynak atıfı |
| Teklif, sepet, ödeme | 5 | 3DS telafisi; kargo ücreti; il/ilçe tek kaynak; teklif sayfaları; teklifte seçim kaydı |
| Yasal, KVKK, GA4 | 6 | hukukçu teyidi paketi; EN yasal çeviri uyarısı; GA4 rıza paketi |
| i18n / EN | 5 | EN sayfada lang="en"; hreflang; dil yedeği tek kural |
| SEO / GEO / hız | 10 | JSON-LD kümesi; LCP ve mobil kabul ölçütü; bot erişimi |
| Yönetici paneli, roller | 3 | moderator/viewer rol kararı; kullanılmayan ekran audit_log'la bulunur |
| Geliştirme altyapısı | 6 | react-hooks 7 error; zod 4; mekanik test temizliği; Design→canlı toplu aktarım |
| İçerik ve metin | 6 | "Teklif iste" fiili; dayanaksız iddia yok |

Not (çakışma değil): karar 407 adresin DERİNLİĞİ (tek kademe URL), karar 410 kategori HİYERARŞİSİ (üç kademe veri). İkisi birlikte geçerli: üç kademeli ağaç, tek kademeli adres.

## 4. Recep kararı gereken kalemler (geçiş planı sırasında, tek tek sorulacak)

- EN açılış tarihi (lang, hreflang, EN yasal çeviri bağlı).
- GA4 açılış tarihi (karar 247 evet; tarih açık).
- Admin rol kararı (moderator/viewer).
- Hukukçu teyidi (dış kişi): "(Taslak)" başlıkları buna bağlı.
- 3DS telafisi yolu.
- product_costs (maliyet) yeni şemada nerede.
- Kargo ücreti ve arama motoru seçimi (maliyet çıkarsa).
- "Alt Ürün Grupları" / "Alt Kategori" tek ad.
- OPS-160: mevcut adres değişince IndexNow kuralı (K4) gevşesin mi.

## 5. Sıradaki adım (geçiş planı, ADIM 3)

1. Recep bu resmi doğrular (ADIM 2).
2. Veri: yeni tablolar sıfırdan + doğrulama + tenant (migration = Recep onayı, kural 13).
3. Adres: v3 adres listesi + eski→yeni yönlendirme tablosu + tazeleme yolu uyarlaması (sözleşme 1-2).
4. Vitrin: Venthub New şablonlarından kurulum, önizleme dalında (noindex), sözleşme 3-9 testleriyle.
5. Önizleme → Recep kontrolü → tek seferde yayın + dizin tetiği.

## 6. Açık ölçümler kapandı (1 Kasım 18:04, master fe22ded59)

- Varyant ayrı tablo DEĞİL: varyant = products satırı (family_id, model_code, sku). product_families: brand_id, category_id, subcategory_id, parent_family_id, series_code. Okuma get_family_detail RPC; selectVariant ?sku= ile seçer.
- quote-request-guest: supabase.functions.invoke (quoteService.ts:145). Gövde: contact, source, items, kvkkOnay, website (honeypot). 409/422/429 ayrımı.
- Bildirim kanalları: notification-service = Twilio (WhatsApp, SMS) + Resend; order-confirmation, shipping-, delivery-, return-status-notification, quote-notification-webhook = Resend; stock-alert ve order-paid-webhook dolaylı (başka uca delege). TWILIO ortam değişkeni yoksa SMS/WhatsApp kapalı döner.
- JWT rolü: custom_access_token_hook (user_profiles.role + tenant_id → claims user_role ve app_metadata). 7 rol: super_admin, admin, moderator, warehouse, sales, viewer, user. AÇIK: hook panelde aktif mi ve 20260914080000 "jwt_role_emekli" migration'ı neyi emekli etti, okunmadı.

## 7. 10 sözleşmenin test kapsamı (1 Kasım ~18:15, okuma; test koşulmadı)

Güçlü ve vitrinden bağımsız: 1 webhook tazeleme, 2 middleware/yönlendirme, 3 ödeme (edge yarısı), 6 satış kipi hesap kısmı, 7 katalog servisleri, 10 sözlük tarama kapıları.
Zayıf/yok: 4 kupon (test yok), 5 teklif istemci↔edge gövdesi, 8 sağlayıcı davranışı (Cart/I18n/Auth), 9 hesabım servisleri (sıfır test).

Yeni vitrinden ÖNCE yazılacak sözleşme testleri (öncelik): (1) tazeleme yolu → gerçek page.tsx eşliği; (2) ödeme istemci↔edge gövde + callback durum ortak tipi; (3) misafir teklif gövdesi (kvkkOnay, idempotency); (4) kupon istek/yanıt + geçersiz yol; (5) fiyat gizliliği bekçisini dosya listesinden taramaya çevir + teklifModuSuzgeci doğruluk tablosu; (6) eski URL → yeni 200 tek sıçrama CI kapısı; (7) hesabım servisleri; (8) sağlayıcı davranışı; (9) RPC dönüş şeması (fts_search_products en zayıf); (10) yasal/hesap sözlük anahtarlarını dead-key kapısında koru.

Vitrin yenilenince kırılacak yol-bağlı testler (amaçları yeni dosya adlarıyla yeniden yazılır): payment-render-surface, payment-integrity, render-price-surface, rsc-yuku-fiyat-sizintisi, storefront-fiyat-sizintisi, auth-account-surface, kvkk-request-ledger (sayfa kısmı), rota-dili-dil-degistirici, i18n-dead-key listesi, legal-consent-gate, PaymentSuccessReview, odemeSonucuSatisKipi, ReviewSummary, e2e/checkout-smoke.

## 8. Katalog şema taslağı

> ⚠ **DÜZELTME (Recep kararı, 1 Kasım ~18:20 sonrası): bu bölümün "yerinde sıkılaştırma" önerisi GEÇERSİZDİR.**
> - Katalog tabloları Supabase'te **sıfırdan yeni tablolarla** kurulur.
> - Geçmiş sipariş ve ödeme kayıtları iyzico testinden geldiği için products.id'ye bağlı **14 FK engel sayılmaz**.
> - Korunan yalnız **iş mantığıdır** (yönetici paneli, sepet, ödeme, teklif); bu mantık yeni tablolara yeniden bağlanır.
> - **Yerine geçen şema: §10** ([yeni-site-katalog-sema-taslak-2026-11-01.md](yeni-site-katalog-sema-taslak-2026-11-01.md)). Aşağıdaki metin, ölçülen sorunlar ve kavramlar için başvuru olarak kalır; "kimlikler değişmez" hükmü ve S1 sorusu düşmüştür.

Eski taslak (Plan ajanı, 1 Kasım ~18:20; dosya/migration yazılmadı):

- ~~Temel hüküm: products.id'ye 14 FK bağlı (sipariş, teklif, sepet, stok, satınalma...). Arka uç korunacağı için products/product_families KİMLİKLERİ DEĞİŞMEZ; "yeni tablolar" = mevcut tabloları yerinde sıkılaştırma + yalnız yeni kavramlar için küçük tablolar.~~ (geçersiz, yukarıdaki düzeltme)
- Bugünkü sorunlar (yeni şemada kapanması gereken ölçülmüş eksikler): (1) fiyat gizliliği DB'de yok: anon products'a GRANT ALL, product_prices anon okuma politikası, get_product_families_enriched min_price'ı hide_price'a bakmadan döndürüyor; tek koruma Next sunucusundaki teklifModuSuzgeci [ALT-73 Aşama A #2161 maliyet kolonlarını anon'dan kapattı; price ve RPC'ler açık]. (2) teklif modu kategori metadata.hide_price'ta, ürün bayrağı yok. (3) marka iki kaynak (products.brand metin + family.brand_id). (4) kategori derinliği 3'le sınırlanmıyor. (5) category_id/subcategory_id anlamı cetvel ile karar 410 arasında farklı. (6) diller arası slug gölgelemesi zorlanmıyor. (7) doğrulama betikte, DB'de değil. (8) sku/slug küresel tekil, tenant kapsamlı değil. (9) ATEX vb. özellik yapısı yok.
- Eski öneriden yeni şemaya taşınabilecek kavramlar: quote_only bayrağı, brand_id FK (marka tek kaynak), CHECK kuralları (teklifte fiyat yok, aktif ürün aileli, teknik birim), bileşik tenant FK, kategori derinlik/gölgeleme/uyum tetikleri, product_features + product_feature_links (rozet/filtre, RLS, denetim + webhook tetiği aynı PR), doğrulama fonksiyonu katalog_satir_dogrula (panel/CSV önizleme kapıyla aynı fonksiyon), fiyat_gorunur_mu(p) tek hüküm, anon kolon yetkisinden fiyat/maliyet kolonlarının çıkması, liste RPC'sinin fiyat döndürmemesi, PDP RPC'nin görünür değilse NULL dönmesi.
- Eski migration sırası (E1 kolonlar → E2 özellik tabloları → E3 doğrulama + NOT VALID CHECK + tetikler → B backfill → P fiyat gizliliği → V validate → C contract) yerinde sıkılaştırmaya göreydi; sıfırdan kurulumda yeniden yazılır. Her migration yine Recep onayı (kural 13).
- Eski açık sorular: ~~S1 yerinde sıkılaştırma mı~~ (düştü); S2 hide_price kalkar mı; S3 karışık ailede fiyat; S4 null'lanan fiyatın yedeği; S5 rozet kaynağı; S6 sku tenant tekilliği ertelenir mi; S7 category_id anlamı; S8 1.061 model = aile mi varyant mı; S9 model_code zorunlu mu.

## 9. Venthub New şablon ↔ site sayfa eşlemesi (1 Kasım ~18:20; yerel önizleme kopyası, 22 şablon, tümü TR+EN)

- Şablonların ortak verisi katalog-2026-10-04.json anlık görüntüsü (7 kök, 22 dal, 47 aile, 441 ürün); canlı DB değil.
- 22 şablonun 15'inin site karşılığı var; 7'si YENİ SAYFA: Arama, Belgeler, Destek (kök), Karşılaştır, Teklif Formu, Uygulama Alanı, Uygulama Alanları.
- Sitenin 55 sayfasından 30'unun ŞABLONU YOK: Hakkımızda, hesabım alt sayfaları (13), giriş/kayıt (5), sepet, ödeme, ödeme başarılı, destek alt sayfaları (4), dört hesaplayıcı. → Design'dan tasarım gerekecek (Recep'e karar: hangileri şablonlansın, hangileri mevcut tasarımla kalsın).
- Sitede ikiz ağaçlar: category/kategori, brands/markalar, products/urun, knowledge-hub/bilgi-merkezi (kanonik hangisi ölçülmedi). K3B bayrağı kapalı.
- Şablonların istediği ama DB'de olmayan veri: marka içeriği (logo, özet, foto, web), uygulama alanları (5 şablon besliyor), rehber/SSS/yasal içerik tabloları, teknik özellik sözlüğü + ses verisi, garanti yılı, EN slug/ikon/kısa ad, il listesi, teklif sektör eşlemesi. Yeni şema bunları kapsamalı (marka, özellik, uygulama alanı, içerik tabloları).

## 10. Sıfırdan katalog şeması (1 Kasım ~18:25; §8'in yerine geçer)

Tam metin: [yeni-site-katalog-sema-taslak-2026-11-01.md](yeni-site-katalog-sema-taslak-2026-11-01.md) (TASLAK; dosya ve migration yok).

- ~25 yeni Türkçe adlı tablo (katalog_*, uygulama_*, icerik_*, vitrin_ayari), her satırda tenant.
- Fiyat yalnız `vitrin_fiyat` RPC'sinden; anon fiyat tablosuna erişemez, listeleyen RPC'ler fiyat döndürmez.
- Tek doğrulama fonksiyonu tetikte: panel, CSV ve betik aynı kapıdan geçer (karar 413).
- Sipariş, teklif, sepet, stok ve fiyat motoru FK'leri yeni tablolara döner; test verisi devirde depo dışına dökülüp temizlenir.
- Geçiş M1-M5, her migration Recep onayıyla (kural 13).
- Recep'e 8 açık soru (tam metnin §7'si), ADIM 2'de sorulacak.
