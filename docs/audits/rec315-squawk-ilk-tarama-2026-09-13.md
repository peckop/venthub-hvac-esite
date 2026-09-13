# REC-315 — squawk ilk tarama ve INV-MIGRATION-3 kapısı

**Tarih:** 2026-09-13 · **Şerit:** ALTYAPI · **Araç:** `squawk-cli` 2.65.0
**Kapı:** `.github/workflows/migration-linter.yml` → iş adı `INV-MIGRATION-3`
**Kural seti:** `.squawk.toml` · **Çareler:** `.github/migration-linter-yardim.md`

## KAYNAK/CETVEL

- **Kaynak:** `sbdchd/squawk` — Rust ile yazılmış Postgres migration linter'ı (Apache-2).
- **Yöneten cetveller:** `CLAUDE.md` kural 13 (migration merge = prod'a otomatik
  uygulama) · `.github/workflows/supabase-migrate.yml` (uygulama mekaniği) ·
  `INV-MIGRATION-1` (atomiklik) ve `INV-MIGRATION-2` (14 haneli damga) konformans
  kapıları · `docs/standards/denetim-izi-standard.md`.
- **Yöntem:** elle, tek dal, tek PR (iş emrindeki `YÖNTEM:` satırına uygun, sapma yok).

## 1. Niçin bu kapı var

`supabase-migrate.yml`, master'a düşen her yeni migration dosyasını **prod
veritabanına otomatik uygular**. Yani bir migration dosyasındaki kilitleyen bir
`ALTER`, geri alınamaz bir `DROP` ya da geçersiz bir söz dizimi, merge anında
canlı veritabanına gider. Bugüne kadar bu dosyaları PR anında **hiçbir kapı
içerik olarak okumuyordu**: `INV-MIGRATION-1` atomikliğe, `INV-MIGRATION-2`
dosya adındaki damgaya bakıyor. SQL'in kendisi denetimsizdi.

`INV-MIGRATION-3` o boşluğu kapatır. Kural 13'ün **yerine geçmez**: yeşil kapı
Recep'in migration onayını kaldırmaz, ona ek bir katmandır.

## 2. Ölçüm evreni ve araç kurulumu

| Kalem | Ölçüm |
|---|---|
| Depodaki migration dosyası | **235** |
| Tarandı | 235 (tamamı, bir kez) |
| Araç sürümü | `squawk-cli` **2.65.0** |
| Postgres sürümü | **17.6.1.003** (`postgres_engine` 17) |
| Telemetri izi | **0 eşleme** (`telemetry\|analytics\|sentry\|posthog\|phone-home\|mixpanel` taraması) |

⚠**İki sapma, adıyla:**

1. **Paket adı.** `npx squawk` komutu `squawk@4.0.0` adlı **alakasız** bir npm
   paketini çekmeye kalktı. Doğru paket **`squawk-cli`**. Sonraki kurucu aynı
   tuzağa düşmesin diye buraya yazıldı.
2. **Postgres sürümü.** İş emrinde "Supabase/Postgres **15** uyumlu" yazıyordu.
   Canlı projeden ölçülen sürüm **17.6.1.003**. Kural seti 17'ye göre kuruldu.
   Emir yanlış değil, bayattı; ölçüm kazandı.

## 3. İşlem varsayımı — tercih değil, ölçüm

`squawk`, `assume_in_transaction` ayarıyla "her dosya bir işleme sarılı koşacak"
varsayımını açıp kapatabiliyor. Bizim depoda **tek bir varsayım doğru değil**,
çünkü `supabase-migrate.yml` dosyanın kendi `BEGIN;`ine bakıp ikiye ayırıyor:

- dosya kendi işlemini yönetiyorsa → **olduğu gibi** koşar,
- işlem denetimi içermiyorsa → `psql --single-transaction` ile **sarılır**.

Ölçüm (`20260909071451_denetim_izi_dml_tetikleri.sql`, kendi `BEGIN`/`COMMIT`ini
yazan bir dosya):

| Varsayım | Uyarı | Bunlardan yanlış pozitif |
|---|---|---|
| `assume_in_transaction = true` | 4 | **2** (`transaction-nesting`) |
| `assume_in_transaction = false` | 2 | 0 |

