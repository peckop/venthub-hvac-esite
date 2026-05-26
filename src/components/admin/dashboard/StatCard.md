---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\StatCard.tsx
skeleton_hash: 5d4b7f17de661145
generated_at: 2026-05-23T21:52:04Z
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

---

# FONKSİYON DETAYLARI

## Fonksiyon Grubu 1

### StatCard
**Ne yapar**: İstatistik panelinde kullanılan, tek bir metriği (başlık, değer, alt başlık) görselleştiren bir React kart bileşenidir. Yüklenme durumunda kullanıcıya geri bildirim verir ve değerleri isteğe bağlı olarak para birimi formatında gösterebilir.

**Nasıl yapar**: Aldığı `StatCardProps` arayüzüne uygun parametreleri destruct ederek işler. `loading` parametresi true ise yer tutucu (skeleton/spinner) gösterir, değilse gerçek veriyi render eder. `isCurrency` parametresi aktifse `value`’yu yerel para birimi formatına çevirip görüntüler. `lan` parametresi ile dil desteği sağlar.

**Parametreler**:
- `title`: string – Kartın üst bölümünde gösterilecek ana başlık.
- `subtitle`: string – Başlığın hemen altında yer alan açıklama metni.
- `value`: number – Görüntülenecek istatistik değeri.
- `loading`: boolean – Veri henüz hazır değilse true girilir; bileşen yüklenme durumuna geçer.
- `isCurrency`: boolean – true ise değer para birimi olarak biçimlendirilir.
- `lan`: string – Kullanıcı arayüz dil kodunu (ör. "tr", "en") belirten parametre.

**Dönüş**: `React.FC<StatCardProps>` – İçinde başlık, alt başlık ve formatlanmış değer barındıran bir React stateless fonksiyonel bileşen döndürür. Loading durumunda ise boş veya animasyonlu bir placeholder döndürür.

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
- **shadow:** `shadow-[0_0_15px_rgba(34,211,238,0.5)]`
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]`, `tracking-[0.2em]`, `tracking-[0.3em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-emerald-400/10`, `bg-gradient-to-br`, `bg-rose-400/10`, `border-white/5`, `from-white/5`, `lg:text-4xl`, `text-3xl`, `text-emerald-400`, `text-rose-400`, `text-slate-500`, `text-white`, `text-xs`, `to-transparent`
- **Layout:** `-right-12`, `-top-12`, `absolute`, `block`, `bottom-0`, `flex`, `flex-1`, `flex-wrap`, `from-white/5`, `gap-0.5`, `gap-2`, `group-hover:rotate-6`, `group-hover:scale-105`, `group-hover:scale-110`, `group-hover:scale-150`
- **Responsive:** `lg:` prefix kullanımları
