---
name: venthub-pdf-ingestor
description: Ingests, aligns, and validates HVAC catalog PDFs using a 3-stage multimodal pipeline or a Visual Multi-Agent Team.
when_to_use: >
  Kullan: 'ingest a PDF catalog', 'run validation on HVAC catalog', 'process Vortice catalogs', 'run visual multi-agent team', 'run Jidoka report'.
allowed-tools:
  - run_command
  - view_file
  - write_to_file
  - replace_file_content
---

# VentHub PDF Ingestor & Visual Multi-Agent Team

Bu yetenek (skill), VentHub projesindeki HVAC katalog PDF'lerinin otonom olarak işlenmesi, veritabanına aktarılması ve Jidoka kalite kontrol süreçlerinin yönetilmesi için iki farklı yöntem sunar:
1. **Klasik 3-Aşamalı AST Pipeline (Dış API ile):** Hızlı ve otomatik seri işleme.
2. **Görsel Çoklu Ajan Takımı (Visual Multi-Agent Team):** Zor, birim kayması riski yüksek veya karmaşık PDF katalogları için %100 görsel doğruluk sağlayan otonom işbirlikçi ekip.

---

## YÖNTEM 1 — Klasik 3-Aşamalı AST Pipeline

### 1. Simülasyon (Dry-Run) Modunda Çalıştırma
Herhangi bir veriyi veritabanına yazmadan önce verinin kalitesini ve şema uyumluluğunu test etmek için pipeline'ı `--dry-run` modunda çalıştırın.

```powershell
.venv\Scripts\python.exe scripts/ingest_single.py "$pdf_path" --category-slug "$category_slug" --dry-run
```

### 2. Jidoka Raporunun Analizi
İşlem tamamlandıktan sonra üretilen `output/jidoka_report.json` dosyasını inceleyin:
- **`header_unmapped`** varsa: Yeni bir sütun başlığı çıkmıştır, `src/schema_mapper.py`'ye ekleyin ve `pytest` çalıştırın.
- **`parser_failure`** varsa: Sayfanın tablosu lokal parser tarafından okunamamıştır. Multimodal self-healing'in devrede olduğunu ve `mimo-v2.5` API'sinin veriyi başarıyla kurtarıp kurtarmadığını kontrol edin.

---

## YÖNTEM 2 — Görsel Çoklu Ajan Takımı Protokolü (Visual Multi-Agent Team)

Eğer klasik yöntem karmaşık tablolarda birim kayması (örneğin güç değerini debiye yazma) veya mükerrer kayıt yapıyorsa bu protokolü başlatın.

### Ajan Rolleri ve Tanımları

Ana Ajan (Proje Şefi), bu oturumda veya yeni oturumlarda aşağıdaki 4 alt ajanı tanımlamalıdır:

#### 1. `visual-page-worker`
* **Görevi:** Tek bir sayfa görüntüsünden (PNG) sadece `view_file` aracıyla (dış API çağırmadan) teknik verileri okur.
* **Sistem Promptu:**
  ```text
  You are visual-page-worker. Your job is to extract technical specifications directly from a single page PNG.
  Open the page PNG with view_file. Inspect it visually. If it contains tables, specs, or product model codes, extract them.
  Align specs to: model_code, brand, and technical_specs (voltage_v, frequency_hz, max_absorbed_power_max_speed_w, absorbed_current_max_a, weight_kg, airflow_speed_max_ms, airflow_speed_min_ms, number_of_speeds, max_delivery_max_speed_m3h, sound_pressure_level_lp_db_a_2m_max, sound_pressure_level_lp_db_a_2m_min, rpm_max, rpm_min, size_a_mm, size_b_mm, size_c_mm, insulation_class, etc.). If a field is missing, use null.
  Write a JSON list of products extracted to output/scratch_multiagent/page_<num>_extracted.json. If no products, write [].
  ```

#### 2. `board-aggregator`
* **Görevi:** Sayfa işçilerinin çıktılarını birleştirir, ticari isimlerle kodları eşleştirip mükerrerliği önler ve fiziksel ölçekleme/ilişki analizi yapar.
* **Sistem Promptu:**
  ```text
  You are board-aggregator. Read the individual page JSON files from output/scratch_multiagent/page_*_extracted.json.
  Aggregate them into a single "Common Board" Markdown document (output/scratch_multiagent/common_board.md).
  Build connections and engineering mappings (e.g. standard vs heated models, physical size differences, phase current draw trade-offs).
  ```

#### 3. `consolidator-checker`
* **Görevi:** Ortak tahtadaki verileri Pydantic şemasıyla doğrular, son kalite kontrolünü yapıp nihai JSON dosyasını üretir.
* **Sistem Promptu:**
  ```text
  You are consolidator-checker. Read output/scratch_multiagent/common_board.md.
  Perform a final quality check against the Pydantic schema (BaseSpecs, subclass specs).
  Write the validated JSON list of ProductRecord objects to output/scratch_multiagent/final_visual_extraction.json.
  ```

#### 4. `extraction-comparator`
* **Görevi:** Görsel ajan ekibinin nihai çıktısı ile klasik AST boru hattının çıktısını karşılaştırıp kalite ve doğruluk raporu yazar.
* **Sistem Promptu:**
  ```text
  You are extraction-comparator. Compare output/scratch_multiagent/final_visual_extraction.json with the baseline output.
  Analyze success rate, data completeness (null counts), accuracy, translation quality, and token cost.
  Write a comparative report in Markdown to output/scratch_multiagent/comparison_report.md.
  ```

### Takım Koordinasyon Sırası
1. **Adım 1:** PDF sayfalarını PNG'ye dönüştürün (`scripts/ingest_single.py` ilk adımı otomatik yapar).
2. **Adım 2:** Her sayfa için bir `visual-page-worker` çağırıp paralel olarak diske yazdırın.
3. **Adım 3:** Sayfalar bitince `board-aggregator` çağırıp `common_board.md` belgesini hazırlatın.
4. **Adım 4:** `consolidator-checker` çağırıp `final_visual_extraction.json` dosyasını doğrulatarak yazdırın.
5. **Adım 5:** `extraction-comparator` çağırıp iki yöntemin kıyaslama raporunu oluşturun.

---

## Genel Kurallar ve Kısıtlar
- ❌ `.env` dosyasına ve gizli anahtarlara doğrudan dokunmayın.
- ❌ Hata durumunda hemen durmayın; Jidoka loglarını kontrol edin, self-healing aşamalarını inceleyin.
- ⚠️ Caching sistemini bypass etmek gerekirse `--force` flag'ini kullanın.
