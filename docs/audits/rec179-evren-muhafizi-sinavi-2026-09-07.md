# REC-179 · Evren muhafızı sabotaj sınavı — 53 kapı (2026-09-07)

**Kayıt:** REC-179 · **Şerit:** OPS · **Ölçüm:** 2026-09-07 08:0x–08:5xZ, ağaç `origin/master a248e0689`
(`C:/tmp/ops-rec179`) · **Yöntem:** 6 sonnet sabotaj ajanı (kapı başına geçici kopya, yürüme kökü
geçerli-ama-yanlış dizine çevrilir; değdi kanıtı = evren sayısı ölçümü; kopyalar koşum sonrası
silinir, ağaç temiz) + 1 opus çürütme (sonnet'in FAIL-OPEN/zayıf dediği 19 kalemi kapının okuduğu
kökte yeniden kurup tek koşumda doğrular) · **Aday listesi kaynağı:**
`docs/audits/rec162-evren-muhafizi-adaylari-2026-09-06.md` (ALTYAPI, 2026-09-06, master `2ac01f8ae`)
— 53 kapı, vekil ölçüt (`ağaç yürüyor + muhafız görünmüyor`); bu sınav o adayları tek tek sabote
ederek KANITA çevirir, listeyi tekrar üretmez.

---

## 1. Recep tek sayfası

- **53 kapı → FAIL-OPEN DOĞRULANDI 15 · PAKET KORUYOR 3 · ÇÜRÜDÜ 1 · KORUNUYOR 33 · YÜRÜMÜYOR 1.**
- Sahip dağılımı (aday, çoğu ölçülmedi — bkz. §6): **URUN 29** (3D, i18n, kategori, pricing-lib,
  auth-yüzey, rendering) · **ALTYAPI 14** (config, migration, webhook, fx/ledger, CI) ·
  **sahipsiz 10** (7 admin-* kapı + 3 legal/kvkk-* kapı) — bu 10'un devri OPS kararı bekliyor.
- **En ağır 3 bulgu:**
  1. **`stock-restore-evidence`** — kapının ÇALIŞMA KÜMESİ bugün zaten **0** (`stockWriters=0`,
     bağımsız 695-dosyalık prob ile doğrulandı); sabotaj hiçbir şeyi daraltmadı, kapı sabotajsız
     hâlde de vakumda yeşil. Stok-restore invaryantı şu an FİİLEN denetlenmiyor.
  2. **`3d-asset-validity`** — `PUBLIC_3D` evreni bugün **0** (repoda hiç `.hdr/.glb` yok); testin
     ilk parçası zaten hiçbir şey ölçmüyor, sabotajdan bağımsız.
  3. **Boş evrende yeşil kalan iki kapı:** `legal-en-leftover` ve `i18n-key-resolution`
     (951→0 dosya) — evren SIFIRLANINCA bile kırmızı vermediler; bu, "geçerli-ama-daraltılmış kök"
     sınıfından daha ağır bir sınıf (boş küme = en kolay yakalanması gereken durum).
- **Opus'un çürütme olmadan kaçıracağı şey (kendi cümleleriyle):** *"Sonnet bunu (localized-route-ssot,
  pricing-cache-invariants, pricing-storefront-source) 'tesadüfi yan etki' sayıp FAIL-OPEN yazdı;
  kapı paket düzeyinde kırmızı"* — 3 kapı gereksiz yere "delik" sayılacaktı. Tersinden:
  *"config-fail-closed'da beyan edilen sabotaj hiç kurulmamış ya da yanlış kurulmuş görünüyor —
  KOK sabiti gerçekten değiştirildiğinde paket ENOENT ile kırmızı veriyor"* — 1 kapı gereksiz yere
  "delik" sayılıp yanlış iş emri doğuracaktı.
- **Düzeltme reçetesi (tek cümle):** Eşik `> 0` değil, **ölçülen bugünkü değerin bir kademe altı**
  olmalı (`toBeGreaterThan(900)` gibi, `toBeGreaterThan(0)` değil) — ve **boş evren de kırmızı
  vermeli**, çünkü `import.meta.glob(kök).length === 0` durumunu "ihlal yok" ile ayırt eden hiçbir
  kapı bugün yok.

---

## 2. Tam tablo (53 satır)

