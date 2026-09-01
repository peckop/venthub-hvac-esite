# REC-110 + REC-114 + REC-117 — "migration paketi" planı

**Şerit:** URUN · **Tarih:** 2026-09-01 · **Durum:** PLAN — uygulanmadı, merge edilmedi.

**KAYNAK/CETVEL (CLAUDE.md kural 1):**

- `CLAUDE.md` kural 11 (webhook/güvenlik), kural 12 (tenant-scoped), kural 13 (migration = prod)
- `docs/standards/quote-standard.md` — teklif akışının kendi semantiği (Q4: teklif LOGIN'li)
- `docs/standards/rendering-cache-standard.md` · `docs/standards/product-schema-standard.md`
- `docs/plans/rec108-aile-adi-dil-zinciri-2026-09-01.md` — **gömme deseni** buradan gelir
- ⭐**Cetvel boşluğu:** "anonim kullanıcı hangi yolla veri yazabilir" sorusunun cetveli YOK.
  Kapsam §6'da yazılıyor.
- **Tazelik:** bütün sayılar 2026-09-01'de ölçüldü.

---

## 0) ⭐BAŞLIK YANILTICI — paket bir DEĞİL, üç ayrı iş ve İKİSİ MIGRATION İSTEMİYOR

Emir "üç işi tek migration turunda planla" diye geldi. Ölçünce çıkan sonuç:

| İş | Sanılan | **Ölçülen** |
|---|---|---|
| REC-117 misafir teklifi | anon INSERT + RLS + GRANT migration'ı | **MIGRATION YOK** — Edge Function yolu |
| REC-114 arama önerisinde ham kategori adı | `p_lang` eklemek = imza değişikliği = drop+create | **MIGRATION YOK** — istemci çözümü |
| REC-110 varyant adı i18n | şema işi | **TEK EKLEMELİ MIGRATION** (`ADD COLUMN`) |

Yani onay turu tek kalıyor ama **onaylanacak şey bir tek `ALTER TABLE ... ADD COLUMN`**.
Bu, paketin risk profilini kökten değiştirir: geri alınamaz/yıkıcı bir işlem YOK.

---

## 1) REC-117 — misafir teklifi (MIGRATION YOK)

### Ölçüm

- `venthub_quotes.user_id` **ZATEN nullable**; `contact_name` / `contact_email` /
  `contact_phone` **ZATEN NOT NULL**. Yani tablo misafir teklifini **yapısal olarak
  hâlihazırda kaldırıyor** — kolon değişikliği gerekmiyor.
- Engel yetki katmanında: `venthub_quotes` ve `venthub_quote_items` üzerindeki **8
  politikanın 8'i de `{authenticated}`** rolüne yazılmış. INSERT politikası
  `user_id = (select auth.uid())` şartı koyuyor; anonimin uid'i yok, sağlayamaz.
- İstemci bugün doğrudan PostgREST ile yazıyor
  (`src/lib/services/quoteService.ts:79` → `.from('venthub_quotes').insert(...)`).
- ⭐**`supabase/functions/_shared/rate_limit.ts` ZATEN VAR** ve
  `apply-coupon` / `iyzico-payment` fonksiyonlarında kullanılıyor.

### İki seçenek

**A) RLS'i anonime aç** — `anon` rolü için INSERT politikası + `GRANT INSERT`.
**B) Edge Function** — anonim tabloya HİÇ dokunmaz; fonksiyon `service_role` ile yazar.

### ⭐B öneriliyor. Gerekçeler ölçülmüş:

1. **Hız sınırı RLS ile ifade EDİLEMEZ.** Anonime doğrudan INSERT vermek, kimliksiz ve
   sınırsız satır yazma yetkisi vermektir. Spam koruması REC-117'nin kendi şartı;
   politikayla yazılamaz, fonksiyonda yazılır — ve altyapı zaten mevcut.
