'use strict'
/**
 * WRONGSTACK SÜRÜM SATIRI (ARC-24, karar 257) — defter-tazelik-satiri.cjs'in üçüncü eşiksiz bloğu.
 *
 * ── NİÇİN VAR ──
 *
 * Karar 257 "günlük sürüm kontrolü" dedi; zamanlanmış görev hiç kurulmadı ve kimse fark etmedi
 * (10-04: bizde 1.0.26, GitHub'da 1.0.31). Ölçümün var olması, kararın verildiği yerde
 * göründüğü anlamına gelmez (REC-342 dersi): bu yüzden sürüm farkı her mesajın satırına yazılır.
 * Zamanlanmış görev DEĞİL, kota harcamaz, dışarıya yazmaz.
 *
 * ── NASIL ──
 *
 * `bizde` = tools/wrongstack-mcp/package.json içindeki dört paketin SABİTLENMİŞ sürümü (her tur
 * taze okunur, tek küçük dosya). `son` = GitHub WrongStack/WrongStack son sürüm etiketi
 * (npm'den önce GitHub'a düşüyor). `son` önbellekten gelir: pano dizininde
 * `.wrongstack-surum-onbellek.json`. Önbellek yok ya da 24 saatten eskiyse ölçüm arka planda
 * (bu dosya `--yaz` ile) başlatılır: günde en çok bir ağ çağrısı. Ağ hatası olursa önbellek
 * 2 saat sonra yeniden denenir ve satır "OLCULEMEDI (sebep)" der; eski bilinen değer korunur ama
 * hata yanında yazılır (ölçemedim ≠ güncel).
 *
 * ⛔ Kurulum yapmaz, yükseltme önermez; yalnız farkı gösterir. Yükseltme kararı ARC-24 kartında.
 */
const fs = require('fs')
const path = require('path')

const ONBELLEK_ADI = '.wrongstack-surum-onbellek.json'
const TAZELE_SAAT = 24
const HATA_YENIDEN_SAAT = 2
const BAYAT_SAAT = 48
const KILIT_DK = 10
const DEPO_ADRESI = 'https://api.github.com/repos/WrongStack/WrongStack/releases/latest'
const NPM_ADRESI = 'https://registry.npmjs.org/@wrongstack/sage-mcp/latest'
const PAKET_YOLU =path.join('tools', 'wrongstack-mcp', 'package.json')

function onbellekYolu(pano) {
  return path.join(pano, ONBELLEK_ADI)
}

/** "1.0.31" → [1,0,31]; çözülemezse null. Etiketteki baştaki "v" atılır. */
function surumAyir(s) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(s || '').trim())
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

/**
 * ⛔ENJEKSİYON SINIRI: satır her mesajın bağlamına yazılır; GitHub etiketi, npm sürümü ve hata
 * metni DIŞ VERİDİR. `surumAyir` yalnız metnin BAŞINI doğruluyor ("1.0.31 şunu yap…" geçer),
 * bu yüzden bağlama giden her değer önce buradan geçer: sürüm yalnız rakamlardan yeniden kurulur,
 * tarih yalnız YYYY-AA-GG, serbest metin (hata) harf/rakam/ayraçla sınırlanır.
 */
function surumTemiz(s) {
  const a = surumAyir(s)
  return a ? a.join('.') : null
}
function tarihTemiz(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) ? String(s) : ''
}
function metinTemiz(s) {
  // Hata metni SABİT SÖZLÜKTEN seçilir: serbest metin (harfler dahil) bağlama girmez. Mesaj
  // gövdesi bilerek atılır; sebep türü yeter.
  const m = /^(ag|zaman asimi|GitHub \d{3}|etiket cozulemedi|fetch yok|JSON bozuk|package\.json okunamadi|@wrongstack bagimliligi yok)/.exec(
    String(s == null ? '' : s),
  )
  return m ? m[1] : 'sebep tanimsiz'
}

/** a<b → -1, a=b → 0, a>b → 1; çözülemeyen → null. */
function karsilastir(a, b) {
  const x = surumAyir(a)
  const y = surumAyir(b)
  if (!x || !y) return null
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1
  return 0
}

/**
 * Bizde sabitli sürüm: dört paketin EN DÜŞÜĞÜ (karışıksa ayrıca işaretlenir).
 * @returns {{ surum: string, karisik: boolean } | { hata: string }}
 */
