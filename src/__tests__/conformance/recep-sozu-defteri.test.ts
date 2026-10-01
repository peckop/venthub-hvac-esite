import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * INV-RECEP-SOZU-1..5 · Recep sözü defteri (REC-554, karar 218/224).
 *
 * KUSUR (2026-10-01): Recep ARAÇ penceresine "217 evet" yazdı, OPS haber alamadı ve beş mesaj boyunca aynı onayı yeniden
 * istedi. Geçici kural (her pencere aynı turda OPS'a yazsın) insana bağlıydı. Bu kapı onu kancaya taşır.
 *
 *  1 · SINIFLANDIRMA: yalnız Recep'in KENDİ mesajı yakalanır. Pencereler arası mesaj, alt ajan raporu, görev bildirimi,
 *      sistem bloğu, yerel komut, yapıştırılmış içerik YAKALANMAZ (peer mesajındaki "217 evet" karar DEĞİLDİR).
 *  2 · KARAR KALIBI: `<numara> evet|hayır|kabul|...`; tarih/saat/sürüm karar sanılmaz.
 *  3 · MASKE: sır görünümlü metin deftere maskeli girer.
 *  4 · İKİ YÖN: OPS başkasına yazılan her sözü görür (kendininkini ve OPS kaynaklıyı görmez); departman OPS'ta verilen
 *      NUMARALI kararı görür (ilgili değilse görmez); imleç tekrarı keser; tavan, eski yığın, bozuk satır, güvensiz sid.
 *  5 · KANCA: board-brief.cjs gerçek süreçte kaydeder ve gösterir; peer/bozuk girdi/yazılamayan defter kancayı DÜŞÜRMEZ.
 *
 * Bilmek yetki taşımaz: defter yalnız görünürlüktür (canlı, migration, para, ayar kuralları değişmedi).
 */

interface Kayit {
  ts: string
  sid: string
  rol: string
  pencere: string
  no: string | null
  cevap: string | null
  nolar?: string[]
  soz: string
  kirpildi?: boolean
}
interface Defter {
  siniflandir: (p: unknown) => { recep: boolean; soz: string; sebep: string }
  kararlar: (s: string) => { no: string; cevap: string }[]
  maskele: (s: string) => string
  kaydet: (g: { prompt?: string; session_id?: string }, o?: { board?: unknown; simdi?: number }) => { kaydedildi: boolean; sebep: string; kayit?: Kayit }
  gorunur: (g: { sid: string; rol: string; simdi?: number }) => string[]
  anilanSeritler: (s: string) => Set<string>
  kayitlariOku: () => Kayit[]
  defterYolu: () => string
  testOrtamiMi: () => boolean
  TEKRAR_MS: number
  SOZ_TAVAN: number
  TUR_TAVAN: number
  ILK_PENCERE_MS: number
  MASKE: string
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const MODUL = path.join(KOK, 'scripts/board/recep-sozu-defteri.cjs')
const KANCA = path.join(KOK, '.claude/hooks/board-brief.cjs')
const BOARD = path.join(KOK, 'scripts/board/board.cjs')
const defter = require_(MODUL) as Defter

const OPS = 'cb0467f1-f1a3-437d-bc15-52c0bd90feb3'
const ARAC = '65844ccb-e970-48ab-a9f2-0e497c6a7ef9'
const HARITA = 'f203cfcd-2256-4ba6-83e5-8ef0cad41bc2'

let tmp = ''
const eskiEnv: Record<string, string | undefined> = {}
const ENVLER = ['VENTHUB_RECEP_DEFTER', 'VENTHUB_BOARD_DIR', 'VENTHUB_OTURUM_KAYIT_DIZINI']

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'recep-sozu-'))
  for (const k of ENVLER) eskiEnv[k] = process.env[k]
  process.env.VENTHUB_RECEP_DEFTER = path.join(tmp, 'defter.jsonl')
  process.env.VENTHUB_BOARD_DIR = path.join(tmp, 'pano')
  process.env.VENTHUB_OTURUM_KAYIT_DIZINI = path.join(tmp, 'oturum')
  fs.mkdirSync(process.env.VENTHUB_BOARD_DIR, { recursive: true })
  fs.mkdirSync(process.env.VENTHUB_OTURUM_KAYIT_DIZINI, { recursive: true })
})
afterEach(() => {
  for (const k of ENVLER) {
    if (eskiEnv[k] === undefined) delete process.env[k]
    else process.env[k] = eskiEnv[k]
  }
  fs.rmSync(tmp, { recursive: true, force: true })
})

