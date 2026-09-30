import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-CLAIM-YENILE-1..10 · SessionStart (startup/resume) açılışında KENDİ süresi dolmuş şerit talebini yeniden almak.
 *
 * NİÇİN: makine kapanıp pencereler `resume` ile dönünce talep kirası (4 saat) dolmuştur; pano şeridi "BAYAT/SAHİPSİZ"
 * gösterir ve şerit kapısı onu korumaz. Ajanın claim'i elle tazelemeyi HATIRLAMASI yerine kanca aynı şerit + aynı
 * desenlerle yeniden alır; canlı başka oturum aynı şeridi/çakışan deseni tutuyorsa ALMAZ ve tek satır UYARI basar.
 *
 * DÜZENEK: hermetik. Kanca GERÇEKTEN çalıştırılır (`session-board.cjs`), pano geçici dizinde (`VENTHUB_BOARD_DIR`),
 * pencere kayıtları geçici dizinde; `cwd` git deposu DEĞİL (kanca gerçek kimlik dosyasını ezmesin). GERÇEK panoya yazılmaz.
 *
 * ⭐KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: yenile / dokunma (kaynak, geçmiş yok, bırakılmış, canlı) / uyarı (şerit adı, desen) /
 * tek sahiplik / fail-open / 24 saatten eski dosya ayrı davranışlardır. Sabotaj tablosu PR gövdesinde.
 *
 * Cetvel: `execution-method-standard.md` §9 (ölçüm) · mantık `scripts/board/claim-yenile.cjs` · kanca kablosu
 * `.claude/hooks/session-board.cjs` · kardeş kapı `sessionstart-pencere-adi.test.ts`.
 */

const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude/hooks/session-board.cjs')
const SID = 'c1a1e000-0000-4000-8000-000000000001'
const BASKA = '22222222-3333-4444-8555-666666666666'
const UCUNCU = '33333333-4444-4555-8666-777777777777'
const HK = 60_000

let gecici = ''
let calismaDizini = ''
let kayitDizini = ''
let sayac = 0

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-cy-'))
  calismaDizini = path.join(gecici, 'proje') // git deposu DEĞİL
  kayitDizini = path.join(gecici, 'oturum-kayitlari')
  fs.mkdirSync(calismaDizini)
  fs.mkdirSync(kayitDizini)
})

