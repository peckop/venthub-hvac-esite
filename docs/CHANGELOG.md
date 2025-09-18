# Changelog

## 2025-09-18

### i18n ve SEO (hreflang) Standardizasyonu — Frontend & Admin
- SEO
  - Seo bileşeni: hreflang alternates güncellendi (tr-TR, en-US, x-default). x-default dil parametresiz canonical’a işaret eder.
  - Open Graph: `og:locale` mevcut dile göre, `og:locale:alternate` olarak karşı dil etiketleri dinamik eklendi.
- Para/Tarih Formatı
  - Yardımcılar: formatCurrency, formatDate, formatDateTime; yeni formatTime eklendi.
  - Admin sayfaları: AdminErrorGroupsPage, AdminErrorsPage, AdminWebhookEventsPage, AdminMovementsPage, AdminProductsPage, AdminUsersPage — tüm tarih/para gösterimleri dil‑duyarlı hale getirildi.
  - Hesap sayfaları: AccountShipmentsPage ve AccountReturnsPage — tarih/para formatları standardize edildi.
  - CSV/XLS export’lar: AdminReturnsPage ve AdminOrdersPage’de export çıktılarında format helper’ları kullanıldı (locale-aware).
- Kapsam
  - Kalan toLocaleString/Intl.NumberFormat sabit kullanımlar tarandı ve temizlendi (uygun olduğu yerlerde helper’lara geçirildi).

## 2025-09-17

### WhatsApp wa.me Konfigürasyonu - Tam Entegrasyon
- WhatsApp Utility Fonksiyonları
  - src/utils/whatsapp.ts oluşturuldu: getWhatsAppNumber(), formatPhoneNumber(), createWhatsAppLink()
  - Template mesaj generatörleri: stok sorgulama, genel destek, SSS desteği için
  - isWhatsAppAvailable() kontrol fonksiyonu ve hızlı link oluşturucular
- Ürün Sayfaları Entegrasyonu
  - ProductDetailPage: Stok sorgulama bölümü yeni utility'leri kullanacak şekilde güncellendi
  - ProductCard: Stokta olmayan ürünler için WhatsApp linkleri merkezi fonksiyonlarla yönetiliyor
  - Bağlamsal mesaj şablonları: ürün adı ve SKU bilgileri otomatik mesajlara dahil ediliyor
- Destek Sayfaları Entegrasyonu
  - SupportHomePage: Öne çıkan WhatsApp destek kartı eklendi
  - ContactPage: Hızlı WhatsApp iletişim bölümü, telefon/e-posta kartlarıyla birlikte
  - FAQPage: "Aradığınız cevabı bulamadınız mı?" WhatsApp destek bölümü
- WhatsApp İkonu ve Stillendirme
  - HVACIcons.tsx'e resmi WhatsApp renkleriyle WhatsAppIcon bileşeni eklendi
  - index.css'e kapsamlı WhatsApp özel CSS sınıfları:
    - .whatsapp-container, .whatsapp-btn, .whatsapp-text, .whatsapp-subtext
    - .whatsapp-float (gelecekteki yüzen buton için)
    - .whatsapp-pulse animasyon efekti
  - Tutarlı yeşil gradyan arka planlar ve hover efektleri
- Özellikler
  - Akıllı fallback: WhatsApp yoksa e-posta iletişime geçer
  - Mobil optimize: wa.me linkleri mobil cihazlarda mükemmel çalışır
  - Erişilebilirlik: ARIA etiketleri ve odak durumları
  - Bağlam farkında mesajlar: her sayfa için özel template mesajlar

## 2025-09-16

### DB Performans & RLS İyileştirmeleri + Order Confirmation E-postası
- Veritabanı (FK İndeksleri)
  - Eklendi: coupons.created_by, order_attachments.created_by, order_notes.user_id
  - Eklendi: venthub_order_items.order_id, venthub_order_items.product_id, venthub_orders.user_id
