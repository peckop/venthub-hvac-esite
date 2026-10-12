// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

/**
 * INV-HAKKIMIZDA-SAYAC-1 — Hakkımızda sayfasındaki marka / aktif ürün / aile sayıları CANLI veriden gelir (URN-75).
 *
 * KORUDUĞU KUSUR: sayfa dört sayıyı elle yazıyordu (6, 50+, 81, 15+). "81 il" dayanaksız bir sevkiyat vaadiydi
 * (karar 295) ve elle yazılan sayı ürün eklendikçe sessizce yanlışlaşır. Ayrıca sayfa DB'den sayı basmaya başlayınca
 * "tam statik" sınıfından çıkar: tazeleme sözleşmesi (rendering-cache-standard §3) kurulmadan sayı bayat kalırdı.
 *
 * KAPI: (1) elle yazılmış sayaç değeri yok (URN-82 ile `15+` deneyim sayacı da kalktı: İSTİSNA YOK), (2) her kartın
 * ETİKET anahtarı ile DEĞER kaynağı çifti sabit (anahtar-kart kayması kolu, aşağıda), (3) rota ISR ilan eder ve sayacı
 * önbellekli sarmaldan okur, (4) sarmal anahtarı `lang` + `tenantId`, etiketi keşif etiketi (kural 12), (5) webhook
 * `products` / `product_families` / `brands` dallarında keşif etiketini tazeler ve ürün için duyarlı alanlar
 * `status` / `family_id` / `deleted_at`'i içerir, (6) hata sayfayı çökertmez: sayaç `null`, kartlar çizilmez.
 * NE ÖLÇMEZ: canlıda bir ürün değişince sayfanın gerçekten yenilendiği (render cetveli §1.1: canlıda ayrıca ölçülür).
 *
 * ANAHTAR-KART KAYMASI (URN-82 yenileme, 2026-10-10): URN-75 sayaç kartlarını canlı veriye bağlarken URN-82 aynı
 * sözlük bloğunun anahtarlarını yeniden düzenledi (`experience` ← "Ürünü Olan Marka", `distributorship` ← "Ürün
 * Ailesi" …). Metin birleşmesi çakışma görmeden ya da yanlış çözülerek geçerse sayfa, "Ürün Ailesi" etiketinin altında
 * MARKA sayısını basar: derleyici, sözlük eşliği ve eski kapı bunu görmez (metin var, iki dilde dolu, sayı canlı,
 * yalnız yanlış etiketin altında). Bu yüzden iki şey sabitlenir: kartın etiket anahtarı hangi `sayaclar.<alan>` değerini
 * basıyor (kod) ve o anahtarın TR/EN metni hangi sayıyı anlatıyor (sözlük).
 */
const KOK = path.resolve(__dirname, '../../..')
const oku = (yol: string) => fs.readFileSync(path.join(KOK, yol), 'utf8')

/** `stats` kartlarından biri: kaynak metinden AST ile çıkarılır (regex değil: dizi biçimi değişince susmaz). */
interface SayacKarti {
  /** `value: …` ifadesinin kaynak metni. */
  deger: string
  /** `value` düz metin ya da sayı sabitiyse o sabit (ELLE YAZILMIŞ sayaç); değilse null. */
  elleYazilmis: string | null
  /** `value` ifadesinin okuduğu `sayaclar.<alan>`; yoksa null. */
  degerKaynagi: string | null
  /** `label: t('<anahtar>')` çağrısının sözlük anahtarı; yoksa null. */
  etiketAnahtari: string | null
}

