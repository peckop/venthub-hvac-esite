# VentHub Proje Anayasası (Constitution)

Bu dosya, VentHub projesindeki tüm AI asistanları ve mühendisler için en üst düzey rehberdir. Buradaki kurallar tartışmaya kapalıdır ve her session başlangıcında okunmalıdır.

## 0. Zorunlu Başlangıç Ritüeli (Pre-flight Checklist)
> [!IMPORTANT]
> Ajan, her session başlangıcında veya yeni bir göreve (Task) geçerken aşağıdaki adımları **SIRAYLA** ve **EKSİKSİZ** yapmak zorundadır:
> 1. `python registry/manage_registry.py normalize`: Otonom senkronizasyonu tetikle (MD -> DB -> PULSE).
> 2. `registry/PULSE.md`: Güncel projenin genel nabzını ve açık görevleri gör.
> 3. `python registry/manage_registry.py recall`: Ajanlar arası paylaşımlı hafızayı (Memory Bridge) geri çağır.
> 4. `docs/CHANGELOG.md`: Projenin yakın geçmişini ve yapılan mimari değişiklikleri oku.
> 5. `.agent/skills/venthub-integrity-guard/SKILL.md`: **[KRİTİK]** Bütünlük kalkanı kurallarını ve korunan varlık listesini oku.

> 3. `registry/REGISTRY_PROTOCOL.md`: Dosya isimlendirme ve hiyerarşi kurallarını tazele.
> 4. İlgili görevin `.md` dosyası (Örn: `033-tech-debt-cleanup.md`): Görevin GERÇEK statüsünü (TODO/Planning/Executing) teyit et.

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
- **Zorunlu Plan:** `plan.json` dosyası doldurulmadan ve her adım için `Verify:` maddesi eklenmeden `src/` dizinine bir karakter bile yazılamaz.
- **Trivial Bypass (İstisna):** Linter hatası veya typo gibi küçük işler için çapraz doğrulamayı atlayan `python registry/engine.py create-task ... --trivial` komutuyla doğrudan `trivial.json` üretilip, bürokrasiye girmeden kod yazılıp commetlenebilir. Kapama işleminde testlerin geçtiği (all_passed: true) kanıtlanmalıdır.

## 7. Registry Sentinel (Koruma Sistemi) - [🚨 GÜVENLİK KİLİDİ]
> [!CAUTION]
> **Registry Güvenlik Kilidi:** `registry/` dizini altındaki hiçbir dosya veya klasör (PXX projeleri), `write_file`, `replace`, `rm` veya benzeri manuel dosya araçlarıyla manipüle edilemez.
> - **Zorunlu Motor:** Proje başlatma, görev oluşturma, taşıma veya mühürleme işlemleri YALNIZCA `python registry/manage_registry.py` otonom motoru üzerinden yapılabilir.
> - **Manuel Müdahale Yasağı:** Ajan, doğrudan klasör oluşturma veya dosya silme yetkisini bu dizin için kaybetmiştir. Her işlem `manage_registry.py` komutlarıyla tetiklenmek zorundadır.
> - **Orion Güvenli Hafıza (V8):** `recall` ve `remember` komutları artık eski güvensiz JSON yerine, doğrudan `registry.db` içindeki `agent_memory` tablosuna yazmaktadır. Ajanlar arası kritik veri aktarımları *sadece* bu komutlarla yapılmalıdır.
> - **Planlama Disiplini (Superpowers):** Planlar asla AI'nın kendi cümleleriyle manuel yazılamaz. Mutlaka `.agent/skills/superpowers-workflow/scripts/write_artifact.py` scripti kullanılmalı ve `artifacts/superpowers/plan.md` yoluna kaydedilmelidir.

- **Workflow Sıralaması:** Ajan, `REGISTRY_PROTOCOL.md` Madde 5'teki 6 adımlık yaşam döngüsüne (Brainstorm -> Plan -> Activate -> Execute -> Review -> Close) harfiyen uymak zorundadır. Adım atlamak "Mühendislik Suçu"dur.
- **Yüzeysel Plan Yasağı:** `...` gibi placeholder içeren veya doğrulanabilir adımı olmayan planlar "geçersiz" kabul edilir. Her adımda `Verify:` maddesi zorunludur.
- **Geri Besleme Takibi (Feedback Loop):** Herhangi bir `manage_registry.py` komutundan sonra terminal çıktısını MUTLAKA oku. Eğer `[🚨 SENTINEL]` veya `[🚨 PROTOKOL İHLALİ]` uyarısı görürsen, bu "Sistem senin yetkini elinden aldı" demektir.
- **Dosya Bütünlüğü:** Registry motoru (v5.0) artık dosya içeriğini silmemektedir. Eğer bir dosya boş görünüyorsa, bu AI'nın scripti doğru kullanmadığını gösterir.

## 8. Last-Mile Engineering (Son Kilometre Disiplini)
> [!IMPORTANT]
> **Üretim Standartı:** VentHub projesinde ilerleme lineer değil, logaritmik bir ciddiyetle ele alınır.
> - **Logaritmik Hassasiyet:** Hata sayısı azaldıkça, kalan her bir hatanın toplam kalite üzerindeki ağırlığı artar. 1000 hatadan 10'a inmek sadece "zemin hazırlığı"dır; gerçek mühendislik o son 10 hatada başlar.
> - **Cerrahi Eşik (Surgical Threshold):** Hata sayısı 20'nin altına düştüğünde ajan otomatik olarak "Cerrahi Mod"a geçer. Bu modda her bir hata, görevin %100 başarısı önündeki devasa bir engel olarak görülür.
> - **Sıfır Tolerans:** "İhmal edilebilir hata" veya "önemsiz uyarı" kavramı yasaktır. Bir görev ancak tüm denetim araçları (`lint`, `check_integrity.py`) tam 0 (sıfır) hata verdiğinde mühürlenebilir.
> - **Robotik Refleks Yasağı:** Sadece sayıları düşürmek için yapılan her hamle (isimlendirme bozma, anlamsız prefix ekleme) "Mühendislik Suçu"dur ve görevin derhal durdurulmasını gerektirir.



---
*Bu anayasa, projenin sürdürülebilirliğini ve güvenliğini korumak için mühürlenmiştir.*
