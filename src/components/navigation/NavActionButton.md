---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavActionButton.tsx
skeleton_hash: c67cb47a2d2bd1e8
entity_hashes:
  func:NavActionButton: 9e352ab0f1dc93af
  overview: 42d52b47442e736b
  style_tokens: 7a26081e3b2c4d09
generated_at: 2026-06-08T10:08:49Z
---

## Genel Bakış
`NavActionButton` bileşeni, uygulama içinde gezinme ve eylem tetikleme amaçlı kullanılan, ikon, etiket ve isteğe bağlı bağlantı ya da tıklama işleyicisi alabilen yeniden kullanılabilir bir UI elemanıdır. Prop’ların varlığına göre bir `<a>` ya da `<button>` elementini render ederek erişilebilirlik ve stil bütünlüğünü sağlar.

## Fonksiyon Grupları
### Navigasyon Düğmesi Bileşeni
Bu grup, kullanıcı etkileşimini yöneten ve görsel‑işlevsel tutarlılığı sağlayan tek bir UI bileşenini içerir.  
- NavActionButton   (diğer fonksiyonları çağırmaz; kendi içinde prop’ları işleyerek render yapar)

---

## AXIOMS – Mimari Varsayımlar
Bu navigasyon eylem butonu bileşeninin doğru şekilde render edilmesi, kullanıcı etkileşimlerini alması ve erişilebilirlik standartlarını karşılaması için gerekli tüm prop'ların iletilmesi ve modülün yerleşik toneClasses stil sabitinin projeye başarılı şekilde dahil edilmesi zorunludur.

[Aksiyom 1]: Eğer icon prop'u sağlanmazsa, buton içinde görsel simge render edilemez, kullanıcı deneyiminde görsel eksikliği oluşur.
[Aksiyom 2]: Eğer label prop'u sağlanmazsa, butonun amacı metinsel olarak ifade edilemez, erişilebilirlik ve kullanıcı anlayışı zarar görür.
[Aksiyom 3]: Eğer hem href prop'u hem de onClick prop'u aynı anda sağlanmazsa, buton herhangi bir navigasyon işlemi veya özel eylem tetikleyemez, etkileşimsiz kalır.
[Aksiyom 4]: Eğer ariaLabel prop'u sağlanmazsa, ekran okuyucu gibi erişilebilirlik araçları butonun amacını düzgün şekilde kullanıcıya iletemez, erişilebilirlik gereksinimleri karşılanamaz.
[Aksiyom 5]: Eğer modülün yerleşik toneClasses stil sabiti projeye dahil edilmez veya geçersiz tanımlanırsa, butona ait görsel stil kuralları uygulanamaz, uygulama genelindeki görsel tutarlılık bozulur.
[Aksiyom 6]: Eğer title prop'u sağlanmazsa, kullanıcı fare ile butonun üzerine geldiğinde gösterilecek ek açıklama ipucu metini render edilemez, ek bilgilendirme ihtiyacı karşılanamaz.

---

## FONKSİYON DETAYLARI

### NavActionButton
**Ne yapar**: VentHub HVAC projesinin navigasyon katmanında kullanılan, kullanıcıların kolayca etkileşime girebileceği aksiyon odaklı buton bileşenidir. Hem sayfa içi rotalama yapmak hem de özel aksiyonları tetiklemek için çok yönlü olarak tasarlanmıştır, ikon ve metin etiketi desteği ile kullanıcı deneyimini zenginleştirir. Tüm modern web standartlarına ve erişilebilirlik kurallarına uygun olarak geliştirilmiştir.
**Nasıl yapar**: Gelen tüm giriş parametrelerini erişilebilirlik prensipleri gözeterek işler, eğer href parametresi tanımlıysa bir yönlendirme bağlantısı olarak, tanımsız ise etkileşimli bir buton olarak kullanıcı arayüzüne render edilir. onClick parametresi aracılığıyla özel işlevleri tetiklerken, ariaLabel ve title gibi ek etiketlerle hem ekran okuyucu kullanan kullanıcılar hem de fare ile etkileşim kuran kullanıcılar için ek bilgilendirme sunar.
**Parametreler**:
- icon: React.ReactNode — Buton üzerinde kullanıcının göreceği görsel ikon öğesi, butonun amacını hızlıca anlamayı destekler
- label: string — Buton üzerinde görüntülenecek metin etiketi, butonun işlevini açıkça kullanıcıya iletir
- href: string | undefined — Butona tıklandığında yönlendirilecek rota veya harici bağlantı adresi, sadece rotalama amaçlı kullanıldığında tanımlanır
- onClick: () => void | undefined — Butona tıklandığında tetiklenecek özel aksiyon fonksiyonu, manuel işlemler veya özel iş akışları için kullanılır
- ariaLabel: string | undefined — Ekran okuyucular tarafından okunacak erişilebilirlik etiketi, butonun amacını ek metinle açıklar, erişilebilirliği artırır
- title: string | undefined — Buton üzerine fare imleci ile gelindiğinde açılan küçük ipucu metni, kullanıcıya ek bilgi sunar
**Dönüş**: React.FC<NavActionButtonProps> — Projenin navigasyon menülerinde veya navigasyon ile ilgili alanlarda kullanılmaya hazır, tüm özellikleri yapılandırılmış React fonksiyonel bileşeni döndürür

---

## INTERFACES

### NavActionButtonProps
- `icon: React.ReactNode`
- `label?: React.ReactNode`
- `href?: string`
- `onClick?: () => void`
- `ariaLabel: string`
- `title?: string`
- `badge?: React.ReactNode`
- `tone?: NavActionTone`
- `className?: string`
- `iconClassName?: string`
- `labelClassName?: string`

---

## TYPE ALIASES

### NavActionTone
```typescript
type NavActionTone = 'default' | 'accent' | 'success' | 'warning'
```

---

## SABİTLER
- **toneClasses** (object) — `{
    default: 'text-steel-gray hover:text-primary-navy hover:bg-air-blue/30...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: NavActionButton.tsx::NavActionButton
- **params**: `{ icon, label, href, onClick, ariaLabel, title, badge, tone = 'default', className, iconClassName, labelClassName }`
- **ic_degiskenler**:
  - `content` — JSX fragment wrapping the icon, optional badge, and conditional label text, used as the child content for both navigation link and button elements
  - `classes` — Concatenated CSS class strings generated via the imported `cn` utility, including base component styling, tone-specific styles from `toneClasses[tone]`, and custom class props passed to the component
- **Dönüş**: Returns a Next.js `<Link>` component when `href` prop is provided, otherwise returns a native HTML `<button type="button">` element; both are valid React JSX elements

---

## NODE ID STANDARD

  file: src\components\navigation\NavActionButton.tsx
  function: src\components\navigation\NavActionButton.tsx::NavActionButton

---

## DISA AKTARILANLAR (EXPORTS)
  export: NavActionButton

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `border-transparent`, `text-sm`
- **Layout:** `gap-2`, `inline-flex`, `items-center`, `min-w-0`, `relative`
- **Varyant/Responsive:** `focus-visible:`, `group-hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `duration-300`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy/20`, `font-semibold`, `group`, `group-hover:scale-105`, `px-3`, `py-2.5`, `rounded-2xl`, `shrink-0`, `transition-colors`, `transition-transform`