#!/usr/bin/env node
'use strict'

/**
 * scripts/board/mechanism-setup.cjs — MEKANİK OTONOMİ kurulumu ve DOĞRULAMASI (T115-VH)
 *
 * NİÇİN VAR — ölçülmüş vaka, tahmin değil:
 * 2026-08-20 sabahı DÖRT oturum panoya sağır kaldı. Sağırlığın bedeli Recep'in her oturumu elle
 * dürtmesi oldu. Daha keskin olan ikinci vaka bu şeridin kendisidir: hayatta-kalma katmanını
 * mekanikleştirmekle görevli şerit, KENDİ hayatta-kalma katmanını talimatla kurmadı — talimat
 * DÖRT kanaldan ulaştı (pano notu, sıralı emir, hafıza dosyası, kendi raporum) ve kurulum
 * üretmedi. Ders: **talimat davranış üretmez; mekanizma üretir.**
 *
 * BU BETİĞİN SINIRI — ADIYLA:
 * Gözcü (Monitor), cron (CronCreate) ve tur-sonu uyanışı (ScheduleWakeup) AJAN ARAÇLARIDIR;
 * bir kabuk betiği onları KURAMAZ. Bu yüzden bu betik iki iş yapar ve üçüncüyü yaptığını
 * İDDİA ETMEZ:
 *   1) `plan`    — kurulumun tam metnini üretir (şerit tablosu burada SSOT'tur, hatırdan yazılmaz)
 *   2) `dogrula` — kurulumun GERÇEKTEN çalıştığını DIŞARIDAN ölçer
 *   3) kurulumun kendisini AJAN yapar — betik onu yapmış gibi davranmaz.
 *
 * İKİ ÖNKOŞUL KODA GÖMÜLÜ (ikisi de ölçülmüş kusurdan doğdu):
 *   (a) Çıktı akışı KODDA zorlanır (gozcu.cjs) — ortam değişkenine güvenmek I18N'in gözcüsünde
 *       U+2B50'yi sessizce düşürdü.
 *   (b) Doğrulama DIŞ OLAYLA yapılır, öz-testle değil — "kendi kendine test notu at" biçimindeki
 *       öz-test, kendi notlarını eleyen bir gözcüde TANIM GEREĞİ yanlış negatif verir.
 */

const fs = require('fs')
const path = require('path')

/**
 * IKI AD, TEK KAVRAM — OLCULMUS KUSUR (2026-08-23): bu dosya VENTHUB_PANO_DIR okuyordu,
 * board.cjs ise VENTHUB_BOARD_DIR (board.cjs:28). Panoyu bir kopyaya yonlendirip kanarya
 * kosturdugumda yonlendirme YARIM uygulandi: OKUMA kopyadan yapildi, YAZMA gercek panoya
 * gitti ve canli bir seride kanarya notu dustu. Yonlendirme "calisti" gorunuyordu cunku
 * yarisi tasinmisti — sessiz sizinti, cunku hicbir hata olusmadi.
 * Bu yuzden ikisi de kabul edilir ve board.cjs in okudugu ad ONCELIKLIDIR: tek bir degisken
 * ayarlamak butun katmani birlikte tasir.
 */
const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'

const arg = (ad) => {
  const i = process.argv.indexOf(ad)
  return i > -1 ? process.argv[i + 1] : undefined
}
const yaz = (s) => process.stdout.write(Buffer.from(String(s) + '\n', 'utf8'))

/**
 * ŞERİT CRON OFSET TABLOSU — SSOT.
 * Ofsetler ÇAKIŞMASIN diye atanmıştır: yedi şerit aynı dakikada uyanırsa hem kota hem pano
 * yazımı aynı ana yığılır. Bu tablo hatırdan yazılmaz, buradan okunur.
 */
