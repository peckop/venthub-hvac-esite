#!/usr/bin/env node
'use strict'

/**
 * İZİN-REDDİ OLAY GÜNLÜĞÜ — filo-görünür ret sayacı.
 *
 * NİÇİN VAR (ölçülmüş boşluk, 2026-08-31): URUN'un bir sabahında üç *normalde serbest*
 * eylem reddedildi (`CronCreate`, `gh pr merge`, `npx vitest`) ve aynı komut **ikinci
 * denemede geçti**. Bu sınıf yalnız o şeridin transkriptinde yaşıyordu; filo genelinde
 * kimse ölçmüyordu. Dalgalı ret bir şeridi **sessizce** durdurabilir — URUN'un cron
 * katmanı fiilen böyle düştü (mekanizmanın üç ayağından biri kurulmadan kaldı).
 *
 * ⭐ÖLÇÜT SEÇİMİ — İLK DENEMEM YANLIŞ EVRENİ ÖLÇTÜ, ADIYLA YAZIYORUM:
 * Önce metin taradım (`Permission to use ... has been denied`). O kalıp **109** kayıt
 * buldu ve hepsi `Bash`ti — yani URUN'un bildirdiği `CronCreate` reddini HİÇ görmüyordu.
 * Sebep: o sınıfın metni bambaşka (`denied by the Claude Code auto mode classifier`).
 * Metin ölçütüyle kurulacak günlük **kör bir kapı** olurdu: sayı üretir, aranan sınıfı
 * kaçırır. (Sınıf: "ölçüt keskin ama evren yanlış".)
 *
 * DOĞRU ÖLÇÜT YAPISALDIR: transkript kaydında amaca özel bir alan var — **`toolDenialKind`**.
 * Metin eşleşmesi gerekmiyor. Ölçülen değerler (filo geneli, tüm geçmiş):
 *   permission-rule 240 · automode-blocked 181 · user-rejected 27 · automode-unavailable 6
 *
 * DÖRT TÜR AYNI ŞEY DEĞİLDİR — karıştırmak günlüğü gürültüye boğar:
 *   · `user-rejected`        → İNSAN reddetti. Arıza değil, KARAR. Sayılır, alarm ÜRETMEZ.
 *   · `permission-rule`      → Yazılı kural reddetti. Beklenen davranış; ayar konusudur.
 *   · `automode-blocked`     → ⭐ANOMALİ ADAYI: sınıflandırıcı reddetti. URUN'un vakası bu.
 *   · `automode-unavailable` → sınıflandırıcı ulaşılamadı (altyapı).
 *
 * NİÇİN AYAR DEĞİŞİKLİĞİ GEREKMİYOR: kaynak transkript dosyasıdır; hiçbir hook kaydı,
 * hiçbir `settings.json` değişikliği gerekmez. (İzin/ayar dosyalarına akran isteğiyle
 * dokunulmaz — bu betik o sınırı hiç zorlamıyor.)
 *
 * ⚠BU BETİĞİN GÖREMEDİĞİ, ADIYLA: transkripte YAZILMAYAN bir ret görünmez. Ayrıca
 * "ikinci denemede geçti" bilgisi doğrudan bir alanda DEĞİL — aynı aracın kısa aralıkta
 * tekrar reddedilip reddedilmediğinden ÇIKARILIR (heuristik, `--tekrar` ile raporlanır).
 *
 * Cetvel: `docs/standards/fleet-mechanism-standard.md` §18.
 *
 * KULLANIM:
 *   node scripts/board/izin-reddi-gunlugu.cjs olc [--gun 2026-08-31] [--json]
 *   node scripts/board/izin-reddi-gunlugu.cjs bildir --sid <sid> [--gun ...] [--esik 1]
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

/** Transkriptlerin kökü — proje slug'ı bu deponun yolundan türer. */
const PROJE_DIZINI =
  process.env.VENTHUB_TRANSKRIPT_DIR ||
  path.join(
    process.env.USERPROFILE || process.env.HOME || '',
    '.claude', 'projects', 'c--Users-alize-venthub-hvac',
  )

/** Alarm ÜRETEN türler. `user-rejected` bilerek DIŞARIDA: insan kararı arıza değildir. */
const ANOMALI_TURLERI = new Set(['automode-blocked', 'automode-unavailable'])

function bugun() {
  return new Date().toISOString().slice(0, 10)
}

function bayrakOku(argv) {
  const f = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue
    const ad = argv[i].slice(2)
    const sonraki = argv[i + 1]
    if (sonraki && !sonraki.startsWith('--')) { f[ad] = sonraki; i++ } else f[ad] = true
  }
  return f
}

