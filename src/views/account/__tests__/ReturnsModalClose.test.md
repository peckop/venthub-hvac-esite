---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx
skeleton_hash: 8ad114957db3cec0
generated_at: 2026-05-23T22:35:11Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kullanıcı hesapları bölümündeki iade işlemleri sayfasında yer alan iade modalının kapanma davranışını test eden bir birim test dosyasıdır. Vitest test çatısı ve React Testing Library araçlarını kullanarak ilgili bileşenin işlevlerini doğrular, testlerde sahte gezinme fonksiyonları kullanır ve test senaryolarını ana iade sayfası bileşeni üzerinde yürütür. Modülde herhangi bir özel kullanıcı tanımlı fonksiyon bulunmaz, sadece test senaryolarını çalıştırmak için gereken üst seviye kod, içe aktarılan harici kütüphane araçları ve testlerde kullanılan sahte değişkenler mevcuttur.

---

## AXIOMS – Mimari Varsayımlar
Bu React test modülünün başarılı bir şekilde çalışması ve tanımlı test senaryolarını doğru doğrulayabilmesi için test ortamının mock fonksiyon yönetimi yeteneğine, kullanılan React Router hook'larının testte doğru şekilde mocklanmasına ve test edilen ana bileşenin sorunsuz import edilebilmesine bağlıdır.

[Aksiyom 1]: Eğer test ortamında mock fonksiyonlarının çağrı sayısı ve aldığı parametreleri doğrulama yeteneği yoksa, navigation ve location güncelleme işlemlerinin doğru tetiklendiği kanıtlanamaz, tüm test senaryoları geçersiz kalır.
[Aksiyom 2]: Eğer React Router'ın useNavigate hook'u testte mocklanarak tanımlı mockNavigate nesnesi sağlanmamışsa, modal kapanma işleminde tetiklenen navigation çağrısı çalışma zamanı hatası fırlatır, test başarısız olur.
[Aksiyom 3]: Eğer React Router'ın useLocation hook'unun replace metodu testte mocklanarak tanımlı mockReplace nesnesi sağlanmamışsa, location state güncelleme işlemi sırasında hata oluşur, test çalıştırılamaz.
[Aksiyom 4]: Eğer test edilen asıl ReturnsModalClose bileşeni test modülüne hatasız bir şekilde import edilememişse, bileşen render edilemez, hiçbir test senaryosu çalışmaz.

---



---

## SABİTLER
- **mockNavigate** (call) — `vi.fn()`
- **mockReplace** (call) — `vi.fn()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_0
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockNavigate` — Next.js useRouter hook'unun push metodu için tanımlanmış mock çağrı fonksiyonu
  - `mockReplace` — Next.js useRouter hook'unun replace metodu için tanımlanmış mock çağrı fonksiyonu
  - `vi.fn()` — useRouter'ın prefetch metodu için oluşturulan Vitest boş mock fonksiyonu
  - `new URLSearchParams('new=ord1')` - useSearchParams hook'u için döndürülen, 'new=ord1' sorgu parametresi içeren URL arama parametreleri nesnesi
