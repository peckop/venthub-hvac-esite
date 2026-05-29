---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutCoupon.ts
skeleton_hash: 579864aa3c6d26bc
entity_hashes:
  func:useCheckoutCoupon: 4495b524ff78f42b
  overview: f730ef6cfe5f4c6f
generated_at: 2026-05-29T18:47:48Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin ödeme (checkout) sürecinde kupon kodu yönetimini sağlayan bir React özel hook'u içerir. Kullanıcının girdiği kupon kodunu alarak Supabase Edge Function aracılığıyla doğrulanmasını ve sipariş toplam tutarı üzerinden indirim hesaplanmasını yönetir. Modül, tek bir hook bileşeniyle kupon uygulama sürecinin tüm temel adımlarını kapsar.

## Fonksiyon Grupları
### Kupon Doğrulama ve İndirim Hook'u
Ödeme sayfasında kupon kodunun girişinden indirimin hesaplanmasına kadar olan tüm iş akışını yöneten temel React hook'u.
- useCheckoutCoupon

---

## AXIOMS – Mimari Varsayımlar

Bu modül, `totalAmount` parametresine bağımlı çalışan bir React hook'udur ve kupon işlemlerinin hesaplama temelini bu tutar üzerine kurar.

[Aksiyom 1]: Eğer `totalAmount` geçerli bir `number` tipinde değilse (örn: `NaN`, `undefined`, `null`), kupon indirim hesaplaması güvenilir sonuç üretmez.

[Aksiyom 2]: Eğer `totalAmount` negatif bir değer olarak verilirse, kupon indirim hesaplaması tanımsız davranış gösterir (hesaplama mantığı negatif tutarlar için tanımlı değildir).

[Aksiyom 3]: Eğer `totalAmount` sıfır ise, kupon uygulaması sonucu herhangi bir indirim tutarı oluşmaz (indirim, 0 tutarlı bir sipariş üzerinde anlamsızdır).

[Aksiyom 4]: Eğer hook bir React bileşeninin dışında (React render döngüsü dışında) çağrılırsa, React hooks kuralları ihlal edilir ve hook düzgün çalışmaz.

---

**Not:** Bu modül için yalnızca fonksiyon imzası (`useCheckoutCoupon(totalAmount: number)`) bilinmektedir. Hook'un döndürdüğü değerler, içinde yönettiği state'ler, kupon doğrulama mantığı, API çağrıları ve eşik değerleri fonksiyon gövdesi olmadan belirlenemez.

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

### [N1_NASIL] AST Pointer: useCheckoutCoupon.ts::useCheckoutCoupon
- **params**: `totalAmount: number` — sepet toplam tutarı, kupon indirimi hesaplamada kullanılır
- **ic_degiskenler**:
  - `couponCode` — useState ile yönetilen string, kullanıcının girdiği kupon kodunu tutar
  - `setCouponCode` — couponCode state'ini güncelleyen setter fonksiyonu
  - `couponApplied` — `{ code: string; discount: number } | null` tipinde state, başarıyla uygulanmış kupon bilgisini veya uygulanan kupon olmadığını (null) tutar
  - `setCouponApplied` — couponApplied state'ini güncelleyen setter fonksiyonu
  - `applyCoupon` — kupon kodunu Edge Function'a göndererek doğrulayan ve uygulayan async fonksiyon
  - `removeCoupon` — kuponu kaldırıp formu sıfırlayan fonksiyon
- **Dönüş**: `{ couponCode, setCouponCode, couponApplied, applyCoupon, removeCoupon }` — kupon yönetim arayüzü

---

### [N2_NASIL] AST Pointer: useCheckoutCoupon.ts::applyCoupon
- **params**: yok
- **ic_degiskenler**:
  - `code` — `couponCode.trim()` ile elde edilen, baş/son boşlukları temizlenmiş kupon kodu
  - `base` — `process.env.NEXT_PUBLIC_SUPABASE_URL || ''` Supabase API base URL'i, Edge Function çağrıları için kullanılır
  - `anon` — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''` Supabase anon公众 key'i, API authentication header'ında kullanılır
  - `resp` — `fetch()` ile `/functions/v1/apply-coupon` endpoint'ine POST isteği sonucu dönen Response nesnesi
  - `json` — `resp.json()` ile parse edilen yanıt gövdesi; parse hatasında boş obje `{}` döner; `json?.valid` kupon geçerliliğini, `json?.error` hata mesajını, `json.normalized_code` normalize edilmiş kupon kodunu, `json.discount_amount` indirim tutarını içerir
- **Dönüş**: yok (yan etkiler: `setCouponApplied` ile state günceller, `toast.success`/`toast.error` ile bildirim gösterir)

---

### [N3_NASIL] AST Pointer: useCheckoutCoupon.ts::removeCoupon
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (yan etkiler: `setCouponApplied(null)` ile kupon bilgisini temizler, `setCouponCode('')` ile input alanını sıfırlar)

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutCoupon.ts
  function: src\hooks\useCheckoutCoupon.ts::useCheckoutCoupon

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCheckoutCoupon