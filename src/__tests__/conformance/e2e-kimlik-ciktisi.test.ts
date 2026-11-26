import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-E2E-CIKTI-1 · giriş yapan testlerin çıktısı kimlik bilgisi taşıyabilir; yüklenmez (ALT-226).
 *
 * NİÇİN: depo herkese açık, E2E testleri gerçek hesapla giriş yapar. Playwright'ın trace ve video
 * kaydı girilen değerleri ve oturum verisini taşıyabilir. Kural üç ayaklı:
 *   1) kök Playwright ayarında trace ve video KAPALI;
 *   2) hiçbir spec ve hiçbir iş akışı bunları yeniden açmaz;
 *   3) hiçbir iş akışı Playwright çıktısını ya da giriş sırrı kullanan işin dosyasını yüklemez;
 *      hata ayıklama günlüğü (DEBUG, PWDEBUG) açılmaz; test hata mesajı yanıt gövdesi taşımaz (ALT-227).
 * Canlıya yazan tek seferlik ayrı yol: `canli-kanit-yalitimi.test.ts` (INV-CANLI-KANIT-1).
 */

const KOK = path.resolve(__dirname, '../../..')
const oku = (g: string) => fs.readFileSync(path.join(KOK, g), 'utf8').replace(/\r\n/g, '\n')
/** Alt klasörler dahil; klasör yoksa boş liste. */
function dosyalar(klasor: string, sonek: RegExp): string[] {
  const tam = path.join(KOK, klasor)
  if (!fs.existsSync(tam)) return []
  return fs.readdirSync(tam, { withFileTypes: true }).flatMap((g) => {
    const yol = `${klasor}/${g.name}`
    if (g.isDirectory()) return dosyalar(yol, sonek)
    return sonek.test(g.name) ? [yol] : []
  })
}

