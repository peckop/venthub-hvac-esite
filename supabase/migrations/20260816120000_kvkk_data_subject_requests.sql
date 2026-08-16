-- KVKK veri sahibi talepleri: kayıt defteri + anonimleştirme mekanizması (T063-VH)
-- Cetvel: docs/standards/legal-compliance-standard.md §3
--
-- NİÇİN "SİLME" DEĞİL "ANONİMLEŞTİRME"
--   Bir müşterinin "verilerimi silin" talebi sipariş ve fatura kayıtlarını KAPSAMAZ:
--   bu kayıtlar VUK/TTK gereği saklanmak zorundadır ve sitenin kendi KVKK metni de
--   `retentionOrders` süresi boyunca saklanacağını beyan eder. KVKK m.7, saklama
--   yükümlülüğü bulunan verinin silinmeyeceğini kabul eder.
--   Bu yüzden mekanizma iki ayrı şey yapar: saklama yükümlülüğü OLMAYAN veriyi siler,
--   yükümlülük altındaki kaydı ELLEMEZ ve bunu talep kaydına gerekçesiyle yazar.
--   Kısmi ret, KVKK'da meşrudur — ama veri sahibine GEREKÇESİYLE bildirilmek zorundadır;
--   `retained_data_note` alanı tam olarak bu bildirimin kaynağıdır.
--
-- ⚠️ BU MIGRATION PROD'A OTOMATİK UYGULANIR (CLAUDE.md kural 13). Merge = uygulama.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Talep defteri
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.data_subject_requests (
  id uuid primary key default gen_random_uuid(),

  -- Başvuran kayıtlı kullanıcı olmayabilir (eski müşteri, vekil, üçüncü kişi).
  -- Kullanıcı silinirse talep kaydı KALIR: 30 günlük süre ve sonucu ispat yükümüzdür.
  user_id uuid references auth.users(id) on delete set null,

  -- Başvurunun geldiği adres. Kimlik tevsikinin ilk ayağı: sistemde kayıtlı adresten
  -- gelen başvuru için ek belge istenmez (Tebliğ).
  applicant_email text not null,

  request_type text not null check (
    request_type in ('access','rectification','erasure','portability','objection','restriction')
  ),

  status text not null default 'received' check (
    status in ('received','identity_pending','in_progress','completed','rejected')
  ),

  received_at timestamptz not null default now(),
  -- KVKK: en geç 30 gün. Sayaç BAŞVURU anından işler, kimlik tevsikinden değil.
  due_at timestamptz not null default (now() + interval '30 days'),
  identity_verified_at timestamptz,
  completed_at timestamptz,

  -- Ne yapıldı / neden reddedildi (veri sahibine verilen yanıtın özeti).
  outcome text,
  -- Hangi veri SAKLANDI ve hangi hukuki sebeple. Kısmi ret bildiriminin kaynağı.
  retained_data_note text,

  handled_by uuid references auth.users(id),
  tenant_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.data_subject_requests is
  'KVKK m.11 veri sahibi talepleri. 30 günlük süre ve sonucun ispatı için tutulur.';
comment on column public.data_subject_requests.retained_data_note is
  'Saklama yükümlülüğü nedeniyle SİLİNMEYEN veri ve hukuki dayanağı — kısmi ret bildirimi.';

create index if not exists idx_dsr_status_due on public.data_subject_requests (status, due_at);
create index if not exists idx_dsr_user on public.data_subject_requests (user_id);

alter table public.data_subject_requests enable row level security;

-- Yalnız admin. Veri sahibi kendi talebini panelden görmez — başvuru kanalı e-posta/KEP'tir
-- ve self-servis bir yüzey KVKK'nın istediği bir şey değildir (cetvel §3.1).
drop policy if exists p_dsr_admin_all on public.data_subject_requests;
create policy p_dsr_admin_all on public.data_subject_requests
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

revoke all on table public.data_subject_requests from anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Anonimleştirme
-- ─────────────────────────────────────────────────────────────────────────────
--
-- VARSAYILAN KURU ÇALIŞMADIR (p_dry_run = true). Geri alınamaz bir işlemin yanlışlıkla
-- tetiklenmesi, tetiklenmemesinden çok daha pahalıdır; çağıranın niyetini AÇIKÇA
-- belirtmesi gerekir. Kuru çalışma, gerçek çalışmayla birebir aynı raporu üretir.
create or replace function public.anonymize_user_personal_data(
  p_user_id uuid,
  p_request_id uuid default null,
  p_dry_run boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_retention_years int := 10;   -- VUK/TTK · legal.ts retentionOrders ile aynı olmalı
  v_cutoff timestamptz := now() - make_interval(years => v_retention_years);
  v_email text;
  v_rapor jsonb;
  v_saklanan int;
  v_anonim_siparis int;
  v_adres int; v_fatura_profil int; v_sepet int; v_proje int; v_sihirbaz int; v_iletisim int;
begin
  if p_user_id is null then
    raise exception 'p_user_id zorunlu';
  end if;

  -- Yetki: bu fonksiyon SECURITY DEFINER'dır, kapı gövdededir.
  if not public.is_admin_user() then
    raise exception 'forbidden: yalnız yönetici anonimleştirebilir';
  end if;

  select email into v_email from auth.users where id = p_user_id;

  -- Saklama yükümlülüğü ALTINDAKİ siparişler: ELLENMEZ.
  select count(*) into v_saklanan
  from public.venthub_orders
  where user_id = p_user_id and created_at >= v_cutoff;

  -- Saklama süresi DOLMUŞ siparişler: kişisel alanlar anonimleştirilir; tutar, tarih ve
  -- kalemler KORUNUR — muhasebe gerçeği silinmez, yalnız kişiyle bağı koparılır.
  select count(*) into v_anonim_siparis
  from public.venthub_orders
  where user_id = p_user_id and created_at < v_cutoff;

  select count(*) into v_adres from public.user_addresses where user_id = p_user_id;
  select count(*) into v_fatura_profil from public.user_invoice_profiles where user_id = p_user_id;
  select count(*) into v_sepet from public.shopping_carts where user_id = p_user_id;
  select count(*) into v_proje from public.user_projects where user_id = p_user_id;
  select count(*) into v_sihirbaz from public.wizard_selections where user_id = p_user_id;
  select count(*) into v_iletisim from public.contact_messages
   where v_email is not null and lower(email) = lower(v_email);

  v_rapor := jsonb_build_object(
    'user_id', p_user_id,
    'dry_run', p_dry_run,
    'silinen', jsonb_build_object(
      'user_addresses', v_adres,
      'user_invoice_profiles', v_fatura_profil,
      'shopping_carts', v_sepet,
      'user_projects', v_proje,
      'wizard_selections', v_sihirbaz
    ),
    'anonimlestirilen', jsonb_build_object(
      'user_profiles', 1,
      'contact_messages', v_iletisim,
      'venthub_orders', v_anonim_siparis
    ),
    'saklanan', jsonb_build_object(
      'venthub_orders', v_saklanan,
      'sebep', format('VUK/TTK saklama yükümlülüğü — %s yıl', v_retention_years),
      'cutoff', v_cutoff
    )
  );

  if p_dry_run then
    return v_rapor || jsonb_build_object('uygulandi', false);
  end if;

  -- ── Saklama yükümlülüğü OLMAYAN veri: silinir ────────────────────────────
  delete from public.user_addresses where user_id = p_user_id;
  delete from public.user_invoice_profiles where user_id = p_user_id;
  delete from public.shopping_carts where user_id = p_user_id;  -- cart_items CASCADE
  delete from public.user_projects where user_id = p_user_id;
  delete from public.wizard_selections where user_id = p_user_id;

  -- ── Kalması gereken kayıtlarda kişisel alanlar ────────────────────────────
  update public.user_profiles
     set full_name = null, phone = null, updated_at = now()
   where id = p_user_id;

  if v_email is not null then
    -- `email` ve `name` NOT NULL (2026-08-16'da prod şemasından doğrulandı) — NULL'a
    -- ÇEKİLEMEZ. İlk yazımı `email = null` idi ve migration temiz uygulanırdı; hata
    -- ancak ilk gerçek KVKK talebinde ortaya çıkardı. Bu yüzden kimliksizleştirici
    -- sabit bir değer yazılıyor; satır kimliği ekleniyor ki farklı kişilerin mesajları
    -- aynı adreste birleşip "tek kişi" gibi görünmesin.
    update public.contact_messages
       set name = '[ANONİMLEŞTİRİLDİ]',
           email = 'anonim+' || id::text || '@kvkk.local',
           phone = null,
           ip_address = null
     where lower(email) = lower(v_email);
  end if;

  -- ── Saklama süresi DOLMUŞ siparişler ──────────────────────────────────────
  update public.venthub_orders
     set customer_name  = '[ANONİMLEŞTİRİLDİ]',
         customer_email = null,
         customer_phone = null,
         shipping_address = jsonb_build_object('anonim', true),
         billing_address  = jsonb_build_object('anonim', true),
         invoice_info     = jsonb_build_object('anonim', true),
         updated_at = now()
   where user_id = p_user_id and created_at < v_cutoff;

  insert into public.admin_audit_log (actor, table_name, row_pk, action, after, comment)
  values (
    auth.uid(), 'data_subject_requests', coalesce(p_request_id::text, p_user_id::text),
    'anonymize', v_rapor,
    'KVKK anonimleştirme — saklama yükümlülüğü altındaki siparişler korundu'
  );

  if p_request_id is not null then
    update public.data_subject_requests
       set status = 'completed',
           completed_at = now(),
           handled_by = auth.uid(),
           retained_data_note = case
             when v_saklanan > 0 then format(
               '%s adet sipariş/fatura kaydı, VUK/TTK %s yıllık saklama yükümlülüğü nedeniyle '
               || 'silinmemiştir. Süre dolduğunda anonimleştirilir.', v_saklanan, v_retention_years)
             else null end,
           updated_at = now()
     where id = p_request_id;
  end if;

  return v_rapor || jsonb_build_object('uygulandi', true);
end;
$$;

comment on function public.anonymize_user_personal_data(uuid, uuid, boolean) is
  'KVKK silme talebi: saklama yükümlülüğü olmayan veriyi siler, sipariş/fatura kaydını korur. '
  'Varsayılan KURU ÇALIŞMA — uygulamak için p_dry_run => false.';

revoke all on function public.anonymize_user_personal_data(uuid, uuid, boolean) from public, anon;
grant execute on function public.anonymize_user_personal_data(uuid, uuid, boolean) to authenticated;
