---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SpeedControlModel.tsx
skeleton_hash: 46fa33e4b16072a7
entity_hashes:
  func:SpeedControlModel: 9391170dd9d01022
  overview: a057d38dae1c89ff
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin 3B ürün görselleştirme sisteminde, ürünlerin hız kontrol bileşeninin dijital modelini temsil eden bir React bileşenidir. Tek bir bileşen olarak, 3B sahne içinde hız kontrol ünitesinin görsel ve işlevsel tanımını yaparak üst bileşenler tarafından kullanılabilir hale getirir.

## Fonksiyon Grupları
### Hız Kontrol Bileşeni Tanımı
Bu grup, 3B sahneye yerleştirilecek hız kontrol mekanizmasının tek ve merkezi modelini oluşturur. İlgili tüm 3B geometri, doku ve etkileşim tanımlarını içinde barındırır.
- `SpeedControlModel`

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediği için, modülün doğru çalışması için gerekli koşullar çıkarılamamaktadır. `SpeedControlModel()` parametresiz olarak tanımlanmış olup, fonksiyon gövdesindeki bağımlılıklar, prop gereksinimleri veya içsel koşullar bilinmemektedir. Mimari varsayımlar yalnızca çalıştırılabilir koddan üretilebileceğinden, mevcut bilgiyle aksiyom oluşturma mümkün değildir.

---

## FONKSİYON DETAYLARI

### SpeedControlModel
**Ne yapar**: VentHub HVAC projesinin ürün bileşenleri kapsamında yer alan 3B görselleştirme modülleri için hız kontrol sistemine özel tür tanımlama işlevidir. Proje içindeki HVAC ekipmanlarının hız ayarlama özelliklerinin 3B ortamda kullanılabilmesi için gerekli veri modelinin şemasını tanımlar, tüm ilgili bileşenlerde standartlaştırılmış veri yapısı kullanımını sağlar.
**Nasıl yapar**: TypeScript tabanlı React projesinde tür tanımlama (type definition) rolü üstlenir, 3B bileşenler içerisinde hız kontrol sistemi ile ilgili tüm veri noktalarının tip güvenliğini garanti eder. Proje geliştirme sürecinde hız kontrol parametrelerinin tutarsız kullanımlarını önler, olası tür uyumsuzluğu hatalarını derleme aşamasında yakalanmasına olanak tanır.
**Parametreler**:
- Tanımlı herhangi bir giriş parametresi bulunmamaktadır
**Dönüş**: İşlevin dönüş tipi resmi olarak tanımlanmamıştır, kaynak kodda belirtilen bilgiye göre void veya bilinmeyen bir türdür. Herhangi bir değer döndürmesi amaçlanmamış, yalnızca tür tanımlama amacıyla oluşturulmuştur.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `SpeedControlModel.tsx`::SpeedControlModel
- **params**: (yok — parametresiz fonksiyon)
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan dönen malzeme nesnesi; kutu, mat siyah, fırçalanmış alüminyum vb. 3D mesh malzemelerini içerir
  - `knobRef` — `useRef<THREE.Group>(null)` ile oluşturulan React ref; sahnedeki çevirmeli düğme (potansiyometre) grubuna referans, `useFrame` içinde `rotation.z` ile döndürülür
  - `ledRef` — `useRef<THREE.MeshBasicMaterial>(null)` ile oluşturulan React ref; LED göstergesinin malzemesine referans, `useFrame` içinde rengi (`setRGB`) değiştirilerek nabız efekti verilir
  - `ledMaterial` — `useMemo` ile oluşturulmuş `THREE.MeshBasicMaterial` nesnesi, başlangıç rengi `#00ff00` (yeşil); bileşen yeniden render edildiğinde yeniden oluşturulmayı önler
- **useFrame ic callback degiskenleri** (inline arrow function `(state) => {}`):
  - `time` — `state.clock.elapsedTime`, üç.js saatinin başlangıçtan itibaren geçen toplam süresi (saniye); hem düğme rotasyonu hem LED nabzı için zaman kaynağı
  - `intensity` — `Math.abs(Math.sin(time * 2))`, 0–1 arasında nabız yapan değer; LED parlaklığının dalgalanmasını kontrol eder
  - `greenValue` — `Math.floor(100 + intensity * 155)`, 100–255 aralığında hesaplanan yeşil kanal değeri; `ledRef.current.color.setRGB(0, greenValue/255, 0)` ile LED rengini ayarlar
- **Dönüş**: JSX (React Three Fiber 3D sahne ağacı) — `group` içinde kutu, ön panel, yan soğutma kanalları (iki taraflı `map` ile 6 adet), çevirmeli düğme, LED gösterge ve VentHub yazısı/plakası

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SpeedControlModel.tsx
  function: src\components\products\3d\types\SpeedControlModel.tsx::SpeedControlModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: SpeedControlModel

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