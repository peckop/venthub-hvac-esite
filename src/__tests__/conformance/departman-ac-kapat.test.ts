import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-DEPARTMAN-AC-1..8 · INV-DEPARTMAN-KAPAT-1..6 · departman penceresi AÇICI ve KAPATICI (Ops 09-30).
 *
 * `departman-ac.cmd <Rol>`: rol adı → (tablo) görünen ad → panodan rolün SON sid'i → zaten açık mı → pencere tavanı →
 * `claude.exe --resume <sid> --name <Ad> …` (Windows Terminal yeni sekme). `departman-kapat.cmd <Rol>`: kayıpsız kapatma
 * (durum dosyası TAZE değilse KAPATMAZ; zorla kapatma yok).
 *
 * ⛔TESTLER YALNIZ `--kuru` / KARAR KİPİYLE KOŞAR: hiçbir gerçek `claude` başlatılmaz, hiçbir süreç sonlandırılmaz, gerçek
 * pano/oturum kaydı okunmaz. "Kuru kip gerçekten başlatmıyor mu?" sorusu kanaryayla ölçülür: sahte claude bir `.cmd`
 * betiğidir ve çalışırsa yan dosya yazar; kuru koşumdan sonra o dosya YOKTUR.
 *
 * ⭐KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: rol çözümü · son sid seçimi · canlılık (sessions/agents) · tavan (OPS hariç) · hata
 * yolları · --taze · kabuk sarmalayıcıları · kapatma kapısı (taze/bayat/meşgul/yok) · hedef doğrulama ayrı davranışlardır.
 * Sabotaj tablosu PR gövdesinde.
 *
 * Cetvel: `execution-method-standard.md` §9 · betikler `scripts/board/departman-{ac,kapat,ortak}.cjs` + `.ps1/.cmd`.
 */

const KOK = path.resolve(__dirname, '../../..')
const AC = path.join(KOK, 'scripts/board/departman-ac.cjs')
const KAPAT = path.join(KOK, 'scripts/board/departman-kapat.cjs')
const AC_CMD = path.join(KOK, 'scripts/board/departman-ac.cmd')
const KAPAT_CMD = path.join(KOK, 'scripts/board/departman-kapat.cmd')
const AC_PS1 = path.join(KOK, 'scripts/board/departman-ac.ps1')
const KAPAT_PS1 = path.join(KOK, 'scripts/board/departman-kapat.ps1')
const win = process.platform === 'win32'

const S_ARAC = '11111111-2222-4333-8444-555555555555'
const S_ARAC_ESKI = 'aaaaaaaa-2222-4333-8444-555555555555'
const S_HARITA = '99999999-2222-4333-8444-555555555555'
const S_OPS = 'bbbbbbbb-2222-4333-8444-555555555555'

let gecici = ''
let sayac = 0

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-dp-'))
})
afterAll(() => {
  try {
    if (gecici) fs.rmSync(gecici, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
  } catch {
    /* en iyi çaba */
  }
})

interface Duzenek {
  dizin: string
  kok: string
  pano: string
  kayit: string
  exe: string
  home: string
  marker: string
}

/** Her senaryoya kendi pano / oturum kaydı / ana kök (.mcp.json) / sahte claude / HOME. Gerçek makineye dokunmaz. */
function yeniDuzenek(): Duzenek {
  sayac += 1
  const dizin = path.join(gecici, `d${sayac}`)
  const d: Duzenek = {
    dizin,
    kok: path.join(dizin, 'ana kok'), // boşluklu yol: tırnaklama ölçülür
    pano: path.join(dizin, 'pano'),
    kayit: path.join(dizin, 'sessions'),
    exe: path.join(dizin, 'claude.cmd'),
    home: path.join(dizin, 'home'),
    marker: path.join(dizin, 'BASLADI.txt'),
  }
  for (const y of [d.kok, d.pano, d.kayit, d.home]) fs.mkdirSync(y, { recursive: true })
  fs.writeFileSync(path.join(d.kok, '.mcp.json'), '{}', 'utf8')
  // KANARYA: bu "claude" çalışırsa marker yazar. Kuru kipte ASLA çalışmamalı.
  fs.writeFileSync(d.exe, `@echo off\r\necho basladi> "${d.marker}"\r\n`, 'utf8')
  return d
}

const saatOnce = (s: number): string => new Date(Date.now() - s * 3600 * 1000).toISOString()

function claim(d: Duzenek, sid: string, lane: string, ts = new Date().toISOString(), mtime?: Date): void {
  const yol = path.join(d.pano, `events.${sid}.jsonl`)
  fs.appendFileSync(yol, JSON.stringify({ ts, sid, type: 'claim', lane, globs: ['x/**'] }) + '\n', 'utf8')
  if (mtime) fs.utimesSync(yol, mtime, mtime)
}

let kayitNo = 90000
/** `~/.claude/sessions/<pid>.json` benzeri kayıt. pid varsayılan = bu test süreci (CANLI). */
function oturumKaydi(d: Duzenek, sid: string, o: { pid?: number; name?: string; status?: string; kind?: string; cwd?: string } = {}): number {
  kayitNo += 1
  const pid = o.pid ?? process.pid
  fs.writeFileSync(
    path.join(d.kayit, `${kayitNo}.json`),
    JSON.stringify({ pid, sessionId: sid, cwd: o.cwd ?? 'C:\\proje', kind: o.kind ?? 'interactive', name: o.name ?? 'venthub-hvac-xx', status: o.status ?? 'idle' }),
    'utf8',
  )
  return pid
}

/** Kesin ölü bir pid: kısa ömürlü süreç başlat, bitmesini bekle. */
function oluPid(): number {
  const r = spawnSync(process.execPath, ['-e', ''], { windowsHide: true })
  return r.pid
}

/** `claude agents --json` ham çıktısı (canlilik.cjs gerçek ayrıştırma koduyla okur). */
function agentsHam(d: Duzenek, liste: Array<Record<string, unknown>>): string {
  const yol = path.join(d.dizin, 'agents.json')
  fs.writeFileSync(yol, JSON.stringify(liste), 'utf8')
  return yol
}

/** Durum dosyası: `~/.claude/projects/<slug>/<sid>.jsonl` + `memory/<ad>-state.md` (frontmatter'da sid). */
function durumDosyasi(d: Duzenek, sid: string, yasDk: number, ad = 'arac-state.md'): string {
  const proje = path.join(d.home, '.claude', 'projects', 'slug')
  fs.mkdirSync(path.join(proje, 'memory'), { recursive: true })
  fs.writeFileSync(path.join(proje, `${sid}.jsonl`), '{}\n', 'utf8')
  const yol = path.join(proje, 'memory', ad)
  fs.writeFileSync(yol, `---\noriginSessionId: ${sid}\n---\n## Durum\nyapilan: x\n`, 'utf8')
  const t = new Date(Date.now() - yasDk * 60 * 1000)
  fs.utimesSync(yol, t, t)
  return yol
}

interface Plan {
  karar: string
  ad?: string
  sid?: string | null
  pid?: number
  exe?: string
  cwd?: string
  args?: string[]
  argumentList?: string
  komut?: string
  sebep?: string
  mesaj?: string
  uyarilar?: string[]
  istem?: string | null
  taze?: boolean
  durum?: { ad: string; yasDk: number; tam: string } | null
  posta?: { durum: string }
  sayi?: number
  tavan?: number
}
interface Kosum {
  kod: number | null
  out: string
  err: string
  plan: Plan
}

function duzenekEnv(d: Duzenek, ek: Record<string, string> = {}): NodeJS.ProcessEnv {
  return {
    ...process.env,
    VENTHUB_BOARD_DIR: d.pano,
    VENTHUB_OTURUM_KAYIT_DIZINI: d.kayit,
    VENTHUB_CLAUDE_EXE: d.exe,
    VENTHUB_ANA_KOK: d.kok,
    VENTHUB_CANLILIK_HAM: '',
    VENTHUB_CANLILIK_KAPALI: '',
    HOME: d.home,
    USERPROFILE: d.home,
    ...ek,
  }
}

function calistir(betik: string, argv: string[], d: Duzenek, ek: Record<string, string> = {}, json = true): Kosum {
  const r = spawnSync(process.execPath, [betik, ...argv, ...(json ? ['--json'] : [])], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 60_000,
    env: duzenekEnv(d, ek),
  })
  let plan: Plan = { karar: '?' }
  if (json) {
    try {
      plan = JSON.parse(r.stdout || '{}') as Plan
    } catch {
      /* JSON değilse plan '?' kalır: ilgili kontroller kırmızı olur */
    }
  }
  return { kod: r.status, out: r.stdout || '', err: r.stderr || '', plan }
}
const ac = (rol: string, d: Duzenek, ek: string[] = [], env: Record<string, string> = {}): Kosum => calistir(AC, [rol, ...ek, '--kuru'], d, env)
const kapat = (rol: string, d: Duzenek, ek: string[] = [], env: Record<string, string> = {}): Kosum => calistir(KAPAT, [rol, ...ek, '--kuru'], d, env)