/** Yorum satırları kural metnini anlatabilir; ölçüm yalnız etkin satırlara bakar. */
const yorumsuz = (metin: string) =>
  metin
    .split('\n')
    .filter((s) => !/^\s*(#|\/\/|\*|\/\*)/.test(s))
    .join('\n')

function ayarDenetle(ayar: string): string[] {
  const kod = yorumsuz(ayar)
  const ihlal: string[] = []
  for (const anahtar of ['trace', 'video']) {
    const desen = new RegExp(`\\b${anahtar}["']?\\s*:\\s*([^,\\n}]+)`, 'g')
    const degerler = [...kod.matchAll(desen)].map((m) => m[1].trim())
    if (degerler.length === 0) ihlal.push(`${anahtar}: ayarda açıkça yazılı değil`)
    for (const d of degerler) if (d !== "'off'") ihlal.push(`${anahtar}: ${d} (yalnız 'off')`)
  }
  return ihlal
}

function specDenetle(ad: string, spec: string): string[] {
  const kod = yorumsuz(spec)
  const acik = [...kod.matchAll(/\b(trace|video)["']?\s*:(?!\s*'off')\s*[^,\n}]+/g)].map((m) => `${ad}: ${m[0].trim()}`)
  if (/\.text\(\)\)?\.slice\(/.test(kod)) acik.push(`${ad}: yanıt gövdesi kırpılıp taşınıyor`)
  // Giriş yapan dosyada yanıt gövdesi mesaja, nesneye ya da kırpmaya girmez. Kilit bilinen kalıpları
  // yakalar (aşağıdaki sabotaj listesi); page.evaluate içinden dönen gövde gibi dolaylı yollar kapsam dışı.
  // Herkese açık sayfa HTML'ini okuyan dosyalar (ssr-html, dil-dususu) giriş sırrı kullanmaz; kapsam dışı.
  if (/E2E_[A-Z_]*(PASSWORD|EMAIL|TOKEN|SECRET)/.test(kod)) {
    const govdeDegiskeni = [...kod.matchAll(/(?:const|let|var)\s+(\w+)\s*=\s*await\s+[\w.]+\.(?:text|json)\(\)/g)].map((m) => m[1])
    const kirpilan = govdeDegiskeni.some((d) =>
      [
        `\\b${d}\\s*\\.\\s*(slice|substring|substr)\\s*\\(`,
        `\\bexpect\\([^\\n]*,\\s*${d}\\b`,
        `\\$\\{\\s*${d}\\b`,
        `\\bbody\\s*:\\s*${d}\\b`,
        `JSON\\.stringify\\(\\s*${d}\\b`,
      ].some((k) => new RegExp(k).test(kod)),
    )
    const tasinan =
      kirpilan ||
      /\.(?:text|json)\(\)\)?\s*\.\s*(slice|substring|substr)\s*\(/.test(kod) ||
      /\.(?:text|json)\(\)\s*\.then\(\s*\(?\s*\w+\s*\)?\s*=>\s*\w+\s*\.\s*(slice|substring|substr)\s*\(/.test(kod) ||
      /\bbody\s*:\s*(?:\(\s*)?await\s+[\w.]+\.(?:text|json)\(\)/.test(kod) ||
      /JSON\.stringify\(\s*await\s+[\w.]+\.json\(\)/.test(kod) ||
      /\$\{\s*(?:\(\s*)?await\s+[\w.]+\.(?:text|json)\(\)/.test(kod)
    if (tasinan) acik.push(`${ad}: giriş yapan dosyada yanıt gövdesi taşınıyor`)
  }
  if (/\btracing\.start\s*\(/.test(kod) || /\brecordVideo\b|\brecordHar\b/.test(kod)) acik.push(`${ad}: elle kayıt başlatılıyor`)
  return acik
}

function isAkisiDenetle(ad: string, yml: string): string[] {
  const kod = yorumsuz(yml)
  const ihlal: string[] = []
  // Dışarı dosya çıkaran her yol: yükleme eylemleri (ad büyük/küçük harf fark etmez), önbelleğe yazma, sürüm eki.
  const yukluyor = /uses:\s*\S*(upload|release)\S*@/i.test(kod) || /\bgh\s+release\s+(upload|create)\b/.test(kod)
  const onbellek = /uses:\s*["']?actions\/cache(\/save)?@/i.test(kod)
  const ciktiYolu = /playwright-report|test-results|blob-report/.test(kod)
  const sirli = /E2E_[A-Z_]*PASSWORD/.test(kod)
  const testKosan = sirli || /playwright\s+test\b/.test(kod)
  if (/--(trace|video)[ =]/.test(kod)) ihlal.push(`${ad}: komut satırından trace/video açılıyor`)
  if ((yukluyor || onbellek) && ciktiYolu) ihlal.push(`${ad}: Playwright çıktısı yükleniyor`)
  if (yukluyor && sirli) ihlal.push(`${ad}: giriş sırrı kullanan iş akışı dosya yüklüyor`)
  if (testKosan && /\b(PWDEBUG|DEBUG)\s*[:=]/.test(kod)) ihlal.push(`${ad}: hata ayıklama günlüğü açılıyor`)
  if (sirli && /secrets:\s*inherit/.test(kod)) ihlal.push(`${ad}: sırlar başka iş akışına topluca geçiriliyor`)
  if (sirli && /uses:\s*\.\//.test(kod)) ihlal.push(`${ad}: giriş sırrı kullanan iş akışında denetlenmeyen yerel eylem`)
  return ihlal
}

describe('INV-E2E-CIKTI-1 · kimlik bilgisi taşıyabilecek test çıktısı yüklenmez', () => {
  const ayar = oku('playwright.config.ts')
  const specler = [...dosyalar('e2e', /\.ts$/), ...dosyalar('e2e-canli', /\.ts$/)]
  const isAkislari = [...dosyalar('.github/workflows', /\.ya?ml$/), ...dosyalar('.github/actions', /\.ya?ml$/)]
  const smoke = oku('.github/workflows/e2e-smoke.yml')

  it('evren boş değil', () => {
    expect(specler.length).toBeGreaterThan(2)
    expect(specler, 'alt klasör taranmıyor').toContain('e2e/yardimci/oturum-kapat.ts')
    expect(specler, 'canlı kanıt klasörü taranmıyor').toContain('e2e-canli/playwright.config.ts')
    expect(isAkislari).toContain('.github/workflows/e2e-smoke.yml')
    expect(smoke).toMatch(/E2E_ADMIN_PASSWORD/)
  })

  it('kök ayarda trace ve video kapalı', () => {
    expect(ayarDenetle(ayar)).toEqual([])
  })

  it('paket betikleri kayıt ya da hata ayıklama günlüğü açmaz', () => {
    const betikler = Object.values((JSON.parse(oku('package.json')) as { scripts: Record<string, string> }).scripts)
    expect(betikler.filter((b) => /playwright/.test(b) && /--(trace|video)[ =]|\b(PWDEBUG|DEBUG)=/.test(b))).toEqual([])
  })

  it('hiçbir spec kaydı yeniden açmaz', () => {
    expect(specler.flatMap((g) => specDenetle(g, oku(g)))).toEqual([])
  })

  it('hiçbir iş akışı Playwright çıktısı ya da giriş yapan işin artefaktını yüklemez', () => {
    expect(isAkislari.flatMap((g) => isAkisiDenetle(g, oku(g)))).toEqual([])
  })

  it.each([
    ['trace açılır', "trace: 'off'", "trace: 'retain-on-failure'"],
    ['video açılır', "video: 'off'", "video: 'on'"],
    ['trace satırı silinir', "trace: 'off',", ''],
    ['tırnaklı anahtarla açılır', "trace: 'off',", "trace: 'off',\n    'video': 'on',"],
  ])('SABOTAJ ayar: %s', (_ad, eski, yeni) => {
    const bozuk = ayar.replace(eski, yeni)
    expect(bozuk).not.toBe(ayar)
    expect(ayarDenetle(bozuk)).not.toEqual([])
  })

  it.each([
    ["test.use({ trace: 'on' })"],
    ["await context.tracing.start({ snapshots: true })"],
    ["const c = await browser.newContext({ recordVideo: { dir: 'v' } })"],
    ['return { status: r.status, body: (await r.text()).slice(0, 120) }'],
  ])('SABOTAJ spec: %s', (satir) => {
    expect(specDenetle('x.e2e.ts', satir)).not.toEqual([])
  })

  const girisli = "const parola = process.env.E2E_ADMIN_PASSWORD\n"
  it.each([
    ['değişkene alıp kırpma', 'const t = await r.text()\nexpect(r.status(), t.slice(0, 120)).toBe(200)'],
    ['substring', 'const t = await r.text()\nconst k = t.substring(0, 50)'],
    ['satır sonlu zincir', 'const k = (await r.text())\n  .slice(0, 80)'],
    ['nesneye gövde', 'return { status: r.status(), body: await r.text() }'],
    ['json metne', 'expect(r.ok(), JSON.stringify(await r.json())).toBe(true)'],
    ['şablona gövde', 'expect(r.ok(), `yanıt: ${await r.text()}`).toBe(true)'],
    ['değişken mesajda', 'const t = await r.text()\nexpect(r.status(), t).toBe(200)'],
    ['değişken şablonda', 'const t = await r.text()\nthrow new Error(`hata ${t}`)'],
    ['değişken nesnede', 'const t = await r.text()\nreturn { body: t }'],
    ['json değişkeni metne', 'const j = await r.json()\nconsole.log(JSON.stringify(j))'],
    ['then ile kırpma', 'const k = await r.text().then((t) => t.slice(0, 80))'],
  ])('SABOTAJ giriş yapan spec: %s', (_ad, satir) => {
    expect(specDenetle('x.e2e.ts', girisli + satir)).not.toEqual([])
  })

  it('giriş sırrı olmayan dosyada sayfa HTML okumak serbest', () => {
    expect(specDenetle('x.e2e.ts', 'const html = await res.text()\nexpect(html).toContain("x")')).toEqual([])
  })

  it('tırnaklı önbellek eylemi de yakalanır', () => {
    expect(isAkisiDenetle('e2e-smoke.yml', smoke + '\n      - uses: "actions/cache@abc"\n        with:\n          path: test-results/\n')).not.toEqual([])
  })

  it.each([
    ['rapor yükleme adımı geri gelir', '\n      - uses: actions/upload-artifact@abc\n        with:\n          path: playwright-report/\n'],
    ['başka adla yükleme', '\n      - uses: actions/upload-artifact@abc\n        with:\n          path: cikti/\n'],
    ['komut satırından trace', '\n      - run: pnpm exec playwright test --trace on\n'],
    ['büyük harfli yükleme eylemi', '\n      - uses: Actions/Upload-Artifact@abc\n'],
    ['sayfa yükleme eylemi', '\n      - uses: actions/upload-pages-artifact@abc\n'],
    ['birleştiren yükleme eylemi', '\n      - uses: actions/upload-artifact/merge@abc\n'],
    ['sürüm eki', '\n      - run: gh release upload v1 cikti.zip\n'],
    ['önbelleğe test çıktısı', '\n      - uses: actions/cache/save@abc\n        with:\n          path: test-results/\n'],
    ['hata ayıklama günlüğü', '\n        env:\n          DEBUG: pw:api\n'],
    ['topluca sır geçişi', '\n    secrets: inherit\n'],
    ['yerel eylem', '\n      - uses: ./.github/actions/x\n'],
  ])('SABOTAJ iş akışı: %s', (_ad, ek) => {
    expect(isAkisiDenetle('e2e-smoke.yml', smoke + ek)).not.toEqual([])
  })
})