Karar: **kapalı**. Açık varsayım, kendi işlemini doğru yazan dosyaları cezalandırıyor.

## 4. İlk tarama sonucu — 1189 uyarı, 180 dosya

Kapatılan üç kural düşmeden önce 1217, düştükten sonra **1189**.

### 4.1 Damga biçimine göre ayrım (asıl bulgu)

| | 14 haneli (yeni biçim) | 8 haneli (eski biçim) |
|---|---|---|
| Dosya | 50 | 130 |
| Uyarı | **210** | **979** |
| `syntax-error` | **0** | **597** |

⭐**597 sözdizimi hatasının tamamı eski biçim dosyalarda; yeni biçim dosyalarda
sıfır.** Bu temiz ayrım tesadüf değil — aşağıdaki 4.3'te sebebi var.

*(Bu sayı bir kez yanlış ölçüldü: ilk filtrem dosya adını yanlış ayırdığı için
"yeni biçimde 0 uyarı" dedi, oysa doğrusu 210. Kendi filtresine güvenmemek
gerekiyor; sayı düzeltildikten sonra yazıldı.)*

### 4.2 Kural sınıfına göre dağılım

| Uyarı | Kural | Sınıf |
|---:|---|---|
| 597 | `syntax-error` | geçersiz SQL |
| 164 | `require-lock-timeout` | prod kilidi |
| 164 | `require-statement-timeout` | prod kilidi |
| 113 | `require-concurrent-index-creation` | prod kilidi |
| 37 | `adding-foreign-key-constraint` | prod kilidi |
| 33 | `require-concurrent-index-deletion` | prod kilidi |
| 23 | `prefer-robust-stmts` | yeniden koşulabilirlik |
| 18 | `constraint-missing-not-valid` | prod kilidi |
| 11 | `ban-char-field` | şema |
| 10 | `adding-not-nullable-field` | tablo yeniden yazımı |
| 8 | `ban-drop-column` | geri alınamaz |
| 5 | `adding-field-with-default` | tablo yeniden yazımı |
| 3 | `ban-drop-not-null` | geri alınamaz |
| 2 | `prefer-text-field` | şema |
| 1 | `disallowed-unique-constraint` | prod kilidi |

### 4.3 ⭐GERÇEK KUSUR: `CREATE POLICY IF NOT EXISTS`

PostgreSQL `CREATE POLICY` için `IF NOT EXISTS` söz dizimini **desteklemiyor**.
Depoda bu geçersiz ifade **altı dosyada 11 kez** geçiyor:

```
202508261956_user_invoice_profiles.sql
20250907_admin_audit_log.sql
20250908_client_errors.sql
20250908_error_groups.sql
20250908_error_groups_policies_fix.sql
20250909_fix_product_images_rls.sql
```

Bu dosyalar prod'a **hiç uygulanmamış**. Sebebi `supabase-migrate.yml`'ın ledger
modeli: ledger boşken koşan ilk tur, o andaki tüm dosyaları "zaten uygulanmış"
kabul edip yalnızca kaydetti, çalıştırmadı. Yani hatalı SQL hiç koşmadı —
koşsaydı migration turu kırmızı olurdu.

Prod'da uygulanmış migration sayısı **112**; bu altı dosyanın hiçbiri o listede
yok. Yani **canlı bir arıza değil**, ama depoda duran ölü ve geçersiz SQL'dir.

