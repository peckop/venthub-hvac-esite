---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\scripts\db\migrations\update_schema_master.py
skeleton_hash: 2e5e859cfa0dcc7e
entity_hashes:
  func:main: c63b3d5c11a68220
  overview: 3f73623b21a576c5
generated_at: 2026-08-25T07:24:11Z
---

## Genel Bakış

Bu modül, veritabanı şemasını güncellemeye yönelik bir migration betiğidir. `db/migrations/` dizini altında yer alır ve tek bir giriş noktasına (`main`) sahiptir. Modül, şema güncellemesinin ana yürütme akışını başlatır.

## Fonksiyon Grupları

### Ana Yürütme
Migration sürecini başlatan ve çalıştıran tek sorumlu fonksiyondur. Modül betik olarak çağrıldığında doğrudan bu fonksiyon üzerinden işlem yürütülür.
- main

## Notlar

- Modülde yalnızca bir fonksiyon bulunduğu için fonksiyonlar arası çağrı ilişkisi bulunmamaktadır.
- Dış bağımlılıklar ve iç detaylar hakkında kaynakta yeterli bilgi yer almamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından (yalnızca `def main()` imzası mevcut), fonksiyon gövdesinden aksiyom üretilememektedir. Aksiyomlar yalnızca fonksiyon gövdelerinden türetilir.

---

## FONKSİYON DETAYLARI

### main
**Ne yapar**: Veritabanı şema belgesi olan `database_schema_master.md` dosyasını okuyarak çok kiracılı (multi-tenant) yapıya geçiş için gerekli tüm güncellemeleri otomatik olarak uygular. Frontmatter meta verilerini günceller, `tenants` tablosunu kataloğa ekler, kiracıya duyarlı tablolara `tenant_id` sütunu ekler, yeni migration dosyalarını ve PL/pgSQL fonksiyonlarını belgeye dahil eder, trigger ve indeks tanımlarını ekler ve tablo ilişki diyagramını genişletir.

**Nasıl yapar**: Fonksiyon parametre almaz ve dışarıdan yapılandırma gerektirmez. Önce `Path(__file__).resolve().parents[3]` ifadesiyle proje kök dizinini hesaplar. Ardından `docs/database_schema_master.md` dosyasını UTF-8 kodlamasıyla okur ve tüm içeriği bir string olarak belleğe alır. Sırasıyla sekiz adım uygular:

1. **Frontmatter güncelleme**: İçerikteki ilk `---` bloğunu bulur ve `compiled_at`, `tables`, `policies`, `functions`, `indexes` alanlarını içeren yeni bir YAML bloğuyla değiştirir. `compiled_at` değeri olarak `datetime.utcnow().isoformat()` kullanılarak UTC zaman damgası üretilir.

2. **Tenants tablosu ekleme**: `### user_addresses` başlığının konumunu bulur ve hemen öncesine `tenants` tablosunun Markdown tablo tanımını (id, name, subdomain, custom_domain, is_active, created_at, features, styles, config, theme_config sütunları) yerleştirir.

3. **Tenant_id sütunu ekleme**: `tenant_aware_tables` listesindeki her tablo için içerikte ilgili başlığı arar, başlığın altındaki Markdown tablo bloğunun sonunu bulur ve `tenant_id | uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES tenants(id) ON DELETE CASCADE` satırını tablonun sonuna ekler. Tablo sonu, bir sonraki `###` başlığı veya çift satır sonu (`\n\n`) ile belirlenir.

4. **Migration dosyaları ekleme**: `supabase/migrations/` dizinindeki belirtilen beş SQL dosyasını (`20260530220000_tenant_schema_setup.sql`, `20260530221000_tenant_auth_integration.sql`, `20260530222000_add_tenant_config_columns.sql`, `20260530223000_add_tenant_branding_config.sql`, `20260530224000_tenant_aware_storage_policies.sql`) okur ve her birinin başına `-- FILE: dosya_adı` yorum satırı ekleyerek birleştirir. Bu birleşik bloğu `## 3. FONKSIYONLAR (PL/pgSQL)` başlığından hemen önce yerleştirir.

5. **Yeni PL/pgSQL fonksiyonları ekleme**: Section 3 başlığından sonra mevcut ilk fonksiyon başlığından önce `jwt_tenant_id()`, `handle_new_user_metadata()` ve `handle_new_user_profile()` fonksiyon başlıklarını ekler.

6. **Trigger ekleme**: `| Trigger | Zamanlama | Event | Tablo |` başlık satırını bulur ve ayırıcı satırdan sonra `trg_handle_new_user_metadata` (before insert, auth.users) ve `trg_handle_new_user_profile` (after insert, auth.users) satırlarını ekler.

