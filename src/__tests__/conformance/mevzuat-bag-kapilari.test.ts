import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-MEVZUAT-BAG-1 · rehber ↔ mevzuat bağ kapıları M-A / M-C / M-D (ARC-284, BLG-57, OPS-253).
 * Sabotaj kolları: kayıtta olmayan kimlik, kaynak listesinde olmayan numara, `son_kontrol` tek başına işaret,
 * `tur=yok` atıf sayılması, atıf dizininin bayatlaması; her biri kapı bozulursa kırmızıya döner.
 */

type Bag = { kayit?: unknown; bolum?: unknown; kaynak?: unknown; tur?: unknown; madde?: string; not?: string }
type Yazi = { dosya?: string; yazi?: unknown; kaynaklar?: unknown; mevzuat?: unknown }
type Kalem = Record<string, unknown> & { kimlik: string }
type Kayit = { kalemler: Kalem[] }
type Atif = { atif_yapan_yazilar: Record<string, string[]> }
const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const BETIK = path.join(KOK, 'scripts', 'arac', 'mevzuat-bag-kapilari.cjs')
const motor = require_(BETIK) as {
  ma: (k: Kayit, y: Yazi[]) => string[]
  atifDizini: (y: Yazi[]) => Atif
  mc: (e: Kayit, y: Kayit, a: Atif) => { kimlik: string; alanlar: string[]; yazilar: string[] }[]
  mcRapor: (b: { kimlik: string; alanlar: string[]; yazilar: string[] }[]) => string
}

const kalem = (kimlik: string, ek: Record<string, unknown> = {}): Kalem => ({
  kimlik, durum: 'yururlukte', tarihler: { yayim: '2019-10-25' }, yerini_aldigi: [], degistirenler: [], son_kontrol: '2026-11-01', ...ek,
})
const kayit = (...k: Kalem[]): Kayit => ({ kalemler: k })
const bag = (b: Bag = {}): Bag => ({ kayit: 'A-1', bolum: 'giris', kaynak: [1], tur: 'atif', ...b })
const yazi = (ad: string, mevzuat: unknown, kaynaklar: unknown = [1, 2]): Yazi => ({ dosya: ad + '.json', yazi: ad, kaynaklar, mevzuat })

