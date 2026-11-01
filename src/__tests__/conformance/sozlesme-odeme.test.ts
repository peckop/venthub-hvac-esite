import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  anahtarFarki,
  ODEME_ADRES_ALANLARI,
  ODEME_ISTEGI_ALANLARI,
  ODEME_ISTEGI_ESKI_ADLAR,
  ODEME_KALEM_ALANLARI,
  ODEME_MUSTERI_ALANLARI,
  ODEME_SONUC_DURUMLARI,
} from '@/lib/sozlesme/edgeSozlesmeleri'

/**
 * INV-SOZLESME-ODEME-1 · ödeme sözleşmesi, Edge ayağı (ALT-126, OPS-180 §7 madde 2).
 *
 * Vitrinden bağımsızdır: src/views ve src/components import ETMEZ. İstemci ayağı (buildPaymentRequest
 * çıktısı = aynı liste) vitrinin yanında durur: src/views/checkout/__tests__/buildPaymentRequest.sozlesme.test.ts.
 * Vitrin yeniden yazılınca yalnız o dosya taşınır; bu dosya ve ortak şema (src/lib/sozlesme) kalır.
 *
 * Ölçülenler (Edge kaynağı metin olarak okunur; Deno kodu koşturulmaz):
 *   · iyzico-payment `IyzicoPaymentRequestData` tipi ortak şemanın tüm alanlarını tanır.
 *   · iyzico-payment gövdeden (`requestData?.X`) yalnız şemadaki ya da adı konmuş eski alanları okur.
 *   · iyzico-callback'in ürettiği her sonuç durumu (JSON ve yönlendirme) şemadadır, şemadaki her durum üretilir.
 *   · Callback'i okuyan order-housekeeping yalnız şemadaki durumlarla karşılaştırır.
 * Sabotaj kolları aynı ölçütü bozulmuş kaynakla koşar ve KIRMIZI görür.
 */

const KOK = path.resolve(__dirname, '../../..')
const oku = (yol: string) => fs.readFileSync(path.join(KOK, yol), 'utf8')

const ODEME = oku('supabase/functions/iyzico-payment/index.ts')
const CALLBACK = oku('supabase/functions/iyzico-callback/index.ts')
const HOUSEKEEPING = oku('supabase/functions/order-housekeeping/index.ts')

/** `interface AD { ... }` gövdesindeki ÜST DÜZEY alan adları (iç içe `{}` ve yorumlar atılır). */
function interfaceAlanlari(kaynak: string, ad: string): Set<string> {
  const bas = kaynak.indexOf(`interface ${ad}`)
  if (bas < 0) throw new Error(`interface ${ad} bulunamadı`)
  const ac = kaynak.indexOf('{', bas)
  let derinlik = 0
  let son = -1
  for (let i = ac; i < kaynak.length; i++) {
    if (kaynak[i] === '{') derinlik++
    else if (kaynak[i] === '}' && --derinlik === 0) {
      son = i
      break
    }
  }
  let govde = kaynak.slice(ac + 1, son).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/.*$/gm, '')
  for (let i = 0; i < 10 && /\{[^{}]*\}/.test(govde); i++) govde = govde.replace(/\{[^{}]*\}/g, '')
  return new Set([...govde.matchAll(/(\w+)\??\s*:/g)].map((m) => m[1]))
}

function okunanAlanlar(kaynak: string, degisken: string): Set<string> {
  return new Set([...kaynak.matchAll(new RegExp(`\\b${degisken}\\??\\.(\\w+)`, 'g'))].map((m) => m[1]))
}

