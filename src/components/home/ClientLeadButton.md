---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\ClientLeadButton.tsx
skeleton_hash: a7e6116d26640e96
generated_at: 2026-05-23T22:04:14Z
---

## Genel Bakış
Bu modül, müşteri lead işlemlerini tetiklemek için kullanılan bir düğme bileşenini tanımlar. Düğme, birincil çağrı‑eylem metni ve tıklandığında çalışacak bir fonksiyon alarak, arayüzde etkileşimli bir çağrı‑eylem sunar.

## Fonksiyon Grupları
### Ana Bileşen
Düğme bileşeninin görünümünü ve davranışını yönetir; props üzerinden metin, stil ve tıklama olayını alır ve kullanıcı etkileşimini işler.
- ClientLeadButton

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer **primaryCta** prop'u sağlanmazsa, butonun içeriği boş olur veya beklenmedik bir görüntü ortaya çıkar.  
[Aksiyom 2]: Eğer **onQuoteClick** prop'u bir fonksiyon değilse veya sağlanmazsa, butona tıklandığında beklenen işlem (örneğin teklif alma akışı) gerçekleşmez ve çalışma‑zamanı hatası oluşabilir.  
[Aksiyom 3]: Eğer **className** prop'u sağlanmazsa, komponentin stilini belirleyen varsayılan CSS sınıfları kullanılır; bu durumda özel stil geçersiz kılınamaz.

---

## FONKSIYON DETAYLARI

### ClientLeadButton
**Ne yapar**: Bir müşteri leadı için çağrı‑e‑aksiyon (CTA) butonu render eder. Butona tıklandığında `onQuoteClick` fonksiyonu çalıştırılır ve görsel stil `className` propu ile özelleştirilebilir.

**Nasıl yapar**: Fonksiyon, `primaryCta` metnini butonun içeriği olarak alır, `onClick` olayını `onQuoteClick` ile bağlar ve `className` değerini butonun `className` özelliğine uygular. React functional component olarak JSX döndürür; ekstra mantık veya state yönetimi içermez.

**Parametreler**:
- primaryCta: string — Buton üzerinde gösterilecek ana çağrı‑e‑aksiyon metni (örnequin “Teklif Al”).
- onQuoteClick: () => void — Butona tıklandığında çağrılacak olay işleyici fonksiyonu.
- className: string — Butona ek CSS sınıfları eklemek için opsiyonel stil sınıfı (örnequin “btn-primary”).

**Dönüş**: React.FC<ClientLeadButtonProps> — JSX elemanı olarak render edilmeye hazır bir React fonksiyonel bileşeni. Döndürülen değer doğrudan JSX butonudur; başka bir değer döndürmez.

---

## INTERFACES

### ClientLeadButtonProps
- `primaryCta: string`
- `onQuoteClick?: () => void`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/ClientLeadButton.tsx::ClientLeadButton
- **params**: primaryCta, onQuoteClick, className
- **ic_degiskenler**:
  - `primaryCta` — prop passed to component, displayed as the button’s label.
  - `onQuoteClick` — callback prop invoked when the button is clicked, if provided.
  - `className` — optional CSS class string; if falsy, the default styling classes are applied.
- **Dönüş**: React.FC<ClientLeadButtonProps> (returns a JSX button element)

### [N2_NASIL] AST Pointer: src/components/home/ClientLeadButton.tsx::onClickHandler
- **params**: (none)
- **ic_degiskenler**:
  - `onQuoteClick` — callback from the parent component; called directly when defined.
  - `window` — global browser object; used to verify its existence and to call the `openLeadModal` method when available.
- **Dönüş**: yok (implicitly returns undefined)

---

## NODE ID STANDARD

  file: src\components\home\ClientLeadButton.tsx
  function: src\components\home\ClientLeadButton.tsx::ClientLeadButton

---

## DISA AKTARILANLAR (EXPORTS)
  export: ClientLeadButton

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** (yok)
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]`, `tracking-[0.2em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-white`, `text-slate-950`, `text-xs`
- **Layout:** `absolute`, `group-hover:translate-y-0`, `h-16`, `overflow-hidden`, `relative`, `z-10`
- **Responsive:** (yok)
