import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-SEC-1 · TEST SEÇİCİNİN KARAR MANTIĞI (scripts/ci/test-sec.cjs, karar 308).
 *
 * Tek değişmez: seçici bir testi YANLIŞLIKLA ELEMEZ. Şüphe, hata, bilinmeyen ve hesaplanamayan her durum `tam`dır; `tam` sonucunda
 * `secilen` de TÜM testlerdir (bayrağı okumayı unutan tüketici bile hepsini koşturur). Bu dosya bunu iki katmanda ölçer:
 *   1. SENARYOLAR (aşağıdaki `SENARYOLAR`): her biri `sec`in bir kararını ölçer ve ADLI bir `Error` fırlatır.
 *   2. SABOTAJ: seçicinin KAYNAĞINA tek tek hata sokulur (`SABOTAJLAR`: küresel girdi daralır, harita yok sayılır, bilinmeyen test
 *      seçilmez, `tam` yerine boş seçim döner...) ve her hatalı kopyada EN AZ BİR senaryonun kırmızı vermesi beklenir. Kırmızı vermeyen
 *      sabotaj = o karar hiçbir testle korunmuyor demektir ve burası KIRMIZI olur.
 *
 * Bloklar:
 *   1. GERÇEK modül için her senaryo yeşil,
 *   2. SABOTAJ tablosu (her hatalı kopya en az bir senaryoyu kırmızıya çevirir; sabotaj noktası kaynakta TAM BİR KEZ bulunur),
 *   3. küresel girdi örnek tablosu eksiksiz (yeni küresel girdi örneksiz eklenemez),
 *   4. glob eşleştirici tablosu (olumlu, olumsuz, süslü parantez, tanınmayan söz dizimi → daha geniş),
 *   5. CLI (`calistir`): enjeksiyonlu git/vitest ile çıktı sözleşmesi, hata → tam, çıktı enjeksiyonu.
 */

