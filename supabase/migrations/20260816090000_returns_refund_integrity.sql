-- Returns & refund integrity — T053-VH (fonksiyon yarısı) + T057-VH (RLS regresyonu)
--
-- İKİ AYRI KUSURU KAPATIR. İkisi de 2026-08-15 operasyon döngüsü denetiminde ölçüldü
-- (docs/audits/operasyon-dongusu-denetimi-2026-08-15.md §3) ve ikisi de 2026-08-16'da
-- prod'da CANLI doğrulandı.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- 1) refund_attempts — para hareketi için "çağır-önce-talep-et" defteri
-- ─────────────────────────────────────────────────────────────────────────────
-- iyzico-refund bugün "Idempotent" başlığını taşıyor ama idempotent DEĞİL: tek koruması
-- `payment_status === 'refunded'` OKUMASI (iyzico-refund/index.ts:116). Bu bir
-- read-then-act: iki eşzamanlı çağrı ikisi de guard'dan geçer, ikisi de İyzico'yu çağırır
-- ve GERÇEK PARA iki kez çıkar. Daha kötüsü, PSP çağrısından SONRAKİ DB yazımı boş
-- `catch {}` içinde (:202-210) — yazma düşerse fonksiyon yine 200 "refunded" döner, DB
-- hiçbir şey bilmez, bir sonraki çağrı parayı TEKRAR iade eder.
--
-- Bunu bir bayrakla ya da "önce oku, sonra yaz" ile çözemeyiz; iki işlem arasındaki
-- pencere kapanmaz. Kapatan tek şey, VERİTABANININ karşılıklı dışlamayı üstlenmesidir:
-- benzersiz indeks. Sıra bilinçli olarak şudur —
--
--     (1) talebi YAZ (unique çakışırsa: başkası zaten yapıyor/yaptı → İyzico'ya GİTME)
--     (2) İyzico'yu çağır
--     (3) sonucu aynı satıra işle
--
-- Talep PSP çağrısından ÖNCE yazıldığı için, süreç ortada ölse bile satır `in_flight`
-- kalır. O durum "para çıktı mı bilmiyoruz" demektir ve OTOMATİK serbest bırakılmaz;
-- fonksiyon 409 döner + gelir alarmı yükseltir. Otomatik serbest bırakmak, kapatmaya
-- çalıştığımız çift-iade penceresini geri açardı — burada fail-closed davranış İNSAN
-- kararı istemektir.
--
-- Ev geleneği: public.shipping_idempotency (20250916_shipping_idempotency.sql). Oradaki
-- tablo yalnız `key primary key` tutar; bu yeterliydi çünkü kargo işlemi DB içinde kalır.
-- İade dış bir sınırı (İyzico) geçtiği için burada AYRICA durum + PSP sonucu tutulur:
-- "talep ettim" ile "para gerçekten çıktı" aynı şey değildir.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- 2) venthub_returns insert politikası — kaybolan sipariş-sahipliği şartı
-- ─────────────────────────────────────────────────────────────────────────────
-- Orijinal politika (202508271900_venthub_returns.sql:41-50) iade açanın SİPARİŞİN de
-- sahibi olmasını şart koşuyordu. 20251203_fix_performance_lints.sql:7,13 initplan
-- optimizasyonu sırasında bu politikayı DROP edip yerine yalnız `user_id = auth.uid()`
-- kontrol eden bir politika koydu — `EXISTS(... o.user_id = auth.uid())` şartı sessizce
-- düştü. 20260530220000_tenant_schema_setup.sql:305 üstüne tenant kapsamı ekledi ama
-- sahipliği geri getirmedi. Sonuç 2026-08-16'da prod'da canlı doğrulandı: bir sipariş
-- UUID'sini bilen kimliği doğrulanmış kullanıcı, BAŞKASININ siparişine iade kaydı
-- açabilir. Admin onaylarsa syncOrderFromReturn o yabancı siparişin statüsünü geriye
-- iter ve payment_status'ünü 'refunded' yapar.
--
-- Kapsam ölçüldü (2026-08-16): venthub_returns 0 satır, venthub_orders 0 satır —
-- yani düzeltmenin geriye dönük bozacağı veri yok.

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. refund_attempts
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists public.refund_attempts (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.venthub_orders(id) on delete cascade,

  -- Talep kimliği. Tam iptalde sunucu türetir ('full:<order_id>') — bu sayede bir siparişin
  -- tam iadesi ömrü boyunca YALNIZ BİR KEZ olabilir, çift tıklama da tekrar deneme de
  -- aynı satıra düşer. Parsiyel iadede çağıran AÇIKÇA vermek zorundadır: "aynı tutarı
  -- ikinci kez iade et" meşru bir istek olabileceği için sunucu bunu kendi başına
  -- ayırt edemez, ayırt ediyormuş gibi yapmak yanlış olur.
  idempotency_key   text not null,

  kind              text not null check (kind in ('cancel', 'refund')),
  amount            numeric(12,2) not null check (amount > 0),

  -- in_flight : talep alındı, İyzico sonucu HENÜZ BİLİNMİYOR
  -- succeeded : İyzico onayladı, sipariş satırı güncellendi
  -- failed    : İyzico reddetti — para çıkmadı, yeni bir anahtarla tekrar denenebilir
  state             text not null default 'in_flight' check (state in ('in_flight', 'succeeded', 'failed')),

  psp_reference     text,
  psp_result        jsonb,
  failure_code      text,

  actor_user_id     uuid,
  reason            text,

  tenant_id         uuid not null default 'd3b07384-d113-495f-a558-8c38634e0000'::uuid
                      references public.tenants(id) on delete cascade,

  created_at        timestamptz not null default now(),
  settled_at        timestamptz,

  -- ★ ÇEKİRDEK: karşılıklı dışlamayı yapan kısıt. İki eşzamanlı iade denemesinden
  --   İKİNCİSİ burada patlar ve İyzico'ya HİÇ ulaşmaz.
  constraint refund_attempts_key_uniq unique (order_id, idempotency_key)
);

