---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\ui.en.ts
skeleton_hash: e00e60c032ddb977
entity_hashes:
  overview: 1ca0cb4cc145d139
generated_at: 2026-08-15T18:26:23Z
---

## Genel Bakış

Bu modül, VentHub HVAC admin panelinin kullanıcı arayüzündeki metinlerin İngilizce çevirilerini içeren bir uluslararasılaştırma (i18n) sözlüğü tanımlar. Dosya, panel genelinde kullanılan başlık, buton etiketi, hata mesajı gibi tüm UI metinlerini merkezi bir noktada toplayarak tutarlı bir dil yönetimi sağlar.

## İçerik Özeti

`ui` adlı bir sabit nesne tanımlanmıştır. Bu nesne, admin panelinin çeşitli ekranlarında ve bileşenlerinde görüntülenen tüm İngilizce metinleri anahtar-değer çiftleri olarak içerir. Her anahtar, bir UI bileşeninde kullanılacak metnin tanımlayıcısıdır; değer ise ekranda gösterilecek İngilizce metindir. Dosyada herhangi bir fonksiyon, import veya dış bağımlılık bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, uluslararasılaştırma (i18n) sözlük verisi içeren bir kaynaktır. Fonksiyon içermediği için minimal mimari varsayımlar geçerlidir.

**[Aksiyom 1]:** Eğer `ui` nesnesi içe aktarılamazsa (export edilmezse), admin paneli İngilizce arayüz metinlerini görüntüleyemez.

**[Aksiyom 2]:** Eğer `ui` nesnesinde beklenen bir çeviri anahtarı (translation key) eksikse, ilgili arayüz bileşeni tanımsız/metin göstermeden kalır.

**[Aksiyom 3]:** Eğer bu dosya i18n sistemi tarafından yüklenemezse, admin paneli varsayılan/boş metinlerle çalışır veya hata verir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **ui** (object) — `{
  prev: 'Previous',
  next: 'Next',
  refresh: 'Refresh',
  loading: 'L...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/i18n/dictionaries/admin/ui.en.ts::ui (Sabit Nesne)
- **params**: Parametre yok (bu bir fonksiyon değil, sabit bir nesnedir)
- **ic_degiskenler**: Fonksiyon gövdesi bulunmamaktadır. Dosya, `ui` adlı bir sabit (nesne) içermektedir.
- **Dönüş**: Bu bir fonksiyon değil, bir nesne tanımıdır. Geri dönüş değeri yoktur.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\ui.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: ui