/** `const stats = …` bildiriminin içindeki `{ value, label }` nesneleri. `null`: `stats` bildirimi yok. */
function sayacKartlari(kaynak: string): SayacKarti[] | null {
  const sf = ts.createSourceFile('AboutPage.tsx', kaynak, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const bildirimler: ts.VariableDeclaration[] = []
  const bul = (n: ts.Node): void => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === 'stats' && n.initializer) bildirimler.push(n)
    ts.forEachChild(n, bul)
  }
  bul(sf)
  const bildirim = bildirimler[0]
  if (!bildirim?.initializer) return null

  const kartlar: SayacKarti[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isObjectLiteralExpression(n)) {
      const ozellik = (ad: string): ts.Expression | undefined => {
        const p = n.properties.find((o): o is ts.PropertyAssignment => ts.isPropertyAssignment(o) && o.name.getText() === ad)
        return p?.initializer
      }
      const deger = ozellik('value')
      const etiket = ozellik('label')
      if (deger && etiket) {
        const sabit =
          ts.isStringLiteral(deger) || ts.isNoSubstitutionTemplateLiteral(deger) || ts.isNumericLiteral(deger) ? deger.text : null
        const kaynakAlani = deger.getText().match(/\bsayaclar\.(\w+)/)
        const etiketAnahtari =
          ts.isCallExpression(etiket) &&
          ts.isIdentifier(etiket.expression) &&
          etiket.expression.text === 't' &&
          etiket.arguments[0] !== undefined &&
          ts.isStringLiteral(etiket.arguments[0])
            ? etiket.arguments[0].text
            : null
        kartlar.push({ deger: deger.getText(), elleYazilmis: sabit, degerKaynagi: kaynakAlani ? kaynakAlani[1] : null, etiketAnahtari })
      }
    }
    ts.forEachChild(n, gez)
  }
  gez(bildirim.initializer)
  return kartlar
}

/** `stats` kartlarında elle yazılmış sayı değerleri; `15+` DAHİL hepsi ihlaldir (saf: sentetik girdiyle sınanır). */
function elleYazilmisSayaclar(kaynak: string): string[] {
  const kartlar = sayacKartlari(kaynak)
  if (kartlar === null) return ['stats bloğu bulunamadı']
  return kartlar.flatMap((k) => (k.elleYazilmis === null ? [] : [k.elleYazilmis]))
}

type Dil = 'tr' | 'en'
interface EtiketAnlami {
  /** Metin bunlardan EN AZ BİRİNİ içermeli (küçük harf, dile göre). */
  icerir: readonly string[]
  /** Metin bunların HİÇBİRİNİ içermemeli: başka sayacın adı bu etiketin altında durmasın. */
  icermez: readonly string[]
}

/**
 * KART EŞLEMESİ: etiket sözlük anahtarı → basılan değerin kaynağı (`SiteSayaclari` alanı) ve etiket metninin anlamı.
 * Sıra sabit DEĞİL (kart sırası tasarım kararı); sabit olan ÇİFTTİR. Yeni sayaç kartı eklemek bu tabloya satır
 * eklemektir: eşlemesi yazılmayan kart kırmızı verir.
 */
const KART_ESLEMESI: Readonly<Record<string, { deger: string; anlam: Record<Dil, EtiketAnlami> }>> = {
  // `distributorship` ve `completedProject` TARİHSEL anahtar adlarıdır (bayilik / proje DEĞİL): değerleri marka ve model sayısı.
  'aboutPage.distributorship': {
    deger: 'markaSayisi',
    anlam: {
      tr: { icerir: ['marka'], icermez: ['aile', 'model'] },
      en: { icerir: ['brand'], icermez: ['famil', 'model'] },
    },
  },
  'aboutPage.completedProject': {
    deger: 'aktifUrunSayisi',
    anlam: {
      tr: { icerir: ['model', 'ürün'], icermez: ['aile', 'marka'] },
      en: { icerir: ['model', 'product'], icermez: ['famil', 'brand'] },
    },
  },
  'aboutPage.productFamilies': {
    deger: 'aileSayisi',
    anlam: {
      tr: { icerir: ['aile'], icermez: ['marka', 'model'] },
      en: { icerir: ['famil'], icermez: ['brand', 'model'] },
    },
  },
}

