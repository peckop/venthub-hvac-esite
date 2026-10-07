# Test Çalıştırma Düzeni ve Test Karnesi — Cetvel v1.0

**Sürüm 1.0 · 2026-10-06 · Sahibi: ALTYAPI · Son doğrulama: 2026-10-07 · Kaynak: Kanban ALT-38 (OPS emri, Recep "başlat" dedi 10-06) ve karar 296; §4.3: ALT-38e, karar 308**

> **Zorlayan kapılar:**
> `INV-TEST-KOSU-1` → `src/__tests__/conformance/test-kosu-kapsami.test.ts` ·
> `INV-CI-EDITED-1` → `src/__tests__/conformance/ci-edited-ayna.test.ts` ·
> `INV-CI-EDITED-2` → `scripts/ci/__tests__/edited-ayna.test.ts` ·
> `INV-DUNYA-SATIRI-1` → `src/__tests__/conformance/dunya-durumu-satiri.test.ts` ·
> `INV-CI-SINIF-1`, `INV-CI-SINIF-2` ve `INV-CI-SINIF-3` → `src/__tests__/conformance/ci-degisiklik-sinifi.test.ts` ·
> `INV-CI-SHARD-1` ve `INV-CI-SHARD-2` → `src/__tests__/conformance/ci-test-shard.test.ts` ·
> `INV-CI-SECIM-1` → `src/__tests__/conformance/ci-test-secimi.test.ts` ve `src/__tests__/conformance/ci-test-secimi-ifade.test.ts` ·
> `INV-CI-SECIM-2` → `src/__tests__/conformance/ci-test-secimi-kapsam.test.ts`, `src/__tests__/conformance/ci-test-secimi-hizli.test.ts`, `src/__tests__/conformance/ci-test-secimi-uyum.test.ts` ve `scripts/ci/__tests__/test-shard-secim.test.ts` (ortak yardımcı: `ci-test-secimi.yardimci.ts`)
>
> **Kapsam:** bu sürüm testlerin NEREDE koşacağını yönetir (§1–§5). Her test dosyasının KARNESİ (neyi koruyor, gerçekten
> kırmızı veriyor mu, ortama bağlı mı, aynısını başka test koruyor mu) ve silme listesi kuralı işin ikinci teslimiyle (ALT-38b)
> bu dosyaya §6'dan sonra eklenir. O zamana kadar karne bölümü bu cetvelde YOKTUR; "yok" bir eksik değil, işin ikinci teslimidir.

## 1. Amaç ve ilke

Bir testin pull request'te (PR) koşması, yalnız o PR'ın KENDİ hatasını göstermesiyle meşrudur. İki ölçülmüş sorun bu cetveli doğurdu:

1. **Dünya durumu testleri suçsuz PR'ı bloklar.** Kırmızısı PR'ın kodundan değil dünyanın durumundan gelen test (master'ın taşınan
   hâli, saat, tabanın dökülme tarihi, dış sistem, yerel makine), yazarın düzeltemeyeceği bir şeyi bekletir. CI geçmişinde
   (2026-07-06..10-06) şema tabanı testi 55 kırmızı koşuda ve 39 farklı dalda kırmızı verdi; OPS'un 10-06 ölçümünde son 10
   kırmızının 5'i buydu.
2. **PR başlığı ya da gövdesi düzenlenince paketin tamamı yeniden koşuyordu.** 10-03..10-06 arasında 187 PR koşusunun 50'si (%27) aynı
   commit'in tekrarıydı; 30'u iptal edilen bir tam koşunun ardından, 5'i yeşil bir tam koşunun ardından geldi.

**İlke: hiçbir koruma sessizce düşmez.** Bir testi PR kapısından çıkarmak onu SİLMEK ya da ZAYIFLATMAK değildir: neden, kanıt ve yeni
yer yazılıdır, yeni yerde gerçekten koştuğunu bir kapı doğrular, kırmızısı kanca satırlarında görünür. Silme ayrı bir karardır
(karne bölümüyle gelir) ve bu cetvelin hiçbir kuralı test silmez.

## 2. Bir testin koşabileceği yerler

| Yer | Ne zaman | Hangi testler | Kırmızıda ne olur |
|---|---|---|---|
| PR kapısı (`pull_request` olayı: paralel `test-shard` işleri, §4.2; `ci` işinin Test adımı yalnız `edited` koşusunda) | PR açılınca ve her güncellemede | dünya durumu listesi DIŞINDAKİ hepsi (kip `dislan`), her dosya TAM BİR shard'da; seçici daraltırsa (§4.3) yalnız seçilenler, şüphede hepsi | kırmızı shard `ci`yi kırmızı yapar (son adım bekler), birleştirme durur |
| master push (`ci` işi, aynı Test adımı) | master'a her birleşmede | TAM paket, liste dahil (kip boş) | master kırmızı; ⚠ aynı `concurrency` grubunda koşu iptal edilebilir (07-06..10-06: 1119 master koşusunun 419'u iptal), tek başına güvence DEĞİLDİR |
| Zamanlı (`dunya-durumu.yml`) | 6 saatte bir (`23 */6 * * *`) ve elle | YALNIZ dünya durumu listesi (kip `yalniz`) | iş akışı kırmızı; PR'ı bloklamaz, kanca satırı `DUNYA:` her mesajda gösterir |
| Yerel `pnpm test` | elle | TAM paket (kip boş) | geliştiricinin terminalinde |

