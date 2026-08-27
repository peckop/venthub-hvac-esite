#!/usr/bin/env node
'use strict'

/**
 * scripts/hijyen/kirli-sayac.cjs — VS Code kaynak-denetimi ROZETİNİN CLI KARŞILIĞI (REC-84 Kol-4)
 *
 * NİÇİN VAR — ölçülmüş vaka, tahmin değil (2026-08-27):
 * Recep ekranındaki rozette "520" gördü ve sordu: "bu ne, nereden geliyor?" Cevabı verebilmek
 * için EKRAN GÖRÜNTÜSÜ gerekti — yani filo, kendi kirliliğini kendi ölçemiyordu. Sayı bir
 * insanın gözüyle okunup ajana yazıldı. Bu betik o bağımlılığı kaldırır: aynı sayı, komutla.
 *
 * ⭐ROZETİN NEYİ SAYDIĞI ÖLÇÜLDÜ, VARSAYILMADI — ve ilk tahmin YANLIŞTI:
 * "Rozet ana dizini gösteriyor" sanılabilir. Ana dizin o an 9 satırdı, rozet 520. Rozet
 * AÇIK OLAN TÜM köklerin toplamıdır ve bu depoda 31 worktree var. Ölçüm:
 *
 *     tüm ağaçlar, `status --porcelain`               = 522   <-- rozetle örtüşen
 *     tüm ağaçlar, `status --porcelain -uall`         = 550
 *     yalnız ana dizin                                =   9
 *
 * Aradaki 28 fark TEK BAŞINA `.playwright-mcp/` idi: izlenmeyen bir DİZİN porcelain'de TEK
 * satıra katlanır, içindeki 31 dosya ayrı ayrı sayılmaz. Yani "dosya sayısı" ile "rozet
 * sayısı" AYNI ŞEY DEĞİL. Bu betik İKİSİNİ DE basar ve hangisinin rozetle karşılaştırılacağını
 * söyler — tek sayı basmak, ölçütü seçen kişiyi görünmez kılardı.
 *
 * SINIRI — ADIYLA: rozet yalnız VS Code'da O AN AÇIK olan klasörleri toplar. Bu betik
 * `git worktree list`teki HEPSİNİ toplar. Recep'in rozetinde 3 klasör açıksa sayı düşük
 * çıkar; sapma budur ve rozetle bire bir eşitlik BEKLENMEZ. Karşılaştırırken açık kök
 * sayısı sorulur (`--only` ile daraltılabilir).
 *
 * KULLANIM:
 *   node scripts/hijyen/kirli-sayac.cjs                 # tablo + toplam
 *   node scripts/hijyen/kirli-sayac.cjs --detay         # her ağacın dosyalarını da bas
 *   node scripts/hijyen/kirli-sayac.cjs --json          # makine okunur
 *   node scripts/hijyen/kirli-sayac.cjs --only vh-,ops- # yol parçasına göre süz
 *   node scripts/hijyen/kirli-sayac.cjs --esik 50       # toplam eşiği aşarsa çıkış kodu 1
 *   node scripts/hijyen/kirli-sayac.cjs --taban-yaz     # TRENDİ SIFIRLAR — bilerek, elle
 *
 * TREND — NİÇİN AĞAÇ BAŞI, NİÇİN TOPLAM DEĞİL:
 * Toplam sayı ters gideni GİZLER. İki ağaç -10 temizlenirken bir ağaç +12 büyürse toplam
 * +2 görünür ve büyüyen ağaç fark edilmez. Bu ölçülmüş bir tuzaktır (2026-08-27, I18N:
 * toplam "+7.705 bayt kazanç" derken iki dosyada içerik YARIYA düşmüştü). Bu yüzden taban
 * AĞAÇ BAŞI tutulur ve rapor büyüyeni ADIYLA söyler.
 *
 * Taban: `scripts/hijyen/kirli-sayac-taban.json`, YALNIZ `--taban-yaz` ile tazelenir.
 * Otomatik tazeleme kasten YOK: her koşumda taban güncellenseydi betik her gün "0 değişim"
 * derdi — yani tam da ölçmek için var olduğu şeyi hiçbir zaman görmezdi.
 */

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const argv = process.argv.slice(2)
const bayrak = (ad) => argv.includes(ad)
const deger = (ad) => {
  const i = argv.indexOf(ad)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null
}

