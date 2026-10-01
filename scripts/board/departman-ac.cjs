#!/usr/bin/env node
/**
 * DEPARTMAN AÇICI — karar/plan tarafı. Pencereyi AÇAN kabuk `departman-ac.ps1`dir (`departman-ac.cmd <Rol>` sarmalar).
 *
 * NİÇİN VAR (Ops 09-30): pencereleri IDE eklentisi açıyor; kapanan bir departmanı (Araç, Harita, Ops…) geri açmak için
 * Recep her seferinde sid arayıp `claude --resume …` komutunu elle kuruyordu. Bu betik "rol adı → o rolün SON oturumu →
 * zaten açık mı → tavan → aç" zincirini TEK yerde kurar. Bu dosya süreç BAŞLATMAZ: yalnız kararı ve komut satırını üretir
 * (`--json`); başlatmayı ps1 yapar (ölçülmüş yöntem: Start-Process → Windows Terminal yeni sekme). Böylece karar tarafı
 * gerçek `claude` başlatılmadan TEST edilir (`--kuru`).
 *
 * ZİNCİR (her adım bir kapı testinde ölçülür — src/__tests__/conformance/departman-ac.test.ts):
 *  1. Rol → görünen ad: TEK KAYNAK `scripts/board/pencere-adlari.cjs` TABLO'su (burada tablo YOK). Türkçe katlamalı
 *     eşleme (`ayniMi`, departman-ortak.cjs): "Araç" = "ARAC" = "arac"; hem şerit adıyla hem görünen adla eşleşir.
 *     Tanınmayan rol → HATA.
 *  2. Rolün SON sid'i: panonun olay dosyalarındaki en yeni `claim` (PRUNE_MS uygulanmaz; departman gün sonra da açılır).
 *  3. Canlı mı: `claude agents --json` (ölçülebilirse YETKİLİ) yoksa `~/.claude/sessions/<pid>.json` + pid canlılığı.
 *     Rolün BİLİNEN TÜM sid'lerinden biri ya da adı rol adıyla eşleşen (Türkçe katlamalı) bir ana pencere AÇIKSA
 *     AÇMAZ: "zaten açık: <ad> (sid8)", çıkış 0 (`departman-ortak.rolPencereleri`).
 *  4. TAVAN: açık ana pencere sayısı (alt süreçler ve OPS HARİÇ) 5'e ulaştıysa AÇMAZ, uyarır, çıkış 1.
 *     OPS tavandan MUAFTIR: Ops tavan doluyken de açılır (sayıma girmediği gibi kapıya da takılmaz).
 *  5. Komut: `claude.exe --resume <sid> --name <Ad> --permission-mode auto --strict-mcp-config --mcp-config
 *     <ana-kök>\.mcp.json` (sid yoksa `--resume` YOK = yeni oturum), çalışma dizini = ANA DEPO KÖKÜ
 *     (scripts/hijyen/ana-kok.cjs; sabit yol yazılmaz).
 *  · İZİN MODU (Recep kararı bekliyor): açılan pencere `--permission-mode auto` kipte BAŞLAR; Recep kararı gelene kadar
 *     varsayılan budur. Bu bir güvenlik tercihidir, teknik zorunluluk değil; değişecekse YALNIZ bu satırdaki değer
 *     (ve bu not) değişir. Canlı deneme onayı istenirken bu satır ayrıca söylenir.
 *  · `--taze`: `--resume` YOK; yeni oturum `--name <Ad>` + ilk mesaj "durum dosyanı oku, devam et" (durum dosyasının
 *     yolu rolün son sid'inden mevcut kancanın çözümlemesiyle bulunur; bulunamazsa genel cümle + uyarı).
 *
 * EKİP KİPİ (Ops ölçümü, 2026-10-01; kayıt memory/ekip-modu-olculmus-gercek.md — TEKRAR ÖLÇME): ekip modu (agent teams)
 *  TERMİNAL oturumunda VAR (taze de `--resume` de), Masaüstü uygulamasında YOK. Ayrı "TeamCreate" aracı yoktur; ekip üyesi
 *  Agent'ı `name` ile çağırmakla açılır. Bu yüzden ekip isteyen departman bu betikle TERMİNAL sekmesinde açılır ve
 *  `--resume` ekibi KAYBETTİRMEZ (yalnız önceki üyeler geri gelmez, lider yenilerini açar).
 *  ⚠`/desktop` YAZMA: terminalde açık bir oturuma `/desktop` yazılırsa oturum Masaüstü'ne geçer, `Agent name` düz alt
 *  ajana düşer ve ekip modu KAYBOLUR (ölçüldü 2026-10-01, Ürün). Ekip modu isteyen pencere terminalde KALIR.
 *  Aynı sid iki yerde birden açılamaz: Masaüstü'nde açık bir oturumu terminale almak için önce Masaüstü tarafı kapanmalı
 *  (bu betik "zaten açık" der ve açmaz). Her açılış Recep'in ekranında ve onayındadır; kapatmak insan eylemidir.
 *  MCP KÜMESİNİ DARALTMAK (ör. `--strict-mcp-config`, rol başına sunucu listesi) RECEP KARARIDIR (Ops 10-01): varsayılan
 *  Masaüstü penceresiyle AYNI sunucu kümesidir; daraltma gerekçeli ve ölçümlü bir kararla girer, betiğin kendi tercihiyle girmez.
 *
 * HATA YOLLARI (hepsi açık mesaj; sessiz geçmez): rol tanınmıyor · claude.exe bulunamadı · .mcp.json yok (bayrak yolu kırık
 * olurdu) · pencere tavanı dolu → çıkış 1. Pano dizini yok / olay dosyası bozuk / sessions dizini yok / sid yok →
 * KIRILMAZ, yeni oturum açılır ama `uyarilar` satırı sebebi söyler ("ölçemedim" ≠ "yok").
 *
 * Kullanım:  node departman-ac.cjs <Rol> [--taze] [--kuru] [--json]
 *   --json  : plan JSON (ps1 bunu okur; ASCII'ye kaçışlı, kodlama sorunu çıkmaz)
 *   --kuru  : hiçbir süreç başlatılmaz (bu betik zaten başlatmaz); ps1'e geçirilirse o da başlatmaz. Yapılacak komut YAZILIR.
 */
