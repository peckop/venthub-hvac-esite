---
description: İş bittiğinde Tip kontrolü (TSC), Build testi ve Lint kontrolü yapar; her şey geçiyorsa commit/push eder.
---

> **Önerilen Model:** Gemini 3 Flash *(Kategori: Trivial)*


// turbo-all

Görevin: Projeyi nihai kalite denetiminden geçir (Superpowers Standardı) ve GitHub'a mühürle.

## 🏁 Nihai Doğrulama ve Mühürleme Adımları

0. **Hafıza Kontrolü (Recall — Zorunlu İlk Adım):**
   - Duraklatilmış görev var mı? Önce onları bitir.
```bash
python registry/engine.py recall
```

0b. **Diff Güvenliği Kontrolü:**
```bash
python .agent/skills/diff-review/scripts/check_diff_rules.py
```

1. **Tip Kontrolü (TSC):**
```bash
pnpm exec tsc -b tsconfig.build.json
```

2. **Üretim Tipi Build Testi:**
```bash
pnpm run build
```

3. **Lint Denetimi:**
```bash
pnpm run lint:ci
```

4. **Kritik Kontrol:**
   - Yukardaki 3 adımdan herhangi biri hata verirse DUR.
   - Hataları `superpowers-debug` veya `superpowers-tdd` ile çöz.
   - Tüm adımlar 0 hata ile tamamlanana kadar devam etme.

5. **Kritik Karar Hafizası (Opsiyonel — Önem Taşıyan Bir Mimari Karar Varsa):**
   - Bug fix, linter düzeltmesi gibi rutin işlerde bu adımı atla.
   - Mimari bir karar, kritik bir tuzak veya tekrar edilmemesi gereken bir hata varsa yaz:
```bash
python registry/engine.py remember "Karar/Ders: ..." --type DECISION
```

   - Görevin JSON artifact'larını engine.py ile doğrula.
   - Trivial ise sadece `trivial.json`'ı doğrula:
```bash
python registry/engine.py cross-validate registry/PXX-Proje/YYY-gorev
```

6. **Görev Mühürleme (Registry Finalize):**
   - Tüm artifact'lar geçerliyse görevi tamamla ve `completed/` dizinine taşı.
```bash
python registry/engine.py finalize-task registry/PXX-Proje/YYY-gorev
```

7. **Değişiklikleri Sahnele:**
```bash
git add .
```

8. **Conventional Commit Mesajı Hazırla:**
   - Yapılan işi analiz et (Örn: `fix(auth): solved id mismatch in projects`).
   - `superpowers-finish` standartlarına uygun detaylı bir mesaj yaz.

9. **Mühürleme (Commit):**
```bash
git commit -m "TİP: açıklama"
```

10. **Yayına Gönder (Push):**
```bash
git push origin master
```

## 📜 Kalite Notları
- **Sıfır Tolerans:** Lint uyarısı veya TSC hatası olan kod mühürlenemez.
- **Bütünlük:** Build testi geçmeyen kod projeyi kıracağı için push edilemez.
- **Rapor:** İşlem sonunda özet bir "Mühendislik Raporu" (Completion Report) sun.
