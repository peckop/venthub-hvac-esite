---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useScrollAnimation.ts
skeleton_hash: 99d2f3e7dcd66a94
generated_at: 2026-05-23T22:30:37Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin React tabanlı arayüzünde kaydırma (scroll) ile tetiklenen animasyonları yönetmek üzere geliştirilmiş özel bir hook modülüdür. Sayfa üzerindeki herhangi bir DOM elementinin görünürlüğünü takip ederek, kullanıcı sayfayı kaydırdığında hedef element görünür hale geldiğinde animasyonun başlatılmasını sağlar.

## Fonksiyon Grupları
### Scroll Animasyon Yönetim Hook'u
Modülün tüm sorumluluğunu üstlenen ana fonksiyonu barındırır, gelen yapılandırma opsiyonlarına göre çalışarak tüketen bileşene ihtiyaç duyduğu referans ve animasyon aktiflik bilgisini döndürür.
- useScrollAnimation

---

## AXIOMS – Mimari Varsayımlar
Bu modül, tarayıcı tabanlı uygulamalarda kullanılmak üzere tasarlanmış, DOM elementleri için scroll tetiklemeli animasyonlar yöneten custom React hook'tur. Doğru çalışması için React hook altyapısı, tarayıcı ortam özellikleri ve modül sabitlerinin eksiksiz olması zorunludur.

[Aksiyom 1]: Eğer tarayıcı ortamında window ve document nesneleri mevcut değilse, scroll olayları dinlenemez ve hiçbir animasyon tetiklenmez.
[Aksiyom 2]: Eğer hook'a iletilen `UseScrollAnimationOptions` tipi `options` nesnesi eksik veya zorunlu alanları içermiyorsa, hedef DOM elementinin konumu takip edilemez ve animasyon çalışmaz.
[Aksiyom 3]: Eğer modül sabiti olan `scrollAnimationClasses` nesnesi geçersiz, eksik veya tanımlı animasyon sınıflarını içermiyorsa, hedef elemente aktarılacak animasyon sınıfları oluşturulamaz ve animasyon devreye girmez.
[Aksiyom 4]: Eğer React kütüphanesinin temel hook fonksiyonları (useEffect, useRef vb.) modülün çalıştığı ortamda erişilebilir değilse, `useScrollAnimation` hook'u başlatılamaz ve hiçbir işlev yürütülemez.
[Aksiyom 5]: Eğer tarayıcıda DOM elementlerinin görünürlüğünü tespit etmeye yönelik standart API'ler desteklenmiyorsa, hedef elementin viewport'a giriş durumu saptanamaz ve animasyon hiç tetiklenemez.

---

## FONKSIYON DETAYLARI

### useScrollAnimation
**Ne yapar**: Scroll ile tetiklenen animasyonları yönetmek için tasarlanmış özel bir React hook'udur. IntersectionObserver API'sini kullanarak hedef DOM elemanının görünürlük durumunu takip eder, eleman kullanıcının viewport'una girdiğinde animasyonları tetiklemek için gereken tüm verileri tüketici bileşene sunar. Döndürdüğü referans ile hedef elemana kolayca bağlantı kurabilir, görünürlük state'i ile animasyon tetikleme koşulunu merkezi olarak yönetebilirsiniz.
**Nasıl yapar**: React'in temel hook'larını (useRef, useState, useEffect) kullanarak IntersectionObserver örneğini bileşenin yaşam döngüsü boyunca yönetir. Parametre olarak alınan yapılandırma seçeneklerini doğrudan IntersectionObserver kurulumuna aktararak gözlemcinin ne zaman tetikleneceğini hassas şekilde ayarlar. Bileşenun unmount olması durumunda useEffect'in temizleme fonksiyonu ile IntersectionObserver örneğini sonlandırır, olası bellek sızıntılarını önler. Hedef elemanın görünürlük durumu her değiştiğinde iç state'i güncelleyerek yeni durumu tüketici bileşene iletir.
**Parametreler**:
- name: options, type: UseScrollAnimationOptions — Hook'un ve IntersectionObserver'ın davranışını yapılandırmak için kullanılan seçenekler nesnesidir. İçerisinde IntersectionObserver için standart root, rootMargin, threshold gibi görünürlük tetikleme koşullarını içeren tüm ayarları barındırır.
**Dönüş**: [React.RefObject<T | null>, boolean] türünde bir dizi döndürür. Dizinin ilk elemanı, animasyon uygulanacak hedef DOM elemanına bağlanması gereken React referansıdır. İkinci eleman ise hedef elemanın IntersectionObserver kurallarına göre görünür olup olmadığını belirten boolean state'tir; eleman görünür durumdayken true, görünmüyorken false değerini alır.

---

## INTERFACES

### UseScrollAnimationOptions
- `threshold?: number`
- `rootMargin?: string`
- `triggerOnce?: boolean`

---