/** Gerçek kabuk zinciri (cmd.exe → ps1 → node). Yalnız Windows'ta koşar. */
function cmdKos(cmdYol: string, argv: string[], d: Duzenek): SpawnSyncReturns<string> {
  return spawnSync('cmd.exe', ['/c', cmdYol, ...argv], { encoding: 'utf8', windowsHide: true, timeout: 60_000, env: duzenekEnv(d) })
}

/** Tablo TEK KAYNAKTAN okunur: testte kopya YOK (kopya olursa tablo değişince test sessizce ayrışır). */
const require = createRequire(import.meta.url)
const TABLO = (require(path.join(KOK, 'scripts/board/pencere-adlari.cjs')) as { TABLO: ReadonlyArray<readonly [string, string]> }).TABLO

function asciiMi(metin: string): boolean {
  for (const ch of metin) if ((ch.codePointAt(0) ?? 0) > 127) return false
  return true
}

/** Yorumları atar (başlık yorumları yasak kalıpları ANLATIR; ölçülen şey KOD). ps1: diyez satırları; cjs: blok yorumu ve çift eğik çizgi. */
const ps1Kod = (m: string): string => m.split('\n').filter((s) => !s.trim().startsWith('#')).join('\n')
const cjsKod = (m: string): string =>
  m
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((s) => s.replace(/(^|\s)\/\/.*$/, ''))
    .join('\n')

describe('INV-DEPARTMAN-AC-1 · rol adı → görünen ad TEK KAYNAKTAN (pencere-adlari.cjs), Türkçe katlamalı', () => {
  it('TABLONUN HER SATIRI: hem şerit adı hem görünen ad (büyük/küçük, Türkçe harfli/harfsiz) aynı adı üretir', () => {
    for (const [serit, ad] of TABLO) {
      const varyantlar = [serit, serit.toLowerCase(), ad, ad.toLowerCase(), ad.toLocaleUpperCase('tr')]
      for (const v of varyantlar) {
        const k = ac(v, yeniDuzenek())
        expect(k.kod, `${v} → çıkış`).toBe(0)
        expect(k.plan.ad, v).toBe(ad)
        expect(k.plan.args, v).toContain(ad)
      }
    }
  }, 120_000)

  it('Türkçe katlama: "Ürün" = "urun" = "URUN"; "Altyapı" = "altyapi"; "Araç" = "ARAC"', () => {
    for (const [a, beklenen] of [['Ürün', 'Ürün'], ['urun', 'Ürün'], ['ÜRÜN', 'Ürün'], ['altyapi', 'Altyapı'], ['ARAÇ', 'Araç'], ['geo-seo', 'Geo-SEO']] as const) {
      expect(ac(a, yeniDuzenek()).plan.ad, a).toBe(beklenen)
    }
  }, 60_000)

  it('tanınmayan / boş / kısmi rol → HATA, çıkış 1, geçerli roller TABLODAN listelenir, hiçbir şey başlamaz', () => {
    for (const rol of ['bilinmez', 'Ara', 'Araç Ops', '', '  ', '../ops']) {
      const d = yeniDuzenek()
      const k = ac(rol, d)
      expect(k.kod, `"${rol}"`).toBe(1)
      expect(k.plan.karar).toBe('hata')
      expect(k.plan.sebep).toContain('rol taninmiyor')
      for (const [, ad] of TABLO) expect(k.plan.sebep).toContain(ad)
      expect(fs.existsSync(d.marker)).toBe(false)
    }
  }, 60_000)

  it('betikte KENDİ rol tablosu YOK: tablo satırlarının şerit adları betik kaynaklarında literal olarak geçmez', () => {
    const kaynak = ['departman-ac.cjs', 'departman-kapat.cjs', 'departman-ortak.cjs', 'departman-ac.ps1', 'departman-kapat.ps1']
      .map((f) => fs.readFileSync(path.join(KOK, 'scripts/board', f), 'utf8'))
      .join('\n')
    for (const [serit] of TABLO.filter(([s]) => s !== 'OPS')) expect(kaynak, serit).not.toContain(`'${serit}'`)
    // OPS yalnız tavan istisnası için ADLA anılır (görünen adı tablodan alınır: pencereAdlari.ad(OPS_SERIT))
    expect(kaynak).toContain("OPS_SERIT = 'OPS'")
  })
})

