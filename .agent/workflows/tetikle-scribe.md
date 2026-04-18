---
description: Dokümantasyon uzmanı Scribe'ın görev döngüsünü bulutta otonom olarak tetikler.
---

> **Önerilen Model:** Flash *(Kategori: Tetikleme)*

// turbo-all

Görevin: Scribe ajanını GitHub CLI üzerinden ateşle ve işlemi otonoma devret.

## 🚀 Gece Vardiyası Tetikleme: SCRIBE 📚

```bash
gh workflow run jules-scribe.yml
```

**Operasyon Özeti:** 
Bu komut GitHub Actions altyapısını uyarır. Scribe uyanacak, belgesiz kalmış (undocumented) genel fonksiyonları ve önemli logikleri bularak TSDoc standardında detaylı kod dokümantasyonu ekleyecek ve bir Pull Request açacaktır.
İşlemin seyrini projenin GitHub **Actions** sekmesinden izleyebilirsin.