/** Callback'in ürettiği durum dizeleri: JSON gövdesi + `?status=` yönlendirmesi. */
function callbackDurumlari(kaynak: string): Set<string> {
  const durumlar = new Set<string>()
  const literaller = (parca: string) => [...parca.matchAll(/["'](\w+)["']/g)].map((m) => m[1])
  for (const m of kaynak.matchAll(/searchParams\.set\(\s*'status',([\s\S]*?)\);/g)) literaller(m[1]).forEach((d) => durumlar.add(d))
  const govde = kaynak.match(/const responseBody = \{\s*status:([\s\S]*?),\s*iyzico:/)
  if (!govde) throw new Error('callback responseBody.status bulunamadı (kaynak değişmiş: ölçütü güncelle)')
  literaller(govde[1]).forEach((d) => durumlar.add(d))
  for (const m of kaynak.matchAll(/JSON\.stringify\(\{\s*status:\s*'(\w+)'/g)) durumlar.add(m[1])
  return durumlar
}

function housekeepingKarsilastirmalari(kaynak: string): Set<string> {
  return new Set([...kaynak.matchAll(/body\?\.status\s*===\s*'(\w+)'/g)].map((m) => m[1]))
}

// ── ölçütler (sabotaj kolları aynı fonksiyonları bozuk kaynakla çağırır) ──────────────────────

function edgeTipiFarki(kaynak: string) {
  const alanlar = interfaceAlanlari(kaynak, 'IyzicoPaymentRequestData')
  return anahtarFarki(alanlar, [...ODEME_ISTEGI_ALANLARI, ...ODEME_ISTEGI_ESKI_ADLAR])
}

function edgeOkumaFazlasi(kaynak: string): string[] {
  const izinli = new Set<string>([...ODEME_ISTEGI_ALANLARI, ...ODEME_ISTEGI_ESKI_ADLAR])
  return [...okunanAlanlar(kaynak, 'requestData')].filter((a) => !izinli.has(a)).sort()
}

describe('INV-SOZLESME-ODEME-1 · iyzico-payment gövdesi ortak şemaya bağlı', () => {
  it('Edge istek tipi şemanın alanlarını ve adı konmuş eski adları birebir taşır', () => {
    expect(edgeTipiFarki(ODEME)).toEqual({ eksik: [], fazla: [] })
  })

  it('Edge gövdeden yalnız şemadaki (ya da adı konmuş eski) alanları okur; şemadaki her alanı okur', () => {
    expect(edgeOkumaFazlasi(ODEME)).toEqual([])
    const okunan = okunanAlanlar(ODEME, 'requestData')
    expect(ODEME_ISTEGI_ALANLARI.filter((a) => !okunan.has(a))).toEqual([])
  })

  it('Edge müşteri ve adres alt alanlarından yalnız şemadakileri okur', () => {
    // `for (const ci of cartItems ...)` döngüsü `ci` adını SEPET KALEMİ için gölgeler (kalem alanları ayrı kolda ölçülür).
    const golgesiz = ODEME.replace(/for \(const ci of cartItems[\s\S]*?\n\s*\}\r?\n\s*\}/, '')
    expect(golgesiz, 'gölgeleyen döngü bulunamadı (kaynak değişti: ölçütü güncelle)').not.toBe(ODEME)
    const musteri = [...okunanAlanlar(golgesiz, 'ci')].filter((a) => !(ODEME_MUSTERI_ALANLARI as readonly string[]).includes(a))
    expect(musteri).toEqual([])
    const adres = [...okunanAlanlar(ODEME, 'shipAddr'), ...okunanAlanlar(ODEME, 'billAddr')].filter(
      (a) => !(ODEME_ADRES_ALANLARI as readonly string[]).includes(a),
    )
    expect(adres).toEqual([])
  })

  it('Edge sepet kalemi tipindeki alanlar şemanın alt kümesidir', () => {
    const m = ODEME.match(/cartItems\?:\s*Array<\{([^}]*)\}>/)
    expect(m, 'cartItems tipi bulunamadı').not.toBeNull()
    const alanlar = [...m![1].matchAll(/(\w+)\??\s*:/g)].map((x) => x[1])
    expect(alanlar.filter((a) => !(ODEME_KALEM_ALANLARI as readonly string[]).includes(a))).toEqual([])
  })
})

describe('INV-SOZLESME-ODEME-2 · iyzico-callback sonuç durumları ortak tipe bağlı', () => {
  it('callback\'in ürettiği durumlar = şema (success, needs_review, failure, pending)', () => {
    expect(anahtarFarki(callbackDurumlari(CALLBACK), ODEME_SONUC_DURUMLARI)).toEqual({ eksik: [], fazla: [] })
  })

  it('order-housekeeping callback cevabını yalnız şemadaki durumlarla karşılaştırır ve needs_review\'u tanır', () => {
    const k = housekeepingKarsilastirmalari(HOUSEKEEPING)
    expect([...k].filter((d) => !(ODEME_SONUC_DURUMLARI as readonly string[]).includes(d))).toEqual([])
    expect(k.has('success')).toBe(true)
    expect(k.has('needs_review')).toBe(true)
  })
})

describe('INV-SOZLESME-ODEME · sabotaj: bağ kopunca ölçüt KIRMIZI', () => {
  const boz = (kaynak: string, eski: string | RegExp, yeni: string) => {
    const b = kaynak.replace(eski, yeni)
    if (b === kaynak) throw new Error(`sabotaj hedefi bulunamadı: ${String(eski)}`)
    return b
  }

  it('Edge tipinden couponCode silinirse eksik görünür', () => {
    expect(edgeTipiFarki(boz(ODEME, /couponCode\?: string \| null;/, '')).eksik).toEqual(['couponCode'])
  })

  it('Edge şemada olmayan bir alanı okursa fazla görünür', () => {
    const bozuk = boz(ODEME, 'const shippingMethod = requestData?.shippingMethod', 'const shippingMethod = requestData?.teslimatKipi')
    expect(edgeOkumaFazlasi(bozuk)).toEqual(['teslimatKipi'])
  })

  it('callback yeni bir durum üretirse (ör. error) şemadan sapma görünür', () => {
    const bozuk = boz(CALLBACK, "target.searchParams.set('status', 'failure');", "target.searchParams.set('status', 'error');")
    expect(anahtarFarki(callbackDurumlari(bozuk), ODEME_SONUC_DURUMLARI).fazla).toEqual(['error'])
  })

  it('callback needs_review üretmeyi bırakırsa eksik görünür', () => {
    const bozuk = CALLBACK.replaceAll('"needs_review"', '"failure"').replaceAll("'needs_review'", "'failure'")
    expect(bozuk).not.toBe(CALLBACK)
    expect(anahtarFarki(callbackDurumlari(bozuk), ODEME_SONUC_DURUMLARI).eksik).toEqual(['needs_review'])
  })

  it('housekeeping şema dışı bir durumla karşılaştırırsa yakalanır', () => {
    const bozuk = boz(HOUSEKEEPING, "body?.status === 'success'", "body?.status === 'paid'")
    const k = housekeepingKarsilastirmalari(bozuk)
    expect([...k].filter((d) => !(ODEME_SONUC_DURUMLARI as readonly string[]).includes(d))).toEqual(['paid'])
  })
})
