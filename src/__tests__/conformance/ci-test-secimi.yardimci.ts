import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

/**
 * INV-CI-SECIM-2 ORTAK YARDIMCILARI (ALT-38e): ci.yml'den adım gövdesi/ortamı çıkarma, gerçek bash ve gerçek git ile adım gövdesi koşturma, alt süreç ortamı.
 * Kullanan testler: ci-test-secimi-kapsam.test.ts (seçim adımları ve kapsam kanıtı), ci-test-secimi-hizli.test.ts (belge hızlı yolu). Test DEĞİLDİR (adında `.test.` yok): vitest toplamaz.
 * Alt süreçlere ortam AÇIKÇA kurulur: üst sürecin VENTHUB_TEST_SHARD_DOSYALARI, VITEST* ve kip değişkenleri sızmaz (canlı ders: #1741 koşu 2).
 */

const require_ = createRequire(import.meta.url)
export const KOK = path.resolve(__dirname, '../../..')
export const CI_METNI = readFileSync(path.join(KOK, '.github/workflows/ci.yml'), 'utf8').replace(/\r\n/g, '\n')
export const LISTE_MUTLAK = path.join(KOK, 'scripts/ci/dunya-durumu-testleri.json')

export interface SureTablosu {
  sureler: Map<string, number>
  varsayilan: number
}
export interface Enjeksiyon {
  listele?: () => string[]
  yaz?: (dosya: string, icerik: string) => void
  log?: (m: string) => void
  ortam?: Record<string, string | undefined>
  ekle?: (dosya: string, icerik: string) => void
  secimGirdisi?: { oku?: (d: string, k: string) => string; varMi?: (y: string) => boolean }
}
export const SHARD = require_(path.join(KOK, 'scripts/ci/test-shard.cjs')) as {
  ORTAM_ADI: string
  dagit: (dosyalar: string[], sure: SureTablosu, toplam: number) => { gruplar: string[][]; yuk: number[] }
  main: (argv: string[], g?: Enjeksiyon) => number
  sureleriOku: () => SureTablosu
  vitestListesi: (kok?: string, ortam?: NodeJS.ProcessEnv) => string[]
  yoluNormallestir: (yol: string, kok?: string) => string
}

export const sirali = (a: readonly string[]): string[] => [...a].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0))
export const ileri = (p: string): string => p.replace(/\\/g, '/')

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
export function adimGovdesi(isId: string, ad: string): string {
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
export function adimEnv(isId: string, ad: string): Record<string, string> {
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
/** bash yoksa (Git Bash'siz Windows) davranış testleri atlanır; CI'da (ubuntu) her zaman koşar. */
export const BASH = bashBul()

/** Alt sürecin ortamı: üstün VITEST*, shard listesi ve kip değişkenleri SIZMAZ; geri kalanı (PATH vb.) taşınır, `ek` açıkça verilir. */
export function temizOrtam(ek: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, MSYS_NO_PATHCONV: '1' }
  for (const k of Object.keys(env)) if (k.startsWith('VITEST') || k === SHARD.ORTAM_ADI || k === 'VENTHUB_DUNYA_DURUMU' || k === 'VENTHUB_DUNYA_TABAN_LISTESI' || k === 'GITHUB_OUTPUT') delete env[k]
  return { ...env, ...ek }
}

// ── gerçek git deposunda adım gövdesi koşturma ─────────────────────────────────────────────────────────────────────────────────────
export interface AdimSonucu {
  cikis: number
  cikti: string
  ekran: string
  cagrilar: Array<{ argv: string[]; cwd: string; dunya: string }>
  prKosti: boolean
  /** Seçici sürecinde YÜKLENEN sınıflayıcı kopyaları (`TABAN;`, `PR;`): PR kopyası ASLA yüklenmemeli. */
  sinif: string
  repo: string
  gecici: string
}

export interface Depo {
  /** Tabandaki dosyalar (yol → içerik). */
  taban: Record<string, string>
  /** PR'ın farkı: yol → yeni içerik; null = silinir. */
  fark: Record<string, string | null>
  /** PR commit'i README.md'yi de değiştirir (varsayılan: evet); `false` ise `fark` boşken PR commit'i GERÇEKTEN boştur (HEAD^1 ile aynı ağaç). */
  readmeDegis?: boolean
}

/** Gerçek bir git deposu: taban commit'i + PR commit'i (HEAD^1 = taban). Gövdeyi bash'te koşar; deponun ve geçici dizinin yolunu ve çıktıyı döner. */
export function govdeKos(govde: string, depo: Depo, env: Record<string, string> = {}, oncekiGecici?: string): AdimSonucu {
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
  const sinifDosyasi = path.join(gecici, 'sinif-yuklendi')
  return { cikis: r.status ?? -1, cikti: readFileSync(ciktiDosyasi, 'utf8'), ekran: `${r.stdout}${r.stderr}`, cagrilar, prKosti: existsSync(path.join(gecici, 'pr-isareti')), sinif: existsSync(sinifDosyasi) ? readFileSync(sinifDosyasi, 'utf8') : '', repo, gecici }
}
export const temizle = (...s: AdimSonucu[]): void => {
  for (const x of s) {
    rmSync(x.repo, { recursive: true, force: true })
    rmSync(x.gecici, { recursive: true, force: true })
  }
}
export const sonDeger = (cikti: string, anahtar: string): string | undefined => cikti.split('\n').filter((s) => s.startsWith(`${anahtar}=`)).map((s) => s.slice(anahtar.length + 1)).pop()
