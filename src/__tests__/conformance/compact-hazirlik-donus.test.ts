// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-COMPACT-HAZIRLIK-1..3 · compact hazırlığı kancadan gelir, dönüşte ilk satır ölçülür (ARC-131 madde 1 ve 4).
 *
 * BAĞLAM: bağlam eşiğe gelince pencere "durum dosyam güncel mi / yarım iş var mı / /compact satırı" hazırlığını elle
 * kuruyordu; hüküm pencerenin hafızasına bağlıydı. Kanca artık hükmü (HAZIR / DEĞİL + neden) ve /compact metnini
 * kendisi üretir. Dönüşte "bana ulaşan son girdin" satırı kuralı da bugüne dek hiç ölçülmüyordu.
 */

interface Hazirlik {
  hazir: boolean
  neden: string
  compactMetni?: string
}
interface Baglam {
  COMPACT_SONRASI: string
  HAZIR_YAS_DK: number
  satir: (token: number | string | null, pencere: number, hazirlik?: Hazirlik | null) => string | null
  compactIcerigi: (metin: string) => { kartlar: string[]; yarim: string | null }
  compactMetni: (icerik: { kartlar: string[]; yarim: string | null }) => string
  hazirlikHukmu: (yasMs: number | null, yarimIs: string) => { hazir: boolean; neden: string }
  pencereDurumOzeti: (
    klasor: string,
    sid: string,
    transcriptPath: string | undefined,
    token: number | string | null,
    pencere: number,
    simdi?: number,
    bul?: ((sid: string, transcriptPath: string | undefined) => { tam: string } | null) | null,
  ) => Record<string, unknown>
  pencereDosyasiYaz: (
    klasor: string,
    sid: string,
    token: number | string | null,
    pencere: number,
    rol?: string,
    simdi?: Date,
    durum?: Record<string, unknown>,
    donusBildirilen?: string | null,
  ) => string | null
  donusKontrolu: (kayitYolu: string) => { anahtar: string; tamam: boolean } | null
  donusSatiri: (sonuc: { anahtar: string; tamam: boolean } | null, bildirilen: string | null) => string | null
  donusBildirilenOku: (klasor: string, sid: string) => string | null
}

const gerek = createRequire(import.meta.url)
const bd = gerek(path.join(process.cwd(), '.claude', 'hooks', 'baglam-doluluk.cjs')) as Baglam

const SID = '65844ccb-e970-48ab-a9f2-0e497c6a7ef9'
const DK = 60_000

function gecici(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'compact-hazirlik-'))
}

const DURUM_DOSYASI = [
  '## 2026-10-13 — ESKİ BLOK',
  '- AÇIK: ARC-99 eski kart',
  '',
  '## 2026-10-14 — GÜNCELLEME 56',
  '- BİTTİ: ARC-118 (Done)',
  '- AÇIK: ARC-125 (Review), ARC-131 (Sürüyor); ARC-125 yeniden',
  '- SIRADA: OPS-134 sonrası ARC-132..134, ARC-126',
  '- Yarım iş: yok — açık PR yok',
].join('\n')

