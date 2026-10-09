/**
 * INV-KART-NOT-1 — kart-not sayacı (`scripts/board/kart-not-sayimi.cjs`, HRT-44, OPS 2026-10-09 "kart notu olmayan teslimi
 * kabul etmiyorum"; cetvel `docs/standards/is-kayit-duzeni-standard.md` "Teslim notu").
 *
 * NİÇİN VAR: "teslim karta yazılır" kuralı yazıyla kalırsa hatırlanana kadar yaşar. Bu paket sayacın AYIRT EDİCİ olduğunu ölçer:
 * notlu teslim geçer; notsuz, boş, sistem satırı ya da dünkü not kırmızı verir; "bugün Done" sorusu completedAt ile cevaplanır.
 * Gerçek Kanban dosyasına DOKUNMAZ (yalnız --dosya ile sahte JSON).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

type Not = { author: string; content: string; createdAt: string }
type Kayit = {
  identifier: string
  id?: string
  status: string
  serit: string
  completedAt?: string | null
  doneAt?: string | null
  sonAnlamli?: string | null
  notes?: Not[]
}
type Serit = { done: string[]; notsuz: string[]; kanitsiz: string[]; tarihsiz: string[] }
type Modul = {
  gunAdi: (iso: string | null | undefined) => string | null
  gunGecerli: (gun: string) => boolean
  bugun: (simdi?: Date) => string | null
  etiket: (k: Kayit) => string
  notSayilir: (not: unknown) => boolean
  kanitVar: (not: { content: string }) => boolean
  say: (kayitlar: Kayit[], gun: string) => Record<string, Serit>
  ozetle: (s: Record<string, Serit>, secenek?: { kanitZorunlu?: boolean }) => { done: number; notsuz: number; kanitsiz: number; eksik: number; cikis: number }
  satirlar: (s: Record<string, Serit>, gun: string) => string[]
  kayitlariCoz: (metin: string, gun?: string) => Kayit[]
  MIN_NOT: number
}

const KOK = spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const require = createRequire(import.meta.url)
const BETIK = path.join(KOK, 'scripts/board/kart-not-sayimi.cjs')
const S = require(BETIK) as Modul

const GUN = '2026-10-09'
/** Europe/Istanbul günü: 10-09 00:00 TR = 10-08 21:00Z; 10-10 00:00 TR = 10-09 21:00Z. */
const BUGUN_IKI = '2026-10-09T11:00:00.000Z'
const DUN_IKI = '2026-10-08T11:00:00.000Z'
const DOLU = 'Teslim: PR #1786 birleşti; iki satır özet burada.'

const not = (content: string, createdAt = BUGUN_IKI, author = 'HARITA'): Not => ({ author, content, createdAt })
const kart = (identifier: string, ek: Partial<Kayit> = {}): Kayit => ({
  identifier,
  status: 'Done',
  serit: 'HARITA',
  completedAt: BUGUN_IKI,
  sonAnlamli: BUGUN_IKI,
  notes: [not(DOLU)],
  ...ek,
})

