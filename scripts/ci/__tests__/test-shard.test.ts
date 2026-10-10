import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Test shard DAĞITICISI birim testleri (scripts/ci/test-shard.cjs, ALT-38c-2). Bağlantı ve kapsam kanıtı: src/__tests__/conformance/ci-test-shard.test.ts (INV-CI-SHARD-1/2).
 *
 * Tek değişmez: dağıtıcı ya DOĞRU böler ya KIRMIZI verir. "Doğru" = her dosya TAM BİR gruba girer (birleşim = girdi, kesişim 0), aynı girdi her zaman aynı bölmeyi üretir
 * (her shard işi bölmeyi kendi hesaplar, ortak durum yoktur), süresi bilinmeyen dosya düşmez. Kırmızı = tekrar, geçersiz N, kök dışı/`..`'lı yol, boş liste, boş shard,
 * bozuk süre dosyası, çalışmayan `vitest list`: hiçbiri sessizce "hiçbir şey koşmadı" yeşiline dönüşmez. Hiçbir test ağa ya da gerçek `vitest`e dokunmaz
 * (`vitestListesi` sahte bir `vitest.mjs` ile sınanır; gerçek liste ile bölme ci-test-shard.test.ts'tedir).
 *
 * Bloklar: 1. dagit (LPT, belirlenim, sınır), 2. yoluNormallestir, 3. globKacir, 4. sureleriOku, 5. ortamdanInclude, 6. argumanlar, 7. vitestListesi (sahte vitest),
 * 8. main (enjeksiyonla çıkış kodları ve parçalar arası kapsam), 9. gerçek süreç (argüman hatası çıkış kodu).
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts/ci/test-shard.cjs')

interface SureTablosu {
  sureler: Map<string, number>
  varsayilan: number
}
interface Dagitim {
  gruplar: string[][]
  yuk: number[]
}
interface Enjeksiyon {
  listele?: () => string[]
  sureOku?: () => SureTablosu
  yaz?: (dosya: string, icerik: string) => void
  log?: (m: string) => void
}
/** Geçersiz girdi testleri için parametreler `unknown` (tip dökümü gerekmez); gerçek imza JS'tedir ve her değeri kendisi doğrular. */
const S = require_(BETIK) as {
  EN_FAZLA_SHARD: number
  ORTAM_ADI: string
  argumanlar: (argv: string[]) => { shard: number; toplam: number; cikti: string }
  dagit: (dosyalar: unknown, sure: SureTablosu, toplam: unknown) => Dagitim
  globKacir: (yol: unknown) => string
  main: (argv?: string[], g?: Enjeksiyon) => number
  ortamdanInclude: (ortam?: NodeJS.ProcessEnv) => string[] | null
  sureleriOku: (dosya?: string) => SureTablosu
  vitestListesi: (kok?: string, ortam?: NodeJS.ProcessEnv) => string[]
  yoluNormallestir: (yol: unknown, kok?: string) => string
}

const tablo = (kayit: Record<string, number> = {}, varsayilan = 0.1): SureTablosu => ({ sureler: new Map(Object.entries(kayit)), varsayilan })
const sirali = (a: readonly string[]): string[] => [...a].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0))

