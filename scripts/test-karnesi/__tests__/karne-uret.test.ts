import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-TEST-KARNE-4 · karne üreticisinin KARAR KURALLARI (scripts/test-karnesi/karne-uret.cjs).
 *
 * Üretici HÜKÜM VERMEZ, aday önerir; ama adayın hangi kanıttan çıktığı tablo gibi sabittir. Bu dosya o tabloyu ölçer:
 *   1. "dünya olayı kümesi": aynı test ≥3 FARKLI dalda, ardışık ≤12 saat aralıkla kırmızı = PR'dan bağımsız kırmızı,
 *   2. izole kırmızıdan sonra aynı dalda ne oldu (düzeldi / hâlâ kırmızı / belirsiz),
 *   3. ortam hükmü: ölçüm sinyali (sabotajsız kırmızı, yerel kırmızı, CI kümesi) > imza > hiçbiri,
 *   4. öneri adayı: taşındı > sahte yeşil > ortam > dünya durumu adayı > kısmi koruma > çoklu koruma > ölçülmedi > koru,
 *   5. kısmi koruma: test KIRMIZI verir ama ölçülen bir bozulmaya (ana kayıtta ya da ek yoklamada) YEŞİL kalır,
 *      ve ek yoklama dosyaları (gNN-ek*.jsonl, ek/*.jsonl) ana hükmü EZMEZ.
 *   6. çelişki: aynı test iki kayıtta FARKLI hükümle geçerse SESSİZCE biri seçilmez (Recep 10-06); yalnız
 *      `yerine-gecen.json` ile AÇIKÇA ilan edilmiş (gerekçeli) yeniden ölçüm önceki kaydın yerine geçer.
 * Sessiz bozulma: "ölçülmedi" bir test için "KORU" yazılırsa karne boş yere güven üretir; kısmi koruma "KORU" yazılırsa
 * kör nokta gizlenir (g02 ek yoklamasında 8 testin 8'i kırmızı verirken bir kolu görmüyordu); çelişki sessizce çözülürse
 * iki ajanın aynı test için ayrı hüküm verdiği bilgisi kaybolur.
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
  sabotajOzeti: (g: Record<string, unknown>) => Record<string, unknown>
  ekOku: (dizin: string) => Map<string, Array<{ ad: string; sonuc: string; kaynak: string }>>
  sabotajBirlestir: (test: string, liste: Array<{ dosya: string; kayit: Record<string, unknown> }>, ilan?: { dosya: string; neden: string }) => Record<string, unknown>
  sabotajOku: (dizin: string) => Map<string, Record<string, unknown>>
  yerineGecenOku: (dizin: string) => Map<string, { dosya: string; neden: string }>
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
  it('kırmızı veriyor ama bir bozulmayı görmüyorsa KISMI-KORUMA: çoklu koruma adaylığından ÖNCE, sebepte bozulma adı', () => {
    const kismi = { ...olculdu('KIRMIZI'), kismi: true, yakalanmayanlar: ['a-kolu'], ekYakalanmayan: ['b-kolu'] }
    const s = al({ sabotaj: kismi, kopya: { olculen: ['b.test.ts'] } })
    expect(s.tur).toBe('KISMI-KORUMA')
    expect(s.sebepler.join(' ')).toContain('a-kolu')
    expect(s.sebepler.join(' ')).toContain('b-kolu')
  })
  it('kısmi koruma SAHTE-YESIL ve ORTAM-INCELE adaylığını geçemez, dünya durumu listesi her şeyden önce kalır', () => {
    const kismi = { kismi: true, yakalanmayanlar: ['x'], ekYakalanmayan: [] as string[] }
    expect(al({ sabotaj: { ...olculdu('YESIL'), ...kismi } }).tur).toBe('SAHTE-YESIL-ADAYI')
    expect(al({ sabotaj: { ...olculdu('TABAN_KIRMIZI'), ...kismi } }).tur).toBe('ORTAM-INCELE')
    expect(al({ sabotaj: { ...olculdu('KIRMIZI'), ...kismi }, dunya: { yeniYer: ['zamanli'] } }).tur).toBe('TASINDI')
  })
  it('sabotaj ölçülmediyse "KORU" DEĞİL, OLCULMEDI (boş yere güven üretme)', () => {
    expect(al({ sabotaj: { durum: 'olculmedi' } }).tur).toBe('OLCULMEDI')
  })
  it('hepsi yolundaysa KORU', () => {
    expect(al({}).tur).toBe('KORU')
  })
})

describe('sabotajOzeti — üçüncü soru', () => {
  const kayit = (hukum: string, denemeler: Array<{ ad: string; sonuc: string }>) => ({ hukum, denemeler, ajan: { not: 'ajan notu' } })

  it('kayıt yoksa "ölçülmedi": conformance için ulaşılmadı, diğer kümeler için kapsam dışı (tahmin YOK)', () => {
    const c = K.sabotajOzeti({ sab: undefined, kume: 'conformance' })
    expect(c).toMatchObject({ durum: 'olculmedi' })
    expect(String(c.neden)).toContain('ulaşmadı')
    expect(String(K.sabotajOzeti({ sab: undefined, kume: 'birim' }).neden)).toContain('kapsam dışı')
  })
  it('tek sabotaj yakalandıysa kısmi DEĞİL; ilk deneme yakalanmayıp sonraki yakaladıysa KISMİ', () => {
    const temiz = K.sabotajOzeti({ sab: kayit('KIRMIZI', [{ ad: 'a', sonuc: 'KIRMIZI' }]), kume: 'conformance' })
    expect(temiz).toMatchObject({ denenen: 1, yakalanan: 1, kismi: false, yakalanmayanlar: [] })
    const kismi = K.sabotajOzeti({ sab: kayit('KIRMIZI', [{ ad: 'a', sonuc: 'GECTI' }, { ad: 'b', sonuc: 'KIRMIZI' }]), kume: 'conformance' })
    expect(kismi).toMatchObject({ denenen: 2, yakalanan: 1, kismi: true, yakalanmayanlar: ['a'] })
  })
  it('ek yoklamada yakalanmayan kol da kısmi sayılır; ek yoklama ana hükmü DEĞİŞTİRMEZ', () => {
    const o = K.sabotajOzeti({ sab: kayit('KIRMIZI', [{ ad: 'a', sonuc: 'KIRMIZI' }]), ekler: [{ ad: 'ek-kol', sonuc: 'GECTI' }, { ad: 'ek-2', sonuc: 'KIRMIZI' }], kume: 'conformance' })
    expect(o).toMatchObject({ hukum: 'KIRMIZI', kismi: true, ekDenenen: 2, ekYakalanmayan: ['ek-kol'] })
  })
  it('hüküm YESIL ise kısmi DEĞİL (o zaten SAHTE-YESIL-ADAYI); geçersiz denemeler denenene SAYILMAZ', () => {
    const y = K.sabotajOzeti({ sab: kayit('YESIL', [{ ad: 'a', sonuc: 'GECTI' }, { ad: 'b', sonuc: 'HATA-CAPA' }]), kume: 'conformance' })
    expect(y).toMatchObject({ hukum: 'YESIL', denenen: 1, kismi: false, gecersiz: ['b: HATA-CAPA'] })
  })
})

describe('sabotajBirlestir / sabotajOku — çelişki sessizce çözülmez', () => {
  const kayit = (hukum: string, ek: Record<string, unknown> = {}) => ({ test: 'a.test.ts', hukum, denemeler: [{ ad: 'x', sonuc: hukum === 'KIRMIZI' ? 'KIRMIZI' : 'GECTI' }], ...ek })
  const liste = (...h: Array<[string, string]>) => h.map(([dosya, hukum]) => ({ dosya, kayit: kayit(hukum) }))

  it('tek kayıt aynen döner', () => {
    expect(K.sabotajBirlestir('a.test.ts', liste(['g01.jsonl', 'KIRMIZI']))).toMatchObject({ hukum: 'KIRMIZI' })
    expect(K.sabotajBirlestir('a.test.ts', liste(['g01.jsonl', 'KIRMIZI'])).tekrar).toBeUndefined()
  })
  it('aynı hükümle iki kayıt: son kayıt kullanılır AMA tekrar olarak işaretlenir', () => {
    const b = K.sabotajBirlestir('a.test.ts', liste(['g01.jsonl', 'KIRMIZI'], ['g02.jsonl', 'KIRMIZI']))
    expect(b).toMatchObject({ hukum: 'KIRMIZI', tekrar: { tur: 'ayni-hukum', secilen: 'g02.jsonl' } })
  })
  it('FARKLI hüküm ve ilan YOK: CELISKI, kayıtlar listelenir, hiçbiri seçilmez', () => {
    const b = K.sabotajBirlestir('a.test.ts', liste(['g01.jsonl', 'YESIL'], ['g99.jsonl', 'KIRMIZI']))
    expect(b).toMatchObject({ hukum: 'CELISKI', celiski: [{ dosya: 'g01.jsonl', hukum: 'YESIL' }, { dosya: 'g99.jsonl', hukum: 'KIRMIZI' }] })
    expect(b.denemeler).toEqual([])
  })
  it('AÇIK ilan varsa o kayıt seçilir ve gerekçesi izlenir; ilan edilen dosya listede yoksa ilan işlemez (çelişki sürer)', () => {
    const l = liste(['g01.jsonl', 'YESIL'], ['g99.jsonl', 'KIRMIZI'])
    const b = K.sabotajBirlestir('a.test.ts', l, { dosya: 'g99.jsonl', neden: 'koşucu düzeltildi' })
    expect(b).toMatchObject({ hukum: 'KIRMIZI', tekrar: { tur: 'yerine-gecti', secilen: 'g99.jsonl', neden: 'koşucu düzeltildi' } })
    expect(K.sabotajBirlestir('a.test.ts', l, { dosya: 'g77.jsonl', neden: 'yok' }).hukum).toBe('CELISKI')
  })
  it('sabotajOzeti: çelişkili kayıt "ölçülmedi" DEĞİL, durum=celiski; oneriVer CELISKI-INCELE (dünya durumu listesi hâlâ önce)', () => {
    const q3 = K.sabotajOzeti({ sab: { hukum: 'CELISKI', celiski: [{ dosya: 'g01.jsonl', hukum: 'YESIL' }, { dosya: 'g99.jsonl', hukum: 'KIRMIZI' }] }, kume: 'conformance' })
    expect(q3).toMatchObject({ durum: 'celiski' })
    const g = { sabotaj: q3, ortam: { hukum: 'bagimsiz' }, ci: { kirmizi: 0, dunyaKumesi: 0 }, kopya: { olculen: [] as string[] }, dunya: null }
    expect(K.oneriVer(g).tur).toBe('CELISKI-INCELE')
    expect(K.oneriVer({ ...g, dunya: { yeniYer: ['zamanli'] } }).tur).toBe('TASINDI')
  })

  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'karne-celiski-'))
  afterAll(() => fs.rmSync(dizin, { recursive: true, force: true }))
  const yaz = (ad: string, ...satirlar: Array<Record<string, unknown>>) => fs.writeFileSync(path.join(dizin, ad), `${satirlar.map((s) => JSON.stringify(s)).join('\n')}\n`)

  it('sabotajOku: dosyalar arası çelişki yakalanır; yerine-gecen.json ilanı çözer; bozuk ilan FIRLATIR', () => {
    yaz('g01.jsonl', kayit('YESIL'), { test: 'b.test.ts', hukum: 'KIRMIZI', denemeler: [] })
    yaz('g99.jsonl', kayit('KIRMIZI'))
    let h = K.sabotajOku(dizin)
    expect(h.get('a.test.ts')).toMatchObject({ hukum: 'CELISKI' })
    expect(h.get('b.test.ts')).toMatchObject({ hukum: 'KIRMIZI' })
    fs.writeFileSync(path.join(dizin, 'yerine-gecen.json'), JSON.stringify([{ test: 'a.test.ts', dosya: 'g99.jsonl', neden: 'koşucu sınırı düzeltildi' }]))
    h = K.sabotajOku(dizin)
    expect(h.get('a.test.ts')).toMatchObject({ hukum: 'KIRMIZI', tekrar: { tur: 'yerine-gecti' } })
    fs.writeFileSync(path.join(dizin, 'yerine-gecen.json'), JSON.stringify([{ test: 'a.test.ts', dosya: 'g99.jsonl' }]))
    expect(() => K.sabotajOku(dizin)).toThrow(/neden/)
    fs.writeFileSync(path.join(dizin, 'yerine-gecen.json'), '{"bu":"dizi değil"}')
    expect(() => K.yerineGecenOku(dizin)).toThrow(/dizi/)
  })
})

describe('ekOku — ek yoklama dosyaları', () => {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'karne-ek-'))
  const satir = (test: string, denemeler: Array<{ ad: string; sonuc: string }>) => `${JSON.stringify({ test, hukum: 'KIRMIZI', denemeler })}\n`
  fs.mkdirSync(path.join(dizin, 'ek'))
  fs.writeFileSync(path.join(dizin, 'g01.jsonl'), satir('a.test.ts', [{ ad: 'ana', sonuc: 'KIRMIZI' }]))
  fs.writeFileSync(path.join(dizin, 'g01-ek.jsonl'), `${satir('a.test.ts', [{ ad: 'ek-1', sonuc: 'GECTI' }])}yarım satır {\n`)
  fs.writeFileSync(path.join(dizin, 'g02-ek2.jsonl'), satir('b.test.ts', [{ ad: 'ek-2', sonuc: 'KIRMIZI' }]))
  fs.writeFileSync(path.join(dizin, 'ek', 'g04-kopya.jsonl'), satir('a.test.ts', [{ ad: 'ek-3', sonuc: 'GECTI' }]))
  fs.writeFileSync(path.join(dizin, 'g01-ek.log'), 'bu bir jsonl değil')
  afterAll(() => fs.rmSync(dizin, { recursive: true, force: true }))

  it('gNN-ek*.jsonl ve ek/*.jsonl okunur; ana gNN.jsonl ve .log dosyaları OKUNMAZ', () => {
    const h = K.ekOku(dizin)
    expect(h.get('a.test.ts')?.map((x) => x.ad).sort()).toEqual(['ek-1', 'ek-3'])
    expect(h.get('b.test.ts')?.map((x) => x.ad)).toEqual(['ek-2'])
    expect([...h.values()].flat().some((x) => x.ad === 'ana')).toBe(false)
  })
  it('yarım satır atlanır, kayıt kaynağı dosya adıyla izlenir; dizin yoksa boş harita', () => {
    const h = K.ekOku(dizin)
    expect(h.get('a.test.ts')?.find((x) => x.ad === 'ek-3')?.kaynak).toBe('g04-kopya.jsonl')
    expect(K.ekOku(path.join(dizin, 'yok')).size).toBe(0)
  })
})
