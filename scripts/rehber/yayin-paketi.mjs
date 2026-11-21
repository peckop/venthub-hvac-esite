#!/usr/bin/env node
/**
 * REHBER YAYIN PAKETİ — hazır bir yazıyı, master'dan açılmış dala tek komutla yayın kaydı olarak ekler
 * (BLG-90, OPS-345 öneri 2; cetvel: rehber-yazisi-standard.md R10, B8).
 *
 * Niçin: 19-21 Kasım 2026'da beş yazı elle ayrıldı. Zincirli dallar squash birleşmesinde üç kez çakıştı; CRLF'li
 * çalışma kopyasında `indexOf(']')` -1 döndüğü için bir kayıt dizinin dışına düştü. Bu araç her yazıyı güncel
 * tabana ayrı kurar, satır sonunu korur ve bir adım tutmazsa hiçbir dosyaya yazmaz.
 *
 * Yaptıkları: kaynak daldan yazı kaydını alır, yayın ve güncelleme tarihini verir, `tarihGizli: true` koyar, kaydı
 * YAZILAR dizisinin sonuna ekler; iki site haritası fikstürüne girdiyi son yazının arkasına ekler; site haritası test
 * sayılarını ve llms.txt adres sayısını 1 artırır; istenirse sahte kataloğa aile satırı ekler; kırık `vh:yazi`
 * bağlantısı varsa reddeder; sonunda `govde-izi.mjs --yaz` koşar.
 *
 * Kullanım (dal origin/master'dan açılmış olmalı):
 *   node scripts/rehber/yayin-paketi.mjs --kaynak <git-ref> --kimlik <kimlik> --tarih YYYY-AA-GG --kart BLG-n \
 *     --sira "on yedinci" [--aile <aile-kimliği> --aile-adi "<ad>" --aile-yorum "<yorum>"] [--kuru]
 * `--kuru` hiçbir dosyaya yazmaz, yapılacakları söyler.
 * Çıkış: 0 tamam · 1 reddedildi · 2 kullanım hatası.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const YOLLAR = {
  yazilar: 'src/data/bilgiMerkezi/yazilar.ts',
  sitemapAltin: 'src/app/__tests__/fixtures/sitemapAltin.json',
  rotaFikstur: 'src/__tests__/conformance/fikstur/rota-dili-kapali-2-oncesi.json',
  sitemapTest: 'src/app/__tests__/sitemapAdresUret.test.ts',
  llms: 'public/llms.txt',
  sahteKaynak: 'src/lib/bilgiMerkezi/__tests__/sahteKaynak.ts',
}

const AILE_CAPASI = "    ['vortice-vorticent-cms-atex-santrifuj-fanlar', 'Vortice Vorticent CMS ATEX Santrifüj Fanlar'],\n"

export class PaketHatasi extends Error {}

const lfYap = (metin) => metin.replace(/\r\n/g, '\n')
/** Yeni metni, hedef dosyanın özgün satır sonuyla geri verir. */
const sonuKoru = (ozgun, yeni) => (ozgun.includes('\r\n') ? yeni.replace(/\n/g, '\r\n') : yeni)

/** YAZILAR dizisinin açılış ve kapanış satırı; kapanış, açılıştan sonraki ilk tek başına `]` satırıdır. */
function diziSiniri(satirlar) {
  const acilis = satirlar.findIndex((l) => l.startsWith('export const YAZILAR'))
  if (acilis < 0) throw new PaketHatasi('YAZILAR dizisi bulunamadı')
  const kapanis = satirlar.indexOf(']', acilis)
  if (kapanis < 0) throw new PaketHatasi("YAZILAR dizisinin kapanışı (']') bulunamadı")
  return { acilis, kapanis }
}

function kayitBlogu(satirlar, kimlik) {
  const i = satirlar.indexOf(`    kimlik: '${kimlik}',`)
  if (i < 0) throw new PaketHatasi(`kaynakta kayıt yok: ${kimlik}`)
  let a = i
  while (a >= 0 && satirlar[a] !== '  {') a--
  let b = i
  while (b < satirlar.length && satirlar[b] !== '  },') b++
  if (a < 0 || b >= satirlar.length) throw new PaketHatasi(`kayıt sınırı bulunamadı: ${kimlik}`)
  return satirlar.slice(a, b + 1)
}

