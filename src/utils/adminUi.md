---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\adminUi.ts
skeleton_hash: 3ae172a5374fdd7a
generated_at: 2026-05-26T12:20:50Z
---

## Genel Bakış
VentHub HVAC projesinin src/utils dizininde yer alan bu modül, yönetici paneli arayüz bileşenleri için standartlaştırılmış görsel stiller ve CSS sınıf sabitleri barındıran basit bir yardımcı dosyasıdır. Dosyada herhangi bir fonksiyon, harici bağımlılık veya çalıştırılabilir mantık bulunmaz, sadece yönetici kartları için sınıflar, dolgulu kart sınıfı ve seçim alanları için still nesnesi olmak üzere üç adet yerel sabit içerir.

Bu modül hiçbir ortam değişkeni kullanmaz, harici API'ler ile iletişime geçmez ve herhangi bir veritabanı tablosunu sorgulamaz. Tüm sabitler, projenin tüm yönetici arayüz bileşenleri tarafından import edilerek kullanılarak proje genelinde tutarlı bir görsel deneyim sunulmasını hedefler.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---



---

## SABİTLER
- **adminCardClass** (template) — ``${glassStrongClass} rounded-hvac-xl transition-colors duration-500 hover:bor...`
- **adminCardPaddedClass** (template) — ``${adminCardClass} p-8 lg:p-10``
- **adminSelectStyle** (object) — `{ 
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.o...`

---

## AST POINTERS

Sağlanan kaynak dosyasında (`C:\Users\alize\venthub-hvac\src\utils\adminUi.ts`) analiz edilecek herhangi bir fonksiyon tanımı, sınıf metodu veya çalıştırılabilir fonksiyon gövdesi bulunmamaktadır. Sadece aşağıdaki sabitler tanımlıdır:
- `adminCardClass` — Şablon (template) kullanımı için tanımlanmış CSS sınıfı değeri
- `adminCardPaddedClass` — Şablon (template) kullanımı için tanımlanmış dolgulu admin kartı CSS sınıfı değeri
- `adminSelectStyle` — Admin arayüzü select bileşenleri için stil tanımları içeren nesne

---

## NODE ID STANDARD

  file: src\utils\adminUi.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: adminCardClass
  export: adminCardPaddedClass
  export: adminSelectStyle