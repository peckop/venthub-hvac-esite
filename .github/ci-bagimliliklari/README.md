# CI yardımcı bağımlılıkları (kilitli)

Tam `pnpm install` gerektirmeyen CI işleri (ör. `db-advisor.yml` içindeki katalog bütünlüğü ve RLS kapıları)
yalnız bir iki pakete ihtiyaç duyar. Bu paketler burada **sürümü sabit ve kilit dosyalı** tutulur ve
`kur.sh` ile kök `package.json`'dan **bağımsız** kurulur.

**Niçin (2026-09-23):** kök dizinde `npm install --no-save pg@8` koşmak, npm'in kök `package.json`'daki
**bütün** bağımlılıkları kilitsiz (en yeni) çözmesine yol açıyordu. Depo pnpm ile kilitli; npm o kilidi
okumaz. `@supabase/supabase-js` 2.117.1 yayınlandıktan iki dakika sonra bağımlılığı henüz npm'de yoktu
(ETARGET) ve kapı veriyle ilgisi olmayan bir sebeple kırmızı verdi.

| Dizin | İçerik | Kullanan |
|---|---|---|
| `pg-surucu/` | `pg` 8.23.0 + 13 alt paket (kilitli) | `db-advisor.yml` → catalog-integrity, rls-role-coverage |
| `squawk/` | `squawk-cli` 2.65.0 + platform ikilisi (kilitli) | `migration-linter.yml` → INV-MIGRATION-3 |

**Yükseltme:** dizinde `package.json`'daki sürümü değiştir, aynı dizinde
`npm install --package-lock-only --ignore-scripts` koş, iki dosyayı birlikte commit'le.
Kilit dosyası olmadan `kur.sh` çalışmaz (bilerek).
