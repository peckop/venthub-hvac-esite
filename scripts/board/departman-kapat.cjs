#!/usr/bin/env node
/**
 * DEPARTMAN KAPATICI — KARAR-ONLY: "kapatılabilir / kapatılamaz" hükmü + sebep verir; hiçbir süreci SONLANDIRMAZ (kabuk: `departman-kapat.cmd <Rol>`).
 *
 * NİÇİN VAR (Ops 09-30, "en çok 5 departman penceresi" düzeni): pencere sayısı tavana dayanınca bir departmanı
 * KAYIPSIZ kapatmak gerekir. Kayıp = pencerenin belleğindeki iş durumu; onun tek kalıcı kopyası DURUM DOSYASIdır. Bu betik
 * bu yüzden bir pencereyi yalnız durum dosyası TAZEYSE kapatmaya izin verir.
 *
 * AKIŞ (her adım kapı testinde ölçülür — src/__tests__/conformance/departman-kapat.test.ts):
 *  1. Rol → şerit → rolün SON sid'i (departman-ortak.cjs; departman-ac ile AYNI çözümleme). Tanınmayan rol → HATA.
 *  2. Pencere açık mı? Değilse "zaten kapalı", çıkış 0. Hedef YALNIZ bu rolün sid'idir (başka sid'e/role dokunulmaz).
 *  3. İSTEK: pencerenin posta kutusuna "durum dosyanı yaz" mesajı (mailbox-mcp `mailbox_manage send`, alıcı = TAM sid).
 *     `--istek-atla`: istek zaten SendMessage ile atıldıysa (SendMessage ajan aracıdır, betikten çağrılamaz) yalnız ölçer.
 *     ⚠SINIR (dürüst): posta kutusu BOŞTA bir pencereyi UYANDIRMAZ; pencere mesajı ancak bir sonraki turunda görür. Bu yüzden
 *     istek çoğu zaman bayat sonuçla biter → "kapatılmadı". Bu bir kusur değil güvenlik yönüdür (kayıpsız değilse kapatma yok).
 *  4. KAPI: durum dosyası son 10 dk içinde güncellenmişse (DURUM_TAZE_DK) VE pencere MEŞGUL değilse → `kapat`. Değilse
 *     `kapatma`: "günlük bayat, kapatılmadı" / "pencere meşgul" / "durum dosyası bulunamadı". Bayatsa `--bekle-sn` kadar
 *     (varsayılan 90 sn) taze olmasını BEKLER; bekleme yalnız istek atıldıysa anlamlıdır.
 *  5. KARAR-ONLY (Ops kararı 2026-09-30): ne bu dosya ne `departman-kapat.ps1` süreç sonlandırır — tek pid de, toplu da,
 *     zorla da YOK. Sebep: izin denetimi başka oturumun sürecini öldürmeyi reddediyor (tasarım sınırı) ve Windows'ta konsol
 *     sürecini "nazikçe" kapatmanın güvenilir yolu yok. Kapatma İNSAN EYLEMİDİR: karar `kapat` ise plan `talimat` alanında
 *     Recep'e söylenecek cümleyi taşır ("<Ad> penceresini elle kapat"). Süreç sonlandıran bir komut bu dosyalara girerse
 *     INV-DEPARTMAN-KAPAT-4 kırmızı verir.
 *
 * ÇIKIŞ: 0 = kapatılabilir (karar `kapat`) / zaten kapalı · 1 = kapatılamaz (karar `kapatma`) / hata.
 *
 * Kullanım:  node departman-kapat.cjs <Rol> [--kuru] [--json] [--istek-atla] [--bekle-sn N]
 *   --kuru : posta GÖNDERMEZ, BEKLEMEZ; kapı bugünkü durumla değerlendirilir ("kapatılırdı/kapatılmazdı").
 */
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const ortak = require('./departman-ortak.cjs')
const { anaKok } = require('../hijyen/ana-kok.cjs')

