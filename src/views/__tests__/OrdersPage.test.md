---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx
skeleton_hash: a6449980d65a3ace
generated_at: 2026-05-23T22:35:05Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin siparişler sayfasının (OrdersPage) test süreçlerinde kullanılan özel yardımcı fonksiyonları barındırır. React tabanlı bileşen testlerinin ihtiyaç duyduğu veri işleme ve ortam takibi işlevlerini yerine getirerek test senaryolarının güvenilir bir şekilde çalışmasını destekler.

## Fonksiyon Grupları
### Test Verisi İşleme Yardımcıları
Test senaryolarında kullanılacak ham verileri işleyerek zincirleme yapıda test sonuçları üretir, testlerde tutarlı veri akışı sağlar.
- chainResult

### Konum Takip Test Yardımcısı
Testler sırasında uygulama konum bilgisini izleyen bir prob görevi görür, siparişler sayfasının konumla ilgili işlevlerinin doğru çalışmasını test etmeye olanak tanır.
- LocationProbe

---

## AXIOMS – Mimari Varsayımlar
Bu OrdersPage test modülünün başarıyla derlenmesi, çalıştırılması ve tüm test senaryolarını geçmesi için modül içinde kullanılan bağımlı fonksiyon, sınıf ve sabitlerin erişilebilir, tür uyumlu ve çalışır durumda olması zorunludur.

[Aksiyom 1]: Eğer chainResult fonksiyonu bu test modülüne import edilemez veya çalıştırılamazsa, tüm sipariş verisi işlemeye dayalı test senaryoları başarısız olur.
[Aksiyom 2]: Eğer LocationProbe sınıfı örneklenemeyecek durumdaysa veya modüle import edilemiyorsa, konum/filtreleme ile ilgili tüm test adımları exception fırlatarak ilişkili testleri başarısız kılar.
[Aksiyom 3]: Eğer ordersRow sabit nesnesi tanımlı değilse, TypeScript derleme hatası oluşur ve test modülü hiç çalıştırılamaz.
[Aksiyom 4]: Eğer chainResult fonksiyonu imzasında tanımlı `unknown` türünde giriş verisini kabul etmeyecek şekilde tür uyumsuzluğuna sahipse, modül derleme aşamasında hata alır, testler çalıştırılamaz.

---

## FONKSIYON DETAYLARI

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_useauth_mock>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `useAuth` — mock auth hook'u, testte sabit kullanıcı bilgisi ve loading durumu döndürür
  - `user.id` — test kullanıcısının sabit kimlik değeri 'u1'
  - `user.email` — test kullanıcısının sabit e-posta adresi 'u@u.com'
  - `user.user_metadata` — test kullanıcısının boş metadata nesnesi
  - `loading` — auth yüklenme durumu, false olarak sabit ayarlanmış
- **Dönüş**: useAuth metodunu içeren mock nesnesi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_usecart_mock>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `useCart` — mock sepet hook'u, testte addToCart mock fonksiyonu döndürür
  - `addToCart` — vitest ile oluşturulmuş sahte sepete ekleme fonksiyonu
- **Dönüş**: useCart metodunu içeren mock nesnesi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_usei18n_mock>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `useI18n` — mock çeviri hook'u, testte t çeviri fonksiyonu döndürür
  - `t` — sipariş sayfası çevirilerini döndüren çeviri fonksiyonu
- **Dönüş**: useI18n metodunu içeren mock nesnesi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_t_callback>
- **params**: k: string, _?: Record<string, unknown>
- **ic_degiskenler**:
  - `k` — istenen çeviri anahtarı, sözlükten ilgili metni çekmek için kullanılır
  - `_` — kullanılmayan opsiyonel değişken, çeviri parametreleri için ayrılmış
- **Dönüş**: İstenen anahtara ait çeviri metni, anahtar bulunamazsa anahtarın kendisi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_standalone_t_1>
- **params**: k: string, _?: Record<string, unknown>
- **ic_degiskenler**:
  - `k` — istenen çeviri anahtarı, sözlükten ilgili metni çekmek için kullanılır
  - `_` — kullanılmayan opsiyonel değişken, çeviri parametreleri için ayrılmış