describe('INV-MEVZUAT-BAG-1 — M-A bağ doğrulaması', () => {
  const K = kayit(kalem('A-1'), kalem('B-2', { durum: 'kaldirildi' }))

  it('temiz bağ, mevzuatsız yazı ([]) ve kaldırılmış kalem kimliği geçer', () => {
    expect(motor.ma(K, [yazi('y1', [bag(), bag({ kayit: 'B-2', tur: 'tarih' })]), yazi('y2', [])])).toEqual([])
  })

  it.each([
    ['kayıtta olmayan kimlik', bag({ kayit: 'YOK-9' }), /YOK-9.*kayit\.json'da yok/],
    ['kaynak listesinde olmayan numara', bag({ kaynak: [7] }), /kaynak numarası 7/],
    ['geçersiz tur', bag({ tur: 'belki' }), /tur .*geçersiz/],
    ['bölümsüz bağ', bag({ bolum: '' }), /"bolum" yok/],
    ['kimliksiz bağ', bag({ kayit: undefined }), /"kayit" yok/],
    ['kaynak dizi değil', bag({ kaynak: 3 }), /"kaynak" dizi değil/],
    ['kaynaksız atıf', bag({ kaynak: [] }), /"kaynak" boş/],
    ['notsuz tur=yok', bag({ tur: 'yok', kaynak: [] }), /"not" ile açıklanır/],
  ])('%s kırmızı verir', (_ad, b, desen) => {
    expect(motor.ma(K, [yazi('y1', [b])]).join('\n')).toMatch(desen)
  })

  it('tur=yok not ve boş kaynakla geçer; mevzuat dizi değilse ve yazı kimliği iki dosyada ise kırmızı', () => {
    expect(motor.ma(K, [yazi('y1', [bag({ tur: 'yok', kaynak: [], not: 'kapsamda ama yazı anmıyor' })])])).toEqual([])
    expect(motor.ma(K, [yazi('y1', null)]).join()).toMatch(/"mevzuat" dizi değil/)
    expect(motor.ma(K, [yazi('y1', []), { ...yazi('y1', []), dosya: 'baska.json' }]).join()).toMatch(/iki dosyada/)
  })
})

describe('INV-MEVZUAT-BAG-1 — M-D atıf dizini', () => {
  it('kalem başına yazıları sıralı ve tekil verir; tur=yok atıf sayılmaz; damga yok (kararlı)', () => {
    const a = motor.atifDizini([
      yazi('z-yazi', [bag({ kayit: 'B-2' }), bag({ kayit: 'A-1' })]),
      yazi('a-yazi', [bag({ kayit: 'A-1' }), bag({ kayit: 'A-1', tur: 'tarih' })]),
      yazi('y-yok', [bag({ kayit: 'B-2', tur: 'yok', kaynak: [], not: 'anmıyor' })]),
    ])
    expect(a.atif_yapan_yazilar).toEqual({ 'A-1': ['a-yazi', 'z-yazi'], 'B-2': ['z-yazi'] })
    // damgasız: aynı girdi, girdi sırası değişse de aynı çıktı (güncel mi testi kararlı kalır)
    const ters = motor.atifDizini([yazi('a-yazi', [bag({ kayit: 'A-1' })]), yazi('z-yazi', [bag({ kayit: 'A-1' })])])
    const duz = motor.atifDizini([yazi('z-yazi', [bag({ kayit: 'A-1' })]), yazi('a-yazi', [bag({ kayit: 'A-1' })])])
    expect(JSON.stringify(ters)).toBe(JSON.stringify(duz))
  })
})

describe('INV-MEVZUAT-BAG-1 — M-C kayıt değişikliği işareti', () => {
  const atif: Atif = { atif_yapan_yazilar: { 'A-1': ['y1', 'y2'], 'B-2': ['y2'] } }

  it.each([
    ['durum', { durum: 'kaldirildi' }],
    ['tarihler', { tarihler: { yayim: '2019-10-25', yururluk: '2020-01-01' } }],
    ['yerini_aldigi', { yerini_aldigi: ['X-9'] }],
    ['degistirenler', { degistirenler: ['C-3'] }],
  ])('%s değişince o kalemi anan yazılar işaretlenir', (alan, ek) => {
    const s = motor.mc(kayit(kalem('A-1')), kayit(kalem('A-1', ek)), atif)
    expect(s).toEqual([{ kimlik: 'A-1', alanlar: [alan], yazilar: ['y1', 'y2'] }])
    expect(motor.mcRapor(s)).toMatch(/y1, y2/)
  })

  it('son_kontrol tek başına işaret üretmez; yeni kalem, anılmayan kalem ve anahtar sırası farkı işaret üretmez', () => {
    expect(motor.mc(kayit(kalem('A-1')), kayit(kalem('A-1', { son_kontrol: '2026-12-31' })), atif)).toEqual([])
    expect(motor.mc(kayit(kalem('A-1')), kayit(kalem('A-1'), kalem('YENI-1')), atif)).toEqual([])
    expect(motor.mc(kayit(kalem('Z-5')), kayit(kalem('Z-5', { durum: 'kaldirildi' })), atif)).toEqual([])
    const ters = { yayim: '2019-10-25', ek: { b: 1, a: 2 } }
    expect(motor.mc(kayit(kalem('A-1', { tarihler: ters })), kayit(kalem('A-1', { tarihler: { ek: { a: 2, b: 1 }, yayim: '2019-10-25' } })), atif)).toEqual([])
  })

  it('etkilenen yoksa rapor bunu söyler', () => {
    expect(motor.mcRapor([])).toMatch(/etkilemiyor/)
  })
})

describe('INV-MEVZUAT-BAG-1 — gerçek kayıt ve CLI', () => {
  const gecici = mkdtempSync(path.join(tmpdir(), 'mvz-bag-'))
  afterAll(() => rmSync(gecici, { recursive: true, force: true }))
  const calistir = (...a: string[]) => spawnSync('node', [BETIK, ...a], { encoding: 'utf8', timeout: 20000 })
  const gercek = JSON.parse(readFileSync(path.join(KOK, 'docs', 'mevzuat', 'kayit.json'), 'utf8')) as Kayit

  it('plandaki kimlikler (BLG-57 §4, imar ve BEP dahil) gerçek kayit.json içinde var: M-A gerçek veride yeşil verir', () => {
    const kimlikler = ['AB-2019/1781', 'AB-2021/341', 'TR-SGM-2021/16', 'TR-SGM-2021/23', 'STD-IEC-61800-3', 'AB-327/2011', 'AB-2024/1834',
      'AB-2025/2481', 'TR-SGM-2026/2', 'TR-SVGM-2019/15', 'STD-EN-12101-3', 'TR-YON-GURULTU-BINA-2017', 'TR-YON-GURULTU-BINA-2018-DEG',
      'AB-1253/2014', 'AB-1254/2014', 'TR-SGM-2021/18', 'TR-SGM-2021/19', 'AB-2014/34', 'AB-94/9', 'AB-1999/92', 'TR-YON-ATEX-2014/34',
      'TR-YON-ATEX-1999/92', 'TR-YON-IMAR-PLANLI-2017', 'TR-YON-BEP-2008']
    const y = yazi('plan', kimlikler.map((k) => bag({ kayit: k })))
    expect(motor.ma(gercek, [y])).toEqual([])
  })

  it('CLI: bağ dizini yoksa ÖLÇÜLEMEDİ der (sahte yeşil değil, çıkış 0); ma kırmızıda 1; uret --kontrol bayat dosyada 1', () => {
    const kok = path.join(gecici, 'depo')
    mkdirSync(path.join(kok, 'docs', 'mevzuat'), { recursive: true })
    writeFileSync(path.join(kok, 'docs', 'mevzuat', 'kayit.json'), JSON.stringify(kayit(kalem('A-1'))))
    const yok = calistir('ma', `--kok=${kok}`)
    expect(yok.status).toBe(0)
    expect(yok.stdout).toMatch(/ÖLÇÜLEMEDİ/)

    const dizin = path.join(kok, 'docs', 'rehber', 'mevzuat-bag')
    mkdirSync(dizin, { recursive: true })
    writeFileSync(path.join(dizin, 'y1.json'), JSON.stringify({ yazi: 'y1', kaynaklar: [1], mevzuat: [bag()] }))
    expect(calistir('ma', `--kok=${kok}`).status).toBe(0)
    expect(calistir('uret', '--kontrol', `--kok=${kok}`).status).toBe(1)
    expect(calistir('uret', `--kok=${kok}`).status).toBe(0)
    expect(calistir('uret', '--kontrol', `--kok=${kok}`).status).toBe(0)
    expect(JSON.parse(readFileSync(path.join(kok, 'docs', 'mevzuat', 'atif-dizini.json'), 'utf8')).atif_yapan_yazilar).toEqual({ 'A-1': ['y1'] })

    // bağ değişince dizin bayatlar (sabotaj: üretilmiş dosya güncel değil)
    writeFileSync(path.join(dizin, 'y2.json'), JSON.stringify({ yazi: 'y2', kaynaklar: [1], mevzuat: [bag()] }))
    expect(calistir('uret', '--kontrol', `--kok=${kok}`).status).toBe(1)
    writeFileSync(path.join(dizin, 'y3.json'), JSON.stringify({ yazi: 'y3', kaynaklar: [1], mevzuat: [bag({ kayit: 'YOK-1' })] }))
    const kirmizi = calistir('ma', `--kok=${kok}`)
    expect(kirmizi.status).toBe(1)
    expect(kirmizi.stdout).toMatch(/M-A KIRMIZI/)
  })

  it('CLI mc: --taban ile eski kayıt verilince değişen ve anılan kalem raporlanır', () => {
    const kok = path.join(gecici, 'depo2')
    mkdirSync(path.join(kok, 'docs', 'mevzuat'), { recursive: true })
    mkdirSync(path.join(kok, 'docs', 'rehber', 'mevzuat-bag'), { recursive: true })
    writeFileSync(path.join(kok, 'docs', 'mevzuat', 'kayit.json'), JSON.stringify(kayit(kalem('A-1', { durum: 'kaldirildi' }))))
    writeFileSync(path.join(kok, 'taban.json'), JSON.stringify(kayit(kalem('A-1'))))
    writeFileSync(path.join(kok, 'docs', 'rehber', 'mevzuat-bag', 'y1.json'), JSON.stringify({ yazi: 'y1', kaynaklar: [1], mevzuat: [bag()] }))
    const r = calistir('mc', `--kok=${kok}`, '--taban=taban.json')
    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/gözden geçirmesi gerekli yazılar: y1/)
    expect(r.stdout).toMatch(/A-1 \(durum\)/)
  })
})
