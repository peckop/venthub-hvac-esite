# MCP bellek ölçümü — 2026-09-22 (ALTYAPI, yalnız ölçüm)

**Soru (OPS):** makine belleği 32 GB'ın ~28'i dolu; Claude pencereleri kaç MCP süreci başlatıyor, hangisi ne tutuyor,
hangisi hiç kullanılmıyor, pencere başına ne kazanılır? **Ayar değiştirilmedi** (`.mcp.json` / settings Recep kapısı).

**Yöntem:** `Get-CimInstance Win32_Process` → süreç sınıflandırması komut satırından (ham satır **basılmadı**, sır
olabilir); en yakın `claude.exe` atası = pencere. Kullanım: `~/.claude/projects/**/*.jsonl` içinde son 7 günde
değişmiş 775 transcript, `tool_use` bloklarında `mcp__<sunucu>__` sayımı. Betikler oturum scratchpad'inde
(`mcp-bellek.ps1`, `mcp-bellek2.ps1`, `mcp-sayim.cjs`).

## 1 · Belleği kim tutuyor (anlık, 14:40)

| süreç | adet | MB | not |
|---|---|---|---|
| **VS Code TypeScript sunucusu (`tsserver.js`)** | 3 | **5968** (4310 + 1506 + 152) | **tek başına en büyük kalem — MCP değil** |
| Claude pencereleri (`claude.exe`, eklenti) | 4 | 1674 (386–469 her biri) | |
| Diğer `claude.exe` (CLI ×2, agent SDK ×1) | 3 | 713 | |
| MCP alt süreçleri (tüm pencereler) | ~150 | **~1600** | pencere başına ~29–38 süreç, **~180 MB** (boşta ölçülen pencere) |
| chroma-mcp (python, claude-mem vektör) | 1 | 195 | |
| Makine | — | toplam 31,8 GB · **boş 3,7 GB** | |

Pencere başına MCP dökümü (dört pencerede aynı desen): playwright ×4 · browser-use ×4 · testsprite ×4 · codegraph ×2 ·
orion ×2 · notebooklm ×2–6 · claude-mem ×2–7 · wrongstack (sage, codebase-index, kanban, mailbox) ×1–2 · github ×1 ·
gitmcp ×1 · markitdown ×1. Sunucu başına MB küçük (codegraph 306 · claude-mem 377 · notebooklm 168 · testsprite 104 ·
wrongstack toplam ~280 — hepsi tüm pencereler toplamı).

## 2 · Son 7 günde kullanım (araç çağrısı, 775 transcript)

| sunucu | çağrı | | sunucu | çağrı |
|---|---|---|---|---|
| Linear (claude.ai + eklenti) | 3347 | | codegraph | 32 |
| Supabase (claude.ai + yerel + eklenti) | 2202 | | github | 25 |
| playwright | 945 | | claude-mem | 19 |
| Vercel | 212 | | wrongstack-kanban | 18 |
| orion | 125 | | wrongstack-sage | 11 |
| wrongstack-mailbox | 86 | | Context7 | 8 |
| notebooklm-py | 52 | | wrongstack-codebase-index | 7 |
| gitmcp | 34 | | **testsprite** | **2** |
| | | | **markitdown** | **1** |
| | | | **browser-use** | **0** |
| | | | **sentry** (yetkisiz) | **0** |

## 3 · Hüküm ve tasarruf tahmini

- **MCP'leri kısmak belleği kurtarmaz:** pencere başına MCP toplamı ~180 MB; hiç/az kullanılan dört sunucu (browser-use,
  testsprite, markitdown, sentry) kapatılırsa pencere başına **~15 süreç ve tahminen 40–60 MB** — 4 pencerede ~0,2 GB.
  Süreç sayısını yarıya indirir ama belleği değil.
- **Asıl kalem VS Code'un TypeScript sunucusu: ~6 GB.** Büyük depo + çok worktree açık olunca tsserver şişiyor.
  Kazanç: kullanılmayan VS Code pencerelerini/worktree klasörlerini kapatmak ya da "TypeScript: Restart TS Server"
  (anında), kalıcı olarak `typescript.tsserver.maxTsServerMemory` sınırı (kullanıcı ayarı — Recep kapısı).
- Ölçülmedi: pencere açılışındaki anlık tepe (bu ölçüm boşta), tsserver'ın hangi klasörü yüklediği.
