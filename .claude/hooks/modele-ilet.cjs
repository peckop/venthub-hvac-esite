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
 * ⭐OTURUM BAŞINA BİR KEZ (2026-09-25, aynı gün ölçülen yan etki): ilk sürüm her çağrıda
 * iletiyordu; `bash-write-audit`'in "KIMLIK YOK" bilgi satırı böylece HER Bash çağrısında
 * modele gitti (iki pencerede gözlendi). Her turda tekrar eden metin, denetimin uyardığı
 * sınıfın ta kendisi: üç turda görmezden gelinir. Bu yüzden aynı metin aynı oturumda bir kez
 * iletilir; metin değişirse (yeni dosya, yeni sayı) yeniden iletilir. stderr kopyası her
 * seferinde yazılmaya devam eder. Oturum kimliği bilinmiyorsa tekilleştirme yapılmaz.
 * Önbellek: `VENTHUB_MODELE_ILET_DIR` ya da işletim sisteminin geçici dizini; yazılamazsa
 * ileti yine gider (fail-open: tekrar, sessizlikten iyidir).
 *
 * ⚠Çıkış anında `fs.writeSync(1, …)`: `process.on('exit')` içinde akış yazımı Windows
 * borusunda eşzamansızdır ve süreç ölmeden boşalmayabilir.
 *
 * @param {'PreToolUse'|'PostToolUse'} olay kancanın bağlı olduğu olay
 * @returns {{ oturum: (sid: string) => void }} kanca stdin'i okuyunca oturum kimliğini bildirir
 */
function stderrModeleIlet(olay) {
  const fs = require('fs')
  const os = require('os')
  const path = require('path')
  const crypto = require('crypto')
  const toplanan = []
  let sid = ''
  const asil = process.stderr.write.bind(process.stderr)
  process.stderr.write = (parca, ...kalan) => {
    try {
      toplanan.push(Buffer.isBuffer(parca) ? parca.toString('utf8') : String(parca))
    } catch {
      /* kopya alınamadı: asıl yazım yine yapılır */
    }
    return asil(parca, ...kalan)
  }

  /** Bu metin bu oturumda daha önce iletildiyse true; değilse kaydeder ve false döner. */
  const dahaOnceIletildi = (metin) => {
    if (!/^[0-9a-f-]{8,64}$/i.test(sid)) return false
    try {
      const dizin = process.env.VENTHUB_MODELE_ILET_DIR || path.join(os.tmpdir(), 'venthub-modele-ilet')
      fs.mkdirSync(dizin, { recursive: true })
      const dosya = path.join(dizin, sid + '.json')
      let gorulen = []
      try {
        gorulen = JSON.parse(fs.readFileSync(dosya, 'utf8'))
      } catch {
        gorulen = []
      }
      const ozet = crypto.createHash('sha256').update(olay + '\n' + metin).digest('hex').slice(0, 16)
      if (Array.isArray(gorulen) && gorulen.includes(ozet)) return true
      gorulen = (Array.isArray(gorulen) ? gorulen : []).concat(ozet).slice(-200)
      fs.writeFileSync(dosya, JSON.stringify(gorulen))
      return false
    } catch {
      return false
    }
  }

  process.on('exit', (kod) => {
    if (kod !== 0) return
    const metin = toplanan.join('').trim()
    if (!metin) return
    if (dahaOnceIletildi(metin)) return
    try {
      fs.writeSync(
        1,
        JSON.stringify({ hookSpecificOutput: { hookEventName: olay, additionalContext: metin } }),
      )
    } catch {
      /* stdout kapalı: stderr kopyası kayıtta duruyor */
    }
  })

  return {
    oturum(s) {
      sid = String(s || '')
    },
  }
}

module.exports = { stderrModeleIlet }
