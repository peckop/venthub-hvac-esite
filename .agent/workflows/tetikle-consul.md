---
description: Yerelleştirme (i18n) bekçisi Consul'un görev döngüsünü bulutta otonom olarak tetikler.
---

> **Önerilen Model:** Flash *(Kategori: Tetikleme)*

// turbo-all

Görevin: Consul ajanını GitHub CLI üzerinden ateşle ve işlemi otonoma devret.

## 🚀 Gece Vardiyası Tetikleme: CONSUL 🌍

```bash
gh workflow run jules-i18n-sync.yml
```

**Operasyon Özeti:** 
Bu komut GitHub Actions altyapısını uyarır. Consul uyanacak, kod içine gömülmüş (hardcoded) statik metinleri tarayıp `useI18n()` veya `getDictionary()` formatına dönüştürerek bir Pull Request açacaktır.
İşlemin seyrini projenin GitHub **Actions** sekmesinden izleyebilirsin.