describe('INV-KART-NOT-1 · gün sınırı (Europe/Istanbul)', () => {
  it.each([
    ['2026-10-08T20:59:59.000Z', '2026-10-08'],
    ['2026-10-08T21:00:00.000Z', '2026-10-09'],
    ['2026-10-09T20:59:59.000Z', '2026-10-09'],
    ['2026-10-09T21:00:00.000Z', '2026-10-10'],
  ])('%s → TR günü %s', (iso, beklenen) => {
    expect(S.gunAdi(iso)).toBe(beklenen)
  })

  it('boş ya da çözülemeyen damga null verir (sessiz bugün sayılmaz)', () => {
    expect(S.gunAdi(null)).toBeNull()
    expect(S.gunAdi('')).toBeNull()
    expect(S.gunAdi('yarın')).toBeNull()
  })

  it('varsayılan "bugün" TR gününü verir, UTC gününü değil (gece yarısı sınırı)', () => {
    expect(S.bugun(new Date('2026-10-09T20:59:59Z'))).toBe('2026-10-09')
    expect(S.bugun(new Date('2026-10-09T22:30:00Z'))).toBe('2026-10-10')
    expect(S.bugun()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(S.bugun()).not.toBe('2000-01-01')
  })

  it.each([
    ['2026-10-09', true],
    ['2026-13-45', false],
    ['2026-02-30', false],
    ['09.10.2026', false],
    ['', false],
  ])('takvim günü "%s" geçerli mi: %s', (gun, beklenen) => {
    expect(S.gunGecerli(gun)).toBe(beklenen)
  })
})

describe('INV-KART-NOT-1 · say (saf işlev)', () => {
  it('bugün tarihli dolu notu olan Done kart notsuz DEĞİLDİR', () => {
    const s = S.say([kart('HRT-1')], GUN)
    expect(s.HARITA).toEqual({ done: ['HRT-1'], notsuz: [], kanitsiz: [], tarihsiz: [] })
  })

  it('notu hiç olmayan Done kart notsuzdur', () => {
    expect(S.say([kart('HRT-2', { notes: [] })], GUN).HARITA.notsuz).toEqual(['HRT-2'])
  })

  it('yalnız DÜN tarihli notu olan kart notsuzdur', () => {
    expect(S.say([kart('HRT-3', { notes: [not(DOLU, DUN_IKI)] })], GUN).HARITA.notsuz).toEqual(['HRT-3'])
  })

  it('boş ya da kısa ("tamam") not, not sayılmaz', () => {
    const s = S.say([kart('HRT-4', { notes: [not('   '), not('tamam'), not('ok ok ok')] })], GUN)
    expect(s.HARITA.notsuz).toEqual(['HRT-4'])
    expect(S.notSayilir(not('x'.repeat(S.MIN_NOT)))).toBe(true)
    expect(S.notSayilir(not('x'.repeat(S.MIN_NOT - 1)))).toBe(false)
  })

  it('"tamam" + çok boşluk uzunluk eşiğini AŞTIRMAZ (boşluk soyulur: eşik harf/rakam sayar)', () => {
    expect(S.notSayilir(not(`tamam${' '.repeat(20)}`))).toBe(false)
    expect(S.notSayilir(not(`ta\n\n\t m am${' '.repeat(5)}`))).toBe(false)
  })

  it.each([
    ['11 nokta', '.'.repeat(11)],
    ['sıfır genişlikli boşluk x20', '​'.repeat(20)],
    ['5 emoji', '😀😀😀😀😀'],
    ['tire ve işaret', '-----!!!!!?????'],
  ])('içeriksiz not (%s) not sayılmaz', (_ad, icerik) => {
    expect(S.notSayilir(not(icerik))).toBe(false)
  })

  it('Türkçe harfli ve rakamlı gerçek not sayılır', () => {
    expect(S.notSayilir(not('Teslim: şğüöçı 12345'))).toBe(true)
  })

  it('kira bırakma gibi system satırları not sayılmaz', () => {
    const sistem = not('Claim released: HARITA: is bitti, kira birakiliyor', BUGUN_IKI, 'system')
    expect(S.say([kart('HRT-5', { notes: [sistem] })], GUN).HARITA.notsuz).toEqual(['HRT-5'])
  })

  it.each(['System', 'system ', ' SYSTEM'])('yazar "%s" de sistem sayılır (boşluk ve büyük harf duyarsız)', (yazar) => {
    expect(S.notSayilir(not('Claim released: kira birakiliyor', BUGUN_IKI, yazar))).toBe(false)
  })

  it('null öğeli notes sessizce atlanır, gerçek not yine sayılır', () => {
    const k = kart('HRT-5b')
    k.notes = [null as unknown as Not, 5 as unknown as Not, 'metin' as unknown as Not, not(DOLU)]
    expect(S.say([k], GUN).HARITA.notsuz).toEqual([])
  })

  it('numara tekil değildir: kart etiketi tam kimliğin ilk 8 karakterini taşır', () => {
    expect(S.etiket(kart('KTL-9', { id: '3f2a91bc-aaaa-bbbb' }))).toBe('KTL-9 [3f2a91bc]')
    expect(S.etiket(kart('KTL-9'))).toBe('KTL-9')
    const s = S.say([kart('KTL-9', { id: '3f2a91bc-aaaa', notes: [] })], GUN)
    expect(s.HARITA.notsuz).toEqual(['KTL-9 [3f2a91bc]'])
  })

  it('"bugün Done" completedAt ile belirlenir: dün Done olup bugün not alan kart SAYILMAZ (sonAnlamli tuzağı)', () => {
    const eski = kart('HRT-6', { completedAt: DUN_IKI, sonAnlamli: BUGUN_IKI, notes: [not(DOLU)] })
    expect(S.say([eski], GUN)).toEqual({})
  })

  it('Done olmayan kart sayılmaz', () => {
    expect(S.say([kart('HRT-7', { status: 'In Review', notes: [] })], GUN)).toEqual({})
  })

  it('completedAt ve doneAt ikisi de boşsa sonAnlamli ile sayılır ve "tarihsiz" diye İŞARETLENİR', () => {
    const s = S.say([kart('BLG-4', { completedAt: null, doneAt: null, notes: [] })], GUN)
    expect(s.HARITA).toEqual({ done: ['BLG-4'], notsuz: ['BLG-4'], kanitsiz: [], tarihsiz: ['BLG-4'] })
    expect(S.satirlar(s, GUN)[0]).toContain('Done tarihi yok')
  })

  it('ARŞİVLİ kart (completedAt boş): Done günü doneAt (olay kaydı) ile belirlenir, sonAnlamli ile DEĞİL', () => {
    // BLG-4 örneği: 10-08'de Done'a taşındı; 10-09'da düşülen not kartı bugüne ATLATMAMALI (doğrulayıcı bulgusu B1a)
    const arsivli = kart('BLG-4', { completedAt: null, doneAt: DUN_IKI, sonAnlamli: BUGUN_IKI, notes: [not(DOLU)] })
    expect(S.say([arsivli], GUN)).toEqual({})
    // aynı kart dünün sayımında görünür; notu BUGÜN yazıldığı için dünün sayımında notsuz kalır (gecikmiş not kırmızıyı silmez)
    const dun = S.say([arsivli], '2026-10-08')
    expect(dun.HARITA).toEqual({ done: ['BLG-4'], notsuz: ['BLG-4'], kanitsiz: [], tarihsiz: [] })
  })

  it('doneAt bugünse tarihsiz DEĞİL ve notsuz yakalanır', () => {
    const s = S.say([kart('KTL-9', { completedAt: null, doneAt: BUGUN_IKI, notes: [] })], GUN)
    expect(s.HARITA).toEqual({ done: ['KTL-9'], notsuz: ['KTL-9'], kanitsiz: [], tarihsiz: [] })
  })

  it('completedAt doneAt\'ten önceliklidir', () => {
    const k = kart('HRT-14', { completedAt: DUN_IKI, doneAt: BUGUN_IKI })
    expect(S.say([k], GUN)).toEqual({})
  })

  it('SESSİZ KAÇAK sınırı: eski kart bugün arşive taşınıp olay kaydı yoksa (completedAt+doneAt boş, not yok) sayaçta görünmez — belgelenmiş sınır', () => {
    const k = kart('REC-1', { completedAt: null, doneAt: null, sonAnlamli: DUN_IKI, notes: [] })
    expect(S.say([k], GUN)).toEqual({})
  })

  it('şeritler ayrı sayılır', () => {
    const s = S.say([kart('HRT-8'), kart('OPS-1', { serit: 'OPS', notes: [] })], GUN)
    expect(s.HARITA.notsuz).toEqual([])
    expect(s.OPS.notsuz).toEqual(['OPS-1'])
  })

  it('Done kartta notes alanı hiç yoksa VERİ HATASI (--tam eksik; sessizlik "notsuz yok" sayılmaz)', () => {
    const k = kart('HRT-9')
    delete k.notes
    expect(() => S.say([k], GUN)).toThrow(/notes alanı yok/)
  })

  it('gün içinde Done olan kartın notu gece yarısı sınırında doğru güne düşer (UTC değil TR günü)', () => {
    // 10-09 00:30 TR = 10-08 21:30Z → bugün; notu da aynı anda
    const sinir = '2026-10-08T21:30:00.000Z'
    const s = S.say([kart('HRT-10', { completedAt: sinir, notes: [not(DOLU, sinir)] })], GUN)
    expect(s.HARITA.notsuz).toEqual([])
  })
})

describe('INV-KART-NOT-1 · kanıt izi (v2)', () => {
  it.each([
    'Teslim → docs/standards/x.md',
    'KANIT: gh pr checks 1786 yeşil',
    'Kanıt: gh pr checks yeşil',
    'kanit: test 48/48',
    'PR #1786 birleşti',
    'PR 1786 birleşti',
    "commit 17c2f5f69 master'da",
  ])('"%s" kanıt izi sayılır', (c) => {
    expect(S.kanitVar({ content: c })).toBe(true)
  })

  it.each([
    'Bitti, her şey tamam görünüyor.',
    'deadbeef gibi rakamsız onaltılı sözcük kanıt değildir',
    'Çalışıyor diye düşünüyorum yani.',
    'kanitsiz teslim edildi, düzeltiyorum',
    'tarih 20261009 yazildi',
    'dosya #12 incelendi',
    '1234567 yalnız rakam, onaltılı sözcük değil',
  ])('"%s" kanıt izi DEĞİLDİR (yanlış pozitif tuzağı)', (c) => {
    expect(S.kanitVar({ content: c })).toBe(false)
  })

  it('iki notlu kartta biri kanıtlıysa kart kanıtsız SAYILMAZ (some, every değil)', () => {
    const k = kart('HRT-15', { notes: [not('Bitti, her şey tamam görünüyor.'), not('KANIT: gh pr checks 1786 yeşil')] })
    expect(S.say([k], GUN).HARITA.kanitsiz).toEqual([])
  })

  it('kanıtsız not varsayılanda yalnız raporlanır (çıkış 0), --kanit-zorunlu ile eksik sayılır (çıkış 1)', () => {
    const s = S.say([kart('HRT-11', { notes: [not('Bitti, her şey tamam görünüyor.')] })], GUN)
    expect(s.HARITA.kanitsiz).toEqual(['HRT-11'])
    expect(S.ozetle(s).cikis).toBe(0)
    expect(S.ozetle(s, { kanitZorunlu: true }).cikis).toBe(1)
  })
})

describe('INV-KART-NOT-1 · ozetle ve çıktı biçimi', () => {
  it('notsuz varsa çıkış 1, yoksa 0', () => {
    expect(S.ozetle(S.say([kart('HRT-12')], GUN)).cikis).toBe(0)
    expect(S.ozetle(S.say([kart('HRT-12'), kart('HRT-13', { notes: [] })], GUN)).cikis).toBe(1)
  })

  it('satır biçimi "ŞERİT: Done(bugün) N, notsuz M: <no>"', () => {
    const s = S.say([kart('HRT-12'), kart('HRT-13', { notes: [] })], GUN)
    expect(S.satirlar(s, GUN)).toEqual(['HARITA: Done(bugün) 2, notsuz 1: HRT-13'])
  })

  it('bugün Done yoksa bunu söyler (boş çıktı "temiz" ile karışmasın)', () => {
    expect(S.satirlar({}, GUN)[0]).toContain("Done'a geçen kart yok")
  })
})

describe('INV-KART-NOT-1 · komut satırı', () => {
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
    dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'kart-not-'))
  })
  afterAll(() => {
    if (dizin) fs.rmSync(dizin, { recursive: true, force: true })
  })

  it('tüm Done kartları notlu: çıkış 0', () => {
    const f = yaz('temiz.json', { kayitlar: [kart('HRT-1'), kart('OPS-1', { serit: 'OPS' })] })
    const r = cli('--dosya', f, '--gun', GUN)
    expect(r.kod, r.cikti).toBe(0)
    expect(r.stdout).toContain('TOPLAM 2026-10-09: Done 2, notsuz 0')
  })

  it('SABOTAJ: aynı veriden bir kartın notları silinince çıkış 1 olur ve kart numarasını söyler', () => {
    const f = yaz('sabotaj.json', { kayitlar: [kart('HRT-1'), kart('OPS-1', { serit: 'OPS', notes: [] })] })
    const r = cli('--dosya', f, '--gun', GUN)
    expect(r.kod, r.cikti).toBe(1)
    expect(r.stdout).toContain('OPS: Done(bugün) 1, notsuz 1: OPS-1')
  })

  it('--json makine çıktısı verir ve aynı çıkış kodunu korur', () => {
    const f = yaz('json.json', { kayitlar: [kart('HRT-1', { notes: [] })] })
    const r = cli('--dosya', f, '--gun', GUN, '--json')
    expect(r.kod).toBe(1)
    expect(JSON.parse(r.stdout)).toMatchObject({ gun: GUN, ozet: { done: 1, notsuz: 1, cikis: 1 } })
  })

  it('--kanit-zorunlu kanıtsız notu eksik sayar', () => {
    const f = yaz('kanitsiz.json', { kayitlar: [kart('HRT-1', { notes: [not('Bitti, her şey tamam görünüyor.')] })] })
    expect(cli('--dosya', f, '--gun', GUN).kod).toBe(0)
    expect(cli('--dosya', f, '--gun', GUN, '--kanit-zorunlu').kod).toBe(1)
  })

  const hatali: Record<string, () => string[]> = {
    'dosya yok': () => ['--dosya', 'yok-boyle-bir-dosya.json', '--gun', GUN],
    'bozuk JSON': () => ['--dosya', yaz('bozuk.json', '{ yarım'), '--gun', GUN],
    'kayitlar[] yok': () => ['--dosya', yaz('sema.json', { baska: [] }), '--gun', GUN],
    'kayitlar[] BOŞ (ölçülemedi, temiz değil)': () => ['--dosya', yaz('bos.json', { kayitlar: [] }), '--gun', GUN],
    'veride hiç Done kartı yok (durum eşlemesi bozuk olabilir)': () => [
      '--dosya',
      yaz('done-yok.json', { kayitlar: [kart('HRT-1', { status: 'Todo' }), kart('HRT-2', { status: '?' })] }),
      '--gun',
      GUN,
    ],
    'BAYAT dosya (damga istenen günden eski)': () => [
      '--dosya',
      yaz('bayat.json', { damga: '2026-10-01T09:00:00Z', kayitlar: [kart('HRT-1')] }),
      '--gun',
      GUN,
    ],
    'kayıt olmayan öğe (null)': () => ['--dosya', yaz('null-kayit.json', { kayitlar: [null, kart('HRT-1')] }), '--gun', GUN],
    '--dosya değersiz (canlıya SESSİZCE düşmez)': () => ['--dosya'],
    '--dosya yanında başka bayrak': () => ['--dosya', '--json'],
    '--gun değersiz': () => ['--gun'],
    'gün biçimi bozuk': () => ['--dosya', yaz('sema2.json', { kayitlar: [kart('HRT-1')] }), '--gun', '09.10.2026'],
    'takvimde olmayan gün': () => ['--dosya', yaz('sema3.json', { kayitlar: [kart('HRT-1')] }), '--gun', '2026-13-45'],
    'bilinmeyen argüman': () => ['--hepsi'],
  }
  it.each(Object.keys(hatali))('ölçülemeyen hal sessiz geçmez: %s → çıkış 2', (ad) => {
    const r = cli(...hatali[ad]())
    expect(r.kod, r.cikti).toBe(2)
    expect(r.cikti).toContain('HATA')
  })

  it('damga istenen günle AYNI ya da sonrası ise bayat sayılmaz', () => {
    const f = yaz('taze.json', { damga: '2026-10-09T15:48:51Z', kayitlar: [kart('HRT-1')] })
    expect(cli('--dosya', f, '--gun', GUN).kod).toBe(0)
    expect(cli('--dosya', f, '--gun', '2026-10-08').kod).toBe(0)
  })

  it('bilinmeyen Kanban kolonundaki kart sayımı bozmaz ama stderr\'e UYARI yazılır', () => {
    const f = yaz('kolon.json', { kayitlar: [kart('HRT-1'), kart('HRT-2', { status: '?' })] })
    const r = cli('--dosya', f, '--gun', GUN)
    expect(r.kod, r.cikti).toBe(0)
    expect(r.cikti).toContain('UYARI: 1 kart bilinmeyen Kanban kolonunda')
  })

  it('notes alanı olmayan dışa aktarım (--tam unutulmuş) çıkış 2 verir', () => {
    const k = kart('HRT-1')
    delete k.notes
    const f = yaz('tamsiz.json', { kayitlar: [k] })
    const r = cli('--dosya', f, '--gun', GUN)
    expect(r.kod, r.cikti).toBe(2)
    expect(r.cikti).toContain('--tam')
  })

  it('kayıt biçimi bozuksa beklenmeyen istisna "notsuz var" (1) ile KARIŞMAZ: çıkış 2', () => {
    const f = yaz('bozuk-not.json', { kayitlar: [kart('HRT-1', { notes: 'metin' as unknown as Not[] })] })
    const r = cli('--dosya', f, '--gun', GUN)
    expect(r.kod, r.cikti).toBe(2)
  })
})

