---
description: Performans optimizasyon uzmanı Bolt'un görev döngüsünü bulutta otonom olarak tetikler.
---

> **Önerilen Model:** Flash *(Kategori: Tetikleme)*

// turbo-all

Görevin: Bolt ajanını GitHub CLI üzerinden ateşle ve işlemi otonoma devret.

## 🚀 Gece Vardiyası Tetikleme: BOLT ⚡

```bash
gh workflow run jules-performance.yml
```

**Operasyon Özeti:** 
Bu komut GitHub Actions altyapısını uyarır. Bolt uyanacak, koddaki performans darboğazlarını (N+1 sorguları, React re-render sorunları vb.) bulacak ve otomatik bir Pull Request açacaktır.
İşlemin seyrini projenin GitHub **Actions** sekmesinden izleyebilirsin.
