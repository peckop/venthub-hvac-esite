---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\en.ts
skeleton_hash: 8d83e23fe586f287
generated_at: 2026-05-23T22:30:35Z
---

## Genel Bakış
VentHub HVAC projesinin uluslararasılaştırma (i18n) altyapısı için hazırlanmış İngilizce dil sözlüğü modülüdür, proje arayüzünde kullanılacak tüm İngilizce metinleri tek bir merkezde toplamak amacıyla oluşturulmuştur. Bu modülde herhangi bir çalıştırılabilir fonksiyon, harici bağımlılık, ortam değişkeni kullanımı veya API sorgulaması bulunmaz, yalnızca İngilizce çevirileri içeren `en` adında bir sabit nesneyi barındırır ve projenin i18n sistemi tarafından İngilizce dil paketi olarak yüklenir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, uygulamanın uluslararasılaştırma (i18n) sisteminin İngilizce çeviri verilerini barındıran sabit sözlük modülüdür, doğru çalışması için i18n çekirdek modülünün bu modüldeki `en` nesnesini başarıyla import etmesi ve kullanması zorunludur.

[Aksiyom 1]: Eğer bu modüldeki `en` nesnesi, projedeki diğer dil sözlükleriyle aynı anahtar yapısına sahip değilse, i18n sistemi çeviri eksikliği yaşaması nedeniyle uygulama arayüzünde boş, hatalı veya tanımsız metinler gösterilir.
[Aksiyom 2]: Eğer bu modül, import eden i18n çekirdek modülü tarafından dosya yolu üzerinden doğru şekilde erişilemiyorsa, İngilizce çeviri sözlüğüne erişilemez ve tüm uygulama genelinde çeviri başarısızlığı olur.
[Aksiyom 3]: Eğer bu modüldeki `en` nesnesi TypeScript standartlarına uygun olarak export edilmemişse, import eden tüm modüller nesneye erişemez ve uygulama derleme aşamasında hata alır.
[Aksiyom 4]: Eğer `en` nesnesinin içindeki herhangi bir çeviri değeri i18n sisteminin desteklemediği bir formatta tanımlanmışsa, ilgili çeviri metni uygulamada doğru şekilde gösterilemez.

---



---

## SABİTLER
- **en** (object) — `{
  common: {
    loadingApp: 'Loading VentHub... ',
    loading: 'Loading...`

---

## AST POINTERS
### C:\Users\alize\venthub-hvac\src\i18n\dictionaries\en.ts Dosya Özeti
Bu dosyada herhangi bir fonksiyon, sınıf veya çağrılabilir yapı tanımı bulunmamaktadır. Dosyada sadece tek bir sabit nesne tanımlıdır:
- **Sabit**: `en` — İngilizce i18n (uluslararasılaştırma) çeviri değerlerini tutan ana nesne

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: en