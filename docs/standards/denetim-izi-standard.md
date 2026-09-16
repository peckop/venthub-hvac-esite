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
**`site_settings`**.

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
| **`product_prices` · `price_lists`** | Betiklerle yazılıyor ve ticari hassasiyette `site_settings` sınıfında. Bu turda kapsamda değil; **sessizce dışarıda kalmadı, burada yazılı.** Sonraki turda karara bağlanır. |

### 7.3 `site_settings` tenant borcu

`site_settings`'te `tenant_id` kolonu **yok** (prod ölçümü). Denetim satırları
`admin_audit_log.tenant_id`'nin **sabit varsayılanını** alır — yani o satırların tenant damgası
gerçek değil, varsayılandır. Faz 2 (multi-tenant) PARK'ta olduğu için bugün zarar üretmiyor;
**PARK kalkarsa bu bir borçtur ve `site_settings` tenant'lanmadan multi-tenant açılamaz.**
