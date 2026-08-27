---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\home\ClientLeadButton.tsx
skeleton_hash: c9926b8ef87e83b9
entity_hashes:
  func:ClientLeadButton: 8f87f454fa733cb3
  overview: 5fd9adef525bec13
  style_tokens: 3a5eed4082aa65a0
generated_at: 2026-08-27T08:26:35Z
---

## Genel Bakış

Bu modül, müşteri adaylarına yönelik birincil eylem butonunu tanımlayan bir React bileşenidir. Bileşen, teklif alma gibi birincil çağrı-aksiyon (CTA) işlemini tetikler ve dışarıdan sağlanan geri çağırma fonksiyonu aracılığıyla tıklama olayını üst bileşene iletir.

## Fonksiyon Grupları

### Ana Bileşen
Kullanıcı arayüzünde müşteri adayı etkileşimini sağlayan buton bileşenini oluşturur ve yapılandırır. Bileşen, birincil CTA içeriğini, tıklama olayını ve isteğe bağlı CSS sınıfını dışarıdan alarak esnek bir yapı sunar.
- ClientLeadButton

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, fonksiyon gövdesinden türetilen özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### ClientLeadButton
**Ne yapar**: Bir React fonksiyonel bileşenidir. Bileşen adından ("ClientLeadButton") ve prop isimlerinden ("primaryCta", "onQuoteClick") anlaşılacağı üzere, istemci tarafında bir çağrıya yönlendirme (lead) butonu oluşturmak için kullanılır. Ancak bileşenin docstring'i boş bırakılmıştır, bu nedenle kesin görev tanımı kaynak kodda belirtilmemiştir.

**Nasıl yapar**: Bileşen, aldığı prop'lara göre bir buton render eder. `primaryCta` prop'u buton üzerinde gösterilecek birincil çağrı-metni (call-to-action) metnini taşır. `onQuoteClick` prop'u, butona tıklandığında çağrılacak olan geri çağırma (callback) fonksiyonunu temsil eder. `className` prop'u ise bileşenin kök elemanına uygulanacak ek CSS sınıf adlarını belirtir. Bileşenin iç mantığı ve render ettiği JSX yapısı verilen kaynak bilgide yer almamaktadır.

**Parametreler**:
- primaryCta: bilinmiyor — Bileşenin birincil çağrı-metni (CTA) içeriğini taşıyan prop. Tip bilgisi verilen kaynakta belirtilmemiştir.
- onQuoteClick: bilinmiyor — Butona tıklandığında tetiklenecek olan geri çağırma fonksiyonu. Tip bilgisi verilen kaynakta belirtilmemiştir.
- className: bilinmiyor — Bileşenin kök elemanına eklenecek isteğe bağlı CSS sınıf adı. Tip bilgisi verilen kaynakta belirtilmemiştir.

**Dönüş**: `React.FC<ClientLeadButtonProps>` — React fonksiyonel bileşeni döndürür. `ClientLeadButtonProps` arayüzü, yukarıda listelenen `primaryCta`, `onQuoteClick` ve `className` prop'larını tanımlayan bir tip ipucudur. Bu arayüzün tam yapısı verilen kaynak bilgide ayrıntılı olarak belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: react::React

---

## INTERFACES

### ClientLeadButtonProps
- `primaryCta: string`
- `onQuoteClick?: () => void`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/ClientLeadButton.tsx::ClientLeadButton
- **params**: `primaryCta`, `onQuoteClick`, `className`
- **ic_degiskenler**:
  - `primaryCta` — buton içindeki `<span>` etiketinde gösterilen birincil çağrı metni
  - `onQuoteClick` — butona tıklandığında çağrılacak opsiyonel fonksiyon; tanımlıysa onClick handler'ı bu fonksiyonu çağırır, tanımlı değilse `window.openLeadModal` denenir
  - `className` — butonun CSS sınıfı; tanımlıysa kullanılır, tanımlı değilse varsayılan bir CSS sınıf dizesi atanır (`"group relative h-16 px-12 bg-white text-slate-950 font-bold uppercase text-xs tracking-hvac-normal rounded-2xl overflow-hidden transition-colors hover:shadow-white-glow"`)
- **Dönüş**: JSX — bir `<button>` elementi; içinde `<span>` (metin) ve `<div>` (hover animasyon katmanı) alt elemanları barındırır

### [N2_NASIL] AST Pointer: src/components/home/ClientLeadButton.tsx::ClientLeadButton::onClick
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onQuoteClick` — closure ile dışarıdan gelen fonksiyon; tanımlı ve truthy ise çağrılır
  - `window` — global nesne; `typeof window !== "undefined"` kontrolü ile tarayıcı ortamı doğrulanır, ardından `'openLeadModal' in window` ve `typeof window.openLeadModal === 'function'` kontrolleri yapılır; her ikisi de geçerliyse `window.openLeadModal()` çağrılır
- **Dönüş**: yok (void) — yan etki olarak `onQuoteClick()` veya `window.openLeadModal()` çağrısı yapar

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