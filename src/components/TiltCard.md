---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\TiltCard.tsx
skeleton_hash: 5e75a79e673d1227
entity_hashes:
  func:TiltCard: bfd1d2a43ccba8c3
  func:clamp: 6b6f2a3bb4b3c92e
  func:onEnter: 6efee232fcfe2e0b
  func:onLeave: 47432f2c7853fc8a
  func:onMove: 855a2394d5f31485
  overview: 49812a020a38dab5
  style_tokens: 9c70068ed275c69c
generated_at: 2026-06-19T20:47:39Z
---

## Genel Bakış
TiltCard, fare etkileşimleriyle üç boyutlu eğilme efekti sunan interaktif bir React kart bileşenidir. Kullanıcı faresini kart üzerinde hareket ettirdiğinde, kart真实世界'deki bir nesne gibi eğilerek modern ve dinamik bir görsel deneyim yaratır. Maksimum eğilme açısı dışarıdan özelleştirilebilir.

## Fonksiyon Grupları
### Ana Bileşen
TiltCard'ın temel yapısını oluşturarak içeriği sarar ve eğilme efekti için yapılandırma parametrelerini tanımlar. Bu grup, bileşenin dışarıya açılan arayüzünü ve yaşam döngüsünü yönetir.
- TiltCard

### Fare Etkileşim Yöneticileri
Kullanıcının kart üzerindeki fare hareketlerini yakalayarak eğilme hesaplamalarını tetikler. Fare kart üzerine geldiğinde, hareket ettiğinde ve ayrıldığında分别 ilgili efekt başlangıç, güncelleme ve bitiş işlemlerini yürütür.
- onMove, onEnter, onLeave

### Değer Sınırlandırma Aracı
Eğilme açısı gibi hesaplanan sayısal değerleri tanımlı minimum ve maksimum aralıkta tutarak efektin kontrollü çalışmasını garanti eder. Aşırı değerlerin önüne geçerek görsel tutarlılığı korur.
- clamp

---

## AXIOMS – Mimari Varsayımlar
Bu modül, fare hareketleriyle 3D eğilme efekti yaratan bir React bileşeni olduğundan, aşağıdaki mimari varsayımlar modülün doğru çalışması için zorunludur.

[Aksiyom 1]: Eğer `clamp` fonksiyonu için `min` parametresi, `max` parametresinden büyükse, fonksiyon beklenmedik sonuçlar döndürür veya başarısız olur.
[Aksiyom 2]: Eğer `TiltCard` bileşeni için `maxTilt` parametresi negatif bir sayı olarak sağlanırsa, eğilme açısı hesaplamaları anlamsız hale gelir ve bileşen düzgün çalışmaz.
[Aksiyom 3]: Eğer `onMove`, `onEnter` veya `onLeave` olay işleyicileri bir React olay nesnesi (örn. `React.MouseEvent`) içermeyen farklı bir argümanla çağrılırsa, bileşenin iç durumu tutarsız hale gelir ve eğilme efekti bozulur.
[Aksiyom 4]: Eğer modül, React'ın bileşen yaşam döngüsü ve durum yönetimi (useState, useEffect) mekanizmalarından yoksun bir ortamda çalıştırılmaya çalışılırsa, bileşen işlevsel olmaz.
[Aksiyom 5]: Eğer `TiltCard` bileşeni fare olaylarını (`mousemove`, `mouseenter`, `mouseleave`) tetikleyemeyen bir ortamda (örn. dokunmatik cihazlar) kullanılırsa, eğilme efekti tetiklenemez; ancak bileşen statik olarak görüntülenebilir.

---

## FONKSİYON DETAYLARI

### clamp
**Ne yapar**: Bir sayısal değeri, belirtilen minimum ve maximum sınırlar arasında sıkıştırır (clipping). Değer aralık dışındaysa en yakın sınaira sabitlenir.

**Nasıl yapar**: Fonksiyon, verilen `v` değerini `min` ve `max` değerleri ile karşılaştırır. `v`, `min` değerinden küçükse `min` değerini, `max` değerinden büyükse `max` değerini, aksi halde `v` değerinin kendisini döndürür. Bu, genellikle mouse hareketi veya animasyon hesaplamalarında değerin kontrollü kalmasını sağlamak için kullanılır.

**Parametreler**:
- v: number — Sınırlanacak olan sayısal değer
- min: number — İzin verilen değer aralığının alt sınırı
- max: number — İzin verilen değer aralığının üst sınırı

**Dönüş**: Fonksiyonun dönüş tipi sağlanan bilgide açıkça belirtilmemiştir. Ancak bu tür clamp fonksiyonları genellikle number tipinde değer döndürür.

### TiltCard
**Ne yapar**: Fare hareketlerine göre eğme (tilt) efekti uygulayan, tekrarlanabilir bir React bileşenidir. İçerisindeki tüm çocuk içerikleri sarmalayarak, kullanıcı kartla etkileşime girdiğinde 3D benzeri eğim efekti sunar. Maksimum eğme açısı dışarıdan yapılandırılabilir, varsayılan bir değerle kullanıma hazırdır.
**Nasıl yapar**: Kendi bünyesinde fare olaylarını izleyen onMove, onEnter, onLeave işleyicilerini barındırır, bu işleyicileri ana kapsayıcı div elementine bağlar. Eğme hesaplamalarında clamp fonksiyonunu kullanarak açının sınırları aşmasını engeller, aldığı maxTilt değerini tüm eğme hesaplamalarında temel alır. İçerisine gelen children prop'unu kendi içindeki kapsayıcıda render ederek efekti içeriğe uygular.
**Parametreler**:
- name: children — type: React.ReactNode — Bileşen içerisinde gösterilecek, eğme efekti uygulanacak tüm içerik, her türlü React tarafından desteklenen iç öğe olabilir.
- name: maxTilt — type: number — Kartın uygulayabileceği maksimum eğme açısı, isteğe bağlı olarak dışarıdan değer geçirilebilir, varsayılan olarak 18 derece olarak ayarlanmıştır.
**Dönüş**: React.FC<React.PropsWithChildren<{ maxTilt?: number }>> tipinde bir React bileşeni döndürür, çocuklu yapıyı destekler, maxTilt prop'unu opsiyonel olarak kabul eden tür yapısına sahiptir.

