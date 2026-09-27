# Belge Yönetimi Standardı (Cetvel) — v0.1 TASLAK

> **Ne yönetir:** Ajanın bilgiye hangi katmandan, hangi anda ulaştığı; belgelerin nasıl yazıldığı (gövde /
> tarihçe ayrımı, başlık bloğu, sahip); belge, harita, hafıza ve kanca katmanlarının bayatlığının nasıl
> **göründüğü**; konuya göre doğru belgeyi getiren yönlendiricinin sınırları.
> **Niçin var:** Kod tarafında 180+ otomatik kontrol bozulunca kırmızı yanıyor; belge tarafında yok. Ölçüm
> (2026-09-25/27): `CONTEXT.md` 2026-08-17'den beri değişmedi ve CLAUDE.md "ilk buraya bak" diyor; belge
> taramasında 163 bulgunun %56'sı YANLIŞ çıktı, yanlışların çoğu belgelerin kendi tarihçe bantlarından;
> 09-25'te hafızada yazılı bir ders doğru anda gelmediği için hata tekrarlandı. Hiçbiri kırmızı vermedi.
> **Sahibi:** HARİTA oturumu (REC-400). Kanca kurulumu/altyapısı ARAÇ'ın; tasarım ve eşikler bu cetvelin.
> **Son doğrulama:** 2026-09-27.
> **Kayıt:** REC-400. **İlgili cetveller:** `companion-doc-standard.md` (kod yanı belgeler — bu cetvel onlara
> DOKUNMAZ) · `uretilmis-artefakt-standard.md` (üretilen dosya elle düzenlenmez) · `proje-takip-defteri-standard.md`
> (defter eşitleme, açılış satırı §5.1) · `hafiza-kancalari-standard.md` (soğuk okuyucu sınavı §3, sage §6,
> indeks eşikleri REC-280) · `arac-envanteri-standard.md` (yeni kanca envantere girer) ·
> `execution-method-standard.md`.

**Durum:** TASLAK. Bu sürüm kuralları koyar; kapıların çoğu henüz YOK. Hangi maddenin hangi dilimde koda
döneceği §B9'dadır. Kapısı doğmamış madde "uygulanıyor" sayılmaz.

---

## B0 — İlke

1. **Projenin beyni Claude'un dışındadır.** Bağlam projeye sığmaz ve her compact bir kayıptır. Claude o anki iş
   için doğru dilimi yükleyen işçidir. Bu yüzden sorun "daha çok belge" değil, **doğru belgenin doğru anda
   gelmesi** ve **bayatlığın görünmesi**dir.
2. **Belgeye kodun korumasının aynısı verilir:** bayatlayınca, işaret ettiği şey kaybolunca, sınıra dayanınca
   kırmızı yanar.
3. **Yeni depo/araç eklemek çözüm değildir.** Önce mevcut düzenek genişletilir (tazelik satırı, yönlendirme
   kancası, sage). Yeni araç yalnız mevcut düzenek o işi yapamıyorsa ve ölçümle gösterilirse eklenir.
4. **Yapılar sorgulanmaz, ayarlanır.** Kancalar, kapılar, kod haritaları ve çapalı hafıza, kodu okumayan
   sahibin gözüdür. Gürültü (yanlış alarm, tekrar eden uyarı) bir ayar sorunudur, kaldırma gerekçesi değildir.
5. **Doz:** uyarının hiç çalmaması da sorun, her adımda çalması da. Her adımda tekrarlanan uyarı görmezden
   gelinmeyi öğretir. Doğru uyarı: doğru yerde, doğru anda, bir kez.

## B1 — Katmanlar

