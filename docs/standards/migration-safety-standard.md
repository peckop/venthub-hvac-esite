# Migration Güvenlik Standardı — Yıkıcı Şema Değişiklikleri (DROP/RENAME/TYPE)

> **Doğuş sebebi (2026-08-13, F5-B D4 / ultrareview #480):** 8 legacy kolonun DROP'u
> öncesi kod tarafı tam taranmıştı (tip-Omit zorlayıcı, tsc 0) ama iki arama RPC'sinin
> plpgsql gövdesi `p.description` referanslıyordu ve iyzico-payment edge function'ı
> `select=...,image_url` çekiyordu. İkisini de hiçbir mevcut kapı göremedi; bağımsız
> inceleme (ultrareview) merge'den saatler önce yakaladı. Bu cetvel o iki kör noktayı
> **yapısal** olarak kapatır: guard'lar apply anında çalışır, insan disiplinine dayanmaz.

## Neden mevcut kapılar yetmez (iki fiziksel gerçek)

1. **Postgres, plpgsql gövdelerini kolon-bağımlılığı olarak İZLEMEZ.** `LANGUAGE sql`
   fonksiyonlar ve view'lar DROP'u bloklar; plpgsql gövdesi ise opak metindir —
   `ALTER TABLE ... DROP COLUMN` **sessizce geçer**, fonksiyon ilk çağrıda
   `column ... does not exist` ile patlar.
2. **PostgREST, select listesindeki tek bilinmeyen kolonda TÜM sorguyu 400'ler.**
   Edge function'lardaki `?select=a,b,c` string'i tsc için opaktır; çağıran taraf
   çoğu zaman `if (res.ok)` ile sessizce boş veriye düşer.

## KURAL: Yıkıcı migration = Preflight (4 süpürme) + Guard şablonu

### Preflight — migration YAZILMADAN önce (LLM/geliştirici cetveli)

| # | Süpürme | Araç | Ne arar |
|---|---------|------|---------|
| 1 | **TS kaynak** | tip-Omit zorlayıcı (`db-rows.ts`'te `Omit<Row, DroppedCols>`) + `pnpm type-check` | Kolonun tüm TS okuyucuları derlenemez olur — kalan çağıran varsa tsc gösterir |
| 2 | **DB-içi kod** | canlı SQL (aşağıdaki sorgu) — ikiz/doküman DEĞİL, `pg_proc` gerçeği | Fonksiyon gövdeleri + view'lar + trigger fonksiyonlarında referans |
| 3 | **Edge function'lar** | `INV-8` conformance testi (`edge-select-columns.test.ts`) + elle grep | REST `select=` ve `.select('...')` string'lerinde kolon adı |
| 4 | **Veri** | apply-anı guard (şablonda) | Silinecek kolonlarda korunması gereken veri kalmadığının kanıtı |

**Süpürme 2 sorgusu** (kolon adlarını düzenleyip Supabase'de çalıştır):

```sql
select p.proname, l.lanname
from pg_proc p
join pg_language l on l.oid = p.prolang
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosrc ~* '\m(KOLON1|KOLON2)\M';
-- + view'lar:
select viewname from pg_views
where schemaname = 'public' and definition ~* '\m(KOLON1|KOLON2)\M';
```

> Metinsel eşleşme başka tablonun aynı adlı kolonunda yanlış-pozitif verebilir —
> listeyi gözden geçir; yanlış-pozitif, sessiz kırılmadan DAİMA iyidir. Bulunan her
> fonksiyon, **aynı migration içinde DROP'tan ÖNCE** `create or replace` ile
> yeni şemaya geçirilir (örnek: `20260812_f5b_d4_drop_legacy_columns.sql` §1b).

### Guard şablonu — migration'ın İÇİNE (apply anında kendini doğrular)

```sql
begin;

-- A) Ön-guard: veri gerçekten taşınmış/boş mu? (sayıya döküp raise et)
do $$
declare v_bad int;
begin
  select count(*) into v_bad from public.TABLO
   where KOLON is not null; -- projeye göre daralt
  if v_bad <> 0 then
    raise exception 'DROP iptal: % satirda korunmasi gereken veri var', v_bad;
  end if;
end $$;

-- B) Ön-guard: DB-içi kod hâlâ referanslıyor mu? (plpgsql sessiz-DROP kilidi)
do $$
declare v_refs text;
begin
  select string_agg(p.proname, ', ') into v_refs
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prosrc ~* '\m(KOLON1|KOLON2)\M';
  if v_refs is not null then
    raise exception 'DROP iptal: fonksiyon govdeleri hala referansliyor: %', v_refs;
  end if;
end $$;

-- C) (Gerekliyse) bağımlı fonksiyonları yeni şemaya geçir: create or replace ...

-- D) Yıkıcı değişiklik: alter table ... drop column ...

-- E) Son-guard: kritik RPC'leri GERÇEKTEN ÇAĞIR (varlık kontrolü yetmez —
--    plpgsql kolonları çağrı anında çözer, sessiz kırığı yalnız çağrı yakalar)
do $$
declare v int;
begin
  select count(*) into v from public.KRITIK_RPC('ornek', 5, 0, null);
  if v < 1 then raise exception 'KRITIK_RPC bozuk: % sonuc', v; end if;
end $$;

commit;
```

## KURAL: her migration ATOMİK uygulanır (INV-MIGRATION-1)

Yıkıcılıktan bağımsız, **her** migration için geçerli. Yarım uygulanmış bir migration,
yanlış uygulanmış bir migration'dan daha kötüdür: DB tutarsız kalır, ledger'a yazılmaz ve
bir sonraki koşu **baştan dener** — yani yarım uygulama ikinci kez yaşanır.

Çalıştırıcı (`supabase-migrate.yml`) iki biçim tanır, üçüncüsü yoktur:

| Biçim | Dosyada | Çalıştırıcı ne yapar |
|---|---|---|
| **(a) kendi işlemini yönetir** | `BEGIN;` … `COMMIT;` | olduğu gibi koşar (`psql -f`) |
| **(b) işlem denetimi yok** | ne `BEGIN` ne `COMMIT` | `psql --single-transaction` ile **sarar** |

**Biçim (a) niçin körü körüne sarılmaz:** bazı ifadeler bir transaction bloğunun içinde
**çalışamaz** — `CREATE INDEX CONCURRENTLY`, `DROP INDEX CONCURRENTLY`, `VACUUM`,
`ALTER SYSTEM`. Yazar bunları bilinçli olarak `COMMIT;`'ten **sonra** bırakır.
Kanonik örnek: `20260402000000_security_and_performance_hardening.sql`
(`BEGIN@7` … `COMMIT@95`, ardından `CREATE INDEX CONCURRENTLY@103-112`).

**Bekçi:** `src/__tests__/conformance/migration-atomicity.test.ts` üç şeyi PR anında
denetler — (1) `BEGIN`/`COMMIT` sayıları dengeli, (2) işlem-dışı ifade `BEGIN…COMMIT`
**arasında** değil, (3) işlem-dışı ifade taşıyan dosya `BEGIN/COMMIT`'siz **değil**
(öyleyse çalıştırıcı sarar ve PostgreSQL reddeder).

> Niçin PR anında: bu hata sınıfı yerelde **görünmez**. `tsc`/`lint`/`deno check` SQL
> metnini yorumlamaz. Tek diğer görülme anı prod deploy'udur ve orada iş işten geçmiştir
> (CLAUDE.md kural 13: merge = prod'a otomatik apply). Bekçi üç ihlal tipi de **bilerek
> yaratılarak** kanıtlandı; üçü de FAIL verdi, dosyalar silindi.

## Kapsam ve sınırlar

- Bu cetvel **yıkıcı** değişiklikler içindir: `DROP COLUMN/TABLE/FUNCTION`,
  `RENAME`, kolon tipi daraltma. Salt-ekleyici (ADDITIVE) migration'lar için
  guard B/E zorunlu değildir (A tavsiye edilir).
- Migration merge = prod'a otomatik apply (CLAUDE.md §13) — guard'ların değeri tam
  da budur: kırmızı durursa DROP hiç çalışmaz, prod bozulmadan workflow FAIL verir.
- İlgili kalıcı bekçiler: `INV-MIGRATION-1` (işlem sınırı, yukarıda) · `INV-8 edge-select-columns` (şema↔edge sınırı) ·
  `pr-size-check` büyük-dosya guard'ı (çalışma-ağacı hijyeni).
