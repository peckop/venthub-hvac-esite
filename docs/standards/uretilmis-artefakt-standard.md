# Üretilmiş Artefakt Standardı

> **Kapsam:** boru hattının ÜRETTİĞİ her dosya — master `.md`'ler, küme
> master'ları, companion `.md`'ler, artefakt manifesti.
> **Niçin ayrı cetvel:** kural companion'a özel değil. Aynı kusur 2026-08-26'da
> hem companion'larda hem master'larda ölçüldü.
> **SSOT:** bu dosya. Kapılar: `src/__tests__/conformance/uretilmis-artefakt-tazeligi.test.ts`
> (INV-DOC-3, INV-DOC-4) ve yerel `orion doc durum` (Kapı B).

## AXIOM 1 — Üretilen artefakt, depoya girene kadar ÜRETİLMEMİŞ sayılır

Diskte duran bir dosya hiçbir soruya cevap vermez: CI onu göremez, ikiz onu
bilmez, ekip arkadaşı onu bulamaz. "Ürettim" ile "teslim ettim" ayrı fiillerdir.

**Niçin bu aksiyom var (ölçülmüş olay, 2026-08-26):**
PR #821 `.cc_docs.yaml`'a iki küme master'ı tanımladı — 40 satırlık ayar. Üretilen
dosyalar geçici bir worktree'de doğdu, dijital ikize oradan yüklendi, worktree
silinince yerel kopyalar öldü. Depoda hiç görünmediler. **Kusuru bir kapı değil,
kullanıcı fark etti** ("bu yeni master dosyalarını göremedim"). Ölçüldü: dosyalar
depoya ancak `de0b4a52` ile, sorudan **sonra** girdi.

Aynı sınıf companion'larda da yaşıyordu: `post-commit` kancası diske yazar,
C4/C5 kapıları `git log` okur; arada kalan dosyayı hiçbir şey saymaz.

## AXIOM 2 — Tarif ile ürün AYNI PR'da yolculuk eder

Bir PR artefaktın **nasıl üretileceğini** değiştiriyorsa (`.cc_docs.yaml` kapsamı,
derleyici davranışı, kaynak dosyalar), o PR **üretilmiş hâlini de taşımak
zorundadır**.

### ⭐İŞ AKIŞI BEDELİ — AÇIKÇA KABUL EDİLDİ

Bu kural bir bedel getirir ve bedel **yazılı olmalıdır**:

> `docs/standards/`, `docs/reference/`, `docs/audits/`, `docs/plans/` veya
> `supabase/functions/` altına dokunan **her PR**, aynı PR'da `orion doc build`
> çıktısını da taşır.

Pratikte iki komut:

```
orion doc build
git add docs/*_master.md docs/artefakt_manifest.json
```

**Niçin bedeli yazıyoruz:** yazılmayan bedel, kırmızıyı atlatma alışkanlığı
doğurur. Bu depo o filmi gördü — rastgele patlayan `pre-commit`, tüm filoda
`--no-verify` alışkanlığı doğurdu (T033). Bu yüzden **her kırmızı mesaj,
koşulacak tam komutu basar**: ne yapacağını söylemeyen kapı atlatılmayı davet
eder.

## AXIOM 3 — Üretilen dosya ELLE düzenlenmez

Üretilen artefakt bir **çıktıdır**, kaynak değildir. Elle yapılan düzeltme bir
sonraki derlemede sessizce silinir ve arada geçen sürede ikiz yanlış bilgiyi
doğru sanar.

Düzeltme kaynağa yapılır, sonra yeniden üretilir.

Kapı A bu ihlali `icerik_sha256` ile yakalar (aşağıda).

## AXIOM 4 — Ölçülemedi, GEÇTİ demek değildir

Manifest yoksa, git geçmişi sığsa, kaynak kümesi boşsa — kapı **kırmızı** yanar.
"Ölçemedim, o hâlde geçtim" (fail-open) bu depoda yasaktır: ölçülemeyen bir kapı,
geçen bir kapı değil **YOK olan** bir kapıdır.

