import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Test shard SONUÇ BEKLEYİCİSİ birim testleri (scripts/ci/test-shard-bekle.cjs, ALT-38c-2). ci.yml bağlantısı: src/__tests__/conformance/ci-test-shard.test.ts (INV-CI-SHARD-1).
 *
 * Tek değişmez: `ci` YEŞİL YALNIZ N shard işinin HEPSİ bu denemede `success` ile bittiyse. Her belirsizlik KIRMIZIDIR: kırmızı/iptal/atlanan/zaman aşımı/başka sonuç, eksik (tolerans
 * sonrası), fazla, tekrar eden shard adı, okunamayan API, geçersiz ortam. Kırmızı shard görülünce kalanlar BEKLENMEDEN kırmızı döner. Zaman ve uyku ENJEKTE edilir (sahte saat:
 * her `uyku` saati ilerletir); gerçek ağ, gerçek `gh` ve gerçek bekleme YOKTUR.
 *
 * Bloklar: 1. beklenenAdlar/degerlendir (saf), 2. bekle (karar tablosu, sahte saat), 3. gercekApi (URL, sayfalama), 4. ortamiOku, 5. main (çıkış kodları), 6. gerçek süreç.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts/ci/test-shard-bekle.cjs')

interface Is {
  name?: unknown
  status?: string
  conclusion?: string | null
  html_url?: string
}
interface Degerlendirme {
  beklenen: string[]
  eksik: string[]
  tekrar: string[]
  beklenmeyen: string[]
  bozuk: Is[]
  bekleyen: Is[]
  basarili: Is[]
}
interface BekleGirdisi {
  api: { isler: () => Promise<Is[]> }
  toplam: unknown
  uyku: (ms: number) => Promise<void>
  simdi: () => number
  bekleSn?: number
  aralikSn?: number
  toleransSn?: number
  log?: (m: string) => void
}
interface Enjeksiyon {
  api?: { isler: () => Promise<Is[]> }
  uyku?: (ms: number) => Promise<void>
  simdi?: () => number
  yaz?: (m: string) => void
}
const B = require_(BETIK) as {
  ARALIK_SN: number
  BEKLEME_SN: number
  EKSIK_TOLERANS_SN: number
  IS_ON_EKI: string
  bekle: (g: BekleGirdisi) => Promise<{ tamam: boolean; neden: string }>
  beklenenAdlar: (toplam: number) => string[]
  degerlendir: (isler: unknown, toplam: number) => Degerlendirme
  gercekApi: (depo: string, kosuId: string, deneme: string, ghCagri?: (yol: string) => Promise<string>) => { isler: () => Promise<Is[]> }
  main: (ortam: Record<string, string | undefined>, g?: Enjeksiyon) => Promise<number>
  ortamiOku: (ortam: Record<string, string | undefined>) => { depo: string; kosuId: string; deneme: string; toplam: number; bekleSn: number }
}

const N = 4
const adlar = (n = N): string[] => B.beklenenAdlar(n)
const is = (name: string, status = 'completed', conclusion: string | null = 'success'): Is => ({ name, status, conclusion, html_url: `https://github.example/${encodeURIComponent(name)}` })
/** `n` shard işi; `durumlar[i]` verilirse i. işin sonucu (`'success'`, `'failure'` ... ya da `'sürüyor'`). */
function shardlar(durumlar: string[] = [], n = N): Is[] {
  return adlar(n).map((ad, i) => {
    const d = durumlar[i] ?? 'success'
    return d === 'sürüyor' ? is(ad, 'in_progress', null) : d === 'sırada' ? is(ad, 'queued', null) : is(ad, 'completed', d)
  })
}
/** `ci` işinin kendisi de listededir (shard adıyla başlamaz, yok sayılmalı). */
const ciIsi = (): Is => is('ci', 'in_progress', null)

/** Sahte saat: her `uyku` zamanı ilerletir; gerçek zamanlayıcı yok. */
function sahteSaat(baslangic = 1_700_000_000_000) {
  let t = baslangic
  const uykular: number[] = []
  return {
    simdi: () => t,
    uyku: async (ms: number): Promise<void> => {
      uykular.push(ms)
      t += ms
    },
    gecenSn: (): number => (t - baslangic) / 1000,
    uykular,
  }
}

