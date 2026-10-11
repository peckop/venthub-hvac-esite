/**
 * REC-209 · Kademe-2 yükleyicisinin sınavı — en çok satır yazan araç, ilk kez sınanıyor.
 * Ağa, DB'ye, diske çıkmaz (planla.mjs saf; load.mjs yalnız METİN olarak okunur). Fiyatlar UYDURMA.
 *
 * Kilitlenenler:
 *   1. Hiçbir satır sessiz düşmez: her ret `errors`'a adıyla girer (marka, kategori, alt kategori,
 *      SKU çakışması, aile haritası, çok-çiftli sonek, kimliksiz satır).
 *   2. Kodsuz satır düşmez, addan kimlik alır ve draft girer (REC-275).
 *   3. Boş fiyat hücresi → purchase_price 0 AMA `fiyatsiz` listesinde SKU'suyla görünür (REC-193 kök sebebi).
 *   4. Sayısal teknik değer sayı olur (eksi dahil: "-20" → -20; spec-axis K1), metin metin kalır.
 *   5. load.mjs: mevcut ürün GÜNCELLENMEZ (yalnız insert + image_url), upsert yok, varsayılan kuru koşum,
 *      hata varken APPLY yok. Sabotaj yönü: bu kurallardan biri kaynaktan silinirse aynı test KIRMIZI.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { planla, satirlariTopla, specValue, num, pqKapisi, pqTurevDeseniMi, PQ_KAYNAK } from '../planla.mjs'

const KAT = [
  { id: 'k-fan', slug: 'fans', parent_id: null },
  { id: 'k-kanal', slug: 'duct-fans', parent_id: 'k-fan' },
  { id: 'k-cati', slug: 'roof-fans', parent_id: 'k-fan' },
  { id: 'k-aks', slug: 'accessories-components', parent_id: null },
  { id: 'k-baska', slug: 'other-sub', parent_id: 'k-aks' },
]
const AILE = {
  'avens-test': { name_tr: 'Test Ailesi', name_en: 'Test Family' },
  'vortice-vort-heatmaster-slimroof-roof': { name_tr: 'Çatı', name_en: 'Roof' },
}
const BASLIK = 'model_code;name;brand;category_slug;subcategory_slug;purchase_price_eur;currency;confidence;spec_min_operating_temperature_c;spec_insulation_class;spec_ip_rating_bool;image_url'
const csv = (...satir: string[]) => [BASLIK, ...satir].join('\n')
const topla = (ad: string, metin: string) => satirlariTopla([{ ad, dizin: '/yok', metin }])
const calis = (ad: string, metin: string) => {
  const t = topla(ad, metin)
  const p = planla({ rows: t.rows, kategoriler: KAT, aileHaritasi: AILE, gorselCoz: () => null })
  return { ...p, toplaHata: t.errors, kodsuz: t.kodsuzSatir }
}

describe('planla — sessiz düşme yok', () => {
  it('geçerli satır ürün olur; kimlik tek kuraldan, fiyat ve birim korunur', () => {
    const r = calis('avens-test', csv('11560;AVenS Test 1;AVenS;fans;duct-fans;123,5;EUR;ok;-20;Class F;true;'))
    expect(r.errors).toEqual([])
    expect(r.products).toHaveLength(1)
    const u = r.products[0]
    expect(u.sku).toBe('AVE-11560')
    expect(u.status).toBe('active')
    expect(u.purchase_price).toBe(123.5)
    expect(u.technical_specs).toEqual({ min_operating_temperature_c: -20, insulation_class: 'Class F', ip_rating_bool: true })
    expect(r.fiyatsiz).toEqual([])
  })

  it('bilinmeyen marka, yok kategori, yanlış üst kategori, yok alt kategori — hepsi adıyla hata', () => {
    const r = calis('avens-test', csv(
      '1;A;Acme;fans;duct-fans;1;EUR;ok;;;;',
      '2;B;AVenS;electric-heating;;1;EUR;ok;;;;',
      '3;C;AVenS;duct-fans;;1;EUR;ok;;;;',
      '4;D;AVenS;fans;yok-alt;1;EUR;ok;;;;',
      '5;E;AVenS;fans;other-sub;1;EUR;ok;;;;',
    ))
    expect(r.products).toHaveLength(0)
    expect(r.errors).toHaveLength(5)
    expect(r.errors[0]).toMatch(/bilinmeyen marka 'Acme'/)
    expect(r.errors[1]).toMatch(/üst kategori yok\/geçersiz 'electric-heating'/)
    expect(r.errors[2]).toMatch(/üst kategori yok\/geçersiz 'duct-fans'/)
    expect(r.errors[3]).toMatch(/alt kategori yok 'yok-alt'/)
    expect(r.errors[4]).toMatch(/'other-sub' kategorisi 'fans' altında değil/)
  })

  it('CSV "accessories" takma adı DB "accessories-components"e çözülür', () => {
    const r = calis('avens-test', csv('7;G;AVenS;accessories;;1;EUR;ok;;;;'))
    expect(r.errors).toEqual([])
    expect(r.products[0].category_id).toBe('k-aks')
  })

  it('SKU çakışması: ikinci satır düşer ve hata ilk satırı adıyla gösterir', () => {
    const r = calis('avens-test', csv('9;H;AVenS;fans;;1;EUR;ok;;;;', '9;H2;AVenS;fans;;2;EUR;ok;;;;'))
    expect(r.products).toHaveLength(1)
    expect(r.errors).toEqual([expect.stringMatching(/SKU çakışması AVE-9 \(ilk: avens-test\/9\)/)])
  })

  it('aile haritasında olmayan CSV ve soneksiz çok-çiftli CSV reddedilir', () => {
    expect(calis('tanimsiz-aile', csv('10;I;AVenS;fans;;1;EUR;ok;;;;')).errors)
      .toEqual([expect.stringMatching(/tanimsiz-aile: family-map\.yaml'de tanımsız/)])
    expect(calis('vortice-vort-heatmaster-slimroof', csv('11;J;Vortice;fans;duct-fans;1;EUR;ok;;;;')).errors)
      .toEqual([expect.stringMatching(/suffix'siz alt kategori 'duct-fans'/)])
    const cati = calis('vortice-vort-heatmaster-slimroof', csv('12;K;Vortice;fans;roof-fans;1;EUR;ok;;;;'))
    expect(cati.errors).toEqual([])
    expect(cati.products[0].famSlug).toBe('vortice-vort-heatmaster-slimroof-roof')
  })

  it('kodsuz satır DÜŞMEZ: addan kimlik alır, draft girer ve sayılır (REC-275)', () => {
    const r = calis('avens-test', csv(';AVenS CA IL 200;AVenS;fans;;1;EUR;ok;;;;'))
    expect(r.errors).toEqual([])
    expect(r.kodsuz).toEqual(['avens-test: AVenS CA IL 200'])
    expect(r.products).toHaveLength(1)
    expect(r.products[0].status).toBe('draft')
  })

  it('kodu da adı da olmayan satır kimliksizdir: adıyla hata, ürün olmaz', () => {
    const r = calis('avens-test', csv(';;AVenS;fans;;1;EUR;ok;;;;'))
    expect(r.toplaHata).toEqual(['avens-test: model_code VE name bos — kimlik uretilemez'])
    expect(r.products).toHaveLength(0)
  })

  it('güveni "ok" olmayan satır draft girer', () => {
    expect(calis('avens-test', csv('13;L;AVenS;fans;;1;EUR;missing;;;;')).products[0].status).toBe('draft')
  })
})

describe('planla — boş fiyat sessiz 0 değildir (REC-193 kök sebebi)', () => {
  it('boş ve bozuk fiyat hücresi 0 yazılır AMA fiyatsiz listesinde SKU ile görünür', () => {
    const r = calis('avens-test', csv(
      '20150;AVenS-HF/FW 18/18 5,5 kW;AVenS;fans;;;EUR;ok;;;;',
      '20151;M;AVenS;fans;;fiyat yok;EUR;ok;;;;',
      '20152;N;AVenS;fans;;0;EUR;ok;;;;',
      '20153;O;AVenS;fans;;10;EUR;ok;;;;',
    ))
    expect(r.errors).toEqual([])
    expect(r.products.map((p: { purchase_price: number }) => p.purchase_price)).toEqual([0, 0, 0, 10])
    expect(r.fiyatsiz).toEqual(['AVE-20150', 'AVE-20151', 'AVE-20152'])
  })
})

/**
 * KTL-7 · karar 320 — eğri kaynağı kapısı. Köken (2026-10-08 ölçümü): 141 üç noktalı eğrinin ortadaki noktası
 * ingestor'daki yapay zekâ çıkarım hattında HESAPLANDI (58 ürün %75, 48 ürün %50, 35 ürün elle sabit) ve etiketsiz
 * yüklendi. Kapı gerçeği HÜKMETMEZ (etiketli QBK eğrisini geçirir); ETİKETSİZLİĞİ ve "hesaplanmış ama ölçüm
 * diye etiketli" yalanını durdurur. Gerçek eğri doğruluğu §6.3 "Eğri çizimi" ±%2 kapısının işidir.
 * Sabotaj yönü: planla.mjs'ten `pqKapisi(r)` çağrısı silinirse "etiketsiz eğri plan KIRMIZI" testleri kırmızı olur.
 */
