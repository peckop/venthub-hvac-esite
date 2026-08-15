# Yetki Katmanı Denetimi — `is_admin_user()` ve rol kaynakları — 2026-08-15

> **Şerit:** LAUNCH (oturum `eda80084`) · **Kapsam:** salt-okuma. Prod DB sorgulandı, **hiçbir veri
> yazılmadı**; tek "aktif" işlem `set_config('request.jwt.claims', …, true)` ile sahte claim
> kurup fonksiyonu çağırmaktı — işlem-yerel (`is_local = true`), kalıcı etkisi yok.
> **Tetikleyici:** `SUPABASE_ACCESS_TOKEN` yenilendi (`T030-VH`) → registry'de *"token gelince
> `get_advisors` bir kez tam geçilmeli"* diye bekleyen madde koşuldu.
> **Yöntem:** her iddia ya prod sorgusu ya kontrol gruplu bir ölçüm.

## 0. Tek cümlelik cevap

Advisor'ın bağırdığı 6 `SECURITY DEFINER` uyarısı **yanlış alarm** (üç katman savunma doğrulandı) —
ama advisor'ın **hiç bakmadığı** yerde koşullu-kritik bir açık var: `is_admin_user()` son çare
olarak **kullanıcının kendi yazabildiği** `user_metadata.role` alanını okuyor.

---

## 1. 🔴 G1 · `is_admin_user()` kullanıcı-yazabilir alandan rol okuyor (KOŞULLU KRİTİK)

**Kod (prod'dan okundu):**

```sql
user_role := COALESCE(
  claims ->> 'user_role',                    -- 1) hook'un enjekte ettiği
  claims -> 'app_metadata' ->> 'user_role',  -- 2) app_metadata (kural 12'nin otoritesi)
  claims -> 'user_metadata' ->> 'role'       -- 3) ⚠️ KULLANICININ KENDİ YAZDIĞI
);
IF user_role IS NOT NULL THEN
  RETURN user_role IN ('admin', 'super_admin');
END IF;
```

Üçüncü dal `raw_user_meta_data`'ya karşılık gelir. Supabase'de bunu **kullanıcının kendisi**
yazabilir: `supabase.auth.updateUser({ data: { role: 'super_admin' } })`. CLAUDE.md kural 12 bunu
açıkça yasaklıyor: *"Yetki kararları `app_metadata` üzerinden (**asla** `raw_user_meta_data`)"*.

**Ölçüm — kontrol gruplu, salt-okuma:**

| Senaryo | `is_admin_user()` |
|---|---|
| A · `user_metadata.role = 'super_admin'`, `app_metadata` boş | **TRUE** |
| B · KONTROL: `user_metadata.role = 'user'` | FALSE |
| C · KONTROL: `user_metadata.role = 'admin'` | TRUE |

B'nin FALSE dönmesi aracın ölçtüğünü gösteriyor; fonksiyon gerçekten bu dala göre karar veriyor.

`is_admin_user()` düzinelerce RLS politikasında ve admin RPC'lerinde kullanılıyor — yani bu tek
fonksiyon, yetki yüzeyinin tamamının kapısı.

### Sömürülebilirlik tek bir anahtara bağlı

`public.custom_access_token_hook` **açıksa**: hook `claims.user_role`'u **daima** dolduruyor
(profil satırı yoksa bile `'user'` yazıyor) → COALESCE ilk dalda durur → üçüncü dala **hiç
inilmez** → sömürülemez. Hook iyi yazılmış; `supabase_auth_admin` üzerinde `EXECUTE` yetkisi var
(ölçüldü), bu da bağlı olduğuna işaret ediyor.

`custom_access_token_hook` **kapalıysa**: ilk iki dal NULL kalır ve üçüncü dal devreye girer.
Herhangi bir kayıtlı müşteri tarayıcı konsolunda tek satırla kendini `super_admin` yapabilir.

**Hook'un açık olup olmadığı SQL'den okunamıyor** — Supabase Auth dashboard ayarı, `config.toml`'da
da yok. **→ Recep doğrulamalı: Dashboard › Authentication › Hooks › Customize Access Token.**

### Bu "teorik" değil — sistem bugün o dala dayanıyor olabilir

```
kullanıcı              app_metadata.user_role   user_metadata.role   user_profiles.role
recep.varlik@…         NULL                     super_admin          admin
recepvarlk@…           NULL                     super_admin          admin
```

Her iki kullanıcının **`raw_app_meta_data`'sı NULL** — yani kural 12'nin "tek otorite" saydığı alan
**boş**. (Sebebi anlaşılıyor: `handle_new_user_metadata` tetikleyicisi `BEFORE INSERT` çalışıyor,
bu iki hesap ondan önce açılmış.) Hook kapalıysa bugün admin erişimi **yalnızca** güvensiz daldan
geliyor demektir.

### Önerilen düzeltme

Üçüncü dalı kaldır; `user_metadata` hiçbir koşulda yetki kaynağı olmasın. DB araması (`user_profiles`)
zaten son çare olarak duruyor ve doğru olan o. **Bu bir migration** → CLAUDE.md kural 13 gereği
master'a merge = prod'a otomatik uygulama, **Recep onayı şart**.

Dikkat: dalı kaldırmak, hook kapalıyken mevcut iki hesabın admin erişimini de keser (app_metadata
boş, DB araması `user_profiles.role='admin'` → aslında **çalışır**). Yine de sıra önemli: **önce
hook durumunu doğrula**, sonra migration.

---

## 2. 🟡 G2 · Rolün üç ayrı kaynağı var ve üçü de farklı cevap veriyor

Yukarıdaki tablo aynı zamanda bir SSOT sorunu: `app_metadata` (NULL) · `user_metadata`
(`super_admin`) · `user_profiles` (`admin`). Üçü senkronize **edilmiyor**: prod'da
`raw_app_meta_data`'ya yazan yalnız iki kayıt tetikleyicisi var (`handle_new_user_metadata`,
`handle_new_user_profile`) ve ikisi de **yalnız INSERT** anında çalışıyor.

