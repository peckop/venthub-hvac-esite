// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { bilgiMerkeziYonlendirmeleri } from '../../../config/bilgiMerkeziYonlendirmeleri.mjs'
import { markaYonlendirmeleri } from '../../../config/markaYonlendirmeleri.mjs'
import {
  adresDiliOku,
  ASAMA_2_ONEKLERI,
  ROTA_DILI,
  rotaDiliEsle,
  rotaDiliHedefleriniYenile,
  rotaDiliTablosuDogrula,
  rotaDiliYenidenYazimlari,
  rotaDiliYonlendirmeleri,
  zincirVarMi,
} from '../../../config/rotaDili.mjs'

/**
 * INV-ROTA-DILI-1 — rota dili tablosunun üç çıktısı (OPS-52, kararlar 267/269/270).
 * Mekanizma veriden bağımsız ölçülür: kural değerleri bu dosyadaki KENDİ tablolarıyla, varsayılan
 * tablo (`rotaDili.veri.json`) ise yalnız "karar 267/269 satırları var ve tablo geçerli" diye sınanır.
 * Böylece Design'ın 27 sayfalık listesi veriye girdiğinde bu dosya değişmez.
 */

const HAKKIMIZDA = { id: 'hakkimizda', klasor: 'about', tr: 'hakkimizda', en: 'about' }
const ILETISIM = { id: 'iletisim', klasor: 'contact', tr: 'iletisim', en: 'contact' }
const IKI_SATIR = [HAKKIMIZDA, ILETISIM]

describe('adresDiliOku — yalnız tam "1" açar (yok/bozuk = kapalı)', () => {
  it.each([
    ['1', true],
    [undefined, false],
    ['', false],
    ['0', false],
    ['true', false],
    ['TRUE', false],
    ['on', false],
    ['yes', false],
    [' 1', false],
    ['1 ', false],
    ['01', false],
    ['2', false],
  ])('%j → %s', (deger, beklenen) => {
    expect(adresDiliOku(deger as string | undefined)).toBe(beklenen)
  })
})

describe('anahtar kapalı → üç çıktı da BOŞ', () => {
  it('varsayılan tabloyla', () => {
    expect(rotaDiliYonlendirmeleri(false)).toEqual([])
    expect(rotaDiliYenidenYazimlari(false)).toEqual([])
    expect(rotaDiliEsle('/about', ROTA_DILI, false)).toBeNull()
  })

  it('dolu bir tabloyla da boş (tablo büyüse anahtar kapalı kalır)', () => {
    expect(rotaDiliYonlendirmeleri(false, IKI_SATIR)).toEqual([])
    expect(rotaDiliYenidenYazimlari(false, IKI_SATIR)).toEqual([])
    expect(rotaDiliEsle('/about', IKI_SATIR)).toBeNull() // anahtar varsayılanı kapalı
  })

  it('kapalı kipte bozuk tablo ATMAZ (sıfır etki); açık kipte atar', () => {
    const bozuk = [{ id: 'cart', klasor: 'cart', tr: 'sepet', en: 'cart' }]
    expect(rotaDiliYonlendirmeleri(false, bozuk)).toEqual([])
    expect(() => rotaDiliYonlendirmeleri(true, bozuk)).toThrow(/Aşama 2/)
    expect(() => rotaDiliYenidenYazimlari(true, bozuk)).toThrow(/Aşama 2/)
  })
})

