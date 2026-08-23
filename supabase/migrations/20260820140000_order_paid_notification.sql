-- T137-VH · Ödeme onayı bildirimi — paid geçişine bağlı tetik + adıyla tanımlı idempotans
-- 2026-08-20 · EDGE şeridi
--
-- KAYNAK / CETVEL
-- ---------------
-- Kaynak: I18N'in 2026-08-20 10:48 kapsam matrisi + Recep kararı 10:54 ("bildirim olmak
--         durumunda ama işi OPS açacak") + OPS iş emri T137-VH 10:56.
-- Cetvel: YOK — `notification-standard` (T118) I18N'de yazılıyor. Yazılana kadar bağlayıcı
--         kural T068-VH deseni: **bildirim VERİYE bağlanır, DB tetiği (pg_net) çağırır,
--         istemciden tetikleme YASAK.** Bu dosya o desenin birebir kardeşidir.
--
-- ⛔ İŞ EMRİNİN PREMİSİ DÜZELTİLDİ — ÖNCE BUNU OKU
-- ------------------------------------------------
-- Emir "ödeme onayı e-postası HİÇ YOK" diyordu. Ölçtüm: **VAR, sadece adı başka.**
--   `supabase/functions/iyzico-callback/index.ts:327` → `order-confirmation` ucunu çağırıyor.
--   `supabase/config.toml:54` bu çağrıyı adıyla belgeliyor.
-- Anahtar kelime taraması ("notification/resend/sendEmail") gerçek adı görmedi.
--
-- ASIL KUSUR "yok" değil, **"var ama T068 sınıfında"** — iki ayrı kusur ölçüldü:
--   (1) VERİYE BAĞLI DEĞİL: çağrı `try { ... } catch { /* ignore */ }` içinde ateşle-unut.
--       Ağ düşerse, uç soğuk başlarsa ya da 500 dönerse sipariş `paid` kalır, e-posta HİÇ
--       gitmez ve HİÇBİR İZ KALMAZ — log yok, yeniden deneme yok, kayıt yok.
--   (2) İDEMPOTANS HİÇ YOK: `order-confirmation` gönderimden SONRA `order_email_events`'e
--       yazıyor (satır 208) ama göndermeden ÖNCE oraya HİÇ BAKMIYOR. Defter salt-yazılır.
--       İki kez çağrılırsa iki e-posta gider.
--
-- CANLI ÖLÇÜM — niçin kimse fark etmedi:
--   `venthub_orders` payment_status='paid' → **0 satır**. Üretimde hiç ödenmiş sipariş olmamış.
--   `order_email_events` → 0 satır (yukarıdakinin sonucu; tek başına hüküm taşımaz).
-- Yani bu yol bugüne kadar HİÇ KOŞMADI; ne "gidiyor" ne "gitmiyor" sınanmıştı.
--
-- BU DOSYANIN İŞİ: yoktan var etmek DEĞİL — **yeniden bağlamak ve idempotan kılmak.**

begin;

-- ─────────────────────────────────────────────────────────────────────────────────
-- 1) İKİ AYRI DAMGA — biri OLGU, biri İDEMPOTANS. Karıştırmak kusur doğurur.
-- ─────────────────────────────────────────────────────────────────────────────────
--
-- `paid_at`  = TİCARİ OLGU. Ödemenin onaylandığı an. `shipped_at` / `delivered_at` ile
--              simetrik; bugüne kadar YOKTU (ölçüldü). Tetiğin bağlandığı geçişi KALICI ve
--              gözlemlenebilir kılar: "ikinci paid yazımı" sorusu ancak bununla ölçülebilir.
--
-- `paid_email_sent_at` = ⭐ **İDEMPOTANS ANAHTARI** (OPS şartı 2 — adıyla tanımlanıyor).
--              E-postanın GERÇEKTEN gönderildiği an. Yalnız gönderim BAŞARILI olduktan sonra
--              uç tarafından damgalanır. Uç, göndermeden ÖNCE buraya bakar.
--
-- NİÇİN İKİSİ AYRI: e-posta başarısız olsa bile ödeme olgusu kaybolmamalı. Tek damgaya
-- indirgemek, "para alındı" ile "haber verildi" olgularını birbirine kilitler — biri
-- diğerini yanlış temsil eder. T068'de aynı ayrım `request_email_sent_at` ile yapıldı.
alter table public.venthub_orders
  add column if not exists paid_at timestamptz;

