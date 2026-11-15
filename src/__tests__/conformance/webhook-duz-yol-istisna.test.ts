// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-WEBHOOK-DUZ-YOL-1 · düz secret yolu (`x-webhook-secret` == sır) ADLANDIRILMIŞ, TARİHLİ, KAPALI bir
 * istisnadır; küme yalnız küçülür (OPS-293 D1, 15 Kasım 2026).
 *
 * NİÇİN: `order-paid-webhook` ve `quote-notification-webhook` bugün iki yoldan kimlik kabul ediyor: imza
 * (`x-signature`, zaman + olay kimliği + gövde) ve düz paylaşılan sır. Üç gönderen SQL fonksiyonu
 * (notify_order_paid, notify_quote_request_created, _quote_published_enqueue) henüz imza yollamıyor; düz yol
 * silinirse ödeme ve teklif e-postaları durur. Düz yol zaman ve olay kimliğini imzalamadığı için sızan sır
 * sınırsız sahte bildirim üretir; bu yüzden yeni bir uca kopyalanamaz ve kendi yerinde sabit zamanlı
 * karşılaştırma + açık istisna yorumu taşır. Kapanış D2 migration paketindedir (üç SQL gönderici imzalanınca
 * düz yol silinir ve bu testin KÜME'si boşalır).
 *
 * Bu test düz yolu SİLMEZ ve gevşetmez; yalnız (a) yeni uç eklenmesini, (b) istisna işaretinin silinmesini,
 * (c) yerel `timingSafeEquals`/`hmacValid` kopyalarının geri gelmesini, (d) düz karşılaştırmanın `===`ye
 * düşmesini kırmızı yapar. Cetvel: docs/standards/edge-function-security-standard.md §3.5.
 */

const KOK = path.resolve(__dirname, '../../..')
const FONKSIYONLAR = path.join(KOK, 'supabase/functions')

/** Düz yolu tanıyan, adlandırılmış istisna kümesi. Yalnız küçülür; D2 sonrası boşalır. */
const ISTISNA_KUMESI = ['order-paid-webhook', 'quote-notification-webhook']
const ISTISNA_YORUMU = /\/\/ ISTISNA-OPS293-D1 \(15 Kasim 2026\):/
const DUZ_YOL_OKUMA = /headers\s*\.\s*get\s*\(\s*['"]x-webhook-secret['"]\s*\)/

function uclariKesfet(): string[] {
  return fs
    .readdirSync(FONKSIYONLAR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name)
    .filter((ad) => fs.existsSync(path.join(FONKSIYONLAR, ad, 'index.ts')))
    .sort()
}

function oku(ad: string): string {
  return fs.readFileSync(path.join(FONKSIYONLAR, ad, 'index.ts'), 'utf8')
}

/** Yorum satırlarını at: açıklama metni kodu "okuyan" sayılmasın. */
function yorumsuz(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((s) => !/^\s*\/\//.test(s))
    .join('\n')
}

function duzYoluOlanlar(uclar: string[]): string[] {
  return uclar.filter((ad) => DUZ_YOL_OKUMA.test(yorumsuz(oku(ad))))
}

/** Saf kural: kümeyi, ucu ve kaynağı verip ihlalleri döndürür (sabotaj kanıtı bunun üstünden de koşar). */
function ihlaller(uclar: string[], kaynakOku: (ad: string) => string): string[] {
  const out: string[] = []
  const duz = uclar.filter((ad) => DUZ_YOL_OKUMA.test(yorumsuz(kaynakOku(ad))))
  for (const ad of duz) {
    if (!ISTISNA_KUMESI.includes(ad)) out.push(`${ad}: düz secret yolu istisna kümesinde DEĞİL (yeni uç eklenemez)`)
  }
  for (const ad of ISTISNA_KUMESI) {
    const k = kaynakOku(ad)
    const kod = yorumsuz(k)
    if (!duz.includes(ad)) {
      out.push(`${ad}: istisna kümesinde ama düz yol YOK (bayat istisna: kümeden SİL)`)
      continue
    }
    if (!ISTISNA_YORUMU.test(k)) out.push(`${ad}: ISTISNA-OPS293-D1 yorumu yok`)
    if (/function\s+timingSafeEquals\b/.test(kod)) out.push(`${ad}: yerel timingSafeEquals tanımı geri gelmiş`)
    if (/function\s+hmacValid\b/.test(kod)) out.push(`${ad}: yerel hmacValid tanımı geri gelmiş`)
    if (!/from\s+['"]\.\.\/_shared\/sabit_zaman\.ts['"]/.test(kod)) out.push(`${ad}: ortak _shared/sabit_zaman.ts içe aktarılmıyor`)
    if (!/import\s*\{[^}]*\btimingSafeEquals\b[^}]*\}\s*from\s*['"]\.\.\/_shared\/sabit_zaman\.ts['"]/.test(kod)) {
      out.push(`${ad}: timingSafeEquals ortak dosyadan içe aktarılmıyor`)
    }
    if (!/timingSafeEquals\s*\(\s*token\s*,\s*secret\s*\)/.test(kod)) out.push(`${ad}: düz yol karşılaştırması timingSafeEquals(token, secret) değil`)
    if (/\btoken\s*[!=]==?\s*secret\b|\bsecret\s*[!=]==?\s*token\b/.test(kod)) out.push(`${ad}: düz yol karşılaştırması ===/!== ile`)
  }
  return out
}

describe('INV-WEBHOOK-DUZ-YOL-1 · düz secret yolu kapalı istisna kümesi', () => {
  const uclar = uclariKesfet()

  it('keşif boş değil (sahte-yeşil kilidi): fs ile uç dizinleri bulundu', () => {
    expect(uclar.length).toBeGreaterThan(10)
    expect(uclar).toContain('order-paid-webhook')
    expect(uclar).toContain('quote-notification-webhook')
  })

  it('x-webhook-secret başlığını okuyan uç kümesi TAM OLARAK istisna kümesi (yeni uç eklenemez, küme yalnız küçülür)', () => {
    expect(duzYoluOlanlar(uclar)).toEqual([...ISTISNA_KUMESI].sort())
  })

  it('istisna kümesindeki uçlar: işaret, ortak sabit zaman, yerel kopya yok, timingSafeEquals karşılaştırması', () => {
    expect(ihlaller(uclar, oku)).toEqual([])
  })

  describe('kural kendi kendini ölçüyor (bozuk girdiyle kırmızı)', () => {
    const iyi = (ad: string) => oku(ad)
    const degistir = (hedef: string, f: (k: string) => string) => (ad: string) => (ad === hedef ? f(oku(ad)) : iyi(ad))

    it('yerel timingSafeEquals geri eklenirse kırmızı', () => {
      const r = ihlaller(uclar, degistir('order-paid-webhook', (k) => `${k}\nfunction timingSafeEquals(a: string, b: string) { return a === b }\n`))
      expect(r.some((s) => /yerel timingSafeEquals/.test(s))).toBe(true)
    })

    it('yerel hmacValid geri eklenirse kırmızı', () => {
      const r = ihlaller(uclar, degistir('quote-notification-webhook', (k) => `${k}\nasync function hmacValid() { return true }\n`))
      expect(r.some((s) => /yerel hmacValid/.test(s))).toBe(true)
    })

    it('istisna yorumu silinirse kırmızı', () => {
      const r = ihlaller(uclar, degistir('order-paid-webhook', (k) => k.replace(/\/\/ ISTISNA-OPS293-D1[^\n]*\n/, '')))
      expect(r.some((s) => /ISTISNA-OPS293-D1 yorumu yok/.test(s))).toBe(true)
    })

    it('yeni bir uca x-webhook-secret eklenirse kırmızı', () => {
      const yeniUclar = [...uclar, 'yeni-bildirim-webhook']
      const oku2 = (ad: string) =>
        ad === 'yeni-bildirim-webhook' ? `const t = req.headers.get('x-webhook-secret') || ''\n` : oku(ad)
      const r = ihlaller(yeniUclar, oku2)
      expect(r.some((s) => /yeni-bildirim-webhook: düz secret yolu istisna kümesinde DEĞİL/.test(s))).toBe(true)
    })

    it('düz yol başka uca kopyalanıp istisnadan biri düz yolsuz kalırsa (bayat istisna) kırmızı', () => {
      const r = ihlaller(uclar, degistir('quote-notification-webhook', (k) => k.replace(/headers\s*\.\s*get\s*\(\s*'x-webhook-secret'\s*\)/, "headers.get('x-baska')")))
      expect(r.some((s) => /bayat istisna/.test(s))).toBe(true)
    })

    it('düz karşılaştırma === ye düşerse kırmızı', () => {
      const r = ihlaller(uclar, degistir('order-paid-webhook', (k) => k.replace('timingSafeEquals(token, secret)', '(token === secret)')))
      expect(r.some((s) => /timingSafeEquals\(token, secret\) değil|===\/!== ile/.test(s))).toBe(true)
    })
  })
})