**Eski dosyalar DEĞİŞTİRİLMEZ** (uygulanmış sayılıyorlar, ledger'da kayıtlı).
Bu kalem ayrı bir iş olarak açılmalı: ölü migration dosyalarının temizliği ya da
açıkça "uygulanmaz" işaretlenmesi. Bu işin kapsamında değil.

## 5. Kapatılan kurallar ve gerekçeleri

Bu kapının konusu **prod riski**, şema zevki değil. Üç kural gerekçesiyle kapatıldı:

| Kural | Geçmişte | Gerekçe |
|---|---:|---|
| `prefer-identity` | 2 | PK sözleşmemiz `uuid DEFAULT gen_random_uuid()`; identity sütunu kullanmıyoruz. Her yeni tabloda tetikler, kilit riski göstermez. |
| `prefer-bigint-over-int` | 24 | `int`/`smallint` sütunlarımız sayaç ve eşik alanları (stok eşiği, sıra no). `bigint`e çıkmak depolama maliyeti, güvenlik kazancı yok. |
| `prefer-bigint-over-smallint` | 2 | aynı gerekçe |

⛔**`syntax-error` kapatılmaz.** İlk taramada gerçek bir kusur buldu (bölüm 4.3).

## 6. Sabotaj kanıtı — yeşil kapı kırmızı verebiliyor mu

Yeşil bir kapı, kırmızı verebildiği gösterilmeden kapı sayılmaz. Kapının **tam
mantığı** (taban SHA → `git diff --diff-filter=AM` → `xargs squawk`) yerelde
koşuldu. Sabotaj dosyası ölçümden sonra silindi; **sabotajdan önce iş commit
edildi** (`00f5826ba`), böylece geri alma gerçek değişikliği götürmedi.

| Durum | Taranan dosya | Uyarı | Çıkış kodu | Kapı |
|---|---:|---:|---:|---|
| Sabotaj dosyası var | 1 | 5 | 123 (sıfır değil) | **KIRMIZI** |
| Sabotaj geri alındı | 0 | 0 | 0 | yeşil (ölçüldü, ihlal yok) |

Kırmızıyı üreten 5 kol, adıyla: `require-lock-timeout` (satır 2) ·
`require-statement-timeout` (satır 2) · `prefer-robust-stmts` (satır 2 ve 3) ·
`require-concurrent-index-creation` (satır 3).

### 6.1 Kol bazlı ek ölçüm

İş emri özellikle `ALTER TABLE ... ADD COLUMN ... NOT NULL` kolunu istedi. İlk
sabotajımda `DEFAULT` da verdiğim için o kol **tetiklemedi** — ve bu aracın
doğru davranışı: PostgreSQL 11'den beri `DEFAULT`lu bir `NOT NULL` sütun
eklemek tabloyu yeniden yazmıyor. Kolu ayrıca sınadım:

| Kol | Girdi | Sonuç |
|---|---|---|
| A | `add column x text not null default 'v'` | 3 uyarı, `adding-required-field` **yok** (doğru) |
| B | `add column y text not null` (DEFAULT'suz) | 4 uyarı, **`adding-required-field` VAR** |
| C | `create policy if not exists ...` | **18 `syntax-error`** |

## 7. Sürtünme — adıyla söylenir

`require-lock-timeout` ve `require-statement-timeout`, yeni biçim **50 dosyanın
50'sinde de** tetikliyor. Yani **sıradaki migration PR'ı, dosyanın başına iki
satır eklenmeden kırmızı olacak**:

```sql
set lock_timeout = '5s';
set statement_timeout = '5s';
```

Bu kasıtlı. Kilit bekleyen bir `ALTER`, prod'da o tabloya gelen tüm istekleri
süresiz durdurabilir; zaman aşımı "bekleyip kilitlemek" yerine "hızlı başarısız
olmak" demektir. Migration kırmızı olur ama vitrin ayakta kalır. Çareler
`.github/migration-linter-yardim.md` içinde, kapının kırmızı özetine basılıyor.

Bu maliyet başka şeritlerin işine de değiyor, o yüzden gizlenmiyor: kapı
inmeden önce bilinmesi gereken tek şey budur.

## 8. Bu raporun kendi sınırları

- Kapı **yalnız PR olayında** koşar. Doğrudan master'a push (kapılar buna izin
  vermiyor ama mekanik olarak mümkün) bu kapıyı atlar.
- Kapı **statiktir**: SQL'i okur, veritabanında denemez. Gerçek kilit süresi
  ölçülmez; ölçülen şey riskli ifade sınıfıdır.
- `syntax-error` kolu aracın kendi ayrıştırıcısına dayanır. Bir dosyada tek
  geçersiz ifade, ardından **yığın hata** üretiyor: 48 satırlık
  `20250908_error_groups.sql` tek başına 183 hata verdi. Yani **hata sayısı
  kusur sayısı değildir**; kusur sınıfı sayısı anlamlıdır.
- Eski dosyalar **tarandı ama düzeltilmedi**; kapı onlara bakmıyor.
