---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\SpotlightList.tsx
skeleton_hash: 8b7b0b4d8c4518b8
generated_at: 2026-05-23T22:27:36Z
---

## Genel Bakış
Venthub HVAC projesinin React tabanlı arayüzünde kullanılan bu modül, odaklanmış (spotlight) liste bileşenini barındırır. Kullanıcıların listedeki öğelerle etkileşim kurmasını, özellikle öğeleri taşımasını destekleyen temel işlevleri sunar. Tekrar kullanılabilir bir yapıda tasarlanan bu bileşen, arayüzde listeleme işlemleri için merkezî bir çözüm sunar.

## Fonksiyon Grupları
### Ana Bileşen
Modülün ana giriş noktası olarak odaklanmış liste arayüzünü oluşturur, listenin sayfada render edilmesini ve tüm temel yapının kurulmasını sağlar.
- SpotlightList

### Kullanıcı Etkileşimi İşleyicileri
Liste üzerinde gerçekleşen fare hareketleri gibi kullanıcı etkileşimlerini yakalayıp işler, liste öğelerinin taşınması gibi dinamik işlemlerin sorunsuz çalışmasını sağlar.
- onMove

---

## AXIOMS – Mimari Varsayımlar
Bu React UI bileşeni, üst bileşenler tarafından iletilen prop'lar, proje içindeki bağımlı bileşenlerin erişilebilirliği ve çalışma ortamının temel web API'lerini desteklemesi koşuluyla çalışan, spotlight listeleme ve kullanıcı etkileşimlerini yöneten bir istemci tarafı bileşenidir.

[Aksiyom 1]: Eğer üst bileşen tarafından SpotlightList'e listelenecek spotlight öğelerinin verisi prop olarak iletilmezse, bileşen boş olarak render edilir ve hiçbir liste öğesi kullanıcıya görüntülenmez.
[Aksiyom 2]: Eğer olay işleyicisi `onMove` üst bileşen tarafından prop olarak bu bileşene iletilmezse, kullanıcının listedeki öğeleri taşıma/sıralama gibi etkileşimleri hiçbir sonuca yol açmaz.
[Aksiyom 3]: Eğer `onMove` fonksiyonuna parametre olarak iletilen `e` (olay) nesnesi, beklenen fare/dokunmatik olay özelliklerini barındırmazsa, listedeki öğelerin konum veya sıra güncellemesi hatalı hesaplanır, taşıma işlemi başarısız olur.
[Aksiyom 4]: Eğer bu bileşenin bağımlı olduğu alt React bileşenleri proje içinde erişilebilir olmazsa, SpotlightList derleme aşamasında hata verir, uygulama başarılı bir şekilde build edilemez.
[Aksiyom 5]: Eğer bu modülün çalıştığı tarayıcı ortamında temel DOM manipülasyon API'leri erişilebilir olmazsa, SpotlightList bileşeni sayfaya mount olmaz ve hiçbir şekilde kullanıcı tarafından erişilemez.

---

## FONKSIYON DETAYLARI

### SpotlightList
**Ne yapar**: VentHub HVAC projesinin `src/components/SpotlightList.tsx` dosyasında yer alan ana React fonksiyonel bileşenidir. Kullanıcı arayüzünde odaklanabilir (spotlight) nitelikteki liste öğelerini düzenli olarak görüntülemekten ve bu öğelerle gerçekleştirilecek tüm kullanıcı etkileşimlerini koordine etmekten sorumludur. HVAC sistemiyle ilgili öne çıkan içeriklerin listelendiği özel bir arayüz bileşeni olarak çalışır.
**Nasıl yapar**: React bileşen mimarisine uygun olarak, kendi içinde tanımladığı yerel durumlar ve yardımcı işlevlerle tüm liste yapısını tarayıcı DOM'ına render eder. İçerdiği tüm spot öğelerinin sıralanmasını ve görüntülenmesini yönetir, fare hareketi gibi etkileşimleri işleyen `onMove` gibi olay işleyicilerini ilgili DOM elemanlarına bağlayarak etkileşimli bir yapı oluşturur. Projede içe aktardığı harici bağımlılıkları kullanarak liste performansını ve kullanılabilirliğini artırıcı düzenlemeler gerçekleştirir.
**Parametreler**: Bu fonksiyonel bileşen herhangi bir harici parametre almaz, tüm işlevselliğini kendi içinde tanımladığı yerel state ve yardımcı işlevler üzerinden yürütür.
**Dönüş**: `React.FC` türünde, React tarafından işlenip DOM'a eklenebilen bir JSX öğesi döndürür. Bu dönüş değeri, SpotlightList bileşeninin tüm içeriğinin kullanıcı arayüzünde sorunsuz bir şekilde görüntülenmesini sağlar.

