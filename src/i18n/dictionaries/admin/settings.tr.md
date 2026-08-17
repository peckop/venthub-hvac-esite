---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\settings.tr.ts
skeleton_hash: 00df6988d836f461
entity_hashes:
  overview: a6820ef6861612f2
generated_at: 2026-08-15T18:48:28Z
---

## Genel Bakış

Bu dosya, VentHub HVAC platformunun admin panelindeki "Ayarlar" sayfası için Türkçe çeviri sözlüğüdür. `settings` sabit nesnesi içinde, ayarlar arayüzünde yer alan tüm etiketler, başlıklar, açıklayıcı metinler ve hata/başarı iletileri anahtar-değer çiftleri olarak tanımlanmıştır. Dosya herhangi bir fonksiyon veya mantık içermez; salt statik bir kaynak (resource) dosyasıdır ve uygulama çalışma zamanında i18n altyapısı tarafından okunarak kullanıcı arayüzündeki metinlerin Türkçe karşılıklarını sağlar.

## Modül Yapısı

### settings Sözlüğü

Dosyanın tek ve ana yapısı olan `settings` nesnesi, admin ayarları sayfasının tüm Türkçe metin içeriğini tutar. Bu nesne muhtemelen şu gibi alt kategorilerden oluşur:

- Sayfa başlıkları ve alt başlıklar (örn. genel ayarlar, bildirim tercihleri, firma bilgileri)
- Form etiketleri ve PlaceHolder metinleri (örn. "Şirket Adı", "E-posta adresi girin")
- Onay/durum iletileri (örn. başarı, hata, uyarı mesajları)
- Buton metinleri ve eylem açıklamaları (örn. "Kaydet", "Sıfırla")

Bu sözlük doğrudan i18n modülüne bağlı olarak çalışır ve dil değiştirme (locale geçişi) sırasında ilgili sayfadaki tüm metinlerin güncellenmesini sağlar.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi bulunmadığından, fonksiyon tabanlı mimari varsayımlar üretilememiştir.

**Modül yapısı notu:** Modül yalnızca `settings` adında bir nesne (object) sabiti içermektedir. Bu bir i18n/çeviri sözlüğü yapısıdır ve iş mantığı içermez.

[Aksiyom 1]: Eğer `settings` nesnesi ihracatı (export) yapılamazsa, uygulamanın admin ayarları sayfasındaki tüm çeviriler eksik/bozuk olur ve kullanıcı arayüzünde ham anahtar değerleri (key) görünür.

[Aksiyom 2]: Eğer `settings` nesnesi içinde beklenen çeviri anahtarları (key'ler) eksikse, ilgili UI bileşenlerinde tanımsız/metin boşluğu sorunları oluşur.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **settings** (object) — `{
      addAdmin: 'Yeni Yönetici Ekle',
      adminsDesc: 'Platform yönetic...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır.

**Dosya**: `C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\settings.tr.ts`

**İçerik**: Dosya yalnızca bir sabit (constant) içermektedir:
- `settings` — Türkçe dil dosyası, admin ayarları sayfası için çeviri metinlerini tutan nesne yapısıdır

Fonksiyon imzası, fonksiyon gövdesi veya class yapısı bulunmadığından AST Pointer üretilememektedir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\settings.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: settings