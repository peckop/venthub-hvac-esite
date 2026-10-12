---
name: data-governance
description: "Veri yönetişimi: kişisel veri, saklama ve imha, KVKK, tablo sahipliği ve RLS. Tetik: \"KVKK\", \"kişisel veri\", \"saklama süresi\"."
category: audit
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/data-governance/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi; 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/data-governance/SKILL.md`, MIT lisansı. Aşağıdaki
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
| "Her varlığın TEK sahibi servis, ortak tablo yok" (satır ~25, 61-62, 77, 87, 98, 103) | **Bizde uygulanmaz.** VentHub tek Supabase DB'sidir; Next servisleri, Edge fonksiyonları ve RLS aynı tabloları okur. Olduğu gibi uygulansa her tablo "ihlal" çıkardı. Yerine: **tablo sahibi = departman/servis katmanı + RLS + tenant kapsamı** (kural 12) |
| `logger.info` örneği (satır ~36-46) | Bizim yığına uymaz (gözlem aracı Sentry); örnek, ilke geçerli |
| GDPR dili ("right to erasure", satır ~29, 109) | KVKK karşılığı: silme, yok etme, anonimleştirme, saklama-imha politikası |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Kural 13 ile çelişme yok. MEVZUAT departmanına uymaz (onun işi teknik HVAC mevzuatı).
2. Kişisel veri içeren değişiklik DB'ye dokunuyorsa `create-migration` + `plan-challenger` zinciri.

---

# Data Governance

Designs and reviews data governance for services and data stores: schema ownership, PII handling, retention, lineage, access policy, and migration safety.

## Selection card
- Task: Define data ownership, retention and PII boundaries.
- Start: Identify the data owner, query/schema, consistency and recovery contract.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Establishes who owns each data entity, how sensitive fields are classified and protected, how long data is retained, and how schema changes ship without losing or leaking data. Produces concrete policy plus code-level guardrails, not prose.

## Rules

1. Every persisted entity has an accountable owner. Respect existing service/module boundaries and documented shared-store contracts.
2. Classify every field: public, internal, sensitive, or restricted (PII/credentials). Restricted fields are encrypted at rest and redacted in logs.
3. Never log or echo restricted fields — redact at the serialization boundary, not at each call site.
4. Every schema change ships with a forward migration and a tested recovery plan; destructive drops are two-phase (deprecate → drop) across releases.
5. Retention is explicit per entity: define a TTL/purge cadence and honor deletion requests (right-to-erase) with a verifiable purge path.
6. Lineage: a field's origin and transformations are traceable; derived data records its source columns/versions.

## Patterns

### Do

```typescript
// ✅ Classify + redact at the boundary
interface UserRecord {
  id: string; // internal
  email: string; // restricted (PII) — encrypted at rest
  createdAt: string; // internal
}
function toLog(u: UserRecord) {
  return { id: u.id, email: '[redacted]', createdAt: u.createdAt };
}
```

```sql
-- ✅ Two-phase destructive change: deprecate first, drop next release
ALTER TABLE sessions ADD COLUMN legacy_data_deprecated_at timestamptz; -- phase 1
-- (next release, after backfill + verification)
-- ALTER TABLE sessions DROP COLUMN legacy_data;                       -- phase 2
```

### Don't

```typescript
// ❌ Log the whole record — leaks PII into the log stream
logger.info('user', user);

// ❌ Shared-table cross-service read — bypasses the owning service's policy
db.query('SELECT email FROM users WHERE ...'); // from a service that doesn't own users
```

## Workflow

```
1. Inventory:  List entities, owning service, and field classifications
2. Policy:     Define retention/TTL, access rules, encryption-at-rest for restricted fields
3. Guardrails: Redaction at the serialization boundary, audit log for restricted access
4. Migration:  Forward + rollback plan; destructive changes two-phase
5. Verify:     Purge-path test (right-to-erase), redaction test, migration dry-run
```

## What to look for

- **Orphaned ownership**: a table no service claims, or two services writing the same table
- **PII in logs/errors**: restricted fields appearing in log lines, stack traces, or error payloads
- **Missing retention**: data kept forever with no TTL or purge path
- **One-phase drops**: `DROP COLUMN`/`DROP TABLE` shipping without a deprecate-first phase
- **Untraceable lineage**: derived tables with no record of source columns/versions

## Boundaries

Keep retention, access and recovery rules proportional to the actual data and
applicable product policies. Do not force a new service architecture or claim
that a destructive schema rollback can recover dropped information. Centralize
redaction and verify its reach across logs, exports and derived storage.

## Before returning

- [ ] Every persisted entity has an accountable owner and documented access boundaries
- [ ] Every field classified as public / internal / sensitive / restricted
- [ ] Restricted fields protected at rest according to policy; redacted at the serialization boundary
- [ ] No restricted fields in logs, errors, or stack traces
- [ ] Schema changes have forward migration + tested recovery/rollback where reversible
- [ ] Destructive changes are two-phase: deprecate → drop across releases
- [ ] Retention TTL/purge cadence explicit per entity; right-to-erase path verifiable
- [ ] Derived data records source columns/versions; lineage queryable
- [ ] Dry-run run on the migration before Phase 2 ships
- [ ] `<nextsteps>` lists each open migration, classification gap, or retention fix

## Recovery and deletion semantics

Define an accountable owner per entity without forcing a microservice architecture
onto a monolith. Map sensitive fields through caches, exports, replicas, backups
and derived data, and state deletion/retention exceptions explicitly.
Do not claim a destructive migration is reversible when dropped data needs restore.
Use the database engine's actual DDL/locking rules and test forward repair or
restoration. Record the recovered data boundary and last verified restore.

## Skills in scope

- `security-scanner` — for encryption-at-rest, secret handling, and access-control review
- `audit-log` — for verifying restricted-access audit trails and retention evidence
- `api-design` — for owning-service API boundaries instead of shared tables
- `testing` — for redaction, purge-path, and migration tests

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
