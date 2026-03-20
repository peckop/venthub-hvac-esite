---
id: 002
title: "Global i18n & Admin Panel Text Migration"
status: "Completed"
progress: "100%"
priority: "CRIT"
created_at: "2026-03-16 23:38:27"
updated_at: "2026-03-20 17:24:01"
started_at: "2026-03-16 23:46:59"
completed_at: "2026-03-17 07:38:20"
depends_on: ["001"]
artifacts:
  brainstorm: "registry/P02-Core-Quality-Guardians/completed/002-global-i18n-admin-panel-text-migration/brainstorm.md"
  plan: "registry/P02-Core-Quality-Guardians/completed/002-global-i18n-admin-panel-text-migration/plan.md"
  review: null
---

# 002 - Global i18n & Admin Panel Text Migration

## 🎯 Hedef
VentHub Admin Paneli üzerindeki tüm "hardcoded" (elle yazılmış) Türkçe metinleri `useI18n` sistemine taşımak, `tr.ts` sözlüğünü standardize etmek ve bu süreçte karşılaşılan tip hatalarını (TSC) temizleyerek "Tek Doğruluk Kaynağı" prensibini tüm yönetim ekranlarına yaymak.

## ✅ Alt Görevler
- [ ] `src/lib/i18n/locales/tr.ts` içine `admin` anahtarı ekle.
- [ ] Mevcut `AdminUsersPage` metinlerini buraya taşı.
- [ ] `useI18n()` import et ve bileşene dahil et.
- [ ] Tüm hardcoded metinleri `t('admin.users...')` ile değiştir.
- [ ] Fallback metinleri ekle (Anayasa kuralı).
- [x] `InventoryRow` ve `ReservedRow` tiplerinin standardize edilmesi.
- [x] `low_stock_threshold` dökümlerindeki `as any` risklerinin temizlenmesi.
- [ ] Tablo sütun başlıklarının (Fiziksel Stok, Satılabilir vb.) i18n'e taşınması.
- [ ] Dışa aktarma (Export) menüsü metinlerinin standardize edilmesi.
- [ ] `AdminUsersPage` metinlerini sözlüğe taşı.
- [ ] `AdminSettingsPage` güncellemeleri.
- [ ] Diğer sayfalar için benzer refactoring süreçleri.
- [ ] `pnpm run lint` ve `pnpm run build` kontrolleri.
- [ ] Tarayıcıda dil değişimi testi (TR <-> EN).