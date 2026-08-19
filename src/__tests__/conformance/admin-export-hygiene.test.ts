import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-EXPORT-1 · Admin paylaşılan bileşenleri TEK KAPIDAN girer (T102-VH).
 *
 * NİÇİN VAR
 *
 * `data-table/` ve `overlay/` altındaki sekiz bileşenin hepsi hem NAMED hem
 * DEFAULT export ediyordu. Ölçüm (2026-08-19, knip + çağrı-yeri sayımı):
 *
 *   · sekiz DEFAULT export'un ALTISI hiçbir yerden kullanılmıyordu — ölü;
 *   · kalan ikisi tek çağrı-yerindeydi;
 *   · ve `BulkBar` aynı depoda İKİ FARKLI KAPIDAN giriyordu —
 *     `AdminLogisticsTableBody` default, diğer YEDİ dosya named.
 *
 * Aynı bileşen için iki ithal biçimi kendi başına çökme üretmez; ürettiği şey
 * SESSİZ AYRIŞMADIR: yeniden adlandırma yalnız bir kapıyı takip eder, arama
 * yalnız bir biçimi bulur, ve "kullanılmıyor" ölçümleri ölü kapıyı canlı sanar.
 * Kusur bu yüzden bir yazım tercihi değil, ÖLÇÜLEBİLİRLİĞİ bozan bir kusurdur.
 *
 * KARAR: bu iki dizinde tek kapı = NAMED export.
 * Cetvel maddesi → docs/standards/admin-design-standard.md
 *
 * İKİ KURAL — ikisi de SIFIR TOLERANS, muafiyet ADLA yazılır (şu an yok)
 *
 *   A) Kapsanan dizinlerde `export default` YASAK.
 *   B) Kapsanan dizinlerden DEFAULT ithal YASAK — A'yı geçen ama başka bir
 *      yoldan default doğuran hâlleri (ör. `export { X as default }`) çağrı
 *      yerinden yakalar. İki kural birbirinin yedeğidir, biri diğerini
 *      gereksiz KILMAZ.
 *
 * ÖLÇMEDİĞİ ŞEY (adıyla)
 *
 *   · Bu dosya hiçbir modülü ÇALIŞTIRMAZ; ithalin çözülüp çözülmediğini değil,
 *     yalnız yazım biçimini ölçer. "Named export gerçekten var mı" sorusunu
 *     tsc yanıtlar, bu kapı değil.
 *   · Yorum ayıklama YALNIZ tam-satır `//` ve blok yorumlarını atar; satır
 *     sonuna eklenmiş bir yorumdaki örnek kod YANLIŞ-KIRMIZI verir
 *     (yanlış-yeşil vermez — güvenli yön).
 *   · `export * from` yeniden-ihracatını izlemez. Kapsanan dizinlerde böyle bir
 *     kullanım yok (ölçüldü 2026-08-19).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const ALL: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Kapı, kendi gerekçe metnini ihlal sanmasın. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')
}

/** Tek kapı kuralının geçerli olduğu dizinler. */
const KAPSAM = ['/src/components/admin/data-table/', '/src/components/admin/overlay/']

function kapsamda(yol: string): boolean {
  return KAPSAM.some((d) => yol.includes(d))
}

/** Kural A dedektörü: `export default ...` (CRLF'te de çalışır — trim). */
export function defaultExportSatirlari(kod: string): string[] {
  return kod
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^export\s+default\b/.test(l) || /^export\s*\{[^}]*\bas\s+default\b/.test(l))
}

/**
 * Kural B dedektörü: default ithal + kaynak yolu.
 *
 * `import * as X from` (ad-uzayı) ve `import { X } from` (named) EŞLEŞMEZ:
 * ilk yakalanan karakter bir tanımlayıcı olmak zorunda.
 */
export function defaultIthalleri(kod: string): { ad: string; yol: string }[] {
  const out: { ad: string; yol: string }[] = []
  const re =
    /import\s+(?:type\s+)?([A-Za-z_$][\w$]*)\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(kod)) !== null) out.push({ ad: m[1], yol: m[2] })
  return out
}

/** Çağrı-yerindeki göreli/alias yol, kapsanan dizine mi işaret ediyor? */
function ithalKapsamda(yol: string): boolean {
  return /(?:^|\/)components\/admin\/(?:data-table|overlay)\//.test(yol)
}

