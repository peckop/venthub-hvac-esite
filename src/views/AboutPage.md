---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AboutPage.tsx
skeleton_hash: 6d7ff9843f8624af
entity_hashes:
  func:AboutPage: 7a07cf459964f7ab
  func:t: 470aecfc62464333
  overview: 1c6f01c6be3af64e
  style_tokens: 6526e41f4914ea4c
generated_at: 2026-06-08T10:10:58Z
---

## Genel Bakış
VentHub HVAC projesinin "Hakkında" sayfasını sunan, dil destekli bir React bileşenidir. Modülün temel sorumluluğu, sayfanın arayüz yapısını oluşturmak ve belirli bir dile göre çevrilmiş metin içeriğini göstermektir.

## Fonksiyon Grupları
### Sayfa Oluşturma ve Görüntüleme
Bu grup, "Hakkında" sayfasının ana yapısını ve bileşenini oluşturur.
- AboutPage

### Çeviri ve Yerelleştirme Yönetimi
Bu grup, sayfa içindeki dinamik metinlerin farklı dillere göre çevrilmesini ve gösterilmesini sağlar.
- t

---

## AXIOMS – Mimari Varsayımlar

Bu modül, çeviri destekli bir React bileşenidir ve `lang` parametresi ile dil seçimini, `t` fonksiyonu ile çok dilli metin gösterimini yönetir.

[Aksiyom 1]: Eğer `t` çeviri fonksiyonu (veya bağlı olduğu çeviri sistemi) çağrılamazsa veya geçerli bir çeviri anahtarı döndüremezse, sayfanın metin içeriği eksik veya hatalı görünür.

[Aksiyom 2]: Eğer `lang` parametresi olarak sağlanan değer, çeviri sistemi tarafından desteklenmeyen bir dil kodu ise, `t` fonksiyonu geçerli bir çeviri sağlayamaz ve sayfa içeriği hatalı olur.

[Aksiyom 3]: Eğer `lang` parametresi hiç sağlanmazsa, varsayılan değer olarak `'tr'` kullanılır ve sayfa Türkçe içerikle gösterilir.

[Aksiyom 4]: `t` fonksiyonu çağrılmadan önce, bir dil bağlamı (`lang`) ile ilişkilendirilmiş olmalıdır; aksi halde geçerli bir çeviri döndüremez.

[Aksiyom 5]: Eğer `lang` parametresi `null`, `undefined` veya boş string (`''`) olarak atanırsa, çeviri sistemi geçerli bir dil algılayamaz ve metin gösterimi başarısız olur.

---

## FONKSİYON DETAYLARI

### AboutPage
**Ne yapar**: Uygulamanın "Hakkında" sayfasını oluşturup tarayıcıda gösteren bir React fonksiyonel bileşenidir. Kullanıcıya projenin veya uygulamanın genel bilgilerini sunar.

**Nasıl yapar**: Fonksiyon, React bileşeni olarak tanımlanmıştır ve props olarak `lang` parametresini alır. `lang` parametresi, sayfanın hangi dilde görüntüleneceğini belirler; bu parametre verilmezse varsayılan olarak `'tr'` (Türkçe) kullanılır. Bileşen, muhtemelen ilgili dil seçeneğine göre sayfa içeriğini render eder, ancak iç yapısı verilmemiştir.

**Parametreler**:
- `lang`: string — Sayfanın görüntüleneceği dil kodunu belirtir. Örneğin `'tr'` Türkçe, `'en'` İngilizce içindir. Opsiyonel bir parametredir ve verilmezse `'tr'` değerini alır.

**Dönüş**: `React.FC<AboutPageProps>` tipinde bir React bileşeni döndürür. `AboutPageProps` tipi, bu fonksiyonun kabul ettiği prop'ların yapısını tanımlayan bir arayüzdür, ancak bu arayüzün detayları verilmemiştir.

### t
**Ne yapar**: Uygulama içinde kullanılan bir çeviri (i18n) fonksiyonudur. Verilen bir metin anahtarına karşılık gelen dil çevirisini sözlük nesnesinden bulup döndürür.

