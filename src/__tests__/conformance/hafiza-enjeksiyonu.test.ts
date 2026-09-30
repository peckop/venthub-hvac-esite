// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * INV-HAFIZA-ENJEKSIYONU-1..12 — konu farkında sage hafızası + kullanım sayacı + hijyen (REC-519).
 *
 * ⭐NİÇİN VAR: WrongStack'in üç "kapalı" parçası (konu enjeksiyonu · recordUse sayacı · hijyen)
 * Claude Code'da hiç çalışmıyordu; sayaç yazılmadığı için sage hijyeni "hiç kullanılmadı"
 * ayrımını yapamıyordu. Bu kapı, üçünü kanca olarak çalıştıran mantığın DAVRANIŞINI ölçer.
 *
 * ⭐GERÇEK DAEMON YOK: mantık `port` nesnesini ENJEKTE alır; burada çağrıları KAYDEDEN sahte
 * bir port kullanılır. Sage paketi yalnız ana ağaçta kurulu ve CI'da YOK — testin kendisi
 * sage'e bağlı olsaydı CI'da hiçbir şey ölçmezdi. Tek istisna: INV-12 (eşleştirme kuralı
 * paritesi) sage kuruluysa koşar, değilse atlanır ve bunu söyler.
 *
 * ⭐HER KOLUN SABOTAJI VAR: kritik satır bozulduğunda ilgili test KIRMIZIYA döner (sabotaj
 * tablosu PR gövdesinde). "Koda bakarak sınama kanıt sayılmaz" (cetvel §5).
 *
 * Cetvel: docs/standards/hafiza-kancalari-standard.md §8
 */
const KOK = process.cwd()
const require_ = createRequire(import.meta.url)

interface SageKaydi {
  id: string
  text: string
  importance: number
  kind: string
}
interface PortCagrilari {
  search: [string, unknown][]
  injection: [string[], string, string][]
  use: [string[], string, string][]
  hygiene: unknown[]
}
interface DefterSatiri {
  n: string
  id: string
  metin: string
  kaynak: string
  t: string
  sayildi: boolean
  kullanildi: boolean
  nesil: number
}
interface Port {
  searchSage: (q: string, o: unknown) => Promise<SageKaydi[]>
  recordInjection: (ids: string[], tetik: string, oturum: string) => Promise<void>
  recordUse: (ids: string[], kaynak: string, oturum: string) => Promise<void>
  hygiene: (o: unknown) => Promise<Record<string, number>>
}
interface Modul {
  ASGARI_ISTEM_KARAKTER: number
  EN_FAZLA_DERS: number
  TOPLAM_KARAKTER: number
  ASGARI_ONEM: number
  KONU_BUTCE_MS: number
  SAYAC_BUTCE_MS: number
  HIJYEN_BUTCE_MS: number
  YEDEK_TAZE_SAAT: number
  gerekliOrtakTerim: (n: number) => number
  istemUygunMu: (s: unknown) => boolean
  eslesirMi: (ders: string, asistan: string, id?: string) => boolean
  konuEnjekte: (p: {
    girdi: { prompt?: string; session_id?: string }
    portAc: () => Promise<Port | null>
    daemonCanli: () => boolean
    pano: string
  }) => Promise<string>
  sayacTopla: (p: {
    girdi: { session_id?: string; transcript_path?: string }
    portAc: () => Promise<Port | null>
    daemonCanli: () => boolean
    pano: string
    simdi?: () => number
  }) => Promise<{ durum: string; sayilan?: number; kullanilan?: number }>
  hijyenKos: (p: {
    portAc: () => Promise<Port | null>
    daemonCanli: () => boolean
    yedekTaze: () => boolean
    log: (s: string) => void
    bekle: (ms: number) => Promise<void>
    simdi: () => number
  }) => Promise<{ durum: string }>
  daemonCanliMi: (
    kok: string,
    d?: { oku?: (p: string, e: string) => string; canliMi?: (pid: number) => boolean },
  ) => boolean
  zamanAsimi: (v: Promise<unknown>, ms: number) => Promise<unknown>
  ZAMAN_ASIMI: symbol
}
interface Defter {
  yaz: (o: string, k: { id: string; metin: string; kaynak: string }[], p: { pano: string; simdi?: number }) => boolean
  oku: (o: string, p: { pano: string }) => { satirlar: DefterSatiri[]; guncelNesil: number }
  defterYolu: (o: string, n: number, pano: string) => string
}

const M = require_(path.join(KOK, 'scripts', 'hijyen', 'hafiza-enjeksiyonu.cjs')) as Modul
const D = require_(path.join(KOK, 'scripts', 'hijyen', 'sage-enjeksiyon-defteri.cjs')) as Defter
const MODUL_KAYNAK = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'hafiza-enjeksiyonu.cjs'), 'utf8')

const KANCA_KONU = path.join(KOK, '.claude', 'hooks', 'hafiza-enjeksiyonu.cjs')
const KANCA_SAYAC = path.join(KOK, '.claude', 'hooks', 'hafiza-kullanim-sayaci.cjs')
const KANCA_HIJYEN = path.join(KOK, '.claude', 'hooks', 'sage-hijyen-oturum-sonu.cjs')
const KANCA_DOSYA = path.join(KOK, '.claude', 'hooks', 'sage-dosya-dersi.cjs')

// ── YARDIMCILAR ───────────────────────────────────────────────────────────────

const geciciDizin = (ad: string): string => fs.mkdtempSync(path.join(os.tmpdir(), `vh-hafiza-${ad}-`))

function sahtePort(
  sonuclar: SageKaydi[] = [],
  hata: { arama?: boolean; enjeksiyon?: boolean; kullanim?: boolean; hijyen?: boolean } = {},
): { port: Port; cagrilar: PortCagrilari; portAcSayisi: () => number; portAc: () => Promise<Port> } {
  const cagrilar: PortCagrilari = { search: [], injection: [], use: [], hygiene: [] }
  let acilan = 0
  const port: Port = {
    searchSage: async (q, o) => {
      cagrilar.search.push([q, o])
      if (hata.arama) throw new Error('IPC koptu')
      return sonuclar
    },
    recordInjection: async (ids, tetik, oturum) => {
      cagrilar.injection.push([ids, tetik, oturum])
      if (hata.enjeksiyon) throw new Error('IPC koptu')
    },
    recordUse: async (ids, kaynak, oturum) => {
      cagrilar.use.push([ids, kaynak, oturum])
      if (hata.kullanim) throw new Error('IPC koptu')
    },
    hygiene: async (o) => {
      cagrilar.hygiene.push(o)
      if (hata.hijyen) throw new Error('IPC koptu')
      return { examined: 12, deduplicated: 1, superseded: 2, staled: 3, reviewCandidatesCreated: 0, deleted: 0, verified: 9 }
    },
  }
  return {
    port,
    cagrilar,
    portAcSayisi: () => acilan,
    portAc: async () => {
      acilan++
      return port
    },
  }
}

