# Cetvel — Denetim izi bütünlüğü (denetim-izi)

> **REC-292 · ALTYAPI · 2026-09-09**
> Bu cetvel, VentHub'da **hangi veri yazımının denetim izine düşmek zorunda olduğunu**, o
> zorunluluğun **nasıl ölçüldüğünü** ve **kimin neyi üstlendiğini** yazar.
>
> **Niçin yazıldı:** REC-292 açıldığında bu konuda cetvel **YOKTU**. `docs/standards/`
> altındaki dosyaların onu `admin_audit_log` adını anıyordu ama hiçbiri yazım yüzeyini kurala
> bağlamıyordu; en yakını `admin-standard.md`'de admin paneli için bir kontrol listesi
> satırıydı. Kural 1 gereği cetvelsiz iş, cetveli yazmayı da kapsar.

## 1. Tek cümlelik kural

**Veriyi kim değiştirirse değiştirsin, hangi araçla değiştirirse değiştirsin, değişiklik
`admin_audit_log`'a düşer — ve düşmediği hâl KIRMIZIDIR, sessiz değil.**

### 1.1 Kuralın dayandığı ölçüm

2026-09-09, prod:

| ölçüm | sayı |
|---|---|
| `scripts/**` altında veri yazan dosya | 14 |
| bunlardan denetim satırı yazan | **0** |
| `logAdminAction` çağrı yeri (uygulama tarafı) | 25 |
| 2026-09-08'de yapılan yazım (7 silme + 18 taşıma + 104 görsel) karşılığı denetim satırı | **0** |
| `admin_audit_log` toplam satır (bir yıl) | 61 |

Yani denetim izi **panelde vardı, panel dışında yoktu.** Kural bu boşluktan doğdu.

### 1.2 ⛔Bir sayı düzeltmesi — ve niçin cetvele yazıldı

Arıza ilk bildirildiğinde "audit log'da `categories` satırı 0" denmişti. **Bu ifade yanlıştı:**
`categories` için 12 satır var (2025-12 ve 2026-03, hepsi panelden). Ölçülen doğru şey daha
dar ve daha keskindir: **2026-09-08'de hiçbir tablodan tek satır düşmemiştir.**

Ders cetvele giriyor çünkü sınıfı tekrar eder: **"tabloda iz yok" ile "o gün iz yok" farklı
iddialardır; birincisi denetim sisteminin hiç çalışmadığını ima eder ve yanlış iş emri
doğurur.** Denetim izi ölçümlerinde ölçüt **daima zaman + yüzey** ile birlikte yazılır.

## 2. Yazma yüzeyi — kuralın kapsadığı evren

Bu liste ölçümle çıkarıldı, hatırlanarak değil. **Evreni "tanıdığım uzantı + tanıdığım API adı"
sanmak, bu işte sekiz kez hataya yol açtı** (2026-09-09 kaydı).

| yüzey | örnek | dosya mı |
|---|---|---|
| SDK `.from('x').insert/update/upsert/delete` | 14 dosya | evet |
| Python `.table('x').update()` | `scripts/tools/extract_brands.py` | evet, **farklı API adı** |
| Ham `fetch` + PostgREST `POST/PATCH/DELETE` | `scripts/icerik-hatti/*.mjs` | evet, **hiçbir SDK deseni tutmaz** |
| **Dinamik tablo adı** (`rest/v1/${t}`) | `katalog-geri-yukle.mjs` | evet ama **literal-ad grep'i göremez** |
| Ham `.sql` dosyası | `scripts/db/fixes/*.sql` | evet |
| Supabase SQL editörü | insan eli | ⛔**HAYIR** |
| MCP `execute_sql` | ajan aracı | ⛔**HAYIR** |

### 2.1 Buradan çıkan iki kural

