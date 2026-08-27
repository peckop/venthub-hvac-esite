---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\authority\TechnicalDrawingAuthority.tsx
skeleton_hash: 455314ebd95a1753
entity_hashes:
  func:TechnicalDrawingAuthority: 9e9ee1c4c520dae4
  overview: 644a3bf371af42f4
  style_tokens: b07a83f8b2a17b2b
generated_at: 2026-08-27T08:25:02Z
---

## Genel Bakış
Bu modül, teknik çizimlerin yetki/otorite görünümünü sağlayan bir React bileşeni içerir. Bileşen, `drawings` ve `className` olmak üzere iki prop alır ve varsayılan olarak boş bir className değeri kullanır.

## Fonksiyon Grupları
### Ana Bileşen
Teknik çizim verilerini alıp yetki/otorite bağlamında bir arayüz sunan bileşendir.
- TechnicalDrawingAuthority

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### TechnicalDrawingAuthority
**Ne yapar**: Teknik doküman ve çizimlerin otorite standartlarında sergilenmesini sağlayan React fonksiyonel bileşenidir. Her dokümanı animasyonlu bir kart yapısında sunar, format bazlı görsel ayrıştırma ve versiyon takibi içerir. Grid düzeninde responsive bir liste oluşturur.

**Nasıl yapar**: Bileşen, aldığı `drawings` dizisini `.map()` ile iterasyona uğratarak her doküman için bir `motion.div` (Framer Motion) kartı oluşturur. Her kart, sıralı gecikmeli (`delay: idx * 0.05`) bir açılma animasyonu ile ekrana gelir. Kartın sol tarafında doküman bilgileri (kategori, başlık, format, son güncelleme tarihi, versiyon numarası) yer alır; sağ tarafında ise indirme butonu bulunur. Format bilgisine göre `formatColors` nesnesinden renk sınıfı çekilir, eşleşme yoksa varsayılan gri tonları kullanılır. Versiyon bilgisi mevcutsa `VERSION_PREFIX` sabiti ile birlikte gösterilir. Son güncelleme tarihi mevcutsa saat ikonuyla birlikte görüntülenir.

**Parametreler**:
- drawings: `TechnicalDrawingAuthorityProps['drawings']` — Gösterilecek teknik doküman ve çizimlerin listesi. Her elemanda `id`, `format`, `category`, `version`, `title`, `lastUpdated`, `url` alanları bulunduğu kod yapısından anlaşılmaktadır.
- className: `string` — Bileşenin kök `div` elementine eklenecek ek CSS sınıf adı. Varsayılan değeri boş string (`''`) olarak atanmıştır.

**Dönüş**: JSX elementi döndürür. Kök eleman, Tailwind CSS sınıflarıyla stilize edilmiş bir `div` olup içinde `motion.div` kartlarından oluşan bir grid yapısı barındırır. Grid yapısı tek sütunlu (`grid-cols-1`) başlayıp orta ve üzeri ekran genişliklerinde iki sütunlu (`md:grid-cols-2`) düzene geçer.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/media.types::type { TechnicalDrawingMetadata }
- import: framer-motion::motion
- import: lucide-react::Clock
- import: lucide-react::Download
- import: lucide-react::FileText
- import: lucide-react::Info
- import: react::React

---

## INTERFACES

### TechnicalDrawingAuthorityProps
- `drawings: TechnicalDrawingMetadata[]`
- `className?: string`

---

## SABİTLER
- **formatColors** (object) — `{
    pdf: 'bg-red-50 text-red-600 border-red-100',
    dwg: 'bg-blue-50 te...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/authority/TechnicalDrawingAuthority.tsx::TechnicalDrawingAuthority
- **params**:
  - `drawings` — `TechnicalDrawingMetadata` dizisi; her eleman bir teknik resmi temsil eder
  - `className` — opsiyonel CSS sınıfı string'i, varsayılan boş string `''`
- **ic_degiskenler**:
  - `doc` — `drawings.map()` içindeki her eleman; tek bir teknik resim metadata nesnesi
  - `idx` — `drawings.map()` içindeki döngü indeksi; animasyon gecikmesi (`delay: idx * 0.05`) hesaplamak için kullanılır
  - `formatColors` — dış sabit (dosya üstünde tanımlı); `doc.format` anahtarına karşılık gelen CSS sınıf string'ini döndürür; eşleşme yoksa `'bg-slate-50 text-slate-600 border-slate-100'` kullanılır
  - `VERSION_PREFIX` — dış sabit; `doc.version` varsa önüne eklenen ön ek string'i
  - `doc.id` — benzersiz tanımlayıcı; `motion.div` bileşeninin `key` prop'u olarak kullanılır
  - `doc.format` — dosya formatı bilgisi; `formatColors[doc.format]` ile renk seçimi ve `.toUpperCase()` ile üst harf gösterimi için kullanılır
  - `doc.category` — kategori etiketi; üst harf stilinde (`uppercase`) gösterilir
  - `doc.version` — versiyon numarası (opsiyonel); varsa `VERSION_PREFIX` ile birlikte etiket olarak gösterilir
  - `doc.title` — teknik resim başlığı; `h4` içinde gösterilir
  - `doc.lastUpdated` — son güncelleme tarihi (opsiyonel); varsa saat ikonu ile birlikte gösterilir
  - `doc.url` — indirme URL'si; `a` etiketinin `href` prop'una atanır
- **Dönüş**: JSX elementi (React fonksiyon bileşeni); `drawings` dizisini `.map()` ile döngüye alarak her teknik resim için animasyonlu kart listesi render eder; her kartta format ikonu, kategori, versiyon, başlık, format bilgisi, tarih ve indirme butonu bulunur

---

## NODE ID STANDARD

  file: src\components\authority\TechnicalDrawingAuthority.tsx
  function: src\components\authority\TechnicalDrawingAuthority.tsx::TechnicalDrawingAuthority

---

## DISA AKTARILANLAR (EXPORTS)
  export: TechnicalDrawingAuthority

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-slate-100`, `bg-slate-50`, `bg-white`, `border-slate-100`, `border-slate-200`, `group-hover:text-primary-navy`, `hover:bg-primary-navy`, `hover:border-primary-navy/30`, `hover:text-white`, `text-industrial-gray`, `text-slate-400`, `text-slate-500`, `text-slate-600`, `text-sm`, `text-xs`
- **Layout:** `flex`, `flex-col`, `gap-4`, `grid`, `grid-cols-1`, `h-12`, `hover:shadow-md`, `items-center`, `justify-between`, `justify-center`, `md:grid-cols-2`, `p-3`, `p-4`, `shadow-sm`, `w-12`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${className`, `${formatColors[doc.format]`, `border`, `font-black`, `font-bold`, `group`, `leading-tight`, `mr-1`, `mt-1`, `px-1.5`, `py-0.5`, `rounded`, `rounded-2xl`, `rounded-xl`, `space-x-2`