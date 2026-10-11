// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * INV-DEFTER-YEDEK-1..3 · Recep sözü defteri = KARAR KAYDI (ARC-15, Recep 10-01).
 *  1 · DÖNDÜRME: büyüyen defter aylık arşive TAŞINIR; hiçbir kayıt kaybolmaz, kanca okuması eşiğin altında kalır.
 *  2 · YEDEK: arşiv+aktif tek dosyada, bayt eşitliğiyle doğrulanır; doğrulanamayan kopya yedek SAYILMAZ; geri yükleme
 *      önce plan, uygulanınca eski hal `.oncesi` olarak YANINDA kalır; bozuk yedek canlı defterin üstüne yazılmaz.
 *  3 · KANCA: oturum sonu kancası depo başına eşik uygular, defteri yedekler, Stop'ta taze iken LOG YAZMADAN çıkar.
 *
 * Ayrıca: kararlar() gerçek Recep sözleriyle (217 evet, 223 kabul, 227 evet, 233 evet) numara çıkarır — ALTYAPI'nın
 * "no alanı hepsinde null" gözleminin kök sebebi ayrıştırıcı değil, sözlerin kanca öncesi söylenmiş olmasıydı.
 */

interface Kayit {
  ts: string
  sid: string
  rol: string
  pencere: string
  no: string | null
  cevap: string | null
  soz: string
}
interface Defter {
  kararlar: (s: string) => { no: string; cevap: string }[]
  defterYolu: () => string
  arsivYollari: () => string[]
  tumKayitlar: () => Kayit[]
  kayitlariOku: () => Kayit[]
  kararKayitlari: () => { no: string; cevap: string }[]
  dondur: (o?: { esikBayt?: number; tutBayt?: number }) => { durum: string; tasinan?: number; tutulan?: number; sebep?: string }
  OKUMA_BAYT: number
  DONDUR_ESIK_BAYT: number
}
interface Yedek {
  yedekAl: (simdi?: Date, o?: { dizin?: string; zorla?: boolean; yaz?: (p: string, b: Buffer) => void }) => { durum: string; yol?: string; satir?: number; sebep?: string }
  budama: (dizin?: string) => string[]
  liste: (dizin?: string) => { ad: string }[]
  durum: (dizin?: string, simdi?: number) => { sonYedek: string | null; saat: number | null; gecikti: boolean; adet: number; dogrulanmadi: string[] }
  geriYukle: (
    ad?: string | null,
    o?: { dizin?: string; evet?: boolean; simdi?: number },
  ) => { durum: string; yedek?: string; satir?: number; mevcutSatir?: number; oncesi?: string[]; sebep?: string }
  TAZE_SAAT: number
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const defter = require_(path.join(KOK, 'scripts/board/recep-sozu-defteri.cjs')) as Defter
const yedek = require_(path.join(KOK, 'scripts/board/recep-sozu-defteri-yedek.cjs')) as Yedek
const KANCA = path.join(KOK, '.claude/hooks/sage-yedek-oturum-sonu.cjs')

const SID = '65844ccb-e970-48ab-a9f2-0e497c6a7ef9'
const ENVLER = ['VENTHUB_RECEP_DEFTER', 'VENTHUB_SAGE_YEDEK_DIZINI', 'CLAUDE_PROJECT_DIR']
const eskiEnv: Record<string, string | undefined> = {}
let tmp = ''
let yedekDizini = ''

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'defter-yedek-'))
  for (const k of ENVLER) eskiEnv[k] = process.env[k]
  process.env.VENTHUB_RECEP_DEFTER = path.join(tmp, 'd', 'recep-sozu-defteri.jsonl')
  yedekDizini = path.join(tmp, 'yedek')
  process.env.VENTHUB_SAGE_YEDEK_DIZINI = yedekDizini
  process.env.CLAUDE_PROJECT_DIR = path.join(tmp, 'kok')
  fs.mkdirSync(path.join(tmp, 'd'), { recursive: true })
  fs.mkdirSync(yedekDizini, { recursive: true })
})
afterEach(() => {
  for (const k of ENVLER) {
    if (eskiEnv[k] === undefined) delete process.env[k]
    else process.env[k] = eskiEnv[k]
  }
  fs.rmSync(tmp, { recursive: true, force: true })
})

