---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\movements.tr.ts
skeleton_hash: e79560ab4ea296d0
entity_hashes:
  overview: 913c3c44e13878f9
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış

Bu modül, VentHub HVAC admin panelinin "Hareketler" (Movements) bölümü için Türkçe çeviri sözlüğünü içerir. Uluslararasılaştırma (i18n) sisteminin bir parçası olarak, depo hareketleriyle ilgili arayüz metinlerini ve etiketleri merkezi bir konumda yönetir. Dosya, `movements` adlı nesne olarak dışa aktarılır ve uygulama çalışırken Türkçe dil seçeneğinde kullanılır.

## Modül Yapısı

Bu dosyada fonksiyon bulunmamaktadır. Modül seviyesinde tanımlanmış tek bir sabit (const) export bulunmaktadır: **movements**. Bu nesne, admin panelinin hareket/giriş-çıkış ekranlarında görünen tüm metinlerin Türkçe karşılıklarını anahtar-değer çiftleri olarak saklar. Örneğin; tablo başlıkları, buton etiketleri, hata mesajları, form alanları ve onay dialogları gibi UI metinleri bu yapı içinde tanımlıdır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, yalnızca statik bir çeviri sözlüğü (nesne sabiti) dışa aktaran bir i18n dosyasıdır; herhangi bir fonksiyon gövdesi veya çalış zamanı mantığı içermez. Dolayısıyla mimari aksiyomlar son derece sınırlıdır.

**[Aksiyom 1]:** Eğer `movements` nesnesi doğru şekilde export edilmemişse, i18n sistemi Türkçe dil seçeneğinde hareket ekranlarındaki metinleri yükleyemez ve arayüzde çeviri anahtarları (örn. `"movements.someKey"`) ham metin olarak görünür olur.

**[Aksiyom 2]:** Eğer `movements` nesnesinin değerleri string dışı bir tipe sahipse (örn. `null`, `undefined`, nesne), i18n render fonksiyonu beklenen metin yerine hata veya boş değer döndürür; arayüzde metin alanları kırılır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **movements** (object) — `{
      subtitle: 'Envanter giriş/çıkış hareketlerini izleyin, filtreleyin ve...`

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