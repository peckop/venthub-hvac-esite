---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminSettingsPage.tsx
skeleton_hash: 0888f56aa6c1221b
entity_hashes:
  func:AdminSettingsPage: d7abe5daa414ecdd
  func:handleSave: f8b5a865424c16c7
  overview: d59f9e9f0537eb5a
  style_tokens: 68efb24edb3d518d
generated_at: 2026-05-28T22:39:24Z
---

## Genel Bakış
VentHub HVAC projesindeki yönetici panelinin ayarlar sayfasını temsil eden React bileşenidir. Sistem genelindeki yapılandırma ayarlarının view ve yönetim arayüzünü sunar. Yönetici bu sayfa üzerinden ayarları görüntüleyip düzenleyebilir ve değişiklikleri sunucuya kaydedebilir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Tüm sayfa yapısını, form alanlarını ve kullanıcı etkileşimini yönetir.
- AdminSettingsPage

### Veri Kaydetme İşlemleri
Yapılan değişikliklerin asenkron olarak sunucuya gönderilmesini ve kalıcı hale getirilmesini sağlar.
- handleSave

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayımlar, fonksiyon imzaları ve modülün amacından yola çıkarak tanımlanmıştır:

[Aksiyom 1]: Eğer `handleSave()` çağrıldığında geçerli bir oturum veya kimlik doğrulama bilgisi yoksa, ayar kaydetme işlemi başarısız olur veya reddedilir.

[Aksiyom 2]: Eğer `handleSave()` sırasında sunucu bağlantısı kopuksa veya API endpoint'i erişilemez durumda ise, kaydetme işlemi tamamlanamaz ve kullanıcıya hata bildirimi gerekir.

[Aksiyom 3]: Eğer `AdminSettingsPage` bileşeni çağrılmadan önce kullanıcı rolü "admin" değilse, sayfaya erişim engellenmelidir.

[Aksiyom 4]: Eğer `handleSave()` fonksiyonu daha önceki kayıtlı bir durum (state) içeriğiyle çağrılmazsa, boş veya varsayılan değerler kaydedilir — bu durum veri bütünlüğü sorunlarına yol açabilir.

[Aksiyom 5]: Eğer `handleSave()` asenkron bir işlem olarak tanımlıysa ve kullanıcı işlem devam ederken birden fazla kez tıklarsa, çift kayıt veya çakışma sorunu yaşanabilir.

---

**Not:** Fonksiyon imzaları parametresiz ve default değer içermemektedir. Bu nedenle belirli eşik değerleri veya kabul kriterleri bu模ül için tanımlanamamıştır. State yönetimi, API endpoint'leri ve form alanları hakkında kesin bilgi mevcut değildir.

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

### [N1_NASIL] AST Pointer: AdminSettingsPage.tsx::AdminSettingsPage
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `_t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, UI metinleri için kullanılır
  - `activeTab` — `useState<'general' | 'payment' | 'admins' | 'system'>('general')` ile tanımlı, hangi sekmenin aktif olduğunu tutar
  - `setActiveTab` — `activeTab` state setter, sekme değişikliğinde çağrılır
  - `settings` — `useSettings()` hook'undan dönen `AppSettings` tipinde ayarlar nesnesi
  - `loading` — `useSettings()` hook'undan dönen boolean, veri yüklenme durumu
  - `saving` — `useState(false)`, kaydetme işlemi sırasında true olur
  - `saveStatus` — `useState<{ type: 'success' | 'error', message: string } | null>(null)`, kaydetme sonrası başarı/hata durumu ve mesajı
  - `setSaveStatus` — `saveStatus` state setter, kaydetme sonucunu günceller
  - `formData` — `useState<AppSettings | null>(null)`, settings'in yerel düzenlenebilir kopyası
  - `setFormData` — `formData` state setter, settings verisini form verisine kopyalar
  - `handleSave` — içinde tanımlı `async ()` fonksiyonu, kaydetme işlemini tetikler
  - `tabs` — `Array<{ id, label, icon }>`, sekme tanımları dizisi; her eleman `id`, `_t()` ile çevrilmiş `label` ve icon component içerir
- **Dönüş**: JSX — Loading durumunda spinner, aksi halde ayarlar sayfası layout'u (header, save butonu, tab bar, içerik alanı)

---

### [N2_NASIL] AST Pointer: AdminSettingsPage.tsx::useEffect_callback
- **params**: () — callback fonksiyonu
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `setFormData(settings)` yan etkisi ile `settings` verisini `formData`'ya kopyalar, koşul: `settings` mevcut ve `formData` henüz atanmamış

---

### [N3_NASIL] AST Pointer: AdminSettingsPage.tsx::handleSave
- **params**: async () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `setSaveStatus({ type: 'success', message: 'Deneysel mod: Kaydetme pasif.' })` çağrısı ile deneysel mod mesajı set eder

---

### [N4_NASIL] AST Pointer: AdminSettingsPage.tsx::tabs_map_callback
- **params**: `tab` — `tabs` dizisindeki her bir eleman; `{ id: 'general' | 'payment' | 'admins' | 'system', label: string, icon: React.FC<{size: number}> }` yapısında
- **ic_degiskenler**: (yok — doğrudan parametre ve mevcut state'ler kullanılır)
  - `tab.id` — sekme tanımlayıcısı, `key` prop'u ve `setActiveTab` çağrısı için kullanılır
  - `tab.icon` — sekme ikonu componenti, `<tab.icon size={18} />` olarak render edilir
  - `tab.label` — sekme etiket metni, `<button>` içeriğinde gösterilir
  - `setActiveTab` — useCallback'ten gelen state setter, `tab.id` değerini aktif sekme olarak atar
  - `activeTab` — mevcut aktif sekme, `activeTab === tab.id` koşulu ile aktif sekme stili uygulanır
- **Dönüş**: `<button>` JSX elementi — sekme butonu, koşullu CSS class ile aktif/pasif durum render edilir

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