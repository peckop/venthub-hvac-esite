#!/usr/bin/env node
'use strict'

/**
 * PreToolUse hook — BASH YAZMA KAPISI (lane-guard + protect-config Katman A'nın Bash karşılığı).
 *
 * NİÇİN VAR: `lane-guard.cjs` ve `protect-config.cjs` yalnızca `Edit|Write|MultiEdit`'e bağlıydı
 * ve `tool_input.file_path` okuyordu. Bash ile yazılan dosya hiçbir kapıdan geçmiyordu; üstelik
 * "auto mode" talimatı herkese Bash'i dayatıyor. 2026-08-23'te ölçüldü: o gün EDGE'in depoda
 * yazdığı YEDİ dosyanın hiçbiri Edit/Write ile yazılmadı — yani kapı o şerit için SIFIR kez koştu.
 *
 * ⚠ MATCHER'A "Bash" EKLEMEK TEK BAŞINA HİÇBİR ŞEY YAPMAZ: Bash yükünde `file_path` alanı yoktur,
 * eski kancalar sessizce `exit 0` döner ve kapı KURULMUŞ SANILIR. Bu dosya o yüzden ayrı yazıldı.
 *
 * FAIL-OPEN mu FAIL-CLOSED mu — İKİSİ DE, ve ayrımı bilinçli:
 *   · Pano/modül okunamazsa FAIL-OPEN (lane-guard ile aynı gerekçe: koordinasyon kapısı fail-closed
 *     olursa yedi oturumu birden durdurur — kendi kendine kesinti).
 *   · Komutta yazma KALIBI görülüp hedef ÇIKARILAMAZSA FAIL-CLOSED (tahmin etmeyiz).
 *
 * KATMAN B (yasak içerik taraması) BİLEREK ALINMADI: kabuk metni üzerinden içerik taraması,
 * bir kalıbı EKLEMEKLE SİLMEYİ ayırt edemez — `sed -i 's/as any//' x.ts` meşru bir temizliktir
 * ama tarama onu ihlal sanar. Yanlış pozitif burada yedi şeridi birden durdurur; o yüzden Katman B
 * Edit/Write yolunda kalıyor. Sınırı yazıyorum çünkü "protect-config'i de Bash'e bağladım" cümlesi,
 * vermediği bir güvenceyi verdiğini sandırır.
 *
 * stdin: { session_id, tool_name: 'Bash', tool_input: { command }, cwd? }
 * Çıkış: exit 2 = blokla · exit 0 = izin ver.
 */

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

function stdinOku() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

let girdi = {}
try {
  girdi = JSON.parse(stdinOku() || '{}')
} catch {
  process.exit(0)
}

const komut = (girdi.tool_input && girdi.tool_input.command) || ''
const sid = girdi.session_id || ''
if (!komut || !sid) process.exit(0)

/**
 * ⭐İKİNCİ SINIF: SIR DEĞERİNİ EKRANA BASAN KALIP (2026-09-04, ALTYAPI olayı).
 *
 * NİÇİN BU DOSYADA, yeni bir kanca DEĞİL: yeni kanca kaydetmek `.claude/settings.json`
 * düzenlemek demektir, yani CONFIG — ve config'e ajan eli değmez (bu kararı bugün bir
 * kez daha uyguladım: Recep'in `enabledPlugins` satırına dokunmadım). Bash komutlarını
 * gören TEK kayıtlı kanca bu; `sensitive-path-guard` yalnız Edit/Write/MultiEdit
 * matcher'ında ve `file_path` okuyor, komutu hiç görmüyor. Dosyanın adı bu yüzden
 * TARİHSELDİR: artık iki sınıfı birden bekliyor.
 *
 * Kalıp mantığı ayrı modülde (`sir-basan-kalip.cjs`) — saf fonksiyon, konformans
 * kolundan doğrudan ölçülebilsin ve mantık iki yerde iki kopya olmasın (§26).
 */
try {
  const { sirBasanKaliplar } = require(path.join(__dirname, 'sir-basan-kalip.cjs'))
  const bulgular = sirBasanKaliplar(komut)
  if (bulgular.length > 0) {
    const satirlar = bulgular.map((b) => `  • ${b.ad}: ${b.kalip}\n    ${b.neden}`).join('\n')
    process.stderr.write(
      '[bash-write-guard] SIR DEGERI EKRANA BASILIYOR — reddedildi:\n' +
        satirlar +
        '\n  NICIN: 2026-09-04\'te bu kalip prod DB baglanti dizesini (parola dahil) oturum\n' +
        '  ciktisina ve transkripte dusurdu. Olcum yaparken DEGERI degil OLGUYU bas.\n'
    )
    process.exit(2)
  }
} catch (e) {
  // Kalip modulu yuklenemezse kanca YAZMA kontrolunu bloklamamali (fail-open) — ama
  // SESSIZ de kalmaz: olcememek gecmek degildir, sebep gorunur.
  process.stderr.write('[bash-write-guard] sir-kalip modulu yuklenemedi (fail-open): ' + (e && e.message) + '\n')
}

