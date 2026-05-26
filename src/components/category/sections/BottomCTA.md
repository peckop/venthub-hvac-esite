---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\BottomCTA.tsx
skeleton_hash: 1f08a41bd7ff999f
generated_at: 2026-05-23T21:58:44Z
---

## Genel Bakış
Bu modül, bir kategori sayfasının alt kısmında kullanıcıya eylem teşvik eden bir çağrı‑etkileşim (CTA) bileşeni sunar ve sayfanın en üstüne hızlıca dönme işlevi sağlar. BottomCTA bileşeni, sihirbazı açma veya ürünleri gösterme gibi etkileşimleri yönetirken, scrollToTop fonksiyonu sayfa kaydırma deneyimini iyileştirmek için kullanılır.

## Fonksiyon Grupları
### Kullanıcı Arayüzü ve Etkileşim
Kategori sayfasının alt kısmında görsel bir CTA göstererek kullanıcıya belirli eylemler (sihirbazı açma, ürün listeleme) sunar ve bu eylemlerin tetiklenmesini sağlar.
- BottomCTA

### Sayfa Navigasyonu
Kullanıcının sayfanın başına hızlıca dönmesini sağlayan basit bir kaydırma işlevi içerir, böylece uzun listelerde üst menüye erişim kolaylaşır.
- scrollToTop

---

## AXIOMS – Mimari Varsayımlar
Bu modül, gerekli callback fonksiyonlarının ve `categoryN` propunun sağlandığı ve tarayıcı ortamında çalıştığı varsayımıyla doğru şekilde işlev görür.

[Aksiyom 1]: Eğer `onOpenWizard` propu sağlanmazsa, wizard açma işlevi tetiklenemez.  
[Aksiyom 2]: Eğer `onShowProducts` propu sağlanmazsa, ürün listeleme işlevi tetiklenemez.  
[Aksiyom 3]: Eğer `categoryN` propu sağlanmazsa, component rendering sırasında hata oluşur veya beklenen içerik gösterilemez.  
[Aksiyom 4]: Eğer `showWizard` propu sağlanmazsa, varsayılan olarak `true` değeri kullanılır ve wizard açık olarak başlar.  
[Aksiyom 5]: Eğer `scrollToTop` fonksiyonu tarayıcı dışı bir ortam (ör. sunucu tarafı render) çağrılırsa, `window.scrollTo` erişimi yoksa hata oluşur.

---

## FONKSIYON DETAYLARI

### BottomCTA
**Ne yapar**: Sayfa sonu CTA (Çağrı Eylemi) bölümünü renderlar ve kullanıcıya belirli aksiyonlar sunar: modelleri inceleme, bana uygun olanı bulma (wizard), uzman desteği alma ve sayfanın başına dönme.  
**Nasıl yapar**: Prop olarak alınan callback fonksiyonları (`onOpenWizard`, `onShowProducts`) ile butonların tıklama olaylarını bağlar; `showWizard` prop'una göre wizardı gösterip gizler; `categoryN` değerini gerekli yerlerde kullanarak içerik veya filtrelemeyi ayarlar.  
**Parametreler**:
- onOpenWizard: type not specified — Wizardı açmak için çağrılacak fonksiyon  
- onShowProducts: type not specified — Ürün listesini göstermek için çağrılacak fonksiyon  
- showWizard: boolean — Wizardın görünürlüğünü kontrol eder; varsayılan değer `true`  
- categoryN: type not specified — Bileşenin bağlamında kullanılan kategori tanımlayıcısı (örnek: kimlik veya isim)  
**Dönüş**: React.FC<BottomCTAProps> — Bileşenin props tipine uygun bir React fonksiyon bileşeni döner  

### scrollToTop
**Ne yapar**: Sayfanın en üstüne kaydırma yapar.  
**Nasıl yapar**: Tarayıcının veya içeriğin kaydırma konumunu sıfırlayarak kullanıcıyı sayfa başına taşır; genellikle `window.scrollTo(0, 0)` veya benzeri bir yöntemle gerçekleştirilir.  
**Parametreler**: Yok  
**Dönüş**: void — Fonksiyon bir değer döndürmez (veya dönüş tipi belirtilmemiş)

---

## INTERFACES

### BottomCTAProps
- `onOpenWizard?: () => void`
- `onShowProducts?: () => void`
- `showWizard?: boolean`
- `categoryName?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/BottomCTA.tsx::BottomCTA
- **params**: onOpenWizard, onShowProducts, showWizard, categoryName
- **ic_degiskenler**: 
  - `scrollToTop` — fonksiyon, sayfayı yukarıya kaydırır (window.scrollTo)
- **Dönüş**: React.FC<BottomCTAProps>

### [N2_NASIL] AST Pointer: src/components/category/sections/BottomCTA.tsx::scrollToTop
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - (yok) — fonksiyon içinde hiçbir değişken tanımlanmaz
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\category\sections\BottomCTA.tsx
  function: src\components\category\sections\BottomCTA.tsx::BottomCTA
  function: src\components\category\sections\BottomCTA.tsx::scrollToTop

---

## DISA AKTARILANLAR (EXPORTS)
  export: BottomCTA

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-400`, `bg-emerald-500`, `bg-gradient-to-br`, `bg-secondary-blue`, `bg-white/10`, `bg-white/20`, `border-blue-400/30`, `border-white/20`, `from-primary-navy`, `from-secondary-blue`, `md:text-4xl`, `text-3xl`, `text-blue-100`, `text-center`, `text-gray-300`
- **Layout:** `absolute`, `backdrop-blur-sm`, `bottom-0`, `flex`, `flex-col`, `from-primary-navy`, `from-secondary-blue`, `gap-2`, `gap-4`, `grid`, `grid-cols-1`, `group-hover:-translate-y-1`, `group-hover:bg-white/30`, `group-hover:scale-110`, `h-14`
- **Responsive:** `lg:`, `md:`, `sm:` prefix kullanımları
