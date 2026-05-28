---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\StatCard.tsx
skeleton_hash: 5d4b7f17de661145
entity_hashes:
  func:StatCard: 42faa1e1d38b732c
  overview: d5fe2f564e9e4393
  style_tokens: 3b396ad8fb25d2f9
generated_at: 2026-05-28T22:35:31Z
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
  - `title` — kart başlığı (string)
  - `subtitle` — isteğe bağlı alt başlık (string)
  - `value` — gösterilecek ana değer (number, string, null olabilir)
  - `loading` — yüklenme durumu (boolean)
  - `isCurrency` — değerin para birimi formatında gösterilip gösterilmeyeceği (boolean)
  - `lang` — dil kodu, varsayılan `'tr'` (string, `'tr'` veya `'en'`)
  - `href` — isteğe bağlı link hedefi (string veya Route)
  - `icon` — isteğe bağlı ikon React elementi (ReactElement)
  - `trend` — isteğe bağlı trend objesi, `{ value: number }` yapısında
  - `accent` — vurgu rengi, varsayılan `'navy'` (string)
- **ic_degiskenler**:
  - `accents` — yedi farklı renk teması için CSS sınıflarını içeren sabit obje (navy, emerald, amber, rose, violet, sky, orange); her tema `border`, `accent`, `iconBg`, `glow`, `text` alanlarına sahiptir
  - `currentAccent` — `accents[accent]` ile seçilen temanın değeri; kartın görünümünü belirleyen CSS sınıflarını taşır
  - `displayValue` — `loading` kontrolü: yükleniyorsa `'…'`, `value == null` ise `'-'`, `isCurrency` ve `number` ise `formatCurrency` ile formatlanmış, diğer durumlarda ham `value`; ekranda gösterilen metin
  - `content` — kartın ana içeriğini oluşturan JSX bloğu: başlık, değer, trend, alt başlık ve ikon (varsa) burada yer alır
  - `baseClass` — kartın temel CSS sınıfı; `glass-strong !p-8 ... border ${currentAccent.border} hover:border-white/20` şeklinde oluşturulur
- **Dönüş**: JSX elementi (React.ReactNode) — `href` varsa `Link` bileşeni, yoksa `div` bileşeni döndürülür

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