let cikarici
try {
  cikarici = require(path.join(__dirname, 'bash-write-targets.cjs'))
} catch (e) {
  process.stderr.write('[bash-write-guard] cikarici yuklenemedi (fail-open): ' + (e && e.message) + '\n')
  process.exit(0)
}

const sonuc = cikarici.yazmaHedefleri(komut)
if (!sonuc.yazmaVar) process.exit(0)

const kok = path.resolve(girdi.cwd || process.cwd())

/**
 * Depo KÖKÜ DIŞINDAKİ yazımlar bu kapının konusu değil — ve bu kritik: pano yazımı
 * (C:/tmp/venthub-board), scratchpad ve /dev/null hep Bash üzerinden gider. Bunları bloklamak
 * PANOYU ÖLDÜRÜR ve filo birbirini duymaz hâle gelir.
 */
function depoIcindeMi(hedef) {
  const mutlak = path.isAbsolute(hedef) ? path.resolve(hedef) : path.resolve(kok, hedef)
  const bagil = path.relative(kok, mutlak)
  return bagil && !bagil.startsWith('..') && !path.isAbsolute(bagil) ? mutlak : null
}

const depoHedefleri = sonuc.hedefler.map(depoIcindeMi).filter(Boolean)

// ---- FAIL-CLOSED kolu: yazma var, hedef çözülemedi.
if (sonuc.cozulemeyen.length) {
  process.stderr.write(
    '[bash-write-guard] Bash komutunda YAZMA var ama HEDEF ÇIKARILAMADI — reddedildi.\n' +
      '  sebep: ' + [...new Set(sonuc.sebepler)].join(', ') + '\n' +
      '  Tahmin etmiyoruz: hedefi bilmeden şerit kapısından geçiremeyiz.\n' +
      '  YAPILACAK: dosyayı Edit/Write ile yaz (kapı oradan geçer), ya da komutu hedefi\n' +
      '  GÖRÜNÜR kılacak biçimde yaz (ör. heredoc yerine tek bir dosya yolu veren yönlendirme).\n' +
      '  Kendi claim\'indeki bir dosya için bu seni gereksiz durduruyorsa panoya yaz — kapıyı\n' +
      '  Bash ile aşma, ölçüp düzeltelim.\n',
  )
  process.exit(2)
}

if (!depoHedefleri.length) process.exit(0)

// ---- protect-config KATMAN A karşılığı: lint/TS zorlayan config dosyaları.
const KORUNAN = new Set(['eslint.config.cjs', '.lintstagedrc.json'])
for (const hedef of depoHedefleri) {
  const ad = path.basename(hedef).toLowerCase()
  const bagilYol = path.relative(kok, hedef).replace(/\\/g, '/').toLowerCase()
  if (KORUNAN.has(ad) || /(^|\/)tsconfig(\.[\w.-]+)?\.json$/.test(bagilYol)) {
    process.stderr.write(
      '[bash-write-guard] "' + path.basename(hedef) + '" Bash ile yazımı BLOKLANDI.\n' +
        '  Bu dosya VentHub kalite kurallarını zorluyor (DI, arbitrary-Tailwind, no-console, strict TS).\n' +
        '  Kuralı sağlamak için CONFIG\'i değil KODU düzelt.\n',
    )
    process.exit(2)
  }
}

/**
 * GERI ALMA MUAFIYETI — 2026-08-28, "duzeltme yolu kapali alarm" sinifi.
 *
 * ⭐NICIN VAR, OLCULDU: bash-write-audit dogru bir dikis-yeri alarmi verdi ve cozumunu de
 * yazdi ("geri al: git checkout -- <yol>"); geri almaya kalkinca BU KAPI bloklad. Bir kapinin
 * ONERDIGI duzeltmeyi oteki kapi YASAKLIYORDU. Sebep: guard "yazma"yi gorur, NIYETI gormez —
 * geri alma da bir yazmadir. Duzeltme yolu kapali bir alarm, alarm olmaktan cikar.
 *
 * MUAFIYET DAR VE IKI SARTLI (filo tasarim karari, tek basima genisletilmez):
 *   1. Komutun TUM hedefleri geri-alma sebepli olacak. Karisik komut (checkout + baska yazma)
 *      muafiyet ALMAZ — tek bir yabanci yazma butun komutu kapatir.
 *   2. Agac IZOLE WORKTREE olacak. ANA DEPODA muafiyet YOKTUR: orada checkout baskasinin
 *      COMMITSIZ ara isini SESSIZCE siler (bu depo o dersi 2026-08-20 de yasadi).
 *
 * `git restore --staged` KAPSAM DISI: o calisma kopyasini degil INDEXI degistirir; HEAD e
 * dondurme degil, ayri bir is. Cikarici onu ayri sebep olarak isaretler.
 */
