import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-CI-SECIM-2 (uyum) · GERÇEK seçicinin çıktısı dağıtıcının sözleşmesine uyar (ALT-38e). Seçici (scripts/ci/test-sec.cjs, ALT-38d) ve harita (scripts/ci/test-haritasi.json) repoda VARSA koşar;
 * yoksa atlanır (seçici tabana inene dek ci.yml zaten `taban kopyası yok → tam` der). Neden: dağıtıcı seçici çıktısını (`tam`, `secilen-sayisi`, liste dosyası) DOĞRULAR ve tutarsızsa TAM paket dağıtır;
 * iki taraf ayrı yazıldığı için sözleşme kayarsa (adlar, biçim, sıra, sayı) hata değil sessiz "seçim hiç uygulanmıyor" olurdu. Bu test o kaymayı kırmızıya çevirir: seçici ile dağıtıcı BİRLİKTE gerçek veride.
 * Seçici `--degisen-dosya` ile beslenir (git durumundan bağımsız); belge-yalnız senaryolar vitest grafiği KURMAZ (hızlı). Ortam alt süreçlere AÇIKÇA kurulur (VITEST*, shard listesi sızmaz).
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const SECICI = path.join(KOK, 'scripts/ci/test-sec.cjs')
const HARITA = path.join(KOK, 'scripts/ci/test-haritasi.json')
const LISTE_MUTLAK = path.join(KOK, 'scripts/ci/dunya-durumu-testleri.json')
const SHARD = require_(path.join(KOK, 'scripts/ci/test-shard.cjs')) as {
  ORTAM_ADI: string
  main: (argv: string[], g?: { listele?: () => string[]; yaz?: (d: string, i: string) => void; log?: (m: string) => void; ortam?: Record<string, string>; ekle?: (d: string, i: string) => void }) => number
  vitestListesi: (kok?: string, ortam?: NodeJS.ProcessEnv) => string[]
}
const VAR = existsSync(SECICI) && existsSync(HARITA)
const sirali = (a: readonly string[]): string[] => [...a].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0))

function temizOrtam(ek: Record<string, string>): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env }
  for (const k of Object.keys(env)) if (k.startsWith('VITEST') || k === SHARD.ORTAM_ADI || k === 'VENTHUB_DUNYA_DURUMU' || k === 'VENTHUB_DUNYA_TABAN_LISTESI' || k === 'GITHUB_OUTPUT') delete env[k]
  return { ...env, VENTHUB_DUNYA_DURUMU: 'dislan', VENTHUB_DUNYA_TABAN_LISTESI: LISTE_MUTLAK, ...ek }
}