const DETAY = bayrak('--detay')
const JSON_CIKTI = bayrak('--json')
const ONLY = (deger('--only') || '').split(',').map((s) => s.trim()).filter(Boolean)
const ESIK = deger('--esik') !== null ? Number(deger('--esik')) : null
const TABAN_YAZ = bayrak('--taban-yaz')

const TABAN_YOLU = path.join(__dirname, 'kirli-sayac-taban.json')

/**
 * Taban okunamazsa SESSİZ GEÇİLMEZ. Eksik taban, "değişim yok" ile aynı ekranı üretirse
 * trend öldüğünde kimse fark etmez — bu betiğin önlemek için var olduğu sınıfın ta kendisi.
 * Bu yüzden okunamama hâli SEBEBİYLE BİRLİKTE basılır ve trend sütunu açıkça kapatılır.
 */
function tabanOku() {
  try {
    const t = JSON.parse(fs.readFileSync(TABAN_YOLU, 'utf8'))
    if (!t || typeof t.agaclar !== 'object' || t.agaclar === null) {
      return { yok: true, sebep: 'agaclar alani yok ya da bozuk' }
    }
    return t
  } catch (e) {
    return { yok: true, sebep: (e && e.code) || String(e) }
  }
}

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd: cwd || process.cwd(),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  })
}

/**
 * `git worktree list --porcelain` KASITLI tercih: insan-okunur `git worktree list` çıktısı
 * sütunları BOŞLUKLA ayırır ve boşluk içeren bir yol (Windows'ta olağan) satırı sessizce
 * yanlış böler. Porcelain biçimi `worktree <yol>` verir — yolun tamamı satırın kalanıdır.
 */
function agaclar() {
  let cikti
  try {
    cikti = git(['worktree', 'list', '--porcelain'])
  } catch (e) {
    console.error('HATA: git worktree list basarisiz — bir git deposunda misiniz?')
    process.exit(2)
  }
  const liste = []
  for (const satir of cikti.split('\n')) {
    if (satir.startsWith('worktree ')) liste.push(satir.slice('worktree '.length).trim())
  }
  return liste
}

/**
 * Ölü/erişilemez ağaç SESSİZ GEÇİLMEZ. `worktree list` diskten silinmiş bir ağacı hâlâ
 * listeler (prune edilene kadar); onu 0 saymak "temizlendi" yanılsaması üretir — tam da bu
 * betiğin önlemesi gereken şey. Erişilemeyen ağaç ERISILEMEDI olarak AYRI raporlanır.
 */
function agacDurumu(wt) {
  let kisa, tam
  try {
    kisa = git(['status', '--porcelain'], wt)
    tam = git(['status', '--porcelain', '--untracked-files=all'], wt)
  } catch (e) {
    return { erisilemedi: true }
  }
  const kisaSatir = kisa.split('\n').filter((s) => s.trim().length > 0)
  const tamSatir = tam.split('\n').filter((s) => s.trim().length > 0)
  const izlenmeyen = kisaSatir.filter((s) => s.startsWith('??'))
  return {
    erisilemedi: false,
    rozet: kisaSatir.length,
    dosya: tamSatir.length,
    izlenenKirli: kisaSatir.length - izlenmeyen.length,
    izlenmeyen: izlenmeyen.length,
    satirlar: tamSatir,
  }
}

const hepsi = agaclar()
const secili = ONLY.length ? hepsi.filter((w) => ONLY.some((p) => w.includes(p))) : hepsi

const satirlar = []
let toplamRozet = 0
let toplamDosya = 0
let erisilemeyen = 0

for (const wt of secili) {
  const d = agacDurumu(wt)
  if (d.erisilemedi) {
    erisilemeyen++
    satirlar.push({ agac: wt, erisilemedi: true })
    continue
  }
  toplamRozet += d.rozet
  toplamDosya += d.dosya
  satirlar.push({
    agac: wt,
    rozet: d.rozet,
    dosya: d.dosya,
    izlenenKirli: d.izlenenKirli,
    izlenmeyen: d.izlenmeyen,
    satirlar: d.satirlar,
  })
}

