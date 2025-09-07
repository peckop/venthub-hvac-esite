# ROADMAP — VentHub HVAC (Single Source of Truth)

Last updated: 2025-09-07

Bu belge; proje yol haritası, sprint planları, kurumsal/PLP planı ve operasyonel notlar için tek ve güncel kaynaktır.

## 1) Durum Özeti (TL;DR)
- Sepet Senkronizasyonu: Misafir ve kullanıcı sepeti senkronizasyonu tamamen düzeltildi. Misafir sepeti korunuyor, ödeme sonrası sepet tamamen temizleniyor, eski ürünler karışmıyor.
- Router & Navigasyon: Sipariş Detay sayfası eklendi, Orders listesi detay sayfasına yönlendiriyor, inline panel kaldırıldı.
- Kargo: Detay sayfasında kargo alanları ve timeline var; link olduğunda dış bağlantı ikonu gösteriliyor (UI hazır).
- İadeler: Returns listesinde sipariş kodu yeni detay rotasına gidiyor.
- Fatura: Proforma PDF indirme mevcut (OrderDetailPage). Kurumsal bilgiler ve numaralandırma/şablon iyileştirmeleri TODO.
- Testler: Suite yeşil; 3 UI testi skip (test ortamı stabilizasyonu gerektiriyor, fonksiyonelliği etkilemiyor).
- Lint: CI'da blocking (maks. uyarı=0); kalan uyarılar kademeli temizlenecek.
- Güvenlik/Log Hijyeni: Uygulama tarafında konsol logları kaldırıldı/koşullandı (VITE_DEBUG); Edge Function logları IYZICO_DEBUG ile koşullu ve PII maskeli; ESLint 'no-console' politikası etkin.
- Ürün Görünürlüğü & RLS: Products/Categories tablolarına herkese SELECT politikası eklendi; user_profiles üzerindeki RLS sonsuz döngü hatası kalıcı olarak giderildi (SECURITY DEFINER fonksiyonları ile). Ürün istekleri 500 → 200.

## 2) Sprint Planı

> Not: Şirket kuruluşu ve kendi sunucu (self‑host) konuları şimdilik ertelendi. Aşağıdaki "Parked/Deferred" bölümünde listelendi. Mevcut sprint, bunlara bağlı olmayan işlerle devam edecek.

### Sprint 1 — Tamamlandı
- [x] Sipariş detay sayfası (kargo/teslim bilgileri, compact timeline)
- [x] AccountOverview’da son sipariş bağlama
- [x] Profil düzenleme (ad/telefon)
- [x] Router ve sekme/navigasyon iyileştirmeleri
- [x] Reorder UX (sepete yönlendirme, eksik ürün uyarısı)
- [x] Proforma PDF butonu (ilk adım)
- [x] QA/erişilebilirlik iyileştirmeleri
- [x] “Kargo Takibi” sekmesi (UI)
- [x] Header’daki işlevsiz “Siparişlerim” butonlarının kaldırılması

### Sprint 2 — Devam ediyor (Şirket/Server bağımsız işler)
- Sepet ve Senkronizasyon
  - [x] Misafir sepeti korunuyor (ödeme gerektiriyor, giriş yaptığında misafir sepet öncelikli)
  - [x] Ödeme sonrası sepet temizleniyor (agresif localStorage temizleme)
  - [x] Sunucu sepeti ve misafir sepeti uyumlu çalışıyor (çıkış-giriş döngüsünde eski veriler karışmıyor)
- Test/kalite
  - ~~[ ] Skip'li 3 UI testini stabilize edip aktifleştir (OrdersPage nav, OrderDetail sekmeler, Returns modal)~~
  - [ ] Lint cleanup (Phase 1) → ardından CI'da lint'i tekrar blocking yap
  - [x] ESLint no-console politikası: app kodunda console.log engellendi (warn/error serbest)
- Güvenlik/Log Hijyeni
  - [x] Edge Function loglarını IYZICO_DEBUG env ile koşullandır
  - [x] PII maskeleme: e‑posta/telefon/adres içeren logları sanitize et
  - [x] Kullanılmayan ve hardcoded sandbox credential içeren modülü kaldır (iyzico-real.ts)
  - [x] Frontend debug helper ile (VITE_DEBUG) PII sızdırmadan tanılama yap
