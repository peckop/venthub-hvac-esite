-- T068-VH · Teklif talebi alındı bildirimi — idempotency damgası + DB tetiği
--
-- NİÇİN (boşluk): T067 ile teklif akışı uçtan uca canlı ama müşteri talebi gönderdikten
-- sonra HİÇBİR onay almıyor. Sipariş tarafında bu kapalı (order-confirmation), teklifte
-- açıktı: ekran "gönderildi" diyor, e-posta kutusunda hiçbir şey yok.
--
-- NİÇİN TETİK (istemci değil): teklif kaydı İSTEMCİDE oluşuyor. E-postayı oradan
-- tetiklemek, istemci kapanır/ağ düşerse bildirimi TAMAMEN kaybettirir ve ucu spam'e
-- açardı. Tetik, bildirimi verinin kendisine bağlar: satır yazıldıysa yol işlemiştir.
--
-- FAIL-OPEN TERCİHİ (bilinçli, kardeş tetikle aynı): sır yoksa ya da http_post düşerse
-- WARNING düşer ama INSERT ENGELLENMEZ. Gerekçe: müşterinin teklif TALEBİNİ kaybetmek,
-- bildirimi kaybetmekten çok daha pahalıdır. Bildirim kaybı sessiz kalmasın diye hem
-- WARNING hem pg_net yanıt defteri (net._http_response) izlenebilir.

begin;

-- ── 1) İdempotency damgası ────────────────────────────────────────────────────────
-- Uç ikinci kez çağrılabilir (tetik yeniden kurulur, pg_net tekrar dener). Damga
-- BELLEKTE değil DB'de tutulur; uç bunu görürse ikinci e-postayı GÖNDERMEZ.
alter table public.venthub_quotes
  add column if not exists request_email_sent_at timestamptz;

comment on column public.venthub_quotes.request_email_sent_at is
  'Teklif talebi alındı e-postasının GÖNDERİLDİĞİ an (T068-VH). NULL = henüz gönderilmedi. '
  'Damga yalnız gönderim BAŞARILI olduktan sonra atılır; idempotency kaynağıdır.';

-- ── 1b) Bildirim defteri — SESSİZ KAYBI GÖRÜNÜR KILAR ─────────────────────────────
--
-- NİÇİN (OPS-AUDIT şartı, T068): `net.http_post` ateşle-unut'tur. Uç düşükse, sır
-- yanlışsa ya da Resend reddederse e-posta SESSİZCE kaybolur — kimse fark etmez, çünkü
-- hiçbir yerde "gitmedi" diye bir kayıt oluşmaz. Sipariş/kargo tarafındaki kardeş
-- defterler (`order_email_events`, `shipping_email_events`) YALNIZ BAŞARIYI yazıyor;
-- yani onlar da bu soruyu cevaplayamıyor. Bu defter o eksiği kapatır: `status` ve
-- `error` kolonlarıyla BAŞARISIZLIK da satır bırakır.
--
-- Damgadan (request_email_sent_at) FARKI: damga IDEMPOTENCY içindir ("ikinci kez gönderme"),
-- defter GÖZLEM içindir ("ne oldu, neden olmadı"). Biri diğerinin yerini tutmaz: başarısız
-- denemeler damga bırakmaz ama defterde görünmelidir.
create table if not exists public.quote_email_events (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.venthub_quotes(id) on delete cascade,
  email_to text,
  subject text,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null check (status in ('sent', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_quote_email_events_quote on public.quote_email_events(quote_id, created_at desc);

-- Kardeş defterlerle aynı duruş: yalnız service_role yazar, admin okur. Müşteri kendi
-- e-posta kaydını görmez (gereksiz yüzey; talebin durumu zaten Tekliflerim sayfasında).
alter table public.quote_email_events enable row level security;

drop policy if exists quote_email_events_admin_read on public.quote_email_events;
create policy quote_email_events_admin_read on public.quote_email_events
  for select to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid() and up.role in ('admin', 'super_admin')
    )
  );

comment on table public.quote_email_events is
  'Teklif bildirimi gonderim defteri (T068-VH). status=failed satirlari BILEREK tutulur: '
  'net.http_post atesle-unut oldugu icin basarisizlik baska hicbir yerde gorunmez.';

-- ── 2) Tetik fonksiyonu ───────────────────────────────────────────────────────────
create or replace function public.notify_quote_request_created()
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
  -- Vault'tan okunur (SECURITY DEFINER erişimi var). Düz metin sır KOYULMAZ:
  -- fonksiyon gövdesi pg_proc'ta okunabilir olduğu için sır oraya yazılamaz (#584 dersi).
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'quote_webhook_secret'
  limit 1;

  select decrypted_secret into webhook_url
  from vault.decrypted_secrets
  where name = 'quote_webhook_url'
  limit 1;

  if webhook_secret is null or webhook_secret = '' or webhook_url is null or webhook_url = '' then
    raise warning '[notify_quote_request_created] Vault kaydi eksik (quote_webhook_secret/url) — bildirim ATLANDI, teklif kaydi %s korundu', new.id;
    return new;
  end if;

  -- `x-timestamp` ZORUNLU: uçtaki replay guard "başlık varsa" değil "başlık YOKSA REDDET"
  -- biçiminde yazıldı; göndermeyen çağıran için guard çalışmasaydı kapı fail-OPEN olurdu.
  select net.http_post(
    url := webhook_url,
    body := jsonb_build_object('quote_id', new.id, 'record', to_jsonb(new)),
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

-- ── 3) Tetik ──────────────────────────────────────────────────────────────────────
-- Yalnız INSERT: "talebiniz alındı" bir kereliktir. Statü geçişlerinin bildirimi
-- ayrı bir iştir (T068 kapsamı DEĞİL) ve kendi tetiğini ister.
drop trigger if exists trg_notify_quote_request_created on public.venthub_quotes;
create trigger trg_notify_quote_request_created
  after insert on public.venthub_quotes
  for each row
  execute function public.notify_quote_request_created();

commit;
