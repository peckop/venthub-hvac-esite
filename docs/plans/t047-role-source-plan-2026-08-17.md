# T047 — `is_admin_user()` Kök-Atış Planı + Rol Kaynağı Hizalaması (T048)

> **İş emri:** OPS-AUDIT ataması, 2026-08-17 · **Kaynak:** 20-madde denetimi #0 · memory `auth-role-source-hazard`
> **Bu belge PLAN'dır — kod/migration yazılmadı.** Uygulama Recep paketinde.
> **Yöntem:** prod DB salt-okuma (fonksiyon gövdeleri, politika sayımı, `auth.users` metadata) + kaynak okuma.

## TL;DR — üç cümle

1. Kusur doğrulandı: `is_admin_user()`'ın 3. COALESCE dalı **kullanıcının kendi yazabildiği**
   `user_metadata.role`'ü okuyor ve **erken dönüyor** (DB fallback'ine hiç varmıyor).
2. **LATENT'i tutan tek şey** `custom_access_token_hook`'un `claims.user_role`'ü **daima**
   yazması (profil yoksa `'user'`); 1. dal hep dolu olduğu için 3. dala varılmıyor. Hook devre
   dışı kalırsa/çalışmazsa dal **canlı yetki yükseltmesine** döner.
3. Ölçüm sırasında **denetimde olmayan daha büyük bir hizasızlık** çıktı: rolün **DÖRT** kaynağı
   var ve canlı iki kullanıcıda **çelişiyorlar** (UI `super_admin`, DB `admin`).

---

## 1. Kusur — birebir gövde (prod'dan okundu)

```
user_role := COALESCE(
  claims ->> 'user_role',                    -- 1) hook yazıyor (güvenilir)
  claims -> 'app_metadata' ->> 'user_role',  -- 2) hook yazıyor (güvenilir)
  claims -> 'user_metadata' ->> 'role'       -- 3) ⚠ KULLANICI YAZABİLİR
);
IF user_role IS NOT NULL THEN
  RETURN user_role IN ('admin', 'super_admin');   -- ⚠ erken dönüş: fallback'e VARILMAZ
END IF;
```

`user_metadata`, JWT'de `raw_user_meta_data`'nın karşılığıdır ve kullanıcı onu
`supabase.auth.updateUser({ data: { role: 'admin' } })` ile **kendi değiştirebilir**. Kural 12
tam bunu yasaklıyor ("yetki kararları `app_metadata` üzerinden; asla `raw_user_meta_data`").

**Neden bugün patlamıyor:** `custom_access_token_hook` her token üretiminde
`claims.user_role`'ü yazıyor — profil satırı yoksa bile `'user'` koyuyor. Yani 1. dal asla NULL
değil ve 3. dal **ulaşılamaz**.

**Hook'un etkin olduğu ölçüldü — ama bu oturumda değil.** Ben SQL'den yalnız fonksiyonun *var
olduğunu* görebildim; *çağrıldığı* GoTrue yapılandırmasında ve DB'den okunamıyor. OPS-AUDIT
teyidi: **hook'un AÇIK olduğu 2026-08-15'te ölçümle doğrulandı** (memory `auth-role-source-hazard`);
T047'nin "LATENT" hükmü zaten o ölçüme dayanıyor.

⚠️ Buna rağmen **uygulama günü bir kez daha gözle teyit** şart (Dashboard → Auth → Hooks):
kusurun zararsızlığının TAMAMI tek bir yapılandırma anahtarına bağlı ve o anahtar bu depodan
denetlenemiyor. "Açıktı" da ölçülen andan ibarettir — platform iddiaları her iki yönde bayatlar.
Kapı R4 bu yüzden hook'un GÖVDESİNİ zorlar: hook iki claim'i de yazdığı sürece W1'den sonra
sistem **fail-closed** olur (rol çözülemezse admin DEĞİL).

## 2. Patlama yarıçapı (ölçüldü)

| | Değer |
|---|---|
| `is_admin_user()` kullanan RLS politikası | **26** |
| Etkilenen tablo | **14** |
| Çağıran diğer DB fonksiyonu | **3** |

Yani bu fonksiyon, veri katmanının ana yetki kapısı; değişikliği geniş ama tek noktadan.

## 3. Denetimde OLMAYAN bulgu: rolün DÖRT kaynağı ve canlı çelişki

