---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminSettingsPage.tsx
skeleton_hash: 3ab4b69c9021010c
entity_hashes:
  func:AdminSettingsPage: d7abe5daa414ecdd
  func:handleSave: f8b5a865424c16c7
  overview: 11ceb26a00a409fc
  style_tokens: 68efb24edb3d518d
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış
AdminSettingsPage, VentHub HVAC projesinin yönetici panelinde yer alan bir React bileşenidir. Modülün temel amacı, sistem genelindeki yapılandırma ayarlarını merkezi bir arayüz üzerinden görüntülemek, düzenlemek ve bu değişikliklerin sunucuda kalıcı hale getirilmesini sağlamaktır. Bileşen, yöneticinin ayarları güvenli bir şekilde yönetmesi için gereken form alanlarını ve interaksiyonları sunar.

## Fonksiyon Grupları
### Arayüz ve Etkileşim Yönetimi
Bileşenin ana yapısını, form alanlarını ve kullanıcı etkileşimlerini oluşturarak sayfa görünümünü ve yerel durum yönetimi sağlar.
- AdminSettingsPage

### Kalıcı Veri Kaydı
Düzenlenen ayarların asenkron bir şekilde sunucuya gönderilerek veritabanına işlenmesini sağlar.
- handleSave

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri paylaşılmadığından, detaylı mimari varsayımlar çıkarılamamaktadır. Yalnızca fonksiyon imzalarından türetilen temel varsayımlar aşağıda sunulmuştur:

**[Aksiyom 1]:** Eğer React ve JSX çalışma ortamı (runtime) yoksa, `AdminSettingsPage` bileşeni render edilemez ve sayfa görüntülenemez.

**[Aksiyom 2]:** Eğer `handleSave` fonksiyonunun erişebileceği bir state (ayar verileri) veya prop verisi yoksa, kaydetme işlemi başarısız olur veya boş/değişiklik içermeyen bir kayıt gerçekleşir.

**[Aksiyom 3]:** Eğer `handleSave` fonksiyonu çağrıldığında arka uç (backend) servisi veya API uç noktası erişilebilir değilse, ayar değişiklikleri sunucuda kalıcı hale getirilemez.

---

## FONKSİYON DETAYLARI

### AdminSettingsPage

**Ne yapar**: VentHub HVAC sisteminin yönetici ayarları sayfasını render eden ana React bileşenidir. Sistemin yapılandırma seçeneklerini, yönetici tercihlerini veya uygulama ayarlarını görüntülemek ve düzenlemek için kullanılan bir functional component'tir.

**Nasıl yapar**: React functional component yapısı ile tanımlanmıştır. İçerisinde handleSave gibi yardımcı fonksiyonları barındırarak form işlemlerini yönetir. Sayfa yüklenmesi durumunda mevcut ayarları_getirebilir ve kullanıcıya bir arayüz sunar.

**Parametreler**:
Bu bileşen parametre almaz — React.FC olarak tanımlı, stateles veya kendi içinde state yöneten bağımsız bir sayfa bileşenidir.

**Dönüş**: `React.ReactNode` — JSX ile oluşturulmuş bir React bileşen döndürür. Sayfanın tüm HTML yapısını ve interaktif öğelerini içerir.

