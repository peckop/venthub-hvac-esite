import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILL-YUKU-1 · Oturum başı skill yükü bir BÜTÇEYE bağlıdır (REC-304).
 *
 * ⭐İKİ KEZ YANLIŞ EVREN — bu kapının asıl dersi bu (ölçüm 2026-09-12):
 *
 * 1. "Oturum başı bedel 7.4K jeton" sayısı, **tüm frontmatter host'a gidiyor** varsayımıyla
 *    çıkmıştı. Ölçüm: `.claude/skills` 36 skill · TAM frontmatter 28.4 KB (~7.3K jeton) ·
 *    ama oturuma giren liste **yalnız `name` + `description`** (+ varsa `argument-hint`):
 *    **16.6 KB (~4.3K jeton)**. Yani hedef olarak konan "≤5K" **zaten sağlanmıştı**; kusur
 *    sayıda değil, sayının EVRENİNDEydi.
 * 2. "Okunmayan 6 frontmatter anahtarı temizlenmeli" iddiası da yanlış çıktı: `category`,
 *    `metadata`, `depends_on`, `next_steps`, `run_last`, `exclusions` anahtarlarını **host
 *    okumuyor ama BİZİM araçlarımız okuyor** — `scripts/skills-router.py` (satır 46-49) ve
 *    `scripts/compile_skills.py` (satır 75-78). Silinseler yönlendirici ve manifest bozulur.
 *    Onlar ölü yük değil, **diskte yaşayan kendi verimiz**.
 *
 * Bu yüzden kapı, frontmatter'ın tamamını değil **oturuma giren kısmı** ölçer. Yanlış evrende
 * ölçen bir kapı, olmayan bir kusuru kovalar ve gerçek büyümeyi görmez.
 *
 * ⚠`.agent/skills` KAPSAM DIŞI: o ağaç Antigravity işçisinin, Claude Code oturumuna girmiyor
 * (ayrı host). Ölçüldü ama bütçeye SAYILMIYOR — sayılsaydı bu kapı başka bir ajanın
 * maliyetini bize yazardı.
 *
 * Cetvel: `execution-method-standard.md` §8 (tam iş) · `.claude/skills/skills-creator/SKILL.md`.
 */

/** Oturuma giren alanlar. `argument-hint` de listede görünür, o yüzden bütçeye dahil. */
const OTURUMA_GIREN = new Set(['name', 'description', 'argument-hint'])

/**
 * BÜTÇE: 20 KB. Bugün 16.6 KB — yani ~3.4 KB (yüzde 20) baş payı var.
 * Niçin bugünün sayısına eşit DEĞİL: eşiği ölçüme yapıştırmak, bir kelime eklenince kırmızı
 * veren bir kapı üretir; o kapı okunmaz hâle gelir (§25 gürültülü kapı). Niçin daha da yüksek
 * değil: baş payı bir skill'in ortalama bedeli kadar olmalı ki büyüme FARK EDİLSİN.
 */
/**
 * ⭐BÜTÇE 20 → 24 KB (OPS kararı, 2026-10-01, REC-519 WrongStack alımı 2. paket; ölçüm tarihi 2026-10-01).
 * GEREKÇE: 20 KB sınırı, liste bütçesi büyütülmeden ÖNCE konmuştu (09-30'da `skillListingBudgetFraction`
 * büyütüldü, Recep onaylı). Sınırın koruduğu şey bayt değil, "proje skill'leri Sonnet'te AÇIKLAMALI görünür"
 * sonucudur. KESİN sayım (`scripts/hijyen/skill-listesi-say.cjs`, oturum dökümündeki `skill_listing`):
 * 54 proje skill'i ile Sonnet 5.5 düz ve [1m]'de PROJE ADSIZ 0 / 54. Haiku 200K'da 39 / 54 adsız; o taraf bu
 * bütçeyle çözülmez (SKILL_ATAMASI'ndaki Haiku kuralı: skill adı müdür görev metninde AÇIKÇA yazılır).
 * ⛔24 KB'ı aşan bir sonraki PR kendiliğinden yükseltmez: OPS'a gider (yükseltme kararı OPS'undur).
 */
