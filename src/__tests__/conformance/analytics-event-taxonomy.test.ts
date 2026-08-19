import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ANALYTICS-1 — `trackEvent()` ile ateşlenen her olay adı, cetvelin olay taksonomisi
 * tablosunda YAZILI olmak zorundadır; tabloda yazan ama koda henüz bağlanmamış olaylar da
 * adıyla sayılır ve o liste yalnızca KISALIR.
 *
 * NİÇİN VAR (T021-VH · 2026-08-19)
 *
 * `analytics-standard.md` on olayla bir ticaret hunisi tanımlıyor (view_item → add_to_cart →
 * begin_checkout → purchase …) ve DoD'sinde "huni olayları akıyor" diye bir kutu taşıyor.
 * Ölçüm: kodda `trackEvent()` çağrı yeri ÜÇ tane ve üçü de gezinme/içerik olayı —
 * `nav_click` (x2) ve `case_study_click`. Hunideki on olayın hiçbiri bağlı değil.
 *
 * Üstelik ateşlenen iki ad, cetvelin kendi tablosunda YAZMIYORDU: tablo yazıldığı günden beri
 * kodun gerisindeydi ve bunu gören bir bekçi yoktu. İki yönlü kayma budur ve bu kapı ikisini de
 * kapatır:
 *
 *   R1  koddan cetvele  — ateşlenen ad tabloda yoksa kırmızı (yeni ad sessizce doğamaz),
 *   R2  cetvelden koda  — bağlanmamış olaylar listesi bir GERİ SAYIM; bir olay koda bağlanınca
 *                         listeden düşürülmek zorunda, yoksa kırmızı (liste yalanlaşamaz).
 *
 * NİÇİN ÖNEMLİ: GA4 kimliği env'e konulduğu gün ölçüm "açılmış" olur ama GA4'e yalnızca menü
 * tıklamaları akar. Boş huni, "satış yok"tan ayırt edilemez — kurulu görünen, hiçbir ticari
 * soruya cevap vermeyen bir ölçüm. Kapı, kutunun listeden önce işaretlenmesini imkânsız kılar.
 *
 * KAPININ GÖREMEDİĞİ (dürüst sınır): tarama STATİKTİR ve yalnız DÜZ METİN olay adını görür.
 * Bu yüzden R3, `trackEvent()` çağrısının ilk argümanının değişken olmasını da yasaklar —
 * yoksa tek bir `trackEvent(ad, …)` satırı tarayıcıyı topluca kör ederdi.
 *
 * Cetvel: docs/standards/analytics-standard.md
 * Ölçüm:  docs/audits/t021-analytics-coverage-2026-08-19.md
 */

const KOK = path.resolve(__dirname, '../../..')
const SRC = path.join(KOK, 'src')
const CETVEL = path.join(KOK, 'docs/standards/analytics-standard.md')

/**
 * Cetvelde YAZILI ama koda HENÜZ BAĞLANMAMIŞ olaylar — geri sayım listesi.
 * Bir olay koda bağlandığında bu listeden DÜŞÜRÜLÜR (R2 aksi hâlde kırmızı verir).
 * Liste boşaldığında cetvelin DoD kutusu işaretlenebilir. Liste UZAMAZ: yeni bir olay
 * eklemek, onu bağlamadan buraya yazmak demek değildir — tabloya eklenen olay ya bağlanır
 * ya da buraya gerekçesiyle girer ve PR'da görünür.
 */
const HENUZ_BAGLI_DEGIL = [
  'view_item',
  'view_item_list',
  'add_to_cart',
  'remove_from_cart',
  'begin_checkout',
  'purchase',
  'search',
  'calculator_used',
  'lead_submit',
  'whatsapp_click',
] as const

/** Tarama dışı: motorun kendisi ve testler (orada olay adı geçmesi doğaldır). */
const HARIC = [
  'src/utils/analytics.ts',
  'src/__tests__/',
  '__tests__/',
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
]

function kaynakDosyalari(): Array<{ rel: string; icerik: string }> {
  const cikti: Array<{ rel: string; icerik: string }> = []
  const uzanti = /\.(ts|tsx)$/
  const gez = (dizin: string) => {
    for (const girdi of readdirSync(dizin, { withFileTypes: true })) {
      const tam = path.join(dizin, girdi.name)
      if (girdi.isDirectory()) {
        gez(tam)
        continue
      }
      if (!uzanti.test(girdi.name)) continue
      const rel = path.relative(KOK, tam).replace(/\\/g, '/')
      if (HARIC.some((h) => rel.includes(h))) continue
      cikti.push({ rel, icerik: readFileSync(tam, 'utf8') })
    }
  }
  gez(SRC)
  return cikti
}

/** JS/TS yorumlarını sil. Depo CRLF; satır sonu için [^\r\n] şart. URL'deki // yenmesin. */
function yorumsuz(kod: string): string {
  return kod.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(?<!:)\/\/[^\r\n]*/g, ' ')
}

