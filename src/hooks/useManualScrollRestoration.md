---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useManualScrollRestoration.ts
skeleton_hash: 3b3d57951e288ef3
generated_at: 2026-05-23T22:30:12Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin React tabanlı kod yapısında yer alan, manuel scroll konumu geri yüklemesi sağlayan özel React hook'unu barındırır. Tarayıcının varsayılan otomatik scroll davranışını geçersiz kılarak sayfa içeriklerinin yüklenme durumuyla entegre çalışır, içerik güncellemeleri veya sayfa geçişleri sonrası kullanıcının görüntüleme konumunun korunmasını sağlar.

## Fonksiyon Grupları
### Ana Scroll Restorasyon Yönetimi
Tüm scroll pozisyonu kaydetme ve geri yükleme iş mantığını tek noktada yöneten, içerik yükleme durumunu izleyerek uygun zamanda işlemleri tetikleyen ana modül fonksiyonunu barındırır.
- useManualScrollRestoration

---

## AXIOMS – Mimari Varsayımlar
Bu modül, React tabanlı web uygulamalarında sayfa yönlendirmeleri veya yeniden yüklemeleri sonrasında kullanıcının önceki scroll konumunu manuel olarak kaydedip geri yüklemek için tasarlanmış özel bir hook'tur, çalışması için tarayıcı ortamı ve React hook kullanım kurallarına uyulması zorunludur.

[Aksiyom 1]: Eğer hook'a geçirilmesi gereken `loading` parametresi sağlanmazsa veya boolean olmayan bir veri türünde geçirilirse, scroll konumunu geri yükleme tetikleyicisi hiç çalışmaz, modül beklenen işlevselliği sunamaz.
[Aksiyom 2]: Eğer bu hook, React hook kullanım kurallarına aykırı olarak koşullu kod bloklarında, döngülerde veya bileşen kapsamı dışında çağrılırsa, hook'un bağlı olduğu yaşam döngüsü metodları tetiklenmez, scroll konumu ne kaydedilebilir ne de geri yüklenebilir.
[Aksiyom 3]: Eğer modülün çalıştığı ortamda tarayıcının `window`, `scrollTo`, `history` gibi temel DOM API'leri erişilebilir değilse (örneğin sunucu tarafı SSR ortamında bu API'ler olmadan çalıştırılırsa), modül çalışma zamanı hatası fırlatır, hiçbir işlev yerine getiremez.
[Aksiyom 4]: Eğer hook'a geçirilen `loading` parametresi, sayfa içeriğinin tam olarak yüklenme durumunu doğru şekilde yansıtmıyorsa (içerik yüklendiği halde `true` kalması veya yüklenmeden `false` olması), scroll konumu yanlış zamanda uygulanır, kullanıcı beklenmedik ekran konumunda kalır.

---

## FONKSIYON DETAYLARI

### useManualScrollRestoration
**Ne yapar**: Async olarak veri yüklenen sayfalarda "Geri" (POP) navigasyonu sonrası kullanıcının önceki scroll pozisyonunu manuel olarak geri yükler. Tarayıcının kendi native scroll restorasyon özelliğinin yetersiz kaldığı, özellikle skeleton loading gibi gecikmeli içerik yükleme senaryolarında çalışmak üzere tasarlanmıştır. Veri yüklemesi devam ederken scroll restorasyon işlemini beklemede tutar, böylece içerik tam olarak yüklenmeden sayfanın yanlış pozisyona kaydırılması engellenir.
**Nasıl yapar**: Tarayıcının POP türündeki navigasyon olaylarını dinleyerek önceki scroll konumu verisini yerel olarak saklar, ardından loading parametresinin false hale gelmesini yani veri yüklemesinin tamamlanmasını bekler. Yükleme işlemi başarıyla bittikten sonra sakladığı scroll pozisyonunu aktif sayfaya uygular, tarayıcının otomatik restorasyonunun içerik gecikmesi nedeniyle oluşan hatalarını tamamen telafi eder.
**Parametreler**:
- name: loading — type: boolean — Sayfadaki verinin yüklenme durumunu belirtir. True değeri yükleme işleminin hala devam ettiğini, bu nedenle scroll restorasyonunun beklemede tutulması gerektiğini ifade eder. False değeri yüklemenin başarıyla tamamlandığını ve scroll pozisyonunun güvenli bir şekilde geri yüklenebileceğini belirtir.
**Dönüş**: Belirli bir dönüş değeri yoktur, void tipindedir. Sadece scroll pozisyonu geri yükleme işlemini gerçekleştirmek için yan etki oluşturur, herhangi bir değer döndürmez.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useManualScrollRestoration.ts::useManualScrollRestoration
- **params**: (loading: boolean)
- **ic_degiskenler**:
  - `pathname` — Next.js `usePathname` hook'undan alınan mevcut sayfanın URL yolu
  - `restoredRef` — scroll pozisyonu restorasyonunun sadece bir kez çalıştırılmasını sağlamak için kullanılan `useRef` referansı
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useManualScrollRestoration.ts::ilk_effect_anonim_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — Tarayıcı pencere nesnesi
  - `window.history.scrollRestoration` — Tarayıcının otomatik scroll geri yükleme ayarı
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useManualScrollRestoration.ts::scroll_effect_anonim_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — Tarayıcı pencere nesnesi
  - `timeout` — Scroll olaylarında throttle mekanizması için kullanılan `NodeJS.Timeout` tipi zamanlayıcı referansı
  - `handler` — Scroll olayında tetiklenen işleyici fonksiyonu
