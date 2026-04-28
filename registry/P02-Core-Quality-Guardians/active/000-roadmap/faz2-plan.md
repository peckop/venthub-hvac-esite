# FAZ 2 — Worker-Ready Planı (REVIZED)
## Lighthouse Baz Ölçümü + Framer-Motion Temizliği

---

## Terminal Kanıtları (Grep/LS Çıktıları)

```bash
# Motion element sayıları
$ grep -c "motion\." src/views/AboutPage.tsx
10

$ grep -c "motion\." src/views/ContactPage.tsx
6

$ grep -c "motion\." src/views/BrandsPage.tsx
4

$ grep -c "motion\." src/views/BrandDetailPage.tsx
14

$ grep -c "motion\." src/views/category/CategoryShowcaseView.tsx
6

$ grep -c "motion\." src/components/home/EliteHero.tsx
13

$ grep -c "motion\." src/components/category/CategoryHero.tsx
6

$ grep -c "motion\." src/components/products/CategoryOrbitCarousel.tsx
13

$ grep -c "motion\." src/components/home/FeaturedCommercialBlocks.tsx
10

$ ls src/components/BentoGrid.tsx
FILE_NOT_FOUND

$ ls src/components/home/CinematicProductShowcase.tsx
FILE_NOT_FOUND

# Framer-motion import kontrolü
$ grep "framer-motion" src/views/AboutPage.tsx | head -1
import { motion } from 'framer-motion'

# Ek framer-motion hook kontrolü (AnimatePresence, useInView, useAnimation)
$ grep "useInView\|useAnimation\|AnimatePresence" src/views/AboutPage.tsx
# Sonuç: YOK — sadece motion.div kullanıyor

$ grep "useInView\|useAnimation\|AnimatePresence" src/components/home/EliteHero.tsx
# Sonuç: YOK — sadece motion component'leri
```

---

## FAZ Bağımlılığı

> ⚠️ **FRAMER-MOTION TEMİZLİĞİ BİTMEDEN FAZ 3 SSR-FIRST BAŞLAYAMAZ.**
> Framer-motion kullanan dosyalar client component olarak kalmak ZORUNLU.
> FAZ 2 tamamlanmadan FAZ 3'te 'use client' kaldırma hedefi tutturulamaz.

---

## 📦 Kapsam (Scope Police)

```json
{
  "allowed_paths": [
    "src/views/AboutPage.tsx",
    "src/views/ContactPage.tsx",
    "src/views/BrandsPage.tsx",
    "src/views/BrandDetailPage.tsx",
    "src/views/category/CategoryShowcaseView.tsx",
    "src/components/home/EliteHero.tsx",
    "src/components/category/CategoryHero.tsx",
    "src/components/products/CategoryOrbitCarousel.tsx",
    "src/components/home/FeaturedCommercialBlocks.tsx"
  ],
  "max_files_changed": 9,
  "forbidden_paths": [
    "src/components/products/3d/",
    "src/components/admin/",
    "src/views/ProductsDiscoveryView.tsx",
    "src/views/category/CategorySeriesView.tsx"
  ]
}
```

> ⚠️ BentoGrid.tsx ve CinematicProductShowcase.tsx dosyaları MEVCUT DEĞİL. Plandan çıkarıldı.

---

## ADIM 1: Lighthouse Baz Ölçümü

### Çalıştırılacak Komutlar

```bash
# 1. Production build
pnpm run build

# 2. Production server başlat (background)
pnpm start &
sleep 5

# 3. Lighthouse CLI ile ölçüm (desktop)
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-baseline.json --chrome-flags="--headless"

# 4. Sonuçları kaydet
cat lighthouse-baseline.json | grep -E '"performance"|"accessibility"|"best-practices"|"seo"' | head -20
```

### Çıktı Hedefi

```json
{
  "performance": ???,
  "accessibility": ???,
  "best-practices": ???,
  "seo": ???
}
```

