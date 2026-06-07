---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx
skeleton_hash: abdf7c719afe9daf
entity_hashes:
  func:FeaturedCommercialBlocks: 1889811721e866db
  overview: 1af19abb15edd41e
  style_tokens: 0fba0ab3cddfc2f6
generated_at: 2026-06-07T19:51:14Z
---

## Genel Bakış
Bu modül, ana sayfada öne çıkan ticari ürünleri görselleri ve temel bilgileriyle birlikte sergileyen bir React bileşenidir. Ürün listesini düzenleyerek kullanıcıya sunmanın yanı sıra, görsel URL'lerinin geçerli ve kullanıma hazır olmasını sağlayan bir yardımcı işlevi de içerir.

## Fonksiyon Grupları
### Görsel İşleme Yardımcıları
Boş veya geçersiz görsel URL değerlerini temizleyerek, bileşenin kullanabileceği güvenli ve standart bir URL formatı üretir.
- normalizeImageUrl

### Ana Görünüm Bileşeni
Öne çıkan ticari ürünleri, verilen başlangıç verisine göre alıp düzenler ve kullanıcıya görselleriyle birlikte sunar; veri eksikse varsayılan boş liste ile çalışır.
- FeaturedCommercialBlocks

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ana sayfada öne çıkan ticari ürün bloklarını sergileyen bir React bileşenidir.

**[Aksiyom 1]**: Eğer `initialProducts` prop'u array türünde bir değer olarak sağlanmazsa, bileşen varsayılan boş dizi `[]` ile başlatılır ve render edilecek ürün bloğu bulunmaz.

**[Aksiyom 2]**: Eğer `initialProducts` içindeki herhangi bir ürün nesnesi görsel URL bilgisi içermiyorsa veya geçersiz bir URL sağlıyorsa, `normalizeImageUrl` yardımcı fonksiyonu bu durumu temizleyerek standart bir URL formatı üretmek zorundadır; aksi takdirde render edilen görsel bileşeni kırılır.

**[Aksiyom 3]**: Eğer `initialProducts` boş dizi olarak kalırsa (hiç ürün sağlanmazsa), bileşen öne çıkan ürün bloklarını gösteren bölümü boş/hiç render etmelidir; bileşen çökmemeli veya hata fırlatmamalıdır.

**[Aksiyom 4]**: Eğer `normalizeImageUrl` fonksiyonu boş string (`""`) veya `null`/`undefined` değer alırsa, bileşenin görsel gösterim zinciri bozulmadan çalışacak şekilde bir fallback mekanizması sunmalıdır.

**[Aksiyom 5]**: Eğer `initialProducts` dizisindeki ürünlerin görsel alanı bir external (harici) URL ile sağlanıyorsa, bu URL'lerin scheme'i (http/https) geçerli olmalıdır; aksi takdirde `normalizeImageUrl` düzeltme yapamaz ve görsel yüklenemez.

---

## FONKSİYON DETAYLARI

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

### [N1_NASIL] AST Pointer: FeaturedCommercialBlocks.tsx::FeaturedCommercialBlocks
- **params**: (initialProducts = [])
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, farklı locale anahtarlarını çevirerek UI metinlerini oluşturur
  - `activeTab` — Mevcut aktif sekmeyi tutan state, 'featured' ile başlıyor
  - `productsByTab` — useMemo ile hesaplanan, sekmelere göre ayrılmış ürün listelerini tutan nesne {featured, newArrivals, bestSellers}
  - `activeProducts` — productsByTab nesnesinden activeTab ile erişilen, mevcut sekmeye karşılık gelen ürün listesi
- **Dönüş**: React JSX section elementi (featured ticari ürün bloklarını gösteren bölüm)

### [N2_NASIL] AST Pointer: FeaturedCommercialBlocks.tsx::productsByTab callback
- **params**: ()
- **ic_degiskenler**:
  - `featured` — initialProducts içinden is_featured flag'ine göre filtrelenmiş ve ilk 4 ürüne kesilmiş liste, eğer boşsa ilk 4 üründen oluşan liste
  - `newArrivals` — initialProducts'ıncreated_at tarihine göre büyükten küçüğe sıralanmış ve ilk 4 ürüne kesilmiş liste
  - `bestSellers` — initialProducts içinden indeks 4-8 aralığındaki ürünler (ilk 4'ten sonraki 4 ürün), eğer boşsa ilk 4 üründen oluşan liste
- **Dönüş**: { featured, newArrivals, bestSellers } nesnesi

### [N3_NASIL] AST Pointer: FeaturedCommercialBlocks.tsx::tab button mapper
- **params**: (tab)
- **ic_degiskenler**: (yok)
- **Dönüş**: React JSX button elementi (sekmeler arası geçiş butonu)

### [N4_NASIL] AST Pointer: FeaturedCommercialBlocks.tsx::product mapper
- **params**: (product, idx)
- **ic_degiskenler**: (yok)
- **Dönüş**: React JSX motion.div elementi (ProductCard'ı sarmalayan animasyonlu div)

---

## NODE ID STANDARD

  file: src\components\home\FeaturedCommercialBlocks.tsx
  function: src\components\home\FeaturedCommercialBlocks.tsx::FeaturedCommercialBlocks

---

## DISA AKTARILANLAR (EXPORTS)
  export: FeaturedCommercialBlocks

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