// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BAGLAM-BELGE-SATIRI-1 · kanca satırının iki eşikli bloğu ayırt edici ve bloklamaz.
 *
 * BAĞLAM (karar 148): Recep durum çubuğunu VS Code panelinde görmüyor; doluluk her mesajdaki kanca
 * satırına gelir. Kaynak konuşma kaydıdır (kanca stdin'i `context_window` taşımaz).
 * BELGE (REC-400 D2): metin/eşik/çiftler HARİTA'nın tarifi; blok yalnız önbellek okur.
 */

interface Kullanim {
  input_tokens?: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
}
interface Baglam {
  compactPenceresi: (kok?: string, ev?: string, env?: Record<string, string | undefined>) => number
  esikler: (p: number) => { doluyor: number; yakin: number }
  sonBaglam: (yol: string | undefined) => number | string | null
  satir: (token: number | string | null, pencere: number) => string | null
  COMPACT_SONRASI: string
}
type Sonuc = { durum: 'yok' } | { durum: 'bozuk'; hata: string } | { durum: 'tamam'; veri: unknown }
interface Belge {
  onbellekYolu: (pano: string) => string
  oku: (yol: string) => Sonuc
  satir: (s: Sonuc, simdi?: number) => string | null
  gerekirseTazele: (pano: string, depo: string, simdi?: number) => boolean
}

const KANCA = path.resolve(process.cwd(), '.claude', 'hooks')
const gerek = createRequire(import.meta.url)
const bd = gerek(path.join(KANCA, 'baglam-doluluk.cjs')) as Baglam
const bs = gerek(path.join(KANCA, 'belge-satiri.cjs')) as Belge

function gecici(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kanca-satir-'))
}
function kayit(dizin: string, satirlar: unknown[]): string {
  const yol = path.join(dizin, 'kayit.jsonl')
  fs.writeFileSync(yol, satirlar.map((s) => JSON.stringify(s)).join('\n') + '\n')
  return yol
}
const cevap = (u: Kullanim, isSidechain = false) => ({ type: 'assistant', isSidechain, message: { usage: u } })
const SIMDI = Date.parse('2026-09-27T12:00:00Z')
const tamam = (v: Record<string, unknown>): Sonuc => ({
  durum: 'tamam',
  veri: { olculdu: '2026-09-27T11:00:00Z', cekirdek: [], kirikYeni: [], grafGun: null, ...v },
})

describe('INV-BAGLAM-BELGE-SATIRI-1 · BAĞLAM bloğu', () => {
  it('bağlam = input + cache_creation + cache_read; SON ana konuşma cevabı, yan ajan cevabı sayılmaz', () => {
    const d = gecici()
    const yol = kayit(d, [
      cevap({ input_tokens: 1, cache_read_input_tokens: 100_000 }),
      { type: 'user', message: { content: 'x' } },
      cevap({ input_tokens: 2, cache_creation_input_tokens: 1_000, cache_read_input_tokens: 310_000 }),
      cevap({ input_tokens: 5, cache_read_input_tokens: 20_000 }, true),
      { type: 'user', message: { content: 'y' } },
    ])
    expect(bd.sonBaglam(yol)).toBe(311_002)
  })

  it('kayıt yok ya da henüz cevap yok → null (ilk mesajda ölçülecek şey yok)', () => {
    const d = gecici()
    expect(bd.sonBaglam(path.join(d, 'yok.jsonl'))).toBeNull()
    expect(bd.sonBaglam(undefined)).toBeNull()
    expect(bd.sonBaglam(kayit(d, [{ type: 'user', message: { content: 'ilk' } }]))).toBeNull()
  })

  it('512 KB\'tan büyük kayıtta yalnız kuyruk okunur, kesilmiş ilk satır hataya düşürmez', () => {
    const d = gecici()
    const dolgu = Array.from({ length: 900 }, () => ({ type: 'user', message: { content: 'x'.repeat(1_000) } }))
    const yol = kayit(d, [cevap({ cache_read_input_tokens: 1 }), ...dolgu, cevap({ cache_read_input_tokens: 42_000 })])
    expect(fs.statSync(yol).size).toBeGreaterThan(512 * 1024)
    expect(bd.sonBaglam(yol)).toBe(42_000)
  })

  it('compact sınırından sonra cevap YOK → sınır öncesi 707k okunmaz, "compact sonrasi" denir (hata 09-27)', () => {
    const d = gecici()
    const sinir = { type: 'system', subtype: 'compact_boundary', compactMetadata: { preTokens: 707_000, postTokens: 45_451 } }
    const once = cevap({ input_tokens: 2, cache_read_input_tokens: 707_000 })
    const yol = kayit(d, [once, sinir, { type: 'user', message: { content: 'özet' } }, { type: 'user', message: { content: 'devam' } }])
    expect(bd.sonBaglam(yol)).toBe(bd.COMPACT_SONRASI)
    expect(bd.satir(bd.sonBaglam(yol), 1_000_000)).toBe('BAGLAM: compact sonrasi — olcum ilk cevaptan sonra')
    // ayırt edici çift: sınırsız aynı kayıt eski değeri okur
    expect(bd.sonBaglam(kayit(d, [once, { type: 'user', message: { content: 'devam' } }]))).toBe(707_002)
    // sınırdan SONRA cevap varsa o okunur (sınır yürüyüşü durdurmaz, cevap önce gelir)
    expect(bd.sonBaglam(kayit(d, [once, sinir, cevap({ cache_read_input_tokens: 126_000 })]))).toBe(126_000)
    // yan ajanın sınırı ana konuşmayı kesmez
    expect(bd.sonBaglam(kayit(d, [once, { ...sinir, isSidechain: true }]))).toBe(707_002)
  })

  it('compact sonrası usage=0 kopya satırlar ölçüm değildir, atlanır (hata 09-28: "0k" bastı)', () => {
    const d = gecici()
    const sinir = { type: 'system', subtype: 'compact_boundary' }
    const once = cevap({ cache_read_input_tokens: 505_000 })
    const kopya = cevap({ input_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 })
    expect(bd.sonBaglam(kayit(d, [once, sinir, kopya, kopya]))).toBe(bd.COMPACT_SONRASI)
    expect(bd.sonBaglam(kayit(d, [once, sinir, cevap({ cache_read_input_tokens: 257_000 }), kopya]))).toBe(257_000)
  })

  it('eşik altında da HER mesajda düz satır (Recep 09-27); eşiklerde uyarı', () => {
    expect(bd.satir(146_000, 1_000_000)).toBe('BAGLAM: 146k/1M')
    expect(bd.satir(0, 1_000_000)).toBe('BAGLAM: 0k/1M')
  })

  it('eşik çiftleri (1M pencere): 299k düz / 300k doluyor · 499k doluyor / 500k COMPACT YAKIN', () => {
    expect(bd.satir(299_999, 1_000_000)).toBe('BAGLAM: 300k/1M')
    expect(bd.satir(300_000, 1_000_000)).toMatch(/^⚠BAGLAM: 300k\/1M — doluyor/)
    expect(bd.satir(499_999, 1_000_000)).toMatch(/doluyor/)
    expect(bd.satir(500_000, 1_000_000)).toMatch(/^⛔BAGLAM: 500k\/1M — COMPACT YAKIN/)
    expect(bd.satir(null, 1_000_000)).toBeNull()
  })

  it('pencere küçültülmüşse (250k) eşik pencereye oranlanır; mutlak 300k hiç yanmazdı', () => {
    expect(bd.esikler(250_000)).toEqual({ doluyor: 150_000, yakin: 200_000 })
    expect(bd.satir(149_999, 250_000)).toBe('BAGLAM: 150k/250k')
    expect(bd.satir(150_000, 250_000)).toMatch(/doluyor/)
    expect(bd.satir(200_000, 250_000)).toMatch(/COMPACT YAKIN/)
  })

  it("COMPACT YAKIN satırı Recep'e HAZIRLIK NOTU talimatı taşır; doluyor/düz satırda YOK (Recep 09-29)", () => {
    const yakin = bd.satir(500_000, 1_000_000) as string
    for (const madde of [
      'COMPACT HAZIRLIK NOTU',
      'UC MADDELIK LISTE',
      "'- ' ile baslayan",
      'Birinci madde: durum dosyam guncel mi',
      'Ikinci madde: yarim is var mi',
      'Ucuncu madde: hukum',
      'Simdi compact yapabilirsin',
      'her cevapta kisaca tekrarla',
    ]) {
      expect(yakin, madde).toContain(madde)
    }
    // Recep 09-29 (iki kez): maddeler yan yana tek paragraf ve (a)(b)(c) etiketli YAZILMAZ. Talimat bunu ÖĞRETMEMELİ.
    expect(yakin, 'talimat etiketli (a)(b)(c) biçimi öğretiyor').not.toMatch(/\(a\)|\(b\)|\(c\)/)
    expect(yakin, 'talimat yan yana yazmayı yasaklamıyor').toMatch(/yan yana tek paragraf YOK/)
    expect(bd.satir(499_999, 1_000_000)).not.toContain('HAZIRLIK')
    expect(bd.satir(146_000, 1_000_000)).not.toContain('HAZIRLIK')
    expect(bd.satir(200_000, 250_000), 'küçültülmüş pencerede de').toContain('COMPACT HAZIRLIK NOTU')
  })

  it('pencere önceliği durum çubuğuyla aynı: ortam > proje ayarı > kullanıcı ayarı > 1M', () => {
    const kok = gecici()
    const ev = gecici()
    expect(bd.compactPenceresi(kok, ev, {})).toBe(1_000_000)
    fs.mkdirSync(path.join(ev, '.claude'))
    fs.writeFileSync(path.join(ev, '.claude', 'settings.json'), JSON.stringify({ autoCompactWindow: 400_000 }))
    expect(bd.compactPenceresi(kok, ev, {})).toBe(400_000)
    fs.mkdirSync(path.join(kok, '.claude'))
    fs.writeFileSync(path.join(kok, '.claude', 'settings.json'), JSON.stringify({ autoCompactWindow: 250_000 }))
    expect(bd.compactPenceresi(kok, ev, {})).toBe(250_000)
    expect(bd.compactPenceresi(kok, ev, { CLAUDE_CODE_AUTO_COMPACT_WINDOW: '200000' })).toBe(200_000)
  })
})

describe('INV-BAGLAM-BELGE-SATIRI-1 · BELGE bloğu (HARİTA çiftleri)', () => {
  it('hepsi eşik altı → satır YOK', () => {
    expect(bs.satir(tamam({ cekirdek: [{ belge: 'CONTEXT.md', gun: 13, kaynak: 'alan' }], grafGun: 6 }), SIMDI)).toBeNull()
  })

  it('çekirdek 14 gün VAR / 13 gün YOK; vekil kaynak "(vekil)" taşır, alan taşımaz', () => {
    const s = bs.satir(
      tamam({
        cekirdek: [
          { belge: 'CONTEXT.md', gun: 41, kaynak: 'vekil' },
          { belge: 'docs/DURUM-TAKIP.md', gun: 14, kaynak: 'alan' },
          { belge: 'docs/README.md', gun: 13, kaynak: 'alan' },
        ],
      }),
      SIMDI,
    )
    expect(s).toBe('⚠BELGE: CONTEXT.md 41 gun (vekil) · DURUM-TAKIP.md 14 gun')
  })

  it('kirikYeni [] parça yok / 1 kayıt "kirik yol 1 (belge: yol)"', () => {
    expect(bs.satir(tamam({ kirikYeni: [] }), SIMDI)).toBeNull()
    expect(bs.satir(tamam({ kirikYeni: [{ belge: 'docs/README.md', yol: 'docs/yok.md' }] }), SIMDI)).toBe(
      '⚠BELGE: kirik yol 1 (README.md: docs/yok.md)',
    )
  })

  it('graphify 6 YOK / 7 VAR / null YOK', () => {
    expect(bs.satir(tamam({ grafGun: 6 }), SIMDI)).toBeNull()
    expect(bs.satir(tamam({ grafGun: 7 }), SIMDI)).toBe('⚠BELGE: graphify 7 gun')
    expect(bs.satir(tamam({ grafGun: null }), SIMDI)).toBeNull()
  })

  it('ölçülemeyen hâller eşiksiz konuşur: önbellek yok, JSON bozuk, alan eksik, 24 saatten bayat', () => {
    const d = gecici()
    expect(bs.satir(bs.oku(path.join(d, 'yok.json')), SIMDI)).toBe('⚠BELGE: OLCULMEDI (onbellek yok)')
    fs.writeFileSync(path.join(d, 'bozuk.json'), '{bozuk')
    expect(bs.satir(bs.oku(path.join(d, 'bozuk.json')), SIMDI)).toMatch(/^⚠BELGE: OLCULEMEDI \(/)
    fs.writeFileSync(path.join(d, 'eksik.json'), JSON.stringify({ olculdu: '2026-09-27T11:00:00Z' }))
    expect(bs.satir(bs.oku(path.join(d, 'eksik.json')), SIMDI)).toMatch(/^⚠BELGE: OLCULEMEDI \(alan eksik/)
    expect(bs.satir(tamam({ olculdu: '2026-09-26T11:00:00Z' }), SIMDI)).toBe('⚠BELGE: onbellek 25 saat bayat')
    expect(bs.satir(tamam({ olculdu: '2026-09-26T13:00:00Z' }), SIMDI)).toBeNull()
  })

  it('tazeleme: betik yoksa hiçbir şey başlatmaz; önbellek 6 saatten tazeyse başlatmaz', () => {
    const pano = gecici()
    const depo = gecici()
    expect(bs.gerekirseTazele(pano, depo, SIMDI)).toBe(false)
    fs.mkdirSync(path.join(depo, 'scripts', 'belge'), { recursive: true })
    fs.writeFileSync(path.join(depo, 'scripts', 'belge', 'belge-tazelik.cjs'), '')
    fs.writeFileSync(
      bs.onbellekYolu(pano),
      JSON.stringify({ olculdu: new Date(SIMDI - 3_600_000).toISOString(), cekirdek: [], kirikYeni: [] }),
    )
    expect(bs.gerekirseTazele(pano, depo, SIMDI)).toBe(false)
  })

  it('kaynak: BELGE bloğu ağ ya da git çağırmaz; tazeleme pencere açmaz (windowsHide)', () => {
    const k = fs.readFileSync(path.join(KANCA, 'belge-satiri.cjs'), 'utf8')
    expect(k).not.toMatch(/fetch\(|execFileSync|execSync|'git'/)
    // REC-415: kopuk başlatma ortak başlatıcıdan geçer; `windowsHide` ve gizli konsol ön yüklemesi orada
    expect(k).toMatch(/kopukBaslat\(/)
    const baslatici = fs.readFileSync(path.resolve(process.cwd(), 'scripts', 'board', 'kopuk-baslat.cjs'), 'utf8')
    expect(baslatici).toMatch(/windowsHide: true/)
  })
})

describe('INV-BAGLAM-BELGE-SATIRI-1 · kanca uçtan uca', () => {
  it('kanca iki bloğu basar ve çıkış 0 (bloklamaz)', () => {
    const d = gecici()
    const yol = kayit(d, [cevap({ cache_read_input_tokens: 510_000 })])
    const r = spawnSync(process.execPath, [path.join(KANCA, 'defter-tazelik-satiri.cjs')], {
      input: JSON.stringify({ session_id: 'test', transcript_path: yol }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_BOARD_DIR: d, CLAUDE_CODE_AUTO_COMPACT_WINDOW: '' },
      timeout: 30_000,
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/⛔BAGLAM: 510k\/1M — COMPACT YAKIN/)
    expect(r.stdout).toContain('⚠BELGE: OLCULMEDI (onbellek yok)')
  })
})
