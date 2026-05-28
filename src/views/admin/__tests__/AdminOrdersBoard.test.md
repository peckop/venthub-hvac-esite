---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx
skeleton_hash: eaf39fa2341ceb17
entity_hashes:
  func:getEffectiveStatus: 23e3045303173787
  overview: e7b9a89704c3bbc1
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:39:15Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun yönetici sipariş paneli (AdminOrdersBoard) için yazılmış bir test dosyasıdır. Modülün temel amacı, test senaryoları sırasında kullanılacak yardımcı fonksiyonları sunarak testlerin güvenilirliğini ve tekrar kullanılabilirliğini sağlamaktır.

## Fonksiyon Grupları
### Test Yardımcı Fonksiyonları
Test süreçlerinde ortak ihtiyaçları karşılamak üzere tasarlanmış, tekrar kullanılabilir yardımcı işlevleri barındırır.
- getEffectiveStatus

---

## AXIOMS – Mimari Varsayımlar
Bu test modülünün AdminOrdersBoard yönetici sipariş paneli bileşenini ve içerdiği sipariş durumu hesaplama mantığını doğru şekilde test edebilmesi için sipariş veri yapısı, test ortamı bağımlılıkları ve temel fonksiyon implementasyonunun belirli zorunlu koşulları sağlaması gerekmektedir.

[Aksiyom 1]: Eğer getEffectiveStatus fonksiyonuna iletilen order nesnesi beklenen sipariş veri yapısına sahip değilse, etkili sipariş durumu doğru hesaplanamaz ve tüm durum bazlı test senaryoları başarısız olur.
[Aksiyom 2]: Eğer test modülünün çalıştığı ortamda TypeScript derleyicisi, React Testing Library ve AdminOrdersBoard bileşeninin tüm üretim bağımlılıkları mevcut değilse, testler hiç çalıştırılamaz ve bileşenin işlevselliği hiçbir şekilde doğrulanamaz.
[Aksiyom 3]: Eğer getEffectiveStatus fonksiyonunun ana üretim kodundaki gerçek implementasyonu test modülünde varsayılan davranışla tutarsızsa, testler geçersiz sonuçlar üretir ve AdminOrdersBoard'un canlı ortamda doğru çalışması garantilenemez.

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

### [N1_NASIL] AST Pointer: src\views\admin\__tests__\AdminOrdersBoard.test.tsx::getEffectiveStatus
- **params**: (order: unknown)
- **ic_degiskenler**:
  - `o` — `order` parametresinin `Record<string, unknown>` tipine dönüştürülmüş hali. Fonksiyon içinde `o.payment_status` ve `o.status` özelliklerine erişmek için kullanılır.
- **Dönüş**: string — `payment_status` 'refunded' veya 'partial_refunded' ise onu, aksi halde `status` değerini veya varsayılan olarak 'pending' döner.

### [N2_NASIL] AST Pointer: src\views\admin\__tests__\AdminOrdersBoard.test.tsx::getColumnForStatus
- **params**: (status: string)
- **ic_degiskenler**:
  - `COLUMNS` — Test ortamında tanımlanan sütun dizisi. Her eleman bir nesne olup `id` ve `statuses` özellikleri içerir. Fonksiyon, verilen `status` parametresine göre uygun sütun `id`'sini bulmak için bu dizi üzerinde `find` methodu kullanır.
- **Dönüş**: string — Verilen duruma karşılık gelen sütun `id`'sini döner, bulunamazsa varsayılan olarak 'col_new' döner.

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