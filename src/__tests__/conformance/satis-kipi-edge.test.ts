import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SATIS-KIPI-EDGE-1 — sipariş yazan ya da ödeme oturumu açan HER edge yolu sunucu tarafı
 * satış kipi kapısından geçer, kapı doğru YERDE durur ve uçuştaki ödeme uçları kapısız kalır.
 *
 * NİÇİN VAR (REC-355 alt işi · 2026-09-29 · plan: docs/plans/rec355-satis-kipi-edge-kapisi-2026-09-29.md)
 *
 * Satış kipi yalnız tarayıcıda kontrol ediliyordu; oturumlu bir kullanıcı `iyzico-payment`'a
 * doğrudan POST atarak kapıyı atlayabilirdi. Kapı SAF fonksiyon (`_shared/satis_kipi.ts`) ve
 * davranışı `satis_kipi.test.ts`'te gerçek `Response` nesneleriyle sınanır. Bu dosya kapının
 * DİKİŞ YERİNİ korur: yeni bir sipariş yazan uç eklenip kapı unutulursa kırmızı yanar.
 *
 * EVREN, listeyle değil KAYNAKTAN türetilir: içinde `checkoutFormInitialize` geçen ya da
 * `venthub_orders`'a POST atan her `supabase/functions/<uç>/index.ts`. Bugünkü sayım (ölçüldü,
 * 2026-09-29): tek dosya, `iyzico-payment`. Evren boşalırsa (regex kırılırsa) test sessizce
 * geçmesin diye evrenin `iyzico-payment`'ı içerdiği ayrıca doğrulanır.
 *
 * Uçuştaki ödeme/iade uçları BİLEREK kapısızdır (plan §3): kapatmak parası çekilmiş müşteriyi
 * siparişsiz bırakır. Kapı "yeni ödeme oturumu sayacı"dır, koruma perdesi değil.
 */
const KOK = path.resolve(__dirname, '../../..')
const FONKSIYONLAR = path.join(KOK, 'supabase/functions')
const YARDIMCI = 'supabase/functions/_shared/satis_kipi.ts'

/** Kapısız KALMASI gereken uçlar (plan §3). */
const KAPISIZ_UCLAR = [
  'order-validate',
  'iyzico-callback',
  'order-paid-webhook',
  'iyzico-refund',
  'admin-iyzico-reconcile',
  'refund-order-mock',
  'quote-request-guest',
]

function ucKaynaklari(): Record<string, string> {
  const cikti: Record<string, string> = {}
  for (const ad of readdirSync(FONKSIYONLAR)) {
    if (ad.startsWith('_')) continue
    const dosya = path.join(FONKSIYONLAR, ad, 'index.ts')
    if (existsSync(dosya)) cikti[ad] = readFileSync(dosya, 'utf8').replace(/\r\n/g, '\n')
  }
  return cikti
}

