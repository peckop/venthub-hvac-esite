# RLS Yetki Kararı Cetveli — bir politika "bu kullanıcı yönetici mi" sorusunu nereden okur

**Sürüm 1.0 · 2026-09-14 · Şerit: ALTYAPI · Kaynak: REC-322 (REC-321 adım 1 ölçümünden çıktı)**

Bu cetvel tek bir soruya cevap verir: **bir RLS politikası ya da yetki yardımcısı,
uygulama rolünü (admin / moderator / user) hangi JWT talebinden okur.** Cetvel
yazılmadan önce bu sorunun yazılı tek kaynağı yoktu; iki fonksiyon iki farklı
yerden okuyordu ve hangisinin doğru olduğu yalnız birinin kod yorumunda yazıyordu.

## 1 · KURAL (tek satır)

> **Uygulama rolü kararı yalnız `public.is_admin_user()` üzerinden verilir.**
> `request.jwt.claims ->> 'role'` **Postgres rolüdür** (`anon` / `authenticated` /
> `service_role`) ve **yetki kararı için okunmaz.**

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

## 6 · KAPI VE SINIRI (adıyla)

**Kapı:** `INV-AUTH-ROLE-2` — `src/__tests__/conformance/rls-yetki-karari.test.ts`.
Hiçbir migration ifadesinde `jwt.claims ->> 'role'` kalıbının **yetki kararı olarak**
geçmemesini arar.

⚠**Kapının ölçüm yüzeyi `supabase/migrations/*.sql` METNİDİR, canlı veritabanı
DEĞİL.** CI'da veritabanı kimliği yok. Yani bu kapı "depoya yeni bir yanlış politika
girmesin" der; **"canlıda yanlış politika yok" DEMEZ.** Canlı taraf ancak elle,
salt-okuma bir `pg_policies` sorgusuyla ölçülür ve o ölçüm bu kapının kapsamı
dışındadır.

## 7 · ÖLÇÜLMEDİ, ADIYLA YAZILI

- **Canlı token denemesi yapılmadı:** "bu üç politika gerçekten hiç eşleşmiyor"
  iddiası iki fonksiyonun gövde tutarsızlığına dayanıyor; canlı bir `anon` /
  `authenticated` token'ıyla tek bir `select` denemesi iddiayı kesinleştirir.
  ⛔`service_role` ile yapılan deneme **kanıt sayılmaz** — o rolde
  `bypassrls = true`, yani politikalar hiç değerlendirilmez.
- **Üç politikanın canlıda hâlâ var olup olmadığı 2026-09-14'te doğrulanamadı:**
  deponun geçmişi 2026-05-30'da düşürüldüklerini, REC-322'nin 2026-09-13 ölçümü
  hâlâ durduklarını söylüyor. Çelişki açık. Migration `IF EXISTS` kullandığı için
  iki hâlde de güvenli, ama **"bu iş bir şey değiştirdi mi" sorusu cevapsız.**
