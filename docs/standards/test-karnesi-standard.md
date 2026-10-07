# Test Çalıştırma Düzeni ve Test Karnesi — Cetvel v1.0

**Sürüm 1.0 · 2026-10-06 · Sahibi: ALTYAPI · Son doğrulama: 2026-10-06 · Kaynak: Kanban ALT-38 (OPS emri, Recep "başlat" dedi 10-06) ve karar 296**

> **Zorlayan kapılar:**
> `INV-TEST-KOSU-1` → `src/__tests__/conformance/test-kosu-kapsami.test.ts` ·
> `INV-CI-EDITED-1` → `src/__tests__/conformance/ci-edited-ayna.test.ts` ·
> `INV-CI-EDITED-2` → `scripts/ci/__tests__/edited-ayna.test.ts` ·
> `INV-DUNYA-SATIRI-1` → `src/__tests__/conformance/dunya-durumu-satiri.test.ts`
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
| PR kapısı (`ci` işinin Test adımı, `pull_request` olayı) | PR açılınca ve her güncellemede | dünya durumu listesi DIŞINDAKİ hepsi (kip `dislan`) | zorunlu kontrol `ci` kırmızı, birleştirme durur |
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
yapılandırma FIRLATIR. Dışlama mekanizmasının kendi koruyucu testleri (`INV-CI-EDITED-1/2`, `INV-TEST-KOSU-1`, `INV-DUNYA-SATIRI-1`
dosyaları, `DISLANAMAZ` sabiti) listeye GİREMEZ.

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

## 5. Kapılar ve görünen yüzler

| Kapı | Dosya | Neyi ölçer |
|---|---|---|
| `INV-TEST-KOSU-1` | `test-kosu-kapsami.test.ts`, `dunya-durumu.test.ts` | her test dosyası bir yerde koşar; listedeki her kaydın dosyası var, gerekçesi ve kanıtı dolu, yeni yeri `zamanli` içeriyor; `dislan` kümesi PR listesi ∩ taban listesi; koruyucu testler listeye giremez; `ci` işinin Test adımı `dislan` kipini yalnız `pull_request`te verir; zamanlı iş akışı `yalniz` kipinde ve `schedule` ile koşar |
| `INV-CI-EDITED-1` | `ci-edited-ayna.test.ts` | aynanın `ci.yml`'ye bağlantısı: ağır adımlar atlama koşulu taşır, hep koşan adımlar (kayıt kapısı, taban izi) taşımaz, iz adımı adı ve sırası, ayna adımı kayıt kapısından sonra ve karar betiğini TABAN kopyasından koşturur, `edited` ayrı grupta, izinler en az, tam geçmiş |
| `INV-CI-EDITED-2` | `edited-ayna.test.ts` | aynanın karar mantığı ve GitHub çağrısının biçimi: atla yalnız aynı head ve AYNI taban izli tam koşu `success` iken; taban değişti, mekanizmaya dokunuldu, merge-ref biçimi bozuk ya da iz yoksa TAM; çağrı bütçesi |
| `INV-DUNYA-SATIRI-1` | `dunya-durumu-satiri.test.ts` | kanca satırı: yalnız `master` sorgusu, eşikler, ölçüm hatasında ve 404'te bilinen kırmızının korunması, çözülemeyen damganın susmaması, dış metnin satıra girmemesi, kancaya bağlantı |

Yeni bir dünya durumu kaydı ya da yeni bir `ci` adımı ekleyen değişiklik bu dört kapıdan geçer; kapı kırmızıysa kayıt ya da sınıflandırma
eksiktir, kapı gevşetilmez. Karne bölümü (§6 ve sonrası) ALT-38b ile bu tabloya kapı ekler.

## 6. Test seçimi (karar 308)

**Sürüm 1.1 · 2026-10-07 · Sahibi: ALTYAPI · Kaynak: Kanban ALT-38d (karar 308, OPS-91) · Ölçüm: `docs/audits/test-secimi-olcum-2026-10-07.md`**

Bu bölüm PR kapısında HANGİ testlerin koşacağını belirler: tam paket yerine yalnız değişenle ilgili olanlar. §2'deki "PR kapısı" satırını
daraltır, başka satırı değiştirmez: master push, zamanlı iş ve yerel `pnpm test` TAM kalır; seçim yalnız `pull_request` olayında, `ci` işinin
test dağıtımında uygulanır. Yerel kısayol `pnpm test:ilgili` aynı seçiciyi koşturur ama TAM'a düşerse hiçbir test koşmaz (yerelde tam paket yok;
CI koşar).

