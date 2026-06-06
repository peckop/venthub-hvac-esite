---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\CategoryBuilderView.tsx
skeleton_hash: 51e67bc6da0fd1e7
entity_hashes:
  func:CategoryBuilderView: c538d4ad7085f51d
  func:handleSave: f8b5a865424c16c7
  overview: 228c38d7ec836061
  style_tokens: 745d0461670ee6bd
generated_at: 2026-06-06T21:58:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC admin panelinde kategori yapısının görsel olarak oluşturulması ve düzenlenmesini sağlayan bir React görünüm bileşenidir. Mevcut bir kategoriyi yeniden yapılandırma veya sıfırdan yeni bir kategori hiyerarşisi tasarlama süreçlerini tek bir bileşen üzerinden yönetir.

## Fonksiyon Grupları
### Ana Görünüm Bileşeni
Kullanıcıya kategori verilerini düzenleyebileceği bir arayüz sunar. `categoryId` prop değerine bağlı olarak yeni kategori oluşturma veya mevcut kategoriyi düzenleme modunda çalışır.
- CategoryBuilderView

### Veri Kaydetme İşleyicisi
Formda düzenlenen kategori yapısının sunucuya gönderilmesini ve kalıcı hale getirilmesini koordine eder. Kayıt işleminin sonucuna göre kullanıcıya geri bildirim sağlar.
- handleSave

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen bilgiler yalnızca fonksiyon imzası düzeyindedir; fonksiyon gövdeleri paylaşılmadığından çıkarım kapsamı oldukça dar tutulmuştur.

---

[Aksiyom 1]: Eğer `categoryId` prop'u `CategoryBuilderView` bileşenine sağlanmazsa, bileşenin çalışma modu (yeni oluşturma mu yoksa düzenleme mi olduğu) belirsiz olur.

**Neden:** Fonksiyon imzasında `categoryId` için bir default değer tanımlanmamıştır. Prop'un varlığı/yokluğu bileşenin hangi modda çalışacağını belirleyen tek belirleyici olarak görünmektedir; bu ayrımın olmadığında bileşenin hangi davranışı göstereceği imza düzeyinde bilinmemektedir.

---

[Aksiyom 2]: Eğer `handleSave()` fonksiyonu çağrıldığında bileşenin iç state'inde kaydedilecek geçerli bir kategori verisi (yapı/hiyerarşisi) mevcut değilse, kaydetme işlemi hatalı bir istekle sonuçlanır veya veri kaybı oluşur.

**Neden:** `handleSave()` parametsiz olarak tanımlıdır; bu durum, fonksiyonun kendi iç state'inden veri okuduğunu gösterir. Fonksiyon gövdesinde state doğrulaması olup olmadığı bilinmediğinden, geçerli veri olmaması durumunda davranış bilinmemektedir.

---

[Aksiyom 3]: Eğer `CategoryBuilderView` bileşeni bir React ortamı (parent bileşen, state management, API servisleri) dışında çalıştırılmaya çalışılırsa, fonksiyonların hiçbiri beklenen çıktıyı üretemez.

**Neden:** Her iki fonksiyon da React bileşen imzası (destructure edilmiş props) ve olay işleyici kalıbındadır; React yaşam döngüsüne ve component tree'ye bağımlıdır. Ancak bu bağımlılıkların somut listesi fonksiyon gövdelerinde görülmediğinden, tam olarak hangi servislerin zorunlu olduğu bilinmemektedir.

---

> **Not:** Fonksiyon gövdeleri paylaşılmadığı için modül içi veri doğrulama eşikleri, API endpoint bağımlılıkları veya state yapısı hakkında somut aksiyom türetilmemiştir. Yukarıdaki varsayımlar yalnızca fonksiyon imzalarından çıkarılabilen minimum düzeydeki mimari gereklilikleri yansıtmaktadır.

---

## FONKSİYON DETAYLARI

### CategoryBuilderView
**Ne yapar**: VentHub HVAC projesinin admin panelinde kategori oluşturma ve düzenleme işlemlerini sunan React bileşenidir. Sıfırdan yeni kategori ekleme veya var olan bir kategoriyi güncelleme işlemleri için gerekli kullanıcı arayüzünü ekrana render eder.
**Nasıl yapar**: Kendisine prop olarak iletilen categoryId değerini temel alarak çalışma modunu belirler. Eğer categoryId değeri mevcutsa ilgili kategorinin verilerini yükleyerek düzenleme modunu aktif eder, kategoriId yoksa sıfırdan kategori oluşturma modunda boş form arayüzünü hazırlar. React component mimarisi üzerinden tüm form alanları ve aksiyon butonlarını bir araya getirerek admin kullanıcısının kullanımına sunar.
**Parametreler**:
- name: categoryId, type: string | number | undefined — Düzenlenecek mevcut kategorinin sistemdeki benzersiz kimlik değeridir. Eğer bu değer tanımsızsa bileşen otomatik olarak yeni kategori oluşturma modunda çalışır.
**Dönüş**: React.FC<CategoryBuilderViewProps> tipinde geçerli bir React bileşeni döndürür. Bu bileşen admin paneli içerisinde kategori işlemleri için tüm gerekli arayüz öğelerini barındırır.

