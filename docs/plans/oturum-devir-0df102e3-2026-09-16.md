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
