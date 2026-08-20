# Cetvel — VIEW yetki hijyeni (db-grant-hygiene)

> Kapsam: `public` semasindaki **VIEW**'lar. Tablolar bu cetvelin konusu DEGILDIR (§2).
> Zorlayici kapi: `src/__tests__/conformance/db-view-grant-hygiene.test.ts` (INV-VIEW-GRANT-1)
> Kaynak olcum: `docs/audits/t101-view-grant-hygiene-2026-08-19.md` (T101-VH)
> v1.0 · 2026-08-19

## 1. Tek cumlelik kural

`public` semasinda bir view olusturan her migration, **ayni dosyada ve CREATE'ten
SONRA**, o view uzerindeki yetkileri `PUBLIC`, `anon`, `authenticated` ve `service_role`
rollerinden **REVOKE ALL** ile geri almak ve gereken okuma yetkisini **adiyla** yeniden
vermek zorundadir. `GRANT SELECT` tek basina **kapi degildir**.

```sql
CREATE VIEW public.ornek WITH (security_invoker = true) AS ...;

REVOKE ALL ON public.ornek FROM PUBLIC;
REVOKE ALL ON public.ornek FROM anon;
REVOKE ALL ON public.ornek FROM authenticated;
REVOKE ALL ON public.ornek FROM service_role;

GRANT SELECT ON public.ornek TO authenticated;   -- gerekiyorsa
GRANT SELECT ON public.ornek TO service_role;    -- gerekiyorsa
```

## 2. Nicin GRANT tek basina hicbir sey yapmaz

Olculdu (2026-08-19, prod `pg_default_acl`, sema `public`, objtype `r`):

```
anon=arwdDxtm  authenticated=arwdDxtm  service_role=arwdDxtm
```

Sekiz yetkinin tamami (INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES,
TRIGGER, MAINTAIN) **varsayilan ayricalik** olarak tanimlidir. Yani public semasinda
dogan her tablo ve her view bu yetkileri kendiliginden tasir. Migration'a yazilan
`GRANT SELECT ... TO authenticated` satiri, rolun zaten sahip oldugu bir yetkiyi
yeniden vermekten ibarettir: **etkisiz**. Durumu degistirebilen tek ifade `REVOKE`'tur.

Bu, bu depoda bir "sanki" degil, olculmus bir vakadir: `view_admin_returns`
(20260818130000) migration'i "view'a YALNIZ SELECT verilir" diye yazilmis, sonucta
`authenticated` uzerinde sekiz yetki olusmustur.

## 3. Nicin tablo ile view ayni kurala tabi degil

Supabase'in guvenlik modeli tabloda **iki katmanlidir**: yetki genis birakilir, kapi
RLS politikasidir. Bu kasitlidir ve varsayilan ayricaliklar **degistirilmemelidir** —
degistirmek tablolarin tamamini kirar.

VIEW'in **kendi RLS politikasi yoktur**. Bir view'da erisimi belirleyen tek sey
GRANT'tir (`security_invoker` yalnizca ALTTAKI tablonun RLS'ini kimin kimligiyle
degerlendirilecegini soyler; view'in kendisine erisimi kapatmaz). Dolayisiyla:

| Nesne | Kapi | Varsayilan genis yetki |
|---|---|---|
| Tablo | RLS politikasi | kabul edilir (model boyle) |
| View  | **GRANT** | **kabul edilmez** — tek tek geri alinir |

## 3.1 Tablonun kapisi ACIK KALABILIR: politika OKUYAN ROLE yazilmamis olabilir

Yukaridaki tablo "tabloda kapi RLS politikasidir" diyor. Eksik olan sey su: **politika
var olmasi yetmez, OKUYAN ROLU kapsamasi gerekir.** Kapsamiyorsa sorgu hata vermez —
bos doner. Yuzey "kayit yok" gosterir, log temizdir, kimse bakmaz.

**Olculmus vaka (2026-08-20, canli prod).** `client_errors` tablosunda iki politika var:
`merged_client_errors_service_role_select` ve `service_role_only`. **Ikisi de yalniz
`service_role` icin.** `authenticated` icin SELECT'e izin veren tek politika yok — ve
admin hata sayfasi bu tabloyu `authenticated` ile okuyor. Sonuc: **39 gercek hata,
ekranda SIFIR.** Kardes tablo `error_groups` ayni sinifta degil, cunku onun politikasi
`authenticated` + `is_admin_user()`.

