---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminErrorsPage.tsx
skeleton_hash: cafa7ed074ccc911
entity_hashes:
  func:AdminErrorsPage: d26af9274e4d56dd
  overview: 0655495a3be5f695
  style_tokens: a7fe3ab3ca0c1259
generated_at: 2026-06-13T17:00:37Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici panelindeki hata yönetimi sayfasını oluşturan temel React bileşenini ve tarih formatlama yardımcı fonksiyonunu içerir. Sistemde kaydedilen hata kayıtlarını merkezi bir arayüzde listeleyerek yöneticilerin incelemesini sağlar ve tarihlerin okunabilir biçimde sunulmasını destekler.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfa düzeninin, veri çekme işlemlerinin ve hata kayıtlarının listelenmesinin tüm sorumluluğunu taşıyan ana React bileşenidir.
- AdminErrorsPage

### Tarih Formatlama Yardımcıları
Hata kayıtlarındaki tarih nesnelerini, arayüzde gösterilmek üzere okunabilir ve standart bir metin formatına dönüştürmekle sorumlu yardımcı fonksiyondur.
- fmt

### Fonksiyonlar Arası İlişkiler ve Bağımlılıklar
`AdminErrorsPage` bileşeni, hata kayıtlarının tarih bilgilerini okunaklı göstermek için `fmt` fonksiyonuna bağımlıdır. Modül, veri çekme işlemleri için dış kaynaklara (React context, global state veya custom hook) ihtiyaç duyar ve bu bağımlılıklar bileşenin yaşam döngüsünde dinamik olarak çözümlenir. Mimari olarak, yönetici panelinin bir alt sayfası olarak yalın ve tek sorumluluklu bir yapıya sahiptir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon imzalarından çıkarılabilir kesin mimari varsayımlar sınırlıdır; yalnızca imza bilgisine dayalı varsayımlar aşağıda listelenmiştir.

[Aksiyom 1]: Eğer React çalışma ortamı (React runtime/React DOM) yoksa, AdminErrorsPage bileşeni render edilemez ve uygulama hata fırlatır.

[Aksiyom 2]: Eğer fmt fonksiyonu çağrıldığında geçerli bir tarih nesnesi parametre olarak sağlanmazsa, fonksiyonun dönüş değeri bilinmiyor.

[Aksiyom 3]: Eğer AdminErrorsPage bileşeni React component ağacının dışında (örn. doğrudan DOM'a eklenerek) kullanılmaya çalışılırsa, bileşen düzgün çalışmaz.

[Aksiyom 4]: Eğer fmt yardımcı fonksiyonu modül dışından erişilebilir olarak export edilmemişse, modül dışındaki tarih formatlama işlemleri bu fonksiyonu kullanamaz (iç modül bağımlılığı).

[Aksiyom 5]: Eğer React_fc dönüş tipi geçersiz veya bozulmuş bir JSX döndürürse, React hata sınırı tetiklenir veya bileşen render edilemez.

---

**Not:** Fonksiyon imzalarında parametre listesi, varsayılan değer veya modül sabiti verilmediği için; hata kayıtlarının veri kaynağı, API çağrıları, hook kullanımı veya bileşen içi state yönetimi hakkında kesin aksiyom üretilmemiştir. Bu tür detaylar fonksiyon gövdesinden çıkarılmalıdır.

---

## FONKSİYON DETAYLARI

### AdminErrorsPage

**Ne yapar**: İstemci hatalarının (client_errors) listelendiği admin sayfasını render eder. DataTableKit kütüphanesine göç edilmiş, sunucu tarafı (server-mode) çalışan bir hata yönetim sayfasıdır.

**Nasıl yapar**: Sayfa yapısı iki katmandan oluşur: üst kısımda sayfa başlığı, altında ise `Suspense` ile sarılmış bir `ErrorsTableBody` bileşeni yer alır. `useSearchParams` hook'u doğrudan bu bileşen içinde tüketilmek yerine, `Suspense` boundary içine yerleştirilmiştir; bu tasarım CLAUDE.md Kural 5 / K2 gerekliliğine uygundur ve suspans ile ilgili potansiyel hataların önlenmesini sağlar. Veri çekme, URL senkronizasyonu ve filtre state yönetimi gibi tüm mantıksal sorumluluklar `ErrorsTableBody` bileşenine (içinde `useAdminTable` hook'unu kullanan) devredilmiştir; böylece bu üst düzey bileşen yalnızca görünüm yapısını ve Suspense sınırını tanımlar.

**Parametreler**:

Bu fonksiyon (React fonksiyonel bileşeni) herhangi bir parametre almaz.

**Dönüş**: `React.FC` — Suspense ile sarılmış hata tablosu içeriğini ve sayfa başlığını render eden React fonksiyonel bileşeni.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hac\src\views\admin\AdminErrorsPage.tsx::AdminErrorsPage
- **params**: ()
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, component içindeki metinleri uluslararasılaştırmak için kullanılır.
- **Dönüş**: React.ReactNode (JSX element) — `<div>` ile sarılmış bir header ve Suspense ile yüklenen ErrorsTableBody componentinden oluşan sayfa yapısı.

---

## NODE ID STANDARD

  file: src\views\admin\AdminErrorsPage.tsx
  function: src\views\admin\AdminErrorsPage.tsx::AdminErrorsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminErrorsPage

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
- **Yardımcı Sınıflar:** `pb-20`, `space-y-4`