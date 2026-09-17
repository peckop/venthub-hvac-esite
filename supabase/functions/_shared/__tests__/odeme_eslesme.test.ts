import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { odemeSiparisleEslesiyorMu } from '../odeme_eslesme'

/**
 * INV-PAY-ESLESME-1 — VULN-001 kapısının kilidi (REC-355).
 *
 * ⭐BU TESTİN EN ÖNEMLİ ÖZELLİĞİ: SAHTE VERİ KULLANMIYOR.
 * Kapının geçirmesi gereken 13 vaka, prod'dan alınmış GERÇEK İyzico yanıtları
 * (`docs/archive/db-backup-pre-kademe2/venthub_orders.json` içindeki `payment_debug.raw`).
 * Sebebi bir ders: *"stub gerçeği taklit etmiyorsa test kördür."* İlk onarım tasarımım tam
 * bu yüzden çöktü — varsaydığım yanıt biçimi gerçek yanıtla uyuşmuyordu ve bunu ancak
 * gerçek veriyi okuyunca gördüm.
 *
 * İki yön birlikte ölçülür:
 *   · GEÇMESİ GEREKEN: 13 gerçek ödemenin 13'ü. Biri düşerse kapı geliri keser.
 *   · GEÇMEMESİ GEREKEN: saldırı biçimleri, gerçek verinin ÜZERİNDEN kurulur (kurbanın
 *     satırı + saldırganın yanıtı), uydurma alanlarla değil.
 */

type ArsivSatiri = {
  id: string
  conversation_id: string | null
  total_amount: number | string | null
  currency?: string | null
  payment_debug?: { raw?: Record<string, unknown> } | null
}

const ARSIV = resolve(
  process.cwd(),
  'docs/archive/db-backup-pre-kademe2/venthub_orders.json',
)

function gercekVakalar(): Array<{ satir: ArsivSatiri; raw: Record<string, unknown> }> {
  const ham = JSON.parse(readFileSync(ARSIV, 'utf8')) as ArsivSatiri[]
  const out: Array<{ satir: ArsivSatiri; raw: Record<string, unknown> }> = []
  for (const satir of ham) {
    const raw = satir.payment_debug?.raw
    if (raw && typeof raw === 'object') out.push({ satir, raw: raw as Record<string, unknown> })
  }
  return out
}

describe('INV-PAY-ESLESME-1 — evren: arşiv gerçekten 13 yanıt taşıyor', () => {
  it('arşiv dosyası VAR ve 13 gerçek yanıt içeriyor', () => {
    // ⭐Evren kolu: dosya taşınır ya da boşalırsa aşağıdaki 13 kol SESSİZCE 0 vakayla
    // geçerdi. "Vaka bulunamadı" bir başarı değildir.
    expect(gercekVakalar().length).toBe(13)
  })

  it('13 yanıtın 13ünde basketId VAR — çapanın ön koşulu', () => {
    const v = gercekVakalar()
    expect(v.filter((x) => typeof x.raw.basketId === 'string').length).toBe(13)
  })

  it('conversationId 11/13 — çapa olarak KULLANILAMAZ olduğunun kaydı', () => {
    // Bu kol bir davranış değil, bir ÖLÇÜM kilidi: ilk tasarımım conversationId'yi çapa
    // yapmıştı ve 2 koşumda alan hiç yok. Sayı değişirse tasarım gerekçesi de değişir.
    const v = gercekVakalar()
    expect(v.filter((x) => x.raw.conversationId != null).length).toBe(11)
  })

  it('basketId hiçbir vakada siparişin id si DEĞİL — biçim B nin niçin gerektiği', () => {
    const v = gercekVakalar()
    expect(v.filter((x) => x.raw.basketId === x.satir.id).length).toBe(0)
  })
})

