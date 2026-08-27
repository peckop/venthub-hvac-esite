---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\KVKKPage.tsx
skeleton_hash: d406f13943594ad8
entity_hashes:
  func:KVKKPage: c8227669ffe84eef
  func:t: 74dcb4aee57da53f
  overview: 4b46a026af25835a
  style_tokens: 06829f9d93bd4397
generated_at: 2026-08-27T07:35:06Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yasal sayfalar bölümüne ait KVKK (Kişisel Verilerin Korunması Kanunu) bilgilendirme sayfasını tanımlayan bir React görünüm bileşenidir. Dil parametresine göre Türkçe veya İngilizce statik yasal içerik sunar; herhangi bir veri işleme veya durum yönetimi içermez.

## Fonksiyon Grupları

### Sayfa Bileşeni
KVKK bilgilendirme sayfasının tüm görünüm yapısını oluşturan ana bileşendir. Dil seçimine göre uygun yasal metni render eder.
- KVKKPage

### Çeviri Yardımcısı
Sayfa içindeki metinlerin dile göre doğru karşılığını döndüren yardımcı fonksiyondur.
- t

## Bağımlılıklar

**Dış Bağımlılıklar:**
- `KvkkContentTr`: Türkçe KVKK içeriğini sağlayan modül. Tanımlı değilse bileşen hata verir.
- `KvkkContentEn`: İngilizce KVKK içeriğini sağlayan modül. Tanımlı değilse bileşen hata verir.
- React kütüphanesi

**İç Bağımlılıklar:**
- `KVKKPage` bileşeni, `t` fonksiyonunu ve dil bazlı içerik modüllerini çağırır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, gövdeden çıkarılacak aksiyom üretilemez.

---

## FONKSİYON DETAYLARI

### KVKKPage
**Ne yapar**: KVKK (Kişisel Verilerin Korunması Kanunu) sayfasını render eden bir React bileşenidir. Kullanıcının dil tercihine göre Türkçe veya İngilizce içerik gösterir ve yasal içerik hazır değilse taslak uyarısı görüntüler.

**Nasıl yapar**: Bileşen, `lang` parametresine göre uygun dil sözlüğünü (`en` veya `tr`) seçer ve `t` adlı iç fonksiyon tanımlayarak çeviri anahtarlarından metin değerlerini alır. `isLegalContentReady()` fonksiyonunun dönüş değerini kontrol eder; eğer yasal içerik hazır değilse sarı renkli bir uyarı kutusu gösterir. Dil seçimine göre `KvkkContentEn` veya `KvkkContentTr` bileşenlerinden birini render eder. Sayfa yapısı, üstbilgi başlığı, içerik alanı ve altbilgi sorumluluk reddi metni olmak üzere üç ana bölümden oluşur.

**Parametreler**:
- lang: string — Sayfanın görüntüleneceği dili belirten parametre. `'en'` veya `'tr'` değerlerinden birini alır.

**Dönüş**: React fonksiyonel bileşeni döndürür. JSX yapısı içinde `div`, `h1`, `p` gibi HTML elementleri ve `KvkkContentEn`/`KvkkContentTr` bileşenlerini içerir.

### t
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: ../../i18n/getDictValue::getDictValue
- import: ./components/en/KvkkContent::KvkkContentEn
- import: ./components/tr/KvkkContent::KvkkContentTr
- import: @/config/legal::isLegalContentReady
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/KVKKPage.tsx::KVKKPage
- **params**: `lang` — dil seçimi için kullanılan string parametre
- **ic_degiskenler**:
  - `dict` — `lang === 'en'` koşuluna göre `en` veya `tr` sözlüğünü seçen değişken
  - `t` — `getDictValue(dict, key)` çağrısı yapan, sözlükten değer almak için kullanılan fonksiyon
- **Dönüş**: JSX — KVKK sayfası içeriğini render eden React bileşeni

### [N2_NASIL] AST Pointer: src/views/legal/KVKKPage.tsx::t
- **params**: `key` — sözlükte aranacak anahtar değeri (string)
- **ic_degiskenler**: yok
- **Dönüş**: `getDictValue(dict, key)` fonksiyonunun dönüş değeri

---

## NODE ID STANDARD

  file: src\views\legal\KVKKPage.tsx
  function: src\views\legal\KVKKPage.tsx::KVKKPage
  function: src\views\legal\KVKKPage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: KVKKPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `bg-yellow-50`, `border-light-gray`, `border-yellow-200`, `text-3xl`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-xs`, `text-yellow-800`
- **Layout:** `bg-yellow-50`, `border-yellow-200`, `max-w-4xl`, `max-w-prose`, `p-4`, `p-6`, `shadow-sm`, `text-yellow-800`
- **Varyant/Responsive:** `dark:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `dark:prose-invert`, `font-bold`, `lg:px-8`, `mb-6`, `mt-4`, `mx-auto`, `prose`, `px-4`, `py-10`, `rounded-lg`, `rounded-xl`, `sm:px-6`, `space-y-6`