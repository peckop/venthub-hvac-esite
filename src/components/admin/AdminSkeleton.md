---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AdminSkeleton.tsx
skeleton_hash: 3d64d8f079258cce
entity_hashes:
  func:AdminSkeleton: 586d38b8378960eb
  overview: d5fffe3d7ed9f7eb
  style_tokens: 9ebeaa83a2aaeb97
generated_at: 2026-05-28T22:35:31Z
---

## Genel Bakış
`AdminSkeleton` bileşeni, yönetim panelinde veri yüklenme süreçlerinde kullanıcıya görsel geri bildirim sunan yer tutucu arayüzleri oluşturur. Tablo, kart veya form gibi farklı varyasyonlara göre adapte olabilen esnek bir skeleton şablonu sağlar. Bu sayede sayfa düzeni nihai veriler yüklenmeden önce kullanıcıya kabaca gösterilir.

## Fonksiyon Grupları
### Skeleton Oluşturma ve Yer Tutucu Üretimi
Verilen parametrelere göre satır, alan ve tekrar sayısını hesaplayarak tekrarlayan placeholder elemanlarını oluşturur.
- AdminSkeleton

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için temel mimari varsayımlar fonksiyonun parametrelerine dayanır.

**[Aksiyom 1]:** Eğer `variant` parametresi `null` veya `undefined` ise, bileşen doğru bir skeleton varyantı (ör. `table`, `card`, `form`) oluşturamaz ve uygun bir stil uygulanamaz.

**[Aksiyom 2]:** Eğer `rows`, `count` veya `fields` parametrelerinden herhangi biri negatif veya sıfır ise, bileşen anlamsız veya görünmez placeholder elemanlar üretir; skeleton yapısının bozulmasına yol açar.

**[Aksiyom 3]:** Fonksiyonun `rows`, `count` ve `fields` değerlerini **pozitif tamsayı** olarak kabul ettiği varsayılır (default değerleri sırasıyla 5, 4 ve 6'dır). Bu değerlerin UI'da tekrarlayan elemanların sayısını doğrudan belirlediği kabul edilir.

---

## FONKSİYON DETAYLARI

### AdminSkeleton

**Ne yapar**: AdminSkeleton, admin panelinin yükleme durumlarında (loading state) kullanılacak iskelet/skeleton gösterimini oluşturur. variant propuna bağlı olarak tablo, kart veya form tipinde animasyonlu placeholder bileşenleri render eder. Veri yüklenene kadar kullanıcıya sayfanın yapısını görsel olarak hissettirmeyi amaçlar.

**Nasıl yapar**: Fonksiyon, `variant` parametresinin değerine göre üç farklı JSX yapısı döndürür. `'table'` seçildiğinde başlık satırı ve belirli satır/sütun sayısına sahip bir tablo iskeleti, `'cards'` seçildiğinde grid düzeninde kart iskeletleri,否则 varsayılan olarak form alanlarından oluşan bir iskelet render eder. Her bir varyantta `animate-pulse` sınıfı ile animasyon efekti, `glassStrongClass` ile cam efektli arka plan ve `border-white/5` gibi transparan kenarlıklar kullanılarak modern bir loading görseli oluşturulur. `rows`, `count` ve `fields` parametreleri ile dinamik olarak eleman sayısı kontrol edilir.

**Parametreler**:
- `variant`: `'table' | 'cards' | string` (varsayılan: `'form'` olarak davranır) — Skeleton tipini belirler. `'table'` tablo, `'cards'` kart düzeni, diğer değerler form varyantını aktif eder
- `rows`: `number` — `'table'` varyantında tablonun satır sayısını belirler (varsayılan: 5)
- `count`: `number` — `'cards'` varyantında gösterilecek kart sayısını belirler (varsayılan: 4)
- `fields`: `number` — Varsayılan form varyantında alan sayısını belirler (varsayılan: 6)

**Dönüş**: `JSX.Element` — Seçilen varyanta göre animasyonlu skeleton yapısını temsil eden React JSX bileşeni döndürür. Her varyant farklı bir layout yapısına sahiptir: tablo varyantı `<div>` içinde `<table>` yapısı, kart varyantı grid düzeninde çoklu `<div>` kartları, form varyantı ise input alanlarını simüle eden çoklu `<div>` blokları içerir.

---

## INTERFACES

### AdminSkeletonProps
- `variant: 'table' | 'cards' | 'form'`
- `rows?: number`
- `count?: number`
- `fields?: number`

---

## NODE ID STANDARD

  file: src\components\admin\AdminSkeleton.tsx
  function: src\components\admin\AdminSkeleton.tsx::AdminSkeleton

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminSkeleton

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400/10`, `bg-cyan-500/5`, `bg-gradient-to-br`, `bg-transparent`, `bg-white/10`, `bg-white/2`, `bg-white/3`, `bg-white/5`, `border-b`, `border-cyan-400/20`, `border-t`, `border-white/5`, `from-cyan-500/5`, `text-left`, `to-transparent`
- **Layout:** `absolute`, `flex`, `from-cyan-500/5`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `h-10`, `h-12`, `h-14`, `h-3`, `h-32`, `h-4`, `h-6`
- **Varyant/Responsive:** `group-hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${glassStrongClass`, `animate-pulse`, `blur-3xl`, `border`, `divide-white/5`, `divide-y`, `group`, `group-hover:opacity-100`, `inset-0`, `mb-10`, `ml-1`, `mt-10`, `opacity-0`, `pt-8`, `rounded-2xl`