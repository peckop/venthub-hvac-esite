---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx
skeleton_hash: eaf39fa2341ceb17
generated_at: 2026-05-23T22:36:43Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun yönetici arayüzündeki sipariş paneli bileşeninin (AdminOrdersBoard) test dosyasıdır. Yönetici sipariş paneliyle ilgili test senaryolarında kullanılacak yardımcı fonksiyonları barındırarak testlerin tutarlı ve doğru çalışmasını sağlar.

## Fonksiyon Grupları
### Test Yardımcı Fonksiyonları
Test süreçlerinde ihtiyaç duyulan sipariş durumu hesaplaması gibi özel işlemleri gerçekleştiren, test senaryolarında kullanılan tekrar kullanılabilir yardımcı fonksiyonları barındırır.
- getEffectiveStatus

---

## AXIOMS – Mimari Varsayımlar
Bu test modülünün AdminOrdersBoard yönetici sipariş paneli bileşenini ve içerdiği sipariş durumu hesaplama mantığını doğru şekilde test edebilmesi için sipariş veri yapısı, test ortamı bağımlılıkları ve temel fonksiyon implementasyonunun belirli zorunlu koşulları sağlaması gerekmektedir.

[Aksiyom 1]: Eğer getEffectiveStatus fonksiyonuna iletilen order nesnesi beklenen sipariş veri yapısına sahip değilse, etkili sipariş durumu doğru hesaplanamaz ve tüm durum bazlı test senaryoları başarısız olur.
[Aksiyom 2]: Eğer test modülünün çalıştığı ortamda TypeScript derleyicisi, React Testing Library ve AdminOrdersBoard bileşeninin tüm üretim bağımlılıkları mevcut değilse, testler hiç çalıştırılamaz ve bileşenin işlevselliği hiçbir şekilde doğrulanamaz.
[Aksiyom 3]: Eğer getEffectiveStatus fonksiyonunun ana üretim kodundaki gerçek implementasyonu test modülünde varsayılan davranışla tutarsızsa, testler geçersiz sonuçlar üretir ve AdminOrdersBoard'un canlı ortamda doğru çalışması garantilenemez.

---

## FONKSIYON DETAYLARI

### getEffectiveStatus
**Ne yapar**: Gelen sipariş nesnesinin geçerli durumunu döndüren, tanımlanmamış durumlarda varsayılan beklemede durumunu atayan yardımcı bir fonksiyondur. Admin sipariş paneli testlerinde kullanılarak tüm işlenen siparişlerin standart bir duruma sahip olmasını garanti eder.
**Nasıl yapar**: Basit bir mantıksal kontrol ile çalışır, sipariş nesnesi üzerindeki status özelliğinin tanımlı ve geçerli olup olmadığını kontrol eder. Eğer siparişte geçerli bir durum değeri mevcutsa doğrudan bu değeri iletir, eğer durum tanımlı değilse varsayılan olarak 'pending' (beklemede) string değerini döndürür.
**Parametreler**:
- order: unknown — Durumu kontrol edilecek sipariş nesnesi, herhangi bir tipten veri alabilir çünkü fonksiyon dinamik olarak nesne üzerindeki status özelliğini okur, belirli bir tip kısıtlaması uygulanmaz.
**Dönüş**: string — Siparişin geçerli durumu, eğer siparişte tanımlı geçerli bir status değeri varsa o değer, aksi takdirde varsayılan 'pending' değeri döndürülür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::getEffectiveStatus
- **params**: [order: unknown]
- **ic_degiskenler**:
  - `o` — order nesnesini Record<string, unknown> tipine cast ederek alanlarına erişmek için kullanılan yerel değişken
  - `o.payment_status` — siparişin ödeme durumunu tutan nesne alanı, iade durumlarını kontrol etmek için kullanılır
  - `o.status` — siparişin genel teslimat durumunu tutan nesne alanı, iade durumu yoksa döndürülmek için kullanılır
