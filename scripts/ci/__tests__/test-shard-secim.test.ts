import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Test shard dağıtıcısının SEÇİM kipi birim testleri (scripts/ci/test-shard.cjs `--secim` grubu, ALT-38e, cetvel: docs/standards/test-karnesi-standard.md §4.3).
 * Bağlantı ve kapsam kanıtı (gerçek `vitest list`, ci.yml): src/__tests__/conformance/ci-test-secimi.test.ts (INV-CI-SECIM-1/2).
 *
 * Tek değişmez: seçim YALNIZ DARALTIR. Seçici `tam` demedikçe, çıktısı baştan sona tutarlı olmadıkça ya da seçilen bir dosya vitest listesinde yoksa dağıtım TAMDIR (uyarıyla);
 * seçim geçerliyse bölme yine TAM listenin LPT'sindedir ve her iş kendi parçasını seçimle SÜZER (birleşim = seçim, kesişim 0, hiçbir dosya düşmez ya da iki kez koşmaz).
 * KARMA KİP: dört iş seçimi bağımsız hesaplar; biri tam'a düşse bile birleşim ⊇ seçim (çürütme bulgusu: bölme seçim üstünde olsaydı seçilen testler hiçbir işte koşmazdı).
 * Boş parça YALNIZ seçim modunda meşrudur (`kos=false`: vitest koşmaz, iş yeşil biter); tam modda boş parça kırmızıdır (eski kural). Boş seçimde `vitest list` ÇAĞRILMAZ (kurulum atlanmış olabilir).
 * Hiçbir test ağa ya da gerçek vitest'e dokunmaz; gerçek süreç testi vitest KURULU OLMAYAN geçici bir kökte koşar.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts/ci/test-shard.cjs')

interface SureTablosu {
  sureler: Map<string, number>
  varsayilan: number
}
interface SecimGirdisi {
  dosya: string
  tam: unknown
  sayi: unknown
}
type SecimKarari = { mod: 'secim'; dosyalar: string[] } | { mod: 'tam'; neden: string; mesru?: boolean }
interface Enjeksiyon {
  listele?: () => string[]
  sureOku?: () => SureTablosu
  yaz?: (dosya: string, icerik: string) => void
  log?: (m: string) => void
  ortam?: Record<string, string | undefined>
  ekle?: (dosya: string, icerik: string) => void
  secimGirdisi?: { oku?: (dosya: string, kodlama: string) => string; varMi?: (yol: string) => boolean; kok?: string }
}
const S = require_(BETIK) as {
  SECIM_ARGUMANLARI: string[]
  argumanlar: (argv: string[]) => { shard: number; toplam: number; cikti: string; secim?: { dosya: string; tam: string; sayi: string } }
  dagit: (dosyalar: string[], sure: SureTablosu, toplam: number) => { gruplar: string[][]; yuk: number[] }
  kumeyiBelirle: (secim: SecimGirdisi | undefined, listele: () => string[], g?: Enjeksiyon['secimGirdisi']) => { dosyalar: string[]; secilen: Set<string> | null; mod: string; uyari?: string; bilgi?: string }
  main: (argv?: string[], g?: Enjeksiyon) => number
  secimiCoz: (girdi: unknown, g?: Enjeksiyon['secimGirdisi']) => SecimKarari
}

const sirali = (a: readonly string[]): string[] => [...a].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0))
const tablo = (kayit: Record<string, number> = {}, varsayilan = 0.1): SureTablosu => ({ sureler: new Map(Object.entries(kayit)), varsayilan })