afterAll(() => {
  try {
    if (gecici) fs.rmSync(gecici, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
  } catch {
    /* kanca kopuk bir arka plan süreci başlatır; Windows EBUSY: temizlik en iyi çabadır */
  }
})

const saatOnce = (s: number): string => new Date(Date.now() - s * 60 * 60 * 1000).toISOString()
const dkOnce = (d: number): string => new Date(Date.now() - d * 60 * 1000).toISOString()

function yeniPano(): string {
  sayac += 1
  const d = path.join(gecici, `pano-${sayac}`)
  fs.mkdirSync(d)
  return d
}

function olay(pano: string, sid: string, o: Record<string, unknown>, ts = new Date().toISOString()): void {
  fs.appendFileSync(path.join(pano, `events.${sid}.jsonl`), JSON.stringify({ ts, sid, ...o }) + '\n', 'utf8')
}
const claim = (pano: string, sid: string, lane: string, globs: string[], ts: string, ek: Record<string, unknown> = {}): void =>
  olay(pano, sid, { type: 'claim', lane, globs, ...ek }, ts)

function satirlar(pano: string, sid: string): Array<Record<string, unknown>> {
  const yol = path.join(pano, `events.${sid}.jsonl`)
  if (!fs.existsSync(yol)) return []
  return fs
    .readFileSync(yol, 'utf8')
    .split('\n')
    .filter((s) => s.trim())
    .map((s) => JSON.parse(s) as Record<string, unknown>)
}
const claimSayisi = (pano: string, sid: string): number => satirlar(pano, sid).filter((e) => e.type === 'claim').length

interface Sonuc {
  durum: number | null
  ek: string
  stderr: string
  hso: Record<string, unknown> | null
}

function kanca(source: string, pano: string, ekEnv: Record<string, string> = {}, sid = SID): Sonuc {
  const r = spawnSync(process.execPath, [KANCA], {
    input: JSON.stringify({ session_id: sid, source, cwd: calismaDizini, hook_event_name: 'SessionStart' }),
    encoding: 'utf8',
    cwd: calismaDizini,
    env: {
      ...process.env,
      CLAUDE_PROJECT_DIR: KOK,
      VENTHUB_BOARD_DIR: pano,
      VENTHUB_OTURUM_KAYIT_DIZINI: kayitDizini,
      VH_SESSIONSTART_TOPLAM_TEST: '',
      VH_ROL_KARTI_URETICI: '',
      CC_LANE: '',
      LINEAR_API_KEY: '',
      ...ekEnv,
    },
    windowsHide: true,
    timeout: 60_000,
  })
  let hso: Record<string, unknown> | null = null
  try {
    hso = (JSON.parse(r.stdout || '{}') as { hookSpecificOutput?: Record<string, unknown> }).hookSpecificOutput ?? null
  } catch {
    /* JSON değilse hso null: ilgili kontroller kırmızı olur */
  }
  return { durum: r.status, ek: typeof hso?.additionalContext === 'string' ? hso.additionalContext : '', stderr: r.stderr || '', hso }
}

describe('INV-CLAIM-YENILE-1 · startup/resume: KENDİ süresi dolmuş talep AYNI şerit + AYNI desenlerle yeniden alınır', () => {
  for (const source of ['startup', 'resume']) {
    it(`${source}: 5 saat önceki claim → yeni claim olayı (exact, yenileme=${source}), bağlamda "CLAIM YENILENDI"`, () => {
      const pano = yeniPano()
      claim(pano, SID, 'ARAC', ['scripts/board/**', '.claude/hooks/**'], saatOnce(5))
      const s = kanca(source, pano)
      expect(s.durum).toBe(0)
      expect(s.ek).toContain('CLAIM YENILENDI')
      const son = satirlar(pano, SID).at(-1)!
      expect(son.type).toBe('claim')
      expect(son.lane).toBe('ARAC')
      expect(son.globs).toEqual(['scripts/board/**', '.claude/hooks/**'])
      expect(son.exact).toBe(true)
      expect(son.yenileme).toBe(source)
      expect(claimSayisi(pano, SID)).toBe(2)
      // şerit satırı artık CANLI talebi gösterir (yenilemeden ÖNCE liveClaims çağrılırsa "TALEP EDİLMEMİŞ" derdi)
      expect(s.ek).toContain('Şeridin: ARAC')
      expect(s.ek).not.toContain('TALEP EDİLMEMİŞ')
    }, HK)
  }

  it('geçmişte BİRLEŞMİŞ globlar (birden çok claim) TAM olarak döner; `--exact` ile daraltılmış liste daraltılmış kalır', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['a/**'], saatOnce(9))
    claim(pano, SID, 'ARAC', ['b/**'], saatOnce(8)) // birleşir → [a/**, b/**]
    claim(pano, SID, 'ARAC', ['c/**'], saatOnce(7), { exact: true }) // KESİN → yalnız [c/**]
    claim(pano, SID, 'ARAC', ['d/**'], saatOnce(6)) // birleşir → [c/**, d/**]
    kanca('resume', pano)
    expect(satirlar(pano, SID).at(-1)!.globs).toEqual(['c/**', 'd/**'])
  }, HK)

  it('KIDEM korunur: yenilenen talebin ilk claim zamanı değişmez (yeniden alma yeni oturum gibi kıdemsiz düşmez)', () => {
    const pano = yeniPano()
    const ilk = saatOnce(30)
    claim(pano, SID, 'ARAC', ['a/**'], ilk)
    kanca('startup', pano)
    const kod = `process.env.VENTHUB_BOARD_DIR=${JSON.stringify(pano)};const b=require(${JSON.stringify(path.join(KOK, 'scripts/board/board.cjs'))});process.stdout.write(JSON.stringify(b.liveClaims()))`
    const r = spawnSync(process.execPath, ['-e', kod], { encoding: 'utf8', windowsHide: true })
    const canli = JSON.parse(r.stdout) as Array<{ sid: string; ts: string }>
    expect(canli.find((c) => c.sid === SID)?.ts).toBe(ilk)
  }, HK)
})

