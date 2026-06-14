---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx
skeleton_hash: e641cd80fb2ebb0a
entity_hashes:
  func:AccountOverviewPage: 2fd2e5b9d82d2f19
  overview: 55e40bf9d68b1dff
  style_tokens: 98f0536966ac7e31
generated_at: 2026-06-14T16:23:06Z
---

## Genel Bakış
VentHub HVAC uygulamasının Account modülü içinde yer alan AccountOverviewPage, kullanıcının kişisel hesap yönetimine dair tüm temel bilgileri görselleştirdiği merkezi dashboard sayfasıdır. Profil bilgileri, sipariş geçmişi, aktif kargo durumları ve kayıtlı adreslerini tek bir entegre arayüzde sunarak kullanıcıya kapsamlı bir hesap özeti sağlar. Sayfa, hesapla ilgili kritik verileri sunucudan çekip düzenleyerek bilgiye hızlı erişimi amaçlar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Kullanıcının hesap özetini oluşturan ve tarayıcıda render edilen temel React bileşenidir. Verileri işler, hata ve yükleme durumlarını yönetir ve düzenli bir dashboard aracılığıyla kullanıcıya sunar.
- AccountOverviewPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz bir React sayfa bileşeni olup, çalışması için aşağıdaki mimari varsayımlara ihtiyaç duyar:

[Aksiyom 1]: Eğer kullanıcı kimlik doğrulaması (authentication) yapılmamışsa, hesap özet sayfasının verilerini göstermesi beklenemez — kullanıcı oturumu yoksa sayfa içerikleri boş kalır veya yönlendirme yapılır.

[Aksiyom 2]: Eğer hesap özet verilerini sağlayan backend API uç noktaları (sipariş geçmişi, profil bilgileri, adres listesi) erişilebilir değilse, ilgili dashboard bileşenleri veri gösteremez.

[Aksiyom 3]: Eğer React Router veya eşdeğeri yönlendirme bağlamı (routing context) mevcut değilse, sayfa içi navigasyon linkleri (sipariş detayı, adres yönetimi vb.) çalışmaz.

[Aksiyom 4]: Eğer kullanıcı oturum bilgilerini sağlayan auth context/provider üst seviyede bağlanmamışsa, bileşen kullanıcının profil bilgilerine erişemez.

[Aksiyom 5]: Eğer modül Tailwind CSS veya stil sistemi (style_tokens) yüklenmemişse, dashboard arayüzü beklenen görsel formatta render edilmez.

---

## FONKSİYON DETAYLARI

### AccountOverviewPage

**Ne yapar**: Kullanıcının hesap özet sayfasını render eder. Kullanıcının aktif ve tamamlanmış siparişlerini, toplam sipariş hacmini, varsayılan adreslerini ve kargo durumunu gösteren bir dashboard bileşenidir.

**Nasıl yapar**: Bileşen, `useAuth` hook'u ile oturum açmış kullanıcı bilgisini, `useI18n` hook'u ile dil ve çeviri fonksiyonunu, `useRouter` hook'u ile sayfa yönlendirmesini alır. `useState` ile adresler, siparişler ve yükleme durumu için state'ler oluşturur. `useEffect` hook'u içinde `listAddresses` fonksiyonu ile kullanıcı adreslerini, Supabase veritabanından `venthub_orders` tablosunu sorgulayarak siparişleri çeker. İlk sorgu başarısız olursa fallback olarak daha az alanla tekrar dener. Siparişler üzerinden aktif sipariş sayısı, tamamlanmış sipariş sayısı ve toplam hacim hesaplamaları yapılır. `getShipStatus` yardımcı fonksiyonu ile kargo durumu belirlenir, `activeShipStatusBadge` fonksiyonu ile duruma göre renkli rozet JSX'i üretilir. Yükleme durumunda animasyonlu spinner, yükleme tamamlandığında ise Bento Grid yapısında metric kartları, kargo takip widget'ı, son siparişler listesi, adres kartı, güvenlik merkezi ve destek kartı render edilir.

