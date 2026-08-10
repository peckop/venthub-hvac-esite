---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\core\ContextLossRecovery.tsx
skeleton_hash: 31db5702673c4ed2
entity_hashes:
  func:ContextLossRecovery: 4d21632035775208
  overview: 8a94f0c75220a1b4
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-20T05:00:07Z
---

## Genel Bakış
Bu modül, bir 3D ürün modeli bileşeninin (muhtemelen HVAC sistemi) React bağlamının kaybolması durumunda otomatik kurtarma ve yeniden bağlanma mekanizması sağlayan bir React bileşenidir. Bileşen, bağlam yeniden kullanılabilir duruma gelene kadar kullanıcıya durum bildirerek uygulamanın dayanıklılığını ve hata toleransını artırır.

## Fonksiyon Grupları
### Bağlam Kurtarma ve Yeniden Bağlanma
Bu grup, 3D sahnesi veya ürün modeli ile ilgili kritik bağlam verilerinin kaybolması durumunda devreye giren kurtarma mantığını ve kullanıcı bildirimini yönetir.
- ContextLossRecovery

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon imzası `ContextLossRecovery()` olarak tanımlanmıştır. Parametre almamaktadır. Modül adı ve dosya yolu (`3d/core/`) dışında, fonksiyon gövdesinden çıkarılabilecek bilgi sınırlıdır.

**[Aksiyom 1]:** Eğer `ContextLossRecovery` bileşeni dışarıdan prop olarak veri almıyorsa, gerekli tüm bağımlılıkları React Context veya hook'lar üzerinden edinmelidir. Aksi halde bileşen işlevsel veriye erişemez.

**[Aksiyom 2]:** Eğer `ContextLossRecovery` bir 3D WebGL bağlam kaybı (context loss) senaryosunu ele alıyorsa, bileşenin yaşam döngüsünde bir WebGL context nesnesine veya bu nesneyi sağlayan bir üst bileşene bağımlı olması gerekir. Aksi halde bağlam kaybı olayı tespit edilemez ve kurtarma süreci tetiklenemez.

**[Aksiyom 3]:** Eğer `ContextLossRecovery` bileşeni render çıktısı üretiyorsa (JSX return), bileşenin bir üst React ağaç içinde yer alması zorunludur. Aksi halde React mount edilemez.

---

**Not:** Fonksiyon imzası仅有 `()` — parametre, default değer veya sabit tanımı bulunmamaktadır. Daha kesin aksiyomlar için fonksiyon gövdesinin içeriği gereklidir.

---

## FONKSİYON DETAYLARI

### ContextLossRecovery
**Ne yapar**: WebGL bağlamı (context) kaybı ve geri yüklenme senaryolarında uygulamanın çökmesini önleyerek otomatik kurtarma sağlayan React bileşenidir. GPU reset, bellek yetersizliği veya Safari'nin context limiti aşımı gibi durumlarda sayfanın stabil kalmasını garanti altına alır.

**Nasıl yapar**: `useThree` hook'u ile R3F (React Three Fiber) render döngüsünden `gl` (WebGL renderer) ve `invalidate` (yeniden çizim tetikleyici) referanslarını alır. `useEffect` içinde, canvas elementi üzerinde iki kritik WebGL olayı için dinleyiciler kurar: `webglcontextlost` olayı tetiklendiğinde `event.preventDefault()` çağırarak tarayıcının varsayılan davranışı olan sayfayı tamamen durdurmasını engeller; `webglcontextrestored` olanda ise `invalidate()` fonksiyonunu çağırarak sahnenin GPU tarafından yeniden çizilmesini tetikler. Bileşen unmount edildiğinde temizlik fonksiyonu aracılığıyla her iki event listener kaldırılarak bellek sızıntısı yaşanması önlenir. Bileşen JSX olarak herhangi bir görünür output döndürmez, yalnızca yan etki (side-effect) tabanlı çalışır.

**Parametreler**:
- Bu bileşen herhangi bir prop almamaktadır. R3F Context Provider tarafından sağlanan Three.js state'ine doğrudan `useThree` hook'u ile erişir.

**Dönüş**: `null` — Bileşen herhangi bir JSX elementi render etmez; varlık amacı yalnızca event listener yönetimi ve kurtarma mekanizması kurmaktır.

---

## İTHALATLAR (IMPORTS)
- import: @react-three/fiber::useThree
- import: react::useEffect

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ContextLossRecovery.tsx::ContextLossRecovery
- **params**: ()
- **ic_degiskenler**: 
  - `gl` — useThree hook'undan alınan WebGL renderer nesnesi, canvas DOM elementine erişim sağlar
  - `invalidate` — useThree hook'undan alınan fonksiyon, WebGL bağlamı yeniden oluşturma tetikler
  - `canvas` — gl.domElement üzerinden elde edilen canvas DOM elementi, event listener'lar eklenip kaldırılır
  - `handleLost` — webglcontextlost olayı için handler fonksiyonu, olayın varsayılan davranışını engeller
  - `handleRestored` — webglcontextrestored olayı için handler fonksiyonu, invalidate fonksiyonunu çağırarak yeniden render tetikler
- **Dönüş**: null (React component olarak JSX döndürmez)

---

## NODE ID STANDARD

  file: src\components\products\3d\core\ContextLossRecovery.tsx
  function: src\components\products\3d\core\ContextLossRecovery.tsx::ContextLossRecovery

---

## DISA AKTARILANLAR (EXPORTS)
  export: ContextLossRecovery

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