/**
 * INV-TESLIM-KART-1 — teslim-kart köprüsü (`scripts/board/teslim-kart-koprusu.cjs`, HRT-47, OPS 2026-10-09).
 *
 * NİÇİN VAR: kart-not sayacı (INV-KART-NOT-1) yalnız Done kolonundaki kartı görür; kartı Backlog'da kalan teslim (10-09: URUN'un dört PR'ı)
 * sayaçta görünmez. Köprü ters yönden bakar: master'a giren her PR'ın numarası o gün bir kart notunda geçiyor mu? Bu paket köprünün AYIRT
 * EDİCİ olduğunu ölçer: anılan teslim geçer; anılmayan, alt dizgi tuzağı, dünkü not, sistem satırı ve kısa not kırmızı verir; ölçülemeyen hal
 * "temiz" sayılmaz. Gerçek Kanban/origin'e DOKUNMAZ (sahte JSON + sahte git günlüğü + geçici git deposu).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

type Not = { author: string; content: string; createdAt: string }
type Kayit = { identifier: string; status?: string; serit?: string; notes?: Not[] }
type Teslim = { kisa: string; baslik: string; pr: string; departman: string; kart: string | null }
type Sonuc = {
  gun: string
  teslim: number
  notsuz: number
  departmanlar: Record<string, { teslim: number; notsuz: { pr: string; kart: string | null; kisa: string }[] }>
  prSiz: { kisa: string }[]
  cikis: number
}
type Modul = {
  departman: (baslik: string) => string
  teslimleriCoz: (satirlar: string[]) => { teslimler: Teslim[]; prSiz: { kisa: string; kart: string | null }[] }
  notAniyor: (metin: string, teslim: { pr: string; kisa: string }) => boolean
  gununNotlari: (kayitlar: Kayit[], gun: string) => string[]
  olc: (kayitlar: Kayit[], satirlar: string[], gun: string) => Sonuc
  satirlariYaz: (sonuc: Sonuc) => string[]
  main: (argv: string[], simdi?: Date) => number
}

const KOK = spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const require = createRequire(import.meta.url)
const BETIK = path.join(KOK, 'scripts/board/teslim-kart-koprusu.cjs')
const T = require(BETIK) as Modul

const GUN = '2026-10-09'
const BUGUN_IKI = '2026-10-09T11:00:00.000Z'
const DUN_IKI = '2026-10-08T11:00:00.000Z'
const not = (content: string, createdAt = BUGUN_IKI, author = 'URUN'): Not => ({ author, content, createdAt })
const kart = (identifier: string, notes: Not[]): Kayit => ({ identifier, status: 'Backlog', serit: 'URUN', notes })

const LOG = [
  'bcb3047b1|URUN (URN-58): teknik tabloda ham true/false yerine Var/Yok (#1774)',
  '63cd773d1|URUN (REC-491): site ikonu HTML\'e bağlandı (#1752)',
  '4fd69b96b|HARİTA (HRT-38): filo kuralı (#1779)',
  '036d4690a|HARİTA (HRT-36): rol kartlarına iki satır (#1771)',
]

describe('INV-TESLIM-KART-1 · departman ve teslim ayrıştırma', () => {
  it.each([
    ['HARİTA (HRT-37): x (#1782)', 'HARITA'],
    ['HARITA (HRT-37): x', 'HARITA'],
    ['GEO-SEO (IndexNow): x', 'GEO-SEO'],
    ['URUN (URN-58): x', 'URUN'],
    ['ALTYAPI (ALT-37e): x', 'ALTYAPI'],
    ['Tasarım: x', 'TASARIM'],
    ['ürün (x)', 'URUN'],
    ['şeker: x', 'SEKER'],
    ['harita: x', 'HARITA'],
  ])('"%s" → %s', (baslik, beklenen) => {
    expect(T.departman(baslik)).toBe(beklenen)
  })

  it('"(#N)" ile biten başlık teslimdir; kart numarası ve departman çıkar; PR numarasız commit ayrı döner', () => {
    const { teslimler, prSiz } = T.teslimleriCoz([...LOG, 'abc1234|GEO-SEO (IndexNow): doğrudan commit'])
    expect(teslimler.map((t) => [t.pr, t.kart, t.departman])).toEqual([
      ['1774', 'URN-58', 'URUN'],
      ['1752', 'REC-491', 'URUN'],
      ['1779', 'HRT-38', 'HARITA'],
      ['1771', 'HRT-36', 'HARITA'],
    ])
    expect(prSiz.map((c) => c.kisa)).toEqual(['abc1234'])
  })

  it('başlık sonunda olmayan "(#N)" (başlığın ortasında geçen PR atfı) teslim SAYILMAZ', () => {
    const { teslimler, prSiz } = T.teslimleriCoz(['aaa1111|URUN (URN-1): #1786 sonrası düzeltme'])
    expect(teslimler).toHaveLength(0)
    expect(prSiz).toHaveLength(1)
  })

  it('PARANTEZLİ atıf da başlık sonunda değilse teslim sayılmaz; sonda olan sayılır ($ çapası)', () => {
    const ortada = T.teslimleriCoz(['aaa1111|URUN (URN-1): ara (#1786) devam'])
    expect(ortada.teslimler).toHaveLength(0)
    expect(ortada.prSiz).toHaveLength(1)
    const ikisi = T.teslimleriCoz(['aaa1111|URUN (URN-1): ara (#1786) devam (#1774)'])
    expect(ikisi.teslimler.map((t) => t.pr)).toEqual(['1774'])
  })

  it('harf sonekli kart numarası düşmez (10-08: ALT-38e, ALT-37d, ALT-37b başlıkları kartsız görünüyordu)', () => {
    const { teslimler } = T.teslimleriCoz([
      'a111111|ALTYAPI (ALT-37e): x (#1745)',
      'a222222|ALTYAPI (ALT-38e): x (#1744)',
      'a333333|TASARIM (TSR-10b): x (#1730)',
      'a444444|ALTYAPI (ALT-45): sonek yok (#1759)',
      'a555555|HARİTA (HRT-47 sonrası): x (#1790)',
    ])
    expect(teslimler.map((t) => t.kart)).toEqual(['ALT-37e', 'ALT-38e', 'TSR-10b', 'ALT-45', 'HRT-47'])
  })

  it('"kısa|başlık" biçiminde olmayan günlük satırı VERİ HATASI', () => {
    expect(() => T.teslimleriCoz(['biçimsiz satır'])).toThrow(/kısa\|başlık/)
  })
})

describe('INV-TESLIM-KART-1 · notAniyor (eşleşme kuralları)', () => {
  const t = { pr: '1786', kisa: '17c2f5f69' }

  it.each(['PR #1786 birleşti', 'teslim: #1786', '(#1786)', 'https://github.com/o/r/pull/1786', 'PR 1786 açıldı', 'pr#1786', 'commit 17c2f5f'])(
    '"%s" teslimi anar',
    (m) => {
      expect(T.notAniyor(m, t)).toBe(true)
    },
  )

  it.each([
    ['#17 numaralı iş', 'alt dizgi: #17, #1786\'yı karşılamaz'],
    ['#178 ve #17860', 'komşu numaralar'],
    ['REC#1786', 'harfe bitişik # (PR atfı değil)'],
    ['commit 17c2f5 kısa', '6 karakterlik kısaltma yetmez'],
    ['hiçbir şey yok', 'ilgisiz metin'],
  ])('"%s" teslimi ANMAZ (%s)', (m) => {
    expect(T.notAniyor(m, t)).toBe(false)
  })

  it('PR numarasının KENDİSİ başka numaranın önekiyse karıştırmaz (#178 teslimi, "#1786" notunda anılmış sayılmaz)', () => {
    expect(T.notAniyor('#1786 birleşti', { pr: '178', kisa: 'zzzzzzz' })).toBe(false)
  })

  it('"PR N" ve "/pull/N" kuralları da komşu numarayı karıştırmaz (üç kuralın üçü ayrı sınanır)', () => {
    expect(T.notAniyor('PR 17860 açıldı', t)).toBe(false)
    expect(T.notAniyor('https://github.com/o/r/pull/17860', t)).toBe(false)
    expect(T.notAniyor('PR 178 açıldı', t)).toBe(false)
    expect(T.notAniyor('PR 1786 açıldı', t)).toBe(true)
    expect(T.notAniyor('https://github.com/o/r/pull/1786', t)).toBe(true)
  })

  describe('commit kısaltması: tek başına duran sözcük, öneki paylaşan', () => {
    const h = { pr: '9999', kisa: 'bcb3047b1' }

    it.each([
      ['bcb3047b1', 'tam kısaltma'],
      ['commit bcb3047', 'not kısaltılmış (7 karakter)'],
      ['COMMIT BCB3047B1 girdi', 'büyük harf'],
      [`sha ${'bcb3047b1'}${'0'.repeat(31)}`, 'tam 40 karakterlik sha'],
      ['(bcb3047b1)', 'parantez içinde'],
    ])('"%s" anar (%s)', (m) => {
      expect(T.notAniyor(m, h)).toBe(true)
    })

    it.each([
      ['xbcb3047b1y', 'harfe bitişik'],
      ['abcb3047b1', 'başka sözcüğün ortasındaki parça'],
      ['bcb3047b1z', 'sonda harf var'],
      ['bcb304', '6 karakter'],
      ['bcb3048 farklı: bcb3049', 'ilgisiz 7 karakterlik sözcükler (önek paylaşmaz)'],
    ])('"%s" ANMAZ (%s)', (m) => {
      expect(T.notAniyor(m, h)).toBe(false)
    })

    it('SALT RAKAMLI kısaltma: sayı/tutar kısaltma sayılmaz, tam kısaltma sayılır (3,5% commit\'in ilk 7 hanesi rakamdır)', () => {
      const r = { pr: '9999', kisa: '1234567ab' }
      expect(T.notAniyor('tutar 1234567 TL', r)).toBe(false)
      expect(T.notAniyor('ab1234567cd', r)).toBe(false)
      expect(T.notAniyor('kod 1234567ab bitti', r)).toBe(true)
      expect(T.notAniyor('kod 1234567ab0123 bitti', r)).toBe(true)
    })

    it('eşik ve büyük/küçük harf: 7 karakterden kısa kısaltmanın kendisi anmaz; büyük harf eşdeğerdir', () => {
      expect(T.notAniyor('abc', { pr: '1', kisa: 'abc' })).toBe(false)
      expect(T.notAniyor('abcdef', { pr: '1', kisa: 'abcdef' })).toBe(false)
      expect(T.notAniyor('COMMIT 17C2F5F', { pr: '1', kisa: '17c2f5f69' })).toBe(true)
    })
  })
})

describe('INV-TESLIM-KART-1 · gununNotlari', () => {
  it('yalnız o günün, sistem dışı, dolu notları toplanır', () => {
    const kayitlar = [
      kart('URN-1', [not('PR #1774 birleşti, iki satır özet.'), not('PR #1752 dünkü not', DUN_IKI), not('kısa'), not('PR #1766 sistem satırı', BUGUN_IKI, 'system')]),
    ]
    expect(T.gununNotlari(kayitlar, GUN)).toEqual(['PR #1774 birleşti, iki satır özet.'])
  })

  it('gün SONRASI not da sayılmaz: 10-08 teslimini 10-09\'da yazılmış not karşılamaz (10-08: #1759/#1756/#1750 gerçek örnek)', () => {
    const k = [kart('URN-1', [not('PR #1774 sonradan yazıldı, iki satır özet.', BUGUN_IKI)])]
    expect(T.gununNotlari(k, '2026-10-08')).toEqual([])
    expect(T.gununNotlari(k, '2026-10-10')).toEqual([])
    expect(T.gununNotlari(k, GUN)).toHaveLength(1)
  })

  it('not günü TÜRKİYE gününe göredir (UTC değil): TR 00:30 notu o günün, TR ertesi 00:30 notu ertesi günün', () => {
    const trGeceIki = '2026-10-08T21:30:00.000Z' // TR 10-09 00:30
    const trErtesiGece = '2026-10-09T21:30:00.000Z' // TR 10-10 00:30
    const k = [kart('URN-1', [not('PR #1774 gece yarısından sonra yazıldı.', trGeceIki), not('PR #1752 ertesi gün yazıldı, iki satır.', trErtesiGece)])]
    expect(T.gununNotlari(k, GUN)).toEqual(['PR #1774 gece yarısından sonra yazıldı.'])
    expect(T.gununNotlari(k, '2026-10-10')).toEqual(['PR #1752 ertesi gün yazıldı, iki satır.'])
  })

  it('notes alanı olmayan ya da null olan kayıt çökmez, atlanır', () => {
    const k = [{ identifier: 'X-1' }, { identifier: 'X-2', notes: null as unknown as Not[] }, kart('URN-1', [not('PR #1774 birleşti, iki satır özet.')])]
    expect(T.gununNotlari(k as Kayit[], GUN)).toEqual(['PR #1774 birleşti, iki satır özet.'])
    expect(T.olc(k as Kayit[], [LOG[0]], GUN)).toMatchObject({ teslim: 1, notsuz: 0 })
  })
})

describe('INV-TESLIM-KART-1 · olc (saf işlev)', () => {
  it('PR numarası bugünkü bir notta geçiyorsa teslim "kartlı" sayılır (not başka kartta da olabilir)', () => {
    const k = [kart('URN-58', [not('Teslim: PR #1774 birleşti; iki satır özet.')]), kart('HRT-38', [not('PR #1779 ve #1771 işlendi, iki satır.', BUGUN_IKI, 'HARITA')])]
    const s = T.olc(k, LOG, GUN)
    expect(s.departmanlar.URUN).toEqual({ teslim: 2, notsuz: [{ pr: '1752', kart: 'REC-491', kisa: '63cd773d1' }] })
    expect(s.departmanlar.HARITA.notsuz).toEqual([])
    expect(s).toMatchObject({ teslim: 4, notsuz: 1, cikis: 1 })
  })

  it('SABOTAJ: aynı veriden notlar silinince tüm teslimler notsuz olur, çıkış 1', () => {
    const s = T.olc([kart('URN-58', [])], LOG, GUN)
    expect(s).toMatchObject({ teslim: 4, notsuz: 4, cikis: 1 })
  })

  it('commit kısaltması da anar (PR numarası yazılmamış not)', () => {
    const s = T.olc([kart('URN-58', [not('commit bcb3047b1 master\'a girdi, iki satır özet.')])], [LOG[0]], GUN)
    expect(s).toMatchObject({ teslim: 1, notsuz: 0, cikis: 0 })
  })

  it('dünkü not bugünün teslimini KARŞILAMAZ (gecikmiş ya da erken not kırmızıyı silmez)', () => {
    const s = T.olc([kart('URN-58', [not('PR #1774 birleşti, iki satır özet.', DUN_IKI)])], [LOG[0]], GUN)
    expect(s.notsuz).toBe(1)
  })

  it('PR numarasız commit sayılır ama çıkış kodunu etkilemez', () => {
    const s = T.olc([kart('URN-58', [not('PR #1774 birleşti, iki satır özet.')])], [LOG[0], 'abc1234|GEO-SEO (x): doğrudan'], GUN)
    expect(s).toMatchObject({ teslim: 1, notsuz: 0, cikis: 0 })
    expect(s.prSiz).toHaveLength(1)
    expect(T.satirlariYaz(s).join('\n')).toContain('PR numarasız commit 1')
  })

  it('satır biçimi "DEPARTMAN: Teslim N, kart notunda geçmeyen M: #PR (kart)" ve toplam satırı', () => {
    const s = T.olc([], [LOG[0], LOG[1]], GUN)
    expect(T.satirlariYaz(s)).toEqual([
      'URUN: Teslim 2, kart notunda geçmeyen 2: #1774 (URN-58), #1752 (REC-491)',
      'TOPLAM 2026-10-09: Teslim 2, kart notunda geçmeyen 2',
    ])
  })

  it('departmanlar ada göre SIRALI yazılır (günlük sırası değil): HARİTA, URUN; toplam en sonda', () => {
    const s = T.olc([kart('URN-58', [not('PR #1774, #1752, #1779 ve #1771 birleşti; iki satır özet.')])], LOG, GUN)
    expect(T.satirlariYaz(s)).toEqual([
      'HARITA: Teslim 2, kart notunda geçmeyen 0',
      'URUN: Teslim 2, kart notunda geçmeyen 0',
      'TOPLAM 2026-10-09: Teslim 4, kart notunda geçmeyen 0',
    ])
  })

  it('varsayılan gün TÜRKİYE gününden gelir: UTC 21:30 TR\'de ertesi gün (saat dışarıdan verilir)', () => {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'teslim-kart-saat-'))
    try {
      const logYol = path.join(dizin, 'log.txt')
      const kanbanYol = path.join(dizin, 'k.json')
      fs.writeFileSync(logYol, LOG[0], 'utf8')
      fs.writeFileSync(kanbanYol, JSON.stringify({ kayitlar: [kart('URN-58', [])] }), 'utf8')
      const gunler = [
        ['2026-10-09T20:59:00.000Z', '2026-10-09'], // TR 23:59
        ['2026-10-09T21:00:00.000Z', '2026-10-10'], // TR 00:00
        ['2026-10-09T21:30:00.000Z', '2026-10-10'], // TR 00:30
      ]
      for (const [saat, beklenen] of gunler) {
        const yazilan: string[] = []
        const spy = vi.spyOn(process.stdout, 'write').mockImplementation(((m: string | Uint8Array) => {
          yazilan.push(String(m))
          return true
        }) as typeof process.stdout.write)
        try {
          T.main(['--log-dosya', logYol, '--dosya', kanbanYol, '--json'], new Date(saat))
        } finally {
          spy.mockRestore()
        }
        expect((JSON.parse(yazilan.join('')) as Sonuc).gun, saat).toBe(beklenen)
      }
    } finally {
      fs.rmSync(dizin, { recursive: true, force: true })
    }
  })
})

describe('INV-TESLIM-KART-1 · komut satırı', () => {
  let dizin = ''
  const yaz = (ad: string, icerik: unknown) => {
    const yol = path.join(dizin, ad)
    fs.writeFileSync(yol, typeof icerik === 'string' ? icerik : JSON.stringify(icerik), 'utf8')
    return yol
  }
  const cli = (...a: string[]) => {
    const r = spawnSync(process.execPath, [BETIK, ...a], { encoding: 'utf8' })
    return { kod: r.status, cikti: `${r.stdout}${r.stderr}`, stdout: r.stdout }
  }

  beforeAll(() => {
    dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'teslim-kart-'))
  })
  afterAll(() => {
    if (dizin) fs.rmSync(dizin, { recursive: true, force: true })
  })

  const log = () => yaz('log.txt', LOG.join('\n'))
  const tamNot = () => [kart('URN-58', [not('PR #1774, #1752, #1779 ve #1771 birleşti; iki satır özet.')])]

  it('tüm teslimler bir notta anılıyor: çıkış 0', () => {
    const r = cli('--log-dosya', log(), '--dosya', yaz('temiz.json', { kayitlar: tamNot() }), '--gun', GUN)
    expect(r.kod, r.cikti).toBe(0)
    expect(r.stdout).toContain('TOPLAM 2026-10-09: Teslim 4, kart notunda geçmeyen 0')
  })

  it('SABOTAJ: notlar silinince çıkış 1 olur ve PR numaralarını söyler', () => {
    const r = cli('--log-dosya', log(), '--dosya', yaz('sabotaj.json', { kayitlar: [kart('URN-58', [])] }), '--gun', GUN)
    expect(r.kod, r.cikti).toBe(1)
    expect(r.stdout).toContain('URUN: Teslim 2, kart notunda geçmeyen 2: #1774 (URN-58), #1752 (REC-491)')
  })

  it('--json makine çıktısı verir ve çıkış kodunu korur', () => {
    const r = cli('--log-dosya', log(), '--dosya', yaz('j.json', { kayitlar: [kart('URN-58', [])] }), '--gun', GUN, '--json')
    expect(r.kod).toBe(1)
    expect(JSON.parse(r.stdout)).toMatchObject({ gun: GUN, teslim: 4, notsuz: 4, cikis: 1 })
  })

  const hatali: Record<string, () => string[]> = {
    'günlük dosyası yok': () => ['--log-dosya', 'yok.txt', '--dosya', yaz('a.json', { kayitlar: tamNot() }), '--gun', GUN],
    'günlük dosyası BOŞ (ölçülemedi, temiz değil)': () => ['--log-dosya', yaz('bos.txt', ''), '--dosya', yaz('b.json', { kayitlar: tamNot() }), '--gun', GUN],
    'günlük biçimsiz': () => ['--log-dosya', yaz('bicimsiz.txt', 'biçimsiz satır'), '--dosya', yaz('c.json', { kayitlar: tamNot() }), '--gun', GUN],
    'Kanban dosyası yok': () => ['--log-dosya', log(), '--dosya', 'yok.json', '--gun', GUN],
    'Kanban JSON bozuk': () => ['--log-dosya', log(), '--dosya', yaz('bozuk.json', '{ yarım'), '--gun', GUN],
    'kayitlar[] BOŞ': () => ['--log-dosya', log(), '--dosya', yaz('bosk.json', { kayitlar: [] }), '--gun', GUN],
    'kayıt olmayan öğe': () => ['--log-dosya', log(), '--dosya', yaz('nullk.json', { kayitlar: [null] }), '--gun', GUN],
    'BAYAT dışa aktarım': () => ['--log-dosya', log(), '--dosya', yaz('bayat.json', { damga: '2026-10-01T09:00:00Z', kayitlar: tamNot() }), '--gun', GUN],
    '--dosya değersiz (canlıya sessizce düşmez)': () => ['--dosya'],
    '--log-dosya değersiz': () => ['--log-dosya', '--json'],
    'gün biçimi bozuk': () => ['--gun', '09.10.2026'],
    'takvimde olmayan gün': () => ['--gun', '2026-13-45'],
    'bilinmeyen argüman': () => ['--hepsi'],
  }
  it.each(Object.keys(hatali))('ölçülemeyen hal sessiz geçmez: %s → çıkış 2', (ad) => {
    const r = cli(...hatali[ad]())
    expect(r.kod, r.cikti).toBe(2)
    expect(r.cikti).toContain('HATA')
  })

  it('değersiz bayrak DOĞRU sebeple reddedilir: bir sonraki bayrak değer sayılmaz ("--log-dosya --json" dosya adı olarak okunmaz)', () => {
    for (const a of [['--dosya'], ['--log-dosya', '--json'], ['--dosya', '--json']]) {
      const r = cli(...a)
      expect(r.kod, r.cikti).toBe(2)
      expect(r.cikti, a.join(' ')).toContain('bir değer ister')
    }
  })

  it('bayatlık eşiği: damga istenen günde ya da sonrasında ise veri bayat DEĞİL (çıkış 0), önceki günde ise bayat (çıkış 2)', () => {
    const k = tamNot()
    const calis = (damga: string) => cli('--log-dosya', log(), '--dosya', yaz(`damga-${damga.slice(0, 10)}.json`, { damga, kayitlar: k }), '--gun', GUN)
    expect(calis('2026-10-09T05:00:00Z').kod).toBe(0) // aynı gün
    expect(calis('2026-10-10T05:00:00Z').kod).toBe(0) // sonraki gün
    const bayat = calis('2026-10-08T05:00:00Z') // önceki gün
    expect(bayat.kod, bayat.cikti).toBe(2)
    expect(bayat.cikti).toContain('bayat')
  })

  describe('gerçek git yolu (geçici depo, origin/master = HEAD)', () => {
    let repo = ''
    const git = (...a: string[]) => spawnSync('git', ['-C', repo, '-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...a], { encoding: 'utf8' })
    const commit = (tarih: string, mesaj: string) => {
      const r = spawnSync('git', ['-C', repo, '-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-q', '-m', mesaj], {
        encoding: 'utf8',
        env: { ...process.env, GIT_AUTHOR_DATE: tarih, GIT_COMMITTER_DATE: tarih },
      })
      expect(r.status, r.stderr).toBe(0)
    }

    beforeAll(() => {
      repo = fs.mkdtempSync(path.join(os.tmpdir(), 'teslim-kart-git-'))
      expect(git('init', '-q').status).toBe(0)
      commit('2026-10-08T23:59:00+03:00', 'URUN (URN-9): dünün son dakikası (#1700)')
      commit('2026-10-09T00:00:00+03:00', 'URUN (URN-8): tam gece yarısı, günün ilk saniyesi (#1701)')
      commit('2026-10-09T00:00:30+03:00', 'URUN (URN-1): günün ilk dakikası (#1774)')
      commit('2026-10-09T23:59:00+03:00', 'HARİTA (HRT-1): günün son dakikası (#1779)')
      commit('2026-10-09T23:59:59+03:00', 'HARİTA (HRT-2): günün son saniyesi (#1702)')
      commit('2026-10-10T00:00:00+03:00', 'URUN (URN-7): tam gece yarısı, ertesi günün ilk saniyesi (#1703)')
      commit('2026-10-10T00:00:30+03:00', 'URUN (URN-2): yarının ilk dakikası (#1800)')
      expect(git('update-ref', 'refs/remotes/origin/master', 'HEAD').status).toBe(0)
    }, 60_000)
    afterAll(() => {
      if (repo) fs.rmSync(repo, { recursive: true, force: true })
    })

    const prler = (gun: string) => {
      const f = yaz(`git-kanban-${gun}.json`, { kayitlar: [kart('URN-1', [])] })
      const r = cli('--repo', repo, '--fetch-yok', '--dosya', f, '--gun', gun, '--json')
      expect(r.kod, r.cikti).toBe(1)
      const s = JSON.parse(r.stdout) as Sonuc
      return Object.values(s.departmanlar).flatMap((d) => d.notsuz.map((n) => n.pr)).sort()
    }

    it('TR günü sınırı: yalnız 10-09 00:00:00-23:59:59 (UTC+3) arasındaki teslimler sayılır; dünün ve yarının commit\'i dışarıda', () => {
      expect(prler(GUN)).toEqual(['1701', '1702', '1774', '1779'])
    })

    it('tam gece yarısı (00:00:00) damgalı commit YALNIZ kendi gününde sayılır; git --until kapsayıcı olduğundan iki günde birden çıkmaz', () => {
      expect(prler('2026-10-08')).toEqual(['1700'])
      expect(prler('2026-10-10')).toEqual(['1703', '1800'])
      const tum = [...prler('2026-10-08'), ...prler(GUN), ...prler('2026-10-10')]
      expect(new Set(tum).size, 'bir PR iki günde sayıldı').toBe(tum.length)
    })

    it('o gün hiç commit yoksa ÖLÇÜLEMEDİ (çıkış 2), temiz değil', () => {
      const f = yaz('git-kanban2.json', { kayitlar: [kart('URN-1', [])] })
      const r = cli('--repo', repo, '--fetch-yok', '--dosya', f, '--gun', '2026-10-05')
      expect(r.kod, r.cikti).toBe(2)
      expect(r.cikti).toContain('hiç commit yok')
    })

    it('origin/master yoksa ya da fetch başarısızsa ÖLÇÜLEMEDİ (çıkış 2): bayat ref sessizce kullanılmaz', () => {
      const f = yaz('git-kanban3.json', { kayitlar: [kart('URN-1', [])] })
      const r = cli('--repo', repo, '--dosya', f, '--gun', GUN) // --fetch-yok YOK: origin tanımlı değil
      expect(r.kod, r.cikti).toBe(2)
      expect(r.cikti).toContain('git fetch origin master başarısız')
    })
  })
})