create index if not exists refund_attempts_order_idx   on public.refund_attempts (order_id);
create index if not exists refund_attempts_state_idx   on public.refund_attempts (state) where state = 'in_flight';
create index if not exists refund_attempts_created_idx on public.refund_attempts (created_at);

comment on table public.refund_attempts is
  'Para iadesi talep defteri. Sıra: talebi YAZ -> PSP çağır -> sonucu işle. '
  'unique(order_id, idempotency_key) çift iadeyi DB seviyesinde imkânsız kılar. '
  'state=in_flight takılı kalırsa OTOMATİK serbest bırakılmaz (para çıktı mı bilinmiyor) — insan kararı.';

alter table public.refund_attempts enable row level security;

-- Yazan tek taraf edge fonksiyonudur (service_role).
drop policy if exists refund_attempts_service on public.refund_attempts;
create policy refund_attempts_service on public.refund_attempts
  for all to service_role
  using (true) with check (true);

-- Admin yalnız OKUR: takılı kalan talepleri görebilmeli, ama defteri elle düzeltememeli
-- (defterin değeri, tek yazarı olmasından gelir).
drop policy if exists refund_attempts_admin_read on public.refund_attempts;
create policy refund_attempts_admin_read on public.refund_attempts
  for select to authenticated
  using (tenant_id = public.jwt_tenant_id() and (select public.is_admin_user()));

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. venthub_returns — sipariş sahipliği şartını GERİ getir
-- ═════════════════════════════════════════════════════════════════════════════
--
-- EXISTS alt sorgusu çağıran kullanıcının haklarıyla koşar; venthub_orders üzerindeki
-- orders_select_policy zaten `tenant_id = jwt_tenant_id() AND (user_id = auth.uid() OR
-- is_admin_user())` diyor (2026-08-16 ölçüldü). Yani kendi siparişini gören kullanıcı
-- EXISTS'i geçer, yabancı siparişi göremediği için geçemez. Tenant şartı alt sorguda da
-- AÇIKÇA tekrarlanır: politikanın doğruluğu başka bir tablonun politikasına devredilmemeli.

drop policy if exists "returns_insert_policy" on public.venthub_returns;
create policy "returns_insert_policy" on public.venthub_returns
  for insert to authenticated
  with check (
    tenant_id = public.jwt_tenant_id()
    and (
      (
        user_id = (select auth.uid())
        and exists (
          select 1
          from public.venthub_orders o
          where o.id = order_id
            and o.user_id = (select auth.uid())
            and o.tenant_id = public.jwt_tenant_id()
        )
      )
      -- Admin başkası adına iade açabilir (çağrı merkezi senaryosu); yetkisi zaten
      -- is_admin_user() ile sınırlı ve admin_audit_log'a düşer.
      or (select public.is_admin_user())
    )
  );
