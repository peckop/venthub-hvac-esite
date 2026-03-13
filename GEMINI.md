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

## 4. Onay ve Planlama
- **Plan Gate:** Küçük olmayan tüm değişiklikler için önce strateji belirlenmeli, beyin fırtınası yapılmalı ve kullanıcı onayı alınmalıdır.
- **Validation Gate:** Her değişiklik `tsc`, `lint` ve ilgili testlerle doğrulanmalıdır. "Çalışıyor gibi görünüyor" bir kabul kriteri değildir; "Hatasız derleniyor ve testten geçiyor" esastır.

---
*Bu anayasa, projenin sürdürülebilirliğini ve güvenliğini korumak için mühürlenmiştir.*
