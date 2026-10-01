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
 * ⛔Eski gözcü üçlüsü EMEKLİ (REC-328). ⚠KARAR 53 (2026-09-19): bu bir GENEL YASAK
 * değildi — kota sıkışıkken alınmış dönemsel bir karardı; zamanlayıcı / cron / loop
 * gerekiyorsa ÖNCE Recep'le konuşulur. Burada zamanlayıcı değil OLAY seçildi ve seçim
 * bugün de doğru, çünkü yedeğin doğal tetiği zaten kapanıştır: oturum
 * kapanışı. Pencere kapanırken zaten çalışan bir kanca var (`board-release.cjs`), yedek de
 * aynı olaya binerse yeni bir süreç/servis doğmaz.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * ÜÇ KURAL
 * ══════════════════════════════════════════════════════════════════════════════
 * 1. **Tazelik kuralı DEPO BAŞINADIR (ARC-9).** Her deponun son yedeği kendi eşiğinden (kanban ve defter 1 saat, sage
 *    24 saat) yeniyse o depo için HİÇBİR ŞEY yapılmaz. Pencereler aynı ana ağacı paylaşır; her kapanışta yedek almak
 *    aynı veriyi onlarca kez kopyalamaktır. Kanca hem SessionEnd'de hem (ayar kararıyla) Stop'ta koşabilir; Stop'ta
 *    önce UCUZ BAKIŞ yapılır (`ucuzTazeMi`: dizin listesi + mtime, log yok).
 *    Defter (`recep-sozu-defteri-yedek.cjs`, ARC-15) aynı kancadan yedeklenir ve eşik aşılmışsa döndürülür.
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

/**
 * ⭐TAZELİK EŞİĞİ DEPO BAŞINADIR (ARC-9, 2026-10-01): kanban ve defter 1 saat, sage 24 saat (`sage-yedek.cjs DEPOLAR.tazeSaat`;
 * defter için `recep-sozu-defteri-yedek.cjs TAZE_SAAT`). Tek 24 saatlik kural, sabah alınan yedekten öğleye kadar eklenen
 * kartları ertesi sabaha kadar yedeksiz bırakıyordu (ölçüldü: 27 kart).
 */
/** Koşum bütçesi; aşılırsa bırakılır. */
const BUTCE_MS = 15_000
/** `son-kosum.log` bu boyutu aşarsa son yarısı tutulur (kanca her turda koşabilir; log sonsuz büyümesin). */
const LOG_TAVAN = 256 * 1024
/** Ucuz Stop bakışı: kanban VE defter yedeği bundan yeniyse kanca HİÇBİR ŞEY açmadan, LOG YAZMADAN çıkar. */
const UCUZ_TAZE_MS = 60 * 60 * 1000

function logaYaz(dizin, satir) {
  try {
    fs.mkdirSync(dizin, { recursive: true })
    const yol = path.join(dizin, 'son-kosum.log')
    try {
      if (fs.statSync(yol).size > LOG_TAVAN) {
        const m = fs.readFileSync(yol, 'utf8')
        fs.writeFileSync(yol, m.slice(m.indexOf('\n', Math.floor(m.length / 2)) + 1), 'utf8')
      }
    } catch {
      /* log henüz yok */
    }
    fs.appendFileSync(yol, satir + '\n', 'utf8')
  } catch {
    /* log yazılamıyorsa da oturum kapanışı bloklanmaz */
  }
}

/**
 * ⭐UCUZ BAKIŞ (Stop olayında kanca her turda koşabilir): sage-yedek.cjs yüklenmeden, sqlite açılmadan yalnız
 * `readdirSync + statSync`. Kanban VE (varsa) defter yedeği 60 dakikadan yeniyse "yapılacak iş yok" demektir.
 * Sage eşiği 24 saat olduğundan kanban tazeyken sage'e bakmaya gerek yok: sage en geç bir sonraki kanban koşumunda görülür.
 * `.DOGRULANMADI` dosyaları desenle dışarıda kalır (yedek sayılmaz).
 */
function ucuzTazeMi() {
  const os = require('os')
  const hedef =
    process.env.VENTHUB_SAGE_YEDEK_DIZINI ||
    path.join(process.env.LOCALAPPDATA || process.env.XDG_STATE_HOME || path.join(process.env.HOME || '.', '.local', 'state'), 'venthub-sage-yedek')
  const yeniMi = (desen) => {
    try {
      const en = fs.readdirSync(hedef).filter((f) => desen.test(f)).sort().pop()
      return Boolean(en) && Date.now() - fs.statSync(path.join(hedef, en)).mtimeMs < UCUZ_TAZE_MS
    } catch {
      return false
    }
  }
  const defterYolu = process.env.VENTHUB_RECEP_DEFTER || path.join(os.homedir(), '.claude', 'recep-sozu-defteri.jsonl')
  const defterTaze = !fs.existsSync(defterYolu) || yeniMi(/^defter-\d{4}-\d{2}-\d{2}T\d{4}Z\.jsonl$/)
  return yeniMi(/^kanban-.*\.sqlite$/) && defterTaze
}

