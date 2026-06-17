# VentHub — İki-Araç Ortak Çalışma Yöntemi (Controller ↔ Worker)

> Bu dosya **İŞ İÇERİĞİNİ değil YÖNTEMİ** tanımlar: Claude Code (controller) ile
> Antigravity CLI (worker) aynı depoda nasıl **çarpışmadan, sürdürülebilir** çalışır.
> **İki araç da bunu master'dan okur** — ortak ve tek doğruluk kaynağı.
> (Bu yöntem informal anlatımla bile çalıştı; standart = artık informal anlatıma bağımlı değiliz.)

## Roller

- **Controller — Claude Code (Opus).** Plan + brief yazar, merkezî kalite kapısını
  koşturur, PR açar, master'a merge eder. Derin / yargıç taraf.
- **Worker — Antigravity CLI (Gemini).** Ana klasörde paralel üretir
  (göç / refactor / araştırma / özellik). Kendi dalına commit + push yapar, sonra
  **DURUR**. Hızlı / dar-odak taraf.

## Katman 1 — Cetvel-önce (sürdürülebilirlik)

- Her alanın bir **standardı** (`docs/standards/*`) + onu zorlayan **conformance
  testi** (`INV-*`) vardır.
- Yeni iş (yeni özellikler dâhil) ya mevcut cetvele **UYAR** ya da önce cetveli
  **GENİŞLETİR**, sonra uygulanır.
- **Cetvel mantığının DIŞINA çıkma.** Sürdürülebilir döngü:
  > araştırma → cetveli genişlet → conformance testi → uygula → controller doğrula + merge
- Cetvel **gerçek kaynağa** dayanır (provenance), "sentez / his" değil.

## Katman 2 — Controller/worker git disiplini (çarpışmasızlık)

- **İş başına TEK DAL:** her bağımsız işi master'dan TAZE dala al. Karışık mega-PR yok.
- **Worker:** kendi dalına commit + push + **DUR**. Master'a MERGE etme, PR AÇMA.
- **Controller:** worker çıktısını bağımsız doğrular → PR açar → master'a merge eder.
- **Klasör ayrımı:** worker ana klasörde; controller commit'lerini ayrı **worktree**'den
  yapar (tek klasörde aynı anda yalnız bir dal açık olabilir → çarpışmayı bu önler).
- Master'a **doğrudan dokunma**; **force-push yok**.

## Doğrulama kapısı (controller'ın)

- `type-check` / `lint` / `test` / `pnpm build` / axe — **son söz controller'da.**
- Worker "pass / tamamlandı" dese de controller **kendi kapısını koşturur**:
  "ajan geçti" ≠ güven; çıktı **diff'ten** doğrulanır.
- **Yasak desenler:** CLAUDE.md "Mutlak Kurallar" + protect-config hook'unun engellediği
  tüm desenler geçerli (DI ihlali, tip-kaçışı, lint-susturma, vb.). Tam liste tek kaynak
  = **CLAUDE.md**.

## Brief sözleşmesi (controller → worker)

- Controller, işi **dar + sert** bir brief'e döker: canlı koddan doğrulanmış,
  per-dosya kontrat, altın örnek, kesin yasaklar.
- **Brief, skill'i EZER:** skill "build / PR yap" dese bile brief "yapma, push + DUR"
  derse worker durur.
- İçinde: hangi harness (`maestro-refactor` = yatay göç · `maestro-feature` = dikey
  özellik), internet / araç-dokümanı yasağı, dosya allowlist'i, **kabul ölçütü**
  (ilgili cetvel maddesi).

## Devir (handoff) — veri yolu

- Worker bitince **ne yaptığını kısa yazar** (hangi dosyalar, hangi dal) →
  `walkthrough.md` / brief.
- Controller okur → doğrular → PR → merge.
- **Bus** = paylaşılan git dalı + bu dosyalar (brief / walkthrough / bu standart);
  insan ikisi arasında aktarır.

## Canlı örnekler (referans)

- **3D Wave 2 + ThreeDAuthority göçü** → worker üretti, controller doğrulayıp
  PR #374 / #375 ile master'a aldı.
- **Admin Shell §10 cetveli + E1 komut-paleti brief'i** → worker cetvel-önce üretti
  (`docs/standards/admin-standard.md §10`, `docs/plans/admin-shell-e1-command-palette-brief.md`);
  controller doğrular + merge eder.