const BEKLE_SN_VARSAYILAN = 90
const POSTA_ZAMAN_ASIMI_MS = 8000
const YOKLAMA_ARALIK_MS = 2000
const POSTA_KONU = 'Pencere kapatiliyor: durum dosyani yaz'
const POSTA_GOVDE =
  'departman-kapat: bu pencereyi kapatmak istiyoruz. Durum dosyani SIMDI guncelle (yapilan / acik / siradaki), ' +
  `sonra kisa bir cevap yaz. Son ${ortak.DURUM_TAZE_DK} dk icinde guncellenmis durum dosyasi yoksa pencereni KAPATMAYACAGIZ.`

const uyu = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Pencerenin posta kutusuna istek gönderir (mailbox-mcp, ayrı kısa süreli süreç; sayaç betiğiyle aynı el sıkışma).
 * Asla fırlatmaz. @returns {Promise<{durum:'gonderildi'|'hata', sebep?:string}>}
 */
function postaGonder(sid, kok, zamanAsimiMs = POSTA_ZAMAN_ASIMI_MS) {
  return new Promise((coz) => {
    const cli = path.join(kok, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'mailbox-mcp', 'dist', 'cli.js')
    if (!fs.existsSync(cli)) return coz({ durum: 'hata', sebep: `mailbox-mcp bulunamadi (${cli})` })
    let kanonik
    try { kanonik = require(path.join(kok, 'tools', 'wrongstack-mcp', 'posta-kutusu.cjs')).kanonikKok(kok) } catch (e) {
      return coz({ durum: 'hata', sebep: `posta-kutusu.cjs yuklenemedi (${(e && e.code) || 'hata'})` })
    }
    let p
    try {
      // --writable: `mailbox_manage send` yalnız yazılabilir kipte açılır. Actor sabit ve gönderene özgü.
      p = spawn(process.execPath, [cli, '--project-root', kanonik, '--actor', 'departman-kapat', '--writable', '--stdio'], {
        stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true,
      })
    } catch (e) {
      return coz({ durum: 'hata', sebep: (e && e.code) || 'baslatilamadi' })
    }
    let bitti = false
    const son = (s) => {
      if (bitti) return
      bitti = true
      clearTimeout(zaman)
      try { p.kill() } catch { /* zaten kapali */ }
      coz(s)
    }
    const zaman = setTimeout(() => son({ durum: 'hata', sebep: `zaman asimi ${zamanAsimiMs} ms` }), zamanAsimiMs)
    p.on('error', (e) => son({ durum: 'hata', sebep: (e && e.code) || 'surec hatasi' }))
    p.on('exit', () => son({ durum: 'hata', sebep: 'sunucu cevapsiz kapandi' }))
    const yaz = (m) => { try { p.stdin.write(JSON.stringify(m) + '\n') } catch { /* sunucu kapandi: exit kolu bildirir */ } }
    let tampon = ''
    p.stdout.on('data', (d) => {
      tampon += d
      let i
      while ((i = tampon.indexOf('\n')) >= 0) {
        const satir = tampon.slice(0, i).trim()
        tampon = tampon.slice(i + 1)
        if (!satir) continue
        let m
        try { m = JSON.parse(satir) } catch { continue }
        if (m.id === 1) {
          yaz({ jsonrpc: '2.0', method: 'notifications/initialized' })
          yaz({
            jsonrpc: '2.0', id: 2, method: 'tools/call',
            params: { name: 'mailbox_manage', arguments: { action: 'send', type: 'ask', to: sid, subject: POSTA_KONU, body: POSTA_GOVDE } },
          })
        } else if (m.id === 2) {
          if (m.error || (m.result && m.result.isError)) {
            const ipucu = String((m.error && m.error.message) || (m.result && m.result.content && m.result.content[0] && m.result.content[0].text) || 'reddedildi')
            son({ durum: 'hata', sebep: `gonderim reddedildi: ${ipucu}`.slice(0, 160) })
          } else son({ durum: 'gonderildi' })
        }
      }
    })
    yaz({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'departman-kapat', version: '1' } } })
  })
}