const fs = require('fs')
const path = require('path')

const ortak = require('./departman-ortak.cjs')
const { anaKok } = require('../hijyen/ana-kok.cjs')

/** `--taze` ilk mesajı. Yol varsa cümleye girer. Türkçe karakterli (JSON'da \u kaçışıyla taşınır). */
function tazeIstem(durum) {
  return durum
    ? `Durum dosyanı oku (${durum.tam}) ve kaldığın yerden devam et.`
    : 'Durum dosyanı oku (memory/ altındaki son durum dosyan) ve kaldığın yerden devam et.'
}

/**
 * PLAN — saf olmayan tek yer ortam okumasıdır (pano/oturum kayıtları/PATH); süreç BAŞLATMAZ.
 * @param {string} rolArg
 * @param {{taze?:boolean}} [o]
 * @returns {object} `{karar:'ac'|'zaten-acik'|'tavan'|'hata', ...}`
 */
function planla(rolArg, o = {}) {
  const rol = ortak.rolCoz(String(rolArg || ''))
  if (!rol) {
    return { karar: 'hata', sebep: `rol taninmiyor: "${rolArg || ''}" (tablo scripts/board/pencere-adlari.cjs) — gecerli roller: ${ortak.gecerliRoller()}` }
  }
  const tara = ortak.panoTara()
  const uyarilar = [...tara.uyarilar]
  const son = ortak.sonSid(tara.claims, rol.serit)
  const acik = ortak.acikPencereler()
  uyarilar.push(...acik.uyarilar)

  // "Zaten açık" kararı rolün BİLİNEN TÜM sid'leri + pencere adı üzerinden verilir (yalnız en yeni claim'in sid'i DEĞİL):
  // eski sid canlı + yeni sid kapalıysa ya da `--taze` ile claim'siz açılmış "Araç" penceresi varsa ikincisi AÇILMAZ.
  const canli = ortak.rolPencereleri(acik.liste, tara.claims, rol)
  if (canli.length > 0) {
    const p = canli[0]
    if (canli.length > 1) uyarilar.push(`${rol.ad} icin ${canli.length} ACIK pencere var (${canli.map((x) => `pid ${x.pid}`).join(', ')}) — biri fazla`)
    const kimlik = p.sid ? p.sid.slice(0, 8) : `pid ${p.pid}`
    return {
      karar: 'zaten-acik', ad: rol.ad, serit: rol.serit, sid: p.sid || null, pid: p.pid, eslesme: p.eslesme, kanit: acik.kaynak, uyarilar,
      mesaj: `zaten acik: ${rol.ad} (${kimlik})`,
    }
  }
  if (!son) uyarilar.push(`${rol.ad} icin panoda gecmis oturum yok — YENI oturum acilacak (--resume yok)`)

  const tavan = ortak.tavanDurumu(acik.liste, ortak.opsSidleri(tara.claims))
  // OPS tavandan MUAF: sayıma girmez (tavanDurumu) ve açılışta da kapıya takılmaz. Ops, tavan doluyken başka bir
  // departmanı kapatmayı koordine eden penceredir; en çok o zaman gerekir.
  const opsMuaf = ortak.ayniMi(rol.serit, ortak.OPS_SERIT)
  if (tavan.doldu && !opsMuaf) {
    return {
      karar: 'tavan', ad: rol.ad, serit: rol.serit, sayi: tavan.sayi, tavan: tavan.tavan, uyarilar,
      mesaj: `pencere tavani DOLU: ${tavan.sayi}/${tavan.tavan} acik departman penceresi (OPS ve alt surecler haric) — ${rol.ad} ACILMADI; once birini kapat (departman-kapat.cmd <Rol>)`,
    }
  }

  const exe = ortak.claudeExeBul()
  if (!exe) return { karar: 'hata', sebep: 'claude.exe bulunamadi (PATH icinde claude.exe yok; VENTHUB_CLAUDE_EXE ile de verilmedi)', ad: rol.ad, uyarilar }
  const kok = process.env.VENTHUB_ANA_KOK || anaKok()
  const mcp = path.join(kok, '.mcp.json')
  if (!fs.existsSync(mcp)) return { karar: 'hata', sebep: `.mcp.json yok: ${mcp} (--strict-mcp-config bayrak yolu kirik olurdu)`, ad: rol.ad, uyarilar }

  const resume = son && !o.taze ? son.sid : null
  const args = [
    ...(resume ? ['--resume', resume] : []),
    '--name', rol.ad,
    '--permission-mode', 'auto',
    '--strict-mcp-config',
    '--mcp-config', mcp,
  ]
  let istem = null
  if (o.taze) {
    const durum = son ? ortak.durumBul(son.sid) : null
    if (!durum) uyarilar.push('durum dosyasi bulunamadi — ilk mesaj genel cumle (dosya yolu yok)')
    istem = tazeIstem(durum)
    // Konum argumani = ilk mesaj (claude [options] [prompt]). `--mcp-config <configs...>` DEGISKEN-uzunluklu oldugundan
    // `--` olmadan istem .mcp.json'un ikinci degeri sanilip yutulur (ARC-10); `--` secenek ayrimini kapatir.
    args.push('--', istem)
  }
  const argumentList = args.map(ortak.tirnakla).join(' ')
  return {
    karar: 'ac', ad: rol.ad, serit: rol.serit, sid: resume, taze: !!o.taze, istem, exe, cwd: kok, args, argumentList,
    komut: `${ortak.tirnakla(exe)} ${argumentList}`, uyarilar, tavanSayi: tavan.sayi, tavan: tavan.tavan,
  }
}

