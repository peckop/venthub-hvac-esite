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
 */

const { execFileSync } = require('child_process')
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

if (JSON_CIKTI) {
  console.log(
    JSON.stringify(
      {
        agacSayisi: secili.length,
        erisilemeyen,
        toplamRozet,
        toplamDosya,
        agaclar: satirlar.map((s) => (DETAY ? s : { ...s, satirlar: undefined })),
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
    console.log(
      String(s.rozet).padStart(7) +
        String(s.dosya).padStart(7) +
        String(s.izlenenKirli).padStart(9) +
        String(s.izlenmeyen).padStart(12) +
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
  console.log('  Recep in rozetiyle karsilastirilacak sayi ROZET sutunudur.')
  console.log('  Rozet YALNIZ VS Code ta ACIK olan kokleri toplar; burada 31 agacin hepsi var.')
  console.log('  Sapma gorursen once "kac klasor acik" diye sor, sonra --only ile darabilirsin.')
}

if (ESIK !== null && toplamRozet > ESIK) {
  console.error('')
  console.error('ESIK ASILDI: toplam rozet ' + toplamRozet + ' > ' + ESIK)
  process.exit(1)
}
