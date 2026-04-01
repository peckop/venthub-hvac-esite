---
artifact_type: "plan"
task_id: "014"
strategy_id: "global-consistency-v1"
derived_from: "Architecture Audit & DB Consolidation Insight"
---

# 📋 Implementation Plan: Zemin Temizliği & Display Mode Geçişi
> **Brainstorm:** P04/014 - Kategori mimarisini DB bağımlı yapma

## Adım 1: Database (Supabase) Migration & Seed
- [x] `categories` tablosuna `display_mode` (TEXT) kolonu ekle (`DEFAULT 'series'`).
- [x] Hardcoded `showcaseSlugs` ve `landingSlugs` listelerindeki slug'ları, update komutu ile veritabanına işle (Seed).
- **Verify:** `mcp_supabase_execute_sql` ile veritabanından `display_mode` kolonunun 3 çeşit (showcase, landing, series) veri taşıdığını teyit et.

## Adım 2: Frontend Hooks & Type Refactoring
- [x] `src/types/database.types.ts` içine (veya ilgili döküme) `display_mode: string | null` tipini ekle.
- [x] `src/types/slot.ts` dosyasını oluşturarak gelecekteki geçişin kalbi olan `SlotProps` interface'ini tanımla.
- [x] `src/hooks/useCategoryViewModel.ts` içindeki 27 satırlık hardcoded slug array'lerini tamamen SİL.
- **Verify:** `pnpm run type-check` kod çalıştırıldığında `useCategoryViewModel` içinde tip hatası dönmediğinden emin ol.

## Adım 3: Legacy Tasfiyesi (Zombi Temizliği)
- [x] `src/config/categoryRegistry.ts` (eski registry) dosyasını projeden KÖKTEN SİL.
- [x] Bu dosyanın import edildiği `applicationLinks.ts` ve `RadialActionMenu.tsx` gibi yerleri temizle, dinamik i18n veya statik linklemeye geçir.
- **Verify:** Projede `categoryRegistry.ts` import dizesi aratıldığında "0 sonuç" döndüğünü (grep) kanıtla.

## Adım 4: Views ve Entegrasyon
- [x] `src/views/ProductsDiscoveryView.tsx` uygulamasının kendi içindeki bağımsız fetch işlemlerini sil, Gateway (üst Parent) üzerinden veriyi `SlotProps` mantığıyla emdirecek şablona (Dumb Component) çevir.
- **Verify:** Anasayfa veya /products rotası `pnpm run build` esnasında hata vermeden statik/dinamik derlendiğini gözlemle.

## Adım 5: Nihai Mühürleme (Quality Gate)
- [x] Projeyi `pnpm run lint` komutuyla tara.
- [x] Tüm işlemler kalite standartlarına ulaştığında `python registry/manage_registry.py` üzerinden pulse güncelle.
- **Verify:** Zero (0) Linter Puanı ve Build hatası alındığını doğrula.

## Fine-State / Harmanlama
Bu aşamada backend migration ile frontend display mode tipleri entegre edilip `useCategoryViewModel` kalıntılarından kurtulunur.