/**
 * BİLEŞİM — "bu sayı NEDEN bu kadar?" sorusunun cevabı, ve ÇOĞU ZAMAN ASIL CEVAP BUDUR.
 *
 * NİÇİN VAR (2026-08-27, aynı gün ÜÇ KEZ elle hesapladım): Recep "hâlâ 521?" diye sordu.
 * Doğru cevap toplam değil bileşimdi — 521'in 384'ü companion `.md` churn'ü, 120'si
 * `.archive` EOL fantomu, 16'sı `system_tree`. Yani sayı "birikmiş çöp" değil, kancaların
 * SÜREKLİ ÜRETTİĞİ churn'dü ve elle temizlikle düşmezdi. Bu ayrımı görmeden verilen her
 * cevap ("temizledim", "az kaldı") yanıltıcı oluyordu.
 *
 * ⚠ VE BİR DÜZELTME DAHA, aynı gün ölçüldü: bir sınıfın onarımı master'a inince bu sayı
 * HEMEN düşmez. Rozet AĞAÇLARIN TOPLAMIDIR; her ağaç kendi tabanıyla durur ve düzeltmeyi
 * ancak tabanını tazeleyince alır. #871 (.archive onarımı) indi, sayı 521'den 524'e ÇIKTI —
 * çünkü fantomu taşıyan üç ağaç sırasıyla 3, 73 ve 193 commit geride kalmıştı. Etkinin
 * göründüğü yer merge ANI değil, ADOPSİYON EĞRİSİdir. Bu yüzden bileşim raporu sınıfın
 * yanında "kaç ağaçta ve o ağaçlar ne kadar geride" bilgisini de basar.
 */
function bilesimHesapla(satirlar) {
  const sinifSay = { md: 0, arsivEol: 0, systemTree: 0, diger: 0 }
  const sinifAgac = { md: new Set(), arsivEol: new Set(), systemTree: new Set(), diger: new Set() }
  for (const s of satirlar) {
    if (s.erisilemedi) continue
    const ad = path.basename(s.agac)
    for (const satir of s.satirlar) {
      const yol = satir.slice(3).trim()
      let k
      if (yol.includes('.archive/legacy_superpowers_artifacts')) k = 'arsivEol'
      else if (yol.endsWith('docs/system_tree.md')) k = 'systemTree'
      else if (yol.endsWith('.md')) k = 'md'
      else k = 'diger'
      sinifSay[k]++
      sinifAgac[k].add(ad)
    }
  }
  return { sinifSay, sinifAgac }
}

/**
 * TREND. `--only` verildiğinde toplam karşılaştırması KASTEN yapılmaz: taban tüm ağaçların
 * fotoğrafıdır, süzülmüş bir toplamla kıyaslamak "170 düştü" gibi sahte bir kazanç basardı.
 * Ağaç başı deltalar süzgeçle de anlamlı olduğu için onlar korunur.
 */
const taban = tabanOku()
const trendVar = !taban.yok
const delta = new Map()
let yeniAgac = []
let gitmisAgac = []

if (trendVar) {
  for (const s of satirlar) {
    if (s.erisilemedi) continue
    const isim = path.basename(s.agac)
    const eski = taban.agaclar[isim]
    if (eski === undefined) yeniAgac.push({ isim, simdi: s.rozet })
    else delta.set(isim, s.rozet - eski)
  }
  const mevcut = new Set(satirlar.filter((s) => !s.erisilemedi).map((s) => path.basename(s.agac)))
  gitmisAgac = Object.keys(taban.agaclar).filter((a) => !mevcut.has(a))
}

