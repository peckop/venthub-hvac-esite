# VentHub i18n / Localization Standardı (Cetvel)

> **Ne bu?** TR/EN çok-dilli ürünün **tek doğru kaynak (SSOT)** kuralları ve bu kuralların
> **otomatik bekçileri (conformance kapıları)**. Cetvel = kural (insan: niçin/ne) · Kapı = zorlayıcı
> (makine: nasıl-doğru-kalır). "Olur" demez, **ölçer.**
> Oluşturma: 2026-06-15 · Sahibi: Recep · Nasıl-yapılır oyun kitabı → `.claude/skills/i18n-conventions`
> + `docs/plans/i18n-jsx-literals-cleanup-2026-06-14.md`. Bu dosya **cetvel**, playbook değil.

---

## 0. Yönetici İlke

İngilizce arayüzde Türkçe sızıntı, dilsiz (locale'siz) URL, ya da ham anahtar (`account.x.y`)
= **"profesyonel değil" damgası.** Çeviri/biçim/rota kalitesi *cila* değil **cevher**. Bir kural
"önemli + kolay ihlal + gözle zor yakalanır" ise → **kapı (test) ister**, code-review'a bırakılmaz.

---

## 1. SSOT Katmanları (tek doğru kaynak)

| Alan | Tek Doğru Kaynak | Nereden |
|---|---|---|
| UI metni | `tr.ts` (SSOT) + `en.ts` (sadık çeviri, `en: typeof tr` mühürlü) | `src/i18n/dictionaries/` |
| Çeviri çağrısı | `useI18n().t('ns.key')` | `@/i18n/I18nProvider` |
| **Navigasyon URL'i** | client: `useLocalizedRoutes()` · RSC/paylaşılan: `localizedHref(url, lang)` | `src/hooks/useLocalizedRoutes.ts`, `src/utils/routes.ts` |
| **Entity adı (display)** | `getCategoryDisplayName(cat, t)` (`translation_key`→dict) | `src/utils/categoryHelpers.ts` |
| **DB JSONB çeviri** | `mapCategoryWithLocale(dbCat, lang)` (`metadata[lang]`) | `src/lib/type-converters.ts` |
| **Para** | `formatCurrency(value, lang)` | `@/i18n/format` |
| **Sayı (para-dışı)** | `formatNumber(value, lang)` (adet, hacim m³, hesap sonucu) | `@/i18n/format` |
| **Tarih** | `formatDate(iso, lang)` / `formatDateTime` | `@/i18n/datetime` |
| Rota tabanı (dilsiz authority) | `Routes.x()` — **render'da daima localize edilir** | `src/utils/routes.ts` |

---

## 2. Mutlak Kurallar (ihlal = mimari hata)

1. **Hardcoded string YASAK** — kullanıcıya görünen TÜM metin `t()`'den (izinli semboller hariç, bkz. skill `allowedStrings`).
2. **Manuel `/${lang}/...` YASAK** — URL dil öneki yalnız `useLocalizedRoutes`/`localizedHref` ile. Sabit app-yolu literal'i (`href="/category/..."`) de yasak.
3. **Client'ta ham `Routes` YASAK** — `import { Routes }` tek başına nav render eden bileşende olmaz; `useLocalizedRoutes()` proxy'si ya da `localizedHref` zorunlu. (İstisna: `/admin*` dil-öneki almaz; R3F Canvas context'i geçmez.)
4. **Entity adı SSOT'tan** — `categoryList` sözlüğünü `slug` ile doğrudan indeksleme yasak (slug ≠ `translation_key`); `getCategoryDisplayName` kullan.
5. **DB JSONB çeviri locale-mapper'dan** — `metadata.hero_description` vb. ham okuma yasak; `mapCategoryWithLocale` / `getCategoryDescription` kullan.
6. **Para/sayı/tarih format helper'dan** — ham `Intl.*Format`/`toLocale*String`/elle `₺` birleştirme yasak; `formatCurrency`/`formatNumber`/`formatDate`. (Tek muaf: SSOT'un kendisi — `i18n/format.ts`, `i18n/datetime.ts`.)
7. **Hiyerarşik anahtar** — `section.subsection.key`. Paylaşılan metin → `common`. Çakışan anahtarı körlemesine yeniden-tanımlama.
8. **Hreflang** — self-referencing + reciprocal (A→B ⇒ B→A) + ISO kodları (`en-GB` ✓) + `x-default`. Canonical, locale URL'i ile eşleşir.
9. **Anahtar yapısı: tek-segment düz YA DA gerçek nested** — çözücü `getDictValue` **NESTED-ONLY** (`path.split('.')` + iç içe iner, bulamazsa ham path döner). İçinde-nokta **düz** anahtar (`'table.productCol'`, `'settings.title'`) çözülmez → **ham-key render** (sessiz bug; tsc/lint/parity/build yakalamaz). Yeni anahtar ya `'pageTitle'` (tek-segment) ya `table: { productCol }` (gerçek nested) olmalı; içinde-nokta düz anahtar **YASAK**. Anahtarı doğru namespace'te tanımla (`t('common.share')` çağrılıyorsa `share` gerçekten `common` altında olmalı).

---

## 3. Conformance Kapıları — Drift Eksenleri (ne var ne yok)

> Her eksen = bir bug-sınıfı. Kapısı olan eksen **kalıcı kapalı** (drift sızamaz). Kapısı olmayan = **açık borç**.

| # | Eksen | SSOT | Kapı (bekçi) | Durum |
|---|---|---|---|---|
| A | Entity-adı (display) | `getCategoryDisplayName` | **INV-1** `category-name-ssot.test.ts` | ✅ KAPALI |
| B | Localize-rota | `useLocalizedRoutes`/`localizedHref` | **INV-2** `localized-route-ssot.test.ts` (3 kural: elle önek · sabit app-yolu · ham Routes) | ✅ KAPALI (54 dosya migrate) |
| C | i18n literal → t() | `t()` + `en: typeof tr` | eslint `react/jsx-no-literals` + `test:i18n` parite + `prebuild` | ⚠️ KISMÎ — kapsam-içi kapalı; **admin (~256) + legal (~235) ertelendi** |
| D | Para/sayı/tarih biçimi | `formatCurrency`/`formatNumber`/`formatDate` | **INV-3** `numeric-format-ssot.test.ts` (ham `Intl.*Format` · `toLocale*String` yasak; muaf = SSOT 2 dosya) | ✅ KAPALI (6 saha migrate) |
| E | DB JSONB çeviri (display) | `getCategoryDescription` / `mapCategoryWithLocale` | **INV-4** `category-metadata-i18n-ssot.test.ts` (ham `hero_*` / `technical_summary` okuması yasak) | ✅ KAPALI (`CategoryShowcase` helper'a bağlandı) |
| F | Hreflang/SEO | hreflang seti | — manuel denetim | ⚠️ blueprint var (`seo-transition-blueprint.md`) |
| G | **i18n key-çözünürlük** | `getDictValue` nested-only | **INV-5** `i18n-key-resolution.test.ts` (her statik `t('a.b.c')` sözlükte çözülmeli; içinde-nokta düz anahtar = ham-key render) | ✅ KAPALI (ratchet: 2026-06-16'da 32 debt donduruldu → admin literal batch #364 15'ini çözünce 32→17 sıkıştı; yeni kırılma kırar) |

**Açık eksenleri kapatma yöntemi:** drift denetimi (ajan) → maestro paralel göç → merkezi kapı (type+lint+test+build) → **yeni INV-x conformance testi** → commit. (B ekseninin yaptığı gibi.)

---

## 4. DoD — Canlı UI'da ASLA görünmemeli

- [ ] Ham anahtar sızıntısı yok (`account.x.y` gibi nokta-yollu metin) — **INV-5 keycheck** otomatik tutar; her statik `t('...')` sözlükte çözülmeli.
- [ ] Çözülmemiş `{{placeholder}}` / `NaN` / `undefined` yok.
- [ ] Dil değişince TÜM metin + tarih/para biçimi güncelleniyor.
- [ ] Dilsiz URL yok (her iç link `/tr|/en` önekli render ediliyor).
- [ ] Hardcoded TR/EN literal yok (izinli semboller hariç).
- [ ] EN deyimsel (`30%` değil `%30` değil; TR=EN sızıntısı yok — sadık-kopya yan etkisi taranmış).

---

## 5. İlgili

- **Playbook (nasıl):** `.claude/skills/i18n-conventions` · toplu göç makinesi `docs/plans/i18n-jsx-literals-cleanup-2026-06-14.md`
- **Kapı kaynak:** `src/__tests__/conformance/` (INV-1 entity-adı · INV-2 localize-rota · INV-3 sayısal/zamansal biçim · INV-4 metadata JSONB-çeviri · INV-5 key-çözünürlük/keycheck)
- **Komşu cetveller:** `admin-standard.md`, `dealer-network-standard.md` · **SEO:** `docs/plans/seo-transition-blueprint.md`
- **CLAUDE.md** Kural #7 (i18n) bu cetvelin özetidir.