describe('INV-DEPARTMAN-AC-2 · rolün SON sid i panodan: en yeni claim; 24 saatten eski dosya dahil; UUID olmayan yok sayılır', () => {
  it('iki oturum aynı şeridi tutmuş: EN YENİ claim kazanır; --resume onunla', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC_ESKI, 'ARAC', saatOnce(50))
    claim(d, S_ARAC, 'ARAC', saatOnce(10))
    claim(d, S_HARITA, 'HARITA', saatOnce(1)) // başka şerit: en yeni olsa da seçilmez
    const k = ac('Araç', d)
    expect(k.kod).toBe(0)
    expect(k.plan.sid).toBe(S_ARAC)
    expect(k.plan.args).toEqual(['--resume', S_ARAC, '--name', 'Araç', '--permission-mode', 'auto', '--strict-mcp-config', '--mcp-config', path.join(d.kok, '.mcp.json')])
  })

  it('24 saatten ESKİ olay dosyası (pano bunu okumaz) da bulunur', () => {
    const d = yeniDuzenek()
    const eski = new Date(Date.now() - 96 * 3600 * 1000)
    claim(d, S_ARAC, 'ARAC', saatOnce(96), eski)
    expect(ac('arac', d).plan.sid).toBe(S_ARAC)
  })

  it("UUID OLMAYAN (elle) sid en yeni olsa da --resume edilmez: geçerli eski sid'e düşer", () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC', saatOnce(10))
    claim(d, 'recep-manual', 'ARAC', saatOnce(1))
    expect(ac('arac', d).plan.sid).toBe(S_ARAC)
  })

  it('şerit adı büyük/küçük harfe duyarsız eşleşir ("arac" claim i "Araç" rolüne ait)', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'arac', saatOnce(2))
    expect(ac('ARAÇ', d).plan.sid).toBe(S_ARAC)
  })

  it('geçmiş YOK: --resume YOK, yeni oturum (--name ile), açıklayıcı uyarı', () => {
    const d = yeniDuzenek()
    const k = ac('Harita', d)
    expect(k.plan.sid).toBeNull()
    expect(k.plan.args).not.toContain('--resume')
    expect(k.plan.args).toEqual(['--name', 'Harita', '--permission-mode', 'auto', '--strict-mcp-config', '--mcp-config', path.join(d.kok, '.mcp.json')])
    expect((k.plan.uyarilar ?? []).join('\n')).toContain('gecmis oturum yok')
  })

  it('çalışma dizini = ANA kök; komut satırı boşluklu yolu TIRNAKLAR (mcp-config, exe)', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    const k = ac('Araç', d)
    expect(k.plan.cwd).toBe(d.kok)
    expect(k.plan.komut).toContain(`"${path.join(d.kok, '.mcp.json')}"`)
    expect(k.plan.argumentList).toContain(`--mcp-config "${path.join(d.kok, '.mcp.json')}"`)
  })
})

describe('INV-DEPARTMAN-AC-3 · pencere ZATEN AÇIKSA açılmaz ("zaten açık: <ad> (sid8)", çıkış 0)', () => {
  it('sessions kaydı + CANLI pid: açılmaz', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC, { name: 'Araç' })
    const k = ac('Araç', d)
    expect(k.kod).toBe(0)
    expect(k.plan.karar).toBe('zaten-acik')
    expect(k.plan.mesaj).toBe(`zaten acik: Araç (${S_ARAC.slice(0, 8)})`)
    expect(k.plan.komut).toBeUndefined()
  })

  it('sessions kaydı var ama pid ÖLÜ: pencere kapalı sayılır → komut üretilir', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC, { pid: oluPid() })
    const k = ac('Araç', d)
    expect(k.plan.karar).toBe('ac')
    expect(k.plan.args).toContain('--resume')
  })

  it('claude agents listesi YETKİLİ: listede sid VARSA sessions kaydı olmasa da açık', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    const ham = agentsHam(d, [{ pid: 4242, cwd: 'C:\\x', kind: 'interactive', startedAt: 1, sessionId: S_ARAC, name: 'Araç', status: 'idle' }])
    const k = ac('Araç', d, [], { VENTHUB_CANLILIK_HAM: ham })
    expect(k.plan.karar).toBe('zaten-acik')
  })

  it('agents ölçülebiliyor ve sid listede YOKSA canlı pid kaydı yanıltmaz (pid yeniden kullanımı): açılır', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC) // canlı pid görünür ama agents listesi otoritedir
    const ham = agentsHam(d, [{ pid: 4242, cwd: 'C:\\x', kind: 'interactive', startedAt: 1, sessionId: S_HARITA, name: 'Harita', status: 'idle' }])
    expect(ac('Araç', d, [], { VENTHUB_CANLILIK_HAM: ham }).plan.karar).toBe('ac')
  })

  it('status: completed (bitmiş oturum) listede olsa da canlı SAYILMAZ', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    const ham = agentsHam(d, [{ pid: 4242, cwd: 'C:\\x', kind: 'interactive', startedAt: 1, sessionId: S_ARAC, name: 'Araç', status: 'completed' }])
    expect(ac('Araç', d, [], { VENTHUB_CANLILIK_HAM: ham }).plan.karar).toBe('ac')
  })

  it('zaten açık kararı TAVANDAN önce gelir (dolu tavan zaten açık pencereyi "tavan" diye reddetmez)', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC, { name: 'Araç' })
    for (let i = 0; i < 5; i++) oturumKaydi(d, `0000000${i}-2222-4333-8444-555555555555`)
    expect(ac('Araç', d).plan.karar).toBe('zaten-acik')
  })
})

describe('INV-DEPARTMAN-AC-4 · pencere TAVANI: en çok 5 açık departman penceresi; OPS ve alt süreçler SAYILMAZ', () => {
  const doldur = (d: Duzenek, n: number): void => {
    for (let i = 0; i < n; i++) oturumKaydi(d, `1000000${i}-2222-4333-8444-555555555555`, { name: `venthub-hvac-${i}` })
  }

  it('5 açık pencere → AÇILMAZ, çıkış 1, uyarı "5/5"; sahte claude BAŞLAMAZ', () => {
    const d = yeniDuzenek()
    doldur(d, 5)
    const k = ac('Araç', d)
    expect(k.kod).toBe(1)
    expect(k.plan.karar).toBe('tavan')
    expect(k.plan.sayi).toBe(5)
    expect(k.plan.tavan).toBe(5)
    expect(k.plan.mesaj).toContain('5/5')
    expect(k.plan.komut).toBeUndefined()
    expect(fs.existsSync(d.marker)).toBe(false)
  })

  it('4 açık pencere → açılır (sınır tam 5)', () => {
    const d = yeniDuzenek()
    doldur(d, 4)
    expect(ac('Araç', d).plan.karar).toBe('ac')
  })

  it('OPS SAYILMAZ (pano claim inin şerit adından): 4 diğer + 1 OPS = 5 pencere ama sayı 4 → açılır', () => {
    const d = yeniDuzenek()
    doldur(d, 4)
    claim(d, S_OPS, 'OPS')
    oturumKaydi(d, S_OPS, { name: 'venthub-hvac-ops' }) // adı tanıtıcı DEĞİL: yalnız claim şeridi OPS diyor
    expect(ac('Araç', d).plan.karar).toBe('ac')
  })

  it('OPS SAYILMAZ (pencere adından, tablo eşlemesi "Ops"): claim olmasa da 4 diğer + "Ops" adlı pencere → açılır', () => {
    const d = yeniDuzenek()
    doldur(d, 4)
    oturumKaydi(d, S_OPS, { name: 'Ops' })
    expect(ac('Araç', d).plan.karar).toBe('ac')
  })

  it('OPS dışında 5 pencere + OPS = 6 pencere → yine DOLU (OPS bir kontenjan açmaz, yalnız yer yemez)', () => {
    const d = yeniDuzenek()
    doldur(d, 5)
    claim(d, S_OPS, 'OPS')
    oturumKaydi(d, S_OPS, { name: 'Ops' })
    const k = ac('Araç', d)
    expect(k.plan.karar).toBe('tavan')
    expect(k.plan.sayi).toBe(5)
  })

  it('alt süreç / gözlemci pencereleri (vh-… adı, kind ≠ interactive) SAYILMAZ', () => {
    const d = yeniDuzenek()
    doldur(d, 4)
    oturumKaydi(d, 'c0000001-2222-4333-8444-555555555555', { name: 'vh-arac-9' })
    oturumKaydi(d, 'c0000002-2222-4333-8444-555555555555', { name: 'gozlemci', kind: 'background' })
    expect(ac('Araç', d).plan.karar).toBe('ac')
  })

  it('agents listesi otorite iken de sayım aynı kurallarla (5 ana pencere, OPS hariç)', () => {
    const d = yeniDuzenek()
    const p = (i: number, name: string) => ({ pid: 5000 + i, cwd: 'C:\\x', kind: 'interactive', startedAt: 1, sessionId: `2000000${i}-2222-4333-8444-555555555555`, name, status: 'idle' })
    const ham = agentsHam(d, [p(0, 'a'), p(1, 'b'), p(2, 'c'), p(3, 'd'), p(4, 'e'), p(5, 'Ops')])
    const k = ac('Araç', d, [], { VENTHUB_CANLILIK_HAM: ham })
    expect(k.plan.karar).toBe('tavan')
    expect(k.plan.sayi).toBe(5)
  })
})

