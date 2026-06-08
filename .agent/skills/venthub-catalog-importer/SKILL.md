---
name: venthub-catalog-importer
description: Ingests and validates HVAC catalog PDFs. Trigger for importing catalogs
  (katalog oku), scanning PDFs (pdf scan), and HVAC catalog imports. Do NOT use for
  running unit tests, creating git branches, or database resets.
when_to_use: 'Kullan: ''ingest a PDF catalog'', ''process Vortice catalogs'', ''run
  visual multi-agent team'', ''extract specifications from PDF''.

  '
allowed-tools:
- run_command
- view_file
- write_to_file
- replace_file_content
category: audit
metadata:
  triggers:
  - katalog oku
  - pdf scan
  - hvac catalog import
  inputs:
  - catalog pdf files
  outputs:
  - validated catalog data JSON
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# VentHub Otonom PDF Görsel Ajan Hattı (Visual Multi-Agent Ingestion Pipeline)

Bu yetenek (skill), VentHub projesindeki HVAC katalog PDF'lerinin otonom olarak işlenmesi, veritabanına aktarılması ve doğrulanması sürecini yönetir. Tablolardaki birim kaymalarını ve veri kayıplarını sıfıra indirmek için **%100 Görsel Doğruluk (Vision-LLM)** tabanlı çoklu ajan iş akışını kullanır.

---

## 🏛️ Ajan Rolleri ve Sistem Promptları

Ana Ajan (Proje Şefi), PDF işleme sürecini başlatırken sırasıyla şu alt ajanları tanımlamalı ve görevlendirmelidir:

### 1. `pdf-triage-scanner` (Keşif Ajanı)
*   **Görevi:** PDF'in tüm sayfa metinlerini veya genel yapısını tarayarak ürün teknik veri tablosu barındıran sayfa numaralarını belirler.
*   **Sorgu Metodu:** PDF metnini tek bir LLM çağrısına gönderir ve tablo içeren sayfaları JSON listesi olarak döner (Örn: `[25, 26]`).

### 2. `spec-page-worker` (Sayfa Görsel İşçisi)
*   **Görevi:** Kendisine atanan sayfa görüntüsünü (PNG) görsel olarak (`view_file` ile) inceleyerek verileri çıkarır.
*   **Sistem Promptu:**
    ```text
    You are spec-page-worker. Your job is to extract technical specifications directly from a single page PNG.
    Open the page PNG with view_file. Inspect it visually. If it contains tables, specs, or product model codes, extract them.
    Align specs to: model_code, brand, and technical_specs (voltage_v, frequency_hz, max_absorbed_power_max_speed_w, absorbed_current_max_a, weight_kg, airflow_speed_max_ms, airflow_speed_min_ms, number_of_speeds, max_delivery_max_speed_m3h, sound_pressure_level_lp_db_a_2m_max, sound_pressure_level_lp_db_a_2m_min, rpm_max, rpm_min, size_a_mm, size_b_mm, size_c_mm, insulation_class, etc.). If a field is missing, use null.
    Write a JSON list of products extracted to output/scratch_multiagent/page_<num>_extracted.json. If no products, write [].
    ```

### 3. `spec-board-aggregator` (Karar Tahtası Birleştirici)
*   **Görevi:** Sayfa işçilerinin çıkardığı parçalı JSON'ları bir araya getirir, model adları ile kodları eşleştirip mükerrerliği önler ve montaj ilişkilerini tanımlar.
*   **Sistem Promptu:**
    ```text
    You are spec-board-aggregator. Read the individual page JSON files from output/scratch_multiagent/page_*_extracted.json.
    Aggregate them into a single "Common Board" Markdown document (output/scratch_multiagent/common_board.md).
    Build connections and engineering mappings (e.g. standard vs heated models, physical size differences, phase current draw trade-offs, kit mappings).
    ```

### 4. `spec-consolidator-checker` (Şema Doğrulayıcı & Yazıcı)
*   **Görevi:** Ortak tahtadaki verileri Zod/Pydantic şemasına göre doğrular, Türkçe açıklamalar ve SEO başlıkları ekleyerek final JSON dosyasını oluşturur.
*   **Sistem Promptu:**
    ```text
    You are spec-consolidator-checker. Read output/scratch_multiagent/common_board.md.
    Perform a final quality check against the product schema fields.
    Write the validated JSON list of ProductRecord objects to output/scratch_multiagent/final_visual_extraction.json.
    ```

---

## 🔄 Takım Koordinasyon ve İşleme Adımları

1.  **PDF -> PNG Dönüşümü:** PDF sayfalarını yüksek çözünürlüklü PNG resimlerine dönüştürün (Bu görseller sayfa işçileri tarafından `view_file` ile okunacaktır).
2.  **Keşif (Triage):** `pdf-triage-scanner` ajanını çalıştırarak sadece teknik veri tablosu barındıran sayfa numaralarını dinamik olarak belirleyin (Örn: `[25, 26]`).
3.  **Sayfa İşleme:** Yalnızca tespit edilen hedef sayfalar için paralel olarak birer `spec-page-worker` subagent'ı spawn edin. İşçiler sonuçları `page_<num>_extracted.json` olarak diske kaydeder.
4.  **Hizalama ve Birleştirme:** `spec-board-aggregator` ajanını çalıştırarak verileri `common_board.md` adı altında birleştirin. Bu aşamada güç tüketimi ve RPM gibi birim çakışmalarını çözün.
5.  **Şema ve SEO Kontrolü:** `spec-consolidator-checker` ajanını çalıştırıp şemaya tam uyumlu `final_visual_extraction.json` dosyasını oluşturun. Türkçe açıklama ve meta etiketlerini ekleyin.
6.  **Veritabanı Enjeksiyonu:** Doğrulanmış final JSON çıktısını doğrudan Supabase veritabanına upsert edin:
    ```powershell
    .venv\Scripts\python.exe scripts/db_write_visual_extraction.py
    ```

---

## ⚠️ Kritik Kurallar ve Kısıtlar
*   ❌ Görsel okuma yapmadan, sadece OCR veya metin okuyarak veri çıkarmayın. Tablo başlık kaymalarını engellemek için görsel doğrulama (view_file) zorunludur.
*   ❌ Veritabanında mükerrer kayıt oluşturulmasını engelleyin. Kod (SKU) ve ticari model adını doğru şekilde eşleştirin.
*   ⚠️ Eksik veya şüpheli değerler için hayali veri üretmeyin, o alanları `null` bırakın.