2. ~~`tenant_id` NOT NULL ve anon JWT'de tenant iddiası yok.~~ ⭐**BU GEREKÇE ÇÜRÜTÜLDÜ
   (NOT-2) ve düzeltildi:** `venthub_quotes.tenant_id` ve `venthub_quote_items.tenant_id`
   kolonlarının **DEFAULT'u var** (`quotes_v1.sql:40` ve `:76`). Yani tenant'ın istemciden
   gelmesi zorunlu değildi; A seçeneği bu noktada benim iddia ettiğim kadar kötü değil.
   B'yi taşıyan gerçek gerekçeler **1, 3 ve 4**'tür. Yanlış gerekçeyi silmek yerine
   burada BIRAKIYORUM ki bir sonraki okuyucu "bu argüman denendi ve düştü" bilsin.
3. **`GRANT` unutulursa kusur SESSİZ ve teşhisi zor.** Politika var + GRANT yok = kimse
   ulaşamaz; iki katman da `42501` verir, ayırt eden tek şey mesaj metnidir. B bu tuzağı
   hiç doğurmaz çünkü anonime hiçbir tablo yetkisi verilmez.
4. **Yüzey daralır.** A, `venthub_quotes` ve `venthub_quote_items` tablolarını internete
   açar. B'de açık yüzey tek bir uç nokta ve girdi şeması sunucuda doğrulanır.

### Faz planı (B)

1. Yeni Edge Function `quote-request-public`: girdi doğrulama · hız sınırı (aşağıda) ·
   honeypot alanı · `_shared/cors` + `origins` · tenant sunucuda ·
   `status='requested'`, `user_id=NULL`, **`source` = gerçek giriş kapısı (`pdp`/`cart`)**.

   ⭐**KRİTİK-1 DÜZELTMESİ — `source='guest'` PLANDAN ÇIKARILDI.** İlk taslak misafirliği
   `source` alanına yazıyordu. Ölçüldü (hem kaynakta hem canlı şemada):
   `quotes_v1.sql:30` → `source text not null check (source in ('pdp','cart','project'))`
   ve canlı kısıt `venthub_quotes_source_check` aynısını söylüyor. Kısıtı genişleten
   migration YOK. Yani ilk misafir isteği **23514** ile ölürdü — ve `service_role` RLS'i
   bypass eder ama **CHECK kısıtını BYPASS EDEMEZ**; "migration gerekmez" iddiam bu haliyle
   YANLIŞTI.
   Doğrusu: **misafirlik `user_id IS NULL` ile ayırt edilir**; `source` anlamını korur
   ("istek hangi yüzeyden geldi"). İki dik ekseni tek alana bindirmişim.
   ⭐Bu düzeltme "migration gerekmez" iddiasını **kurtarır** — kısıt genişletme migration'ı
   gerekmez.
2. `quoteService.createQuoteRequest`: oturum varsa BUGÜNKÜ yol (değişmez), yoksa fonksiyon
   çağrısı. ⭐Oturumlu yol bilerek DEĞİŞMİYOR — çalışan bir akışı riske atmıyoruz.
3. `QuoteRequestModal`: misafir alanları (ad/e-posta/telefon zaten var) + KVKK onayı +
   kayıt teşviki (teklif sonrası "hesap açarsan tekliflerini takip edersin").
