# Ledger ve Ölü Migration Dosyası Cetveli

**Sürüm 1.3 · 2026-09-16 · Şerit: ALTYAPI · Kaynak: REC-321 (Recep kararı, SEÇENEK 1) + REC-336 (§10) + REC-352 (§2.1) + Recep sorusu "bu işi neden Supabase tarafında döndüremiyoruz" (§1.1)**

> ⭐**SÜRÜM 1.2 BİR İTİRAZDAN DOĞDU ve yön GENİŞLETMEDİR, daraltma değil.** Recep sordu:
> *"biz neden cetvel oluşturuyoruz — kendimize sınır koymak için mi, yoksa geliştiricilerin
> sunduklarını kendimize rehber edinmek için mi?"* Bu cetvel 1.1'e kadar Supabase'in o problem
> için **ne sunduğunu hiç yazmamıştı** ve hükmü satıcının desteklediği bir yolu yasaklar hâle
> gelmişti. §2.1 o boşluğu kapatır ve **hepimizi bağlayan genel bir kural** yazar. Eski §3
> **silinmedi** — mekanizma reddi olarak geçerli, ama artık §2.1 ile okunur.

Bu cetvel şu soruya cevap verir: **prod'a hiç uygulanmamış ama depoda duran bir
migration dosyası ne olur?** 2026-09-14'e kadar bu sorunun yazılı cevabı **yoktu**;
altı dosya yıllardır depoda duruyordu ve kimse ne yapılacağını bilmiyordu.

## 1 · MODEL — defter tek otoritedir

Bu projede migration'lar Supabase CLI'ın defterini **kullanmaz**. `psql` ile uygulanır
ve `public._migration_ledger` tablosuna kaydedilir. Defterde adı görünen dosya
**atlanır**.

> ⚠**BU CÜMLE 2026-09-16'YA KADAR GEREKÇESİZ DURUYORDU** — bilgi vardı, NİÇİN'i yoktu.
> Recep sordu: *"bu işi neden Supabase tarafında döndüremiyoruz, defter işini?"* ve cevap
> hiçbir yerde yazılı değildi. §1.1 o boşluğu ölçümle kapatır. Bir cetvelin
> gerekçesiz maddesi, bir sonraki okuyucuya "öyle karar verilmiş" demekten başka bir şey
> söylemez; bugün o maddeyi ben savunamadım.

**İlk koşu baseline'ı:** defter boşken koşan tur, o andaki **tüm** dosyaları "zaten
uygulanmış" kabul edip yalnız **kaydeder**, çalıştırmaz. Bu, workflow'un devraldığı
tarihsel durumdur.

## 1.1 · NİÇİN KENDİ DEFTERİMİZ — İKİ DEFTER YAN YANA ÖLÇÜLDÜ (2026-09-16)

Karar **tercih değil, devralınmış bir durumdu** ve bu bölüm onu ölçümle sabitler.

### Ölçüm (prod, salt-okuma)

| | `public._migration_ledger` (bizim) | `supabase_migrations.schema_migrations` (satıcının) |
|---|---|---|
| Kayıt | **235** | 110 |
| Depodaki dosya ile parite | **235 = 235, birebir** (ad ad `md5`, bayt sırasıyla) | — |
| Karşı defterde OLMAYAN kaydı | 232 | 108 |
| Ortak | **3** | 2 |
| Son yazım | **2026-09-16 12:14** (bugün, canlı) | damgaya göre **2026-04-30**'da donmuş |
| `statements` kolonu | yok (yalnız `name` + `applied_at`) | 110/110 dolu |

⭐**SATICININ DEFTERİ BU PROJEDE HİÇ TAM OLMADI.** Nisan'da donduğu anda bile 110 kayıt
tutuyordu, o tarihe kadarki dosya sayısı ise 160'tı. Yani "kullanmayalım" kararından
önce o defter zaten eksikti; kimse çalışan bir şeyi bırakmadı.

### Kendi defterimizin verdiği — ve satıcının vermediği

**Çift yönlü parite kapısı.** `supabase-migrate.yml`'ın son adımı depodaki dosya listesi
ile defter kayıtlarını **iki yönde** karşılaştırır: dosya var/kayıt yok da hata, kayıt
var/dosya yok da hata. Satıcının akışı bu ikinci yönü ölçmez — silinmiş bir migration
sessizce fark edilmez.

