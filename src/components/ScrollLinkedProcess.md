---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ScrollLinkedProcess.tsx
skeleton_hash: c25957b394b2bf51
entity_hashes:
  func:ScrollLinkedProcess: 5a92a40886643dd7
  func:scrollTo: ee292d22ad2f3df1
  overview: a4bd4fd5da1416a4
  style_tokens: dffb84eddfacefbd
generated_at: 2026-06-08T10:08:35Z
---

## Genel Bakış
venthub-hvac projesinde kullanılan bu React modülü, kullanıcı arayüzündeki süreç adımlarını sayfa kaydırma konumuyla senkronize eden bir bileşen sunar. Temel amacı, süreç akışları boyunca kullanıcının gezinmesini kolaylaştırmak, mevcut kaydırma konumuna göre ilgili adımı odaklamaktır. Modül hem kullanıma hazır ana bileşeni hem de kaydırma işlemini yöneten yardımcı işlevi tek bir yapıda toplar.

## Fonksiyon Grupları
### Ana Süreç Bileşeni
Projede diğer bileşenler tarafından entegre edilebilen, tüm kaydırma bağlantılı süreç işlevselliğini yöneten ana React bileşenidir. Süreç akışlarını kullanıcının sayfa kaydırma eylemleriyle ilişkilendirerek sorunsuz bir gezinme deneyimi sunar.
- ScrollLinkedProcess

### Kaydırma Senkronizasyonu Yardımcısı
İstenen sıra numaralı süreç adımına otomatik kaydırma işlemini gerçekleştiren yardımcı işlevdir. Ana bileşen tarafından çağrılarak aktif kaydırma konumu ile görüntülenen süreç adımının her zaman senkronize kalmasını sağlar.
- scrollTo

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı ScrollLinkedProcess modülü, aynı sayfa içindeki sıralı süreç adımları arasında bağlantılı kaydırma işlevi sağlar, çalışması için React runtime ortamı ve tarayıcının DOM API'lerine erişimi zorunludur.

[Aksiyom 1]: Eğer modülün çalışacağı React runtime ortamı (bileşenlerin mount edilmesine izin veren çalışma zamanı) yoksa, ScrollLinkedProcess bileşeni hiç yüklenmez, süreçler arası kaydırma işlevi hiç kullanılamaz.
[Aksiyom 2]: Eğer tarayıcının DOM kaydırma API'lerine (window.scroll, DOM elemanlarının scroll özellikleri) erişimi kısıtlanmışsa, scrollTo(i: number) fonksiyonu hedef indeksteki süreç adımına kaydırma işlemini gerçekleştiremez, kullanıcı manuel kaydırma yapmak zorunda kalır.
[Aksiyom 3]: Eğer ScrollLinkedProcess bileşeni ile eşleşen, 0'dan başlayan sıralı indekse sahip süreç adımı DOM elemanları sayfaya eklenmemişse, scrollTo fonksiyonu i parametresi ile geçerli bir hedef bulamaz, kaydırma işlemi başarısız olur.
[Aksiyom 4]: Eğer scrollTo(i: number) fonksiyonuna i olarak negatif sayı veya mevcut toplam süreç sayısından büyük bir sayı gönderilirse, modül geçersiz bir hedefe kaydırma girişiminde bulunur, ya hiç kaydırma yapmaz ya da tanımsız bir konuma kayar.

---

## FONKSİYON DETAYLARI

### ScrollLinkedProcess
**Ne yapar**: VentHub HVAC projesinde süreç adımlarını tarayıcı kaydırma hareketleriyle ilişkilendiren React bileşeni üreten bir fabrika fonksiyonudur. Proje içindeki süreç takibi arayüzlerinin aktif adımını sayfa kaydırmasıyla senkronize tutmak için özel olarak tasarlanmıştır, kullanıcıların süreç akışını takip etmesini kolaylaştırır.
**Nasıl yapar**: İçinde tarayıcının yerleşik scroll olay dinleyicilerini kullanarak sayfa üzerindeki tüm süreç adımı elementlerinin konumlarını sürekli olarak takip eder, bu konum verilerine göre o anda görünür olan aktif süreci belirleyen bir React bileşeni döndürür. Aynı zamanda bünyesinde barındırdığı scrollTo yardımcı fonksiyonu ile programlı olarak da istenen adımlara kaydırma desteği sunar.
**Parametreler**: Herhangi bir giriş parametresi almaz.
**Dönüş**: React.FC tipi, proje içinde doğrudan kullanılabilecek bir React fonksiyonel bileşeni döndürür. Bu dönen bileşen, süreç adımlarını listeleyip tüm kaydırma hareketleriyle sürekli senkronize çalışan bir arayüz sunar.

