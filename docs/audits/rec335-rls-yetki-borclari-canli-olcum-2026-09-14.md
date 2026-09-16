# REC-335 — RLS yetki borclarinin CANLI olcumu (2026-09-14)

> **Ne olctuk:** `docs/rls-yetki-karari-borc-ilani.json` surum 2'deki ALTI borcun canli
> veritabanindaki karsiligi. Ilan, depo metnini olcen bir kapiya (INV-AUTH-ROLE-2) bagli;
> alti satirin BESINDE `canli_durumu` alani "OLCULMEDI" ya da "CELISKILI" yaziyordu.
> Bu belge o alani KAPATIR.
>
> **Yetki:** Recep 2026-09-14'te prod veritabanina SALT-OKUMA izni verdi. Bu belgedeki her
> sorgu SELECT'tir; hicbir yazma yapilmadi. Cetvel: `docs/standards/rls-yetki-karari-standard.md`.

## 1. Olcum yontemi ve kor nokta yonetimi

Uc bagimsiz sorgu kosuldu:

1. `pg_policies` uzerinde **tum semalar** (sema suzgeci YOK — `public`, `storage`, `realtime`
   satirlari geldi), gövde `(qual || with_check)` icinde `jwt|claims` arandi.
2. `pg_proc` uzerinde **iki farkli suzgecle**: once `jwt-ish VE tirnakli 'role'`, sonra
   sadece `jwt|claim` (daha genis evren, 14 fonksiyon). Ikinci olcum birincinin kor noktasini
   kapatmak icin kosuldu: `current_setting('request.jwt.claim.role')` yaziminda `role`
   kelimesi tirnak ICINDE degildir, o yuzden birinci suzgec onu GORMEZDI.
3. Karar merci haline gelmis yardimcilarin (`is_admin_user`, `is_user_admin`) **tam gövdesi**
   ayri okundu — bir politikanin `is_admin_user()` cagirmasi tek basina "dogru kaynak" demek
   DEGILDIR; kararin nereden alindigi fonksiyonun icinde.

Bu ucuncu adim bilerek eklendi: `[[iki-olcum-ayni-kor-nokta-dogrulama-degil]]` dersi bugun
ikinci kez uygulandi — ayni desenle iki kez olcmek tek olcumdur.

## 2. Sonuc tablosu

| # | Ilan edilen dosya | Iddia | CANLI olcum | Hukum |
|---|---|---|---|---|
| 1 | `202508270945_enable_rls_public.sql` | `inventory_movements` politikasi `auth.jwt() ->> 'role'` okuyor | `inventory_movements_select_admin` gövdesi: `tenant_id = jwt_tenant_id() AND is_user_admin(auth.uid())` | CANLIDA TEMIZ |
| 2 | `20250902_create_stock_rpc_functions.sql` | Stok RPC'leri `jwt.claims ->> 'role'` ile admin/moderator karsilastiriyor | `jwt|claim` gecen 14 fonksiyonun HICBIRI ham `role` talebinden yetki karari vermiyor | CANLIDA TEMIZ |
| 3 | `20250902_fix_products_update_permissions.sql` | `products` UPDATE ayni yanlis talebi okuyor | `products` uzerinde ham talep okuyan politika YOK | CANLIDA TEMIZ |
| 4 | `20250902_inventory_and_stock.sql` | Envanter/stok politikalarinda ayni yanlis talep | `inventory_settings` ve `inventory_movements` politikalari `is_user_admin()` kullaniyor | CANLIDA TEMIZ |
| 5 | `20250908_product_images.sql` | `public.product_images` admin politikalari ayni yanlis talep | Uc addan YALNIZ `product_images_update_admin` ayakta; gövdesi `user_profiles.role IN (admin, super_admin)` — JWT talebi OKUMUYOR | CANLIDA TEMIZ |
| 6 | `20250908_storage_product_images.sql` | `storage.objects` uzerindeki uc admin politikasi ayni yanlis talep — UYUYAN KAPI | Uc adin HICBIRI `storage.objects` uzerinde YOK. Ayakta olan alti depo politikasi `jwt_tenant_id()` + `user_profiles.role` kullaniyor | CANLIDA TEMIZ |

## 3. CELISKI COZULDU (REC-322'nin acik kalan tek maddesi)

REC-322, `storage.objects` uzerindeki uc admin politikasi icin **celiskili iki kayit**
tasiyordu: depo gecmisi `20260530224000` ile dusuruldugunu soyluyordu, 2026-09-13 tarihli
canli olcum ise "hala duruyor" diyordu. Bugunun olcumu celiskiyi kapatir:

