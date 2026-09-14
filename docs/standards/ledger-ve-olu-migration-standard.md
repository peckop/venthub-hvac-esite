# Ledger ve Ölü Migration Dosyası Cetveli

**Sürüm 1.0 · 2026-09-14 · Şerit: ALTYAPI · Kaynak: REC-321 (Recep kararı, SEÇENEK 1)**

Bu cetvel şu soruya cevap verir: **prod'a hiç uygulanmamış ama depoda duran bir
migration dosyası ne olur?** 2026-09-14'e kadar bu sorunun yazılı cevabı **yoktu**;
altı dosya yıllardır depoda duruyordu ve kimse ne yapılacağını bilmiyordu.

## 1 · MODEL — defter tek otoritedir

Bu projede migration'lar Supabase CLI'ın defterini **kullanmaz**. `psql` ile uygulanır
ve `public._migration_ledger` tablosuna kaydedilir. Defterde adı görünen dosya
**atlanır**.

**İlk koşu baseline'ı:** defter boşken koşan tur, o andaki **tüm** dosyaları "zaten
uygulanmış" kabul edip yalnız **kaydeder**, çalıştırmaz. Bu, workflow'un devraldığı
tarihsel durumdur.

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

## 3 · REDDEDİLEN ÜÇ YOL, gerekçeleriyle

| Yol | Niçin reddedildi |
|---|---|
| **Alt dizine taşı** (`uygulanmaz/`) | Hem uygulama hem parite adımı `supabase/migrations/*.sql` globunu kullanıyor ve glob **özyinelemeli değil**. Alt dizine taşımak, parite açısından **silmekle aynı** sonucu verir — yani ayrı bir yol değil. |
| **Parite kapısına istisna listesi** | Kapının amacını yok eder: defter, "atla" kararının **tek** dayanağı; istisna listesi o dayanağın **kör bir sınıfını** yaratır. Üstelik konformans kolu R3 parite adımının **varlığını** ölçüyor, **katılığını ölçmüyor** — istisna eklenince kapı **yeşil görünmeye devam eder.** |
| **Yerinde tut, başına "ÖLÜ" notu düş** | Prod'a dokunmaması cazipti (ALTYAPI ve OPS bunu önerdi). Ama **felaket kurtarmayı çözmüyor** — aşağıya bakınız. |

## 4 · ⭐ÖLÇÜLMEMİŞ BOYUT: FELAKET KURTARMA — ve öneriyi bu bozdu

Boş bir veritabanına bütün migration'lar sırayla koşulduğunda ne olur?

**Ölçüldü (2026-09-14):** altı ölü dosyanın **beşi** `CREATE POLICY IF NOT EXISTS`
taşıyor. PostgreSQL bu sözdizimini **desteklemiyor** ve ifadeler **en üst seviyede**,
hiçbir `DO $$` bloğuyla korunmuş değil. Yani **bugün sıfırdan bir kurulum denenirse o
replay o dosyalarda sözdizimi hatasıyla patlar.**

⭐**"Yerinde tut, not düş" seçeneği bu kusuru ÇÖZMÜYORDU.** Notu okuyan insan uyarılırdı,
replay yine patlardı. **Silme çözüyor.**

→ **DERS:** bir öneri, **ölçülmemiş bir boyutta** yanlış olabilir. ALTYAPI ve OPS
bağımsız olarak aynı seçeneği önerdi; ikisi de **felaket kurtarma boyutunu ölçmemişti.**
İki bağımsız önerinin uyuşması, ikisi de aynı şeye bakmadıysa doğrulama değildir. Kararı
veren Recep, ölçülmemiş boyutta daha iyi olanı seçti.

→ **KURAL:** bundan sonra ölü/geçersiz migration kararlarında **DR replay boyutu ölçülür
ve yazılır.** "Bugün zarar vermiyor" cümlesi, replay senaryosu ölçülmeden yazılmaz.

## 5 · POLİTİKA KAYBI SORUSU — ayrı borç, bu cetvel onu kapatmaz

Ölü dosyaların **adları** bazı tablolara RLS politikası yazmayı vaat ediyordu
(`admin_audit_log`, `client_errors`, `error_groups`, `product_images`,
`user_invoice_profiles`). Dosyalar hiç uygulanmadığı için **o politikalar prod'da YOK.**

⚠**Dosyaları silmek bu borcu KAPATMAZ** — yalnız **yanlış inancı** kaldırır. Gerçek
politika işi ayrı kayıttır (REC-321 adım 2). Bir temizliğin, kapatmadığı borcu
kapatmış gibi görünmesi bu cetvelin engellediği şeydir.

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

**REC-321'in sayıları:** 236 dosya · son yeşil koşum (`643c7089`) 236 · sonradan giren
**0** · silinen 6, eklenen 1 → **dosya 231, defter 231.** Adım sırası: Baseline(80) →
Apply(95) → Parite(179). ✓

## 8 · DEFTER SİLMESİ DOĞRULANIR — "koştu" ile "yaptı" ayrı şeyler

`delete` ifadesi **desen kullanmaz** (`LIKE '2025%'` gibi) — bir desen yarın eklenen bir
dosyayı da kapsayabilir ve migration sessizce **yanlış satırı** siler. Adlar **tek tek**
yazılır.

Silmeden **sonra** kalan satır sayısı **aynı transaction içinde** doğrulanır; beklenen
sayı çıkmazsa `raise exception` ile tur **kırmızı** yanar ve transaction geri alınır.
Sessiz bir kısmi silme, paritenin bozulması demekti.

## 9 · BU CETVELİN SINIRLARI (adıyla)

- **Defter doğrudan okunmadı.** Sayı kanıtı **dolaylı**: son parite koşumunun yeşil
  geçmesi. Bu, o koşum **anı** için geçerli. Prod'a salt-okuma erişimi 2026-09-14'te
  **verilmedi** (ısrar edilmedi, aşılmaya çalışılmadı).
- **REC-321'in "11 geçersiz ifade" sayısı düzeltildi:** yorumlar çıkarıldıktan sonra
  gerçek sayı **10** ve **beş** dosyada. Altıncısı
  (`202508261956_user_invoice_profiles.sql`) geçersiz SQL **taşımıyor** — içindeki
  `IF NOT EXISTS`'lerin hepsi geçerli `CREATE TABLE`/`CREATE INDEX` biçimi; tek
  `CREATE POLICY IF NOT EXISTS` geçişi bir **yorum** satırında. 11 sayısı o yorumu da
  saymıştı. O dosya ölü ama "geçersiz" değil, yalnız hiç uygulanmamış.
- **Bu cetvel tek bir vakadan yazıldı.** İkinci bir ölü dosya kümesi çıkarsa buradaki
  kural sınanmış olacak; bugün sınanmamış durumda.