/** Her çağrıda sıradaki yanıtı verir (son yanıt tekrarlanır); `Error` verilen yanıt FIRLATIR. Çağrı sayısı sayılır. */
function sahteApi(yanitlar: Array<Is[] | Error>) {
  let cagri = 0
  return {
    api: {
      isler: async (): Promise<Is[]> => {
        const y = yanitlar[Math.min(cagri, yanitlar.length - 1)]
        cagri += 1
        if (y instanceof Error) throw y
        return y
      },
    },
    cagri: (): number => cagri,
  }
}

async function bekleCalistir(yanitlar: Array<Is[] | Error>, ek: Partial<BekleGirdisi> = {}) {
  const saat = sahteSaat()
  const api = sahteApi(yanitlar)
  const loglar: string[] = []
  const sonuc = await B.bekle({ api: api.api, toplam: N, uyku: saat.uyku, simdi: saat.simdi, log: (m) => void loglar.push(m), ...ek })
  return { sonuc, saat, api, loglar }
}

// ══ 1. saf yardımcılar ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('beklenenAdlar ve degerlendir: saf, FIRLATMAZ, bozuk girdi "iş yok" sayılır', () => {
  it('beklenen adlar ci.yml iş adı şablonuyla birebir: `test-shard (i/N)`', () => {
    expect(B.beklenenAdlar(4)).toEqual(['test-shard (1/4)', 'test-shard (2/4)', 'test-shard (3/4)', 'test-shard (4/4)'])
    expect(B.beklenenAdlar(1)).toEqual(['test-shard (1/1)'])
    expect(B.IS_ON_EKI).toBe('test-shard')
  })

  it('hepsi success: başarılı N, kalan listeler boş', () => {
    const d = B.degerlendir([ciIsi(), ...shardlar()], N)
    expect(d.basarili).toHaveLength(N)
    expect([d.eksik, d.tekrar, d.beklenmeyen, d.bozuk, d.bekleyen]).toEqual([[], [], [], [], []])
  })

  it('girdi sırasından bağımsız; `ci` ve başka adlı işler yok sayılır', () => {
    const karisik = [...shardlar()].reverse()
    const d = B.degerlendir([is('lint'), ...karisik, ciIsi(), is('admin-smoke')], N)
    expect(d.basarili).toHaveLength(N)
    expect(d.beklenmeyen).toEqual([])
  })

  it('sınıflandırma: bozuk (completed ama success değil), bekleyen (completed değil), eksik, tekrar, beklenmeyen', () => {
    const d = B.degerlendir([is('test-shard (1/4)', 'completed', 'failure'), is('test-shard (2/4)', 'in_progress', null), is('test-shard (2/4)'), is('test-shard (3/4)'), is('test-shard (7/9)'), is('test-shard-yedek')], N)
    expect(d.bozuk.map((j) => j.name)).toEqual(['test-shard (1/4)'])
    expect(d.eksik).toEqual(['test-shard (4/4)'])
    expect(d.tekrar).toEqual(['test-shard (2/4)'])
    expect(d.beklenmeyen).toEqual(['test-shard (7/9)', 'test-shard-yedek'])
    expect(d.basarili.map((j) => j.name)).toEqual(['test-shard (3/4)'])
    // tekrar eden ad bekleyen/başarılı sayılmaz (hangisinin doğru olduğu bilinemez)
    expect(d.bekleyen).toEqual([])
  })

  it('success DIŞINDAKİ her sonuç bozuktur: failure, cancelled, skipped, timed_out, action_required, neutral, stale, startup_failure, bilinmeyen, null', () => {
    for (const sonuc of ['failure', 'cancelled', 'skipped', 'timed_out', 'action_required', 'neutral', 'stale', 'startup_failure', 'yeni_bir_sonuc', null]) {
      const d = B.degerlendir([is('test-shard (1/1)', 'completed', sonuc)], 1)
      expect(d.bozuk, String(sonuc)).toHaveLength(1)
      expect(d.basarili, String(sonuc)).toHaveLength(0)
    }
  })

  it('tamamlanmamış iş (queued, in_progress, waiting, pending, requested) conclusion success olsa da BİTMİŞ sayılmaz', () => {
    for (const durum of ['queued', 'in_progress', 'waiting', 'pending', 'requested']) {
      const d = B.degerlendir([is('test-shard (1/1)', durum, 'success')], 1)
      expect(d.bekleyen, durum).toHaveLength(1)
      expect(d.basarili, durum).toHaveLength(0)
    }
  })

  it('bozuk girdi FIRLATMAZ ve "iş yok" sayılır: dizi olmayan, null/sayı/ad olmayan elemanlar', () => {
    for (const bozuk of [null, undefined, 'metin', 42, {}, { jobs: [] }]) {
      const d = B.degerlendir(bozuk, N)
      expect(d.eksik, JSON.stringify(bozuk)).toEqual(adlar())
      expect(d.basarili).toEqual([])
    }
    const d = B.degerlendir([null, undefined, 7, 'x', {}, { name: 5 }, { name: null }, ...shardlar()], N)
    expect(d.basarili).toHaveLength(N)
  })
})

