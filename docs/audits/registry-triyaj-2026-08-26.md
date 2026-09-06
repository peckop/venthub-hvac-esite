# Registry Açık Kayıtlar — DEĞERLENDİRİLMİŞ Liste (2026-08-26)

120 açık kaydın her biri için repo/git/doküman kanıtı arandı (4 paralel ajan + OPS düzeltmeleri). Toplam: **120**

| Hüküm | Adet | Önerilen işlem |
|---|---|---|
| ✅ YAPILMIŞ | 54 | Kanıt referansıyla kapat |
| 🔧 YAPILMALI | 40 | Linear'a taşı (tema gruplu) |
| 🗑 GEREKSİZ | 7 | Kapat (çöp/mükerrer) |
| ❓ BELİRSİZ | 19 | Derin ölçüm bende; itirazın olan satırı işaretle |

## ⚠ Düzeltme günlüğü

- **08-26 akşamı — çıkarım sınıfı bulundu (ÜRÜN şeridi ölçtü, Recep işaret etti):** "pilot X'i
  kanıtladı → gerisi eksik" cümlesi ölçüm değil ÇIKARIMDIR; pilot kapsamı bir ilerleme ölçüsü
  değildir. Bu belgede bu desenle yazılmış satırlar asıl kaynağa (canlı DB / canlı yüzey) karşı
  yeniden ölçülmeden güvenilmez. Düzeltilen: T003-VH, T069-VH (görsel kapsamı 374→35 ürün).
  Şüpheli desen taşıyan satırlar (örn. T036-VH %25 ilerleme, T002-VH "tarama yok") kendi
  şeritlerince ölçülecek; düzeltmeler bu günlüğe eklenir.
