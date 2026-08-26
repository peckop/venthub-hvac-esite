---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\__tests__\conformance\admin-csv-import-mapping.test.ts
skeleton_hash: a5da9a84843fe608
entity_hashes:
  overview: fc7f25958d4ba2c4
generated_at: 2026-08-24T11:43:59Z
---

## Genel Bakış

Bu dosya, admin panelindeki CSV içe aktarma ve eşleme (mapping) süreçlerinin davranışsal doğruluğunu sınayan bir conformance test modülüdür. Vitest çerçevresini kullanarak `hazirlaUrunSatirlari`, `kategoriIdBul`, `metadataSluglari`, `slugAnahtari` ve `urunSlugUret` fonksiyonlarının beklenen çıktıyı üretip üretmediğini denetler.

Dosya, `fs` ve `path` modülleri aracılığıyla dosya sisteminden test verilerini okur; `KOK`, `BILESEN`, `CAGIRAN` ve `KATEGORILER` sabitleri ise test senaryolarında kullanılan başvuru yollarını ve kategori tanımlarını barındırır. Herhangi bir dış API veya veritabanı sorgulaması yapılmaz; tüm doğrulama saf fonksiyon çıktıları üzerindedir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül sabitleri (`KOK`, `BILESEN`, `CAGIRAN`, `KATEGORILER`) tanımlı olmakla birlikte, fonksiyon gövdeleri sağlanmadığından bu sabitlerin nasıl kullanıldığı, hangi koşullara bağlı oldukları veya hangi sonuçlara yol açtıkları belirlenememektedir. Aksiyom üretimi yalnızca fonksiyon gövdelerinden yapılabildiğinden, mevcut bilgiyle mimari varsayımda bulunulamaz.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: node:fs::fs
- import: node:path::path
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **KOK** (call) — `path.resolve(__dirname, '../../..')`
- **BILESEN** (call) — `path.join(KOK, 'src/components/admin/products/ProductCsvImport.tsx')`
- **CAGIRAN** (call) — `path.join(KOK, 'src/views/admin/ProductsTableBody.tsx')`
- **KATEGORILER** (array) — `[
  { id: 'kat-cati', name: 'Çatı Tipi Fanlar', slug: 'roof-fans', metadata:...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (ürün slug üretimi Türkçe harfi ÇEVİRİR, silmez)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok — `urunSlugUret` fonksiyonunu Türkçe karakterli girdilerle çağırarak dönüş değerlerini `expect(...).toBe(...)` ile sınar

### [N2_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (slug üretimi baştaki/sondaki ve tekrarlı ayırıcıları temizler)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok — `urunSlugUret` fonksiyonunu kenar durum girdileriyle çağırarak dönüş değerlerini sınar

### [N3_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (kategori kanonik slug ile eşleşir)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok — `kategoriIdBul` fonksiyonunu kanonik slug ve `KATEGORILER` sabiti ile çağırarak dönüş değerini sınar

### [N4_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (kategori dile özgü slug ile eşleşir)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok — `kategoriIdBul` fonksiyonunu Türkçe slug ve `KATEGORILER` sabiti ile çağırarak dönüş değerini sınar

### [N5_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (kategori ADIYLA da eşleşir)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok — `kategoriIdBul` fonksiyonunu kategori adı ve `KATEGORILER` sabiti ile çağırarak dönüş değerini sınar

### [N6_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (SLUG, ADIN ÖNÜNDE gelir)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok — `kategoriIdBul` fonksiyonunu çakışan slug/ada sahip durumda çağırarak slug'ın öncelikli olduğunu sınar

### [N7_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (eşleşmeyen değer null döner)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok — `kategoriIdBul` fonksiyonunu var olmayan, boş ve boşluklu girdilerle çağırarak `toBeNull()` ile sınar

### [N8_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (bozuk metadata şekli çökmez)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok — `metadataSluglari` fonksiyonunu null, metin, nesne ve dizi girdilerle çağırarak boş dizi döndüğünü sınar

### [N9_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (karşılaştırma anahtarı İKİ TARAFA da uygulanır)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok — `slugAnahtari` fonksiyonunu Türkçe ve Latin harfli girdilerle çağırarak eşit sonuç döndüğünü sınar

### [N10_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (Türkçe adlı + slug ile kategorilenmiş CSV satırı DOĞRU çözülür)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `satir` — test verisi nesnesi; `name` alanı `'Çatı Tipi Fan Küçük'`, `category_slug` alanı `'cati-tipi-fanlar'` değerlerini taşır
- **Dönüş**: yok — `urunSlugUret` ve `kategoriIdBul` fonksiyonlarını `satir.name` ve `satir.category_slug` ile çağırarak harf silinmediğini ve kategori null olmadığını sınar

### [N11_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (bileşen saf modülü kullanır)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `bilesen` — `fs.readFileSync(BILESEN, 'utf8')` ile okunan bileşen dosyasının metin içeriği
  - `cagiran` — `fs.readFileSync(CAGIRAN, 'utf8')` ile okunan çağıran dosyasının metin içeriği
- **Dönüş**: yok — `bilesen` metninde `csvProductMapping` import'u ve `hazirlaUrunSatirlari(` çağrısı bulunduğunu, `payloads.push(` bulunmadığını regex ile sınar

### [N12_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (eski kusur kalıpları geri gelmez)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok; `bilesen` üst scope'tan gelir)
- **Dönüş**: yok — `bilesen` metninde `c.name.toLowerCase()` ve `[^\w-]` kalıplarının bulunmadığını regex ile sınar

### [N13_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (eşleşmeyen kategori SESSİZ GEÇİLMEZ)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok; `bilesen` üst scope'tan gelir)
- **Dönüş**: yok — `bilesen` metninde `reddedilen`, `unknownCategoryTitle`, `unknownCategoryHelp` ifadelerinin bulunduğunu regex ile sınar

### [N14_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (VERİ YOLU: çağıran slug ve metadata da çeker)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok; `cagiran` üst scope'tan gelir)
- **Dönüş**: yok — `cagiran` metninde `.select('id,name,slug,metadata')` sorgu kalıbının bulunduğunu regex ile sınar

### [N15_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (kategorisi çözülemeyen satır YAZILMAZ ve reddedilenlere düşer)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `sonuc` — `hazirlaUrunSatirlari` fonksiyonunun dönüş nesnesi; `sonuc.payloads` (başarılı satırlar dizisi) ve `sonuc.reddedilen` (reddedilen satırlar dizisi) alanlarını içerir
- **Dönüş**: yok — `sonuc.payloads` içinde yalnız geçerli kategorili satırın sku'sunun bulunduğunu, `sonuc.reddedilen` içinde geçersiz kategori slug'ının yer aldığını sınar

### [N16_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (çözülen satırın kategori kimliği ve slug ı yazılır)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `payloads` — `hazirlaUrunSatirlari` dönüşünden destructure edilen başarılı satırlar dizisi
- **Dönüş**: yok — `payloads[0].category_id` ve `payloads[0].slug` değerlerinin beklenen değerlere eşit olduğunu sınar

### [N17_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (category_id doğrudan verilmişse eşleme denenmez)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `payloads` — `hazirlaUrunSatirlari` dönüşünden destructure edilen başarılı satırlar dizisi
  - `reddedilen` — `hazirlaUrunSatirlari` dönüşünden destructure edilen reddedilen satırlar dizisi
- **Dönüş**: yok — `reddedilen` uzunluğunun 0 olduğunu ve `payloads[0].category_id` değerinin doğrudan verilen `'elle-verilen-id'` olduğunu sınar

### [N18_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (kategori sütunu hiç yoksa satır normal yazılır)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `payloads` — `hazirlaUrunSatirlari` dönüşünden destructure edilen başarılı satırlar dizisi
  - `reddedilen` — `hazirlaUrunSatirlari` dönüşünden destructure edilen reddedilen satırlar dizisi
- **Dönüş**: yok — `reddedilen` uzunluğunun 0 olduğunu ve `payloads[0].category_id` değerinin `undefined` olduğunu sınar

### [N19_NASIL] AST Pointer: admin-csv-import-mapping.test.ts::() => (sku veya name eksik satır sessizce atlanır)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `payloads` — `hazirlaUrunSatirlari` dönüşünden destructure edilen başarılı satırlar dizisi
- **Dönüş**: yok — `payloads` içinde yalnız sku ve name alanları dolu olan satırın (`'A-3'`) bulunduğunu sınar

---

## NODE ID STANDARD

  file: src\__tests__\conformance\admin-csv-import-mapping.test.ts