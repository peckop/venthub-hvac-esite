---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\tr.ts
skeleton_hash: 45a0b72e2472593c
generated_at: 2026-05-23T22:30:32Z
---

## Genel Bakış
VentHub HVAC projesinin uluslararaslaştırma (i18n) altyapısı için hazırlanmış statik Türkçe çeviri sözlüğü modülüdür. İçerisinde herhangi bir çalıştırılabilir fonksiyon veya dış bağımlılık bulunmayan, sadece proje arayüzünde kullanılacak tüm metinlerin Türkçe karşılıklarını barındıran `tr` adında bir sabit değişken barındırır. Herhangi bir ortam değişkeni, harici API veya veri tabanı sorgulaması yapmayan tamamen statik bir sözlük dosyasıdır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinin uluslararasılaştırma (i18n) altyapısı için kullanılan, yalnızca sabit Türkçe çeviri sözlüğü nesnesini barındıran veri modülüdür.

[Aksiyom 1]: Eğer modül içerisinde tanımlanan `tr` sabit nesnesi mevcut değilse, uygulamanın i18n dil yükleme mekanizması Türkçe dil paketini bulamaz, dil seçiminde hata fırlatır ve Türkçe arayüz kullanılamaz hale gelir.
[Aksiyom 2]: Eğer `tr` nesnesi içinde uygulama tarafından referans gösterilen tüm i18n anahtarları tanımlı değilse, ilgili arayüz metinleri yerine geçersiz yedek değer veya boş metin gösterilir, kullanıcı arayüzünde görünüm bozuklukları oluşur.
[Aksiyom 3]: Eğer modül dosyası proje yapısında tanımlanan sabit konumundan `src/i18n/dictionaries/tr.ts` taşınır veya silinirse, proje içindeki tüm bu modüle yapılan içe aktarma (import) işlemleri başarısız olur, uygulama başlatılamaz.

---



---

## SABİTLER
- **tr** (object) — `{
  common: {
    addToProject: 'Proje Listesine Ekle',
    loadingApp: 'V...`

---

## AST POINTERS

Analiz edilen kaynak dosya `C:\Users\alize\venthub-hvac\src\i18n\dictionaries\tr.ts` üzerinde herhangi bir fonksiyon, metot veya sınıf tabanlı üye fonksiyonu tanımlanmamıştır. Dosyada yalnızca `tr` adında nesne (object) türünde bir sabit tanımı mevcuttur, yürütülebilir herhangi bir fonksiyon gövdesi bulunmamaktadır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: tr