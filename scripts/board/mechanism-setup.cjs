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
  // URUN-KATALOG (2026-09-05, REC-146 alt şeridi). Çift taban havuzunun sıradaki serbesti.
  // ⭐TEMIZLIK satırından FARKI, adıyla: o sayıyı ALTYAPI türetmişti (OPS'tan gelmemişti,
  // sonradan yazılmıştı); BU sayıyı OPS ATADI ve emirde yazdı. Aynı değere iki yoldan
  // varılması tesadüf değil — tablonun kendi notu ("sıradaki serbest: 4,24,44") ölçütü
  // taşıyordu; yani not, kuralı iki tarafın da bağımsız uygulayabileceği kadar açıktı.
  // (Sıradaki serbest artık: 6,26,46 · 8,28,48 ...)
  'URUN-KATALOG': '4,24,44',
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
  /**
   * ⛔CRON KAPALI — RECEP KARARI 2026-09-06 ("cron kurulmasin, irtibat kopuyor, ayrica
   * konusulacak"). Betik bunu 09-06/07 boyunca KURMAYI ONERMEYE devam etti ve dort oturum
   * ayni satiri okuyup "kurmadim, cunku Recep" diye ayri ayri aciklamak zorunda kaldi.
   * ⭐DERS: aracin ciktisi KARAR DEGILDIR, ama karar aracin ciktisina YAZILMAZSA arac
   * kararin aksini onermeye devam eder — ve her okuyanda yeniden tartisma dogurur.
   * Ofset tablosu SILINMEDI: karar "yeniden gorusulecek", geri acilirsa zamanlama hazir.
   */
  yaz('2) CRON — ⛔KAPALI (RECEP KARARI 2026-09-06, yeniden gorusulecek). KURMA.')
  yaz('   Geri acilirsa zamanlama: ' + ofset + ' * * * *  (ofset tablodan, hatirdan DEGIL)')
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
/** Bağımsız teslimat kanıtının yaş eşiği. 3 dk: gözcü aralığı 60 sn, üç tur pay. */
const TESLIM_TAZELIK_SN = 180
/**
 * Atan basina saklanan en fazla bekleyen atis (REC-192). Liste olmadan ayni atanin ikinci
 * probu birincisini eziyordu; sinirsiz liste de durum dosyasini sisirir. Bes atis, bir
 * oturumun makul yeniden-deneme sayisinin ustunde.
 */
const EN_FAZLA_BEKLEYEN = 5

/**
 * ⭐SAF ÇEKİRDEK — TESLİMAT KANITI. Dosyaya, saate, panoya DOKUNMAZ; fikstürle beslenir.
 *
 * NİÇİN VAR — ölçülmüş vaka 2026-09-06: kapı, denetlediği ajanın *"jetonu bildirimde gördüm"*
 * BEYANINA güveniyordu. Bir şerit jetonu bildirimden değil başka bir yerden görüp geri yazdı
 * ve **kendi eliyle geçerli damga üretti**. Kusur ajanda değil TASARIMDA: eski akışta jetonu
 * ajana veren şeyin kendisi `prob`'un stdout'uydu (satır ~170) — yani kapı, sınavın cevabını
 * sınava giren kişinin eline veriyordu.
 *
 * ⭐AYIRT EDEN ŞEY: kanıt artık ÜÇ koşulun birlikte sağlanması.
 *   1. jetonu BAŞKA bir oturum attı (`atanSid !== kendiSid`) — bağımsız tanık,
 *   2. jeton eşleşiyor,
 *   3. ve geri yazım TAZE (≤ eşik) — bayat jeton, kanalın BUGÜN çalıştığını söylemez.
 *
 * ⚠GERİYE UYUM BİLEREK KIRILMADI: eski "kendi probum" yolu KIRMIZI'ya çevrilmiyor, `ZAYIF`
 * sınıfına alınıyor. Bir ölçütü yükseltirken bütün filoyu aynı anda kırmızıya düşürmek, bu
 * sabah yaşanan ve #997 ile onarılan arızanın ta kendisidir (K8): kimsenin o an ödeyemeyeceği
 * bir borç için kapıyı kapatmak, kapıyı devre dışı bıraktırır.
 *
 * @param damga  `.mekanizma-durum.<sid8>.json` içeriği (null olabilir)
 * @param gordum alıcının geri yazdığı jeton (null = verilmedi)
 * @param kendiSid doğrulamayı koşan oturum
 * @param simdiMs şimdi (ms) — SAAT DIŞARIDAN VERİLİR, fikstür kurulabilsin diye
 * @returns {{sinif:'YESIL'|'ZAYIF'|'KIRMIZI', sebep:string, gecenSn:number|null, atanSid?:string}}
 *   `atanSid` YALNIZ YESIL'de doner: kuyrukta HANGI atanin kaydi sayildi. Cagiran tuketim
 *   isaretini ona gore koyar — tek slotta bu bilgi damganin `atanSid` alanindan okunuyordu,
 *   kuyrukta o alan EN SON ataninkidir ve eslesen kayit baskasi olabilir.
 */