/** Belirlenimli sahte rastgele sayı üretici (mulberry32): testler her koşuda aynı girdiyi görür. */
function rastgele(tohum: number): () => number {
  let t = tohum
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

let gecici = ''
beforeAll(() => {
  gecici = mkdtempSync(path.join(tmpdir(), 'test-shard-birim-'))
})
afterAll(() => {
  if (gecici) rmSync(gecici, { recursive: true, force: true })
})
const yeniDizin = (ad: string): string => {
  const d = path.join(gecici, ad)
  mkdirSync(d, { recursive: true })
  return d
}

// ══ 1. dagit ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('dagit: süreye göre dengeli, belirlenimci, kapsamı kanıtlı bölme', () => {
  const agirliklar: Record<string, number> = {
    'a/10.test.ts': 10,
    'a/09.test.ts': 9,
    'a/08.test.ts': 8,
    'a/07.test.ts': 7,
    'a/06.test.ts': 6,
    'a/05.test.ts': 5,
    'a/04.test.ts': 4,
    'a/03.test.ts': 3,
    'a/02.test.ts': 2,
    'a/01.test.ts': 1,
  }
  const dosyalar = Object.keys(agirliklar)

  it('LPT: en ağır önce, en az yüklü gruba, eşitlikte en küçük numaraya; her grup yol sıralı; yük toplamı doğru', () => {
    const { gruplar, yuk } = S.dagit(dosyalar, tablo(agirliklar), 3)
    expect(gruplar).toEqual([
      ['a/04.test.ts', 'a/05.test.ts', 'a/10.test.ts'],
      ['a/03.test.ts', 'a/06.test.ts', 'a/09.test.ts'],
      ['a/01.test.ts', 'a/02.test.ts', 'a/07.test.ts', 'a/08.test.ts'],
    ])
    expect(yuk).toEqual([19, 18, 18])
    expect(yuk.reduce((a, b) => a + b, 0)).toBe(55)
  })

  it('belirlenimli: aynı girdi aynı bölme; girdi sırası (ters, karışık) sonucu DEĞİŞTİRMEZ', () => {
    const a = S.dagit(dosyalar, tablo(agirliklar), 3)
    expect(S.dagit(dosyalar, tablo(agirliklar), 3)).toEqual(a)
    expect(S.dagit([...dosyalar].reverse(), tablo(agirliklar), 3)).toEqual(a)
    const karisik = [dosyalar[4], dosyalar[9], dosyalar[0], dosyalar[7], dosyalar[2], dosyalar[5], dosyalar[1], dosyalar[8], dosyalar[3], dosyalar[6]]
    expect(S.dagit(karisik, tablo(agirliklar), 3)).toEqual(a)
  })

  it('eşit ağırlıkta yol sırası belirler: dosyalar gruplara sırayla dağılır (kararsız sıralama yok)', () => {
    const d = ['b/6.test.ts', 'b/1.test.ts', 'b/4.test.ts', 'b/3.test.ts', 'b/5.test.ts', 'b/2.test.ts']
    const { gruplar } = S.dagit(d, tablo({}, 2), 3)
    expect(gruplar).toEqual([
      ['b/1.test.ts', 'b/4.test.ts'],
      ['b/2.test.ts', 'b/5.test.ts'],
      ['b/3.test.ts', 'b/6.test.ts'],
    ])
  })

  it('süresi bilinmeyen (yeni) dosya VARSAYILAN ağırlıkla dağıtılır ve düşmez; yük hesabına girer', () => {
    const yeni = 'src/yeni/olculmedi.test.ts'
    const t = tablo({ 'a/x.test.ts': 5, 'a/y.test.ts': 5 }, 0.25)
    const { gruplar, yuk } = S.dagit(['a/x.test.ts', 'a/y.test.ts', yeni], t, 2)
    expect(sirali(gruplar.flat())).toEqual(sirali(['a/x.test.ts', 'a/y.test.ts', yeni]))
    expect(gruplar.filter((g) => g.includes(yeni))).toHaveLength(1)
    expect(yuk.reduce((a, b) => a + b, 0)).toBeCloseTo(10.25, 9)
  })

  it('özellik: rastgele 622 dosya x 1..8 shard: birleşim = girdi, kesişim 0, hiçbir dosya iki kez ya da hiç yok, en yüklü/ortalama düşük', () => {
    const r = rastgele(20261007)
    const girdi = Array.from({ length: 622 }, (_, i) => `src/k${String(i).padStart(3, '0')}/d${i}.test.ts`)
    const sureler: Record<string, number> = {}
    for (const d of girdi) if (r() < 0.3) sureler[d] = Math.round(r() * r() * 400) / 10
    for (let n = 1; n <= 8; n++) {
      const { gruplar, yuk } = S.dagit(girdi, tablo(sureler), n)
      expect(gruplar, `N=${n}`).toHaveLength(n)
      const hepsi = gruplar.flat()
      expect(hepsi.length, `N=${n}: dosya düştü ya da çoğaldı`).toBe(girdi.length)
      expect(new Set(hepsi).size, `N=${n}: bir dosya iki grupta`).toBe(girdi.length)
      expect(sirali(hepsi), `N=${n}: birleşim girdi değil`).toEqual(sirali(girdi))
      for (const g of gruplar) expect(g).toEqual(sirali(g))
      const ort = yuk.reduce((a, b) => a + b, 0) / n
      expect(Math.max(...yuk) / ort, `N=${n}: denge`).toBeLessThan(1.1)
    }
  })

  it('N=1 her şeyi tek grupta toplar (sıralı); N dosya sayısından büyükse boş gruplar OLUŞUR (reddi main yapar)', () => {
    expect(S.dagit(['b.test.ts', 'a.test.ts'], tablo(), 1).gruplar).toEqual([['a.test.ts', 'b.test.ts']])
    const { gruplar } = S.dagit(['a.test.ts', 'b.test.ts'], tablo(), 4)
    expect(gruplar).toHaveLength(4)
    expect(gruplar.filter((g) => g.length === 0)).toHaveLength(2)
    expect(sirali(gruplar.flat())).toEqual(['a.test.ts', 'b.test.ts'])
  })

  it('boş girdi: tüm gruplar boş (hata fırlatmaz; boş shard reddi main`de)', () => {
    expect(S.dagit([], tablo(), 3).gruplar).toEqual([[], [], []])
  })

  it('tekrar eden yol FIRLATIR (aynı dosyayı iki kez koşturup başka dosyayı düşüren bölme kabul edilmez)', () => {
    expect(() => S.dagit(['a.test.ts', 'b.test.ts', 'a.test.ts'], tablo(), 2)).toThrow(/tekrar/)
  })

  it('geçersiz shard sayısı FIRLATIR: 0, negatif, kesirli, 33, NaN, Infinity, metin, boş', () => {
    for (const bozuk of [0, -1, 1.5, S.EN_FAZLA_SHARD + 1, Number.NaN, Number.POSITIVE_INFINITY, '4', '', null, undefined]) {
      expect(() => S.dagit(['a.test.ts'], tablo(), bozuk), String(bozuk)).toThrow(/shard sayısı/)
    }
    expect(S.EN_FAZLA_SHARD).toBe(32)
    expect(() => S.dagit(['a.test.ts'], tablo(), S.EN_FAZLA_SHARD)).not.toThrow()
  })

  it('dosya listesi dizi değilse FIRLATIR', () => {
    expect(() => S.dagit('a.test.ts', tablo(), 2)).toThrow(/dizi/)
    expect(() => S.dagit(null, tablo(), 2)).toThrow(/dizi/)
    expect(() => S.dagit({ 0: 'a.test.ts', length: 1 }, tablo(), 2)).toThrow(/dizi/)
  })
})

