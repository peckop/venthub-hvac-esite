---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\tr.ts
skeleton_hash: 0ef5baec42ff8847
generated_at: 2026-05-25T09:09:35Z
---

## Genel Bakış
VentHub HVAC projesinin uluslararaslaştırma (i18n) altyapısı için hazırlanmış tamamen statik Türkçe çeviri sözlüğü modülüdür. Uygulama arayüzünde kullanılacak tüm metinlerin Türkçe karşılıklarını barındıran tek bir sabit nesne içerir, hiçbir çalıştırılabilir fonksiyon, dış bağımlılık, ortam değişkeni, harici API veya veri tabanı sorgulaması barındırmaz. Projenin dil yükleme mekanizması tarafından içe aktarılarak Türkçe kullanıcı arayüzünün oluşturulmasını sağlayan temel veri modülüdür.

## Modül İçeriği Notu
Bu modülde herhangi bir fonksiyon, metot veya sınıf tanımı bulunmamaktadır. Yalnızca tüm Türkçe çeviri anahtar ve değerlerini tutan `tr` adında bir sabit nesne tanımı mevcuttur, proje yapısındaki sabit konumundan taşınması veya içindeki eksik çeviri anahtarları uygulamanın çalışmasını veya Türkçe arayüzün kullanılmasını engeller.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinin uluslararasılaştırma (i18n) altyapısı için kullanılan, yalnızca sabit Türkçe çeviri sözlüğü nesnesini barındıran veri modülüdür.

[Aksiyom 1]: Eğer modül içerisinde tanımlanan `tr` sabit nesnesi mevcut değilse, uygulamanın i18n dil yükleme mekanizması Türkçe dil paketini bulamaz, dil seçiminde hata fırlatır ve Türkçe arayüz kullanılamaz hale gelir.
[Aksiyom 2]: Eğer `tr` nesnesi içinde uygulama tarafından referans gösterilen tüm i18n anahtarları tanımlı değilse, ilgili arayüz metinleri yerine geçersiz yedek değer veya boş metin gösterilir, kullanıcı arayüzünde görünüm bozuklukları oluşur.
[Aksiyom 3]: Eğer modül dosyası proje yapısında tanımlanan sabit konumundan `src/i18n/dictionaries/tr.ts` taşınır veya silinirse, proje içindeki tüm bu modüle yapılan içe aktarma (import) işlemleri başarısız olur, uygulama başlatılamaz.

---



---

---



---

## SABİTLER
- **tr** (object) — `{
  common: {
    addToProject: 'Proje Listesine Ekle',
    loadingApp: 'V...`

---

## AST POINTERS

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: tr