alter table public.venthub_orders
  add column if not exists paid_email_sent_at timestamptz;

comment on column public.venthub_orders.paid_at is
  'Odemenin onaylandigi an (T137-VH). shipped_at/delivered_at ile simetrik. Yalniz '
  'payment_status paid OLMAYAN bir degerden paid a GECERKEN, ILK KEZ damgalanir.';

comment on column public.venthub_orders.paid_email_sent_at is
  'IDEMPOTANS ANAHTARI (T137-VH): odeme onayi e-postasinin GONDERILDIGI an. NULL = henuz '
  'gonderilmedi. Yalniz gonderim BASARILI olduktan sonra damgalanir; uc gondermeden ONCE '
  'buraya bakar. paid_at ile KARISTIRILMAMALI: biri ticari olgu, bu bildirim olgusu.';

-- Geriye dönük doldurma: bugün 0 `paid` satır var (ölçüldü), yani bu satır bugün hiçbir şey
-- yapmaz. YİNE DE yazılıyor — migration ileride, satırlar oluştuktan sonra da uygulanabilir
-- ve o durumda ZATEN paid olan siparişler için `paid_at`'in boş kalması, aşağıdaki tetiğin
-- onları "yeni ödenmiş" sanmasına yol açardı.
update public.venthub_orders
   set paid_at = coalesce(updated_at, created_at)
 where payment_status = 'paid'
   and paid_at is null;

-- ─────────────────────────────────────────────────────────────────────────────────
-- 2) DEFTER — BAŞARISIZLIK DA SATIR BIRAKSIN
-- ─────────────────────────────────────────────────────────────────────────────────
--
-- `order_email_events` bugün YALNIZ BAŞARIYI yazıyor (kolonları: id, order_id, email_to,
-- subject, provider, provider_message_id, created_at). Yani "e-posta niçin gitmedi"
-- sorusunu cevaplayamaz — `net.http_post` ateşle-unut olduğu için başarısızlık başka
-- hiçbir yerde de görünmez. T068'de aynı eksik `quote_email_events`'te `status`/`error`
-- ile kapatıldı; burada YENİ TABLO AÇMIYORUM, mevcut defteri o seviyeye çıkarıyorum.
--
-- `status` NULL'a izin verir ve varsayılanı yoktur: mevcut satırlar (bugün 0) ve bu
-- kolonu bilmeyen eski yazıcılar bozulmasın diye. Yeni yazıcı her zaman doldurur.
alter table public.order_email_events
  add column if not exists status text;

alter table public.order_email_events
  add column if not exists error text;

alter table public.order_email_events
  add column if not exists kind text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'order_email_events_status_check'
      and conrelid = 'public.order_email_events'::regclass
  ) then
    alter table public.order_email_events
      add constraint order_email_events_status_check
      check (status is null or status in ('attempt', 'sent', 'failed'));
  end if;
end $$;

comment on column public.order_email_events.status is
  'attempt | sent | failed | NULL(eski satir). T137-VH: defter yalniz basariyi yazdigi surece '
  '"nicin gitmedi" sorusu cevapsiz kalir — atesle-unut cagrida sessiz kayip gorunmez. '
  'attempt = gonderim DENENDI, sonucu henuz yazilmadi. Terminal duruma HIC gecmeyen bir '
  'attempt satiri, uc ile damga arasinda OLEN bir cagrinin TEK izidir: e-posta gitmis '
  'olabilir ama damga atilmamistir, yani tekrar denemede MUKERRER gonderim olur. Bu satir '
  'o mukerrerligi ENGELLEMEZ, ACIKLANABILIR kilar.';

comment on column public.order_email_events.kind is
  'Bildirim turu (ornek: order_paid). T137-VH oncesi tek tur vardi ve adlandirilmamisti; '
  'defter cok turlu hale gelirken tur ADIYLA yazilmali, yoksa subject metnine bakmak gerekir.';

