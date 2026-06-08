---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\StatCard.tsx
skeleton_hash: 4636899e30bd1727
entity_hashes:
  func:StatCard: 42faa1e1d38b732c
  overview: d5fe2f564e9e4393
  style_tokens: 3b396ad8fb25d2f9
generated_at: 2026-06-08T10:08:37Z
---

## Genel Bakış
`StatCard` bileşeni, yönetim panelinde tek bir istatistiği görselleştirmek için kullanılan yeniden kullanılabilir bir kart bileşenidir. Başlık, alt başlık, değer, yükleme durumu, para birimi biçimlendirmesi ve çok dilli metin desteği gibi farklı ihtiyaçları tek bir arayüzde toplar.

## Fonksiyon Grupları
### UI Render Grubu
Kartın dış yapısını, tipografisini ve düzenini oluşturur; gelen prop’ların görsel bileşenlerle eşlenmesini sağlar.
- StatCard

### Veri ve Durum İşleme Grubu
Değerlerin para birimi formatında gösterilmesi, yükleme durumuna göre ekranın güncellenmesi ve metinlerin dil ayarına göre çevrilmesi gibi mantıksal işlemleri yürütür.
- StatCard

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### StatCard

**Ne yapar**: Admin panelinin dashboard bölümünde istatistik verilerini görsel olarak sunan bir kart bileşenidir. Başlık, alt başlık, değer ve para birimi formatlama seçenekleriyle birlikte yüklenme durumu animasyonu da destekler.

**Nasıl yapar**: Bileşen, verilen parametreleri kullanarak bir kart yapısı oluşturur. `loading` parametresi `true` olduğunda, değer yerine bir iskelet (skeleton) animasyonu göstererek kullanıcıya verinin yüklendiği hissini verir. `isCurrency` parametresi `true` olarak ayarlandığında, `value` değerini para birimi formatına dönüştürerek hiển thị eder. `lan` parametresi ile dil ayarlarına göre para birimi simgesi ve formatlaması değiştirilebilir.

**Parametreler**:

- `title`: `string` — Kartın üst kısmında görünen ana başlık metni. Örneğin "Toplam Gelir" veya "Aktif Kullanıcılar" gibi istatistik kategorisini belirtir.
- `subtitle`: `string | undefined` — Kartın başlık altında görünen opsiyonel alt başlık bilgisi. Başlığı destekleyen ek açıklama veya detay metnini taşır.
- `value`: `string | number` — Kartın orta bölgesinde büyük puntolarla gösterilen temel istatistik değeri. Sayısal veya metin formatında olabilir.
- `loading`: `boolean` — Bileşenin yükleme durumunu belirler. `true` değeri alırsa gerçek değerler yerine skeleton placeholder animasyonu gösterilir, böylece veri henüz yüklenmemişken kullanıcı arayüzünün bozulması engellenir.
- `isCurrency`: `boolean` — Değerin para birimi olarak formatlanıp formatlanmayacağını belirler. `true` olduğunda `value` parametresi para birimi sembolü ve binlik ayraçlarıyla birlikte gösterilir.
- `lan`: `string` — Para birimi formatlamasında kullanılacak dil ve bölge ayarını belirler. `Intl.NumberFormat` içinde dil kodu olarak kullanılır, örneğin `"tr-TR"` Türkçe format veya `"en-US"` İngilizce format için.

**Dönüş**: `React.FC<StatCardProps>` — JSX elementi döndürür. StatCardProps arayüzüne uygun olarak yapılandırılmış bir React fonksiyonel bileşenidir.

---

## INTERFACES

