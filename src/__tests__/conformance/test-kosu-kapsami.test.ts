import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-KOSU-1 · HER TEST DOSYASI EN AZ BİR YERDE KOŞAR; PR kapısından çıkan her test yeni yerinde GERÇEKTEN koşar (ALT-38).
 *
 * NİÇİN VAR: dünya durumu testleri `ci` işinin PR koşusundan çıkarıldı (kip `dislan`) ve iki yeni yerde koşuyor: master push
 * (aynı `ci` işi, tam paket) ve zamanlı `dunya-durumu.yml` (kip `yalniz`). "Hiçbir koruma sessizce düşmez" sözünün mekanik
 * karşılığı budur. Bu kapı şu bozulma yollarını yakalar, hepsi SESSİZDİR (kimse kırmızı görmez, koruma yok olur):
 *   1. listedeki bir testin dosyası silinir/taşınır (yetim kayıt): test hiçbir yerde koşmaz,
 *   2. liste `zamanli` yeri olmadan kalır ya da iş akışı `schedule`/`yalniz` kipini yitirir: test yalnız master push'ta koşar
 *      (master koşuları concurrency ile %37 iptal ediliyor: ölçüldü 07-06..10-06, 1119 koşunun 419'u),
 *   3. `ci` işinin Test adımı `dislan` kipini PR dışına da verir: master push da testi atlar,
 *   4. vitest `exclude` listesine yeni bir dışlama eklenir ama burada gerekçesi ve yeni yeri yazılmaz (belgesiz dışlama).
 * "Dışarıda" olan her test dosyası aşağıdaki VITEST_DISI tablosunda gerekçesiyle ve KOŞTUĞU YERLE yazılıdır.
 *
 * Ölçüm yüzeyi: `git ls-files` + `node:fs` + satır taraması. Hiçbir dosyayı DEĞİŞTİRMEZ.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const D = require_(path.join(KOK, 'scripts/ci/dunya-durumu.cjs')) as {
  ayar: (env: Record<string, string | undefined>, liste: Liste) => { kip: string; exclude: string[]; include: string[] | null }
  dogrula: (liste: Liste, dosyaVarMi?: (yol: string) => boolean) => string[]
  listeyiOku: () => Liste
  TEST_DESENI: RegExp
}
interface Kayit {
  test: string
  neden: string
  kanit: string
  yeniYer: string[]
}
interface Liste {
  surum: number
  testler: Kayit[]
}

/** vitest.config.ts'in STATİK dışlamaları: her biri burada gerekçesiyle ve koştuğu yerle yazılı olmak ZORUNDA. */
const VITEST_DISI: Array<{ desen: RegExp; neden: string; yer: string; kanit: string[] }> = [
  {
    desen: /^tests\/e2e\/empirical_.*\.test\.ts$/,
    neden: 'CANLI veritabanına bağlanır (repo kökündeki .env, DATABASE_URL); CI\'da .env yoktur',
    yer: 'elle, yerelde: pnpm vitest run tests/e2e/empirical_db.test.ts (kökte .env varken)',
    kanit: [],
  },
  {
    desen: /^tests\/smoke\//,
    neden: 'ayakta bir sunucu ister, SMOKE_BASE_URL yoksa fail-closed düşer; ci işinin Test adımı sunucusuz toplayıp kırmızı verirdi',
    yer: 'vitest.smoke.config.ts (pnpm test:ssr-smoke) ve ssr-duman-alarmi.yml',
    kanit: ['vitest.smoke.config.ts', '.github/workflows/ssr-duman-alarmi.yml'],
  },
]

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: KOK, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}
const testDosyalari = () =>
  git(['ls-files'])
    .split('\n')
    .filter((d) => d && D.TEST_DESENI.test(d))
    .sort()

const yorumsuz = (metin: string) =>
  metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')

/** Liste ↔ iş akışı bağını denetler; ihlalleri döner (boş = sağlam). Parametreler sabotaj testleri için enjekte edilir. */
function denetle(ci: string, dunyaYml: string, liste: Liste, dosyaVarMi: (yol: string) => boolean): string[] {
  const ihlal: string[] = []
  ihlal.push(...D.dogrula(liste, dosyaVarMi))
  const c = yorumsuz(ci)
  const y = yorumsuz(dunyaYml)
  if (liste.testler.length === 0) ihlal.push('liste BOŞ: dünya durumu testi yoksa kip/iş akışı anlamsız (kasıtlıysa iş akışı ve kapı birlikte kaldırılır)')

  const masterPushYeri = liste.testler.some((t) => t.yeniYer.includes('master-push'))
  if (masterPushYeri) {
    if (!/^ {2}push:\n {4}branches: \[master\]/m.test(c)) ihlal.push('ci.yml `push: branches: [master]` yok: master-push yeri koşmaz')
    if (!/^\s+VENTHUB_DUNYA_DURUMU: \$\{\{ github\.event_name == 'pull_request' && 'dislan' \|\| '' \}\}\s*$/m.test(c)) {
      ihlal.push("ci.yml Test adımı `VENTHUB_DUNYA_DURUMU: ${{ github.event_name == 'pull_request' && 'dislan' || '' }}` değil: dışlama PR dışına taşıyor ya da hiç yok")
    }
  }
  if (liste.testler.some((t) => t.yeniYer.includes('zamanli'))) {
    if (!/^\s+- cron: '[^']+'\s*$/m.test(y) || !/^\s*schedule:\s*$/m.test(y)) ihlal.push('dunya-durumu.yml `schedule:` + cron yok: zamanlı yer koşmaz')
    if (!/^\s+VENTHUB_DUNYA_DURUMU: yalniz\s*$/m.test(y)) ihlal.push('dunya-durumu.yml `VENTHUB_DUNYA_DURUMU: yalniz` yok: listedeki testler koşmaz')
    if (!/run: pnpm test -- --run/.test(y)) ihlal.push('dunya-durumu.yml `pnpm test -- --run` koşturmuyor')
    if (!/^\s+workflow_dispatch:\s*$/m.test(y)) ihlal.push('dunya-durumu.yml elle tetiklenemez (workflow_dispatch yok)')
  }
  return ihlal
}