## SABİTLER
- **scrollAnimationClasses** (object) — `{
    fadeUp: (isVisible: boolean) =>
        `transition-all duration-700 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useScrollAnimation.ts::useScrollAnimation
- **params**: (options: UseScrollAnimationOptions = {})
- **ic_degiskenler**:
  - `threshold` — options nesnesinden çıkarılan IntersectionObserver tetikleme eşiği, varsayılan 0.1
  - `rootMargin` — options nesnesinden çıkarılan IntersectionObserver kök alan marjı, varsayılan '0px'
  - `triggerOnce` — options nesnesinden çıkarılan, element sadece ilk görünürlükte tetiklensin mi bayrağı, varsayılan true
  - `ref` — useRef ile oluşturulan, takip edilecek DOM elementini tutan React referansı
  - `isVisible` — useState ile oluşturulan, elementin görünürlük durumunu tutan boolean state
  - `setIsVisible` — isVisible state'ini güncelleyen state setter fonksiyonu
- **Dönüş**: [React.RefObject<T | null>, boolean]

### [N2_NASIL] AST Pointer: src/hooks/useScrollAnimation.ts::anonim_useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `element` — ref.current'ten alınan, takip edilecek DOM elementi
  - `observer` — yeni oluşturulan IntersectionObserver instance'ı, elementin görünürlüğünü takip eder
- **Dönüş**: () => void (observer bağlantısını kesen cleanup fonksiyonu)

### [N3_NASIL] AST Pointer: src/hooks/useScrollAnimation.ts::anonim_intersection_observer_callback
- **params**: ([entry])
- **ic_degiskenler**:
  - `entry` — IntersectionObserver tarafından döndürülen görünürlük verisi içeren nesne
  - `entry.isIntersecting` — elementin viewport'ta olup olmadığını belirten boolean değer
  - `setIsVisible` — ana hook'un isVisible state'ini güncelleyen setter
  - `triggerOnce` — bir kere tetikleme kuralını kontrol eden bayrak
  - `observer` — IntersectionObserver instance'ı, element takibini sonlandırmak için kullanılır
  - `element` — takip edilen DOM elementi
- **Dönüş**: void

### [N4_NASIL] AST Pointer: src/hooks/useScrollAnimation.ts::anonim_translate_y_animasyon_sınıfı
- **params**: (isVisible: boolean)
- **ic_degiskenler**:
  - `isVisible` — elementin görünürlük durumu, hangi CSS sınıflarının kullanılacağını belirler
- **Dönüş**: string (Tailwind CSS dikey kaydırma geçiş animasyonu sınıfları)

### [N5_NASIL] AST Pointer: src/hooks/useScrollAnimation.ts::anonim_opacity_animasyon_sınıfı
- **params**: (isVisible: boolean)
- **ic_degiskenler**:
  - `isVisible` — elementin görünürlük durumu, CSS sınıflarını belirler
- **Dönüş**: string (Tailwind CSS opaklık geçiş animasyonu sınıfları)

### [N6_NASIL] AST Pointer: src/hooks/useScrollAnimation.ts::anonim_scale_animasyon_sınıfı
- **params**: (isVisible: boolean)
- **ic_degiskenler**:
  - `isVisible` — elementin görünürlük durumu, CSS sınıflarını belirler
- **Dönüş**: string (Tailwind CSS ölçekleme geçiş animasyonu sınıfları)

### [N7_NASIL] AST Pointer: src/hooks/useScrollAnimation.ts::anonim_translate_x_sag_animasyon_sınıfı
- **params**: (isVisible: boolean)
- **ic_degiskenler**:
  - `isVisible` — elementin görünürlük durumu, CSS sınıflarını belirler
- **Dönüş**: string (Tailwind CSS sağdan gelen yatay kaydırma animasyonu sınıfları)

### [N8_NASIL] AST Pointer: src/hooks/useScrollAnimation.ts::anonim_translate_x_sol_animasyon_sınıfı
- **params**: (isVisible: boolean)
- **ic_degiskenler**:
  - `isVisible` — elementin görünürlük durumu, CSS sınıflarını belirler
- **Dönüş**: string (Tailwind CSS soldan gelen yatay kaydırma animasyonu sınıfları)

### [N9_NASIL] AST Pointer: src/hooks/useScrollAnimation.ts::anonim_transition_delay_hesapla
- **params**: (index: number)
- **ic_degiskenler**:
  - `index` — animasyonun başlayacağı sıra numarası, gecikmeyi hesaplamak için kullanılır
- **Dönüş**: { transitionDelay: string } (CSS geçiş gecikmesini içeren nesne)

---

## NODE ID STANDARD

  file: src\hooks\useScrollAnimation.ts
  function: src\hooks\useScrollAnimation.ts::useScrollAnimation

---

## DISA AKTARILANLAR (EXPORTS)
  export: scrollAnimationClasses
  export: useScrollAnimation