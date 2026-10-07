import { execFile, execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-CI-SECIM-2 · test seçiminin DAVRANIŞI ve KAPSAM KANITI (ALT-38e, cetvel: docs/standards/test-karnesi-standard.md §4.3). Bağ (ci.yml metni): ci-test-secimi.test.ts (INV-CI-SECIM-1).
 *
 * A) DAVRANIŞ: seçim ve hızlı yol adımlarının GERÇEK `run` gövdesi (ci.yml'den çıkarılır) gerçek bash ve gerçek git ile, tabandan çıkarılan SAHTE seçiciyle koşar. Ölçülenler:
 *    taban kopyası koşar (PR'ın kendi kopyası ASLA: PR kopyası "seçim boş" yazsa da çıktı tabandandır), kopya yoksa `tam=true`, seçici çökerse `tam=true` yazılır ve adım kırmızı OLMAZ,
 *    seçici sessiz kalırsa çıktı YOKTUR (ve YAML koşulları çıktı yokken KOŞAR: kapı sessizce düşmez), argümanlar TAM (`--kok`, `--harita`, `--vitestsiz` yalnız birinci geçişte, `--cikti`),
 *    hızlı yol yalnız .md/.txt/.csv farkında `belge=true` yazar (Türkçe adlı dosya dahil), kod/JSON/.cjs/.ts farkında, silinen-taşınan koddan gelen farkta ve boş farkta YAZMAZ.
 * B) KAPSAM: dağıtım GERÇEK `vitest list` (kip `dislan`) üstünde: tam ise parçaların birleşimi = liste; seçim ise birleşim = seçim, kesişim 0, boş parça `[]` + `kos=false`; seçici ile vitest
 *    ayrışırsa TAM; GERÇEK vitest `include` bağı her parça için TAM o parçayı döner; ci.yml'deki GERÇEK dağıtım komutu (`run:`) bash'te koşar ve dağıtıcının argüman sözleşmesiyle eşleşir.
 *
 * Alt süreçlere ortam AÇIKÇA kurulur: üst sürecin VENTHUB_TEST_SHARD_DOSYALARI, VITEST* ve kip değişkenleri sızmaz (canlı ders: #1741 koşu 2). bash yoksa (Git Bash'siz Windows) A bölümü atlanır;
 * CI'da (ubuntu) her zaman koşar.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const CI_METNI = readFileSync(path.join(KOK, '.github/workflows/ci.yml'), 'utf8').replace(/\r\n/g, '\n')
const LISTE_MUTLAK = path.join(KOK, 'scripts/ci/dunya-durumu-testleri.json')
const execFileAsync = promisify(execFile)
const SHARD = require_(path.join(KOK, 'scripts/ci/test-shard.cjs')) as {
  ORTAM_ADI: string
  dagit: (dosyalar: string[], sure: SureTablosu, toplam: number) => { gruplar: string[][]; yuk: number[] }
  main: (argv: string[], g?: Enjeksiyon) => number
  sureleriOku: () => SureTablosu
  vitestListesi: (kok?: string, ortam?: NodeJS.ProcessEnv) => string[]
  yoluNormallestir: (yol: string, kok?: string) => string
}
interface SureTablosu {
  sureler: Map<string, number>
  varsayilan: number
}
interface Enjeksiyon {
  listele?: () => string[]
  yaz?: (dosya: string, icerik: string) => void
  log?: (m: string) => void
  ortam?: Record<string, string | undefined>
  ekle?: (dosya: string, icerik: string) => void
  secimGirdisi?: { oku?: (d: string, k: string) => string; varMi?: (y: string) => boolean }
}

const sirali = (a: readonly string[]): string[] => [...a].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0))
const ileri = (p: string): string => p.replace(/\\/g, '/')

// ── ci.yml'den adım gövdesi/komutu/ortamı çıkarma (satır taraması) ─────────────────────────────────────────────────────────────────
function adimSatirlari(isId: string, ad: string): string[] {
  const s = CI_METNI.split('\n')
  const is = s.findIndex((x) => x === `  ${isId}:`)
  const bas = s.findIndex((x, i) => i > is && x.startsWith('      - name: ') && x.slice(14).trimEnd() === ad)
  if (is < 0 || bas < 0) throw new Error(`adım yok: ${isId}/${ad}`)
  const sonraki = s.findIndex((x, i) => i > bas && (/^ {6}- /.test(x) || /^ {0,2}\S/.test(x)))
  return s.slice(bas, sonraki < 0 ? s.length : sonraki)
}
/** `run: |` gövdesi (girinti 10 atılmış) ya da tek satırlık `run:` değeri. */
function adimGovdesi(isId: string, ad: string): string {
  const sat = adimSatirlari(isId, ad)
  const i = sat.findIndex((x) => /^ {8}run:/.test(x))
  if (i < 0) throw new Error(`run yok: ${ad}`)
  const deger = sat[i].replace(/^ {8}run:\s?/, '')
  if (!/^\|[-+]?$/.test(deger)) return deger
  const govde: string[] = []
  for (const x of sat.slice(i + 1)) {
    if (x.trim() !== '' && !x.startsWith(' '.repeat(10))) break
    govde.push(x.startsWith(' '.repeat(10)) ? x.slice(10) : '')
  }
  return govde.join('\n').replace(/\n+$/, '')
}
function adimEnv(isId: string, ad: string): Record<string, string> {
  const sat = adimSatirlari(isId, ad)
  const i = sat.findIndex((x) => /^ {8}env:\s*$/.test(x))
  const env: Record<string, string> = {}
  if (i < 0) return env
  for (const x of sat.slice(i + 1)) {
    const m = /^ {10}([A-Za-z_][\w-]*):\s?(.*)$/.exec(x)
    if (!m) break
    env[m[1]] = m[2].trim()
  }
  return env
}

