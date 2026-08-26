---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\searchHighlight.tsx
skeleton_hash: d0885af7ae2aacf0
entity_hashes:
  func:highlightMatch: bf63ff75bf4f9ff9
  overview: 9e26f4040beaf132
  style_tokens: 9f79124e858dad58
generated_at: 2026-08-24T11:56:38Z
---

## Genel Bakış
VentHub HVAC uygulamasının yardımcı modüllerinden biri olan bu React odaklı dosya, arama işlemleri sırasında metin içindeki eşleşen kısımları kullanıcı arayüzünde vurgulamak amacıyla geliştirilmiştir. Ham metin ve girilen arama sorgusunu işleyerek, eşleşen bölümleri belirginleştirilmiş bir React görüntü elemanına dönüştürür.

## Fonksiyon Grupları
### Arama Eşleşmesi Vurgulama İşlevleri
Modülün tek temel sorumluluğunu yerine getiren bu grup, metin ve arama sorgusunu alarak eşleşen bölgeleri görsel olarak ayırt edilebilir hale getiren temel işlevi barındırır. Dil parametresi aracılığıyla farklı dillerdeki metin işleme davranışını destekler.
- highlightMatch

## Bağımlılıklar ve Mimari Notlar
- **Dış bağımlılıklar**: Modül, React kütüphanesine bağlıdır; döndürülen değer `ReactNode` türündedir ve JSX sözdizimi gerektirir.
- **Dinamik/lazy yükleme**: Modülde dinamik yükleme mekanizması bulunmamaktadır.
- **Mimari önem**: Uygulama genelinde arama sonuçlarının kullanıcıya sunulmasında merkezi bir yardımcı rol üstlenir; arama arayüzüne sahip tüm bileşenler tarafından kullanılabilir.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### highlightMatch
**Ne yapar**: Belirli bir metin içinde aranan terimi bulup `<mark>` etiketiyle vurgular. Eşleştirme dile duyarlı ve aksan duyarsızdır; `foldForSearch` fonksiyonu sayesinde kullanıcı "siginak" yazdığında "Sığınak Fanı" içindeki terim de vurgulanır. Eski sürüm `String.prototype.toLowerCase()` ve `RegExp` `i` bayrağı kullanıyordu; ikisi de aksan duyarsız eşleme sağlayamıyordu.

**Nasıl yapar**: Fonksiyon önce arama terimini ve ana metni `foldForSearch` ile aksan duyarsız hale getirir (katlar). Katlama işlemi tek-tek harf eşlemesi kurar; ancak bazı girdilerde (örneğin `ß` → `ss` gibi) katlanan metin uzunluğu orijinal metin uzunluğundan farklı olabilir. Bu durumda indeksler kayacağından yanlış aralık işaretlenebilir; bu nedenle uzunluk uyuşmazlığında fonksiyon vurgulama yapmadan orijinal metni aynen döndürür. Yanlış vurgu, vurgu yokluğundan daha kötüdür ilkesiyle hareket eder. Uzunluklar eşleşiyorsa katlanmış metin üzerinde `indexOf` ile iteratif arama yapar, bulunan her eşleşme noktasında metni parçalara böler ve eşleşen kısımları `<mark>`, eşleşmeyen kısımları `<span>` etiketleriyle sararak bir ReactNode ağacı oluşturur.

**Parametreler**:
- text: string — Vurgulama yapılacak ana metin
- query: string — Aranan terim
- lang: string — Aktif dil (varsayılan `'tr'` — vitrinin birincil dili)

**Dönüş**: `ReactNode` — Arama terimiyle eşleşen kısımları `<mark>` etiketiyle (sarı arka plan, lacivert yazı, yarı kalın, yuvarlatılmış köşe ve yatay dolgu ile) vurgulanmış, geri kalan kısımları `<span>` ile sarılmış metin parçalarından oluşan bir React bileşen ağacı. Arama terimi boşsa veya katlama sonrası uzunluk uyuşmazlığı varsa orijinal metin aynen döndürülür. Eşleşme bulunamaması durumunda da orijinal metin döndürülür.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/case::foldForSearch
- import: react::React
- import: react::ReactNode

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/searchHighlight.tsx::highlightMatch
- **params**: `text` (string), `query` (string), `lang` (string, varsayılan `'tr'`)
- **ic_degiskenler**:
  - `aranan` — `query.trim()` ile elde edilen, baştaki ve sondaki boşluklardan arındırılmış arama terimi
  - `katliMetin` — `foldForSearch(text, lang)` ile elde edilen, büyük/küçük harf duyarsız hale getirilmiş metin
  - `katliAranan` — `foldForSearch(aranan, lang)` ile elde edilen, büyük/küçük harf duyarsız hale getirilmiş arama terimi
  - `parcalar` — `{ metin: string; vurgulu: boolean }[]` tipinde, metnin eşleşen ve eşleşmeyen parçalarını tutan dizi
  - `imlec` — `number` tipinde, `katliMetin` içinde arama yapılmaya devam edilecek konumu gösteren işaretçi
  - `bulundu` — `katliMetin.indexOf(katliAranan, imlec)` ile elde edilen, arama teriminin `katliMetin` içinde bulunduğu indeks; `-1` ise eşleşme yok demektir
  - `p` — `.map()` döngüsündeki her bir parça nesnesi (`{ metin: string; vurgulu: boolean }`)
  - `i` — `.map()` döngüsündeki mevcut elemanın indeksi
- **Dönüş**: `ReactNode` — eşleşme bulunamazsa düz `text` döner; eşleşme varsa `<span>` içinde vurgulanan kısımları `<mark>` (CSS sınıfları: `bg-yellow-100 text-primary-navy font-semibold rounded-sm px-0.5`), diğer kısımları `<span>` olarak döndüren JSX ağacı döner

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