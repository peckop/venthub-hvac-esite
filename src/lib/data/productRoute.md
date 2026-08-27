---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\data\productRoute.ts
skeleton_hash: ed3e1fcf21773c7e
entity_hashes:
  func:resolveProductRoute: 69c463e1d31d1e03
  overview: 3ce8abad1f29d75f
generated_at: 2026-08-27T06:57:29Z
---

## Genel Bakış
Bu modül, verilen bir ürün tanımlayıcısı (slug) ve dil parametresine göre ürün rotasını çözümlemekten sorumludur. Tek bir asenkron fonksiyon içerir ve dış bağımlılıklarını bir bağımlılık nesnesi aracılığıyla alır.

## Fonksiyon Grupları

### Ürün Rota Çözümleme
Verilen slug ve dil bilgisine karşılık gelen ürün rotasını çözümleyerek bir çözüm sonucu döndürür. Bağımlılıklar, fonksiyona dışarıdan enjekte edilir.
- resolveProductRoute

## Bağımlılıklar

### Dış Bağımlılıklar
- `ProductRouteDeps`: Fonksiyonun çalışması için gerekli dış bağımlılıkları tanımlayan arayüz. Fonksiyona parametre olarak dışarıdan sağlanır; modül kendi başına bu bağımlılıkları oluşturmaz.

### Çıktı Tipleri
- `ProductRouteResolution`: Rota çözümleme sonucunu temsil eden veri yapısı.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, davranışsal aksiyom üretilememektedir. Aşağıdakiler yalnızca imzadan çıkarılabilen minimal varsayımlardır:

**[Aksiyom 1]**: Eğer `slug` parametresi sağlanmazsa, fonksiyon hangi ürünü çözeceğini bilemez ve `ProductRouteResolution` üretilemez.

**[Aksiyom 2]**: Eğer `lang` parametresi sağlanmazsa, hangi dilde çözümleme yapılacağı belirlenemez.

**[Aksiyom 3]**: Eğer `deps` parametresi sağlanmazsa, fonksiyonun bağımlılıklara (veri erişimi, servisler vb.) erişimi olmaz ve çalışması beklenemez.

**[Aksiyom 4]**: Eğer `ProductRouteDeps` yapısı beklenen üyeleri içermiyorsa, fonksiyonun hangi davranışı sergileyeceği bilinmiyor (fonksiyon gövdesi mevcut değil).

---

## FONKSİYON DETAYLARI

### resolveProductRoute
**Ne yapar**: Verilen bir slug ve dil bilgisine göre ürün rotasını çözümleyerek, bu slug'ın bir aile (family) detay sayfası mı, seri landing sayfası mı, bir varyant yönlendirmesi mi olduğunu ya da bulunamadı/hizmet dışı durumunu belirler. Sonuç olarak beş farklı `kind` değerinden birini taşıyan bir `ProductRouteResolution` nesnesi döndürür.

**Nasıl yapar**: Fonksiyon dört aşamalı bir öncelik zinciriyle çalışır. İlk olarak `deps.familyDetail` çağrılarak aile detay bilgisi getirilir; eğer aile mevcutsa ve varyant listesi boş değilse `{ kind: 'family', detail }` döndürülür. Aile bulunamaz ya da varyant listesi boşsa ikinci aşamada `deps.seriesLanding` ile seri landing sayfası aranır; bulunursa `{ kind: 'series', landing }` döndürülür. Üçüncü aşamada `deps.variantBySlug` ile slug'ın bir varyanta ait olup olmadığı kontrol edilir; eğer varyantın bir `family_id` değeri varsa `deps.familySlugById` ile aile slug'ı alınır ve bu slug mevcut slug'dan farklıysa, `localizedHref` ve `Routes.product` kullanılarak dil öneki elle eklenmeden kanonik aile URL'ine 308 yönlendirmesi oluşturulur; yönlendirme URL'ine varyantın SKU'su `?sku=` sorgu parametresi olarak eklenir. Dördüncü aşamada hiçbir eşleşme bulunamazsa `{ kind: 'not-found' }` döndürülür. Tüm bu süreç bir `try-catch` bloğu içinde sarılıdır; yakalanan hata `fetch failed` mesajı içeriyorsa ortam değişkeni eksikliğine işaret eden bir uyarı yazdırılır, diğer hatalar için genel bir uyarı basılır ve her iki durumda da `{ kind: 'unavailable' }` döndürülür.

**Parametreler**:
- slug: string — Çözümlenmek istenen ürün slug değeri. URL'den gelen ve aile, seri ya da varyant olabilen tanımlayıcıdır.
- lang: string — İstenen dil kodu. Yönlendirme URL'inde dil öneki oluşturmak için `localizedHref` fonksiyonuna iletilir.
- deps: ProductRouteDeps — Fonksiyonun dış bağımlılıklarını içeren nesne. `familyDetail`, `seriesLanding`, `variantBySlug` ve `familySlugById` fonksiyonlarını barındırır; bu fonksiyonlar veri katmanından veri çeker ve test edilebilirlik için dışarıdan enjekte edilir.