**Nasıl yapar**: Fonksiyon, `key` parametresini nokta (`.`) karakterine göre bir diziye böler. Bu dizi, iç içe geçmiş bir sözlük yapısında (`dict`) arama yapmak için kullanılır. Döngüyle her bir anahtar parçasını kontrol ederek `current` değişkenini günceller. Arama sırasında herhangi bir seviyede anahtar bulunamazsa, orijinal `key`字符串i döndürür. Eğer tüm parçalar başarıyla eşleşirse ve sonuç bir `string` ise bu çeviriyi, değilse yine orijinal `key`'i döndürür.

**Parametreler**:
- `key`: string — Çevirisi istenen metnin anahtarı. Nokta ile ayrılmış iç içe yapıları temsil edebilir (örneğin `'menu.home'`). Bu anahtar, `dict` nesnesinde aranacak yolu belirtir.

**Dönüş**: `string` tipinde bir değer döndürür. Bulunan çeviri metni veya herhangi bir eşleşme olmaması durumunda girdiğimiz orijinal `key`字符串i geri verir.

---

## INTERFACES

### AboutPageProps
- `lang?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/AboutPage.tsx::AboutPage
- **params**: `lang` — sayfanın dilini belirler, varsayılan 'tr'
- **ic_degiskenler**:
  - `dict` — Lang parametresine göre ('tr' veya 'en') kullanılacak dil sözlüğünü tutar
  - `t` — Verilen bir anahtar ile (örn: 'aboutPage.heroTitle') dil sözlüğünden karşılık gelen metni döndüren çeviri fonksiyonudur. Anahtar bulunamazsa anahtarın kendisini döndürür.
  - `stats` — Sayfadaki istatistik bölümünde gösterilecek 4 veri nesnesi (değer, etiket, ikon) dizisi
  - `coreValues` — Sayfadaki temel değerler bölümünde gösterilecek 3 değer nesnesi (başlık, açıklama, ikon) dizisi
- **Dönüş**: Sayfanın tamamını temsil eden bir React JSX elementi (min-h-screen bg-white class'lı div). Sayfa; bir hero bölümü, istatistik ızgarası, hikaye/felsefe bölümü, yetkili marka şeridi, değerler ızgarası ve bir çağrı (CTA) bölümü içerir.

### [N2_NASIL] AST Pointer: src/views/AboutPage.tsx::t
- **params**: `key` — Çevirisi istenen metnin nokta ile ayrılmış anahtarı (örn: 'aboutPage.heroTitle')
- **ic_degiskenler**:
  - `parts` — Anahtarın nokta (`.`) karakterine göre bölünmüş hali (dizi)
  - `current` — Sözlük içinde gezinirken mevcut seviyeyi tutan değişken. Başlangıçta `dict` nesnesidir
  - `obj` — `current` değişkeninin `Record<string, unknown>` tipine zorlanmış hali, bir sonraki seviyeye geçmek için kullanılır
- **Dönüş**: string — `key` anahtarının sözlükteki karşılığı veya bulunamadığında `key`'nin kendisi.

---

## NODE ID STANDARD

  file: src\views\AboutPage.tsx
  function: src\views\AboutPage.tsx::AboutPage
  function: src\views\AboutPage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: AboutPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`, `tracking-hvac-loose`, `tracking-hvac-relaxed`, `tracking-hvac-wide`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-cyan-500/10`, `bg-gradient-to-b`, `bg-slate-200`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `bg-white/5`, `border-4`, `border-b`, `border-cyan-500/20`, `border-slate-100`, `border-slate-200`, `border-white`, `border-white/10`
- **Layout:** `absolute`, `backdrop-blur-sm`, `flex`, `flex-col`, `flex-wrap`, `from-transparent`, `gap-12`, `gap-16`, `gap-24`, `gap-3`, `gap-6`, `gap-8`, `grid`, `grid-cols-2`, `h-12`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-space-x-4`, `animate-pulse`, `aspect-square`, `border`, `brightness-0`, `brightness-50`, `duration-1000`, `duration-500`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `grayscale`, `group`