function main(argv) {
  const { bayrak, konum } = ortak.argvAyristir(argv)
  const plan = planla(konum.join(' '), { taze: bayrak.has('--taze') })
  if (bayrak.has('--json')) {
    process.stdout.write(ortak.asciiJson(plan) + '\n')
  } else if (plan.karar === 'hata') {
    process.stderr.write(`HATA: ${plan.sebep}\n`)
  } else if (plan.karar === 'zaten-acik' || plan.karar === 'tavan') {
    for (const u of plan.uyarilar) process.stdout.write(`uyari: ${u}\n`)
    process.stdout.write(plan.mesaj + '\n')
  } else {
    for (const u of plan.uyarilar) process.stdout.write(`uyari: ${u}\n`)
    process.stdout.write(`${bayrak.has('--kuru') ? 'KURU' : 'PLAN (bu betik pencere ACMAZ; departman-ac.cmd kullan)'}: ${plan.komut}\n`)
    process.stdout.write(`calisma dizini: ${plan.cwd}\n`)
  }
  return plan.karar === 'hata' || plan.karar === 'tavan' ? 1 : 0
}

module.exports = { planla, tazeIstem }

if (require.main === module) {
  let kod = 1
  try { kod = main(process.argv.slice(2)) } catch (e) {
    process.stderr.write(`HATA: beklenmeyen: ${(e && e.message) || e}\n`)
  }
  process.exit(kod)
}
