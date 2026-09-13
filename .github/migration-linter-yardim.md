En sık çıkan kalemler ve tek satırlık çareleri:

- `require-lock-timeout` / `require-statement-timeout` — dosyanın başına iki satır ekleyin:

  ```sql
  set lock_timeout = '5s';
  set statement_timeout = '5s';
  ```

  Niçin: kilit bekleyen bir `ALTER`, prod'da o tabloya gelen tüm istekleri
  süresiz durdurabilir. Zaman aşımı, "bekleyip kilitlemek" yerine "hızlı
  başarısız olmak" demektir — migration kırmızı olur ama vitrin ayakta kalır.

- `require-concurrent-index-creation` — `create index concurrently` kullanın.
  CONCURRENTLY bir işlem bloğunun **içinde** koşamaz. `supabase-migrate.yml`,
  kendi `begin;`ini yazmayan dosyaları `--single-transaction` ile sarar; bu
  yüzden dosyanız kendi `begin;` / `commit;`ini yazıp indeksi COMMIT'ten
  **sonra** oluşturmalı. Çalışan örnek:
  `supabase/migrations/20260402000000_security_and_performance_hardening.sql`
  (BEGIN@7, COMMIT@95, CREATE INDEX CONCURRENTLY@103-112).

- `adding-not-nullable-field` / `adding-field-with-default` — sütunu önce
  NULL'a izin verecek şekilde ekleyin, veriyi doldurun, sonra ayrı bir
  migration'da NOT NULL yapın. Tek adımda NOT NULL, tabloyu baştan sona
  yeniden yazar ve o süre boyunca kilitler.

- `constraint-missing-not-valid` — kısıtı `not valid` ile ekleyip ardından
  `validate constraint` çağırın; doğrulama adımı tabloyu kilitlemez.

- `syntax-error` — bu kural **kapatılamaz**. Geçersiz SQL, merge anında prod'a
  gider ve koşu kırmızı olur. Örnek: `CREATE POLICY IF NOT EXISTS` — PostgreSQL
  bu söz dizimini desteklemiyor (depoda altı dosyada 11 kez geçiyor, hiçbiri
  prod'a uygulanmamış; bkz. `docs/audits/rec315-squawk-ilk-tarama-2026-09-13.md`).

Bir kural bizim için gerçekten yanlış pozitifse: `.squawk.toml` içindeki
`excluded_rules` listesine **gerekçesiyle** eklenir. İş akışında susturulmaz —
susturulan kural, bir sonraki yazarın göremediği kuraldır.
