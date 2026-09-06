/**
 * INV-TOKEN-AA-RENK-1 — K25/K25-b'nin iki AA koyu tonu, TEK kaynakta ve kapalı
 * kararın DEĞERİYLE durur; Tailwind onlara yalnız CSS değişkeni üzerinden bakar;
 * kullanıcı kodu değeri ham HEX olarak İKİNCİ kez yazmaz.
 *
 * NİÇİN VAR (kararlar-vitrin-15a-2026-09-06, K25 · K25-b):
 * Ölçüm kararın kendisiydi: turkuaz `#0088B0` beyaz metin altında **4.08**, kiremit
 * `#D95D0E` **3.80** — ikisi de WCAG AA'nın 4.5 eşiğinin ALTINDA. Karar tonu değil,
 * ZEMİNİ koyulaştırmak oldu: `#00708F` (**5.65**) ve `#BF5309` (**4.71**). Bu dalda
 * sayılar yeniden koşuldu ve cetveldeki 4.08/3.80 rakamlarını birebir üretti.
 * Karar kâğıtta kalırsa uygulanmaz; bu kapı onu kodda tutar.
 *
 * ⭐NİÇİN DİZE KARŞILAŞTIRMASI DEĞİL, HSL→HEX ÇEVİRİMİ (INV-PALET-1'den devralınan
 * yöntem): token'ın `193 100% 28%` yazdığını doğrulamak o değerin DOĞRU RENK olduğunu
 * doğrulamaz — bir hane şaşsa dize karşılaştırması yeni değeri "beklenen" sanıp yeşil
 * kalırdı. Kapı HSL'yi RGB'ye çevirip kapalı kararın HEX'ine eşitliyor.
 *
 * KAPSAM SINIRI, ADIYLA — gizlenmiyor:
 *  ⛔ KONTRAST ÖLÇÜLMEZ. jsdom'da ölçülemez: `vitest.setup.ts` `index.css`'i import
 *     etmiyor ve axe-core'un `color-contrast` kuralı jsdom'da koşmaz. Yukarıdaki
 *     5.65 / 4.71 sayıları bu kapının ÜRETTİĞİ değil, kararın GEREKÇESİDİR; gerçek
 *     tarayıcı ölçümüne bağlıdırlar. "Bu kapı yeşil" ⇒ "kontrast AA" DEĞİLDİR.
 *  ⛔ "Bu token doğru YERDE kullanılıyor mu" ölçülmez. "Ana eylem düğmesi" ve "sayaç
 *     rozeti" SEMANTİK rollerdir; statik tarama bir sınıfın hangi rolde durduğunu
 *     bilemez (`cn()` içine gömülü dizeler ve `toneClasses[tone]` gibi dolaylı üretim
 *     bunu kesinleştiriyor). §Kullanım sınırı incelemeye bağlıdır, kapıya değil.
 *     ⚠TEK İSTİSNA, adıyla çakılı: sepet sayacı rozeti (`{cartCount}`) — aşağıdaki
 *     "KAZANIM GERİ VERİLEMEZ" kolu o TEK yüzeyin degradeye dönmesini engeller. Bu bir
 *     semantik rol çıkarımı değil, kaynakta adı yazılı tek bir yüzeydir.
 *  ⛔ HAM HEX taraması YORUMLARI GÖRMEZ (bilerek). Sebep ölçülmüş bir yanlış
 *     pozitiftir ve INV-TOKEN-SINIF-1 aynı sınırı aynı gerekçeyle yazıyor: token'ı
 *     AÇIKLAYAN yorumda kaynak kimliği olarak HEX geçer (index.css'teki token
 *     satırının yanındaki HEX gibi) ve bu ihlal değildir — ihlal, değerin
 *     KOD OLARAK ikinci kez yazılmasıdır.
 *  ⛔ `public/**` kapsam dışı (ESLint ignore'da) — cetvel §2'nin bilinen kör noktası.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const INDEX_CSS = readFileSync(join(KOK, 'src', 'index.css'), 'utf8')
const TAILWIND = readFileSync(join(KOK, 'tailwind.config.js'), 'utf8')

/**
 * K25-b'nin kapalı kararı. Değiştirmek = Recep kararını değiştirmek.
 * Kaynak: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md §K25-b.
 */
const AA_TONLARI: ReadonlyArray<{ token: string; hex: string; rol: string }> = [
  {
    token: '--brand-cyan-ink',
    hex: '#00708F',
    rol: 'Teklif/Sepet sayaç rozeti zemini, metin beyaz',
  },
  {
    token: '--action-terracotta-deep',
    hex: '#BF5309',
    rol: 'ana eylem düğmesi dolgusu (kodda çağrı yeri henüz YOK — bilinerek)',
  },
]

