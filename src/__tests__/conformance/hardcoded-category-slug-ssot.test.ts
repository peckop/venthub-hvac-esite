/**
 * INV-CATSLUG-1 — Koda gömülü kategori slug'ı, gerçekten var olan bir kategoriyi göstermeli.
 *
 * NİÇİN VAR:
 * Vitrinde kategoriye giden bağlantıların bir kısmı DB'den değil, koda yazılmış sabit
 * dizelerden kuruluyor (yedek çipler, senaryo kartları). Böyle bir dize DB'deki hiçbir
 * kategoriye karşılık gelmediğinde hiçbir tip hatası, hiçbir kırmızı test doğmaz —
 * kullanıcı boş sayfaya düşer, biz de öğrenmeyiz. 2026-08-21'de anasayfa hero'sunda tam
 * bu sebeple 6 kırık bağlantı bulundu (#757); 2026-08-23 ölçümünde aynı sınıf iki dosyada
 * daha yaşıyordu. Kusur tek tek bağlantılarda değil, "sabit slug yazılabiliyor ve kimse
 * doğruluğunu ölçmüyor" boşluğunda.
 *
 * BU KAPI NE YAPAR:
 * Aşağıdaki dosyalarda geçen kategori slug'ı sabitlerinin tamamının, adıyla ve gerekçesiyle
 * kayıtlı bir listede bulunmasını şart koşar. Yeni bir sabit slug eklendiğinde test kırılır;
 * ekleyen kişi ya slug'ın gerçekten var olduğunu kaydeder ya da vazgeçer.
 *
 * BU KAPI NE YAPMAZ:
 * Slug'ın canlı DB'de var olduğunu ölçmez — burada DB yok. Onu `catalog-integrity` (DB'ye
 * bağlanan kapı) ölçer. Bu test yalnız "yeni sabit slug sessizce giremez" kısmını tutar.
 * İkisi birlikte kapıdır; bu test tek başına yeterli DEĞİLDİR.
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()

/** Kategori slug'ı sabiti barındıran, bilinen dosyalar. */
const TARANAN_DOSYALAR = [
  'src/components/SearchOverlay.tsx',
  'src/components/home/ApplicationSolutions.tsx',
] as const

/**
 * Canlı taksonomide karşılığı ÖLÇÜLMÜŞ slug'lar (`categories.slug` kanonik kolonu).
 * Buraya bir slug eklemek, onu DB'de gördüğünü söylemektir.
 *
 * DİKKAT — "var olmak" ile "ürün göstermek" ayrı şeyler: bu liste yalnız birincisini iddia
 * eder. Bir slug burada olabilir ve yine de boş sayfa açabilir (kategori var, altında ürün
 * yok). O ikinci sınıfı bu test görmez; ürün sayısını ölçen kapı `catalog-integrity`dir.
 */
const DOGRULANMIS_SLUGLAR = new Set([
  'air-curtains',
  'commercial-ventilation',
  'heat-recovery-vmc',
  'industrial-ventilation',
  'jet-fans',
])

/**
 * Canlı taksonomide karşılığı OLMAYAN, ama düzeltmesi ölçümle değil KARARLA gelen slug'lar.
 * Her satır bir kararı bekler; karar verilince slug düzeltilir ve satır buradan SİLİNİR.
 * Bu liste yalnız küçülür — büyütmek, kırık bağlantıyı onaylamak demektir.
 */
const KARAR_BEKLEYENLER = new Map<string, string>([
  [
    'fans',
    'Çipin etiketi "Fanlar" ama bu adda bir kategori yok; hangi kategoriye gitmeli ' +
      '(en büyük aday industrial-ventilation) bir ticari karardır, ölçümle çözülmez.',
  ],
  [
    'duct-type-fans',
    'Mutfak senaryosu kartı "kanal tipi fan" vaat ediyor; gerçek kanal tipi alt ' +
      'kategoriler commercial-ventilation altında (circular-duct-fans, rectangular-duct-fans), ' +
      'kart ise industrial-ventilation gösteriyor. Hem kategori hem alt kategori değişmeli.',
  ],
])