**İşlem denetimi dosya başına.** `psql` ile uygulanan dosya, kendi içinde işlem denetimi
taşımıyorsa `--single-transaction` ile sarılır; taşıyorsa sarılmaz. Bu ayrım dosya
düzeyindedir ve satıcı akışında yoktur.

### Kendi defterimizin BEDELİ — ve bugün tam onu ödedik

⛔**Satıcının migration araçlarının HİÇBİRİ bize dokunmuyor.** `supabase migration squash`,
`migration repair`, `db push`, `db reset`, veritabanı dalları (branching) — hepsi
`supabase_migrations.schema_migrations`'a bakıyor, bizim deftere bakmıyor.

⭐**2026-09-16 kaydı, adıyla:** o gün "zincir kırık, sıfır noktası gerekiyor, Supabase
bunun için `migration squash` sunuyor" diye bir yol önerdim ve **o yol bize kapalıydı** —
çünkü o komut bizim defteri görmüyor. Bunu ancak canlı defteri okuyabildiğim an gördüm.
İki defterin varlığı yazılı olsa bu tur hiç yapılmazdı.

### Geçiş ne demek — ve niçin bugün yapılmıyor

Satıcının rayına geçmek, 235 kaydı 110 kayıtla barıştırmak demek: satıcının defterine
yazma, yani **prod veritabanına yazma** → CLAUDE.md kural 13, Recep'in kapısı.

**HÜKÜM (ALTYAPI, 2026-09-16): bugün geçilmiyor.** Gerekçe: bizim defterimiz ÇALIŞIYOR
(235=235 birebir, bugün yazıldı) ve çalışan bir defteri, kullanmadığımız araçlara erişmek
için yeniden yazmanın getirisi bugünkü riski karşılamıyor.

⭐**AMA BU HÜKÜM SÜRESİZ DEĞİL.** Şu üçünden biri olursa geçiş yeniden ÖLÇÜLÜR:
1. Satıcının bir aracına **gerçekten ihtiyaç duyulursa** (veritabanı dalları en olası
   aday: PR başına izole DB, bugün elimizde yok).
2. Kendi akışımız bir kusur üretirse — özellikle parite kapısının **göremediği** bir
   sınıf (kapı ADI karşılaştırır, İÇERİĞİ değil: aynı adla değişmiş bir dosyayı GÖRMEZ).
3. Sıfırdan kurulum yolu bozulursa. Bugün o yol **taban dökümü**dür, `migrations/` DEĞİL
   (ölçüldü: 233 dosyanın 170'i boş veritabanında düşüyor; taban dökümü 0 hatayla kuruyor
   ve canlıyla 4/4 parite veriyor).

### ⛔SIFIRDAN KURULUM: `migrations/` KULLANILMAZ

Bir geliştirici ya da felaket-kurtarma senaryosu sıfırdan veritabanı kuracaksa **taban
dökümünden** başlar (`supabase/baselines/` — en yeni **TAM** dosya, kapsamını kendi
başlığı söyler), sonra taban tarihinden **sonraki** migration'ları uygular.

`migrations/` klasörünü baştan oynatmak **çalışmaz** ve bu bir kusur değil, tarihsel
durumun sonucudur: klasör bir **kayıt**tır, kurulum betiği değildir. Ölçüm ve gerekçe:
`supabase/baselines/README.md`.

⭐**Ölü dosya tam buradan doğar:** baseline turundan önce depoya girmiş ama prod'a hiç
uygulanmamış bir dosya, defterde "görülmüş" olarak durur ve **bir daha asla koşmaz.**
İçindeki SQL geçersiz olsa bile kimse fark etmez.

## 2 · ⭐KURAL — ölü dosya SİLİNİR, ve defter satırı da silinir

> Prod'a hiç uygulanmamış bir migration dosyası **silinir.** Silme, **aynı migration
> içinde** `public._migration_ledger`'dan o adların da silinmesini **zorunlu kılar.**

**Niçin zorunlu:** `supabase-migrate.yml`'ın son adımı bir **ledger paritesi** kapısı —
depodaki dosya adları listesi ile defter kayıt listesi **birebir** aynı olmak zorunda ve
**iki yön de** hata. Dosya silinir de defter satırı kalırsa kapı *"uygulanmış bir
migration depodan silinmiş, DB ile repo ayrışmış"* der ve tur **kırmızı** yanar.

