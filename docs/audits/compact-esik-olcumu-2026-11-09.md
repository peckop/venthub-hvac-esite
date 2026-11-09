# Compact eşiği ölçümü: fast-jev kapalıyken küme kayboldu mu (ARC-192, OPS-176)

Ölçüm tarihi: 9 Kasım 2026. Hüküm sahibi: OPS (9 Kasım): fast-jev kapalı kalır, `enabledPlugins` satırı kalıcı `false`.
Cetvel: yok, yazımı bu işin kapsamında (`docs/standards/` altında compact cetveli yok; filo-ortak "eşik 500k" ve `fleet-mechanism-standard.md` compact dönüşü ritüeli).

## Soru
Compact'ı iki mekanizma tetikliyor görünüyordu: ortam değişkeni `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` ve kullanıcı eklentisi `fast-jev-compaction` (`compactAtPercent=50`). 1 Kasım ölçümünde otomatik compact'ların 300-450k kümesinin (82 olay) kaynağı bilinmiyordu; fast-jev 1 Kasım 16:41'de kapatıldı (`~/.claude/settings.json`, `enabledPlugins` true → false).

## Yöntem
`~/.claude/projects` altında 25 Ekim'den sonra değişen 1191 oturum dökümü, 263 benzersiz `compact_boundary` olayı (tarih, `trigger`, `preTokens`). Tam tarama, bayt aramasıyla (`indexOf`), salt-okuma. Dönem sınırı gün bazlıdır: 1 Kasım'ın tamamı "kapalı" sayıldı. Yalnızca `trigger=auto` olaylar karşılaştırıldı.

## Sonuç (otomatik compact, preTokens kümesine göre)

| Dönem | <300k | 300-450k | 450-550k | 550-650k | Toplam |
|---|---|---|---|---|---|
| fast-jev AÇIK (25-31 Ekim) | 1 | 7 | 1 | 6 | 15 |
| fast-jev KAPALI (1-8 Kasım) | 2 | 2 | 50 | 17 | 71 |

- 300-450k kümesi 7 olaydan 2 olaya indi; kalan ikisi 3 Kasım (370k) ve 6 Kasım (447k), 7 Kasım'dan beri yok. Kümenin kaynağı büyük ihtimalle fast-jev. Örnek küçüktür (açık dönem yalnız 5 günlük otomatik compact), kesin kanıt değildir.
- 550-650k kümesi (3-4 Kasım, ~588-599k) `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=60` × 1M ile uyumludur.
- Yeni küme: 7-8 Kasım'da ~490k civarı 51 olay (8 Kasım'da tek günde 36). Ortam eşiği ~%49-50'ye çekilmiş görünüyor. Etkili eşik teke inmiştir.

## Ölçülmedi
- 8 Kasım'daki 36 olayın kaç pencereye dağıldığı (ARC-249, vade 14 Kasım).
- 25 Ekim öncesi dökümler.
- fast-jev'in Claude Code'da gerçekten çalışıp çalışmadığı doğrudan kanıtlanmadı; yalnız kapatıldıktan sonra kümenin azalması gözlendi.

## Karar ve uygulama
fast-jev kapalı kalır; `~/.claude/settings.json` satır 320 `"fast-jev-compaction@fast-jev-compaction": false` (9 Kasım'da okundu, değişiklik gerekmedi).