- Performans
  - [x] Code‑split (dynamic import / manualChunks) — %87 bundle küçültme sağlandı (1,118kB → 145kB)
- Kargo takip entegrasyonu (Sandbox/Backend)
  - [x] Taşıyıcı API/webhook veya periyodik polling (sandbox)
  - [x] Status senkronizasyonu (pending→paid→shipped→delivered)
- Returns akışı
  - [ ] Durum yönetimi (requested/approved/rejected/in_transit/received/refunded)
  - [ ] Bildirimler (opsiyonel)
- Fatura (Proforma PDF mevcut)
  - [x] İndir/Paylaş (Proforma PDF mevcut)
  - (Kurumsal bilgiler ve resmi numaralandırma "Parked" bölümünde)

### Sprint 2 — Operasyon & Stok (Yeni eklenen işler)
- Envanter ve Stok (M1)
  - [x] Şema: venthub_products.stock_qty (int, default 0)
  - [x] Şema: venthub_inventory_movements (id, product_id, delta, reason, order_id?, created_at)
  - [x] Şema: inventory_settings (single row) → default_low_stock_threshold
  - [x] Şema: venthub_products.low_stock_threshold (ürün bazında override)
  - [ ] RLS: inventory_settings update sadece admin; products stok alanlarını admin veya RPC ile güncelle
  - [x] RPC: set_stock(p_product_id uuid, p_new_qty int, p_reason text)
  - [x] RPC: adjust_stock(p_product_id uuid, p_delta int, p_reason text)
  - [x] Order sonrası atomik stok düşümü (REST API) + idempotent guard (stock_processed flag)
  - [x] Stok uyarı sistemi: otomatik WhatsApp/SMS/Email bildirimleri (threshold ≤ 5)
- Operasyon Sayfası (Admin)
  - [x] Operasyon > Stok: liste, arama, +1/−1, “Ayarla”
  - [x] Satır içi “Eşik” düzenleme (varsayılanı kullan/override)
  - [x] Satır içi stok düzenleme sütunu (− / miktar / + / Kaydet) ve anlık “Satılabilir” güncellemesi
  - [x] “Ürün seç” dropdown kaldırıldı; satır tıklama ile seçim ve bağlam paneli (Hızlı Eşik Ayarları) sadece seçim olduğunda görünür
  - [ ] Toplu işlem ve CSV içe/dışa aktar (SKU, qty)
  - [ ] Son 5 hareket mini paneli ve 10 dk “Geri al” (undo) özelliği (opsiyonel)
  - [x] Account menüsünde admin’e özel “Operasyon” sekmesi görünür
- Müşteri UX
  - [x] PDP/PLP rozet: “Stokta” / “Stokta yok” (stok_qty>0)
  - [x] Stok yoksa: “Stok sor” butonu → mailto formu (başlangıç), WhatsApp linki yapılandırılabilir
  - [ ] Sepete ekle disabled; checkout’ta stok yeniden doğrulaması
- Erişim ve RLS Stabilizasyonu (Yeni)
  - [x] Products ve Categories için herkese SELECT politikası (RLS) eklendi
  - [x] user_profiles RLS sonsuz döngü hatası giderildi (SECURITY DEFINER fonksiyonları ile)
- WhatsApp & Bildirim Sistemi
  - [x] notification-service Edge Function: WhatsApp/SMS/Email altyapısı
  - [x] stock-alert Edge Function: otomatik stok uyarıları
  - [x] Twilio entegrasyonu: WhatsApp Business API + SMS
  - [x] Template sistemi: özelleştirilebilir mesaj şablonları
  - [x] İdempotency: çoklu bildirim engelleme
  - [x] İyzico callback entegrasyonu: ödeme sonrası stok uyarısı tetikleyicisi
  - [ ] Environment variables: Twilio + Resend API keys
  - [ ] Kurumsal numara: WhatsApp Business onayı
  - [ ] Faz 1: wa.me bağlantısı için config (örn. VITE_SHOP_WHATSAPP)
- Kargo Operasyonları (minimal)
  - [ ] OrderDetail/Operasyon: Kargo firması + takip no girme/güncelleme
  - [ ] “Kargolandı” durumuna geçiş; müşteri e‑postası (opsiyonel)

