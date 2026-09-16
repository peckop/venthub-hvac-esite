# REC-352 adım 1 — DIŞ PRATİK ÖLÇÜMÜ: Supabase'in resmî yolu, bizim cetvelimizle yan yana

**Tarih:** 2026-09-16 · **Şerit:** ALTYAPI · **Kayıt:** REC-352 adım 1
**Doğuran soru (Recep, 2026-09-15):** *"bak bu bizim cetvelimizde ölçülmüş ya bu işin doğrusu
mu değil mi bilmiyoruz… en doğru nedir bilelim, ona göre yapalım."*

---

## CEVAP — cetvelimiz Supabase resmî deseniyle örtüşüyor mu: **KISMEN**

**Tek cümleyle sebep:** **model seçimimiz** Supabase'in resmî iki seçeneğinden biridir ve
onların kendi ayırt edici ölçütüne göre bizim projeye **doğru olan** seçenektir; ama
**"sıfır noktası yolunu reddet" hükmümüz** örtüşmüyor, çünkü Supabase bu iş için
`migration squash` diye **kendi fiilini yayınlıyor**.

---

## 1 · Ölçülen kaynaklar (hepsi birincil)

| # | Kaynak | Nasıl ölçüldü | Sınıf |
|---|---|---|---|
| 1 | **Supabase CLI 2.114.0** — bu makinede kurulu | Komutun **kendi yardım metni** okundu (`migration --help`, `migration squash --help`, `migration repair --help`, `db diff --help`) | A · kendi ölçümüm |
| 2 | **Supabase resmî belgeleri** | Supabase'in **kendi belge arama servisi** (MCP `search_docs`) — "Declarative database schemas" kılavuzu TAM METİN + "Known caveats" bölümü; "Database Migrations" kılavuzu | A · kendi ölçümüm |
| 3 | **`supabase/agent-skills` deposu** | `skills add --list` ile depo içeriği listelendi (kurulum YAPILMADI) | A · kendi ölçümüm |
| 4 | **Bizim projemiz** | `supabase/config.toml`, `supabase/schemas` varlığı, `supabase/migrations/*.sql` sayımı, yerel yığın şeması (psql) | A · kendi ölçümüm |

⚠**SAPMA, adıyla:** emir **Context7** diyordu; ben Supabase'in **kendi** belge servisini kullandım.
Gerekçe: kaynak birincil ve bağlıydı, Context7 aracı bir katman daha uzak. Sapma bu satırla yazıldı.

---

## 2 · TEK TABLO — Supabase'in yolu ile bizim yolumuz

