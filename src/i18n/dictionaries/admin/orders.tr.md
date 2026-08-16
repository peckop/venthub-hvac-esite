---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\orders.tr.ts
skeleton_hash: 9194c2f8be709bad
entity_hashes:
  overview: f65c48db03384b35
generated_at: 2026-08-16T08:37:43Z
---

## Genel Bakış
Bu modül, admin panelindeki sipariş yönetimi ekranlarında kullanılan Türkçe metinlerin ve çevirilerin tutulduğu merkezi bir sözlük dosyasıdır. Temel amacı, uygulama genelinde tutarlı ve yönetilebilir bir dil kaynağı sağlamaktır.

## Fonksiyon Grupları
Dosyada tanımlı bir fonksiyon bulunmamaktadır. Modül, üst seviye bir nesne ihracatı (export) ile çalışır.

### Sözlük Yapısı ve İçerik
Dosyanın tek ve temel bileşeni, `orders` adlı bir nesnedir. Bu nesne, sipariş akışına ait tüm arayüz metinlerini (başlıklar, buton isimleri, durum etiketleri, hata ve başarı mesajları vb.) anahtar-değer çiftleri olarak organize eder.
- `orders` nesnesi (ihracat edilen ana yapı)

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir uygulama içinde sipariş (order) ile ilgili metinlerin (örn. buton isimleri, hata mesajları, durum başlıkları) Türkçe çevirisini sağlayan bir sözlük (dictionary) nesnesi tanımlar.

[Aksiyom 1]: Eğer `orders` sabit nesnesi modülde tanımlı ve dışa aktarılmamışsa, uygulamanın siparişle ilgili arayüzleri tanımlı Türkçe metinleri gösteremez ve potansiyel olarak "undefined" veya hatalı metinlerle karşılaşır.

[Aksiyom 2]: Eğer `orders` nesnesinin yapısı, uygulamanın ilgili bölümlerinde (sipariş listeleme, detay, form vb.) beklenen tüm anahtarları (keys) içermiyorsa, o kısımlarda çeviri eksikliği oluşur ve hata fırlatılabilir veya ham anahtar isimleri görünür.

[Aksiyom 3]: Eğer `orders` nesnesi geçerli bir TypeScript/JavaScript objesi (JSON yapısına uygun bir literal) olarak tanımlanmamışsa, modülün derlenme/çalışma zamanında hata fırlatmasına yol açar.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **orders** (object) — `{
      view_list: 'Liste Görünümü',
      view_board: 'Pano Görünümü',
  ...`

---

## AST POINTERS

Fonksiyon bulunamadı.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\orders.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: orders