### scrollTo
**Ne yapar**: ScrollLinkedProcess bileşeni bünyesinde çalışan, verilen indeksteki süreç adımına programlı olarak sayfayı kaydıran yardımcı fonksiyondur. Kullanıcıların ara yüzdeki gezinme butonları veya benzeri etkileşimler aracılığıyla istedikleri süreç adımına hızlıca geçmesini sağlamak amacıyla geliştirilmiştir.
**Nasıl yapar**: DOM ağacında ilgili indeksteki süreç adımı elementinin konum verilerini çeker, tarayıcının yerleşik kaydırma API'lerini kullanarak sayfayı ilgili elementin konumuna taşır. Aynı zamanda ScrollLinkedProcess'in yönettiği aktif adım durumunu da güncelleyerek arayüzdeki aktif adım göstergesinin doğru şekilde çalışmasını garanti eder.
**Parametreler**:
- i: number — Kaydırma işleminin hedefi olan süreç adımının sıfır tabanlı sıra numarasını (indeks) tutan sayı tipi değer
**Dönüş**: void, herhangi bir değer döndürmez, yalnızca kaydırma işlemini ve ilgili durum güncellemelerini gerçekleştirir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ScrollLinkedProcess.tsx::ScrollLinkedProcess
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, tüm UI metinlerinin çevirisini getirmek için kullanılır
  - `active` — görünür haldeki adımın indeksini tutan state değişkeni, kenar çubuğu butonlarının stillendirilmesinde kullanılır
  - `setActive` — `active` state'ini güncellemek için kullanılan state setter fonksiyonu
  - `refs` — tüm ana içerik adım bölümlerinin DOM referanslarını tutan useRef nesnesi, scroll ve IntersectionObserver işlemleri için kullanılır
  - `STEPS` — tüm süreç adımlarının anahtar, başlık, açıklama verilerini içeren sabit dizi, kenar çubuğu ve ana içerik oluşturulurken kullanılır
- **Dönüş**: JSX React elementi (scroll bağlı süreç bölümünü oluşturan bileşen çıktısı)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ScrollLinkedProcess.tsx::useEffect_cleanup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `io` — Bileşen mount edilirken oluşturulan IntersectionObserver instance'ı, bileşen unmount olurken observer'ı kapatmak için kullanılır
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ScrollLinkedProcess.tsx::io_observer_callback
- **params**: [entries: IntersectionObserverEntry[]]
- **ic_degiskenler**:
  - `sections` — Geçerli tüm DOM referanslarından oluşan HTMLDivElement dizisi, hedef bölümün indeksini bulmak için kullanılır
  - `setActive` — Görünen bölüm tespit edildiğinde aktif adım state'ini güncellemek için kullanılan state setter
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ScrollLinkedProcess.tsx::entries_forEach_callback
- **params**: [e: IntersectionObserverEntry]
- **ic_degiskenler**:
  - `sections` — Tüm geçerli DOM bölümlerinden oluşan dizi, hedef bölümün indeksini bulmak için kullanılır
  - `setActive` — Görünen bölümün indeksi ile aktif adım state'ini güncellemek için kullanılan setter
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ScrollLinkedProcess.tsx::scrollTo
- **params**: [i: number]
- **ic_degiskenler**:
  - `refs.current[i]` — `i` indeksli ana içerik bölümünün DOM referansı, o bölüme yumuşak kaydırma yapmak için kullanılır
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ScrollLinkedProcess.tsx::steps_map_sidebar_button_callback
- **params**: [s: STEPS öğesi nesnesi, i: number]
- **ic_degiskenler**:
  - `s.key` - React listesi için benzersiz anahtar değeri
  - `s.title` - Kenar çubuğu butonunun başlık metni
  - `s.desc` - Kenar çubuğu butonunun açıklama metni
  - `i` - Adımın sıralama indeksi
  - `active` - Şu anki aktif adımın indeksi, butonun stillendirilmesinde kullanılır
  - `scrollTo` - Butona tıklandığında ilgili ana içerik bölümüne kaydırmak için çağrılan fonksiyon
- **Dönüş**: JSX buton elementi

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ScrollLinkedProcess.tsx::steps_map_main_section_callback
- **params**: [s: STEPS öğesi nesnesi, i: number]
- **ic_degiskenler**:
  - `s.key` - React listesi için benzersiz anahtar değeri
  - `el` - Oluşturulan bölüm div'inin DOM referansı
  - `refs.current[i]` - `i` indeksli bölümün referansını saklamak için atanan değişken
  - `s.title` - Bölüm başlık metni
  - `s.desc` - Bölüm açıklama metni
  - `t` - Çeviri fonksiyonu, adım numarası ön ekini almak için kullanılır
- **Dönüş**: JSX bölüm div elementi

---

## NODE ID STANDARD

  file: src\components\ScrollLinkedProcess.tsx
  function: src\components\ScrollLinkedProcess.tsx::ScrollLinkedProcess
  function: src\components\ScrollLinkedProcess.tsx::scrollTo

---

## DISA AKTARILANLAR (EXPORTS)
  export: ScrollLinkedProcess

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy/5`, `bg-white`, `border-light-gray`, `border-primary-navy`, `hover:bg-gray-50`, `md:text-3xl`, `text-2xl`, `text-industrial-gray`, `text-left`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-xl`, `text-xs`
- **Layout:** `gap-6`, `grid`, `grid-cols-1`, `lg:col-span-1`, `lg:col-span-3`, `lg:grid-cols-4`, `max-w-7xl`, `p-6`, `shadow-sm`, `sticky`, `top-20`, `w-full`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${i`, `:`, `===`, `active`, `border`, `font-bold`, `font-semibold`, `lg:px-8`, `mb-1`, `mb-2`, `mb-6`, `mx-auto`, `px-3`, `px-4`, `py-12`