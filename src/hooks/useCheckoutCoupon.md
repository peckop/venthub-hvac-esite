---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutCoupon.ts
skeleton_hash: 0ddc8afaae2a88ab
entity_hashes:
  func:useCheckoutCoupon: 4495b524ff78f42b
  overview: dfde178f4f3b3f1b
generated_at: 2026-05-28T22:37:53Z
---

## Genel Bakış
Venthub HVAC projesinin ödeme sürecine entegre edilmiş bir React özel hook modülüdür. Kullanıcıların sipariş toplam tutarına göre kupon kodu girişi, doğrulaması ve indirim hesaplama işlemlerini tek bir bileşen üzerinden yönetir. Modül, checkout akışında kupon kullanımının tüm yaşam döngüsünü kontrol eder.

## Fonksiyon Grupları
### Kupon İşlemleri Hook'u
Ödeme sayfasında kupon kodu yönetimi için gerekli tüm işlevselliği tek bir hook içinde sunar. Kupon girişi, doğrulama, geçerlilik kontrolü ve indirim tutarının hesaplanmasını kapsar.
- useCheckoutCoupon

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React hook yapısıyla ödeme sürecinde kupon yönetimi sağlayan bir fonksiyonel bileşendir.

[Aksiyom 1]: Eğer `totalAmount` parametresi number tipinde değilse (veya `NaN`/`undefined`/`null` ise), kupon indirim hesaplaması hatalı sonuç verebilir veya beklenmeyen davranış oluşur.

[Aksiyom 2]: Eğer React hook bağlamı (React component içinde) dışında çağrılırsa, hook kuralları ihlal edilir ve çalışma zamanı hatası oluşur.

[Aksiyom 3]: Eğer `totalAmount` negatif bir değer olarak iletilirse, kupon indirim mantığı tanımsız davranış gösterebilir.

[Aksiyom 4]: Eğer `totalAmount` sıfır ise, kupon uygulaması sonucunda indirim tutarının sıfır veya negatif olmaması beklenir (tutar limitleri bilinmiyor).

---

## FONKSİYON DETAYLARI

### useCheckoutCoupon
**Ne yapar**: Bu özel hook, ödeme sayfasında kupon kodunun uygulanma sürecini yönetir. Kullanıcının girdiği kupon kodunu tutar, doğrular ve Supabase Edge Function'ı üzerinden indirimi güvenli bir şekilde aktif hale getirir.

**Nasıl yapar**: Fonksiyon, `useState` ve `useCallback` gibi React hook'larını kullanarak kupon kodu, yükleme durumu ve hata durumu için state yönetimi sağlar. Doğrulama işlemi, kupon kodunun boş olup olmadığını kontrol ederek başlar. Geçerli bir kod girildiğinde, `totalAmount` parametresini de alarak bir fetch isteği ile Supabase Edge Function'ı çağırır ve sonucu state'e yazar.

**Parametreler**:
- `totalAmount`: number — Sepetin mevcut toplam tutarı (Türk Lirası cinsinden). Bu değer, Edge Function'a gönderilerek indirimin doğru hesaplanmasında kullanılır.

**Dönüş**: Nesne (Object) — Kupon yönetimine ilişkin durum ve fonksiyonları içeren bir nesne döner. Bu nesnenin yapısı bilinmemekle birlikte, dokümantasyondan kupon durumu (state), bu durumu güncelleyici setter fonksiyonları ve kuponu uygulamak veya kaldırmak için işlevler içerdiği çıkarılabilir. Kesin dönüş tipi ve özellikleri, kaynak kodunun implementasyonuna bağlıdır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCheckoutCoupon.ts::useCheckoutCoupon
- **params**: (totalAmount: number)
- **ic_degiskenler**:
  - `couponCode` — Kullanıcının girdiği kupon kodu, useState ile tutulan string state
  - `setCouponCode` — couponCode state'ini güncellemek için kullanılan setter fonksiyonu
  - `couponApplied` — Uygulanan kupon bilgilerini (kod ve indirim miktarı) tutan state, başlangıçta null
  - `setCouponApplied` — couponApplied state'ini güncellemek için kullanılan setter fonksiyonu
  - `applyCoupon` — Asenkron fonksiyon, kupon kodunu doğrular ve uygular
  - `removeCoupon` — Uygulanan kuponu kaldırır ve formu sıfırlar
- **Dönüş**: { couponCode, setCouponCode, couponApplied, applyCoupon, removeCoupon }

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutCoupon.ts::applyCoupon
- **params**: ()
- **ic_degiskenler**:
  - `code` — Trimlenmiş kupon kodu, doğrulama için kullanılır
  - `base` — Supabase URL'si, process.env.NEXT_PUBLIC_SUPABASE_URL'den alınır veya boş string
  - `anon` — Supabase anon key'i, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY'den alınır veya boş string
  - `resp` — Edge Function'dan dönen HTTP response nesnesi
  - `json` — Response'un JSON içeriği, geçersiz JSON durumunda boş obje ile yakalanır
  - `e` — Try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: void (yan etki: state güncelleme ve toast bildirimleri)

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutCoupon.ts::removeCoupon
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void (yan etki: couponApplied ve couponCode state'lerini sıfırlar)

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutCoupon.ts
  function: src\hooks\useCheckoutCoupon.ts::useCheckoutCoupon

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCheckoutCoupon