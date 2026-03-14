# Beyin Fırtınası (Brainstorm)
**Konu:** 72 Lighthouse Puanından 90+ Hedefine: Vite Mirasını Temizleme ve Next.js SSR Modernizasyonu

## Goal
Lighthouse Performans puanını 72'den **90+** seviyesine çıkarmak. LCP süresini 5.3s'den <2.5s'e, CLS puanını <0.1'e düşürmek.

## Constraints
- SEO 100 puanı korunmalı.
- Supabase/PostgreSQL RPC'leri ana veri kaynağı kalmalı.
- Mevcut i18n ve hesaplama mantığı bozulmamalı.

## Known context
- Proje Vite'den Next.js'e taşınmış ancak `ssr: false` ve `window` bağımlılıkları nedeniyle hala SPA gibi çalışıyor.
- PostgreSQL optimizasyonları yapıldı ama SSR olmadığı için frontend'e yansımıyor.
- `ProductsPage.tsx` dosyası çok ağır bir Client Component.

## Risks
- Hydration Mismatch hataları.
- URL parametreleri yönetiminde (window.location) yaşanabilecek kırılmalar.
- Eski kütüphanelerin Server Components uyumsuzluğu.

## Options (2-4)
1. **Incremental Refactor**: Mevcut `ProductsPage`i ufak yamalarla SSR uyumlu yapmaya çalışmak. (Düşük risk, orta kazanç).
2. **App Router / Server Component Migration**: Sayfayı Next.js App Router standartlarına (RSC) tamamen taşımak. (Yüksek kazanç, 90+ garanti).

## Recommendation
**Seçenek 2**. PostgreSQL tarafındaki hızın tarayıcıya yansıması için verinin sunucuda (Server Component) çekilmesi ve streaming/suspense kullanılması şarttır.

## Acceptance criteria
- Lighthouse Performance Score > 90.
- LCP < 2.5s.
- CLS < 0.1.
- Başarılı build ve `ssr: false` kullanımının kaldırılması.