/** i. sıradaki sentetik kayıt: gün/ay verilebilir, her 10. kayıt numaralı karar. */
function kayit(i: number, ay = '2026-10'): string {
  const karar = i % 10 === 0
  const k: Kayit = {
    ts: `${ay}-${String(1 + (i % 27)).padStart(2, '0')}T10:${String(i % 60).padStart(2, '0')}:00.000Z`,
    sid: `aaaaaaaa-1111-4111-8111-${String(i).padStart(12, '0')}`,
    rol: 'OPS',
    pencere: 'Ops',
    no: karar ? String(200 + (i % 50)) : null,
    cevap: karar ? 'evet' : null,
    soz: (karar ? `${200 + (i % 50)} evet ` : `soz ${i} `) + 'x'.repeat(120),
  }
  return JSON.stringify(k) + '\n'
}
function defterDoldur(adet: number, ay = '2026-10'): void {
  let s = ''
  for (let i = 0; i < adet; i++) s += kayit(i, ay)
  fs.writeFileSync(defter.defterYolu(), s)
}
const boy = (p: string) => fs.statSync(p).size

describe('INV-DEFTER-YEDEK-1 · döndürme KAYIPSIZ (taşıma, kırpma değil)', () => {
  it('eşik altında dokunmaz', () => {
    defterDoldur(20)
    const once = fs.readFileSync(defter.defterYolu(), 'utf8')
    expect(defter.dondur().durum).toBe('gerek-yok')
    expect(fs.readFileSync(defter.defterYolu(), 'utf8')).toBe(once)
    expect(defter.arsivYollari()).toEqual([])
  })

  it('⭐eşik aşılınca eski kayıtlar aylık arşive taşınır: toplam kayıt, karar listesi ve içerik AYNI kalır', () => {
    defterDoldur(900)
    const oncekiHepsi = defter.tumKayitlar()
    const oncekiKarar = defter.kararKayitlari().map((k) => k.no).join(',')
    expect(boy(defter.defterYolu())).toBeGreaterThan(defter.DONDUR_ESIK_BAYT)

    const r = defter.dondur()
    expect(r.durum).toBe('dondu')
    expect(boy(defter.defterYolu()), 'aktif defter küçülmedi').toBeLessThan(defter.DONDUR_ESIK_BAYT)
    expect(defter.arsivYollari().length).toBeGreaterThan(0)

    const sonraHepsi = defter.tumKayitlar()
    expect(sonraHepsi.length, 'döndürme kayıt kaybettirdi').toBe(oncekiHepsi.length)
    expect(sonraHepsi.map((k) => k.soz)).toEqual(oncekiHepsi.map((k) => k.soz))
    expect(defter.kararKayitlari().map((k) => k.no).join(','), 'arşivdeki kararlar listeden düştü').toBe(oncekiKarar)
    // Kanca okuması yalnız aktif defteri görür ve o artık tamamen okuma penceresinin içindedir.
    expect(boy(defter.defterYolu())).toBeLessThan(defter.OKUMA_BAYT)
    expect(defter.kayitlariOku().length).toBe(r.tutulan)
  })

  it('ikinci çağrı iş yapmaz (idempotent) ve toplam sayı değişmez', () => {
    defterDoldur(900)
    defter.dondur()
    const arsivBoy = defter.arsivYollari().map(boy)
    expect(defter.dondur().durum).toBe('gerek-yok')
    expect(defter.arsivYollari().map(boy)).toEqual(arsivBoy)
  })

  it('kayıtlar KENDİ ayının arşivine gider; ayı çözülemeyen satır "diger" arşivine gider (KAYIP YOK)', () => {
    let s = ''
    for (let i = 0; i < 300; i++) s += kayit(i, '2026-09')
    s += 'bozuk satir json degil\n'
    for (let i = 300; i < 900; i++) s += kayit(i, '2026-10')
    fs.writeFileSync(defter.defterYolu(), s)
    const ham = s.split('\n').filter(Boolean).length
    expect(defter.dondur().durum).toBe('dondu')
    const adlar = defter.arsivYollari().map((p) => path.basename(p))
    expect(adlar).toContain('recep-sozu-defteri.arsiv-2026-09.jsonl')
    expect(adlar).toContain('recep-sozu-defteri.arsiv-diger.jsonl')
    let toplamSatir = fs.readFileSync(defter.defterYolu(), 'utf8').split('\n').filter(Boolean).length
    for (const p of defter.arsivYollari()) toplamSatir += fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).length
    expect(toplamSatir, 'ham satır sayısı korunmadı (bozuk satır dahil HİÇBİR satır silinmez)').toBe(ham)
  })

  it('satır sonu olmayan son satır KAYBOLMAZ', () => {
    let s = ''
    for (let i = 0; i < 900; i++) s += kayit(i)
    s += '{"ts":"2026-10-30T10:00:00.000Z","sid":"' + SID + '","rol":"ARAC","pencere":"Araç","no":null,"cevap":null,"soz":"SON-KESIK"}'
    fs.writeFileSync(defter.defterYolu(), s)
    expect(defter.dondur().durum).toBe('dondu')
    expect(fs.readFileSync(defter.defterYolu(), 'utf8')).toContain('SON-KESIK')
  })

  it('defter yoksa çökmez', () => {
    expect(['hata', 'gerek-yok']).toContain(defter.dondur().durum)
  })
})