1. **Disiplin katmanı (yazım öncesi döküm) KAPI DEĞİLDİR.** Evrenin iki üyesi hiç dosya
   değildir; hiçbir tarama onları göremez. Disiplin kapsadığı yerde iyidir, ama kanıtı ona
   bağlamak, kanıtı birinin hatırlamasına bağlamaktır.
2. **Kapı tablo adı üzerinden kurulamaz.** `rest/v1/${t}` gibi dinamik adlar literal-ad
   taramasında görünmez. Kapı **yazma fiili** üzerinden kurulur.

## 3. Katman hükmü — ve tetiğin GÖRMEDİĞİ yer

**Denetim izi DB tetiğiyle tutulur.** Sebep: satır-düzeyi DML'in bütün yüzeylerinin altında
durur; hangi dil, hangi API, hangi araç olursa olsun ateşlenir.

### 3.1 ⛔Tetiğin altında kalan yollar (fazla iddia etmemek için, adıyla)

| yol | tetik görür mü | bugün erişilebilir mi |
|---|---|---|
| **TRUNCATE** | ⛔HAYIR (satır tetiği ateşlenmez, RLS de uygulanmaz) | yetki `anon`a kadar açık (ölçüldü) ama **ulaşılabilir yol yok** — PostgREST TRUNCATE'i dışa açmaz |
| Keyfi SQL RPC (`exec`/`exec_sql`) | ⛔tetik **kaldırılabilir** hale gelirdi | ⭐**YOK** — 2026-09-09'da ada göre VE davranışa göre tarandı, ikisi de 0 satır |
| `DISABLE TRIGGER` · `session_replication_role` | ⛔HAYIR | service_role ile hayır; **sahip (`postgres`) rolüyle evet** — SQL editörü ve MCP `execute_sql` |

**Kural:** sahip rolüyle yapılan yazım tetiğin de altındadır. Buranın karşılığı kapı değil
**kuraldır**: sahip rolüyle veri yazımı Recep kapısıdır.

## 4. Fail-closed — ve niçin ispat yükü fail-open'ın üzerindedir

Denetim satırı yazılamazsa **veri yazımı da geri alınır.** Tetik fonksiyonlarında
`exception when others` yakalayıcısı **yoktur** ve bu bir eksiklik değil karardır.

### 4.1 Ölçülmüş gerekçe

Tetik ile veri yazımı **aynı transaction'dadır**. Yakalayıcı yazılmazsa denetim insert'i
patladığında transaction düşer. Yani:

> **Fail-closed, Postgres'in atomikliğinden BEDAVA gelen varsayılandır. Fail-open'ı elde etmek
> için fazladan kod yazmak gerekir.**

Bu yüzden ispat yükü fail-closed'ın değil, **fail-open'ın** üzerindedir. Depoda fail-open
yazan bir örnek var (`20260826213000_enforce_role_change_actor_guard.sql`) ve orada gerekçe
yazılıydı: kayıt/göç akışı kırılmamalı. **Denetim izinde o gerekçe geçmez**, çünkü kaybedilen
şey kanıtın kendisidir ve §6 geriye dönük üretimi yasaklar.

### 4.2 Bedeli — gizlenmiyor

Denetim yazımı patlarsa kütle katalog göçü de durur. Kabul edildi; alternatifi kanıtsız
yazımın sessizce geçmesiydi.

### 4.3 Kapı bunu ÖLÇER

Gövdeye sonradan bir `exception when` girerse tetik **ayakta görünür** ama kayıp sessiz hale
gelir. Kapı tetiği sayıp fail-closed'ı ölçmezse, korumaya çalıştığı şeyi kaçırır. Bu yüzden
`INV-DENETIM-IZI-1` üç şeyi birden ölçer (§5).

## 5. Kapı — canlı DB'ye bakar, dosyaya değil

`INV-DENETIM-IZI-1` · `scripts/db/checks/denetim-izi-tetik-kapisi.mjs`

### 5.1 Niçin metin taraması yetmez

