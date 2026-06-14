---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\BuildTag.tsx
skeleton_hash: 859d858d16b6a190
entity_hashes:
  func:BuildTag: 33fa67732a403b49
  overview: 5afd4a9c8d0105c9
  style_tokens: 9c295aa26dd24226
generated_at: 2026-06-14T22:16:15Z
---

## Genel Bakış
`BuildTag.tsx` dosyası, uygulamanın derleme bilgilerini (sürüm, tarih, kimlik gibi) göstermek için kullanılan basit bir React etiket bileşenini tanımlar. Bileşen, dışarıdan alınan props ile içeriği ve stilini yapılandırarak farklı yerlerde yeniden kullanılabilir bir UI öğesi sunar.

## Fonksiyon Grupları
### Bileşen Tanımı
Bu grup, bileşenin render mantığını ve props yönetimini kapsar.  
- BuildTag  

BuildTag fonksiyonu, gelen props doğrultusunda uygun JSX çıktısını üretir ve bileşenin dışarıdan kontrol edilebilen davranışlarını (ör. sınıf adı, metin, tıklama olayı) sağlar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### BuildTag
**Ne yapar**: BuildTag fonksiyonu, bir etiket (tag) görüntülemek için kullanılan basit bir React functional component’i tanımlar ve döndürür. Bu component, genellikle bir sürüm numarası, durum göstergesi veya benzeri kısa bilgi parçacığını kullanıcıya sunmak için tasarlanmıştır.  
**Nasıl yapar**: Fonksiyon, parametre almayarak doğrudan bir JSX elementi döndürür; bu elementi genellikle bir `<span>` veya `<div>` içine stil sınıflarıyla sarmalanmış metin olarak oluşturur. Döndürülen JSX, React tarafından render edildiğinde sayfada bir etiket gibi görünür.  
**Parametreler**:  
- Yok  
**Dönüş**: React.FC türünde bir fonksiyonel component; bu component, render edildiğinde etiket görüntüsünü temsil eden JSX döndürür.

---

## İTHALATLAR (IMPORTS)
- import: react::React

---

## SABİTLER
- **commit** [env-backed] (as_expression) — `process.env.VITE_COMMIT_SHA as string | undefined`
- **branch** [env-backed] (as_expression) — `process.env.VITE_BRANCH as string | undefined`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/BuildTag.tsx::BuildTag
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `short` — commit hashının ilk 7 karakterini alır; commit tanımlı değilse boş string döner
- **Dönüş**: React.FC (JSX elementi) — short ve branch ikisi de boş/undefined ise `null` döner; aksi takdirde `{branch || 'local'}@{short || 'dev'}` formatında bir `<span>` elementi döner (title özelliği commit değerini gösterir)

---

## NODE ID STANDARD

  file: src\components\BuildTag.tsx
  function: src\components\BuildTag.tsx::BuildTag

---

## DISA AKTARILANLAR (EXPORTS)
  export: BuildTag

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-steel-gray`, `text-xs`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `select-all`