create index if not exists idx_order_email_events_order_kind
  on public.order_email_events(order_id, kind, created_at desc);

-- ⭐ DEFTER GÖNDERİMDEN ÖNCE Mİ SONRA MI — karar ve niçin (OPS'un ek kolu, I18N'in tespiti)
-- ---------------------------------------------------------------------------------
-- I18N doğru tespit etti: mevcut `order-confirmation` defteri gönderimden SONRA ve
-- `try/catch` içinde yazıyor, yani defter eksik kalabilir. Soru şu: yazma gönderimden
-- ÖNCE mi olmalı, atomik mi?
--
-- İKİ SEÇENEK VE GERÇEK BEDELLERİ:
--  (a) ÖNCE DAMGALA, SONRA GÖNDER (at-most-once): çift gönderim İMKÂNSIZ olur. Ama uç
--      damgayı attıktan sonra ölürse e-posta HİÇ gitmez ve damga "gitti" der —
--      SESSİZ KAYIP. T068-VH'nin kapattığı sınıfın ta kendisi.
--  (b) GÖNDER, SONRA DAMGALA (at-least-once): kayıp olmaz; ölüm penceresinde İKİNCİ
--      e-posta gidebilir.
--
-- SEÇİM (b), ve gerekçesi ticari asimetridir, teknik zarafet değil: müşteri PARA ÖDEDİ.
-- Eksik ödeme onayı, bu işin düzeltmek için var olduğu kusurdur; mükerrer onay ise
-- rahatsız edicidir ama zarar vermez. Belirsizlikte pahalı olan tarafa değil ucuz olan
-- tarafa yanılıyoruz. Aynı tercih tetiğin fail-open dalında da yapıldı (bkz. §4).
--
-- AMA (b)'nin ölüm penceresi GÖRÜNMEZ kalmamalı: uç, göndermeden ÖNCE `attempt` satırı
-- yazar ve sonucu o satıra işler. Terminal duruma hiç geçmeyen bir `attempt`, e-postanın
-- gitmiş ama damgalanmamış olabileceğinin TEK izidir. Mükerrerliği engellemez —
-- AÇIKLANABİLİR kılar. Sessiz kalan bir mükerrerlik ile açıklanabilir bir mükerrerlik
-- arasındaki fark, üçüncü kez yaşamadan öğrenmektir.

-- SON SAVUNMA — damga düşse bile ikinci "sent" satırı yazılamaz.
-- Kısmi ve YALNIZ başarılı satırlar için: başarısız denemeler tekrar edebilmeli.
create unique index if not exists uq_order_email_events_sent_once
  on public.order_email_events(order_id, kind)
  where status = 'sent';

-- ─────────────────────────────────────────────────────────────────────────────────
-- 3) GEÇİŞ DAMGASI — paid_at yalnız İLK geçişte yazılır
-- ─────────────────────────────────────────────────────────────────────────────────
create or replace function public.stamp_order_paid_at()
returns trigger
language plpgsql
as $function$
begin
  if new.payment_status = 'paid'
     and (old.payment_status is distinct from 'paid')
     and new.paid_at is null then
    new.paid_at := now();
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_stamp_order_paid_at on public.venthub_orders;
create trigger trg_stamp_order_paid_at
  before update on public.venthub_orders
  for each row
  execute function public.stamp_order_paid_at();

