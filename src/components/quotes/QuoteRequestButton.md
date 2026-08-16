---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\components\quotes\QuoteRequestButton.tsx
skeleton_hash: 6a3a343a4fda86cd
entity_hashes:
  func:QuoteRequestButton: 1ff15b944f02603f
  func:handleClick: 34afc9e41eb1379f
  overview: 8fb359ab9bae631a
  style_tokens: 871c1a0c89a4b399
generated_at: 2026-08-16T10:20:06Z
---

## Genel Bakış
Bu modül, bir teklif talep sürecini başlatmak için kullanılan bir React bileşenidir. Kullanıcıların mevcut öğeler veya proje kaynakları ile teklif istemesine olanak tanıyan bir arayüz düğmesi sağlar. Bileşen, tıklama olayını yöneterek ilgili işlemi tetikler.

## Fonksiyon Grupları
### Bileşen Tanımı ve Bağımlılıkları
Bu grup, bileşenin temel yapısını, prop'larını ve dış bağımlılıklarını tanımlar. Bileşen, kaynak tipi, öğeler, proje ID'si, miktar düzenlenebilirliği ve stil sınıfı gibi prop'ları alarak nasıl render edileceğini belirler.
- QuoteRequestButton

### Etkileşim Mantığı
Bu grup, kullanıcı etkileşimlerini ve bileşenin iç iş akışını yönetir. Düğmeye tıklandığında tetiklenen asıl mantığı barındırır.
- handleClick

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel aksiyomlar aşağıdadır:

[Aksiyom 1]: Eğer `source` parametresi geçilmezse veya geçersiz bir değer alırsa, handleClick fonksiyonu teklif isteği gönderemez veya beklenmeyen davranış gösterir.
**Sonuç:** `source` parametresi her zaman geçerli ve desteklenen bir kaynak tipi olmalıdır.

[Aksiyom 2]: Eğer `items` listesi boş (`[]`) ise veya geçersiz elemanlar içeriyorsa, handleClick fonksiyonu teklif isteği oluşturamaz veya kısmi/geçersiz verilerle istek oluşur.
**Sonuç:** `items` listesi en az bir geçerli ürün içermelidir.

[Aksiyom 3]: Eğer `qtyEditable` false ise, kullanıcının teklif içindeki miktarları düzenlemesine izin verilmez; sadece mevcut `items` miktarlarıyla istek gönderilir.
**Sonuç:** qtyEditable=false iken miktar düzenleme arayüzü devre dışıdır.

[Aksiyom 4]: Eğer `sourceProjectId` geçilirse (undefined değilse), teklif isteği ilgili projeye bağlı olarak oluşturulmalıdır; aksi halde projesiz/genel teklif isteği olarak davranır.
**Sonuç:** sourceProjectId opsiyoneldir, ancak geçildiğinde geçerli bir proje ID'si olmalıdır.

[Aksiyom 5]: Eğer `className` geçilmezse, modül varsayılan stil ile render edilir; geçilirse ek stillendirme uygulanır.
**Sonuç:** className opsiyoneldir, geçilmezse default görünüm kullanılır.

[Aksiyom 6]: handleClick fonksiyonu çağrıldığında, `items` listesindeki her elemanın geçerli ve tutarlı veri yapısına sahip olması gerekir; aksi halde istek oluşmaz veya hata oluşur.
**Sonuç:** Her item objesinin gerekli alanları dolu ve doğru tipte olmalıdır.

---

## FONKSİYON DETAYLARI

### QuoteRequestButton
**Ne yapar**: Bu bir React bileşenidir. Verilen prop'lara (kaynak, kalemler, proje ID'si vb.) göre bir "Teklif Talep" butonu veya bileşeni oluşturur. Kullanıcı tıkladığında teklif talep sürecini başlatmak için ilgili mantığı tetikler.