### StatCardProps
- `title: string`
- `subtitle?: string`
- `value: number | string | null`
- `loading: boolean`
- `isCurrency?: boolean`
- `lang?: string`
- `href?: string`
- `icon?: React.ReactNode`
- `trend?: { value: number; label?: string }`
- `accent?: 'navy' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky' | 'orange'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: components/admin/dashboard/StatCard.tsx::StatCard
- **params**:
  - `title` — Kartın başlık metni, üst kısımda `text-xs` ile gösterilir
  - `subtitle` — Kartın alt başlık/etiket metni, isteğe bağlı olarak `italic` stilinde gösterilir
  - `value` — Kartta gösterilecek asıl değer (sayı veya string olabilir), null ise '-' gösterilir
  - `loading` — Yüklenme durumu flag'i, true ise displayValue '…' olur ve trend/subtitle gizlenir
  - `isCurrency` — value'nin para birimi olarak formatlanıp formatlanmayacağını belirler, true ise `formatCurrency()` çağrılır
  - `lang` — Para birimi formatı dili, varsayılan `'tr'`, `'tr' | 'en'` olarak `formatCurrency`'e传递 edilir
  - `href` — Link yönlendirme URL'si, tanımlı ise kart `<Link>` ile sarılır
  - `icon` — Kartta gösterilecek React icon elemanı, `React.cloneElement` ile `size:24, strokeWidth:2.5` olarak clone edilir
  - `trend` — Trend bilgisi nesnesi, `.value` property'si ile yüzde değişim gösterilir (pozitif yeşil ↑, negatif kırmızı ↓)
  - `accent` — Renk teması adı, varsayılan `'navy'`, `accents` objesindeki key olarak kullanılır
- **ic_degiskenler**:
  - `accents` — 7 farklı renk temasının (navy, emerald, amber, rose, violet, sky, orange) CSS class'larını tutan sabit obje; her tema için border, accent, iconBg, glow, text değerleri tanımlıdır
  - `currentAccent` — `accents[accent]` ile elde edilen aktif renk teması objesi, kartın border rengi, icon arkaplanı, accent rengi gibi stiller için kullanılır
  - `displayValue` — Kartta gösterilecek formatlanmış değer; loading=true ise `'…'`, value==null ise `'-'`, isCurrency ve number ise `formatCurrency(value, lang)` çağrısı ile para birimi formatına çevrilir, aksi halde ham value kullanılır
  - `content` — JSX elemanı; kartın içeriğini (başlık, displayValue, trend yüzdesi, subtitle, icon) barındıran ana yapı, hem Link içine hem de plain div içine yerleştirilir
  - `baseClass` — Kartın temel CSS class string'i; `glass-strong`, padding, border, shadow ve hover geçiş stillerini içerir, `currentAccent.border` ile dinamik border rengi eklenir
- **Dönüş**: JSX elemanı (`React.ReactNode`) — `href` tanımlı ise `<Link>` ile sarılmış kart, değilse `<div>` içine sarılmış kart döndürür; her iki durumda da `content` JSX'i render edilir

---

## NODE ID STANDARD

  file: src\components\admin\dashboard\StatCard.tsx
  function: src\components\admin\dashboard\StatCard.tsx::StatCard

---

## DISA AKTARILANLAR (EXPORTS)
  export: StatCard

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `shadow-glow-md`, `tracking-hvac-normal`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-emerald-400/10`, `bg-gradient-to-br`, `bg-rose-400/10`, `border-white/5`, `from-white/5`, `group-hover:text-slate-400`, `lg:text-4xl`, `text-3xl`, `text-emerald-400`, `text-rose-400`, `text-slate-500`, `text-white`, `text-xs`, `to-transparent`
- **Layout:** `-right-12`, `-top-12`, `absolute`, `block`, `bottom-0`, `flex`, `flex-1`, `flex-wrap`, `from-white/5`, `gap-0.5`, `gap-2`, `group-hover:shadow-hvac-stat-card-hover`, `h-1`, `h-14`, `h-48`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:`, `lg:` önekleri
- **Yardımcı Sınıflar:** `${baseClass`, `${currentAccent.accent`, `${currentAccent.iconBg`, `${trend.value`, `0`, `:`, `>=`, `border`, `duration-1000`, `duration-500`, `duration-700`, `font-black`, `group-hover:rotate-6`, `group-hover:scale-105`, `group-hover:scale-110`