/** Kaynaktaki kartların etiket↔değer çifti sabit tablodan sapıyorsa ihlal listesi (saf). */
function eslemeIhlalleri(kaynak: string): string[] {
  const kartlar = sayacKartlari(kaynak)
  if (kartlar === null) return ['stats bloğu bulunamadı']
  const ihlal: string[] = []
  const gorulen = new Set<string>()
  for (const kart of kartlar) {
    const anahtar = kart.etiketAnahtari
    if (anahtar === null) {
      ihlal.push(`etiketi \`t('…')\` çağrısı olmayan kart: ${kart.deger}`)
      continue
    }
    const beklenen = KART_ESLEMESI[anahtar]
    if (!beklenen) {
      ihlal.push(`${anahtar}: eşleme tablosunda YOK (deger ${kart.deger}); yeni kart ya da silinmesi gereken eski kart (ör. aboutPage.experience)`)
      continue
    }
    if (gorulen.has(anahtar)) ihlal.push(`${anahtar}: birden çok kartta kullanılıyor`)
    gorulen.add(anahtar)
    if (kart.degerKaynagi !== beklenen.deger) {
      ihlal.push(`${anahtar} etiketinin altında sayaclar.${kart.degerKaynagi ?? '(sayaclar dışı değer)'} basılıyor; beklenen sayaclar.${beklenen.deger}`)
    }
  }
  for (const anahtar of Object.keys(KART_ESLEMESI)) {
    if (!gorulen.has(anahtar)) ihlal.push(`${anahtar}: kart yok (sayaç kalkmış ya da etiketi değişmiş)`)
  }
  return ihlal
}

/** Sözlükteki etiket metinleri bağlı oldukları sayıyı anlatıyor mu: ihlal listesi (saf; sözlük girdi olarak verilir). */
function etiketAnlamIhlalleri(dil: Dil, metinler: Readonly<Record<string, string | undefined>>): string[] {
  const yerel = dil === 'tr' ? 'tr-TR' : 'en-US'
  const ihlal: string[] = []
  for (const [anahtar, beklenen] of Object.entries(KART_ESLEMESI)) {
    const metin = metinler[anahtar]
    if (typeof metin !== 'string' || metin.trim() === '') {
      ihlal.push(`${dil} ${anahtar}: etiket metni yok ya da boş`)
      continue
    }
    const kucuk = metin.toLocaleLowerCase(yerel)
    const anlam = beklenen.anlam[dil]
    if (!anlam.icerir.some((s) => kucuk.includes(s))) {
      ihlal.push(`${dil} ${anahtar} = "${metin}": bağlı olduğu sayıyı (sayaclar.${beklenen.deger}) anlatmıyor (aranan: ${anlam.icerir.join(' | ')})`)
    }
    const yanlis = anlam.icermez.filter((s) => kucuk.includes(s))
    if (yanlis.length > 0) {
      ihlal.push(`${dil} ${anahtar} = "${metin}": başka sayacın adını taşıyor (${yanlis.join(', ')}); sayaclar.${beklenen.deger} bu etiketin altında yanlış anlaşılır`)
    }
  }
  return ihlal
}

/** Noktalı sözlük yolunu çözer (yol yoksa `undefined`; ham anahtar döndürülmez). */
function cozumle(sozluk: unknown, yol: string): string | undefined {
  let gecerli: unknown = sozluk
  for (const parca of yol.split('.')) {
    if (gecerli === null || typeof gecerli !== 'object') return undefined
    gecerli = (gecerli as Record<string, unknown>)[parca]
  }
  return typeof gecerli === 'string' ? gecerli : undefined
}

const SENTETIK_IYI = `const stats = sayaclar
    ? [
        { value: String(sayaclar.markaSayisi), label: t('aboutPage.distributorship'), icon: Award },
        { value: String(sayaclar.aktifUrunSayisi), label: t('aboutPage.completedProject'), icon: Factory },
        { value: String(sayaclar.aileSayisi), label: t('aboutPage.productFamilies'), icon: Layers }
      ]
    : []`