/** Belirlenimli sahte rastgele sayı üretici (mulberry32). */
function rastgele(tohum: number): () => number {
  let t = tohum
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const LISTE = Array.from({ length: 40 }, (_, i) => `src/m${String(i).padStart(2, '0')}/d${i}.test.ts`)
const SURELER = tablo(Object.fromEntries(LISTE.map((d, i) => [d, 1 + (i % 7)])), 0.1)
/** Seçim dosyası okuyucusu: `icerik` her yol için aynı metni döner; `varMi` her yolu var sayar (diskten bağımsız). */
const okuyucu = (icerik: string | Error): NonNullable<Enjeksiyon['secimGirdisi']> => ({
  oku: () => {
    if (icerik instanceof Error) throw icerik
    return icerik
  },
  varMi: () => true,
  kok: KOK,
})
const satirlar = (d: readonly string[]): string => `${d.join('\n')}${d.length ? '\n' : ''}`
const secimArg = (tam: string, sayi: string | number, dosya = 'secilen.txt') => ['--secim', dosya, '--secim-tam', tam, '--secim-sayi', String(sayi)]
const arg = (shard: number, toplam: number, ek: string[] = [], cikti = 'c.json') => ['--shard', String(shard), '--toplam', String(toplam), '--cikti', cikti, ...ek]

let gecici = ''
beforeAll(() => {
  gecici = mkdtempSync(path.join(tmpdir(), 'test-shard-secim-'))
})
afterAll(() => {
  if (gecici) rmSync(gecici, { recursive: true, force: true })
})

// ══ 1. argumanlar: seçim grubu ════════════════════════════════════════════════════════════════════════════════════════════
describe('argumanlar: `--secim`, `--secim-tam`, `--secim-sayi` BİRLİKTE verilir; verilmezse eski sözleşme aynen', () => {
  it('grup yokken dönüşte `secim` anahtarı YOK (eski çağıranlar ve testler aynen çalışır)', () => {
    expect(S.argumanlar(arg(2, 4))).toEqual({ shard: 2, toplam: 4, cikti: 'c.json' })
    expect('secim' in S.argumanlar(arg(2, 4))).toBe(false)
  })

  it('grup tam verilince dosya, tam ve sayı AYNEN taşınır (boş değer de geçerli bir değerdir: seçici çıktı vermemiş olabilir)', () => {
    expect(S.argumanlar(arg(1, 4, secimArg('false', 3))).secim).toEqual({ dosya: 'secilen.txt', tam: 'false', sayi: '3' })
    expect(S.argumanlar(arg(1, 4, ['--secim', 's.txt', '--secim-tam', '', '--secim-sayi', ''])).secim).toEqual({ dosya: 's.txt', tam: '', sayi: '' })
    expect(S.SECIM_ARGUMANLARI).toEqual(['--secim', '--secim-tam', '--secim-sayi'])
  })

  it('grubun YARISI FIRLATIR (seçici çıktısı eksik okunup seçim moduna sızmasın); bilinmeyen `--secim-*` bayrağı da', () => {
    for (const yarim of [['--secim', 's.txt'], ['--secim-tam', 'false'], ['--secim-sayi', '3'], ['--secim', 's.txt', '--secim-tam', 'false'], ['--secim-tam', 'false', '--secim-sayi', '3']]) {
      expect(() => S.argumanlar(arg(1, 4, yarim)), yarim.join(' ')).toThrow(/BİRLİKTE/)
    }
    expect(() => S.argumanlar(arg(1, 4, [...secimArg('false', 1), '--secim-ek', 'x']))).toThrow(/geçersiz argüman/)
    expect(() => S.argumanlar(arg(1, 4, ['--secim', 's.txt', '--secim-tam']))).toThrow(/geçersiz argüman/)
  })
})

// ══ 2. secimiCoz ══════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('secimiCoz: seçici çıktısı baştan sona tutarlı değilse TAM; FIRLATMAZ', () => {
  const g = (d: readonly string[]) => okuyucu(satirlar(d))
  const gecerli = (d: readonly string[]): SecimGirdisi => ({ dosya: 's.txt', tam: 'false', sayi: String(d.length) })

  it('geçerli seçim: sıralı ve tekil liste döner (girdi sırası önemsiz)', () => {
    const k = S.secimiCoz(gecerli([LISTE[5], LISTE[2], LISTE[9]]), g([LISTE[5], LISTE[2], LISTE[9]]))
    expect(k).toEqual({ mod: 'secim', dosyalar: [LISTE[2], LISTE[5], LISTE[9]] })
  })

  it('boş seçim (`0`, boş dosya) GEÇERLİDİR: seçim modu, dosya yok (boş seçim "seçici bozuldu" değildir)', () => {
    expect(S.secimiCoz({ dosya: 's.txt', tam: 'false', sayi: '0' }, okuyucu(''))).toEqual({ mod: 'secim', dosyalar: [] })
  })

  it('`tam` değeri HARFİ HARFİNE `false` değilse TAM: true, boş, eksik, büyük harf, boşluklu, başka tür', () => {
    for (const tam of ['true', '', undefined, 'FALSE', 'False', ' false', 'false ', 'evet', 0, null, false, {}]) {
      const k = S.secimiCoz({ dosya: 's.txt', tam, sayi: '1' }, g([LISTE[0]]))
      expect(k.mod, JSON.stringify(tam)).toBe('tam')
      // yalnız seçicinin KENDİ `tam=true` kararı meşrudur (bilgi); ötekilerin hepsi çıktı tutarsızlığıdır (uyarı)
      expect((k as { mesru?: boolean }).mesru === true, JSON.stringify(tam)).toBe(tam === 'true')
    }
    expect((S.secimiCoz({ dosya: 's.txt', tam: 'true', sayi: '1' }, g([LISTE[0]])) as { neden: string }).neden).toContain('seçici tam dedi')
  })

  it('seçilen sayısı geçerli bir tam sayı değilse TAM: boş, harf, eksi, kesirli, baştaki sıfır, üstel, boşluklu, 7 haneli', () => {
    for (const sayi of ['', 'abc', '-1', '1.5', '01', '1e3', ' 3', '3 ', '1234567', undefined, null, 3]) {
      const k = S.secimiCoz({ dosya: 's.txt', tam: 'false', sayi }, g([LISTE[0]]))
      expect(k.mod, JSON.stringify(sayi)).toBe('tam')
    }
  })

  it('seçim dosyası okunamıyorsa TAM (dosya yok, okuma hatası, dosya adı eksik)', () => {
    expect(S.secimiCoz(gecerli([LISTE[0]]), okuyucu(new Error('ENOENT'))).mod).toBe('tam')
    expect(S.secimiCoz({ tam: 'false', sayi: '1' }, okuyucu(new Error('dosya adı yok'))).mod).toBe('tam')
    expect(S.secimiCoz({ dosya: path.join(gecici, 'olmayan.txt'), tam: 'false', sayi: '1' }).mod).toBe('tam')
  })

  it('sayı ile dosyadaki satır sayısı TUTARSIZSA TAM (kesilmiş ya da yarım yazılmış dosya): fazla, eksik, boş dosya + sıfırdan büyük sayı', () => {
    expect(S.secimiCoz({ dosya: 's.txt', tam: 'false', sayi: '3' }, g([LISTE[0], LISTE[1]])).mod).toBe('tam')
    expect(S.secimiCoz({ dosya: 's.txt', tam: 'false', sayi: '1' }, g([LISTE[0], LISTE[1]])).mod).toBe('tam')
    expect(S.secimiCoz({ dosya: 's.txt', tam: 'false', sayi: '2' }, okuyucu('')).mod).toBe('tam')
    expect(S.secimiCoz({ dosya: 's.txt', tam: 'false', sayi: '0' }, g([LISTE[0]])).mod).toBe('tam')
  })

  it('geçersiz yol TAM: `..`, mutlak (POSIX ve sürücü), kök dışı, boş segment, tekrar eden yol', () => {
    for (const kotu of ['../disari.test.ts', '/etc/pasajsiz.test.ts', 'C:\\x\\y.test.ts', 'a//b.test.ts', 'a/../b.test.ts']) {
      expect(S.secimiCoz({ dosya: 's.txt', tam: 'false', sayi: '1' }, g([kotu])).mod, kotu).toBe('tam')
    }
    expect((S.secimiCoz({ dosya: 's.txt', tam: 'false', sayi: '2' }, g([LISTE[0], LISTE[0]])) as { neden: string }).neden).toContain('tekrar')
  })

  it('seçilen dosya diskte YOKSA TAM (varMi her çağrıda sınanır)', () => {
    const varMi = (y: string): boolean => !y.replace(/\\/g, '/').endsWith(LISTE[1])
    const k = S.secimiCoz(gecerli([LISTE[0], LISTE[1]]), { ...g([LISTE[0], LISTE[1]]), varMi })
    expect(k.mod).toBe('tam')
    expect((k as { neden: string }).neden).toContain('diskte yok')
  })

  it('CRLF satır sonları, sondaki boş satırlar ve satır arası boşluklar kabul edilir; sayı yalnız DOLU satırlarla eşleşir', () => {
    const k = S.secimiCoz({ dosya: 's.txt', tam: 'false', sayi: '2' }, okuyucu(`${LISTE[3]}\r\n\r\n${LISTE[1]}\r\n\n`))
    expect(k).toEqual({ mod: 'secim', dosyalar: [LISTE[1], LISTE[3]] })
  })

  it('FIRLATMAZ: bozuk girdi nesnesi, `varMi` ya da `oku` fırlatır, hata nesnesi bile okunamaz', () => {
    for (const bozuk of [null, undefined, 5, 'x', [], { tam: Symbol('x'), sayi: '1', dosya: 's.txt' }]) {
      expect(() => S.secimiCoz(bozuk, g([LISTE[0]])), String(bozuk)).not.toThrow()
      expect(S.secimiCoz(bozuk, g([LISTE[0]])).mod).toBe('tam')
    }
    const fiirlatanVarMi = { ...g([LISTE[0]]), varMi: () => { throw new Error('disk hatası') } }
    expect(S.secimiCoz(gecerli([LISTE[0]]), fiirlatanVarMi).mod).toBe('tam')
    const okunamazHata = { oku: () => { throw { get message(): string { throw new Error('getter') } } }, varMi: () => true }
    expect(S.secimiCoz(gecerli([LISTE[0]]), okunamazHata).mod).toBe('tam')
  })

  it('GERÇEK diskte: var olan dosya kabul, silinmiş dosya TAM (varsayılan okuyucular)', () => {
    const kok = path.join(gecici, 'gercek-disk')
    mkdirSync(path.join(kok, 'src'), { recursive: true })
    writeFileSync(path.join(kok, 'src/a.test.ts'), '')
    const liste = path.join(kok, 'secilen.txt')
    writeFileSync(liste, 'src/a.test.ts\n')
    expect(S.secimiCoz({ dosya: liste, tam: 'false', sayi: '1' }, { kok })).toEqual({ mod: 'secim', dosyalar: ['src/a.test.ts'] })
    rmSync(path.join(kok, 'src/a.test.ts'))
    expect(S.secimiCoz({ dosya: liste, tam: 'false', sayi: '1' }, { kok }).mod).toBe('tam')
  })
})

