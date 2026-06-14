---
name: i18n-conventions
description: VentHub'ın TR/EN i18n kuralları ve çeviri/literal-çıkarım oyun kitabı. JSX'e
  metin eklerken, hardcoded Türkçe literalleri sözlüğe taşırken, tr.ts/en.ts güncellerken,
  react/jsx-no-literals uyarılarını temizlerken veya toplu i18n göçü yaparken KULLAN.
  Hangi anahtar nereye gider, sembol/rich-text/interpolasyon nasıl çevrilir, çakışma
  nasıl çözülür, çok-dosyalı dalga nasıl orkestre edilir — hepsi burada. Font/stil,
  DB işlemleri veya test paketi çalıştırma için KULLANMA.
category: guards
metadata:
  triggers:
  - metin ekle
  - çeviri yap
  - i18n
  - dictionary update
  - jsx-no-literals
  - hardcoded string
  - literal çıkar
  - hardcoded literal
  inputs:
  - JSX text string
  outputs:
  - tr.ts / en.ts updates
  - Routes usage
depends_on: []
next_steps: []
---

# i18n Conventions Skill

VentHub çok dilli (TR/EN) bir **enterprise** üründür. Çeviri/copy kalitesi *cilanın* değil
*cevherin* parçasıdır: İngilizce arayüzde Türkçe sızıntı veya ham anahtar = "profesyonel
değil" damgası. Bu skill, UI'a metin eklerken / hardcoded literalleri sözlüğe taşırken
**ilk seferde doğru** yapman için kuralları + sahada-öğrenilen taktikleri verir.

## Temel Prensipler

1. **Hardcoded string YASAK** — kullanıcıya görünen TÜM metin i18n'den gelir.
2. **Türkçe öncelikli** — `tr.ts` ana sözlük (SSOT), `en.ts` sadık çeviri.
3. **Hiyerarşik anahtar** — `section.subsection.key`. Düz/belirsiz isim yasak.
4. **Rotalar `useLocalizedRoutes`** — `Routes.category()` ile; manuel `/${lang}/...` mimari ihlal.
5. **DB çevirisi JSONB** — `metadata->>lang`; ayrı ilişkisel çeviri tablosu yasak.

## Karar Ağacı: Anahtar Nereye Gider?

