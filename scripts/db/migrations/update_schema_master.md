---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\migrations\update_schema_master.py
skeleton_hash: 53b5765ecb57149b
entity_hashes:
  func:main: 3686a8ca288867dc
  overview: 3f73623b21a576c5
generated_at: 2026-05-30T21:22:42Z
---

## Genel Bakış

Bu modül, veritabanı şeması güncellemelerini yönetmek amacıyla tasarlanmış tek fonksiyonlu bir migration scriptidir. Veritabanı yapısında yapılacak değişiklikleri merkezi bir noktadan yürütür.

## Fonksiyon Grupları

### Veritabanı Şeması Güncelleme
Veritabanı tabloları, alanları ve ilişkileri üzerindeki yapısal değişiklikleri tanımlar ve uygular.
- main

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Açıklama:** Verilen `main()` fonksiyonu, imzasında herhangi bir parametre almamakta ve fonksiyon gövdesinde (bu gövde verilmemiş olup sadece imza bilgisi mevcuttur) tanımlı herhangi bir koşul, bağımlılık veya iş kuralı belirtilmemiştir. Fonksiyon imzasında default değer yoktur ve modül sabitleri listesi boştur. Bu nedenle, modülün doğru çalışması için var olması gereken veya ihlal edilmesi durumunda hata oluşacak olan herhangi bir mimari varsayım (aksiyom) üretilememiştir. Fonksiyonun gerçek gövdesi bilinmediğinden, عملیات mantığına dair çıkarım yapılamaz.

---

## FONKSİYON DETAYLARI

### main
**Ne yapar**: Veritabanı şeması belgesini (database_schema_master.md) multi-tenant yapıya uygun şekilde otomatik olarak günceller. Bu fonksiyon, belgedeki tablo tanımlarını, indeksleri, trigger'ları, fonksiyonları ve diyagram ilişkilerini yeni tenant yapısına göre düzenler.

**Nasıl yapar**: Fonksiyon, proje kök dizinini `Path(__file__)` referansıyla hesaplar ve şema dosyasını okur. Ardından 8 aşamalı bir güncelleme süreci uygular:
1. Frontmatter metadata bloğunu güncel derleme zamanı ve istatistiklerle yeniler
2. `tenants` tablo tanımını kataloğa `user_addresses` öncesine ekler
3. 15 farklı tenant-aware tabloya `tenant_id` foreign key sütunu ekler
4. 5 adet migration dosyasını birleştirerek belgeye dahil eder
5. Yeni PL/pgSQL fonksiyon tanımlarını ekler
6. Trigger kayıtlarını tetikleme tablosuna ekler
7. Tenant_id indekslerini indeks tablosuna ekler
8. Mermaid diyagramına tenant ilişkilerini ekler

**Parametreler**:
- Parametre yoktur

**Dönüş**: Dönüş değeri yoktur (void). İşlem sonunda `print()` ile başarı mesajı yazdırır ve güncellenmiş markdown dosyasını disk kaydeder.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/update_schema_master.py::main
- **params**: (yok)
- **ic_degiskenler**:
  - `repo_root` — Projenin kök dizinini Path nesnesi olarak belirler. __file__'ın 3 üst dizinine giderek bulunur.
  - `schema_file` — Güncellenecek master veritabanı şema dosyasının tam yolu (Path nesnesi).
  - `migrations_dir` — SQL migration dosyalarının bulunduğu dizin (Path nesnesi).
  - `content` — schema_file dosyasının tüm içeriğini okuyan string. Üzerinde değişiklikler yapılarak güncellenir.
  - `meta_start` — content içindeki ilk "---" dizesinin başlangıç indeksi.
  - `meta_end` — content içindeki ikinci "---" dizesinin başlangıç indeksi.
  - `metadata` — Yeni frontmatter metadata bloğu olarak kullanılacak formatlanmış string.
  - `tenants_catalog` — Tenants tablosu katalog girişi olarak eklenecek markdown formatında string.
  - `user_addr_idx` — content içinde "### user_addresses" dizesinin indeksi.
  - `tenant_aware_tables` — Tenant_id sütunu eklenmesi gereken tabloların listesi.
  - `header` — Her tablo araması için formatlanmış "### {tablo_adi}" stringi.
  - `start_idx` — While döngüsünde bir sonraki arama başlangıç indeksi.
  - `idx` — Mevcut header dizesinin content içindeki indeksi.
  - `tbl_start` — Tablo bloğunun separator satırının (|-------|-----|) indeksi.
  - `next_header` — Mevcut tablonun bitiminden sonraki tablo header'ının indeksi.
  - `next_double_nl` — Mevcut tablonun bitiminden sonraki çift newline'ın indeksi.
  - `tbl_end` — Tablo bloğunun bitiş indeksi (next_header ve next_double_nl'nin minimumu).
  - `col_row` — Tenant_id sütunu olarak eklenecek markdown satırı.
  - `migration_files` — Birleştirilecek migration SQL dosya isimlerinin listesi.
  - `migration_blocks` — Her migration dosyasının içeriğini tutan blok listesi.
  - `mf` — Döngüdeki mevcut migration dosya ismi.
  - `filepath` — Mevcut migration dosyasının tam yolu (Path nesnesi).
  - `mf_file` — Mevcut migration dosyasının open() ile açılmış dosya nesnesi.
  - `m_content` — Mevcut migration dosyasının tüm içeriği.
  - `block` — Tek bir migration dosyasının formatlanmış markdown bloğu.
  - `migrations_combined` — Tüm migration bloklarının birleştirilmiş hali.
  - `sec3_header` — "## 3. FONKSIYONLAR (PL/pgSQL)" stringinin aranması.
  - `sec3_idx` — sec3_header dizesinin content içindeki indeksi.
  - `new_functions` — Bölüm 3'e eklenecek yeni fonksiyon tanımları.
  - `first_func_header` — Yeni fonksiyonların ekleneceği mevcut ilk fonksiyon header'ı.
  - `first_func_idx` — first_func_header'ın content içindeki indeksi.
  - `trigger_table_header` — Trigger tablosu header satırı stringi.
  - `trg_table_idx` — trigger_table_header'ın content içindeki indeksi.
  - `sep_idx` — Trigger tablosu separator satırının bitim indeksi.
  - `sep_end_idx` — Trigger tablosu separator satırından sonraki satırın başlangıç indeksi.
  - `new_triggers` — Eklenecek yeni trigger satırları.
  - `index_table_header` — İndeks tablosu header satırı stringi.
  - `idx_table_idx` — index_table_header'ın content içindeki indeksi.
  - `sep_idx` (tekrar) — İndeks tablosu separator satırının bitim indeksi.
  - `sep_end_idx` (tekrar) — İndeks tablosu separator satırından sonraki satırın başlangıç indeksi.
  - `new_indexes` — Eklenecek yeni indeks satırları.
  - `mermaid_start` — Mermaid diyagramının başlangıç indeksi (``mermaid\nerDiagram").
  - `insert_pos` — Mermaid diyagramının header satırından sonraki pozisyon indeksi.
  - `relations` — Mermaid diyagramına eklenecek tablo ilişkileri.
- **Dönüş**: yok (yan etki: schema_file dosyasını günceller ve konsola başarı mesajı basar)

---

## NODE ID STANDARD

  file: scripts\db\migrations\update_schema_master.py
  function: scripts\db\migrations\update_schema_master.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main