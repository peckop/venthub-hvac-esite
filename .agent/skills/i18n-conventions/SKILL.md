---
name: i18n-conventions
description: Defines internationalization (i18n) conventions for VentHub. Use when
  translating text, updating dictionary files, adding/modifying JSX labels, or performing
  i18n dictionary updates. Do NOT use for styling fonts, database operations, or running
  test suites.
category: guards
metadata:
  triggers:
  - metin ekle
  - çeviri yap
  - i18n
  - dictionary update
  inputs:
  - JSX text string
  outputs:
  - tr.ts / en.ts updates
  - Routes usage
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# i18n Conventions Skill

Bu skill, VentHub'ın çok dilli (TR/EN) yapısını ve çeviri ekleme kurallarını tanımlar.
Agent olarak UI'a yeni metin eklerken bu kurallara uymalıyım.

## Temel Prensipler

1. **Hardcoded string YASAK** — Tüm kullanıcıya görünen metinler i18n üzerinden gelmeli
2. **Türkçe öncelikli** — `tr.ts` ana sözlük, `en.ts` çeviri
3. **Hiyerarşik anahtarlar** — `section.subsection.key` formatı
4. **Proxy Hook Zorunluluğu:** Geliştiricilerin ve ajanların URL'leri elle birleştirmesi tamamen yasaktır. Rotalar kesinlikle `useLocalizedRoutes` hook'u üzerinden `Routes.category()` şeklinde çağrılmalıdır. Manuel string birleştirme (`/${lang}/...`) mimari ihlaldir.
5. **JSONB Veri Çevirisi Kuralı:** Veritabanı tablolarında (categories, products) çeviri için ayrı ilişkisel (relational) tablolar oluşturulması yasaktır. Dil verisi kesinlikle JSONB (`metadata->>lang`) formatında tutulmalıdır.

## Dosya Yapısı

```
src/i18n/
├── I18nProvider.tsx    # Provider ve useI18n hook
├── I18nContext.ts      # Context tanımı
├── format.ts           # Para formatı (formatCurrency)
├── datetime.ts         # Tarih formatı (formatDate, formatDateTime)
└── dictionaries/
    ├── tr.ts           # Türkçe sözlük (ana)
    └── en.ts           # İngilizce sözlük
```

## Anahtar Ekleme Kuralları

### Hiyerarşi Yapısı
```typescript
// ✅ DOĞRU: Hiyerarşik, anlamlı
products: {
  itemsListed: "ürün listeleniyor",
  filters: {
    priceRange: "Fiyat Aralığı"
  }
}

// ❌ YANLIŞ: Düz, belirsiz
productsItemsListed: "...",
priceRange: "..."
```

### Mevcut Bölümler (Örnekler)
| Bölüm | Kullanım |
|-------|----------|
| `common` | Genel: butonlar, navigasyon, loading |
| `products` | Ürün listesi, filtreleme |
| `home` | Ana sayfa blokları |
| `admin` | Admin panel tüm metinleri |
| `admin.orders` | Sipariş yönetimi |
| `admin.products` | Ürün yönetimi |
| `category` | Kategori sayfası |
| `knowledge` | Bilgi merkezi |

## Kullanım Örnekleri

### Bileşende Kullanım
```tsx
import { useI18n } from '@/i18n/I18nProvider';

function MyComponent() {
  const { t, lang } = useI18n();
  
  return (
    <div>
      <h1>{t('products.heroTitle')}</h1>
      <button>{t('common.getQuote')}</button>
    </div>
  );
}
```

### Para Formatı
```tsx
import { formatCurrency } from '@/i18n/format';

// Çıktı: "₺1.999,90" (TR) veya "₺1,999.90" (EN)
formatCurrency(1999.90, lang);
```

### Tarih Formatı
```tsx
import { formatDate, formatDateTime } from '@/i18n/datetime';

// formatDate: "23 Ocak 2026"
// formatDateTime: "23 Ocak 2026, 14:30"
```

## Yeni Metin Ekleme Adımları

1. **Anahtar belirle**: Mevcut hiyerarşiye uygun isim seç
2. **`tr.ts`'ye ekle**: Türkçe metni yaz
3. **`en.ts`'ye ekle**: İngilizce çevirisini yaz
4. **Bileşende kullan**: `t('section.key')` ile çağır

