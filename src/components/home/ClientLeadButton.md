---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\ClientLeadButton.tsx
skeleton_hash: a7e6116d26640e96
entity_hashes:
  func:ClientLeadButton: 8f87f454fa733cb3
  overview: 5fd9adef525bec13
  style_tokens: 3a5eed4082aa65a0
generated_at: 2026-05-28T22:36:02Z
---

## Genel Bakış
Bu modül, ana eyleme yönelik müşteri yönlendirme (lead) butonunu tanımlayan bir React bileşenidir. Buton, özelleştirilebilir bir metin ve tıklama olayı alarak, teklif alma gibi bir müşteri etkileşimini başlatmak için arayüzde bir çağrı‑eylem (CTA) sunar.

## Fonksiyon Grupları
### Ana Bileşen
Bileşenin temel görünümünü ve tıklama davranışını tanımlar; gerekli metin, stil ve olay işleyicisi parametrelerini alarak etkileşimli bir buton oluşturur.
- ClientLeadButton

---

## AXIOMS – Mimari Varsayımlar
[Bu modül, birincil çağrı-eylem metni ve tıklama işleyicisi ile bir buton oluşturan React bileşenidir.]

[Aksiyom 1]: Eğer **primaryCta** prop'u (string türünde) sağlanmazsa, butonun görünür içeriği boş olur veya hata oluşur.
[Aksiyom 2]: Eğer **onQuoteClick** prop'u (fonksiyon türünde) sağlanmazsa, butona tıklandığında herhangi bir tetikleme eylemi çalışmaz veya hata oluşur.
[Aksiyom 3]: Eğer **className** prop'u sağlanmazsa, butona varsayılan veya stil tanımsız bir görünüm uygulanır.

---

## FONKSİYON DETAYLARI

### ClientLeadButton
**Ne yapar**: HVAC proje lead formuna yönlendiren, özelleştirilebilir bir.call-to-action butonu bileşenidir. Kullanıcıları teklif talep sayfasına yönlendirmek için ana sayfada veya promotional alanlarda kullanılır.

**Nasıl yapar**: Bileşen, verilen props'ları kullanarak bir buton render eder. `primaryCta` prop'u butonun metin içeriğini belirlerken, `onQuoteClick` event handler'ı butona tıklandığında tetiklenir. `className` prop'u ile dışarıdan stillendirme (override veya ekleme) yapılabilir.

**Parametreler**:
- `primaryCta`: string — Buton üzerinde görüntülenen ana metin/çağrı-ifadesi (ör: "Teklif Al", "İletişime Geç")
- `onQuoteClick`: () => void — Kullanıcı butona tıkladığında çalışacak olan回调 fonksiyonu; genellikle teklif sayfasına yönlendirme veya form açma işlemini tetikler
- `className`: string — Bileşene uygulanacak ek CSS sınıfı; mevcut stilleri override etmek veya üzerine eklemek için kullanılır

**Dönüş**: `React.FC<ClientLeadButtonProps>` — JSX element döndürür; render edilmiş bir React buton bileşeni.

---

## INTERFACES

### ClientLeadButtonProps
- `primaryCta: string`
- `onQuoteClick?: () => void`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ClientLeadButton.tsx::ClientLeadButton
- **params**: `{ primaryCta, onQuoteClick, className }` — primaryCta: buton metni; onQuoteClick: tıklama callback fonksiyonu; className: opsiyonel CSS sınıfı
- **ic_degiskenler**: (yok — sadece prop'lar kullanılır, hiçbir local değişken tanımlanmamıştır)
- **Dönüş**: JSX (`<button>` elemanı; içinde `<span>` ve `<div>` içeren animasyonlu buton yapısı)

### [N2_NASIL] AST Pointer: ClientLeadButton.tsx::onClick (arrow function)
- **params**: (yok)
- **ic_degiskenler**: (yok — sadece closure'dan `onQuoteClick` ve global `window` kullanılır)
  - `onQuoteClick` — üst scope'tan gelen callback, varsa çağrılır
  - `window` — tarayıcı ortam kontrolü sonrası `window.openLeadModal` fonksiyonu aranır
- **Dönüş**: yok (yan etki: `onQuoteClick()` veya `window.openLeadModal()` çağrısı)

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
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-white`, `text-slate-950`, `text-xs`
- **Layout:** `absolute`, `h-16`, `hover:shadow-white-glow`, `overflow-hidden`, `relative`, `z-10`
- **Varyant/Responsive:** `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `duration-500`, `font-bold`, `group`, `group-hover:translate-y-0`, `inset-0`, `px-12`, `rounded-2xl`, `transition-colors`, `transition-transform`, `translate-y-full`, `uppercase`