Bu depoda **migration dosyası, "prod'da hangi tetikler var" sorusunda yetkili kaynak
değildir.** Ölçüldü: `on_products_change` ve `on_categories_change` migration'larda yok,
`scripts/webhook_setup.sql` üzerinden migration hattının dışından kurulmuş. Dosyaya bakan bir
kapı, `DROP TRIGGER` ile sökülmüş bir tetiği göremez ve yeşil döner.

### 5.2 Üç ayrı arıza sınıfı ölçülür

1. **TETİK-YOK** — kapsamdaki tabloda `denetim_izi*` tetiği duruyor mu.
2. **FAIL-OPEN** — fonksiyon gövdesinde `exception when` belirmiş mi (§4.3).
3. **SÜZGEÇ-DAR / SÜZGEÇ-YOK** — `products` UPDATE tetiği ticari çekirdek kolonları kapsıyor
   mu, ve kolon süzgeci hâlâ var mı.

### 5.3 Ölçemediği hâl yeşil değildir

Bağlantı dizesi yoksa **çıkış kodu 2** ve "ÖLÇÜLEMEDİ". Sorgu tamamen boş dönerse de 2 —
çünkü o hâl "tetikler silinmiş" ile "tablolar yeniden adlandırılmış"ı ayırt etmez ve kör
koşan kapı, kapı değildir.

### 5.4 Taban dosyası YOKTUR

Kardeş kapıların (`rls-role-coverage`, `catalog-integrity`) taban dosyası var; bunun yok.
Sebep: **denetim izinin eksikliği gerekçelendirilebilir bir hâl değildir.** Taban, "biliyorum
ve şimdilik kabul ediyorum" demenin yeridir; burada kabul edilecek bir eksik yok.

## 6. Yasaklar

1. ⛔**Geriye dönük denetim satırı ÜRETİLMEZ.** Olmayan kanıtı sonradan imal etmek, kaydın
   kendisini yalancı yapar. Boşluk boşluk olarak kalır ve tarihi yazılır.
2. ⛔**`actor` NULL ise rapor "bilinmiyor" der, "sistem" DEMEZ.** service_role bağlamında
   `auth.uid()` NULL döner; alan adı taahhüt eder.
3. ⛔**Denetim satırı yazan kod, hatasını yutmaz.** Bkz. §4.
4. ⛔**"Tabloda iz yok" ile "o gün iz yok" birbirinin yerine yazılmaz.** Bkz. §1.2.

## 7. Kapsam ve sınırlar

### 7.1 Kapsamda olan tablolar

`categories` · `products` · `product_families` · `product_images` · `brands` ·
**`site_settings`** · *(2026-09-29, REC-412 Faz 0.5)* **`pricing_rule` · `pricing_policy` · `price_lists` ·
`currency_rates` · `product_prices`** — yani on bir tablo; fiyat tabloları için ayrıntı §8.

`brands` ve `site_settings` emirde yoktu, **ölçümle eklendi.** `site_settings` ticari olarak en
ağır kalemdir: satış kipi anahtarı (REC-168) orada ve vitrinde fiyatın görünüp görünmeyeceğini
belirliyor.

### 7.2 Bilinçli olarak kapsam dışı — gerekçesiyle