- **Dönüş**: { useRouter: () => Router Nesnesi, usePathname: () => string, useSearchParams: () => URLSearchParams }

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_1
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockNavigate` — Router nesnesinin push metodu için atanmış mock çağrı fonksiyonu
  - `mockReplace` — Router nesnesinin replace metodu için atanmış mock çağrı fonksiyonu
  - `vi.fn()` — Router nesnesinin prefetch metodu için oluşturulan Vitest boş mock fonksiyonu
- **Dönüş**: { push: Function, replace: Function, prefetch: Function }

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_2
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockAuth` — Kimlik doğrulama hook'u için tanımlanmış mock auth nesnesi
- **Dönüş**: { useAuth: () => typeof mockAuth }

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_3
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockI18n` — Uluslararasılaştırma hook'u için tanımlanmış mock i18n nesnesi
- **Dönüş**: { useI18n: () => typeof mockI18n }

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_4
- **params**: (table: string)
- **ic_degiskenler**:
  - `table` — Supabase sorgusunda kullanılacak veritabanı tablo adı
  - `chain.select` — Sorgu zinciri için select metodu mock'u, kendisini döndürür
  - `chain.insert` — Sorgu zinciri için insert metodu mock'u, boş promise döndürür
  - `chain.order` — Sorgu zinciri için order metodu mock'u, kendisini döndürür
  - `chain.eq` — Sorgu zinciri için eşitlik filtresi metodu mock'u, kendisini döndürür
  - `chain.then` — Promise olarak kullanılabilecek then metodu mock'u, tabloya göre test verisi döndürür
- **Dönüş**: Sorgu zinciri objesi (chain)

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_5
- **params**: (table: string)
- **ic_degiskenler**:
  - `table` — Supabase sorgusunda kullanılacak veritabanı tablo adı
  - `chain.select` — Sorgu zinciri için select metodu mock'u, kendisini döndürür
  - `chain.insert` — Sorgu zinciri için insert metodu mock'u, boş veri/hata nesnesi içeren promise döndürür
  - `chain.order` — Sorgu zinciri için order metodu mock'u, kendisini döndürür
  - `chain.eq` — Sorgu zinciri için eşitlik filtresi metodu mock'u, kendisini döndürür
  - `chain.then` — Promise olarak kullanılabilecek then metodu mock'u, tabloya göre test verisi döndürür
- **Dönüş**: Sorgu zinciri objesi (chain)

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_6
- **params**: (callback: (args: { data: Record<string, unknown>[], error: unknown }) => unknown)
- **ic_degiskenler**:
  - `callback` — Then metodu tarafından çağrılacak, veriyi işleyen callback fonksiyonu
  - `table` — Üst kapsamdan gelen, sorgulanan tablo adı
  - `args.data` — Callback'e gönderilecek, tabloya göre oluşturulmuş test verisi dizisi
  - `args.error` — Callback'e gönderilecek hata nesnesi (tüm testlerde null)
- **Dönüş**: Callback fonksiyonunun dönüş değeri

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_7
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `vi` — Vitest kütüphanesi nesnesi, tüm mock'ları sıfırlamak için kullanılır
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_8
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `render` — React Testing Library'nin component render etme fonksiyonu
  - `AccountReturnsPage` — Test edilen ana sayfa componenti
  - `container` — Render edilen componentin DOM kapsayıcısı
  - `screen` — React Testing Library'nin DOM sorgulama nesnesi
  - `modalHeading` — Modal başlığını tutan DOM elementi,/i returns\.new/ regex ile bulunur
  - `overlay` — Modal arkasındaki bulanıklaştırılmış arka plan elementi, .backdrop-blur-sm sınıfı ile seçilir
  - `fireEvent` — Kullanıcı etkileşimleri simüle etmek için React Testing Library fonksiyonu
  - `waitFor` — Async DOM değişikliklerini beklemek için React Testing Library fonksiyonu
- **Dönüş**: Promise<void> (async test fonksiyonu)

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_9
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `render` — React Testing Library'nin component render etme fonksiyonu
  - `AccountReturnsPage` — Test edilen ana sayfa componenti
  - `container` — Render edilen componentin DOM kapsayıcısı
  - `screen` — React Testing Library'nin DOM sorgulama nesnesi
  - `modalHeading` — Modal başlığını tutan DOM elementi, /returns\.new/ regex ile bulunur
  - `overlay` — Modal arkasındaki bulanıklaştırılmış arka plan elementi, .backdrop-blur-sm sınıfı ile seçilir
  - `fireEvent` — Kullanıcı etkileşimleri simüle etmek için React Testing Library fonksiyonu
  - `waitFor` — Async DOM değişikliklerini beklemek için React Testing Library fonksiyonu
- **Dönüş**: Promise<void> (async test fonksiyonu)

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx::anonim_10
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `screen` — React Testing Library'nin DOM sorgulama nesnesi
  - `expect` — Vitest assertion fonksiyonu, DOM elementi varlığını kontrol eder
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\views\account\__tests__\ReturnsModalClose.test.tsx