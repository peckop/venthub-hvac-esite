---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\migrations\nlm_selective_upload.py
skeleton_hash: dbeebb3fcf77a5f3
entity_hashes:
  func:main: 11982e133b0cba8a
  overview: 10996723820bc53c
generated_at: 2026-05-30T21:41:42Z
---

## Genel Bakış

Bu modül, NLM verilerinin seçici olarak yüklenmesini sağlayan bağımsız bir migrasyon betiğidir. Tek bir ana fonksiyon ile çalışarak belirli NLM kayıtlarının veritabanına aktarım işlemini yönetir.

## Fonksiyon Grupları

### Ana Yürütme
Betik tek bir giriş noktasından çalıştırılır ve seçici yükleme işlemini başlatarak tamamlar.
- main

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### main
**Ne yapar**: Bu fonksiyon, belirlenmiş bir NLM (NotebookLM) defterine seçilmiş doküman dosyalarını toplu olarak yükler. Proje kök dizininden itibaren hardcoded olarak tanımlanmış yedi adet doküman dosyasını (Markdown ve metin dosyaları) sırasıyla bulut ortamındaki belirtilen deftere aktarır.

**Nasıl yapar**: Fonksiyon首先 `Path(__file__).resolve().parents[3]` kullanarak betiğin bulunduğu konumdan üç üst dizine çıkarak proje kök dizinini hesaplar. Ardından yükenecek dosyaların listesini ve hedef defterin UUID'sini tanımlar. Her dosya için önce varlık kontrolü yapar; dosya mevcut değilse atlar. Dosya mevcutsa, `subprocess.run` aracılığıyla `nlm source add` komutunu `--wait` parametresiyle senkron olarak çalıştırır ve her işlem sonucunu (başarı/hata) konsola yazdırır.

**Parametreler**:
- Bu fonksiyon parametre almamaktadır.

**Dönüş**: Fonksiyon herhangi bir değer döndürmez (None/void). Tüm durum bilgileri `print()` aracılığıyla standart çıktıya yazdırılır.

**Ek Notlar**:
- `notebook_id` sabit bir UUID olarak kod içinde tanımlıdır: `235043eb-970f-4a52-9f39-1d02b2621e9c`
- Yüklenen dosyalar şunlardır:
  - `docs/database_schema_master.md` — Database Schema Master
  - `docs/supabase_functions_master.md` — Supabase Functions Master
  - `docs/system_tree.md` — System Tree (Proje Yapisi)
  - `docs/venthub_hvac_master.md` — VentHub HVAC Master
  - `README.md` — README.md
  - `CHANGELOG.md` — CHANGELOG.md
  - `CONTEXT.md` — CONTEXT.md (SaaS Güncel)
- `--wait` parametresi, yükleme işleminin tamamlanmasını bekleyerek senkron çalışmayı sağlar.
- Hata durumunda `result.stderr` öncelikli olarak, eğer boşsa `result.stdout` hata mesajı olarak yazdırılır.
- İşlem dizini (`cwd`) olarak proje kök dizini kullanılır, böylece göreli dosya yolları doğru çözümlenir.

---

## NODE ID STANDARD

  file: scripts\db\migrations\nlm_selective_upload.py
  function: scripts\db\migrations\nlm_selective_upload.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main