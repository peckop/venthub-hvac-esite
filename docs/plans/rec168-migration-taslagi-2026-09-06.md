# REC-168 — Migration TASLAĞI: satış kipi anahtarı (tek kaynak + koşullu tetik)

> **KAYNAK/CETVEL:** `docs/standards/satis-kipi-gecis-standard.md` §3–§4 · `rendering-cache-standard.md` §3
> (tazeleme sözleşmesi) · `db-grant-hygiene-standard.md` (GRANT tek başına kapı değildir) ·
> CLAUDE.md kural 13 (**migration merge = prod'a otomatik uygulanır; yalnız Recep onayıyla**).
> **YÖNTEM:** elle (tek dosya) · bu belge **taslaktır**, `supabase/migrations/` altına
> **ikinci PR'da** `YYYYMMDDHHMMSS_satis_kipi_anahtari.sql` adıyla (14 hane) taşınır.
> **Bu belgenin merge'i hiçbir şey uygulamaz** — `docs/` altında SQL çalışmaz.

## Niçin migration gerekiyor (emir "migration YOK" diyordu — öncül ölçümle düştü)

| ölçüm (canlı, 2026-09-06 13:4xZ) | sonuç |
|---|---|
| `site_settings` tablosu | **VAR** — `key text · value jsonb · description · updated_at · updated_by`, 2 satır (`general`, `payment`) |
| `site_settings` tetiği | **YOK** (`pg_trigger` boş) → satır değişse hiçbir sayfa tazelenmez |
| `site_settings` RLS | `rls_enabled=true`, üç politika **yalnız `authenticated`**; anon SELECT **kasıtlı yok** (migration `20260617000000`: *"ayar değerleri (ör. iyzico) public/anon'a…"*) |
| RSC sunucu istemcisi | `src/lib/supabase/server.ts:10` ve `static.ts` **ANON key** ile çalışır |

Sonuç: RSC anahtarı **okuyamaz**; anon'a tablo açmak `payment.iyzico_*` alanlarını da açar. Çözüm
**tabloyu açmak değil**, anon'a **yalnız boolean döndüren** bir fonksiyon + **yalnız o satır için**
tetik. İkisi de DDL → migration → Recep kapısı.

## SQL (taslak — ikinci PR'da migrations/'a birebir taşınır)

```sql
-- REC-168: satış kipi anahtarı — tek kaynak, anon'a YALNIZ boolean, koşullu tetik
-- Cetvel: docs/standards/satis-kipi-gecis-standard.md §3 (arayüz) · §4 (tazeleme)
--
-- BU MIGRATION PROD'A OTOMATİK UYGULANIR (supabase-migrate.yml) — merge = uygulama.
-- İçerik DDL'dir, VERİ YAZMAZ: satis_kipi satırını betik ekler (scripts/kip/satis-kipine-gec.mjs).
-- Satır yokken fonksiyon {acik:false} döner → davranış bugünkünün AYNISI (kapalı). Yani bu
-- migration inince vitrinde HİÇBİR ŞEY değişmez; değişiklik ancak betik + Recep onayıyla olur.

begin;

-- 1) OKUMA FONKSİYONU — anon çağırır, yalnız {acik, damga} döner.
--    SECURITY DEFINER: fonksiyon kendi yetkisiyle SELECT eder; site_settings RLS'i DEĞİŞMEZ,
--    anon tabloya hâlâ ULAŞAMAZ. payment/general satırları bu fonksiyondan SIZMAZ:
--    WHERE key='satis_kipi' ve yalnız value->>'acik' okunur. (Kapı: INV-SATIS-KIPI-2)
--    search_path='' + şema-nitelikli adlar: advisor "mutable search_path" uyumlu (get_category_counts deseni).
create or replace function public.satis_kipi_oku()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select jsonb_build_object(
              'acik',  coalesce((s.value->>'acik')::boolean, false),
              'damga', s.updated_at)
       from public.site_settings s
      where s.key = 'satis_kipi'
      limit 1),
    jsonb_build_object('acik', false, 'damga', null)   -- satır yok → KAPALI (fail-closed)
  );
$$;

-- R7 deseni (20260602070000): SECURITY DEFINER fonksiyonlarda public'ten geri al, adıyla ver.
revoke all on function public.satis_kipi_oku() from public;
grant execute on function public.satis_kipi_oku() to anon, authenticated, service_role;

-- 2) TETİK — YALNIZ satis_kipi satırı değişince webhook.
--    WHEN koşulu kasıtlı: payment/general satırı değişince to_jsonb(NEW) (iyzico alanları dahil)
--    webhook yüküne GİRMEZ. handle_supabase_webhook() jenerik (TG_TABLE_NAME), route.ts
--    `table === 'site_settings'` dalında `record.key === 'satis_kipi'` ile revalidateTag(SATIS_KIPI_TAG)
--    — o dal URUN'un (REC-169 ilk kalem); bu migration dal olmadan da ZARARSIZDIR (webhook gelir, eşleşen
--    dal yoksa no-op).
--    DELETE bilerek dışarıda: AFTER DELETE'te NEW yoktur, WHEN(new.key) hata verir; betik satır SİLMEZ,
--    silinirse fonksiyon zaten fail-closed. Bilinen sınır, cetvel §11.
drop trigger if exists on_site_settings_satis_kipi on public.site_settings;
create trigger on_site_settings_satis_kipi
  after insert or update on public.site_settings
  for each row
  when (new.key = 'satis_kipi')
  execute function public.handle_supabase_webhook();

-- === Guard (20260815 deseni): eksikse migration DÜŞER, yarım kalmaz ===
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'satis_kipi_oku') then
    raise exception 'REC-168 guard: satis_kipi_oku() yok';
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'on_site_settings_satis_kipi') then
    raise exception 'REC-168 guard: on_site_settings_satis_kipi tetiği yok';
  end if;
end $$;

commit;
```

## Uygulama SIRASI (kod migration olmadan ÇALIŞIR — bu yüzden sıra güvenli)

1. **Kod PR'ı** (`src/lib/kip/satisKipi.ts` + `checkout/page.tsx` + betik + kapılar): `satisKipiOku()`
   RPC'yi bulamazsa **`{acik:false, kaynak:'kapali-varsayilan'}`** döner → bugünkü davranış aynen. Kota
   penceresinde, koşullu self-merge.
2. **Migration PR'ı** (bu taslak, `migrations/` altında): **Recep onayıyla** merge → prod'a uygulanır.
   Vitrin yine değişmez (satır yok).
3. **`pnpm supabase:gen`** → `database.types.ts`'e `satis_kipi_oku` girer (URUN'un claim'i; tip üretimi
   AXIOM 3 — elle yazılmaz). Kod PR'ı bu adımdan önce inecekse RPC çağrısı tip düzeyinde `unknown`
   üzerinden geçer (cetvel §3.4'te yazılı, kapı ölçer).
4. **Betik kuru koşum** → **Recep onayı** → `--uygula --onay "Recep <tarih>"` → tetik → webhook → tazeleme.
5. **Canlı doğrulama**: son **READY** master dağıtım SHA'sı ile (K3 — merge SHA'sı DEĞİL).

## Sabotaj kolları (ikinci PR'daki kapı, adıyla)

| kol | ne yapar | beklenen |
|---|---|---|
| INV-SATIS-KIPI-2a | anon istemci `site_settings`'ten SELECT dener | **42501 / RLS reddi** (tablo hâlâ kapalı) |
| INV-SATIS-KIPI-2b | anon istemci `rpc('satis_kipi_oku')` | yalnız `{acik, damga}` — `iyzico` geçen anahtar **0** |
| INV-SATIS-KIPI-2c | `payment` satırı güncellenir | webhook **atılmaz** (WHEN koşulu) — ölçüm: webhook olay sayısı 0 |
| INV-SATIS-KIPI-2d | `satis_kipi` satırı yokken RPC | `{acik:false}` |

⚠ Bu kollar **canlı DB'ye** bakar; konformans dizisinde değil, `scripts/db/checks/` altında (ALTYAPI
claim'i) ayrı koşulur — canlıya bağlı testin CI'daki yeri cetvel §9'da.

İlgili: REC-168 · REC-169 (route.ts dalı) · REC-159 (iade şeması, ayrı migration)
