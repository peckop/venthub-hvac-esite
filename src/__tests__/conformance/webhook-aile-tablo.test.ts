// @vitest-environment node
import { existsSync,mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-WEBHOOK-AILE-1 · WEBHOOK AİLESİ TEK TABLO (ALT-182, OPS onaylı, ALT-180 öz-değerlendirme önerisi 3).
 *
 * NİÇİN VAR (17 Kasım 2026, ölçüldü): webhook imza/replay kapsamı hatası üç tur döndü (ALT-76, ALT-138, ALT-166/167) ve ALT-106
 * aynı kapsam için mükerrer açıldı. Mevcut kapılar uç adını ELLE listeler: `webhook-imza-kapsami.test.ts` (satır 44 `UCLAR`) ve
 * `webhook-hata-govdesi.test.ts` (satır 12 `FONKSIYONLAR`) yalnız shipping/returns uçlarını bilir; listede olmayan yeni uç sessizce
 * geçer. Tek dosya sistemi keşfi `webhook-duz-yol-istisna.test.ts`'tedir ve yalnız `x-webhook-secret` başlığını ölçer.
 * Bu test o boşluğu kapatır: uç keşfi dosya sisteminden, koşullar TEK tabloda.
 *
 * TABLO (her uç × 4 koşul):
 *   imza   HAM gövde üzerinde imza doğrulaması, sabit zamanlı karşılaştırma (ortak: `_shared/sabit_zaman.ts` ya da `src/lib/webhook/imza.ts`)
 *   zaman  zaman damgası + pencere (replay)
 *   olay   olay kimliği tekilleştirme (kalıcı)
 *   govde  hata (500/genel) gövdesinde ham hata mesajı YOK (tüm uçlara evrensel uygulanır, tabloda satırı yoktur)
 * Her hücre ya `var` (kaynakta okunan kanıt desenleri) ya `muaf` (yazılı gerekçe ≥ 40 karakter + kart numarası). Muaf listesi
 * yalnız KÜÇÜLÜR (`MUAF_TAVAN`): yeni muafiyet görünür bir diff'tir.
 *
 * KEŞİF: `supabase/functions/<uç>/index.ts` ve `src/app/api/**\/route.ts`; bir dosya uç sayılır eğer YORUMSUZ kaynağı imza sinyali
 * taşıyorsa (`x-signature`, `x-event-id`, `x-webhook-signature`, `x-webhook-secret`, `webhookImzaGecerli`, `hmacImzaGecerli`) YA DA yolu
 * `webhook`/`callback` içeriyorsa. Tabloda olmayan keşfedilen uç KIRMIZI; tabloda olup keşfedilmeyen satır KIRMIZI (bayat).
 * SINIR: sinyalsiz ve adında webhook/callback geçmeyen bir uç görünmez; bu kapı "uç sahipsiz değil" sınıfını ölçer, imzanın
 * doğruluğunu uçların kendi davranış testleri (INV-WEBHOOK-IMZA-1/2) ölçer. Kanıt desenleri VARLIK kanıtıdır, davranış değil.
 *
 * SABOTAJ: karar fonksiyonu (`ihlaller`) saftır; yeni uç, sökülmüş imza/zaman/olay kanıtı, sızan hata gövdesi, kartsız/gerekçesiz
 * muaf, bayat satır, boş evren ve geçici ağaçta keşif aynı dosyada kırmızı verdirilir.
 */

const KOK = path.resolve(__dirname, '../../..')
const EDGE_DIZINI = 'supabase/functions'
const NEXT_DIZINI = 'src/app/api'

const IMZA_SINYALI = /x-signature|x-event-id|x-webhook-signature|x-webhook-secret|webhookImzaGecerli|hmacImzaGecerli/i
const AD_SINYALI = /webhook|callback/i

interface Kanit {
  /** Kanıtın okunduğu dosya (göreli yol); verilmezse ucun kendi dosyası. */
  dosya?: string
  desen: RegExp
}
type Hucre = { durum: 'var'; kanit: Kanit[] } | { durum: 'muaf'; gerekce: string; kart: string }
interface Uc {
  dosya: string
  imza: Hucre
  zaman: Hucre
  olay: Hucre
}

const HAM_GOVDE_EDGE: Kanit = { desen: /await\s+req\.text\(\)/ }
const IMZA_EDGE: Kanit = { desen: /webhookImzaGecerli\s*\(/ }
const ZAMAN_BASLIK_EDGE: Kanit = { desen: /get\(\s*['"]x-timestamp['"]/ }
const ZAMAN_PENCERE_EDGE: Kanit = { desen: /Math\.abs\(Date\.now\(\)\s*-\s*t\)\s*>\s*SKEW_MS/ }

const edgeImzali = (dosya: string, olay: Hucre): Uc => ({
  dosya,
  imza: { durum: 'var', kanit: [HAM_GOVDE_EDGE, IMZA_EDGE] },
  zaman: { durum: 'var', kanit: [ZAMAN_BASLIK_EDGE, ZAMAN_PENCERE_EDGE] },
  olay,
})

/**
 * İLAN EDİLMİŞ TABLO. Satır eklemek/muafiyet yazmak bilinçli ve görünür bir diff'tir.
 * order-paid ve quote: düz secret yolu (x-webhook-secret) ayrı bir kapalı istisnadır (INV-WEBHOOK-DUZ-YOL-1, D2'de silinir);
 * bu tablodaki `imza`/`zaman` satırları İMZALI yolun varlığını ölçer.
 */
const TABLO: readonly Uc[] = [
  edgeImzali('supabase/functions/shipping-webhook/index.ts', { durum: 'var', kanit: [{ desen: /shipping_webhook_events/ }] }),
  edgeImzali('supabase/functions/returns-webhook/index.ts', { durum: 'var', kanit: [{ desen: /returns_webhook_events/ }] }),
  edgeImzali('supabase/functions/order-paid-webhook/index.ts', {
    durum: 'muaf',
    gerekce:
      'Olay kimliği tablosu yok; tekilleştirme sipariş satırındaki paid_email_sent_at damgası ve uq_order_email_events_sent_once kısıtıyla yapılır (ikinci `sent` satırı reddedilir). Olay tablosu migration ister (EDGE alanı + Recep onayı).',
    kart: 'OPS-293 D6',
  }),
  edgeImzali('supabase/functions/quote-notification-webhook/index.ts', {
    durum: 'muaf',
    gerekce:
      'Olay kimliği tablosu yok; tekilleştirme request_email_sent_at damgası ve quote_email_events kaydıyla yapılır. Ayrı olay tablosu migration ister (EDGE alanı + Recep onayı).',
    kart: 'OPS-293 D6',
  }),
  {
    dosya: 'supabase/functions/iyzico-callback/index.ts',
    imza: {
      durum: 'muaf',
      gerekce:
        'Sağlayıcı callback\'i form POST olarak gelir ve imza başlığı taşımaz; kimlik sunucudan sunucuya checkoutForm.retrieve ile token doğrulanarak ve eşleşme kapısıyla kurulur. HMAC uygulanamaz, gövdeye güvenilmez.',
      kart: 'ALT-182',
    },
    zaman: {
      durum: 'muaf',
      gerekce:
        'Zaman damgası başlığı yok. Her çağrı ödeme durumunu sağlayıcıdan yeniden sorgular, gövdedeki alanlara güvenilmez; tekrar gönderim yeni bir etki üretmez (durum tabanlı karar).',
      kart: 'ALT-182',
    },
    olay: {
      durum: 'muaf',
      gerekce:
        'Olay kimliği tablosu yok; ikinci bildirim ödeme durumu kararıyla ("ayni odemenin tekrar bildirimi; yazilmadi") elenir. Para hareketi yazan kod değişmez (kural 11), bu kart yalnız ölçüm ve kayıt.',
      kart: 'ALT-182',
    },
  },
  {
    dosya: 'src/app/api/webhook/supabase/route.ts',
    imza: {
      durum: 'var',
      kanit: [
        { desen: /await\s+request\.text\(\)/ },
        { desen: /imzaDogrula\s*\(/ },
        { dosya: 'src/lib/webhook/imza.ts', desen: /timingSafeEqual/ },
      ],
    },
    zaman: {
      durum: 'var',
      kanit: [{ desen: /imzaDogrula\s*\(\s*\{[^}]*zamanSn[^}]*simdiMs/ }, { dosya: 'src/lib/webhook/imza.ts', desen: /\d+\s*\*\s*60/ }],
    },
    olay: { durum: 'var', kanit: [{ desen: /olayTuket\s*\(/ }, { dosya: 'src/lib/webhook/olayTekil.ts', desen: /webhook_olay_tuket/ }] },
  },
]
/** Muaf hücre sayısı yalnız küçülebilir: yeni muafiyet bu sayıyı yükseltmeyi gerektirir (görünür diff). */
const MUAF_TAVAN = 5

const ORTAK_DOSYA = 'supabase/functions/_shared/sabit_zaman.ts'
const ORTAK_KANIT: Array<[string, RegExp]> = [
  ['sabit zamanlı karşılaştırma tanımı', /export function timingSafeEquals\s*\(/],
  ['imza karşılaştırması timingSafeEquals ile', /return timingSafeEquals\(\s*gelen\s*,\s*hesaplanan\s*\)/],
  ['imza metni zaman + olay kimliği + ham gövde', /webhookImzaMetni\(\s*zaman\s*,\s*olayKimligi\s*,\s*ham\s*\)/],
]

const KART = /^[A-Z]+-\d+( D\d+)?$/
const GEREKCE_ASGARI = 40

// ─────────────────────────────────────────────────────────────────────────────
// Saf kısım
// ─────────────────────────────────────────────────────────────────────────────

/** Satır ve blok yorumlarını atar: açıklama metni kanıt ya da sinyal sayılmasın. */
function yorumsuz(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/\r?\n/)
    .filter((s) => !/^\s*\/\//.test(s))
    .join('\n')
}

/** Bir yanıt çağrısının (json/jsonResponse/NextResponse.json) satırında `.message` geçen satırlar (INV-WEBHOOK-HATA-1 ile aynı dedektör). */
function mesajSizanSatirlar(kaynak: string): string[] {
  return kaynak
    .split(/\r?\n/)
    .filter((s) => /\b(json|jsonResponse)\s*\(/.test(s) && /\.message\b/.test(s))
    .map((s) => s.trim())
}

function yurut(dizin: string, bul: (yol: string) => boolean, kok: string): string[] {
  if (!existsSync(dizin)) return []
  const cikti: string[] = []
  for (const girdi of readdirSync(dizin, { withFileTypes: true })) {
    const tam = path.join(dizin, girdi.name)
    if (girdi.isDirectory()) {
      if (girdi.name === 'node_modules' || girdi.name === '__tests__') continue
      cikti.push(...yurut(tam, bul, kok))
    } else if (girdi.isFile()) {
      const goreli = path.relative(kok, tam).split(path.sep).join('/')
      if (bul(goreli)) cikti.push(goreli)
    }
  }
  return cikti
}

/** Dosya sisteminden webhook ucu keşfi (göreli yol, sıralı). */
function kesfet(kok: string): string[] {
  const edgeAdaylari = existsSync(path.join(kok, EDGE_DIZINI))
    ? readdirSync(path.join(kok, EDGE_DIZINI), { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
        .map((d) => `${EDGE_DIZINI}/${d.name}/index.ts`)
        .filter((g) => existsSync(path.join(kok, g)))
    : []
  const nextAdaylari = yurut(path.join(kok, NEXT_DIZINI), (g) => /\/route\.tsx?$/.test(g), kok)
  return [...edgeAdaylari, ...nextAdaylari]
    .filter((g) => AD_SINYALI.test(g) || IMZA_SINYALI.test(yorumsuz(readFileSync(path.join(kok, g), 'utf8'))))
    .sort()
}

function muafSayisi(tablo: readonly Uc[]): number {
  return tablo.flatMap((u) => [u.imza, u.zaman, u.olay]).filter((h) => h.durum === 'muaf').length
}

/** SAF KARAR: keşfedilen uçlar + tablo + kaynak okuyucu → ihlaller. */
function ihlaller(kesfedilen: readonly string[], tablo: readonly Uc[], oku: (dosya: string) => string): string[] {
  const out: string[] = []
  const tabloDosyalari = tablo.map((u) => u.dosya)
  for (const g of kesfedilen) {
    if (!tabloDosyalari.includes(g)) out.push(`${g}: webhook ucu keşfedildi ama TABLODA YOK (imza, zaman, olay için satır ekleyin ya da gerekçeli muaf yazın)`)
  }
  for (const g of tabloDosyalari) {
    if (!kesfedilen.includes(g)) out.push(`${g}: tabloda ama keşfedilmedi (bayat satır: uç silindi/taşındı ya da sinyali kalmadı)`)
  }
  for (const uc of tablo) {
    let kaynak: string
    try {
      kaynak = oku(uc.dosya)
    } catch {
      out.push(`${uc.dosya}: dosya okunamadı`)
      continue
    }
    const kod = yorumsuz(kaynak)
    for (const [ad, hucre] of [['imza', uc.imza], ['zaman', uc.zaman], ['olay', uc.olay]] as const) {
      if (hucre.durum === 'var') {
        for (const k of hucre.kanit) {
          let icerik = kod
          if (k.dosya) {
            try {
              icerik = yorumsuz(oku(k.dosya))
            } catch {
              out.push(`${uc.dosya} :: ${ad}: kanıt dosyası okunamadı (${k.dosya})`)
              continue
            }
          }
          if (!k.desen.test(icerik)) out.push(`${uc.dosya} :: ${ad}: kanıt YOK (${k.dosya ?? 'uç dosyası'}: ${k.desen})`)
        }
      } else {
        if (hucre.gerekce.trim().length < GEREKCE_ASGARI) out.push(`${uc.dosya} :: ${ad}: muaf gerekçesi ${GEREKCE_ASGARI} karakterden kısa`)
        if (!KART.test(hucre.kart)) out.push(`${uc.dosya} :: ${ad}: muaf kart numarası biçimsiz ("${hucre.kart}")`)
      }
    }
    for (const satir of mesajSizanSatirlar(kod)) out.push(`${uc.dosya} :: govde: yanıt çağrısında ham .message sızıyor: ${satir}`)
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// Gerçek depo
// ─────────────────────────────────────────────────────────────────────────────

const oku = (dosya: string): string => readFileSync(path.join(KOK, dosya), 'utf8')
const kesfedilen = kesfet(KOK)

describe('INV-WEBHOOK-AILE-1 · keşif ve tablo', () => {
  it('evren sağlığı: keşif boş değil ve tablo ile aynı kümede', () => {
    expect(kesfedilen.length).toBeGreaterThanOrEqual(6)
    expect(kesfedilen).toEqual(TABLO.map((u) => u.dosya).sort())
  })

  it('her uç dört koşulu sağlar: kanıt var ya da yazılı gerekçeli muaf; hata gövdesinde ham .message yok', () => {
    expect(ihlaller(kesfedilen, TABLO, oku)).toEqual([])
  })

  it('ortak imza yardımcısı (sabit zamanlı karşılaştırma, imza metni) yerinde', () => {
    const kod = yorumsuz(oku(ORTAK_DOSYA))
    for (const [ad, desen] of ORTAK_KANIT) expect(desen.test(kod), ad).toBe(true)
  })

  it('muaf hücre sayısı tavanı aşmaz ve tavanla eşit (onarılan muafiyet silinince tavan düşürülür)', () => {
    expect(muafSayisi(TABLO)).toBe(MUAF_TAVAN)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SABOTAJ
// ─────────────────────────────────────────────────────────────────────────────

describe('INV-WEBHOOK-AILE-1 · SABOTAJ (bozuk girdiyle kırmızı, kontrol koluyla yeşil)', () => {
  const degistir = (hedef: string, f: (k: string) => string) => (dosya: string) => (dosya === hedef ? f(oku(dosya)) : oku(dosya))
  const SHIPPING = 'supabase/functions/shipping-webhook/index.ts'
  const RETURNS = 'supabase/functions/returns-webhook/index.ts'
  const ROUTE = 'src/app/api/webhook/supabase/route.ts'

  it('kontrol kolu: bozulmamış depo temiz', () => {
    expect(ihlaller(kesfedilen, TABLO, oku)).toEqual([])
  })

  it('yeni webhook ucu eklenirse (tabloda yok) KIRMIZI', () => {
    const r = ihlaller([...kesfedilen, 'supabase/functions/yeni-bildirim-webhook/index.ts'], TABLO, oku)
    expect(r.some((s) => /yeni-bildirim-webhook.*TABLODA YOK/.test(s))).toBe(true)
  })

  it('uç silinirse/taşınırsa bayat satır KIRMIZI', () => {
    const r = ihlaller(kesfedilen.filter((g) => g !== RETURNS), TABLO, oku)
    expect(r.some((s) => /returns-webhook.*bayat satır/.test(s))).toBe(true)
  })

  it('imza doğrulaması sökülürse KIRMIZI', () => {
    const r = ihlaller(kesfedilen, TABLO, degistir(SHIPPING, (k) => k.replace(/webhookImzaGecerli\s*\(/g, 'imzaYokSay(')))
    expect(r.some((s) => /shipping-webhook.* :: imza: kanıt YOK/.test(s))).toBe(true)
  })

  it('ham gövde okuması kalkarsa KIRMIZI', () => {
    const r = ihlaller(kesfedilen, TABLO, degistir(RETURNS, (k) => k.replace(/await\s+req\.text\(\)/g, 'await req.json()')))
    expect(r.some((s) => /returns-webhook.* :: imza: kanıt YOK/.test(s))).toBe(true)
  })

  it('zaman penceresi kalkarsa KIRMIZI', () => {
    const r = ihlaller(kesfedilen, TABLO, degistir(SHIPPING, (k) => k.replace(/>\s*SKEW_MS/g, '> Infinity')))
    expect(r.some((s) => /shipping-webhook.* :: zaman: kanıt YOK/.test(s))).toBe(true)
  })

  it('olay tekilleştirme tablosu kalkarsa KIRMIZI', () => {
    const r = ihlaller(kesfedilen, TABLO, degistir(RETURNS, (k) => k.replace(/returns_webhook_events/g, 'baska_tablo')))
    expect(r.some((s) => /returns-webhook.* :: olay: kanıt YOK/.test(s))).toBe(true)
  })

  it('Next uç: olay tüketimi kalkarsa KIRMIZI', () => {
    const r = ihlaller(kesfedilen, TABLO, degistir(ROUTE, (k) => k.replace(/olayTuket\s*\(/g, 'olayYoksay(')))
    expect(r.some((s) => /route\.ts :: olay: kanıt YOK/.test(s))).toBe(true)
  })

  it('hata gövdesine ham mesaj sızarsa KIRMIZI (tüm uçlara evrensel)', () => {
    const sizdir = (k: string) => `${k}\nreturn json({ error: err.message }, { status: 500 })\n`
    for (const g of [SHIPPING, 'supabase/functions/order-paid-webhook/index.ts', 'supabase/functions/iyzico-callback/index.ts', ROUTE]) {
      const r = ihlaller(kesfedilen, TABLO, degistir(g, sizdir))
      expect(r.some((s) => s.startsWith(g) && /govde/.test(s)), g).toBe(true)
    }
  })

  it('muaf: kartsız, biçimsiz kartlı ya da kısa gerekçeli satır KIRMIZI', () => {
    const muafli = TABLO.find((u) => u.olay.durum === 'muaf')
    expect(muafli).toBeDefined()
    const bozuk = (olay: Hucre): Uc[] => TABLO.map((u) => (u === muafli ? { ...u, olay } : u))
    expect(ihlaller(kesfedilen, bozuk({ durum: 'muaf', gerekce: 'k'.repeat(60), kart: '' }), oku).some((s) => /kart numarası biçimsiz/.test(s))).toBe(true)
    expect(ihlaller(kesfedilen, bozuk({ durum: 'muaf', gerekce: 'kısa', kart: 'ALT-182' }), oku).some((s) => /gerekçesi.*kısa/.test(s))).toBe(true)
  })

  it('muaf sayısı tavanı: ek muafiyet tavanı aşar', () => {
    const fazla: Uc[] = TABLO.map((u, i) => (i === 0 ? { ...u, olay: { durum: 'muaf', gerekce: 'g'.repeat(60), kart: 'ALT-182' } } : u))
    expect(muafSayisi(fazla)).toBeGreaterThan(MUAF_TAVAN)
  })

  describe('keşif geçici ağaçta (dosya sistemi gerçekten taranıyor)', () => {
    const gecici: string[] = []
    afterAll(() => gecici.forEach((d) => rmSync(d, { recursive: true, force: true })))
    function agac(dosyalar: Record<string, string>): string {
      const kok = mkdtempSync(path.join(os.tmpdir(), 'webhook-aile-'))
      gecici.push(kok)
      for (const [yol, icerik] of Object.entries(dosyalar)) {
        const hedef = path.join(kok, yol)
        mkdirSync(path.dirname(hedef), { recursive: true })
        writeFileSync(hedef, icerik)
      }
      return kok
    }

    it('imza sinyali taşıyan adsız Edge ucu, adında webhook geçen uç ve Next route bulunur; yorumdaki anma ve sıradan uç bulunmaz', () => {
      const kok = agac({
        'supabase/functions/gizli-bildirim/index.ts': "const s = req.headers.get('x-signature')\n",
        'supabase/functions/odeme-webhook/index.ts': 'export {}\n',
        'supabase/functions/sadece-yorum/index.ts': '// x-signature yalnız yorumda\nexport {}\n',
        'supabase/functions/sıradan/index.ts': 'export {}\n',
        'supabase/functions/_shared/x.ts': "x-signature\n",
        'src/app/api/kargo/webhook/route.ts': 'export {}\n',
        'src/app/api/saglik/route.ts': 'export {}\n',
      })
      expect(kesfet(kok)).toEqual([
        'src/app/api/kargo/webhook/route.ts',
        'supabase/functions/gizli-bildirim/index.ts',
        'supabase/functions/odeme-webhook/index.ts',
      ])
    })

    it('boş ağaçta keşif boş (evren sağlığı testi bunu KIRMIZI yapar)', () => {
      expect(kesfet(agac({ 'README.md': 'x' }))).toEqual([])
    })
  })

  it('ortak yardımcıdan sabit zamanlı karşılaştırma sökülürse kanıt deseni KIRMIZI', () => {
    const sokuk = yorumsuz(oku(ORTAK_DOSYA)).replace(/return timingSafeEquals\(\s*gelen\s*,\s*hesaplanan\s*\)/, 'return gelen === hesaplanan')
    expect(ORTAK_KANIT.some(([, desen]) => !desen.test(sokuk))).toBe(true)
  })
})
