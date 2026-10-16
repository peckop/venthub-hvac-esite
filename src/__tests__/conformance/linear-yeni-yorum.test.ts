/**
 * INV-LINEAR-YORUM-1..9 — scripts/board/linear-yeni-yorum.cjs `--durum` kipi (kart 6edd47ed).
 *
 * Olay (2026-10-04): Design'dan Linear'a 21 saat hiçbir şey gelmedi, zil "Okunmamış yorum yok" gösterdi.
 * Sözleşme: (1) "ölçülemedi" (anahtar/ağ/HTTP/şema) asla "haber yok"tan ayırt edilemez olmaz,
 * (2) Design son yorum yaşı ve yanıtsız OPS yorumu 6 saat amber / 24 saat kırmızı,
 * (3) varsayılan çıktı geriye uyumlu (yalnız boş ya da tek satır), (4) sorgu proje listesinden bağımsız.
 * Ağ çağrısı yok: fetch sahtelenir, saat dışarıdan verilir.
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const require_ = createRequire(import.meta.url)
const BETIK = resolve(__dirname, '..', '..', '..', 'scripts', 'board', 'linear-yeni-yorum.cjs')

interface Dugum {
  createdAt: string
  body: string
  project: { id: string; name: string } | null
}

interface Durum {
  durum: 'olculdu' | 'belirsiz' | 'olculemedi'
  seviye: 'iyi' | 'amber' | 'kirmizi' | 'belirsiz' | 'olculemedi'
  ozet: string
  sebep?: string
  sonDesignYasMs?: number
  yanitsizSayi?: number
  enEskiYanitsizYasMs?: number
  eskiKanallar?: { ad: string; yanitsizSayi: number; enEskiYanitsizYasMs: number }[]
}

interface SeritTani {
  serit: string | null
  kaynak: 'imza' | 'baslik' | 'imza+baslik' | 'celiski' | 'yok'
  celiski: boolean
}

interface CekSonuc {
  hata?: string
  kalemler?: { proje: string; createdAt: string; serit: string | null; kaynak: string }[]
  belirsiz?: number
}

interface Modul {
  durum: (simdiMs?: number) => Promise<Durum>
  durumHesapla: (dugumler: readonly unknown[], simdiMs: number, okumaMs?: number | null) => Durum & { belirsizSayi?: number }
  seritTani: (govde: string) => SeritTani
  baslikSerit: (govde: string) => string | null
  ozetle: (kalemler: readonly { proje: string; createdAt: string }[], belirsiz?: number) => string | null
  cek: () => Promise<CekSonuc>
  satir: () => Promise<string | null>
  seritTuru: (govde: string) => 'design' | 'ops' | null
  yasYaz: (ms: number) => string
  PROJELER: { id: string; kisa: string }[]
  ESIK_AMBER_MS: number
  ESIK_KIRMIZI_MS: number
}

const m: Modul = require_(BETIK)

const SAAT = 60 * 60 * 1000
const SIMDI = Date.parse('2026-10-04T10:00:00.000Z')
const MENU = { id: 'p-menu', name: 'Vitrin 15A Yeniden Tasarım (DESIGN-MENU)' }
const MARKA = { id: 'p-marka', name: 'Marka Kılavuzu (DESIGN-MARKA)' }
const ALTYAPI = { id: 'p-altyapi', name: 'ALTYAPI' }

function onceki(saat: number): string {
  return new Date(SIMDI - saat * SAAT).toISOString()
}
function design(saat: number, proje = MENU): Dugum {
  return { createdAt: onceki(saat), body: 'Teslim edildi.\n\n— DESIGN-MENU (Opus)', project: proje }
}
function ops(saat: number, proje = MENU): Dugum {
  return { createdAt: onceki(saat), body: 'Düzeltme istiyorum.\n\n— OPS (Opus)', project: proje }
}

describe('INV-LINEAR-YORUM-1: ölçülemedi kolları "haber yok"tan ayrıdır', () => {
  const eskiAnahtar = process.env.LINEAR_API_KEY

  beforeEach(() => {
    process.env.LINEAR_API_KEY = 'x'.repeat(30)
  })
  afterEach(() => {
    if (eskiAnahtar === undefined) delete process.env.LINEAR_API_KEY
    else process.env.LINEAR_API_KEY = eskiAnahtar
    vi.unstubAllGlobals()
  })

  it('anahtar yok → olculemedi (temiz değil)', async () => {
    delete process.env.LINEAR_API_KEY
    const d = await m.durum(SIMDI)
    expect(d.durum).toBe('olculemedi')
    expect(d.seviye).toBe('olculemedi')
    expect(d.sebep).toBe('anahtar yok')
  })

  it('kısa/bozuk anahtar → olculemedi', async () => {
    process.env.LINEAR_API_KEY = 'kisa'
    expect((await m.durum(SIMDI)).durum).toBe('olculemedi')
  })

  it('HTTP 500 → olculemedi, sebep durumu taşır', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }))
    const d = await m.durum(SIMDI)
    expect(d.durum).toBe('olculemedi')
    expect(d.sebep).toBe('HTTP 500')
  })

  it('ağ hatası → olculemedi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')))
    const d = await m.durum(SIMDI)
    expect(d.durum).toBe('olculemedi')
    expect(d.sebep).toBe('ag/cozumleme')
  })

  it('GraphQL errors → olculemedi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ errors: [{ message: 'x' }] }) }))
    expect((await m.durum(SIMDI)).sebep).toBe('GraphQL hatasi')
  })

  it('beklenen alan yok (şema değişti) → olculemedi, boş liste sanılmaz', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: {} }) }))
    const d = await m.durum(SIMDI)
    expect(d.durum).toBe('olculemedi')
    expect(d.sebep).toBe('beklenen alan yok (comments.nodes)')
  })

  it('sağlam cevap → olculdu', async () => {
    const nodes = [ops(1), design(3)]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: { comments: { nodes } } }) }))
    const d = await m.durum(SIMDI)
    expect(d.durum).toBe('olculdu')
    expect(d.seviye).toBe('iyi')
  })
})

describe('INV-LINEAR-YORUM-2: eşikler (6 saat amber, 24 saat kırmızı)', () => {
  it('yanıtsız OPS yorumu 5 saat → iyi', () => {
    const d = m.durumHesapla([design(10), ops(5)], SIMDI)
    expect(d.seviye).toBe('iyi')
    expect(d.yanitsizSayi).toBe(1)
  })

  it('tam 6 saat → amber (sınır dahil)', () => {
    expect(m.durumHesapla([design(10), ops(6)], SIMDI).seviye).toBe('amber')
  })

  it('23 saat → amber, tam 24 saat → kırmızı', () => {
    expect(m.durumHesapla([design(30), ops(23)], SIMDI).seviye).toBe('amber')
    expect(m.durumHesapla([design(30), ops(24)], SIMDI).seviye).toBe('kirmizi')
  })

  it('eşik sabitleri 6 ve 24 saat', () => {
    expect(m.ESIK_AMBER_MS).toBe(6 * SAAT)
    expect(m.ESIK_KIRMIZI_MS).toBe(24 * SAAT)
  })

  it('en eski yanıtsız OPS yorumu belirler, yeniler değil', () => {
    const d = m.durumHesapla([design(40), ops(30), ops(2)], SIMDI)
    expect(d.seviye).toBe('kirmizi')
    expect(d.yanitsizSayi).toBe(2)
    expect(d.enEskiYanitsizYasMs).toBe(30 * SAAT)
  })
})

describe('INV-LINEAR-YORUM-3: Design son yorum yaşı', () => {
  it('olay verisi: son Design yorumu 21 saat önce, 2 OPS yorumu yanıtsız', () => {
    const d = m.durumHesapla([ops(21), design(21.1), ops(21.2), ops(22)], SIMDI)
    expect(d.sonDesignYasMs).toBeCloseTo(21.1 * SAAT, -3)
    expect(d.ozet).toContain('Design son yorum: 21 saat önce')
    expect(d.ozet).toContain('DESIGN-MENU')
  })

  it('OPS yanıtsız değilse (Design en son yazmış) seviye iyi, yaş yine yazılı', () => {
    const d = m.durumHesapla([ops(50), design(30)], SIMDI)
    expect(d.seviye).toBe('iyi')
    expect(d.yanitsizSayi).toBe(0)
    expect(d.ozet).toContain('Design son yorum: 30 saat önce')
    expect(d.ozet).not.toContain('yanıtsız')
  })

  it('yaş biçimi: dakika, saat, gün', () => {
    expect(m.yasYaz(5 * 60 * 1000)).toBe('5 dk')
    expect(m.yasYaz(21 * SAAT)).toBe('21 saat')
    expect(m.yasYaz(72 * SAAT)).toBe('3 gün')
    expect(m.yasYaz(-1)).toBe('?')
  })
})

describe('INV-LINEAR-YORUM-4: Design yorumu hiç yoksa "sessiz" denmez, "belirsiz" denir', () => {
  it('boş liste → belirsiz', () => {
    const d = m.durumHesapla([], SIMDI)
    expect(d.durum).toBe('belirsiz')
    expect(d.seviye).toBe('belirsiz')
  })

  it('yalnız OPS yorumu olan proje (ALTYAPI emir kanalı) Design kanalı sayılmaz', () => {
    const d = m.durumHesapla([ops(40, ALTYAPI), ops(30, ALTYAPI)], SIMDI)
    expect(d.durum).toBe('belirsiz')
  })

  it('geçersiz düğümler (tarihsiz, projesiz, boş) sessizce atlanır, çökmez', () => {
    const kotu: unknown[] = [null, { createdAt: 'bozuk', body: '— OPS', project: MENU }, { createdAt: onceki(1), body: '— OPS', project: null }]
    expect(() => m.durumHesapla(kotu, SIMDI)).not.toThrow()
  })
})

describe('INV-LINEAR-YORUM-5: yalnız etkin kanal seviyeyi belirler', () => {
  it('eski kanaldaki 5 günlük yanıtsız yorum seviyeyi kırmızı yapmaz, bilgi olarak yazılır', () => {
    const d = m.durumHesapla([design(2), design(130, MARKA), ops(125, MARKA)], SIMDI)
    expect(d.seviye).toBe('iyi')
    expect(d.eskiKanallar).toHaveLength(1)
    expect(d.eskiKanallar?.[0]?.yanitsizSayi).toBe(1)
    expect(d.ozet).toContain('eski kanal: DESIGN-MARKA')
    expect(d.ozet).toContain('5 gün')
  })
})

describe('INV-LINEAR-YORUM-6: imza tanıma gürültüye dayanıklı', () => {
  it('yalnız DESIGN* ve OPS tanınır; SSS, PNG sahte imzaları yok sayılır', () => {
    expect(m.seritTuru('x\n\n— DESIGN-KATALOG (Opus)')).toBe('design')
    expect(m.seritTuru('x\n\n— OPS (Opus)')).toBe('ops')
    expect(m.seritTuru('x\n\n— SSS')).toBeNull()
    expect(m.seritTuru('x\n\n— PNG')).toBeNull()
    expect(m.seritTuru('imzasız yorum')).toBeNull()
    expect(m.seritTuru('')).toBeNull()
  })

  it('sahte imzalı yorum Design yorumu sayılıp sessizliği gizlemez', () => {
    const sss: Dugum = { createdAt: onceki(1), body: 'x\n\n— SSS', project: MENU }
    const d = m.durumHesapla([sss, design(21), ops(20)], SIMDI)
    expect(d.sonDesignYasMs).toBe(21 * SAAT)
  })
})

describe('INV-LINEAR-YORUM-7: sorgu proje listesinden bağımsız', () => {
  it('PROJELER içinde olmayan yeni bir Design projesi de kanal sayılır', () => {
    const yeni = { id: 'tamamen-yeni-proje-id', name: 'Yeni Proje (DESIGN-YENI)' }
    expect(m.PROJELER.some((p) => p.id === yeni.id)).toBe(false)
    const d = m.durumHesapla([design(8, yeni), ops(7, yeni)], SIMDI)
    expect(d.durum).toBe('olculdu')
    expect(d.seviye).toBe('amber')
    expect(d.ozet).toContain('DESIGN-YENI')
  })
})

const YENI_KANALLAR = [
  { kisa: '3D', id: '414eb227-fa10-4f6e-ae62-27df23847ee5', ad: '3D Ürün Modelleri (DESIGN-3D)', imza: 'DESIGN-3D' },
  { kisa: 'ICERIK', id: '0f60f263-6ff2-44a2-9dc4-c6c6605224d4', ad: 'Ürün İçeriği Hazırlama (DESIGN-ICERIK)', imza: 'DESIGN-ICERIK' },
]

describe.each(YENI_KANALLAR)('INV-LINEAR-YORUM-12: $imza kanalı zile girer (ARC-145)', ({ kisa, id, ad, imza }) => {
  const eskiAnahtar = process.env.LINEAR_API_KEY
  beforeEach(() => {
    process.env.LINEAR_API_KEY = 'x'.repeat(30)
  })
  afterEach(() => {
    if (eskiAnahtar === undefined) delete process.env.LINEAR_API_KEY
    else process.env.LINEAR_API_KEY = eskiAnahtar
    vi.unstubAllGlobals()
  })

  it('PROJELER kanalı kısa adıyla içerir ve kimlikler tekrarsızdır', () => {
    expect(m.PROJELER).toContainEqual({ id, kisa })
    expect(new Set(m.PROJELER.map((p) => p.id)).size).toBe(m.PROJELER.length)
  })

  it('cek() sunucuya giden proje süzgecine kimliği koyar (listede yoksa zil hiç çalmaz)', async () => {
    const fetchSahte = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: { comments: { nodes: [] } } }) })
    vi.stubGlobal('fetch', fetchSahte)
    await m.cek()
    const govde = JSON.parse(String((fetchSahte.mock.calls[0]?.[1] as { body: string }).body)) as { variables: { ids: string[] } }
    expect(govde.variables.ids).toContain(id)
  })

  it('bu projeden gelen Design yorumu kalem olur ve zil satırı "<kısa ad> 1" yazar (Design imzası DESIGN* sayılır)', async () => {
    const yorum = { createdAt: onceki(1), body: `Teslim.\n\n— ${imza} (Opus)`, project: { id, name: ad } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: { comments: { nodes: [yorum] } } }) }))
    const s = await m.cek()
    expect(s.kalemler).toHaveLength(1)
    expect(s.kalemler?.[0]).toMatchObject({ proje: kisa, serit: imza })
    expect(m.ozetle(s.kalemler ?? [], s.belirsiz)).toContain(`(${kisa} 1)`)
  })

  it('aynı turda iki kanaldan yorum gelirse ikisi de sayılır', async () => {
    const digeri = YENI_KANALLAR.find((k) => k.id !== id)!
    const nodes = [
      { createdAt: onceki(2), body: `x\n\n— ${imza}`, project: { id, name: ad } },
      { createdAt: onceki(1), body: `y\n\n— ${digeri.imza}`, project: { id: digeri.id, name: digeri.ad } },
    ]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: { comments: { nodes } } }) }))
    const s = await m.cek()
    const satir = String(m.ozetle(s.kalemler ?? [], s.belirsiz))
    expect(satir).toContain('2 yeni yorum')
    expect(satir).toContain(`${kisa} 1`)
    expect(satir).toContain(`${digeri.kisa} 1`)
  })
})

describe('INV-LINEAR-YORUM-8: varsayılan çıktı geriye uyumlu', () => {
  it('anahtarsız satir() null döner (yüklü zil "yok" okur, yeni metin çıkmaz)', async () => {
    const eski = process.env.LINEAR_API_KEY
    delete process.env.LINEAR_API_KEY
    try {
      expect(await m.satir()).toBeNull()
    } finally {
      if (eski !== undefined) process.env.LINEAR_API_KEY = eski
    }
  })

  it('varsayılan kip anahtarsızken HİÇBİR ÇIKTI vermez', () => {
    const r = spawnSync(process.execPath, [BETIK], { env: { ...process.env, LINEAR_API_KEY: '' }, encoding: 'utf8', timeout: 20000 })
    expect(r.status).toBe(0)
    expect(r.stdout.trim()).toBe('')
  })
})

// ---- ARC-51 (2026-10-04): imzasız OPS yorumları "yeni" sayılıyordu; şerit tanıma imza + başlık ----

/** OPS'un kendi emri: başlıklı, imza satırı YOK (son satır madde). Vitrin 15A'daki gerçek biçim. */
function opsEmri(saat: number, no: number, proje = MENU): Dugum {
  return {
    createdAt: onceki(saat),
    body: `**OPS → Design #${no} · İŞ: örnek**\n\nAyrıntı satırı.\n\n- Hesap, sepet, ödeme ve giriş adreslerinin hangi dilde olacağı`,
    project: proje,
  }
}
/** Sahte imza üreten son satır ("- SSS'deki …" → imzaSerit `SSS` verir). Başlık OPS. */
function sahteImzaliOpsEmri(saat: number, no: number): Dugum {
  return { createdAt: onceki(saat), body: `**OPS → Design #${no} · DÜZELTME**\n\n- SSS'deki "VentHub kimdir?" sorusu da kişisiz cevaplanacak`, project: MENU }
}
/** Design'ın gerçek yorumu: başlık da imza da DESIGN-MENU. */
function designYorumu(saat: number): Dugum {
  return { createdAt: onceki(saat), body: '**DESIGN-MENU → OPS · 2026-10-03 · TESLİM**\n\nTeslim edildi.\n\n— DESIGN-MENU 2026-10-03', project: MENU }
}
/** İmza ile başlık çelişiyor: başlık OPS diyor, son satır DESIGN-MENU diyor. */
function celisenYorum(saat: number): Dugum {
  return { createdAt: onceki(saat), body: '**OPS → Design #99 · çelişkili**\n\nmetin\n\n— DESIGN-MENU', project: MENU }
}

