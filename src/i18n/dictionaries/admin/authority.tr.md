---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\authority.tr.ts
skeleton_hash: adf6e51757d1c5ca
entity_hashes:
  overview: d75139dd453d58b5
generated_at: 2026-06-16T10:18:09Z
---

## Genel Bakış
Bu modül, uygulamanın yönetici (admin) arayüzündeki yetkilendirme (authority) ile ilgili tüm kullanıcı arayüzü metinlerinin Türkçe çevirisini tutan bir sözlük dosyasıdır. Modül, bir nesne yapısı içinde anahtar-değer çiftleri olarak tanımlanmış statik bir çeviri verisi sağlar.

## Modül Yapısı ve Kullanım
Modül, `authority` adlı tek bir büyük nesne dışa aktarır. Bu nesne içindeki anahtarlar, uygulamanın farklı bölümlerindeki (örn. roller, izinler) metinlerin Türkçe karşılıklarını temsil eder. Dosya doğrudan bir fonksiyon veya API çağırmaz; yerine, i18n (uluslararasılaştırma) sistemi tarafından diğer bileşenlerin tüketilmesi için bir kaynak olarak kullanılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyonel aksiyom tanımlanmamıştır.

**Açıklama:** Bu modül bir i18n çeviri sözlüğü dosyasıdır (`authority` object). Fonksiyon içermeyen, salt veri yapısı (dictionary/const) barındıran bir kaynak dosyasıdır. Mimari varsayımlar fonksiyon gövdesianalizine dayandığından, bu modül için çıkarılabilecek fonksiyonel aksiyom bulunmamaktadır.

**Yapısal not (aksiyom değil):** Modül, `authority` adında bir object sabiti içermektedir. Bu yapının geçerli bir TypeScript sözlük yapısında olması ve i18n sistemi tarafından okunabilir formatta sunulması beklenir — ancak bu koşullar fonksiyon imzasından değil, modülün genel amacından türetilen beklentilerdir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **authority** (object) — `{
      leftSideEski: 'Sol Taraf (Eski)',
      labelTraditional: 'Etiket (...`

---

## AST POINTERS

Bu dosya **i18n sözlük dosyası**dır ve **fonksiyon içermez**.

### Dosya Yapısı

`authority` — TypeScript sabit nesnesi (translation dictionary)
- **Tür**: `Record<string, string>` formatında çeviri sözlüğü
- **Amaç**: Admin panelindeki "Yetki/Authority" ile ilgili arayüz metinlerinin Türkçe çevirilerini tutar
- **Kullanım**: uygulamada `t('authority.xxx')` çağrısıyla erişilir
- **Erişim türü**: `export` ile dışa açık sabit

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\authority.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: authority