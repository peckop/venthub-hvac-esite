import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { adimEnv, adimGovdesi, BASH, CI_METNI, type Depo, govdeKos, ileri, KOK, LISTE_MUTLAK, SHARD, sirali, sonDeger, temizle, temizOrtam } from './ci-test-secimi.yardimci'

/**
 * INV-CI-SECIM-2 · test seçiminin DAVRANIŞI ve KAPSAM KANITI (ALT-38e, cetvel: docs/standards/test-karnesi-standard.md §4.3). Bağ (ci.yml metni): ci-test-secimi.test.ts (INV-CI-SECIM-1).
 * Ortak yardımcılar: ci-test-secimi.yardimci.ts; belge hızlı yolunun davranışı: ci-test-secimi-hizli.test.ts.
 *
 * A) DAVRANIŞ: seçim adımlarının GERÇEK `run` gövdesi (ci.yml'den çıkarılır) gerçek bash ve gerçek git ile, tabandan çıkarılan SAHTE seçiciyle koşar. Ölçülenler:
 *    taban kopyası koşar (PR'ın kendi kopyası ASLA: PR kopyası "seçim boş" yazsa da çıktı tabandandır), kopya yoksa `tam=true`, seçici çökerse `tam=true` yazılır ve adım kırmızı OLMAZ,
 *    `bos=true` YALNIZ seçicinin SON `tam=false` VE `secilen-sayisi=0` değerinde yazılır; sessiz, yarım çıktılı, boş yazıp çöken ya da kendi `bos`unu yazan seçicide `bos=false` (kurulum ve test KOŞAR: kapı sessizce düşmez),
 *    argümanlar TAM (`--kok`, `--harita`, `--vitestsiz` yalnız birinci geçişte, `--cikti`), sınıflayıcı da tabandan (PR kopyası seçici sürecinde ASLA yüklenmez).
 * B) KAPSAM: dağıtım GERÇEK `vitest list` (kip `dislan`) üstünde: tam ise parçaların birleşimi = liste; seçim ise birleşim = seçim, kesişim 0, boş parça `[]` + `kos=false`; karma kipte (bir iş tam'a düşer)
 *    birleşim ⊇ seçim; seçici ile vitest ayrışırsa TAM; GERÇEK vitest `include` bağı her parça için TAM o parçayı döner; ci.yml'deki GERÇEK dağıtım komutu (`run:`) bash'te koşar.
 * bash yoksa (Git Bash'siz Windows) A bölümü atlanır; CI'da (ubuntu) her zaman koşar. Alt süreç ortamı: ci-test-secimi.yardimci.ts.
 */

const execFileAsync = promisify(execFile)

// ══ A) DAVRANIŞ: gerçek gövdeler, gerçek git, sahte tabandan seçici ═════════════════════════════════════════════════════════════════
type Senaryo = 'bos' | 'secim' | 'tam' | 'coker' | 'sessiz' | 'yarim' | 'bos-coker' | 'kendi-bos'
/**
 * Tabandaki SAHTE seçici: ne yapacağını (tabandaki) harita dosyasından okur; çağrılarını RUNNER_TEMP/stub-cagri.jsonl'e yazar. Kötü huylu kipler: `yarim` (yalnız `tam=false`, sayı yok),
 * `bos-coker` (boş seçimi yazıp ÇÖKER), `kendi-bos` (seçim DOLUyken kendi `bos=true`sunu yazar).
 */
