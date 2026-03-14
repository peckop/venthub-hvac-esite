# VentHub Proje Anayasası (Constitution)

Bu dosya, VentHub projesindeki tüm AI asistanları ve mühendisler için en üst düzey rehberdir. Buradaki kurallar tartışmaya kapalıdır ve her session başlangıcında okunmalıdır.

## 1. İletişim Standartları
- **Dil:** Tüm iletişim (planlar, raporlar, açıklamalar) **TÜRKÇE** olmalıdır.
- **Ton:** Kıdemli Yazılım Mimarı disipliniyle, "Girdi -> İşlem -> Çıktı" odaklı teknik bir dil kullanılmalıdır.
- **Dürüstlük:** Tahmin yürütme (no hallucinations), sadece kanıtlanmış ve doğrulanmış çözümler üret.

## 2. Teknik Disiplin ve Tip Güvenliği (Strict Typing)
- **Source of Truth:** `src/types/database.types.ts` tek gerçek kaynaktır. `src/types/database.ts` sadece buradan re-export yapmalıdır.
- **No-Any Policy:** `any`, `as any`, `as unknown as` kullanımı KESİNLİKLE yasaktır. Geçici dökümler yerine `src/types/db-rows.ts` içindeki alias'lar kullanılmalıdır.
- **Type Guards:** JSON alanları (technical_specs vb.) işlenirken mutlaka `isRecord` veya ilgili Type Guard fonksiyonları kullanılmalıdır.
- **Null-Safety:** Opsiyonel alanlar (`?.`) ve null kontrolleri (`??`) titizlikle yapılmalıdır.

## 3. Mimari Kurallar
- **Converter Katmanı:** Veritabanı modelleri ve UI modelleri arasındaki dönüşüm `src/lib/type-converters.ts` üzerinden, sıkı tip kontrolüyle yapılmalıdır.
- **Component Integrity:** Yeni bileşenler `src/components/` altında uygun kategoriye konulmalı ve `useI18n()` ile uluslararasılaştırılmalıdır.
- **Supabase Services:** Tüm Supabase servisleri (`src/lib/supabase.ts`) asimetrik tip (input/output) güvenliğine sahip olmalıdır.

## 5. Performans Muhafızlığı (90+ Lighthouse Guardrails)
- **SSR-First Policy:** Tüm yeni rotalar ve ana sayfalar varsayılan olarak Server Component (`ssr: true`) olmalıdır. `ssr: false` kullanımı için mimari bir zorunluluk kanıtlanmalı ve kullanıcı onayı alınmalıdır.
- **Window-Safety:** `window`, `document`, `localStorage` bağımlılıkları asla üst seviye bileşenlerde (top-level) kullanılmamalıdır. Sadece `useEffect` veya dinamik `typeof window` kontrolüyle kapsüllenmelidir.
- **LCP & CLS Focus:** Her yeni görsel bileşen için `width/height` zorunludur. Her dinamik veri alanı için bir `Skeleton` (İskelet) bileşeni planlanmadan kod yazılamaz.
- **Vite Legacy:** Proje içindeki `react-router-dom` veya `window.location` gibi Vite döneminden kalan yapılar görüldüğü an Next.js App Router standartlarına (`next/navigation`) modernize edilmelidir.

## 6. Onay ve Planlama
... (mevcut içerik)

---
*Bu anayasa, projenin sürdürülebilirliğini ve güvenliğini korumak için mühürlenmiştir.*