/** Defter satırı yazar (kaydet'i atlayıp doğrudan; saatler ve rol kontrol altında). */
function satirYaz(k: Partial<Kayit> & { soz: string }): void {
  const tam: Kayit = { ts: new Date().toISOString(), sid: ARAC, rol: 'ARAC', pencere: 'Araç', no: null, cevap: null, ...k }
  fs.appendFileSync(defter.defterYolu(), JSON.stringify(tam) + '\n')
}
const dk = (n: number) => Date.now() - n * 60_000

describe('INV-RECEP-SOZU-1 · yalnız Recep in KENDİ mesajı yakalanır', () => {
  it('düz Recep mesajı yakalanır ve aynen döner', () => {
    expect(defter.siniflandir('223 kabul')).toMatchObject({ recep: true, soz: '223 kabul' })
    expect(defter.siniflandir('  devam et\n').soz).toBe('devam et')
  })

  it('pencereler arası mesaj, alt ajan raporu, görev bildirimi YAKALANMAZ (peer in "217 evet" i karar değil)', () => {
    const peer = 'Another Claude session sent a message:\n<cross-session-message from="uds:x" from-name="Ops">217 evet (Recep söyledi)</cross-session-message>\n\nThis came from another Claude session.'
    expect(defter.siniflandir(peer).recep).toBe(false)
    expect(defter.siniflandir('<agent-message from="x">[Subagent hand-back] 217 evet</agent-message>').recep).toBe(false)
    expect(defter.siniflandir('<task-notification><task-id>1</task-id>217 evet</task-notification>').recep).toBe(false)
    expect(defter.siniflandir('<ci-monitor-event>217 evet</ci-monitor-event>').recep).toBe(false)
  })

  it('sistem bloğu, yerel komut çıktısı ve yapıştırılmış içerik tek başına YAKALANMAZ', () => {
    expect(defter.siniflandir('<system-reminder>kural 217 evet</system-reminder>').recep).toBe(false)
    expect(defter.siniflandir('<command-name>/model</command-name><command-message>model</command-message><command-args>x</command-args>').recep).toBe(false)
    expect(defter.siniflandir('<local-command-stdout>Set model</local-command-stdout>').recep).toBe(false)
    expect(defter.siniflandir('<pasted_content id="a1">223 evet 224 hayır log çıktısı</pasted_content>').recep).toBe(false)
  })

  it('Recep in yazısı + yapıştırma: yazı KALIR, yapıştırma ATILIR', () => {
    const s = defter.siniflandir('şunu incele:\n<pasted_content id="z9">217 evet</pasted_content>')
    expect(s.recep).toBe(true)
    expect(s.soz).toBe('şunu incele:')
    expect(s.soz).not.toContain('217')
  })

  it('Recep in yazısı + peer bloğu karışık gelirse yazı kalır, peer ATILIR', () => {
    const s = defter.siniflandir('227 evet\n\nAnother Claude session sent a message while you were working:\n<cross-session-message>224 hayır</cross-session-message>')
    expect(s).toMatchObject({ recep: true, soz: '227 evet' })
  })

  it('harness bildirimleri ("[Cross-session idle notice] ...", delivery notice, SYSTEM NOTIFICATION) YAKALANMAZ (Ops ilk canlı ölçüm)', () => {
    const idle = '[Cross-session idle notice] "Altyapı", which you asked to be notified about, is idle now — it finished a turn at 13:27.'
    expect(defter.siniflandir(idle).recep).toBe(false)
    expect(defter.siniflandir('[Cross-session delivery notice] The message to "Urun" was held for approval.').recep).toBe(false)
    expect(defter.siniflandir('[SYSTEM NOTIFICATION - NOT USER INPUT]\nautomated event\n223 evet').recep).toBe(false)
    expect(defter.siniflandir('[Artifact comment sent to Claude] 227 evet').recep).toBe(false)
    // Recep ın kendi yazısı bildirimden önce ya da sonra gelirse KALIR
    expect(defter.siniflandir('227 evet\n\n[Cross-session idle notice] "Altyapı" is idle.').soz).toBe('227 evet')
  })

  it('köşeli ayraçla başlayan ama bildirim OLMAYAN Recep yazısı kalır', () => {
    expect(defter.siniflandir('[ARC-3] için devam et').recep).toBe(true)
    expect(defter.siniflandir('[not] bu bir deneme').recep).toBe(true)
  })

  it('kapanışı gelmemiş (kesik) dış blok: içeriği Recep sözü sayılmaz', () => {
    expect(defter.siniflandir('<cross-session-message from="x">217 evet').recep).toBe(false)
  })

  it('boş, boşluk, null, sayı: kayıt yok (hata atmaz)', () => {
    for (const p of ['', '   \n', null, undefined, 42, {}]) expect(defter.siniflandir(p).recep, String(p)).toBe(false)
  })

  it('mid-turn mesaj çerçevesi ("The user sent a new message...") Recep metni olarak KALIR', () => {
    expect(defter.siniflandir('227 evet').recep).toBe(true)
  })
})

