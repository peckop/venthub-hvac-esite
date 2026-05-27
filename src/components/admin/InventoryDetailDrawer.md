---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryDetailDrawer.tsx
skeleton_hash: b4c161454e49e38a
entity_hashes:
  func:InventoryDetailDrawer: 3a57400ca0f546b7
  overview: 92caa1481da5cee7
  style_tokens: 05c1509659776517
generated_at: 2026-05-27T11:45:04Z
---

## Genel Bakış
InventoryDetailDrawer, envanter öğelerinin ayrıntılarını gösteren bir React bileşenidir. Kullanıcıya seçilen ürünün stok miktarı, konumu ve diğer meta verileri sunar. Ayrıca düzenleme ve kapatma işlevlerini sağlayarak envanter yönetimi akışını destekler.

## Fonksiyon Grupları
### Ana Bileşen
Bileşenin giriş noktası ve render mantığını yönetir.
- InventoryDetailDrawer

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### InventoryDetailDrawer
**Ne yapar**: Seçili bir ürünün stok detaylarını, eşik değerlerini ve hareket geçmişini gösteren bir yan çekmece (drawer) arayüzü oluşturur. Kullanıcıların QR etiketi yazdırması, eşik güncellemesi, stok ayarlaması ve hareketleri geri alması gibi etkileşimli işlemleri yönetir.  

**Nasıl yapar**: Props içinde gelen durum ve setter fonksiyonlarını destrüktüre eder, Escape tuşu ile çekmeceyi kapatmak için bir `useEffect` ekler ve `selected` nesnesi yoksa `null` döner. UI, bir kapatma butonu, ürün bilgileri, stok ve eşik kartları, zeki satın alma önerisi, eşik güncelleme formu, stok ayarlama bileşeni, rezerve sipariş tablosu ve hareket geçmişi bölümlerinden oluşur. Buton ve input etkileşimleri ilgili callback’leri (ör. `printQrLabel`, `saveThreshold`, `adjustStock`, `undoLastMovement`) tetikler.  

**Parametreler**:
- props: InventoryDetailDrawerProps — Çekmeceyi kontrol eden tüm durum ve fonksiyonları içeren nesne. İçerisinde:
  - selected: any — Görüntülenecek ürün nesnesi; yoksa çekmece kapanır.
  - setSelected: (value: any) => void — Çekmeceyi kapatmak veya seçimi değiştirmek için kullanılan setter.
  - printingQr: boolean — QR etiketi yazdırma işleminin devam edip etmediğini gösterir.
  - setPrintingQr: (value: boolean) => void — QR yazdırma durumunu günceller.
  - selectedStock: number | null — Ürünün mevcut stok miktarı.
  - selectedThreshold: string | number — Kullanıcı tarafından girilen eşik değeri.
  - setSelectedThreshold: (value: string | number) => void — Eşik değerini günceller.
  - defaultThreshold: number | null — Sistem tarafından tanımlı varsayılan eşik.
  - saving: boolean — Eşik kaydetme işleminin sürecini gösterir.
  - saveThreshold: (productId: string) => void — Yeni eşik değerini kaydeder.
  - hasWriteAccess: boolean — Kullanıcının düzenleme yetkisi olup olmadığını belirler.
  - moveQty: number — Stok hareketi miktarı.
  - setMoveQty: (value: number) => void — Stok hareket miktarını ayarlar.
  - moving: boolean — Stok hareketi işleminin devam edip etmediği.
  - adjustStock: (params: any) => void — Stok ayarlama işlemini gerçekleştirir.
  - reservedOrders: any[] — Rezerve siparişlerin listesi.
  - movements: any[] — Stok hareket geçmişi.
  - undoLastMovement: () => void — Son stok hareketini geri alır.
  - undoing: boolean — Geri alma işleminin sürecini gösterir.
  - t: (key: string) => string — Çeviri fonksiyonu.

**Dönüş**: `void` (React bileşeni olarak JSX döndürür; render edildiğinde UI oluşturur).

