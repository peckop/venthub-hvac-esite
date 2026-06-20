---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\playwright.config.ts
skeleton_hash: c2a3f634c02b669d
entity_hashes:
  overview: e72aa38ff0954fb5
generated_at: 2026-06-19T20:51:03Z
---

## Genel Bakış

Bu dosya, Playwright test çerçevenin ana yapılandırma dosyasıdır. `@playwright/test` kütüphanesinden alınan `defineConfig` ve `devices` yardımıyla test ortamını, tarayıcı ayarlarını ve test çalışma planını tanımlar. Geliştirme sunucusu (`PORT`, `BASE_URL`) gibi ortam değişkenlerini referans alarak entegrasyon testlerinin doğru adres ve bağlantı bilgileriyle çalışmasını sağlar.

## Fonksiyon Grupları

Dosyada fonksiyon bulunmamaktadır — bu bir modül değil, üst seviye yapılandırma betiğidir (top-level statements).

---

## AXIOMS – Mimari Varsayımlar

Bu modül (Playwright konfigürasyon dosyası) için fonksiyon gövdesi bulunmadığından, yalnızca modül sabitlerinin kullanımına dayalı mimari varsayımlar tanımlanabilir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: @playwright/test::defineConfig
- import: @playwright/test::devices

---

## SABİTLER
- **PORT** [env-backed] (call) — `Number(process.env.E2E_PORT || 3000)`
- **BASE_URL** [env-backed] (binary_expression) — `process.env.E2E_BASE_URL || `http://localhost:${PORT}``

---

## AST POINTERS

Bu dosya **Playwright yapılandırma dosyasıdır** (`playwright.config.ts`) ve **içerisinde tanımlı fonksiyon gövdesi bulunmamaktadır**.

### Yapılanma Özeti

| Öğe | Durum |
|-----|-------|
| Fonksiyon gövdeleri | **Yok** |
| Sınıflar | **Yok** |
| Export edilen fonksiyon | **Yok** — doğrudan `defineConfig({...})` nesnesi export edilir |
| Çağrı ilişkileri | **Yok** |

### Tanımlı Sabitler

- **`PORT`** — `call` türünde ifade; muhtemelen bir fonksiyon çağrısı ile port numarası üretir (örn. `process.env.PORT` veya benzeri)
- **`BASE_URL`** — `binary_expression` türünde ifade; string birleşimi ile temel URL oluşturulur (örn. `http://localhost:${PORT}`)

### Kullanılan Importlar

- **`defineConfig`** — `@playwright/test` modülünden; config nesnesini tip-güvenli olarak sarmalar
- **`devices`** — `@playwright/test` modülünden; cihaz boyutlandırma listesi (örn. `'iPhone 13'`, `'Desktop Chrome'`)

---

## NODE ID STANDARD

  file: playwright.config.ts