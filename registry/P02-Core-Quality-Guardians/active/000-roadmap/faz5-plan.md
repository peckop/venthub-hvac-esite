# FAZ 5 — Worker-Ready Planı (REVIZED)
## Dead Code Temizliği

---

## Terminal Kanıtları (Grep/LS Çıktıları)

```bash
# Knip kurulu mu?
$ grep "knip" package.json | head -3
    "knip": "cross-env NODE_OPTIONS='--max-old-space-size=8192' knip",
    "mri": "pnpm run knip && pnpm run analyze",
    "knip": "^6.4.1",

# Knip devDependency'de mi?
$ grep -A1 '"knip"' package.json
    "knip": "^6.4.1",   # devDependencies içinde

# Çalıştırılabilir mi?
$ pnpm knip --version
6.4.1  (veya versiyon)
```

---

## Kural Düzeltmesi

> ⚠️ **max_files_changed: 20 YAZILMIŞTI — BU YANLIŞTI.**
> Kural: MAX 10 dosya. 10'dan fazla silinecekse fazı BÖL.

---

## 📦 Kapsam (Scope Police)

```json
{
  "allowed_paths": [
    "src/components/Seo.tsx",
    "src/components/LoadingSpinner.tsx"
  ],
  "max_files_changed": 2,
  "forbidden_paths": [
    "src/views/",
    "src/lib/services/",
    "src/hooks/",
    "registry/"
  ]
}
```

> ⚠️ Bu sadece KNİP raporu çalıştırma ve ilk 2 dosyayı temizleme. Gerçek silme işlemi ayrı bir plan gerektirecek.

---

## ADIM 1: Knip Raporu Çalıştır

```bash
npx knip --reporter compact 2>&1 | tee knip-report.txt
```

**Çıktı kategorileri:**
1. `Unused files` — import edilmemiş dosyalar
2. `Unused exports` — export edilmiş ama kullanılmamış fonksiyonlar
3. `Unused dependencies` — package.json'da var, kullanılmıyor

---

## ADIM 2: İlk Temizlik (2 dosya)

### A1: `src/components/Seo.tsx`

**Knip raporu:** "unused" olarak işaret edilmiş olabilir.

**Doğrulama:**
```bash
grep -r "Seo" src/ --include="*.tsx" | grep -v "node_modules" | wc -l
```

**Sonuç:** 0 ise silinebilir.

---

### A2: `src/components/LoadingSpinner.tsx`

**Doğrulama:**
```bash
grep -r "LoadingSpinner" src/ --include="*.tsx" | grep -v "node_modules" | wc -l
```

**Sonuç:** 0 ise silinebilir.

---

## ADIM 3: Gerçek Silme Kararı

**Knip rapobunda 77 dosya çıktığı söylenmişti. Ancak:**

> ⚠️ **max_files_changed: 10 limiti var. 10'dan fazla silme gerekirse FAZ 5A ve FAZ 5B olarak BÖL.**

### Karar Notu (Kullanıcıya Sor)

Knip raporu çalıştırıldıktan sonra:
- 10'dan az dosya silinecek → FAZ 5 tek seferde tamamla
- 10'dan fazla dosya silinecek → FAZ 5A (ilk 10), FAZ 5B (geri kalan)

---

## GRUP B — ProductDetailPage Dual Implementation (RAPORLA)

### Durum Tespiti

```bash
# ProductDetailPage.tsx ve ProductDetailPageView.tsx kullanımı
grep -r "ProductDetailPage" src/ --include="*.tsx" | grep -v "node_modules"
```

**Beklenen sonuç:** Her ikisi de farklı import yollarıyla kullanılıyor.

**Karar:** Bu dosyaları SILME — sadece raporla. Kararı kullanıcı alsın.

---

## ✅ Doğrulama

```bash
# 1. Knip çalıştır
npx knip --reporter compact

# 2. TSC
pnpm exec tsc --noEmit

# 3. Build
pnpm run build

# 4. Test
pnpm test -- --run
```

---

## Risk Analizi

| Risk | Seviye | Çözüm |
|------|--------|-------|
| Yanlışlıkla gerekli dosya silme | Orta | Her silmeden önce grep doğrula |
| Test break | Düşük | Test çalıştır |
| 10'dan fazla dosya silinmesi gerekiyor | Orta | FAZ 5A/5B'ye böl |

---

## FAZ Bağımlılığı

> ⚠️ FAZ 5 bağımsız çalışabilir. Ancak FAZ 2 (framer-motion) temizlenirse component sayısı azalır, FAZ 5 daha etkili olur.