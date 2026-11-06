// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { Client } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { ODEME_DURUM_IZIN, SIPARIS_DURUM_IZIN } from '../../../supabase/functions/_shared/siparis_gecis'

/**
 * INV-SIPARIS-MONOTON-PG-1 · güvenlik karnesi 2026-11 P1 kilit (c) — tetik GERÇEK Postgres'te koşar (OPS-221).
 *
 * ⭐NİÇİN VAR: `siparis-monoton-durum.test.ts` migration METNİNİ okur (izin tablosu, tetik biçimi); migration'ın
 * kendi DO bloğu davranışı yalnız UYGULANDIĞI anda, prod'da ölçer. "service_role ile `delivered → confirmed`
 * UPDATE hata verir" cümlesini CI'da hiçbir test bir veritabanında KOŞTURMUYORDU (PGlite depoda yok).
 * Bu dosya `20261103120000_venthub_orders_monoton_durum.sql` dosyasını OLDUĞU GİBİ boş bir Postgres'e uygular
 * ve geçişleri `service_role` (BYPASSRLS) rolüyle dener.
 *
 * KOŞUM: `VENTHUB_TEST_PG_URL` boş bir test veritabanını gösterir. CI'da `.github/workflows/siparis-tetik-pg.yml`
 * bir `postgres:16` servisi açar ve `VENTHUB_TEST_PG_ZORUNLU=1` ile koşar: orada veritabanı yoksa KIRMIZIDIR.
 * Normal test paketinde (adres yok) kol ATLANIR ve atlandığı görünür — ATLANMIŞ KOL YEŞİL DEĞİLDİR.
 * Yerelde:
 *   VENTHUB_TEST_PG_URL=postgres://postgres:postgres@localhost:5432/vh_tetik_test VENTHUB_TEST_PG_ZORUNLU=1 \
 *     pnpm exec vitest run src/__tests__/conformance/siparis-monoton-tetik-pg.test.ts
 *
 * ⚠GÜVENLİK: test, `public.venthub_orders` ZATEN VARSA çalışmayı reddeder — yanlışlıkla gerçek bir veritabanına
 * bağlanırsa hiçbir şey yazmadan düşer. Tablo burada yalnız tetiğin dokunduğu kolonlarla kurulur (sahte şema).
 *
 * ⚠ÖLÇMEDİĞİ: prod'daki tetiğin gerçekten kurulu olduğu (migration zinciri ve `supabase-migrate.yml` ölçer),
 * tablo sahibinin `DISABLE TRIGGER` ile tetiği kapatabilmesi (bilinen sınır, migration başlığında yazılı).
 */

const KOK = path.resolve(__dirname, '../../..')
const MIGRATION = path.join(KOK, 'supabase/migrations/20261103120000_venthub_orders_monoton_durum.sql')
const URL_ = (process.env.VENTHUB_TEST_PG_URL ?? '').trim()
const ZORUNLU = process.env.VENTHUB_TEST_PG_ZORUNLU === '1'

const DURUMLAR = Object.keys(SIPARIS_DURUM_IZIN)
const ODEMELER = Object.keys(ODEME_DURUM_IZIN)

describe('INV-SIPARIS-MONOTON-PG-1 · koşum koşulu', () => {
  it('ZORUNLU kipte veritabanı adresi VAR (yokluk "temiz" değil, "ölçülemedi"dir)', () => {
    if (ZORUNLU) expect(URL_, 'VENTHUB_TEST_PG_URL yok — tetik davranisi OLCULEMEDI').not.toBe('')
    expect(fs.existsSync(MIGRATION), 'migration dosyasi tasindi ya da silindi').toBe(true)
  })
})

