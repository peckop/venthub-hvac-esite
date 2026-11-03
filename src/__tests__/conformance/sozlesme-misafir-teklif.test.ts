import fs from 'node:fs'
import path from 'node:path'

import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import { createGuestQuoteRequest, type QuoteSource } from '@/lib/services/quoteService'
import {
  anahtarFarki,
  MISAFIR_TEKLIF_GOVDE_ALANLARI,
  MISAFIR_TEKLIF_ILETISIM_ALANLARI,
  MISAFIR_TEKLIF_KALEM_ALANLARI,
  MISAFIR_TEKLIF_YOK_SAYILAN_KALEM_ALANLARI,
  TEKLIF_KAYNAKLARI,
} from '@/lib/sozlesme/edgeSozlesmeleri'
import type { Database } from '@/types/database.types'

/**
 * INV-SOZLESME-TEKLIF-1 · misafir teklif sözleşmesi (ALT-126, OPS-180 §7 madde 3).
 *
 * İstemci ayağı: `quoteService.createGuestQuoteRequest` (src/lib, vitrinden bağımsız) sahte bir
 * client ile çağrılır, `functions.invoke` gövdesi yakalanır. Edge ayağı: `quote-request-guest`
 * kaynağı metin olarak okunur (Deno kodu koşturulmaz). İkisi de ortak şemaya (src/lib/sozlesme) bağlanır.
 * Vitrin (src/views, src/components) import EDİLMEZ.
 */

const KOK = path.resolve(__dirname, '../../..')
const EDGE = fs.readFileSync(path.join(KOK, 'supabase/functions/quote-request-guest/index.ts'), 'utf8')

async function istemciGovdesi(): Promise<{ ad: string; govde: Record<string, unknown> }> {
  let yakalanan: { ad: string; govde: Record<string, unknown> } | null = null
  const sahte = {
    functions: {
      invoke: async (ad: string, secenek: { body: Record<string, unknown> }) => {
        yakalanan = { ad, govde: secenek.body }
        return { data: { ok: true, quoteId: 'q-1' }, error: null }
      },
    },
  } as unknown as SupabaseClient<Database>
  const sonuc = await createGuestQuoteRequest(sahte, {
    contact: { name: 'Ayşe', email: 'ayse@example.com', phone: '+905000000000' },
    source: 'cart',
    items: [{ productId: '00000000-0000-4000-8000-000000000001', productName: 'Ürün', qty: 2, note: 'not' }],
    kvkkOnay: true,
  })
  expect(sonuc).toEqual({ quoteId: 'q-1' })
  if (!yakalanan) throw new Error('functions.invoke çağrılmadı')
  return yakalanan
}

/** `type AD = { ... }` gövdesinin üst düzey alanları (iç içe `{}` ve yorumlar atılır). */
function tipAlanlari(kaynak: string, ad: string): string[] {
  const bas = kaynak.indexOf(`type ${ad} = {`)
  if (bas < 0) throw new Error(`type ${ad} bulunamadı`)
  // Dengeli parantez taraması: tek satırlık ve çok satırlık tanımı aynı yoldan okur (tembel regex
  // tek satırlık tanımda bir SONRAKİ tipin gövdesine taşıyordu — ilk yazışta ölçüldü).
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
  for (let i = 0; i < 5 && /\{[^{}]*\}/.test(govde); i++) govde = govde.replace(/\{[^{}]*\}/g, '')
  return [...govde.matchAll(/(\w+)\??\s*:/g)].map((x) => x[1])
}

const okunan = (kaynak: string, degisken: string) =>
  [...new Set([...kaynak.matchAll(new RegExp(`\\b${degisken}\\??\\.(\\w+)`, 'g'))].map((m) => m[1]))]

function edgeKaynaklari(kaynak: string): string[] {
  const m = kaynak.match(/const GECERLI_KAYNAKLAR = \[([^\]]*)\]/)
  if (!m) throw new Error('GECERLI_KAYNAKLAR bulunamadı')
  return [...m[1].matchAll(/'(\w+)'/g)].map((x) => x[1])
}

function edgeFarklari(kaynak: string) {
  const kalemOkunan = okunan(kaynak, 'ham')
  return {
    govdeTipi: anahtarFarki(tipAlanlari(kaynak, 'GelenGovde'), MISAFIR_TEKLIF_GOVDE_ALANLARI),
    kalemTipi: anahtarFarki(tipAlanlari(kaynak, 'GelenKalem'), MISAFIR_TEKLIF_KALEM_ALANLARI),
    govdeOkunan: anahtarFarki(okunan(kaynak, 'govde'), MISAFIR_TEKLIF_GOVDE_ALANLARI),
    iletisimOkunan: anahtarFarki(okunan(kaynak, 'govde\\.contact'), MISAFIR_TEKLIF_ILETISIM_ALANLARI),
    kalemOkunan: anahtarFarki(
      kalemOkunan,
      MISAFIR_TEKLIF_KALEM_ALANLARI.filter((a) => !(MISAFIR_TEKLIF_YOK_SAYILAN_KALEM_ALANLARI as readonly string[]).includes(a)),
    ),
    kaynaklar: anahtarFarki(edgeKaynaklari(kaynak), TEKLIF_KAYNAKLARI),
  }
}

