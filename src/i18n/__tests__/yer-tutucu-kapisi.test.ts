/**
 * INV-I18N-YERTUTUCU-1 — sözlükteki her yer tutucuyu DOLDURAN bir çağıran vardır.
 *
 * NİÇİN (URN-82, #1793 okuma hükmü, 2026-10-10): Blog metin tablosu sözlükteki sabit sayıları ve marka adlarını yer
 * tutucuya çevirdi (`{{esik1}}`, `{aile}`, `{marka}` …); tabloyu sözlüğe uygulayan iş çağıranı bağlamadı. Sonuç: ürün
 * sayfasında "Ses seviyesi {{esik1}} dB(A) altında", marka sayfasında "{{ad}}, … {aile} ürün ailesi …" ham şablon olarak
 * görünecekti. Hiçbir test görmedi: sözlük anahtarı vardı, çağıran anahtarı okuyordu, TypeScript bir `string`
 * gördü — "parametre verildi mi" sorusunu soran kapı yoktu. Aynı kapı master'da DA canlı bir kusur buldu:
 * `silentFanWizard.resultNeed` tek süslü `{hacim}` yazıyordu ve bileşen `t(…, { hacim })` veriyordu; çözümleyici
 * tek süslüyü hiç tanımadığı için sihirbaz sonucunda ham "{hacim}" basılıyordu.
 *
 * KURAL: sözlükte bir yer tutucu taşıyan her yaprak için, sözlük yolunu (tam yol) dize olarak yazan bir kaynak
 * dosyada, yolun HEMEN ardındaki pencerede her yer tutucu DOLDURULMALI:
 *  · çift süslü `{{ad}}`: `t('yol', { ad })` / `{ ad: … }` anahtarı, `.replace('{{ad}}', …)`, ya da
 *    `params: SABIT` ve aynı dosyada `SABIT = { ad: … }` (mühendislik eşikleri);
 *  · tek süslü `{ad}`: çözümleyici (`I18nProvider.interpolate`) yalnız ÇİFT süslüyü tanır; tek süslü yalnız
 *    tüketici kendi `.replace('{ad}', …)` çağrısını yazıyorsa dolar → pencerede o literal aranır.
 * Nesne olarak tüketilen (yolu dize olarak yazılmayan) yapraklar için kanıt yaprağın SON parçasıyla aranır.
 *
 * Kapının sınırı (dürüstlük): kanıt PENCEREDİR, tür denetimi değil. Hiçbir çağıranı olmayan (ölü) yer tutucu
 * ekrana çıkamaz; mevcutlar `OKUNMAYAN_BORC`ta adıyla durur ve liste KENDİNİ doğrular (bir anahtar okunmaya
 * başlarsa ya da silinirse satır kırmızı olur, listeden çıkarılır). Yeni okunmayan yer tutucu KIRMIZIDIR.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

const SRC = join(process.cwd(), 'src')

/**
 * Yer tutucusu olup kaynakta HİÇ okunmayan (ölü) anahtarlar — 2026-10-10 ölçümü. Okuyan olmadığı için ham şablon
 * ekrana çıkamaz; silmek i18n-dead-key işidir (kendi borç listesi orada). Satır başına neden yazılıdır.
 */
const OKUNMAYAN_BORC: Record<string, string> = {
  'home.hero.metrics.productSeries': 'ana sayfa hero metrik şeridi kalktı; anahtarı okuyan yok',
  'home.guidedDiscovery.seriesCount': 'GuidedCategoryDiscovery yalnız eyebrow/heading/intro ve cardFallback okur',
  'home.guidedDiscovery.seriesTitle': 'GuidedCategoryDiscovery yalnız eyebrow/heading/intro ve cardFallback okur',
  'auth.callback.verifyError': 'i18n-dead-key listesinde ölü; AuthCallbackPage bu anahtarı okumuyor',
  'category.series.skuLabel': 'i18n-dead-key listesinde ölü; seri sayfası bu etiketi okumuyor',
}

type Yaprak = { yol: string; deger: string }
type Belirtec = { ad: string; tek: boolean }

function yapraklar(dugum: unknown, yol: string, cikti: Yaprak[]): void {
  if (typeof dugum === 'string') {
    cikti.push({ yol, deger: dugum })
  } else if (Array.isArray(dugum)) {
    dugum.forEach((d, i) => yapraklar(d, `${yol}.${i}`, cikti))
  } else if (dugum && typeof dugum === 'object') {
    for (const [k, v] of Object.entries(dugum as Record<string, unknown>)) {
      yapraklar(v, yol ? `${yol}.${k}` : k, cikti)
    }
  }
}

function kaynakDosyalari(klasor: string, cikti: string[] = []): string[] {
  for (const ad of readdirSync(klasor, { withFileTypes: true })) {
    const tam = join(klasor, ad.name)
    const goreli = relative(SRC, tam).split(sep).join('/')
    if (ad.isDirectory()) {
      if (ad.name === '__tests__' || ad.name === 'node_modules' || goreli === 'i18n/dictionaries') continue
      kaynakDosyalari(tam, cikti)
    } else if (/\.(ts|tsx)$/.test(ad.name) && !/\.(test|spec)\.(ts|tsx)$/.test(ad.name) && !ad.name.endsWith('.d.ts')) {
      cikti.push(tam)
    }
  }
  return cikti
}

const KAYNAKLAR = kaynakDosyalari(SRC).map((dosya) => ({
  dosya: relative(SRC, dosya).split(sep).join('/'),
  metin: readFileSync(dosya, 'utf8'),
}))

const TEK = /(?<!\{)\{([A-Za-z_]\w*)\}(?!\})/g
const CIFT = /\{\{\s*(\w+)\s*\}\}/g

