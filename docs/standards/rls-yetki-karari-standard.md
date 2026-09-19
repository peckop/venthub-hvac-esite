# RLS Yetki Kararı Cetveli — bir politika "bu kullanıcı yönetici mi" sorusunu nereden okur

**Sürüm 1.0 · 2026-09-14 · Şerit: ALTYAPI · Kaynak: REC-322 (REC-321 adım 1 ölçümünden çıktı)**

Bu cetvel tek bir soruya cevap verir: **bir RLS politikası ya da yetki yardımcısı,
uygulama rolünü (admin / moderator / user) hangi JWT talebinden okur.** Cetvel
yazılmadan önce bu sorunun yazılı tek kaynağı yoktu; iki fonksiyon iki farklı
yerden okuyordu ve hangisinin doğru olduğu yalnız birinin kod yorumunda yazıyordu.

## 1 · KURAL (tek satır)

> **Uygulama rolü kararı yalnız `public.is_admin_user()` üzerinden verilir** — tek istisna
> `public.user_profiles` politikalarıdır; onlar **`public.is_admin_claim()`** kullanır.
> `request.jwt.claims ->> 'role'` **Postgres rolüdür** (`anon` / `authenticated` /
> `service_role`) ve **yetki kararı için okunmaz.**

### 1.1 · İSTİSNA: `user_profiles` politikaları (REC-355, karar 43, 2026-09-18)

**Kural:** yetki kararını veren fonksiyon, o kararın kullanıldığı tablonun kendisini **okuyamaz.**

`is_admin_user()` SECURITY INVOKER'dır ve JWT'de `user_role` yoksa yedek dalda `user_profiles`
okur. `user_profiles` politikaları onu çağırdığı sürece zincir kendine dönüyordu:
politika → fonksiyon → politika → **`54001 stack depth limit exceeded`**.