const blokSlug = (blok) => {
  const satir = blok.find((l) => /^\s+slug: '/.test(l))
  if (!satir) throw new PaketHatasi('kayıtta slug yok')
  return satir.match(/slug: '([^']+)'/)[1]
}

function sonKayitSlug(satirlar) {
  const { acilis, kapanis } = diziSiniri(satirlar)
  let b = kapanis - 1
  while (b > acilis && satirlar[b] !== '  },') b--
  let a = b
  while (a > acilis && satirlar[a] !== '  {') a--
  if (b <= acilis || a <= acilis) throw new PaketHatasi('dizide son kayıt bulunamadı')
  return blokSlug(satirlar.slice(a, b + 1))
}

function kaydiHazirla(blok, tarih) {
  const sonuc = blok
    .filter((l) => !l.startsWith('    tarihGizli:'))
    .map((l) =>
      l
        .replace(/^(    yayinTarihi: )'[^']*'/, `$1'${tarih}'`)
        .replace(/^(    guncellemeTarihi: )'[^']*'/, `$1'${tarih}'`),
    )
  const i = sonuc.findIndex((l) => l.startsWith('    guncellemeTarihi:'))
  if (i < 0 || !sonuc.some((l) => l.startsWith('    yayinTarihi:'))) {
    throw new PaketHatasi('kayıtta yayinTarihi ya da guncellemeTarihi yok')
  }
  sonuc.splice(i + 1, 0, '    tarihGizli: true,')
  return sonuc
}