// ══ 3. kumeyiBelirle ══════════════════════════════════════════════════════════════════════════════════════════════════════
describe('kumeyiBelirle: bölünecek küme HER ZAMAN tam liste (seçim yalnız süzer); boş seçimde `vitest list` ÇAĞRILMAZ, seçilen vitest listesinde yoksa TAM', () => {
  function sayacli(): { listele: () => string[]; cagri: () => number } {
    let n = 0
    return {
      listele: () => {
        n += 1
        return LISTE
      },
      cagri: () => n,
    }
  }

  it('seçim grubu yok: vitest listesinin TAMAMI, uyarı yok (eski davranış)', () => {
    const s = sayacli()
    expect(S.kumeyiBelirle(undefined, s.listele)).toEqual({ dosyalar: LISTE, secilen: null, mod: 'tam' })
    expect(s.cagri()).toBe(1)
  })

  it('geçerli seçim ve hepsi vitest listesinde: BÖLÜNECEK küme vitest listesinin TAMAMI, SEÇİLENLER ayrı kümede (parçayı yalnız süzer); vitest list bir kez çağrılır', () => {
    const s = sayacli()
    const k = S.kumeyiBelirle({ dosya: 's.txt', tam: 'false', sayi: '2' }, s.listele, okuyucu(satirlar([LISTE[7], LISTE[3]])))
    expect(k).toEqual({ dosyalar: LISTE, secilen: new Set([LISTE[3], LISTE[7]]), mod: 'secim' })
    expect(s.cagri()).toBe(1)
  })

  it('BOŞ seçim: bölünecek küme boş, seçilen boş, mod seçim ve `vitest list` HİÇ ÇAĞRILMAZ (kurulum atlanmış olabilir)', () => {
    const s = sayacli()
    expect(S.kumeyiBelirle({ dosya: 's.txt', tam: 'false', sayi: '0' }, s.listele, okuyucu(''))).toEqual({ dosyalar: [], secilen: new Set(), mod: 'secim' })
    expect(s.cagri()).toBe(0)
  })

  it('seçilen dosya vitest listesinde YOKSA TAM + uyarı (seçici ile vitest ayrışmış: şüphede tam, seçim yutulmaz)', () => {
    const s = sayacli()
    const k = S.kumeyiBelirle({ dosya: 's.txt', tam: 'false', sayi: '2' }, s.listele, okuyucu(satirlar([LISTE[0], 'src/yok/ayrisan.test.ts'])))
    expect(k.mod).toBe('tam')
    expect(k.dosyalar).toEqual(LISTE)
    expect(k.secilen, 'seçim yutulmuş: süzme yok').toBeNull()
    expect(k.uyari).toContain('vitest listesinde yok')
    expect(k.uyari).toContain('src/yok/ayrisan.test.ts')
  })

  it('seçici KENDİSİ tam dedi: TAM + BİLGİ (uyarı değil: meşru karar); çıktı tutarsız: TAM + UYARI; neden mesajda yazılı', () => {
    const meşru = S.kumeyiBelirle({ dosya: 's.txt', tam: 'true', sayi: '5' }, () => LISTE, okuyucu(satirlar(LISTE.slice(0, 5))))
    expect(meşru).toMatchObject({ dosyalar: LISTE, mod: 'tam' })
    expect(meşru.bilgi).toContain('seçici tam dedi')
    expect(meşru.uyari, 'seçicinin kendi tam kararı sarı uyarı üretmez (her küresel PR dört shard\'da uyarı gösterirdi)').toBeUndefined()
    const k = S.kumeyiBelirle({ dosya: 's.txt', tam: 'false', sayi: '9' }, () => LISTE, okuyucu(satirlar([LISTE[0]])))
    expect(k).toMatchObject({ dosyalar: LISTE, mod: 'tam' })
    expect(k.uyari).toContain('satır var')
    expect(k.bilgi).toBeUndefined()
  })
})

