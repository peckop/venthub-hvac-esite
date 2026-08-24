# T101-VH — VIEW yetki ölçümü (prod, 2026-08-19)

> Şerit: LEGAL-SEO · İş emri: OPS-AUDIT 07:23 broadcast
> Kaynak bulgu: ADMIN şeridi, 06:10 — "admin view'larında authenticated'da SELECT dışı 6 yetki"
> Cetvel: `docs/standards/db-grant-hygiene-standard.md` · Kapı: INV-VIEW-GRANT-1
> Onarım taslağı: `supabase/migrations/20260819103000_view_grant_hygiene.sql` (**merge = Recep kapısı**)

## 1. Bulgu doğrulandı, mekanizma başka yerdeydi

ADMIN'in bulgusu **doğru**: `authenticated` rolü admin view'larında SELECT dışında
yetkiler tutuyor. Ölçüm bunu onayladı ve bir adım öteye gitti — kusur tek tek
migration'larda **değil**, şemanın varsayılan ayrıcalıklarındaydı.

```sql
select defaclrole::regrole, defaclnamespace::regnamespace, defaclobjtype,
       array_to_string(defaclacl,' | ') from pg_default_acl;
```

Sonuç (şema `public`, objtype `r` = tablo + view; hem `postgres` hem `supabase_admin` verici):

```
anon=arwdDxtm/…   authenticated=arwdDxtm/…   service_role=arwdDxtm/…
```

`arwdDxtm` = INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN —
**sekizin tamamı**. Yani public şemasında doğan her view bu yetkileri kendiliğinden
taşır ve migration'daki `GRANT SELECT ... TO authenticated` satırı **hiçbir şeyi
değiştirmez**; rolün zaten sahip olduğu bir yetkiyi yeniden verir. Durumu değiştiren
tek ifade `REVOKE`'tur.

Bunun en net kanıtı deponun **en özenli** view migration'ıdır: `view_admin_returns`
(20260818130000) yorumunda açıkça "view'a YALNIZ SELECT verilir" der ve gerçekten
`GRANT SELECT` + `REVOKE ALL ... FROM anon` yazar. Prod'daki sonuç: anon temiz
(REVOKE işini yaptı), `authenticated` **sekiz yetki** (GRANT hiçbir şey yapmadı).
Niyet doğruydu, araç yanlıştı.

## 2. Yetki tablosu (ölçüm anı: 2026-08-19, onarım öncesi)

`pg_class.relacl` üzerinden `aclexplode` ile:

| View | anon | authenticated | service_role |
|---|---|---|---|
| `admin_users` | 7 (SELECT **yok**) | 7 (SELECT **yok**) | 8 |
| `inventory_summary` | 7 (SELECT yok) | **8** | 8 |
| `inventory_velocity` | 7 (SELECT yok) | **8** | 8 |
| `reserved_orders` | — (kayıt yok) | **SELECT** | 8 |
| `view_admin_orders` | 7 (SELECT yok) | **8** | 8 |
| `view_admin_returns` | — (kayıt yok) | **8** | 8 |

`reserved_orders` tek temiz satırdır ve deseni kanıtlar: orada SELECT dışı yetkiler
bir noktada geri alınmış.

`public` şemasında materyalize view yok (`relkind='m'` boş).

## 3. Tehlike sınıfı: LATENT — ve nedeni ölçüldü

"Fazla yetki var" tek başına "açık var" demek değildir. Yazmanın bugün **neden**
imkânsız olduğu tek tek ölçüldü:

| Ölçüm | Sonuç | Anlamı |
|---|---|---|
| `pg_relation_is_updatable` | altı view de **0** | otomatik güncellenebilir değil |
| INSTEAD OF tetiği | altı view de **yok** | yazma yolu açan tetik yok |
| `reloptions` | altı view de `security_invoker` | alt tablo RLS'i çağırana göre uygulanır |
| `pg_roles.rolcanlogin` | anon/authenticated **false** | bu rollerle ham SQL bağlantısı açılamaz |
| `has_schema_privilege(…, 'CREATE')` | anon/authenticated **false** | public'te fonksiyon/tetik yaratamazlar |

