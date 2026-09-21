'use strict'
/**
 * POSTA KUTUSU SARMALAYICISI — mailbox-mcp'yi PENCERENİN KENDİ oturum kimliğiyle başlatır.
 *
 * ⭐NİÇİN VAR (2026-09-21, ÖLÇÜLDÜ): `.mcp.json` args içindeki `${CLAUDE_CODE_SESSION_ID}` GENİŞLEMEDİ.
 * İki pencerede (OPS cb0467f1, ALTYAPI ac03ce11) `register_self` → agentId düz metin
 * "${CLAUDE_CODE_SESSION_ID}" döndü; "değişken yoksa sunucu açılmaz" varsayımı da TUTMADI — sunucu
 * düz metni kimlik kabul edip açıldı. Sonuç: bütün pencereler AYNI kimlik = önlenmek istenen arıza.
 *
 * KİMLİK KAYNAĞI (sırayla, ilk geçerli kazanır):
 *   1. `CLAUDE_CODE_SESSION_ID` ortam değişkeni — yalnız UUID biçimindeyse (düz "${…}" reddedilir).
 *   2. Ebeveyn sürecin oturum dosyası `~/.claude/sessions/<ppid>.json` → `sessionId`. Ölçüldü: MCP
 *      sürecinin ebeveyni Claude sürecinin kendisi (ppid == CLAUDE_PID) ve o dosyada oturum kimliği var.
 *      Bu Claude Code'un iç dosyasıdır, belgelenmiş arayüz DEĞİL — biçimi değişirse 3'e düşülür.
 *   3. Hiçbiri yoksa ÇIKIŞ 1 (fail-closed): kutu AÇILMAZ. Ortak/varsayılan kimlikle açılan kutu,
 *      hiç açılmayan kutudan kötüdür.
 *
 * Sunucu AYNI süreçte başlatılır (alt süreç yok → pencere kapanınca yetim kalmaz).
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Kimliği bulur; bulamazsa null. Yan etkisiz — test bu fonksiyonu fikstürle çağırır. */
function kimlikBul({ env, ppid, oturumDizini }) {
  const d = env.CLAUDE_CODE_SESSION_ID
  if (typeof d === 'string' && UUID.test(d)) return { kimlik: d, kaynak: 'ortam' }
  try {
    const o = JSON.parse(fs.readFileSync(path.join(oturumDizini, `${ppid}.json`), 'utf8'))
    if (typeof o.sessionId === 'string' && UUID.test(o.sessionId)) return { kimlik: o.sessionId, kaynak: 'oturum-dosyasi' }
  } catch {
    // dosya yok / bozuk → aşağıda null
  }
  return null
}

async function calistir() {
  const bulunan = kimlikBul({
    env: process.env,
    ppid: process.ppid,
    oturumDizini: path.join(os.homedir(), '.claude', 'sessions'),
  })
  if (!bulunan) {
    process.stderr.write(
      'posta-kutusu: oturum kimligi BULUNAMADI (ortam degiskeni yok/gecersiz, ebeveyn oturum dosyasi yok) — kutu ACILMADI\n',
    )
    process.exit(1)
  }
  process.stderr.write(`posta-kutusu: kimlik ${bulunan.kimlik.slice(0, 8)}… (kaynak: ${bulunan.kaynak})\n`)
  const cli = path.join(__dirname, 'node_modules', '@wrongstack', 'mailbox-mcp', 'dist', 'cli.js')
  process.argv = [
    process.argv[0],
    cli,
    ...process.argv.slice(2),
    '--actor',
    bulunan.kimlik,
    '--session-id',
    bulunan.kimlik,
  ]
  await import(pathToFileURL(cli).href)
}

if (require.main === module) {
  calistir().catch((e) => {
    process.stderr.write(`posta-kutusu: ${e && e.stack ? e.stack : e}\n`)
    process.exit(1)
  })
}

module.exports = { kimlikBul }