describe('INV-DEPARTMAN-AC-5 · HATA YOLLARI: açık mesaj, sessiz geçmez; kırılmayan durumlarda uyarı basılır', () => {
  it('claude.exe BULUNAMADI (PATH boş, VENTHUB_CLAUDE_EXE yok): çıkış 1', () => {
    const d = yeniDuzenek()
    const k = ac('Araç', d, [], { VENTHUB_CLAUDE_EXE: '', PATH: d.dizin, Path: d.dizin })
    expect(k.kod).toBe(1)
    expect(k.plan.karar).toBe('hata')
    expect(k.plan.sebep).toContain('claude.exe bulunamadi')
  })

  it('VENTHUB_CLAUDE_EXE var olmayan dosyayı gösteriyor: çıkış 1 (varsayımla devam edilmez)', () => {
    const d = yeniDuzenek()
    const k = ac('Araç', d, [], { VENTHUB_CLAUDE_EXE: path.join(d.dizin, 'yok.exe') })
    expect(k.kod).toBe(1)
    expect(k.plan.sebep).toContain('claude.exe bulunamadi')
  })

  it('PATH te claude(.exe) VARSA bulunur (env verilmeden)', () => {
    const d = yeniDuzenek()
    const bin = path.join(d.dizin, 'bin')
    fs.mkdirSync(bin)
    const ad = win ? 'claude.exe' : 'claude'
    fs.writeFileSync(path.join(bin, ad), '', 'utf8')
    const k = ac('Araç', d, [], { VENTHUB_CLAUDE_EXE: '', PATH: bin, Path: bin })
    expect(k.kod).toBe(0)
    expect(k.plan.exe).toBe(path.join(bin, ad))
  })

  it('.mcp.json YOK: çıkış 1 ("bayrak yolu kırık olurdu")', () => {
    const d = yeniDuzenek()
    fs.rmSync(path.join(d.kok, '.mcp.json'))
    const k = ac('Araç', d)
    expect(k.kod).toBe(1)
    expect(k.plan.sebep).toContain('.mcp.json yok')
  })

  it('PANO dizini YOK: kırılmaz, YENİ oturum + uyarı (son oturum bilinmiyor)', () => {
    const d = yeniDuzenek()
    fs.rmSync(d.pano, { recursive: true })
    const k = ac('Araç', d)
    expect(k.kod).toBe(0)
    expect(k.plan.sid).toBeNull()
    expect((k.plan.uyarilar ?? []).join('\n')).toContain('pano dizini okunamadi')
  })

  it('olay dosyası BOZUK: bozuk satır atlanır ve SAYILIR; geçerli claim yine bulunur', () => {
    const d = yeniDuzenek()
    fs.writeFileSync(path.join(d.pano, 'events.bozuk.jsonl'), '{{{ nope\n%%%\n', 'utf8')
    claim(d, S_ARAC, 'ARAC')
    const k = ac('Araç', d)
    expect(k.plan.sid).toBe(S_ARAC)
    expect((k.plan.uyarilar ?? []).join('\n')).toMatch(/2 bozuk satir/)
  })

  it('sessions dizini YOK + agents ölçülemedi: kırılmaz, "canlilik KANITSIZ" uyarısı, komut üretilir', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    fs.rmSync(d.kayit, { recursive: true })
    const k = ac('Araç', d)
    expect(k.kod).toBe(0)
    expect(k.plan.karar).toBe('ac')
    expect((k.plan.uyarilar ?? []).join('\n')).toContain('sessions dizini yok')
  })

  it('bozuk agents çıktısı (JSON değil): kırılmaz, sessions kaydına düşer', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC)
    const ham = path.join(d.dizin, 'bozuk-agents.json')
    fs.writeFileSync(ham, 'bu json degil', 'utf8')
    expect(ac('Araç', d, [], { VENTHUB_CANLILIK_HAM: ham }).plan.karar).toBe('zaten-acik')
  })

  it('JSON dışı (insan) çıktı: hata stderr e, plan stdout a; --kuru başlığı "KURU:" ve çıkış kodları', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    const k = calistir(AC, ['Araç', '--kuru'], d, {}, false)
    expect(k.kod).toBe(0)
    expect(k.out).toContain('KURU: ')
    expect(k.out).toContain('--resume ' + S_ARAC)
    const h = calistir(AC, ['yok', '--kuru'], d, {}, false)
    expect(h.kod).toBe(1)
    expect(h.err).toContain('HATA: rol taninmiyor')
  })
})