---

## INTERFACES

### InventoryDetailDrawerProps
- `selected: InventoryRow | null`
- `setSelected: (v: InventoryRow | null) => void`
- `printingQr: boolean`
- `setPrintingQr: (v: boolean) => void`
- `selectedStock: number | null`
- `selectedThreshold: number | ''`
- `setSelectedThreshold: (v: number | '') => void`
- `defaultThreshold: number | null`
- `saving: boolean`
- `saveThreshold: (id: string) => void`
- `hasWriteAccess: boolean`
- `moveQty: number`
- `setMoveQty: (v: number) => void`
- `moving: boolean`
- `adjustStock: (id: string, delta: number, reason: string) => void`
- `reservedOrders: ReservedRow[]`
- `movements: Movement[]`
- `undoLastMovement: () => void`
- `undoing: boolean`
- `t: (key: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryDetailDrawer.tsx::InventoryDetailDrawer
- **params**: (props)
- **ic_degiskenler**:
  - `selected` — seçili envanter satırı, drawer’ın gösterilip gösterilmeyeceğini belirler
  - `setSelected` — seçili satırı sıfırlamak için kullanılan state setter fonksiyonu
  - `printingQr` — QR kodu basımının şu anda gerçekleşip gerçekleşmediğini gösteren boolean
  - `setPrintingQr` — QR basım durumunu güncelleyen state setter fonksiyonu
  - `selectedStock` — seçili ürünün mevcut stok miktarı
  - `selectedThreshold` — seçili ürün için gösterilen eşik (alarm) değeri
  - `setSelectedThreshold` — eşik değerini güncelleyen state setter fonksiyonu
  - `defaultThreshold` — ürünün varsayılan eşik değeri (fallback)
  - `saving` — eşik güncelleme işleminin devam edip etmediğini gösteren boolean
  - `saveThreshold` — eşik değerini kaydeden fonksiyon (product_id parametresi alır)
  - `hasWriteAccess` — kullanıcının düzenleme yetkisi olup olmadığını belirten boolean
  - `moveQty` — stok hareketi miktarı (adjust component’ine aktarılır)
  - `setMoveQty` — hareket miktarını güncelleyen state setter fonksiyonu
  - `moving` — stok hareketi işleminin devam edip etmediğini gösteren boolean
  - `adjustStock` — stok ayarlama işlemini tetikleyen callback
  - `reservedOrders` — rezerve siparişlerin listesi, `InventoryReservedTable`a prop olarak verilir
  - `movements` — stok hareket geçmişi dizisi, `InventoryMovementHistory`a prop olarak verilir
  - `undoLastMovement` — son hareketi geri almayı tetikleyen fonksiyon
  - `undoing` — geri alma işleminin devam edip etmediğini gösteren boolean
  - `t` — i18n çeviri fonksiyonu
  - `onKey` — `Escape` tuşuna basıldığında drawer’ı kapatan yerel fonksiyon (useEffect içinde tanımlanır)
- **Dönüş**: yok (React bileşeni, JSX döndürür; yan etkileri: `useEffect` ile klavye dinleyicisi ekler ve temizler)

---

## NODE ID STANDARD

  file: src\components\admin\InventoryDetailDrawer.tsx
  function: src\components\admin\InventoryDetailDrawer.tsx::InventoryDetailDrawer

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryDetailDrawer

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-lg`, `rounded-hvac-xl`, `shadow-glow-md`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500`, `bg-black/60`, `bg-cyan-400`, `bg-cyan-400/10`, `bg-white/2`, `bg-white/3`, `border-b`, `border-cyan-400/20`, `border-l`, `border-none`, `border-white/10`, `border-white/5`, `text-3xl`, `text-base`, `text-cyan-300`
- **Layout:** `-right-8`, `-top-8`, `absolute`, `backdrop-blur-sm`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `grid`
- **Responsive:** `sm:` prefix kullanımları