const GERI_ALMA_SEBEPLERI = new Set(['git checkout --', 'git restore'])

/**
 * Ana depo mu, izole worktree mi.
 *
 * ⚠OLCULDU VE HIPOTEZ CURUDU: `--git-common-dir` ANA DEPODA GORELI (".git") doner, git-dir
 * ise mutlaktir. Duz karsilastirma "worktree" der ve muafiyeti TAM YASAK OLDUGU YERDE acardi.
 * Iki taraf da toplevel e gore mutlaklastirilir.
 */
function anaDepoMu(kokDizin) {
  try {
    const g = (a) => execFileSync('git', ['-C', kokDizin, ...a], { encoding: 'utf8', timeout: 5000 }).trim()
    const gitDir = path.resolve(g(['rev-parse', '--absolute-git-dir']))
    const ortak = path.resolve(g(['rev-parse', '--show-toplevel']), g(['rev-parse', '--git-common-dir']))
    return gitDir === ortak
  } catch {
    // Olculemezse ANA VARSAY: muafiyet FAIL-CLOSED tir. Kapinin kendisi fail-open olabilir,
    // ama bir MUAFIYET olculemedigi icin acilmaz — aksi hâlde olcum hatasi kapiyi delerdi.
    return true
  }
}

const geriAlmaKomutu =
  sonuc.sebepler.length > 0 && sonuc.sebepler.every((s) => GERI_ALMA_SEBEPLERI.has(s))
const geriAlmaMuafiyeti = geriAlmaKomutu && !anaDepoMu(kok)

// ---- lane-guard karşılığı: başka şeridin canlı claim'i.
let pano
try {
  pano = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
} catch (e) {
  process.stderr.write('[bash-write-guard] pano yuklenemedi (fail-open): ' + (e && e.message) + '\n')
  process.exit(0)
}

try {
  // Yazma anı, "bu oturum yaşıyor"un en doğrudan kanıtıdır (lane-guard ile aynı gerekçe).
  pano.touch(sid)
} catch {
  /* atış başarısızsa yazmayı durdurmayız */
}

for (const hedef of depoHedefleri) {
  let catisma = null
  try {
    catisma = pano.findConflict(hedef, sid, kok)
  } catch (e) {
    process.stderr.write('[bash-write-guard] pano okunamadi (fail-open): ' + (e && e.message) + '\n')
    process.exit(0)
  }
  if (!catisma) continue

  // GERI ALMA MUAFIYETI: izole agacta HEAD e dondurme. SESSIZ DEGIL — izin verildigi
  // acikca soylenir, cunku sessiz muafiyet ile kapinin hic kosmamasi ayni gorunur.
  if (geriAlmaMuafiyeti) {
    console.error(
      '[bash-write-guard] GERI ALMA MUAFIYETI — "' + catisma.rel + '" ' + catisma.claim.lane +
        ' seridinde, ama komut yalnizca HEAD e dondurme yapiyor (' +
        [...new Set(sonuc.sebepler)].join(', ') +
        ') ve bu agac izole bir worktree. Icerik URETILMIYOR: dosya sahibinin commitli haline doner.',
    )
    console.error('  Ana depoda bu muafiyet YOKTUR — orada commitsiz ara is sessizce silinebilir.')
    continue
  }

  const { claim, glob, rel } = catisma
  process.stderr.write(
    '[bash-write-guard] "' + rel + '" BAŞKA bir oturumun şeridinde — Bash ile yazma bloklandı.\n' +
      '  Şerit: ' + claim.lane + ' · oturum ' + String(claim.sid).slice(0, 8) + ' · kural: ' + glob + '\n' +
      '  Bu kapı 2026-08-23\'te eklendi: o güne kadar Bash ile yazmak şerit kapısını TAMAMEN atlıyordu.\n' +
      '  Yapılacaklar: (a) şerit sahibine not bırak —\n' +
      '      node scripts/board/board.cjs note --sid <senin-sid> --to ' + claim.lane + ' --text "…"\n' +
      '  (b) sahip bayatsa Recep\'e sor. Yeniden claim etmek SENİ AÇMAZ: "en erken kazanır".\n',
  )
  process.exit(2)
}

process.exit(0)
