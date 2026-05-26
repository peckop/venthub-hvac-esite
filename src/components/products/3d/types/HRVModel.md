---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\HRVModel.tsx
skeleton_hash: 6df93aa6828ad3af
generated_at: 2026-05-23T22:24:01Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin ürünler bölümündeki 3B ürün görselleştirme katmanında yer alan, ısı geri kazanım ventilatörleri (HRV) için özel React bileşeni barındırır. Sadece proje içindeki 3B ürün gösterimleri için tasarlanan modül, HRV tipi cihazların 3D sahnesinde doğru şekilde sunulmasını sağlayan ana bileşeni içerir.

## Fonksiyon Grupları
### Ana 3B HRV Model Bileşeni
HRV cihazlarının 3B ortamda render edilmesini, temel görsel ve sahne uyumlu özelliklerinin yönetilmesini üstlenen tek ana bileşeni barındırır.
- HRVModel

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı 3B bileşen, HRV tipi HVAC cihazının kullanıcı arayüzünde 3 boyutlu olarak görüntülenmesini sağlamak üzere tasarlanmıştır, çalışması için 3B renderlama ekosisteminin ve ürün konfigürasyon verilerinin üst katmanlardan eksiksiz sağlanması zorunludur.

[Aksiyom 1]: Eğer projeye entegre edilen React Three Fiber, Three.js gibi 3B renderlama kütüphaneleri bu bileşenden önce başarılı bir şekilde yüklenmemişse, HRV modeli hiçbir şekilde kullanıcıya görüntülenemez.
[Aksiyom 2]: Eğer bu bileşene üst bileşenler tarafından HRV modeline ait geometri, malzeme ve sahne içi konumlandırma verileri iletilmemişse, 3B model doğru yerde, doğru görünürlükte sahneye eklenemez.
[Aksiyom 3]: Eğer VentHub projesinin ürün veri kaynağından HRV cihazına ait gerçek boyutlar, konfigürasyon özellikleri bu bileşene aktarılmamışsa, 3B modelin ölçeklemesi gerçek hayattaki cihazla orantısız olur, görsel tutarsızlık oluşur.
[Aksiyom 4]: Eğer bileşenin çalıştığı son kullanıcı tarayıcısı WebGL standardını desteklemiyorsa, tüm 3B içerik gibi HRV modeli de hiç görüntülenemez, kullanıcı boş bir içerik alanıyla karşılaşır.

---

## FONKSIYON DETAYLARI

### HRVModel
**Ne yapar**: VentHub HVAC projesinin ürün odaklı 3D bileşenleri grubunda yer alan, Isı Geri Kazanım Ünitesi (HRV) için tasarlanmış React bileşenidir. Hava akışı animasyonu ve fiziksel tabanlı yapısı ile HRV ünitesinin çalışma prensibini 3 boyutlu ortamda görselleştirmek üzere geliştirilmiştir.
**Nasıl yapar**: Projenin belirlediği 3D ürün bileşeni standartlarına uygun olarak geliştirilen bileşen, öncelikle HRV ünitesinin fiziksel yapısını 3D ortamda render eder. Sonrasında entegre edilmiş özel hava akışı animasyonunu çalıştırarak ünitenin çalışma sürecini kullanıcılar için anlaşılır hale getirir.
**Parametreler**: Orijinal fonksiyon tanımında herhangi bir girdi parametresi belirtilmemiştir, bu bileşen herhangi bir parametre almaz.
**Dönüş**: Fonksiyonun orijinal tanımında dönüş tipi void veya bilinmiyor olarak işaretlenmiş, herhangi bir uydurma bilgi eklenmemiştir. Bileşen yapısı gereği React ortamında JSX elementi döndürmesi beklenir ancak orijinal tanımda resmi olarak bir dönüş tipi tanımlanmamıştır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/HRVModel.tsx::HRVModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'u ile elde edilen, modelin tüm parçalarında kullanılan materyaller nesnesi
  - `freshRef` — THREE.Group tipinde React referansı, taze hava animasyonu yapan kürelerin grup nesnesini işaret eder
  - `staleRef` — THREE.Group tipinde React referansı, atık hava animasyonu yapan kürelerin grup nesnesini işaret eder
  - `useFrame` — Her karede çalışan react-three/fiber hook'u, hava akışı animasyonunu yönetmek için kullanılır
