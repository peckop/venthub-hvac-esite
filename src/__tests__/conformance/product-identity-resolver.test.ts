import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import ts from 'typescript'
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
    expect(
      getProductDisplayName(urun({ name: 'ADH-200 E2' }), { name: 'ADH Serisi' }, 'tr'),
    ).toBe('ADH-200 E2')
  })

  it('varyant adı yoksa aile adına düşer', () => {
    expect(getProductDisplayName(urun({ name: '  ' }), { name: 'ADH Serisi' }, 'tr')).toBe(
      'ADH Serisi',
    )
  })

  /** ASIL KORUMA: hiçbir dalda iç kod dönmemeli. */
  it('hiçbir durumda SKU dönmez — ad da aile adı da yokken bile', () => {
    const sonuc = getProductDisplayName(urun({ name: null }), { name: null }, 'tr')
    expect(sonuc, `iç kod sızdı: ${sonuc}`).not.toContain('NIC-11942')
    expect(sonuc).toBe('')
  })

  it('sözlük verilirse son çare sözlükten gelir, iç koddan değil', () => {
    const t = (k: string) => (k === 'product.unnamed' ? 'Ürün' : k)
    expect(getProductDisplayName(urun({ name: null }), { name: null }, 'tr', t)).toBe('Ürün')
  })

  it('varyant hiç yoksa çökmez', () => {
    expect(getProductDisplayName(null, { name: 'ADH Serisi' }, 'tr')).toBe('ADH Serisi')
    expect(getProductDisplayName(undefined, null, 'tr')).toBe('')
  })
})

/**
 * REC-110 · DİL ZİNCİRİ — `products.name_i18n` (migration 20260901155000).
 *
 * NİÇİN VAR (ölçüldü, 2026-09-01): aile adları REC-109'da 40/40 İngilizcelendi, varyant
 * adları düz `products.name` kaldı. Sonuç: /en ürün sayfasında aile başlığı İngilizce,
 * altındaki varyant listesi Türkçe — AYNI ekranda iki dil. 24 varyant adı çeviri bekliyor.
 *
 * ⭐Yeni bir `variantName` çözücüsü YAZILMADI: giriş noktası zaten burada ve kapısı bu
 * dosya. İkinci çözücü, INV-KATEGORI-ADI-1 KÖK 3'ün "KOPYALAMAK DA İHLALDİR" sınıfına
 * girerdi. Mevcut çözücü dil-farkında yapıldı.
 *
 * ⭐`lang` ZORUNLU ve bunun kolu aşağıda AST ile ölçülüyor (KÖK 2'nin kardeşi): kardeş
 * çözücü `getCategoryDisplayName(category, t?)` sözlüğü opsiyonel aldığı için 25 çağrının
 * 12'si sözlüksüz koşuyordu ve anahtar eklense bile Türkçe basmaya devam ediyordu. Dil
 * vermeyi unutan çağrı burada sessizce Türkçeye DÜŞMEZ, derlenmez.
 */
