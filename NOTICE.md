# NOTICE — üçüncü taraf atıfları ve uyarlamalar

> Bu dosya, VentHub deposuna **fikir, yöntem ya da metin olarak** uyarlanmış dış kaynakların
> atıf listesidir. Kural (2026-09-19, Recep kararı): dış kaynaktan uyarlanan her skill, betik ya
> da belge (a) başlığında KAYNAK / ALINAN / BİZDEN bloğu taşır, (b) buraya bir satır ekler,
> (c) `docs/standards/SOURCES.md`'de lisansı yazılır. Atıf zorunluluğu olan lisanslarda (CC BY,
> MIT) bu dosya yasal atıf yeridir. Depo lisansı için `LICENSE`.
>
> npm bağımlılıklarının lisansları `package.json` / `pnpm-lock.yaml` üzerinden izlenir ve burada
> tekrar edilmez.

| Kaynak | Lisans | Ne alındı | Nerede |
|---|---|---|---|
| garrytan/gstack — `office-hours` | MIT © Garry Tan | Altı zorlayıcı soru, öncül çürütme, alternatif üretimi yöntemi | `.claude/skills/office-hours/SKILL.md` |
| garrytan/gstack — `qa` | MIT © Garry Tan | Diff-farkında QA döngüsü, sağlık puanı rubriği, düzeltme döngüsü yöntemi | `.claude/skills/qa/SKILL.md` |
| karpathy/llm-council | MIT © Andrej Karpathy | Üç aşamalı konsey fikri (ilk görüş → anonim inceleme → başkan) | `.claude/skills/llm-council/SKILL.md` |
| rebelytics — "One Skill to Rule Them All" (Task Observer), Eoghan Henn | CC BY 4.0 | Gözlem-günlüğü yöntemi, sinyal kataloğu özü, haftalık inceleme fikri | `.claude/skills/task-observer/SKILL.md`, `docs/skill-gozlemleri/` |
| henchmarketing-rgb/headroom | MIT | Bağlam-doluluk çubuğu fikri (uygulama bizden) | `.claude/statusline.cjs` |
| WrongStack (Ersin Koç) | MIT | "Düzenlenen dosyanın testini o anda koş" fikri (`test-runner-gate`); uygulama bizden | `.claude/hooks/verify-on-stop.cjs` |
| WrongStack (Ersin Koç) — `@wrongstack/core` 1.1.0 skill'leri: `verify-before-done`, `multi-agent`, `wrongstack-kanban`, `wrongstack-mailbox-mcp`, `mnemosyne`, `chimera` | MIT | Skill gövdesi **olduğu gibi**; başa araç eşlemesi + VentHub ek kuralları (bizden), açıklama yeniden yazıldı 1.1.0'a taşındı (YTN-18, 2026-10-12): gövde yeniden eşitlendi; `multi-agent/references/` ve `chimera/references/` aynen. | `.claude/skills/{verify-before-done,multi-agent,wrongstack-kanban,wrongstack-mailbox-mcp,mnemosyne,chimera}/SKILL.md` (+ `mnemosyne/instructions/agent-prompt.md` olduğu gibi) |
| WrongStack (Ersin Koç; telif ECOSTACK TECHNOLOGY OÜ) — `@wrongstack/core` 1.1.0 skill'leri: `testing`, `debugging`, `code-review`, `prompt-engineering`, `bug-hunter`, `refactor-planner`, `sdd`, `research-web`, `git-flow` | MIT | Skill gövdesi **olduğu gibi**; başa araç eşlemesi + VentHub ek kuralları (bizden), açıklama yeniden yazıldı 1.1.0'a taşındı (YTN-18, 2026-10-12): gövde yeniden eşitlendi; `bug-hunter/references/` aynen. | `.claude/skills/{testing,debugging,code-review,prompt-engineering,bug-hunter,refactor-planner,sdd,research-web,git-flow}/SKILL.md` |
| WrongStack (Ersin Koç; telif ECOSTACK TECHNOLOGY OÜ) — `@wrongstack/core` 1.1.2 skill'leri: `mailbox-bridge`, `wrongstack-mailbox` | MIT | Skill gövdesi **olduğu gibi**; başa durum, araç eşlemesi + VentHub ek kuralları (bizden). HAZIR klasöründe, köprü sunucusu kurulana kadar etkin değil | `.claude/skills-hazir/{mailbox-bridge,wrongstack-mailbox}/SKILL.md` |
| WrongStack (Ersin Koç; telif ECOSTACK TECHNOLOGY OÜ) — `@wrongstack/core` 1.1.0 skill'leri: `security-scanner`, `typescript-strict`, `codebase-navigation`, `react-modern`, `data-governance`, `api-design`, `observability`, `node-modern`, `web-platform-baseline` | MIT | Skill gövdesi **olduğu gibi** (tek istisna: `security-scanner`'daki örnek özel-anahtar başlığı yer tutucuya maskelendi); başa araç eşlemesi + VentHub ek kuralları (bizden), açıklama yeniden yazıldı; `web-platform-baseline/references/` aynen 1.1.0'a taşındı (YTN-18, 2026-10-12): gövde yeniden eşitlendi (örnek özel-anahtar başlığı yer tutucusu korundu). | `.claude/skills/{security-scanner,typescript-strict,codebase-navigation,react-modern,data-governance,api-design,observability,node-modern,web-platform-baseline}/SKILL.md`, `.claude/skills/web-platform-baseline/references/*.md` |
| shadcn/ui | MIT © shadcn | Bileşen temeli (stack'te) | `src/components/ui/` |
| `fallow` skill'i — Bart Waardenburg, `docs.fallow.tools` | MIT (skill künyesinde yazılı) | Skill dosyası **olduğu gibi** (yöntem değil, metnin kendisi) | `.claude/skills/fallow/`, `.agent/skills/fallow/` |
| `git-commit` skill'i | MIT (skill künyesinde yazılı) | Skill dosyası olduğu gibi | `.claude/skills/git-commit/`, `.agent/skills/git-commit/` |
| Vercel — `vercel-react-best-practices` skill'i | MIT © vercel | Skill dosyası olduğu gibi | `.claude/skills/vercel-react-best-practices/`, `.agent/skills/…` |
| Vercel — `vercel-composition-patterns` skill'i | MIT © vercel | Skill dosyası olduğu gibi | `.claude/skills/vercel-composition-patterns/`, `.agent/skills/…` |
| WrongStack (Ersin Koç; telif ECOSTACK TECHNOLOGY OÜ) — `@wrongstack/core` 1.1.0 skill'leri: `web-performance`, `tech-stack`, `payments-webhooks`, `database-migrations` | MIT | Skill gövdesi **olduğu gibi**; başa araç eşlemesi + VentHub ek kuralları (bizden), açıklama yeniden yazıldı; `tech-stack/scripts/check-versions.mjs` ve `tech-stack/references/current-versions.md` aynen (YTN-18 ilk dalga, OPS onayı 2026-10-12). | `.claude/skills/{web-performance,tech-stack,payments-webhooks,database-migrations}/SKILL.md`, `.claude/skills/tech-stack/{scripts,references}/` |
| vudovn (`vudovn/ag-kit` @3d7f9e0db6) — `geo-fundamentals` skill'i | MIT © 2026 VUDOVN | Skill gövdesi **olduğu gibi**; başa künye, araç eşlemesi + VentHub ek kuralları (bizden), açıklama yeniden yazıldı; `scripts/geo_checker.py` aynen (YTN-18 ilk dalga, OPS onayı 2026-10-12). | `.claude/skills/geo-fundamentals/` |
| OnVoyage AI (`onvoyage-ai/gtm-engineer-skills` @d093d293b1) — `write-seo-geo-content` skill'i | MIT © 2025 OnVoyage AI | Skill gövdesi **olduğu gibi**; başa künye, araç eşlemesi + VentHub ek kuralları (bizden), açıklama yeniden yazıldı (YTN-18 ilk dalga, OPS onayı 2026-10-12). | `.claude/skills/write-seo-geo-content/SKILL.md` |

**⛔İKİ SKILL AĞACI DA SAYILIR.** `.claude/skills/` (Claude Code) ve `.agent/skills/`
(Antigravity/worker) **ikisi de aktif ve kasıtlıdır** (CLAUDE.md). Aynı skill iki ağaçta
duruyorsa atıf **iki yolu da** gösterir; yalnız birini yazmak, ötekini künyesiz kullanmaktır.

**Ölçülmüş yokluk — `graphify` NİÇİN BURADA DEĞİL:** kaynağında (`.claude/skills/graphify/SKILL.md`)
**hiçbir lisans ya da yazar ibaresi yok** (2026-09-19 tarandı). Recep'in kalıbı gereği ibaresiz
kaynaktan kod alınmaz; graphify bizde **araç olarak kullanılıyor**, metni uyarlanmıyor. Bu yüzden
`SOURCES.md`'de referans olarak durur, burada satırı yoktur. *Bu bir atlama değil, yazılı hükümdür.*

Eksik satır görürsen (uyarlanmış ama burada olmayan kaynak) bu bir kusurdur; `task-observer`
gözlemi aç ya da doğrudan satırı ekle. **Kapı:** `src/__tests__/conformance/notice-kapsami.test.ts`
— lisans/yazar ibaresi taşıyan her skill dosyasının bu listede geçtiğini ölçer.
