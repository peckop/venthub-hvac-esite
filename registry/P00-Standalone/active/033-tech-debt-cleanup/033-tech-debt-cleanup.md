---
id: 033
title: "033: Teknik Borç Temizliği ve Edge Görevleri"
priority: "HIGH"
status: "Executing"
progress: 0%
project: "P00-Standalone"
created_at: "2026-03-17 15:50:57"
updated_at: "2026-03-17 21:55:00"
artifacts:
  brainstorm: "registry/P00-Standalone/active/033-tech-debt-cleanup/brainstorm.md"
  plan: "registry/P00-Standalone/active/033-tech-debt-cleanup/plan.md"
  review: "registry/P00-Standalone/active/033-tech-debt-cleanup/review.md"
---








  # 🏗️ 033: 033: Teknik Borç Temizliği (any & Type Safety)
  Bu görev, projedeki geçici tiplemeleri (`any`), tip cast işlemlerini (`as any`) temizlemeyi ve veritabanı tiplerini modernize etmeyi hedefler.

  ## 🎯 Hedefler
  - [ ] `src/types/database.types.ts` dosyasının Supabase üzerinden en güncel şema ile üretilmesi.
  - [ ] Admin sayfalarındaki (`Orders`, `Products`, `Returns`, `Users`) `any` kullanımlarının güvenli tiplerle değiştirilmesi.
  - [x] Edge Function'ların (`stock-alert`, `release-expired-reservations`) deploy ve test süreçlerinin tamamlanması. (MODERNIZED: Atomic stock updates & CORS fixed)

  ## 📊 any Kullanım Haritası (Temizlik Listesi)
  | # | Dosya | Satır | Mevcut Durum | Hedef Çözüm |
  |---|-------|-------|--------------|-------------|
  | 1 | `src/views/admin/AdminLogisticsPage.tsx` | 48 | `data as any[]` | `Order` arayüzü |
  | 2 | `src/views/admin/AdminDashboardPage.tsx` | 136 | `data as any[]` | `ProductStockRow` |
  | 3 | `src/views/checkout/OrderSummarySidebar.tsx` | 9 | `items: any[]` | `CartItem` |
  | 4 | `src/views/account/AccountOverviewPage.tsx` | 50 | `orderData: any[]` | `OrderSummary` |

  ## ✅ Alt Görevler
  - [ ] `pnpm supabase gen types typescript` ile tiplerin güncellenmesi.
  - [ ] `converter` katmanının yeni tiplerle uyumlu hale getirilmesi.
  - [ ] Kritik Admin tablolarında tip güvenliği testi.
  - [x] Edge Function Stabilitesi (release-expired-reservations & stock-alert)

> [!IMPORTANT]
> `pdfGenerator.ts` içindeki `any` kullanımları, dış kütüphane bağımlılığı nedeniyle bu görev kapsamında DEĞİLDİR.
