---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\sentry.client.config.ts
skeleton_hash: ff75e94a761e823f
entity_hashes:
  overview: b30de304c94c2910
generated_at: 2026-06-08T09:00:20Z
---

## Genel Bakış
Bu dosya, Sentry hata izleme ve performans monitoring aracının Next.js istemci tarafı (browser) yapılandırmasını tanımlayan bir TypeScript modülüdür. Modül, üretim geliştirme ortamına göre ayarlanan bir Sentrydsn adresi ile aracın başlatılmasını sağlar.

## Fonksiyon Grupları
Bu dosyada herhangi bir fonksiyon veya metod bulunmamaktadır. Dosya yalnızca modül seviyesinde çalışan yapılandırma ve başlatma kodundan oluşmaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi içeriği mevcut değildir; yalnızca modül seviyesinde sabit tanımları bulunmaktadır. Dolayısıyla mimari aksiyom üretmek için yeterli iş mantığı bilgisi yoktur.

**Tespit edilen modül sabitleri:**
- `dsn` (member_expression): Sentry veri kaynağı adı (muhtemelen bir nesne üyesi olarak erişilen DSN değeri)
- `isProd` (binary_expression): Üretim ortamı durumunu belirten mantıksal karşılaştırma sonucu

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **dsn** [env-backed] (member_expression) — `process.env.NEXT_PUBLIC_SENTRY_DSN`
- **isProd** [env-backed] (binary_expression) — `process.env.NODE_ENV === 'production'`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır.

**Dosya yapısı:**
- `C:\Users\alize\venthub-hvac\sentry.client.config.ts`
- Yalnızca modül düzeyinde sabit tanımlamaları (`dsn`, `isProd`) ve `@sentry/nextjs` import'u içermektedir.
- Fonksiyon imzası veya gövdesi mevcut değildir.

**Tanımlı Sabitler:**
- `dsn` — Sentry DSN adresi (member_expression ile erişilen bir değer)
- `isProd` — Ortam kontrolü (binary_expression ile hesaplanan boolean değer)

---

## NODE ID STANDARD

  file: sentry.client.config.ts