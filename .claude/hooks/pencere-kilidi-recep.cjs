#!/usr/bin/env node
'use strict'

/**
 * UserPromptSubmit hook — PENCERE KİLİDİNİ RECEP'İN SÖZÜ AÇAR (ARC-213, OPS tasarımı 26 Ekim 2026).
 *
 * NİÇİN: ARC-212 kilidini OPS elle koyuyordu; OPS'un hafızası bugün üç kez durdurmadı (istenmeden iki departman
 * penceresine mesaj gitti). Kilit artık OPS'un kararına değil Recep'in yazdığı söze bağlı: pencere yasağı bildiren
 * ifadeler (liste: scripts/board/pencere-kilidi.cjs YASAK_IFADELERI) kilidi KENDİLİĞİNDEN koyar, yasağı kaldıran
 * ifadeler (SERBEST_IFADELERI) kaldırır. Recep'e hiçbir kutu ya da soru çıkmaz; yanlış yakalama yalnız OPS'u durdurur
 * (Recep'i değil).
 *
 * KAPSAM: yalnız OPS penceresi (agent ops-pencere). Diğer pencerelerde sessiz.
 *
 * NE YAPAR (sırayla):
 *  1) İstemdeki departman mesajlarının göndericilerini kaydeder (cross-session-message from-name/from-session):
 *     o departmana OPS 30 dakika boyunca kilitten bağımsız CEVAP verebilir (karar işlevi okur).
 *  2) Recep'in KENDİ yazdığı metni ayırır (sistem/araç/kanca enjeksiyonları ve departman mesajları sayılmaz) ve söze bakar.
 *     Yasak sözü varsa ve kilit YOKSA: izinlisiz kilit yazar (herkes kapalı, yalnız OPS ve cevaplar) ve OPS'a
 *     "KİLİT AÇILDI: <ifade>" bilgisi döner. Kilit zaten varsa dokunmaz (OPS'un daha ayrıntılı izni korunur).
 *     Serbest sözü varsa ve kilit VARSA: siler, "KİLİT KALDIRILDI" bilgisi döner.
 *
 * FAIL-OPEN: her hatada sessiz (çıkış 0). stdin: { prompt, cwd, session_id, agent_type }.
 */

const fs = require('fs')
const path = require('path')

function yaz(metin) {
  try {
    fs.writeSync(1, JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: metin } }) + '\n')
  } catch {
    /* stdout kapalı */
  }
}

function calistir() {
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  if (!girdi || typeof girdi.prompt !== 'string' || !girdi.prompt) return
  const pk = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'pencere-kimligi.cjs'))
  const kilit = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'pencere-kilidi.cjs'))
  const rol = pk.rolAdi(pk.agentAdi({ cwd: girdi.cwd, agentType: girdi.agent_type }))
  if (rol !== 'OPS') return

  kilit.gelenKaydet(kilit.gelenMesajlar(girdi.prompt))

  const soz = kilit.recepSozu(girdi.prompt)
  if (!soz.tip) return
  const var_ = kilit.kilitOku()
  if (soz.tip === 'koy') {
    if (var_.durum === 'var') return
    kilit.kilitYaz({ roller: [], kartlar: [], koyan: 'recep-sozu', ifade: soz.ifade })
    yaz(
      `KİLİT AÇILDI: Recep'in sözü "${soz.ifade}" pencere yasağı sayıldı. Departman pencerelerine mesaj ŞİMDİ GİTMEZ; yalnız sana yazan departmana ` +
        '30 dakika cevap verebilirsin. İş varsa kartı yaz, Recep dönünce cevabında söyle. Yanlış yakalandıysa Recep "devam"/"başlat" yazınca kalkar.',
    )
    return
  }
  if (soz.tip === 'kaldir' && var_.durum !== 'yok') {
    kilit.kilitKaldir()
    yaz(`KİLİT KALDIRILDI: Recep'in sözü "${soz.ifade}". Departman pencerelerine mesaj yeniden serbest.`)
  }
}

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open
  }
  process.exit(0)
}

module.exports = { calistir }