describe('INV-DEPARTMAN-AC-6 · --taze: resume YOK, yeni oturum --name ile, ilk mesaj "durum dosyanı oku, devam et"', () => {
  it('sid bilinse de --resume YOK; son argüman ilk mesaj; durum dosyasının YOLU mesajda', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    const durum = durumDosyasi(d, S_ARAC, 3)
    const k = ac('Araç', d, ['--taze'])
    expect(k.kod).toBe(0)
    expect(k.plan.taze).toBe(true)
    expect(k.plan.sid).toBeNull()
    expect(k.plan.args).not.toContain('--resume')
    expect(k.plan.args?.slice(0, 2)).toEqual(['--name', 'Araç'])
    const istem = k.plan.args?.at(-1) ?? ''
    expect(istem).toContain('Durum dosyanı oku')
    expect(istem).toContain('devam et')
    expect(istem).toContain(durum)
    expect(k.plan.istem).toBe(istem)
    expect(k.plan.argumentList).toContain(`"${istem}"`) // boşluklu istem tek argüman olarak TIRNAKLI
  })

  it('durum dosyası BULUNAMADI: genel cümle + uyarı (yol uydurulmaz)', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    const k = ac('Araç', d, ['--taze'])
    expect(k.plan.istem).toContain('Durum dosyanı oku')
    expect(k.plan.istem).not.toContain(d.home)
    expect((k.plan.uyarilar ?? []).join('\n')).toContain('durum dosyasi bulunamadi')
  })

  it('geçmiş sid HİÇ yok + --taze: yine yeni oturum; mesaj genel', () => {
    const d = yeniDuzenek()
    const k = ac('Harita', d, ['--taze'])
    expect(k.plan.karar).toBe('ac')
    expect(k.plan.args).not.toContain('--resume')
    expect(k.plan.istem).toContain('devam et')
  })

  it('--taze olmadan ilk mesaj EKLENMEZ (son argüman .mcp.json yolu)', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    const k = ac('Araç', d)
    expect(k.plan.args?.at(-1)).toBe(path.join(d.kok, '.mcp.json'))
    expect(k.plan.istem ?? null).toBeNull()
  })

  it('--taze de zaten AÇIK pencereyi ikinci kez açmaz', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC)
    expect(ac('Araç', d, ['--taze']).plan.karar).toBe('zaten-acik')
  })
})

describe('INV-DEPARTMAN-AC-7 · kabuk sarmalayıcıları: .cmd ince, .ps1 doğru sırada temizler ve başlatır', () => {
  const cmd = fs.readFileSync(AC_CMD, 'utf8')
  const ps1 = ps1Kod(fs.readFileSync(AC_PS1, 'utf8'))

  it('.cmd: aynı klasördeki departman-ac.ps1 i çağırır, argümanları geçirir, çıkış kodunu taşır', () => {
    expect(cmd).toMatch(/powershell(\.exe)?\b[^\n]*-File\s+"%~dp0departman-ac\.ps1"\s+%\*/i)
    expect(cmd).toMatch(/exit\s+\/b\s+%ERRORLEVEL%/i)
    expect(cmd.split('\n').filter((s) => s.trim() && !/^\s*(@echo|rem)/i.test(s) && !/^\s*exit/i.test(s)).length).toBe(1) // ince: tek çağrı satırı
  })

  it('.ps1: CLAUDE* ortam değişkenlerinin HEPSİ Start-Process tan ÖNCE temizlenir', () => {
    const temizle = ps1.indexOf("Get-ChildItem Env: | Where-Object Name -like 'CLAUDE*' | Remove-Item")
    const baslat = ps1.indexOf('Start-Process')
    expect(temizle).toBeGreaterThan(0)
    expect(baslat).toBeGreaterThan(temizle)
  })

  it('.ps1: Start-Process -FilePath/-WorkingDirectory/-ArgumentList/-WindowStyle Normal/-PassThru; --kuru dalı başlatmadan ÖNCE çıkar', () => {
    const satir = ps1.split('\n').find((s) => s.includes('Start-Process -FilePath')) ?? ''
    for (const p of ['-FilePath $plan.exe', '-WorkingDirectory $plan.cwd', '-ArgumentList $plan.argumentList', '-WindowStyle Normal', '-PassThru']) expect(satir).toContain(p)
    const kuruDali = ps1.indexOf('if ($kuru)')
    expect(kuruDali).toBeGreaterThan(0)
    expect(kuruDali).toBeLessThan(ps1.indexOf('Start-Process'))
    expect(ps1.slice(kuruDali, ps1.indexOf('Start-Process'))).toMatch(/exit 0/)
  })

  it('.ps1: açılan sid ve PID YAZILIR; ayar dosyasına dokunulmaz', () => {
    expect(ps1).toContain("'acildi: '")
    expect(ps1).toContain('$surec.Id')
    expect(ps1).toMatch(/sid=/)
    expect(ps1).not.toMatch(/settings(\.local)?\.json|\.claude\.json/)
  })

  it('.ps1 dosyaları ASCII (Windows PowerShell 5.1 BOM suz UTF-8 i ANSI okur)', () => {
    for (const f of [AC_PS1, KAPAT_PS1]) expect(asciiMi(fs.readFileSync(f, 'utf8')), f).toBe(true)
  })

  it.skipIf(!win)('GERÇEK kabuk zinciri (.cmd → .ps1 → node) --kuru: komut yazılır, çıkış 0, sahte claude BAŞLAMAZ', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    const r = cmdKos(AC_CMD, ['Araç', '--kuru'], d)
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('KURU: ')
    expect(r.stdout).toContain(`--resume ${S_ARAC} --name Araç`)
    expect(r.stdout).toContain('--strict-mcp-config')
    expect(fs.existsSync(d.marker)).toBe(false)
  }, 60_000)

  it.skipIf(!win)('GERÇEK kabuk: bilinmeyen rol → çıkış 1 ve HATA; dolu tavan → çıkış 1 ve UYARI', () => {
    const d = yeniDuzenek()
    const h = cmdKos(AC_CMD, ['yok', '--kuru'], d)
    expect(h.status).toBe(1)
    expect(h.stdout).toContain('HATA: rol taninmiyor')
    for (let i = 0; i < 5; i++) oturumKaydi(d, `3000000${i}-2222-4333-8444-555555555555`)
    const t = cmdKos(AC_CMD, ['Araç', '--kuru'], d)
    expect(t.status).toBe(1)
    expect(t.stdout).toContain('UYARI')
    expect(t.stdout).toContain('5/5')
    expect(fs.existsSync(d.marker)).toBe(false)
  }, 120_000)
})

describe('INV-DEPARTMAN-AC-8 · süreç başlatma YALNIZ ps1 de: karar betikleri süreç başlatmaz (windowsHide/kopuk kuralları)', () => {
  it('departman-ac.cjs ve departman-ortak.cjs child_process İÇE AKTARMAZ (yalnız canlilik.cjs ölçüm çağrısı yapar)', () => {
    for (const f of ['departman-ac.cjs', 'departman-ortak.cjs']) {
      const k = fs.readFileSync(path.join(KOK, 'scripts/board', f), 'utf8')
      expect(k, f).not.toMatch(/require\((['"])(node:)?child_process\1\)/)
      expect(k, f).not.toMatch(/\bdetached\b/)
    }
  })
})

describe('INV-DEPARTMAN-KAPAT-1 · rol çözümü ve hedef seçimi: yalnız BU rolün sid i, tek pid', () => {
  it('tanınmayan rol → HATA, çıkış 1', () => {
    const k = kapat('bilinmez', yeniDuzenek())
    expect(k.kod).toBe(1)
    expect(k.plan.sebep).toContain('rol taninmiyor')
  })

  it('rolün panoda geçmişi YOK → HATA (kapatılacak pencere BİLİNMİYOR), süreç aranmaz', () => {
    const k = kapat('Harita', yeniDuzenek())
    expect(k.kod).toBe(1)
    expect(k.plan.sebep).toContain('kapatilacak pencere BILINMIYOR')
  })

  it('rol kapalıysa "zaten kapalı", çıkış 0', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    const k = kapat('Araç', d)
    expect(k.kod).toBe(0)
    expect(k.plan.karar).toBe('zaten-kapali')
    expect(k.plan.mesaj).toBe(`zaten kapali: Araç (${S_ARAC.slice(0, 8)})`)
  })

  it("iki rol açık: 'Araç' kapatılırken hedef pid YALNIZ Araç'ın kaydından gelir (Harita'nın pid i değil)", () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    claim(d, S_HARITA, 'HARITA')
    const pidArac = oturumKaydi(d, S_ARAC, { pid: process.pid, name: 'Araç' })
    const pidHarita = process.ppid // ikinci CANLI pid: ebeveyn süreç
    oturumKaydi(d, S_HARITA, { pid: pidHarita, name: 'Harita' })
    durumDosyasi(d, S_ARAC, 2)
    const k = kapat('Araç', d)
    expect(k.plan.sid).toBe(S_ARAC)
    expect(k.plan.pid).toBe(pidArac)
    expect(k.plan.pid).not.toBe(pidHarita)
  })

  it('alt süreç / gözlemci hedef OLAMAZ (vh-… adı): HATA, kapatma kararı yok', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC, { name: 'vh-arac-9' })
    durumDosyasi(d, S_ARAC, 1)
    const k = kapat('Araç', d)
    expect(k.kod).toBe(1)
    expect(k.plan.karar).toBe('hata')
    expect(k.plan.sebep).toContain('ana pencere degil')
  })
})

