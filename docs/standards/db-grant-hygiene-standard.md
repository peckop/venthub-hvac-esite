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
