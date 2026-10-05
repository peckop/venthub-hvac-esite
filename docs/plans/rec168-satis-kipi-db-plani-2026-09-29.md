# REC-168 — Satış kipi anahtarının veritabanı tarafı: güncel plan v2 (2026-09-29)

> **KAYNAK/CETVEL:** `docs/standards/satis-kipi-gecis-standard.md` (§3 arayüz, §4 tazeleme, §6 betik) ·
> `docs/standards/rendering-cache-standard.md` §3 (tazeleme sözleşmesi) · `docs/standards/db-grant-hygiene-standard.md`
> (GRANT tek başına kapı değildir) · CLAUDE.md kural 13 (**migration merge = prod'a otomatik uygulanır; yalnız Recep onayıyla**).
> Ölçüm defteri: `memory/olcum/satis-hazirligi.md` satır 1 (OPS, 2026-09-29).
> **YÖNTEM:** elle (belge) → `plan-challenger` (migration olduğu için ZORUNLU; **koşuldu, hüküm KOŞULLU, düzeltmeler bu v2'de**) → OPS → Recep kapısı.
> Bu belge hiçbir şey uygulamaz. **Öncül:** `docs/plans/rec168-migration-taslagi-2026-09-06.md` (taslak; SQL'i burada düzeltilmiş hâliyle yenilendi).

## Amaç

Satış anahtarı **KAPALI kalır**; hedef anahtarı **açılabilir hâle** getirmek. Kod hazır (`src/lib/kip/satisKipi.ts`, checkout kapısı,
`scripts/kip/satis-kipine-gec.mjs`, `INV-SATIS-KIPI-1..5`); eksik olan veritabanı tarafı. Bu iş canlıda **görünür hiçbir davranışı değiştirmez**.

## Bugünkü durum (ölçüldü: repo + canlı SELECT)

| Parça | Durum | Kanıt |
|---|---|---|
| `satis_kipi_oku()` RPC | **prod'da YOK** | canlı ölçüm; depoda `supabase/migrations/` altında `satis_kipi` geçen dosya **0** |
| `site_settings` | 2 satır (`general`, `payment`); RLS açık; INSERT/SELECT/UPDATE politikaları yalnız `authenticated`; DELETE politikası yok | baseline `2026-09-25` satır 8264–8279 |
| Okuma kodu | var, hata → KAPALI | `satisKipi.ts`; `checkout/page.tsx` `kip.acik ? <CheckoutPage/> : <OdemeKapaliBilgi/>` |
| Geçiş betiği | var, varsayılan KURU, `--uygula --onay` ister, `service_role` | `scripts/kip/satis-kipine-gec.mjs` |
| Webhook dalı | **YOK** | `route.ts`'te `site_settings` 0 |
| Tetik | `satis_kipi` için **YOK**; tabloda yalnız `denetim_izi_site_settings` | canlı + baseline |
| Canlı kapı `satis-kipi-canli.mjs` (INV-SATIS-KIPI-2a–2d) | cetvel vaat ediyor, **depoda YOK** | `scripts/db/checks/` |

## Taslaktan (2026-09-06) beri değişenler

1. `site_settings`'te `denetim_izi_site_settings` tetiği var (09-09): `satis_kipi` her değişince "kim, ne zaman" `admin_audit_log`'a da düşer (betiğin `--onay` damgasına ek bağımsız kayıt).
2. Anon rolünün `site_settings` üzerinde tablo düzeyi INSERT/UPDATE/DELETE/TRUNCATE GRANT'i var (baseline 10120); yalnız RLS engelliyor. **Ayrı kayıt** (ALTYAPI), bu migration'a girmez.
3. 24 Eylül anon-DEFINER kapatma turu yapıldı; anon'a kasıtlı açık kalanlar `submit_contact_message`, `url_takma_ad_coz`. `satis_kipi_oku` bu sınıfa üye olur (salt okuma, parametresiz, yalnız `{acik, damga}`); çürütme raporu ilkeyle **çelişmediğini** doğruladı.
4. Şema tabanı bayat (`INV-TABAN-TAZE-1`): yeni migration bu farkı büyütür.

## Çürütme sonucu (plan-challenger, 2026-09-29) — v1'den v2'ye değişenler

| # | Bulgu | v1'de | v2'de |
|---|---|---|---|
| Ç1 | **Önbellek süresiz ve hatayı da saklıyor.** `satisKipi.ts` `unstable_cache`'inde `revalidate` yok (repodaki diğer hepsi 3600); `dbdenOku` hatada KAPALI döner, `throw` etmez → geçici bir hata süresiz önbelleğe girer. Webhook düşerse, ya da satır DELETE/yeniden adlandırılırsa, "açık" süresiz kalır. Cetvel §11'in "3600 sn" cümlesi bu dosya için yanlış. | yoktu | **Kod düzeltmesi aynı PR'da:** hatada `throw` (önbelleğe girmesin, çağıran KAPALI'ya düşsün), `revalidate: 300`; cetvel §11 düzeltilir |
| Ç2 | **Adım 1 (webhook dalı) tek başına birleşemez:** INV-RENDER-2 tek koşullu `if (table === 'x')` arar; bileşik koşul kapıya görünmez, tek koşullu yazılırsa tetik yokken "ÖKSÜZ HANDLER" kırmızı verir. Cetvele satır eklenirse `scripts/webhook_setup.sql` da tetiği kurmak zorunda. | ayrı PR | **Tek PR:** tek koşullu dal + migration aynı PR; `key` ayrımı dalın içinde |
| Ç3 | **Yönetici paneli `satis_kipi` satırını yazabilir** (politikalarda anahtar ayrımı yok; `moderator` dahil) → betiğin tutarlılık kapısı (açık + 37 kategoride `hide_price`) atlanır. | soruydu | **Migration'a girer:** iki RESTRICTIVE politika (`to authenticated`; `key <> 'satis_kipi'`, UPDATE'te `with check` da) — `general` upsert geçer (panel kırılmaz) |
| Ç4 | Tetik olay kapsamı: **DELETE** ve **anahtar yeniden adlandırma** webhook atmıyor → "açık" önbellekte kalır. | tek tetik | **Üç tetik** (INSERT: `new.key`; UPDATE: `new.key or old.key`; DELETE: `old.key`), emsal `on_product_prices_ins_del/upd` |
| Ç5 | SQL **squawk'ta kırmızı**: `lock_timeout`/`statement_timeout` yok. `(value->>'acik')::boolean` bozuk metinde patlar. Guard yalnız tetik adına bakıyor. | yoktu | `set lock_timeout='5s'; set statement_timeout='30s';`; `jsonb_typeof(...)='boolean'` (string `"true"` KAPALI); guard `tgrelid`, `tgenabled='O'`, `prosecdef`, anon EXECUTE, `pronamespace` |
| Ç6 | `anon-definer-yetki.test.ts` yalnız kapalı olması gerekenleri sınıyor; ileride "anon'u kapat" turu `satis_kipi_oku`'yu kapatırsa mağaza **sessizce hiç açılamaz**. | yoktu | Aynı testte **"anon açık kalmalı" kabul kolu** (`satis_kipi_oku`, `url_takma_ad_coz`, `submit_contact_message`) |
| Ç7 | **Taban tazeleme migration'dan ÖNCE koşarsa işe yaramaz** (kapı migration inince yine kırmızı); taban kapısı gün çözünürlüklü. | 2. adım | Taban + `supabase:gen` migration uygulandıktan **hemen sonra, aynı pencerede** |
| Ç8 | Canlı kapı dosyası yok → adım "elle ölç" kalırdı. | elle | `scripts/db/checks/satis-kipi-canli.mjs` yazılır: **ROLLBACK'li, yan etkisiz** kollar (2a anon tablo SELECT reddi; 2b RPC yalnız `{acik,damga}`; 2c `payment` yazımı webhook atmaz; 2d satır yokken `{acik:false}`); gölgede ölçülür |

## Migration v2 (tek dosya; `supabase/migrations/2026…_satis_kipi_anahtari.sql`)

```sql
-- REC-168: satış kipi anahtarı — tek kaynak, anon'a YALNIZ boolean, koşullu tetikler, paneli kilitleyen politikalar.
-- BU MIGRATION PROD'A OTOMATİK UYGULANIR. İçerik DDL; VERİ YAZMAZ: satır yokken {acik:false} → vitrin DEĞİŞMEZ.
set lock_timeout = '5s';
set statement_timeout = '30s';
begin;

create or replace function public.satis_kipi_oku()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select jsonb_build_object(
              'acik',  case when jsonb_typeof(s.value->'acik') = 'boolean' then (s.value->'acik')::boolean else false end,
              'damga', s.updated_at)
       from public.site_settings s where s.key = 'satis_kipi' limit 1),
    jsonb_build_object('acik', false, 'damga', null));
$$;
revoke all on function public.satis_kipi_oku() from public, anon, authenticated;
grant execute on function public.satis_kipi_oku() to anon, authenticated, service_role;

-- Üç tetik (INSERT/UPDATE/DELETE ayrı: WHEN içinde OLD/NEW erişimi olaya bağlı). handle_supabase_webhook jenerik (TG_TABLE_NAME).
create trigger on_site_settings_satis_kipi_ins after insert on public.site_settings
  for each row when (new.key = 'satis_kipi') execute function public.handle_supabase_webhook();
create trigger on_site_settings_satis_kipi_upd after update on public.site_settings
  for each row when (new.key = 'satis_kipi' or old.key = 'satis_kipi') execute function public.handle_supabase_webhook();
create trigger on_site_settings_satis_kipi_del after delete on public.site_settings
  for each row when (old.key = 'satis_kipi') execute function public.handle_supabase_webhook();

-- Panelden yazma kilidi: yalnız service_role (betik). Mevcut üç politikayı YENİDEN YAZMAZ (INV-RLS-SARMA-1 katman riski yok).
create policy site_settings_satis_kipi_yalniz_servis_ins on public.site_settings
  as restrictive for insert to authenticated with check (key <> 'satis_kipi');
create policy site_settings_satis_kipi_yalniz_servis_upd on public.site_settings
  as restrictive for update to authenticated using (key <> 'satis_kipi') with check (key <> 'satis_kipi');

do $$ begin
  if not exists (select 1 from pg_proc p where p.proname = 'satis_kipi_oku' and p.pronamespace = 'public'::regnamespace
                   and p.prosecdef and has_function_privilege('anon', p.oid, 'execute')) then
    raise exception 'REC-168 guard: satis_kipi_oku() yok / DEFINER değil / anon EXECUTE yok'; end if;
  if (select count(*) from pg_trigger where tgrelid = 'public.site_settings'::regclass
        and tgname like 'on_site_settings_satis_kipi_%' and tgenabled = 'O' and not tgisinternal) <> 3 then
    raise exception 'REC-168 guard: 3 satis_kipi tetiği (ins/upd/del) etkin değil'; end if;
  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'site_settings'
        and policyname like 'site_settings_satis_kipi_yalniz_servis_%' and permissive = 'RESTRICTIVE') <> 2 then
    raise exception 'REC-168 guard: 2 RESTRICTIVE politika yok'; end if;
end $$;
commit;
```

## Tek PR'ın içeriği (Recep merge kapısı bir tur)

Migration + tek koşullu `route.ts` dalı (`table === 'site_settings'`, içeride `key === 'satis_kipi'` → `revalidateTag(SATIS_KIPI_TAG)` + `/sitemap.xml`) + `rendering-cache-standard.md` §3 satırı + `scripts/webhook_setup.sql` +
`satisKipi.ts` (hatada `throw`, `revalidate: 300`) + `anon-definer-yetki.test.ts` kabul kolu + `scripts/db/checks/satis-kipi-canli.mjs` + `satis-kipi-gecis-standard.md` §4/§11 düzeltmesi (DELETE notu, "3600 sn" cümlesi).

## Sıra

| # | Adım | Kimin | Kapı | Vitrinde değişen |
|---|---|---|---|---|
| 1 | **Gölgede ölç:** migration + 4 ret/kabul kolu (`golge-kur.mjs`; ROLLBACK'li) | URUN | gölge DB çıkış kodları | hiçbir şey |
| 2 | **Tek PR:** yukarıdaki paket | URUN yazar, **Recep merge kapısı** | supabase-migrate + squawk + INV-RENDER-2 + INV-SATIS-KIPI + anon-definer | hiçbir şey (satır yok → KAPALI) |
| 3 | **Migration uygulandıktan hemen sonra:** şema tabanı tazeleme (`sema-tabani-uret.yml`) + `pnpm supabase:gen` (tipli `.rpc` borcu kapanır) | ALTYAPI (insan PR açar) | INV-TABAN-TAZE-1, tip-drift | hiçbir şey |
| 4 | **Canlı doğrulama (anon):** RPC `{"acik":false,"damga":null}`; anon tablo SELECT RLS reddi; `payment` yazımı webhook atmıyor; admin `satis_kipi` yazımı RLS reddi, `general` upsert geçiyor | URUN | `satis-kipi-canli.mjs` + rapor | hiçbir şey |
| 5 | **Anahtarı AÇMAK bu planın işi DEĞİL:** `satis-kipine-gec.mjs --yon ac` ancak Recep + şirket + İyzico canlı anahtarı + B kapısı (yasal alanlar) yeşil | — | — | — |

## Ayrı kayıtlar (bu planın kapsamı dışında; gerekçeli)

- **Ödeme edge fonksiyonlarında sunucu tarafı satış kipi kontrolü yok** (`satis_kipi` geçen satır 0): kapı yalnız sayfa render'ında. Sayfa kapalıyken kimse ödeme başlatamaz gibi görünür, ama edge fonksiyonu doğrudan çağrılabilir. Anahtar açılmadan önce kapanmalı. Sahibi: ALTYAPI (edge) + URUN.
- Anon'un `site_settings` tablo yazma GRANT'i (baseline 10120) — ALTYAPI.
- `moderator` rolünün `payment` (İyzico anahtarı) satırını yazabilmesi — ALTYAPI/AUTH.
- INV-RENDER-2'nin bileşik koşullu tetikleri tanımaması — ALTYAPI (bu planda tek koşullu yazılarak dolanıldı, kapı iyileştirilmeli).
- `authenticated` rolünün `venthub_orders` `payment_status`/`status`/`total_amount` yazabilmesi (#1454, ölçüm defteri satır 3) — güvenlik; satış açılmadan kapanmalı.

## Ölçemediklerim

Gölge veritabanı koşumu (yukarıdaki adım 1) yapılmadı: v2'nin SQL'i **gölgede sınanmadan Recep'e sunulmaz**. `unstable_cache` `revalidate` değerinin sayfa HTML önbelleğine yayılıp yayılmadığı da ölçülmedi.