1. **Birçok yerde kullanılan genel metin** (Kaydet/İptal/Güncelle/Sil, "Yükleniyor") → **`common`**. *(Aynı metni iki sayfaya ayrı ayrı yazma — `common`'a al.)*
2. **Admin'e özel** → `admin.{module}` (per-page dosya: `dictionaries/admin/*.ts`).
3. **Belirli sayfaya özel** → `{pageName}` (ör. `category`, `account.overview`, `checkout.review`).
4. **Form alanı/placeholder** → `{module}.form` / `{module}.placeholders`.
5. **Hata/bildirim** → `{module}.toasts` / `{module}.errors`.

> **Çoğul/dinamik:** `{{placeholder}}` kullan (`'{{count}} ürün'`). Çoğul için ayrı anahtar (`item` vs `items`).

## ESLint Gerçeği — `react/jsx-no-literals` (`noStrings: true`)

Bu kural agresiftir: **JSX text düğümlerini, ifade içindeki string literallerini VE template
literal'leri** yakalar. Yani `>Merhaba<`, `{'Merhaba'}` ve `` {`Merhaba`} `` üçü de uyarı verir.
Kaçış yolu yoktur — metin **ya t()'den gelir ya da `allowedStrings`'tedir.**

**`allowedStrings` (eslint.config.cjs — dokunma, çevirme, oldukları gibi bırak):**
```
-  +  :  /  %  x  X  •  ·  ©  VH  TR  EN  ESC  "PCI DSS"  "3D Secure"  "256-bit SSL"  " " " (tırnaklar)
```
Bu listede **OLMAYAN** her sembol/emoji/marka uyarı verir: `#`, `👋`, `—` (em-dash), `₺`,
çıplak `,` , `(` `)` , `"DEMO"`, `"Google"` → bunları **sözlüğe key olarak koy** (template
literal ile kaçma — o da yakalanır). `ignoreProps: true` olduğu için `className`/prop string'leri
serbesttir; sadece **render edilen** metinle ilgilen.

## Çıkarım Teknikleri (literal → t())

**0. Önce YENİDEN KULLAN.** `tr.ts`'te ilgili namespace'i oku; metin **birebir** eşleşen anahtar
varsa onu kullan, yeni üretme. (Tutarlı terminoloji = enterprise kalite.)

**1. `t` nereden gelir.** Çoğu bileşen `const { t, lang } = useI18n()` (`@/i18n/I18nProvider`).
Bazıları `t`'yi **prop** olarak alır (`t: (k) => string`) — o zaman `useI18n` EKLEME, mevcut prop'u
kullan. `t`, bileşen gövdesindeki helper fonksiyon/`useMemo` dizilerinde de kapsamdadır.

**2. Interpolasyon** — dinamik değer, birim, sayı:
```tsx
// dict: orderNumber: 'Sipariş {{code}}'   |  meters: '{{value}} m'  |  filterAll: 'Tümü ({{count}})'
{t('account.shipments.orderTitle', { code })}
{t('calculators.jetFan.meters', { value: x })}
```
> Birim ekleri (`m`, `m³`, `N`, `₺`) ve sıra-no önekleri (`#`) → interpolasyonlu anahtara göm,
> çıplak bırakma. `'#{{code}}'`, `': #{{code}}'` gibi.

**3. Rich-text bölme** — metin + satır-içi JSX (`<span>`, `<Link>`, ikon) iç içeyse, satır-içi
öğenin **etrafında ayrı t() çağrılarına böl**; kelime sırası **hem TR hem EN için geçerli kalsın**:
```tsx
// ÖNCE:  Sipariş <span>#{code}</span> yolda.
{t('o.orderPrefix')} <span>{t('o.orderHash', { code })}</span> {t('o.inTransitSuffix')}
// dict TR: orderPrefix:'Sipariş'  inTransitSuffix:'yolda.'   EN: 'Order' / 'is on the way.'
```
Bölme word-order'ı bozacaksa (EN'de sıra farklıysa) tek interpolasyonlu anahtar tercih et.

**4. Sembol/emoji/marka → dict.** `allowedStrings`'te olmayanlar:
```tsx
// 👋 →  wave: '👋'   |   — → empty: '—'   |   "DEMO" → demoBadge: 'DEMO'   |   "Google" → googleLabel: 'Google'
{t('account.overview.wave')}
```

## Çakışma & Paylaşılan Metin Çözümü (kalite kritik)

- **Çakışma:** Sayfa metni, **aynı isimli mevcut bir anahtardan FARKLI** ise (ör. sayfa H1'i
  'Jet Fan Hesap Makinesi' ama mevcut `jetFan.title` = 'Jet Fan Hesaplayıcı', başka yerde kullanılıyor)
  → **üzerine YAZMA** (duplicate key + başka ekranı bozar). Ayrı ad kullan (`pageTitle`) ya da
  gerçekten her yerde aynıysa `common`'a terfi ettir.
- **Paylaşılan:** İki+ sayfada aynı metin → `common` (ör. adres satırı `common.cityLine:
  '{{district}}, {{city}} {{postal}}'`). Sayfa-özel namespace'lerde tekrarlama.

## Toplu Çıkarım — Çok Dosyalı Dalga (maestro deseni)

N dosyayı aynı anda göçürürken **paralel ajanlar `tr.ts`/`en.ts`'i AYNI ANDA düzenlerse çakışır**
(paylaşılan dosya). Doğru desen:

1. **Ajan yalnız kendi bileşenini düzenler** + yeni anahtarları **yapısal döndürür**
   (`{ keyName: { tr, en } }`); tr.ts/en.ts'e DOKUNMAZ.
