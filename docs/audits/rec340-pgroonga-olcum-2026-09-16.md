# REC-340 — pgroonga ölçümü (442 ürünün TAMAMI, gölge veritabanı)

**Tarih:** 2026-09-16 · **Şerit:** URUN · **Hüküm kaynağı:** A sınıfı (kendi ölçümüm)
**Ortam:** gölge veritabanı `arama_golge` — canlıdan kopyalanan **442 ürün, 31 kategori,
47 aile, 5 marka, 442 arama gövdesi satırı**. Şema canlıyla birebir (aynı migration zinciri).
**Migration:** `supabase/migrations/20260916132052_arama_pgroonga_tek_govde.sql`

> ⚠Bu belge bir **ölçümdür, canlı sonuç değildir.** Ölçümün yapıldığı an itibarıyla bu
> migration canlıya **inmemiştir.** (Bu uyarı, 2026-09-16'da simülasyon sonucunu canlı sonuç
> gibi sunmanın Recep'i canlıda hüsrana uğratmasından sonra zorunlu hâle geldi.)

---

## 1. Niçin bu iş açıldı

Recep canlıda aradı ve bulamadı. Üç itirazı vardı, üçü de ölçümle doğrulandı:

1. *"kelime bazında iyileştirme mi olur bu ne saçma bir şey. gerçek soruna gerçek çözüm"*
   → Vaka vaka yama yazılıyordu.
2. *"ben bu şekilde 2 aramalı bir arama motoru bilmiyorum"*
   → **Ölçüldü:** "jet fan" öneri kutusunda **0**, "detaylı ara"da **20** sonuç veriyordu.
   İki ayrı RPC, iki ayrı kod: `get_search_suggestions` kendi ILIKE sorgusunu koşturuyordu ve
   arama indeksini **hiç kullanmıyordu.**
3. *"hep ücretliden mi bahsediyorsun?"* (ikinci kez)
   → pgroonga Supabase'in kendi eklenti listesinde **hazır**, açık kaynak, Postgres'in içinde,
   ek sunucu yok. Ve REC-340 planında **yazılıydı** — "risk bütçesi" gerekçesiyle ertelenmişti.

---

## 2. ⛔Üç tuzak — pgroonga'yı kurmak TEK BAŞINA çözüm değildi

### 2.1 Tokenizer: varsayılan ayar Türkçe için yanlış

pgroonga'nın varsayılan tokenizer'ı (`TokenBigram`) alfabetik diziler için **kelime bazlı**
davranır. Türkçe sondan eklemeli olduğu için `"fanlar"` tek token olur ve `"fan"` araması onu
**bulamaz.**

| Ölçüm | Varsayılan tokenizer | `TokenBigramSplitSymbolAlphaDigit` | Sıralı tarama (doğru) |
|---|---|---|---|
| `jet` | 61 | 61 | 61 |
| `fan` | **132** | 361 | **361** |
| `jet` **ve** `fan` | **0** | **61** | **61** |

Doğru tokenizer ile üç sütun da birebir aynı.

### 2.2 Aynı indeks ikisini birden yapamıyor

Ek toleransı açıkken (`SplitSymbolAlphaDigit`) sözlük terimleri iki harflik parçalara bölünür ve
`fuzzy_search()` **anlamsızlaşır** — harf mesafesi bigram'lar üzerinde ölçülür:

| Sorgu | Ek toleranslı indekste `fuzzy_search` | Beklenen |
|---|---|---|
| `vortis` mesafe 2 | **442 / 442 (hepsi)** | 184 |
| `kazanim` mesafe 1 | 137 | 20 |

Bu yüzden **iki sütun, iki indeks** var: aynı metin, iki farklı tokenizer. Biri ek toleransı
için, öteki yalnız yazım hatası için.

### 2.3 ⚠pgroonga indeksi `LIKE` sorgularını da ele geçiriyor

pgroonga indeksi kurulan sütunda mevcut `LIKE '%...%'` sorguları **indeksten** cevaplanır.
Yanlış tokenizer ile **yanlış sonuç** verirler:

| Sorgu | Sıralı tarama | pgroonga indeksi (yanlış tokenizer) |
|---|---|---|
| `norm LIKE '%jet%' AND norm LIKE '%fan%'` | **61** | **0** |

Doğru tokenizer'la ikisi birebir aynı oldu. **Bu kalem kapıya yazılmalıdır:** pgroonga bir
sütuna kurulduğunda, o sütundaki her mevcut `LIKE` sorgusunun sonucu değişebilir.

---

## 3. Tasarım — dört basamaklı TEK gövde

Basamaklar **vaka bazlı değil, dil olgusu bazlıdır.** "vortis için istisna" gibi bir kol yoktur.

| # | Basamak | Hangi dil olgusu | Araç |
|---|---|---|---|
| 1 | kesin | ek çekimi (`fan` → `fanlar`) | pgroonga, ek toleranslı indeks |
| 21 | marka | marka adında yazım hatası | `brands` tablosundan türetilen sözlük + harf mesafesi |
| 22 | yazım | genel harf hatası | pgroonga `fuzzy_search` (aday) + `levenshtein` (doğrulama) |
| 23 | bitişik | `jetfan` → `jet fan` | kelimeyi ikiye bölme |
| 3 | esnek | kelimelerin tamamı değil, çoğu tutuyor | her kelime ayrı, `having count(*) >= eşik` |

**Aday üret + doğrula** deseni kritik: pgroonga hızlı ama gevşek aday verir, `levenshtein` kesin
süzer. Doğrulamada iki kural var ve ikisi de ölçümle kondu:

- **İlk üç harf şartı** — `vortis`→`vortice` ilk üç harfi tutar (meşru); `kasals`→`kanal`
  tutmaz. Bu şart olmadan "kasals" araması **224 alakasız kanal ürünü** getiriyordu.
- **Gövde kelimesini sorgu uzunluğuna kırpma** — Türkçe eki mesafeyi şişiriyor:
  `aspiratr` ↔ `aspiratorler` mesafe **4**, kırpınca **1**.

**Marka sözlüğü sabit liste değildir** — `brands` tablosundan türetilir, yeni marka eklenince
yazım hatası düzeltmesi kendiliğinden onu da kapsar.

---

## 4. Sonuçlar — resmî on vaka (INV-SEARCH-BEHAVIOR-1)

Her iki dışa açık uçtan ölçüldü. Öneri kutusu artık **aynı gövdeyi** kullanıyor.

| # | Sorgu | Ölçüt | Detaylı arama | Öneri kutusu | Sonuç |
|---|---|---|---|---|---|
| 1 | `havalandırma` | sıfır değil | 50 | 5 | ✅ |
| 2 | `havalandirma` | vaka 1 ile aynı | 50 | 5 | ✅ |
| 3 | `jet fan` | sıfır değil | 61 | 4 | ✅ |
| 4 | `fan jet` | vaka 3 ile aynı küme | 61 | 4 | ✅ |
| 5 | `vortis` | Vortice çıkmalı | **184** | 4 | ✅ |
| 6 | `ısı geri kazanım` | sıfır değil | 20 | 5 | ✅ |
| 7 | `VRT-17160` | **tam 1** (kesinlik regresyonu) | **1** | 1 | ✅ |
| 8 | `kanal tipi fan` | sıfır değil | 66 | 5 | ✅ |
| 9 | `duvar tipi aspiratör` | sıfır değil | 40 | 4 | ✅ |
| 10 | `ISI GERI KAZANIM` | vaka 6 ile aynı | 20 | 5 | ✅ |

**10/10.** On sorgu toplam **110 ms** (iki uçtan, yani 20 çağrı).

Vaka 5 ve 9 bu ölçümden önce **BİLİNEN KIRMIZI** listesindeydi; ikisi de düzeldi.

---

## 5. Sonuçlar — yazım hatası kümesi ve gürültü

`hedef_gerçek` = o markanın/kelimenin katalogdaki **gerçek** ürün sayısı (sıralı tarama).

| Sorgu | Hedef | Detaylı | Öneri | Gerçek | Değerlendirme |
|---|---|---|---|---|---|
| `nikotra` | Nicotra | **35** | 4 | **35** | ✅ birebir |
| `vortis` | Vortice | **184** | 4 | **184** | ✅ birebir |
| `avnes` | Avens | **106** | 4 | **106** | ✅ birebir |
| `jetfan` | jet (bitişik yazım) | **61** | 4 | **61** | ✅ birebir |
| `santrifuj` | santrifüj | **156** | 5 | **156** | ✅ birebir |
| `plug fen` | plug fan | **44** | 4 | **44** | ✅ birebir |
| `aspiratr` | aspiratör | 25 | 4 | 38 | ⚠kısmi, tamamı alakalı |
| `kanal tipi fann` | kanal tipi fan | 76 | 4 | 88 | ⚠kısmi, tamamı alakalı |
| `kasals` | Casals — **katalogda yok** | **0** | 0 | 0 | ✅ doğru boş |
| `fleksiva` | Flexiva — **katalogda yok** | **0** | 0 | 0 | ✅ doğru boş |
| `zzzqqq` | anlamsız | **0** | 0 | 0 | ✅ doğru boş |

**⭐GÜRÜLTÜ SIFIR:** hiçbir vakada hedeften **fazla** sonuç dönmedi. Katalogda olmayan marka
arandığında sistem uydurmuyor, boş dönüyor.

Kıyas için, bu işten önce denenen **trigram** yaklaşımı: eşikli hâli `nikotra`/`plug fen`/
`kanal tipi fann` vakalarını kaçırıyordu; eşiksiz hâli `"kanal tipi fann"` için *"12 kW
Elektrikli Isıtıcı"*, `"zzzqqq"` için **Vortice ürünleri** döndürüyordu. Teşhis: **trigram yazım
hatası için yanlış araçtır**, doğru ölçüt harf mesafesidir.

---

## 6. Migration ölçümleri

| Ne | Ölçüm |
|---|---|
| Ne | İlk sürüm (09-16) | ⭐Son sürüm (09-17) |
|---|---|---|
| Sütun ekleme | üretilmiş sütun (tablo yeniden yazımı) | NULL'a izin veren sütun + doldurma + tetik |
| İndeks | işlem içinde, yazmayı kilitler | `CONCURRENTLY`, işlem dışında |
| squawk (INV-MIGRATION-3) | **4 bulgu, kırmızı** | **0 bulgu** (yerelde 2.65.0 ile koşturuldu) |
| Sıfırdan koşum (442 ürün) | 694 ms | **755 ms** |
| Guard süresi | 44 ms | 66 ms |
| İkinci koşum | hatasız | hatasız, guard yine yeşil |
| `lock_timeout` / `statement_timeout` | 5 s / 30 s | 5 s / 30 s |

**Neden değişti (09-17):** Recep onay verdikten sonra merge öncesi kontrol edildi; migration
kontrolü kırmızıydı. Kural susturulmadı, yardım belgesinin yolu izlendi. Dosya üç adımdır:
(A) işlem: eklenti + sütun + tetik + doldurma · (B) işlem dışı: iki indeks `CONCURRENTLY`
(pgroonga destekliyor, gölgede `indisvalid = true` ölçüldü) · (C) işlem: fonksiyonlar + yetki +
guard. C'nin B'den sonra gelmesi bilinçli: yeni gövde yalnız indeks taramasında çalışan bir
sözdizimi kullanıyor; bu sırayla eski fonksiyonlar indeks bitene kadar hizmet verir, sitede arama
kesilmez. Guard ayrıca iki indeksin **geçerli** olduğunu ve doldurmanın **tam** olduğunu ölçer.

**`unaccent` eklentisi gereksiz çıktı** — `translate()` hem aksan körlüğünü hem Türkçe
küçültmeyi çözüyor. Bu ölçüm bir migration kalemini ve bir onay adımını tamamen düşürdü.

---

## 7. Güvenlik

Bu veritabanında `pg_default_acl` her yeni fonksiyona `EXECUTE to PUBLIC` veriyor. Daraltma
**açıkça yazılmazsa** anon kullanıcı PostgREST `/rpc` ile yardımcı fonksiyonları çağırabilir.
(2026-09-16'da tam olarak bu kaçırıldı ve bir güvenlik kusuru doğurdu; emsali depoda vardı.)

Bu migration sekiz yardımcı fonksiyondan `EXECUTE` yetkisini **açıkça geri alıyor** ve yalnız
iki dışa açık uca (`fts_search_products`, `get_search_suggestions`) veriyor.

---

## 8. Kapı (guard)

Migration'ın içindeki `DO` bloğu davranışı **koşum anında** ölçer ve sabit sayı kullanmaz
(K8.3). Kırmızı verdiği durumlar: "jet fan" sıfır · kelime sırası sonucu değiştirdi ·
"vortis" sıfır · SKU tam 1 değil · "zzzqqq" sonuç verdi · **öneri kutusu ile detaylı arama
ayrıştı**.

Son kol Recep'in ikinci itirazının doğrudan kapısıdır: iki uç bir daha ayrışırsa migration
kırmızı verir.

Boş veritabanında (gölge/kurulum koşumu) guard `NOTICE` ile **atlar**, kırmızı vermez.

---

## 9. Ne ölçülMEDİ — dürüst sınırlar

- **Canlı davranış.** Bu ölçüm gölgede yapıldı. Canlı sonuç migration indikten sonra ayrıca
  ölçülecektir.
- **Yük altında hız.** Tek kullanıcıyla ölçüldü; eşzamanlı yük ölçülmedi. 442 satırlık bir
  tabloda bunun sorun olması beklenmez ama **ölçülmemiştir.**
- **İndeks boyutu.** İki pgroonga indeksinin disk maliyeti ölçülmedi. Veritabanı bugün
  500 MB sınırının %9'unda olduğu için acil bir kalem değil.
- **`aspiratr` ve `kanal tipi fann`** vakalarında dönen sonuç gerçeğin altında (25/38 ve
  76/88). Dönen sonuçların tamamı alakalı, yani **yanlış sonuç yok, eksik sonuç var.**

---

## 10. Kaynaklar

- Supabase resmî pgroonga rehberi: https://supabase.com/docs/guides/database/extensions/pgroonga
  (kurulum yolu `create extension pgroonga with schema extensions`; **plan kısıtı yok**,
  ücretsiz planda kullanılabilir)
- `fuzzy_search` sözdizimi: PGroonga tartışma #320 — varsayılan operatörler (`&@`, `&@~`,
  `&@*`, `&^`) yazım hatasını **yakalamaz**, `fuzzy_search()` fonksiyonu şarttır (ölçüldü).
