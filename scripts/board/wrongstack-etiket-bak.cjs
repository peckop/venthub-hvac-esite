#!/usr/bin/env node
'use strict'

/**
 * WRONGSTACK ETİKET BAKICISI (ARC-24, karar 257) — GitHub'daki en son WrongStack etiketi, depodaki taban
 * etiketten yeni mi?
 *
 * NİÇİN VAR: Dependabot npm'e bakar, GitHub'daki sürümü görmez. WrongStack GitHub'da npm'den ÖNCE çıkıyor
 * (v1.0.30 GitHub'da 2026-10-01'de, npm'deki son sürüm 1.0.29). Yeni etiket çıkınca haberimiz olmalı; bu betik
 * günlük workflow'dan (`.github/workflows/wrongstack-etiket-kontrol.yml`) koşar.
 *
 * ⭐YALNIZ OKUR: GitHub'dan okur, dışarıya hiçbir şey yazmaz (issue/PR/yorum/commit YOK). Tek yazdığı yer
 * `--ozet` ile verilen iş özeti dosyasıdır (GITHUB_STEP_SUMMARY).
 *
 * ÇIKIŞ KODU:
 *   0  yeni etiket YOK (sessiz) ya da ÖLÇÜLEMEDİ (ağ hatası: belirsiz + uyarı satırı; KIRMIZI DEĞİL — geçici
 *      GitHub/ağ hatası her gün alarm üretirse alarm bakılmayan alarma döner)
 *   1  YENİ etiket var (iş KIRMIZI biter ki sinyal görünsün)
 *   2  taban dosyası okunamadı/bozuk (depo kusuru, geçici değil: kontrol kör kalır, sessiz geçilmez)
 *
 * Kullanım:  node scripts/board/wrongstack-etiket-bak.cjs [--taban yol] [--ozet dosya] [--json]
 *
 * Saf fonksiyonlar dışa verilir (test edilebilirlik); ağ erişimi (`ag`, `npm`) ENJEKTE edilir.
 */

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const DEPO = 'WrongStack/WrongStack'
const NPM_PAKETI = '@wrongstack/sage-mcp'
const VARSAYILAN_TABAN = path.join(__dirname, '..', '..', 'tools', 'wrongstack-mcp', 'etiket-taban.json')
const NOT_SATIRI = 40

/** `v1.0.30` / `1.0.30` → [1,0,30]. Ön-sürüm (`-rc.1`) ve bozuk biçim → null (taban kararına GİRMEZ). */
function surumCoz(etiket) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(String(etiket ?? '').trim())
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

/** Sayısal karşılaştırma (sözlük sırası DEĞİL: 1.0.9 < 1.0.10). a<b → -1, eşit → 0, a>b → 1. Çözülemezse hata atar. */
function surumKarsilastir(a, b) {
  const x = surumCoz(a)
  const y = surumCoz(b)
  if (!x || !y) throw new Error(`surum cozulemedi: ${!x ? a : b}`)
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1
  }
  return 0
}

/** Taban dosyasını okur: `{"sonGorulen":"v1.0.30"}`. Okunamazsa/bozuksa hata atar (sessiz varsayılan YOK). */
function tabanOku(yol, okuyucu = fs) {
  let ham
  try {
    ham = okuyucu.readFileSync(yol, 'utf8')
  } catch (e) {
    throw new Error(`taban dosyasi okunamadi (${yol}): ${e.message}`)
  }
  let nesne
  try {
    nesne = JSON.parse(ham)
  } catch (e) {
    throw new Error(`taban dosyasi JSON degil (${yol}): ${e.message}`)
  }
  if (!nesne || typeof nesne.sonGorulen !== 'string' || !surumCoz(nesne.sonGorulen)) {
    throw new Error(`taban dosyasinda gecerli "sonGorulen" yok (${yol})`)
  }
  return nesne.sonGorulen
}

