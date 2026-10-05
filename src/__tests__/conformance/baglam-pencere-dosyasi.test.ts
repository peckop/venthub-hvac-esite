// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BAGLAM-PENCERE-1 · kanca bağlam ölçümünü pencere başına dosyaya da yazar (ARC-33 madde 2).
 *
 * BAĞLAM: ops-kokpit `$.session.usage()` ile bağlamı okuyunca değer donuyordu (kokpit 19, gerçek 27).
 * Gerçek ölçümü kanca zaten her istemde yapıyor; mod oradan okusun diye aynı değer
 * `~/.claude/mod-durum/pencereler/<sid>.json` dosyasına yazılır. Yazım fail-open ve atomiktir.
 */

interface Baglam {
  COMPACT_SONRASI: string
  pencereDosyasiYaz: (
    klasor: string,
    sid: string,
    token: number | string | null,
    pencere: number,
    rol?: string,
    simdi?: Date,
    durum?: { durumDosyasi: unknown; durumBulundu: unknown; yarimIs: unknown },
  ) => string | null
  pencereDurumOzeti: (
    klasor: string,
    sid: string,
    transcriptPath: string | undefined,
    token: number | string | null,
    pencere: number,
    simdi?: number,
    bul?: ((sid: string, transcriptPath: string | undefined) => { tam: string } | null) | null,
  ) => { durumDosyasi: string | null; durumBulundu: number | null; yarimIs: string }
  yarimIsOku: (metin: string) => string
  DURUM_ARAMA_ARALIGI_MS: number
}

const KANCA = path.resolve(process.cwd(), '.claude', 'hooks')
const gerek = createRequire(import.meta.url)
const bd = gerek(path.join(KANCA, 'baglam-doluluk.cjs')) as Baglam

const SID = '65844ccb-e970-48ab-a9f2-0e497c6a7ef9'
const SIMDI = new Date('2026-10-04T09:00:00Z')

function gecici(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'baglam-pencere-'))
}

describe('INV-BAGLAM-PENCERE-1 · pencereDosyasiYaz', () => {
  it('ölçülen değeri sid adlı dosyaya yazar: baglamToken, durum, pencere, saat, rol, sid', () => {
    const d = gecici()
    const yol = bd.pencereDosyasiYaz(d, SID, 272_000, 1_000_000, 'arac', SIMDI)
    expect(yol).toBe(path.join(d, SID + '.json'))
    const k = JSON.parse(fs.readFileSync(yol ?? '', 'utf8')) as Record<string, unknown>
    expect(k).toEqual({
      sid: SID,
      baglamToken: 272_000,
      durum: 'olculdu',
      pencere: 1_000_000,
      saat: '2026-10-04T09:00:00.000Z',
      rol: 'ARAC',
      durumDosyasi: null,
      durumBulundu: null,
      yarimIs: 'bilinmiyor',
    })
  })

  it('durum verilirse compact hazırlık alanları (durumDosyasi, durumBulundu, yarimIs) dosyaya yazılır; geçersiz yarimIs "bilinmiyor" olur', () => {
    const d = gecici()
    bd.pencereDosyasiYaz(d, SID, 520_000, 1_000_000, 'arac', SIMDI, { durumDosyasi: '/x/arac-durumu.md', durumBulundu: 1_790_000_000_000, yarimIs: 'yok' })
    const a = JSON.parse(fs.readFileSync(path.join(d, SID + '.json'), 'utf8')) as Record<string, unknown>
    expect(a.durumDosyasi).toBe('/x/arac-durumu.md')
    expect(a.durumBulundu).toBe(1_790_000_000_000)
    expect(a.yarimIs).toBe('yok')
    bd.pencereDosyasiYaz(d, SID, 520_000, 1_000_000, 'arac', SIMDI, { durumDosyasi: 5, durumBulundu: 'x', yarimIs: 'belki' })
    const b = JSON.parse(fs.readFileSync(path.join(d, SID + '.json'), 'utf8')) as Record<string, unknown>
    expect(b.durumDosyasi).toBeNull()
    expect(b.durumBulundu).toBeNull()
    expect(b.yarimIs).toBe('bilinmiyor')
  })

  it('compact sonrası ilk mesajda baglamToken null, durum compact-sonrasi (eski değer kalmaz)', () => {
    const d = gecici()
    bd.pencereDosyasiYaz(d, SID, 272_000, 1_000_000, undefined, SIMDI)
    bd.pencereDosyasiYaz(d, SID, bd.COMPACT_SONRASI, 1_000_000, undefined, SIMDI)
    const k = JSON.parse(fs.readFileSync(path.join(d, SID + '.json'), 'utf8')) as Record<string, unknown>
    expect(k.baglamToken).toBeNull()
    expect(k.durum).toBe('compact-sonrasi')
    expect(k.rol).toBeNull()
  })

  it('ölçüm yoksa (null) ya da sid UUID değilse hiçbir şey yazmaz; yol enjeksiyonu kapalı', () => {
    const d = gecici()
    expect(bd.pencereDosyasiYaz(d, SID, null, 1_000_000)).toBeNull()
    expect(bd.pencereDosyasiYaz(d, 'test', 100, 1_000_000)).toBeNull()
    expect(bd.pencereDosyasiYaz(d, '../../etc/passwd', 100, 1_000_000)).toBeNull()
    expect(fs.readdirSync(d)).toEqual([])
  })

  it('atomik: geçici dosya geride kalmaz; ikinci yazım ilkinin üstüne yazar', () => {
    const d = gecici()
    bd.pencereDosyasiYaz(d, SID, 100_000, 1_000_000, undefined, SIMDI)
    bd.pencereDosyasiYaz(d, SID, 130_000, 1_000_000, undefined, SIMDI)
    expect(fs.readdirSync(d)).toEqual([SID + '.json'])
    const k = JSON.parse(fs.readFileSync(path.join(d, SID + '.json'), 'utf8')) as { baglamToken: number }
    expect(k.baglamToken).toBe(130_000)
  })

  it('fail-open: klasör yerine dosya varsa istisna fırlatmaz, null döner', () => {
    const d = gecici()
    const engel = path.join(d, 'pencereler')
    fs.writeFileSync(engel, 'dosya')
    expect(bd.pencereDosyasiYaz(engel, SID, 100, 1_000_000)).toBeNull()
  })
})

