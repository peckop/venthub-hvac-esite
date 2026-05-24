---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AdminEmptyState.tsx
skeleton_hash: 05a2a1042b4522e9
generated_at: 2026-05-23T21:50:15Z
---

## Genel Bakış
`AdminEmptyState` bileşeni, yönetim panelinde herhangi bir veri bulunmadığında kullanıcıyı bilgilendirmek ve yönlendirmek için kullanılan bir boş durum (empty state) UI öğesidir. İkon, başlık, açıklama ve isteğe bağlı aksiyon butonunu bir araya getirerek tutarlı bir görünüm sağlar; `compact` özelliği ile daha küçük yerleşimlerde kullanılabilir.

## Fonksiyon Grupları
### Boş Durum Görünümü
Bu grup, veri olmadığında gösterilecek boş durum bileşenini oluşturur; ikon, başlık, açıklama ve isteğe bağlı eylem butonunu bir araya getirir.
- AdminEmptyState

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### AdminEmptyState
**Ne yapar**: Kullanıcı arayüzünde "boş durum" (empty state) görünümü sağlar. Veri bulunmadığında veya sayfa içeriği olmadığında bilgilendirici bir mesaj ve opsiyonel bir aksiyon butonu sunar.

**Nasıl yapar**: Kendisine iletilen prop'ları (icon, title, description, action, compact) kullanarak bir görsel düzen oluşturur. icon prop'u bir React bileşeni alır ve bu bileşen render edilir; title bir başlık metni olarak gösterilir; description varsa ek bir açıklama metni olarak yer alır; action varsa içindeki label ve onClick değerleri ile bir buton oluşturulur; compact bayrağı true ise daha küçük ve sade bir görünüm sunulur.

**Parametreler**:
- icon: React.ComponentType<any> — Boş durumda kullanılacak ikonun React bileşeni.
- title: string — Başlık metni; durumu özetleyen kısa bir ifade.
- description?: string — (Opsiyonel) Başlığı tamamlayan daha uzun açıklama metni.
- action?: { label: string; onClick: () => void } — (Opsiyonel) Kullanıcının tıklayabileceği bir buton; label buton etiketi, onClick tıklama işleyicisidir.
- compact?: boolean — (Opsiyonel) true değeri verilirse bileşenin daha kompakt bir biçimde görüntülenmesini sağlar.

**Dönüş**: Belirtilmemiş. React fonksiyonel bileşeni olduğu için bir JSX elemanı döndürmesi beklenir.

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

### [N1] AST Pointer: src\components\admin\AdminEmptyState.tsx::AdminEmptyState
- **params**: `{ icon: Icon, title, description, action, compact }: AdminEmptyStateProps`
- **ic_degiskenler**:
  - `Icon` — props'tan alınan ikon bileşeni (LucideIcon tipinde), boş durum görselinde kullanılır
  - `title` — props'tan alınan başlık metni, JSX içinde `{title}` olarak yer alır
  - `description` — props'tan alınan açıklama metni, JSX içinde `{description}` olarak yer alır
  - `action` — props'tan alınan buton yapılandırması (object), `action.onClick` ve `action.label` property'lerine erişilir
  - `compact` — props'tan alınan boolean değer; `true` ise dar görünüm, `false` ise normal görünüm döndürülür
  - `action.onClick` — action nesnesindeki tıklama işleyicisi, buton `onClick` prop'una verilir
  - `action.label` — action nesnesindeki buton metni, JSX içinde `{action.label}` olarak yer alır
- **Dönüş**: React JSX elementi (ReactNode) — `compact` değerine göre iki farklı JSX yapısı döndürülür

---

## NODE ID STANDARD

  file: src\components\admin\AdminEmptyState.tsx
  function: src\components\admin\AdminEmptyState.tsx::AdminEmptyState

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminEmptyState