---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx
skeleton_hash: 629b5c621a74d893
entity_hashes:
  func:LocationProbe: 5b91bc45de71299f
  func:chainResult: 1b5aa5b5378b3f99
  overview: 619f97f44b86cc7e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin siparişler sayfası için yazılmış test dosyasıdır. Bileşen davranışlarını doğrulayan test senaryolarını çalıştırarak sipariş listeleme ve filtreleme işlevlerinin doğru çalıştığını garanti altına alır.

## Fonksiyon Grupları
### Test Veri Yardımcıları
Test senaryoları arasında veri akışını yöneten ve zincirleme test sonuçlarını işleyen yardımcı işlevleri kapsar.
- chainResult

### Konum Sensörü Test Bileşeni
Siparişler sayfasındaki konum tabanlı filtreleme ve izleme mekanizmalarının test edilmesini sağlayanProbe bileşenidir.
- LocationProbe

---

## AXIOMS – Mimari Varsayımlar

Bu modül test yardımcı fonksiyonları içerdiğinden, varsayımlar test ortamının doğru yapılandırılmasına yöneliktir.

**[Aksiyom 1]:** Eğer `chainResult(data: unknown)` fonksiyonuna geçilen `data` parametresi, test senaryosunun beklediği sipariş verisi yapısına (OrdersPage kapsamında) uygun bir formatta değilse, zincirleme sonuç üretimi tutarsız veya hatalı olur.

**[Aksiyom 2]:** Eğer `chainResult` fonksiyonu ardışık/zipseri olarak çağrıldığında, önceki çağrının dönüş değeri sonraki çağrının girdisi olarak kullanılmıyorsa, test verisi akışı kopar ve test senaryosu geçersiz sonuç üretir.

**[Aksiyom 3]:** Eğer `LocationProbe()` fonksiyonu çağrıldığında, test çalıştırma ortamında konum bilgisine erişilebilir bir bağlam (browser/test harness) mevcut değilse, prob işlevi geçerli bir konum verisi üretemez.

**[Aksiyom 4]:** Eğer `ordersRow` sabitinde tanımlanan nesne yapısı, test senaryolarının beklediği alanları (sipariş numarası, durum, tarih vb.) içermiyorsa, OrdersPage bileşeni testleri yanlış doğrulama sonuçları verir.

**[Aksiyom 5]:** Eğer test çalıştırıcısı (örn. Jest/React Testing Library) modüldeki bu yardımcı fonksiyonları içe aktarmadan önce başlatılmamışsa, `LocationProbe` gibi ortam bağımlı fonksiyonlar tanımsız davranır.

---

## FONKSİYON DETAYLARI

### chainResult
**Ne yapar**: Test ortamlarında kullanılan, gelen veriyi zincirleme sorgu metodlarıyla sarmalayan bir yardımcı fonksiyondur. OrdersPage testlerinde asenkron veri akışını simüle etmek için tasarlanmış olan bu fonksiyon, testlerde kullanılan mock veri yapılarını standart bir formatta sunar. Sadece test sürecinde kullanılan geçici bir yapı olarak görev alır, üretim kodunda kullanılmaz.
**Nasıl yapar**: Aldığı herhangi bir türdeki veriyi içeriğinde saklar, ardışık olarak çağrılabilecek select, ardından eq ve en son order metodlarını sırayla döndürür. Son metod olan order, içindeki veriyi bir Promise olarak çözerek testlerde asenkron veri yükleme davranışını tam olarak taklit eder. Zincirleme yapısı sayesinde gerçek API sorgu yapılarına benzer bir kullanım sunarak testlerin gerçek kullanım senaryolarına yakın çalışmasını sağlar.
**Parametreler**:
- name: data, type: unknown — Zincirleme sorgu yapısına sarılacak herhangi bir türdeki test verisidir, genellikle testlerde kullanılan sipariş, kullanıcı ya da benzeri iş verilerini içerir.
**Dönüş**: Sırayla çağrılabilen select, eq ve order metodlarını barındıran bir nesne döndürür. İçindeki order metodu, çözüldüğünde orijinal veriyi bir dizi içinde barındıran `{ data: [data], ... }` yapısındaki bir nesneyi sunan Promise türünde bir sonuç döndürür.

### LocationProbe
**Ne yapar**: Konum bilgisini ekranda görüntüleyen, test otomasyonu entegrasyonu için özel olarak tasarlanmış bir React bileşenidir. OrdersPage testlerinde sayfadaki konum yolunun doğru şekilde render edildiğini doğrulamak amacıyla kullanılır. Testlerde erişimi kolaylaştırmak için özel bir test niteliğiyle işaretlenmiş bir DOM elemanı üretir.
**Nasıl yapar**: Bileşen içinde tanımlı olan `loc` değişkeninin değerini, özel olarak atanmış `data-testid` niteliği ile işaretlenmiş bir div etiketi içinde görüntüler. Herhangi bir interaktif işlevi bulunmayan, salt gösterim amaçlı bir bileşen olarak çalışır. Tek görevi, içerdiği konum bilgisini testlerin kolayca doğrulayabileceği bir formatta ekrana yazdırmaktır.
**Parametreler**: Bu bileşen herhangi bir dış parametre ya da prop almaz, kendi içinde tanımlı olan `loc` değişkeninin değerini kullanarak içeriğini oluşturur.
**Dönüş**: `data-testid` niteliği "loc-path" olarak ayarlanmış bir JSX div elemanı döndürür, bu elemanın içeriği bileşen içinde tanımlı `loc` değişkeninin değerinden oluşur.

---

## SABİTLER
- **ordersRow** (object) — `{
  id: 'ord_1234567890',
  total_amount: 1234.5,
  status: 'paid',
  cre...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/__tests__/OrdersPage.test.tsx::chainResult
- **params**: `(data: unknown)` — supabase zincirinin döndüreceği ham veri
- **ic_degiskenler**:
  _(fonksiyon gövdesinde ayrı bir değişken tanımlanmamıştır; doğrudan return edilen nesne zinciri oluşturulur)_
- **Dönüş**: Supabase sorgu zinciri simulatorü nesnesi — `select()` → `eq()` → `order()` → `Promise<{data: [data], error: null}>`

### [N2_NASIL] AST Pointer: src/views/__tests__/OrdersPage.test.tsx::LocationProbe
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loc` — `usePathname()` hook'unun döndürdüğü geçerli URL yolu (Next.js navigasyonundan alınan pathname)
- **Dönüş**: JSX — `<div data-testid="loc-path">{loc}</div>` (mevcut sayfa yolunu gösteren test probe bileşeni)

### [N3_NASIL] AST Pointer: src/views/__tests__/OrdersPage.test.tsx::useAuth_mock_factory
- **params**: (parametre yok) — anonymous arrow function
- **ic_degiskenler**:
  _(içerde değişken yok; return içinde inline nesne oluşturulur)_
- **Dönüş**: `{ useAuth: () => ({ user: { id: 'u1', email: 'u@u.com', user_metadata: {} }, loading: false }) }` — useAuth hook'unun sahte implementasyonu

### [N4_NASIL] AST Pointer: src/views/__tests__/OrdersPage.test.tsx::useCart_mock_factory
- **params**: (parametre yok) — anonymous arrow function
- **ic_degiskenler**:
  _(içerde değişken yok; return içinde inline nesne oluşturulur)_
- **Dönüş**: `{ useCart: () => ({ addToCart: vi.fn() }) }` — useCart hook'unun sahte implementasyonu, `addToCart` vitest mock fonksiyonu

### [N5_NASIL] AST Pointer: src/views/__tests__/OrdersPage.test.tsx::useI18n_mock_factory
- **params**: (parametre yok) — anonymous arrow function
- **ic_degiskenler**:
  _(içerde değişken yok; return içinde inline nesne oluşturulur)_
- **Dönüş**: `{ useI18n: () => ({ t: (k, _?) => ... }) }` — useI18n hook'unun sahte implementasyonu, `t` fonksiyonu anahtar-çeviri sözlüğünden değer döndürür

### [N6_NASIL] AST Pointer: src/views/__tests__/OrdersPage.test.tsx::t_translate_function
- **params**: `(k: string, _?: Record<string, unknown>)` — `k`: çevrilecek anahtar dizesi, `_`: opsiyonel parametreler (kullanılmıyor)
- **ic_degiskenler**:
  _(içerde değişken yok; inline sözlük nesnesi `as Record<string, string>` ile oluşturulup `[k]` ile erişilir)_
- **Dönüş**: `string` — sözlükteki karşılığı veya eşleşme yoksa `k` değerinin kendisi (fallback)

### [N7_NASIL] AST Pointer: src/views/__tests__/OrdersPage.test.tsx::supabase_mock_factory
- **params**: (parametre yok) — anonymous arrow function
- **ic_degiskenler**:
  _(içerde değişken yok; return içinde inline nesne oluşturulur)_
- **Dönüş**: `{ supabase: { from: (table) => ... } }` — sahte supabase istemcisi, `from()` methodu tablo adına göre farklı mock zincirler döndürür

### [N8_NASIL] AST Pointer: src/views/__tests__/OrdersPage.test.tsx::table_handler
- **params**: `(table: string)` — supabase sorgusu hedeflenen tablo adı
- **ic_degiskenler**:
  _(içerde değişken yok; parametre `table` ile doğrudan koşullu branch yapılır)_
- **Dönüş**: Mock supabase sorgu zinciri nesnesi — `table === 'venthub_orders'` ise `chainResult(ordersRow)`, `table === 'products'` ise `{select: () => ({in: () => Promise})}`, aksi halde `chainResult([])`

### [N9_NASIL] AST Pointer: src/views/__tests__/OrdersPage.test.tsx::test_detaylar_button
- **params**: (parametre yok) — `it(...)` callback'i, async arrow function
- **ic_degiskenler**:
  - `detailsBtn` — `screen.findByRole('button', { name: /Detaylar/i }, { timeout: 5000 })` ile bulunan "Detaylar" butonu DOM elementi
  - `user` — `userEvent.setup()` ile oluşturulan kullanıcı simülasyonu nesnesi, tıklama gibi etkileşimleri tetikler
- **Dönüş**: yok (test fonksiyonu; `render` ile bileşeni mount eder, tıklama tetikler, `waitFor` ile URL paterni `^\/account\/orders\/` eşleşmesini ve `data-testid="detail"` elementinin varlığını doğrular)

---

## NODE ID STANDARD

  file: src\views\__tests__\OrdersPage.test.tsx
  function: src\views\__tests__\OrdersPage.test.tsx::chainResult
  function: src\views\__tests__\OrdersPage.test.tsx::LocationProbe

---

## DISA AKTARILANLAR (EXPORTS)
  export: LocationProbe
  export: chainResult

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