// ══ 2. yoluNormallestir ═══════════════════════════════════════════════════════════════════════════════════════════════
describe('yoluNormallestir: depo köküne göreli POSIX yol; kök dışı, `..` ve boş yol FIRLATIR', () => {
  const kok = 'C:/repo/venthub'

  it('göreli yol aynen kalır; ters bölü eğik çizgiye döner', () => {
    expect(S.yoluNormallestir('src/a/b.test.ts', kok)).toBe('src/a/b.test.ts')
    expect(S.yoluNormallestir('src\\a\\b.test.ts', kok)).toBe('src/a/b.test.ts')
  })

  it('kök altındaki mutlak yol göreliye çevrilir (Windows ve POSIX, büyük/küçük harf ve sondaki eğik çizgi farkı önemsiz)', () => {
    expect(S.yoluNormallestir('C:/repo/venthub/src/a.test.ts', kok)).toBe('src/a.test.ts')
    expect(S.yoluNormallestir('C:\\repo\\venthub\\src\\a.test.ts', kok)).toBe('src/a.test.ts')
    expect(S.yoluNormallestir('c:/REPO/Venthub/src/a.test.ts', kok)).toBe('src/a.test.ts')
    expect(S.yoluNormallestir('C:/repo/venthub/src/a.test.ts', 'C:/repo/venthub/')).toBe('src/a.test.ts')
    expect(S.yoluNormallestir('/work/venthub/src/a.test.ts', '/work/venthub')).toBe('src/a.test.ts')
  })

  it('kök DIŞINDAKİ mutlak yol FIRLATIR (başka depo, kardeş klasör, sürücü, POSIX kökü)', () => {
    for (const yol of ['C:/repo/baska/src/a.test.ts', 'C:/repo/venthub-eski/src/a.test.ts', 'D:/x/a.test.ts', '/etc/a.test.ts', 'C:foo/a.test.ts']) {
      expect(() => S.yoluNormallestir(yol, kok), yol).toThrow(/depo kökü altında değil/)
    }
  })

  it('`..` içeren yol FIRLATIR (başı, ortası, sonu; kök içi göreli yola dönse de)', () => {
    for (const yol of ['../a.test.ts', 'src/../../a.test.ts', 'src/a/..', 'C:/repo/venthub/src/../../x.test.ts']) {
      expect(() => S.yoluNormallestir(yol, kok), yol).toThrow(/depo kökü altında değil/)
    }
  })

  it('boş yol, yalnız kök, boş segment (`a//b`) ve sonda eğik çizgi FIRLATIR', () => {
    for (const yol of ['', 'C:/repo/venthub/', 'C:/repo/venthub', 'src//a.test.ts', 'src/a/', 'src\\\\a.test.ts']) {
      expect(() => S.yoluNormallestir(yol, kok), JSON.stringify(yol)).toThrow(/depo kökü altında değil/)
    }
  })

  it('metin OLMAYAN girdi FIRLATIR (undefined, null, sayı, nesne, dizi): "undefined" adlı yol uydurulmaz', () => {
    for (const kotu of [undefined, null, 5, {}, ['src/a.test.ts'], true]) {
      expect(() => S.yoluNormallestir(kotu, kok), String(kotu)).toThrow(/test yolu metin olmalı/)
    }
  })
})

