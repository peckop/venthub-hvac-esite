#!/usr/bin/env node
'use strict'

/**
 * KANCA — oturum kapanırken çapalı hafızanın yedeğini kendiliğinden alır (REC-345, karar 51).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR — Recep'in sorusu: "neden elle, avantajı ne, unutulursa ne olacak"
 * ══════════════════════════════════════════════════════════════════════════════
 * Cevabı tek cümle: ELLE = UNUTULUR. `.wrongstack/memories/sage.db` git DIŞIDIR ve tek
 * kopyadır; unutulan bir yedek, kaybın sessiz hâlidir. Yedeğin kendisi 2026-09-18'de yazıldı
 * ve doğrulandı (`scripts/hijyen/sage-yedek.cjs`); eksik olan tek şey onu ÇAĞIRAN yerdi.
 *
 * ⛔GÖZCÜ/CRON KURULMAZ (REC-328). Bu yüzden zamanlayıcı değil, OLAY seçildi: oturum
 * kapanışı. Pencere kapanırken zaten çalışan bir kanca var (`board-release.cjs`), yedek de
 * aynı olaya binerse yeni bir süreç/servis doğmaz.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * ÜÇ KURAL
 * ══════════════════════════════════════════════════════════════════════════════
 * 1. **24 saat kuralı.** Son yedek 24 saatten yeniyse HİÇBİR ŞEY yapılmaz. Üç pencere aynı
 *    ana ağacı paylaşır; her kapanışta yedek almak aynı veriyi günde onlarca kez kopyalamaktır.
 * 2. **Fail-open ve sessiz.** Çıkış DAİMA 0. Bir kancanın oturum kapanışını bloklaması ya da
 *    hata kusması kabul edilemez. Ama sessizlik "başarılı" demek değildir → sonuç, yedek
 *    dizinindeki `son-kosum.log` dosyasına yazılır ve gecikme istem satırında görünür
 *    (`defter-tazelik-satiri.cjs` SAGE bloğu). Ölçen ama görünmeyen kapı, görünmeyen kapıdır.
 * 3. **Süre bütçesi.** `VACUUM INTO` ölçüldü: 892 KB veritabanı ~1 sn. Bütçe 15 sn; aşılırsa
 *    koşum bırakılır ve sebebi loga yazılır.
 *
 * ⭐KÖK ANA AĞAÇTIR, `cwd` DEĞİL. Bu kanca worktree pencerelerinde de koşar; kök çözümü
 * `scripts/hijyen/ana-kok.cjs` üzerindendir (ölçüldü 2026-09-18: eski çözüm worktree'de
 * "sage kurulu degil" deyip çıkış 0 veriyordu — yedek hiç alınmaz, başarılı görünürdü).
 *
 * stdin: { session_id?, reason? } · stdout: YOK · çıkış: DAİMA 0
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §7.
 */
const fs = require('fs')
const path = require('path')

/** Son yedek bundan yeniyse koşum atlanır. */
const TAZE_SAAT = 24
/** Koşum bütçesi; aşılırsa bırakılır. */
const BUTCE_MS = 15_000

function logaYaz(dizin, satir) {
  try {
    fs.mkdirSync(dizin, { recursive: true })
    fs.appendFileSync(path.join(dizin, 'son-kosum.log'), satir + '\n', 'utf8')
  } catch {
    /* log yazılamıyorsa da oturum kapanışı bloklanmaz */
  }
}

try {
  // stdin okunur ama kullanılmaz; okunmazsa üst süreç boru hatası görebilir.
  try {
    fs.readFileSync(0, 'utf8')
  } catch {
    /* stdin yoksa sorun değil */
  }

  const t0 = Date.now()
  const yedek = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-yedek.cjs'))
  const dizin = yedek.yedekDizini()
  const durum = yedek.sonDurum(dizin)

  const damga = new Date(t0).toISOString().replace(/\.\d+Z$/, 'Z')
  if (durum.sonYedek && t0 - Date.parse(durum.sonYedek) < TAZE_SAAT * 3_600_000) {
    logaYaz(dizin, `${damga} ATLANDI — son yedek ${durum.sonYedek} (${TAZE_SAAT} saatten yeni)`)
    process.exit(0)
  }

  /**
   * ⭐HER DEPO AYRI: sage hafızası VE iş kartı panosu. İkisi de `.wrongstack/` altında, WAL
   * kipli, git DIŞI. 2026-09-19 ölçüldü: panonun ana dosyası 4 KB, WAL'ı 148 KB — içerik
   * pratikte tamamen WAL'da. Tek satırda "alındı" demek, ötekinin düştüğünü örter.
   */
  for (const s of yedek.hepsiniAl()) {
    const sure = Date.now() - t0
    if (s.durum === 'alindi') {
      const aktif = s.yedek.aktif === null ? '' : `/${s.yedek.aktif}`
      logaYaz(dizin, `${damga} [${s.depo}] ALINDI ${path.basename(s.yol)} — kayit ${s.yedek.sayi}${aktif}, ${sure} ms`)
    } else if (s.durum === 'kaynak-yok') {
      logaYaz(dizin, `${damga} [${s.depo}] kaynak YOK — ${s.sebep || ''} (bu makinede kurulu degil)`)
    } else {
      logaYaz(dizin, `${damga} [${s.depo}] ⛔${String(s.durum).toUpperCase()} — ${s.sebep || ''} (${sure} ms)`)
    }
  }
  const sure = Date.now() - t0
  if (sure > BUTCE_MS) logaYaz(dizin, `${damga} ⚠BUTCE ASILDI — ${sure} ms > ${BUTCE_MS} ms`)
} catch (e) {
  try {
    const yedek = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-yedek.cjs'))
    logaYaz(yedek.yedekDizini(), `${new Date().toISOString()} ⛔KANCA HATASI — ${String((e && e.message) || e)}`)
  } catch {
    /* bu noktada yapacak bir şey yok; oturum kapanışı yine de bloklanmaz */
  }
}

process.exit(0)
