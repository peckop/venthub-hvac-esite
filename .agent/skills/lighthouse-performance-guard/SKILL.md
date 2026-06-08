---
name: lighthouse-performance-guard
description: Automates web page performance audits, Lighthouse tracing, and web vitals
  checks against performance guidelines to prevent regressions. Do NOT use for general
  database setup, running local unit tests (Vitest), formatting markdown tables, or
  styling fonts.
when_to_use: 'Kullan: Projede yeni bir sayfa eklendiginde, performans düsüsü (Lighthouse
  regresyonu) yasandiginda veya anasayfa/kritik rotalarda Core Web Vitals metriklerini
  stabilize etmek istendiginde.

  '
allowed-tools:
- call_mcp_tool
- run_command
- write_to_file
- replace_file_content
- view_file
- grep_search
category: audit
metadata:
  triggers:
  - lighthouse audit
  - performance check
  - web vitals check
  inputs:
  - local web server page url
  outputs:
  - tracing analysis report
---


# Lighthouse Performance Guard & Optimization Pipeline

Bu skill, VentHub HVAC projesinde performans regresyonlarını önlemek, Core Web Vitals değerlerini korumak ve Lighthouse puanlarını en üst düzeyde tutmak amacıyla **Google Chrome DevTools Tracing, Vercel/Addy Osmani En İyi Pratikleri, Multi-Agent Denetimi, TDD (Test-Driven Development) Döngüsünü ve Proje Genetik Kartını (project-dna.yaml)** birleştiren otonom bir denetim ve optimizasyon boru hattı (pipeline) sağlar.

---

## 🎯 Hedef
Kritik sayfa rotalarında (Anasayfa, Ürün Detay, Sepet vb.) Lighthouse Performans Puanını **90+ (Enterprise Green Status)** seviyesinde stabilize etmek; LCP < 2.5s, TTFB < 200ms, CLS = 0.00 ve TBT < 200ms hedeflerini regresyon olmaksızın korumak.

---

## 🛠️ İş Akışı Adımları (Pipeline Steps)

### Adım 1 — Tarayıcı Tracing ve İlk Teşhis
* **Aksiyon:** `chrome-devtools-mcp` aracılığıyla hedef sayfayı ziyaret et ve performans izi (trace) çıkar.
* **Komut/Araç:**
  ```javascript
  navigate_page(type="url", url="<HEDEF_URL>")
  performance_start_trace(autoStop=true, reload=true, filePath="C:\\Users\\alize\\.gemini\\antigravity\\brain\\<conversation-id>\\scratch\\trace.json")
  ```
* **Başarı Kriteri:** Trace çıktısından **TTFB, LCP, CLS ve LCP elemanının (Image/Text node) görsel tespiti** verilerinin toplanması.

