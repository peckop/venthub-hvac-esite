# Bağımlılık güvenlik taraması — 2026-11-14 · **üretim ağacında yüksek 0, orta 0; geliştirme ağacında yüksek 1 (kabul)**

**Şerit:** ALTYAPI · **Kart:** ALT-185 (OPS, 14 Kasım: durum satırı "son tarama 29 gün · high 1") · **Cetvel:** `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md`, kabul listesi `docs/standards/bagimlilik-kararlari.md`.
**Önceki ölçüm:** `bagimlilik-2026-10-16.md` (üretim ağacında 1 yüksek, 8 orta).

## 1 · SAYILAR (üretim ağacı, `pnpm audit --prod --json`; ölçüm 2026-11-14)

| Ölçüt | Değer | 10-16 ölçümü |
|---|---:|---:|
| Yüksek önemde güvenlik kaydı (prod) | **0** | 1 |
| Orta (prod) | 0 | 8 |
| Düşük | 0 | 0 |
| Kritik | **0** | 0 |

> ⛔**İLK SATIRIN YAZILIŞI BİR SÖZLEŞMEDİR** (`defter-tazelik-satiri.cjs` sayıyı bu tablodan okur).

Kapı sınaması (aynı ölçümün kayıtlı çıktısıyla, `node scripts/hijyen/bagimlilik-denetimi.cjs --json <çıktı>`): **çıkış 0, TEMİZ** (yüksek/kritik 0, kabul listesinde 0, yeni 0, bayat kabul 0).

## 2 · GELİŞTİRME AĞACI (`pnpm audit`, `--prod` YOK; ölçüm 2026-11-14)

Toplam: yüksek 1, kritik 0, orta 0, düşük 0, bilgi 0. Tek kayıt:

| GHSA | paket | önem | düzeltme | yol | çalışma zamanı | karar |
|---|---|---|---|---|---|---|
| `GHSA-mrhx-c7xc-m3w5` | zod (kilitli 3.25.76) | yüksek | ≥4.6.6 | `.` → `eslint-plugin-react-compiler` → `zod` | yalnız geliştirme (lint eklentisi) | **kabul**, `bagimlilik-kararlari.md` OPS-225 ALTINCI DURUM: üretim ağacında doğrudan `zod` ^4.6.6'ya kapandı; geliştirmede eklenti `zod` 3.x'e bağlı olduğundan kapatılamadı (ALT-176: eklentiyi kaldırmak lint paritesini bozuyor). |

Üretim çıktısına girmez: sunucu yanıt yolunda ve tarayıcı paketinde yok.

## 3 · BU TURDA DEĞİŞENLER

Kilit dosyası DEĞİŞMEDİ, `pnpm install` gerekmedi. 10-16'daki 8 orta kayıt (6 OpenTelemetry izleme paketi, `@opentelemetry/core`, `postcss-selector-parser`) bu ölçümde üretim ağacında görünmüyor; kapanma sebebi bu kartın kapsamında ölçülmedi, kabul satırlarının (`bagimlilik-kararlari.md` §7a) silinmesi/yenilenmesi ayrı bir karardır ve bu kayıtla yapılmadı.

## 4 · ÖLÇÜM NOTU

- Ham çıktılar: `pnpm audit --prod --json` (kapı betiğine verildi) ve `pnpm audit --json` (geliştirme ağacı), aynı gün, ağır komut yok.
- Bu kayıt `outdated` taraması İÇERMEZ.
- Tazelik uyarısı (`defter-tazelik-satiri.cjs`) bu dosyanın tarihine bakar, eşik 14 gün: bir sonraki kayıt en geç **2026-11-28**. Haftalık `bagimlilik-denetimi.yml` kayıt dosyasını depoya yazmaz, bu yüzden kayıt elle yazılır; kalıcı çözüm önerisi ALT-185 kartındadır.
