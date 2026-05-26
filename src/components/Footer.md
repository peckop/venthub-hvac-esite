---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\Footer.tsx
skeleton_hash: 5daa350ee98ba5a3
generated_at: 2026-05-23T22:03:58Z
---

## Genel Bakış
Bu modül, uygulamanın alt kısmında görünecek olan Footer bileşenini tanımlar. React işlevsel bileşeni olarak uygulanmış olup, sayfanın son kısmında gerekli bağlantı, telif hakkı veya sosyal medya gibi bilgileri sunmak için kullanılır.

## Fonksiyon Grupları
### Bileşen Tanımı
Footer bileşeninin oluşturulması ve dışa aktarılması sorumluluğundadır.
- Footer

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### Footer
**Ne yapar**: Uygulamanın altbilgi (footer) bölümünü render eden bir React fonksiyonel bileşeni tanımlar.  
**Nasıl yapar**: Fonksiyon içindeki JSX döndürerek, genellikle telif hakkı metni, sosyal medya linkleri ve diğer altbilgi öğelerini içerir; bu JSX, React tarafından DOM'a monte edilerek görüntülenir.  
**Parametreler**: Yok  
**Dönüş**: React.FC türünde bir fonksiyonel bileşen; bu bileşen render edildiğinde footer JSX'ini döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/Footer.tsx::Footer
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — çeviri fonksiyonu, `useI18n` hook'undan elde edilen `t` nesnesi; footer üzerindeki tüm metinleri çevirmek için kullanılır.
  - `globalCategories` — `useCategories` context'inden gelen tüm kategorilerin dizisi; footer'ın kategori listesi ve diğer bölümlerde kaynak veri olarak kullanılır.
  - `mainCategories` — `React.useMemo` ile memoize edilmiş değişken; `parent_id` olmayan (üst seviye) kategorilerin ilk 8 elemanını içerir ve footer'ın "Kategoriler" bölümünde gösterilir.
- **Dönüş**: JSX.Element — `<footer>...</footer>` elementi olarak render edilen footer bileşeni.

### [N2_NASIL] AST Pointer: src/components/Footer.tsx::mainCategories (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `globalCategories` — dış kapsaktan gelen tüm kategoriler dizisi; bu fonksiyon içinde `filter` ve `slice` işlemlerine kaynak olarak kullanılır.
- **Dönüş**: Category[] — `parent_id` olmayan kategorilerin ilk 8 elemanını içeren yeni dizi; footer'da gösterilecek kategori özetini sağlar.

### [N3_NASIL] AST Pointer: src/components/Footer.tsx::renderCategoryItem
- **params**: `category` — bir kategori nesnesi; `slug` ve `name` özelliklerini içerir, bu özellikler link oluşturma ve metin gösteriminde kullanılır.
- **ic_degiskenler**: (yok) — fonksiyon gövdesinde ek bir değişken tanımlanmaz.
- **Dönüş**: JSX.Element — `<li>` elementi içinde bir `<Link>` barındıran kategori öğesi; footer'ın kategori listesinde tek bir satır olarak render edilir.

---

## NODE ID STANDARD

  file: src\components\Footer.tsx
  function: src\components\Footer.tsx::Footer

---

## DISA AKTARILANLAR (EXPORTS)
  export: Footer

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-industrial-gray`, `bg-primary-navy`, `bg-white/5`, `border-steel-gray`, `border-t`, `text-gray-300`, `text-lg`, `text-secondary-blue`, `text-sm`, `text-steel-gray`, `text-white`, `text-xl`, `text-xs`
- **Layout:** `flex`, `flex-col`, `flex-shrink-0`, `flex-wrap`, `gap-8`, `gap-x-6`, `gap-y-2`, `grid`, `grid-cols-1`, `items-center`, `items-start`, `justify-between`, `justify-center`, `lg:grid-cols-4`, `max-w-7xl`
- **Responsive:** `lg:`, `md:`, `sm:` prefix kullanımları