/** Fikstürde slug'ı taşıyan en dış nesnelerin [başlangıç, bitiş] satırları. */
function fiksturGirdileri(satirlar, slug) {
  const araliklar = []
  for (let i = 0; i < satirlar.length; i++) {
    if (!satirlar[i].includes(`/bilgi-merkezi/${slug}"`)) continue
    let x = i
    while (x >= 0 && !/^\s*\{\s*$/.test(satirlar[x])) x--
    if (x < 0) throw new PaketHatasi(`fikstür girdisi açılmıyor: ${slug}`)
    const girinti = satirlar[x].match(/^\s*/)[0]
    const kapanis = new RegExp(`^${girinti}\\},?\\s*$`)
    let z = i
    while (z < satirlar.length && !kapanis.test(satirlar[z])) z++
    if (z >= satirlar.length) throw new PaketHatasi(`fikstür girdisi kapanmıyor: ${slug}`)
    araliklar.push([x, z])
  }
  return araliklar.filter(
    ([x, z], i) => !araliklar.some(([a, b], j) => j !== i && a <= x && z <= b && (a !== x || b !== z)),
  ).filter(([x, z], i, liste) => liste.findIndex(([a, b]) => a === x && b === z) === i)
}

function fiksturEkle(hedefMetin, kaynakMetin, slug, oncekiSlug, yol) {
  const hedef = lfYap(hedefMetin).split('\n')
  const kaynak = lfYap(kaynakMetin).split('\n')
  if (fiksturGirdileri(hedef, slug).length > 0) throw new PaketHatasi(`${yol}: girdi zaten var: ${slug}`)
  const sablon = fiksturGirdileri(kaynak, slug).map(([x, z]) => kaynak.slice(x, z + 1))
  const yerler = fiksturGirdileri(hedef, oncekiSlug)
  if (sablon.length === 0 || sablon.length !== yerler.length) {
    throw new PaketHatasi(`${yol}: kaynakta ${sablon.length} girdi, hedefte önceki yazının ${yerler.length} girdisi var`)
  }
  for (let i = yerler.length - 1; i >= 0; i--) {
    const parca = sablon[i].slice()
    const son = parca.length - 1
    if (hedef[yerler[i][1]].trimEnd().endsWith(',')) {
      if (!parca[son].trimEnd().endsWith(',')) parca[son] += ','
    } else {
      hedef[yerler[i][1]] += ','
      parca[son] = parca[son].replace(/,\s*$/, '')
    }
    hedef.splice(yerler[i][1] + 1, 0, ...parca)
  }
  const sonuc = hedef.join('\n')
  JSON.parse(sonuc)
  return sonuKoru(hedefMetin, sonuc)
}

function testSayilariniArtir(metin, { kart, sira, slug, tarih }) {
  let t = lfYap(metin)
  const kapaliEs = t.match(/it\('EN_YAYIN kapalı: (\d+) satır[\s\S]*?toHaveLength\((\d+)\)/)
  const acikEs = t.match(/it\('EN_YAYIN açık: (\d+) satır[\s\S]*?toHaveLength\((\d+)\)/)
  if (!kapaliEs || !acikEs) throw new PaketHatasi('site haritası testinde sayı satırları bulunamadı')
  const kapali = Number(kapaliEs[1])
  const acik = Number(acikEs[1])
  if (kapali !== Number(kapaliEs[2]) || acik !== Number(acikEs[2])) {
    throw new PaketHatasi('site haritası testinde başlık sayısı ile beklenen uzunluk uyuşmuyor')
  }
  const yeniBlok = (es, ad, n) =>
    es[0].replace(`EN_YAYIN ${ad}: ${n} satır`, `EN_YAYIN ${ad}: ${n + 1} satır`).replace(`toHaveLength(${n})`, `toHaveLength(${n + 1})`)
  const ay = tarih.slice(0, 7)
  const yorum = `// ${kart} (${ay}): ${sira} rehber yazısı (${slug}) → +1 satır (kapalı ${kapali} → ${kapali + 1}, açık ${acik} → ${acik + 1}).\n    `
  t = t.replace(acikEs[0], () => yeniBlok(acikEs, 'açık', acik))
  t = t.replace(kapaliEs[0], () => yorum + yeniBlok(kapaliEs, 'kapalı', kapali))
  return { metin: sonuKoru(metin, t), kapali: kapali + 1, acik: acik + 1 }
}

function llmsArtir(metin) {
  const es = metin.match(/(\d+) indexable URLs/)
  if (!es) throw new PaketHatasi('llms.txt içinde adres sayısı bulunamadı')
  const n = Number(es[1]) + 1
  return { metin: metin.replace(es[0], `${n} indexable URLs`), n }
}

function aileEkle(metin, { aile, aileAdi, aileYorum }) {
  const t = lfYap(metin)
  if (t.includes(`['${aile}',`)) return metin
  if (!aileAdi || !aileYorum) throw new PaketHatasi('--aile ile --aile-adi ve --aile-yorum da gerekir')
  if (!t.includes(AILE_CAPASI)) throw new PaketHatasi('sahteKaynak çapası bulunamadı')
  return sonuKoru(metin, t.replace(AILE_CAPASI, `${AILE_CAPASI}    // ${aileYorum}\n    ['${aile}', '${aileAdi}'],\n`))
}

/** Dizideki `vh:yazi/<kimlik>` hedeflerinden kaydı olmayanlar. */
export function kirikBaglantilar(yazilarMetni) {
  const kimlikler = new Set([...yazilarMetni.matchAll(/^ {4}kimlik: '([^']+)',/gm)].map((m) => m[1]))
  return [...new Set([...yazilarMetni.matchAll(/vh:yazi\/([a-z0-9-]+)/g)].map((m) => m[1]))].filter((h) => !kimlikler.has(h))
}

/**
 * Saf çekirdek: dosyaya dokunmaz. `hedef` ve `kaynak`, YOLLAR anahtarlarıyla dosya metinleridir (kaynakta
 * yazilar, sitemapAltin, rotaFikstur). Yeni metinleri ve özeti döner; bir adım tutmazsa PaketHatasi atar.
 */
export function paketHazirla(hedef, kaynak, secenek) {
  const { kimlik, tarih, kart, sira, aile } = secenek
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tarih ?? '')) throw new PaketHatasi('tarih YYYY-AA-GG olmalı')
  if (!kimlik || !/^BLG-\d+$/.test(kart ?? '') || !sira) throw new PaketHatasi('kimlik, kart (BLG-n) ve sira gerekir')

  const yaziSatir = lfYap(hedef.yazilar).split('\n')
  if (yaziSatir.includes(`    kimlik: '${kimlik}',`)) throw new PaketHatasi(`kayıt zaten ekli: ${kimlik}`)
  const blok = kaydiHazirla(kayitBlogu(lfYap(kaynak.yazilar).split('\n'), kimlik), tarih)
  const slug = blokSlug(blok)
  const oncekiSlug = sonKayitSlug(yaziSatir)
  const { kapanis } = diziSiniri(yaziSatir)
  yaziSatir.splice(kapanis, 0, ...blok)
  const yeniYazilar = yaziSatir.join('\n')

  const kirik = kirikBaglantilar(yeniYazilar)
  if (kirik.length > 0) throw new PaketHatasi(`kırık yazı bağlantısı: ${kirik.join(', ')} (bağlanılan yazı önce yayınlanmalı)`)

  const test = testSayilariniArtir(hedef.sitemapTest, { kart, sira, slug, tarih })
  const llms = llmsArtir(hedef.llms)
  const dosyalar = {
    yazilar: sonuKoru(hedef.yazilar, yeniYazilar),
    sitemapAltin: fiksturEkle(hedef.sitemapAltin, kaynak.sitemapAltin, slug, oncekiSlug, YOLLAR.sitemapAltin),
    rotaFikstur: fiksturEkle(hedef.rotaFikstur, kaynak.rotaFikstur, slug, oncekiSlug, YOLLAR.rotaFikstur),
    sitemapTest: test.metin,
    llms: llms.metin,
  }
  if (aile) {
    const yeni = aileEkle(hedef.sahteKaynak, secenek)
    if (yeni !== hedef.sahteKaynak) dosyalar.sahteKaynak = yeni
  }
  return { dosyalar, ozet: { kimlik, slug, oncekiSlug, tarih, kapali: test.kapali, acik: test.acik, llms: llms.n, satir: blok.length } }
}

function argumanlar(argv) {
  const degerli = { '--kaynak': 'kaynakRef', '--kimlik': 'kimlik', '--tarih': 'tarih', '--kart': 'kart', '--sira': 'sira', '--aile': 'aile', '--aile-adi': 'aileAdi', '--aile-yorum': 'aileYorum' }
  const sonuc = { kuru: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--kuru') sonuc.kuru = true
    else if (degerli[argv[i]] && argv[i + 1] !== undefined) sonuc[degerli[argv[i++]]] = argv[i]
    else return null
  }
  return sonuc.kaynakRef ? sonuc : null
}

function main() {
  const secenek = argumanlar(process.argv.slice(2))
  if (!secenek) {
    console.error('Kullanım: yayin-paketi.mjs --kaynak <ref> --kimlik <kimlik> --tarih YYYY-AA-GG --kart BLG-n --sira "<sıra>" [--aile <id> --aile-adi <ad> --aile-yorum <yorum>] [--kuru]')
    return 2
  }
  const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const goster = (yol) => execFileSync('git', ['show', `${secenek.kaynakRef}:${yol}`], { cwd: kok, encoding: 'utf8', maxBuffer: 1e8, stdio: ['ignore', 'pipe', 'pipe'] })
  try {
    const hedef = Object.fromEntries(Object.entries(YOLLAR).map(([ad, yol]) => [ad, readFileSync(join(kok, yol), 'utf8')]))
    const kaynak = { yazilar: goster(YOLLAR.yazilar), sitemapAltin: goster(YOLLAR.sitemapAltin), rotaFikstur: goster(YOLLAR.rotaFikstur) }
    const { dosyalar, ozet } = paketHazirla(hedef, kaynak, secenek)
    const degisen = Object.keys(dosyalar).map((ad) => YOLLAR[ad])
    if (secenek.kuru) {
      console.log(`KURU: ${ozet.kimlik} (${ozet.slug}), önceki ${ozet.oncekiSlug}, tarih ${ozet.tarih}; kapalı ${ozet.kapali}, açık ${ozet.acik}, llms ${ozet.llms}`)
      console.log(degisen.map((y) => `  ${y}`).join('\n'))
      return 0
    }
    for (const [ad, metin] of Object.entries(dosyalar)) writeFileSync(join(kok, YOLLAR[ad]), metin)
    execFileSync(process.execPath, [join(kok, 'scripts/rehber/govde-izi.mjs'), '--yaz'], { cwd: kok, stdio: 'inherit' })
    console.log(`TAMAM: ${ozet.kimlik} (${ozet.satir} satır), önceki ${ozet.oncekiSlug}, tarih ${ozet.tarih}; kapalı ${ozet.kapali}, açık ${ozet.acik}, llms ${ozet.llms}`)
    return 0
  } catch (hata) {
    console.error(`REDDEDİLDİ: ${hata instanceof Error ? hata.message : String(hata)}`)
    return 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exit(main())
