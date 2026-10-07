# Test Çalıştırma Düzeni ve Test Karnesi — Cetvel v1.0

**Sürüm 1.0 · 2026-10-06 · Sahibi: ALTYAPI · Son doğrulama: 2026-10-06 · Kaynak: Kanban ALT-38 (OPS emri, Recep "başlat" dedi 10-06) ve karar 296**

> **Zorlayan kapılar:**
> `INV-TEST-KOSU-1` → `src/__tests__/conformance/test-kosu-kapsami.test.ts` ·
> `INV-CI-EDITED-1` → `src/__tests__/conformance/ci-edited-ayna.test.ts` ·
> `INV-CI-EDITED-2` → `scripts/ci/__tests__/edited-ayna.test.ts` ·
> `INV-DUNYA-SATIRI-1` → `src/__tests__/conformance/dunya-durumu-satiri.test.ts` ·
> `INV-CI-SINIF-1`, `INV-CI-SINIF-2` ve `INV-CI-SINIF-3` → `src/__tests__/conformance/ci-degisiklik-sinifi.test.ts` ·
> `INV-CI-SHARD-1` ve `INV-CI-SHARD-2` → `src/__tests__/conformance/ci-test-shard.test.ts` ·
> `INV-E2E-HIZLI-1` ve `INV-E2E-HIZLI-2` → `src/__tests__/conformance/e2e-hizli-derleme.test.ts` ·
> `INV-E2E-HIZLI-3` → `src/__tests__/conformance/e2e-smoke-paralel-kurulum.test.ts` ·
> `INV-E2E-HIZLI-4` → `scripts/ci/__tests__/arka-plan.test.ts`
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
| PR kapısı (`pull_request` olayı: paralel `test-shard` işleri, §4.2; `ci` işinin Test adımı yalnız `edited` koşusunda) | PR açılınca ve her güncellemede | dünya durumu listesi DIŞINDAKİ hepsi (kip `dislan`), her dosya TAM BİR shard'da | kırmızı shard `ci`yi kırmızı yapar (son adım bekler), birleştirme durur |
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
`pull-requests`), yazma yok; kayıt kapısı, checkout, taban izi ve pnpm/Node kurulum adımları atlama koşulu taşımaz (ağır adımlar: Deno
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
- Shard'ların Test adımı atlanamaz: `if`, `continue-on-error`, `|| true` taşımaz; kabuk açık `bash` (pipefail, `| tee` kırmızıyı yutmaz); `--shard "$SHARD"` matrix numarasını taşır, `--toplam`, matrix
  sayısı, `ci`nin `SHARD_TOPLAM`ı ve iş adındaki `/N` AYNI sayıdır. Dünya durumu testleri shard'larda `dislan` kipiyle dışarıda kalır (§3): kapsam kanıtı shard'lar ∪ dünya durumu listesi = tam paket.

**Yeniden koşum kuralı.** Bekleyici yalnız bu denemenin (`run_attempt`) iş listesine bakar; önceki denemenin yeşili bu denemeye TAŞINMAZ. Kısmi yeniden koşumda (yalnız kırmızı işler yeniden koşturulunca) iş listesinde
görünmeyen shard "eksik" sayılır ve `ci` KIRMIZI olur: çare "Re-run all jobs" (ya da yeni commit). Bu bilinçli fail-closed seçimdir: eksik kanıt yeşil sayılmaz.

**Sayıyı değiştirmek.** Shard sayısı dört yerde yazılıdır (matrix, `--toplam`, `ci`nin `SHARD_TOPLAM`ı, iş adındaki `/N`) ve `INV-CI-SHARD-1` hepsinin eşitliğini ölçer (adım adındaki `/N` yalnız etikettir).
Sayı değişince bölme otomatik uyar; denge `INV-CI-SHARD-2`de en yüklü/ortalama <= 1,25 olarak ölçülür. Yeni ağır test dosyası eklenince `scripts/ci/test-sureleri.json`a süresi yazılırsa denge korunur;
yazılmazsa dosya varsayılan ağırlıkla yine bir parçaya girer (kapsam kaybı olmaz, yalnız denge bozulabilir).

### 4.3 `admin-smoke` süresi: tip ve lint e2e'de kapalı, webpack önbelleği, apt Build ile paralel (ALT-38f)

**Neden.** Kod PR'ında en uzun bekleyen zorunlu kontrol `admin-smoke` idi. Başlangıç ölçümü (88 başarılı koşu, 2026-10-04..07): iş medyanı 285 sn (p10 237, p90 310, en kısa 198, en uzun 640).
Adım medyanları (sn): kurulum 53 (bağımlılık kurulumu 35) · apt 15 · Build 166,5 · Playwright 39,5. Tek bir Build günlüğünde: 92 sn derleme, 51 sn "Linting and checking validity of types",
26 sn sayfa üretimi. apt adımı 3 koşuda (%3,4) 187, 339 ve 341 sn sürdü (ilk deneme 300 sn sınırını doldurdu, ikinci deneme geçti).

**Üç kaldıraç.** Hiçbiri sınıf koşullarına (§4.1), iş adına (`admin-smoke`, zorunlu kontrol) ya da tarayıcı probuna dokunmaz; her adım hâlâ aynı tam koşulu taşır.

1. **Tip ve lint yalnız e2e Build'inde kapalı** (`src/config/e2eHizliDerleme.mjs`, INV-E2E-HIZLI-1/2). `VENTHUB_E2E_TIP_LINT_ATLA=1`, YALNIZ `Build (real Supabase env)` adımının adım env'inde verilir ve `next.config.mjs`e
   `typescript.ignoreBuildErrors` ile `eslint.ignoreDuringBuilds` ekler (günlükte "Skipping validation of types" ve "Skipping linting"). Anahtar yok ya da tam `1` değilken yapılandırmaya HİÇBİR anahtar eklenmez
   (bugünkü ayarla birebir aynı). `ci`, Vercel, yerel derleme, package.json, vercel.json, `.env*` ve öteki iş akışları anahtarı HİÇ vermez ve vermemesi testle ölçülür. **Kapsam boşluğu yok**: tip ve lint hatası
   `ci` işinde üç yerde kırmızı verir (Lint, Type check, `Build (blocking)`) ve `ci` ile `admin-smoke` AYNI sınıf koşuluyla koşar/atlanır. **Önkoşul: `ci` zorunlu kontrol kalır.**
2. **Webpack derleme önbelleği, e2e'ye özgü.** Üç yol: `.next/cache/webpack`, `.next/cache/.rscinfo`, `.next/cache/.previewinfo`; anahtar öneki `e2e-nextjs-` (`ci`nin önekinden AYRI ve birbirinin öneki değil: bu iş gerçek env ile
   282 sayfa derler, `ci` sahte env ile 132). Bütün `.next/cache` DEĞİL: `fetch-cache` canlı veriyi (`unstable_cache`, revalidate 3600) önceki koşudan taşırdı; bu iş canlı veriyle derlemeyi vaat eder. Koşul Build ile BİREBİR
   aynı, anahtar `ci` ile aynı biçimde (işletim sistemi + kilit dosyası + kaynak özeti), kaynak değişince son kayıt önekle gelir (yalnız hız: webpack girdileri içerik özetiyle doğrular).
   **Ölçülmüş tuzak:** ilk sürüm yalnız `webpack/` saklıyordu; önbellek geri yüklendi ama derleme 91 sn → 89 sn (kazanç sıfır). Sebep Next kaynağında: her derleme rastgele bir sunucu-eylemi şifreleme anahtarı üretir
   (`.next/cache/.rscinfo`da 14 gün saklanır), anahtar SWC yükleyici seçeneklerine ve webpack önbellek kimliğine girer; anahtar geri yüklenmezse kimlik her derlemede değişir. `ci` bütün `.next/cache`i sakladığı için
   `.rscinfo`yu da taşır (ölçüm: `ci` derlemesi soğukta 92 sn, sıcakta 22-43 sn). `INV-E2E-HIZLI-3` üç yolun tam kümesini ölçer.