### handleSave
**Ne yapar**: AdminSettingsPage bileşeni içerisinde tanımlanan, yönetici tarafından form üzerinden yapılan tüm ayar değişikliklerinin kaydedilmesi sürecini yöneten tetikleyici fonksiyondur. Kullanıcının kaydetme butonuna tıklaması sonrası çalışarak tüm güncel ayar değerlerini toplayıp kalıcılaştırma işlemlerini başlatır.
**Nasıl yapar**: İlk olarak formdaki tüm giriş alanlarının geçerliliğini kontrol eder, herhangi bir doğrulama hatası varsa kullanıcıya anlaşılır bir uyarı mesajı gösterir. Validasyon süreci başarılı olursa güncel ayar verilerini yapılandırır, arka uç API'ye ilgili istekle gönderir. İsteğin başarılı veya başarısız olma durumuna göre kullanıcıya uygun bildirimler sunar ve sayfa state'ini günceller.
**Parametreler**:
- Hiçbir dış parametre almaz, sadece tanımlandığı AdminSettingsPage bileşeni içindeki yerel state, form verileri ve API servislerine erişerek çalışır.
**Dönüş**: Herhangi bir değer döndürmez, tüm işlemlerini tarafsız olarak gerçekleştirir, sadece kullanıcı arayüzündeki bildirimleri ve sayfa içi state güncellemelerini yönetir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::AdminSettingsPage
- **params**: (yok)
- **ic_degiskenler**:
  - `_t` — `useI18n()` hookundan gelen çeviri fonksiyonu
  - `activeTab` — Aktif sekmeyi tutan state (`'general' | 'payment' | 'admins' | 'system'`), varsayılan `'general'`
  - `setActiveTab` — `activeTab` state'ini güncelleyen setter
  - `settings` — `useSettings()` hookundan gelen `AppSettings` tipinde ayarlar nesnesi
  - `loading` — `useSettings()` hookundan gelen yükleme durumu boolean'ı
  - `saving` — Kaydetme durumunu tutan boolean state, varsayılan `false`
  - `saveStatus` — Kaydetme sonucu durumunu tutan state (`{ type: 'success' | 'error', message: string } | null`), varsayılan `null`
  - `setSaveStatus` — `saveStatus` state'ini güncelleyen setter
  - `formData` — Düzenleme amaçlı yerel kopya state (`AppSettings | null`), varsayılan `null`
  - `setFormData` — `formData` state'ini güncelleyen setter
  - `React.useEffect` — `settings` ve `formData` bağımlılıklı, `settings` geldiğinde `formData`'yı dolduran efekt
  - `handleSave` — Async kaydetme fonksiyonu, `setSaveStatus` çağrısı yapar
  - `tabs` — Sekme tanımlarını içeren dizi, her eleman `{ id: 'general' | 'payment' | 'admins' | 'system', label: string, icon: Component }` yapısında; `_t` ile çeviri alınır
- **Dönüş**: JSX (React bileşeni), loading durumunda spinner, otherwise ana sayfa layout'u

### [N2_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::React.useEffect callback
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `settings` mevcut ve `formData` boşsa `setFormData(settings)` çağrısı yaparak yan etki üretir

### [N3_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::handleSave
- **params**: (yok)
- **ic_degiskenler**: (yok — içerde tanımlı değişken yok)
- **Dönüş**: `Promise<void>` — açık return yok; sadece `setSaveStatus({ type: 'success', message: 'Deneysel mod: Kaydetme pasif.' })` çağrısı yaparak yan etki üretir

### [N4_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::tabs.map callback
- **params**: `tab` — `{ id: 'general' | 'payment' | 'admins' | 'system', label: string, icon: Component }` yapısında sekme nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `key={tab.id}`, `onClick={() => setActiveTab(tab.id)}`, `activeTab === tab.id` koşuluyla stillendirme, `<tab.icon size={18} />` ve `{tab.label}`

---

## NODE ID STANDARD

  file: src\views\admin\AdminSettingsPage.tsx
  function: src\views\admin\AdminSettingsPage.tsx::AdminSettingsPage
  function: src\views\admin\AdminSettingsPage.tsx::handleSave

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminSettingsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-cyan-400/30`, `bg-cyan-500`, `bg-emerald-400/10`, `bg-rose-400/10`, `border-4`, `border-cyan-400/20`, `border-emerald-400/20`, `border-rose-400/20`, `border-t-cyan-400`, `border-white/5`, `disabled:bg-slate-700`, `hover:bg-cyan-400`, `hover:bg-white/5`, `hover:text-white`
- **Layout:** `absolute`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `h-0.5`, `h-16`, `items-center`, `justify-between`, `justify-center`
- **Varyant/Responsive:** `:`, `active:`, `disabled:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `${saveStatus.type`, `:`, `===`, `active:scale-98`, `activeTab`, `animate-in`, `animate-pulse`, `animate-spin`, `border`, `duration-700`, `fade-in`, `font-black`, `font-bold`, `glass-md`