Yazma yolu saglikliydi: hata kaydeden uc `service_role` ile yaziyor, yani boru CALISIYOR.
Bozuk olan yalniz **pencere**. Gozlemlenebilirlik yuzeyinde en pahali bicim budur: sistem
"hata yok" der, cunku hatalari GOSTEREMEZ — gormedigi icin degil.

### Kuralin iki kez daraltilmasi (kapi tasarimi icin kritik)

Bu sinifi olcen kural iki kez yanlis kuruldu; ikisi de rakamla curudu:

| Kural | Bulgu | Niçin yanlis |
|---|---|---|
| "RLS acik + GRANT var + politika YOK" | 1 tablo | `client_errors`'i **kacirir** (orada politika VAR, ama yanlis rol icin) |
| "(komut, rol) bazli kapsama yok" | 16 cift | Cogu **dogru tasarim**: `payment_transactions`'ta `authenticated`, `suppliers`/`purchase_orders`'ta `anon` zaten okumamali |
| **"kodda okuyan yuzey VAR + okuyan rolun politikasi YOK"** | **1 bulgu** | dogru: kesisim, gurultuyu sifirlar |

**Cikarim — cetvele giren asil cumle:** politika yoklugu **tek basina kusur degildir**,
cogu zaman guvenli haldir (varsayilan ACL genis, RLS dogru sekilde engeller). Kusur,
**kodun okudugu ile DB'nin izin verdigi ayrildiginda** dogar. Bu yuzden bu soru semaya
tek basina sorulamaz; **kod ile kesistirilmeden sorulursa gurultu uretir ve kapi susturulur.**

### Bekci

`scripts/db/checks/rls-role-coverage.mjs` (INV-RLS-COVERAGE-1) — yonetim yuzeylerinin
`.from()` ile okudugu tablolari cikarir, canli semada `authenticated` icin SELECT'e izin
veren politika olup olmadigina bakar, tabanin disindaki her yeni ihlalde kirmizi olur.
Taban `rls-role-coverage-baseline.json`, her satiri gerekce + kapanis kosulu tasir ve
**yalniz kucululur**. Olcemedigi hallerde (baglanti yok, kod taramasi bosaldi) kapi
**yesil DONMEZ**, cikis 2 verir.

**Kapsam disi ve nicin:** Edge fonksiyonlari `service_role` ile okur, RLS onlari
ilgilendirmez. Vitrin (`anon`) yuzeyleri ayri bir sorudur — oradaki bosluk "veri siziyor
mu"dur, "bos mu gorunuyor" degil; ayni kapiya sikistirilmasi iki soruyu da bulaniklastirir.

## 3.2 Politika VAR ve rolu KAPSIYOR — ama yuklemi hangi aileden?

§3.1 "politika okuyan rolu kapsiyor mu" diye soruyor. Bekci de yalnizca bunu soruyor:
yuklemin **icine bakmaz**. Bu bilincli bir darliktir, ama bir bedeli var ve bedeli burada
yaziyoruz: **ayni "kapsiyor" cevabi, iki farkli mekanizmayi ortuyor.**

