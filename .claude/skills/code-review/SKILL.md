---
name: code-review
description: "PR, dal, commit aralığı ya da mevcut diff'i doğruluk, güvenlik ve bakım açısından SALT-OKUMA ile inceler. Tetik: \"code review\", \"PR'ı incele\", \"merge'e hazır mı\", \"değişikliklerime bak\". WrongStack 1.1.0 uyarlaması."
category: audit
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/code-review/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 2) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi; 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/code-review/SKILL.md`, MIT lisansı. Aşağıdaki
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
| Diff tabanı | `python .claude/skills/diff-review/scripts/check_diff_rules.py` (dalın merge-base'ine göre tarar, `--taban <dal>` verilebilir) ve `git diff <taban>...HEAD` |
| `chimera` atfı ("automatic post-session review format") | Bizde otomatik koşma yok; `chimera` talep üzerine çalışır |
| `security-scanner` atfı | Sonraki alım PR'ında gelir; o zamana kadar güvenlik taraması için `security-review` ve `scripts/security/secret-scan.py` |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Salt-okuma: inceleme sırasında dosya düzenlenmez, commit/push yapılmaz.
2. Migration içeren diff'te kural 13 hatırlanır: merge prod'a otomatik yazar; bulgu listesine "migration var, Recep onayı gerekir" satırı yazılır (skill bunu atlamıyor, yalnız sözleşmeyi okutuyor).
3. Bulgu = kırılma girdisi + sonucu; kanıtsız "şüpheli" bulgu olarak değil gözlem olarak yazılır.

---

# Code Review

## Selection card
- Task: Review implementation correctness and maintainability.
- Start: Identify the scope and obtain an executable before-proof or review evidence.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

A review finds what the author can't see from inside the change: inputs they
didn't consider, callers the change breaks, security holes, and design that will
be expensive to live with. It is read-only unless the user asks for fixes.

This is the on-demand review of any change set. `chimera` is the automatic
review of files changed during a WrongStack session.

## Rules

1. Pin the change set exactly — `git diff <base>...HEAD` for a branch, the PR
   diff, or staged plus unstaged changes locally — and state the base you
   reviewed against.
2. Learn the intent first: PR description, linked issue, commit messages. Judge
   the change against what it is meant to do.
3. Read changed code in context — the whole function, its callers, and its
   tests — not only the diff hunks.
4. Check the blast radius. For every changed signature, return shape, thrown
   error, default value, or config key, find the callers (the
   codebase-impact-analysis or codebase-incoming-calls tool when the index
   exists, grep otherwise) and confirm they still work.
5. Every finding cites `file:line`, names the input or scenario that breaks and
   the consequence, and proposes a concrete fix. Without a scenario it is a
   question, and should be asked as one.
6. Rank by severity — blocking, should fix, nit — and keep nits few so they
   never bury a blocker.
7. Skip what the formatter and linter already enforce.
8. Say what you verified and what you did not.
9. Stay read-only unless the user asks for fixes.

## What to check, in priority order

1. **Correctness** — conditions and boundaries, null, empty and very large
   inputs, error paths, awaited async work and ordering, concurrency, resource
   cleanup, behaviour on retry.
2. **Contracts** — public API, schema, and config changes; migrations and their
   rollback; callers updated; backwards compatibility.
3. **Security** — validation at trust boundaries, object-level authorization,
   injection (SQL, shell, HTML, paths), secrets, SSRF, sensitive data in logs.
4. **Tests** — something fails without this change; edge and error cases
   covered; assertions on behaviour.
5. **Operability** — errors carry context, logs or metrics where diagnosis will
   need them, timeouts on I/O, a way to turn risky behaviour off.
6. **Maintainability** — an existing helper duplicated (search before accepting
   a new one), naming, dead code, comments that explain why.
7. **Performance** on hot paths — N+1 queries, unbounded loads, blocking I/O on
   request paths.

## Workflow

1. **Scope** the change set and the base.
2. **Intent** from the description, issue, and commits.
3. **Map** the diff: list files, group them by concern, and skim everything once
   before commenting.
4. **Deep read** in the priority order above, with blast-radius checks.
5. **Run what is cheap and allowed** — type check, lint, and the covering tests
   (the codebase-targeted-test tool finds them).
6. **Write** the review.

## Output

```text
## Review — feature/retry-charges against main

**Verdict:** Request changes
Adds automatic retries to card charges; the retry path can double-charge.

### Blocking
1. src/billing/charge.ts:88 — each retry sends a new charge without an idempotency
   key, so a timeout after the provider accepted the first attempt charges twice.
   → Send `idempotencyKey: order.id` on every attempt.

### Should fix
2. src/api/orders.ts:41 — `limit` is not capped; `?limit=100000` loads the whole table.
   → Clamp it to 100.

### Nits
3. src/billing/charge.ts:12 — rename `tmp` to `pendingCharge`.