const BASLIK_PQ = 'model_code;name;brand;category_slug;subcategory_slug;purchase_price_eur;currency;confidence;spec_pq_curve;spec_pq_curve_kaynak'
const csvPq = (...satir: string[]) => [BASLIK_PQ, ...satir].join('\n')
const calisPq = (...satir: string[]) => {
  const t = topla('avens-test', csvPq(...satir))
  return planla({ rows: t.rows, kategoriler: KAT, aileHaritasi: AILE, gorselCoz: () => null })
}
const U75 = '[[0.0, 126.0], [572.0, 94.0], [1145.0, 0.0]]' // E-ATEX: sabit yazılmış, 94 ↔ 0,75·126 = 94,5 (yuvarlama)
const U50 = '[[0.0, 130.0], [19.0, 65.0], [38.0, 0.0]]' // Mono: tam %50, düz çizgi
const QBK = '[[0.0, 370.0], [1270.0, 240.0], [2540.0, 0.0]]' // desene uymuyor (%65): gerçek mi uydurma mı BİLİNMİYOR
const GERCEK8 = '[[0,736],[250,640],[500,560],[750,490],[1000,420],[1250,340],[1500,230],[1740,0]]'

describe('planla — pq_curve kaynak kapısı (KTL-7, karar 320)', () => {
  it('desen tanıma: %75 ve %50 üçgeni (yuvarlamalı dahil) yakalanır; QBK, 6 ve 8 nokta yakalanmaz', () => {
    expect(pqTurevDeseniMi(JSON.parse(U75))).toBe(0.75)
    expect(pqTurevDeseniMi(JSON.parse(U50))).toBe(0.5)
    expect(pqTurevDeseniMi(JSON.parse(QBK))).toBeNull()
    expect(pqTurevDeseniMi(JSON.parse(GERCEK8))).toBeNull()
    expect(pqTurevDeseniMi([[0, 39.23], [20, 29.42], [40, 21.57], [60, 20.59], [80, 17.65], [90, 9.81]])).toBeNull()
    // orta debi tam yarı değil → hesaplanmış üçgen değil
    expect(pqTurevDeseniMi([[0, 100], [60, 75], [100, 0]])).toBeNull()
  })

  it('etiketsiz eğri plan KIRMIZI: ürün düşer, hata satırı adıyla söyler', () => {
    const r = calisPq(`11;A;AVenS;fans;;1;EUR;ok;${QBK};`)
    expect(r.products).toHaveLength(0)
    expect(r.errors).toEqual([expect.stringMatching(/avens-test\/11: pq_curve var ama pq_curve_kaynak yok/)])
  })

  it('tanımsız kaynak adı reddedilir; üç tanımlı değer kabul edilir', () => {
    const r = calisPq(`12;A;AVenS;fans;;1;EUR;ok;${QBK};olculmus`)
    expect(r.errors).toEqual([expect.stringMatching(/pq_curve_kaynak 'olculmus' tanımsız/)])
    for (const k of PQ_KAYNAK.filter((x) => x !== 'turetilmis')) {
      const ok = calisPq(`13;B;AVenS;fans;;1;EUR;ok;${GERCEK8};${k}`)
      expect(ok.errors).toEqual([])
      expect((ok.products[0].technical_specs as Record<string, unknown>).pq_curve_kaynak).toBe(k)
    }
  })

  it('hesaplanmış üçgen ölçüm diye etiketlenemez: kitapcik_grafik/kitapcik_tablo → hata, turetilmis → geçer', () => {
    for (const [egri, oran] of [[U75, '75'], [U50, '50']] as const) {
      for (const k of ['kitapcik_grafik', 'kitapcik_tablo']) {
        const r = calisPq(`14;C;AVenS;fans;;1;EUR;ok;${egri};${k}`)
        expect(r.products).toHaveLength(0)
        expect(r.errors).toEqual([expect.stringMatching(new RegExp(`orta basınç tam %${oran}\\) ama pq_curve_kaynak='${k}'`))])
      }
      const dogru = calisPq(`15;D;AVenS;fans;;1;EUR;ok;${egri};turetilmis`)
      expect(dogru.errors).toEqual([])
      expect((dogru.products[0].technical_specs as Record<string, unknown>).pq_curve_kaynak).toBe('turetilmis')
    }
  })

  it('kapı hüküm vermez, etiket ister: desene uymayan QBK eğrisi etiketliyse geçer (gerçeklik Faz 1 kıyasının işi)', () => {
    expect(calisPq(`16;E;AVenS;fans;;1;EUR;ok;${QBK};kitapcik_grafik`).errors).toEqual([])
  })

  it('bozuk eğri yazılmaz: JSON değil, tek nokta, sayı olmayan nokta', () => {
    expect(pqKapisi({ spec_pq_curve: '[[0,1' })).toMatch(/pq_curve JSON değil/)
    expect(pqKapisi({ spec_pq_curve: '[[0,1]]', spec_pq_curve_kaynak: 'turetilmis' })).toMatch(/biçiminde değil/)
    expect(pqKapisi({ spec_pq_curve: '[[0,"a"],[1,2]]', spec_pq_curve_kaynak: 'turetilmis' })).toMatch(/biçiminde değil/)
  })

  it('eğrisiz satıra kapı dokunmaz (kaynak etiketi yalnız eğri varken istenir)', () => {
    const r = calisPq('17;F;AVenS;fans;;1;EUR;ok;;')
    expect(r.errors).toEqual([])
    expect(r.products).toHaveLength(1)
  })

  it('kapı aile kaydından ÖNCE çalışır: reddedilen satır boş aile bırakmaz', () => {
    const r = calisPq(`18;G;AVenS;fans;;1;EUR;ok;${QBK};`)
    expect(r.families.size).toBe(0)
    const kaynak = readFileSync(join(__dirname, '..', 'planla.mjs'), 'utf8')
    expect(kaynak).toMatch(/const pqHata = pqKapisi\(r\)/)
    expect(kaynak.indexOf('pqKapisi(r)')).toBeLessThan(kaynak.indexOf('const fam = families.get'))
  })
})