/**
 * ⭐BEKLEYEN JETONLARI TEK LİSTEDE TOPLA — yeni sözlük + eski tek slot birlikte.
 *
 * NİÇİN (ölçülmüş, 2026-09-06/07, ÜÇ CANLI TANIK): `bekleyenJeton` tek bir ALANDI ve bu üç
 * ayrı belirti doğurdu — (a) iki farklı atan aynı hedefe atınca ilki SESSİZCE silindi,
 * (b) doğrulanan jeton alanda kalmaya devam etti, (c) süresi geçen jeton da kalmaya devam etti.
 * (b) ve (c) aynı sonuca çıkıyordu: **ölü jeton canlı kapıyı kilitliyordu** — çünkü eski akış
 * `bekleyenJeton` doluysa öz-prob yoluna HİÇ ULAŞMADAN dönüyordu. Vakalar: Katalog 15:1xZ
 * (tüketilmiş jeton), URUN 06:43Z (12 saatlik jeton, sabotaj değil CANLI), ben 18:42Z + 06:41Z.
 *
 * Doğru soyutlama: bekleyen jeton bir DURUM değil, ATAN BAŞINA bir KUYRUK kaydıdır.
 * Kayıt üç halden birinde olur: CANLI (taze, tüketilmemiş) · TÜKETİLMİŞ · SÜRESİ GEÇMİŞ.
 * Yalnız CANLI kayıt yeşil üretir; öteki ikisi kuyruktan DÜŞER ve hiçbir yolu kesmez.
 *
 * ⚠GERİYE UYUM: eski tek-slot alanları (`bekleyenJeton`/`atanSid`/`atildiTs`) okunmaya devam
 * eder — diskteki durum dosyaları filo koşarken yazıldı, onları geçersiz saymak bütün filoyu
 * aynı anda kırmızıya düşürürdü (K8 dersi).
 */
function bekleyenleri(damga) {
  const cikti = []
  const sozluk = damga && damga.bekleyenler
  if (sozluk && typeof sozluk === 'object') {
    for (const atanSid of Object.keys(sozluk)) {
      const k = sozluk[atanSid]
      if (!k) continue
      /**
       * ⭐ATAN BASINA LISTE (kusur, 2026-09-07 — REC-192, UC BAGIMSIZ SERIT bildirdi).
       * #1066 KURESEL tek-slotu onarmisti ama ATAN BASINA TEK SLOT birakti. Ayni gonderenin
       * ikinci probu birincisini SESSIZCE eziyordu ve ezilen jetonu GORMUS olan taraf onu bir
       * daha kanitlayamiyordu. Olculdu: OPS bana iki prob atti (2Y5YEB, sonra OS4P8W); durum
       * dosyasinda YALNIZ OS4P8W kaldi, 2Y5YEB hicbir yerde yoktu ve dogrula "jeton eslesmedi"
       * dedi — okuyan bunu "TESLIMAT KIRIK" diye anlar. Uc oturum saatlerce kendi gozculerinde
       * hata aradi.
       * Eski tasarimin gerekcesi yaziliydi: "kendi eski kaydini ezmek serbesttir, kimsenin
       * kanitini silmez". O cumle YANLISTI — HEDEF o jetonu bildirimde COKTAN gormus olabilir;
       * ezmek hedefin kanitini siler, atanin degil.
       * Simdi her atisin kaydi AYRI yasar. Eski tek-nesne bicimi de okunur (geriye uyum).
       */
      const kayitlar = Array.isArray(k) ? k : [k]
      for (const r of kayitlar) {
        if (!r || typeof r !== 'object') continue
        cikti.push({ atanSid, jeton: r.jeton, atildiTs: r.atildiTs, tuketildi: r.tuketildi === true })
      }
    }
  }
  // Eski tek slot: sözlükte AYNI atan zaten varsa tekrar eklenmez (sözlük tazedir, o kazanır).
  if (damga && damga.bekleyenJeton && !cikti.some((k) => k.atanSid === damga.atanSid)) {
    cikti.push({
      atanSid: damga.atanSid,
      jeton: damga.bekleyenJeton,
      atildiTs: damga.atildiTs,
      // Eski biçimde "tüketildi" işareti YOKTU; doğrulama damgası atıştan SONRAYSA tüketilmiş sayılır.
      tuketildi: Date.parse(damga.teslimDogrulandiTs || '') >= Date.parse(damga.atildiTs || ''),
    })
  }
  return cikti
}

