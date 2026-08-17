---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\overlay\ConfirmProvider.tsx
skeleton_hash: 37d2055df82cda60
entity_hashes:
  func:ConfirmProvider: 7ea9af04dd28f549
  func:useConfirm: cfd17de4049eeec4
  overview: 9c51abdb8f5e9a28
  style_tokens: 867d6b490cb9cbcb
generated_at: 2026-08-15T15:07:27Z
---

## Genel Bakış
Bu modül, React uygulaması genelinde tutarlı bir modal onay diyaloğu sunmak için tasarlanmış bir bağlam (context) sağlayıcısıdır. Temel olarak, asenkron "Evet/Hayır" kararlarını yöneten merkezi bir `useConfirm` hook'unu ve onu içeren `ConfirmProvider` bileşenini içerir. Mimari olarak, uygulama genelinde paylaşılan bir durum (onay isteği) ve arabirimi yöneten bir altyapı katmanı görevi görür.

## Fonksiyon Grupları
### Onay Bağlamı Sağlayıcısı (Altyapı)
Bu grup, onay diyaloğunun tüm çocuk bileşenler tarafından erişilebilir olmasını sağlayan React bağlamını (context) oluşturur ve yönetir. Sağlayıcı, asenkron onay isteklerinin durumunu (örn. beklemede, çözümlenmiş) ve çözücü (resolver) fonksiyonlarını barındırır.
- `ConfirmProvider`

### Onay Hook'u (Tüketici Arayüzü)
Bu grup, alt bileşenlerin onay diyaloğunu tetiklemek için kullanacağı pratik bir API sunar. Hook, bir onay isteği başlatır, diyaloğun kullanıcı tarafından onaylanmasını veya reddedilmesini bekler ve sonucu bir Promise ile döndürerek bileşenlerin akışını kontrol etmesine olanak tanır.
- `useConfirm`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React Context tabanlı bir onay dialog (confirm) sistemi sunar. Aşağıdaki mimari varsayımlar, yalnızca fonksiyon imzaları ve modül sabitlerinden türetilmiştir.

[Aksiyom 1]: Eğer `useConfirm()` hook'u `ConfirmProvider` bileşeninin alt ağacında (child) çağrılmamışsa, `ConfirmContext` üzerinde `call` erişilemez ve çalışma zamanı hatası (örn: `Context is undefined`) oluşur.

[Aksiyom 2]: Eğer `useConfirm()` tarafından döndürülen fonksiyona geçilen `ConfirmOptions` nesnesi `ConfirmContext (call)` tarafından beklenen zorunlu alanları içermiyorsa, confirm dialog'un davranışı tanımsızdır (bilinmiyor — `ConfirmOptions` tipinin içeriği bu imzalardan çıkarılamamaktadır).

[Aksiyom 3]: Eğer `ConfirmProvider` bileşenine `children` prop'u geçirilmemiş veya `null/undefined` ise, alt ağaç hiçbir şey render etmez (React.Provider sarmalayıcısı çalışmaz, dolayısıyla hiçbir alt bileşen context'e erişemez).

[Aksiyom 4]: Eğer `useConfirm()` return value'su (`Promise<boolean>`) await edilmeden veya `.then/.catch` ile işlenmeden çağrılırsa, confirm sonucu (kullanıcı onayladı/redetti) kaybolur ve asenkron akış devam eder.

[Aksiyom 5]: Eğer birden fazla `ConfirmProvider` iç içe (nested) kullanılırsa, en yakın üstteki `ConfirmProvider`'ın sağladığı `ConfirmContext (call)` geçerli olur; dıştaki provider'lar ignored edilir.

---

**Notlar:**
- `ConfirmOptions` tipinin inner yapısı (hangi alanların zorunlu olduğu) fonksiyon imzasında tanımlı değildir; bu nedenle Aksiyom 2'de spesifik alan adları verilmemiştir.
- `ConfirmContext` içindeki `call`'ın tam çalışma prensibi (dialog açma/kapama mekanizması) bu imzalardan çıkarılamamaktadır; yalnızca varlığının zorunluluğu belirtilmiştir.

---

## FONKSİYON DETAYLARI