// ── bash ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function bashBul(): string | null {
  const adaylar = process.platform === 'win32' ? ['C:/Program Files/Git/bin/bash.exe'] : ['bash']
  for (const aday of adaylar) {
    try {
      if (path.isAbsolute(aday) && !existsSync(aday)) continue
      execFileSync(aday, ['-c', 'exit 0'], { stdio: 'ignore' })
      return aday
    } catch {
      /* sonraki aday */
    }
  }
  return null
}
const BASH = bashBul()

/** Alt sürecin ortamı: üstün VITEST*, shard listesi ve kip değişkenleri SIZMAZ; geri kalanı (PATH vb.) taşınır, `ek` açıkça verilir. */
function temizOrtam(ek: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, MSYS_NO_PATHCONV: '1' }
  for (const k of Object.keys(env)) if (k.startsWith('VITEST') || k === SHARD.ORTAM_ADI || k === 'VENTHUB_DUNYA_DURUMU' || k === 'VENTHUB_DUNYA_TABAN_LISTESI' || k === 'GITHUB_OUTPUT') delete env[k]
  return { ...env, ...ek }
}

// ══ A) DAVRANIŞ: gerçek gövdeler, gerçek git, sahte tabandan seçici ═════════════════════════════════════════════════════════════════
type Senaryo = 'bos' | 'secim' | 'tam' | 'coker' | 'sessiz'
/** Tabandaki SAHTE seçici: ne yapacağını (tabandaki) harita dosyasından okur; çağrılarını RUNNER_TEMP/stub-cagri.jsonl'e yazar. */
const SAHTE_SECICI = `const fs = require('fs'); const path = require('path')
const argv = process.argv.slice(2)
const arg = (ad) => { const i = argv.indexOf(ad); return i < 0 ? null : argv[i + 1] }
fs.appendFileSync(path.join(process.env.RUNNER_TEMP, 'stub-cagri.jsonl'), JSON.stringify({ argv, cwd: process.cwd(), dunya: process.env.VENTHUB_DUNYA_DURUMU || '' }) + '\\n')
const mod = JSON.parse(fs.readFileSync(arg('--harita'), 'utf8')).mod
if (mod === 'coker') process.exit(3)
if (mod === 'sessiz') process.exit(0)
const yaz = (s) => fs.appendFileSync(process.env.GITHUB_OUTPUT, s.join('\\n') + '\\n')
if (mod === 'bos') { fs.writeFileSync(arg('--cikti'), ''); yaz(['tam=false', 'secilen-sayisi=0', 'toplam=626', 'neden=bos']) }
else if (mod === 'secim') { fs.writeFileSync(arg('--cikti'), 'src/a.test.ts\\nsrc/b.test.ts\\n'); yaz(['tam=false', 'secilen-sayisi=2', 'toplam=626', 'neden=secim']) }
else { fs.writeFileSync(arg('--cikti'), 'src/a.test.ts\\n'); yaz(['tam=true', 'secilen-sayisi=1', 'toplam=626', 'neden=tam']) }
`
/** PR'ın KENDİ seçici kopyası: koşarsa işaret dosyası düşer ve "seçim boş" der. Taban kopyası varken HİÇ koşmamalıdır. */
const PR_SECICISI = `require('fs').writeFileSync(require('path').join(process.env.RUNNER_TEMP, 'pr-isareti'), 'PR kopyasi kostu')
require('fs').appendFileSync(process.env.GITHUB_OUTPUT, 'tam=false\\nsecilen-sayisi=0\\n')
`

interface AdimSonucu {
  cikis: number
  cikti: string
  ekran: string
  cagrilar: Array<{ argv: string[]; cwd: string; dunya: string }>
  prKosti: boolean
  repo: string
  gecici: string
}