describe('INV-CLAIM-YENILE-2 · startup/resume DIŞI kaynaklarda dokunulmaz', () => {
  for (const source of ['clear', 'compact', 'fork']) {
    it(`${source}: süresi dolmuş talep olsa da yeni olay YOK, bağlamda yenileme satırı YOK`, () => {
      const pano = yeniPano()
      claim(pano, SID, 'ARAC', ['a/**'], saatOnce(5))
      const s = kanca(source, pano)
      expect(s.durum).toBe(0)
      expect(claimSayisi(pano, SID)).toBe(1)
      expect(s.ek).not.toContain('CLAIM YENILEN')
    }, HK)
  }
})

describe('INV-CLAIM-YENILE-3 · GEÇMİŞİ OLMAYAN oturuma dokunulmaz', () => {
  it('olay dosyası hiç yok: dosya YARATILMAZ', () => {
    const pano = yeniPano()
    const s = kanca('resume', pano)
    expect(s.durum).toBe(0)
    expect(fs.existsSync(path.join(pano, `events.${SID}.jsonl`))).toBe(false)
    expect(s.ek).toContain('TALEP EDİLMEMİŞ')
  }, HK)

  it('dosya var ama claim yok (yalnız not/heartbeat): claim ICAT EDİLMEZ', () => {
    const pano = yeniPano()
    olay(pano, SID, { type: 'note', text: 'x' }, saatOnce(6))
    olay(pano, SID, { type: 'heartbeat' }, saatOnce(5))
    kanca('startup', pano)
    expect(claimSayisi(pano, SID)).toBe(0)
  }, HK)
})

describe('INV-CLAIM-YENILE-4 · BİLİNÇLİ KAPANIŞ (release) yenilenmez; hâlâ CANLI talep yeniden yazılmaz', () => {
  it('claim → release: yeni claim YOK', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['a/**'], saatOnce(6))
    olay(pano, SID, { type: 'release' }, saatOnce(5))
    const s = kanca('resume', pano)
    expect(claimSayisi(pano, SID)).toBe(1)
    expect(s.ek).not.toContain('CLAIM YENILEN')
  }, HK)

  it('release sonrası YENİDEN alınmış ve bayatlamış claim yenilenir (son hareket claim)', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['a/**'], saatOnce(9))
    olay(pano, SID, { type: 'release' }, saatOnce(8))
    claim(pano, SID, 'ARAC', ['z/**'], saatOnce(6))
    kanca('resume', pano)
    expect(satirlar(pano, SID).at(-1)!.globs).toEqual(['z/**'])
  }, HK)

  it('kira dolmamış (10 dk önce atış): yeni olay YOK', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['a/**'], dkOnce(10))
    const s = kanca('resume', pano)
    expect(claimSayisi(pano, SID)).toBe(1)
    expect(s.ek).not.toContain('CLAIM YENILEN')
  }, HK)

  it('kalp atışı kirayı uzatmıştı: claim 6 saat, atış 5 dk önce → CANLI, dokunulmaz', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['a/**'], saatOnce(6))
    olay(pano, SID, { type: 'heartbeat' }, dkOnce(5))
    kanca('resume', pano)
    expect(satirlar(pano, SID).map((e) => e.type)).toEqual(['claim', 'heartbeat'])
  }, HK)
})

