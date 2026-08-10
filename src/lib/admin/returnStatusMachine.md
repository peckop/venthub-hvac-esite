---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\admin\returnStatusMachine.ts
skeleton_hash: d38dc01210646ffc
entity_hashes:
  func:allowedNextStatuses: 2cc7c349dc1ea2c6
  overview: eb1dc3e13feb0c1b
generated_at: 2026-06-19T20:47:59Z
---

## Genel Bakış
İade süreçleri için durum makinesi modülüdür. Mevcut iade durumuna göre bir sonraki adımda geçilebilecek izin verilen durumları hesaplar ve döndürür. İade iş akışının durum geçiş kurallarını merkezi olarak yönetir.

## Fonksiyon Grupları
### Durum Geçiş Kuralları
İade sürecinin izin verilen durum geçişlerini tanımlar ve mevcut duruma göre olası bir sonraki durumları belirler.
- `allowedNextStatuses`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, return (iade) durum makinesi için mevcut durumdan izin verilen sonraki durumları hesaplar. `TRANSITIONS` sabitinde tanımlı geçiş kurallarına dayanır.

**[Aksiyom 1]**: Eğer `TRANSITIONS` sabiti tanımlı değilse veya erişilemezse, `allowedNextStatuses` fonksiyonu çalışamaz ve geçerli durum listesi üretilemez.

**[Aksiyom 2]**: Eğer `current` parametresi, `TRANSITIONS` nesnesinde anahtar (key) olarak mevcut değilse, fonksiyon boş dizi (`[]`) döndürür.

**[Aksiyom 3]**: Eğer `TRANSITIONS` bir durum için boş bir diziye sahipse (geçiş yok), o durumdan çıkış izni olmayan terminal/nihai bir durumdur — fonksiyon boş dizi döndürür.

**[Aksiyom 4]**: Eğer `current` boş string (`""`) olarak verilirse ve `TRANSITIONS` içinde böyle bir anahtar yoksa, sonuç boş dizi olur.

**[Aksiyom 5]**: Fonksiyon her zaman `string[]` (dizi) döndürür — null veya undefined değil.

---

## FONKSİYON DETAYLARI

### allowedNextStatuses
**Ne yapar**: Verilen mevcut durum (status) string'ine karşılık gelen izin verilen sonraki durumların listesini döndürür. Durum_TRANSITIONS sözlüğünde tanımlı değilse veya bilinmiyorsa boş bir dizi döndürerek ileri geçişin mümkün olmadığını belirtir.

**Nasıl yapar**: Fonksiyon, önceden tanımlanmış bir TRANSITIONS nesnesine (durum geçiş haritası) erişir ve `current` parametresini bu nesnenin anahtarı olarak kullanarak ilgili durumun izin verilen sonraki durumlarını bulur. Nullish coalescing operatörü (`??`) kullanılarak, anahtar sözlükte mevcut değilse varsayılan olarak boş bir dizi (`[]`) alınır. Ardından spread operatörü (`...`) ile orijinal dizi referansını paylaşmayan yeni bir kopya oluşturarak dışarıya bırakılır, böylece fonksiyonun dışından TRANSITIONS yapısının değiştirilmesi riski ortadan kalkar.

**Parametreler**:
- `current`: `string` — Kontrol edilmek istenen mevcut durumun adı. Bu değer, izin verilen bir sonraki adımların belirlenmesi için TRANSITIONS sözlüğünde aranacak anahtardır.

**Dönüş**: `string[]` — Verilen mevcut durumdan geçiş yapılabilecek izinli sonraki durumların bir dizisi. Durum sözlükte tanımlı değilse boş bir dizi döner; bu durum, o statüden hiçbir ileri geçişin mümkün olmadığını ve akışın kilitlendiğini ifade eder.

---

## TYPE ALIASES

### ReturnStatus
Bilinen iade statüleri (DB `venthub_returns.status`).
```typescript
type ReturnStatus = | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded'
  | 'cancelled'
```

---

## SABİTLER
- **TRANSITIONS** (object) — `{
  requested: ['approved', 'cancelled'],
  approved: ['in_transit', 'cancell...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/admin/returnStatusMachine.ts::allowedNextStatuses
- **params**: `current: string` — mevcut durum durumunu temsil eden string, TRANSITIONS objesinde hangi durumun izin verilen sonraki durumlarının sorgulanacağını belirtir
- **ic_degiskenler**: (yok — fonksiyon gövdesinde yerel değişken tanımlanmamıştır)
- **Erişimler**:
  - `TRANSITIONS` — dosya seviyesinde tanımlı sabit obje, durum geçiş kurallarını tutar
  - `TRANSITIONS[current]` — mevcut duruma karşılık gelen izin verilen sonraki durumlar dizisine erişim
  - `?? []` — nullish coalescing operatörü, TRANSITIONS[current] undefined/null ise boş dizi kullanılır
- **Dönüş**: `string[]` — `current` durumundan geçilebilecek izin verilen sonraki durumların dizisi; spread operatörü ile orijinal dizi kopyalanarak dönüş yapılır

---

## NODE ID STANDARD

  file: src\lib\admin\returnStatusMachine.ts
  function: src\lib\admin\returnStatusMachine.ts::allowedNextStatuses

---

## DISA AKTARILANLAR (EXPORTS)
  export: ReturnStatus
  export: allowedNextStatuses