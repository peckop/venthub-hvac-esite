---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AdminStockPage.tsx
skeleton_hash: ed993728dcffbd9f
entity_hashes:
  func:AdminStockPage: c624fd2be5fee91c
  overview: 62b56555e7eaf8c3
  style_tokens: d6523eb6a70db49b
generated_at: 2026-05-28T22:38:52Z
---

## Genel Bakış
Bu modül, yöneticilerin stok ve envanter verilerini görüntüleyip yönetebileceği ana kullanıcı arayüzü bileşenidir. Stok listesini sunma ve ilgili yönetim işlemleri için sayfa düzenini ve mantığını içerir.

## Fonksiyon Grupları
### Sayfa Bileşeni
Yönetici stok sayfasının ana görsel yapısını ve kullanıcı etkileşimlerini tanımlar.
- AdminStockPage

---

## AXIOMS – Mimari Varsayımlar
Bu, hesap yöneticilerinin stok işlemlerini yürütmesi için tasarlanmış bir frontend view bileşenidir, doğru çalışması için projenin rota yönetimi altyapısı, yetkilendirme mekanizması ve stok verilerini sunan backend servisinin eksiksiz çalışması zorunludur.

[Aksiyom 1]: Eğer bu sayfaya erişimi tanımlayan proje içindeki frontend rota yapısı (React Router vb.) tanımlı değilse, kullanıcı hiçbir şekilde bu sayfaya yönlendirilemez, erişim hatası alınır.
[Aksiyom 2]: Eğer admin kullanıcı rolüne ait erişim haklarını doğrulayan rota koruma (route guard) mekanizması entegre edilmemişse, yetkisiz普通kullanıcılar dahi stok verilerine erişip değiştirebilir, veri güvenliği tamamen ihlal edilir.
[Aksiyom 3]: Eğer kimlik doğrulama servisi erişilebilir değilse, hiçbir kullanıcı (yetkili admin dahi) sayfanın içeriğine erişemez, stok verileri görüntülenemez.
[Aksiyom 4]: Eğer stok verilerini sunan backend API servisi çalışır durumda değilse, AdminStockPage üzerinden hiçbir stok kaydı listelenemez, stokla ilgili tüm ekleme/güncelleme/silme işlemleri başarısız olur.
[Aksiyom 5]: Eğer bu bileşende import edilen ortak proje UI bileşenleri (tablo, buton, form elemanları vb.) erişilebilir değilse, bileşen derleme aşamasında hata alır veya kullanıcı arayüzü bozuk şekilde ekrana yansır.

---

## FONKSİYON DETAYLARI

### AdminStockPage
**Ne yapar**: Admin yetkisine sahip kullanıcıların ürün stok miktarlarını, stok eşik değerlerini görüntüleyip düzenleyebildiği bir stok yönetim sayfasını render eder. Kullanıcının admin olup olmadığını kontrol eder, admin değilse erişim reddedilir ve sayfa içeriği gösterilmez.

**Nasıl yapar**: `useAuth` ile kimlik doğrulama durumunu alır, kullanıcı yoksa login sayfasına yönlendirir. `checkAdminAccess` ile admin yetkisini kontrol eder, yetki yoksa hata mesajı içeren bir JSX döndürür. Sayfa mount olduğunda Supabase `products` tablosundan tüm ürünlerin id, isim, SKU, marka, fiyat, durum, stok ve eşik bilgilerini çeker ve `all` state'inde saklar. Kullanıcı arama kutusuna yazdıkça `q` state'i güncellenir; `useMemo` ile filtrelenmiş liste (`filtered`) hesaplanır. Her ürün satırında stok miktarını artırma/azaltma (`adjust`), doğrudan sayı atama (`setQty`) ve eşik değerini kaydetme/kaldırma (`setThreshold`) işlemleri asenkron olarak doğrudan Supabase UPDATE sorgusuyla veritabanına yazılır ve başarılı olursa state güncellenir. İşlem sırasında `saving` state'i ilgili ürün ID'sini tutarak butonları devre dışı bırakır.

**Parametreler**: Yok (function hiçbir parametre almaz, tüm veriyi `useAuth`, `useRouter` ve Supabase sorgusu ile kendi içinde elde eder).

**Dönüş**: JSX öğesi — admin yetkisi varsa stok tablosu içeren tam sayfa; yoksa erişim reddedildi uyarısı. Dönüş tipi React bileşeni olarak `React.ReactElement` veya `null` olarak değerlendirilebilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\account\AdminStockPage.tsx::AdminStockPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — `useAuth()` hook tarafından sağlanan oturum kullanıcısı, kimlik doğrulama ve yetkilendirme için kullanılır.
  - `loading` — `useAuth()` hook tarafından dönen yükleme durumu, kullanıcı bilgisi henüz gelmemişse `true`.
  - `router` — `useRouter()` hook’u, yönlendirme (navigation) işlemleri için.
  - `all` — `useState<Product[]>([])` ile tutulan ürün listesi, veritabanından çekilen `Product[]`.
  - `setAll` — `all` durumunu güncelleyen setter fonksiyonu.
  - `q` — arama kutusundaki metin girdisi, `useState('')` ile tutulur.
  - `setQ` — `q` değerini güncelleyen setter.
  - `saving` — şu anda güncelleme (stock/threshold) yapılan ürünün `id`si veya `null`; `useState<string | null>(null)`.
  - `setSaving` — `saving` durumunu güncelleyen setter.
  - `tempQty` — ürün bazlı geçici stok miktarı girişi, `Record<string, number | ''>`.
  - `setTempQty` — `tempQty` nesnesini güncelleyen setter.
  - `tempThreshold` — ürün bazlı geçici eşik değeri girişi, `Record<string, number | ''>`.
  - `setTempThreshold` — `tempThreshold` nesnesini güncelleyen setter.
  - `isAdmin` — admin yetkisi kontrolü sonucu, `useState(false)`.
  - `setIsAdmin` — `isAdmin` durumunu güncelleyen setter.
  - `filtered` — `useMemo` ile oluşturulan, arama metnine göre `all` listesini süzen dizi.
  - `t` — `q` değerinin kırpılmış ve küçük harfe dönüştürülmüş hali, arama filtresi içinde kullanılır.
- **Dönüş**: JSX element (React bileşeni). Admin yetkisi yoksa erişim reddi mesajı, yetkili ise stok yönetim tablosu ve arama/kontrol UI’sı döner.

---

## NODE ID STANDARD

  file: src\views\account\AdminStockPage.tsx
  function: src\views\account\AdminStockPage.tsx::AdminStockPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminStockPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-50`, `bg-white`, `border-gray-100`, `border-light-gray`, `border-t`, `border-warning-orange`, `hover:bg-warning-orange`, `hover:border-primary-navy`, `hover:border-secondary-blue`, `hover:text-white`, `text-center`, `text-industrial-gray`, `text-left`, `text-red-600`, `text-sm`
- **Layout:** `absolute`, `flex`, `gap-1`, `gap-2`, `items-center`, `justify-between`, `left-3`, `max-w-7xl`, `overflow-hidden`, `relative`, `sm:min-w-72`, `sm:w-96`, `sm:w-auto`, `top-1/2`, `w-16`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${qty`, `${threshold`, `-1`, `-translate-y-1/2`, `:`, `<=`, `===`, `border`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `font-medium`, `font-semibold`, `italic`