→ Bu yüzden **"ölü dosyayı sil" kararı, teknik olarak "prod veritabanından satır sil"
demektir** ve **kural 13 gereği Recep'in kapısıdır.** Bu cetvel o kapıyı gevşetmez.

## 2.1 · ⭐⭐SUPABASE'İN KENDİ YOLU — BU BÖLÜM RECEP'İN İTİRAZINDAN DOĞDU (2026-09-16)

Recep aynen: *"bizim cetvelimiz Supabase'den daha mı iyi biliyor? Ayrıca o cetvel Supabase'den
esinlenmek zorunda idi. Biz neden standart ve cetvel oluşturuyoruz — kendimize sınır koymak
için mi, yoksa geliştiricilerin sunduklarını kendimize rehber edinmek için mi?"*

**Haklıydı ve bu cetvel o hatayı yapmıştı.** §3 aşağıda üç yolu reddediyor; ama Supabase'in o
problem için **ne sunduğu** hiç yazılmamıştı. Cetvel tek bir olaydan (REC-321, beş dosya)
doğdu, dış pratiğe bakmadı, ve hükmü **satıcının desteklediği bir yolu bize yasaklar** hâle
geldi.

### ⭐GENEL KURAL — BU CETVELDEN BÜYÜK, HEPİMİZİ BAĞLAR

> **Bir cetvel bir YOLU REDDETMEDEN önce, satıcının o problem için NE SUNDUĞUNU yazmak
> zorundadır.** Ölçmemişse açıkça *"dış pratik ÖLÇÜLMEDİ"* der ve o hüküm **ENGEL OLARAK
> KULLANILAMAZ.**
>
> Cetvelin meşru alanı **YEREL OLGULARDIR**: bizim boru hattımızda migration'ın master'a merge
> edilince prod'a **otomatik uygulanması**, deponun **PUBLIC** olması, parite globunun
> **özyinelemeli olmaması**. Bunları satıcı bilemez.
>
> Satıcının **adı konmuş bir fiili** varsa varsayılan **onun yoludur**; cetvelin işi o yolun
> **ETRAFINDAKİ yerel kısıtı** yazmaktır — yolu yasaklamak değil.

⚠**Niçin tek vakadan büyük:** depoda **78 cetvel** var ve aynı hatanın kaç tanesinde olduğunu
**bilmiyoruz.** Bu madde o taramanın ölçütüdür.

### Supabase ne sunuyor — ölçüldü (`docs/audits/rec352-dis-pratik-2026-09-16.md`)