describe('anahtar açık — beklenen kural değerleri (karar 267/269)', () => {
  it('yönlendirme: yalnız değişen dilde kural; EN değişmiyorsa EN kuralı YOK', () => {
    expect(rotaDiliYonlendirmeleri(true, IKI_SATIR)).toEqual([
      { source: '/tr/about', destination: '/tr/hakkimizda', permanent: true },
      { source: '/tr/contact', destination: '/tr/iletisim', permanent: true },
    ])
  })

  it('yeniden yazım: yeni adres → mevcut klasör (yönlendirmenin tersi)', () => {
    expect(rotaDiliYenidenYazimlari(true, IKI_SATIR)).toEqual([
      { source: '/tr/hakkimizda', destination: '/tr/about' },
      { source: '/tr/iletisim', destination: '/tr/contact' },
    ])
  })

  it('iki dilde de değişen satır iki kural üretir (önce tr, sonra en)', () => {
    const tablo = [{ id: 'x', klasor: 'foo', tr: 'bar', en: 'baz' }]
    expect(rotaDiliYonlendirmeleri(true, tablo)).toEqual([
      { source: '/tr/foo', destination: '/tr/bar', permanent: true },
      { source: '/en/foo', destination: '/en/baz', permanent: true },
    ])
    expect(rotaDiliYenidenYazimlari(true, tablo)).toEqual([
      { source: '/tr/bar', destination: '/tr/foo' },
      { source: '/en/baz', destination: '/en/foo' },
    ])
  })

  it('klasör "/" içerebilir: yalnız değişen dil için kural', () => {
    const tablo = [{ id: 'sss', klasor: 'destek/sss', tr: 'destek/sss', en: 'support/faq' }]
    expect(rotaDiliYonlendirmeleri(true, tablo)).toEqual([
      { source: '/en/destek/sss', destination: '/en/support/faq', permanent: true },
    ])
    expect(rotaDiliYenidenYazimlari(true, tablo)).toEqual([{ source: '/en/support/faq', destination: '/en/destek/sss' }])
  })

  it('altYollar: kaynak ve hedefe /:path* eklenir (iki uçta da)', () => {
    const tablo = [{ id: 'destek', klasor: 'destek', tr: 'destek', en: 'support', altYollar: true }]
    expect(rotaDiliYonlendirmeleri(true, tablo)).toEqual([
      { source: '/en/destek/:path*', destination: '/en/support/:path*', permanent: true },
    ])
    expect(rotaDiliYenidenYazimlari(true, tablo)).toEqual([{ source: '/en/support/:path*', destination: '/en/destek/:path*' }])
  })

  it('altYollar kapalıysa kuyruk YOK (alt adresler bu satırın işi değil)', () => {
    const [kural] = rotaDiliYonlendirmeleri(true, [HAKKIMIZDA])
    expect(kural.source).not.toContain(':path')
  })

  it('hiçbir dilde değişmeyen satır kural üretmez', () => {
    const tablo = [{ id: 'ayni', klasor: 'ayni', tr: 'ayni', en: 'ayni' }]
    expect(rotaDiliYonlendirmeleri(true, tablo)).toEqual([])
    expect(rotaDiliYenidenYazimlari(true, tablo)).toEqual([])
  })

  it('varsayılan tablo: karar 267/269 satırları var ve üretilen kurallar içeriyor', () => {
    expect(ROTA_DILI).toEqual(expect.arrayContaining([HAKKIMIZDA, ILETISIM]))
    expect(rotaDiliYonlendirmeleri(true)).toEqual(
      expect.arrayContaining([
        { source: '/tr/about', destination: '/tr/hakkimizda', permanent: true },
        { source: '/tr/contact', destination: '/tr/iletisim', permanent: true },
      ]),
    )
    expect(rotaDiliYenidenYazimlari(true)).toEqual(
      expect.arrayContaining([
        { source: '/tr/hakkimizda', destination: '/tr/about' },
        { source: '/tr/iletisim', destination: '/tr/contact' },
      ]),
    )
  })

  it('her yönlendirmenin tersi bir yeniden yazım olarak vardır (iki liste ayrışmaz)', () => {
    const yonlendirmeler = rotaDiliYonlendirmeleri(true)
    const yazimlar = rotaDiliYenidenYazimlari(true)
    expect(yazimlar).toHaveLength(yonlendirmeler.length)
    for (const y of yonlendirmeler) {
      expect(yazimlar, y.source).toContainEqual({ source: y.destination, destination: y.source })
    }
  })
})