/**
 * ⭐ARAÇ ADI RET KAYDINDA YOKTUR — ÖLÇÜLDÜ (2026-08-31).
 *
 * Ret kaydının alanları: `type, message, timestamp, toolUseResult, classifierMetaLines,
 * toolDenialKind, sourceToolAssistantUUID, sessionId, ...`. Araç adı **hiçbirinde yok**;
 * mesaj gövdesi yalnız sınıflandırıcının metnini taşıyor. İlk denememde metinden çıkarmaya
 * çalıştım ve HER kayıt için `?` döndü — yani OPS'un istediği "hangi araç" kolonu
 * tamamen boş kalıyordu.
 *
 * DOĞRU YOL: `sourceToolAssistantUUID`, çağrıyı yapan **assistant** kaydını gösterir;
 * araç adı oradaki `tool_use` bloğundadır. Assistant kaydı retten ÖNCE geldiği için
 * TEK ileri geçiş yeter — harita yol boyunca kurulur.
 *
 * Doğrulandı: URUN'un 2026-08-31 sabahı bildirdiği dört ret bu yolla
 * `CronCreate` + 3× `Bash` olarak çözüldü — beyanı yapısal ölçümle birebir tuttu.
 *
 * Çözülemezse `?` yazılır; UYDURULMAZ.
 */
function toolUseAdlari(kayit) {
  const c = (kayit.message && kayit.message.content) || []
  if (!Array.isArray(c)) return null
  const bloklar = c.filter((x) => x && x.type === 'tool_use')
  if (!bloklar.length) return null
  return {
    ad: bloklar.map((b) => b.name).join(','),
    // Bash icin komutun BASI da tasinir: "hangi arac" kadar "hangi komut" da eyleme donuk.
    ozet: bloklar
      .map((b) => (b.input && (b.input.command || b.input.cron || b.input.file_path)) || '')
      .filter(Boolean)
      .join(' | ')
      .replace(/\s+/g, ' ')
      .slice(0, 70),
  }
}

async function tara(gun) {
  let dosyalar = []
  try {
    dosyalar = fs.readdirSync(PROJE_DIZINI).filter((f) => f.endsWith('.jsonl'))
  } catch (e) {
    return { hata: `transkript dizini okunamadi (${PROJE_DIZINI}): ${e && e.message}`, olaylar: [] }
  }
  const olaylar = []
  for (const dosya of dosyalar) {
    const sid = dosya.slice(0, 8)
    const akis = readline.createInterface({
      input: fs.createReadStream(path.join(PROJE_DIZINI, dosya)),
      crlfDelay: Infinity,
    })
    /** uuid → {ad, ozet}. Yalnız `tool_use` içeren assistant kayıtları girer. */
    const cagrilar = new Map()
    for await (const satir of akis) {
      // Ucuz on eleme: iki anahtardan biri gecmiyorsa JSON.parse'a HIC girme
      // (transkriptler 60-190 MB; her satiri parse etmek bu isi dakikalara cikarir).
      const retVar = satir.indexOf('toolDenialKind') !== -1
      const cagriVar = satir.indexOf('tool_use') !== -1
      if (!retVar && !cagriVar) continue
      let j
      try { j = JSON.parse(satir) } catch { continue }

      if (cagriVar && j.uuid) {
        const c = toolUseAdlari(j)
        if (c) cagrilar.set(j.uuid, c)
      }
      if (!retVar) continue
      const tur = j.toolDenialKind
      if (!tur) continue
      const ts = String(j.timestamp || '')
      if (gun && !ts.startsWith(gun)) continue
      const kaynak = j.sourceToolAssistantUUID ? cagrilar.get(j.sourceToolAssistantUUID) : null
      olaylar.push({
        sid,
        tur,
        arac: kaynak ? kaynak.ad : '?',
        komut: kaynak ? kaynak.ozet : '',
        ts,
        saat: ts.slice(11, 19),
      })
    }
  }
  olaylar.sort((a, b) => a.ts.localeCompare(b.ts))
  return { hata: null, olaylar }
}

/**
 * "İkinci denemede geçti" HEURISTIĞI: aynı oturum + aynı araç, 10 dk içinde BİRDEN FAZLA
 * ret → tekrar denendiği hâlde yine reddedilmiş demektir. Tek ret ise, sonrasında geçip
 * geçmediğini bu kaynaktan BİLEMEYİZ; o yüzden "tekrar" sayısı ayrı raporlanır ve
 * "geçti" diye YORUMLANMAZ.
 */
function tekrarlar(olaylar) {
  const gruplar = new Map()
  for (const o of olaylar) {
    if (!ANOMALI_TURLERI.has(o.tur)) continue
    const k = o.sid + '|' + o.arac
    if (!gruplar.has(k)) gruplar.set(k, [])
    gruplar.get(k).push(o)
  }
  const out = []
  for (const [k, liste] of gruplar) {
    if (liste.length < 2) continue
    const ilk = Date.parse(liste[0].ts), son = Date.parse(liste[liste.length - 1].ts)
    if (Number.isFinite(ilk) && Number.isFinite(son) && son - ilk <= 10 * 60 * 1000) {
      out.push({ anahtar: k, sayi: liste.length, ilk: liste[0].saat, son: liste[liste.length - 1].saat })
    }
  }
  return out
}

