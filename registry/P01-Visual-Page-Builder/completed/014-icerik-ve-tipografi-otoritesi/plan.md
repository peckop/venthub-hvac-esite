# 📋 Plan: P01-014 İçerik ve Tipografi Otoritesi

Bu görev, VentHub'ın tüm görsel dünyasını taşıyacak olan "Yazı ve Metin Temeli"nin kurulmasını kapsar.

## ✅ Alt Görevler
- [x] `tailwind.config.js` içine VentHub özel font scale (vh-h1..vh-h6) tanımları eklendi.
- [x] `src/styles/typography.css` dosyası oluşturuldu ve `@layer components` seviyesinde mühürlendi.
- [x] `CategoryHero` ve `ProductDetailPage` üzerindeki başlıklar bu yeni otoriteye bağlandı.
- [x] `ProductCard` (Grid/List) yazı stilleri standardize edildi.
- [x] `docs/DESIGN_SYSTEM.md` güncellendi.
- **Verify:** Tüm sayfalarda `h1` elementlerinin aynı görsel ağırlığa ve font boyutuna sahip olduğu doğrulandı.

## 🏗️ Uygulama Adımları

### Step 1: Config & Global CSS (DONE)
- **Action:** Tailwind config'de `fontSize` ve `fontWeight` extend edildi. `typography.css` dosyası `index.css` içine import edildi.
- **Verify:** `.vh-h1`, `.vh-body-large` gibi class'lar başarıyla render ediliyor.

### Step 2: Component Refactor (DONE)
- **Action:** Ana bileşenler (Hero, Card, PDP Section) yeni class'lara geçirildi.
- **Verify:** Görsel bütünlük sağlandı.

### Step 3: Metin Rehberi (Documentation) (DONE)
- **Action:** `docs/DESIGN_SYSTEM.md` içine tipografi kuralları işlendi.
- **Verify:** Referans doküman mühürlendi.
