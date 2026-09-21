'use strict'
/**
 * PNPM OVERRIDES — tek okuma noktası.
 *
 * ⭐NİÇİN VAR (2026-09-21, ÖLÇÜLDÜ): override'lar `package.json` → `pnpm.overrides`'tan
 * `pnpm-workspace.yaml` → `overrides:`'a taşındı. Sebep: Dependabot kilit dosyasını pnpm 11
 * ile üretiyor ve pnpm 11 `package.json` içindeki `pnpm` alanını OKUMUYOR; bot'un ilk dört
 * PR'ında 22 override'ın 22'si kilit dosyasından düştü, kapattığımız açıklar geri geldi.
 * pnpm 10 (Vercel 10.28, CI 10, yerel 10.15) iki yeri de okur; taşıma sonrası kilit dosyası
 * içerikte birebir aynı çıktı (satır sonu normalize sha256 eşit, 22 override yerinde).
 *
 * Override'ı okuyan her kapı BURADAN okur — iki kapının iki ayrı ayrıştırıcısı zamanla
 * ayrışır ve biri körleşince "kapı var" hissi kalır.
 *
 * AYRIŞTIRICI SINIRI (adıyla): depoda YAML çözücü yok (ölçüldü: ne `yaml` ne `js-yaml`).
 * Yalnız `overrides:` bloğunun düz `anahtar: değer` satırları okunur; tırnaklı anahtar ve
 * değer desteklenir. İç içe yapı, akış biçimi (`{a: b}`) ya da çok satırlı değer DESTEKLENMEZ
 * — öyle bir satır görülürse sessizce atlanmaz, `hatalar` dizisine yazılır.
 */

const fs = require('node:fs')
const path = require('node:path')

function tirnakSoy(s) {
  const t = s.trim()
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1)
  }
  return t
}

/** `pnpm-workspace.yaml` metninden overrides'ı çıkarır. */
function overridesAyristir(metin) {
  const satirlar = metin.split(/\r?\n/)
  const bas = satirlar.findIndex((s) => /^overrides:\s*(#.*)?$/.test(s))
  const out = {}
  const hatalar = []
  if (bas < 0) return { overrides: out, hatalar, bulundu: false }
  for (let i = bas + 1; i < satirlar.length; i++) {
    const s = satirlar[i]
    if (s.trim() === '' || /^\s*#/.test(s)) continue
    if (!/^\s/.test(s)) break // girintisiz satır = yeni üst anahtar, blok bitti
    const m = /^\s+('[^']+'|"[^"]+"|[^:\s][^:]*?):\s*(.+?)\s*$/.exec(s)
    if (!m || /^[{[]/.test(m[2])) {
      hatalar.push(`ayrıştırılamayan satır ${i + 1}: ${s.trim()}`)
      continue
    }
    out[tirnakSoy(m[1])] = tirnakSoy(m[2])
  }
  return { overrides: out, hatalar, bulundu: true }
}

/** Repo kökünden overrides'ı ve package.json'da ESKİ yerin kalıp kalmadığını okur. */
function overridesOku(kok) {
  const ws = path.join(kok, 'pnpm-workspace.yaml')
  const metin = fs.existsSync(ws) ? fs.readFileSync(ws, 'utf8') : ''
  const sonuc = overridesAyristir(metin)
  const pkg = JSON.parse(fs.readFileSync(path.join(kok, 'package.json'), 'utf8'))
  return { ...sonuc, eskiYerDolu: !!(pkg.pnpm && pkg.pnpm.overrides) }
}

module.exports = { overridesAyristir, overridesOku }
