---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx
skeleton_hash: 74ca884d1dcec1a0
entity_hashes:
  func:AccountOverviewPage: 6b4bb347d1256607
  overview: 55e40bf9d68b1dff
  style_tokens: 98f0536966ac7e31
generated_at: 2026-06-08T10:10:59Z
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
**Ne yapar**: Üye hesap özetini gösteren ana React bileşenidir. Kullanıcının kişisel bilgilerini, adreslerini, sipariş istatistiklerini ve aktif kargo durumunu çekerek interaktif bir kontrol paneli oluşturur.
**Nasıl yapar**: `useEffect` hook'u ile asenkron veri yükleme yapar. `supabase` üzerinden kullanıcının adreslerini ve siparişlerini çeker. Sipariş verileri ile toplam hacim, aktif sipariş sayısı ve teslim edilen sipariş sayısı gibi istatistikleri hesaplar. Aktif siparişin kargo durumunu belirleyerek dinamik bir arayüz ve ilerleme çubuğu sunar. Tüm bu verileri kullanarak selamlaşma kutusu, metrik kartları, kargo takibi widget'ı, son siparişler listesi ve adres/güvenlik kartlarından oluşan bir "bento grid" layout'u render eder.
**Parametreler**: Parametre almaz (React fonksiyonel bileşeni).
**Dönüş**: `JSX.Element` - Üyenin hesap özetini gösteren tam sayfa yapısı.

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

### [N1_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::useEffect_callback
- **params**: () — parametre yok, React useEffect callback
- **ic_degiskenler**:
  - `mounted` — component unmount olduktan sonra state güncellemelerini engelleyen bayrak, cleanup'ta `false` yapılır
- **Dönüş**: cleanup fonksiyonu döner → `() => { mounted = false }`

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