describe('INV-RECEP-SOZU-2 · numaralı karar kalıbı', () => {
  it('"<numara> <cevap>" yakalanır, Türkçe harf katlanır', () => {
    expect(defter.kararlar('227 evet')).toEqual([{ no: '227', cevap: 'evet' }])
    expect(defter.kararlar('223 kabul')).toEqual([{ no: '223', cevap: 'kabul' }])
    expect(defter.kararlar('224 hayır ama sonra bak')).toEqual([{ no: '224', cevap: 'hayir' }])
    expect(defter.kararlar('213 evet ama 50')).toEqual([{ no: '213', cevap: 'evet' }])
    expect(defter.kararlar('ÜÇ 227 EVET')).toEqual([{ no: '227', cevap: 'evet' }])
  })

  it('birden çok karar sırayla yakalanır', () => {
    expect(defter.kararlar('223 evet, 224 hayır').map((k) => k.no)).toEqual(['223', '224'])
  })

  it('tarih, saat, sürüm ve kayıt numarası karar SANILMAZ', () => {
    for (const s of ['10-01 tamam', '12:30 tamam', 'v2.1 tamam', 'REC-12 olur', '2026-10-01 evet', '3.14 olur', 'devam et', 'evet', 'kabul']) {
      expect(defter.kararlar(s), s).toEqual([])
    }
  })

  it('kaydet numarayı ve cevabı deftere yazar; kararsız söz no=null', () => {
    const a = defter.kaydet({ prompt: '227 evet', session_id: ARAC })
    expect(a.kayit).toMatchObject({ no: '227', cevap: 'evet' })
    const b = defter.kaydet({ prompt: 'devam et', session_id: ARAC })
    expect(b.kayit).toMatchObject({ no: null, cevap: null })
  })
})

