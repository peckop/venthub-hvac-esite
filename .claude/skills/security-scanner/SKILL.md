---
name: security-scanner
description: "Güvenlik taraması: sır, enjeksiyon, bağımlılık açığı, yetki; bulgular kanıtlı. Tetik: \"güvenlik tara\", \"sızıntı\", \"pnpm audit\"."
category: audit
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/security-scanner/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi (tek istisna: PEM başlığı maskelendi)"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/security-scanner/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `codebase-context` / `codebase-search` / `codebase-stats` | `codebase_context` / `codebase_search` / `codebase_stats` (tire yerine alt çizgi; `mcp__wrongstack-codebase-index__*`) |
| `codebase-repo-map` | `codebase_package_graph` ya da `graphify` |
| `codebase-incoming-calls` / `codebase-outgoing-calls` | `codebase_symbol_graph` ya da `codegraph_explore` |
| `codebase-impact-analysis` | `graphify affected "sembol()"` (**parantez şart**: parantezsiz "No unique node match" verir) |
| `codebase-targeted-test`, `codebase-skeleton` | Yok. Kapsayan testi değişen dosyanın yanında / `src/__tests__/` altında elle bul; iskelet için aralıklı `Read` |
| `<nextsteps>` etiketi | **Hiç üretilmez.** Bizde ayrıştırıcı yok; Recep'e rapor akan cümledir |
| `npm audit` (satır ~17, 23, 152, 179, 182, 190) | `pnpm audit` |
| `secret_scanner_test`, `security-ast-scan` araçları (satır ~67-68) | Yok. Sır için `scripts/security/secret-scan.py` (TÜM git geçmişini `git log --all -S` ile tarar); enjeksiyon/`eval`/ReDoS örüntüleri `Grep` ile |
| **PEM başlığı örneği (satır ~51 ve ~104)** | **MASKELENDİ** (kaynaktan tek fark): tam özel-anahtar başlığı `<PEM-ÖZEL-ANAHTAR-BAŞLIĞI>` yer tutucusuna çevrildi. Sebep: depo PUBLIC ve `secret-scan.py:69` bu deseni geçmişte arar; bir kez commit'lenen satır geçmişten silinemez |
| Ağ / veri çıkışı | Yok; tek dış temas `pnpm audit` (paket adı gider, sır gitmez) |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Fixture işaretleme (satır ~24, ~156, ~178):** public repoda gerçek sır test verisine girerse geri dönüş yoktur → fixture yalnız **uydurma olduğu doğrulanmışsa** işaretlenir.
2. **Skill'de olmayan, bizde zorunlu taramalar:** kural 11 (webhook handler'ında HMAC-SHA256 + replay guard var mı) ve kural 12 (okuma/yazma tenant-scoped mı; yetki kararı yalnız `app_metadata` üzerinden, kullanıcının kendi düzenleyebildiği meta veri asla).
3. Bulgu metnine sırrın KENDİSİ yazılmaz: yalnız dosya, satır ve "N karakterlik anahtar".
4. Salt-okuma tarar; düzeltme ayrı, onaylı iştir.

---

# Security Scanner

## Overview

Scans code, configs, and dependencies for security issues. Reports with severity (CRITICAL/HIGH/MEDIUM/LOW) and concrete remediation steps. Pairs with `npm audit` for supply chain scanning.

## Rules

1. Always provide remediation — "found X" without "do Y" is useless.
2. Verify regex matches before flagging — generic patterns cause false positives.
3. Don't scan `node_modules` — use `npm audit` for supply chain issues.
4. Don't flag test fixtures — mock credentials in tests are acceptable.
5. Always run dependency audit — supply chain is a real attack vector.
6. Flag config issues (TLS disabled, HTTP in production) as CRITICAL.
7. Never echo a full secret into the report — redact it (short prefix + char count, e.g. `ghp_…36 chars`). Cite `file:line` you have read; don't flag from a pattern guess.

## Patterns

### Do

```typescript
// ✅ SAFE — parameterized query
db.query("SELECT * FROM users WHERE id = $1", [userId]);

// ✅ SAFE — escape user input
element.textContent = userInput;

// ✅ SAFE — execFile with args array
execFile('find', ['.', '-name', userInput], { signal: AbortSignal.timeout(5000) });
```

### Don't

```typescript
// ❌ CRITICAL — hardcoded AWS credentials
const awsKey = "[REDACTED:aws_access_key]";

// ❌ CRITICAL — private key committed
const pem = "<PEM-ÖZEL-ANAHTAR-BAŞLIĞI>\nMIIE...";

// ❌ HIGH — XSS via innerHTML
element.innerHTML = userInput;

// ❌ HIGH — shell injection
exec(`find . -name ${userInput}`);

// ❌ HIGH — SQL injection
const query = "SELECT * FROM users WHERE id = " + userId;
```

## Workflow

```
1. Scope:  Accept paths or use sensible defaults
2. Secrets:  Credential patterns (plus the secret_scanner_test tool when that plugin is loaded)
3. Injection:  The security-ast-scan tool per file when available, then read every hit
4. Config:  Check TLS, crypto, auth configurations
5. Audit:  Run package audit
6. Report:  Prioritized markdown with remediation
```

## Severity levels

| Level | Meaning | Action |
|-------|---------|--------|
| **CRITICAL** | Active exploit possible | Fix immediately |
| **HIGH** | Vulnerability likely exploitable | Fix before release |
| **MEDIUM** | Risk exists but harder to exploit | Fix soon |
| **LOW** | Best practice violation | Consider fixing |

## Secret patterns