describe('INV-HAKKIMIZDA-SAYAC-1', () => {
  describe('elle yazılmış sayaç dedektörü (sentetik)', () => {
    it('eski dört sayıyı yakalar: `15+` DAHİL', () => {
      const eski = `const stats = [
    { value: '15+', label: t('a'), icon: Zap },
    { value: '6', label: t('b'), icon: Award },
    { value: '50+', label: t('c'), icon: Factory },
    { value: '81', label: t('d'), icon: Globe }
  ]`
      expect(elleYazilmisSayaclar(eski)).toEqual(['15+', '6', '50+', '81'])
    })

    it('canlı veriden gelen değere izin verir', () => {
      expect(elleYazilmisSayaclar(SENTETIK_IYI)).toEqual([])
      const yeni = `const stats = [
    ...(sayaclar ? [{ value: String(sayaclar.markaSayisi), label: t('b'), icon: Award }] : [])
  ]`
      expect(elleYazilmisSayaclar(yeni)).toEqual([])
    })

    it('çift tırnak, şablon dizesi ve sayı sabitiyle yazılan sayıyı da yakalar', () => {
      expect(elleYazilmisSayaclar(`const stats = [\n    { value: "81", label: x },\n    { value: \`441\`, label: y },\n    { value: 15, label: z }\n  ]`)).toEqual(['81', '441', '15'])
    })

    it('stats bloğu yoksa susmaz', () => {
      expect(elleYazilmisSayaclar('const baska = 1')).toEqual(['stats bloğu bulunamadı'])
    })
  })

  describe('anahtar-kart eşlemesi kolu (sentetik: kayma YAKALANIR)', () => {
    it('doğru eşleme temiz', () => {
      expect(eslemeIhlalleri(SENTETIK_IYI)).toEqual([])
    })

    it('değerler yer değiştirirse (distributorship etiketinin altında aile sayısı) kırmızı', () => {
      const kaymis = SENTETIK_IYI.replace('sayaclar.markaSayisi', 'TMP').replace('sayaclar.aileSayisi', 'sayaclar.markaSayisi').replace('TMP', 'sayaclar.aileSayisi')
      const ihlal = eslemeIhlalleri(kaymis)
      expect(ihlal).toHaveLength(2)
      expect(ihlal.join('\n')).toContain('aboutPage.distributorship etiketinin altında sayaclar.aileSayisi basılıyor; beklenen sayaclar.markaSayisi')
      expect(ihlal.join('\n')).toContain('aboutPage.productFamilies etiketinin altında sayaclar.markaSayisi basılıyor; beklenen sayaclar.aileSayisi')
    })

    it('etiket anahtarları yer değiştirirse (completedProject etiketi marka sayısının üstünde) kırmızı', () => {
      const kaymis = SENTETIK_IYI.replace("t('aboutPage.distributorship')", 'TMP').replace("t('aboutPage.completedProject')", "t('aboutPage.distributorship')").replace('TMP', "t('aboutPage.completedProject')")
      expect(eslemeIhlalleri(kaymis).length).toBeGreaterThanOrEqual(2)
    })

    it('eski `experience` kartı ya da tabloda olmayan etiket kırmızı', () => {
      const eski = SENTETIK_IYI.replace('? [', "? [\n        { value: String(sayaclar.markaSayisi), label: t('aboutPage.experience'), icon: Zap },")
      expect(eslemeIhlalleri(eski).join('\n')).toContain('aboutPage.experience: eşleme tablosunda YOK')
    })

    it('kart eksikse kırmızı', () => {
      const eksik = SENTETIK_IYI.replace(/\n\s*\{ value: String\(sayaclar\.aileSayisi\)[^\n]*\n/, '\n')
      expect(eslemeIhlalleri(eksik).join('\n')).toContain('aboutPage.productFamilies: kart yok')
    })

    it('sözlük metni kayarsa kırmızı: "Ürün Ailesi" etiketi marka sayısının üstünde (URN-82 ham dalındaki kayma)', () => {
      const kaymis = {
        'aboutPage.distributorship': 'Ürün Ailesi',
        'aboutPage.completedProject': 'Aktif Model',
        'aboutPage.productFamilies': 'Ürün Seçici Aracı',
      }
      const ihlal = etiketAnlamIhlalleri('tr', kaymis)
      expect(ihlal.some((s) => s.includes('aboutPage.distributorship') && s.includes('anlatmıyor'))).toBe(true)
      expect(ihlal.some((s) => s.includes('aboutPage.distributorship') && s.includes('başka sayacın adını'))).toBe(true)
      expect(ihlal.some((s) => s.includes('aboutPage.productFamilies') && s.includes('anlatmıyor'))).toBe(true)
    })

    it('doğru sözlük metinleri temiz (TR ve EN)', () => {
      expect(
        etiketAnlamIhlalleri('tr', { 'aboutPage.distributorship': 'Ürünü Olan Marka', 'aboutPage.completedProject': 'Aktif Model', 'aboutPage.productFamilies': 'Ürün Ailesi' }),
      ).toEqual([])
      expect(
        etiketAnlamIhlalleri('en', { 'aboutPage.distributorship': 'Brands with Products', 'aboutPage.completedProject': 'Active Models', 'aboutPage.productFamilies': 'Product Families' }),
      ).toEqual([])
    })

    it('etiket metni yoksa susmaz', () => {
      expect(etiketAnlamIhlalleri('tr', {}).length).toBe(Object.keys(KART_ESLEMESI).length)
    })
  })

  it('AboutPage sayaçları elle yazmaz ve sayıyı `sayaclar` prop`undan alır', () => {
    const kaynak = oku('src/views/AboutPage.tsx')
    expect(elleYazilmisSayaclar(kaynak), 'AboutPage stats içinde elle yazılmış sayı var').toEqual([])
    for (const alan of ['markaSayisi', 'aktifUrunSayisi', 'aileSayisi']) {
      expect(kaynak, `${alan} sayfada kullanılmıyor`).toContain(`sayaclar.${alan}`)
    }
  })

  it('ANAHTAR-KART: her sayaç kartının etiket anahtarı bağlandığı değer kaynağıyla sabit çiftte; eski kart ve fazla kart yok', () => {
    const kartlar = sayacKartlari(oku('src/views/AboutPage.tsx'))
    // BOŞ EVREN MUHAFIZI: AST aradığı kartı bulamazsa ihlal listesi boş kalır ve kapı sahte-yeşil verirdi.
    expect(kartlar, 'stats bildirimi bulunamadı — ayrıştırıcı kör').not.toBeNull()
    expect(kartlar!.length, 'sayaç kartı sayısı değişti: eşleme tablosunu bilinçle güncelle').toBe(Object.keys(KART_ESLEMESI).length)
    expect(eslemeIhlalleri(oku('src/views/AboutPage.tsx'))).toEqual([])
  })

  it.each([
    ['tr', tr],
    ['en', en],
  ] as const)('ANAHTAR-KART: %s sözlüğünde her sayaç etiketi bağlı olduğu sayıyı anlatır; deneyim etiketi ve sevkiyat anahtarı yok', (dil, sozluk) => {
    const metinler: Record<string, string | undefined> = {}
    for (const anahtar of Object.keys(KART_ESLEMESI)) metinler[anahtar] = cozumle(sozluk, anahtar)
    expect(etiketAnlamIhlalleri(dil, metinler)).toEqual([])
    const sayfa = (sozluk as Record<string, unknown>).aboutPage as Record<string, unknown>
    expect(Object.keys(sayfa), `${dil}: aboutPage.experience geri gelmiş (deneyim yılı sayacı kayıtsız)`).not.toContain('experience')
    expect(Object.keys(sayfa), `${dil}: aboutPage.shippingNetwork geri gelmiş (il sevkiyat vaadi)`).not.toContain('shippingNetwork')
  })

  it('ızgara kart sayısına bağlı: kart yoksa bölüm çizilmez, üç kartın sütun sınıfı tabloda var', () => {
    const kaynak = oku('src/views/AboutPage.tsx')
    expect(kaynak, 'stats boşken bölüm yine çiziliyor (boş gri şerit)').toMatch(/\{stats\.length > 0 && \(/)
    expect(kaynak, 'ızgara sütunu kart sayısından türemiyor').toMatch(/STAT_SUTUNLARI\[stats\.length\]/)
    const uc = kaynak.match(/\n\s*3:\s*'([^']*)'/)
    expect(uc, 'STAT_SUTUNLARI tablosunda 3 kartlık satır yok').not.toBeNull()
    expect(uc![1]).toContain('grid-cols-3')
  })

  it('rota ISR ilan eder ve sayacı önbellekli sarmaldan okur', () => {
    const rota = oku('src/app/[lang]/about/page.tsx')
    expect(rota).toMatch(/export const dynamic = 'force-static'/)
    expect(rota).toMatch(/export const revalidate = 3600/)
    expect(rota).toMatch(/siteSayaclariOku\(lang, DEFAULT_TENANT_ID\)/)
    expect(rota).toMatch(/<PageComponent lang=\{lang\} sayaclar=\{sayaclar\} \/>/)
  })

  it('sarmal anahtarı lang + tenantId, etiketi keşif etiketi; hata önbelleğe yazılmaz, sayfaya null döner', () => {
    const sarmal = oku('src/app/_components/siteSayaclari.ts')
    expect(sarmal).toMatch(/\['site-sayaclari', lang, tenantId\]/)
    expect(sarmal).toMatch(/tags: \[PRODUCTS_DISCOVERY_TAG, discoveryTag\(tenantId\)\]/)
    expect(sarmal).toMatch(/revalidate: 3600/)
    expect(sarmal).toMatch(/catch \(hata\)[\s\S]*return null/)
    expect(oku('src/lib/services/siteSayaclari.service.ts')).toMatch(/if \(error\) throw error/)
  })

  it('TAZELEME: sayının dayandığı üç tablo keşif etiketini tazeler', () => {
    const rota = oku('src/app/api/webhook/supabase/route.ts')
    const dal = (bas: string) => {
      const i = rota.indexOf(bas)
      expect(i, `${bas} dalı bulunamadı`).toBeGreaterThan(-1)
      const j = rota.slice(i + bas.length).search(/\n\s*else if \(table ===/)
      return rota.slice(i, j === -1 ? undefined : i + bas.length + j)
    }
    expect(dal("if (table === 'products') {")).toMatch(/revalidateTag\(PRODUCTS_DISCOVERY_TAG\)|shouldRevalidateDiscovery/)
    expect(dal("else if (table === 'product_families') {")).toMatch(/revalidateTag\(PRODUCTS_DISCOVERY_TAG\)/)
    expect(dal("else if (table === 'brands') {")).toMatch(/revalidateTag\(PRODUCTS_DISCOVERY_TAG\)/)
    const duyarli = rota.match(/PRODUCT_DISCOVERY_SENSITIVE_FIELDS = \[([\s\S]*?)\] as const/)![1]
    for (const alan of ['status', 'family_id', 'deleted_at']) {
      expect(duyarli, `${alan} değişince keşif etiketi tazelenmiyor: sayaç bayat kalır`).toContain(`'${alan}'`)
    }
  })

  it('sözlük: aile etiketi iki dilde var, "il sevkiyat" vaadi anahtarı kalktı', () => {
    for (const dosya of ['src/i18n/dictionaries/tr.ts', 'src/i18n/dictionaries/en.ts']) {
      const kaynak = oku(dosya)
      expect(kaynak, `${dosya}: productFamilies yok`).toMatch(/productFamilies:\s*'[^']+'/)
      expect(kaynak, `${dosya}: shippingNetwork geri geldi`).not.toMatch(/shippingNetwork:/)
    }
  })
})