function ozet(olaylar) {
  const turler = new Map(), oturumlar = new Map(), araclar = new Map()
  for (const o of olaylar) {
    turler.set(o.tur, (turler.get(o.tur) || 0) + 1)
    if (ANOMALI_TURLERI.has(o.tur)) {
      oturumlar.set(o.sid, (oturumlar.get(o.sid) || 0) + 1)
      araclar.set(o.arac, (araclar.get(o.arac) || 0) + 1)
    }
  }
  const anomali = olaylar.filter((o) => ANOMALI_TURLERI.has(o.tur)).length
  return { turler, oturumlar, araclar, anomali, toplam: olaylar.length }
}

async function main() {
  const [, , fiil, ...rest] = process.argv
  const f = bayrakOku(rest)
  /**
   * `--tum` AYRI BİR BAYRAK, `--gun ""` DEĞİL — ölçülmüş tuzak (2026-08-31, kendi betiğimde):
   * `--gun ""` çağrısı ayrıştırıcıda boş dizeyi `true`ya çeviriyor ve gün SESSİZCE bugüne
   * düşüyordu. Yani "tüm geçmişi ölç" isteyen kullanıcı bugünün sayısını alıp onu geçmiş
   * sanırdı. Boş-değer ile bayrak-var arasındaki ayrımı ayrıştırıcıya bırakmak yerine
   * niyeti ADIYLA istiyoruz.
   */
  const gun = f.tum ? '' : (typeof f.gun === 'string' && f.gun ? f.gun : bugun())

  if (!fiil || fiil === 'yardim') {
    console.log('kullanim: izin-reddi-gunlugu.cjs <olc|bildir> [--gun YYYY-MM-DD] [--sid X] [--esik N] [--json]')
    console.log('  olc    — gunun retlerini sayar ve basar (yazma YAPMAZ); --tum ile BUTUN gecmis')
    console.log('  bildir — esigi asarsa panoya not birakir (--sid ZORUNLU)')
    process.exit(0)
  }

  const { hata, olaylar } = await tara(gun)
  if (hata) { console.error('[izin-reddi] ' + hata); process.exit(1) }

  const o = ozet(olaylar)
  const tekrar = tekrarlar(olaylar)

  if (f.json) { console.log(JSON.stringify({ gun, ozet: { ...o, turler: [...o.turler], oturumlar: [...o.oturumlar], araclar: [...o.araclar] }, tekrar, olaylar }, null, 2)); return }

  console.log(`[izin-reddi] ${gun} — toplam ${o.toplam} ret, bunlardan ANOMALI ADAYI ${o.anomali}`)
  for (const [t, n] of [...o.turler].sort((a, b) => b[1] - a[1])) {
    const isaret = ANOMALI_TURLERI.has(t) ? '⭐' : (t === 'user-rejected' ? '  (insan karari)' : '  ')
    console.log(`   ${String(n).padStart(4)}  ${t}${isaret}`)
  }
  if (o.anomali) {
    console.log('   oturum: ' + [...o.oturumlar].map(([k, v]) => `${k}:${v}`).join(' '))
    console.log('   arac  : ' + [...o.araclar].map(([k, v]) => `${k}:${v}`).join(' '))
  }
  for (const t of tekrar) {
    console.log(`   ⚠TEKRAR: ${t.anahtar} — ${t.sayi} ret, ${t.ilk}..${t.son} (10 dk icinde; "sonra gecti" BU KAYNAKTAN bilinemez)`)
  }

  if (fiil === 'bildir') {
    const sid = f.sid || process.env.CLAUDE_SESSION_ID
    if (!sid) { console.error('[izin-reddi] --sid zorunlu (panoya yazan fiil, kimliksiz kosmaz)'); process.exit(1) }
    const esik = Number(f.esik || 1)
    if (o.anomali < esik) { console.log(`[izin-reddi] esik ${esik} asilmadi (${o.anomali}) — pano notu YAZILMADI.`); return }
    const pano = require(path.join(__dirname, 'board.cjs'))
    const satirlar = [...o.oturumlar].map(([k, v]) => `  · ${k}: ${v}`).join('\n')
    pano.append(sid, {
      type: 'note',
      to: '',
      text:
        `IZIN-REDDI GUNLUGU (${gun}): ${o.anomali} ANOMALI ADAYI ret (automode-blocked/unavailable).\n` +
        satirlar +
        `\n  arac dagilimi: ` + [...o.araclar].map(([k, v]) => `${k}:${v}`).join(' ') +
        (tekrar.length ? `\n  ⚠TEKRAR EDEN: ` + tekrar.map((t) => `${t.anahtar}(${t.sayi})`).join(' ') : '') +
        `\n  NOT: user-rejected (insan karari) bu sayiya DAHIL DEGIL. Kaynak: transkript toolDenialKind alani.`,
    })
    console.log(`[izin-reddi] panoya BROADCAST not birakildi (${o.anomali} anomali).`)
  }
}

main().catch((e) => { console.error('[izin-reddi] beklenmedik hata: ' + (e && e.message)); process.exit(1) })
