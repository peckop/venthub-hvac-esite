---
paths:
  - ".github/workflows/**"
  - ".github/dependabot.yml"
  - "package.json"
  - "pnpm-lock.yaml"
  - "scripts/ci/**"
  - "docs/standards/bagimlilik-kararlari.md"
---

# ALTYAPI: departmana özgü iş kuralları (başlıklar; yol kapsamlı, üretilmiş)

Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri `scripts/belge/rol-is-kurallari.json`); elle düzenleme. Yukarıdaki yollardaki dosyaya dokununca yüklenir. Gerekçeli tam metin ve olaylar: `docs/roller/ALTYAPI-kurallar.md` "Departmana özgü iş kuralları"; ders listesi aynı dosyada "Aynı ders ikinci kez".

1. İzin bloğu. İş akışına `permissions:` yazılınca `contents: read` ZORUNLUDUR.
2. Aksiyonlar ve sırlar. Her `uses:` tam 40 haneli commit'e sabitlenir.
3. Tetik seçimi birleşmeyi belirler.
4. `deployment_status` süzgeci.
5. Önbellekli taban.
6. Aynı PR'da üç parça. Yeni iş akışı ya da kapı betiği tek PR'da şunlarla gelir: sabotajlı test, `test-haritasi.json` satırı.
7. Ortak dosya ve çakışma. Araç envanteri ve `test-haritasi.json`'a dokunan PR'lar SIRAYLA birleşir.
8. Done kanıtı ve doğrulayıcı. Kanban `command` kontrolünde `pnpm` komutu doğrulayıcıda reddedilir.
