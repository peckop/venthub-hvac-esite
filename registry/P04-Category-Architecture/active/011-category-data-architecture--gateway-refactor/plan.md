---
artifact_type: "plan"
task_id: "011"
strategy_id: "enterprise-data-refactor-v1"
derived_from: "brainstorm.md (Enterprise Audit)"
verification_mode: "Strict Integrity Check"
---

# 📋 Implementation Plan: Category Data Architecture & Gateway Refactor

## 🏁 Adım 1: Veritabanı Şeması ve Veri Göçü (SQL)
`categories` tablosunu profesyonel standartlara çekiyoruz.
- [ ] Supabase Dashboard veya Migration dosyası üzerinden `menu_label` ve `marketing_title` sütunlarını ekle.
- [ ] Mevcut `name` verilerini `menu_label` sütununa kopyala.
- [ ] Mevcut `metadata->hero_title` verilerini `marketing_title` sütununa kopyala (ve temizle).
- **Verify:** `SELECT name, menu_label, marketing_title FROM categories` sorgusunun dolu döndüğünün teyit edilmesi.

## 🛠️ Adım 2: Yardımcı Fonksiyonların (Helpers) Evrimi
İsim ayrıştırma mantığını merkezi hale getiriyoruz.
- [ ] `src/utils/categoryHelpers.ts` içindeki `getCategoryDisplayName` fonksiyonunu sadece `menu_label` dönecek şekilde güncelle.
- [ ] `getCategoryMarketingTitle` adında yeni bir fonksiyon ekle.
- **Verify:** `npm run test` (eğer varsa) veya gateway denetimi.

## 🛡️ Adım 3: Gateway ve Registry Senkronu
Gateway'in bu yeni verileri UI'ya nizami şekilde dağıtmasını sağlıyoruz.
- [ ] `useCategoryGateway.ts` içindeki veri çekme sorgusuna yeni sütunları dahil et.
- [ ] `categoryRegistry.ts` içindeki "Altın İsimleri" (Golden Names) SSOT olarak koru.
- **Verify:** `check_integrity.py` scriptinin yeşil yanması.

## 🚀 Adım 4: UI Bileşenlerinin Modernizasyonu
Görsel katmandaki tüm kategori isimlerini yeni mantığa bağlama.
- [ ] `EliteMegaMenu.tsx` içindeki isim çağırma mantığını doğrula.
- [ ] `GuidedCategoryDiscovery.tsx` (Ana sayfa kartları) içindeki isimleri `menu_label` ile eşitle.
- **Verify:** Browser üzerinden "Aksesuarlar" isminin sadeleştiğinin gözle görülür teyidi.
