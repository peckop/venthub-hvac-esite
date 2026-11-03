import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-CSV-1 · Yönetici CSV/XLS dışa ve içe aktarımı TEK KAPIDAN geçer (VULN-006, REC-355, ADM-6).
 * Cetvel: docs/standards/csv-import-export-standard.md §1.1 (dışa) ve §1.2 (içe).
 *
 * NİÇİN VAR
 * Ölçüm (2026-09-29): 16 yönetici CSV yüzeyinin HİÇBİRİ `= + - @ TAB CR` ile başlayan hücreyi
 * nötrlemiyordu. Ölçüm (2026-11-03, ADM-6): göç hâlâ yapılmamıştı; ayrıca 3 XLS dışa aktarımı
 * (siparişler, iadeler, stok hareketleri) müşteri adı / e-posta / iade nedenini `<td>${deger}</td>`
 * diye HTML kaçışı olmadan basıyordu; iki içe aktarıcıda boyut, satır, uzantı ve şema denetimi yoktu.
 * Ortak yardımcı: `src/lib/csv/` (hucre, belge, ayristir, dosyaKapisi, semalar).
 *
 * KURALLAR (kapsam: src/views/admin, src/components/admin, src/app/admin, src/lib; lib/csv hariç)
 *   A) Satır içi `.replace(/"/g, '""')` YASAK (kaçış yalnız lib/csv/hucre.ts'te).
 *   B) Elle `new Blob(..., { type: 'text/csv' | 'application/vnd.ms-excel' })` YASAK → `tabloIndir`.
 *   C) Şablon içinde ham `<td>${` / `<th>${` YASAK → `xlsBelgesi`.
 *   D) CSV dosyası seçen yüzey (`accept=".csv`) `csvDosyasiOku` kullanır; eski satır-bölme
 *      ifadesi geri gelmez.
 * TABAN SIFIR: ADM-6 göçüyle `BEKLEYEN_GOC` boşaldı; ratchet yok, her ihlal kırmızı.
 * SINIR: dosya içi metin taraması; yardımcıyı çağırıp çıktısını yine de elle bozan kodu görmez
 * (davranış lib/csv birim testlerinde ölçülür).
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

const KAPSAM = ['/src/views/admin/', '/src/components/admin/', '/src/app/admin/', '/src/lib/']
const HARIC = '/src/lib/csv/'
const YARDIMCILAR = [
  '/src/lib/csv/hucre.ts',
  '/src/lib/csv/belge.ts',
  '/src/lib/csv/ayristir.ts',
  '/src/lib/csv/dosyaKapisi.ts',
  '/src/lib/csv/semalar.ts',
]

/** Kapı, kendi gerekçe metnini ihlal sanmasın. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('{/*'))
    .join('\n')
}

const INLINE_KACIS = /\.replace\(\s*\/"\/g\s*,\s*'""'\s*\)/
const ELLE_BLOB = /type:\s*['"](?:text\/csv|application\/vnd\.ms-excel)/
const HAM_HUCRE = /<t[dh][^>]*>\$\{/
const CSV_SECICI = /accept=["']\.csv/
const ESKI_BOLME = /split\(\/,\(\?=/

type Kural = 'A' | 'B' | 'C' | 'D'

function ihlaller(kaynak: string): Kural[] {
  const kod = stripComments(kaynak)
  const sonuc: Kural[] = []
  if (INLINE_KACIS.test(kod)) sonuc.push('A')
  if (ELLE_BLOB.test(kod)) sonuc.push('B')
  if (HAM_HUCRE.test(kod)) sonuc.push('C')
  if (ESKI_BOLME.test(kod) || (CSV_SECICI.test(kod) && !/csvDosyasiOku\(/.test(kod))) sonuc.push('D')
  return sonuc
}

const KAPSAMLI = Object.entries(ALL).filter(
  ([yol]) => KAPSAM.some((k) => yol.startsWith(k)) && !yol.startsWith(HARIC) && !yol.includes('/__tests__/'),
)

describe('INV-ADMIN-CSV-1 · yönetici CSV/XLS tek kapıdan geçer', () => {
  it('kapsam ölçümü: tarama kör değil (yardımcılar var, kapsanan dosya sayısı makul)', () => {
    for (const y of YARDIMCILAR) expect(Object.keys(ALL)).toContain(y)
    expect(KAPSAMLI.length).toBeGreaterThan(100)
  })

  it('hiçbir yüzey kuralları ihlal etmez (taban sıfır)', () => {
    const bulgu = KAPSAMLI.map(([yol, kaynak]) => [yol, ihlaller(kaynak)] as const)
      .filter(([, k]) => k.length > 0)
      .map(([yol, k]) => `${yol} [${k.join(',')}]`)
    expect(bulgu, `CSV/XLS kapısını atlayan yüzeyler (VULN-006 / ADM-6): ${bulgu.join(' · ')}`).toEqual([])
  })

  it('dışa aktaran yüzeyler gerçekten yardımcıyı çağırır (göç edilen 16 yüzey + 3 XLS)', () => {
    const disa = KAPSAMLI.filter(([, k]) => /tabloIndir\(/.test(k)).map(([y]) => y)
    expect(disa.length).toBeGreaterThanOrEqual(16)
    for (const [yol, kaynak] of KAPSAMLI.filter(([y]) => disa.includes(y))) {
      expect(/csvBelgesi\(|xlsBelgesi\(/.test(kaynak), yol).toBe(true)
    }
  })

  it('kurallar kendi örneklerinde ayırt eder (kapı kör değil)', () => {
    expect(ihlaller(`const s = v.replace(/"/g, '""')`)).toEqual(['A'])
    expect(ihlaller(`const b = new Blob([x], { type: 'text/csv;charset=utf-8;' })`)).toEqual(['B'])
    expect(ihlaller(`const b = new Blob([x], { type: 'application/vnd.ms-excel' })`)).toEqual(['B'])
    expect(ihlaller('const h = `<tr><td>${r.ad}</td></tr>`')).toEqual(['C'])
    expect(ihlaller('const h = `<th class="x">${baslik}</th>`')).toEqual(['C'])
    expect(ihlaller(`<input type="file" accept=".csv,text/csv" />`)).toEqual(['D'])
    expect(ihlaller(`const split = (s) => s.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)`)).toEqual(['D'])
    expect(
      ihlaller(`<input accept=".csv" />\nconst s = await csvDosyasiOku(f)\ntabloIndir(csvBelgesi(b, r), 'a.csv', 'csv')`),
    ).toEqual([])
    expect(ihlaller(`// v.replace(/"/g, '""') yorumda\nconst x = 1`)).toEqual([])
  })
})