| Fiil | Ne yapar | Bizim kısıtımız (HÜKÜM DEĞİL, KISIT) |
|---|---|---|
| **`migration squash`** | Geçmişi **tek dosyaya indirir**. Bayraklar: `--version` · `--local` · `--linked` · `--db-url` | ⛔**`--linked` BAĞLI PROJENİN defterine yazar** = prod yazması = **CLAUDE.md kural 13**, Recep'in kapısı. `--local` serbesttir. |
| **`migration repair <sürüm> --status applied\|reverted`** | Defter tablosunu **onarır** | REC-321'de aynı işi **elle yazılmış bir migration ile** yaptık. Onların fiili daha dar ve niyeti açık; bir sonraki vakada **önce bu düşünülür.** |
| **`db diff`** | İki durum arasındaki farkı üretir | Drift ölçümü için kullanılabilir; şema **üretmek** için kullanılmaz (bu proje imperative). |
| **Declarative schemas** (`supabase/schemas` + `db diff`) | İstenen son hâli yazarsın, migration **üretilir** | ⛔**BİZE UYGUN DEĞİL** ve gerekçe **onların kendi belgesi**: `migra` `alter policy`'yi, kolon ayrıcalıklarını, grant'ları (default privileges'tan **mükerrer** üretiyor), comment'leri ve partition'ları **izlemiyor**. Bizde **163 politika / 379 grant** var. Ayrıca onların **kendi seçim ölçütü** bizi imperative sınıfa koyuyor: `supabase/schemas` YOK, `config.toml`'da `schema_paths` YOK. |

### ⭐SIFIR NOKTASI İKİ AYRI SORUDUR — birleştirmek ölçümden geniş hüküm üretir

2026-09-16'da ölçüldü: `supabase db reset` **233 migration'ın 2'sinde** düşüyor
(`202508241205_rpc_admin_orders.sql` → `type "venthub_orders" does not exist`).

- **`supabase db reset` (resmî yerel yol) için sıfır noktası GEREKLİ** — o yol 1. dosyadan
  başlar ve zincir orada kırık.
- **Gölge/taban yolu için GEREKLİ DEĞİL** — o yol tabandan başlar, kırık halkayı hiç görmez;
  yani gölge **zaten sıfır noktası gibi** çalışıyor (`scripts/db/golge-kur.mjs`).

⚠İlk yazımda bunu birleştirip *"zincir kırık → squash şart"* dedim; **akran ölçümle daralttı ve
haklıydı.** İki soruyu ayırmadan verilen hüküm, ölçümden geniş çıkar.

⛔**KAÇ YERDE KIRIK OLDUĞU HENÜZ ÖLÇÜLMEDİ.** Sayı 3 ise onarılır, 40 ise onarılmaz — ve karar
o sayıya bağlıdır. Bu satır yazıldığı anda o ölçüm **açık borçtur**.

## 3 · REDDEDİLEN ÜÇ YOL, gerekçeleriyle

⚠**BU BÖLÜM §2.1 İLE OKUNUR.** Aşağıdaki üç red **mekanizma** reddidir (ölçülmüş: glob
özyinelemeli değil, istisna listesi kapıyı kör eder, yerinde tutmak kurtarmayı çözmez) —
**sıfır noktası KAVRAMININ reddi DEĞİLDİR.** Satıcının o kavram için fiili vardır (§2.1).

| Yol | Niçin reddedildi |
|---|---|
| **Alt dizine taşı** (`uygulanmaz/`) | Hem uygulama hem parite adımı `supabase/migrations/*.sql` globunu kullanıyor ve glob **özyinelemeli değil**. Alt dizine taşımak, parite açısından **silmekle aynı** sonucu verir — yani ayrı bir yol değil. |
| **Parite kapısına istisna listesi** | Kapının amacını yok eder: defter, "atla" kararının **tek** dayanağı; istisna listesi o dayanağın **kör bir sınıfını** yaratır. Üstelik konformans kolu R3 parite adımının **varlığını** ölçüyor, **katılığını ölçmüyor** — istisna eklenince kapı **yeşil görünmeye devam eder.** |
| **Yerinde tut, başına "ÖLÜ" notu düş** | Prod'a dokunmaması cazipti (ALTYAPI ve OPS bunu önerdi). Ama **felaket kurtarmayı çözmüyor** — aşağıya bakınız. |

## 4 · ⛔FELAKET KURTARMA — İLK YAZDIĞIM BU BÖLÜM YANLIŞTI, bağımsız çürütme çürüttü

Bu bölümün ilk hâli *"replay bugün patlıyor, silme bunu çözüyor"* diyordu. **Yanlıştı.**
Bağımsız çürütme (plan-challenger, 2026-09-14) çürüttü; ben de kendim ölçüp doğruladım.
Yanlış cümle silinmiyor, **düzeltilmiş hâliyle burada duruyor** — çünkü bu cetvelin en
öğretici maddesi bu.

### Ölçülen gerçek

| | Replay nerede durur | Hata türü |
|---|---|---|
| **Silmeden önce** | `20250907_admin_audit_log.sql` | sözdizimi hatası (`CREATE POLICY IF NOT EXISTS`) |
| **Silmeden sonra** | `20250908_enable_realtime_error_tables.sql` | `relation "error_groups" does not exist` |

→ **Replay iki hâlde de imkânsız.** Silme, kırılma noktasını **bir gün** ileri kaydırıyor
ve hata türünü değiştiriyor. **Net durum değişmiyor.**

### Ve altında daha ciddi bir şey var (yeni bulgu)

**Üç tabloyu hayatta kalan HİÇBİR migration yaratmıyor:** `client_errors`,
`error_groups`, `user_invoice_profiles`. Buna karşılık o tablolara dokunan hayatta kalan
migration sayısı **9 · 9 · 8** (GRANT, `CREATE INDEX`, `ALTER TABLE`, `CREATE POLICY`).
`admin_audit_log` tek istisna: onu `20250910_fix_admin_audit_log_policies.sql` yeniden
yaratıyor.

⭐**Yani bu depo, migration geçmişinden veritabanını yeniden kuramıyor.** Tablolar
prod'da **var** (8-9 migration onlara başarıyla dokunmuş), ama depoda **onları yaratan
bir migration yok** — yani prod'un şeması, migration geçmişinin **üretebileceğinden
farklı.** Bu, REC-321'den **bağımsız ve daha büyük** bir açık: bugün bir felaket
kurtarma denenirse migration geçmişi yetmez. **Ayrı kayıt gerektirir.**

⚠**Bir kayıp da var, adıyla:** silinen `202508261956_user_invoice_profiles.sql`
**geçerli SQL** taşıyordu (politikaları `DO $$ ... EXCEPTION WHEN duplicate_object`
ile korumalı) ve `user_invoice_profiles` tablosunun **tek yaratıcısıydı.** Silmek o
yaratıcıyı kaldırdı. Replay zaten daha erken kırıldığı için bugün **maskeli** bir
kayıp — ama gerçek.

### DERSLER (ikisi de ilk yazımdan farklı)

1. ⭐**Bir öneri ölçülmemiş bir boyutta yanlış olabilir** — bu ders **ayakta**: ALTYAPI ve
   OPS bağımsız olarak aynı seçeneği önerdi ve ikisi de DR boyutunu ölçmemişti. *İki
   bağımsız önerinin uyuşması, ikisi de aynı şeye bakmadıysa doğrulama değildir.*
2. ⛔**Ama "ölçtüm" demek de yetmiyor:** ben DR boyutunu ölçtüm ve **yarısını** ölçtüm.
   *"Bu dosyalar patlıyor"* doğruydu; *"silmek bunu düzeltir"* **ölçülmemiş bir
   çıkarımdı** — silme sonrasında replay'in nerede durduğunu ölçmemiştim. **Bir
   düzeltmenin işe yaradığı, düzeltme SONRASI durum ölçülmeden söylenmez.**
3. **Karar yine de doğru kalıyor** ama **başka bir sebeple:** dosyalar prod'da ölü, geri
   dönüşü olmayan bir işlev taşımıyorlar ve depoda yanlış inanç üretiyorlar. DR gerekçesi
   **geçersiz**; "ölü dosya tutulmaz" gerekçesi **geçerli.** Doğru hükmü yanlış sebeple
   savunmak, bir sonraki kararda yanlış yere götürür.

→ **KURAL:** ölü/geçersiz migration kararlarında DR replay boyutu **hem önce hem sonra**
ölçülür ve **iki sayı** yazılır. "Bu düzeltme DR'ı iyileştirir" cümlesi, düzeltme
sonrası kırılma noktası ölçülmeden yazılmaz.

## 5 · POLİTİKA KAYBI SORUSU — ayrı borç, bu cetvel onu kapatmaz

Ölü dosyaların **adları** bazı tablolara RLS politikası yazmayı vaat ediyordu
(`admin_audit_log`, `client_errors`, `error_groups`, `product_images`,
`user_invoice_profiles`). Dosyalar hiç uygulanmadığı için **o politikalar prod'da YOK.**

⚠**Dosyaları silmek bu borcu KAPATMAZ** — yalnız **yanlış inancı** kaldırır. Gerçek
politika işi ayrı kayıttır (REC-321 adım 2). Bir temizliğin, kapatmadığı borcu
kapatmış gibi görünmesi bu cetvelin engellediği şeydir.

## 5.1 · ⭐ÖLÜ OLMAK TEK BAŞINA SİLME GEREKÇESİ DEĞİLDİR

REC-321 **altı** ölü dosyayla başladı, **beşi** silindi. Altıncısı
(`202508261956_user_invoice_profiles.sql`) **duruyor** ve sebebi ölçüldü:

| Ölçüt | Bu dosya |
|---|---|
| Prod'a uygulanmış mı | **hayır** (ölü) |
| Geçersiz SQL taşıyor mu | **hayır** — politikaları `DO $$ … EXCEPTION WHEN duplicate_object` ile korumalı |
| Replay'de işe yarıyor mu | **evet** — `public.user_invoice_profiles` tablosunun depodaki **tek yaratıcısı**, ve o tabloya dokunan sekiz migration hayatta |

→ **KURAL:** silme gerekçesi **ölülük değil, GEÇERSİZLİK + İŞLEVSİZLİK.** Recep'in
ilkesi *"işe yaramayan dosya tutulmaz"* idi; bu dosya **yarıyor**, dolayısıyla ilke onu
**kapsamıyor.** Üç ölçüt de ayrı ayrı ölçülmeden bir dosya silinmez.

⭐**Bunu bir SAYI düzeltmesi ortaya çıkardı.** "Altı dosyada 11 geçersiz ifade" sayısını
yorumsuz kod üzerinde yeniden ölçünce **10 ve beş dosyada** çıktı; fazlalığın bu dosyanın
**yorumundan** geldiği görüldü. Yani **sayıyı düzeltmek kararı düzeltti.** Bayat bir sayı,
yanlış bir kapsam üretir — ve kapsam uygulanmış olsaydı geri dönüşü olmayacaktı.

## 6 · SİLMEDEN ÖNCE YAZILAN KAYIT — zorunlu adım

Ölü bir dosya silinmeden **önce**, o dosyanın **başka bir yerdeki ize sebep olup
olmadığı** kayda geçirilir.

**Ölçülmüş örnek:** silinen `20250909_fix_product_images_rls.sql`, REC-322'nin
hedeflediği üç ölü `storage.objects` politikasını **düşüren** dosyaydı. Hiç
uygulanmadığı için o düşürme **hiç olmadı** — yani *"üç ölü politikanın bugüne kadar
yaşamış olabilmesinin sebebi, onları öldürecek dosyanın hiç koşmamış olması."*

→ **KURAL:** ölü dosya silinmeden önce bu bağ **iş kaydına yorum olarak** yazılır. Dosya
gidince iz kaybolur; *"bu niye böyle olmuş"* sorusunun cevabı o yorumda kalır.

## 7 · ARİTMETİK YAZILIR, VARSAYILMAZ

Silme PR'ında şu dört sayı **ölçülerek** yazılır:

1. depodaki migration dosyası sayısı,
2. **son yeşil parite koşumundaki** dosya sayısı (defterin o anki sayısı budur),
3. o koşumdan sonra depoya giren migration sayısı (`git diff --diff-filter=A`),
4. silinen ve eklenen dosya sayısı.

Sonra iki taraf **eşit mi** diye gösterilir. Ayrıca **adım sırası** doğrulanır: uygulama
adımı parite adımından **önce** koşmalı, yoksa silme turu kırmızı yanar.

**REC-321'in sayıları (TAZELENMİŞ, bkz. §7.2):** 237 dosya · son yeşil koşum (`667a49ab`) 237 · sonradan giren
**0** · silinen **5**, eklenen 1 → **dosya 233, defter 233** (ikisi de ÖLÇÜLDÜ, bkz. §7.1). Adım sırası: Baseline(80) →
Apply(95) → Parite(179). ✓

## 7.1 · ⭐DEFTER OKUNABİLİYORSA DOLAYLI KANITLA YETİNİLMEZ

REC-321 ilk yazımında defterin sayısı **dolaylı** olarak çıkarılmıştı: *"son parite
koşumu yeşil geçtiğine göre defter dosya sayısına eşitti."* Doğru bir çıkarımdı ama
**o koşumun anı** için geçerliydi.

Recep 2026-09-14'te prod defterini **salt-okuma** okuma iznini verdi. Ölçüm:

| Ne | Değer |
|---|---:|
| `_migration_ledger` toplam kayıt | **237** |
| depodaki migration dosyası | **237** |
| silinecek beş addan defterde bulunan | **5** |
| tutulan `202508261956_…` defterde | **1** |
| REC-322 migration'ı (#1186) defterde | **1** |

→ **Parite artık dolaylı değil, ÖLÇÜLMÜŞ.** Ve beklenen silme sayısı **tahmin değil,
ölçüm**: tam beş.

→ **KURAL:** defteri okumak mümkünse **dolaylı kanıtla yetinilmez.** Dolaylı kanıt
(yeşil kapı) yokluk için yeterli olabilir, ama **bir sayıyı** dayandırmak için zayıftır;
o sayıya bir kontrol bağlanacaksa doğrudan ölçülür.

## 7.2 · ⚠TABAN KAYARSA ARİTMETİK YENİDEN ÖLÇÜLÜR

REC-321'in sayıları **bir kez tazelendi** ve sebebi öğretici: ilk yazımda taban **236**,
referans koşum `643c7089` idi. Sonra REC-322'nin migration'ı master'a girip prod'a
uygulandı; yeni parite koşumu `667a49ab` **237** dosyayla yeşil geçti. **Defterin
dayanağı değişti.**

⚠**Eski sayı hâlâ "doğru görünüyordu"** — tutarlı bir üçlüydü (236/236/232) ve yalnız
**yeniden ölçüm** yakaladı.

→ **KURAL:** dal master'la tazelendiğinde **aritmetik de yeniden ölçülür.** Bu sayılar
"bir kez yazılıp bırakılan" sayılar değil, **tabana bağlı** sayılardır.

## 8 · DEFTER SİLMESİ DOĞRULANIR — "koştu" ile "yaptı" ayrı şeyler

`delete` ifadesi **desen kullanmaz** (`LIKE '2025%'` gibi) — bir desen yarın eklenen bir
dosyayı da kapsayabilir ve migration sessizce **yanlış satırı** siler. Adlar **tek tek**
yazılır.

Silmeden **sonra** kalan satır sayısı **aynı transaction içinde** doğrulanır; beklenen
sayı çıkmazsa `raise exception` ile tur **kırmızı** yanar ve transaction geri alınır.
Sessiz bir kısmi silme, paritenin bozulması demekti.

## 9 · BU CETVELİN SINIRLARI (adıyla)

- ⭐**Defter DOĞRUDAN okundu** (2026-09-14, Recep'in kendi izniyle, salt-okuma): 237
  kayıt, silinecek beş addan defterde **5**. Yani bu cetvelin ilk yazımındaki "dolaylı
  kanıt" sınırı **kapandı** ve beklenen silme sayısı migration'a **ölçülmüş** olarak
  yazıldı (§7.1).
  ⚠**Kalan sınır:** bu ölçüm de bir **ANA** aittir. Merge ile uygulama arasında defter
  elle değiştirilirse migration **kırmızı** yanar (beklenen 5 tutmaz) — bu **istenen**
  davranıştır, kusur değil.
  ⚠**İzin disiplini de kayda geçti:** aynı izin önce bir **akran aktarımıyla** geldi ve
  **kullanılmadı** — o çağrıyı reddeden şey Recep değil, oturumun izin katmanıydı;
  reddedilmiş bir eylemi "onaylandı" denerek yeniden denemek o katmanı atlamak olur.
  İzin Recep'in **kendi cümlesiyle** ulaştığında aynı turda koşuldu.
- **REC-321'in "11 geçersiz ifade" sayısı düzeltildi:** yorumlar çıkarıldıktan sonra
  gerçek sayı **10** ve **beş** dosyada. Altıncısı
  (`202508261956_user_invoice_profiles.sql`) geçersiz SQL **taşımıyor** — içindeki
  `IF NOT EXISTS`'lerin hepsi geçerli `CREATE TABLE`/`CREATE INDEX` biçimi; tek
  `CREATE POLICY IF NOT EXISTS` geçişi bir **yorum** satırında. 11 sayısı o yorumu da
  saymıştı. O dosya ölü ama "geçersiz" değil, yalnız hiç uygulanmamış.
- **Bu cetvel tek bir vakadan yazıldı.** İkinci bir ölü dosya kümesi çıkarsa buradaki
  kural sınanmış olacak; bugün sınanmamış durumda.

## 10 · ⭐ŞEMA YARATAN MIGRATION VERİ KOŞULU ARAMAZ (REC-336, 2026-09-15)

**Sürüm 1.1 ile eklendi. Kaynak: REC-336 şema replay ölçümü — `docs/audits/rec336-baseline-2026-09-15.md`.**

### Kural (üç cümle)

1. **Şema yaratan bir migration VERİ koşulu ARAMAZ.** `create table`, `alter table`,
   `create index`, `create policy` yapan bir dosya "şu tabloda şu kadar satır olmalı"
   diye bir ön koşul koymaz.
2. **Veri koşulu AYRI DOSYAYA yazılır.** Aynı işi yapan iki dosya olur: biri şemayı
   kurar, diğeri veriyi taşır ve kendi ön koşulunu arar.
3. **Migration KENDİ İŞLEMİNİ COMMIT ETMEZ.** Sarmalamayı koşucu yapar; dosya kendi
   `commit`ini yazarsa hata anındaki durum kısmi kalır ve kimse neyin uygulandığını
   bilemez.

### Niçin — ölçülmüş olay, varsayım değil

REC-336'da boş bir gölge veritabanına taban dökümü + 63 migration oynatıldı: **25'i
düştü.** Kök sebep **tek dosya**: `20260811_f2_split_model_schema.sql`.

O dosya aynı işlem içinde üç şeyi birden yapıyor: `brands` ve `product_families`
tablolarını (ve indekslerini) **yaratıyor**, "yeni kategori sayısı 4 değil" diye bir
**veri koşulu arıyor**, ve **kendi işlemini commit ediyor.**

Boş gölgede kategori verisi yoktur → koşul tutmaz → dosya işlemi geri alır → **yarattığı
ŞEMA da geri gider** → ondan sonraki ~20 migration `brands` bulamadığı için domino gibi
düşer.

**Korumanın kendisi DOĞRU tasarımdır.** Sessiz kısmi göç yerine geri almak istenen
davranıştır ve bu cetvelin §8'i de bunu söyler. Yanlış olan **YERİ**: şema ile veri koşulu
aynı işlemde birleşince, **veri yoksa şema da üretilemez** hale gelir. Tek bir karışık
dosya, bütün zincirin sıfırdan kurulabilirliğini imkânsız kılar.

### ⭐NİÇİN BU BİR SİLME/DÜZELTME EMRİ DEĞİL

Geçmiş bir migration'ı **değiştirmek yasaktır** (§1: defter tek otoritedir; dosyayı
değiştirmek pariteyi bozar). O yüzden `20260811_f2_split_model_schema.sql`
**değiştirilmedi** ve değiştirilmeyecek. Kural **bundan sonra yazılacak** dosyalar için
geçerlidir; mevcut dosya **BORÇ** olarak ilan edilir
(`docs/sema-replay-veri-korumali-migrationlar.json`, sınıf `SEMA-VERI-KARISIK`).

Borcun çözüm yolu dosyayı geçmişte onarmak değil, **taze bir şema tabanı tutmaktır**:
taban canlının o günkü hâli olduğu için karışık dosyanın üstünde durur ve zincir artık
ondan başlamaz.

### İLAN EDİLMİŞ İSTİSNA

Kural mutlak değildir ama istisna **bedavaya alınmaz.** Bir dosya hem şema hem veri koşulu
taşıyacaksa:

- Dosya `docs/sema-replay-veri-korumali-migrationlar.json` içinde **`SEMA-VERI-KARISIK`**
  sınıfıyla ilan edilir,
- İlan kaleminde **`borc` alanı zorunludur** ve niçin başka yolu olmadığını yazar,
- Kapı (`INV-SEMA-TABAN-2`) ilanı ve borcu ölçer; ilansız bir karışık dosya **KIRMIZI**.

**Muafiyet ile sınıf ilanı aynı şey değildir:** muafiyet "hatasını görmezden gel" der,
sınıf ilanı "bu bir kusurdur, adı yazılıdır, yenisi böyle yazılmaz" der.

### SINIR (adıyla)

- Bu kural **bir vakadan** yazıldı. İkinci bir karışık dosya çıkarsa kural sınanmış
  olacak; bugün sınanmamış durumda.
- Kapı, karışık dosyayı **ilan zorunluluğu** üzerinden ölçer; "şema mı veri mi" ayrımını
  SQL'i anlayarak yapmaz. Yani yeni yazılan bir karışık dosya, kimse ilana koymazsa
  **kapıya yakalanmaz**. Bu boşluk bilinçli olarak açık bırakıldı ve burada yazılıdır:
  SQL'i anlamaya çalışan bir ölçüt, yanlış-kırmızı üretip kapatılma riskini taşır.