describe('INV-LINEAR-YORUM-10: şerit tanıma imza + başlık (ARC-51)', () => {
  it('başlık gönderen adını verir: OPS → Design, DESIGN-MENU → OPS, HARİTA → OPS; yalnız İLK satır', () => {
    expect(m.baslikSerit('**OPS → Design #22 · x**\n\ny')).toBe('OPS')
    expect(m.baslikSerit('**DESIGN-MENU → OPS · 2026-10-03**')).toBe('DESIGN-MENU')
    expect(m.baslikSerit('**HARİTA → OPS: 84 cetvel**')).toBe('HARİTA')
    expect(m.baslikSerit('OPS -> Design')).toBe('OPS')
    // Metin ORTASINDAKİ ok sayılmaz.
    expect(m.baslikSerit('Giriş cümlesi\n**OPS → Design #1**')).toBeNull()
    expect(m.baslikSerit('Küçük harfli ad → hedef')).toBeNull()
    expect(m.baslikSerit('')).toBeNull()
  })

  it('imzasız OPS emri başlıktan OPS tanınır', () => {
    const t = m.seritTani(opsEmri(1, 13).body)
    expect(t).toMatchObject({ serit: 'OPS', kaynak: 'baslik', celiski: false })
    expect(m.seritTuru(opsEmri(1, 13).body)).toBe('ops')
  })

  it('imzalı Design yorumu Design kalır (başlık ve imza aynı aile)', () => {
    expect(m.seritTani(designYorumu(1).body)).toMatchObject({ serit: 'DESIGN-MENU', kaynak: 'imza+baslik', celiski: false })
    expect(m.seritTuru(designYorumu(1).body)).toBe('design')
  })

  it('DESIGN-KATALOG imzası ile DESIGN-MENU başlığı çelişki DEĞİL (aynı aile)', () => {
    expect(m.seritTani('**DESIGN-MENU → OPS**\n\n— DESIGN-KATALOG (Opus)').celiski).toBe(false)
  })

  it('sahte imza (SSS) başlıkla çelişki sayılmaz: başlık kazanır', () => {
    expect(m.seritTani(sahteImzaliOpsEmri(1, 16).body)).toMatchObject({ serit: 'OPS', kaynak: 'baslik', celiski: false })
  })

  it('bilinen iki şerit farklıysa ÇELİŞKİ: serit null, ne OPS ne Design', () => {
    const t = m.seritTani(celisenYorum(1).body)
    expect(t).toMatchObject({ serit: null, kaynak: 'celiski', celiski: true })
    expect(m.seritTuru(celisenYorum(1).body)).toBeNull()
  })

  it('yalnız imza ya da hiçbiri: eski davranış aynen (geriye uyum)', () => {
    expect(m.seritTani('x\n\n— OPS (Opus)')).toMatchObject({ serit: 'OPS', kaynak: 'imza' })
    expect(m.seritTani('imzasız ve başlıksız yorum')).toMatchObject({ serit: null, kaynak: 'yok', celiski: false })
    expect(m.seritTani('')).toMatchObject({ serit: null, celiski: false })
  })
})