describe('INV-CLAIM-YENILE-5 · ÇAKIŞMA: canlı BAŞKA oturum aynı şeridi tutuyorsa ALINMAZ, tek satır UYARI', () => {
  it('aynı şerit adı (büyük/küçük harfe duyarsız), FARKLI desenler → yenilenmez + uyarı + sahibin kısa sid i', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['scripts/board/**'], saatOnce(5))
    claim(pano, BASKA, 'arac', ['baska/**'], dkOnce(3))
    const s = kanca('resume', pano)
    expect(s.durum).toBe(0)
    expect(claimSayisi(pano, SID)).toBe(1)
    expect(s.ek).toContain('CLAIM YENILENMEDI')
    expect(s.ek).toContain(BASKA.slice(0, 8))
    expect(s.ek).toContain('ayni serit adini')
    // tek satır: uyarı metni tek kez, tek satırda geçer
    expect(s.ek.split('\n').filter((l) => l.includes('CLAIM YENILENMEDI')).length).toBe(1)
  }, HK)

  it('FARKLI şerit adı ama ÇAKIŞAN desen (a/** ↔ a/b/**) → yenilenmez + uyarı (desen)', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['scripts/**'], saatOnce(5))
    claim(pano, BASKA, 'ALTYAPI', ['scripts/board/**'], dkOnce(3))
    const s = kanca('startup', pano)
    expect(claimSayisi(pano, SID)).toBe(1)
    expect(s.ek).toContain('CLAIM YENILENMEDI')
    expect(s.ek).toContain('cakisiyor')
  }, HK)

  it('FARKLI şerit + BAĞIMSIZ desenler → yenilenir (aşırı temkin yok: çakışma yoksa alınır)', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['scripts/board/**'], saatOnce(5))
    claim(pano, BASKA, 'ADMIN', ['src/views/admin/**'], dkOnce(3))
    const s = kanca('startup', pano)
    expect(claimSayisi(pano, SID)).toBe(2)
    expect(s.ek).toContain('CLAIM YENILENDI')
  }, HK)

  it('çakışan tutucu KENDİ süresi dolmuş (bayat) ise engel DEĞİL: ölü oturum kilitlemez', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['scripts/board/**'], saatOnce(5))
    claim(pano, BASKA, 'ARAC', ['scripts/board/**'], saatOnce(6)) // bayat
    const s = kanca('resume', pano)
    expect(claimSayisi(pano, SID)).toBe(2)
    expect(s.ek).toContain('CLAIM YENILENDI')
  }, HK)

  it("'lane' yer tutucusu (adsız talep) şerit adı çakışması SAYILMAZ; yalnız desen bakılır", () => {
    const pano = yeniPano()
    claim(pano, SID, 'lane', ['x/**'], saatOnce(5))
    claim(pano, BASKA, 'lane', ['y/**'], dkOnce(3))
    const s = kanca('startup', pano)
    expect(claimSayisi(pano, SID)).toBe(2)
    expect(s.ek).toContain('CLAIM YENILENDI')
  }, HK)
})

describe('INV-CLAIM-YENILE-6 · TEK SAHİPLİK: bir sid yalnız KENDİ geçmişini yeniler', () => {
  it("başkasının süresi dolmuş talebi BAYT BAYT aynı kalır; bu sid'in yenilemesi onun dosyasına yazmaz", () => {
    const pano = yeniPano()
    claim(pano, BASKA, 'HARITA', ['harita/**'], saatOnce(7))
    claim(pano, UCUNCU, 'YETENEK', ['skill/**'], saatOnce(7))
    claim(pano, SID, 'ARAC', ['scripts/board/**'], saatOnce(5))
    const once = [BASKA, UCUNCU].map((s) => fs.readFileSync(path.join(pano, `events.${s}.jsonl`), 'utf8'))
    kanca('resume', pano)
    const sonra = [BASKA, UCUNCU].map((s) => fs.readFileSync(path.join(pano, `events.${s}.jsonl`), 'utf8'))
    expect(sonra).toEqual(once)
    expect(claimSayisi(pano, SID)).toBe(2)
  }, HK)

  it('kanca BAŞKA bir sid ile açılırsa (o sid nin geçmişi yok) SID nin bayat talebine dokunmaz', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['scripts/board/**'], saatOnce(5))
    kanca('resume', pano, {}, BASKA)
    expect(claimSayisi(pano, SID)).toBe(1)
    expect(fs.existsSync(path.join(pano, `events.${BASKA}.jsonl`))).toBe(false)
  }, HK)
})

