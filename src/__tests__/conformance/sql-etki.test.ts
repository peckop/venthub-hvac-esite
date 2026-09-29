/**
 * INV-SQL-ETKI-1 — SQL yazma onay sorusu komutu değil ETKİYİ Türkçe gösterir (Ops 09-28, Recep SQL okumaz).
 *
 * Modül: .claude/hooks/sql-etki.cjs (sql-yazma-kapisi.cjs'in soru metni). Sayım ağ çağrısı burada
 * taklit edilir; canlı ölçüm (09-28): `update products … where brand='Vortice'` → 184 satır,
 * koşulsuz `update products` → 442 satır "tablonun TAMAMI", yok tablo → "ölçülemedi (… does not exist)".
 */
import { createRequire } from 'node:module'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
interface Plan {
  islem: string
  tablo: string
  sayimSql: string | null
  sabit?: number
  not: string
}
interface Etki {
  deyimlereBol: (sql: string) => string[]
  plan: (deyim: string) => Plan
  ozet: (sql: string, projectId: string | undefined, env?: Record<string, string>) => Promise<string | null>
}
const e = gerek(path.join(KOK, '.claude', 'hooks', 'sql-etki.cjs')) as Etki
const REF = 'abcdefghijklmnopqrst'
const ENV = { SUPABASE_ACCESS_TOKEN: 'test' }

afterEach(() => vi.unstubAllGlobals())

describe('INV-SQL-ETKI-1 · ayrıştırma', () => {
  it('deyimlere böler; metin, yorum ve dolar gövdesi içindeki ; bölmez', () => {
    expect(e.deyimlereBol("update t set a = 'x;y' where b = 1; -- a;b\ndelete from u; do $$ begin null; end $$")).toEqual([
      "update t set a = 'x;y' where b = 1",
      'delete from u',
      'do $$ begin null; end $$',
    ])
  })

  it('UPDATE: tablo, değişen alanlar, aynı WHERE ile sayım; RETURNING sayıma girmez', () => {
    const p = e.plan("update public.products p set category_id = 5, price = (select 1) where p.brand = 'V' returning id")
    expect(p.tablo).toBe('public.products')
    expect(p.islem).toBe('GÜNCELLE')
    expect(p.sayimSql).toBe("select count(*)::bigint as n from public.products p where  p.brand = 'V' ")
    expect(p.not).toContain('category_id, price')
  })

  it('koşulsuz UPDATE/DELETE "tablonun TAMAMI" uyarır; FROM/USING bağlı olanlar sayılmaz', () => {
    expect(e.plan('update products set price = 1').not).toContain('KOŞULSUZ')
    expect(e.plan('delete from orders').not).toContain('KOŞULSUZ')
    expect(e.plan('update products p set price = x.p from zam x where x.id = p.id').sayimSql).toBeNull()
    expect(e.plan('delete from a using b where a.id = b.id').sayimSql).toBeNull()
  })

  it('INSERT VALUES satır sayısı sabit; INSERT … SELECT ölçülemedi; ON CONFLICT DO UPDATE belirtilir', () => {
    expect(e.plan("insert into categories (name) values ('a'), ('b(c)'), ('d')").sabit).toBe(3)
    expect(e.plan('insert into t select * from u').not).toContain('ölçülemedi')
    expect(e.plan("insert into t (a) values (1) on conflict (a) do update set a = 2").islem).toContain('GÜNCELLE')
  })

  it('yapı değişikliği ve kod bloğu Türkçe adlandırılır, satır sayısı uydurulmaz', () => {
    const d = e.plan('drop table if exists _gecici')
    expect([d.islem, d.tablo, d.sayimSql]).toEqual(['YAPI KALDIR (tablo)', '_gecici', null])
    expect(e.plan('drop policy p_x on public.orders').islem).toBe('YAPI KALDIR (erişim politikası)')
    expect(e.plan('do $$ begin end $$').not).toContain('sayılamaz')
  })
})

describe('INV-SQL-ETKI-1 · özet', () => {
  it('sayım read_only kipte gider, sonuç satıra yazılır; BEGIN/ROLLBACK özetlenmez', async () => {
    const cagri = vi.fn(async (_u: string, _o: { body: string }) => ({ ok: true, text: async () => '[{"n":184}]' }))
    vi.stubGlobal('fetch', cagri)
    const s = await e.ozet("begin; update products set a = 1 where brand = 'V'; rollback;", REF, ENV)
    expect(s).toContain('products → GÜNCELLE · 184 satır')
    expect(s).not.toMatch(/BEGIN|ROLLBACK/)
    const govde = JSON.parse(cagri.mock.calls[0][1].body)
    expect(govde.read_only).toBe(true)
    expect(govde.query).toMatch(/^select count\(\*\)/)
  })

  it('sayılamayan durum sayı UYDURMAZ: API hatası, anahtar yok, proje kimliği yok', async () => {
    vi.stubGlobal('fetch', async () => ({ ok: false, text: async () => '{"message":"Failed: ERROR:  42P01: relation \\"x\\" does not exist\\nLINE 1"}' }))
    expect(await e.ozet('delete from x where a = 1', REF, ENV)).toContain('satır sayısı ölçülemedi (relation "x" does not exist)')
    expect(await e.ozet('delete from x where a = 1', REF, {})).toContain('ölçülemedi (erişim anahtarı yok)')
    expect(await e.ozet('delete from x where a = 1', undefined, ENV)).toContain('ölçülemedi (proje kimliği yok)')
  })
})
