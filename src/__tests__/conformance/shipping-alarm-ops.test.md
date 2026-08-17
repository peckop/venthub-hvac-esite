---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\shipping-alarm-ops.test.ts
skeleton_hash: 83becf6b78ef5107
entity_hashes:
  func:kod: 238eb6df92e77b61
  func:stripComments: 9a53059c5311e66b
  overview: 6735b03e1a8674ba
generated_at: 2026-08-17T11:01:50Z
---

## Genel Bakış
Bu modül, gönderim alarmlarıyla ilgili operasyonların davranışını doğrulayan bir test modülüdür. Temel olarak, test senaryolarını desteklemek için gerekli yardımcı işlevleri ve dosya okuma işlemlerini sağlar. Modül, kod inceleme ve analiz süreçlerinde yorumların temizlenmesi gibi alt düzey yardımcılar sunarak test altyapısını güçlendirir.

## Fonksiyon Grupları
### Test Destek Yardımcıları
Bu grup, test süreçlerinde gerekli olan temel yardımcı fonksiyonları barındırır. Fonksiyonlar, test verilerinin hazırlanması ve kod analizi için gerekli ön işlemleri yapar.
- stripComments, kod

### Dosya İşlemleri
Bu grup, testlerde kullanılacak kaynak dosyaların dinamik olarak okunmasını sağlar. Modül, test senaryolarının esnek ve yeniden kullanılabilir olmasını destekler.
- kod

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### stripComments
**Ne yapar**: Kod içindeki yorumları (hem tek satırlık `//` hem de çok satırlık `/* */` tarzı) silerek yerine boşluk karakteri koyar, böylece kodun satır ve sütun yapısını bozmadan yorumları temizler.
**Nasıl yapar**: Kod metni üzerinde iki aşamalı bir regex dönüşümü uygular. İlk olarak `/* ... */` ile sınırlanmış çok satırlı yorumları bulur ve bu yorumların içindeki tüm karakterleri (yeni satır `\n` hariç) boşlukla değiştirir; bu sayede yorumun kapladığı satır aralıkları korunurken içeriği temizlenir. Ardından, bir `:` karakterinden sonra gelmeyen ve `//` ile başlayan tek satırlık yorumları bulur; bu yorumların `//` öncesindeki karakteri koruyarak yorumun geri kalanını kaldırır.
**Parametreler**:
- `code: string` — Yorumları temizlenecek ham kaynak kodu metni.
**Dönüş**: `string` — Yorumları boşluk karakterleriyle değiştirilmiş (temizlenmiş) kod metni.

### kod
**Ne yapar**: Verilen yol anahtarına karşılık gelen bir kaynak kodu`edgeSources` nesnesinden alır, bu kodun varlığını test eder (bulunamazsa testi başarısız kılan bir hata fırlatır) ve yorumları temizlenmiş halini döndürür.
**Nasıl yapar**: Fonksiyon, `edgeSources` adlı dış bir nesneden `path` parametresiyle bir kaynak kodu arar. `expect(src, ...).toBeTruthy()` çağrısı ile kaynak kodun varlığını doğrular; eğer kaynak bulunamazsa, sağlanan hata mesajıyla testi durdurur. Kaynak başarıyla bulunduğunda, `stripComments` fonksiyonunu çağırarak koddaki yorumları temizler ve sonucu döndürür.
**Parametreler**:
- `path: string` — `edgeSources` nesnesinde aranacak kaynak kodun yolu (anahtarı).
**Dönüş**: `string` — Yorumları temizlenmiş kaynak kod metni.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **edgeSources** (as_expression) — `import.meta.glob(['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'], {
 ...`
- **workflowFiles** (as_expression) — `import.meta.glob('/.github/workflows/*.yml', {
  query: '?raw',
  import: '...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\shipping-alarm-ops.test.ts::stripComments
- **params**: (code: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: string — verilen kodun yorumlarını çıkarılmış hâli

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\shipping-alarm-ops.test.ts::kod
- **params**: (path: string)
- **ic_degiskenler**: 
  - `src` — edgeSources dict'inden verilen path ile alınan kaynak kod stringi
- **Dönüş**: string — stripComments ile yorumları temizlenmiş kod

---

## NODE ID STANDARD

  file: src\__tests__\conformance\shipping-alarm-ops.test.ts
  function: src\__tests__\conformance\shipping-alarm-ops.test.ts::stripComments
  function: src\__tests__\conformance\shipping-alarm-ops.test.ts::kod

---

## DISA AKTARILANLAR (EXPORTS)
  export: kod
  export: stripComments