/**
 * ⭐BÜTÇE 24 → 26 KB (YTN-18 ilk dalga, ölçüm 2026-10-12). Altı skill (web-performance, tech-stack, payments-webhooks,
 * database-migrations, geo-fundamentals, write-seo-geo-content) oturum listesine +1,9 KB ekledi: 24,2 KB → 26,1 KB (69 skill).
 * Açıklamalar 229-284 karaktere çekildi (tavan 300); daha fazla kısaltma tetik cümlelerini siler. 26 KB = bugünkü
 * toplam + ~0,5 KB baş payı (önceki baş payıyla aynı büyüklük).
 * ✅OPS onayı 12 Ekim 2026, YTN-18 (OPS, +1,9 KB; Recep: "alacaklarımız varsa alalım"). Bundan sonraki her yükseltme
 * aynı yoldan gider: ölçüm + OPS kararı, bu bloğa yeni tarihli satır.
 */
/**
 * ⭐BÜTÇE 26 → 26,5 KB (YTN-26, ölçüm 2026-11-03). ce-uygunluk-dosyasi (MEVZUAT müdür çekirdeği) oturum listesine
 * +0,3 KB ekledi: önceki toplam ~26,6 KB (pay ~9 bayt), yeni toplam 26 905 bayt (26,3 KB, 72 skill). Açıklama 230 karakter
 * (tavan 300); daha fazla kısaltma tetik cümlelerini siler, başka skill'lerin açıklamasını kısaltmak tetik kaybı riski taşır.
 * 26,5 KB (27 136 bayt) = bugünkü toplam + ~0,2 KB baş payı.
 * ✅OPS onayı 3 Kasım 2026, YTN-26. Bundan sonraki her yükseltme aynı yoldan gider: ölçüm + OPS kararı, bu bloğa yeni tarihli satır.
 */
/**
 * ⭐BÜTÇE 26,5 → 27 KB (YTN-42, ölçüm 2026-11-06). dizin-takip ve seo-olcum (GEO-SEO müdür çekirdeği) oturum listesine
 * +0,7 KB ekledi: önceki toplam ~26,9 KB, yeni toplam 27 585 bayt (72 → 74 skill). Açıklamalar 222 ve 200 bayt (tavan 300).
 * Başka skill'in tetik cümlesini kısaltarak yer açmak denendi (maestro açıklaması 1157 → 416 bayt, sınav 12/12 ve 8/8 tuttu),
 * ama bütçe sorunu yaratıyorsa tavan artırılır, tetik cümleleri kısaltılmaz: açıklama o skill'in tek tetik yeridir.
 * 27 KB (27 648 bayt) = bugünkü toplam + ~0,06 KB baş payı.
 * ✅Recep kararı OPS üzerinden iletildi, 6 Kasım 2026, YTN-42. Bundan sonraki her yükseltme aynı yoldan gider: ölçülmüş aşım + sınav
 * sonucu OPS'a gelir, bu bloğa yeni tarihli satır yazılır.
 */
/**
 * ⭐BÜTÇE 27 → 27,5 KB (YTN-55, ölçüm 2026-11-13). panel-gezinme (TASARIM doğrulayıcı) oturum listesine ekledi:
 * 27 648 → 27 912 bayt (264 bayt aşım, 74 → 75 skill). Açıklama 270 karakter (tavan 300); kısaltmak Türkçe tetik
 * sınavını zayıflatır, YTN-42 yolu: ölçülmüş aşımda tavan artar, işi bozan daraltma yapılmaz.
 * 27,5 KB (28 160 bayt) = bugünkü toplam + ~0,24 KB baş payı. Tetik sınavı 11/12 ve 8/8.
 * ✅OPS onayı 13 Kasım 2026, YTN-55.
 */
const BUTCE_BAYT = 27.5 * 1024

/** Tek bir açıklamanın tavanı. Yeni skill'ler için geçerli; bugünkü aşanlar aşağıda ADIYLA. */
const ACIKLAMA_TAVANI = 300

/**
 * BUGÜN TAVANI AŞANLAR — devralınmış borç, ADIYLA yazılı (§21: kabul edilen boşluk sessiz olamaz).
 * Kural: bu liste BÜYÜYEMEZ. Yeni bir uzun açıklama eklenirse kapı kırmızı verir; listedeki bir
 * skill kısaltılırsa liste küçülür ve kapı yine yeşil kalır (küçülme serbest, büyüme yasak).
 * Borç kaydı: REC-304 kapanış yorumu.
 */