describe('INV-TEST-KOSU-1 — her test dosyası bir yerde koşar, çıkan testin yeni yeri gerçek', () => {
  const liste = D.listeyiOku()
  const ci = readFileSync(path.join(KOK, '.github/workflows/ci.yml'), 'utf8').replace(/\r\n/g, '\n')
  const dunyaYml = readFileSync(path.join(KOK, '.github/workflows/dunya-durumu.yml'), 'utf8').replace(/\r\n/g, '\n')
  const var_ = (yol: string) => existsSync(path.join(KOK, yol))

  it('bugünkü liste, ci.yml ve dunya-durumu.yml tutarlı', () => {
    expect(denetle(ci, dunyaYml, liste, var_)).toEqual([])
  })

  it('üç kip: tam hiçbir şeyi dışarıda bırakmaz, dislan listeyi dışlar, yalniz yalnız listeyi koşar', () => {
    const yollar = liste.testler.map((t) => t.test)
    expect(D.ayar({}, liste)).toEqual({ kip: 'tam', exclude: [], include: null })
    expect(D.ayar({ VENTHUB_DUNYA_DURUMU: '' }, liste)).toEqual({ kip: 'tam', exclude: [], include: null })
    expect(D.ayar({ VENTHUB_DUNYA_DURUMU: 'dislan' }, liste)).toEqual({ kip: 'dislan', exclude: yollar, include: null })
    expect(D.ayar({ VENTHUB_DUNYA_DURUMU: 'yalniz' }, liste)).toEqual({ kip: 'yalniz', exclude: [], include: yollar })
  })

  it('geçersiz kip FIRLATIR (yazım hatası kapıyı sessizce kaldırmasın)', () => {
    expect(() => D.ayar({ VENTHUB_DUNYA_DURUMU: 'dislam' }, liste)).toThrow(/geçersiz/)
    expect(() => D.ayar({ VENTHUB_DUNYA_DURUMU: 'hepsi' }, liste)).toThrow(/geçersiz/)
  })

  it('KAPSAM: dislan ∪ yalniz = tam — hiçbir test dosyası iki kipte birden düşmez', () => {
    const tum = testDosyalari().filter((d) => !VITEST_DISI.some((v) => v.desen.test(d)))
    const dislan = D.ayar({ VENTHUB_DUNYA_DURUMU: 'dislan' }, liste)
    const yalniz = D.ayar({ VENTHUB_DUNYA_DURUMU: 'yalniz' }, liste)
    const prdeKosan = tum.filter((d) => !dislan.exclude.includes(d))
    const zamanlidaKosan = tum.filter((d) => (yalniz.include as string[]).includes(d))
    const kosanlar = new Set([...prdeKosan, ...zamanlidaKosan])
    expect([...kosanlar].sort()).toEqual(tum)
    // Listedeki her test PR'da DIŞARIDA, zamanlıda İÇERİDE.
    for (const t of liste.testler) {
      expect(prdeKosan).not.toContain(t.test)
      expect(zamanlidaKosan).toContain(t.test)
    }
  })

  it('vitest dışı (statik exclude) dosyaların HEPSİ tabloda gerekçesiyle yazılı ve koştuğu yer var', () => {
    const cfg = readFileSync(path.join(KOK, 'vitest.config.ts'), 'utf8')
    const statik = [...cfg.matchAll(/exclude:\s*\[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]))
    const dosyaGlobu = statik.filter((g) => !g.startsWith('**/'))
    expect(dosyaGlobu.sort()).toEqual(['tests/e2e/empirical_*.test.ts', 'tests/smoke/**'])
    for (const v of VITEST_DISI) {
      const dosyalar = testDosyalari().filter((d) => v.desen.test(d))
      expect(dosyalar.length, `${v.desen} hiçbir dosyayla eşleşmiyor (tablo bayat)`).toBeGreaterThan(0)
      for (const k of v.kanit) expect(existsSync(path.join(KOK, k)), `${v.yer}: ${k} yok`).toBe(true)
    }
  })

  it('smoke dosyaları gerçekten vitest.smoke.config.ts kapsamında', () => {
    const cfg = readFileSync(path.join(KOK, 'vitest.smoke.config.ts'), 'utf8')
    expect(cfg).toMatch(/tests\/smoke/)
  })

  // ── SABOTAJ: her bozulma yolu GERÇEKTEN yakalanıyor mu ────────────────────────
  it('sabotaj 1: listedeki testin dosyası yoksa (yetim kayıt) yakalanır', () => {
    const r = denetle(ci, dunyaYml, liste, (yol) => yol !== liste.testler[0].test)
    expect(r.join('|')).toContain('dosya yok')
  })

  it('sabotaj 2: zamanlı iş akışından cron düşerse ya da yalniz kipi silinirse yakalanır', () => {
    const cronsuz = dunyaYml.replace(/ {4}- cron: '[^']+'\n/, '')
    expect(cronsuz).not.toBe(dunyaYml)
    expect(denetle(ci, cronsuz, liste, var_).join('|')).toContain('schedule')
    const kipsiz = dunyaYml.replace('VENTHUB_DUNYA_DURUMU: yalniz', 'VENTHUB_DUNYA_DURUMU: tam')
    expect(kipsiz).not.toBe(dunyaYml)
    expect(denetle(ci, kipsiz, liste, var_).join('|')).toContain('yalniz')
  })

  it('sabotaj 3: ci işinin Test adımı dislan kipini PR dışına da verirse ya da hiç vermezse yakalanır', () => {
    const herYerde = ci.replace("${{ github.event_name == 'pull_request' && 'dislan' || '' }}", 'dislan')
    expect(herYerde).not.toBe(ci)
    expect(denetle(herYerde, dunyaYml, liste, var_).join('|')).toContain('PR dışına')
    const hicbirYerde = ci.replace("${{ github.event_name == 'pull_request' && 'dislan' || '' }}", "''")
    expect(denetle(hicbirYerde, dunyaYml, liste, var_).join('|')).toContain('PR dışına taşıyor ya da hiç yok')
  })

  it('sabotaj 4: listeden zamanlı yer silinirse, glob girerse, gerekçesiz kayıt eklenirse yakalanır', () => {
    const zamanlisiz: Liste = { ...liste, testler: liste.testler.map((t) => ({ ...t, yeniYer: ['master-push'] })) }
    expect(denetle(ci, dunyaYml, zamanlisiz, var_).join('|')).toContain('zamanli')
    const globlu: Liste = { ...liste, testler: [{ ...liste.testler[0], test: 'src/__tests__/conformance/*.test.ts' }] }
    expect(D.dogrula(globlu, () => true).join('|')).toContain('glob YASAK')
    const gerekcesiz: Liste = { ...liste, testler: [{ ...liste.testler[0], neden: 'kısa', kanit: '' }] }
    expect(D.dogrula(gerekcesiz, () => true).join('|')).toContain('en az 20 karakter')
  })

  it('sabotaj 5: boş liste yakalanır; tekrar eden kayıt yakalanır', () => {
    expect(denetle(ci, dunyaYml, { surum: 1, testler: [] }, var_).join('|')).toContain('liste BOŞ')
    const ikili: Liste = { ...liste, testler: [liste.testler[0], liste.testler[0]] }
    expect(D.dogrula(ikili, () => true).join('|')).toContain('tekrar')
  })
})