// ══ 3. globKacir ═════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('globKacir: yol include deseninde DÜZ METİN eşleşir (gerçek vitest glob ile doğrulaması: ci-test-shard.test.ts)', () => {
  it('düz yol değişmez', () => {
    expect(S.globKacir('src/a/b-c_d.test.ts')).toBe('src/a/b-c_d.test.ts')
  })

  it('picomatch özel karakterlerinin HEPSİ kaçırılır: köşeli, yuvarlak, küme parantezi, *, ?, +, @, !, ters bölü', () => {
    expect(S.globKacir('src/app/[lang]/(site)/x.test.ts')).toBe('src/app/\\[lang\\]/\\(site\\)/x.test.ts')
    expect(S.globKacir('a+b/x@y!.test.ts')).toBe('a\\+b/x\\@y\\!.test.ts')
    expect(S.globKacir('{k}/*.test.ts?')).toBe('\\{k\\}/\\*.test.ts\\?')
    expect(S.globKacir('a\\b')).toBe('a\\\\b')
    // kaçırılmış desende kaçırılmamış özel karakter KALMAZ: her özel karakterin önünde ters bölü var
    const ozel = '[]{}()*?+@!\\'
    const kacirilmis = S.globKacir(ozel)
    expect(kacirilmis).toHaveLength(ozel.length * 2)
    for (let i = 0; i < kacirilmis.length; i += 2) expect(kacirilmis[i], `konum ${i}`).toBe('\\')
  })

  it('metin olmayan girdi metne çevrilir (sayı)', () => {
    expect(S.globKacir(5)).toBe('5')
  })
})

// ══ 4. sureleriOku ═══════════════════════════════════════════════════════════════════════════════════════════════════════
describe('sureleriOku: bozuk ağırlık dosyası FIRLATIR (sessizce varsayılana düşen ağırlık dengeyi gizlice bozar)', () => {
  const yaz = (ad: string, icerik: unknown): string => {
    const dosya = path.join(yeniDizin('sureler'), ad)
    writeFileSync(dosya, typeof icerik === 'string' ? icerik : JSON.stringify(icerik))
    return dosya
  }

  it('geçerli dosya: Map ve varsayılan okunur', () => {
    const t = S.sureleriOku(yaz('gecerli.json', { _aciklama: 'x', varsayilan_sn: 0.1, sureler: { 'a.test.ts': 1.5, 'b.test.ts': 0 } }))
    expect(t.varsayilan).toBe(0.1)
    expect([...t.sureler.entries()]).toEqual([
      ['a.test.ts', 1.5],
      ['b.test.ts', 0],
    ])
  })

  it('bozuk girdilerin HEPSİ FIRLATIR: JSON değil, nesne değil, sureler yok/dizi/boş değer, varsayılan eksik/0/negatif/metin, süre negatif/metin/null', () => {
    const bozuklar: Array<[string, unknown, RegExp | undefined]> = [
      ['json-degil.json', '{bozuk', undefined],
      ['null.json', 'null', /nesne olmalı/],
      ['dizi.json', [], /nesne olmalı/],
      ['sureler-yok.json', { varsayilan_sn: 0.1 }, /nesne olmalı/],
      ['sureler-dizi.json', { varsayilan_sn: 0.1, sureler: [] }, /nesne olmalı/],
      ['sureler-null.json', { varsayilan_sn: 0.1, sureler: null }, /nesne olmalı/],
      ['varsayilan-yok.json', { sureler: {} }, /varsayilan_sn/],
      ['varsayilan-sifir.json', { varsayilan_sn: 0, sureler: {} }, /varsayilan_sn/],
      ['varsayilan-negatif.json', { varsayilan_sn: -1, sureler: {} }, /varsayilan_sn/],
      ['varsayilan-metin.json', { varsayilan_sn: '0.1', sureler: {} }, /varsayilan_sn/],
      ['sure-negatif.json', { varsayilan_sn: 0.1, sureler: { 'a.test.ts': -2 } }, /süresi geçersiz/],
      ['sure-metin.json', { varsayilan_sn: 0.1, sureler: { 'a.test.ts': '3' } }, /süresi geçersiz/],
      ['sure-null.json', { varsayilan_sn: 0.1, sureler: { 'a.test.ts': null } }, /süresi geçersiz/],
    ]
    for (const [ad, icerik, desen] of bozuklar) {
      const dosya = yaz(ad, icerik)
      if (desen) expect(() => S.sureleriOku(dosya), ad).toThrow(desen)
      else expect(() => S.sureleriOku(dosya), ad).toThrow()
    }
    expect(() => S.sureleriOku(path.join(gecici, 'yok.json'))).toThrow(/ENOENT/)
  })

  it('GERÇEK scripts/ci/test-sureleri.json geçerli; her anahtar depo köküne göreli POSIX yol (Windows biçimli anahtar sessizce varsayılana düşerdi)', () => {
    const t = S.sureleriOku()
    expect(t.varsayilan).toBeGreaterThan(0)
    expect(t.sureler.size).toBeGreaterThan(100)
    for (const [yol, sn] of t.sureler) {
      expect(S.yoluNormallestir(yol, KOK), yol).toBe(yol)
      expect(/\.test\.(?:ts|tsx|js|mjs|cjs)$/.test(yol), yol).toBe(true)
      expect(sn).toBeGreaterThanOrEqual(0)
    }
  })
})

