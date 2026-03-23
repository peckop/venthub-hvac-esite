---
artifact_type: "brainstorm"
task_id: "011"
analysis_source: "Enterprise Data Architecture Audit"
analysis_timestamp: "2026-03-23 14:15:00"
engine_version: "VentHub-S7-Orion"
---

# 🧠 Brainstorming: Category Data Architecture & Gateway Refactor

## 🚩 Mevcut Sorun
Kategori isimleri (`menu_label` vs `hero_title`) veritabanında ayrıştırılmamış durumda. Tek bir `name` ve kirli bir `metadata->hero_title` alanına bağımlılık, sistemin eski/zombi verileri göstermesine neden oluyor.

## 🛠️ Mimari Çözüm (Enterprise Grade)
1.  **Şema Genişletme:** `categories` tablosuna `menu_label` (sade isim) ve `marketing_title` (reklam ismi) sütunları eklenmelidir.
2.  **Gateway Evrimi:** `useCategoryGateway` ve `categoryHelpers`, bu yeni sütunları kullanan "Smart Resolver" (Akıllı Çözücü) yapısına geçmelidir.
3.  **Veri Otoritesi:** Registry (`categoryRegistry.ts`) artık sadece bir URL rehberi değil, veritabanı verisi bozuksa devreye giren bir "Fallback Otoritesi" olmalıdır.

## ⚠️ Riskler ve Önlemler
- **Risk:** SQL Migration sırasında mevcut verilerin kaybı.
- **Önlem:** İşlem öncesi `pg_dump` veya Supabase Snapshot alınmalı.
- **Risk:** 3D Modellerin bozulması.
- **Önlem:** (Sizin uyarınızla) 3D dosyalarına kesinlikle dokunulmayacak, sadece metinsel veri yolları güncellenecek.

## 🏁 Başarı Kriteri
- Menülerin her zaman "Aksesuarlar", "Fanlar" gibi sade isimler göstermesi.
- Kategori sayfalarının ise "HVAC Montaj Aksesuarları" gibi zengin başlıklar göstermesi.
- Hiçbir bileşende "hardcoded" (sabit) kategori ismi kalmaması.
