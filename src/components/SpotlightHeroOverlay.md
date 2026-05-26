---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\SpotlightHeroOverlay.tsx
skeleton_hash: d3aa76214edd8a36
generated_at: 2026-05-23T22:27:32Z
---

## Genel Bakış
Bu React modülü, web uygulamalarının ana giriş (hero) bölümlerinin üzerinde kullanılmak üzere tasarlanmış, imleç konumunu takip eden parlama efekti overlay'ini sunar. Yarıçap ve parlaklık yoğunluğu parametreleriyle özelleştirilebilir olan bileşen, sayfa içi görsel etkileşimi artırmak için geliştirilmiştir.

## Fonksiyon Grupları
### Ana Bileşen ve Efekt Yönetimi
Modülün tüm sorumluluğunu üstlenen, kullanıcıdan alınan özelleştirme parametrelerini işleyerek imleç takipli parlama efekti overlay'ini render eden tek gruptur.
- SpotlightHeroOverlay

---

## AXIOMS – Mimari Varsayımlar
Bu React bileşeni, web arayüzünde kullanıcının imlecinin olduğu bölgeyi vurgulayan spotlight (ışıkla odaklama) efekti oluşturmak için tasarlanmıştır; doğru çalışması için aşağıdaki koşulların varlığı zorunludur.

[Aksiyom 1]: Eğer bileşene aktarılan radius parametresi geçerli pozitif bir sayı değilse, istenen boyutta odaklama alanı oluşturulamaz, görsel efekt tamamen bozulur.
[Aksiyom 2]: Eğer bileşene aktarılan intensity parametresi 0 ile 1 arasında bir sayı değilse, odaklama alanının şeffaflığı istenen seviyede ayarlanamaz, efekt ya hiç görünmez ya da arka planı tamamen kapatarak ana içeriği gizler.
[Aksiyom 3]: Eğer bileşen çalışma zamanında tarayıcının window ve document nesnelerine erişemiyorsa, kullanıcının imlek pozisyonunu takip edemez, spotlight hiçbir zaman hareket etmez veya hiç görüntülenmez.
[Aksiyom 4]: Eğer bileşene ait gerekli CSS stil tanımları projeye dahil edilmemişse, odaklama efekti doğru konumda ve şekilde görüntülenemez, bileşen temel işlevini yerine getiremez.

---

## FONKSIYON DETAYLARI

### SpotlightHeroOverlay
**Ne yapar**: VentHub HVAC projesinde kullanılan bir React fonksiyonel bileşenidir, ana sahne (Hero) bölümü üzerinde spot (odaklanmış sahne ışığı) efektiyle kaplama (overlay) oluşturur. Bileşen, üzerindeki içeriğe kademeli odaklanma efekti ekleyerek kullanıcı deneyimini zenginleştirmek amacıyla tasarlanmıştır, ışığın boyutunu ve şiddetini yapılandırılabilir hale getirir.
**Nasıl yapar**: Kendisine gönderilen opsiyonel boyut ve şiddet parametrelerini alır, herhangi bir parametre gönderilmediği durumlarda önceden tanımlanmış varsayılan değerleri kullanır. Bu değerlere göre overlay bileşeninin spot ışığı özelliklerini dinamik olarak ayarlar, üstüne eklendiği Hero bölümünün içeriği üzerinde odak noktası dışında kademeli bir koyulaşma/saydamlık efekti uygular.
**Parametreler**:
- radius: number — Opsiyonel parametre, spot ışığının piksel cinsinden yarıçapını belirler, varsayılan değeri 240'tır. Bileşene özel değer gönderilerek ışığın boyutu ihtiyaca göre ayarlanabilir.
- intensity: number — Opsiyonel parametre, spot ışığının şiddetini yani odak alanı dışındaki kaplamanın saydamlık/koyuluk derecesini ayarlar, genellikle 0 ile 1 arasında normalize edilmiş değer alır, varsayılan değeri 0.35'tir.
**Dönüş**: React.FC<{ radius?: number; intensity?: number }> tipinde bir React fonksiyonel bileşeni döndürür. Bu dönen bileşen, kendisine iletilen tüm prop'ları ve çocuk içerikleri alarak spotlight efektini ekrana uygun şekilde render eder.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\SpotlightHeroOverlay.tsx::SpotlightHeroOverlay
- **params**: radius (number, varsayılan 240), intensity (number, varsayılan 0.35)
- **ic_degiskenler**:
  - `reduced` — Kullanıcının hareket azaltma (prefers-reduced-motion) tercihini saklayan boolean React state değeri
  - `setReduced` — reduced state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `useState` — React state yönetimi için kullanılan hook
  - `useEffect` — React yan etkilerini yönetmek için kullanılan hook
- **Dönüş**: JSX div elementi (React.ReactElement)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\SpotlightHeroOverlay.tsx::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mq` — prefers-reduced-motion medya sorgusunu temsil eden window.matchMedia nesnesi
  - `onChange` — Medya sorgusu durum değişikliklerini yakalayan event handler fonksiyonu, reduced state'ini günceller
  - `setReduced` — Üst kapsamdaki reduced state'ini güncellemek için kullanılan state setter
  - `mq.addEventListener?` — Medya sorgusuna change event listener'ı eklemek için kullanılan opsiyonel method
  - `mq.removeEventListener?` — Temizlik aşamasında event listener'ı kaldırmak için erişilen opsiyonel method
- **Dönüş**: event listener temizliği yapan void fonksiyon

---

## NODE ID STANDARD

  file: src\components\SpotlightHeroOverlay.tsx
  function: src\components\SpotlightHeroOverlay.tsx::SpotlightHeroOverlay

---

## DISA AKTARILANLAR (EXPORTS)
  export: SpotlightHeroOverlay

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** `absolute`, `z-10`
- **Responsive:** (yok)
