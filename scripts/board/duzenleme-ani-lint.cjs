#!/usr/bin/env node
'use strict'

/**
 * DÜZENLEME ANI LİNT (ARC-214, OPS emri 26 Ekim 2026).
 *
 * NİÇİN: ESLint bugün tur sonunda (verify-on-stop.cjs, Stop) ve CI'da koşuyor; hata yazıldığı anda görünmüyor,
 * aynı tur içinde onlarca düzenleme üstüne birikiyor. Amaç (Recep): makineyi her seferinde tam koşuyla zorlamadan,
 * hatayı yazıldığı anda yakalamak. Bu modül TEK DOSYA lint'inin saf mantığıdır; kanca .claude/hooks/duzenleme-ani-lint.cjs.
 *
 * KAPSAM: yalnız depo içindeki src/ altı .ts/.tsx/.js/.jsx/.mjs/.cjs dosyaları. Dışarısı (belge, betik, node_modules,
 * depo dışı) koşmaz. Yalnız error (severity 2) döner; warning sessiz (OPS emri).
 *
 * BELLEK: tam proje taraması YOK (tek dosya). BELLEK uyarısı (bellek-yoklama.cjs) varken atlanır.
 * Çalıştırma: depodaki eslint'in kendi ikilisi (node ile), `--cache` (geçici klasör), `--no-warn-ignored`, JSON çıktı.
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const UZANTI = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/i
const MAKS_HATA = 8
const ZAMAN_ASIMI_MS = 45000

/** Dosya depo kökünün src/ altında mı ve uzantısı uygun mu? Yol mutlak ya da kök-göreli olabilir. */
function uygunMu(dosya, kok) {
  if (!dosya || typeof dosya !== 'string') return false
  const mutlak = path.resolve(kok, dosya)
  const goreli = path.relative(kok, mutlak).split(path.sep).join('/')
  if (!goreli || goreli.startsWith('..') || path.isAbsolute(goreli)) return false
  if (goreli.includes('node_modules/')) return false
  if (!goreli.startsWith('src/')) return false
  return UZANTI.test(goreli)
}

/** ESLint JSON çıktısından yalnız error'ları çıkarır. */
function hatalariCikar(jsonMetni) {
  let sonuc
  try {
    sonuc = JSON.parse(jsonMetni)
  } catch {
    return null
  }
  if (!Array.isArray(sonuc)) return null
  const hatalar = []
  for (const dosya of sonuc) {
    for (const m of dosya.messages || []) {
      if (m.severity === 2) hatalar.push({ satir: m.line || 0, sutun: m.column || 0, kural: m.ruleId || 'ayrıştırma', mesaj: String(m.message || '') })
    }
  }
  return hatalar
}

/** Kanca Claude'a döneceği metni üretir (hata yoksa ''). */
function metin(dosya, hatalar) {
  if (!hatalar || hatalar.length === 0) return ''
  const goster = hatalar.slice(0, MAKS_HATA).map((h) => `  ${h.satir}:${h.sutun}  ${h.kural}  ${h.mesaj}`)
  const fazla = hatalar.length > MAKS_HATA ? [`  … +${hatalar.length - MAKS_HATA} hata daha`] : []
  return [`ESLINT (düzenleme anı, tek dosya): ${dosya} — ${hatalar.length} hata. Düzelt, sonra devam et:`, ...goster, ...fazla].join('\n')
}

/** Depodaki eslint'i bulur; yoksa null. */
function eslintYolu(kok) {
  const aday = path.join(kok, 'node_modules', 'eslint', 'bin', 'eslint.js')
  return fs.existsSync(aday) ? aday : null
}

/**
 * Tek dosyayı lint'ler. Dönüş: { durum: 'temiz'|'hata'|'olculemedi', hatalar?, sebep? }.
 * `calistir` testte sahte verilir: (eslintYolu, argumanlar, kok) → { status, stdout, error }.
 */
function lintle(dosya, kok, calistir = varsayilanCalistir) {
  const eslint = eslintYolu(kok)
  if (!eslint) return { durum: 'olculemedi', sebep: 'eslint kurulu değil (node_modules/eslint yok)' }
  const onbellek = path.join(os.tmpdir(), 'venthub-eslint-duzenleme-ani')
  const arg = ['--no-warn-ignored', '--cache', '--cache-location', onbellek, '--format', 'json', '--', dosya]
  const r = calistir(eslint, arg, kok)
  if (r.error) return { durum: 'olculemedi', sebep: String(r.error.code || r.error.message || 'çalışmadı') }
  const hatalar = hatalariCikar(r.stdout || '')
  if (hatalar === null) return { durum: 'olculemedi', sebep: `eslint çıktısı çözülemedi (çıkış ${r.status})` }
  return hatalar.length ? { durum: 'hata', hatalar } : { durum: 'temiz' }
}

function varsayilanCalistir(eslint, arg, kok) {
  return spawnSync(process.execPath, [eslint, ...arg], {
    cwd: kok,
    encoding: 'utf8',
    timeout: ZAMAN_ASIMI_MS,
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  })
}

/** Bellek gerginliği varsa true (ağır komut başlatma kuralı). Ölçülemedi/bayat satırı atlamaya yol AÇMAZ. */
function bellekGergin(simdi = Date.now()) {
  try {
    const b = require(path.join(__dirname, '..', '..', '.claude', 'hooks', 'bellek-yoklama.cjs'))
    const s = b.satir(b.oku(), simdi)
    return typeof s === 'string' && s.startsWith('⚠BELLEK: ') && !s.includes('OLCULEMEDI')
  } catch {
    return false
  }
}

module.exports = { uygunMu, hatalariCikar, metin, lintle, bellekGergin, eslintYolu, UZANTI, MAKS_HATA }
