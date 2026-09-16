# Oturum devir notu — 0df102e3 (uzak Claude Code, 2026-09-08 → 09-16)

> **Kime:** yerel Claude Code oturumu (yarın) + OPS-AUDIT. **Niçin:** bu oturum uzak konteynerde
> koştu (CodeGraph, NotebookLM, Orion ve filo panosu YOK); konuşulan her şey burada, kaynağıyla.
> Recep kararı: bundan sonra bu sınıf iş **yerelde** yapılır. Bu belge kapanış devridir.
> **Cetvel:** `execution-method-standard.md` · `hukum-kaynak-standard.md` (her hüküm kaynaklı).

## 1 · Recep'in sorduğu araçlar ve hükümler

Ölçüm: her repo README/belge ya da klon; sayılar 09-08 ve 09-16'da alındı.

| Araç | Hüküm | Gerekçe (kaynak) |
|---|---|---|
| gstack (garrytan) | İki fikir alındı, ürün alınmadı | `office-hours` + `qa` skill'i; SKILL.md'ler 90 KB / 78 KB okundu |
| karpathy/llm-council | Fikir alındı | `llm-council` skill'i; yalnız README okundu, betik bizden |
| rebelytics Task Observer | Alındı (CC BY 4.0, atıf başlıkta) | `task-observer` skill'i + `docs/skill-gozlemleri/` |
| headroom (statusline) | Fikir alındı | `.claude/statusline.cjs`; Claude Code `used_percentage`'ı stdin'de veriyor, hook gerekmedi |
| claude-mem | **Deneme** (1 hafta sürüyor) | `docs/plans/claude-mem-deneme-plani-2026-09-08.md`; `--provider host` ŞART |
| strix | Şartlı, ertelendi | dinamik pentest; yalnız staging, lansman-öncesi denetim emrinde |
| Agent-Reach | Ürün: hayır; **X + Reddit ihtiyacı: evet** | önce "gerek yok" dendi, Recep düzeltti (§4); `pazar-izleme` skill'i X listesi gelince |
| archify | Hayır (LLM için) | görsel diyagram, insan aracı; istenirse Recep için ayrı |
| ECC, paperclip, agency-agents, browser-use, Scrapling/scrapy, unsloth, CL4R1T4S, open-design | Hayır | bizde var / LLM ekibine katkısız / çakışır (README'ler 09-08) |
| WrongStack (Ersin Koç) | Ürün: hayır (Claude Code'un alternatifi). **Üç fikir:** yazıldığı anda test, kanıt-avcısı, bulgu yaşam döngüsü | klon ölçüldü 09-16: 9.076 dosya, 35 paket, 3.442 test dosyası, tek yazar, 191 commit/7 gün. Chimera **oturum sonu** ve pasif (`docs/slash/chimera.md`); "Proof-Driven" adı depoda yok |
| WrongStack `codebase-index-mcp` | Şimdi değil | 4. kod grafiği olur; `docs/audits/kod-grafigi-uc-arac-mukayese-2026-09-16.md`: sorun araç değil, kurulu aracın çağrılmaması |

## 2 · Repoya giren işler (hepsi master'da ya da PR'da)

- **PR #1116 (merge oldu):** `office-hours`, `qa` (+`scripts/gez.mjs`), `llm-council`,
  `task-observer`, `video-kaynak`; `statusline.cjs` + `settings.json statusLine`;
  claude-mem deneme planı; dayanıklılık planı; cetvel tablosuna 3 satır; envanter satır 67-71;
  üç gözlem dosyası; her uyarlanan dosyada **KAYNAK / ALINAN / BİZDEN / ALINMAYAN** bloğu.
- **PR #1237 (açık):** `verify-on-stop`'a `vitest related` koşumu + "testsiz değişiklik" sayacı.
  Simülasyon: 2 test dosyası geçti, `layout.tsx` testsiz 1/2. Bloklamaz; bir ay sonra kapı kararı.

## 2.4 · Bu akşam (09-16), ilk paylaşım: WrongStack'in kod-anlama katmanı — "var mı yok mu"

Recep'in ilk paylaştığı metin: "read/tree/grep/glob verince model projeyi anladığını sanır;
WrongStack codebase index, code skeleton, codemap, import graph, impact analysis ile haritalar;
Sage Memory bilgiyi sembole/commit'e/dosyaya iliştirir." Ölçüm: WrongStack README +
`packages/codebase-index-mcp/README.md` + `packages/sage/README.md` (klon) ve bizim CodeGraph
skill'i, `docs/audits/kod-grafigi-uc-arac-mukayese-2026-09-16.md` (#1218), graphify kurulumu (#1217).

| Özellik | WrongStack'te | Bizde | **Var mı?** | Uyarlama | Süre | Durum |
|---|---|---|---|---|---|---|
| Codebase index + import graph | SQLite/FTS5 indeks; `codebase_search/stats/package_graph/file_graph/symbol_graph` (MCP olarak dışa açık) | **CodeGraph MCP** (AST, ~1 sn taze: `explore`, `search`, `node`, `callers`, `callees`, `files`); graphify bugün kuruldu; codebase-memory-mcp aday | **VAR** | Gerek yok. #1218 bulgusu: URUN bugün 5 yanlış hüküm verdi ve **hiçbirinde codegraph'a danışmadı** → sorun araç değil, kullanım; "kurulu aracın kullanım yeri emre yazılır" | — | Kullanım işi, OPS |
| Impact analysis ("neresi etkilenir, hangi dosyalar birlikte ele alınmalı") | codemap/impact | `codegraph_impact`; graphify `affected` (0,7 sn, parantez şart) | **VAR** | Gerek yok | — | — |
| Code skeleton (gövdesiz AST özeti, sözleşme korunur) | `codebase-skeleton` aracı | Orion companion `.md`'leri (fonksiyon grupları, importlar, sabitler) yakın; gövdesiz çıktı komutu yok | **Kısmen** | Tek betik (ts-morph) ya da CodeGraph'a "skeleton" komutu; **önce ölç**: gövdesiz özet bağlam tasarrufu sağlıyor mu? | yarım gün | Bekliyor (Recep kararı) |
| CodeMap (etkileşimli görsel bağımlılık grafiği) | WebUI'de canlı graf | Yok | **YOK** | LLM için gereksiz (CodeGraph metin verir). **Recep için** görsel harita istenirse archify yeniden değerlendirilir | — | İstenirse |
| Sage Memory (bilgi sembole/commit/test/paket'e çapalı, hash ile yeniden doğrulanır) | `.wrongstack/memories/` SQLite/FTS5, `anchors/`, "anchored memories re-verified as targets change" | NotebookLM ikizi + `docs/` + Kararlar + eylem defteri (**küratörlü**); claude-mem denemesi (**otomatik**); defter bayatlık kancası | **Kısmen** | En güçlü fikir: **çapa + hash ile bayatlık ölçümü**. claude-mem 14. gün kararına bağlı; red olursa `task-observer` gözlemine `dosya + hash` alanı, bayatlık kancası okur | — | 23 Eylül |
| `codebase-index-mcp`'yi bize bağlamak | stdio MCP, salt-okuma | 3 kod grafiği aracı zaten var | — | **Şimdi değil**: #1218 kuralı "sahiplik ölçüt değildir", hangisi iyi bulur ancak **yan yana koşum** ile; o ölçüm graphify için bile yapılmadı. Sıra: önce graphify ↔ codegraph, sonra dördüncü | — | Ertelendi |
| Veritabanı şeması haritası (Recep'in asıl isteği) | WrongStack de görmez | Üç kod aracının hiçbiri görmez; ALTYAPI **şema graf üreticisi** (#1220, DB'nin kendi kataloğundan) | **Ayrı iş, başladı** | Recep: "Supabase'i gördük, hallettik" | — | Kapandı |

**Hüküm:** paylaşımın anlattığı sorun gerçek ("grep ile dolaşan model"), ama bizde CodeGraph
kuralıyla bir ay önce çözülmüş; yeni olan iki şey **skeleton** (küçük iş) ve **hafıza çapası**
(claude-mem'e bağlı). WrongStack'i **kullanmak** gerekmiyor: Claude Code'un alternatifi ve tüm
mekanizma Claude Code'a yazılı.

## 2.5 · Bu akşam (09-16), ikinci paylaşım: WrongStack'ten üç uyarlama — "var mı yok mu" ve plan

Recep'in sorusu: Ersin Koç'un paylaşımındaki üç şey ("hataları yazıldığı anda bul",
"Proof-Driven Bug Hunter", "testsiz kod geliştirmem") bizde var mı, uyarlanır mı?
Ölçüm: WrongStack README + klon (`docs/feature-matrix.md`, `docs/slash/chimera.md`,
`docs/collab-debug.md`) ve bizim `.claude/hooks`, CLAUDE.md, 70 cetvel (`grep`).

| # | Özellik | WrongStack'te | Bizde olan parça | **Var mı?** | Uyarlama planı | Süre | Durum |
|---|---|---|---|---|---|---|---|
| 1 | Hatayı yazıldığı anda bul | `test-runner-gate`: düzenlenen dosyanın testini `PostToolUse`'ta koşar (paylaşım bunu Chimera sanıyor; Chimera oturum sonu) | `verify-on-stop` yalnız lint+tsc; test-önce kuralı/sayısı **yok** | **YOKTU** | `verify-on-stop`'a `vitest related` koşumu + "testsiz değişiklik" sayacı; bloklamaz, ölçer; bir ay sonra kapı kararı | yarım gün | **YAPILDI** → PR #1237 |
| 2 | Chimera (oturum sonu inceleme) | `session.ended`'da değişen dosyalara inceleme ajanı; şiddet sıralı `dosya:satır`; bulgu yaşam döngüsü JSONL (30-90 gün); **pasif**, fixer manuel | `diff-review` (3 kalıp), `code-review` (elle), **PR kapı botu** (onarım commit'i atıyor: PR #1116'da iki kez) | **Kısmen** — PR katmanında bizimki daha güçlü | Kopya gereksiz. Tek eksik parça: bulgu yaşam döngüsü kaydı → `skill-gozlemleri` deseniyle | 1 gün → **öncelik düştü** | Bekliyor (Recep kararı) |
| 3 | Proof-Driven Bug Hunter | `collab_debug`: BugHunter + RefactorPlanner + Critic paralel, FleetBus, ≤ 20-30 dosya; "proof/kanıt" şartı belgede **yok** | Workflow çürütme pası; 20-eksen "geri gelmesini önleyecek test"; `qa` regresyon testi | **YOK** (tek parça zincir olarak) | `kanit-avcisi` skill'i: kapsam → 3 avcı → **önce başarısız vitest** (kanıt; yazılamıyorsa bulgu düşer) → çürütücü → düzeltici. Kanıt şartı bizim katkımız | 1 gün | **Sırada, yerelde** |
| — | Testsiz kod yazmam | Kişisel disiplin; zorlayan eklenti yok | Hiçbir kural/kanca/ölçüm yoktu | **YOK** | #1 ile sayı olarak ölçülüyor; kural değil ölçüm (Recep: "sayı düşmezse kapı") | — | #1 kapsıyor |
| — | Hafıza çapası (bilgi sembole/commit'e bağlı, hash ile yeniden doğrulanır) | SAGE `anchors/` | claude-mem denemesi; defter bayatlık kancası | Kısmen | claude-mem 14. gün kararına bağlı; red olursa `task-observer` gözlemine `dosya + hash` alanı | — | 23 Eylül |

**Yol boyunca düzeltilen hata:** depo okununca "Chimera yazıldığı anda çalışmıyor" ölçümü,
fikrin değerine yapıştırıldı ve 1 numara geri çekilir gibi oldu. Recep: "reklam repodan
öndeyse fikri niye saldın?" Doğru: fikir (yazıldığı anda) depodaki uygulamadan iyiydi; #1 tam
o fikrin bizdeki halidir. Ders §4'te.

**Hüküm (Recep sorusu "gerçekten bize sağlar mı"):** ürün olarak hayır (Claude Code'un
alternatifi; 18 hook + 71 skill + pano onun üstüne kurulu). Fikir olarak üçü de sağlar; en
değerlisi #1, ikincisi #3. Tebrik yerinde: tek kişi, tam ajan; ama 191 commit/7 gün ve
~1,8 M satır tek insanın okuyabileceği hacim değil → **fikir kaynağı, bağımlılık değil**.

## 3 · Açık işler (sıra Recep'in)

1. **`kanit-avcisi`** skill'i — kapsam ≤ 30 dosya → 3 paralel avcı (mantık, sınır değer, güvenlik)
   → her bulgu için **önce başarısız vitest** (yazılamıyorsa bulgu düşer) → çürütücü → düzeltici.
   Workflow; emirde "workflow kullan". KAYNAK: bu belge + DURUM-TAKIP 09-16 notu. **Yerelde.**
2. **Dayanıklılık planı** `docs/plans/lansman-oncesi-dayaniklilik-plani-2026-09-08.md`:
   1 yedek tatbikatı (İLK, kodsuz) · 3 olay defteri (kodsuz) · 2 sessiz-arıza alarmı ·
   4 hız sınırı yayma (maestro; bugün 3/N fonksiyonda) · 5 uptime · 6 pgTAP · 7 staging+strix ·
   8 k6 · 9 Stryker · 10 mekanizma budaması.
3. **claude-mem 14. gün (23 Eylül):** sıfır noktası alınmadı, CLAUDE.md "enjekte bağlam ipucu,
   cetvel kanıt" satırı yok. Yerelde ölç: `~/.claude-mem/settings.json` provider, 7 günlük kota,
   isabet vakası sayısı → `docs/audits/claude-mem-ara-olcum-*.md`.
4. **`pazar-izleme`** — X hesap/konu listesi gelince; Agent-Reach yerel MCP (X+Reddit), reklam
   kütüphaneleri WebFetch, `video-kaynak` alt parça.
5. **Chimera'dan tek parça:** bulgu yaşam döngüsü (çözüldü/yok sayıldı) — `skill-gozlemleri`
   deseniyle; PR kapı botu zaten daha güçlü, kopya gereksiz.
6. **Haftalık skill incelemesi:** `docs/skill-gozlemleri/acik/` 3 dosya, `son-inceleme.txt = hic`.

## 4 · Bu oturumun dersleri (gözlem dosyaları yazıldı)

- **Ölçmeden hüküm** — pano dosyalarına "çöp" dendi (09-08). Kural: adlandırmadan önce oku.
- **Kaynak/alınan/bizden görünür olsun** — Recep uyarlama ile kopyayı ayırt edemedi (09-08).
- **Bilgi kaynağını kod gibi değerlendirme** — Agent-Reach'e "bizde var" dendi; Recep'in X
  kullanımı kanıttı (09-09). Kural: kanalın kapsamı, uygulamanın karmaşıklığı değil.
- **Tanıtım metni ≠ depo, ama fikir ≠ uygulama** — WrongStack'te paylaşım Chimera'yı yanlış
  anlattı; ben de "depo yapmıyor"u "fikir değersiz"e çevirdim. Fikir (yazıldığı anda) depodan
  iyiydi; PR #1237 o fikirdir. (Gözlem: "ölçmeden hüküm"ün ikinci vakası; incelemede birleştir.)
- **Değişen plan yeniden yazılır** — madde 1'in içeriği depo okununca değişti, onay eskisineydi.
- **Uzak oturum sınırı** — CodeGraph/NLM/pano yok; bu sınıf iş yerelde (Recep kararı 09-16).

## 5 · Yerelde ilk 10 dakika

```powershell
git fetch origin && git checkout master && git pull
# PR #1237'yi incele/merge et; sonra ilk oturumda alttaki bağlam çubuğunu ve
# tur sonunda "🧪 tur-sonu test" satırını gör.
type $env:USERPROFILE\.claude-mem\settings.json   # provider host mu?
pip install yt-dlp                                # video-kaynak için
```

Şerit: bu oturumun tüm claim'leri bırakıldı. Dal: `claude/gunaydın-rrt2g1` (PR #1237).