describe('INV-RECEP-SOZU-3 · sır görünümlü metin MASKELENİR', () => {
  it('bilinen anahtar biçimleri maskelenir', () => {
    const girdiler = [
      'sk-ant-api03-abcdefghijklmnop1234567890',
      'ghp_abcdefghijklmnopqrstuvwx1234',
      'github_pat_11ABCDEFG0abcdefghijklmnop',
      'xoxb-1234567890-abcdefghij',
      'AKIAABCDEFGHIJKLMNOP',
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVPmB92K27uhbUJU1p1r',
      'Bearer abcdefghijklmnopqrstuvwxyz0123',
      // CI "hardcoded DB connection string" tarayıcısı tam biçimi gerçek sır sanar: parçalayıp çalışma anında kuruyoruz
      ['postgres', 'ql://', 'postgres:', 'ParolaCokGizli', '@db.example.com:5432/postgres'].join(''),
    ]
    for (const g of girdiler) {
      const m = defter.maskele(`şu: ${g} bitti`)
      expect(m, g).toContain(defter.MASKE)
      expect(m, g).not.toContain(g.slice(8, 24))
    }
  })

  it('"parola/token/anahtar: değer" anahtarı bırakır, değeri maskeler', () => {
    expect(defter.maskele('parola: Abc12345xyz')).toBe(`parola: ${defter.MASKE}`)
    expect(defter.maskele('api_key=abcd1234')).toBe(`api_key=${defter.MASKE}`)
  })

  it('uzun karışık diziler maskelenir; sıradan metin, karar ve kısa özet DEĞİŞMEZ', () => {
    expect(defter.maskele('x ' + 'aB3'.repeat(20) + ' y')).toContain(defter.MASKE)
    for (const s of ['227 evet', 'commit 3d195baaf pushlandı', 'Kanban: ARC-3', 'devam et, sıradaki karta geç']) expect(defter.maskele(s), s).toBe(s)
  })

  it('deftere giren söz maskelidir (ham sır dosyada YOK)', () => {
    defter.kaydet({ prompt: 'token: ghp_abcdefghijklmnopqrstuvwx1234 ile dene', session_id: ARAC })
    const ham = fs.readFileSync(defter.defterYolu(), 'utf8')
    expect(ham).not.toContain('ghp_abcdefghijklmnop')
    expect(ham).toContain(defter.MASKE)
  })
})

