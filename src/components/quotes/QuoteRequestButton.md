---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\components\quotes\QuoteRequestButton.tsx
skeleton_hash: edd67155640f8f9f
entity_hashes:
  func:QuoteRequestButton: 1c02d0db31dc1cc0
  func:handleClick: 34afc9e41eb1379f
  overview: 7d23af31ac316cc6
  style_tokens: 871c1a0c89a4b399
generated_at: 2026-08-17T11:20:13Z
---

## Genel Bakış
Bu modül, teklif talep sürecini başlatmak için kullanılan bir React bileşenidir. Kullanıcıların mevcut ürün listeleri veya proje kaynaklarıyla teklif istemesini sağlayan interaktif bir düğme sunar. Bileşen, prop'lar aracılığıyla esnek bir şekilde yapılandırılabilir ve tıklama olayını yöneterek teklif akışını tetikler.

## Fonksiyon Grupları

### Bileşen Tanımı
Bu grup, bileşenin dış yapısını ve prop arayüzünü tanımlar. Kaynak tipi, öğe listesi, proje referansı, miktar düzenlenebilirliği ve stil gibi parametrelerle nasıl görüntüleneceğini belirler.
- QuoteRequestButton

### Etkileşim Yönetimi
Bu grup, kullanıcı etkileşimlerini ve tıklama olayı sonraki iş akışını yönetir. Düğmeye basıldığında tetiklenen mantığı ve olası yan etkileri kontrol eder.
- handleClick

## Aksiyomlar

Bu modül için geçerli olan temel mimari varsayımlar:

- **Aksiyom 1:** `source` parametresi her zaman geçerli ve desteklenen bir kaynak tipi olmalıdır; aksi halde teklif isteği düzgün çalışmayabilir.

- **Aksiyom 2:** `items` listesi en az bir geçerli ürün içermelidir; boş liste ile teklif oluşturulamaz.

- **Aksiyom 3:** `qtyEditable` false olduğunda miktar düzenleme arayüzü devre dışı kalır ve mevcut değerlerle istek gönderilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, teklif talep düğmesini temsil eden bir React bileşenidir. Aşağıdaki varsayımlar, fonksiyon imzalarından türetilmiştir.

[Aksiyom 1]: Eğer `source` prop'u geçilmemiş veya geçersiz bir değer ise, bileşen teklif talebinin hangi kaynaktan geldiğini belirleyemez ve.handleClick() işlevi doğru kaynak bilgisiyle tetiklenemez.

[Aksiyom 2]: Eğer `items` prop'u boş veya tanımsız (`undefined`/`null`) ise, teklif talebine dahil edilecek öğe bulunmaz ve.handleClick() işlevi öğe içermeyen bir teklif talebi başlatır.

[Aksiyom 3]: Eğer `sourceProjectId` geçerli bir proje tanımlayıcısı içermiyorsa, handleClick() işlevi teklif talebini ilişkilendirilecek bir projeye bağlayamaz.

[Aksiyom 4]: `handleClick()` parametresiz tanımlanmıştır; bu nedenle bileşen prop'ları (`source`, `items`, `sourceProjectId`) kapama (closure) yoluyla erişilebilir olmalıdır. Props'lar bileşen kapsamı dışında tanımlanmışsa, handleClick() bu değerlere ulaşamaz.

[Aksiyom 5]: `qtyEditable` ve `className` opsiyonel prop'lar olarak yapılandırılmıştır; bunlar geçilmediğinde bileşen varsayılan davranışla (miktar düzenlenebilirliği kapalı, ek sınıf yok) render edilmelidir.

---

## FONKSİYON DETAYLARI

### QuoteRequestButton
**Ne yapar**: Teklif talebi oluşturmak için kullanılan bir React bileşenidir. Kullanıcıların seçili ürün veya hizmetler için tedarikçilere teklif isteği göndermesini sağlayan bir buton render eder.

**Nasıl yapar**: Bileşen, verilen props'ları alarak bir QuoteRequestButtonProps arayüzüne uygun şekilde çalışır. source parametresi ile talebin kaynağı, items ile teklife dahil edilecek ürünler, sourceProjectId ile proje bağlantısı, qtyEditable ile miktar düzenleme izni ve className ile özelleştirilebilir stil parametrelerini işler. Bileşen React.FC generic tipi ile tipli bir fonksiyonel bileşen olarak tanımlanmıştır.

**Parametreler**:
- source: string — Teklif talebinin geldiği kaynağı belirtir (örn: quote listing, project detail vb.)
- items: QuoteItem[] — Teklif isteğine dahil edilecek ürünlerin veya hizmetlerin listesi
- sourceProjectId: string | undefined — Talebin geldiği projenin kimliği; proje detay sayfasından gelindiyetesse dolu, değilse undefined olabilir
- qtyEditable: boolean — Kullanıcının miktar değerlerini düzenleyip düzenleyemeyeceğini belirler
- className: string — Buton üzerine uygulanacak özel CSS sınıfı; bileşenin görsel özelleştirmesini sağlar

