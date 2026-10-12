import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SAHIPSIZ-PR-1 · Sahipsiz PR kapısı (ARC-111, OPS-120 madde 3).
 *
 * Ölçülmüş vaka (12 Ekim 2026): #1670 9 gün, #1446 15 gün, #1345 19 gün açık bekledi, kimse sahibi
 * değildi; PR yaşını ölçen ya da PR'ı kartla eşleyen bileşen yoktu. Bu dosya karar çekirdeğini
 * (saf), durum satırını ve önbellek yolunu kapatır: ağa/gh'ye dokunmaz, girdiyi ÜRETİR.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')

interface Pr {
  number: number
  title: string
  body: string
  created_at: string
}
interface Sahipsiz {
  no: number
  yas: number
  sebep: string
  kart: string[]
}
interface Sonuc {
  sahipsiz: Sahipsiz[]
  esikGun: number
  kartlarOlculemedi: boolean
}

const motor = require_(path.join(KOK, 'scripts', 'hijyen', 'sahipsiz-pr.cjs')) as {
  degerlendir: (g: { prler: Pr[]; kartlar: Map<string, string[]> | null; simdi: number; esikGun?: number }) => Sonuc
  kartNumaralari: (pr: Partial<Pr>) => string[]
  bekleMuaf: (govde: string, simdi: number) => boolean
  kartHaritasi: (kayitlar: unknown) => Map<string, string[]>
  ESIK_GUN: number
}

const satirModulu = require_(path.join(KOK, '.claude', 'hooks', 'sahipsiz-pr-satiri.cjs')) as {
  satir: (s: { durum: string; veri?: Record<string, unknown> }, simdi: number) => string | null
  oku: (yol: string) => { durum: string; veri?: Record<string, unknown> }
  gerekirseTazele: (pano: string, simdi: number) => boolean
  onbellekYolu: (pano: string) => string
  EN_COK_LISTE: number
  BAYAT_SAAT: number
}

const SIMDI = Date.parse('2026-10-12T12:00:00Z')
const gunOnce = (g: number): string => new Date(SIMDI - g * 86400000).toISOString()

function pr(no: number, gun: number, govde = '', baslik = `ARAÇ: iş ${no}`): Pr {
  return { number: no, title: baslik, body: govde, created_at: gunOnce(gun) }
}

const KARTLAR = new Map<string, string[]>([
  ['ARC-1', ['In Progress']],
  ['ARC-5', ['Done']],
  ['ARC-7', ['Done', 'Todo']], // aynı numara iki kartta: biri açık
])

function no(s: Sonuc): number[] {
  return s.sahipsiz.map((p) => p.no)
}