**Nasıl yapar**: Bileşen, React.FC türünde bir fonksiyonel bileşendir ve QuoteRequestButtonProps arabirimi ile tanımlanan girdileri (props) kabul eder. Props'ları alır, bunları iç bileşenlere veya bir onClick olay işleyicisine (handleClick gibi) aktararak butonun görünümünü ve davranışını belirler. Bileşenin kendisi bir JSX yapısı döndürür.

**Parametreler**:
- `source`: `string` — Teklif talebinin kaynak bilgisini belirtir (örn: 'web', 'mobil').
- `items`: `QuoteItem[]` — Teklif talebine dahil edilecek kalemlerin listesi. Her bir item, teklif için gerekli verileri (miktar, birim fiyat vb.) içerir.
- `sourceProjectId`: `string` — Teklif talebinin ilişkili olduğu kaynak projenin benzersiz tanımlayıcısı.
- `qtyEditable`: `boolean` — Kullanıcının kalemlerdeki miktarları düzenleyip düzenleyemeyeceğini kontrol eder. `true` ise miktar alanı düzenlenebilir.
- `className`: `string` — Bileşene uygulanacak ek CSS sınıf(lar)ını belirtir. Görünümü özelleştirmek için kullanılır.

**Dönüş**: `React.FC<QuoteRequestButtonProps>` — Bileşenin kendisi, belirtilen prop'larla çalışacak şekilde yapılandırılmış bir React fonksiyonel bileşeni olarak döner.

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
- import: ../../types/quotes.bridge::type { QuoteSource }
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

### [N1_NASIL] AST Pointer: QuoteRequestButton.tsx::QuoteRequestButton
- **params**: `{ source, items, sourceProjectId, qtyEditable, className }`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, UI metinlerinin lokalize edilmesinde kullanılır
  - `user` — `useAuth()` hook'undan dönen giriş yapmış kullanıcı objesi, kimlik doğrulama kontrolü için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen lokalize rota fonksiyonları nesnesi, `Routes.auth.login(pathname)` çağrılarak login rotası alınır
  - `router` — `useRouter()` hook'undan dönen Next.js router nesnesi, `router.push()` ile programlı navigasyon yapılır
  - `pathname` — `usePathname()` hook'undan dönen mevcut URL path string'i, login sonrası geri dönüş rotası olarak kullanılır
  - `open` — `useState(false)` ile oluşturulmuş modalın açık/kapalı durumunu tutan boolean state'i
  - `setOpen` — `useState` setter'ı, modal durumunu güncellemek için kullanılır (`true`/`false`)
  - `handleClick` — Butona tıklandığında çalışan event handler fonksiyonu, modal açma ve auth kontrolü yapar
- **Dönüş**: JSX — `<button>` ve `<QuoteRequestModal>` JSX fragment'i döner

---

### [N2_NASIL] AST Pointer: QuoteRequestButton.tsx::handleClick
- **params**: yok
- **ic_degiskenler**: yok (closure içinde dış değişkenlere erişir)
- **Closure erişimleri**:
  - `user` — Kullanıcı giriş yapmamışsa (`!user`) login_required toast gösterilir ve login sayfasına yönlendirilir
  - `t` — `t('quotes.request.loginRequired')` ile lokalize edilmiş hata mesajı alınır
  - `toast` — `toast.error()` ile sonner kütüphanesinden hata bildirimi gösterilir
  - `router` — `router.push(Routes.auth.login(pathname ?? undefined))` ile login sayfasına yönlendirme yapılır
  - `Routes` — `Routes.auth.login()` çağrısıyla login rotası alınır
  - `pathname` — Login sonrası geri dönüş için mevcut path gönderilir, `null`/`undefined` ise `undefined` olarak iletilir
  - `setOpen` — Auth kontrolü geçilirse `setOpen(true)` ile modal açılır
- **Dönüş**: yok — Guard clause ile erken return veya state güncellemesi ile sonlanır

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