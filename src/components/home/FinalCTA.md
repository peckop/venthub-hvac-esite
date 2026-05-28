---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\FinalCTA.tsx
skeleton_hash: 35632ddf2d507e9e
entity_hashes:
  func:FinalCTA: 3c62b75363ed7179
  overview: d031dcb1b3862a3b
  style_tokens: 8d73486934d38b41
generated_at: 2026-05-28T22:36:11Z
---

## Genel Bakış
Bu modül, sayfanın son kısmında yer alan ve kullanıcıları teklif almaya yönlendiren bir çağrı‑eylem (CTA) bileşenini tanımlar. Bileşen, dışarıdan gelen bir tıklama işlevini (onQuoteClick) kullanarak, teklif butonuna basıldığında istenen eylemi tetikler.

## Fonksiyon Grupları
### Bileşen Tanımı ve Etkileşim
Bu grup, ana bileşenin yapısını ve temel etkileşim mantığını oluşturur. Bileşen, props olarak aldığı bir tıklama işlevini butona bağlayarak kullanıcı girişini üst seviyeye iletir.
- FinalCTA

---

## AXIOMS – Mimari Varsayımlar

Bu modülün doğru çalışması için bazı temel varsayımlar gereklidir.

[Aksiyom 1]: Eğer `onQuoteClick` prop'u sağlanmazsa, Quote butonuna tıklandığında hiçbir işlev tetiklenmez.

[Aksiyom 2]: Eğer `onQuoteClick` prop'u bir fonksiyon değilse, buton tıklaması sırasında hata oluşur.

[Aksiyom 3]: Eğer `revealVariants` sabiti tanımlı değilse, bileşenin giriş animasyonu (reveal) düzgün çalışmaz.

---

**Not:** Bu bileşen minimal bir prop yapısına sahiptir — yalnızca `onQuoteClick` callback'i bekler. bileşenin içeriği (buton metinleri, görseller, stil) hard-coded veya bileşen içinde tanımlıdır; bu nedenle ek aksiyomlar fonksiyon gövdesinden çıkarılamamıştır.

---

## FONKSİYON DETAYLARI

### FinalCTA
**Ne yapar**: Bu fonksiyon, bir React bileşeni (FinalCTA) oluşturur ve dışarıdan tetiklenecek bir tıklama olayı için bir geri çağırma (callback) fonksiyonu alır. Genellikle bir web sayfasının sonundaki "Harekete Geçirici Mesaj" bölümünü ve ilgili但onu render eder.
**Nasıl yapar**: Fonksiyon, gelen `onQuoteClick` prop'unu bileşenin iç mantığına bağlar. Bu sayede, bileşenin içindeki但on gibi bir etkileşimli elemana tıklandığında, üst bileşenden veya sayfadan verilen bu callback fonksiyonu çağrılabilir. Bileşenin görünümü ve diğer detayları `FinalCTAProps` arayüzü tarafından tanımlanır.
**Parametreler**:
- `onQuoteClick`: function — Butona veya CTA alanına tıklandığında çalıştırılacak olan geri çağırma fonksiyonu. Genellikle bir teklif formunu açmak veya benzeri bir eylemi tetiklemek için kullanılır.
**Dönüş**: React.FC<FinalCTAProps> — Oluşturulmuş FinalCTA adlı React fonksiyonel bileşenini döndürür.

---

## INTERFACES

### FinalCTAProps
- `onQuoteClick?: () => void`

---

## SABİTLER
- **revealVariants** (object) — `{
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacit...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\FinalCTA.tsx::(i: number) => ({...})
- **params**: (i: number) — animasyon gecikme sırasını belirten indeks parametresi
- **ic_degiskenler**:
  - `i` — animasyon sırasını belirleyen parametre, her bir eleman için gecikme hesaplanmasında kullanılır
- **Dönüş**: Animasyon tanımlı nesne (opacity, y, transition özellikleri)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\FinalCTA.tsx::{ onQuoteClick } =>
- **params**: ({ onQuoteClick }) — tıklama olayı callback fonksiyonu (opsiyonel)
- **ic_degiskenler**:
  - `t` — useI18n hookundan dönen çeviri fonksiyonu, sayfadaki metinleri uluslararası dil desteğiyle getirir
- **Dönüş**: React JSX bileşeni (section elementi, tüm CTA bölümünü render eder)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\FinalCTA.tsx::() => {...}
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etkileri: onQuoteClick callback'ini çağırır veya window.openLeadModal metodunu tetikler)

---

## NODE ID STANDARD

  file: src\components\home\FinalCTA.tsx
  function: src\components\home\FinalCTA.tsx::FinalCTA

---

## DISA AKTARILANLAR (EXPORTS)
  export: FinalCTA

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-hero`, `rounded-hvac-3xl`, `tracking-hvac-loose`, `tracking-hvac-normal`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-cyan-500/10`, `bg-emerald-500`, `bg-gradient-to-r`, `bg-indigo-500/10`, `bg-slate-950`, `bg-white`, `bg-white/2`, `bg-white/5`, `border-b`, `border-cyan-500/30`, `border-l`, `border-l-2`, `border-r`, `border-t`
- **Layout:** `absolute`, `backdrop-blur-3xl`, `bottom-0`, `bottom-6`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `from-cyan-600`, `gap-10`, `gap-12`, `gap-4`, `gap-6`, `gap-8`, `grid`
- **Varyant/Responsive:** `active:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-translate-x-1/4`, `-translate-y-1/4`, `active:scale-95`, `animate-pulse`, `blur-120`, `blur-150`, `border`, `duration-500`, `font-black`, `font-bold`, `font-light`, `group`, `group-hover:translate-y-0`, `inset-0`, `leading-relaxed`