### useConfirm
**Ne yapar**: Onay isteyen imperatif bir kancadır. `ConfirmProvider` içinde tanımlanan onay dialogunu programatik olarak açmak ve kullanıcının kararını beklemek için kullanılır.

**Nasıl yapar**: `React.useContext` hook'u ile `ConfirmContext` değerini alır. Eğer kanca `ConfirmProvider` bileşeninin dışında çağrıldıysa (context mevcut değilse) bir hata fırlatır. Aksi takdirde, context'in sağladığı `(options: ConfirmOptions) => Promise<boolean>` imzasındaki fonksiyonu doğrudan döndürür.

**Parametreler**: Parametresizdir.

**Dönüş**: `(options: ConfirmOptions) => Promise<boolean>` tipinde bir fonksiyon. Bu fonksiyon, verilen `ConfirmOptions` yapılandırmasıyla onay dialogunu açar ve kullanıcının onay (`true`) veya iptal (`false`) kararını temsil eden bir Promise resolve eder.

### ConfirmProvider
**Ne yapar**: Çocuk bileşenlere onay dialogu (`alertdialog`) yetenekini sağlayan bir React bileşenidir. `ConfirmContext` oluşturur ve dialogun tüm state'ini, açma/kapatma mantığını ve Promise çözümlemesini yönetir.

**Nasıl yapar**: `useI18n` hook'u ile çeviri fonksiyonunu (`t`) alır. `useState` hook'ları ile dialog için gerekli seçenekler (`options`) ve typed onay input değerini (`typed`) yönetir. `resolverRef` ile açılan dialog'a karşılık gelen Promise'in `resolve` fonksiyonunu saklar. `confirm` callback'i, yeni bir dialog açmak için çağrılır: input'u sıfırlar, seçenekleri ayarlar ve yeni bir Promise oluşturup resolve fonksiyonunu ref'e kaydeder. `settle` callback'i, dialog kapatıldığında Promise'i çözümler (sonuç `true` veya `false`) ve state'i temizler. `handleOpenChange`, dialog'unRadiX tarafından kapatılma olayını yakalar (ESC, arka plan tıklaması) ve her durumda `settle(false)` çağırarak asılı kalan promise'i çözer. JSX içinde `ConfirmContext.Provider` ile `confirm` fonksiyonunu alt bileşenlere iletir. Ardından, `Dialog.Root` ile options mevcutsa (`options !== null`) açılan bir modal dialog render eder. Dialog, `role="alertdialog"` ve `aria-modal="true"` özelliklerini taşır, dışarı tıklamayla kapatmayı engeller (`onPointerDownOutside`, `onInteractOutside`), ilk odaklanmayı en az yıkıcı eylem olan iptal butonuna yapar (`onOpenAutoFocus`). İçerik,Opsiyonel bir başlık, açıklama, `requireTypedConfirmation` seçeneği aktifse bir text input ve onay/iptal butonları içerir.

**Parametreler**:
- `children`: `React.ReactNode` — Bileşenin sağladığı onay dialogunu kullanacak olan alt React düğümleri.

**Dönüş**: `JSX.Element`. `ConfirmContext.Provider` ve dialog yapısını içeren JSX ağacı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../i18n/I18nProvider::useI18n
- import: @radix-ui/react-dialog
- import: react::React

---

## INTERFACES

### ConfirmOptions
ONAY YÜZEYİ — `window.confirm` yerine. Cetvel: docs/standards/admin-design-standard.md §4.7, §4.8 NEDEN `window.confirm` YASAK (2026-08-15 denetimi): · stilsiz ve i18n'i taşıyamaz, · mobilde "bu site tekrar sormasın" ile **kalıcı olarak susturulabilir** → `confirm` `false` döner, silme sessizce ipta
- `title?: string`
- `description: string`
- `confirmLabel?: string`
- `cancelLabel?: string`
- `tone?: 'danger' | 'default'`
- `requireTypedConfirmation?: string`

---

## TYPE ALIASES

### Resolver
```typescript
type Resolver = (value: boolean) => void
```

---

