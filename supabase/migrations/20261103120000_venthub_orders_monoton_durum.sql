-- Migration: 20261103120000_venthub_orders_monoton_durum.sql
-- ALT-131 / ALT-133 — siparis durumu ve odeme durumu VERITABANI KATMANINDA monoton.
--
-- ══ NICIN ═══════════════════════════════════════════════════════════════════════════
-- CLAUDE.md kural 11: siparis/iade durumlari monoton (yalniz ileri). Bugune kadar bu
-- kural yalniz istemci makinesinde (orderStatusMachine) ve tek tek yazicilarda yasadi;
-- veritabaninda hicbir gecis kapisi yoktu. Yazici envanteri (3 Kasim 2026) 14 yaziciyi
-- sayti; kapisiz olanlar sunlardi: admin-update-shipping (kargo iptali shipped/delivered
-- -> confirmed), admin-update-order (her gecis), shipping-webhook (cancelled -> shipped),
-- release-expired-reservations ile iyzico-callback yarisi, fn_admin_update_order_status.
--
-- ══ NE YAPAR ════════════════════════════════════════════════════════════════════════
-- BEFORE UPDATE tetigi, status ya da payment_status DEGISIYORSA gecisi izin tablosuna
-- karsi denetler; ihlalde SQLSTATE 'VH409' ile RAISE EXCEPTION (mesaj 'ALT131_MONOTON:').
-- Ayni deger her zaman serbesttir. Tetik TUM roller icin gecerlidir (service_role dahil):
-- tablo sahibini ve ALTER TABLE ... DISABLE TRIGGER'i durdurmaz (bilinen sinir).
--
--   STATUS:   pending    -> confirmed, cancelled
--             confirmed  -> processing, shipped, cancelled
--             processing -> shipped, cancelled
--             shipped    -> delivered, cancelled
--             delivered  -> (cikis yok)     cancelled -> (cikis yok)
--   PAYMENT:  pending          -> paid, failed
--             failed           -> paid
--             paid             -> partial_refunded, refunded
--             partial_refunded -> refunded
--             refunded         -> (cikis yok)
--
-- OPS kararlari bunun icinden cikar: teslim sonrasi iade status'u 'delivered' birakir ve
-- yalniz payment_status'u refunded yapar (status ve payment iki ayri tablo); odenmemis
-- siparise iade yazilamaz (pending -> refunded tabloda yok); pending (odenmemis) siparis
-- kargoya verilemez (pending -> shipped tabloda yok); kargo iptali teslim edilmis siparisi
-- geri alamaz (delivered cikissiz).
-- payment_status NULL, 'pending' sayilir (kolon NULL'a izin veriyor, DEFAULT 'pending').
--
-- ══ ALT-133: PARASIZ 'paid' KAYNAGI KALDIRILDI ══════════════════════════════════════
-- sync_payment_status_with_status tetigi (INSERT + UPDATE OF status), status 'confirmed'
-- olunca payment_status'u para hareketi OLMADAN 'paid' yapiyordu. Admin pending ->
-- confirmed yaptiginda ya da (eski) kargo iptali status'u confirmed'a geri sardiginda
-- siparis parasiz 'odendi' oluyor, odeme onayi e-postasi (trg_notify_order_paid) gidiyordu.
-- Gercek odeme yolu (iyzico-callback) status='confirmed' + payment_status='paid' ciftini
-- ZATEN birlikte yaziyor (T114-VH olcumu), yani tetik hicbir dogru yolu tasimiyordu.
-- Bu yuzden fonksiyon DUZELTILMEDI, tetikler ve fonksiyon DUSURULDU: bos kalan odeme
-- durumunu kendiliginden doldurmak yaramayan bir kisayoldu ve kusur dogurdu (T114).
--
-- ══ GERI ALMA ═══════════════════════════════════════════════════════════════════════
--   drop trigger if exists trg_orders_monoton_durum on public.venthub_orders;
--   drop function if exists public.venthub_orders_monoton_durum();
-- (sync_payment_status_with_status'i geri getirmek ONERILMEZ; govdesi
--  20260819160000_payment_status_trigger_fix.sql icinde.)
-- Veri degismez: bu migration yalniz tetik/fonksiyon ekler ve dusurur.
--
-- ══ OLCUM ═══════════════════════════════════════════════════════════════════════════
-- Mevcut satirlari dogrulayan kisit EKLENMEZ (yalniz tetik); mevcut satirlar ancak
-- status/payment_status degistirirse denetlenir. Sozluk disi deger zaten
-- venthub_orders_status_check / venthub_orders_payment_status_check ile imkansiz.
-- Tetik KVKK anonimlestirmesini (customer_name vb. update) etkilemez: WHEN kosulu yalniz
-- iki kolonun degisimine bakar.
-- Cetvel: CLAUDE.md kural 11, docs/standards/migration-safety-standard.md.

begin;
set lock_timeout = '1s';
set statement_timeout = '5s';

create or replace function public.venthub_orders_monoton_durum()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $fn$
declare
  v_durum_izin constant jsonb := '{
    "pending":    ["confirmed", "cancelled"],
    "confirmed":  ["processing", "shipped", "cancelled"],
    "processing": ["shipped", "cancelled"],
    "shipped":    ["delivered", "cancelled"],
    "delivered":  [],
    "cancelled":  []
  }'::jsonb;
  v_odeme_izin constant jsonb := '{
    "pending":          ["paid", "failed"],
    "failed":           ["paid"],
    "paid":             ["partial_refunded", "refunded"],
    "partial_refunded": ["refunded"],
    "refunded":         []
  }'::jsonb;
  v_odeme_eski text := coalesce(old.payment_status, 'pending');
  v_odeme_yeni text := coalesce(new.payment_status, 'pending');