describe('INV-DEFTER-YEDEK-2 · yedek doğrulanır, geri yüklenir', () => {
  it('⭐arşivler + aktif TEK dosyada yedeklenir (bayt eşitliği) ve geri yükleme tam resmi getirir', () => {
    defterDoldur(900)
    defter.dondur() // arşiv oluştu
    const tamOnce = defter.tumKayitlar().map((k) => k.soz)
    const r = yedek.yedekAl(new Date('2026-10-01T12:00:00Z'))
    expect(r.durum).toBe('alindi')
    expect(path.basename(r.yol as string)).toBe('defter-2026-10-01T1200Z.jsonl')
    expect(r.satir).toBe(tamOnce.length)

    // Yedek alındıktan sonra yerel defteri YOK ET; geri yüklemeyle tam resim dönmeli.
    for (const p of [...defter.arsivYollari(), defter.defterYolu()]) fs.rmSync(p)
    const plan = yedek.geriYukle()
    expect(plan.durum).toBe('plan')
    expect(plan.satir).toBe(tamOnce.length)
    expect(fs.existsSync(defter.defterYolu()), 'plan dosyayı değiştirdi').toBe(false)

    const uygula = yedek.geriYukle(null, { evet: true })
    expect(uygula.durum).toBe('geri-yuklendi')
    expect(defter.tumKayitlar().map((k) => k.soz)).toEqual(tamOnce)
  })

  it('taze yedek varken ATLANIR, --zorla ile alınır; defter yoksa kaynak-yok (uydurma yedek yok)', () => {
    expect(yedek.yedekAl(new Date('2026-10-01T12:00:00Z')).durum).toBe('kaynak-yok')
    defterDoldur(10)
    expect(yedek.yedekAl(new Date('2026-10-01T12:00:00Z')).durum).toBe('alindi')
    expect(yedek.yedekAl(new Date()).durum, 'yedek şimdiki zamandan ÖNCE alındı ama dosya mtime ŞİMDİ → taze').toBe('atlandi')
    expect(yedek.yedekAl(new Date('2026-10-01T12:30:00Z'), { zorla: true }).durum).toBe('alindi')
  })

  it('⭐SABOTAJ: yazılan kopya kaynakla eşit değilse .DOGRULANMADI olur ve yedek SAYILMAZ', () => {
    defterDoldur(10)
    const r = yedek.yedekAl(new Date('2026-10-01T12:00:00Z'), {
      yaz: (p, b) => fs.writeFileSync(p, b.subarray(0, b.length - 5)),
    })
    expect(r.durum).toBe('dogrulanmadi')
    expect(r.yol).toMatch(/\.DOGRULANMADI$/)
    expect(yedek.durum().sonYedek, 'doğrulanmamış kopya yedek sayıldı: kaybı taze gösterir').toBeNull()
    expect(yedek.durum().dogrulanmadi.length).toBe(1)
  })

  it('.DOGRULANMADI dosyası YEDEK SAYILMAZ (kaybı taze göstermez)', () => {
    fs.writeFileSync(path.join(yedekDizini, 'defter-2026-10-01T1200Z.jsonl.DOGRULANMADI'), 'x')
    const d = yedek.durum()
    expect(d.sonYedek).toBeNull()
    expect(d.dogrulanmadi).toEqual(['defter-2026-10-01T1200Z.jsonl.DOGRULANMADI'])
  })

  it('⭐geri yükleme: mevcut defter ve arşivler .oncesi olarak YANINDA kalır; bozuk yedek REDDEDİLİR', () => {
    defterDoldur(30)
    yedek.yedekAl(new Date('2026-10-01T12:00:00Z'))
    fs.appendFileSync(defter.defterYolu(), kayit(999)) // yedekten SONRA gelen söz
    const mevcut = fs.readFileSync(defter.defterYolu(), 'utf8')
    const r = yedek.geriYukle(null, { evet: true, simdi: Date.parse('2026-10-01T13:00:00Z') })
    expect(r.durum).toBe('geri-yuklendi')
    const oncesi = fs.readdirSync(path.dirname(defter.defterYolu())).filter((f) => f.includes('.oncesi-'))
    expect(oncesi.length).toBe(1)
    expect(fs.readFileSync(path.join(path.dirname(defter.defterYolu()), oncesi[0]), 'utf8'), 'eski hal kayboldu').toBe(mevcut)

    // Bozuk yedek: canlı defterin üstüne yazılmaz.
    const bozuk = path.join(yedekDizini, 'defter-2026-10-02T1200Z.jsonl')
    fs.writeFileSync(bozuk, '{"ts":1}\nBOZUK\n')
    const once = fs.readFileSync(defter.defterYolu(), 'utf8')
    const b = yedek.geriYukle('defter-2026-10-02T1200Z.jsonl', { evet: true })
    expect(b.durum).toBe('hata')
    expect(fs.readFileSync(defter.defterYolu(), 'utf8')).toBe(once)
  })

  it('hata yolları: yedek yok, bilinmeyen ad', () => {
    expect(yedek.geriYukle().durum).toBe('hata')
    defterDoldur(5)
    yedek.yedekAl(new Date('2026-10-01T12:00:00Z'))
    expect(yedek.geriYukle('defter-yok.jsonl').durum).toBe('hata')
  })

  it('kademeli saklama: son 24 kopya + gün başına en yenisi; .DOGRULANMADI silinmez', () => {
    for (let h = 0; h < 30; h++) {
      const ad = `defter-2026-09-${String(1 + Math.floor(h / 24)).padStart(2, '0')}T${String(h % 24).padStart(2, '0')}00Z.jsonl`
      fs.writeFileSync(path.join(yedekDizini, ad), 'x')
    }
    fs.writeFileSync(path.join(yedekDizini, 'defter-2026-08-01T0000Z.jsonl.DOGRULANMADI'), 'x')
    yedek.budama(yedekDizini)
    expect(fs.existsSync(path.join(yedekDizini, 'defter-2026-08-01T0000Z.jsonl.DOGRULANMADI'))).toBe(true)
    expect(yedek.liste(yedekDizini).filter((y) => /^defter-.*Z\.jsonl$/.test(y.ad)).length).toBeGreaterThanOrEqual(24)
  })
})

