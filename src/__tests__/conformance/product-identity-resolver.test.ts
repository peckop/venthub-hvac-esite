import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  getProductDisplayName,
  getProductModelLabel,
  type ProductIdentitySource,
} from '../../utils/productHelpers'

/**
 * INV-PRODUCT-IDENTITY · ürün kimliği TEK çözücüden gelir ve müşteriye HAM SKU gösterilmez.
 *
 * CETVEL: `docs/standards/product-schema-standard.md`
 *
 * NİÇİN VAR (ölçüm, 2026-08-19, prod 374 ürün):
 *   · 374/374 üründe `products.name` aile adından FARKLI → PDP yalnız aile adını
 *     yazarsa müşteri satın aldığı şeyin adını İLK KEZ sepette görür.
 *   · 74 satırda ad, aile İÇİNDE başka bir üyeyle çakışıyor → ad tek başına ayırt
 *     etmiyor, model etiketi gerçekten gerekli.
 *   · 374/374 üründe `model_code` DOLU → yüzeydeki `model_code || sku` yedeği bugün
 *     HİÇ çalışmıyor. Kusur LATENT: katalog hattına `model_code`'suz tek ürün girdiği
 *     an müşteri iç kod görür. Latent bir açık, kapalı bir açık DEĞİLDİR.
 *
 * Bu kapı DAVRANIŞ ölçer (fonksiyonu gerçekten çağırır); ek olarak kaynak metninde
 * `sku` yedeğinin geri eklenmediğini de sabitler — ikisi farklı şeyleri yakalar.
 */

const KAYNAK = 'src/utils/productHelpers.ts'

const urun = (o: Partial<ProductIdentitySource>): ProductIdentitySource => ({
  name: null,
  model_code: null,
  sku: 'NIC-11942',
  ...o,
})

describe('INV-PRODUCT-IDENTITY · görünen ad', () => {
  it('varyant adı varsa O gösterilir (sepete düşecek adla aynı)', () => {
    expect(getProductDisplayName(urun({ name: 'ADH-200 E2' }), { name: 'ADH Serisi' })).toBe(
      'ADH-200 E2',
    )
  })

  it('varyant adı yoksa aile adına düşer', () => {
    expect(getProductDisplayName(urun({ name: '  ' }), { name: 'ADH Serisi' })).toBe('ADH Serisi')
  })

  /** ASIL KORUMA: hiçbir dalda iç kod dönmemeli. */
  it('hiçbir durumda SKU dönmez — ad da aile adı da yokken bile', () => {
    const sonuc = getProductDisplayName(urun({ name: null }), { name: null })
    expect(sonuc, `iç kod sızdı: ${sonuc}`).not.toContain('NIC-11942')
    expect(sonuc).toBe('')
  })

  it('sözlük verilirse son çare sözlükten gelir, iç koddan değil', () => {
    const t = (k: string) => (k === 'product.unnamed' ? 'Ürün' : k)
    expect(getProductDisplayName(urun({ name: null }), { name: null }, t)).toBe('Ürün')
  })

  it('varyant hiç yoksa çökmez', () => {
    expect(getProductDisplayName(null, { name: 'ADH Serisi' })).toBe('ADH Serisi')
    expect(getProductDisplayName(undefined, null)).toBe('')
  })
})

describe('INV-PRODUCT-IDENTITY · ayırt edici model etiketi', () => {
  it('model_code varsa etiket odur', () => {
    expect(getProductModelLabel(urun({ model_code: 'ADH-200-E2' }))).toBe('ADH-200-E2')
  })

  /**
   * BUGÜN ULAŞILMAYAN DAL — ve tam da bu yüzden kapı gerekli. Prodda 374/374 üründe
   * `model_code` dolu; bu test, veri bir gün değiştiğinde davranışın ne olacağını
   * SABİTLER: etiket hiç gösterilmez, iç kod ASLA gösterilmez.
   */
  it('model_code yoksa NULL döner — SKU yedeğine DÜŞMEZ', () => {
    expect(getProductModelLabel(urun({ model_code: null }))).toBeNull()
    expect(getProductModelLabel(urun({ model_code: '   ' }))).toBeNull()
  })

  it('varyant hiç yoksa çökmez', () => {
    expect(getProductModelLabel(null)).toBeNull()
  })
})

describe('INV-PRODUCT-IDENTITY · kaynak sabitlemesi', () => {
  /**
   * Davranış testi, birinin `sku` yedeğini BAŞKA bir isimle geri eklemesini yakalar;
   * bu assert ise doğrudan o satırın geri gelmesini yakalar. İkisi farklı şeyleri görür.
   *
   * Yalnız İKİ FONKSİYONUN GÖVDESİNE bakılır: `sku` alanı TİPTE bilerek duruyor
   * (çağıranların satırı uymalı), yasak olan onu OKUMAK.
   */
  it('çözücü fonksiyonlarının gövdesinde sku okuması YOK', () => {
    const ham = readFileSync(KAYNAK, 'utf8')

    for (const ad of ['getProductDisplayName', 'getProductModelLabel']) {
      const bas = ham.indexOf(`export const ${ad} =`)
      expect(bas, `${ad} kaynakta bulunamadı — kapı ölçemiyor`).toBeGreaterThan(-1)

      // Gövde: tanım satırından, tek başına kapanış parantezi olan satıra kadar.
      // (Kaçış dizisi KULLANILMIYOR — satır bazlı tarama daha okunur ve daha az kırılgan.)
      const satirlar = ham.slice(bas).split(String.fromCharCode(10))
      const govdeSatirlari: string[] = []
      for (const satir of satirlar) {
        govdeSatirlari.push(satir)
        // trim ZORUNLU: depo CRLF'e normalize ediyor, satir sonunda gorunmez bir
        // satır-başı karakteri kalıyor ve ham karşılaştırma gövdeyi HİÇ bitiremiyor:
        // tarama tüm dosyayı yutuyor, kapı da
        // YANLIŞ-KIRMIZI veriyor. (Tam takımda bir kez gerçekten yaşandı.)
        if (satir.trim() === '}') break
      }
      const govde = govdeSatirlari.join(' ')

      expect(
        govde.includes('sku'),
        `${ad} gövdesinde sku geçiyor — ham iç kod müşteriye sızabilir`,
      ).toBe(false)
    }
  })
})