describe('INV-PAY-ESLESME-1 — GEÇMESİ GEREKEN: 13 gerçek ödeme', () => {
  it('13 gerçek ödemenin 13ü de GEÇER (biri düşerse kapı geliri keser)', () => {
    const dusenler: string[] = []
    for (const { satir, raw } of gercekVakalar()) {
      const k = odemeSiparisleEslesiyorMu(raw, satir)
      if (!k.gecti) dusenler.push(`${satir.id}: ${k.sebep}`)
    }
    expect(dusenler, `gercek odeme REDDEDILDI:\n${dusenler.join('\n')}`).toEqual([])
  })

  it('13ünün hepsi EPOCH biçimiyle eşleşiyor (bugünkü canlı gerçek)', () => {
    const bicimler = gercekVakalar().map((x) => odemeSiparisleEslesiyorMu(x.raw, x.satir).bicim)
    expect(bicimler.filter((b) => b === 'epoch').length).toBe(13)
    expect(bicimler.filter((b) => b === 'id').length).toBe(0)
  })

  it('conversationId YOK olan iki koşum da GEÇER — reconcile yolu kapanmaz', () => {
    // ⚠BU KOL BİR GELİR KAYBI YOLUNU KİLİTLER: `order-housekeeping` callback'i yalnız
    // {orderId} ile çağırıyor, yani conversationId GÖNDERMİYOR. İlk tasarımım o yolda
    // yapısal olarak reddederdi ve 15 dakika sonra sipariş iptal edilirdi.
    const konvsuz = gercekVakalar().filter((x) => x.raw.conversationId == null)
    expect(konvsuz.length).toBe(2)
    for (const { satir, raw } of konvsuz) {
      expect(odemeSiparisleEslesiyorMu(raw, satir).gecti, `${satir.id} reddedildi`).toBe(true)
    }
  })
})

describe('INV-PAY-ESLESME-1 — GEÇMEMESİ GEREKEN: saldırı biçimleri', () => {
  /** Saldırı senaryosu: A nın ödemesi, B nin sipariş satırı. Gerçek iki vakadan kurulur. */
  function capraz(): { kurban: ArsivSatiri; saldirganRaw: Record<string, unknown> } {
    const v = gercekVakalar()
    return { kurban: v[0].satir, saldirganRaw: v[1].raw }
  }

  it('⛔ASIL SALDIRI: baska siparisin odemesi bu siparise YAZILAMAZ', () => {
    const { kurban, saldirganRaw } = capraz()
    const k = odemeSiparisleEslesiyorMu(saldirganRaw, kurban)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('kimlik_eslesmedi')
  })

  it('⛔TOTOLOJI KAPANDI: saldirgan kurbanin conversationId sini EKLESE de gecemez', () => {
    // İlk tasarımımı öldüren senaryo: saldırgan kurbanın conversation_id'sini de gönderir,
    // İyzico onu ECHO eder. Burada onu taklit ediyoruz — yanıta kurbanın conversationId'si
    // eklenmiş. Çapa `basketId` olduğu için kapı YİNE kapalı.
    const { kurban, saldirganRaw } = capraz()
    const yansimali = { ...saldirganRaw, conversationId: kurban.conversation_id }
    expect(odemeSiparisleEslesiyorMu(yansimali, kurban).gecti).toBe(false)
  })

  it('⛔basketId DUSURULEREK gecilemez (eksik alan = gecmedi, atla DEGIL)', () => {
    const { satir, raw } = gercekVakalar()[0]
    const eksik = { ...raw }
    delete eksik.basketId
    const k = odemeSiparisleEslesiyorMu(eksik, satir)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('basketId_yok')
  })

  it('⛔kimlik tutsa bile TUTAR tutmuyorsa gecmez', () => {
    const { satir, raw } = gercekVakalar()[0]
    const azTutar = { ...raw, price: 1, paidPrice: 1 }
    const k = odemeSiparisleEslesiyorMu(azTutar, satir)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('tutar_eslesmedi')
  })

  it('⛔paidPrice, price in ALTINDA olamaz', () => {
    const { satir, raw } = gercekVakalar()[0]
    const k = odemeSiparisleEslesiyorMu({ ...raw, paidPrice: Number(raw.price) - 1 }, satir)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('paidPrice_price_altinda')
  })

  it('✔paidPrice price in USTUNDE olabilir — TAKSIT reddedilmez', () => {
    // ⭐`iyzico-payment` kendi yorumunda "paidPrice >= price olabilir" diyor ve taksit
    // [1,2,3,6,9,12] ile acik. Vade farki musteriye yansiyan bir kurulumda bu kol,
    // gercek taksitli odemenin reddedilmedigini kilitler.
    const { satir, raw } = gercekVakalar()[0]
    expect(odemeSiparisleEslesiyorMu({ ...raw, paidPrice: Number(raw.price) + 250 }, satir).gecti)
      .toBe(true)
  })

  it('⛔satir YOKSA gecmez (satir bulunamadi = fail-closed)', () => {
    const { raw } = gercekVakalar()[0]
    expect(odemeSiparisleEslesiyorMu(raw, null).sebep).toBe('siparis_satiri_yok')
  })

  it('⛔odeme sonucu YOKSA gecmez', () => {
    const { satir } = gercekVakalar()[0]
    expect(odemeSiparisleEslesiyorMu(null, satir).sebep).toBe('odeme_sonucu_yok')
  })

  it('⛔para birimi TRY degilse gecmez', () => {
    const { satir, raw } = gercekVakalar()[0]
    const k = odemeSiparisleEslesiyorMu({ ...raw, currency: 'USD' }, satir)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('para_birimi_eslesmedi')
  })

  it('⛔uydurma epoch ile gecilemez (yakin ama ayni degil)', () => {
    const { satir, raw } = gercekVakalar()[0]
    const epoch = /^CONV-(\d+)$/.exec(String(satir.conversation_id))![1]
    const bir = { ...raw, basketId: `VH-${Number(epoch) + 1}-zzzzzz` }
    expect(odemeSiparisleEslesiyorMu(bir, satir).sebep).toBe('kimlik_eslesmedi')
  })
})