describe.skipIf(!URL_)('INV-SIPARIS-MONOTON-PG-1 · tetik gerçek Postgres\'te (karne P1 kilit c)', () => {
  let db: Client

  beforeAll(async () => {
    db = new Client({ connectionString: URL_ })
    await db.connect()
    const var_ = await db.query<{ v: string | null }>("select to_regclass('public.venthub_orders')::text as v")
    if (var_.rows[0]?.v) {
      throw new Error('public.venthub_orders zaten var: bu test yalniz BOS bir test veritabaninda kosar, hicbir sey yazilmadi')
    }
    // Supabase rolleri (migration `revoke ... from anon, authenticated` diyor; yoksa düşer).
    await db.query(`
      do $r$ begin
        if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
        if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
        if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
      end $r$;
      create table public.venthub_orders (
        id uuid primary key default gen_random_uuid(),
        status text not null default 'pending',
        payment_status text default 'pending',
        customer_name text
      );
      grant select, insert, update on public.venthub_orders to service_role;
    `)
    // Migration OLDUĞU GİBİ uygulanır (begin/commit ve kendi DO doğrulaması dahil).
    await db.query(fs.readFileSync(MIGRATION, 'utf8'))
  })

  afterAll(async () => {
    if (!db) return
    await db.query('drop table if exists public.venthub_orders').catch(() => undefined)
    await db.end()
  })

  /** Satırı kurar, service_role olarak günceller; hata SQLSTATE'ini (ya da null) döner. Her deneme geri alınır. */
  async function dene(
    eski: { status: string; payment_status: string | null },
    yeni: { status?: string; payment_status?: string | null; customer_name?: string },
  ): Promise<string | null> {
    await db.query('begin')
    try {
      const r = await db.query<{ id: string }>(
        'insert into public.venthub_orders (status, payment_status) values ($1, $2) returning id',
        [eski.status, eski.payment_status],
      )
      await db.query('set local role service_role')
      const alanlar = Object.keys(yeni)
      const set = alanlar.map((k, i) => `${k} = $${i + 2}`).join(', ')
      await db.query(`update public.venthub_orders set ${set} where id = $1`, [r.rows[0].id, ...alanlar.map((k) => yeni[k as keyof typeof yeni])])
      return null
    } catch (e) {
      return (e as { code?: string }).code ?? 'bilinmiyor'
    } finally {
      await db.query('rollback')
    }
  }

  it('tetik kurulu ve parasız paid tetikleri (ALT-133) yok', async () => {
    const t = await db.query<{ tgname: string }>(
      "select tgname from pg_trigger where tgrelid = 'public.venthub_orders'::regclass and not tgisinternal",
    )
    expect(t.rows.map((r) => r.tgname)).toEqual(['trg_orders_monoton_durum'])
    const f = await db.query("select 1 from pg_proc where proname = 'sync_payment_status_with_status'")
    expect(f.rowCount).toBe(0)
  })

  it('service_role BYPASSRLS taşıyor (testin ölçtüğü rol gerçekten RLS üstü)', async () => {
    const r = await db.query<{ rolbypassrls: boolean }>("select rolbypassrls from pg_roles where rolname = 'service_role'")
    expect(r.rows[0]?.rolbypassrls).toBe(true)
  })

  it('P1 (c): service_role ile delivered → confirmed UPDATE VH409 ile düşer', async () => {
    expect(await dene({ status: 'delivered', payment_status: 'paid' }, { status: 'confirmed' })).toBe('VH409')
  })

  it('P1 (c): callback\'in eski başarı yazımı (status=confirmed, payment_status=paid) teslim/iade satırında düşer', async () => {
    for (const eski of [
      { status: 'delivered', payment_status: 'paid' },
      { status: 'delivered', payment_status: 'refunded' },
      { status: 'shipped', payment_status: 'partial_refunded' },
      { status: 'cancelled', payment_status: 'refunded' },
    ]) {
      expect(await dene(eski, { status: 'confirmed', payment_status: 'paid' }), JSON.stringify(eski)).toBe('VH409')
    }
  })

  it('P1 (c): callback\'in eski ret yazımı (payment_status=failed) ödenmiş/iade satırında düşer', async () => {
    for (const payment_status of ['paid', 'refunded', 'partial_refunded']) {
      expect(await dene({ status: 'confirmed', payment_status }, { payment_status: 'failed' }), payment_status).toBe('VH409')
    }
  })

  it('meşru yollar geçer: pending → confirmed+paid, teslim sonrası iade, NULL ödeme, durum dışı kolon', async () => {
    expect(await dene({ status: 'pending', payment_status: 'pending' }, { status: 'confirmed', payment_status: 'paid' })).toBeNull()
    expect(await dene({ status: 'pending', payment_status: 'failed' }, { status: 'confirmed', payment_status: 'paid' })).toBeNull()
    expect(await dene({ status: 'delivered', payment_status: 'paid' }, { payment_status: 'refunded' })).toBeNull()
    expect(await dene({ status: 'pending', payment_status: null }, { payment_status: 'paid' })).toBeNull()
    expect(await dene({ status: 'delivered', payment_status: 'refunded' }, { customer_name: 'anonim' })).toBeNull()
  })

  it(`yaşam döngüsü: ${DURUMLAR.length}×${DURUMLAR.length} geçişin HER biri ortak izin tablosuyla aynı sonucu verir`, async () => {
    const ayri: string[] = []
    for (const a of DURUMLAR) {
      for (const b of DURUMLAR) {
        if (a === b) continue
        const izinli = SIPARIS_DURUM_IZIN[a].includes(b)
        const kod = await dene({ status: a, payment_status: 'paid' }, { status: b })
        if (izinli ? kod !== null : kod !== 'VH409') ayri.push(`${a}->${b} beklenen=${izinli ? 'gecer' : 'VH409'} olculen=${kod ?? 'gecti'}`)
      }
    }
    expect(ayri).toEqual([])
  })

  it(`ödeme: ${ODEMELER.length}×${ODEMELER.length} geçişin HER biri ortak izin tablosuyla aynı sonucu verir`, async () => {
    const ayri: string[] = []
    for (const a of ODEMELER) {
      for (const b of ODEMELER) {
        if (a === b) continue
        const izinli = ODEME_DURUM_IZIN[a].includes(b)
        const kod = await dene({ status: 'confirmed', payment_status: a }, { payment_status: b })
        if (izinli ? kod !== null : kod !== 'VH409') ayri.push(`${a}->${b} beklenen=${izinli ? 'gecer' : 'VH409'} olculen=${kod ?? 'gecti'}`)
      }
    }
    expect(ayri).toEqual([])
  })
})
