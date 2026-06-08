---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\knowledge\TopicPage.tsx
skeleton_hash: fcebd7ec56cccae1
entity_hashes:
  func:TopicPage: f0965ed8eda6ce60
  overview: e2c2f0ab8ac5351b
  style_tokens: cc78d049395b1cf9
generated_at: 2026-06-08T10:11:02Z
---

## Genel Bakış
TopicPage bileşeni, VentHub HVAC platformunda bilgi tabanındaki konuların detaylı sayfa görünümünü sağlayan ana React bileşenidir. URL'den gelen benzersiz bir tanımlayıcı ile (slug) ilgili konunun tüm içeriğini, başlığını ve ilişkili verilerini çekerek kullanıcıya sunar.

## Fonksiyon Grupları
### Sayfa Verisi Yönetimi ve Koordinasyon
Bileşen, aldığı slug parametresini kullanarak ilgili konu verisini çeker, yükleme ve hata durumlarını yönetir ve render işlemi için gerekli verileri hazırlar.
- TopicPage

### Kullanıcı Arayüzü Oluşturma
Hazırlanan veriler kullanılarak konu sayfasının başlığı, ana içeriği, meta bilgileri ve ilişkili konu kartları gibi UI bileşenleri render edilerek tam bir sayfa oluşturulur.
- TopicPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayımlar aşağıdadır:

[Aksiyom 1]: Eğer `propSlug` parametresi geçerli bir değer (boş string veya undefined/null değil) yoksa, sayfa içeriği düzgün yüklenemez ve hata/yükleme durumu sonsuz döngüde kalabilir.

[Aksiyom 2]: Eğer `slug` değerine karşılık gelen konu verisi API veya yerel veri kaynağında mevcut değilse, bileşen bir hata durumu render etmelidir (veri bulunamadı).

[Aksiyom 3]: Eğer veri kaynağı (API) erişilemez durumdaysa veya network bağlantısı kopuksa, bileşen-network/hata durumunu göstermeli ve yeniden deneme mekanizması sunmalıdır.

[Aksiyom 4]: Eğer veri başarıyla çekildi ancak zorunlu alanlar (başlık, içerik bölümü) eksikse, bileşen kısmi render veya hata durumuna geçmelidir.

[Aksiyom 5]: Eğer `slug` parametresi değişir (örn: kullanıcı farklı bir konuya geçerse), bileşen mevcut veriyi temizlemeli ve yeni slug için tekrar veri çekme işlemi başlatmalıdır.

[Aksiyom 6]: Eğer veri çekme işlemi devam ediyorsa (yükleniyor durumu), bileşen bir skeleton/loading göstergesi render etmeli, eski veriyi göstermemelidir.

---

## FONKSİYON DETAYLARI

### TopicPage
**Ne yapar**: Bu React fonksiyonel bileşeni, VentHub HVAC platformundaki bilgi konularının tek sayfa görüntülenmesini sağlayan ana bileşendir. Aldığı benzersiz slug değeri ile hangi konunun içeriğinin yükleneceğini belirler ve kullanıcıya sunar.
**Nasıl yapar**: Bileşen, aldığı propSlug prop'u aracılığıyla görüntülenecek konunun benzersiz tanımlayıcısını alır. Bu tanımlayıcı kullanılarak ilgili konu verileri çekilir, ardından konu başlığı, detaylı içerik ve ilgili ek bileşenler render edilerek tam bir konu sayfası oluşturulur.
**Parametreler**:
- propSlug: string — Bileşene iletilen, görüntülenecek bilgi konusunun benzersiz tanımlayıcısı olan slug değeri
**Dönüş**: React.FC<TopicPageProps> tipinde bir React fonksiyonel bileşeni döner. Bu dönüş tipi, bileşenin TopicPageProps arayüzü ile tanımlanan propsları kabul ettiğini ve geçerli JSX elemanları ürettiğini belirtir.

---

## INTERFACES

### TopicPageProps
- `slug?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: TopicPage.tsx::TopicPage
- **params**: `(propSlug)` — Sayfaya dışarıdan gelen opsiyonel topic slug'ı
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu, sayfadaki tüm metinleri çevirir
  - `params` — useParams hook'undan dönen URL parametreleri nesnesi
  - `currentSlug` — Aktif topic slug'ı; propSlug varsa onu, yoksa params.slug'ı kullanır
  - `base` — Çeviri anahtarı için temel yol; "knowledge.topics.{currentSlug}" formatında
  - `title` — Mevcut topic'in çevirisi ile elde edilen başlık
  - `exists` — Topic'in var olup olmadığını belirleyen boolean; currentSlug ve title kontrolü
  - `rawSteps` — Topic'in adım listesini içeren hammadde veri (dizi veya string olabilir)
  - `steps` — İşlenmiş adım listesi; rawSteps dizi ise onu, değilse boş dizi kullanır
  - `rawPitfalls` — Topic'in tuzak listesini içeren hammadde veri (dizi veya string olabilir)
  - `pitfalls` — İşlenmiş tuzak listesi; rawPitfalls dizi ise onu, değilse boş dizi kullanır
- **Dönüş**: JSX elementi (React.FC) — Topic içeriği veya "bulunamadı" sayfası

### [N2_NASIL] AST Pointer: TopicPage.tsx::stepsCallback
- **params**: `(s: string, i: number)` — `s`: Tek bir adım metni, `i`: Adımın dizideki indeks numarası
- **ic_degiskenler**: (yok — parametreler doğrudan JSX'te kullanılır)
- **Dönüş**: JSX elementi — Her adım için gösterilecek div bileşeni

### [N3_NASIL] AST Pointer: TopicPage.tsx::pitfallsCallback
- **params**: `(s: string, i: number)` — `s`: Tek bir tuzak/tavsiye metni, `i`: Tuzak listesindeki indeks numarası
- **ic_degiskenler**: (yok — parametreler doğrudan JSX'te kullanılır)
- **Dönüş**: JSX elementi — Her tuzak için gösterilecek div bileşeni

---

## NODE ID STANDARD

  file: src\views\knowledge\TopicPage.tsx
  function: src\views\knowledge\TopicPage.tsx::TopicPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: TopicPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`, `tracking-hvac-loose`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50/30`, `bg-amber-500`, `bg-cyan-500`, `bg-cyan-500/10`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `border-amber-100/50`, `border-cyan-500/20`, `border-slate-100`, `border-slate-200`, `hover:bg-cyan-600`, `hover:bg-slate-50`, `hover:text-slate-950`, `hover:text-white`
- **Layout:** `absolute`, `flex`, `flex-col`, `gap-12`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `grid`, `h-1.5`, `h-20`, `h-8`, `inline-flex`, `items-center`, `justify-center`
- **Varyant/Responsive:** `active:`, `dark:`, `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `active:scale-95`, `border`, `dark:prose-invert`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `group`, `group-hover:scale-150`, `group-hover:translate-x-2`, `inset-0`, `leading-relaxed`, `leading-tight`, `lg:px-8`, `mb-10`