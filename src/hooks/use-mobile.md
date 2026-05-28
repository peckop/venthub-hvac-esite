---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\use-mobile.tsx
skeleton_hash: 093da8115e24847a
entity_hashes:
  func:useIsMobile: a6742235a7536cbb
  overview: e7e6eb331c36bd56
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:37:37Z
---

## Genel Bakış
Bu modül, uygulamanın çalıştığı tarayıcı penceresinin (viewport) genişliğine bakarak cihazın mobil boyutlarında olup olmadığını tespit eden, yeniden kullanılabilir bir React hook'u sunar. Tek bir sorumluluğu olan hafif bir yapıya sahiptir.

## Fonksiyon Grupları
### Mobil Ekran Algılama
Tarayıcı penceresinin genişliğini izleyerek, belirlenen bir eşik değerin (768px) altında olup olmadığını kontrol eder ve buna göre boolean bir değer döndürür.
- useIsMobile

---

## AXIOMS – Mimari Varsayımlar
Bu React hook modülü, mobil cihaz tespiti işlevini tarayıcı pencere boyutu bilgisine dayanarak sağlar.

**[Aksiyom 1 - Tarayıcı Ortamı Zorunluluğu]:** Eğer `window` nesnesi (tarayıcı çalışma zamanı ortamı) mevcut değilse, bu hook doğru çalışamaz ve pencere boyutu ölçümü başarısız olur.

**[Aksiyom 2 - React Hook Çalışma Kuralları]:** Eğer `useIsMobile` bir React bileşeni dışında veya koşullu (conditional) bir blok içinde çağrılırsa, React Hook kuralları ihlal edilir ve bileşen hatalı çalışır.

**[Aksiyom 3 - Pencere Boyutu Eşiği]:** Bu hook, "mobil" tanımı için bir genişlik eşiği değerine ihtiyaç duyar. Eşik değeri `useIsMobile()` fonksiyon imzasında parametre olarak verilmemiştir; bu nedenin hangi piksel değeri kullanıldığı bilinmiyor olup, modülün kendi içinde sabit bir değer olarak tanımlı olduğu varsayılmaktadır.

**[Aksiyom 4 - Responsive Davranış Tetikleyicisi]:** Eğer tarayıcı pencere boyutu mobil eşiğin altına düşerse veya üzerine çıkarsa, hook'un döndürdüğü boolean değer değişmeli ve bileşenin yeniden render edilmesi tetiklenmelidir; aksi durumda UI responsive güncelleme yapılamaz.

**[Aksiyom 5 - Tek Sorumluluk]:** Bu hook yalnızca boolean (mobil/mobil değil) bilgisini döndürür. Eğer hook'un farklı bir cihaz türünü (tablet, masaüstü vb.) ayırt etmesi bekleniyorsa, bu hook tek başına yetersiz kalır; ek hook veya mantık eklenmelidir.

---

## FONKSİYON DETAYLARI

### useIsMobile
**Ne yapar**: Mevcut viewport'un mobil boyutta olup olmadığını tespit eden özel bir React hook'udur. Ekran genişliği belirlenen eşik değerinin altında ise true, altında değilse false değeri döner.

**Nasıl yapar**: `window.matchMedia` API'sini kullanarak tarayıcının medya sorgusu özelliği üzerinden viewport genişliğini kontrol eder. `MOBILE_BREAKPOINT` sabitinin bir piksel altına (`max-width: 767px`) ayarlanmış bir MediaQueryList nesnesi oluşturur. `change` olay dinleyicisi ekleyerek pencere boyutu değiştiğinde state'i otomatik olarak günceller. Hook bileşenden ayrılırken dinleyici temizlenerek bellek sızıntısı önlenir.

**Parametreler**:
- Parametre almaz

**Dönüş**: `boolean` — Viewport genişliği 768px'in altında ise `true`, değilse `false` değerini döner.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/use-mobile.tsx::useIsMobile
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isMobile` — React state değişkeni (boolean), cihazın mobil olup olmadığını tutar, başlangıç değeri `false`
  - `setIsMobile` — `isMobile` state'ini güncellemek için React setter fonksiyonu
- **Dönüş**: `isMobile` — cihazın mobil olup olmadığı bilgisini (boolean) döner

**useEffect callback (iç fonksiyon):**
- **ic_degiskenler**:
  - `mql` — `window.matchMedia(...)` çağrısından dönen MediaQueryList nesnesi, ekran genişliğinin `MOBILE_BREAKPOINT - 1` px değerinden küçük olup olmadığını sorgular
  - `onChange` — MediaQueryList'in `"change"` olayında tetiklenen callback; `mql.matches` değerine göre `setIsMobile`'i çağırarak state'i günceller
- **Dönüş**: cleanup fonksiyonu döner — `mql.removeEventListener("change", onChange)` ile event listener'ı temizler

**onChange callback (için iç fonksiyon):**
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\use-mobile.tsx
  function: src\hooks\use-mobile.tsx::useIsMobile

---

## DISA AKTARILANLAR (EXPORTS)
  export: useIsMobile

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