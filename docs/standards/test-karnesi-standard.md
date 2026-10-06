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
`pull-requests`), yazma yok; kayıt kapısı, döküm kapısı (ALT-39), checkout, taban izi ve pnpm/Node kurulum adımları atlama koşulu taşımaz (ağır adımlar: Deno
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
