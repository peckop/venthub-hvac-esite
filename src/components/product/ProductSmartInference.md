---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\product\ProductSmartInference.tsx
skeleton_hash: 6efc9c860eedde1a
entity_hashes:
  overview: 1cbfc71df668bd9f
  style_tokens: 14ff5ff1bd6a1a02
generated_at: 2026-06-06T21:54:56Z
---

## Genel Bakış
Bu modül, bir ürünün mühendislik analizini ve teknik çıkarımlarını görsel olarak sunan bir React bileşenidir. Bir `Product` nesnesi alarak `generateEngineeringSummary` yardımcısı aracılığıyla mühendislik odaklı verileri işler ve bu verileri ikonlar, renkler ve çevirilerle zenginleştirilmiş bir arayüz kartı olarak sunar.

## Modülün Amacı ve Kullanım Bağlamı
`ProductSmartInference` bileşeni, bir ürün sayfasında teknik ve mühendisliksel bilgileri kullanıcıya estetik bir kart içinde sunmak için kullanılır. Modül, bir `Product` veri modeli alır ve bu model üzerinde `generateEngineeringSummary` fonksiyonunu çağırarak bir mühendislik özetleri dizisi üretir. Oluşan her bir özet (örn: verimlilik, ses, dayanıklılık) için uygun Lucide ikonunu ve CSS gradyan renk temasını belirleyen iç yardımcı fonksiyonlar kullanır. Uluslararasılaştırma (`useI18n`) hook'u ile tüm metinleri çevrilmiş şekilde render eder; eğer mühendislik özeti üretilemezse bileşen `null` döner ve nothing render etmez.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için güvenilir mimari varsayımlar üretilememektedir. Gerekçe: Fonksiyon gövdesi, parametre tanımı veya modül sabiti detayı verilmemiştir; yalnızca dosya yolu ve genel bir React bileşeni olduğu bilgisi mevcuttur. Aksiyom üretimi için fonksiyon imzası veya gövde kodu gereklidir.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### ProductSmartInferenceProps
- `product: Product`

---

## SABİTLER
- **ProductSmartInference** (call) — `React.memo(({ product }) => {
  const { t } = useI18n()
  const summaries =...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ProductSmartInference.tsx::mainComponent
- **params**: `({ product })` — React component props, `product` Product tipinde ürün nesnesi
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, `t('pdp.labels.engineeringAnalysis')`, `t(item.labelKey)`, `t(item.descriptionKey)` şeklinde JSX içinde kullanılır
  - `summaries` — `generateEngineeringSummary(product)` çağrısının dönüşü, `EngineeringInference[]` dizisi; mühendislik analizi özetlerini tutar, boşsa `null` döner
  - `getIcon` — inner fonksiyon, `EngineeringInference['type']` alır ve ilgili `lucide-react` ikon JSX elemanını döner
  - `getThemeColor` — inner fonksiyon, `EngineeringInference['type']` alır ve Tailwind gradient/border/metin renk CSS sınıf dizgesini döner
- **Erisilen Ozellikler**:
  - `summaries.length` — dizi uzunluğu kontrol edilir, 0 ise `null` return
  - `summaries.map((item, idx) => ...)` — her item için kart JSX'i üretilir
  - `item.type` — `getIcon` ve `getThemeColor` fonksiyonlarına argüman olarak geçirilir
  - `item.isI18n` — boolean, `true` ise `t(item.labelKey)` / `t(item.descriptionKey)` ile çevrilir, `false` ise ham değer gösterilir
  - `item.labelKey` — başlık metni veya çeviri anahtarı
  - `item.value` — mühendislik analizi sonucu değeri (ör: "35 dB")
  - `item.descriptionKey` — açıklama metni veya çeviri anahtarı
  - `t('pdp.labels.engineeringAnalysis')` — bölüm başlığı etiketi
- **Dönüş**: JSX Element (React bileşeni) veya `summaries.length === 0` durumunda `null`

### [N2_NASIL] AST Pointer: ProductSmartInference.tsx::getIcon
- **params**: `type: EngineeringInference['type']` — analiz türü (noise, efficiency, power, quality)
- **ic_degiskenler**: yok
- **Dönüş**: JSX Element — `type` değerine göre `Volume2`, `ShieldCheck`, `Zap`, `Cpu` veya `Activity` lucide-react ikon bileşeni; her biri `size={20}` ve `className` ile stillendirilmiş

### [N3_NASIL] AST Pointer: ProductSmartInference.tsx::getThemeColor
- **params**: `type: EngineeringInference['type']` — analiz türü (noise, efficiency, power, quality)
- **ic_degiskenler**: yok
- **Dönüş**: `string` — Tailwind CSS gradient, border ve metin renk sınıf dizgesi; `type` değerine göre `from-*-500/10 to-transparent border-*-200/50 text-*-700` formatında renk teması döner

### [N4_NASIL] AST Pointer: ProductSmartInference.tsx::mapCallback
- **params**: `item: EngineeringInference`, `idx: number` — `summaries.map()` iterasyonundaki bireysel analiz özeti ve dizi indeksi
- **ic_degiskenler**: yok
- **Erisilen Ozellikler**:
  - `item.type` — `getIcon(item.type)` ve `getThemeColor(item.type)` çağrılarına argüman
  - `item.isI18n` — label ve description'ın çevrilip çevrilmeyeceğini belirler
  - `item.labelKey` — `item.isI18n` true ise `t()` ile sarılır, değilse doğrudan gösterilir
  - `item.value` — analiz sonucu değeri, `<span>` içinde render edilir
  - `item.descriptionKey` — `item.isI18n` true ise `t()` ile sarılır, değilse doğrudan gösterilir
  - `idx` — `key={idx}` olarak React key olarak kullanılır
- **Dönüş**: JSX Element — her analiz özeti için kart bileşeni (`<div>`); ikon, başlık, değer ve açıklama içeren gradient arka planlı kart

---

## NODE ID STANDARD

  file: src\components\product\ProductSmartInference.tsx

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductSmartInference

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-br`, `bg-primary-navy`, `bg-slate-100`, `bg-slate-300`, `bg-white`, `bg-white/60`, `border-inherit`, `border-slate-100/80`, `border-white/80`, `border-y`, `text-amber-600`, `text-blue-600`, `text-emerald-600`, `text-purple-600`, `text-slate-400`
- **Layout:** `-bottom-4`, `-right-4`, `absolute`, `flex`, `flex-wrap`, `gap-2.5`, `gap-3`, `gap-4`, `gap-5`, `grid`, `grid-cols-1`, `h-1`, `h-1.5`, `h-full`, `hover:shadow-md`
- **Varyant/Responsive:** `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${getThemeColor(item.type`, `animate-in`, `animate-ping`, `border`, `duration-300`, `duration-700`, `fade-in`, `font-black`, `font-bold`, `font-medium`, `group`, `group-hover:scale-110`, `hover:-translate-y-0.5`, `leading-relaxed`, `mb-2`