// ══ 4. main: seçim modu ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('main (seçim modu): birleşim = seçim, kesişim 0; boş parça yeşil + `kos=false`; tam modda boş parça kırmızı', () => {
  function kos(argv: string[], g: Enjeksiyon = {}): { kod: number; yazilan: Map<string, string>; loglar: string[]; ciktilar: string[] } {
    const yazilan = new Map<string, string>()
    const loglar: string[] = []
    const ciktilar: string[] = []
    const kod = S.main(argv, {
      listele: () => LISTE,
      sureOku: () => SURELER,
      yaz: (d, i) => void yazilan.set(d, i),
      log: (m) => void loglar.push(m),
      ortam: { GITHUB_OUTPUT: 'cikti-dosyasi' },
      ekle: (_d, i) => void ciktilar.push(i),
      ...g,
    })
    return { kod, yazilan, loglar, ciktilar }
  }
  const parca = (y: Map<string, string>, d: string): string[] => JSON.parse(y.get(d) ?? 'null') as string[]

  it('KAPSAM: K seçilen × N shard (rastgele alt kümeler): her shard işi main ile kendi parçasını yazar; birleşim = seçim, kesişim 0, boş parça `[]` ve `kos=false`', () => {
    const rnd = rastgele(20261007)
    for (const k of [0, 1, 2, 3, 5, 17, 39, 40]) {
      for (const n of [1, 2, 3, 4, 5, 8]) {
        const secim = sirali([...LISTE].map((d) => [d, rnd()] as const).sort((a, b) => a[1] - b[1]).slice(0, k).map((x) => x[0]))
        const parcalar: string[][] = []
        for (let i = 1; i <= n; i++) {
          const r = kos(arg(i, n, secimArg('false', k), `p${i}.json`), { secimGirdisi: okuyucu(satirlar(secim)) })
          expect(r.kod, `K=${k} N=${n} shard ${i}`).toBe(0)
          const p = parca(r.yazilan, `p${i}.json`)
          expect(r.ciktilar, `K=${k} N=${n} shard ${i}`).toEqual([`kos=${p.length > 0}\n`])
          parcalar.push(p)
        }
        const hepsi = parcalar.flat()
        expect(hepsi.length, `K=${k} N=${n}: kesişim/çoğalma`).toBe(k)
        expect(sirali(hepsi), `K=${k} N=${n}: birleşim`).toEqual(secim)
        expect(new Set(hepsi).size, `K=${k} N=${n}`).toBe(hepsi.length)
        // bölme TAM liste üzerindedir: her parça, tam listenin kendi parçasının seçimle kesişimidir (seçimin kendi LPT'si DEĞİL)
        const tamBolme = S.dagit(LISTE, SURELER, n).gruplar
        parcalar.forEach((p, i) => expect(p, `K=${k} N=${n} shard ${i + 1}`).toEqual(tamBolme[i].filter((d) => secim.includes(d))))
      }
    }
  })

  it("KARMA KİP (çürütme bulgusu): dört işin bir kısmı tam'a düşer, kalanı seçimde kalır; birleşim HER KOMBİNASYONDA ⊇ seçim (hiçbir seçilen test düşmez)", () => {
    const rnd = rastgele(20261008)
    const N = 4
    for (const k of [1, 3, 8, 20, 39]) {
      const secim = sirali([...LISTE].map((d) => [d, rnd()] as const).sort((a, b) => a[1] - b[1]).slice(0, k).map((x) => x[0]))
      for (let maske = 0; maske < 2 ** N; maske++) {
        // bit i = 1: shard i+1 işi tam'a düştü (seçici çöktü ya da çıktısı okunamadı); 0: seçimde kaldı
        const parcalar: string[][] = []
        for (let i = 1; i <= N; i++) {
          const tamaDustu = (maske >> (i - 1)) & 1
          const girdi = tamaDustu ? secimArg('', '') : secimArg('false', k)
          const r = kos(arg(i, N, girdi, `p${i}.json`), { secimGirdisi: okuyucu(satirlar(secim)) })
          expect(r.kod, `K=${k} maske=${maske} shard ${i}`).toBe(0)
          parcalar.push(parca(r.yazilan, `p${i}.json`))
        }
        const birlesim = new Set(parcalar.flat())
        const dusen = secim.filter((d) => !birlesim.has(d))
        expect(dusen, `K=${k} maske=${maske}: seçilen ama HİÇBİR işte koşmayan test`).toEqual([])
        expect(parcalar.flat().length, `K=${k} maske=${maske}: aynı test iki işte koşuyor`).toBe(birlesim.size)
        if (maske === 0) expect(sirali([...birlesim]), `K=${k}: hepsi seçimde: birleşim = seçim`).toEqual(secim)
        if (maske === 2 ** N - 1) expect(sirali([...birlesim]), `K=${k}: hepsi tam: birleşim = tüm liste`).toEqual(sirali(LISTE))
      }
    }
  })

  it('belirlenimli: seçim dosyasındaki SIRA parçaları değiştirmez (her shard işi bölmeyi kendi hesaplar)', () => {
    const secim = [LISTE[30], LISTE[4], LISTE[19], LISTE[8], LISTE[22], LISTE[1]]
    const a = kos(arg(2, 3, secimArg('false', secim.length)), { secimGirdisi: okuyucu(satirlar(secim)) })
    const b = kos(arg(2, 3, secimArg('false', secim.length)), { secimGirdisi: okuyucu(satirlar([...secim].reverse())) })
    expect(a.yazilan.get('c.json')).toBe(b.yazilan.get('c.json'))
  })

  it('boş seçim: vitest list çağrılmaz, her parça `[]`, `kos=false`, çıkış 0, bilgi satırı "test düşmedi"', () => {
    let cagri = 0
    const r = kos(arg(3, 4, secimArg('false', 0)), { listele: () => ((cagri += 1), LISTE), secimGirdisi: okuyucu('') })
    expect(r.kod).toBe(0)
    expect(cagri).toBe(0)
    expect(r.yazilan.get('c.json')).toBe('[]\n')
    expect(r.ciktilar).toEqual(['kos=false\n'])
    expect(r.loglar.join('\n')).toMatch(/^::notice::test shard 3\/4 \(seçim\): bu parçaya test düşmedi \(seçilen 0 dosya\); vitest koşmaz, iş yeşil biter$/)
  })

  it('dolu parça: `kos=true`, bilgi satırında (seçim) etiketi ve toplam seçilen sayısı; ağırlıklar yalnız SEÇİLENLERİN ağırlığıdır', () => {
    const secim = S.dagit(LISTE, SURELER, 2).gruplar[0].slice(0, 6) // 1. parçaya tam listenin bölmesinde düşen altı dosya: parça kesin dolu
    const r = kos(arg(1, 2, secimArg('false', secim.length)), { secimGirdisi: okuyucu(satirlar(secim)) })
    expect(r.ciktilar).toEqual(['kos=true\n'])
    expect(r.loglar[0]).toMatch(/^::notice::test shard 1\/2 \(seçim\): 6 dosya, ağırlık [\d.]+ sn \(.*; toplam 6 dosya\)$/)
    const secimAgirligi = secim.reduce((s, d) => s + (SURELER.sureler.get(d) ?? SURELER.varsayilan), 0)
    expect(Number(/ağırlık ([\d.]+) sn/.exec(r.loglar[0])?.[1])).toBeCloseTo(secimAgirligi, 1)
  })

  it('parçaya seçilen düşmediyse (seçim başka parçada): `kos=false`, parça `[]`, çıkış 0, iş yeşil (tam modun kırmızı boş parça kuralı buraya sızmaz)', () => {
    const baskasinda = S.dagit(LISTE, SURELER, 4).gruplar[2].slice(0, 2) // yalnız 3. parçanın dosyaları seçildi
    const r = kos(arg(1, 4, secimArg('false', baskasinda.length)), { secimGirdisi: okuyucu(satirlar(baskasinda)) })
    expect(r.kod).toBe(0)
    expect(r.yazilan.get('c.json')).toBe('[]\n')
    expect(r.ciktilar).toEqual(['kos=false\n'])
    expect(r.loglar.join('\n')).toContain('(seçilen 2 dosya)')
  })

  it('TAM modda (seçici tam dedi) boş parça HÂLÂ KIRMIZI: seçim modunun hoşgörüsü tam moda sızmaz', () => {
    const r = kos(arg(3, 4, secimArg('true', 0)), { listele: () => ['a.test.ts', 'b.test.ts'], secimGirdisi: okuyucu('') })
    expect(r.kod).toBe(1)
    expect(r.yazilan.size).toBe(0)
    expect(r.ciktilar).toEqual([])
    expect(r.loglar.join('\n')).toContain('BOŞ')
  })

  it('seçici tam dedi: TAM paket dağıtılır, `::notice::` (uyarı YOK) ve `kos=true`; çıktı tutarsız (sayı, boş, geçersiz): TAM paket, `::warning::` ve `kos=true`; parçalar birleşince vitest listesinin TAMAMI', () => {
    const MESRU = [secimArg('true', 3)]
    const TUTARSIZ = [secimArg('false', 2), secimArg('', ''), secimArg('false', 'abc')]
    for (const girdi of [...MESRU, ...TUTARSIZ]) {
      const parcalar: string[] = []
      let uyari = ''
      let bilgi = ''
      for (let i = 1; i <= 4; i++) {
        const r = kos(arg(i, 4, girdi, `p${i}.json`), { secimGirdisi: okuyucu(satirlar([LISTE[0], LISTE[1], LISTE[2]])) })
        expect(r.kod, girdi.join(' ')).toBe(0)
        expect(r.ciktilar).toEqual(['kos=true\n'])
        parcalar.push(...parca(r.yazilan, `p${i}.json`))
        uyari = r.loglar.find((m) => m.startsWith('::warning::')) ?? uyari
        bilgi = r.loglar.find((m) => m.startsWith('::notice::test shard: seçim kullanılmadı')) ?? bilgi
      }
      expect(sirali(parcalar), girdi.join(' ')).toEqual(sirali(LISTE))
      if (MESRU.includes(girdi)) {
        expect(uyari, `${girdi.join(' ')}: meşru tam kararı uyarı üretmez`).toBe('')
        expect(bilgi).toBe('::notice::test shard: seçim kullanılmadı, TAM paket dağıtılıyor: seçici tam dedi')
      } else {
        expect(uyari, girdi.join(' ')).toMatch(/^::warning::test shard: seçim kullanılmadı, TAM paket dağıtılıyor: /)
        expect(bilgi, `${girdi.join(' ')}: tutarsızlık bilgi değil uyarıdır`).toBe('')
      }
    }
  })

  it('seçilen dosya vitest listesinde yoksa TAM paket (seçici ile vitest ayrışması seçimi yutmaz)', () => {
    const r = kos(arg(1, 4, secimArg('false', 2)), { secimGirdisi: okuyucu(satirlar([LISTE[0], 'src/yok/ayrisan.test.ts'])) })
    expect(r.kod).toBe(0)
    expect(parca(r.yazilan, 'c.json')).toEqual(S.dagit(LISTE, SURELER, 4).gruplar[0])
    expect(r.loglar.join('\n')).toContain('vitest listesinde yok')
  })

  it('`--secim` grubu YOKKEN $GITHUB_OUTPUT\'a HİÇ yazılmaz (eski çağıranlar ve unit testler runner çıktısını kirletmez); tam mod bilgi satırı eskisi gibi TEK satır', () => {
    const r = kos(arg(2, 4))
    expect(r.kod).toBe(0)
    expect(r.ciktilar).toEqual([])
    expect(r.loglar).toHaveLength(1)
    expect(r.loglar[0]).toMatch(/^::notice::test shard 2\/4: \d+ dosya, ağırlık/)
  })

  it('$GITHUB_OUTPUT tanımsız ya da boşsa yazılmaz (yerel koşum); yazma hatası UYARI verir ama dağıtımı kırmızı yapmaz (çıktı yoksa ci.yml testi koşturur)', () => {
    for (const ortam of [{}, { GITHUB_OUTPUT: '' }]) {
      const r = kos(arg(1, 2, secimArg('false', 4)), { ortam, secimGirdisi: okuyucu(satirlar(LISTE.slice(0, 4))) })
      expect(r.kod).toBe(0)
      expect(r.ciktilar).toEqual([])
    }
    const r = kos(arg(1, 2, secimArg('false', 4)), {
      secimGirdisi: okuyucu(satirlar(LISTE.slice(0, 4))),
      ekle: () => {
        throw new Error('disk dolu')
      },
    })
    expect(r.kod).toBe(0)
    expect(r.loglar.some((m) => m.startsWith('::warning::test shard: GITHUB_OUTPUT yazılamadı (disk dolu)'))).toBe(true)
  })

  it('geçersiz seçim argümanı 1 döner ve DOSYA YAZMAZ (yarım grup)', () => {
    const r = kos(arg(1, 4, ['--secim', 'secilen.txt']))
    expect(r.kod).toBe(1)
    expect(r.yazilan.size).toBe(0)
    expect(r.ciktilar).toEqual([])
    expect(r.loglar.join('\n')).toMatch(/^::error::test shard dağıtımı BAŞARISIZ: /)
  })

  it('`vitest list` çalışmazsa (kurulum eksik) boş OLMAYAN seçimde 1 döner: kırmızı, sessiz yeşil değil', () => {
    const r = kos(arg(1, 4, secimArg('false', 1)), {
      listele: () => {
        throw new Error('vitest list çalışmadı: kurulum yok')
      },
      secimGirdisi: okuyucu(satirlar([LISTE[0]])),
    })
    expect(r.kod).toBe(1)
    expect(r.yazilan.size).toBe(0)
    expect(r.loglar.join('\n')).toContain('vitest list çalışmadı')
  })
})

