// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-WRONGSTACK-SAGE-YAMA-1 · sage alan-terimi çıkarıcısı Türkçe harfleri korur (REC-519 kapsam 4).
 *
 * NİÇİN VAR (2026-09-30, ÖLÇÜLDÜ): `@wrongstack/sage` 1.0.26 `SageDomainTermExtractor` yalnız ASCII
 * varsayar. `normalizeTerm("Şerit")` → "erit", `("çıktı")` → "kt", `("ığış")` → "" (boş anahtar: bütün
 * Türkçe-harfli terimler birbirine çarpışır); "İstanbul Şubesi Müdürü" hiç aday olmaz; "ÇıkışKapısı"
 * camelCase sayılmaz. `\b` ASCII-sözcük tanımlıdır, Türkçe harfte kırılır. Yama bunu Unicode sınıflarıyla
 * (`\p{L}` `\p{Lu}` `\p{Ll}`) düzeltir. Kaynak: `yamalar/sage-1.0.26-domain-terms-turkce.patch`.
 *
 * ⛔Bu kapının öğrendiği iki ders kanban yamasından geldi:
 *   (1) yamanın uygulandığını değil, sunucunun YÜKLEDİĞİ dosyanın yamalı olduğunu ölç (kol 5: sage-mcp
 *       `@wrongstack/sage`'i içe aktarır, kendi kopyasını taşımaz — ölçülür);
 *   (2) `git apply` bütün dosyayı CRLF'e çevirdi: depo içinde `.gitattributes` `*.js text` + Windows'ta
 *       `core.eol=native`, depo dışında sistem `core.autocrlf=true`; `autocrlf=false` tek başına ENGELLEMEZ.
 *       Geri alınca bayt bayt eski dosya da gelmiyordu → kurulum betiği `-c core.autocrlf=false -c core.eol=lf`
 *       sabitler (kol 3).
 *
 * Davranış kolları YAMASIZ karşılaştırma taşır: yama gerçekten bir şey yapıyor mu, yoksa test kendi kendini
 * mi doğruluyor — kopya önce yamasız hâle getirilir (kurulu paket zaten yamalıysa geri alınır), sonra yamalanır.
 */
const KOK = process.cwd()
const ARAC = path.join(KOK, 'tools', 'wrongstack-mcp')
const YAMALAR = path.join(ARAC, 'yamalar')
const YAMA_ADI = fs.readdirSync(YAMALAR).find((d) => /^sage-\d+\.\d+\.\d+-domain-terms-turkce\.patch$/.test(d)) ?? 'sage-YAMA-YOK.patch'
const YAMA = path.join(YAMALAR, YAMA_ADI)
const HEDEF = 'tools/wrongstack-mcp/node_modules/@wrongstack/sage/dist/index.js'
const KURULU_INDEX = path.join(KOK, HEDEF)
const KURULU = fs.existsSync(KURULU_INDEX)
const KURULUM_BETIGI = path.join(ARAC, 'kurulum.cjs')

interface Terim {
  term: string
  definition: string
  confidence: number
}
interface Cikarici {
  SageDomainTermExtractor: new () => {
    extractFromConversation: (o: { messages: { role: 'user' | 'agent'; text: string }[]; minConfidence?: number; limit?: number }) => Terim[]
  }
  normalizeTerm: (t: string) => string
}
interface Kurulum {
  yamaSurumFarki: (adlar: string[], kurulu: (ad: string) => string | null) => string[]
  gitApply: (kok: string, yama: string, ek?: string[], stdio?: string) => void
}
const kurulum = createRequire(import.meta.url)(KURULUM_BETIGI) as Kurulum

const gecici: string[] = []
function geciciDizin(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-yama-'))
  gecici.push(d)
  return d
}
afterAll(() => {
  for (const d of gecici) fs.rmSync(d, { recursive: true, force: true })
})

function git(cwd: string, args: string[]) {
  return spawnSync('git', ['-c', 'core.autocrlf=false', '-c', 'core.eol=lf', ...args], { cwd, encoding: 'utf8' })
}

/**
 * Kurulu paketin index.js'inin kopyası; `yamali` istenene göre yamalı ya da yamasız hâle getirilir.
 * `depo`: kopya, gerçek kurulumun koşulunu taklit eder — depo kökündeki `.gitattributes` (`*.js text`) ve
 * yerel `core.autocrlf=false` ile bir git deposu (CRLF'e dönüşen yol tam burada; depo dışında görünmez).
 */
function kopya(yamali: boolean, depo = false): { kok: string; index: string } {
  const kok = geciciDizin()
  if (depo) {
    expect(spawnSync('git', ['init', '-q', '.'], { cwd: kok }).status).toBe(0)
    spawnSync('git', ['config', 'core.autocrlf', 'false'], { cwd: kok })
    fs.copyFileSync(path.join(KOK, '.gitattributes'), path.join(kok, '.gitattributes'))
  }
  const index = path.join(kok, HEDEF)
  fs.mkdirSync(path.dirname(index), { recursive: true })
  fs.copyFileSync(KURULU_INDEX, index)
  const zaten = git(kok, ['apply', '--reverse', '--check', YAMA]).status === 0
  if (zaten && !yamali) {
    const r = git(kok, ['apply', '--reverse', YAMA])
    expect(r.status, `yama geri alınamadı: ${r.stderr}`).toBe(0)
  } else if (!zaten && yamali) {
    const r = git(kok, ['apply', YAMA])
    expect(r.status, `yama kopyaya uygulanamadı (paket sürümü kaydı mı?): ${r.stderr}`).toBe(0)
  }
  return { kok, index }
}

/**
 * Çıkarıcı modülü paketin bundle'ından ayrılır (`// src/domain-term-extractor.ts` … sonraki bölüm):
 * yalnız node yerleşikleri kullanır, `@wrongstack/core` çözümlemesi gerekmez. İşaretler yoksa test düşer
 * (paket yapısı değişti demektir).
 */
async function yukle(index: string): Promise<Cikarici> {
  const kaynak = fs.readFileSync(index, 'utf8')
  const bas = kaynak.indexOf('// src/domain-term-extractor.ts')
  const son = kaynak.indexOf('// src/embeddings/provider.ts')
  expect(bas, 'çıkarıcı bölümünün başlangıç işareti yok').toBeGreaterThan(-1)
  expect(son, 'çıkarıcı bölümünün bitiş işareti yok').toBeGreaterThan(bas)
  const dosya = path.join(path.dirname(index), 'cikarici.mjs')
  fs.writeFileSync(dosya, `${kaynak.slice(bas, son)}\nexport { SageDomainTermExtractor, normalizeTerm };\n`)
  return (await import(pathToFileURL(dosya).href)) as Cikarici
}

const METIN = [
  'Şerit sahibi `çıktıDosyası` ve `öğleArası` terimlerini kullanır. **Çıkış Kapısı** önemlidir.',
  'ŞeritKilidi ile ÇıkışKapısı ayrı kavramdır. İstanbul Şubesi Müdürü rapor verir.',
  'Çıkış Kapısı is the door. The WorkTree is a git checkout. ÇÖğKa kısa camelCase (7 harften kısa, ASCII harf-büyük harf çifti yok).',
].join(' ')

function cikar(m: Cikarici, text: string): Terim[] {
  return new m.SageDomainTermExtractor().extractFromConversation({ messages: [{ role: 'user', text }], minConfidence: 0.4, limit: 50 })
}

describe('INV-WRONGSTACK-SAGE-YAMA-1 · sage alan-terimi çıkarıcısı Türkçe harfleri korur', () => {
  it('yama var; adı kilitli paket sürümüyle aynı; yalnız sage index.js dosyasına dokunur; ASCII ve LF', () => {
    expect(fs.existsSync(YAMA), 'yamalar/ altında sage-<sürüm>-domain-terms-turkce.patch yok').toBe(true)
    const surum = (YAMA_ADI.match(/^sage-(\d+\.\d+\.\d+)-/) as RegExpMatchArray)[1]
    const kilit = (JSON.parse(fs.readFileSync(path.join(ARAC, 'package-lock.json'), 'utf8')) as { packages: Record<string, { version: string }> }).packages
    expect(kilit['node_modules/@wrongstack/sage']?.version, 'kilitli sage sürümü farklı — yama yeniden ölçülmeli').toBe(surum)
    const y = fs.readFileSync(YAMA, 'utf8')
    expect(y.includes('\r'), 'yama CRLF içeriyor').toBe(false)
    expect([...y].filter((c) => c.charCodeAt(0) > 127), 'yama ASCII dışı (görünmez) karakter taşıyor').toEqual([])
    const dosyalar = y.split('\n').filter((s) => s.startsWith('+++ '))
    expect(dosyalar).toEqual([`+++ b/${HEDEF}`])
  })

  it('yama yedi düzeltmenin hepsini taşır (Unicode sınıfları, NFC, U+0307)', () => {
    const arti = fs
      .readFileSync(YAMA, 'utf8')
      .split('\n')
      .filter((s) => s.startsWith('+') && !s.startsWith('+++'))
      .join('\n')
    const beklenen: [string, string][] = [
      ['backtick terimi', '`(\\p{L}[\\p{L}\\p{N}_-]{2,80})`/gu'],
      ['büyük harfle başlayan sözcük', '(?<![\\p{L}\\p{N}_])(\\p{Lu}[\\p{L}\\p{N}]{3,})(?![\\p{L}\\p{N}_])/gu'],
      ['çok kelimeli başlık', '(?:\\p{Lu}\\p{Ll}{2,})(?:\\s+\\p{Lu}[\\p{Ll}\\p{N}]{2,}){0,3}'],
      ['tanım cümlesi sınırı', '(?![\\\\p{L}\\\\p{N}_])\\\\s+(?:is|are|means|refers to)'],
      ['camelCase sınırı', '/\\p{Ll}\\p{Lu}/u'],
      ['girdi NFC', 'text.normalize("NFC")'],
      ['anahtar: NFC + U+0307 silme + Unicode harf', 'term.normalize("NFC").toLowerCase().replace(/\\u0307/g, "").replace(/[^\\p{L}\\p{N}\\s\\-_]+/gu'],
    ]
    for (const [ad, parca] of beklenen) expect(arti, `yamada ${ad} düzeltmesi yok`).toContain(parca)
  })

  it.skipIf(!KURULU)('kopyada git apply --check temiz, uygulanır, geri alınır; satır sonu makine ayarından bağımsız (LF kalır)', () => {
    const { kok, index } = kopya(false, true)
    const oncesi = fs.readFileSync(index)
    expect(oncesi.includes(13), 'yamasız kopya zaten CRLF').toBe(false)
    expect(git(kok, ['apply', '--check', YAMA]).status, 'yama yamasız kopyada temiz uygulanmıyor').toBe(0)
    // Kurulum betiğinin kendi çağrısı: bayrak sabit olduğu için `core.autocrlf=true` sistem ayarı sonucu bozmaz.
    kurulum.gitApply(kok, YAMA, [], 'ignore')
    const sonrasi = fs.readFileSync(index)
    expect(sonrasi.includes(13), 'yama uygulanınca dosya CRLF\'e döndü (autocrlf sızdı)').toBe(false)
    expect(git(kok, ['apply', '--reverse', '--check', YAMA]).status, 'yamalı dosyada --reverse --check düştü').toBe(0)
    expect(git(kok, ['apply', '--reverse', YAMA]).status).toBe(0)
    expect(fs.readFileSync(index).equals(oncesi), 'geri alınca dosya baytı yamasız hâline dönmedi').toBe(true)
  })

  it.skipIf(!KURULU)('normalizeTerm: yamasız Türkçe harfi atar, yamalı korur (İ → i, birleşik nokta yok)', async () => {
    const yamasiz = await yukle(kopya(false).index)
    const yamali = await yukle(kopya(true).index)
    const cift: [string, string, string][] = [
      ['Şerit', 'erit', 'şerit'],
      ['çıktı', 'kt', 'çıktı'],
      ['İstanbul', 'i stanbul', 'istanbul'],
      ['ığış', '', 'ığış'],
      ['ÖĞLE', 'le', 'öğle'],
    ]
    for (const [girdi, once, sonra] of cift) {
      expect(yamasiz.normalizeTerm(girdi), `yamasız beklenen bozuk anahtar (${girdi})`).toBe(once)
      expect(yamali.normalizeTerm(girdi), `yamalı ${girdi}`).toBe(sonra)
    }
    // ASCII davranışı değişmedi (yama İngilizce anahtarları bozmaz)
    for (const t of ['WorkTree', 'domain-terms.md', '  Mailbox   Bridge ']) expect(yamali.normalizeTerm(t)).toBe(yamasiz.normalizeTerm(t))
    // NFD (decomposed) girdi aynı anahtarı verir
    expect(yamali.normalizeTerm('Şerit'.normalize('NFD'))).toBe('şerit')
  })

  it.skipIf(!KURULU)('extractFromConversation: Türkçe terimler yalnız yamalıda çıkar; İngilizce sonuç değişmez', async () => {
    const yamasiz = cikar(await yukle(kopya(false).index), METIN)
    const yamali = cikar(await yukle(kopya(true).index), METIN)
    const adlar = (l: Terim[]) => l.map((t) => t.term)
    for (const t of ['çıktıDosyası', 'öğleArası', 'ŞeritKilidi', 'ÇıkışKapısı', 'İstanbul Şubesi Müdürü', 'ÇÖğKa']) {
      expect(adlar(yamasiz), `yamasızda ${t} çıkmamalı (yama bir şey yaptığını kanıtlar)`).not.toContain(t)
      expect(adlar(yamali), `yamalıda ${t} çıkmalı`).toContain(t)
    }
    // tanım cümlesi: terim Türkçe harfle bitince `\b` kırılıyordu
    const kapi = (l: Terim[]) => l.find((t) => t.term === 'Çıkış Kapısı')
    expect(kapi(yamasiz)?.definition).toBe('')
    expect(kapi(yamali)?.definition).toBe('the door')
    // İngilizce: aynı terimler, aynı güven
    for (const t of ['WorkTree']) {
      expect(yamali.find((x) => x.term === t)).toEqual(yamasiz.find((x) => x.term === t))
    }
  })

  it.skipIf(!KURULU)('NFD (ayrışık) girdi: birleşik harfli terim yamalıda bütün çıkar, yamasızda kesilir', async () => {
    const nfd = 'Şerit `çıktıDosyası` kullanır'.normalize('NFD')
    expect(cikar(await yukle(kopya(true).index), nfd).map((t) => t.term)).toContain('çıktıDosyası')
    expect(cikar(await yukle(kopya(false).index), nfd).map((t) => t.term)).not.toContain('çıktıDosyası')
  })

  /** ⭐Ayırt edici kol: sunucunun YÜKLEDİĞİ dosya. sage-mcp kendi kopyasını taşımaz, `@wrongstack/sage`'i içe aktarır. */
  it.skipIf(!KURULU)('sunucunun yüklediği paket yamalı: sage-mcp tek kopyayı kullanır ve o kopya Türkçe anahtar üretir', async () => {
    const mcpCli = path.join(ARAC, 'node_modules', '@wrongstack', 'sage-mcp', 'dist', 'cli.js')
    expect(fs.readFileSync(mcpCli, 'utf8'), 'sage-mcp cli.js artık @wrongstack/sage içe aktarmıyor').toContain('from "@wrongstack/sage"')
    expect(
      fs.existsSync(path.join(ARAC, 'node_modules', '@wrongstack', 'sage-mcp', 'node_modules', '@wrongstack', 'sage')),
      'sage-mcp kendi sage kopyasını taşıyor — yama yanlış dosyaya uygulanıyor olabilir',
    ).toBe(false)
    const r = git(KOK, ['apply', '--reverse', '--check', path.join('tools', 'wrongstack-mcp', 'yamalar', YAMA_ADI)])
    expect(r.status, `${YAMA_ADI} kurulu pakete uygulanmamış — kurulum: node tools/wrongstack-mcp/kurulum.cjs. ${r.stderr}`).toBe(0)
    const m = (await import(pathToFileURL(KURULU_INDEX).href)) as Cikarici
    expect(m.normalizeTerm('Şerit')).toBe('şerit')
    expect(cikar(m, METIN).map((t) => t.term)).toContain('İstanbul Şubesi Müdürü')
  })

  it('kurulum: yama sürümü kurulu paketle uyuşmazsa fark adıyla döner (sessiz geçmez)', () => {
    const ad = 'sage-1.0.26-domain-terms-turkce.patch'
    expect(kurulum.yamaSurumFarki([ad], () => '1.0.26')).toEqual([])
    const fark = kurulum.yamaSurumFarki([ad], () => '1.0.27')
    expect(fark).toHaveLength(1)
    expect(fark[0]).toContain(ad)
    expect(fark[0]).toContain('1.0.27')
    expect(fark[0]).toMatch(/yeniden olculup uretilmeli/)
    expect(kurulum.yamaSurumFarki([ad], () => null)[0]).toContain('YOK')
    expect(kurulum.yamaSurumFarki(['bicimsiz.patch'], () => '1.0.26')[0]).toMatch(/bicimine uymuyor/)
  })

  /**
   * Uçtan uca: gerçek kurulum betiğinin kopyası, sahte bir ağaçta `--denetle` koşar (yalnız okur; süreç
   * durdurmaz). Kilitli/kurulu sage 1.0.27 iken sürüm 1.0.26 için yazılmış yama `HATA:` ile ve nedeniyle düşer.
   */
  it('kurulum --denetle: sürüm kaymışsa çıkış kodu 1 ve son satır HATA + nedeni', () => {
    const kok = geciciDizin()
    const arac = path.join(kok, 'tools', 'wrongstack-mcp')
    fs.mkdirSync(path.join(arac, 'yamalar'), { recursive: true })
    fs.mkdirSync(path.join(arac, 'node_modules', '@wrongstack', 'sage'), { recursive: true })
    fs.copyFileSync(KURULUM_BETIGI, path.join(arac, 'kurulum.cjs'))
    fs.copyFileSync(YAMA, path.join(arac, 'yamalar', YAMA_ADI))
    fs.writeFileSync(path.join(arac, 'package.json'), JSON.stringify({ dependencies: {} }))
    fs.writeFileSync(path.join(kok, '.mcp.json'), JSON.stringify({ mcpServers: {} }))
    const surumYaz = (v: string) => fs.writeFileSync(path.join(arac, 'node_modules', '@wrongstack', 'sage', 'package.json'), JSON.stringify({ version: v }))
    const kos = () => spawnSync(process.execPath, [path.join(arac, 'kurulum.cjs'), '--denetle'], { cwd: kok, encoding: 'utf8' })

    surumYaz('1.0.27')
    const kayik = kos()
    expect(kayik.status).toBe(1)
    const son = kayik.stdout.trim().split('\n').pop() as string
    expect(son).toMatch(/^HATA: /)
    expect(son).toContain(YAMA_ADI)
    expect(son).toContain('1.0.27')

    // karşı-kontrol: sürüm uyuşunca sürüm mesajı YOK (mesaj sürüme özgü)
    surumYaz('1.0.26')
    expect(kos().stdout).not.toContain('icin yazildi')
  })

  it('kurulum kaynağı: kilit farkı HİÇBİR süreç durdurulmadan önce yüksek sesle düşer; git apply autocrlf sabit', () => {
    const kaynak = fs.readFileSync(KURULUM_BETIGI, 'utf8')
    const kur = kaynak.slice(kaynak.indexOf('function kur()'))
    const kilit = kur.indexOf('if (kilitFarki.length) throw')
    expect(kilit).toBeGreaterThan(-1)
    expect(kilit).toBeLessThan(kur.indexOf('surecleriOku()'))
    expect(kilit).toBeLessThan(kur.indexOf('process.kill'))
    expect(kaynak).toMatch(/'-c', 'core\.autocrlf=false', '-c', 'core\.eol=lf', 'apply'/)
    expect(kaynak, 'çıplak git apply çağrısı kaldı').not.toMatch(/execFileSync\('git', \['apply'/)
  })
})