describe('INV-COMPACT-HAZIRLIK-1 · /compact metni durum dosyasının SON bloğundan üretilir', () => {
  it('son bloktaki kart numaralarını tekil ve sıralı alır; eski bloğun kartı girmez', () => {
    const i = bd.compactIcerigi(DURUM_DOSYASI)
    expect(i.kartlar).toEqual(['ARC-125', 'ARC-131', 'OPS-134', 'ARC-132', 'ARC-126'])
    expect(i.kartlar).not.toContain('ARC-99')
    expect(i.yarim).toBe('yok — açık PR yok')
  })

  it('kart sayısı en çok 8, "yarım iş" metni en çok 120 karakter (keyfi dosya metni taşınmaz)', () => {
    const cok = '## b\n- AÇIK: ' + Array.from({ length: 20 }, (_, n) => 'ARC-' + (100 + n)).join(', ') + '\n- Yarım iş: var — ' + 'x'.repeat(400)
    const i = bd.compactIcerigi(cok)
    expect(i.kartlar).toHaveLength(8)
    expect(i.yarim?.length).toBe(120)
  })

  it('metin filo-ortak kalıbıyla aynı: söz koruma, kartlar, yarım işler, ayrıntı durum dosyasında', () => {
    const m = bd.compactMetni(bd.compactIcerigi(DURUM_DOSYASI))
    expect(m).toMatch(/^\/compact Recep'in son sözlerini aynen koru\. Şunları koru: ARC-125, ARC-131/)
    expect(m).toContain('yarım işler (yok)')
    expect(m).toContain('Ayrıntı durum dosyamda. Araç çıktılarını ve eski ölçüm ayrıntılarını at.')
  })

  it('madde işaretsiz "Yarım iş:" satırı da okunur (filo-ortak kalıbı işaretsiz yazar); metne taşınır', () => {
    const i = bd.compactIcerigi('## b\n- AÇIK: ARC-7\nYarım iş: var — ARC-7 PR dalda, OPS onayı bekliyor')
    expect(i.yarim).toBe('var — ARC-7 PR dalda, OPS onayı bekliyor')
    expect(bd.compactMetni(i)).toContain('yarım işler (var — ARC-7 PR dalda, OPS onayı bekliyor)')
    expect(bd.compactIcerigi('## b\nYarım iş: yok — kısa').yarim).toBe('yok — kısa')
  })

  it('işaretsiz yalnız "Yarım iş:" satırı alınır; sıradan düz yazı satırı kart ve yarım iş sayılmaz', () => {
    const i = bd.compactIcerigi('## b\nBugün ARC-9 üzerinde çalıştım, açık kalan ARC-10 var.\nYarım iş yok mu diye baktım')
    expect(i.kartlar).toEqual([])
    expect(i.yarim).toBeNull()
  })

  it('kart bulunamazsa uydurmaz: "açık kartlar" yazar', () => {
    const m = bd.compactMetni(bd.compactIcerigi('## b\n- AÇIK: kart yok'))
    expect(m).toContain('Şunları koru: açık kartlar, yarım işler (yok)')
  })
})

describe('INV-COMPACT-HAZIRLIK-2 · hüküm: yalnız taze dosya VE "yarım iş yok" iken HAZIR', () => {
  it('taze + yok → HAZIR', () => {
    expect(bd.hazirlikHukmu(5 * DK, 'yok')).toMatchObject({ hazir: true })
  })
  it('bayat (>60 dk) → DEĞİL ve neden dakikayı söyler', () => {
    const h = bd.hazirlikHukmu(61 * DK, 'yok')
    expect(h.hazir).toBe(false)
    expect(h.neden).toContain('bayat (61 dk')
  })
  it('yarım iş var → DEĞİL', () => {
    expect(bd.hazirlikHukmu(5 * DK, 'var')).toMatchObject({ hazir: false, neden: 'yarim is var' })
  })
  it('belirsizlik HAZIR demez: satır yok / dosya yok', () => {
    expect(bd.hazirlikHukmu(5 * DK, 'bilinmiyor').hazir).toBe(false)
    expect(bd.hazirlikHukmu(null, 'yok').hazir).toBe(false)
  })

  it('COMPACT YAKIN satırı hükmü ve hazır metni taşır; hazırlık verilmezse eski satır aynen kalır', () => {
    const eski = bd.satir(520_000, 1_000_000)
    const hazir = bd.satir(520_000, 1_000_000, { hazir: true, neden: 'durum dosyasi 3 dk once guncellendi, yarim is yok', compactMetni: '/compact X' })
    const degil = bd.satir(520_000, 1_000_000, { hazir: false, neden: 'yarim is var' })
    expect(hazir).toContain('HAZIRLIK: HAZIR')
    expect(hazir).toContain('/compact X')
    expect(degil).toContain('HAZIRLIK: DEGIL (yarim is var)')
    expect(degil).not.toContain('/compact X')
    expect(eski).not.toContain('HAZIRLIK:')
    expect(hazir?.endsWith(eski?.slice(eski.indexOf(' ⭐RECEP')) ?? '###')).toBe(true) // üç parçalı not korunur
  })

  it('eşik altında hüküm satıra girmez', () => {
    expect(bd.satir(100_000, 1_000_000, { hazir: true, neden: 'x', compactMetni: '/compact X' })).toBe('BAGLAM: 100k/1M')
  })

  it('pencere dosyası: ≥%40 iken hazir/hazirNeden/compactMetni yazılır; altında alanlar YOK', () => {
    const klasor = gecici()
    const durum = path.join(klasor, 'arac-durumu.md')
    fs.writeFileSync(durum, DURUM_DOSYASI, 'utf8')
    const simdi = Date.now()
    const yuksek = bd.pencereDurumOzeti(klasor, SID, undefined, 450_000, 1_000_000, simdi, () => ({ tam: durum }))
    expect(yuksek).toMatchObject({ yarimIs: 'yok', hazir: true })
    expect(String(yuksek.compactMetni)).toContain('ARC-125')
    const yol = bd.pencereDosyasiYaz(klasor, SID, 450_000, 1_000_000, 'arac', new Date(simdi), yuksek)
    const k = JSON.parse(fs.readFileSync(yol ?? '', 'utf8')) as Record<string, unknown>
    expect(k.hazir).toBe(true)
    expect(String(k.compactMetni)).toContain('/compact')

    const klasor2 = gecici()
    const dusuk = bd.pencereDurumOzeti(klasor2, SID, undefined, 100_000, 1_000_000, simdi, () => ({ tam: durum }))
    const yol2 = bd.pencereDosyasiYaz(klasor2, SID, 100_000, 1_000_000, 'arac', new Date(simdi), dusuk)
    const k2 = JSON.parse(fs.readFileSync(yol2 ?? '', 'utf8')) as Record<string, unknown>
    expect('hazir' in k2).toBe(false)
    expect('compactMetni' in k2).toBe(false)
  })

  it('bayat durum dosyası pencere dosyasına hazir:false yazar', () => {
    const klasor = gecici()
    const durum = path.join(klasor, 'eski.md')
    fs.writeFileSync(durum, DURUM_DOSYASI, 'utf8')
    const eski = new Date(Date.now() - 3 * 60 * 60_000)
    fs.utimesSync(durum, eski, eski)
    const o = bd.pencereDurumOzeti(klasor, SID, undefined, 450_000, 1_000_000, Date.now(), () => ({ tam: durum }))
    expect(o.hazir).toBe(false)
    expect(String(o.hazirNeden)).toContain('bayat')
  })
})

describe('INV-COMPACT-HAZIRLIK-3 · dönüşte ilk satır "bana ulaşan son girdin" ile başlamalı', () => {
  const sinir = { type: 'system', subtype: 'compact_boundary', uuid: 'sinir-1', isSidechain: false }
  const kopya = { type: 'assistant', isSidechain: false, message: { usage: { input_tokens: 0 }, content: [{ type: 'text', text: 'eski cevap kopyası' }] } }
  const cevap = (metin: string, kullanim = 1500) => ({
    type: 'assistant',
    isSidechain: false,
    message: { usage: { input_tokens: kullanim }, content: [{ type: 'text', text: metin }] },
  })
  const aracCagrisi = { type: 'assistant', isSidechain: false, message: { usage: { input_tokens: 900 }, content: [{ type: 'tool_use', name: 'Bash' }] } }

  function kayit(satirlar: unknown[]): string {
    const yol = path.join(gecici(), 'oturum.jsonl')
    fs.writeFileSync(yol, satirlar.map((s) => JSON.stringify(s)).join('\n') + '\n', 'utf8')
    return yol
  }

  it('ilk gerçek cevap kuralla başlıyorsa tamam (sıfır kullanımlı kopya satır atlanır)', () => {
    const s = bd.donusKontrolu(kayit([sinir, kopya, aracCagrisi, cevap('bana ulaşan son girdin: OPS #1934 onayı.\n\nDevam.')]))
    expect(s).toEqual({ anahtar: 'sinir-1', tamam: true })
  })

  it('büyük harfli ve ASCII yazım da kabul edilir', () => {
    expect(bd.donusKontrolu(kayit([sinir, cevap('Bana ulasan son girdin: x')]))?.tamam).toBe(true)
  })

  it('satır yoksa eksik; uyarı satırı çıkar ve aynı sınır için ikinci kez çıkmaz', () => {
    const s = bd.donusKontrolu(kayit([sinir, cevap('Devam ediyorum, #1934 birleşti.')]))
    expect(s).toEqual({ anahtar: 'sinir-1', tamam: false })
    expect(bd.donusSatiri(s, null)).toMatch(/^⚠DONUS: .*bana ulasan son girdin/)
    expect(bd.donusSatiri(s, 'sinir-1')).toBeNull()
    expect(bd.donusSatiri(s, 'baska-sinir')).not.toBeNull()
  })

  it('ölçülemedi ise susar: sınır yok ya da sınırdan sonra cevap yok', () => {
    expect(bd.donusKontrolu(kayit([cevap('merhaba')]))).toBeNull()
    expect(bd.donusKontrolu(kayit([sinir, kopya]))).toBeNull()
    expect(bd.donusSatiri(null, null)).toBeNull()
  })

  it('yalnız SON sınır sayılır: eski compact sınırından önceki cevaplar karışmaz', () => {
    const ikinci = { ...sinir, uuid: 'sinir-2' }
    const s = bd.donusKontrolu(kayit([sinir, cevap('Devam.'), ikinci, cevap('bana ulaşan son girdin: tamam')]))
    expect(s).toEqual({ anahtar: 'sinir-2', tamam: true })
  })

  it('bildirilen sınır kimliği pencere dosyasında kalır ve geri okunur; geçersiz sid null', () => {
    const klasor = gecici()
    bd.pencereDosyasiYaz(klasor, SID, 100_000, 1_000_000, 'arac', new Date(), undefined, 'sinir-7')
    expect(bd.donusBildirilenOku(klasor, SID)).toBe('sinir-7')
    expect(bd.donusBildirilenOku(klasor, '../../etc/passwd')).toBeNull()
    expect(bd.donusBildirilenOku(gecici(), SID)).toBeNull()
  })
})
