import { describe, expect, it } from 'vitest'

/**
 * INV-9 · Storefront stil-conformance (ratchet + sert kapılar).
 *
 * CETVEL: `docs/standards/storefront-design-standard.md` §4.1 bu testi ADIYLA istiyor:
 * "§5 baseline sayımları; yeni kod sayacı ARTIRAMAZ, göç dalgaları düşürür".
 * Cetvel ayrıca iki sayacın tanımını bilinçli olarak buraya bırakmış
 * ("INV-9 yazılırken netleşir/sayılır") — o tanımlar aşağıda, gerekçesiyle.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN VAR: token VAR, ZORLAMA YOK (cetvel §1)
 * ─────────────────────────────────────────────────────────────────────────────
 * `tokens.js` bir SSOT olarak duruyor ama storefront'ta hiçbir kapı onu zorlamıyordu.
 * Ölçüm (2026-08-18, aynı regex iki ref üzerinde koşuldu — yöntem farkını elemek için):
 *
 *   sayaç                       08-13     bugün    Δ
 *   max-w-7xl                      49        49     0
 *   slate/gray                   1396      1510  +114
 *   rounded-xl|2xl|3xl            378       391   +13
 *   blue-*                        125       130    +5
 *   indigo-*                       18        18     0
 *   font-black                    150       140   -10
 *
 * Yani beş bekçisiz günde legacy desen ~+132 büyüdü. Bu, ratchet'in gerekçesidir:
 * mevcut borç tek seferde ödenemez ama BÜYÜMESİ bugün durdurulabilir.
 *
 * ⚠️ CETVEL §5 TABLOSU ÜÇ SATIRDA YANLIŞTI ve bu PR'da düzeltiliyor: `rounded` için
 * "194+" yazıyordu, o tarihteki gerçek sayı 378'di (yaklaşık YARISI sayılmış); `blue`
 * için 90 yazıyordu, gerçek 125'ti. Bu önemli çünkü ben de ilk turda "194 → 391, iki
 * katına çıkmış" diye rapor etmiştim — sapma sandığım şeyin çoğu cetvelin kendi
 * eksik sayımıydı. DERS: bir baseline'ı ölçüm YÖNTEMİ olmadan yazmak, sonraki
 * ölçümü yanlış alarma çevirir. Bu yüzden aşağıdaki her sayacın tanımı testin
 * İÇİNDE yaşıyor (test = SSOT'un ikinci yarısı).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * KAPSAM: NEYİ ÖLÇMÜYORUM (muafiyet = ADLA ilkesi)
 * ─────────────────────────────────────────────────────────────────────────────
 * OPS-AUDIT'in iş emri "hangi kural statik-taranabilir, hangisi screenshot ister —
 * ölçülemeyeni ADIYLA işaretle" diyordu. Statik olarak ÖLÇÜLEMEYENLER:
 *
 *  1. §2.6 BÖLÜM DİKEY RİTMİ (`py-12|16|24|32` üçlüsü). Ölçtüm: izinli-set dışı 365
 *     isabet / 115 dosya var, AMA değerleri `py-1`, `py-2`, `py-3` — bunlar bölüm
 *     dolgusu DEĞİL, buton/rozet/input dolgusu ve tamamen meşru. Kural yalnız BÖLÜM
 *     rolündeki elemanlara uygulanır; bir elemanın "bölüm" olup olmadığı className'den
 *     bilinemez (JSX ağacında rol/etiket bilgisi gerekir). Ham sayıyı ratchet yapmak
 *     365 yanlış-KIRMIZI üretirdi — ve yanlış-kırmızı da bir kusurdur. Bu kural
 *     PageKit `<Section density=...>` primitifi gelince (cetvel §4.3) YAPISAL olarak
 *     zorlanır; o güne dek ÖLÇÜLEMEZ-STATİK.
 *     → Statik olarak zorlanabilen DAR dilimi yine de aldım: keyfî `p*-[...]` (aşağıda).
 *
 *  2. §2.7 `object-cover` vs `object-contain` ayrımı. Doğru seçim görselin FOTO mu
 *     TEKNİK DİYAGRAM mı olduğuna bağlı — bu semantik bilgi kodda yok. (Hava-perdeleri
 *     hatası tam buydu ve hiçbir statik kapı görmemişti.)
 *
 *  3. §2.3 vurgu HİYERARŞİSİ, §2.5 rol eşleşmesi (H1 mi H3 mü), §2.1 konteyner'ın
 *     BAĞLAMDA doğruluğu — hepsi "bu eleman hangi rolde" sorusunu gerektirir.
 *
 *  4. Kırpma / CLS / hiza / görsel regresyon → cetvel §4.2'nin Playwright katmanı.
 *     Statik kapı bu sınıfı YAPISAL olarak göremez.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Yorumları CRLF-güvenli siler. İKİ tuzak birden var ve ikisi de bu depoda YAŞANDI:
 *  - `.` bu depoda `\r` ile eşleşmez → `[^\r\n]` şart (T017 fantomu),
 *  - `[^:]` öneki OLMAZSA `https://...` içindeki `//` yorum sanılır ve satırın geri
 *    kalanı silinir → dedektör körleşir, kapı sessizce yeşil kalır.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1')
}

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

/**
 * KAPSAM: storefront = `src/` EKSİ admin. Admin'in KENDİ cetveli var
 * (`admin-design-standard.md`) ve kendi kapıları (INV-ADMIN-*); iki cetveli tek
 * sayaçta toplamak, admin göçünün storefront borcunu ödemiş gibi görünmesine yol açardı.
 */
