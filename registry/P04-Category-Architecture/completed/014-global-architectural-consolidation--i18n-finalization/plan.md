---
artifact_type: "plan"
task_id: "014"
strategy_id: "global-consistency-v1"
derived_from: "Architecture Audit & DB Consolidation Insight"
---

# 🏗️ Implementation Plan: Zemin Temizliği & Display Mode Geçişi
> **Brainstorm:** P04/014 - Kategori mimarisini DB ba??ml? yapma

## Adım 1: Database (Supabase) Migration & Seed
- [x] `categories` tablosuna `display_mode` (TEXT) kolonu ekle (`DEFAULT 'series'`).
- [x] Hardcoded `showcaseSlugs` ve `landingSlugs` listelerindeki slug'lar?, update komutu ile veritaban?na i?le (Seed).
- **Verify:** `mcp_supabase_execute_sql` ile veritaban?ndan `display_mode` kolonunun 3 ?e?it (showcase, landing, series) veri ta??d???n? teyit et.

## Adım 2: Frontend Hooks & Type Refactoring
- [x] `src/types/database.types.ts` i?ine (veya ilgili d?k?me) `display_mode: string | null` tipini ekle.
- [x] `src/types/slot.ts` dosyas?n? olu?turarak gelecekteki ge?i?in kalbi olan `SlotProps` interface'ini tan?mla.
- [x] `src/hooks/useCategoryViewModel.ts` i?indeki 27 sat?rl?k hardcoded slug array'lerini tamamen S?L.
- **Verify:** `pnpm run type-check` kod ?al??t?r?ld???nda `useCategoryViewModel` i?inde tip hatas? d?nmedi?inden emin ol.

## Adım 3: Legacy Tasfiyesi (Zombi Temizliği)
- [x] `src/config/categoryRegistry.ts` (eski registry) dosyas?n? projeden K?KTEN S?L.
- [x] Bu dosyan?n import edildi?i `applicationLinks.ts` ve `RadialActionMenu.tsx` gibi yerleri temizle, dinamik i18n veya statik linklemeye ge?ir.
- **Verify:** Projede `categoryRegistry.ts` import dizesi arat?ld???nda "0 sonu?" d?nd???n? (grep) kan?tla.

## Adım 4: Views ve Entegrasyon
- [x] `src/views/ProductsDiscoveryView.tsx` uygulamas?n?n kendi i?indeki ba??ms?z fetch i?lemlerini sil, Gateway (?st Parent) ?zerinden veriyi `SlotProps` mant???yla emdirecek ?ablona (Dumb Component) ?evir.
- **Verify:** Anasayfa veya /products rotas? `pnpm run build` esnas?nda hata vermeden statik/dinamik derlendi?ini g?zlemle.

## Adım 5: Nihai Mühürleme (Quality Gate)
- [x] Projeyi `pnpm run lint` komutuyla tara.
- [x] T?m i?lemler kalite standartlar?na ula?t???nda `python registry/manage_registry.py` ?zerinden pulse g?ncelle.
- **Verify:** Zero (0) Linter Puan? ve Build hatas? al?nd???n? do?rula.

## Fine-State / Harmanlama
Bu a?amada backend migration ile frontend display mode tipleri entegre edilip `useCategoryViewModel` kal?nt?lar?ndan kurtulunur.

<!-- ARTIFACT_SIGNATURE:1775041680:66a3668ca4e90759bae9785165587bd8c9c8028e7d269a7571684ac7799269f0 -->