**`storage.objects` uzerinde `product_images_insert_admin` / `_update_admin` / `_delete_admin`
adli politika YOKTUR.** Ayni adlardan yalnizca `product_images_update_admin`, `public.product_images`
tablosunda ayaktadir. Yani 2026-09-13 olcumu **tablo ayirt etmeden ada bakmis** ve
`public.product_images` satirini `storage.objects` satiri sanmistir.

Bu, ilanin `_ne_ogrendik` bolumunde zaten yazili olan dersin sahada ikinci kez dogrulanmasidir:
**ayni ad farkli tablo.** Ders once bir DROP tuzagi olarak yazilmisti; simdi bir OLCUM tuzagi
olarak da ayni yerden isliyor. Politika sorgusu sema+tablo secmeden hukum vermez.

Yan sonuc: REC-322 migration'inin `drop policy if exists` satirlari **var olmayan** uc politikayi
dusurmeye calisti ve sessizce gecti. Migration YANLIS DEGILDI (fail-closed niyetiyle `if exists`
yazilmisti) ama **hicbir seyi de degistirmedi**. "Migration prod'a uygulandi ve yesil gecti"
cumlesi, o migration'in bir sey DEGISTIRDIGI anlamina gelmez.

## 4. `jwt_role` — bagimsiz ikinci dogrulama

`pg_proc` uzerinde `public.jwt_role` sorgulandi: **satir donmedi.** Dun REC-322 ile emekli
edilen fonksiyon canlida yok. Bu, dunku dogrulamadan bagimsiz ikinci bir olcumdur (dun kanit
"drop CASCADE'siz gecti" idi, bugun kanit "katalogda yok").

## 5. BORC KAPANDI MI? — hayir, SINIFI DEGISTI

Buradaki ayrim onemli ve ilanin kendisini duzeltir.

Borc defteri **depo metnini** olcer (`supabase/migrations/*.sql`), canliyi olcmez — ilanin
`_olcum_yuzeyi` alani bunu acikca yaziyor. Canlinin temiz olmasi, o alti dosyanin METNINDE
desenin durdugunu degistirmez. Ilan satirlarini SILMEK, kapinin bayatlik kolunu KIRMIZI
yakar ve dahasi kapiyi o dosyalar icin KOR birakir.

O yuzden satirlar KALIR ama artik iki ayri sinif vardir:

- **ACIK BORC:** desen depo metninde duruyor **ve** canlida da yururlukte. Kapanmasi icin
  duzeltici bir migration gerekir. *Bugun bu sinifta kalem YOK.*
- **TARIHSEL ILAN:** desen depo metninde duruyor (tarihsel migration dosyasi asla degismez)
  ama canlida yururlukte DEGIL. Kapanmasi icin yapilacak bir sey yoktur; satir yalnizca
  kapiyi kor birakmamak icin durur.

Alti kalemin ALTISI da bugun TARIHSEL ILAN sinifindadir. Ilan surum 3'te her satira `sinif`
alani eklendi ve `canli_durumu` olculen degerle degistirildi.

## 6. Bu olcumun SINIRLARI

- Olcum **bir andir.** Yarin bir migration ham talep okuyan bir politika kurarsa bu belge
  bayatlar. Kapi (INV-AUTH-ROLE-2) depo metnini her kosumda olctugu icin YENI ihlali yakalar;
  yakalamadigi sey, canlida ELLE yapilan bir degisikliktir.
- Olcum **yetki kararini** aradi, JWT kullanimini degil. `jwt_tenant_id()` ve
  `jwt_price_segment()` JWT'den okur ama yetki karari vermez (tenant kapsami ve fiyat segmenti);
  bunlar kapsam disidir ve kapsam disi olduklari BILEREK boyle yazildi.
- `custom_access_token_hook` ve `handle_new_user_metadata` talebi YAZAN taraftir, karar veren
  taraf degil. Ikisi de `app_metadata`/hook dallarini kullaniyor; `user_metadata` okumuyorlar
  (CLAUDE.md kural 12). Bu dogrulandi ama bu isin kapsami DEGIL — kendi kapisi INV-AUTH-ROLE R1.
- `service_role` `is_admin_user()` icinde kosulsuz TRUE doner. Bu kasitli ve dogrudur
  (`bypassrls = true` oldugu icin zaten RLS degerlendirilmez), ama **`service_role` uzerinden
  yapilan hicbir test bir politikanin kanitini vermez.**
