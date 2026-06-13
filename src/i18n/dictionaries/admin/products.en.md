---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\products.en.ts
skeleton_hash: b2e337ac5203431f
entity_hashes:
  overview: b4058d53edae1644
generated_at: 2026-06-13T11:15:22Z
---

## Genel Bakış
Bu modül, administrative ürünler yönetimi arayüzünde kullanılacak İngilizce metinleri ve yerel ayarları (i18n sözlüğünü) tanımlayan bir TypeScript veri dosyasıdır. Tek bir `products` sabitini dışa aktararak, ürünlerle ilgili tüm arayüz metinlerini (başlıklar, butonlar, hata mesajları vb.) merkezi bir noktadan yönetmeyi sağlar.

## Fonksiyon Grupları
Bu dosyada herhangi bir fonksiyon veya metot bulunmamaktadır. Modül, yalnızca yapılandırılmış bir veri nesnesi (products sabiti) içerir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ürünlerle ilgili İngilizce çeviri anahtarlarını içeren bir i18n sözlük dosyasıdır. Doğru çalışması için aşağıdaki yapısal varsayımlar geçerlidir:

**[Aksiyom 1]:** Eğer `products` nesnesi tanımlı (mevcut) değilse, uygulamadaki ürün sayfalarına ait tüm metinler (başlıklar, butonlar, hata mesajları vb.) görüntülenemez ve i18n çözümleyicisi `undefined` değerler döndürür.

**[Aksiyom 2]:** Eğer `products` nesnesinin herhangi bir anahtarı için değer bir `string` türünde değilse (örn. `undefined`, `null`, `number`), React/Next.js tabanlı UI bileşenlerinde render sırasında tip hatası oluşur.

**[Aksiyom 3]:** Eğer bu dosya i18n yapılandırmasında İngilizce (`en`) dil sözlüğü olarak kayıtlı değilse, İngilizce dil tercih eden kullanıcılar için ürün sayfası metinleri fallback diline yönlendirilir; fallback dil de tanımlı değilse metin alanları boş kalır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **products** (object) — `{
      toolbar: {
        categoryTitle: 'Category',
        allCategories: ...`

---

## AST POINTERS

Bu dosya **fonksiyon içermeyen**, sadece i18n (uluslararasılaştırma) sözlüğü tanımlayan bir veri dosyasıdır.

---

### [N1_DOSYA] AST Pointer: src/i18n/dictionaries/admin/products.en.ts::products
- **params**: (fonksiyon değil — sabit nesne tanımı)
- **ic_degiskenler**: (yok — doğrudan nesne literal'i)
- **Dönüş**: `products` object — Admin ürünler sayfası için İngilizce çeviri metinlerini içeren sözlük nesnesi

**Tanımlı Structure (nesne anahtarları)**:

| Anahtar | Tür | Açıklama |
|---------|-----|----------|
| `products` | object | Tüm ürün sayfası çevirilerini barındıran kök nesne |

---

**Not**: Bu dosyada herhangi bir fonksiyon gövdesi, method, class veya import bulunmamaktadır. Dosya salt veri (translation dictionary) dosyasıdır. Fonksiyonel analiz yapılamaz.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\products.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: products