// ══ 5. ortamdanInclude ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('ortamdanInclude: vitest.config.ts include bağı; bozuk liste FIRLATIR (sessizce tam pakete ya da boş pakete düşmez)', () => {
  const liste = (ad: string, icerik: unknown): string => {
    const dosya = path.join(yeniDizin('include'), ad)
    writeFileSync(dosya, typeof icerik === 'string' ? icerik : JSON.stringify(icerik))
    return dosya
  }

  it('ortam değişkeni yok ya da boş: null (hiçbir şey değişmez: yerel pnpm test, master push, edited, zamanlı koşu)', () => {
    expect(S.ortamdanInclude({})).toBeNull()
    expect(S.ortamdanInclude({ [S.ORTAM_ADI]: '' })).toBeNull()
  })

  it('geçerli liste: her yol göreli POSIX ve glob karakterleri kaçırılmış desene çevrilir', () => {
    const dosya = liste('gecerli.json', ['src/a.test.ts', 'src/app/[lang]/(site)/x.test.ts'])
    expect(S.ortamdanInclude({ [S.ORTAM_ADI]: dosya })).toEqual(['src/a.test.ts', 'src/app/\\[lang\\]/\\(site\\)/x.test.ts'])
  })

  it('boş liste, dizi olmayan, bozuk JSON ve olmayan dosya FIRLATIR', () => {
    expect(() => S.ortamdanInclude({ [S.ORTAM_ADI]: liste('bos.json', []) })).toThrow(/boş ya da dizi değil/)
    expect(() => S.ortamdanInclude({ [S.ORTAM_ADI]: liste('nesne.json', { a: 1 }) })).toThrow(/boş ya da dizi değil/)
    expect(() => S.ortamdanInclude({ [S.ORTAM_ADI]: liste('bozuk.json', '[') })).toThrow()
    expect(() => S.ortamdanInclude({ [S.ORTAM_ADI]: path.join(gecici, 'yok-liste.json') })).toThrow(/ENOENT/)
  })

  it('listedeki kök dışı, `..` içeren ve boş yol FIRLATIR', () => {
    for (const kotu of ['../x.test.ts', '/etc/x.test.ts', 'src/../../x.test.ts', '']) {
      expect(() => S.ortamdanInclude({ [S.ORTAM_ADI]: liste('kotu.json', ['src/a.test.ts', kotu]) }), JSON.stringify(kotu)).toThrow(/depo kökü altında değil/)
    }
  })
})

// ══ 6. argumanlar ═════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('argumanlar: --shard N --toplam M --cikti DOSYA', () => {
  it('geçerli argümanlar sayıya çevrilir (sıra serbest)', () => {
    expect(S.argumanlar(['--shard', '2', '--toplam', '4', '--cikti', 'x.json'])).toEqual({ shard: 2, toplam: 4, cikti: 'x.json' })
    expect(S.argumanlar(['--cikti', 'y.json', '--toplam', '8', '--shard', '8'])).toEqual({ shard: 8, toplam: 8, cikti: 'y.json' })
  })

  it('eksik, fazla, bilinmeyen ve sayı olmayan argümanlar FIRLATIR', () => {
    const bozuklar: string[][] = [
      [],
      ['--shard', '1', '--toplam', '4'],
      ['--shard', '1', '--cikti', 'x.json'],
      ['--toplam', '4', '--cikti', 'x.json'],
      ['--shard', 'bir', '--toplam', '4', '--cikti', 'x.json'],
      ['--shard', '-1', '--toplam', '4', '--cikti', 'x.json'],
      ['--shard', '1.5', '--toplam', '4', '--cikti', 'x.json'],
      ['--shard', '1', '--toplam', '4x', '--cikti', 'x.json'],
      ['--shard', '1', '--toplam', '4', '--cikti'],
      ['--shard', '1', '--toplam', '4', '--cikti', 'x.json', '--ekstra', '1'],
      ['shard', '1', 'toplam', '4', 'cikti', 'x.json'],
    ]
    for (const b of bozuklar) expect(() => S.argumanlar(b), b.join(' ')).toThrow()
  })
})