interface Ihlal {
  dosya: string
  kanit: string
}

function tara(): { kaynakSayisi: number; kapsamSayisi: number; a: Ihlal[]; b: Ihlal[] } {
  const a: Ihlal[] = []
  const b: Ihlal[] = []
  let kaynakSayisi = 0
  let kapsamSayisi = 0

  for (const [yol, ham] of Object.entries(ALL)) {
    if (yol.includes('/__tests__/')) continue
    kaynakSayisi += 1
    const kod = stripComments(ham)

    if (kapsamda(yol)) {
      kapsamSayisi += 1
      for (const satir of defaultExportSatirlari(kod)) a.push({ dosya: yol, kanit: satir })
    }

    for (const { ad, yol: kaynak } of defaultIthalleri(kod)) {
      if (ithalKapsamda(kaynak)) b.push({ dosya: yol, kanit: 'import ' + ad + " from '" + kaynak + "'" })
    }
  }
  return { kaynakSayisi, kapsamSayisi, a, b }
}

const OLCUM = tara()

/* ------------------------------------------------------------------ */

describe('INV-ADMIN-EXPORT-1 · kapsam (stale-guard)', () => {
  it('tarama gerçekten kaynak gördü', () => {
    /* Glob deseni bozulursa aşağıdaki HER test sessizce "temiz" derdi. */
    expect(OLCUM.kaynakSayisi, 'hiç kaynak dosya taranmadı').toBeGreaterThan(200)
  })

  it('kapsanan iki dizin gerçekten bulundu', () => {
    /* Dizin yeniden adlandırılırsa kural sessizce HİÇBİR ŞEYİ ölçmez olurdu. */
    expect(OLCUM.kapsamSayisi, 'data-table/overlay altında hiç dosya taranmadı').toBeGreaterThan(5)
  })
})

describe('INV-ADMIN-EXPORT-1 · dedektör öz-testi', () => {
  it('A dedektörü düz default export yakalar', () => {
    expect(defaultExportSatirlari('export default BulkBar')).toHaveLength(1)
  })

  it('A dedektörü "as default" kaçamağını da yakalar', () => {
    expect(defaultExportSatirlari('export { BulkBar as default }')).toHaveLength(1)
  })

  it('A dedektörü named export ile YANLIŞ-KIRMIZI vermez', () => {
    expect(defaultExportSatirlari('export function BulkBar() {}')).toHaveLength(0)
    expect(defaultExportSatirlari('export { BulkBar }')).toHaveLength(0)
  })

  it('B dedektörü default ithali yakalar, named ve ad-uzayını yakalamaz', () => {
    const d = defaultIthalleri("import BulkBar from '@/components/admin/data-table/BulkBar'")
    expect(d).toHaveLength(1)
    expect(d[0].ad).toBe('BulkBar')
    expect(defaultIthalleri("import { BulkBar } from './BulkBar'")).toHaveLength(0)
    expect(defaultIthalleri("import * as B from './BulkBar'")).toHaveLength(0)
  })

  it('B dedektörü karma ithali (default + named) yakalar', () => {
    /* Depoda GERÇEKTEN yaşamış biçim: import BulkBar, { type BulkAction } from ... */
    const d = defaultIthalleri(
      "import BulkBar, { type BulkAction } from '@/components/admin/data-table/BulkBar'",
    )
    expect(d).toHaveLength(1)
    expect(d[0].ad).toBe('BulkBar')
  })
})

describe('INV-ADMIN-EXPORT-1 · kural', () => {
  it('A · data-table ve overlay altında export default YOK', () => {
    expect(
      OLCUM.a,
      'Bu dizinlerde tek kapı NAMED export.\n' +
        OLCUM.a.map((i) => '  ' + i.dosya + ': ' + i.kanit).join('\n'),
    ).toEqual([])
  })

  it('B · bu dizinlerden DEFAULT ithal eden çağrı-yeri YOK', () => {
    expect(
      OLCUM.b,
      'Aynı bileşen iki kapıdan giremez.\n' +
        OLCUM.b.map((i) => '  ' + i.dosya + ': ' + i.kanit).join('\n'),
    ).toEqual([])
  })
})
