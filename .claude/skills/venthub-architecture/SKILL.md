---
name: venthub-architecture
description: Defines VentHub architecture, component patterns, and Next.js App Router
  rules. Trigger for creating new components (yeni bileşen oluştur), React Server
  Components (RSC render), or PPR configuration (PPR config). Do NOT use for git commands,
  database resets, or running unit tests.
category: guards
metadata:
  triggers:
  - yeni bileşen oluştur
  - RSC render
  - PPR config
  inputs:
  - code design query
  outputs:
  - architecture compliance guidelines
depends_on: []
next_steps:
- venthub-auditor
run_last: false
exclusions: []
---

# VentHub Architecture Skill

Bu skill, VentHub projesinin dosya yapısını ve kod organizasyonunu tanımlar.
Agent olarak yeni dosya oluştururken veya mevcut kodu nereye koyacağıma karar verirken bu kurallara uymalıyım.

## Proje Yapısı

Dizin yapısı ve "yeni dosya nereye?" kararının SSOT'u = **CLAUDE.md** (her oturumda yüklü).

Özet: rota → `src/app/` (`page.tsx` = RSC) · sayfa görünümü → `src/views/` · tekrar kullanılır UI →
`src/components/` · veri/servis → `src/lib/services/` (DI) · hook → `src/hooks/` · DB → `supabase/migrations/`.

## Dosya Adlandırma Kuralları

| Tür | Format | Örnek |
|-----|--------|-------|
| React Component | PascalCase.tsx | `ProductCard.tsx` |
| Rota dosyası (`app/`) | küçük harf, Next.js konvansiyonu | `page.tsx`, `layout.tsx` |
| Sayfa görünümü (`views/`) | PascalCase.tsx | `CategoryMasterView.tsx` |
| Hook | camelCase.ts, `use` prefix | `useCart.ts` |
| Utility | camelCase.ts | `formatCurrency.ts` |
| Config | camelCase.ts | `categoryRegistry.ts` |
| Migration | `YYYYMMDD_description.sql` | `20260120_fix_rls.sql` |

## Performans ve Render Standartları (90+ Puan Hedefi)

1. **Server Components (RSC) Önceliği:** Tüm ana sayfalar (`page.tsx`) varsayılan olarak **Server Component** olmalıdır. Veri çekme işlemleri (Supabase RPC, getProducts vb.) doğrudan sunucu tarafında yapılmalıdır. `'use client'` direktifi sadece etkileşimli (buton, input, modal) uç bileşenlerde kullanılmalıdır.
2. **SSR ve Streaming (Suspense):** Ana rotalarda (`products`, `brands`, `home` vb.) `ssr: false` kullanımı KESİNLİKLE yasaktır. Ağır veri yüklemeleri için `React.lazy` yerine Next.js `dynamic` import ve mutlaka `Suspense` kullanılmalıdır. Her `Suspense` alanı için görsel bir `Skeleton` (İskelet) bileşeni tanımlanmalıdır.
3. **Client-Side Bağımlılıkları:** `window`, `document`, `localStorage` gibi objeler `'use client'` bileşenlerinde bile sadece `useEffect` içinde veya dinamik kontrollerle (`typeof window !== 'undefined'`) kullanılmalıdır. URL parametreleri yönetimi için `window.location` yerine `next/navigation` (`useSearchParams`, `usePathname`) kullanılmalıdır.
4. **Layout Shift (CLS) Koruması:** Resimlere (`<Image />`) mutlaka `width` ve `height` (veya `aspect-ratio`) verilmelidir. Dinamik yüklenen alanlar için `min-h-[value]` (minimum yükseklik) rezerve edilmelidir.
5. **Hibrit PPR (Partial Prerendering) Sınırları:** Arama, filtreleme gibi sayfalarda `useSearchParams` hook'unu kullanan tüm bileşenler kesinlikle ve istisnasız `<Suspense fallback={<ProductGridSkeleton />}>` sınırı içerisine alınmalıdır. useSearchParams'ın direkt sayfa kabuğuna sızması engellenerek SSR zehirlenmesi önlenir.
6. **Adaptör (Adapter) Deseni ve Saf Metrik Motor Kuralı:** Uygulamanın çekirdek mühendislik hesaplamalarını barındıran `src/lib/hvacCalculations.ts` gibi saf (pure) fonksiyonların iç mantığına emperyal birim (CFM, Fahrenheit, in-wg vb.) dönüşümleri KESİNLİKLE eklenemez. Yabancı ölçü birimi gereksinimleri, UI katmanı ile iş mantığı katmanı arasına çekilecek bir `useEngineeringAdapter` gibi bir "Gateway" hook'u üzerinden (Adaptör Deseni ile) çözülmelidir.

## SEO Mimari Kuralları

### JSON-LD Schema Markup
E-ticaret sayfalarında aşağıdaki yapılandırılmış veriler zorunludur:

| Sayfa Türü | Schema Tipi | Gerekli Alan |
|------------|-------------|--------------|
| Ana sayfa | Organization + WebSite | name, url, logo |
| Ürün sayfası | Product | name, image, offers (price, currency, availability) |
| Kategori | BreadcrumbList | itemListElement |
| Blog/Bilgi | Article | headline, image, datePublished, author |

### SSR Zorunluluğu
- Schema markup ve meta etiketleri Server Component veya generateMetadata ile render edilmelidir.
- CSR-only sayfalar botlara boş HTML gösterir → SEO sıfırdır.

### Canonical URL Tutarlılığı
- www vs non-www: tek bir tercih ve yönlendirme
- Trailing slash tutarlılığı
- HTTP → HTTPS yönlendirmesi zorunludur