/** HSL (CSS custom property biçimi: "H S% L%") → #RRGGBB. */
function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x]
  const to2 = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase()
  return `#${to2(r1)}${to2(g1)}${to2(b1)}`
}

/** İki HEX arasındaki en büyük kanal farkı — yuvarlama payı için. */
function kanalFarki(a: string, b: string): number {
  const oku = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [ra, ga, ba] = oku(a)
  const [rb, gb, bb] = oku(b)
  return Math.max(Math.abs(ra - rb), Math.abs(ga - gb), Math.abs(ba - bb))
}

function tokenDegeri(token: string): string | null {
  const m = INDEX_CSS.match(new RegExp(`${token}\\s*:\\s*([^;]+);`))
  return m ? m[1].trim() : null
}

/**
 * Yorumları (satır ve blok) söker. Ham HEX taraması yalnız KOD üzerinde koşar;
 * gerekçesi dosya başındaki kapsam sınırında yazılı.
 * Saf fonksiyon — ayırt ediciliği aşağıda kanıtlanıyor.
 *
 * ⭐`(?<!:)` ÖN-BAKIŞI ŞART — kaldırılamaz. Onsuz `https://…` içindeki `//` yorum
 * başlangıcı sanılır, satırın GERİ KALANI silinir ve tarayıcı o satırda SESSİZCE
 * körleşir (kapı hep yeşil kalır — sahte yeşil). Bu kusuru INV-SCRUB-1
 * (`comment-scrubber-scheme-safety.test.ts`) bu dalda GERÇEKTEN yakaladı; ilk
 * yazımım ön-bakışsızdı. Kanonik biçim odur; alt-sınır kanıtı aşağıdaki
 * "AYIRT EDİCİ" kolunda, URL taşıyan satırdan HEX'in hâlâ TOPLANDIĞI ölçülerek verilir.
 */
export function yorumlariSok(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(?<!:)\/\/[^\n]*/g, ' ')
}

/**
 * Bir kaynak dosyada, kapalı karar HEX'lerinden KOD OLARAK yazılmış olanları döner.
 * Saf fonksiyon — testin ayırt ediciliği bunun üzerinden kanıtlanır.
 */
export function hamHexIhlalleri(kaynak: string, hexler: readonly string[]): string[] {
  // Buyuk/kucuk harf duyarsiz: `#bf5309` ile `#BF5309` ayni degerdir.
  const kod = yorumlariSok(kaynak).toUpperCase()
  return hexler.filter((h) => kod.includes(h.toUpperCase()))
}

/** `src` altındaki tüm .ts/.tsx dosyaları — testler HARİÇ (beklenen değerleri onlar taşır). */
function kullaniciKodu(): string[] {
  const cikti: string[] = []
  const yur = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) {
        if (/node_modules|\.next|\.git|__tests__/.test(p)) continue
        yur(p)
      } else if (/\.tsx?$/.test(e.name)) {
        cikti.push(p)
      }
    }
  }
  yur(join(KOK, 'src'))
  return cikti
}