**Olculdu (2026-08-20, canli katalog `pg_policies` + `pg_get_functiondef`).** Siniflandirma
**(tablo, komut)** basinadir, tablo basina DEGIL: asagidaki tablo yalnizca **SELECT/ALL**
politikalarini kapsar. Ayni tablonun yazma politikasi baska bir aileden olabilir ve
cogu zaman oyledir (ornek: `products` okuma tarafinda rol yuklemi tasimazken yazma
tarafinda profil JOIN'i kullanir). "Bu tablo A ailesinden" cumlesi **eksiktir**; dogru
cumle "bu tablo SELECT'te A ailesinden"dir.

| Aile | Yuklem nasil karar veriyor | Tablolar (SELECT/ALL) |
|---|---|---|
| **A — JWT iddiasi** | `is_admin_user()`, rolu **token claim**'inden okur | `admin_audit_log`, `data_subject_requests`, `error_groups`, `shipping_email_events`, `user_profiles`, `venthub_orders`, `venthub_quotes`, `venthub_quote_items`, `venthub_returns` |
| **B — profil JOIN** | `is_user_admin(uid)` ya da `EXISTS ... user_profiles`, rolu **her sorguda tablodan** okur | `brands`, `coupons`, `inventory_movements`, `order_notes`, `price_lists`, `pricing_policy`, `purchase_orders`, `site_settings`, `suppliers` |
| **C — yalniz tenant** | rol yuklemi **hic yok**, sadece `tenant_id` | `categories`, `currency_rates`, `inventory_settings`, `product_images`, `products`, `brands` (genel okuma) |

### Olcum yontemi aileye gore secilir

Sahte kimlik takarak olcme yontemi (`request.jwt.claims` doldur + `set local role
authenticated` + satir say) **yalniz A ailesinde gecerlidir**. B ailesinde sahte `uid`'in
`user_profiles`'ta satiri olmadigi icin yuklem **her zaman false** doner: tablo dolu olsa
ve rol dogru olsa bile sonuc 0 satirdir. Yani B ailesindeki her "bu rol hicbir sey
goremiyor" sonucu **olcum degil, yontem artifaktidir**.

Negatif kontrol bu korlugu **gizler**: "admin'de true, moderator'de false" kontrolu
A ailesinden secilirse gecer ve B ailesindeki korluk hakkinda hicbir sey soylemez.
**Kontrol kolu, kor olunan aileden secilmelidir.**

### Iki aile bagimsiz iki otorite DEGILDIR

Her ikisinin de nihai kaynagi ayni kolondur: `user_profiles.role`. Fark **kaynakta degil
zamandadir**, ve mekanizma canli govdelerden okundu:

- `custom_access_token_hook` **token uretilirken** `user_profiles`'tan rolu okuyup claim'e
  basar (profil satiri yoksa `user` damgalar — fail-closed).
- Dolayisiyla **A ailesi rolun token anindaki halini** gorur ve token yenilenene kadar
  **donmus** kalir; **B ailesi her sorguda yeniden** degerlendirir.

**BULGU — davranisla kapatildi (2026-08-20, canli prod, salt-okunur, geri alindi).**
Cikarim once fonksiyon govdelerinden turetildi, sonra **uc kolla** olculdu; ayni kimlik,
yalniz claim ile profil uyusmazligi degistirildi:

| Kol | Durum | A ailesi | B ailesi |
|---|---|---|---|
| S1 | Jeton ESKI-DUSUK rol tasiyor, profil YUKSEK (yukseltme jetona islememis) | `false` | `true` |
| S2 | Jeton ESKI-YUKSEK rol tasiyor, profil desteklemiyor (**dusurme** jetona islememis) | **`true`** | `false` |
| Kontrol | claim ile profil UYUMLU | `true` | `true` |

**Kontrol kolu sarttir:** onsuz "bu iki fonksiyon zaten hep ayrisir" denebilirdi. Uyumluyken
ikisi de ayni cevabi veriyor — demek ki ayrisma fonksiyonlardan degil **uyusmazligin
kendisinden** geliyor.

Iki sonuc:

1. **Bolunmus beyin.** Rol degistiginde A ailesindeki dokuz yuzey eski rolle, B ailesindeki
   dokuz yuzey yeni rolle cevap verir. Ne hata ne uyari cikar; sadece bazi ekranlar dolu,
   bazilari bos gorunur.
2. **Yetki dusurme A ailesinde ANINDA ETKILI DEGILDIR (S2).** Jeton hala `admin` iddia
   ettigi surece `is_admin_user()` **true** donmeye devam eder — profil artik desteklemese
   bile. Yaricapi yukaridaki A listesidir: dokuz tablo.

**Olculmeyen, acikca:** bayat claim'in **ne kadar sure** tasindigi. Jeton TTL'i ve yenileme
davranisi auth servisindedir, DB'den olculemez. Dogru cumle: *pencere VAR ve uzunlugu jeton
yenilenmesine baglidir*; "X dakika" **denemez**.

**Siddet kalibrasyonu:** bugun sistemde rol degistirilecek kullanici yok (`user_profiles` =
2 satir, ikisi de `super_admin`), yani pencere bugun **hic acilmiyor — LATENT**. Faz-2 /
bayi acilisindan once kapatilmalidir. Cozum bu cetvelin isi degildir ve iki secenek de urun
karari ister: jeton omrunu kisaltmak, ya da rol degisiminde oturumu zorla sonlandirmak
(refresh token iptali).

### Uyari — A/B ayriminin kendi onkosulu var

Bu ayrim, "**JWT icinde `user_role` claim'i VAR**" varsayimina dayanir; claim'i basan sey
`custom_access_token_hook`'tur. Hook'un **var oldugu** ve `supabase_auth_admin`'in EXECUTE
yetkisinin bulundugu olculdu — ama bunlar **vekildir, kanit degil**: izin verilmis olup hook
panelde kapali olabilir ve `auth` semasinda bunu gosteren bir yapilandirma tablosu yoktur.
Kesin test gercek bir oturumun jetonuna bakmaktir; **SQL'den dogrulanamaz**.

Hook kapaliysa claim hic basilmaz, `is_admin_user()` ilk daldan gecemez ve **profil aramasina
duser** — yani gercek oturumlarda A ailesi de fiilen B gibi calisir. Bu durumda sahte-claim
ile yapilan her olcum, gercek kullanicinin **hic girmedigi** bir yolu olcmus olur. Bu yuzden
A/B ayrimina dayanan her hukum, hook'un durumunu **olculmemis onkosul** olarak yaninda
tasimalidir.

## 4. Tehlike sinifi: latent yetki

Bugun bir view'a yazilamiyor olmasi, yetkinin zararsiz oldugu anlamina gelmez.
2026-08-19 olcumunde alti view de (a) otomatik guncellenebilir degil, (b) INSTEAD OF
tetigi yok, (c) `security_invoker`, (d) `anon`/`authenticated` NOLOGIN. Bu dortlu
bugun yazmayi imkansiz kilar.

Ama duran yetki, kosul degisince **kendiliginden** is gorur:

- view sadelesir (tek tablo, aggregate yok) -> otomatik guncellenebilir hale gelir,
- birisi INSTEAD OF tetigi ekler -> yazma yolu acilir,
- `security_invoker` bir gun dusurulur -> alt tablonun RLS'i devreden cikar.

Bu adimlarin hicbiri "yetki acmak" gibi gorunmez; kimse bir kapiyi acmaz, zaten acik
duran kapi is gormeye baslar. Bu yuzden yetki, tehlike goruldugunde degil, **view
dogdugunda** kapatilir.

## 5. Ne verilir

- `authenticated` -> yalnizca `SELECT`, ve yalnizca arayuz o view'i **okuyorsa**.
- `service_role`  -> yalnizca `SELECT` (sunucu tarafi okuma).
- `anon`          -> **hicbir sey**. Vitrin bir admin view'ini okumaz; okumasi
  gerekiyorsa o zaten admin view'i degildir.
- `PUBLIC`        -> **hicbir sey**. Gelecekte tanimlanacak roller PUBLIC'ten miras alir.
- INSERT/UPDATE/DELETE -> **view'a asla**. Yazma yolu her zaman tablodur.
  (Istisna gerekiyorsa: INSTEAD OF tetigi + bu cetvele ADIYLA muafiyet satiri.)

## 6. Bugunku sicil (2026-08-19 olcumu, T101 migration'i oncesi)

| View | anon | authenticated | Durum |
|---|---|---|---|
| `admin_users` | 7 yetki (SELECT yok) | 7 yetki (SELECT yok) | fazla |
| `inventory_summary` | 7 yetki (SELECT yok) | 8 yetki | fazla |
| `inventory_velocity` | 7 yetki (SELECT yok) | 8 yetki | fazla |
| `reserved_orders` | — | SELECT | **temiz** |
| `view_admin_orders` | 7 yetki (SELECT yok) | 8 yetki | fazla |
| `view_admin_returns` | — | 8 yetki | fazla |

Hedef durum `supabase/migrations/20260819103000_view_grant_hygiene.sql` ile kurulur;
`admin_users`'in `authenticated` icin SELECT'siz olmasi 20250910 hardening'inin bilincli
karari oldugundan **geri verilmez**.

## 7. Kapinin kapsami ve muafiyet

INV-VIEW-GRANT-1 statik bir kapidir: `supabase/migrations/**.sql` icinde view olusturan
her dosyayi tarar ve §1 desenini arar. Kapinin **goremedigi** iki sey vardir, durustce
yazilir:

1. **Canli DB durumu.** Statik tarama dosyaya bakar, prod'a bakmaz. Canli olcumu
   migration'in kendi dogrulama blogu (§3 adimi) ve elle `pg_class.relacl` sorgusu yapar.
2. **Gecmis dosyalar.** Uygulanmis migration DEGISTIRILEMEZ. Bu yuzden view olusturan
   yedi eski dosya kapida **ADIYLA** muaftir; muafiyet listesi test dosyasinda gerekcesiyle
   durur ve **buyumez** — yeni bir dosya listeye eklenmeden kapiyi gecemez.

Muafiyet listesine dosya eklemek bir karardir, kolaylik degildir: PR'da gorunur ve
gerekce ister.
