-- T047 · Rolün TEK otoritesi: public.user_profiles.role
--
-- KUSUR (prod'dan okundu, 2026-08-18):
--   `is_admin_user()` COALESCE zincirinin 3. dalı `claims -> 'user_metadata' ->> 'role'`
--   okuyordu. `user_metadata` KULLANICININ KENDİ YAZABİLDİĞİ alandır (supabase-js
--   `updateUser({ data: {...} })`). Yani bir kullanıcı kendi JWT'sine `role: "admin"`
--   yazdırıp yetki fonksiyonunu geçebilirdi. CLAUDE.md kural 12: yetki kararları
--   `app_metadata` üzerinden, ASLA `raw_user_meta_data` üzerinden verilmez.
--
-- BUGÜN NİÇİN SÖMÜRÜLMÜYOR (ve niçin yine de kapatıyoruz):
--   `custom_access_token_hook` her oturum açmada `claims.user_role` yazıyor ve o hiçbir
--   zaman NULL olmuyor (profil yoksa 'user' basıyor). COALESCE 1. dalda kısa devre
--   yaptığı için 3. dala BUGÜN hiç ulaşılmıyor — yani açık LATENT.
--   Ama latent bir açık, kapalı bir açık değildir: hook devre dışı kalırsa (yapılandırma
--   hatası, Supabase tarafı değişiklik, kurtarma senaryosu) 3. dal ANINDA canlanır ve
--   o an kimse fark etmez. Fail-open bir yetki yolu, sessizce beklemesiyle tehlikelidir.
--
-- SIRA KRİTİK: önce VERİ, sonra FONKSİYON. Ters sırada, aşağıdaki iki hesap bir an için
-- `user_metadata`'daki `super_admin` beklentisini kaybetmiş ama profilde henüz
-- yükseltilmemiş olurdu.

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) VERİ — iki yönetici hesabının GERÇEK rolü profile yazılır
-- ─────────────────────────────────────────────────────────────────────────────
-- Bu hesapların `user_metadata.role` alanı zaten 'super_admin' diyordu ve
-- `src/config/admin.ts` içindeki sabit e-posta listesi de onlara arayüzde
-- 'super_admin' veriyordu; ama TEK otorite olması gereken `user_profiles.role`
-- 'admin' idi. Üç kaynak çelişiyordu. Sahibi (Recep) 2026-08-18'de doğruladı:
-- iki hesap da ona ait ve super_admin olmalı.
--
-- `trg_enforce_role_change` engellemiyor: "kendi rolünü değiştirme" kilidi
-- `new.id = auth.uid()` ile çalışır, migration bağlamında `auth.uid()` NULL'dur.
update public.user_profiles p
set role = 'super_admin'
from auth.users u
where u.id = p.id
  and u.email in ('recep.varlik@gmail.com', 'recepvarlk@gmail.com')
  and p.role <> 'super_admin';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) ÖLÜ VERİ — `raw_app_meta_data.role` anahtarını temizle
-- ─────────────────────────────────────────────────────────────────────────────
-- Değeri 'superadmin' (ALT ÇİZGİSİZ) idi ve hiçbir kod onu okumuyor: hook
-- `app_metadata.user_role` yazar, `is_admin_user()` de onu okur. Yani bu alan
-- bugün etkisiz. TEHLİKESİ İLERİDE: biri "kural 12 app_metadata der" deyip bu
-- anahtara geçerse, 'superadmin' hiçbir role eşleşmez (`rbac.ts` UserRole birliği
-- 'super_admin' yazar) ve yönetici SESSİZCE yetkisiz kalır. Yanlış yazılmış ölü
-- veri, doğru kurala uyan gelecekteki değişikliği sabote eder.
update auth.users
set raw_app_meta_data = raw_app_meta_data - 'role'
where raw_app_meta_data ? 'role';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) FONKSİYON — 3. dalı KALDIR (kök atış)
-- ─────────────────────────────────────────────────────────────────────────────
-- Kalan zincir: hook'un yazdığı iki dal, ardından JWT'siz bağlamlar (tetik/betik)
-- için DB fallback'i. `user_metadata` artık HİÇBİR yoldan yetki üretmez.
--
-- W2 BİLİNÇLİ OLARAK BU PAKETTE DEĞİL: fonksiyon `SECURITY INVOKER` (varsayılan) ve
-- fallback dalı `public.user_profiles` okuyor; çağıranın o satırı okuma hakkı yoksa
-- fallback sessizce false döner. Bunu DEFINER'a çevirmek fonksiyonun GÜVEN DURUŞUNU
-- değiştirir ve aynı PR'da iki güvenlik semantiğini birden oynatmak yanlış olur.
-- Ayrı karar olarak açık bırakıldı (plan §7 E2) ve cetvele yazıldı.
create or replace function public.is_admin_user()
returns boolean
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- service_role tüm kontrolleri atlar
  IF auth.role() = 'service_role' THEN
    RETURN TRUE;
  END IF;

  claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;

  IF claims IS NOT NULL THEN
    -- YALNIZ hook kaynaklı dallar. `user_metadata` BİLEREK YOK — kullanıcı yazabilir
    -- (CLAUDE.md kural 12). Bu satırı geri eklemek INV-AUTH-ROLE R1'i kırar.
    user_role := COALESCE(
      claims ->> 'user_role',
      claims -> 'app_metadata' ->> 'user_role'
    );
    IF user_role IS NOT NULL THEN
      RETURN user_role IN ('admin', 'super_admin');
    END IF;
  END IF;

  -- JWT yoksa (tetik/betik bağlamı) profil tablosuna düş
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin','super_admin')
  );
END;
$function$;

commit;