describe('INV-TOKEN-AA-RENK-1 — AA koyu tonları tek kaynakta, kararın değeriyle', () => {
  const dosyalar = kullaniciKodu()
  const HEXLER = AA_TONLARI.map((t) => t.hex)

  it('ÖN KOŞUL — tarama evreni gerçekten dolu (boş evren sahte yeşil üretirdi)', () => {
    // Bu kol olmadan `src` yolu bozulsa ham-HEX kolu "hiç ihlal yok" diye YEŞİL
    // kalırdı — hiçbir şey ölçmeden. Yani bu kol aracın çalıştığını kanıtlar.
    expect(dosyalar.length, 'src altında hiç .ts/.tsx bulunamadı — tarama koşmadı').toBeGreaterThan(100)
    expect(INDEX_CSS.length, 'src/index.css okunamadı').toBeGreaterThan(1000)
    expect(TAILWIND.length, 'tailwind.config.js okunamadı').toBeGreaterThan(1000)
  })

  it.each(AA_TONLARI)('$token src/index.css\'te tanımlı ve HSL biçiminde ($rol)', ({ token }) => {
    const deger = tokenDegeri(token)
    expect(deger, `${token} src/index.css'te YOK. K25-b onu zorunlu kılıyor.`).not.toBeNull()
    expect(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(deger ?? ''),
      `${token} HSL uclusu degil: "${deger}". CLAUDE.md kural 8: renk HEX degil CSS custom property (HSL).`,
    ).toBe(true)
  })

  it.each(AA_TONLARI)('$token HSL değeri $hex rengini veriyor (çevrim ile)', ({ token, hex }) => {
    const deger = tokenDegeri(token)
    const [h, s, l] = (deger ?? '').split(/\s+/).map((p) => parseFloat(p))
    const uretilen = hslToHex(h, s, l)
    const fark = kanalFarki(uretilen, hex)
    // Yuvarlama payi 2/255. Bu iki deger icin cevrim TAM (fark 0) olcuLdu; pay yine de
    // birakiliyor cunku HSL'e yuvarlanmis bir HEX geri cevrildiginde bir-iki birim kayabilir.
    expect(
      fark,
      `${token} = "${deger}" -> ${uretilen}, beklenen ${hex} (kanal farki ${fark}). ` +
        'K25-b kapali karardir; degeri degistirmek Recep kararini degistirmektir.',
    ).toBeLessThanOrEqual(2)
  })

  it.each(AA_TONLARI)('$token tailwind\'e CSS DEĞİŞKENİ üzerinden bağlı (sabit HEX değil)', ({ token }) => {
    const ad = token.replace(/^--/, '')
    // Beklenen desen depodaki her token renginin deseni: hsl(var(--x) / <alpha-value>).
    const beklenen = `'${ad}':`
    expect(
      TAILWIND.includes(beklenen),
      `tailwind.config.js'te "${ad}" rengi YOK — sinif (\`bg-${ad}\`) hic CSS uretmez ` +
        've sessizce olu kalir — INV-TOKEN-SINIF-1 kapisinin yakaladigi kusurun renk esi.',
    ).toBe(true)
    expect(
      new RegExp(`'${ad}':\\s*'hsl\\(var\\(${token}\\) / <alpha-value>\\)'`).test(TAILWIND),
      `"${ad}" tailwind'de \`hsl(var(${token}) / <alpha-value>)\` bicimiyle bagli DEGIL. ` +
        'Cetvel marka-token-eslemesi-standard.md §2: yeni renk kaynagi acilamaz; ' +
        'sabit HEX ikinci kaynak demektir, SSOT src/index.css.',
    ).toBe(true)
  })

  it('kullanıcı kodunda değerler HAM HEX olarak yazılmamış', () => {
    // CLAUDE.md kural 8: renk HEX degil CSS custom property. Degerin koda ikinci kez
    // yazilmasi tokeni bypass eder ve tema/duzeltme o yuzeyi atlar.
    const ihlaller = dosyalar
      .map((p) => ({ p, bulunan: hamHexIhlalleri(readFileSync(p, 'utf8'), HEXLER) }))
      .filter((x) => x.bulunan.length > 0)
      .map((x) => `${x.p.replace(KOK, '').replace(/\\/g, '/')} → ${x.bulunan.join(', ')}`)
    expect(
      ihlaller,
      `AA tonlari ham HEX olarak koda yazilmis:\n${ihlaller.join('\n')}\n` +
        'Dogrusu Tailwind sinifi (bg-brand-cyan-ink / bg-action-terracotta-deep) ' +
        'ya da hsl(var(--...)).',
    ).toEqual([])
  })

  it('AYIRT EDİCİ — ölçüt hem YAKALAR hem SERBEST BIRAKIR', () => {
    // Ayirt etmeyen bir gosterge olcum degildir: her iki yon de kanitlanir.
    // Pozitif kol — deger KOD olarak yazilmis:
    expect(hamHexIhlalleri(`const c = '#00708F'`, HEXLER)).toEqual(['#00708F'])
    expect(hamHexIhlalleri(`<rect fill="#bf5309" />`, HEXLER)).toEqual(['#BF5309'])
    // Negatif kol 1 — token'i ACIKLAYAN yorum ihlal DEGIL (kapsam siniri, dosya basinda yazili):
    expect(hamHexIhlalleri(`// zemin --brand-cyan-ink (#00708F)`, HEXLER)).toEqual([])
    expect(hamHexIhlalleri(`/* --action-terracotta-deep: #BF5309 */`, HEXLER)).toEqual([])
    // Negatif kol 2 — dogru kullanim serbest:
    expect(hamHexIhlalleri(`className="bg-brand-cyan-ink text-clean-white"`, HEXLER)).toEqual([])
    // Negatif kol 3 — BASKA bir HEX bu kapinin konusu degil (evren dogru mu):
    expect(hamHexIhlalleri(`const c = '#0088B0'`, HEXLER)).toEqual([])
  })

  it('ALT SINIR — URL taşıyan satır YENMİYOR, hedef o satırdan GERÇEKTEN toplanıyor', () => {
    // INV-SCRUB-1'in sart kostugu kanit. Yalniz "siyirmadi" demek yetmez; siyiricinin
    // sema yuzunden korlesmedigini, o satirdan hedefin TOPLANDIGINI olcmek gerekir.
    const urlluSatir = `const u = 'https://venthub.com.tr/x'; const c = '#00708F'`
    // 1) Siyirici satiri yememis:
    expect(yorumlariSok(urlluSatir)).toContain('#00708F')
    expect(yorumlariSok(urlluSatir)).toContain('https://venthub.com.tr/x')
    // 2) …ve hedef GERCEKTEN toplanmis (asil olcum bu):
    expect(hamHexIhlalleri(urlluSatir, HEXLER)).toEqual(['#00708F'])
    // 3) Gercek yorum yine de siyriliyor — kapi zayiflamadi:
    expect(hamHexIhlalleri(`const u = 'https://a.b/c' // zemin #00708F`, HEXLER)).toEqual([])
  })

  it('⭐KAZANIM GERİ VERİLEMEZ — sepet sayacı rozetinin zemini DEGRADE olamaz', () => {
    // NICIN BU KOL VAR (olcum, kapinin ilk hali uzerinde yapildi): kapi TOKENI
    // koruyordu ama KULLANIMI korumuyordu. Rozete herhangi bir degrade sinifi geri
    // konuldugunda kapi 10/10 YESIL kaliyordu — yani K25-b'nin musteriye donuk TEK
    // kazanimi korumasizdi ve sessizce geri verilebilirdi.
    //
    // ⚠ESKI ZEMININ GERCEK DEGERI, CANLIDAN OLCULDU (getComputedStyle, venthub.com.tr,
    // 2026-09-06): `bg-gradient-to-r from-primary-navy to-secondary-blue`, yani
    // linear-gradient(to right, rgb(30,63,174), rgb(2,129,197)).
    // ⛔ONCEKI YAZDIGIM "from-cyan-400 to-blue-600" YANLISTI ve olculmeden yazilmisti;
    // duzeltiliyor. Sabotaj hangi degrade ile yapilirsa yapilsin kolu dogruluyor,
    // ama TARIH dogru yazilmali.
    //
    // DEGRADE NICIN KUSUR — BUYUKLUGU DE ADIYLA: beyaz yaziyla kontrast sol uctan sag
    // uca 8.83:1 -> 4.24:1 iniyor. Yani rozet SADECE EN SAG UCUNDA ve AZ (4.24 vs 4.5)
    // AA altina duser; "okunaksiz" degildir. Asil kusur BUYUKLUK degil OLCULEMEZLIK:
    // kontrast zemin boyunca degistigi icin "bu rozet AA mi" sorusunun TEK BIR CEVABI
    // yoktur. Duz ton her yerde 5.65:1 verir — sorunun cevaplanabilir olmasinin sarti.
    //
    // ⚠BU KOLUN SINIRI: yalniz SEPET rozetini olcer — kaynakta `{cartCount}` yazan
    // satir. Genel "token dogru yerde mi" sorusu HALA kapi disidir (bkz. baslikta
    // ⛔ blogu); burada semantik rol cikarimi yapilmaz, TEK yuzey adiyla cakilidir.
    const sticky = readFileSync(join(KOK, 'src', 'components', 'StickyHeader.tsx'), 'utf8')
    const rozetSatirlari = sticky.split(/\r?\n/).filter((s) => s.includes('{cartCount}'))
    expect(
      rozetSatirlari.length,
      'StickyHeader.tsx icinde `{cartCount}` render eden satir YOK — rozet tasindi ya da ' +
        'yeniden adlandirildi. BU KOL GUNCELLENMELI, silinmemeli (yoksa kapi susar).',
    ).toBeGreaterThan(0)
    for (const satir of rozetSatirlari) {
      expect(
        satir.includes('bg-brand-cyan-ink'),
        `Sepet rozetinin zemini bg-brand-cyan-ink DEGIL: ${satir.trim()}`,
      ).toBe(true)
      expect(
        /bg-gradient|from-[a-z]+-\d|to-[a-z]+-\d/.test(satir),
        `Sepet rozetine degrade geri konmus: ${satir.trim()} — beyaz rakam degradenin ` +
          'acik ucunda AA altina duser; K25-b bunu duzeltmisti.',
      ).toBe(false)
    }
  })
})
