---
artifact_type: "plan"
task_id: "013"
strategy_id: "viewmodel-decoupling-v1"
derived_from: "brainstorm.md"
---

# 📋 Implementation Plan: Category ViewModel & Advanced Scale Architecture

## 🏁 Adım 1: Gateway'in Saflaştırılması (Pure Data)
- [ ] `src/hooks/useCategoryGateway.ts` dosyasından tüm i18n ve `t()` bağımlılıklarını temizle.
- [ ] Gateway'in sadece ham veritabanı modellerini (DomainCategory) dönmesini sağla.
- **Verify:** Gateway dosyası içinde 'i18n' kelimesinin geçmediğini doğrula.

## 🏗️ Adım 2: ViewModel Katmanının İnşası
- [ ] `src/hooks/useCategoryViewModel.ts` dosyasını oluştur.
- [ ] Bu Hook içinde `useI18n` kullanarak tercüme mantığını merkezi hale getir.
- [ ] Ham kategorileri alıp üzerine `displayName`, `formattedTitle` gibi UI dostu alanlar ekleyen mantığı kur.
- **Verify:** `useCategoryViewModel` test unit'i veya manuel tip denetimi.

## 🛡️ Adım 3: Store ve Context Senkronu
- [ ] `CategoryContext.tsx` dosyasını ViewModel ile uyumlu hale getir.
- [ ] Uygulamanın her yerinde verinin "ViewModel" formatında dağıtıldığından emin ol.
- **Verify:** `context` üzerinden gelen verinin tipinin güncellendiğini doğrula.

## 🚀 Adım 4: UI Bileşenlerinin "Dumb" Hale Getirilmesi
- [ ] `EliteMegaMenu.tsx` içindeki `t()` çağrılarını sil, `category.displayName` kullanımına geç.
- [ ] `GuidedCategoryDiscovery.tsx` (Ana Sayfa) içindeki mantığı ViewModel'e bağla.
- [ ] `CategoryShowcaseView.tsx` içindeki karmaşık başlık mantığını ViewModel'e taşı.
- **Verify:** Sitedeki tüm kategori isimlerinin (TR/EN) hiçbir parametre gönderilmeden doğru göründüğünü doğrula.