describe('INV-CLAIM-YENILE-7 · 24 SAATTEN eski olay dosyası da yenilenir (pano bunu okumaz; yenileme okur)', () => {
  it('claim 3 gün önce, dosya mtime 3 gün önce → YENİ claim yazılır', () => {
    const pano = yeniPano()
    claim(pano, SID, 'ARAC', ['scripts/board/**'], saatOnce(72))
    const yol = path.join(pano, `events.${SID}.jsonl`)
    const eski = new Date(Date.now() - 72 * 60 * 60 * 1000)
    fs.utimesSync(yol, eski, eski) // readEvents (PRUNE_MS=24s) bu dosyayı HİÇ açmaz
    const s = kanca('resume', pano)
    expect(s.ek).toContain('CLAIM YENILENDI')
    expect(claimSayisi(pano, SID)).toBe(2)
  }, HK)
})

describe('INV-CLAIM-YENILE-8 · FAIL-OPEN: hata yolunda oturum açılışı BOZULMAZ (çıkış 0, geçerli JSON, alan yok)', () => {
  it('olay dosyası tümüyle bozuk (JSON değil): çıkış 0, yenileme satırı yok, kimlik satırı yerinde', () => {
    const pano = yeniPano()
    fs.writeFileSync(path.join(pano, `events.${SID}.jsonl`), '{{{ bozuk \n%%%\n', 'utf8')
    const s = kanca('resume', pano)
    expect(s.durum).toBe(0)
    expect(s.hso).not.toBeNull()
    expect(s.ek).toContain(`Oturum kimliğin: ${SID}`)
    expect(s.ek).not.toContain('CLAIM YENILEN')
  }, HK)

  it('bozuk satırlar arasındaki GEÇERLİ claim yine yenilenir; bozuk satır sayısı sessiz geçilmez (stderr)', () => {
    const pano = yeniPano()
    fs.writeFileSync(path.join(pano, `events.${SID}.jsonl`), '{{{ bozuk\n', 'utf8')
    claim(pano, SID, 'ARAC', ['a/**'], saatOnce(5))
    const s = kanca('resume', pano)
    expect(s.ek).toContain('CLAIM YENILENDI')
    expect(s.stderr).toContain('bozuk')
  }, HK)

  it('olay dosyası OKUNAMIYOR (dizin!): çıkış 0, geçerli JSON, yenileme atlandı mesajı stderr de', () => {
    const pano = yeniPano()
    fs.mkdirSync(path.join(pano, `events.${SID}.jsonl`)) // readFileSync EISDIR fırlatır
    const s = kanca('startup', pano)
    expect(s.durum).toBe(0)
    expect(s.hso).not.toBeNull()
    expect(s.ek).toContain(`Oturum kimliğin: ${SID}`)
    expect(s.stderr).toContain('claim yenileme atlandi')
  }, HK)

  it('pano dizini YOK (silinmiş): çıkış 0, geçerli JSON', () => {
    const s = kanca('resume', path.join(gecici, 'olmayan-pano'))
    expect(s.durum).toBe(0)
    expect(s.hso).not.toBeNull()
  }, HK)
})