if (TABAN_YAZ) {
  if (ONLY.length) {
    console.error('REDDEDILDI: --taban-yaz ile --only birlikte KULLANILAMAZ.')
    console.error('Suzulmus bir fotograf taban olarak yazilirsa, listede olmayan her agac')
    console.error('sonraki kosumda "YENI" gorunur ve trend sessizce anlamini yitirir.')
    process.exit(2)
  }
  const yeni = {
    _nicin: (taban && taban._nicin) || 'Rozet buyudugunde HANGI AGACTAN buyudugu gorunsun diye.',
    _olcut: 'git status --porcelain — dizinler KATLANMIS (rozetle karsilastirilan sayi budur).',
    _anahtar: 'Agac ADI (basename), tam yol DEGIL.',
    _tazeleme: "SADECE 'node scripts/hijyen/kirli-sayac.cjs --taban-yaz' ile, ELLE.",
    olculdu: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    olcen: 'kirli-sayac.cjs --taban-yaz',
    onceki_taban: (taban && taban.olculdu) || null,
    toplam: toplamRozet,
    agaclar: Object.fromEntries(
      satirlar.filter((s) => !s.erisilemedi).map((s) => [path.basename(s.agac), s.rozet])
    ),
  }
  fs.writeFileSync(TABAN_YOLU, JSON.stringify(yeni, null, 2) + '\n', 'utf8')
  console.log('TABAN YENIDEN YAZILDI: ' + TABAN_YOLU)
  console.log('  onceki taban: ' + (yeni.onceki_taban || '(yok)') + ' -> ' + yeni.olculdu)
  console.log('  toplam      : ' + ((taban && taban.toplam) || '?') + ' -> ' + toplamRozet)
  console.log('  ⚠ TREND SIFIRLANDI — bundan sonraki deltalar bu fotografa gore olculur.')
  process.exit(0)
}