| kalem | niçin dışarıda |
|---|---|
| **TRUNCATE tetiği + `REVOKE TRUNCATE`** | Ayrı kayıt (OPS kararı 2026-09-09). Latent yetki: bugün ulaşılabilir yol yok, ama yetki hazır bekliyor. |
| **`actor` sorusunun çözümü** (özel claim'li jeton / ayrı DB rolü) | Çözülebilir ama ayrı kalem. **Doğa yasası olarak kaydedilmedi.** |
| **FORCE-RLS politikası** (definer yolunu kapsayan INSERT politikası) | Ayrı kalem. `admin_audit_log`'da üç politika var, hiçbiri `postgres` için değil. |
| **Otomatik stok/rezervasyon yazımları** | `products` kolon süzgeciyle dışarıda. Sebep: her siparişte yazılıyor ve "kim fiyatı değiştirdi" sorusunu gürültüye boğardı. Ev geleneğinin dersi: **okunmayan alarm alarm değildir.** |
| ~~`product_prices` · `price_lists`~~ | **KAPSAMA ALINDI (2026-09-29, REC-412 Faz 0.5)** — bu satır "sonraki turda karara bağlanır" diyordu; o tur bu. Bkz. §8. |
| ~~**Maliyet yenileme** (`products.cost_in_base`, `purchase_rate_to_base`)~~ | **KAPSAMA ALINDI (2026-09-29, REC-412 Faz 0.5b, karar 186)** — tek atomik RPC + parti özeti. Bkz. §8.4. |
| **`product_costs` aynası** | `product_costs` yalnız `product_costs_senkron()` aynasıdır, kaynağı (`products`) izlenir → ikinci tetik kopya satır üretirdi. REC-140 Faz 3 yazıcıyı `product_costs`'a taşıyınca aynaya tetik gerekir. Karar OPS'ta. |
| **`last_purchase_cost` / `last_purchase_currency` / `last_purchased_at`** | Mal kabul (`process_goods_receipt`) yazar; kaynağı belgedir (satın alma belgesi izi taşır). Fiyat-otoritesi kolonu değil. |

### 7.3 `site_settings` tenant borcu

`site_settings`'te `tenant_id` kolonu **yok** (prod ölçümü). Denetim satırları
`admin_audit_log.tenant_id`'nin **sabit varsayılanını** alır — yani o satırların tenant damgası
gerçek değil, varsayılandır. Faz 2 (multi-tenant) PARK'ta olduğu için bugün zarar üretmiyor;
**PARK kalkarsa bu bir borçtur ve `site_settings` tenant'lanmadan multi-tenant açılamaz.**

## 8. Fiyat tabloları — değişiklik günlüğü ve yöntem sözleşmesi (REC-412 Faz 0.5, 2026-09-29)

Vitrin fiyatını belirleyen beş tablo denetim izine girer: **`pricing_rule` · `pricing_policy` · `price_lists` ·
`currency_rates` · `product_prices`**. Aynı `denetim_izi_yaz()` fonksiyonu, fail-closed (bkz. §4). Plan ve çürütme:
`docs/plans/rec412-tek-urun-fiyat-girisi-2026-09-29.md` §5c · `docs/audits/rec412-faz05-red-team-2026-09-29.md`.

### 8.1 Yöntem: kolon DEĞİL, istek başlığı

İstemci her fiyat yazımında iki başlık gönderir; PostgREST bunları o isteğin işleminde `request.headers` ayarı olarak
tetiğe görünür kılar ve günlüğün `comment` alanına `| yontem=… | oturum=…` yazılır:

| başlık | değer | anlamı |
|---|---|---|
| `x-degisiklik-yontemi` | `panel` · `liste` · `csv` · `yeniden_hesap` · `maliyet_yenileme` · `sistem` | yazımın hangi yoldan geldiği (beyaz liste dışı değer yok sayılır) |
| `x-degisiklik-oturumu` | uuid | bir koşunun (ör. katalog yeniden hesabı; upsert 500'lük, pasifleştirme 200'lük partilerle gider) parçalarını birleştirir |

* Niçin kolon değil: DELETE isteği yük taşımaz (kural silme yöntemsiz kalırdı) ve iş tablolarına kolon eklemek
  `database.types.ts`'i kaydırırdı. Başlık okuması tetik gövdesindedir; ayrı fonksiyon yoktur (tip kayması ve `WHEN`
  içinde EXECUTE yetkisi tuzağı doğmaz).
