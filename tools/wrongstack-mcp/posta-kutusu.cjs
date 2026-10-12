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

/**
 * ⭐KANONİK KÖK (2026-09-21, ÖLÇÜLDÜ): WrongStack proje deposunu kök yolunun KARMASINDAN türetir
 * ve karma sürücü harfinin büyük/küçüğüne DUYARLI. `c:\Users\…` → `venthub-hvac-7e017f`,
 * `C:\Users\…` → `venthub-hvac-1088d5`: AYNI proje İKİ AYRI KUTU. Pencereler (VSCode) küçük `c:`
 * ile açılıyor; terminalden başlatılan süreç büyük `C:` ile açılıp öbür kutuya yazdı ve pencere
 * o mesajı hiç görmedi. Sürücü harfi burada KÜÇÜĞE sabitlenir (kanonik = 7e017f, pencerelerin
 * zaten kullandığı).
 *
 * ⚠WORKTREE: sunucu worktree kökünü git üzerinden ANA AĞACA çeviriyor ve git yolu BÜYÜK `C:` ile
 * veriyor (ölçüldü: `c:\tmp\vh-altyapi-kip` → `C:\Users\…` → 1088d5). O yüzden ana ağaç burada,
 * sunucudan ÖNCE çözülür (`git rev-parse --git-common-dir` → üst dizin), sonra harf küçültülür.
 * git yoksa/başarısızsa verilen yol kullanılır.
 */
function kanonikKok(p) {
  let kok = path.resolve(p)
  try {
    const ortak = require('node:child_process')
      .execFileSync('git', ['-C', kok, 'rev-parse', '--path-format=absolute', '--git-common-dir'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      .trim()
    if (ortak && path.basename(ortak) === '.git') kok = path.dirname(path.resolve(ortak))
  } catch {
    // git yok ya da depo değil — verilen yol kalır
  }
  return kok.replace(/^([A-Za-z]):/, (_, h) => h.toLowerCase() + ':')
}

/**
 * ⭐WORKTREE'DE PAKET YOLU (ARC-98, 2026-10-12, OPS ölçümü): `node_modules` izlenmez, her worktree'de YOKTUR;
 * relative yolla açılan sunucu worktree'de "Cannot find module" ile ölüp "Connection closed" veriyordu. Paket
 * yerelde yoksa ANA AĞACIN kurulumu kullanılır (kanonik kök: worktree → ana ağaç). Yerel kurulum varsa o kazanır.
 * Bulunamazsa yerel yol döner (sunucu kendi hatasını verir; sessiz başka yola düşülmez).
 */
function paketCli(paket, kokDizin = __dirname) {
  const yerel = path.join(kokDizin, 'node_modules', '@wrongstack', paket, 'dist', 'cli.js')
  if (fs.existsSync(yerel)) return yerel
  try {
    const ana = kanonikKok(path.resolve(kokDizin, '..', '..'))
    const aday = path.join(ana, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', paket, 'dist', 'cli.js')
    if (fs.existsSync(aday)) return aday
  } catch {
    // ana ağaç çözülemedi — yerel yol kalır
  }
  return yerel
}

/** `<...>/@wrongstack/<paket>/dist/cli.js` yolundan paketin package.json sürümü; okunamazsa null. */
function paketSurumu(cli) {
  try {
    const v = JSON.parse(fs.readFileSync(path.join(path.dirname(path.dirname(cli)), 'package.json'), 'utf8')).version
    return typeof v === 'string' && v ? v : null
  } catch {
    return null
  }
}

/**
 * ⭐SÜRÜM KAPISI (ARC-103, 2026-10-12, ÖLÇÜLDÜ 13:07 kazası): sunucu `--project-root`u git üzerinden ANA AĞACA
 * çevirir; worktree'nin KENDİ node_modules paketi (yerel kurulum KAZANIR, paketCli) CANLI kökü açar. O paket ana
 * ağaçta kurulu sürümden yeniyse canlı sage.db şeması yerinde göç eder (34 → 47 nesne, geri alınamaz) ve yeni
 * sürüm daemon'u doğar; eskiyse canlı daemon ile sürüm bölünür (connection.status() null, hook sessiz kalır).
 * Kural: çalıştırılacak paket dosyası ana ağaçtakiyle AYNI dosya ise geçer; farklı dosya ise iki sürüm okunur ve
 * YALNIZ eşitse geçer. Sürüm okunamazsa RET (fail-closed): "bakamadım" "aynı" demek değildir.
 * Git yoksa ya da depo değilse kanonikKok verilen yolu döndürür; çalıştırılacak dosya kendisiyle karşılaştırılır ve
 * geçer (worktree kavramı da yoktur, sunucu da kökü başka ağaca çeviremez).
 * @returns {{tamam: boolean, sebep?: string, calisan?: string|null, ana?: string|null}}
 */
function surumKapisi(cli, kokDizin = __dirname) {
  const paket = path.basename(path.dirname(path.dirname(cli)))
  let anaCli
  try {
    const anaKok = kanonikKok(path.resolve(kokDizin, '..', '..'))
    anaCli = path.join(anaKok, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', paket, 'dist', 'cli.js')
  } catch {
    return { tamam: false, sebep: 'ana agac cozulemedi (' + paket + ')', calisan: paketSurumu(cli), ana: null }
  }
  if (path.resolve(cli).toLowerCase() === path.resolve(anaCli).toLowerCase()) return { tamam: true }
  const calisan = paketSurumu(cli)
  const ana = paketSurumu(anaCli)
  if (!calisan) return { tamam: false, sebep: 'calisacak paketin surumu okunamadi (' + paket + ')', calisan, ana }
  if (!ana) {
    return { tamam: false, sebep: 'ana agactaki ' + paket + ' kurulumunun surumu okunamadi (kurulu degil ya da bozuk)', calisan, ana }
  }
  if (calisan !== ana) {
    return { tamam: false, sebep: paket + ' surumu ana agactakiyle ayni degil: bu agac ' + calisan + ', ana agac ' + ana, calisan, ana }
  }
  return { tamam: true }
}

/** Kapı reddettiğinde stderr'e yazılan, ne yapılacağını söyleyen tek metin. */
function surumKapisiMetni(onek, k) {
  return (
    onek +
    ': SURUM KAPISI RET — ' +
    k.sebep +
    '. Sunucu ACILMADI (canli koku farkli surumle acmak sage.db semasini yerinde goc ettirir, geri alinamaz). ' +
    'Cozum: bu agacin tools/wrongstack-mcp/node_modules dizinini sil (yerel kurulum yoksa ana agacinki kullanilir; ' +
    'junction ise yalniz baglantiyi kaldir: cmd //c rmdir <yol>, /s YOK) ya da ana agactakiyle ayni surumu kur.\n'
  )
}

/** argv içindeki `--project-root <yol>` değerini kanonik köke çevirir. */
function kokuKanonikle(args) {
  const out = [...args]
  const i = out.indexOf('--project-root')
  if (i >= 0 && out[i + 1] !== undefined) out[i + 1] = kanonikKok(out[i + 1])
  return out
}

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
  const cli = paketCli('mailbox-mcp')
  const kapi = surumKapisi(cli)
  if (!kapi.tamam) {
    process.stderr.write(surumKapisiMetni('posta-kutusu', kapi))
    process.exit(1)
  }
  process.argv = [
    process.argv[0],
    cli,
    ...kokuKanonikle(process.argv.slice(2)),
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

module.exports = { kimlikBul, kanonikKok, kokuKanonikle, paketCli, paketSurumu, surumKapisi, surumKapisiMetni }
