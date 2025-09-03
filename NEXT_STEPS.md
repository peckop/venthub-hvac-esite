# NEXT_STEPS — Kısa Vadeli Görevler (Güncel)

**📍 Durum:** Bu belge ROADMAP.md ile senkronize edilmiş detaylı görev listesidir.
**🎯 Ana kaynak:** `docs/ROADMAP.md` (genel yol haritası)
**🔧 Bu belge:** Kısa vadeli teknik detaylar ve komut örnekleri

## Current state (TL;DR)
- Payments: iyzico flow works; legal consents (KVKK, Mesafeli Satış, Ön Bilgilendirme, sipariş onayı) collected and saved.
- Payments (env): iyzico live (production) traffic has started. Keep sandbox vs live configurable; ensure live callback domain(s) are whitelisted in iyzico panel.
- Legal pages: KVKK, Mesafeli Satış, Ön Bilgilendirme, Gizlilik ve Çerez Politikası sayfaları mevcut ve router’a bağlı.
- Config: Şirket/kanuni alanlar src/config/legal.ts içinde placeholder olarak merkezi yönetiliyor.
- CI: GitHub Actions build/test SUCCESS; lint blocking (max‑warnings=0) — ci.yml lint adımı eklendi.
- Git remote: SSH (no token needed). Push/pull with your SSH key is ready.

## High‑priority next tasks (1–2 days)

### ✅ TAMAMLANAN GÖREVLER (2025-09-02'ye kadar)
- [x] **CI: Lint'i "blocking" yap** — CI'da lint adımı bloklayıcı (--max-warnings=0)
- [x] **Performans: Bundle optimizasyonu** — %87 küçültme sağlandı (1,118kB → 145kB)
- [x] **Güvenlik/Log Hijyeni** — PII maskeleme, VITE_DEBUG/IYZICO_DEBUG gates
- [x] **no-console politikası** — ESLint kuralı aktif (warn/error serbest)
- [x] **WhatsApp & SMS sistemi** — Notification service ve stock alerts hazır
- [x] **Stok yönetimi** — Otomatik stok düşümü, idempotent guards, admin UI

### 📋 KALAN ÖNCELIKLI GÖREVLER
1) **Lint cleanup (Phase 1 – detay temizliği)**
   - CheckoutPage.tsx
     - Missing deps (clearCart, orderId, convId), "any" tiplerini unknown'a çevir
   - PaymentWatcher.tsx
     - useEffect: checkOnce bağımlılığı (useCallback ile çöz)
   - HomePage.tsx
     - handleCartToast kullanılmıyor — kaldır ya da kullan
   - AuthContext.tsx, hooks/useCart.tsx, components/HVACIcons.tsx
     - react-refresh/only-export-components uyarıları
   - Genel: Kalan "any" tiplerini daralt

2) **iyzico production hygiene** 🔄 Kısmen yapıldı
   - [x] PII maskeleme ve debug gating
   - [ ] Env toggle: sandbox ↔ live (script URLs, API endpoints)
   - [ ] Live callback domain whitelist (iyzico panel)

3) **Sipariş/İdari işlevler**
   - [ ] Orders detayında fatura bilgileri + yasal onayları görünür kıl
   - [ ] (Opsiyonel) Admin için basit görüntüleme sayfası

4) **İçerik/Legal**
   - [ ] Çerez Politikası metni (src/config/legal.ts) şirket bilgileri ile güncelle

5) **Stok sistemi son adımlar** (ROADMAP'de detay)
   - [ ] RLS policies (güvenlik)
   - [ ] Checkout stock revalidation (oversell engelleme)
   - [ ] WhatsApp wa.me config (frontend entegrasyonu)

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

