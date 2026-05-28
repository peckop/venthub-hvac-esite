---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\product\ProductSmartInference.tsx
skeleton_hash: 943b3141203d5b8c
entity_hashes:
  overview: a5c2eaa395a8b75d
  style_tokens: 14ff5ff1bd6a1a02
generated_at: 2026-05-28T22:36:46Z
---

## Genel Bakış
Bu modül, bir ürünün mühendislik analizini ve teknik çıkarımlarını görsel olarak sunan React bileşenidir. Bir `Product` nesnesi alarak `generateEngineeringSummary` yardımcısı aracılığıyla mühendislik odaklı çıkarımlar üretir ve bu çıkarımları ikonlarla, renklerle ve çevirilerle zenginleştirilmiş bir kart olarak sunar.

## Fonksiyon Grupları
### Ana Bileşen Mantığı
Bileşen, girdi olarak bir `Product` alır, uluslararasılaştırma (`useI18n`) kullanarak metinleri çözer ve `generateEngineeringSummary` ile mühendislik özetlerini oluşturur. Boş özet durumunda `null` döner, aksi halde ikonlar ve tema renkleriyle süslenmiş bir arayüz kartı render eder.
- ProductSmartInference (React.memo)

### Yardımcı Görsel Fonksiyonlar
Bileşen içinde tanımlanmış yerel yardımcılar, her bir mühendislik çıkarımı türü (`type`) için uygun Lucide ikonunu ve CSS gradyan renk temasını döndürerek arayüzün dinamik ve anlamlı görünmesini sağlar.
- getIcon, getThemeColor

---



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

### [N1_NASIL] AST Pointer: src/components/product/ProductSmartInference.tsx::ProductSmartInference
- **params**: `product` — Ürün nesnesi, engineering summary oluşturmak için kullanılır
- **ic_degiskenler**:
  - `t` — Çeviri fonksiyonu, useI18n hook'undan alınır
  - `summaries` — generateEngineeringSummary(product) ile oluşturulan mühendislik analizleri dizisi
  - `getIcon` — Mühendislik analiz tipine göre ikon seçen iç fonksiyon
  - `getThemeColor` — Mühendislik analiz tipine göre renk teması seçen iç fonksiyon
- **Dönüş**: JSX element veya null (summaries.length === 0 ise null, aksi takdirde mühendislik analizleri kartları)

### [N2_NASIL] AST Pointer: src/components/product/ProductSmartInference.tsx::getIcon
- **params**: `type` — EngineeringInference['type'] (noise, efficiency, power, quality veya diğerleri)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element — Lucide React ikonu (Volume2, ShieldCheck, Zap, Cpu veya Activity)

### [N3_NASIL] AST Pointer: src/components/product/ProductSmartInference.tsx::getThemeColor
- **params**: `type` — EngineeringInference['type'] (noise, efficiency, power, quality veya diğerleri)
- **ic_degiskenler**: yok
- **Dönüş**: string — Tailwind CSS sınıfları ile tema rengi (gradient, border ve text renkleri)

### [N4_NASIL] AST Pointer: src/components/product/ProductSmartInference.tsx::mapCallback
- **params**: `item` — EngineeringInference nesnesi (summaries dizisindeki her bir analiz), `idx` — Dizin indeksi
- **ic_degiskenler**: yok
- **Dönüş**: JSX element — Tek bir mühendislik analiz kartı (div içinde ikon, başlık, değer ve açıklama)

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