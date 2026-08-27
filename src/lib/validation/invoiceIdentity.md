---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\validation\invoiceIdentity.ts
skeleton_hash: 37d4644f3cd3cec9
entity_hashes:
  func:checkInvoiceIdentity: 7ceb3259ceb5474f
  overview: f60500888403bcb4
generated_at: 2026-08-27T07:08:13Z
---

## Genel Bakış
Bu modül, fatura kimlik bilgilerinin geçerliliğini doğrulamakla sorumludur. Sipariş tutarı ve belirlenen eşik değeri göz önünde bulundurularak fatura kimliğinde bir sorun olup olmadığını kontrol eder; sorun tespit edilmezse null, aksi halde bir sorun nesnesi döndürür.

## Fonksiyon Grupları
### Fatura Kimlik Doğrulama
Fatura kimlik bilgilerini alır, KDV dahil sipariş toplamını ve eşik değerini kullanarak kimlik doğrulama kontrolü gerçekleştirir. Geçersiz veya eksik bilgi tespit edilirse `InvoiceIdentityIssue` nesnesi, aksi durumda null döndürür.
- checkInvoiceIdentity

## Bağımlılıklar ve Mimari Notlar
- **Dış bağımlılıklar**: `InvoiceIdentityInput` ve `InvoiceIdentityIssue` türleri bu modülün dışında tanımlıdır; muhtemelen aynı `validation` dizinindeki veya ortak tip tanımlarının bulunduğu dosyalardan ithal edilir.
- **İç bağımlılık**: Modül tek fonksiyondan oluşur; başka bir fonksiyonu çağırmaz.
- **Dinamik/lazy yükleme**: Kaynakta böyle bir bilgi yer almıyor.
- **Mimari önem**: Bu modül, sipariş akışında fatura oluşturma öncesi bir validasyon katmanı olarak konumlanır; eşik bazlı bir iş kuralını uygular.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, fonksiyon gövdesine dayalı aksiyom üretilememektedir.

İmzadan yalnızca şu temel yapısal gereksinimler çıkarılabilir:

[Aksiyom 1]: Eğer `input` (InvoiceIdentityInput tipinde) sağlanmazsa, fonksiyon çağrılamaz.

[Aksiyom 2]: Eğer `orderTotalWithVat` (number tipinde) sağlanmazsa, fonksiyon çağrılamaz.

[Aksiyom 3]: Eğer `identityThreshold` (number tipinde) sağlanmazsa, fonksiyon çağrılamaz.

[Aksiyom 4]: Fonksiyon, bir `InvoiceIdentityIssue` nesnesi ya da `null` döndürür; `null` dönüşü sorun tespit edilmediğini gösterir.

---

## FONKSİYON DETAYLARI

### checkInvoiceIdentity
**Ne yapar**: Fatura kimliğinin yeterli olup olmadığını kontrol eder. Kurumsal faturalarda şirket adı, vergi kimlik numarası (VKN) ve vergi dairesi alanlarının doluluğunu ve geçerliliğini denetler. Bireysel faturalarda ise T.C. kimlik numarasının (TCKN) girilip girilmediğini ve girilmişse geçerli formatta olup olmadığını kontrol eder. Sorun yoksa `null` döner; sorun varsa ilgili hata kodunu içeren bir `InvoiceIdentityIssue` değeri döner.

**Nasıl yapar**: Fonksiyon öncelikle `input.type` değerine göre iki farklı akışa ayrılır. Kurumsal (`corporate`) akışta sırasıyla `companyName`, `vkn` ve `taxOffice` alanlarının boş olup olmadığını kontrol eder; `vkn` alanı doluysa `isValidVkn` fonksiyonuyla format doğrulaması yapar. Bireysel akışta ise `tckn` alanı girilmişse, sipariş tutarına bakılmaksızın `isValidTckn` fonksiyonuyla doğrulanır — yanlış numara, boş numaradan daha kötüdür çünkü fatura yanlış kişiye kesilir ve hata sessiz kalır. TCKN girilmemişse, `orderTotalWithVat` değerinin sonlu bir sayı olup olmadığı kontrol edilir; sayı değilse veya sipariş toplamı `identityThreshold` değerinden büyükse `tcknRequired` hatası döner, aksi halde `null` döner.

