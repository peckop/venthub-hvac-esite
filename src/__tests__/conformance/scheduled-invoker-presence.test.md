---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\__tests__\conformance\scheduled-invoker-presence.test.ts
skeleton_hash: 0b107c370d26f4ae
entity_hashes:
  func:yorumsuz: 5c2dbaa6ae910a23
  overview: 5f81e986a2087704
generated_at: 2026-08-24T12:43:35Z
---

## Genel Bakış

Bu modül, zamanlanmış çağırıcının (scheduled invoker) varlığını doğrulayan bir uyumluluk test dosyasıdır. `conformance` klasöründe yer alır ve projenin beklenen mimari yapıya uygunluğunu sınar. Test sürecinde kullanılan tek bir yardımcı fonksiyon içerir.

## Fonksiyon Grupları

### Test Yardımcıları
Kaynak kodundaki yorum satırlarını temizleyerek testlerin kod yapısını daha net incelemesini sağlayan yardımcı fonksiyon.
- yorumsuz

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Verilen kaynak yalnızca fonksiyon imzası (`yorumsuz(kaynak: string) -> string`) ve dört modül sabiti (`KOK`, `WORKFLOW_DIR`, `ZAMANLANMASI_GEREKENLER`, `workflowlar`) içermektedir. Fonksiyon gövdesi sağlanmadığı için, bu fonksiyonun doğru çalışması için hangi koşulların gerekli olduğu belirlenememektedir. Sabitlerin hangi değerleri taşıdığı, `KOK` ve `WORKFLOW_DIR` çağrılarının hangi argümanlarla yapıldığı, `ZAMANLANMASI_GEREKENLER` dizisinin hangi öğeleri içerdiği ve `workflowlar` çağrısının ne döndürdüğü bilinmemektedir. Kaynakta olumsuzluk ifadesi, eşik değeri veya kabul kriteri bulunmamaktadır. Çıkarım yapmak yerine bilinmeyen bilinmiyor olarak bırakılmıştır.

---

## FONKSİYON DETAYLARI

### yorumsuz
**Ne yapar**: Verilen metin içindeki yorum satırlarını (satır başından itibaren `#` karakteriyle başlayan satırlar) ayırarak temiz bir metin döndürür. Docstring'e göre, gerekçe metninde geçen bir adın bu fonksiyon aracılığıyla sıyrılması, o adın ÇAĞIRAN olarak sayılmasını engeller.

**Nasıl yapar**: Kaynak metni satırlara böler (`split` ile, hem `\r\n` hem de `\n` satır sonlarını tanır). Ardından her satırı kontrol eder: satır başından itibaren isteğe bağlı boşluklardan sonra `#` karakteri gelen satırları filtreler (`filter` ile atar). Kalan satırları tekrar `\n` ile birleştirerek tek bir metin olarak döndürür.

**Parametreler**:
- kaynak: string — Yorum satırlarından arındırılacak ham metin. Satır başlarında `#` ile başlayan satırlar yorum olarak kabul edilir ve çıkarılır.

**Dönüş**: string — Yorum satırları çıkarıldıktan sonra kalan saf metin. Orijinal satır sırası korunur; yalnızca `#` ile başlayan satırlar kaldırılır.

---

## İTHALATLAR (IMPORTS)
- import: node:fs::existsSync
- import: node:fs::readFileSync
- import: node:fs::readdirSync
- import: node:path::path
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **KOK** (call) — `path.resolve(__dirname, '../../..')`
- **WORKFLOW_DIR** (call) — `path.join(KOK, '.github/workflows')`
- **ZAMANLANMASI_GEREKENLER** (array) — `[
  {
    fonksiyon: 'order-housekeeping',
    nicin:
      'Ödenmemiş pe...`
- **workflowlar** (call) — `Object.fromEntries(
  readdirSync(WORKFLOW_DIR)
    .filter((f) => f.endsWi...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/__tests__/conformance/scheduled-invoker-presence.test.ts::yorumsuz
- **params**: `kaynak` (string) — yorum satırlarından arındırılacak kaynak metin
- **ic_degiskenler**:
  - `s` — `split` ile bölünen her bir satır; `filter` callback'inde kullanılır, `#` ile başlayan yorum satırlarını elemek için regex ile test edilir
- **Dönüş**: string — yorum satırları (`#` ile başlayan satırlar) kaldırılmış metin

### [N2_NASIL] AST Pointer: src/__tests__/conformance/scheduled-invoker-presence.test.ts::(describe bloğu — ok fonksiyon)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `it` ve `it.each` ile test senaryoları tanımlar

### [N3_NASIL] AST Pointer: src/__tests__/conformance/scheduled-invoker-presence.test.ts::(ölçüm yüzeyi boş değil — it callback)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `workflowlar` nesnesinin en az 6 anahtarı olduğunu ve `ZAMANLANMASI_GEREKENLER` dizisinin boş olmadığını doğrular

### [N4_NASIL] AST Pointer: src/__tests__/conformance/scheduled-invoker-presence.test.ts::(zamanlanmış bir iş var — it.each callback)
- **params**: `{ fonksiyon, nicin }` — `ZAMANLANMASI_GEREKENLER` dizisinden destructure edilen; `fonksiyon` aranacak fonksiyon adı, `nicin` açıklamayı oluşturan neden metni
- **ic_degiskenler**:
  - `bulunan` — `Object.entries(workflowlar)` sonucunu filtreleyip haritalayarak elde edilen workflow adları dizisi; her workflow'un ham metni `yorumsuz` ile yorumlardan arındırılır, ardından `fonksiyon` adını içerip içermediği ve `schedule:` anahtarı bulunup bulunmadığı kontrol edilir; eşleşenlerin adları (`[ad]`) toplanır
- **Dönüş**: yok — `bulunan` dizisinin boş olmadığını (`not.toEqual([])`) assert eder; boşsa hata mesajında `fonksiyon` ve `nicin` bilgileri yer alır

### [N5_NASIL] AST Pointer: src/__tests__/conformance/scheduled-invoker-presence.test.ts::(filter callback — workflow eşleşme)
- **params**: `[, ham]` — `Object.entries(workflowlar)` elemanlarının destructure edilmiş hali; ilk eleman (workflow adı) atlanır, `ham` workflow dosyasının ham içeriği
- **ic_degiskenler**:
  - `govde` — `yorumsuz(ham)` ile elde edilen, yorum satırları kaldırılmış workflow metni; `fonksiyon` adını içerip içermediği (`includes`) ve `schedule:` anahtarı içerip içermediği (regex `^\s*schedule:` multiline) kontrol edilir
- **Dönüş**: boolean — hem `fonksiyon` adını hem de `schedule:` anahtarını içeren workflow'lar için `true`

### [N6_NASIL] AST Pointer: src/__tests__/conformance/scheduled-invoker-presence.test.ts::(ölü kayıt birikmesin — it.each callback)
- **params**: `{ fonksiyon }` — `ZAMANLANMASI_GEREKENLER` dizisinden destructure edilen; kontrol edilecek fonksiyon adı
- **ic_degiskenler**: yok
- **Dönüş**: yok — `existsSync(path.join(KOK, 'supabase/functions', fonksiyon, 'index.ts'))` sonucunun `true` olduğunu assert eder; fonksiyonun uç dosyasının (`index.ts`) varlığını doğrular, yoksa liste bayatlamıştır

---

## NODE ID STANDARD

  file: src\__tests__\conformance\scheduled-invoker-presence.test.ts
  function: src\__tests__\conformance\scheduled-invoker-presence.test.ts::yorumsuz

---

## DISA AKTARILANLAR (EXPORTS)
  export: yorumsuz