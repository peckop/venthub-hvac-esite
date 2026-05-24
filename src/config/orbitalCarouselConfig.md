---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\config\orbitalCarouselConfig.ts
skeleton_hash: a8316a8cfcf9cfd2
generated_at: 2026-05-23T22:28:28Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yapılandırma katmanında yer alan, yalnızca sabit yapılandırma verileri barındıran bir üst seviye script modülüdür. Projede kullanılan orbital karozel (döner taşıyıcı) bileşeninin tüm standart çalışma ayarlarını tek bir merkezde toplayan ORBITAL_CAROUSEL_CONFIG sabitini barındırır. Herhangi bir dış bağımlılığı, fonksiyonu, ortam değişkeni kullanımı ya da API/veri tabanı sorgusu bulunmaz, projenin bu bileşene ihtiyaç duyan tüm modülleri tarafından doğrudan erişilmek üzere tasarlanmıştır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, proje içindeki orbital carousel bileşeni için sabit yapılandırma nesnesi barındıran bir TypeScript yapılandırma modülüdür; tüm aksiyomlar, bu tek sabit nesnenin bağımlı modüller tarafından doğru şekilde kullanılabilmesi için var olması gereken koşulları kapsar.

[Aksiyom 1]: Eğer ORBITAL_CAROUSEL_CONFIG nesnesi modül tarafından dışarı aktarılmamış (export edilmemiş) yoksa, bu yapılandırmayı kullanacak tüm bağımlı modüller nesneye erişemez ve çalıştırılamaz.
[Aksiyom 2]: Eğer ORBITAL_CAROUSEL_CONFIG nesnesi, onu kullanan tüm modüllerin beklediği alan ve tür yapısına sahip değilse, TypeScript derleme sürecinde hata oluşur, derleme başarısız olur.
[Aksiyom 3]: Eğer ORBITAL_CAROUSEL_CONFIG nesnesinin içindeki yapılandırma değerleri, orbital carousel bileşeninin çalışması için gereken temel koşulları karşılamıyorsa, ilgili bileşen hiç çalışmaz veya beklenen işlevini yerine getiremez.

---



---

## TYPE ALIASES

### OrbitalCarouselConfig
```typescript
type OrbitalCarouselConfig = typeof ORBITAL_CAROUSEL_CONFIG
```

---

## SABİTLER
- **ORBITAL_CAROUSEL_CONFIG** (object) — `{
    // ═══════════════════════════════════════════════════════════
    //...`

---

## AST POINTERS
- İşlenen dosyada tanımlı herhangi bir fonksiyon bulunmamaktadır.
- Dosyada tanımlı tek sabit değer:
  - `ORBITAL_CAROUSEL_CONFIG` — C:\Users\alize\venthub-hvac\src\config\orbitalCarouselConfig.ts dosyasında tanımlanmış object tipinde sabit konfigürasyon nesnesi

---

## NODE ID STANDARD

  file: src\config\orbitalCarouselConfig.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: ORBITAL_CAROUSEL_CONFIG
  export: OrbitalCarouselConfig