**Dönüş**: React.FC<QuoteRequestButtonProps> — Standart bir React fonksiyonel bileşeni döner; QuoteRequestButtonProps arayüzüne uygun props'ları kabul eden ve JSX elementi döndüren bir React bileşeni

### handleClick
**Ne yapar**: Bu, genellikle `QuoteRequestButton` bileşeni içinde tanımlanan bir olay işleyici fonksiyonudur. Butona tıklandığında çağrılır ve teklif talep sürecini başlatan asıl iş mantığını (API çağrısı, form gösterimi, navigasyon vb.) tetikler.

**Nasıl yapar**: Fonksiyon, `QuoteRequestButton`'ın prop'larına (özellikle `source`, `items`, `sourceProjectId` gibi) erişerek bu bilgileri kullanır. Ardından, teklif talep işlemini başlatmak için gerekli olan yan etkileri (örn: bir state güncelleme, bir servise POST isteği gönderme veya bir modal açma) yürütür. `qtyEditable` prop'u gibi ayarlamalar, bu sürecin nasıl işleyeceğini etkileyebilir.

**Parametreler**: Fonksiyonun kendisi parametre almaz. Gerekli tüm veriler (`source`, `items`, vb.) kapsama alanı (closure) yoluyla bileşenin prop'larından erişilebilir.

**Dönüş**: `void` — Fonksiyon doğrudan bir değer döndürmez. Etkisi, bileşenin durumunu (state) değiştirmek veya bir yan etki gerçekleştirmek üzerinedir.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/services/quoteService::type { QuoteSource }
- import: ./QuoteRequestModal::QuoteRequestModal
- import: ./QuoteRequestModal::type QuoteRequestModalItem
- import: lucide-react::FileText
- import: next/navigation::usePathname
- import: next/navigation::useRouter
- import: react::React
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### QuoteRequestButtonProps
"Teklif İste" CTA'sı — login kapısı + modal tetikleyicisi (cetvel Q4). Oturum yoksa login'e yönlendirir; dönüş yolu `?redirect=` ile korunur (LoginPage ?redirect= ve ?from= ikisini de okur — AUTH T056 sözleşmesi).
- `source: QuoteSource`
- `items: QuoteRequestModalItem[]`
- `sourceProjectId?: string | null`
- `qtyEditable?: boolean`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: components/quotes/QuoteRequestButton.tsx::QuoteRequestButton
- **params**: `source`, `items`, `sourceProjectId`, `qtyEditable`, `className`
- **ic_degiskenler**:
  - `t` — useI18n hookundan gelen çeviri fonksiyonu, buton metni ve toast mesajları için kullanılır
  - `user` — useAuth hookundan gelen mevcut oturum açmış kullanıcı nesnesi, giriş kontrolü yapılır
  - `Routes` — useLocalizedRoutes hookundan gelen yerelleştirilmiş rota yardımcı nesnesi, `Routes.auth.login(...)` ile login rotası oluşturulur
  - `router` — Next.js useRouter hookundan gelen yönlendirme nesnesi, `router.push(...)` ile navigasyon yapılır
  - `pathname` — usePathname hookundan gelen mevcut URL yolu, login sonrası yönlendirme için login rotasına parametre olarak geçilir
  - `open` — boolean state, QuoteRequestModal'ın açık/kapalı durumunu kontrol eder (useState)
  - `setOpen` — open state'inin setter fonksiyonu, modal açma/kapama tetiklenir
  - `handleClick` — buton tıklama işleyici iç fonksiyon, kullanıcının giriş durumuna göre toast gösterir veya modal açar
- **Dönüş**: JSX — `<button>` (FileText ikonlu, tıklanabilir, `items.length === 0` ise devre dışı) ve `<QuoteRequestModal>` (açılır-modal, open/onClose/source/sourceProjectId/items/qtyEditable propsları ile)

---

### [N2_NASIL] AST Pointer: components/quotes/QuoteRequestButton.tsx::handleClick
- **params**: (yok)
- **ic_degiskenler**: (yok — closure üzerinden üst kapsam değişkenlerine erişir: `user`, `t`, `router`, `Routes`, `pathname`, `setOpen`)
- **Dönüş**: yok (yan etkiler: `!user` durumunda `toast.error(t('quotes.request.loginRequired'))` ile hata bildirimi gösterir, `router.push(Routes.auth.login(pathname ?? undefined))` ile login sayfasına yönlendirir; `user` varsa `setOpen(true)` ile modalı açar)

---

## NODE ID STANDARD

  file: src\components\quotes\QuoteRequestButton.tsx
  function: src\components\quotes\QuoteRequestButton.tsx::QuoteRequestButton
  function: src\components\quotes\QuoteRequestButton.tsx::handleClick

---

## DISA AKTARILANLAR (EXPORTS)
  export: QuoteRequestButton

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `hover:bg-secondary-blue`, `text-white`
- **Layout:** `gap-2`, `inline-flex`, `items-center`, `justify-center`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `disabled:cursor-not-allowed`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/50`, `font-semibold`, `px-6`, `py-3`, `rounded-lg`, `transition-colors`