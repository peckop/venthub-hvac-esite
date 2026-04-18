---
description: Güvenlik ve mimari bekçisi Sentinel'in görev döngüsünü bulutta otonom olarak tetikler.
---

> **Önerilen Model:** Flash *(Kategori: Tetikleme)*

// turbo-all

Görevin: Sentinel ajanını GitHub CLI üzerinden ateşle ve işlemi otonoma devret.

## 🚀 Gece Vardiyası Tetikleme: SENTINEL 🛡️

```bash
gh workflow run jules-security-audit.yml
```

**Operasyon Özeti:** 
Bu komut GitHub Actions altyapısını uyarır. Sentinel uyanacak, RLS politikalarını, güvenlik açıklarını ve `auth.getUser()` eksikliklerini tarayacak ve otomatik bir Pull Request açacaktır.
İşlemin seyrini projenin GitHub **Actions** sekmesinden izleyebilirsin.