describe('rotaDiliEsle — dilsiz eski adres (middleware dilsiz kolu için saf arama)', () => {
  it('klasörle eşleşen dilsiz adres iki dildeki yeni adresi verir', () => {
    expect(rotaDiliEsle('/about', IKI_SATIR, true)).toEqual({ satirId: 'hakkimizda', tr: '/tr/hakkimizda', en: '/en/about' })
    expect(rotaDiliEsle('/contact', IKI_SATIR, true)).toEqual({ satirId: 'iletisim', tr: '/tr/iletisim', en: '/en/contact' })
  })

  it('sondaki "/" normalize edilir', () => {
    expect(rotaDiliEsle('/about/', IKI_SATIR, true)?.tr).toBe('/tr/hakkimizda')
  })

  it('eşleşmeyen adres null; dil önekli adres bu fonksiyonun işi DEĞİL', () => {
    expect(rotaDiliEsle('/bilinmeyen', IKI_SATIR, true)).toBeNull()
    expect(rotaDiliEsle('/tr/about', IKI_SATIR, true)).toBeNull()
    expect(rotaDiliEsle('/', IKI_SATIR, true)).toBeNull()
    expect(rotaDiliEsle('about', IKI_SATIR, true)).toBeNull()
  })

  it('string olmayan girdi null döner (çağıran bozuk girdi verirse patlamaz)', () => {
    expect(Reflect.apply(rotaDiliEsle, null, [undefined, IKI_SATIR, true])).toBeNull()
    expect(Reflect.apply(rotaDiliEsle, null, [42, IKI_SATIR, true])).toBeNull()
  })

  it('altYollar kapalıyken alt adres eşleşmez; açıkken kuyruk iki dile taşınır', () => {
    expect(rotaDiliEsle('/about/ekip', IKI_SATIR, true)).toBeNull()
    const tablo = [{ id: 'destek', klasor: 'destek', tr: 'destek', en: 'support', altYollar: true }]
    expect(rotaDiliEsle('/destek', tablo, true)).toEqual({ satirId: 'destek', tr: '/tr/destek', en: '/en/support' })
    expect(rotaDiliEsle('/destek/sss', tablo, true)).toEqual({ satirId: 'destek', tr: '/tr/destek/sss', en: '/en/support/sss' })
    expect(rotaDiliEsle('/destekler', tablo, true)).toBeNull() // önek eşleşmesi, parça eşleşmesi değil
  })

  it('birden çok satır uyarsa en uzun klasör kazanır', () => {
    const tablo = [
      { id: 'destek', klasor: 'destek', tr: 'destek', en: 'support', altYollar: true },
      { id: 'sss', klasor: 'destek/sss', tr: 'destek/sss', en: 'support/faq' },
    ]
    expect(rotaDiliEsle('/destek/sss', tablo, true)?.satirId).toBe('sss')
    expect(rotaDiliEsle('/destek/iade', tablo, true)?.satirId).toBe('destek')
  })

  it('anahtar kapalıyken null', () => {
    expect(rotaDiliEsle('/about', IKI_SATIR, false)).toBeNull()
  })
})

