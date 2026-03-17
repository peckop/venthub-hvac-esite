# NEXT_STEPS — Kısa Vadeli Görevler (Güncel)

**📍 Durum:** Bu belge ROADMAP.md ile senkronize edilmiş detaylı görev listesidir.
**🎯 Ana kaynak:** registry/PULSE.md (canlı proje hafızası)
**🔧 Bu belge:** Kısa vadeli teknik detaylar ve komut örnekleri

## Current state (TL;DR)
- Payments: iyzico flow works; legal consents (KVKK, Mesafeli Satış, Ön Bilgilendirme, sipariş onayı) collected and saved.
- Payments (env): iyzico live (production) traffic has started. Keep sandbox vs live configurable; ensure live callback domain(s) are whitelisted in iyzico panel.
- Legal pages: KVKK, Mesafeli Satış, Ön Bilgilendirme, Gizlilik ve Çerez Politikası sayfaları mevcut ve router’a bağlı.
- Config: Şirket/kanuni alanlar src/config/legal.ts içinde placeholder olarak merkezi yönetiliyor.
- CI: GitHub Actions build/test SUCCESS; lint blocking (max‑warnings=0) — ci.yml lint adımı eklendi.
- Git remote: SSH (no token needed). Push/pull with your SSH key is ready.

### 2025-09-19 — İş Paketi Kapatıldı
- Admin Dashboard: Bekleyen Kargo — kargo dağılımı; Bekleyen İade — durum kırılımı kartları eklendi
- Envanter: CSV export artık SKU yazar; CSV import/undo akışı uçtan uca test edildi (batch undo)
- Güvenlik: enforce_role_change, bump_rate_limit, update_updated_at_column için search_path sabitlendi; Advisor(Security) sadece LPP WARN ile kaldı (bilinçli)

## High‑priority next tasks (1–2 days)

### Güvenlik & Performans (kritik takip)
- Üretim/preview trafiği toplandıktan sonra indeks kullanım raporu: `pg_stat_user_indexes` (0 kalan ve constraint/FK desteklemeyen indeksler aday)
- Haftalık ANALYZE/VACUUM planı (low-traffic pencere): tablo bazlı plan çıkar
- Advisor (security/perf) CI çıktılarının düzenli takibi ve aksiyon listesi (GitHub Issues)
- RLS duman testleri: örnek JWT ile SELECT/INSERT/UPDATE/DELETE senaryoları (beklenen izinler)
- Migrations runbook: yeni fonksiyon/search_path ve policy değişiklikleri için kısa kılavuz

### Arama Mimarisini Kurumsal Seviyeye Taşıma (Yeni)
1) Back‑end / DB
   - [ ] Postgres FTS (Turkish dictionary) + `pg_trgm` ile typo toleranslı arama
   - [ ] İndeksler: name, brand, model_code, sku üzerinde GIN/GIN+trgm
   - [ ] Normalizasyon: i/ı dönüşümleri, diakritik ve tire/boşluk insensitivite
   - [ ] RPC: `fts_search_products(q, limit, filters)` + ağırlıklandırma (name>model_code>sku>brand) ve rank
2) UX
   - [ ] Mobil tam ekran arama paneli (ikon veya `/` kısayolu ile)
   - [ ] Sekmeler: Ürünler | Kategoriler | Markalar (sayım etiketleriyle)
   - [ ] Öneriler: Son aramalar (localStorage) + popüler aramalar + “Bunu mu demek istediniz?”
   - [ ] Boş durum: ilgili kategori/marka ve popüler ürün önerileri
3) /products (PLP)
   - [ ] Facet filtreleri: Kategori, Marka, Fiyat aralığı (çoklu seçim)
   - [ ] URL senkronizasyonu ve derin linklenebilirlik
   - [ ] Sıralama: fiyat (↑/↓), ada göre, yeni, popüler
4) Performans/SEO/A11y
   - [ ] Debounce, istek iptal/cancel, sonuç cache
   - [ ] Prefetch + skeleton/paginate/sonsuz kaydırma
   - [ ] JSON‑LD SearchAction; noindex/canonical kuralları
   - [ ] A11y: focus trap, ARIA rolleri, canlı bölge (n sonuç)

### ✅ TAMAMLANAN GÖREVLER
- [x] **CI: Lint Cleanup** — Tüm uyarılar giderildi, CI bloklayıcı (`--max-warnings=0`) olarak geçiyor.
- [x] **Supabase: RLS Optimization** — Policy performansı ve güvenlik iyileştirildi, `initplan` sorunları çözüldü.
- [x] **UI: Category Landing & Hero** — Dinamik kategori sayfaları ve Hero Carousel canlıda.
- [x] **Performans: Bundle optimizasyonu** — %87 küçültme sağlandı.
- [x] **Güvenlik/Log Hijyeni** — PII maskeleme ve VITE_DEBUG gates aktif.
- [x] **WhatsApp & SMS sistemi** — Notification service hazır.
- [x] **Stok yönetimi** — Otomatik stok düşümü ve admin UI hazır.

### 📋 KALAN ÖNCELIKLI GÖREVLER

1) **iyzico production hygiene** 🔄 Kısmen yapıldı
   - [x] PII maskeleme ve debug gating
   - [ ] Env toggle: sandbox ↔ live (script URLs, API endpoints)
   - [ ] Live callback domain whitelist (iyzico panel)

2) **JULES Paralel Çalışma — Batch 2 (Devam Ediyor)**
   - [x] Task 6: Dead Code & TS Cleanup (PR #44 ile tamamlandı)
   - [x] **Task 5: Accessibility (A11y)** → JULES tarafından denetlendi (sıfır hata), PR #45 ile kapatıldı.
   - [ ] **Task 7: Performance Optimization** → JULES'a verilecek sıradaki ve son periyodik temizlik işi.

3) **Sipariş/İdari işlevler**
   - [ ] Orders detayında fatura bilgileri + yasal onayları görünür kıl
   - [ ] (Opsiyonel) Admin için basit görüntüleme sayfası


