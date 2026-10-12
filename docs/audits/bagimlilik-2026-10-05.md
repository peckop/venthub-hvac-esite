# Bağımlılık güvenlik taraması — 2026-10-05 · **yüksek kayıt 11 → 1**

**Şerit:** ALTYAPI · **Kart:** ALT-35 (OPS isteği, 10-05) · **Cetvel:** `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md`
**Önceki ölçüm:** `bagimlilik-2026-09-19.md` (11 yüksek). Aradaki kapanışlar `bagimlilik-kararlari.md` §7'de (09-21 ilk, 09-22 ikinci, 09-29 üçüncü).

## 1 · SAYILAR (tüm ağaç, `pnpm audit --json`; ölçüm 2026-10-05)

| Ölçüt | Değer | 09-19 ölçümü |
|---|---:|---:|
| Yüksek önemde güvenlik kaydı (prod) | **1** | 11 |
| Orta | 1 | 6 |
| Düşük | 0 (2'si bu PR ile kapandı) | 5 |
| Kritik | **0** | 0 |

> ⛔**İLK SATIRIN YAZILIŞI BİR SÖZLEŞMEDİR** (`defter-tazelik-satiri.cjs` sayıyı bu tablodan okur).

## 2 · KALAN KAYITLAR — üretimde koşan ile yalnız derlemede koşan

| GHSA | paket | önem | yol | çalışma zamanı | karar |
|---|---|---|---|---|---|
| `GHSA-vfj7-8cjw-p6xm` | braces ≤3.0.3 | yüksek | `@sentry/webpack-plugin` → `unplugin` → `chokidar`; `tailwindcss` → `fast-glob`/`micromatch` | **Yalnız derleme.** `pnpm audit` "prod" saysa da tüm yollar derleme araçları (webpack eklentisi, CSS derleyicisi); sunucu yanıt yolunda ve tarayıcı paketinde yok | **§7 kabul** (ALT-32, 10-05): düzeltme sürümü YOK |
| `GHSA-8988-4f7v-96qf` | @opentelemetry/core <2.8.0 | orta | `@sentry/nextjs` → `@sentry/node` → `@opentelemetry/core` 1.30.1 | **Çalışma zamanı** (Sentry sunucu tarafı; W3C Baggage yayılımı) | **Kapatılamaz bu turda:** düzeltme 2.x hattında, Sentry 8.55 `^1.x` ister (büyük sürüm atlatma, override YASAK: cetvel §4). Orta önem, §7 kapsamı (yalnız yüksek/kritik) dışında; kaldırma şartı: `@sentry/nextjs` 10.x (karar 17) |

## 3 · BU TURDA KAPANANLAR (lock dosyasında 10 satır, `--frozen-lockfile` yeşil)

| GHSA | paket | önem | eski → yeni |
|---|---|---|---|
| `GHSA-p98j-92pf-mc4p` | dompurify | düşük | 3.4.15 → 3.4.16 |
| `GHSA-w9m9-85wc-3x92` | postcss-selector-parser | düşük | 6.1.2 → 6.1.4 |

## 4 · ÖLÇÜM NOTU

09-19'daki "11 yüksek" kaydın 10'u üç kapanışla (09-21/22/29) ve `fast-uri`/`brace-expansion`/browserslist yükseltmeleriyle gitti; kalan tek yüksek (braces) 09-18'de yayımlanan yeni bir kayıttır, düzeltmesi yoktur. `pnpm audit` bu paketi "dev değil" işaretliyor; gerçekte yalnız derleme zincirinde olduğu yukarıdaki yollardan okunur (ölçülen: `pnpm why braces`).