- **Dönüş**: İstenen anahtara ait çeviri metni, anahtar bulunamazsa anahtarın kendisi

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_standalone_t_2>
- **params**: k: string, _?: Record<string, unknown>
- **ic_degiskenler**:
  - `k` — istenen çeviri anahtarı, sözlükten ilgili metni çekmek için kullanılır
  - `_` — kullanılmayan opsiyonel değişken, çeviri parametreleri için ayrılmış
- **Dönüş**: İstenen anahtara ait çeviri metni, anahtar bulunamazsa anahtarın kendisi

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::chainResult
- **params**: data: unknown
- **ic_degiskenler**:
  - `data` — fonksiyona iletilen veri, mock Supabase sorgu sonucu olarak kullanılır
- **Dönüş**: Sıralı Supabase sorgu metotları (select, eq, order) içeren mock nesnesi

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_eq_mock>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `eq` — eşitleme filtresi mock metodu, order metodu içeren nesne döndürür
- **Dönüş**: order metodunu içeren mock sorgu nesnesi

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_order_mock>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `order` — sıralama mock metodu, asenkron olarak veri ve hata nesnesi döndürür
- **Dönüş**: Veriyi ve null hatayı içeren Promise nesnesi

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_supabase_mock>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `supabase.from` — mock Supabase tablo seçme metodu, tablo adına göre farklı sorgu nesneleri döndürür
- **Dönüş**: supabase nesnesini içeren mock client nesnesi

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_from_callback>
- **params**: table: string
- **ic_degiskenler**:
  - `table` — seçilen veritabanı tablosunun adı, 'venthub_orders' ve 'products' tabloları için özel davranış sergiler
  - `ordersRow` — testte tanımlı sabit sipariş verisi nesnesi, venthub_orders sorgusunda döndürülür
- **Dönüş**: Tablonun sorgu metotlarını içeren mock nesnesi

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::LocationProbe
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loc` — usePathname() hook'undan dönen mevcut sayfa path değeri, testte loc-path test id'li div'de görüntülenir
  - `usePathname` — Next.js navigation hook'u, mevcut URL pathini çekmek için kullanılır
- **Dönüş**: path değerini içeren test id'li JSX div elementi

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_vitest_test_wrapper>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `it` — Vitest test tanımlama metodu, yönlendirme senaryosunu test eder
  - `render` — React Testing Library render metodu, test edilen bileşenleri DOM'a ekler
  - `LocationProbe` — path takibi yapan test bileşeni
  - `OrdersPage` — test edilen ana siparişler sayfası bileşeni
- **Dönüş**: yok

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_async_test_callback>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `detailsBtn` — ekrandaki "Detaylar" metnli buton elementi, tıklama işlemi için kullanılır
  - `user` — userEvent kütüphanesinden oluşturulan kullanıcı etkileşimi simülatörü, butona tıklamak için kullanılır
  - `screen.findByRole` — React Testing Library DOM sorgulama metodu, Detaylar butonunu bulmak için kullanılır
  - `waitFor` — React Testing Library asenkron bekleme metodu, yönlendirme sonrası DOM değişikliklerini bekler
- **Dönüş**: yok (async void)

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\__tests__\OrdersPage.test.tsx::<anon_waitfor_callback>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `screen.getByTestId('loc-path')` — loc-path test id'li DOM elementi, yönlendirilen pathin doğruluğunu kontrol etmek için kullanılır
  - `screen.getByTestId('detail')` — detail test id'li DOM elementi, detay sayfasının yüklendiğini doğrulamak için kullanılır
  - `expect` — Vitest assertion metodu, DOM durumlarını doğrulamak için kullanılır
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\views\__tests__\OrdersPage.test.tsx
  function: src\views\__tests__\OrdersPage.test.tsx::chainResult
  function: src\views\__tests__\OrdersPage.test.tsx::LocationProbe

---

## DISA AKTARILANLAR (EXPORTS)
  export: LocationProbe
  export: chainResult