- Veritabanı (Mükerrer İndeks)
  - Kaldırıldı: cart_items_cart_product_uniq (cart_items_cart_product_unique bırakıldı)
- RLS / Politika Düzenlemeleri
  - cart_items ve shopping_carts: modify_own ALL → INSERT/UPDATE/DELETE olarak ayrıştırıldı; auth.uid() çağrıları (select auth.uid()) biçimine alındı (initplan optimizasyonu)
  - user_profiles ve venthub_returns: auth.* çağrıları (select ...) ile sarıldı; mevcut erişim mantığı korunarak performans iyileştirildi
- products: admin DML politikaları ayrı tanımlandı (INSERT/UPDATE/DELETE); SELECT public policy ile ayrıldı — Advisor “authenticated + SELECT” çoklu policy uyarısı giderildi
- E‑posta (Order Confirmation)
  - order-confirmation Edge Function metni Türkçe olarak netleştirildi (ödeme başarı bilgisi + kargoya hazırlık vurgusu); HTML/text fallback korunur
- Advisor (güncel durum)
  - Duplicate index uyarısı giderildi; FK uyarılarının cache temizliği sonrası kaybolması bekleniyor
  - Bilinen tek güvenlik uyarısı: “Leaked Password Protection Disabled” (bilinçli)

## 2025-09-14

### Returns Yönetimi v2 (mock)
- refund-order-mock Edge Function: PSP olmadan iade simülasyonu (tam/kısmi). payment_status ve payment_debug güncellenir, tam iade durumunda sipariş status (shipped/delivered değilse) cancelled yapılır.
- order_refund_events audit tablosu eklendi (RLS: INSERT service_role, SELECT admin/superadmin).
- AdminReturnsPage: refunded durumuna geçerken otomatik refund-order-mock çağrısı yapılır, ardından müşteriye e‑posta bildirimi gönderilir.

### Webhook Olayları Paneli
- Yeni sayfa: Admin > Webhook Olayları (/admin/webhook-events).
- Returns sekmesi: returns_webhook_events listesi (event_id, order_id, return_id, carrier, status_mapped, received_at).
- Kargo E‑postaları sekmesi: shipping_email_events listesi (order_id, email_to, subject, provider, created_at).
- Arama, yenile, kolon/density kalıcılığı.

### Admin Orders Gelişmiş Toplu Kargolama
- Toplu “Kargoya ver” moduna gelişmiş giriş: seçili siparişler için sipariş bazlı carrier/tracking girilebilen grid eklendi.
- Basit modda tüm seçilenlere aynı carrier/tracking uygulanmaya devam eder.

### İade Webhookları ve Rol Güvenliği
- returns-webhook Edge Function: HMAC/Token doğrulamalı, delivered/returned/completed → venthub_returns.status='received'.
- Audit/dedup: returns_webhook_events tablosu eklendi.
- Supabase config: [functions."returns-webhook"].verify_jwt=false (HMAC/Token ile korunur).
- Rol güvenliği: Kullanıcılar kendi rolünü düşüremez (DB trigger enforce_role_change + UI guard AdminUsersPage). Superadmin her şeyi yapabilir.
- Hesap Güvenliği: Google hesabını mevcut hesaba bağlama/ayırma UI (AccountSecurityPage) — linkIdentity ve güvenli unlink guard.
- İade e-postası: ‘received’ durumuna geçildiğinde return-status-notification fonksiyonu tetiklenerek müşteriye e‑posta gönderilir.
- Güvenlik sertleştirme: shipping_email_events ve order_email_events tablolarında RLS ENABLE + policy (INSERT: service_role, SELECT: admin/superadmin); returns_webhook_events için admin SELECT + service INSERT; enforce_role_change() search_path = pg_catalog, public.

## 2025-09-13

