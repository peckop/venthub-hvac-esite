# 📋 Implementation Plan: Global Mimari Mühürleme

## 1. Merkezi Veri Otoritesi (Global Context)
- [ ] `src/contexts/CategoryContext.tsx` oluşturulacak.
- [ ] Tüm kategoriler tek seferde çekilip `toUICategoryList` ile mühürlenecek.
- [ ] Düz liste otomatik olarak `categoryTree` yapısına çevrilecek.
- **Verify:** Herhangi bir bileşende `useCategories()` çağrıldığında ağaç yapısı hazır gelmeli.

## 2. Navigasyon Bileşenlerinin Göçü
- [ ] `MegaMenu.tsx` içindeki manuel `getCategories` çağrıları silinecek ve Context'e bağlanacak.
- [ ] `CategoryHubOverlay.tsx` (3D'li menü) yeni merkezi hiyerarşi mantığını kullanacak.
- [ ] `StickyHeader.tsx` veri çekme yükünden kurtarılacak.
- **Verify:** Menü geçişleri ve 3D vitrin açılışı Context sayesinde çok daha hızlı olmalı.

## 3. Mimari Tutarlılık (Metadata Integration)
- [ ] Kategori sayfalarındaki `displayMode` mantığı (showcase/series/grid) menü tasarım kararlarını da etkileyecek hale getirilecek.
- [ ] Breadcrumb yapısı merkezi `CategoryContext` üzerinden tek tip üretilecek.
- **Verify:** Sayfadaki navigasyon ile breadcrumb yolu %100 örtüşmeli.

## 4. Teknik Temizlik
- [ ] Proje genelindeki `import { Category } from '../lib/supabase'` kullanımları `DomainCategory` ile değiştirilecek.
- [ ] Atıl kalan eski helper fonksiyonlar silinecek.
- **Verify:** `pnpm run type-check` hatasız geçmeli.
