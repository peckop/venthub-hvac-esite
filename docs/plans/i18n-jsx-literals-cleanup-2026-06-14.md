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
| Wave 1 — account (6 sayfa) | `c7943b8a` | ✅ ~59→0 |
| Wave 2 — checkout (6 dosya) | `e4e548d3` | ✅ ~16→0 |

**Kapsam-içi kalan ≈ 249** (calculators 35 · category ~91 · contact 18 · home ~30 · auth 14 · products/3d/navigation/ufak-kuyruk ~60).

## MAKİNE (kanıtlandı — her dalga tekrarla)

1. `.claude/skills/maestro/i18n-wave.mjs` — Workflow; **TARGETS + SURFACE'i düzenle**, çalıştır. Ajanlar yalnız kendi bileşenini düzenler + yeni anahtarları yapısal döndürür (tr/en). NOT: `args` global bağlanmıyor → TARGETS'i script'e **hardcode** et.
2. Çıktı dosyasından: `node C:/tmp/parse-wave.js <out>` (anahtarları gör), `node C:/tmp/check-missing.js <out>` (judge.missing − raporlanan = gerçek eksik).
3. **Merkezi merge:** `node C:/tmp/merge-generic.js <out> <SURFACE>` → tr.ts+en.ts'e ekler (mevcut alt-namespace'e key ekler / yeni alt-obje açar; anchor'ı SURFACE bloğuyla sınırlar, parite).
4. **Kapı (orkestratör):** 6 dosya `eslint` (kalan literal=0; sembol/emoji/marka/ayraç → dict key, template literal YASAK — kural onu da yakalar), `type-check` (en: typeof tr parite zorlar), parite testi `src/i18n/__tests__/i18n.test.ts`, son `pnpm test -- --run`. Kaçanları elle düzelt.
5. Commit (sadece N bileşen + 2 dict; **`.cc/memory.db`/system_tree/maestro HARİÇ**). Orion pre-commit doc hook'u .md üretir (normal).

Dict edit'lerinde NOT: merge script harici yazdığı için Edit "not read" guard atar → önce ilgili bölgeyi Read et. Diagnostic'ler `en: typeof tr` için ara-durum gösterir; **tsc otoritedir**.

## ⚠️ TOOLING LİMİTİ (calculators dalgasında bulundu — DÜZELTİLMEDEN devam etme)

**Sorun:** `merge-generic*.js`'in blok-sınırı tespiti **büyük namespace'lerde kırılıyor.** `region()` kapanışı `indexOf('\n  },')` ile buluyor; calculators gibi büyük blokta yanlış erken kapanış buluyor → mevcut alt-namespace'i (`jetFan`, satır ~2272, calculators 2126-2297 içinde) **"YENİ" sanıyor** → `--apply` etseydim **duplicate `jetFan`** yazıp sözlüğü bozardı. `{{count}}` brace'leri naive brace-sayımını da bozar.

**Calculators dalgası ÇIKTISI hazır/cache'li** (run `wf_5aac0ed3-504`, output `wxnt88u0z.output`): ajanlar İYİ iş çıkardı — JetFan bu sefer `pageTitle`/`pageInfoText` kullanıp **çakışmayı kendi önledi** (önceki run `title` ile çakışıyordu). Yani sorun ajanlar değil, merge-aracı.

**DÜZELTİLMİŞ DEVAM YÖNTEMİ (sıradaki oturum):**
1. **region() düzelt:** kapanışı "ilk `\n  },`" yerine **"bir sonraki 2-boşluk top-level `\n  <word>: {` anahtarından hemen önce"** olarak bul (ya da string-atlayan brace-aware tarama). VEYA basitçe: `    <ns>: {` benzersiz olduğu için **doğrudan o anchor'a** ekle, region'a hiç gerek yok.
2. **Ajan talimatını sadeleştir** (`i18n-wave.mjs`): YENİ anahtarları **DÜZ** (page-namespace altında flat) üret — mevcut `form`/`results` alt-objelerini GENİŞLETME, yeni nested alt-obje açma. Böylece merge hep "namespace açılışından sonra flat ekle" = nested-merge derdi biter. (Mevcut anahtar reuse serbest; sadece YENİ'ler flat.)
3. Kalan yüzeyler: **calculators (cache'den), category ~91, contact 18, home ~30, auth 14, kuyruk ~60.** Her biri: dalga → flat-merge → kapı (`pnpm run test:i18n` + eslint + tsc + test) → commit. Kalite çıtası: memory [[i18n-quality-is-enterprise-substance]] + bu skill `i18n-conventions`.

**Durum:** 3 dalga (account+checkout, ~98 literal) master'a HENÜZ bağlanmadı (branch `chore/i18n-jsx-literals`, 4 commit). `i18n-conventions` skill'i maks-fayda için geliştirildi.
