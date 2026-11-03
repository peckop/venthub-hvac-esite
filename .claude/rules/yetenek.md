---
paths:
  - ".claude/skills/**"
  - "docs/audits/skill-*"
  - "docs/audits/skills-*"
---

# YETENEK: departmana özgü iş kuralları (başlıklar; yol kapsamlı, üretilmiş)

Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri `scripts/belge/rol-is-kurallari.json`); elle düzenleme. Yukarıdaki yollardaki dosyaya dokununca yüklenir. Gerekçeli tam metin ve olaylar: `docs/roller/YETENEK-kurallar.md` "Departmana özgü iş kuralları"; ders listesi aynı dosyada "Aynı ders ikinci kez".

1. Skill yazımı ve değişikliği yalnız skill-creator ile yapılır.
2. Türkçe tetik duyarlılığı eval ile ölçülür. Tetik açıklaması Türkçe yazılan kelimelerle de tetiklenir: yazım hatalı, eksiz ya da ekli, büyük-küçük harf ve ı/İ varyantları dahil.
3. Kanıt PR gövdesinde durur. Skill ekleyen ya da değiştiren PR'ın gövdesinde skill-creator eval raporu.
