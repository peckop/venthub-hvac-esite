---
artifact_type: "plan"
task_id: "014"
strategy_id: "global-consistency-v1"
derived_from: "7/10 Architecture Audit & User Feedback"
---

# 📋 Implementation Plan: Global Architectural Consolidation

## 🏁 Adım 1: i18n ve Karakter Tutarlılığı (Acil)
- [ ] `CategoryHubOverlay.tsx` bileşenini ViewModel (`useCategoryViewModel`) katmanına bağla.
- [ ] Ana sayfadaki ("I vs İ") büyük harf karmaşasını, CSS `.toUpperCase()` yerine i18n tercümesinden gelen ham veriyi kullanarak çöz.
- **Verify:** Overlay ve Homepage isimlerinin %100 aynı ve Türkçe olduğunu doğrula.

## 🏗️ Adım 2: Legacy Tasfiyesi (Zombi Temizliği)
- [ ] Mükerrer `CategoryLanding` dosyalarını (`src/views` vs `src/components`) analiz et ve tek bir "Altın Standart" (UCS uyumlu) dosyada birleştir.
- [ ] Eski `CATEGORY_REGISTRY.ts` bağımlılıklarını tamamen sök ve tüm link yapısını dinamik DB slug'larına bağla.
- **Verify:** `src/config/categoryRegistry.ts` silindiğinde sistemin çökmediğini doğrula.

## 🛡️ Adım 3: /products Sayfası Entegrasyonu
- [ ] `ProductsDiscoveryView.tsx` dosyasını `CategoryMasterView` (UCS) omurgasına enjekte et.
- [ ] Bu sayfayı "Hybrid Mode" destekleyecek şekilde ViewModel ile konfigüre et.
- **Verify:** `/products` adresine girildiğinde merkezi Gateway'in tetiklendiğini teyit et.

## 🚀 Adım 4: Nihai Mühürleme (Registry Sync)
- [ ] `PULSE.md` ve tüm aktif görevleri gerçek kod durumuyla senkronize et.
- [ ] `npm run build` ile tüm sayfaların (700+) hatasız derlendiğini doğrula.
