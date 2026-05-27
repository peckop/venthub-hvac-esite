---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\StepCustomerInfo.tsx
skeleton_hash: 0f6c10a75d5ca248
entity_hashes:
  func:StepCustomerInfo: 2698d0acd17fa1de
  overview: 3962b33f58fa703d
  style_tokens: 61f2a39b43a19a77
generated_at: 2026-05-27T18:31:01Z
---

## Genel Bakış
`StepCustomerInfo` bileşeni, checkout sürecinde müşterinin iletişim ve fatura bilgilerini toplamak için kullanılan bir adım ekranını temsil eder. Props olarak aldığı `customerInfo`, `setCustomerInfo` ve çeviri fonksiyonu `t` aracılığıyla mevcut bilgileri gösterir, kullanıcı girdilerini günceller ve çok‑dilli bir arayüz sağlar.

## Fonksiyon Grupları
### UI Render ve Veri Bağlantısı
Bu grup, bileşenin JSX yapısını oluşturur, form alanlarını `customerInfo` verisiyle doldurur ve kullanıcı etkileşimlerini `setCustomerInfo` aracılığıyla günceller.  
- StepCustomerInfo   (tek bileşen)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `customerInfo` nesnesi sağlanmazsa, bileşen gerekli müşteri verilerine erişemez ve render sırasında **boş** veya **hata** durumu oluşur.  

**Aksiyom 2**: Eğer `setCustomerInfo` bir fonksiyon değilse, kullanıcı tarafından girilen veya değiştirilen müşteri bilgileri **state**’e kaydedilemez ve UI’da veri tutarlılığı bozulur.  

**Aksiyom 3**: Eğer `t` (çeviri/yerelleştirme fonksiyonu) tanımlı değilse, metinler **ham** (çevirisiz) olarak gösterilir; uygulama çökmez ancak kullanıcı deneyimi **düşer**.  

**Aksiyom 4**: Eğer `customerInfo` içinde beklenen alanlar (ör. `name`, `email`, `phone`) eksik ya da `null` ise, ilgili form alanları **boş** başlar ve doğrulama hataları **tetiklenir**.  

**Aksiyom 5**: Eğer `setCustomerInfo` asenkron bir işlem (Promise) döndürürken beklenmeyen bir hata fırlatırsa, bileşen **hata yakalama** mekanizması yoksa UI’da **uncaught exception** meydana gelir.  

**Domain‑specific kural**: `customerInfo` nesnesinin yapısı, uygulamanın diğer katmanları (ör. API payloadları) ile uyumlu olmalıdır; uyumsuzluk durumunda **veri senkronizasyon hatası** ortaya çıkar. (Detaylı şema kod içinde tanımlı değildir, bu yüzden kesin değerler *bilinmiyor*.)

---

## FONKSİYON DETAYLARI

### StepCustomerInfo
**Ne yapar**: React bileşenini tanımlar; müşterinin bilgi girişini yönetir ve görüntüler.  
**Nasıl yapar**: `customerInfo` ve `setCustomerInfo` prop'larını alarak, form alanlarıyla iki yönlü veri bağlaması kurar; `t` fonksiyonunu çeviri (i18n) için kullanır. Bileşen, `React.FC<StepCustomerInfoProps>` tipinde döner.  

**Parametreler**:
- `customerInfo`: object — Mevcut müşteri bilgilerini içeren veri nesnesi.
- `setCustomerInfo`: function — Müşteri bilgilerini güncellemek için kullanılan state setter fonksiyonu.
- `t`: function — Çeviri anahtarlarını yerelleştirilmiş metinlere dönüştüren i18n yardımcı fonksiyonu.

**Dönüş**: `React.FC<StepCustomerInfoProps>` — Tanımlanan props tipine uygun bir React fonksiyonel bileşeni.

---

## INTERFACES

### StepCustomerInfoProps
- `customerInfo: CheckoutCustomerInfo`
- `setCustomerInfo: (info: CheckoutCustomerInfo) => void`
- `t: (key: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\checkout\StepCustomerInfo.tsx::StepCustomerInfo
- **params**: customerInfo, setCustomerInfo, t
- **ic_degiskenler**:
  - `customerInfo.name` — müşteri adı input değeri; `value={customerInfo.name}` ile inputa bağlanır, `onChange` ile `setCustomerInfo({...customerInfo, name: e.target.value})` çağrılarak güncellenir.
  - `customerInfo.email` — e-posta input değeri; `value={customerInfo.email}` ile inputa bağlanır, `onChange` ile `setCustomerInfo({...customerInfo, email: e.target.value})` ile güncellenir.
  - `customerInfo.phone` — telefon input değeri; `value={customerInfo.phone}` ile inputa bağlanır, `onChange` ile `setCustomerInfo({...customerInfo, phone: e.target.value})` ile güncellenir.
  - `customerInfo.identityNumber` — kimlik no input değeri; `value={customerInfo.identityNumber}` ile inputa bağlanır, `onChange` ile `setCustomerInfo({...customerInfo, identityNumber: e.target.value})` ile güncellenir; `maxLength={11}` kısıtı vardır.
  - `setCustomerInfo` — `CheckoutCustomerInfo` state'ini güncellemek için kullanılan fonksiyon; her input `onChange`'inde yayılım (`...customerInfo`) ile yeni değer atanır.
  - `t` — çeviri/yerelleştirme fonksiyonu; `t('checkout.personal.title')`, `t('checkout.personal.nameLabel')`, `t('checkout.personal.emailLabel')`, `t('checkout.personal.phoneLabel')`, `t('checkout.personal.idLabel')`, `t('checkout.personal.namePlaceholder')`, `t('checkout.personal.emailPlaceholder')`, `t('checkout.personal.phonePlaceholder')`, `t('checkout.personal.idPlaceholder')` şeklinde etiket ve placeholder metinlerini sağlar.
- **Dönüş**: JSX elementi — dört input alanı (isim, email, telefon, kimlik no) içeren bir form bölümü render edilir.

---

## NODE ID STANDARD

  file: src\views\checkout\StepCustomerInfo.tsx
  function: src\views\checkout\StepCustomerInfo.tsx::StepCustomerInfo

---

## DISA AKTARILANLAR (EXPORTS)
  export: StepCustomerInfo

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-50`, `border-slate-200`, `focus-visible:border-primary-navy`, `placeholder:text-slate-400`, `text-industrial-gray`, `text-sm`, `text-white`, `text-xl`
- **Layout:** `block`, `flex`, `gap-4`, `grid`, `grid-cols-1`, `h-10`, `items-center`, `md:grid-cols-2`, `p-2`, `w-full`
- **Varyant/Responsive:** `focus-visible:`, `md:`, `placeholder:` önekleri
- **Yardımcı Sınıflar:** `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/20`, `font-medium`, `font-semibold`, `mb-2`, `mb-6`, `px-4`, `rounded-lg`, `space-x-3`, `space-y-6`, `transition-colors`