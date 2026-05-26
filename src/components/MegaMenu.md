---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\MegaMenu.tsx
skeleton_hash: c7652019346c384d
generated_at: 2026-05-23T22:14:06Z
---

## Genel Bakış
Bu modül, MegaMenu adlı bir React bileşenini tanımlar ve menünün açılıp kapanmasını kontrol eden `isOpen` ve `onClose` özelliklerini kullanarak kullanıcı arayüzü üzerinden mega menü gösterimini yönetir.

## Fonksiyon Grupları
### Ana Bileşen
Mega menünün görsel yapısını oluşturur ve açma/kapama durumunu yönetir.
- MegaMenu

---

## AXIOMS – Mimari Varsayımlar
MegaMenu component'inin görüntülenmesi ve kapatılması için `isOpen` ve `onClose` prop'larının sağlanması gerekir.

[Aksiyom 1]: Eğer `isOpen` prop'u sağlanmazsa, component'in açık/kapalı durumu bilinmez ve beklenen görüntüleme davranışı garantilenemez.  
[Aksiyom 2]: Eğer `onClose` prop'u sağlanmazsa, kullanıcı menüyü kapatmak için bir işlev yoktur; bu durum menünün sürekli açık kalmasına ve kullanıcı deneyimini olumsuz etkileyebilir.  
[Aksiyom 3]: Eğer `isOpen` değeri `false` ise, menü kapalı görünür; `true` ise menü açık görünür (bu, tipik bir MegaMenu uygulaması için varsayılan davranıştır).

---

## FONKSIYON DETAYLARI

### MegaMenu
**Ne yapar**: MegaMenu componenti, `isOpen` ve `onClose` props'larını alarak mega menünün görünürlüğünü yönetir ve kapatma işlemini tetikler.  
**Nasıl yapar**: Fonksiyon, `isOpen` değeri true olduğunda menüyü render eder, false olduğunda render etmez; `onClose` callback'ini genellikle bir kapatma butonu veya overlay üzerinden çağırarak menüyü kapatır.  
**Parametreler**:  
- isOpen: boolean — Menünün açık olup olmadığını belirler.  
- onClose: () => void — Menüyü kapatmak için çağrılacak fonksiyon.  
**Dönüş**: React.FC<MegaMenuProps> — MegaMenu bileşeninin React fonksiyonel bileşen tanımı.

---

## INTERFACES

### MegaMenuProps
- `isOpen: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/MegaMenu.tsx::MegaMenu
- **params**: isOpen, onClose
- **ic_degiskenler**:
  - `categories` — Kategorileri tutan dizi/object, useCategories hook'undan gelir, EliteMegaMenu ve MobileMegaMenu bileşenlerine prop olarak geçilir.
  - `loading` — Kategorilerin yüklenip yüklenmediğini gösteren boolean, useCategories hook'undan gelir, loading true olduğunda spinner gösterilir.
  - `isMounted` — Bileşenin mount olup olmadığını takip eden boolean, useState ile false başlar, useEffect'te true yapılır, mount olana kadar ve isOpen false olduğunda null döner.
  - `setIsMounted` — isMounted state'ini güncelleyen setter fonksiyonu, useEffect içinde true yapmak için çağrılır.
- **Dönüş**: JSX.Element (veya null)

### [N2_NASIL] AST Pointer: src/components/MegaMenu.tsx::useEffect callback
- **params**: (yok)
- **ic_degiskenler**:
  - `setIsMounted` — isMounted state'ini güncelleyen setter fonksiyonu, true yaparak bileşenin mount edildiğini işaretler.
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\MegaMenu.tsx
  function: src\components\MegaMenu.tsx::MegaMenu

---

## DISA AKTARILANLAR (EXPORTS)
  export: MegaMenu

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-50/30`, `bg-white`, `border-4`, `border-b`, `border-primary-navy/20`, `border-slate-100`, `border-t-primary-navy`, `text-lg`, `text-slate-400`, `text-slate-900`, `text-white`, `text-xs`
- **Layout:** `block`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `gap-2`, `h-6`, `h-8`, `hidden`, `items-center`, `justify-between`, `justify-center`, `max-w-7xl`, `overflow-hidden`
- **Responsive:** `sm:` prefix kullanımları