const OFSETLER = {
  URUN: '1,21,41',
  I18N: '5,25,45',
  EDGE: '3,23,43',
  ADMIN: '7,27,47',
  ALTYAPI: '9,29,49',
  LEGAL: '11,31,51',
  PRICING: '13,33,53',
  AUTH: '15,35,55',
  ORION: '17,37,57',
  'OPS-AUDIT': '19,39,59',
  // TEMIZLIK (2026-08-28, REC-84 Kol-4). TEK ÇİFT TABANLI SATIR ve sebebi yazılı:
  // yukarıdaki on şerit 1..19 arası TEK dakikaların TAMAMINI tutuyor, yani tek-taban
  // havuzu TÜKENDİ. Çift tabanlar hiçbir tek tabanla çakışmaz, o yüzden yeni şeritler
  // buradan devam eder (sıradaki serbest: 4,24,44 · 6,26,46 ...).
  // Bu satırı ALTYAPI yazdı çünkü dosya onun claim'inde ve TEMIZLIK şeridinin gözcüsü
  // tablo olmadan KANITSIZ kalıyordu — adresli emir ulaşmayabilirdi. Sayı OPS'tan
  // gelmedi, çakışma kuralından TÜRETİLDİ ve OPS'a yazıldı; OPS başka değer derse değişir.
  TEMIZLIK: '2,22,42',
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const oldur = (mesaj) => {
  yaz('HATA: ' + mesaj)
  process.exit(2)
}

const sidAl = () => {
  const sid = arg('--sid') || process.env.CLAUDE_SESSION_ID
  if (!sid) oldur('--sid ZORUNLU.')
  if (!UUID.test(sid)) oldur('--sid tam uuid olmalı, alınan: ' + sid)
  return sid
}

const imlecYolu = (sid) => path.join(PANO, '.gozcu-imlec.' + sid.slice(0, 8) + '.json')
const durumYolu = (sid) => path.join(PANO, '.mekanizma-durum.' + sid.slice(0, 8) + '.json')

// ============================================================================ plan
function plan() {
  const sid = sidAl()
  const serit = String(arg('--serit') || arg('--lane') || '').toUpperCase()
  if (!serit) oldur('--serit ZORUNLU. Bilinenler: ' + Object.keys(OFSETLER).join(', '))
  const ofset = OFSETLER[serit]
  if (!ofset) {
    oldur(
      'BILINMEYEN SERIT: ' + serit + '. Tabloda yok demek OFSETI YOK demek; uydurma — ' +
        'once OPS-AUDIT ofset atasin, sonra bu tabloya YAZ. Bilinenler: ' +
        Object.keys(OFSETLER).join(', '),
    )
  }
  const kok = arg('--kok') || process.cwd()
  const gozcuYolu = path.join(kok, 'scripts', 'board', 'gozcu.cjs').replace(/\\/g, '/')

  yaz('== MEKANIK OTONOMI KURULUMU — ' + serit + ' (' + sid.slice(0, 8) + ') ==')
  yaz('')
  yaz('Uc katman da AYNI OTURUMDA yasar ve oturumla birlikte OLUR. Yeni oturumun ILK isi budur.')
  yaz('')
  yaz('1) GOZCU — persistent Monitor, komut satiri AYNEN:')
  yaz('   node "' + gozcuYolu + '" --sid ' + sid + ' --aralik 60')
  yaz('   Monitor(persistent: true), description: "panoda ' + serit + ' notlari"')
  yaz('')
  yaz('2) CRON — CronCreate, zamanlama AYNEN (ofset tablodan, hatirdan DEGIL):')
  yaz('   ' + ofset + ' * * * *')
  yaz('')
  yaz('3) TUR-SONU UYANIS — her turun sonunda ScheduleWakeup, 20-25 dk.')
  yaz('   Gozcu olurse sagir kalmamak icin IKINCI kanal; tek kanal yedeklilik degildir.')
  yaz('')
  yaz('KURULUMDAN SONRA — beyan yeterli DEGIL, mekanik kanit sart:')
  yaz('   node scripts/board/mechanism-setup.cjs prob --sid ' + sid)
  yaz('   node scripts/board/mechanism-setup.cjs dogrula --sid ' + sid + ' --cron <cron-id>')
}

// ============================================================================ prob
/**
 * AYIRT EDİCİ TEST: panoya DIŞ bir olay yazar ve gözcünün kalıcı imlecinin o olayın ÖTESİNE
 * geçmesini bekler. Gözcü çalışmıyorsa imleç ASLA ilerlemez — yani gözlem, mekanizma çalışmasa
 * FARKLI olur. Öz-test değildir: olayı yazan süreç gözcüden ayrıdır ve farklı bir sid kullanır
 * (gözcü kendi sid'ini eler; kendi kendine not atmak tanım gereği yanlış negatif verirdi).
 */
async function prob() {
  const sid = sidAl()
  const beklesn = Number(arg('--bekle') || 150)
  const iy = imlecYolu(sid)

  if (!fs.existsSync(iy)) {
    yaz('KIRMIZI — GOZCU KURULU DEGIL: imlec dosyasi yok (' + iy + ').')
    yaz('Once plan ciktisindaki Monitor komutunu kur, sonra bu testi tekrarla.')
    process.exit(1)
  }

  const jeton = 'PROB-' + sid.slice(0, 4) + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  const probSid = '00000000-0000-4000-8000-' + sid.replace(/-/g, '').slice(-12)
  const probDosya = 'events.mekanizma-probu.jsonl'
  const probTam = path.join(PANO, probDosya)

  const olay = {
    type: 'note',
    ts: new Date().toISOString(),
    sid: probSid,
    lane: 'MEKANIZMA-PROBU',
    to: sid,
    text:
      'MEKANIZMA PROBU — DIGER SERITLER YOK SAYIN. Jeton: ' + jeton +
      '. Bu not bir gozcunun canli olup olmadigini olcmek icin yazildi; is emri degil.',
  }
  fs.appendFileSync(probTam, JSON.stringify(olay) + '\n', 'utf8')
  const hedef = fs.statSync(probTam).size

  yaz('PROB YAZILDI: ' + probDosya + ' -> ' + hedef + ' bayt, jeton ' + jeton)
  yaz('Gozcunun imleci bu bayta ulasana kadar beklenecek (en cok ' + beklesn + ' sn)...')

  const basla = Date.now()
  let ulasti = false
  let sonOfset = 0
  while ((Date.now() - basla) / 1000 < beklesn) {
    await new Promise((r) => setTimeout(r, 2000))
    try {
      const im = JSON.parse(fs.readFileSync(iy, 'utf8'))
      sonOfset = Number((im.ofsetler || {})[probDosya] || 0)
      if (sonOfset >= hedef) {
        ulasti = true
        break
      }
    } catch {
      /* imleç tam o an yazılıyor olabilir; bir sonraki turda tekrar bak */
    }
  }

  const gecen = Math.round((Date.now() - basla) / 1000)
  try {
    fs.writeFileSync(
      durumYolu(sid),
      JSON.stringify({ sid, jeton, probTs: olay.ts, gozcuOkudu: ulasti, gecenSn: gecen }),
      'utf8',
    )
  } catch {
    /* durum yazılamazsa jeton eşleştirmesi çalışmaz, ama prob sonucu yine geçerli */
  }

  if (!ulasti) {
    yaz('KIRMIZI — GOZCU PROBU OKUMADI (' + gecen + ' sn, imlec ' + sonOfset + '/' + hedef + ').')
    yaz('Gozcu olu ya da pano dizinine bakmiyor. Bu sonuc mekanizma CALISSAYDI FARKLI olurdu.')
    process.exit(1)
  }

  yaz('YESIL — GOZCU PROBU OKUDU (' + gecen + ' sn icinde, imlec ' + sonOfset + ' >= ' + hedef + ').')
  yaz('')
  yaz('DIKKAT — BU TESTIN SINIRI, ADIYLA: bu kanit gozcunun panoyu OKUDUGUNU gosterir,')
  yaz('bildirimin AJANA ULASTIGINI gostermez. Teslimat kanitini ancak jetonu bildirimde GORUP')
  yaz('geri yazarak verirsin:')
  yaz('   node scripts/board/mechanism-setup.cjs dogrula --sid ' + sid + ' --jeton <bildirimde-gordugun>')
}

// ============================================================================ dogrula
function dogrula() {
  const sid = sidAl()
  const aralik3 = 3
  const iy = imlecYolu(sid)
  let kirmizi = 0

  yaz('== MEKANIZMA DOGRULAMASI — ' + sid.slice(0, 8) + ' ==')

  // --- 1) gözcü: ÖLÇÜLÜR
  if (!fs.existsSync(iy)) {
    yaz('GOZCU     : KIRMIZI — imlec dosyasi yok, hic kurulmamis.')
    kirmizi++
  } else {
    let im = null
    try {
      im = JSON.parse(fs.readFileSync(iy, 'utf8'))
    } catch (e) {
      yaz('GOZCU     : KIRMIZI — imlec okunamadi (' + (e.code || e.message) + ').')
      kirmizi++
    }
    if (im) {
      const aralikSn = Number(im.aralikSn || 60)
      const yas = im.sonTarama ? (Date.now() - Date.parse(im.sonTarama)) / 1000 : Infinity
      const esik = aralikSn * aralik3
      if (!(yas <= esik)) {
        yaz(
          'GOZCU     : KIRMIZI — son tarama ' +
            (Number.isFinite(yas) ? Math.round(yas) + ' sn once' : 'HIC') +
            ', esik ' + esik + ' sn. Surec olmus ya da asilmis.',
        )
        kirmizi++
      } else {
        yaz('GOZCU     : YESIL — son tarama ' + Math.round(yas) + ' sn once (esik ' + esik + ' sn), ' + Object.keys(im.ofsetler || {}).length + ' pano dosyasi izleniyor.')
      }
    }
  }

  // --- 2) teslimat: jeton eşleşmesi (ölçüm DEĞİL, TESLİMAT kanıtı)
  const jeton = arg('--jeton')
  if (jeton) {
    let durum = null
    try {
      durum = JSON.parse(fs.readFileSync(durumYolu(sid), 'utf8'))
    } catch {
      /* yok */
    }
    if (!durum || !durum.jeton) {
      yaz('TESLIMAT  : KIRMIZI — karsilastirilacak prob kaydi yok; once prob calistir.')
      kirmizi++
    } else if (durum.jeton !== jeton) {
      yaz('TESLIMAT  : KIRMIZI — jeton uyusmuyor (beklenen ' + durum.jeton + ', verilen ' + jeton + ').')
      kirmizi++
    } else {
      yaz('TESLIMAT  : YESIL — bildirimde gorunen jeton son probun jetonuyla ayni.')
    }
  } else {
    yaz('TESLIMAT  : OLCULEMEDI — --jeton verilmedi. Gozcunun OKUDUGU kanitli olabilir ama')
    yaz('            bildirimin sana ULASTIGI kanitli DEGIL. Olcemedim != gecti.')
    kirmizi++
  }

  // --- 3) cron ve uyanış: BEYAN, ölçüm değil — ve bu ayrım gizlenmez
  const cron = arg('--cron')
  if (cron) {
    yaz('CRON      : BEYAN — id ' + cron + '. Bu bir OLCUM DEGILDIR; cron ajan aracidir ve')
    yaz('            diskten gorulemez. Tek gecerli olcum: CronList ciktisinda bu id.')
  } else {
    yaz('CRON      : OLCULEMEDI — --cron verilmedi. CronList ile dogrula, sonra id yi buraya gec.')
    kirmizi++
  }
  yaz('UYANIS    : OLCULEMEZ — ScheduleWakeup un diskte izi yoktur. Tur sonunda YENIDEN kurulmasi')
  yaz('            ritueldir; bu betik onu goremez ve gordugunu IDDIA ETMEZ.')

  yaz('')
  if (kirmizi > 0) {
    yaz('SONUC: KIRMIZI — ' + kirmizi + ' kalem kanitlanmadi. Fail-closed: kanitlanmayan katman COKMUS sayilir.')
    process.exit(1)
  }
  yaz('SONUC: YESIL — olculebilir katmanlar olculdu, beyan edilenler beyan olarak isaretlendi.')
}

// ============================================================================ giriş
const fiil = process.argv[2]
if (fiil === 'plan') plan()
else if (fiil === 'prob') prob()
else if (fiil === 'dogrula') dogrula()
else {
  yaz('kullanim: mechanism-setup.cjs <plan|prob|dogrula> --sid <uuid> [--serit ALTYAPI] [--cron id] [--jeton X]')
  yaz('  plan    : kurulumun tam metnini uretir (serit ofset tablosu burada SSOT)')
  yaz('  prob    : DIS OLAYLA ayirt edici test — gozcu canli mi, mekanik olcum')
  yaz('  dogrula : uc katmanin durumunu raporlar; OLCULEN ile BEYAN EDILEN i ayirir, fail-closed')
  process.exit(2)
}
