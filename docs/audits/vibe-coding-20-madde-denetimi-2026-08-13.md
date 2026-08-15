# Vibe-Coding 20-Madde Meydan Okuma Denetimi — VentHub HVAC

> **Tarih:** 2026-08-13 · **Kapsam:** tüm repo (master) + canlı Supabase (deploy edilmiş edge functions + DB) ·
> **Yöntem:** dışarıdan gelen bağımsız bir 20-maddelik güvenlik/kalite kontrol listesine karşı denetim.
> 19 bulucu pas (Madde 1–19) **10 paralel salt-okuma ajanı** ile koşuldu; **Madde 20 (doğrulama /
> yanlış-pozitif filtresi)** orkestratör (Claude Fable) tarafından uygulandı: her yük-taşıyan bulgu
> koda/DB'ye/deploy edilmiş kaynağa karşı çürütülmeye çalışıldı.
>
> **Meydan okumanın tezi:** "Bir yapay zekâ, gerçek bir uygulamada bu 20 maddenin hepsinden geçer not
> alamaz — eksikler olur." **Sonuç: VentHub bu haliyle 20 maddenin hepsinden GEÇEMEZ.** Ama dokusu önemli
> (aşağıda): başarısızlıklar ezici çoğunlukla **tek bir kapı-kör kök nedende** (edge-function bozulması)
> toplanıyor; ön-yüz/altyapı disiplini (3D yaşam-döngüsü, bellek, RLS tasarımı, conformance testleri,
> i18n, tasarım token'ları) birkaç maddeyi temiz geçiyor.

---

## 📌 GEÇ KAYIT + SONRAKİ DURUM (eklendi 2026-08-15, LAUNCH şeridi)

**Bu belge iki gün boyunca git'e HİÇ girmemişti** — yalnız ana çalışma dizininde takipsiz (`untracked`)
duruyordu. Ondan türeyen iş emirleri (`T.GEN.SIS.1308262152*` = İ/J/K/L/M/N paketleri) registry'ye
işlenmiş, kararların dayandığı ölçüm ise diskte kalmıştı. Aşağıdaki metin **2026-08-13'teki hâliyle,
değiştirilmeden** commit'lendi; audits konvansiyonu gereği bir denetim sonradan düzeltilmez, üstüne
durum notu düşülür. Bu kutu o nottur.

**Kök nedenin (edge kaynak bozulması) bugünkü durumu — `origin/master`'da ölçüldü, 2026-08-15:**

| Belgede adı geçen bozulma | Bugün master'da | Kanıt |
|---|---|---|
| `order-validate` → `await res._text()` | ✅ onarıldı | grep sonuçsuz |
| `order-validate` → `&_limit=1` | ✅ onarıldı | grep sonuçsuz |
| `apply-coupon` → aynı scope'ta çift `const cors` | ✅ onarıldı | tek tanım (satır 44) |
| `iyzico-callback` → çift `const corsHeaders`, `_text/html` | ✅ onarıldı | tek tanım (satır 28) |
| `order-validate` → `select=* &` (URL'de boşluk) | ❌ **HÂLÂ DURUYOR** | `supabase/functions/order-validate/index.ts:95` |

Yani onarım paketi (`T.GEN.SIS.1308262152A.VH`, durumu `completed`) bozulmaların çoğunu kapatmış ama
**bir tanesi hayatta**. `deno check` bunu göremez: boşluk bir şablon-dizesinin içinde, tip hatası değil —
belgenin kendi dersi ("string-mangling'i derleyici GÖRMEZ, iki katman şart") tam da burada tekrarlıyor.
Tüm edge fonksiyonları aynı desen için tarandı; **tek kalıntı budur**.

**Ölçülemeyen:** deploy edilmiş prod sürümünde de duruyor mu — `SUPABASE_ACCESS_TOKEN` şu an ölü
(MCP `get_edge_function` → `Unauthorized`; iş emri `T.GEN.SIS.1508261705A.VH`). Token yenilenince
doğrulanmalı. Bu satır bir iddia değil, **ölçülemediğinin kaydıdır**.

Bulgu `supabase/functions/**` = EDGE şeridine ait olduğu için burada onarılmadı, panoya bildirildi.

---

## ⚠️ Şiddet Çerçevesi — ÖNCE OKU

Denetim sırasında canlı DB sorgulandı: **`venthub_orders` = 0 kayıt, `inventory_movements` = 0 kayıt.**
Bugüne kadar tek bir gerçek sipariş işlenmemiş. Site canlı satışta değil, kuruluyor (fiyat motoru yok,
katalog yüklenmemiş). Bu nedenle aşağıdaki ödeme/sipariş bulgularının **hiçbiri şu an müşteri zararı
üretmiyor** — ama hepsi **sert lansman-engeli**: ilk gerçek checkout girdiği an devreye girer.
"Canlı kesinti" DEĞİL, "satışa açmadan onarılmalı" kategorisi.

---

## ⭐ KÖK NEDEN — Edge-function kaynak bozulması (deploy edilmiş, kanıtlı)

Otomatik bir "kullanılmayan değişkene alt-çizgi ekle" düzeltmesi, **kullanılan** tanımlayıcılara yanlış
uygulanmış ve `supabase/functions/` katmanını bozmuş. Kalıp: `.text()`→`._text()`, `text/html`→`_text/html`,
`paid:`→`pa_id:`, `return_id`→`_return_id`, `valid`→`val_id`, `limit`→`_limit`, `data`→`_data`, ve birçok
dosyada **aynı scope'ta çift `const`** (düpedüz `SyntaxError`). Kaynak commit `2c01b300` civarı (2026-05-30),
master'a commit'li; working tree temiz (yalnız `.md` companion değişiklikleri).

**Orkestratörün bizzat doğruladığı (ajan iddiası DEĞİL):**
- Repo: `order-validate/index.ts:61` = `await res._text()`; `apply-coupon/index.ts:44,47` = çift `const cors`.
- **Deploy edilmiş PROD kaynağı da bozuk** (Supabase MCP `get_edge_function`):
  - `order-validate` v137 (bugün CI'dan deploy) — `res._text()`, `&_limit=1`, `select=* &` içeriyor.
  - `iyzico-callback` v190 (bugün deploy) — aynı scope'ta iki `const corsHeaders` (parse edilemez),
    `_text/html`, tanımsız `uid` ataması, catch bloğunda tanımsız `allowed`/`origin`.
- 6 çekirdek fonksiyon (iyzico-payment v260, iyzico-callback v190, order-validate v137,
  shipping-webhook v132, shipping-status, log-client-error) **2026-08-13'te** CI runner yolundan deploy edilmiş.

**Neden hiçbir kapı yakalamadı:** `tsconfig.json` `supabase/` klasörünü hariç tutuyor; CI'da
`deno check`/deploy-dry-run yok. Next.js `tsc`/lint/build/vitest'in **hiçbiri** edge functions'a bakmıyor.
Bu, projenin kendi kayıtlı **"sınır-geçişleri kör"** dersinin (F5-B) en ağır tezahürü.

**Bozulmadan syntax-geçersiz (10 fonksiyon, boot edemez):** admin-create-coupon, admin-iyzico-reconcile,
admin-order-inspect, admin-orders-latest, admin-update-order, apply-coupon, iyzico-callback, iyzico-refund,
log-client-error, order-housekeeping. **Runtime-fatal `._text()` (parse eder, çağrıda patlar):**
order-validate, order-confirmation, admin-update-shipping, iyzico-payment (hata yolları), notification-service,
delivery-notification, refund-order-mock ve diğerleri.

> Not (dürüst belirsizlik): syntax-geçersiz bir modülün "ACTIVE v190" görünmesi, deploy'un depoladığı
> kaynak ile çalışan bundle'ın ayrışmış olabileceği ihtimalini kaynak-okumayla %100 elemez (ödeme
> callback'ini çağırıp test etmek yan-etkili olurdu, yapılmadı). Kesin olan: **hem repo hem deploy-edilmiş
> kayıt bozuk** → hat güvenilmez, lansman öncesi elden geçmeli.

---

## BÖLÜM A — CONFIRMED (şiddet sıralı; ⭐ = orkestratör bizzat doğruladı)

| # | Şiddet | Bulgu | Kanıt | Not |
|---|---|---|---|---|
| A1 ⭐ | CRITICAL | Edge-function katmanı bozuk ve prod'a deploy edilmiş (yukarıdaki kök neden) | deploy edilmiş order-validate + iyzico-callback kaynağı; repo `_text()`/çift-const | Lansman-engeli |
| A2 ⭐ | CRITICAL | Sabit-kodlu `postgres` **superuser** DB bağlantı dizesi git'te (RLS'i tamamen atlar) | `scripts/db/migrations/run-direct-migration.ts:5` + 4 kardeş dosya (`apply_wizard_migration.ts`, `fix_products_select.ts`, `run_migration_remote.ts`, `run_migration_via_db_url.ts`) | Şifre ROTASYONU + git-history temizliği şart; ifşa varsayımından bağımsız |
| A3 ⭐ | CRITICAL/HIGH | Admin auth fail-open: `JWT_CLAIMS_COOKIE_SECRET` set değilse AES anahtarı **herkese açık anon key**'den türer → sahte `user_role:super_admin` cookie ile admin kapısı geçilir | `src/middleware.ts:163` (`|| anonKey`) + `src/utils/router.ts` AES-GCM | Canlı sömürü env'e bağlı (dashboard NEEDS-CONTEXT); kod yolu doğrulandı; fail-fast yok |
| A4 | CRITICAL | İyzico ödeme SDK'sı (`npm:iyzipay`) versiyon pinsiz + `deno.lock`'ta girişi yok → her deploy farklı/ele-geçirilmiş sürüme çözülebilir | `iyzico-{payment,refund,callback}/index.ts` import satırları; `deno.lock` (iyzipay girişi yok) | Kart-ödeme yolunda tedarik-zinciri açığı |
| A5 ⭐ | HIGH | Tenant scope, doğrulanmamış girdiden türetiliyor: JWT `atob` ile **imza doğrulanmadan** decode; query `?tenant_id=` ve body tenant_id token'a tercih ediliyor | deploy edilmiş `_shared/tenant_config.ts` (`JSON.parse(atob(...))`, query-first) | Rule 12 data-bleeding; bugün tek-tenant gerçekliğiyle örtülü, SaaS yönü için kritik |
| A6 ⭐ | HIGH | Sipariş-durumu sözcük dağarcığı çatışması: DB CHECK 'paid' içermiyor → callback 'confirmed'e düşer; stok RPC'si `status IN ('paid','processing')` ister → 'confirmed' sipariş stok DÜŞÜRMEZ | DB `venthub_orders_status_check` (sorgulandı) + `20260524_idempotent_stock_reduction.sql:34` + `iyzico-callback` fallback | 0 siparişle canlı zarar yok; kod yolu kanıtlı bozuk |
| A7 | HIGH | Webhook HMAC/replay guard eksik/atlanabilir: shipping-webhook replay guard `x-timestamp` yoksa atlanır; returns-webhook dedup `_return_id` sütun-adı bozulmasıyla kalıcı ölü | `shipping-webhook/index.ts:118`, `returns-webhook/index.ts:150` vs migration `return_id` | İki ajan bağımsız yakaladı; Rule 11 ihlali |
| A8 | HIGH | Her dış çağrıda (İyzico/Resend/Twilio/Supabase) **timeout YOK**; retry/backoff yok | `supabase/functions/**` AbortController=0 grep | Yavaş bağımlılık checkout'u askıya alır |
| A9 | HIGH | Ödeme başarı payload'ı `{_data}` döner, istemci `data.data` okur → her BAŞARILI init'te kullanıcıya hata gösterilir + orphan pending sipariş | `iyzico-payment:585` vs `useCheckoutPayment.ts:127` | Bozulma kaynaklı cross-boundary |
| A10 ⭐ | MED | CORS her `*.vercel.app` origin'i yansıtıyor (paylaşılan public domain) | deploy edilmiş `_shared/cors.ts` (`endsWith('.vercel.app')`) | Defense-in-depth erozyonu |
| A11 | MED | Webhook fail-open: `SUPABASE_WEBHOOK_SECRET` yoksa doğrulama tümden atlanır; düz `!==` (HMAC/replay/sabit-zaman değil) | `src/app/api/webhook/supabase/route.ts:49` | Cache-flush DoS vektörü |
| A12 | MED | Rol-adı drift: DB kanonik `super_admin`, edge functions 15 yerde `superadmin`/`admin` kontrol ediyor; middleware `ADMIN_ROLES` ayrı | `20260811_f1_role_canonicalization*.sql` vs edge fn'ler | super_admin UI'da her şeyi görür, edge fn'lerden 403 alır |
| A13 | MED | Çıkış e-postalarına kullanıcı verisi kaçışsız gömülüyor (stored HTML injection): `customer_name`, `tracking_url` | `order-confirmation:164`, `shipping-notification:135` | Ayrıca open-redirect: `iyzico-callback` `successUrl` allowlist'siz |
| A14 | MED | Ödeme/kupon idempotency yok: callback kullanıcı-tetiklenebilir (`PaymentSuccessPage` her ziyarette re-invoke) → çift e-posta, kupon `used_count` çift artar; checkout çift-submit koruması yok | `PaymentSuccessPage.tsx:77,116`, `useCheckoutPayment.ts:83` | Deploy'a bağlı |
| A15 | MED | Stok geri-yükleme (iade/iptal) JS read-modify-write → eşzamanlı iki işlemde artış kaybı; atomik `adjust_stock` RPC'si varken kullanılmıyor | `src/lib/orderStatusService.ts:215-252` | İstemci kodu (bozulmadan bağımsız), gerçek |
| A16 | MED | Refund: PSP başarılı + DB patch swallowed → para iade edildi, sipariş hâlâ 'paid', stok/ledger tutmaz | `iyzico-refund:184-220`, `refund-order-mock` (geçersiz PostgREST body → hiç restore etmez) | |
| A17 | MED | Gözlemlenebilirlik: 10 fonksiyon boot edemez (sıfır log); webhook red'leri sessiz; CRITICAL/FATAL `console.warn`'da; Sentry 3/26 fonksiyonda; correlation-ID yok | `release-expired-reservations` (0 console.error), `_shared/sentry.ts` grep | |
| A18 | MED | Audit-trail açığı: birincil ürün/kategori CRUD (form modal'ları) `mutateWithAudit` kapısını atlıyor; aynı tablolardaki satır-aksiyonları audit'li | `ProductFormModal.tsx:140,148`, `CategoryFormModal.tsx:195,218`, `ProductCsvImport.tsx:106` | Rule 11 ihlali |
| A19 | MED | Bağımlılık: `@supabase/supabase-js`+`ssr` `"latest"` dist-tag'ine bağlı; 24 edge fn 3 farklı sürüm pini; `deno.lock` bayat (Clerk/shadcn hayaleti) | `package.json:40-41`, edge fn import'ları | |
| A20 | MED | order-validate IDOR: `cart_id` gövdeden alınıp service-role ile sahiplik kontrolsüz okunuyor | `order-validate/index.ts:57,78` | Bozulmayla zaten ölü, ama tasarım açığı |
| A21 | MED | Kupon indirimi UI'da gösterilip ücrete yansımıyor: İyzico subtotal'ı çekiyor, indirim ödeme SONRASI defter kaydı | `CheckoutPage.tsx:139` vs `iyzico-payment:450`, `iyzico-callback:276` | Yasal/UX kontrat ihlali |
| A22 | MED | CSP `Report-Only` + `unsafe-inline`/`unsafe-eval`; hiçbir şey bloklanmıyor, report-uri yok | `next.config.mjs:58-61` | |
| A23 | LOW | PII (e-posta/telefon) edge-function loglarına düz yazılıyor | `notification-service:141`, `return-status-notification:208`, `stock-alert:226` | iyzico-payment maskeliyor, bunlar değil |
| A24 | LOW | API kontrat tutarsızlığı: 7+ hata şekli (`{error}`/`{error:{...}}`/`{val_id}`/`{ok:false}`/`{success:false}`), karışık status kodları, `_limit` alan-adı wire'a sızmış | `admin-*`, `apply-coupon`, `iyzico-*` çapraz | Çoğu kozmetik |
| A25 | LOW | `.env.example` İyzico secret'ı `NEXT_PUBLIC_` altında belgeliyor (operatör literal uygularsa secret bundle'a sızar); `.env.*.example` ölü `VITE_*` adları | `.env.example:21-22`, `.env.preview.example:2-5` | |

**Olumlu (bu maddeler TEMİZ geçti — kredi):**
- **Madde 7 (Kaynak yaşam-döngüsü): PASS.** 3D/tarayıcı katmanı disiplinli `useMemo`+`dispose()` + effect cleanup;
  auth/realtime abonelikleri unsubscribe'lı. Yüksek-şiddetli sızıntı yok.
- **Madde 10 (Bellek): PASS.** Modül-seviye sınırsız cache yok; `unstable_cache` (lang+tenant anahtarlı) +
  `React.cache()` sınırlı; bildirim listesi cap'li.
- **Madde 9 (Algoritmik karmaşıklık): büyük ölçüde PASS.** Ölçekte gerçek O(n²) yok; yalnız NIT.
- **RLS tasarımı (Madde 3'ün olumlu yanı):** tüm tablolar `tenant_id + (owner OR is_admin_user())` ile
  tutarlı; eski `raw_user_meta_data` ihlali sonraki migration'da düzeltilmiş.
- **SQL injection (Madde 1'in olumlu yanı):** query-builder + parametreli RPC + `plainto_tsquery`; plpgsql
  `EXECUTE format(%I/%L)` yalnız katalog-kimliklerinde (runtime kullanıcı girdisi değil). Temiz.
- **Conformance test takımı (Madde 19'un olumlu yanı):** INV-* testleri her biri hangi kapının kaçırdığını +
  hangi gerçek olayı kodladığını belgeliyor — gerçekten yüksek kalite. `mutateWithAudit` tek-kapı iyi tasarlı.
- **pnpm postinstall'ları varsayılan blokluyor; kullanılmayan bağımlılık ~yok; typosquat yok.**

---

## BÖLÜM B — UNVERIFIED / NEEDS-CONTEXT (göremediğim canlı duruma bağlı)

- `JWT_CLAIMS_COOKIE_SECRET`, `SUPABASE_WEBHOOK_SECRET`, `ALLOWED_ORIGINS` prod'da set mi? (A3/A11/A10'un
  canlı-sömürülebilirliğini belirler — Vercel/Supabase dashboard.)
- Sabit-kodlu DB şifresi (A2) hâlâ aktif kredensiyel mi, rotate edildi mi?
- Syntax-geçersiz fonksiyonların çalışan bundle'ı gerçekten bozuk mu, yoksa daha eski iyi bundle mı koşuyor?
  (Deploy-edilmiş kayıt bozuk; çalışan bundle ancak invocation ile kesinleşir — yapılmadı.)
- `custom_access_token_hook` dashboard'da access-token hook olarak etkin mi? (RLS `is_admin_user()`/`jwt_tenant_id()`
  ve A5 fallback'i buna bağlı.)
- `increment_coupon_usage` gövdesi migration'da yok (atomiklik bilinmiyor).
- Sentry DSN gerçek mi placeholder mı; Session Replay aktif mi.
- Full transitive bağımlılık ağacı (~1000 paket) CVE/typosquat için otomatik tarayıcıyla (ağ erişimli) taranmalı.

---

## BÖLÜM C — REJECTED / DOWNGRADED (madde-20 çürütmesi)

- **"Canlı prod ödeme kesintisi / aktif oversell" → DOWNGRADED.** 0 sipariş + 0 stok hareketi (DB sorgulandı)
  → hiçbir ödeme/stok bulgusu aktif zarar üretmiyor. Hepsi "lansman-engeli"ne indirgendi. Meydan okuma
  bulgularının şiddet-tonu ("CRITICAL oversell") gerçek ama zamanlama yanlıştı.
- **"iyzico-payment gövde user_id ile başka kullanıcıya sipariş yazar (P3-1 HIGH)" → UNVERIFIED/DOWNGRADED.**
  Guest-checkout niyeti + verify_jwt etkileşimi netleşmeden HIGH damgası taşınamaz; onarım sırasında
  `getUser()` bağlaması ile birlikte ele alınmalı. Payload-tampering ekseni A9/A20 ile örtüşüyor.
- **`.env`/`.env.local` gerçek secret sızıntısı → REJECTED.** `.gitignore`'da, repo-ifşa vektörü değil.
- **Çeşitli P17 kozmetik tutarsızlıkları → LOW'a indirildi** (A24'te toplandı), ayrı bulgu sayılmadı.

---

## 20-MADDE KARNE

| # | Madde | Verdict | Baş kanıt |
|---|---|---|---|
| 1 | Injection & Untrusted Input | **FAIL** | A5, A13 (SQL temiz — kısmi olumlu) |
| 2 | Auth & Session | **FAIL** | A3 (middleware fail-open), A12 |
| 3 | AuthZ & IDOR | **PARTIAL** | RLS güçlü (+), ama A20/A5; tek-tenant örter |
| 4 | Secrets & Sensitive Data | **FAIL** | A2 (superuser şifre git'te), A25, A23 |
| 5 | Error Handling & Failure Paths | **FAIL** | swallow-all saga, A16, 200-to-İyzico |
| 6 | Concurrency & Races | **PARTIAL** | stok RPC idempotent (+), ama A14/A15 |
| 7 | Resource Lifecycle & Leaks | **PASS** | 3D/tarayıcı disiplinli dispose+cleanup |
| 8 | Data Access & N+1 | **PARTIAL** | admin server-paginated (+), ama cart fan-out/full-scan |
| 9 | Algorithmic Complexity | **PASS** | ölçekte O(n²) yok, NIT only |
| 10 | Memory & Unbounded Growth | **PASS** | modül-cache yok, sınırlı |
| 11 | External Calls, Timeouts | **FAIL** | A8 (sıfır timeout/retry) |
| 12 | Idempotency & Retry Safety | **FAIL** | A14 + çoğu op UNSAFE (stok PROTECTED +) |
| 13 | Transaction & Consistency | **FAIL** | A16, tek plpgsql tx birimi, outbox yok |
| 14 | Config & Env Hardening | **FAIL** | A3/A10/A11 fail-open, A22 CSP |
| 15 | Dependency & Supply Chain | **FAIL** | A4 (iyzipay), A19; (postinstall blok + |
| 16 | Logging & Observability | **FAIL** | A17, A18 audit açığı |
| 17 | API Contract Consistency | **PARTIAL** | A24 (7+ şekil) |
| 18 | Cross-Module Contracts | **FAIL** | A9/A6/A12 bozulma-kaynaklı mismatch |
| 19 | Test Gap & Assertion Quality | **PARTIAL** | conformance mükemmel (+), ama money/webhook/RLS/edge testsiz |
| 20 | Verification pass | uygulandı (bu belge) | — |

**Özet: 3 PASS · 4 PARTIAL · 12 FAIL · 1 = doğrulama pası.** Başarısızlıkların ~%70'i tek kök neden
(edge bozulması + kapı-körlüğü) veya onun ürettiği cross-boundary mismatch'ler. Ön-yüz/altyapı katmanı
(3D, bellek, RLS, conformance, i18n) gerçekten sağlam.

---

## REGISTRY İŞ-EMRİ EŞLEMESİ

- **I → CRITICAL onarım paketi (lansman-engeli):** A1 edge bozulması geri-alma/onarım + `deno check` CI kapısı
  (kalıcı katman — kapı-körlüğünü kapatır) + A6 durum-sözcük birleştirme + A9 payload envelope.
- **J → Güvenlik sertleştirme:** A2 şifre rotasyonu+history (Recep-tarafı), A3 cookie-secret fail-fast,
  A11 webhook HMAC+replay, A10 CORS allowlist, A5 tenant imza-doğrulama, A12 rol-adı birleştirme.
- **K → Dayanıklılık/idempotency:** A8 timeout'lar, A14 idempotency anahtarları, A7 replay guard, A16 refund tx,
  A15 stok atomik RPC.
- **L → Gözlemlenebilirlik/audit:** A17 Sentry+correlation+log-seviye, A18 ürün/kategori audit kapısı.
- **M → Test açığı:** money/webhook/monotonic/RLS/edge davranış testleri (Madde 19; edge için deno test harness).
- **N → Bağımlılık hijyeni:** A4 iyzipay pin+lock, A19 supabase pin + edge sürüm birleştirme + deno.lock temizliği.
- **Recep-tarafı (kod değil):** A2 şifre rotasyonu, A25 .env.example düzeltmesi, dashboard NEEDS-CONTEXT
  (cookie-secret/webhook-secret/hook etkin mi) doğrulaması.

> **Kritik kalıcı ders:** Bu denetimin bulabildiği en büyük şeyi mevcut (iyi) conformance takımı GÖREMEDİ —
> çünkü kapılar Next.js sınırında duruyor, edge functions dışarıda. Onarımın ÖZÜ per-bug yama değil,
> **`supabase/functions`'ı bir derleme kapısı altına almak** (`deno check` CI'da) + `supabase:gen` yenilemek.
