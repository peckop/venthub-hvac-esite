# Çok-Ajan İşbirliği Protokolü

> **Bu dosya nedir?** Bu repoda **birden fazla EŞİT Claude Code Controller** aynı anda çalışıyor
> (ben + "ikiz"), ve **ortak bir Antigravity CLI worker**'a kod yaptırıyorlar. Bu dosya hepsinin
> uyduğu **ortak kural setidir** — ki herkes aynı doğrultuda, **çarpışmadan** çalışsın.
> **Brief'ler bu kuralları TEKRAR ETMEZ, buraya REFERANS verir.**
>
> İlgili: `CLAUDE.md` (VentHub mutlak kuralları) · `docs/DURUM-TAKIP.md` (canlı şerit panosu).

```
Recep (Human) — her Controller'ı AYRI denetler, aralarında relay yapar
├── Claude Code #1 (Controller, eş) ──┐
│                                       ├──> Antigravity CLI = ORTAK kodlama worker'ı
└── Claude Code #2 (Controller, eş) ──┘
```

---

## 0. Roller

| Rol | Kim | Yetki |
|---|---|---|
| **Controller (EŞİT / çoğul)** | Claude Code örnekleri (#1, #2, …) | Her biri **kendi şeridini** brief'ler · kendi deterministik kapısını **kendi** vurur · **kendi** dalını commit/PR/merge eder. **Tek üst-kapıcı YOK.** |
| **Worker (ORTAK)** | Antigravity CLI | Controller'lardan **herhangi biri** iş verebilir · kendi dalında üretir · push eder · **DURUR** · master'a merge **ETMEZ** |
| **Human** | Recep | Her Controller'ı **ayrı** denetler + aralarında relay · **production'a uygulama yalnız onun açık komutuyla** |

> ⚠️ İkinci Claude Code **bir worker DEĞİL** — benimle **eş Controller**. Onun çıktısını ben gate'lemem; o kendi gate'ler. Antigravity = ikimizin de iş verdiği **ortak** worker.

---

## 0.5 Controller↔Controller koordinasyonu (EN KRİTİK — tangle'ın gerçek sebebi)

> Asıl risk worker'ı yönetmek değil; **iki EŞİT Controller'ın aynı klasörü/dosyayı/işi paylaşması.**
> Bugünkü tangle iki kökten çıktı: (1) **paylaşılan çalışma klasörü** — ikizin dalı checkout'tayken
> öbür Controller edit yaptı; (2) ikimiz de ayrı collaboration standardı yazdık (#376 + bu dosya).

**K0 — Worktree/klasör izolasyonu (BİRİNCİL kural).** İki eş-Controller + ortak worker **tek çalışma
klasörünü PAYLAŞAMAZ.** Her Controller **kendi checkout'unda / git worktree'sinde** çalışır → iki dal
aynı anda canlı olur, dosyalar karışmaz. (Paylaşılan klasörde başkasının dalı checkout'tayken edit =
bugünkü çarpışmanın kökü. — ikiz #2'nin worktree deltası.)

**K1 — Şerit sahipliği.** Her konu **tek Controller'ın** şeridi. Şu an:
**admin = #1 · 3D = #2 · `collaboration-protocol.md` = #1 (bu Controller).** Eş Controller'ın şeridine
**GİRME** (dalını merge etme, dosyasına dokunma, paralel düzenleme). Eş Controller yalnız **gözden geçirir
+ delta iletir**; yazan = sahip.

**K2 — `DURUM-TAKIP.md` = append-only şerit panosu.** Her Controller **yalnız KENDİ bölümüne** yazar
(aktif konu + dal + dokunduğu kilit dosyalar); başkasının satırına **dokunmaz** — yoksa panonun kendisi
çakışma noktası olur. İşe başlamadan **claim**, bitince **release**.

**K3 — Ortak/cross-cutting dosya** (`CLAUDE.md` doc-map, `DURUM-TAKIP.md`, paylaşılan SSOT, bu dosya)
= çakışma sıcak-noktası. İki Controller **aynı anda düzenlemez** → ya **tek-sahip-serileştirir** ya da
**append-only bölüm**. Düzenlemeden önce **"ikiz bunu zaten açtı mı?"** (`git fetch` + PR/dal). Açtıysa →
**rakip PR yok**, tek canon, deltayı sahibine ilet.

**K4 — Ortak worker (Antigravity).** İkisi de iş verebilir; ama her iş **tek Controller'a aittir** —
o Controller işini kendi dalına alır, kendi gate'ler ve merge eder.

**K5 — Merge hijyeni.** Her zaman **`git fetch` + en güncel `origin/master`'dan dallan**; merge'den önce
geride kaldıysan **rebase et** → eş-zamanlı master-merge race'i önlenir.

---

## 1. Bir-İş-Bir-Dal (ZORUNLU)

- Her iş **master'dan TAZE dal** açar. İsim: `feat/<konu>` (kod) · `docs/<konu>` (yalnız doküman) · `fix/<konu>`.
- Bir ajan **SADECE kendi işine** dokunur. Yalnız kendi dosyalarını stage'le/commit'le.
- İki iş aynı anda = **iki AYRI dal**. Yığma yasak — hızlı producer controller'ı geçse bile her bağımsız iş master'dan taze dala (tangled mega-PR yok).
- **Master'a yalnız o şeridin sahibi Controller**, kapı yeşilse merge eder.

---

## 2. İş Akışı (değişmez sıra)

```
iş/brief → Worker üretir → push → DURUR
        → şerit-sahibi Controller: deterministik kapı + ilgili cetvel → diff'ten DOĞRULA
        → yeşilse: commit + PR + master'a merge
```

- **"Worker geçti dedi" ≠ güven.** Controller her zaman diff + kapıyı **kendi** doğrular.
- Kırmızıysa → aynı dala düzeltme commit'i; **merge YOK**.
- **Worker "DURUR"u dinlemese de** (ezip geçer, kendi PR'ını açar) güvenlik **talimata** değil **yapıya** dayanır:
  worker **kendi izole dalında** (master değil) + **master-merge yetkisi worker'da DEĞİL** (branch protection) +
  Controller gate'i geçmeden master'a hiçbir şey girmez + girdiyse **revert**. Yani "durmaması" felaket değil, sadece gürültü.

---

## 3. Deterministik Kapı (şerit-sahibi Controller vurur)

- **Kod:** `pnpm type-check` 0 · `pnpm lint` 0 · `pnpm test -- --run` geçer · `pnpm build` yeşil (RSC/prerender sınırı) · axe 0
- **+ İşin cetveli:** admin sayfası → `admin-standard.md §8` · admin shell → `§10.4` · (yeni domain → kendi standardı)
- Cetvel eşiği **brief'te yazılı** (ör. §10.4 ≥ 15/17). Brief = ilgili standardın uygulama izdüşümü.

**Kuralları-zorlayan testler (INV-*, `src/__tests__/conformance/`) — ayrı değil, `pnpm test` ile koşar:**
bu cetvelin "geriye-denetleyen + geleceği-kilitleyen" ayağıdır (`standard-plus-enforcing-test-is-control`).
İş bu kuralı zorluyorsa kapı bunları görür:
- **INV-2** `localized-route-ssot` — yol localize SSOT. ⚠️ **`/admin` rotaları dil-önekinden MUAF** (admin istisnası).
- **INV-5** `i18n-key-resolution` — her statik `t('a.b')` **namespaced (≥2 segment)** + sözlükte çözülmeli; düz-anahtar-içi-nokta (`t('table.x')`) sessiz ham-key render = YASAK.
- **INV-6** `admin-mutate-real-write` — her `mutateWithAudit` `fn` gövdesi GERÇEK yazma (`.insert/.update/.upsert/.delete/.rpc/.functions.invoke`) ya da awaited servis çağrısı içermeli; no-op `Promise.resolve()` + başarı bildirimi = **sahte-success** = YASAK (admin şeridi; `admin-standard §8`).
- **INV-RENDER-1** `render-price-surface` — fiyat yalnız PDP yüzeyinde; kart/kategori/keşif `hidePrice` geçmeli (`rendering-cache-standard §2`).
- **INV-RENDER-2** `render-revalidation-contract` — vitrinde görünen her tablonun **DB tetiği + webhook handler dalı** olmalı, çift yönlü; kurulum betikleri de aynı tablo kümesini kurmalı (`rendering-cache-standard §3`).
- **INV-WEBHOOK-1** `webhook-auth-fail-closed` — webhook secret'ı tanımsızsa istek **reddedilir** (fail-open yasak).
- `category-*-ssot` · `numeric-format-ssot` · `legal-en-leftover` · `3d-single-canvas`/`asset`/`procedural-env` · `3d-csp`/`3d-model-recipe` (ilgili şeritlerde).
- **DI** (servis/searcher ilk-param `supabase`, modül-düzeyi client importu yok) = `pnpm lint` (`no-restricted-imports`) zorlar.
> Yeni page-crash/SSOT sınıfı bulgu → yeni bir **INV-*** test'ine terfi eder (kalıcı bekçi olur).

### 3.1 Bekçi yazma kuralı — "çağrı var" kapı değildir

Bir conformance iddiası **"X çağrılıyor mu?"** diye soruyorsa, X'in **işini yapabilecek girdiyi
aldığını da** ölçmek zorundadır. Çağrının varlığı tek başına kapı değildir: doğru adı doğru yerde
görmek, davranışın gerçekleştiğini kanıtlamaz.

Bu sınıf 2026-08-15…17 arasında **dört ayrı biçimde** yakalandı ve her seferinde kapı yeşilken
kural ihlal ediliyordu:

| Biçim | Assert neye kandı | Nerede |
|---|---|---|
| Açıklayıcı **yorum** | Yasak/aranan ad, kodu anlatan yorumda geçiyordu | INV-STOCK-1, INV-RETURN-1 |
| **Import** satırı | Ad import edilmişti ama çağrılmıyordu | INV-RETURN-1 |
| **Sayı/biçim** değişimi | Sayaç `font-black` arıyordu, kod `fontWeight:900` yazıyordu | admin ölçümü |
| **Fakir argüman** ⭐ | Çağrı vardı, girdi `{ id }` idi; scope 2–3 hiç eşleşmiyordu | INV-PRICE-7 |

Sonuncusu en sinsisiydi: ad da çağrı da doğruydu, **eksik olan veriydi** — ürün sorgusu marka
ve kategori kolonlarını çekmiyordu, dolayısıyla kilit iki kapsam için sessizce çalışmıyordu.

**Uygulama:** yorumları sıyır (CRLF-güvenli), adı değil **çağrı biçimini** ara, ve çağrının
**anlamlı girdiyle** yapıldığını doğrula (veri çekiliyor mu → çözücüye veriliyor mu). Kapıyı
kurduktan sonra **kusuru birebir geri koyup** kırmızı gördüğünü kanıtla; "eski testle yeşil,
yeni testle kırmızı" farkı, kapının gerçekten yeni bir şey ölçtüğünün tek kanıtıdır.

---

## 4. Standart-Önce (No-Standard-No-Code)

- **Cetvel olmadan kod yok.** Cetvel **gerçek kaynaktan** üretilir (provenance), uydurma değil.
- Yeni domain → önce `docs/standards/*` standardı → ölç (`docs/audits/*`) → uygula.
- Kontrol = **cetvel (docs/standards) + onu zorlayan conformance testi** (INV-*).

---

## 5. Mükerrerlik Yasağı

- Eklemeden önce **"bu zaten var mı?"** → CodeGraph/grep + (cross-cutting ise) **"ikiz açtı mı?"** (§0.5). Var olanı **SAR**, kopya yazma.
- Yeni dosya = **dağınıklığı toplama / eksik doldurma**; mevcut bir şeyin kopyası DEĞİL.

---

## 6. Doküman Kuralları (MD üreten HER Controller için)

- **Her konunun TEK SSOT'u var** (drift önlemi). Diğer dosyalar **referans** verir, içeriği tekrar etmez.

| Konu | SSOT |
|---|---|
| Admin **NASIL** kurulur (yapısal cetvel) | `docs/standards/admin-standard.md` |
| Admin **NE** olmalı (yetenek/açık) | `docs/standards/admin-capabilities.md` |
| Bayi domain / blueprint | `docs/standards/dealer-network-standard.md` · `dealer-module-blueprint.md` |
| Müşteri-hesap UX (yazılacak) | `docs/standards/customer-account-standard.md` |
| Canlı durum + **şerit panosu** | `docs/DURUM-TAKIP.md` |
| **İşbirliği kuralları (bu dosya)** | `docs/standards/collaboration-protocol.md` |
| Uçtan-uca kapsamlı referans | `CONTEXT.md` (**NotebookLM üretir — elle yeniden yazma**) |

- **Gereksiz dosya yasak.** Yeni MD açmadan önce: konunun SSOT'u **var mı?** Varsa oraya **bölüm ekle**.
- İş bitince **`DURUM-TAKIP.md` güncellenir**.
- Türkçe birincil. Commit mesajı **konvansiyonel + Türkçe** (`docs(...)`, `feat(...)`, `fix(...)`).
- **NLM twin sync = MILESTONE** (her commit değil): auth DOĞRULA (`notebooklm list`) → sync → `chat_ask` ile **DOĞRULA**. Yeni önemli standart/audit `.cc_docs.yaml` `standalone_files`'a eklenmeli.

---

## 7. VentHub Mutlak Kuralları (her Controller + worker için bağlayıcı)

- `CLAUDE.md` #1–13: **No-Plan-No-Code** (plan hangi cetvelin yönettiğini söylemeli — bir `docs/standards/` dosya adı ya da açıkça "cetvel yok"; "cetvel yok" geçerli ama iş o zaman cetveli yazmayı kapsar) **· DI** (servisler ilk param `supabase`) **· no-`any`** · RSC-öncelik · Suspense sınırı · i18n (metin sözlükten, URL `useLocalizedRoutes`) · **design-token** (arbitrary Tailwind/HEX yasak) · 3D = R3F+Drei · **RLS/tenant-scope** · webhook HMAC + monoton durum · admin `admin_audit_log` · **migration merge = prod'a otomatik uygulama** (kullanıcı onayı şart). **İhlal = ret.**

---

## 8. Branch Hijyeni

- post-commit `docs/system_tree.md` churn'ü **commit'e ALINMAZ** (`git checkout -- docs/system_tree.md`).
- Bir iş bitmeden ikincisine başlama; **dallar/şeritler karışmasın**.
- `.agent/skills/` (Antigravity) ile `.claude/skills/` (Claude Code) **ayrı ve kasıtlı** — birleştirme/karıştırma yok.

---

*SSOT: bu dosya. Controller'lar = Claude Code (eş, çoğul) · ortak Worker = Antigravity CLI · onay & relay = Recep.*
