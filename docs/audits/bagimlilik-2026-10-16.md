# Bağımlılık güvenlik taraması — 2026-10-16 · **yüksek kayıt 1 → 1, orta 1 → 8**

**Şerit:** ALTYAPI · **Kart:** ALT-95 (OPS-168 c, 10-16; OPS hükmü: yama/küçük sürümle kapananlar yükseltilir, kapanmayanlar gerekçe ve son tarihle kayda girer) · **Cetvel:** `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md`
**Önceki ölçüm:** `bagimlilik-2026-10-05.md` (1 yüksek, 1 orta). Kabul listesi: `bagimlilik-kararlari.md` §7 (yüksek/kritik) ve §7a (orta).

## 1 · SAYILAR (üretim ağacı, `pnpm audit --prod --json`; ölçüm 2026-10-16)

| Ölçüt | Değer | 10-05 ölçümü |
|---|---:|---:|
| Yüksek önemde güvenlik kaydı (prod) | **1** | 1 |
| Orta (paket satırı; 3 ayrı kimlik) | 8 | 1 |
| Düşük | 0 | 0 |
| Kritik | **0** | 0 |

> ⛔**İLK SATIRIN YAZILIŞI BİR SÖZLEŞMEDİR** (`defter-tazelik-satiri.cjs` sayıyı bu tablodan okur).

Kapı sınaması (aynı ölçümün kayıtlı çıktısıyla, `node scripts/hijyen/bagimlilik-denetimi.cjs --json <çıktı>`): **çıkış 0, TEMİZ** (yüksek/kritik 1, kabul 1, yeni 0, bayat 0). Haftalık kapı yalnız yüksek/kritik kayıtları sayar; orta kayıtlar kapıyı kırmızıya çevirmez, bu yüzden 19 Ekim koşusu bu kayıtlar yüzünden kırmızı vermez.

## 2 · KALAN KAYITLAR

| GHSA | paket (kilitli sürüm) | önem | düzeltme sürümü | yol | çalışma zamanı | karar |
|---|---|---|---|---|---|---|
| `GHSA-vfj7-8cjw-p6xm` | braces 3.0.3 | yüksek | YOK (≤3.0.3 son sürüm) | `@sentry/webpack-plugin` → `unplugin` → `chokidar`; `tailwindcss` → `fast-glob`/`micromatch` | yalnız derleme | **§7 kabul** (ALT-32, 10-05), değişmedi |
| `GHSA-8988-4f7v-96qf` | @opentelemetry/core 1.30.1 | orta | ≥2.8.0 (ana sürüm 1→2) | `@sentry/nextjs` 8.55.2 → `@sentry/node` → `@opentelemetry/core` | çalışma zamanı (Sentry sunucu tarafı) | **§7a kabul** |
| `GHSA-qqmp-wf37-98f9` | @opentelemetry/instrumentation-pg 0.50.0 | orta | ≥0.73.0 | `@sentry/node` 8.55.2 | çalışma zamanı | **§7a kabul** |
| `GHSA-qqmp-wf37-98f9` | @opentelemetry/instrumentation-mysql2 0.45.0 | orta | ≥0.67.0 | `@sentry/node` 8.55.2 | çalışma zamanı | **§7a kabul** |
| `GHSA-qqmp-wf37-98f9` | @opentelemetry/instrumentation-mysql 0.45.0 | orta | ≥0.67.0 | `@sentry/node` 8.55.2 | çalışma zamanı | **§7a kabul** |
| `GHSA-qqmp-wf37-98f9` | @opentelemetry/instrumentation-mongoose 0.46.0 | orta | ≥0.67.0 | `@sentry/node` 8.55.2 | çalışma zamanı | **§7a kabul** |
| `GHSA-qqmp-wf37-98f9` | @opentelemetry/instrumentation-knex 0.44.0 | orta | ≥0.65.0 | `@sentry/node` 8.55.2 | çalışma zamanı | **§7a kabul** |
| `GHSA-qqmp-wf37-98f9` | @opentelemetry/instrumentation-tedious 0.18.0 | orta | ≥0.40.0 | `@sentry/node` 8.55.2 | çalışma zamanı | **§7a kabul** |
| `GHSA-rj75-hqrm-r3gf` | postcss-selector-parser 6.1.4 | orta | ≥7.1.6 (ana sürüm 6→7) | `tailwindcss` 3.4 → `postcss-nested` 6.2.0 → `postcss-selector-parser` 6.1.4 | yalnız derleme (CSS derleyicisi) | **§7a kabul** |