interface Depo {
  /** Tabandaki dosyalar (yol → içerik). */
  taban: Record<string, string>
  /** PR'ın farkı: yol → yeni içerik; null = silinir. */
  fark: Record<string, string | null>
  /** PR commit'i README.md'yi de değiştirir (varsayılan: evet); `false` ise `fark` boşken PR commit'i GERÇEKTEN boştur (HEAD^1 ile aynı ağaç). */
  readmeDegis?: boolean
}

/** Gerçek bir git deposu: taban commit'i + PR commit'i (HEAD^1 = taban). Gövdeyi bash'te koşar; deponun ve geçici dizinin yolunu ve çıktıyı döner. */
function govdeKos(govde: string, depo: Depo, env: Record<string, string> = {}, oncekiGecici?: string): AdimSonucu {
  const repo = mkdtempSync(path.join(tmpdir(), 'vh-secim-'))
  const gecici = oncekiGecici ?? mkdtempSync(path.join(tmpdir(), 'vh-secim-tmp-'))
  const git = (...args: string[]): string => execFileSync('git', args, { cwd: repo, stdio: 'pipe', encoding: 'utf8' })
  const yaz = (rel: string, icerik: string): void => {
    const hedef = path.join(repo, rel)
    mkdirSync(path.dirname(hedef), { recursive: true })
    writeFileSync(hedef, icerik)
  }
  git('init', '-q')
  for (const [k, v] of [['user.email', 'secim@test.local'], ['user.name', 'secim'], ['commit.gpgsign', 'false'], ['core.autocrlf', 'false'], ['core.ignorecase', 'false'], ['core.quotepath', 'false']]) git('config', k, v)
  yaz('README.md', 'taban\n')
  for (const [rel, icerik] of Object.entries(depo.taban)) yaz(rel, icerik)
  git('add', '-A')
  git('commit', '-q', '-m', 'taban')
  if (depo.readmeDegis !== false) yaz('README.md', 'pr\n')
  for (const [rel, icerik] of Object.entries(depo.fark)) {
    if (icerik === null) rmSync(path.join(repo, rel), { force: true })
    else yaz(rel, icerik)
  }
  git('add', '-A')
  git('commit', '-q', '--allow-empty', '-m', 'pr')
  // Her adımın KENDİ $GITHUB_OUTPUT dosyası vardır (GitHub adım başına ayrı dosya verir): önceki geçişin çıktısı taşınmaz.
  const ciktiDosyasi = path.join(gecici, 'github_output')
  writeFileSync(ciktiDosyasi, '')
  const r = spawnSync(BASH as string, ['-eo', 'pipefail', '-c', govde], {
    cwd: repo,
    encoding: 'utf8',
    env: temizOrtam({ RUNNER_TEMP: ileri(gecici), GITHUB_OUTPUT: ileri(ciktiDosyasi), GITHUB_WORKSPACE: ileri(repo), ...env }),
  })
  const cagriDosyasi = path.join(gecici, 'stub-cagri.jsonl')
  const cagrilar = existsSync(cagriDosyasi)
    ? readFileSync(cagriDosyasi, 'utf8').split('\n').filter(Boolean).map((s) => JSON.parse(s) as { argv: string[]; cwd: string; dunya: string })
    : []
  return { cikis: r.status ?? -1, cikti: readFileSync(ciktiDosyasi, 'utf8'), ekran: `${r.stdout}${r.stderr}`, cagrilar, prKosti: existsSync(path.join(gecici, 'pr-isareti')), repo, gecici }
}
const temizle = (...s: AdimSonucu[]): void => {
  for (const x of s) {
    rmSync(x.repo, { recursive: true, force: true })
    rmSync(x.gecici, { recursive: true, force: true })
  }
}
const tabanDepo = (senaryo: Senaryo | null, haritaVar = true): Depo => ({
  taban: {
    ...(senaryo === null ? {} : { 'scripts/ci/test-sec.cjs': SAHTE_SECICI }),
    ...(senaryo === null || !haritaVar ? {} : { 'scripts/ci/test-haritasi.json': JSON.stringify({ mod: senaryo }) }),
  },
  fark: { 'scripts/ci/test-sec.cjs': PR_SECICISI, 'docs/x.md': 'belge\n' },
})
const sonDeger = (cikti: string, anahtar: string): string | undefined => cikti.split('\n').filter((s) => s.startsWith(`${anahtar}=`)).map((s) => s.slice(anahtar.length + 1)).pop()
/** YAML koşullarının (ci-test-secimi.test.ts'te doğruluk tablosuyla ölçülen) anlamı: YALNIZ `tam=false` VE `secilen-sayisi=0` kurulumu/testi kapatır. */
const kurulumGerek = (cikti: string): boolean => !(sonDeger(cikti, 'tam')?.toLowerCase() === 'false' && sonDeger(cikti, 'secilen-sayisi') === '0')

