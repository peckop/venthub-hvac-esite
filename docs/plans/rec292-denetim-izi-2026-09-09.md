# Betikle yapılan doğrudan DB yazımlarının denetim izine düşmesi — PLAN

> **REC-292 · ALTYAPI · 2026-09-09**
> **Bu belge PLAN'dır. Migration YOK, kod YOK, prod yazımı YOK.**
> Uygulama, plan-challenger + OPS çürütmesi + **Recep merge onayı**ndan sonra ayrı emirle koşar
> (CLAUDE.md kural 13: migration içeren dal master'a merge edilince prod DB'ye OTOMATİK uygulanır).

**KAYNAK/CETVEL — bu planı hangi cetvel yönetiyor:**
⛔**YÖNETEN CETVEL YOK.** Denetim izi bütünlüğü (hangi yazım yüzeyi denetime düşmek zorundadır,
düşmezse ne olur, nasıl ölçülür) için yazılmış bir cetvel aradım ve bulamadım —
`docs/standards/` altındaki 79 dosyanın 10'u `admin_audit_log` adını anıyor ama hiçbiri yazım
yüzeyini kurala bağlamıyor; en yakını `admin-standard.md:234`, ve o da yalnız admin paneli için
bir kontrol listesi satırı ("eksik mutasyonlara ekle"). **Cetvelin yazımı bu işin kapsamındadır:**
`docs/standards/denetim-izi-standard.md` (şeride talep edildi, 2026-09-09).

**Kısmen yöneten mevcut cetveller:** `CLAUDE.md` kural 11 (admin işlemleri `admin_audit_log`) ·
kural 13 (migration = prod) · kural 12 (tenant-scoped) ·
`docs/standards/migration-safety-standard.md` §"her migration ATOMİK uygulanır" (INV-MIGRATION-1) ·
`docs/standards/db-grant-hygiene-standard.md` §3.1 (politika okuyan role yazılmamış olabilir).

**Ölçüm tazeliği:** repo ölçümleri 2026-09-09, `origin/master` = `b416ae39b`. Prod DB'nin canlı
durumu **ÖLÇÜLMEDİ** — §6'da açık ölçüm kalemi olarak duruyor, hatırlanan sayı yok.

---

## 1. Arıza, tek cümleyle

Betikler prod veriyi service_role ile doğrudan değiştiriyor ve bu yazımların **hiçbiri**
denetim izine düşmüyor; yani veri değişti, kim/ne/ne zaman sorusunun cevabı YOK.

KATALOG'un ölçümü (2026-09-08): 7 kategori silme + 18 ürün taşıma + 104 görsel; `admin_audit_log`
tarafında `categories` satırı **0**. Bu sayıyı prod okumadan doğrulayamam ve doğrulamadım — ama
**aynı sonucu koddan, daha güçlü biçimde ölçtüm** (§2.1): satır sayımı bir gözlem, kodun yapısı
bir kesinliktir.

## 2. Ölçüm — evren dahil

### 2.1 Yazan betikler ve denetim yazımı

`scripts/**` altında `.insert|.update|.upsert|.delete` çağıran **14 dosya** var. Bunların
**0'ı** denetim satırı yazıyor. `logAdminAction`/`admin_audit_log` adını anan 3 dosya
(`db/audit_checks.js`, `db/migrations/update_schema_master.{py,md}`) **içeriğe bakıldığında**
yalnızca tablo adı listesi tutuyor — yazım değil. (Adı ölçüt saymadım, içeriği okudum.)

Karşılaştırma: `logAdminAction` uygulama tarafında 25 yerden çağrılıyor
(`src/lib/admin/mutateWithAudit.ts` sarmalayıcısı üzerinden). Yani denetim izi **admin panelinde
var, panel dışında yok** — kural 11 tam bu boşlukta yaşıyor.

### 2.2 Tablo evreni — emir 4 sayıyor, ölçüm 6 gösteriyor

| tablo | yazan betik (örnek) | emirde var mı |
|---|---|---|
| `categories` | `restore_categories.ts` upsert · `run_category_migration.ts` delete · `satis-kipine-gec.mjs` update | ✓ |
| `products` | `kademe2-load/load.mjs` insert · `tier-c-temizlik.mjs` update · `extract_brands.py` update | ✓ |
| `product_families` | `load.mjs` insert · `tier-c-temizlik.mjs` update | ✓ |
| `product_images` | `upload-pilot-images.mjs` insert + **delete** | ✓ |
| **`brands`** | `load.mjs` insert | ⛔**YOK** |
| **`site_settings`** | `satis-kipine-gec.mjs` insert + update | ⛔**YOK** |