/** İnsana verilecek talimat (karar `kapat` iken). ASCII: ps1 Windows PowerShell 5.1'de aynen basar. Saf. */
function talimatYaz(ad, sid) {
  return `SIMDI: "${ad}" penceresini/sekmesini ELLE kapat (sid ${String(sid).slice(0, 8)}). Bu betik hicbir sureci sonlandirmaz; kapatma insan eylemidir.`
}

/** Kapı: durum dosyası taze mi (≤ DURUM_TAZE_DK) ve pencere boşta mı? Saf. */
function kapiDegerlendir(durum, hedef) {
  if (!durum) return { acik: false, sebep: 'durum-yok', mesaj: 'durum dosyasi BULUNAMADI — kapatilmadi' }
  if (durum.yasDk > ortak.DURUM_TAZE_DK) {
    return { acik: false, sebep: 'gunluk-bayat', mesaj: `gunluk bayat: ${durum.ad} ${durum.yasDk} dk once guncellenmis (esik ${ortak.DURUM_TAZE_DK} dk) — kapatilmadi` }
  }
  if (hedef && hedef.status === 'busy') {
    return { acik: false, sebep: 'meshgul', mesaj: 'pencere MESGUL (busy) — is ortasinda kapatilmaz; bosta olunca tekrar dene — kapatilmadi' }
  }
  return { acik: true, sebep: 'taze-ve-bosta', mesaj: `durum dosyasi taze (${durum.ad}, ${durum.yasDk} dk once) ve pencere bosta` }
}

/**
 * PLAN. `o`: {kuru, istekAtla, bekleSn, postaGonder (test enjekte eder), uyu}. Süreç SONLANDIRMAZ; `kapat` kararında `talimat` döner.
 * @returns {Promise<object>} `{karar:'kapat'|'kapatma'|'zaten-kapali'|'hata', ...}`
 */
