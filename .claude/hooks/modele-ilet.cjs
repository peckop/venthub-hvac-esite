'use strict'

/**
 * modele-ilet — kancanın stderr uyarısını MODELE de ulaştırır.
 *
 * NİÇİN VAR (prompt denetimi 2026-09-25, bulgu B): Claude Code, çıkış kodu 0 olan bir
 * kancanın stderr'ini modele GÖSTERMEZ; yalnız ayrıntılı oturum kaydına düşer. PreToolUse ve
 * PostToolUse'da modele giden kanal stdout'taki JSON'dur:
 *   { hookSpecificOutput: { hookEventName, additionalContext } }
 * `hafiza-indeks-bekcisi` ve `bash-write-audit` uyarılarını stderr + çıkış 0 ile basıyordu;
 * yani "uyarıyoruz" sandığımız her şey kimseye ulaşmıyordu. Uyarı-only kapı, uyarısını
 * okuyan olmayınca hiç yoktur.
 *
 * NASIL: stderr'e yazılanı aynen geçirir (testler ve oturum kaydı onu okuyor) ve bir kopyasını
 * toplar. Süreç 0 ile biterse topladığını additionalContext olarak stdout'a yazar. Çıkış 2
 * olursa DOKUNMAZ: o yolda Claude Code stderr'i zaten modele verir, iki kez gitmesin.
 *
 * ⚠Çıkış anında `fs.writeSync(1, …)`: `process.on('exit')` içinde akış yazımı Windows
 * borusunda eşzamansızdır ve süreç ölmeden boşalmayabilir.
 *
 * @param {'PreToolUse'|'PostToolUse'} olay kancanın bağlı olduğu olay
 */
function stderrModeleIlet(olay) {
  const fs = require('fs')
  const toplanan = []
  const asil = process.stderr.write.bind(process.stderr)
  process.stderr.write = (parca, ...kalan) => {
    try {
      toplanan.push(Buffer.isBuffer(parca) ? parca.toString('utf8') : String(parca))
    } catch {
      /* kopya alınamadı: asıl yazım yine yapılır */
    }
    return asil(parca, ...kalan)
  }
  process.on('exit', (kod) => {
    if (kod !== 0) return
    const metin = toplanan.join('').trim()
    if (!metin) return
    try {
      fs.writeSync(
        1,
        JSON.stringify({ hookSpecificOutput: { hookEventName: olay, additionalContext: metin } }),
      )
    } catch {
      /* stdout kapalı: stderr kopyası kayıtta duruyor */
    }
  })
}

module.exports = { stderrModeleIlet }