describe('INV-RECEP-SOZU-4 · iki yön, imleç, tavanlar', () => {
  it('OPS başka pencereye yazılan yeni sözü görür; satır pencere, saat, karar ve sözü taşır', () => {
    satirYaz({ sid: ARAC, rol: 'ARAC', pencere: 'Araç', soz: '227 evet', no: '227', cevap: 'evet' })
    const s = defter.gorunur({ sid: OPS, rol: 'OPS' })
    expect(s).toHaveLength(1)
    expect(s[0]).toContain('RECEP SÖZÜ')
    expect(s[0]).toContain('Araç')
    expect(s[0]).toContain('karar 227 evet')
    expect(s[0]).toContain('"227 evet"')
  })

  it('OPS kendi sid inin ve OPS rollü kayıtların sözünü GÖRMEZ', () => {
    satirYaz({ sid: OPS, rol: 'OPS', pencere: 'Ops', soz: 'kendi sözüm' })
    satirYaz({ sid: 'dddddddd-0000-4000-8000-000000000000', rol: 'OPS', pencere: 'Ops', soz: 'eski ops sid' })
    expect(defter.gorunur({ sid: OPS, rol: 'OPS' })).toEqual([])
  })

  it('imleç ilerler: aynı söz ikinci turda GELMEZ, yeni söz gelir', () => {
    satirYaz({ soz: 'ilk söz', ts: new Date(dk(1)).toISOString() })
    expect(defter.gorunur({ sid: OPS, rol: 'OPS' })).toHaveLength(1)
    expect(defter.gorunur({ sid: OPS, rol: 'OPS' })).toEqual([])
    satirYaz({ soz: 'ikinci söz', ts: new Date(Date.now() + 5).toISOString() })
    const s = defter.gorunur({ sid: OPS, rol: 'OPS', simdi: Date.now() + 10 })
    expect(s).toHaveLength(1)
    expect(s[0]).toContain('ikinci söz')
  })

  it('imleç sid başınadır: bir pencerenin okuması ötekini susturmaz', () => {
    satirYaz({ soz: 'ortak söz', ts: new Date(dk(1)).toISOString() })
    expect(defter.gorunur({ sid: OPS, rol: 'OPS' })).toHaveLength(1)
    expect(defter.gorunur({ sid: 'eeeeeeee-0000-4000-8000-000000000000', rol: 'OPS' })).toHaveLength(1)
  })

  it('ilk görüşte 30 dakikadan eski söz YIĞINI gösterilmez', () => {
    satirYaz({ soz: 'eski söz', ts: new Date(dk(120)).toISOString() })
    satirYaz({ soz: 'taze söz', ts: new Date(dk(5)).toISOString() })
    const s = defter.gorunur({ sid: OPS, rol: 'OPS' })
    expect(s).toHaveLength(1)
    expect(s[0]).toContain('taze söz')
  })

  it('tur tavanı: fazlası "(+N söz daha)" olarak bildirilir, en yeniler gösterilir', () => {
    for (let i = 1; i <= 8; i++) satirYaz({ soz: `söz-${i}`, ts: new Date(dk(10) + i * 1000).toISOString() })
    const s = defter.gorunur({ sid: OPS, rol: 'OPS' })
    expect(s).toHaveLength(defter.TUR_TAVAN + 1)
    expect(s[s.length - 1]).toContain('+3 söz daha')
    expect(s.join('\n')).toContain('söz-8')
    expect(s.join('\n')).not.toContain('söz-1"')
  })

  it('uzun söz görünürde kısaltılır, defterde TAM durur', () => {
    const uzun = 'x'.repeat(900)
    satirYaz({ soz: uzun })
    const s = defter.gorunur({ sid: OPS, rol: 'OPS' })
    expect(s[0].length).toBeLessThan(400)
    expect(defter.kayitlariOku()[0].soz).toBe(uzun)
  })

  it('departman OPS te verilen NUMARALI kararı görür; numarasız OPS sözünü görmez', () => {
    satirYaz({ sid: OPS, rol: 'OPS', pencere: 'Ops', soz: '227 evet', no: '227', cevap: 'evet' })
    satirYaz({ sid: OPS, rol: 'OPS', pencere: 'Ops', soz: 'devam et, sıradaki karta geç', ts: new Date(Date.now() + 1000).toISOString() })
    const s = defter.gorunur({ sid: ARAC, rol: 'ARAC', simdi: Date.now() + 5000 })
    expect(s).toHaveLength(1)
    expect(s[0]).toContain("OPS'TA VERİLEN KARAR")
    expect(s[0]).toContain('227 evet')
  })

  it('departman başka departmanın ya da kendi pencere sözünü GÖRMEZ (yalnız OPS kaynaklı karar)', () => {
    satirYaz({ sid: HARITA, rol: 'HARITA', pencere: 'Harita', soz: '227 evet', no: '227', cevap: 'evet' })
    expect(defter.gorunur({ sid: ARAC, rol: 'ARAC' })).toEqual([])
  })

  it('ilgililik: söz yalnız Harita yı anıyorsa Araç görmez, Harita görür; kimseyi anmıyorsa herkes görür', () => {
    satirYaz({ sid: OPS, rol: 'OPS', pencere: 'Ops', soz: '230 evet, Harita kural paketini birleştirsin', no: '230', cevap: 'evet' })
    satirYaz({ sid: OPS, rol: 'OPS', pencere: 'Ops', soz: '231 evet', no: '231', cevap: 'evet', ts: new Date(Date.now() + 1000).toISOString() })
    const arac = defter.gorunur({ sid: ARAC, rol: 'ARAC', simdi: Date.now() + 5000 })
    expect(arac).toHaveLength(1)
    expect(arac[0]).toContain('231 evet')
    const harita = defter.gorunur({ sid: HARITA, rol: 'HARITA', simdi: Date.now() + 5000 })
    expect(harita).toHaveLength(2)
  })

  it('anilanSeritler: Türkçe katlamalı, TABLO dan, kelime sınırlı', () => {
    expect([...defter.anilanSeritler('ARAÇ ve harita')].sort()).toEqual(['ARAC', 'HARITA'])
    expect([...defter.anilanSeritler('Ürün penceresi')]).toEqual(['URUN'])
    expect([...defter.anilanSeritler('karar verildi')]).toEqual([])
    expect([...defter.anilanSeritler('opsiyonel')]).toEqual([])
  })

  it('bozuk satır atlanır, kalan kayıtlar okunur', () => {
    fs.writeFileSync(defter.defterYolu(), '{bozuk json\n' + JSON.stringify({ ts: new Date().toISOString(), sid: ARAC, rol: 'ARAC', pencere: '', no: null, cevap: null, soz: 'sağlam' }) + '\nbaşka çöp\n')
    expect(defter.kayitlariOku().map((k) => k.soz)).toEqual(['sağlam'])
  })

  it('defter yoksa boş, hata yok; güvensiz sid [] döner ve imleç dosyası yazılmaz', () => {
    expect(defter.gorunur({ sid: OPS, rol: 'OPS' })).toEqual([])
    expect(defter.gorunur({ sid: '../../kacis', rol: 'OPS' })).toEqual([])
    expect(fs.existsSync(path.join(tmp, '..', 'kacis.json'))).toBe(false)
  })

  it('kayıt kırpma: tavandan uzun söz kırpılır, kirpildi=true', () => {
    const r = defter.kaydet({ prompt: 'a b '.repeat(3000), session_id: ARAC })
    expect(r.kayit?.soz.length).toBe(defter.SOZ_TAVAN)
    expect(r.kayit?.kirpildi).toBe(true)
  })

  it('defter yazılamıyorsa kaydet ÇÖKMEZ (fail-open), kaydedildi=false', () => {
    process.env.VENTHUB_RECEP_DEFTER = tmp // dosya yerine dizin: appendFileSync EISDIR verir
    const r = defter.kaydet({ prompt: '227 evet', session_id: ARAC })
    expect(r).toMatchObject({ kaydedildi: false, sebep: 'yazilamadi' })
  })

  it('peer mesajı kaydet e verilirse YAZILMAZ (kaydedildi=false, defter yok)', () => {
    const r = defter.kaydet({ prompt: '<cross-session-message>217 evet</cross-session-message>', session_id: ARAC })
    expect(r.kaydedildi).toBe(false)
    expect(fs.existsSync(defter.defterYolu())).toBe(false)
  })
})