describe('INV-PAY-ESLESME-1 — BİÇİM A (yeni) kolu', () => {
  it('basketId siparisin id si ise dogrudan ESLESIR', () => {
    const { satir, raw } = gercekVakalar()[0]
    const k = odemeSiparisleEslesiyorMu({ ...raw, basketId: satir.id }, satir)
    expect(k.gecti).toBe(true)
    expect(k.bicim).toBe('id')
  })

  it('bicim A da conversation_id HIC OLMASA bile eslesir', () => {
    const { satir, raw } = gercekVakalar()[0]
    const k = odemeSiparisleEslesiyorMu(
      { ...raw, basketId: satir.id },
      { ...satir, conversation_id: null },
    )
    expect(k.gecti).toBe(true)
    expect(k.bicim).toBe('id')
  })

  it('bicim A da baska siparisin id si GECMEZ', () => {
    const v = gercekVakalar()
    const k = odemeSiparisleEslesiyorMu({ ...v[0].raw, basketId: v[1].satir.id }, v[0].satir)
    expect(k.gecti).toBe(false)
  })

  it('sebep metni DEGER tasimaz — denetim izi sir tasiyici olmaz', () => {
    const { kurban, saldirganRaw } = (() => {
      const v = gercekVakalar()
      return { kurban: v[0].satir, saldirganRaw: v[1].raw }
    })()
    const sebep = odemeSiparisleEslesiyorMu(saldirganRaw, kurban).sebep ?? ''
    expect(sebep).not.toContain(String(saldirganRaw.basketId))
    expect(sebep).not.toContain(String(kurban.conversation_id))
    expect(sebep).not.toContain(String(kurban.total_amount))
    expect(sebep).toMatch(/^[a-z_]+$/)
  })
})