describe.skipIf(BASH === null)('INV-CI-SECIM-2 (A) · seçim adımlarının GERÇEK gövdesi gerçek bash ve git ile koşar', () => {
  const SEC = adimGovdesi('test-shard', 'Test seçimi (tabandan, kurulumsuz)')
  const SECV = adimGovdesi('test-shard', 'Test seçimi (tabandan, vitest ile)')
  const ZAMAN = 60_000

  it('gövdeler ci.yml’den okundu (boş gövde "geçti" sayılmaz)', () => {
    expect(SEC).toContain('git show HEAD^1:scripts/ci/test-sec.cjs')
    expect(SECV).toContain('node "$d/test-sec.cjs"')
  })

  it('TABAN kopyası koşar, PR kopyası ASLA: PR "seçim boş" yazsa da çıktı tabandandır; argümanlar TAM (kök = depo, harita = taban kopyası, --vitestsiz, --cikti)', () => {
    const s = govdeKos(SEC, tabanDepo('secim'))
    try {
      expect(s.cikis).toBe(0)
      expect(s.prKosti, "PR'ın kendi seçici kopyası koştu").toBe(false)
      expect(s.cagrilar).toHaveLength(1)
      const c = s.cagrilar[0]
      expect(c.argv).toEqual(['--kok', ileri(s.repo), '--harita', `${ileri(s.gecici)}/secici/test-haritasi.json`, '--vitestsiz', '--cikti', `${ileri(s.gecici)}/secilen.txt`])
      expect(ileri(c.cwd)).toBe(ileri(s.repo))
      expect(sonDeger(s.cikti, 'tam')).toBe('false')
      expect(sonDeger(s.cikti, 'secilen-sayisi')).toBe('2')
      expect(readFileSync(path.join(s.gecici, 'secilen.txt'), 'utf8')).toBe('src/a.test.ts\nsrc/b.test.ts\n')
      expect(kurulumGerek(s.cikti)).toBe(true)
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('seçici BOŞ derse (`tam=false`, `secilen-sayisi=0`) çıktı aynen geçer ve YALNIZ bu durumda kurulum/test kapanır', () => {
    const s = govdeKos(SEC, tabanDepo('bos'))
    try {
      expect(s.cikis).toBe(0)
      expect(sonDeger(s.cikti, 'tam')).toBe('false')
      expect(sonDeger(s.cikti, 'secilen-sayisi')).toBe('0')
      expect(kurulumGerek(s.cikti)).toBe(false)
      expect(s.prKosti).toBe(false)
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('taban kopyası YOK (seçici ya da harita): `tam=true` + neden, çıkış 0, seçici HİÇ koşmaz (mekanizma henüz tabanda değil)', () => {
    for (const [ad, depo] of [['seçici yok', tabanDepo(null)], ['harita yok', tabanDepo('bos', false)]] as const) {
      const s = govdeKos(SEC, depo)
      try {
        expect(s.cikis, ad).toBe(0)
        expect(sonDeger(s.cikti, 'tam'), ad).toBe('true')
        expect(sonDeger(s.cikti, 'neden'), ad).toBe('taban kopyası yok')
        expect(s.cagrilar, ad).toHaveLength(0)
        expect(s.prKosti, ad).toBe(false)
        expect(s.ekran, ad).toContain('::notice::test seçimi: tam — taban kopyası yok')
        expect(kurulumGerek(s.cikti), ad).toBe(true)
      } finally {
        temizle(s)
      }
    }
  }, ZAMAN)

  it('seçici ÇÖKERSE adım kırmızı olmaz: son `tam` değeri `true`, uyarı var, kurulum/test koşar (tabandaki seçici bozulursa onu düzelten PR kilitlenmez)', () => {
    const s = govdeKos(SEC, tabanDepo('coker'))
    try {
      expect(s.cikis).toBe(0)
      expect(sonDeger(s.cikti, 'tam')).toBe('true')
      expect(sonDeger(s.cikti, 'neden')).toBe('seçici çöktü, çıkış kodu 3')
      expect(s.ekran).toContain('::warning::test seçimi: tam — seçici çöktü (çıkış kodu 3)')
      expect(kurulumGerek(s.cikti)).toBe(true)
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('seçici SESSİZ kalırsa (çıkış 0, çıktı yok) hiçbir `tam=`/`secilen-sayisi=` yazılmaz ve kurulum/test KOŞAR (eksik çıktı "atla" demek değildir)', () => {
    const s = govdeKos(SEC, tabanDepo('sessiz'))
    try {
      expect(s.cikis).toBe(0)
      expect(s.cikti).toBe('')
      expect(kurulumGerek(s.cikti)).toBe(true)
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('KONTROL: çökme yedeği olmasaydı çöken seçici adımı KIRMIZI yapardı (yukarıdaki test boş değil)', () => {
    const yedeksiz = SEC.replace(' || cikis=$?', '')
    expect(yedeksiz).not.toBe(SEC)
    const s = govdeKos(yedeksiz, tabanDepo('coker'))
    try {
      expect(s.cikis).not.toBe(0)
      expect(sonDeger(s.cikti, 'tam')).toBeUndefined()
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('İKİNCİ geçiş (vitest ile): birincinin tabandan çıkardığı kopyayı koşar, `--vitestsiz` YOK, dünya durumu kipi `dislan` verilir; kopyalar yoksa `tam=true` ve seçici koşmaz', () => {
    const depo = tabanDepo('secim')
    const ilk = govdeKos(SEC, depo)
    try {
      const ikinci = govdeKos(SECV, depo, { VENTHUB_DUNYA_DURUMU: 'dislan' }, ilk.gecici)
      expect(ikinci.cikis).toBe(0)
      expect(ikinci.cagrilar).toHaveLength(2)
      const arg = ikinci.cagrilar[1].argv
      expect(arg).toEqual(['--kok', ileri(ikinci.repo), '--harita', `${ileri(ilk.gecici)}/secici/test-haritasi.json`, '--cikti', `${ileri(ilk.gecici)}/secilen.txt`])
      expect(arg).not.toContain('--vitestsiz')
      expect(ikinci.cagrilar[1].dunya).toBe('dislan')
      rmSync(ikinci.repo, { recursive: true, force: true })
    } finally {
      temizle(ilk)
    }
    const kopyasiz = govdeKos(SECV, depo)
    try {
      expect(kopyasiz.cikis).toBe(0)
      expect(sonDeger(kopyasiz.cikti, 'tam')).toBe('true')
      expect(kopyasiz.cagrilar).toHaveLength(0)
    } finally {
      temizle(kopyasiz)
    }
  }, ZAMAN)

  it('İKİNCİ geçiş çökerse de `tam=true` yazar ve kırmızı olmaz', () => {
    const depo = tabanDepo('coker')
    const ilk = govdeKos(SEC, depo)
    try {
      const ikinci = govdeKos(SECV, depo, {}, ilk.gecici)
      expect(ikinci.cikis).toBe(0)
      expect(sonDeger(ikinci.cikti, 'tam')).toBe('true')
      rmSync(ikinci.repo, { recursive: true, force: true })
    } finally {
      temizle(ilk)
    }
  }, ZAMAN)
})

// ── hızlı yol ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
describe.skipIf(BASH === null)('INV-CI-SECIM-2 (A) · hızlı yol gövdesi gerçek git ile: YALNIZ .md/.txt/.csv farkında `belge=true`', () => {
  const HIZLI = adimGovdesi('ci', 'Hızlı yol (yalnız .md/.txt/.csv belgesi; kod kapıları atlanır)')
  const kos = (taban: Record<string, string>, fark: Record<string, string | null>): AdimSonucu => govdeKos(HIZLI, { taban, fark })
  const ZAMAN = 60_000
  const TABAN = { 'src/a.ts': 'export {}\n', 'docs/eski.md': 'e\n', 'docs/veri.json': '{}\n', '.claude/hooks/x.cjs': '1\n' }

  it('gövde ci.yml’den okundu', () => {
    expect(HIZLI).toContain('git diff --quiet --no-renames HEAD^1 HEAD')
  })

  const EVET: Array<[string, Record<string, string | null>]> = [
    ['yalnız bir .md', { 'docs/a.md': 'x\n' }],
    ['kök README ve .md birlikte', { 'README.md': 'degisti\n', 'docs/standards/b.md': 'y\n' }],
    ['.txt ve .csv', { 'docs/notlar.txt': 't\n', 'docs/audits/olcum.csv': 'a,b\n' }],
    ['Türkçe ve boşluklu dosya adı', { 'docs/Ölçüm raporu — Ekim.md': 'ö\n' }],
    ['.claude altında .md ve .txt', { '.claude/skills/x/NOT.md': 'n\n', '.claude/notlar.txt': 'n\n' }],
    ['silinen .md', { 'docs/eski.md': null }],
    ['.md uzantılı ama adında nokta çok olan dosya', { 'docs/a.b.c.md': 'z\n' }],
  ]
  it.each(EVET)('belge=true: %s', (_ad, fark) => {
    const s = kos(TABAN, fark)
    try {
      expect(s.cikis).toBe(0)
      expect(sonDeger(s.cikti, 'belge')).toBe('true')
      expect(s.cikti).toBe('belge=true\n')
      expect(s.ekran).toContain('::notice::hızlı yol: belge')
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  const HAYIR: Array<[string, Record<string, string | null>]> = [
    ['.md + .cjs (eslint . onu tarar)', { 'docs/a.md': 'x\n', '.claude/hooks/x.cjs': '2\n' }],
    ['yalnız .cjs', { '.claude/hooks/yeni.cjs': '1\n' }],
    ['.mjs', { 'docs/araclar/y.mjs': 'export {}\n' }],
    ['.ts (tsc girdisi)', { 'docs/yeni.ts': 'export {}\n' }],
    ['.tsx', { 'docs/yeni.tsx': 'export {}\n' }],
    ['.json (test içe aktarabilir: tip denetimini değiştirir)', { 'docs/veri.json': '{"a":1}\n' }],
    ['.py ve .sh', { 'docs/a.py': 'x\n', 'docs/b.sh': 'x\n' }],
    ['.yaml', { 'docs/a.yaml': 'a: 1\n' }],
    ['uzantısız dosya', { 'docs/Makefile': 'x\n' }],
    ['.md.cjs (uzantı son ekten okunur)', { 'docs/a.md.cjs': 'x\n' }],
    ['büyük harfli .MD (Linux’ta farklı dosya türü: temkinli)', { 'docs/A.MD': 'x\n' }],
    ['site kodu', { 'src/a.ts': 'export const a = 1\n' }],
    ['.md + site kodu', { 'docs/a.md': 'x\n', 'src/a.ts': 'export const a = 1\n' }],
    ['kod dosyası silinir, aynı yola .md eklenir (taşıma numarası: eski yol kod)', { 'src/a.ts': null, 'docs/a.md': 'x\n' }],
    ['silinen .cjs', { '.claude/hooks/x.cjs': null }],
    ['paket ve kilit dosyası', { 'package.json': '{}\n' }],
    ['iş akışı', { '.github/workflows/ci.yml': 'name: x\n' }],
  ]
  it.each(HAYIR)('çıktı YOK (tüm kapılar koşar): %s', (_ad, fark) => {
    const s = kos(TABAN, fark)
    try {
      expect(s.cikis).toBe(0)
      expect(s.cikti).toBe('')
      expect(s.ekran).toContain('::notice::hızlı yol: yok')
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('boş fark (PR commit’i HEAD^1 ile aynı ağaç): çıktı YOK (kanıtsız hızlı yol açılmaz)', () => {
    const s = govdeKos(HIZLI, { taban: TABAN, fark: {}, readmeDegis: false })
    try {
      expect(s.cikis).toBe(0)
      expect(s.cikti).toBe('')
      expect(s.ekran).toContain('::notice::hızlı yol: yok')
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('git hatası (HEAD^1 yok: tek commitli depo) çıktı YAZMAZ ve adımı kırmızı yapmaz', () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'vh-secim-tek-'))
    const gecici = mkdtempSync(path.join(tmpdir(), 'vh-secim-tmp-'))
    try {
      for (const a of [['init', '-q'], ['config', 'user.email', 'x@y.z'], ['config', 'user.name', 'x'], ['config', 'commit.gpgsign', 'false']]) execFileSync('git', a, { cwd: repo, stdio: 'pipe' })
      writeFileSync(path.join(repo, 'a.md'), 'x\n')
      execFileSync('git', ['add', '-A'], { cwd: repo, stdio: 'pipe' })
      execFileSync('git', ['commit', '-q', '-m', 'tek'], { cwd: repo, stdio: 'pipe' })
      const ciktiDosyasi = path.join(gecici, 'github_output')
      writeFileSync(ciktiDosyasi, '')
      const r = spawnSync(BASH as string, ['-eo', 'pipefail', '-c', HIZLI], { cwd: repo, encoding: 'utf8', env: temizOrtam({ GITHUB_OUTPUT: ileri(ciktiDosyasi) }) })
      expect(r.status).toBe(0)
      expect(readFileSync(ciktiDosyasi, 'utf8')).toBe('')
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(gecici, { recursive: true, force: true })
    }
  }, ZAMAN)
})

// ══ B) KAPSAM KANITI: gerçek `vitest list` + gerçek dağıtıcı + gerçek vitest include bağı ═══════════════════════════════════════════
describe('INV-CI-SECIM-2 (B) · KAPSAM: tam ise birleşim = vitest list, seçim ise birleşim = seçim; kesişim 0; hiçbir test dosyası düşmez ya da iki kez koşmaz', () => {
  const N = Number(/^ {8}shard: \[([\d, ]+)\]$/m.exec(CI_METNI)?.[1].split(',').length ?? 4)
  const sure = SHARD.sureleriOku()
  let liste: string[] = []
  let gecici = ''

  beforeAll(() => {
    liste = SHARD.vitestListesi(KOK, temizOrtam({ VENTHUB_DUNYA_DURUMU: 'dislan', VENTHUB_DUNYA_TABAN_LISTESI: LISTE_MUTLAK }))
    gecici = mkdtempSync(path.join(tmpdir(), 'ci-secim-kapsam-'))
  }, 120_000)
  afterAll(() => {
    if (gecici) rmSync(gecici, { recursive: true, force: true })
  })

  /** Dağıtıcıyı ci.yml'deki argümanlarla ve enjeksiyonla N parça için koşar: `{ parcalar, kos }`. */
  function parcalar(tam: string, secim: readonly string[], sayi: string = String(secim.length)): { parcalar: string[][]; kos: string[] } {
    const dosya = 'secilen.txt'
    const sonuc: string[][] = []
    const kos: string[] = []
    for (let i = 1; i <= N; i++) {
      const yazilan = new Map<string, string>()
      const kod = SHARD.main(['--shard', String(i), '--toplam', String(N), '--cikti', 'p.json', '--secim', dosya, '--secim-tam', tam, '--secim-sayi', sayi], {
        listele: () => liste,
        yaz: (d, ic) => void yazilan.set(d, ic),
        log: () => undefined,
        ortam: { GITHUB_OUTPUT: 'x' },
        ekle: (_d, ic) => void kos.push(ic.trim()),
        secimGirdisi: { oku: () => `${secim.join('\n')}${secim.length ? '\n' : ''}`, varMi: () => true },
      })
      expect(kod, `shard ${i}/${N}`).toBe(0)
      sonuc.push(JSON.parse(yazilan.get('p.json') ?? 'null') as string[])
    }
    return { parcalar: sonuc, kos }
  }
  const kesisimYok = (p: string[][]): void => {
    const hepsi = p.flat()
    expect(new Set(hepsi).size, 'bir dosya birden çok parçada').toBe(hepsi.length)
  }

  it('kanarya: gerçek `vitest list` (dislan) boş değil, bilinen kapıları içerir, yollar kök-göreli POSIX', () => {
    expect(liste.length).toBeGreaterThan(300)
    for (const d of ['src/__tests__/conformance/ci-test-secimi.test.ts', 'src/__tests__/conformance/ci-test-shard.test.ts', 'scripts/ci/__tests__/test-shard-secim.test.ts']) expect(liste, d).toContain(d)
    expect(liste.every((d) => !d.startsWith('/') && !d.includes('\\') && !d.includes('..') && !/^[A-Za-z]:/.test(d))).toBe(true)
    expect(N).toBeGreaterThanOrEqual(2)
  })

  it('TAM (seçici `tam=true` dedi, çıktısı ne olursa olsun): parçaların birleşimi = vitest list, kesişim 0, her parça dolu, hepsi `kos=true`', () => {
    for (const [tam, sayi] of [['true', '5'], ['', ''], ['false', '9999']] as const) {
      const r = parcalar(tam, liste.slice(0, 3), sayi)
      expect(sirali(r.parcalar.flat()), `tam=${tam}`).toEqual(liste)
      kesisimYok(r.parcalar)
      r.parcalar.forEach((p, i) => expect(p.length, `tam=${tam} parça ${i + 1}`).toBeGreaterThan(0))
      expect(r.kos).toEqual(Array.from({ length: N }, () => 'kos=true'))
    }
  })

  it('SEÇİM: K ∈ {0, 1, 3, 37, 200, tümü}: birleşim = seçim (vitest listesinin alt kümesi), kesişim 0, boş parça `[]` + `kos=false`, dolu parça `kos=true`', () => {
    for (const k of [0, 1, 3, 37, 200, liste.length]) {
      const secim = liste.filter((_, i) => i % Math.max(1, Math.floor(liste.length / Math.max(k, 1))) === 0).slice(0, k)
      expect(secim.length, `K=${k}`).toBe(k)
      const r = parcalar('false', secim)
      expect(sirali(r.parcalar.flat()), `K=${k}: birleşim`).toEqual(sirali(secim))
      kesisimYok(r.parcalar)
      expect(r.kos, `K=${k}`).toEqual(r.parcalar.map((p) => `kos=${p.length > 0}`))
      for (const p of r.parcalar) for (const d of p) expect(liste, `K=${k}: ${d} vitest listesinde yok`).toContain(d)
      if (k >= N) r.parcalar.forEach((p, i) => expect(p.length, `K=${k} parça ${i + 1} boş`).toBeGreaterThan(0))
      if (k === 0) expect(r.parcalar.every((p) => p.length === 0)).toBe(true)
    }
  })

  it('seçilen dosya vitest listesinde YOKSA (seçici ile vitest ayrışmış): TAM paket dağıtılır, seçim sessizce daraltmaz', () => {
    const r = parcalar('false', [liste[0], 'src/yok/ayrisan.test.ts'])
    expect(sirali(r.parcalar.flat())).toEqual(liste)
    kesisimYok(r.parcalar)
  })

  it('belirlenimli: seçim sırası parçaları değiştirmez; aynı girdi aynı bölmeyi verir (4 shard işi bölmeyi ayrı hesaplar)', () => {
    const secim = liste.filter((_, i) => i % 7 === 0)
    const a = parcalar('false', secim)
    const b = parcalar('false', [...secim].reverse())
    expect(b.parcalar).toEqual(a.parcalar)
    expect(a.parcalar).toEqual(SHARD.dagit(secim, sure, N).gruplar)
  })

  it('GERÇEK vitest include bağı: seçimden çıkan her dolu parça için `VENTHUB_TEST_SHARD_DOSYALARI` ile gerçek `vitest list` TAM o parçayı döner; birleşim = seçim', async () => {
    const secim = liste.filter((_, i) => i % 11 === 0)
    const r = parcalar('false', secim)
    const sonuclar = await Promise.all(
      r.parcalar.map(async (p, i) => {
        if (p.length === 0) return [] as string[]
        const dosya = path.join(gecici, `secim-${i + 1}.json`)
        writeFileSync(dosya, `${JSON.stringify(p)}\n`)
        const { stdout } = await execFileAsync(process.execPath, [path.join(KOK, 'node_modules', 'vitest', 'vitest.mjs'), 'list', '--filesOnly', '--json'], {
          cwd: KOK,
          env: temizOrtam({ VENTHUB_DUNYA_DURUMU: 'dislan', VENTHUB_DUNYA_TABAN_LISTESI: LISTE_MUTLAK, [SHARD.ORTAM_ADI]: dosya }),
          encoding: 'utf8',
          maxBuffer: 64 * 1024 * 1024,
          timeout: 120_000,
        })
        return sirali([...new Set((JSON.parse(stdout) as Array<{ file: string }>).map((x) => SHARD.yoluNormallestir(x.file, KOK)))])
      }),
    )
    sonuclar.forEach((s, i) => expect(s, `parça ${i + 1}: vitest'in koşacağı küme dağıtıcının listesiyle aynı değil`).toEqual(sirali(r.parcalar[i])))
    expect(sirali(sonuclar.flat())).toEqual(sirali(secim))
  }, 180_000)

  it.skipIf(BASH === null)('ci.yml’deki GERÇEK dağıtım komutu bash’te koşar (argüman adları ve değerleri dağıtıcıyla eşleşir): seçim, boş seçim ve tam', async () => {
    const komut = adimGovdesi('test-shard', `Test dağıtımı (shard \${{ matrix.shard }}/${N})`)
    const yamlEnv = adimEnv('test-shard', `Test dağıtımı (shard \${{ matrix.shard }}/${N})`)
    expect(Object.keys(yamlEnv).sort()).toEqual(['SECIM_SAYI', 'SECIM_TAM', 'SHARD', 'VENTHUB_DUNYA_DURUMU'])
    const kos = async (shard: number, tam: string, sayi: string, secim: readonly string[]): Promise<{ parca: string[]; cikti: string; kod: number }> => {
      const dizin = path.join(gecici, `yaml-${shard}-${tam}-${sayi}`)
      mkdirSync(dizin, { recursive: true })
      writeFileSync(path.join(dizin, 'secilen.txt'), `${secim.join('\n')}${secim.length ? '\n' : ''}`)
      const ciktiDosyasi = path.join(dizin, 'github_output')
      writeFileSync(ciktiDosyasi, '')
      const r = await execFileAsync(BASH as string, ['-eo', 'pipefail', '-c', komut], {
        cwd: KOK,
        env: temizOrtam({ SHARD: String(shard), VENTHUB_DUNYA_DURUMU: 'dislan', VENTHUB_DUNYA_TABAN_LISTESI: LISTE_MUTLAK, SECIM_TAM: tam, SECIM_SAYI: sayi, RUNNER_TEMP: ileri(dizin), GITHUB_OUTPUT: ileri(ciktiDosyasi) }),
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        timeout: 150_000,
      }).catch((e: { code?: number }) => ({ stdout: '', stderr: '', kod: e.code ?? 1 }))
      const kod = 'kod' in r ? r.kod : 0
      const parcaDosyasi = path.join(dizin, 'shard.json')
      return { parca: existsSync(parcaDosyasi) ? (JSON.parse(readFileSync(parcaDosyasi, 'utf8')) as string[]) : [], cikti: readFileSync(ciktiDosyasi, 'utf8'), kod }
    }
    const secim = liste.filter((_, i) => i % 97 === 0)
    const dolu = await Promise.all(Array.from({ length: N }, (_, i) => kos(i + 1, 'false', String(secim.length), secim)))
    dolu.forEach((d, i) => expect(d.kod, `seçim parça ${i + 1}`).toBe(0))
    expect(sirali(dolu.flatMap((d) => d.parca))).toEqual(sirali(secim))
    dolu.forEach((d) => expect(d.cikti).toBe(`kos=${d.parca.length > 0}\n`))
    const bos = await kos(2, 'false', '0', [])
    expect(bos).toMatchObject({ kod: 0, parca: [], cikti: 'kos=false\n' })
    const tam = await kos(1, 'true', '3', secim.slice(0, 3))
    expect(tam.kod).toBe(0)
    expect(tam.parca).toEqual(SHARD.dagit(liste, sure, N).gruplar[0])
    expect(tam.cikti).toBe('kos=true\n')
  }, 240_000)
})