| Supabase'in yolu | Ne yapar (onların cümlesi) | Bizde karşılığı (ölçülmüş) | Örtüşüyor mu | Hüküm |
|---|---|---|---|---|
| **Option B · imperative migrations** | Elle yazılmış `supabase/migrations/*.sql` dosyaları, sırayla uygulanır. Skill'in kendi cümlesi: *"Use this when the project does not use declarative schemas."* | **Tam olarak bu.** 233 migration dosyası, sırayla, `supabase-migrate.yml` ile prod'a otomatik | ✅**EVET** | **KALSIN — resmî yolun biriyiz** |
| **Option A · declarative schemas** | `supabase/schemas/` altında **istenen son hâl** yazılır, `supabase db diff -f <ad>` migration'ı **üretir**. Seçim ölçütü onların: *"Use this when `supabase/schemas/` exists or `config.toml` sets `schema_paths`."* | `supabase/schemas` **YOK** · `config.toml`'da `schema_paths` **YOK** → onların kendi ölçütüne göre bu proje **Option B** | ✅**UYGUN — geçmemek DOĞRU** | **GEÇMİYORUZ**, gerekçe §3 |
| **`migration squash`** | Geçmişi **tek dosyaya indirir**. Bayraklar: `--version` (belirli sürüme kadar) · `--local` · `--linked` · `--db-url` | Cetvelimiz (`ledger-ve-olu-migration-standard.md` §3) "alt dizine taşı / arşivle" yolunu **reddetti** ve sıfır noktası kavramını kapattı | ❌**HAYIR — burada ayrışıyoruz** | **CETVEL GÖZDEN GEÇİRİLMELİ** (§4) |
| **`migration repair <sürüm> --status applied\|reverted`** | Defter tablosunu **onarır** | REC-321'de 5 defter satırını **elle yazılmış bir migration ile** sildik | ⚠**KISMEN** — işi yaptık ama onların fiilini kullanmadık | **CETVELE FİİL ADIYLA YAZILSIN** |
| **`db dump` (şema)** | Şemanın **tam anlık görüntüsü** | 2026-09-15 tabanı tam bunla alındı (CI koşumu 34950954930, 8616 satır) | ✅**EVET** | **KALSIN** |
| **`db diff`** | İki durum arasındaki **farkı** üretir. Motorlar: `migra` (varsayılan) · `pg-delta` · `pgadmin` | Bizde kullanılmıyor; Option A'nın aracı | ⚠**KISMEN** — şema tarafında değil, ama drift ölçümü için kullanılabilir | **AYRI KALEM** (drift kapısı) |
| **Yerel geliştirme yığını (`supabase start`)** | Resmî akışın **varsaydığı** ortam; `db diff --local`, `migration up` hep buna bakar | Yığın **VAR ve sağlıklı** (Docker açılınca kendiliğinden kalktı, 11 servis) ama **BAYAT**: 18 tablo / 25 defter satırı · canlıda 66 tablo / 233 dosya | ⚠**KISMEN** — ortam var, tazeliği yok | **§5 · karar bekliyor** |
| **Branching (şube veritabanı)** | Supabase'in kendi geçici kopya ortamı | **ÖLÇÜLMEDİ** | ❓**BİLİNMİYOR** | **AYRI ÖLÇÜM** |

---

## 3 · Option A'ya GEÇMEMENİN gerekçesi ONLARIN belgesinden çıkıyor

Declarative kılavuzunun **"Known caveats"** bölümü, fark üreten aracın (`migra`) **görmediği**
şeyleri tek tek sayıyor. Aynen şunlar:

- **DML** (`insert` / `update` / `delete`) şema farkına **girmiyor**
- **RLS politikaları:** `alter policy` ifadeleri ve **kolon ayrıcalıkları** izlenmiyor
- **Grant'lar:** *"grant statements are duplicated from default privileges"*
- **Comment'ler**, **partition'lar**, `alter publication ... add table ...`, `create domain`
- **View'ler:** sahiplik/grant, `security invoker`, materialized view; kolon tipi değişince
  view yeniden yaratılmıyor

Bizim yüzeyimiz **tam orada**: canlıda **163 politika** ve **379 grant** var (2026-09-15 taban
ölçümü). Yani declarative yola geçmek, şemamızın en kalabalık iki katmanını aracın **kör
noktasına** taşımak olurdu.

> ⭐**BU BULGUNUN DEĞERİ:** dün "declarative schemas kararı 18'i tümden değiştirebilir" diye
> yazmıştım. **Değiştirmiyor** — ve bunu bizim cetvelimiz değil, **Supabase'in kendi belgesi**
> söylüyor. Recep'in itirazının istediği şey tam buydu: hükmü kendi cetvelimize değil dış
> kaynağa dayandırmak.

---

## 4 · CETVELİMİZİN ÖRTÜŞMEYEN YANI — ve bu bizim aleyhimize

`ledger-ve-olu-migration-standard.md` §3, "arşive taşı" yolunu ölçtü ve reddetti. Ölçüm
**doğruydu** (glob özyinelemeli değil → taşımak = silmek). Ama oradan çıkan **hüküm**, sıfır
noktası kavramının tamamını kapattı gibi okunuyor — oysa:

**Supabase `migration squash` diye bir fiil yayınlıyor.** Yani "geçmişi tek dosyaya indirmek"
onların dünyasında desteklenen, adı konmuş bir işlem. Bizim cetvelimiz bir **mekanizmayı**
(dosyayı alt dizine taşımak) reddetmişti; o red **yerinde**, ama **kavramın** reddi değil.

