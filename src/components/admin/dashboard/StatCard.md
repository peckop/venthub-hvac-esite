---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\dashboard\StatCard.tsx
skeleton_hash: d621feee8fc4d2b7
entity_hashes:
  func:StatCard: 42faa1e1d38b732c
  overview: cd8b364f9dc61291
  style_tokens: fe92468c4406b452
generated_at: 2026-08-27T08:08:03Z
---

## Genel Bakış

StatCard, yönetim paneli (admin dashboard) arayüzünde kullanılan bir React bileşenidir. Tek bir bileşenden oluşan bu modül, istatistiksel bir değeri kart formatında görüntüler. Yükleme durumu, para birimi formatlaması ve çoklu dil desteği gibi özellikleri destekler.

## Fonksiyon Grupları

### Ana Bileşen

Bu modülde yalnızca tek bir bileşen yer alır. Yönetim panelindeki istatistik kartlarını oluşturmak için kullanılır; başlık, alt başlık ve değer bilgisini kullanıcıya sunar.

- StatCard

**Parametreler ve sorumluluklar:**

- `title`: Kartın başlık metnini belirtir.
- `subtitle`: Kartın alt başlık metnini belirtir.
- `value`: Kartta gösterilecek istatistiksel değeri taşır.
- `loading`: Veri yüklenme durumunu kontrol eder; yükleme sırasında farklı bir görünüm sağlanır.
- `isCurrency`: Değerin para birimi olarak biçimlendirilip biçimlendirilmeyeceğini belirler.
- `lan`: Çoklu dil desteği için dil parametresini alır.

**Dış bağımlılıklar:** Modül, React kütüphanesine bağlıdır. Bileşen `React.FC<StatCardProps>` tipiyle tanımlanmıştır; bu da `StatCardProps` arabirimini gerektirir. Para birimi biçimlendirme ve dil desteği gibi işlemlerin hangi yardımcı modüllerden sağlandığı bu kaynak dosyadan anlaşılamamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanamamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmemiştir. Aksiyomlar yalnızca fonksiyon gövdesinden üretilir; gövde olmadan `title`, `subtitle`, `value`, `loading`, `isCurrency` veya `lan` props'larından herhangi biri sağlanmadığında bileşenin nasıl davrandığı belirlenemez.

---

## FONKSİYON DETAYLARI

### StatCard
**Ne yapar**: Admin paneli dashboard alanında kullanılan istatistik kartı bileşenini oluşturan fonksiyondur. Verilen başlık, alt başlık ve değer bilgilerini görsel bir kart yapısı içinde sunar. Para birimi formatlaması ve yükleme durumu gibi durumları destekler.

**Nasıl yapar**: Gelen parametreleri kullanarak bir React fonksiyonel bileşeni (`React.FC<StatCardProps>`) döndürür. `loading` parametresiyle yükleme durumunu, `isCurrency` parametresiyle değerin para birimi olarak formatlanıp formatlanmayacağını kontrol eder. `lan` parametresi aracılığıyla dil/yerelleştirme desteği sağlar. Bileşen, `StatCardProps` tip arayüzüne uygun şekilde yapılandırılmıştır.

**Parametreler**:
- title: belirtilmemiş — Kartın ana başlığını temsil eder
- subtitle: belirtilmemiş — Kartın alt başlığını veya açıklayıcı bilgisini temsil eder
- value: belirtilmemiş — Kartta gösterilecek istatistiksel değeri temsil eder
- loading: belirtilmemiş — Veri yüklenme durumunu belirten bayrak; yükleme sırasında farklı bir görsel durum gösterilmesini sağlar
- isCurrency: belirtilmemiş — Değerin para birimi olarak formatlanıp formatlanmayacağını belirten bayrak
- lan: belirtilmemiş — Dil/yerelleştirme tercihini belirten parametre

**Dönüş**: `React.FC<StatCardProps>` — `StatCardProps` tip arayüzünü kabul eden bir React fonksiyonel bileşeni döndürür. Bileşen, admin dashboard üzerinde istatistik kartı olarak render edilmek üzere kullanılır.