function inScope(rel: string): boolean {
  if (rel.includes('__tests__') || rel.includes('.test.')) return false
  if (rel.startsWith('admin/') || rel.includes('/admin/')) return false
  return true
}

const SCOPED: Array<{ rel: string; code: string }> = Object.entries(SOURCES)
  .map(([globKey, source]) => ({ rel: toRelPath(globKey), code: stripComments(source) }))
  .filter(({ rel }) => inScope(rel))

function countMatches(re: RegExp): { total: number; files: Map<string, number> } {
  const files = new Map<string, number>()
  let total = 0
  for (const { rel, code } of SCOPED) {
    const n = (code.match(re) ?? []).length
    if (n > 0) {
      files.set(rel, n)
      total += n
    }
  }
  return { total, files }
}

/** `className="..."` / `class={\`...\`}` içindeki tek bir sınıf dizgisi. */
const CLASS_ATTR = /(?:className|class)\s*=\s*\{?\s*(['"`])([\s\S]*?)\1/g

/**
 * §2.5: `font-black` YALNIZ display başlıkta (`text-display` eşliğinde) serbest.
 * Cetvel bu rol ayrımını "INV-9 yazılırken netleşir" diyerek buraya bırakmıştı;
 * tanım bu: AYNI sınıf dizgisinde `text-display` yoksa ihlaldir. Ham `font-black`
 * sayısı 140, rol-farkındalı sayı 133 — yani 7'si meşru display kullanımı.
 */
function countFontBlackOutsideDisplay(): { total: number; files: Map<string, number> } {
  const files = new Map<string, number>()
  let total = 0
  for (const { rel, code } of SCOPED) {
    CLASS_ATTR.lastIndex = 0
    let m: RegExpExecArray | null
    let n = 0
    while ((m = CLASS_ATTR.exec(code)) !== null) {
      const cls = m[2]
      if (cls.includes('font-black') && !cls.includes('text-display')) n += 1
    }
    if (n > 0) {
      files.set(rel, n)
      total += n
    }
  }
  return { total, files }
}

interface Ratchet {
  ad: string
  tavan: number
  say: () => { total: number; files: Map<string, number> }
  gerekce: string
}

/**
 * TAVANLAR = 2026-08-18 ÖLÇÜMÜ, testin KENDİ aracıyla alındı.
 *
 * NİÇİN BUGÜNE SABİTLİYORUM (açık kararımdı, gerekçesi burada kalsın): 08-13
 * sayılarına geri çekmek cazip görünüyor ("beş günlük sapmayı kutsama") ama
 * uygulanabilir değil — o sapma zaten master'da, kapı KIRMIZI doğardı ve kırmızı
 * doğan kapı ya devre dışı bırakılır ya da görmezden gelinir (bu depoda `eslint`
 * `warn` seviyesinin başına gelen tam buydu: fail-open). Ratchet'in değeri geçmişi
 * cezalandırmak değil, GELECEĞİ kapatmaktır. Sapmanın kaydı yukarıdaki tabloda duruyor.
 */
const RATCHETS: Ratchet[] = [
  {
    ad: 'max-w-7xl (§2.1 konteyner)',
    tavan: 49,
    say: () => countMatches(/\bmax-w-7xl\b/g),
    gerekce: 'Tek sayfa genişliği token üzerinden verilmeli.',
  },
  {
    ad: 'ham gri: slate-*/gray-* (§2.2)',
    // 1508, 1510 DEĞİL: yukarıdaki tablo `git grep` ile ölçüldü, bu sayı testin KENDİ
    // glob'uyla. Fark 2 ve kapsam nüansından geliyor (glob ile git-listesi birebir aynı
    // dosya kümesini vermiyor). Bayatlık kilidi bunu ilk koşuşta yakaladı — otorite
    // her zaman KAPININ KENDİ aracıdır, yan kanaldan alınan sayı değil.
    // 2026-08-28 · 1508 → 1499: PDP'den dört veri-dayanaksız bölüm kaldırıldı (REC-56,
    // uydurma sertifika numaraları); borç bu yüzden düştü, kapı "tavanı indir" dedi.
    // 2026-08-28 · 1499 → 1497: Footer/ContactPage'den uydurma iletişim satırları
    // kaldırıldı (Recep talimatı, PR #891); iki gri sınıf onlarla gitti.
    // 2026-09-01 · 1497 → 1488: REC-104 — dayanağı olmayan ödeme/kargo vaadi rozetleri
    // (PDP üçlüsü, kategori güven şeridi, sertifika satırı, sepet ödeme kutusu)
    // kaldırıldı; taşıdıkları ham gri sınıflar onlarla gitti.
    tavan: 1488,
    say: () => countMatches(/\b(?:slate|gray)-\d{2,3}\b/g),
    gerekce: 'Gri TEK aile olmalı ve tema-farkındalı token üzerinden gelmeli.',
  },
  {
    ad: 'ham rounded-xl|2xl|3xl (§2.4)',
    // 2026-08-28 · 391 → 378 (aynı kaldırma).
    // 2026-09-01 · 378 → 377 (REC-104 vaat rozetlerinin kaldırılması).
    tavan: 377,
    say: () => countMatches(/\brounded-(?:xl|2xl|3xl)\b/g),
    gerekce: 'Köşe yarıçapı rounded-hvac-* skalasından.',
  },
  {
    ad: 'ham vurgu: blue-*/indigo-* (§2.3)',
    tavan: 148,
    say: () => countMatches(/\b(?:blue|indigo)-\d{2,3}\b/g),
    gerekce: 'Vurgu rengi marka token üzerinden; ham Tailwind paleti hiyerarşiyi bozar.',
  },
  {
    ad: 'font-black · display DIŞINDA (§2.5)',
    // 2026-08-28 · 133 → 124 (aynı kaldırma).
    // 2026-09-01 · 124 → 122 (REC-104 vaat rozetlerinin kaldırılması).
    tavan: 122,
    say: countFontBlackOutsideDisplay,
    gerekce: 'font-black yalnız text-display eşliğinde; başlık ağırlığı font-bold.',
  },
  {
    ad: 'keyfi shadow-[...] (§2.8)',
    tavan: 3,
    say: () => countMatches(/\bshadow-\[[^\]]+\]/g),
    gerekce: 'Gölge elevation-1..5 merdiveninden; yeni ihtiyaç tokens.js e eklenir.',
  },
  {
    ad: 'keyfi w/h/text/gap-[...] (kural 8)',
    tavan: 6,
    say: () =>
      countMatches(/\b(?:w|h|max-w|min-h|min-w|max-h|text|gap|top|left|right|bottom)-\[[^\]]+\]/g),
    gerekce: 'Arbitrary Tailwind değeri yasak; tokens.js kullan.',
  },
]

/**
 * SERT KAPILAR (ratchet DEĞİL): bugün ölçülen değer ZATEN 0. Ratchet yapmak yanlış
 * olurdu — sıfırda duran bir sayaç için "artırma" ile "sıfır" aynı şey değildir:
 * ratchet tavanı 0 olsa bile mesajı "borcu büyütme" der, oysa buradaki kural
 * "bu desen YASAK". Ayrım, ihlal edildiğinde okunan hata metnini değiştirir.
 */
const HARD_GATES: Array<{ ad: string; re: RegExp; gerekce: string }> = [
  {
    ad: 'ham <img> (§2.7)',
    re: /<img[\s>]/g,
    gerekce:
      'Storefront görseli <VentImage> ile (gerekçeli istisna next/image). ' +
      'Ham <img> width/height vermez → CLS (kural 10) ve fallback/sizes disiplinini atlar.',
  },
  {
    ad: 'keyfi padding p*-[...] (§2.6 + kural 8)',
    re: /\bp[ytxbrl]?-\[[^\]]+\]/g,
    gerekce:
      'Cetvel py-[72px] biçimini ADIYLA yasaklıyor. Bölüm ritminin statik olarak ' +
      'zorlanabilen TEK dilimi budur (bkz. başlıktaki kapsam notu §1).',
  },
]