describe('INV-CLAIM-YENILE-9 · SAF KARAR ve glob çakışması (birim; kanca çalıştırmadan)', () => {
  // BOARD_DIR modül yüklenirken okunur → yüklemeden ÖNCE izole dizine çevrilir (gerçek panoya dokunulmaz).
  const birimPano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-cy-birim-'))
  process.env.VENTHUB_BOARD_DIR = birimPano
  const require = createRequire(import.meta.url)
  const board = require(path.join(KOK, 'scripts/board/board.cjs')) as {
    globCakisir: (a: unknown, b: unknown) => boolean
    gecmisTalep: (sid: string, now?: number) => Record<string, unknown>
  }
  const cy = require(path.join(KOK, 'scripts/board/claim-yenile.cjs')) as {
    karar: (p: Record<string, unknown>) => { islem: string; sebep: string }
    yenile: (b: unknown, sid: string, o?: Record<string, unknown>) => { islem: string; sebep: string; satir: string }
  }

  it('globCakisir tablosu: iç içe/aynı/literal → çakışır; bağımsız → çakışmaz; boş/geçersiz → çakışmaz', () => {
    const tablo: Array<[string, string, boolean]> = [
      ['scripts/**', 'scripts/board/**', true],
      ['scripts/board/**', 'scripts/**', true],
      ['scripts/board/**', 'scripts/board/**', true],
      ['SCRIPTS/board/**', 'scripts/BOARD/**', true],
      ['scripts/board/board.cjs', 'scripts/board/**', true],
      ['src/**/x.ts', 'src/a/**', true],
      ['scripts\\board\\**', 'scripts/board/**', true],
      ['scripts/**', 'src/**', false],
      ['docs/plans/**', 'docs/standards/**', false],
      ['.claude/hooks/**', 'scripts/board/**', false],
      ['', 'a/**', false],
      ['a/**', '   ', false],
    ]
    for (const [a, b, beklenen] of tablo) expect(board.globCakisir(a, b), `${a} ~ ${b}`).toBe(beklenen)
    expect(board.globCakisir(undefined, 'a/**')).toBe(false)
  })

  const cakisir = (a: string, b: string): boolean => board.globCakisir(a, b)
  const talep = (o: Record<string, unknown>) => ({ durum: 'talep', canli: false, lane: 'ARAC', globs: ['a/**'], ...o })

  it('karar(): yok/bırakılmış/canlı/glob-yok → dokunma; bayat + engel yok → yenile; şerit adı / desen çakışması → uyarı', () => {
    const k = (gecmis: unknown, canli: unknown[] = []) => cy.karar({ sid: SID, gecmis, canli, cakisir })
    expect(k({ durum: 'yok' })).toMatchObject({ islem: 'dokunma', sebep: 'gecmis-yok' })
    expect(k(undefined)).toMatchObject({ islem: 'dokunma', sebep: 'gecmis-yok' })
    expect(k({ durum: 'birakildi' })).toMatchObject({ islem: 'dokunma', sebep: 'birakilmis' })
    expect(k(talep({ canli: true }))).toMatchObject({ islem: 'dokunma', sebep: 'zaten-canli' })
    expect(k(talep({ globs: [] }))).toMatchObject({ islem: 'dokunma', sebep: 'glob-yok' })
    expect(k(talep({ globs: ['', '  '] }))).toMatchObject({ islem: 'dokunma', sebep: 'glob-yok' })
    expect(k(talep({}))).toMatchObject({ islem: 'yenile', sebep: 'kira-dolmus' })
    expect(k(talep({}), [{ sid: SID, lane: 'ARAC', globs: ['a/**'] }])).toMatchObject({ islem: 'yenile' }) // kendisi engel değil
    expect(k(talep({}), [{ sid: BASKA, lane: 'Arac', globs: ['z/**'] }])).toMatchObject({ islem: 'uyari', sebep: 'ayni-serit-adi' })
    expect(k(talep({}), [{ sid: BASKA, lane: 'X', globs: ['a/b/**'] }])).toMatchObject({ islem: 'uyari', sebep: 'cakisan-desen' })
    expect(k(talep({}), [{ sid: BASKA, lane: 'X', globs: ['z/**'] }])).toMatchObject({ islem: 'yenile' })
  })

  it('yenile(): geçersiz/boş sid, kaynak dışı, bozuk board → ASLA fırlatmaz', () => {
    expect(cy.yenile({}, '', { source: 'resume' })).toMatchObject({ islem: 'dokunma', sebep: 'sid-yok' })
    expect(cy.yenile({}, SID, { source: 'compact' })).toMatchObject({ islem: 'dokunma', sebep: 'kaynak-disi' })
    const bozukBoard = {
      gecmisTalep: () => {
        throw new Error('disk yok')
      },
    }
    expect(cy.yenile(bozukBoard, SID, { source: 'resume' })).toMatchObject({ islem: 'hata', sebep: 'disk yok', satir: '' })
  })

  it('gecmisTalep(): ENOENT → yok; birleşme/exact/release/heartbeat kuralları liveClaims ile AYNI', () => {
    const s = 'aaaaaaaa-1111-4222-8333-444444444444'
    expect(board.gecmisTalep(s).durum).toBe('yok')
    const yol = path.join(birimPano, `events.${s}.jsonl`)
    const t = (ts: string, o: Record<string, unknown>): string => JSON.stringify({ ts, sid: s, ...o }) + '\n'
    const simdi = Date.parse('2026-09-30T12:00:00.000Z')
    fs.writeFileSync(
      yol,
      t('2026-09-30T06:00:00.000Z', { type: 'claim', lane: 'ARAC', globs: ['a/**'] }) +
        t('2026-09-30T06:10:00.000Z', { type: 'claim', globs: ['b/**'] }) + // lane devralınır, globlar birleşir
        t('2026-09-30T06:20:00.000Z', { type: 'heartbeat' }),
      'utf8',
    )
    const g = board.gecmisTalep(s, simdi)
    expect(g).toMatchObject({ durum: 'talep', canli: false, lane: 'ARAC', globs: ['a/**', 'b/**'], ts: '2026-09-30T06:00:00.000Z' })
    expect(board.gecmisTalep(s, Date.parse('2026-09-30T07:00:00.000Z'))).toMatchObject({ canli: true })
    fs.appendFileSync(yol, t('2026-09-30T06:30:00.000Z', { type: 'release' }))
    expect(board.gecmisTalep(s, simdi).durum).toBe('birakildi')
    // başka sid'in satırı bu dosyada bulunsa da SAYILMAZ (tek sahiplik)
    fs.writeFileSync(yol, JSON.stringify({ ts: '2026-09-30T06:00:00.000Z', sid: 'baska', type: 'claim', lane: 'X', globs: ['x/**'] }) + '\n', 'utf8')
    expect(board.gecmisTalep(s, simdi).durum).toBe('yok')
  })
})

describe('INV-CLAIM-YENILE-10 · kablo: kanca yenilemeyi liveClaims() ÇAĞRISINDAN ÖNCE koşturur ve yalnız startup/resume geçirir', () => {
  const kaynak = fs.readFileSync(KANCA, 'utf8')
  it('claim-yenile.cjs çağrısı liveClaims() den önce gelir', () => {
    const y = kaynak.indexOf('claim-yenile.cjs')
    const l = kaynak.indexOf('board.liveClaims()')
    expect(y).toBeGreaterThan(0)
    expect(l).toBeGreaterThan(y)
  })
  it('yenile() kaynak (source) bilgisini alır ve modül yalnız startup/resume kümesini kabul eder', () => {
    expect(kaynak).toMatch(/\.yenile\(board, sid, \{ source \}\)/)
    const modul = fs.readFileSync(path.join(KOK, 'scripts/board/claim-yenile.cjs'), 'utf8')
    expect(modul).toMatch(/new Set\(\['startup', 'resume'\]\)/)
  })
})
