---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\ColumnsMenu.tsx
skeleton_hash: 0b60e261dadfb14d
entity_hashes:
  func:ColumnsMenu: acb58bb1e295bcab
  overview: b2310e22f90d9a39
  style_tokens: f68608c28260c039
generated_at: 2026-06-08T10:08:36Z
---

## Genel Bakış
ColumnsMenu, tablo yapılandırma menüsü olarak işlev gören bir React bileşenidir. Temel amacı, kullanıcıların tablolarındaki sütunların görünürlüğünü açıp kapatmasına ve satır yoğunluğunu ayarlamasına olanak tanımaktır. Bileşen, dışarıdan gelen konfigürasyon ve geri çağırma fonksiyonlarıyla etkileşime girerek bu tercihleri yönetir.

## Fonksiyon Grupları
### Sütun ve Yoğunluk Yönetimi
Bileşen, verilen sütun yapılandırmasını kullanarak kullanıcıya tercihler sunar ve bu tercihlerdeki değişiklikleri üst bileşene iletir. Ana sorumluluk, sütun görünürlüğü denetimleri ile yoğunluk seçimi arasındaki etkileşimi yönetmektir.
- ColumnsMenu

---

## AXIOMS – Mimari Varsayımlar
Bu modül, sütunların görünürlüğünü ve satır yoğunluğunu yöneten bir menü bileşenidir. Doğru çalışması için aşağıdaki koşulların sağlanmış olması gerekir.

[Aksiyom 1]: Eğer `columns` prop'u (sütun listesi) yoksa, bileşen süt

---

## FONKSİYON DETAYLARI

### ColumnsMenu

**Ne yapar**: Tablo sütunlarının görünürlüğünü ve tablo yoğunluğunu (density) yöneten bir açılır menü bileşenidir. Kullanıcının tablodaki hangi sütunların gösterileceğini seçmesine ve satır aralığı yoğunluğunu ayarlamasına olanak tanır.

**Nasıl yapar**: Bileşen, verilen `columns` dizisini kullanarak her bir sütun için bir toggle ( açma/kapama ) kontrolü oluşturur. `density` prop'u ile mevcut yoğunluk durumunu okur ve `onDensityChange` callback'i aracılığıyla yoğunluk değişikliklerini üst bileşene iletir. `buttonLabel` prop'u sağlanmışsa, menüyü tetikleyen butonda özel bir etiket kullanılır; aksi halde varsayılan bir etiket gösterir.

**Parametreler**:
- `columns`: `ColumnToggle[]` — Tablodaki sütunların tanımını ve görünürlük durumlarını içeren dizi. Her bir öğe, bir sütunun adını ve açma/kapama durumunu temsil eder.
- `density`: `Density` — Tablonun mevcut yoğunluk modunu belirten değer. Satır yüksekliği ve iç boşlukları kontrol eder.
- `onDensityChange`: `(d: Density) => void` — Kullanıcı yoğunluk değiştirdiğinde çağrılan geri çağırma fonksiyonu. Yeni yoğunluk değerini üst bileşene iletir.
- `buttonLabel`: `string | undefined` — Opsiyonel. Menüyü açan buton üzerinde görüntülenecek özel etiket metni. Sağlanmadığında varsayılan metin kullanılır.

**Dönüş**: `React.FC` — JSX ile render edilen bir React fonksiyonel bileşeni döndürür. Bileşen, sütun toggle'larını ve yoğunluk seçim kontrolünü içeren bir menü arayüzü sunar.

---

## TYPE ALIASES

### ColumnToggle
```typescript
type ColumnToggle = { key: string; label: string; checked: boolean; onChange: (v: boolean) => void }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ColumnsMenu.tsx::ColumnsMenu
- **params**: { columns, density, onDensityChange, buttonLabel }
- **ic_degiskenler**:
  - `_t` — useI18n hook'undan alınan çeviri fonksiyonu, UI metinlerini çevirilerden almak için kullanılır
- **Dönüş**: JSX (React element) — DropdownMenu bileşeni, sütun toggle'ları ve yoğunluk seçicisi içeren menü UI'ı

---

## NODE ID STANDARD

  file: src\components\admin\ColumnsMenu.tsx
  function: src\components\admin\ColumnsMenu.tsx::ColumnsMenu

---

## DISA AKTARILANLAR (EXPORTS)
  export: ColumnToggle
  export: ColumnsMenu

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `shadow-glow-sm`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-surface-deep`, `bg-white/5`, `border-b`, `border-cyan-400`, `border-white/10`, `border-white/5`, `data-[state=checked]:text-cyan-400`, `hover:bg-white/5`, `hover:text-white`, `stroke-4`, `text-cyan-400`, `text-slate-300`, `text-slate-500`, `text-surface-deep`
- **Layout:** `custom-scrollbar`, `flex`, `gap-2`, `gap-3`, `h-1.5`, `h-12`, `h-4`, `h-px`, `items-center`, `justify-between`, `justify-center`, `max-h-300px`, `min-w-140px`, `min-w-240px`, `overflow-y-auto`
- **Varyant/Responsive:** `:`, `data-[state=checked]:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${col.checked`, `${density`, `:`, `===`, `animate-in`, `border`, `comfortable`, `compact`, `cursor-pointer`, `duration-200`, `fade-in`, `font-black`, `font-bold`, `glass-strong`, `group`