describe('INV-LINEAR-YORUM-11: cek() olay verisiyle — imzasız OPS emirleri "yeni" sayılmaz (ARC-51 bitiş ölçüsü)', () => {
  const eskiAnahtar = process.env.LINEAR_API_KEY
  beforeEach(() => {
    process.env.LINEAR_API_KEY = 'x'.repeat(30)
  })
  afterEach(() => {
    if (eskiAnahtar === undefined) delete process.env.LINEAR_API_KEY
    else process.env.LINEAR_API_KEY = eskiAnahtar
    vi.unstubAllGlobals()
  })

  function sahteCevap(nodes: Dugum[]) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: { comments: { nodes } } }) }))
  }

  it('12 yorumun 8\'i imzasız OPS emri (olay): 0 yeni, belirsiz 0', async () => {
    const emirler = Array.from({ length: 8 }, (_, i) => (i % 2 === 0 ? opsEmri(30 - i, 13 + i) : sahteImzaliOpsEmri(30 - i, 13 + i)))
    const imzaliOps: Dugum[] = [ops(2), ops(3), ops(4), ops(5)]
    sahteCevap([...emirler, ...imzaliOps])
    const s = await m.cek()
    expect(s.hata).toBeUndefined()
    expect(s.kalemler).toHaveLength(0)
    expect(s.belirsiz).toBe(0)
    expect(m.ozetle(s.kalemler ?? [], s.belirsiz)).toBeNull()
  })

  it('aynı verinin arasına gerçek bir Design yorumu eklenince tam 1 yeni olur', async () => {
    const emirler = Array.from({ length: 8 }, (_, i) => opsEmri(30 - i, 13 + i))
    sahteCevap([...emirler, designYorumu(1)])
    const s = await m.cek()
    expect(s.kalemler).toHaveLength(1)
    expect(s.kalemler?.[0]?.serit).toBe('DESIGN-MENU')
    expect(m.ozetle(s.kalemler ?? [], s.belirsiz)).toContain('LINEAR: 1 yeni yorum')
  })

  it('çelişen yorum yeni sayılmaz ama "belirsiz" diye ayrı sayılır; tek başına satır BASILMAZ (zil alarm vermesin)', async () => {
    sahteCevap([celisenYorum(2)])
    const s = await m.cek()
    expect(s.kalemler).toHaveLength(0)
    expect(s.belirsiz).toBe(1)
    expect(m.ozetle(s.kalemler ?? [], s.belirsiz)).toBeNull()
  })

  it('yeni yorumla birlikte gelen belirsiz sayısı satırda görünür', async () => {
    sahteCevap([designYorumu(1), celisenYorum(2)])
    const s = await m.cek()
    expect(m.ozetle(s.kalemler ?? [], s.belirsiz)).toContain('belirsiz 1 (imza ile başlık çelişiyor)')
  })

  it('imzasız ve başlıksız yorum eskisi gibi yeni sayılır (kimden geldiği bilinmiyor, kaçırılmaz)', async () => {
    sahteCevap([{ createdAt: onceki(1), body: 'başlıksız, imzasız not', project: MENU }])
    expect((await m.cek()).kalemler).toHaveLength(1)
  })
})