| Kapı | Yürüme kökü (orijinal→sabotaj) | Evren (orijinal→sabotaj) | Normal | Sabotaj | Sonnet hükmü | Opus hükmü | Önerilen muhafız | Sahip |
|---|---|---|---|---|---|---|---|---|
| 3d-asset-validity | `/src/**/*.{ts,tsx}` → `/supabase/functions/**/*.ts` | 952→44 | 2 passed | 2 passed | FAIL-OPEN | FAIL-OPEN DOĞRULANDI (+ağırlaştırıcı: `PUBLIC_3D`=0 bugün) | `Object.keys(SOURCES).length>900` + `PUBLIC_3D∪ASSET_REGISTRY` boşken açık skip | URUN (3D) |
| 3d-csp | `/src/**/*.{ts,tsx}` → `/supabase/functions/**/*.ts` | 952→44 | 4 passed | 3 passed | FAIL-OPEN | FAIL-OPEN DOĞRULANDI | `Object.keys(SOURCES).length>900` + `SOURCES[REGISTRY_KEY]` tanımlı olmalı (`?? ''` kaldır) | URUN (3D) |
| 3d-model-recipe | `/src/components/products/3d/**/*.tsx` → `/src/components/admin/**/*.tsx` | 40→63 | 3 passed | 2 passed | FAIL-OPEN | FAIL-OPEN DOĞRULANDI | `FILES.length>30` + bilinen model dosyası pozitif kanaryası | URUN (3D) |
| 3d-procedural-env | `/src/**/*.{ts,tsx}` → `/supabase/functions/**/*.ts` | 952→44 | 1 passed | 1 passed | FAIL-OPEN | FAIL-OPEN DOĞRULANDI | `Object.keys(SOURCES).length>900` + dedektör-sağlığı kanaryası | URUN (3D) |
| 3d-single-canvas | `/src/**/*.{ts,tsx}` → `/supabase/functions/**/*.ts` | 951→44 | 2 passed | 1 passed | FAIL-OPEN | FAIL-OPEN DOĞRULANDI | `Object.keys(SOURCES).length>900` + `SOURCES['/'+CANONICAL]` tanımlı olmalı | URUN (3D) |
| admin-daypicker-classnames | `/src/components/admin/*.tsx` → `/src/components/ui/*.tsx` | ölçülmedi (tekil dosya) | 3 passed | 1 passed/2 failed | KORUNUYOR | — | (mevcut `.not.toBeNull()` yeterli) | ADMIN (sahipsiz, aday) |
| admin-export-hygiene | `/src/**/*.{ts,tsx}` → `/supabase/functions/**/*.ts` | ALL ölçüldü (sabotajda 41) | 9 passed | 2 passed/2 failed | KORUNUYOR | — | (mevcut `>200`/`>5` yeterli) | ADMIN (sahipsiz, aday) |
| admin-fx-lock-crud | `/src/**/*.{ts,tsx}` → `/supabase/functions/**/*.ts` | 942→44 | 5 passed | 1 failed | KORUNUYOR | — | (mevcut `>500` yeterli) | ADMIN (sahipsiz, aday) |
| admin-fx-lock-visibility | `/src/**/*.{ts,tsx}` → `/supabase/functions/**/*.ts` | 941→44 | 3 passed | 1 failed | KORUNUYOR | — | (mevcut `>1000` yeterli) | ADMIN (sahipsiz, aday) |
| admin-mutate-real-write | `/src/**/*.{ts,tsx}` → `/scripts/**/*.{ts,tsx}` | ~941→11 | 1/1 PASS | 1/1 PASS | FAIL-OPEN | FAIL-OPEN DOĞRULANDI | `mutateWithAuditDosya>20` + `toplamFnGovde>40` | ADMIN (sahipsiz) → **OPS devir önerisi: URUN** |
| admin-shell-invariants | `/src/**/*.{ts,tsx}` → `/scripts/**/*.{ts,tsx}` | ~941→11 | 26/26 PASS | 0/26 PASS | KORUNUYOR | — | (mevcut stale-guard `throw` yeterli) | ADMIN (sahipsiz, aday) |
| admin-status-filter-domain | `/src/views/admin/*.tsx` → `/src/views/account/*.tsx` | 12→12 | 5/5 PASS | 3/5 PASS | KORUNUYOR | — | (mevcut `.not.toBeNull()` yeterli) | ADMIN (sahipsiz, aday) |
| auth-account-surface | çoklu views/contexts/hooks/app/utils/components → `/scripts/**/*.{ts,tsx}` | ~9xx→11 | 7/7 PASS | 2/7 PASS | KORUNUYOR | — | (mevcut `source()` throw yeterli) | URUN (aday) |
| auth-reset-chain | çoklu views/contexts/app/utils + middleware.ts → `/scripts/**/*.{ts,tsx}` | ~9xx→11 | 6/6 PASS | 0/6 PASS | KORUNUYOR | — | (mevcut yeterli) | URUN (aday) |
| auth-session-security | çoklu contexts/utils/app → `/scripts/**/*.{ts,tsx}` | ~9xx→11 | 4/4 PASS | 1/4 PASS | KORUNUYOR | — | (mevcut yeterli) | URUN (aday) |
| canonical-lang-segment | `/src/**/*.{ts,tsx}` → `/supabase/**/*.{ts,tsx}` | ~941→44 | 6/6 PASS | 3/6 PASS | KORUNUYOR (zayıf sinyal + açık kilit) | — | mevcut `bulunan.length>2` kilidi paketi kurtarıyor; iki komşu test hâlâ eşiksiz | URUN (i18n) |
| category-metadata-i18n-ssot | `/src/**/*.{ts,tsx}` → `/supabase/**/*.{ts,tsx}` | ~941→44 | 1/1 PASS | 1/1 PASS | FAIL-OPEN | FAIL-OPEN DOĞRULANDI | `Object.keys(SOURCES).length>900` + `hero_description` alan-kanaryası `>3` | URUN |
| category-name-ssot | `/src/**/*.{ts,tsx}` → `/supabase/**/*.{ts,tsx}` | ~941→44 | 1/1 PASS | 1/1 PASS | FAIL-OPEN | FAIL-OPEN DOĞRULANDI | `Object.keys(SOURCES).length>900` + `SOURCES['/src/utils/categoryHelpers.ts']` tanımlı | URUN |
| config-fail-closed | `supabase/functions` → `src/types` | 41→9 | 6 passed | 6 passed (beyan) | FAIL-OPEN | **ÇÜRÜDÜ** — aynı sabotaj birebir kurulunca 1 failed (ENOENT, `HEALTHZ` `KOK`'tan türüyor); dar bir varyantta fail-open KALIYOR | `tsDosyalari(KOK).length>30` (mevcut KOK↔HEALTHZ bağı korunsun) | ALTYAPI |
| csp-origin-coverage | `/src/**/*.{ts,tsx}` → `/docs/**/*.{ts,tsx}` | N→0 | 8 passed | 2 failed/6 passed | KORUNUYOR | — | (mevcut `usages.length>2` yeterli) | ALTYAPI (aday) |
| githooks-integrity | `/.githooks/*` → `/docs/*` | (3 kanca+README)→0 | 8 passed | 4 failed/4 passed | KORUNUYOR | — | (mevcut isim-kanaryası yeterli) | ALTYAPI (aday) |
| home-hero-route-ssot | `/src/components/home/*.tsx` → `/src/components/admin/*.tsx` | 1→yok | 4 passed | 1 failed/3 passed | KORUNUYOR | — | (mevcut `toBeTruthy()` ön-koşulu yeterli) | URUN (aday) |
| i18n-attribute-literals | `/src/**/*.{ts,tsx}` → `/docs/**/*.{ts,tsx}` | 952→0 | 3 passed | 1 failed/2 passed | KORUNUYOR (paket; ana test tek başına zayıf) | — | ana teste kendi `Object.keys(SOURCES).length>900` kanaryası eklensin | URUN (i18n) |
| i18n-key-resolution | `/src/**/*.{ts,tsx}` → `/docs/**/*.{ts,tsx}` | 951→0 | 2 passed | 2 passed | FAIL-OPEN | FAIL-OPEN DOĞRULANDI | `taranan.dosya>450` + `seen.size (çözülen anahtar)>3000` | URUN (i18n) |
| i18n-locale-case | `KOK/src` → `KOK/docs` | >400→~az | 7 passed | 3 failed/4 passed | KORUNUYOR | — | (mevcut `taranan>400` + pozitif kontrol yeterli) | URUN (i18n) |
| i18n-locale-compare | `KOK/src` → `KOK/docs` | >400→0 | 8 passed | 3 failed/5 passed | KORUNUYOR | — | (mevcut kanarya yeterli) | URUN (i18n) |
| i18n-uppercase-proper-noun | `/src/**/*.tsx` → `/docs/**/*.tsx` | >300→0 | 7 passed | 4 failed/3 passed | KORUNUYOR | — | (mevcut `tarananDosya>300` + tespit kanaryası yeterli) | URUN (i18n) |
| invoice-ledger-contract | `supabase/migrations` → `docs/standards` | 234→0 | 10 passed | çoklu failed | KORUNUYOR | — | (mevcut `hepsi.length>100` yeterli) | ALTYAPI (aday) |
| jsonld-fiyat-sizintisi | `cwd()+/src` → `docs` | 656→0 | 5 passed | 1 failed/1 passed | KORUNUYOR | — | (mevcut `toplamCagri>0` — zayıf ama sabotajı yakaladı) | URUN (aday) |
| kart-yukleme-onceligi | `cwd()+/src` → `cwd()+/supabase` | N(>3 çağrı)→0 | 3 passed | 1 failed/2 passed | KORUNUYOR | — | (mevcut `tumCagrilar.length>3` yeterli) | URUN (aday) |
| kvkk-request-ledger | `/supabase/migrations/*_kvkk_*.sql` → `/docs/standards/*_kvkk_*.sql` | 1→0 | tam suit geçer | 1 failed/1 passed | KORUNUYOR | — | (mevcut `toBeTruthy()` yeterli) | ALTYAPI/legal karma (aday) |
| lang-metadata-locale | `app/[lang]` (rel.) → `docs` | 48→0 | 6 passed | 1 failed/1 passed | KORUNUYOR | — | (mevcut `sayfalar.length>20` yeterli) | URUN (aday) |
| legal-consent-analytics | `import.meta.glob('/src/**')` → `/docs/**` | N→0 | 5 passed | 1 failed/1 passed | KORUNUYOR | — | (mevcut 4 sabit-yol `toBeTruthy()` yeterli) | legal (sahipsiz, aday) |
| legal-consent-gate | `import.meta.glob('/src/**')` → `/docs/**` | N→0 | 5 passed | 1 failed/1 passed | KORUNUYOR | — | (mevcut sabit-yol `toBeTruthy()` yeterli) | legal (sahipsiz, aday) |
| legal-en-leftover | `import.meta.glob('/src/views/legal/components/en/**')` → `/docs/**/*.{ts,tsx}` | N→0 | 1 passed | 1 passed | FAIL-OPEN | FAIL-OPEN DOĞRULANDI (+ağırlaştırıcı: boş evren = daha ağır) | `Object.keys(SOURCES).length>4` + Türkçe-harf dedektör-sağlığı kanaryası | legal (sahipsiz) → **OPS devir önerisi** |
| localized-route-ssot | `import.meta.glob('/src/**')` → `/docs/**/*.{ts,tsx}` | N→0 | 4 passed | 1 passed (izole) | FAIL-OPEN (ana iddia) | **PAKET KORUYOR** — komşu "INFRA_ALLOWLIST bayat değil" testi paket düzeyinde kırmızı veriyor; ana iddianın kendisi hâlâ eşiksiz | ana teste kendi `taranan.renderKatmani>250` kanaryası (komşu testin yan etkisine bel bağlanmasın) | URUN |
| numeric-format-ssot | `/src/**/*.{ts,tsx}` → `/scripts/**/*.{ts,tsx}` | ~954→11 | 1 passed | 1 passed | FAIL-OPEN | FAIL-OPEN DOĞRULANDI | `Object.keys(SOURCES).length>900` + `RAW_INTL_FORMAT` pozitif kanaryası | URUN (i18n) |
| payment-integrity | `/src/**/*.{ts,tsx}` → `/scripts/**/*.{ts,tsx}` | ~954→11 | 6 passed | 6 failed | KORUNUYOR | — | (mevcut stale-guard yeterli) | ALTYAPI |
| payment-money-move | `/supabase/functions/**/*.ts` → `/scripts/**/*.ts` | 44→11 | 8 passed | 2 failed/6 passed | KORUNUYOR | — | (mevcut `moneyMovers` + stale-guard yeterli) | ALTYAPI |
| pricing-cache-invariants | `/src/**/*.{ts,tsx}` (SRC_SOURCES) → `/scripts/**/*.{ts,tsx}` | ~954→11 | 3 passed | 1 failed/2 passed | KORUNUYOR (dolaylı, zayıf) | **PAKET KORUYOR** — komşu "materialize elle-ezme" testi kırmızı veriyor; ana iddia (`offenders=[]`) tek başına eşiksiz | ana teste `Object.keys(SRC_SOURCES).length>900` eklensin | URUN (lib/pricing) |
| pricing-fx-lock-contract | `/src/lib/services/*.ts` → `/scripts/db/migrations/*.ts` | 12→11 | 9 passed | 2 failed/7 passed | KORUNUYOR | — | (mevcut stale-guard yeterli) | ALTYAPI (fx, aday) |
| pricing-fx-rate-single-resolver | `['/src/**/*.{ts,tsx}','/supabase/functions/**/*.ts']` → `['/scripts/**/*.{ts,tsx}','/scripts/**/*.ts']` | ~1000→11 | 5 passed | 3 failed/2 passed | KORUNUYOR | — | (mevcut `Object.keys(sources).toContain(RESOLVER_PATH)` yeterli) | ALTYAPI (fx, aday) |
| pricing-money-append-only | `/supabase/migrations/**/*.sql` → `/scripts/db/**/*.sql` | 234→13 | 4 passed | 4 passed | FAIL-OPEN (eşik `>0` ayırt etmiyor) | FAIL-OPEN DOĞRULANDI | `entries.length>200` + `currency_rates` dosya-adı kanaryası | ALTYAPI |
| pricing-segment-source | iki tam dosya yolu (joker yok) | uygulanamaz | 8 passed | — | YÜRÜMÜYOR | — | kök-yönlendirme kavramı bu kapıya uygulanamıyor; ayrı bir sınama yöntemi gerekir | ALTYAPI (fx/segment, aday) |
| pricing-storefront-source | `/src/**/*.{ts,tsx}` → `/scripts/**/*.{ts,tsx}` | ~954→11 | 2 passed | 1 failed/1 passed | KORUNUYOR (dolaylı, zayıf) | **PAKET KORUYOR** — komşu "product.columns.ts bulunamadı" testi kırmızı veriyor; ana iddia tek başına eşiksiz | ana teste `Object.keys(SRC_SOURCES).length>900` + `musteriYuzeyiTaranan>500` eklensin | URUN (lib/pricing) |
| quote-machine-ssot | `/src/**/*.{ts,tsx}` → `/supabase/**/*.{ts,tsx}` | 951→44 | 14 passed | 3 failed/11 passed | KORUNUYOR | — | (mevcut sabit-anahtar canary yeterli) | URUN (aday) |
| render-price-surface | `/src/**/*.{ts,tsx}` → `/supabase/**/*.{ts,tsx}` | 951→44 | 4 passed | 3 failed/1 passed | KORUNUYOR | — | (mevcut stale-guard + `callsiteCount>0` yeterli) | URUN |
| render-revalidation-contract | `/scripts/**/*.{...}` → `/docs/**/*.{...}` | 112→23 | 11 passed | 1 failed/10 passed | KORUNUYOR | — | (mevcut `scanned.length>5` + pozitif iddia yeterli) | URUN (rendering, aday) |
| runtime-version-alignment | `.github/workflows` → `.` (proje kökü) | 4→4 | 11 passed | 2 failed/9 passed | KORUNUYOR | — | (mevcut "ÖLÇÜM YAPILDI" guard'ı yeterli) | ALTYAPI (CI, aday) |
| stock-restore-evidence | `/src/**/*.{ts,tsx}` (appSources) → `/scripts/**/*.{ts,tsx}` | 951→11 | 5 passed | 6 passed | FAIL-OPEN | FAIL-OPEN DOĞRULANDI (+ağırlaştırıcı: `stockWriters` bugün zaten 0, bağımsız 695-dosya prob ile) | `Object.keys(productionSources).length>600` + çalışma kümesi 0 iken açık "VAKUM" ilanı (skip yerine) | ALTYAPI (karma) |
| storefront-reflow-guards | `/src/views/*.tsx` → `/src/components/*.tsx` | 18→33 | 3 passed | 3 failed | KORUNUYOR | — | (mevcut `SOURCES[ABOUT]/[BRANDS]` stale-guard yeterli) | URUN |
| tailwind-token-sinif-gecerliligi | `KOK/src` → `KOK/docs` | 951→0 | 3 passed | 3 passed | FAIL-OPEN (bilinen, PR #1064) | FAIL-OPEN DOĞRULANDI | `tsxDosyalari(KOK).length>900` | URUN — **PR #1064 ile kapanıyor** |
| webhook-auth-fail-closed (R2) | scannedSources'ın `/src/**/*.{ts,tsx}` parçası → `/scripts/**/*.{ts,tsx}` (migrations/functions dokunulmadı) | src-parça 951→11 (migrations 234 dokunulmadı) | 9 passed | 3 passed (izole R2) | FAIL-OPEN (kısmi/zayıf) | FAIL-OPEN DOĞRULANDI (kısmi) | guard'ı üçe böl: `migrationCount>200` · `fnCount>40` · `srcCount>900` | ALTYAPI |

---

## 3. Çürütmenin düzelttikleri

- **config-fail-closed** — sonnet'in "KOK → src/types, 6 passed" beyanı ölçümle uyuşmadı. Aynı
  sabotaj birebir kurulunca (`HEALTHZ = join(KOK,'healthz','index.ts')`) test **1 failed** (ENOENT)
  verdi — `HEALTHZ` sabiti `KOK`'tan türediği için kök kayınca paket kendiliğinden kırmızı oluyor.
  Yalnız daha dar bir varyantta (tarama çağrısının kökü `HEALTHZ`'den bağımsız ayrıca değiştirilirse)
  fail-open kalıyor — hüküm bu yüzden "ÇÜRÜDÜ" (tam FAIL-OPEN değil), ama dar bir delik hâlâ açık.
- **stock-restore-evidence** — sonnet'in "951→11" evren sayısı kapının **yürüdüğü kümeyi** değil,
  taranan-dosya sayısını ölçüyordu. Bağımsız bir prob (aynı `isOrderScopedStockWriter` yüklemi,
  695 gerçek prod dosyası üzerinde) `stockWriters=0` verdi — yani kapının **çalışma kümesi**
  sabotajsız hâlde de zaten sıfır. Sonnet'in "yan sayaç"ı kusuru olduğundan hafif gösteriyordu;
  gerçekte invaryant bugün fiilen denetlenmiyor.
- **3 "PAKET KORUYOR" kalemi** (localized-route-ssot, pricing-cache-invariants,
  pricing-storefront-source) — sonnet üçünü de "FAIL-OPEN" / "KORUNUYOR ama zayıf" diye işaretledi
  çünkü ana iddianın (`offenders===[]`) kendisi gerçekten eşiksiz. Ama tam dosya sabotajlı koşulunca
  **aynı dosyadaki komşu bir test** (farklı amaçla yazılmış, aynı `SOURCES`/`SRC_SOURCES` değişkenini
  ayrıca sabit bir yolla arayan bir stale-guard) paketi kırmızıya çekiyor — CI'ın gördüğü birim
  dosyadır, yani doğru hüküm "paket koruyor, kapının KENDİSİ tek başına zayıf/ödünç korunuyor"tur.
  Koruma **tasarlanmış değil**: o komşu test kaldırılır ya da ayrı bir değişkene taşınırsa üçü de
  çıplak FAIL-OPEN'a düşer.

---

## 4. Sonnet'in sistematik hataları + yöntemin sınırı

Altı sonnet ajanının ortak zaafı **kapıyı dosya değil assertion granülünde okumak** ve sabotajın
kapının gerçekten yürüdüğü kümeye değip değmediğini ayrıca ölçmemekti:

1. Aynı dosyadaki komşu bir testin sapmayı kırmızıya çevirmesi "tesadüfi yan etki" diye küçümsendi
   (localized-route-ssot, pricing-cache-invariants, pricing-storefront-source) — oysa CI'ın gördüğü
   birim dosyadır.
2. `config-fail-closed`'da beyan edilen sabotaj hiç kurulmamış ya da yanlış kurulmuş görünüyor —
   tek doğrulanamayan "6 passed" iddiası bu oldu.
3. Evren sayısı olarak hep **taranan dosya sayısı** raporlandı, kapının **çalışma kümesi** değil —
   `stock-restore-evidence`'ta bu fark kritikti.
4. Sabotaj hedefi olarak sık sık `docs/` seçildi (0 adet `.ts/.tsx`) — bu "geçerli ama yanlış" değil
   **boş evren** testidir; sonuç yine fail-open'ı kanıtlıyor ama daha ağır bir sınıf olduğu hâlde
   ayrı işaretlenmedi.

**Yöntemin sınırı:** bu 53 kapı `docs/audits/rec162-...md`'deki **vekil ölçüte** (ağaç yürüyor +
"muhafız görünmüyor" grep deseni) göre seçilmiş bir **alt sınırdır** — evrendeki `163` konformans
dosyasının **110'u bu turda hiç sınanmadı** (vekil onları "muhafızlı" saydığı için, ya da vekil
onları görmedi: sabit dosya listesi, ayrı sayım değişkeni, fixture'lı kapı gibi yanlış-negatif
kaynakları rec162'de açıkça not edilmişti). Yani 53/163 ölçüldü, 110/163 hâlâ aday bile değil.

---

## 5. Sahip başına iş listesi

**URUN (29 kapı — ölçülen 15 FAIL-OPEN + PAKET KORUYOR 3'ün 2'si + KORUNUYOR geri kalanı):**
3d-asset-validity, 3d-csp, 3d-model-recipe, 3d-procedural-env, 3d-single-canvas,
category-metadata-i18n-ssot, category-name-ssot, i18n-key-resolution, numeric-format-ssot,
tailwind-token-sinif-gecerliligi (**PR #1064 ile kapanıyor**), localized-route-ssot,
pricing-cache-invariants, pricing-storefront-source, canonical-lang-segment, i18n-attribute-literals,
i18n-locale-case, i18n-locale-compare, i18n-uppercase-proper-noun, auth-account-surface,
auth-reset-chain, auth-session-security, home-hero-route-ssot, jsonld-fiyat-sizintisi,
kart-yukleme-onceligi, lang-metadata-locale, quote-machine-ssot, render-price-surface,
render-revalidation-contract, storefront-reflow-guards.

**ALTYAPI (14 kapı):** config-fail-closed, pricing-money-append-only, stock-restore-evidence,
webhook-auth-fail-closed (R2), csp-origin-coverage, githooks-integrity, invoice-ledger-contract,
payment-integrity, payment-money-move, pricing-fx-lock-contract, pricing-fx-rate-single-resolver,
pricing-segment-source (YÜRÜMÜYOR — ayrı sınama yöntemi gerekir), runtime-version-alignment,
kvkk-request-ledger (legal ile karma).

**OPS devir adayı (10 kapı, şu an sahipsiz — karar OPS'ta):**
- **admin-mutate-real-write → URUN'a devir önerisi** (en ağır: no-op admin mutasyonu, kullanıcı
  kaydettiğini sanır); aynı sahipsiz aile içindeki diğer 6 admin-* kapı
  (admin-daypicker-classnames, admin-export-hygiene, admin-fx-lock-crud, admin-fx-lock-visibility,
  admin-shell-invariants, admin-status-filter-domain) hepsi KORUNUYOR — bugün acil değil, ama
  sahiplik netleşmeli.
- **legal-en-leftover → OPS** (boş evrende yeşil kalan en ağır fail-open); aynı sahipsiz aile
  (legal-consent-gate, legal-consent-analytics) KORUNUYOR durumda.

---

## Sayım satırı

**53/53 · FAIL-OPEN DOĞRULANDI 15 · PAKET KORUYOR 3 · ÇÜRÜDÜ 1 · KORUNUYOR 33 · YÜRÜMÜYOR 1**
**Sahip: URUN 29 · ALTYAPI 14 · sahipsiz (OPS devir bekliyor) 10** (7 admin-* + 3 legal/kvkk-*)