Bu, boş listeyi "sorun yok" diye okumayı da kapsar. Boş kaynak kümesi bir ölçüm
değil, ölçümün **yokluğudur**.

## AXIOM 5 — Worktree yasak değildir; GÖRÜNMEZLİĞİ yasaktır

Worktree normal iş akışımızdır (çok-şeritli çalışmanın izolasyon aracı). T020
kazasının kökü worktree kullanmak değil, **çıktının o ağaçta kalıp kimseye
görünmeden ölmesiydi**.

Bu yüzden:
- Manifest, derlemenin hangi ağaçta yapıldığını (`calisma_agaci`) kaydeder.
- Worktree'de koşan derleme, sonunda **açık uyarı** basar: *"çıktılar &lt;yol&gt;
  içine yazıldı; commit etmezsen ağaç silindiğinde bu dosyalar da ölür."*
- Depo içi kapılar (A ve C) PR üzerinde CI'da koşar; ölçtükleri şey **birleşme
  hedefinin geçmişidir** ve koşumun hangi ağaçta yapıldığından bağımsızdır.

## AXIOM 6 — Yıkıcı adım, onarıcı adımın yapılabilirliği ölçülmeden koşmaz

Senkron **önce siler sonra yükler**. Yükleme kaynağı yoksa defter boşalır.

2026-08-26'da tam bu oldu: çalışma ağacı koşum ortasında yok oldu, silme adımı
83 kaynağı sildi, yükleme adımı hiçbir dosya bulamadı, defter 96 → 13'e düştü.

Tetikleyici (ağacın silinmesi) tesadüfiydi; **kusur sıradaydı**. Aynı sonuç disk
dolsa, izin düşse, yol yanlış verilse de olurdu. Bu yüzden kapı "worktree var mı"
diye değil, **"yüklenecek her şey ELDE mi"** diye sorar.

---

## Kapılar — üç ayrı soru

| Kapı | Nerede | Soru | Kimlik |
|---|---|---|---|
| **A — Tazelik** | venthub CI | Depodaki artefakt manifestteki özetle eşleşiyor mu? | INV-DOC-4 |
| **B — Ayrışma** | yerel `pre-push` | Diskte üretilmiş ama depoya girmemiş artefakt var mı? | `orion doc durum` |
| **C — Tarif↔Ürün** | venthub CI | yaml'ın ilan ettiği artefakt depoda var mı? | INV-DOC-3 |

### ⭐Niçin B yerelde, A ve C CI'da

**CI geliştiricinin diskini GÖREMEZ.** "Üretildi ama commit'lenmedi" durumu tanım
gereği yalnız yerel makinede vardır — PR'a giren şey zaten commit'lenmiştir. O
soruyu CI'da sormak, hiç kırmızı yanmayacak bir kapı kurmak olurdu; yani
dekoratif kapı.

Tersi de doğru: "depodaki artefakt kaynağıyla tutarlı mı" sorusunu yerelde sormak
yetmez, çünkü kimse koşmayı unutabilir. O yüzden A ve C zorunlu CI kapısıdır.

### ⭐Niçin B `pre-push`, `pre-commit` değil

Companion üretimi `post-commit`te **asenkrondur**. `pre-commit`te sormak, henüz
üretilmemiş dosyayı "eksik" sayar → yanlış-kırmızı. `pre-push` anında üretim
çoktan oturmuştur.

Kurulum: `orion doc install-push-hook`. Kurulum `core.hooksPath`'e **saygı duyar**
— ayar varsa git `.git/hooks`'a hiç bakmaz ve oraya yazılan kanca hiç koşmaz;
kapı var sanılır, yoktur.

### Kapı A'nın iki ayağı ve niçin ikisi de gerekli

1. **İçerik özeti** (`icerik_sha256`) — ürün elle bozuldu mu?
2. **Kaynak değişimi** — kaynak, derlemeden sonra değişti mi?

