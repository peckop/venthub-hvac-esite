---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\TrustSection.tsx
skeleton_hash: dcedc590bf39b6a9
entity_hashes:
  func:TrustSection: e10e11347e2c2b97
  overview: 14c5761d5c9dd272
  style_tokens: 6ca64cf19f9ea7a8
generated_at: 2026-05-28T22:37:04Z
---

## Genel Bakış
VentHub HVAC platformunun kullanıcı arayüzünde yer alan, marka ve platformun güvenilirliğini site ziyaretçilerine iletmek üzere tasarlanmış basit bir React UI modülüdür. Web sitesi içindeki özel güven bölümünü oluşturan bu modül, tek ana bileşenden oluşur.

## Fonksiyon Grupları
### Ana Güven Bölümü Bileşeni
Uygulama arayüzünde güvenilirliği vurgulayan tüm görsel ve yapısal işlemleri yöneten ana bileşendir, ilgili tüm içeriği sayfaya render eder.
- TrustSection

---

## AXIOMS – Mimari Varsayımlar
Venthub HVAC projesindeki React tabanlı frontend TrustSection bileşeninin sorunsuz çalışması için projenin derleme ortamı, React çalışma zamanı, tüm dahili/harici bağımlılıkları, ihtiyaç duyduğu statik/dinamik varlıklar ve üst bileşenlerden geçilen zorunlu verilerin tam olarak erişilebilir ve uyumlu olması zorunludur.

[Aksiyom 1]: Eğer bileşenle uyumlu sürümde React çalışma zamanı proje içinde sağlanmamışsa, TrustSection hiç yüklenemez, bulunduğu sayfa çalışma zamanında hata fırlatır.
[Aksiyom 2]: Eğer TrustSection tarafından içe aktarılan tüm bağımlılıklar (temel React yapıları, yardımcı bileşenler, stil dosyaları) proje içinde erişilebilir değilse, derleme aşamasında hata alınır, bileşenin içeriği kullanıcıya hiç sunulamaz.
[Aksiyom 3]: Eğer projenin frontend derleme süreci (Vite, Webpack vb.) TrustSection.tsx dosyasını doğru şekilde nihai uygulama paketlerine dahil etmezse, kullanıcının tarayıcısında bu bölüm hiç görüntülenmez, sayfa içeriği kalıcı olarak eksik kalır.
[Aksiyom 4]: Eğer TrustSection içeriğindeki sertifika, iş ortağı logosu gibi statik varlıklar sunucu tarafında erişilemezse, bileşende bozuk görseller/eksik metinler gösterilir, bölümün amacı olan güvenilirlik algısı tamamen bozulur.
[Aksiyom 5]: Eğer TrustSection'u çağıran üst bileşenler tarafından geçirilmesi gereken tüm zorunlu prop'lar TypeScript tip kurallarına uygun şekilde sağlanmamışsa, derleme aşamasında tip hatası alınır, uygulama üretim ortamında yayınlanamaz.

---

## FONKSİYON DETAYLARI

### TrustSection
**Ne yapar**: VentHub HVAC projesinin src/components dizininde yer alan React tabanlı bir kullanıcı arayüzü bileşenidir. Kullanıcı arayüzünde platformun güvenilirliğini vurgulamak amacıyla ayrılmış özel bir bölüm olarak görev alır, kullanıcılara platformun güven odaklı unsurlarını sunan bir bölüm oluşturur.
**Nasıl yapar**: Typescript ile tip güvenliği sağlanarak React fonksiyonel bileşeni standartlarına uygun olarak tanımlanmıştır. Proje içerisinde yeniden kullanılabilir bir bölüm bileşeni olarak yapılandırılmış, içerdiği tüm içerikleri kullanıcı arayüzüne sorunsuz şekilde render eder.
**Parametreler**:
- Bu fonksiyona tanımında herhangi bir girdi parametresi tanımlanmamıştır, bağımsız olarak çalışan bir bileşendir.
**Dönüş**: React.FC tipi, yani React ekosistemi ile tam uyumlu, ekranda render edilebilir bir fonksiyonel bileşen döndürür. Typescript tarafından sağlanan bu tip tanımı sayesinde proje içindeki diğer tüm bileşenlerde tip uyumluluğu sorunu yaşamadan kullanılabilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\TrustSection.tsx::TrustSection
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, tüm görünütlenen metinlerin i18n uyumlu çevirilerini almak için kullanılır
  - `TRUST_ITEMS` — Üç adet güven bildirimi nesnesinden oluşan sabit dizi, her nesne JSX SVG ikonu, çevrilmiş başlık ve açıklama metni içerir
  - `useI18n()` — Çeviri sistemine erişmek için kullanılan I18n provider hook çağrısı
- **Dönüş**: React JSX section elementi, güven bölümü arayüzünü temsil eder

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\TrustSection.tsx::TrustSection.TRUST_ITEMS.map_callback
- **params**: [item]
- **ic_degiskenler**:
  - `item` — TRUST_ITEMS dizisinden map sırasında alınan tekil güven bildirimi nesnesi
  - `item.title` — Güven bildiriminin başlık metni, hem React listesi için benzersiz key değeri hem de arayüzde başlık olarak kullanılır
  - `item.icon` — Güven bildirimi için tanımlanmış SVG ikonu, arayüzde başlığın solunda render edilir
  - `item.desc` — Güven bildiriminin açıklama metni, arayüzde başlığın altında gösterilir
- **Dönüş**: Tek bir güven bildirimini temsil eden React JSX div elementi

---

## NODE ID STANDARD

  file: src\components\TrustSection.tsx
  function: src\components\TrustSection.tsx::TrustSection

---

## DISA AKTARILANLAR (EXPORTS)
  export: TrustSection

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-br`, `bg-white`, `border-light-gray`, `from-gray-50`, `md:text-3xl`, `text-2xl`, `text-center`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-success-green`, `text-warning-orange`, `to-white`
- **Layout:** `flex`, `from-gray-50`, `gap-3`, `gap-4`, `grid`, `grid-cols-1`, `hover:shadow-md`, `items-start`, `lg:grid-cols-3`, `max-w-7xl`, `p-5`, `sm:grid-cols-2`
- **Varyant/Responsive:** `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `font-semibold`, `lg:px-8`, `mb-6`, `mt-0.5`, `mt-1`, `mx-auto`, `px-4`, `py-12`, `rounded-2xl`, `sm:px-6`, `transition`