---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AdminEmptyState.tsx
skeleton_hash: 1e2d88f61e876a8e
entity_hashes:
  func:AdminEmptyState: 0a5636f5d0d24f8e
  overview: a8e9e23763cc1b0a
  style_tokens: 18a94c8091a667ca
generated_at: 2026-06-19T20:46:38Z
---

## Genel Bakış
`AdminEmptyState`, yönetim panelinde veri bulunmadığında veya sayfa içeriği boş olduğunda kullanıcıya bilgilendirici bir mesaj sunan bir React bileşenidir. İkon, başlık, açıklama ve opsiyonel aksiyon butonunu bir araya getirerek tutarlı ve yönlendirici bir boş durum (empty state) arayüzü oluşturur. Bileşen, farklı yerleşim ihtiyaçlarına cevap verebilmek için `compact` moduyla daha sade bir görünüm de sunabilir.

## Fonksiyon Grupları
### Boş Durum Görünümü
Bu grup, veri olmadığında gösterilecek bilgilendirici arayüzü oluşturur; temel unsurları (ikon, başlık, açıklama ve eylem butonunu) bir araya getirir ve kullanıcıya durumu açıklar.
- AdminEmptyState

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi (implementation body) verilmemiştir; dolayısıyla çalışma zamanı davranışına ilişkin mimari varsayımlar çıkarılamamıştır.

**Bilinen yapısal gözlem (fonksiyon imzasından):**

- `icon: Parametre`, bir React bileşeni olarak geçirilmektedir (büyük harfle başlaması nedeniyle).

Ancak bu parametrelerin zorunlu olup olmadığı, hangi durumlarda hata fırlatıldığı veya hangi koşullarda farklı render dalına geçildiği **bilinmiyor** çünkü fonksiyon gövdesi paylaşılmamıştır.

---

## FONKSİYON DETAYLARI

### AdminEmptyState
**Ne yapar**: Admin panelinde veri bulunamadığında veya boş bir durum gösterilmesi gerektiğinde kullanılan, iki farklı boyut seçeneğine sahip bir React bileşenidir. Kullanıcıya ikonlu, başlıklı ve açıklamalı bir boş durum mesajı sunar, opsiyonel bir eylem butonu içerebilir.

**Nasıl yapar**: Fonksiyon, `compact` prop'unun değerine göre iki farklı JSX yapısı döndürür. `compact` true ise daha küçük boyutlarda, sınırlı dolgu alanına ve daha minimal bir görünüme sahip bir div oluşturur. Aksi takdirde, daha geniş bir dolgu alanına, cam efektine (`glass-strong`), fare üzerine gelme efektine sahip, gradyan arka plan ve daha belirgin gölgelendirmeler içeren tam boyutlu bir boş durum bileşeni render eder. Her iki durumda da `icon`, `title` ve `description` prop'ları kullanılarak temel içerik oluşturulur; `action` prop'u sağlanmışsa, belirtilen metin ve tıklama işleviyle bir buton eklenir.

**Parametreler**:
- `icon`: React Bileşeni (Icon tipinde) — Boş durum alanının üst kısmında büyük bir ikon olarak görüntülenecek React bileşenidir. Bileşen `size` ve `strokeWidth` prop'larını desteklemelidir.
- `title`: string — Boş durumun üst başlığıdır, genellikle büyük harflerle ve kalın font ile görüntülenir.
- `description`: string — Başlığın altında yer alan açıklayıcı metindir. Kullanıcıya durum hakkında daha fazla bilgi verir.
- `action`: object (opsiyonel) — Boş durumun altında bir eylem butonu oluşturulmasını sağlar. `onClick` (butona tıklandığında çağrılacak fonksiyon) ve `label` (butonda görüntülenecek metin) özelliklerini içermelidir.
- `compact`: boolean (opsiyonel) — `true` olduğunda, bileşen daha kompakt ve küçük bir görünümle render edilir. Varsayılan olarak `false` veya tanımsız kabul edilerek tam boyutlu görünüm gösterilir.

**Dönüş**: JSX.Element — Bileşen, her iki durumda (compact veya normal) da bir React JSX yapısı döndürür ve doğrudan bir React bileşeni olarak kullanılabilir.

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
- **params**: `{ icon: Icon, title, description, action, compact }` — AdminEmptyStateProps türünde destructured nesne
  - `icon` — LucideIcon türünde, boş durum ikonu olarak `<Icon size={24|36} strokeWidth={1.5}>` şeklinde kullanılır
  - `title` — string, boş durum başlığını `<h3>` içinde büyük harflerle gösterir
  - `description` — string, boş durum açıklamasını `<p>` içinde küçük harflerle gösterir
  - `action` — opsiyonel nesne, `{ onClick: () => void, label: string }` yapısında; buton olarak render edilir ve `action.onClick` ile tıklama, `action.label` ile buton metni kullanılır
  - `compact` — boolean, kompakt (`compact=true`) ve normal (`compact=false`) görünüm arasında seçim yapar
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elementi — `compact` prop'una göre iki farklı düzen döndürür; `true` ise küçük kompakt görünüm, `false` ise daha geniş normal görünüm返回。

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
- `rounded-hvac-2xl`, `shadow-glow-lg`, `shadow-glow-md`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-gradient-to-b`, `bg-white/5`, `border-dashed`, `border-white/10`, `border-white/20`, `from-cyan-400/3`, `hover:bg-cyan-300`, `hover:bg-white/10`, `hover:text-white`, `text-center`, `text-cyan-400`, `text-lg`, `text-slate-300`, `text-slate-400`
- **Layout:** `absolute`, `flex`, `flex-col`, `from-cyan-400/3`, `h-14`, `h-20`, `items-center`, `justify-center`, `max-w-200px`, `max-w-sm`, `overflow-hidden`, `relative`, `shadow-cyan-400/20`, `shadow-xl`, `w-14`
- **Varyant/Responsive:** `active:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `active:scale-95`, `border`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `glass-strong`, `group`, `group-hover:opacity-100`, `group-hover:scale-110`, `hover:-translate-y-0.5`, `inset-0`, `leading-relaxed`, `mb-2`, `mb-3`