describe('INV-DEPARTMAN-KAPAT-2 · KAPI: yalnız durum dosyası TAZE (≤10 dk) ve pencere BOŞTA ise kapat', () => {
  const hazirla = (yasDk: number | null, o: { status?: string } = {}): Duzenek => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC, { name: 'Araç', status: o.status ?? 'idle' })
    if (yasDk !== null) durumDosyasi(d, S_ARAC, yasDk)
    return d
  }

  it('durum dosyası 2 dk önce + boşta → KAPAT, çıkış 0, hedef sid + pid; posta gönderilmedi (kuru)', () => {
    const k = kapat('Araç', hazirla(2))
    expect(k.kod).toBe(0)
    expect(k.plan.karar).toBe('kapat')
    expect(k.plan.sid).toBe(S_ARAC)
    expect(k.plan.pid).toBe(process.pid)
    expect(k.plan.mesaj).toContain('KAPATILIRDI')
    expect(k.plan.posta?.durum).toBe('kuru-gonderilmedi')
    expect(k.plan.durum?.yasDk).toBeLessThanOrEqual(3)
  })

  it('sınır: 9 dk önce → kapat; 11 dk önce → KAPATMA ("günlük bayat")', () => {
    expect(kapat('Araç', hazirla(9)).plan.karar).toBe('kapat')
    const k = kapat('Araç', hazirla(11))
    expect(k.kod).toBe(1)
    expect(k.plan.karar).toBe('kapatma')
    expect(k.plan.sebep).toBe('gunluk-bayat')
    expect(k.plan.mesaj).toContain('gunluk bayat')
    expect(k.plan.mesaj).toContain('kapatilmadi')
  })

  it('çok bayat (3 gün): KAPATMA', () => {
    expect(kapat('Araç', hazirla(3 * 24 * 60)).plan.karar).toBe('kapatma')
  })

  it('durum dosyası YOK: KAPATMA (sebep durum-yok)', () => {
    const k = kapat('Araç', hazirla(null))
    expect(k.kod).toBe(1)
    expect(k.plan.sebep).toBe('durum-yok')
    expect(k.plan.mesaj).toContain('BULUNAMADI')
  })

  it('pencere MEŞGUL (busy) iken durum taze olsa da KAPATMA (iş ortasında kapatılmaz)', () => {
    const k = kapat('Araç', hazirla(1, { status: 'busy' }))
    expect(k.kod).toBe(1)
    expect(k.plan.karar).toBe('kapatma')
    expect(k.plan.sebep).toBe('meshgul')
  })

  it('meşgul bilgisi agents listesinden de gelir (otorite)', () => {
    const d = hazirla(1)
    const ham = agentsHam(d, [{ pid: process.pid, cwd: 'C:\\x', kind: 'interactive', startedAt: 1, sessionId: S_ARAC, name: 'Araç', status: 'busy' }])
    expect(kapat('Araç', d, [], { VENTHUB_CANLILIK_HAM: ham }).plan.sebep).toBe('meshgul')
  })

  it('--kuru: HİÇBİR süreç sonlandırılmaz — hedef pid (bu test süreci) hâlâ canlı; sahte claude başlamadı', () => {
    const d = hazirla(1)
    const k = kapat('Araç', d)
    expect(k.plan.karar).toBe('kapat')
    expect(() => process.kill(k.plan.pid as number, 0)).not.toThrow()
    expect(fs.existsSync(d.marker)).toBe(false)
  })
})

