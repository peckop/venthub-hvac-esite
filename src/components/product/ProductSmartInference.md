---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\product\ProductSmartInference.tsx
skeleton_hash: b09b21b419fb6a4c
entity_hashes:
  overview: 18fbc67e6ef24df1
  style_tokens: 14ff5ff1bd6a1a02
generated_at: 2026-06-08T10:08:49Z
---

## Genel Bakış
`ProductSmartInference`, bir `Product` veri nesnesi alarak mühendislik analizlerini ve teknik çıkarımları dinamik bir kart arayüzünde sunan bir React bileşenidir. Bileşen, `generateEngineeringSummary` yardımcısıyla ham veriyi işler, ardından her bir analiz maddesini (`useI18n` hook'u ile çevrilmiş metinlerle, ikonlarla ve renkli gradyanlarla) zenginleştirerek render eder. Eğer işlenecek özet veri bulunamazsa bileşen ekranda hiçbir şey göstermez.

## Modülün Yapısı ve Sorumlulukları
Bu modül tek bir bileşen内, veri işleme, arayüz sunumu ve uluslararasılaştırma sorumluluklarını bir arada barındırır. Mantıksal olarak üç ana işlev akışı üzerine kurulmuştur.

### Veri İşleme ve Özet Üretimi
Bileşen, girdi olarak aldığı `Product` nesnesi üzerinde mühendislik zekası modülünü (`engineeringIntelligence`) kullanarak analiz verilerini üretir.
- `generateEngineeringSummary` çağrısı ve sonuçların `summaries` dizisine işlenmesi.

### Arayüz Sunumu ve Görselleştirme
Üretilen her bir mühendislik özeti (örneğin verimlilik, ses, dayanıklılık), önceden tanımlı ikonlar ve renk temaları eşliğinde birer kart bileşeni olarak render edilir.
- `IconForSummary`, `ColorForSummary` gibi iç yardımcılarla her satıra özgü görsel belirleyicilerin atanması.

### Uluslararasılaştırma ve Koşulsal Render
Bileşen, `useI18n` hook'u ile tüm metinleri kullanıcının dil ayarına göre çevirir. Ayrıca, işlenecek özet veri yoksa (`summaries` boşsa) bileşen `null` dönerek hiçbir arayüz elementi oluşturmaz.
- `t(...)` çağrıları ile çevrilmiş metin kullanımı ve `if (!summaries.length) return null` koşulunun sağlanması.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React bileşeni olup fonksiyon gövdesine ilişkin detaylı bilgi verilmemiştir. Sınırlı bilgiye dayalı mimari varsayımlar aşağıdadır:

**[Aksiyom 1]:** Eğer `generateEngineeringSummary` fonksiyonu modülde mevcut değilse veya doğru import edilmemişse, bileşen render aşamasında hata fırlatır (React error boundary veya runtime exception).

**[Aksiyom 2]:** Eğer bileşene geçilen `Product` nesnesi `null` veya `undefined` ise, `generateEngineeringSummary` çağrısı başarısız olur veya bileşen hatalı render edilir.

**[Aksiyom 3]:** Eğer `generateEngineeringSummary` fonksiyonu boş bir dizi döndürürse, bileşen boş/minimal bir kart arayüzü render eder; UI'da herhangi bir özet satırı gösterilmez.

**[Aksiyom 4]:** Eğer çevirileri sağlayan i18n/context sistemi (örn: `t()` fonksiyonu) kullanılamıyorsa, bileşen varsayılan dilde (muhtemelen Türkçe veya İngilizce) sabit metinlerle render edilir.

**[Aksiyom 5]:** Eğer bileşenin stil tokenları veya CSS modülleri doğru eşlenmemişse, kart arayüzünde görsel bozulmalar (kırık ikonlar, eksik renkler) oluşur.

**[Aksiyom 6]:** Bu modül tek yönlü veri akışı (unidirectional data flow) prensibiyle çalışır; `Product` prop'u üst bileşenden gelir, bileşen kendi içinde prop'u değiştirmez.

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

### [N1_NASIL] AST Pointer: ProductSmartInference.tsx::ProductSmartInference
- **params**: `({ product })` — Product tipinde destructure edilmiş nesne, ürün verisi
- **ic_degiskenler**:
  - `t` — `useI18n()` hookundan dönen çeviri fonksiyonu, UI metinlerini uluslararası dil destegiyle renderlamak için kullanılır
  - `summaries` — `generateEngineeringSummary(product)` çağrısından dönen `EngineeringInference[]` dizisi, ürünün mühendislik analiz sonuçlarını tutar
  - `getIcon` — iç içe fonksiyon; `EngineeringInference['type']` parametresine göre Lucide React ikon bileşeni (Volume2, ShieldCheck, Zap, Cpu, Activity) döner
  - `getThemeColor` — iç içe fonksiyon; `EngineeringInference['type']` parametresine göre Tailwind CSS gradyan/rengi sınıf dizesi döner
- **Dönüş**: `JSX.Element | null` — summaries boşsa `null`, doluysa mühendislik analiz kartlarını gösteren JSX bloğu

### [N2_NASIL] AST Pointer: ProductSmartInference.tsx::getIcon
- **params**: `(type: EngineeringInference['type'])` — mühendislik çıkarımı türü (noise, efficiency, power, quality)
- **ic_degiskenler**: yok (switch-case ile doğrudan return)
- **Dönüş**: `JSX.Element` — type değerine göre Volüm2, ShieldCheck, Zap, Cpu veya Activity ikon bileşeni

### [N3_NASIL] AST Pointer: ProductSmartInference.tsx::getThemeColor
- **params**: `(type: EngineeringInference['type'])` — mühendislik çıkarımı türü (noise, efficiency, power, quality)
- **ic_degiskenler**: yok (switch-case ile doğrudan return)
- **Dönüş**: `string` — Tailwind CSS gradyan, border ve metin rengi sınıflarından oluşan dize (örn. `'from-blue-500/10 to-transparent border-blue-200/50 text-blue-700'`)

### [N4_NASIL] AST Pointer: ProductSmartInference.tsx::summaries.map_callback
- **params**: `(item, idx)` — `item`: `EngineeringInference` nesnesi (summaries dizisindeki her bir analiz sonucu); `idx`: `number` (dizi indeksi, `key` prop'u olarak kullanılır)
- **ic_degiskenler**: yok (item özellikleri doğrudan JSX içinde erişilir: `item.type`, `item.isI18n`, `item.labelKey`, `item.value`, `item.descriptionKey`)
- **Dönüş**: `JSX.Element` — tek bir mühendislik analiz kartı div'i; ikon, başlık, değer rozeti ve açıklama metni içerir

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