// ══ 4b. CI ortamı kanaryası ═══════════════════════════════════════════════════════════════════════════════════════════════════════
describe('CI ortamı kanaryası: testlerin koştuğu adımın ortamı temiz (canlı ders: #1741 koşu 2)', () => {
  // `SHARD` ve `SECIM_*` YALNIZ dağıtım adımının ortamındadır; Test adımına girerlerse bu test sürecine (ve tüm alt süreçlerine) miras kalırlardı. Yalnız GERÇEK runner'da anlamlıdır (yerelde zaten tanımsız).
  it.skipIf(!process.env.GITHUB_ACTIONS)('SHARD, SECIM_TAM ve SECIM_SAYI test sürecinde TANIMSIZ: dağıtım adımının değişkenleri testlere sızmaz', () => {
    for (const ad of ['SHARD', 'SECIM_TAM', 'SECIM_SAYI']) expect(process.env[ad], ad).toBeUndefined()
  })

  it('dağıtıcı kendi alt süreçlerine (vitest list) shard listesini ve VITEST* değişkenlerini VERMEZ; seçim değişkenlerini okumaz (argümanla alır)', () => {
    const kaynak = readFileSync(BETIK, 'utf8')
    expect(kaynak).not.toMatch(/process\.env\.(?:SECIM_TAM|SECIM_SAYI|SHARD)\b/)
    expect(kaynak).toMatch(/delete env\[ORTAM_ADI\]/)
  })
})