Ata-soy/kaynak-değişimi ayağı, kaynak **hiç değişmeden** ürünün bozulduğu vakayı
göremez. Özet ayağı ucuzdur ve o körü kapatır. Birini diğerinin yerine koymak
kör nokta bırakır.

### ⭐Satır sonu SİNYAL DEĞİL GÜRÜLTÜDÜR

Üretim Windows'ta olur ve metin modu yazımı dosyayı CRLF yapar; `core.autocrlf=true`
commit'te LF'e çevirir; CI Linux'ta LF iner.

Ham bayt özeti karşılaştırılsaydı **kapı daha kurulmadan kalıcı kırmızı olurdu** —
yani artefaktın içeriğini değil **taşıma katmanını** ölçerdi. Kalıcı kırmızı kapı
görmezden gelinir.

Bu yüzden **her iki uç da** (orion üretici tarafı ve venthub kapı tarafı)
özet almadan önce CRLF → LF normalizasyonu yapar. İki uç aynı soruyu sormazsa
karşılaştırma anlamsızdır.

Normalizasyon kapıyı zayıflatmaz: tek karakterlik gerçek fark hâlâ özeti
değiştirir.

---

## Kapı tasarımı — bu işte öğrenilen üç ders

### 1. Bir kapı ÜÇ ayrı soru sorar

| Soru | Aleti |
|---|---|
| Fonksiyon doğru mu? | birim test |
| DOĞRU YERDE mi? | AST — yıkıcı çağrıya göre konum |
| ULAŞILABİLİR mi? | AST — saran koşul sabit değil ve ölçüme bakıyor |

Üçüncüsü sabotajla doğdu: `if _eksikler:` → `if False:` yapıldığında yükseltme
kaynakta duruyordu, sırası doğruydu, ve AST kapısı **yeşil yandı**. Kapı "yazılı
mı" diye bakıyordu, "koşulur mu" diye değil.

### 2. Karar vermek ile kararı DIŞARI VEREBİLMEK ayrı sorulardır

`orion doc durum` komutunun FAIL dalında `sys` import edilmemişti: kapı doğru
ölçüyor, doğru karar veriyor, ve tam kırmızı yanacağı anda çöküyordu. Test yine
de yeşildi çünkü `CliRunner` **çöken bir komutu da** `exit_code=1` sayar.

Çıkış kodu da kapının bir parçasıdır; testi `SystemExit`'i **adıyla** sormalıdır.

### 3. Kapının en sık karşılaşacağı durum, testin en az temsil ettiği durum olabilir

`git status --porcelain` çıktısına `.strip()` uygulamak **ilk satırın baştaki
boşluğunu** yiyor; değiştirilmiş-izlenen dosya (" M yol") bir karakter kayıp
hiçbir şeyle eşleşmiyordu. Bütün birim testler yeşildi çünkü hepsi **izlenmeyen**
dosya kullanıyordu ("?? yol" boşlukla başlamaz).

Sentetik girdi gerçek çıktıyı taklit etmiyorsa test yeşil yalan söyler.

### ⭐Yeşil kalan sabotaj "kapı kör" demek DEĞİLDİR

Sebebi **ayrıca** ölçülür. 2026-08-26'da üç yeşil sabotajın:
- ikisi **etkisizdi** (biri ölü koddu ve kaldırıldı),
- biri **testin kendi körlüğüydü** (yukarıdaki `CliRunner` vakası).

Ölü kodu "önlem" diye bırakmak, okuyana **var olmayan bir koruma** vaat eder.

---

## İhlal hâlinde ne yapılır

| Kırmızı | Anlamı | Çözüm |
|---|---|---|
| INV-DOC-3 | yaml ürünü ilan ediyor, ürün depoda yok | `orion doc build` + `git add <artefaktlar>` |
| INV-DOC-4 özet uyuşmuyor | ürün elle bozuldu **ya da** manifest bayat | kaynağı düzelt → `orion doc build` |
| INV-DOC-4 manifest yok | ölçüm yapılamıyor | `orion doc build` + `git add docs/artefakt_manifest.json` |
| Kapı B (yerel) | üretildi, commit'lenmedi | kırmızının bastığı `git add` komutu |