type Kayit = {
  sha: string
  okunan?: string[]
  dizin?: string[]
  ozy?: string[]
  desenler?: string[]
  surec?: string[]
  belirsiz?: string[]
}
type Harita = {
  surum: number
  uretim: Record<string, string>
  arac: string
  kokler: string[]
  kuresel: string[]
  kuresel_desenler: string[]
  testler: Record<string, Kayit>
}
type Tazelik = { arac: string; testler: Record<string, string> }
type Girdi = {
  degisenDosyalar: unknown
  testDosyalari: unknown
  harita: unknown
  ilgili?: unknown
  tazelik?: unknown
  dosyaVarMi?: unknown
  siniflayici?: unknown
}
type Sonuc = { tam: boolean; secilen: string[]; neden: string[]; cikisKodu?: number }
type Modul = {
  KURESEL_GIRDILER: readonly string[]
  SINIFLAYICIDAN_ALINMAYAN: readonly string[]
  DOSYA_SINIRI: number
  sec: (girdi: unknown) => Sonuc
  globEslesir: (desenler: string[], yol: string) => boolean
  suslerleAc: (desen: string) => string[] | null
  sabitOnek: (desen: string) => string
  yoluNormalle: (ham: unknown) => { yol?: string; sebep?: string }
  yollariAyir: (ham: unknown) => string[]
  satirTemizle: (metin: string) => string
  icerikOzeti: (metin: string) => string
  aracOzeti: (kok: string) => string
  ilgiliAdaylari: (yollar: string[], dosyaVarMi?: (y: string) => boolean) => string[]
  calistir: (argv: string[], secenekler: Record<string, unknown>) => Promise<Sonuc>
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KAYNAK_YOLU = path.join(KOK, 'scripts/ci/test-sec.cjs')
const KAYNAK = readFileSync(KAYNAK_YOLU, 'utf8')
const M = require_(KAYNAK_YOLU) as Modul

// ---------------------------------------------------------------------------------------------------------------------------
// FİKSTÜR: bilerek her karar kolunu ayrı bir teste bağlar (aynı yolu iki test okumaz: yanlış kola düşen sonuç görünür olur).
// ---------------------------------------------------------------------------------------------------------------------------

const T_BELGE = 'src/__tests__/conformance/belge-okur.test.ts'
const T_DIZIN = 'src/__tests__/conformance/dizin-okur.test.ts'
const T_AGAC = 'src/__tests__/conformance/alt-agac.test.ts'
const T_GLOB = 'src/__tests__/conformance/glob-okur.test.ts'
const T_BELIRSIZ = 'src/__tests__/conformance/belirsiz.test.ts'
const T_SAF = 'src/lib/__tests__/saf.test.ts'
const T_YENI = 'src/lib/__tests__/yeni.test.ts'
const T_HAYALET = 'src/lib/__tests__/silinmis.test.ts'

function haritaKur(): Harita {
  return {
    surum: 1,
    uretim: { vitest: '4.1.11', kip: 'dislan', node: '22' },
    arac: 'ARAC-A',
    kokler: ['.github', 'docs', 'scripts', 'src', 'supabase', 'public', 'README.md', 'package.json', 'tsconfig', 'vitest-yardim'],
    kuresel: ['docs/ortak-kurulum.json'],
    kuresel_desenler: ['public/ortak/**'],
    testler: {
      [T_BELGE]: { sha: 'sha-belge', okunan: ['docs/a.md'] },
      [T_DIZIN]: { sha: 'sha-dizin', dizin: ['docs/audits'] },
      [T_AGAC]: { sha: 'sha-agac', ozy: ['docs/standards'] },
      [T_GLOB]: { sha: 'sha-glob', desenler: ['src/**/*.{ts,tsx}', '!src/**/__tests__/**'] },
      [T_BELIRSIZ]: { sha: 'sha-belirsiz', belirsiz: ['git ls-files (repo içinde): izlenemeyen süreç'] },
      [T_SAF]: { sha: 'sha-saf' },
      [T_HAYALET]: { sha: 'sha-hayalet', okunan: ['docs/a.md'] },
    },
  }
}

const TESTLER = [T_AGAC, T_BELGE, T_BELIRSIZ, T_DIZIN, T_GLOB, T_SAF, T_YENI]

function tazelikKur(): Tazelik {
  const h = haritaKur()
  const testler: Record<string, string> = { [T_YENI]: 'sha-yeni' }
  for (const t of TESTLER) if (h.testler[t]) testler[t] = h.testler[t].sha
  return { arac: h.arac, testler }
}

/** `vitest related` sahtesi: sabit sonuç döner ve çağrılarını kaydeder. */
function ilgiliSahte(sonuc: string[]) {
  const cagrilar: string[][] = []
  return {
    fonksiyon: (d: string[]) => {
      cagrilar.push([...d])
      return sonuc
    },
    cagrilar,
  }
}

function calistirSec(m: Modul, degisen: unknown, ek: Partial<Girdi> = {}): Sonuc {
  return m.sec({
    degisenDosyalar: degisen,
    testDosyalari: TESTLER,
    harita: haritaKur(),
    ilgili: () => [],
    tazelik: tazelikKur(),
    ...ek,
  })
}

function esit(gercek: unknown, beklenen: unknown, ne: string): void {
  if (JSON.stringify(gercek) !== JSON.stringify(beklenen)) {
    throw new Error(`${ne}: beklenen ${JSON.stringify(beklenen)} ama gelen ${JSON.stringify(gercek)}`)
  }
}

function dogru(kosul: boolean, ne: string): void {
  if (!kosul) throw new Error(ne)
}

function tamMi(s: Sonuc, ne: string): void {
  dogru(s.tam === true, `${ne}: tam bekleniyordu, gelen ${JSON.stringify(s)}`)
  esit(s.secilen, [...TESTLER].sort(), `${ne}: tam sonucunda secilen TÜM testler olmalı`)
}

function darMi(s: Sonuc, ne: string): void {
  dogru(s.tam === false, `${ne}: dar seçim bekleniyordu, gelen ${JSON.stringify(s)}`)
}

// Küresel girdi → o girdiyi tetikleyen örnek yollar. Yeni girdi örneksiz eklenemez (blok 3).
const KURESEL_ORNEKLER: Record<string, string[]> = {
  '.github/': ['.github/workflows/ci.yml', '.github/CODEOWNERS'],
  '.githooks/': ['.githooks/pre-commit'],
  'scripts/ci/': ['scripts/ci/test-sec.cjs', 'scripts/ci/__tests__/x.test.ts'],
  'supabase/migrations/': ['supabase/migrations/20260101000000_x.sql'],
  'scripts/assert-node-major.mjs': ['scripts/assert-node-major.mjs'],
  'scripts/setup-hooks.mjs': ['scripts/setup-hooks.mjs'],
  'package.json': ['package.json'],
  'pnpm-lock.yaml': ['pnpm-lock.yaml'],
  'pnpm-workspace.yaml': ['pnpm-workspace.yaml'],
  '.npmrc': ['.npmrc'],
  '.nvmrc': ['.nvmrc'],
  '.node-version': ['.node-version'],
  '.gitignore': ['.gitignore'],
  '.gitattributes': ['.gitattributes'],
  'tsconfig*.json': ['tsconfig.json', 'tsconfig.build.json'],
  'vitest*': ['vitest.config.ts', 'vitest.smoke.config.ts', 'vitest.setup.ts', 'vitest-setup.tsx', 'vitest.global-setup.ts'],
  'playwright*': ['playwright.config.ts'],
  'next.config.*': ['next.config.mjs'],
  'eslint.config.*': ['eslint.config.cjs'],
  '.eslintrc*': ['.eslintrc.json'],
  'tailwind.config.*': ['tailwind.config.js'],
  'postcss.config.*': ['postcss.config.js'],
  'knip.*': ['knip.json'],
  'middleware.*': ['middleware.ts'],
}

// Küresel OLMAYAN komşular (kök yazımlar yalnız kökte; önek sınırı; tam yol girdisi başka dosyaya yayılmaz).
// `tsconfig/x.json` ve `vitest-yardim/a.ts`: kök desen önekiyle başlayan ALT DİZİN adları (desen yalnız KÖK dosya adına uygulanır).
const KURESEL_DEGIL = ['docs/package.json', 'docs/vitest.config.md', 'scripts/assert-node-major.mjs.bak', 'scripts/cix/a.cjs', 'src/tsconfig.json', 'scripts/ci-extra/a.cjs', 'tsconfig/x.json', 'vitest-yardim/a.ts']

// ---------------------------------------------------------------------------------------------------------------------------
// SENARYOLAR: her biri bir KARARI ölçer; hata fırlatır. Gerçek modülde hepsi susar; sabotajlı kopyada en az biri konuşur.
// ---------------------------------------------------------------------------------------------------------------------------

type Senaryo = { ad: string; kos: (m: Modul) => void }

const SENARYOLAR: Senaryo[] = [
  {
    ad: 'küresel girdi tablosu: her girdinin örneği vardır ve her örnek TAM verir',
    kos: (m) => {
      esit([...m.KURESEL_GIRDILER].sort(), Object.keys(KURESEL_ORNEKLER).sort(), 'küresel girdi listesi ile örnek tablosu')
      for (const [girdi, ornekler] of Object.entries(KURESEL_ORNEKLER)) {
        for (const yol of ornekler) {
          const s = calistirSec(m, [yol])
          tamMi(s, `küresel ${girdi} (${yol})`)
          dogru(s.neden.join(' ').includes(yol), `neden dosyayı adıyla söylemeli (${yol}): ${JSON.stringify(s.neden)}`)
        }
      }
    },
  },
  {
    ad: 'küresel olmayan komşular daralır (kök yazım yalnız kökte, önek sınırı)',
    kos: (m) => {
      for (const yol of KURESEL_DEGIL) darMi(calistirSec(m, [yol]), `komşu ${yol}`)
    },
  },
  {
    ad: 'küresel yol listede TEK olsa da, sıradan dosyaların arasında GÖMÜLÜ olsa da TAM',
    kos: (m) => {
      tamMi(calistirSec(m, ['docs/a.md', 'src/lib/x.ts', 'package.json', 'docs/b.md']), 'gömülü küresel')
    },
  },
  {
    ad: 'haritanın kurulum evresi okumaları ve test dışı kodun glob deseni küreseldir',
    kos: (m) => {
      tamMi(calistirSec(m, ['docs/ortak-kurulum.json']), 'kuresel okuma')
      tamMi(calistirSec(m, ['public/ortak/x/y.png']), 'kuresel desen')
      darMi(calistirSec(m, ['public/baska/y.png']), 'desen dışı')
    },
  },
  {
    ad: 'sınıflayıcının HER_ZAMAN_TAM girdileri küresele eklenir, ama src/ ve public/ eklenmez',
    kos: (m) => {
      const siniflayici = { HER_ZAMAN_TAM: ['.husky/', 'src/', 'public/', 'yeni-kok.json'] }
      const h = haritaKur()
      h.kokler.push('.husky', 'yeni-kok.json')
      tamMi(calistirSec(m, ['.husky/pre-push'], { siniflayici, harita: h }), 'sınıflayıcı dizin')
      tamMi(calistirSec(m, ['yeni-kok.json'], { siniflayici, harita: h }), 'sınıflayıcı kök dosya')
      darMi(calistirSec(m, ['src/lib/x.ts'], { siniflayici, harita: h }), 'src/ küresel olmamalı')
      darMi(calistirSec(m, ['public/a.png'], { siniflayici, harita: h }), 'public/ küresel olmamalı')
      darMi(calistirSec(m, ['docs/a.md'], { siniflayici: 'bozuk', harita: h }), 'bozuk sınıflayıcı yok sayılır')
      esit([...m.SINIFLAYICIDAN_ALINMAYAN].sort(), ['public/', 'src/'], 'sınıflayıcıdan alınmayanlar')
    },
  },
  {
    ad: 'değişen TEST dosyası seçilir (haritada kaydı olsa da olmasa da)',
    kos: (m) => {
      const s = calistirSec(m, [T_SAF])
      darMi(s, 'test değişti')
      dogru(s.secilen.includes(T_SAF), `değişen test seçilmeli: ${JSON.stringify(s.secilen)}`)
      const y = calistirSec(m, [T_YENI])
      dogru(y.secilen.includes(T_YENI), 'yeni (kayıtsız) test değişince de seçilmeli')
    },
  },
  {
    ad: 'yalnız BELGE değişir: yalnız onu okuyan test + her zaman koşanlar; vitest related HESAPLANMAZ',
    kos: (m) => {
      const ilgili = ilgiliSahte([T_SAF])
      const s = calistirSec(m, ['docs/a.md'], { ilgili: ilgili.fonksiyon })
      darMi(s, 'belge')
      esit(s.secilen, [T_BELGE, T_BELIRSIZ, T_YENI].sort(), 'belge değişimi: okuyan + belirsiz + kayıtsız')
      esit(ilgili.cagrilar, [], 'belge için related çağrılmamalı')
    },
  },
  {
    ad: 'dizin eşleşmesi yalnız DOĞRUDAN çocuk için (yeni dosya eklenince dizini listeleyen test seçilir)',
    kos: (m) => {
      dogru(calistirSec(m, ['docs/audits/yeni-olcum.md']).secilen.includes(T_DIZIN), 'doğrudan çocuk: dizin okuyan seçilmeli')
      dogru(!calistirSec(m, ['docs/audits/derin/x.md']).secilen.includes(T_DIZIN), 'torun dosya dizin okuyanı seçmemeli')
      dogru(!calistirSec(m, ['docs/baska/x.md']).secilen.includes(T_DIZIN), 'başka dizin seçmemeli')
    },
  },
  {
    ad: 'alt ağaç eşleşmesi: derinlik fark etmez, ama komşu önek (standards-ekstra) eşleşmez',
    kos: (m) => {
      dogru(calistirSec(m, ['docs/standards/a/b/c.md']).secilen.includes(T_AGAC), 'alt ağaç derin dosya')
      dogru(calistirSec(m, ['docs/standards/x.md']).secilen.includes(T_AGAC), 'alt ağaç doğrudan dosya')
      dogru(!calistirSec(m, ['docs/standards-ekstra/x.md']).secilen.includes(T_AGAC), 'önek sınırı: standards-ekstra eşleşmemeli')
    },
  },
  {
    ad: 'glob deseni: yeni dosya da kapsanır, olumsuz desen dışlar; kod değişince related sonucu da eklenir',
    kos: (m) => {
      const ilgili = ilgiliSahte([T_SAF])
      const s = calistirSec(m, ['src/lib/foo.ts'], { ilgili: ilgili.fonksiyon })
      darMi(s, 'kod değişti')
      dogru(s.secilen.includes(T_GLOB), 'glob deseni src/**/*.ts kapsamalı')
      dogru(s.secilen.includes(T_SAF), 'related sonucu eklenmeli')
      esit(ilgili.cagrilar, [['src/lib/foo.ts']], 'related yalnız içe aktarılabilir adaylarla çağrılmalı')
      const olumsuz = calistirSec(m, ['src/lib/__tests__/yardimci.ts'])
      dogru(!olumsuz.secilen.includes(T_GLOB), 'olumsuz desen (__tests__) dışlamalı')
    },
  },
  {
    ad: 'related yalnız LİSTEDEKİ testleri ekler; liste dışı (dışlanmış/silinmiş) test seçilmez',
    kos: (m) => {
      const s = calistirSec(m, ['src/lib/foo.ts'], { ilgili: () => ['src/lib/__tests__/listede-yok.test.ts', T_SAF] })
      dogru(s.secilen.includes(T_SAF), 'listedeki ilgili test seçilmeli')
      dogru(!s.secilen.includes('src/lib/__tests__/listede-yok.test.ts'), 'liste dışı test seçilmemeli')
      dogru(!s.secilen.includes(T_HAYALET), 'haritada kayıtlı ama listede olmayan test seçilmemeli')
    },
  },
  {
    ad: 'related YALNIZ var olan, test olmayan, içe aktarılabilir dosyalarla çağrılır',
    kos: (m) => {
      const ilgili = ilgiliSahte([])
      calistirSec(m, ['docs/a.md', 'src/lib/foo.ts', 'src/lib/data.json', T_SAF, 'docs/audits/x.csv', 'public/a.png'], { ilgili: ilgili.fonksiyon })
      esit(ilgili.cagrilar, [['public/a.png', 'src/lib/data.json', 'src/lib/foo.ts']], 'related adayları')
    },
  },
  {
    ad: 'haritada kaydı OLMAYAN test HER ZAMAN seçilir (yeni test atlanamaz)',
    kos: (m) => {
      for (const degisen of [['docs/a.md'], ['docs/yok-sayilan.md'], ['README.md']]) {
        const s = calistirSec(m, degisen)
        darMi(s, `kayıtsız ${degisen[0]}`)
        dogru(s.secilen.includes(T_YENI), `kayıtsız test seçilmeli (${degisen[0]}): ${JSON.stringify(s.secilen)}`)
      }
    },
  },
  {
    ad: 'kaynağı ölçümden sonra DEĞİŞMİŞ (bayat kayıtlı) test HER ZAMAN seçilir',
    kos: (m) => {
      const t = tazelikKur()
      t.testler[T_SAF] = 'sha-degisti'
      const s = calistirSec(m, ['docs/yok-sayilan.md'], { tazelik: t })
      dogru(s.secilen.includes(T_SAF), `bayat kayıtlı test seçilmeli: ${JSON.stringify(s.secilen)}`)
      const taze = calistirSec(m, ['docs/yok-sayilan.md'])
      dogru(!taze.secilen.includes(T_SAF), 'taze ve ilgisiz test seçilmemeli (aksi halde seçim daralmaz)')
    },
  },
  {
    ad: 'belirsiz işaretli test HER ZAMAN seçilir',
    kos: (m) => {
      const s = calistirSec(m, ['docs/yok-sayilan.md'])
      dogru(s.secilen.includes(T_BELIRSIZ), `belirsiz test seçilmeli: ${JSON.stringify(s.secilen)}`)
    },
  },
  {
    ad: 'harita BAYAT (ölçüm aracı değişti) → tam',
    kos: (m) => {
      tamMi(calistirSec(m, ['docs/a.md'], { tazelik: { arac: 'ARAC-B', testler: tazelikKur().testler } }), 'araç özeti farklı')
    },
  },
  {
    ad: 'harita yok / bozuk / sürümü farklı → tam',
    kos: (m) => {
      const bozuklar: unknown[] = [
        null,
        undefined,
        'metin',
        [],
        {},
        { ...haritaKur(), surum: 2 },
        { ...haritaKur(), testler: [] },
        { ...haritaKur(), arac: '' },
        { ...haritaKur(), kokler: [] },
        { ...haritaKur(), testler: { x: 'dizge' } },
        { ...haritaKur(), testler: { [T_SAF]: { sha: 5 } } },
        { ...haritaKur(), testler: { [T_SAF]: { sha: 'a', okunan: 'docs' } } },
      ]
      for (const h of bozuklar) tamMi(calistirSec(m, ['docs/a.md'], { harita: h }), `bozuk harita ${JSON.stringify(h)?.slice(0, 40)}`)
    },
  },
  {
    ad: 'boş değişen liste, dizi olmayan, 2000 dosya → tam; 1999 dosya dar kalabilir',
    kos: (m) => {
      tamMi(calistirSec(m, []), 'boş liste')
      tamMi(calistirSec(m, 'docs/a.md'), 'dizi değil')
      tamMi(calistirSec(m, null), 'null')
      const yollar = (n: number) => Array.from({ length: n }, (_, i) => `docs/audits/dosya-${i}.md`)
      tamMi(calistirSec(m, yollar(m.DOSYA_SINIRI)), '2000 dosya')
      darMi(calistirSec(m, yollar(m.DOSYA_SINIRI - 1)), '1999 dosya')
    },
  },
  {
    ad: 'test listesi yok / boş / geçersiz → tam (karar verilemez)',
    kos: (m) => {
      for (const liste of [undefined, null, [], 'x', [1, 2]]) {
        const s = m.sec({ degisenDosyalar: ['docs/a.md'], testDosyalari: liste, harita: haritaKur(), ilgili: () => [], tazelik: tazelikKur() })
        dogru(s.tam === true, `test listesi ${JSON.stringify(liste)} → tam bekleniyordu`)
      }
    },
  },
  {
    ad: 'kötü yol (.., mutlak, NUL/satır sonu, metin olmayan, boş, çok uzun) → tam',
    kos: (m) => {
      // `/docs/a.md` ve `\\\\docs\\a.md` normalleşince BİLİNEN kök olurdu: mutlak yol kuralı olmasa "dar" çıkardı (bilinmeyen kök kuralı onları kurtarmaz)
      const kotuler: unknown[] = ['../x.md', 'docs/../src/a.ts', '/etc/passwd', '/docs/a.md', '\\\\docs\\a.md', 'C:/x.md', 'docs/a\0.md', 'docs/a\n::error::x.md', 'docs/a\u2028b.md', 42, null, '', '.', './', `docs/${'a'.repeat(1100)}.md`]
      for (const kotu of kotuler) tamMi(calistirSec(m, ['docs/a.md', kotu]), `kötü yol ${JSON.stringify(kotu)?.slice(0, 30)}`)
    },
  },
  {
    ad: 'yol yazımı normalleşir (./, //, \\): aynı dosya aynı karar',
    kos: (m) => {
      const temel = calistirSec(m, ['docs/a.md'])
      for (const yazim of ['./docs/a.md', 'docs//a.md', 'docs\\a.md', 'docs/./a.md']) esit(calistirSec(m, [yazim]).secilen, temel.secilen, `yazım ${yazim}`)
      esit(calistirSec(m, ['docs/a.md', 'docs/a.md', './docs/a.md']).secilen, temel.secilen, 'yinelenen yollar')
    },
  },
  {
    ad: 'haritanın bilmediği KÖK ad (yeni üst dizin / kök dosya) → tam; bilinen kök daralır',
    kos: (m) => {
      tamMi(calistirSec(m, ['yeni-kok/a.md']), 'yeni üst dizin')
      tamMi(calistirSec(m, ['YENI-DOSYA.txt']), 'yeni kök dosya')
      darMi(calistirSec(m, ['README.md']), 'bilinen kök dosya')
    },
  },
  {
    ad: 'SİLİNMİŞ kod dosyası → tam; silinmiş belge dar kalır ve okuyanı seçer',
    kos: (m) => {
      const var_ = (y: string) => y !== 'src/lib/silinen.ts' && y !== 'docs/a.md' && y !== 'scripts/x/eski.cjs'
      tamMi(calistirSec(m, ['src/lib/silinen.ts'], { dosyaVarMi: var_ }), 'silinen src')
      tamMi(calistirSec(m, ['scripts/x/eski.cjs'], { dosyaVarMi: var_ }), 'silinen betik')
      const belge = calistirSec(m, ['docs/a.md'], { dosyaVarMi: var_ })
      darMi(belge, 'silinen belge')
      dogru(belge.secilen.includes(T_BELGE), 'silinen belgeyi okuyan test seçilmeli')
      // Silinen TEST dosyası içe aktarılmaz: tam gerektirmez
      darMi(calistirSec(m, ['src/lib/__tests__/eski.test.ts'], { dosyaVarMi: (y: string) => y !== 'src/lib/__tests__/eski.test.ts' }), 'silinen test dosyası')
    },
  },
  {
    ad: 'related hatası / geçersiz sonuç / yok iken içe aktarılabilir dosya değişti → tam',
    kos: (m) => {
      const kod = ['src/lib/foo.ts']
      tamMi(
        calistirSec(m, kod, {
          ilgili: () => {
            throw new Error('vitest çöktü')
          },
        }),
        'related fırlattı',
      )
      tamMi(calistirSec(m, kod, { ilgili: () => null }), 'related null')
      tamMi(calistirSec(m, kod, { ilgili: () => 'x' }), 'related metin')
      tamMi(calistirSec(m, kod, { ilgili: () => [1, 2] }), 'related sayı dizisi')
      tamMi(calistirSec(m, kod, { ilgili: undefined }), 'related yok')
      darMi(calistirSec(m, ['docs/a.md'], { ilgili: undefined }), 'belge için related gerekmez')
    },
  },
  {
    ad: 'sec ASLA fırlatmaz (bozuk girdi, fırlatan getter)',
    kos: (m) => {
      const bomba = {
        get degisenDosyalar(): never {
          throw new Error('getter')
        },
      }
      for (const girdi of [undefined, null, 5, 'x', [], bomba]) {
        const s = m.sec(girdi)
        // Mesajda `JSON.stringify(girdi)` KULLANILMAZ: fırlatan getter'ı testin kendisi tetikler ve `sec`in fırlatıp fırlatmadığı karışır.
        dogru(typeof s === 'object' && s !== null && s.tam === true, `bozuk girdi (${typeof girdi}) → tam bekleniyordu`)
      }
    },
  },
  {
    ad: 'belirlenimli: değişen dosya ve test listesi SIRASI sonucu değiştirmez (4 shard seçiciyi ayrı koşar)',
    kos: (m) => {
      const degisen = ['docs/a.md', 'docs/audits/n.md', 'src/lib/foo.ts', T_SAF]
      const kos = (d: string[], t: string[]) => m.sec({ degisenDosyalar: d, testDosyalari: t, harita: haritaKur(), ilgili: () => [T_SAF, T_GLOB], tazelik: tazelikKur() })
      const normal = kos(degisen, [...TESTLER])
      esit(kos([...degisen].reverse(), [...TESTLER].reverse()), normal, 'ters sıra')
      esit(kos([...degisen, ...degisen], [...TESTLER]), normal, 'yinelenen değişen dosyalar')
      const tamNormal = calistirSec(m, ['package.json'])
      esit(m.sec({ degisenDosyalar: ['package.json'], testDosyalari: [...TESTLER].reverse(), harita: haritaKur() }), tamNormal, 'tam sonucu da sıralı')
    },
  },
  {
    ad: 'çıktı sıralı ve tekil; tam olmayan sonuçta neden özet satırı içerir',
    kos: (m) => {
      const s = calistirSec(m, ['docs/a.md', 'docs/audits/n.md', 'src/lib/foo.ts'], { ilgili: () => [T_SAF, T_SAF, T_BELGE] })
      esit(s.secilen, [...new Set(s.secilen)].sort(), 'sıralı ve tekil')
      dogru(
        s.neden.some((n) => /^seçilen \d+\/\d+ test dosyası$/.test(n)),
        `özet satırı: ${JSON.stringify(s.neden)}`,
      )
    },
  },
]

// ---------------------------------------------------------------------------------------------------------------------------
// SABOTAJ: seçicinin kaynağına TEK hata sokulur; en az bir senaryo kırmızı vermeli.
// ---------------------------------------------------------------------------------------------------------------------------

type Sabotaj = { ad: string; eski: string; yeni: string }

function kureselGirdiSil(girdi: string): Sabotaj {
  return { ad: `küresel liste daralır: ${girdi}`, eski: `  '${girdi}',\n`, yeni: '' }
}

const SABOTAJLAR: Sabotaj[] = [
  ...Object.keys(KURESEL_ORNEKLER).map(kureselGirdiSil),
  { ad: 'harita eşleşmeleri yok sayılır (satırlar siliniyor gibi)', eski: 'for (const t of haritaEslesmeleri(indeks, y)) {', yeni: 'for (const t of []) {' },
  { ad: 'haritada kaydı olmayan test seçilmez ("bilinmeyen test seçilmez")', eski: 'if (nedeni) secilen.add(t);', yeni: "if (nedeni && nedeni !== 'kayitsiz') secilen.add(t);" },
  { ad: 'bayat kayıtlı test seçilmez', eski: "nedeni = 'bayat';", yeni: 'nedeni = null;' },
  { ad: 'belirsiz test seçilmez', eski: "nedeni = 'belirsiz';", yeni: 'nedeni = null;' },
  { ad: '`tam` sonucunda boş seçim döner', eski: 'return { tam: true, secilen: hepsi, neden:', yeni: 'return { tam: true, secilen: [], neden:' },
  { ad: '`tam` bayrağı düşer (secilen dolu ama tam=false)', eski: 'return { tam: true, secilen: hepsi, neden:', yeni: 'return { tam: false, secilen: hepsi, neden:' },
  { ad: 'değişen test dosyası seçilmez', eski: 'for (const y of degisenTestler) if (liste.has(y)) secilen.add(y);', yeni: 'for (const y of degisenTestler) if (liste.has(y)) void y;' },
  { ad: 'related sonucu eklenmez', eski: 'secilen.add(norm.yol);', yeni: 'void norm.yol;' },
  {
    ad: 'related hatası tam yerine boş sonuç sayılır',
    eski: 'return tamSonuc([`vitest related hesaplanamadı (${hataMetni(e)}): güvenli tarafta tam`], testDosyalari);',
    yeni: 'sonuc = [];',
  },
  {
    ad: 'geçersiz related sonucu tam yerine boş sayılır',
    eski: "if (!dizgeDizisiMi(sonuc)) return tamSonuc(['vitest related sonucu yok ya da geçersiz: güvenli tarafta tam'], testDosyalari);",
    yeni: 'if (!dizgeDizisiMi(sonuc)) sonuc = [];',
  },
  { ad: 'bayat harita denetimi kalkar', eski: 'tazelik.arac !== harita.arac', yeni: 'false' },
  { ad: 'bilinmeyen kök denetimi kalkar', eski: "if (!kokler.has(y.split('/')[0]))", yeni: 'if (false)' },
  { ad: 'silinmiş kod denetimi kalkar', eski: 'dosyaVarMi(y) === false) {\n      return tamSonuc([`${y}: silinmiş', yeni: 'false) {\n      return tamSonuc([`${y}: silinmiş' },
  { ad: '2000 dosya sınırı gevşer', eski: 'degisenDosyalar.length >= DOSYA_SINIRI)', yeni: 'degisenDosyalar.length >= DOSYA_SINIRI * 10)' },
  { ad: 'boş değişen liste denetimi kalkar', eski: 'if (degisenDosyalar.length === 0) return tamSonuc(', yeni: 'if (false) return tamSonuc(' },
  { ad: '`..` bileşeni kabul edilir', eski: `if (parca === '..') return { sebep: "yol '..' bileşeni içeriyor" };`, yeni: "if (parca === '..') continue;" },
  { ad: 'mutlak yol kabul edilir', eski: "if (duz.charAt(0) === '/' || /^[A-Za-z]:/.test(duz)) return { sebep: 'yol mutlak' };", yeni: '' },
  { ad: 'kontrol karakteri kabul edilir', eski: 'if (kontrolVarMi(ham)) return {', yeni: 'if (false) return {' },
  { ad: 'çok uzun yol kabul edilir', eski: 'if (ham.length > EN_UZUN_YOL) return', yeni: 'if (false) return' },
  { ad: 'dizin eşleşmesi torun dosyaya da yayılır', eski: "tumu(indeks.dizin.get(uste.length > 0 ? uste[uste.length - 1] : '.'));", yeni: 'for (const u of uste) tumu(indeks.dizin.get(u));' },
  { ad: 'olumsuz glob deseni yok sayılır', eski: '!grup.derli.eksi.some((f) => f(yol))', yeni: 'true' },
  { ad: 'haritanın küresel listeleri yok sayılır', eski: '|| haritaKureselNedeni(harita, y);', yeni: ';' },
  { ad: 'sınıflayıcı girdileri yok sayılır', eski: '...siniflayiciGirdileri(siniflayici)', yeni: '' },
  { ad: 'sınıflayıcıdan src/ da alınır', eski: "Object.freeze(['src/', 'public/'])", yeni: 'Object.freeze([])' },
  { ad: 'liste dışı test seçilir', eski: 'if (liste.has(t)) secilen.add(t);', yeni: 'secilen.add(t);' },
  { ad: 'sec hata atınca yakalanmaz', eski: '} catch (e) {\n    return tamSonuc([`seçim sırasında beklenmeyen hata', yeni: '} catch (e) {\n    throw e;\n    return tamSonuc([`seçim sırasında beklenmeyen hata' },
  { ad: 'kök eşleşmesi alt dizine de yayılır (docs/package.json küresel olur)', eski: "const kokteMi = yol.indexOf('/') === -1;", yeni: 'const kokteMi = true;' },
  { ad: 'silinen test dosyası da tam üretir', eski: ' && !TEST_DESENI.test(y);', yeni: ';' },
  { ad: 'çıktı sıralanmaz (girdi sırasına bağımlı)', eski: 'const sirali = [...secilen].sort();', yeni: 'const sirali = [...secilen];' },
  { ad: 'tam sonucu sıralanmaz', eski: "testDosyalari.filter((t) => typeof t === 'string').sort()", yeni: "testDosyalari.filter((t) => typeof t === 'string')" },
  { ad: 'alt ağaç eşleşmesi önek sınırını kaybeder (standards-ekstra eşleşir)', eski: 'for (const u of uste) tumu(indeks.ozy.get(u));', yeni: 'for (const [k, v] of indeks.ozy) if (yol.startsWith(k)) tumu(v);' },
]

function sabotajliModul(sabotaj: Sabotaj, dizin: string, sira: number): Modul {
  const parca = KAYNAK.split(sabotaj.eski)
  if (parca.length !== 2) throw new Error(`sabotaj noktası kaynakta TAM BİR KEZ bulunmalı (${parca.length - 1} kez): ${sabotaj.ad}`)
  const hedef = path.join(dizin, `test-sec-sabotaj-${sira}.cjs`)
  writeFileSync(hedef, parca.join(sabotaj.yeni), 'utf8')
  return createRequire(hedef)(hedef) as Modul
}

function senaryoHatalari(m: Modul): string[] {
  const hatalar: string[] = []
  for (const s of SENARYOLAR) {
    try {
      s.kos(m)
    } catch (e) {
      hatalar.push(`${s.ad} → ${e instanceof Error ? e.message.slice(0, 120) : String(e)}`)
    }
  }
  return hatalar
}

describe('INV-TEST-SEC-1 · 1. gerçek modül: her senaryo yeşil', () => {
  it.each(SENARYOLAR.map((s) => [s.ad, s] as const))('%s', (_ad, senaryo) => {
    senaryo.kos(M)
  })
})

describe('INV-TEST-SEC-1 · 2. sabotaj: seçicinin kaynağına konan her tek hata en az bir senaryoyu KIRMIZIYA çevirir', () => {
  const dizin = mkdtempSync(path.join(tmpdir(), 'test-sec-sabotaj-'))
  it.each(SABOTAJLAR.map((s, i) => [s.ad, s, i] as const))('%s', (_ad, sabotaj, sira) => {
    const kopya = sabotajliModul(sabotaj, dizin, sira)
    const hatalar = senaryoHatalari(kopya)
    expect(hatalar.length, `sabotaj HİÇBİR senaryoyu kırmızıya çevirmedi: "${sabotaj.ad}" — bu karar testle korunmuyor`).toBeGreaterThan(0)
  })
})

describe('INV-TEST-SEC-1 · 3. küresel girdi örnek tablosu', () => {
  it('her küresel girdinin örneği var ve örnek tablosunda fazlalık yok', () => {
    expect([...M.KURESEL_GIRDILER].sort()).toEqual(Object.keys(KURESEL_ORNEKLER).sort())
  })
  it('vitest/playwright/test kurulum dosyaları ve scripts/ci küreseldir (karar 308 listesi)', () => {
    const zorunlu = ['.github/', 'scripts/ci/', 'scripts/assert-node-major.mjs', 'supabase/migrations/', 'package.json', 'pnpm-lock.yaml', 'tsconfig*.json', 'vitest*', 'playwright*', 'next.config.*']
    for (const g of zorunlu) expect(M.KURESEL_GIRDILER, `karar 308 küresel listesinde ${g} olmalı`).toContain(g)
  })
})

describe('INV-TEST-SEC-1 · 4. glob eşleştirici (olumlu, olumsuz, süslü parantez, tanınmayan söz dizimi → daha geniş)', () => {
  const tablo: Array<[string[], string, boolean]> = [
    [['src/**/*.{ts,tsx}'], 'src/a.ts', true],
    [['src/**/*.{ts,tsx}'], 'src/a/b/c.tsx', true],
    [['src/**/*.{ts,tsx}'], 'src/a.js', false],
    [['src/**/*.{ts,tsx}'], 'docs/src/a.ts', false],
    [['src/**/*.{ts,tsx}'], 'srcx/a.ts', false],
    [['supabase/migrations/*.sql'], 'supabase/migrations/20260101_x.sql', true],
    [['supabase/migrations/*.sql'], 'supabase/migrations/alt/x.sql', false],
    [['supabase/functions/**/*.ts'], 'supabase/functions/a/b/index.ts', true],
    [['.githooks/*'], '.githooks/pre-commit', true],
    [['package.json'], 'package.json', true],
    [['package.json'], 'docs/package.json', false],
    [['src/{views,hooks}/**/*.ts'], 'src/hooks/a/b.ts', true],
    [['src/{views,hooks}/**/*.ts'], 'src/lib/b.ts', false],
    [['a/{b,c{d,e}}/x'], 'a/ce/x', true],
    [['a/{b,c{d,e}}/x'], 'a/c/x', false],
    [['src/*.ts', '!src/gen.ts'], 'src/gen.ts', false],
    [['src/*.ts', '!src/gen.ts'], 'src/a.ts', true],
    [['src/**', '!**/*.compiled.*.ts'], 'src/a/x.compiled.1.ts', false],
    [['src/**', '!**/*.compiled.*.ts'], 'src/a/x.ts', true],
    [['**/*.md'], 'docs/a/b.md', true],
    [['**/*.md'], 'a.md', true],
    [['src/a?.ts'], 'src/ab.ts', true],
    [['src/a?.ts'], 'src/a/.ts', false],
    [['src/[ab].ts'], 'src/a.ts', true],
    [['src/[!ab].ts'], 'src/a.ts', false],
    // tanınmayan söz dizimi (extglob): SABİT ÖNEKİN tüm alt ağacına genişler (daha çok eşleşir: güvenli yön)
    [['src/@(a|b)/x.ts'], 'src/a/x.ts', true],
    [['src/@(a|b)/x.ts'], 'src/zzz/yy/x.ts', true],
    [['src/@(a|b)/x.ts'], 'docs/x.ts', false],
    [['@(a|b)/x.ts'], 'docs/x.ts', true],
  ]
  it.each(tablo)('%j ↔ %s = %s', (desenler, yol, beklenen) => {
    expect(M.globEslesir(desenler, yol)).toBe(beklenen)
  })
  it('olumsuz desen tanınmayan söz dizimiyse YOK SAYILIR (daha az dışlar: güvenli)', () => {
    expect(M.globEslesir(['src/**', '!src/@(a|b)/**'], 'src/a/x.ts')).toBe(true)
  })
  it('süslü parantez açılımı patlamasında (>1000) önek eşleşmesine düşer', () => {
    const patlama = `x/${Array.from({ length: 11 }, () => '{a,b}').join('')}/y.ts`
    expect(M.suslerleAc(patlama)).toBeNull()
    expect(M.globEslesir([patlama], 'x/herhangi/y.ts')).toBe(true)
  })
  it('sabit önek: ilk özel karakterli bileşenden önce', () => {
    expect(M.sabitOnek('src/**/*.ts')).toBe('src')
    expect(M.sabitOnek('supabase/migrations/*.sql')).toBe('supabase/migrations')
    expect(M.sabitOnek('**/x.ts')).toBe('')
    expect(M.sabitOnek('package.json')).toBe('package.json')
  })
})

describe('INV-TEST-SEC-1 · 5. CLI (calistir): çıktı sözleşmesi, hata → tam, çıktı enjeksiyonu', () => {
  function kokKur(): string {
    const kok = mkdtempSync(path.join(tmpdir(), 'test-sec-cli-'))
    mkdirSync(path.join(kok, 'scripts/ci'), { recursive: true })
    for (const t of [T_SAF, T_BELGE]) {
      mkdirSync(path.dirname(path.join(kok, t)), { recursive: true })
      writeFileSync(path.join(kok, t), `// ${t}\n`)
    }
    return kok
  }
  function haritaYaz(kok: string): void {
    const h: Harita = {
      surum: 1,
      uretim: { vitest: 'x', kip: 'dislan', node: '22' },
      arac: M.aracOzeti(kok),
      kokler: ['docs', 'scripts', 'src'],
      kuresel: [],
      kuresel_desenler: [],
      testler: {
        [T_BELGE]: { sha: M.icerikOzeti(`// ${T_BELGE}\n`), okunan: ['docs/a.md'] },
        [T_SAF]: { sha: M.icerikOzeti(`// ${T_SAF}\n`) },
      },
    }
    writeFileSync(path.join(kok, 'scripts/ci/test-haritasi.json'), JSON.stringify(h))
  }
  const oturum = (testler: string[]) => async () => ({ testler, ilgili: async () => [] as string[], kapat: async () => undefined })

  async function kos(kok: string, git: (args: string[]) => string, ek: Record<string, unknown> = {}, argv: string[] = []) {
    const yazilan: string[] = []
    const cikti = path.join(kok, 'githubcikti.txt')
    const sonuc = await M.calistir(argv, { gitCalistir: git, oturumAc: oturum([T_BELGE, T_SAF]), ortam: { GITHUB_OUTPUT: cikti }, kok, yaz: (m: string) => yazilan.push(m), ...ek })
    let githubCikti = ''
    try {
      githubCikti = readFileSync(cikti, 'utf8')
    } catch {
      githubCikti = ''
    }
    return { sonuc, yazilan: yazilan.join(''), githubCikti }
  }

  it('belge değişimi: dar seçim, JSON satırı, ::notice:: ve GITHUB_OUTPUT üç satır', async () => {
    const kok = kokKur()
    haritaYaz(kok)
    const s = await kos(kok, () => 'docs/a.md\0')
    expect(s.sonuc.tam).toBe(false)
    expect(s.sonuc.secilen).toEqual([T_BELGE])
    expect(s.yazilan).toContain('::notice::test seçimi: 1/2 test dosyası')
    expect(JSON.parse(s.yazilan.split('\n')[0])).toMatchObject({ tam: false, secilenSayisi: 1, toplam: 2 })
    expect(s.githubCikti.trim().split('\n')).toHaveLength(4)
    expect(s.githubCikti).toMatch(/^tam=false\nsecilen-sayisi=1\ntoplam=2\nneden=/)
  })

  it('--vitestsiz: vitest AÇILMAZ; test listesi git ls-files ile; belge değişimi dar seçim verir', async () => {
    const kok = kokKur()
    haritaYaz(kok)
    let oturumAcildi = false
    const git = (args: string[]) => (args.includes('ls-files') ? `${T_BELGE}\0${T_SAF}\0docs/a.md\0` : 'docs/a.md\0')
    const s = await kos(kok, git, { oturumAc: async () => { oturumAcildi = true; throw new Error('vitest açılmamalıydı') } }, ['--vitestsiz'])
    expect(oturumAcildi).toBe(false)
    expect(s.sonuc.tam).toBe(false)
    expect(s.sonuc.secilen).toEqual([T_BELGE])
    expect(s.githubCikti).toMatch(/\ntoplam=2\n/)
  })

  it('--vitestsiz: içe aktarılabilir dosya değiştiyse karar vitest ister: tam=true ve neden "vitest gerekli"', async () => {
    const kok = kokKur()
    haritaYaz(kok)
    const git = (args: string[]) => (args.includes('ls-files') ? `${T_BELGE}\0${T_SAF}\0` : 'src/lib/foo.ts\0docs/a.md\0')
    mkdirSync(path.join(kok, 'src/lib'), { recursive: true })
    writeFileSync(path.join(kok, 'src/lib/foo.ts'), 'export {}\n')
    const s = await kos(kok, git, {}, ['--vitestsiz'])
    expect(s.sonuc.tam).toBe(true)
    expect(s.sonuc.neden[0]).toMatch(/^vitest gerekli/)
    expect(s.sonuc.secilen).toEqual([T_BELGE, T_SAF].sort())
    expect(s.githubCikti).toMatch(/^tam=true\nsecilen-sayisi=2\ntoplam=2\n/)
  })

  it('--kok: enjekte kökü ezer; harita, test kaynakları ve git çalışma dizini o köke bağlanır', async () => {
    const enjekteKok = mkdtempSync(path.join(tmpdir(), 'test-sec-enjekte-'))
    const gercekKok = kokKur()
    haritaYaz(gercekKok)
    const cagrilar: string[][] = []
    const git = (args: string[]) => {
      cagrilar.push(args)
      return 'docs/a.md\0'
    }
    const s = await kos(enjekteKok, git, {}, ['--kok', gercekKok])
    expect(s.sonuc.secilen).toEqual([T_BELGE])
    expect(cagrilar[0].slice(0, 2)).toEqual(['-C', gercekKok])
  })

  it('--cikti: tam ve liste YOKSA (git hatası) dosya YAZILMAZ ve eskisi silinir (boş dosya "hiçbir şey koşma" diye okunmasın)', async () => {
    const kok = kokKur()
    haritaYaz(kok)
    const dosya = path.join(kok, 'secilen-eski.txt')
    writeFileSync(dosya, 'eski içerik\n')
    const s = await kos(kok, () => { throw new Error('git yok') }, {}, ['--cikti', dosya])
    expect(s.sonuc.tam).toBe(true)
    expect(() => readFileSync(dosya)).toThrow(/ENOENT/)
  })

  it('belirlenimli: değişen dosya ve test listesi SIRASI sonucu değiştirmez', async () => {
    const kok = kokKur()
    haritaYaz(kok)
    const a = await kos(kok, () => 'docs/a.md\0docs/z.md\0docs/b.md\0')
    const b = await kos(kok, () => 'docs/z.md\0docs/b.md\0docs/a.md\0', { oturumAc: oturum([T_SAF, T_BELGE]) })
    expect(b.sonuc).toEqual(a.sonuc)
  })

  it('--cikti dosyaya seçilen test yollarını satır satır yazar; tam ise TÜM testleri', async () => {
    const kok = kokKur()
    haritaYaz(kok)
    const dosya = path.join(kok, 'secilen.txt')
    await kos(kok, () => 'docs/a.md\0', {}, ['--cikti', dosya])
    expect(readFileSync(dosya, 'utf8')).toBe(`${T_BELGE}\n`)
    await kos(kok, () => 'package.json\0', {}, ['--cikti', dosya])
    expect(readFileSync(dosya, 'utf8').trim().split('\n').sort()).toEqual([T_BELGE, T_SAF].sort())
  })

  it('git hatası, kesik git çıktısı, bilinmeyen argüman, oturum hatası, eksik/bozuk harita → TAM ve GITHUB_OUTPUT tam=true', async () => {
    const kok = kokKur()
    haritaYaz(kok)
    const durumlar: Array<[string, () => ReturnType<typeof kos>]> = [
      [
        'git hata',
        () =>
          kos(kok, () => {
            throw new Error('git yok')
          }),
      ],
      ['kesik çıktı', () => kos(kok, () => 'docs/a.md')],
      ['bilinmeyen argüman', () => kos(kok, () => 'docs/a.md\0', {}, ['--yanlis'])],
      [
        'oturum açılamıyor',
        () =>
          kos(kok, () => 'src/lib/x.ts\0', {
            oturumAc: async () => {
              throw new Error('vitest yok')
            },
          }),
      ],
      ['harita yok', () => kos(mkdtempSync(path.join(tmpdir(), 'test-sec-bos-')), () => 'docs/a.md\0')],
    ]
    for (const [ad, calis] of durumlar) {
      const s = await calis()
      expect(s.sonuc.tam, ad).toBe(true)
      expect(s.githubCikti, ad).toMatch(/^tam=true\n/)
    }
    writeFileSync(path.join(kok, 'scripts/ci/test-haritasi.json'), '{bozuk')
    const bozuk = await kos(kok, () => 'docs/a.md\0')
    expect(bozuk.sonuc.tam).toBe(true)
  })

  it('içe aktarılabilir dosya değişince related çağrılır; sonucu seçime katılır', async () => {
    const kok = kokKur()
    haritaYaz(kok)
    mkdirSync(path.join(kok, 'src/lib'), { recursive: true })
    writeFileSync(path.join(kok, 'src/lib/foo.ts'), 'export {}\n')
    const cagrilar: string[][] = []
    const s = await kos(kok, () => 'src/lib/foo.ts\0', {
      oturumAc: async () => ({
        testler: [T_BELGE, T_SAF],
        ilgili: async (d: string[]) => {
          cagrilar.push(d)
          return [T_SAF]
        },
        kapat: async () => undefined,
      }),
    })
    expect(cagrilar).toEqual([['src/lib/foo.ts']])
    expect(s.sonuc.tam).toBe(false)
    expect(s.sonuc.secilen).toContain(T_SAF)
  })

  it('ÇIKTI ENJEKSİYONU: satır sonlu / iş akışı komutlu dosya adı tek satırlık neden olur, ek çıktı satırı yazamaz', async () => {
    const kok = kokKur()
    haritaYaz(kok)
    const kotu = 'docs/a\ntam=false\n::error::sahte.md'
    const s = await kos(kok, () => `${kotu}\0`)
    expect(s.sonuc.tam).toBe(true)
    const satirlar = s.githubCikti.trim().split('\n')
    expect(satirlar).toHaveLength(4)
    expect(satirlar[0]).toBe('tam=true')
    expect(satirlar[3]).toMatch(/^neden=/)
    expect(satirlar[3]).not.toMatch(/::error::/)
    expect(s.yazilan.split('\n').filter((l) => l.startsWith('::error::'))).toEqual([])
  })

  it('GERÇEK harita ve GERÇEK git ile (vitest\'siz kip): belge değişimi daraltır, belirsiz testler HER ZAMAN seçilir, küresel dosya tam verir', () => {
    const calistir = (degisen: string[]) => {
      const dosya = path.join(mkdtempSync(path.join(tmpdir(), 'test-sec-gercek-')), 'degisen.txt')
      writeFileSync(dosya, `${degisen.join('\n')}\n`)
      const r = spawnSync(process.execPath, [KAYNAK_YOLU, '--vitestsiz', '--json', '--degisen-dosya', dosya], { cwd: KOK, encoding: 'utf8' })
      expect(r.status, r.stderr).toBe(0)
      return JSON.parse(r.stdout.split('\n')[0]) as { tam: boolean; secilenSayisi: number; toplam: number; secilen: string[]; neden: string[] }
    }
    const harita = JSON.parse(readFileSync(path.join(KOK, 'scripts/ci/test-haritasi.json'), 'utf8')) as Harita
    const belirsizler = Object.entries(harita.testler)
      .filter(([, k]) => (k.belirsiz ?? []).length > 0)
      .map(([t]) => t)
    const dar = calistir(['docs/uydurma-klasor/hicbir-test-okumaz.md'])
    expect(dar.tam, JSON.stringify(dar.neden)).toBe(false)
    expect(dar.secilenSayisi).toBeGreaterThan(0)
    expect(dar.secilenSayisi, 'seçim gerçekten daralmalı').toBeLessThan(dar.toplam * 0.5)
    for (const t of belirsizler) expect(dar.secilen, `belirsiz test her zaman seçilmeli: ${t}`).toContain(t)
    const tam = calistir(['package.json'])
    expect(tam.tam).toBe(true)
    expect(tam.secilenSayisi).toBe(tam.toplam)
    const kod = calistir(['src/lib/audit.ts'])
    expect(kod.tam, 'içe aktarılabilir dosya vitest ister (kurulumdan önce kipte)').toBe(true)
    expect(kod.neden[0]).toMatch(/^vitest gerekli/)
  })

  describe('--yerel (pnpm test:ilgili): tek komut', () => {
    function yerelKos(kok: string, degisenIzlenen: string, yeniler: string, ek: Record<string, unknown> = {}, argv: string[] = ['--yerel']) {
      const komutlar: string[][] = []
      const git = (args: string[]): string => {
        komutlar.push(args)
        if (args.includes('merge-base')) return 'abc1234\n'
        if (args.includes('diff')) return degisenIzlenen
        if (args.includes('ls-files')) return yeniler
        return ''
      }
      const kosulan: string[][] = []
      const yazilan: string[] = []
      const sonuc = M.calistir(argv, {
        gitCalistir: git,
        oturumAc: oturum([T_BELGE, T_SAF]),
        kok,
        yaz: (m: string) => yazilan.push(m),
        vitestKos: (_k: string, d: string[]) => {
          kosulan.push(d)
          return 7
        },
        ...ek,
      })
      return sonuc.then((s) => ({ sonuc: s, komutlar, kosulan, yazilan: yazilan.join('') }))
    }

    it('değişenler tabana (merge-base) göre git\'ten alınır (kayıtlı + izlenmeyen yeni); seçilen testler vitest\'e verilir; çıkış kodu vitest\'in', async () => {
      const kok = kokKur()
      haritaYaz(kok)
      const s = await yerelKos(kok, 'docs/a.md\0', 'docs/yeni-dosya.md\0')
      expect(s.komutlar.find((c) => c.includes('merge-base'))).toEqual(['-C', kok, 'merge-base', 'HEAD', 'origin/master'])
      expect(s.komutlar.find((c) => c.includes('diff'))).toEqual(['-C', kok, 'diff', '--name-only', '-z', '--no-renames', 'abc1234'])
      expect(s.komutlar.find((c) => c.includes('ls-files'))).toEqual(['-C', kok, 'ls-files', '--others', '--exclude-standard', '-z'])
      expect(s.kosulan).toEqual([[T_BELGE]])
      expect(s.sonuc.cikisKodu).toBe(7)
      expect(s.yazilan).toMatch(/^Seçilen 1\/2 test dosyası/)
    })

    it('TAM\'a düşerse "TAM: sebep" yazar ve HİÇBİR test koşmaz (yerelde tam paket yok); çıkış kodu 0', async () => {
      const kok = kokKur()
      haritaYaz(kok)
      const s = await yerelKos(kok, 'package.json\0', '')
      expect(s.yazilan).toMatch(/^TAM: package\.json: küresel dosya \(package\.json\)/)
      expect(s.yazilan).toContain('pnpm test -- --run')
      expect(s.kosulan).toEqual([])
      expect(s.sonuc.cikisKodu).toBe(0)
      expect(s.sonuc.tam).toBe(true)
    })

    it('--kuru yalnız listeler; değişiklik yoksa oturum açılmaz ve vitest koşmaz', async () => {
      const kok = kokKur()
      haritaYaz(kok)
      const kuru = await yerelKos(kok, 'docs/a.md\0', '', {}, ['--yerel', '--kuru'])
      expect(kuru.kosulan).toEqual([])
      expect(kuru.yazilan).toContain(`  ${T_BELGE}`)
      expect(kuru.sonuc.cikisKodu).toBe(0)
      let oturumAcildi = false
      const yok = await yerelKos(kok, '', '', { oturumAc: async () => { oturumAcildi = true; throw new Error('açılmamalı') } })
      expect(yok.yazilan).toMatch(/Değişiklik yok/)
      expect(yok.kosulan).toEqual([])
      expect(oturumAcildi).toBe(false)
      expect(yok.sonuc.cikisKodu).toBe(0)
    })

    it('taban bulunamaz ya da git hata verirse "TAM:" yazar, koşmaz, çıkış 0; --taban istenen ref\'i kullanır', async () => {
      const kok = kokKur()
      haritaYaz(kok)
      const hatali = await M.calistir(['--yerel'], {
        gitCalistir: () => {
          throw new Error('git yok')
        },
        oturumAc: oturum([T_BELGE]),
        kok,
        yaz: () => undefined,
        vitestKos: () => 9,
      })
      expect(hatali.tam).toBe(true)
      expect(hatali.cikisKodu).toBe(0)
      const s = await yerelKos(kok, 'docs/a.md\0', '', {}, ['--yerel', '--kuru', '--taban', 'release/x'])
      expect(s.komutlar.find((c) => c.includes('merge-base'))).toEqual(['-C', kok, 'merge-base', 'HEAD', 'release/x'])
      expect(s.kosulan).toEqual([])
    })
  })

  it('satirTemizle: kontrol karakteri → boşluk, % silinir, :: tek olur, 300 karakterde kesilir', () => {
    expect(M.satirTemizle('a\nb\r\tc')).toBe('a b  c')
    expect(M.satirTemizle('100%25 ::error::x')).toBe('10025 :error:x')
    expect(M.satirTemizle('x'.repeat(400)).length).toBe(301)
  })

  it('yollariAyir: NUL ile bitmeyen (kesik) çıktı FIRLATIR; boş çıktı = değişiklik yok', () => {
    expect(M.yollariAyir('')).toEqual([])
    expect(M.yollariAyir('a\0b\0')).toEqual(['a', 'b'])
    expect(() => M.yollariAyir('a\0b')).toThrow(/NUL/)
    expect(() => M.yollariAyir(5)).toThrow()
  })

  it('ilgiliAdaylari: yalnız var olan, test olmayan, içe aktarılabilir dosyalar', () => {
    expect(M.ilgiliAdaylari(['a.ts', 'b.md', 'c.test.ts', 'd.json', 'e.csv', 'f.sql'], (y) => y !== 'd.json')).toEqual(['a.ts'])
    expect(M.ilgiliAdaylari(['a.ts', 'd.json'])).toEqual(['a.ts', 'd.json'])
  })
})
