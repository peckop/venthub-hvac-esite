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
