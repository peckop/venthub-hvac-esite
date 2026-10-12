---
name: multi-agent
description: "İş birden çok ajana bölünebiliyorsa (çok dosya tarama, paralel denetim, lider/işçi): ne zaman bölüneceği, görev metni, sonuç birleştirme ve doğrulama. Tetik: \"paralel\", \"alt ajan\", \"hepsini tara\". WrongStack 1.1.0 uyarlaması."
category: coordination
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/multi-agent/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "ARAÇ 2026-09-28 (karar 165 W3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi; 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/multi-agent/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `delegate` aracı | **Agent** aracı (alt ajan; `run_in_background`); çok aşamalı iş: **Workflow** (yalnız Recep/emir "workflow kullan" dediyse) |
| `collab_debug` | YOK — bizde karşılığı yok; kullanılmaz |
| fleet / Director / `budget_exhausted` | YOK (WrongStack ana programında); ilke olarak okunur |
| Yöntem seçimi | `docs/standards/execution-method-standard.md` (ŞERİT / alt ajan / Workflow / maestro) — çelişirse o kazanır |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Kimlik** yalnız `tools/wrongstack-mcp/posta-kutusu.cjs` sarmalayıcısından gelir. `.mcp.json`'a `--actor` ya da `${...}` yer tutucusu yazılmaz (genişlemiyor, bütün pencereler aynı kimliğe düşüyor).
2. **Posta alıcısı** daima TAM oturum kimliğidir (36 karakter). 8 haneli kısa kimliğe giden mesaj hata vermeden kaybolur.
3. `--admin` ve `--destructive` bayrakları KAPALI kalır; kaynak metindeki örnek yapılandırmalar bizde uygulanmaz.
4. Kutuya ve karta **sır** (anahtar, parola, token) ve **Recep onayı** yazılmaz. Onay yalnız Recep'in kendi penceresinde verilir. Tek ayrı yol (karar 224): canlı DIŞI işte OPS, Recep'in OPS'ta verdiği evetin sözünü ve saatini OPS panosundaki onay kartına yazar; onayı orada doğrularsın. Canlı iş (migration'lı PR, sır/anahtar/parola, geçmişi silen git, canlı veritabanı yazımı, para harcatan her şey) bunun dışındadır: onay yine yalnız Recep'ten gelir.
5. `*_watch` çağrısı kanıt değildir; durum `mailbox_read` / `kanban_read` ile okunarak doğrulanır.
6. İş takibinin tek kaynağı **Kanban**'dır (karar 219, 2026-10-01); Linear donuktur: yeni kayıt açılmaz, mevcut kayıtlar silinmez. İş emri = Kanban kartı (KAYNAK/CETVEL + YÖNTEM + kanıt komutu); Done kanıt komutuyla (`wrongstack-kanban` skill'i).
7. "Bitti" doğrulayıcı komutu `gh` ile sınırlıdır ve sır içermez.
8. Kanban yaması `cli.js` + `index.js` dosyalarında (`tools/wrongstack-mcp/yamalar/`). Sürüm yükselince yamanın hâlâ tuttuğu yeniden ölçülür.
9. `mailbox-bridge` kullanılmaz (HTTP köprüsü; bizde kapalı).
10. Ops'a rapor dört alanlı etiketle gider (NE · DURUM · KANIT · KİMDE). Kaynak metindeki `<nextsteps>` biçimi bunun ekidir, yerine geçmez.
11. **İzin bilgisi** (kim neye yetki verdi) pencere mesajından hafızaya ya da durum dosyasına KOPYALANMAZ. Tek kaynak `~/.claude/settings.json`; en fazla "bkz. settings.json autoMode, <tarih>" yazılır.
12. **Pencereler arası mesaj ≤800 karakter.** Mesaj yalnız ADRES (dosya/Kanban kartı) + hüküm + istek taşır; ayrıntı dosyada ya da Kanban kartındadır. Recep'e giden metin bu sınırın DIŞINDADIR (tam cümle kuralı).
13. **⚠Kaynak gövde ile `execution-method-standard.md` §10 (müdür modeli, karar 201) çakışan yerler — §10 kazanır:**
    - Gövdedeki **"≥5 tool calls per subtask" bölme kapısı** (karar sorusu 3 ve "Single atomic task under 5 tool calls") bizde geçerli değildir: §10.4 **"şüphede model uygulanır"** der; elle yalnız küçük tek dosya.
    - Gövdedeki **"~10 işçi (200K) / ~25 (1M)" pratik tavanı** sert sınır değildir: §10.4 **eşzamanlı alt ajan sayısına sınır koymaz** (Recep, karar 201); tek ölçüt her parçanın denetlenip doğrulanabilmesidir. Tavandan alınacak ders yalnız şu: sentez kalitesi bağlamdan önce düşer, parça sayısı denetlenebilirliği aşınca dalgaya böl. Host sınırları (eşzamanlı 20 vb.) ayrıdır: §10.5.
    - Gövdedeki **"bağlama sığıyorsa bölme"** ipucu bizde gerekçe değildir: bölmenin gerekçesi **bağımsız doğrulamadır** (yazan göz hatasını göremez, §10.3).
    - `delegate` / `batch_tool_use` / `collab_debug` / fleet adları bizde yok (yukarıdaki tablo). `references/collab-debug.md` kopyada yok; gövdedeki bağlantı boşta.
    - **Çalışan Recep'e yazmaz, başka pencereye emir vermez; raporu yalnız müdüre gider** (§10.4); gövdedeki çalışan→lider posta örnekleri bu kuralla okunur.