// ══ 7. vitestListesi (sahte vitest.mjs) ══════════════════════════════════════════════════════════════════════════════════
describe('vitestListesi: `vitest list --filesOnly --json` çıktısı doğrulanır; her hata FIRLATIR', () => {
  /** Geçici bir kök ve içinde `node_modules/vitest/vitest.mjs` olarak çalışan sahte vitest; sahte vitest argüman sözleşmesini de doğrular. */
  function sahteKok(ad: string, govde: string): string {
    const kok = yeniDizin(ad)
    mkdirSync(path.join(kok, 'node_modules', 'vitest'), { recursive: true })
    const baslik = `const kok = ${JSON.stringify(kok.replace(/\\/g, '/'))}\nif (process.argv.slice(2).join(' ') !== 'list --filesOnly --json') { process.stderr.write('argüman: ' + process.argv.slice(2).join(' ')); process.exit(2) }\n`
    writeFileSync(path.join(kok, 'node_modules', 'vitest', 'vitest.mjs'), `${baslik}${govde}\n`)
    return kok
  }

  it('çıktı kök-göreli POSIX yola çevrilir, tekilleştirilir ve yol sırasına dizilir', () => {
    const kok = sahteKok('vl-normal', "process.stdout.write(JSON.stringify([{ file: kok + '/src/b.test.ts' }, { file: kok + '/src/a.test.ts' }, { file: kok + '/src/a.test.ts' }]))")
    expect(S.vitestListesi(kok, {})).toEqual(['src/a.test.ts', 'src/b.test.ts'])
  })

  it('üst süreçten sızan VITEST* ve shard listesi alt sürece GİTMEZ (iç içe vitest ve shard işinde tam liste alınır)', () => {
    const kok = sahteKok('vl-env', "const sizdi = Object.keys(process.env).some((k) => k.startsWith('VITEST')) || process.env.VENTHUB_TEST_SHARD_DOSYALARI !== undefined\nprocess.stdout.write(JSON.stringify([{ file: kok + '/' + (sizdi ? 'sizdi' : 'temiz') + '.test.ts' }]))")
    const ortam = { ...process.env, VITEST_WORKER_ID: '1', VITEST_POOL_ID: '2', VITEST: 'true', [S.ORTAM_ADI]: 'baska.json' }
    expect(S.vitestListesi(kok, ortam)).toEqual(['temiz.test.ts'])
  })

  it('diğer ortam değişkenleri (kip, taban listesi) alt sürece İLETİLİR', () => {
    const kok = sahteKok('vl-kip', "process.stdout.write(JSON.stringify([{ file: kok + '/' + (process.env.VENTHUB_DUNYA_DURUMU ?? 'bos') + '.test.ts' }]))")
    expect(S.vitestListesi(kok, { ...process.env, VENTHUB_DUNYA_DURUMU: 'dislan' })).toEqual(['dislan.test.ts'])
  })

  it('boş liste FIRLATIR (hiç test dosyası bulunamadı: sessiz "hiçbir şey koşmadı" yeşili olmaz)', () => {
    expect(() => S.vitestListesi(sahteKok('vl-bos', "process.stdout.write('[]')"), {})).toThrow(/boş döndü/)
  })

  it('JSON olmayan ve dizi olmayan çıktı FIRLATIR', () => {
    expect(() => S.vitestListesi(sahteKok('vl-json', "process.stdout.write('merhaba')"), {})).toThrow()
    expect(() => S.vitestListesi(sahteKok('vl-nesne', 'process.stdout.write(\'{"file":"x"}\')'), {})).toThrow(/boş döndü/)
  })

  it('vitest hata koduyla biterse FIRLATIR ve stderr mesajı taşınır', () => {
    expect(() => S.vitestListesi(sahteKok('vl-hata', "process.stderr.write('boom nedeni')\nprocess.exit(1)"), {})).toThrow(/vitest list çalışmadı: boom nedeni/)
  })

  it('vitest.mjs yoksa FIRLATIR (kurulum yapılmamış)', () => {
    expect(() => S.vitestListesi(yeniDizin('vl-yok'), {})).toThrow(/vitest list çalışmadı/)
  })

  it('kök dışı, `..` içeren ve dosya alanı olmayan çıktı FIRLATIR', () => {
    expect(() => S.vitestListesi(sahteKok('vl-disari', "process.stdout.write(JSON.stringify([{ file: '/baska/yer/x.test.ts' }]))"), {})).toThrow(/depo kökü altında değil/)
    expect(() => S.vitestListesi(sahteKok('vl-nokta', "process.stdout.write(JSON.stringify([{ file: kok + '/../x.test.ts' }]))"), {})).toThrow(/depo kökü altında değil/)
    // `file` alanı olmayan kayıt "undefined" adlı geçerli bir yol OLMAZ (en küçük düzeltme: yoluNormallestir metin olmayan girdiyi reddeder)
    expect(() => S.vitestListesi(sahteKok('vl-alansiz', "process.stdout.write(JSON.stringify([{ ad: 'x' }]))"), {})).toThrow(/test yolu metin olmalı \(verilen undefined\)/)
    expect(() => S.vitestListesi(sahteKok('vl-null', 'process.stdout.write(JSON.stringify([null]))'), {})).toThrow(/test yolu metin olmalı/)
    expect(() => S.vitestListesi(sahteKok('vl-sayi', "process.stdout.write(JSON.stringify([{ file: 5 }]))"), {})).toThrow(/test yolu metin olmalı \(verilen 5\)/)
  })
})

