/**
 * INV-TCMB-COOLDOWN-1 (OPS-293 D5) — `tcmb-rates-sync` kimliksizdir (verify_jwt=false); yetkisiz çağrı sahte kur
 * YAZDIRAMAZ ama her çağrı TCMB'ye giderdi (kaynak tüketimi). Sertleştirme: bugünün bülteni yazılmışsa, bu
 * isolate 30 dk içinde başarılı TCMB isteği yaptıysa ya da istek sürüyorsa TCMB'ye HİÇ gitmeden `carried:true`.
 *
 * İki katman: (1) karar `cooldown.ts` (saf, importsuz) DAVRANIŞSAL ölçülür; (2) uç dosyası metin olarak: kapı
 * TCMB `fetch`'inden ÖNCE, süren-istek bayrağı ilk `await`'ten ÖNCE kurulur, damga yalnız `damgaAtilsinMi` ile.
 * security-reviewer (15 Kasım) bulguları F1-F5 buraya bağlıdır.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  COOLDOWN_MS,
  cooldownKarari,
  damgaAtilsinMi,
  haftaSonuMu,
  istanbulBugun,
} from '../../../supabase/functions/tcmb-rates-sync/cooldown'

const KOD = readFileSync(join(process.cwd(), 'supabase', 'functions', 'tcmb-rates-sync', 'index.ts'), 'utf8')

// 2026-11-16 Pazartesi 12:45 UTC = 15:45 İstanbul; 2026-11-14 Cumartesi.
const PAZARTESI = Date.UTC(2026, 10, 16, 12, 45)
const CUMARTESI = Date.UTC(2026, 10, 14, 12, 45)
const girdi = (o: Partial<Parameters<typeof cooldownKarari>[0]> = {}) => ({
  simdiMs: PAZARTESI,
  sonBasariMs: 0,
  surenIstek: false,
  bugununBulteniVar: false as boolean | null,
  ...o,
})

describe('INV-TCMB-COOLDOWN-1 · karar (davranışsal)', () => {
  it('sabit 30 dk', () => {
    expect(COOLDOWN_MS).toBe(30 * 60 * 1000)
  })

  it('hiçbir koşul yoksa devam (cron çalışır)', () => {
    expect(cooldownKarari(girdi())).toBe('devam')
  })

  it('bellek penceresi sınırı: 29:59 cooldown, 30:00 devam, hiç başarı yoksa (0) devam', () => {
    expect(cooldownKarari(girdi({ sonBasariMs: PAZARTESI - (COOLDOWN_MS - 1000) }))).toBe('cooldown')
    expect(cooldownKarari(girdi({ sonBasariMs: PAZARTESI - COOLDOWN_MS }))).toBe('devam')
    expect(cooldownKarari(girdi({ sonBasariMs: 0 }))).toBe('devam')
  })

  it('süren istek varsa cooldown (eşzamanlı çağrılar tek uçuş)', () => {
    expect(cooldownKarari(girdi({ surenIstek: true }))).toBe('cooldown')
  })

  it('bugünün bülteni DB’de varsa cooldown; yoksa ya da OKUNAMADIYSA (null) fail-open devam', () => {
    expect(cooldownKarari(girdi({ bugununBulteniVar: true }))).toBe('cooldown')
    expect(cooldownKarari(girdi({ bugununBulteniVar: false }))).toBe('devam')
    expect(cooldownKarari(girdi({ bugununBulteniVar: null }))).toBe('devam')
  })

  it('İstanbul günü: UTC 21:30 ertesi güne geçer, hafta sonu İstanbul takvimiyle ölçülür', () => {
    expect(istanbulBugun(Date.UTC(2026, 10, 16, 20, 59))).toBe('2026-11-16')
    expect(istanbulBugun(Date.UTC(2026, 10, 16, 21, 0))).toBe('2026-11-17')
    expect(haftaSonuMu(CUMARTESI)).toBe(true)
    expect(haftaSonuMu(PAZARTESI)).toBe(false)
  })

  it('F3/F4: dünkü bülten (bugün yayınlanmadı) bellek damgası KURMAZ → 12:45 cron’u bastırılamaz; hafta sonu kurar', () => {
    expect(damgaAtilsinMi('2026-11-16', PAZARTESI)).toBe(true)
    expect(damgaAtilsinMi('2026-11-13', PAZARTESI)).toBe(false)
    expect(damgaAtilsinMi('2026-11-13', CUMARTESI)).toBe(true)
  })
})

describe('INV-TCMB-COOLDOWN-1 · uç dosyası (sıra ve eşzamanlılık)', () => {
  const fetchKonum = KOD.indexOf('await fetch(TCMB_URL')
  const ilkAwait = KOD.indexOf('await supabase', KOD.indexOf('serve(async'))
  const ATAMA = /\)\s+sonBasariMs = |^\s*sonBasariMs = /gm // bildirim (`let sonBasariMs = 0`) sayılmaz
  const bayrakKur = KOD.indexOf('surenIstek = true')

  it('⭐karne kilidi: TCMB fetch’i yalnız `esitle` içinde ve her cooldown dönüşü ondan ÖNCE', () => {
    expect(fetchKonum).toBeGreaterThan(0)
    expect(KOD.indexOf('async function esitle')).toBeLessThan(fetchKonum)
    const donusler = [...KOD.matchAll(/return cooldownYanit\(\)/g)].map((m) => m.index ?? -1)
    expect(donusler.length, 'iki cooldown dönüşü beklenir (eşzamanlı kapı + DB kapısı)').toBe(2)
    for (const d of donusler) expect(d, 'cooldown dönüşü fetch ten sonra').toBeLessThan(fetchKonum)
  })

  it('F1: süren-istek bayrağı serve içindeki İLK await’ten ÖNCE kurulur; finally ile bırakılır', () => {
    expect(bayrakKur).toBeGreaterThan(0)
    expect(bayrakKur).toBeLessThan(ilkAwait)
    expect(KOD).toMatch(/finally \{\s*surenIstek = false\s*\}/)
  })

  it('F2: DB kapısı BUGÜNÜN (İstanbul) bülteni, `fetched_at` değil; okuma hatası fail-open', () => {
    expect(KOD).toMatch(/\.eq\('effective_date', istanbulBugun\(Date\.now\(\)\)\)/)
    expect(KOD).not.toMatch(/fetched_at/)
    expect(KOD).toMatch(/bugunHatasi \? null :/)
  })

  it('F3/F4: bellek damgası yalnız `damgaAtilsinMi` ile, ayrıştırma BAŞARISINDAN sonra; fetch öncesi atama yok', () => {
    const atamalar = [...KOD.matchAll(ATAMA)].map((m) => m.index ?? -1)
    expect(atamalar.length).toBe(1)
    expect(atamalar[0]).toBeGreaterThan(fetchKonum)
    expect(KOD).toMatch(/if \(damgaAtilsinMi\(bulletin\.effectiveDate, Date\.now\(\)\)\) sonBasariMs = Date\.now\(\)/)
    expect(KOD.indexOf('const bulletin = parseBulletin')).toBeLessThan(atamalar[0])
  })

  it('yanıt gövdesinde iç hata metni yok: cooldown yanıtı sabit koddur', () => {
    expect(KOD).toMatch(/reason: 'cooldown'/)
    expect(KOD).not.toMatch(/reason: 'cooldown'[^}]*\.message/)
  })

  it('dedektör sabotajı: bayrak await’ten sonraya, damga fetch’ten öncesine ya da fetched_at kapısı geri gelirse KIRMIZI', () => {
    const bayrakSonra = KOD.replace('surenIstek = true', '/* kaldirildi */').replace(
      'return await esitle(supabase)',
      'surenIstek = true\n    return await esitle(supabase)',
    )
    expect(bayrakSonra.indexOf('surenIstek = true')).toBeGreaterThan(bayrakSonra.indexOf('await supabase', bayrakSonra.indexOf('serve(async')))
    const damgaOnce = KOD.replace('async function esitle(supabase: ReturnType<typeof createClient>): Promise<Response> {', 'async function esitle(supabase: ReturnType<typeof createClient>): Promise<Response> {\n  sonBasariMs = Date.now()')
    expect([...damgaOnce.matchAll(ATAMA)].length).toBe(2)
    expect(KOD.replace(".eq('effective_date', istanbulBugun(Date.now()))", ".select('fetched_at')")).toMatch(/fetched_at/)
  })
})