const CAGRI_RE = /\btrackEvent\s*\(\s*(['"`])([^'"`]*)\1/g
const CAGRI_HERHANGI_RE = /\btrackEvent\s*\(/g

function atesenenOlaylar(): Array<{ rel: string; ad: string }> {
  const cikti: Array<{ rel: string; ad: string }> = []
  for (const d of kaynakDosyalari()) {
    const govde = yorumsuz(d.icerik)
    for (const m of govde.matchAll(CAGRI_RE)) cikti.push({ rel: d.rel, ad: m[2] })
  }
  return cikti
}

/** Cetvelin taksonomi tablosunda geçen tüm olay adları (kod-işareti içindeki snake_case). */
function cetveldekiOlaylar(): Set<string> {
  const metin = readFileSync(CETVEL, 'utf8')
  const tabloBas = metin.indexOf('## Olay taksonomisi')
  const tabloSon = metin.indexOf('## Dönüşümler')
  const tablo = metin.slice(tabloBas, tabloSon > tabloBas ? tabloSon : undefined)
  const adlar = new Set<string>()
  // YALNIZ tablo satırlarının "Olay" sütunu okunur. Serbest metindeki kod işaretleri
  // (`snake_case`, `analytics.ts` …) olay adı DEĞİLDİR ve buraya karışmamalıdır.
  for (const satir of tablo.split(/\r?\n/)) {
    if (!satir.trimStart().startsWith('|')) continue
    const sutunlar = satir.split('|')
    if (sutunlar.length < 4) continue
    for (const m of sutunlar[2].matchAll(/`([a-z][a-z0-9_]*)`/g)) adlar.add(m[1])
  }
  return adlar
}

describe('INV-ANALYTICS-1 — olay taksonomisi cetvel ile kod arasında', () => {
  const cagrilar = atesenenOlaylar()
  const cetvel = cetveldekiOlaylar()

  it('R0 — tarayıcı gerçekten bir şey buluyor (sahte-yeşil kilidi)', () => {
    expect(kaynakDosyalari().length, 'src taranamadı — yol yanlış olabilir').toBeGreaterThan(200)
    expect(
      cagrilar.length,
      'HİÇ trackEvent çağrısı bulunamadı — desen tutmuyor demektir, kapı kör koşuyor',
    ).toBeGreaterThanOrEqual(3)
    expect(
      cetvel.size,
      'Cetvelin taksonomi tablosundan olay adı çıkarılamadı — tablo taşınmış olabilir',
    ).toBeGreaterThanOrEqual(10)
  })

  it('R0b — dedektör sağlıklı: yorum içindeki çağrıyı SAYMAZ, düz çağrıyı SAYAR', () => {
    const yorumlu = yorumsuz("// trackEvent('sahte_olay')\ntrackEvent('gercek_olay')")
    const bulunan = [...yorumlu.matchAll(CAGRI_RE)].map((m) => m[2])
    expect(bulunan).toEqual(['gercek_olay'])
    // URL'deki cift-bolu yorum sanilmamali.
    expect(yorumsuz("const u = 'https://x.dev/a'")).toContain('https://x.dev/a')
  })

  it('R1 — ateşlenen her olay adı cetvelin taksonomi tablosunda yazılı', () => {
    const kacaklar = cagrilar
      .filter((c) => !cetvel.has(c.ad))
      .map((c) => `${c.rel} → trackEvent('${c.ad}')`)
    expect(
      [...new Set(kacaklar)],
      '\nCetvelde YAZMAYAN olay adı ateşleniyor. Olay taksonomisi SSOT’tur: ' +
        'yeni olay önce docs/standards/analytics-standard.md tablosuna eklenir.',
    ).toEqual([])
  })

  it('R2 — geri sayım listesi dürüst: bağlanan olay listede kalamaz', () => {
    const atesenenAdlar = new Set(cagrilar.map((c) => c.ad))
    const yalan = HENUZ_BAGLI_DEGIL.filter((ad) => atesenenAdlar.has(ad))
    expect(
      yalan,
      '\nBu olay(lar) artık koda BAĞLI ama hâlâ HENUZ_BAGLI_DEGIL listesinde duruyor. ' +
        'Listeden düşür — liste bir geri sayımdır, kısalır.',
    ).toEqual([])

    const cetvelDisi = HENUZ_BAGLI_DEGIL.filter((ad) => !cetvel.has(ad))
    expect(
      cetvelDisi,
      '\nGeri sayım listesinde cetvelin tablosunda YAZMAYAN ad var — liste bayat.',
    ).toEqual([])
  })

  it('R3 — trackEvent ilk argümanı düz metin olmalı (tarayıcı kör edilemez)', () => {
    const dinamik: string[] = []
    for (const d of kaynakDosyalari()) {
      const govde = yorumsuz(d.icerik)
      const toplam = [...govde.matchAll(CAGRI_HERHANGI_RE)].length
      const duz = [...govde.matchAll(CAGRI_RE)].length
      if (toplam > duz) dinamik.push(`${d.rel} (${toplam - duz} çağrı)`)
    }
    expect(
      dinamik,
      '\ntrackEvent ilk argümanı değişken/şablon verilmiş. Statik tarama o adı göremez, ' +
        'yani INV-ANALYTICS-1 sessizce körleşir. Olay adı düz metin olmalı.',
    ).toEqual([])
  })

  it('R4 — cetvel kapıyı adıyla anıyor (bağ koparsa görünür olsun)', () => {
    const metin = readFileSync(CETVEL, 'utf8')
    expect(metin).toContain('INV-ANALYTICS-1')
    expect(metin).toContain('HENUZ_BAGLI_DEGIL')
  })
})