try {
  // stdin okunur ama kullanılmaz; okunmazsa üst süreç boru hatası görebilir.
  try {
    fs.readFileSync(0, 'utf8')
  } catch {
    /* stdin yoksa sorun değil */
  }

  // ⭐Ucuz bakış ÖNCE: taze ise sage-yedek.cjs bile yüklenmez, log yazılmaz (Stop turunda ~ms).
  if (ucuzTazeMi()) process.exit(0)

  const t0 = Date.now()
  const yedek = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-yedek.cjs'))
  const defterYedek = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'recep-sozu-defteri-yedek.cjs'))
  const defter = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'recep-sozu-defteri.cjs'))
  const dizin = yedek.yedekDizini()
  const durum = yedek.sonDurum(dizin)

  const damga = new Date(t0).toISOString().replace(/\.\d+Z$/, 'Z')
  /** Yedeği eşiğinden ESKİ (ya da hiç olmayan) depolar; yalnız bunlar alınır. */
  const bayat = yedek.DEPOLAR.filter((d) => {
    const ds = durum.depolar.find((x) => x.depo === d.ad)
    return !(ds && ds.sonYedek && t0 - Date.parse(ds.sonYedek) < d.tazeSaat * 3_600_000)
  })
  const dd = defterYedek.durum(dizin, t0)
  const defterBayat = !(dd.sonYedek && t0 - Date.parse(dd.sonYedek) < defterYedek.TAZE_SAAT * 3_600_000)
  if (bayat.length === 0 && !defterBayat) {
    const esik = [...yedek.DEPOLAR.map((d) => `${d.ad} ${d.tazeSaat} saat`), `defter ${defterYedek.TAZE_SAAT} saat`].join(', ')
    logaYaz(dizin, `${damga} ATLANDI — her deponun son yedegi esiginden yeni (${esik})`)
    process.exit(0)
  }

  /**
   * ⭐HER DEPO AYRI: sage hafızası, iş kartı panosu VE Recep sözü defteri. Hepsi git DIŞI. 2026-09-19 ölçüldü: panonun
   * ana dosyası 4 KB, WAL'ı 148 KB — içerik pratikte tamamen WAL'da. Tek satırda "alındı" demek, ötekinin düştüğünü örter.
   */
  for (const d of bayat) {
    const s = { depo: d.ad, ...yedek.yedekAl(new Date(t0), d.ad) }
    const sure = Date.now() - t0
    if (s.durum === 'alindi') {
      const aktif = s.yedek.aktif === null ? '' : `/${s.yedek.aktif}`
      const kart = s.kanban ? `, ${s.kanban.pano} pano / ${s.kanban.kart} kart` : ''
      logaYaz(dizin, `${damga} [${s.depo}] ALINDI ${path.basename(s.yol)} — kayit ${s.yedek.sayi}${aktif}${kart}, ${sure} ms`)
    } else if (s.durum === 'kaynak-yok') {
      logaYaz(dizin, `${damga} [${s.depo}] kaynak YOK — ${s.sebep || ''} (bu makinede kurulu degil)`)
    } else {
      logaYaz(dizin, `${damga} [${s.depo}] ⛔${String(s.durum).toUpperCase()} — ${s.sebep || ''} (${sure} ms)`)
    }
  }
  if (defterBayat) {
    // Önce YEDEK, sonra döndürme: döndürme bir şeyi bozsa bile yedek eski halini taşır.
    const r = defterYedek.yedekAl(new Date(t0), { dizin })
    const sure1 = Date.now() - t0
    if (r.durum === 'alindi') logaYaz(dizin, `${damga} [defter] ALINDI ${path.basename(r.yol)} — ${r.satir} satir, ${r.bayt} bayt, ${sure1} ms`)
    else if (r.durum !== 'kaynak-yok' && r.durum !== 'atlandi') logaYaz(dizin, `${damga} [defter] ⛔${String(r.durum).toUpperCase()} — ${r.sebep || ''} (${sure1} ms)`)
    const dr = defter.dondur()
    if (dr.durum === 'dondu') logaYaz(dizin, `${damga} [defter] DONDURULDU — ${dr.tasinan} satir arsive tasindi, ${dr.tutulan} satir aktifte`)
    else if (dr.durum !== 'gerek-yok') logaYaz(dizin, `${damga} [defter] ⚠DONDURMA ${String(dr.durum).toUpperCase()} — ${dr.sebep || ''} (aktif defter korundu)`)
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