**Parametreler**:
- Bu bileşen herhangi bir props almaz. Veri ihtiyacını React hook'ları (`useAuth`, `useI18n`, `useRouter`) ve doğrudan Supabase istemcisi üzerinden karşilar.

**Dönüş**: `JSX.Element` — Yükleme durumunda animasyonlu spinner içeren bir `div`, yükleme tamamlandığında ise tam sayfa dashboard JSX'ini döndürür. Dashboard; karşılama kartı, üç metric kartı (aktif sipariş, tamamlanan sipariş, toplam hacim), kargo takip widget'ı, son siparişler listesi, adres özeti kartı, güvenlik merkezi kartı ve destek kartı bölümlerinden oluşur.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDate
- import: ../../i18n/format::formatCurrency
- import: ../../utils/routes::Routes
- import: @/lib/services/address.service::listAddresses
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/ui-models::type { UserAddress }
- import: next/link::Link
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### OrderRecord
- `id: string`
- `created_at: string`
- `total_amount: number | string`
- `status: string`
- `order_number: string`

### ShipmentRecord extends OrderRecord
- `carrier: string | null`
- `tracking_number: string | null`
- `shipped_at: string | null`
- `delivered_at: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::useEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — lifecycle flag; async state update'lerin component unmount sonrası gerçekleşmemesini sağlar, cleanup'ta `false` yapılır
- **Dönüş**: cleanup fonksiyonu döner → `() => { mounted = false }`

---

### [N2_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `addrData` — `listAddresses(supabase)` çağrısının sonucu; kullanıcının adres listesi, `setAddresses` ile state'e yazılır
  - `orderData` — `ShipmentRecord[]` tipinde akümülatör; supabase sorgusundan gelen veya fallback'ten elde edilen sipariş kayıtları tutulur, başlangıçta boş dizi `[]`
  - `data` — supabase `venthub_orders` tablosundan gelen birincil sorgu sonucu (satırlar)
  - `error` — supabase birincil sorgu hatası; `PGRST100` kodu ile kontrol edilip throw edilir
  - `fallback` — birincil sorgu başarısız olduğunda çalıştırılan yedek supabase sorgusu sonucu; sadece temel alanları (`id`, `created_at`, `total_amount`, `status`, `order_number`) çeker
  - `e` — üst düzey catch'te yakalanan hata nesnesi; `console.error('Overview load error', e)` ile loglanır
- **Erişim Dış Değişkenler**: `user` (auth objesi, `user.id` kullanılır), `setLoading`, `setAddresses`, `setOrders` (state setter'ları), `supabase` (browser client), `mounted` (lifecycle flag)
- **Dönüş**: yok (void; tüm işlemler side-effect olarak state setter'ları üzerinden gerçekleşir)

---

### [N3_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::fallbackMapCallback
- **params**: `d` — `Record<string, unknown>` tipinde tek bir fallback sipariş satırı
- **ic_degiskenler**:
  - (ek değişken yok)
- **Erişim Dış Değişkenler**: yok
- **Dönüş**: `{ ...d, carrier: null, tracking_number: null, shipped_at: null, delivered_at: null }` — orijinal satıra eksik kargo alanlarını `null` olarak ekleyerek `ShipmentRecord` formatına dönüştürür

---

### [N4_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::getShipStatus
- **params**: `row` — `ShipmentRecord | undefined`, opsiyonel sipariş satırı
- **ic_degiskenler**:
  - (ek değişken yok; tüm kontroller parametre üzerinden yapılır)
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'` — siparişin teslimat durumu string'ini döner; `row` tanımsızsa `'preparing'`, `delivered_at` varsa veya status `'delivered'` ise `'delivered'`, `shipped_at`/`tracking_number` varsa veya status `'shipped'` ise `'shipped'`, aksi halde `'preparing'`

---

### [N5_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::statusBadge
- **params**: `status` — `'delivered' | 'shipped' | 'preparing'`
- **ic_degiskenler**:
  - (ek değişken yok; switch-case ile doğrudan JSX döner)
