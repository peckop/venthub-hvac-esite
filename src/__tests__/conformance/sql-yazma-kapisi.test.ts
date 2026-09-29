/**
 * INV-SQL-YAZMA-1 — canlı veritabanına yazan SQL Recep'e sorulmadan çalışmaz (REC-410 S1).
 *
 * Kanca: .claude/hooks/sql-yazma-kapisi.cjs · cetvel: docs/standards/izin-kapilari-standard.md §S1.
 * Canlı ölçüm (09-28, claude -p, araç --allowedTools ile izinli): `select 1` → sonuç döndü;
 * `begin; create temp table …; rollback;` → kanca durdurdu, çağrı Supabase'e gitmedi.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')

interface Sonuc {
  okuma: boolean
  sebep?: string
}
interface Kapi {
  siniflandir: (sql: string, fonksiyonlar?: Map<string, boolean>) => Sonuc
  karar: (girdi: unknown) => { karar: string; sebep: string } | null
  projeFonksiyonlari: (kok?: string) => Map<string, boolean>
}
const k = gerek(path.join(KOK, '.claude', 'hooks', 'sql-yazma-kapisi.cjs')) as Kapi
const FN = new Map([
  ['admin_publish_quote', true],
  ['fts_search_products', false],
])
const oku = (sql: string) => k.siniflandir(sql, FN).okuma

describe('INV-SQL-YAZMA-1 · sınıflandırma', () => {
  it('okumalar geçer: select, with, show, explain analyze select, RLS denemesi, takma ad ve CTE sütun listesi', () => {
    expect(oku('select 1')).toBe(true)
    expect(oku('with v(a,b) as (values (1,2)) select * from v')).toBe(true)
    expect(oku('select k, v from products p, jsonb_each(p.technical_specs) e(k,v)')).toBe(true)
    expect(oku('explain (analyze, buffers) select * from products')).toBe(true)
    expect(oku("begin; set local role authenticated; set local request.jwt.claims = '{}'; select 1; rollback;")).toBe(true)
    expect(oku("begin; select set_config('request.jwt.claims', '{\"sub\":\"x\"}', true); select 1; rollback;")).toBe(true)
    expect(oku("select * from public.fts_search_products('jet', 20)")).toBe(true) // STABLE
    expect(oku("select 'delete from orders' as metin -- update burada yorum")).toBe(true) // metin/yorum içi
  })

  it('yazmalar sorulur: DML, DDL, DO, CTE içinde DELETE, SELECT INTO, nextval, commit, VOLATILE fonksiyon', () => {
    for (const sql of [
      'update categories set name = 1',
      'insert into products (id) values (1)',
      'delete from orders',
      'begin; create temp table t(i int); rollback;',
      'do $$ begin perform 1; end $$',
      'with x as (delete from orders returning id) select * from x',
      'select * into yeni from products',
      "select nextval('s')",
      'begin; select 1; commit;',
      "select set_config('app.x', '1', false)",
      'select public.admin_publish_quote(1)',
      'select admin_publish_quote(1)',
      'select public.bilinmeyen_fn(1)',
      'explain analyze delete from orders',
      '',
    ]) {
      expect(oku(sql), sql).toBe(false)
    }
  })

  it('migration listesi okunamazsa her şey sorulur (güvenli yön)', () => {
    expect(k.siniflandir('select 1', new Map()).okuma).toBe(false)
  })

  it('migration\'dan fonksiyon oynaklığı okunur: son tanım kazanır, STABLE gövde dışında aranır', () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'sql-kapi-'))
    fs.mkdirSync(path.join(d, 'supabase', 'migrations'), { recursive: true })
    const m = (ad: string, govde: string) => fs.writeFileSync(path.join(d, 'supabase', 'migrations', ad), govde)
    m('20260101000000_a.sql', 'create function public.f1() returns int language sql stable as $$ select 1 $$;')
    m('20260102000000_b.sql', "create or replace function public.f1() returns int language plpgsql as $$ begin return 1; end $$;\ncreate function f2() returns int language sql as $$ select 'stable' $$ immutable;")
    const h = k.projeFonksiyonlari(d)
    expect(h.get('f1')).toBe(true) // ikinci tanım VOLATILE
    expect(h.get('f2')).toBe(false) // gövdedeki 'stable' sayılmaz, dıştaki immutable sayılır
  })

  it('gerçek depo: admin_publish_quote VOLATILE, fts_search_products STABLE', () => {
    const h = k.projeFonksiyonlari(KOK)
    expect(h.get('admin_publish_quote')).toBe(true)
    expect(h.get('fts_search_products')).toBe(false)
  })
})

describe('INV-SQL-YAZMA-1 · karar ve bağlantı', () => {
  it('apply_migration ve deploy_edge_function her zaman sorulur; ilgisiz araç karışmaz', () => {
    expect(k.karar({ tool_name: 'mcp__claude_ai_Supabase__apply_migration', tool_input: {} })?.karar).toBe('ask')
    expect(k.karar({ tool_name: 'mcp__plugin_supabase_supabase__deploy_edge_function', tool_input: {} })?.karar).toBe('ask')
    expect(k.karar({ tool_name: 'mcp__claude_ai_Supabase__execute_sql', tool_input: { query: 'select 1' } })).toBeNull()
    expect(k.karar({ tool_name: 'mcp__claude_ai_Supabase__list_tables', tool_input: {} })).toBeNull()
  })

  it('settings.json eşleyicisi iki araç adını da (claude_ai ve eklenti) yakalar', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8'))
    const grup = (ayar.hooks.PreToolUse as Array<{ matcher: string; hooks: Array<{ command: string }> }>).find((g) =>
      g.hooks.some((h) => h.command.includes('sql-yazma-kapisi.cjs')),
    )
    expect(grup).toBeDefined()
    const r = new RegExp('^(?:' + grup!.matcher + ')$')
    expect(r.test('mcp__claude_ai_Supabase__execute_sql')).toBe(true)
    expect(r.test('mcp__plugin_supabase_supabase__execute_sql')).toBe(true)
    expect(r.test('mcp__claude_ai_Supabase__apply_migration')).toBe(true)
    expect(r.test('mcp__claude_ai_Supabase__list_tables')).toBe(false)
  })
})