describe('INV-LINEAR-YORUM-12: --durum başlık tanımayı kullanır, belirsizi ayrı yazar (ARC-51)', () => {
  it('imzasız OPS emirleri yanıtsız OPS yorumu olarak sayılır (zil ile sayaç aynı şeyi söyler)', () => {
    const d = m.durumHesapla([designYorumu(30), opsEmri(8, 21), opsEmri(7, 22)], SIMDI)
    expect(d.yanitsizSayi).toBe(2)
    expect(d.seviye).toBe('amber')
    expect(d.ozet).toContain('OPS 2 yorum yanıtsız')
  })

  it('çelişen yorum ne Design ne OPS sayılır; son okumadan sonrakiler "belirsiz N" olarak ozet\'e yazılır', () => {
    const okuma = SIMDI - 10 * SAAT
    const d = m.durumHesapla([design(30), celisenYorum(2), celisenYorum(20)], SIMDI, okuma)
    expect(d.sonDesignYasMs).toBe(30 * SAAT)
    expect(d.yanitsizSayi).toBe(0)
    // 20 saat önceki çelişkili yorum son okumadan ESKİ: sayılmaz; 2 saat önceki sayılır.
    expect(d.belirsizSayi).toBe(1)
    expect(d.ozet).toContain('belirsiz 1 yorum (imza ile başlık çelişiyor)')
  })

  it('okuma damgası verilmezse bütün çelişkili yorumlar sayılır; çelişki yoksa ozet\'te belirsiz geçmez', () => {
    expect(m.durumHesapla([design(30), celisenYorum(2), celisenYorum(20)], SIMDI).belirsizSayi).toBe(2)
    const temiz = m.durumHesapla([design(30), opsEmri(2, 1)], SIMDI)
    expect(temiz.belirsizSayi).toBe(0)
    expect(temiz.ozet).not.toContain('belirsiz')
  })

  it('Design yorumu hiç yokken de çelişki sayısı yazılır (kanal belirsiz)', () => {
    const d = m.durumHesapla([celisenYorum(2)], SIMDI)
    expect(d.durum).toBe('belirsiz')
    expect(d.ozet).toContain('belirsiz 1 yorum')
  })
})