/** Sipariş satırı yazan ya da ödeme oturumu açan uç mu? (kaynak taraması, liste değil) */
function siparisYazarMi(kaynak: string): boolean {
  if (kaynak.includes('checkoutFormInitialize')) return true
  return /rest\/v1\/venthub_orders[`'"]\s*,\s*\{[^}]{0,200}method:\s*'POST'/.test(kaynak)
}

function kapiBaglantisiniDenetle(kaynak: string): string[] {
  const ihlaller: string[] = []
  if (!/import\s*\{[^}]*\bsatisKipiKarari\b[^}]*\}\s*from\s*'\.\.\/_shared\/satis_kipi\.ts'/.test(kaynak)) {
    ihlaller.push('satisKipiKarari `_shared/satis_kipi.ts`ten içe aktarılmıyor')
  }
  const kapi = kaynak.indexOf('satisKipiKarari({')
  const dogrulama = kaynak.indexOf('/functions/v1/order-validate')
  const siparis = kaynak.indexOf('let orderResponse')
  const odeme = kaynak.indexOf('checkoutFormInitialize')
  if (kapi < 0) {
    ihlaller.push('satisKipiKarari çağrısı yok')
    return ihlaller
  }
  if (!(dogrulama < 0 || kapi < dogrulama)) ihlaller.push('kapı order-validate çağrısından SONRA')
  if (!(siparis < 0 || kapi < siparis)) ihlaller.push('kapı sipariş yazısından SONRA')
  if (!(odeme < 0 || kapi < odeme)) ihlaller.push('kapı ödeme oturumu açmadan SONRA')

  const blokSonu = kaynak.indexOf('});', kapi)
  const blok = kapi >= 0 && blokSonu > kapi ? kaynak.slice(kapi, blokSonu) : ''
  if (!/\buserId:\s*user_id\b/.test(blok)) ihlaller.push('kapıya userId doğrulanmış kimlikten (user_id) geçmiyor')
  if (/requestData/.test(blok)) ihlaller.push('kapı bloğu istek gövdesini (requestData) okuyor')
  if (!/\btenantId\b/.test(blok)) ihlaller.push('kapıya tenantId geçmiyor')
  if (!/if\s*\(\s*satisKapisi\.engel\s*\)\s*return\s+satisKapisi\.engel/.test(kaynak)) {
    ihlaller.push('kapı engel döndürünce yanıt aynen dönmüyor')
  }
  if (!/for\s*\(\s*const\s+alarm\s+of\s+satisKapisi\.alarmlar\s*\)/.test(kaynak)) {
    ihlaller.push('kapının alarmları yazılmıyor')
  }

  // Deneme izniyle geçen sipariş, sipariş satırından ÖNCE günlüğe yazılmalı.
  const kayit = kaynak.indexOf('denemeSiparisiKaydet({')
  if (kayit < 0) ihlaller.push('deneme siparişi günlüğe yazılmıyor')
  else {
    if (!(siparis < 0 || kayit < siparis)) ihlaller.push('deneme kaydı sipariş yazısından SONRA')
    if (!/satisDenemeIzni/.test(kaynak.slice(Math.max(0, kayit - 60), kayit))) {
      ihlaller.push('deneme kaydı satisDenemeIzni koşuluna bağlı değil')
    }
    if (!/orderId:\s*dbGeneratedId/.test(kaynak.slice(kayit, kayit + 400))) {
      ihlaller.push('deneme kaydı önceden üretilmiş sipariş kimliğini (dbGeneratedId) taşımıyor')
    }
  }
  return ihlaller
}

describe('INV-SATIS-KIPI-EDGE-1 — evren: sipariş yazan her uç kapıdan geçer', () => {
  const uclar = ucKaynaklari()
  const evren = Object.keys(uclar).filter((ad) => siparisYazarMi(uclar[ad]))

  it('evren kaynaktan türetildi ve iyzico-payment içeriyor (regex kırılırsa test boşa geçmesin)', () => {
    expect(evren).toContain('iyzico-payment')
  })

  it('evrendeki HER uç kapıya doğru bağlı', () => {
    const ihlaller = evren.flatMap((ad) => kapiBaglantisiniDenetle(uclar[ad]).map((i) => `${ad}: ${i}`))
    expect(ihlaller).toEqual([])
  })

  it('kapısız KALMASI gereken uçlar kapı çağırmıyor (uçuştaki ödeme/iade kesilmez)', () => {
    const fazla = KAPISIZ_UCLAR.filter((ad) => uclar[ad]?.includes('satisKipiKarari'))
    expect(fazla).toEqual([])
    const eksik = KAPISIZ_UCLAR.filter((ad) => !(ad in uclar))
    expect(eksik, 'listede olup depoda olmayan uç: liste bayat, güncelle').toEqual([])
  })

  it('yardımcı, kimliği istek gövdesinden okumaz', () => {
    const y = readFileSync(path.join(KOK, YARDIMCI), 'utf8')
    expect(y).not.toMatch(/req\.json|requestData|request\.body/)
  })

  it('deneme izni yalnız sandbox ortamına bağlı (kaynak koruması)', () => {
    const y = readFileSync(path.join(KOK, YARDIMCI), 'utf8')
    expect(y).toMatch(/var:\s*ortam\s*===\s*'sandbox'\s*&&\s*listede/)
  })
})

describe('INV-SATIS-KIPI-EDGE-1 — sabotaj: her bozulma yolu GERÇEKTEN yakalanıyor', () => {
  const kaynak = ucKaynaklari()['iyzico-payment']

  it('bugünkü iyzico-payment temiz (sabotajların referansı)', () => {
    expect(kapiBaglantisiniDenetle(kaynak)).toEqual([])
  })

  it('sabotaj 1: kapı order-validate bloğundan sonraya taşınırsa yakalanır', () => {
    const bas = kaynak.indexOf('const satisKapisi = await satisKipiKarari({')
    const son = kaynak.indexOf('const satisDenemeIzni')
    // Dilimleme dayandığı metin değişirse çöp üretmesin: bulunamazsa test KIRMIZI verir.
    expect(bas).toBeGreaterThan(-1)
    expect(son).toBeGreaterThan(bas)
    const parca = kaynak.slice(bas, kaynak.indexOf('\n', son) + 1)
    const kalan = kaynak.slice(0, bas) + kaynak.slice(bas + parca.length)
    const hedef = kalan.indexOf('let orderResponse')
    const bozuk = kalan.slice(0, hedef) + parca + kalan.slice(hedef)
    expect(kapiBaglantisiniDenetle(bozuk).join('|')).toContain('SONRA')
  })

  it('sabotaj 2: engel dönmezse (yanıt yutulursa) yakalanır', () => {
    const bozuk = kaynak.replace('if (satisKapisi.engel) return satisKapisi.engel;', '')
    expect(bozuk).not.toBe(kaynak)
    expect(kapiBaglantisiniDenetle(bozuk).join('|')).toContain('yanıt aynen dönmüyor')
  })

  it('sabotaj 3: userId istek gövdesinden gelirse yakalanır', () => {
    const bozuk = kaynak.replace('userId: user_id,', 'userId: requestData?.user_id,')
    expect(bozuk).not.toBe(kaynak)
    const ihlal = kapiBaglantisiniDenetle(bozuk).join('|')
    expect(ihlal).toContain('doğrulanmış kimlikten')
    expect(ihlal).toContain('requestData')
  })

  it('sabotaj 4: tenantId kapıya geçmezse yakalanır', () => {
    const bozuk = kaynak.replace(/(satisKipiKarari\(\{[^}]*?)\n\s*tenantId,/, '$1')
    expect(bozuk).not.toBe(kaynak)
    expect(kapiBaglantisiniDenetle(bozuk).join('|')).toContain('tenantId geçmiyor')
  })

  it('sabotaj 5: deneme kaydı sipariş yazısından sonraya kayarsa yakalanır', () => {
    const bas = kaynak.indexOf('if (satisDenemeIzni) {')
    const son = kaynak.indexOf('// Try creating order')
    expect(bas).toBeGreaterThan(-1)
    expect(son).toBeGreaterThan(bas)
    const parca = kaynak.slice(bas, son)
    const kalan = kaynak.slice(0, bas) + kaynak.slice(son)
    const hedef = kalan.indexOf('const dbOrderId')
    const bozuk = kalan.slice(0, hedef) + parca + kalan.slice(hedef)
    expect(kapiBaglantisiniDenetle(bozuk).join('|')).toContain('deneme kaydı sipariş yazısından SONRA')
  })

  it('sabotaj 6: kapı hiç çağrılmazsa yakalanır', () => {
    const bozuk = kaynak.replace('satisKipiKarari({', 'baskaBirSey({')
    expect(kapiBaglantisiniDenetle(bozuk).join('|')).toContain('çağrısı yok')
  })
})
