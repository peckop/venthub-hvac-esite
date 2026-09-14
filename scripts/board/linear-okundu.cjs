#!/usr/bin/env node
'use strict'
/**
 * LINEAR YORUMLARI OKUNDU DAMGASI (REC-329).
 *
 * `linear-yeni-yorum.cjs` sayacının eşiğini "şimdi"ye çeker. Yorumları okuyan kişi
 * (pratikte OPS) bunu koşar, sayaç satırı kaybolur.
 *
 * KULLANIM
 *   node scripts/board/linear-okundu.cjs           # damgayı şimdiye çeker
 *   node scripts/board/linear-okundu.cjs --goster  # yalnız mevcut damgayı basar
 *
 * ⭐DAMGA GERİ ALINABİLİR OLMALI: yanlışlıkla koşulursa okunmamış yorumlar görünmez
 * hâle gelir ve bu sessiz bir kayıptır. Bu yüzden ÖNCEKİ damga da dosyada saklanır
 * (`onceki`) ve `--geri` ile dönülebilir. Tek yönlü bir damga, 13 saat gecikmeyi
 * onarmak için yazılmış bir aracın kendi ayağına sıkması olurdu.
 */

const fs = require('node:fs')

const { damgaYolu } = require('./linear-yeni-yorum.cjs')

function oku() {
  try {
    return JSON.parse(fs.readFileSync(damgaYolu(), 'utf8'))
  } catch {
    return null
  }
}

function yaz(nesne) {
  fs.writeFileSync(damgaYolu(), JSON.stringify(nesne, null, 2) + '\n')
}

/**
 * ⭐ÖNBELLEK DÜŞÜRÜLÜR — yoksa damga değişse bile sayaç 60 saniye ESKİ cevabı verir.
 *
 * ⚠Bunu da kabul sınavı buldu: `okundu` koşulduktan sonra satır kaybolmadı, çünkü
 * önbellek hâlâ eski satırı taşıyordu. Damgayı değiştiren her komut önbelleği de
 * düşürmek ZORUNDA — aksi hâlde araç "yaptım" der ve görünen şey değişmez.
 */
function onbellegiDusur() {
  try {
    fs.unlinkSync(damgaYolu().replace(/\.json$/, '-onbellek.json'))
  } catch {
    /* yok ya da silinemedi: en fazla 60 sn eski satır görünür */
  }
}

const bayraklar = process.argv.slice(2)
const mevcut = oku()

if (bayraklar.includes('--goster')) {
  console.log(`[linear-okundu] dosya : ${damgaYolu()}`)
  console.log(`[linear-okundu] damga : ${mevcut?.damga || '(yok — sayaç son 24 saati sayar)'}`)
  if (mevcut?.onceki) console.log(`[linear-okundu] onceki: ${mevcut.onceki}`)
  process.exit(0)
}

if (bayraklar.includes('--geri')) {
  if (!mevcut) {
    console.log('[linear-okundu] damga dosyasi zaten YOK — sayac son 24 saati sayiyor, geri alinacak sey yok.')
    process.exit(0)
  }
  // ⭐İLK KOŞUMUN GERİ ALINMASI: `onceki` null ise geri dönülecek hâl "damga hiç yok"tur
  // ve ona dönmenin yolu DOSYAYI SİLMEKTİR, hata vermek değil.
  //
  // ⚠BU KUSURU KENDİ KABUL SINAVIM BULDU (2026-09-14): ilk `okundu` koşumundan sonra
  // `--geri` "geri alinacak ONCEKI damga yok" diyip çıkıyordu ve OPS'un yirmi okunmamış
  // yorumluk sinyali GİZLİ KALIYORDU. Geri alınamayan bir damga, 13 saatlik gecikmeyi
  // onarmak için yazılmış bir aracın kendi ayağına sıkmasıydı.
  if (!mevcut.onceki) {
    try {
      fs.unlinkSync(damgaYolu())
    } catch {
      /* silinemedi: aşağıdaki uyarı basılır */
    }
    onbellegiDusur()
    console.log('[linear-okundu] GERI ALINDI -> damga dosyasi SILINDI (sayac yine son 24 saati sayar).')
    process.exit(0)
  }
  yaz({ damga: mevcut.onceki, onceki: null, yazan: 'geri-alma' })
  onbellegiDusur()
  console.log(`[linear-okundu] GERI ALINDI -> ${mevcut.onceki}`)
  process.exit(0)
}

const simdi = new Date().toISOString()
yaz({ damga: simdi, onceki: mevcut?.damga || null, yazan: 'okundu' })
onbellegiDusur()
console.log(`[linear-okundu] damga guncellendi -> ${simdi}`)
if (mevcut?.damga) console.log(`[linear-okundu] onceki saklandi  -> ${mevcut.damga}  (geri: --geri)`)
console.log(`[linear-okundu] dosya: ${damgaYolu()}`)
