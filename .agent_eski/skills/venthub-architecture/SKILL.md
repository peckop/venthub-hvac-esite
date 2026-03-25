---
name: venthub-architecture
description: Defines VentHub project structure, file organization, and component patterns. Use when creating new files, components, or understanding where code belongs.
---

# VentHub Architecture Skill

Bu skill, VentHub projesinin dosya yapısını ve kod organizasyonunu tanımlar.
Agent olarak yeni dosya oluştururken veya mevcut kodu nereye koyacağıma karar verirken bu kurallara uymalıyım.

## Proje Yapısı

```
venthub-hvac/
├── src/
│   ├── components/     # React bileşenleri (alt klasörlerle organize)
│   │   ├── navigation/ # Header, MegaMenu, Footer
│   │   ├── products/   # Ürün kartları, listeler, vitrinler
│   │   ├── admin/      # Admin panel bileşenleri
│   │   └── ui/         # Genel UI primitives (Button, Dialog, etc.)
│   ├── pages/          # Sayfa bileşenleri (route başına bir dosya)
│   │   ├── admin/      # Admin sayfaları
│   │   └── calculators/# Hesaplayıcı sayfaları
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React context providers
│   ├── lib/            # Utility libraries (supabase client, analytics)
│   ├── utils/          # Helper functions
│   ├── config/         # Configuration files (categoryRegistry, etc.)
│   ├── i18n/           # Internationalization (ayrı skill var)
│   └── types/          # TypeScript type definitions
├── supabase/
│   ├── migrations/     # SQL migrations (tarih prefix ile)
│   └── functions/      # Edge Functions
├── docs/               # Proje dokümantasyonu
├── scripts/            # Yardımcı scriptler (analiz, fix, vb.)
└── .agent/
    ├── skills/         # Agent yetenekleri (bu dosyalar)
    └── workflows/      # Adım adım iş akışları
```

## Dosya Adlandırma Kuralları

| Tür | Format | Örnek |
|-----|--------|-------|
| React Component | PascalCase.tsx | `ProductCard.tsx` |
| Page Component | PascalCase.tsx | `HomePage.tsx` |
| Hook | camelCase.ts, `use` prefix | `useCart.ts` |
| Utility | camelCase.ts | `formatCurrency.ts` |
| Config | camelCase.ts | `categoryRegistry.ts` |
| Migration | `YYYYMMDD_description.sql` | `20260120_fix_rls.sql` |

## Performans ve Render Standartları (90+ Puan Hedefi)

### 1. Server Components (RSC) Önceliği
- Tüm ana sayfalar (`page.tsx`) varsayılan olarak **Server Component** olmalıdır.
- Veri çekme işlemleri (Supabase RPC, getProducts vb.) doğrudan sunucu tarafında yapılmalıdır.
- `'use client'` direktifi sadece etkileşimli (buton, input, modal) uç bileşenlerde kullanılmalıdır.

### 2. SSR ve Streaming (Suspense)
- Ana rotalarda (`products`, `brands`, `home` vb.) `ssr: false` kullanımı KESİNLİKLE yasaktır.
- Ağır veri yüklemeleri için `React.lazy` yerine Next.js `dynamic` import ve mutlaka `Suspense` kullanılmalıdır.
- Her `Suspense` alanı için görsel bir `Skeleton` (İskelet) bileşeni tanımlanmalıdır.

### 3. Client-Side Bağımlılıkları (window/document)
- `window`, `document`, `localStorage` gibi objeler `'use client'` bileşenlerinde bile sadece `useEffect` içinde veya dinamik kontrollerle (`typeof window !== 'undefined'`) kullanılmalıdır.
- URL parametreleri yönetimi için `window.location` yerine `next/navigation` (`useSearchParams`, `usePathname`) kullanılmalıdır.

### 4. Layout Shift (CLS) Koruması
- Resimlere (`<Image />`) mutlaka `width` ve `height` (veya `aspect-ratio`) verilmelidir.
- Dinamik yüklenen alanlar için `min-h-[value]` (minimum yükseklik) rezerve edilmelidir.

### Örnek Bileşen Yapısı:
```tsx
import { useI18n } from '@/i18n/I18nProvider';

interface ProductCardProps {
  product: Product;
  onSelect?: (id: string) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const { t } = useI18n();
  
  return (
    <div className="rounded-lg border p-4">
      <h3>{product.name}</h3>
      <button onClick={() => onSelect?.(product.id)}>
        {t('common.getQuote')}
      </button>
    </div>
  );
}
```

## Karar Ağacı: Dosya Nereye Gider?

1. **Sayfa mı?** → `src/pages/`
2. **Tekrar kullanılabilir UI mi?** → `src/components/ui/`
3. **Ürünle ilgili mi?** → `src/components/products/`
4. **Admin panele özel mi?** → `src/components/admin/` veya `src/pages/admin/`
5. **Hook mu?** → `src/hooks/`
6. **Veritabanı değişikliği mi?** → `supabase/migrations/`
7. **Tek seferlik script mi?** → `scripts/`
