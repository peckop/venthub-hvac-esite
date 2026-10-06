import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-KARNE-4 · karne üreticisinin KARAR KURALLARI (scripts/test-karnesi/karne-uret.cjs).
 *
 * Üretici HÜKÜM VERMEZ, aday önerir; ama adayın hangi kanıttan çıktığı tablo gibi sabittir. Bu dosya o tabloyu ölçer:
 *   1. "dünya olayı kümesi": aynı test ≥3 FARKLI dalda, ardışık ≤12 saat aralıkla kırmızı = PR'dan bağımsız kırmızı,
 *   2. izole kırmızıdan sonra aynı dalda ne oldu (düzeldi / hâlâ kırmızı / belirsiz),
 *   3. ortam hükmü: ölçüm sinyali (sabotajsız kırmızı, yerel kırmızı, CI kümesi) > imza > hiçbiri,
 *   4. öneri adayı: taşındı > sahte yeşil > ortam > dünya durumu adayı > çoklu koruma > ölçülmedi > koru.
 * Sessiz bozulma: "ölçülmedi" bir test için "KORU" yazılırsa karne boş yere güven üretir.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const K = require_(path.join(KOK, 'scripts/test-karnesi/karne-uret.cjs')) as {
  kumele: (l: Run[], saat?: number) => Run[][]
  sonrakiSonuc: (dal: Run[], kirmizi: Run, test: string) => string
  ciOzeti: (k: Run[]) => Map<string, Record<string, number | string>>
  ortamHukmu: (g: Record<string, unknown>) => { hukum: string; sebepler: string[] }
  imzaListesi: (o: Record<string, unknown>) => string[]
  oneriVer: (g: Record<string, unknown>) => { tur: string; sebepler: string[] }
}

interface Run {
  kosuId?: number
  olay: string
  dal: string
  sha: string
  olusturma: string
  sonuc: string
  testDosyalari?: Array<{ dosya: string }>
}
const T = (saat: number) => new Date(Date.parse('2026-10-01T00:00:00Z') + saat * 3600000).toISOString()
const kirmizi = (dal: string, saat: number, test: string, o: Partial<Run> = {}): Run => ({
  olay: 'pull_request',
  dal,
  sha: `sha-${dal}-${saat}`,
  olusturma: T(saat),
  sonuc: 'failure',
  testDosyalari: [{ dosya: test }],
  ...o,
})
const yesil = (dal: string, saat: number, o: Partial<Run> = {}): Run => ({ olay: 'pull_request', dal, sha: `sha-${dal}-${saat}`, olusturma: T(saat), sonuc: 'success', ...o })

describe('kumele', () => {
  it('ardışık aralığı ≤ 12 saat olanları bir kümede toplar, 12 saati aşınca böler', () => {
    const k = K.kumele([kirmizi('a', 0, 't'), kirmizi('b', 5, 't'), kirmizi('c', 16, 't'), kirmizi('d', 40, 't')])
    expect(k.map((x) => x.length)).toEqual([3, 1])
  })
  it('sırasız girdiyi zamana göre sıralar', () => {
    const k = K.kumele([kirmizi('c', 10, 't'), kirmizi('a', 0, 't'), kirmizi('b', 5, 't')])
    expect(k).toHaveLength(1)
    expect(k[0].map((x) => x.dal)).toEqual(['a', 'b', 'c'])
  })
})

describe('sonrakiSonuc — kırmızıdan sonra aynı dalda ne oldu', () => {
  const R = kirmizi('d', 10, 'x.test.ts')
  it('farklı commit ve success → düzeldi', () => {
    expect(K.sonrakiSonuc([R, yesil('d', 12)], R, 'x.test.ts')).toBe('duzeldi')
  })
  it('farklı commit, bu test yine kırmızı → hala-kirmizi; başka test kırmızıysa bu test düzeldi', () => {
    expect(K.sonrakiSonuc([R, kirmizi('d', 12, 'x.test.ts')], R, 'x.test.ts')).toBe('hala-kirmizi')
    expect(K.sonrakiSonuc([R, kirmizi('d', 12, 'baska.test.ts')], R, 'x.test.ts')).toBe('duzeldi')
  })
  it('iptal edilen koşular atlanır; sonraki koşu yoksa ya da AYNI commit ise belirsiz', () => {
    expect(K.sonrakiSonuc([R, yesil('d', 11, { sonuc: 'cancelled' }), yesil('d', 13)], R, 'x.test.ts')).toBe('duzeldi')
    expect(K.sonrakiSonuc([R], R, 'x.test.ts')).toBe('belirsiz')
    expect(K.sonrakiSonuc([R, yesil('d', 12, { sha: R.sha })], R, 'x.test.ts')).toBe('belirsiz')
  })
})