const SAHTE_SECICI = `const fs = require('fs'); const path = require('path')
const argv = process.argv.slice(2)
const arg = (ad) => { const i = argv.indexOf(ad); return i < 0 ? null : argv[i + 1] }
fs.appendFileSync(path.join(process.env.RUNNER_TEMP, 'stub-cagri.jsonl'), JSON.stringify({ argv, cwd: process.cwd(), dunya: process.env.VENTHUB_DUNYA_DURUMU || '' }) + '\\n')
for (const y of [path.join(__dirname, 'degisiklik-sinifi.cjs'), path.join(arg('--kok'), 'scripts', 'ci', 'degisiklik-sinifi.cjs')]) { try { require(y); break } catch {} } // gerçek seçicinin siniflayiciYukle'si: önce YANI, sonra kök
const mod = JSON.parse(fs.readFileSync(arg('--harita'), 'utf8')).mod
if (mod === 'coker') process.exit(3)
if (mod === 'sessiz') process.exit(0)
const yaz = (s) => fs.appendFileSync(process.env.GITHUB_OUTPUT, s.join('\\n') + '\\n')
const bosYaz = () => { fs.writeFileSync(arg('--cikti'), ''); yaz(['tam=false', 'secilen-sayisi=0', 'toplam=626', 'neden=bos']) }
if (mod === 'bos' || mod === 'bos-coker') bosYaz()
if (mod === 'bos-coker') process.exit(3)
if (mod === 'yarim') yaz(['tam=false'])
else if (mod === 'kendi-bos') yaz(['tam=false', 'secilen-sayisi=2', 'bos=true'])
else if (mod === 'secim') { fs.writeFileSync(arg('--cikti'), 'src/a.test.ts\\nsrc/b.test.ts\\n'); yaz(['tam=false', 'secilen-sayisi=2', 'toplam=626', 'neden=secim']) }
else if (mod === 'tam') { fs.writeFileSync(arg('--cikti'), 'src/a.test.ts\\n'); yaz(['tam=true', 'secilen-sayisi=1', 'toplam=626', 'neden=tam']) }
`
/** PR'ın KENDİ seçici kopyası: koşarsa işaret dosyası düşer ve "seçim boş" der. Taban kopyası varken HİÇ koşmamalıdır. */
const PR_SECICISI = `require('fs').writeFileSync(require('path').join(process.env.RUNNER_TEMP, 'pr-isareti'), 'PR kopyasi kostu')
require('fs').appendFileSync(process.env.GITHUB_OUTPUT, 'tam=false\\nsecilen-sayisi=0\\n')
`
/** Sınıflayıcının tabandaki ve PR'daki kopyaları: yüklenince hangisinin yüklendiğini işaret dosyasına yazar (zararsız; gerçek seçici bunu `require` eder). */
const sinifKopyasi = (kim: string): string => `require('fs').appendFileSync(require('path').join(process.env.RUNNER_TEMP, 'sinif-yuklendi'), '${kim};')\n`