const DEVRALINAN_UZUNLAR = new Set([
  'maestro', // 1157
  'plan-challenger', // 991
  'qa', // 871
  'agy-orchestrate', // 759
  'office-hours', // 756
  'venthub-20-eksen-denetimi', // 747
  'llm-council', // 737
  'task-observer', // 693
  'video-kaynak', // 604
  'i18n-conventions', // 470
  'venthub-architecture', // 403
  'prd-complexity-audit', // 398
  'venthub-tasarim-dili', // 370
  'notebooklm-sync', // 332
  'codegraph', // 327
  'fallow', // 313
  'find-skills', // 305
  'skills-creator', // 301
])

const KOK = path.resolve(__dirname, '../../../.claude/skills')

interface Skill {
  dizin: string
  ad: string
  aciklama: string
  oturumBayti: number
}

/** Frontmatter'ı düz okur (yaml bağımlılığı yok); çok satırlı değerler birleştirilir. */
function skilleriOku(): Skill[] {
  const out: Skill[] = []
  for (const g of fs.readdirSync(KOK, { withFileTypes: true })) {
    if (!g.isDirectory()) continue
    const dosya = path.join(KOK, g.name, 'SKILL.md')
    if (!fs.existsSync(dosya)) continue
    const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(dosya, 'utf8'))
    if (!m) continue

    const alanlar: Record<string, string> = {}
    let son: string | null = null
    for (const satir of m[1].split(/\r?\n/)) {
      const k = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(satir)
      if (k) {
        son = k[1]
        alanlar[son] = k[2]
      } else if (son && satir.trim()) {
        alanlar[son] += ' ' + satir.trim()
      }
    }

    const oturumMetni = Object.entries(alanlar)
      .filter(([k]) => OTURUMA_GIREN.has(k))
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')

    out.push({
      dizin: g.name,
      ad: alanlar.name || g.name,
      aciklama: alanlar.description || '',
      oturumBayti: Buffer.byteLength(oturumMetni, 'utf8'),
    })
  }
  return out
}

describe('INV-SKILL-YUKU-1 · oturuma giren yük bütçe içinde', () => {
  const skiller = skilleriOku()

  it('ölçüm evreni doğru: skill sayısı ve alanlar okunabildi', () => {
    // Bu kol olmadan boş bir dizin "bütçe içinde" diye YEŞİL verir — yokluk kanıtı değildir.
    expect(skiller.length, 'hiç skill okunamadı (yanlış kök?)').toBeGreaterThanOrEqual(30)
    expect(skiller.every((s) => s.ad.length > 0), 'adı okunamayan skill var').toBe(true)
  })

  it(`TOPLAM oturum yükü ${BUTCE_BAYT} baytı aşmıyor`, () => {
    const toplam = skiller.reduce((t, s) => t + s.oturumBayti, 0)
    const kb = (toplam / 1024).toFixed(1)
    expect(
      toplam,
      `oturum yükü ${kb} KB — bütçe ${(BUTCE_BAYT / 1024).toFixed(0)} KB. ` +
        'Açıklamaları kısalt ya da bütçeyi ölçümle birlikte yeniden karara bağla.',
    ).toBeLessThanOrEqual(BUTCE_BAYT)
  })

  it(`YENİ skill açıklaması ${ACIKLAMA_TAVANI} karakteri aşamaz (devralınanlar adıyla muaf)`, () => {
    const yeniAsanlar = skiller
      .filter((s) => s.aciklama.length > ACIKLAMA_TAVANI)
      .filter((s) => !DEVRALINAN_UZUNLAR.has(s.ad) && !DEVRALINAN_UZUNLAR.has(s.dizin))
      .map((s) => `${s.ad} (${s.aciklama.length})`)
    expect(
      yeniAsanlar,
      'tavanı aşan YENİ açıklama(lar): her satır her oturumda okunuyor — kısalt ya da ' +
        'gerekçesiyle devralınan listesine EKLEME yap (liste büyütmek borç yazmaktır)',
    ).toEqual([])
  })

  it('devralınan muafiyet listesi BÜYÜMEZ — bugünkü aşan sayısı tavanı', () => {
    // Muafiyetin kendisi kaçış kapısına dönmesin: bugünkü aşan sayısı ÜST SINIR.
    // Kısaltma serbest (sayı düşebilir), yeni muafiyet yasak.
    const asan = skiller.filter((s) => s.aciklama.length > ACIKLAMA_TAVANI).length
    expect(asan, 'tavanı aşan skill sayısı bugünün üstüne çıktı').toBeLessThanOrEqual(18)
  })
})
