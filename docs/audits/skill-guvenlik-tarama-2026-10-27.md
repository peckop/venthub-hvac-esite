# Skill güvenlik taraması: agnix ve SkillSpector (YTN-22, 27 Ekim 2026)

Kaynak/cetvel: cetvel yok, yazımı bu işin kapsamında (OPS-190). Hızlı tarama; OPS daraltması: araçların kendi sayıları tabloda, "gerçek mi yanlış alarm mı" incelemesi yok, elle yalnız yüksek ve kritik bulgulara tek satır, alt ajan yok, süre tavanı 30 dk. Ham çıktılar depo dışında, geçici dizindeki `ytn22/` klasöründe (agnix.json, ss-depo.json, ss-kullanici.log). Düzeltme uygulanmadı.

## Tablo 1: agnix (agent-sh/agnix, `--target claude-code`, yalnız rapor)

Koşum 14:35, 368 dosyada 1099 bulgu: 570 hata, 380 uyarı, 149 bilgi. Aşağıda en çok çıkan kurallar; geri kalan 21 kural 1 ile 8 arası sayıdadır (ham dosyada).

| Kural | Düzey | Sayı | Aracın tanımı |
|---|---|---|---|
| REF-001 | hata | 544 | Import hedefi bulunamadı (535'i `src/` altında, 4'ü `.archive/`, 4'ü `tests/`) |
| CC-SK-017 | uyarı | 330 | SKILL.md frontmatter'ında bilinmeyen alan `category` (.agent/skills 168, .claude/skills 160) |
| AS-020 | bilgi | 68 | Açıklama ne yaptığını söylüyor, ne zaman kullanılacağını söylemiyor |
| AS-024 | bilgi | 30 | Komut `skills` sürüm sabitlemeden çalışıyor |
| CC-SK-021 | uyarı | 23 | Sabit kullanıcı klasörü yolu kimliği sızdırıyor, taşınabilir değil |
| CC-AG-022 | bilgi | 22 | Alt ajan ne `tools` ne `disallowedTools` veriyor, tüm araçları devralıyor |
| CC-SK-008 | hata | 18 | Bilinmeyen araç adı (4 dosya; örnek `call_mcp_tool`, `.agent/skills` altında) |
| AS-023 | bilgi | 8 | |
| CC-HK-018 | bilgi | 8 | |
| REF-002 | hata | 6 | Kırık markdown bağlantısı (2 dosya, `.agent/skills/vercel-react-best-practices`) |

Elle bakılan yüksek düzey (hata) bulgular, her biri tek satır:

- REF-001 (544): `src/` içindeki `@...` dizgilerini import sanıyor; tek tek bakılmadı, sayı olarak kalıyor.
- CC-SK-008 (18): `call_mcp_tool` gibi Claude Code'da olmayan araç adları, `.agent/skills` (Antigravity ağacı) altında, kasıtlı çift ağaçtan geliyor.
- REF-002 (6): `vercel-react-best-practices/AGENTS.md` içindeki `./async-defer-await.md` gibi bağlantıların dosyası yok.
- CC-AG-007 (1): `.claude/agents/denetim-opus.md` frontmatter'ı ayrıştırılamıyor ("mapping values are not allowed"); ajan tanımı geçerli sayılmıyor, tek gerçek yapısal hata bu.
- file::read (1): `.archive/legacy_superpowers_artifacts/execution.md` okunamadı.

## Tablo 2: SkillSpector (NVIDIA, `--no-llm`, toplu tarama, geçici dizinde sanal ortam)

| Kapsam | Taranan | Paket riski (aracın puanı) | Bulgu şiddeti |
|---|---|---|---|
| Depo `.claude/skills` | 71 paket, tamam | 2 KRİTİK, 6 YÜKSEK, 8 ORTA, 54 DÜŞÜK, 1 hata | 36 yüksek, 30 orta, 1 düşük (67 bulgu) |
| Kullanıcı `~/.claude/skills` | 672 paketten ilk ~125 (gstack iç içe kopyaları dahil); süre tavanı yüzünden durduruldu | 36 KRİTİK, 35 YÜKSEK, 18 ORTA, 33 DÜŞÜK | JSON yazılmadan kesildi, yalnız paket satırları günlükte |
| Eklenti `~/.claude/plugins` | taranmadı | | Kopyalama komutu izin sisteminde reddedildi, dolanılmadı; OPS kararı bekliyor |

Depo kritik paketler: `graphify` (100), `venthub-enterprise-audit` (85). Yüksek: `fallow` (67), `wrongstack-kanban` (63), `venthub-global-rontgen` (62), `venthub-20-eksen-denetimi` (61), `supabase` (56), `diff-review` (51).

Elle bakılan yüksek bulgular (depo, hepsi YÜKSEK şiddet; kritik şiddette tek bulgu yok). Her satır aracın eşleşen dizgisine ve çevresine bakışla yazılmış ilk izlenimdir; "gerçek mi yanlış alarm mı" doğrulaması yapılmadı (OPS daraltması):

- `graphify` (100): 4 "Tool Parameter Abuse" `rm -f graphify-out/...` satırlarına, 1 "without warning" ifadesine takılıyor; hepsi kendi çıktı klasörünü temizleyen komutlar.
- `venthub-enterprise-audit` (85) ve `venthub-global-rontgen`: `.env`/`.env.local` anılması ve `os.environ.copy()`; betik örnekleri, sır okumuyor.
- `fallow`: `<!-- fallow-ignore-file complexity -->` yorumu "gizli talimat" sayılmış, "access token" ifadesi kimlik bilgisi sayılmış.
- `wrongstack-kanban`, `verify-before-done`, `multi-agent`, `wrongstack-mailbox-mcp`, `venthub-auditor`: `~/.claude/settings.json`, `mcp.json` ve `.claude/` anılması "ajan yapılandırma erişimi" olarak işaretli; metinde anlatım, gizli erişim değil.
- `notebook-navigator`, `notebooklm-sync`: "cookies chrome" ifadesi bilgi hırsızı kuralına takılıyor (metinde "bu makinede ÇALIŞMAZ" diye anlatılıyor); ikisi karar 419 ile zaten kapalı listede.
- `supabase`, `supabase-security`, `git-commit`: "Access Token" ve `credentials.json` ifadeleri.
- `diff-review`: skill klasöründe `scripts/__pycache__/` var; temizlenebilir.
- `qa`: `scripts/gez.mjs` kısmen analiz edilebildi (referans verilen dosya).
- `vercel-react-best-practices`: `dangerouslySetInnerHTML` örnek kod.
- `react-modern`, `vercel-composition-patterns`, `venthub-20-eksen-denetimi`: "swap state", "clear context", "disable security" gibi metin parçaları hafıza/komut enjeksiyonu kuralına takılmış.

Kullanıcı klasörü kritik/yüksek listesinin neredeyse tamamı gstack (`careful`, `cso`, `design-*`, `plan-*`, `ship`, `office-hours` ve `.agents/.cursor` altındaki kopyaları); depo skill'i değil, depo dışı ve bizim yazmadığımız paket.

## Öneriler (en çok 3)

1. **`denetim-opus.md` frontmatter'ını düzelt** (agnix CC-AG-007): ajan tanımı ayrıştırılamıyor; tek gerçek yapısal hata; ARAÇ/HARİTA alanı, küçük iş.
2. **SkillSpector'ı depo skill'lerinde kapı yapma, kural olarak değil bilgi olarak kullan**: bakılan yüksek bulguların çoğu metin anlatımına benziyor (komut örneği, `.env` anılması; doğrulanmadı); sırf puan yüzünden `graphify` ve `venthub-enterprise-audit` kaldırılmamalı. İstenirse "yeni dışarıdan alınan skill'i kurmadan önce tara" adımı olarak kalsın.
3. **gstack'in kritik puanlı 36 paketi için karar**: depo dışı, bizim değil; bunları kurulu tutmak ya da set kapalı listesine almak OPS kararı. Eklenti klasörü taraması için kopyalama izni (geçici dizin) verilirse 12 dakikalık iş.