**Parametreler**:
- input: InvoiceIdentityInput — Fatura kimlik bilgilerini içeren girdi nesnesi. `type` alanı `'corporate'` veya bireysel olabilir; kurumsal için `companyName`, `vkn`, `taxOffice`, bireysel için `tckn` alanlarını içerir.
- orderTotalWithVat: number — KDV dahil sipariş toplamı. Vitrin fiyatları KDV dahil olduğundan bu değer KDV dahil olarak iletilir. Sonlu bir sayı değilse (örneğin `NaN` veya `Infinity`), tutar bilinmiyor sayılır ve eşik kararı verilemez; bu durumda eksik kimlikli fatura riski alınmaz, kimlik zorunlu kabul edilir.
- identityThreshold: number — Bireysel faturalarda TCKN zorunluluğunun başladığı eşik tutarı. Sipariş toplamı bu tutarın üstündeyse TCKN zorunlu hale gelir. `0` verilirse tüm bireysel faturalarda TCKN zorunlu olur.

**Dönüş**: InvoiceIdentityIssue | null — Sorun yoksa `null` döner. Sorun varsa şu değerlerden birini döner: `'companyRequired'` (kurumsal faturada şirket adı eksik), `'vknRequired'` (VKN eksik), `'vknFormat'` (VKN formatı geçersiz), `'taxOfficeRequired'` (vergi dairesi eksik), `'tcknFormat'` (TCKN girilmiş ama formatı geçersiz), `'tcknRequired'` (TCKN girilmemiş ve eşik tutarı aşılmış veya tutar bilinmiyor).

---

## İTHALATLAR (IMPORTS)
- import: ./taxIdentity::isValidTckn
- import: ./taxIdentity::isValidVkn

---

## TYPE ALIASES

### InvoiceIdentityInput
Fatura kimliği kuralı — mevzuata bağlı, EŞİKLİ. Cetvel: `docs/standards/legal-compliance-standard.md` §4. NİÇİN SAF FONKSİYON: kural mevzuattan geliyor ve yılda bir değişiyor (had her yıl tebliğle güncelleniyor). Hook'un içine gömülü bir `if` zinciri test edilemez ve değiştiğinde kimse fark etmez. K
```typescript
type InvoiceIdentityInput = {
  type: 'individual' | 'corporate'
  tckn?: string
  companyName?: string
  vkn?: string
  taxOffice?: string
}
```

### InvoiceIdentityIssue
Sözlükteki `checkout.errors.*` anahtarlarıyla birebir aynı adlar.
```typescript
type InvoiceIdentityIssue = | 'tcknRequired'
  | 'tcknFormat'
  | 'companyRequired'
  | 'vknRequired'
  | 'vknFormat'
  | 'taxOfficeRequired'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/validation/invoiceIdentity.ts::checkInvoiceIdentity
- **params**: `input: InvoiceIdentityInput`, `orderTotalWithVat: number`, `identityThreshold: number`
- **ic_degiskenler**:
  - `vkn` — `input.vkn` değerinin trim edilmiş hali; `isValidVkn` ile doğrulanır, geçersizse `'vknFormat'` döner
  - `tckn` — `input.tckn` değerinin trim edilmiş hali; girilmişse `isValidTckn` ile doğrulanır, geçersizse `'tcknFormat'` döner
  - `totalBilinmiyor` — `!Number.isFinite(orderTotalWithVat)` sonucu; tutar sonlu değilse `true` olur ve TCKN zorunluluğu tetiklenir
- **Dönüş**: `InvoiceIdentityIssue | null` — kurumsal tipte şirket adı boşsa `'companyRequired'`, VKN boşsa `'vknRequired'`, VKN formatı geçersizse `'vknFormat'`, vergi dairesi boşsa `'taxOfficeRequired'`; bireysel tipte TCKN girilmiş ama geçersizse `'tcknFormat'`, TCKN girilmemiş ve tutar bilinmiyor ya da eşik değerini aşıyorsa `'tcknRequired'`; aksi halde `null`

---

## NODE ID STANDARD

  file: src\lib\validation\invoiceIdentity.ts
  function: src\lib\validation\invoiceIdentity.ts::checkInvoiceIdentity

---

## DISA AKTARILANLAR (EXPORTS)
  export: InvoiceIdentityInput
  export: InvoiceIdentityIssue
  export: checkInvoiceIdentity