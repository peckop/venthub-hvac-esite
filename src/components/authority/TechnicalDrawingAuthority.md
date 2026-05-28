---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\authority\TechnicalDrawingAuthority.tsx
skeleton_hash: c25fd098e9856261
entity_hashes:
  func:TechnicalDrawingAuthority: fdb68a3fb07822eb
  overview: c71b29f5c3a00fb8
  style_tokens: b07a83f8b2a17b2b
generated_at: 2026-05-28T22:35:40Z
---

## Genel Bakış
`TechnicalDrawingAuthority` bileşeni, teknik çizim verilerini alıp bunları stil sınıflarıyla birlikte görsel bir temsile dönüştürür. Çizim listesini ve isteğe bağlı CSS sınıflarını kullanarak UI’da uygun bir şekilde render eder.

## Fonksiyon Grupları
### Render ve Görsel Oluşturma
Bu grup, bileşenin aldığı `drawings` ve `className` parametrelerini kullanarak JSX çıktısını üretir; her bir çizimi uygun HTML öğelerine yerleştirerek ve ek stiller uygulayarak görsel temsili sağlar.  
- TechnicalDrawingAuthority

---

## AXIOMS – Mimari Varsayımlar  
Bu modülün doğru çalışması için aşağıdaki varsayımlar gerekir.

[Aksiyom 1]: Eğer `drawings` tanımlı değilse (undefined veya null), `TechnicalDrawingAuthority` bileşeni `drawings` üzerinde iterasyon yapamadığından hata fırlatır veya hiçbir çizim render etmez.  
[Aksiyom 2]: Eğer `drawings` bir dizi (iterable) değilse, bileşen `map` gibi yöntemleri kullanamadığından render sırasında bir istisna oluşur.  
[Aksiyom 3]: Eğer `className` prop’u string türünde değilse, bileşene geçirilen sınıf özniteliği beklenildiği gibi uygulanmayabilir ve DOM’da sınıf ataması başarısız olabilir.  
[Aksiyom 4]: Eğer `formatColors` sabiti tanımlı değilse (undefined veya null), bileşen stil tanımlarını bu nesnedan alamadığı için renk stilleri uygulanamaz veya varsayılan stillere döner.  
[Aksiyom 5]: Eğer `formatColors` bir obje değilse, stil özelliklerine erişim çalışma zamanında başarısız olur ve görsel çıktı beklenen renkleri gösteremeyebilir.

---

## FONKSİYON DETAYLARI

### TechnicalDrawingAuthority
**Ne yapar**: Teknik doküman ve çizimlerin otorite standartlarına uygun olarak görüntülenmesini sağlar; versiyon takibi ve format bazlı görsel ayrıştırma işlevini içerir.  
**Nasıl yapar**: `drawings` prop’undan gelen teknik çizim listesini yineleyerek her bir çizimini versiyon bilgisi ve format türüne göre uygun stil ve bileşenlerle render eder; ayrıca `className` prop’uyla dış stil sınıflarını kabul ederek bileşenin görünümünü özelleştirmeye olanak tanır.  

**Parametreler**:
- drawings: type not specified — Görüntülenecek teknik çizimlerin koleksiyonu; her eleman versiyon ve format bilgisi içerir.  
- className: string — Bileşene ek CSS sınıfları eklemek için kullanılan isteğe bağlı string; varsayılan değeri boş string ('') olup, stil özelleştirmesi sağlar.  

**Dönüş**: void (fonksiyon bir JSX elementi render eder ve açık bir değer döndürmez).

---

## INTERFACES

### TechnicalDrawingAuthorityProps
- `drawings: TechnicalDrawingMetadata[]`
- `className?: string`

---

## SABİTLER
- **formatColors** (object) — `{
    pdf: 'bg-red-50 text-red-600 border-red-100',
    dwg: 'bg-blue-50 te...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/authority/TechnicalDrawingAuthority.tsx::TechnicalDrawingAuthority
- **params**: drawings, className = ''
- **ic_degiskenler**:
  - `formatColors` — object mapping drawing format strings to CSS class strings used to style the format indicator.
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/authority/TechnicalDrawingAuthority.tsx::TechnicalDrawingAuthority.map
- **params**: doc, idx
- **ic_degiskenler**:
  - `doc` — object containing drawing metadata (id, format, category, version, title, url, lastUpdated).
  - `idx` — numeric index of the drawing in the drawings array, used to calculate animation delay.
  - `formatColors` — object mapping format strings to CSS class strings for styling the format badge.
  - `FileText` — icon component from lucide-react representing a file, used to display the drawing type.
  - `Download` — icon component from lucide-react representing a download action, used in the download link.
  - `Clock` — icon component from lucide-react representing a clock, used to show last updated timestamp.
  - `Info` — icon component from lucide-react representing an info symbol, used to prefix the format label.
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\authority\TechnicalDrawingAuthority.tsx
  function: src\components\authority\TechnicalDrawingAuthority.tsx::TechnicalDrawingAuthority

---

## DISA AKTARILANLAR (EXPORTS)
  export: TechnicalDrawingAuthority

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-slate-100`, `bg-slate-50`, `bg-white`, `border-slate-100`, `border-slate-200`, `group-hover:text-primary-navy`, `hover:bg-primary-navy`, `hover:border-primary-navy/30`, `hover:text-white`, `text-industrial-gray`, `text-slate-400`, `text-slate-500`, `text-slate-600`, `text-sm`, `text-xs`
- **Layout:** `flex`, `flex-col`, `gap-4`, `grid`, `grid-cols-1`, `h-12`, `hover:shadow-md`, `items-center`, `justify-between`, `justify-center`, `md:grid-cols-2`, `p-3`, `p-4`, `shadow-sm`, `w-12`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${className`, `${formatColors[doc.format]`, `border`, `font-black`, `font-bold`, `group`, `leading-tight`, `mr-1`, `mt-1`, `px-1.5`, `py-0.5`, `rounded`, `rounded-2xl`, `rounded-xl`, `space-x-2`