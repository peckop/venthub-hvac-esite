---
id: 006
title: "Dinamik Otorite ve İçerik Yönetimi"
status: "Completed"
progress: "100%"
priority: "High"
depends_on: null
artifacts:
  brainstorm: "registry/P01-Visual-Page-Builder/active/006-dynamic-authority-system/brainstorm.md"
  plan: "registry/P01-Visual-Page-Builder/active/006-dynamic-authority-system/plan.md"
  review: null
---

# 006 - Dinamik Otorite ve İçerik Yönetimi @GeminiCLI (TAMAMLANDI)

## 🎯 Hedef
İçerikleri statik dosyalardan kurtarıp DB'ye taşıyarak Page Builder'ın (017) veri motorunu kurmak.

## ✅ Alt Görevler
- [x] **Beyin Fırtınası:** Teknik mimari ve JSON şeması belirlendi.
- [x] **Planlama:** Uygulama adımları hazırlandı.
- [x] **Şema Tasarımı:** Supabase `categories` tablosuna `authority_content` (JSONB) kolonu eklendi.
- [x] **Migration:** Sessiz Fanlar ve HRV içerikleri DB'ye mühürlendi.
- [x] **Bileşen Modernizasyonu:** `CategoryAuthoritySection` bileşeni Generic yapıya dönüştürüldü.
- [ ] **i18n Cleanup:** `tr.ts` temizliği yapılacak (Opsiyonel/Backlog).
