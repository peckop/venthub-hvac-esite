---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\CategoryShowcaseCards.tsx
skeleton_hash: c9323980a66641e5
entity_hashes:
  func:CategoryShowcaseCards: 9b0bb8ea765e96ba
  overview: d96a1007895e124d
  style_tokens: dcf5f92ec64d08ce
generated_at: 2026-05-28T22:37:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ürünler bölümünde kullanılan bir React bileşenini barındırmaktadır. Ürün kategorilerini site kullanıcılarına kart formatında sergilemek amacıyla geliştirilmiştir, ürünler sayfasının kategori gösterimi bölümündeki temel yapıyı oluşturur.

## Fonksiyon Grupları
### Ana Sunum Bileşeni
Modülün tek ve ana işlevi olarak tüm kategori kartları sergileme sorumluluğunu üstlenen, React tabanlı kullanıcı arayüzü bileşenidir. Kategori içeriklerinin kullanıcıya sunulması için gerekli tüm görünüm ve temel işlevselliği barındırır.
- CategoryShowcaseCards

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz bir React (TSX) bileşeni olup, yalnızca fonksiyon imzasından çıkarılabilecek minimal mimari varsayımlar aşağıdadır.

**[Aksiyom 1]:** Eğer React çalışma ortamı (React kütüphanesi ve TSX derleyici desteği) yoksa, bileşen render edilemez ve uygulama hata verir.

**[Aksiyom 2]:** Eğer bileşen parametre almıyorsa, kategori verilerinin bileşen dışından (örn: üst bileşen, context, veya statik import) sağlanması gerekir; veri kaynağı sağlanmazsa bileşen boş/bozuk render edilir.

> **Not:** Fonksiyon gövdesi paylaşılmadığı için, bileşenin iç mantığına (veri dönüşümü, koşullu render, eşik değerleri vb.) ilişkin aksiyomlar **bilinmiyor** olarak değerlendirilmiş ve üretilmemiştir.

---

## FONKSİYON DETAYLARI

### CategoryShowcaseCards
**Ne yapar**: Premium kategori vitrin kartlarını render eden bir React fonksiyonel bileşenidir. HVAC ürünlerinin yüksek kaliteli izometrik renders görsellerini kullanarak kategorileri görsel bir şekilde sunar.

**Nasıl yapar**: Next.js Image bileşenini optimize ederek yüksek kaliteli görselleri performanslı bir şekilde yükler. İzometrik ürün renderları kullanarak premium bir görünüm sağlar ve ürün kategorilerini kartlar halinde sergiler.

**Parametreler**:
Bu bileşen parametre almaz — stateless bir sunum bileşenidir.

**Dönüş**: `React.FC` — Render edilmiş premium kategori showcase kartları içeren JSX yapısı döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\CategoryShowcaseCards.tsx::CategoryShowcaseCards
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde değişken tanımlanmamıştır)
- **Dönüş**: React.FC — JSX formatında bölüm (section) içeren React bileşeni. Fonksiyon, hava perdeleri, endüstriyel fanlar ve ısı geri kazanım üniteleri için kartların yer aldığı ızgara yapısını render eder.

---

## NODE ID STANDARD

  file: src\components\products\CategoryShowcaseCards.tsx
  function: src\components\products\CategoryShowcaseCards.tsx::CategoryShowcaseCards

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryShowcaseCards

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-b`, `bg-white/5`, `border-slate-600/50`, `border-white/20`, `from-slate-700/80`, `hover:bg-white/10`, `hover:border-slate-400/50`, `text-center`, `text-cyan-400`, `text-gray-400`, `text-lg`, `text-sm`, `text-white`, `to-slate-900`, `via-slate-800`
- **Layout:** `drop-shadow-hvac-card-drop`, `flex`, `flex-1`, `flex-col`, `from-slate-700/80`, `gap-2`, `gap-5`, `grid`, `grid-cols-1`, `hover:shadow-2xl`, `items-center`, `justify-center`, `md:grid-cols-3`, `min-h-140px`, `overflow-hidden`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `border`, `duration-300`, `duration-500`, `font-bold`, `font-medium`, `group`, `group-hover:scale-105`, `leading-relaxed`, `mb-2`, `mb-4`, `object-contain`, `pb-2`, `pt-2`, `px-5`, `px-6`