| # | Kaynak | Nerede | Bugünkü değer (2 kullanıcı) |
|---|---|---|---|
| K1 | **Sabit e-posta allowlist'i** | `src/config/admin.ts:45-53` — DB'ye bakmadan önce, iki e-posta için `super_admin` döndürüyor | `super_admin` |
| K2 | `user_profiles.role` | hook'un ve istemci fallback'inin okuduğu yer | **`admin`** |
| K3 | `user_metadata.role` (kullanıcı yazabilir) | `is_admin_user()` 3. dal | **`super_admin`** |
| K4 | `app_metadata.user_role` | JWT'ye hook enjekte eder; `raw_app_meta_data`'da **saklanmıyor** | `null` (kalıcı depoda) |

**Ölçülen çelişki:** iki canlı kullanıcının ikisinde de `user_metadata.role = super_admin`
ama `user_profiles.role = admin`. Hook profili okuduğu için **JWT `admin` taşıyor**; istemci ise
K1 allowlist'i yüzünden `super_admin` gösteriyor.

**Somut sonucu:** UI izni ⊃ DB izni. `rbac.ts` `super_admin`e özel yetkiler tanımlıyor
(ör. `/admin/users` yalnız `super_admin`); istemci o ekranı **açıyor**, ama RLS/RPC yalnız
`admin` görüyor. Bu, [[two-correct-patterns-wrong-intersection]] sınıfı: iki taraf ayrı ayrı
"doğru", kesişim sessiz-boş üretir. Bugün fark edilmemesinin sebebi `is_admin_user()`'ın
`admin`i de geçirmesi — yani super_admin'e özel bir DB kapısı henüz yok.

## 4. Planlanan değişiklik

### W1 — 3. dalı KALDIR (kök-atış, migration)

`is_admin_user()` yeniden tanımlanır; COALESCE yalnız hook-kaynaklı iki dalı tutar, ardından
DB fallback'i gelir:

```
user_role := COALESCE(
  claims ->> 'user_role',
  claims -> 'app_metadata' ->> 'user_role'
);
```

**Kilitleme riski ölçüldü ve YOK:** dal kaldırılınca, JWT'si olan kullanıcılar için karar
hook'un yazdığı `user_role`'e (yani `user_profiles.role`) düşer; JWT'si olmayan bağlamlar
(tetik/betik) zaten fallback'e gidiyor. Bugünkü 2 kullanıcının profil rolü `admin` → ikisi de
admin kalır. **Kimse yetkisini kaybetmez.**

⚠️ Ancak: bugün `user_metadata.role = super_admin` olduğu için, biri "super_admin'im" diye
davranıyorsa o beklenti K2'ye (`admin`) düşer — bu bir **düzeltme**, ama sürpriz olmaması için
W3 ile birlikte gitmeli.

### W2 — `SECURITY DEFINER` ve fallback semantiği gözden geçir