---

## İTHALATLAR (IMPORTS)
- import: ../../../i18n/currency::SYSTEM_CURRENCY
- import: ../../../i18n/format::formatCurrency
- import: next/link::Link
- import: react::React

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

### [N1_NASIL] AST Pointer: src/components/admin/dashboard/StatCard.tsx::StatCard
- **params**:
  - `title` — kart başlığı, JSX'te truncate edilerek gösterilir
  - `subtitle` — kart alt başlığı, loading değilse ve truthy ise gösterilir
  - `value` — gösterilecek değer; null ise "-", loading ise "…", isCurrency true ve number ise formatCurrency ile para birimi formatında gösterilir
  - `loading` — yükleme durumu; true ise value yerine "…" gösterilir, trend ve subtitle gizlenir
  - `isCurrency` — value'nun para birimi olarak formatlanıp formatlanmayacağını belirten boolean
  - `lang` — dil kodu, varsayılan `'tr'`; formatCurrency fonksiyonuna `'tr' | 'en' tipinde iletilir
  - `href` — opsiyonel bağlantı URL'i; truthy ise kart Link bileşeni olarak render edilir, yoksa div olarak render edilir
  - `icon` — opsiyonel React ikon elementi; React.cloneElement ile size: 24 ve strokeWidth: 2.5 prop'ları eklenerek yeniden oluşturulur
  - `trend` — opsiyonel trend verisi; `.value` özelliği pozitifse yukarı ok ve yeşil, negatifse aşağı ok ve kırmızı renkli yüzde etiketi gösterilir
  - `accent` — renk teması anahtarı, varsayılan `'navy'`; `accents` haritasından CSS class grubu seçilir
- **ic_degiskenler**:
  - `accents` — her accent anahtarı (`navy`, `emerald`, `amber`, `rose`, `violet`, `sky`, `orange`) için `border`, `accent`, `iconBg`, `glow`, `text` CSS class'larını içeren nesne
  - `currentAccent` — `accents[accent]` erişimiyle seçilen tema nesnesi; border, accent, iconBg, glow, text class'larına erişim sağlar
  - `displayValue` — koşullu hesaplanan gösterim değeri: loading true ise `'…'`, value null ise `'-'`, isCurrency true ve typeof value `'number'` ise `formatCurrency(value, lang as 'tr' | 'en', { currency: SYSTEM_CURRENCY })` sonucu, aksi halde `value`'nun kendisi
  - `content` — kartın ana içeriğini oluştaran JSX elementi; title, displayValue, trend etiketi, subtitle ve icon'u içerir
  - `baseClass` — kartın kök elemanına uygulanan temel CSS class string'i; `bg-admin-surface`, padding, overflow, transition, shadow, border ve hover:border class'larını birleştirir
- **Dönüş**: `React.ReactNode` — `href` truthy ise `Link` bileşeni (className ile hover:-translate-y-2 animasyonu, dekoratif gradient ve accent çizgisi ile birlikte), aksi halde `div` elementi (dekoratif gradient ile birlikte); her iki durumda da `content` JSX'i dahil edilir

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
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-danger-weak`, `bg-admin-success-weak`, `bg-gradient-to-br`, `border-admin-border`, `from-white/5`, `group-hover:text-admin-fg-muted`, `lg:text-4xl`, `text-3xl`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-success`, `text-xs`, `to-transparent`
- **Layout:** `-right-12`, `-top-12`, `absolute`, `block`, `bottom-0`, `flex`, `flex-1`, `flex-wrap`, `from-white/5`, `gap-0.5`, `gap-2`, `group-hover:shadow-hvac-stat-card-hover`, `h-1`, `h-14`, `h-48`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:`, `lg:` önekleri
- **Yardımcı Sınıflar:** `${baseClass`, `${currentAccent.accent`, `${currentAccent.iconBg`, `${trend.value`, `0`, `:`, `>=`, `border`, `duration-1000`, `duration-500`, `duration-700`, `font-semibold`, `group-hover:rotate-6`, `group-hover:scale-105`, `group-hover:scale-110`