// ══ 5. gerçek süreç (vitest KURULU OLMAYAN geçici kök) ══════════════════════════════════════════════════════════════════════
describe('gerçek süreç: boş seçim kurulumsuz kökte 0 ile biter ve `kos=false` yazar; boş OLMAYAN seçim aynı kökte kırmızıdır', () => {
  /** Betiğin KENDİ kopyası geçici bir kökte (scripts/ci/): `node_modules` yok, yani `vitest list` çalışamaz. Ortam bilerek ve açıkça kurulur (üst sürecin shard/VITEST değişkenleri sızmaz). */
  function kuruluKok(ad: string): { kok: string; cikti: string } {
    const kok = path.join(gecici, ad)
    mkdirSync(path.join(kok, 'scripts/ci'), { recursive: true })
    copyFileSync(BETIK, path.join(kok, 'scripts/ci/test-shard.cjs'))
    copyFileSync(path.join(KOK, 'scripts/ci/test-sureleri.json'), path.join(kok, 'scripts/ci/test-sureleri.json'))
    mkdirSync(path.join(kok, 'src'), { recursive: true })
    writeFileSync(path.join(kok, 'src/a.test.ts'), '')
    return { kok, cikti: path.join(kok, 'github_output') }
  }
  function calistir(kok: string, ciktiDosyasi: string, argv: string[]): { kod: number; ekran: string; cikti: string } {
    writeFileSync(ciktiDosyasi, '')
    const env: NodeJS.ProcessEnv = { ...process.env, GITHUB_OUTPUT: ciktiDosyasi }
    for (const k of Object.keys(env)) if (k.startsWith('VITEST') || k === 'VENTHUB_TEST_SHARD_DOSYALARI') delete env[k]
    const r = spawnSync(process.execPath, [path.join(kok, 'scripts/ci/test-shard.cjs'), ...argv], { cwd: kok, env, encoding: 'utf8', timeout: 60_000 })
    return { kod: r.status ?? -1, ekran: `${r.stdout}${r.stderr}`, cikti: readFileSync(ciktiDosyasi, 'utf8') }
  }

  it('boş seçim: çıkış 0, parça dosyası `[]`, $GITHUB_OUTPUT `kos=false`, vitest hiç çağrılmaz (node_modules yok)', () => {
    const { kok, cikti } = kuruluKok('bos-secim')
    writeFileSync(path.join(kok, 'secilen.txt'), '')
    const r = calistir(kok, cikti, arg(2, 4, secimArg('false', 0, path.join(kok, 'secilen.txt')), path.join(kok, 'shard.json')))
    expect(r.ekran).not.toContain('::error::')
    expect(r.kod).toBe(0)
    expect(readFileSync(path.join(kok, 'shard.json'), 'utf8')).toBe('[]\n')
    expect(r.cikti).toBe('kos=false\n')
  })

  it('boş OLMAYAN seçim aynı kökte KIRMIZI (vitest list gerekir, kurulum yok): sessiz yeşil yok, parça dosyası oluşmaz', () => {
    const { kok, cikti } = kuruluKok('dolu-secim')
    writeFileSync(path.join(kok, 'secilen.txt'), 'src/a.test.ts\n')
    const r = calistir(kok, cikti, arg(1, 4, secimArg('false', 1, path.join(kok, 'secilen.txt')), path.join(kok, 'shard.json')))
    expect(r.kod).toBe(1)
    expect(r.ekran).toContain('::error::test shard dağıtımı BAŞARISIZ: vitest list çalışmadı')
    expect(r.cikti).toBe('')
  })

  it('seçim argümanı OLMADAN aynı kök: eski sözleşme (vitest list gerekir, kurulum yok → 1) ve $GITHUB_OUTPUT\'a yazılmaz', () => {
    const { kok, cikti } = kuruluKok('eski-sozlesme')
    const r = calistir(kok, cikti, arg(1, 4, [], path.join(kok, 'shard.json')))
    expect(r.kod).toBe(1)
    expect(r.cikti).toBe('')
  })
})