### E‑posta/Notification Altyapısı (Kargo + Sipariş Onayı)
- Şablonlama
  - templates/email/shipping.html eklendi ve shipping-notification, dosya varsa onu okuyup değişkenleri dolduruyor; yoksa inline HTML’e geri düşüyor.
- Mimari
  - admin-update-shipping, kargo/güncelleme/iptal akışını yürütür; gerekirse implicit cancel uygular.
  - E‑posta için shipping-notification çağrılır. Çağrı service-role ile yetkilidir (Authorization+apikey), 401/CORS takılmaz.
  - Müşteri e‑postası Auth Admin API’den çekilir; admin_users view bağımlılığı kaldırılmıştır.
  - Domain doğrulaması yoksa Resend “from verify” hatasında otomatik onboarding@resend.dev ile tekrar denenir.
  - Test için EMAIL_TEST_MODE/EMAIL_TEST_TO; BCC desteği (SHIP_EMAIL_BCC).
- Konfig/env
  - Branding: BRAND_NAME, BRAND_PRIMARY_COLOR, BRAND_LOGO_URL (opsiyonel)
- Kayıt
  - shipping_email_events tablosu: gönderilen kargo e‑postaları (order_id, to, subject, provider id) kayıt altına alınır.
  - RESEND_API_KEY, EMAIL_FROM, SHIP_EMAIL_BCC, (opsiyonel) EMAIL_TEST_MODE, EMAIL_TEST_TO, NOTIFY_DEBUG.
- Güvenlik
  - shipping-notification public (verify_jwt=false), admin-update-shipping JWT gerektirir (admin paneli).
- Sonuç
  - E‑posta gönderimi Resend üzerinde doğrulandı (Delivered). UI’da kargo akışı yeşil.

### Kargo akışı (UI + Edge Functions)
- AdminOrdersPage
  - "Kargo" ve "İptal" butonları eklendi; bağlama göre toast mesajları:
    - İlk kez: "Sipariş kargoya verildi"
    - Güncelleme: "Kargo bilgileri kaydedildi"
    - Toplu: "N sipariş kargolandı"
    - İptal: "Kargo iptal edildi"
  - İstekler query fallback’lı hale getirildi:
    - İptal: `admin-update-shipping?order_id={id}&cancel=true` (body: `{ send_email: false }`)
    - Kargo: `admin-update-shipping?order_id={id}` (body: `{ carrier, tracking_number, tracking_url, send_email }`)
- Edge Function: `admin-update-shipping`
  - Body tek kez okunuyor (single parse)
  - URL query fallback (order_id/cancel/send_email)
  - Implicit cancel: sipariş shipped ise ve carrier/tracking yoksa iptal kabul edilir
  - İptal akışında yalnızca order_id ile PATCH: `status='confirmed'`, `shipped_at/carrier/tracking/tracking_url = null`, 200 `{ ok:true, action:'cancel' }`
  - Kargo/güncelleme yolunda `shipped_at` sadece ilk kargolamada set edilir, sonrasında korunur
  - Mail sonucu `{ ok:true, email:{ sent, disabled } }` döner
- Edge Function: `shipping-notification`
  - RESEND entegrasyonu; BCC desteği (SHIP_EMAIL_BCC)
  - Test modu desteği: `EMAIL_TEST_MODE=true`, `EMAIL_TEST_TO=delivered@resend.dev`
  - Domain doğrulaması yokken `EMAIL_FROM="VentHub Test <onboarding@resend.dev>"` önerildi

### Gereken ortam değişkenleri (Supabase Functions)
- RESEND_API_KEY: Resend secret anahtarı (ör: `re_xxx`)
- EMAIL_FROM: Gönderen (ör: `VentHub Test <onboarding@resend.dev>`)
- SHIP_EMAIL_BCC: BCC kopya (ör: `recep.varlik@gmail.com`)
- (Ops.) EMAIL_TEST_MODE=true
- (Ops.) EMAIL_TEST_TO=delivered@resend.dev

