'use strict'
/**
 * PR BİRLEŞTİ → KART KAPAT HATIRLATMASI (ARC-235, OPS 1 Kasım) — PostToolUse · Bash.
 *
 * NİÇİN: PR birleşince kartı kapatmayı tetikleyen adım yoktu (REC-376 #1334 Eylül'de bitti, kart ay sonra To Do).
 * `merge-ritueli.cjs --merge` kendi "KART KAPAT" satırını basar; pencereler çoğu zaman doğrudan `gh pr merge`
 * kullanıyor (merge-sonrasi-ileri-sar.cjs aynı boşluk için var). Bu kanca o yolu kapatır.
 *
 * NE YAPAR: komut `gh pr merge <N>` ise PR'ı okur; BİRLEŞMİŞSE gövdedeki `Kanban: <no>` satırından
 * "KART KAPAT" satırını pencereye döner (ortak mantık: scripts/board/kart-kapat.cjs). Ritüel komutunda susar
 * (satırı zaten bastı). Otomatik Done YOK.
 *
 * GÜVENLİK: salt-okuma (gh pr view), fail-open (her hata sessiz çıkış 0), çıktı ≤ 600 karakter, tek gh çağrısı
 * 15 sn tavanlı (harness ~60 sn'de kancayı öldürür). VANA: VENTHUB_PR_KART_KANCA=0 kancayı kapatır.
 */
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const MERGE = /\bgh\s+pr\s+merge\s+(?:--\S+\s+)*#?(\d+)\b/
const TAVAN = 600

/** Komuttan PR numarası; merge değilse ya da ritüel komutuysa null. */
function prNumarasi(komut) {
  if (typeof komut !== 'string' || /merge-ritueli\.cjs/.test(komut)) return null
  const m = MERGE.exec(komut)
  return m ? m[1] : null
}

/** Kanca gövdesi: {tool_input:{command}} → satır metni ya da null. `oku` ve `depo` test için enjekte edilir. */
function satir(girdi, oku = prOku) {
  const pr = prNumarasi(girdi && girdi.tool_input && girdi.tool_input.command)
  if (!pr) return null
  const p = oku(pr)
  if (!p || p.state !== 'MERGED') return null
  const { kartKapatSatirlari } = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kart-kapat.cjs'))
  return kartKapatSatirlari(pr, p.body).join('\n').slice(0, TAVAN)
}

function prOku(pr) {
  const cikti = execFileSync('gh', ['pr', 'view', pr, '--json', 'state,body'], {
    encoding: 'utf8',
    timeout: 15_000,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  return JSON.parse(cikti)
}

if (require.main === module) {
  let veri = ''
  process.stdin.on('data', (d) => (veri += d))
  process.stdin.on('end', () => {
    try {
      if (process.env.VENTHUB_PR_KART_KANCA === '0') process.exit(0)
      const s = satir(JSON.parse(veri || '{}'))
      if (s) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: s } }))
    } catch {
      /* fail-open: kanca komutu asla engellemez */
    }
    process.exit(0)
  })
}

module.exports = { prNumarasi, satir }
