---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useCheckoutCoupon.ts
skeleton_hash: 04bcf61d779f3f3d
entity_hashes:
  func:useCheckoutCoupon: 4495b524ff78f42b
  overview: 292a471e78e94271
generated_at: 2026-08-27T08:34:24Z
---

## Genel Bakış
Bu modül, Venthub projesinin ödeme (checkout) sürecinde kupon kodu yönetimini merkezi olarak sağlayan bir React özel hook'u sunar. Temel olarak, kullanıcının girdiği kupon kodunu alarak harici bir Supabase Edge Function üzerinden doğrulanmasını ve mevcut sipariş toplam tutarı (`totalAmount`) üzerinden indirim tutarının hesaplanıp yönetilmesini kapsar. Modül, kupon uygulama akışının tüm sorumluluğunu tek bir hook bileşeninde yoğunlaştırarak dış bağımlılıklarla olan iletişimi soyutlar.

## Fonksiyon Grupları
### Kupon İş Akışı Hook'u
Ödeme sayfasında kupon kodunun girişinden, doğrulanmasına ve nihai indirim tutarının hesaplanmasına kadar olan tüm iş mantığını ve durum yönetimini yöneten temel React hook'u.
- useCheckoutCoupon

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### useCheckoutCoupon
**Ne yapar**: Bu özel hook, ödeme sayfasında kupon kodunun uygulanma sürecini yönetir. Kullanıcının girdiği kupon kodunu tutar, doğrular ve Supabase Edge Function'ı üzerinden indirimi güvenli bir şekilde aktif hale getirir.

**Nasıl yapar**: Fonksiyon, `useState` ve `useCallback` gibi React hook'larını kullanarak kupon kodu, yükleme durumu ve hata durumu için state yönetimi sağlar. Doğrulama işlemi, kupon kodunun boş olup olmadığını kontrol ederek başlar. Geçerli bir kod girildiğinde, `totalAmount` parametresini de alarak bir fetch isteği ile Supabase Edge Function'ı çağırır ve sonucu state'e yazar.

**Parametreler**:
- `totalAmount`: number — Sepetin mevcut toplam tutarı (Türk Lirası cinsinden). Bu değer, Edge Function'a gönderilerek indirimin doğru hesaplanmasında kullanılır.

**Dönüş**: Nesne (Object) — Kupon yönetimine ilişkin durum ve fonksiyonları içeren bir nesne döner. Bu nesnenin yapısı bilinmemekle birlikte, dokümantasyondan kupon durumu (state), bu durumu güncelleyici setter fonksiyonları ve kuponu uygulamak veya kaldırmak için işlevler içerdiği çıkarılabilir. Kesin dönüş tipi ve özellikleri, kaynak kodunun implementasyonuna bağlıdır.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/I18nProvider::useI18n
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCheckoutCoupon.ts::useCheckoutCoupon
- **params**: (`totalAmount`: number) — kupon hesaplamasında kullanılacak toplam tutar
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu
  - `couponCode` — kullanıcının girdiği kupon kodu state'i
  - `setCouponCode` — couponCode state'ini güncelleyen setter
  - `couponApplied` — uygulanan kupon bilgisini tutan state (code ve discount)
  - `setCouponApplied` — couponApplied state'ini güncelleyen setter
  - `applyCoupon` — kupon uygulayan asenkron fonksiyon
  - `removeCoupon` — kuponu kaldıran fonksiyon
- **Dönüş**: `{ couponCode, setCouponCode, couponApplied, applyCoupon, removeCoupon }` — kupon yönetim hook'unun döndürdüğü nesne

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutCoupon.ts::applyCoupon
- **params**: yok (arrow function, closure olarak tanımlı)
- **ic_degiskenler**:
  - `code` — trimlenmiş kupon kodu (couponCode.trim())
  - `base` — Supabase URL'i (process.env.NEXT_PUBLIC_SUPABASE_URL)
  - `anon` — Supabase anon key (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - `resp` — fetch API çağrısının dönüş değeri
  - `json` — resp.json() ile parse edilen JSON yanıtı
- **Dönüş**: yok (yan etki: toast mesajları ve state güncellemeleri)

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutCoupon.ts::removeCoupon
- **params**: yok (arrow function, closure olarak tanımlı)
- **ic_degiskenler**:
  - `setCouponApplied` — couponApplied state'ini null'a ayarlayan setter (closure'dan)
  - `setCouponCode` — couponCode state'ini boş string'e ayarlayan setter (closure'dan)
- **Dönüş**: yok (yan etki: state'leri sıfırlar)

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutCoupon.ts
  function: src\hooks\useCheckoutCoupon.ts::useCheckoutCoupon

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCheckoutCoupon