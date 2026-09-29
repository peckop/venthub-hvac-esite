#!/usr/bin/env node
'use strict'

/**
 * BELGE TAZELİK ÖLÇÜMÜ — `docs/standards/belge-yonetimi-standard.md` B5 (gösterge) + B7 (kapı).
 *
 * NİÇİN VAR: kod tarafında bozulunca kırmızı yanan 180+ kontrol var; belge tarafında yoktu.
 * `CONTEXT.md` 2026-08-17'den beri değişmedi, CLAUDE.md "ilk buraya bak" diyor ve hiçbir
 * kontrol bunu göstermedi (REC-400 ölçümü, 2026-09-27). Bu betik ölçer; gösterme işi
 * `defter-tazelik-satiri.cjs` kancasının BELGE bloğudur ve yalnız bu betiğin önbelleğini okur
 * (kanca bütçesi 300 ms; `git log` dört dosyada bu bütçeyi yer).
 *
 * ÖLÇÜLENLER:
 *   1. Çekirdek belge yaşı — başlıkta `Son doğrulama: YYYY-MM-DD` varsa o, yoksa VEKİL olarak
 *      son commit tarihi (cetvel B5; vekil olduğu çıktıda yazılır).
 *   2. Kırık yol — CLAUDE.md ve docs/README.md içindeki depo yollarından olmayanlar (B7.1).
 *      Yer tutucu, glob, depo dışı mutlak yol ve URL yol SAYILMAZ; ayrı sayılır.
 *   3. Cetvel başlık bloğu — docs/standards/*.md içinde `Sahibi` ve `Son doğrulama` alanı (B7.2).
 *   4. Kod haritası yaşı — graphify-out/graph.json değiştirilme zamanı (üretilmiş, .gitignore).
 *
 * ÖLÇÜLMEYENLER (v1, bilerek): MEMORY.md baytı (depo dışı; hafiza-indeks-bekcisi ölçüyor) ve
 * kanca fail-open sayısı. Çıktıda OLCULMEDI olarak görünürler — ölçülemedi, geçti demek değildir.
 *
 * KULLANIM:
 *   node scripts/belge/belge-tazelik.cjs          → JSON rapor stdout'a
 *   node scripts/belge/belge-tazelik.cjs --yaz    → ayrıca önbelleğe yaz (kancanın okuduğu)
 */

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
const ONBELLEK = path.join(PANO, '.belge-tazelik-onbellek.json')

// CONTEXT.md ve docs/DURUM-TAKIP.md 2026-09-29'da emekli edildi (yerinde yönlendirme sayfası): çekirdek değiller.
const CEKIRDEK = ['CLAUDE.md', 'docs/README.md']
const HARITALAR = ['CLAUDE.md', 'docs/README.md']
const CETVEL_DIZINI = 'docs/standards'
const GRAF = 'graphify-out/graph.json'

const YOL_UZANTISI = /\.(md|mdx|ts|tsx|js|cjs|mjs|json|jsonl|sql|py|yml|yaml|sh|ps1|toml)$/i

function depoKoku() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
  } catch {
    return process.cwd()
  }
}

/**
 * Bir metindeki ters tırnaklı parçaları ve markdown bağlantı hedeflerini aday yol olarak çıkarır,
 * sonra sınıflar. Dönüş: { yol: [...], yerTutucu: [...], glob: [...], disYol: [...], url: [...] }.
 * Boşluk içeren parça komut sayılır ve atlanır (`pnpm test -- --run` bir yol değildir).
 */
function yollariAyikla(metin) {
  const adaylar = []
  for (const m of metin.matchAll(/`([^`\n]+)`/g)) adaylar.push(m[1])
  for (const m of metin.matchAll(/\]\(([^)\s]+)\)/g)) adaylar.push(m[1])

  const sonuc = { yol: [], yerTutucu: [], glob: [], disYol: [], url: [] }
  for (const ham of adaylar) {
    let a = ham.trim()
    if (/^https?:\/\//i.test(a) || /^file:\/\//i.test(a)) {
      sonuc.url.push(a)
      continue
    }
    if (/\s/.test(a)) continue
    // `§` bölümü ve `:42` satır numarası yoldan ayrılır; sürücü harfindeki `C:` KORUNUR.
    a = a.replace(/#.*$/, '').replace(/§.*$/, '').replace(/:\d+.*$/, '').replace(/[.,;)]+$/, '')
    if (!a || !(a.includes('/') || YOL_UZANTISI.test(a))) continue
    if (/<[^>]*>/.test(a)) sonuc.yerTutucu.push(a)
    else if (/[*?{}[\]]/.test(a)) sonuc.glob.push(a)
    else if (/^[A-Za-z]:[\\/]/.test(a) || a.startsWith('~') || a.startsWith('/')) sonuc.disYol.push(a)
    else sonuc.yol.push(a)
  }
  return sonuc
}

/**
 * Yol, belgenin kendi klasörüne ya da depo köküne göre var mı. İkisinden biri yeterli:
 * docs/README.md `standards/x.md` yazar (kendi klasörüne göre), CLAUDE.md `docs/x.md` yazar (köke göre).
 */
function yolVarMi(kok, belge, yol) {
  const adaylar = [path.join(kok, path.dirname(belge), yol), path.join(kok, yol)]
  return adaylar.some((p) => fs.existsSync(p))
}

/**
 * Denetlenemeyen iki sınıf daha (2026-09-27 ilk koşum ölçümü: CLAUDE.md'de 16 "kırık"ın 15'i bunlardı):
 *   - KISA AD: tek parçalı ad (`middleware.ts`, `app/`, `tokens.js`). Metin bağlamı klasörü söyler,
 *     ad tek başına yer bildirmez; denetlenirse yanlış alarm üretir.
 *   - ÜRETİLMİŞ: git'in yok saydığı yol (`graphify-out/`, `.git/...`). Her ağaçta olmayabilir.
 * Yol sayılan: en az iki parçalı ve ilk parçası depo kökünde ya da belgenin klasöründe VAR olan.
 * İlk parçası hiçbir yerde olmayan çok parçalı yol da KIRIK sayılır (klasör silinmiş olabilir) —
 * ama önce üretilmiş mi diye bakılır.
 */
function kisaAdMi(y) {
  return y.replace(/\/$/, '').split('/').length < 2
}

function gitYokSayiyorMu(kok, y) {
  try {
    execFileSync('git', ['check-ignore', '-q', '--no-index', y.replace(/\/$/, '')], { cwd: kok, stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function kirikYollar(kok, belgeler = HARITALAR) {
  const rapor = []
  for (const belge of belgeler) {
    const tam = path.join(kok, belge)
    if (!fs.existsSync(tam)) {
      rapor.push({ belge, eksikBelge: true, kirik: [], yolSayisi: 0, atlanan: 0 })
      continue
    }
    const s = yollariAyikla(fs.readFileSync(tam, 'utf8'))
    const tekil = [...new Set(s.yol)]
    const kisa = tekil.filter(kisaAdMi)
    const aday = tekil.filter((y) => !kisaAdMi(y))
    const uretilmis = aday.filter((y) => !yolVarMi(kok, belge, y) && gitYokSayiyorMu(kok, y))
    const kirik = aday.filter((y) => !yolVarMi(kok, belge, y) && !uretilmis.includes(y))
    const atlanan = s.yerTutucu.length + s.glob.length + s.disYol.length + s.url.length + kisa.length + uretilmis.length
    rapor.push({ belge, kirik, yolSayisi: aday.length, atlanan })
  }
  return rapor
}

/** Başlık bloğundaki `Son doğrulama: YYYY-MM-DD` (ilk 40 satır). */
function sonDogrulama(metin) {
  const bas = metin.split('\n').slice(0, 40).join('\n')
  const m = bas.match(/Son do[gğ]rulama:?\**\s*:?\s*(\d{4}-\d{2}-\d{2})/i)
  return m ? m[1] : null
}

function basliktaSahipVar(metin) {
  const bas = metin.split('\n').slice(0, 40).join('\n')
  return /Sahib[iı]\**\s*:/i.test(bas)
}

function sonCommitTarihi(kok, dosya) {
  try {
    const t = execFileSync('git', ['log', '-1', '--format=%cs', '--', dosya], { cwd: kok, encoding: 'utf8' }).trim()
    return t || null
  } catch {
    return null
  }
}

function gunFarki(isoGun, simdi) {
  return Math.floor((simdi - Date.parse(isoGun + 'T00:00:00Z')) / 86400000)
}

function cekirdekYaslari(kok, simdi = Date.now(), belgeler = CEKIRDEK) {
  return belgeler.map((belge) => {
    const tam = path.join(kok, belge)
    if (!fs.existsSync(tam)) return { belge, yok: true }
    const alan = sonDogrulama(fs.readFileSync(tam, 'utf8'))
    const tarih = alan || sonCommitTarihi(kok, belge)
    return {
      belge,
      tarih,
      kaynak: alan ? 'alan' : 'vekil',
      gun: tarih ? gunFarki(tarih, simdi) : null,
    }
  })
}

function cetvelBasliklari(kok) {
  const dizin = path.join(kok, CETVEL_DIZINI)
  return fs
    .readdirSync(dizin)
    .filter((a) => a.endsWith('.md') && a !== 'SOURCES.md')
    .sort()
    .map((a) => {
      const metin = fs.readFileSync(path.join(dizin, a), 'utf8')
      return { dosya: CETVEL_DIZINI + '/' + a, sahip: basliktaSahipVar(metin), sonDogrulama: sonDogrulama(metin) !== null }
    })
}

function grafYasi(kok, simdi = Date.now()) {
  const p = path.join(kok, GRAF)
  if (!fs.existsSync(p)) return null
  return Math.floor((simdi - fs.statSync(p).mtimeMs) / 86400000)
}

/**
 * TABAN (mandal): bugün bilinen kırık yollar ve başlık alanı eksik cetveller. Kapı ve gösterge
 * yalnız tabanın DIŞINDAKİNİ bildirir; aksi hâlde aynı iki uyarı her mesajda basılır ve görmezden
 * gelinmeyi öğretir (cetvel B0.5). Taban yalnız KÜÇÜLÜR: düzeltilen kalem tabandan çıkarılmazsa
 * kapı "taban bayat" der. Yenilemek için: `--taban-yaz` (yalnız bilinçli olarak).
 */
const TABAN_YOLU = 'scripts/belge/belge-tazelik-taban.json'

function tabanOku(kok) {
  const p = path.join(kok, TABAN_YOLU)
  if (!fs.existsSync(p)) return { kirikYol: {}, cetvelAlanEksik: [], cetvelSahipEksik: [], cetvelDogrulamaEksik: [] }
  const t = JSON.parse(fs.readFileSync(p, 'utf8'))
  // Eski biçimli taban (yalnız cetvelAlanEksik) okunursa iki yeni liste boş sayılmaz: birleşimden başlar.
  return {
    ...t,
    cetvelSahipEksik: t.cetvelSahipEksik ?? t.cetvelAlanEksik ?? [],
    cetvelDogrulamaEksik: t.cetvelDogrulamaEksik ?? t.cetvelAlanEksik ?? [],
  }
}

function olc(kok = depoKoku(), simdi = Date.now()) {
  const basliklar = cetvelBasliklari(kok)
  const kirik = kirikYollar(kok)
  const taban = tabanOku(kok)
  const kirikYeni = []
  for (const k of kirik) {
    const bilinen = new Set(taban.kirikYol[k.belge] || [])
    for (const y of k.kirik) if (!bilinen.has(y)) kirikYeni.push({ belge: k.belge, yol: y })
  }
  return {
    olculdu: new Date(simdi).toISOString(),
    cekirdek: cekirdekYaslari(kok, simdi),
    kirikYol: kirik,
    kirikYeni,
    cetvel: {
      toplam: basliklar.length,
      // İKİ AYRI ölçü (REC-433 3.4): sahip eksik ile doğrulama eksik farklı işlerdir. Sahip, rol kartlarından
      // türetilebilir (mekanik); "Son doğrulama" ise içerik gerçekle karşılaştırılınca yazılır (insan/ajan işi)
      // ve toplu doldurulamaz. `alanEksik` (ikisinin birleşimi) eski tüketiciler için kalır.
      sahipEksik: basliklar.filter((b) => !b.sahip).map((b) => b.dosya),
      dogrulamaEksik: basliklar.filter((b) => !b.sonDogrulama).map((b) => b.dosya),
      alanEksik: basliklar.filter((b) => !b.sahip || !b.sonDogrulama).map((b) => b.dosya),
    },
    grafGun: grafYasi(kok, simdi),
    olculmedi: ['MEMORY.md bayt', 'kanca fail-open'],
  }
}

module.exports = {
  yollariAyikla,
  kirikYollar,
  sonDogrulama,
  basliktaSahipVar,
  cekirdekYaslari,
  cetvelBasliklari,
  tabanOku,
  olc,
  ONBELLEK,
  TABAN_YOLU,
}

if (require.main === module) {
  const rapor = olc()
  if (process.argv.includes('--taban-yaz')) {
    const kok = depoKoku()
    const taban = {
      kirikYol: {},
      cetvelAlanEksik: rapor.cetvel.alanEksik,
      cetvelSahipEksik: rapor.cetvel.sahipEksik,
      cetvelDogrulamaEksik: rapor.cetvel.dogrulamaEksik,
    }
    for (const k of rapor.kirikYol) if (k.kirik.length) taban.kirikYol[k.belge] = k.kirik
    fs.writeFileSync(path.join(kok, TABAN_YOLU), JSON.stringify(taban, null, 2) + '\n')
  }
  if (process.argv.includes('--yaz')) {
    fs.mkdirSync(PANO, { recursive: true })
    fs.writeFileSync(ONBELLEK, JSON.stringify(rapor, null, 2))
  }
  process.stdout.write(JSON.stringify(rapor, null, 2) + '\n')
}