## 3 · BU TURDA KAPANANLAR

Yok. Sekiz orta kaydın sekizi de yama ya da küçük sürümle kapanmıyor:

| Grup | Düzeltme | Neden küçük sürümle kapanmıyor |
|---|---|---|
| `@opentelemetry/core` | 1.30.1 → ≥2.8.0 | Ana sürüm atlaması. `@sentry/node` 8.55.2 `@opentelemetry/core: ^1.30.1` ister ve `@sentry/opentelemetry` 8.55.2'nin eş bağımlılığı da `^1.30.1` (`pnpm view`, kilit dosyası); cetvel §4: override ana sürüm atlatamaz. |
| `@opentelemetry/instrumentation-*` (6 paket) | 0.44–0.50 → 0.65–0.73 | `@sentry/node` 8.55.2 bu altı paketi TAM SÜRÜM sabitler (`0.50.0`, `0.45.0` vb.); düzeltilmiş hat (`instrumentation-pg@0.73.0`, `pnpm view`, 16 Ekim) `@opentelemetry/core ^2.9.0` ve `@opentelemetry/instrumentation ^0.221.0` ister, yani çekirdeğin 2.x hattı gerekir ve Sentry 8'in 1.x sözleşmesiyle çakışır. 0.x'te her küçük sürüm kırıcı olabilir (23 küçük sürüm); override Sentry'nin çalışma zamanı izlemesini riske atar. |
| `postcss-selector-parser` | 6.1.4 → ≥7.1.6 | Ana sürüm atlaması; tüketici `postcss-nested` (tailwindcss 3.4 zinciri) 6.x hattını kullanır. Tailwind 4 göçü ayrı iştir. |

Üçünün de tek kaldırma yolu aynı: `@sentry/nextjs` 10.x (Recep'in sıralaması: Sentry kuyruğun sonunda, karar 17) ve Tailwind 4. Kilit dosyası bu turda DEĞİŞMEDİ; `pnpm install` gerekmedi.

## 4 · ÖLÇÜM NOTU

- Ham çıktı: `pnpm audit --prod --json` (16 Ekim, tek komut, bellek uyarısı yok). 10-05'te 1 olan orta sayısı 8'e çıktı: iki yeni kimlik (`GHSA-qqmp-wf37-98f9` altı OpenTelemetry izleme paketini, `GHSA-rj75-hqrm-r3gf` bir CSS derleyici paketini kapsıyor); `GHSA-8988-4f7v-96qf` 10-05'ten beri biliniyordu. Yüksek kayıt sayısı değişmedi.
- Orta kayıtlar §7'ye (yüksek/kritik tablosu) YAZILMAZ: `bagimlilik-denetimi.cjs` §7'deki her kimliği "audit'te yüksek/kritik olarak var mı" diye sınar, orta kayıt orada bulunamaz ve "BAYAT KABUL" ile kapıyı kırmızıya çevirir. Bu yüzden ayrı §7a bölümü açıldı; kapı onu okumaz.
- Her §7a satırı bir SON TARİH taşır: o tarihte kayıt yeniden ölçülür (`pnpm audit --prod`), düzeltme küçük sürümle ulaşılabilir hâle geldiyse yükseltilir, gelmediyse gerekçe yenilenir ve yeni tarih yazılır. Tarih geçip yenilenmemiş satır bayat sayılır.
- Bu kayıt `outdated` taraması İÇERMEZ (ALT-95 onayı yalnız `pnpm audit --prod`).
