---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\en.ts
skeleton_hash: 0fc6f1eeba141f7a
entity_hashes:
  overview: 3d02093c393d55b1
generated_at: 2026-06-13T15:04:26Z
---

## Genel Bakış

Bu dosya, admin panelinin İngilizce lokalizasyon sözlüğünü oluşturarak erişilebilirlik, denetim, otorite, kategoriler, ortak metinler, kontrol paneli, veri tablosu ve kuponlar gibi farklı modüllerin çeviri kaynaklarını tek bir `admin` nesnesi altında birleştirir. Uygulama genelinde tutarlı dil kullanımı sağlamak ve çeviri yönetimini merkezileştirmek amacıyla yapılandırılmış statik bir veri dosyasıdır. Dosya herhangi bir fonksiyon, ortam değişkeni veya API çağrısı içermez; yalnızca import edilmiş alt sözlükleri bir araya getirerek dışa aktarır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül veri ihracatı (data export) yapan bir sözlük modülüdür. Fonksiyon imzası bulunmamaktadır.

**[Aksiyom 1]**: Eğer `admin` nesnesi düzgün bir JavaScript nesnesi (object) olarak tanımlanmazsa, uygulama içinde çeviri erişimi başarısız olur ve tanımsız (undefined) referans hataları oluşur.

**[Aksiyom 2]**: Eğer `admin` nesnesinin içindeki alt sözlük anahtarları (a11y, audit, authority, categories, common, dashboard, errorGroups, errors) eksik veya yanlış tanımlanırsa, ilgili modüllerde çeviri anahtarları çözümlenemez ve uygulama arayüzünde hata mesajları veya boş metinler görüntülenir.

**[Aksiyom 3]**: Eğer `admin` nesnesi `default export` veya `named export` olarak dışa aktarılmazsa, modülü içe aktaran dosyalar `admin` sözlüğüne erişemez ve lokalizasyon sistemi çalışmaz.

---

*Not: Bu modül salt veri (dictionary) modülü olduğundan, iş mantığı veya hesaplama varsayımı içermemektedir. Aksiyomlar yalnızca dışa aktarım yapısına ve veri bütünlüğüne yöneliktir.*

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **admin** (object) — `{
  common,
  coupons,
  dataTable,
  dashboard,
  errors,
  toolbar,
  menu,...`

---

## AST POINTERS

Bu dosyada **fonksiyon gövdesi bulunmamaktadır**. Dosya, sadece import edilen sözlük nesnelerini bir araya getiren bir i18n sözlük birleştirme dosyasıdır.

---

### Dosya Yapısı Özeti

**Dosya**: `src/i18n/dictionaries/admin/en.ts`

**İçerik**: Sadece import deklarasyonları ve bir `admin` sabit nesnesi export'u bulunmaktadır.

**Import'lar**:
- `a11y` — from `./a11y.en`
- `audit` — from `./audit.en`
- `authority` — from `./authority.en`
- `categories` — from `./categories.en`
- `common` — from `./common.en`
- `coupons` — from `./coupons.en`
- `dashboard` — from `./dashboard.en`
- `dataTable` — from `./dataTable.en`
- `errorGroups` — from `./errorGroups.en`
- `errors` — from `./errors.en`

**Sabitler**:
- `admin` (object) — Tüm import edilen sözlüklerin birleştirildiği ana admin sözlük nesnesi

---

> **Not**: Bu dosya `"use strict"` veya herhangi bir fonksiyon/barındırmamaktadır. AST Pointer üretimi için fonksiyon gövdesi gerekli olup, bu dosyada analiz edilecek fonksiyon bulunmamaktadır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin