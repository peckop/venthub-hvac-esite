/**
 * INV-MALIYET-KOLON-1/2 düzeneği (ALT-73, karar 412 (a)) — anon rolü products'ın maliyet kolonlarını okuyamaz.
 *
 * Üç şey korunur:
 *  (1) ALT-73 migration'ı kilidin tüm parçalarını taşıyor (7 kolon listesi, kolon düzeyi GRANT, kendini anon
 *      rolüyle sınayan koruma bloğu, display_price(uuid) + açık EXECUTE) ve geri alma betiği var.
 *  (2) KİLİDİN BEDELİ: ALT-73'ten SONRA products'a eklenen her yeni kolon ya anon'a açıkça grant edilir ya da
 *      `-- anon-kapali: <kolon>` ile bilinçli kapalı bırakılır. Yoksa vitrin o kolonu seçince 42501 alır (sessiz değil
 *      ama geç yakalanır). Karar fonksiyonu sabotajlı sınanır.
 *  (3) Canlı nöbetçinin karar fonksiyonu ve bağlandığı yer (rls-role-coverage işi, advisor değil).
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
const ALT73 = '20261101150000_alt73_anon_maliyet_kolon_kilidi.sql'
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const GERI_AL = 'scripts/db/rollback/20261101150000_alt73_anon_maliyet_kolon_kilidi_geri_al.sql'
const BETIK = 'scripts/db/checks/maliyet-kolon-nobetcisi.mjs'
const WF = '.github/workflows/db-advisor.yml'

/** SQL yorumlarını (-- ...) atar; kapı yorumdaki metne aldanmasın. */
const sqlYorumsuz = (m: string): string =>
  m
    .split('\n')
    .map((s) => s.replace(/--.*$/, ''))
    .join('\n')

/**
 * products'a eklenen kolonlardan, aynı dosyada anon'a açıkça grant edilmeyen ve `anon-kapali:` ile
 * bilinçli kapalı bırakıldığı yazılmayanları döndürür. Saf fonksiyon (testlenir).
 */
export function anonKararsizKolonlar(sql: string): string[] {
  const kod = sqlYorumsuz(sql)
  const eklenen = new Set<string>()
  // Tablo adı tırnaklı olabilir ("public"."products"); `column` sözcüğü isteğe bağlıdır (Postgres: ADD x text).
  const ifade = /alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?(?:"?public"?\.)?"?products"?\b([^;]*);/gi
  const KISIT = new Set(['constraint', 'primary', 'foreign', 'unique', 'check', 'exclude'])
  for (const m of kod.matchAll(ifade)) {
    for (const k of m[1].matchAll(/\badd\s+(?:column\s+)?(?:if\s+not\s+exists\s+)?"?([a-z_][a-z0-9_]*)"?/gi)) {
      if (!KISIT.has(k[1].toLowerCase())) eklenen.add(k[1].toLowerCase())
    }
  }
  const verilen = new Set<string>()
  for (const g of kod.matchAll(/grant\s+select\s*\(([^)]*)\)\s*on\s+(?:table\s+)?(?:public\.)?products\s+to\s+([^;]*);/gi)) {
    if (!/\banon\b/i.test(g[2])) continue
    for (const k of g[1].split(',')) verilen.add(k.trim().replace(/"/g, '').toLowerCase())
  }
  const kapali = new Set<string>()
  for (const k of sql.matchAll(/--\s*anon-kapali:\s*([a-z_][a-z0-9_]*)/gi)) kapali.add(k[1].toLowerCase())
  return [...eklenen].filter((k) => !verilen.has(k) && !kapali.has(k))
}

/**
 * Sonraki bir migration anon'a products için TABLO düzeyi SELECT (ya da ALL) verirse kilit tümüyle açılır.
 * Statik kapı bunu yakalar (canlı nöbetçi yalnız bir sonraki push'ta görür). Saf fonksiyon.
 */
export function anonTabloGrantVar(sql: string): boolean {
  const kod = sqlYorumsuz(sql)
  const urun = /grant\s+(?:select|all)(?:\s+privileges)?\s+on\s+(?:table\s+)?(?:"?public"?\.)?"?products"?\s+to\s+[^;]*\banon\b/i
  const toplu = /grant\s+(?:select|all)(?:\s+privileges)?\s+on\s+all\s+tables\s+in\s+schema\s+"?public"?\s+to\s+[^;]*\banon\b/i
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
}
interface Nobetci {
  degerlendir: (s: Satir[], baglam?: { uygulandi?: boolean }) => Ozet & { beklemede: boolean }
  HASSAS_KOLONLAR: string[]
  CEKIRDEK_KOLONLAR: string[]
}
const nobetciYukle = async (): Promise<Nobetci> =>
  (await import(pathToFileURL(path.join(KOK, BETIK)).href)) as Nobetci

/** Sağlıklı katalog: hassaslar kapalı, çekirdek + birkaç vitrin kolonu açık. */
function saglikli(n: Nobetci): Satir[] {
  return [
    ...n.HASSAS_KOLONLAR.map((kolon) => ({ kolon, okunabilir: false })),
    ...[...n.CEKIRDEK_KOLONLAR, 'slug', 'price', 'brand'].map((kolon) => ({ kolon, okunabilir: true })),
  ]
}

const yorumsuz = (m: string): string =>
  m
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')

function isBlogu(ham: string, isAdi: string): string | null {
  const satirlar = ham.split('\n')
  const bas = satirlar.findIndex((s) => new RegExp(`^ {2}${isAdi}:\\s*$`).test(s))
  if (bas === -1) return null
  const govde: string[] = []
  for (let i = bas + 1; i < satirlar.length; i++) {
    const s = satirlar[i]
    if (s.trim() === '') {
      govde.push(s)
      continue
    }
    if (s.length - s.trimStart().length <= 2) break
    govde.push(s)
  }
  return govde.join('\n')
}

describe('ALT-73 migration ve geri alma betiği', () => {
  const ham = fs.readFileSync(path.join(MIG_DIZIN, ALT73), 'utf8')
  const kod = sqlYorumsuz(ham)

  it('8 hassas kolonun (7 maliyet + supplier_name) hepsi migration listesinde ve nöbetçi listesiyle aynı', async () => {
    const n = await nobetciYukle()
    expect(n.HASSAS_KOLONLAR).toHaveLength(8)
    expect(n.HASSAS_KOLONLAR).toContain('supplier_name')
    for (const k of n.HASSAS_KOLONLAR) {
      expect(kod.includes(`'${k}'`), `${k} migration listesinde yok`).toBe(true)
    }
  })

  it('anon tablo SELECT alınır, kolon düzeyi SELECT verilir, anon rolüyle kendini sınar', () => {
    expect(/revoke select on public\.products from anon/i.test(kod)).toBe(true)
    expect(/grant select \(' \|\| /i.test(kod)).toBe(true)
    expect(/set local role anon/i.test(kod), 'koruma bloğu anon rolüne geçmiyor').toBe(true)
    expect(/select \* ile products okuyabildi/.test(kod)).toBe(true)
    expect(/insufficient_privilege/.test(kod)).toBe(true)
  })

  it('transaction + kilit sınırları var; display_price(uuid) açık EXECUTE taşıyor', () => {
    expect(/^\s*begin;/im.test(kod) && /^\s*commit;/im.test(kod)).toBe(true)
    expect(/set lock_timeout/i.test(kod) && /set statement_timeout/i.test(kod)).toBe(true)
    expect(/function public\.display_price\(p_product_id uuid\)/i.test(kod)).toBe(true)
    expect(/grant execute on function public\.display_price\(uuid\) to anon/i.test(kod)).toBe(true)
  })

  it('anon\'un çağırdığı dört fonksiyon artık tüm-satır değil id ile fiyat çağırıyor', () => {
    expect(/display_price\(\s*p\s*\)/i.test(kod), 'tüm-satır display_price(p) kaldı').toBe(false)
    expect((kod.match(/public\.display_price\(p\.id\)/g) ?? []).length).toBeGreaterThanOrEqual(4)
  })

  it('migration authenticated rolüne DOKUNMAZ (Aşama B ayrı PR)', () => {
    expect(/products\s+(from|to)\s+authenticated/i.test(kod)).toBe(false)
  })

  it('geri alma betiği var: tablo SELECT anon\'a geri, eski çağrı, uuid aşırı yüklemesi KALIR, vitrin sınanır', () => {
    const geri = sqlYorumsuz(fs.readFileSync(path.join(KOK, GERI_AL), 'utf8'))
    expect(/grant select on public\.products to anon/i.test(geri)).toBe(true)
    expect(/drop function[^;]*display_price\(uuid\)/i.test(geri), 'uuid aşırı yüklemesi düşürülüyor').toBe(false)
    expect(/set local role anon/i.test(geri), 'geri alma vitrini anon ile sınamıyor').toBe(true)
    expect(/display_price\(\s*p\s*\)/i.test(geri)).toBe(true)
    expect(/display_price\(p\.id\)/i.test(geri), 'geri alma hâlâ id çağrısı taşıyor').toBe(false)
  })
})

describe('ALT-73 kilidin bedeli: ALT-73 sonrası yeni products kolonu karar ister', () => {
  it('SABOTAJ: grant\'sız yeni kolon yakalanır', () => {
    const k = anonKararsizKolonlar('alter table public.products add column yeni_kolon text;')
    expect(k, 'kapı kör: grant\'sız kolonu yakalamadı').toEqual(['yeni_kolon'])
  })

  it('anon\'a açık grant ya da bilinçli kapalı notu varsa temiz', () => {
    expect(
      anonKararsizKolonlar(
        'alter table public.products add column a text;\ngrant select (a) on public.products to anon, authenticated;',
      ),
    ).toEqual([])
    expect(
      anonKararsizKolonlar('-- anon-kapali: maliyet_x\nalter table public.products add column if not exists maliyet_x numeric;'),
    ).toEqual([])
  })

  it('başka role grant anon grant\'ı yerine geçmez', () => {
    expect(
      anonKararsizKolonlar(
        'alter table public.products add column a text;\ngrant select (a) on public.products to authenticated;',
      ),
    ).toEqual(['a'])
  })

  it('çok kolonlu ekleme: her kolon ayrı ayrı denetlenir', () => {
    expect(
      anonKararsizKolonlar(
        'alter table products add column a int, add column if not exists b int;\ngrant select (a) on public.products to anon;',
      ),
    ).toEqual(['b'])
  })

  it('SABOTAJ: tırnaklı tablo adı ve `column` sözcüğüsüz ekleme yakalanır; kısıt eklemesi kolon sayılmaz', () => {
    expect(anonKararsizKolonlar('alter table "public"."products" add column x text;')).toEqual(['x'])
    expect(anonKararsizKolonlar('alter table products add y text;')).toEqual(['y'])
    expect(anonKararsizKolonlar('alter table public.products add constraint c check (true), add primary key (id);')).toEqual([])
  })

  it('SABOTAJ: anon\'a tablo düzeyi SELECT/ALL (kilidi geri açan) grant yakalanır', () => {
    expect(anonTabloGrantVar('grant select on public.products to anon;')).toBe(true)
    expect(anonTabloGrantVar('GRANT ALL ON TABLE "public"."products" TO anon, authenticated;')).toBe(true)
    expect(anonTabloGrantVar('grant select on all tables in schema public to anon;')).toBe(true)
    // kolon düzeyi ve başka rol zararsız
    expect(anonTabloGrantVar('grant select (a) on public.products to anon;')).toBe(false)
    expect(anonTabloGrantVar('grant select on public.products to authenticated;')).toBe(false)
  })

  it('depodaki ALT-73 sonrası hiçbir migration anon\'a tablo düzeyi products yetkisi vermez', () => {
    const sonrasi = fs
      .readdirSync(MIG_DIZIN)
      .filter((f) => /^\d{14}_/.test(f) && f.slice(0, 14) > ALT73.slice(0, 14) && f.endsWith('.sql'))
    const kirli = sonrasi.filter((f) => anonTabloGrantVar(fs.readFileSync(path.join(MIG_DIZIN, f), 'utf8')))
    expect(kirli, 'kilidi geri açan tablo düzeyi grant').toEqual([])
  })

  it('depodaki ALT-73 sonrası tüm migration\'lar temiz', () => {
    const sonrasi = fs
      .readdirSync(MIG_DIZIN)
      .filter((f) => /^\d{14}_/.test(f) && f.slice(0, 14) > ALT73.slice(0, 14) && f.endsWith('.sql'))
    const kirli: string[] = []
    for (const f of sonrasi) {
      const k = anonKararsizKolonlar(fs.readFileSync(path.join(MIG_DIZIN, f), 'utf8'))
      if (k.length > 0) kirli.push(`${f}: ${k.join(', ')}`)
    }
    expect(
      kirli,
      'products\'a anon kararı verilmemiş kolon eklendi: `grant select (<kolon>) on public.products to anon;` ya da `-- anon-kapali: <kolon>` yaz',
    ).toEqual([])
  })
})

describe('INV-MALIYET-KOLON-2 nöbetçi karar fonksiyonu', () => {
  it('sağlıklı katalog: temiz', async () => {
    const n = await nobetciYukle()
    const o = n.degerlendir(saglikli(n))
    expect(o.kirmizi).toBe(false)
    expect(o.uyari).toBe(false)
  })

  it('SABOTAJ: anon bir maliyet kolonunu okuyabiliyorsa KIRMIZI', async () => {
    const n = await nobetciYukle()
    const s = saglikli(n).map((x) => (x.kolon === 'purchase_price' ? { ...x, okunabilir: true } : x))
    const o = n.degerlendir(s)
    expect(o.kirmizi, 'maliyet kolonu açıkken kapı kırmızı vermedi: kör').toBe(true)
    expect(o.acik).toEqual(['purchase_price'])
  })

  it('SABOTAJ: tablo düzeyi SELECT geri gelirse (tüm kolonlar okunabilir) KIRMIZI', async () => {
    const n = await nobetciYukle()
    const o = n.degerlendir(saglikli(n).map((x) => ({ ...x, okunabilir: true })))
    expect(o.kirmizi).toBe(true)
    expect(o.acik).toHaveLength(8)
  })

  it('hassas kolon katalogda yoksa (yeniden adlandırma) KIRMIZI (fail-closed)', async () => {
    const n = await nobetciYukle()
    const o = n.degerlendir(saglikli(n).filter((x) => x.kolon !== 'cost_in_base'))
    expect(o.kirmizi).toBe(true)
    expect(o.eksik).toEqual(['cost_in_base'])
  })

  it('çekirdek vitrin kolonu okunamıyorsa KIRMIZI', async () => {
    const n = await nobetciYukle()
    const o = n.degerlendir(saglikli(n).map((x) => (x.kolon === 'sku' ? { ...x, okunabilir: false } : x)))
    expect(o.kirmizi).toBe(true)
    expect(o.cekirdekKapali).toEqual(['sku'])
  })

  it('migration henüz uygulanmamışsa (PR koşumu) KIRMIZI değil, BEKLEMEDE; uygulanmışsa gerçek ölçüm', async () => {
    const n = await nobetciYukle()
    const acikDurum = saglikli(n).map((x) => ({ ...x, okunabilir: true }))
    const bekleyen = n.degerlendir(acikDurum, { uygulandi: false })
    expect(bekleyen.kirmizi).toBe(false)
    expect(bekleyen.beklemede).toBe(true)
    // aynı (açık) katalog migration UYGULANMIŞKEN kırmızıdır: bekleme yolu gerçek ölçümü gizlemez
    const olculen = n.degerlendir(acikDurum, { uygulandi: true })
    expect(olculen.kirmizi).toBe(true)
    expect(olculen.beklemede).toBe(false)
  })

  it('hassas olmayan başka kolon kapalıysa yalnız UYARI', async () => {
    const n = await nobetciYukle()
    const o = n.degerlendir([...saglikli(n), { kolon: 'yeni_kolon', okunabilir: false }])
    expect(o.kirmizi).toBe(false)
    expect(o.uyari).toBe(true)
    expect(o.digerKapali).toEqual(['yeni_kolon'])
  })
})

describe('INV-MALIYET-KOLON-2 düzenek', () => {
  it('FAIL-CLOSED: SUPABASE_DB_URL boşken nöbetçi çıkış kodu != 0 (davranış ölçümü)', () => {
    let kod = 0
    try {
      execFileSync(process.execPath, [path.join(KOK, BETIK)], {
        cwd: KOK,
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env, SUPABASE_DB_URL: '' },
      })
    } catch (e) {
      kod = (e as { status?: number }).status ?? 1
    }
    expect(kod, 'env yokken nöbetçi YEŞİL döndü — ölçmemek geçmek değildir').not.toBe(0)
  })

  it('nöbetçi rls-role-coverage işinde, advisor (continue-on-error) işinde DEĞİL', () => {
    const ham = fs.readFileSync(path.join(KOK, WF), 'utf8')
    expect(yorumsuz(ham).includes(BETIK), 'nöbetçi hiçbir adımda çağrılmıyor').toBe(true)
    const rls = isBlogu(ham, 'rls-role-coverage')
    const advisor = isBlogu(ham, 'advisor')
    expect(rls, 'rls-role-coverage işi bulunamadı').toBeTruthy()
    expect((rls as string).includes(BETIK), 'nöbetçi rls-role-coverage işinde değil').toBe(true)
    expect((advisor ?? '').includes(BETIK), 'nöbetçi advisor işine konmuş').toBe(false)
    const rlsKod = yorumsuz(rls as string)
    expect(/continue-on-error/.test(rlsKod), 'taşıyıcı işte continue-on-error var').toBe(false)
    expect(/set -Eeuo pipefail/.test(rlsKod), 'pipefail yok').toBe(true)
  })
})