2. **Orkestratör sözlükleri MERKEZİ birleştirir** (mevcut namespace'e key ekler / yeni alt-obje açar;
   çakışmaları yukarıdaki kuralla çözer).
3. **Merkezi kapı (orkestratör):** `pnpm run test:i18n` (parite) + her dosyada `eslint` (kalan literal=0)
   + `pnpm run type-check` (`en: typeof tr` parite-lock) + `pnpm test -- --run` (regresyon).
   **Her t('...') anahtarının sözlükte çözüldüğünü doğrula** (yoksa ham anahtar render eder = bug).
> Hazır makine ve script'ler: `docs/plans/i18n-jsx-literals-cleanup-2026-06-14.md` (parse/merge-generic/check + Workflow).

## Bileşende Kullanım

```tsx
import { useI18n } from '@/i18n/I18nProvider'
const { t, lang } = useI18n()
<h1>{t('products.heroTitle')}</h1>
{formatCurrency(1999.90, lang)}                 // ₺1.999,90 (TR) / ₺1,999.90 (EN) — '@/i18n/format'
{formatDate(iso, lang)}                          // 23 Ocak 2026 — '@/i18n/datetime'
```

## Doğrulama Checklist'i (canlı UI'da ASLA görünmemeli)

- [ ] **Ham anahtar sızıntısı yok**: `account.orderDetail.shippingMethod` gibi nokta-yollu metin görünmüyor (eksik key = `get()` ham path döner).
- [ ] Çözülmemiş placeholder yok: `{{variable}}`.
- [ ] `NaN` / `undefined` / `null` ham değer yok; boş çeviri anahtarı yok.
- [ ] Dil değişince TÜM görünen metin güncelleniyor; tarih/sayı formatı locale ile eşleşiyor.
- [ ] Hiç hardcoded Türkçe/İngilizce literal kalmadı (izinli semboller hariç).

## Strict TS & Otomasyon (enforcement)

- **Sözlük mühürleme:** `export const en: typeof tr = {…}` → eksik/fazla anahtar = `type-check` derlemeyi durdurur.
- **Autocomplete:** `I18nContext.ts` `TranslationKeys` recursive tipi; geçici için `TranslationKeyInput`.
- **Parite testi:** `src/i18n/__tests__/i18n.test.ts` (`pnpm run test:i18n`). lint-staged commit'te, `prebuild` build'de pariteyi zorlar.

## Sık Tuzaklar (sahada yakalandı)

- **Kullanılmayan `useI18n`:** Hook ekleyip `t`'yi kullanmamak → `unused-imports` ERROR. Gerçekten literal değiştirdiysen kullan; değiştirmediysen hook ekleme.
- **Sessiz eksik-anahtar:** `t('x.y')` eksikse tsc geçer (loose-string tipi) ama UI ham 'x.y' gösterir. **Sadece parite testi + eksik-key kontrolü yakalar** — atla­ma.
- **Template literal tuzağı:** `` {`metin`} `` kuralı GEÇMEZ, yakalanır. Sembol için bile dict kullan.
- **Çakışan duplicate key:** Mevcut anahtarı körce yeniden-tanımlama; obje literalinde duplicate key = son değer kazanır, sessiz UX değişimi.

## Hreflang (Uluslararası SEO — `/tr` & `/en`)

1. **Self-referencing** — her sayfa hreflang setinde kendini içerir.
2. **Reciprocal** — A→B varsa B→A da olmalı (yoksa Google ikisini de yok sayar).
3. **ISO kodları** — `en-GB` ✅ / `en-UK` ❌.
4. **x-default** — dil seçici veya varsayılan locale'e.
5. Hedef URL'ler 200 döner, canonical ile eşleşir. 10+ locale'de XML sitemap tercih.

```tsx
<link rel="alternate" hrefLang="tr" href="https://venthub.com/tr/urunler" />
<link rel="alternate" hrefLang="en" href="https://venthub.com/en/products" />
<link rel="alternate" hrefLang="x-default" href="https://venthub.com/tr/urunler" />
```