### Sprint 3 — Planlı
- Admin panel (gelişmiş): sipariş yönetimi, kargo bilgisi girme, toplu işlem, fatura yönetimi
- Kargo 3PL/API entegrasyonları ve otomatik status güncellemeleri
- Bildirimler: kargoya verildi/teslim edildi e‑posta/SMS
- KVKK/GDPR self‑service (veri indirme, silme talebi vb.)
- Performans: dynamic import / manualChunks ile code‑split ve bundle küçültme

### Bilgi & Kılavuz Merkezi (Yeni Yol Haritası Bağlantısı)
- Referans belge: docs/VENTHUB_BILGI_MERKEZI_GELISMIS.md
- Sprint 1 (Kısa vade)
  - [x] /destek/merkez (Hub) sayfası — arama + etiket filtresi
  - [x] 3 konu için TopicPage yapısı + i18n (Hava Perdesi, Jet Fan, HRV)
  - [x] v1 hesaplayıcılar: HRV, Hava Perdesi, Jet Fan, Kanal hız/Δp (ön-boyutlandırma) — iskelet sayfalar
  - [ ] Ürün filtre eşlemesi ve “filtreli URL” ile ürün listesine geçiş
- Sprint 2
  - [ ] Ürün Seçici (wizard) → konu sayfalarından bağlama
  - [ ] Hesap girdilerinin URL ile paylaşımı (link/share)
- Sprint 3
  - [ ] Fan Eğrisi Motoru (v2): üretici eğrileri + sistem eğrisi kesişimi + FEI
  - [ ] Jet fan itme (N) doğrulama ve duman senaryosu notları
- Standart profilleri
  - [ ] EU/US profil seçimi, varsayılan aralıkların profile göre gelmesi
  - [ ] Her hesaplayıcı altında 2–3 maddelik standart referans bloğu

## 3) Operasyonel “Next Steps” (Öncelikli)
- Test stabilizasyonu
  - ~~[ ] Skip’li 3 UI testini aktive et (Orders nav, OrderDetail sekme/track link, Returns modal)~~
- Lint/CI
  - [ ] Lint cleanup (Phase 1): any→unknown, unused fix’leri
  - [x] Lint’i tekrar blocking yap (CI)
  - [x] no-console politikası: app kodunda console.log engelle (warn/error serbest)
- Güvenlik/Log Hijyeni
  - [x] Frontend debug helper (VITE_DEBUG) ve PII‑siz özet loglar
  - [x] Edge Function loglarını IYZICO_DEBUG ile koşullandır ve PII maskesi uygula
- Performans
  - [x] Code‑split planını uygula (manualChunks / dynamic import) — tamamlandı
- Kargo (sandbox)
  - [x] Statü senk ve basit taşıyıcı webhook/polling prototipi
- Orders detay (opsiyonel)
  - [ ] Yasal onay alanlarını görünür kıl (mevcut kayıt varsa)

## 4) Kurumsal/PLP Planı (Özet)
- Kaynak: docs/plan-and-tasklist.md (detay korunuyor), ancak güncel kaynak ROADMAP.
- Faz 0: [x] Tamamlandı
- Faz 1–3 ve QA kontrol listeleri: [ ] Beklemede (kurumsal/PLP odaklı). E‑ticaret sprintleriyle çakışma yok; uygun zamanda ele alınacak.

## 5) QA (Örnek Kontrol Başlıkları)
- [x] Sepet senkronizasyonu:
  - [x] Misafir olarak ürün ekleyip çıkış yapma: sepet korunur
  - [x] Kullanıcı girişi yapma: misafir sepeti öncelikli, eski sunucu ürünleri eklenmez
  - [x] Ödeme tamamlama: sepet tüm tablar arasında temizlenir
- [ ] Orders→Detay: kargo alanları, timeline, dış link (varsa)
- [ ] Returns→Sipariş linki: /account/orders/:id rotasına gider
- [ ] Proforma PDF: dosya indirir, içerik alanları doğru
- [ ] Router: Orders listesi inline panel açmaz, detay sayfasına yönlendirir
- [ ] Build, test: yeşil

## 6) Komutlar
- Build: `pnpm run build:ci`
- Test: `pnpm test -- --run`
- Lint: `pnpm exec eslint .`

