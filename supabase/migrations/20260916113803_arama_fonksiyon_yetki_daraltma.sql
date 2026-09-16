-- REC-340 Adım 2 ONARIMI — arama fonksiyonlarının EXECUTE yetkisi daraltılır
--
-- ⛔KURAL 13: bu dosya master'a merge edilince prod DB'ye OTOMATİK uygulanır.
--
-- ============================================================================================
-- KUSUR — ölçüldü, canlı prod, 2026-09-16 (merge SONRASI)
-- ============================================================================================
-- `20260916093000_arama_indeksi_ve_govde.sql` tabloda yetkiyi açıkça daralttı
-- (`revoke all on public.product_search_index from anon, authenticated`) ama **fonksiyonlarda
-- aynı şeyi yapmadı**. PostgreSQL'de yeni bir fonksiyonun varsayılanı `EXECUTE to PUBLIC`'tir
-- ve bu veritabanında `pg_default_acl` ayrıca `anon`/`authenticated` rollerine de veriyor.
--
-- Canlıda ölçülen ACL (beş fonksiyonun beşinde de aynı):
--   =X/postgres | postgres=X/postgres | anon=X/postgres | authenticated=X/postgres | service_role=X/postgres
--   has_function_privilege('anon', ..., 'execute') = **true**
--
-- ⭐SOMUT ETKİ: `arama_indeksi_tazele` ve `arama_kuyrugu_bosalt` **skaler dönüşlü**, yani
--   PostgREST onları `/rest/v1/rpc/<ad>` altında yayınlar. Kimliksiz bir istemci
--   `arama_indeksi_tazele(null)` çağırıp **442 satırlık tam yeniden indekslemeyi** tetikleyebilir
--   ve bunu istediği sıklıkta tekrarlayabilir. Sınıfı: kaynak tüketimi / hizmet aksatma.
--
-- ⚠SINIR — ABARTMIYORUM: bu bir **tenant sızıntısı DEĞİL.** Fonksiyon `SECURITY DEFINER` ama
--   tenant eşitliği üç JOIN şartına elle yazılı (`X.tenant_id = p.tenant_id`), yani çağıran kim
--   olursa olsun satırlar kendi tenant'ında kalıyor. Yazılan içerik de zaten kaynak tablolardan
--   yeniden üretiliyor — veri bozulmuyor, yalnız boşuna iş yapılıyor.
--
-- ⚠Üç tetik fonksiyonu (`tg_*`) `returns trigger` döndüğü için PostgREST onları **yayınlamaz**;
--   yine de aynı daraltma uygulanıyor, çünkü "bugün çağrılamıyor" ile "çağrılamaz" ayrı şeyler.
--
-- BULAN: OPS'un Open Code Review kıyası (dört bağımsız inceleyiciden ikisi, ikisi de "yüksek").
-- İddia ADAY olarak geldi, hüküm olarak değil; ben `has_function_privilege` ile ÖLÇTÜM ve
-- doğru çıktı. Repo konvansiyonu zaten REVOKE+GRANT yönündeydi
-- (`20260602080000_security_hardening_fixes.sql`, `20260816143015_*`), ben onu kaçırdım.
--
-- GÖLGEDE DOĞRULANDI (2026-09-16): REVOKE sonrası `has_function_privilege('anon',...)` false
-- oluyor VE tetikler çalışmaya devam ediyor — ürün adı değişti, gövde tazelendi; kategori adı
-- değişti, kuyruğa satır düştü. Tetik fonksiyonu için EXECUTE yetkisi tetik YARATILIRKEN
-- kontrol edilir, çalışma anında değil.

-- Kilit kuyruğunda bekleyip tabloyu kilitlemek yerine hızlı başarısız ol (INV-MIGRATION-3).
-- Burada kilit riski düşük (yalnız katalog yazımı), ama kural biçimseldir ve istisna aranmaz.
set lock_timeout = '5s';
set statement_timeout = '5s';

begin;

revoke execute on function public.arama_indeksi_tazele(uuid[])   from public, anon, authenticated;
revoke execute on function public.arama_kuyrugu_bosalt(integer)  from public, anon, authenticated;
revoke execute on function public.tg_arama_urun_tazele()         from public, anon, authenticated;
revoke execute on function public.tg_arama_aile_kuyrukla()       from public, anon, authenticated;
revoke execute on function public.tg_arama_kategori_kuyrukla()   from public, anon, authenticated;

-- ============================================================================================
-- GUARD — DAVRANIŞ ölçer
-- ============================================================================================
do $guard$
declare
  r record;
  v_acik text := '';
begin
  for r in
    select p.oid,
           p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as ad
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname in ('arama_indeksi_tazele', 'arama_kuyrugu_bosalt',
                         'tg_arama_urun_tazele', 'tg_arama_aile_kuyrukla',
                         'tg_arama_kategori_kuyrukla')
  loop
    if has_function_privilege('anon', r.oid, 'execute')
       or has_function_privilege('authenticated', r.oid, 'execute') then
      v_acik := v_acik || r.ad || ' ';
    end if;
  end loop;

  if v_acik <> '' then
    raise exception '[REC-340 yetki guard] HALA ACIK: %', v_acik;
  end if;

  raise notice '[REC-340 yetki guard] GECTI — bes arama fonksiyonunun hicbiri anon/authenticated tarafindan CAGRILAMIYOR';
end;
$guard$;

commit;
