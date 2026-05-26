---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ScrollToTop.tsx
skeleton_hash: b72ab5d4ecf79309
generated_at: 2026-05-23T22:27:04Z
---

## Genel Bakış
Venthub HVAC projesinin ön yüzünde yer alan ScrollToTop modülü, React tabanlı bir kullanıcı arayüzü bileşenidir. Uygulama içindeki yönlendirme (rota) değişikliklerini algılayarak pencerenin kaydırma konumunu otomatik olarak sayfanın en üstüne taşır, böylece yeni sayfa içeriği her zaman en baştan görüntülenerek kullanıcı deneyimi iyileştirilir.

## Fonksiyon Grupları
### Ana Kaydırma Yönetimi Bileşeni
Modülün tüm sorumluluğunu üstlenen tek ana bileşendir, uygulama içindeki rota değişikliklerini dinleyerek pencerenin kaydırma konumunu sıfırlar. Yeni sayfa yüklendiğinde kullanıcının içeriğe en baştan başlamasını sağlayacak şekilde çalışır.
- ScrollToTop

---

## AXIOMS – Mimari Varsayımlar
Bu frontend ScrollToTop bileşeni, uygulama içi istemci tarafı rota değişiklikleri algılandığında görünür pencerenin scroll pozisyonunu en üste taşımak üzere tasarlanmıştır, doğru çalışması için uygulama mimarisi ve platform erişim koşullarının tamamının sağlanması zorunludur.

[Aksiyom 1]: Eğer projede React Router veya benzeri istemci tarafı yönlendirme kütüphanesinin location değişikliğini izleyen entegrasyonu yoksa, rota geçişleri algılanamaz ve scroll pozisyonu hiçbir zaman sıfırlanmaz.
[Aksiyom 2]: Eğer bileşen çalıştığı ortamda tarayıcının window nesnesi ve scrollTo() DOM API'sine erişemiyorsa (sunucu tarafı render (SSR) sırasında olduğu gibi), scroll işlemi gerçekleştirilemez ve uygulama çalışma zamanı hatası alır.
[Aksiyom 3]: Eğer bu bileşen uygulamanın tüm rota değişikliklerini izleyebileceği bir üst seviye konumda (kök route bileşeni altı gibi) konumlandırılmamışsa, rota geçişlerini yakalayamaz ve görevini yerine getiremez.
[Aksiyom 4]: Eğer proje içinde React'in temel hook'ları (özellikle rota değişikliği sonrası işlemleri tetikleyen useEffect) çalışmayacak şekilde bir yapı bozukluğu varsa, scroll sıfırlama işlemi hiçbir zaman aktif olmaz.

---

## FONKSIYON DETAYLARI

### ScrollToTop
**Ne yapar**: Uygulama içerisindeki rota değişiklikleri sırasında sadece tarayıcı geçmişine yeni bir giriş ekleyen PUSH tipi rota aksiyonlarında sayfayı anında en üste kaydırır. Geri dönüş gibi POP tipi rota değişikliklerinde hiçbir işlem yapmaz, tarayıcının kendi yerleşik kaydırma konumu geri yükleme (native scroll restorasyon) özelliğinin sorunsuz çalışmasına izin verir. Bu sayede yeni sayfalara geçildiğinde kullanıcılar sayfanın en başından başlamayı, önceki sayfalara döndüğünde ise kaldıkları konumdan devam etmeyi deneyimler.
**Nasıl yapar**: Rota değişikliklerini sürekli dinleyen bir yapı üzerinden çalışır, gelen değişikliğin aksiyon türünü ayırt ederek işlem akışını yönlendirir. Sadece PUSH tipi aksiyonlar algılandığında pencereyi 0, 0 koordinatlarına kaydırma işlemini tetikler, POP tipi aksiyonlarda herhangi bir scroll manipülasyonu yapmaz. Bu yaklaşım, modern tek sayfa uygulamalarında sıkça karşılaşılan tutarsız kaydırma konumu sorunlarını ortadan kaldırmak için tasarlanmıştır.
**Parametreler**:
- Herhangi bir parametre almaz. Fonksiyon kendi çalışma mantığını dahili rota dinleme mekanizmasından edindiği verilerle yürütür, harici bir giriş parametresi gerektirmez.
**Dönüş**: Dönüş tipi belirsizdir, muhtemelen void olarak tanımlanmıştır. Fonksiyon herhangi bir değer döndürmez, tek yan etkisi PUSH tipi rota değişikliklerinde tetiklediği pencere kaydırma işlemidir, başka bir işlemde kullanılmak üzere herhangi bir veri veya nesne üretmez.

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

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ScrollToTop.tsx::scrollResetEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isPop` — Geri dönüş (POP) navigasyonu olup olmadığını belirten boolean değişken; önce tarayıcı ortamında çalıştığını kontrol eder, ardından sessionStorage'daki 'vh_is_pop' bayrağının değerini doğrular
  - `typeof window !== 'undefined'` — Sunucu tarafı çalışmalarda window nesnesine erişim hatasını önlemek için yapılan çalışma ortamı kontrolü
  - `sessionStorage.getItem('vh_is_pop')` — Oturum deposundan POP navigasyonu bayrağını okumak için çağrılan tarayıcı API metodu
  - `window.location.hash` — Mevcut sayfa URL'sinde hash anchor'u olup olmadığını kontrol etmek için kullanılan window nesnesinin location özniteliğinin hash değeri
  - `window.scrollTo` — Sayfa kaydırmasını sol üst noktaya getirmek için çağrılan tarayıcı API'si, `{ top: 0, left: 0, behavior: 'auto' }` parametreleri ile anlık kaydırma işlemi gerçekleştirir
- **Dönüş**: Eğer isPop true ise veya URL'de hash varsa erken dönüş yapar, açık bir dönüş değeri yoktur

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
- **Responsive:** (yok)
