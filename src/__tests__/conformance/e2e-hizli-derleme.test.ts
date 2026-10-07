// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { E2E_TIP_LINT_ATLA_ANAHTARI, e2eHizliDerlemeAyari, e2eTipLintAtlaOku } from '../../config/e2eHizliDerleme.mjs'

/**
 * INV-E2E-HIZLI-1 / INV-E2E-HIZLI-2 · e2e Build'inde tip ve lint aşamasının kapatılması DAR ve SIZINTISIZ (ALT-38f).
 *
 * NİÇİN VAR: `admin-smoke` işinin Build adımı (`next build`) 166 sn'nin ~51 sn'sini "tip ve lint" aşamasına harcıyordu. Aynı iki denetim zorunlu `ci`
 * işinde zaten koşar (Lint, Type check, Build (blocking)), bu yüzden e2e'de kapatılır. Kapatan şey bir ORTAM DEĞİŞKENİdir ve değişkenin yanlış yere
 * sızması `ci`'yi, Vercel'i ve yerel derlemeyi sessizce tipsiz bırakır (ortam değişkeninin alt süreçlere sızması bu depoda canlı CI'da bir kez yaşandı).
 *   · SINIF-1 (yapılandırma): anahtar YALNIZ tam `1` iken `typescript.ignoreBuildErrors` ve `eslint.ignoreDuringBuilds` eklenir; kapalıyken
 *     `next.config.mjs`in dışa verdiği nesnede bu iki anahtar HİÇ yoktur (bugünkü ayarla birebir aynı), adres listeleri (redirects/headers/rewrites) anahtardan etkilenmez.
 *   · SINIF-2 (iş akışı bağı): anahtar `.github` altında YALNIZ `e2e-smoke.yml`in `Build (real Supabase env)` adımının ADIM düzeyi env'inde ve değeri tam `'1'`;
 *     iş/iş akışı düzeyi env'de, `$GITHUB_ENV`de, başka adımda, başka iş akışında, package.json'da, vercel.json'da, izlenen `.env*` ve betik dosyalarında YOK.
 * Her denetim fonksiyonu GERÇEK dosyada koşar ve bilerek bozulmuş kopyada kırmızı verdiği ölçülür (sabotaj). İş akışlarını DEĞİŞTİRMEZ.
 */

const KOK = path.resolve(__dirname, '../../..')
const oku = (yol: string): string => readFileSync(path.join(KOK, yol), 'utf8').replace(/\r\n/g, '\n')
const yorumsuz = (metin: string): string =>
  metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')

// ── SINIF-1 · yapılandırma ───────────────────────────────────────────────────────────────────────────────────────────────

const KAPALI_DEGERLER: ReadonlyArray<string | undefined> = [undefined, '', '0', 'true', 'TRUE', 'yes', 'on', ' 1 ', ' 1', '1 ', '01', '11', 'bir']

/** Anahtar okuyucusu için tablo; her satır: [girdi, beklenen]. Mutant avcısı da aynı tabloyu kullanır. */
const OKUYUCU_TABLOSU: ReadonlyArray<readonly [string | undefined, boolean]> = [['1', true], ...KAPALI_DEGERLER.map((d) => [d, false] as const)]

/** Okuyucu uygulamasını tabloya vurur; ilk ayrışmayı yazar, yoksa null. */
function okuyucuDenetle(okuyucu: (deger: string | undefined) => boolean): string | null {
  for (const [girdi, beklenen] of OKUYUCU_TABLOSU) {
    if (okuyucu(girdi) !== beklenen) return `okuyucu(${JSON.stringify(girdi)}) ${String(!beklenen)} döndü, beklenen ${String(beklenen)}`
  }
  return null
}

type Ayarlayici = (acik: boolean) => Record<string, unknown>

/** Ayar üreticisi sözleşmesi: kapalı → boş nesne (HİÇ anahtar yok); açık → tam iki anahtar, tam değerleriyle. */
function ayarDenetle(ayarla: Ayarlayici): string | null {
  const kapali = ayarla(false)
  if (Object.keys(kapali).length !== 0) return `kapalıyken ayar boş değil: ${Object.keys(kapali).join(',')}`
  const acik = ayarla(true)
  if (JSON.stringify(Object.keys(acik).sort()) !== JSON.stringify(['eslint', 'typescript'])) return `açıkken anahtarlar eslint+typescript değil: ${Object.keys(acik).join(',')}`
  if (JSON.stringify(acik.typescript) !== JSON.stringify({ ignoreBuildErrors: true })) return 'typescript.ignoreBuildErrors true değil'
  if (JSON.stringify(acik.eslint) !== JSON.stringify({ ignoreDuringBuilds: true })) return 'eslint.ignoreDuringBuilds true değil'
  return null
}