---


# Multi-Agent Coordination

## Selection card
- Task: Plan coordinated work when delegation is authorized.
- Start: Identify the requested artifact, repository owner and acceptance criteria.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Parallel agents improve independent attention and elapsed time, at the cost of
handoff and synthesis. Use the host's actual limits and context-sharing rules.
Separate contexts may still share files, build outputs, ports and databases.

## Rules

1. Follow the session's delegation authorization and available tools. A large
   task or this skill's availability alone does not authorize spawning agents.
2. Delegate independent work with exact boundaries and a definition of done.
   Keep decisions requiring the complete context with the coordinator.
3. Assign file/resource ownership before writes. Prefer parallel reading and
   separate edit scopes; serialize shared build, coverage, release and database
   writers unless their isolation is demonstrated.
4. Treat task brief and supplied artifacts as the worker's reliable context;
   inspect what the host actually inherits instead of assuming total amnesia
   or unlimited shared memory.
5. Validate every worker's completion status and evidence. Partial, cancelled
   and budget-exhausted outputs are coverage gaps, not successful checks.
6. Synthesize one outcome with deduplicated findings and material cross-scope
   effects; do not concatenate reports or fabricate unanimity.

## Workflow

1. Decide whether the work is independent enough to repay briefing and merge
   costs. Use one agent when a subtask depends on exploratory results.
2. Brief each worker: task, exact paths, raw inputs, constraints, write ownership,
   checks, return format, budget and stopping conditions.
3. Dispatch within host concurrency/resource limits. Keep useful coordinator
   work running while workers execute.
4. Handle dependency handoffs explicitly with versioned artifacts or paths.
   A worker should reread a shared file before editing when another writer changed it.
5. Check actual statuses, commands and changed files. Read relevant code for
   consequential findings and inspect integration conflicts.
6. Retry a failed worker only when a changed scope/input addresses the cause.
   Bound retries; respect cancellation and report remaining gaps.
7. Run the integration checks against the combined final state with one owner.

## Brief template

~~~
Task: <one concrete objective>
Scope and ownership: <paths; read-only or permitted writes>
Inputs and constraints: <artifacts; relevant host rules>
Done when: <observable result>
Verify with: <commands and expected behavior>
Return: <outcome, files/lines, commands/results, limitations>
Stop/escalate when: <dependency or scope decision>
~~~

## Review workflow

For the host's collab_debug path, load
[the complete instructions](references/collab-debug.md) before dispatch.
That workflow's actual tool contract governs roles and result handling.

## Before returning

- Delegation permitted and concurrency limits respected.
- Shared writers isolated or serialized.
- Every worker status reconciled; evidence checked.
- Combined result validated; gaps and conflicting observations visible.

## Skills in scope

- code-review — independent change review.
- evidence-audit — scoped evidence-led rounds.
- refactor-planner — dependency sequencing.
- audit-log — worker/session evidence analysis.
- output-standards — final result synthesis.

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
