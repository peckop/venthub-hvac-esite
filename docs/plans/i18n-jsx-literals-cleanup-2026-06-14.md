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