`is_admin_user()` şu an **DEFINER değil** (invoker). Fallback dalı `public.user_profiles`
okuyor; çağıran kullanıcının o satırı okuma hakkı yoksa fallback **sessizce false** döner.
Bugün zararsız görünüyor (fallback yalnız JWT'siz bağlamlarda çalışıyor) ama plan bunu
**açıkça karara bağlamalı**: ya DEFINER yapılır ya fallback'in yalnız JWT'siz bağlamda
çalıştığı cetvele yazılır. Sessiz-false bir yetki fonksiyonunda kabul edilemez bir belirsizlik.

### W3 — Rol kaynağını TEKE indir (T048 hizalaması)

**Hedef: tek otorite `user_profiles.role`; diğerleri ondan TÜREYİR.**

| Kaynak | Karar |
|---|---|
| K1 sabit e-posta allowlist'i | **Kaldırılacak** — kodda gömülü yetki, repo PUBLIC ve rol değişimi deploy gerektiriyor. Kaldırmadan önce: bu e-postaların `user_profiles.role`'ü **`super_admin`e yükseltilmeli**, aksi halde Recep kendi panelinden düşer. **Sıra kritik: önce veri, sonra kod.** |
| K2 `user_profiles.role` | **TEK OTORİTE** (korunuyor; `trg_enforce_role_change` tetiği onu koruyor) |
| K3 `user_metadata.role` | **Temizlenecek** (yetki anlamı kaldırılacak); yalnız görsel/eski veri. Silinmesi kullanıcı yazabildiği için kalıcı garanti değil — **garanti, okuyan tarafın olmamasıdır** (W1) |
| K4 `app_metadata.user_role` | hook türetiyor, korunuyor (kural 12'nin istediği yer) |

### W4 — Cetvel + kapı

- `docs/standards/auth-account-standard.md`'e "rolün tek otoritesi" bölümü: dört kaynak,
  hangisi türev, hangisi yasak; hook'un rolü; fallback semantiği.
- **INV-AUTH assert'leri:**

| # | Assert | Yakaladığı |
|---|---|---|
| R1 | Migration metninde `is_admin_user` gövdesi `user_metadata` **içermez** | kök-atışın geri gelmesi |
| R2 | Kaynak kodda yetki kararı için `user_metadata`/`raw_user_meta_data` okuyan yol yok (çağrı-bazlı, yorum sıyırmalı) | kural 12 ihlalinin yeniden doğması |
| R3 | `src/config/admin.ts`'te sabit e-posta→rol eşlemesi yok | K1'in geri gelmesi |
| R4 | `custom_access_token_hook` gövdesi `user_role` **ve** `app_metadata.user_role` yazar (ikisi de) | 1./2. dalın dayanağı kaybolursa W1 fail-closed olur |

## 5. Sabotaj listesi

| # | Sabotaj | Beklenen |
|---|---|---|
| S1 | `is_admin_user`'a `user_metadata` dalını geri ekle | R1 KIRMIZI |
| S2 | Bir bileşende `user.user_metadata.role === 'admin'` kontrolü yaz | R2 KIRMIZI |
| S3 | `admin.ts`'e e-posta→`super_admin` eşlemesi geri koy | R3 KIRMIZI |
| S4 | Hook'tan `app_metadata.user_role` yazımını sil | R4 KIRMIZI |
| S5 | Yorum içine `user_metadata` yaz (yalnız yorumda) | R1/R2 **YEŞİL** kalmalı — yorum-sıyırma çalışıyor mu (ters kanıt) |

## 6. Uygulama sırası (bozulursa kilitlenme riski)

1. **Ölç:** hook Auth yapılandırmasında etkin mi (gözle, Dashboard).
2. **Veri:** iki yönetici e-postasının `user_profiles.role`'ünü hedef değere getir (`super_admin`
   gerekiyorsa) — `trg_enforce_role_change` tetiğinin izin verdiği yolla.
3. **Migration:** `is_admin_user()` yeniden tanımı (W1 + W2 kararı).
4. **Kod:** K1 allowlist'ini kaldır (W3), kapılar (W4).
5. **Doğrula:** iki kullanıcı ile gerçek oturum → `/admin` ve `/admin/users` davranışı; 26
   politikanın en az bir temsilcisinde okuma testi.

**Adım 2 atlanırsa Recep kendi panelinden düşer.** Bu planın en kırılgan yeri budur.

## 7. KARAR GEREKİYOR

| # | Karar | Kim | Durum |
|---|---|---|---|
| E1 | İki yönetici e-postası `user_profiles.role` = `super_admin` mi `admin` mi olacak? (K1 kaldırılınca gerçek rol bu olacak) | **Recep** | Recep paketine 6. madde olarak girdi (OPS-AUDIT); öneri: ÖNCE DB'de rol düzelt, SONRA allowlist kaldır |
| E2 | `is_admin_user()` `SECURITY DEFINER` olsun mu, yoksa fallback "yalnız JWT'siz bağlam" diye cetvele mi yazılsın (W2) | OPS-AUDIT / Recep |
| E3 | `user_metadata.role` alanı kullanıcı kayıtlarından temizlenecek mi (kozmetik, yetki etkisi W1'den sonra sıfır) | OPS-AUDIT |
| E4 | Bu plan tek pakette mi (migration + kod + veri) yoksa veri→migration→kod olarak üç adımda mı merge edilecek | **Recep** (migration = prod) |

## 8. Kapsam DIŞI

`trg_enforce_role_change` tetiğinin kendisi (çalışıyor, dokunulmuyor) · admin UI rol değiştirme
akışı (ADMIN-CUSTOMER, #580'de onay kapısı eklendi) · tenant_id'nin `app_metadata`'ya taşınması
(A10, EDGE şeridi) · edge fonksiyonlarındaki ölü `superadmin` yazımı (M4, EDGE şeridi).
