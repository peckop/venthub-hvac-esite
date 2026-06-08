---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx
skeleton_hash: 7d5c012893992ce0
entity_hashes:
  func:getEffectiveStatus: 23e3045303173787
  overview: 7398a7c041f3dd25
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış
Bu modül, yönetici sipariş panelinin test dosyasıdır ve test senaryoları sırasında kullanılacak yardımcı fonksiyonları içerir. Temel olarak siparişlerin etkili durumunu hesaplayan bir işlev sunarak test süreçlerinin tutarlılığını sağlar.

## Fonksiyon Grupları
### Test Yardımcı Fonksiyonları
Test senaryoları sırasında sipariş verilerinin durumunu hesaplamak ve doğrulamak için kullanılan yardımcı işlevleri barındırır.
- getEffectiveStatus

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel mimari varsayımlar, `getEffectiveStatus` fonksiyonunun çalışması için gerekli giriş verisi yapısına ve beklenen çıktının türüne ilişkindir.

[Aksiyom 1]: Eğer `order` parametresi `null` veya `undefined` ise, fonksiyon bir hata fırlatır veya tanımsız davranış gösterir.
[Aksiyom 2]: Eğer `order` bir nesne ise ancak `status` alanını içermiyorsa veya `status` alanı `undefined` ise, fonksiyon varsayılan bir durum (örn: 'beklemede') döndürür.
[Aksiyom 3]: Fonksiyon, herhangi bir girdi için her zaman bir string (durum) değeri döndürmek zorundadır. Hiçbir durumda `null`, `undefined` veya başka bir türde değer dönmemelidir.

---

## FONKSİYON DETAYLARI

### getEffectiveStatus
**Ne yapar**: Gelen sipariş nesnesinin geçerli durumunu döndüren, tanımlanmamış durumlarda varsayılan beklemede durumunu atayan yardımcı bir fonksiyondur. Admin sipariş paneli testlerinde kullanılarak tüm işlenen siparişlerin standart bir duruma sahip olmasını garanti eder.
**Nasıl yapar**: Basit bir mantıksal kontrol ile çalışır, sipariş nesnesi üzerindeki status özelliğinin tanımlı ve geçerli olup olmadığını kontrol eder. Eğer siparişte geçerli bir durum değeri mevcutsa doğrudan bu değeri iletir, eğer durum tanımlı değilse varsayılan olarak 'pending' (beklemede) string değerini döndürür.
**Parametreler**:
- order: unknown — Durumu kontrol edilecek sipariş nesnesi, herhangi bir tipten veri alabilir çünkü fonksiyon dinamik olarak nesne üzerindeki status özelliğini okur, belirli bir tip kısıtlaması uygulanmaz.
**Dönüş**: string — Siparişin geçerli durumu, eğer siparişte tanımlı geçerli bir status değeri varsa o değer, aksi takdirde varsayılan 'pending' değeri döndürülür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/admin/__tests__/AdminOrdersBoard.test.tsx`::getEffectiveStatus
- **params**: `order: unknown` — Ham sipariş nesnesi, tipi bilinmeyen herhangi bir değer olabilir
- **ic_degiskenler**:
  - `o` — `order` parametresinin `Record<string, unknown>` olarak tip assert edilmiş hali; dict alanlarına erişim için kullanılır
- **Erisimler**:
  - `o.payment_status` — Siparişin ödeme durumu; `'refunded'` veya `'partial_refunded'` kontrolü yapılır
  - `o.status` — Siparişin genel durumu; payment_status eşleşmezse fallback olarak kullanılır
- **Dönüş**: `string` — Öncelik sırasıyla `o.payment_status` (refunded/partial_refunded ise), ardından `o.status`, son olarak `'pending'` string değeri döner

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminOrdersBoard.test.tsx
  function: src\views\admin\__tests__\AdminOrdersBoard.test.tsx::getEffectiveStatus

---

## DISA AKTARILANLAR (EXPORTS)
  export: getEffectiveStatus

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