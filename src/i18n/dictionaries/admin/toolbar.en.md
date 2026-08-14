---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\toolbar.en.ts
skeleton_hash: 12a56541c6d987f7
entity_hashes:
  overview: 3efab1f125273943
generated_at: 2026-06-19T20:47:54Z
---

## Genel Bakış
Bu modül, bir yönetici paneli (admin) arayüzündeki araç çubuğu (toolbar) bileşeninin İngilizce metinlerini ve aralarındaki hiyerarşik yapıyı tanımlayan statik bir sözlük (dictionary) yapısıdır.Uluslararasılaştırma (i18n) süreçlerinde kullanılmak üzere tüm ekran metinlerini tek bir merkezi yerden yönetmeyi ve tutarlılık sağlamayı amaçlar.

## Fonksiyon Grupları
Dosya içinde tanımlanmış herhangi bir fonksiyon veya method bulunmamaktadır. Sadece modül seviyesinde, bir nesne yapısı olarak “toolbar” adında bir sabit (sabit bir sözlük) tanımlanmıştır. Bu yapı, arayüzde yer alacak tüm metinleri ve olası alt menü/aktion isimlerini içermektedir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir toolbar çeviri sözlüğü olup fonksiyon içermemektedir. Dolayısıyla çalışmasına ilişkin fonksiyonel aksiyom tanımlanmamıştır.

**Yapısal varsayımlar:**

[Aksiyom 1]: Eğer `toolbar` objesi tanımlı değilse veya bir string-değer çifti içermiyorsa, ilgili admin arayüzünde toolbar metinleri gösterilemez.

[Aksiyom 2]: Eğer `toolbar` objesinde beklenen bir çeviri anahtarı eksikse, arayüzde o alanda boş string veya fallback değer görüntülenir.

[Aksiyom 3]: Eğer `toolbar` objesi değiştirilirse (ör. yeni anahtar eklenip eskisi kaldırılırsa), Dependanslı bileşenlerde derleme zamanı hataları oluşabilir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **toolbar** (object) — `{
  searchPlaceholder: 'Search',
  clear: 'Clear',
  records: 'records',
...`

---

## AST POINTERS

Bu dosya (`toolbar.en.ts`) bir **i18n sözlük dosyasıdır** ve **hiçbir fonksiyon içermemektedir.**

### Sadece Sabit Tanımları Mevcut

- **`toolbar`** — `object` türünde bir sabit; admin paneli araç çubuğu metinlerini (İngilizce) tutar. String değerlerden oluşan bir key-value yapısındadır. Fonksiyon değil, doğrudan export edilen bir nesnedir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\toolbar.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: toolbar