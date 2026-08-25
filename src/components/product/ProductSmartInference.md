---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\product\ProductSmartInference.tsx
skeleton_hash: 3e5ac46b64ccf9d2
entity_hashes:
  overview: 18fbc67e6ef24df1
  style_tokens: 14ff5ff1bd6a1a02
generated_at: 2026-08-25T07:25:43Z
---

## Genel Bakış
Bu modül, ürün verilerini kullanarak mühendislik çıkarımları yapan ve sonuçları kullanıcıya sunan bir React bileşenini tanımlar. Bileşen, uluslararasılaştırma desteği için `useI18n` kancasını kullanır ve `EngineeringInference` ile `generateEngineeringSummary` yardımcı fonksiyonlarından yararlanarak akıllı çıkarım mantığını uygular. Arayüzde `Activity`, `Cpu`, `ShieldCheck`, `Volume2` ve `Zap` ikonları farklı çıkarım türlerini veya durumları görsel olarak temsil etmek için kullanılır.

Modül, `Product` tipindeki bir veri modeliyle çalışır ve `ProductSmartInference` adlı bir bileşen dışa aktarır. Dosyada tanımlanmış fonksiyon bulunmadığından, fonksiyon gruplaması yapılmamıştır. Modülün kullandığı ortam değişkenleri, sorguladığı API'ler veya tablolar hakkında verilen kaynakta bilgi yer almamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modülün fonksiyon imzaları ve gövdeleri belgeye dahil edilmemiştir. Aksiyomlar yalnızca fonksiyon gövdelerinden üretilebilir; mevcut kaynakta çıkarım yapılabilecek bir fonksiyon tanımı bulunmamaktadır.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: @/types/ui-models::type { Product }
- import: lucide-react::Activity
- import: lucide-react::Cpu
- import: lucide-react::ShieldCheck
- import: lucide-react::Volume2
- import: lucide-react::Zap
- import: react::React

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
- **params**: `product` — Product tipinde ürün verisi
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu, i18n anahtarlarını çözümlemek için kullanılır
  - `summaries` — generateEngineeringSummary(product) çağrısının dönüşü, mühendislik çıkarımları dizisi; length === 0 kontrolü ile erken dönüş tetiklenir
  - `getIcon` — iç fonksiyon tanımı, EngineeringInference tipine göre JSX ikon bileşeni döndürür
  - `getThemeColor` — iç fonksiyon tanımı, EngineeringInference tipine göre CSS gradient/border/text class string'i döndürür
- **Dönüş**: summaries.length === 0 ise null, aksi halde JSX div elementi (analiz sonuçlarını kartlar halinde render eder)

### [N2_NASIL] AST Pointer: src/components/product/ProductSmartInference.tsx::getIcon
- **params**: `type` — EngineeringInference['type'] tipinde çıkarım türü
- **ic_degiskenler**: yok
- **Dönüş**: JSX element — type değerine göre: 'noise' ise `<Volume2>`, 'efficiency' ise `<ShieldCheck>`, 'power' ise `<Zap>`, 'quality' ise `<Cpu>`, default ise `<Activity>` (her biri size={20} ve renkli className ile)

### [N3_NASIL] AST Pointer: src/components/product/ProductSmartInference.tsx::getThemeColor
- **params**: `type` — EngineeringInference['type'] tipinde çıkarım türü
- **ic_degiskenler**: yok
- **Dönüş**: string — type değerine göre Tailwind CSS class'ları: 'noise' için blue, 'efficiency' için emerald, 'power' için amber, 'quality' için purple, default için slate renk paletinde gradient/border/text class'ları

### [N4_NASIL] AST Pointer: src/components/product/ProductSmartInference.tsx::map callback
- **params**: `item` — summaries dizisinin bir elemanı (type, isI18n, labelKey, value, descriptionKey alanlarına sahip), `idx` — dizi indeksi (key prop'u olarak kullanılır)
- **ic_degiskenler**: yok — getIcon ve getThemeColor dış scope'dan erişilir
- **Dönüş**: JSX div elementi — her bir çıkarım için kart bileşeni; item.type'a göre tema rengi, ikon, labelKey (isI18n true ise t() ile çevrilir), value ve descriptionKey (isI18n true ise t() ile çevrilir) render eder

---

## NODE ID STANDARD

  file: ProductSmartInference.tsx

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