Ölçüm (2026-09-18, ikisi de rollback'li): canlıda claim'siz `authenticated` ile arama
`display_price → is_user_admin → user_profiles politikası → is_admin_user → …` zinciriyle 54001
verdi; gölgede claim'siz üç jeton şekli de 54001 verdi. Sonuç **kararsızdı** — aynı jeton canlıda
`super_admin` için çalışıp normal kullanıcı için patlıyordu, çünkü özyineleme ancak yedek dalın
kendi satırını `id = auth.uid()` kolundan görebildiği hâlde duruyor.

Bu yüzden `user_profiles`ın dört politikası **`is_admin_claim()`** çağırır: yalnız
`claims ->> 'user_role'` ve `claims -> 'app_metadata' ->> 'user_role'` okur, **tablo okuması
yoktur**, dolayısıyla hiçbir politikadan döngü doğuramaz. `user_metadata` burada da **yasak**
(kural 12). EXECUTE yüzeyi dardır: `PUBLIC` ve `anon` geri alınır, yalnız `authenticated` ve
`service_role`.

`is_admin_user()` **değişmedi** ve diğer tabloların mercii olarak kalır; onarımdan sonra yedek
dalının okuduğu politika artık onu çağırmadığı için o dal da döngüsüz çalışır. Aynı sebeple
`is_user_admin(uuid)` üzerinden geçen 20 politika (`coupons`, `product_prices`, `price_lists`,
`order_notes`, `order_attachments`, `inventory_movements`, `inventory_settings`) ve
`security_invoker` görünümler (`view_admin_orders`, `admin_users`,
`view_admin_uninvoiced_orders`) de döngüsüzleşir.

**Ölçülmüş takas (Recep kararı 43 ile kabul edildi):** claim'siz bir yönetici jetonu
`user_profiles` üzerinde artık yönetici sayılmaz — yalnız kendi satırını görür, silme reddedilir.
Karşılığında claim'siz normal kullanıcı hata almaz. Hook biçimli jetonlarda (bugünkü normal akış)
davranış birebir aynıdır.

**Kapılar:** `INV-AUTH-YETKI-DONGUSU-1` (migration metni + bu cetvel) · migration içindeki
`DO $guard$` bloğu · `scripts/db/checks/arama-davranisi.mjs` `authenticated-iddiasiz` kolu.
⚠`INV-AUTH-ROLE-2` bu sapmayı **görmez** (dedektörü `->> 'role'` arar), yani yazılı tek fren bu
bölümdür.

## 2 · NİÇİN — ölçülmüş olay

`public.jwt_role()` şunu yapıyordu:

```sql
SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role'
```

Supabase'de bu talep Postgres rolünü taşır. Dolayısıyla
`jwt_role() IN ('admin','moderator')` biçimindeki bir koşul **normal bir kullanıcı
için hiçbir zaman doğru olmaz.** `public.is_admin_user()` ise doğru kaynağı okur:

```sql
user_role := COALESCE(claims ->> 'user_role', claims -> 'app_metadata' ->> 'user_role')
-- `user_metadata` BİLEREK YOK: kullanıcı onu yazabilir (CLAUDE.md kural 12).
```

**Ölçüm (2026-09-13, canlı, salt-okuma):** depoda `jwt_role` geçen 21 dosya (18'i
migration); canlıda `jwt_role()` **çağıran politika 0**; aynı kalıbı satır içi
taşıyan politika **3** (`storage.objects`, hepsi `roles = {public}`).

## 3 · ⚠ASIL DERS: "uyuyan kapı" — yazıldığı gün değil, başka bir işin yan etkisiyle açılır

Üç politika bugün zararsızdı çünkü koşulları asla doğru olmuyordu. Ama
`roles = {public}` demek **`anon` dahil tüm roller** demektir. Biri ileride JWT'ye
özel bir `role` talebi eklerse (custom access token hook ile mümkün), o üç politika
**aynı anda canlanır** ve oturum açmamış kullanıcıyı da kapsayan bir yazma/silme
yolu açar.

**Sınıf adı: "yeşil görünen ölü kapı."** Ölü bir politika yalnız yer kaplamaz;
**şartlı bir bomba** bırakır. Bu yüzden kural şudur: *bir politika hiçbir şey
vermiyorsa kaldırılır, "zararsız" diye bırakılmaz.*

## 4 · AYNI AD, FARKLI TABLO — silmeden önce şema/tablo yazılır

REC-322 uygulanırken ölçülen tuzak: `product_images_insert_admin`,
`product_images_update_admin`, `product_images_delete_admin` adları **iki farklı
tabloda** yaşıyor.

| Tablo | Durum | Kim yazdı |
|---|---|---|
| `storage.objects` | **ölü** (`roles={public}`, koşul asla doğru değil) | `20250908_storage_product_images.sql` |
| `public.product_images` | **çalışıyor** | `20250909_product_images_rls_reset.sql`, sonra 20260119 / 20260120 / 20260224 |

→ **Kural:** `DROP POLICY` ifadesi **daima** şema ve tabloyla yazılır. Yalnız
politika adına dayanan bir silme, aynı adı taşıyan çalışan bir politikayı siler.
Bu, "ad ölçüt değildir" dersinin RLS'teki hâlidir.

## 5 · FONKSİYON EMEKLİ EDİLİRKEN `CASCADE` YAZILMAZ

`drop function ... cascade` bağlı politikaları da **sessizce** siler. `cascade`
olmadan ise bağımlılık varsa migration **kırmızı yanar**.

→ **Kural:** bir yetki yardımcısı emekli edilirken `cascade` **kullanılmaz.**
Böylece "canlıda çağıran yok" varsayımı yanlışsa sonuç **sessiz yetki kaybı değil,
gürültülü hata** olur. Ölçüme güvenmek yerine **ölçüm yanlışsa kapanan** bir yol
seçilir (fail-closed).

## 5.1 · ⭐DÖRT YAZIM ARANIR — tek yazımı aramak ölçüm değildir

JWT'den `role` talebini okumanın **en az dört** yazımı var. Kapının ilk hâli yalnız
ikisini arıyordu ve Supabase'in **en yaygın kısayolu** sessizce geçiyordu:

| # | Yazım | Durum |
|---|---|---|
| 1 | `current_setting('request.jwt.claims', …)::jsonb ->> 'role'` | aranıyordu |
| 2 | `… jwt.claims ->> 'role'` | aranıyordu |
| 3 | **`auth.jwt() ->> 'role'`** | **kaçıyordu** — depoda gerçek örneği var |
| 4 | **`current_setting('request.jwt.claim.role', …)`** (eski tekil GUC) | **kaçıyordu** |

→ **Kural:** bu sınıfta bir ölçüm yaparken **dört yazım da ayrı ayrı aranır.** Bu,
projedeki *"çağıranı yok iddiası dört kalıbı arar"* dersinin RLS'teki karşılığıdır.

## 5.2 · ⚠EN DERİN KÖR NOKTA: dinamik politika + ikilenmiş tırnak

Bazı migration'lar politikayı **dinamik** üretiyor — ifadeyi bir **metin** olarak bir
yardımcıya veriyor:

```sql
perform public._create_select_policy_if_absent(
  'public','inventory_movements','p_admin_read_inventory',
  'auth.jwt() ->> ''role'' = ''admin'''   -- ⚠tırnaklar İKİLENMİŞ
);
```

SQL metin literalinde tırnak **ikilenir**, yani desen ham metinde `->> ''role''`
olarak görünür ve tek tırnak arayan bir ölçüm onu **görmez.**

⭐**Bu, iki bağımsız ölçümün aynı kör noktayı paylaşmasına örnektir:** bağımsız çürütme
dosyayı buldu, ama **benim ilk ölçümüm de 0 demişti** ve sebebi ben ölçtüm. *İki
bağımsız ölçümün aynı sonucu vermesi, ikisi de aynı kör noktayı paylaşıyorsa
doğrulama değildir.*

→ **Kural:** migration metni ölçülürken **iki normalizasyon** yapılır: yorumlar
çıkarılır **ve** ikilenmiş tırnaklar düzleştirilir.

## 5.3 · ⚠GEREKÇE DÜZELTMESİ — gerçek yükleme yolu `service_role`

İlk yazımda "üç politikayı kaldırmak işlev kaybı üretmez çünkü
`product_images_*_tenant` politikaları taşıyor" demiştim. **Bu gerekçe yanlış
temellendirilmişti.** Bağımsız çürütmede ölçüldü: `product-images` kovasına yazan
kod yolu `src/` altında **yok**; gerçek yükleme iki toplu betikte ve
**`SUPABASE_SERVICE_ROLE_KEY`** ile yapılıyor. O rolde `bypassrls = true`, yani
**hiçbir RLS politikası değerlendirilmiyor** — ne eski admin üçlüsü, ne yeni tenant
üçlüsü.

**Sonuç değişmiyor** (kaldırmak güvenli, hatta daha kuvvetli gerekçeyle: o politikalar
zaten hiçbir akışta kullanılmıyor), ama **gerekçe** düzeltildi. Bir hükmü doğru
sebeple vermek, doğru hükmü yanlış sebeple vermekten farklıdır: yanlış sebep bir
sonraki kararda yanlış yere götürür.

## 6 · KAPI VE SINIRI (adıyla)

**Kapı:** `INV-AUTH-ROLE-2` — `src/__tests__/conformance/rls-yetki-karari.test.ts`.
Hiçbir migration ifadesinde `jwt.claims ->> 'role'` kalıbının **yetki kararı olarak**
geçmemesini arar.

⚠**Kapının ölçüm yüzeyi `supabase/migrations/*.sql` METNİDİR, canlı veritabanı
DEĞİL.** CI'da veritabanı kimliği yok. Yani bu kapı "depoya yeni bir yanlış politika
girmesin" der; **"canlıda yanlış politika yok" DEMEZ.** Canlı taraf ancak elle,
salt-okuma bir `pg_policies` sorgusuyla ölçülür ve o ölçüm bu kapının kapsamı
dışındadır.

## 7 · BORÇ SATIRININ SINIFI — "canlı temiz" borcu KAPATMAZ, SINIFINI değiştirir

Borç defteri (`docs/rls-yetki-karari-borc-ilani.json`) **depo metnini** ölçer; canlı
veritabanı **başka bir yüzeydir** (§6). Bu yüzden canlıda temiz çıkan bir kalemin
satırı defterden **SİLİNMEZ**: silmek kapının bayatlık kolunu (R2) kırmızı yakar ve
dahası kapıyı o dosya için **KÖR** bırakır — silinen ad, kaçak taramasından boşuna
muaf kalır.

Doğru hareket satırı silmek değil, **sınıfını** değiştirmektir. İki sınıf vardır:

| Sınıf | Ne demek | Kapanma yolu |
|---|---|---|
| `ACIK-BORC` | Desen depo metninde duruyor **ve** canlıda yürürlükte. | Düzeltici migration. |
| `TARIHSEL-ILAN` | Desen depo metninde duruyor (tarihsel migration dosyası asla değişmez) ama canlıda yürürlükte **değil**. | Yapılacak bir şey yok; satır yalnız kapıyı kör bırakmamak için durur. |

⚠**`TARIHSEL-ILAN` bir ilan değil bir ÖLÇÜM SONUCUDUR.** Kapının **R4** kolu bu sınıfın
`canli_durumu` alanında `CANLIDA TEMIZ` ibaresini arar; ölçüm yapılmadan sınıf verilemez.
R4'ün sınırı da adıyla yazılı: kol **ölçümün yapıldığı İDDİASINI** ölçer, canlıyı ölçmez
(CI'da kimlik yok) — canlı kanıt ayrı bir belgede durur (`canli_olcum_kaydi` alanı).

## 8 · CANLI ÖLÇÜM YAPILDI (2026-09-14, REC-335)

Recep 2026-09-14'te prod veritabanına salt-okuma izni verdi ve altı borcun tamamı
canlıda ölçüldü: **altısı da `TARIHSEL-ILAN`.** Tam tablo ve yöntem:
`docs/audits/rec335-rls-yetki-borclari-canli-olcum-2026-09-14.md`.

§7'nin önceki hâlinde "ölçülmedi" diye duran iki madde şöyle kapandı:

- **Üç depo politikasının çelişkisi çözüldü:** `storage.objects` üzerinde
  `product_images_insert_admin` / `_update_admin` / `_delete_admin` adlı politika
  **YOKTUR.** Aynı adlardan yalnız `product_images_update_admin`, `public.product_images`
  tablosunda ayaktadır ve gövdesi `user_profiles.role` okur — JWT talebi okumaz. Yani
  2026-09-13 ölçümü **tablo ayırt etmeden ada bakmış**: §4'ün dersi (aynı ad farklı tablo)
  bu kez bir silme tuzağı değil bir **ölçüm** tuzağı olarak işledi.
- **"Bu iş bir şey değiştirdi mi" sorusu cevaplandı: hayır.** REC-322 migration'ının üç
  `drop policy if exists` satırı var olmayan politikaları düşürmeye çalıştı ve sessizce
  geçti. `IF EXISTS` fail-closed niyetiyle **doğru** yazılmıştı; yanlış olan, geçmenin
  değişiklik kanıtı sayılmasıydı.

⚠Hâlâ ölçülmemiş olan: **canlı token denemesi.** Yukarıdaki hüküm `pg_policies` ve
`pg_proc` katalog okumasına dayanır, gerçek bir `anon` / `authenticated` token'ıyla
`select` denemesine dayanmaz. ⛔`service_role` ile yapılan deneme **kanıt sayılmaz** —
o rolde `bypassrls = true`, yani politikalar hiç değerlendirilmez.

⚠Bir yardımcıyı **çağırmak**, doğru kaynağı **okumak** demek değildir: bir politikanın
`is_admin_user()` çağırması tek başına yeşil hükmü vermez, çünkü karar o fonksiyonun
içinde verilir. O yüzden karar mercii hâline gelmiş yardımcıların **tam gövdesi** ayrı
okundu. `is_admin_user` yalnız `claims ->> 'user_role'` ve `app_metadata ->> 'user_role'`
dallarını okuyor, `user_metadata`'yı bilerek okumuyor (CLAUDE.md kural 12).
