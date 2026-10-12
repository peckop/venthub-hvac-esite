import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

import { describe, expect, it, vi } from 'vitest'

vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-PANO-CANLILIK-1..17 · Pano canlılığı `claude agents --json` ile beslenir (REC-524).
 *
 * ÖLÇÜLMÜŞ SORUN (F8, 2026-09-30): pano canlılığı CLAIM ATIŞINDAN türetiliyordu. İki kör nokta:
 *   (a) pencere kapandı, claim kirası (4 saat) dolmadı → şerit "canlı" görünür = HAYALET;
 *   (b) pencere açık ama hiç claim almadı → pano onu HİÇ göstermez = "kayıp pencere".
 * Gerçek kaynak Claude Code'un kendisidir; `claude agents --json` aktif oturumları verir. `--all` KULLANILMAZ:
 * `claude agents --help` ona "tamamlanmış arka plan oturumlarını da kat" der (canlılık kaynağı değil).
 *
 * TEST TASARIMI: `claude` çıktısı ENJEKTE edilir (`calistir` parametresi ya da CLI için ham çıktı dosyası,
 * `VENTHUB_CANLILIK_HAM`) — gerçek `claude`a bağlı değildir; zaman aşımı / ENOENT / bozuk JSON yolları
 * GERÇEK yorumlama koduyla koşar. Bu dosyadaki her kolun SABOTAJI ölçülmüştür (PR gövdesindeki tablo):
 * kritik satır bozulunca ilgili kol KIRMIZIYA döner.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: hayalet, şeritsiz pencere, alt süreç, meşgul/boşta, zaman aşımı, bozuk
 * JSON, boş dizi, ENOENT, önbellek ve izole-pano ayrı davranışlardır; biri yeşil diye ötekiler ölçülmüş olmaz.
 */

const require = createRequire(import.meta.url)
const BOARD = require.resolve('../../../scripts/board/board.cjs')
const CANLILIK_YOLU = require.resolve('../../../scripts/board/canlilik.cjs')

type Pencere = {
  pid: number | null
  cwd: string
  kind: string
  startedAt: number | null
  sessionId: string
  name: string
  status: string
}
type Olcum =
  | { ok: true; pencereler: Pencere[]; kaynak: string; sureMs: number }
  | { ok: false; sebep: string; kaynak: string; kapali?: boolean }
type Birlesim = {
  serit: Map<string, { durum: string; ad: string; calisma: string }>
  seritsiz: Pencere[]
  yeniSurec: Pencere[]
  altSurec: Pencere[]
}
type Canlilik = {
  ZAMAN_ASIMI_MS: number
  ONBELLEK_MS: number
  YENI_SUREC_MS: number
  gercekKaynakKapaliMi: () => boolean
  ayristir: (ham: string) => { ok: true; pencereler: Pencere[] } | { ok: false; sebep: string }
  olc: (o?: {
    calistir?: () => unknown
    simdi?: number
    onbellekYolu?: string
    ttlMs?: number
    benSid?: string
  }) => Olcum
  olculemediSatiri: (o: Olcum) => string
  birlestir: (claimler: Array<{ sid: string }>, pencereler: Pencere[], simdi?: number) => Birlesim
  altSurecMi: (p: Pencere) => boolean
}
const canlilik: Canlilik = require('../../../scripts/board/canlilik.cjs')

const ANA = 'c:\\Users\\alize\\venthub-hvac'
const A = 'sinav-a-1111'
const B = 'sinav-b-2222'
const C = 'sinav-c-3333'
const D = 'sinav-d-4444'

function p(o: Partial<Pencere> & { sessionId: string }): Pencere {
  return {
    pid: 1000,
    cwd: ANA,
    kind: 'interactive',
    startedAt: 1_700_000_000_000, // ESKI (2023): "yeni surec" kurali testleri acikca kendi startedAt'ini verir
    name: 'venthub-hvac-0a',
    status: 'idle',
    ...o,
  }
}
function ham(...satirlar: Pencere[]): string {
  return JSON.stringify(satirlar)
}
function calistirSabit(stdout: string): () => unknown {
  return () => ({ status: 0, stdout })
}

function tmpRoot(): string {
  const raw =
    process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
  return raw.replace(/\\/g, '/').replace(/\/$/, '')
}
let sayac = 0
function benzersiz(onEk: string): string {
  sayac += 1
  return `${tmpRoot()}/${onEk}-${Date.now()}-${Math.random().toString(36).slice(2)}-${sayac}`
}

