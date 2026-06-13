---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\users.en.ts
skeleton_hash: 40a49da56d2831d6
entity_hashes:
  overview: e82fc2cbc75bd133
generated_at: 2026-06-13T11:18:47Z
---

## Genel Bakış
Bu modül, ventilasyon ve iklimlendirme (HVAC) sistemi yönetim panelinin "Kullanıcılar" bölümü için İngilizce dil dosyasıdır. Temel olarak, arayüzde yer alan metinlerin ve etiketlerin yerelleştirilmiş (localized) karşılıklarını tanımlayan statik bir sözlük (dictionary) yapısı içerir. Modül, bir uygulama içi çeviri sistemi (i18n) tarafından yüklenerek kullanıcı arayüzündeki metinlerin dinamik olarak doğru dilde gösterilmesini sağlar.

## Fonksiyon Grupları
Bu dosyada herhangi bir fonksiyon veya metot bulunmamaktadır. Modül, üst düzey bir sabit (constant) tanımından ibarettir.

### Tanımlı Veri Yapısı
Modül, `users` adında bir nesne tanımlar. Bu nesne, kullanıcı yönetimi arayüzündeki farklı ekran ve bileşenler için çeviri anahtarlarını (translation keys) ve metinleri içeren iç içe bir yapıya sahiptir.
- `users` sabiti (nesnesi), alt kısımlar olarak `headers` (sayfa başlıkları), `table` (tablo sütun başlıkları), `form` (form alanları ve mesajları) ve `modal` (onay modalı metinleri) gibi bölümleri düzenli bir şekilde gruplandırır.

### Modülün Amacı ve Kullanım Yeri
Bu dosya, doğrudan bir API'ye istek yapmaz veya ortam değişkenlerini okumaz. Tamamen statik bir veri kaynağı olarak, uygulamanın kullanıcı arayüzündeki metinleri yöneten i18n altyapısına hizmet eder. İlgili React veya Vue bileşenleri, bu sözlükten ilgili anahtarı (key) çekerek ekranda doğru metni gösterir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **users** (object) — `{
      subtitle: 'Manage system users and their roles.',
      tabs: {
     ...`

---

## AST POINTERS

Bu dosyada (`users.en.ts`) **hiç fonksiyon bulunmamaktadır**.

Dosya yapısı itibarıyla bir **i18n sözlük/diclık dosyasıdır** ve yalnızca bir `users` sabit nesnesi (object) içermektedir. Bu nesne, kullanıcı yönetimi arayüzünün İngilizce çeviri stringlerini barındırır. Fonksiyon imzası, gövde veya sınıf tanımı mevcut değildir.

**Sonuç:** AST Pointer üretimi için işlenecek fonksiyon yoktur.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\users.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: users