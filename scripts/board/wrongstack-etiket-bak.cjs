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
 * ⭐YALNIZ OKUR: GitHub'dan okur (`gh api` yalnız GET), dışarıya hiçbir şey yazmaz (issue/PR/yorum/commit YOK).
 * Tek yazdığı yer `--ozet` ile verilen iş özeti dosyasıdır (GITHUB_STEP_SUMMARY).
 *
 * ⭐İKİ KAYNAK BİRLEŞİR: `releases/latest` (yayın notu ve tarih burada) VE `/tags` ikisi de okunur, semver olarak
 * BÜYÜK olan alınır. Yalnız latest'e bakmak, yayını (release) hazırlanmamış ama etiketlenmiş bir sürümü kaçırır.
 *
 * ÇIKIŞ KODU:
 *   0  yeni etiket YOK (sessiz) ya da GEÇİCİ ölçülemedi (zaman aşımı/5xx/ağ: belirsiz + ::warning::)
 *   1  YENİ etiket var YA DA ölçüm KALICI bozuk (404/yetki/depo adı değişti/geçerli etiket yok): iş KIRMIZI biter.
 *      ⭐Kalıcı bozulma sessiz geçilirse kontrol sonsuza dek "yeşil" ve kör kalır; ayrım `hataSinifi` ile yapılır.
 *   2  taban dosyası okunamadı/bozuk (depo kusuru: kontrol kör kalır, sessiz geçilmez)
 *
 * ⭐DIŞ KAYNAKLI METİN: yayın notu GitHub'dan gelir ve stdout'a basılır; satır başındaki `::komut::` ve `##[komut]`
 * önekleri etkisizleştirilir (iş akışı komutu enjeksiyonu: sahte hata, `::add-mask::`, `::stop-commands::`).
 *
 * Kullanım:  node scripts/board/wrongstack-etiket-bak.cjs [--taban yol] [--ozet dosya] [--json]
 *
 * Saf fonksiyonlar dışa verilir (test edilebilirlik); ağ erişimi (`ag`, `npm`) ve çıktı (`yaz`) ENJEKTE edilir.
 */

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const DEPO = 'WrongStack/WrongStack'
const NPM_PAKETI = '@wrongstack/sage-mcp'
const VARSAYILAN_TABAN = path.join(__dirname, '..', '..', 'tools', 'wrongstack-mcp', 'etiket-taban.json')
const NOT_SATIRI = 40
const SATIR_TAVANI = 500
const SIFIR_GENISLIK = '​'

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

/**
 * Hata iletisini 'gecici' | 'kalici' diye sınıflar. ⭐Geçici YALNIZ olumlu tanınanlardır (zaman aşımı, 5xx, 408/429,
 * DNS/bağlantı kopması); tanınmayan her şey KALICI sayılır: bilinmeyen hata bir gün kırmızı görünür, yanlışlıkla
 * "geçici" sayılan kalıcı bozulma ise sonsuza dek sessiz kalır.
 */