### onMove
**Ne yapar**: TiltCard bileşeninin alanı üzerinde fare hareket ettiğinde tetiklenen olay işleyicisidir, anlık fare konumuna göre kartın eğme miktarını hesaplayıp günceller. Kullanıcının fare hareketlerini eğme açısına dönüştürerek akıcı bir 3D efekti sağlar.
**Nasıl yapar**: Fare olayından gelen konum verilerini alır, TiltCard'ın boyutlarını ve sayfa üzerindeki konumunu hesaplar, elde edilen koordinatları eğme açısına çevirir. Hesaplanan açının maxTilt sınırını aşmasını clamp fonksiyonuyla engeller, sürekli güncellenen değerle kartın eğimini akıcı bir şekilde değiştirir.
**Parametreler**:
- name: e — type: React.MouseEvent<HTMLDivElement> — Tetiklenen fare hareketi olayının tüm detaylarını içeren nesne, fare konumu, hedef element gibi tüm gerekli verilere erişim sağlar.
**Dönüş**: HTMLDivElement elementleri için uyumlu React.MouseEventHandler<HTMLDivElement> tipinde bir olay işleyicisi döndürür, fare hareketi olaylarını yakalayıp işlemek üzere yapılandırılmıştır.

### onEnter
**Ne yapar**: TiltCard bileşeninin kapsama alanına fare ilk girdiğinde tetiklenen olay işleyicisidir, eğme efektinin başlatılmasını ve gerekli tüm başlangıç durumlarının ayarlanmasını sağlar. Kullanıcının kartla etkileşime geçtiğini algılayarak efekti aktif hale getirir.
**Nasıl yapar**: Fare kartın alanına girdiğinde animasyon geçişlerini aktif eder, eğme hesaplamaları için gereken ilk konum ve durum değerlerini ayarlar, olası gecikmeleri önlemek için gerekli ön yüklemeleri yapar, kullanıcının ilk etkileşimini algılayarak efektin sorunsuz başlamasını sağlar.
**Parametreler**:
- name: e — type: React.MouseEvent<HTMLDivElement> — Fare giriş olayının tüm detaylarını içeren, hedef element ve olay metriklerini barındıran React fare olay nesnesi.
**Dönüş**: HTMLDivElement elementleri için uyumlu React.MouseEventHandler<HTMLDivElement> tipinde bir olay işleyicisi döndürür, fare element alanına giriş olayını yakalamak üzere yapılandırılmıştır.

### onLeave
**Ne yapar**: TiltCard bileşeninin kapsama alanından fare çıkış yaptığında tetiklenen olay işleyicisidir, eğme efektinin sonlandırılıp kartın orijinal varsayılan konumuna dönmesini sağlar. Kullanıcının kartla etkileşimini bitirdiğini algılayarak tüm geçici durumları temizler.
**Nasıl yapar**: Fare kartın alanından çıktığında mevcut eğme açılarını sıfırlar, animasyonlu bir geçişle kartın orijinal konumuna dönmesini sağlar, etkileşim sırasında oluşturulan tüm geçici durum değerlerini temizler, bir sonraki etkileşime hazır hale getirir.
**Parametreler**: Herhangi bir harici parametre almaz, iç mantığında olay nesnesini kullanarak işlemlerini gerçekleştirir.
**Dönüş**: HTMLDivElement elementleri için uyumlu React.MouseEventHandler<HTMLDivElement> tipinde bir olay işleyicisi döndürür, fare element alanından çıkış olayını yakalamak üzere yapılandırılmıştır.

---

## İTHALATLAR (IMPORTS)
- import: react::React
- import: react::useRef
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: TiltCard.tsx::clamp
- **params**: `(v: number, min: number, max: number)`
- **ic_degiskenler**: (fonksiyon gövdesi verilmemiş, çağrı侧dan çağrılmış)
- **Dönüş**: number — v değerini min ve max arasında sıkıştırılmış olarak döndürür

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    TiltCard_tsx__TiltCard["TiltCard"]
    TiltCard_tsx__clamp["clamp"]
    TiltCard_tsx__onEnter["onEnter"]
    TiltCard_tsx__onLeave["onLeave"]
    TiltCard_tsx__onMove["onMove"]
    TiltCard_tsx__TiltCard --> TiltCard_tsx__clamp
    TiltCard_tsx__TiltCard --> TiltCard_tsx__onMove
```

## NODE ID STANDARD

  file: src\components\TiltCard.tsx
  function: src\components\TiltCard.tsx::clamp
  function: src\components\TiltCard.tsx::TiltCard
  function: src\components\TiltCard.tsx::onMove
  function: src\components\TiltCard.tsx::onEnter
  function: src\components\TiltCard.tsx::onLeave

---

## DISA AKTARILANLAR (EXPORTS)
  export: TiltCard
  export: clamp

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** `absolute`, `relative`
- **Varyant/Responsive:** `group-hover:` önekleri
- **Yardımcı Sınıflar:** `duration-200`, `group`, `group-hover:opacity-100`, `inset-0`, `opacity-0`, `pointer-events-none`, `rounded-xl`, `transition-opacity`, `transition-transform`, `will-change-transform`