# Model kıyası — ALTYAPI şeridi (karar 63)

**Soru:** 2026-09-23'ten itibaren ALTYAPI penceresi Opus 5'ten Sonnet 5'e alınıyor (effort aynı: medium). Aynı şerit,
aynı tür iş üzerinde dört ölçütle kıyaslanır. **Bu dosya taban satırını (Opus, 09-22) ve yarının boş şablonunu taşır.**

## Ölçütler (tanım — her gün aynı yoldan sayılır)

| ölçüt | tanım | nasıl sayılır |
|---|---|---|
| **biten iş** | o gün master'a giren ALTYAPI PR'ı (`altyapi/*` dalı) + ALTYAPI'nın ritüelle indirdiği bot PR'ı | `gh pr list --state merged --search "merged:<gün>"` → dal öneki |
| **kırmızı CI** | o günün ALTYAPI dallarında en az bir `failure` veren PR sayısı (aynı PR'ın tekrarları tek sayılır); ayrıca bot PR'ında ALTYAPI'nın onardığı kırmızı | `gh run list --branch <dal>` → `conclusion=failure` |
| **OPS düzeltmesi** | OPS'un ALTYAPI'nın bir hükmünü/raporunu ölçümle düzelttiği mesaj sayısı | OPS mesajları + durum dosyası |
| **/usage** | pencerenin günlük kullanım çıktısı | yalnız **Recep** çalıştırır (slash komutu; şerit okuyamaz) |

Ek (bilgi, kıyasa girmez): Recep düzeltmesi sayısı ve şeridin kendi bildirdiği kural ihlali.

## Taban — 2026-09-22, Opus 5 (1M bağlam)

| ölçüt | değer | döküm |
|---|---|---|
| biten iş | **17** (13 ALTYAPI + 4 bot) | ALTYAPI: #1289 #1295 #1297 #1298 #1300 #1302 #1303 #1306 #1307 #1313 #1317 #1318 #1319 · bot: #1293 #1311 #1312 #1315 |
| kırmızı CI | **1** ALTYAPI PR'ı (+1 bot) | #1295 (simple-import-sort, push öncesi eslint koşulmadı); bot #1315 "BAYAT KABUL" → ALTYAPI onardı |
| OPS düzeltmesi | **2** | (1) mcp-bellek: 4,4 GB tsserver'ı "VS Code" dedim, gerçekte ALTYAPI penceresinin LSP eklentisi; (2) #1280/#1301 URUN teyidi gelmişti, "gelmedi" diye raporladım (kutu okunmamıştı) |
| /usage | **Recep'ten bekleniyor** | — |
| (bilgi) Recep düzeltmesi | 5 | Vercel Pro önerisi (karar 60 zaten "hayır"dı) · panel talimatını araç çağrılı mesaja gömme · linksiz hatırlatma · Resend bölge seçimini talimatta söylememe (Tokyo) · Supabase linkinde organizasyon kimliği (kırık link) |
| (bilgi) kural ihlali | 1 | #1313 rebase sonrası `git push --force-with-lease` (yasak listesinde; kendi dalı, zarar yok) |

Not: 09-22 günü compact ile ikiye bölündü; sayım tüm günün master kaydından yapıldı, pencere belleğinden değil.

## Şablon — 2026-09-23, Sonnet 5 (doldurulacak)

| ölçüt | değer | döküm |
|---|---|---|
| biten iş | | |
| kırmızı CI | | |
| OPS düzeltmesi | | |
| /usage | | |
| (bilgi) Recep düzeltmesi | | |
| (bilgi) kural ihlali | | |

**Adil kıyas uyarısı:** iş karışımı günden güne değişir (09-22'de ölçüm/belge ağırlıklıydı: barındırma, PIM, bellek).
Tek günlük fark eğilim değildir; en az üç gün aynı ölçütle toplanmadan hüküm yazılmaz.
