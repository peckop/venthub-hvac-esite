---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx
skeleton_hash: 4c35b083d08a3617
entity_hashes:
  func:FeaturedCommercialBlocks: 1889811721e866db
  func:normalizeImageUrl: e7ff2d52e57ce97b
  overview: e2b71b884b394ef9
  style_tokens: 0fba0ab3cddfc2f6
generated_at: 2026-06-06T21:54:49Z
---

## Genel Bakış
Bu modül, ana sayfada öne çıkan ticari ürünlere ait görsel ve bilgi bloklarını sergileyen bir React bileşenini tanımlar. Görsel URL'lerinin güvenli bir şekilde işlenmesini sağlayan bir yardımcı fonksiyon ile birlikte, ürün listesini alıp kullanıcıya düzenli bir şekilde sunar.

## Fonksiyon Grupları
### Yardımcı İşlevler
Görsel adreslerinin boş veya geçersiz olma durumlarını temizleyerek, kullanıma hazır standart bir URL formatı üretir.
- normalizeImageUrl

### Ana Bileşen
Ürün verisini alarak, öne çıkan ticari ürünleri görsel ve ilgili bilgileriyle birlikte düzenler ve ekranda render eder; başlangıç verisi eksikse varsayılan boş bir liste kullanır.
- FeaturedCommercialBlocks

---

## AXIOMS – Mimari Varsayımlar

Bu modül için, yalnızca fonksiyon imzasından türetilebilen mimari varsayımlar aşağıdadır.

**[Aksiyom 1]**: Eğer `normalizeImageUrl` fonksiyonuna `null` veya `undefined` değeri verilirse, fonksiyon geçerli bir görsel URL'si döndüremeyebilir — bu durumda çağrının bir fallback mekanizması (örn: varsayılan bir görsel) kullanması beklenir.

**[Aksiyom 2]**: Eğer `FeaturedCommercialBlocks` bileşeni `initialProducts` parametresi olmadan çağrılırsa, bileşen boş bir dizi (`[]`) ile çalışacak şekilde varsayılan değer kullanır.

**[Aksiyom 3]**: Eğer `FeaturedCommercialBlocks` bileşenine geçersiz veya bozuk bir `initialProducts` verisi (örn: `null`, `undefined`, veya dizi olmayan bir değer) aktarılırsa, bileşen hata verebilir veya beklenmeyen davranış gösterebilir.

---

**Not:** Modül sabitleri kısmında herhangi bir sabit tanımlı değildir. Eski dokümandaki domain-specific bilgiler (eşik değerleri, kabul kriterleri vb.) bu aksiyomlara dahil edilmemiştir, çünkü bu bilgiler fonksiyon gövdesinden türetilememektedir.

---

## FONKSİYON DETAYLARI

### normalizeImageUrl

**Ne yapar**: Verilen URL değerini standart ve kullanılabilir bir forma dönüştürür. Boş, undefined veya geçersiz URL durumlarında varsayılan bir placeholder görsel döndürerek bileşenlerin hata almasını engeller.

**Nasıl yapar**: Fonksiyon, gelen url parametresinin null veya undefined olup olmadığını kontrol eder. Eğer geçerli bir URL varsa bunu doğrudan döndürür. Boş veya tanımsız durumlarda ise önceden tanımlanmış varsayılan bir görsel yolunu string olarak geri verir.

**Parametreler**:
- `url`: `string | null | undefined` — Normalize edilecek görsel URL'si. Null veya undefined olabilir.

**Dönüş**: `string` — Normalize edilmiş geçerli bir görsel URL'si döndürür.

### FeaturedCommercialBlocks
**Ne yapar**: Başlangıç ürün listesi ile öne çıkan ticari blokları gösteren bir React bileşenidir.  
**Nasıl yapar**: `initialProducts` prop'u üzerinden ürün verisini alır, içeriği render eder; varsayılan olarak boş bir dizi kullanılır.  
**Parametreler**:  
- initialProducts: [] — Gösterilecek ürünlerin listesi; varsayılan değer boş dizidir.  
**Dönüş**: React.FC<FeaturedCommercialBlocksProps> — Özellikleri alarak UI'ı oluşturan fonksiyonel bileşen.

