-- ROL DEĞİŞİM KAPISI v2 — aktör kontrolü + INSERT yolu
-- Linear: Ref REC-74 (güvenlik) · Şerit: AUTH
--
-- ÖLÇÜLEN BOŞLUK (canlı prod, 2026-08-26):
--   trg_enforce_role_change = BEFORE UPDATE OF role  → INSERT yolu TAMAMEN KAPISIZ.
--   Canlı fonksiyon yalnız "new.id = auth.uid()" dalını koruyor → bir admin BAŞKASININ
--   rolünü super_admin YAPABİLİYOR. user_profiles_update_policy zaten
--   "id = auth.uid() OR is_admin_user()" olduğu için satıra erişimi de var.
--   Yani kodun açıkça yasakladığı şeye (rbac.ts: /admin/users yalnız super_admin) DB izin
--   veriyordu. Arayüz kapısı vardı, DB kapısı YOKTU.
--
-- ZİNCİR — niçin bu kolon kritik:
--   user_profiles.role → custom_access_token_hook → JWT app_metadata.user_role →
--   is_admin_user(). O kolonu yazabilen, bir sonraki jeton tazelemesinde yetkiyi yazmış olur.

begin;

create or replace function public.enforce_role_change()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $fn$
declare
  aktor text;
  ayricalikli boolean;
begin
  -- Hedef rol whitelist'i. ARTIK INSERT'te de koşar (eski sürümde yalnız UPDATE'te vardı).
  if new.role not in ('user','moderator','admin','super_admin','warehouse','sales','viewer') then
    raise exception 'invalid role %', new.role;
  end if;

  -- Rol değişmiyorsa karışma: ad/telefon güncellemeleri ve ON CONFLICT DO UPDATE
  -- (handle_new_user_profile) serbest kalsın.
  if tg_op = 'UPDATE' and new.role is not distinct from old.role then
    return new;
  end if;

  ayricalikli := new.role in ('admin','super_admin');

  -- ============================ OTURUMSUZ BAĞLAM ============================
  -- NİÇİN VAR: profil satırını auth.users üzerindeki trg_handle_new_user_profile
  -- OTURUMSUZ yaratır (auth.uid() NULL); sağlama/göç betikleri de service_role ile koşar.
  --
  -- ÖNCEKİ TASLAK BU DALI KOŞULSUZ SERBEST BIRAKIYORDU. Ölçüm bunun GEREKMEDİĞİNİ
  -- gösterdi: handle_new_user_profile rolü zorla ayrıcalıksız yapıyor —
  --   IF NOT (auth.role()='service_role' OR is_admin_user()) THEN role_val := 'user'
  -- yani sıradan kayıtta rol DAİMA ayrıcalıksız. Dolayısıyla dal, "her oturumsuz bağlam
  -- serbest" olmak zorunda değil; yalnız AYRICALIKLI yazımlar için gevşetilir.
  if auth.uid() is null or coalesce(auth.role(), '') = 'service_role' then

    -- Sıradan kayıt (ayrıcalıksız rol): sessizce geçer, İZ YAZILMAZ.
    -- Niçin iz yok: her signup'a bir denetim satırı yazmak, asıl sinyali (oturumsuz bir
    -- ayrıcalıklı yazım) gürültüde boğar. Okunmayan alarm alarm değildir.
    if not ayricalikli then
      return new;
    end if;

    -- Ayrıcalıklı rol, oturumsuz bağlamda: YALNIZ service_role.
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'oturumsuz baglamda ayricalikli rol atanamaz (%)', new.role;
    end if;

    -- service_role ile ayrıcalıklı yazım: GEÇER, ama iz bırakır.
    --
    -- ⚠ BU İZİN YAZILABİLMESİ, YAZILMAMIŞ BİR ÖZELLİĞE BAĞLI — adıyla yazıyorum:
    -- admin_audit_log RLS AÇIK (rowsecurity=true) ama force=false ve tablo sahibi postgres.
    -- Bu fonksiyon SECURITY DEFINER/owner=postgres olduğu için sahip RLS'i ATLAR ve INSERT
    -- geçer. INSERT politikası ((tenant_id = jwt_tenant_id()) AND is_admin_user()) oturumsuz
    -- bağlamda YANLIŞ'tır. Biri admin_audit_log'a FORCE ROW LEVEL SECURITY verirse bu alarm
    -- SESSİZCE ölür — çünkü aşağıdaki exception guard hatayı WARNING'e indirir.
    -- Kalıcı çözüm bu migration'da değil, bekçi kaleminde.
    --
    -- NİÇİN exception ile sarılı: denetim yazımı patlarsa KAYIT/GÖÇ AKIŞI KIRILMAMALI.
    -- Alarm, korumaya çalıştığı şeyi bozarsa net zarar üretir.
    begin
      insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
      values (
        auth.uid(),                       -- NULL olabilir: kolon nullable, kasıtlı
        'user_profiles',
        new.id::text,
        case when tg_op = 'INSERT' then 'role_insert_service_role' else 'role_change_service_role' end,
        case when tg_op = 'UPDATE' then jsonb_build_object('role', old.role) else null end,
        jsonb_build_object('role', new.role),
        'service_role ile ayricalikli rol yazimi: auth.uid()=' || coalesce(auth.uid()::text, 'NULL'),
        new.tenant_id
      );
    exception when others then
      raise warning 'enforce_role_change: denetim yazimi basarisiz (% - %), rol degisikligi DEVAM ETTI', sqlstate, sqlerrm;
    end;

    return new;
  end if;
  -- ========================== /OTURUMSUZ BAĞLAM ============================

  select role into aktor from public.user_profiles where id = auth.uid();

  -- Kendi rolünü değiştirme: yalnız super_admin (ESKİ KURAL KORUNDU)
  if new.id = auth.uid() and aktor is distinct from 'super_admin' then
    raise exception 'not authorized to change own role';
  end if;

  -- YENİ: super_admin'e YÜKSELTMEYİ yalnız super_admin yapar (hedef kim olursa olsun)
  if new.role = 'super_admin' and aktor is distinct from 'super_admin' then
    raise exception 'only super_admin can grant super_admin';
  end if;

  return new;
end;
$fn$;

drop trigger if exists trg_enforce_role_change on public.user_profiles;
create trigger trg_enforce_role_change
  before insert or update on public.user_profiles
  for each row execute function public.enforce_role_change();

commit;

-- ===========================================================================
-- ⚠ KAPSAM DIŞI — BU KAPI NEYİ ÇÖZMEZ (adıyla yazıyorum, "kapattık" demiyorum)
--
-- 1) ADMIN, BAŞKASINI ADMIN YAPABİLİR. Bu kilit yalnız super_admin vermeyi kısıtlar.
--    rbac.ts /admin/users yüzeyini super_admin'e kapatıyor — yani ürün kuralı "admin,
--    admin üretemez" diyor, DB hâlâ izin veriyor. Mevcut durumdan KÖTÜ değil, ama açık.
--
-- 2) YETKİ DÜŞÜRME ANINDA ETKİLİ DEĞİL. is_admin_user() önce JWT claim'ini okur; jeton
--    hâlâ 'admin' iddia ettiği sürece TRUE döner. Çözüm bu tetikte değil ürün kararında
--    (jeton ömrü / rol değişiminde oturumu sonlandırma). Recep'e iletildi.
--
-- 3) BEKÇİ YOK. Bu kuralı ölçen conformance testi bulunmuyor. Doğru bekçi metin taraması
--    DEĞİL canlı DB'ye bakan kontrol betiğidir; o yüzey EDGE'in claim'inde. Ayrı kalem.
-- ===========================================================================