Yani bugün `INSERT INTO view_admin_returns …` denemesi hata verir; PostgREST DDL kabul
etmediği için de tetik eklenemez.

**Ama merdiven kısa.** `authenticated` rolü bu view'larda TRIGGER yetkisi tutuyor ve
çalıştırabildiği 11 tetik fonksiyonu var (ölçüldü). Duran yetkinin canlanması için
"birinin kapı açması" gerekmiyor; şu üç değişiklikten **herhangi biri** yeter:

1. view sadeleşir (tek tablo, aggregate yok) → otomatik güncellenebilir hale gelir,
2. bir migration INSTEAD OF tetiği ekler → yazma yolu açılır,
3. `security_invoker` bir gün düşürülür → alt tablonun RLS'i devreden çıkar.

Üçü de "yetki açmak" gibi görünmez. Zaten açık duran şey iş görmeye başlar.

## 4. Onarım neyi bozar (ölçüldü: hiçbir şeyi)

Uygulamanın bu altı view'a **tek dokunuşu okumadır**:

`resourceSearchers.ts` · `OrdersTableBody` · `AdminOrdersBoard` · `AdminLogisticsTableBody`
· `ReturnsTableBody` · `InventoryTableBody` · `AdminDashboardPage` · `useInventoryDetail`
— hepsi `.select(...)`. Yazma yolları doğrudan tabloya gider.

`admin_users` view'ını kod **hiç okumuyor** (yalnız `database.types.ts` içinde tip
olarak geçiyor) — `authenticated` için SELECT'in 20250910'da alınmış olmasıyla tutarlı.
Bu yüzden SELECT geri **verilmez**.

Tarihsel not: `20260225_admin_orders_search_view.sql` `view_admin_orders`'a
`GRANT SELECT, INSERT, UPDATE, DELETE` veriyor. Bu yazma niyeti **hiç çalışmadı** —
view otomatik güncellenebilir değil ve kodda o view'a yazan bir çağrı yok. Ölü niyet
olarak kapatılıyor.

## 5. Varsayılan ayrıcalıklara niçin dokunulmadı

`ALTER DEFAULT PRIVILEGES` ile sekizli miras kesilebilirdi. Yapılmadı: Supabase modelinde
**tabloda** kapı RLS politikasıdır, geniş GRANT kasıtlıdır. Varsayılanı değiştirmek
tablo tarafını topluca kırardı ve bu iş emrinin kapsamı da değildi.

VIEW'in kendi RLS politikası yoktur — orada kapı yalnızca GRANT'tır. Bu yüzden ayrım
cetvele madde olarak yazıldı (§3) ve view'lar tek tek kapatıldı.

## 6. Teslim edilen

| Ürün | Yol |
|---|---|
| Cetvel | `docs/standards/db-grant-hygiene-standard.md` (v1.0) |
| Kapı | `src/__tests__/conformance/db-view-grant-hygiene.test.ts` — INV-VIEW-GRANT-1, 6 iddia |
| Migration taslağı | `supabase/migrations/20260819103000_view_grant_hygiene.sql` |
| Ölçüm | bu dosya |

Kapı iki kasıtlı sabotajla sınandı (ikisi de **kırmızı** verdi, onarımdan sonra yeşile döndü):

1. REVOKE'suz yeni bir view migration'ı eklendi → R1 dört rolü de adıyla saydı.
2. Hijyen migration'ından bir view adı düşürüldü → R3 yakaladı.

## 7. Açık kalan

- **Migration merge'i Recep kapısıdır** (kural 13: merge = prod'a otomatik uygulama).
  Bu PR migration içerdiği için yeşil olsa da kendi kendime almam.
- Migration kendi doğrulama bloğunu taşır: uygulandıktan sonra anon'da yetki kalırsa
  ya da authenticated'da SELECT dışı yetki kalırsa **hata verip geri alır**. Yani
  "SUCCESS" satırı değil, nesnenin kendi durumu ölçülür.
- Statik kapı canlı DB'yi göremez. İleride bir adım gerekirse doğru yer
  `db-advisor.yml` benzeri bir periyodik ölçümdür — bu iş emrinin kapsamında değil,
  kapsam dışı olarak not düşülüyor.