**Dönüş**: Promise\<ProductRouteResolution\> — Asenkron olarak çözümlenen rotayı temsil eden discriminated union yapısı. `kind` alanına göre beş farklı durum taşır: `'family'` (aile detay bilgisiyle birlikte), `'series'` (seri landing sayfasıyla birlikte), `'redirect'` (hedef URL ile birlikte), `'not-found'` (hiçbir eşleşme yok) ve `'unavailable'` (hata nedeniyle hizmet dışı).

---

## İTHALATLAR (IMPORTS)
- import: @/lib/services/family.service::type { FamilyDetail, SeriesLanding }
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref

---

## INTERFACES

### ProductRouteDeps
- `familyDetail: (slug: string, lang: string) => Promise<FamilyDetail | null>`
- `seriesLanding: (slug: string) => Promise<SeriesLanding | null>`
- `variantBySlug: (slug: string) => Promise<{ sku: string; family_id: string | null } | null>`
- `familySlugById: (familyId: string) => Promise<string | null>`

---

## TYPE ALIASES

### ProductRouteResolution
T138-VH K1 — `/[lang]/products/[slug]` çözüm zinciri (saf karar katmanı). Zincir sayfanın içinde inline yaşıyordu ve test edilemiyordu; model katmanıyla birlikte dallanma sayısı ikiye katlandığı için karar buraya, veri erişiminden AYRIK bir yere alındı. Sayfa yalnız sonucu uygular (`permanentRedirec
```typescript
type ProductRouteResolution = | { kind: 'family'; detail: FamilyDetail }
  | { kind: 'series'; landing: SeriesLanding }
  | { kind: 'redirect'; to: string }
  | { kind: 'not-found' }
  | { kind: 'unavailable' }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/data/productRoute.ts::resolveProductRoute
- **params**:
  - `slug` — string; çözümlenecek ürün/family/seri slug'ı
  - `lang` — string; dil kodu (ör. "tr", "en")
  - `deps` — ProductRouteDeps; bağımlılık enjeksiyon nesnesi (aşağıda erişilen alt alanlarıyla)
- **ic_degiskenler**:
  - `detail` — `deps.familyDetail(slug, lang)` çağrısının dönüşü; FamilyDetail tipinde. `detail.variants.length > 0` kontrolüyle aktif varyantı olan aile olup olmadığı sınanır
  - `landing` — `deps.seriesLanding(slug)` çağrısının dönüşü; SeriesLanding tipinde. Seri landing sayfası bulunursa truthy olur
  - `variant` — `deps.variantBySlug(slug)` çağrısının dönüşü. Varyant slug eşleşmesi aranır; `variant?.family_id` ile optional chaining yapılır
  - `familySlug` — `deps.familySlugById(variant.family_id)` çağrısının dönüşü; varyantın ait olduğu ailenin slug'ı. `familySlug !== slug` kontrolüyle gereksiz redirect engellenir
  - `base` — `localizedHref(Routes.product(familySlug), lang)` çağrısının dönüşü; dile göre öneklenmiş kanonik aile URL'i. Elle dil öneki eklenmez, SSOT `localizedHref` kullanılır
  - `err` — catch bloğundaki `unknown` tipinde yakalanan hata nesnesi
  - `message` — `err instanceof Error` ise `err.message`, aksi halde `String(err)` ile üretilen hata mesajı string'i. `'fetch failed'` içerip içermediği kontrol edilerek farklı uyarı mesajı basılır
- **deps erişimleri**:
  - `deps.familyDetail(slug, lang)` — aile detayını getirir; varyant listesi boşsa PDP soft-404'e düşmemek için reddedilir
  - `deps.seriesLanding(slug)` — seri landing sayfasını getirir
  - `deps.variantBySlug(slug)` — slug'dan varyant kaydını getirir
  - `deps.familySlugById(variant.family_id)` — varyantın `family_id`'sinden aile slug'ını getirir
- **diger_cagrilanlar**:
  - `localizedHref` — `@/utils/routes` modülünden import; dil önekli URL üretir
  - `Routes.product(familySlug)` — `@/utils/routes` modülünden import; aile slug'ından ürün sayfası yolunu üretir
  - `encodeURIComponent(variant.sku)` — varyant SKU'sunu URL-safe hale getirir
  - `console.warn(...)` — hata durumlarında tarayıcı/sunucu konsoluna uyarı basar
- **Dönüş**: `Promise<ProductRouteResolution>` — beş farklı `kind` dalı:
  - `{ kind: 'family', detail }` — aktif varyantı olan aile bulundu
  - `{ kind: 'series', landing }` — seri landing sayfası bulundu
  - `{ kind: 'redirect', to: string }` — varyant slug'ı kanonik aile URL'ine 308 yönlendirmesi; `to` değeri `${base}?sku=${encodeURIComponent(variant.sku)}`
  - `{ kind: 'not-found' }` — ne aile, ne seri, ne varyant eşleşmedi
  - `{ kind: 'unavailable' }` — yakalanan hata nedeniyle servis kullanılamıyor

---

## NODE ID STANDARD

  file: src\lib\data\productRoute.ts
  function: src\lib\data\productRoute.ts::resolveProductRoute

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductRouteDeps
  export: ProductRouteResolution
  export: resolveProductRoute