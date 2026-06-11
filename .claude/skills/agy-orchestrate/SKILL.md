---
name: agy-orchestrate
description: >-
  Use this skill to delegate large-scale code analysis, multi-axis audits, codebase-wide scans,
  or broad research to the Antigravity CLI (`agy`, Gemini Flash) as a cheap PARALLEL subagent fleet
  running from the terminal, then VERIFY the findings with CodeGraph and synthesize one prioritized
  report. Reach for it when a task benefits from wide fan-out (admin-panel audit, RLS sweep, security
  review, "find every X across the repo") and you want to spend agy's Antigravity Ultra quota instead
  of Claude's weekly budget. The orchestrator (Claude) writes sharp directives + verifies; agy does
  the cheap broad scanning. DO NOT use for quick single-file lookups, tasks needing only Claude's
  deep reasoning, or anything where one CodeGraph call already answers it.
category: orchestration
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, mcp__codegraph__codegraph_explore, mcp__codegraph__codegraph_callers, mcp__codegraph__codegraph_search
metadata:
  triggers:
    - agy ile tara
    - antigravity subagent
    - fan-out audit
    - ucuz paralel tarama
    - agy delegate
  requires:
    - "agy CLI kurulu (command -v agy)"
    - "winpty kurulu (Git Bash ile gelir)"
    - "agy config: toolPermission=always-proceed, trustedWorkspaces icinde repo"
  persona_library: .agent/rules/subagents.md
---

# agy-orchestrate — Antigravity CLI'yi Subagent Filosu Olarak Yönet

VentHub'da iki agentic CLI var: **bu taraf (Claude Code, derin düşünür)** ve **`agy` (Antigravity CLI,
Gemini Flash — hızlı/ucuz, kullanıcının Ultra kotasından).** Bu skill, Claude'un agy'yi terminalden
**eş-ajan filosu** gibi sürmesini sağlar: Claude keskin direktifi yazar, agy geniş taramayı ucuza yapar,
Claude sonucu **CodeGraph ile doğrular** ve önceliklendirilmiş tek rapora indirir.

> **Çekirdek ilke:** worker (agy/Flash) = **geniş tarama** (ucuz, paralel, az düşünür) ·
> orkestratör (Claude/Opus) = **doğrulama & sentez** (derin). Flash benim kadar düşünmez; bu yüzden
> direktifler **çok açık** olmalı (kontrol listesi, kanıt disiplini, çıktı formatı) — bkz persona kütüphanesi.

---

## Ne zaman kullan / KULLANMA

