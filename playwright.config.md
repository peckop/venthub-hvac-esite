---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\playwright.config.ts
skeleton_hash: c2a3f634c02b669d
entity_hashes:
  overview: e72aa38ff0954fb5
generated_at: 2026-06-19T07:57:44Z
---

## Genel Bakış

Bu dosya, Playwright test çerçevenin ana yapılandırma dosyasıdır. `@playwright/test` kütüphanesinden alınan `defineConfig` ve `devices` yardımıyla test ortamını, tarayıcı ayarlarını ve test çalışma planını tanımlar. Geliştirme sunucusu (`PORT`, `BASE_URL`) gibi ortam değişkenlerini referans alarak entegrasyon testlerinin doğru adres ve bağlantı bilgileriyle çalışmasını sağlar.

## Fonksiyon Grupları

Dosyada fonksiyon bulunmamaktadır — bu bir modül değil, üst seviye yapılandırma betiğidir (top-level statements).

---

## AXIOMS – Mimari Varsayımlar

Bu modül (Playwright konfigürasyon dosyası) için fonksiyon gövdesi bulunmadığından, yalnızca modül sabitlerinin kullanımına dayalı mimari varsayımlar tanımlanabilir.

---

**[Aksiyom 1]**: Eğer **PORT sabitinin değeri** tanımlı ve erişilebilir bir port numarası değilse, Playwright test sunucusu başlatılamaz ve tüm testler bağlantı hatası ile başarısız olur.

**[Aksiyom 2]**: Eğer **BASE_URL sabitinin değeri** geçerli bir HTTP/HTTPS URL'si olarak yapılandırılmamışsa, Playwright tarayıcı navigasyonları hedef sunucuya ulaşamaz ve tüm sayfa tabanlı testler timeout ile sonuçlanır.

**[Aksiyom 3]**: Eğer **PORT ile BASE_URL'deki port bilgisi tutarsız** ise (farklı portlar referans ediliyorsa), test istemcisi yanlış adrese yönlendirilir ve bağlantı reddedilir.

**[Aksiyom 4]**: Eğer **BASE_URL**, çalıştırma ortamında (development, staging, production) erişilebilir bir sunucuyu işaret etmiyor ise, tüm Playwright tarayıcı senaryoları `ECONNREFUSED` veya benzeri ağ hatası ile başarısız olur.

---

> **Not:** Bu dosya bir Playwright konfigürasyon dosyası olduğundan, fonksiyon gövdesi içermemektedir. Aksiyomlar yalnızca tespit edilen sabitlerin (PORT, BASE_URL) mimari bağımlılıklarına dayanmaktadır. Sabitlerin somut değerleri analiz materyalinde verilmediği için değerler hakkında beyanda bulunulmamıştır.

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

> **Not:** Bu dosyada analiz edilebilecek herhangi bir fonksiyon gövdesi (`FONKSIYON GÖVDELERI`) yer almamaktadır. Tüm yapılandırma `defineConfig()` çağrı içinde nesne literal olarak tanımlanmıştır; bu nedenle AST Pointer oluşturma kriterine uyan fonksiyon bulunmamaktadır.

---

## NODE ID STANDARD

  file: playwright.config.ts