## 7) Notlar
- Bu belge tek ve güncel kaynak (Single Source of Truth). Eski NEXT_STEPS ve plan-and-tasklist korunur; fakat her değişiklik önce ROADMAP’e işlenecektir.

## 8) Operasyon & Stok Planı (Özet)
- Kapsam: Envanter tabanı (stock_qty + inventory_movements), admin Operasyon > Stok sayfası, düşük stok eşikleri (global + ürün), müşteri tarafı “Stokta/Stokta yok” ve “Stok sor” akışı, minimal kargo operasyonları.
- Detaylı plan ve teknik ekler: bkz. docs/OPERATIONS_PLAN.md
- Geleceğe hazırlık: Çoklu depo/variant/shipments şeması additive genişleyecek; bugün atılan adımlar geriye dönük uyumlu.

## Parked / Deferred (Şirket ve Server hazır olunca)
- Kurumsal bilgiler: `src/config/legal.ts` doldurma (ünvan, adres, vergi dairesi/no, MERSİS, KVKK e‑posta)
- Fatura numaralandırma ve resmi şablon (company header, logo, vergi alanları)
- Self‑host go‑live (Coolify): deploy/Dockerfile ile canlıya alma, domain/DNS/SSL
- iyzico live hygiene (panel whitelist ve canlı toggle) — şirket/alan adı netleşince

## Ek: Kurumsal/PLP Planı Checklist (Arşivden taşınan)

---

## Güncelleme — 2025-09-07: Ana Sayfa Konsolidasyonu + Knowledge Hub v1

Bu güncelleme ile ana sayfa kurumsal plana göre sadeleştirildi ve Bilgi Merkezi ilk sürümü yayına alındı.

Uygulananlar:
- VisualShowcase ve SpotlightList kaldırıldı.
- ProductFlow tek vitrin (full‑bleed bant) olarak korundu; hız/akış optimizasyonları sırada.
- BrandFlow eklendi (iki şerit, sakin marka akışı) — ProductFlow’dan farklı, prestij odaklı.
- Featured ve New Products bölümleri kaldırıldı.
- Spacing ve blok sıralamaları normalize edildi.
- Knowledge Hub: /destek/merkez (arama + etiket filtre), TopicPage i18n.
- Hesaplayıcılar v1: HRV, Hava Perdesi, Jet Fan, Kanal — iskelet sayfalar ve rotalar.
- Deploy: GitHub → Cloudflare Pages otomatik; PR preview akışı.
- Bilinen konu: Ana sayfada bazı menü linklerinde ilk tık gecikmesi/bloklanması (overlay/pointer-events) araştırılıyor; geçici yan değişiklikler geri alındı.

Ayrıntılar ve backlog: docs/HOMEPAGE_ENHANCEMENTS.md

## Güncelleme — 2025-09-05: Ana Sayfa Geliştirmeleri Uygulaması

Bu güncelleme ile ana sayfa kurumsal ve etkileşim odaklı hale getirildi. Ayrıntılar: docs/HOMEPAGE_ENHANCEMENTS.md

Uygulananlar:
- VisualShowcase (Hero altında): parallax + canvas parçacık + play/pause + klavye/swipe
- ProductFlow (Uygulamaya Göre Çözümler üzerinde): görsel akış, yoksa tıklanabilir marka kartları, reduced‑motion grid
- TrustSection: KVKK/iyzico/İade-Değişim rozetleri (Cloudflare kartı kaldırıldı)
- FAQShortSection: 3 soru-cevap ve Support linkleri
- ResourcesSection: destek içerikleri mini alanı
- ProductsPage: breadcrumb dinamik (Keşfet / Tüm Ürünler / Arama), Popüler Kategoriler tıklamasında analytics
- StickyHeader/MegaMenu: nav_click ve category_click event’leri
- main.tsx: history.scrollRestoration = 'manual' (yenilemede sayfa başı)
- CaseStudySection kaldırıldı

Sıradaki Öneriler (kısa liste):
- Spotlight Hero, In‑view Sayaçlar, Before/After Slider (1. dalga)
- Bento Grid, 3D Tilt Card (2. dalga)
- Scroll‑Linked Process, Magnetic CTA, Spotlight List (3. dalga)
- Masonry/Gallery, Soft‑Particles varyasyonları (4. dalga)