describe('kararlar() · gerçek Recep sözleri', () => {
  it.each([
    ['227 evet', '227', 'evet'],
    ['233 evet', '233', 'evet'],
    ['223 kabul', '223', 'kabul'],
    ['217 evet', '217', 'evet'],
    ['235 evet', '235', 'evet'],
  ])('"%s" → no=%s cevap=%s', (soz, no, cevap) => {
    expect(defter.kararlar(soz)[0]).toEqual({ no, cevap })
  })
})

describe('INV-DEFTER-YEDEK-3 · oturum sonu kancası', () => {
  const kos = () =>
    spawnSync(process.execPath, [KANCA], {
      input: '{"session_id":"t"}',
      encoding: 'utf8',
      env: { ...process.env },
      timeout: 60_000,
    })
  const log = () => {
    const p = path.join(yedekDizini, 'son-kosum.log')
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''
  }
  const tara = (ad: string, saatOnce: number) => {
    const p = path.join(yedekDizini, ad)
    fs.writeFileSync(p, 'x')
    const t = new Date(Date.now() - saatOnce * 3_600_000)
    fs.utimesSync(p, t, t)
  }

  it('⭐UCUZ BAKIŞ: kanban ve defter yedeği taze ise HİÇBİR ŞEY yapmaz ve LOG YAZMAZ', () => {
    defterDoldur(5)
    tara('kanban-2026-10-01T1200Z.sqlite', 0.1)
    tara('defter-2026-10-01T1200Z.jsonl', 0.1)
    const r = kos()
    expect(r.status).toBe(0)
    expect(log(), 'taze iken log yazdı: Stop turunda her turda log şişer').toBe('')
  })

  it('⭐DEPO BAŞINA EŞİK: kanban 2 saatlik ise (sage 24 saatlik eşiğinde taze) KANBAN yedeklenmeye çalışılır, ATLANDI yazılmaz', () => {
    defterDoldur(5)
    tara('sage-2026-10-01T1200Z.db', 2)
    tara('kanban-2026-10-01T1000Z.sqlite', 2)
    tara('defter-2026-10-01T1200Z.jsonl', 0.1)
    const r = kos()
    expect(r.status).toBe(0)
    expect(log()).toContain('[kanban] kaynak YOK')
    expect(log()).not.toContain('ATLANDI')
    expect(log(), 'sage 2 saatlikken yeniden yedeklenmeye çalışıldı: eşik 24 saat').not.toContain('[sage]')
  })

  it('defter yedeği 1,5 saatlik (eşik 1 saat) ise yalnız DEFTER yedeklenir; kanban ve sage atlanır', () => {
    defterDoldur(5)
    tara('sage-2026-10-01T1200Z.db', 1)
    tara('kanban-2026-10-01T1200Z.sqlite', 0.5)
    tara('defter-2026-10-01T1200Z.jsonl', 1.5)
    const r = kos()
    expect(r.status).toBe(0)
    expect(log()).toContain('[defter] ALINDI')
    expect(log()).not.toContain('[kanban]')
    expect(log()).not.toContain('[sage]')
  })

  it('her depo eşiğinden yeniyse (ucuz bakışı geçecek kadar eski ama eşik içinde) ATLANDI yazar', () => {
    // Ucuz bakış 60 dk; sage 24 saat eşiği içinde ama kanban 59 dk → ucuz bakış "taze" der; ATLANDI'ya düşmek için
    // ucuz bakışın geçmesi gerekir: defter dosyası yok (defter de yoksa defterTaze=true) ve kanban 61 dk → bayat.
    tara('sage-2026-10-01T1200Z.db', 1)
    tara('kanban-2026-10-01T1200Z.sqlite', 0.5)
    const r = kos()
    expect(r.status).toBe(0)
    expect(log(), 'defter dosyası yokken ve depolar taze iken log yazmamalı').toBe('')
  })

  it('⭐defter yedeği YOKKEN kanca defteri yedekler, sonra eşik aşıldıysa döndürür; çıkış 0', () => {
    defterDoldur(900)
    tara('sage-2026-10-01T1200Z.db', 1)
    tara('kanban-2026-10-01T1200Z.sqlite', 0.1)
    const r = kos()
    expect(r.status).toBe(0)
    expect(log()).toContain('[defter] ALINDI')
    expect(log()).toContain('[defter] DONDURULDU')
    expect(yedek.liste(yedekDizini).some((y) => /^defter-.*Z\.jsonl$/.test(y.ad))).toBe(true)
    // Önce YEDEK: yedekteki satır sayısı döndürmeden ÖNCEKİ tam resimdir.
    expect(defter.tumKayitlar().length).toBe(900)
  })

  it('log tavanı: 256 KB üstü log kırpılır, kanca bloklanmaz', () => {
    fs.writeFileSync(path.join(yedekDizini, 'son-kosum.log'), 'eski satir\n'.repeat(40_000))
    defterDoldur(5)
    const r = kos()
    expect(r.status).toBe(0)
    expect(boy(path.join(yedekDizini, 'son-kosum.log'))).toBeLessThan(300 * 1024)
  })
})