/**
 * CANLI YOL (--dosya OLMADAN): betik kanban_disa_aktar.py'yi --tam ile çağırır ve "bugün" TR gününden gelir. Gerçek panoya DOKUNMAZ:
 * VENTHUB_KANBAN_DB ile sahte bir pano dosyası (python stdlib sqlite3) gösterilir. Bu paket üç şeyi sabitler: --tam bayrağı canlı yolda
 * gerçekten geçiyor (yoksa notes eksik, çıkış 2), varsayılan gün bugün, ve ARŞİVLİ Done kartı (completedAt boş) olay kaydından tarihleniyor.
 */
describe('INV-KART-NOT-1 · canlı yol (sahte pano dosyası, VENTHUB_KANBAN_DB)', () => {
  const pythonBul = (): string | null => {
    for (const ad of ['python', 'python3']) {
      const r = spawnSync(ad, ['--version'], { encoding: 'utf8' })
      if (r.status === 0 && /Python 3\./.test(`${r.stdout}${r.stderr}`)) return ad
    }
    return null
  }
  const PY = pythonBul()
  let dizin = ''
  const simdi = new Date().toISOString()
  const dun = new Date(Date.now() - 36 * 3600 * 1000).toISOString()

  type Gorev = { id: string; title: string; columnId: string; status: string; createdAt: string; completedAt?: string; notes?: Not[] }
  const kur = (ad: string, gorevler: Gorev[], olaylar: unknown[]): string => {
    const yol = path.join(dizin, `${ad}.sqlite`)
    const girdi = path.join(dizin, `${ad}.json`)
    fs.writeFileSync(girdi, JSON.stringify({ pano: { title: 'VentHub HARİTA', tasks: gorevler }, olaylar }), 'utf8')
    const betik = [
      'import json, sqlite3, sys',
      'd = json.load(open(sys.argv[2], encoding="utf-8"))',
      'c = sqlite3.connect(sys.argv[1])',
      'c.execute("create table kanban_boards (id text, payload text, revision integer, updated_at text)")',
      'c.execute("create table kanban_events (seq integer primary key autoincrement, board_id text not null, payload text not null)")',
      'c.execute("insert into kanban_boards values (?,?,?,?)", ("0", json.dumps(d["pano"], ensure_ascii=False), 1, ""))',
      'for e in d["olaylar"]:',
      '    c.execute("insert into kanban_events (board_id, payload) values (?,?)", ("0", json.dumps(e, ensure_ascii=False)))',
      'c.commit()',
    ].join('\n')
    const k = path.join(dizin, `${ad}.py`)
    fs.writeFileSync(k, betik, 'utf8')
    const r = spawnSync(PY as string, [k, yol, girdi], { encoding: 'utf8' })
    expect(r.status, r.stderr).toBe(0)
    return yol
  }
  const canli = (db: string, ...a: string[]) => {
    const r = spawnSync(process.execPath, [BETIK, ...a], {
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_KANBAN_DB: db, PYTHONIOENCODING: 'utf-8' },
    })
    return { kod: r.status, cikti: `${r.stdout}${r.stderr}`, stdout: r.stdout }
  }
  const dolu: Not = { author: 'HARITA', content: 'Teslim: PR #1786 birleşti; iki satır özet.', createdAt: simdi }
  const tasindi = (id: string, ts: string) => ({ type: 'task.moved', taskId: id, ts, after: { columnId: 'done' } })

  beforeAll(() => {
    expect(PY, 'python bulunamadı: kapı atlanmaz, kırmızı verir').not.toBeNull()
    dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'kart-not-canli-'))
  })
  afterAll(() => {
    if (dizin) fs.rmSync(dizin, { recursive: true, force: true })
  })

  it('bugün Done olan kart notlu: varsayılan gün, --tam bayrağı ve canlı yol çalışır (çıkış 0)', () => {
    const db = kur('temiz', [{ id: 'aaaaaaaa-1', title: 'HRT-90 · notlu', columnId: 'done', status: 'completed', createdAt: dun, completedAt: simdi, notes: [dolu] }], [])
    const r = canli(db)
    expect(r.kod, r.cikti).toBe(0)
    expect(r.stdout).toContain('HARITA: Done(bugün) 1, notsuz 0')
  })

  it('SABOTAJ: aynı panoda notu silinmiş kart çıkış 1 verir ve kimliğiyle anılır', () => {
    const db = kur('sabotaj', [{ id: 'bbbbbbbb-2', title: 'HRT-91 · notsuz', columnId: 'done', status: 'completed', createdAt: dun, completedAt: simdi, notes: [] }], [])
    const r = canli(db)
    expect(r.kod, r.cikti).toBe(1)
    expect(r.stdout).toContain('notsuz 1: HRT-91 [bbbbbbbb]')
  })

  it('ARŞİVLİ Done kartı (completedAt boş): olay kaydındaki taşınma anından tarihlenir ve notsuzsa yakalanır', () => {
    const db = kur('arsivli', [{ id: 'cccccccc-3', title: 'HRT-92 · arşivli', columnId: 'done', status: 'archived', createdAt: dun, notes: [] }], [tasindi('cccccccc-3', simdi)])
    const r = canli(db)
    expect(r.kod, r.cikti).toBe(1)
    expect(r.stdout).toContain('notsuz 1: HRT-92 [cccccccc]')
    expect(r.stdout).not.toContain('Done tarihi yok')
  })

  it('ARŞİVLİ kart dün taşındıysa bugünün sayımına girmez (bugün düşülen not onu bugüne atlatmaz)', () => {
    const db = kur('arsivli-dun', [
      { id: 'dddddddd-4', title: 'HRT-93 · dün arşivlendi', columnId: 'done', status: 'archived', createdAt: dun, notes: [dolu] },
      { id: 'eeeeeeee-5', title: 'HRT-94 · bugün', columnId: 'done', status: 'completed', createdAt: dun, completedAt: simdi, notes: [dolu] },
    ], [tasindi('dddddddd-4', dun)])
    const r = canli(db)
    expect(r.kod, r.cikti).toBe(0)
    expect(r.stdout).toContain('Done(bugün) 1, notsuz 0')
  })
})