describe('teknik değer ve sayı ayrıştırma', () => {
  it('sayı sayı olur (eksi dahil), metin metin kalır, boolean boolean', () => {
    expect(specValue('-20')).toBe(-20)
    expect(specValue('1,5')).toBe(1.5)
    expect(specValue('380')).toBe(380)
    expect(specValue('Class II')).toBe('Class II')
    expect(specValue('IE3')).toBe('IE3')
    expect(specValue('230/400')).toBe('230/400')
    expect(specValue('TRUE')).toBe(true)
    expect(num('')).toBeNull()
    expect(num('abc')).toBeNull()
  })
})

describe('load.mjs — yazma yolu sözleşmesi (metin denetimi, sabotaj yönlü)', () => {
  const kaynak = readFileSync(join(__dirname, '..', 'load.mjs'), 'utf8')
  const apply = kaynak.slice(kaynak.indexOf('// ---------- APPLY ----------'))

  it('varsayılan kuru koşum: yazım yalnız --apply bayrağıyla', () => {
    expect(kaynak).toMatch(/const APPLY = process\.argv\.includes\('--apply'\)/)
    expect(kaynak).toMatch(/if \(!APPLY\) \{[^}]*process\.exit/)
  })

  it('hata varken APPLY yok (APPLY bölümünden ÖNCE çıkış)', () => {
    const kapi = kaynak.indexOf("if (errors.length) { console.error('APPLY iptal")
    expect(kapi).toBeGreaterThan(-1)
    expect(kapi).toBeLessThan(kaynak.indexOf('// ---------- APPLY ----------'))
  })

  it('mevcut ürün GÜNCELLENMEZ: products üzerinde tek update image_url, upsert hiç yok', () => {
    expect(apply).toContain('// ---------- APPLY ----------')
    expect(apply).not.toMatch(/\.upsert\s*\(/)
    const guncellemeler = [...apply.matchAll(/from\('products'\)\.update\(\{([^}]*)\}\)/g)].map((m) => m[1].trim())
    expect(guncellemeler).toEqual(['image_url: pub.publicUrl'])
    // mevcut ürün dalı yalnız kimliği alır, yazmaz
    expect(apply).toMatch(/if \(existing\) \{ pid = existing\.id \}/)
  })

  it('planlama kuralları load.mjs içinde kopya tutulmaz (tek kaynak planla.mjs)', () => {
    expect(kaynak).toMatch(/from '\.\/planla\.mjs'/)
    expect(kaynak).not.toMatch(/function parseCsv|function specValue|const BRAND_PREFIX/)
  })
})
