# Scripts Kullanim Kilavuzu

Bu klasordeki dosyalar, web arayuzunden bagimsiz "bakim/onarim" araclaridir.
Kisa benzetme: Site vitrindir, bu dosyalar deponun teknik servis araclari.

## 0) Yeni Klasor Duzeni

- `scripts/db/checks/`: Kontrol, teshis, raporlama
- `scripts/db/fixes/`: Duzeltme ve canli veriyi etkileyen komutlar
- `scripts/db/migrations/`: Yapisal veri/migration scriptleri
- `scripts/db/backups/`: SQL rollback/yedek dosyalari
- `scripts/generate/`: Sitemap, meta, route uretimi
- `scripts/tools/`: Tek seferlik yardimci araclar
- `scripts/archive/`: Artik aktif olmayan dosyalar

## 1) Dosya Tipleri Ne Is Yapar?

- `.py` / `.ts` / `.js`: Kontrol ve teshis scriptleri (veri okur, durum raporlar)
- `.sql`: Veritabaninda calisacak sorgu veya duzeltme komutlari
- `.ps1` / `.sh`: SQL dosyalarini uzaktaki Supabase'e gonderen otomasyon scriptleri

## 2) Risk Seviyeleri (Onemli)

- Dusuk risk (genelde okuma):
  - `scripts/db/checks/check_rls.py`
  - `scripts/db/checks/simulate_frontend.py`
  - `scripts/db/checks/check_category_id.py`
  - `scripts/db/checks/check_product_fields.py`
  - `scripts/db/checks/check_database_status.sql`
  - `scripts/db/checks/check_user_profiles_structure.sql`

- Orta risk (yanlis kullanilirsa etkileyebilir):
  - `scripts/db/checks/check_advisor.ts` (DB'ye baglanir, sadece rapor uretir)
  - `scripts/db/checks/test-categories.js` (uygulama katmanindan kategori test eder)

- Yuksek risk (canli veriyi degistirir):
  - `scripts/db/fixes/fix-stock-reduction.sql`
  - `scripts/db/fixes/fix_rls_infinite_recursion.sql`
  - `scripts/db/fixes/check_admin_status.sql` (INSERT icerir)
  - `scripts/db/fixes/fix-sql.ps1`
  - `scripts/db/fixes/run-sql-fix.ps1`
  - `scripts/db/fixes/run-sql-curl.sh`
  - `scripts/db/fixes/check_rls_policies.sql` (RLS kapatip acma adimlari var)

## 3) Hangi Durumda Hangisini Calistirayim?

- "Urunler gorunmuyor / yetki mi sorunlu?"
  - `python scripts/db/checks/check_rls.py`
  - `python scripts/db/checks/simulate_frontend.py`

- "Kategori-ID eslesmesi yanlis mi?"
  - `python scripts/db/checks/check_category_id.py`
  - `python scripts/db/checks/check_product_fields.py`

- "DB saglik kontrolu alayim"
  - `scripts/db/checks/check_database_status.sql`
  - `scripts/db/checks/check_user_profiles_structure.sql`

- "Stok dusmuyor, siparis sonrasi stok azalmiyor"
  - Once: SQL editor'de `scripts/db/fixes/fix-stock-reduction.sql` incele
  - Sonra gerekirse: `scripts/db/fixes/run-sql-fix.ps1` (yuksek risk)

## 4) Guvenli Calisma Sirasi (Onerilen)

1. Once okuma scripti calistir (teshis)
2. Sonucu not al
3. Duzeltme gerekiyorsa SQL'i once incele
4. Mumkunse staging/test ortaminda dene
5. Sonra canlida uygula
6. Uygulama sonrasi tekrar kontrol scripti calistir

## 5) Komut Ornekleri

Python scriptleri:

```bash
python scripts/db/checks/check_rls.py
python scripts/db/checks/simulate_frontend.py
python scripts/db/checks/check_category_id.py
python scripts/db/checks/check_product_fields.py
```

TypeScript/JavaScript scriptleri:

```bash
pnpm tsx scripts/db/checks/check_advisor.ts
pnpm tsx scripts/db/checks/test-categories.js
```

PowerShell fix scripti (yuksek risk):

```powershell
./scripts/db/fixes/run-sql-fix.ps1
```

## 6) Cok Onemli Uyarilar

- `SUPABASE_SERVICE_ROLE_KEY` anahtari yuksek yetkilidir, kimseyle paylasma.
- `scripts/db/fixes/check_rls_policies.sql` icindeki `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` adimlarini canlida plansiz calistirma.
- `scripts/db/fixes/check_admin_status.sql` dosyasinda e-posta bazli ekleme vardir; yanlis e-postada yetki acabilir.
- Fix scripti calistirmadan once mutlaka neyi degistirdigini oku.

## 7) Kisa Ozet (Tek Cumle)

Kontrol scriptleri "sorunu bulur", fix scriptleri "veriyi/kurali degistirir"; once kontrol, sonra fix.
