---
name: security-scanner
description: "Güvenlik taraması: sır, enjeksiyon, bağımlılık açığı, yetki; bulgular kanıtlı. Tetik: \"güvenlik tara\", \"sızıntı\", \"pnpm audit\"."
category: audit
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/security-scanner/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi (tek istisna: PEM başlığı maskelendi); 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/security-scanner/SKILL.md`, MIT lisansı. Aşağıdaki
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

## Selection card
- Task: Review source trust boundaries and defensive security.
- Start: Identify the scope and obtain an executable before-proof or review evidence.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Provide a defensive, evidence-led review of the requested source and configuration.
Separate confirmed findings, supported static concerns and validation gaps.
Use local, non-destructive tests of defensive behavior where appropriate.

## Rules

1. Identify scope, assets, entrypoints and trust boundaries. Read surrounding
   validators, authorization and cleanup before interpreting a scanner hit.
2. Give every finding a real location, reachable condition, violated contract,
   impact, evidence level and concrete remediation.
3. Severity follows impact, exposure and prerequisites. TLS, CORS or HTTP patterns
   are not automatically Critical without their deployed context.
4. Redact credentials completely where possible. A test directory can contain
   real leaked credentials; distinguish known dummy fixtures from genuine values.
5. Use the ecosystem's dependency audit and exact lockfile affected ranges when
   in scope. Audit output alone does not prove exploitable runtime usage.
6. Do not contact suspected credentials/services or build attack workflows.
   Prefer source evidence and bounded tests that verify protective contracts.

## Workflow

1. Map the requested surface and preserve current dirty work.
2. Collect candidates from available scanners and focused source searches.
   Exclude dependency/build trees from generic source scanning; inspect vendored
   or generated code only when it forms the actual requested boundary.
3. Trace untrusted inputs to privileged operations and protective checks.
   Check object-level authorization, logging/redaction, resource limits and
   lifecycle ownership where applicable.
4. For dependencies, verify official advisories and affected/resolved versions.
   Distinguish direct, transitive, build-only and production use.
5. Review each candidate independently for reachability and existing protection.
   Use non-destructive local negative tests; label untested deployment assumptions.
6. Report prioritized findings and precise defensive fixes. For review-only
   requests, leave production files unchanged; apply authorized remediation
   within scope and run the affected checks.

## Remediation principles

- Validate and authorize at the operation/data boundary.
- Use parameterized data queries and structured process arguments; identifiers
  still need explicit allowlists where the API cannot parameterize them.
- Use semantic DOM/text APIs for text and maintained sanitization for authorized HTML.
- Bound filesystem access to owned roots and enforce the correct path/ownership model.
- Keep secrets out of source, logs, artifacts and error responses. Removing a
  committed credential is incomplete without the owner's rotation/revocation process.
- Apply URL/origin policies and trusted service boundaries according to real deployment.

## Report

| Severity | Location | Condition / impact | Evidence | Defensive fix |
|---|---|---|---|---|
| <level> | <file:line> | <reachable scenario> | <source/test/advisory> | <concrete change> |

Include examined scope, rejected candidates, dependency-audit availability and
missing live configuration. “No confirmed findings in this scope” is a valid
result; do not claim the application is universally secure.

## Acceptance checks

- Verify defensive findings and fixes against scoped source evidence; state unresolved claims.

## Skills in scope

- code-review — changed-contract review.
- tech-stack — affected package versions.
- data-governance — sensitive data handling.
- testing — defensive regression checks.

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