const ders = (id: string, text: string, importance = 0.9, kind = 'convention'): SageKaydi => ({
  id,
  text,
  importance,
  kind,
})

const MIGRATION_ISTEMI = 'migration merge edildi prod veritabanina uygulandi mi'
const MIGRATION_DERSI =
  "Migration iceren dal master'a merge edilince bu is akisi prod veritabanina OTOMATIK uygular. Migration'li PR yalniz Recep onayiyla merge edilir."

// ── INV-1..3: konu kolu ───────────────────────────────────────────────────────

describe('INV-HAFIZA-ENJEKSIYONU-1 · kisa istem / komut arama YAPMAZ', () => {
  it('kisa, bos ve /komut istemlerde ne arama ne port acilisi olur; ARAMA YAPAN istem kontrolu (UZUN istem aranir)', async () => {
    const f = sahtePort([ders('01AAA', MIGRATION_DERSI)])
    const pano = geciciDizin('kisa')
    const istemler: (string | undefined)[] = [
      '',
      '   ',
      'tamam',
      'evet devam',
      // 14 karakter ama 2 icerik terimi tasir: yalniz UZUNLUK kapisi bunu durdurur
      'migration prod',
      '/compact',
      '/model opus migration merge edildi prod',
      undefined,
    ]
    for (const istem of istemler) {
      const cikti = await M.konuEnjekte({
        girdi: { prompt: istem, session_id: 'oturum-kisa' },
        portAc: f.portAc,
        daemonCanli: () => true,
        pano,
      })
      expect(cikti, `istem "${String(istem)}" ders bastı`).toBe('')
    }
    expect(f.cagrilar.search, 'kisa istemde ARAMA yapildi').toHaveLength(0)
    expect(f.portAcSayisi(), 'kisa istemde port ACILDI (pahali)').toBe(0)

    // ⭐AYIRT EDEN ÇİFT: aynı düzenek UZUN istemde ARAR (yoksa yukarıdaki sıfırlar vacuous olurdu)
    const uzun = await M.konuEnjekte({
      girdi: { prompt: MIGRATION_ISTEMI, session_id: 'oturum-kisa' },
      portAc: f.portAc,
      daemonCanli: () => true,
      pano,
    })
    expect(uzun).toContain('HAFIZA (konu):')
    expect(f.cagrilar.search).toHaveLength(1)
  })

  it('esik sayilari degeriyle: 15 karakter altinda uygun degil', () => {
    expect(M.ASGARI_ISTEM_KARAKTER).toBe(15)
    expect(M.istemUygunMu('a'.repeat(14))).toBe(false)
    expect(M.istemUygunMu('a'.repeat(15))).toBe(true)
    expect(M.istemUygunMu('/model ' + 'a'.repeat(30))).toBe(false)
  })
})

describe("INV-HAFIZA-ENJEKSIYONU-2 · ders varsa metin ID'siz basilir, ID deftere yazilir", () => {
  it('cikti ders metnini icerir, ID ICERMEZ; defter satiri {id, metin<=200, kaynak:konu, t} tasir', async () => {
    const uzunDers = MIGRATION_DERSI + ' ' + 'ek bilgi '.repeat(60)
    const f = sahtePort([ders('01ARZ3NDEKTSV4RRFFQ69G5FAV', uzunDers, 0.95, 'warning')])
    const pano = geciciDizin('ders')
    const cikti = await M.konuEnjekte({
      girdi: { prompt: MIGRATION_ISTEMI, session_id: 'oturum-ders-0001' },
      portAc: f.portAc,
      daemonCanli: () => true,
      pano,
    })
    expect(cikti.startsWith('HAFIZA (konu):\n')).toBe(true)
    expect(cikti).toContain('[warning]')
    expect(cikti).toContain(MIGRATION_DERSI)
    expect(cikti, 'ID model bagamina sizdi').not.toContain('01ARZ3NDEKTSV4RRFFQ69G5FAV')
    const { satirlar } = D.oku('oturum-ders-0001', { pano })
    expect(satirlar).toHaveLength(1)
    const s = satirlar[0]
    expect(s.id).toBe('01ARZ3NDEKTSV4RRFFQ69G5FAV')
    expect(s.kaynak).toBe('konu')
    expect(s.metin.length).toBeLessThanOrEqual(200)
    expect(Number.isNaN(Date.parse(s.t))).toBe(false)
    expect(s.sayildi).toBe(false)
  })

  it('OTMEMELI: dusuk onemli, alakasiz ve daha once basilmis ders BASILMAZ; compact nesli artinca tekrar basilir', async () => {
    const pano = geciciDizin('otmemeli')
    const kos = async (sonuclar: SageKaydi[], istem = MIGRATION_ISTEMI, oturum = 'oturum-otmemeli-01') => {
      const f = sahtePort(sonuclar)
      return M.konuEnjekte({ girdi: { prompt: istem, session_id: oturum }, portAc: f.portAc, daemonCanli: () => true, pano })
    }
    // asgari onem (0.5) alti
    expect(await kos([ders('01ONEMSIZ', MIGRATION_DERSI, 0.4)])).toBe('')
    // alakasiz: istemin icerik terimlerinden yeterince tasimiyor
    expect(await kos([ders('01ALAKASIZ', 'Vitrin sayfasinda gorunen her tablonun tetigi olmali; kategori agaci degisir.')])).toBe('')
    // alakali ders BIR KEZ basilir, ikincisinde (ayni oturum-nesil) basilmaz
    expect(await kos([ders('01ALAKALI', MIGRATION_DERSI)])).toContain('HAFIZA (konu):')
    expect(await kos([ders('01ALAKALI', MIGRATION_DERSI)]), 'ayni ders ayni nesilde ikinci kez basildi').toBe('')
    // compact: nesil artar → ders tekrar gorunur
    fs.writeFileSync(path.join(pano, '.sage-dersi-nesil-oturum-otmemeli-01'), '1', 'utf8')
    expect(await kos([ders('01ALAKALI', MIGRATION_DERSI)])).toContain('HAFIZA (konu):')
  })

  it('alaka esigi istem uzunluguna gore: kisa istem 2, uzun istem 3 ortak terim ister', () => {
    expect(M.gerekliOrtakTerim(2)).toBe(2)
    expect(M.gerekliOrtakTerim(3)).toBe(2)
    expect(M.gerekliOrtakTerim(4)).toBe(2)
    expect(M.gerekliOrtakTerim(5)).toBe(3)
    expect(M.gerekliOrtakTerim(12)).toBe(3)
  })

  it('durak sozcuk ders tarafinda eslesme SAYILMAZ (ilk olcumdeki "merhaba nasilsin" hatasi)', async () => {
    const f = sahtePort([ders('01KOTA', "Recep kurali: 'kota sifirlaniyor' DEME. Nasil uygulanir: bugun paralel calisma serbest.")])
    const cikti = await M.konuEnjekte({
      girdi: { prompt: 'merhaba nasilsin bugun', session_id: 'oturum-durak' },
      portAc: f.portAc,
      daemonCanli: () => true,
      pano: geciciDizin('durak'),
    })
    expect(cikti).toBe('')
  })
})

