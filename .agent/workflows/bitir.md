---
description: İş bittiğinde lint kontrolü yapar, commit oluşturur ve GitHub'a push eder. Tek komutla finalize.
---

// turbo-all

Görevin: Mevcut değişiklikleri lint'ten geçir, commit et ve push et.

## Adımlar

1. Lint kontrolü yap:
```bash
pnpm lint
```

2. Lint hatası varsa:
   - Hataları düzelt
   - Tekrar lint çalıştır
   - Temiz çıkana kadar devam et

3. Değişiklikleri stage'e al:
```bash
git add .
```

4. Commit mesajı oluştur:
   - Yapılan değişiklikleri analiz et
   - Conventional Commits formatında mesaj yaz:
     - `feat:` yeni özellik
     - `fix:` hata düzeltme
     - `docs:` dokümantasyon
     - `refactor:` kod iyileştirme
     - `chore:` bakım işleri

5. Commit yap:
```bash
git commit -m "TİP: kısa açıklama" -m "- Detay 1" -m "- Detay 2"
```

6. Push et:
```bash
git push origin master
```

7. Sonucu bildir:
   - Commit hash'i
   - Push durumu
   - Varsa uyarılar

## Notlar
- Lint hataları ciddi ise kullanıcıya sor
- Push başarısız olursa sebebini açıkla
- Hiç değişiklik yoksa bildir ve dur