7. **İndeks ekleme**: `| Indeks | Tablo | Tip | Sutunlar |` başlık satırını bulur ve ayırıcı satırdan sonra yirmi bir adet `tenant_id` btree indeks satırını ekler (shopping_carts, cart_items, venthub_orders, venthub_order_items, venthub_returns, coupons, inventory_movements, inventory_settings, price_lists, product_prices, order_attachments, order_notes, order_refund_events, user_profiles, user_addresses, user_invoice_profiles, wizard_selections, shipping_email_events, shipping_webhook_events, returns_webhook_events, admin_audit_log tabloları için).

8. **İlişki diyagramı güncelleme**: `mermaid` kod bloğu içindeki `erDiagram` başlığını bulur ve hemen sonrasına `tenants` tablosunun yirmi bir tabloyla `||--o{` (one-to-many) ilişkisini tanımlayan Mermaid satırlarını ekler.

Son olarak güncellenmiş içeriği aynı dosyaya UTF-8 kodlamasıyla yazar ve başarılı olduğunu bildiren bir mesaj basar.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: Dönüş tipi belirtilmemiştir. Fonksiyon açık bir `return` ifadesi içermez; yan etki olarak dosya sistemindeki `database_schema_master.md` dosyasını değiştirir ve standart çıktıya mesaj basar.

---