describe('INV-HAFIZA-ENJEKSIYONU-3 · butce: ders KIRPILMAZ, sigmayan BUTUN atlanir ve sayisi yazilir', () => {
  it('iki uzun ders: ilki BUTUN basilir, ikincisi BUTUN atlanir, "1 ders daha var" yazilir, deftere yalniz basilan girer', async () => {
    const uzun = (anahtar: string) =>
      `Migration prod veritabanina uygulandi ${anahtar}: ` + 'merge onayi kaydi ve olcum notu. '.repeat(26)
    const d1 = uzun('BIRINCI')
    const d2 = uzun('IKINCI')
    expect(d1.length).toBeGreaterThan(800)
    expect(d1.length + d2.length).toBeGreaterThan(M.TOPLAM_KARAKTER)
    const f = sahtePort([ders('01BIR', d1), ders('01IKI', d2)])
    const pano = geciciDizin('butce')
    const cikti = await M.konuEnjekte({
      girdi: { prompt: MIGRATION_ISTEMI, session_id: 'oturum-butce-0001' },
      portAc: f.portAc,
      daemonCanli: () => true,
      pano,
    })
    expect(cikti, 'birinci ders KIRPILDI').toContain(d1.replace(/\s+/g, ' ').trim())
    expect(cikti, 'sigmayan ders kismen basildi').not.toContain('IKINCI')
    expect(cikti).toMatch(/\(1 ders daha var/)
    expect(cikti).toContain('memory_search')
    const idler = D.oku('oturum-butce-0001', { pano }).satirlar.map((s) => s.id)
    expect(idler, 'atlanan ders "basildi" diye deftere girdi').toEqual(['01BIR'])
  })

  it('en fazla 3 ders basilir; fazlasi sayilir ("2 ders daha var"); tavan sayilari degeriyle', async () => {
    expect(M.EN_FAZLA_DERS).toBe(3)
    expect(M.TOPLAM_KARAKTER).toBe(1400)
    expect(M.ASGARI_ONEM).toBe(0.5)
    const kisa = (i: number) => ders(`01D${i}`, `Migration merge onayi prod veritabanina uygulandi notu numara ${i} kisa ders.`)
    const f = sahtePort([kisa(1), kisa(2), kisa(3), kisa(4), kisa(5)])
    const cikti = await M.konuEnjekte({
      girdi: { prompt: MIGRATION_ISTEMI, session_id: 'oturum-uc-0001' },
      portAc: f.portAc,
      daemonCanli: () => true,
      pano: geciciDizin('uc'),
    })
    expect((cikti.match(/· \[/g) ?? []).length).toBe(3)
    expect(cikti).toMatch(/\(2 ders daha var/)
    // arama limiti sartnameye uygun
    expect((f.cagrilar.search[0][1] as { limit: number }).limit).toBe(5)
  })
})

// ── INV-4: daemon yok ─────────────────────────────────────────────────────────

describe('INV-HAFIZA-ENJEKSIYONU-4 · daemon canli degilse SESSIZ ve arama yok; kanca daemon BASLATMAZ', () => {
  it('daemonCanli=false → bos cikti, port ACILMAZ, arama yok', async () => {
    const f = sahtePort([ders('01AAA', MIGRATION_DERSI)])
    const cikti = await M.konuEnjekte({
      girdi: { prompt: MIGRATION_ISTEMI, session_id: 'oturum-daemon' },
      portAc: f.portAc,
      daemonCanli: () => false,
      pano: geciciDizin('daemon'),
    })
    expect(cikti).toBe('')
    expect(f.portAcSayisi(), 'daemon yokken port acildi (spawn riski)').toBe(0)
    expect(f.cagrilar.search).toHaveLength(0)
  })

  it('daemonCanliMi: server.json yok / bozuk / pid olu → false; pid canli → true (baglanti ACILMAZ)', () => {
    const kok = geciciDizin('sj')
    expect(M.daemonCanliMi(kok), 'server.json yokken canli sanildi').toBe(false)
    fs.mkdirSync(path.join(kok, '.wrongstack', 'memories'), { recursive: true })
    const sj = path.join(kok, '.wrongstack', 'memories', 'server.json')
    fs.writeFileSync(sj, '{bozuk', 'utf8')
    expect(M.daemonCanliMi(kok)).toBe(false)
    fs.writeFileSync(sj, JSON.stringify({ pid: 999999 }), 'utf8')
    expect(M.daemonCanliMi(kok, { canliMi: () => false }), 'olu pid canli sanildi').toBe(false)
    fs.writeFileSync(sj, JSON.stringify({ pid: process.pid }), 'utf8')
    expect(M.daemonCanliMi(kok), 'canli pid (bu surec) olu sanildi').toBe(true)
  })

  it('GERCEK KANCA: server.json olmayan projede stdout BOS, cikis 0, sage paketi yuklenmez (hizli)', () => {
    const kok = geciciDizin('proje')
    const pano = geciciDizin('pano')
    const t0 = Date.now()
    const r = spawnSync(process.execPath, [KANCA_KONU], {
      input: JSON.stringify({ session_id: 'oturum-gercek', prompt: MIGRATION_ISTEMI }),
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: kok, VENTHUB_BOARD_DIR: pano },
      timeout: 30_000,
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
    expect(Date.now() - t0, 'daemon yokken kanca sage yuklemis olabilir').toBeLessThan(M.KONU_BUTCE_MS)
  })
})

// ── INV-5..6: Stop sayaci ─────────────────────────────────────────────────────

const OTURUM = 'oturum-sayac-0001-abcdef'

function defterKur(satirlar: { id: string; metin: string; kaynak?: string }[], simdi: number): string {
  const pano = geciciDizin('sayac')
  D.yaz(
    OTURUM,
    satirlar.map((s) => ({ id: s.id, metin: s.metin, kaynak: s.kaynak ?? 'konu' })),
    { pano, simdi },
  )
  return pano
}

function transkriptYaz(mesajlar: { t: number; text: string; rol?: string }[]): string {
  const dizin = geciciDizin('transkript')
  const yol = path.join(dizin, 'oturum.jsonl')
  const satirlar = mesajlar.map((m) =>
    JSON.stringify({
      type: m.rol ?? 'assistant',
      isSidechain: false,
      timestamp: new Date(m.t).toISOString(),
      message: { role: m.rol ?? 'assistant', content: [{ type: 'text', text: m.text }] },
    }),
  )
  fs.writeFileSync(yol, satirlar.join('\n') + '\n', 'utf8')
  return yol
}

const DERS_A =
  'Migration iceren dal master a merge edilince bu is akisi prod veritabanina OTOMATIK uygular; migrationli PR yalniz Recep onayiyla merge edilir.'
const DERS_B =
  'Vitrin sayfasinda gorunen her tablonun veritabani tetigi ve webhook handler dali olmali; yoksa veri degisir sayfa degismez.'

describe('INV-HAFIZA-ENJEKSIYONU-5 · recordInjection CIFT SAYILMAZ', () => {
  it('ilk Stop sayilmamis satirlari yazar ve isaretler; ikinci Stop hicbir sey yazmaz', async () => {
    const t = Date.now()
    const pano = defterKur(
      [
        { id: '01A', metin: DERS_A },
        { id: '01B', metin: DERS_B },
      ],
      t,
    )
    const f = sahtePort()
    const kos = () =>
      M.sayacTopla({ girdi: { session_id: OTURUM, transcript_path: '' }, portAc: f.portAc, daemonCanli: () => true, pano })
    const bir = await kos()
    expect(bir.durum).toBe('tamam')
    expect(bir.sayilan).toBe(2)
    expect(f.cagrilar.injection).toHaveLength(1)
    expect(f.cagrilar.injection[0][0].sort()).toEqual(['01A', '01B'])
    expect(f.cagrilar.injection[0][1]).toBe('claude_code_hook')
    expect(f.cagrilar.injection[0][2]).toBe(OTURUM)
    expect(D.oku(OTURUM, { pano }).satirlar.every((s) => s.sayildi)).toBe(true)

    const iki = await kos()
    expect(iki.durum).toBe('is-yok')
    expect(f.cagrilar.injection, 'ikinci Stop ayni enjeksiyonu YENIDEN yazdi (cift sayim)').toHaveLength(1)
  })

  it('AYNI ders iki kez basildiysa iki ayri enjeksiyondur: iki tur, her turda tek kayit', async () => {
    const t = Date.now()
    const pano = defterKur(
      [
        { id: '01A', metin: DERS_A },
        { id: '01A', metin: DERS_A, kaynak: 'dosya' },
      ],
      t,
    )
    const f = sahtePort()
    await M.sayacTopla({ girdi: { session_id: OTURUM }, portAc: f.portAc, daemonCanli: () => true, pano })
    expect(f.cagrilar.injection.map((c) => c[0])).toEqual([['01A'], ['01A']])
  })

  it('IPC dusunce satirlar ISARETLENMEZ; sonraki Stop yeniden dener (kayip yok)', async () => {
    const pano = defterKur([{ id: '01A', metin: DERS_A }], Date.now())
    const bozuk = sahtePort([], { enjeksiyon: true })
    const r1 = await M.sayacTopla({ girdi: { session_id: OTURUM }, portAc: bozuk.portAc, daemonCanli: () => true, pano })
    expect(r1.sayilan).toBe(0)
    expect(D.oku(OTURUM, { pano }).satirlar[0].sayildi, 'basarisiz yazim "sayildi" diye isaretlendi').toBe(false)
    const saglam = sahtePort()
    const r2 = await M.sayacTopla({ girdi: { session_id: OTURUM }, portAc: saglam.portAc, daemonCanli: () => true, pano })
    expect(r2.sayilan).toBe(1)
    expect(saglam.cagrilar.injection).toHaveLength(1)
  })

  it('daemon canli degilse hicbir sey yazilmaz ve satirlar SAYILMAMIS kalir', async () => {
    const pano = defterKur([{ id: '01A', metin: DERS_A }], Date.now())
    const f = sahtePort()
    const r = await M.sayacTopla({ girdi: { session_id: OTURUM }, portAc: f.portAc, daemonCanli: () => false, pano })
    expect(r.durum).toBe('daemon-yok')
    expect(f.portAcSayisi()).toBe(0)
    expect(D.oku(OTURUM, { pano }).satirlar[0].sayildi).toBe(false)
  })
})

describe('INV-HAFIZA-ENJEKSIYONU-6 · Stop: eslesme yoksa recordUse CAGRILMAZ; varsa YALNIZ eslesen ID', () => {
  it('eslesme YOK → recordUse hic cagrilmaz (enjeksiyon yine sayilir)', async () => {
    const t = Date.now()
    const pano = defterKur([{ id: '01A', metin: DERS_A }], t)
    const yol = transkriptYaz([{ t: t + 5000, text: 'Bugun hava cok guzel, yarin sahile gidelim ve dondurma yiyelim.' }])
    const f = sahtePort()
    const r = await M.sayacTopla({
      girdi: { session_id: OTURUM, transcript_path: yol },
      portAc: f.portAc,
      daemonCanli: () => true,
      pano,
    })
    expect(r.durum).toBe('tamam')
    expect(f.cagrilar.injection).toHaveLength(1)
    expect(f.cagrilar.use, 'eslesme yokken recordUse cagrildi').toHaveLength(0)
  })

  it('eslesme VAR → recordUse YALNIZ eslesen ID ile; ikinci Stop ayni kullanimi YENIDEN saymaz', async () => {
    const t = Date.now()
    const pano = defterKur(
      [
        { id: '01A', metin: DERS_A },
        { id: '01B', metin: DERS_B },
      ],
      t,
    )
    // asistan A dersini kullaniyor (ilk 80 karakter ifadesi), B'ye hic dokunmuyor
    const yol = transkriptYaz([
      { t: t + 5000, text: `Kural su: ${DERS_A.slice(0, 100)} — bu yuzden merge etmiyorum.` },
      { t: t + 6000, text: 'Ilgisiz baska bir cumle.' },
    ])
    const f = sahtePort()
    const kos = () =>
      M.sayacTopla({ girdi: { session_id: OTURUM, transcript_path: yol }, portAc: f.portAc, daemonCanli: () => true, pano })
    const r = await kos()
    expect(r.kullanilan).toBe(1)
    expect(f.cagrilar.use).toHaveLength(1)
    expect(f.cagrilar.use[0][0], 'eslesmeyen ID de kullanildi sayildi').toEqual(['01A'])
    expect(f.cagrilar.use[0][1]).toBe('claude_code_transcript')
    expect(f.cagrilar.use[0][2]).toBe(OTURUM)
    const satirlar = D.oku(OTURUM, { pano }).satirlar
    expect(satirlar.find((s) => s.id === '01A')?.kullanildi).toBe(true)
    expect(satirlar.find((s) => s.id === '01B')?.kullanildi).toBe(false)

    await kos()
    expect(f.cagrilar.use, 'ayni kullanim ikinci kez sayildi').toHaveLength(1)
  })

  it('enjeksiyondan ONCE yazilmis asistan metni kullanim SAYILMAZ (zaman damgasi)', async () => {
    const t = Date.now()
    const pano = defterKur([{ id: '01A', metin: DERS_A }], t)
    const yol = transkriptYaz([{ t: t - 60_000, text: DERS_A }])
    const f = sahtePort()
    await M.sayacTopla({ girdi: { session_id: OTURUM, transcript_path: yol }, portAc: f.portAc, daemonCanli: () => true, pano })
    expect(f.cagrilar.use).toHaveLength(0)
  })

  it('yalniz asistan `text` bloklari taranir: kullanici metni ve arac sonucu eslesme uretmez', async () => {
    const t = Date.now()
    const pano = defterKur([{ id: '01A', metin: DERS_A }], t)
    const yol = transkriptYaz([{ t: t + 1000, text: DERS_A, rol: 'user' }])
    const f = sahtePort()
    await M.sayacTopla({ girdi: { session_id: OTURUM, transcript_path: yol }, portAc: f.portAc, daemonCanli: () => true, pano })
    expect(f.cagrilar.use).toHaveLength(0)
  })

  it('⛔TURKCE `İ`: buyuk noktali İ ve aksanli harfler eslesmeyi KACIRMAZ (ASCII ders ↔ aksanli asistan)', () => {
    const dersMetni = 'Istanbul deposu Izmir subesi sevkiyat Iskenderun limani kontrol kaydi tutulur'
    const asistan = 'İstanbul deposu İzmir şubesi sevkiyat İskenderun limanı kontrol kaydı tutulur.'
    expect(M.eslesirMi(dersMetni, asistan)).toBe(true)
    // ve tersi: aksanli/İ'li ders, ASCII asistan
    expect(M.eslesirMi(asistan, dersMetni.toLowerCase())).toBe(true)
    // ⭐AYIRT EDEN VAKA: belirteclerin TAMAMI `İ` ile basliyor. Kural ham `toLowerCase` ile
    // kalsaydi "İzmir" → "i"+U+0307+"zmir" olur, belirtec "zmir"e bolunur ve ortusme SIFIR olurdu
    // (yukaridaki cumlede diger sozcukler acigi kapattigi icin o vaka bunu yakalamaz).
    expect(
      M.eslesirMi('İstanbul İzmir İskenderun İnegöl İstiklal İzmit', 'istanbul izmir iskenderun inegol istiklal izmit'),
    ).toBe(true)
    // alakasiz metin eslesmez (kural her seyi kabul etmiyor)
    expect(M.eslesirMi(dersMetni, 'Bugun hava cok guzel, sahilde yuruyus yaptik ve cay ictik.')).toBe(false)
  })

  it('belirtec ortusmesi kurali: >=3 ortak ve >=%50; 4 belirecten az ders hic eslesmez; ID gecmesi yeter', () => {
    const dersMetni = 'migration merge onayi prod veritabani uygulandi kayit'
    expect(M.eslesirMi(dersMetni, 'migration merge onayi prod veritabani bekliyor')).toBe(true)
    expect(M.eslesirMi(dersMetni, 'migration ile ilgisiz uzun bir baska konu anlatiyorum burada cok kelime var')).toBe(false)
    expect(M.eslesirMi('kisa ders', 'kisa ders')).toBe(false)
    expect(M.eslesirMi(dersMetni, 'aciklama: 01ARZ3NDEKTSV4RRFFQ69G5FAV bu kayit', '01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(true)
  })
})

// ── INV-7: hijyen ─────────────────────────────────────────────────────────────

describe('INV-HAFIZA-ENJEKSIYONU-7 · hijyen: yedek yoksa CAGRILMAZ; purgeDeletedAfterDays HICBIR cagrida yok', () => {
  function saat(): { simdi: () => number; bekle: (ms: number) => Promise<void> } {
    let t = 1_000_000
    return {
      simdi: () => t,
      bekle: async (ms) => {
        t += ms
      },
    }
  }

  it('yedek taze DEGILSE (bekleme suresi dolunca) hijyen cagrilmaz ve sebep loga yazilir', async () => {
    const f = sahtePort()
    const log: string[] = []
    const s = saat()
    const r = await M.hijyenKos({
      portAc: f.portAc,
      daemonCanli: () => true,
      yedekTaze: () => false,
      log: (x) => log.push(x),
      bekle: s.bekle,
      simdi: s.simdi,
    })
    expect(r.durum).toBe('yedek-yok')
    expect(f.cagrilar.hygiene, 'yedeksiz hijyen kosuldu').toHaveLength(0)
    expect(f.portAcSayisi()).toBe(0)
    expect(log.join('\n')).toMatch(/ATLANDI/)
    expect(log.join('\n')).toMatch(/yedek/i)
  })

  it('yedek beklerken taze olursa (paralel yedek kancasi) hijyen KOSAR', async () => {
    const f = sahtePort()
    const s = saat()
    let bakis = 0
    const r = await M.hijyenKos({
      portAc: f.portAc,
      daemonCanli: () => true,
      yedekTaze: () => ++bakis >= 3,
      log: () => {},
      bekle: s.bekle,
      simdi: s.simdi,
    })
    expect(r.durum).toBe('tamam')
    expect(f.cagrilar.hygiene).toHaveLength(1)
  })

  it('yedek taze → hijyen TEK kez cagrilir, secenekte purgeDeletedAfterDays YOK, rapor ozeti loga yazilir', async () => {
    const f = sahtePort()
    const log: string[] = []
    const s = saat()
    const r = await M.hijyenKos({
      portAc: f.portAc,
      daemonCanli: () => true,
      yedekTaze: () => true,
      log: (x) => log.push(x),
      bekle: s.bekle,
      simdi: s.simdi,
    })
    expect(r.durum).toBe('tamam')
    expect(f.cagrilar.hygiene).toHaveLength(1)
    const secenek = f.cagrilar.hygiene[0] as Record<string, unknown>
    expect(Object.keys(secenek ?? {})).not.toContain('purgeDeletedAfterDays')
    expect(log.join('\n')).toMatch(/superseded 2/)
    expect(log.join('\n')).toMatch(/bayat 3/)
  })

  it('KAYNAKTA purgeDeletedAfterDays yalniz aciklama satirlarinda gecer (fiziksel silme yok)', () => {
    const kodSatirlari = MODUL_KAYNAK.split('\n').filter((s) => {
      const t = s.trim()
      return !(t.startsWith('*') || t.startsWith('//') || t.startsWith('/*'))
    })
    expect(kodSatirlari.filter((s) => s.includes('purgeDeletedAfterDays'))).toEqual([])
    expect(MODUL_KAYNAK).toContain('purgeDeletedAfterDays')
  })

  it('daemon canli degilse hijyen cagrilmaz ve sebep loga yazilir', async () => {
    const f = sahtePort()
    const log: string[] = []
    const s = saat()
    const r = await M.hijyenKos({
      portAc: f.portAc,
      daemonCanli: () => false,
      yedekTaze: () => true,
      log: (x) => log.push(x),
      bekle: s.bekle,
      simdi: s.simdi,
    })
    expect(r.durum).toBe('daemon-yok')
    expect(f.cagrilar.hygiene).toHaveLength(0)
    expect(log.join('\n')).toMatch(/daemon/i)
  })
})

// ── INV-8: hata yolu ──────────────────────────────────────────────────────────

describe('INV-HAFIZA-ENJEKSIYONU-8 · ag/IPC hatasi: firlatmaz, cikis 0, stdout bos', () => {
  it('arama IPC hatasi → bos cikti, deftere YAZILMAZ, istisna yok', async () => {
    const f = sahtePort([], { arama: true })
    const pano = geciciDizin('hata')
    const cikti = await M.konuEnjekte({
      girdi: { prompt: MIGRATION_ISTEMI, session_id: 'oturum-hata-0001' },
      portAc: f.portAc,
      daemonCanli: () => true,
      pano,
    })
    expect(cikti).toBe('')
    expect(D.oku('oturum-hata-0001', { pano }).satirlar).toHaveLength(0)
  })

  it('port acilamazsa (null) ve portAc firlatirsa konu kolu SESSIZ', async () => {
    const pano = geciciDizin('hata2')
    const girdi = { prompt: MIGRATION_ISTEMI, session_id: 'oturum-hata-0002' }
    expect(await M.konuEnjekte({ girdi, portAc: async () => null, daemonCanli: () => true, pano })).toBe('')
    expect(
      await M.konuEnjekte({
        girdi,
        portAc: async () => {
          throw new Error('baglanti reddedildi')
        },
        daemonCanli: () => true,
        pano,
      }),
    ).toBe('')
  })

  it('sayac ve hijyen kollari IPC hatasinda FIRLATMAZ', async () => {
    const pano = defterKur([{ id: '01A', metin: DERS_A }], Date.now())
    const bozuk = sahtePort([], { enjeksiyon: true, kullanim: true, hijyen: true })
    const r = await M.sayacTopla({ girdi: { session_id: OTURUM }, portAc: bozuk.portAc, daemonCanli: () => true, pano })
    expect(['tamam', 'hata']).toContain(r.durum)
    const log: string[] = []
    const h = await M.hijyenKos({
      portAc: bozuk.portAc,
      daemonCanli: () => true,
      yedekTaze: () => true,
      log: (x) => log.push(x),
      bekle: async () => {},
      simdi: () => 0,
    })
    expect(h.durum).toBe('hata')
    expect(log.join('\n')).toMatch(/HATA/)
  })

  it('zamanAsimi: yavas is ZAMAN_ASIMI dondurur (kanca sessiz cikar), hizli is sonucunu verir', async () => {
    const yavas = new Promise((coz) => setTimeout(() => coz('gec'), 200))
    expect(await M.zamanAsimi(yavas, 20)).toBe(M.ZAMAN_ASIMI)
    expect(await M.zamanAsimi(Promise.resolve('hizli'), 200)).toBe('hizli')
  })

  it.each([
    ['konu', KANCA_KONU, '{"session_id":"x","prompt":"migration merge edildi prod veritabanina uygulandi mi"}'],
    ['konu-bozuk-stdin', KANCA_KONU, '{bozuk'],
    ['konu-bos-stdin', KANCA_KONU, ''],
    ['sayac', KANCA_SAYAC, '{"session_id":"x","transcript_path":"/yok/yok.jsonl"}'],
    ['sayac-bozuk-stdin', KANCA_SAYAC, 'bozuk'],
    ['hijyen', KANCA_HIJYEN, '{}'],
  ])('GERCEK KANCA (%s): daemon/sage yokken cikis 0, stdout BOS', (_ad, kanca, girdi) => {
    const kok = geciciDizin('gk')
    const r = spawnSync(process.execPath, [kanca], {
      input: girdi,
      encoding: 'utf8',
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: kok,
        VENTHUB_BOARD_DIR: geciciDizin('gk-pano'),
        VENTHUB_SAGE_YEDEK_DIZINI: geciciDizin('gk-yedek'),
      },
      timeout: 60_000,
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })
})

// ── INV-9: dosya dersi defteri ────────────────────────────────────────────────

interface SqliteDb {
  exec: (s: string) => void
  prepare: (s: string) => { run: (...a: unknown[]) => void }
  close: () => void
}

function dosyaDersiDepoKur(): string {
  const kok = geciciDizin('dosyaders')
  fs.mkdirSync(path.join(kok, '.wrongstack', 'memories'), { recursive: true })
  fs.mkdirSync(path.join(kok, 'src', 'lib'), { recursive: true })
  fs.writeFileSync(path.join(kok, 'src', 'lib', 'hedef.ts'), 'export const x = 1\n', 'utf8')
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  const { DatabaseSync } = require_('node:sqlite') as { DatabaseSync: new (p: string) => SqliteDb }
  const db = new DatabaseSync(path.join(kok, '.wrongstack', 'memories', 'sage.db'))
  db.exec(`create table memories (
    id TEXT PRIMARY KEY, data TEXT NOT NULL, status TEXT NOT NULL, kind TEXT NOT NULL,
    scope TEXT NOT NULL, legacy_scope TEXT, importance REAL NOT NULL, confidence REAL NOT NULL,
    freshness REAL NOT NULL, updated_at TEXT NOT NULL, created_at TEXT NOT NULL,
    audience TEXT, tags TEXT, owner_session_id TEXT, canonical_text TEXT NOT NULL DEFAULT '')`)
  db.prepare(
    `insert into memories (id,data,status,kind,scope,importance,confidence,freshness,updated_at,created_at)
     values (?,?,'active','bug_root_cause','project',0.9,0.9,1,'2026-09-18','2026-09-18')`,
  ).run(
    '01DOSYADERSI',
    JSON.stringify({ text: 'DOSYA DERSI: bu dosyada tek is soylenir.', anchors: [{ type: 'file', path: 'src/lib/hedef.ts' }] }),
  )
  db.close()
  return kok
}

describe("INV-HAFIZA-ENJEKSIYONU-9 · dosya dersi kancasi BASTIGI ders ID'sini deftere yazar, ciktisi degismez", () => {
  it('gercek kanca: ders basilir, defterde kaynak:dosya + ID var; ikinci dokunus ne basar ne yazar; compact sonrasi nesil-1 dosyasina yazar', () => {
    const kok = dosyaDersiDepoKur()
    const pano = geciciDizin('dosyapano')
    const hedef = path.join(kok, 'src', 'lib', 'hedef.ts')
    const kos = (oturum: string) =>
      spawnSync(process.execPath, [KANCA_DOSYA], {
        input: JSON.stringify({ session_id: oturum, tool_name: 'Read', tool_input: { file_path: hedef } }),
        encoding: 'utf8',
        env: { ...process.env, CLAUDE_PROJECT_DIR: kok, VENTHUB_BOARD_DIR: pano },
        timeout: 30_000,
      })
    const bir = kos('oturum-dosya-0001')
    expect(bir.status).toBe(0)
    expect(bir.stdout).toContain('DOSYA DERSI: bu dosyada tek is soylenir.')
    let satirlar = D.oku('oturum-dosya-0001', { pano }).satirlar
    expect(satirlar.map((s) => [s.id, s.kaynak])).toEqual([['01DOSYADERSI', 'dosya']])

    const iki = kos('oturum-dosya-0001')
    expect(iki.stdout, 'ikinci dokunusta ders yeniden basildi').toBe('')
    expect(D.oku('oturum-dosya-0001', { pano }).satirlar, 'basilmayan ders deftere yazildi').toHaveLength(1)

    // compact: nesil artar → ders tekrar gorunur ve YENI nesil dosyasina yazilir
    fs.writeFileSync(path.join(pano, '.sage-dersi-nesil-oturum-dosya-0001'), '1', 'utf8')
    const uc = kos('oturum-dosya-0001')
    expect(uc.stdout).toContain('DOSYA DERSI')
    expect(fs.existsSync(D.defterYolu('oturum-dosya-0001', 1, pano)), 'nesil-1 defteri yok').toBe(true)
    satirlar = D.oku('oturum-dosya-0001', { pano }).satirlar
    expect(satirlar.map((s) => s.nesil).sort()).toEqual([0, 1])
  })

  it('bicimlendir ciktisi bicimlendirAyrintili.metin ile BIREBIR ayni; butceye sigmayan ders "basilan" listesinde yok', () => {
    const dosyaDersi = require_(path.join(KOK, 'scripts', 'hijyen', 'sage-dosya-dersi.cjs')) as {
      TOPLAM_KARAKTER: number
      bicimlendir: (g: string, d: unknown[]) => string
      bicimlendirAyrintili: (g: string, d: unknown[]) => { metin: string; basilan: { id: string }[] }
    }
    const d = (id: string, uzunluk: number) => ({ id, kind: 'fact', puan: 1, metin: id + ' ' + 'x'.repeat(uzunluk) })
    const dersler = [d('a', 1500), d('b', 1500), d('c', 100)]
    const a = dosyaDersi.bicimlendirAyrintili('src/x.ts', dersler)
    expect(a.metin).toBe(dosyaDersi.bicimlendir('src/x.ts', dersler))
    expect(a.basilan.map((x) => x.id)).toEqual(['a', 'c'])
    expect(a.metin).toMatch(/1 ders daha var/)
  })
})

// ── INV-10: settings.json kaydı ───────────────────────────────────────────────

interface Ayar {
  hooks: Record<string, { matcher: string; hooks: { command: string; timeout?: number; async?: boolean }[] }[]>
}

describe("INV-HAFIZA-ENJEKSIYONU-10 · kancalar settings.json'a BAGLI (dosya olarak var ≠ tetik olarak var)", () => {
  const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8')) as Ayar
  const komutlar = (olay: string): { ad: string; timeout?: number; async?: boolean }[] =>
    (ayar.hooks[olay] ?? []).flatMap((g) =>
      g.hooks.map((h) => ({ ad: path.basename(h.command.replace(/["]/g, '')), timeout: h.timeout, async: h.async })),
    )

  it('UserPromptSubmit → hafiza-enjeksiyonu (timeout > butce)', () => {
    const k = komutlar('UserPromptSubmit').find((x) => x.ad === 'hafiza-enjeksiyonu.cjs')
    expect(k, 'konu kancasi UserPromptSubmit e bagli degil').toBeDefined()
    expect((k?.timeout ?? 0) * 1000).toBeGreaterThan(M.KONU_BUTCE_MS)
  })

  it('Stop → hafiza-kullanim-sayaci (async, timeout > 20 sn butce)', () => {
    const k = komutlar('Stop').find((x) => x.ad === 'hafiza-kullanim-sayaci.cjs')
    expect(k, 'sayac kancasi Stop a bagli degil').toBeDefined()
    expect(k?.async).toBe(true)
    expect((k?.timeout ?? 0) * 1000).toBeGreaterThan(M.SAYAC_BUTCE_MS)
  })

  it('SessionEnd → sage-hijyen, sage-yedek ten SONRA siralanmis (timeout > 60 sn butce)', () => {
    const l = komutlar('SessionEnd')
    const yedek = l.findIndex((x) => x.ad === 'sage-yedek-oturum-sonu.cjs')
    const hijyen = l.findIndex((x) => x.ad === 'sage-hijyen-oturum-sonu.cjs')
    expect(yedek, 'yedek kancasi SessionEnd de yok').toBeGreaterThanOrEqual(0)
    expect(hijyen, 'hijyen kancasi SessionEnd e bagli degil').toBeGreaterThan(yedek)
    expect((l[hijyen].timeout ?? 0) * 1000).toBeGreaterThan(M.HIJYEN_BUTCE_MS)
  })

  it('butce sayilari degeriyle (yorumda kalan butce butce degildir)', () => {
    expect(M.KONU_BUTCE_MS).toBe(2500)
    expect(M.SAYAC_BUTCE_MS).toBe(20_000)
    expect(M.HIJYEN_BUTCE_MS).toBe(60_000)
    expect(M.YEDEK_TAZE_SAAT).toBe(24)
  })
})

// ── INV-11: konu kancası sage'e YAZMAZ ────────────────────────────────────────

describe("INV-HAFIZA-ENJEKSIYONU-11 · konu kolu sayac YAZMAZ (yalniz Stop yazar) ve sage sqlite'a dogrudan dokunmaz", () => {
  it('konuEnjekte recordInjection/recordUse/hygiene cagirmaz', async () => {
    const f = sahtePort([ders('01AAA', MIGRATION_DERSI)])
    await M.konuEnjekte({
      girdi: { prompt: MIGRATION_ISTEMI, session_id: 'oturum-yazma-0001' },
      portAc: f.portAc,
      daemonCanli: () => true,
      pano: geciciDizin('yazma'),
    })
    expect(f.cagrilar.injection).toHaveLength(0)
    expect(f.cagrilar.use).toHaveLength(0)
    expect(f.cagrilar.hygiene).toHaveLength(0)
  })

  it('modul kaynaginda dogrudan sqlite yazimi yok (daemon tek-yazar zinciri disina cikilmaz)', () => {
    const kod = MODUL_KAYNAK.split('\n')
      .filter((s) => !/^\s*(\*|\/\/|\/\*)/.test(s))
      .join('\n')
    expect(kod).not.toMatch(/node:sqlite|DatabaseSync|UPDATE\s+memories|INSERT\s+INTO/i)
    expect(kod, 'kanca daemon spawn etmemeli').not.toMatch(/initialize\s*\(|spawn\s*\(|execFile/)
  })
})

// ── INV-12: eşleştirme kuralı paritesi (yalnız sage kuruluysa) ─────────────────

describe('INV-HAFIZA-ENJEKSIYONU-12 · eslestirme kurali yukari akim InjectionTracker ile ayni hukmu verir', () => {
  const sageYolu = ((): string | null => {
    // Ana ağaç: bu test worktree'de de koşar; sage paketi yalnız ana ağaçta kurulu.
    const r = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd: KOK,
      encoding: 'utf8',
    })
    const ortak = (r.stdout ?? '').trim()
    if (!ortak) return null
    const yol = path.join(
      path.dirname(ortak),
      'tools',
      'wrongstack-mcp',
      'node_modules',
      '@wrongstack',
      'sage',
      'dist',
      'index.js',
    )
    return fs.existsSync(yol) ? yol : null
  })()

  it.skipIf(sageYolu === null)(
    'ASCII girdilerde yerel kural = InjectionTracker.consumeMatches (kurulu sage ile)',
    async () => {
      process.removeAllListeners('warning')
      process.on('warning', () => {})
      const sage = (await import(pathToFileURL(sageYolu as string).href)) as {
        InjectionTracker: new () => {
          record: (id: string, text: string, now?: number, sid?: string) => void
          consumeMatches: (text: string, now?: number, sid?: string) => string[]
        }
      }
      const dersMetni = 'migration merge onayi prod veritabani uygulandi kayit'
      const vakalar: [string, string][] = [
        ['migration merge onayi prod veritabani bekliyor', 'ortusme'],
        ['migration ile ilgisiz uzun bir baska konu anlatiyorum burada cok kelime var', 'az-ortusme'],
        [`bak: ${dersMetni} tam metin`, 'ilk-80-karakter'],
        ['hic alakasiz bir cumle', 'alakasiz'],
        ['migration prod', 'iki-ortak'],
      ]
      for (const [asistan, ad] of vakalar) {
        const t = new sage.InjectionTracker()
        t.record('01X', dersMetni, 0, 's')
        const yukariAkim = t.consumeMatches(asistan, 1, 's').includes('01X')
        expect(M.eslesirMi(dersMetni, asistan, '01X'), `vaka "${ad}" yukari akimdan AYRISTI`).toBe(yukariAkim)
      }
    },
  )
})