/** `slug: 'x'`, `subSlug: 'x'`, `categorySlug: 'x'` ve `Routes.category('x')` biçimleri. */
const SLUG_KALIPLARI = [
  /\b(?:categorySlug|subSlug|slug)\s*:\s*'([a-z0-9-]+)'/g,
  /Routes\.category\(\s*'([a-z0-9-]+)'\s*\)/g,
]

function dosyadanSluglar(goreliYol: string): string[] {
  const tamYol = path.join(KOK, goreliYol)
  const icerik = fs.readFileSync(tamYol, 'utf8')
  const bulunan = new Set<string>()
  for (const kalip of SLUG_KALIPLARI) {
    for (const eslesme of icerik.matchAll(kalip)) bulunan.add(eslesme[1])
  }
  return [...bulunan]
}

describe('INV-CATSLUG-1 — koda gömülü kategori slug SSOT', () => {
  // Kapının kendi ön koşulu: dosyaları gerçekten okuyabiliyor muyuz? Okuyamıyorsa test
  // "ihlal yok" diye yeşil dönerdi — ölçemeyen kapı yeşil dönmemeli.
  it('taranan dosyaların hepsi bulunabiliyor ve boş değil', () => {
    for (const dosya of TARANAN_DOSYALAR) {
      const tamYol = path.join(KOK, dosya)
      expect(fs.existsSync(tamYol), `${dosya} bulunamadi — kapi kor kalir`).toBe(true)
      expect(fs.readFileSync(tamYol, 'utf8').length).toBeGreaterThan(0)
    }
  })

  // Kapının ölçtüğü şeyi gerçekten görebildiğinin kanıtı: bilinen bir slug'ı bulamıyorsa
  // regex'ler bozulmuş demektir ve aşağıdaki asıl test sahte yeşil verirdi.
  it('tarayıcı, bilinen bir slug\'ı gerçekten buluyor (kapsam kanaryası)', () => {
    const hepsi = TARANAN_DOSYALAR.flatMap(dosyadanSluglar)
    expect(hepsi).toContain('air-curtains')
    expect(hepsi.length).toBeGreaterThanOrEqual(4)
  })

  it.each(TARANAN_DOSYALAR)('%s — her sabit slug ya doğrulanmış ya kayıtlı bir karar bekliyor', (dosya) => {
    for (const slug of dosyadanSluglar(dosya)) {
      const biliniyor = DOGRULANMIS_SLUGLAR.has(slug) || KARAR_BEKLEYENLER.has(slug)
      expect(
        biliniyor,
        `${dosya}: "${slug}" ne dogrulanmis slug listesinde ne de karar bekleyenlerde. ` +
          `Bu slug canli taksonomide var mi olctun mu? Varsa DOGRULANMIS_SLUGLAR'a ekle, ` +
          `yoksa once dogru hedefi belirle — kirik baglanti sessizce giremez.`,
      ).toBe(true)
    }
  })

  it('karar bekleyen slug listesi büyümedi (yalnız küçülür)', () => {
    expect(KARAR_BEKLEYENLER.size).toBeLessThanOrEqual(2)
    for (const [slug, gerekce] of KARAR_BEKLEYENLER) {
      expect(gerekce.length, `${slug}: gerekce yazilmamis — af gerekcesiz verilemez`).toBeGreaterThan(40)
    }
  })

  it('düzeltilmiş bağlantı geri gelmedi: heat-recovery-units artık kullanılmıyor', () => {
    const hepsi = TARANAN_DOSYALAR.flatMap(dosyadanSluglar)
    expect(hepsi).not.toContain('heat-recovery-units')
    expect(hepsi).toContain('heat-recovery-vmc')
  })
})
