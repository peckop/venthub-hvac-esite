---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\searchHighlight.tsx
skeleton_hash: 9a7ae38ff9331cf8
entity_hashes:
  func:highlightMatch: 6d9d01916ecad5ec
  overview: 57ecd39f68f023ec
  style_tokens: 9f79124e858dad58
generated_at: 2026-05-28T22:38:50Z
---

## Genel Bakış
VentHub HVAC uygulamasının yardımcı modüllerinden biri olan bu React odaklı dosya, arama işlemleri sırasında metin içindeki eşleşen kısımları kullanıcı arayüzünde vurgulamak amacıyla geliştirilmiştir. Ham metin ve girilen arama sorgusunu işleyerek, eşleşen bölümleri belirginleştirilmiş bir React görüntü elemanına dönüştürür.

## Fonksiyon Grupları
### Arama Eşleşmesi Vurgulama İşlevleri
Modülün tek temel sorumluluğunu yerine getiren, metin ve arama sorgusunu alarak eşleşen bölgeleri görsel olarak ayırt edilebilir hale getiren temel işlevi barındırır.
- highlightMatch

---

## AXIOMS – Mimari Varsayımlar
Bu TSX modülü, React tabanlı projelerde verilen metin içindeki arama sorgusu ile eşleşen kısımları vurgulamak için tasarlanmıştır, doğru çalışması için girdi parametrelerinin belirlenen türlerde iletilmesi ve çalıştırma ortamının JSX sözdizimini desteklemesi zorunludur.

[Aksiyom 1]: Eğer highlightMatch fonksiyonuna iletilen text parametresi string türünde değilse, metin içindeki eşleşmeler taranamaz ve vurgulama işlemi hiç gerçekleştirilemez.
[Aksiyom 2]: Eğer highlightMatch fonksiyonuna iletilen query parametresi string türünde değilse, hiçbir metin segmenti ile eşleşme kurulamaz, tüm metin vurgulanmadan döndürülür.
[Aksiyom 3]: Eğer modülün çalıştığı ortam JSX sözdizimini desteklemiyorsa, vurgulanan eşleşmeler için oluşturulan etiketler işlenemez ve metin ekrana hatalı şekilde yansıtılır.
[Aksiyom 4]: Eğer fonksiyona iletilen geçerli, eşleşme yaratabilecek uzunlukta bir sorgu (query) yoksa, hiçbir metin segmenti vurgulanamaz, tüm ham metin olduğu gibi döndürülür.

---

## FONKSİYON DETAYLARI

### highlightMatch
**Ne yapar**: Belirtilen ana metin içinde arama sorgusundaki terimi büyük-küçük harf farkı gözetmeksizin (case-insensitive) bulur ve bulunan tüm eşleşmeleri HTML <mark> etiketi ile sararak vurgular. Eğer arama sorgusu boşsa veya metin içinde eşleşme tespit edilemezse orijinal metni olduğu gibi döndürür, sonuç olarak React uygulamalarında doğrudan görüntülenebilecek bir içerik sunar.
**Nasıl yapar**: Öncelikle geçerli bir arama sorgusu olup olmadığını kontrol eder, sorgunun boş veya sadece boşluk karakterlerinden oluşması durumunda doğrudan orijinal metni iletir. Geçerli sorgu durumunda metin ve sorguyu ortak bir harf formatına getirerek case-insensitive eşleşmeleri doğru bir şekilde tespit eder, ana metni parçalara ayırarak eşleşen kısımları <mark> etiketi ile sarmalar ve tüm parçaları birleştirerek React tarafından işlenebilir formda sunar.
**Parametreler**:
- text: string — Vurgulama işleminin uygulanacağı ana metin, arama teriminin üzerinde aranacağı ve eşleşmelerin vurgulanacağı temel içerik
- query: string — Metin içinde aranacak olan terim, eşleşmelerin bu değere göre belirlenmesini sağlayan arama sorgusu
**Dönüş**: ReactNode — React uygulamalarında doğrudan görüntülenebilecek işlenmiş metin. Arama terimiyle eşleşen kısımlar <mark> etiketi ile vurgulanmış olarak sunulur, eşleşme olmaması veya geçersiz sorgu durumunda orijinal metin olduğu gibi döndürülür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\searchHighlight.tsx::highlightMatch
- **params**: (text: string, query: string)
- **ic_degiskenler**:
  - `query.trim()` — Sorgudaki baştaki/sondaki boşlukları temizleyen metod, sorgunun boş olup olmadığını kontrol etmek için kullanılır
  - `escapeRegExp` — Regex özel karakterlerini escape etmek için tanımlanan iç içe fonksiyon
  - `parts` — Orijinal metnin arama sorgusuna göre bölünmüş parçalarını tutan dizi
  - `new RegExp(\`(${escapeRegExp(query)})\`, 'gi') — Metni bölmek için oluşturulan, global, case-insensitif çalışan regex nesnesi
- **Dönüş**: ReactNode (eşleşen kısımları <mark> etiketiyle vurgulanan, sarmalanmış JSX metin elementi)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\searchHighlight.tsx::highlightMatch içi::escapeRegExp
- **params**: (string: string)
- **ic_degiskenler**:
  - `/[.*+?^${}()|[\]\\]/g` — Regex'de özel anlam taşıyan tüm karakterleri eşleştiren regex deseni
  - `'\\$&'` — Replace işleminde eşleşen tüm metni referans gösteren replacement string'i
  - `string.replace()` — Giriş stringindeki özel karakterleri escape etmek için kullanılan string metodu
- **Dönüş**: string (tüm regex özel karakterleri güvenli şekilde escape edilmiş string)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\searchHighlight.tsx::highlightMatch içi::parts.map callback
- **params**: (part: string, i: number)
- **ic_degiskenler**:
  - `part.toLowerCase()` — Mevcut metin parçasını küçük harfe dönüştüren metod, case-insensitif eşleşme kontrolü için kullanılır
  - `query.toLowerCase()` — Arama sorgusunu küçük harfe dönüştüren metod, eşleşme karşılaştırması için kullanılır
  - `<mark key={i} className="bg-yellow-100 text-primary-navy font-semibold rounded-sm px-0.5">` — Eşleşme durumunda render edilen vurgulama etiketi, tanımlı stillere sahip
  - `<span key={i}>{part}</span>` — Eşleşme olmadığında normal metni sarmalamak için kullanılan JSX etiketi
  - `parts.map()` — Tüm metin parçalarını dönerek her biri için uygun JSX elementi oluşturan dizi metodu
- **Dönüş**: ReactNode (her metin parçası için eşleşme durumuna göre oluşturulmuş uygun JSX elementi)

---

## NODE ID STANDARD

  file: src\utils\searchHighlight.tsx
  function: src\utils\searchHighlight.tsx::highlightMatch

---

## DISA AKTARILANLAR (EXPORTS)
  export: highlightMatch

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-yellow-100`, `text-primary-navy`
- **Layout:** `bg-yellow-100`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `px-0.5`, `rounded-sm`