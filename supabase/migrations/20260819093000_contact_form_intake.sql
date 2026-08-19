-- T104 · Müşteri-yüzü form gönderimi: sahte-başarıyı kapatan veri tarafı
--
-- KUSUR (kodun kendisinden okundu, 2026-08-19):
--   src/components/LeadModal.tsx:53-70  -> setTimeout(1200ms) sonra başarı ekranı.
--     Kodun kendi yorumu: "Simulate API Call for better UX instead of mailto".
--   src/views/ContactPage.tsx:46        -> "Form submission logic using supabase would go here".
--   Yani ad, e-posta, telefon, firma, şehir, mesaj VE KVKK RIZASI toplanıp atılıyor,
--   müşteriye "aldık" deniyor. LeadModal ana sayfada canlı ve dört tetikleyicisi var.
--
-- BU MIGRATION'IN İŞİ: yazılacak yeri hazırlamak. Kod tarafı AYRI PR'da gelir ve
-- ancak bu migration prod'a indikten SONRA bağlanır — "ekran canlı, politika yok"
-- yarım-canlı halini bilerek engelliyoruz.
--
-- ÖLÇÜLEN ÜÇ ENGEL (hepsi canlı DB'den okundu):
--   (1) public.contact_messages VAR ama uygulama kodunda TEK bir yazıcısı yok.
--   (2) Tabloda TEK politika var: admin SELECT. INSERT politikası YOK + RLS açık
--       => bugün form bağlansa yazma REDDEDİLİR (bir sessiz-boş daha).
--   (3) anon rolünün tablo üzerinde DELETE, UPDATE, TRUNCATE yetkisi VAR. Şu an tek
--       engel izin veren politikanın bulunmaması. Politika ekleyen kişi FOR ALL
--       yazsaydı anonim ziyaretçi tabloyu BOŞALTABİLİRDİ.
--
-- ŞEMA UYUŞMAZLIĞI (LeadModal alanları ile tablo arasında, ölçüldü):
--   - LeadModal "e-posta VEYA telefon" ile gönderime izin veriyor; tabloda email NOT NULL
--     => yalnız telefon bırakan ziyaretçinin satırı YAZILAMAZDI.
--   - LeadModal'da subject alanı yok; tabloda subject NOT NULL ve varsayılanı YOK.
--   - city / uygulama alanı / rıza için karşılık yok.
--
-- NİÇİN RPC, NİÇİN DOĞRUDAN INSERT DEĞİL:
--   Sahte-başarıyı kapatmanın kuralı "başarı ekranı KANITA bağlanır" olduğu için istemcinin
--   yazılan satırın id'sini geri alması gerekiyor. PostgREST'te insert().select() =
--   INSERT ... RETURNING ve RETURNING, tablo üzerinde SELECT yetkisi+politikası ister;
--   bunu anon'a vermek ziyaretçiye BAŞKALARININ mesajlarını okutmak demekti. Bu yüzden
--   yazma tek bir SECURITY DEFINER fonksiyonundan geçiyor: anon'un tablo üzerinde HİÇBİR
--   yetkisi kalmıyor, doğrulama sunucu tarafında tek yerde duruyor ve fonksiyon id döndürüyor.

begin;

-- 1) Eksik alanlar
alter table public.contact_messages
  add column if not exists city text,
  add column if not exists application_area text,
  add column if not exists kvkk_consent boolean not null default false,
  add column if not exists consent_at timestamptz;

comment on column public.contact_messages.kvkk_consent is
  'KVKK açık rıza kutusu işaretlendi mi. Rıza kayıtla AYNI satırda saklanır; toplanıp saklanmayan rızanın kanıtı yoktur.';
comment on column public.contact_messages.consent_at is
  'Rızanın alındığı an (sunucu saati).';

-- 2) "E-posta VEYA telefon" gerçeğini şemaya yaz
alter table public.contact_messages alter column email drop not null;

alter table public.contact_messages
  alter column subject set default 'web-form';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.contact_messages'::regclass
      and conname = 'contact_messages_iletisim_var'
  ) then
    alter table public.contact_messages
      add constraint contact_messages_iletisim_var
      check (
        (email is not null and btrim(email) <> '')
        or (phone is not null and btrim(phone) <> '')
      );
  end if;
end $$;

-- 3) Tek yazma kapısı: doğrulayan, id döndüren SECURITY DEFINER fonksiyon
create or replace function public.submit_contact_message(
  p_name text,
  p_message text,
  p_email text default null,
  p_phone text default null,
  p_company text default null,
  p_city text default null,
  p_application_area text default null,
  p_subject text default 'web-form',
  p_consent boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if p_name is null or btrim(p_name) = '' then
    raise exception 'ad zorunlu' using errcode = '22023';
  end if;
  if p_message is null or btrim(p_message) = '' then
    raise exception 'mesaj zorunlu' using errcode = '22023';
  end if;
  if (p_email is null or btrim(p_email) = '') and (p_phone is null or btrim(p_phone) = '') then
    raise exception 'e-posta ya da telefon zorunlu' using errcode = '22023';
  end if;
  if p_consent is not true then
    raise exception 'kvkk rizasi zorunlu' using errcode = '22023';
  end if;

  insert into public.contact_messages (
    name, email, phone, company, subject, message,
    city, application_area, kvkk_consent, consent_at
  ) values (
    btrim(p_name),
    nullif(btrim(coalesce(p_email, '')), ''),
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(btrim(coalesce(p_company, '')), ''),
    coalesce(nullif(btrim(coalesce(p_subject, '')), ''), 'web-form'),
    btrim(p_message),
    nullif(btrim(coalesce(p_city, '')), ''),
    nullif(btrim(coalesce(p_application_area, '')), ''),
    true,
    now()
  )
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.submit_contact_message is
  'Musteri-yuzu form gonderiminin TEK yazma kapisi (T104). Dogrulama sunucu tarafinda; id dondurur ki istemci basari ekranini KANITA baglayabilsin. Cetvel: docs/standards/form-submission-standard.md';

-- 4) Yetki hijyeni: anon tabloya DEĞİL, yalnız fonksiyona erişir
revoke all on table public.contact_messages from anon;
revoke truncate, delete on table public.contact_messages from authenticated;

revoke all on function public.submit_contact_message(
  text, text, text, text, text, text, text, text, boolean
) from public;

grant execute on function public.submit_contact_message(
  text, text, text, text, text, text, text, text, boolean
) to anon, authenticated;

commit;