- **08-26 akşamı — tarama sonuçları:** T002-VH DOĞRU çıktı (görsel regresyon kapısı gerçekten yok).
  T036-VH ŞİŞİKTİ (yüzde alanı inşa ilerlemesi sanılmış; kapsam %100, kalan iş kalite — satır
  düzeltildi). T104-VH hükmü YANLIŞTI (kanıt yalnız PR atfıydı; istemci ayağı hiç inmemiş — satır
  düzeltildi, ardıl REC-80). İki yeni ders: **birimsiz yüzde yanıltır** (sayının yanına "neyin
  yüzdesi" yazılır) ve **iş bitti ≠ iş erişilebilir** (kanıt davranıştan, atıftan değil).

## 🔧 YAPILMALI — hâlâ değerli, Linear'a taşınacak (40)

| # | Kimlik | Başlık | Gerekçe/Kanıt |
|---|---|---|---|
| 1 | T001-OC | server.py hardcoded yollar (satır 15-16) | server.py:9 hâlâ Path("C:/Users/alize/orion-cortex/logs") hardcoded; DB path kısmen fixlenmiş |
| 2 | T002-VH | INV-9 stil-conformance + screenshot taraması | Statik ratchet var (storefront-style-ratchet.test.ts, INV-9) ama e2e/screenshot görsel tarama parçası hâlâ yok |
| 3 | T003-VH | Görsel temini (187 ürün görseli) | ⚠ DÜZELTİLDİ 08-26 akşamı: kapsam iddiası BAYATTI. Canlı DB ölçümü (ÜRÜN şeridi, Recep işaret etti): 374 aktif ürünün 339'u görselli (%91, 1042 görsel); eksik **35 ürün / 6 küme**. Eski "187'nin büyük kısmı eksik" cümlesi ölçülmeden pilot sayısından çıkarımdı. |
| 4 | T004-OC | Veritabanı İndeks Optimizasyonu | Kaynakta hiç CREATE INDEX yok; status "active" ama uygulanmış kanıt yok |
| 5 | T005-OR | F3: Otonomi Gradyanı, Çapraz Tozlaşma, Öğrenen Dispatcher | task_engine.py'de dispatcher/model-tahsis mantığı var (kısmi); progress 60 aktif, tam kapsam yok. |
| 6 | T005-VH | PageKit göçü (storefront) | src'de PageKit dosyası hiç yok; storefront göçü henüz başlamamış, backlog geçerli. |
| 7 | T011-OR | Strategic Intelligence-Triage/Brifing | Proaktif triyaj/brifing, kullanıcının zaten elle yaptığı günlük OPS SSOT/yoklama ritüeline somut katkı; uygulanmamış. |
| 8 | T012-VH | Güvenlik sertleştirme (auth/webhook/tenant/rol) | CHANGELOG'da RBAC+audit+HMAC webhook kanıtı var ama %45 aktif, tamamlanmamış. |
| 9 | T018-OR | Orion yazım raporu sayaç kırılımı hedefle tutmuyor | 08-25 tarihli, ölçümle desteklenmiş güncel aktif görev; kabul ölçütü net, sayaç doğruluğu değerli |
| 10 | T019-OR | Orion depo geneli zaman aşımsız dış çağrı taraması | Bugün açılan güncel iş; orion'da 145 subprocess.run çağrısından çoğu genel sarmalayıcısız, konformans testi yok |
| 11 | T036-VH | 3D görsel kalite fazı (ışık rig, framing, normalizasyon) | ⚠ DÜZELTİLDİ 08-26 akşamı (ÜRÜN ölçtü): "progress=25" İNŞA yüzdesi DEĞİL. 3D ürün başına GLB değil, kategori `model_type` ile parametrik model; canlı ölçüm: 25/31 kategori atanmış, 3D açılan aktif ürün 374/374 = **%100 kapsam**. Kalan iş KALİTE/cila (ışık rig, framing). Kalem "3D kapsama" değil "3D sunum kalitesi" olarak okunmalı. |
| 12 | T038-VH | registry-sync GitHub merge'lerinde çalışmıyor | .github/workflows/ listesinde registry-sync Action yok; post-merge kancası hâlâ yalnız yerel |
| 13 | T039-VH | Supabase leaked password protection kapalı | Dashboard-only ayar, repodan doğrulanamaz; güvenlik değeri yüksek, Recep'e atanmış basit iş |
| 14 | T045-VH | Ödeme doğrulama fail-closed — 2 açık ayak | order-validate için sentetik yoklama/health cron .github/workflows'ta yok; docs/standards'ta karar hâlâ yazılı değil |
| 15 | T049-VH | Admin UX elden geçirme Faz 0-5+N1-N4 | PR #525/526/541/543/544 merge doğrulandı (Faz 0-2b bitti); Faz 3-6 (görsel kalibrasyon, kapılar, N1-N4) hâlâ açık |
| 16 | T054-VH | Kargo ücreti: sabit "Ücretsiz" yerine gerçek politika | cart.free hâlâ hardcoded (CartPage.tsx, OrderSummarySidebar.tsx); shipping_cost repoda yok. |
| 17 | T069-VH | Ürün görseli edinme hattı | ⚠ DÜZELTİLDİ 08-26 akşamı: "374 ürünlük tam kapsama eksik" iddiası YANLIŞTI — pilot betiği 5 üründe kalmış olsa da görseller başka yollarla büyük oranda tamamlanmış. Canlı ölçüm: eksik 35 ürün / 6 küme (bkz. T003-VH satırı). Kalan iş T003 ile birleşik yürür. |
| 18 | T071-VH | 20-madde v2 güvenlik denetimi (40 ajan) | Rapor PR #586 merge oldu ama M1-M6 CONFIRMED-MED düzeltmeleri ayrı iş; progress hâlâ %20 |
| 19 | T073-VH | İKİ-LEDGER tehlikesi — migration ledger | supabase-migrate.yml ledger-parite mantığı doğrulandı (parça 1+2 merge); backfill (parça 3) hâlâ Recep kapısında |
| 20 | T074-VH | Ana-dizin kaza önlemi yapısal katman | pre-commit incelendi: yalnız lane-guard (E1) var, ana-dizin/master park uyarısı yok |
| 21 | T088-VH | Companion borcu — commit açığı temizliği | companion-doc-standard.md var ama fiili temizlik çalıştırılmamış (log sadece sayım); havuz işi olarak değerli |
| 22 | T089-VH | Pano claim glob-doğrulaması | board.cjs:628-631 claim fonksiyonu glob'u git ls-files'a karşı doğrulamıyor, gürültülü uyarı yok |
| 23 | T093-VH | Checkout adres formu il/ilçe SSOT | Repoda 81-il/ilçe veri kümesi/bağımlı-liste bileşeni bulunamadı; dört yüzey hâlâ serbest metin. |
| 24 | T097-VH | Araç-zinciri sürüm sapması süpürmesi | ruff hâlâ 0.15.11 (güncel 0.16.3 değil), pnpm hâlâ 10.15.0 (güncel 11.x değil) |
| 25 | T105-VH | Teklif→Sipariş dönüşüm köprüsü | quote-standard.md v2 hâlâ "TASARIM — Recep onayına bağlı"; köprü koda geçmemiş. |
| 26 | T106-VH | Bayi segment-atama ekranı yok | grep'te dealer/bayi segment atama UI'ı bulunamadı; dealer fiyat altyapısı hâlâ kullanılamaz durumda |
| 27 | T107-VH | Fatura karar paketi (mükellefiyet eşiği) | Hiçbir karar dokümanı bulunamadı; CRITICAL/hukuki konu hâlâ Recep kararını bekliyor |
| 28 | T112-VH | Master merge dağıtımsız kalabiliyor — gözcü yok | deploy-functions.yml yalnız edge fonksiyon deploy'u kapsıyor; master→production READY parite kapısı bulunamadı |
| 29 | T115-VH | SessionStart zincir-kontrolü kancası (bayat-atış raporu) | session-board.cjs hook'u var ama bayat-atış/eşik(K4) mantığı içermiyor (grep boş). |
| 30 | T116-VH | payment_transactions hiç yazılmıyor | Tüm edge fonksiyonlarda grep sıfır isabet; ödeme defteri hâlâ boş katman, mutabakat/fatura buna muhtaç |
| 31 | T120-VH | ERP-Satınalma gap analizi | Recep onaylı ölçüm görevi; docs/standards/purchasing-standard.md var ama VAR/KISMEN/YOK çıktısına dair kanıt yok |
| 32 | T127-VH | CRM gerçekleşme karnesi + modül tasarımı | Repoda CRM modülüne dair dosya yok; kayıt kendisi de "CRM modulu YOK" diyor. |
| 33 | T128-VH | ERP-Satınalma gerçekleşme karnesi | purchasing-standard.md cetveli var ama karne çıktısı (VAR/KISMEN/YOK + kanıt) üretilmemiş |
| 34 | T137-VH | Admin ürün listesi: görselsiz filtre + alt sayfalama | DataTableKit.tsx'te (359 satır) hâlâ tek üst sayfalama bloğu var, alt blok eklenmemiş. |
| 35 | T138-VH | SEAT aile ayrışması — mega-aile → model bazlı | Migrations dizininde veri-taşıma düzeltmesine rastlanmadı; SEO/taksonomi doğruluğuna somut katkı |
| 36 | T139-VH | VariantSelector kademeli eksen seçici | VariantSelector.tsx'te eksen/kademeli mantık yok; bağımlı T138 de yalnız analiz aşamasında |
| 37 | T141-VH | Landing-first ürün sayfa mimarisi | SeriesLandingView.tsx örnek desen olarak var ama genelleştirme/tasarım progress=0, yapılmamış. |
| 38 | T142-VH | Marka detay sayfası detaylandırma | BrandDetailPage.tsx hâlâ yalın FamilyCard grid kullanıyor; kategori-gruplu kart/marka hikayesi yok |
| 39 | T143-VH | HVAC Hesaplama Cetveli (formül/kaynak standardı) | docs/standards/hvac-calculation-standard.md bulunamadı; doğruluk/güvenlik kritik, hâlâ açık |
| 40 | T147-VH | EN sayfa lang=tr + name_i18n bağlı değil | src/app/layout.tsx:39 hâlâ sabit lang="tr" (doğrulandı); i18n kalitesi/SEO'ya doğrudan etki |

## ❓ BELİRSİZ — kanıt bulunamadı, derin ölçüm gerek (19)

| # | Kimlik | Başlık | Gerekçe/Kanıt |
|---|---|---|---|
| 1 | T001-CO | cc_search'e exclude_source_type parametresi (negatif filtre) | corpus-callosum kodunda/git log'da exclude_source_type için kanıt bulunamadı. |
| 2 | T002-OC | RAG semantik arama timeout | cf80508 RAG'ı tamamen kaldırmış (timeout için), ama 12303ff "full hybrid RAG %100 hit" iddia ediyor; kod hangisinin canlı olduğunu netleştirmiyor. |
| 3 | T004-VH | Aile kartı + PDP (Avens dalgası) | Genel aile-sistemi (F5-B, SeriesLandingView) var, ama Avens-özel dalga çalışmasına dair commit/kanıt bulunamadı. |
| 4 | T005-OC | Veritabanı indeks optimizasyonu | Eşleşen commit/kanıt bulunamadı; "active" durumu doğrulanamadı. |
| 5 | T006-OR | F4 Otonom Fabrika — OpenClaw/Telegram/Executor | orion-registry'de OpenClaw/Telegram/Executor CLI koduna rastlanmadı (yalnız .venv kütüphanesi); %40 iddiası doğrulanamadı |
| 6 | T006-VH | Companion süpürmesi (~270 bayat .md) | companion-supurme.log yalnız SAYIM MODU'nda ("hiçbir şey üretilmedi"); güncel bayat sayısı doğrulanamadı |
| 7 | T007-OR | DTO Architecture Transition: Type-Safe Partial Selects | orion reposunda DTO/PartialSelect deseni bulunamadı; açıklama da yok, kanıt yetersiz. |
| 8 | T008-VH | Küçük fix paketi (EK1/EK5/EK6/EK7) | Açıklama yok, yalnız dolaylı referanslar (DURUM-TAKIP, f5b planı) bulundu, kapsam belirsiz |
| 9 | T009-OR | Audit Feature-flagged/Unused Files | Tarihsiz eski backlog kaydı; orion repo git log'unda ilgili denetime dair kanıt bulunamadı |
| 10 | T010-OR (çakışan-2) | Dependency CVE Remediation & Build Compatibility | git log'da eşleşen commit bulunamadı, açıklama yok, kanıt yetersiz |
| 11 | T011-OR (çakışan-2) | Create Async Wrapper Skill for Sync Pipeline | orion-registry'de async wrapper/AsyncWrapper için kod bulunamadı. |
| 12 | T013-OR | F1: DNA-ID Üretici/Sıcaklık/Bayatlık normalize | "dna_id" yalnız .agents/ deney klasörlerinde alakasız isabet; gerçek entegrasyon kanıtı yok |
| 13 | T014-OR | F2: Bağımlılık Zinciri/Skorlama/Stratejik Brifing | Bulunan "F2" commitleri (Linear/Registry adaptör) farklı kapsam (köprü), eşleşme net değil |
| 14 | T015-OR | F3 Otonomi Gradyanı/Dispatcher/UI | Çok geniş, çok-parçalı epik başlık; kanıt/commit bulunamadı, tek hükme sığmıyor. |
| 15 | T017-OR | E2E i18n and Strict Type Refactoring (P02) | Kayıt bozuk (title/id yer değiştirmiş), orion-registry'de eşleşen kanıt yok |
| 16 | T018-OR (çakışan-2) | Webhook/Rate-Limit refactoring | Kayıt alanları karışık görünüyor (başlık="P02"); orion-registry'de eşleşen webhook/rate-limit kodu yok. |
| 17 | T019-OR (çakışan-2) | "P02" (id: Checkout state orchestrator refactoring) | Başlık/id tutarsız (P02 vs checkout orchestrator); orion-registry'de ilgili kod bulunamadı. |
| 18 | T103-VH | Admin ölü-kod süpürmesi (audit t102-*) | docs/audits/t102-* bulunamadı (t101,t104 var, boşluk var), tamamlanma durumu ölçülemedi |
| 19 | T119-VH | Katalog içe aktarımı eksik (136+ kod) + aile düzeltmesi | PDF-ingestor/prod veri karşılaştırması yapılmadı; hızlı ölçüm için yetersiz derinlik. |

## ✅ YAPILMIŞ — kanıtı var, kapatılacak (54)

| # | Kimlik | Başlık | Gerekçe/Kanıt |
|---|---|---|---|
| 1 | T001-VH | Fiyat Motoru (çok para birimi) | fxLockAdmin.service.ts + testleri mevcut, pricing.service para-hareketi testleriyle destekli, progress %95 tutarlı |
| 2 | T007-VH | Eksen-bazlı tam denetim | docs/audits/vibe-coding-20-madde-{denetimi-08-13,v2-08-16}.md üretilmiş + venthub-20-eksen-denetimi skill'i süreci kurumsallaştırmış. |
| 3 | T009-VH | Teklif/CPQ hattı (RFQ->Teklif) | src/lib/services/quoteService.ts createQuoteRequest/listMyQuotes/decideQuote ile akış tam çalışıyor. |
| 4 | T010-VH | Satınalma modülü (tedarikçi siparişi/mal kabul/iskonto) | Kod mevcut: PurchasingTableBody.tsx, purchasing.service, poStatusMachine, CreatePurchaseOrderPanel. |
| 5 | T012-OR | F0: Inbox Altyapısı — ideas tablosu, codebook, CLI | idea_engine.py: idea_codebook, ideas tablosu, inbox_dir, seed_codebook fonksiyonları mevcut. |
| 6 | T013-VH | Dayanıklılık & idempotency (ödeme hattı) | refund_guard.ts + iyzico-callback/refund/returns-webhook/shipping-webhook idempotent hale getirilmiş (T053-VH) |
| 7 | T014-VH | Frontend hata raporlama ÖLÜ (errorReporter no-op) | errorReporter.ts artık log-client-error'a POST atıyor; ErrorBoundary.tsx reportError çağırıyor (kod okundu) |
| 8 | T015-VH | Test açığı: money/webhook/monotonic/RLS/edge | payment-money-move, pricing-money-append-only, returns-webhook-transitions, webhook-auth-fail-closed, rls-coverage-ci-binding testleri mevcut |
| 9 | T017-OR (çakışan-2) | Registry short_id tahsisi çarpışmasız hale getirme | DÜZELTME (OPS): bugün orion #40 ile kapandı — tek tahsis edici + benzersizlik döngüsü, sabotajla kanıtlı |
| 10 | T020-OR | NLM küme master'ları | standards_master.md/kayitlar_master.md üretilmiş (commit a34d2321) + onarım koşumu (de0b4a52). |
| 11 | T021-OR | Companion yaşam döngüsü kalıcı çözümü (otomatik commit) | companion-doc-standard.md'ye "periyodik commit-sweep" bölümü eklenmiş; bugün git status temiz (2 dosya, 95 değil). |
| 12 | T021-VH | GA4 kurulumu + CSP | CSP script-src'de googletagmanager whitelist edilmiş + analytics.ts(gtag)+ConsentGatedAnalytics rıza-kapılı bileşeni mevcut. |
| 13 | T023-VH | Kanonik SITE_URL — conformance bekçisi eksikliği | src/config/siteUrl.ts SSOT + src/__tests__/conformance/canonical-url-ssot.test.ts (INV-CANONICAL-1) tam istenen bekçiyi uyguluyor |
| 14 | T031-VH | webhook secret rotasyonu | PR #584 (commit ba01937a) master'a merge, Vault taşıma+rotasyon penceresi canlı doğrulanmış. **DÜZELTME (OPS, 2026-09-06, REC-52):** bu satır yalnız KOD tarafını anlatır — rotasyon penceresi kodda çalışıyor (`route.ts` 234-237); **sır değeri DÖNMEDİ**, 5 elle adım Recep'te (commit mesajı ve `docs/plans/rec52-whsec-rotasyon-plani-2026-09-06.md` bunu söyler). "Yapılmış" = kod bitti, iş bitmedi; ALTYAPI ölçtü, terim karışıklığı. |
| 15 | T055-VH | Fatura belgesi üretilmiyor (VUK) | supabase/migrations/20260820090000_order_invoices.sql + src/lib/services/orderInvoice.service.ts (T132-VH) gerçekten yazılmış. |
| 16 | T058-VH | Kargo ops: takip no, delivered_at, idempotency | PR #554 (UI) + #563 (EDGE) merged; shipping-webhook'ta idempotent delivered_at guard mevcut. |
| 17 | T063-VH | KVKK anonimleştirme + veri sahibi talep defteri | Commit ca537d87 (#564) merge, migration+RLS+conformance testi canlı; kalan sadece placeholder e-posta (iş dışı) |
| 18 | T065-VH | Registry CLI: sessiz kesme + description düşmesi düzeltmesi | orion repo commit a1e16f1 "sessiz veri kaybini bitir ... (T065-VH) (#1)" merge edilmiş. |
| 19 | T070-VH | Render stratejisi denetimi (SSR/SSG/ISR envanteri) | PR #585 merged (commit a1905bde) + docs/audits/render-stratejisi-denetimi-2026-08-16.md mevcut. |
| 20 | T071B1 | iyzico-refund müşteri self-iadesi (IDOR) | index.ts:176 yorum: eski isAdmin/isOwner kaldırıldı, artık yalnız ayrıcalıklı rol geçiyor |
| 21 | T072-VH | NLM tam güncel sync | Görev metninde 08-17 tarihli "NİHAİ TEMİZLİK KARARI" + sonraki T020-OR küme-master commit'leri (a34d2321, de0b4a52) sürecin kurumsallaştığını gösteriyor. |
| 22 | T075-VH | orion rowcount-sınıfı denetimi | Kapsam 5→3 daraltılıp (OPS-AUDIT onaylı) 3 fonksiyon _yazma_hedefi_bulundu + 8 testle (sabotajla kanıtlı) kapatılmış. |
| 23 | T078-VH | PostgREST .or() sınıfı: kaçış yardımcısı | orIlikeContains escape yardımcısı adminQueryFilters.ts'de yazılmış, resourceSearchers.ts kullanıyor. |
| 24 | T095-VH | Yetim pending sipariş: süre-bazlı otomatik iptal | release-expired-reservations/index.ts pending+expired iptali + stok RPC (order_expire) zaten var. |
| 25 | T096-VH | Prod secret bayatlık sınıfı — pozitif öz-denetim | supabase/functions/_shared/config_audit.ts IYZICO_BASE_URL/site URL için tam istenen pozitif denetimi uyguluyor (T100-VH) |
| 26 | T099-VH | Sepete yanlış ürün düşüyor | fix(pdp): T099 yüzey (#670) + INV-CATALOG-1 aile/içerik bütünlüğü kapısı (#666) ile kapatılmış. |
| 27 | T100-VH | Prod secret bayatlık sınıfı — pozitif öz-denetim | config_audit.ts başlığında doğrudan "T100-VH · 2026-08-19" referansı; ok/eksik/tutarsız hüküm sistemi kurulu. |
| 28 | T101-VH | View yetki standardizasyonu (REVOKE ALL+GRANT) | docs/standards/db-grant-hygiene-standard.md + 20260819103000_view_grant_hygiene.sql deseni standartlaştırmış |
| 29 | T104-VH | LeadModal sahte-başarı | ⚠ HÜKÜM DÜZELTİLDİ 08-26 akşamı (EDGE davranışla ölçtü): "yapılmış" hükmü YALNIZ PR/merge atfına dayanıyordu. Gerçek: RPC + yetkiler prod'da VAR ama İSTEMCİ HİÇ BAĞLANMAMIŞ — ContactPage.tsx başarı ekranı gösterip hiçbir şey yazmıyor; contact_messages toplam 0 satır. Sınıf: **iş bitti ≠ iş erişilebilir**. KVKK ağırlığı var (girilen kişisel veri kaydedilmiyor, kullanıcı "gönderildi" görüyor). Ardıl: Linear REC-80. |
| 30 | T109-VH | commerce-domain-map cetveli | docs/standards/commerce-domain-map-standard.md repoda mevcut. |
| 31 | T110-VH | commerce-domain-map cetveli | docs/standards/commerce-domain-map-standard.md var, quote-standard.md v2 §5'te referans alınıyor. |
| 32 | T113-VH | Peer-dependency ayrışmaları (react-day-picker/eslint) | peer-dependency-integrity.test.ts: MUAFİYETLER listesi boş, her iki ihlal de v9/hizalama ile çözülmüş yazılı |
| 33 | T114-VH | sync_payment_status ölü dallar | supabase/migrations/20260819160000_payment_status_trigger_fix.sql yazılmış ve master'a merge edilmiş. |
| 34 | T117-VH | Session-loop-ritual cetveli güncellemesi | docs/standards/session-loop-ritual.md mevcut, R1-R6 muadili kurallar (park kontrolü, Recep-girdi sırası) içerikte |
| 35 | T118-VH | Bildirim modülü ölçüm+tasarım | docs(bildirim): cetveli v1.0 + INV-NOTIFY-1/2 kapıları + T137 ödeme-onayı bildirimi bağlanmış (#716, #802, #711). |
| 36 | T123-VH | Teklif Modülü Master Tasarımı (ERP-stil) v1 | docs/standards/quote-standard.md v2 tasarım belgesi yazılmış, içerik başlıkla birebir eşleşiyor. |
| 37 | T124-VH | Fatura v1 — faturalandı işareti + kayıt defteri | src/views/admin/AdminInvoicesPage.tsx + order_invoices migration mevcut, uygulanmış |
| 38 | T125-VH | ERP-Satınalma gerçekleşme karnesi | docs/audits/t128-erp-satinalma-karne-2026-08-20.md mevcut, tarih ve içerik eşleşiyor |
| 39 | T126-VH | ERP-Stok gerçekleşme karnesi | docs/audits/t129-erp-stok-gerceklesme-karnesi-2026-08-20.md üretilmiş. |
| 40 | T129-VH | ERP-Stok gerçekleşme karnesi | docs/audits/t129-erp-stok-gerceklesme-karnesi-2026-08-20.md mevcut |
| 41 | T130-VH | CRM gerçekleşme karnesi+tasarım | docs(crm): CRM cetveli v0 (#707) üretilmiş. |
| 42 | T131-VH | Teklif Modülü Master Tasarımı (ERP-stil) v2 (mükerrer) | T123-VH ile aynı iş — quote-standard.md v2 tasarımı zaten yazılmış (mükerrer kayıt). |
| 43 | T132-VH | Fatura v1 (LEGAL sahipli, T124 ile aynı iş) | order_invoices migration doğrudan "T132-VH" etiketli; T124 ile duplicate, ikisi de karşılanmış |
| 44 | T133-VH | ERP Çalışma Alanı Tasarım Standardı v0 | docs/standards/erp-workspace-design-standard.md mevcut (345 satır) |
| 45 | T136-VH | Admin ürün formu technical_specs | ProductFormModal.tsx artık technical_specs: z.record(...) alanını şemada ve JSX'te işliyor. |
| 46 | T140-VH | İçerik kalite denetimi (spec) | feat(urun): technical_specs BİRİM SÖZLEŞMESİ (#742) + "T140 taban satırları tamamlandı" commit'i. |
| 47 | T144-VH | Yürütme Yöntemi Cetveli | docs/standards/execution-method-standard.md repoda mevcut. |
| 48 | T145-VH | Kanal-motoru sabit sürtünme faktörü düzeltmesi (Colebrook) | hvacCalculations.ts/ductPressure.ts Colebrook-White'a geçmiş; eski f=0,02'ye dönüşü kilitleyen test var. |
| 49 | T148-VH | localeCompare dil parametresiz sıralama | INV-9 conformance testi + ratchet: 9→6 çağrıya düşürülmüş, kalanlar bilinçli teknik-sıralama muafiyeti |
| 50 | T149-VH | Hardcoded admin email fallback | config/admin.ts içinde FALLBACK_ADMIN_EMAILS T047 (08-18) ile kaldırılmış, tek otorite user_profiles.role. |
| 51 | T156-VH | T163E-VH EDGE drift kapısı (#804) | PR #804 merged (commit 2d7627b9): "PR prod'u MASTER'a karşı ölçmeden geçmez (T163-VH)". |
| 52 | T158-VH | Lineo bayat taban temizliği (#803) | Commit a64f6b8f "#803" ile merge edilmiş (taban 36→34 satır) |
| 53 | T159-VH | Bash yazma kapısı 3 katman + gözcü v3 | PR #799 (981bcda8) ve #800 (f4195844) merge edilmiş bulundu |
| 54 | T162-VH | T116A currency DEFAULT+yazıcı | PR #805 merge + f8ed334c migration ile ADIM-1 genişletilmiş, INV-LEDGER-1 bağlanmış. |

## 🗑 GEREKSİZ — çöp/mükerrer, kapatılacak (7)

| # | Kimlik | Başlık | Gerekçe/Kanıt |
|---|---|---|---|
| 1 | T001-OR | Test MCP Flow | Başlık "Test MCP Flow" — açık deneme/kanıtlama kaydı, ürün değeri yok |
| 2 | T003-OC | Test Task | Başlığın kendisi "Test Task" — placeholder/deneme kaydı |
| 3 | T004-OR | Aktif Kantar Test Simulator | "Kantar" (tartı) orion'un bilinen doküman/görev-CLI kapsamıyla örtüşmüyor; kod/commit kanıtı yok, muhtemelen yanlış kayıt. |
| 4 | T010-OR | AST Tree-Sitter Plugin Registry & Call Graph | CodeGraph MCP aracı call-graph işlevini farklı mimariyle zaten sağlıyor; orion-registry'de tree-sitter izi yok |
| 5 | T016-OR | P02 (id: XSS and Performance Optimization) | Kayıt bozuk görünüyor: title anlamsız "P02", id alanı etiket gibi; işlenebilir tanım yok |
| 6 | T121-VH | ERP-Stok gap analizi (genel cetvele karşı) | Aynı gün 12dk sonra açılan T129 ile supersede edilmiş (daha spesifik cetvel referanslı), kanıt T129 adına |
| 7 | T122-VH | CRM gap analizi + modül tasarımı | T130 ile neredeyse birebir aynı kapsam/sahip (12 dk arayla açılmış); iş fiilen T130 altında yürütülmüş. |