async function planla(rolArg, o = {}) {
  const rol = ortak.rolCoz(String(rolArg || ''))
  if (!rol) {
    return { karar: 'hata', sebep: `rol taninmiyor: "${rolArg || ''}" (tablo scripts/board/pencere-adlari.cjs) — gecerli roller: ${ortak.gecerliRoller()}` }
  }
  const tara = ortak.panoTara()
  const uyarilar = [...tara.uyarilar]
  const son = ortak.sonSid(tara.claims, rol.serit)
  if (!son) return { karar: 'hata', sebep: `${rol.ad} icin panoda gecmis oturum yok — kapatilacak pencere BILINMIYOR`, ad: rol.ad, uyarilar }

  let acik = ortak.acikPencereler()
  uyarilar.push(...acik.uyarilar)
  let hedef = acik.liste.find((p) => p.sid === son.sid)
  if (!hedef) {
    return { karar: 'zaten-kapali', ad: rol.ad, serit: rol.serit, sid: son.sid, uyarilar, mesaj: `zaten kapali: ${rol.ad} (${son.sid.slice(0, 8)})` }
  }
  // Hedef doğrulama: tek pid, ana pencere. Alt süreç/gözlemci ya da pid'siz kayıt ASLA hedef olmaz.
  if (hedef.altSurec || !Number.isInteger(hedef.pid) || hedef.pid <= 0) {
    return { karar: 'hata', sebep: `hedef pencere kapatilamaz: ana pencere degil ya da pid yok (${hedef.name || '?'}, pid=${hedef.pid})`, ad: rol.ad, sid: son.sid, uyarilar }
  }

  const kok = process.env.VENTHUB_ANA_KOK || anaKok()
  const taban = { ad: rol.ad, serit: rol.serit, sid: son.sid, pid: hedef.pid, kuru: !!o.kuru, uyarilar }
  let durum = ortak.durumBul(son.sid, Date.now(), o.projeDizini)

  if (o.kuru) {
    const k = kapiDegerlendir(durum, hedef)
    return {
      ...taban, karar: k.acik ? 'kapat' : 'kapatma', sebep: k.sebep, durum, posta: { durum: 'kuru-gonderilmedi' },
      ...(k.acik ? { talimat: talimatYaz(rol.ad, son.sid) } : {}),
      mesaj: `KURU: ${k.acik ? 'KAPATILIRDI' : 'KAPATILMAZDI'} — ${k.mesaj}`,
    }
  }

  let posta = { durum: 'atlandi' }
  if (!o.istekAtla) {
    posta = await (o.postaGonder || postaGonder)(son.sid, kok)
    if (posta.durum !== 'gonderildi') uyarilar.push(`durum dosyasi istegi GONDERILEMEDI (${posta.sebep}) — yalniz mevcut durum dosyasina bakilacak`)
  }

  // Bayatsa taze olmasını bekle (yalnız istek atıldıysa anlamlı; atılmadıysa beklemek boşuna).
  const bekleMs = (Number.isFinite(o.bekleSn) ? o.bekleSn : BEKLE_SN_VARSAYILAN) * 1000
  const bitis = Date.now() + (posta.durum === 'gonderildi' ? bekleMs : 0)
  let kapi = kapiDegerlendir(durum, hedef)
  while (!kapi.acik && kapi.sebep !== 'meshgul' && Date.now() < bitis) {
    await (o.uyu || uyu)(YOKLAMA_ARALIK_MS)
    durum = ortak.durumBul(son.sid, Date.now(), o.projeDizini)
    kapi = kapiDegerlendir(durum, hedef)
  }
  // Son karardan hemen önce pencerenin durumu YENİDEN ölçülür (bekleme sırasında meşgul olmuş olabilir; pid de değişmiş olabilir).
  acik = ortak.acikPencereler()
  hedef = acik.liste.find((p) => p.sid === son.sid)
  if (!hedef) return { ...taban, karar: 'zaten-kapali', uyarilar, mesaj: `zaten kapali: ${rol.ad} (${son.sid.slice(0, 8)})` }
  if (hedef.pid !== taban.pid) return { ...taban, karar: 'hata', sebep: `pid degisti (${taban.pid} → ${hedef.pid}) — kapatilmadi`, uyarilar }
  kapi = kapiDegerlendir(durum, hedef)
  return {
    ...taban, karar: kapi.acik ? 'kapat' : 'kapatma', sebep: kapi.sebep, durum, posta, mesaj: kapi.mesaj,
    ...(kapi.acik ? { talimat: talimatYaz(rol.ad, son.sid) } : {}),
  }
}

async function main(argv) {
  const { bayrak, konum } = ortak.argvAyristir(argv, ['--bekle-sn'])
  const bekle = bayrak.has('--bekle-sn') ? Number(bayrak.get('--bekle-sn')) : undefined
  if (bayrak.has('--bekle-sn') && !(Number.isFinite(bekle) && bekle >= 0)) {
    process.stderr.write('HATA: --bekle-sn negatif olmayan bir sayi olmali\n')
    return 1
  }
  const plan = await planla(konum.join(' '), { kuru: bayrak.has('--kuru'), istekAtla: bayrak.has('--istek-atla'), bekleSn: bekle })
  if (bayrak.has('--json')) {
    process.stdout.write(ortak.asciiJson(plan) + '\n')
  } else if (plan.karar === 'hata') {
    process.stderr.write(`HATA: ${plan.sebep}\n`)
  } else {
    for (const u of plan.uyarilar || []) process.stdout.write(`uyari: ${u}\n`)
    process.stdout.write((plan.mesaj || plan.karar) + '\n')
    if (plan.karar === 'kapat') process.stdout.write(`hedef: ${plan.ad} sid=${plan.sid} pid=${plan.pid} (KAPATILABILIR)\n${plan.talimat}\n`)
  }
  return plan.karar === 'hata' || plan.karar === 'kapatma' ? 1 : 0
}

module.exports = { planla, postaGonder, kapiDegerlendir, talimatYaz, POSTA_KONU, POSTA_GOVDE }

if (require.main === module) {
  main(process.argv.slice(2)).then((k) => process.exit(k), (e) => {
    process.stderr.write(`HATA: beklenmeyen: ${(e && e.message) || e}\n`)
    process.exit(1)
  })
}