// ══ 2. bekle ═════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('bekle: karar tablosu (sahte saat, sahte API)', () => {
  it('hepsi success: TAMAM, API bir kez okunur, hiç uyunmaz', async () => {
    const { sonuc, saat, api } = await bekleCalistir([[ciIsi(), ...shardlar()]])
    expect(sonuc).toEqual({ tamam: true, neden: `${N}/${N} shard success` })
    expect(api.cagri()).toBe(1)
    expect(saat.uykular).toEqual([])
  })

  it('biri failure: KIRMIZI, kalanlar BEKLENMEDEN hemen (API bir kez, uyku yok); neden işi ve bağlantıyı taşır', async () => {
    const { sonuc, saat, api } = await bekleCalistir([shardlar(['success', 'failure', 'sürüyor', 'sürüyor'])])
    expect(sonuc.tamam).toBe(false)
    expect(sonuc.neden).toContain('shard KIRMIZI')
    expect(sonuc.neden).toContain('test-shard (2/4): failure')
    expect(sonuc.neden).toContain('https://github.example/')
    expect(api.cagri()).toBe(1)
    expect(saat.uykular).toEqual([])
  })

  it('success dışındaki HER bitmiş sonuç kırmızıdır: cancelled, skipped, timed_out, action_required, neutral, stale, startup_failure', async () => {
    for (const sonuc of ['cancelled', 'skipped', 'timed_out', 'action_required', 'neutral', 'stale', 'startup_failure']) {
      const r = await bekleCalistir([shardlar(['success', 'success', sonuc, 'success'])])
      expect(r.sonuc.tamam, sonuc).toBe(false)
      expect(r.sonuc.neden, sonuc).toContain(`test-shard (3/4): ${sonuc}`)
    }
  })

  it('kırmızı + eksik shard birlikte: KIRMIZI hemen (eksik tolerans süresi beklenmez)', async () => {
    const r = await bekleCalistir([shardlar(['failure']).slice(0, 2)])
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('shard KIRMIZI')
    expect(r.saat.uykular).toEqual([])
  })

  it('sürüyor sonra success: bekler (aralık kadar uyur), durum değişince bir satır loglar, sonunda TAMAM', async () => {
    const r = await bekleCalistir([shardlar(['success', 'sürüyor', 'sürüyor', 'success']), shardlar(['success', 'success', 'sürüyor', 'success']), shardlar()])
    expect(r.sonuc.tamam).toBe(true)
    expect(r.api.cagri()).toBe(3)
    expect(r.saat.uykular).toEqual([B.ARALIK_SN * 1000, B.ARALIK_SN * 1000])
    expect(r.loglar).toEqual(['2/4 bitti, 2 sürüyor', '3/4 bitti, 1 sürüyor'])
  })

  it('sırada (queued) iş de bekleyendir; sonra kırmızı gelirse kırmızı', async () => {
    const r = await bekleCalistir([shardlar(['sırada', 'success', 'success', 'success']), shardlar(['failure', 'success', 'success', 'success'])])
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('test-shard (1/4): failure')
    expect(r.api.cagri()).toBe(2)
  })

  it('eksik shard TOLERANS içinde sonradan görünür: TAMAM (listeleme gecikmesi kırmızı sayılmaz)', async () => {
    const r = await bekleCalistir([shardlar().slice(0, 3), shardlar().slice(0, 3), shardlar()])
    expect(r.sonuc.tamam).toBe(true)
    expect(r.saat.gecenSn()).toBeLessThan(B.EKSIK_TOLERANS_SN)
    expect(r.loglar[0]).toBe('3/4 bitti, 0 sürüyor, 1 listede yok')
  })

  it('eksik shard TOLERANS SONRASI hâlâ yok: KIRMIZI; neden eksik adı ve "Re-run all jobs" uyarısını taşır', async () => {
    const r = await bekleCalistir([shardlar().slice(0, 3)])
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('4 shard\'dan 1 tanesi')
    expect(r.sonuc.neden).toContain('test-shard (4/4)')
    expect(r.sonuc.neden).toContain('Re-run all jobs')
    expect(r.saat.gecenSn()).toBeGreaterThanOrEqual(B.EKSIK_TOLERANS_SN)
    expect(r.saat.gecenSn()).toBeLessThanOrEqual(B.EKSIK_TOLERANS_SN + B.ARALIK_SN)
  })

  it('HİÇ shard işi yok (yeniden koşumda yalnız `ci` yeniden çalıştırıldı): tolerans sonrası KIRMIZI, hepsi eksik', async () => {
    const r = await bekleCalistir([[ciIsi()]])
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain(`beklenen ${N} shard'dan ${N} tanesi`)
    for (const ad of adlar()) expect(r.sonuc.neden).toContain(ad)
  })

  it('tekrar eden shard adı: KIRMIZI hemen', async () => {
    const r = await bekleCalistir([[...shardlar(), is('test-shard (2/4)')]])
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('aynı adlı birden fazla shard işi var: test-shard (2/4)')
    expect(r.saat.uykular).toEqual([])
  })

  it('beklenmeyen shard adı (matrix SHARD_TOPLAM ile uyuşmuyor, fazladan iş): KIRMIZI hemen, tüm beklenenler success olsa da', async () => {
    const r = await bekleCalistir([[...shardlar(), is('test-shard (5/5)')]])
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('beklenmeyen shard işi var (test-shard (5/5))')
    expect(r.sonuc.neden).toContain(`SHARD_TOPLAM=${N}`)
    const r2 = await bekleCalistir([[...shardlar(), is('test-shard-yedek')]])
    expect(r2.sonuc.tamam).toBe(false)
  })

  it('sayı uyuşmazlığı: matrix 5 iş koşturur, SHARD_TOPLAM=4: 5. iş beklenmeyen, KIRMIZI (son shard sessizce yok sayılmaz)', async () => {
    const r = await bekleCalistir([shardlar([], 4).concat([is('test-shard (5/5)')])])
    expect(r.sonuc.tamam).toBe(false)
    const r2 = await bekleCalistir([shardlar([], 5)])
    expect(r2.sonuc.tamam).toBe(false)
    expect(r2.sonuc.neden).toContain('beklenmeyen shard işi')
  })

  it('ZAMAN AŞIMI: shard hep sürüyor: bekleSn sonra KIRMIZI, neden sürenleri ve sınırı taşır', async () => {
    const r = await bekleCalistir([shardlar(['success', 'sürüyor', 'success', 'success'])], { bekleSn: 60 })
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('zaman aşımı (60 sn)')
    expect(r.sonuc.neden).toContain('test-shard (2/4)=in_progress')
    expect(r.saat.gecenSn()).toBeGreaterThanOrEqual(60)
    expect(r.saat.gecenSn()).toBeLessThanOrEqual(60 + B.ARALIK_SN)
  })

  it('zaman aşımında eksik shard `=yok` olarak anılır', async () => {
    const r = await bekleCalistir([shardlar(['sürüyor', 'success', 'success', 'success']).slice(0, 3)], { bekleSn: 20, toleransSn: 9999 })
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('zaman aşımı (20 sn)')
    expect(r.sonuc.neden).toContain('test-shard (1/4)=in_progress')
    expect(r.sonuc.neden).toContain('test-shard (4/4)=yok')
  })

  it('varsayılan sabit değerler: aralık 10 sn, tolerans 45 sn, toplam bekleme 900 sn (ci timeout-minutes 15 ile uyumlu)', () => {
    expect([B.ARALIK_SN, B.EKSIK_TOLERANS_SN, B.BEKLEME_SN]).toEqual([10, 45, 900])
  })

  it('API 3 kez ÜST ÜSTE okunamazsa KIRMIZI (doğrulanamayan shard yeşil sayılmaz): tam 3 çağrı, 2 uyku', async () => {
    const r = await bekleCalistir([new Error('gh api: HTTP 502')])
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('3 kez üst üste okunamadı')
    expect(r.sonuc.neden).toContain('HTTP 502')
    expect(r.api.cagri()).toBe(3)
    expect(r.saat.uykular).toEqual([B.ARALIK_SN * 1000, B.ARALIK_SN * 1000])
  })

  it('tek API hatası sonra toparlanma: DEVAM eder ve TAMAM; art arda sayacı her başarıda sıfırlanır (hata, hata, iyi, hata, hata, iyi)', async () => {
    const tek = await bekleCalistir([new Error('geçici'), shardlar()])
    expect(tek.sonuc.tamam).toBe(true)
    expect(tek.api.cagri()).toBe(2)
    const e = new Error('geçici')
    const kesikli = await bekleCalistir([e, e, shardlar(['sürüyor', 'success', 'success', 'success']), e, e, shardlar()])
    expect(kesikli.sonuc.tamam).toBe(true)
    expect(kesikli.api.cagri()).toBe(6)
  })

  it('API hatası sırasında kırmızı görülmüş olsa bile önceki iyi yanıt SAYILMAZ: hata sonrası yeni okuma kırmızıysa KIRMIZI', async () => {
    const r = await bekleCalistir([shardlar(['sürüyor', 'success', 'success', 'success']), new Error('geçici'), shardlar(['failure', 'success', 'success', 'success'])])
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('test-shard (1/4): failure')
  })

  it('geçersiz toplam KIRMIZI ve API HİÇ çağrılmaz: 0, negatif, kesirli, 33, NaN, metin, boş', async () => {
    for (const toplam of [0, -1, 2.5, 33, Number.NaN, '4', '', null, undefined]) {
      const api = sahteApi([shardlar()])
      const saat = sahteSaat()
      const sonuc = await B.bekle({ api: api.api, toplam, uyku: saat.uyku, simdi: saat.simdi })
      expect(sonuc.tamam, String(toplam)).toBe(false)
      expect(sonuc.neden, String(toplam)).toContain('SHARD_TOPLAM geçersiz')
      expect(api.cagri(), String(toplam)).toBe(0)
    }
  })

  it('tek shard (N=1) ve en büyük shard (N=32) doğru çalışır', async () => {
    const bir = await bekleCalistir([shardlar([], 1)], { toplam: 1 })
    expect(bir.sonuc).toEqual({ tamam: true, neden: '1/1 shard success' })
    const otuzIki = await bekleCalistir([shardlar([], 32)], { toplam: 32 })
    expect(otuzIki.sonuc.tamam).toBe(true)
    const eksik = await bekleCalistir([shardlar([], 32).slice(0, 31)], { toplam: 32 })
    expect(eksik.sonuc.tamam).toBe(false)
  })

  it('API bozuk gövde döndürürse (dizi değil) "iş yok" sayılır: eksik → tolerans sonrası KIRMIZI (yeşil asla)', async () => {
    const r = await bekleCalistir([[]])
    expect(r.sonuc.tamam).toBe(false)
    expect(r.sonuc.neden).toContain('YOK')
  })
})

