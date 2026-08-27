---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\AdminEmptyState.tsx
skeleton_hash: d306595fdf338de8
entity_hashes:
  func:AdminEmptyState: 5a155dec87c91466
  overview: a8e9e23763cc1b0a
  style_tokens: 8ca6f8dd6c625d35
generated_at: 2026-08-27T07:58:39Z
---

## Genel Bakış

AdminEmptyState, admin panelinde içerik bulunmadığında kullanıcıya gösterilen boş durum ekranıdır. İkon, başlık, açıklama ve isteğe bağlı bir aksiyon butonu gibi sunum bileşenlerini bir arada sunan bir arayüz bileşenidir. `compact` prop'u ile kompakt ve geniş olmak üzere iki farklı görünüm arasında geçiş yapabilir.

## Fonksiyon Grupları

### Boş Durum Görüntüleme Bileşeni

AdminEmptyState, verilen ikon, başlık, açıklama ve aksiyon bilgilerini alıp kullanıcıya boş durum ekranını render eder. `compact` prop'u aracılığıyla görünüm yoğunluğu kontrol edilir.

- AdminEmptyState

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmemiştir; yalnızca fonksiyon imzası (`AdminEmptyState`) mevcuttur. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebildiğinden, gövde olmadan mimari varsayımda bulunulamaz.

---

## FONKSİYON DETAYLARI

### AdminEmptyState
**Ne yapar**: Admin panelinde veri olmadığında veya boş durum senaryolarında gösterilen bir yer tutucu (placeholder) bileşendir. Kullanıcıya görsel bir ikon, açıklayıcı metin ve opsiyonel bir aksiyon butonu sunarak boş durumu kullanıcı dostu biçimde bildirir. `compact` prop'una bağlı olarak iki farklı boyut ve stil varyasyonu sunar.

**Nasıl yapar**: Bileşen, `compact` prop'unun değerine göre koşullu render yapar. `compact` true olduğunda daha küçük, minimal bir görünüm (py-8 px-4 padding, 14x14 ikon kutusu, text-xs başlık) oluşturur. `compact` false veya tanımsız olduğunda daha geniş, vurgulu bir görünüm (py-20 px-6 padding, dashed border, 20x20 ikon kutusu, text-lg başlık) render eder. Normal modda, hover sırasında bir gradyan arka plan efekti (`from-admin-accent-weak to-transparent`) ve ikon üzerinde ölçeklendirme animasyonu (`group-hover:scale-110`) uygulanır. `action` prop'u tanımlıysa, her iki modda da tıklanabilir bir buton gösterilir; buton `action.onClick` olayını tetikler ve `action.label` metnini görüntüler.

**Parametreler**:
- icon: `Icon` — Bileşen olarak kullanılacak ikon bileşenidir. JSX içinde `<Icon size={...} strokeWidth={1.5}}` şeklinde çağrılır. Compact modda size=24, normal modda size=36 olarak kullanılır.
- title: `string` — Boş durumun başlık metnidir. Compact modda `text-xs`, normal modda `text-lg` font boyutuyla gösterilir.
- description: `string` — Boş durumun açıklayıcı alt metnidir. Her iki modda da `text-xs` boyutunda, `text-admin-fg-muted` renginde gösterilir. Compact modda `max-w-200px`, normal modda `max-sm` genişlik sınırı uygulanır.
- action: `{ onClick: () => void; label: string }` (opsiyonel) — Tanımlı olduğunda bir aksiyon butonu render edilir. `onClick` buton tıklama olayını, `label` buton üzerindeki metni belirler. Tanımsızsa buton gösterilmez.
- compact: `boolean` (opsiyonel) — true olduğunda bileşen daha küçük ve kompakt bir varyasyonda render edilir. false veya tanımsız olduğunda tam boyutlu, animasyonlu varyasyon kullanılır.

**Dönüş**: JSX elementi döndürür. React fonksiyonel bileşeni olarak çalışır; iki farklı boyut varyasyonundan birini render eder.

---

## İTHALATLAR (IMPORTS)
- import: lucide-react::LucideIcon
- import: react::React

---

## INTERFACES

### AdminEmptyStateProps
- `icon: LucideIcon`
- `title: string`
- `description: string`
- `action?: {`
- `compact?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/AdminEmptyState.tsx::AdminEmptyState
- **params**:
  - `icon` (destructured olarak `Icon` atanır) — LucideIcon tipinde, ikon bileşeni; JSX'te `<Icon size={...} strokeWidth={...} />` olarak render edilir
  - `title` — string, başlık metni; `<h3>` etiketi içinde `{title}` olarak render edilir
  - `description` — string, açıklama metni; `<p>` etiketi içinde `{description}` olarak render edilir
  - `action` — opsiyonel nesne, buton aksiyonu; `{onClick, label}` alanlarını içerir
  - `compact` — boolean, kompakt görünüm kontrolü; `true` ise küçük boyutlu layout, `false`/yok ise büyük boyutlu layout döner
- **ic_degiskenler**:
  - `compact` — koşul kontrolü; `if (compact)` ile iki farklı JSX layout arasında geçiş yapar
  - `Icon` — parametre `icon`'un yeniden adlandırılmış hali; compact modda `size={24}`, normal modda `size={36}` ve `strokeWidth={1.5}` ile render edilir
  - `title` — compact modda `text-xs`, normal modda `text-lg` font boyutuyla `<h3>` içinde gösterilir
  - `description` — compact modda `max-w-200px`, normal modda `max-sm` genişlik sınırıyla `<p>` içinde gösterilir
  - `action` — truthy ise buton render edilir; `action.onClick` tıklama handler'ı, `action.label` buton metni olarak kullanılır
  - `action.onClick` — `<button onClick={action.onClick}>` olarak atanır; tıklama olayını tetikler
  - `action.label` — `<button>` etiketi içinde `{action.label}` olarak render edilir
- **Dönüş**: JSX element (React.ReactNode); `compact` true ise küçük boyutlu, değilse büyük boyutlu bir boş durum bileşeni döner

---

## NODE ID STANDARD

  file: src\components\admin\AdminEmptyState.tsx
  function: src\components\admin\AdminEmptyState.tsx::AdminEmptyState

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminEmptyState

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-surface`, `bg-admin-surface-2`, `bg-gradient-to-b`, `border-admin-border`, `border-dashed`, `from-admin-accent-weak`, `hover:bg-admin-accent-hover`, `hover:bg-admin-surface-3`, `hover:text-admin-fg`, `text-admin-accent`, `text-admin-accent-fg`, `text-admin-fg`, `text-admin-fg-muted`, `text-center`
- **Layout:** `absolute`, `flex`, `flex-col`, `from-admin-accent-weak`, `h-14`, `h-20`, `items-center`, `justify-center`, `max-w-200px`, `max-w-sm`, `overflow-hidden`, `relative`, `shadow-admin-sm`, `w-14`, `w-20`
- **Varyant/Responsive:** `active:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `active:scale-95`, `border`, `duration-500`, `duration-700`, `font-semibold`, `group`, `group-hover:opacity-100`, `group-hover:scale-110`, `hover:-translate-y-0.5`, `inset-0`, `leading-relaxed`, `mb-2`, `mb-3`, `mb-4`, `mb-6`