const ANAHTAR = E2E_TIP_LINT_ATLA_ANAHTARI
const ilkDeger = process.env[ANAHTAR]

afterEach(() => {
  if (ilkDeger === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = ilkDeger
})

type Yapilandirma = Awaited<typeof import('../../../next.config.mjs')>['default']

/** Anahtarı ayarlayıp (`undefined` = tanımsız; ÖNCE her zaman silinir: ortamdan miras kalmış değer sonucu belirleyemez) next.config.mjs'i TAZE içe aktarır. */
async function yukle(deger: string | undefined): Promise<Yapilandirma> {
  delete process.env[ANAHTAR]
  if (deger !== undefined) process.env[ANAHTAR] = deger
  vi.resetModules()
  const { default: yapilandirma } = await import('../../../next.config.mjs')
  return yapilandirma
}

const adresler = async (c: Yapilandirma): Promise<string> => JSON.stringify({ r: await c.redirects?.(), h: await c.headers?.(), w: await c.rewrites?.() })
const islevDisi = (c: Yapilandirma): Record<string, unknown> => Object.fromEntries(Object.entries(c).filter(([, v]) => typeof v !== 'function'))

describe('INV-E2E-HIZLI-1 · anahtar ve yapılandırma', () => {
  it('anahtar adı sabit ve YALNIZ e2e kapsamlı (NEXT_PUBLIC_ öneki istemci paketine gömülür: yasak)', () => {
    expect(ANAHTAR).toBe('VENTHUB_E2E_TIP_LINT_ATLA')
    expect(ANAHTAR.startsWith('NEXT_PUBLIC_')).toBe(false)
  })

  it('okuyucu: YALNIZ tam "1" açar (tablo gerçek okuyucuda temiz)', () => {
    expect(okuyucuDenetle(e2eTipLintAtlaOku)).toBeNull()
  })

  it('ayar üreticisi sözleşmeye uyar: kapalı = boş nesne, açık = tam iki anahtar', () => {
    expect(ayarDenetle(e2eHizliDerlemeAyari)).toBeNull()
  })

  it('⛔SABOTAJ okuyucu: gevşetilmiş her okuyucu tabloda ayrışır (tablo ayırt ediyor)', () => {
    const mutantlar: Record<string, (d: string | undefined) => boolean> = {
      'doğruluk değeri (Boolean)': (d) => Boolean(d),
      'tanımlı mı (undefined değil)': (d) => d !== undefined,
      'kırpılmış "1"': (d) => d?.trim() === '1',
      '"true" da açar': (d) => d === '1' || d === 'true',
      '"0" dışı her şey açar': (d) => d !== undefined && d !== '' && d !== '0',
      'her zaman kapalı (kazanç sıfır)': () => false,
      'her zaman açık (sızıntı)': () => true,
    }
    for (const [ad, mutant] of Object.entries(mutantlar)) expect(okuyucuDenetle(mutant), ad).not.toBeNull()
  })

  it('⛔SABOTAJ ayar üreticisi: eksik, fazla ya da kapalıyken dolu ayar ayrışır', () => {
    const mutantlar: Record<string, Ayarlayici> = {
      'yalnız typescript (lint kapanmaz)': (a) => (a ? { typescript: { ignoreBuildErrors: true } } : {}),
      'yalnız eslint (tip kapanmaz)': (a) => (a ? { eslint: { ignoreDuringBuilds: true } } : {}),
      'kapalıyken typescript anahtarı bırakılır (bugünkü ayardan farklı)': (a) => ({ typescript: { ignoreBuildErrors: a } }),
      'kapalıyken eslint anahtarı bırakılır': (a) => ({ ...(a ? { typescript: { ignoreBuildErrors: true } } : {}), eslint: { ignoreDuringBuilds: a } }),
      'açıkken fazladan anahtar (ör. her derlemede kalıcı gevşetme)': (a) => (a ? { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true }, reactStrictMode: false } : {}),
      'değer true değil (1)': (a) => (a ? { typescript: { ignoreBuildErrors: 1 }, eslint: { ignoreDuringBuilds: 1 } } : {}),
    }
    for (const [ad, mutant] of Object.entries(mutantlar)) expect(ayarDenetle(mutant), ad).not.toBeNull()
  })

  it('GERÇEK next.config.mjs: anahtar kapalı → typescript/eslint anahtarı HİÇ yok, adresler ve anahtar kümesi anahtarsız ile aynı', async () => {
    const tanimsiz = await yukle(undefined)
    expect('typescript' in tanimsiz, 'kapalıyken typescript anahtarı var').toBe(false)
    expect('eslint' in tanimsiz, 'kapalıyken eslint anahtarı var').toBe(false)
    const referansAnahtarlar = Object.keys(tanimsiz).sort()
    const referansAdresler = await adresler(tanimsiz)
    for (const deger of ['', '0', 'true', ' 1 ', '01']) {
      const c = await yukle(deger)
      expect(Object.keys(c).sort(), `değer ${JSON.stringify(deger)}`).toEqual(referansAnahtarlar)
      expect(await adresler(c), `değer ${JSON.stringify(deger)}`).toBe(referansAdresler)
    }
  }, 120_000)

  it('GERÇEK next.config.mjs: anahtar "1" → yalnız iki anahtar eklenir, hiçbir şey kaybolmaz, adresler aynı kalır', async () => {
    const kapali = await yukle(undefined)
    const acik = await yukle('1')
    expect(acik.typescript?.ignoreBuildErrors).toBe(true)
    expect(acik.eslint?.ignoreDuringBuilds).toBe(true)
    expect(Object.keys(acik).sort()).toEqual([...Object.keys(kapali), 'eslint', 'typescript'].sort())
    expect(islevDisi({ ...acik, typescript: undefined, eslint: undefined })).toEqual(islevDisi({ ...kapali, typescript: undefined, eslint: undefined }))
    expect(await adresler(acik)).toBe(await adresler(kapali))
  }, 120_000)

  it('ÖN KOŞUL: ortamdan miras kalmış anahtar sonucu belirleyemez (yukle önce siler)', async () => {
    process.env[ANAHTAR] = '1'
    const c = await yukle(undefined)
    expect('typescript' in c).toBe(false)
  }, 120_000)

  it('YENİ SÜREÇ (`next build`in yapılandırmayı yüklemesi gibi): anahtar yalnız o sürecin ortamından okunur, ortamda yoksa HİÇBİR ayar eklenmez', () => {
    const betik = `const m = await import(${JSON.stringify(pathToFileURL(path.join(KOK, 'next.config.mjs')).href)}); const c = m.default; console.log(JSON.stringify({ ts: c.typescript ?? null, es: c.eslint ?? null }))`
    const calistir = (env: NodeJS.ProcessEnv): { ts: unknown; es: unknown } => {
      const s = spawnSync(process.execPath, ['--input-type=module', '-e', betik], { encoding: 'utf8', env, timeout: 60_000 })
      expect(s.status, s.stderr).toBe(0)
      return JSON.parse(s.stdout.trim().split('\n').pop() ?? '{}') as { ts: unknown; es: unknown }
    }
    const temiz: NodeJS.ProcessEnv = { ...process.env }
    delete temiz[ANAHTAR]
    expect(calistir({ ...temiz, [ANAHTAR]: '1' })).toEqual({ ts: { ignoreBuildErrors: true }, es: { ignoreDuringBuilds: true } })
    expect(calistir(temiz)).toEqual({ ts: null, es: null })
    expect(calistir({ ...temiz, [ANAHTAR]: 'true' })).toEqual({ ts: null, es: null })
  }, 120_000)
})