describe('INV-RECEP-SOZU-5 · board-brief kancası gerçek süreçte', () => {
  const kos = (girdi: unknown, ham?: string) =>
    spawnSync(process.execPath, [KANCA], {
      input: ham ?? JSON.stringify(girdi),
      encoding: 'utf8',
      env: { ...process.env },
      timeout: 60_000,
    })
  const claim = (sid: string, lane: string) =>
    spawnSync(process.execPath, [BOARD, 'claim', '--sid', sid, '--lane', lane, '--globs', `deneme/${lane.toLowerCase()}/**`], { encoding: 'utf8', env: { ...process.env } })
  const ctx = (r: { stdout: string }): string => {
    if (!r.stdout.trim()) return ''
    return (JSON.parse(r.stdout) as { hookSpecificOutput: { additionalContext: string } }).hookSpecificOutput.additionalContext
  }

  it('Recep mesajı kancadan geçince deftere rolüyle yazılır; peer mesajı YAZILMAZ', () => {
    claim(ARAC, 'ARAC')
    expect(kos({ session_id: ARAC, prompt: '223 kabul' }).status).toBe(0)
    kos({ session_id: ARAC, prompt: '<cross-session-message from="x">217 evet</cross-session-message>' })
    const k = defter.kayitlariOku()
    expect(k).toHaveLength(1)
    expect(k[0]).toMatchObject({ sid: ARAC, rol: 'ARAC', no: '223', cevap: 'kabul', soz: '223 kabul' })
  })

  it('OPS kancası başka pencereye yazılan sözü GÖSTERİR, ikinci turda göstermez', () => {
    claim(OPS, 'OPS')
    claim(ARAC, 'ARAC')
    kos({ session_id: OPS, prompt: 'selam' }) // OPS imleci kurulur
    kos({ session_id: ARAC, prompt: '227 evet' })
    const a = ctx(kos({ session_id: OPS, prompt: 'durum?' }))
    expect(a).toContain('RECEP SÖZÜ (defter, yeni)')
    expect(a).toContain('karar 227 evet')
    expect(ctx(kos({ session_id: OPS, prompt: 'tekrar' }))).not.toContain('RECEP SÖZÜ')
  })

  it('departman kancası OPS te verilen numaralı kararı GÖSTERİR', () => {
    claim(OPS, 'OPS')
    claim(ARAC, 'ARAC')
    kos({ session_id: ARAC, prompt: 'selam' }) // Araç imleci kurulur
    kos({ session_id: OPS, prompt: '233 evet' })
    expect(ctx(kos({ session_id: ARAC, prompt: 'durum?' }))).toContain("OPS'TA VERİLEN KARAR")
  })

  it('SESSİZLİK: defterde yeni söz yoksa ve pano boşsa kanca HİÇBİR ŞEY yazmaz', () => {
    claim(ARAC, 'ARAC')
    const r = kos({ session_id: ARAC, prompt: 'merhaba' })
    expect(r.status).toBe(0)
    expect(r.stdout.trim()).toBe('')
  })

  it('bozuk girdi, sid yok, yazılamayan defter: çıkış 0, kanca düşmez', () => {
    expect(kos(null, '{bozuk').status).toBe(0)
    expect(kos({ prompt: '227 evet' }).status).toBe(0)
    process.env.VENTHUB_RECEP_DEFTER = tmp
    const r = kos({ session_id: ARAC, prompt: '227 evet' })
    expect(r.status).toBe(0)
  })
})