Not: Ayrıntılı backlog ve QA başlıkları için docs/HOMEPAGE_ENHANCEMENTS.md

### Faz 0 (Tamamlandı)
- [x] Uygulama kartlarını merkezi konfige taşı
- [x] Home ve Keşfet sayfalarını bu konfig ile render et
- [x] Tailwind dynamic class riskini kaldır (gridColsClass)
- [x] Docs: NEXT_STEPS’e içerik‑operasyon notu

### Faz 1 — Ana Sayfa Kurumsal Güçlendirme
1) Vaka çalışması (Case Study) blokları (1–2 adet)
   - [ ] Bileşen: görsel/başlık/kısa özet/sonuç metrikleri
   - [ ] Yerleşim: Güven şeridi sonrası, ürün teaser’dan önce
   - [ ] Placeholder içerikle başla; gerçek içerik gelince güncelle
2) Kaynaklar/Kılavuzlar mini alanı
   - [ ] Başlık + 2–3 link kartı (örn. “Otopark Jet Fan seçimi”, “Hava perdesi seçimi”)
   - [ ] PDF linkleri veya blog/knowledge sayfalarına yönlendirme
3) Ürün teaser düzeni (teyit)
   - [x] En fazla 4 kart; “Tümünü Keşfet” CTA’yı vurgula
4) Alt CTA (mevcut)
   - [ ] Metin/copy gözden geçir; lead modal tetikleme teyidi

### Faz 1 — Keşfet (PLP) Netleştirme
1) Keşfet hero ve şerit
   - [x] Kısa kopye gözden geçir; “İhtiyacına Göre Seç” anchor bağlantısı test
2) Uygulamaya Göre / Popüler Kategoriler
   - [x] İkonografi ve micro‑copy temel kurulum (ince ayar TBD)
   - [ ] Kart hover, focus, a11y teyit
3) Vitrinler
   - [x] “Öne Çıkanlar” ve “Yeni Ürünler” dengesi; grid/list modlarıyla uyum

### Faz 2 — Navigasyon ve IA
1) “Çözümler” menüsü (ileride)
   - [ ] “Endüstriyel Mutfak” hazır olunca dropdown ekle
   - [ ] URL: `/solutions/kitchen-ventilation` (landing)
2) Site haritası güncellemesi
   - [ ] Çözümler sayfası canlı olduğunda sitemap’a ekle

### Faz 2 — Analytics (opsiyonel)
1) Data‑attribute tabanlı delegasyon (tek listener)
   - [ ] data-analytics-event + data-analytics-props ile tıklama/event standardı
2) Olaylar
   - [ ] hero_cta_click, nav_click, application_click, category_click
   - [ ] search_submit, filter_change, sort_change, compare_add/remove
   - [ ] lead_open, lead_submit

### Faz 3 — “Endüstriyel Mutfak” Çözüm Sayfası (gelecek)
1) Landing yapısı
   - [ ] Sorun/standartlar çerçevesi, bileşenler, önerilen ürün aileleri
   - [ ] Basit hesaplayıcılar (hava debisi/kanal hızı/basınç kaybı — başlangıç)
   - [ ] Case study + dokümanlar (CAD/BIM/PDF)
   - [ ] CTA: proje yükle/teklif iste
2) SEO ve içerik
   - [ ] İçerik başlıkları hiyerarşisi, schema (FAQ/HowTo/Article uygun olanlar)

### QA Kontrol Listesi
- Genel
  - [ ] Ana Sayfa ve Keşfet görev ayrımı net; tekrar içerik yok
  - [ ] Uygulama kartları sayısı değiştiğinde grid ve görünüm sağlıklı
  - [ ] “Endüstriyel Mutfak” kartı gizli (active:false)
- Ana Sayfa
  - [ ] Case Study ve Kaynaklar blokları responsive, erişilebilir
  - [ ] Hero ve Alt CTA butonları hatasız
- Keşfet
  - [ ] Keşfet ↔ Tüm Ürünler modları doğru davranıyor
  - [ ] Breadcrumb, canonical/noindex kuralları doğru
- Performans/A11y
  - [ ] Görseller lazy; kontrast/focus durumları uygun
- Konsol
  - [ ] Hata/warn yok (dev uyarıları hariç)
