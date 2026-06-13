---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\movements.tr.ts
skeleton_hash: 338ffdee324c79cb
entity_hashes:
  overview: 913c3c44e13878f9
generated_at: 2026-06-13T11:14:32Z
---

## Genel Bakış

Bu modül, VentHub HVAC admin panelinin "Hareketler" (Movements) bölümü için Türkçe çeviri sözlüğünü içerir. Uluslararasılaştırma (i18n) sisteminin bir parçası olarak, depo hareketleriyle ilgili arayüz metinlerini ve etiketleri merkezi bir konumda yönetir. Dosya, `movements` adlı nesne olarak dışa aktarılır ve uygulama çalışırken Türkçe dil seçeneğinde kullanılır.

## Modül Yapısı

Bu dosyada fonksiyon bulunmamaktadır. Modül seviyesinde tanımlanmış tek bir sabit (const) export bulunmaktadır: **movements**. Bu nesne, admin panelinin hareket/giriş-çıkış ekranlarında görünen tüm metinlerin Türkçe karşılıklarını anahtar-değer çiftleri olarak saklar. Örneğin; tablo başlıkları, buton etiketleri, hata mesajları, form alanları ve onay dialogları gibi UI metinleri bu yapı içinde tanımlıdır.

---

# AXIOMS – Mimari Varsayımlar

Bu modül, admin paneli "hareketler" (movements) ekranı için Türkçe çeviri sözlüğü içeren statik bir i18n modülüdür.

---

**[Aksiyom 1]:** Eğer `movements` nesnesi tanımlı değilse veya boş `{}` ise, admin panelinin hareketler ekranındaki tüm metin alanları boş/bozuk görünür.

**[Aksiyom 2]:** Eğer `movements` nesnesindeki herhangi bir çeviri anahtarı (key) eksikse, ilgili UI bileşeninde çeviri key'in kendisi ham metin olarak görüntülenir (fallback davranışı).

**[Aksiyom 3]:** Eğer bu dosya UTF-8 encoding ile kaydedilmemişse, Türkçe karakterler (ı, İ, ş, ç, ğ, ö, ü) hatalı render edilir.

**[Aksiyom 4]:** Eğer `movements` nesnesinin yapısı (iç içe key-value düzeni) tüketici tarafındaki `t('movements.xxx.yyy')` çağrılarıyla eşleşmiyorsa, ilgili çeviriler bulunamaz ve UI'da hatalı/metin-dışı gösterim oluşur.

**[Aksiyom 5]:** Bu modül sadece **statik veri** içerir; herhangi bir fonksiyon, method veya hesaplama barındırmaz. Çalışma zamanında (runtime) modüle ait hiçbir yan etki (side-effect) oluşmaz.

---

> **Not:** Dosyanın gerçek içeriği (nested object yapısı ve key değerleri) paylaşılmadığı için, aksiyomlar modülün türüne (i18n dictionary) ve yapısına (movements object) dayalı olarak türetilmiştir. İçerik detayı paylaşıldığında aksiyomlar spesifik key'ler ile zenginleştirilebilir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **movements** (object) — `{
      batchFilterPrefix: 'Filtre: Toplu İşlem',
      export: {
        csv...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır.

**Dosya Yapısı Özeti:**
- `C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\movements.tr.ts`
- İçerik: Yalnızca `movements` sabit nesnesi (Türkçe çeviri sözlüğü)
- Fonksiyon: 0 adet
- Class: 0 adet
- Import: Yok

**Not:** Dosya, hareketler (movements) modülü için Türkçe çeviri dizisi içeren saf veri dosyasıdır. Fonksiyon gövdeleri, imza veya sınıf tanımı içermemektedir; dolayısıyla AST Pointer üretilemez.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\movements.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: movements