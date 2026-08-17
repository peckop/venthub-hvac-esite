# Companion Doküman Standardı (cetvel) — v0.1

> **Kapsam:** Kod dosyalarının yanında duran üretilmiş `.md` "companion" dokümanları —
> hangi companion meşrudur, kaynağı gidince ne olur, hangi `.md` companion sayılmaz.
> **Bekçi:** `src/__tests__/conformance/companion-doc-parity.test.ts` (INV-DOC-1).
> **Doğuş sebebi:** T067 kapanışında (2026-08-17) iki yetim companion bulundu —
> `BulkActionToolbar.md` (kaynağı #544'te BulkBar'a birleşti) ve `FanRenderer.md`
> (kaynağı `ProductModelRenderer` olarak yeniden adlandı). İkisi de silinmiş/var olmayan
> bileşenleri anlatıyordu ve **NotebookLM dijital ikizine yüklenme yolundaydı.**

## C0 — Companion nedir, neden önemlidir

Companion = Orion/Corpus-Callosum doküman hattının bir kaynak dosya için ürettiği,
**aynı dizinde aynı adı taşıyan** `.md` dosyası (`Foo.tsx` → `Foo.md`). Üretim
`post-commit` kancasında arka planda olur (log: `.git/orion-doc.log`).

Bu dosyalar yalnız repoda durmaz: master MD'lere derlenip **NotebookLM ikizine** yüklenir
ve mimari sorularının RAG kaynağı olur. Bu yüzden yetim companion "sessiz bayat doküman"
değil, **ikize giden aktif yanlış bilgidir** — var olmayan bir bileşen varmış gibi anlatılır
ve buna dayanan cevaplar üretilir.

## C1 — Kaynağı olmayan companion = İHLAL

`src/`, `supabase/functions/`, `scripts/` altındaki her `X.md` için aynı yolda bir kaynak
dosya bulunmalıdır: `.ts .tsx .js .jsx .mjs .cjs .py .ps1 .sh .sql`.

**Kaynağı silen veya yeniden adlandıran, companion'ını da aynı commit'te siler.** Üretici
hat yalnız EKLER; silmeyi/yeniden adlandırmayı takip etmez — bu boşluk kapıyla kapatıldı.

Ölçüm kaynağı **`git ls-files`**, disk değil (bilinçli): "diskten sildim ama commit etmedim"
durumunda disk taraması yeşil verir, oysa depoda dosya durur ve ikize o gider. Doğru soru
"DEPODA yetim var mı?"dır.

## C2 — Companion SAYILMAYAN `.md` dosyaları

- **Kod kökleri dışındaki her şey:** `docs/**` (elle/NLM üretimi master MD'ler),
  `.agent/**`, `.claude/**` (skill tanımları), kök seviyesi (`CLAUDE.md`, `CONTEXT.md`, …).
  Bunlar kaynak dosyası olmayan bağımsız dokümanlardır.
- **Dizin dokümanları:** `README.md`, `CHANGELOG.md`, `LICENSE.md` — kod köklerinde olsalar
  bile elle yazılmışlardır (ölçüldü: `src/components/authority/README.md`,
  `supabase/baselines/README.md`).

Yeni bir muafiyet gerekirse buraya **ADLA** yazılır ve INV-DOC-1'deki muafiyet ifadesine
aynı adla eklenir. "Şimdilik geç" modu yoktur (fail-open yasağı).

## C3 — Kapsam dışı: ters yön (eksik companion)

"Kaynağı var ama companion'ı yok" bu cetvelin kapsamında **değildir** ve bilerek öyledir:
eksik companion bir bilgi **boşluğudur** (ikiz o dosyayı bilmez), yetim companion ise
**yanlış bilgidir** (ikiz olmayan şeyi bilir). İkincisi zararlı, ilki yalnız eksik.
Ayrıca companion üretimi `post-commit`te asenkron olduğu için "her kaynağın companion'ı
olmalı" kuralı taze commit'lerde yanlış-kırmızı üretirdi.

İlgili ama AYRI kapı: `.cc_docs.yaml` ↔ NotebookLM defteri paritesi (ALTYAPI hattı) —
o, deftere yüklenmiş kaynakların yaml ile uyumunu ölçer; bu cetvel repo tarafını ölçer.

## Ölçülmüş taban çizgisi (2026-08-17)

Kod dizinlerinde **668** `.md`; **665** eşli, **2** yetim (temizlendi), **1** muaf.
Temizlik sonrası ihlal listesi **BOŞ** — bu yüzden bekçi ratchet/baseline taşımaz,
muafiyetsiz ve tam kapalı kurulmuştur.
