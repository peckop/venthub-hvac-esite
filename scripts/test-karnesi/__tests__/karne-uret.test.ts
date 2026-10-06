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
 *   7. SINIR VE ÖNCELİK TABLOLARI (ALT-38 sertleştirme): her eşik üç yanıyla ayrı ayrı yazılır (altı, TAM kendisi, üstü): 12 saat,
 *      3 dal, yüzde 50; her öncelik çifti ayrı satırdır (üstteki alttakini bastırır). Ölçüm hükmü UYGULANAMADI / TABAN_ATLANDI
 *      hiçbir şey ölçmemiştir: öneri OLCULMEDI olur, KORU olmaz. Üretici (statik.cjs) ve hüküm sözlüğü (sabotaj.cjs) ile sözleşme.
 * Sessiz bozulma: "ölçülmedi" bir test için "KORU" yazılırsa karne boş yere güven üretir; kısmi koruma "KORU" yazılırsa
 * kör nokta gizlenir (g02 ek yoklamasında 8 testin 8'i kırmızı verirken bir kolu görmüyordu); çelişki sessizce çözülürse
 * iki ajanın aynı test için ayrı hüküm verdiği bilgisi kaybolur.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const K = require_(path.join(KOK, 'scripts/test-karnesi/karne-uret.cjs')) as {
  KUMELEME_SAAT: number
  MIN_DAL: number
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

// Sözleşme testleri için YALNIZ OKUNAN komşular (hiçbiri değiştirilmez): girdiyi üreten statik.cjs ve hüküm sözlüğünün sahibi sabotaj.cjs.
const STATIK = require_(path.join(KOK, 'scripts/test-karnesi/statik.cjs')) as { analiz: (dosya: string) => { ortam: Record<string, unknown> } }
const SABOTAJ = require_(path.join(KOK, 'scripts/test-karnesi/sabotaj.cjs')) as {
  hukumVer: (taban: { sonuc: string }, denemeler: Array<{ sonuc: string }>) => string
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

// ── Sınır testleri için yardımcılar ────────────────────────────────────────────────────────────────────────────────
// Kesirli saat KULLANILMAZ: `12 + 1 / 3600000` gibi bir değer kayan noktada ±1 ms kayıp sınırı yanlış yana atabilir; ms tam sayıdır.
const SAAT = 3600000
const TMs = (ms: number) => new Date(Date.parse('2026-10-01T00:00:00Z') + ms).toISOString()
const kirmiziMs = (dal: string, ms: number, test: string, o: Partial<Run> = {}): Run => ({ ...kirmizi(dal, 0, test), sha: `sha-${dal}-${ms}`, olusturma: TMs(ms), ...o })

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

describe('kumele — 12 saat sınırı TAM eşitlikle (eşiğin altı, kendisi, üstü)', () => {
  const uzunluklar = (l: Run[], saat?: number) => K.kumele(l, saat).map((x) => x.length)

  it('sabitler: KUMELEME_SAAT = 12 ve MIN_DAL = 3 (kural başlığı, cetvel ve CI penceresi bu sayılara dayanır)', () => {
    expect(K.KUMELEME_SAAT).toBe(12)
    expect(K.MIN_DAL).toBe(3)
  })
  it.each<[string, number, number[]]>([
    ['12 sa - 1 ms', 12 * SAAT - 1, [2]],
    ['TAM 12 sa', 12 * SAAT, [2]],
    ['12 sa + 1 ms', 12 * SAAT + 1, [1, 1]],
  ])('varsayılan eşik: iki koşu arası %s', (ad, aralik, beklenen) => {
    expect(uzunluklar([kirmiziMs('a', 0, 't'), kirmiziMs('b', aralik, 't')]), ad).toEqual(beklenen)
  })
  it('saat parametresi verilirse varsayılana DÜŞMEZ: eşik o değerdir (tam eşik = aynı küme, eşik + 1 ms = bölünür)', () => {
    const iki = (ms: number) => [kirmiziMs('a', 0, 't'), kirmiziMs('b', ms, 't')]
    expect(uzunluklar(iki(2 * SAAT), 2)).toEqual([2])
    expect(uzunluklar(iki(2 * SAAT + 1), 2)).toEqual([1, 1])
    expect(uzunluklar(iki(2 * SAAT), 1)).toEqual([1, 1]) // varsayılan 12 sa olsaydı bölünmezdi
    expect(uzunluklar(iki(13 * SAAT), 24)).toEqual([2]) // varsayılan 12 sa olsaydı bölünürdü
  })
  it('aralık kümenin SON koşusuna göre ölçülür (ilkine göre değil): tam 12 saatlik adımlarla 36 saatlik zincir tek kümedir', () => {
    const zincir = [0, 1, 2, 3].map((i) => kirmiziMs(`d${i}`, i * 12 * SAAT, 't'))
    expect(uzunluklar(zincir)).toEqual([4])
    expect(uzunluklar([...zincir.slice(0, 3), kirmiziMs('d3', 3 * 12 * SAAT + 1, 't')])).toEqual([3, 1])
  })
  it('boş girdi → küme yok; tek koşu → tek küme; girdi dizisi DEĞİŞMEZ (sıralama kopya üzerinde)', () => {
    expect(K.kumele([])).toEqual([])
    const tek = kirmizi('a', 0, 't')
    expect(K.kumele([tek])).toEqual([[tek]])
    const girdi = [kirmizi('c', 10, 't'), kirmizi('a', 0, 't')]
    K.kumele(girdi)
    expect(girdi.map((x) => x.dal)).toEqual(['c', 'a'])
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

describe('ciOzeti — küme sınırları TAM eşitlikle (MIN_DAL = 3 dal, 12 saat)', () => {
  const T = 'src/__tests__/conformance/sinir.test.ts'
  const ozet = (...k: Run[]) => K.ciOzeti(k).get(T)

  it.each<[number, number, number, number]>([
    [1, 0, 0, 1],
    [2, 0, 0, 2],
    [3, 3, 1, 0],
    [4, 4, 1, 0],
  ])('%i farklı dalda birer kırmızı (1 saat arayla) → dunyaKumesi %i, kumeSayisi %i, izole %i: eşik TAM 3 dal (3 yeter, 2 yetmez)', (dalSayisi, dunyaKumesi, kumeSayisi, izole) => {
    const kosular = Array.from({ length: dalSayisi }, (_, i) => kirmiziMs(`d${i}`, i * SAAT, T))
    expect(ozet(...kosular)).toMatchObject({ kirmizi: dalSayisi, dal: dalSayisi, dunyaKumesi, kumeSayisi, izole })
  })
  it('12 saat sınırı ciOzeti içinde de geçerli: ardışık tam 12 saatlik 3 dal tek küme; bir aralık 12 saat + 1 ms olunca küme DAĞILIR', () => {
    expect(ozet(kirmiziMs('a', 0, T), kirmiziMs('b', 12 * SAAT, T), kirmiziMs('c', 24 * SAAT, T))).toMatchObject({ dunyaKumesi: 3, kumeSayisi: 1, izole: 0 })
    expect(ozet(kirmiziMs('a', 0, T), kirmiziMs('b', 12 * SAAT, T), kirmiziMs('c', 24 * SAAT + 1, T))).toMatchObject({ dunyaKumesi: 0, kumeSayisi: 0, izole: 3 })
  })
  it('ayrı kümeler ayrı sayılır: 12 saatten uzak iki 3 dallı küme + tek başına bir kırmızı → kumeSayisi 2, dunyaKumesi 6, izole 1', () => {
    const kosular = [
      ...['a', 'b', 'c'].map((d, i) => kirmiziMs(d, i * SAAT, T)),
      ...['d', 'e', 'f'].map((d, i) => kirmiziMs(d, (30 + i) * SAAT, T)),
      kirmiziMs('g', 100 * SAAT, T),
    ]
    expect(ozet(...kosular)).toMatchObject({ kirmizi: 7, dal: 7, dunyaKumesi: 6, kumeSayisi: 2, izole: 1 })
  })
})

describe('ciOzeti — kayıt TAM eşitlikle ve girdi sırasından bağımsız', () => {
  const T = 'src/__tests__/conformance/kayit.test.ts'
  const yesilMs = (dal: string, ms: number): Run => ({ olay: 'pull_request', dal, sha: `sha-${dal}-${ms}`, olusturma: TMs(ms), sonuc: 'success' })
  // Senaryolar (saat): a-b-c + master push = bir dünya olayı kümesi; x: kırmızı → yeşil; v: kırmızı → yeşil → yine kırmızı;
  // y: birbirinden uzak iki kırmızı; master: tek başına push. Gürültü: iptal edilen koşu (testDosyalari dolu olsa da kırmızı DEĞİL)
  // ve BAŞKA testin kırmızısı (bu testin özetine karışmamalı).
  const kosular: Run[] = [
    kirmiziMs('a', 0, T),
    kirmiziMs('b', SAAT, T),
    kirmiziMs('c', 2 * SAAT, T),
    kirmiziMs('master', 3 * SAAT, T, { olay: 'push' }),
    kirmiziMs('z', 50 * SAAT, T, { sonuc: 'cancelled' }),
    kirmiziMs('x', 100 * SAAT, T),
    yesilMs('x', 101 * SAAT),
    kirmiziMs('x', 102 * SAAT, 'baska.test.ts'),
    kirmiziMs('v', 200 * SAAT, T),
    yesilMs('v', 201 * SAAT),
    kirmiziMs('v', 203 * SAAT, T),
    kirmiziMs('y', 300 * SAAT, T),
    kirmiziMs('y', 330 * SAAT, T),
    kirmiziMs('master', 400 * SAAT, T, { olay: 'push' }),
  ]
  const BEKLENEN = { kirmizi: 10, dal: 7, master: 2, dunyaKumesi: 4, kumeSayisi: 1, izole: 6, duzeldi: 2, halaKirmizi: 1, belirsiz: 3, ilk: '2026-10-01', son: '2026-10-17' }

  it('özetin HER alanı tam eşitlikle (toEqual): sayılar, düzelme sonuçları, ilk ve son kırmızı tarihi', () => {
    expect(K.ciOzeti(kosular).get(T)).toEqual(BEKLENEN)
  })
  it('iptal edilen koşu kırmızı sayılmaz; başka testin kırmızısı bu testin özetine karışmaz, kendi özetinde görünür', () => {
    expect(K.ciOzeti(kosular).get(T)?.kirmizi).toBe(10)
    expect(K.ciOzeti(kosular).get('baska.test.ts')).toMatchObject({ kirmizi: 1, dal: 1, dunyaKumesi: 0, izole: 1, belirsiz: 1 })
  })
  it('girdi sırası sonucu DEĞİŞTİRMEZ: CI geçmişi yeniden eskiye ya da karışık gelse de aynı özet (dal koşuları zamana göre sıralanır)', () => {
    expect(K.ciOzeti([...kosular].reverse()).get(T)).toEqual(BEKLENEN)
    const karisik = [...kosular.filter((_, i) => i % 2 === 1), ...kosular.filter((_, i) => i % 2 === 0)]
    expect(K.ciOzeti(karisik).get(T)).toEqual(BEKLENEN)
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

describe('ortamHukmu — ajan notu: "yok" / "hayır" şüphe DEĞİLDİR, başka her not şüphelidir', () => {
  const temel = { imza: [] as string[], yerelKirmizi: false, tabanKirmizi: false, ciKumeOrani: 0 }

  it.each(['yok', 'Yok (yalnız belge okur)', 'yok.', 'hayır', 'Hayır, ortamdan bağımsız', 'HAYIR', 'hayir'])('not "%s" → bagimsiz', (not) => {
    expect(K.ortamHukmu({ ...temel, ajan: not }).hukum).toBe('bagimsiz')
  })
  it.each(['python3 ister', 'evet, ağ ister', 'bilinmiyor', 'kısmen'])('not "%s" → supheli ve sebep notu aynen yazar', (not) => {
    expect(K.ortamHukmu({ ...temel, ajan: not })).toEqual({ hukum: 'supheli', sebepler: [`ajan notu: ${not}`] })
  })
  it('boş / yalnız boşluk / null not şüphe değildir; imza ve not birlikte iki ayrı sebep yazar (imza önce); uzun not 160 karaktere kesilir', () => {
    for (const bos of ['', '   ', null, undefined]) expect(K.ortamHukmu({ ...temel, ajan: bos }).hukum).toBe('bagimsiz')
    expect(K.ortamHukmu({ ...temel, imza: ['git geçmişi', 'ev dizini'], ajan: 'python3 ister' })).toEqual({
      hukum: 'supheli',
      sebepler: ['kaynak imzası: git geçmişi, ev dizini', 'ajan notu: python3 ister'],
    })
    expect(K.ortamHukmu({ ...temel, ajan: `x${'y'.repeat(300)}` }).sebepler).toEqual([`ajan notu: x${'y'.repeat(159)}`])
  })
})

describe('imzaListesi — her ortam bağı kendi alan adıyla ve kendi imzasıyla (tam eşitlik)', () => {
  it.each<[string, Record<string, unknown>, string[]]>([
    ['evDizini', { evDizini: true }, ['ev dizini']],
    ['gitGecmisi', { gitGecmisi: true }, ['git geçmişi']],
    ['ag', { ag: true }, ['ağ çağrısı']],
    ['veritabani', { veritabani: true }, ['veritabanı']],
    ['sunucuGerekir', { sunucuGerekir: true }, ['sunucu ister']],
    ['saat (saatSabitlenmis tanımsız)', { saat: true }, ['saat (sabitlenmemiş)']],
    ['saat (saatSabitlenmis false)', { saat: true, saatSabitlenmis: false }, ['saat (sabitlenmemiş)']],
  ])('alan %s tek başına → yalnız kendi imzası', (ad, ortam, beklenen) => {
    expect(K.imzaListesi(ortam), ad).toEqual(beklenen)
  })
  it('hepsi birden: altı imza bu SIRAYLA çıkar', () => {
    const hepsi = { evDizini: true, gitGecmisi: true, ag: true, veritabani: true, sunucuGerekir: true, saat: true, saatSabitlenmis: false }
    expect(K.imzaListesi(hepsi)).toEqual(['ev dizini', 'git geçmişi', 'ağ çağrısı', 'veritabanı', 'sunucu ister', 'saat (sabitlenmemiş)'])
  })
  it('imza olmayan her şey boş liste verir: boş ortam, kapalı (false) imzalar ve statik.cjs\'in topladığı ama ayırt edici OLMAYAN alanlar', () => {
    expect(K.imzaListesi({})).toEqual([])
    expect(K.imzaListesi({ evDizini: false, gitGecmisi: false, ag: false, veritabani: false, sunucuGerekir: false, saat: false, saatSabitlenmis: false })).toEqual([])
    // Yorumdaki söz: "yalnız ayırt edici olanlar". Biri imza olacaksa bu satır BİLEREK güncellenir.
    const imzasiz = { ortamDegiskenleri: ['X'], mutlakYol: true, altSurec: ['git'], altSurecVar: true, canliAdres: true, saat: false, saatSabitlenmis: true, gitIndeksi: true, yazma: true, platform: true }
    expect(K.imzaListesi(imzasiz)).toEqual([])
  })
  it('üretici ile tüketici sözleşmesi: statik.cjs ortam nesnesi, imzaListesi\'nin okuduğu yedi alanı AYNI adlarla üretir (ad kayması sessiz imza kaybıdır)', () => {
    const uretilen = Object.keys(STATIK.analiz('scripts/test-karnesi/karne-uret.cjs').ortam)
    for (const alan of ['evDizini', 'gitGecmisi', 'ag', 'veritabani', 'sunucuGerekir', 'saat', 'saatSabitlenmis']) expect(uretilen, alan).toContain(alan)
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

describe('oneriVer — sınır ve öncelik tabloları (tam eşitlik; üstteki alttakini bastırır)', () => {
  const ci0 = { kirmizi: 0, dunyaKumesi: 0 }
  const ciW = { kirmizi: 10, dunyaKumesi: 8 } // oran 0,8: ortama bağlı testte TASI-ADAYI koşulu doğru
  const kopya0 = { olculen: [] as string[] }
  const coklu = { olculen: ['b.test.ts'] } // ci.kirmizi = 0 ile birlikte COKLU-KORUMA koşulu doğru
  const dunya = { yeniYer: ['zamanli'] }
  const olculdu = (hukum: string) => ({ durum: 'olculdu', hukum, denenen: 2 })
  const kismi = { ...olculdu('KIRMIZI'), kismi: true, yakalanmayanlar: ['x'], ekYakalanmayan: [] as string[] }
  const celiski = { durum: 'celiski', kaynaklar: [{ dosya: 'g01.jsonl', hukum: 'YESIL' }, { dosya: 'g99.jsonl', hukum: 'KIRMIZI' }] }
  const olculmedi = { durum: 'olculmedi' }
  const ortam = (hukum: string) => ({ hukum })
  const al = (o: Record<string, unknown>) => K.oneriVer({ sabotaj: olculdu('KIRMIZI'), ortam: ortam('bagimsiz'), ci: ci0, kopya: kopya0, dunya: null, ...o })

  it.each<[number, number, string]>([
    [10, 4, 'KORU'],
    [100, 49, 'KORU'],
    [3, 1, 'KORU'],
    [1, 0, 'KORU'],
    [2, 1, 'TASI-ADAYI-DUNYA-DURUMU'],
    [10, 5, 'TASI-ADAYI-DUNYA-DURUMU'],
    [100, 50, 'TASI-ADAYI-DUNYA-DURUMU'],
    [100, 51, 'TASI-ADAYI-DUNYA-DURUMU'],
    [1, 1, 'TASI-ADAYI-DUNYA-DURUMU'],
  ])('ortama bağlı test, CI kırmızı %i, dünya kümesi %i → %s (eşik: oran ≥ 0,5, TAM yarısı DAHİL)', (kirmiziSayi, kume, beklenen) => {
    expect(al({ ortam: ortam('bagli'), ci: { kirmizi: kirmiziSayi, dunyaKumesi: kume } }).tur).toBe(beklenen)
  })
  it('TASI-ADAYI yalnız ortama BAĞLI testte çıkar; CI kırmızısı yokken oran hesaplanmaz; sebep sayıları (dünya kümesi/kırmızı) sırasıyla yazar', () => {
    expect(al({ ortam: ortam('supheli'), ci: { kirmizi: 10, dunyaKumesi: 10 } }).tur).toBe('KORU')
    expect(al({ ortam: ortam('bagimsiz'), ci: { kirmizi: 10, dunyaKumesi: 10 } }).tur).toBe('KORU')
    expect(al({ ortam: ortam('bagli'), ci: { kirmizi: 0, dunyaKumesi: 3 } }).tur).toBe('KORU')
    expect(al({ ortam: ortam('bagli'), ci: { kirmizi: 10, dunyaKumesi: 5 } }).sebepler.join(' ')).toContain('(5/10)')
  })

  it('COKLU-KORUMA-ADAYI yalnız pencerede HİÇ kırmızı vermemiş testte: CI kırmızısı 0 → aday, TAM 1 kırmızı → KORU (silme adayı sınırı)', () => {
    expect(al({ kopya: coklu, ci: { kirmizi: 0, dunyaKumesi: 0 } }).tur).toBe('COKLU-KORUMA-ADAYI')
    expect(al({ kopya: coklu, ci: { kirmizi: 1, dunyaKumesi: 0 } }).tur).toBe('KORU')
  })

  it.each<[string, Record<string, unknown>, string]>([
    ['TASINDI > CELISKI-INCELE', { dunya, sabotaj: celiski }, 'TASINDI'],
    ['TASINDI > ORTAM-INCELE', { dunya, sabotaj: olculdu('TABAN_KIRMIZI') }, 'TASINDI'],
    ['TASINDI > TASI-ADAYI-DUNYA-DURUMU', { dunya, ortam: ortam('bagli'), ci: ciW }, 'TASINDI'],
    ['CELISKI-INCELE > TASI-ADAYI-DUNYA-DURUMU', { sabotaj: celiski, ortam: ortam('bagli'), ci: ciW }, 'CELISKI-INCELE'],
    ['CELISKI-INCELE > COKLU-KORUMA-ADAYI', { sabotaj: celiski, kopya: coklu }, 'CELISKI-INCELE'],
    ['CELISKI-INCELE > OLCULMEDI (çelişkili kayıt "ölçülmedi" sayılmaz)', { sabotaj: celiski }, 'CELISKI-INCELE'],
    ['SAHTE-YESIL-ADAYI > TASI-ADAYI-DUNYA-DURUMU: ortama BAĞLI testte BASTIRILMAZ', { sabotaj: olculdu('YESIL'), ortam: ortam('bagli'), ci: ciW }, 'SAHTE-YESIL-ADAYI'],
    ['SAHTE-YESIL-ADAYI: ortama bağlı ama CI kanıtı yok → yine SAHTE-YESIL (KORU\'ya düşmez)', { sabotaj: olculdu('YESIL'), ortam: ortam('bagli') }, 'SAHTE-YESIL-ADAYI'],
    ['SAHTE-YESIL-ADAYI > COKLU-KORUMA-ADAYI', { sabotaj: olculdu('YESIL'), kopya: coklu }, 'SAHTE-YESIL-ADAYI'],
    ['ORTAM-INCELE > TASI-ADAYI-DUNYA-DURUMU: ortama BAĞLI testte BASTIRILMAZ', { sabotaj: olculdu('TABAN_KIRMIZI'), ortam: ortam('bagli'), ci: ciW }, 'ORTAM-INCELE'],
    ['ORTAM-INCELE: ortama bağlı ama CI kanıtı yok → yine ORTAM-INCELE', { sabotaj: olculdu('TABAN_KIRMIZI'), ortam: ortam('bagli') }, 'ORTAM-INCELE'],
    ['ORTAM-INCELE > COKLU-KORUMA-ADAYI', { sabotaj: olculdu('TABAN_KIRMIZI'), kopya: coklu }, 'ORTAM-INCELE'],
    ['TASI-ADAYI-DUNYA-DURUMU > KISMI-KORUMA', { sabotaj: kismi, ortam: ortam('bagli'), ci: ciW }, 'TASI-ADAYI-DUNYA-DURUMU'],
    ['KISMI-KORUMA > COKLU-KORUMA-ADAYI', { sabotaj: kismi, kopya: coklu }, 'KISMI-KORUMA'],
    ['TASI-ADAYI-DUNYA-DURUMU > OLCULMEDI (CI kanıtı sabotajdan bağımsızdır)', { sabotaj: olculmedi, ortam: ortam('bagli'), ci: ciW }, 'TASI-ADAYI-DUNYA-DURUMU'],
    ['COKLU-KORUMA-ADAYI > OLCULMEDI', { sabotaj: olculmedi, kopya: coklu }, 'COKLU-KORUMA-ADAYI'],
    ['OLCULMEDI > KORU', { sabotaj: olculmedi }, 'OLCULMEDI'],
    ['hiçbir aday yoksa KORU', {}, 'KORU'],
  ])('öncelik tablosu: %s', (ad, girdi, beklenen) => {
    expect(al(girdi).tur, ad).toBe(beklenen)
  })

  describe('ölçüm hükmü UYGULANAMADI / TABAN_ATLANDI: hiçbir şey ölçülmemiştir → OLCULMEDI, ASLA KORU', () => {
    it.each(['UYGULANAMADI', 'TABAN_ATLANDI'])('hüküm %s (kayıt var, ölçüm yok) → OLCULMEDI; sebep hükmü adıyla yazar', (hukum) => {
      const s = al({ sabotaj: olculdu(hukum) })
      expect(s.tur).toBe('OLCULMEDI')
      expect(s.sebepler.join(' ')).toContain(hukum)
    })
    it('sözlük kapalı: bilinmeyen ya da eksik hüküm de ölçülmemiş sayılır (yeni bir hüküm sessizce KORU olmaz)', () => {
      expect(al({ sabotaj: olculdu('YENI-HUKUM') }).tur).toBe('OLCULMEDI')
      expect(al({ sabotaj: { durum: 'olculdu', denenen: 0 } }).tur).toBe('OLCULMEDI')
    })
    it.each<[string, Record<string, unknown>]>([
      ['hiçbir kanıt yok', {}],
      ['ortama bağlı, CI dünya kümesi çoğunlukta', { ortam: ortam('bagli'), ci: ciW }],
      ['ortama bağlı, CI dünya kümesi azınlıkta', { ortam: ortam('bagli'), ci: { kirmizi: 10, dunyaKumesi: 4 } }],
      ['başka test de yakalıyor, CI kırmızısı yok', { kopya: coklu }],
      ['dünya durumu listesinde', { dunya }],
    ])('"kayıt yok" (durum olculmedi) ile AYNI öneri, kanıt sırası değişmez: %s', (ad, digerleri) => {
      const yok = al({ ...digerleri, sabotaj: olculmedi }).tur
      expect(al({ ...digerleri, sabotaj: olculdu('UYGULANAMADI') }).tur, ad).toBe(yok)
      expect(al({ ...digerleri, sabotaj: olculdu('TABAN_ATLANDI') }).tur, ad).toBe(yok)
    })
    it('ölçen hükümler etkilenmez: KIRMIZI → KORU, YESIL → SAHTE-YESIL-ADAYI, TABAN_KIRMIZI → ORTAM-INCELE', () => {
      expect(al({ sabotaj: olculdu('KIRMIZI') }).tur).toBe('KORU')
      expect(al({ sabotaj: olculdu('YESIL') }).tur).toBe('SAHTE-YESIL-ADAYI')
      expect(al({ sabotaj: olculdu('TABAN_KIRMIZI') }).tur).toBe('ORTAM-INCELE')
    })
  })

  describe('sabotaj.cjs hüküm sözlüğü → karne önerisi (üretici ile tüketici sözleşmesi: koşucunun üretebildiği HER hüküm sınıflanır)', () => {
    it.each<[string, { sonuc: string }, Array<{ ad: string; sonuc: string }>, string, string]>([
      ['taban kırmızı', { sonuc: 'KIRMIZI' }, [], 'TABAN_KIRMIZI', 'ORTAM-INCELE'],
      ['taban atlandı (tüm testler skip)', { sonuc: 'ATLANDI' }, [], 'TABAN_ATLANDI', 'OLCULMEDI'],
      ['taban yüklenemedi (ERROR)', { sonuc: 'ERROR' }, [], 'UYGULANAMADI', 'OLCULMEDI'],
      ['hiçbir sabotaj denenmedi', { sonuc: 'GECTI' }, [], 'UYGULANAMADI', 'OLCULMEDI'],
      ['sabotaj çapası uygulanamadı', { sonuc: 'GECTI' }, [{ ad: 'x', sonuc: 'HATA-CAPA' }], 'UYGULANAMADI', 'OLCULMEDI'],
      ['hiçbir sabotaj yakalanmadı', { sonuc: 'GECTI' }, [{ ad: 'x', sonuc: 'GECTI' }], 'YESIL', 'SAHTE-YESIL-ADAYI'],
      ['sabotaj yakalandı', { sonuc: 'GECTI' }, [{ ad: 'x', sonuc: 'KIRMIZI' }], 'KIRMIZI', 'KORU'],
      ['biri yakalandı, biri yakalanmadı', { sonuc: 'GECTI' }, [{ ad: 'x', sonuc: 'GECTI' }, { ad: 'y', sonuc: 'KIRMIZI' }], 'KIRMIZI', 'KISMI-KORUMA'],
    ])('koşucu kaydı: %s', (ad, taban, denemeler, hukum, oneri) => {
      expect(SABOTAJ.hukumVer(taban, denemeler), `${ad}: hukumVer`).toBe(hukum)
      const q3 = K.sabotajOzeti({ sab: { test: 'a.test.ts', hukum, taban, denemeler, ajan: {} }, kume: 'conformance' })
      expect(al({ sabotaj: q3 }).tur, `${ad}: öneri`).toBe(oneri)
    })
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

describe('yerineGecenOku — ilan alanları zorunlu (fail-closed: eksik ilan sessizce kabul edilmez)', () => {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'karne-ilan-'))
  afterAll(() => fs.rmSync(dizin, { recursive: true, force: true }))
  const yaz = (icerik: unknown) => fs.writeFileSync(path.join(dizin, 'yerine-gecen.json'), JSON.stringify(icerik))
  const tam = { test: 'a.test.ts', dosya: 'g99.jsonl', neden: 'koşucu sınırı düzeltildi' }

  it('ilan dosyası yoksa ilan yok (boş harita); tam kayıt okunur', () => {
    expect(K.yerineGecenOku(path.join(dizin, 'yok-dizin')).size).toBe(0)
    yaz([tam])
    expect(K.yerineGecenOku(dizin).get('a.test.ts')).toEqual({ dosya: 'g99.jsonl', neden: 'koşucu sınırı düzeltildi' })
  })
  it.each(['test', 'dosya', 'neden'])('"%s" alanı eksik ilan FIRLATIR', (alan) => {
    const eksik: Record<string, string> = { ...tam }
    delete eksik[alan]
    yaz([eksik])
    expect(() => K.yerineGecenOku(dizin)).toThrow(/zorunlu/)
  })
  it('boş alan değeri ve null kayıt da bozuk ilandır', () => {
    yaz([{ ...tam, neden: '' }])
    expect(() => K.yerineGecenOku(dizin)).toThrow(/zorunlu/)
    yaz([null])
    expect(() => K.yerineGecenOku(dizin)).toThrow(/zorunlu/)
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
