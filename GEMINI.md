# VentHub Proje Anayasası (Constitution)

Bu dosya, VentHub projesindeki tüm AI asistanları ve mühendisler için en üst düzey rehberdir. Buradaki kurallar tartışmaya kapalıdır ve her session başlangıcında okunmalıdır.

## 0. Zorunlu Başlangıç Ritüeli (Pre-flight Checklist)
> [!IMPORTANT]
> Ajan, her session başlangıcında veya yeni bir göreve (Task) geçerken aşağıdaki adımları **SIRAYLA** ve **EKSİKSİZ** yapmak zorundadır. Bu dosyalar sistem tarafından "otomatik verilmez", fiziksel olarak `view_file` ile okunmalıdır:
> 1. `registry/PULSE.md`: Projenin genel nabzını ve açık görevleri gör.
> 2. `registry/REGISTRY_PROTOCOL.md`: Dosya isimlendirme ve hiyerarşi kurallarını tazele.
> 3. İlgili görevin `.md` dosyası (Örn: `033-tech-debt-cleanup.md`): Görevin GERÇEK statüsünü (TODO/Planning/Executing) teyit et.

## 1. İletişim Standartları
- **Dil:** Tüm iletişim (planlar, raporlar, açıklamalar) **TÜRKÇE** olmalıdır.
- **Ton:** Kıdemli Yazılım Mimarı disipliniyle, "Girdi -> İşlem -> Çıktı" odaklı teknik bir dil kullanılmalıdır.
- **Dürüstlük:** Tahmin yürütme (no hallucinations), sadece kanıtlanmış ve doğrulanmış çözümler üret.

## 🗺️ Proje Haritası ve Dosya Bulma Stratejisi
Ajan, projede dosya ararken "körlemesine" `grep` yapmak yerine aşağıdaki haritayı ve araçları kullanmalıdır:
- **Registry & Task Navigasyonu:**
  - `python registry/manage_registry.py list`: Tüm projeleri ve aktif/backlog görevleri listeler.
  - `python registry/manage_registry.py search <ID>`: Belirli bir ID'ye sahip görevi (örn: 033) tüm projelerde arar ve tam yolunu söyler.
- **Sayfalar ve Görünümler:**
  - `src/app/`: Next.js App Router (Routing yapısı burada).
  - `src/views/`: Sayfa içerikleri ve ana UI blokları (Asıl mantık burada).
- **Veritabanı ve Tipler:**
  - `src/types/`: Tüm TypeScript tanımları (Source of Truth).
  - `src/lib/supabase.ts`: DB bağlantıları ve ana servis fonksiyonları.
- **Bileşenler:** `src/components/` altında kategorize edilmiştir (ui, products, navigation vb.).

> [!TIP] **Dosya Bulma İpucu (Windows/PowerShell):**
> Eğer bir dosyanın yerinden emin değilseniz: `git grep -l "BileşenAdı" src` veya `dir /s /b *DosyaAdı*` komutlarını kullanın. Asla tam yolunu bilmediğiniz dosyaya `view_file` ile gitmeye çalışmayın.

## 2. Teknik Disiplin ve Tip Güvenliği (Strict Typing)
- **Source of Truth:** `src/types/database.types.ts` tek gerçek kaynaktır. `src/types/database.ts` sadece buradan re-export yapmalıdır.
- **No-Any Policy:** `any`, `as any`, `as unknown as` kullanımı KESİNLİKLE yasaktır. Geçici dökümler yerine `src/types/db-rows.ts` içindeki alias'lar kullanılmalıdır.
- **Type Guards:** JSON alanları (technical_specs vb.) işlenirken mutlaka `isRecord` veya ilgili Type Guard fonksiyonları kullanılmalıdır.
- **Null-Safety:** Opsiyonel alanlar (`?.`) ve null kontrolleri (`??`) titizlikle yapılmalıdır.

## 3. Mimari Kurallar
- **Converter Katmanı:** Veritabanı modelleri ve UI modelleri arasındaki dönüşüm `src/lib/type-converters.ts` üzerinden, sıkı tip kontrolüyle yapılmalıdır.
- **Component Integrity:** Yeni bileşenler `src/components/` altında uygun kategoriye konulmalı ve `useI18n()` ile uluslararasılaştırılmalıdır.
- **Supabase Services:** Tüm Supabase servisleri (`src/lib/supabase.ts`) asimetrik tip (input/output) güvenliğine sahip olmalıdır.

## 5. Performans ve Modernizasyon (Next.js 15 & React 19)
- **Async Params Policy:** Next.js 15 ile gelen asenkron `params` ve `searchParams` yapısı zorunludur. Tüm dinamik rotalarda (`[id]`, `[slug]` vb.) bu nesneler `await` edilmeden kullanılamaz.
- **SSR-First Policy:** Tüm yeni rotalar ve ana sayfalar varsayılan olarak Server Component (`ssr: true`) olmalıdır. `ssr: false` kullanımı için mimari bir zorunluluk kanıtlanmalı ve kullanıcı onayı alınmalıdır.
- **Window-Safety:** `window`, `document`, `localStorage` bağımlılıkları asla üst seviye bileşenlerde (top-level) kullanılmamalıdır. Sadece `useEffect` veya dinamik `typeof window` kontrolüyle kapsüllenmelidir.
- **LCP & CLS Focus:** Her yeni görsel bileşen için `width/height` zorunludur. Her dinamik veri alanı için bir `Skeleton` (İskelet) bileşeni planlanmadan kod yazılamaz.
- **Vite Legacy & ESLint:** Proje içindeki `react-router-dom` gibi Vite yapıları yasaktır. ESLint 9 Flat Config (`eslint.config.mjs`) standarttır.

## 6. Onay ve Planlama (No-Plan-No-Code Policy)
- **Planning-First:** Bir görev `backlog`'dan `active`'e çekildiğinde statüsü otomatik olarak `Planning` olur. 
- **Zorunlu Plan:** `plan.md` dosyası `superpowers-write-plan` skill'ini ile doldurulmadan ve her adım için `Verify:` maddesi eklenmeden `src/` dizinine bir karakter bile yazılamaz.
- **Workflow Sıralaması:** Ajan, `REGISTRY_PROTOCOL.md` Madde 5'teki 6 adımlık yaşam döngüsüne (Brainstorm -> Plan -> Activate -> Execute -> Review -> Close) harfiyen uymak zorundadır. Adım atlamak "Mühendislik Suçu"dur.
- **Yüzeysel Plan Yasağı:** `...` gibi placeholder içeren veya doğrulanabilir adımı olmayan planlar "geçersiz" kabul edilir.
- **Onay Mekanizması:** Kullanıcıdan alınan "Plan Mode" onayı, sadece planlama sürecini başlatmak içindir. Kodlama aşamasına ancak plan tamamlandıktan sonra geçilebilir.
- **Geri Besleme Takibi (Feedback Loop):** Herhangi bir `manage_registry.py` komutundan sonra terminal çıktısını MUTLAKA oku. Eğer `[🚨 SENTINEL]` veya `[🚨 PROTOKOL İHLALİ]` uyarısı görürsen, bu "Sistem senin yetkini elinden aldı" demektir. Bu durumda hemen dur ve eksik planlama/brainstorming adımlarını tamamla.
- **Durum Teyidi:** Her yeni turn başlangıcında veya görev değişiminde ilk iş olarak ilgili `.md` dosyasını `view_file` ile oku. Kendi hafızandaki duruma değil, dosyadaki gerçek statüye güven.

---
*Bu anayasa, projenin sürdürülebilirliğini ve güvenliğini korumak için mühürlenmiştir.*
