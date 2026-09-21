# Red Team: REC-357 PIM planı

> Denetlenen: `docs/plans/rec357-katalog-pim-cozumu.md` · Tarih: 2026-09-21 · Denetçi: bağımsız alt ajan (salt okuma, kod yazılmadı)

## 1 Yöntem

- Planın her iddiasını birinci kaynaktan ölçtüm: GitHub API (`gh api`, `v3.1.1` etiketindeki `compose.yaml`, `README.md`, `composer.json`, paket ağacı olan 5796 dosya), Docker Hub etiket API'si, devdocs.unopim.com 3.1 sayfaları (Docker kurulumu, Authentication).
- Yerel ölçümler: `docker stats --no-stream`, `docker info`, `docker exec supabase_db_venthub-hvac psql -d arama_golge`, `git -C C:/tmp rev-parse`.
- Tazeliği ölçmek için canlı DB'de **yalnız SELECT** koştum (Supabase MCP `execute_sql`, sayım + md5 özet). Canlıya yazma yapmadım.
- Depodaki komşu kodu okudum: `scripts/db/golge-kur.mjs` (gölge kümesindeki olay geçmişi).

## 2 Bulgular

### B1 · Elasticsearch "varsayılan kapalı" iddiası 3.1.1 compose dosyasında YANLIŞ, konteyner sayısı da 6 değil 7
- **Bulgu:** Plan §1.2 ve §3.1.5 Elasticsearch'ün isteğe bağlı olduğunu ve varsayılan olarak kapalı geldiğini, ölçütün de "6/6 konteyner" olduğunu söylüyor. Plan README'ye güvenmiş, ama `compose.yaml` README ile çelişiyor.
- **Kanıt:** `compose.yaml@v3.1.1` satır 54: `ELASTICSEARCH_ENABLED: "${ELASTICSEARCH_ENABLED:-true}"`. `x-app-depends` içinde `unopim-elasticsearch: condition: service_healthy` var ve `required: false` YOK (yalnız pgsql'de var). Yani `ELASTICSEARCH_ENABLED=false` verilse bile compose ES konteynerini bağımlılık olarak kaldırır ve sağlıklı olmasını bekler. Servisler şunlar: unopim, unopim-queue, unopim-scheduler, unopim-pgsql, unopim-redis, unopim-elasticsearch, unopim-mailpit. Toplam **7**. README satır 192 ise "off by default" diyor. Bu çelişki üreticinin kendi belgesinde.
- **Risk:** Orta. Kabul 1'in ölçütü ("6/6") ilk koşumda tutmaz. ES'i kapatmak için override dosyası gerekir, bu da planın "olduğu gibi kur" ilkesiyle (§5.3) çatışır.
- **Öneri:** Ölçütü "7/7 sağlıklı" olarak düzelt. ES'i açık bırak (heap 512 MB, ölçüldü). Ya da override dosyasını bilerek yaz ve ölçüm notuna "README ile compose çelişiyor" diye kaydet.

### B2 · Yönetici kimliğini `.env`'e yazmak kapsayıcıya ULAŞMIYOR
- **Bulgu:** Plan §3.1.3 yönetici kimliğini ilk `up`'tan önce `.env`'e yazıyor ("README şartı"). Ama `.env` yalnız compose'un kendi değişken yerleştirmesinde kullanılır. `compose.yaml` ise `INSTALLER_ADMIN_EMAIL` / `INSTALLER_ADMIN_PASSWORD` değişkenlerini hiçbir servisin `environment:` bloğuna geçirmiyor, `env_file:` de yok.
- **Kanıt:** `grep -n -i "INSTALLER|env_file" compose.yaml@v3.1.1` hiçbir satır döndürmüyor. `x-app-environment` bloğunda yalnız APP_*, DB_*, REDIS_*, ELASTICSEARCH_*, MAIL_* var. README satır 232-242 ve devdocs 3.1 Docker sayfası `.env` yolunu tarif ediyor. Bu yol kaynak koduna göre çalışmaz.
- **Risk:** Yüksek. Belirlenen parola sessizce yok sayılır. Seeder `admin@example.com` hesabını rastgele bir parolayla açar ve parolayı kapsayıcı içindeki `storage/app/admin-credentials.txt` dosyasına düz metin olarak yazar. Plan "parola rastgele, yalnız o dizinde" dediği hâlde gerçek parola adlandırılmış bir birimde kalır. Sonraki köprü adımı da (B5) bu kimliğe bağlı.
- **Öneri:** Kurulumdan sonra ölç: kurulan hesapla giriş yapılabiliyor mu, `admin-credentials.txt` var mı. Tutmazsa dosyadaki parolayı ilk girişte değiştir, dosyayı sil, bunu ölçüm notuna yaz. Alternatif olarak iki değişkeni bir override `environment:` bloğuyla geçir ve bunu "motor değil yapılandırma" diye beyan et.

### B3 · Uygulama portu varsayılan olarak 0.0.0.0'a açılıyor; "127.0.0.1" adımının nasıl yapılacağı yazılmamış ve saf hâli APP_URL'yi bozuyor
- **Bulgu:** Plan §3.1.4 portların yalnız 127.0.0.1'e bağlanacağını söylüyor ama yöntemi vermiyor. Compose dosyası uygulama portunu tüm arayüzlere açıyor. Mailpit'i ise zaten loopback'e bağlıyor.
- **Kanıt:** `ports: - "${APP_PORT:-8000}:80"` (0.0.0.0) ile `- "127.0.0.1:${FORWARD_MAILPIT_PORT:-8025}:8025"` karşılaştırması. Tek ortam değişkeniyle loopback'e bağlamak için `APP_PORT=127.0.0.1:8000` vermek gerekir. Ama `APP_URL` varsayılanı `http://localhost:${APP_PORT:-8000}` olduğundan değer `http://localhost:127.0.0.1:8000` olur. Bu durumda bağlantılar, görseller ve OAuth yönlendirmesi kırılır.
- **Risk:** Yüksek. Adım "kolay" diye atlanırsa yönetim ekranı yerel ağa açılır. Kurulum anında kimlik de B2 yüzünden belirsiz. Ayrıca `APP_KEY` varsayılanı boş.
- **Öneri:** `.env` içinde `APP_PORT=127.0.0.1:8000` ve **ayrıca** `APP_URL=http://127.0.0.1:8000` birlikte verilsin. Kanıt `docker port unopim-unopim-1` çıktısında `127.0.0.1:8000` olsun. `APP_KEY` açılışta üretiliyor mu, ayrıca ölçülsün.

### B4 · `pim_onizleme` şemasını `arama_golge`'ye yazmak başka şeridin veritabanına yazmak demek; "bayatsa yeniden kopya" o şeridin DB'sini ezer
- **Bulgu:** `arama_golge` URUN şeridinin gölgesi (REC-340 pgroonga ölçümleri). Plan hem CSV kaynağını oradan okuyor hem de köprünün hedef şemasını oraya yazıyor. Aynı plan "bayatsa yeniden kopya" diyor. Bu, başkasının DB'sini düşürüp yeniden kurmak demektir ve `pim_onizleme` de onunla birlikte silinir.
- **Kanıt:** `scripts/db/golge-kur.mjs` satır 21-27 ve 183-186: 2026-09-16'da `supabase db reset` URUN'un `arama_golge`'sini iş ortasında sildi. Aynı dosyanın kuralı: "VAR OLAN BİR VERİTABANI EZİLMEZ", varsayılan ad `golge_<damga>`. `arama_golge`'deki şemalar bugün şunlar: `archive_pre_kademe2, auth, cron, extensions, graphql_public, net, public, storage, vault`. REC-340'ın şema/sadakat sayımlarına yeni bir şema eklenmesi sayıları kaydırabilir.
- **Risk:** Yüksek. Şeritler arası paylaşılan kaynak ihlali. Köprü sonuçları ile REC-340 ölçümleri birbirini bozabilir.
- **Öneri:** Hedef için `golge-kur.mjs` ile ayrı bir veritabanı açılsın (ör. `pim_golge`) ya da `arama_golge`'den `pg_dump` ile kendi DB'ye kopya alınsın. `arama_golge` yalnız okunur kalsın. Yeniden kopya gerekirse yeni ad kullanılsın, URUN'unkine dokunulmasın.

### B5 · OAuth akışı "istemci kimliği" değil PAROLA yetkisi: köprü bir kullanıcının parolasını da taşır
- **Bulgu:** Plan §3.3 yalnız "OAuth istemci kimliği UnoPim'de üretilir" diyor. UnoPim 3.1 REST kimlik doğrulaması `grant_type=password` kullanıyor.
- **Kanıt:** devdocs `3.1/api/authenticate.html`: `POST /oauth/token`, `Authorization: Basic base64(clientId:clientSecret)`, gövde `{"username","password","grant_type":"password"}`. Kaynakta `AdminApiServiceProvider.php` satır 155-171 (Passport, `oauth-token` hız sınırı, "password-grant brute force" yorumu).
- **Risk:** Orta. Dört sır olur (client id, client secret, kullanıcı adı, parola). Yönetici hesabı kullanılırsa köprü tam yazma yetkisi taşır. Bu, "tek yön" ilkesini teknik olarak garanti etmez.
- **Öneri:** Köprü için ayrı bir API kullanıcısı açılsın, ACL'si yalnız okuma olsun. Dört sırrın hepsi `C:/tmp/pim-unopim/` altında dursun. `scripts/pim/` betikleri bu sırları ortam değişkeninden okusun, depo içinde varsayılan değer ya da örnek gerçek değer bulunmasın.

### B6 · Kabul 2'nin asıl sorusu yanlış kurulmuş: birim-gömülü hücre "reddedilmez", sessizce DÜŞER
- **Bulgu:** Plan §3.2, 38 birim-gömülü hücreyi CSV'ye "olduğu gibi" koyup UnoPim'in reddedip reddetmediğini ölçmeyi amaçlıyor. UnoPim'in ölçü niteliği ise CSV'de iki ayrı sütun bekliyor: `<kod>_value` ve `<kod>_unit`. Değer ya da birim eksikse satır hatası üretmeden geri dönüyor.
- **Kanıt:** `packages/Webkul/Measurement/src/Import/MeasurementProductImport.php@v3.1.1`: `$value = $row[$attribute->code.'_value'] ?? null; $unit = $row[$attribute->code.'_unit'] ?? null; if (! $value || ! $unit) { return; }`. İçe alıcıda `Importer.php` satır 444-449 yalnız `_value`/`_unit` sütun adlarını geçerli sayıyor.
- **Risk:** Yüksek. "Araç yakaladı mı" ölçümü aracı değil, CSV üreticisinin sütun eşlemesini ölçer. Tek sütuna konan "1200 m³/h" ya sütun-adı hatası verir ya da sessizce boş kalır. Bu sonuç "UnoPim kirli veriyi durduruyor/durdurmuyor" diye yanlış okunur ve karar 36'ya yanlış veri gider.
- **Öneri:** Soruyu yeniden yaz. CSV üretici `_value` ve `_unit` sütunlarını ayırmalı. Test edilecek şey, `_value` hücresine birim-gömülü metin (ör. `"1200 m³/h"`) ve boş `_unit` konduğunda içe alım raporunun satırı hata olarak sayıp saymadığıdır. "Girdi / düştü / neden" raporu sessiz düşüşü AYRICA saymalı: içe alım sonrası UnoPim'den geri okunarak değer var mı kontrol edilmeli.

### B7 · HVAC'ın temel birimi m³/h UnoPim'in hazır birim listesinde YOK
- **Bulgu:** Hazır `VolumeFlow` ailesinde `CUBIC_METER_PER_SECOND`, `LITER_PER_HOUR/MINUTE/SECOND` ve `CUBIC_FOOT_PER_MINUTE` var. `CUBIC_METER_PER_HOUR` yok.
- **Kanıt:** `MeasurementFamilySeeder.php@v3.1.1` içinde grep ile yalnız yukarıdaki kodlar bulundu. `PASCAL`, `KILOPASCAL`, `WATT` ve `KILOWATT` mevcut.
- **Risk:** Orta. Hava debisi alanları ya birim ekleme ister (yönetim ekranında "Measurements" menüsü var, bu motor değişikliği değil yapılandırmadır) ya da dönüşümlü girilir. Plan bunu öngörmüyor. Kabul 2 süresi uzar.
- **Öneri:** URUN aile şablonunu kurmadan önce ailenin birim envanterini UnoPim birim listesine karşı eşlesin ve eksik birim ekleme adımını plana yazsın.

### B8 · Etiket adı: GitHub etiketi `v3.1.1`, Docker etiketi `3.1.1`. Plan ikisini karıştırıyor
- **Bulgu:** Plan §1.2 "`v3.1.1` etiketi yok, `v`siz" diyor, §3.1.2 ise "compose.yaml 3.1.1 etiketinden indirilir" diyor.
- **Kanıt:** `gh api repos/unopim/unopim/tags` sonucu: `v3.1.1, v3.1.0, ...`. `contents/compose.yaml?ref=3.1.1` sonucu **404 "No commit found for the ref 3.1.1"**. Docker Hub'da `webkul/unopim` ve `webkul/unopim-queue` için `3.1.1` var (2026-09-17, amd64 ~318 MB). Ayrıca devdocs ve compose başlığı `master` dalından `curl` öneriyor.
- **Risk:** Düşük. Ama yanlış uygulanırsa `master` dalından indirilir ve sürüm sabitleme boşa çıkar.
- **Öneri:** URL'yi açık yaz: `https://raw.githubusercontent.com/unopim/unopim/v3.1.1/compose.yaml`. Ek olarak `UNOPIM_TAG=3.1.1` ver. Üçüncü taraf imajlar (`postgres:16-alpine`, `redis:7.2-alpine`) kayan etiketli, bu da not edilsin.

### B9 · Lisans tablosu: UnoPim MIT DOĞRU. Pimcore özetinde bir cümle yanlış
- **Bulgu ve kanıt:**
  - UnoPim: `gh api repos/unopim/unopim/license` sonucu `MIT`. `composer.json` `license: MIT`. Ağaçta ikinci bir LICENSE dosyası yok, yalnız `public/.../tinymce/license.txt` var. `packages/Webkul/AiAgent/composer.json`'da lisans alanı yok, kök MIT'i devralıyor. 22 paketin hepsi aynı depoda. **Doğrulandı.**
  - Akeneo: `LICENCE.txt` "Open Software License version 3.0". OSL §5 "External Deployment" yorumu doğru. Yükümlülük yalnız değiştirilmiş eserde doğar. Plan bunu "türev" diye doğru yazmış.
  - Pimcore POCL: €5M eşiği (§1.2.1a) ve "geliştirmenin ilk gününden üretim sayılır" (§1.2.2) **doğru**. Ama "çatal/değişiklik yasak (§1.3.1)" **yanlış**. §1.2 açıkça "customize, modify or adapt it for its own purposes" izni veriyor. §1.3.1 yalnız rakip ya da işlevce eşdeğer bir ürün olarak dağıtmayı ve barındırılan hizmet olarak sunmayı yasaklıyor.
- **Risk:** Düşük. Eleme hükmü eşik ve geriye dönük ücret (§1.2.1a) nedeniyle yine geçerli, ama gerekçe cümlesi düzeltilmeli.
- **Öneri:** Pimcore satırını şöyle düzelt: "değişiklik serbest; rakip ürün olarak dağıtım ve barındırılan hizmet yasak; eşik aşılırsa ücret geriye dönük". Ek bir not: UnoPim 3.1 `MagicAI` / `AiAgent` paketleri ve `laravel/ai` bağımlılığı içeriyor. Bir API anahtarı girilirse katalog verisi dış LLM sağlayıcısına gider. Kurulan paket listesine "AI kapalı" satırı eklenmeli.

### B10 · Gölge tazeliği: bugün içerik olarak TAZE, ama gölge canlıyla aynı değil
- **Kanıt:** `arama_golge` içinde 442 ürün, 47 aile, 31 kategori ve 369 dolu `technical_specs` var. Plandaki sayılar **doğrulandı**. Canlıda (salt SELECT) sayılar aynı: 442/47/31/369. `technical_specs` md5 özeti iki tarafta da `3d8564ed…2d79`, aile ad+slug md5 özeti iki tarafta da `b5119664…1155`. Farklar ise şunlar:
  - Gölgede `products.updated_at` en yenisi 2026-09-18 07:28. Canlıda en yenisi 2026-09-10 07:44. Gölgede **2 ürün yerelde değiştirilmiş**, yani gölge salt kopya değil.
  - Canlıda gölge anından (09-18 08:42) sonra **1 aile** güncellenmiş.
- **Risk:** Düşük (bugün). Plan "tarih damgası ölçülür" diyor, ama `updated_at` gölgede yerel yazımları da taşıdığı için tazelik kanıtı olamaz.
- **Öneri:** Tazelik ölçütü `max(updated_at)` değil, içerik özeti (md5) karşılaştırması olsun. CSV'ye giren ailenin satırları o an canlıyla md5 ile eşlensin.

### B11 · Bellek: sığar (kaba tahmin)
- **Kanıt:** `docker info` 15,53 GiB, 16 CPU. `docker stats` bugün Supabase 11 konteyner için yaklaşık **1,9 GiB** gösteriyor (analytics 962 MiB en büyüğü). UnoPim tahmini: ES yaklaşık 0,9-1,2 GiB (heap 512 MB + JVM ek yükü), Apache/PHP yaklaşık 0,3-0,5 GiB, queue ve scheduler 0,2-0,4 GiB, postgres 0,1-0,2 GiB, redis ve mailpit 0,05 GiB. Toplam yaklaşık **2-2,5 GiB**. Her şey birlikte yaklaşık 4,5 GiB, yani %30'un altında.
- **Risk:** Düşük. Tek bir koşul var: içe alım ve tamlık kuyruğu sırasında PHP bellek sıçraması ölçülmeli.
- **Öneri:** Kabul 1 kanıtına `docker stats --no-stream` çıktısı eklensin (içe alım sırasında da bir kez).

### B12 · Depo dışı dizin: doğrulandı, ama betik tarafı güvenceli değil
- **Kanıt:** `git -C C:/tmp rev-parse` sonucu `fatal: not a git repository`. `C:/tmp/pim-unopim` henüz yok. Çalışma ağacı `C:/tmp/vh-altyapi-kip` kardeş dizin, üst dizin değil. Yani kurulum dizini hiçbir deponun içinde değil.
- **Risk:** Orta. Sırların asıl sızma yolu `scripts/pim/` altındaki betikler ve testler, çünkü bunlar depoda (PUBLIC). Planda sır tarama kapısı yok. Test fikstürüne gerçek token ya da parola yapıştırma riski var.
- **Öneri:** `scripts/pim/` sırları yalnız ortam değişkeninden okusun. Testler sahte değer kullansın. PR'dan önce depo sır taraması (`secret-exposure` betiği) koşulsun, kanıt satırı PR'a yazılsın.

### B13 · Planın atladığı diğer riskler
- **Kalıcı servis ve `restart: unless-stopped`:** Yedi konteynerin hepsi Docker açılışında kendiliğinden kalkar. Plan §3.1.7 "down" yolunu yazıyor ama kalıcı bellek ve port işgalini envanter satırına eklemiyor. (Orta)
- **Mailpit 8025 portu:** Planın port listesinde yok (loopback'e bağlı, düşük risk). Ama kurulumdan önce "8025 boş mu" diye ölçülmedi.
- **Mimari:** Görüntüler amd64 ve arm64 için var, makine x86 olduğundan sorun yok.
- **Cetvel:** Plan "cetvel yok — yazımı kapsamda" diyor, bu kural 1'e uygun. Ancak üçüncü taraf kurulum için `surum-sabitleme` ilkesinin karşılığı olarak kayan etiketli yan imajlar (B8) cetvele girmeli.

## 3 Sonuç: KOŞULLU

§3.1 kurulumuna şu koşullar yerine getirilmeden başlanmamalı:

1. **(B4)** Köprü hedefi `arama_golge` DEĞİL. Ayrı bir gölge DB açılsın (`golge-kur.mjs` ile ya da dump ile). `arama_golge` yalnız okunur kalsın, yeniden kopyası alınmasın.
2. **(B6)** Kabul 2'nin sorusu `_value`/`_unit` sütun sözleşmesine göre yeniden yazılsın. Sessiz düşüş, UnoPim'den geri okunarak sayılsın.
3. **(B2)** Yönetici kimliğinin gerçekten uygulandığı ölçülsün. `admin-credentials.txt` dosyası silinsin ve parola değiştirilsin.
4. **(B3)** `APP_PORT=127.0.0.1:8000` ile `APP_URL=http://127.0.0.1:8000` birlikte verilsin. `docker port` çıktısı kanıt olsun.
5. **(B1)** Ölçüt "7/7" olarak düzeltilsin. ES kararı (açık bırak ya da override yaz) ölçüm notuna yazılsın.
6. **(B5)** Köprü için yalnız okuma yetkili, ayrı bir API kullanıcısı açılsın. Dört sır depo dışında dursun, `scripts/pim/` yalnız ortam değişkeni okusun, PR'dan önce sır taraması koşulsun (B12).
7. **(B8)** compose indirme URL'si `v3.1.1` etiketiyle açıkça yazılsın.
8. **(B7, B9)** Birim envanteri m³/h eksikliğiyle birlikte plana eklensin. Pimcore gerekçe cümlesi düzeltilsin. "AI paketleri kapalı" satırı eklensin.
