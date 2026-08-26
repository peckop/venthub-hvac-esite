---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\fxRate.service.ts
skeleton_hash: cefa55c85cf35b82
entity_hashes:
  func:resolveFxRate: 75857a7dfc6e1eea
  overview: 6908f8f6ffdccdd7
generated_at: 2026-08-25T08:44:34Z
---

## Genel Bakış
Bu modül, döviz kuru çözümleme işlemini tek bir servis fonksiyonu üzerinden sunar. Supabase veritabanı bağlantısı, hedef para birimi ve tarih bilgisi alarak ilgili döviz kuru sonucunu döndürür. Modül, fiyatlandırma veya finansal hesaplamalarda kullanılan kur verisinin erişim noktasını tanımlar.

## Fonksiyon Grupları
### Döviz Kuru Çözümleme
Belirtilen para birimi ve tarih için geçerli döviz kurunu Supabase üzerinden sorgular ve sonuç olarak döndürür; kur bulunamazsa null değerini verir.
- resolveFxRate

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca imzadan çıkarılabilecek sınırlı varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer geçerli bir `supabase` veritabanı bağlantısı yoksa, fonksiyon çalışamaz ve döviz kuru çözümlenemez.

[Aksiyom 2]: Eğer `quoteCcy` parametresi tanımlanmamış veya geçersiz bir para birimi kodu ise, fonksiyon null dönebilir (dönüş tipi `FxRateResult | null` olarak tanımlıdır).

[Aksiyom 3]: Eğer `today` parametresi tanımlanmamış veya geçersiz bir tarih formatı ise, fonksiyon null dönebilir.

---

**Not:** Fonksiyon gövdesi (implementation) sağlanmadığından, bu aksiyomlar yalnızca imzadan çıkarılan varsayımlardır. Gövdedeki iş mantığı, veritabanı sorguları, hata yönetimi ve eşik değerleri gibi detaylı mimari varsayımlar için kaynak kodun kendisi gereklidir.

---

## FONKSİYON DETAYLARI

### resolveFxRate
**Ne yapar**: Verilen `quoteCcy` para birimi için `today` tarihinde geçerli olan döviz kurunu Supabase veritabanından sorgular ve döndürür. Eğer kur bulunamazsa `null` döner. Türk Lirası (TRY) özel durum olarak ele alınır ve veritabanı sorgusu yapılmadan sabit değer döndürülür.

**Nasıl yapar**: Fonksiyon önce `quoteCcy` parametresini büyük harfe dönüştürür. Eğer para birimi `TRY` ise, veritabanına hiç sorgu yapmadan `{ rate: 1, effectiveDate: today }` nesnesini döndürür — bu, TRY'nin kendisine karşı kurunun her zaman 1 olduğu anlamına gelir. TRY dışındaki para birimleri için `currency_rates` tablosunda `base_ccy='TRY'` filtresiyle birlikte sorgu yapılır; bu filtre docstring'te "şarttır" olarak belirtilmiştir. Sorgu, `effective_date` bugün veya öncesi olan kayıtlar arasından, önce `effective_date` sonra `fetched_at` alanlarına göre azalan sıralama yaparak en güncel kaydı seçer ve `limit(1)` ile yalnızca bir kayıt getirir. Gelen kaydın `rate` değeri `Number()` ile sayıya dönüştürülür; sonucun sonlu bir sayı olup olmadığı ve sıfırdan büyük olup olmadığı kontrol edilir. Bu kontrollerden herhangi biri başarısız olursa `null` döner. Geçerli bir kur bulunduğunda `{ rate, effectiveDate: row.effective_date }` nesnesi döndürülür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase istemci nesnesi. Veritabanı sorguları bu istemci üzerinden yürütülür.
- `quoteCcy`: `string` — Kur istenen hedef para birimi kodu (örneğin `"EUR"`, `"USD"`). Fonksiyon içinde büyük harfe dönüştürülerek kullanılır.
- `today`: `string` — Kurun geçerli sayılması istenen tarih. `effective_date` alanının bu tarihten büyük olmaması koşuluyla filtreleme yapılır. TRY durumunda doğrudan `effectiveDate` olarak döndürülür.

**Dönüş**: `Promise<FxRateResult | null>` — Asenkron olarak çözülen bir Promise. Başarılı durumda `FxRateResult` nesnesi (içinde `rate: number` ve `effectiveDate: string` alanları bulunur) döner. Para birimi TRY ise her zaman bu nesne döner. Sorgu sonucunda uygun kayıt bulunamazsa, rate değeri geçersizse (sonlu olmayan veya sıfırdan küçük/eşit) ya da veritabanı hatası oluşursa `null` döner — ancak veritabanı hatası durumunda önce hata fırlatılır (`throw error`), bu nedenle `null` dönüşü yalnızca kayıt bulunamama veya geçersiz rate senaryolarında gerçekleşir.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/database.types::type { Database }
- import: @supabase/supabase-js::type { SupabaseClient }

---

## INTERFACES

### FxRateResult
Çözülen kur + hangi tarihli kaydın kullanıldığı (künye/denetim için).
- `rate: number`
- `effectiveDate: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/fxRate.service.ts::resolveFxRate
- **params**:
  - `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı
  - `quoteCcy` — string tipinde, quote (dönüştürülecek) para birimi kodu
  - `today` — string tipinde, bugünün tarihi (YYYY-MM-DD formatında beklenir)
- **ic_degiskenler**:
  - `ccy` — `quoteCcy.toUpperCase()` ile büyük harfe çevrilmiş para birimi kodu; TRY kontrolü ve sorgu filtresi olarak kullanılır
  - `rates` — `supabase.from('currency_rates').select(...)` sorgusundan dönen veri dizisi; `data` olarak destructure edilir
  - `error` — Supabase sorgusundan dönen hata nesnesi; varsa `throw error` ile fırlatılır
  - `row` — `rates[0]` (dizinin ilk elemanı) veya `null`; rates boşsa null atanır
  - `rate` — `Number(row.rate)` ile sayıya çevrilmiş kur değeri; `Number.isFinite(rate)` ve `rate > 0` kontrolü yapılır
- **Dönüş**: `Promise<FxRateResult | null>` — TRY ise `{ rate: 1, effectiveDate: today }`, kur bulunamazsa veya geçersizse `null`, aksi halde `{ rate, effectiveDate: row.effective_date }` döndürür

---

## NODE ID STANDARD

  file: src\lib\services\fxRate.service.ts
  function: src\lib\services\fxRate.service.ts::resolveFxRate

---

## DISA AKTARILANLAR (EXPORTS)
  export: FxRateResult
  export: resolveFxRate