/**
 * En son etiketi bulur: önce `releases/latest`, o başarısızsa `/tags` (sürüm sırasına göre en büyük).
 * `ag.getir(yol)` → Promise<nesne>; ağ hatasında reddeder. Dönüş: {etiket, tarih, notMetni, kaynak}.
 */
async function sonEtiketiOku(ag) {
  const hatalar = []
  try {
    const r = await ag.getir(`repos/${DEPO}/releases/latest`)
    if (r && surumCoz(r.tag_name)) {
      return { etiket: r.tag_name, tarih: r.published_at ?? null, notMetni: r.body ?? '', kaynak: 'releases/latest' }
    }
    hatalar.push('releases/latest gecerli etiket dondurmedi')
  } catch (e) {
    hatalar.push(`releases/latest: ${e.message}`)
  }
  try {
    const liste = await ag.getir(`repos/${DEPO}/tags?per_page=100`)
    const adaylar = (Array.isArray(liste) ? liste : []).map((t) => t && t.name).filter((n) => surumCoz(n))
    if (adaylar.length > 0) {
      const en = adaylar.reduce((a, b) => (surumKarsilastir(b, a) > 0 ? b : a))
      return { etiket: en, tarih: null, notMetni: '', kaynak: 'tags' }
    }
    hatalar.push('tags gecerli etiket dondurmedi')
  } catch (e) {
    hatalar.push(`tags: ${e.message}`)
  }
  const hata = new Error(`en son etiket okunamadi — ${hatalar.join(' | ')}`)
  hata.olculemedi = true
  throw hata
}

/**
 * Karar: taban ile son etiket → sonuç nesnesi. Hiç ağ erişimi yapmaz (saf).
 * durum: 'yeni' (son > taban) | 'yok' (son <= taban) | 'belirsiz' (son etiket okunamadı).
 */
function karar(taban, son, hata) {
  if (!son) {
    return { durum: 'belirsiz', taban, uyari: `WrongStack etiketi olculemedi: ${hata}`, cikis: 0 }
  }
  const fark = surumKarsilastir(son.etiket, taban)
  if (fark > 0) {
    return {
      durum: 'yeni',
      taban,
      yeni: son.etiket,
      tarih: son.tarih,
      kaynak: son.kaynak,
      compare: `https://github.com/${DEPO}/compare/${taban}...${son.etiket}`,
      notSatirlari: String(son.notMetni).split(/\r?\n/).slice(0, NOT_SATIRI),
      cikis: 1,
    }
  }
  return { durum: 'yok', taban, son: son.etiket, cikis: 0 }
}

/** Tüm akış: taban oku → etiket oku → karar → (yeniyse) npm'de var mı. Taban bozuksa hata ATAR (çıkış 2'yi çağıran verir). */
async function kontrolEt({ tabanYolu, ag, npm, okuyucu }) {
  const taban = tabanOku(tabanYolu, okuyucu)
  let son = null
  let hata = ''
  try {
    son = await sonEtiketiOku(ag)
  } catch (e) {
    hata = e.message
  }
  const sonuc = karar(taban, son, hata)
  if (sonuc.durum === 'yeni') {
    sonuc.npm = await npm(sonuc.yeni.replace(/^v/, ''))
  }
  return sonuc
}

/** Sonucu insan okunur Markdown'a çevirir (iş özeti). Yeni yoksa boş dize (sessiz). */
function ozetMetni(s) {
  if (s.durum === 'belirsiz') return `### WrongStack etiket kontrolü: ÖLÇÜLEMEDİ\n\n${s.uyari}\n\nTaban etiket: ${s.taban}\n`
  if (s.durum !== 'yeni') return ''
  const npmMetni =
    s.npm === 'var'
      ? `npm'de var (${NPM_PAKETI}@${s.yeni.replace(/^v/, '')})`
      : s.npm === 'yok'
        ? "npm'de henüz yok"
        : "npm sorgusu belirsiz (ağ/kayıt hatası; 'yok' denemez)"
  return [
    `### WrongStack YENİ ETİKET: ${s.yeni}`,
    '',
    `- Yeni etiket: **${s.yeni}**`,
    `- Yayın tarihi: ${s.tarih ?? 'bilinmiyor (yalnız etiket okundu, yayın kaydı yok)'}`,
    `- Taban etiket: ${s.taban}`,
    `- Karşılaştırma: ${s.compare}`,
    `- npm: ${npmMetni}`,
    '',
    `Yayın notu (ilk ${NOT_SATIRI} satır):`,
    '',
    '```text',
    ...(s.notSatirlari.length > 0 && s.notSatirlari.join('').trim() ? s.notSatirlari : ['(yayın notu yok)']),
    '```',
    '',
    `Sonraki adım: sürümü ölçüp ${path.posix.join('tools', 'wrongstack-mcp', 'etiket-taban.json')} dosyasındaki tabanı güncelle.`,
    '',
  ].join('\n')
}

// ── gerçek ağ (yalnız CLI'da kullanılır; testler sahte enjekte eder) ──

function gercekAg() {
  return {
    getir: async (yol) => {
      try {
        const cikti = execFileSync('gh', ['api', yol], { encoding: 'utf8', stdio: 'pipe', timeout: 30000 })
        return JSON.parse(cikti)
      } catch (e) {
        const ek = e.stderr ? String(e.stderr).trim().split('\n')[0] : ''
        throw new Error(`gh api ${yol} basarisiz${ek ? ` (${ek})` : ''}`)
      }
    },
  }
}

/** 'var' | 'yok' (404: kayıtta yok) | 'belirsiz' (başka hata: ağ/kayıt). */
async function gercekNpm(surum) {
  try {
    execFileSync('npm', ['view', `${NPM_PAKETI}@${surum}`, 'version'], {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000,
      shell: process.platform === 'win32',
    })
    return 'var'
  } catch (e) {
    return /E404|404 Not Found|No match found/i.test(`${e.stderr ?? ''}${e.stdout ?? ''}`) ? 'yok' : 'belirsiz'
  }
}

async function main(argv) {
  const arg = (ad) => {
    const i = argv.indexOf(ad)
    return i >= 0 ? argv[i + 1] : undefined
  }
  const tabanYolu = arg('--taban') ?? VARSAYILAN_TABAN
  let sonuc
  try {
    sonuc = await kontrolEt({ tabanYolu, ag: gercekAg(), npm: gercekNpm })
  } catch (e) {
    process.stdout.write(`::error::WrongStack etiket kontrolu kor: ${e.message}\n`)
    return 2
  }
  if (argv.includes('--json')) process.stdout.write(`${JSON.stringify(sonuc, null, 2)}\n`)
  const metin = ozetMetni(sonuc)
  if (sonuc.durum === 'belirsiz') process.stdout.write(`::warning::${sonuc.uyari}\n`)
  if (sonuc.durum === 'yeni') {
    process.stdout.write(`::error::WrongStack yeni etiket: ${sonuc.yeni} (taban ${sonuc.taban})\n`)
  }
  if (metin && !argv.includes('--json')) process.stdout.write(`${metin}\n`)
  if (metin && arg('--ozet')) fs.appendFileSync(arg('--ozet'), `${metin}\n`)
  if (sonuc.durum === 'yok' && !argv.includes('--json')) {
    process.stdout.write(`WrongStack: yeni etiket yok (son ${sonuc.son}, taban ${sonuc.taban}).\n`)
  }
  return sonuc.cikis
}

module.exports = { surumCoz, surumKarsilastir, tabanOku, sonEtiketiOku, karar, kontrolEt, ozetMetni }

if (require.main === module) {
  main(process.argv.slice(2)).then(
    (kod) => process.exit(kod),
    (e) => {
      process.stdout.write(`::error::beklenmeyen hata: ${e.message}\n`)
      process.exit(2)
    }
  )
}