const KIMLIK_DEGISKENLERI = new Set(['CLAUDE_SESSION_ID', 'CLAUDE_CODE_SESSION_ID'])

/** CLI koşusu. `hamCikti` verilirse ölçüm o dosyadan (gerçek `claude` YOK); verilmezse `ek` env'i belirler. */
function kos(
  pano: string,
  args: string[],
  opsiyon: { hamCikti?: string; kayit?: string; ek?: Record<string, string> } = {},
): { kod: number; out: string; err: string } {
  const ciftler = Object.entries(process.env).filter(
    ([ad]) => !KIMLIK_DEGISKENLERI.has(ad) && !ad.startsWith('VENTHUB_CANLILIK_'),
  ) as Array<[string, string]>
  ciftler.push(['VENTHUB_BOARD_DIR', pano])
  ciftler.push(['VENTHUB_OTURUM_KAYIT_DIZINI', opsiyon.kayit ?? benzersiz('oturum-kayit-yok')])
  if (opsiyon.hamCikti !== undefined) {
    mkdirSync(tmpRoot(), { recursive: true })
    const dosya = benzersiz('canlilik-ham') + '.json'
    writeFileSync(dosya, opsiyon.hamCikti)
    ciftler.push(['VENTHUB_CANLILIK_HAM', dosya])
  }
  for (const [k, v] of Object.entries(opsiyon.ek ?? {})) ciftler.push([k, v])
  const env = Object.fromEntries(ciftler) as typeof process.env
  const r = spawnSync(process.execPath, [BOARD, ...args], { encoding: 'utf8', env })
  return { kod: typeof r.status === 'number' ? r.status : -1, out: r.stdout ?? '', err: r.stderr ?? '' }
}

const ACIK = { VENTHUB_CANLILIK_KAPALI: '0' }

function claimAl(pano: string, sid: string, lane: string, globs = 'src/**'): void {
  const r = kos(pano, ['claim', '--sid', sid, '--lane', lane, '--globs', globs])
  expect(r.kod, r.err).toBe(0)
}