3. **apt adımı Build ile PARALEL** (`scripts/ci/arka-plan.sh`, cetvel `ci-runner-install-standard.md` §2.9, INV-E2E-HIZLI-3/4). `playwright install-deps` arka planda başlar, `bekle` adımı Build'ten sonra toplar; sınır 300 sn × 2'den 75 sn × 2'ye indi.
   Gerçek kapı değişmedi: tarayıcı probu `bekle`den SONRA ve fataldir.

**Ölçüm** (PR #1742, gerçek CI koşuları, aynı iş, sn). Her sütunda tek tek koşular yazılır: GitHub koşucusunun hızı koşudan koşuya ±%30 oynar (önceki 88 koşuda iş toplamı 198-313, ilk bağımlılık kurulumu 25-45 sn),
bu yüzden tek koşuyu medyanla kıyaslamak yanıltır; aynı koşucu hızı için kurulum satırına bakılır.

| | önceki medyan (88 koşu) | SOĞUK (önbellek yok): koşu 1 · koşu 3 | SICAK (aynı anahtar, boş commit): koşu 4 · koşu 5 |
|---|---|---|---|
| **iş toplamı** | **285** (p10 237, p90 310) | **241 · 180** | **201 · 142** |
| kurulum (iş başlatma, checkout, pnpm, Node, bağımlılık) | 53 | 53 · 39 | 55 · 39 |
| tarayıcı + sistem bağımlılıkları (apt dahil) | 20 (apt 15; 3 koşuda 187-341) | 7 · 3 | 7 · 5 |
| Build | 166,5 | 128 · 92 | 76 · 62 |
| ↳ webpack derleme (günlükteki "Compiled successfully") | 92 | 91 · 66 | 31,6 · 28,1 |
| Playwright testi | 39,5 | 43 · 37 | 56 · 32 |
| diğer (adım sonrası, önbellek kaydı) | 1 | 6 · 5 | 3 · 1 |

Kaldıraç başına (koşu içi, günlükten): **tip ve lint kapalı** Build'ten ~40 sn düşürür (derleme 91 sn aynı, "Linting and checking" aşaması hiç koşmaz); **apt paralel** adımı iş süresinden çıkarır (arka planda 15-19 sn
sürdü, `bekle` adımında bekleme 0 sn, derleme süresi etkilenmedi); **webpack önbelleği** derlemeyi 91 → 28-32 sn'ye indirir (yalnız `.rscinfo` ile birlikte). Ara koşu 2 (yalnız `webpack/` saklanan ilk sürüm): iş 228 sn, derleme 89 sn.
**Sonuç:** sıcak önbellekle iş ≤ ~200 sn (201 ve 142); önbelleksiz ilk koşuda 180-241 sn (önceki medyan 285), her iki durumda `ci`den (252 sn) kısa. Apt takılması (%3,4) bu 5 koşuda tetiklenmedi: kuyruğun kesilmesi mekanizma ve test
olarak kanıtlı, canlıda ÖLÇÜLMEDİ.