describe('zincirVarMi — tek hop kuralı (adres-semasi-standard.md A9)', () => {
  const k = (source: string, destination: string) => ({ source, destination, permanent: true })

  it('zincirsiz liste → null', () => {
    expect(zincirVarMi([k('/tr/a', '/tr/b'), k('/tr/c', '/tr/d')])).toBeNull()
    expect(zincirVarMi([])).toBeNull()
  })

  it('⛔SABOTAJ: bilinçli zincir (a→b, b→c) yakalanır ve çifti verir', () => {
    const bulgu = zincirVarMi([k('/tr/a', '/tr/b'), k('/tr/b', '/tr/c')])
    expect(bulgu?.kaynak.source).toBe('/tr/a')
    expect(bulgu?.hedef.source).toBe('/tr/b')
  })

  it('⛔SABOTAJ: döngü (a→b, b→a) yakalanır', () => {
    expect(zincirVarMi([k('/tr/a', '/tr/b'), k('/tr/b', '/tr/a')])).not.toBeNull()
  })

  it('⛔SABOTAJ: kendine giden kural (kendi kaynağının altına yönlendirme) yakalanır', () => {
    expect(zincirVarMi([k('/tr/x/:path*', '/tr/x/y/:path*')])).not.toBeNull()
  })

  it('hedefteki sorgu dizesi yok sayılır (?sku= zinciri gizlemez)', () => {
    expect(zincirVarMi([k('/tr/a', '/tr/b?sku=1'), k('/tr/b', '/tr/c')])).not.toBeNull()
  })

  it('":ad*" kuyruğu "ve altı" sayılır — iki yönde de', () => {
    expect(zincirVarMi([k('/tr/a', '/tr/destek/sss'), k('/tr/destek/:p*', '/tr/z')])).not.toBeNull()
    expect(zincirVarMi([k('/tr/a', '/tr/destek/:p*'), k('/tr/destek/sss', '/tr/z')])).not.toBeNull()
    expect(zincirVarMi([k('/tr/a', '/tr/destek'), k('/tr/destekler', '/tr/z')])).toBeNull() // parça sınırı
  })

  it('"/:lang(tr|en)" kuralı iki dile açılır; dil kodu karşılaştırmaya girer', () => {
    expect(zincirVarMi([k('/:lang(tr|en)/p', '/:lang/q'), k('/en/q', '/en/r')])).not.toBeNull()
    expect(zincirVarMi([k('/:lang(tr|en)/p', '/:lang/q'), k('/de/q', '/de/r')])).toBeNull()
  })

  it('açık kipte rotaDili kuralları kendi içinde zincirsizdir (varsayılan tablo)', () => {
    expect(zincirVarMi(rotaDiliYonlendirmeleri(true))).toBeNull()
    expect(zincirVarMi(rotaDiliYenidenYazimlari(true))).toBeNull()
  })

  it('⭐BİRLEŞİM: açık kipte bilgi merkezi + marka + rota dili kuralları zincir kurmaz (bayrak kombinasyonlarının hepsi)', () => {
    for (const enYayin of [false, true]) {
      for (const k3b of [false, true]) {
        // next.config'teki gerçek düzen: mevcut kuralların hedefleri ÖNCE tabloyla yenilenir (R4), sonra rota dili kuralları.
        const mevcut = [...bilgiMerkeziYonlendirmeleri(enYayin), ...markaYonlendirmeleri(k3b)]
        const birlesim = [...rotaDiliHedefleriniYenile(mevcut, true, ROTA_DILI), ...rotaDiliYonlendirmeleri(true)]
        expect(zincirVarMi(birlesim), `EN_YAYIN=${enYayin} K3B=${k3b}`).toBeNull()
      }
    }
  })

  it('⛔SABOTAJ: hedefler YENİLENMEZSE (R4) varsayılan tabloyla zincir kurulur (EN kapalı → /en/urun-secici, tablo onu yeniden adlandırdı)', () => {
    const yenilenmemis = [...bilgiMerkeziYonlendirmeleri(false), ...rotaDiliYonlendirmeleri(true)]
    const bulgu = zincirVarMi(yenilenmemis)
    expect(bulgu).not.toBeNull()
    expect(bulgu?.hedef.source).toBe('/en/urun-secici')
  })

  it('⛔SABOTAJ: tabloya bilgi merkezi adresini taşıyan satır girerse birleşimde zincir görünür', () => {
    // `/tr/destek/merkez` → `/tr/bilgi-merkezi` (karar 92) hedefini bu satır yeniden yönlendirirdi: 2 hop.
    const kotu = [{ id: 'bm', klasor: 'bilgi-merkezi', tr: 'rehber', en: 'knowledge-hub' }]
    const birlesim = [...bilgiMerkeziYonlendirmeleri(false), ...rotaDiliYonlendirmeleri(true, kotu)]
    const bulgu = zincirVarMi(birlesim)
    expect(bulgu).not.toBeNull()
    expect(bulgu?.hedef.source).toBe('/tr/bilgi-merkezi')
  })
})

