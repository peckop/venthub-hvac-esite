---
description: İş bittiğinde Tip kontrolü (TSC), Build testi ve Lint kontrolü yapar; her şey geçiyorsa commit/push eder.
---

// turbo-all

Görevin: Projeyi nihai kalite denetiminden geçir (Superpowers Standardı) ve GitHub'a mühürle.

## 🏁 Nihai Doğrulama ve Mühürleme Adımları

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

5. **Değişiklikleri Sahnele:**
```bash
git add .
```

6. **Conventional Commit Mesajı Hazırla:**
   - Yapılan işi analiz et (Örn: `fix(auth): solved id mismatch in projects`).
   - `superpowers-finish` standartlarına uygun detaylı bir mesaj yaz.

7. **Mühürleme (Commit):**
```bash
git commit -m "TİP: açıklama"
```

8. **Yayına Gönder (Push):**
```bash
git push origin master
```

## 📜 Kalite Notları
- **Sıfır Tolerans:** Lint uyarısı veya TSC hatası olan kod mühürlenemez.
- **Bütünlük:** Build testi geçmeyen kod projeyi kıracağı için push edilemez.
- **Rapor:** İşlem sonunda özet bir "Mühendislik Raporu" (Completion Report) sun.