## SABİTLER
- **ConfirmContext** (call) — `React.createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `ConfirmProvider.tsx::useConfirm`
- **params**: (yok)
- **ic_degiskenler**:
  - `ctx` — `React.useContext(ConfirmContext)` ile elde edilen context değeri; onay dialog'unu tetikleyen `confirm` fonksiyonunu barındırır
- **Dönüş**: `(options: ConfirmOptions) => Promise<boolean>` — doğrudan `ctx`'nin kendisi döndürülür

---

### [N2_NASIL] AST Pointer: `ConfirmProvider.tsx::ConfirmProvider`
- **params**: `{ children }` — `children: React.ReactNode`, provider'ın sarmaladığı alt React elemanları
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan alınan çeviri fonksiyonu; `admin.confirm.defaultTitle`, `admin.confirm.cancel`, `admin.confirm.confirm`, `admin.confirm.typeToConfirm` gibi anahtarları çevirir
  - `options` — `ConfirmOptions | null`, dialog konfigürasyonu (`title`, `description`, `tone`, `cancelLabel`, `confirmLabel`, `requireTypedConfirmation`); `null` iken dialog kapalıdır
  - `typed` — `string`, kullanıcının "onay için yaz" alanına girdiği metin; `requireTypedConfirmation` eşleşmesi kontrol edilir
  - `resolverRef` — `React.useRef<Resolver | null>`, açılan dialog'un ardındaki `Promise<boolean>`'in `resolve` fonksiyonunu tutar; `settle` çağrısında çözülür
  - `cancelRef` — `React.useRef<HTMLButtonElement>`, iptal butonuna DOM referansı; `onOpenAutoFocus`'ta en az yıkıcı eyleme odaklanmak için kullanılır
  - `confirm` — `React.useCallback`, `(next: ConfirmOptions) => Promise<boolean>`; `typed`'ı sıfırlar, `options`'ı set eder, yeni bir `Promise` oluşturur ve `resolverRef`'e `resolve` atar
  - `settle` — `React.useCallback`, `(result: boolean) => void`; `resolverRef`'i çağırarak Promise'i çözünür, `resolverRef`'i `null`'a, `options`'ı `null`'a, `typed`'ı boş string'e sıfırlar
  - `handleOpenChange` — `React.useCallback`, `(open: boolean) => void`; Radix `Dialog.Root`'un `onOpenChange` callback'i; dialog kapanırken (`open === false`) `settle(false)` çağırarak Promise'i çözünür
  - `isDanger` — `boolean`, `options?.tone === 'danger'` kontrolü;true ise onay butonu `adminTableActionDangerClass`,false ise `adminTableActionPrimaryClass` sınıfını alır
  - `needsTyped` — `boolean`, `Boolean(options?.requireTypedConfirmation)`; true ise metin girişi alanı gösterilir
  - `typedOk` — `boolean`, `!needsTyped || typed.trim() === options?.requireTypedConfirmation`; onay butonunun `disabled` durumunu belirler
- **Dönüş**: JSX — `<ConfirmContext.Provider>` içine çocukların ve `Dialog.Root` tabanlı onay modalının render edildiği React node; doğrudan `void` (yan etki: DOM'a dialog ekler)

---

## NODE ID STANDARD

  file: src\components\admin\overlay\ConfirmProvider.tsx
  function: src\components\admin\overlay\ConfirmProvider.tsx::useConfirm
  function: src\components\admin\overlay\ConfirmProvider.tsx::ConfirmProvider

---

## DISA AKTARILANLAR (EXPORTS)
  export: ConfirmOptions
  export: ConfirmProvider
  export: useConfirm

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/60`, `bg-white/5`, `border-white/15`, `text-base`, `text-sm`, `text-white`, `text-white/60`, `text-white/70`, `text-xs`
- **Layout:** `block`, `fixed`, `flex`, `flex-wrap`, `gap-2`, `h-12`, `items-center`, `justify-end`, `max-w-90vw`, `p-6`, `sm:max-w-modal`, `w-full`, `z-backdrop`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${adminModalContentClass`, `${isDanger`, `:`, `adminTableActionDangerClass`, `adminTableActionPrimaryClass`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-40`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-cyan-400/60`, `font-semibold`, `inset-0`, `leading-relaxed`, `pt-2`