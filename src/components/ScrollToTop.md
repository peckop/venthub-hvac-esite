---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ScrollToTop.tsx
skeleton_hash: 1cdd60ce3f775483
entity_hashes:
  func:ScrollToTop: 67a45bb41004286e
  overview: 3fbf0b01314ba145
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:32Z
---

## Genel Bakış
Venthub HVAC projesinin ön yüzünde yer alan ScrollToTop modülü, React tabanlı bir kullanıcı arayüzü bileşenidir. Uygulama içindeki yönlendirme (rota) değişikliklerini algılayarak pencerenin kaydırma konumunu otomatik olarak sayfanın en üstüne taşır, böylece yeni sayfa içeriği her zaman en baştan görüntülenerek kullanıcı deneyimi iyileştirilir.

## Fonksiyon Grupları
### Ana Kaydırma Yönetimi Bileşeni
Modülün tüm sorumluluğunu üstlenen tek ana bileşendir, uygulama içindeki rota değişikliklerini dinleyerek pencerenin kaydırma konumunu sıfırlar. Yeni sayfa yüklendiğinde kullanıcının içeriğe en baştan başlamasını sağlayacak şekilde çalışır.
- ScrollToTop

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React rota (routing) sistemiyle birlikte çalışarak sayfa değişimlerinde kaydırma pozisyonunu sıfırlayan bir UI bileşenidir. Aşağıdaki varsayımlar, fonksiyon gövdesinden ve eski dokümandan türetilen yapısal gerekliliklerdir.

**[Aksiyom 1]:** Eğer React Router (`useLocation` veya eşdeğeri) bağlamı mevcut değilse, bileşen rota değişikliklerini algılayamaz ve kaydırma sıfırlama işlemi hiçbir zaman tetiklenmez.

**[Aksiyom 2]:** Eğer `window` nesnesi veya DOM erişimi (tarayıcı ortamı) yoksa, bileşen kaydırma konumunu (`window.scrollTo` veya `scrollTop`) değiştiremez ve sayfa en üste taşınmaz.

**[Aksiyom 3]:** Eğer bileşen React Hook yaşam döngüsünün (`useEffect`) dışında render edilirse veya uygun bağımlılık dizisi (dependency array) sağlanmazsa, rota değişiklikleri dinlenemez; yalnızca ilk yüklemede kaydırma gerçekleştirilir.

**[Aksiyom 4]:** Eğer bileşen `<Router>` veya `<BrowserRouter>` hiyerarşisi dışında mount edilirse, rota bağlamı (`location`) boş veya geçersiz olur ve kaydırma sıfırlama tetiklenemez.

---

## FONKSİYON DETAYLARI

### ScrollToTop
**Ne yapar**: Uygulama içerisindeki rota değişiklikleri sırasında sadece tarayıcı geçmişine yeni bir giriş ekleyen PUSH tipi rota aksiyonlarında sayfayı anında en üste kaydırır. Geri dönüş gibi POP tipi rota değişikliklerinde hiçbir işlem yapmaz, tarayıcının kendi yerleşik kaydırma konumu geri yükleme (native scroll restorasyon) özelliğinin sorunsuz çalışmasına izin verir. Bu sayede yeni sayfalara geçildiğinde kullanıcılar sayfanın en başından başlamayı, önceki sayfalara döndüğünde ise kaldıkları konumdan devam etmeyi deneyimler.
**Nasıl yapar**: Rota değişikliklerini sürekli dinleyen bir yapı üzerinden çalışır, gelen değişikliğin aksiyon türünü ayırt ederek işlem akışını yönlendirir. Sadece PUSH tipi aksiyonlar algılandığında pencereyi 0, 0 koordinatlarına kaydırma işlemini tetikler, POP tipi aksiyonlarda herhangi bir scroll manipülasyonu yapmaz. Bu yaklaşım, modern tek sayfa uygulamalarında sıkça karşılaşılan tutarsız kaydırma konumu sorunlarını ortadan kaldırmak için tasarlanmıştır.
**Parametreler**:
- Herhangi bir parametre almaz. Fonksiyon kendi çalışma mantığını dahili rota dinleme mekanizmasından edindiği verilerle yürütür, harici bir giriş parametresi gerektirmez.
**Dönüş**: Dönüş tipi belirsizdir, muhtemelen void olarak tanımlanmıştır. Fonksiyon herhangi bir değer döndürmez, tek yan etkisi PUSH tipi rota değişikliklerinde tetiklediği pencere kaydırma işlemidir, başka bir işlemde kullanılmak üzere herhangi bir veri veya nesne üretmez.

---

## İTHALATLAR (IMPORTS)
- import: next/navigation::usePathname
- import: react::useLayoutEffect

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ScrollToTop.tsx::ScrollToTop
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `pathname` — Next.js `usePathname` hook'u ile alınan mevcut sayfanın yol değeri, useLayoutEffect bağımlılık listesinde kullanılarak yol değiştiğinde efektin tetiklenmesini sağlar
  - `usePathname` — Next.js'in aktif sayfa yolunu almak için çağrılan hook fonksiyonu
  - `useLayoutEffect` — React'in DOM güncellemelerinden hemen sonra çalışan efekt hook'u, pathname değiştiğinde scroll sıfırlama işlemini yönetmek için kullanılır
  - `[pathname]` — useLayoutEffect'in bağımlılık dizisi, yalnızca pathname değiştiğinde efektin yeniden çalışmasını sağlar
- **Dönüş**: null, React bileşeni olarak herhangi bir DOM öğesi render etmez

---

## NODE ID STANDARD

  file: src\components\ScrollToTop.tsx
  function: src\components\ScrollToTop.tsx::ScrollToTop

---

## DISA AKTARILANLAR (EXPORTS)
  export: ScrollToTop

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)