// ══ 3. gercekApi ═════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('gercekApi: URL koşunun BU DENEMESİNE kilitli, sayfalı, sahte `gh` ile', () => {
  const sayfaGovdesi = (n: number, ad = 'j', toplam?: number): string => JSON.stringify({ total_count: toplam ?? n, jobs: Array.from({ length: n }, (_, i) => ({ name: `${ad}${i}`, status: 'completed', conclusion: 'success' })) })

  it('URL: repos/{depo}/actions/runs/{koşu}/attempts/{deneme}/jobs?per_page=100&page=1 (başka koşuya ya da önceki denemeye kaymaz)', async () => {
    const yollar: string[] = []
    const api = B.gercekApi('sahip/depo', '123456789', '3', async (yol) => {
      yollar.push(yol)
      return sayfaGovdesi(2)
    })
    const isler = await api.isler()
    expect(isler.map((j) => j.name)).toEqual(['j0', 'j1'])
    expect(yollar).toEqual(['repos/sahip/depo/actions/runs/123456789/attempts/3/jobs?per_page=100&page=1'])
  })

  it('sayfalar: 100 + 30 iş iki çağrıyla gelir; ikinci sayfa page=2; tam sayfa total_count ulaşılınca ÜÇÜNCÜ çağrı yapılmaz', async () => {
    const yollar: string[] = []
    const api = B.gercekApi('o/r', '1', '1', async (yol) => {
      yollar.push(yol)
      return yol.endsWith('page=1') ? sayfaGovdesi(100, 'a', 130) : sayfaGovdesi(30, 'b', 130)
    })
    const isler = await api.isler()
    expect(isler).toHaveLength(130)
    expect(yollar.map((y) => y.slice(y.indexOf('?')))).toEqual(['?per_page=100&page=1', '?per_page=100&page=2'])
    // tam 100 iş ve total_count=100: ikinci sayfa istenmez
    const tek: string[] = []
    const a2 = B.gercekApi('o/r', '1', '1', async (yol) => {
      tek.push(yol)
      return sayfaGovdesi(100, 'a', 100)
    })
    expect(await a2.isler()).toHaveLength(100)
    expect(tek).toHaveLength(1)
  })

  it('total_count yoksa tam sayfa sonrası bir sonraki sayfa istenir; kısa sayfa bitirir', async () => {
    const sayfalar = [JSON.stringify({ jobs: Array.from({ length: 100 }, (_, i) => ({ name: `s${i}` })) }), JSON.stringify({ jobs: [{ name: 'son' }] })]
    let i = 0
    const api = B.gercekApi('o/r', '1', '1', async () => sayfalar[i++])
    expect(await api.isler()).toHaveLength(101)
    expect(i).toBe(2)
  })

  it('10 tam sayfadan uzun liste FIRLATIR (sınırsız döngü yok); bozuk JSON FIRLATIR; gh hatası aynen yayılır', async () => {
    let cagri = 0
    const sonsuz = B.gercekApi('o/r', '1', '1', async () => {
      cagri += 1
      return JSON.stringify({ jobs: Array.from({ length: 100 }, (_, i) => ({ name: `s${i}` })) })
    })
    await expect(sonsuz.isler()).rejects.toThrow(/10 sayfadan uzun/)
    expect(cagri).toBe(10)
    await expect(B.gercekApi('o/r', '1', '1', async () => 'json-degil').isler()).rejects.toThrow()
    await expect(
      B.gercekApi('o/r', '1', '1', async () => {
        throw new Error('gh api: HTTP 403')
      }).isler(),
    ).rejects.toThrow(/HTTP 403/)
  })

  it('`jobs` alanı yok ya da dizi değil: boş liste (eksik shard yolu KIRMIZI verir; yeşil verilmez)', async () => {
    expect(await B.gercekApi('o/r', '1', '1', async () => '{}').isler()).toEqual([])
    expect(await B.gercekApi('o/r', '1', '1', async () => JSON.stringify({ jobs: 'x', total_count: 3 })).isler()).toEqual([])
  })
})