describe('INV-SAHIPSIZ-PR-1 · karar çekirdeği', () => {
  it('⭐örnek dörtlüsü: sahipsiz / kartlı güncel / bekle etiketli / yeni PR', () => {
    const s = motor.degerlendir({
      prler: [
        pr(1446, 15), // kartsız, eski → SAHİPSİZ
        pr(1670, 9, 'Kanban: ARC-1'), // kartlı, açık → sahipli
        pr(1345, 19, 'bekle: 2026-10-20 ALTYAPI kararını bekliyor'), // muaf
        pr(1900, 2), // yeni, kartsız → henüz değil
      ],
      kartlar: KARTLAR,
      simdi: SIMDI,
    })
    expect(no(s), 'sahipsiz kümesi beklenenden farklı').toEqual([1446])
    expect(s.sahipsiz[0].sebep).toBe('kartsiz')
    expect(s.sahipsiz[0].yas).toBe(15)
  })

  it('kartı Done olan eski PR sahipsizdir; kart Kanban\'da yoksa "kart-bulunamadi"', () => {
    const s = motor.degerlendir({
      prler: [pr(10, 8, 'Kanban: ARC-5'), pr(11, 8, 'Kanban: ARC-99')],
      kartlar: KARTLAR,
      simdi: SIMDI,
    })
    expect(s.sahipsiz.map((p) => [p.no, p.sebep])).toEqual([
      [10, 'kart-kapali'],
      [11, 'kart-bulunamadi'],
    ])
  })

  it('numara tekil değil: aynı numaralı kartlardan biri açıksa PR sahipli sayılır', () => {
    const s = motor.degerlendir({ prler: [pr(12, 30, 'Kanban: ARC-7')], kartlar: KARTLAR, simdi: SIMDI })
    expect(no(s)).toEqual([])
  })

  it('bekle etiketi tarihi GEÇMİŞSE muaf değildir; engel metni yoksa etiket geçersizdir', () => {
    expect(motor.bekleMuaf('bekle: 2026-10-01 eski engel', SIMDI)).toBe(false)
    expect(motor.bekleMuaf('bekle: 2026-10-12', SIMDI)).toBe(false)
    expect(motor.bekleMuaf('bekle: 2026-10-12 bugün biter, engel var', SIMDI)).toBe(true)
    expect(motor.bekleMuaf('', SIMDI)).toBe(false)
  })

  it('başlıktaki kart numarası da sahibi sayılır (gövde satırı eksik olsa bile)', () => {
    expect(motor.kartNumaralari({ title: 'ARC-1 · şu iş', body: '' })).toContain('ARC-1')
    const s = motor.degerlendir({ prler: [pr(13, 12, '', 'ARC-1 · şu iş')], kartlar: KARTLAR, simdi: SIMDI })
    expect(no(s)).toEqual([])
  })

  it('⭐kart durumu ÖLÇÜLEMEDİYSE varsayılmaz: yalnız kartsızlar sahipsiz, sonuç bunu taşır', () => {
    const s = motor.degerlendir({
      prler: [pr(14, 9), pr(15, 9, 'Kanban: ARC-5')],
      kartlar: null,
      simdi: SIMDI,
    })
    expect(no(s)).toEqual([14])
    expect(s.kartlarOlculemedi).toBe(true)
  })

  it('yaşı çözülemeyen PR\'a sahipsiz damgası vurulmaz; eşik sınırı dahildir (7 gün = sahipsiz)', () => {
    const bozuk: Pr = { number: 16, title: 'x', body: '', created_at: 'bozuk' }
    const s = motor.degerlendir({ prler: [bozuk, pr(17, 7), pr(18, 6)], kartlar: KARTLAR, simdi: SIMDI })
    expect(no(s)).toEqual([17])
    expect(motor.ESIK_GUN).toBe(7)
  })

  it('sıra: en eski önce, eşit yaşta PR numarasına göre', () => {
    const s = motor.degerlendir({ prler: [pr(30, 8), pr(20, 20), pr(25, 8)], kartlar: KARTLAR, simdi: SIMDI })
    expect(no(s)).toEqual([20, 25, 30])
  })

  it('kartHaritasi: aynı numaralı kartların durumları birlikte toplanır, bozuk kayıt atlanır', () => {
    const h = motor.kartHaritasi([
      { identifier: 'ARC-7', status: 'Done' },
      { identifier: 'ARC-7', status: 'Todo' },
      { status: 'Done' },
      null,
    ])
    expect(h.get('ARC-7')).toEqual(['Done', 'Todo'])
    expect(h.size).toBe(1)
    expect(motor.kartHaritasi(undefined).size).toBe(0)
  })
})

