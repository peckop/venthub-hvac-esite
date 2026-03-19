---
id: 006
title: "Dinamik Otorite ve İçerik Yönetimi"
status: "Completed"
progress: "100%"
priority: "High"
depends_on: null
artifacts:
  brainstorm: "registry/P01-Visual-Page-Builder/completed/006-dinamik-otorite-ve-icerik-yonetimi/brainstorm.md"
  plan: "registry/P01-Visual-Page-Builder/completed/006-dinamik-otorite-ve-icerik-yonetimi/plan.md"
  review: null
---

# 006 - Dinamik Otorite ve İçerik Yönetimi @GeminiCLI (TAMAMLANDI)

## 🎯 Hedef
İçerikleri statik dosyalardan kurtarıp DB'ye taşıyarak Page Builder'ın (017) veri motorunu kurmak.

























































## ✅ Alt Görevler
- [ ] Supabase SQL Editor üzerinden `categories` tablosuna `authority_content` kolonunu ekleyen migration'ı çalıştır.
- [ ] SQL: `ALTER TABLE categories ADD COLUMN IF NOT EXISTS authority_content JSONB DEFAULT NULL;`
- [ ] `src/i18n/dictionaries/tr.ts` içindeki `categorySilentFan` objesini oku.
- [ ] Bu objeyi yeni JSON şemasına (brainstorm belgesindeki yapı) dönüştür.
- [ ] SQL UPDATE sorgusu ile `sessiz-kanal-tipi-fanlar` slug'ına sahip kategoriye bu veriyi işle.
- [ ] `src/types/database.types.ts` (veya ilgili alias dosyası) içinde `authority_content` alanını tanımla.
- [ ] `src/components/category/CategoryAuthoritySection.tsx` bileşenini refactor et:
- [ ] `tr.ts` içindeki eski `categorySilentFan` bloğunu sil (Yedek alındıktan sonra).
- [ ] Sayfanın DB'den gelen veriyle sorunsuz render edildiğini test et.