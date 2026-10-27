# Tur başı sabit yük ölçümü (ARC-222, 27 Ekim 2026)

Yalnız sayılar; transkript içeriği yok. Araç: `npx -y context-tax session|measure` (ayar yazan `fix` komutu koşulmadı) ve transkriptlerde ilk assistant turunun token toplamı.

## Gerçek ilk tur yükü (input + cache_creation + cache_read)

| Pencere | İlk tur token |
|---|---|
| OPS | 151.277 – 154.271 |
| Araç | 151.993 |
| ÜRÜN (site) | 152.888 |
| Altyapı | 151.891 |

Compact'ın sökemediği taban: Araç 136.690, OPS 87.637, ÜRÜN 159.390.

## Kalem kalem

| Kalem | Token | Kaynak |
|---|---|---|
| MCP şema REA (229 araç, ertelemeli) | +4.553 gerçek (35.388 resident hesabı) | ölçüldü |
| Diğer MCP şemaları (resident) | ~3.500 | ölçüldü |
| Skill listesi | 1.735 | ölçüldü |
| Ajan listesi (76) | 566 | ölçüldü |
| CLAUDE.md | ~5.300 | boyut/3,2 |
| .claude/rules/filo-ortak.md | ~3.150 | boyut/3,2 |
| MEMORY.md | ~6.000 | boyut/2,7 |
| Çıktı stili | ~5.500 | boyut/2,9 |
| SessionStart kanca çıktısı | ~3.000 | tahmin |
| Ertelemeli araç adı listesi | ~8.000 | tahmin |
| Yerleşik sistem istemi ve araçlar | ~12.000 | tahmin |

Açıklanabilen toplam ~60.000; kalan ~90.000 açıklanamıyor (istek gövdesi transkriptte yok).

## Kanca satırları (mesaj başına, "devam" istemi)

board-brief 276 kr, defter-tazelik-satiri 210 kr, sage-yazim-sayaci 147 kr; diğer altı kanca sessiz. Toplam ~630 kr, ~200 token ve 9 süreç başlatma (~2,5 sn).
