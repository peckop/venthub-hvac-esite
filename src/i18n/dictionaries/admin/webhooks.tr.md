---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\webhooks.tr.ts
skeleton_hash: 44ea5b993477b065
entity_hashes:
  overview: a695b1bd72d402b4
generated_at: 2026-06-19T20:47:54Z
---

## Genel Bakış

Bu modül, VentHub HVAC yönetim panelindeki webhook yönetim arayüzünün Türkçe çeviri sözlüğünü içerir. `webhooks` sabit bir nesne olarak tanımlanmıştır ve webhook ile ilgili tüm arayüz metinlerini (başlıklar, butonlar, mesajlar, hata uyarıları vb.) Türkçeye çevirileri barındırır. Modül, uluslararasılaştırma sistemi tarafından içe aktarılarak admin panelinin Türkçe görüntülenmesini sağlar.

## İçerik

Dosyada fonksiyon bulunmamaktadır. Modül seviyesinde tanımlı `webhooks` sabiti, aşağıdaki bilgi türlerini içerir:

- Webhook listesi ve yönetim ekranı metinleri
- Webhook oluşturma/düzenleme formu etiketleri
- Durum mesajları ve hata uyarıları
- Onay dialogları ve Silme işlemleri ile ilgili metinler

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir i18n (uluslararasılaştırma) sözlük dosyasıdır ve sadece statik bir çeviri nesnesi (webhooks) içerir. Fonksiyon imzası bulunmamaktadır.

[Aksiyom 1]: Eğer `webhooks` nesnesi tanımlı değilse veya boş bir nesne olarak导出 edilmişse, bu dil dosyası (tr) için webhook ile ilgili hiçbir çeviri anahtarı kullanılamaz ve uygulamada ilgili alanlarda çeviri metinleri gösterilemez.

[Aksiyom 2]: Eğer bu dosya uygulama içinde bir dil değiştirme (locale switching) mekanizması tarafından yüklenmezse, Türkçe çeviri sözlüğü hiçbir zaman pasif hale gelmez ve varsayılan dil olarak kalmaya devam eder.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **webhooks** (object) — `{
  subtitle: 'Sistemler arası veri akışını ve otomatik bildirimleri izleyin...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır. Dosya, `webhooks` adında bir sabit (constant) nesne içermektedir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\webhooks.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: webhooks