**Güvenlik yönü.** (a) Anahtar yanlış yere sızarsa `ci`/Vercel/yerel derleme tipsiz kalırdı: `INV-E2E-HIZLI-2` anahtarın adım düzeyi dışında hiçbir yerde olmadığını ölçer. (b) apt arka planda ölürse `bekle` komutu ön planda yeniden
koşar; bekleme süresi dolarsa komut öldürülmez ve kapıyı prob verir. (c) Önbellek yalnız hızdır: bayat girdi yok sayılır, canlı veri önbelleğe girmez. **Bilinen sınır:** depo önbellek kotası 10 GB'ın %96'sında (2026-10-07);
yeni anahtar başına yaklaşık 137 MB eklenir. `ci`nin önbelleğiyle aynı desen; kaydı yalnız master push'a çevirmek (PR yalnız geri yükler) bir seçenektir ve ayrı kararın konusudur.

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
| `INV-CI-SHARD-1` | `ci-test-shard.test.ts` | `test-shard` işinin ve `ci` bekleme adımının `ci.yml` bağı: iş yalnız `pull_request` (edited hariç) koşar, `needs`/`continue-on-error`/`environment` yok, `fail-fast: false`, kabuk `bash`, adımlarda `if`/`continue-on-error`/hata yutma yok; matrix sayısı = `--toplam` = `SHARD_TOPLAM` = iş adındaki `/N` ve bekleyicinin beklediği adlar; `--shard "$SHARD"`, `dislan`, `VENTHUB_TEST_SHARD_DOSYALARI`; bekleme adımı `ci`nin SON adımı (`if`, ortam, `run` tam eşitlik, `KOSU_DENEME` dahil); `ci` Test koşulu shard olayının tersi; `actions: read`; YAML'ın verdiği ortamla bekleyici sahte API'de çalışır. Sabotaj tablosu: 70 bozulma yakalanır |
| `INV-CI-SHARD-2` | `ci-test-shard.test.ts`, `test-shard.test.ts`, `test-shard-bekle.test.ts` | bölmenin KAPSAMI gerçek `vitest list` ile: birleşim = liste, kesişim 0, her parça dolu, en yüklü/ortalama <= 1,25, belirlenimli ve girdi sırasından bağımsız, süresi bilinmeyen dosya da dağıtılır; shard'lar ∪ dünya durumu listesi = tam paket; `VENTHUB_TEST_SHARD_DOSYALARI` ile gerçek `vitest list` her parça için TAM o parçayı döner; özel karakterli yollar düz metin eşleşir. Birim: dağıtıcının ve bekleyicinin karar tabloları, her hata kırmızı |
| `INV-E2E-HIZLI-1` | `e2e-hizli-derleme.test.ts` | `VENTHUB_E2E_TIP_LINT_ATLA` okuyucusu YALNIZ tam `1` açar; açıkken `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds` (tam iki anahtar), kapalıyken `next.config.mjs`in dışa verdiği nesnede bu anahtarlar HİÇ yok ve adresler (redirects/headers/rewrites) aynı; yeni Node sürecinde anahtar yalnız o sürecin ortamından okunur. Sabotaj: 7 gevşek okuyucu, 6 bozuk ayar üreticisi |
| `INV-E2E-HIZLI-2` | `e2e-hizli-derleme.test.ts` | anahtar YALNIZ `e2e-smoke.yml`in `Build (real Supabase env)` adımının ADIM env'inde ve değeri tam `'1'`; iş/iş akışı env'i, `$GITHUB_ENV`, başka adım, başka iş akışı (`ci.yml` dahil), package.json, vercel.json, `.env*`, `scripts/` ve Playwright/Vitest ayarlarında YOK; yazım ayrışması kırmızı. Sabotaj: 9 iş akışı bozulması + `ci.yml` + 3 yüzey |
| `INV-E2E-HIZLI-3` | `e2e-smoke-paralel-kurulum.test.ts` | `admin-smoke` adım sırası (apt Build'ten önce başlar, `bekle` Build'ten sonra ve probtan ÖNCE, prob smoke'tan önce), apt sınırı ≤ 90 sn × 2 deneme ve kemer aritmetiği, `bekle` süresi ≥ en kötü süre, `bekle` en-iyi-çaba, prob `continue-on-error`suz ve fatal, webpack önbelleği YALNIZ `.next/cache/webpack` + `.rscinfo` + `.previewinfo` (bütün `.next/cache` ya da `fetch-cache` yok; `.rscinfo` eksikse önbellek hiç isabet etmez), `e2e-nextjs-` öneki ve `ci`nin anahtarıyla önek çakışması yok. Sabotaj: 20 bozulma |
| `INV-E2E-HIZLI-4` | `scripts/ci/__tests__/arka-plan.test.ts` | `arka-plan.sh` gerçek bash ile: `baslat` hemen döner ve çıktı borusunu tutmaz, `bekle` çıkış kodunu taşır (124 süre, 125 başlatılmamış, 2 kullanım), öldürülen işlem ön planda yeniden koşar (alıntı + ortam korunur), pid dosyası yok/sıfır/bozuksa süreç yaşıyor sanılmaz, eski sonuç karışmaz. Sabotaj: 9 betik bozulması |

Yeni bir dünya durumu kaydı ya da yeni bir `ci` adımı ekleyen değişiklik bu kapılardan geçer; kapı kırmızıysa kayıt ya da sınıflandırma
eksiktir, kapı gevşetilmez. Karne bölümü (§6 ve sonrası) ALT-38b ile bu tabloya kapı ekler.
