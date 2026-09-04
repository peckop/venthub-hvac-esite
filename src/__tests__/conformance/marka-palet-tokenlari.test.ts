/**
 * INV-PALET-1 — marka paleti kodda TEK kaynakta, kapalı kararın DEĞERİYLE durur.
 *
 * NİÇİN VAR (REC-129 Faz 1, Recep kararı 2026-09-04):
 * Marka kararı kapandı (lacivert · turkuaz · kiremit · amber) ama karar kâğıtta kalırsa
 * uygulanmaz. Cetvel `docs/standards/marka-token-eslemesi-standard.md` §2 şunu emrediyor:
 * *"yeni bir renk kaynağı AÇILAMAZ"* — çünkü 2026-09-04'te ölçüldüğünde renk tanımlayan
 * **altı ayrı yer** vardı ve biri (tailwind'deki sabit `#F59E0B`) tam da bu paletin
 * amberini tema dışında taşıyordu.
 *
 * ⭐NİÇİN DİZE KARŞILAŞTIRMASI DEĞİL, HSL→HEX ÇEVİRİMİ:
 * Token'ın `23 88% 45%` yazdığını doğrulamak, o değerin DOĞRU renk olduğunu doğrulamaz —
 * bir hane şaşarsa dize karşılaştırması yine yeşil kalırdı (yeni değeri beklenen sanardı).
 * Bu yüzden kapı HSL'yi RGB'ye çevirip **kapalı kararın HEX'ine** eşitliyor. Sözleşme
 * budur: CSS'teki HSL ile cetveldeki HEX **aynı rengi** göstermek zorunda.
 *
 * NE ÖLÇMEZ — bilerek ve cetvelde de yazılı (§3):
 *  ⛔ "kiremit yalnız ana eylemde" kuralı. "Ana eylem" SEMANTİK bir roldür; statik tarama
 *     bir token'ın hangi bileşende hangi rolde kullanıldığını bilemez (`cn()` içine gömülen
 *     dizeler ve `toneClasses[tone]` gibi dolaylı üretim bunu kesinleştiriyor).
 *  ⛔ KONTRAST. jsdom'da ölçülemez: `vitest.setup.ts` `index.css`'i import etmiyor ve
 *     axe-core'un `color-contrast` kuralı jsdom'da koşmaz. "axe yeşil" bu dosyanın hiçbir
 *     maddesini doğrulamaz — sahte-yeşildir. Kontrast gerçek tarayıcıda ölçülür.
 * Bu iki sınır GİZLENMİYOR; kapının yetkisi buraya kadardır.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const INDEX_CSS = readFileSync(join(KOK, 'src', 'index.css'), 'utf8')
const TAILWIND = readFileSync(join(KOK, 'tailwind.config.js'), 'utf8')

/** Cetvel §1'in kapalı kararı. Değiştirmek = Recep kararını değiştirmek. */
const PALET: ReadonlyArray<{ token: string; hex: string; rol: string }> = [
  { token: '--marka-lacivert', hex: '#1A2B4A', rol: 'gövde metni, başlık, ikincil eylem' },
  { token: '--marka-turkuaz', hex: '#0088B0', rol: 'vurgu, bağlantı, ikincil yüzey' },
  { token: '--marka-kiremit', hex: '#D95D0E', rol: 'YALNIZ logo + ana eylem düğmesi' },
  { token: '--marka-amber', hex: '#F59E0B', rol: 'YALNIZ arayüz uyarısı, yanında koyu yazı ile' },
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

describe('INV-PALET-1 — marka paleti tek kaynakta ve kapalı kararın değeriyle', () => {
  it.each(PALET)('$token tanımlı ve HSL biçiminde ($rol)', ({ token }) => {
    const deger = tokenDegeri(token)
    expect(deger, `${token} src/index.css'te YOK. Palet cetveli §1 onu zorunlu kılıyor.`).not.toBeNull()
    expect(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(deger ?? ''),
      `${token} HSL uclusu degil: "${deger}". CLAUDE.md kural 8: renk HEX degil CSS custom property (HSL).`,
    ).toBe(true)
  })

  it.each(PALET)('$token HSL degeri $hex rengini veriyor (cevrim ile)', ({ token, hex }) => {
    const deger = tokenDegeri(token)
    const [h, s, l] = (deger ?? '').split(/\s+/).map((p) => parseFloat(p))
    const uretilen = hslToHex(h, s, l)
    const fark = kanalFarki(uretilen, hex)
    // Yuvarlama payi 2/255: HSL'e yuvarlanmis bir HEX geri cevrildiginde bir-iki birim
    // kayabilir. 2'den buyuk fark artik yuvarlama degil, YANLIS RENKTIR.
    expect(
      fark,
      `${token} = "${deger}" -> ${uretilen}, beklenen ${hex} (kanal farki ${fark}). ` +
        'Cetvel docs/standards/marka-token-eslemesi-standard.md §1 kapali karardir; ' +
        'degeri degistirmek Recep kararini degistirmektir.',
    ).toBeLessThanOrEqual(2)
  })

  it('paletin İKİNCİ bir kaynağı doğmamış — tailwind sabit HEX olarak taşımıyor', () => {
    // Cetvel §2: "yeni bir renk kaynagi ACILAMAZ". Amber (#F59E0B) tam da tailwind'de
    // 'warning-orange' adiyla sabit duruyordu; bu kol o kalemin PALET TOKENI olarak
    // ikinci kez tanimlanmasini engeller. Mevcut satirin kendisi bu PR'in kapsami DEGIL
    // (cetvel §2 listesi Faz 1'de isim isim cikacak) — engellenen, PALET adiyla kopya.
    for (const { token } of PALET) {
      const ad = token.replace(/^--/, '')
      expect(
        TAILWIND.includes(ad),
        `tailwind.config.js "${ad}" adini tasiyor — palet ikinci bir kaynaktan da ` +
          'tanimlaniyor. Cetvel §2: yeni renk kaynagi acilamaz; token index.css SSOT.',
      ).toBe(false)
    }
  })

  it('ölü legacy HEX değişkenleri geri gelmemiş', () => {
    // 2026-09-04 olcumu: bu 13 degiskenin depoda var(--...) kullanimi SIFIRDI ve silindi.
    // Geri eklenirlerse renk kaynagi yeniden cogalir.
    const SILINENLER = [
      '--navy-800', '--navy-700', '--navy-600', '--navy-500',
      '--cyan-400', '--cyan-500', '--cyan-glow', '--amber-400',
      '--text-secondary', '--text-muted', '--glass-bg', '--glass-border', '--glass-hover',
    ]
    const geriGelenler = SILINENLER.filter((v) => new RegExp(`${v}\\s*:`).test(INDEX_CSS))
    expect(
      geriGelenler,
      `Olu legacy renk degiskenleri geri eklenmis: ${geriGelenler.join(', ')}. ` +
        'Kullanimi olmayan renk kaynagi paleti bulandirir (cetvel §2).',
    ).toEqual([])
  })
})