⛔**GÜVENLİK SINIRI, ÖLÇÜLDÜ:** `migration squash --linked` **bağlı projenin** defterine yazar.
Bağlı proje = **prod**. Yani o bayrak **CLAUDE.md kural 13** kapsamındadır ve şerit koşturamaz.
Kuru koşum yalnız `--local` ya da gölge kümede yapılır. **`--linked` HİÇBİR DURUMDA.**

**Öneri (tek):** cetvel §3'e bir **ayrım** yazılır — *"alt dizine taşıma yolu REDDEDİLDİ (ölçüm:
glob özyinelemeli değil); ama sıfır noktası kavramı Supabase'de `migration squash` fiiliyle
DESTEKLENİYOR. O fiilin `--linked` biçimi prod yazmasıdır ve kural 13'e tabidir; `--local`
biçimi serbesttir. Karar 18 bu ayrımla okunur."*

---

## 5 · Yan bulgu: `agent-skills` kıyası (REC-350 kuralı)

| Ölçüm | Sonuç |
|---|---|
| Kaynak depoda kaç skill var | **2** — `supabase` ve `supabase-postgres-best-practices` |
| Bizim ağacımıza kaç tanesi alındı | **1** (`supabase`), sürüm **0.1.2** |
| Bizdeki kopya güncel mi | **HAYIR** — plugin'in taşıdığı sürüm **0.1.15**, arada 13 sürüm |
| Bizdeki kopya gerçekten kopya mı | **HAYIR, FORK** — 19.217 bayt (taze 12.979); içinde bize ait **on bölüm** var |
| Eksik olan ne | Bizdeki 0.1.2'de **"Making and Committing Schema Changes"** bölümü **HİÇ YOK** — yani Option A/B ayrımı ve seçim ölçütü bizde yazılı değildi |
| `supabase-postgres-best-practices` bizde var mı | **HAYIR** — hiç alınmamış. Ama **4 Eylül'den beri** bu makinede duruyor (plugin 0.1.15 ile geldi) ve **hiç açılmadı** (12 gün) |
| Bizim `supabase-security` dosyamız onların mı | **HAYIR, BİZİM** — VentHub güvenlik standartları, `venthub_orders`, kural 25. Yukarıdaki iki skill'in **hiçbirinin** kopyası değil |

**Recep kararı (2026-09-16):** plugin kurulacak (yapıldı, etkinleştirildi, yeniden başlatma
bekliyor), bizdeki **bayat fork ayrılacak** — dış metin plugin'e bırakılır, bizim on bölümümüzden
**dokuzu** zaten CLAUDE.md / ESLint kapısı / kardeş skill'de yazılı olduğu ölçüldü, taşınacak olan
**bir** bölüm: *MCP ile CLI'ın advisor kapsam farkı*.

---

## 6 · BU ÖLÇÜMÜN SINIRLARI (adıyla)

1. **Hiçbir Supabase fiili KOŞTURULMADI.** Tablodaki her satır ya komutun kendi sözleşmesi ya
   resmî belge — **B sınıfı değil A sınıfı** ama **davranış ölçümü değil**. `squash`'ın bizim
   233 dosyalık zincirimizde ne ürettiği **bilinmiyor**.
2. **Kuru koşum YAPILAMADI.** Sebebi ölçüldü ve iki katmanlı: (a) yerel yığın **bayat** (18/66),
   (b) tazelemenin komutu (`supabase db reset`) **bizim kendi yasak listemizde** — haklı olarak,
   çünkü aynı fiilin `--linked` biçimi prod'u sıfırlar. Kuru koşum bu ayrım yazılmadan yapılamaz.
   **Recep'e giden karar maddesi bu.**
3. **Branching hiç ölçülmedi** — ne maliyeti ne davranışı.
4. **`db diff` motor farkı** (`migra` ↔ `pg-delta`) okunmadı; caveat listesi `migra` içindir,
   `pg-delta` daha yeni ve farklı davranabilir. Option A hükmü **bu sınırla** okunur.
5. **Rails / Django / Flyway karşılaştırması YAPILMADI.** Dün "hiçbirine bakmadık" diye yazdım;
   bugün de bakmadım. Supabase birincil kaynak olduğu için önce o ölçüldü; diğer ekosistemler
   **açık kalem**.
