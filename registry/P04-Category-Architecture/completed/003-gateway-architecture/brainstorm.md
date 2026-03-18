# Brainstorm: 003-gateway-architecture

## 🎯 Hedef
800 satırlık `CategoryPage.tsx` monolitini parçalayarak; veri yönetimi (Gateway) ve görselleştirme (View) katmanlarını birbirinden ayırmak.

## 🛡️ Risk Analizi & Teknik Bariyerler
- **Next.js 15 Async Params:** Sayfa parametreleri artık Promise. Gateway katmanında bu parametrelerin `await` edilerek çözülmesi ve alt bileşenlere (sub-views) senkron olarak aktarılması kritik.
- **LCP (Largest Contentful Paint):** Sayfa parçalandığında, ana görselin (Hero) geç yüklenmemesi için `CategoryHero` bileşeninin Server Component dostu tutulması gerekiyor.
- **Props Drilling vs Context:** Filtreler (airflow, pressure vb.) çok fazla state içeriyor. Sub-view'lara prop geçmek yerine, sadece kategori bazlı bir `CategoryProvider` düşünülmeli mi? Şimdilik mimariyi temiz tutmak için "Component Composition" denenecek.
- **Edge Runtime:** Cloudflare üzerinde koşacak bu yeni yapının Node.js bağımlılığı içermemesi gerekiyor.

## 💡 Mimari Seçenekler
- **Option 1: Custom Hook (Gateway):** `useCategoryGateway` oluşturulur. Veri çekme ve filtreleme burada toplanır. `CategoryPage.tsx` sadece bu hook'u çağırıp doğru View'a (`GridView`, `ShowcaseView` vb.) yönlendirme yapar.
- **Option 2: Server Component Gateway:** Next.js 15'in gücünü kullanıp veriyi sunucuda çekmek. Ancak mevcut filtreleme mantığı (fiyat aralığı, teknik spec'ler) yoğun "Client-side" etkileşim gerektiriyor.

## 🏆 Karar: Gateway + Sub-Views (Composition)
- **Gateway:** `src/views/CategoryPage.tsx` bir "Dispatcher" olacak.
- **Logic:** `src/hooks/useCategoryGateway.ts` tüm veri ve filtreleme işini üstlenecek.
- **Views:** `src/views/category/` altında 3 ana görünüm (Grid, Showcase, Landing) modüler hale getirilecek.

## ✅ Başarı Kriterleri
- `CategoryPage.tsx` dosyası 150 satırın altına inmeli.
- Kategori bazlı SEO (JSON-LD) tüm görünümlerde sorunsuz çalışmalı.
- Filtreleme hızı ve LCP performansı %20 iyileşmeli.
