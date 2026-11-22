/**
 * INV-MALIYET-KOLON-3 düzeneği (ALT-123, ALT-73 Aşama B) — authenticated rolü products'ın maliyet/tedarik
 * kolonlarını okuyamaz.
 *
 * Dört şey korunur:
 *  (1) Migration kilidin tüm parçalarını taşıyor (8 kolon listesi, tablo düzeyi SELECT'in kaldırılması, kolon düzeyi
 *      GRANT, üye/moderatör/yönetici ile kendini sınayan koruma bloğu, maliyet_yenile'nin product_costs okuması).
 *  (2) Geri alma betiği var ve kilidi gerçekten açar.
 *  (3) KİLİDİN BEDELİ: bu migration'dan SONRA products'a eklenen her yeni kolon authenticated'a açıkça grant edilir ya da
 *      `-- authenticated-kapali: <kolon>` ile bilinçli kapalı bırakılır; authenticated'a tablo düzeyi SELECT geri
 *      verilemez. Karar fonksiyonları sabotajlı sınanır.
 *  (4) Canlı nöbetçinin authenticated hükmü (warehouse_location bilinçle açık; migration inmeden ölçüm beklemede).
 *
 * Nöbetçi DB'ye bağlanır; bu paket DB'siz koşar.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

function repoKoku(): string {
  return execFileSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim()
}
const KOK = repoKoku()
const ALT123 = '20261122200000_alt123_authenticated_maliyet_kolon_kilidi.sql'
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const GERI_AL = 'scripts/db/rollback/20261122200000_alt123_authenticated_maliyet_kolon_kilidi_geri_al.sql'
const BETIK = 'scripts/db/checks/maliyet-kolon-nobetcisi.mjs'

const KOLONLAR = [
  'purchase_price',
  'purchase_currency',
  'purchase_rate_to_base',
  'cost_in_base',
  'last_purchase_cost',
  'last_purchase_currency',
  'last_purchased_at',
  'supplier_name',
] as const

/** SQL yorumlarını (-- ...) atar; kapı yorumdaki metne aldanmasın. */
const sqlYorumsuz = (m: string): string =>
  m
    .split('\n')
    .map((s) => s.replace(/--[^\r\n]*/, ''))
    .join('\n')

/** products'a eklenen kolonlardan authenticated'a grant edilmeyen ve `authenticated-kapali:` yazılmayanlar. Saf. */
export function authKararsizKolonlar(sql: string): string[] {
  const kod = sqlYorumsuz(sql)
  const eklenen = new Set<string>()
  const ifade = /alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?(?:"?public"?\.)?"?products"?\b([^;]*);/gi
  const KISIT = new Set(['constraint', 'primary', 'foreign', 'unique', 'check', 'exclude'])
  for (const m of kod.matchAll(ifade)) {
    for (const k of m[1].matchAll(/\badd\s+(?:column\s+)?(?:if\s+not\s+exists\s+)?"?([a-z_][a-z0-9_]*)"?/gi)) {
      if (!KISIT.has(k[1].toLowerCase())) eklenen.add(k[1].toLowerCase())
    }
  }
  const verilen = new Set<string>()
  for (const g of kod.matchAll(/grant\s+select\s*\(([^)]*)\)\s*on\s+(?:table\s+)?(?:public\.)?products\s+to\s+([^;]*);/gi)) {
    if (!/\bauthenticated\b/i.test(g[2])) continue
    for (const k of g[1].split(',')) verilen.add(k.trim().replace(/"/g, '').toLowerCase())
  }
  const kapali = new Set<string>()
  for (const k of sql.matchAll(/--\s*authenticated-kapali:\s*([a-z_][a-z0-9_]*)/gi)) kapali.add(k[1].toLowerCase())
  return [...eklenen].filter((k) => !verilen.has(k) && !kapali.has(k))
}

/** authenticated'a products için TABLO düzeyi SELECT/ALL verilirse kilit tümüyle açılır. Saf. */
export function authTabloGrantVar(sql: string): boolean {
  const kod = sqlYorumsuz(sql)
  const urun = /grant\s+(?:select|all)(?:\s+privileges)?\s+on\s+(?:table\s+)?(?:"?public"?\.)?"?products"?\s+to\s+[^;]*\bauthenticated\b/i
  const toplu = /grant\s+(?:select|all)(?:\s+privileges)?\s+on\s+all\s+tables\s+in\s+schema\s+"?public"?\s+to\s+[^;]*\bauthenticated\b/i
  return urun.test(kod) || toplu.test(kod)
}

interface Satir {
  kolon: string
  okunabilir: boolean
}
interface Ozet {
  acik: string[]
  eksik: string[]
  cekirdekKapali: string[]
  digerKapali: string[]
  kirmizi: boolean
  uyari: boolean
  beklemede: boolean
}
interface Nobetci {
  AUTH_HASSAS_KOLONLAR: string[]
  HASSAS_KOLONLAR: string[]
  CEKIRDEK_KOLONLAR: string[]
  degerlendirAuthenticated: (s: Satir[], baglam?: { uygulandi?: boolean }) => Ozet
}
const nobetciYukle = async (): Promise<Nobetci> =>
  (await import(pathToFileURL(path.join(KOK, BETIK)).href)) as Nobetci

describe('ALT-123 migration kilidin tüm parçalarını taşıyor', () => {
  const ham = fs.readFileSync(path.join(MIG_DIZIN, ALT123), 'utf8')
  const kod = sqlYorumsuz(ham)

  it('8 maliyet/tedarik kolonu listede, warehouse_location KAPSAM DIŞI (bilinçli sapma)', () => {
    for (const k of KOLONLAR) expect(kod, `${k} migration listesinde yok`).toContain(`'${k}'`)
    expect(/'warehouse_location'/.test(kod), 'warehouse_location bu migration ile kapatılmamalı').toBe(false)
  })

  it('tablo düzeyi SELECT kalkar, kolon düzeyi GRANT verilir, tek işlem + kilit zaman aşımı', () => {
    expect(/revoke select on public\.products from authenticated/i.test(kod)).toBe(true)
    expect(/grant select \('\s*\|\|\s*v_izinli\s*\|\|\s*'\) on public\.products to authenticated/i.test(kod)).toBe(true)
    expect(/^\s*begin;/im.test(kod) && /^\s*commit;/im.test(kod)).toBe(true)
    expect(/set local lock_timeout/i.test(kod) && /set local statement_timeout/i.test(kod)).toBe(true)
  })

  it('kendini üye, moderatör ve yönetici claim\'iyle sınar (rol taklidi)', () => {
    expect(/set local role authenticated/i.test(kod)).toBe(true)
    expect(/jsonb_build_object\('user_role', 'admin'\)/.test(kod) && /"user_role":"moderator"/.test(kod)).toBe(true)
    expect(/from public\.user_profiles where role in \('admin', 'super_admin'\)/i.test(kod), 'yönetici sınaması gerçek profil kullanmıyor').toBe(true)
    expect(/insufficient_privilege/i.test(kod)).toBe(true)
    expect(/has_column_privilege\('authenticated'/i.test(kod)).toBe(true)
    expect(/public\.maliyet_yenile\(v_json\)/i.test(kod), 'maliyet_yenile yazım yolu sınanmıyor').toBe(true)
    expect(/notify pgrst, 'reload schema'/i.test(kod)).toBe(true)
  })

  it('maliyet_yenile okumayı product_costs\'tan yapar, products\'tan maliyet kolonu OKUMAZ', () => {
    const govde = /create or replace function public\.maliyet_yenile[\s\S]*?\$function\$;/i.exec(kod)?.[0] ?? ''
    expect(govde.length).toBeGreaterThan(500)
    expect(/public\.product_costs pc/i.test(govde)).toBe(true)
    expect(/security invoker/i.test(govde)).toBe(true)
    expect(/\bp\.(purchase_price|purchase_currency|purchase_rate_to_base|cost_in_base|last_purchase_\w+|supplier_name)\b/i.test(govde),
      'maliyet_yenile hâlâ products\'tan maliyet kolonu okuyor').toBe(false)
  })

  it('anon\'a dokunmaz', () => {
    expect(/products\s+(from|to)\s+anon/i.test(kod)).toBe(false)
  })

  it('geri alma betiği var: tablo SELECT geri, eski gövde products\'tan okur, sınama içerir', () => {
    const geri = sqlYorumsuz(fs.readFileSync(path.join(KOK, GERI_AL), 'utf8'))
    expect(/grant select on public\.products to authenticated/i.test(geri)).toBe(true)
    expect(/create or replace function public\.maliyet_yenile/i.test(geri)).toBe(true)
    expect(/join public\.products p on p\.id = s\.id/i.test(geri)).toBe(true)
    expect(/has_column_privilege\('authenticated'/i.test(geri)).toBe(true)
  })
})

describe('ALT-123 kilidin bedeli: sonraki yeni products kolonu authenticated için karar ister', () => {
  const sonrakiler = fs
    .readdirSync(MIG_DIZIN)
    .filter((f) => f.endsWith('.sql') && f > ALT123)
    .map((f) => ({ f, ham: fs.readFileSync(path.join(MIG_DIZIN, f), 'utf8') }))

  it('ALT-123\'ten sonra eklenen her products kolonu authenticated\'a grant edilmiş ya da kapalı işaretli', () => {
    const kararsiz = sonrakiler.flatMap(({ f, ham }) => authKararsizKolonlar(ham).map((k) => `${f} :: ${k}`))
    expect(kararsiz, 'yeni kolon: `grant select (<kolon>) on public.products to anon, authenticated;` ya da `-- authenticated-kapali: <kolon>`').toEqual([])
  })

  it('ALT-123\'ten sonra hiçbir migration authenticated\'a products tablo düzeyi SELECT vermez', () => {
    const ihlal = sonrakiler.filter(({ ham }) => authTabloGrantVar(ham)).map(({ f }) => f)
    expect(ihlal).toEqual([])
  })

  it('SABOTAJ: kararsız kolon ve tablo düzeyi grant yakalanır; temiz örnekler geçer', () => {
    expect(authKararsizKolonlar(`alter table public.products add column yeni_a text;`)).toEqual(['yeni_a'])
    expect(authKararsizKolonlar(`alter table public.products add column yeni_a text;\ngrant select (yeni_a) on public.products to anon;`)).toEqual(['yeni_a'])
    expect(authKararsizKolonlar(`alter table public.products add column yeni_a text;\ngrant select (yeni_a) on public.products to anon, authenticated;`)).toEqual([])
    expect(authKararsizKolonlar(`-- authenticated-kapali: yeni_a\nalter table public.products add column yeni_a text;`)).toEqual([])
    expect(authTabloGrantVar(`grant select on public.products to authenticated;`)).toBe(true)
    expect(authTabloGrantVar(`grant all on table public.products to anon, authenticated;`)).toBe(true)
    expect(authTabloGrantVar(`grant select on all tables in schema public to authenticated;`)).toBe(true)
    expect(authTabloGrantVar(`grant select (id) on public.products to authenticated;`)).toBe(false)
    expect(authTabloGrantVar(`-- grant select on public.products to authenticated;`)).toBe(false)
  })
})

describe('ALT-123 nöbetçi: authenticated hükmü', () => {
  const saglikli = (n: Nobetci): Satir[] => [
    ...n.AUTH_HASSAS_KOLONLAR.map((kolon) => ({ kolon, okunabilir: false })),
    ...n.CEKIRDEK_KOLONLAR.map((kolon) => ({ kolon, okunabilir: true })),
    { kolon: 'warehouse_location', okunabilir: true }, // authenticated'da bilinçle açık
    { kolon: 'slug', okunabilir: true },
  ]

  it('hassas liste 8 kolon ve warehouse_location içermez', async () => {
    const n = await nobetciYukle()
    expect([...n.AUTH_HASSAS_KOLONLAR].sort()).toEqual([...KOLONLAR].sort())
    expect(n.HASSAS_KOLONLAR).toContain('warehouse_location')
  })

  it('sağlıklı durum TEMİZ; warehouse_location açık olması kırmızı değil', async () => {
    const n = await nobetciYukle()
    const o = n.degerlendirAuthenticated(saglikli(n), { uygulandi: true })
    expect(o.kirmizi).toBe(false)
    expect(o.acik).toEqual([])
  })

  it('SABOTAJ: açık hassas kolon, eksik kolon ve kapalı çekirdek kolon KIRMIZI', async () => {
    const n = await nobetciYukle()
    const acik = n.degerlendirAuthenticated(
      saglikli(n).map((s) => (s.kolon === 'cost_in_base' ? { ...s, okunabilir: true } : s)),
      { uygulandi: true },
    )
    expect(acik.kirmizi).toBe(true)
    expect(acik.acik).toEqual(['cost_in_base'])
    const eksik = n.degerlendirAuthenticated(saglikli(n).filter((s) => s.kolon !== 'supplier_name'), { uygulandi: true })
    expect(eksik.kirmizi).toBe(true)
    expect(eksik.eksik).toEqual(['supplier_name'])
    const kapali = n.degerlendirAuthenticated(
      saglikli(n).map((s) => (s.kolon === 'sku' ? { ...s, okunabilir: false } : s)),
      { uygulandi: true },
    )
    expect(kapali.kirmizi).toBe(true)
  })

  it('migration henüz inmediyse ölçüm BEKLEMEDE (kırmızı değil), indikten sonra aynı veri kırmızı', async () => {
    const n = await nobetciYukle()
    const acikDurum = saglikli(n).map((s) => ({ ...s, okunabilir: true }))
    const bekleyen = n.degerlendirAuthenticated(acikDurum, { uygulandi: false })
    expect(bekleyen.beklemede).toBe(true)
    expect(bekleyen.kirmizi).toBe(false)
    const olculen = n.degerlendirAuthenticated(acikDurum, { uygulandi: true })
    expect(olculen.beklemede).toBe(false)
    expect(olculen.kirmizi).toBe(true)
  })
})