describe('INV-BAGLAM-PENCERE-2 · kanca uçtan uca', () => {
  it('UUID sid ile koşan kanca satırı basar VE pencere dosyasına aynı değeri yazar', () => {
    const d = gecici()
    const kayit = path.join(d, 'kayit.jsonl')
    const satir = {
      type: 'assistant',
      isSidechain: false,
      message: { usage: { input_tokens: 10, cache_creation_input_tokens: 0, cache_read_input_tokens: 271_990 } },
    }
    fs.writeFileSync(kayit, JSON.stringify(satir) + '\n')
    const pencereler = path.join(d, 'pencereler')
    const r = spawnSync(process.execPath, [path.join(KANCA, 'defter-tazelik-satiri.cjs')], {
      input: JSON.stringify({ session_id: SID, transcript_path: kayit }),
      encoding: 'utf8',
      env: {
        ...process.env,
        VENTHUB_BOARD_DIR: d,
        VH_PENCERE_KLASORU: pencereler,
        CLAUDE_CODE_AUTO_COMPACT_WINDOW: '',
        CC_LANE: 'arac',
      },
      timeout: 30_000,
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/BAGLAM: 272k\/1M/)
    const k = JSON.parse(fs.readFileSync(path.join(pencereler, SID + '.json'), 'utf8')) as {
      baglamToken: number
      rol: string
      durumDosyasi: string | null
      yarimIs: string
    }
    expect(k.baglamToken).toBe(272_000)
    expect(k.rol).toBe('ARAC')
    // %27 < %40: durum dosyası aranmaz (istem başına ~300 ms harcanmaz), alanlar şemada yine de var.
    expect(k.durumDosyasi).toBeNull()
    expect(k.yarimIs).toBe('bilinmiyor')
  })

  it('bağlam %52 iken kanca önbellekteki durum dosyasını okur ve pencere dosyasına yarimIs + yol yazar (istem tarafı bağlantısı)', () => {
    const d = gecici()
    const kayit = path.join(d, 'kayit.jsonl')
    const satir = {
      type: 'assistant',
      isSidechain: false,
      message: { usage: { input_tokens: 10, cache_creation_input_tokens: 0, cache_read_input_tokens: 519_990 } },
    }
    fs.writeFileSync(kayit, JSON.stringify(satir) + '\n')
    const durum = path.join(d, 'arac-serit-durumu.md')
    fs.writeFileSync(durum, '# Durum\nYarım iş yok.\n')
    const pencereler = path.join(d, 'pencereler')
    fs.mkdirSync(pencereler)
    // Önceki istemin kaydı: yol 1 dakika önce bulunmuş → önbellek geçerli, ~300 ms'lik arama koşmaz.
    const bulundu = Date.now() - 60_000
    fs.writeFileSync(path.join(pencereler, SID + '.json'), JSON.stringify({ sid: SID, durumDosyasi: durum, durumBulundu: bulundu }) + '\n')
    const r = spawnSync(process.execPath, [path.join(KANCA, 'defter-tazelik-satiri.cjs')], {
      input: JSON.stringify({ session_id: SID, transcript_path: kayit }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_BOARD_DIR: d, VH_PENCERE_KLASORU: pencereler, CLAUDE_CODE_AUTO_COMPACT_WINDOW: '', CC_LANE: 'arac' },
      timeout: 30_000,
    })
    expect(r.status).toBe(0)
    const k = JSON.parse(fs.readFileSync(path.join(pencereler, SID + '.json'), 'utf8')) as {
      baglamToken: number
      durumDosyasi: string | null
      durumBulundu: number | null
      yarimIs: string
    }
    expect(k.baglamToken).toBe(520_000)
    expect(k.durumDosyasi).toBe(durum)
    expect(k.durumBulundu).toBe(bulundu)
    expect(k.yarimIs).toBe('yok')
  })
})

describe('INV-BAGLAM-PENCERE-3 · compact hazırlık verisi (ARC-31 madde 2)', () => {
  const T0 = 1_790_000_000_000
  const DAKIKA = 60_000

  /** Pencere dosyasına bir önceki istemin kaydını bırakır (önbellek buradan okunur). */
  function onceki(klasor: string, ek: Record<string, unknown>): void {
    fs.writeFileSync(path.join(klasor, SID + '.json'), JSON.stringify({ sid: SID, ...ek }) + '\n')
  }
  function durumDosyasi(icerik: string): string {
    const yol = path.join(gecici(), 'arac-serit-durumu.md')
    fs.writeFileSync(yol, icerik)
    return yol
  }

  it('yarimIsOku: SON ifade kazanır; harf biçimi önemsiz; belirsizlik "yok" DEMEZ', () => {
    expect(bd.yarimIsOku('Yarım iş yok.')).toBe('yok')
    expect(bd.yarimIsOku('yarım işim yok')).toBe('yok')
    expect(bd.yarimIsOku('YARIM İŞ YOK')).toBe('yok')
    expect(bd.yarimIsOku('Yarım iş: var (PR açılacak)')).toBe('var')
    expect(bd.yarimIsOku('Yarım iş: var\n... sonra ...\nYarım iş yok.')).toBe('yok')
    expect(bd.yarimIsOku('Yarım iş yok.\n... sonra ...\nYarım iş: var')).toBe('var')
    // Güvenli yön: ifade yoksa ya da başka bir sözcüğün başıysa "bilinmiyor".
    expect(bd.yarimIsOku('hiçbir şey yazılmamış')).toBe('bilinmiyor')
    expect(bd.yarimIsOku('yarım iş yoktu')).toBe('bilinmiyor')
    expect(bd.yarimIsOku('Yarım iş: Paket K bozma sonucu')).toBe('bilinmiyor')
    expect(bd.yarimIsOku('')).toBe('bilinmiyor')
  })

  it('bağlam %40 altında durum dosyası ARANMAZ (bulucu çağrılmaz); alanlar bilinmiyor', () => {
    const d = gecici()
    let cagri = 0
    const r = bd.pencereDurumOzeti(d, SID, undefined, 300_000, 1_000_000, T0, () => {
      cagri++
      return null
    })
    expect(cagri).toBe(0)
    expect(r).toEqual({ durumDosyasi: null, durumBulundu: null, yarimIs: 'bilinmiyor' })
  })

  it('bağlam %40 ve üstünde bulucu çağrılır; yol ve "yarım iş" ifadesi dosyadan okunur', () => {
    const d = gecici()
    const yol = durumDosyasi('# Durum\nYarım iş yok.\n')
    const r = bd.pencereDurumOzeti(d, SID, undefined, 520_000, 1_000_000, T0, () => ({ tam: yol }))
    expect(r).toEqual({ durumDosyasi: yol, durumBulundu: T0, yarimIs: 'yok' })
    const var2 = durumDosyasi('Yarım iş: var (PR açılacak)\n')
    const r2 = bd.pencereDurumOzeti(gecici(), SID, undefined, 520_000, 1_000_000, T0, () => ({ tam: var2 }))
    expect(r2.yarimIs).toBe('var')
  })

  it('önbellek: 10 dakika dolmadan bulucu YENİDEN çağrılmaz, dosya her seferinde yeniden okunur; dolunca tekrar aranır', () => {
    const d = gecici()
    const yol = durumDosyasi('Yarım iş: var\n')
    onceki(d, { durumDosyasi: yol, durumBulundu: T0 })
    let cagri = 0
    const bul = (): { tam: string } => {
      cagri++
      return { tam: yol }
    }
    expect(bd.pencereDurumOzeti(d, SID, undefined, 600_000, 1_000_000, T0 + 9 * DAKIKA, bul).yarimIs).toBe('var')
    expect(cagri).toBe(0)
    // Dosya bu arada güncellendi: yeni ifade bulucuya gerek kalmadan görünür.
    fs.writeFileSync(yol, 'Yarım iş: var\nYarım iş yok.\n')
    expect(bd.pencereDurumOzeti(d, SID, undefined, 600_000, 1_000_000, T0 + 9 * DAKIKA, bul).yarimIs).toBe('yok')
    expect(cagri).toBe(0)
    const r = bd.pencereDurumOzeti(d, SID, undefined, 600_000, 1_000_000, T0 + bd.DURUM_ARAMA_ARALIGI_MS + 1, bul)
    expect(cagri).toBe(1)
    expect(r.durumBulundu).toBe(T0 + bd.DURUM_ARAMA_ARALIGI_MS + 1)
  })

  it('önbellekteki dosya silinmişse yeniden aranır; bulunamazsa bilinmiyor ve eski yol KALMAZ', () => {
    const d = gecici()
    const yol = durumDosyasi('Yarım iş yok.\n')
    onceki(d, { durumDosyasi: yol, durumBulundu: T0 })
    fs.unlinkSync(yol)
    let cagri = 0
    const r = bd.pencereDurumOzeti(d, SID, undefined, 600_000, 1_000_000, T0 + DAKIKA, () => {
      cagri++
      return null
    })
    expect(cagri).toBe(1)
    expect(r.durumDosyasi).toBeNull()
    expect(r.yarimIs).toBe('bilinmiyor')
  })

  it('bağlam %40 altına inse de (compact sonrası) önbellekteki yol korunur; durum dosyası güncelliği compact sonrası da ölçülebilir', () => {
    const d = gecici()
    const yol = durumDosyasi('Yarım iş yok.\n')
    onceki(d, { durumDosyasi: yol, durumBulundu: T0 })
    const r = bd.pencereDurumOzeti(d, SID, undefined, bd.COMPACT_SONRASI, 1_000_000, T0 + DAKIKA, () => {
      throw new Error('çağrılmamalı')
    })
    expect(r.durumDosyasi).toBe(yol)
    expect(r.yarimIs).toBe('yok')
  })

  it('yalnız dosyanın SON 24 KB\'ı okunur: baştaki eski ifade sayılmaz', () => {
    const d = gecici()
    const yol = durumDosyasi('Yarım iş yok.\n' + 'x'.repeat(40_000) + '\n')
    const r = bd.pencereDurumOzeti(d, SID, undefined, 520_000, 1_000_000, T0, () => ({ tam: yol }))
    expect(r.yarimIs).toBe('bilinmiyor')
    expect(r.durumDosyasi).toBe(yol)
  })

  it('fail-open: bulucu istisna fırlatır, sid geçersiz, dosya okunamaz → bilinmiyor; istisna dışarı çıkmaz', () => {
    const d = gecici()
    const sifir = { durumDosyasi: null, durumBulundu: null, yarimIs: 'bilinmiyor' }
    expect(
      bd.pencereDurumOzeti(d, SID, undefined, 520_000, 1_000_000, T0, () => {
        throw new Error('bulucu patladı')
      }),
    ).toEqual(sifir)
    expect(bd.pencereDurumOzeti(d, '../../x', undefined, 520_000, 1_000_000, T0, () => ({ tam: durumDosyasi('Yarım iş yok.') }))).toEqual(sifir)
    expect(bd.pencereDurumOzeti(d, SID, undefined, 520_000, 1_000_000, T0, () => ({ tam: path.join(d, 'yok-boyle-dosya.md') }))).toEqual(sifir)
  })
})
