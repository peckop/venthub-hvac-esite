---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\knowledge\TopicPage.tsx
skeleton_hash: 0c7e1c369b37db44
generated_at: 2026-05-23T22:40:58Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin bilgi merkezi bölümündeki tekil konu sayfasını oluşturan React tabanlı bir sayfa bileşenidir. Prop olarak aldığı benzersiz konu adresi (slug) üzerinden ilgili içeriği görüntülemek üzere tasarlanmıştır, projenin bilgi tabanı bölümünün temel yapı taşlarından biridir.

## Fonksiyon Grupları
### Ana Konu Sayfası Bileşeni
Bilgi merkezi altındaki belirli bir konunun tüm içeriğini barındıran ve kullanıcıya sunan tek ana bileşendir, gelen URL tabanlı slug parametresini işleyerek sayfanın doğru içerikle yüklenmesini sağlar.
- TopicPage

---

## AXIOMS – Mimari Varsayımlar
Bu React bilgi konusu sayfası bileşeni, kendisine iletilen slug değeriyle eşleşen içeriği kullanıcıya göstermek için tasarlanmıştır, çalışması için modüle ait prop değerlerinin ve erişilmesi gereken harici veri kaynaklarının sorunsuz şekilde iletilmesi/erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer bileşene prop olarak geçerli bir string türünde propSlug değeri iletilmezse, hedef bilgi konusunun verisine erişilemez, sayfa boş içerik veya hata durumu gösterir.
[Aksiyom 2]: Eğer uygulama yönlendirme (routing) mekanizması, kullanıcının eriştiği konu URL'sinden aldığı geçerli slug değerini propSlug olarak bu bileşene iletemezse, kullanıcının talep ettiği konu yerine yanlış veya hiç içerik gösterilemez.
[Aksiyom 3]: Eğer propSlug değeri ile eşleşen bilgi konusu verisini barındıran arka uç servisi/veri deposu bu bileşen tarafından erişilebilir durumda değilse, ilgili konu içeriği sayfada hiçbir zaman yüklenemez.
[Aksiyom 4]: Eğer iletilen propSlug değeri sistemde kayıtlı hiçbir bilgi konusu ile eşleşmiyorsa, mevcut olmayan konu için içerik üretilemez, sayfa doğru hata akışını çalıştıramaz ve kullanıcıya geçerli bir geri bildirim veremez.

---

## FONKSIYON DETAYLARI

### TopicPage
**Ne yapar**: VentHub HVAC projesinin bilgi merkezi bölümünde yer alan, belirli bir konunun içeriğini kullanıcıya sunan React tabanlı sayfa bileşenidir. Gelen benzersiz tanımlayıcıya göre ilgili konu sayfasını yükleyerek kullanıcının erişimine sunar.
**Nasıl yapar**: Bileşene iletilen prop nesnesinden konunun benzersiz URL uyumlu tanımlayıcısı (slug) değerini çıkararak, bu değer üzerinden ilgili konunun meta verilerini ve içeriğini projedeki bilgi tabanından çeker. Tür tanımı gereği sadece TopicPageProps arayüzünde tanımlanmış özellikleri kabul ederek React ekosistemiyle uyumlu bir şekilde çalışır.
**Parametreler**:
- propSlug: string — Bileşene iletilen prop nesnesinden çıkarılan, hedeflenen konunun benzersiz tanımlayıcısı (slug) olan string değeridir. Konunun içeriğine erişim için temel kimlik bilgisi olarak kullanılır.
**Dönüş**: React.FC<TopicPageProps> tipi, TopicPageProps arayüzü tarafından tanımlanan özellikleri kabul eden, ilgili konu içeriğini işleyip kullanıcıya sunan bir React fonksiyonel bileşeni döndürür.

---

## INTERFACES

### TopicPageProps
- `slug?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\TopicPage.tsx::TopicPage
- **params**: [`propSlug` — Konu sayfasına props ile aktarılan benzersiz URL kimliği]
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, tüm metinleri çevirmek için kullanılır
  - `params` — useParams hook'undan alınan Next.js route parametreleri, URL'den gelen slug değerini içerir
  - `currentSlug` - Hem props'tan hem de URL'den gelen geçerli konunun kesinleştirilmiş benzersiz kimliği, iki kaynaktan birini alır
  - `base` — Çeviri anahtarları için kullanılan temel string, tüm konu özelinde çeviri anahtarlarının ortak ön ekini oluşturur
  - `title` — Konunun başlığı, çeviri fonksiyonu ile base anahtarından alınır
  - `exists` — Konunun sistemde var olup olmadığını kontrol eden boolean değer, çevirinin geçersiz olup olmadığını test eder
  - `rawSteps` — Çeviriden alınan ham adımlar listesi, tip kontrolü öncesi ham değeri tutar
  - `steps` — Tip kontrolünden geçirilmiş güvenli adımlar dizisi, eğer rawSteps dizi değilse boş dizi olarak tanımlanır
  - `rawPitfalls` — Çeviriden alınan ham olası hatalar listesi, tip kontrolü öncesi ham değeri tutar
  - `pitfalls` — Tip kontrolünden geçirilmiş güvenli olası hatalar dizisi, eğer rawPitfalls dizi değilse boş dizi olarak tanımlanır
- **Dönüş**: React.JSX.Element (konu sayfasının tüm kullanıcı arayüzü)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\TopicPage.tsx::steps_map_callback
- **params**: [`s: string` — Adımın içerik metni, `i: number` — Adımın dizi içindeki indis numarası]
- **ic_degiskenler**:
  - `s` — Liste içinde gösterilen adımın metin içeriği
  - `i` - React listelemesinde benzersiz anahtar olarak kullanılan adımın sıra numarası
- **Dönüş**: React.JSX.Element (tek bir adımı temsil eden içerik div'i)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\TopicPage.tsx::pitfalls_map_callback
- **params**: [`s: string` — Olası hatanın içerik metni, `i: number` — Olası hatanın dizi içindeki indis numarası]
- **ic_degiskenler**:
  - `s` — Liste içinde gösterilen olası hatanın metin içeriği
  - `i` - React listelemesinde benzersiz anahtar olarak kullanılan hatanın sıra numarası
- **Dönüş**: React.JSX.Element (tek bir olası hatayı temsil eden içerik div'i)

---

## NODE ID STANDARD

  file: src\views\knowledge\TopicPage.tsx
  function: src\views\knowledge\TopicPage.tsx::TopicPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: TopicPage