function kurulu(depo) {
  let paket
  try {
    paket = JSON.parse(fs.readFileSync(path.join(depo, PAKET_YOLU), 'utf8'))
  } catch {
    return { hata: 'package.json okunamadi' }
  }
  const bagimlilik = (paket && paket.dependencies) || {}
  const surumler = Object.entries(bagimlilik)
    .filter(([ad]) => ad.startsWith('@wrongstack/'))
    .map(([, s]) => String(s).replace(/^[\^~]/, ''))
    .filter((s) => surumAyir(s))
  if (surumler.length === 0) return { hata: '@wrongstack bagimliligi yok' }
  const sirali = surumler.slice().sort((a, b) => karsilastir(a, b))
  return { surum: sirali[0], karisik: new Set(surumler).size > 1 }
}

/**
 * Ağ ölçümü: GitHub son sürüm etiketi. Hata olursa bir `hata` metni döner, FIRLATMAZ.
 * @param {{ fetchFn?: typeof fetch, zamanAsimiMs?: number }} [secenek]
 */
async function sonSurumuOlc(secenek = {}) {
  const fetchFn = secenek.fetchFn || globalThis.fetch
  if (typeof fetchFn !== 'function') return { hata: 'fetch yok' }
  try {
    const yanit = await fetchFn(DEPO_ADRESI, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'venthub-wrongstack-satiri' },
      signal: AbortSignal.timeout(secenek.zamanAsimiMs || 8000),
    })
    if (!yanit.ok) return { hata: 'GitHub ' + yanit.status }
    const v = await yanit.json()
    if (!surumAyir(v && v.tag_name)) return { hata: 'etiket cozulemedi' }
    const sonuc = { son: surumTemiz(v.tag_name), tarih: tarihTemiz(String(v.published_at || '').slice(0, 10)) }
    // KURULABİLİR sürüm: GitHub etiketi npm'e günler sonra iniyor (10-04: GitHub 1.0.31, npm 1.0.29).
    // npm okunamazsa satırdan düşer; GitHub ölçümünü bozmaz.
    try {
      const n = await fetchFn(NPM_ADRESI, {
        headers: { accept: 'application/json', 'user-agent': 'venthub-wrongstack-satiri' },
        signal: AbortSignal.timeout(secenek.zamanAsimiMs || 8000),
      })
      if (n.ok) {
        const nv = await n.json()
        if (nv && surumAyir(nv.version)) sonuc.npm = surumTemiz(nv.version)
      }
    } catch {
      /* npm ölçülemedi: npm alanı yok */
    }
    return sonuc
  } catch (e) {
    const ad = e && e.name === 'TimeoutError' ? 'zaman asimi' : 'ag'
    return { hata: ad + ' (' + String(e && e.message).slice(0, 40) + ')' }
  }
}

/** @returns {{ durum: 'yok' } | { durum: 'bozuk', hata: string } | { durum: 'tamam', veri: object }} */
function oku(yol) {
  let metin
  try {
    metin = fs.readFileSync(yol, 'utf8')
  } catch {
    return { durum: 'yok' }
  }
  try {
    const v = JSON.parse(metin)
    if (!v || typeof v.olculdu !== 'string') return { durum: 'bozuk', hata: 'olculdu alani yok' }
    return { durum: 'tamam', veri: v }
  } catch (e) {
    return { durum: 'bozuk', hata: 'JSON bozuk' }
  }
}

/**
 * Satırı üretir. `depo` verilirse "bizde" taze okunur. Her koşulda bir satır döner:
 * ölçemediğinde de konuşur (ölçülemedi ≠ güncel).
 */
function satir(sonuc, depo, simdi = Date.now()) {
  const k = kurulu(depo)
  const bizde = k.hata ? null : k.surum
  const onEk = k.hata ? 'bizde OLCULEMEDI (' + metinTemiz(k.hata) + ')' : 'bizde ' + bizde + (k.karisik ? ' (paketler karisik)' : '')
  if (sonuc.durum === 'yok') return '⚠WRONGSTACK: ' + onEk + ', son OLCULMEDI (onbellek yok)'
  if (sonuc.durum === 'bozuk') return '⚠WRONGSTACK: ' + onEk + ', son OLCULEMEDI (' + metinTemiz(sonuc.hata) + ')'
  // Önbellek dosyası da dış girdi sayılır: bağlama giden her alan çıkışta yeniden temizlenir.
  const v = {
    ...sonuc.veri,
    son: surumTemiz(sonuc.veri.son) || undefined,
    npm: surumTemiz(sonuc.veri.npm) || undefined,
    tarih: tarihTemiz(sonuc.veri.tarih),
    hata: sonuc.veri.hata ? metinTemiz(sonuc.veri.hata) : undefined,
  }
  const bayatSaat = Math.floor((simdi - Date.parse(v.olculdu)) / 3600000)
  const bayatEk = Number.isFinite(bayatSaat) && bayatSaat >= BAYAT_SAAT ? ' · onbellek ' + bayatSaat + ' saat bayat' : ''
  if (!v.son) return '⚠WRONGSTACK: ' + onEk + ', son OLCULEMEDI (' + (v.hata || 'sebep yok') + ')' + bayatEk
  const hataEk = v.hata ? ' · son kontrol OLCULEMEDI (' + v.hata + ')' : ''
  const tarihEk = v.tarih ? ' (' + v.tarih + ')' : ''
  const npmEk = v.npm && v.npm !== v.son ? ", npm'de " + v.npm : ''
  const fark = bizde ? karsilastir(bizde, v.son) : null
  if (fark === null) return '⚠WRONGSTACK: ' + onEk + ', son ' + v.son + tarihEk + npmEk + hataEk + bayatEk
  if (fark < 0) {
    const a = surumAyir(bizde)
    const b = surumAyir(v.son)
    const geride = a[0] === b[0] && a[1] === b[1] ? ' · ' + (b[2] - a[2]) + ' surum geride' : ' · geride'
    return '⚠WRONGSTACK: ' + onEk + ', son ' + v.son + tarihEk + npmEk + geride + hataEk + bayatEk
  }
  return 'WRONGSTACK: ' + onEk + ', son ' + v.son + tarihEk + npmEk + ' · guncel' + hataEk + bayatEk
}

/** Ölçümü yapar, önbelleğe yazar (yazma atomik: geçici dosya + yeniden adlandırma). */
async function yaz(pano, secenek = {}) {
  const simdi = (secenek.simdi || Date.now)()
  const onceki = oku(onbellekYolu(pano))
  const eskiVeri = onceki.durum === 'tamam' ? onceki.veri : {}
  const o = await sonSurumuOlc(secenek)
  const yeni = o.hata
    ? {
        ...(eskiVeri.son ? { son: eskiVeri.son, tarih: eskiVeri.tarih, ...(eskiVeri.npm ? { npm: eskiVeri.npm } : {}) } : {}),
        olculdu: new Date(simdi).toISOString(),
        hata: o.hata,
      }
    : { son: o.son, tarih: o.tarih, ...(o.npm ? { npm: o.npm } : {}), olculdu: new Date(simdi).toISOString() }
  fs.mkdirSync(pano, { recursive: true })
  const yol = onbellekYolu(pano)
  const gecici = yol + '.' + process.pid + '.tmp'
  fs.writeFileSync(gecici, JSON.stringify(yeni))
  fs.renameSync(gecici, yol)
  return yeni
}

/** Önbellek yok / bayat ise ölçümü arka planda başlatır. Başlatıldıysa true. */
function gerekirseTazele(pano, simdi = Date.now()) {
  const s = oku(onbellekYolu(pano))
  if (s.durum === 'tamam') {
    const limit = (s.veri.hata ? HATA_YENIDEN_SAAT : TAZELE_SAAT) * 3600000
    if (simdi - Date.parse(s.veri.olculdu) < limit) return false
  }
  const kilit = onbellekYolu(pano) + '.kilit'
  try {
    if (simdi - fs.statSync(kilit).mtimeMs < KILIT_DK * 60000) return false
  } catch {
    /* kilit yok */
  }
  try {
    fs.mkdirSync(pano, { recursive: true })
    fs.writeFileSync(kilit, String(simdi))
    require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kopuk-baslat.cjs')).kopukBaslat(__filename, ['--yaz'], {
      env: { ...process.env, VENTHUB_BOARD_DIR: pano },
    })
    return true
  } catch {
    return false // başlatılamadı: önbellek bayatladıkça satır bunu söyler
  }
}

module.exports = {
  onbellekYolu,
  surumAyir,
  karsilastir,
  kurulu,
  sonSurumuOlc,
  oku,
  satir,
  yaz,
  gerekirseTazele,
  TAZELE_SAAT,
  HATA_YENIDEN_SAAT,
  BAYAT_SAAT,
}

if (require.main === module && process.argv.includes('--yaz')) {
  const pano = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
  yaz(pano, { simdi: () => Date.now() }).then(
    () => process.exit(0),
    () => process.exit(0),
  )
}