const TEMIZ = { eksik: [], fazla: [] }

describe('INV-SOZLESME-TEKLIF-1 · createGuestQuoteRequest ↔ quote-request-guest', () => {
  it('istemci quote-request-guest ucunu çağırır ve gövde alanları = şema (contact, source, items, kvkkOnay, website)', async () => {
    const { ad, govde } = await istemciGovdesi()
    expect(ad).toBe('quote-request-guest')
    expect(anahtarFarki(Object.keys(govde), MISAFIR_TEKLIF_GOVDE_ALANLARI)).toEqual(TEMIZ)
    expect(anahtarFarki(Object.keys(govde.contact as object), MISAFIR_TEKLIF_ILETISIM_ALANLARI)).toEqual(TEMIZ)
    expect(anahtarFarki(Object.keys((govde.items as object[])[0]), MISAFIR_TEKLIF_KALEM_ALANLARI)).toEqual(TEMIZ)
    // Honeypot gönderilmezse boş dize gider (Edge yalnız DOLU dizeyi bot sayar); KVKK beyanı aynen taşınır.
    expect(govde.website).toBe('')
    expect(govde.kvkkOnay).toBe(true)
  })

  it('Edge gövde ve kalem tipleri, okuduğu alanlar ve kabul ettiği kaynaklar = şema', () => {
    expect(edgeFarklari(EDGE)).toEqual({
      govdeTipi: TEMIZ,
      kalemTipi: TEMIZ,
      govdeOkunan: TEMIZ,
      iletisimOkunan: TEMIZ,
      kalemOkunan: TEMIZ,
      kaynaklar: TEMIZ,
    })
  })

  it('productName Edge\'de OKUNMAZ (ad veritabanından çözülür; güvenlik bulgusu 1)', () => {
    expect(okunan(EDGE, 'ham')).not.toContain('productName')
  })

  it('KVKK beyanı Edge\'de katı eşitlikle (=== true) aranır: "true" dizesi ya da 1 geçmez', () => {
    expect(EDGE).toMatch(/govde\.kvkkOnay !== true/)
  })

  it('istemci kaynak tipi şemadaki kaynak listesiyle aynı (derleme anı bağı)', () => {
    const tumu: QuoteSource[] = [...TEKLIF_KAYNAKLARI]
    expect(tumu).toEqual(['pdp', 'cart', 'project'])
  })
})

describe('INV-SOZLESME-TEKLIF-1 · sabotaj: bağ kopunca ölçüt KIRMIZI', () => {
  const boz = (eski: string | RegExp, yeni: string) => {
    const b = EDGE.replace(eski, yeni)
    if (b === EDGE) throw new Error(`sabotaj hedefi bulunamadı: ${String(eski)}`)
    return b
  }

  it('Edge kvkkOnay yerine başka adla okursa gövde farkı görünür', () => {
    const f = edgeFarklari(boz('if (govde.kvkkOnay !== true)', 'if (govde.kvkk !== true)'))
    expect(f.govdeOkunan.fazla).toEqual(['kvkk'])
  })

  it('Edge productName okumaya başlarsa (istemci adına güven) kalem farkı görünür', () => {
    const f = edgeFarklari(boz('const productId = metin(ham?.productId, 64)', 'const productId = metin(ham?.productId, 64); const _ad = ham?.productName'))
    expect(f.kalemOkunan.fazla).toEqual(['productName'])
  })

  it('Edge kaynak listesi istemciden ayrışırsa görünür', () => {
    const f = edgeFarklari(boz("const GECERLI_KAYNAKLAR = ['pdp', 'cart', 'project']", "const GECERLI_KAYNAKLAR = ['pdp', 'cart']"))
    expect(f.kaynaklar.eksik).toEqual(['project'])
  })

  it('istemci gövdesinden website düşerse görünür', async () => {
    const { govde } = await istemciGovdesi()
    const { website: _d, ...eksik } = govde
    expect(anahtarFarki(Object.keys(eksik), MISAFIR_TEKLIF_GOVDE_ALANLARI).eksik).toEqual(['website'])
  })
})
