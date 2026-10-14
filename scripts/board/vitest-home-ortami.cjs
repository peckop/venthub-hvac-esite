'use strict'

/**
 * vitest için YALITILMIŞ HOME (ARC-129).
 *
 * NİÇİN: testler `os.homedir()` üzerinden gerçek `~/.claude` altına yazabiliyor. İki kez oldu:
 * 13 Ekim'de kanca testi gerçek `venthub-sid` dosyasını ezdi (ARC-124), 14 Ekim'de `yeni-duzen-kimlik`
 * testi gerçek `~/.claude/mod-durum/ops-oturumu.json` içine sahte kimlik yazdı ve kokpit OPS'u tanımadı.
 * Her testte tek tek `VH_*` ortam değişkeni vermek unutulabilir; koruma testin hatırlamasına bağlı olmamalı.
 *
 * NASIL: `hazirla()` koşum başına BENZERSİZ bir geçici dizin açar ve `HOME` + `USERPROFILE`'ı oraya
 * yönlendirir (Windows'ta `os.homedir()` önce `USERPROFILE`'a, POSIX'te `HOME`'a bakar). globalSetup ana
 * süreçte koşar; worker'lar ve onların spawn ettiği kanca/betik süreçleri bu ortamı miras alır. CI'da
 * zaten gerçek bir `~/.claude` yoktur: yerel koşum artık CI ile aynı koşulda koşar (yerelde kazara
 * geçip CI'da kırılan test sınıfı da kapanır, bkz. 13 Ekim "gerçek oturum sid'iyle test").
 *
 * GERÇEK HOME: `VENTHUB_GERCEK_HOME` olarak saklanır; yalnız "gerçek dosyaya dokunulmadı" ölçen testler okur.
 * KAPATMA: `VENTHUB_HOME_YALITIMI_KAPALI=1` (gerçek HOME'u bilerek gerektiren elle koşum). Ortam zaten
 * yalıtılmışsa (iç içe vitest) yeniden yalıtılmaz.
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const DIZIN_ON_EKI = 'vitest-home-'

function hazirla(env = process.env, tmp = os.tmpdir(), gercek = os.homedir()) {
  if (env.VENTHUB_HOME_YALITIMI_KAPALI === '1' || env.VENTHUB_HOME_YALITIMI_DIZINI) {
    return { home: env.VENTHUB_HOME_YALITIMI_DIZINI || null, sahip: false, temizle() {} }
  }
  const dizin = fs.mkdtempSync(path.join(tmp, DIZIN_ON_EKI))
  if (!env.VENTHUB_GERCEK_HOME) env.VENTHUB_GERCEK_HOME = gercek
  env.VENTHUB_HOME_YALITIMI_DIZINI = dizin
  env.HOME = dizin
  env.USERPROFILE = dizin
  return {
    home: dizin,
    sahip: true,
    temizle() {
      // Silinemezse (başka süreç tutuyor, zaten yok) sessiz geçilir: temizlik testi düşürmemeli.
      try {
        fs.rmSync(dizin, { recursive: true, force: true })
      } catch {
        /* en iyi çaba */
      }
    },
  }
}

module.exports = { hazirla, DIZIN_ON_EKI }