4. Kapı `INV-TEKLIF-MISAFIR-1`: ⭐**anonim rol için `venthub_quotes`/`venthub_quote_items`
   üzerinde politika VE grant OLMADIĞINI** doğrular (B'nin sözleşmesi budur; biri sessizce
   A'ya kayarsa kapı kırmızı verir) · fonksiyonun rate-limit çağırdığını AST ile ölçer ·
   oturumlu yolun hâlâ RLS üzerinden gittiğini doğrular.
5. Cetvel `quote-standard.md` §Q4 güncellenir: "teklif LOGIN'lidir" hükmü **değişti**;
   yeni hüküm ve gerekçesi yazılır (Recep kararı 2026-09-01).

**Sınır (gizlenmiyor):** Edge Function `service_role` kullanır, yani RLS'i BYPASS eder.
Bu, doğrulamanın tamamının fonksiyonda olması demektir; fonksiyondaki bir hata RLS
tarafından yakalanmaz. Bu yüzden §4 kapısı fonksiyonun doğrulama kollarını AST ile ölçer.
⭐Ve KRİTİK-1'in gösterdiği gibi: RLS bypass edilse de **CHECK kısıtları geçerlidir** —
şema kısıtları son savunma hattı olarak yerinde durur.

### ⭐YÜKSEK-1 — hız sınırı tek başına yetmez, ANAHTARI sahtelenebilir

Mevcut uçların IP anahtarı `x-real-ip || cf-connecting-ip || forwarded.split(',')[0]`
(`apply-coupon/index.ts:77`, `iyzico-payment/index.ts:98`). ⭐XFF'in **İLK** elemanı ve
`x-real-ip` **istemci tarafından enjekte edilebilir**. Oturumlu uçlarda bu ikincil bir
savunma; **kimliksiz uçta BİRİNCİL savunma olur ve döndürülebilir** — saldırgan her
istekte sahte IP + farklı e-posta ile sınırsız yazar.

Plana giren şartlar:

1. Anahtar, platformun **güvendiği** kaynaktan alınır (Supabase runtime'ın kendi başlığı
   ya da XFF'in **SON** platform-ekli elemanı) — istemcinin yazdığı ilk eleman DEĞİL.
2. ⭐**ANAHTARSIZ GLOBAL TAVAN**: dakikada N misafir teklifi (toplam). Anahtar
   döndürülebilir olduğu için per-key sınır tek başına yetmez; global tavan
   döndürmeye kapalıdır.
3. **Turnstile/CAPTCHA açık KARARA bağlanır** — "sonra bakarız" değil: ya bu turda
   eklenir ya "bilinçli kabul" satırıyla reddedilir. (Önerim: ilk turda global tavan +
   honeypot ile çık, Turnstile'ı ölçüme bağla — misafir teklifi hacmi görülünce karar
   verilsin.)
4. Kapıya **global-limit kolu**: fonksiyon global tavanı çağırmıyorsa KIRMIZI.

### ⭐ORTA-1 — tenant mekanizması AÇIKÇA yazılır

`_shared/tenant.ts` üç sınıf tanımlıyor. Misafir ucu `service_role` sınıfına düşerse ve
tenant **istek gövdesinden** okunursa, A'ya karşı kullandığım kural-12 argümanı B'de
hortlar. Meşru tek yol: `DEFAULT_TENANT_ID` ya da **origin→tenant haritası**.
⭐Kapıya kol: **fonksiyon tenant'ı istek gövdesinden OKUMAZ** (AST).

### ORTA-2 — e-posta doğrulaması (karar gerekiyor)

Doğrulama olmadan üçüncü şahıs adına teklif açılabilir; bildirim zinciri kurbanın
adresine gider. Seçenekler: (a) e-posta doğrulama adımı, (b) Turnstile, (c) **bilinçli
kabul** — "ilk turda kabul ediyoruz, hacim görülünce eklenecek". ⭐Hangisi seçilirse
seçilsin **kayda geçer**; sessiz geçilmez.

### ORTA-3 — iki tablolu yazım atomik değil

Bugünkü `quoteService.ts:104-110` teklifi ve kalemlerini **iki ayrı** insert ile yazıyor
ve kendi yorumu bu kusuru kabul ediyor (PostgREST'te tek transaction yok). ⭐Ama misafir
ucu `service_role` ile çalışacağı için **tek transaction'lı bir RPC mümkündür**. Karar:
misafir yolunda kalemler ve başlık **tek RPC** ile yazılır; yarım teklif kaydı doğmaz.
(Oturumlu yol bu turda DEĞİŞMEZ — çalışan akışı riske atmıyoruz; borç olarak kayda geçer.)

---

## 2) REC-114 — arama önerisinde ham kategori adı (MIGRATION YOK)

### Ölçüm

- `get_search_suggestions` öneri etiketini `c.name::text AS label` ile kuruyor — **ham
  Türkçe ad**; fonksiyonun `p_lang` parametresi **yok**.
- ⭐**Ama fonksiyonun KENDİ YORUMU yolu gösteriyor:** *"Kanonik slug EN'dir; görünen URL
  dile göre değişir. **RPC dili BİLMEZ, bu yüzden sözlüğü verir ve yerelleştirmeyi
  istemciye bırakır** (getLocalizedCategorySlug)."* Yani tasarım kararı zaten
  "RPC ham veri verir, istemci yerelleştirir".
- `metadata` jsonb'si kategori için `level` ve iki dilli `slug` taşıyor; `url` alanı
  kanonik EN slug'ı içeriyor (`'/category/' || c.slug`).
- `SearchOverlay.tsx` **zaten** `useCategories()` ile TÜM kategori listesine ve
  `getCategoryDisplayName`'e sahip (satır 31 ve 15). Popüler-kategori çipleri REC-103'te
  bu yolla düzeltilmiş; RPC'den gelen ÖNERİ etiketi (satır 247) atlanmış.

### Sonuç

Slug için yapılan şeyin aynısı ad için de yapılır: `s.type === 'category'` olduğunda
etiket ham `s.label` yerine, `url`/`metadata.slug` ile eşleşen kategori satırından
`getCategoryDisplayName(cat, t)` ile çözülür. **SQL'e dokunulmaz.**

Eşleşen satır bulunamazsa `s.label`'a düşülür — bugünkü davranış, yani regresyon yok.

Kapı: `INV-KATEGORI-ADI-1`'e yeni kol — arama önerisi dalında ham `s.label` render YASAK.

**⭐ORTA-5 — kapsam beyanı (eksikti, eklendi):** bu düzeltme **KATEGORİ** önerisinin
etiketini çözer. **ÜRÜN** önerisinin etiketi de ham TR'dir (`20260826220000:86` →
`p.name AS label`) ve bu turda **ÖYLE KALACAK** — çünkü ürün adı i18n'i REC-110'un işidir
ve `products.name_i18n` henüz yok. REC-110 indikten sonra `variantName` buraya da
bağlanabilir; o zamana kadar sınır açıkça beyan edilmiştir.

**Sınır:** bu, GÖSTERİMİ düzeltir; **arama EŞLEŞMESİ** (`c.name ILIKE ...`) tek dilde kalır.
İngilizce terim Türkçe kategori adıyla eşleşmez. O ayrı iştir ve migration ister
(REC-108 Faz 2 ile aynı sınıf); bu plan onu kapsamıyor.

---

## 3) REC-110 — varyant adı i18n (TEK EKLEMELİ MIGRATION)

### Ölçüm

- `products.name_i18n` **YOK** (`ERROR 42703`). Yani EN varyant adını koyacak yer yok.
- Kapsam: **375 aktif üründen 24'ü** Türkçe karakter taşıyor, **6 ailede** toplanmış:
  `avens-sulu-batarya` 8 · `avens-elektrikli-isiticilar` 6 · `danfoss-fc101` 5 ·
  `avens-isi-geri-kazanim` 3 · `danfoss-fc51` 1 · `vortice-...-roof` 1.
  Recep'in ekran görüntüsündeki *"12 KW ELEKTRİKLİ ISITICI"* bu kümede.
- ⭐**Yan bulgu (içerik, ayrı iş):** `danfoss-fc101` varyantlarında yazım hatası var —
  *"Frenkans Konvertörü"* → doğrusu *"Frekans"*. Ayrıca bu 24 adın çoğu **BÜYÜK HARFLE**
  girilmiş (*"SULU BATARYA 11 KW KANAL TİPİ..."*), yani veri girişi normalize edilmemiş.
  İkisi de dil işi değil, katalog içerik işi.

### Migration (tek ve EKLEMELİ)

```sql
alter table public.products add column if not exists name_i18n jsonb;
```

- **Eklemeli** (additive): var olan hiçbir kolona, kısıta, politikaya dokunmaz.
- `product_families.name_i18n` ile **birebir aynı desen** — 20260823120000 migration'ı
  emsal.
- Geri alma: `alter table public.products drop column if exists name_i18n;` (veri kaybı
  yalnız yeni yazılan çevirilerde; henüz içerik yazılmamışsa kayıp sıfır).

### ⭐Migration PR'ının ZORUNLU eşlikçisi: tip yeniden üretimi

`ALTER TABLE` tek başına yeterli değil. `src/types/database.types.ts` **üretilmiş** bir
dosyadır; kolon eklenip tipler yenilenmezse `name_i18n` TypeScript tarafında YOK'tur ve
okuma zincirini yazan kod derlenmez — ya da daha kötüsü, biri `as` ile geçmeye çalışır ve
kural 3'ü (`any`/cast yasağı) deler.

Sıra **bu** olacak:

1. Migration dosyası yazılır (`alter table ... add column ...`).
2. Merge → `supabase-migrate.yml` prod'a uygular (kural 13).
3. **`pnpm supabase:gen`** koşulur, `src/types/database.types.ts` yeniden üretilir ve
   ayrı bir PR ile iner.
4. Ancak ondan sonra okuma zinciri (gömme + `variantName`) yazılabilir.

⭐Alternatif — tek PR: migration + üretilmiş tipler AYNI PR'da. Bu daha az tur demek ama
tipleri **uygulanmamış** bir şemadan üretmek gerekir (yerel/gölge DB). Emsal yok, riskli.
**Öneri: yukarıdaki 4 adımlı sıra**; onay yüzeyi yine tek `ALTER` satırında kalır.

### Okuma zinciri — ⭐RPC DEĞİŞMEZ

`get_family_detail` varyantları `'name', p.name` ile döndürüyor. REC-108'de kurulan desen
burada da geçerli: **RPC'ye dokunma, dönen varyant `id` kümesi için `name_i18n`'i tek ek
sorguyla göm**, çözümü render anında yap. Tek giriş noktası:
`variantName(variant, lang)` — `familyName`'in kardeşi.

⭐Böylece migration YALNIZ `ADD COLUMN`'dan ibaret kalır; hiçbir fonksiyon yeniden
tanımlanmaz, hiçbir dönüş tipi değişmez, `drop` gerekmez.

### İçerik

24 ad için EN karşılık taslağı BENDEN → OPS → Recep onayı → ancak ondan sonra DB yazımı.
REC-109'daki akışın aynısı (o turda 40/40 EN aile adı bu yolla yazıldı).

---

## 3.5) ⭐YÜKSEK-3 — SIRA BİR TERCİH DEĞİL, ŞART

Zincir ölçüldü: kolon yokken `select id, name_i18n from products` → **42703/400** →
`getFamilyDetail` throw → **PDP DÜŞER**. Ters yön (migration önce, kod sonra) zararsızdır.
İlk taslak "en küçük migration PR'ı" diyordu ama **kodun migration'ı BEKLEMESİ şartını**
yazmıyordu — bu bir eksiklikti.

**ŞART:** `1. migration merge → (prod'a uygulanır) → 2. supabase:gen → 3. kod PR'ı.`
Kod PR'ı, migration inmeden merge EDİLEMEZ.

**Kapı `INV-VARYANT-ADI-SIRA-1`:** okuma zincirini yazan kod, `database.types.ts` içinde
`products.name_i18n` tipi YOKSA kırmızı verir — yani kod, şema+tip inmeden yeşile
dönemez. Sıra böylece niyete değil **mekanizmaya** bağlanır.

**Alternatif (reddedildi):** ara dönem için `fail-open` fallback (kolon yoksa `name_i18n`
seçme, sessizce ham ada düş). Reddedildi çünkü sessiz fallback tam da bugün beş kez
yakaladığımız sınıfı üretir: kusur çalışır görünür, kimse fark etmez. Sıra şartı açık
kırmızıdan geçer, sessiz sapmadan değil.

## 3.6) ⭐YÜKSEK-2 — bağımlılık SÖZLEŞMEYE bağlanır, olguya değil

Çürütme ölçümü sırasında `familyName.ts` ve REC-108 planı master'da DEĞİLDİ (#938 o an
inmemişti). **Yeniden ölçtüm: ikisi de artık master'da.** Yani bulgu ölçüm-anına aitti.

⭐Buna rağmen bağımlılık satırı yazılıyor, çünkü **sıra olguya değil sözleşmeye
bağlanmalı**: `variantName`, `familyName` deseninin (tek giriş noktası + servis TAŞIR /
render ÇÖZER) master'da bulunmasına bağımlıdır. Desen geri alınırsa bu plan da geçersizdir.
Bugün doğru olması, yarın da doğru olacağının garantisi değildir.

## 3.7) NOT maddeleri — işlendi

- **NOT-4 (kabul):** "RPC yeniden tanımlamak risklidir" kıyasım `get_family_detail` için
  **zayıftı** — o fonksiyonun imzası zaten `p_lang`'lı ve dönüşü `jsonb`, yani
  `create or replace` `drop` istemezdi. Kıyas `get_product_families_enriched` için
  (returns-table) geçerli, `get_family_detail` için değil. İstemci/gömme çözümü hâlâ
  savunulabilir ama **gerekçesi bu değil**; gerekçe "tek desen, tek giriş noktası".
- **NOT-5 (işlendi):** eşleşme **TAM kategori seti** üzerinden yapılacak.
  `CategoryContext`'in ürünlü-kategori filtresi varken öneri RPC'si yalnız `is_active`
  bakıyor; ürünsüz-aktif kategori eşleşmezdi. `categoriesSlugMap` (tam set) kullanılır.
- **NOT-3 (işlendi):** `SearchOverlay:218` klavye yolu `goToSuggestion(s, s.label||'')`
  ile ham TR'yi son-aramalara yazıyor; o yol da çözülmüş adı kullanacak.
- **NOT-1 / NOT-6 (işaretlendi):** politika sayısı (repo 9, benim "8" beyanım canlı
  ölçümdendi) ve 375/24/6 sayıları **canlı DB ölçümüdür**, repodan doğrulanamaz.
  Plana bu etiketle giriyorlar.

## 4) Onay turu — OPS'un şartına cevap

Emir "üç işin tek onay turu olsun" dedi. Plan bunu **fazlasıyla** sağlıyor:

- Recep'in onayına giden **tek geri-alınamaz kalem**: `products.name_i18n` ekleme.
- REC-114 ve REC-117 prod DB'ye **hiç dokunmuyor** → şerit kendi kapılarıyla indirebilir.
- Bu yüzden öneri: **migration'ı TEK BAŞINA, en küçük PR'da** indirmek; REC-114/117 kodu
  ayrı PR'larda. Migration'lı PR ne kadar küçükse, onay o kadar okunabilir olur ve
  "kural 13 otomatik uygulama" riski o kadar dar bir yüzeye iner.

## 5) Riskler

| Risk | Neden gerçek | Karşılık |
|---|---|---|
| Edge Function `service_role` RLS'i bypass eder | fonksiyondaki hata DB tarafından yakalanmaz | doğrulama kolları AST kapısıyla ölçülür (§1.4) |
| Misafir formu spam hedefi | herkese açık uç nokta | mevcut `_shared/rate_limit` + honeypot + origin kontrolü |
| Birileri sonradan "kolaylık olsun" diye anon INSERT politikası ekler | B'nin sözleşmesini sessizce A'ya çevirir | kapı **politikanın YOKLUĞUNU** ölçer |
| `ADD COLUMN` sonrası içerik yazılmazsa | EN varyant adı yine TR'ye düşer | kusur değil, sözleşme (REC-109'daki gibi); fallback iki yönlü kapıyla korunur |
| Arama eşleşmesi tek dilde kalır | C çözümünün dürüst sınırı | §2'de yazıldı, kapsam dışı |
| 24 adın çoğu BÜYÜK HARF ve bir yazım hatası var | çeviri işini içerik işiyle karıştırma riski | ayrı iş olarak işaretlendi (§3) |

## 6) Cetvel borcu (bu işin kapsamında)

`docs/standards/anonim-yazma-standard.md`: "anonim kullanıcı hangi yolla veri yazabilir"
sorusunun tek cevabı. Hüküm taslağı: **anonim, iş tablolarına DOĞRUDAN yazamaz; yazma
yalnız sunucu tarafı bir uç noktadan, hız sınırı ve girdi doğrulamasıyla yapılır.**
Bugün bu kural yazısız; REC-117 onu ilk kez sınayan iş.
