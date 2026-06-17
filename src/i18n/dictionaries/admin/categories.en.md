---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\vh-categories\src\i18n\dictionaries\admin\categories.en.ts
skeleton_hash: 8c8b9f5d296d8330
entity_hashes:
  overview: e1ad358253fda567
generated_at: 2026-06-17T19:21:07Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının "Admin" alanındaki "Kategoriler" bölümünün İngilizce dil metinlerini içeren statik bir i18n (uluslararasılaştırma) sözlük dosyasıdır. Modül, uygulamanın kullanıcı arayüzünde gösterilecek kategori isimlerinin İngilizce karşılıklarını tutar ve doğrudan uygulamanın ilgili bileşenleri tarafından içe aktarılıp kullanılır.

## Fonksiyon Grupları
Bu dosyada tanımlanmış herhangi bir fonksiyon veya metot bulunmamaktadır. Dosya, yalnızca dışa aktarılan (`export`) statik bir veri yapısı olan `categories` sabitini içerir. Bu yapı, uygulama genelinde kategori isimlerinin çevrilmiş metinlerine erişim sağlamak için kullanılır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, i18n sistemi tarafından kullanılan statik bir dil sözlüğü dosyasıdır. Doğru çalışması için aşağıdaki yapısal ve içeriksel varsayımlar geçerlidir.

**[Aksiyom 1]:** Eğer `categories` sabiti tanımlı ve geçerli bir nesne değilse, i18n sistemi bu dil sözlüğünü yükleyemez ve kategori adları/çevirileri kullanılamaz.

**[Aksiyom 2]:** Eğer `categories` nesnesinin en az bir anahtar-değer çifti içermiyorsa (nesne boşsa), uygulamada hiçbir kategori adı görüntülenemez ve kategorilerle ilgili tüm arayüz bileşenleri eksik veya hatalı çalışır.

**[Aksiyom 3]:** Eğer `categories` nesnesindeki değerler (çeviri metinleri) `string` tipinde değilse, i18n sistemi bu değerleri doğru işleyemez ve beklenmeyen hatalar oluşabilir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **categories** (object) — `{
  subtitle: 'Manage the product hierarchy and category tree from here.',
...`

---

## AST POINTERS

Bu dosyada **hiç fonksiyon bulunmamaktadır**. Dosya saf bir i18n sözlük dosyasıdır ve yalnızca bir nesne sabiti içerir.

### [SABIT] AST Pointer: `src/i18n/dictionaries/admin/categories.en.ts`::categories

- **Tür**: `object` (i18n sözlük nesnesi)
- **Icerik**: Admin kategorileri için İngilizce çeviri dizeleri
- **Kullanim**: `categories` sabiti, uygulamanınadmin kategorileri bölümündeki metinleri uluslararasılaştırma (i18n) için kullanılır
- **Dönüş**: Yok (nesne dışa aktarılır)

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\categories.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: categories