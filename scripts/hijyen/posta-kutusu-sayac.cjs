'use strict'
/**
 * POSTA KUTUSU SAYACI — açılışta "kutunda okunmamış N" satırı (karar 54, 2026-09-21).
 *
 * NİÇİN VAR: kutu kuruldu ve çalışıyor (OPS↔ALTYAPI ölçüldü), ama pencere açılışta kutusuna
 * kendiliğinden bakmıyor. Bakılmayan kutu, kapalı pencereye bırakılan mesajı yine kaybettirir —
 * kutunun tek amacı o kaybı kapatmaktı. Bu betik SessionStart kancasından çağrılır.
 *
 * NASIL: mailbox-mcp sunucusunu bu oturumun KİMLİĞİYLE kısa süreli başlatır, `mailbox_read
 * unread` sorar, kapatır. Kutunun veritabanına DOĞRUDAN dokunmaz (sunucu da dokunmuyor; iç
 * biçime bağlanmamak için). Ölçüldü: sıcak daemon ile ~1,2 sn.
 *
 * SESSİZLİK + DÜRÜSTLÜK: unread 0 → satır YOK. Ölçülemezse (zaman aşımı, sunucu yok) SESSİZ
 * GEÇMEZ — "ölçülemedi" satırı basar; ölçülemeyen kutu temiz sayılmaz.
 */

const { spawn } = require('node:child_process')
const path = require('node:path')

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** { durum: 'sayildi', n } | { durum: 'olculemedi', sebep } */
function okunmamis(sid, { kok, zamanAsimiMs = 5000 } = {}) {
  return new Promise((coz) => {
    if (typeof sid !== 'string' || !UUID.test(sid)) return coz({ durum: 'olculemedi', sebep: 'oturum kimligi gecersiz' })
    const cli = path.join(kok, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'mailbox-mcp', 'dist', 'cli.js')
    // Kök, pencerelerin kutusuyla AYNI olmalı: sürücü harfi küçük (bkz. posta-kutusu.cjs kanonikKok —
    // büyük `C:` ayrı bir kutu açar, sayaç boş kutuyu sayıp "0" derdi).
    const { kanonikKok } = require(path.join(kok, 'tools', 'wrongstack-mcp', 'posta-kutusu.cjs'))
    let p
    try {
      p = spawn(process.execPath, [cli, '--project-root', kanonikKok(kok), '--actor', sid, '--stdio'], {
        stdio: ['pipe', 'pipe', 'ignore'],
      })
    } catch (e) {
      return coz({ durum: 'olculemedi', sebep: (e && e.code) || 'baslatilamadi' })
    }
    let bitti = false
    const son = (sonuc) => {
      if (bitti) return
      bitti = true
      clearTimeout(zaman)
      try { p.kill() } catch { /* zaten kapali */ }
      coz(sonuc)
    }
    const zaman = setTimeout(() => son({ durum: 'olculemedi', sebep: `zaman asimi ${zamanAsimiMs} ms` }), zamanAsimiMs)
    p.on('error', (e) => son({ durum: 'olculemedi', sebep: (e && e.code) || 'surec hatasi' }))
    p.on('exit', () => son({ durum: 'olculemedi', sebep: 'sunucu cevapsiz kapandi' }))
    const yaz = (m) => p.stdin.write(JSON.stringify(m) + '\n')
    let tampon = ''
    p.stdout.on('data', (d) => {
      tampon += d
      let i
      while ((i = tampon.indexOf('\n')) >= 0) {
        const satir = tampon.slice(0, i).trim()
        tampon = tampon.slice(i + 1)
        if (!satir) continue
        let m
        try { m = JSON.parse(satir) } catch { continue }
        if (m.id === 1) {
          yaz({ jsonrpc: '2.0', method: 'notifications/initialized' })
          yaz({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'mailbox_read', arguments: { action: 'unread' } } })
        } else if (m.id === 2) {
          try {
            const n = JSON.parse(m.result.content[0].text).unread
            son(Number.isInteger(n) ? { durum: 'sayildi', n } : { durum: 'olculemedi', sebep: 'cevap bicimi' })
          } catch {
            son({ durum: 'olculemedi', sebep: 'cevap bicimi' })
          }
        }
      }
    })
    yaz({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'acilis-sayaci', version: '1' } } })
  })
}

/** Açılış metnine eklenecek satır; 0 ise boş dize (sessizlik kuralı). */
function acilisSatiri(sonuc) {
  if (sonuc.durum === 'sayildi') {
    return sonuc.n > 0
      ? `📬 KUTUNDA OKUNMAMIS ${sonuc.n} MESAJ — mailbox_read unread / query (to = senin tam oturum numaran) ile oku, sonra ack et.\n`
      : ''
  }
  return `⚠posta kutusu OLCULEMEDI (${sonuc.sebep}) — okunmamis mesaj olabilir; mailbox_read unread ile elle bak.\n`
}

module.exports = { okunmamis, acilisSatiri }

if (require.main === module) {
  const sid = process.argv[2]
  okunmamis(sid, { kok: path.resolve(__dirname, '..', '..') }).then((s) => {
    process.stdout.write(JSON.stringify(s) + '\n' + acilisSatiri(s))
  })
}