-- ─────────────────────────────────────────────────────────────────────────────────
-- 4) BİLDİRİM TETİĞİ — İLK DAMGAYA bağlı, durum karşılaştırmasına DEĞİL
-- ─────────────────────────────────────────────────────────────────────────────────
--
-- ⭐ WHEN koşulu bilerek `paid_at IS NULL -> NOT NULL` üzerinedir, `payment_status` üzerinde
-- DEĞİL. Aynı kural bugün teslim bildiriminde de geçerli (`delivered_at` ilk damga) ve
-- I18N ile T118 cetveline madde olarak verildi: *bildirim, damganın İLK KEZ yazılmasına
-- bağlanır; hiçbir yol bildirimi durum karşılaştırmasına ya da kısa devre yan ürününe
-- dayandıramaz.* Durum karşılaştırması kırılgandır — `shipping-webhook`'taki koruma bugün
-- çalışıyor ama bir kısa devrenin YAN ÜRÜNÜ, yani refactor'da sessizce kaybolabilir.
--
-- FAIL-OPEN TERCİHİ (bilinçli, kardeş tetikle aynı): sır yoksa ya da http_post düşerse
-- WARNING düşer ama ÖDEME YAZIMI ENGELLENMEZ. Gerekçe tersine çevrilemez: müşterinin
-- ödemesini kaydedememek, bildirimi kaybetmekten kat kat pahalıdır. Kayıp sessiz kalmasın
-- diye hem WARNING hem defterin `failed` satırları izlenebilir.
create or replace function public.notify_order_paid()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, vault
as $function$
declare
  webhook_url text;
  webhook_secret text;
  req_id bigint;
begin
  -- Vault'tan okunur (SECURITY DEFINER erişimi var). Düz metin sır KOYULMAZ: fonksiyon
  -- gövdesi `pg_proc`'ta okunabilir olduğu için sır oraya yazılamaz (#584 dersi).
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'order_paid_webhook_secret'
  limit 1;

  select decrypted_secret into webhook_url
  from vault.decrypted_secrets
  where name = 'order_paid_webhook_url'
  limit 1;

  if webhook_secret is null or webhook_secret = '' or webhook_url is null or webhook_url = '' then
    raise warning '[notify_order_paid] Vault kaydi eksik (order_paid_webhook_secret/url) — bildirim ATLANDI, siparis %s odeme kaydi korundu', new.id;
    return new;
  end if;

  -- `x-timestamp` ZORUNLU: uçtaki replay guard "başlık varsa" değil "başlık YOKSA REDDET"
  -- biçiminde yazılır; göndermeyen çağıran için guard çalışmasaydı kapı fail-OPEN olurdu.
  select net.http_post(
    url := webhook_url,
    body := jsonb_build_object('order_id', new.id, 'tenant_id', new.tenant_id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret,
      'x-timestamp', (extract(epoch from now()) * 1000)::bigint::text
    ),
    timeout_milliseconds := 5000
  ) into req_id;

  return new;
end;
$function$;

drop trigger if exists trg_notify_order_paid on public.venthub_orders;
create trigger trg_notify_order_paid
  after update on public.venthub_orders
  for each row
  when (old.paid_at is null and new.paid_at is not null)
  execute function public.notify_order_paid();

-- ─────────────────────────────────────────────────────────────────────────────────
-- 5) ÖZ-DENETİM — migration KENDİ İDDİASINI ÖLÇER
-- ─────────────────────────────────────────────────────────────────────────────────
-- Niçin: bu dosya "artık ödeme onayı bildirimi veriye bağlı ve idempotan" diye bir SÖZ
-- veriyor. Sözün arkasında mekanizma olduğunu migration'ın kendisi kanıtlamalı; yoksa
-- uygulanır, yeşil görünür ve kimse damganın/tetiğin gerçekten doğduğunu ölçmez.
do $$
declare
  eksik text := '';
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='venthub_orders'
                   and column_name='paid_email_sent_at') then
    eksik := eksik || 'paid_email_sent_at kolonu yok; ';
  end if;

  if not exists (select 1 from pg_trigger
                 where tgname='trg_notify_order_paid'
                   and tgrelid='public.venthub_orders'::regclass) then
    eksik := eksik || 'trg_notify_order_paid tetigi yok; ';
  end if;

  if not exists (select 1 from pg_trigger
                 where tgname='trg_stamp_order_paid_at'
                   and tgrelid='public.venthub_orders'::regclass) then
    eksik := eksik || 'trg_stamp_order_paid_at tetigi yok; ';
  end if;

  if not exists (select 1 from pg_indexes
                 where schemaname='public' and indexname='uq_order_email_events_sent_once') then
    eksik := eksik || 'uq_order_email_events_sent_once kisiti yok; ';
  end if;

  if eksik <> '' then
    raise exception 'T137-VH: migration kendi iddiasini karsilamadi -> %', eksik;
  end if;
end $$;

commit;
