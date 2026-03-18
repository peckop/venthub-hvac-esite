---
name: venthub-auditor
description: Next.js 15, React 19 ve Edge Runtime standartlarına göre projeyi denetler. Teknik borç, tip güvenliği, i18n ihlalleri ve performans engellerini raporlar.
---

# VentHub Auditor Skill (Modernized v8.0)

Bu yetenek, VentHub projesinin Next.js 15 ve Edge Native mimarisine tam uyumunu denetlemek için tasarlanmıştır.

## Kullanım Senaryoları
- **Commit Öncesi:** Yeni yazılan kodun anayasaya uygunluğunu denetlemek.
- **Modernizasyon Audit:** Eski (Vite/Next 14) kalıntılarını temizlemek.
- **Edge Deployment Kontrolü:** Kodun Cloudflare Pages üzerinde çalışabilirliğini teyit etmek.

## Teftiş Kriterleri (Audit Matrix)

### 1. Next.js 15 & React 19 Denetimi
Next.js 15 ile gelen asenkron yapıları ve React 19 hook'larını denetler.
- **Kritik:** `page.tsx` veya `layout.tsx` içinde `params` veya `searchParams` nesnelerinin `await` edilmeden kullanılması yasaktır.
  - *Regex:* `const\s+\{.*\}\s+=\s+params` (Await yoksa hata ver!)
- **Yeni:** `useFormState` yerine `useActionState` kullanımı zorunludur.
  - *Regex:* `useFormState` (Gördüğünde `useActionState` öner!)

### 2. Edge Runtime & Cloudflare Uyumluluğu
Proje Edge Runtime üzerinde çalıştığı için Node.js'e özgü kütüphanelerin kullanımı denetlenmelidir.
- **Yasaklılar:** `fs`, `path`, `crypto` (node: modülleri), `Buffer` (doğrudan kullanım).
- **SSR-First:** `ssr: false` kullanımı mimari bir zorunluluk olmadıkça yasaktır.
  - *Regex:* `ssr:\s*false`

### 3. Supabase & Veri Katmanı (Strict Typing)
`as any` ile susturulmuş veritabanı çağrılarını bulur.
- **Kritik:** `supabase.rpc as any` kullanımı yasaktır.
  - *Doğru Kullanım:* `supabase.rpc<"function_name">(...)`
- **Model Uyumu:** Veritabanı satırları için her zaman `src/types/db-rows.ts` içindeki aliaslar (`DbProduct`, `DbOrder` vb.) kullanılmalıdır.

### 4. i18n ve Hardcoded Metin Denetimi
- **Kural:** Tüm kullanıcıya görünen metinler `t()` fonksiyonu içinde olmalıdır.
- **İstisna:** Teknik loglar ve veritabanı ID'leri hariçtir.
- **Tespit:** Türkçe karakter (`şğüöçıŞĞÜÖÇİ`) içeren ve `t(` sarmalı olmayan tırnaklı metinleri raporlar.

### 5. Performans ve CLS (LCP Focus)
- **Skeleton-First:** Her dinamik veri yükleyen bileşen için bir `Skeleton` muadili tanımlanmalıdır.
- **Image:** Tüm `<img` etiketleri Next.js `Image` (veya `VentImage`) ile değiştirilmelidir.
- **Window Safety:** `typeof window !== 'undefined'` kontrolü olmadan yapılan `window` veya `localStorage` erişimleri yasaktır.

## Denetim Komutları

### Genel Teknik Borç Taraması
`grep_search --pattern "\bas any\b|ssr:\s*false|useFormState" --include_pattern "src/**"`

### Next.js 15 Params Taraması
`grep_search --pattern "params:" --include_pattern "src/app/**/page.tsx"`

### Supabase RPC Taraması
`grep_search --pattern "\.rpc as any" --include_pattern "src/lib/supabase.ts"`

## İyileştirme Talimatı
Audit sonucunda bulunan hatalar için **"Surgical Update" (Cerrahi Güncelleme)** yapılmalıdır. Tüm dosya yerine sadece sorunlu satır `replace` aracıyla düzeltilmelidir.
