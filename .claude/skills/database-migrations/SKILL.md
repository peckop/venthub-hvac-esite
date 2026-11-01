---
name: database-migrations
description: "Şema migration yöntemi: expand/backfill/validate/contract, sınırlı toplu doldurma; geri alma veriyi geri getirmez; bizde migration = prod (kural 13). Tetik: \"şema değişikliği\", \"kolon tipi değiştir\", \"index ekle\", \"backfill\". Dosya adımı create-migration. WrongStack 1.1.0 uyarlaması."
category: quality
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/database-migrations/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-12 (YTN-18, OPS onayı 12 Ekim ilk dalga) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/database-migrations/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| "fresh database / representative existing schema" (Workflow 3-4) | Bizde yerel Supabase yığını (Docker) **yok**, adım uygulanamaz. Yerine: `create-migration` zinciri + `plan-challenger`; prod'a karşı **yalnız okuma** sorgusu; "uygulandı" ancak birleşme sonrası ve ölçülerek yazılır (kural 13) |
| "generate migrations with the project's tool" | Dosya `supabase/migrations/YYYYMMDDHHMMSS_ad.sql` (14 hane; 8 haneli biçim INV-MIGRATION-2'de KIRMIZI); adımlar `create-migration` skill'inde |
| "backup/restore" | Supabase yedeği var olması geri yükleme **denendi** demek değildir; bizde geri yükleme provası ölçülmedi, güvence verilmez |
| `data-governance`, `api-design`, `testing`, `observability` | Bizde var |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Kural 13:** migration içeren dal master'a birleşince `supabase-migrate.yml` prod'a OTOMATİK uygular; migration'lı PR yalnız Recep onayıyla birleşir. Bu skill planı çıkarır, uygulamaz (kaynak kural 6 ile aynı yön).
2. Yıkıcı daraltma (DROP, NOT NULL, tip değişimi) expand → backfill → validate → contract sırasıyla **ayrı PR'lara** bölünür; her aşama kendi onayını ister.
3. Yeni tabloda RLS ve tenant kapsamı (kural 12) aynı migration'da yazılır; `supabase-security` skill'i.
4. Vitrinde görünen tabloyu değiştiren migration'da veri değişir ama statik sayfa değişmez: tetik ve webhook dalı için `docs/standards/rendering-cache-standard.md` okunur.

---

# Database Migrations

## Selection card
- Task: Deploy compatible schema changes and backfills.
- Start: Identify the data owner, query/schema, consistency and recovery contract.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Ship schema changes that preserve data and work across deployment overlap.
Database engine, version and migration tool determine transactional DDL,
locking, index creation and rollback behavior.

## Rules

1. Inspect the current schema, migration history, engine/version, ORM and real
   readers/writers. Do not assume every DDL operation is transactional.
2. Use expand/backfill/validate/contract where old and new code overlap.
   Destructive contraction needs verified consumer retirement and a recovery plan.
3. Estimate lock/write amplification and data volume. Use bounded batches,
   stable progress keys, idempotency and checkpointed restart for large backfills.
4. Separate data restoration from a down migration. Dropped information cannot
   be recreated merely by reversing a schema statement.
5. Plan backup/restore or forward repair, monitor progress and define abort
   conditions. A backup existence check is not a tested restoration.
6. Use local fixtures or an authorized isolated database for verification;
   a migration plan does not authorize production execution.

## Workflow

1. Record invariants and compatibility across the old/new application versions.
2. Generate migrations with the project's tool and inspect resulting SQL,
   lock behavior, constraints and index strategy for the actual engine.
3. Apply to a fresh database and a representative existing schema.
4. Inject failure/restart in a bounded backfill and verify no omissions/duplicates.
   Compare row counts, constraints and important application queries.
5. Exercise rollback where reversible; otherwise test the documented forward
   repair/restore in the isolated environment.
6. Report migration commands, data verification, estimated production impact
   and the execution boundary.

## Sources

[PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
is an engine-specific reference; use the selected engine's current documentation
and exact version for operational decisions.

## Acceptance checks

- Prove old/new application compatibility, backfill repeatability, migration ordering and a recovery path.

## YTN-24 eki: kaldırma kanıtı, yıkıcı adım ayrı, sınırlı doldurma (VentHub'a uyarlandı)

Kural 2-3'ün ve ek kural 2'nin üstüne yalnız eksik üç madde:

1. **Kaldırmadan önce kullanım sıfır kanıtı.** Sütun, tablo ya da fonksiyon düşmeden önce okuyan/yazan kalmadığı ölçülür: kod tarafında CodeGraph ya da graphify ile çağıranlar ve referanslar, çalışma tarafında Sentry ve log kayıtlarında erişim izi. "Aramada çıkmadı" yetmez; hangi araçla neye bakıldığı karta yazılır, ölçülemeyen kısım "ölçemedim" diye geçer.
2. **Ekleme güvenli, yıkıcı adım ayrı ve sonraki PR.** Yeni nullable sütun, yeni tablo, yeni index gibi eklemeler tek başına güvenlidir. Sütun düşürme ve yeniden adlandırma ayrı bir migration PR'ıdır ve kodda eski şekle referans kalmadıktan SONRA açılır; aynı PR'a "ekle ve eskisini düşür" konmaz.
3. **Doldurma toplu ve sınırlı, büyük index eşzamanlı.** Backfill tek `UPDATE` ile değil, sınırlı parçalarla ve hız kısıtıyla yürür. Büyük tabloda index yazmayı kilitlemeden `CREATE INDEX CONCURRENTLY` ile kurulur; bu komut işlem bloğu içinde çalışmaz, o yüzden migration aracının onu nasıl yürüttüğü önce doğrulanır.

Geri dönüş planı yazılıdır (geri alma veriyi geri getirmez): her migration için yanlış giderse ne yapılacağı, ileri düzeltme ya da yedekten dönüş olarak karta yazılır.

Yeni siteye geçiş (OPS-180) planı yazılırken bu bölüm `observability`'deki YTN-24 eki ile birlikte okunur.

Kaynak: addyosmani/agent-skills deprecation-and-migration @8bfcc1f9916f2eea55494d8c1fa7f4bde867dd9e (MIT)

## Skills in scope

- data-governance — ownership, retention and classification.
- api-design — compatibility for clients.
- testing — migration and restart evidence.
- observability — rollout signals.

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