### handleSave
**Ne yapar**: Kategori oluşturma veya düzenleme formunda kaydetme aksiyonu tetiklendiğinde çalışan, kullanıcı girdilerini işleyerek veritabanına kaydedilmesini sağlayan yardımcı işlevdir. Yeni kategori ekleme veya mevcut kategori güncelleme işlemlerinin iş akışını yönetir.
**Nasıl yapar**: Tanımlandığı CategoryBuilderView bileşeninin içindeki form girdilerini ve categoryId prop değerini kullanarak işlem adımlarını yürütür. Önce kullanıcı tarafından girilen verilerin doğruluğunu kontrol eder, hatalı veya eksik giriş varsa kullanıcıya bilgilendirme sunar. Doğrulama başarılı olursa ilgili backend API'sine istek göndererek verilerin kalıcı olarak kaydedilmesini sağlar.
**Parametreler**: Harici olarak herhangi bir parametre almaz, yalnızca ait olduğu CategoryBuilderView bileşeninin içindeki state ve prop değerlerini kullanır.
**Dönüş**: void tipindedir, herhangi bir değer döndürmez, yalnızca kaydetme iş akışının adımlarını tetikler ve yürütür.

---

## INTERFACES

### CategoryBuilderViewProps
- `categoryId: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryBuilderView.tsx::CategoryBuilderView
- **params**: `categoryId` — Kategoriyi yüklemek ve güncellemek için kullanılan benzersiz kimlik
- **ic_degiskenler**:
  - `router` — Next.js router, geri butonu ile `router.back()` çağrısıyla kullanılır
  - `category` — `useState<DbCategory | null>`: Supabase'den yüklenen kategori verisi; header'da `category?.name` olarak gösterilir
  - `blocks` — `useState<AuthorityBlock[] | null>`: Otorite blokları dizisi; AuthorityBuilder'a value, AuthorityRenderer'a content olarak verilir
  - `loading` — `useState<boolean>`: Yüklenme durumu; true iken loading ekranı, false iken ana editör render edilir
  - `saving` — `useState<boolean>`: Kaydetme durumu; handleSave tetiklendiğinde true olur, kaydetme butonunu disabled yapar
  - `previewMode` — `useState<'desktop' | 'mobile'>`: Önizleme panelinin cihaz modu, desktop/mobile butonlarıyla değiştirilir
  - `showPreview` — `useState<boolean>`: Sağ taraftaki canlı önizleme panelinin açık/kapalı durumunu kontrol eder
  - `load` — `useCallback(async () => {...}, [categoryId])`: Kategoriyi Supabase'den yükleyen, legacy verileri migrate eden memoized fonksiyon; useEffect içinde çağrılır
- **Dönüş**: JSX — Loading ekranı veya tam editör sayfası (header + AuthorityBuilder + canlı önizleme sidebar)

### [N2_NASIL] AST Pointer: CategoryBuilderView.tsx::load
- **params**: yok
- **ic_degiskenler**:
  - `data` — Supabase `select().single()` sorgusundan dönenham veri; `cat` değişkenine cast edilir
  - `error` — Supabase sorgu sonucundaki hata nesnesi; varsa fırlatılıp catch bloğunda yakalanır
  - `cat` — `data`'nın `DbCategory` tipine cast edilmiş hali; `description`, `metadata`, `authority_content` alanları okunur
  - `initialBlocks` — `cat.authority_content`'ün `AuthorityBlock[]` tipine cast edilmiş hali; boşsa legacy migration çalıştırılır
  - `legacyBlocks` — `AuthorityBlock[]`: Eski statik verilerden oluşturulan blok dizisi; rich-text ve specs blokları push edilir
  - `meta` — `cat.metadata`'nın `CategoryMetadata | null` tipine cast edilmiş hali; `metric1` ve `metric2` alanları kontrol edilir
  - `rows` — `SpecsBlock['content']['rows']`: Spec bloğunun satırları; `meta.metric1` ve `meta.metric2`'den label/value çiftleri eklenir
- **Dönüş**: yok — Yan etki olarak `category` ve `blocks` state'lerini günceller; hata durumunda `toast.error`, başarılı legacy dönüşümde `toast.success` gösterir

### [N3_NASIL] AST Pointer: CategoryBuilderView.tsx::handleSave
- **params**: yok
- **ic_degiskenler**:
  - `error` — Supabase `update()` çağrısından dönen hata nesnesi; fırlatılıp catch bloğunda yakalanır
- **Dönüş**: yok — Yan etki olarak `blocks` dizisini `DbJson` tipine cast edip Supabase'deki `categories` tablosunun `authority_content` alanına yazar; `saving` state'ini yönetir; başarı/hata toast mesajı gösterir

---

## NODE ID STANDARD

  file: src\views\admin\CategoryBuilderView.tsx
  function: src\views\admin\CategoryBuilderView.tsx::CategoryBuilderView
  function: src\views\admin\CategoryBuilderView.tsx::handleSave

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryBuilderView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-xl`, `tracking-hvac-loose`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/40`, `bg-cyan-500`, `bg-emerald-500`, `bg-emerald-500/10`, `bg-slate-950`, `bg-surface-darkest`, `bg-surface-deep`, `bg-white`, `bg-white/10`, `bg-white/2`, `bg-white/5`, `border-4`, `border-8`, `border-b`, `border-cyan-400/20`
- **Layout:** `custom-scrollbar`, `custom-scrollbar-light`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `h-1.5`, `h-12`, `h-14`, `h-16`, `h-568px`, `h-full`
- **Varyant/Responsive:** `:`, `active:`, `disabled:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${previewMode`, `${showPreview`, `:`, `===`, `active:scale-95`, `animate-in`, `animate-pulse`, `animate-spin`, `border`, `desktop`, `disabled:opacity-50`, `duration-500`, `font-black`, `font-bold`, `font-sans`