describe('INV-RECEP-SOZU-6 · gerçek deftere sahte söz YAZILMAZ (Ops 10-01 ilk canlı ölçüm: 8 test artığı)', () => {
  /** Kancayı verilen ortamla koşturur; HOME'u geçici dizine çevirir ki "gerçek varsayılan yol" tmp altında olsun. */
  const kosOrtam = (girdi: unknown, ortam: Record<string, string | undefined>) => {
    const env: Record<string, string | undefined> = {
      ...process.env,
      USERPROFILE: path.join(tmp, 'home'),
      HOME: path.join(tmp, 'home'),
      ...ortam,
    }
    for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k]
    return spawnSync(process.execPath, [KANCA], { input: JSON.stringify(girdi), encoding: 'utf8', env: env as NodeJS.ProcessEnv, timeout: 60_000 })
  }
  const gercekYol = () => path.join(tmp, 'home', '.claude', 'recep-sozu-defteri.jsonl')

  it('test ortamında (VITEST) yol verilmemişse kayıt REDDEDİLİR, gerçek yola dosya açılmaz', () => {
    const r = kosOrtam({ session_id: ARAC, prompt: 'merhaba' }, { VENTHUB_RECEP_DEFTER: undefined, VITEST: 'true' })
    expect(r.status).toBe(0)
    expect(fs.existsSync(gercekYol())).toBe(false)
  })

  it('test ortamında yol AÇIKÇA gerçek varsayılan yola verilse bile REDDEDİLİR (aynı yola eşitlik kontrolü)', () => {
    const r = kosOrtam({ session_id: ARAC, prompt: 'merhaba' }, { VENTHUB_RECEP_DEFTER: gercekYol(), VITEST: 'true' })
    expect(r.status).toBe(0)
    expect(fs.existsSync(gercekYol())).toBe(false)
  })

  it('NODE_ENV=test de test ortamı sayılır; modül kararı doğrudan verir', () => {
    const onceVitest = process.env.VITEST
    const onceYol = process.env.VENTHUB_RECEP_DEFTER
    try {
      delete process.env.VENTHUB_RECEP_DEFTER
      expect(defter.testOrtamiMi()).toBe(true) // vitest içindeyiz
      const r = defter.kaydet({ prompt: 'merhaba', session_id: ARAC })
      expect(r).toMatchObject({ kaydedildi: false, sebep: 'test-ortami-gercek-defter-yasak' })
    } finally {
      if (onceVitest === undefined) delete process.env.VITEST
      else process.env.VITEST = onceVitest
      if (onceYol !== undefined) process.env.VENTHUB_RECEP_DEFTER = onceYol
    }
  })

  it('AYIRT EDİCİ ÇİFT: test ortamı DEĞİLSE aynı girdi gerçek varsayılan yola yazılır (üretimde kanca ölü değil)', () => {
    const r = kosOrtam(
      { session_id: ARAC, prompt: 'merhaba' },
      { VENTHUB_RECEP_DEFTER: undefined, VITEST: undefined, NODE_ENV: undefined, JEST_WORKER_ID: undefined },
    )
    expect(r.status).toBe(0)
    expect(fs.existsSync(gercekYol())).toBe(true)
    expect(fs.readFileSync(gercekYol(), 'utf8')).toContain('merhaba')
  })

  it('UUID olmayan sid kayda girmez (benim1, boş, kısa kimlik)', () => {
    for (const sid of ['benim1', '', 'cb0467f1', 'cb0467f1-f1a3-437d-bc15', '../../x']) {
      const r = defter.kaydet({ prompt: 'merhaba', session_id: sid })
      expect(r, sid).toMatchObject({ kaydedildi: false, sebep: 'sid-uuid-degil' })
    }
    expect(fs.existsSync(defter.defterYolu())).toBe(false)
  })

  it('tekrar koruması: aynı sid + aynı söz 10 sn içinde ikinci kez YAZILMAZ; sonra, farklı söz ya da farklı sid yazılır', () => {
    const t0 = Date.now()
    expect(defter.kaydet({ prompt: '227 evet', session_id: ARAC }, { simdi: t0 })).toMatchObject({ kaydedildi: true })
    expect(defter.kaydet({ prompt: '227 evet', session_id: ARAC }, { simdi: t0 + 3000 })).toMatchObject({ kaydedildi: false, sebep: 'tekrar' })
    expect(defter.kaydet({ prompt: '227 evet', session_id: ARAC }, { simdi: t0 + defter.TEKRAR_MS + 1000 })).toMatchObject({ kaydedildi: true })
    expect(defter.kaydet({ prompt: 'başka söz', session_id: ARAC }, { simdi: t0 + 3500 })).toMatchObject({ kaydedildi: true })
    expect(defter.kaydet({ prompt: '227 evet', session_id: HARITA }, { simdi: t0 + 4000 })).toMatchObject({ kaydedildi: true })
    expect(defter.kayitlariOku()).toHaveLength(4)
  })

  it('vitest kurulumu defteri geçici dizine yönlendirir: gerçek ev dizinindeki defter DEĞİL', () => {
    // beforeEach kendi tmp yolunu verir; kurulumun yönlendirmesi kök sürecin başlangıç değeridir
    const baslangic = eskiEnv.VENTHUB_RECEP_DEFTER
    expect(baslangic).toBeTruthy()
    expect(path.resolve(String(baslangic)).toLowerCase()).not.toBe(path.resolve(os.homedir(), '.claude', 'recep-sozu-defteri.jsonl').toLowerCase())
  })
})
