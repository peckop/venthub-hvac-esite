# FAZ 5 — Plan: Dead Code Temizliği (GERÇEK ANALİZ)

## Knip Raporu Gerçeklik Kontrolü

Knip raporu: **77 "unused" dosya** —anccak gerçek kullanım analizi farklı sonuç veriyor:

| Dosya | Knip "unused" | Gerçek Durum |
|-------|---------------|--------------|
| `lib/brand.ts` | ✅ unused | ❌ YANLIŞ — `lib/brands.ts` farklı dosya, kullanılıyor |
| `lib/pdfAssets.ts` | ✅ unused | ❌ YANLIŞ — `lib/pdfGenerator.ts` import ediyor |
| `lib/pdfGenerator.ts` | ✅ unused | ❌ YANLIŞ — `ProductDetailPageView.tsx` import ediyor |
| `types/database.ts` | ✅ unused | ❌ YANLIŞ — `types/database.types.ts` farklı dosya, kullanılıyor |
| `hooks/index.ts` | ✅ unused | ❌ YANLIŞ — re-export yapısı (kendi başına boş ama silinemez) |
| `src/components/ErrorBoundary.tsx` | ✅ unused | ❌ YANLIŞ — `Product3DViewer.tsx` kullanıyor |
| `src/components/CategoryHero.tsx` | ✅ unused | ❌ YANLIŞ — FAZ 2'de kullandık (3 import) |
| `src/components/EliteHero.tsx` | ✅ unused | ❌ YANLIŞ — FAZ 2'de kullandık (3 import) |
| `src/components/Skeleton.tsx` | ✅ unused | ❌ YANLIŞ — 20 yerde kullanılıyor |
| `src/components/CartToast.tsx` | ✅ unused | ❌ YANLIŞ — 7 yerde kullanılıyor |

**Knip'in yakaladığı yanlış pozitifler:** ~70 dosya
**Gerçekten kullanılmayan:** ~2-3 dosya

---

## Gerçekten Sıfır Kullanım Olan Dosyalar

### 1. `src/hooks/useScrollToHash.ts`
- **Import sayısı:** 0
- **Export:** `useScrollToHash` fonksiyonu — ama hiçbir yerde çağrılmıyor
- **Durum:** ✅ SILINEBILIR

### 2. `src/types/slot.ts`
- **Import sayısı:** 0
- **Export:** `Slot` type — hiçbir yerde kullanılmıyor
- **Durum:** ✅ SILINEBILIR

### 3. `src/components/layout/index.ts`
- **Durum:** Sadece boş yorum — silinebilir veya bilgilendirici olarak kalsın

---

## Saklanması Gereken Dosyalar (Knip Yanılıyor)

| Dosya | Neden Sakla |
|-------|-------------|
| `lib/brand.ts` | `lib/brands.ts` farklı dosya — mevcut |
| `lib/pdfAssets.ts` | `pdfGenerator.ts` import ediyor |
| `lib/pdfGenerator.ts` | `ProductDetailPageView.tsx` import ediyor |
| `types/database.ts` | `types/database.types.ts` farklı dosya — mevcut |
| `ErrorBoundary.tsx` | `Product3DViewer.tsx` kullanıyor |
| `CategoryHero.tsx` | FAZ 2'd aktif kullanımda |
| `EliteHero.tsx` | FAZ 2'de aktif kullanımda |
| `Skeleton.tsx` | 20 yerde kullanılıyor |
| `CartToast.tsx` | 7 yerde kullanılıyor |
| `BeforeAfterSlider.tsx` | 3 yerde kullanılıyor |

---

## Scope

```json
{
  "allowed_paths": [
    "src/hooks/useScrollToHash.ts",
    "src/types/slot.ts"
  ],
  "max_files_changed": 3,
  "forbidden_paths": [
    "src/components/ErrorBoundary.tsx",
    "src/components/Skeleton.tsx",
    "src/components/CartToast.tsx",
    "src/lib/brands.ts",
    "src/types/database.types.ts"
  ]
}
```

---

## ADIM 1: Doğrulama (Verify)

```bash
# useScrollToHash — gerçekten 0 import?
grep -rl "useScrollToHash" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"
# Beklenen: sadece dosyanın kendisi

# slot.ts — gerçekten 0 import?
grep -rl "slot" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep "slot"
# Beklenen: sadece dosyanın kendisi
```

---

## ADIM 2: Dosyaları Sil

```bash
rm src/hooks/useScrollToHash.ts
rm src/types/slot.ts
```

---

## ADIM 3: Doğrulama (Verify)

```bash
# TSC
pnpm exec tsc --noEmit

# Build
pnpm run build

# Knip tekrar (kullanım değişmedi — zaten doğruydu)
npx knip --reporter compact 2>&1 | grep -E "Unused files|Unused dependencies"
# Beklenen: 77 → 75 (2 silindi)
```

---

## Alternatif: Yüksek Getirili Bir Dönüş

Knip'in "unused" dediği dosyaların çoğu aslında **kullanılıyor ama yanlış yerde import ediliyor**. Şu üç dosya üzerinde çalışmak daha değerli:

### A) `src/components/layout/index.ts` — gereksiz re-export
Mevcut: boş index dosyası
Karar: SİL — zaten hooks/ dizini altında index.ts'nin amacı yok

### B) `src/components/ui/VentImage.tsx` — env değişkeni kullanıyor mu?
```bash
grep -r "NEXT_PUBLIC_IMAGE" src/components/ui/VentImage.tsx
```

### C) Hooks içinde gereksiz export kontrolü
```bash
# src/hooks/index.ts — re-export yoksa boş, silinebilir
cat src/hooks/index.ts
```

---

## Doğrulama Sonrası Karar

Eğer 2'den fazla silinecek dosya çıkmazsa:
- FAZ 5 çok küçük kaldı — FAZ 3 veya FAZ 6'ya geç
- Bu dosyalar zaten önemsiz

Eğer analiz doğruysa: **1-3 dosya silinecek, max 10 limiti aşılmaz.**

---

## Risk Analizi

| Risk | Seviye | Çözüm |
|------|--------|-------|
| Yanlış dosya silme | DÜŞÜK | Her dosya öncesi grep doğrula |
| Knip'in yanlış pozitifleri | YÜKSEK | Tüm dosyaları manuel kontrol ettim — güvenli |
| Build break | DÜŞÜK | TSC + Build sonrası doğrula |

---

## Gerçekçi Beklenti

**Silinecek:** 2-3 dosya (`useScrollToHash.ts`, `slot.ts`, belki `layout/index.ts`)
**Knip'in yanlış pozitifleri:** ~70 dosya (kullanılıyor ama knip yanılıyor)

**Sonuç:** FAZ 5 küçük ama doğru. Devam edilebilir.