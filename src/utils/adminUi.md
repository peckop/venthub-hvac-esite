---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\adminUi.ts
skeleton_hash: a1f273fc5fa3ee67
entity_hashes:
  overview: f513c1020f198680
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış
VentHub HVAC projesinin src/utils dizininde yer alan bu modül, yönetici paneli arayüz bileşenleri için standartlaştırılmış görsel stiller ve CSS sınıf sabitleri barındıran basit bir yardımcı dosyasıdır. Dosyada herhangi bir fonksiyon, harici bağımlılık veya çalıştırılabilir mantık bulunmaz, sadece yönetici kartları için sınıflar, dolgulu kart sınıfı ve seçim alanları için still nesnesi olmak üzere üç adet yerel sabit içerir.

Bu modül hiçbir ortam değişkeni kullanmaz, harici API'ler ile iletişime geçmez ve herhangi bir veritabanı tablosunu sorgulamaz. Tüm sabitler, projenin tüm yönetici arayüz bileşenleri tarafından import edilerek kullanılarak proje genelinde tutarlı bir görsel deneyim sunulmasını hedefler.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, yalnızca sabit değerler (CSS sınıfları ve stil nesnesi) içeren bir yardımcı modüldür; çalıştırılabilir fonksiyon barındırmaz.

[Aksiyom 1]: Eğer `adminCardClass` sabiti string (template) formatında tanımlanmamışsa, projede bu sabiti import eden yönetici kart bileşenleri geçerli CSS sınıfı alamaz ve kartlar beklenmeyen görsel hata gösterir.

[Aksiyom 2]: Eğer `adminCardPaddedClass` sabiti string (template) formatında tanımlanmamışsa, dolgulu kart bileşenleri iç kenar boşluğunu alamaz ve içerik kenarlıklara yapışık render edilir.

[Aksiyom 3]: Eğer `adminSelectStyle` sabiti geçerli bir JavaScript nesnesi (CSS stilleri içeren key-value çiftleri) olarak tanımlanmamışsa, yönetici panelindeki seçim alanları (select) stilsiz veya tarayıcı varsayılan stiliyle görüntülenir ve tasarım tutarlılığı bozulur.

[Aksiyom 4]: Eğer bu modül projedeki bileşenler tarafından import edilemez (yani `adminUi.ts` dosyası doğru konumda değilse veya export yapılmamışsa), tüm yönetici arayüz bileşenleri tutarsız görsel stiller kullanır ve proje genelinde统一 bir görünüm sağlanamaz.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **adminCardClass** (template) — ``${glassStrongClass} rounded-hvac-xl transition-colors duration-500 hover:bor...`
- **adminCardPaddedClass** (template) — ``${adminCardClass} p-8 lg:p-10``
- **adminSelectStyle** (object) — `{ 
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.o...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır.

---

## NODE ID STANDARD

  file: src\utils\adminUi.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: adminCardClass
  export: adminCardPaddedClass
  export: adminSelectStyle