- **Dönüş**: Tüm HRV cihazının 3D geometrilerini ve animasyon referanslarını içeren React Three Fiber JSX group elementi

### [N2_NASIL] AST Pointer: src/components/products/3d/types/HRVModel.tsx::useFrameAnimationCallback
- **params**: `_`, `delta`
- **ic_degiskenler**:
  - `delta` — Son kare ile geçen süreyi tutan, animasyon hızını senkronize etmek için kullanılan zaman değeri
  - `freshRef.current` — Taze hava küreleri grubunun mevcut nesnesi, null kontrolü yapılarak erişilir
  - `staleRef.current` — Atık hava küreleri grubunun mevcut nesnesi, null kontrolü yapılarak erişilir
- **Dönüş**: yok (sadece sahne nesnelerinin pozisyonlarını güncelleyen yan etki bırakır)

### [N3_NASIL] AST Pointer: src/components/products/3d/types/HRVModel.tsx::freshAirChildUpdateCallback
- **params**: `child`
- **ic_degiskenler**:
  - `child` — Üzerinde işlem yapılan, taze hava grubu içindeki üç boyutlu sahne nesnesi
  - `delta` — Animasyon hızını ayarlamak için kullanılan zaman farkı değeri
  - `child.position.x` — Nesnenin X eksenindeki pozisyonu, sürekli güncellenerek hareket sağlar
- **Dönüş**: yok (sadece ilgili nesnenin X pozisyonunu günceller)

### [N4_NASIL] AST Pointer: src/components/products/3d/types/HRVModel.tsx::staleAirChildUpdateCallback
- **params**: `child`
- **ic_degiskenler**:
  - `child` — Üzerinde işlem yapılan, atık hava grubu içindeki üç boyutlu sahne nesnesi
  - `delta` — Animasyon hızını ayarlamak için kullanılan zaman farkı değeri
  - `child.position.x` — Nesnenin X eksenindeki pozisyonu, ters yönde hareket ettirmek için güncellenir
- **Dönüş**: yok (sadece ilgili nesnenin X pozisyonunu günceller)

### [N5_NASIL] AST Pointer: src/components/products/3d/types/HRVModel.tsx::ductFlangeMapCallback
- **params**: `pos`, `i`
- **ic_degiskenler**:
  - `pos` — Flanşın sahne üzerindeki 3 boyutlu konumunu tutan sayı dizisi
  - `i` — Map fonksiyonundaki geçerli elemanın indeksi, React anahtarı olarak kullanılır
  - `materials.matteBlack` - Flanşlara uygulanan mat siyah materyal, materyaller nesnesinden erişilir
  - `Math.PI` — Flanşın dönüşünü ayarlamak için kullanılan pi sabiti
- **Dönüş**: HRV cihazının bağlantı flanşlarını temsil eden, konumlandırılmış JSX mesh elementi

### [N6_NASIL] AST Pointer: src/components/products/3d/types/HRVModel.tsx::freshAirSphereMapCallback
- **params**: `x`, `i`
- **ic_degiskenler**:
  - `x` — Taze hava küresinin X eksenindeki başlangıç konumu
  - `i` — Map fonksiyonundaki geçerli elemanın indeksi, benzersiz React anahtarı oluşturmak için kullanılır
  - `#3b82f6` — Taze havayı temsil eden mavi renk kodu, küre materyaline uygulanır
- **Dönüş**: Animasyonlu taze hava küresini temsil eden JSX mesh elementi

### [N7_NASIL] AST Pointer: src/components/products/3d/types/HRVModel.tsx::staleAirSphereMapCallback
- **params**: `x`, `i`
- **ic_degiskenler**:
  - `x` — Atık hava küresinin X eksenindeki başlangıç konumu
  - `i` — Map fonksiyonundaki geçerli elemanın indeksi, benzersiz React anahtarı oluşturmak için kullanılır
  - `#ef4444` — Atık havayı temsil eden kırmızı renk kodu, küre materyaline uygulanır
- **Dönüş**: Animasyonlu atık hava küresini temsil eden JSX mesh elementi

---

## NODE ID STANDARD

  file: src\components\products\3d\types\HRVModel.tsx
  function: src\components\products\3d\types\HRVModel.tsx::HRVModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: HRVModel

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