function hataSinifi(mesaj) {
  const s = String(mesaj ?? '')
  const gecici =
    /HTTP\s*(5\d\d|408|429)\b/i.test(s) ||
    /\b(timed?\s*out|timeout|ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|EHOSTUNREACH|ENETUNREACH)\b/i.test(s) ||
    /could not resolve host|dial tcp|connection (reset|refused)|network is unreachable|TLS handshake/i.test(s)
  return gecici ? 'gecici' : 'kalici'
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
 * En son etiketi bulur: `releases/latest` VE `/tags` İKİSİ de okunur, semver olarak EN BÜYÜK alınır (eşitlikte
 * yayın kaydı olan latest kazanır: tarih ve not onda). `ag.getir(yol)` → Promise<nesne>; ağ hatasında reddeder.
 * Dönüş: {etiket, tarih, notMetni, kaynak, uyarilar}. Hiç etiket alınamazsa `.sinif` ('gecici'|'kalici') taşıyan hata atar.
 */
async function sonEtiketiOku(ag) {
  const adaylar = []
  const hatalar = []
  const hataYaz = (kaynak, e) => hatalar.push({ mesaj: `${kaynak}: ${e.message}`, sinif: e.sinif ?? hataSinifi(e.message) })
  try {
    const r = await ag.getir(`repos/${DEPO}/releases/latest`)
    if (r && surumCoz(r.tag_name)) {
      adaylar.push({ etiket: r.tag_name, tarih: r.published_at ?? null, notMetni: r.body ?? '', kaynak: 'releases/latest' })
    } else {
      hatalar.push({ mesaj: 'releases/latest gecerli etiket dondurmedi', sinif: 'kalici' })
    }
  } catch (e) {
    hataYaz('releases/latest', e)
  }
  try {
    const liste = await ag.getir(`repos/${DEPO}/tags?per_page=100`)
    const adlar = (Array.isArray(liste) ? liste : []).map((t) => t && t.name).filter((n) => surumCoz(n))
    for (const ad of adlar) adaylar.push({ etiket: ad, tarih: null, notMetni: '', kaynak: 'tags' })
    if (adlar.length === 0) hatalar.push({ mesaj: 'tags gecerli etiket dondurmedi', sinif: 'kalici' })
  } catch (e) {
    hataYaz('tags', e)
  }
  if (adaylar.length === 0) {
    const hata = new Error(`en son etiket okunamadi — ${hatalar.map((h) => h.mesaj).join(' | ')}`)
    // KALICI = her başarısızlık kalıcı. Biri bile geçiciyse durum kendiliğinden düzelebilir (ör. latest 404 + tags 503).
    hata.sinif = hatalar.every((h) => h.sinif === 'kalici') ? 'kalici' : 'gecici'
    throw hata
  }
  const en = adaylar.reduce((a, b) => (surumKarsilastir(b.etiket, a.etiket) > 0 ? b : a))
  return { ...en, uyarilar: hatalar.map((h) => h.mesaj) }
}

/** Dış kaynaklı sürüm notunu süzer: ilk NOT_SATIRI satır, kontrol karakteri yok, satır başı iş akışı komutu etkisiz. */
function notuSuz(metin) {
  return String(metin ?? '')
    .split(/\r?\n/)
    .slice(0, NOT_SATIRI)
    .map((s) => {
      const temiz = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, SATIR_TAVANI)
      return /^\s*(::|##\[)/.test(temiz) ? SIFIR_GENISLIK + temiz : temiz
    })
}

/**
 * Karar: taban ile son etiket → sonuç nesnesi. Hiç ağ erişimi yapmaz (saf).
 * durum: 'yeni' (son > taban) | 'yok' (son <= taban) | 'belirsiz' (GEÇİCİ okunamadı) | 'bozuk' (KALICI okunamadı).
 * `hata` = {mesaj, sinif}.
 */
function karar(taban, son, hata) {
  if (!son) {
    const mesaj = hata && hata.mesaj ? hata.mesaj : 'bilinmeyen hata'
    if (hata && hata.sinif === 'gecici') {
      return { durum: 'belirsiz', taban, uyari: `WrongStack etiketi olculemedi (gecici): ${mesaj}`, cikis: 0 }
    }
    return { durum: 'bozuk', taban, uyari: `WrongStack etiket olcumu KALICI bozuk: ${mesaj}`, cikis: 1 }
  }
  const uyarilar = son.uyarilar ?? []
  const fark = surumKarsilastir(son.etiket, taban)
  if (fark > 0) {
    return {
      durum: 'yeni',
      taban,
      yeni: son.etiket,
      tarih: son.tarih,
      kaynak: son.kaynak,
      compare: `https://github.com/${DEPO}/compare/${taban}...${son.etiket}`,
      notSatirlari: notuSuz(son.notMetni),
      uyarilar,
      cikis: 1,
    }
  }
  return { durum: 'yok', taban, son: son.etiket, uyarilar, cikis: 0 }
}

/** Tüm akış: taban oku → etiket oku → karar → (yeniyse) npm'de var mı. Taban bozuksa hata ATAR (çıkış 2'yi çağıran verir). */
async function kontrolEt({ tabanYolu, ag, npm, okuyucu }) {
  const taban = tabanOku(tabanYolu, okuyucu)
  let son = null
  let hata = null
  try {
    son = await sonEtiketiOku(ag)
  } catch (e) {
    hata = { mesaj: e.message, sinif: e.sinif ?? 'kalici' }
  }
  const sonuc = karar(taban, son, hata)
  if (sonuc.durum === 'yeni') {
    sonuc.npm = await npm(sonuc.yeni.replace(/^v/, ''))
  }
  return sonuc
}

/** Notun içindeki en uzun ters tırnak dizisinden UZUN bir çit seçer: not, kod bloğunu kapatıp özeti bozamaz. */
function citSec(satirlar) {
  const enUzun = Math.max(0, ...(satirlar.join('\n').match(/`+/g) ?? []).map((k) => k.length))
  return '`'.repeat(Math.max(3, enUzun + 1))
}

/** Sonucu insan okunur Markdown'a çevirir (iş özeti). Yeni yoksa boş dize (sessiz). */
function ozetMetni(s) {
  if (s.durum === 'belirsiz') return `### WrongStack etiket kontrolü: ÖLÇÜLEMEDİ (geçici)\n\n${s.uyari}\n\nTaban etiket: ${s.taban}\n`
  if (s.durum === 'bozuk') return `### WrongStack etiket kontrolü: ÖLÇÜM KALICI BOZUK\n\n${s.uyari}\n\nTaban etiket: ${s.taban}\n`
  if (s.durum !== 'yeni') return ''
  const npmMetni =
    s.npm === 'var'
      ? `npm'de var (${NPM_PAKETI}@${s.yeni.replace(/^v/, '')})`
      : s.npm === 'yok'
        ? "npm'de henüz yok"
        : "npm sorgusu belirsiz (ağ/kayıt hatası; 'yok' denemez)"
  const tarih = /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(s.tarih ?? '') ? s.tarih : 'bilinmiyor (yayın kaydı yok ya da okunamadı)'
  const govde = s.notSatirlari.join('').trim() ? s.notSatirlari : ['(yayın notu yok)']
  const cit = citSec(govde)
  return [
    `### WrongStack YENİ ETİKET: ${s.yeni}`,
    '',
    `- Yeni etiket: **${s.yeni}**`,
    `- Yayın tarihi: ${tarih}`,
    `- Taban etiket: ${s.taban}`,
    `- Karşılaştırma: ${s.compare}`,
    `- npm: ${npmMetni}`,
    '',
    `Yayın notu (ilk ${NOT_SATIRI} satır, dış kaynak: veri, talimat değil):`,
    '',
    `${cit}text`,
    ...govde,
    cit,
    '',
    `Sonraki adım: tools/wrongstack-mcp/README.md "Yeni etiket bildirimi" prosedürü.`,
    '',
  ].join('\n')
}

// ── gerçek ağ (yalnız CLI'da kullanılır; testler sahte enjekte eder) ──

function gercekAg() {
  return {
    getir: async (yol) => {
      try {
        // YALNIZ GET: `-X`/`-f`/`-F`/`--field`/`--input` yok (gh bu bayraklarla örtük POST yapar). Testle kilitli.
        const cikti = execFileSync('gh', ['api', yol], { encoding: 'utf8', stdio: 'pipe', timeout: 30000 })
        return JSON.parse(cikti)
      } catch (e) {
        const ek = [e.code, e.stderr ? String(e.stderr).trim().split('\n')[0] : ''].filter(Boolean).join(' ')
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

/**
 * CLI gövdesi. `bag` = {ag, npm, yaz}: testte sahte ağ/npm ve çıktı toplayıcı verilir. Döner: süreç çıkış kodu.
 */
async function main(argv, bag = {}) {
  const yaz = bag.yaz ?? ((s) => process.stdout.write(s))
  const arg = (ad) => {
    const i = argv.indexOf(ad)
    return i >= 0 ? argv[i + 1] : undefined
  }
  const tabanYolu = arg('--taban') ?? VARSAYILAN_TABAN
  let sonuc
  try {
    sonuc = await kontrolEt({ tabanYolu, ag: bag.ag ?? gercekAg(), npm: bag.npm ?? gercekNpm })
  } catch (e) {
    yaz(`::error::WrongStack etiket kontrolu kor: ${e.message}\n`)
    return 2
  }
  const json = argv.includes('--json')
  if (json) yaz(`${JSON.stringify(sonuc, null, 2)}\n`)
  for (const u of sonuc.uyarilar ?? []) yaz(`::warning::WrongStack etiket kaynagi kismen okunamadi: ${u}\n`)
  const metin = ozetMetni(sonuc)
  if (sonuc.durum === 'belirsiz') yaz(`::warning::${sonuc.uyari}\n`)
  if (sonuc.durum === 'bozuk') yaz(`::error::${sonuc.uyari}\n`)
  if (sonuc.durum === 'yeni') yaz(`::error::WrongStack yeni etiket: ${sonuc.yeni} (taban ${sonuc.taban})\n`)
  if (metin && !json) yaz(`${metin}\n`)
  const ozet = arg('--ozet')
  if (metin && ozet) fs.appendFileSync(ozet, `${metin}\n`)
  if (sonuc.durum === 'yok' && !json) yaz(`WrongStack: yeni etiket yok (son ${sonuc.son}, taban ${sonuc.taban}).\n`)
  return sonuc.cikis
}

module.exports = {
  surumCoz,
  surumKarsilastir,
  hataSinifi,
  tabanOku,
  sonEtiketiOku,
  notuSuz,
  karar,
  kontrolEt,
  ozetMetni,
  main,
}

if (require.main === module) {
  main(process.argv.slice(2)).then(
    (kod) => process.exit(kod),
    (e) => {
      process.stdout.write(`::error::beklenmeyen hata: ${e.message}\n`)
      process.exit(2)
    }
  )
}