* **Başlıksız yazım** (SQL editörü, MCP, psql betiği) zararsızdır: `yontem=BILINMIYOR` yazılır. Boş dize, geçersiz
  JSON, beyaz liste dışı değer de hata DEĞİL, `BILINMIYOR`'dur (canlıda ölçüldü: transaction-local ayar sonrası
  `current_setting` `''` dönebilir).
* ⚠**Yöntem istemci BEYANIDIR, kanıt değil.** "Kim (`actor`) + ne zaman + eski→yeni" DB gerçeğidir; "yöntem" beyandır.
  Bu yüzden **hiçbir sayım ya da eleme kararı başlığa bağlanmaz**: başlık yalnız etikettir (plan-challenger 2.1).
* Kanıt sınırı: `request.headers`'ın canlıda uçtan uca okunduğu ilk gerçek panel yazımında ölçülür (audit `comment`'te
  `yontem=panel` görülmeli). Görünmezse yöntem `BILINMIYOR` kalır (kayıp yok) ve taşıyıcı kolona döndürülür (yeni migration).

### 8.2 Granülarite VERİDEN türetilir

| yazım | günlük |
|---|---|
| `pricing_rule`, `pricing_policy`, `price_lists`, `currency_rates` (UPDATE/DELETE; INSERT yalnız `source<>'tcmb'`) | satır başına, tam eski→yeni |
| `product_prices`, `is_derived=false` (elle ezilmiş) | satır başına, **her yöntemde** (başlık susturamaz); `computed_at` diff'ten elenir |
| `product_prices`, `is_derived=true` (motor çıktısı) | ifade düzeyinde **tenant başına TEK özet satırı** (`row_pk='OZET'`); `before`/`after` = DEĞİŞEN satırların eski→yeni dizisi (tavan 2000, `kirpildi=evet`); fiyat-otoritesi kolonlarından hiçbiri değişmediyse satır YAZILMAZ |

Fiyat-otoritesi kolonları (ödeme tutarı `net/gross` yoksa diğerlerinden de üretilir): `net_price` · `gross_price` ·
`base_price` · `sale_price` · `discount_percentage` · `valid_from` · `valid_until` · `is_active` · `currency` (+ `is_derived` satır ölçütünde).
Bir yeniden hesap koşusu birden çok parti = birden çok özet satırıdır; koşuyu birleştiren anahtar `oturum=`'dur. "Tek özet" değil.

### 8.3 Sınırlar, adıyla

* İfade düzeyi tetikler satır tetiklerinden SONRA ateşlenir (özet için "webhook'tan önce yazılır" iddiası YOKTUR; atomiklik
  nedeniyle zarar yok: biri düşerse ifade ve günlük birlikte geri alınır).
