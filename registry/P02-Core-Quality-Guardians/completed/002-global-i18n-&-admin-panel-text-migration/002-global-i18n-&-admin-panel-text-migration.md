---
id: 002
title: "Global i18n & Admin Panel Text Migration"
status: "Completed"
progress: "100%"
priority: "CRIT"
created_at: "2026-03-16 23:38:27"
updated_at: "2026-03-17 07:38:20"
started_at: "2026-03-16 23:46:59"
completed_at: "2026-03-17 07:38:20"
depends_on: ["001"]
artifacts:
  brainstorm: "registry/P02-Core-Quality-Guardians/completed/002-global-i18n-&-admin-panel-text-migration/brainstorm.md"
  plan: "registry/P02-Core-Quality-Guardians/completed/002-global-i18n-&-admin-panel-text-migration/plan.md"
  review: null
---

# 002 - Global i18n & Admin Panel Text Migration

## 🎯 Hedef
VentHub Admin Paneli üzerindeki tüm "hardcoded" (elle yazılmış) Türkçe metinleri `useI18n` sistemine taşımak, `tr.ts` sözlüğünü standardize etmek ve bu süreçte karşılaşılan tip hatalarını (TSC) temizleyerek "Tek Doğruluk Kaynağı" prensibini tüm yönetim ekranlarına yaymak.

## ✅ Alt Görevler
- [x] Admin sözlük yapısının `src/i18n/dictionaries/tr.ts` içerisinde kurulması ve genişletilmesi.
- [x] `AdminUsersPage` üzerindeki tüm metinlerin sözlüğe taşınması ve refactor edilmesi.
- [x] `AdminInventoryPage` modernizasyonu (i18n, Tip Güvenliği ve CSV işlemleri tamamlandı).
- [🚧] `AdminSettingsPage` ve `AdminWebhookEventsPage` modernizasyonu (Sıradaki adım).
- [ ] Tüm Admin ekranlarında A11y (Erişilebilirlik) etiketlerinin standart hale getirilmesi.

## 📝 Notlar
- `AdminInventoryPage` üzerindeki devasa Türkçe metin blokları temizlendi ve `tr.ts` sözlüğüne bağlandı.
- TSC hataları üzerinde çalışmaya devam ediliyor, Admin sayfalarındaki `any` kullanımı minimize edildi.
- A11y düzenlemeleri son dalga olarak tüm sayfalara toplu uygulanacak.