describe('ciOzeti', () => {
  const T1 = 'src/__tests__/conformance/dunya.test.ts'
  const T2 = 'src/__tests__/conformance/gercek.test.ts'
  const kosular: Run[] = [
    // T1: 3 farklı dalda 6 saat içinde → bir dünya olayı kümesi (+1 master push)
    kirmizi('a', 0, T1),
    kirmizi('b', 2, T1),
    kirmizi('c', 6, T1),
    kirmizi('master', 7, T1, { olay: 'push' }),
    // T2: tek dalda kırmızı, sonra düzeldi
    kirmizi('x', 100, T2),
    yesil('x', 102),
  ]
  const o = K.ciOzeti(kosular)

  it('küme içi kırmızılar dünya olayı sayılır, master push ayrı sayılır', () => {
    expect(o.get(T1)).toMatchObject({ kirmizi: 4, dal: 4, master: 1, dunyaKumesi: 4, kumeSayisi: 1, izole: 0 })
  })
  it('tek dalda izole kırmızı ve düzelmesi "düzeldi" sayılır (gerçek yakalama adayı)', () => {
    expect(o.get(T2)).toMatchObject({ kirmizi: 1, dal: 1, dunyaKumesi: 0, izole: 1, duzeldi: 1, halaKirmizi: 0 })
  })
  it('hiç kırmızı vermeyen test özette YOKTUR (çağıran 0 kabul eder)', () => {
    expect(o.get('yok.test.ts')).toBeUndefined()
  })
  it('aynı dalda ≥3 koşu tek dal sayılır: iki dal bir küme DEĞİL (MIN_DAL=3)', () => {
    const iki = K.ciOzeti([kirmizi('a', 0, T1), kirmizi('a', 1, T1), kirmizi('b', 2, T1)])
    expect(iki.get(T1)).toMatchObject({ dunyaKumesi: 0, izole: 3 })
  })
})

describe('ortamHukmu', () => {
  const temel = { imza: [] as string[], yerelKirmizi: false, tabanKirmizi: false, ciKumeOrani: 0, ajan: undefined as string | undefined }
  it('ölçüm sinyalleri → bagli', () => {
    expect(K.ortamHukmu({ ...temel, tabanKirmizi: true }).hukum).toBe('bagli')
    expect(K.ortamHukmu({ ...temel, yerelKirmizi: true }).hukum).toBe('bagli')
    expect(K.ortamHukmu({ ...temel, ciKumeOrani: 0.5 }).hukum).toBe('bagli')
    expect(K.ortamHukmu({ ...temel, ciKumeOrani: 0.49 }).hukum).toBe('bagimsiz')
  })
  it('yalnız kaynak imzası ya da ajan notu → supheli; "yok" notu şüphe değildir', () => {
    expect(K.ortamHukmu({ ...temel, imza: ['git geçmişi'] }).hukum).toBe('supheli')
    expect(K.ortamHukmu({ ...temel, ajan: 'python3 ister' }).hukum).toBe('supheli')
    expect(K.ortamHukmu({ ...temel, ajan: 'yok (yalnız belge okur)' }).hukum).toBe('bagimsiz')
    expect(K.ortamHukmu(temel).hukum).toBe('bagimsiz')
  })
  it('ölçüm sinyali imzadan ÖNCE gelir (imza varken de bagli)', () => {
    expect(K.ortamHukmu({ ...temel, imza: ['ağ çağrısı'], yerelKirmizi: true }).hukum).toBe('bagli')
  })
  it('imzaListesi yalnız ayırt edici imzaları listeler; sabitlenmiş saat imza değildir', () => {
    expect(K.imzaListesi({ evDizini: true, gitGecmisi: true, saat: true, saatSabitlenmis: true })).toEqual(['ev dizini', 'git geçmişi'])
    expect(K.imzaListesi({ saat: true, saatSabitlenmis: false })).toEqual(['saat (sabitlenmemiş)'])
  })
})

describe('oneriVer — aday sırası', () => {
  const ci0 = { kirmizi: 0, dunyaKumesi: 0 }
  const kopya0 = { olculen: [] as string[] }
  const olculdu = (hukum: string) => ({ durum: 'olculdu', hukum, denenen: 2 })
  const ortam = (hukum: string) => ({ hukum })
  const al = (o: Record<string, unknown>) => K.oneriVer({ sabotaj: olculdu('KIRMIZI'), ortam: ortam('bagimsiz'), ci: ci0, kopya: kopya0, dunya: null, ...o })

  it('dünya durumu listesindeki test her şeyden önce TASINDI', () => {
    expect(al({ dunya: { yeniYer: ['master-push', 'zamanli'] }, sabotaj: olculdu('YESIL') }).tur).toBe('TASINDI')
  })
  it('sabotajların hiçbiri yakalanmadıysa SAHTE-YESIL-ADAYI', () => {
    expect(al({ sabotaj: olculdu('YESIL') }).tur).toBe('SAHTE-YESIL-ADAYI')
  })
  it('sabotajsız kırmızı ORTAM-INCELE', () => {
    expect(al({ sabotaj: olculdu('TABAN_KIRMIZI') }).tur).toBe('ORTAM-INCELE')
  })
  it('ortama bağlı ve kırmızıların çoğu PRdan bağımsızsa TASI-ADAYI-DUNYA-DURUMU', () => {
    expect(al({ ortam: ortam('bagli'), ci: { kirmizi: 10, dunyaKumesi: 6 } }).tur).toBe('TASI-ADAYI-DUNYA-DURUMU')
    expect(al({ ortam: ortam('bagli'), ci: { kirmizi: 10, dunyaKumesi: 4 } }).tur).toBe('KORU')
  })
  it('aynı sabotajı başka test de yakalıyor VE hiç kırmızı vermediyse COKLU-KORUMA-ADAYI', () => {
    expect(al({ kopya: { olculen: ['b.test.ts'] } }).tur).toBe('COKLU-KORUMA-ADAYI')
    expect(al({ kopya: { olculen: ['b.test.ts'] }, ci: { kirmizi: 2, dunyaKumesi: 0 } }).tur).toBe('KORU')
  })
  it('sabotaj ölçülmediyse "KORU" DEĞİL, OLCULMEDI (boş yere güven üretme)', () => {
    expect(al({ sabotaj: { durum: 'olculmedi' } }).tur).toBe('OLCULMEDI')
  })
  it('hepsi yolundaysa KORU', () => {
    expect(al({}).tur).toBe('KORU')
  })
})