describe('INV-SAHIPSIZ-PR-1 · durum satırı', () => {
  const taze = new Date(SIMDI - 30 * 60000).toISOString()
  const olu = new Date(SIMDI - 10 * 3600000).toISOString()

  it('sahipsiz varsa ⛔ satırı PR numarası ve yaşla konuşur', () => {
    const s = satirModulu.satir(
      { durum: 'tamam', veri: { olculdu: taze, sahipsiz: [{ no: 1446, yas: 15, sebep: 'kartsiz', kart: [] }] } },
      SIMDI,
    )
    expect(s).toMatch(/^⛔SAHIPSIZ PR: 1 \(#1446 15g\)/)
  })

  it('liste en çok EN_COK_LISTE gösterir, fazlası sayıyla söylenir', () => {
    const liste = Array.from({ length: 8 }, (_, i) => ({ no: 100 + i, yas: 10, sebep: 'kartsiz', kart: [] }))
    const s = satirModulu.satir({ durum: 'tamam', veri: { olculdu: taze, sahipsiz: liste } }, SIMDI) ?? ''
    expect(s).toMatch(/SAHIPSIZ PR: 8 /)
    expect(s).toMatch(/\+3\)/)
    expect(s).not.toMatch(/#105/)
  })

  it('sorun yoksa SUSAR; önbellek yok/bozuk ise de susar (fail-open)', () => {
    expect(satirModulu.satir({ durum: 'tamam', veri: { olculdu: taze, sahipsiz: [] } }, SIMDI)).toBeNull()
    expect(satirModulu.satir({ durum: 'yok' }, SIMDI)).toBeNull()
    expect(satirModulu.satir({ durum: 'bozuk' }, SIMDI)).toBeNull()
  })

  it('⭐ölçüm hatası kırmızıyı GİZLEMEZ: son bilinen liste korunur ve OLCULEMEDI eki gelir', () => {
    const s = satirModulu.satir(
      { durum: 'tamam', veri: { olculdu: olu, hata: 'ag', sahipsiz: [{ no: 1446, yas: 15, sebep: 'kartsiz', kart: [] }] } },
      SIMDI,
    )
    expect(s).toMatch(/#1446/)
    expect(s).toMatch(/OLCULEMEDI/)
  })

  it('liste boş ama ölçüm bayat ve hatalıysa "OLCULEMEDI" uyarısı verir (sessiz yeşil değil)', () => {
    const s = satirModulu.satir({ durum: 'tamam', veri: { olculdu: olu, hata: 'ag', sahipsiz: [] } }, SIMDI)
    expect(s).toMatch(/^⚠SAHIPSIZ PR: OLCULEMEDI/)
  })

  it('kart durumu ölçülemediyse satır bunu söyler', () => {
    const s = satirModulu.satir(
      { durum: 'tamam', veri: { olculdu: taze, kartlarOlculemedi: true, sahipsiz: [{ no: 5, yas: 9, sebep: 'kartsiz', kart: [] }] } },
      SIMDI,
    )
    expect(s).toMatch(/kart durumu OLCULEMEDI/)
  })

  it('dış veri metne sızmaz: tamsayı olmayan PR numarası/yaş satırdan atılır', () => {
    const s = satirModulu.satir(
      {
        durum: 'tamam',
        veri: {
          olculdu: taze,
          sahipsiz: [
            { no: '1; rm -rf', yas: 9 },
            { no: 7, yas: '<script>' },
            { no: 8, yas: 9 },
          ],
        },
      },
      SIMDI,
    ) ?? ''
    expect(s).toMatch(/\(#8 9g\)/)
    expect(s).not.toMatch(/rm -rf|script/)
  })

  it('önbellek yolu: okunur, bozuk JSON "bozuk" döner', () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'sahipsiz-pr-'))
    const yol = satirModulu.onbellekYolu(d)
    expect(satirModulu.oku(yol).durum).toBe('yok')
    fs.writeFileSync(yol, '{bozuk')
    expect(satirModulu.oku(yol).durum).toBe('bozuk')
    fs.writeFileSync(yol, JSON.stringify({ olculdu: taze, sahipsiz: [] }))
    expect(satirModulu.oku(yol).durum).toBe('tamam')
    fs.rmSync(d, { recursive: true, force: true })
  })

  it('tazeleme: taze önbellek ya da taze kilit varken yeni süreç BAŞLATILMAZ', () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'sahipsiz-pr-'))
    const yol = satirModulu.onbellekYolu(d)
    fs.writeFileSync(yol, JSON.stringify({ olculdu: new Date(SIMDI - 5 * 60000).toISOString(), sahipsiz: [] }))
    expect(satirModulu.gerekirseTazele(d, SIMDI)).toBe(false)
    // eski önbellek + taze kilit
    fs.writeFileSync(yol, JSON.stringify({ olculdu: new Date(SIMDI - 5 * 3600000).toISOString(), sahipsiz: [] }))
    fs.writeFileSync(yol + '.kilit', String(SIMDI))
    fs.utimesSync(yol + '.kilit', new Date(SIMDI), new Date(SIMDI))
    expect(satirModulu.gerekirseTazele(d, SIMDI)).toBe(false)
    fs.rmSync(d, { recursive: true, force: true })
  })
})

describe('INV-SAHIPSIZ-PR-1 · bağlama', () => {
  it('durum satırı kancası sahipsiz-pr-satiri.cjs\'i çağırır ve bloklamaz', () => {
    const k = fs.readFileSync(path.join(KOK, '.claude', 'hooks', 'defter-tazelik-satiri.cjs'), 'utf8')
    expect(k).toMatch(/require\(path\.join\(__dirname, 'sahipsiz-pr-satiri\.cjs'\)\)/)
    expect(k).toMatch(/SAHIPSIZ PR: OLCULEMEDI/)
  })

  it('betik salt okur: gh api GET + dışa aktarım; PR/kart yazan çağrı yok', () => {
    const b = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'sahipsiz-pr.cjs'), 'utf8')
    expect(b).not.toMatch(/-X\s+(POST|PUT|PATCH|DELETE)|'--method'|pr',\s*'(merge|close|edit|comment)'/)
  })
})