Üç kip `VENTHUB_DUNYA_DURUMU` ortam değişkeniyle seçilir (`scripts/ci/dunya-durumu.cjs`, `vitest.config.ts` okur). Geçersiz değer
FIRLATIR: yanlış yazılmış bir kip kapıyı gizlice kaldırırdı. Vitest'in statik dışlamaları (`tests/e2e/empirical_*`: canlı
veritabanı ister; `tests/smoke/**`: ayakta sunucu ister) `INV-TEST-KOSU-1` tablosunda gerekçesiyle ve koştukları yerle yazılıdır.

## 3. Dünya durumu testleri

**Tanım.** Kırmızısı PR'ın dosyalarından değil, PR'dan bağımsız değişen bir şeyden gelen test: master'ın o anki durumu, saat/tarih,
tabanın son dökülme tarihi, dış sistem, bu makinenin durumu.

**PR kapısından çıkarma kuralı** (`scripts/ci/dunya-durumu-testleri.json`, her kayıt):

- Tek tek dosya yolu yazılır; glob YASAK (kapsam sessizce genişlemesin).
- `neden`: testin neden dünya durumu olduğu. `kanit`: CI geçmişinden (aynı test ≥3 farklı dalda 12 saat içinde kırmızı = dünya olayı
  kümesi) ya da koddan gösterilmiş bağ. İkisi de en az 20 karakter, boş geçilmez.
- `yeniYer`: `zamanli` ZORUNLU (master push tek başına güvence değildir), ayrıca `master-push`.
- Testin KENDİ kodunu koruyan kollar PR kapısında KALIR. Örnek (ilk kayıt): şema tabanı testi ikiye bölündü. `taban-tazeligi-dunya.test.ts`
  yalnız tazelik kolunu taşır (listede); `taban-tazeligi.test.ts` evren, kısmi dosya, damga biçimi ve README kollarını taşımaya
  devam eder, ortak yardımcıların aynı kaldığını bir kayma testi ölçer.
- Ölçülmeden listeye girmez: ilk aday listesinde anılan `recep-sozu-defteri` testi ölçülünce dünya durumu ÇIKMADI (ev dizinine
  yazmaz, saat göreli, ağ yok, kırmızısı yalnız PR'ın kendi kodundan gelir), PR kapısında kalır. Defter/NotebookLM ailesinde (17 dosya,
  245 test tanımı, yaklaşık 280 vaka; hepsi yeşildi) gerçek NotebookLM'e ya da defter durumunun yaşına bakıp assert eden test yoktur;
  bayat defter (yerel kayıtta 10 gün) yeşil kaldı çünkü hiçbiri dünyayı ölçmüyordu. O boşluk
  bu cetvelin konusu değil, ayrı bir iştir (canlı oturum yoklaması).
- Aday olup bu sürümde TAŞINMAYANLAR: kırmızısı kısmen takvime bağlı kollar (`companion-parity-coverage`, `karar-kayit-bagi`). Dosya
  düzeyinde taşıma PR farkını koruyan kolları da götürür; bölme önerisi karne ile gelir.

