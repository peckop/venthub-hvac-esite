'use strict'
/**
 * KOPUK SÜREÇ BAŞLATICI (REC-415). Kancaların arka planda koşturduğu betikleri BURADAN başlatır;
 * `detached: true` başka yerde YASAK (src/__tests__/conformance/kopuk-surec-pencere.test.ts).
 *
 * Niçin: kopuk süreç konsolsuzdur; içinden çalışan `git`/`powershell` yeni konsol penceresi açar.
 * Bu başlatıcı çocuğa `NODE_OPTIONS=--require gizli-konsol.cjs` verir; çocuğun ve node
 * torunlarının her child_process çağrısı `windowsHide: true` alır. Ayrıntı: gizli-konsol.cjs.
 */
const { spawn } = require('child_process')
const path = require('path')

const GIZLI_KONSOL = path.join(__dirname, 'gizli-konsol.cjs').replace(/\\/g, '/')

/**
 * @param {string} betik  çalıştırılacak .cjs/.js yolu
 * @param {string[]} [args]
 * @param {import('child_process').SpawnOptions} [opts]  cwd/env gibi; detached/stdio/windowsHide EZİLİR
 */
function kopukBaslat(betik, args = [], opts = {}) {
  const env = { ...(opts.env || process.env) }
  const mevcut = env.NODE_OPTIONS || ''
  if (!mevcut.includes(GIZLI_KONSOL)) env.NODE_OPTIONS = `${mevcut ? mevcut + ' ' : ''}--require "${GIZLI_KONSOL}"`
  const cocuk = spawn(process.execPath, [betik, ...args], {
    ...opts,
    env,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  cocuk.unref()
  return cocuk
}

module.exports = { kopukBaslat, GIZLI_KONSOL }
