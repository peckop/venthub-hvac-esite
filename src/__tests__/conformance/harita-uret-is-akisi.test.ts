/**
 * INV-HARITA-URET-1 — harita üretim iş akışı SALT-OKUMA ve sırrı yalnız tek adımda taşır (ALT-37a).
 *
 * İş akışı canlı veritabanına service-role anahtarıyla bağlanır; repo PUBLIC. Bu yüzden güvence kod
 * yorumuna değil ölçüme bağlanır (OPS şartları 1-4):
 *  1. tetik YALNIZ workflow_dispatch (fork PR'ı sırrı görmemeli);
 *  2. `permissions` yalnız `contents: read`;
 *  3. sır yalnız tek adımın `env:` bloğunda, yalnız izinli iki ad; hiçbir adım değeri basmaz;
 *  4. artefakt 1 gün saklanır;
 *  5. betik ve üreteçte yazma çağrısı 0.
 * Çıktı denetimi (anahtar/JWT/e-posta) saf fonksiyonlarla ayrıca ölçülür.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { haritaDogrula, sizintiBul } from '../../../scripts/adres/harita-uret-yardimci'

const KOK = process.cwd()
const oku = (yol: string): string => readFileSync(resolve(KOK, yol), 'utf8').replace(/\r\n/g, '\n')

const IS_AKISI = oku('.github/workflows/harita-uret.yml')
/** Yorum satırları çıkarılmış gövde: yorumdaki "pull_request" kelimesi tetik sayılmasın. */
const GOVDE = IS_AKISI.split('\n')
  .filter((s) => !/^\s*#/.test(s))
  .join('\n')

/** Üst düzey anahtarın (`on:`, `permissions:` …) gövdesi: bir sonraki üst düzey anahtara kadar. */
function ustAnahtar(ad: string): string {
  const baslangic = GOVDE.search(new RegExp(`^${ad}:`, 'm'))
  expect(baslangic, `${ad}: bloğu yok`).toBeGreaterThanOrEqual(0)
  const kalan = GOVDE.slice(baslangic).split('\n')
  const govde: string[] = [kalan[0]]
  for (const satir of kalan.slice(1)) {
    if (/^\S/.test(satir)) break
    govde.push(satir)
  }
  return govde.join('\n')
}

describe('INV-HARITA-URET-1 · iş akışı yapısı', () => {
  it('tetik YALNIZ workflow_dispatch', () => {
    const on = ustAnahtar('on')
    const cocuklar = on
      .split('\n')
      .slice(1)
      .filter((s) => /^ {2}\S/.test(s))
      .map((s) => s.trim().replace(/:.*$/, ''))
    expect(cocuklar).toEqual(['workflow_dispatch'])
    for (const yasak of ['pull_request', 'pull_request_target', 'push', 'schedule', 'workflow_run']) {
      expect(GOVDE, `${yasak} tetiği YASAK`).not.toMatch(new RegExp(`^\\s*${yasak}\\s*:`, 'm'))
    }
  })

  it('permissions yalnız contents: read', () => {
    const izin = ustAnahtar('permissions')
    const anahtarlar = izin
      .split('\n')
      .slice(1)
      .filter((s) => s.trim() !== '')
      .map((s) => s.trim())
    expect(anahtarlar).toEqual(['contents: read'])
    expect(GOVDE).not.toMatch(/^\s{4,}permissions\s*:/m) // iş düzeyinde izin genişletme yok
  })

  it('sır YALNIZ izinli iki ad ve YALNIZ tek adımın env bloğunda', () => {
    const kullanimlar = [...GOVDE.matchAll(/secrets\.([A-Z0-9_]+)/g)].map((m) => m[1])
    expect(kullanimlar.sort()).toEqual(['SUPABASE_PROJECT_REF', 'SUPABASE_SERVICE_ROLE_KEY'])

    // Sırrı taşıyan satırlar aynı adımda ve `env:` altında olmalı; iş düzeyi `env:` sır taşımaz.
    const adimlar = GOVDE.split(/^ {6}- name:/m).slice(1)
    const sirliAdimlar = adimlar.filter((a) => /secrets\./.test(a))
    expect(sirliAdimlar).toHaveLength(1)
    const sirliAdim = sirliAdimlar[0]
    const envBasi = sirliAdim.indexOf('env:')
    const runBasi = sirliAdim.indexOf('run:')
    expect(envBasi).toBeGreaterThanOrEqual(0)
    expect(sirliAdim.search(/secrets\./)).toBeGreaterThan(envBasi)
    expect(sirliAdim.search(/secrets\./)).toBeLessThan(runBasi)
    // Sır adımı dışında hiçbir adımda sır değişken adı geçmez.
    for (const a of adimlar.filter((x) => x !== sirliAdim)) expect(a).not.toMatch(/SUPABASE_(SERVICE_ROLE_KEY|PROJECT_REF)/)
  })

  it('hiçbir adım değişken değerini basmaz (echo/printf/cat/env/set -x yok)', () => {
    const runSatirlari = GOVDE.split('\n').filter((s) => /^\s+(run:|\|)|^\s{10,}\S/.test(s))
    for (const s of runSatirlari) {
      expect(s, `değer basan komut: ${s}`).not.toMatch(/\b(echo|printf|cat|printenv|set\s+-x)\b/)
      expect(s).not.toMatch(/\benv\b\s*($|\|)/)
    }
  })

  it('artefakt 1 gün saklanır ve boş dosyada düşer', () => {
    expect(GOVDE).toMatch(/retention-days:\s*1\s*$/m)
    expect(GOVDE).toMatch(/if-no-files-found:\s*error/)
  })

  it('kurulum adımı betik çalıştırmaz (--ignore-scripts) ve sırrı görmez', () => {
    expect(GOVDE).toMatch(/pnpm install --frozen-lockfile --ignore-scripts/)
  })
})

describe('INV-HARITA-URET-1 · yazma çağrısı 0', () => {
  const DOSYALAR = [
    'scripts/adres/harita-uret.ts',
    'scripts/adres/harita-uret-yardimci.ts',
    'src/lib/adres/haritaUret.ts',
  ]
  it.each(DOSYALAR)('%s: yazma çağrısı yok', (dosya) => {
    // Yorum satırları çıkarılır: "insert/update yok" gibi açıklamalar çağrı sayılmasın.
    const kod = oku(dosya)
      .split('\n')
      .filter((s) => !/^\s*(\*|\/\*|\/\/)/.test(s))
      .join('\n')
    expect(kod).not.toMatch(/\.(insert|update|upsert|delete|rpc)\s*\(/)
    expect(kod).not.toMatch(/\.(storage|functions)\b/)
    expect(kod).not.toMatch(/auth\.admin/)
  })
})

describe('INV-HARITA-URET-1 · çıktı denetimi (saf)', () => {
  const ANAHTAR = 'a'.repeat(40)
  it('anahtar değerini, JWT biçimini, e-postayı ve service_role ifadesini yakalar', () => {
    expect(sizintiBul(`{"x":"${ANAHTAR}"}`, ANAHTAR)).toContain('service-role anahtar değeri')
    expect(sizintiBul('{"x":"eyJhbGciOiJIUzI1NiIs.eyJyb2xlIjoic2VydmljZV9y.imza"}', '')).toContain('JWT biçimli dizi')
    expect(sizintiBul('{"x":"biri@ornek.com"}', '')).toContain('e-posta biçimi')
    expect(sizintiBul('{"rol":"service_role"}', '')).toContain('service_role ifadesi')
  })

  it('temiz çıktıda sorun yok; kısa anahtar denetimi atlar', () => {
    expect(sizintiBul('{"aileler":["avens-hiz-anahtarlari"]}', ANAHTAR)).toEqual([])
    expect(sizintiBul(`{"x":"${ANAHTAR}"}`, 'kisa')).toEqual([])
  })

  it('haritaDogrula: geçerli, boş ürün, kiracısız, bozuk JSON ve sızıntılı vakalar', () => {
    expect(haritaDogrula('{"surum":1,"kiracilar":{"k":{"urunSayisi":3}}}')).toEqual([])
    expect(haritaDogrula('{"surum":1,"kiracilar":{"k":{"urunSayisi":0}}}')).toContain('ürün sayısı 0 ya da yok')
    expect(haritaDogrula('{"surum":1,"kiracilar":{}}')).toContain('kiracı yok')
    expect(haritaDogrula('{"surum":2,"kiracilar":{"k":{"urunSayisi":1}}}')).toContain('surum 1 değil')
    expect(haritaDogrula('bozuk')).toEqual(['JSON değil'])
    expect(haritaDogrula('{"surum":1,"kiracilar":{"k":{"urunSayisi":1}},"e":"a@b.co"}')).toContain(
      'yasak içerik: e-posta biçimi'
    )
  })
})
