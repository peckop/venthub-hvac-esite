---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\purchasing\AdminPurchasingPage.tsx
skeleton_hash: e30887e8606254f6
entity_hashes:
  func:AdminPurchasingPage: 9714eca190dab271
  overview: b5f9808e4fe14a3a
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-25T08:45:33Z
---

## Genel Bakış

Bu modül, admin panelindeki satın alma (purchasing) sayfasını temsil eden bir React fonksiyonel bileşenidir. Müdüriyet alanı gereği satın alma ile ilgili yönetim arayüzünü tek bir sayfa bileşeni olarak sunar. Modül, `views/admin/purchasing` hiyerarşisi altında konumlandığı için uygulamanın admin katmanına ait bir görünüm katmanı bileşenidir.

## Fonksiyon Grupları

### Sayfa Bileşeni

Satın alma yönetim sayfasının tüm sorumluluğunu üstlenen tek bileşendir. Admin kullanıcısının satın alma işlemlerini görüntülemesine ve yönetmesine olanak tanıyan arayüzü render eder.

- AdminPurchasingPage

## Notlar

- Kaynak dosyada yalnızca tek bir dışa aktarılan fonksiyon tanımlıdır; dolayısıyla iç fonksiyon çağrıları veya alt bileşen bağımlılıkları bu kaynak düzeyinde görünmemektedir.
- Modül, `views` katmanında yer aldığından, alt bileşenlere ve servis katmanına yönelik iç bağımlılıklarının bu dosya dışında tanımlı olduğu anlaşılmaktadır; ancak bu bağımlılıklar verilen kaynakta belirtilmemiştir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** `AdminPurchasingPage` fonksiyonunun yalnızca imzası (`() -> React.FC`) sağlanmıştır; fonksiyon gövdesi verilmediğinden çalışması için gerekli koşullar belirlenememektedir.

---

## FONKSİYON DETAYLARI

### AdminPurchasingPage
**Ne yapar**: Satınalma yönetim sayfasını oluşturur. T062 D4 (cetvel §8) kapsamında tanımlanan satınalma sayfasının üst düzey kabuk bileşenidir. Sayfa yapısı başlık ve bir `Suspense` sınırından oluşur; veri yükleme, URL yönetimi ve filtre durumu gibi sorumluluklar alt bileşen olan `PurchasingTableBody`'ye devredilmiştir.

**Nasıl yapar**: Bileşen, sayfanın genel düzenini tanımlar ve `PurchasingTableBody` alt bileşenini `useAdminTable` ile birlikte kullanır. `useSearchParams` tüketicisi, React'ın `<Suspense>` bileşeni ile sarılarak asenkron veri yükleme sırasında kullanıcıya bir fallback gösterilmesi sağlanır. Bu sarma işlemi, CLAUDE.md Kural 5 / K2'de belirtilen kurala uygun olarak gerçekleştirilir; böylece URL arama parametrelerinin okunması sırasında oluşabilecek askıya alma (suspension) durumları güvenli biçimde yönetilir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `React.FC` — React fonksiyon bileşeni döndürür. Dönen bileşen, satınalma sayfasının tamamını başlık ve `Suspense` ile sarılmış tablo gövdesiyle render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../../i18n/I18nProvider::useI18n
- import: ../../../utils/adminUi::adminSectionTitleClass
- import: ../../../utils/adminUi::adminSubtitleClass
- import: ./PurchasingTableBody::PurchasingTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/purchasing/AdminPurchasingPage.tsx::AdminPurchasingPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.purchasing.title')` ve `t('admin.purchasing.subtitle')` çağrılarıyla sayfa başlığı ve alt başlığı metinlerini yerelleştirir
- **kullanilan_moduller**:
  - `useI18n` — i18n bağlamından çeviri fonksiyonunu almak için kullanılan hook
  - `adminSectionTitleClass` — `h1` elementine uygulanan CSS sınıfı sabiti
  - `adminSubtitleClass` — `p` elementine uygulanan CSS sınıfı sabiti
  - `AdminSkeleton` — `Suspense` bileşeninin `fallback` prop'unda kullanılan iskelet yükleme bileşeni; `variant="table"`, `count={6}`, `rows={6}` prop'larıyla tablo varyantında 6 sütun ve 6 satırlık yükleme animasyonu gösterir
  - `PurchasingTableBody` — satın alma tablosunun gövdesini oluşturan bileşen; `Suspense` içinde sarılı olarak render edilir
  - `Suspense` — `PurchasingTableBody` bileşeni yüklenirken `AdminSkeleton` fallback'ını gösteren React bileşeni
- **Dönüş**: JSX element — `div.space-y-6.pb-20` kök elemanı içinde `header` (başlık ve alt başlık) ve `Suspense` ile sarılı `PurchasingTableBody` içeren React bileşeni (React.FC)

---

## NODE ID STANDARD

  file: src\views\admin\purchasing\AdminPurchasingPage.tsx
  function: src\views\admin\purchasing\AdminPurchasingPage.tsx::AdminPurchasingPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminPurchasingPage

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
- **Yardımcı Sınıflar:** `pb-20`, `space-y-6`