// ══ 4. ortamiOku ═════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('ortamiOku: eksik ya da geçersiz ortam FIRLATIR (bekleyici sessizce varsayılana düşmez)', () => {
  const gecerli = { DEPO: 'sahip/depo', KOSU_ID: '123456789', KOSU_DENEME: '2', SHARD_TOPLAM: '4' }

  it('geçerli ortam: sayılar sayıya çevrilir, bekleme süresi varsayılan 900', () => {
    expect(B.ortamiOku(gecerli)).toEqual({ depo: 'sahip/depo', kosuId: '123456789', deneme: '2', toplam: 4, bekleSn: 900 })
    expect(B.ortamiOku({ ...gecerli, BEKLEME_SN: '' }).bekleSn).toBe(900)
    expect(B.ortamiOku({ ...gecerli, BEKLEME_SN: '60' }).bekleSn).toBe(60)
    expect(B.ortamiOku({ ...gecerli, DEPO: 'a.b-c/d_e.f', SHARD_TOPLAM: '32' })).toMatchObject({ depo: 'a.b-c/d_e.f', toplam: 32 })
  })

  it('her geçersiz değer FIRLATIR ve nedeni adlandırır', () => {
    const bozuklar: Array<[Record<string, string | undefined>, RegExp]> = [
      [{ ...gecerli, DEPO: undefined }, /DEPO/],
      [{ ...gecerli, DEPO: '' }, /DEPO/],
      [{ ...gecerli, DEPO: 'depo' }, /DEPO/],
      [{ ...gecerli, DEPO: 'a/b/c' }, /DEPO/],
      [{ ...gecerli, DEPO: 'a b/c' }, /DEPO/],
      [{ ...gecerli, DEPO: 'a/b?x=1' }, /DEPO/],
      [{ ...gecerli, KOSU_ID: undefined }, /KOSU_ID/],
      [{ ...gecerli, KOSU_ID: 'abc' }, /KOSU_ID/],
      [{ ...gecerli, KOSU_ID: '-1' }, /KOSU_ID/],
      [{ ...gecerli, KOSU_ID: '12/../x' }, /KOSU_ID/],
      [{ ...gecerli, KOSU_DENEME: undefined }, /KOSU_DENEME/],
      [{ ...gecerli, KOSU_DENEME: '0' }, /KOSU_DENEME/],
      [{ ...gecerli, KOSU_DENEME: '' }, /KOSU_DENEME/],
      [{ ...gecerli, KOSU_DENEME: 'a' }, /KOSU_DENEME/],
      [{ ...gecerli, KOSU_DENEME: '01' }, /KOSU_DENEME/],
      [{ ...gecerli, SHARD_TOPLAM: undefined }, /SHARD_TOPLAM/],
      [{ ...gecerli, SHARD_TOPLAM: '' }, /SHARD_TOPLAM/],
      [{ ...gecerli, SHARD_TOPLAM: '0' }, /SHARD_TOPLAM/],
      [{ ...gecerli, SHARD_TOPLAM: '33' }, /SHARD_TOPLAM/],
      [{ ...gecerli, SHARD_TOPLAM: '4.5' }, /SHARD_TOPLAM/],
      [{ ...gecerli, SHARD_TOPLAM: 'dört' }, /SHARD_TOPLAM/],
      [{ ...gecerli, BEKLEME_SN: '0' }, /BEKLEME_SN/],
      [{ ...gecerli, BEKLEME_SN: '-5' }, /BEKLEME_SN/],
      [{ ...gecerli, BEKLEME_SN: 'cok' }, /BEKLEME_SN/],
    ]
    for (const [ortam, desen] of bozuklar) expect(() => B.ortamiOku(ortam), JSON.stringify(ortam)).toThrow(desen)
  })
})