describe('INV-PANO-CANLILIK · pano canlilik `claude agents --json` ile beslenir', () => {
  it('ON KOSUL: gercek cikti bicimi ayristirilir, board.cjs canlilik modulunu yukler (olculemedi != gecti)', () => {
    const ornek =
      '[{"pid":31284,"cwd":"c:\\\\Users\\\\alize\\\\venthub-hvac","kind":"interactive","startedAt":1790757610029,' +
      '"sessionId":"cb0467f1-f1a3-437d-bc15-52c0bd90feb3","name":"venthub-hvac-0a","status":"busy"}]'
    const r = canlilik.ayristir(ornek)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.pencereler).toHaveLength(1)
      expect(r.pencereler[0]).toMatchObject({
        pid: 31284,
        kind: 'interactive',
        sessionId: 'cb0467f1-f1a3-437d-bc15-52c0bd90feb3',
        name: 'venthub-hvac-0a',
        status: 'busy',
      })
    }
    const kaynak = readFileSync(BOARD, 'utf8')
    expect(kaynak, 'board.cjs canlilik modulunu require etmiyor: `who` eski claim-tabanli kaliyor').toMatch(
      /require\('\.\/canlilik\.cjs'\)/,
    )
  })

  it('INV-PANO-CANLILIK-1 · claim VAR, listede YOK → hayalet (kapali pencere); CLI satirinda KAPALI(hayalet)', () => {
    const b = canlilik.birlestir([{ sid: A }, { sid: B }], [p({ sessionId: A, name: 'Yetenek' })])
    expect(b.serit.get(A)?.durum).toBe('canli')
    expect(b.serit.get(B)?.durum).toBe('hayalet')

    const pano = benzersiz('pano-canlilik-1')
    claimAl(pano, A, 'YETENEK')
    claimAl(pano, B, 'URUN')
    const w = kos(pano, ['who', '--sid', A], {
      hamCikti: ham(p({ sessionId: A, name: 'Yetenek', status: 'busy' })),
      ek: ACIK,
    })
    expect(w.kod, w.err).toBe(0)
    const urun = w.out.split('\n').find((s) => s.includes('URUN'))
    expect(urun, w.out).toBeDefined()
    expect(urun).toContain('KAPALI(hayalet')
    const yetenek = w.out.split('\n').find((s) => s.includes('YETENEK'))
    expect(yetenek).toContain('●canlı')
    expect(yetenek).not.toContain('hayalet')
    expect(w.out).toMatch(/1 KAPALI\(hayalet\)/)
  })

  it('INV-PANO-CANLILIK-2 · listede VAR, claim YOK → seritsiz acik pencere; CLI satiri panoda claim yok der', () => {
    const b = canlilik.birlestir(
      [{ sid: A }],
      [p({ sessionId: A, name: 'Yetenek' }), p({ sessionId: C, name: 'Ops', status: 'busy' })],
    )
    expect(b.seritsiz.map((x) => x.sessionId)).toEqual([C])
    expect(b.altSurec).toHaveLength(0)

    const pano = benzersiz('pano-canlilik-2')
    claimAl(pano, A, 'YETENEK')
    const w = kos(pano, ['who', '--sid', A], {
      hamCikti: ham(p({ sessionId: A, name: 'Yetenek' }), p({ sessionId: C, name: 'Ops', status: 'busy' })),
      ek: ACIK,
    })
    const seritsiz = w.out.split('\n').find((s) => s.includes('ŞERİTSİZ AÇIK PENCERE'))
    expect(seritsiz, w.out).toBeDefined()
    expect(seritsiz).toContain('Ops')
    expect(seritsiz).toContain(C)
    expect(seritsiz).toContain('claim yok')
  })

  it('INV-PANO-CANLILIK-3 · vh-… adli / worktree cwd / interactive-olmayan claim-siz surec → ALT SUREC; claim-li pencere ASLA alt surec degil', () => {
    expect(canlilik.altSurecMi(p({ sessionId: 'x1', name: 'vh-arac-9-xx' }))).toBe(true)
    expect(canlilik.altSurecMi(p({ sessionId: 'x2', name: 'gozlemci', cwd: 'C:\\tmp\\vh-arac-12' }))).toBe(true)
    expect(canlilik.altSurecMi(p({ sessionId: 'x3', name: 'bg', kind: 'background' }))).toBe(true)
    expect(canlilik.altSurecMi(p({ sessionId: 'x4', name: 'Yetenek' }))).toBe(false)
    // Desktop'in arka planda actigi scratchpad surecleri (ad ya da cwd'nin son parcasi) tavani sahte doldurmasin
    expect(canlilik.altSurecMi(p({ sessionId: 'x5', name: 'scratchpad-3f2a' }))).toBe(true)
    expect(canlilik.altSurecMi(p({ sessionId: 'x6', name: '', cwd: 'C:\\Users\\a\\AppData\\Local\\Temp\\claude\\c--x\\abc\\scratchpad' }))).toBe(true)

    const b = canlilik.birlestir(
      [{ sid: D }],
      [
        p({ sessionId: D, name: 'vh-arac-12-ab', cwd: 'C:\\tmp\\vh-arac-12' }), // claim'li: ana pencere sayilir
        p({ sessionId: 'alt-1', name: 'vh-arac-9-xx', cwd: 'C:\\tmp\\vh-arac-9', status: 'busy' }),
        p({ sessionId: C, name: 'Ops' }),
      ],
    )
    expect(b.serit.get(D)?.durum).toBe('canli')
    expect(b.altSurec.map((x) => x.sessionId)).toEqual(['alt-1'])
    expect(b.seritsiz.map((x) => x.sessionId)).toEqual([C])

    const pano = benzersiz('pano-canlilik-3')
    claimAl(pano, A, 'YETENEK')
    const w = kos(pano, ['who', '--sid', A], {
      hamCikti: ham(
        p({ sessionId: A, name: 'Yetenek' }),
        p({ sessionId: 'alt-1', name: 'vh-arac-9-xx', cwd: 'C:\\tmp\\vh-arac-9', status: 'busy' }),
      ),
      ek: ACIK,
    })
    expect(w.out).toMatch(/ALT SÜREÇ 1 \(ana pencere sayılmaz\): vh-arac-9-xx\(meşgul/)
    expect(w.out, 'alt surec SERITSIZ pencere olarak da sayildi').not.toContain('ŞERİTSİZ AÇIK PENCERE')
  })

  it('INV-PANO-CANLILIK-4 · meskul/bosta ve pencere adi satira yansir; ad claude agents kaynaklidir', () => {
    const pano = benzersiz('pano-canlilik-4')
    claimAl(pano, A, 'YETENEK')
    claimAl(pano, B, 'HARITA')
    const w = kos(pano, ['who', '--sid', C], {
      hamCikti: ham(
        p({ sessionId: A, name: 'Yetenek', status: 'busy' }),
        p({ sessionId: B, name: 'Harita', status: 'idle' }),
      ),
      ek: ACIK,
    })
    const y = w.out.split('\n').find((s) => s.includes('YETENEK'))
    const h = w.out.split('\n').find((s) => s.includes('HARITA'))
    expect(y).toMatch(/YETENEK \(Yetenek\).*●canlı\/meşgul/)
    expect(h).toMatch(/HARITA \(Harita\).*●canlı\/boşta/)
  })

  it('INV-PANO-CANLILIK-5 · zaman asimi: sebep "zaman asimi", spawnSync timeout=8000 + windowsHide', () => {
    const r = canlilik.olc({
      calistir: () => ({ status: null, signal: 'SIGTERM', error: { code: 'ETIMEDOUT' } }),
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.sebep).toMatch(/8 sn'de dönmedi \(zaman aşımı\)/)
    // Sinir kodda sabit: gercek 8 sn'lik bekleme testte kosulmaz, ama parametreler ölçülür.
    expect(canlilik.ZAMAN_ASIMI_MS).toBe(8000)
    const kaynak = readFileSync(CANLILIK_YOLU, 'utf8')
    // ORTA-2: `--all` "bitmis arka plan oturumlarini da kat" demek (claude agents --help); canlilik kaynagina GIRMEZ.
    expect(kaynak).toMatch(/spawnSync\('claude', \['agents', '--json'\]/)
    expect(kaynak, '`--all` bayragi geri geldi: bitmis oturumlar canli sayilabilir').not.toMatch(/\['agents', '--json', '--all'\]/)
    expect(kaynak).toMatch(/timeout: ZAMAN_ASIMI_MS/)
    expect(kaynak).toMatch(/windowsHide: true/)
  })

  it('INV-PANO-CANLILIK-6 · bozuk JSON: eski cikti KORUNUR + TEK "canlilik olculemedi" satiri (sessiz degil)', () => {
    for (const bozuk of ['{ yarim', 'claude 2.1 yardim metni', '', '{"a":1}']) {
      const r = canlilik.olc({ calistir: calistirSabit(bozuk) })
      expect(r.ok, `bozuk girdi kabul edildi: ${JSON.stringify(bozuk)}`).toBe(false)
    }
    // Dizi olmayan gecerli JSON "bozuk" sayilir ve SEBEBI dogru yazilir (ayristir icinde, sonradan firlatma ile degil).
    expect(canlilik.ayristir('{"a":1}')).toEqual({ ok: false, sebep: 'JSON dizi değil' })
    expect(canlilik.ayristir('null')).toEqual({ ok: false, sebep: 'JSON dizi değil' })
    const pano = benzersiz('pano-canlilik-6')
    claimAl(pano, A, 'YETENEK')
    const w = kos(pano, ['who', '--sid', A], { hamCikti: '{ yarim yazilmis', ek: ACIK })
    expect(w.kod, w.err).toBe(0)
    expect(w.out, 'eski cikti (serit satiri) kayboldu').toMatch(/· YETENEK \(sen\) — src\/\*\*/)
    const olculemedi = w.out.split('\n').filter((s) => s.includes('canlılık ölçülemedi'))
    expect(olculemedi, w.out).toHaveLength(1)
    expect(olculemedi[0]).toMatch(/JSON bozuk/)
    expect(w.out, 'olculemeyen durum canli/kapali ETIKETI tasimamali').not.toMatch(/●canlı|○KAPALI/)
  })

  it("INV-PANO-CANLILIK-7 · bos dizi [] gecerli olcum: hicbir pencere acik degil → tum claim'ler hayalet, seritsiz yok", () => {
    const r = canlilik.olc({ calistir: calistirSabit('[]') })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.pencereler).toHaveLength(0)
    const b = canlilik.birlestir([{ sid: A }, { sid: B }], [])
    expect([...b.serit.values()].map((x) => x.durum)).toEqual(['hayalet', 'hayalet'])
    expect(b.seritsiz).toHaveLength(0)
    expect(b.altSurec).toHaveLength(0)

    const pano = benzersiz('pano-canlilik-7')
    claimAl(pano, A, 'YETENEK')
    const w = kos(pano, ['who', '--sid', A], { hamCikti: '[]', ek: ACIK })
    expect(w.out).toContain('KAPALI(hayalet')
    expect(w.out).not.toContain('canlılık ölçülemedi')
  })

  it('INV-PANO-CANLILIK-8 · `claude` bulunamadi (ENOENT): sebep acik, eski cikti korunur; gercek surec yolu PATH bos iken', () => {
    const r = canlilik.olc({ calistir: () => ({ status: null, error: { code: 'ENOENT' } }) })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.sebep).toMatch(/claude bulunamadı \(ENOENT\)/)

    // GERCEK yol: PATH bosaltilir, board.cjs gercek spawnSync('claude') cagirir → ENOENT.
    const pano = benzersiz('pano-canlilik-8')
    claimAl(pano, A, 'YETENEK')
    const w = kos(pano, ['who', '--sid', A], { ek: { ...ACIK, PATH: '', Path: '' } })
    expect(w.kod, w.err).toBe(0)
    expect(w.out).toMatch(/· YETENEK \(sen\)/)
    const olculemedi = w.out.split('\n').filter((s) => s.includes('canlılık ölçülemedi'))
    expect(olculemedi, w.out).toHaveLength(1)
    expect(olculemedi[0]).toMatch(/claude bulunamadı \(ENOENT\)/)
  })

  it('INV-PANO-CANLILIK-9 · 30 sn onbellek: ayni pencerede tek surec; 30 sn sonra yeniden; BASARISIZLIK da onbellenir', () => {
    const yol = benzersiz('onbellek') + '/canlilik-onbellek.json'
    let cagri = 0
    const calistir = () => {
      cagri += 1
      return { status: 0, stdout: ham(p({ sessionId: A, name: 'Yetenek' })) }
    }
    const t0 = 1_800_000_000_000
    const ilk = canlilik.olc({ calistir, simdi: t0, onbellekYolu: yol })
    const ikinci = canlilik.olc({ calistir, simdi: t0 + 29_000, onbellekYolu: yol })
    expect(cagri).toBe(1)
    expect(ilk.ok && ilk.kaynak).toBe('canli')
    expect(ikinci.ok && ikinci.kaynak).toBe('onbellek')
    canlilik.olc({ calistir, simdi: t0 + 31_000, onbellekYolu: yol })
    expect(cagri, '30 sn dolunca onbellek gecerli sayildi').toBe(2)
    expect(canlilik.ONBELLEK_MS).toBe(30_000)

    const yolHata = benzersiz('onbellek-hata') + '/canlilik-onbellek.json'
    let hataCagri = 0
    const hatali = () => {
      hataCagri += 1
      return { status: null, error: { code: 'ETIMEDOUT' }, signal: 'SIGTERM' }
    }
    canlilik.olc({ calistir: hatali, simdi: t0, onbellekYolu: yolHata })
    const tekrar = canlilik.olc({ calistir: hatali, simdi: t0 + 5_000, onbellekYolu: yolHata })
    expect(hataCagri, '8 sn lik zaman asimi her cagrida tekrarlandi').toBe(1)
    expect(tekrar.ok).toBe(false)
    if (!tekrar.ok) expect(tekrar.kaynak).toBe('onbellek')
  })

  it('INV-PANO-CANLILIK-10 · IZOLE pano (VENTHUB_BOARD_DIR) gercek `claude`i cagirmaz: satir eskisi gibi, ek satir YOK (hermetik)', () => {
    const pano = benzersiz('pano-canlilik-10')
    claimAl(pano, A, 'YETENEK')
    const w = kos(pano, ['who', '--sid', A])
    expect(w.kod, w.err).toBe(0)
    expect(w.out).toMatch(/PANO — canlı şeritler:/)
    expect(w.out).not.toMatch(/canlılık|●canlı|○KAPALI|ŞERİTSİZ/)
    // Kural matrisi HERMETIK olculur (gercek `claude` cagrilmaz): env degiskenleri gecici kurulup geri konur.
    const kural = (env: Record<string, string | undefined>): boolean => {
      const anahtarlar = ['VENTHUB_BOARD_DIR', 'VENTHUB_CANLILIK_KAPALI', 'VENTHUB_CANLILIK_HAM']
      const eski = Object.fromEntries(anahtarlar.map((k) => [k, process.env[k]]))
      try {
        for (const k of anahtarlar) {
          const v = env[k]
          if (v === undefined) delete process.env[k]
          else process.env[k] = v
        }
        return canlilik.gercekKaynakKapaliMi()
      } finally {
        for (const k of anahtarlar) {
          if (eski[k] === undefined) delete process.env[k]
          else process.env[k] = eski[k]
        }
      }
    }
    expect(kural({ VENTHUB_BOARD_DIR: 'x' }), 'izole pano varsayilan KAPALI').toBe(true)
    expect(kural({ VENTHUB_BOARD_DIR: 'x', VENTHUB_CANLILIK_KAPALI: '0' }), '=0 izole panoyu ACAR').toBe(false)
    expect(kural({ VENTHUB_BOARD_DIR: 'x', VENTHUB_CANLILIK_KAPALI: '1' })).toBe(true)
    expect(kural({ VENTHUB_CANLILIK_KAPALI: '1' }), 'gercek pano da =1 ile kapanir').toBe(true)
    expect(kural({}), 'gercek pano (VENTHUB_BOARD_DIR yok) varsayilan ACIK').toBe(false)
    expect(kural({ VENTHUB_BOARD_DIR: 'x', VENTHUB_CANLILIK_KAPALI: '1', VENTHUB_CANLILIK_HAM: 'f' }), 'HAM her zaman acar').toBe(false)
    // CLI yarisi da hermetik: HAM verilince izole panoda bile olcum ACILIR (gercek claude yok).
    const acik = kos(pano, ['who', '--sid', A], { hamCikti: ham(p({ sessionId: A, name: 'Yetenek' })) })
    expect(acik.out).toMatch(/●canlı/)
    expect(acik.out).toMatch(/canlılık: claude agents/)
  })

  it('INV-PANO-CANLILIK-11 · hayalet (kapali) pencere ad/serit CAKISMASI sayilmaz; canli olani tek basina kalir', () => {
    const pano = benzersiz('pano-canlilik-11')
    const kayit = benzersiz('oturum-kayit-11')
    mkdirSync(kayit, { recursive: true })
    // Eski oturum kaydi B (kapali pencere) icin AYNI adi hala tasiyor.
    writeFileSync(`${kayit}/2.json`, JSON.stringify({ pid: 2, sessionId: B, name: 'Yetenek', status: 'idle' }))
    claimAl(pano, A, 'YETENEK')
    claimAl(pano, B, 'YETENEK')
    const w = kos(pano, ['who', '--sid', A], {
      kayit,
      hamCikti: ham(p({ sessionId: A, name: 'Yetenek' })),
      ek: ACIK,
    })
    expect(w.out).not.toContain('ÇAKIŞMA')
    expect(w.out).not.toContain('AYNI ŞERİT ADI')
    expect(w.out).toContain('KAPALI(hayalet')
  })

  it('INV-PANO-CANLILIK-12 · claim YOK ama pencereler acik: "PANO: talep yok." + seritsiz pencereler (kayip pencere gorunur)', () => {
    const pano = benzersiz('pano-canlilik-12')
    const w = kos(pano, ['who', '--sid', A], {
      hamCikti: ham(p({ sessionId: C, name: 'Ops', status: 'busy' })),
      ek: ACIK,
    })
    expect(w.out.split('\n')[0]).toBe('PANO: talep yok.')
    expect(w.out).toContain('ŞERİTSİZ AÇIK PENCERE')
    expect(w.out).toContain('Ops')
  })

  it('INV-PANO-CANLILIK-13 · onbellekte CAGIRAN (benSid) yoksa onbellek yok sayilir, yeniden olculur (yeni acilan pencere hayalet gorunmez)', () => {
    const yol = benzersiz('onbellek-ben') + '/canlilik-onbellek.json'
    let liste: Pencere[] = [p({ sessionId: C, name: 'Ops' })]
    let cagri = 0
    const calistir = () => {
      cagri += 1
      return { status: 0, stdout: ham(...liste) }
    }
    const t0 = 1_800_000_000_000
    canlilik.olc({ calistir, simdi: t0, onbellekYolu: yol }) // onbellekte A YOK
    liste = [p({ sessionId: C, name: 'Ops' }), p({ sessionId: A, name: 'Yeni' })]
    const ben = canlilik.olc({ calistir, simdi: t0 + 5_000, onbellekYolu: yol, benSid: A })
    expect(cagri, 'onbellekte ben yokken yeniden olculmedi').toBe(2)
    expect(ben.ok && ben.kaynak).toBe('canli')
    expect(ben.ok && ben.pencereler.some((x) => x.sessionId === A)).toBe(true)
    // Ben listedeyse onbellek KULLANILIR (gereksiz surec yok); benSid verilmezse de eskisi gibi.
    canlilik.olc({ calistir, simdi: t0 + 6_000, onbellekYolu: yol, benSid: A })
    canlilik.olc({ calistir, simdi: t0 + 7_000, onbellekYolu: yol })
    expect(cagri).toBe(2)

    // CLI: onbellek ben'siz bir listeyle taze yazilmis; who --sid A yeniden olcer ve A'yi ●canli gorur.
    const pano = benzersiz('pano-canlilik-13')
    claimAl(pano, A, 'YETENEK')
    writeFileSync(
      `${pano}/canlilik-onbellek.json`,
      JSON.stringify({ ts: Date.now(), ok: true, pencereler: [p({ sessionId: C, name: 'Ops' })] }),
    )
    const w = kos(pano, ['who', '--sid', A], { hamCikti: ham(p({ sessionId: A, name: 'Yeni' })), ek: ACIK })
    const yetenek = w.out.split('\n').find((s) => s.includes('YETENEK'))
    expect(yetenek, w.out).toContain('●canlı')
    expect(yetenek).not.toContain('hayalet')
  })

  it('INV-PANO-CANLILIK-14 · `status: completed` kayit canli SAYILMAZ (claim → hayalet); `--all` bayragi kullanilmaz', () => {
    const r = canlilik.ayristir(
      ham(p({ sessionId: A, name: 'Acik', status: 'busy' }), p({ sessionId: B, name: 'Bitmis', status: 'completed' })),
    )
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.pencereler.map((x) => x.sessionId)).toEqual([A])
    const pano = benzersiz('pano-canlilik-14')
    claimAl(pano, A, 'YETENEK')
    claimAl(pano, B, 'URUN')
    const w = kos(pano, ['who', '--sid', A], {
      hamCikti: ham(p({ sessionId: A, name: 'Acik' }), p({ sessionId: B, name: 'Bitmis', status: 'completed' })),
      ek: ACIK,
    })
    expect(w.out.split('\n').find((s) => s.includes('URUN'))).toContain('KAPALI(hayalet')
    expect(w.out, 'bitmis oturum sayildi').toMatch(/1 açık pencere/)
  })

  it('INV-PANO-CANLILIK-15 · yalniz basarili olcum + ZAMAN ASIMI onbelleklenir; ENOENT/bozuk JSON onbelleklenmez; onbellek satiri etiketli; tmp cop birakmaz', () => {
    const t0 = 1_800_000_000_000
    for (const [ad, sonuc] of [
      ['ENOENT', { status: null, error: { code: 'ENOENT' } }],
      ['bozuk JSON', { status: 0, stdout: '{ yarim' }],
    ] as const) {
      const yol = benzersiz('onbellek-hizli-hata') + '/canlilik-onbellek.json'
      let cagri = 0
      const calistir = () => {
        cagri += 1
        return sonuc
      }
      canlilik.olc({ calistir, simdi: t0, onbellekYolu: yol })
      canlilik.olc({ calistir, simdi: t0 + 1_000, onbellekYolu: yol })
      expect(cagri, `${ad} onbelleklendi (claude kurulunca 30 sn yalan surer)`).toBe(2)
    }

    // "(onbellek)" etiketi: hata satiri ve basarili olcum satiri, kaynak onbellek ise etiket tasir.
    const yol2 = benzersiz('onbellek-etiket') + '/canlilik-onbellek.json'
    const zaman = () => ({ status: null, signal: 'SIGTERM', error: { code: 'ETIMEDOUT' } })
    const ilk = canlilik.olc({ calistir: zaman, simdi: t0, onbellekYolu: yol2 })
    const ikinci = canlilik.olc({ calistir: zaman, simdi: t0 + 1_000, onbellekYolu: yol2 })
    expect(ilk.ok).toBe(false)
    expect(ikinci.ok).toBe(false)
    const satir = (o: Olcum) => canlilik.olculemediSatiri(o)
    expect(satir(ikinci)).toMatch(/önbellek ≤30sn/)
    expect(satir(ilk)).not.toMatch(/önbellek/)
    const pano = benzersiz('pano-canlilik-15')
    claimAl(pano, A, 'YETENEK')
    const hamA = ham(p({ sessionId: A, name: 'Yetenek' }))
    const w1 = kos(pano, ['who', '--sid', A], { hamCikti: hamA, ek: ACIK })
    const w2 = kos(pano, ['who', '--sid', A], { hamCikti: hamA, ek: ACIK })
    expect(w1.out).toMatch(/\(ölçüldü \d+ms\)/)
    expect(w2.out, 'onbellekten gelen satir etiketsiz').toMatch(/\(önbellek ≤30sn\)/)

    // D2: renameSync basarisiz olursa (hedef bir DIZIN) gecici dosya SILINIR.
    const dizin = benzersiz('onbellek-rename')
    const hedef = `${dizin}/canlilik-onbellek.json`
    mkdirSync(hedef, { recursive: true })
    const sonuc = canlilik.olc({ calistir: calistirSabit('[]'), simdi: t0, onbellekYolu: hedef })
    expect(sonuc.ok).toBe(true)
    expect(readdirSync(dizin).filter((f) => f.endsWith('.tmp')), 'gecici dosya cop kaldi').toEqual([])
  })

  it('INV-PANO-CANLILIK-16 · claude sifirdan farkli cikis kodu: sebep "cikis kodu N", onbelleklenmez, eski cikti korunur', () => {
    const r = canlilik.olc({ calistir: () => ({ status: 2, stdout: '' }) })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.sebep).toBe('claude çıkış kodu 2')
    // Cikis kodu 0 + bos cikti ile AYIRT EDILIR (farkli sebep): kol yalnizca kod dalini olcer.
    const bos = canlilik.olc({ calistir: () => ({ status: 0, stdout: '' }) })
    expect(bos.ok).toBe(false)
    if (!bos.ok) expect(bos.sebep).not.toMatch(/çıkış kodu/)
  })

  it('INV-PANO-CANLILIK-17 · claim-siz surec < 5 dk → ◦YENI SUREC (henuz claim almadi); 5 dk sonra ⚠SERITSIZ; alt surec yeni sayilmaz', () => {
    const simdi = 1_800_000_000_000
    const b = canlilik.birlestir(
      [{ sid: A }],
      [
        p({ sessionId: A, name: 'Yetenek' }),
        p({ sessionId: 'yeni-1', name: 'Taze', startedAt: simdi - 4 * 60_000 }),
        p({ sessionId: 'eski-1', name: 'Eski', startedAt: simdi - 6 * 60_000 }),
        p({ sessionId: 'null-1', name: 'Belirsiz', startedAt: null }),
        p({ sessionId: 'alt-1', name: 'vh-arac-9-xx', startedAt: simdi - 60_000 }),
      ],
      simdi,
    )
    expect(b.yeniSurec.map((x) => x.sessionId)).toEqual(['yeni-1'])
    expect(b.seritsiz.map((x) => x.sessionId).sort()).toEqual(['eski-1', 'null-1'])
    expect(b.altSurec.map((x) => x.sessionId)).toEqual(['alt-1'])
    expect(canlilik.YENI_SUREC_MS).toBe(5 * 60_000)

    const pano = benzersiz('pano-canlilik-17')
    claimAl(pano, A, 'YETENEK')
    const su = Date.now()
    const w = kos(pano, ['who', '--sid', A], {
      hamCikti: ham(
        p({ sessionId: A, name: 'Yetenek' }),
        p({ sessionId: C, name: 'Taze', startedAt: su - 60_000 }),
        p({ sessionId: D, name: 'Eski', startedAt: su - 10 * 60_000 }),
      ),
      ek: ACIK,
    })
    const yeni = w.out.split('\n').find((s) => s.includes('YENİ SÜREÇ'))
    expect(yeni, w.out).toContain('henüz claim almadı')
    expect(yeni).toContain('Taze')
    expect(w.out.split('\n').find((s) => s.includes('ŞERİTSİZ AÇIK PENCERE'))).toContain('Eski')
    expect(w.out.split('\n').filter((s) => s.includes('Taze') && s.includes('ŞERİTSİZ'))).toHaveLength(0)
  })
})