describe('INV-LINEAR-YORUM-9: --durum kipi tek satır JSON, çıkış 0', () => {
  it('anahtarsız: olculemedi JSON, çıkış kodu 0', () => {
    const r = spawnSync(process.execPath, [BETIK, '--durum'], { env: { ...process.env, LINEAR_API_KEY: '' }, encoding: 'utf8', timeout: 20000 })
    expect(r.status).toBe(0)
    const satirlar = r.stdout.trim().split('\n')
    expect(satirlar).toHaveLength(1)
    const d: Durum = JSON.parse(satirlar[0] ?? '{}')
    expect(d.durum).toBe('olculemedi')
    expect(d.sebep).toBe('anahtar yok')
  })

  it('anahtar değeri hiçbir çıktıya sızmaz', () => {
    const gizli = 'GIZLI-ANAHTAR-DEGERI-1234567890'
    const r = spawnSync(process.execPath, [BETIK, '--durum'], {
      env: { ...process.env, LINEAR_API_KEY: gizli, HTTPS_PROXY: 'http://127.0.0.1:9' },
      encoding: 'utf8',
      timeout: 20000,
    })
    expect(r.stdout + r.stderr).not.toContain(gizli)
  })
})

// ---- ARC-51 kök sebebi (ölçüm 2026-10-11): OPS'un Design'a thread yanıtı "yanıtsız" sayılmaz ----
interface DugumKimlikli extends Dugum {
  id: string
  parent?: { id: string } | null
}
function tasi(d: Dugum, id: string, parent: string | null = null, govde?: string): DugumKimlikli {
  return { ...d, id, parent: parent ? { id: parent } : null, ...(govde ? { body: govde } : {}) }
}