- **Dönüş**: string (refunded, partial_refunded, siparişin kendi status değeri veya varsayılan 'pending')

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_1
- **params**: (yok)
- **ic_degiskenler**:
  - `describe` — Vitest test gruplandırma API'si, test suite'lerini tanımlamak için kullanılır
  - `it` — Vitest test tanımlama API'si, bireysel test senaryolarını oluşturmak için kullanılır
  - `expect` — Vitest assertion API'si, test sonuçlarını doğrulamak için kullanılır
  - `COLUMNS` — Column Matching testinde kullanılan sabit dizi, sipariş durumlarını yönetim paneli sütunlarıyla eşler
  - `getColumnForStatus` — yerel fonksiyon, girilen sipariş durumuna uygun sütun kimliğini döndürür
  - `order` — test senaryolarında kullanılan mock sipariş nesneleri, getEffectiveStatus fonksiyonuna girdi olarak verilir
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::getColumnForStatus_1
- **params**: [status: string]
- **ic_degiskenler**:
  - `COLUMNS` — dışarıdan erişilen sütun tanımları dizisi, durum-sütun eşlemelerini içerir
  - `c` — COLUMNS.find metodunda kullanılan geçici eleman, döngüdeki her sütun nesnesi
  - `c.statuses` — sütuna ait tüm durumları içeren dizi, girilen status'un bu listede olup olmadığı kontrol edilir
  - `c.id` — eşleşen sütunun benzersiz kimliği, bulunduğunda döndürülür
- **Dönüş**: string (eşleşen sütun kimliği veya varsayılan 'col_new')

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_2
- **params**: (yok)
- **ic_degiskenler**:
  - `it` — Vitest test tanımlama API'si
  - `expect` — Vitest assertion API'si
  - `order` — mock sipariş nesneleri, getEffectiveStatus fonksiyonuna test girdisi olarak verilir
  - `getEffectiveStatus` — test edilen ana fonksiyon
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_3
- **params**: (yok)
- **ic_degiskenler**:
  - `order` — iade durumu tanımlı mock sipariş nesnesi
  - `expect` — Vitest assertion API'si
  - `getEffectiveStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_4
- **params**: (yok)
- **ic_degiskenler**:
  - `order` — kısmi iade durumu tanımlı mock sipariş nesnesi
  - `expect` — Vitest assertion API'si
  - `getEffectiveStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_5
- **params**: (yok)
- **ic_degiskenler**:
  - `order` — işlenme durumu olan ödemesi tamamlanmış mock sipariş nesnesi
  - `expect` — Vitest assertion API'si
  - `getEffectiveStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_6
- **params**: (yok)
- **ic_degiskenler**:
  - `order` — status alanı tanımlanmamış, ödemesi yapılmamış mock sipariş nesnesi
  - `expect` — Vitest assertion API'si
  - `getEffectiveStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_7
- **params**: (yok)
- **ic_degiskenler**:
  - `COLUMNS` — sütun tanımları dizisi, durum-sütun eşlemelerini içerir
  - `getColumnForStatus` — sütun eşleştirme fonksiyonu
  - `it` — Vitest test tanımlama API'si
  - `expect` — Vitest assertion API'si
- **Dönüş**: yok

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::getColumnForStatus_2
- **params**: [status: string]
- **ic_degiskenler**:
  - `COLUMNS` — dışarıdan erişilen sütun tanımları dizisi
  - `c` — COLUMNS.find metodunda kullanılan geçici sütun nesnesi
  - `c.statuses` — sütuna ait durum listesi, girilen status'un üyeliği kontrol edilir
  - `c.id` — eşleşen sütun kimliği
- **Dönüş**: string (eşleşen sütun kimliği veya varsayılan 'col_new')

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_8
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen sütun eşleştirme fonksiyonu
- **Dönüş**: yok

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_9
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_10
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_11
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_12
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_13
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N17_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_14
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N18_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_15
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N19_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_16
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen fonksiyon
- **Dönüş**: yok

### [N20_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersBoard.test.tsx::anonim_17
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Vitest assertion API'si
  - `getColumnForStatus` — test edilen fonksiyon
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminOrdersBoard.test.tsx
  function: src\views\admin\__tests__\AdminOrdersBoard.test.tsx::getEffectiveStatus

---

## DISA AKTARILANLAR (EXPORTS)
  export: getEffectiveStatus