```
| Pattern | Example | Level |
|---------|---------|-------|
| GitHub token | `ghp_[a-zA-Z0-9]{36}` | CRITICAL |
| AWS Access Key | `(AKIA|ASIA)[0-9A-Z]{16}` | CRITICAL |
| AWS Secret | base64 40-char | CRITICAL |
| Private Key PEM | `-----BEGIN.*PRIVATE KEY-----` | CRITICAL |
| JWT | `eyJ[a-zA-Z0-9_-]+` | HIGH |
| Generic API Key | 32+ random chars | MEDIUM |
| Bearer token | `Authorization: Bearer xxx` | HIGH |
```

## Real examples

```typescript
// ❌ CRITICAL — hardcoded AWS credentials
const awsKey = "[REDACTED:aws_access_key]";

// ❌ CRITICAL — private key committed
const pem = "<PEM-ÖZEL-ANAHTAR-BAŞLIĞI>\nMIIE...";

// ❌ HIGH — JWT in code
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ❌ HIGH — XSS via innerHTML
element.innerHTML = userInput;

// ❌ HIGH — shell injection
exec(`find . -name ${userInput}`);

// ❌ HIGH — SQL injection
const query = "SELECT * FROM users WHERE id = " + userId;

// ✅ SAFE — parameterized query
db.query("SELECT * FROM users WHERE id = $1", [userId]);

// ✅ SAFE — escape user input
element.textContent = userInput;
```

## Injection vectors

| Construct | Safe alternative |
|-----------|-------------------|
| `eval(str)`, `new Function(str)` | Parse instead (`JSON.parse`, a real parser); `new Function` evaluates strings exactly like `eval` |
| `innerHTML = x` | `textContent` or DOMPurify.sanitize |
| `exec(\`cmd ${input}\`)` | `execFile` with args array |
| `SQL = "SELECT * FROM " + table` | parameterized query |
| `fs.readFile(path + userInput)` | `path.resolve` + allowlist |
| `fetch(userSuppliedUrl)` (SSRF) | Allowlist hosts; block private, loopback, and metadata addresses after DNS resolution |
| `Object.assign(target, JSON.parse(body))` (prototype pollution) | Reject `__proto__` and `constructor` keys; validate with a schema |
| `/orders/:id` loaded without an ownership check (broken object-level authorization) | Authorize against the specific object on every request |
| `new RegExp(userInput)`, nested quantifiers on user input (ReDoS) | Escape input, bound its length, use linear-time patterns |

## Configuration checks

```
- TLS verification disabled? → CRITICAL for production
- HTTP instead of HTTPS? → MEDIUM for production
- Secrets in env vars logged to console? → CRITICAL
- Hardcoded credentials in config? → CRITICAL
- Overly permissive CORS? → MEDIUM
- Missing rate limiting? → MEDIUM-HIGH
```

## Anti-patterns

- **Don't scan `node_modules`** — use `npm audit` instead
- **Don't report without remediation** — "found X" is useless without "do Y"
- **Don't ignore false positives** — verify regex matches before flagging (especially generic patterns)
- **Don't skip dependency scanning** — supply chain is a real attack vector
- **Don't flag test fixtures** — mock credentials in tests are ok, but not in production code

## Remediation template

```
## Remediation Checklist
- [ ] Remove hardcoded credentials from `src/config.ts`
- [ ] Move secrets to environment variables, add to .gitignore
- [ ] Use parameterized queries in `src/db/` files
- [ ] Add rate limiting to `src/api/` routes

<nextsteps>
1. Fix the hardcoded API key in src/config.ts
2. Fix the shell injection in src/auth/login.ts
3. Fix the missing rate limiting in src/api/routes.ts
</nextsteps>
```

## Out of scope

- **Don't echo a full secret in the report.** Redact. A `ghp_…36 chars` is enough for the reader to find and rotate it. The unredacted value in a report is itself a leak.
- **Don't flag a `file:line` you haven't read.** Generic patterns cause false positives; verify the line is real before reporting. No "looks like a secret" findings.
- **Don't flag test fixtures as leaked secrets.** Mock credentials in `tests/` and `__fixtures__` are expected. Skip them; flag leaks in production code.
- **Don't scan `node_modules`.** Use `npm audit` / `pnpm audit` for supply chain. Grepping `node_modules` is a noise machine.
- **Don't report without remediation.** "Found X" without "do Y" is a finding the user has to research themselves. Always include the fix.
- **Don't claim CRITICAL without proof of exploitability.** Severity ladders are real. A pattern hit is a lead, not a warrant. State the input that triggers the bug and the consequence.
- **Don't bypass dependency audit.** Supply chain is an attack vector; skipping `npm audit` / lockfile review is skipping the scanner.
- **Don't disable TLS or relax auth configs as a "config option" without flagging CRITICAL.** TLS disabled in production is a CRITICAL, not a config note.

## Before returning

- [ ] Every `file:line` opened and confirmed; no flag from a regex guess
- [ ] Secrets redacted in the report (prefix + char count, never the value)
- [ ] Test fixtures skipped for secrets; flagged only for leak/unawaited patterns
- [ ] `node_modules` not scanned; supply chain via `npm audit` / lockfile review
- [ ] Every finding carries a remediation; "found X" without "do Y" not shipped
- [ ] Severity passes the ladder; CRITICAL reserved for proven exploitability
- [ ] Dependency audit included; CVE/version drift covered
- [ ] TLS / HTTP / CORS / rate-limit configuration checked and reported
- [ ] False-positive rate called out with a cause when it exceeds 30%
- [ ] Summary counts match the findings listed; `<nextsteps>` mirrors them in severity order

## Skills in scope

- `bug-hunter` — for general code quality bugs found during security scan
- `audit-log` — for dependency version audit trails
- `git-flow` — for committing security patches properly
- `output-standards` — for standardized `<nextsteps>` formatting

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
