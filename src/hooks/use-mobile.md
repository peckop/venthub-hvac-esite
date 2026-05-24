---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\use-mobile.tsx
skeleton_hash: 093da8115e24847a
generated_at: 2026-05-23T22:29:19Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin React tabanlı kod yapısında yer alan, mobil cihaz tespiti işlevini sunan özel bir hook modülüdür. Uygulamanın herhangi bir bileşeninde çağrılarak, cihazın mobil olup olmadığı bilgisini yeniden kullanılabilir bir şekilde sunar. Hafif yapısıyla sadece mobil görünüm tetikleme ihtiyacını karşılamak üzere tasarlanmıştır.

## Fonksiyon Grupları
### Mobil Cihaz Tespiti Grubu
Pencere boyutlarını izleyerek mobil cihaz boyut eşiğinin karşılanıp karşılanmadığını kontrol eder, uygulama genelinde tutarlı mobil arayüz koşullarının kullanılmasına imkan tanır.
- useIsMobile

---

## AXIOMS – Mimari Varsayımlar
Bu React özel hook'u, mobil cihaz tespiti işlemini gerçekleştirmek için tarayıcı çalışma zamanı API'lerine ve React hook çalışma prensiplerine tam bağımlıdır, bu bağımlılıkların eksikliği halinde modül doğru çalışamaz.

[Aksiyom 1]: Eğer tarayıcı `window` nesnesi ve `window.resize` olayını dinleme yeteneği yoksa (sunucu tarafı SSR çalışma ortamları gibi), hook mobil cihaz tespiti yapamaz, sürekli yanlış değer döndürür veya çalışma zamanı hatası fırlatır.
[Aksiyom 2]: Eğer React hook kullanım kuralları ihlal edilir (hook bileşen/özel hook dışında çağrılırsa, koşullu olarak çağrılırsa), React çalışma zamanı hatası fırlatır, modül hiçbir şekilde çalışmaz.
[Aksiyom 3]: Eğer tarayıcının viewport boyutlarını okuma API'leri devre dışı bırakılmış veya erişilemez hale gelmişse, cihazın mobil olup olmadığı doğru şekilde sınıflandırılamaz, yanlış sonuç üretilir.

---

## FONKSIYON DETAYLARI

### useIsMobile
**Ne yapar**: Mevcut görünüm alanının mobil boyutlarında olup olmadığını tespit etmek için geliştirilmiş özel bir React hook'udur. Uygulamanın çalıştığı tarayıcı penceresinin genişliğinin 768px olarak tanımlanan mobil eşik değerinin altında olup olmadığını kontrol eder, pencere yeniden boyutlandırıldığında kendi durumunu otomatik olarak günceller. Bu sayede hook'u kullanan arayüz bileşenleri mobil ve masaüstü görünümüne göre dinamik olarak ayarlanabilir, kullanıcı deneyimi cihaz ve pencere boyutuna göre optimize edilebilir.
**Nasıl yapar**: Tarayıcının standart `window.matchMedia` API'sini kullanarak görüntü alanı genişliğinin önceden tanımlı `MOBILE_BREAKPOINT` (768px) sınırını geçip geçmediğini anlık olarak kontrol eder. Pencere boyut değişikliği olayını dinleyerek eşik değerinin aşılması durumunda dahili durumunu günceller, böylece hook'u kullanan tüm bileşenler görünüm tipi değişikliğinden anında haberdar olur.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: boolean tipinde bir değer döndürür. Eğer mevcut pencere genişliği 768px'in altında ise true, aksi takdirde false değerini döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\use-mobile.tsx::useIsMobile
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isMobile` — Cihazın mobil boyut aralığında olup olmadığını saklayan boolean tipinde React state değişkeni
  - `setIsMobile` — isMobile state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `React.useState` — isMobile ve setIsMobile state çiftini oluşturmak için kullanılan React state hook'u
  - `React.useEffect` - Medya sorgusu event listener'ını yönetmek için kullanılan React yan etki hook'u
- **Dönüş**: boolean (mobil olup olmadığını gösteren isMobile state değeri)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\use-mobile.tsx::useIsMobile.React.useEffect.effectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `MOBILE_BREAKPOINT` — Mobil genişlik sınırı, medya sorgusunun maksimum genişliğini hesaplamak için kullanılan sabit
  - `window.matchMedia` — Viewport boyutuna göre medya sorgusu nesnesi oluşturan tarayıcı API'si
  - `mql` — Oluşturulan medya sorgusu nesnesi, viewport boyut değişikliklerini dinlemek için kullanılır
  - `onChange` — Medya sorgusundaki değişikliklerde tetiklenen event handler fonksiyonu
  - `mql.addEventListener` — Medya sorgusu nesnesine değişiklik event listener'ı ekleyen tarayıcı metodu
  - `mql.matches` — Mevcut viewport'un medya sorgusu koşulunu sağlayıp sağlamadığını gösteren boolean değer
  - `setIsMobile` — Dış kapsamdaki useIsMobile hook'unun state setter fonksiyonu, ilk mobil durumunu ayarlamak için kullanılır
  - `mql.removeEventListener` — Bileşen unmount olduğunda event listener'ı temizlemek için kullanılan tarayıcı metodu
- **Dönüş**: fonksiyon (event listener'ı temizleyen cleanup fonksiyonu)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\use-mobile.tsx::useIsMobile.React.useEffect.effectCallback.onChange
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setIsMobile` — Dış kapsamdaki useIsMobile hook'unun state setter fonksiyonu, güncel mobil durumunu state'e yazmak için kullanılır
  - `mql` — Dış kapsamdaki medya sorgusu nesnesi, güncel eşleşme durumunu almak için kullanılır
  - `mql.matches` — Mevcut viewport'un medya sorgusu koşulunu sağlayıp sağlamadığını gösteren güncel boolean değer
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\use-mobile.tsx::useIsMobile.React.useEffect.effectCallback.cleanup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mql` — Dış kapsamdaki medya sorgusu nesnesi, üzerindeki event listener'ı kaldırmak için kullanılır
  - `onChange` — Daha önce eklenen event handler fonksiyonu, medya sorgusundan kaldırılacak
  - `mql.removeEventListener` — Değişiklik event listener'ını medya sorgusu nesnesinden çıkarmak için kullanılan tarayıcı metodu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\use-mobile.tsx
  function: src\hooks\use-mobile.tsx::useIsMobile

---

## DISA AKTARILANLAR (EXPORTS)
  export: useIsMobile