describe('rotaDiliTablosuDogrula — hata dalları (sessiz yutma yok)', () => {
  const gecerli = () => [{ ...HAKKIMIZDA }, { ...ILETISIM }]

  it('geçerli tabloyu aynen döndürür', () => {
    const tablo = gecerli()
    expect(rotaDiliTablosuDogrula(tablo)).toBe(tablo)
  })

  it('varsayılan tablo geçerli', () => {
    expect(() => rotaDiliTablosuDogrula(ROTA_DILI)).not.toThrow()
  })

  it('dizi değil / nesne değil', () => {
    expect(() => rotaDiliTablosuDogrula({})).toThrow(/dizi/)
    expect(() => rotaDiliTablosuDogrula(null)).toThrow(/dizi/)
    expect(() => rotaDiliTablosuDogrula(['x'])).toThrow(/nesne/)
    expect(() => rotaDiliTablosuDogrula([null])).toThrow(/nesne/)
  })

  it('bilinmeyen anahtar (yazım hatası altYolar) atar', () => {
    expect(() => rotaDiliTablosuDogrula([{ ...HAKKIMIZDA, altYolar: true }])).toThrow(/bilinmeyen anahtar "altYolar"/)
  })

  it('boş id / tekrar eden id / tekrar eden klasör', () => {
    expect(() => rotaDiliTablosuDogrula([{ ...HAKKIMIZDA, id: '' }])).toThrow(/id boş/)
    expect(() => rotaDiliTablosuDogrula([HAKKIMIZDA, { ...ILETISIM, id: 'hakkimizda' }])).toThrow(/id tekrar/)
    expect(() => rotaDiliTablosuDogrula([HAKKIMIZDA, { ...ILETISIM, klasor: 'about' }])).toThrow(/klasor "about"/)
  })

  it.each(['/about', 'about/', 'About', 'a b', ':x', 'a/*', 'a//b', '', 'a_b', 'ç'])('geçersiz yol parçası %j', (kotu) => {
    for (const alan of ['klasor', 'tr', 'en']) {
      expect(() => rotaDiliTablosuDogrula([{ ...HAKKIMIZDA, [alan]: kotu }]), `${alan}=${kotu}`).toThrow(/geçerli bir yol/)
    }
  })

  it('eksik alan', () => {
    expect(() => rotaDiliTablosuDogrula([{ id: 'x', klasor: 'x', tr: 'x' }])).toThrow(/"en" geçerli/)
  })

  it('altYollar boolean olmalı', () => {
    expect(() => rotaDiliTablosuDogrula([{ ...HAKKIMIZDA, altYollar: 'true' }])).toThrow(/boolean/)
  })

  it('⭐KARAR 270: Aşama 2 önekleri klasörde, tr yolunda ve en yolunda reddedilir (ilk parça)', () => {
    for (const onek of ASAMA_2_ONEKLERI) {
      for (const alan of ['klasor', 'tr', 'en']) {
        for (const deger of [onek, `${onek}/alt`]) {
          expect(
            () => rotaDiliTablosuDogrula([{ id: 'a2', klasor: 'ok', tr: 'ok-tr', en: 'ok-en', [alan]: deger }]),
            `${alan}=${deger}`,
          ).toThrow(/Aşama 2/)
        }
      }
    }
  })

  it('Aşama 2 öneki yalnız İLK parçada yasak: "destek/cart" geçer', () => {
    expect(() => rotaDiliTablosuDogrula([{ id: 'x', klasor: 'destek/cart', tr: 'destek/cart', en: 'support/cart' }])).not.toThrow()
  })

  it('dil kodu ilk parça olamaz (dil önekiyle karışır)', () => {
    expect(() => rotaDiliTablosuDogrula([{ ...HAKKIMIZDA, tr: 'tr/hakkimizda' }])).toThrow(/dil koduyla/)
    expect(() => rotaDiliTablosuDogrula([{ ...HAKKIMIZDA, klasor: 'en' }])).toThrow(/dil koduyla/)
  })

  it('bir dilde iki satır aynı yeni yola gidemez', () => {
    expect(() => rotaDiliTablosuDogrula([HAKKIMIZDA, { ...ILETISIM, tr: 'hakkimizda' }])).toThrow(/tr yolu "hakkimizda".*çakışıyor/)
    expect(() => rotaDiliTablosuDogrula([HAKKIMIZDA, { ...ILETISIM, en: 'about' }])).toThrow(/en yolu "about".*çakışıyor/)
  })

  it('yeni yol başka satırın klasörüyle çakışamaz', () => {
    // hakkimizda'nın TR yolu "contact": /tr/contact hem iletişimin eski adresi (yönlendirme) hem hakkımızda'nın yeni adresi.
    expect(() => rotaDiliTablosuDogrula([{ ...HAKKIMIZDA, tr: 'contact' }, ILETISIM])).toThrow(/klasörüyle çakışıyor/)
  })

  it('altYollar açıkken yeni yol kendi klasörünün altında olamaz (sonsuz döngü)', () => {
    expect(() =>
      rotaDiliTablosuDogrula([{ id: 'd', klasor: 'destek', tr: 'destek/yardim', en: 'support', altYollar: true }]),
    ).toThrow(/sonsuz döngü/)
    // altYollar kapalıyken aynı satır geçer: kuyruk yok, döngü yok.
    expect(() =>
      rotaDiliTablosuDogrula([{ id: 'd', klasor: 'destek', tr: 'destek/yardim', en: 'support' }]),
    ).not.toThrow()
  })

  it('önek zinciri yükleme anında yakalanır: hedef başka satırın altYollar kaynağının altına düşemez', () => {
    // b: /tr/x → /tr/about/ekip ; a: /tr/about/:path* → /tr/hakkimizda/:path* ⇒ iki sıçrama.
    const HAKKIMIZDA_ALT = { ...HAKKIMIZDA, altYollar: true }
    const b = { id: 'b', klasor: 'x', tr: 'about/ekip', en: 'x' }
    expect(() => rotaDiliTablosuDogrula([HAKKIMIZDA_ALT, b])).toThrow(/zincir/)
    expect(() => rotaDiliTablosuDogrula([b, HAKKIMIZDA_ALT])).toThrow(/zincir/)
    // altYollar kapalıyken /tr/about/ekip, /tr/about kaynağının altı sayılmaz: geçer.
    expect(() => rotaDiliTablosuDogrula([HAKKIMIZDA, b])).not.toThrow()
    // alt klasör biçimi: klasor 'about/team', tr 'about' (altYollar) başka satırın hedefiyle kesişir.
    expect(() =>
      rotaDiliTablosuDogrula([{ id: 'e', klasor: 'about/team', tr: 'about', en: 'about/team', altYollar: true }, { id: 'f', klasor: 'y', tr: 'about/ekip', en: 'y' }]),
    ).toThrow(/zincir/)
  })
})

describe('anahtar ↔ next.config bağlantısı', () => {
  const nextConfig = readFileSync(join(process.cwd(), 'next.config.mjs'), 'utf8')

  it('next.config anahtarı NEXT_PUBLIC_ADRES_DILI üzerinden adresDiliOku ile okur ve iki çıktıyı bağlar', () => {
    expect(nextConfig).toMatch(/adresDiliOku\(process\.env\.NEXT_PUBLIC_ADRES_DILI\)/)
    expect(nextConfig).toMatch(/\.\.\.rotaDiliYonlendirmeleri\(ADRES_DILI\)/)
    expect(nextConfig).toMatch(/beforeFiles:\s*rotaDiliYenidenYazimlari\(ADRES_DILI\)/)
  })

  it('K3B ile BAĞLANMAZ: next.config rotaDili anahtarını K3B ya da EN_YAYIN ifadesine karıştırmaz', () => {
    const satir = nextConfig.split('\n').find((s) => s.includes('const ADRES_DILI'))
    expect(satir).toBeDefined()
    expect(satir).not.toMatch(/K3B|EN_YAYIN/)
  })
})