describe('INV-DEPARTMAN-KAPAT-3 · GERÇEK yol (posta + bekleme) enjekte edilmiş posta ve uykuyla; süreç sonlandırma karar tarafında YOK', () => {
  const birim = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-dp-birim-'))
  const pano = path.join(birim, 'pano')
  const kayit = path.join(birim, 'sessions')
  const home = path.join(birim, 'home')
  const ENV_ADLARI = ['VENTHUB_BOARD_DIR', 'VENTHUB_OTURUM_KAYIT_DIZINI', 'HOME', 'USERPROFILE', 'VENTHUB_ANA_KOK', 'VENTHUB_CANLILIK_HAM']
  const eski = new Map<string, string | undefined>()
  interface KapatMod {
    planla: (rol: string, o?: Record<string, unknown>) => Promise<Plan>
    postaGonder: (sid: string, kok: string, ms?: number) => Promise<{ durum: string; sebep?: string }>
    kapiDegerlendir: (durum: unknown, hedef: unknown) => { acik: boolean; sebep: string }
  }
  let kapatMod: KapatMod

  beforeAll(() => {
    for (const y of [pano, kayit, home]) fs.mkdirSync(y, { recursive: true })
    for (const ad of ENV_ADLARI) eski.set(ad, process.env[ad])
    // Bu modüller BOARD_DIR / sessions dizinini YÜKLENİRKEN okur → yüklemeden önce izole dizinlere çevrilir.
    Object.assign(process.env, { VENTHUB_BOARD_DIR: pano, VENTHUB_OTURUM_KAYIT_DIZINI: kayit, HOME: home, USERPROFILE: home, VENTHUB_ANA_KOK: birim, VENTHUB_CANLILIK_HAM: '' })
    kapatMod = require(KAPAT) as KapatMod
  })
  afterAll(() => {
    for (const [ad, v] of eski) {
      if (v === undefined) delete process.env[ad]
      else process.env[ad] = v
    }
  })

  const proje = path.join(home, '.claude', 'projects', 'slug')
  const durumYol = path.join(proje, 'memory', 'arac-state.md')
  const kur = (yasDk: number): void => {
    fs.rmSync(pano, { recursive: true, force: true })
    fs.rmSync(kayit, { recursive: true, force: true })
    fs.mkdirSync(pano, { recursive: true })
    fs.mkdirSync(kayit, { recursive: true })
    fs.appendFileSync(path.join(pano, `events.${S_ARAC}.jsonl`), JSON.stringify({ ts: saatOnce(1), sid: S_ARAC, type: 'claim', lane: 'ARAC', globs: ['x/**'] }) + '\n')
    fs.writeFileSync(path.join(kayit, '90001.json'), JSON.stringify({ pid: process.pid, sessionId: S_ARAC, kind: 'interactive', name: 'Araç', status: 'idle', cwd: 'C:\\p' }))
    fs.mkdirSync(path.join(proje, 'memory'), { recursive: true })
    fs.writeFileSync(path.join(proje, `${S_ARAC}.jsonl`), '{}\n')
    fs.writeFileSync(durumYol, `---\noriginSessionId: ${S_ARAC}\n---\n## Durum\n`)
    const t = new Date(Date.now() - yasDk * 60 * 1000)
    fs.utimesSync(durumYol, t, t)
  }
  const simdiYaz = (): void => {
    const t = new Date()
    fs.utimesSync(durumYol, t, t)
  }

  it('istek TAM sid e bir kez gönderilir; bayat durum, pencere yazınca (uyku sırasında) TAZELENİR → kapat', async () => {
    kur(60)
    const gonderilen: string[] = []
    let uyku = 0
    const p = await kapatMod.planla('Araç', { projeDizini: proje,
      postaGonder: async (sid: string) => {
        gonderilen.push(sid)
        return { durum: 'gonderildi' }
      },
      uyu: async () => {
        uyku += 1
        simdiYaz() // pencere durum dosyasını yazdı
      },
      bekleSn: 30,
    })
    expect(gonderilen).toEqual([S_ARAC])
    expect(uyku).toBe(1)
    expect(p.karar).toBe('kapat')
    expect(p.posta?.durum).toBe('gonderildi')
  })

  it('istek atıldı ama pencere HİÇ yazmadı: bekleme SINIRLI (bekleSn), sonunda KAPATMA', async () => {
    kur(60)
    let uyku = 0
    const p = await kapatMod.planla('Araç', { projeDizini: proje,
      postaGonder: async () => ({ durum: 'gonderildi' }),
      uyu: async () => {
        uyku += 1
      },
      bekleSn: 0,
    })
    expect(uyku).toBe(0) // süre 0 → hiç beklemez
    expect(p.karar).toBe('kapatma')
    expect(p.sebep).toBe('gunluk-bayat')
  })

  it('--istek-atla: posta ÇAĞRILMAZ ve BEKLENMEZ (istek SendMessage ile atılmıştı)', async () => {
    kur(60)
    let cagri = 0
    let uyku = 0
    const p = await kapatMod.planla('Araç', { projeDizini: proje,
      istekAtla: true,
      postaGonder: async () => {
        cagri += 1
        return { durum: 'gonderildi' }
      },
      uyu: async () => {
        uyku += 1
      },
      bekleSn: 30,
    })
    expect(cagri).toBe(0)
    expect(uyku).toBe(0)
    expect(p.karar).toBe('kapatma')
    expect(p.posta?.durum).toBe('atlandi')
  })

  it('istek GÖNDERİLEMEDİ: uyarı basılır, yalnız mevcut durum dosyasına bakılır; taze ise yine kapat, bayatsa BEKLEMEDEN kapatma', async () => {
    kur(2)
    const taze = await kapatMod.planla('Araç', { projeDizini: proje, postaGonder: async () => ({ durum: 'hata', sebep: 'mailbox yok' }), bekleSn: 30 })
    expect(taze.karar).toBe('kapat')
    expect((taze.uyarilar ?? []).join('\n')).toContain('GONDERILEMEDI')
    kur(60)
    let uyku = 0
    const bayat = await kapatMod.planla('Araç', { projeDizini: proje,
      postaGonder: async () => ({ durum: 'hata', sebep: 'mailbox yok' }),
      uyu: async () => {
        uyku += 1
      },
      bekleSn: 30,
    })
    expect(uyku).toBe(0) // gönderilemeyen istek için beklemek boşuna
    expect(bayat.karar).toBe('kapatma')
  })

  it('bekleme sırasında pencere KAPANIRSA: "zaten kapalı" (kapatma kararı üretilmez)', async () => {
    kur(60)
    const p = await kapatMod.planla('Araç', { projeDizini: proje,
      postaGonder: async () => ({ durum: 'gonderildi' }),
      uyu: async () => {
        fs.rmSync(path.join(kayit, '90001.json'))
        simdiYaz()
      },
      bekleSn: 30,
    })
    expect(p.karar).toBe('zaten-kapali')
  })

  it('bekleme sırasında PID DEĞİŞİRSE (yeniden açıldı): HATA, kapatılmaz', async () => {
    kur(60)
    const p = await kapatMod.planla('Araç', { projeDizini: proje,
      postaGonder: async () => ({ durum: 'gonderildi' }),
      uyu: async () => {
        fs.writeFileSync(path.join(kayit, '90001.json'), JSON.stringify({ pid: process.ppid, sessionId: S_ARAC, kind: 'interactive', name: 'Araç', status: 'idle', cwd: 'C:\\p' }))
        simdiYaz()
      },
      bekleSn: 30,
    })
    expect(p.karar).toBe('hata')
    expect(p.sebep).toContain('pid degisti')
  })

  it('bekleme sırasında pencere MEŞGUL olursa (durum taze): KAPATMA (son ölçüm meşgul der)', async () => {
    kur(60)
    const p = await kapatMod.planla('Araç', { projeDizini: proje,
      postaGonder: async () => ({ durum: 'gonderildi' }),
      uyu: async () => {
        fs.writeFileSync(path.join(kayit, '90001.json'), JSON.stringify({ pid: process.pid, sessionId: S_ARAC, kind: 'interactive', name: 'Araç', status: 'busy', cwd: 'C:\\p' }))
        simdiYaz()
      },
      bekleSn: 30,
    })
    expect(p.karar).toBe('kapatma')
    expect(p.sebep).toBe('meshgul')
  })

  it('postaGonder gerçek fonksiyonu: mailbox-mcp yoksa ASLA fırlatmaz, {durum:"hata"} döner', async () => {
    const bos = fs.mkdtempSync(path.join(birim, 'kok-'))
    const r = await kapatMod.postaGonder(S_ARAC, bos, 2000)
    expect(r.durum).toBe('hata')
    expect(r.sebep).toContain('mailbox-mcp bulunamadi')
  })

  it('kapiDegerlendir() saf tablo: yok / bayat / taze+meşgul / taze+boşta', () => {
    const g = (durum: unknown, hedef: unknown) => kapatMod.kapiDegerlendir(durum, hedef)
    expect(g(null, { status: 'idle' })).toMatchObject({ acik: false, sebep: 'durum-yok' })
    expect(g({ ad: 'x', yasDk: 11 }, { status: 'idle' })).toMatchObject({ acik: false, sebep: 'gunluk-bayat' })
    expect(g({ ad: 'x', yasDk: 10 }, { status: 'idle' })).toMatchObject({ acik: true })
    expect(g({ ad: 'x', yasDk: 1 }, { status: 'busy' })).toMatchObject({ acik: false, sebep: 'meshgul' })
    expect(g({ ad: 'x', yasDk: 0 }, { status: 'idle' })).toMatchObject({ acik: true, sebep: 'taze-ve-bosta' })
  })
})

