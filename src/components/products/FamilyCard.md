---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\FamilyCard.tsx
skeleton_hash: f6c399db53421a29
entity_hashes:
  overview: 562328f4a587a923
  style_tokens: 421f8d9da05ee333
generated_at: 2026-08-15T06:32:18Z
---

## Genel Bakış
Bu modül, ürün ailelerinin görsel ve bilgilendirici kart bileşenini tanımlayan React bileşenidir. Ürün listeleme sayfalarında, ait olduğu marka ikonuyla birlikte ürün görseli ve adını gösteren tekrar kullanılabilir bir UI kartı sunar. Modül, yerelleştirilmiş rotalar ve dil çevirileri için hook'lara bağımlıdır.

## Fonksiyon Grupları
*Bu dosyada tanımlanmış herhangi bir fonksiyon veya metot bulunmamaktadır. Modül, bir React bileşeni (FamilyCard) olarak modül-seviyesinde tanımlanmıştır.*

**Modül Yapısı ve Bağımlılıklar:**
Modül, bir React fonksiyonel bileşeni olarak dışa aktarılır. Ürün verisini (`FamilyListItem` tipi) alır ve bir `Link` (Next.js) içine sarılmış, `VentImage` (optimize edilmiş görsel bileşeni) ve `BrandIcon` gibi alt bileşenleri kullanarak görsel bir kart render eder. Görseller için `resolveProductImageUrl` ve `productImagePlaceholder` yardımcı fonksiyonları kullanılarak dinamik görsel yükleme yönetilir. Bileşen, kullanıcı diline göre rotaları ve çevirileri dinamik olarak almak için `useLocalizedRoutes` ve `useI18n` hook'larına bağımlıdır; bu durum, bileşenin çok dilli bir ortamda çalıştığını ve iç bağımlılıklarının `hooks` ve `i18n` modüllerine yönelik olduğunu gösterir. Mimari açıdan, bu bileşen ürün kataloğu veya listeleme ekranlarında temel bir tekrar usable UI birimidir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** `FamilyCard` bir React TSX bileşenidir. Verilen modül bilgilerinde (fonksiyon imzası, sabit veya eski doküman) bileşenin props yapısı, state yönetimi veya bağımlılıkları hakkında herhangi bir detay bulunmamaktadır. Bu nedenle bileşenin doğru çalışması için gerekli koşullar belirlenememiştir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../HVACIcons::BrandIcon
- import: ../ui/VentImage::VentImage
- import: @/lib/images/productImage::productImagePlaceholder
- import: @/lib/images/productImage::resolveProductImageUrl
- import: @/types/ui-models::type { FamilyListItem }
- import: next/link::Link
- import: react::React

---

## INTERFACES

### FamilyCardProps
- `family: FamilyListItem`
- `layout?: 'grid' | 'list'`
- `priority?: boolean`
- `compact?: boolean`

---

## SABİTLER
- **FamilyCard** (call) — `React.memo(function FamilyCard({
  family,
  layout = 'grid',
  priority =...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/FamilyCard.tsx::FamilyCard
- **params**: (bilinmiyor, fonksiyon gövdesi yok)
- **ic_degiskenler**: (fonksiyon gövdesi analiz edilemedi)
- **Dönüş**: React bileşeni (JSX) — bileşenin ne döndüğü gövde olmadan belirlenemez

---

## NODE ID STANDARD

  file: src\components\products\FamilyCard.tsx

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-light-gray/30`, `bg-light-gray/50`, `bg-light-gray/60`, `bg-primary-navy/90`, `bg-white`, `bg-white/90`, `border-light-gray`, `border-t`, `group-hover:bg-light-gray/50`, `group-hover:text-primary-navy`, `sm:text-lg`, `text-base`, `text-industrial-gray`, `text-lg`, `text-primary-navy`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `gap-3`, `h-28`, `h-full`, `hover:shadow-hvac-lg`, `items-baseline`, `items-center`, `items-start`, `justify-between`
- **Varyant/Responsive:** `:`, `focus-visible:`, `group-hover:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${compact`, `:`, `aspect-square`, `border`, `duration-300`, `duration-500`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy`, `font-black`, `font-bold`, `font-medium`, `font-semibold`, `group`