**Kullan:** çok-eksenli denetim (admin panel, güvenlik, RLS, a11y), repo-geneli tarama ("şu kalıbı her
yerde bul"), geniş araştırma, Claude kotasını korumak istediğin pahalı fan-out işleri.

**KULLANMA:** tek dosya bakışı, tek CodeGraph çağrısının cevapladığı soru, yalnız Claude'un yapabileceği
derin akıl yürütme, ya da hassas/yıkıcı değişiklik (agy `always-proceed` ile dosya yazabilir — sadece
**okuma/analiz** ya da kontrollü dosya-çıktısı için kullan).

---

## Ön koşullar (bir kez doğrula)

```bash
command -v agy && agy --version          # agy kurulu mu
command -v winpty                         # winpty (Git Bash) var mi
```
- agy config (`~/.gemini/antigravity-cli/settings.json`): `toolPermission: always-proceed`,
  `trustedWorkspaces` içinde repo yolu olmalı → o zaman agy araçları **sormadan** çalışır,
  `--dangerously-skip-permissions` bayrağına **gerek yok** (ve o bayrak Claude'un freni tarafından engellenir).
- Claude tarafı izinleri (kullanıcı ekler): `Bash(agy *)`, `Bash(winpty *)`, `Bash(bash *agy-run.sh*)`,
  `Bash(bash *agy-fanout.sh*)`. (Wildcard exec kuralını ajan kendi ekleyemez; kullanıcı ekler.)
- Model: agy varsayılanı **Gemini 3.5 Flash (High)**. `--model` ile değiştirilebilir, `agy models` ile listelenir.

---

## MOD B — Dosya-Çıktılı Öz-Orkestrasyon  ★ ÖNERİLEN ★

En sağlam yöntem. agy'ye **tek zengin direktif** verirsin; agy gerekiyorsa **kendi worker+judge
alt-ajanlarını kurar**, tarar, ve **raporu repo'da bir `.md` dosyasına yazar**. Sen stdout yakalamazsın
(winpty derdi yok) — dosyayı **okursun**. agy bunu zaten yapabiliyor (brain dizininde worker_*.md /
judge_*.md üretir; halüsinasyon-denetimi bile yapar).

**Direktif şablonu** (agy'ye `--print` ile ver):

```
Sen bir ORKESTRATORSUN. Gorev: <KONU> denetimi/taramasi.
1. Su persona(lar)i benimse: .agent/rules/subagents.md icindeki <persona_adlari>.
   §0 Ortak Calisma Sozlesmesi'ni (cikti kontrati, siddet rubrigi, anti-halusinasyon) UYGULA.
2. Kapsam: <dizin/dosyalar>. SADECE gercekten actigin dosyadan, dosya:satir vererek bulgu uret; uydurma.
3. Gerekiyorsa kendi worker alt-ajanlarini kur (paralel tara), sonra bir judge ile bulgulari
   halusizasyon-denetiminden gecir (repo gercegiyle kiyasla).
4. Raporu TAM SU DOSYAYA yaz (baska yere DEGIL):
   C:/Users/alize/venthub-hvac/docs/audits/agy-<konu>-<YYYY-AA-GG>.md
   Bicim: §0.1 cikti kontrati — her bulgu tek satir [siddet] dosya:satir | guven | sorun | duzeltme.
5. Bitince SADECE su satiri yaz: "RAPOR YAZILDI: <yol>"
```

Çalıştır (inline, doğrudan — subshell yok):
```bash
cd /c/Users/alize/venthub-hvac
winpty -Xallow-non-tty agy --print "<yukaridaki direktif>"
```
Sonra **raporu oku ve doğrula:**
```bash
# 1) hedef dosyayi oku
Read docs/audits/agy-<konu>-<tarih>.md
# 2) bulunamazsa agy brain dizinine bak (agy bazen oraya yazar):
ls -t ~/.gemini/antigravity-cli/brain/*/  | head
```
→ Ardından her şüpheli/`DOĞRULANMALI` bulguyu **CodeGraph ile teyit et** (aşağı bkz), yanlış pozitifleri
ele, tek rapora indir.

---

## MOD A — Stdout Fan-Out (yedek)

Birden çok ekseni ayrı agy çağrılarıyla koşturup stdout'u yakalarsın. Daha kırılgan (winpty araliklidir)
ama hızlı küçük taramalar için pratik.

**Tek eksen (inline, en güvenilir):**
```bash
cd /c/Users/alize/venthub-hvac
winpty -Xallow-non-tty agy --print "<persona+§0+kapsam+gorev>" > /c/tmp/eksen.raw 2>/dev/null
perl -pe 's/\e\][^\a]*\a//g; s/\e\[[0-9;?]*[ -\/]*[@-~]//g; s/\r//g' /c/tmp/eksen.raw
```

**Çok eksen (wrapper ile):**
```bash
# her satir: AD<TAB>PROMPT
printf 'rbac\t<prompt1>\ni18n\t<prompt2>\n' | \
  bash .claude/skills/agy-orchestrate/scripts/agy-fanout.sh /c/Users/alize/venthub-hvac /c/tmp/agy-out
# sonra: cat /c/tmp/agy-out/*.md
```
Tek prompt için convenience: `bash .claude/skills/agy-orchestrate/scripts/agy-run.sh "PROMPT" "REPO" "OUT"`.

---

## Teknik Reçete & TUZAKLAR (acıyla öğrenildi)

1. **SUBSHELL = ÖLÜM (en sık hata).** `winpty`'yi bir subshell içine alırsan konsol boyutu kaybolur
   (`Assertion failed: cols>0 && rows>0`) → çıktı **boş**. Subshell sayılanlar: `( ... )` parantez **VE**
   `$( ... )` komut-ikamesi (yani `out=$(winpty ...)` BOZUKTUR!). Daima **`>` ile dosyaya yaz**, sonra dosyayı
   oku/temizle. `for` döngüsü ve `>` yönlendirme sorun değil; `( )` ve `$( )` sorun.
2. **winpty stdout araliklidir** — bazen konsol alamaz, boş döner. Çözüm: **boş gelirse retry** (scriptlerde var),
   ya da daha iyisi **MOD B (dosya-çıktı)** kullan; orada stdout'a hiç güvenmezsin.
3. **ANSI temizliği** şart: `perl -pe 's/\e\][^\a]*\a//g; s/\e\[[0-9;?]*[ -\/]*[@-~]//g; s/\r//g'` (OSC başlık + CSI + CR).
4. **TEHLİKELİ bayrak yok:** `--dangerously-skip-permissions` Claude'un freni tarafından engellenir VE gereksiz
   (agy config `always-proceed`). Kullanma.
5. **Konuşma SQLite'ta saklanır** (`~/.gemini/antigravity/conversations/*.db`, geçerli SQLite, payload protobuf).
   Stdout tümüyle kaçarsa son çare buradan okumak — ama protobuf ayrıştırma kırılgan; MOD B çok daha temiz.
   Python ile açarken **Windows yolu** ver (`C:/...`), MSYS yolu (`/c/...`) "unable to open" verir.
6. **Kullanıcının açık agy oturumu** (interaktif, başka terminalde) ayrı bir `agy.exe` süreci olabilir —
   onu **öldürme**; sadece kendi başlattığın debug-portlu/headless süreçleri yönet.
7. **Süre:** `agy --print` varsayılan `--print-timeout 5m`. Analiz görevleri ~6-60sn. Bash timeout'u buna göre ayarla;
   çok eksenliyi `run_in_background` ile koştur.

---

## Doğrulama Disiplini (orkestratörün asıl işi)

agy çıktısı **ham girdidir, gerçek değil.** Kullanıcı kuralı: *"sen kontrol edersen gereksiz iş olmaz."*
Her bulguyu — özellikle `kritik` ve `DOĞRULANMALI` işaretlileri — CodeGraph ile sına:

- `codegraph_explore "<dosya/sembol>"` → gerçek kaynağı gör (guard var mı, satır doğru mu).
- `codegraph_callers <Bileşen>` → "ölü kod" iddiasını test et. **Uyarı:** JSX render edge'i CodeGraph'ta
  görünmeyebilir → "0 caller" mutlak değil; silmeden önce `grep -r "Bileşen"` ile import teyidi.
- **Nüans yakala:** Flash şiddeti şişirir. Örnek (gerçek): `hasWriteAccess={true}` hardcoded ama yazma
  handler'ı boş no-op → "kritik güvenlik" değil "yanıltıcı UI". İstemci guard eksikse RLS'i kontrol et (§0.4).

Sonra: tekrarları birleştir, yanlış pozitifleri at, şiddet/güven etiketle, **önceliklendirilmiş tek rapora** indir.

---

## Persona Kütüphanesi  → `.agent/rules/subagents.md` (v2)

Direktifte persona adıyla çağır; her biri §0 sözleşmesini + numaralı kontrol listesini taşır:

| Persona | Alan |
|---------|------|
| `rls_security_auditor` | DB/RLS, kiracı izolasyonu, golden triad, monoton statü |
| `r3f_3d_rendering_expert` | R3F/WebGL, gölge, CSP/CDN, Suspense, GPU sızıntı |
| `hvac_calculation_engineer` | HVAC formül doğruluğu, EN/ASHRAE/ISO, birim, uç durum |
| `webhook_integration_auditor` | Edge/webhook, HMAC, replay guard, iyzico, idempotency |
| `performance_token_architect` | Next.js cache (lang+tenantId), token, focus-visible, CLS |
| `admin_ux_consistency_auditor` | Admin RBAC-UI, audit log, tasarım sistemi, i18n, a11y, ölü kod |

Yeni alan gerekince persona'yı **subagents.md içinde** tanımla (kök dizine `agents/` açma — proje kuralı).

---

## Çıktı Konvansiyonu

Doğrulanmış sentez raporu → `docs/audits/<konu>-<YYYY-AA-GG>.md`. agy'nin ham çıktısı → `docs/audits/agy-*`
ya da `/c/tmp/agy-out/` (geçici). Rapor başında **yöntem** (agy fan-out + CodeGraph doğrulama) ve
**doğrulama lejantı** (✅ kesin / ⚠️ doğrulanmalı / ✏️ şiddet düzeltildi) bulunsun.

---

## Komut Cheat-Sheet

```bash
agy --version; agy models                       # surum / model listesi
command -v winpty                                # on kosul
cd /c/Users/alize/venthub-hvac                   # repo'da calis (trustedWorkspace)
# MOD B (onerilen): agy raporu dosyaya yazsin, sen oku
winpty -Xallow-non-tty agy --print "<orkestrator direktifi: raporu docs/audits/...md'ye yaz>"
# MOD A tek eksen (inline):
winpty -Xallow-non-tty agy --print "<prompt>" > out.raw 2>/dev/null; perl -pe '...ANSI...' out.raw
# MOD A cok eksen:
printf 'ad\tprompt\n' | bash .claude/skills/agy-orchestrate/scripts/agy-fanout.sh REPO OUTDIR
# auth: agy Google ile login. Hata olursa kullanici: agy (interaktif) ile giris yapar.
```

## Sorun Giderme

- **Boş çıktı:** winpty konsol alamadı → retry; ya da MOD B'ye geç (dosya-çıktı).
- **`Assertion ... cols>0`:** subshell `( )` kullandın → doğrudan çağrıya çevir.
- **agy izin/oturum hatası:** `agy` interaktif çalıştırılıp Google login yenilenmeli (kullanıcı yapar).
- **Rapor dosyası yok:** agy brain dizinine yazmış olabilir → `ls -t ~/.gemini/antigravity-cli/brain/*/`.
- **"unable to open database":** SQLite'ı MSYS yoluyla açtın → Windows yolu (`C:/...`) kullan.