---

## INTERFACES

### FeaturedCommercialBlocksProps
- `initialProducts?: Product[]`
- `initialCategories?: Category[]`

---

## TYPE ALIASES

### CommercialTab
```typescript
type CommercialTab = 'featured' | 'newArrivals' | 'bestSellers'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx::normalizeImageUrl
- **params**: (url: string | null | undefined)
- **ic_degiskenler**:
  - `trimmedUrl` — URL parametresinin boşlukları temizlenmiş hali;startsWith kontrolleri için kullanılır
- **Dönüş**: string — normalize edilmiş URL (başına '/' eklenmiş veya doğrudan kullanılmış)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx::FeaturedCommercialBlocks
- **params**: ({ initialProducts = [] }) — başlangıç ürünleri listesi, varsayılan boş dizi
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, Tüm metinler için kullanılır
  - `activeTab` — useState hook'u ile oluşturulan aktif sekme durumu (commercial tab tipinde)
  - `productsByTab` — useMemo hook'u ile hesaplanan sekelere göre gruplandırılmış ürünler nesnesi
  - `activeProducts` — productsByTab nesnesinden activeTab anahtarına erişilerek elde edilen aktif ürün listesi
- **Dönüş**: React.FC bileşeni (JSX)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx::productsByTab useMemo callback
- **params**: () — parametre yok (useMemo callback'i)
- **ic_degiskenler**:
  - `featured` — is_featured flag'i olan veya ilk 4 üründen fallback yapılan öne çıkan ürünler dizisi
  - `newArrivals` — created_at tarihine göre sıralanmış yeni gelen ürünler dizisi (en fazla 4)
  - `bestSellers` — en çok satanlar için fallback ürün listesi (dizinin 4-8 arası veya ilk 4'ü)
- **Dönüş**: { featured: Product[], newArrivals: Product[], bestSellers: Product[] }

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx::tabButton render callback
- **params**: (tab) — sekmeyi temsil eden string
- **ic_degiskenler**: yok — sadece parametre ve dış scope değişkenleri kullanılır
- **Dönüş**: JSX — tekil tab butonu elementi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx::productCard render callback
- **params**: (product: Product, idx: number) — ürün nesnesi ve indeks
- **ic_degiskenler**: yok — sadece parametreler ve dış scope bileşenleri kullanılır
- **Dönüş**: JSX — animasyonlu ürün kartı wrapper elementi

---

## NODE ID STANDARD

  file: src\components\home\FeaturedCommercialBlocks.tsx
  function: src\components\home\FeaturedCommercialBlocks.tsx::normalizeImageUrl
  function: src\components\home\FeaturedCommercialBlocks.tsx::FeaturedCommercialBlocks

---

## DISA AKTARILANLAR (EXPORTS)
  export: FeaturedCommercialBlocks
  export: normalizeImageUrl

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-cyan-500/10`, `bg-slate-200/50`, `bg-slate-900`, `bg-slate-950`, `bg-white`, `bg-white/5`, `border-cyan-500/10`, `border-slate-200`, `border-white/10`, `border-white/5`, `hover:bg-cyan-400`, `hover:text-slate-900`, `sm:text-6xl`, `text-4xl`
- **Layout:** `absolute`, `backdrop-blur-sm`, `flex`, `flex-col`, `gap-1`, `gap-10`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `grid-cols-2`, `h-1.5`, `h-32`
- **Varyant/Responsive:** `:`, `active:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `===`, `active:scale-95`, `activeTab`, `animate-pulse`, `aspect-square`, `blur-3xl`, `border`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `font-light`, `grayscale`