### Verified
Type check and the billing tests pass. End-to-end suite not run.
```

When nothing blocks, say so plainly. A short approval is a complete review.

## Anti-patterns

- **Reviewing only the hunks** without the surrounding code and callers.
- **Style-only reviews** that miss the bug.
- **Vague comments** — "this looks off", "consider refactoring".
- **Speculation stated as fact.**
- **Redesigning the change** to personal preference.
- **Approving without reading the tests.**

## Before returning

- [ ] Change set and base stated; intent understood
- [ ] Changed code read in context; callers of changed contracts checked
- [ ] Every finding has `file:line`, a breaking scenario, and a fix
- [ ] Severity ranked; nits few and labelled
- [ ] What was and wasn't verified is stated
- [ ] No files modified unless fixes were requested

## Evidence identity

Read both tracked changes and relevant untracked additions for a local review;
git diff alone omits untracked files. Pin the reviewed head/base and preserve
pre-existing edits. Use merge-base semantics for branch intent and exact-head
CI for release decisions. A green check for an older revision cannot approve
the current diff. Separate source-supported concerns from tested failures.

## YTN-21 eki: yapısal çare, değişiklik boyu, bağımlılık disiplini

Filo kuralı: önce yerleşik `/code-review`; bu bölüm onunla çakışmaz, yalnız yapısal çare, boyut eşiği ve bağımlılık bakışını ekler.

**Yapısal çare.** Yapısal sorun bulunduğunda yalnız sorunu değil hamleyi de öner; "karmaşık" demek yazarı tahmine bırakır. Adlandırılmış çareler: koşul zincirini tipli modele ya da açık dağıtıcıya çevir; yinelenen dalları tek akışa indir; orkestrasyonu iş mantığından ayır; kavrama özgü mantığı paylaşılan modülden sahibi olan pakete taşı; yakın kopya yerine kanonik yardımcıyı kullan; tip sınırını açık yaz ki aşağı akıştaki dallanma kaybolsun; açıklık katmayan geçiş sarmalayıcısını sil; yardımcı çıkar ya da büyük dosyayı odaklı modüllere böl. Hareketli parçayı azaltan çareyi, aynı karmaşıklığı başka yere yayan çareye tercih et.

**Değişiklik boyu.** Yaklaşık 100 satır iyi (tek oturumda okunur), yaklaşık 300 satır tek mantıksal değişiklikse kabul edilebilir, yaklaşık 1000 satır fazla büyüktür: böl. Dosya boyuna da bak: tek dosyanın toplam 1000 satırı civarı sert sınır değil inceleme sinyalidir; zaten büyük dosyayı büyüten değişiklikte önce çıkarma/ayırma sor. "Tek değişiklik" = tek şeyi çözen, ilgili testi taşıyan, teslimden sonra sistemi çalışır bırakan değişiklik. Bölme yolları: üst üste yığ (ardışık bağımlılık), dosya grubuna göre (farklı gözden geçiren), yatay (önce paylaşılan kod, sonra tüketici), dikey (özelliğin dilimleri). Büyüğü kabul edilebilir kılanlar: tam dosya silme ve gözden geçirenin yalnız niyeti doğruladığı otomatik yeniden düzenleme. Yeniden düzenleme ile yeni davranış iki ayrı değişikliktir. Bu eşikler ret gerekçesi değil bölme önerisidir; kural 14 gereği testi sonraya bırakmak için bölme kullanılmaz.

**Bağımlılık disiplini.** Yeni bağımlılık: standart kütüphane ve mevcut yardımcılar öncelikli, her bağımlılık bir yüktür; bakım durumu, bilinen açık, lisans uyumu sorulur. Mevcut bağımlılık yükseltmesi sıradan bir kod değişikliğidir; "bump deps" toplu birleştirmeleri en riskli olanıdır: (1) sürüm numarası değil değişiklik günlüğü okunur, majör yükseltmede geçiş notları; (2) değişiklik başına tek bağımlılık (kırılırsa suçlu belli, geri alma temiz); (3) kararı testler verir, "kuruldu" kanıt değildir, bağımlılığın davranışı etrafında kapsam inceyse asıl bulgu odur, önce test eklenir; (4) geçişli grafiğe bak, `package.json` değil kilit dosyası farkını incele; (5) kilit dosyasını dürüst tut, commit'le, elle düzenleme. Yerelde `pnpm install` ağır komuttur (BELLEK uyarısı varsa koşma); kilit dosyası farkı PR'da okunur. Güvenlik hükmü (typosquatting, ele geçirilmiş bakımcı) için `security-scanner`.

Kaynak: addyosmani/agent-skills code-review-and-quality @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)

## Gelen inceleme yorumunu uygulamadan önce doğrula

Bu bölüm sana gelen yorumlar içindir (inceleyen sen değilsin). Sıra: yorumun tamamını oku, her maddeyi kendi cümlenle yeniden söyle, sonra **kodla doğrula** (öneri bu depoda gerçekten doğru mu, mevcut davranışı bozar mı, mevcut yazımın bir nedeni var mı, inceleyen tam bağlamı görmüş mü). Yanlışsa uygulama; teknik gerekçeyle ve mümkünse çalışan bir test ya da kod parçasına işaret ederek itiraz et. Doğrulayamıyorsan bunu açıkça yaz ve nasıl ilerleyeceğini sor. Belirsiz bir madde varsa tahminle uygulama: ilişkili maddeler birlikte yanlış anlaşılır, belirsiz olanlar netleşene kadar hiçbirini uygulama. Netleşince sıra: önce bozucu ve güvenlik maddeleri, sonra basit düzeltmeler, sonra karmaşık olanlar; her biri ayrı sınanır. Öneri "düzgün yapalım" türündense önce kullanımına bak: çağıranı olmayan ucu genişletme, silmeyi öner. Doğru yorumda gösterişli teşekkür yerine yapılan düzeltmeyi yaz. Tartışma GitHub'da satır yorumunun kendi iş parçacığında yürür, üst düzey PR yorumunda değil.

Kaynak: obra/superpowers receiving-code-review @2ce8aa15d05bd57213e6f746f953aafb7ded7a8b (MIT)

## İkinci eksen: Spec ve kod kokusu tabanı (VentHub uyarlaması)

Bir değişiklik bir ekseni geçip ötekini kaldırabilir: bütün standartlara uyup yanlış şeyi yapan kod (Standards geçer, Spec kalır) ya da istenen şeyi yapıp proje düzenini bozan kod (Spec geçer, Standards kalır). İkisi **ayrı raporlanır, birleştirilmez, yeniden sıralanmaz**; tek bir "en kötü" seçilmez, eksen başına en kötü bulgu yazılır.

- **Sabit nokta:** kullanıcının verdiği ref, verilmediyse `origin/master`. `git diff <ref>...HEAD` (üç nokta, merge-base'e karşı) ve `git log <ref>..HEAD --oneline` bir kez alınır; ref çözülmüyor ya da fark boşsa burada dur.
- **Spec kaynağı, sırayla:** (1) PR gövdesindeki `Kanban: <ÖN EK>-<sayı>` kartı (KAYNAK/CETVEL, BİTİŞ ölçütü, kabul satırları); (2) kullanıcının verdiği yol; (3) `docs/plans/` ya da `docs/standards/` altında dal/özellik adıyla eşleşen belge. Hiçbiri yoksa Spec ekseni atlanır ve raporda "spec yok" yazılır.
- **Standards kaynağı:** `CLAUDE.md` kuralları 1-14, ilgili `docs/standards/*` ve `docs/roller/*-kurallar.md`. Belgelenmiş standart her zaman kazanır; araç (lint, tip, test) zaten zorluyorsa bulgu yazılmaz.
- **Kod kokusu tabanı (Fowler, *Refactoring* bölüm 3):** belgelenmiş standart olmasa da Standards eksenine her zaman eklenir; her biri "olası X" diye etiketli bir **yargı çağrısıdır**, sert ihlal değildir, belgelenmiş standart bir kokuyu onaylıyorsa susturulur. Gizemli ad → yeniden adlandır; Yinelenen kod → ortak şekli çıkar; Özellik kıskançlığı → yöntemi verinin yanına taşı; Veri öbekleri → tek tipte topla; İlkel takıntı → kavrama küçük tip ver; Tekrarlı switch → çok biçimlilik ya da paylaşılan tek harita; Dağınık değişiklik (Shotgun Surgery: bir değişiklik çok dosyada dağınık düzenleme gerektiriyor) → birlikte değişenleri tek modülde topla; Iraksak değişiklik (Divergent Change: bir modül birkaç ilgisiz sebeple düzenleniyor) → böl; Spekülatif genellik (spec'in istemediği soyutlama/parametre/kanca) → sil; Mesaj zincirleri (`a.b().c().d()`) → yürüyüşü birinci nesnenin arkasına sakla; Aracı sınıf (çoğunlukla devreden) → kes, asıl hedefi çağır; Reddedilen miras → kalıtımı bırak, bileşim kullan.
- **Alt ajan:** iki eksen paralel, salt-okuma ve `name` verilmeden açılabilir (her biri 400 sözcük altı). Standards ajanına kokular tam metin verilir; Spec ajanına her bulgu için spec satırı alıntılatılır. Uygulama gerekmiyorsa tek geçişte de yapılabilir; ayrım eksenleri ayırmaktır, ajan sayısı değil.
- **Bizim kural 14 ile:** "spec'te olmayan davranış" (kapsam kayması) bulgusu, kural 14'e göre ayrı kayıt gerektiren gerçekten ilgisiz bir iş mi, yoksa spec'i yarım bırakıp testi sonraya atan bir eksik mi diye ayrıca ayrılır.

Kaynak: mattpocock/skills code-review @5beb35b0.

## Skills in scope

- `security-scanner` — for a deeper pass on security-sensitive changes
- `bug-hunter` — for scanning beyond the diff when a defect pattern repeats
- `testing` — for judging whether the tests prove the change
- `chimera` — for the automatic post-session review format

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
