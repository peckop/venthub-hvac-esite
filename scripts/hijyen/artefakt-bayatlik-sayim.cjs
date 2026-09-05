#!/usr/bin/env node
/**
 * ARTEFAKT BAYATLIK SAYIMI — DONDURULMUŞ MOD'un TEK KAYNAĞI (REC-132 · D1).
 *
 * NİÇİN VAR
 * =========
 * Üretilmiş toplamalar (`docs/*_master.md` + `artefakt_manifest.json`) her şeridin PR'ında
 * yol alıyordu; iki açık PR varsa çakışma kaçınılmazdı. Ölçüldü (2026-09-03/04): **yedi**
 * taban tazelemesi, her biri tam bir CI koşumu, ve iki PR'da kapılar **hiç doğmadı** —
 * çakışık PR'ın birleşme ref'i üretilemediği için. Yani sınıf yalnız zaman yakmıyor,
 * **sahte yeşil** de üretiyor.
 *
 * Recep/OPS kararı (2026-09-04): **üretim DONDURULUR.** Ama bir kapıyı kapatmak, ölçümü
 * susturmak DEĞİLDİR (§21: kabul edilen boşluk sessiz olamaz). `INV-DOC-4b`'nin parity kolu
 * **bloklamaktan SAYIMA** döner — eşik uzatılmaz, kapı silinmez. C4'te (companion) aynı biçim
 * uygulandı ve işe yaradı.
 *
 * ⭐NİÇİN AYRI MODÜL — §26 TEK KAYNAK
 * ===================================
 * Sayı iki yerde iki kez hesaplanırsa (bir testte, bir panoda) ikisi sessizce ayrışır.
 * Sayım BURADA yapılır; test ve pano bu modülün TÜKETİCİSİDİR. Test ayrıca kendi bağımsız
 * hesabıyla çapraz doğrular — çünkü paylaşılan tek uygulama **iki yönde birden** yanılabilir
 * (2026-08 ölçümü: dört ajan aynı ölçütü benimsedi, günde dört kez düzeltildi).
 *
 * ⚠KAPSAM SINIRI, ADIYLA
 * ======================
 * Bu modül YALNIZ "kaynak derlemeden sonra değişti mi" (parity) sorusunu sayar.
 * **AXIOM 3 kolu — "üretilmiş dosyanın İÇERİĞİ manifestteki özetle aynı mı" — BU MODÜLÜN
 * KAPSAMINDA DEĞİLDİR ve BLOKLAMAYA DEVAM EDER.** O kol `INV-DOC-4` içinde yaşar
 * (`uretilmis-artefakt-tazeligi.test.ts`, "⭐depodaki artefaktın içeriği manifestteki özetle
 * AYNI"). Üretilmiş dosyayı elle düzenlemek hâlâ KIRMIZIDIR.
 *
 * ⚠Aynı şekilde `INV-DOC-4b`'nin diğer iki kolu ("manifest izlenmeyen kaynak taşımıyor" ve
 * vacuous-guard) da dondurulmaz. Dondurulan TEK kol parity'dir.
 * (Bu ayrım bir plan-challenger tarafından bulundu: ilk planım "INV-DOC-4b'nin iki kolu var"
 * diyordu — ÜÇ kolu var ve üçü de kaynak tarafında; elle-düzenleme kolu başka bir değişmezin
 * içinde. Yanlış kolu dondurmak kapıyı sessizce boşaltırdı.)
 *
 * Yöneten cetveller: `docs/standards/uretilmis-artefakt-standard.md` (AXIOM 3/7, INV-DOC-4b),
 * `docs/standards/fleet-mechanism-standard.md` §21.
 */

'use strict'

const { execFileSync } = require('child_process')

/** Manifest yolu — tek yerde. */
const MANIFEST_YOLU = 'docs/artefakt_manifest.json'

function gitOku(kok, args) {
  return execFileSync('git', ['-C', kok, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 })
}

