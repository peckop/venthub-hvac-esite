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

### 2. TypeScript Denetimi (Tip Güvenliği)
- **Regex:** `\bas any\b`, `\bas unknown\b`, `\b: any\b`, `\b: unknown\b`
- **Hedef:** Kodda tip güvenliğini bozan dökümleri (cast) ve belirsiz tip atamalarını bulur.
- **Kural:** Herhangi bir `as any` kullanımı teknik borçtur. Bunun yerine `src/types/db-rows.ts` içindeki modeller kullanılmalıdır.

### 5. JSON ve Record Denetimi
- **Regex:** `\.technical_specs\[`, `\.specs\[`
- **Hedef:** JSON alanlarına Type Guard olmadan erişimi bulur.
- **Kural:** `(specs as any)[key]` gibi yapılar yasaktır. Önce `isRecord` guard'ı veya `TypedRecord<T>` kullanılmalıdır.

### 3. Performans Denetimi (Next.js Image & SSR)
Next.js optimizasyonu yerine kullanılan düz HTML resim etiketlerini ve SSR engelleyicileri bulur.
- **Regex:** `<img\b` (Next.js Image yerine düz img kullanımı)
- **Regex:** `ssr:\s*false` (SSR'ı kapatan dinamik importlar - LCP düşmanıdır)
- **Regex:** `window\.(location|localStorage|sessionStorage|innerWidth)` (Sunucu tarafında patlayacak ve SSR'ı engelleyecek window kullanımları)

### 4. Vite & Migration Denetimi
Vite projesinden kalma ve Next.js'e taşınması gereken yapıları bulur.
- **Regex:** `import\s+.*from\s+['"]react-router-dom['"]` (Vite mirası router kullanımı)
- **Regex:** `const\s+router\s+=\s+useRouter\(\)` (Eğer 'next/router'dan geliyorsa App Router uyumsuzdur, 'next/navigation' olmalı)

### 6. Erişilebilirlik ve CLS (Layout Shift) Denetimi
- **Arama:** `<button(?![^>]*aria-label)[^>]*>` (A11y eksikliği)
- **Arama:** `className="[^"]*animate-pulse[^"]*"` (Skeleton var mı? Yoksa eklenecek yerleri belirler)

## Çalıştırma Talimatı
Audit yapmak için şu komutu veya benzerini kullanın:
`grep_search --pattern "[REGEX]" --include_pattern "src/**"`

Veya otomatik scripti çalıştırın:
`python .agent/skills/venthub-auditor/scripts/run_audit.py`
