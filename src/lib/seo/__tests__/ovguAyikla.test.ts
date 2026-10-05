import { describe, expect, it } from 'vitest'

import { cumleleriAyir, ovguCumleleriniAt, ovguVarMi } from '../ovguAyikla'

/**
 * INV-OVGU-AYIKLA-1 — arama sonucu açıklamasına üreticinin kanıtsız üstünlük iddiası giremez (REC-497,
 * çürütücü bulgusu 10). Örnekler `src/data/brands.ts` kayıtlarından ve canlı ölçümden BİREBİR alındı;
 * kalıp körleşirse (regex bozulur ya da gevşerse) bu test kırılır.
 */

const UST_IDDIALAR = [
  '1954 yılından bu yana havalandırma teknolojilerinde dünya lideri.',
  'A world leader in ventilation technology since 1954.',
  'İtalyan tasarımı ve ileri mühendislik çözümleriyle konut, ticari ve endüstriyel iklimlendirmede standartları belirliyor.',
  'Italian design and advanced engineering set the standard across residential, commercial and industrial air treatment.',
  'Alman mühendisliği ve İtalyan tasarımının birleşimiyle, endüstriyel santrifüj fanlarda dünyanın en geniş ve teknolojik ürün gamına sahip üreticisi.',
  "German engineering combined with Italian design, offering one of the world's broadest and most advanced ranges of industrial centrifugal fans.",
  "Danfoss Drives 1968'den bu yana frekans konvertörlerinin (değişken frekanslı sürücüler) öncüsüdür; enerji tüketimini %80'e varan oranda azaltır.",
  'Danfoss Drives has pioneered variable-frequency drives since 1968, matching motor speed to demand.',
  'En kaliteli ve ekonomik havalandırma ürünlerini keşfedin.',
  'Highest quality and most economical products with competitive pricing.',
]

const DOGRULANABILIR = [
  "1933'te Danimarka'da kurulan bir aile şirketi.",
  'A family-owned company founded in Denmark in 1933.',
  'Yüksek performanslı endüstriyel havalandırma ve klima santralleri çözümleri.',
  'High-performance industrial ventilation and air handling unit solutions.',
  "Polipropilen (PP) santrifüj fanlarıyla laboratuvar, kimya ve ilaç sanayi, yüzme havuzu ve ATEX ortamlarında çözümler sunar.",
  'Its polypropylene (PP) centrifugal fans provide long-lasting extraction for laboratories and swimming pools.',
]

describe('ovguVarMi', () => {
  it.each(UST_IDDIALAR)('üstünlük iddiasını yakalar: %s', (cumle) => {
    expect(ovguVarMi(cumle)).toBe(true)
  })

  it.each(DOGRULANABILIR)('doğrulanabilir cümleye dokunmaz: %s', (cumle) => {
    expect(ovguVarMi(cumle)).toBe(false)
  })
})

/** Çürütücü bulgusu 3: kalıp bunları kaçırıyordu (hepsi üreticinin kanıtsız üstünlük iddiası). */
const KACAN_IDDIALAR = [
  'Pazarın önde gelen markası.',
  'Leading manufacturer of fans.',
  'Industry-leading efficiency.',
  'Number one in Europe.',
  'Avrupanın bir numaralı markası.',
  'Unmatched performance.',
  'Eşsiz performans.',
  'Rakipsiz verim.',
  'Most efficient fans.',
  'En verimli fan.',
  'Superior quality.',
  'Üstün kalite.',
  'En yüksek verim.',
  'SEKTÖRÜN LİDERİ',
  'EN KALİTELİ ÜRÜN',
  'ÖNCÜ MARKA',
  'SEKTÖRÜN LIDERI',
]

describe('ovguVarMi · kaçırılan iddialar ve büyük harf', () => {
  it.each(KACAN_IDDIALAR)('yakalar: %s', (cumle) => {
    expect(ovguVarMi(cumle)).toBe(true)
  })
})

describe('ovguCumleleriniAt', () => {
  it('yalnız iddia cümlelerini atar, kalanı aynen korur (Danfoss TR)', () => {
    const kayit =
      "1933'te Danimarka'da kurulan bir aile şirketi. Danfoss Drives 1968'den bu yana frekans konvertörlerinin öncüsüdür; enerji tüketimini %80'e varan oranda azaltır."
    expect(ovguCumleleriniAt(kayit)).toBe("1933'te Danimarka'da kurulan bir aile şirketi.")
  })

  it('iki cümle de iddiaysa boş döner (Vortice TR); uydurma metin üretmez', () => {
    expect(ovguCumleleriniAt(`${UST_IDDIALAR[0]} ${UST_IDDIALAR[2]}`)).toBe('')
    expect(ovguCumleleriniAt(`${UST_IDDIALAR[1]} ${UST_IDDIALAR[3]}`)).toBe('')
  })

  it('iddia içermeyen metne dokunmaz', () => {
    const avens = `${DOGRULANABILIR[2]} Modern mühendislik yaklaşımlarıyla enerji verimliliği odaklı sistemler geliştirir.`
    expect(ovguCumleleriniAt(avens)).toBe(avens)
  })

  it('boş, null ve undefined için boş döner', () => {
    expect(ovguCumleleriniAt('')).toBe('')
    expect(ovguCumleleriniAt(null)).toBe('')
    expect(ovguCumleleriniAt(undefined)).toBe('')
  })
})

describe('cumleleriAyir · kırpıcıyla ortak cümle sınırı', () => {
  it('kısaltma sonrası bölmez (Dr., No., Ltd. Şti.)', () => {
    expect(cumleleriAyir('Kurucu Dr. Ali Yılmaz en iyi mühendistir.')).toEqual(['Kurucu Dr. Ali Yılmaz en iyi mühendistir.'])
    expect(cumleleriAyir('Model No. 5 en geniş gamdır.')).toEqual(['Model No. 5 en geniş gamdır.'])
    expect(cumleleriAyir('Üretim Ltd. Şti. 2010 yılında kuruldu, dünya lideridir.')).toEqual([
      'Üretim Ltd. Şti. 2010 yılında kuruldu, dünya lideridir.',
    ])
  })

  it('kapatan tırnak cümleyle kalır, sonraki cümle ayrılır', () => {
    expect(cumleleriAyir('Fan "sessizdir." Dünya lideri bu.')).toEqual(['Fan "sessizdir."', 'Dünya lideri bu.'])
  })

  it('kısaltmayla bölünen yetim parça açıklamaya girmez (iddia cümlesi bütün atılır)', () => {
    expect(ovguCumleleriniAt('Kurucu Dr. Ali Yılmaz en iyi mühendistir.')).toBe('')
    expect(ovguCumleleriniAt('Model No. 5 en geniş gamdır. Kuruluş 1933.')).toBe('Kuruluş 1933.')
  })
})

describe('cumleleriAyir', () => {
  it('kısaltma ve ondalık sayıyı bölmez, cümle başı büyük harf/rakamla ayırır', () => {
    expect(cumleleriAyir('Hava debisi 3.5 m/s olur. 500 mm çap gerekir.')).toEqual([
      'Hava debisi 3.5 m/s olur.',
      '500 mm çap gerekir.',
    ])
  })
})