> ⚠️ Worker: Bu ölçümü PLAN'dan ÖNCE yap. Sonuçları bir not defterine kaydet. FAZ 2 sonunda karşılaştırma için.

---

## ADIM 2: Framer-Motion → CSS Transition Dönüşümü

### Dönüşüm Kuralları

| Framer-Motion | CSS Tailwind |
|---------------|--------------|
| `initial={{ opacity: 0 }}` | (CSS default) |
| `animate={{ opacity: 1 }}` | `opacity-100` veya `opacity-0` |
| `transition={{ duration: 0.5 }}` | `duration-500` |
| `transition={{ duration: 0.3, delay: 0.1 }}` | `duration-300 delay-100` |
| `whileHover={{ scale: 1.05 }}` | `hover:scale-105` |
| `whileTap={{ scale: 0.95 }}` | `active:scale-95` |

### Örnek Dönüşüm

```tsx
// ÖNCE (AboutPage.tsx)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
  className="some-class"
>

// SONRA
<div className="opacity-100 translate-y-0 duration-500 delay-200 some-class">
```

---

## GRUP A — View Dosyaları

### A1: `src/views/AboutPage.tsx` — 10 motion element

**Grep sonucu:** `grep -c "motion\." AboutPage.tsx` → 10

**Değişiklik:** Her `motion.div`, `motion.section`, `motion.span` → `div`, `section`, `span` + Tailwind class.

**Import kontrolü:**
```bash
$ grep "framer-motion" src/views/AboutPage.tsx
import { motion } from 'framer-motion'
# Bu import KALDIRILAMAZ çünkü 10 yerde motion kullanılıyor
# Hepsini çevirince import da kalkacak
```

---

### A2: `src/views/ContactPage.tsx` — 6 motion element

Aynı strateji.

---

### A3: `src/views/BrandsPage.tsx` — 4 motion element

Aynı strateji.

---

### A4: `src/views/BrandDetailPage.tsx` — 14 motion element

Aynı strateji. **Not:** 14 motion element var, önceki planda 4 yazılmıştı — bu YANLIŞTI.

---

### A5: `src/views/category/CategoryShowcaseView.tsx` — 6 motion element

Aynı strateji.

---

## GRUP B — Component Dosyaları

### B1: `src/components/home/EliteHero.tsx` — 13 motion element

**Grep sonucu:** `grep -c "motion\." EliteHero.tsx` → 13

**Not:** Complex animations olabilir. Staggered veya timeline animasyon varsa o satırları ATLA.

---

### B2: `src/components/category/CategoryHero.tsx` — 6 motion element

Aynı strateji.

---

### B3: `src/components/products/CategoryOrbitCarousel.tsx` — 13 motion element

**Grep sonucu:** `grep -c "motion\." CategoryOrbitCarousel.tsx` → 13

> ⚠️ Carousel'de layout animation varsa o satırları ATLA.

---

### B4: `src/components/home/FeaturedCommercialBlocks.tsx` — 10 motion element

Aynı strateji.

---

## ✅ Doğrulama

```bash
# 1. TSC
pnpm exec tsc --noEmit

# 2. Build
pnpm run build

# 3. Framer-motion import kontrolü (kapsamdaki dosyalar)
grep -l "from 'framer-motion'" src/views/AboutPage.tsx src/views/ContactPage.tsx
# Sonuç: Her ikisi de motion import ediyor — çevrildikten sonra 0 olmalı

# 4. Lighthouse tekrar ölç
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-faz2.json --chrome-flags="--headless"
```

---

## Risk Analizi

| Risk | Seviye | Çözüm |
|------|--------|-------|
| Complex animation kaybı | Orta | Timeline/stagger varsa o satırı atla |
| Tree-shake çalışmama | Yüksek | Import'u da kaldır — yoksa bundle küçülmez |
| Layout animation | Yüksek | Layout prop varsa o dosyayı atla |
| Build break | Düşük | TSC her dosya sonrası çalıştır |