if (JSON_CIKTI) {
  console.log(
    JSON.stringify(
      {
        agacSayisi: secili.length,
        erisilemeyen,
        toplamRozet,
        toplamDosya,
        taban: trendVar
          ? { olculdu: taban.olculdu, toplam: taban.toplam, fark: ONLY.length ? null : toplamRozet - taban.toplam }
          : { yok: true, sebep: taban.sebep },
        agaclar: satirlar.map((s) => {
          const isim = path.basename(s.agac)
          return {
            ...s,
            satirlar: DETAY ? s.satirlar : undefined,
            fark: delta.has(isim) ? delta.get(isim) : null,
            yeni: yeniAgac.some((y) => y.isim === isim) || undefined,
          }
        }),
        gitmisAgaclar: gitmisAgac,
      },
      null,
      2
    )
  )
} else {
  console.log('== KIRLI SAYAC — VS Code rozetinin CLI karsiligi ==')
  console.log('')
  console.log('  ROZET  DOSYA  IZLENEN  IZLENMEYEN  AGAC')
  for (const s of satirlar) {
    if (s.erisilemedi) {
      console.log('      ?      ?        ?           ?  ' + s.agac + '   <-- ERISILEMEDI (prune adayi)')
      continue
    }
    const isim = path.basename(s.agac)
    let trendStr = ''
    if (trendVar) {
      if (delta.has(isim)) {
        const d = delta.get(isim)
        trendStr = d === 0 ? '      ·' : (d > 0 ? '     +' : '     ') + d
      } else {
        trendStr = '   YENI'
      }
    }
    console.log(
      String(s.rozet).padStart(7) +
        String(s.dosya).padStart(7) +
        String(s.izlenenKirli).padStart(9) +
        String(s.izlenmeyen).padStart(12) +
        trendStr.padStart(trendVar ? 8 : 0) +
        '  ' +
        isim +
        (s.rozet === 0 ? '' : '   (' + s.agac + ')')
    )
    if (DETAY && s.satirlar.length) {
      for (const l of s.satirlar) console.log('           ' + l)
    }
  }
  console.log('')
  console.log('  TOPLAM ROZET (status --porcelain, dizinler KATLANMIS) : ' + toplamRozet)
  console.log('  TOPLAM DOSYA (--untracked-files=all, dosya dosya)     : ' + toplamDosya)
  console.log('  AGAC SAYISI: ' + secili.length + (erisilemeyen ? '  ERISILEMEYEN: ' + erisilemeyen : ''))
  console.log('')

  if (!trendVar) {
    console.log('  ⚠ TREND KAPALI — taban okunamadi (' + taban.sebep + ').')
    console.log('    Dosya: ' + TABAN_YOLU)
    console.log('    Bunu sessiz gecmiyoruz: eksik taban "degisim yok" ile ayni ekrani uretirdi.')
  } else {
    console.log('  == TREND (taban ' + taban.olculdu + ') ==')
    if (ONLY.length) {
      console.log('    Toplam karsilastirmasi ATLANDI — --only ile suzdun, taban TUM agaclarin')
      console.log('    fotografi. Suzulmus toplami tabanla kiyaslamak sahte kazanc basardi.')
    } else {
      const fark = toplamRozet - taban.toplam
      console.log(
        '    TOPLAM: ' + taban.toplam + ' -> ' + toplamRozet +
          '  (' + (fark > 0 ? '+' : '') + fark + ')'
      )
    }
    const buyuyen = [...delta.entries()].filter(([, d]) => d > 0).sort((a, b) => b[1] - a[1])
    const dusen = [...delta.entries()].filter(([, d]) => d < 0).sort((a, b) => a[1] - b[1])
    if (buyuyen.length) {
      console.log('    BUYUYEN: ' + buyuyen.map(([a, d]) => a + ' +' + d).join(' · '))
    }
    if (dusen.length) {
      console.log('    DUSEN  : ' + dusen.map(([a, d]) => a + ' ' + d).join(' · '))
    }
    if (!buyuyen.length && !dusen.length) console.log('    Agac basi degisim YOK.')
    if (yeniAgac.length) {
      console.log('    YENI AGAC: ' + yeniAgac.map((y) => y.isim + ' (' + y.simdi + ')').join(' · '))
    }
    if (gitmisAgac.length) {
      console.log('    GITMIS AGAC: ' + gitmisAgac.join(' · ') + '  — tabanda vardi, artik yok.')
    }
    console.log('    ⭐Toplama degil BUYUYEN satirina bak: toplam ters gideni gizler.')
    console.log('    Tabani tazelemek TRENDI SIFIRLAR; bilerek yap: --taban-yaz')
  }
  const { sinifSay, sinifAgac } = bilesimHesapla(satirlar)
  const gerideKalan = (adlar) =>
    [...adlar]
      .map((ad) => {
        const s = satirlar.find((x) => !x.erisilemedi && path.basename(x.agac) === ad)
        if (!s) return null
        try {
          return { ad, geride: Number(git(['rev-list', '--count', 'HEAD..origin/master'], s.agac).trim()) }
        } catch {
          return { ad, geride: null }
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b.geride || 0) - (a.geride || 0))

  console.log('  == BILESIM — "bu sayi NEDEN bu kadar" (cogu zaman ASIL cevap budur) ==')
  const sinifAd = {
    md: 'companion .md churn (kancalar her commit te URETIR)',
    arsivEol: '.archive EOL fantomu',
    systemTree: 'docs/system_tree.md (agac-yerel, commit EDILEMEZ)',
    diger: 'diger',
  }
  for (const k of ['md', 'arsivEol', 'systemTree', 'diger']) {
    if (!sinifSay[k]) continue
    const pay = Math.round((sinifSay[k] / toplamRozet) * 100)
    console.log(
      '    ' + String(sinifSay[k]).padStart(4) + ' (%' + String(pay).padStart(2) + ')  ' +
        sinifAd[k] + '  — ' + sinifAgac[k].size + ' agacta'
    )
    if (k === 'arsivEol' || k === 'systemTree') {
      const gk = gerideKalan(sinifAgac[k]).filter((x) => x.geride === null || x.geride > 0)
      if (gk.length) {
        console.log(
          '           ⚠ onarim master da olsa bu agaclar ALMAMIS (taban geride): ' +
            gk.map((x) => x.ad + ' ' + (x.geride === null ? '?' : '-' + x.geride)).join(' · ')
        )
      }
    }
  }
  console.log('    ⭐Bir sinifin onarimi master a inince bu sayi HEMEN dusmez: rozet AGAC')
  console.log('      TOPLAMIDIR, her agac duzeltmeyi TABANINI TAZELEYINCE alir. Etkinin')
  console.log('      gorundugu yer merge ANI degil ADOPSIYON EGRISIDIR (08-27 olculdu:')
  console.log('      #871 indi, sayi 521 -> 524 CIKTI; uc agac 3/73/193 commit gerideydi).')
  console.log('')
  console.log('  Recep in rozetiyle karsilastirilacak sayi ROZET sutunudur.')
  console.log('  Rozet YALNIZ VS Code ta ACIK olan kokleri toplar; burada TUM agaclar var.')
  console.log('  Sapma gorursen once "kac klasor acik" diye sor, sonra --only ile darabilirsin.')
}

if (ESIK !== null && toplamRozet > ESIK) {
  console.error('')
  console.error('ESIK ASILDI: toplam rozet ' + toplamRozet + ' > ' + ESIK)
  process.exit(1)
}
