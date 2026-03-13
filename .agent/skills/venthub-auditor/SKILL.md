---
name: venthub-auditor
description: Proje genelinde Teknik Borç (Technical Debt) analizi yapar. i18n ihlalleri, 'any' tipi kullanımı, performans düşüren <img> etiketleri ve erişilebilirlik (A11y) eksiklerini tespit eder.
---

# VentHub Auditor Skill

Bu yetenek, VentHub projesinin kalite standartlarını korumak için tasarlanmıştır.

## Kullanım Senaryoları
- Bir sayfa veya bileşen bittiğinde kalite kontrolü yapmak.
- Mevcut teknik borçları listelemek.
- CI/CD öncesi son denetim.

## Teftiş Kriterleri ve Komutlar

### 1. i18n Denetimi (Hardcoded Metin Bulma)
Kod içinde `t()` fonksiyonuna bağlanmamış, tırnak içinde direkt yazılan ve Türkçe karakter içeren metinleri bulur.
- **Regex:** `(['"])(?:(?!\bt\().)*?[şğüöçıŞĞÜÖÇİ].*?\1`
- **Hedef:** `.tsx`, `.ts` dosyaları.

### 2. TypeScript Denetimi ('any' Kullanımı)
Güvenli olmayan `as any` tip dönüşümlerini bulur.
- **Regex:** `\bas any\b`

### 3. Performans Denetimi (Next.js Image)
Next.js optimizasyonu yerine kullanılan düz HTML resim etiketlerini bulur.
- **Regex:** `<img\b`

### 4. Erişilebilirlik Denetimi (A11y)
`aria-label` içermeyen buton ve linkleri raporlar (Yüksek öncelikli).
- **Arama:** `<button(?![^>]*aria-label)[^>]*>`

## Çalıştırma Talimatı
Audit yapmak için şu komutu veya benzerini kullanın:
`grep_search --pattern "[REGEX]" --include_pattern "src/**"`

Veya otomatik scripti çalıştırın:
`python .agent/skills/venthub-auditor/scripts/run_audit.py`