- **Erişim Dış Değişkenler**: `t` (i18n çeviri fonksiyonu), `CheckCircle`, `Truck`, `Clock` (ikon bileşenleri import'tan)
- **Dönüş**: JSX `<span>` elemanı — duruma göre renk ve ikon ile sipariş durum rozeti (yeşil/turuncu/mor badge)

---

### [N6_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::getShipStepIndex
- **params**: `status` — `'delivered' | 'shipped' | 'preparing'`
- **ic_degiskenler**:
  - (ek değişken yok)
- **Dönüş**: `number` — `'delivered'` → `2`, `'shipped'` → `1`, diğer → `0`; siparişin hangi adımda olduğunu indeks olarak döner

---

### [N7_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::shipStepsMapCallback
- **params**: `step` — `{ key: string, icon: ComponentType, label: string }` tipinde adım nesnesi; `idx` — `number` dizin indeksi
- **ic_degiskenler**:
  - `active` — `boolean`, bu adımın aktif olup olmadığı; `idx <= activeStepIdx` koşulu ile belirlenir
  - `StepIcon` — `step.icon` referansı; adım ikonu bileşeni, `<StepIcon size={20} />` olarak render edilir
- **Erişim Dış Değişkenler**: `activeStepIdx` (mevcut aktif adım indeksi), `shipSteps` (tüm adımlar dizisi, uzunluk kontrolünde `shipSteps.length - 1` kullanılır)
- **Dönüş**: `<React.Fragment>` — adım ikonu + label + aradaki bağlayıcı çizgi JSX'ini döner; aktifliğe göre renk/scale değişimi uygulanır

---

### [N8_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::ordersMapCallback
- **params**: `o` — `ShipmentRecord` tipinde tek bir sipariş kaydı
- **ic_degiskenler**:
  - `isDelivered` — `boolean`, siparişin teslim edilip edilmediğini `o.status.toLowerCase() === 'delivered'` kontrolü ile belirler
  - `code` — `string`, sipariş numarası; `o.order_number` varsa `#${o.order_number.split('-')[1]}`, yoksa `#${o.id.slice(-8).toUpperCase()}` formatında oluşturulur
- **Erişim Dış Değişkenler**: `t` (i18n çeviri), `formatCurrency` (para birimi formatlama), `formatDate` (tarih formatlama), `lang` (dil kodu), `router` (next/navigation useRouter), `activeShipStatusBadge` (durum rozeti render fonksiyonu), `getShipStatus` (durum hesaplama), `Routes` (yönlendirme route'ları)
- **Dönüş**: JSX `<div>` — sipariş satırı kartı; sipariş ikonu, numara, tutar, tarih, durum rozeti ve detay butonu içeren tam bir liste elemanı

---

## NODE ID STANDARD

  file: src\views\account\AccountOverviewPage.tsx
  function: src\views\account\AccountOverviewPage.tsx::AccountOverviewPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountOverviewPage

---

## BILEŞIM (CONTAINS)
  contains: OrderRecord

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50`, `bg-amber-500/10`, `bg-blue-400/5`, `bg-blue-50`, `bg-blue-500/10`, `bg-emerald-50`, `bg-emerald-500/10`, `bg-gradient-to-br`, `bg-green-500/10`, `bg-orange-50`, `bg-orange-500/10`, `bg-primary-navy`, `bg-primary-navy/5`, `bg-purple-500/10`, `bg-slate-200`
- **Layout:** `-bottom-4`, `-left-10%`, `-right-10%`, `-right-20%`, `-right-4`, `-right-6`, `-top-1/2`, `-top-20%`, `-top-6`, `-z-10`, `absolute`, `backdrop-blur-md`, `backdrop-blur-sm`, `bottom-0`, `flex`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:`, `lg:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `${active`, `${activeStepIdx`, `${isDelivered`, `-translate-x-1/4`, `-translate-y-1/2`, `1`, `:`, `>=`, `animate-pulse`, `animate-spin`, `blur-2xl`, `blur-3xl`, `border`, `divide-slate-100`, `divide-y`