// ══ 8. main ═════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('main: çıkış kodu 0 yalnız geçerli ve DOLU bir parça yazılırsa; her hata 1 ve `::error::` satırı', () => {
  const liste = Array.from({ length: 40 }, (_, i) => `src/m${String(i).padStart(2, '0')}/d${i}.test.ts`)
  const sureler = tablo(Object.fromEntries(liste.map((d, i) => [d, 1 + (i % 7)])), 0.1)

  function calistir(argv: string[], g: Enjeksiyon = {}): { kod: number; yazilan: Map<string, string>; loglar: string[] } {
    const yazilan = new Map<string, string>()
    const loglar: string[] = []
    const kod = S.main(argv, {
      listele: () => liste,
      sureOku: () => sureler,
      yaz: (dosya, icerik) => void yazilan.set(dosya, icerik),
      log: (m) => void loglar.push(m),
      ...g,
    })
    return { kod, yazilan, loglar }
  }
  const arg = (shard: number | string, toplam: number | string, cikti = 'c.json'): string[] => ['--shard', String(shard), '--toplam', String(toplam), '--cikti', cikti]

  it('geçerli çağrı: parçayı JSON olarak yazar (sonda satır sonu), 0 döner, bilgi satırı `::notice::` ve yük özeti taşır', () => {
    const { kod, yazilan, loglar } = calistir(arg(2, 4, 'c2.json'))
    expect(kod).toBe(0)
    const icerik = yazilan.get('c2.json') ?? ''
    expect(icerik.endsWith('\n')).toBe(true)
    const parca = JSON.parse(icerik) as string[]
    expect(parca).toEqual(S.dagit(liste, sureler, 4).gruplar[1])
    expect(loglar).toHaveLength(1)
    expect(loglar[0]).toMatch(/^::notice::test shard 2\/4: \d+ dosya, ağırlık [\d.]+ sn \(tüm shard'lar: .+; en yüklü\/ortalama [\d.]+; toplam 40 dosya\)$/)
  })

  it('PARÇALAR ARASI KAPSAM: N işin her biri main ile kendi parçasını yazar; birleşim = liste, kesişim 0 (her shard işi bölmeyi kendi hesaplar)', () => {
    for (const n of [1, 2, 3, 4, 5, 7]) {
      const parcalar: string[][] = []
      for (let i = 1; i <= n; i++) {
        const { kod, yazilan } = calistir(arg(i, n, `p${i}.json`))
        expect(kod, `N=${n} shard ${i}`).toBe(0)
        parcalar.push(JSON.parse(yazilan.get(`p${i}.json`) ?? '[]') as string[])
      }
      const hepsi = parcalar.flat()
      expect(hepsi.length, `N=${n}`).toBe(liste.length)
      expect(new Set(hepsi).size, `N=${n}: kesişim`).toBe(liste.length)
      expect(sirali(hepsi), `N=${n}: birleşim`).toEqual(sirali(liste))
      parcalar.forEach((p) => expect(p.length).toBeGreaterThan(0))
    }
  })

  it('geçersiz argümanlar 1 döner ve DOSYA YAZMAZ: eksik, sayı değil, 0, toplamdan büyük, 33 parça, bilinmeyen bayrak', () => {
    const bozuklar: string[][] = [[], arg(0, 4), arg(5, 4), arg('x', 4), arg(1, 'y'), arg(1, 33), ['--shard', '1', '--toplam', '4'], [...arg(1, 4), '--ekstra', '1']]
    for (const b of bozuklar) {
      const { kod, yazilan, loglar } = calistir(b)
      expect(kod, b.join(' ')).toBe(1)
      expect(yazilan.size, b.join(' ')).toBe(0)
      expect(loglar.join('\n'), b.join(' ')).toMatch(/^::error::test shard dağıtımı BAŞARISIZ: /)
    }
  })

  it('BOŞ shard 1 döner (bölme geçersiz: o iş hiç test koşmadan yeşil bitemez) ve dosya yazmaz', () => {
    const { kod, yazilan, loglar } = calistir(arg(3, 4), { listele: () => ['a.test.ts', 'b.test.ts'] })
    expect(kod).toBe(1)
    expect(yazilan.size).toBe(0)
    expect(loglar[0]).toMatch(/::error::.*shard 3\/4 BOŞ \(2 dosya\)/)
  })

  it('`vitest list` boş ya da hatalı: 1; süre dosyası bozuk: 1; yazma hatası: 1; tekrar eden yol: 1', () => {
    expect(calistir(arg(1, 2), { listele: () => [] }).kod).toBe(1)
    expect(
      calistir(arg(1, 2), {
        listele: () => {
          throw new Error('vitest list çalışmadı: boom')
        },
      }).loglar[0],
    ).toMatch(/::error::.*vitest list çalışmadı: boom/)
    expect(
      calistir(arg(1, 2), {
        sureOku: () => {
          throw new Error('test-sureleri.json: "sureler" nesne olmalı')
        },
      }).kod,
    ).toBe(1)
    expect(
      calistir(arg(1, 2), {
        yaz: () => {
          throw new Error('ENOSPC: disk dolu')
        },
      }).kod,
    ).toBe(1)
    expect(calistir(arg(1, 2), { listele: () => ['a.test.ts', 'a.test.ts', 'b.test.ts'] }).kod).toBe(1)
  })

  it('hata mesajı TEK satıra iner ve 300 karakterle sınırlanır (satır sonu yeni bir iş akışı komutu yazamaz)', () => {
    const { kod, loglar } = calistir(arg(1, 2), {
      listele: () => {
        throw new Error(`ilk\n::error::sahte komut\r\n${'x'.repeat(1000)}`)
      },
    })
    expect(kod).toBe(1)
    expect(loglar).toHaveLength(1)
    expect(loglar[0]).not.toMatch(/[\r\n]/)
    expect(loglar[0].startsWith('::error::test shard dağıtımı BAŞARISIZ: ilk ::error::sahte komut')).toBe(true)
    expect(loglar[0].length).toBeLessThanOrEqual('::error::test shard dağıtımı BAŞARISIZ: '.length + 300)
  })
})