begin
  if new.status is distinct from old.status then
    if not coalesce((v_durum_izin -> old.status) ? new.status, false) then
      raise exception 'ALT131_MONOTON: siparis durumu % -> % gecisi yasak (siparis %)',
        old.status, new.status, old.id
        using errcode = 'VH409',
              hint = 'Siparis durumu yalniz ileri tasinabilir; iptal ve teslim son durumdur.';
    end if;
  end if;

  if v_odeme_yeni is distinct from v_odeme_eski then
    if not coalesce((v_odeme_izin -> v_odeme_eski) ? v_odeme_yeni, false) then
      raise exception 'ALT131_MONOTON: odeme durumu % -> % gecisi yasak (siparis %)',
        v_odeme_eski, v_odeme_yeni, old.id
        using errcode = 'VH409',
              hint = 'Odeme durumu yalniz ileri tasinabilir; iade yalniz odenmis siparise yazilir.';
    end if;
  end if;

  return new;
end;
$fn$;

comment on function public.venthub_orders_monoton_durum() is
  'ALT-131: venthub_orders.status ve payment_status yalniz izin tablosundaki ileri gecislerle degisir; ihlal SQLSTATE VH409. Tablo: migration 20261103120000.';

-- Tetik fonksiyonu: ziyaretci/oturumlu rol dogrudan cagiramaz (yalniz tetik olarak calisir).
revoke all on function public.venthub_orders_monoton_durum() from public, anon, authenticated;

drop trigger if exists trg_orders_monoton_durum on public.venthub_orders;
create trigger trg_orders_monoton_durum
  before update of status, payment_status on public.venthub_orders
  for each row
  when (old.status is distinct from new.status
        or old.payment_status is distinct from new.payment_status)
  execute function public.venthub_orders_monoton_durum();

-- ALT-133: parasiz 'paid' ureten tetikler ve fonksiyon (gerekce yukarida).
drop trigger if exists trg_sync_payment_status_ins on public.venthub_orders;
drop trigger if exists trg_sync_payment_status_upd on public.venthub_orders;
drop function if exists public.sync_payment_status_with_status();

-- ══ UYGULANDIGININ KENDI ICINDE KANITI ══════════════════════════════════════════════
-- Gecici tabloya GERCEK fonksiyon baglanir; izinli gecisler gecmeli, yasak olanlar VH409
-- vermeli, payment_status NULL 'pending' sayilmali. Tutmazsa migration coker.
do $dogrulama$
declare
  hata text := '';
  v_kod text;
begin
  create temp table alt131_dogrulama (id int primary key, status text, payment_status text)
    on commit drop;
  create trigger alt131_upd before update of status, payment_status on alt131_dogrulama
    for each row
    when (old.status is distinct from new.status
          or old.payment_status is distinct from new.payment_status)
    execute function public.venthub_orders_monoton_durum();

  insert into alt131_dogrulama values
    (1, 'pending', 'pending'), (2, 'delivered', 'paid'), (3, 'cancelled', 'pending'),
    (4, 'pending', null), (5, 'shipped', 'pending'), (6, 'confirmed', 'paid');

  -- izinli: yutulmamali, hata vermemeli
  update alt131_dogrulama set status = 'confirmed', payment_status = 'paid' where id = 1;
  update alt131_dogrulama set payment_status = 'refunded' where id = 2;   -- teslim sonrasi iade: status delivered kalir
  update alt131_dogrulama set payment_status = 'paid' where id = 4;       -- NULL 'pending' sayilir
  update alt131_dogrulama set status = 'delivered' where id = 5;
  update alt131_dogrulama set status = 'shipped' where id = 6;

  -- yasak: VH409 vermeli
  begin
    update alt131_dogrulama set status = 'confirmed' where id = 3;        -- cancelled geri alinamaz
    hata := hata || ' cancelled->confirmed gecti;';
  exception when others then
    get stacked diagnostics v_kod = returned_sqlstate;
    if v_kod <> 'VH409' then hata := hata || format(' cancelled->confirmed sqlstate=%s;', v_kod); end if;
  end;
  begin
    update alt131_dogrulama set status = 'confirmed' where id = 5;        -- delivered geri alinamaz
    hata := hata || ' delivered->confirmed gecti;';
  exception when others then
    get stacked diagnostics v_kod = returned_sqlstate;
    if v_kod <> 'VH409' then hata := hata || format(' delivered->confirmed sqlstate=%s;', v_kod); end if;
  end;
  begin
    update alt131_dogrulama set status = 'pending' where id = 6;          -- shipped -> pending
    hata := hata || ' shipped->pending gecti;';
  exception when others then
    get stacked diagnostics v_kod = returned_sqlstate;
    if v_kod <> 'VH409' then hata := hata || format(' shipped->pending sqlstate=%s;', v_kod); end if;
  end;

  if hata <> '' then
    raise exception 'ALT-131 davranis dogrulamasi basarisiz:%', hata;
  end if;
end
$dogrulama$;

commit;
