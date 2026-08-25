---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\lib\validation\taxIdentity.ts
skeleton_hash: dc42de9f3e295dc8
entity_hashes:
  func:isValidTckn: 57058047dbe03513
  func:isValidVkn: d10e78946293210b
  overview: 73a3a50bbf3ac748
generated_at: 2026-08-25T07:28:20Z
---

## Genel Bakış

Bu modül, Türkiye'ye özgü vergi ve kimlik numaralarının geçerliliğini doğrulamak için kullanılan iki bağımsız doğrulama fonksiyonu içerir. Modül, `validation` alt yapısı içinde konumlanır ve kimlik doğrulama alanında tek bir sorumluluğa sahiptir: TCKN ve VKN formatlarının algoritma bazlı kontrolü.

## Fonksiyon Grupları

### Kimlik Numarası Doğrulama

Bu grup, Türkiye Cumhuriyeti vatandaşlarına ve kurumlara ait resmi kimlik numaralarının biçim ve algoritma kurallarına uygunluğunu denetler. Her iki fonksiyon da bağımsız çalışır; birbirlerini çağırmazlar ve dış bağımlılıkları bulunmaz.

- `isValidTckn`, `isValidVkn`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, gövdeden türetilebilecek özel bir aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### isValidTckn
**Ne yapar**: Verilen bir string değerinin geçerli bir T.C. Kimlik Numarası (TCKN) olup olmadığını doğrular. TCKN'nin 11 haneli, yalnızca rakamlardan oluşan, ilk hanesi 0 olmayan ve belirli bir algoritmayla hesaplanan kontrol hanelerini taşıyan bir numara olması gerektiğini kontrol eder.

**Nasıl yapar**: Fonksiyon önce düzenli ifade (regex) ile temel format kontrolü yapar; değer `1` ile `9` arasında başlayan ve ardından 10 rakam daha içeren 11 haneli bir dize olmalıdır. Format uygunsa, dize karakterlerine ayrılıp sayısal diziye dönüştürülür. Ardından TCKN algoritmasına göre tek indeksli hanelerin (0, 2, 4, 6, 8) toplamı ile çift indeksli hanelerin (1, 3, 5, 7) toplamı hesaplanır. 10. hane kontrolü için `(tekler × 7 − çiftler) mod 10` formülü uygulanır; JavaScript'te mod operatörünün negatif sonuç verebilmesi nedeniyle sonuç `+10` ile normalize edilir. Son olarak ilk 10 hanenin toplamının 10'a bölümünden kalanın 11. hane ile eşleşip eşleşmediği kontrol edilir.

**Parametreler**:
- value: string — Doğrulanacak T.C. Kimlik Numarası değerini temsil eden 11 haneli string.

**Dönüş**: boolean — Girilen değer geçerli bir TCKN ise `true`, aksi halde `false` döner.

### isValidVkn
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/validation/taxIdentity.ts::isValidTckn
- **params**: `value` — doğrulanacak TCKN string değeri
- **ic_degiskenler**:
  - `d` — `value` stringinin her karakterini sayıya dönüştüren dizi (ör. `"123"` → `[1, 2, 3]`)
  - `tekler` — `d` dizisindeki tek indeksli (0, 2, 4, 6, 8) elemanların toplamı
  - `ciftler` — `d` dizisindeki çift indeksli (1, 3, 5, 7) elemanların toplamı
  - `onuncu` — `(tekler * 7 - ciftler) % 10` formülüyle hesaplanan, negatif çıkma durumunu önlemek için `+10` ile normalize edilen 10. basamak kontrol değeri
  - `ilkOnToplam` — `d` dizisinin ilk 10 elemanının (0–9 indeksleri) `reduce` ile toplamı
- **Dönüş**: `boolean` — TCKN geçerliyse `true`, değilse `false`

### [N2_NASIL] AST Pointer: src/lib/validation/taxIdentity.ts::isValidVkn
- **params**: `value` — doğrulanacak VKN string değeri
- **ic_degiskenler**:
  - `d` — `value` stringinin her karakterini sayıya dönüştüren dizi
  - `toplam` — döngüde biriken kontrol toplamı (başlangıçta `0`)
  - `t` — her iterasyonda `(d[i] + 9 - i) % 10` formülüyle hesaplanan geçici değer; `t === 9` ise doğrudan `9`, değilse `(t * Math.pow(2, 9 - i)) % 9` olarak `toplam`'a eklenir
- **Dönüş**: `boolean` — VKN geçerliyse `true`, değilse `false`

---

## NODE ID STANDARD

  file: taxIdentity.ts
  function: taxIdentity.ts::isValidTckn
  function: taxIdentity.ts::isValidVkn

---

## DISA AKTARILANLAR (EXPORTS)
  export: isValidTckn
  export: isValidVkn