Sonuç: `set_user_admin_role()` ile bir kullanıcı terfi ettirilince `user_profiles.role` değişir ama
JWT tarafındaki iddia **eskisi kalır**. Hook açıksa bir sonraki token yenilemesinde düzelir; kapalıysa
hiç düzelmez. Edge fonksiyonları JWT okur, DB fonksiyonları tabloyu okur → **iki yetki yüzeyi
birbirinden ayrışabilir**.

---

## 3. ✅ G3 · Advisor'ın 6 `SECURITY DEFINER` uyarısı — yanlış alarm, gerekçesi artık yazılı

Advisor `adjust_stock` ×2, `set_stock` ×2, `admin_list_users`, `set_user_admin_role` için
*"authenticated bunu çağırabiliyor"* diyor. Çağırabiliyor, ama **yetki alamıyor**. Üç katman
doğrulandı:

1. **Fonksiyon gövdelerinde rol kapısı** var (`service_role` VEYA `user_profiles.role IN (…)`).
2. **`trg_enforce_role_change`** (`BEFORE UPDATE OF role`): kullanıcı kendi rolünü değiştiremez —
   `new.id = auth.uid()` ise ve kendisi zaten `super_admin` değilse `raise exception`.
3. **Kayıt tetikleyicileri** rolü zorla `'user'` yapıyor (`service_role`/admin değilse).

Ayrıca INSERT ile kendine profil uydurma yolu da kapalı: `user_profiles.id` **PK**, ve
`trg_handle_new_user_profile` (`AFTER INSERT on auth.users`) her kullanıcıya satırı zaten açıyor —
prod'da **profilsiz kullanıcı = 0** (ölçüldü). Yani ikinci bir INSERT çakışır.

> Bu maddeyi yazma sebebim: advisor bu 6 uyarıyı **her taramada** verecek. Gerekçe yazılı olmazsa
> ya her seferinde yeniden araştırılır ya da "zaten yanlış alarm" denip **gerçekten değiştiği gün**
> de gözden kaçar. G1 ile karıştırılmasın: G1 aynı fonksiyonların *guard*'ında değil,
> `is_admin_user()`'ın kendisinde.

---

## 4. Bilinen, tekrar açılmasın

| # | Bulgu | Durum |
|---|---|---|
| G4 | `_migration_ledger` RLS açık, 0 politika (advisor INFO) | Açık — migration gerekir, Recep onayı (`canliya-alma-hazirlik` §S2) |
| G5 | Leaked password protection kapalı (advisor WARN) | **Kapatılamaz** — ücretsiz planda yok. Kalıcı gürültü kabul edildi. |

---

## 5. Bu denetimin sınırları

- **Hook'un açık olup olmadığı ölçülemedi.** SQL'den okunamıyor; dashboard ayarı. G1'in şiddeti
  tamamen buna bağlı — "kritik" ile "latent kod kokusu" arasındaki fark bu tek anahtar.
- **Gerçek bir hesapla sömürü denenmedi.** Denemek prod'da bir kullanıcıyı yetkilendirmek demekti;
  yapılmadı ve onaysız yapılmamalı. Ölçüm, fonksiyonun sahte claim'e verdiği cevapla sınırlı.
- **Performans advisor'ı bu turda okunmadı** (güvenlik tarafı öne alındı).
- Kapsam yalnız yetki/rol katmanı; RLS politikalarının tamamı tek tek gözden geçirilmedi.