// ══ 5. main ═════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('main: çıkış kodu 0 YALNIZ tüm shard success iken; her hata 1 ve `::error::`', () => {
  const ortam = { DEPO: 'sahip/depo', KOSU_ID: '123456789', KOSU_DENEME: '2', SHARD_TOPLAM: String(N) }

  async function calistir(o: Record<string, string | undefined>, yanitlar: Array<Is[] | Error>) {
    const saat = sahteSaat()
    const api = sahteApi(yanitlar)
    const yazilan: string[] = []
    const kod = await B.main(o, { api: api.api, uyku: saat.uyku, simdi: saat.simdi, yaz: (m) => void yazilan.push(m) })
    return { kod, yazilan, api, saat }
  }

  it('hepsi success: 0 ve `::notice::` satırı koşu ve deneme numarasını taşır', async () => {
    const r = await calistir(ortam, [shardlar()])
    expect(r.kod).toBe(0)
    expect(r.yazilan).toEqual([`::notice::test shard: ${N}/${N} shard success (koşu 123456789, deneme 2)`])
  })

  it('biri failure: 1 ve `::error::` satırı shard adını ve koşu/deneme numarasını taşır', async () => {
    const r = await calistir(ortam, [shardlar(['success', 'success', 'failure', 'success'])])
    expect(r.kod).toBe(1)
    expect(r.yazilan.at(-1)).toMatch(/^::error::test shard: shard KIRMIZI: test-shard \(3\/4\): failure.* \(koşu 123456789, deneme 2\)$/)
  })

  it('geçersiz ortam: 1, `::error::test shard bekleyici:` ve API HİÇ çağrılmaz', async () => {
    for (const bozuk of [{}, { ...ortam, DEPO: undefined }, { ...ortam, KOSU_DENEME: '0' }, { ...ortam, SHARD_TOPLAM: '99' }]) {
      const r = await calistir(bozuk, [shardlar()])
      expect(r.kod, JSON.stringify(bozuk)).toBe(1)
      expect(r.yazilan).toHaveLength(1)
      expect(r.yazilan[0]).toMatch(/^::error::test shard bekleyici: /)
      expect(r.api.cagri()).toBe(0)
    }
  })

  it('BEKLEME_SN verilirse zaman aşımı onunla olur: 15 sn: 1 ve `zaman aşımı (15 sn)`', async () => {
    const r = await calistir({ ...ortam, BEKLEME_SN: '15' }, [shardlar(['sürüyor', 'success', 'success', 'success'])])
    expect(r.kod).toBe(1)
    expect(r.yazilan.at(-1)).toContain('zaman aşımı (15 sn)')
    expect(r.saat.gecenSn()).toBeLessThanOrEqual(15 + B.ARALIK_SN)
  })

  it('API sürekli hata: 1; hata metni TEK satıra iner (satır sonu yeni bir iş akışı komutu yazamaz) ve 400 karakterle sınırlanır', async () => {
    const r = await calistir(ortam, [new Error(`kötü\n::error::sahte komut\r\n${'x'.repeat(2000)}`)])
    expect(r.kod).toBe(1)
    expect(r.yazilan.length).toBeGreaterThan(0)
    for (const m of r.yazilan) expect(m, m.slice(0, 80)).not.toMatch(/[\r\n]/)
    expect(r.yazilan.at(-1)).toMatch(/^::error::test shard: iş listesi 3 kez üst üste okunamadı \(kötü ::error::sahte komut/)
  })

  it('log satırları `test shard: ` önekiyle yazılır (durum değişince)', async () => {
    const r = await calistir(ortam, [shardlar(['sürüyor', 'success', 'success', 'success']), shardlar()])
    expect(r.kod).toBe(0)
    expect(r.yazilan[0]).toBe('test shard: 3/4 bitti, 1 sürüyor')
  })
})