| Katman | Ne zaman yüklenir | İçerik | İçermez |
|---|---|---|---|
| 0 Çekirdek | Her oturum | `CLAUDE.md`: kimlik, mutlak kurallar (kısa), **tek giriş haritasının adresi**. `AGENTS.md`: tek satır köprü (diğer ajanlar aynı kuralı okur) | Hikâye ("Niçin: …" paragrafları → ilgili cetvele), ikinci harita, değişen sayı |
| 1 Yer | O klasörde çalışınca | Seçilmiş klasör `CLAUDE.md`'leri (yalnız o klasöre özgü mutlak kural) | Genel kural tekrarı. Klasör dosyası yalnız ölçülmüş ihtiyaçla eklenir |
| 2 Konu | Konu açılınca, kendiliğinden | Yönlendirici kancası (§B6) ve skill'ler | Belgenin kendisi; yalnız adres |
| 3 Başvuru | Sorulunca | Cetveller, planlar, ölçümler; NotebookLM defterleri | Geçerliliği bitmiş tarihçe (gövdede) |
| 4 Kilit | Okunmaz, çiğnenemez | 3-4 kez tekrar eden hata → test, CI kapısı ya da kanca | Metin olarak ikinci kopya |
| 5 Olgu | Kendiliğinden | Sayılar ve durumlar betikle üretilir (satır, tablo, belge sayısı, tarih) | Elle yazılmış sayı |

**Kural:** bir bilgi en alt uygun katmana yazılır. Bozulmaması gereken şey 4'e (kilit), değişen şey 5'e (olgu)
gider; 0'a ancak her oturumda gerekiyorsa girer.

## B2 — Tek giriş haritası

1. Tek giriş haritası `docs/README.md`'dir. Diğer haritaların adresini ve **hangi soruda hangisinin**
   kullanılacağını söyler: belge haritası (kendisi), kod haritaları (graphify + şema grafı, CodeGraph,
   WrongStack dizini), hafıza dizini (`MEMORY.md`), NotebookLM defterleri, iş kaydı (Linear + Kararlar belgesi).
2. `CLAUDE.md` harita **kopyası tutmaz**; tek satırla tek giriş haritasını gösterir.
3. Haritada olmayan belge **ajan için yoktur**. Yeni cetvel, haritaya satırı eklenmeden bitmiş sayılmaz.
4. Harita yalnız var olan yolu gösterir (§B7 kapısı).

## B3 — Yazım kuralı: gövde = geçerli kural

Taramadaki yanlışların kaynağı buydu; bu yüzden en çok bu kural önemlidir.

1. **Gövde yalnız bugün geçerli olanı söyler.** "BAYAT", "çürütüldü", "eski hâli", "v1 metni" gibi bantlar
   gövdede durmaz. Geçmiş sürüm en alttaki **Değişiklik kaydı**na ya da ayrı arşiv dosyasına gider.
2. Yürürlükten kalkan bir bölüm silinir ya da taşınır; "hükmü yoktur" notuyla yerinde bırakılmaz (hem ajanı
   hem defteri yanıltır).
3. Her belgenin başında **başlık bloğu**: `Ne yönetir` · `Niçin var` (tek paragraf) · `Sahibi` · `Kayıt` ·
   `Son doğrulama: YYYY-MM-DD` (belgenin kodla/durumla son karşılaştırıldığı gün; son düzenleme günü değil).
4. Olgu (sayı, adet, tarih aralığı) gövdeye elle yazılırsa yanına ölçüm günü yazılır; mümkünse betik çıktısına
   işaret edilir (§B1 katman 5).
5. "Niçin" hikâyesi kuralın yanında en fazla bir paragraftır; uzun anlatı ölçüm belgesine (`docs/audits/`)
   gider ve adresle bağlanır.

## B4 — Sahiplik

1. Her cetvelin bir sahibi vardır (şerit ya da oturum adı). Sahipsiz belge OPS'a yazılır.
2. Sahip, belgenin başlık bloğundaki `Son doğrulama` tarihini tazelemekten sorumludur.
3. Tazelik göstergesi bayat belgeyi sahibinin adıyla gösterir.

## B5 — Tazelik göstergesi