**Tabanı yükselterek susturmak YASAKTIR.** Kırmızıyı susturmak için eşik
büyütmek, kapıyı sökmektir.

---

İlgili: `companion-doc-standard.md` (C4/C5 — eksik ve bayat companion) ·
`measurement-discipline-standard.md` · `collaboration-protocol.md` ·
tasarım kaydı: orion `docs/t021-artefakt-tazelik-kapisi-tasarim.md` (PR #42)

## AXIOM 7 — Kaynak ile artefakt AYNI dosya olabilir; o zaman build TEK TURDA kapanmaz

**Ölçüldü 2026-08-28 (ALTYAPI, REC-86 dalı).** `docs/system_tree.md` hem
`.cc_docs.yaml`'ın ürettiği bir **artefakt**, hem de `kayitlar_master.md`'nin
derlendiği **kaynak** kümesinin bir üyesi. Tek geçişli build şu sırayı izler:

1. `kayitlar_master.md` derlenir — o an diskteki (yani **eski**) `system_tree.md`
   okunur ve sha'sı manifeste yazılır,
2. `system_tree.md` yeniden üretilir — sha'sı **değişir**.

Sonuç: manifest yazıldığı anda `kayitlar_master`'ın kaynak kaydı bayattır ve
INV-DOC-4b kırmızı yanar. Bu bir hata değil, **çift rolün kaçınılmaz sonucudur**.

**Kural:** çift rollü bir dosya varsa `doc build` **iki tur** koşulur ve
**aralarında commit edilir** (kapı HEAD'i okur, diski değil):

```
orion doc build --force-sync && git add docs/ && git commit
orion doc build --force-sync && git add docs/ && git commit
```

**Yakınsama ölçülmüştür, varsayılmamıştır:** ikinci turda `system_tree.md`
değişmedi (`git diff --stat` boş) — yani damga alanı her koşumda yeniden
yazılmıyor, döngü ikinci turda duruyor. Üçüncü tur GEREKMEZ. Yeni bir çift
rollü dosya eklenirse bu ölçüm **tekrarlanır**; "iki tur yeter" bu depodaki
bugünkü kümenin ölçümüdür, evrensel bir yasa değildir.

### Bu aksiyomun doğurduğu iki ölçüm kuralı

**(a) Ölçümün ZAMANI ölçümün parçasıdır.** Aynı gün manifesti "855 kaynak
kaydı, uyuşmaz 0" diye ölçüp temiz ilan ettim; ölçüm **commit'ten önce**
koştuğu için `system_tree.md`'nin yeni hali diskteydi ama HEAD'de yoktu.
Kapı HEAD'i okur. Bir kapının ölçütünü taklit eden her ölçüm, kapının
okuduğu **aynı anı** okumalıdır.

**(b) `generated_at`'in geriye gitmesi tek başına regresyon kanıtı DEĞİLDİR.**
Aynı imza iki zıt sebepten doğar: bayat tabanda build (regresyon) ya da
dalda kalmış, master'a hiç inmemiş bir companion halinin düzeltilmesi.
Ayırt eden ölçüt imza değil, **kaynağın üç hâli**: dosyanın `HEAD`,
`origin/master` ve disk değeri. Üçü de yeni değeri söylüyorsa geri gidiş
**düzeltmedir**.

### Manifestteki iki özet TÜRÜ karıştırılmaz

`artefakt_manifest.json` iki farklı özet tutar ve karşılaştırmadan önce
hangisine bakıldığı **doğrulanır**:

| alan | tür | uzunluk |
|---|---|---|
| `artefaktlar[].icerik_sha256` | SHA-256 (CRLF→LF normalize, HEAD blob'undan) | 64 hex |
| `artefaktlar[].kaynak.dosyalar[yol]` | **git blob SHA-1** | 40 hex |

İkisini aynı sütunda karşılaştırmak, hiçbiri tutmayan sahte bir bilmece
üretir — bu depoda bir gün kaybettirdi. **Bedava ayırt edici: hex uzunluğu.**

---

## AXIOM 8 — Üretecin KAPSAM SÜZGECİ isim tabanlıysa, her ekleme bir KESİNTİDİR

`.cc_docs.yaml → skip_dirs` bir "yok sayılacaklar listesi" gibi okunuyor. Değil.
`corpus_callosum/cli/docs_tree.py:57` süzgeci `d not in _all_skip` biçiminde uygular:
**isim tabanlı, her derinlikte, kök-sabitleme yok.** Yani listeye yazılan her ad, aynı
adı taşıyan **gerçek kaynak dizinini de** ağaçtan siler. Ekleme bedavaya benziyor;
değil.

### Ölçülmüş vaka (REC-84 · 2026-08-30)

`docs/system_tree.md`'de kök `cache/` ve `.agents/` görünüyordu. Teşhis "skip_dirs
kaçağı" oldu ve ikisi de listeye eklendi. Sızıntı dizinleri **fiilen yaratılıp** üç kol
tek tek koşulduğunda hüküm çürüdü:

| `skip_dirs` | `.agents` ağaçta | kök `cache/` | `src/lib/cache/tags.ts` |
|---|---|---|---|
| taban (ikisi de yok) | 0 | **1** | 1 |
| `+ .agents` | 0 | 1 | 1 |
| `+ .agents, cache` | 0 | 0 | **0** ⚠ |

İki bağımsız sonuç çıktı:

1. **`.agents` ETKİSİZDİ.** Yürüteç nokta-dizinleri zaten atlıyor (`docs_tree.py:56`,
   `not d.startswith('.')`). Listede olsun olmasın sonuç 0. Yani "kök sebebi kapattık"
   denen değişikliğin yarısı hiçbir şey yapmıyordu — ve **yeşil çıktı bunu gizledi**,
   çünkü çıktı zaten temizdi.
2. **`cache` ZARARLIYDI.** Kozmetik bir kök satırını sildi, karşılığında companion'ı olan
   gerçek bir modülü (`src/lib/cache/tags.ts`) ikizin kaynağından **yok etti**.
   `system_tree.md`, `kayitlar_master.md`'nin kaynağıdır: kayıp doğrudan dijital ikize
   geçer, hiçbir kapı kırmızı vermez.

### Kural

- **Bir adı `skip_dirs`'e eklemeden önce, o adı taşıyan BAŞKA dizin var mı diye ölçülür.**
  Ölçüt: `find <repo> -type d -name '<ad>'`. Birden fazla eşleşme varsa ekleme yapılmaz.
- **Süzgeç değişikliği A/B ile kanıtlanır:** sızıntı dizini fiilen yaratılır, kol tek
  değişkenle koşulur, negatif kontrol alınır. "Çıktı temiz" tek başına kanıt değildir —
  çıktının sızıntı dizini yokken de temiz olacağını unutma (boş evren, sahte yeşil).
- **Kök-sabitli sızıntının bu depoda karşılığı YOKTUR.** `source_dirs: [src, .]` kökü de
  tarar; isim tabanlı listeyle kökü hedefleyip alt ağacı korumak imkânsızdır. Gerçek
  çözüm üreteç tarafında kök-sabitli girdi desteğidir (`/cache` gibi) — **ORION kalemi**,
  bu depoda kapatılamaz. O gelene kadar kök artığı KABUL EDİLİR: kozmetik bir satır,
  gerçek bir modülün kaybından ucuzdur.

**Genel ders:** bir süzgece ekleme yapmak, "gürültüyü azaltmak" değil **görüş alanını
daraltmak**tır. Daraltmanın neyi kestiğini ölçmeden yapılan her ekleme, kaybı sessiz
kılan bir kapıdır.