### onMove
**Ne yapar**: SpotlightList bileşeni içinde tanımlanan, fare hareketi olaylarını yöneten özel React olay işleyicisidir. İlgili HTML div elemanı üzerinde gerçekleşen fare taşıma, sürükleme gibi etkileşimleri algılayıp bu etkileşimlere uygun olarak liste görünümünü veya liste öğelerinin konumunu güncellemekle sorumludur. Kullanıcıların liste öğeleriyle etkileşim kurmasını sağlayan temel işlevlerden biridir.
**Nasıl yapar**: Tetiklendiği fare olayı nesnesinin içerdiği tüm verileri okuyarak, olayın gerçekleştiği konum, kaynak eleman gibi bilgileri işler. Elde ettiği verileri SpotlightList bileşeninin yerel state'ine yansıtarak ilgili görsel veya mantıksal güncellemeleri tetikler. React'in standart olay yönetimi prensiplerine uygun olarak çalışarak, gerektiğinde olay varsayılanlarını engellemek veya olayın üst elemanlara yayılmasını durdurmak gibi ek işlemler de gerçekleştirebilir.
**Parametreler**:
- e: React.MouseEvent<HTMLDivElement> — Fare hareketi olayının tüm detaylarını barındıran olay nesnesidir. Olayın tetiklendiği HTML div elemanı, fare imlecinin ekrandaki konumu, basılı tuşlar gibi tüm etkileşim verilerini içerir.
**Dönüş**: `React.MouseEventHandler<HTMLDivElement>` türünde çalıştırılabilir bir olay işleyicisi döndürür. Bu dönen işleyici, ilgili div elemanının fare hareketi olaylarına yanıt olarak tetiklenebilir hale gelir, liste üzerindeki tüm fare tabanlı etkileşimlerin doğru şekilde yönetilmesini sağlar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\SpotlightList.tsx::SpotlightList
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, arayüz metinlerini yerelleştirmek için kullanılır
  - `ref` — useRef ile oluşturulmuş, spotlight efektinin uygulandığı ana grid div elementine referans tutan React ref nesnesi
  - `ITEMS` - spotlight bölümünde gösterilecek ürün kartlarının tüm verilerini tutan sabit dizi, her elemanında ürün başlığı, açıklaması ve yönlendirme bağlantısı bulunur
  - `onMove` - fare hareketlerini dinleyerek spotlight efektinin konumunu güncelleyen mouse event handler fonksiyonu
- **Dönüş**: Tüm spotlight bölümünü oluşturan JSX React elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\SpotlightList.tsx::onMove
- **params**: `e` — Fare hareket olayını temsil eden React.MouseEvent<HTMLDivElement> tipinde olay nesnesi
- **ic_degiskenler**:
  - `el` — Ana grid div elementine erişmek için ref.current'ten alınan DOM elementi
  - `rect` — `el.getBoundingClientRect()` ile elde edilen, elementin viewport içindeki konum ve boyutlarını içeren nesne
  - `x` — Fare konumuna göre hesaplanan yüzdelik x koordinatı, CSS `--sx` değişkenine atanır
  - `y` — Fare konumuna göre hesaplanan yüzdelik y koordinatı, CSS `--sy` değişkenine atanır
- **Dönüş**: void (DOM elementi mevcut değilse erken return, aksi takdirde sadece CSS özelliklerini ayarlar, değer döndürmez)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\SpotlightList.tsx::ITEMS.mapCallback
- **params**: `it` — ITEMS dizisindeki her bir ürün kartı verisini temsil eden nesne
- **ic_degiskenler**:
  - `it.title` — Ürün kartının başlığını tutan dize, kartın ana başlığı olarak kullanılır
  - `it.desc` — Ürün kartının açıklama metnini tutan dize, kartın alt metni olarak kullanılır
  - `it.href` — Ürün kartı tıklandığında yönlendirileceği yol adresini tutan dize
- **Dönüş**: Her ürün kartı için oluşturulmuş <a> etiketli JSX React elementi

---

## NODE ID STANDARD

  file: src\components\SpotlightList.tsx
  function: src\components\SpotlightList.tsx::SpotlightList
  function: src\components\SpotlightList.tsx::onMove

---

## DISA AKTARILANLAR (EXPORTS)
  export: SpotlightList