describe('INV-DEPARTMAN-KAPAT-4 · ZORLA KAPATMA YOK: sonlandırma yalnız ps1 de, tek pid, claude* doğrulamalı', () => {
  const ps1 = ps1Kod(fs.readFileSync(KAPAT_PS1, 'utf8'))
  const cjs = cjsKod(fs.readFileSync(KAPAT, 'utf8'))
  const ortak = cjsKod(fs.readFileSync(path.join(KOK, 'scripts/board/departman-ortak.cjs'), 'utf8'))
  const cmd = fs.readFileSync(KAPAT_CMD, 'utf8')

  it('.ps1 tek pid e Stop-Process -Id uygular; -Force / taskkill / toplu Get-Process|Stop-Process / süreç ağacı YOK', () => {
    expect(ps1).toMatch(/Stop-Process -Id \$plan\.pid -ErrorAction Stop/)
    const kod = ps1.split('\n').filter((s) => !s.trim().startsWith('#')).join('\n')
    expect(kod).not.toMatch(/-Force/i)
    expect(kod).not.toMatch(/taskkill/i)
    expect(kod).not.toMatch(/Get-Process[^\n]*\|\s*Stop-Process/i)
    expect(kod).not.toMatch(/Get-CimInstance|Win32_Process|\/T\b/i)
  })

  it('.ps1 hedef pid nin claude* olduğunu DOĞRULAR ve Stop-Process tan ÖNCE', () => {
    const dogrula = ps1.indexOf("-notlike 'claude*'")
    expect(dogrula).toBeGreaterThan(0)
    expect(dogrula).toBeLessThan(ps1.indexOf('Stop-Process -Id'))
  })

  it('.ps1: yalnız karar "kapat" iken sonlandırır; --kuru dalı ve kapatma/zaten-kapali/hata dalları ÖNCE çıkar', () => {
    const son = ps1.indexOf('Stop-Process -Id')
    for (const dal of ["-eq 'hata'", "-eq 'zaten-kapali'", "-eq 'kapatma'", "-ne 'kapat'", 'if ($kuru)']) {
      const i = ps1.indexOf(dal)
      expect(i, dal).toBeGreaterThan(0)
      expect(i, dal).toBeLessThan(son)
    }
  })

  it('karar betikleri (kapat.cjs / ortak.cjs) süreç SONLANDIRMAZ: process.kill(…, sinyal)/taskkill/Stop-Process yok', () => {
    for (const k of [cjs, ortak]) {
      expect(k).not.toMatch(/taskkill|Stop-Process/)
      // process.kill(pid, 0) yalnız CANLILIK yoklamasıdır (sinyal 0); gerçek sinyal YOK
      for (const m of k.matchAll(/process\.kill\(([^)]*)\)/g)) expect(m[1].trim(), m[0]).toMatch(/,\s*0$/)
    }
  })

  it('.cmd ince sarmalayıcı: aynı klasör ps1, %*, ERRORLEVEL', () => {
    expect(cmd).toMatch(/-File\s+"%~dp0departman-kapat\.ps1"\s+%\*/i)
    expect(cmd).toMatch(/exit\s+\/b\s+%ERRORLEVEL%/i)
  })

  it.skipIf(!win)('GERÇEK kabuk zinciri --kuru: taze → "KAPATILIRDI" çıkış 0; bayat → KAPATILMADI çıkış 1; hedef süreç canlı kalır', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC, { name: 'Araç' })
    const yol = durumDosyasi(d, S_ARAC, 1)
    const t = cmdKos(KAPAT_CMD, ['Araç', '--kuru'], d)
    expect(t.status).toBe(0)
    expect(t.stdout).toContain('KAPATILIRDI')
    expect(t.stdout).toContain(`sid=${S_ARAC}`)
    expect(t.stdout).toContain(`pid=${process.pid}`)
    expect(() => process.kill(process.pid, 0)).not.toThrow()
    const eski = new Date(Date.now() - 30 * 60 * 1000)
    fs.utimesSync(yol, eski, eski)
    const b = cmdKos(KAPAT_CMD, ['Araç', '--kuru'], d)
    expect(b.status).toBe(1)
    expect(b.stdout).toContain('KAPATILMADI')
    expect(b.stdout).toContain('gunluk bayat')
    const h = cmdKos(KAPAT_CMD, ['yok', '--kuru'], d)
    expect(h.status).toBe(1)
    expect(h.stdout).toContain('HATA: rol taninmiyor')
  }, 120_000)
})

describe('INV-DEPARTMAN-KAPAT-5 · CLI: bayrak ayrıştırma ve hata çıkışları', () => {
  it('--bekle-sn geçersiz (negatif / sayı değil) → çıkış 1', () => {
    for (const v of ['-5', 'abc']) {
      const d = yeniDuzenek()
      const r = spawnSync(process.execPath, [KAPAT, 'Araç', '--bekle-sn', v, '--kuru'], { encoding: 'utf8', windowsHide: true, env: duzenekEnv(d) })
      expect(r.status, v).toBe(1)
      expect(r.stderr).toContain('--bekle-sn')
    }
  })

  it('JSON dışı çıktı: kapat → "hedef:" satırı sid+pid ile; kapatma → çıkış 1 ve mesaj', () => {
    const d = yeniDuzenek()
    claim(d, S_ARAC, 'ARAC')
    oturumKaydi(d, S_ARAC, { name: 'Araç' })
    const yol = durumDosyasi(d, S_ARAC, 1)
    const ok = calistir(KAPAT, ['Araç', '--kuru'], d, {}, false)
    expect(ok.kod).toBe(0)
    expect(ok.out).toContain(`hedef: Araç sid=${S_ARAC} pid=${process.pid}`)
    const eski = new Date(Date.now() - 40 * 60 * 1000)
    fs.utimesSync(yol, eski, eski)
    const b = calistir(KAPAT, ['Araç', '--kuru'], d, {}, false)
    expect(b.kod).toBe(1)
    expect(b.out).toContain('gunluk bayat')
  })
})

describe('INV-DEPARTMAN-KAPAT-6 · posta isteğinin içeriği: yalnız durum dosyası isteği, sır/onay YOK, eşik metinde', () => {
  it('konu ve gövde "durum dosyanı yaz" ister, 10 dk eşiğini ve kapatmama şartını söyler', () => {
    const m = require(KAPAT) as { POSTA_KONU: string; POSTA_GOVDE: string }
    expect(m.POSTA_KONU.toLowerCase()).toContain('durum dosyani')
    expect(m.POSTA_GOVDE).toContain('Durum dosyani SIMDI guncelle')
    expect(m.POSTA_GOVDE).toContain('10 dk')
    expect(m.POSTA_GOVDE).toContain('KAPATMAYACAGIZ')
    expect(m.POSTA_GOVDE).not.toMatch(/onay|sifre|token|anahtar|key/i)
  })
})