/** HEAD'deki blob SHA haritası — DİSK değil, COMMIT'LENMİŞ durum okunur. */
function headBloblari(kok) {
  const cikti = gitOku(kok, ['ls-tree', '-r', 'HEAD', '--format=%(objectname) %(path)'])
  const harita = new Map()
  for (const satir of cikti.split('\n')) {
    const bosluk = satir.indexOf(' ')
    if (bosluk > 0) harita.set(satir.slice(bosluk + 1), satir.slice(0, bosluk))
  }
  return harita
}

function manifestOku(kok) {
  try {
    return JSON.parse(gitOku(kok, ['show', `HEAD:${MANIFEST_YOLU}`]))
  } catch {
    return null
  }
}

/**
 * SAF ÇEKİRDEK — girdi manifest + blob haritası, çıktı bayatlık dökümü.
 * Saf olması fikstür kurulabilmesi içindir (§25): kol durumu ÜRETİR, ortamı varsaymaz.
 * @returns {{bayat:Array<{artefakt:string,degisen:string[],silinen:string[]}>,
 *            artefaktSayisi:number, kaynakSayisi:number, olculdu:boolean}}
 */
function sayimCekirdegi({ manifest, bloblar }) {
  if (!manifest || !Array.isArray(manifest.artefaktlar)) {
    return { bayat: [], artefaktSayisi: 0, kaynakSayisi: 0, olculdu: false }
  }
  const bayat = []
  for (const a of manifest.artefaktlar) {
    const kayitli = (a.kaynak && a.kaynak.dosyalar) || {}
    const degisen = []
    const silinen = []
    for (const [yol, sha] of Object.entries(kayitli)) {
      const simdiki = bloblar.get(yol)
      if (simdiki === undefined) silinen.push(yol)
      else if (simdiki !== sha) degisen.push(yol)
    }
    if (degisen.length || silinen.length) {
      bayat.push({ artefakt: a.yol || a.ad, degisen, silinen })
    }
  }
  return {
    bayat,
    artefaktSayisi: bayat.length,
    kaynakSayisi: bayat.reduce((t, b) => t + b.degisen.length + b.silinen.length, 0),
    olculdu: true,
  }
}

/** Depodan ölçer. `kok` verilmezse bulunduğun dizin. */
function olc({ kok } = {}) {
  const agac = kok || process.cwd()
  try {
    return sayimCekirdegi({ manifest: manifestOku(agac), bloblar: headBloblari(agac) })
  } catch (e) {
    return {
      bayat: [], artefaktSayisi: 0, kaynakSayisi: 0, olculdu: false,
      sebep: String((e && e.message) || e).slice(0, 160),
    }
  }
}

/**
 * KULLANICIYA GÖRÜNEN TEK SATIR — §26: metin sayımdan ÜRETİLİR, tekrarlanmaz.
 * ⚠"Ölçemedim" ile "bayat yok" AYRI cevaplardır ve ayrı yazılır.
 */
function ozetSatiri(b) {
  if (!b.olculdu) {
    return `artefakt bayatligi OLCULEMEDI (${b.sebep || 'sebep yok'}) — ` +
      'Olcememek gecmek DEGILDIR.'
  }
  if (b.artefaktSayisi === 0) return 'artefakt bayatligi: YOK'
  return `artefakt bayatligi: ${b.artefaktSayisi} artefakt, ${b.kaynakSayisi} kaynak — ` +
    'borc SAYILIYOR; bloklayip bloklamadigini TASIYICI ANAHTARI soyler ' +
    '(.companion-tasiyici.json). Elle tazeleme: docs/standards/uretilmis-artefakt-standard.md'
}

module.exports = { olc, sayimCekirdegi, ozetSatiri, headBloblari, manifestOku, MANIFEST_YOLU }

if (require.main === module) {
  const b = olc({ kok: process.argv[2] })
  process.stdout.write(ozetSatiri(b) + '\n')
  for (const x of b.bayat.slice(0, 10)) {
    process.stdout.write(
      `  · ${x.artefakt}: ${x.degisen.length} degisen, ${x.silinen.length} silinen kaynak\n`)
  }
  // Çıkış kodu DAİMA 0: bu bir SAYIM aracı, kapı değil. Ölçülemedi hâli metinde yazılı.
  process.exit(0)
}