### Adım 2 — Ön Rapor ve Taslak Plan Hazırlığı
* **Aksiyon:** Trace verilerinde tespit edilen LCP elemanını ve sayfanın bileşen kodlarını incele. Projenin genetik kartı olan **[project-dna.yaml](file:///c:/Users/alize/venthub-hvac/project-dna.yaml)** dosyasını okuyarak buradaki kalite limitleri ve yasaklı sınırlara uygun bir "Taslak Performans İyileştirme Planı" (`draft_plan.md`) hazırlayarak scratch dizinine yaz.

### Adım 3 — Çoklu Ajan Denetimi ve Çift-Filtre Döngüsü
* **Aksiyon:** Taslak planın doğruluğunu ve kurallara uygunluğunu teyit etmek için `define_subagent` ve `invoke_subagent` ile iki uzman denetçi ajan oluştur. **Ajanların sistem promptlarında ilk kural olarak [project-dna.yaml](file:///c:/Users/alize/venthub-hvac/project-dna.yaml) dosyasını okumalarını zorunlu kıl:**
  1. **`vercel_performance_auditor`:** Taslak planı `vercel-react-best-practices/AGENTS.md` (70 kural) ve `project-dna.yaml` çerçevesinde denetler.
  2. **`chrome_performance_auditor`:** Taslak planı `C:\Users\alize\.agents\skills\performance\SKILL.md` (Addy Osmani) ve `project-dna.yaml` çerçevesinde denetler.
* **Başarı Kriteri:** Her iki denetçi ajanın da kendi temsil ettiği skill kuralları ve genetik kart standartları açısından planı inceleyip onaylaması (**VERDICT: APPROVED**). Gerekirse planı revize et.

### Adım 4 — NotebookLM ve Kullanıcı Onayı
* **Aksiyon:** Ajanların onayından geçmiş nihai planı **[implementation_plan.md](file:///C:/Users/alize/.gemini/antigravity/brain/856b6197-f611-4a2d-8f58-6707896950e2/implementation_plan.md)** olarak kaydet, NotebookLM defterine sunarak mimari onay al ve ardından kullanıcı onayına sun.

### Adım 5 — TDD (Red-Green-Refactor) ile Kod Geliştirme
* **Aksiyon:** Plandaki kod değişikliklerini uygulamak için `C:\Users\alize\.agents\skills\tdd\SKILL.md` kurallarına uygun olarak **Dikey Dilimleme (Vertical Slicing)** döngüsünü işlet. Geliştirici ajanın `project-dna.yaml` test baseline'larına uymasını sağla:
  1. **RED:** Değişikliğin (örn: fetchPriority veya dynamic import) varlığını ve DOM çıktısını doğrulayan bir Vitest/E2E test yaz. Çalıştır ve **testin hata verdiğini gör**.
  2. **GREEN:** Testin geçmesi için gereken en minimal kodu hedef dosyaya yaz. Çalıştır ve **testin yeşile döndüğünü gör**.
  3. **REFACTOR:** Kodu ve testleri refaktör et, temizle. Her adımda testi çalıştırarak yeşil durumu koru.
  *(Not: Her bağımsız özellik/darboğaz için bu döngüyü sırayla tekrar et.)*

### Adım 6 — Kalite Kapısı Entegrasyonu (Quality Gates)
* **Aksiyon:** `quality_compiler_judge` subagent'ını tetikleyerek `project-dna.yaml` içinde tanımlanan L1-L12 kapılarını çalıştır:
  * `pnpm run type-check` (0 TS hatası)
  * `pnpm run lint` (0 ESLint hatası/uyarısı)
  * `pnpm run test -- --run` (Tüm testlerin geçmesi - baseline: 433 passed)
  * `pnpm run build` (Next.js derleme testi)

### Adım 7 — Son Doğrulama ve Karşılaştırma Raporu
* **Aksiyon:** Kodlar Vercel'e push edildikten ve CI/CD tamamlandıktan sonra Adım 1'deki Tracing işlemini tekrar et. İyileştirme öncesi ve sonrası Core Web Vitals milisaniye değerlerini (TTFB, LCP, CLS) karşılaştırmalı tablo olarak kullanıcıya sun.

---

## ⚠️ Kritik Kurallar ve Korumalar

1. **Çıplak useSearchParams Yasağı:** Performans için sayfaları bölerken/optimizasyon yaparken `useSearchParams` kullanan client bileşenlerinin `<Suspense>` bariyeri dışında kalıp kalmadığını her adımda denetle.
2. **Same-Origin Font & Asset Yüklemesi:** Performans artışı için dış kaynak CDN'lerden font/görsel çağırma. Tüm kaynaklar `public/` veya self-origin üzerinden çözülmelidir.
3. **Boş Veri & Yer Tutucu (UAT) Koruması:** Performans için yapılan dinamik/ertelenmiş (lazy) yüklemelerin ekranlarda `"--"`, `"NaN"`, `"[object Object]"` gibi hatalara yol açmadığını Playwright testleriyle teyit et.
4. **TDD Dışı Kod Değişikliği Yasağı:** Herhangi bir performans iyileştirme kodu yazılmadan önce kesinlikle o özelliğin test kodu yazılmış olmalıdır (Test-First).
5. **Project DNA Uyumu:** Bu skill ile çalışan tüm subagent'lar ilk adımda `project-dna.yaml` dosyasını okumak ve oradaki korumalı yollara (`protected_paths`) ve kritik kurallara (`critical_rules`) tam uyum sağlamak zorundadır.