## İTHALATLAR (IMPORTS)
- import: datetime::datetime
- import: os
- import: pathlib::Path

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/update_schema_master.py::main
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `repo_root` — `Path(__file__).resolve().parents[3]` ile hesaplanan proje kök dizini (3 üst dizin yukarı)
  - `schema_file` — `repo_root / "docs" / "database_schema_master.md"` yolu; üzerinde okuma ve yazma yapılan master şema belgesi dosyası
  - `migrations_dir` — `repo_root / "supabase" / "migrations"` yolu; okunacak SQL migration dosyalarının bulunduğu dizin
  - `f` — `open(schema_file, 'r', encoding='utf-8')` ile açılan dosya nesnesi (okuma amaçlı); `with` bloğu sonunda otomatik kapanır
  - `content` — şema dosyasının tam metin içeriği; tüm değişiklikler (frontmatter güncelleme, tablo ekleme, sütun ekleme, migration ekleme, fonksiyon ekleme, trigger ekleme, indeks ekleme, diyagram ekleme) bu string üzerinde yapılır
  - `meta_start` — `content.find("---")` ile bulunan YAML frontmatter başlangıç `---` işaretçisinin karakter indeksi
  - `meta_end` — `content.find("---", meta_start + 3)` ile bulunan YAML frontmatter bitiş `---` işaretçisinin karakter indeksi
  - `metadata` — f-string ile oluşturulan yeni YAML frontmatter bloğu; `compiled_at` (UTC ISO 8601 zaman damgası), `tables: 28`, `policies: 132`, `functions: 55`, `indexes: 47` alanlarını içerir
  - `tenants_catalog` — `tenants` tablosunun markdown katalog tanımı (sütun adları, tipleri, kısıtlamaları ile birlikte)
  - `user_addr_idx` — `content.find("### user_addresses")` ile bulunan `### user_addresses` başlığının indeksi; -1 ise başlık bulunamamış demektir
  - `tenant_aware_tables` — tenant_id sütunu eklenecek tabloların ad listesi: `admin_audit_log`, `coupons`, `inventory_movements`, `inventory_settings`, `order_attachments`, `order_notes`, `order_refund_events`, `returns_webhook_events`, `shipping_email_events`, `shipping_webhook_events`, `user_addresses`, `user_invoice_profiles`, `user_profiles`, `venthub_returns`, `wizard_selections`
  - `table` — `for table in tenant_aware_tables` döngüsünde işlenen her tablo adı
  - `header` — f-string ile oluşturulan `### {table}` formatında markdown başlık metni
  - `start_idx` — `content.find(header, start_idx)` aramasında kullanılan başlangıç indeksi; her döngüde güncellenerek aynı başlığın tekrar bulunması engellenir
  - `idx` — `content.find(header, start_idx)` sonucu; başlığın content içinde bulunduğu indeks, -1 ise bulunamamış
  - `tbl_start` — `content.find("|-------|-----|", idx)` ile bulunan markdown tablo ayırıcı satırının indeksi
  - `next_header` — `content.find("\n###", tbl_start)` ile bulunan bir sonraki `###` başlığının indeksi
  - `next_double_nl` — `content.find("\n\n", tbl_start)` ile bulunan bir sonraki çift satır sonunun indeksi
  - `tbl_end` — `next_header` ve `next_double_nl` değerlerinin `min()` ile alınan minimumu; tablonun son pozisyonu
  - `col_row` — tablo sonuna eklenen `tenant_id` sütun satırı: `| tenant_id | uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES tenants(id) ON DELETE CASCADE |`
  - `migration_files` — eklenecek migration dosya adlarının listesi: `20260530220000_tenant_schema_setup.sql`, `20260530221000_tenant_auth_integration.sql`, `20260530222000_add_tenant_config_columns.sql`, `20260530223000_add_tenant_branding_config.sql`, `20260530224000_tenant_aware_storage_policies.sql`
  - `migration_blocks` — okunan migration dosya içeriklerinin saklandığı liste
  - `mf` — `for mf in migration_files` döngüsünde işlenen her migration dosya adı
  - `filepath` — `migrations_dir / mf` ile oluşturulan her migration dosyasının tam yolu
  - `mf_file` — `open(filepath, 'r', encoding='utf-8')` ile açılan migration dosyası nesnesi (okuma amaçlı)
  - `m_content` — her migration dosyasının okunan tam metin içeriği
  - `block` — f-string ile oluşturulan `-- FILE: {mf}\n{m_content}` formatında SQL bloğu
  - `migrations_combined` — `"\n".join(migration_blocks) + "\n\n"` ile birleştirilmiş tüm migration blokları
  - `sec3_header` — `"## 3. FONKSIYONLAR (PL/pgSQL)"` sabit string; section 3 başlık metni
  - `sec3_idx` — `content.find(sec3_header)` ile bulunan section 3 başlığının indeksi
  - `new_functions` — eklenecek yeni PL/pgSQL fonksiyon başlık tanımları: `jwt_tenant_id() → uuid`, `handle_new_user_metadata() → trigger`, `handle_new_user_profile() → trigger`
  - `first_func_header` — `"\n### \x60"` arama deseni; section 3 altındaki ilk fonksiyon başlığını bulmak için kullanılır
  - `first_func_idx` — `content.find(first_func_header, sec3_idx)` ile bulunan ilk fonksiyon başlığının indeksi
  - `trigger_table_header` — `"| Trigger | Zamanlama | Event | Tablo |"` sabit string; trigger tablosu başlık satırı
  - `trg_table_idx` — `content.find(trigger_table_header)` ile bulunan trigger tablosu başlığının indeksi
  - `sep_idx` — `content.find("\n", trg_table_idx)` ile bulunan trigger tablosu başlığından sonraki ilk satır sonu
  - `sep_end_idx` — `content.find("\n", sep_idx + 1)` ile bulunan ayırıcı satırdan sonraki satır sonu
  - `new_triggers` — eklenecek trigger satırları: `trg_handle_new_user_metadata` (before insert auth.users) ve `trg_handle_new_user_profile` (after insert auth.users)
  - `index_table_header` — `"| Indeks | Tablo | Tip | Sutunlar |"` sabit string; indeks tablosu başlık satırı
  - `idx_table_idx` — `content.find(index_table_header)` ile bulunan indeks tablosu başlığının indeksi
  - `sep_idx` — `content.find("\n", idx_table_idx)` ile bulunan indeks tablosu başlığından sonraki ilk satır sonu (trigger bölümündeki ile aynı ad, farklı kapsam)
  - `sep_end_idx` — `content.find("\n", sep_idx + 1)` ile bulunan ayırıcı satırdan sonraki satır sonu (trigger bölümündeki ile aynı ad, farklı kapsam)
  - `new_indexes` — eklenecek 21 adet btree indeks satırı; her biri `tenant_id` sütunu üzerinde, ilgili tablo için
  - `mermaid_start` — `content.find("```mermaid\nerDiagram")` ile bulunan mermaid diyagram bloğunun başlangıç indeksi
  - `insert_pos` — `content.find("\n", mermaid_start + len("```mermaid\nerDiagram"))` ile bulunan mermaid başlığından sonraki satır sonu
  - `relations` — eklenecek 21 adet `tenants ||--o{ ... : references` ilişki tanımları (mermaid diyagramı için)
  - `f` — `open(schema_file, 'w', encoding='utf-8')` ile açılan dosya nesnesi (yazma amaçlı); `with` bloğu sonunda otomatik kapanır
- **Dönüş**: yok (None). Fonksiyon sonunda `print("Successfully updated database schema master document!")` ile başarı mesajı basar. Yan etkisi: `schema_file` dosyasını yerinde (in-place) günceller.

---

## NODE ID STANDARD

  file: update_schema_master.py
  function: update_schema_master.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main