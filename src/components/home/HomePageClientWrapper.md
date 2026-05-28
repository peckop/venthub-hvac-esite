---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\HomePageClientWrapper.tsx
skeleton_hash: 32ed487f472e7203
entity_hashes:
  func:HomePageClientWrapper: feb3517aa1583d9b
  overview: e9b94ab20ec42ba0
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:35:52Z
---

## Genel Bakış
HomePageClientWrapper, sayfa içeriğinin istemci tarafında render edilmesini sağlayan bir sarmalayıcı React bileşenidir. Bu bileşen, alt öğeleri (`children`) alarak istemci‑özgü yapılandırmaları veya veri sağlayıcılarıyla birlikte sarmalar ve sayfanın tamamen istemci tarafında çalışmasını garanti eder.

## Fonksiyon Grupları
### Sarmalayıcı Bileşen
Bu bileşen, sayfa içeriğinin istemci tarafında işlenmesini yönetmek için kullanılır.
- HomePageClientWrapper

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `children` prop'u verilmezse, `HomePageClientWrapper` hiçbir şey render etmez (React uyarısı verebilir).  
[Aksiyom 2]: Eğer `LeadModal` modülü import edilemez veya çağrılamazsa, çalışma zamanında hata oluşur.  
[Aksiyom 3]: Eğer `children` bir React node (element, string, fragment vb.) değilse, render sırasında beklenmeyen çıktı veya hata oluşabilir.

---

## FONKSİYON DETAYLARI

### HomePageClientWrapper
**Ne yapar**: Verilen `children` propunu saran bir React bileşeni oluşturur.  
**Nasıl yapar**: Fonksiyon, `children` öğesini alır ve bu öğeleri döndürülen JSX içinde render eder, dolayısıyla sarmalayıcı bir rol üstlenir.  
**Parametreler**:  
- children: React.ReactNode — Sarmalanacak içerik veya alt bileşenler.  
**Dönüş**: React.FC<Props> — `children` propunu alıp onu render eden bir fonksiyonel bileşen.

---

## INTERFACES

### Props
- `children: React.ReactNode`

---

## SABİTLER
- **LeadModal** (call) — `React.lazy(() => import('../LeadModal'))`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/HomePageClientWrapper.tsx::HomePageClientWrapper
- **params**: children
- **ic_degiskenler**:
  - `leadOpen` — boolean state indicating whether the lead modal is open
  - `setLeadOpen` — setter function to update the `leadOpen` state
- **Dönüş**: JSX element (React.ReactNode)

### [N2_NASIL] AST Pointer: src/components/home/HomePageClientWrapper.tsx::useEffectCallback
- **params**: yok
- **ic_degiskenler**:
  - `setLeadOpen` — setter function from outer scope used to open the lead modal
  - `window` — global browser object used to check if the environment is undefined and to assign/cleanup the `openLeadModal` handler
- **Dönüş**: cleanup function that removes the `window.openLeadModal` handler

---

## NODE ID STANDARD

  file: src\components\home\HomePageClientWrapper.tsx
  function: src\components\home\HomePageClientWrapper.tsx::HomePageClientWrapper

---

## DISA AKTARILANLAR (EXPORTS)
  export: HomePageClientWrapper

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)