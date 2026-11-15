/**
 * INV-TCMB-COOLDOWN-1 (OPS-293 D5) — `tcmb-rates-sync` kimliksizdir (verify_jwt=false); yetkisiz çağrı sahte kur
 * YAZDIRAMAZ ama her çağrı TCMB'ye giderdi (kaynak tüketimi). Sertleştirme: bugünün bülteni TAM yazılmışsa, bu
 * isolate 30 dk içinde TAM başarılı bir TCMB isteği yaptıysa ya da istek sürüyorsa TCMB'ye HİÇ gitmeden `carried:true`.
 *
 * İki katman: (1) karar `cooldown.ts` (saf, importsuz) DAVRANIŞSAL ölçülür; (2) uç dosyası metin olarak ölçülür
 * (`ucSorunlari`), ve AYNI fonksiyon sabotajlı metne uygulanıp KIRMIZI beklenir (sabotaj testi totoloji olmasın).
 * security-reviewer (15 Kasım, iki okuma) bulguları F1-F5 ve B1-B5 buraya bağlıdır.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  bultenTamMi,
  COOLDOWN_MS,
  cooldownKarari,
  cronPenceresiniKapsarMi,
  damgaAtilsinMi,
  haftaSonuMu,
  istanbulBugun,
} from '../../../supabase/functions/tcmb-rates-sync/cooldown'

const KOD = readFileSync(join(process.cwd(), 'supabase', 'functions', 'tcmb-rates-sync', 'index.ts'), 'utf8').replace(/\r\n/g, '\n')

// 2026-11-16 Pazartesi; 12:45 UTC = 15:45 İstanbul (cron anı). 2026-11-14 Cumartesi.
const PAZARTESI_CRON = Date.UTC(2026, 10, 16, 12, 45)
const PAZARTESI_SABAH = Date.UTC(2026, 10, 16, 6, 0) // 09:00 İstanbul, bülten henüz yok
const CUMARTESI = Date.UTC(2026, 10, 14, 12, 45)
const girdi = (o: Partial<Parameters<typeof cooldownKarari>[0]> = {}) => ({
  simdiMs: PAZARTESI_CRON,
  sonBasariMs: 0,
  surenIstek: false,
  bugununBultenTam: false as boolean | null,
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
    expect(cooldownKarari(girdi({ sonBasariMs: PAZARTESI_CRON - (COOLDOWN_MS - 1000) }))).toBe('cooldown-memory')
    expect(cooldownKarari(girdi({ sonBasariMs: PAZARTESI_CRON - COOLDOWN_MS }))).toBe('devam')
    expect(cooldownKarari(girdi({ sonBasariMs: 0 }))).toBe('devam')
  })

  it('süren istek varsa cooldown-inflight (eşzamanlı çağrılar tek uçuş)', () => {
    expect(cooldownKarari(girdi({ surenIstek: true }))).toBe('cooldown-inflight')
  })

  it('bugünün bülteni TAM ise cooldown-db; eksik ya da OKUNAMADIYSA (null) fail-open devam', () => {
    expect(cooldownKarari(girdi({ bugununBultenTam: true }))).toBe('cooldown-db')
    expect(cooldownKarari(girdi({ bugununBultenTam: false }))).toBe('devam')
    expect(cooldownKarari(girdi({ bugununBultenTam: null }))).toBe('devam')
  })

  it('B1: EUR yazılıp USD düştüyse bülten TAM değil → onarım (yeniden çağrı) kilitlenmez', () => {
    const t = ['t1']
    expect(bultenTamMi(t, ['EUR', 'USD'], [{ tenant_id: 't1', quote_ccy: 'EUR' }])).toBe(false)
    expect(bultenTamMi(t, ['EUR', 'USD'], [{ tenant_id: 't1', quote_ccy: 'EUR' }, { tenant_id: 't1', quote_ccy: 'USD' }])).toBe(true)
    // gün içinde açılan yeni kiracı kurunu alamamış → tam değil
    expect(bultenTamMi(['t1', 't2'], ['EUR'], [{ tenant_id: 't1', quote_ccy: 'EUR' }])).toBe(false)
    // char(3) doldurma boşluğu tolere edilir; boş beklenti TAM sayılmaz
    expect(bultenTamMi(t, ['EUR'], [{ tenant_id: 't1', quote_ccy: 'EUR ' }])).toBe(true)
    expect(bultenTamMi([], ['EUR'], [])).toBe(false)
    expect(bultenTamMi(t, [], [])).toBe(false)
  })

  it('İstanbul günü: UTC 21:00 ertesi güne geçer, hafta sonu İstanbul takvimiyle ölçülür', () => {
    expect(istanbulBugun(Date.UTC(2026, 10, 16, 20, 59))).toBe('2026-11-16')
    expect(istanbulBugun(Date.UTC(2026, 10, 16, 21, 0))).toBe('2026-11-17')
    expect(haftaSonuMu(CUMARTESI)).toBe(true)
    expect(haftaSonuMu(PAZARTESI_CRON)).toBe(false)
  })

  it('B2: cron penceresi: 12:15-12:45 UTC arası pencere cron anını kapsar, 12:46 ve 11:44 kapsamaz', () => {
    expect(cronPenceresiniKapsarMi(Date.UTC(2026, 10, 16, 12, 45))).toBe(true)
    expect(cronPenceresiniKapsarMi(Date.UTC(2026, 10, 16, 12, 15))).toBe(true)
    expect(cronPenceresiniKapsarMi(Date.UTC(2026, 10, 16, 12, 14))).toBe(false)
    expect(cronPenceresiniKapsarMi(Date.UTC(2026, 10, 16, 12, 46))).toBe(false)
    expect(cronPenceresiniKapsarMi(Date.UTC(2026, 10, 16, 23, 59))).toBe(false)
    expect(cronPenceresiniKapsarMi(Date.UTC(2026, 10, 17, 12, 30))).toBe(true) // gün sınırından bağımsız
  })

  it('F3/B2: dünkü bülten cron’u gölgeliyorsa damga KURMAZ; gölgelemiyorsa (sabah, tatil) kurar; bugüne ait ve hafta sonu kurar', () => {
    expect(damgaAtilsinMi('2026-11-16', PAZARTESI_CRON)).toBe(true) // bugüne ait bülten
    expect(damgaAtilsinMi('2026-11-13', CUMARTESI)).toBe(true) // hafta sonu: son iş günü beklenir
    expect(damgaAtilsinMi('2026-11-13', PAZARTESI_SABAH)).toBe(true) // sabah, pencere cron'u kapsamaz → throttle yayılır
    expect(damgaAtilsinMi('2026-11-13', Date.UTC(2026, 10, 16, 12, 30))).toBe(false) // cron'u gölgeler
    expect(damgaAtilsinMi('2026-11-13', PAZARTESI_CRON)).toBe(false)
  })
})

/** Uç dosyası metin kilitleri: boş dizi = temiz. Sabotaj testleri AYNI fonksiyonu bozuk metne uygular. */
function ucSorunlari(ham: string): string[] {
  const s: string[] = []
  const kod = ham.replace(/(?<!:)\/\/.*$/gm, '') // yorumlar sayılmaz (yorumdaki "await" ilk await sanılmasın)
  const serve = kod.indexOf('serve(async')
  const fetchKonum = kod.indexOf('await fetch(TCMB_URL')
  const esitleKonum = kod.indexOf('async function esitle')
  const bayrak = kod.indexOf('surenIstek = true')
  const ilkAwait = kod.indexOf('await ', kod.indexOf('const supabase = createClient'))
  if (fetchKonum < 0 || serve < 0 || esitleKonum < 0) return ['uc yapisi bulunamadi']
  if (esitleKonum > fetchKonum) s.push('TCMB fetch esitle disinda')
  // her cooldown dönüşü fetch'ten ÖNCE ve iki tane (eşzamanlı kapı + DB kapısı)
  const donusler = [...kod.matchAll(/return cooldownYanit\(/g)].map((m) => m.index ?? -1)
  if (donusler.length !== 2) s.push(`cooldown donusu ${donusler.length} (2 beklenir)`)
  if (donusler.some((d) => d > fetchKonum)) s.push('cooldown donusu fetch ten SONRA')
  // F1: bayrak, supabase istemcisinden sonraki İLK await'ten önce; ikinci await'siz kapı
  if (bayrak < 0) s.push('surenIstek bayragi yok')
  else if (ilkAwait >= 0 && bayrak > ilkAwait) s.push('surenIstek bayragi ilk await ten SONRA')
  if (!/try \{[\s\S]*return await esitle\(supabase\)[\s\S]*\} finally \{\s*surenIstek = false\s*\}/.test(kod)) {
    s.push('return await esitle + finally bayrak birakma yok')
  }
  // B1/F2: DB kapısı TAM bülteni ölçer (tenant × kur), `fetched_at` değil
  if (/fetched_at/.test(kod)) s.push('fetched_at kapisi geri geldi')
  if (!/\.eq\('effective_date', istanbulBugun\(Date\.now\(\)\)\)/.test(kod)) s.push('DB kapisi bugunun (Istanbul) bulteni degil')
  if (!/select\('tenant_id, quote_ccy'\)/.test(kod) || !/bultenTamMi\(/.test(kod)) s.push('DB kapisi tam bulteni olcmuyor')
  if (!/Promise\.all\(\[\s*supabase\.from\('tenants'\)/.test(kod)) s.push('kiracilar okunmuyor')
  if (!/: bultenTamMi\(/.test(kod) || !/!kiracilar \|\| !bugunSatirlari\s*\? null/.test(kod)) s.push('okuma hatasi fail-open (null) degil')
  // F3/F4/B3: bellek damgası TEK atama, `ok` hesaplandıktan SONRA, yalnız `ok && damgaAtilsinMi`
  const atamalar = [...kod.matchAll(/(?<!let )\bsonBasariMs\s*=(?!=)/g)].map((m) => m.index ?? -1)
  const okKonum = kod.indexOf('const ok = errors.length === 0')
  if (atamalar.length !== 1) s.push(`sonBasariMs atamasi ${atamalar.length} (1 beklenir)`)
  else if (okKonum < 0 || atamalar[0] < okKonum) s.push('damga yazim sonucundan (ok) ONCE')
  if (!/if \(ok && damgaAtilsinMi\(bulletin\.effectiveDate, Date\.now\(\)\)\) sonBasariMs = Date\.now\(\)/.test(kod)) {
    s.push('damga ok && damgaAtilsinMi ile degil')
  }
  // B4: TCMB isteği zaman aşımlı, cooldown yanıtı nedenli
  if (!/AbortSignal\.timeout\(\d[\d_]*\)/.test(kod)) s.push('TCMB fetch zaman asimsiz')
  if (!/reason: neden/.test(kod)) s.push('cooldown yaniti nedensiz')
  return s
}

describe('INV-TCMB-COOLDOWN-1 · uç dosyası (sıra, eşzamanlılık, yazım sonrası damga)', () => {
  it('⭐karne kilidi: uç dosyası temiz', () => {
    expect(ucSorunlari(KOD)).toEqual([])
  })

  it('yanıt gövdesinde iç hata metni yok: cooldown yanıtı sabit koddur', () => {
    expect(KOD).not.toMatch(/reason: neden[^}]*\.message/)
  })

  it('sabotaj (B5d): her bozulma AYNI kilit fonksiyonundan KIRMIZI geçer', () => {
    const bozuk: Array<[string, string, string]> = [
      ['await esitle', 'return await esitle(supabase)', 'return esitle(supabase)'],
      ['fetched_at', ".eq('effective_date', istanbulBugun(Date.now()))", ".gte('fetched_at', '2020-01-01')"],
      ['fail-open', '!kiracilar || !bugunSatirlari\n        ? null', '!kiracilar || !bugunSatirlari\n        ? true'],
      ['zaman asimi', 'signal: AbortSignal.timeout(10_000)', 'signal: undefined'],
      ['ok sonrasi damga', 'if (ok && damgaAtilsinMi(', 'if (damgaAtilsinMi('],
      ['bayrak finally', 'surenIstek = false\n  }', 'void 0\n  }'],
    ]
    for (const [ad, eski, yeni] of bozuk) {
      expect(KOD, `sabotaj hedefi bulunamadi: ${ad}`).toContain(eski)
      expect(ucSorunlari(KOD.replace(eski, yeni)), `sabotaj yesil kaldi: ${ad}`).not.toEqual([])
    }
    // fetch öncesine fazladan damga ataması (ATAMA kalıbı `{ sonBasariMs = ...}` biçimini de yakalar)
    const oncesi = KOD.replace('async function esitle(supabase: ReturnType<typeof createClient>): Promise<Response> {', 'async function esitle(supabase: ReturnType<typeof createClient>): Promise<Response> {\n  { sonBasariMs = Date.now() }')
    expect(ucSorunlari(oncesi), 'fetch oncesi damga yesil kaldi').not.toEqual([])
    // bayrak ile kapı arasına await giren yeni kod (B5b)
    const arayaAwait = KOD.replace('  surenIstek = true\n', '  await Promise.resolve()\n  surenIstek = true\n')
    expect(ucSorunlari(arayaAwait), 'araya giren await yesil kaldi').not.toEqual([])
  })
})
