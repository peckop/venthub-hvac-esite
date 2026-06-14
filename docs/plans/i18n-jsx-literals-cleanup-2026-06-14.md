# i18n Temizliği — `react/jsx-no-literals` Uyarıları (PLAN)

> **Durum:** Hazır, başlamadı. Admin kit PR #360 master'a merge edildikten (`69437666`) sonra çıkarıldı.
> **Branch (planlanan):** `chore/i18n-jsx-literals` (güncel master'dan dallanır).
> **Tetik:** Kullanıcı "846 uyarıyı da toparlayalım" dedi; "neden kapatıyoruz?" diye disable-önerisini doğru şekilde reddetti → memory `dont-disable-lint-to-fake-zero`.

## Ölçüm (2026-06-14, `pnpm exec eslint . -f json`)

- **Toplam: 846 uyarı / 129 dosya.** Hepsi `warn` (bloklamıyor; tsc/lint **hata** = 0).
- Kural dağılımı: **845 `react/jsx-no-literals`** + **1 `unused-imports/no-unused-vars`**.
- Klasör: legal 235 · components/admin 153 · account 89 · views/admin 89 · components/category 59 · category 32 · calculators 31 · checkout 19 · ContactPage 18 · home 16 · products 16 · app/admin 14 · diğer.

## Sınıflandırma (KAPATMA YOK — dürüst)

| Küme | Adet | Karar |
|---|---|---|
| **Gerçek i18n borcu** (admin, account, category, calculators, checkout, contact, home…) | **~610** | **Düzelt** — kullanıcıya görünen metni `dictionaries/tr.ts`+`en.ts`'e taşı (Kural #7). Asıl iş. |
| **KVKK** (`legal/components/tr|en/KvkkContent.tsx` + `KVKKPage`) | 94 | **Dokunma** — zaten `{lang==='en' ? <KvkkContentEn/> : <KvkkContentTr/>}` bileşen-ayrımı; metin doğru çevrilmiş, uyarı yapısal yanlış-pozitif. (En fazla ileride `legal/components/**` için belgelendirilmiş dar istisna — kozmetik, şart değil.) |
| **5 taslak yasal sayfa** (Privacy 35, DistanceSales 42, PreInfo 25, Terms 22, Cookie 17 = 141) | 141 | **Ertele** — tek dosya, **TR-only**, hepsi "Taslak/test amaçlı, hukukçuya danışın" notlu placeholder. EN kullanıcı TR görüyor = gerçek açık AMA içerik final değil. Gerçek hukuki metin + avukat gelince yaz. |
| Ölü import | 1 | İlk batch'e gir. |

> Sonuç hedefi: 846 → **~235** (hepsi meşru: KVKK doğru + 5 taslak ertelendi). Sahte sıfır YOK.

## Yürütme (maestro — `prefer-divide-parallel-subagents`)

Alan alan dalgalar; her dosya-grubu için göç-ajanı literalleri sözlük anahtarına taşır:
1. **admin** (components/admin 153 + views/admin 89 + app/admin 14) — admin sözlükleri per-page bölünmüş (Faz 0'), zemin hazır.
2. **account** (89)
3. **category** (components/category 59 + views/category 32 = 91)
4. **calculators 31 + checkout 19 + contact 18 + home 16 + products 16 + kalan**

Her dalga:
- Göç-ajanı brief'i DAR: yalnız kendi dosyaları, internet/context7 YOK, yasak desen YOK (`eslint-disable` dahil — disable ile susturma YASAK), pnpm/tsc KOŞMA.
- **Yargıç** çürütür: **tr/en parite** (her yeni anahtar iki sözlükte de), JSX bozulmadı, anlam/metin korundu, `useLocalizedRoutes`/`t()` doğru kullanıldı, yeni hardcode girmedi.
- **Merkezi kapı (orkestratör):** tsc + lint (uyarı sayısı düştü mü) + test --run + axe. Dalga başına commit.

## Notlar / Riskler
- i18n anahtar isimlendirme: mevcut `dictionaries/` deseni izlenir (ör. `admin.<page>.<key>`, `account.<page>.<key>`). Yeni üst-düzey alan açma; var olan ağaca otur.
- tr/en parite testi mevcut (i18n parity) — eksik anahtar testi düşürür, merkezi kapıda yakalanır.
- Bu iş **bayi pivotundan (memory `dealer-pivot-decision`) bağımsız**; sıralama kullanıcı kararı.

## İLERLEME (branch `chore/i18n-jsx-literals`)

Sayaç: başlangıç **845** jsx-literal. Hedef-dışı sabit: admin 256 + legal 235 (ertelendi).

| Dalga | Commit | Durum |
|---|---|---|
| Validator — AccountOverview | `df9a6e10` | ✅ 23→0 |
| Wave 1 — account (6 sayfa) | `c7943b8a` | ✅ ~59→0 (master `92cb011b`) |
| Wave 2 — checkout (6 dosya) | `e4e548d3` | ✅ ~16→0 (master `92cb011b`) |
| **Wave A — calculators (4 dosya)** | `32e746fa` | ✅ 35→0 · birimler `common.{unitMeters,unitCubicMeters,unitNewton,dimensions2D,dimensions3D}` interpolasyonuna katlandı |

**Ölçüm 2026-06-14 (post-A):** toplam 737 jsx-literal / 115 dosya. Hedef-dışı: admin 256 + legal 235.
**Kapsam-içi kalan ≈ 211** (category ~91 · contact 18 · home ~16 · auth ~14 · tail ~66 [products/3d·navigation·authority·brands·knowledge·support·footer·search]).

## MAKİNE (kanıtlandı — her dalga tekrarla)

1. `.claude/skills/maestro/i18n-wave.mjs` — Workflow; **TARGETS + SURFACE'i düzenle**, çalıştır. Ajanlar yalnız kendi bileşenini düzenler + yeni anahtarları yapısal döndürür (tr/en). NOT: `args` global bağlanmıyor → TARGETS'i script'e **hardcode** et.
2. Çıktı dosyasından: `node C:/tmp/parse-wave.js <out>` (anahtarları gör), `node C:/tmp/check-missing.js <out>` (judge.missing − raporlanan = gerçek eksik).
3. **Merkezi merge:** `node C:/tmp/merge-generic.js <out> <SURFACE>` → tr.ts+en.ts'e ekler (mevcut alt-namespace'e key ekler / yeni alt-obje açar; anchor'ı SURFACE bloğuyla sınırlar, parite).
4. **Kapı (orkestratör):** 6 dosya `eslint` (kalan literal=0; sembol/emoji/marka/ayraç → dict key, template literal YASAK — kural onu da yakalar), `type-check` (en: typeof tr parite zorlar), parite testi `src/i18n/__tests__/i18n.test.ts`, son `pnpm test -- --run`. Kaçanları elle düzelt.
5. Commit (sadece N bileşen + 2 dict; **`.cc/memory.db`/system_tree/maestro HARİÇ**). Orion pre-commit doc hook'u .md üretir (normal).

Dict edit'lerinde NOT: merge script harici yazdığı için Edit "not read" guard atar → önce ilgili bölgeyi Read et. Diagnostic'ler `en: typeof tr` için ara-durum gösterir; **tsc otoritedir**.

## ✅ TOOLING LİMİTİ — DÜZELTİLDİ (2026-06-14, Wave A öncesi)

**Kök neden (teşhis edildi):** `merge-generic*.js`'in `region()`'ı `src.indexOf('  PARENT: {')` ile buluyordu — bu, **8-boşluk nested aynı-isimli anahtarı substring olarak** yakalıyordu. tr.ts'te `calculators:` HEM nested (satır 592, `knowledge.calculators`, 8-boşluk) HEM top-level (2126, 2-boşluk) var; indexOf ilk (yanlış, 592) olanı buluyordu → `--apply` etseydim alt-ns'leri yanlış bloğa yazıp sözlüğü bozardı. İkincil hata: `subBlock()` kapanışı `\n    },` (4-boşluk + virgül) arıyordu, ama bloğun SON alt-ns'i virgülsüz `    }` ile kapanır → collision-tarama aşırı uzardı.

**Düzeltme:**
1. `region()` artık **`\n  PARENT: {`** ile anchor'lıyor (newline + TAM 2 boşluk) → yalnız top-level yüzeyi hedefler, nested'i asla.
2. `subBlock()` kapanışı **`/\n {4}\}/`** ile (virgüllü/virgülsüz fark etmez; 6-boşluk iç kapanışları es geçer).
3. **`C:/tmp/merge-generic3.js`** (YENİ, kanonik): PARENT'ı her öğenin `ns`'inden (ilk segment) türetir → bir dalga **çoklu-yüzeye** yayılabilir (tail için şart). Kullanım: `node C:/tmp/merge-generic3.js <out.json>` (dry-run) → rapor doğrula (EXISTING/NEW + 0 çakışma) → `--apply`.
4. `i18n-wave.mjs`: ajan **DÜZ tek-parça yeni anahtar** üretir (form/results alt-obje GENİŞLETMEZ); migratePrompt yüzeyi `t.ns`'den türetir (çoklu-yüzey). Wave A'da kanıtlandı: dry-run jetFan/airCurtain=EXISTING, layout/stepIndicator=NEW, 0 çakışma; uygulama temiz.

**Kanonik dalga reçetesi (her yüzey için tekrarla):**
`i18n-wave.mjs` TARGETS düzenle → Workflow çalıştır → `cp <task.output> C:/tmp/wave-X.json` → `node merge-generic3.js wave-X.json` (dry-run, doğrula) → `--apply` → eklenen bölgeyi gözle → `node C:/tmp/keycheck.js` (t() anahtarları çözülüyor mu) → kapı: 4-dosya eslint (literal=0) + `type-check` + `test:i18n` + `pnpm test -- --run` → kalan birim/sembol/aria'yı elle düzelt (birim → `common.unit*`; aria broken-key → görünür anahtara eşitle) → commit (yalnız wave dosyaları + 2 dict; Orion .md sidecar'ları normal).

**Durum:** account+checkout master'da (`92cb011b`). Wave A (calculators) branch `chore/i18n-jsx-literals`'te commit `32e746fa`. Sıradaki: B1 category-views (çalışıyor) → B2 category-sections+wizards+silent-fan (çoklu-yüzey) → C contact+home → D auth → E tail. Kalite çıtası: [[i18n-quality-is-enterprise-substance]] + skill `i18n-conventions`.