3) **İçerik/Legal**
   - [ ] Çerez Politikası metni (src/config/legal.ts) şirket bilgileri ile güncelle

4) **Stok sistemi son adımlar** (ROADMAP'de detay)
  - [x] RLS policies (güvenlik)
  - [x] Checkout stock revalidation (oversell engelleme)
  - [ ] WhatsApp wa.me config (frontend entegrasyonu)

## Ana Sayfa Geliştirmeleri — Takip (2025-09-07)

- [x] VisualShowcase ve SpotlightList’i kaldır
- [x] Featured ve New Products bölümlerini kaldır
- [x] BrandFlow’u ekle (iki şeritli sakin marka akışı)
- [ ] ProductFlow: üç şerit yön/warp optimizasyonu (kesintisiz akış, doğru yönlendirme)
- [ ] i18n: ProductFlow etiketleri + Resources/FAQ metinleri (tr/en)
- [ ] IO: ProductFlow’u viewport’a girince başlat (prefers-reduced-motion saygılı)
- [ ] 1. Dalga: Spotlight Hero + Sayaçlar + Before/After Slider (opsiyonel)
- [ ] QA: a11y (odak/focus), Lighthouse, analytics event doğrulama

## Knowledge Hub & Hesaplayıcılar
- [x] PDP: Ürün detayında "İlgili Rehber" bağlantısı (kategori/alt kategori → konu eşleme)
- [x] Kategori Sayfası: Ürün kartlarında bağlama göre "İlgili Rehber" bağlantısı (optional)
- [x] HubPage: arama + etiket filtresi (/destek/merkez)
- [x] Hesaplayıcılar v1 iskeleti: /destek/hesaplayicilar/{hrv,hava-perdesi,jet-fan,kanal}
- [x] Header menüde Knowledge Hub girişi
- [ ] Hesaplayıcılar index linki (menü veya hub üzerinden)
- [ ] Hesaplayıcılar v2: gerçek formüller, birimler, hata durumları, paylaşılabilir URL (querystring)

## Navigasyon Sorunu (HomePage tık gecikmesi)
- [ ] Overlay/pointer-events ve z-index denetimi (hamburger/megamenu/hero üstü yüzeyler)
- [ ] Lazy-loaded rotalar için prefetch/üst‑katman isabet testi
- [ ] Click-through telemetry: data-attr ile event yayımlama ve zamanlama ölçümü
- [ ] Repro script ve fix; unrelated değişiklikleri uzak tut — sadece kök nedenin PR’ı

## Nice‑to‑have (yakın vade)
- E‑fatura veya PDF fatura taslağı (ileride).
- Erişilebilirlik ve Lighthouse turu.
- Basit e2e happy‑path (Playwright) ve smoke testleri.

## Content ops: Uygulama kartları yönetimi
- Konfig dosyası: src/config/applications.ts
  - ApplicationCard alanları: key, title, subtitle, href, icon, accent, active
  - Aktif kartlar: APPLICATION_CARDS.filter(c => c.active)
  - “Endüstriyel Mutfak” kartı şimdilik active:false; açmak için true yapmanız yeterli.
- UI yardımcıları: src/utils/applicationUi.tsx
  - iconFor(icon, size): Lucide ikon mappingi
  - accentOverlayClass(accent): gradient overlay sınıfı
  - gridColsClass(count): bilinen Tailwind sınıflarına map (dynamic class yok)
- Kullanım yerleri:
  - HomePage.tsx: Hero altındaki “Uygulamaya Göre Çözümler”
  - ProductsPage.tsx: Keşfet modundaki “Uygulamaya Göre Çözümler” (id=by-application)
- Notlar:
  - Tailwind purge için dinamik sınıflar kullanılmadı; gridColsClass sayıyı bilinen sınıflara çevirir.
  - Kartları yeniden sıralamak için APPLICATION_CARDS dizisindeki sıralamayı değiştirin.
  - İleride i18n yapılırsa title/subtitle sözlüğe taşınabilir; konfig anahtarları sabit kalır.

## Commands cheat‑sheet
- Recent work and diffs
```bash path=null start=null
# last 10 commits (one‑line)
git --no-pager log -n 10 --oneline
# last commit summary
git --no-pager show --stat HEAD
```

- Local checks
```bash path=null start=null
# install deps (CI parity)
npm ci
# type check
npx tsc --noEmit
# build (CI target)
npm run build:ci
# lint (warnings allowed for now)
npx eslint .
```

- GitHub Actions (requires gh CLI)
```bash path=null start=null
# watch latest run on master
$runId=$(gh api repos/peckop/venthub-hvac-esite/actions/runs?branch=master\&per_page=1 --jq ".workflow_runs[0].id"); \
gh run watch $runId --exit-status --interval 5
```

- SSH remote verification
```bash path=null start=null
# should say: successfully authenticated
ssh -T git@github.com
# confirm current remote
git remote -v
```

## Context snapshot (why decisions were made)
- Lint’i geçici olarak warnings‑only yaptık: CI’yı yeşile almak ve teslim akışını kesmemek için. Uyarılar kademeli temizlenecek, ardından lint yeniden blocking olacak.
- Checkout/iyzico entegrasyonunda script yükleme ve iframe hazır olma süreci için kademeli fallback’ler bırakıldı (token, checkoutFormContent, hosted page redirect).
- Hukuki metinler placeholder + centralized config ile yönetiliyor; gerçek şirket bilgileri geldiğinde src/config/legal.ts güncellenecek.