- **Dönüş**: cleanup fonksiyonu

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useManualScrollRestoration.ts::scroll_handler_anonim
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timeout` — Üst kapsamda tanımlı throttle zamanlayıcısı
  - `setTimeout` — Yeni throttle zamanlayıcısı oluşturmak için kullanılan API
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useManualScrollRestoration.ts::handler_settimeout_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window.scrollY` — Mevcut dikey scroll pozisyonu
  - `pathname` — Üst kapsamdaki mevcut sayfa URL yolu
  - `sessionStorage` — Tarayıcı oturum depolama nesnesi
  - `currentY` — Kaydedilecek mevcut scroll pozisyonu değeri
  - `timeout` — Üst kapsamdaki throttle zamanlayıcısı
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useManualScrollRestoration.ts::scroll_effect_cleanup_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — Tarayıcı pencere nesnesi
  - `handler` - Kayıtlı scroll olay işleyicisi
  - `timeout` — Çalışan throttle zamanlayıcısı
  - `removeEventListener` — Scroll olay dinleyicisini kaldırma API'si
  - `clearTimeout` — Zamanlayıcıyı iptal etme API'si
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useManualScrollRestoration.ts::restore_effect_anonim_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — Tarayıcı pencere nesnesi
  - `loading` — Üst kapsamdaki sayfa yükleme durumu bayrağı
  - `restoredRef` — Scroll restorasyonunun tamamlandığını işaretleyen referans
  - `sessionStorage` — Tarayıcı oturum depolama nesnesi
  - `pathname` — Üst kapsamdaki mevcut sayfa URL yolu
  - `saved` — Oturum deposundan alınan kayıtlı scroll pozisyonu string değeri
  - `isPop` — Kullanıcının geri/ileri gezinme yaptığını belirten oturum deposu değeri
  - `targetY` — Kaydedilen scroll pozisyonunun sayıya çevrilmiş hedef değeri
  - `attempts` — Scroll restorasyonu deneme sayacı
  - `restore` — Scroll pozisyonunu geri yükleyen iç fonksiyon
  - `setTimeout` — Gecikmeli işlem için zamanlayıcı API'si
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useManualScrollRestoration.ts::restore_anonim_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `attempts` — Üst kapsamdaki restorasyon deneme sayacı
  - `targetY` — Geri yüklenecek hedef scroll pozisyonu
  - `window.scrollTo` — Pencereyi belirtilen koordinatlara kaydırma API'si
  - `document.documentElement.scrollHeight` — Sayfanın toplam yüksekliği
  - `setTimeout` — Tekrar deneme veya son kaydırma için zamanlayıcı API'si
  - `restoredRef` — Restorasyonun tamamlandığını işaretleyen referans
  - `restore` — Kendi kendini tekrar çağırmak için erişilen fonksiyon referansı
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\useManualScrollRestoration.ts
  function: src\hooks\useManualScrollRestoration.ts::useManualScrollRestoration

---

## DISA AKTARILANLAR (EXPORTS)
  export: useManualScrollRestoration