1. **Yeni ölçüm yazılmaz, mevcut ölçüm okunur.** Bayatlığı zaten ölçen araçların sonucu (defter satırı,
   bağımlılık, taban, bellek, hafıza indeksi bekçisi, companion yaşı, graphify/WrongStack dizin yaşı, kanca
   ölçümü) tek yerde toplanır.
2. **Yüzey:** her mesajda görünen mevcut durum satırları (UserPromptSubmit). Yeni satır yalnız eşik aşılınca
   `⚠` ile basılır; eşik altında tek kısa satır ya da hiç.
3. **Bütçe:** kancanın kendi işi 300 ms (node açılışı hariç; açılış toplam süreye 170-290 ms ekler —
   `proje-takip-defteri-standard.md` §5.1 ölçümü). Pahalı ölçüm burada koşmaz; önbellekten okunur. Önbellek yoksa ya da bayatsa satır bunu
   **söyler** (eski sayıyı taze gibi göstermek, göstermemekten kötüdür).
4. **Eşikler (v0.1 başlangıç değerleri; D2'de ölçümle ayarlanır):**

| Katman | Ölçüt | Eşik |
|---|---|---|
| Çekirdek belge (`CLAUDE.md`, `docs/README.md`, `CONTEXT.md`, `docs/DURUM-TAKIP.md`) | son doğrulama yaşı (alan yoksa vekil: son commit tarihi; satırda "vekil" yazılır) | 14 gün |
| Tek giriş haritası + `CLAUDE.md` | gösterdiği yollardan olmayan | ≥1 |
| Hafıza indeksi (`MEMORY.md`) | bayt / 16384 | ≥15800 (mevcut yumuşak eşik) |
| Kod haritaları (graphify, WrongStack dizini) | son üretimden bu yana gün | 7 gün |
| Koruma kancaları | son 24 saatte açık kalan (fail-open) çağrı | ≥1 |

**Not:** `Son doğrulama` alanı bugün (2026-09-27) hiçbir çekirdek belgede yok; bu dört dosya `docs/standards/`
dışında olduğu için B7.2 de onları görmez. Alanın dört çekirdek belgeye eklenmesi D2'nin açık adımıdır; o zamana
kadar vekil ölçü kullanılır.

## B6 — Yönlendirici

1. **Cevap üretmez, adres verir.** Belgeyi okumak ve uygulamak ajanın işidir; yönlendirici yanlış cevap
   üretme riski taşımaz ve ağ çağrısı yapmaz.
2. **Konu tablosu tek dosyadır**: konu → tetik kalıpları → adresler (cetvel dosyası, hafıza dersi, kod
   haritası aracı). Kalıplar çok kelimelidir; tek kelimelik ipucu kullanılmaz (her istemde öter).
3. **Doz:** istem başına en fazla 3 adres; aynı oturumda aynı adres ikinci kez basılmaz. Oturum başı
   tekilleştirme tekniği mevcut (`modele-ilet.cjs`: oturum kimliği + özet, geçici dizinde); UserPromptSubmit'te ilk
   kez uygulanacak.
4. Semantik hafıza araması (claude-mem) yönlendiriciden geçer ve bir benzerlik eşiği uygulanır; eşik altı kayıt
   basılmaz.
5. **Ölçüt:** (a) geçmişte yaşanmış en az 10 vakanın istemi yeniden oynatılınca doğru adres gelir;
   (b) son 7 günün istemleri üzerinde kuru koşumda yönlendirici istemlerin en fazla %30'unda öter.
   Ölçüt karşılanmadan kanca açılmaz.
6. Mevcut `hafiza-sorusu-yonlendirme.cjs` bu tablonun bir satırıdır; ayrı kalmaz.

## B7 — Kilit (kapılar)

1. **Kırık yol kapısı:** tek giriş haritası ve `CLAUDE.md` içindeki her depo yolu var olmalı. CI'da koşar.
   Şunlar yol sayılmaz, ayrı sayılır ve bloklamaz: yer tutucu (`<ingestor>`, `<tarih>`), glob (`*`, `**`, `{a,b}`),
   depo dışı mutlak yol (`C:/Users/...`), URL. Bugünkü `CLAUDE.md` bu sınıfların üçünü taşıyor; kapı ilk koşumda
   bunlarda kırmızı verirse kör değil yanlış yazılmıştır.
2. **Başlık bloğu kapısı:** `docs/standards/` altında **yeni eklenen ya da değişen** cetvelde `Sahibi` ve
   `Son doğrulama` alanları bulunmalı. Eski belgeler sayılır, bloklamaz (companion C4 yaklaşımı).
3. **Gövde bandı uyarısı:** değişen cetvelin gövdesinde (Değişiklik kaydı dışında) "BAYAT / çürütüldü / hükmü
   yoktur" gibi bant kalıbı uyarı verir; bloklamaz (yanlış alarm oranı ölçülmeden bloklamaya çevrilmez).
4. Her kapı sabotaj testiyle doğar (yolu boz → kırmızı; alanı sil → kırmızı). Yeşil kalan sabotaj kapıyı
   kör sayar.

## B8 — Oturum sürekliliği

1. Compact ve oturum kapanışında korunacaklar: son kullanıcı girdisi, açık işler, verilen sözler, bekleyen
   kararlar.
2. Her oturumun yanında **"şu an" dosyası**: en fazla bir sayfa, her compact öncesi ÜZERİNE yazılır. Eklemeli
   günlük ayrı kalır (arşiv).
3. Compact öncesi denetim yalnız "dosya yazıldı mı" değil, **"şu an" dosyasında bu dört alan dolu mu** diye
   bakar.
4. Bu işler kullanıcının "oturum sonu / gün sonu" demesine bağlı değildir: PreCompact ve SessionEnd'de koşar.
5. `MEMORY.md` yalnız kısa işaretçi taşır; ayrıntı konu dosyalarındadır ve konuya göre yönlendiriciyle gelir.

## B9 — Uygulama durumu

| Madde | Hâl | Doğacağı dilim |
|---|---|---|
| B2 tek giriş haritası, B1 çekirdek (`CLAUDE.md` harita hâli, `AGENTS.md`) | YOK | D3 (Recep onayı) |
| B3 yazım kuralı, B4 sahiplik | Kural bu belgeyle yürürlükte; mevcut belgeler D5'te taşınır | D5 |
| B5 tazelik göstergesi | Kısmen var (defter, bağımlılık, taban, bellek satırları) | D2 |
| B6 yönlendirici | Kısmen var (yalnız geçmiş-karar sorusu kalıbı) | D4 (Recep onayı) |
| B7 kapılar | YOK | D2 |
| B8 oturum sürekliliği | Kısmen var (compact öncesi yazıldı-mı denetimi) | D6 |

Dilim listesi ve ölçütler REC-400 planındadır.

## Kapsam dışı

- Kod yanı companion belgeleri: `companion-doc-standard.md`. Yan yana ölçüm (companion ↔ kod haritaları)
  yapılmadan bu cetvel onlar hakkında hüküm vermez.
- `.agent/skills/` (Antigravity işçisinin skill ağacı) `.claude/skills/` ile kasıtlı çift ağaçtır; birleştirilmez.
  İşçi çekirdek kuralı `AGENTS.md` köprüsüyle okur (B1).
- Kod haritalarının kendisi (indeksleme): araç olarak kullanılır, bu cetvelin konusu değildir.
- `CLAUDE.md`, `.claude/settings.json`, `.mcp.json` değişikliği her durumda Recep onayıyla yapılır; bu cetvel
  o kapıyı gevşetmez.

---

## Değişiklik kaydı

- **v0.1 (2026-09-27, REC-400 D1):** ilk taslak. Kaynak: belge taraması (163 bulgu), 37 uzman videosu, araç
  kıyası (22 araç), kanca ölçümü (7 gün). Eşikler başlangıç değeridir.