// ══ 6. gerçek süreç ═════════════════════════════════════════════════════════════════════════════════════════════════════
describe('gerçek süreç: betik çıkış kodunu process.exitCode ile taşır (geçersiz ortamda ağa HİÇ çıkmaz)', () => {
  it('boş ortam: çıkış kodu 1 ve stdout `::error::test shard bekleyici: DEPO`', () => {
    const env: NodeJS.ProcessEnv = { ...process.env }
    for (const k of ['DEPO', 'KOSU_ID', 'KOSU_DENEME', 'SHARD_TOPLAM', 'BEKLEME_SN', 'GH_TOKEN']) delete env[k]
    const r = spawnSync(process.execPath, [BETIK], { cwd: KOK, env, encoding: 'utf8', timeout: 30_000, windowsHide: true })
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/^::error::test shard bekleyici: DEPO \(sahip\/depo\) eksik ya da geçersiz\r?\n$/)
  })

  it('SHARD_TOPLAM geçersiz: çıkış kodu 1', () => {
    const env: NodeJS.ProcessEnv = { ...process.env, DEPO: 'sahip/depo', KOSU_ID: '1', KOSU_DENEME: '1', SHARD_TOPLAM: '0' }
    const r = spawnSync(process.execPath, [BETIK], { cwd: KOK, env, encoding: 'utf8', timeout: 30_000, windowsHide: true })
    expect(r.status).toBe(1)
    expect(r.stdout).toContain('::error::test shard bekleyici: SHARD_TOPLAM')
  })
})