describe('INV-PRODUCT-IDENTITY · dil zinciri (REC-110)', () => {
  const cevirili = urun({ name: '12 KW ELEKTRİKLİ ISITICI', name_i18n: { tr: '12 kW Elektrikli Isıtıcı', en: '12 kW Electric Duct Heater' } })
  const aile = { name: 'AVenS Elektrikli Kanal Isıtıcıları', name_i18n: { en: 'AVenS Electric Duct Heaters' } }

  it('⭐EN sayfada name_i18n.en, TR sayfada name_i18n.tr — ölçüt iki dilde FARKLI cevap verir', () => {
    expect(getProductDisplayName(cevirili, aile, 'en')).toBe('12 kW Electric Duct Heater')
    expect(getProductDisplayName(cevirili, aile, 'tr')).toBe('12 kW Elektrikli Isıtıcı')
  })

  it('name_i18n yokken ham ada düşer — bugünkü davranış, regresyon yok', () => {
    expect(getProductDisplayName(urun({ name: 'KENTALFAN 315 M4' }), aile, 'en')).toBe('KENTALFAN 315 M4')
  })

  it('⭐boş dize DOLU SAYILMAZ — toplu betik boş hücre bırakırsa ad görünmez olmaz', () => {
    const bosEn = urun({ name: 'SULU BATARYA 7 KW', name_i18n: { tr: 'Sulu Batarya 7 kW', en: '   ' } })
    expect(getProductDisplayName(bosEn, null, 'en')).toBe('SULU BATARYA 7 KW')
  })

  it('varyant adı yoksa aile adı da DİLİYLE düşer (aile zinciri familyName ile aynı kural)', () => {
    expect(getProductDisplayName(urun({ name: null }), aile, 'en')).toBe('AVenS Electric Duct Heaters')
    expect(getProductDisplayName(urun({ name: null }), aile, 'tr')).toBe('AVenS Elektrikli Kanal Isıtıcıları')
  })

  it('⭐lang ZORUNLU — çözücü imzasında üçüncü parametre opsiyonel DEĞİL (AST)', () => {
    const ham = readFileSync(KAYNAK, 'utf8')
    const sf = ts.createSourceFile('x.ts', ham, ts.ScriptTarget.Latest, true)
    let langParam: ts.ParameterDeclaration | undefined
    const gez = (n: ts.Node): void => {
      if (
        ts.isVariableDeclaration(n) &&
        ts.isIdentifier(n.name) &&
        n.name.text === 'getProductDisplayName' &&
        n.initializer &&
        ts.isArrowFunction(n.initializer)
      ) {
        langParam = n.initializer.parameters.find(
          (p) => ts.isIdentifier(p.name) && p.name.text === 'lang',
        )
      }
      ts.forEachChild(n, gez)
    }
    gez(sf)
    expect(langParam, 'getProductDisplayName imzasında `lang` parametresi YOK').toBeDefined()
    expect(
      langParam!.questionToken,
      '`lang` OPSİYONEL yapılmış — getCategoryDisplayName\'in `t?` tuzağı geri geldi: dil ' +
        'vermeyen çağrı sessizce Türkçeye düşer. Zorunlu kalmalı; unutan çağrı DERLENMESİN.',
    ).toBeUndefined()
    expect(langParam!.initializer, '`lang` için varsayılan değer verilmiş — opsiyonelle aynı tuzak').toBeUndefined()
  })

  it('⭐üç tüketici de çözücüden geçiyor — PDP, VariantSelector, JSON-LD (kaynak taraması)', () => {
    const TUKETICILER = [
      'src/app/_components/ProductDetailPageView.tsx',
      'src/components/products/VariantSelector.tsx',
      'src/lib/seo/jsonld.ts',
    ]
    const eksik = TUKETICILER.filter((yol) => !readFileSync(resolve(process.cwd(), yol), 'utf8').includes('getProductDisplayName('))
    expect(
      eksik,
      'Bu yüzeyler varyant adını çözücüden almıyor — ham `name` basıyor olabilir: ' + eksik.join(', '),
    ).toEqual([])
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

/**
 * CAGRI YERI — cozucunun VAR OLMASI yetmez, KULLANILMASI gerekir.
 *
 * NICIN AYRI BLOK: 2026-08-19'da cozucu yazildi ama cagri yeri baska bir seridin
 * dalinda tasindi ve o dal cozucu olmadan merge oldu (#670). Sonuc: fonksiyonlar
 * hicbir yerde cagrilmiyordu, testler yesildi, vitrinde ham alan okumasi yasamaya
 * devam etti. Bir cozucu, cagrilmiyorsa YOKTUR.
 *
 * TARAMA HAM METIN UZERINDE, yorum siyirma YOK: yasak dizge yorumda bile gecmemeli.
 * Siyiricinin kendisi bu depoda uc kez kor nokta uretti; deterministik olan secildi.
 */
describe('INV-PRODUCT-IDENTITY · çağrı yeri (ürün detay sayfası)', () => {
  const PDP = resolve(process.cwd(), 'src/app/_components/ProductDetailPageView.tsx')
  const pdpKaynak = readFileSync(PDP, 'utf8')
  const SATIR_SONU = String.fromCharCode(10)

  it('çözücüyü İTHAL ediyor (yoksa çağırıyor olamaz)', () => {
    expect(pdpKaynak).toContain('getProductDisplayName')
    expect(pdpKaynak).toContain('getProductModelLabel')
  })

  it('ham varyant adı render EDİLMİYOR', () => {
    const isabet = pdpKaynak.split(SATIR_SONU).filter((s) => s.includes('selectedVariant.name'))
    expect(
      isabet,
      'Ham selectedVariant.name okuması geri geldi. Görünen ad TEK kaynaktan gelir: ' +
        'getProductDisplayName(selectedVariant, family). Satırlar: ' + isabet.join(' | '),
    ).toEqual([])
  })

  // BILINEN ve KABUL EDILEN uc kullanim. Muafiyet ADIYLA yazilir, sessiz gecilmez.
  // (a) selectedSku={...} — VariantSelector'a giden SECIM ANAHTARI, gorunen metin degil.
  // (c) etiketli SKU satiri — musteriye ACIKCA 'SKU: ...' diye gosteriliyor. Bu bir URUN
  //     KARARI, kusur degil; T098 kapsaminda DEGISTIRILMEDI (LEGAL'in onayladigi dar diff
  //     disindaydi) ve karari OPS'a bildirildi. Karar 'gosterilmesin' cikarsa BU SATIR
  //     listeden silinir ve kapi kendiliginden kirmizi verir.
  const BILINEN_SKU_KULLANIMI = [
    'selectedSku={selectedVariant.sku}',
    "{t('pdp.labels.sku')}: {selectedVariant.sku}",
  ]

  it('ham SKU yedeği geri gelmiyor (bilinen kullanımlar dışında)', () => {
    const isabet = pdpKaynak
      .split(SATIR_SONU)
      .filter((s) => s.includes('selectedVariant.sku') || /model_code\s*\|\|/.test(s))
      .filter((s) => !BILINEN_SKU_KULLANIMI.some((bilinen) => s.includes(bilinen)))
    expect(
      isabet,
      'Model etiketinde ham SKU yedeği geri geldi. SKU İÇ koddur, kimlik metnine karışmaz; ' +
        'kod yoksa etiket satırı HİÇ çizilmez. Satırlar: ' + isabet.join(' | '),
    ).toEqual([])
  })

  it('muafiyet listesinde BAYAT satır yok (kullanım kalktıysa satır silinmeli)', () => {
    const bayat = BILINEN_SKU_KULLANIMI.filter((bilinen) => !pdpKaynak.includes(bilinen))
    expect(
      bayat,
      'Muafiyet listesi gerçeği anlatmıyor: aşağıdaki kullanım artık dosyada YOK, satırı SİL. ' +
        bayat.join(' | '),
    ).toEqual([])
  })
  it('model etiketi satırı KOŞULLU çiziliyor (kod yoksa boş etiket basılmaz)', () => {
    expect(
      pdpKaynak,
      'getProductModelLabel null dönebiliyor; etiket satırı koşulsuz çizilirse boş etiket basılır.',
    ).toContain('{variantLabel && (')
  })
})