### Örnek: Yeni Buton Ekleme
```typescript
// src/i18n/dictionaries/tr.ts
common: {
  // ... mevcut anahtarlar
  compareProducts: "Ürünleri Karşılaştır",  // YENİ
}

// src/i18n/dictionaries/en.ts
common: {
  // ... mevcut anahtarlar
  compareProducts: "Compare Products",  // YENİ
}

// Bileşende
<button>{t('common.compareProducts')}</button>
```

## Karar Ağacı: Anahtar Nereye Gider?

1. **Genel UI elementi mi?** (buton, başlık) → `common`
2. **Admin panele özel mi?** → `admin.{module}`
3. **Belirli bir sayfaya özel mi?** → `{pageName}` (örn: `category`, `products`)
4. **Form alanı mı?** → `{module}.form` veya `{module}.edit`
5. **Hata mesajı mı?** → `{module}.errors` veya `{module}.toasts`

## ⚠️ Dikkat Edilmesi Gerekenler

- Aynı metin farklı yerlerde kullanılıyorsa `common` altına al
- Dinamik değerler için `{{placeholder}}` kullan: `"{{count}} ürün"`
- Çoğul formlar için ayrı anahtar: `item` vs `items`

## Hreflang Kuralları (Uluslararası SEO)

VentHub `/tr` ve `/en` yolları kullandığı için hreflang düzgün uygulanmalıdır:

1. **Self-referencing zorunlu** — Her sayfa hreflang setinde kendini içermeli
2. **Reciprocal links** — A→B varsa B→A da olmalı (yoksa Google ikisini de yok sayar)
3. **ISO kodları** — `en-GB` ✅ | `en-UK` ❌ (ISO 3166-1 Alpha 2)
4. **x-default** — Dil seçici veya varsayılan locale'e yönlenmeli
5. **Hedef URL'ler** — Tümü 200 dönmeli, canonical ile eşleşmeli
6. **Yerleştirme** — HTML `<link>`, HTTP Header veya XML Sitemap (10+ locale'de sitemap tercih)

```tsx
// layout.tsx veya head bileşeninde
<link rel="alternate" hreflang="tr" href="https://venthub.com/tr/urunler" />
<link rel="alternate" hreflang="en" href="https://venthub.com/en/products" />
<link rel="alternate" hreflang="x-default" href="https://venthub.com/tr/urunler" />
```

## i18n Doğrulama Checklist'i (Canlı Ortam)

UI'da aşağıdaki hatalar asla görünmemelidir:

- [ ] Ham anahtar sızıntısı yok: `t('key')`, `('key')`, `KEY 'FOO.BAR'`
- [ ] Çözülmemiş placeholder yok: `{{variable}}`, `{variable}`
- [ ] Tarih/sayı formatı aktif locale ile eşleşiyor
- [ ] Dil değiştirince tüm görünen metin güncelleniyor
- [ ] `"NaN"`, `"undefined"`, `"null"` gibi ham değerler UI'da yok
- [ ] Boş çeviri anahtarı yok (anahtar var ama değer boş string)

## Strict TypeScript Güvenliği & Otomasyon Standartları

VentHub projesi enterprise seviyesinde dil güvenliğini sağlamak için şu iki mekanizmayı zorunlu tutar:

### 1. Sözlük Mühürleme (Type-Locking)
* **İngilizce Sözlük (`en.ts`)** mutlaka Türkçe sözlüğün (`tr.ts`) tipini implemente etmelidir:
  ```typescript
  import { tr } from './tr'
  export const en: typeof tr = { ... }
  ```
  Bu sayede herhangi bir dilde eksik veya fazla anahtar bırakılması durumunda TypeScript derleyicisi (`pnpm run type-check`) doğrudan derlemeyi durduracaktır.

### 2. Autocomplete & nested key desteği
* `src/i18n/I18nContext.ts` içerisindeki `TranslationKeys` recursive tipi sayesinde `t()` fonksiyonuna yazılan anahtarlar kod editöründe otomatik tamamlanmalıdır.
* Geçici dönüşümler için `TranslationKeyInput` tipi kullanılır.

### 3. Otomatik Parite Testleri
* Dil dosyaları arasındaki uyumu denetlemek için yazılmış olan `src/i18n/__tests__/i18n.test.ts` testi her zaman çalışabilir olmalıdır.
* Geliştirme sürecinde pariteyi bozacak bir değişiklik yapıldığında:
  - Git Commit atılırken (`lint-staged` sayesinde otomatik tetiklenir) commit engellenir.
  - Proje derlenirken (`package.json`'daki `prebuild` hook'u sayesinde otomatik tetiklenir) build engellenir.
* Manuel çalıştırmak için: `pnpm run test:i18n` kullanılabilir.