function ilkN(files: Map<string, number>, n = 12): string {
  return [...files.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([f, c]) => `    ${f}  ×${c}`)
    .join('\n')
}

describe('INV-9 · storefront stil-conformance', () => {
  it('kapsam gerçekten dolu (vacuous-pass koruması)', () => {
    // Glob bozulur ya da yol öneki değişirse tüm sayaçlar 0 döner ve kapı
    // "tertemiz" der. Ölçüm aracının ÇALIŞTIĞINI ayrıca kanıtla.
    expect(SCOPED.length).toBeGreaterThan(300)
    expect(SCOPED.some(({ code }) => code.includes('className'))).toBe(true)
  })

  describe('ratchet: yeni kod sayacı ARTIRAMAZ', () => {
    for (const r of RATCHETS) {
      it(`${r.ad} ≤ ${r.tavan}`, () => {
        const { total, files } = r.say()
        expect(
          total,
          `\n  INV-9 ratchet AŞILDI — ${r.ad}\n` +
            `  tavan ${r.tavan}, ölçülen ${total} (+${total - r.tavan})\n` +
            `  kural: ${r.gerekce}\n` +
            `  en yoğun dosyalar:\n${ilkN(files)}\n` +
            `  → Yeni kodda bu deseni KULLANMA. Tavanı yükseltmek çözüm DEĞİLDİR.\n`,
        ).toBeLessThanOrEqual(r.tavan)
      })
    }
  })

  describe('sert kapı: bu desen yasak (bugün 0, öyle kalmalı)', () => {
    for (const g of HARD_GATES) {
      it(`${g.ad} = 0`, () => {
        const { total, files } = countMatches(g.re)
        expect(
          total,
          `\n  INV-9 SERT KAPI ihlali — ${g.ad}\n` +
            `  ${g.gerekce}\n` +
            `  dosyalar:\n${ilkN(files)}\n`,
        ).toBe(0)
      })
    }
  })

  /**
   * BAYATLIK KİLİDİ (ratchet'in ikinci yarısı; INV-5/INV-I18N-ATTR'da kanıtlanmış desen).
   * Sayaç DÜŞTÜĞÜNDE tavan da düşmeli — yoksa göç dalgasının kazandığı zemin sessizce
   * geri verilebilir hale gelir ("tavan 1510, bugün 1200, demek 310 yeni ham gri
   * yazabilirim"). Ratchet ancak tek yönlü sıkışırsa ratchet'tir.
   */
  it('tavanlar bayat değil (sayaç düştüyse tavan da düşürülmeli)', () => {
    const bayat = RATCHETS.map((r) => ({ ad: r.ad, tavan: r.tavan, olculen: r.say().total }))
      .filter((x) => x.olculen < x.tavan)

    expect(
      bayat,
      '\n  Sayaç(lar) tavanın ALTINA düştü — kazanılan zemini kilitle:\n' +
        bayat.map((x) => `    ${x.ad}: tavan ${x.tavan} → ${x.olculen} yap`).join('\n') +
        '\n  (Bu kırmızı bir REGRESYON değil, ÖDÜLdür: borç azaldı, tavanı indir.)\n',
    ).toEqual([])
  })
})
