#!/usr/bin/env node
'use strict'

/**
 * scripts/board/kimlik.cjs — E1-v2: "bu commit'i HANGİ oturum yapıyor" sorusunun TEK cevabı.
 *
 * ⭐NİÇİN AYRI MODÜL — ölçülmüş bir körlüğü kapatıyor (2026-08-28, ALTYAPI kendi ağacında yaşadı):
 * E1 kapısı kimliği `<git-dir>/venthub-sid` dosyasından okuyordu. O dosyayı SessionStart kancası
 * yazar — ama oturumun AÇILDIĞI ağaca, ÇALIŞTIĞI ağaca değil. Bir oturum ana dizinde açılıp işi
 * bir worktree'de yaparsa, o worktree'deki kimlik orada en son oturum açanın sid'i olarak KALIR.
 * Sonuç: kapı yanlış oturum adına karar verir.
 *
 * Vaka: `vh-altyapi-851` ağacında dosya VARDI ve `dc2b0b90` (ölü oturum) yazıyordu. Kapı ALTYAPI'yı
 * "başka şerit" sanıp KENDİ claim'indeki dosyada bloklad. Eski dedektör bu hâli GÖRMEZ: yalnız
 * "dosya YOK" hâlini arıyordu. İki hâl aynı arızayı doğurur, biri sessizdi.
 *
 * ⭐YÖN ÖNEMLİ: benim vakamda hata güvenli yöne düştü (kendi işimi bloklad). Ters yön SESSİZDİR:
 * bayat sid CANLI bir şeride aitse, o ağaçta çalışan kişi ONUN yetkisiyle yazar ve kapı susar.
 * Bu yüzden düzeltme "daha çok blok" değil, DOĞRU KİMLİK + görünür uyarıdır.
 *
 * KANIT SIRALAMASI (kesinden zayıfa):
 *   1. `CLAUDE_CODE_SESSION_ID` env — commit'i TETİKLEYEN sürecin kendi kimliği. Dosya bir
 *      VEKİL kanıttır; bu ASIL kanıttır. Ölçüldü: Claude Code kabuğunda dolu.
 *   2. `<git-dir>/venthub-sid` — elle/terminalden `git commit` için tek kaynak (env yok).
 *
 * ⭐ÖLÇEMEDİĞİM ŞEY, AÇIKÇA: "dosyadaki sid ŞU AN CANLI MI" sorusunu bu kapı cevaplayamıyor.
 * Denedim ve gösterge AYIRT ETMEDİ: 2026-08-28 07:10'da canlı dört şeridin heartbeat yaşı 51 dk,
 * KAPALI TEMIZLIK oturumunun da 51 dk'ydı. Ayırt etmeyen gösterge ölçüm değildir, o yüzden
 * canlılık iddiası KURULMADI. Ayırt edebildiğim tek şey daha zayıf ama gerçek: sid panoda HİÇ
 * görülmüş mü (bayat `dc2b0b90` hiç görülmemişti).
 */

const fs = require('fs')
const path = require('path')

/** Env'den asıl kimlik. Boş/bozuk değer YOK sayılır — yarım kimlik en kötü kimliktir. */
function envSid() {
  const v = String(process.env.CLAUDE_CODE_SESSION_ID || '').trim()
  return /^[0-9a-fA-F-]{8,}$/.test(v) ? v : ''
}

/** Dosyadan vekil kimlik. */
function dosyaSid(gitDir) {
  try {
    const p = path.join(gitDir, 'venthub-sid')
    if (!fs.existsSync(p)) return ''
    return fs.readFileSync(p, 'utf8').trim()
  } catch {
    return ''
  }
}

/**
 * Kimliği çöz ve NE BULDUĞUNU söyle.
 *
 * @returns {{sid:string, kaynak:'env'|'dosya'|'yok', celisme:boolean, dosyadaki:string,
 *            bilinmeyen:boolean, uyarilar:string[]}}
 */
function coz(gitDir, board) {
  const env = envSid()
  const dosya = dosyaSid(gitDir)
  const uyarilar = []

  const celisme = Boolean(env && dosya && env !== dosya)
  if (celisme) {
    uyarilar.push(
      'BAYAT KIMLIK: bu agacin venthub-sid dosyasi ' + dosya.slice(0, 8) + ' diyor, ' +
        'commit i yapan oturum ise ' + env.slice(0, 8) + '. Dosya bir VEKIL kanittir, oturumun ' +
        'kendi kimligi ASIL kanittir — ASIL kullanildi.',
    )
    uyarilar.push(
      '  SEBEP: kimligi SessionStart kancasi oturumun ACILDIGI agaca yazar; bu agacta en son ' +
        'baska bir oturum acilmis. Agac DEVREDILDIYSE (kapanan bir seridin isi) bu beklenen haldir.',
    )
  }

  const sid = env || dosya
  let bilinmeyen = false
  if (!env && dosya && board) {
    // Env yok (elle commit): dosyadaki sid panoda hiç görüldü mü? Bu CANLILIK değil, TANINIRLIK.
    try {
      const tanidik = new Set(board.knownSids(board.readEvents()))
      if (!tanidik.has(dosya)) {
        bilinmeyen = true
        uyarilar.push(
          'TANINMAYAN KIMLIK: ' + dosya.slice(0, 8) + ' panoda HIC gorulmemis. Serit kontrolu bu ' +
            'kimlik adina karar VEREMEZ — kapi fail-open gecer. (Canlilik olculemedi: heartbeat ' +
            'yasi canliyi oluden ayirt etmiyor, 2026-08-28 olcumu.)',
        )
      }
    } catch {
      /* pano okunamadı → tanınırlık ölçülemedi, iddia kurulmaz */
    }
  }

  return { sid, kaynak: env ? 'env' : dosya ? 'dosya' : 'yok', celisme, dosyadaki: dosya, bilinmeyen, uyarilar }
}

/**
 * Bayat dosyayı ASIL kimlikle onar. Yan etki GİZLİ DEĞİLDİR: çağıran uyarıyı basar.
 * Onarım başarısızsa sessiz kalır — kapının işi commit'i geçirmek/durdurmak, dosya yazmak değil.
 */
function onar(gitDir, sid) {
  try {
    fs.writeFileSync(path.join(gitDir, 'venthub-sid'), sid + '\n', 'utf8')
    return true
  } catch {
    return false
  }
}

module.exports = { coz, onar, envSid, dosyaSid }