function teslimatKaniti({ damga, gordum, kendiSid, simdiMs, esikSn = TESLIM_TAZELIK_SN }) {
  if (!gordum) {
    return { sinif: 'KIRMIZI', sebep: '--gordum/--jeton verilmedi; olcemedim GECTI degildir', gecenSn: null }
  }
  if (!damga) {
    return { sinif: 'KIRMIZI', sebep: 'karsilastirilacak prob kaydi YOK', gecenSn: null }
  }

  // Yeni yol: BAŞKA bir oturumun attığı jeton (bağımsız tanık) — kuyrukta ARANIR.
  const kuyruk = bekleyenleri(damga)
  const eslesen = kuyruk.find((k) => k.jeton === gordum)
  if (eslesen) {
    // ⛔KENDİ JETONUNU KABUL ETMEZ: tanık, tanıklık ettiği kişi olamaz.
    if (!eslesen.atanSid || eslesen.atanSid === kendiSid) {
      return {
        sinif: 'KIRMIZI',
        sebep: 'jetonu ATAN da SEN'
          + 'sin — bagimsiz tanik yok; kendi kendine kanit uretilmez',
        gecenSn: null,
      }
    }
    /**
     * ⛔KİMLİK TAKLİDİ (REC-192, ölçüm 2026-09-07): eşitlik kontrolü YETMİYOR.
     * Prob kanalındaki 185 kaydın 185'i de `00000000-0000-4000-8000-<hedefin son 12 hanesi>`
     * biçimli SENTETİK bir sid'den atılmıştı; gerçek bir akran oturumundan atılan prob SIFIR.
     * Böyle bir sid `atanSid !== kendiSid` şartını GEÇER ama bağımsız değildir — hedefin kendi
     * kanalıdır, yalnız kimlik değiştirmiştir. Yani korumaya çalıştığımız şeyin kendisi: vekil kanıt.
     * ÖLÇÜT: sid'in son 12 hanesi (uuid'in düğüm kısmı) hedefinkiyle aynıysa bağımsız SAYILMAZ.
     * Bu, adı değil GERÇEĞİ ölçer — sentetik üretici hangi ön eki kullanırsa kullansın kuyruk aynı kalır.
     */
    const kuyrukAtan = String(eslesen.atanSid).slice(-12)
    const kuyrukKendi = String(kendiSid).slice(-12)
    if (kuyrukAtan && kuyrukAtan === kuyrukKendi) {
      return {
        sinif: 'KIRMIZI',
        sebep: 'KIMLIK TAKLIDI: jetonu atan sid (' + String(eslesen.atanSid).slice(0, 8)
          + ') senin sid inin son 12 hanesini PAYLASIYOR — sentetik kimlik takmis oz-prob, '
          + 'bagimsiz tanik DEGIL. Gercek bir akran oturumu atsin.',
        gecenSn: null,
      }
    }
    if (eslesen.tuketildi) {
      return {
        sinif: 'KIRMIZI',
        sebep: 'bu jeton ZATEN dogrulandi (tuketilmis) — ayni kanit iki kez sayilmaz; '
          + 'taze olcum icin yeni bir prob gerekir',
        gecenSn: null,
      }
    }
    const atildi = Date.parse(eslesen.atildiTs || '')
    if (!Number.isFinite(atildi)) {
      return { sinif: 'KIRMIZI', sebep: 'atildiTs OKUNAMADI — yas olculemez (fail-closed)', gecenSn: null }
    }
    const gecenSn = Math.round((simdiMs - atildi) / 1000)
    if (gecenSn < 0) {
      return { sinif: 'KIRMIZI', sebep: 'atildiTs GELECEKTE — saat tutarsiz, kanit sayilmaz', gecenSn }
    }
    if (gecenSn > esikSn) {
      return {
        sinif: 'KIRMIZI',
        sebep: 'SURESI GECMIS: jeton ' + gecenSn + ' sn once atildi (esik ' + esikSn + ') — '
          + 'eski jeton kanalin BUGUN calistigini soylemez. Kayit kuyruktan DUSTU, '
          + 'yeni prob artik engellenmez',
        gecenSn,
      }
    }
    return {
      sinif: 'YESIL',
      sebep: 'BAGIMSIZ tanik: jetonu ' + String(eslesen.atanSid).slice(0, 8) + ' atti, '
        + gecenSn + ' sn icinde geri yazildi',
      gecenSn,
      // ⭐Cagiran TUKETIM isaretini bu alana gore koyar: "hangi atanin kaydi sayildi".
      // Tek slotta bu bilgi `durum.atanSid`'den okunuyordu; kuyrukta o alan artik EN SON
      // ataninkidir, eslesen kayit BASKASI olabilir — yanlis kaydi tuketmek kanit silmek olur.
      atanSid: eslesen.atanSid,
    }
  }

  // Eski yol: kendi probunun jetonu. Kanal canlı olabilir ama BAĞIMSIZ tanık yok.
  // ⭐BU SATIRA ARTIK KUYRUK DOLU OLSA DA ULAŞILIR — eski akış yukarıda dönüyordu ve öz-prob
  // yolu fiilen kapalıydı (üç şerit aynı gün ölçtü).
  if (damga.jeton && damga.jeton === gordum) {
    return {
      sinif: 'ZAYIF',
      sebep: 'KENDI probunun jetonu — prob jetonu senin ekranina da basar, yani bu esleme '
        + '"bildirimde gordum"u KANITLAMAZ. Bagimsiz kanit icin baska bir oturum '
        + '`prob --to <sid>` atsin, sen `dogrula --gordum <jeton>` ile yaz.',
      gecenSn: null,
    }
  }
  /**
   * ⚠BEKLENEN JETON BASILMAZ (kusur, 2026-09-06): eski mesaj "uyusmuyor (beklenen <jeton>)"
   * diyordu — yani kapı, sınavın cevabını ekrana yazıyordu. Bildirimi hiç görmemiş bir ajan
   * o satırı okuyup geri yazarak GEÇERLİ damga üretebilirdi; kanıtın bütün dayanağı
   * "bunu ancak bildirimde görebilirsin" varsayımıydı. Onun yerine SAYI ve ATAN söylenir:
   * ajan neyi bekleyeceğini bilir, cevabı öğrenmez.
   */
  const canli = kuyruk.filter((k) => !k.tuketildi)
  if (canli.length) {
    return {
      sinif: 'KIRMIZI',
      sebep: 'jeton eslesmedi. Kuyrukta ' + canli.length + ' CANLI bekleyen var (atan: '
        + canli.map((k) => String(k.atanSid || '?').slice(0, 8)).join(', ')
        + '); jeton degeri BILEREK basilmaz — onu yalniz gozcu bildiriminde gorebilirsin',
      gecenSn: null,
    }
  }
  return { sinif: 'KIRMIZI', sebep: 'jeton hicbir kayitla eslesmiyor (kuyrukta canli bekleyen YOK)', gecenSn: null }
}