describe('INV-LINEAR-YORUM-13: OPS thread yanıtı konuşmayı kapatır, yanıtsız sayılmaz (ARC-51)', () => {
  it('olay verisi: Design yazdı, OPS AYNI konuya thread yanıtı verdi, 2 gün geçti → yanıtsız 0, seviye iyi', () => {
    const d = tasi(design(50), 'c-design')
    const yanit = tasi(ops(49.9), 'c-ops', 'c-design', '**OPS → DESIGN-MENU:** Dört sapmayı iş olarak açtım.\n\n— OPS')
    const s = m.durumHesapla([yanit, d], SIMDI)
    expect(s.yanitsizSayi).toBe(0)
    expect(s.seviye).toBe('iyi')
    expect(s.ozet).not.toContain('yanıtsız')
  })

  it('üst düzey (thread olmayan) OPS emri hâlâ yanıtsız sayılır', () => {
    const s = m.durumHesapla([tasi(design(50), 'c-design'), tasi(ops(30), 'c-ops')], SIMDI)
    expect(s.yanitsizSayi).toBe(1)
    expect(s.seviye).toBe('kirmizi')
  })

  it('ebeveyni OPS olan thread yanıtı (OPS kendi yorumuna) yanıtsız sayılır', () => {
    const s = m.durumHesapla(
      [tasi(design(50), 'c-design'), tasi(ops(40), 'c-ops-1'), tasi(ops(30), 'c-ops-2', 'c-ops-1')],
      SIMDI,
    )
    expect(s.yanitsizSayi).toBe(2)
  })

  it('ebeveyni pencerede olmayan thread yanıtı eski temkinli davranışla sayılır', () => {
    const s = m.durumHesapla([tasi(design(50), 'c-design'), tasi(ops(30), 'c-ops', 'c-yok')], SIMDI)
    expect(s.yanitsizSayi).toBe(1)
  })

  it('açık "CEVAP BEKLİYOR" işareti taşıyan thread yanıtı yeni istek sayılır', () => {
    const govde = '**OPS → DESIGN-MENU:** Karar 329 = C. CEVAP BEKLİYOR: seçici sayfasını güncelle.\n\n— OPS'
    const s = m.durumHesapla([tasi(design(50), 'c-design'), tasi(ops(30), 'c-ops', 'c-design', govde)], SIMDI)
    expect(s.yanitsizSayi).toBe(1)
    const kucuk = govde.replace('CEVAP BEKLİYOR', 'cevap bekliyor')
    expect(m.durumHesapla([tasi(design(50), 'c-design'), tasi(ops(30), 'c-ops', 'c-design', kucuk)], SIMDI).yanitsizSayi).toBe(1)
  })

  it('kapanış yanıtından SONRA yazılan üst düzey OPS emri yine yanıtsız sayılır', () => {
    const s = m.durumHesapla(
      [tasi(design(50), 'c-design'), tasi(ops(49), 'c-ack', 'c-design'), tasi(ops(30), 'c-yeni-emir')],
      SIMDI,
    )
    expect(s.yanitsizSayi).toBe(1)
    expect(s.enEskiYanitsizYasMs).toBe(30 * SAAT)
  })

  it('düz thread (canlı şekil): yanıtların parent\'ı KÖK; Design yanıtının hemen ardındaki OPS "alındı"sı kapanıştır', () => {
    const s = m.durumHesapla(
      [
        tasi(ops(60), 'kok'),
        tasi(design(50), 'd-yanit', 'kok'),
        tasi(ops(49.9), 'ops-alindi', 'kok', '**OPS → DESIGN-MENU · 07:26Z alındı**\n\n— OPS'),
      ],
      SIMDI,
    )
    expect(s.yanitsizSayi).toBe(0)
    expect(s.seviye).toBe('iyi')
  })

  it('aynı thread\'de OPS art arda iki kez yazarsa ikincisi (Design arada yanıtlamadı) yanıtsız sayılır', () => {
    const s = m.durumHesapla(
      [tasi(design(50), 'c-d'), tasi(ops(49), 'ops-1', 'c-d'), tasi(ops(30), 'ops-2', 'c-d')],
      SIMDI,
    )
    expect(s.yanitsizSayi).toBe(1)
    expect(s.enEskiYanitsizYasMs).toBe(30 * SAAT)
  })

  it('kimliksiz/ebeveynsiz düğümler (eski şekil) davranışı DEĞİŞTİRMEZ', () => {
    const s = m.durumHesapla([design(40), ops(30), ops(2)], SIMDI)
    expect(s.yanitsizSayi).toBe(2)
  })

  it('sorgu ebeveyn ve kimlik alanlarını ister (DURUM_SORGU)', () => {
    // Sorgu dizgisi sahte fetch gövdesinden okunur: alan istenmezse kural canlıda hiç çalışmaz.
    const kaynak = require_('node:fs').readFileSync(BETIK, 'utf8') as string
    expect(kaynak).toMatch(/nodes \{ id createdAt body parent \{ id \} project \{ id name \} \}/)
  })
})
