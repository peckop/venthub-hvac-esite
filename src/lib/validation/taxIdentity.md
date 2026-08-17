---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-legal\src\lib\validation\taxIdentity.ts
skeleton_hash: 31da013c1079f394
entity_hashes:
  func:isValidTckn: 7ec7d15674d2771b
  func:isValidVkn: ac71f2b99077b21a
  overview: 73a3a50bbf3ac748
generated_at: 2026-08-16T05:32:43Z
---

## Genel Bakış
Bu modül, Türkiye'ye özgü iki önemli kimlik doğrulama numarasının geçerlilik kontrolünü sağlar: TCKN (TC Kimlik Numarası) ve VKN (Vergi Kimlik Numarası). Modül, form validasyon süreçlerinde ve kullanıcı girişi doğrulama akışlarında kullanılmak üzere temel doğrulama mantığını içeren bağımsız bir yardımcı modüldür.

## Fonksiyon Grupları
### Kimlik Numarası Doğrulama
Bireysel ve kurumsal kullanıcılar için Türkiye Cumhuriyeti tarafından verilen resmi kimlik numaralarının format ve algoritma bazlı doğrulamasını yapar.
- `isValidTckn`, `isValidVkn`

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### isValidTckn

**Ne yapar**: T.C. Kimlik Numarasının (11 haneli) resmi algoritmaya uygun olarak geçerli olup olmadığını doğrular. Türkiye Cumhuriyeti vatandaşlarının kimlik numaralarının resmi format ve kontrol hane kurallarını doğrulayan bir validasyon fonksiyonudur.

**Nasıl yapar**: Fonksiyon öncelikle regex deseni (`/^[1-9][0-9]{10}$/`) ile değerin tam olarak 11 haneden oluştuğunu ve ilk hanenin 0 olmadığını kontrol eder. Geçerli format onaylandıktan sonra, rakamlar bir diziye dönüştürülür ve tek/çift pozisyondaki hanelerin toplamları ayrı ayrı hesaplanır. 10. hane kontrolü için `((tekler × 7 − çiftler) % 10)` formülü uygulanır; JavaScript'te modulus operatörünün negatif değerlerde beklenmedik sonuçlar verebileceği考虑 edilerek `+10` ile normalizasyon yapılır. Son olarak 11. hane, ilk 10 hanenin aritmetik toplamının 10'a göre modu ile doğrulanır.

**Parametreler**:
- `value`: `string` — Doğrulanacak T.C. Kimlik Numarası (11 haneli, rakamlardan oluşan dize)

**Dönüş**: `boolean` — Geçerli bir T.C. Kimlik Numarası ise `true`, aksi halde `false` döner.

### isValidVkn
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/validation/taxIdentity.ts::isValidTckn
- **params**: `(value: string)`
- **ic_degiskenler**:
  - `d` — value stringinin her karakterini Number'a çevirerek oluşturulan rakam dizisi (ör. "12345678901" → [1,2,3,...])
  - `tekler` — d[0], d[2], d[4], d[6], d[8] indislerindeki rakamların toplamı, TCKN checksum hesabında tek pozisyon rakamları
  - `ciftler` — d[1], d[3], d[5], d[7] indislerindeki rakamların toplamı, TCKN checksum hesabında çift pozisyon rakamları
  - `onuncu` — ((tekler * 7 - ciftler) % 10 + 10) % 10 formülüyle hesaplanan 10. rakam adayı, d[9] ile karşılaştırılır
  - `ilkOnToplam` — d.slice(0,10) ile elde edilen ilk 10 hanenin reduce ile toplamı, 11. haneyi doğrulamak için kullanılır
- **Dönüş**: `boolean` — format uygunluğu, 10. hane ve 11. hane checksum doğrulamasını geçerse `true`

### [N2_NASIL] AST Pointer: src/lib/validation/taxIdentity.ts::isValidVkn
- **params**: `(value: string)`
- **ic_degiskenler**:
  - `d` — value stringinin her karakterini Number'a çevirerek oluşturulan rakam dizisi (10 haneli VKN rakamları)
  - `toplam` — döngü boyunca biriken checksum toplamı, her hanenin ağırlıklı değeri eklenerekhesaplanır
  - `t` — her döngü adımında (d[i] + 9 - i) % 10 formülüyle hesaplanan ara değer
  - `i` — for döngüsü sayacı, 0'dan 8'e kadar (ilk 9 haneyi dolaşır)
- **Dönüş**: `boolean` — (10 - (toplam % 10)) % 10 sonucu d[9] (10. haneye) eşitse `true`

---

## NODE ID STANDARD

  file: src\lib\validation\taxIdentity.ts
  function: src\lib\validation\taxIdentity.ts::isValidTckn
  function: src\lib\validation\taxIdentity.ts::isValidVkn

---

## DISA AKTARILANLAR (EXPORTS)
  export: isValidTckn
  export: isValidVkn