const tabanDepo =(senaryo: Senaryo | null, haritaVar = true, sinifVar = true): Depo => ({
  taban: {
    ...(senaryo === null ? {} : { 'scripts/ci/test-sec.cjs': SAHTE_SECICI }),
    ...(senaryo === null || !haritaVar ? {} : { 'scripts/ci/test-haritasi.json': JSON.stringify({ mod: senaryo }) }),
    ...(senaryo === null || !sinifVar ? {} : { 'scripts/ci/degisiklik-sinifi.cjs': sinifKopyasi('TABAN') }),
  },
  fark: { 'scripts/ci/test-sec.cjs': PR_SECICISI, 'scripts/ci/degisiklik-sinifi.cjs': sinifKopyasi('PR'), 'docs/x.md': 'belge\n' },
})
/** YAML koşullarının (ci-test-secimi-ifade.test.ts'te doğruluk tablosuyla ölçülen) anlamı: kurulum/test YALNIZ adımın yazdığı SON `bos` değeri `true` ise kapanır; çıktı eksik ya da başka değerse KOŞAR. */
const kurulumGerek = (cikti: string): boolean => sonDeger(cikti, 'bos')?.toLowerCase() !== 'true'

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
      expect(s.sinif, "seçici sürecinde yalnız TABANIN sınıflayıcısı yüklenir; PR'ın kopyası ASLA (PR kodu kurulumdan önce koşmasın)").toBe('TABAN;')
      expect(s.cagrilar).toHaveLength(1)
      const c = s.cagrilar[0]
      expect(c.argv).toEqual(['--kok', ileri(s.repo), '--harita', `${ileri(s.gecici)}/secici/test-haritasi.json`, '--vitestsiz', '--cikti', `${ileri(s.gecici)}/secilen.txt`])
      expect(ileri(c.cwd)).toBe(ileri(s.repo))
      expect(sonDeger(s.cikti, 'tam')).toBe('false')
      expect(sonDeger(s.cikti, 'secilen-sayisi')).toBe('2')
      expect(readFileSync(path.join(s.gecici, 'secilen.txt'), 'utf8')).toBe('src/a.test.ts\nsrc/b.test.ts\n')
      expect(sonDeger(s.cikti, 'bos')).toBe('false')
      expect(kurulumGerek(s.cikti)).toBe(true)
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('seçici BOŞ derse (`tam=false`, `secilen-sayisi=0`) seçici çıktısı aynen geçer, adım `bos=true` yazar ve YALNIZ bu durumda kurulum/test kapanır', () => {
    const s = govdeKos(SEC, tabanDepo('bos'))
    try {
      expect(s.cikis).toBe(0)
      expect(sonDeger(s.cikti, 'tam')).toBe('false')
      expect(sonDeger(s.cikti, 'secilen-sayisi')).toBe('0')
      expect(sonDeger(s.cikti, 'bos')).toBe('true')
      expect(s.cikti.trimEnd().split('\n').pop()).toBe('bos=true')
      expect(kurulumGerek(s.cikti)).toBe(false)
      expect(s.prKosti).toBe(false)
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('taban kopyası YOK (seçici, harita ya da sınıflayıcı): `tam=true` + neden, çıkış 0, seçici HİÇ koşmaz (mekanizma henüz tabanda değil; sınıflayıcı yoksa PR kopyası yüklenmesin)', () => {
    for (const [ad, depo] of [['seçici yok', tabanDepo(null)], ['harita yok', tabanDepo('bos', false)], ['sınıflayıcı yok', tabanDepo('bos', true, false)]] as const) {
      const s = govdeKos(SEC, depo)
      try {
        expect(s.cikis, ad).toBe(0)
        expect(sonDeger(s.cikti, 'tam'), ad).toBe('true')
        expect(sonDeger(s.cikti, 'neden'), ad).toBe('taban kopyası yok')
        expect(sonDeger(s.cikti, 'bos'), ad).toBeUndefined()
        expect(s.cagrilar, ad).toHaveLength(0)
        expect(s.prKosti, ad).toBe(false)
        expect(s.sinif, ad).toBe('')
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
      expect(sonDeger(s.cikti, 'bos')).toBe('false')
      expect(kurulumGerek(s.cikti)).toBe(true)
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('seçici SESSİZ kalırsa (çıkış 0, çıktı yok) hiçbir `tam=`/`secilen-sayisi=` yazılmaz, `bos=false` yazılır ve kurulum/test KOŞAR (eksik çıktı "atla" demek değildir)', () => {
    const s = govdeKos(SEC, tabanDepo('sessiz'))
    try {
      expect(s.cikis).toBe(0)
      expect(s.cikti).toBe('bos=false\n')
      expect(kurulumGerek(s.cikti)).toBe(true)
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('seçici YARIM çıktı verirse, BOŞ seçimi yazıp ÇÖKERSE ya da seçim DOLUyken kendi `bos=true`sunu yazarsa `bos=false`: kurulum ve test KOŞAR (eski `secilen-sayisi != 0` koşulu ilkinde ATLATIRDI)', () => {
    for (const [mod, tamBeklenen] of [['yarim', 'false'], ['bos-coker', 'true'], ['kendi-bos', 'false']] as const) {
      const s = govdeKos(SEC, tabanDepo(mod))
      try {
        expect(s.cikis, mod).toBe(0)
        expect(sonDeger(s.cikti, 'tam'), mod).toBe(tamBeklenen)
        expect(sonDeger(s.cikti, 'bos'), mod).toBe('false')
        expect(kurulumGerek(s.cikti), mod).toBe(true)
      } finally {
        temizle(s)
      }
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

  it("KONTROL: sınıflayıcı tabandan çıkarılmasaydı seçici onu PR'ın kopyasından yüklerdi ve PR kodu kurulumdan ÖNCE seçici sürecinde koşardı (yukarıdaki test boş değil)", () => {
    const eksik = SEC.replace(' || ! git show HEAD^1:scripts/ci/degisiklik-sinifi.cjs > "$d/degisiklik-sinifi.cjs" 2>/dev/null', '')
    expect(eksik).not.toBe(SEC)
    const s = govdeKos(eksik, tabanDepo('secim'))
    try {
      expect(s.sinif).toBe('PR;')
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

  /** TEK shard işini ci.yml'deki argümanlarla ve enjeksiyonla koşar: `{ parca, kos }`. */
  function isKos(i: number, tam: string, secim: readonly string[], sayi: string = String(secim.length)): { parca: string[]; kos: string } {
    const yazilan = new Map<string, string>()
    const kos: string[] = []
    const kod = SHARD.main(['--shard', String(i), '--toplam', String(N), '--cikti', 'p.json', '--secim', 'secilen.txt', '--secim-tam', tam, '--secim-sayi', sayi], {
      listele: () => liste,
      yaz: (d, ic) => void yazilan.set(d, ic),
      log: () => undefined,
      ortam: { GITHUB_OUTPUT: 'x' },
      ekle: (_d, ic) => void kos.push(ic.trim()),
      secimGirdisi: { oku: () => `${secim.join('\n')}${secim.length ? '\n' : ''}`, varMi: () => true },
    })
    expect(kod, `shard ${i}/${N}`).toBe(0)
    return { parca: JSON.parse(yazilan.get('p.json') ?? 'null') as string[], kos: kos[0] }
  }
  /** Dağıtıcıyı N parça için AYNI girdiyle koşar: `{ parcalar, kos }`. */
  function parcalar(tam: string, secim: readonly string[], sayi: string = String(secim.length)): { parcalar: string[][]; kos: string[] } {
    const isler = Array.from({ length: N }, (_, i) => isKos(i + 1, tam, secim, sayi))
    return { parcalar: isler.map((x) => x.parca), kos: isler.map((x) => x.kos) }
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
      if (k === 0) expect(r.parcalar.every((p) => p.length === 0)).toBe(true)
    }
  })

  it("KARMA KİP (çürütme bulgusu): işlerin bir kısmı tam'a düşer (seçici çıktısı yok), kalanı seçimde kalır; birleşim HER KOMBİNASYONDA ⊇ seçim, kesişim 0; hepsi seçimdeyken = seçim", () => {
    for (const k of [1, 5, 60, 150]) {
      const secim = liste.filter((_, i) => i % Math.max(1, Math.floor(liste.length / k)) === 0).slice(0, k)
      for (let maske = 0; maske < 2 ** N; maske++) {
        const isler = Array.from({ length: N }, (_, i) => ((maske >> i) & 1 ? isKos(i + 1, '', secim, '') : isKos(i + 1, 'false', secim)))
        const birlesim = isler.flatMap((x) => x.parca)
        expect(secim.filter((d) => !birlesim.includes(d)), `K=${k} maske=${maske}: seçilen ama HİÇBİR işte koşmayan test`).toEqual([])
        kesisimYok(isler.map((x) => x.parca))
        if (maske === 0) expect(sirali(birlesim), `K=${k}: hepsi seçimde`).toEqual(sirali(secim))
      }
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
    expect(a.parcalar).toEqual(SHARD.dagit(liste, sure, N).gruplar.map((g) => g.filter((d) => secim.includes(d)))) // bölme TAM listede, seçim yalnız süzer (karma kip güvencesi)
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