### Dağıtım notları
- Supabase Studio → Edge Functions → Settings (Env Vars): yukarıdaki değişkenleri ekleyin
- Edge Functions → `admin-update-shipping` ve `shipping-notification`: Publish/Deploy
- Cloudflare Pages: yeni bundle yayınlandıktan sonra AdminOrders sayfasını `Ctrl+F5` ile yenileyin

## 2025-09-11 (Güvenlik, Performans ve Admin Panel İyileştirmeleri)
- Güvenlik & DB Performans (Supabase Advisor sonuçlarına göre)
  - HIBP sızıntı kontrolü: 8+ karakter min parola + HaveIBeenPwned k-Anonymity kontrolü (Register/Parola Değiştir)
  - RLS policy normalizasyonu: auth.uid(), auth.jwt(), current_setting() çağrıları SELECT ile wrap ederek per-row re-eval önlendi
  - Function search_path güvenlik: tüm fonksiyonlar için 'public, pg_temp' ayarı (mutable search_path riski giderildi)
  - Multiple permissive RLS policies: aynı tablo/rol/aksiyon için tekleştirildi (performans iyileştirmesi)
  - Missing FK indexes: tüm foreign key indeksleri eklendi (query performansı)
  - Unused indexes: kullanılmayan indeksler temizlendi (disk alanı kazancı)
  - Admin audit log RLS: admin/moderator rolleri için policy düzeltmeleri
- PUBLIC policies: explicit roller (authenticated, anon, admin, moderator) ile kısıtlandı
- UI/UX İyileştirmeleri

### 2025-09-11 Geç Saat Güncellemeleri
- Security
  - Studio “Leaked password protection” ücret ve bağlam sebebiyle kapalı tutulur; eşdeğer koruma uygulama seviyesinde sağlanır (src/utils/passwordSecurity.ts, HIBP k‑Anonymity). Supabase Advisor WARN’ı bilinçli olarak kabul edilir.
- CI
  - App Lint (src) blocking olarak eklendi; Edge Functions lint ayrı ve non‑blocking (uyarı raporlar, pipeline’ı kırmaz)
  - ESLint ignore kapsamı sadece `supabase/migrations/**` ile sınırlandı; `supabase/functions/**` lint kapsamına alındı (edge için esnek kurallar)
  - DB Advisor workflow güncellendi: `psql` ile SQL tabanlı denetimler (unindexed FKs, duplicate/unused indexes, multiple permissive RLS) — secrets ile güvenli
- DB/RLS
  - user_profiles: INSERT/UPDATE için çoğul public policy’ler tek birer policy altında birleştirildi (idempotent)
  - venthub_returns: UPDATE için `returns_update_*` politikaları tek policy ile birleştirildi (idempotent)
- Frontend
  - LoginPage: Google ikonu inline SVG yerine data‑URI `<img>` ile garanti altına alındı (tema/CSS farklarında görünür)
  - admin.ts: `@ts-ignore` kaldırıldı; `vite/client` tip referansı ile `import.meta.env.PROD` güvenli kontrol (CI lint hatası giderildi)
  - Premium HVAC markaları marquee: gerçekten sonsuz akış (4x tekrar, motion preference kaldırıldı)
  - Header arama sadeleştirme: tek ikon /products'a yönlendirme, sticky hızlı arama korundu
  - PDP galeri navigasyon: ok tuşları/klavye/swipe desteği + a11y etiketleri
  - Model kodu (MPN) ayrıştırma: products.model_code alanı + admin UI + PDP/CSV desteği
  - Ürün kartları: model_code > SKU gösterim önceliği, alt metin entegrasyonu
  - Ana görsel: object-contain ile taşma/kırpma önleme, thumbnail tıklama ile ana görsel değişimi
- Arama & Listeleme
  - Model kodu arama kapsamı: "AD-H-900-T" gibi kodlar aramaya dahil edildi
  - /products JSON-LD: ItemList ve Breadcrumb üretimi arama/all modlarına göre iyileştirildi
  - Arama önceliği: query varsa sonuçlar, all=1 varsa tüm ürünler mantighı netlik kazandı