// ══ 9. gerçek süreç ═════════════════════════════════════════════════════════════════════════════════════════════════════
describe('gerçek süreç: betik çıkış kodunu process.exitCode ile taşır', () => {
  it('argümansız çağrı: çıkış kodu 1, stdout `::error::` (vitest list ÇAĞRILMADAN)', () => {
    const r = spawnSync(process.execPath, [BETIK], { cwd: KOK, encoding: 'utf8', timeout: 30_000, windowsHide: true })
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/^::error::test shard dağıtımı BAŞARISIZ: --shard, --toplam \(tam sayı\) ve --cikti zorunlu\r?\n$/)
  })

  it('geçersiz parça numarası: çıkış kodu 1 ve çıktı dosyası OLUŞMAZ', () => {
    const cikti = path.join(yeniDizin('surec'), 'yok.json')
    const r = spawnSync(process.execPath, [BETIK, '--shard', '9', '--toplam', '4', '--cikti', cikti], { cwd: KOK, encoding: 'utf8', timeout: 30_000, windowsHide: true })
    expect(r.status).toBe(1)
    expect(r.stdout).toContain('--shard 9, 1..4 aralığında olmalı')
    const var_mi = spawnSync(process.execPath, ['-e', `process.exit(require('node:fs').existsSync(${JSON.stringify(cikti)}) ? 3 : 0)`])
    expect(var_mi.status).toBe(0)
  })
})