* **Maliyet yenileme artık kapsamda** (bkz. §8.4). `last_purchase_*` (mal kabul) ve `product_costs` aynası kapsam dışı kalır (§7.2).
* Katalog betikleri (`scripts/icerik-hatti/*`) başlık göndermez → `BILINMIYOR`; sahibi katalog hattı (kod kapısı INV-FIYAT-GUNLUGU-1'de ratchet listesi).
* TRUNCATE yine kapsam dışı (§7.2).

### 8.4 Maliyet yenileme — TEK atomik RPC ve parti özeti (REC-412 Faz 0.5b, karar 186)

`products.cost_in_base` ve `products.purchase_rate_to_base` (donmuş TL maliyet; yalnız `refreshCostInBase` yazar) satır
tetiğinin `UPDATE OF` listesinde **değildir** ve listeye eklenmez: panelden tek tıklamada ≤348 satır yazılırdı. Onun yerine:

| parça | hüküm |
|---|---|
| **Yazım yolu** | `public.maliyet_yenile(p_satirlar jsonb)` — **TEK `UPDATE` ifadesi**; ya tüm parti yazılır ya hiçbiri (yarım yenileme yok). Ürün başına ayrı PATCH ile yazan istemci yolu **kapıyla KIRMIZI** (INV-FIYAT-GUNLUGU-1, maliyet kolu). |
| **Yetki** | `is_admin_claim()` — JWT `user_role` / `app_metadata.user_role`; `user_metadata`'ya bakmaz, JWT yoksa FALSE (profil tablosuna DÜŞMEZ; kural 12). `SECURITY INVOKER` (RLS korunur, yetki genişlemez), tenant filtreli, moderatör yazamaz (maliyet yönetici alanı, karar 95). `anon`/`PUBLIC` EXECUTE kapalı. |
| **Girdi** | Payload elemanı: `{id, cost_in_base, purchase_rate_to_base, purchase_price, purchase_currency}` (son ikisi maliyetin HESAPLANDIĞI alış fiyatı: okuma ile yazma arasında fiyat değişirse satır yazılamaz). Dizi değilse, eleman eksik/geçersizse (`cost_in_base<0`, `purchase_rate_to_base<=0`, NaN/Infinity), `id` yinelenirse ya da bu tenant'ta yoksa **tüm parti reddedilir** (22023). Değerler sütun duyarlığına yuvarlanır (cost 4, rate 6). Parti sınırı **5000** (54000; RPC ve istemci aynı; aşılırsa istemci BÖLMEDEN durur — bölmek atomikliği bozar). |
| **Yarım yenileme yok** | Yazılan satır sayısı beklenenden azsa (INVOKER olduğundan `products` UPDATE politikası da uygulanır: JWT'de admin, profil rolü düşmüş → RLS sessizce 0 satır; ya da alış fiyatı değişti) **40001** ile TÜM parti geri alınır; sessiz "0 güncellendi" başarısı yoktur. Arayüz 42501/54000/57014/40001'i ayrı mesajla gösterir. |
| **Günlük** | `denetim_izi_maliyet_ozet()` — `products` üzerinde ifade düzeyi tetik (geçiş tabloları; sütun listesi konamaz → her UPDATE ifadesinde çalışır, değişen maliyet yoksa satır YAZMAZ). **Tenant başına TEK özet satırı** (`row_pk='OZET'`), `before`/`after` = değişen satırların eski→yeni `{id, cost_in_base, purchase_rate_to_base}` dizisi; yöntem/oturum §8.1 başlıklarından (`maliyet_yenileme`). Fail-closed: günlük yazılamazsa maliyet yazımı geri alınır. |
| **Çift kayıt önlemi** | `purchase_price`/`purchase_currency` de değişen satır özete GİRMEZ; onu satır tetiği (`denetim_izi_products_upd`) zaten TÜM değişen kolonlarıyla (maliyet dahil) yazar. |

Kanıt: `docs/audits/rec412-maliyet-golge/` (PGlite gölge, 43 kontrol + 5 bilinçli bozma kırmızı: kiracı filtresi, çift kayıt önlemi,
yönetici kapısı, beklenen-sayı kontrolü, NaN kontrolü) ve bağımsız çürütme `docs/audits/rec412-maliyet-red-team-2026-09-29.md`.
Kapı ayrıca `ZORUNLU_TETIKLER`'i ADIYLA arar (`denetim_izi_maliyet_ozet`, `denetim_izi_ozet_*`): tabloda başka tetik durduğu için
"tabloda tetik var mı" sorusu bunların sökülmesini görmez. ⚠Gölge şema gerçek DEĞİL: RLS ve gerçek `auth.uid()` taklittir; hacim ölçüsü gerçek DB'yi temsil etmez.
Bilinen sınır: aynı ifadede maliyet kolonlarıyla birlikte satır tetiğinin izlediği BAŞKA kolon değişirse (bugün hiçbir yolda yok)
satır iki kez görünebilir. Kapı kapsamı: kolon adı `.update(…)` argümanında DOĞRUDAN geçmeyen (önce değişkene konan) yazımı istemci
tarayıcısı göremez; DB tetiği yine yazar ama parti özeti sözleşmesi o yolda kaybolur.
