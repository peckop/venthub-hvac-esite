---
description: Teknik borç avcısı Janitor'ın görev döngüsünü bulutta otonom olarak tetikler.
---

> **Önerilen Model:** Flash *(Kategori: Tetikleme)*

// turbo-all

Görevin: Janitor ajanını GitHub CLI üzerinden ateşle ve işlemi otonoma devret.

## 🚀 Gece Vardiyası Tetikleme: JANITOR 🧹

```bash
gh workflow run jules-janitor.yml
```

**Operasyon Özeti:** 
Bu komut GitHub Actions altyapısını uyarır. Janitor uyanacak, kod tabanına dağılmış geçici as any vb. `// TODO`, `// FIXME` ve `// HACK` etiketlerini bularak kalıcı ve sağlam çözümler üretecek ve bir Pull Request açacaktır.
İşlemin seyrini projenin GitHub **Actions** sekmesinden izleyebilirsin.
