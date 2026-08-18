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

## C3 — Ters yön: niçin ayrı bekçi (v0.1'de kapsam dışıydı)

"Kaynağı var ama companion'ı yok" v0.1'de kapsam **dışıydı** ve gerekçe sağlamdı:
eksik companion bir bilgi **boşluğudur** (ikiz o dosyayı bilmez), yetim companion ise
**yanlış bilgidir** (ikiz olmayan şeyi bilir) — ikincisi zararlı, ilki yalnız eksik.
Ayrıca companion üretimi `post-commit`te asenkron olduğu için "her kaynağın companion'ı
olmalı" kuralı taze commit'lerde **yanlış-kırmızı** üretirdi.

**2026-08-17'de ölçüldü ve gerekçe DOĞRULANDI** (çürütülmedi) — ama aşılabilir çıktı:

| | toplam | 7 günden eski |
|---|---|---|
| companion'ı yok | 36 | **1** |
| companion bayat (kaynaktan eski) | 189 | **34** (34'ü 30 günden de eski) |

Gürültünün tamamı taze pencerede. Yani kuralı uygulanamaz kılan şey kuralın kendisi değil,
**yaş eşiğinin olmamasıydı**. Eşiğin ötesinde kalan dosya artık "henüz üretilmedi" değildir;
34 companion'ın 30 günden eski olması bunu kanıtlıyor — üretilmeyi beklemiyorlar, unutulmuş.

Bu yüzden ters yön ayrı bir bekçiye taşındı: **§C4 + §C5, `INV-DOC-2`**
(`src/__tests__/conformance/companion-parity-coverage.test.ts`).

İlgili ama HENÜZ YOK: `.cc_docs.yaml` ↔ NotebookLM defteri paritesi (§C6, aşağıda).

## C4 — Companion'ı olmayan ESKİ kaynak = ihlal (yaş eşikli)

Kapsamdaki bir kaynak dosyanın son commit'i **7 günden eskiyse** ve companion'ı yoksa
bu bir ihlaldir. 7 gün ve altı, asenkron üretim penceresi olarak **muaftır**.
Etki: ikiz o dosyayı hiç bilmez, "bu kod nasıl çalışıyor" sorusuna eksik cevap verir.

## C5 — Kaynağından ESKİ companion = ihlal (yaş eşikli)

Companion'ın son commit'i kaynağın son commit'inden eskiyse ve kaynak 7 günden eskiyse
ihlaldir. Etki §C4'ten **daha kötüdür**: ikiz dosyanın eski hâlini bilir ve emin biçimde
yanlış cevap verir. Eksik bilgi belirsizlik yaratır, bayat bilgi yanlış güven yaratır.

**Kapsam = `.cc_docs.yaml`'ın kendisi (SSOT).** Bekçi kendi dosya listesini uydurmaz:
`source_dirs` + `extra_masters` eksi `skip_dirs` eksi `skip_files`. Niçin bu şart —
ilk ölçümde `.agent/` altındaki betikler sayılmış ve sonuç 84/211 çıkmıştı; oysa `.agent`
yaml'da `skip_dirs` içinde, yani doküman hattı oraya hiç bakmıyor. **Bekçi üreticiden
farklı kapsam kullanırsa ölçtüğü şey gerçek değildir.**

**Ratchet, sıfır değil.** Mevcut borç (C4=1, C5=34) taban olarak dondurulur: yeni borç
eklenemez, azalınca taban düşürülmelidir (stale-guard bunu zorlar). Niçin tam-kapalı
kurulmadı: bekçi ilk günden kırmızı yanarsa görmezden gelinir — bu depoda yaşandı
(rastgele patlayan `pre-commit` `--no-verify` alışkanlığı doğurdu, T033).

**Ölçüm kaynağı = `git`, disk değil** (§C1 ile aynı gerekçe). Ek ölçüm: 2026-08-17'de
17 companion **diskte güncel ama git'te eskiydi**. Bu ayrışma kendisi bir bulgudur ama
bu bekçinin sorusu değildir; ikize giden şey depo hâlidir.

## C6 — `.cc_docs.yaml` ↔ NotebookLM defteri paritesi (KAPI YAZILDI, SİLAHLANDIRMA BEKLİYOR)

Yaml'da listelenen bir kaynağın deftere gerçekten yüklendiği (ve defterde yaml'da
olmayan artık kaynak bulunmadığı) ölçülmelidir. 2026-08-17'de elle yapıldı ve **5 eksik
kaynak** bulundu — yani ikiz, var olduğu sanılan belgeleri hiç görmüyordu.

Kapının doğrudan yazılamamasının sebebi teknik: conformance testleri **ağ kullanamaz**,
defter durumu ise yalnız ağ üzerinden görülür. Bu yüzden iki parçalı:

1. **Üretim (Orion, `orion@fc0aec0` — yapıldı):** sync, yüklemelerden **sonra defteri
   yeniden listeleyip** `docs/nlm_sync_manifest.json` yazar.
2. **Bekçi (`INV-DOC-3`, `src/__tests__/conformance/nlm-manifest-parity.test.ts` — yazıldı,
   PR #640):** yaml ile manifest'i karşılaştırır; beş iddia — manifest var mı ·
   `olcum_basarili` mı · yaml'daki her kaynak manifest'in beklenen listesinde mi (bayat
   manifest tespiti) · `eksik` boş mu · `fazla` boş mu.

**Manifest NİYETİ değil ÖLÇÜMÜ yazar.** Niyet listesinden üretilse, yükleme yarıda kalsa
bile "hepsi yüklendi" derdi — T075'te yakalanan sınıfın aynısı (başarısız işlem denetim
defterine `success` yazıyordu) ve o sınıfın en sinsi tarafı kaydın **kanıt gibi görünmesi**.
Ölçüm yapılamazsa manifest `olcum_basarili: false` + sebep yazar ve karşılaştırma alanlarını
**boş bırakır**; boş listeyi "parite tam" diye okumak yasaktır (Orion tarafında 7 testle kilitli).

**Kapı şu an bilinçli KIRMIZI ve bu doğru:** manifest ancak gerçek bir
`orion tree --nlm-sync` koşumuyla doğar, o komut da **canlı deftere** yazar (eski kaynakları
silip yeniden yükler). Yani **silahlandırma bir yetki kararıdır**, testin işi değil — Recep
onayı bekliyor. Fail-open eklenmedi: "defteri göremedim ama geçtim" diyen bir parite kapısı,
kapının hiç olmamasından kötüdür çünkü yeşil görünür.

⚠ 2026-08-18'de bir **otomatik onarım botu** bu bilinçli kırmızıyı arıza sanıp manifesti
**elle uydurdu** (`olcum_basarili: true`, uydurma zaman damgası, icat edilmiş `source-1…N`
id'leri; PR #643, kapatıldı). Türev kural `collaboration-protocol.md` **K7**'ye yazıldı:
denetim artefaktı **elle yazılmaz** — onu üreten şey ölçümü yapan araç olmalıdır.

## Ölçülmüş taban çizgisi (2026-08-17)

Kod dizinlerinde **668** `.md`; **665** eşli, **2** yetim (temizlendi), **1** muaf.
Temizlik sonrası ihlal listesi **BOŞ** — bu yüzden bekçi ratchet/baseline taşımaz,
muafiyetsiz ve tam kapalı kurulmuştur.