- Admin Panel Geliştirmeleri
  - Ürün listesi: kolon başlığına tıklayarak sıralama (Ad, SKU, Kategori, Durum, Fiyat, Stok)
  - "Öne Çıkan" filtresi: is_featured alanı veritabanı sorgusunda gerçek filtreleme
  - Stok sekmesi: global varsayılan eşik değeri görsel gösterimi ("Varsayılan: X")
  - Görsel yönetimi: "Kapağı Yap" butonu, alt metin controlled input + onBlur kaydet, toplu kaydet butonu
  - CSV İçe Aktarma v2: write desteği, SKU ile upsert, dry-run önizleme, chunk işleme (100'lük)
  - RLS policies: product_images ve storage.objects için admin/moderator CRUD yetkileri düzeltildi

## 2025-09-10 (Arama, ProductsPage UX, Görseller RLS ve Alt Metin)
- Arama
  - /products: arama önceliği düzeltildi (query → sonuçlar, `all=1` → tüm ürünler).
  - URL `q` param senkronizasyonu sağlandı; CategoryPage’e lokal arama eklendi.
  - model_code arama kapsamına alındı (örn. "AD-H-900-T").
  - Header arama çubuğu sadeleştirildi; tek ikon /products’a yönlendirir. Sticky hızlı arama korunur.
- SEO
  - /products için JSON-LD ItemList ve Breadcrumb üretimi modlara göre güncellendi.
- Ürün Görselleri ve RLS
  - product_images ve storage.objects (product-images) RLS politikaları user_profiles.role + auth.uid() ile yeniden yazıldı.
  - authenticated role için INSERT/UPDATE/DELETE yetkileri düzenlendi; admin kullanıcı atandı.
  - Tanılama RPC’leri: session context ve aktif policy görünürlüğü (admin).
  - Yükleme sorunu kalıcı olarak çözüldü; "Kapağı Yap" butonu küçük ekranlarda da görünür.
  - Alt metin girişleri controlled + onBlur kaydet; Görseller sekmesinde toplu “Kaydet”.
- Ürün Listesi/Detayı
  - Kapak görseli (sort_order=0) otomatik; `object-contain` ile taşma/croplama önlendi.
  - Thumbnail tıklaması ana görseli günceller; alt nitelikleri tutarlı.

## 2025-09-09 (Admin Products/Categories UI standardizasyonu + sıralama + eşik mantığı)
- Ürünler: Toolbar standardı + kategori filtresi + durum chip’leri + “Sadece: Öne Çıkan” toggle
- Ürünler: Tablo sıralama (Ad, SKU, Kategori, Durum, Fiyat, Stok); başlıklardan tıklanarak
- Ürünler: Düzenleme paneli başlık şeridi; aksiyonlar sağa taşındı (Yeni, Kaydet, Sil); “Yeni Ürün/Düzenleniyor” etiketi sola
- Ürünler: Stok sekmesi — düşük stok eşiği override mantığı (boş=varsayılan, dolu=override) ve varsayılan eşik bilgisini gösterme
- Kategoriler: Düzenleme paneli başlık şeridi + aksiyonlar (Yeni, Kaydet, Sil)

## 2025-09-09 (Knowledge Hub Linking + PDP/PLP Related Guide + i18n)
- Header: add “Knowledge Hub” link to main nav (/destek/merkez).
- MegaMenu: add Knowledge Hub tile to Quick Access.
- Footer: add Knowledge Hub to Quick Links.
- SupportHome: add Knowledge Hub card.
- PDP: show “Related Guide” link below description (category/subcategory → topic mapping).
- CategoryPage + ProductCard: pass and render optional relatedTopicSlug to show per‑card “Related Guide”.
- i18n: add common.knowledgeHub, support.home.knowledgeDesc, pdp.relatedGuide keys (tr/en).

## 2025-09-08 (Admin Error Logs, Realtime ve Scroll UX + WhatsApp Deeplink + Order Consents + Admin Exports)
- Yeni: AdminErrorGroupsPage — grup görünümü (signature, last_message, count, last_seen, level, status, assigned_to), filtreler (arama, seviye, durum, tarih), server-side sayfalama.
- Yeni: AdminErrorsPage — ham client_errors listesi; Realtime abonelikler eklendi.
- Realtime: error_groups ve client_errors için Postgres Realtime ile canlı güncellemeler.
- Scroll UX: Üst/alt yatay scroller senkronizasyonu geri-besleme olmadan (requestAnimationFrame guard); overscroll-x-contain ile scroll zinciri kesildi; dikey scroll normal akışta.
- UI: ColumnsMenu stok özet sayfasıyla tutarlı olacak şekilde toolbar’ın sağ bloğuna taşındı.
- Supabase Şema/RLS: client_errors.group_id, error_groups; admin/moderator JWT rolü ve e‑posta fallback ile erişim politikaları.
- Edge Function: log-client-error — 404/401 ve 500 hataları giderildi; supabase.functions.invoke kullanımı; try/catch + maybeSingle ile güvenli sorgu; prod uç nokta doğrulandı.
- Deploy/Cache: Cloudflare Pages’de /public/_headers ile index.html no-store; bayat UI problemi çözüldü.
- PDP/ProductCard: "Stok sor" için opsiyonel WhatsApp deeplink (VITE_SHOP_WHATSAPP). Env yoksa PDP'de mailto ve kartta /contact fallback korunur.
- OrderDetail: Fatura sekmesinde fatura bilgileri (bireysel/ticari) ve yasal onayların (KVKK, Mesafeli, Ön Bilgilendirme, Sipariş Onayı, Pazarlama) görünürlüğü eklendi.
- Admin Error Groups: Assigned-to filtresi ve toplu durum değişikliği eklendi; detay panelinde URL/Release/Env/UA için Top‑5 dağılımı gösteriliyor.
- Admin Returns: Export menüsü eklendi (CSV + Excel .xls)
- Admin Movements: Export menüsüne Excel (.xls) eklendi

## 2025-09-07 (SEO/A11y/Perf Hardening)
- SEO: sitemap.xml ve robots.txt içindeki base URL portu 5173 → 4173 olarak düzeltildi (preview parity). Lighthouse sitemap hataları giderildi.
- A11y: Footer kontrast iyileştirildi (text-steel-gray → text-gray-300). Icon-only link ve butonlara `aria-label` eklendi (Header + Footer). Splide kaynaklı `aria-allowed-role` uyarıları görünmüyor.
- Perf (prod): LCP görseli preload + fetchpriority=high; dekoratif arka plan görseli lazy yüklenecek <img> içine taşındı. LCP ile ağ rekabeti azaltıldı.
- React uyarısı: `fetchPriority` prop’u yerine DOM’a lowercase `fetchpriority` geçirildi (TSX güvenli spread ile).
- Bugfix: StickyHeader JSX içinde hatalı `>` ve artan metin temizlendi; dev (5173) derleme hatası giderildi.
- Sonuç (prod Lighthouse): 98 Performans / 96 Erişilebilirlik / 100 Best Practices / 100 SEO.

## 2025-09-07 (Homepage Consolidation + Knowledge Hub v1)
- HomePage: VisualShowcase ve SpotlightList kaldırıldı; ana vitrin olarak ProductFlow (full-bleed tek bant) korundu.
- HomePage: BrandFlow eklendi (iki şeritli, sakin marka logosu akışı) — prestij odaklı.
- HomePage: Featured ve New Products bölümleri kaldırıldı; spacing/padding kurumsal plana göre normalize edildi.
- Knowledge Hub: /destek/merkez (HubPage) arama + etiket filtresi ile eklendi; TopicPage i18n’e alındı.
- Calculators v1: dört iskelet sayfa eklendi — /destek/hesaplayicilar/hrv, /hava-perdesi, /jet-fan, /kanal.
- i18n: Resources/Knowledge metinleri sözlüğe taşındı (tr/en).
- Navigasyon: Kaynaklar kartları Hub’a bağlanır; hesaplayıcılar şimdilik doğrudan URL ile erişilebilir (menü girdisi TBD).
- Deploy: GitHub → Cloudflare Pages otomatik yayın; PR preview’ları aktif.
- Known issue: Ana sayfada bazı menü linklerinde ilk tıkın gecikmesi/bloklanması (overlay/pointer-events şüphesi). Header/MegaMenu yan değişiklikleri geri alındı; kök neden araştırılıyor.
## 2025-09-05 (Admin UI Standardizasyonu)
- Yeni: Ortak AdminToolbar bileşeni (arama, select, chip grubu, toggle, Temizle, sayaç, sticky yüzey, focus ring)
- Düzen: 2 satır (üst: arama/select/aksiyonlar, alt: chip’ler); 48px kontrol yüksekliği; shrink-0 sağ blok, nowrap metinler
- Movements: Toolbar entegrasyonu + Dışa Aktar (CSV) dropdown
- Orders: Toolbar entegrasyonu + Durum select + Tarih aralığı alanları + Dışa Aktar (CSV, Excel .xls) dropdown
- Returns: Toolbar entegrasyonu + çoklu durum chip’leri
- Users: Toolbar ile arama standardizasyonu
- Görsel uyum: Tüm toolbar’larda bg-gray-50 + border ile ayrı panel hissi; “Grupla” gibi checkbox’lar Radix Switch’e geçirildi

## 2025-09-06 (Homepage Cleanup)
- Remove BrandFlow component; brand marquee flow integrated directly into BrandsShowcase (single-line, gapless, full-bleed)
- HomePage ordering: BrandsShowcase moved after BentoGrid; Before/After moved under By Application; Resources placed under Product Gallery; Why VentHub moved under FAQ with softened transition; TrustSection moved to ProductsPage Discover
- ProductsPage: add LeadModal for “Teklif Al”; fix Turkish placeholders; show TrustSection under Discover hero

## 2025-09-05 (Homepage Enhancements)
- Add VisualShowcase (parallax + canvas particles + play/pause + keyboard/swipe)
- Add ProductFlow (three-lane product image marquee; clickable brand cards fallback; reduced-motion static grid)
- Add TrustSection (KVKK, iyzico, Returns; remove Cloudflare card)
- Add FAQShortSection and integrate ResourcesSection
- HomePage: place VisualShowcase + ProductFlow above Applications; keep product teasers lower
- Navigation/Analytics: nav_click (Products/Categories) and category_click (MegaMenu/ProductsPage popular categories)
- ProductsPage: dynamic breadcrumb (Discover/All/Search), analytics on popular categories
- main.tsx: disable scroll restoration for refresh (scroll to top)
- Remove CaseStudySection from HomePage

(See docs/HOMEPAGE_ENHANCEMENTS.md for details and backlog.)

### 2025-09-05 Evening Updates
- Increase 3D tilt intensity (18°) with shine + dynamic shadow; enable on (hover:hover & pointer:fine) devices; respect reduced-motion.
- Switch Hero spotlight to screen-blend lighting; imleci doğru takip eder, dalga estetigini bozmaz.
- VisualShowcase: hover’da autoplay durdurma kaldırıldı; parallax/canvas touch ve küçük ekranlarda devre dışı.
- Mobile: Tilt dokunmatik cihazlarda kapalı; BentoGrid video katmanı dokunmatik cihazlarda render edilmez.
- TrustSection: 3 kart gridi lg:grid-cols-3 ile ortalandı; görseller object-center ile sola kayma düzeltildi.

## 2025-09-01

### Security / Logging Hygiene
- Remove unused `supabase/functions/iyzico-payment/iyzico-real.ts` that contained hardcoded sandbox credentials (replaced with safe stub)
- Edge Function (`iyzico-payment/index.ts`): gate info logs behind `IYZICO_DEBUG=true` and sanitize PII (mask email/phone; redact addresses)
- App (frontend): replace/remove `console.log` calls; add dev-only `debug(...)` helper gated by `VITE_DEBUG` that logs via `console.warn`
- Analytics fallback logs now use `console.warn`; PaymentSuccess/AuthContext stray logs removed

### Lint / CI
- Enforce `no-console` in app code (allow `warn` and `error`)
- Fix minor TS warnings in Checkout debug helper (use `unknown` types, safe `import.meta` typing)
- `npm run lint` passes with `--max-warnings=0`

### Developer Notes
- To see debug logs locally: set `VITE_DEBUG=true` in your `.env.development`
- To see edge logs in production/sandbox: set `IYZICO_DEBUG=true` in the function environment

## 2025-08-29

### Cart Synchronization Fixes
- **Fix: Payment success cart clearing** - PaymentSuccessPage now aggressively clears all cart localStorage data on payment success
- **Fix: Guest cart priority** - Guest cart items are now prioritized over old server cart items when user logs in
- **Fix: Server cart clearing** - Server cart is completely cleared when guest cart exists during login to prevent old items from reappearing
- **Fix: Logout owner clearing** - Cart owner is cleared from localStorage on logout, marking cart as guest cart
- **Improvement: clearCart function** - Enhanced to properly clear all localStorage keys and dispatch cross-tab sync events
- **Add: localStorage constants** - Added proper constants for cart localStorage keys for better maintainability

### Cart Behavior Summary
- ✅ Guest users can add items to cart (stored in localStorage)
- ✅ Guest cart is preserved and prioritized when user logs in
- ✅ Payment completion completely clears cart across all tabs
- ✅ User logout clears ownership, enabling fresh guest cart experience
- ✅ No more old server cart items mixing with new guest items

## 2025-08-28

### Cart / Pricing
- Fix: `upsertCartItem` hem INSERT hem UPDATE sırasında `unit_price` ve `price_list_id` yazar.
- UI: Footer'a build etiketi eklendi (`branch@sha`).

### Verify / Monitoring
- Yeni: `.github/workflows/verify-cart-items.yml`
  - `unit_price` null bulunduğunda FAIL eder, aksi halde PASS.
  - Manuel tetiklenebilir; ayrıca cron (03:00 UTC) ile gecelik çalışır.
- Script: `.scripts/query_cart.ps1` — `.env.local` → env → repo fallback sırası ile config okur; tek komutta özet verir.

### Database
- Migration: `20250828_cart_items_timestamps.sql` — `created_at`, `updated_at` ve update trigger’ı eklendi.
- Daha önceki migration’lar: `cart_items_add_unit_price.sql` ve `cart_items_add_price_list_id.sql` (idempotent).

### CI/CD
- Cloudflare Pages
  - Deploy tetikleyici: `paths` filtresi kaldırıldı → master’a her push’ta otomatik deploy.
  - Build env: `VITE_CART_SERVER_SYNC=true`, `VITE_COMMIT_SHA`, `VITE_BRANCH`.
- Supabase Migrate
  - `sslmode=require` zorunluluğu ve psql bağlantı testi eklendi.
  - `SUPABASE_DB_URL` yoksa `SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF` ile Supabase CLI fallback.

### Notlar
- Secrets: CI için GitHub Secrets kullanın; yerelde `.env.local` kullanabilirsiniz (repo’ya commit etmeyin).
- `Verify Cart Items` job’ı PASS ise son getirilen satırlarda `unit_price` alanı boştur değildir; `price_list_id` özel liste için UUID, global fiyat için null olabilir.