describe.skipIf(!VAR)('INV-CI-SECIM-2 (uyum) · gerçek seçici çıktısı dağıtıcıda uygulanır, TAMa düşmez', () => {
  const N = 4
  let liste: string[] = []
  let gecici = ''
  beforeAll(() => {
    liste = SHARD.vitestListesi(KOK, temizOrtam({}))
    gecici = mkdtempSync(path.join(tmpdir(), 'ci-secim-uyum-'))
  }, 120_000)
  afterAll(() => {
    if (gecici) rmSync(gecici, { recursive: true, force: true })
  })

  /** Seçiciyi (kurulumsuz ya da vitest'li) koşar; `$GITHUB_OUTPUT` değerlerini ve liste dosyasını döner. */
  function seciciKos(ad: string, degisen: string[], vitestsiz: boolean): { tam: string; sayi: string; cikti: string; secilen: string[] } {
    const girdi = path.join(gecici, `${ad}-degisen.txt`)
    const cikti = path.join(gecici, `${ad}-secilen.txt`)
    const out = path.join(gecici, `${ad}-github-output`)
    writeFileSync(girdi, `${degisen.join('\n')}\n`)
    writeFileSync(out, '')
    const arg = [SECICI, '--kok', KOK, '--harita', HARITA, '--degisen-dosya', girdi, '--cikti', cikti, ...(vitestsiz ? ['--vitestsiz'] : [])]
    const r = spawnSync(process.execPath, arg, { cwd: KOK, env: temizOrtam({ GITHUB_OUTPUT: out }), encoding: 'utf8', timeout: 110_000 })
    expect(r.status, `seçici çıkışı (daima 0 olmalı): ${r.stderr}`).toBe(0)
    const satir = (anahtar: string): string => (readFileSync(out, 'utf8').split('\n').filter((s) => s.startsWith(`${anahtar}=`)).pop() ?? '').slice(anahtar.length + 1)
    const secilen = existsSync(cikti) ? readFileSync(cikti, 'utf8').split('\n').filter(Boolean) : []
    return { tam: satir('tam'), sayi: satir('secilen-sayisi'), cikti, secilen }
  }

  /** Dağıtıcıyı seçici çıktısıyla N parça için koşar (ci.yml'deki argümanlar). Dönüş: parçalar, bilgi satırları ve uyarılar. */
  function dagit(s: { tam: string; sayi: string; cikti: string }): { parcalar: string[][]; uyarilar: string[] } {
    const uyarilar: string[] = []
    const parcalar: string[][] = []
    for (let i = 1; i <= N; i++) {
      const yazilan = new Map<string, string>()
      const kod = SHARD.main(['--shard', String(i), '--toplam', String(N), '--cikti', 'p.json', '--secim', s.cikti, '--secim-tam', s.tam, '--secim-sayi', s.sayi], {
        listele: () => liste,
        yaz: (d, ic) => void yazilan.set(d, ic),
        log: (m) => void (m.startsWith('::warning::') && uyarilar.push(m)),
        ortam: {},
        ekle: () => undefined,
      })
      expect(kod, `shard ${i}/${N}`).toBe(0)
      parcalar.push(JSON.parse(yazilan.get('p.json') ?? 'null') as string[])
    }
    return { parcalar, uyarilar }
  }

  const SENARYOLAR: Array<[string, string[]]> = [
    ['okunmayan-belge', ['docs/plans/bu-belgeyi-hicbir-test-okumaz-2026-10-07.md']],
    ['okunan-belge', ['docs/standards/test-karnesi-standard.md']],
    ['belge-ve-kok', ['docs/audits/arac-envanteri-2026-09-07.md', 'README.md']],
    ['kuresel', ['.github/workflows/ci.yml']],
  ]
  it.each(SENARYOLAR)('%s (seçici vitest ile): dağıtıcı seçimi UYGULAR ya da seçici tam dediyse TAM dağıtır; uyarı yok, birleşim ve kesişim doğru', (ad, degisen) => {
    const s = seciciKos(ad, degisen, false)
    expect(['true', 'false'], `tam=${s.tam}`).toContain(s.tam)
    expect(s.sayi, 'secilen-sayisi bir tam sayı olmalı').toMatch(/^\d+$/)
    expect(s.secilen.length, 'liste dosyası satır sayısı = secilen-sayisi').toBe(Number(s.sayi))
    const { parcalar, uyarilar } = dagit(s)
    expect(uyarilar, 'dağıtıcı seçici çıktısını REDDETTİ (sözleşme kaymış: seçim hiç uygulanmıyor)').toEqual([])
    const hepsi = parcalar.flat()
    expect(new Set(hepsi).size, 'kesişim').toBe(hepsi.length)
    if (s.tam === 'false') {
      expect(sirali(hepsi), 'birleşim = seçici listesi').toEqual(sirali(s.secilen))
      for (const d of hepsi) expect(liste, `${d} vitest listesinde yok`).toContain(d)
    } else {
      expect(sirali(hepsi), 'tam: birleşim = vitest list').toEqual(liste)
    }
  }, 180_000)

  it('belge-yalnız değişiklikte kurulumsuz geçiş (`--vitestsiz`) nihai geçişin ÜST KÜMESİNİ verir (git listesi vitest listesinin üst kümesidir); ikisi de seçim modundadır', () => {
    const degisen = ['docs/standards/test-karnesi-standard.md']
    const birinci = seciciKos('uyum-1', degisen, true)
    const ikinci = seciciKos('uyum-2', degisen, false)
    expect(birinci.tam, 'belge-yalnız değişiklik kurulumsuz geçişte cevap verir').toBe(ikinci.tam)
    if (birinci.tam === 'false') {
      const ust = new Set(birinci.secilen)
      for (const d of ikinci.secilen) expect(ust.has(d), `${d} nihai seçimde var ama kurulumsuz seçimde yok`).toBe(true)
    }
  }, 180_000)

  it('içe aktarılabilir dosya değişince kurulumsuz geçiş `tam=true` der (vitest gerekli) ve dağıtıcıya SEÇİM sızmaz', () => {
    const s = seciciKos('uyum-ts', ['src/lib/siteUrl.ts'], true)
    expect(s.tam).toBe('true')
    const { parcalar, uyarilar } = dagit(s)
    expect(uyarilar).toEqual([])
    expect(sirali(parcalar.flat())).toEqual(liste)
  }, 180_000)
})