function belirtecler(deger: string): Belirtec[] {
  const bulunan = new Map<string, Belirtec>()
  for (const m of deger.matchAll(CIFT)) bulunan.set(`c:${m[1]}`, { ad: m[1] as string, tek: false })
  for (const m of deger.matchAll(TEK)) bulunan.set(`t:${m[1]}`, { ad: m[1] as string, tek: true })
  return [...bulunan.values()]
}

type Pencere = { dosya: string; metin: string; pencere: string }

/** Aramanın kaynakta yazılı olduğu her yerden sonraki pencere. */
function pencereler(arama: string): Pencere[] {
  const sonuc: Pencere[] = []
  for (const { dosya, metin } of KAYNAKLAR) {
    let i = metin.indexOf(arama)
    while (i !== -1) {
      sonuc.push({ dosya, metin, pencere: metin.slice(i, i + 700) })
      i = metin.indexOf(arama, i + arama.length)
    }
  }
  return sonuc
}

/** `params: SABIT` ise aynı dosyada `SABIT = { … ad … }` tanımı adı içeriyor mu? */
function sabitParametreVerir(p: Pencere, ad: string): boolean {
  const m = /\bparams:\s*([A-Za-z_]\w*)\b/.exec(p.pencere)
  if (!m) return false
  const tanim = new RegExp(`\\b${m[1]}\\b[^=\\n]*=\\s*\\{([^}]*)\\}`).exec(p.metin)
  return !!tanim && new RegExp(`\\b${ad}\\b\\s*:`).test(tanim[1] as string)
}

function doldurulmus(p: Pencere, b: Belirtec): boolean {
  if (b.tek) return p.pencere.includes(`'{${b.ad}}'`) || p.pencere.includes(`"{${b.ad}}"`)
  return (
    new RegExp(`\\b${b.ad}\\b\\s*[:,}]`).test(p.pencere) ||
    p.pencere.includes(`{{${b.ad}}}`) ||
    p.pencere.includes(`{{ ${b.ad} }}`) ||
    sabitParametreVerir(p, b.ad)
  )
}

type Karar = { tamam: boolean; neden: string }

function tuketiciKarari(yol: string, gerekli: Belirtec[]): Karar {
  const son = yol.split('.').at(-1) as string
  let referans = 0
  for (const aranan of [yol, son]) {
    const bulunan = pencereler(aranan)
    referans += bulunan.length
    if (bulunan.some((p) => gerekli.every((b) => doldurulmus(p, b)))) return { tamam: true, neden: '' }
    // Tam yol kaynakta yazılıysa son parçaya düşülmez: başka bir anahtarın aynı adı yanlış kanıt olmasın.
    if (aranan === yol && bulunan.length > 0) break
  }
  return {
    tamam: false,
    neden: referans === 0 ? 'kaynakta HİÇ okunmuyor' : 'okunuyor ama yer tutucu doldurulmuyor',
  }
}

const TR_YAPRAKLAR: Yaprak[] = []
const EN_YAPRAKLAR: Yaprak[] = []
yapraklar(tr, '', TR_YAPRAKLAR)
yapraklar(en, '', EN_YAPRAKLAR)

describe('INV-I18N-YERTUTUCU-1: sözlük yer tutucuları', () => {
  it('(1) TR ve EN aynı yaprakta AYNI yer tutucu adlarını taşır', () => {
    const enMap = new Map(EN_YAPRAKLAR.map((y) => [y.yol, y.deger]))
    const ayrik: string[] = []
    for (const y of TR_YAPRAKLAR) {
      const enDeger = enMap.get(y.yol)
      if (enDeger === undefined) continue
      const a = belirtecler(y.deger).map((b) => b.ad).sort().join(',')
      const b = belirtecler(enDeger).map((x) => x.ad).sort().join(',')
      if (a !== b) ayrik.push(`${y.yol}: TR {${a}} ≠ EN {${b}}`)
    }
    expect(ayrik, ayrik.join('\n')).toEqual([])
  })

  it('(2) yer tutucu taşıyan her yaprağın bir çağıranı onları DOLDURUR (ham şablon basılamaz)', () => {
    const kirmizi: string[] = []
    for (const y of [...TR_YAPRAKLAR, ...EN_YAPRAKLAR]) {
      const gerekli = belirtecler(y.deger)
      if (gerekli.length === 0 || y.yol in OKUNMAYAN_BORC) continue
      const { tamam, neden } = tuketiciKarari(y.yol, gerekli)
      if (!tamam) {
        const adlari = gerekli.map((b) => (b.tek ? `{${b.ad}}` : `{{${b.ad}}}`)).join(' ')
        kirmizi.push(`${y.yol} ${adlari} — ${neden}`)
      }
    }
    const tekil = [...new Set(kirmizi)]
    expect(tekil, `ham yer tutucu basılabilir:\n${tekil.join('\n')}`).toEqual([])
  })

  it('(3) OKUNMAYAN_BORC kendini doğrular: listedeki her anahtar sözlükte VAR ve hâlâ okunmuyor', () => {
    const trMap = new Map(TR_YAPRAKLAR.map((y) => [y.yol, y.deger]))
    const bayat: string[] = []
    for (const yol of Object.keys(OKUNMAYAN_BORC)) {
      const deger = trMap.get(yol)
      if (deger === undefined) {
        bayat.push(`${yol}: sözlükte yok — listeden çıkar`)
        continue
      }
      if (belirtecler(deger).length === 0) {
        bayat.push(`${yol}: artık yer tutucu taşımıyor — listeden çıkar`)
        continue
      }
      if (pencereler(yol).length > 0) bayat.push(`${yol}: kaynakta okunuyor — listeden çıkar, kural (2) yönetir`)
    }
    expect(bayat, bayat.join('\n')).toEqual([])
  })
})