**İlke: seçici bir testi yanlışlıkla ELEMEZ.** Seçilmeyen testin koruduğu kural sessizce kırılır ve kimse kırmızı görmez; fazladan seçmenin
bedeli ise yalnız dakikadır. Bu yüzden şüphe, hata, bilinmeyen ve hesaplanamayan her durum `tam`dır (tam = vitest'in listelediği HER test),
`sec` hiçbir koşulda fırlatmaz ve `tam` sonucunda seçilen liste de TÜM testlerdir (`tam` bayrağını okumayı unutan tüketici bile hepsini
koşturur; boş liste "hiçbir şey koşma" demek olurdu, o yön asla varsayılan olmaz). Seçilmeyen testin korumasını master push (TAM) ve zamanlı
koşu taşır; bu bölüm yeni bir tam paket zamanlayıcısı kurmaz.

### 6.1 Karar sırası (`scripts/ci/test-sec.cjs`)

| Sıra | Koşul | Sonuç |
|---|---|---|
| 1 | Değişen yol KÜRESEL girdi (§6.2) | `tam` |
| 2 | Haritanın bilmediği kök ad (yeni üst dizin ya da kök dosya) | `tam`: sınıflanamayan yüzey |
| 3 | Silinmiş ya da taşınmış KOD dosyası | `tam`: içe aktaran test, dosya yokken `vitest related` grafiğinde görünmez |
| 4 | Değişen dosya bir TEST dosyası | o test seçilir |
| 5 | İçe aktarılabilir dosya değişti | `vitest related` (içe aktarma grafiği) sonucu eklenir |
| 6 | Testin koşarken okuduğu dosya/dizin ya da `import.meta.glob` deseni değişen yolu kapsıyor | o test seçilir |
| 7 | Haritada kaydı OLMAYAN test, kaynağı ölçümden sonra değişmiş (bayat kayıt) test, `belirsiz` test | HER ZAMAN seçilir |
| 8 | Değişen liste boş ya da 2000+ dosya; git, harita ya da vitest hatası; harita biçimi, sürümü ya da ölçüm aracı özeti uyuşmuyor | `tam` |

5 ve 6 BİRLEŞTİRİLİR: `related` vite'ın `?raw` ve `import.meta.glob` okumalarını görmez (78 test), harita ise içe aktarma grafiğini görmez;
biri öbürünün kör noktasını kapatır. Belge, CSV, SQL gibi içe aktarılamaz dosyada `related` hiç hesaplanmaz.

### 6.2 Küresel girdiler

Değişirse `tam`: `.github/`, `.githooks/`, `scripts/ci/`, `supabase/migrations/`, `scripts/assert-node-major.mjs`, `scripts/setup-hooks.mjs`,
`package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `.nvmrc`, `.node-version`, `.gitignore`, `.gitattributes`, `tsconfig*.json`,
`vitest*`, `playwright*`, `next.config.*`, `eslint.config.*`, `.eslintrc*`, `tailwind.config.*`, `postcss.config.*`, `knip.*`, `middleware.*`; ek
olarak sınıflayıcının (`scripts/ci/degisiklik-sinifi.cjs`) "her zaman tam" listesi (`src/` ve `public/` HARİÇ: bunlar daraltılmak istenen
yüzeylerdir) ve haritanın kurulum evresinde okunan yolları. SSOT `KURESEL_GIRDILER`dir; her girdinin `INV-TEST-SEC-1` örnek tablosunda satırı
olmak ZORUNDADIR (yeni küresel girdi örneksiz eklenemez, listeyi daraltmak kırmızı verir).

### 6.3 Test haritası (`scripts/ci/test-haritasi.json`)

**Harita bir ÖLÇÜMDÜR, tahmin değil.** Test kaynağına bakıp okunan yolu tahmin etmek hesaplanan yolu (`path.join(KOK, ad)`), döngüyle gezilen
dizini ve alt süreçte okunan dosyayı sessizce kaçırır. Bu yüzden üretici her testi GERÇEKTEN koşturur ve `fs` çağrılarını yakalar
(`test-haritasi-kaydedici.cjs`: vitest `setupFiles` ile yalnız ölçüm yapılandırmasında yüklenir, `vitest.config.ts`e dokunulmaz; PR kapısında ve
normal `pnpm test`te yüklenmez). Kaydedilen: okunan dosya, okunan dizin (doğrudan çocuklar), özyinelemeli alt ağaç, `import.meta.glob` desenleri
(vite bunları ana süreçte okuduğu için kaydedici görmez; üretici kaynaktan çıkarır ve ölçülen `?raw` genişlemesiyle doğrular), test kaynağının özeti (`sha`)
ve `belirsiz` işareti. `node` çocuklarının okumaları izlenir (çocuğa `NODE_OPTIONS=--require` verilir); `git` (repo içinde, dosyaya bağlı alt komut),
python, sh, cmd, esbuild, powershell izlenemez ve test `belirsiz` olur: HER PR'da koşar. Ölçümde atlanan ya da kırmızı olan test de `belirsiz`dir.

Çıktı BELİRLENİMLİDİR (tarih, makine adı, süre yok; hepsi sıralı): aynı ağaç + aynı ham kayıt = bayt bayt aynı dosya.

| Komut | Ne yapar |
|---|---|
| `node scripts/ci/test-haritasi-uret.cjs` | tam ölçüm koşusu (PR kapısıyla aynı küme, `VENTHUB_DUNYA_DURUMU=dislan`; parçalara bölünür, kesilirse en çok bir parça kaybolur) + harita yaz |
| `... --devam <ham klasör>` | yarım kalan koşuyu sürdürür (yalnız sonuç dosyası olmayan parçalar koşar) |
| `... --yalniz a.test.ts b.test.ts` | yalnız bu testleri yeniden ölçer, kalanını korur (ölçüm aracı özeti AYNI olmalı) |
| `... --ham <klasör>` | koşmadan, var olan ham kayıttan yazar |
| `... --kontrol` | haritayı ağaçla karşılaştırır, yazmaz; biçim, canonical bayt, ölçüm aracı özeti sorunu varsa çıkış 1 |

Bakım kuralları:

| Olay | Ne olur | Ne yapılır |
|---|---|---|
| Yeni test dosyası | haritada yok → HER ZAMAN koşar (atlanamaz) | birleşmeden sonra `--yalniz <yeni testler>` ile kaydedilir (yaklaşık 1 dk); iki dalda aynı anda kaydetmeyin (aynı dosya çakışır) |
| Test dosyası değişti | bayat kayıt → HER ZAMAN koşar (zaten değişen testtir) | birleşmeden sonra `--yalniz` |
| Ölçüm aracı değişti (kaydedici, kurulum dosyaları, `test-haritasi.vitest.config.ts`) | araç özeti uyuşmaz → TAM; `INV-TEST-HARITA-1` KIRMIZI | tam yeniden üretim (yaklaşık 20 dk, 6 işçi) |
| Test silindi | hayalet kayıt (zararsız) | sonraki üretimde düşer |
| Testin dolaylı bağımlılığı değişti (testin içe aktardığı yardımcı başka dosya okumaya başladı) | test kaynağı değişmediği için kayıt bayat görünmez; `related` o PR'da testi seçer, sonraki PR'lar yeni okumayı harita yenilenene dek görmez | master push TAM koşar (güvenlik ağı); gece yenileme önerisi §6.7 |

### 6.4 Güvenlik ağı: hiçbir koruma sessizce düşmez

| Durum | Davranış | Kanıt |
|---|---|---|
| Küresel dosya, bilinmeyen kök ad, silinmiş kod dosyası | `tam` | `INV-TEST-SEC-1` blok 1 ve 3 |
| Boş değişen liste, 2000+ dosya, git/harita/vitest hatası, bozuk girdi | `tam`; `sec` fırlatmaz | `INV-TEST-SEC-1` blok 1 ve 5 |
| Harita bayat, bozuk, sürüm ya da araç özeti uyuşmuyor | `tam` | `INV-TEST-SEC-1`, `INV-TEST-HARITA-1` blok 6 |
| Haritada olmayan (yeni) test | her zaman seçilir | `INV-TEST-SEC-1` blok 1 |
| Bayat kayıt, `belirsiz` test | her zaman seçilir | `INV-TEST-SEC-1` blok 1 |
| `tam` sonucu | `secilen` = TÜM testler | `INV-TEST-SEC-1` blok 1 ve 5 |
| Seçicinin kaynağına konan tek hata (küresel liste daralır, harita yok sayılır, bilinmeyen test seçilmez, `tam` yerine boş seçim döner) | en az bir senaryo KIRMIZI | `INV-TEST-SEC-1` blok 2 (sabotaj tablosu) |
| Üreticiye konan tek hata | en az bir senaryo KIRMIZI | `INV-TEST-HARITA-1` blok 7 |
| master push, `workflow_dispatch`, `schedule`, yerel `pnpm test` | seçim UYGULANMAZ, TAM | §6.5 koşul 1 |

### 6.5 Bağlama koşulları (`ci.yml` ve `test-shard` için)

1. Seçim yalnız `pull_request` olayında, varsayılan (birleştirme commit'i) checkout'ta ve `fetch-depth >= 2` ile uygulanır (`HEAD^1` için); push ve elle
   koşumda seçim YOK SAYILIR.
2. Betik ve harita PR'ın kendi kopyasından değil TABANDAN (`git show HEAD^1:scripts/ci/test-sec.cjs`) çıkarılıp koşturulur (`--kok "$GITHUB_WORKSPACE"
   --harita "$RUNNER_TEMP/test-haritasi.json"`); PR bunlara dokunuyorsa `scripts/ci/` zaten küresel olduğundan `tam`dır.
3. Seçim yalnız DARALTIR: çıktı yoksa ya da okunamazsa HER ŞEY koşar. Tüketici önce `tam` çıktısına bakar. Çıkış kodu daima 0'dır, hata `tam` olarak
   yazılır; `$GITHUB_OUTPUT`a `tam=`, `secilen-sayisi=`, `toplam=`, `neden=` eklenir (`neden` tek satır, enjeksiyona kapalı).
4. Dağıtım: seçilen liste ∩ `vitest list --filesOnly` çıktısı shard'lara dağıtılır. Beklenen shard sayısı SABİT kalır; boş kalan shard bile `success`
   verir (bekleme adımı sayıya bakar). Seçim hiçbir zaman boş değildir (belirsiz testler her PR'da seçilir); boş yol yine de güvenli yazılır.
5. Kurulumdan ÖNCE koşan ilk geçiş `--vitestsiz`tir (`git ls-files` ile üst küme liste; yalnız belge/CSV/SQL gibi dosyalar değiştiyse kendi seçimini verir,
   içe aktarılabilir dosya değiştiyse `tam=true` ve "vitest gerekli" der); kurulumdan sonra ikinci geçiş bayraksız koşar.

### 6.6 Kapılar (bu bölümün kendi tablosu)

| Kapı | Dosya (`scripts/ci/__tests__/`) | Neyi ölçer |
|---|---|---|
| `INV-TEST-SEC-1` | `test-sec.test.ts` | seçicinin karar mantığı (senaryolar, SABOTAJ tablosu, küresel girdi örnek tablosu, glob eşleştirici, CLI çıktı sözleşmesi, `--yerel`); gerçek harita ve gerçek git ile belge değişimi daraltır, belirsiz testler HER ZAMAN seçilir |
| `INV-TEST-HARITA-1` | `test-haritasi-uret.test.ts` | üreticinin senaryoları ve sabotajı; depodaki harita seçicinin kabul ettiği biçimde, canonical baytlarla ve GÜNCEL ölçüm aracı özetiyle (bayat harita KIRMIZI), her okuma seçicinin indeksiyle geri bulunur |
| `INV-TEST-HARITA-KAYDEDICI-1` | `test-haritasi-kaydedici.test.ts` | yakalama (fs, dizin, glob, alt süreç sınıflaması, `node` çocuğu, belirlenimli kayıt) |
| `INV-TEST-SEC-GERIYE-1` | `test-sec-geriye.test.ts` | geriye dönük doğrulamanın sayım mantığı: kategori önceliği, kaçırma yalnız ASIL kategoriden, kaçırılanın açıklanması (açıklanamayan = GERÇEK kaçırma), CI günlüğünden süre modeli |

**Seçiciyi gevşeten her değişiklik (küresel listeyi daraltmak, `belirsiz` kapsamını azaltmak, yeni bir "atla" kuralı) önce B4 ile ölçülür:**
`node scripts/ci/test-sec-geriye.cjs --b4 <kırmızı koşular.json> --log-dizini <günlükler>` çıktısında `gercekKacirilan` listesi BOŞ olmadan
birleşmez. `kirmizi-kosular` kaydı: koşu başına değişen dosyalar, kırılan test dosyaları ve (günlükten) kırılan başlıklar.

### 6.7 Ölçülmüş durum ve açık konular (2026-10-07)

| Ölçü (ayrıntı ve ham veri: `docs/audits/test-secimi-olcum-2026-10-07.md` ve `.csv`) | Değer |
|---|---|
| Test evreni, harita kapsamı | 624 dosya; conformance 345/345 kayıtlı (312 kesin eşlenmiş, 33 `belirsiz`); tümü 622/624 (2 dosya tümüyle `describe.skip`) |
| Her zaman koşan | 43 (41 `belirsiz` + 2 haritada olmayan) |
| Belge-yalnız PR (12 gerçek PR) | ortalama 833 test (%11,0), CI günlüğünden modellenen Test süresi %12,8 |
| Kod PR (64 gerçek PR) | ortalama 1803 test (%23,8), süre %26,2 (medyan %22,5) |
| Küresel girdili PR | 13/94: hepsi TAM |
| Geriye dönük (259 kırmızı CI koşusu, 2026-09-07..10-07) | 171 değerlendirilebilir koşunun 43'ü ham kaçırma; 34'ü dünya durumu kolu (artık PR kapısında yok), 10'u devralınan kırmızı (kök master push TAM ya da seçilmiş PR); gerçek kaçırma 0 |
| `belirsiz` kümesini belge PR'ında atlamanın bedeli | son ayda 17 belge PR kırmızısının 10'u PR'da görünmezdi (`arac-envanteri`, `mutlak-yol-sizintisi`, `belge-tazelik`) |

Hedef (belge PR'ında Test ≤40 sn) bu ağaçta TUTMAZ: belge PR'ında Test tam paketin yaklaşık %13'üdür ve bunun %11 puanı `belirsiz` kümesinden gelir; seçim hiçbir belge PR'ında
boş değildir, kurulum atlanamaz. Kazanç Test adımındadır (yaklaşık %87 az işlemci süresi); PR duvar süresini bundan sonra kurulum, lint ve derleme belirler.

Açık konular (sahibi ALTYAPI; hiçbiri bu bölümü geçersiz kılmaz, hepsi daha dar seçim içindir):

1. **`belirsiz` kümesi** (izlenemeyen alt süreç) belge-yalnız PR'ın süresinin büyük kısmını oluşturur; yeni belge eklendiğinde sonucu gerçekten değişen
   belge yapısı kapılarını da içerir (`git ls-files`, `git log` ile `docs/` sayanlar), bu yüzden belge PR'ında bile atlanamaz. Kapatma yolları: (a) Linux'ta
   `strace -f` ile ölçüm (alt süreç okumaları görünür, `belirsiz` kümesi kapanır); (b) 40 haneli revizyona bağlı `git show|cat-file|ls-tree|log`
   komutlarının kaydedicide "dosyaya bağlı değil" sayılması (değişmez geçmiş, çalışma ağacına bağlı değil); (c) yalnız `git ls-files` kullanan testlerin
   yalnız EKLENEN/SİLİNEN dosyada seçilmesi (adlar kümesine bağlıdır, içeriğe değil). Üçü de ölçüm aracını değiştirir (tam yeniden üretim) ve B4 ile
   doğrulanmadan açılmaz.
2. **Haritanın yenilenmesi**: yeni test dosyaları birleşmeden sonra `--yalniz` ile kaydedilir (§6.3). Tam yenileme için yeni bir tam-paket zamanlayıcısı
   önerilmez; master push TAM koşusu zaten tüm testleri koşturuyor, haritanın ham kaydı o koşuda `test-haritasi.vitest.config.ts` ile alınıp yapıt olarak
   saklanabilir (`--ham` ile haritaya yazılır). Bu bir öneridir, kurulu değildir.
3. **Ölçüm makinesi**: harita Windows'ta ölçüldü; Linux'ta atlanan ya da farklı kolu izleyen test (platforma bağlı `skipIf`) ölçümde görünmeyebilir, bu testler
   atlandığında `belirsiz` işaretlenir. Linux ölçümü (1a) bunu da kapatır.
4. **Geriye dönük pencere** bir aydır (2026-09-07..10-07, `ci.yml` koşuları): `karne.json`un üç aylık `ci` özeti koşu başına değişen dosya taşımaz.
