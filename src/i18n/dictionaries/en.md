---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\en.ts
skeleton_hash: 92f29717e0b69730
entity_hashes:
  overview: ae56d958419ef214
generated_at: 2026-06-13T11:19:33Z
---

## Genel Bakış

Bu modül, VentHub HVAC projesinin uluslararasılaştırma (i18n) altyapısında kullanılan İngilizce dil sözlüğünü tanımlayan statik bir veri dosyasıdır. Uygulamanın tüm arayüz metinlerini — buton etiketleri, hata mesajları, menü başları ve benzeri kullanıcıya görünen tüm metinleri — tek bir `en` nesnesi altında merkezi olarak tanımlar. Modül herhangi bir işlevsel mantık, API çağrısı veya ortam değişkeni kullanmaz; yalnızca `i18n` çekirdek modülü tarafından içe aktarılan ve çeviri kaynağı olarak tüketilen saf bir sabitler kümesidir.

---

## Fonksiyon Grupları

Bu dosyada herhangi bir fonksiyon veya metod bulunmamaktadır. Modül, yalnızca dışa aktarılan statik bir sözlük nesnesi içeren bir veri dosyasıdır; dolayısıyla fonksiyon gruplaması yapılamaz.

---

> **Not:** Dosya içeriği bir import bildirimi ve bir nesne tanımından ibarettir — çalıştırılabilir bir kod bloğu veya fonksiyon imzası yer almamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Modül yalnızca statik bir çeviri sözlüğü (`en` nesnesi) içermekte olup herhangi bir fonksiyon, iş mantığı veya koşullu akış içermediğinden, fonksiyon gövdesinden türetilebilecek mimari varsayım bulunmamaktadır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **en** (object) — `{
  common: {
    loadingApp: 'Loading VentHub... ',
    loading: 'Loading......`

---

## AST POINTERS

### Dosya Yapısı: `src/i18n/dictionaries/en.ts`

**NOT**: Bu dosyada **fonksiyon tanımları bulunmamaktadır**. Dosya, import edilen nesneleri birleştiren bir TypeScript sözlük (dictionary/constant) dosyasıdır.

---

#### Import Edilen Bağımlılıklar

| Import | Kaynak | Kullanım |
|--------|--------|----------|
| `admin` | `./admin/en` | İngilizce admin çeviri nesnesi |
| `tr` | `./tr` | Türkçe çeviri nesnesi (fallback/referans) |

---

#### Sabit Tanımları

| Sabit | Tip | Açıklama |
|-------|-----|----------|
| `en` | `object` | Ana İngilizce çeviri sözlüğü — tüm UI metinlerini içerir |

---

#### Fonksiyon Gövdeleri

**Bu dosyada fonksiyon gövedesi bulunmamaktadır.**

AST Pointer üretimi için en az bir fonksiyon tanımı gereklidir. Dosya salt veri tanımı (nesne/const) içerdiği için `ic_degiskenler`, `params` ve `Dönüş` analizi uygulanamaz.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: en