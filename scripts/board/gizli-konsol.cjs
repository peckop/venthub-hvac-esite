'use strict'
/**
 * GİZLİ KONSOL ÖN YÜKLEMESİ (REC-415, Recep 09-29: "pencereler görünmesin, çok rahatsız oluyorum").
 *
 * ── NİÇİN VAR ──
 *
 * `detached: true` ile başlatılan bir süreç KONSOLSUZ doğar (Windows DETACHED_PROCESS). `windowsHide`
 * yalnız o sürecin kendi penceresini gizler; o sürecin içinden `git`, `powershell` gibi konsol
 * programları `windowsHide` OLMADAN başlatılırsa Windows onlara YENİ konsol verir ve varsayılan
 * terminal Windows Terminal ise ekranda `git.exe` başlıklı bir pencere açılıp kapanır.
 * 2026-09-29'da ÖLÇÜLDÜ: aynı çocuk betik `detached` başlatılınca pencere çıktı (3/3 koşum),
 * miras alınan gizli konsolla çıkmadı. Kaynaklar: session-board → registry-autosync (git fetch),
 * bellek-yoklama --tazele (powershell), belge-satiri --yaz. Recep her oturum açılışında ve her
 * compact bitişinde 3-4 pencere görüyordu.
 *
 * ── NASIL ──
 *
 * `NODE_OPTIONS=--require <bu dosya>` ile kopuk sürecin (ve onun node çocuklarının) child_process
 * çağrılarına `windowsHide: true` varsayılan olarak eklenir. `windowsHide` CREATE_NO_WINDOW verir:
 * çocuk GİZLİ bir konsol alır, onun çocukları da onu miras alır — ağacın hiçbir yerinde pencere
 * doğmaz. Çağıran `windowsHide` değerini açıkça verdiyse (true/false) DOKUNULMAZ.
 *
 * Miras kipi ("detached olmadan başlat") DENENDİ ve SEÇİLMEDİ: ebeveyn çıkınca çocuk öldü
 * (işaret dosyası yazılmadı). Kopukluk kalır, pencere kapanır.
 *
 * Kopuk süreç başlatmanın tek doğru yolu: scripts/board/kopuk-baslat.cjs (test bunu zorlar).
 * Sınır: util.promisify(exec|execFile) yolu özgün işlevi çağırır ve bu sarmalayıcıdan geçmez;
 * kopuk süreçlerimizde kullanılmıyor.
 */
const cp = require('child_process')

const SARILAN = ['spawn', 'spawnSync', 'execFile', 'execFileSync', 'exec', 'execSync']

/** Seçenek nesnesini bulur (komuttan sonraki ilk düz nesne); yoksa geri çağırımdan önceye ya da sona ekler. */
function secenekleriTamamla(args) {
  const ilk = args.findIndex((a, i) => i > 0 && a !== null && typeof a === 'object' && !Array.isArray(a))
  if (ilk >= 0) {
    if (args[ilk].windowsHide === undefined) args[ilk] = { ...args[ilk], windowsHide: true }
    return args
  }
  const geriCagirim = args.findIndex((a, i) => i > 0 && typeof a === 'function')
  if (geriCagirim >= 0) args.splice(geriCagirim, 0, { windowsHide: true })
  else args.push({ windowsHide: true })
  return args
}

if (!cp.__vhGizliKonsol) {
  Object.defineProperty(cp, '__vhGizliKonsol', { value: true })
  for (const ad of SARILAN) {
    const asil = cp[ad]
    if (typeof asil !== 'function') continue
    const sarmal = function (...args) {
      return asil.apply(this, secenekleriTamamla(args))
    }
    for (const s of Object.getOwnPropertySymbols(asil)) sarmal[s] = asil[s]
    cp[ad] = sarmal
  }
}

module.exports = { secenekleriTamamla }