**PR'ın kendi listesi tek başına yetmez (güvenlik incelemesi B3).** `dislan` kipinde dışarıda kalan küme = PR'ın listesi ∩ master'daki
liste (`git show HEAD^1:scripts/ci/dunya-durumu-testleri.json`): bir PR listeye kendi kırmızı testini ekleyip kendi `ci`'sını yeşile
çeviremez; yeni kayıt kendi PR'ında dışlanmaz, birleşince sonraki PR'larda etkili olur. Taban listesi okunamazsa (git yok, ilk PR, bozuk
dosya) HİÇBİR test dışlanmaz: tam paket koşar, uyarı yazılır. Yerel kullanım ve testler taban listesini `VENTHUB_DUNYA_TABAN_LISTESI=<dosya yolu>`
ile elle verebilir (doluyken okunamıyorsa git'e DÜŞÜLMEZ). Liste `dislan` ve `yalniz` kiplerinde her yüklemede doğrulanır, geçersizse
yapılandırma FIRLATIR. Dışlama mekanizmasının kendi koruyucu testleri (`INV-CI-EDITED-1/2`, `INV-TEST-KOSU-1`, `INV-DUNYA-SATIRI-1`, `INV-CI-SINIF-1/2/3`
dosyaları ve sınıflayıcının karar tablosu `degisiklik-sinifi.test.ts`, `DISLANAMAZ` sabiti) listeye GİREMEZ.

**Görünen yüz.** Zamanlı koşunun kırmızısı ya da sessizce ölmesi `DUNYA:` kanca satırında görünür (`.claude/hooks/dunya-durumu-satiri.cjs`,
`defter-tazelik-satiri.cjs` çağırır): yolundayken susar, kırmızıda ve ölçüm bayatlayınca konuşur. Sorgu yalnız `master` dalının koşularına
bakar (başka dalın elle koşusu master'ın kırmızısını örtmez); GitHub 404 verirse bilinen kırmızı silinmez, "ölçemedim" olarak korunur;
damgası çözülemeyen ölçüm ya da bitiş saati okunamayan başarılı koşu susmaz, "ölçülemedi" der. Taban testinin kendi satırı `TABAN:`.

## 4. `edited` aynası

PR başlığı ya da gövdesi düzenlenince (`pull_request` türü `edited`) koşan `ci` işi iki şey yapar:

- **PR kayıt kapısı HER ZAMAN koşar** (karar 187: gövdeye `Kanban:` satırı sonradan eklenince kayıt yeniden denetlenir).
- **Ağır adımlar yalnız şu üç koşulun HEPSİ sağlanırsa atlanır** (`scripts/ci/edited-ayna.cjs`): (1) aynı head SHA için bu koşudan ÖNCE başlamış
  bir TAM koşu var, (2) o tam koşu AYNI TABANI test etmiş: her tam koşu test ettiği tabanı (birleşim commit'inin birinci ebeveyni,
  `HEAD^1`) `taban izi <sha>` adlı adımın ADINA yazar ve bu koşunun tabanı o izle birebir aynıdır, (3) bu iz taşıyan tam koşuların
  HİÇBİRİ kırmızı ya da iptal değildir ve en az biri `success` ile bitmiştir (süren koşu varsa bitmesi BEKLENİR, en çok 11 dk, 30 sn
  aralıkla). Her başka durumda ve her hatada TAM koşu yapılır (fail-closed); bu yüzden yeşil bir `ci` daima gerçek bir tam yeşile
  dayanır ve bir düzenleme kırmızı bir koşuyu yeşile ÇEVİREMEZ.
- **Güvenlik incelemesi düzeltmeleri (ALT-38a, security-reviewer)**: (B1) aynı SHA'lı iki PR'dan birinin yeşili ötekinin kırmızısını örtemez
  ve `gh pr edit --base` ile taban değişince test edilmemiş birleşim atlatılamaz: taban SHA eşitliği şart, `changes.base` doluysa doğrudan
  TAM. (B2) karar betiği PR'ın KENDİ kopyasından değil TABANDAN (`git show HEAD^1:scripts/ci/edited-ayna.cjs`) koşar, taban kopyası yoksa
  TAM; PR `scripts/ci/`, `.github/workflows/`, `vitest.config.ts` ya da `package.json`'a dokunuyorsa betik kendisi TAM der; birleşim
  commit'inin ikinci ebeveyni PR başı değilse TAM. (B4) iz taşıyan tam koşulardan herhangi biri başarısızsa TAM. (B5) biten koşunun
  işleri bir kez okunur; bekleme turu yalnız koşu listesini sorgular (GITHUB_TOKEN bütçesi saatte 1000 istek).
- `edited` ayrı `concurrency` grubundadır: koşan TAM koşuyu iptal etmez.
- **Güven sınırı.** İş akışı dosyasını (`ci.yml`) değiştiren bir PR bu korumaları da değiştirebilir; onu mekanik bir kapı değil kod
  incelemesi yakalar. `CODEOWNERS` bugün boş: `.github/workflows/`, `scripts/ci/` ve `vitest.config.ts` için sahip atanması OPS'a
  önerilmiştir (depo yönetişimi, bu cetvelin kararı değil).

**Yasaklar** (hepsi `INV-CI-EDITED-1` ile ölçülür): `ci` işine iş düzeyinde `if:` konmaz (atlanan iş "başarılı" sayılır, zorunlu kontrol
hiçbir şey koşmadan yeşil görünür); işin adı `ci` DEĞİŞMEZ (zorunlu kontrol bu ada bağlı); izinler yalnız okuma (`contents`, `actions`,
`pull-requests`), yazma yok; kayıt kapısı, döküm kapısı (ALT-39), checkout, taban izi ve pnpm/Node kurulum adımları atlama koşulu taşımaz (ağır adımlar: Deno
kurulumu, bağımlılık kurulumu, lint, tip denetimi, Deno ve Edge kapıları, gizli bilgi taraması, test, derleme); iz adımlarının koşulu yalnız
`pull_request` olayıdır (bir `edited` koşulu iz yazmayı keserdi); checkout tam geçmişle gelir (`fetch-depth: 0`, `HEAD^1` için şart);
her yeni adım "ağır mı, hep koşan mı" diye sınıflandırılmadan eklenemez.

### 4.1 Değişiklik sınıfı: siteye dokunmayan PR'da Build ve e2e atlanır (ALT-38c, karar 296 ve 297)

**Ne.** `scripts/ci/degisiklik-sinifi.cjs` PR'ın değişen dosyalarını (`git diff HEAD^1 HEAD`) sınıflar: `belge` (docs/, .claude/, .agent/, kök `*.md`),
`edge` (supabase/functions/), `betik` (scripts/ ve tools/; `scripts/ci/` ve build-sırası betikleri hariç), `karma` (birden çok dar sınıf) ya da `tam`.
Dosyaların TÜMÜ dar sınıflardaysa `ci` işinin `Build (blocking)` adımı ve `admin-smoke` işinin ağır adımları atlanır. **Test adımı HİÇBİR sınıfta atlanmaz.**

**Güvenlik yönü.** Yanlış yön HEP `tam`dır: sınıflanamayan, şüpheli, mutlak/`..`/kontrol karakterli yol, boş liste, 2000+ dosya ve her git hatası `tam` sayılır.
Koşullar yalnız daraltma yönündedir: dar küme (belge, edge, betik, karma) AÇIKÇA yazılmışsa atlanır; çıktı boş, `tam`, bilinmeyen ya da adım koşmamışsa
(push, elle koşum, hata) her şey koşar. Sınıflayıcı PR'ın kendi kopyasından değil tabandan (`git show HEAD^1:`) çıkarılıp koşar. `admin-smoke` iş düzeyinde
`if`/`needs` taşımaz: atlanan iş zorunlu kontrolde YEŞİL sayılır ve sınıf işi çökerse boşluk açılırdı; adım düzeyi koşul kullanılır, iş her durumda
`admin-smoke` adıyla koşar ve biter.

**Sınıflayıcı çökerse (INV-CI-SINIF-3).** Sınıflayıcı kendi içinde hiçbir hatayı dışarı fırlatmaz (her hata `tam` yazar, son sigortası vardır); yine de tümden çökerse
(sözdizimi hatası, bellek, sinyal) adım KIRMIZI kalmaz: `sinif=tam` yazar, `::warning::` verir ve tam paket koşar. Kırmızı kalsaydı, tabandaki sınıflayıcı bozulduğunda onu
düzelten PR de aynı bozuk kopyayı (`HEAD^1`) koşup birleşemezdi (kilitlenme). Adımın GERÇEK gövdesi testte gerçek git ve bash ile koşar: belge farkı `belge`, kod farkı `tam`,
çöken sınıflayıcı `tam`, taban kopyası yok `tam`; yedek silinirse çöken sınıflayıcı adımı kırmızı yapar (kontrol testi).

**Tanım ölçülür (INV-CI-SINIF-2).** "Siteye dokunmayan" elle listeye değil ölçüme dayanır: derleme girdisi (src/ ve kök ayar dosyaları) src/ ve public/ DIŞINA bir
dosya aktarırsa ya da dosya sisteminden okursa o hedef `tam` olmak zorundadır; `package.json`ın build, lint, test, type-check ve prepare betiklerinin çağırdığı
`scripts/` dosyaları (`assert-node-major.mjs`, `setup-hooks.mjs`) tam yol girdisiyle `tam`dır; atlanabilen e2e işinin çağırdığı betikler `scripts/ci/` altındadır.
2026-10-07 ölçümü: 738 dosya tarandı, src/ dışına aktarma yok, `next.config.mjs` yalnız src/ okur.

**Neden Test atlanmıyor.** Test süresinin %90'ı dosya okuyan conformance testleridir ve belge ya da betik değişikliğinden etkilenebilir; saf kod testlerinin payı %6,7'dir
(yaklaşık 20 sn). İnce seçim karar 308 ile ayrı işte yapılır (okunan yollardan otomatik tetik haritası, `vitest related`, güvenlik ağı: master push ve gece tam koşusu).

**Önbellekler.** Next.js derleme önbelleği (`.next/cache`, Build ile AYNI koşul) ve Node V8 bayt kodu önbelleği (`NODE_COMPILE_CACHE`, yalnız Test adımı) yalnız hızdır;
girdileri içerik özetiyle doğrulanır, sonucu değiştirmez.

### 4.2 Test shard'ları: PR'da testler paralel işlerde koşar (ALT-38c-2)

**Neden.** `ci` işinin Test adımı tek işte yaklaşık 4:30-6:30 dk sürüyordu (ALT-38c ölçümü, 2026-10-06; süre payının %90'ı dosya okuyan conformance kapılarıdır); belge ya da kod PR'ının zorunlu kontrolü bu süre kadar bekliyordu.
Testler birbirinden bağımsız dosyalar olduğundan paralel koşabilir. Vitest'in kendi `--shard=i/N`'i dosya SAYISINA böler; tek dosyası 130 sn süren kanca testleri olduğundan dengesiz kalır.
Bu yüzden her dosya bilinen süresiyle (`scripts/ci/test-sureleri.json`, yerel ölçüm) en az yüklü parçaya atanır.

**Tasarım.**

- `pull_request` olayında (`edited` HARİÇ) `ci` işindeki `Test` adımı KAPALIDIR; dört `test-shard (i/4)` işi paralel koşar. Her iş `node scripts/ci/test-shard.cjs --shard i --toplam 4` ile
  `vitest list --filesOnly --json` çıktısını (koşan paketin kendi listesi, `dislan` kipi dahil) süreye göre LPT ile böler, kendi parçasını yazar; `VENTHUB_TEST_SHARD_DOSYALARI` ile `vitest.config.ts`
  `include`ı o parçaya sınırlanır. Aynı girdi her işte aynı bölmeyi üretir (ortak durum yok). Ölçüm (yerel, 2026-10-07, `dislan` kipi): 625 dosya (+1 dünya durumu dosyası = tam paket 626), parçalar 154/157/157/157 dosya, birleşim = liste, kesişim 0, en yüklü/ortalama 1,00.
- `ci` işinin SON adımı "Test shard sonuçları (bekle ve doğrula)" (`scripts/ci/test-shard-bekle.cjs`), AYNI koşunun AYNI denemesinin (`run_id` + `run_attempt`) `test-shard (i/N)` işlerinin HEPSİ `success`
  olmadan yeşil vermez. Lint, tip, Deno kapıları ve Build shard'larla ÜST ÜSTE koşar, bu yüzden bekleme en sondadır. Zorunlu kontrol `ci` adıdır; `needs`'li ayrı bir toplayıcı iş YOKTUR
  (`ci`yi bölmek `edited` aynasını ve testlerini yeniden yazdırırdı, aynası `ci` işinin adımlarını okur).
- master push, elle koşum ve `edited` koşusunda `Test` `ci` içinde eskisi gibi TAM koşar (`Test`in koşulu shard olayının tersidir: `... && !(github.event_name == 'pull_request' && github.event.action != 'edited')`).
  Böylece her olayda testler TAM BİR yerde koşar: PR'da shard'larda, öteki olaylarda `ci` içinde.

**Güvenlik yönü: her belirsizlik KIRMIZIDIR.**

- Kırmızı, iptal, atlanan ya da başka her bitmiş sonuç `success` değilse kırmızıdır ve kalan shard'lar beklenmeden hemen kırmızı verilir. Beklenen N shard'dan eksik olan (45 sn listeleme gecikmesi
  toleransından sonra), fazladan ya da aynı adı taşıyan iş, 900 sn zaman aşımı, üst üste 3 kez okunamayan API ve geçersiz ortam kırmızıdır; doğrulanamayan shard yeşil sayılmaz.
- Dağıtıcı ya doğru böler ya kırmızı verir: her dosya TAM BİR parçaya girer (birleşim = `vitest list`, kesişim 0); boş parça, tekrar eden dosya, geçersiz N, kök dışı ya da `..` içeren yol, boş liste,
  bozuk süre dosyası ve çalışmayan `vitest list` çıkış kodu 1 verir. Süresi yazılmamış (yeni) dosya varsayılan ağırlıkla dağıtılır: kapsam kaybı sıfır.
- Shard'ların Test adımı yalnız §4.3'teki seçim koşuluyla (TAM beklenen satır: seçim kendiliğinden boş değilse ve parçaya test düştüyse koşar) atlanabilir; başka `if`, `continue-on-error`, `|| true` taşımaz; kabuk açık `bash` (pipefail, `| tee` kırmızıyı yutmaz); `--shard "$SHARD"` matrix numarasını taşır, `--toplam`, matrix
  sayısı, `ci`nin `SHARD_TOPLAM`ı ve iş adındaki `/N` AYNI sayıdır. Dünya durumu testleri shard'larda `dislan` kipiyle dışarıda kalır (§3): kapsam kanıtı shard'lar ∪ dünya durumu listesi = tam paket.

**Yeniden koşum kuralı.** Bekleyici yalnız bu denemenin (`run_attempt`) iş listesine bakar; önceki denemenin yeşili bu denemeye TAŞINMAZ. Kısmi yeniden koşumda (yalnız kırmızı işler yeniden koşturulunca) iş listesinde
görünmeyen shard "eksik" sayılır ve `ci` KIRMIZI olur: çare "Re-run all jobs" (ya da yeni commit). Bu bilinçli fail-closed seçimdir: eksik kanıt yeşil sayılmaz.

**Sayıyı değiştirmek.** Shard sayısı dört yerde yazılıdır (matrix, `--toplam`, `ci`nin `SHARD_TOPLAM`ı, iş adındaki `/N`) ve `INV-CI-SHARD-1` hepsinin eşitliğini ölçer (adım adındaki `/N` yalnız etikettir).
Sayı değişince bölme otomatik uyar; denge `INV-CI-SHARD-2`de en yüklü/ortalama <= 1,25 olarak ölçülür. Yeni ağır test dosyası eklenince `scripts/ci/test-sureleri.json`a süresi yazılırsa denge korunur;
yazılmazsa dosya varsayılan ağırlıkla yine bir parçaya girer (kapsam kaybı olmaz, yalnız denge bozulabilir).

### 4.3 Test seçimi ve belge hızlı yolu: PR'da yalnız değişenle ilgili testler koşar (ALT-38e, karar 308)

**Neden.** PR'da her seferinde ~626 test dosyası koşuyor, belge PR'ının `ci`si de kurulum, Lint, tip ve Deno kapılarını bekliyordu. Çoğu testin girdisi bellidir (içe aktardığı kod ya da koşarken okuduğu dosya); okumadığı bir belge değişince sonucu değişemez.

**Seçici ve harita.** `scripts/ci/test-sec.cjs` (karar mantığı ALT-38d) PR'ın değişen dosyalarından (`git diff HEAD^1 HEAD`) koşacak testleri seçer: küresel dosya (kilit, paket, yapılandırma, iş akışı, `scripts/ci/`, migration) ya da haritanın bilmediği kök `tam`dır; değişen test dosyası seçilir;
`vitest related` (içe aktarma grafiği) ile ölçülmüş harita (`scripts/ci/test-haritasi.json`: testin koşarken okuduğu dosya/dizin) birleşir; haritada kaydı olmayan, bayat ya da `belirsiz` işaretli test HER ZAMAN koşar. Şüphede, hatada ve okunamayan çıktıda `tam`.

**Bağlama: YALNIZ `test-shard` işlerinde.** Seçici `ci` içinde, master push, elle koşum, `edited` ve zamanlı koşuda HİÇ çalışmaz (o olaylarda tam paket koşar: `ci`nin Test'i ve `dunya-durumu.yml`). Seçici, haritası ve sınıflayıcısı (`degisiklik-sinifi.cjs`: seçici onu önce kendi yanından, yoksa checkout'tan yükler; yanında olmazsa PR'ın kopyası kurulumdan ÖNCE seçici sürecinde koşardı) PR'ın kendi kopyasından değil TABANDAN (`git show HEAD^1:`) çıkarılıp
`$RUNNER_TEMP/secici/` altında koşar: PR'ın seçici kopyası koşmaz; üçünden biri tabanda yoksa (ilk PR) `tam`. İki geçiş vardır: (1) kurulumdan ÖNCE `--vitestsiz` (vitest açılmaz; yalnız `.md`/`.csv` gibi içe aktarılamaz dosyalar değiştiyse kendisi cevap verir, değilse `tam=true` yazar);
seçim kendiliğinden BOŞSA (`tam=false` ve `secilen-sayisi=0`: adım bunu SON satırında `bos=true` diye yazar, başka her durumda `bos=false`) Deno, kurulum, V8 önbelleği, ikinci geçiş, dağıtım ve Test atlanır ve iş saniyeler içinde yeşil biter; (2) kurulumdan sonra vitest'li geçiş nihai seçimi verir (vitest'in kendi listesi ve `related` grafiği). Dağıtıcı (`test-shard.cjs --secim ...`)
yalnız ikinci geçişin çıktısını okur ve doğrular; bölmeyi HER ZAMAN `vitest list`in tam listesi üzerinde (aynı LPT) yapar ve her iş kendi parçasını seçimle SÜZER (tüm işler seçimdeyse birleşim = seçim, kesişim 0). Neden: dört shard işi seçimi birbirinden bağımsız hesaplar;
biri tam'a düşerse (seçici çöktü, ikinci geçiş kesildi) ve bölme seçim üstünde olsaydı bölmeler ayrışır, seçilen testler hiçbir işte koşmazdı (gerçek seçimlerde bir iş tam'a düşünce 59 seçilenden 11-12, 131 seçilenden 22-27 test hiçbir işte koşmuyordu); tam listede bölününce birleşim her kombinasyonda ⊇ seçim. Bedel: seçilenler
parçalara seçimin kendi LPT'sine göre değil tam listeninkine göre dağılır; 2026-10-07 ölçümünde belge ve kod PR'larında seçilenin en yüklü/ortalama oranı 1,8-2,0 (seçimin kendi bölmesinde 1,0). Dengeyi bozmayan çözüm seçimi tek yerde (ayrı iş) yapmaktır; ölçüm gerektirirse ayrı iştir.
Parçaya hiç test düşmezse (seçim az ya da başka parçada) `kos=false` yazar ve o parçada vitest koşmaz. Lifecycle betikleri YALNIZ shard kurulumunda kapalıdır (`--ignore-scripts`): kökün `postinstall`ı `tsc --noEmit` koşturur (~20 sn, her shard'da),
testler onu kullanmaz; tip denetimi `ci` işindedir ve orada kurulum DEĞİŞMEZ.

**Güvenlik yönü: seçim yalnız DARALTIR.** Dağıtıcıda `tam` harfi harfine `false`, seçilen sayısı geçerli bir tam sayı ve dosyadaki satır sayısına eşit, her yol geçerli ve diskte var, tekrar yok, seçilenin her dosyası `vitest list`te olmalı; biri tutmazsa tam paket dağıtılır ve `::warning::` yazılır.
Seçici çökerse adım kırmızı olmaz `tam=true` yazar (tabandaki seçici bozulursa onu düzelten PR kilitlenmesin; seçici kendisi asla `tam=false` yazamaz). Kurulum/Test koşulları adımın yazdığı `bos` çıktısını `!= 'true'` ile okur: çıktı eksik, boş ya da başka bir değerse KOŞAR. Seçicinin ham çıktısı koşulda KULLANILMAZ: GitHub eşitsiz türleri sayıya çevirir (null ve `'0'` ikisi de 0), bu yüzden `secilen-sayisi != '0'` yarım çıktıda (`tam=false`, sayı yok) kurulumu ve Test'i sessizce atlatırdı. Tam modda boş parça hâlâ kırmızıdır; boş parça yalnız geçerli seçim modunda meşrudur.
Seçici çıktısı dağıtıcıya argüman olarak verilir, ortam değişkeni olarak testlerin adımına GİRMEZ (canlı ders #1741: Test adımının ortamı alt süreçlere miras kalır).

**Belge hızlı yolu (`ci` işi).** Sınıf `belge` iken `ci` içinde kurulum, Lint, tip, Deno ve edge kapıları ve V8 önbelleği atlanır; PR kayıt kapısı, Secret guard, Döküm kapısı (`.csv` dökümü hızlı yola girer), taban izi ve sınıf adımı HEP koşar. `belge` sınıfı tek başına YETMEZ: `.claude/` ve `docs/` altındaki `.cjs`/`.mjs` dosyaları da `belge`dir ama
`eslint .` onları tarar (2026-10-07 ölçümü: `.claude/hooks/*.cjs` ignore edilmiyor; 52 `.cjs` + 11 `.mjs` belge dizinlerinde), `.ts`/`.tsx` tsc'nin girdisidir, JSON'u bir test içe aktarırsa tip denetimi değişir. Bu yüzden `Hızlı yol` adımı git'in kendi yol süzgeciyle (`:(exclude,glob)**/*.md`, `.txt`, `.csv`) yalnız bu üç uzantıdaki farkta
`belge=true` yazar; dışarıda kalan tek bir fark (kod, JSON, silinen ya da taşınan kod dosyası, boş fark, git hatası) çıktıyı YAZMAZ ve her kapı koşar. `edited` koşusunda adım hiç açılmaz (o koşuda `ci`nin Test'i kuruluma ihtiyaç duyar). Kod kapıları çıktıyı `!= 'true'` ile okur.

**Belge PR'ında kazanç nereden gelir.** Belirsiz testler (alt38d ölçümü, 2026-10-07: 41 test) her PR'da koşar; bu yüzden belge PR'ında bile seçim boş kalmaz, shard'lar kurulum yapar ve boş seçim yolu savunmadır. Belge hızlı yolunun kazancı `ci` işindeki kurulum, Lint, tip ve Deno atlamasıdır; `ci` son adımda shard'ları bekler, yani süre en yavaş shard'a da bağlıdır.

**Kabul edilen riskler.** (1) PR kodunun çalıştığı yerler: birinci geçiş (kurulumsuz, `bos` kararı) yalnız tabandan çıkan kodla koşar; ikinci geçişte vitest PR'ın `vitest.config.ts` ve `scripts/ci/` dosyalarını yükler ve testlerin kendisi PR kodudur. Garanti "PR'ın seçici kopyası koşmaz"dır, kötü niyetli PR'a karşı değil: `ci.yml`'i değiştirebilen PR her kapıyı değiştirebilir, kapı inceleme ve
`ci.yml`/`scripts/ci/` değişikliğinin küresel (tam) sayılmasıdır. (2) Kurulumu atlanan işlerde (belge hızlı yolu, boş seçim) `setup-node`'un önbellek KAYDI adımı, pnpm deposu önbelleğinde ıska varsa `Path Validation Error` ile işi kırmızı yapar (v7.0.0 kaynağı: `saveCache` hatası yakalanmaz); yeniden koşum çözer (aynı koşuda kurulum yapan shard işleri önbelleği kaydeder).
`edited` aynasının kurulumu atladığı koşularda aynı yol zaten vardı; kilit dosyası değişip master önbelleği henüz kaydedilmemişken açılan belge PR'ı en olası tetikleyicidir.

**Dürüstçe ele alınmayanlar.** Harita bir ölçümdür (ölçümde çalışmayan kol eksik kalabilir: atlanan test `belirsiz` sayılır; master push tam koşar; haritanın gece yenilenmesi seçici cetvelindedir). Seçici ve harita tabandan geldiği için yeni seçici/harita ancak birleşince etkindir (ilk PR tam koşar). İlk ölçüm PR'ın kendi koşusundadır
(`ci` süresi: okunmayan belge, okunan belge, kod PR'ı); yerel ölçüm yalnız kurulumdur (postinstall açık 29 sn, `--ignore-scripts` 3 sn).

## 5. Kapılar ve görünen yüzler

| Kapı | Dosya | Neyi ölçer |
|---|---|---|
| `INV-CI-SINIF-1` | `ci-degisiklik-sinifi.test.ts` | sınıf kararının iki iş akışına bağı: dar küme sınıflayıcıdan türer ve `tam` içermez; YALNIZ `Build (blocking)` ve Next.js önbelleği sınıfı okur (Test ve öteki kapılar okumaz); `admin-smoke` iş düzeyinde `if`/`needs` taşımaz; her ağır e2e adımı tam koşulu taşır; iki sınıf adımı birebir aynı ve tabandan çıkarılır |
| `INV-CI-SINIF-2` | `ci-degisiklik-sinifi.test.ts` | "siteye dokunmayan" tanımının ölçümü: derleme girdisinin src/ ve public/ dışına giden her kenarı `tam`; dosya okuyan derleme girdisi yalnız bilinen iki dosya; package.json CI hattı betikleri ve e2e işinin betikleri `tam` |
| `INV-CI-SINIF-3` | `ci-degisiklik-sinifi.test.ts` | sınıf adımının GERÇEK gövdesi gerçek git ve bash ile koşar: belge farkı `belge`, kod farkı `tam`; sınıflayıcı çökerse adım kırmızı olmaz `sinif=tam` yazar (yedek silinirse kırmızı: kontrol testi); taban kopyası yoksa `tam`. bash yoksa atlanır, CI'da (ubuntu) her zaman koşar |
| `INV-TEST-KOSU-1` | `test-kosu-kapsami.test.ts`, `dunya-durumu.test.ts` | her test dosyası bir yerde koşar; listedeki her kaydın dosyası var, gerekçesi ve kanıtı dolu, yeni yeri `zamanli` içeriyor; `dislan` kümesi PR listesi ∩ taban listesi; koruyucu testler listeye giremez; `ci` işinin Test adımı `dislan` kipini yalnız `pull_request`te verir; zamanlı iş akışı `yalniz` kipinde ve `schedule` ile koşar |
| `INV-CI-EDITED-1` | `ci-edited-ayna.test.ts` | aynanın `ci.yml`'ye bağlantısı: ağır adımlar atlama koşulu taşır, hep koşan adımlar (kayıt kapısı, taban izi) taşımaz, iz adımı adı ve sırası, ayna adımı kayıt kapısından sonra ve karar betiğini TABAN kopyasından koşturur, `edited` ayrı grupta, izinler en az, tam geçmiş |
| `INV-CI-EDITED-2` | `edited-ayna.test.ts` | aynanın karar mantığı ve GitHub çağrısının biçimi: atla yalnız aynı head ve AYNI taban izli tam koşu `success` iken; taban değişti, mekanizmaya dokunuldu, merge-ref biçimi bozuk ya da iz yoksa TAM; çağrı bütçesi |
| `INV-DUNYA-SATIRI-1` | `dunya-durumu-satiri.test.ts` | kanca satırı: yalnız `master` sorgusu, eşikler, ölçüm hatasında ve 404'te bilinen kırmızının korunması, çözülemeyen damganın susmaması, dış metnin satıra girmemesi, kancaya bağlantı |
| `INV-CI-SHARD-1` | `ci-test-shard.test.ts` | `test-shard` işinin ve `ci` bekleme adımının `ci.yml` bağı: iş yalnız `pull_request` (edited hariç) koşar, `needs`/`continue-on-error`/`environment` yok, `fail-fast: false`, kabuk `bash`, adımlarda `if`/`continue-on-error`/hata yutma yok; matrix sayısı = `--toplam` = `SHARD_TOPLAM` = iş adındaki `/N` ve bekleyicinin beklediği adlar; `--shard "$SHARD"`, `dislan`, `VENTHUB_TEST_SHARD_DOSYALARI`; bekleme adımı `ci`nin SON adımı (`if`, ortam, `run` tam eşitlik, `KOSU_DENEME` dahil); `ci` Test koşulu shard olayının tersi; `actions: read`; YAML'ın verdiği ortamla bekleyici sahte API'de çalışır; ALT-38e ile dağıtım ve Test ayrı adımdır (Test'in ortamı yalnız `VENTHUB_DUNYA_DURUMU` ve `NODE_COMPILE_CACHE`, `SHARD`/`SECIM_*` yalnız dağıtım adımında) ve `if` yalnız bilinen adımlarda TAM beklenen satırla serbesttir. Sabotaj tablosu: 77 bozulma yakalanır |
| `INV-CI-SHARD-2` | `ci-test-shard.test.ts`, `test-shard.test.ts`, `test-shard-bekle.test.ts` | bölmenin KAPSAMI gerçek `vitest list` ile: birleşim = liste, kesişim 0, her parça dolu, en yüklü/ortalama <= 1,25, belirlenimli ve girdi sırasından bağımsız, süresi bilinmeyen dosya da dağıtılır; shard'lar ∪ dünya durumu listesi = tam paket; `VENTHUB_TEST_SHARD_DOSYALARI` ile gerçek `vitest list` her parça için TAM o parçayı döner; özel karakterli yollar düz metin eşleşir. Birim: dağıtıcının ve bekleyicinin karar tabloları, her hata kırmızı |
| `INV-CI-SECIM-1` | `ci-test-secimi.test.ts`, `ci-test-secimi-ifade.test.ts` (pinler: `ci-edited-ayna.test.ts`, `ci-test-shard.test.ts`, `ci-degisiklik-sinifi.test.ts`) | test seçiminin ve belge hızlı yolunun `ci.yml` bağı: seçici, harita ve sınıflayıcı YALNIZ `test-shard` işinde ve TABANDAN (`git show HEAD^1:`; PR kopyası, `HEAD:`, `HEAD^2:` ve çalışma ağacından harita yasak; sınıflayıcı seçicinin yanına konur, aksi hâlde seçici onu PR'dan yükler), seçim adımlarının GÖVDESİ tam eşitlik ve anlamsal değişmezler (tek `node`, `--kok`/`--harita`/`--cikti`, `--vitestsiz` yalnız birinci geçişte, çökme yedeği, seçici kendisi `tam=false` yazamaz; `bos` kararı yalnız birinci geçişte, seçicinin SON `tam`/`secilen-sayisi` değerinden, çökme yedeğinden SONRA ve gövdenin SON satırında); ifade doğruluk tablosu GERÇEK `if` metninden GitHub'ın tür dönüşümüyle değerlendirilir (kurulum/Test YALNIZ `bos` TAM `true` iken kapanır; çıktı eksik/boş/`false`/başka değer KOŞAR; eski `secilen-sayisi != '0'` biçimi yarım çıktıda ATLATIRDI); ÖLÇÜM (hızlı yolun dayanağı): tsconfig `include` yalnız .ts/.tsx, eslint yapılandırması docs/md/txt/csv okumaz, deno check kaynakları md/txt/csv içe aktarmaz; `ci`, öteki iş akışları ve `vitest.config.ts` seçiciyi bilmez (edited, push, elle koşum, zamanlı koşu tam); hızlı yol adımı (koşul, kimlik, sıra, çıktı tek yerde `belge=true`, yol süzgeci yalnız md/txt/csv) ve sekiz kod kapısının koşulu TAM eşitlik; kayıt kapısı, Secret guard, Döküm kapısı, `ci` Test'i, Build ve bekleme adımı hızlı yolu OKUMAZ; shard kurulumu `--ignore-scripts`, `ci` kurulumu DEĞİŞMEZ; dağıtım adımı `id: dagit`; `ci` ve `test-shard` işlerinde iş akışı/iş düzeyinde `env:` ve adım düzeyinde `shell:`/`working-directory:` yasak (alt süreçlere sızıntı, pipefail kaybı). Sabotaj tablosu: 61 bozulma yakalanır |
| `INV-CI-SECIM-2` | `ci-test-secimi-kapsam.test.ts`, `ci-test-secimi-hizli.test.ts`, `ci-test-secimi-uyum.test.ts`, `test-shard-secim.test.ts` | UYUM (seçici ve harita repoda varsa; yoksa atlanır): GERÇEK seçicinin çıktısı dağıtıcıda uygulanır ya da seçici tam dediyse tam dağıtılır, dağıtıcı çıktıyı REDDETMEZ (uyarı yok: sözleşme kaymadı), kurulumsuz geçiş nihai geçişin üst kümesidir. DAVRANIŞ (gerçek bash + gerçek git + tabandan sahte seçici): taban kopyası koşar PR kopyası ASLA, kopya yoksa `tam=true`, seçici çökerse kırmızı olmaz `tam=true`; `bos=true` YALNIZ seçicinin SON `tam=false` VE `secilen-sayisi=0` değerinde yazılır, sessiz, yarım çıktılı, boş yazıp çöken ya da kendi `bos`unu yazan seçicide `bos=false` ve koşullar KOŞAR; hızlı yol yalnız md/txt/csv farkında `belge=true` (Türkçe ad, silinen belge dahil), `.cjs`/`.mjs`/`.ts`/`.json`/silinen-taşınan kod/boş fark/git hatasında çıktı YOK. KAPSAM (gerçek `vitest list`, kip `dislan`): tam ise birleşim = liste; seçim (K = 0, 1, 3, 37, 200, tümü) ise birleşim = seçim, kesişim 0, boş parça `[]` + `kos=false`; KARMA KİP: dört işin her tam/seçim kombinasyonunda (K = 1, 5, 60, 150) birleşim ⊇ seçim, kesişim 0 (bölme tam listede, seçim parçayı süzer); seçilen vitest listesinde yoksa TAM; gerçek `include` bağı; ci.yml'deki GERÇEK dağıtım komutu bash'te koşar. Birim: seçici çıktısı doğrulaması (tutarsız sayı, geçersiz yol, tekrar, diskte yok = TAM), boş seçimde `vitest list` ÇAĞRILMAZ, tam modda boş parça kırmızı |

Yeni bir dünya durumu kaydı ya da yeni bir `ci` adımı ekleyen değişiklik bu kapılardan geçer; kapı kırmızıysa kayıt ya da sınıflandırma
eksiktir, kapı gevşetilmez. Karne bölümü (§6 ve sonrası) ALT-38b ile bu tabloya kapı ekler.