⚠**`site_settings` ticari olarak en hassas olan.** `scripts/kip/satis-kipine-gec.mjs` satış kipi
anahtarını (REC-168) oradan çeviriyor; o anahtar vitrinde fiyatın görünüp görünmeyeceğini
belirliyor. Fiyatın açılıp kapanması denetim izi olmadan yapılabiliyor. Bu betik **benim
şeridimde** (`scripts/kip/**`) — yani boşluğu kendi kalemimde de buldum.

### 2.3 Yazma yüzeyi tek dil değil — disiplin katmanının kapatamayacağı yer

| yüzey | kanıt | grep'lenebilir mi |
|---|---|---|
| JS/TS `.from('x').update()` | 14 dosya | evet |
| **Python `.table('x').update()`** | `scripts/tools/extract_brands.py:167` | evet, ama **farklı API adı** |
| **Ham `.sql` dosyası** | `scripts/db/fixes/*.sql` (5 dosya DML içeriyor) | evet |
| **Ham `fetch` + PostgREST** | `icerik-hatti/kayip-urun-aktar.mjs:136` POST · `kayip-urun-aile-bagla.mjs:144,155` POST+PATCH | evet, ama **hiçbir SDK deseni tutmaz** |
| **Dinamik tablo adı** | `katalog-geri-yukle.mjs:44` — yedi tabloyu `rest/v1/${t}` döngüsüyle gezer | ⛔**HAYIR — literal ad grep'i göremez** |
| **Keyfi SQL (`rpc/exec`)** | `apply-stock-fix.mjs:46,68` · `db/migrations/apply-sql-via-rpc.mjs:47` · `run-migration.ts:38` | evet ama **içeriği dosyadan gelen ham SQL** |
| **MCP `execute_sql`** | ajanın elindeki araç | ⛔**HAYIR — dosya değil** |
| `psql` / Supabase SQL editörü | insan eli | ⛔**HAYIR** |

Uzantı dağılımı: `mjs` 56 · `py` 44 · `cjs` 24 · `js` 15 · `sql` 14 · `ps1` 4 · `sh` 3.

⛔**Kendi ölçüm hatam, kayda geçsin:** ilk taramamda yalnız `--include=*.mjs,*.cjs,*.ts`
kullandım ve `.js`'i atladım; `scripts/db/migrations/apply-metadata-update.js` (categories
update) evrenin dışında kaldı. Çok satıra yayılan zincirleri de ilk grep'im görmedi. Bu, bugün
**beşinci** "ölçüt keskin, evren yanlış" vakası. Düzeltme: çok satırlı desen + uzantı envanteri
+ `.table()` API varyantı.

**Sonuç:** disiplin katmanı (yazım öncesi döküm, betiğe eklenen çağrı) bu evreni kapatamaz —
çünkü evrenin iki üyesi hiç dosya değil. Disiplin, kapsadığı yerde iyidir; **kapı olamaz.**

⛔**ALTINCI VAKA — bu tabloyu çürütme genişletti.** İlk hâlinde "6 yüzey" yazmıştım; bağımsız
denetçi **ham `fetch` + PostgREST** sınıfını buldu, ben de örneklerken **yedinci dosyayı**
(`apply-stock-fix.mjs`) ekledim. Bu sınıf Supabase SDK'sını hiç kullanmadığı için ne `.from(`,
ne `.insert(`, ne `.table(` deseniyle görünür. Yani §2.3'ün ilk hâli **kendi düzeltmesinden
sonra bile eksikti**.
⭐**KAPI TASARIMINA ETKİSİ — asıl ders:** kapı **tablo adı** üzerinden kurulamaz, çünkü
`katalog-geri-yukle.mjs` tabloyu değişkenden alıyor (`rest/v1/${t}`) ve literal-ad grep'i onu
asla göremez. Kapı **yazma fiili** üzerinden kurulacak.

### 2.4 Ev geleneği VAR — ve iki ölçülmüş kusuru var

`supabase/migrations/20260826213000_enforce_role_change_actor_guard.sql` service_role ile yapılan
rol yazımını denetime düşürüyor; yani "tetikle denetim" bu depoda **zaten kabul edilmiş bir
desen**. Şablonu ondan alacağım. Ama migration'ın **kendi yorumu** iki kusuru adıyla yazıyor:

1. **Fail-open, tasarım gereği** (satır 88-89): `exception when others then raise warning` —
   denetim yazımı patlarsa göç DEVAM ediyor. Gerekçesi yazılı ve savunulabilir ("alarm,
   korumaya çalıştığı şeyi bozarsa net zarar üretir"). Ama sonucu şu: **denetim sessizce
   kaybolabilir ve hiçbir şey kırmızı olmaz.**
2. **Kırılganlık, adıyla ilan edilmiş** (satır 66-72): `admin_audit_log`'a FORCE ROW LEVEL
   SECURITY verilirse INSERT reddedilir, exception guard'ı da hatayı WARNING'e indirir, yani
   **alarm sessizce ölür**. Ve o yorum kalıcı çözümün yerini de söylüyor: *"Kalıcı çözüm bu
   migration'da değil, **bekçi kaleminde**."*

⛔**DÜZELTME (çürütme sonrası, ölçümle):** yukarıda "o kalem benim şeridim" yazmıştım — **YANLIŞ.**
Devir metninin devamını okumamıştım. Aynı migration satır 130-131 şunu diyor: *"Doğru bekçi metin
taraması DEĞİL canlı DB'ye bakan kontrol betiğidir; o yüzey **EDGE'in claim'inde.** Ayrı kalem."*
Yani borç iki yarım:
- **Migration yarısı BENİM ve bu işte kapanabilir:** definer yolunu adıyla kapsayan bir INSERT
  politikası. `admin_audit_log`'daki iki politika `TO authenticated` (satır 685-690), yani
  `postgres` için politika YOK — FORCE RLS verilirse definer de reddedilir. Tek satırlık kapanış.
- **Bekçi yarısı BENİM DEĞİL:** canlı DB'ye bakan kontrol betiği EDGE şeridinde. Üstlenmeyeceğim;
  ayrı kalem olarak OPS'a bildirilecek.

⚠Bu, kendi kalemimi başkasının şeridine taşımaya bir adım kalmışken yakalanan bir hataydı.
Sebep tanıdık: **devredilen borcu okurken devrin ikinci yarısını atladım** — evreni yine eksik
aldım (bugün altıncı vaka).

### 2.5 FORCE RLS bugün verilmemiş

`grep -ri "force row level security"` → tüm depoda **tek eşleşme**, ve o da yukarıdaki yorumun
kendisi. Yani depo hiçbir tabloya FORCE vermemiş; SECURITY DEFINER/owner=postgres tetiği
sahip-RLS-atlaması ile INSERT edebiliyor. ⚠Bu bir **repo** ölçümü — prod'un canlı durumu ayrı
soru ve §6'da açık.

## 3. Hüküm — hangi katman

**DML tetiği doğru katman.** Gerekçe ölçümden: yazma yüzeyi çok dilli, çok API'li ve bir kısmı
dosya değil; satır-düzeyi DML'in hepsinde tetik ateşlenir. Disiplin katmanı (yazım öncesi döküm)
KATALOG'un cetveline gitti ve benim işim değil — ama zaten kapı olamaz, olsa olsa kapının
üstünde bir görgü kuralıdır.

⛔**DÜZELTME: "hepsinin ALTINDA durur" dedim — FAZLA İDDİA.** Tetiğin atlanabildiği yollar var
ve ikisi bugün gerçekten erişilebilir:

| atlama yolu | erişilebilir mi | tetik görür mü |
|---|---|---|
| **TRUNCATE** | ⚠**EVET** — `db-grant-hygiene-standard.md` §2 ölçümü: `service_role` yetkisi `arwdDxtm` (sekiz yetkinin tamamı, TRUNCATE dahil). Depoda tek `REVOKE TRUNCATE` var ve o `contact_messages` için | ⛔HAYIR — satır tetiği TRUNCATE'te ateşlenmez, RLS de uygulanmaz |
| **Keyfi SQL (`rpc/exec`)** | ⚠prod'da fonksiyonun VARLIĞI ölçülmedi (repoda tanımı yok, migration dışı kurulmuş). Varsa service_role anahtarıyla `DROP TRIGGER` bile mümkün | ⛔tetik **kaldırılabilir bir nesneye** dönüşür |
| `ALTER TABLE … DISABLE TRIGGER` · `session_replication_role='replica'` | service_role ile HAYIR; ama Supabase SQL editörü ve MCP `execute_sql` **sahip (`postgres`) rolüyle** koşar | ⛔HAYIR |

⭐**Bu, §2.3'ün en can alıcı sonucunu tersine çeviriyor:** oradaki "dosya değil, grep'lenemez"
diye işaretlediğim iki yüzeyi (SQL editörü, MCP `execute_sql`) *"disiplinin kapatamadığı ama
tetiğin kapattığı"* diye sınıflamıştım. Gerçekte onlar **tetiğin de kapatamadığı** yüzeyler —
üstelik tetiği devre dışı bırakabilen yüzeyler. Hüküm ayakta kalıyor (tetik hâlâ en alt
ulaşılabilir katman), ama **"her şeyin altında" değil**: sahip rolü tetiğin de altındadır.
Bunun karşılığı kapı değil kural olur: sahip rolüyle yazım Recep kapısıdır.

**Eklenecek kalem:** `AFTER TRUNCATE … FOR EACH STATEMENT` tetiği — TRUNCATE kör noktasını
kapatır ve planın ilk hâlinde hiç yoktu.

**Kapsam: 6 tablo**, emirdeki 4 değil. `brands` ve `site_settings` ölçümle eklendi; `site_settings`
ticari yüzeyi doğrudan etkilediği için düşmesi kabul edilemez.

⭐**ÖNCELİK SIRASI (OPS onayı, 2026-09-09):** kapsam genişlemesi kabul edildi ve `site_settings`
**en ağır kalem** olarak işaretlendi. Uygulama tek migration'da altı tabloyu birlikte kurar
(INV-MIGRATION-1 atomiklik); ama bir sebeple kapsam daraltılmak zorunda kalırsa **düşecek son
tablo `site_settings`'tir** — çünkü diğer beşi katalog verisi, o ise fiyatın vitrinde görünüp
görünmeyeceğini belirleyen ticari anahtardır.

### 2.6 ⛔KRİTİK — ev şablonu `site_settings` için ÇALIŞMA ANINDA PATLAR, ve fail-open bunu SONSUZA GİZLER

Çürütmenin bulduğu ve **ölçerek doğruladığım** en ağır kalem. Üç ölçüm:

1. `admin_audit_log.tenant_id` **NOT NULL** ve **sabit bir varsayılana** bağlı
   (`20260530220000_tenant_schema_setup.sql:164`).
2. `site_settings` tablosunda **`tenant_id` YOK** — tüm `supabase/migrations` içinde
   `site_settings` ile `tenant` aynı satırda hiç geçmiyor.
3. Ev şablonu denetim satırını yazarken **`new.tenant_id`** okuyor
   (`20260826213000_…sql:86`).

**Zincirin sonucu:** `site_settings` tetiğinde `new.tenant_id` PL/pgSQL'de **çalışma anında**
`record "new" has no field "tenant_id"` fırlatır — ve plpgsql geç bağladığı için
`CREATE FUNCTION` anında **yakalanmaz**. §4.2'nin fail-open bloğu (`exception when others`) bu
hatayı WARNING'e indirir. Yani:

> **`site_settings` tetiği kurulur, yeşil görünür, ve hiçbir zaman tek satır bile yazmaz.**

⛔Planın **en hassas gördüğü tablo, planın kendi tasarımıyla kapısız kalır** — ve üstü yeşil
kapıyla örtülür. Tam olarak dün "yeşil kapı göründüğünü kanıtlamaz" dersini aldığım arıza sınıfı,
bu kez kendi planımın içinde.

⚠**"Tenant'sız kalır" dediğim senaryo da yanlıştı:** kolon NOT NULL + sabit varsayılan olduğu
için sonuç NULL değil, **yanlış tenant damgası**. Boşluk yerine doğru görünen yanlış kayıt üretir;
denetim izinde bu daha kötüdür.

**Karara bağlanacak (uygulamadan önce ZORUNLU):** (a) `site_settings`'e `tenant_id` eklemek
(⚠F3 guard'ı "tenant_id'li tablo sayısı = 6" diye sabitliyor, o kapıyı kırar), (b) tetik
gövdesinde tenant'ı `TG_TABLE_NAME`'e göre koşullu türetmek, (c) `site_settings` için ayrı ve
tenant'sız tetik. **Hangisi olursa "boş kalır" seçeneği YOK.**

## 4. Tasarım kararları — ve her birinin bedeli

### 4.1 actor: NULL olacak ve bu GİZLENMEYECEK

service_role bağlamında `auth.uid()` NULL döner. Tetik "kim" sorusunu **cevaplayamaz** ve
cevaplıyormuş gibi yapmayacak. Garanti ettiği: **ne değişti, ne zaman, hangi satır, eski/yeni
değer.** "Kim" en iyi çaba: `comment` alanına `session_user` + `application_name` yazılır
(betikler `application_name` verirse okunur; vermezse boş kalır ve boş olduğu görünür).

⚠Alan adı taahhüt eder: `actor` kolonu NULL ise rapor "bilinmiyor" demeli, "sistem" DEMEMELİ.

⛔**DÜZELTME — "cevaplanamaz" FAZLA TESLİMİYET.** Dürüstlük kısmı doğru ve duruyor (NULL'a
"sistem" yazmayacağım). Ama **hüküm yanlıştı**: service_role bir *anahtar* değil bir *JWT*'dir;
aynı sırla `role: service_role` + gerçek `sub`/özel claim taşıyan jeton üretilebilir ve
`auth.uid()` o zaman **gerçek kimlik döner**. Depoda zemin hazır: `jwt_tenant_id()` ve
`is_admin_user()` hâlihazırda `auth.jwt()` claim'lerini okuyor, `custom_access_token_hook`
kurulu. İkinci yol: betiklere **ayrı DB rolü** vermek → `session_user` "en iyi çaba" değil
**belirleyici** aktör olur.

⭐**Doğru ifade:** "actor bugün cevaplanamıyor; cevaplanabilir hale getirmenin yolu özel claim'li
jeton ya da ayrı rol, maliyeti şu" — ve bu **ayrı bir kalem** olur. Çözülebilir bir eksikliği
doğa yasası gibi kaydetmek, onu kalıcı yapardı. REC-292'nin kapsamında değil, ama planda
**çözülebilir** olarak duruyor.

### 4.5 ⛔ÇİFT-LOG — planın ilk hâlinde hiç yoktu

İki yönlü bulgu, ikisi de ölçülü:

1. **"Denetim panelde var" öncülüm fazla iyimserdi.** Panelin kendisinde de yazımlar
   `mutateWithAudit` sarmalayıcısını atlayıp ham istemciyle koşuyor
   (`views/admin/CategoriesTableBody.tsx`, `views/admin/ProductsTableBody.tsx`,
   `components/admin/products/ProductCsvImport.tsx:166` `upsert`). ⭐Bu, tetik hükmünü
   **güçlendirir**: tetik panelin bu boşluğunu da kapatır — ilk hâlinde kendime yazmadığım bir
   kazanç.
2. **Ama tersi de var:** `mutateWithAudit`'in gerçekten çalıştığı yollarda tetik eklenince
   **her mutasyon iki denetim satırı** üretir. Deponun bu sorunu çözmüş bir deseni bile var:
   `auditedByEdge` bayrağı ("Edge kendi audit'ini yazıyorsa `logAdminAction`'ı ATLA").

**Karara bağlanacak (uygulamadan önce):** ya altı tablo için uygulama katmanı audit'i kapatılır,
ya iki kaynak `action`/`comment` ile ayrıştırılır. Kararsız bırakılırsa denetim tablosu okunamaz
hale gelir ve §5'in ayrım çifti kanıtı bile bulanır.

### 4.2 Fail-open mu fail-closed mu — **plan-challenger'a ASIL SORU**

| seçenek | bedeli |
|---|---|
| **fail-open + sessiz** (mevcut ev geleneği) | 104 görsel yükleyen betik kırılmaz; ama denetim kaybı görünmez. Bugün tam bu yüzden buradayız. |
| **fail-closed** (denetim yazılamazsa yazım geri alınır) | Kanıtsız yazım imkânsız olur; ama `kademe2-load` gibi 1000+ satır yükleyen bir akış denetim tablosundaki tek bir aksaklıkta tamamen durur. Veri göçünü denetim tablosuna rehin verir. |
| ⭐**fail-open + GÖRÜNÜR** (önerim) | Yazım devam eder, ama başarısız denetim yazımı **sayılır ve ölçülebilir bir ize düşer** (WARNING değil — WARNING kimsenin bakmadığı yerdir). Bedeli: ikinci bir küçük tablo/sayaç ve onu okuyan bir kapı. |

⛔**HÜKÜM ÇÜRÜTÜLDÜ — DEĞİŞTİRİYORUM.** İlk hâlinde "üçüncüsü" demiş ve REC-280'e yaslanmıştım.
Çürütme iki ayrı hata gösterdi ve ikisini de kabul ediyorum:

**Hata 1 — ispat yükünü ters çevirmişim.** Tabloda fail-open'ı "mevcut ev geleneği", yani bedava
varsayılan gibi sundum. Kod tersini söylüyor: tetik ile veri yazımı **aynı transaction**'dadır.
`exception when others` bloğunu **yazmazsan** denetim insert'i patladığında transaction düşer ve
veri yazımı da geri alınır. Yani **fail-closed, Postgres'in atomikliğinden bedava gelen
varsayılandır; fail-open'ı elde etmek için fazladan üç satır yazmak gerekir.** İspat yükü
fail-closed'ın değil, **fail-open'ın** üzerindedir — ve ilk hâlimde o yükü hiç taşımamıştım.

**Hata 2 — REC-280 analojisi geçersiz.** Orada kaybedilen şey *bir uyarıydı* ve telafisi bir
sonraki koşumdu. Burada kaybedilen şey **kanıtın kendisi** ve telafisi YOK — kendi §8'im
"geçmişe dönük denetim satırı üretilmeyecek" diyor. İki farklı arıza sınıfını tek kalıba soktum;
bu "tutarlılık" değil, [tek vaka açıklaması kural değildir] dersinin ihlali.

⭐**YENİ HÜKÜM — karar GLOBAL DEĞİL, TABLO SINIFINA GÖRE:**

| sınıf | tablolar | karar | gerekçe |
|---|---|---|---|
| **düşük hacim / yüksek değer** | `site_settings` (+ kapsama alınırsa `product_prices`) | ⭐**fail-CLOSED** — exception bloğu YAZILMAZ | Yazım tek satırlık ve geri alınabilir; maliyeti "betiği tekrar koş". Karşılığında fiyat görünürlüğü kayıtsız değiştirilemez. |
| **kütle katalog** | `products`, `categories`, `product_families`, `product_images`, `brands` | fail-open + **GÖRÜNÜR** | 1000+ satırlık göçü denetim tablosuna rehin vermek gerçek zarar üretir. |

Somut senaryo (uydurma değil, mevcut betik): `scripts/kip/satis-kipine-gec.mjs` satış kipini
açar → vitrinde fiyat görünür. Denetim satırı yazılamazsa fiyatlar canlıya açılır ve **kimin ne
zaman açtığının kaydı olmaz.** Burada fail-open'dan kazanılan hiçbir şey yok.

⛔**"Görünür" kanalı da değiştiriyorum.** İlk hâlinde "ikinci bir küçük tablo/sayaç" demiştim.
Çürütme haklı: denetim insert'ini düşüren nedenlerin çoğu (RLS, FORCE, ACL, sahiplik) **aynı
şemadaki ikinci tabloyu da düşürür** — yani alarm arızayla korelasyonlu olur, kendi kendini ölçen
bir alarm. Yerine: `RAISE WARNING` (zaten var) + **DB'ye hiç bağımlı olmayan** günlük tarafında
izleyici. WARNING gerçekten **sessiz değil** — Supabase günlüğünde sorgulanabilir; eksik olan
bakan gözdür. Yani sorun "görünmezlik" değil "**izlenmemesi**"; çözüm de ona göre.

### 4.3 Hacim — before/after ne kadar tutulacak

`kademe2-load` tek koşuda 1000+ satır yazabiliyor; tetik satır başına 1 denetim satırı üretir.
Tam satırı JSONB olarak iki kez (before+after) tutmak tabloyu şişirir. Ölçülecek ve karara
bağlanacak: tam satır mı, yoksa **değişen kolonlar** mı. Karar §6 ölçümüne bağlı, şimdi
uydurmuyorum.

⛔**DÜZELTME — YANLIŞ EVRENİ ÖLÇMÜŞÜM (bugün yedinci vaka).** Hacim tavanını `kademe2-load`'a
bağladım; o **tek seferlik göç**. Asıl kaynak sürekli olan: `products` tablosuna **her siparişte**
yazan DB fonksiyonları var (stok düşürme/geri yükleme, envanter hareketleri, rezervasyon serbest
bırakma — `20250902_create_stock_rpc_functions.sql`, `20250918_inventory_batch_undo.sql`), üstelik
`expired-reservations`/`order-housekeeping`/`stock-alert` cron'ları sürekli koşuyor. Göç bir
kereliktir, **sipariş trafiği süreklidir.**

İki sonucu var:
1. §6.5'teki şişme tahmini yanlış tabana oturuyordu.
2. ⭐Daha önemlisi **sinyal/gürültü**: "kim fiyatı değiştirdi" sorusunun cevabı otomatik stok
   düşümlerinin arasında kaybolur. Ev geleneği bu tehlikeyi adıyla yazmış: *"okunmayan alarm
   alarm değildir."* Bu dersi `site_settings` için devralmışım ama `products.stock_qty` için hiç
   düşünmemiştim.

**Karara bağlanacak:** `products` için tetik hangi kolonlarda ateşlenecek. Otomatik stok
hareketlerini denetim izinden dışlamak (ya da ayrı `action` ile etiketlemek) gerekiyor; aksi
halde tabloyu kendi gürültüsüyle boğarız. Ayrıca no-op UPDATE eleme deseni
(`is not distinct from`, ev geleneği satır 36-38) şablona **yazılı** girecek — `ON CONFLICT DO
UPDATE` satır değişmese de tetiği ateşler.

### 4.4 tenant_id — kural 12

`admin_audit_log.tenant_id` var ve ev geleneği onu `new.tenant_id`'den alıyor. Altı tablonun
hepsinde `tenant_id` var mı, ölçülecek (§6). Yoksa o tablo için denetim satırı tenant'sız kalır
ve bu **kural 12 ihlali** olur — o durumda çözüm ayrı, plan buna göre daralır.

## 5. Bitti ölçütü

1. Altı tablonun her biri için INSERT/UPDATE/DELETE → `admin_audit_log` satırı; **ayrım çifti**
   ile kanıtlanır (tetik varken satır DÜŞER, tetik kaldırılınca DÜŞMEZ) — "satır var" tek başına
   kanıt değil.
   ⛔**DÜZELTME: ayrım çifti ALTI TABLONUN HER BİRİ İÇİN AYRI AYRI gösterilir, `site_settings`
   DAHİL.** İlk hâliyle bu ölçüt §2.6'daki kritik arızayı **geçiriyordu**: `site_settings` tetiği
   kurulur, ayrım çifti diğer beş tabloda kanıtlanır, kapı yeşil olurdu. Bir bitti ölçütünün
   kendi planındaki kritik arızayı geçirmesi, ölçütün değil evrenin hatasıdır — bugün sekizinci
   kez aynı sınıf.
2. Denetim yazımı başarısız olduğunda **görünür**: sessiz kalmadığı ölçümle gösterilir.
3. `enforce_role_change_actor_guard`'ın 08-26'da bekçi kalemine devrettiği FORCE-RLS
   kırılganlığı kapanmış olur (§2.4/2) — veya kapanmadıysa **niçin** kapanmadığı yazılı olur.
4. Konformans kapısı: yeni yazma yüzeyi eklenip tetiği eklenmezse KIRMIZI. Evren = `scripts/**`
   değil, **ölçülen 6 yüzey** (§2.3); `.js`/`.py`/`.sql` dahil, çok satırlı desen dahil.
5. `docs/standards/denetim-izi-standard.md` yazılmış olur (bu iş cetvelsiz başladı).
6. TÜM konformans paketi yeşil — el seçimi alt küme DEĞİL. (Bugün bir CI kırmızısı tam bu
   yüzden oldu.)

## 6. Uygulamadan ÖNCE ölçülecek — şimdi bilmiyorum, uydurmuyorum

1. Prod'da `admin_audit_log` FORCE ROW LEVEL SECURITY durumu (repo vermemiş; canlı ayrı soru).
2. Altı tablonun `tenant_id` kolonu var mı, NOT NULL mu.
3. Altı tabloda hâlihazırda kaç tetik var (çakışma ve sıra riski).
4. `kademe2-load` tipik koşusunun satır sayısı → §4.3 kararı buna bağlı.
5. `admin_audit_log`'un bugünkü satır sayısı ve büyüme hızı (tablo şişme tavanı).

⭐**GELEN CANLI KANIT (OPS ayarladı, 2026-09-09):** KATALOG bugün sensör kategorisi yazımını
yapacak ve **yazımdan sonra** `admin_audit_log`'da bugünün tarihiyle
`categories`/`products`/`product_families` satır sayısını ölçüp belgeye yazacak. Beklenen **0**.
Bu, arızanın **sahne kanıtı** olur: repo ölçümüm (§2.1) yapıyı gösteriyor, bu ölçüm ise aynı
arızayı canlı bir yazımda gösterir. ⚠Sayı 0 ÇIKMAZSA planın öncülü yanlıştır ve plan buna göre
yeniden yazılır — beklediğim sonucu ölçümden önce doğru saymıyorum.
Ayrıca KATALOG yazımı MCP `execute_sql` ile yaparsa bunu döküme yazacak: §2.3'teki
"dosya olmayan yazma yüzeyi" iddiasının ilk kayıtlı örneği olur.

⛔**GÜNCELLEME (aynı gün, saatler sonra): BU KANIT GELMEYEBİLİR.** KATALOG sensör yazımını
**yapmadı** ve sebebini yazdı: canlı prod yazımı + yapısal karar, Recep'in kendi sözünü ister;
akran aktarımı onay değildir. **Bu davranış doğrudur** ve benim kendi sınırımla aynıdır (§8).
Sonuç: planın canlı sahne kanıtı **Recep'in kendi kararına bağlı** ve gelmeyebilir.
⭐**Plan buna dayanmıyor:** öncül §2.1'in kod-yapısal ölçümüyle zaten ayakta (14 yazan dosyanın
0'ı denetim yazıyor). Canlı ölçüm gelirse **güçlendirir**, gelmezse plan **eksilmez**. Bir planı,
gelmesi başkasının kararına bağlı bir ölçümün üstüne kurmak, o kararı beklerken işi durdurmak
demekti — kurmuyorum.

### 6.1 ⛔ÇÜRÜTME SONRASI EKLENEN ÖLÇÜM KALEMLERİ (ilk hâlinde yoktu)

6. ⭐**Prod'da `exec` / `exec_sql` RPC fonksiyonu VAR MI, sahibi kim, SECURITY DEFINER mi, kime
   GRANT edilmiş?** Repoda tanımı yok (migration dışı kurulmuş) ama üç betik onu çağırıyor
   (`apply-stock-fix.mjs:46,68` · `apply-sql-via-rpc.mjs:47` · `run-migration.ts:38`).
   **Niçin en kritik kalem:** varsa, service_role anahtarıyla keyfi SQL koşulabilir — yani
   `DROP TRIGGER` dahil. O durumda denetim tetiği **kaldırılabilir bir nesnedir** ve §3'ün
   hükmü çürür. Bu ölçüm gelmeden uygulama başlamaz.
7. **Altı tabloda TRUNCATE yetkisi kimde?** (`db-grant-hygiene` ölçümü `arwdDxtm` diyor.)
   `AFTER TRUNCATE … FOR EACH STATEMENT` tetiği kapsama alınacak mı?
8. **Prod `pg_trigger` sayımı.** ⚠**Repo bu soruda YETKİLİ KAYNAK DEĞİL:** `on_products_change`
   ve `on_categories_change` migration'larda yok, `scripts/webhook_setup.sql` ile kurulmuş.
   Repo ölçümü ≥10 tetik gösteriyor; gerçek sayı prod'dan gelir. (İlk hâlimde bunu "bakmadım"
   gibi yazmışım; doğrusu "repodan ölçülemez, sebebi şu".)
9. **`admin_audit_log` politikalarının rol kapsaması.** İki politika `TO authenticated`
   (`20260530220000_…sql:685-690`), `postgres` için politika YOK → FORCE-RLS borcunun tek
   satırlık kapanışı burası.
10. **Sipariş akışının `products` yazma frekansı** — §4.3'ün düzeltilmiş hacim tabanı.

### 6.2 Tetik uygulama ayrıntıları — planın ilk hâlinde hiç konuşulmamıştı

- **AFTER**, ve DELETE'te `OLD` (gerçekleşeni yakalamak için).
- **Tetik adı bilinçli seçilir:** aynı zamanlamalı tetikler **alfabetik** ateşlenir. `on_*` <
  `trg_*` olduğu için `trg_audit_*` adı denetimi webhook tetiklerinden **sonraya** atar; o
  fonksiyon `net.http_post` çağırıyor ve `net` erişilemezse ifadeyi düşürür. Ad, sıra ve
  BEFORE/AFTER **şablona yazılı** girecek — belirtilmezse uygulayan kişi rastgele karar verir.
- No-op UPDATE elemesi (`is not distinct from`).
- Tek migration, altı tablo birlikte (INV-MIGRATION-1). ⚠`admin_audit_log`'a indeks eklenecekse
  `CREATE INDEX CONCURRENTLY` işlem bloğuna **sokulamaz** — atomiklik kapısı bunu kırmızı verir.

## 7. Sabotaj kolu (kapı gerçekten ölçüyor mu)

- **SABOTAJ A:** bir tablonun tetiğini kaldır → konformans kapısı KIRMIZI vermeli.
- **SABOTAJ B:** yeni bir yazma yüzeyi ekle (`.py` içinde `.table('brands').delete()`) →
  kapı KIRMIZI vermeli. Bu kol, §2.3'teki uzantı/API kaçağının geri gelmesini engeller.
- **SABOTAJ C:** denetim yazımını patlat (tetik içindeki insert'i bozulmuş kolon adına çevir) →
  §4.2'nin "görünür" iddiası KIRMIZI vermeli. Vermiyorsa fail-open sessizdir ve iddia yanlıştır.
Üçü de geri alınır ve geri alındığı ölçümle doğrulanır.

## 8. Sınırlar — bu plan neyi YAPMAZ

- Merge etmem; migration'lı dalın merge kapısı **Recep**tir (kural 13).
- Prod DB'ye yazmam; migration'ı elle uygulamam.
- Disiplin katmanı (yazım öncesi döküm) KATALOG'un cetvelinde, benim işim değil.
- Geçmişe dönük denetim satırı **üretilmeyecek**: olmayan kanıtı sonradan imal etmek, kaydın
  kendisini yalancı yapar. Boşluk boşluk olarak kalır ve tarihi yazılır.

## 9. YÖNTEM

Plan (bu belge) → `plan-challenger` (migration içerdiği için ZORUNLU) → OPS çürütmesi →
Recep kararı → uygulama ayrı emirle, tek push (ara push yasağı §8.1).