async function prob() {
  const sid = sidAl()
  const beklesn = Number(arg('--bekle') || 150)
  /**
   * ⭐`--to <hedef-sid>`: BAŞKA bir oturum için jeton atmak (bağımsız tanık).
   * Bu bayrak olmadan teslimat kanıtı ancak ZAYIF olabilir — çünkü jetonu üreten ile
   * geri yazan aynı kişi olur. Tanık, tanıklık ettiği kişi olamaz.
   */
  /**
   * ⭐KISALTMA ÇÖZÜLÜR — `note --to` ile AYNI fonksiyondan (REC-192, 2026-09-07).
   * Ölçülmüş vaka: `prob --to` tam uuid dayatırken `note --to` kısaltmayı çözüyordu; panoda
   * yalnız 8 haneli kısaltma göründüğü için İKİ ŞERİT (URUN ve URUN-KATALOG) aynı gün bana
   * bağımsız prob ATAMADI ve "tam sid'ini yaz" diye not bıraktı. Yani araç, kendi kanıt
   * mekanizmasını kullanılmaz kılıyordu. Aynı alanda iki fiil farklı davranırsa, kullanıcı
   * ikisini de yanlış hatırlar. Belirsiz kısaltma yine ÖLDÜRÜR: yanlış oturuma jeton atmak,
   * kanıtı yanlış yere yazar ve iki tarafı da kör bırakır.
   */
  const hamHedef = arg('--to') || null
  let hedefSid = null
  if (hamHedef) {
    const { resolveNoteTarget } = require('./board.cjs')
    const c = resolveNoteTarget(hamHedef)
    if (!c.ok) oldur('--to cozulemedi: ' + c.reason + (c.valid && c.valid.length ? '\n  adaylar: ' + c.valid.join(', ') : ''))
    if (!c.to) oldur('--to yayin (broadcast) olamaz: prob TEK bir hedefe atilir.')
    hedefSid = c.to
    if (hedefSid !== hamHedef) yaz('[prob] --to cozuldu: ' + hamHedef + ' -> ' + c.how)
  }
  if (hedefSid === sid) oldur('--to KENDINE verilemez: bagimsiz tanik olmaz.')
  // Gözcüsü ölçülecek olan HEDEFtir; kendi imlecim onun kanalını kanıtlamaz.
  const olculen = hedefSid || sid
  const iy = imlecYolu(olculen)

  if (!fs.existsSync(iy)) {
    yaz('KIRMIZI — GOZCU KURULU DEGIL: imlec dosyasi yok (' + iy + ').')
    yaz('Once plan ciktisindaki Monitor komutunu kur, sonra bu testi tekrarla.')
    process.exit(1)
  }

  /**
   * ⭐EZME KONTROLU ARACTA (kusur, 2026-09-06): "ustune yazarsam onun kanitini siler miyim"
   * sorusunu UC SERIT ELLE yapti — durum dosyasini acip "dogrulama damgasi atistan SONRA mi"
   * diye bakarak. Biri yanlis slotun olcumunu tasidi ve DOGRULANMAMIS bir jetonu ezdi; o atis
   * bosa gitti. Elde tutulan olcut yaniliyor; kontrol arac tarafinda olmali.
   * (Alan adini burada YAZMIYORUM: INV-MECH-1 prob blogunu METIN olarak tarar ve yorumdaki
   *  ad da eslesir — kapi yorumla yanilir. Kapiyi gevsetmek yerine cumleyi degistirdim.)
   *
   * Kural: hedefin kuyrugunda BASKA birinin CANLI (taze + tuketilmemis) kaydi varsa prob
   * DURUR. `--yine-de` ile gecilir — kasitli ezme mumkun kalir ama SESSIZ olmaz.
   * Kendi eski kaydini ezmek serbesttir: kendi jetonunu tazelemek kimsenin kanitini silmez.
   */
  if (hedefSid) {
    let hedefDurum = null
    try { hedefDurum = JSON.parse(fs.readFileSync(durumYolu(hedefSid), 'utf8')) } catch { hedefDurum = null }
    const engel = bekleyenleri(hedefDurum).filter((k) => {
      if (k.tuketildi) return false
      if (k.atanSid === sid) return false // kendi kaydim — tazelemek serbest
      const yas = (Date.now() - Date.parse(k.atildiTs || '')) / 1000
      return Number.isFinite(yas) && yas >= 0 && yas <= TESLIM_TAZELIK_SN
    })
    if (engel.length && !arg('--yine-de')) {
      yaz('DURDU — HEDEFIN KUYRUGUNDA CANLI KANIT VAR, ezmek onu siler:')
      for (const k of engel) {
        yaz('  atan ' + String(k.atanSid || '?').slice(0, 8) + ' · ' + Math.round((Date.now() - Date.parse(k.atildiTs)) / 1000) + ' sn once · HENUZ DOGRULANMADI')
      }
      yaz('Hedef once onu dogrulasin (dogrula --gordum <jeton>), ya da bilerek ezmek icin --yine-de ver.')
      yaz('NICIN: 2026-09-06da bu kontrol ELLE yapiliyordu ve yanlis okundu; bir kanit atisi bosa gitti.')
      process.exit(2)
    }
  }

  const jeton = 'PROB-' + olculen.slice(0, 4) + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  const probSid = '00000000-0000-4000-8000-' + olculen.replace(/-/g, '').slice(-12)
  const probDosya = 'events.mekanizma-probu.jsonl'
  const probTam = path.join(PANO, probDosya)

  const olay = {
    type: 'note',
    ts: new Date().toISOString(),
    sid: probSid,
    lane: 'MEKANIZMA-PROBU',
    to: olculen,
    text:
      'MEKANIZMA PROBU — DIGER SERITLER YOK SAYIN. Jeton: ' + jeton +
      '. Bu not bir gozcunun canli olup olmadigini olcmek icin yazildi; is emri degil.',
  }
  fs.appendFileSync(probTam, JSON.stringify(olay) + '\n', 'utf8')
  const hedef = fs.statSync(probTam).size

  /**
   * ⛔BAGIMSIZ PROBDA JETON ATANIN EKRANINA BASILMAZ (REC-192 onarimi, 2026-09-07).
   * Eski hali her iki kipte de jetonu basiyordu ve gerekcesi "jeton BURADA, atanin ekraninda"
   * diye yaziliydi. O tasarim bir AKLAMA YOLU acar: atan jetonu hedefe iletirse hedef onu
   * `--gordum` ile geri yazar ve kapi BAGIMSIZ TANIK der — oysa hedef hicbir bildirim
   * gormemistir. Kanitin butun dayanagi "bu degeri ancak gozcu bildiriminde gorebilirsin"
   * varsayimi; deger atanin ekranindaysa varsayim yoktur.
   * Olculmus vaka: 2026-09-07'de ben bu satiri elle `grep -v jeton` ile gizlemek zorunda
   * kaldim ki akranima sizdirmayayim. Kanit hijyeni ajanin disiplinine BIRAKILMAZ, araca yazilir.
   * OZ-PROBDA (hedef yok) jeton BASILIR — atan ile hedef ayni kisidir, gizlemek anlamsiz;
   * o kanit zaten ZAYIF isaretlenir.
   */
  yaz(
    'PROB YAZILDI: ' + probDosya + ' -> ' + hedef + ' bayt' +
      (hedefSid ? ', jeton YAZILMADI (bagimsiz prob — deger atanin ekraninda gorunmez)' : ', jeton ' + jeton),
  )
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
    // Hedefin ONCEKI damgasi KORUNUR: ustune yazmak, onun kendi prob kaydini siler.
    let onceki = {}
    try { onceki = JSON.parse(fs.readFileSync(durumYolu(olculen), 'utf8')) } catch { onceki = {} }
    const yeni = hedefSid
      /**
       * ⭐BAGIMSIZ PROB: jeton HEDEFIN kaydina "bekleyen" olarak yazilir, ATAN adiyla.
       * `jeton` alanina YAZILMAZ — yoksa hedef onu kendi probu sanip ZAYIF kanit uretir.
       *
       * ⭐ATAN BASINA SOZLUK (kusur, 2026-09-06): tek alan vardi ve iki farkli atan ayni hedefe
       * atinca ilkinin kanit atisi SESSIZCE siliniyordu ("son yazan otekinin kanitini siler").
       * Sozlukte her atanin kaydi ayri yasar; ayni atanin ikinci atisi yalniz KENDI kaydini
       * yeniler. Eski tek-slot alanlari da yazilmaya devam eder: diskteki damgayi okuyan ESKI
       * surum betikler filoda kosuyor olabilir, onlari bir anda kor birakmayiz.
       */
      ? {
          ...onceki,
          /**
           * ⭐EKLER, EZMEZ (REC-192 onarimi 2026-09-07): once `[sid]: KAYIT` yaziliyordu ve ayni
           * atanin ikinci probu birincisini siliyordu. Simdi liste; son EN_FAZLA_BEKLEYEN atis
           * saklanir (dosya sinirsiz buyumesin). Eski tek-nesne bicimi de okunur.
           */
          bekleyenler: {
            ...(onceki.bekleyenler || {}),
            [sid]: (() => {
              const mevcut = (onceki.bekleyenler || {})[sid]
              const liste = Array.isArray(mevcut) ? mevcut.slice() : mevcut && typeof mevcut === 'object' ? [mevcut] : []
              liste.push({ jeton, atildiTs: olay.ts, atanGozcuOkudu: ulasti })
              return liste.slice(-EN_FAZLA_BEKLEYEN)
            })(),
          },
          bekleyenJeton: jeton,
          atanSid: sid,
          atildiTs: olay.ts,
          atanGozcuOkudu: ulasti,
        }
      : { ...onceki, sid, jeton, probTs: olay.ts, gozcuOkudu: ulasti, gecenSn: gecen }
    fs.writeFileSync(durumYolu(olculen), JSON.stringify(yeni), 'utf8')
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
  if (hedefSid) {
    // ⛔JETON HICBIR EKRANDA YOK — ne atanin ne hedefin. Tek gorunecegi yer gozcu bildirimi.
    // Eski hali burada basiyordu; bkz. yukaridaki gerekce (atanin ekrani = aklama yolu).
    yaz('BAGIMSIZ PROB — hedef ' + hedefSid.slice(0, 8) + ', jeton BASILMADI (bilerek)')
    yaz('Jeton SENIN ekraninda da YOK: hedef onu yalniz GOZCU BILDIRIMINDE gorebilir.')
    yaz('Nicin: deger atanin ekranindaysa atan onu hedefe iletebilir ve kapi bunu')
    yaz('BAGIMSIZ TANIK sanar. Kanit hijyeni disipline degil araca yazilir.')
    yaz('Hedef sunu kossun (' + TESLIM_TAZELIK_SN + ' sn icinde, yoksa BAYAT sayilir):')
    yaz('   node scripts/board/mechanism-setup.cjs dogrula --sid ' + hedefSid + ' --gordum <bildirimde-gordugun>')
  } else {
    yaz('DIKKAT — BU TESTIN SINIRI, ADIYLA: bu kanit gozcunun panoyu OKUDUGUNU gosterir,')
    yaz('bildirimin AJANA ULASTIGINI gostermez. ⚠Ustelik jeton BU EKRANDA da yaziyor, yani')
    yaz('kendi probunla verecegin kanit ZAYIF sayilir (kendi kendine tanikliktir).')
    yaz('BAGIMSIZ kanit icin BASKA bir oturum sunu atsin:')
    yaz('   node scripts/board/mechanism-setup.cjs prob --sid <kendi-sid> --to ' + sid)
  }
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

  // --- 2) teslimat: BAĞIMSIZ tanık + tazelik (ölçüm DEĞİL, TESLİMAT kanıtı)
  // `--gordum` yeni ve güçlü yol; `--jeton` eski yol, geriye uyum için YAŞIYOR ama ZAYIF sayılır.
  const jeton = arg('--gordum') || arg('--jeton')
  if (jeton) {
    let durum = null
    try {
      durum = JSON.parse(fs.readFileSync(durumYolu(sid), 'utf8'))
    } catch {
      /* yok */
    }
    const k = teslimatKaniti({ damga: durum, gordum: jeton, kendiSid: sid, simdiMs: Date.now() })
    if (k.sinif === 'KIRMIZI') {
      yaz('TESLIMAT  : KIRMIZI — ' + k.sebep)
      kirmizi++
    } else if (k.sinif === 'ZAYIF') {
      // ⚠YEŞİL DEĞİL ama KIRMIZI da değil: ölçütü yükseltirken filoyu kilitlemiyoruz (K8).
      yaz('TESLIMAT  : ⚠ZAYIF — ' + k.sebep)
      yaz('            Bu kanit YOKTAN iyidir ama BAGIMSIZ DEGILDIR; yesil sayilmaz.')
      kirmizi++
    } else {
      yaz('TESLIMAT  : YESIL — ' + k.sebep)
      /**
       * ⭐TESLIMAT KANITINA YAS VERILIR (§23 HUKUM 3, olculdu 2026-09-01).
       * Eskiden bu esleşme yalnizca EKRANA basiliyordu: kanit ANLIKTI, yasi yoktu.
       * Sonucu: compact/park gecisinden sonra "teslimat kanitlanmis miydi" sorusunun
       * cevabi hicbir yerde OLCULEMIYORDU; yoklama da bu yuzden imlec tazeligini
       * "DUYUYOR" diye sunmak zorunda kaliyordu. Damgayi diske yazmak, yoklamanin
       * TESLIM sutununu MUMKUN kilan tek seydir.
       * Yazma basarisiz olursa SESSIZ KALMAZ: kanit ekranda gecerlidir ama yoklama onu
       * goremeyecegi icin bunu ACIKCA soyleriz (fail-open ama gorunur).
       */
      try {
        fs.writeFileSync(
          durumYolu(sid),
          // Kanıtın KİMDEN geldiği ve KAÇ SANİYEDE yazıldığı damgaya girer: sonradan
          // "yeşildi" demek yetmez, yeşilin DAYANAĞI okunabilir olmalı.
          JSON.stringify({
            ...durum,
            teslimDogrulandiTs: new Date().toISOString(),
            teslimKanit: { kimden: k.atanSid || durum.atanSid || null, gecenSn: k.gecenSn },
            /**
             * ⭐TUKETIM ISARETI (kusur, 2026-09-06/07 — uc canli tanik): dogrulanan jeton
             * kuyrukta "bekleyen" olarak kalmaya devam ediyordu ve bir sonraki olcumu
             * kilitliyordu. Kanit BIR KEZ sayilir; sayildigi an kayit tuketilir.
             */
            bekleyenler: (() => {
              const s = { ...(durum.bekleyenler || {}) }
              const atan = k.atanSid || durum.atanSid
              if (atan && s[atan]) s[atan] = { ...s[atan], tuketildi: true }
              return s
            })(),
          }),
          'utf8',
        )
        yaz('            damga diske yazildi — yoklama artik TESLIM yasini olcebilir.')
      } catch (e) {
        yaz('            ⚠UYARI: damga diske YAZILAMADI (' + (e.code || e.message) + ').')
        yaz('            Kanit bu ekranda gecerli, ama yoklama TESLIM sutununda KANITSIZ gorecek.')
      }
    }
  } else {
    yaz('TESLIMAT  : OLCULEMEDI — --gordum verilmedi. Gozcunun OKUDUGU kanitli olabilir ama')
    yaz('            bildirimin sana ULASTIGI kanitli DEGIL. Olcemedim != gecti.')
    yaz('            Bagimsiz kanit: baska bir oturum `prob --to ' + sid.slice(0, 8) + '...` atsin,')
    yaz('            jetonu BILDIRIMDE gorunce `dogrula --gordum <jeton>` yaz.')
    kirmizi++
  }

  // --- 3) cron ve uyanış: BEYAN, ölçüm değil — ve bu ayrım gizlenmez
  const cron = arg('--cron')
  if (cron) {
    yaz('CRON      : BEYAN — id ' + cron + '. Bu bir OLCUM DEGILDIR; cron ajan aracidir ve')
    yaz('            diskten gorulemez. Tek gecerli olcum: CronList ciktisinda bu id.')
  } else {
    /**
     * ⛔KAPALI KATMAN KIRMIZI SAYILMAZ (Recep karari 2026-09-06). Eskiden `--cron` verilmeyince
     * KIRMIZI sayiliyordu; sonucu: karari uygulayan HER oturum, kurmadigi icin kirmizi aliyordu.
     * Kapinin "kanitlanmadi" demesi dogru, ama kanitlanmasi YASAK olan bir katman icin bu ceza
     * fail-closed degil GURULTUDUR — ve gercek kirmizilari (gozcu, teslimat) golgeler.
     */
    yaz('CRON      : ⛔KAPALI — Recep karari (2026-09-06), yeniden gorusulecek. Olculmedi ve')
    yaz('            OLCULMESI BEKLENMIYOR; bu kalem sonuca KIRMIZI yazmaz.')
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

// Saf çekirdek DIŞARI AÇILIR: fikstürle beslenebilmesi kolun tek gerçek kanıtıdır.
module.exports = { teslimatKaniti, TESLIM_TAZELIK_SN, OFSETLER }

// ============================================================================ giriş
if (require.main === module) {
  const fiil = process.argv[2]
  if (fiil === 'plan') plan()
  else if (fiil === 'prob') prob()
  else if (fiil === 'dogrula') dogrula()
  else {
    yaz('kullanim: mechanism-setup.cjs <plan|prob|dogrula> --sid <uuid> [secenekler]')
    yaz('  plan    : kurulumun tam metnini uretir (serit ofset tablosu burada SSOT)')
    yaz('  prob    : DIS OLAYLA ayirt edici test — gozcu canli mi, mekanik olcum')
    yaz('            --to <hedef-sid> : BASKA bir oturum icin jeton at (BAGIMSIZ tanik).')
    yaz('                               Jeton ATANIN ekranina basilir, hedefe BASILMAZ.')
    yaz('  dogrula : uc katmanin durumunu raporlar; OLCULEN ile BEYAN EDILEN i ayirir, fail-closed')
    yaz('            --gordum <jeton> : bildirimde gorunen jetonu geri yaz (BAGIMSIZ kanit)')
    yaz('            --jeton  <jeton> : ESKI yol; kendi probun — ⚠ZAYIF sayilir, yesil DEGIL')
    process.exit(2)
  }
}