// ── SINIF-2 · iş akışı bağı ─────────────────────────────────────────────────────────────────────────────────────────────

interface Adim {
  ad: string
  satirlar: string[]
  /** Adımın ADIM düzeyi env'i (`env:` altı, girinti 10). */
  env: Map<string, string>
  govde: string | null
}

function isSatirlari(metin: string, isId: string): string[] {
  const satirlar = metin.split('\n')
  const jobs = satirlar.findIndex((s) => s === 'jobs:')
  const bas = jobs < 0 ? -1 : satirlar.findIndex((s, i) => i > jobs && s === `  ${isId}:`)
  if (bas < 0) return []
  let bit = satirlar.length
  for (let i = bas + 1; i < satirlar.length; i++) {
    if (/^ {2}[A-Za-z0-9_-]+:\s*$/.test(satirlar[i])) {
      bit = i
      break
    }
  }
  return satirlar.slice(bas + 1, bit)
}

function adimlariAyir(isSat: string[]): Adim[] {
  const stepsIdx = isSat.findIndex((s) => s === '    steps:')
  if (stepsIdx < 0) return []
  const adimlar: Adim[] = []
  for (const s of isSat.slice(stepsIdx + 1)) {
    const m = /^ {6}- name: ?(.*)$/.exec(s)
    if (m) adimlar.push({ ad: m[1].trim(), satirlar: [s], env: new Map(), govde: null })
    else if (adimlar.length) adimlar[adimlar.length - 1].satirlar.push(s)
  }
  for (const a of adimlar) {
    const sat = a.satirlar.filter((s) => !/^\s*#/.test(s))
    for (let i = 0; i < sat.length; i++) {
      if (/^ {8}env:\s*$/.test(sat[i])) {
        for (let j = i + 1; j < sat.length && /^ {10}\S/.test(sat[j]); j++) {
          const e = /^ {10}([A-Za-z0-9_]+):\s?(.*)$/.exec(sat[j])
          if (e) a.env.set(e[1], e[2].trim())
        }
      }
      const r = /^ {8}run:\s?(.*)$/.exec(sat[i])
      if (r) {
        if (/^\|[-+]?$/.test(r[1].trim())) {
          const g: string[] = []
          for (let j = i + 1; j < sat.length && (sat[j].trim() === '' || /^ {10}/.test(sat[j])); j++) g.push(sat[j].slice(10))
          a.govde = g.join('\n').replace(/\n+$/, '')
        } else a.govde = r[1].trim()
      }
    }
  }
  return adimlar
}

const BUILD_ADI = 'Build (real Supabase env)'

/** `.github/workflows` altındaki tüm iş akışları (ad → metin). */
function tumIsAkislari(): Record<string, string> {
  const dizin = path.join(KOK, '.github', 'workflows')
  return Object.fromEntries(
    readdirSync(dizin)
      .filter((f) => /\.ya?ml$/.test(f))
      .map((f) => [f, readFileSync(path.join(dizin, f), 'utf8').replace(/\r\n/g, '\n')]),
  )
}

/** e2e-smoke.yml için anahtar bağı denetimi. Boş dizi = uyumlu. */
function anahtarBaginiDenetle(e2e: string, digerleri: Record<string, string>): string[] {
  const ihlal: string[] = []
  const govdeler = yorumsuz(e2e)
  const is = isSatirlari(e2e, 'admin-smoke')
  if (is.length === 0) return ['e2e-smoke.yml: `admin-smoke` işi ayrıştırılamadı']
  const adimlar = adimlariAyir(is)
  const builds = adimlar.filter((a) => a.ad === BUILD_ADI)
  if (builds.length !== 1) return [`e2e-smoke.yml: "${BUILD_ADI}" adımı TAM BİR tane olmalı (bulunan ${builds.length})`]
  const build = builds[0]
  if (build.govde !== 'pnpm run build:ci') ihlal.push(`Build adımı \`pnpm run build:ci\` koşmuyor (bulunan ${JSON.stringify(build.govde)}): anahtar başka bir komuta bağlanmış`)
  if (build.env.get(ANAHTAR) !== "'1'") ihlal.push(`Build adımının ADIM düzeyi env'inde ${ANAHTAR}: '1' yok (bulunan ${JSON.stringify(build.env.get(ANAHTAR) ?? null)}): kazanç sıfır ya da değer yanlış (yalnız tam '1' açar)`)
  for (const gerekli of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']) if (!build.env.has(gerekli)) ihlal.push(`Build adımı ${gerekli} vermiyor: gerçek Supabase env'i kaybolmuş`)
  for (const a of adimlar) {
    if (a.ad !== BUILD_ADI && a.satirlar.some((s) => !/^\s*#/.test(s) && s.includes(ANAHTAR))) ihlal.push(`anahtar "${a.ad}" adımında geçiyor: yalnız Build adımında olabilir`)
  }
  const isUstu = is.slice(0, is.findIndex((s) => s === '    steps:')).filter((s) => !/^\s*#/.test(s))
  if (isUstu.some((s) => s.includes(ANAHTAR)) || isUstu.some((s) => /^ {4}env:/.test(s))) ihlal.push('`admin-smoke` işinin iş düzeyinde env var: her adıma (probe, smoke, sonraki işlemler) miras kalır')
  if (/^env:/m.test(govdeler)) ihlal.push('iş akışı düzeyinde `env:` var: her işe ve adıma miras kalır')
  if (/GITHUB_ENV/.test(govdeler)) ihlal.push('`GITHUB_ENV` kullanılıyor: yazılan değişken sonraki TÜM adımlara sızar')
  const adiYanlis = [...govdeler.matchAll(/VENTHUB_E2E_[A-Z_]*TIP_LINT[A-Z_]*/g)].map((m) => m[0]).filter((a) => a !== ANAHTAR)
  if (adiYanlis.length > 0) ihlal.push(`anahtar adı yapılandırmadaki sabitten (${ANAHTAR}) farklı yazılmış: ${adiYanlis.join(', ')}`)
  for (const [dosya, metin] of Object.entries(digerleri)) {
    if (dosya !== 'e2e-smoke.yml' && yorumsuz(metin).includes(ANAHTAR)) ihlal.push(`${dosya}: anahtar yalnız e2e-smoke.yml'de olabilir`)
  }
  return ihlal
}

describe('INV-E2E-HIZLI-2 · anahtar YALNIZ e2e Build adımında (sızıntı yok)', () => {
  const e2e = oku('.github/workflows/e2e-smoke.yml')
  const isAkislari = tumIsAkislari()
  const digerleri = (): Record<string, string> => ({ ...isAkislari })

  it('gerçek iş akışı uyumlu; ölçüm yüzeyi dolu (boş tarama "uyumlu" sayılmaz)', () => {
    expect(Object.keys(isAkislari).length).toBeGreaterThan(5)
    expect(isAkislari['ci.yml']).toBeTruthy()
    expect(anahtarBaginiDenetle(e2e, digerleri())).toEqual([])
  })

  it('anahtar adı iş akışında tam bir kez (yorumsuz) geçer', () => {
    expect(yorumsuz(e2e).split(ANAHTAR).length - 1).toBe(1)
  })

  const E2E_BOZ: Array<{ ad: string; boz: (c: string) => string; beklenen: string }> = [
    {
      ad: "anahtar iş düzeyi env'ine taşınır (probe ve smoke da miras alır)",
      boz: (c) => c.replace('  admin-smoke:\n    runs-on: ubuntu-latest\n', `  admin-smoke:\n    runs-on: ubuntu-latest\n    env:\n      ${ANAHTAR}: '1'\n`),
      beklenen: 'iş düzeyinde env var',
    },
    {
      ad: "anahtar iş akışı düzeyi env'ine taşınır",
      boz: (c) => c.replace('\njobs:\n', `\nenv:\n  ${ANAHTAR}: '1'\n\njobs:\n`),
      beklenen: 'iş akışı düzeyinde `env:`',
    },
    {
      ad: 'anahtar $GITHUB_ENV ile sonraki tüm adımlara yazılır',
      boz: (c) => c.replace('        run: bash scripts/ci/apt-hardening.sh\n', `        run: |\n          bash scripts/ci/apt-hardening.sh\n          echo "${ANAHTAR}=1" >> "$GITHUB_ENV"\n`),
      beklenen: '`GITHUB_ENV` kullanılıyor',
    },
    {
      ad: 'anahtar smoke adımına da verilir',
      boz: (c) => c.replace('          E2E_ADMIN_EMAIL:', `          ${ANAHTAR}: '1'\n          E2E_ADMIN_EMAIL:`),
      beklenen: 'anahtar "Run smoke suite (admin + checkout)" adımında geçiyor',
    },
    {
      ad: 'değer "true" (yapılandırma yalnız tam 1 okur: kazanç sessizce sıfırlanır)',
      boz: (c) => c.replace(`${ANAHTAR}: '1'`, `${ANAHTAR}: 'true'`),
      beklenen: 'yok (bulunan "\'true\'")',
    },
    { ad: 'anahtar Build adımından kaldırılır (kazanç sıfır)', boz: (c) => c.replace(`          ${ANAHTAR}: '1'\n`, ''), beklenen: 'yok (bulunan null)' },
    { ad: 'Build komutu değişir (anahtar başka komuta bağlanır)', boz: (c) => c.replace('run: pnpm run build:ci', 'run: pnpm run build'), beklenen: 'Build adımı `pnpm run build:ci` koşmuyor' },
    {
      ad: "gerçek Supabase env'i Build adımından düşer",
      boz: (c) => c.replace("          NEXT_PUBLIC_SUPABASE_URL: ${{ vars.E2E_SUPABASE_URL }}\n          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ vars.E2E_SUPABASE_ANON_KEY }}\n          VENTHUB", '          VENTHUB'),
      beklenen: "gerçek Supabase env'i kaybolmuş",
    },
    { ad: 'anahtar adı yazım hatasıyla ayrışır (yapılandırma onu okumaz)', boz: (c) => c.replace(`${ANAHTAR}: '1'`, `${ANAHTAR}A: '1'`), beklenen: 'yapılandırmadaki sabitten' },
  ]
  it.each(E2E_BOZ)('⛔SABOTAJ e2e-smoke.yml: $ad', ({ boz, beklenen }) => {
    const bozuk = boz(e2e)
    expect(bozuk, 'bozucu hiçbir şeyi değiştirmedi (çapa kayıp)').not.toBe(e2e)
    expect(anahtarBaginiDenetle(bozuk, digerleri()).join(' | ')).toContain(beklenen)
  })

  it('⛔SABOTAJ ci.yml: anahtar `Build (blocking)` adımına konursa kırmızı (ci tipsiz kalırdı)', () => {
    const ci = isAkislari['ci.yml']
    const bozuk = ci.replace('          NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-key\n', `          NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-key\n          ${ANAHTAR}: '1'\n`)
    expect(bozuk, 'çapa kayıp').not.toBe(ci)
    expect(anahtarBaginiDenetle(e2e, { ...digerleri(), 'ci.yml': bozuk }).join(' | ')).toContain('ci.yml: anahtar yalnız e2e-smoke.yml')
  })

  /** Derlemeyi ya da onu çağıran süreçleri etkileyebilecek yüzeyler: kök ayarlar, `.env*`, `scripts/` (testler hariç). */
  function yuzeyListesi(): string[] {
    const yuzeyler: string[] = ['package.json', 'vercel.json', 'playwright.config.ts', 'vitest.config.ts', 'sentry.client.config.ts', 'sentry.edge.config.ts']
    for (const f of readdirSync(KOK)) if (/^\.env/.test(f)) yuzeyler.push(f)
    const betikDizini = (dizin: string): void => {
      for (const ent of readdirSync(path.join(KOK, dizin), { withFileTypes: true })) {
        const rel = `${dizin}/${ent.name}`
        if (ent.isDirectory()) {
          if (ent.name !== 'node_modules' && ent.name !== '__tests__') betikDizini(rel)
        } else if (/\.(sh|cjs|mjs|js|ts|json|yml|yaml)$/.test(ent.name)) yuzeyler.push(rel)
      }
    }
    betikDizini('scripts')
    return yuzeyler
  }
  const sizanYuzeyler = (okuyucu: (yol: string) => string): string[] => yuzeyListesi().filter((y) => okuyucu(y).includes(ANAHTAR))

  it('anahtar depodaki başka hiçbir derleme/yapılandırma yüzeyinde YOK (package.json, vercel.json, .env*, betikler, Playwright/Vitest ayarları)', () => {
    expect(yuzeyListesi().length).toBeGreaterThan(40)
    expect(sizanYuzeyler(oku)).toEqual([])
  })

  it('⛔SABOTAJ yüzey taraması: package.json betiğine, bir betiğe ya da .env örneğine konan anahtar yakalanır', () => {
    const bozukPaket = oku('package.json').replace('"build:ci": "', `"build:ci": "cross-env ${ANAHTAR}=1 `)
    expect(bozukPaket).not.toBe(oku('package.json'))
    expect(sizanYuzeyler((y) => (y === 'package.json' ? bozukPaket : oku(y)))).toEqual(['package.json'])
    expect(sizanYuzeyler((y) => (y === 'scripts/ci/retry-bounded.sh' ? `export ${ANAHTAR}=1\n` : oku(y)))).toEqual(['scripts/ci/retry-bounded.sh'])
    expect(sizanYuzeyler((y) => (y === '.env.production.example' ? `${ANAHTAR}=1\n` : oku(y)))).toEqual(['.env.production.example'])
  })
})
