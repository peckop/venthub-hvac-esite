---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\crypto.ts
skeleton_hash: 6a2e1234506f9cf6
entity_hashes:
  func:generateId: b72c75acd1bdb8bf
  overview: 3748b737e825394a
generated_at: 2026-05-28T22:38:45Z
---

## Genel Bakış
VentHub HVAC projesinin yardımcı modüllerinden biri olan bu kripto yardımcı modülü, src/utils/crypto.ts konumunda bulunarak proje genelinde kimliklendirme ve temel güvenlik ile ilgili işlevleri sunmak üzere tasarlanmıştır. Modül şu anda sistemin farklı bölümlerinde kullanılmak üzere benzersiz tanımlayıcı üretme yeteneği barındırır.

## Fonksiyon Grupları
### Benzersiz Kimlik Üretme İşlevleri
Sistemdeki tüm bileşenlerin ihtiyaç duyduğu, string formatında benzersiz kimlikleri üretmekten sorumlu olan tek işlevi barındırır.
- generateId

---

## AXIOMS – Mimari Varsayımlar
Bu modül, sistem genelinde kullanılmak üzere benzersiz, güvenilir kimlik (ID) üretmek üzere tasarlanmış crypto yardımcı modülüdür, sorunsuz çalışması için aşağıdaki koşulların sürekli olarak sağlanması zorunludur.

[Aksiyom 1]: Eğer modülün çalıştığı runtime ortamında kriptografik olarak güvenilir rastgele sayı üreticisi (CSPRNG) veya standart TypeScript/JavaScript crypto kütüphanesi erişilebilir değilse, generateId() fonksiyonu tarafından üretilen kimlikler tahmin edilebilir, tekrarlanabilir veya çakışan değerler olarak oluşur, sistemdeki tüm kimlik tabanlı işlemler bozulur.
[Aksiyom 2]: Eğer generateId() fonksiyonunun çağrıldığı tüm süreçlerde çoklu eşzamanlı ID üretim çağrılarını yönetecek senkronizasyon mekanizmaları bulunmuyorsa, aynı anda yapılan üretim işlemlerinde çakışan kimlikler ortaya çıkar, sistemdeki veri bütünlüğü kaybolur.
[Aksiyom 3]: Eğer modülün ürettiği kimliklerin format ve uzunluk standartları, kimlikleri kullanan veya saklayan tüm diğer sistem bileşenlerinde desteklenmiyorsa, ID saklama, eşleştirme ve sorgulama işlemlerinde kritik hatalar meydana gelir.

---

## FONKSİYON DETAYLARI

### generateId
**Ne yapar**: Çarpışmaya dayanıklı benzersiz bir tanımlayıcı dizesi üreten fonksiyondur. Tüm proje genelinde ihtiyaç duyulan benzersiz kimlik gereksinimlerini karşılamak üzere tasarlanmıştır, kriptografik olarak güvenli yapısı sayesinde rastlantısal çakışma riskini en aza indirger.
**Nasıl yapar**: Temel çalışma prensibinde Web Crypto API'nin yerleşik `crypto.randomUUID()` metodunu kullanarak standart UUIDv4 formatında güvenli kimlik üretimi gerçekleştirir. Çalışma ortamında Web Crypto API desteklenmediği durumlarda (güvensiz HTTP bağlamları veya eski çalışma zamanları gibi özel senaryolarda) güvenli bir geri dönüş mekanizmasını devreye alır, bu mekanizma pseudo-random tabanlı bir kimlik üretimi yaparak fonksiyonun tüm ortamlarda çalışmasını garantiler.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: string tipinde benzersiz bir tanımlayıcı dizesi döndürür. Normal çalışma koşullarında standart UUIDv4 formatında bir değer döndürür, Web Crypto API'nin kullanılamadığı özel durumlarda geri dönüş mekanizması tarafından üretilen benzersiz kimlik döndürülür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/crypto.ts::generateId
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `globalThis` — Çalışma zamanının küresel nesnesi, crypto API'sinin kullanılabilirliğini kontrol etmek için kullanılır
  - `globalThis.crypto?.randomUUID` — Küresel nesne üzerinden erişilen standart güvenli UUID üreten crypto API fonksiyonu, varsa öncelikli olarak çağrılır
  - `crypto` - Ayrı bağlamda tanımlı yerel crypto nesnesi, globalThis üzerinden erişim sağlanamadığında kontrol edilir
  - `crypto.randomUUID` — Yerel crypto nesnesi üzerinden erişilen UUID üreten fonksiyon, kullanılabilirliği doğrulandıktan sonra çağrılır
  - `Date.now()` — Anlık Unix zaman damgası, crypto API kullanılamadığında oluşturulacak yedek benzersiz kimliğin temelini oluşturur
  - `Math.random().toString(36).slice(2, 11)` — Rastgele üretilip 36'lık tabanda stringe dönüştürülen, gereksiz karakterleri kesilmiş değer, zaman damgası ile birleştirilerek yedek kimlikte benzersizlik sağlar
- **Dönüş**: string, güvenli ortamlarda standart UUID, güvenli olmayan ortamlarda zaman damgası + rastgele string içeren benzersiz kimlik döndürür

---

## NODE ID STANDARD

  file: src\utils\crypto.ts
  function: src\utils\crypto.ts::generateId

---

## DISA AKTARILANLAR (EXPORTS)
  export: generateId