#!/usr/bin/env node
/**
 * SAGE YEDEĞİ — çapalı hafızanın TUTARLI anlık görüntüsü (REC-345).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR
 * ══════════════════════════════════════════════════════════════════════════════
 * Hafıza dersleri sage'e taşınıyor (dosya hafızasından puanlı tek depoya). Tek depo
 * **tek arıza noktasıdır**: `.wrongstack/memories/sage.db` git DIŞIDIR (bilerek — ikili
 * SQLite üç pencerede çatışır, sır taraması ikiliyi görmez, içerik PR incelemesini atlar),
 * yani depoyu kaybetmek dersleri kaybetmektir ve geri dönüşü yoktur.
 *
 * ⛔CANLI DOSYA KOPYASI YEDEK DEĞİLDİR. Ölçüldü (2026-09-18): veritabanı WAL kipinde ve
 * yanında 758 KB'lık bir `sage.db-wal` duruyordu. `sage.db`yi tek başına kopyalamak, WAL'da
 * bekleyen yazımları ATLAR — elde sessizce eksik, hatta tutarsız bir dosya kalır. Bu yüzden
 * yedek `VACUUM INTO` ile alınır: kaynak SALT-OKUMA açılır, çıktı WAL dahil tek tutarlı
 * dosyadır.
 *
 * ⛔YEDEK GIT'E KONMAZ. Özel hafıza deposu bile üç pencerenin yazdığı bir git deposudur ve
 * ikili dosya çatışması birleştirilemez. Yedek git DIŞI bir dizine iner
 * (`%LOCALAPPDATA%/venthub-sage-yedek`, ya da `VENTHUB_SAGE_YEDEK_DIZINI`).
 *
 * ⭐YEDEK DOĞRULANMADAN YEDEK SAYILMAZ. Her koşum, ürettiği dosyayı salt-okuma açar, kayıt
 * sayısını ve tabloları KAYNAKLA KARŞILAŞTIRIR. Sayı tutmuyorsa çıkış kodu kırmızıdır ve dosya
 * `.DOGRULANMADI` uzantısıyla bırakılır — "yedek aldım" cümlesi ölçülmüş olmadan kurulmaz.
 * (Bu depoda ölçülmüş kusur sınıfı: "koşuyor" ≠ "geçti".)
 *
 * KOŞTURMA:
 *   node scripts/hijyen/sage-yedek.cjs            # yedek al + doğrula
 *   node scripts/hijyen/sage-yedek.cjs --liste    # mevcut yedekleri yaz
 *   node scripts/hijyen/sage-yedek.cjs --geri kanban [dosya] [--evet]
 *                                                 # yedekten geri yükle (ARC-9); --evet yoksa yalnız plan.
 *                                                 # Servis canlıyken REDDEDER; eski dosyalar .oncesi-<damga> kalır.
 *   node scripts/hijyen/sage-yedek.cjs --geri sage|posta-<proje> [dosya] [--evet]
 *                                                 # ARC-71: aynı kurallar; "servis" = pencerelerdeki MCP süreçleri
 *                                                 # (kanban dahil: stdio sunucuları pid dosyasında görünmez).
 *   node scripts/hijyen/sage-yedek.cjs --geri sage|kanban [dosya] --kok <yol> [--evet]
 *   node scripts/hijyen/sage-yedek.cjs --geri posta-<proje> [dosya] --posta-koku <yol> [--evet]
 *                                                 # YALITILMIŞ KÖK PROVASI: hedef kanonik karşılaştırmayla canlı depo
 *                                                 # DEĞİLSE süreç denetimi atlanır (pencereler açıkken kopyada prova).
 *                                                 # Canlı ya da ölçülemeyen hedefte denetim aynen kalır (fail-closed).
 *
 * ⭐POSTA KUTULARI (ARC-71, OPS kararı 10-09): `~/.wrongstack/projects/<proje>/_mailbox.sqlite` — hepsi (beş
 * dosya ölçüldü, her birinin WAL'ı dolu) aynı yöntemle yedeklenir: `VACUUM INTO` + kaynakla sayım. Düz kopya
 * yedek değildir: ana dosya 160 KB iken WAL 4,1 MB (mesajların çoğu WAL'da). Hangisinin canlı olduğu yedek
 * için önemsizdir; hepsi alınır. Kök `VENTHUB_POSTA_KOKU` ile değişir (testler boş dizine yönlendirir).
 *
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §7.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')

const { anaKok, anaKokBul } = require('./ana-kok.cjs')
// Süreç listesi AYRI modülde (bu dosyada dış süreç çağrısı yok: INV-SAGE-YEDEK-1 "dış servise çıkış izi yok" kolu).
const { calisanSurecler } = require('./surec-listesi.cjs')

/** Kaç yedek tutulur (en yenileri). Eski olanlar silinir — sonsuz büyüme de bir arızadır. */
const TUTULACAK = 14

/**
 * ⛔KÖK = ANA AĞAÇ, `cwd` DEĞİL. Ölçüldü 2026-09-18: worktree'den koşulunca eski kök çözümü
 * kendi kopyasına bakıyor, orada `.wrongstack` hiç yok, betik "sage kurulu degil" deyip
 * ÇIKIŞ 0 ile dönüyordu. Oturum kapanışı kancasına bağlansa yedek HİÇ alınmaz, başarılı görünürdü.
 */
function kok() {
  return anaKok()
}

/**
 * ⭐YEDEKLENEN DEPOLAR — "sage" tek başına değil.
 *
 * 2026-09-19 ölçüldü: iş kartı panosu da aynı yerde, aynı biçimde yaşıyor —
 * `.wrongstack/kanbans/_kanban.sqlite`, WAL kipli, git DIŞI, yedeksiz. Ölçüm anında ana dosya
 * **4 KB**, yanındaki WAL **148 KB** idi: yani panonun içeriği pratikte TAMAMEN WAL'daydı ve
 * düz bir dosya kopyası neredeyse BOŞ bir pano verirdi. Bu, sage'de bedel ödeyerek öğrendiğimiz
 * kusurun aynısıdır; ders zaten yazılıydı ("WAL kipli HERHANGİ bir SQLite verisi").
 *
 * `ana`: kayıt sayısının anlamlı olduğu tablo (varsa). Yoksa parmak izi tüm tabloların
 * satır sayılarından kurulur — depo biçimini bilmek gerekmez.
 */
/**
 * ⭐DEPO BAŞINA SIKLIK VE SAKLAMA (ARC-9, 2026-10-01; karar 219: Linear donuk, iş kartlarının
 * TEK kaynağı Kanban). Ölçüldü 10-01: 24 saat kuralı yüzünden sabah 08:53Z yedeğinde 10 pano /
 * 387 kart vardı, öğlen canlıda 12 pano / 414 kart; aradaki 27 kart ertesi sabaha kadar yedeksizdi.
 *
 * `tazeSaat`  : son yedek bundan yeniyse kanca o depoyu ATLAR (kanban 1 saat, sage 24 saat).
 * `uyariSaat` : son yedek bundan eskiyse istem satırı KONUŞUR (kanban 24 saat, sage 72 saat).
 * `saklama`   : `{ son, gunluk }` — en yeni `son` kopya + son `gunluk` günün her biri için o günün
 *               EN YENİ kopyası. Yoksa düz kural: en yeni `TUTULACAK` kopya. (Saatlik yedekte düz
 *               "son 14" yalnız ~14 saati tutardı; dünkü pano bugün silinmiş olurdu.)
 * `servis`    : çalışan servisin pid dosyası (varsa). `--geri` servis CANLIYKEN reddeder.
 */
const DEPOLAR = [
  {
    ad: 'sage',
    goreli: ['.wrongstack', 'memories', 'sage.db'],
    onek: 'sage-',
    uzanti: '.db',
    ana: 'memories',
    tazeSaat: 24,
    uyariSaat: 72,
    saklama: null,
    servis: null,
    // ARC-71: geri yükleme sage-mcp süreçleri YOKKEN yapılır (her pencere bir sunucu açar; WAL açık tutulur).
    surecDeseni: /sage-mcp[\\/]dist[\\/]cli\.js/i,
  },
  {
    ad: 'kanban',
    goreli: ['.wrongstack', 'kanbans', '_kanban.sqlite'],
    onek: 'kanban-',
    uzanti: '.sqlite',
    ana: null,
    tazeSaat: 1,
    uyariSaat: 24,
    saklama: { son: 24, gunluk: 30 },
    servis: ['.wrongstack', 'kanban-server.json'],
    // ARC-71 (OPS 10-12): ARC-98'den beri her pencere kanban-mcp'yi stdio + --writable açar; dosyayı açık tutan süreç
    // `kanban-server.json` pid dosyasında GÖRÜNMEZ (canlıda 4 `kanban-mcp/dist/cli.js` süreci ölçüldü). Pid denetimi
    // KALIR, süreç taraması ÜSTÜNE eklenir; ikisinden biri canlı derse RET.
    surecDeseni: /kanban-mcp[\\/]dist[\\/]cli\.js/i,
  },
]

/** Posta kutularının üst dizini: ortam değişkeni ya da `~/.wrongstack/projects` (proje dizini DEĞİL, kullanıcı dizini). */
function postaKoku() {
  return process.env.VENTHUB_POSTA_KOKU || path.join(os.homedir(), '.wrongstack', 'projects')
}

/**
 * ⭐POSTA KUTULARI (ARC-71): kökteki her `<proje>/_mailbox.sqlite` AYRI bir depodur (`posta-<proje>`).
 * Her çağrıda yeniden taranır: pencereler yeni kök (c:/C: harf farkı, yeni worktree) üretebilir; sabit liste
 * sessizce eksik kalırdı. Dosyası olmayan dizin depo sayılmaz. Hepsi aynı eşiği taşır (sage ile aynı).
 */
function postaDepolari(koku = postaKoku()) {
  let adlar
  try {
    adlar = fs.readdirSync(koku).sort()
  } catch {
    return []
  }
  return adlar
    .filter((a) => fs.existsSync(path.join(koku, a, '_mailbox.sqlite')))
    .map((a) => ({
      ad: 'posta-' + a,
      mutlak: path.join(koku, a, '_mailbox.sqlite'),
      onek: 'posta-' + a + '-',
      uzanti: '.sqlite',
      ana: null,
      tazeSaat: 24,
      uyariSaat: 72,
      saklama: null,
      servis: null,
      // Her pencere kendi mailbox-mcp süreciyle (ya da sarmalayıcıyla) kutuyu açık tutar.
      surecDeseni: /mailbox-mcp[\\/]dist[\\/]cli\.js|posta-kutusu\.cjs/i,
      // Canlı kutu: kaynak yedek sırasında değişebilir; sayım uyuşmazsa bir kez daha denenir.
      canli: true,
    }))
}

/** Sabit depolar (sage, kanban) + bulunan posta kutuları. `DEPOLAR` dışa açık kalır (yalnız sabit ikili). */
function tumDepolar(postaKokuYol) {
  return [...DEPOLAR, ...postaDepolari(postaKokuYol)]
}

const depoBul = (ad) => tumDepolar().find((d) => d.ad === ad) || DEPOLAR[0]

/** Bu deponun yedek dosya adı deseni. Posta kutuları SIKI desen kullanır (`posta-a-` ile `posta-a-b-` karışmasın). */
function yedekDeseni(depo) {
  const kac = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (depo.mutlak) return new RegExp('^' + kac(depo.onek) + '\\d{4}-\\d{2}-\\d{2}T\\d{4}Z' + kac(depo.uzanti) + '$')
  return new RegExp('^' + depo.onek + '.*' + depo.uzanti.replace('.', '\\.') + '$')
}

function kaynakYolu(k = kok(), depoAdi = 'sage') {
  const depo = depoBul(depoAdi)
  return depo.mutlak ? depo.mutlak : path.join(k, ...depo.goreli)
}

/** Git DIŞI hedef dizin. Depo içine ASLA yazılmaz (ikili + üç yazar = çözülemez çatışma). */
function yedekDizini() {
  if (process.env.VENTHUB_SAGE_YEDEK_DIZINI) return process.env.VENTHUB_SAGE_YEDEK_DIZINI
  const taban =
    process.env.LOCALAPPDATA || process.env.XDG_STATE_HOME || path.join(process.env.HOME || '.', '.local', 'state')
  return path.join(taban, 'venthub-sage-yedek')
}

/** node:sqlite deneysel: uyarı stderr'e düşmesin (dinleyici require'DAN ÖNCE kaldırılır). */
function sqlite() {
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  return require('node:sqlite')
}

/**
 * Bir veritabanının parmak izi: tablo adları + HER TABLONUN satır sayısı. Karşılaştırma bununla.
 *
 * ⛔TABLO LİSTESİ TEK BAŞINA YETMEZ: boş bir kopya da aynı tablo listesini taşır. Satır
 * sayıları olmadan "doğrulandı" cümlesi kurulamaz — sage'de ölçülen kusur tam buydu
 * (düz kopya 26 kaydın 20'sini veriyordu, tablolar aynıydı).
 *
 * @param {string} yol veritabanı dosyası
 * @param {string|null} ana kayıt sayısının anlamlı olduğu tablo; yoksa toplam satır kullanılır
 */
function parmakIzi(yol, ana = 'memories') {
  const { DatabaseSync } = sqlite()
  const db = new DatabaseSync(yol, { readOnly: true })
  try {
    const kayitlar = db
      .prepare("select name, sql from sqlite_master where type='table' and name not like 'sqlite_%' order by name")
      .all()
    const tablolar = kayitlar.map((r) => r.name)
    /**
     * ⛔SANAL TABLO SAYILMAZ. Ölçüldü 2026-09-19: sage'in `memories_fts` tablosu harici
     * içerikli bir FTS5 sanal tablosudur ve `count(*)` "no such column: T.text" ile PATLAR.
     * İlk genel yazımda bu yüzden sage yedeği tamamen düştü — ve iyi ki düştü, çünkü sessiz
     * kalsaydı yedek alınmadan "alındı" denecekti. Sanal tablo LİSTEDE kalır (varlığı
     * karşılaştırılır), yalnız satır sayımının dışında tutulur; gölge tabloları
     * (`*_fts_data`, `*_fts_idx`, `*_fts_docsize`) zaten gerçek tablodur ve sayılır.
     */
    const satirlar = {}
    for (const r of kayitlar) {
      if (/^\s*create\s+virtual\s+table/i.test(String(r.sql || ''))) {
        satirlar[r.name] = 'SANAL'
        continue
      }
      try {
        satirlar[r.name] = Number(db.prepare(`select count(*) as c from "${r.name.replace(/"/g, '""')}"`).get().c)
      } catch (e) {
        // Sayılamayan tablo "yok" sayılmaz; iki tarafta AYNI sebeple sayılamıyorsa eşleşir.
        satirlar[r.name] = 'OLCULEMEDI:' + String((e && e.message) || e).slice(0, 60)
      }
    }
    const anaVar = ana !== null && tablolar.includes(ana)
    const sayilabilir = Object.values(satirlar).filter((v) => typeof v === 'number')
    const sayi = anaVar ? satirlar[ana] : sayilabilir.reduce((a, b) => a + b, 0)
    // `aktif` yalnız `status` sütunu GERÇEKTEN varsa ölçülür; yoksa null — uydurulmaz.
    let aktif = null
    if (anaVar) {
      const sutunlar = db.prepare(`pragma table_info("${ana.replace(/"/g, '""')}")`).all().map((r) => r.name)
      if (sutunlar.includes('status')) {
        aktif = Number(db.prepare(`select count(*) as c from "${ana}" where status='active'`).get().c)
      }
    }
    return { tablolar, satirlar, sayi, aktif }
  } finally {
    try {
      db.close()
    } catch {
      /* süreç zaten bitiyor */
    }
  }
}

/**
 * Kanban veritabanının İÇERİK sayımı: pano, kart, olay + bütünlük denetimi (ARC-9).
 *
 * ⭐NİÇİN AYRI: kartlar `kanban_boards.payload` JSON'unun İÇİNDE yaşar. Satır sayısı parmak izi
 * "12 pano satırı var" der ama bir payload boşalmış ya da bozulmuşsa GÖRMEZ. Kart sayısı
 * payload'ların içinden okunur; `pragma integrity_check` sayfa düzeyindeki bozulmayı yakalar.
 *
 * `kanban_boards` tablosu yoksa (başka biçimde bir veritabanı) `null` döner — uydurma sayı yok.
 * Kart İÇERİĞİNİ okuyan katman burası DEĞİL: `scripts/nlm/kanban_disa_aktar.py` (HARİTA). Burada
 * yalnız sayım var; ikinci bir okuyucu yazılmaz.
 *
 * @returns {{pano:number, kart:number, olay:number|null, bozukPayload:number, butunluk:string}|null}
 */
function kanbanSayim(yol) {
  const { DatabaseSync } = sqlite()
  const db = new DatabaseSync(yol, { readOnly: true })
  try {
    const varMi = (t) =>
      db.prepare("select count(*) as c from sqlite_master where type='table' and name=?").get(t).c > 0
    if (!varMi('kanban_boards')) return null
    let kart = 0
    let bozukPayload = 0
    const satirlar = db.prepare('select payload from kanban_boards').all()
    for (const r of satirlar) {
      try {
        const p = JSON.parse(String(r.payload))
        if (!Array.isArray(p.tasks)) bozukPayload++
        else kart += p.tasks.length
      } catch {
        bozukPayload++
      }
    }
    const olay = varMi('kanban_events') ? Number(db.prepare('select count(*) as c from kanban_events').get().c) : null
    const b = db.prepare('pragma integrity_check').all()
    const butunluk = b.length === 1 && String(Object.values(b[0])[0]) === 'ok' ? 'ok' : 'BOZUK'
    return { pano: satirlar.length, kart, olay, bozukPayload, butunluk }
  } finally {
    try {
      db.close()
    } catch {
      /* süreç zaten bitiyor */
    }
  }
}

function damga(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(
    d.getUTCMinutes(),
  )}Z`
}

/**
 * Tutarlı yedek alır ve DOĞRULAR.
 * @returns {{durum:'alindi'|'dogrulanmadi'|'kaynak-yok'|'hata', yol?:string, kaynak?:object, yedek?:object, sebep?:string}}
 */
function yedekAl(simdi = new Date(), depoAdi = 'sage', deneme = 1) {
  const depo = depoBul(depoAdi)
  const kaynak = kaynakYolu(kok(), depo.ad)
  if (!fs.existsSync(kaynak)) return { durum: 'kaynak-yok', depo: depo.ad, sebep: kaynak }

  const dizin = yedekDizini()
  fs.mkdirSync(dizin, { recursive: true })
  const hedef = path.join(dizin, `${depo.onek}${damga(simdi)}${depo.uzanti}`)
  /**
   * ⭐GEÇİCİ DOSYA (ARC-71): ad dakika çözünürlüklüdür; aynı dakikada ikinci koşum VACUUM INTO'yu "dosya zaten var"
   * ile düşürüyordu (kod okuması, OPS 10-09). Yedek önce `.gecici`ye yazılıp DOĞRULANIR, sonra adına döner;
   * doğrulama düşerse aynı dakikadaki sağlam yedek yerinde kalır. `.gecici` hiçbir yedek deseniyle eşleşmez.
   */
  const yaz = hedef + '.gecici'
  try {
    fs.unlinkSync(yaz)
  } catch {
    /* yoktu */
  }

  let kaynakIzi
  let kaynakKanban = null
  try {
    kaynakIzi = parmakIzi(kaynak, depo.ana)
    if (depo.ad === 'kanban') kaynakKanban = kanbanSayim(kaynak)
    const { DatabaseSync } = sqlite()
    const db = new DatabaseSync(kaynak, { readOnly: true })
    try {
      // ⭐VACUUM INTO: WAL dahil TEK tutarlı dosya. Kaynağa YAZMAZ (readOnly ile açıldı).
      db.exec(`VACUUM INTO '${yaz.replace(/'/g, "''")}'`)
    } finally {
      try {
        db.close()
      } catch {
        /* süreç zaten bitiyor */
      }
    }
  } catch (e) {
    return { durum: 'hata', sebep: String((e && e.message) || e).slice(0, 200) }
  }

  // GERİ YÜKLEME DENEMESİ: yedeği aç, parmak izini kaynakla karşılaştır.
  let yedekIzi
  try {
    yedekIzi = parmakIzi(yaz, depo.ana)
  } catch (e) {
    const bozuk = hedef + '.DOGRULANMADI'
    try {
      fs.renameSync(yaz, bozuk)
    } catch {
      /* yeniden adlandırma başarısızsa dosya yerinde kalır; durum yine kırmızı */
    }
    return { durum: 'dogrulanmadi', yol: bozuk, sebep: 'yedek acilamadi: ' + String((e && e.message) || e).slice(0, 160) }
  }

  const uyusuyor =
    yedekIzi.sayi === kaynakIzi.sayi &&
    yedekIzi.aktif === kaynakIzi.aktif &&
    yedekIzi.tablolar.join(',') === kaynakIzi.tablolar.join(',') &&
    JSON.stringify(yedekIzi.satirlar) === JSON.stringify(kaynakIzi.satirlar)
  if (!uyusuyor) {
    // Canlı kutuda (pencereler yazıyor) kaynak, kopya ile sayım arasında ilerlemiş olabilir: bir kez daha dene.
    if (depo.canli && deneme < 2) {
      try {
        fs.unlinkSync(yaz)
      } catch {
        /* silinemedi: yeniden denemede ezilir */
      }
      return yedekAl(simdi, depoAdi, deneme + 1)
    }
    const bozuk = hedef + '.DOGRULANMADI'
    try {
      fs.renameSync(yaz, bozuk)
    } catch {
      /* aynı: durum kırmızı kalır */
    }
    return {
      durum: 'dogrulanmadi',
      yol: bozuk,
      kaynak: kaynakIzi,
      yedek: yedekIzi,
      sebep: `parmak izi uyusmuyor (kaynak ${kaynakIzi.sayi}/${kaynakIzi.aktif}, yedek ${yedekIzi.sayi}/${yedekIzi.aktif})`,
    }
  }

  /**
   * ⭐KANBAN İÇERİK DOĞRULAMASI (ARC-9): satır sayıları tutsa da kart sayısı ve bütünlük ayrıca
   * ölçülür. Kaynakta `kanban_boards` yoksa (`null`) bu adım atlanır — olmayan şey karşılaştırılmaz.
   */
  let yedekKanban = null
  if (kaynakKanban) {
    let sebep = null
    try {
      yedekKanban = kanbanSayim(yaz)
      if (!yedekKanban) sebep = 'yedekte kanban_boards tablosu yok'
      else if (yedekKanban.butunluk !== 'ok') sebep = 'butunluk denetimi BOZUK'
      else if (yedekKanban.bozukPayload > 0) sebep = `${yedekKanban.bozukPayload} pano payload'i okunamiyor`
      else if (yedekKanban.pano !== kaynakKanban.pano || yedekKanban.kart !== kaynakKanban.kart)
        sebep = `kart sayimi uyusmuyor (kaynak ${kaynakKanban.pano} pano / ${kaynakKanban.kart} kart, yedek ${yedekKanban.pano} / ${yedekKanban.kart})`
    } catch (e) {
      sebep = 'kart sayimi yapilamadi: ' + String((e && e.message) || e).slice(0, 120)
    }
    if (sebep) {
      const bozuk = hedef + '.DOGRULANMADI'
      try {
        fs.renameSync(yaz, bozuk)
      } catch {
        /* aynı: durum kırmızı kalır */
      }
      return {
        durum: 'dogrulanmadi',
        yol: bozuk,
        kaynak: kaynakIzi,
        yedek: yedekIzi,
        sebep,
      }
    }
  }

  // Doğrulandı: geçici dosya asıl adına döner (aynı dakikadaki eski kopyanın yerine geçer).
  try {
    fs.renameSync(yaz, hedef)
  } catch (e) {
    return { durum: 'hata', sebep: 'yedek adina tasinamadi: ' + String((e && e.message) || e).slice(0, 160) }
  }
  budama(dizin, depo.ad)
  return {
    durum: 'alindi',
    depo: depo.ad,
    yol: hedef,
    kaynak: kaynakIzi,
    yedek: yedekIzi,
    kanban: yedekKanban,
  }
}

/**
 * HER deponun yedeğini alır. Oturum kancası ve CLI bunu çağırır.
 *
 * ⛔"Biri alındı" HEPSİ ALINDI DEMEK DEĞİLDİR: her depo ayrı ayrı döner, çağıran hepsini
 * raporlar. Tek bir başarılı satırın ötekinin düştüğünü örtmesi, yedeksizliğin sessiz hâlidir.
 */
function hepsiniAl(simdi = new Date()) {
  return tumDepolar().map((d) => ({ depo: d.ad, ...yedekAl(simdi, d.ad) }))
}

/** En yeni TUTULACAK yedeği bırakır. `.DOGRULANMADI` dosyalarına DOKUNMAZ (kanıt olarak kalır). */
function budama(dizin = yedekDizini(), depoAdi = 'sage') {
  const depo = depoBul(depoAdi)
  const desen = yedekDeseni(depo)
  let dosyalar
  try {
    dosyalar = fs
      .readdirSync(dizin)
      .filter((f) => desen.test(f))
      .sort()
  } catch {
    return []
  }
  const silinecek = depo.saklama
    ? kademeliSilinecek(dosyalar, depo)
    : dosyalar.slice(0, Math.max(0, dosyalar.length - TUTULACAK))
  for (const f of silinecek) {
    try {
      fs.unlinkSync(path.join(dizin, f))
    } catch {
      /* silinemezse bir sonraki koşumda tekrar denenir */
    }
  }
  return silinecek
}

/**
 * KADEMELİ SAKLAMA: en yeni `son` kopya + son `gunluk` günün her birinin EN YENİ kopyası kalır.
 * Dosya adındaki damga (`<onek>YYYY-MM-DDTHHMMZ`) sıralıdır; gün, adın içinden okunur (mtime
 * değil — kopyalanan/taşınan dosyada mtime yalan söyler). Adı çözülemeyen dosya SİLİNMEZ.
 *
 * @param {string[]} dosyalar eskiden yeniye sıralı adlar
 * @returns {string[]} silinecek adlar
 */
function kademeliSilinecek(dosyalar, depo) {
  const { son, gunluk } = depo.saklama
  const kalan = new Set(dosyalar.slice(Math.max(0, dosyalar.length - son)))
  const gunSonu = new Map() // gün → o günün en yeni dosyası
  for (const f of dosyalar) {
    const m = f.slice(depo.onek.length).match(/^(\d{4}-\d{2}-\d{2})T/)
    if (!m) {
      kalan.add(f)
      continue
    }
    gunSonu.set(m[1], f) // sıralı geldiği için son yazan en yenidir
  }
  const gunler = [...gunSonu.keys()].sort()
  for (const g of gunler.slice(Math.max(0, gunler.length - gunluk))) kalan.add(gunSonu.get(g))
  return dosyalar.filter((f) => !kalan.has(f))
}

/** Verilen pid yaşıyor mu. Yetki hatası (EPERM) "yaşıyor" demektir; yalnız ESRCH "yok"tur. */
function surecCanli(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return Boolean(e && e.code === 'EPERM')
  }
}

/**
 * ⭐KANONİK YOL (ARC-71, OPS 10-12): "bu hedef canlı depo mu" sorusu YAZILIŞA bakmaz. Büyük/küçük harfli sürücü, `\` ya da `/`
 * ayracı, sondaki ayraç, bir junction ya da worktree üzerinden verilen aynı dizin AYNI yola iner: gerçek yol (`realpath.native`: junction ve
 * sembolik bağları çözer, Windows'ta gerçek harf büyüklüğünü verir) + `/` ayracı + sondaki ayraç yok + Windows'ta küçük harf.
 * Dosya henüz yoksa var olan en yakın üst dizin çözülür, kalan parça eklenir. HİÇ çözülemezse `null` (çağıran RET eder).
 * @param {string} yol
 * @returns {string|null}
 */
function kanonikYol(yol) {
  if (typeof yol !== 'string' || !yol) return null
  let su = path.resolve(yol)
  const kuyruk = []
  for (let i = 0; i < 64; i++) {
    try {
      const gercek = fs.realpathSync.native(su)
      let tam = kuyruk.length ? path.join(gercek, ...kuyruk.slice().reverse()) : gercek
      tam = tam.replace(/\\/g, '/').replace(/^\/\/\?\//, '').replace(/\/+$/, '')
      return process.platform === 'win32' ? tam.toLowerCase() : tam
    } catch {
      const ust = path.dirname(su)
      if (ust === su) return null
      kuyruk.push(path.basename(su))
      su = ust
    }
  }
  return null
}

/** İki yol AYNI dosyaya (dev+ino) işaret ediyor mu: sert bağ ve kanonikleştirmenin göremediği bağlar için ikinci emniyet. */
function ayniDosyaMi(a, b) {
  try {
    const x = fs.statSync(a, { bigint: true })
    const y = fs.statSync(b, { bigint: true })
    return x.ino !== 0n && x.ino === y.ino && x.dev === y.dev
  } catch {
    return false
  }
}

/**
 * Bu betiğin CANLI saydığı ana ağaç köklerinin kanonik yolları: betiğin kendi ağacı, çalışma dizini ve
 * CLAUDE_PROJECT_DIR'den `git --git-common-dir` ile çözülenler. Hiçbiri çözülemezse boş liste (çağıran RET eder).
 */
function canliKokAdaylari() {
  const sonuc = new Set()
  for (const a of [path.resolve(__dirname, '..', '..'), process.cwd(), process.env.CLAUDE_PROJECT_DIR]) {
    const k = a ? anaKokBul(a) : null
    const kk = k ? kanonikYol(k) : null
    if (kk) sonuc.add(k)
  }
  return [...sonuc]
}

/**
 * ⛔FAIL-CLOSED: `true` = hedef CANLI ya da ÖLÇÜLEMEDİ. `false` yalnız şu hâlde: hedef yol çözüldü, canlı kökler
 * çözüldü VE hedef hiçbirine (kanonik yol, dev+ino, git ağacı üyeliği) eşit değil.
 * @param {object} depo `tumDepolar()` satırı
 * @param {string} hedefYol geri yüklenecek dosyanın yolu
 * @param {string|null} hedefKok sage/kanban için kök (posta için null)
 * @param {string} [canliPostaKoku] canlı posta kökü; yalnız test enjekte eder (komut satırı/ortam değişkeni sunmaz:
 *   güvenlik denetiminin "canlı nedir" tanımı operatörün elinde bir anahtar olmamalı)
 * @param {string[]|null} [canliKokler] canlı ana ağaç kökleri; yalnız test enjekte eder (null = betikten çözülür)
 */
function canliHedefMi(
  depo,
  hedefYol,
  hedefKok,
  canliPostaKoku = path.join(os.homedir(), '.wrongstack', 'projects'),
  canliKokler = null,
) {
  const hk = kanonikYol(hedefYol)
  if (!hk) return true
  let canliYollar
  if (depo.mutlak) {
    const proje = path.basename(path.dirname(depo.mutlak))
    canliYollar = [path.join(canliPostaKoku, proje, '_mailbox.sqlite')]
  } else {
    const kokler = canliKokler || canliKokAdaylari()
    if (kokler.length === 0) return true
    canliYollar = kokler.map((k) => path.join(k, ...depo.goreli))
    // Hedef kök canlı git ağacının İÇİNDEYSE (worktree, alt dizin) canlıdır: yazılış farkı bir şey değiştirmez.
    const bagli = hedefKok ? anaKokBul(hedefKok) : null
    const bagliK = bagli ? kanonikYol(bagli) : null
    if (bagliK && kokler.some((k) => kanonikYol(k) === bagliK)) return true
  }
  for (const c of canliYollar) {
    const ck = kanonikYol(c)
    if (!ck) return true
    if (ck === hk || ayniDosyaMi(c, hedefYol)) return true
  }
  return false
}

/**
 * YEDEKTEN GERİ YÜKLEME (ARC-9, ARC-71). Yalnız `servis` ya da `surecDeseni` tanımlı depolar
 * (kanban; ARC-71 ile sage ve her posta kutusu).
 *
 * ⭐YALITILMIŞ KÖK (ARC-71, OPS 10-12): `secenek.kok` (sage/kanban) ya da `secenek.postaKoku` (posta) VERİLMİŞSE ve
 * hedef kanonik karşılaştırmayla canlı depo DEĞİLSE süreç/servis denetimi atlanır ("yalıtılmış kök": pencereler açıkken
 * bir C:/tmp kopyasına geri yükleme provası). Seçenek verilmezse ya da hedef canlıysa/ölçülemezse denetim AYNEN kalır.
 * Ortam değişkeni tek başına denetimi ATLATMAZ: atlatma bilinçli bir seçenek ister.
 *
 * ⛔SERVİS CANLIYKEN REDDEDER: çalışan servis dosyayı açık tutar; altından değiştirmek ya
 * başarısız olur ya da servis eski içeriği WAL'dan geri yazar. Önce servis kapatılır.
 * ⛔HİÇBİR ŞEY SİLİNMEZ: mevcut veritabanı ve WAL/SHM dosyaları `.oncesi-<damga>` ekiyle yan yana
 * bırakılır. Geri yükleme yanlış çıkarsa eski hâl bir yeniden adlandırma uzağındadır.
 * ⭐`evet` verilmeden yalnız NE YAPACAĞINI söyler (`kuru`). Yedek, yazılmadan ÖNCE doğrulanır;
 * yazıldıktan SONRA parmak izi yedekle karşılaştırılır.
 *
 * @param {string} depoAdi
 * @param {string|null} dosyaAdi yedek dizinindeki dosya adı; verilmezse en yeni sağlam yedek
 * @param {{evet?: boolean, simdi?: Date, surecler?: string[]|null, kok?: string, postaKoku?: string, canliPostaKoku?: string}} secenek
 *   `canliPostaKoku`: YALNIZ test enjeksiyonu (CLI sunmaz).
 */
function geriYukle(depoAdi, dosyaAdi = null, secenek = {}) {
  const depo = tumDepolar(secenek.postaKoku || undefined).find((d) => d.ad === depoAdi)
  if (!depo) return { durum: 'hata', sebep: `bilinmeyen depo: ${depoAdi}` }
  if (!depo.servis && !depo.surecDeseni)
    return {
      durum: 'hata',
      sebep: `${depo.ad} icin geri yukleme tanimli degil (servis denetimi yok)`,
    }

  const dizin = yedekDizini()
  const desen = yedekDeseni(depo)
  const saglam = liste(dizin, depo.onek).filter((y) => desen.test(y.ad))
  const secilen = dosyaAdi ? saglam.find((y) => y.ad === path.basename(dosyaAdi)) : saglam[saglam.length - 1]
  if (!secilen) {
    return {
      durum: 'hata',
      sebep: dosyaAdi ? `yedek bulunamadi: ${dosyaAdi}` : `${dizin} altinda ${depo.ad} yedegi yok`,
    }
  }
  const yedekYol = path.join(dizin, secilen.ad)

  let yedekIzi
  let icerik = null
  try {
    yedekIzi = parmakIzi(yedekYol, depo.ana)
    icerik = depo.ad === 'kanban' ? kanbanSayim(yedekYol) : null
  } catch (e) {
    return {
      durum: 'hata',
      sebep: 'yedek acilamadi: ' + String((e && e.message) || e).slice(0, 160),
    }
  }
  if (icerik && (icerik.butunluk !== 'ok' || icerik.bozukPayload > 0)) {
    return {
      durum: 'hata',
      sebep: `yedek saglam degil (butunluk ${icerik.butunluk}, bozuk payload ${icerik.bozukPayload})`,
    }
  }

  const k = depo.mutlak ? kok() : secenek.kok ? path.resolve(secenek.kok) : kok()
  const hedef = depo.mutlak ? depo.mutlak : path.join(k, ...depo.goreli)

  // Yalıtılmış kök yalnız AÇIK seçenekle istenir; canlı/ölçülemeyen hedef yine tam denetimden geçer.
  const yalitilmisIstek = depo.mutlak ? Boolean(secenek.postaKoku) : Boolean(secenek.kok)
  const yalitilmis =
    yalitilmisIstek && !canliHedefMi(depo, hedef, depo.mutlak ? null : k, secenek.canliPostaKoku || undefined)

  if (!yalitilmis) {
    let pid = null
    if (depo.servis) {
      try {
        pid = Number(JSON.parse(fs.readFileSync(path.join(k, ...depo.servis), 'utf8')).pid)
      } catch {
        /* servis dosyası yok ya da okunamıyor: servis çalışmıyor sayılır */
      }
    }
    if (surecCanli(pid)) {
      return {
        durum: 'servis-canli',
        yedek: secilen.ad,
        sebep: `${depo.ad} servisi calisiyor (pid ${pid}); once servisi kapat, sonra yeniden dene`,
      }
    }
    /**
     * ⭐SÜREÇ DENETİMİ (ARC-71): sage ve posta kutusunda pid dosyası yoktur; dosyayı her pencerenin MCP süreci açık
     * tutar (ARC-98'den beri kanban da stdio sunucusuyla aynı durumda). Komut satırında desen eşleşen süreç varsa RET;
     * süreç listesi ALINAMAZSA da RET (fail-closed): "bakamadım" "kimse yok" demek değildir. Bu betiğin kendi süreci
     * sayılmaz. `secenek.surecler`: test için sahte liste.
     */
    if (depo.surecDeseni) {
      const surecler = 'surecler' in secenek ? secenek.surecler : calisanSurecler()
      if (!Array.isArray(surecler)) {
        return {
          durum: 'servis-olculemedi',
          yedek: secilen.ad,
          sebep: `${depo.ad} icin calisan surec listesi ALINAMADI; pencereler kapali oldugu dogrulanmadan geri yukleme yapilmaz`,
        }
      }
      const acik = surecler.filter((s) => depo.surecDeseni.test(s) && !/sage-yedek\.cjs/.test(s))
      if (acik.length > 0) {
        return {
          durum: 'servis-canli',
          yedek: secilen.ad,
          sebep: `${depo.ad} dosyasini acik tutan ${acik.length} MCP sureci var; once pencereleri kapat, sonra yeniden dene`,
        }
      }
    }
  }

  const tasinacak = [hedef, hedef + '-wal', hedef + '-shm'].filter((f) => fs.existsSync(f))
  const kokTuru = yalitilmis ? 'yalitilmis' : 'canli'
  if (!secenek.evet) {
    return {
      durum: 'kuru',
      yedek: secilen.ad,
      hedef,
      tasinacak,
      iz: yedekIzi,
      icerik,
      kok: kokTuru,
    }
  }

  const ek =
    '.oncesi-' +
    (secenek.simdi || new Date())
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d+Z$/, 'Z')
  const tasinan = []
  try {
    for (const f of tasinacak) {
      fs.renameSync(f, f + ek)
      tasinan.push(f)
    }
    fs.mkdirSync(path.dirname(hedef), { recursive: true })
    const { DatabaseSync } = sqlite()
    const db = new DatabaseSync(yedekYol, { readOnly: true })
    try {
      // Yedek SALT-OKUMA açılır; hedef yeni dosyadır (eskisi az önce yana alındı).
      db.exec(`VACUUM INTO '${hedef.replace(/'/g, "''")}'`)
    } finally {
      try {
        db.close()
      } catch {
        /* süreç zaten bitiyor */
      }
    }
    const sonIz = parmakIzi(hedef, depo.ana)
    if (JSON.stringify(sonIz.satirlar) !== JSON.stringify(yedekIzi.satirlar)) {
      throw new Error('geri yuklenen dosya yedekle uyusmuyor')
    }
  } catch (e) {
    // GERİ SAR: yarım kalan hedef kaldırılır, yana alınanlar eski adına döner.
    try {
      if (tasinan.includes(hedef) && fs.existsSync(hedef)) fs.unlinkSync(hedef)
    } catch {
      /* geri sarma en iyi çabadır; sebep aşağıda raporlanır */
    }
    for (const f of tasinan) {
      try {
        if (!fs.existsSync(f)) fs.renameSync(f + ek, f)
      } catch {
        /* aynı */
      }
    }
    return {
      durum: 'hata',
      yedek: secilen.ad,
      sebep: 'geri yukleme basarisiz, eski hal korundu: ' + String((e && e.message) || e).slice(0, 160),
    }
  }
  return {
    durum: 'geri-yuklendi',
    yedek: secilen.ad,
    hedef,
    oncesi: tasinan.map((f) => f + ek),
    iz: yedekIzi,
    icerik,
    kok: kokTuru,
  }
}

function liste(dizin = yedekDizini(), onek = null) {
  const onekler = onek ? [onek] : tumDepolar().map((d) => d.onek)
  try {
    return fs
      .readdirSync(dizin)
      .filter((f) => onekler.some((o) => f.startsWith(o)))
      .sort()
      .map((f) => {
        const s = fs.statSync(path.join(dizin, f))
        return { ad: f, bayt: s.size, tarih: s.mtime.toISOString() }
      })
  } catch {
    return []
  }
}

/**
 * "Yedeğim ne kadar eski" sorusunun TEK cevabı — istem satırı ve oturum kancası bunu okur.
 *
 * ⛔`.DOGRULANMADI` dosyaları YEDEK SAYILMAZ: onlar bir koşumun düştüğünün kanıtıdır.
 * Doğrulanmamış bir dosyayı "son yedek" saymak, kaybı taze gösterir.
 *
 * @returns {{sonYedek: string|null, gun: number|null, dogrulanmadi: string[], adet: number}}
 */
function sonDurum(dizin = yedekDizini(), simdi = Date.now()) {
  const hepsi = liste(dizin)
  const dogrulanmadi = hepsi.filter((y) => y.ad.endsWith('.DOGRULANMADI')).map((y) => y.ad)

  const depolar = tumDepolar().map((d) => {
    const desen = yedekDeseni(d)
    const saglam = hepsi.filter((y) => desen.test(y.ad))
    const son = saglam.length ? saglam[saglam.length - 1] : null
    let kaynakVar = false
    try {
      kaynakVar = fs.existsSync(kaynakYolu(kok(), d.ad))
    } catch {
      /* kök çözülemedi: depo "ilgisiz" sayılır, uydurma rapor üretilmez */
    }
    const saat = son ? Math.floor((simdi - Date.parse(son.tarih)) / 3_600_000) : null
    return {
      depo: d.ad,
      kaynakVar,
      sonYedek: son ? son.tarih : null,
      gun: son ? Math.floor((simdi - Date.parse(son.tarih)) / 86_400_000) : null,
      saat,
      // Depo kendi eşiğini taşır (kanban 24 saat, sage 72 saat); yedeği hiç olmayan depo ayrıca raporlanır.
      gecikti: saat !== null && saat >= d.uyariSaat,
      adet: saglam.length,
    }
  })

  /**
   * ⭐ÜST DÜZEY ALANLAR EN KÖTÜ HÂLİ ANLATIR. İki depo var; biri dün, biri hiç yedeklenmişse
   * "son yedek dün" demek yalandır. Ölçüt: bu makinede KAYNAĞI OLAN depoların en kötüsü.
   * Kaynağı olmayan depo (ör. pano hiç açılmamış) rapora girmez — olmayan şeyin yedeği istenmez.
   */
  const ilgili = depolar.filter((d) => d.kaynakVar)
  const temel = ilgili.length ? ilgili : depolar
  const yedeksiz = temel.find((d) => d.sonYedek === null)
  const enEski = temel.slice().sort((a, b) => (b.gun === null ? 1 : b.gun) - (a.gun === null ? 1 : a.gun))[0]
  const secilen = yedeksiz || enEski

  return {
    sonYedek: secilen ? secilen.sonYedek : null,
    gun: secilen ? secilen.gun : null,
    dogrulanmadi,
    adet: temel.reduce((a, d) => a + d.adet, 0),
    geciken: temel.filter((d) => d.gecikti).map((d) => ({ depo: d.depo, saat: d.saat })),
    depolar,
  }
}

module.exports = {
  TUTULACAK,
  DEPOLAR,
  tumDepolar,
  postaDepolari,
  postaKoku,
  calisanSurecler,
  yedekDeseni,
  kaynakYolu,
  yedekDizini,
  parmakIzi,
  yedekAl,
  hepsiniAl,
  budama,
  liste,
  damga,
  sonDurum,
  kanbanSayim,
  kademeliSilinecek,
  surecCanli,
  kanonikYol,
  canliHedefMi,
  geriYukle,
}

if (require.main === module) {
  const geriIdx = process.argv.indexOf('--geri')
  if (geriIdx !== -1) {
    /**
     * `--geri <depo> [yedek-dosya-adi] [--evet]` — `--evet` YOKSA yalnız planı yazar.
     * Çıkış: 0 = plan yazıldı / geri yüklendi · 1 = reddedildi ya da başarısız · 2 = kullanım hatası.
     */
    // `--kok <yol>` (sage/kanban) ve `--posta-koku <yol>` (posta) değer alır; kalanlar konumsal argümandır.
    const kalan = []
    const secenekler = { evet: false }
    const args = process.argv.slice(geriIdx + 1)
    for (let i = 0; i < args.length; i++) {
      const a = args[i]
      if (a === '--evet') secenekler.evet = true
      else if (a === '--kok' || a === '--posta-koku') {
        const v = args[i + 1]
        if (!v || v.startsWith('--')) {
          process.stderr.write(`sage-yedek: ${a} bir dizin yolu ister\n`)
          process.exit(2)
        }
        secenekler[a === '--kok' ? 'kok' : 'postaKoku'] = v
        i++
      } else if (!a.startsWith('--')) kalan.push(a)
    }
    if (!kalan[0]) {
      process.stderr.write(
        'kullanim: sage-yedek.cjs --geri <depo> [yedek-dosya-adi] [--evet] [--kok <yol> | --posta-koku <yol>]\n',
      )
      process.exit(2)
    }
    const r = geriYukle(kalan[0], kalan[1] || null, secenekler)
    const sayim = r.icerik ? `${r.icerik.pano} pano / ${r.icerik.kart} kart` : r.iz ? `kayit ${r.iz.sayi}` : ''
    const kokSatiri =
      r.kok === 'yalitilmis'
        ? '  kok      : YALITILMIS KOK (canli depo degil; surec denetimi atlandi)\n'
        : '  kok      : canli kok (surec denetimi yapildi)\n'
    if (r.durum === 'kuru') {
      process.stdout.write(
        `sage-yedek [${kalan[0]}]: GERI YUKLEME PLANI (hicbir sey degismedi)\n` +
          `  yedek    : ${r.yedek} (${sayim})\n` +
          `  hedef    : ${r.hedef}\n` +
          kokSatiri +
          `  yana alinacak (.oncesi-<damga>, SILINMEZ): ${r.tasinacak.length ? r.tasinacak.map((f) => path.basename(f)).join(', ') : 'yok'}\n` +
          `  uygulamak icin ayni komutu --evet ile kos\n`,
      )
      process.exit(0)
    }
    if (r.durum === 'geri-yuklendi') {
      process.stdout.write(
        `sage-yedek [${kalan[0]}]: GERI YUKLENDI ve DOGRULANDI <- ${r.yedek} (${sayim})\n` +
          `  hedef    : ${r.hedef}\n` +
          kokSatiri +
          `  eski hal: ${r.oncesi.length ? r.oncesi.map((f) => path.basename(f)).join(', ') : 'yoktu'}\n`,
      )
      process.exit(0)
    }
    process.stderr.write(`sage-yedek [${kalan[0]}]: ⛔${String(r.durum).toUpperCase()} — ${r.sebep}\n`)
    process.exit(1)
  }
  if (process.argv.includes('--liste')) {
    const l = liste()
    if (!l.length) process.stdout.write(`sage-yedek: ${yedekDizini()} altinda yedek YOK\n`)
    for (const y of l) process.stdout.write(`${y.ad}  ${y.bayt} bayt  ${y.tarih}\n`)
    process.exit(0)
  }
  /**
   * ⛔HER DEPO AYRI RAPORLANIR. "Biri alındı" hepsinin alındığı anlamına gelmez; tek başarılı
   * satırın ötekini örtmesi, yedeksizliğin sessiz hâlidir.
   *
   * ÇIKIŞ KODU: bu makinede KAYNAĞI OLAN bir depo düşerse kırmızı; hiçbir depo yedek
   * üretemediyse de kırmızı. Kaynağı hiç olmayan depo (ör. pano bu makinede açılmamış)
   * tek başına kırmızı yapmaz — olmayan şeyin yedeği istenmez, ama SATIRI yazılır.
   */
  const sonuclar = hepsiniAl()
  let kirmizi = false
  let alinan = 0
  for (const s of sonuclar) {
    if (s.durum === 'alindi') {
      alinan++
      const aktif = s.yedek.aktif === null ? '' : ` (aktif ${s.yedek.aktif})`
      const kart = s.kanban ? ` · ${s.kanban.pano} pano / ${s.kanban.kart} kart, butunluk ${s.kanban.butunluk}` : ''
      process.stdout.write(
        `sage-yedek [${s.depo}]: ALINDI ve DOGRULANDI -> ${s.yol}\n` +
          `  kayit ${s.yedek.sayi}${aktif}, tablo ${s.yedek.tablolar.length}${kart} — kaynakla BIREBIR\n`,
      )
    } else if (s.durum === 'kaynak-yok') {
      process.stdout.write(
        `sage-yedek [${s.depo}]: kaynak YOK — ${s.sebep}\n` +
          `  bu depo bu makinede kurulu degil; yedek alinmadi (tek basina kirmizi DEGIL)\n`,
      )
    } else {
      kirmizi = true
      process.stderr.write(`sage-yedek [${s.depo}]: ⛔${String(s.durum).toUpperCase()} — ${s.sebep}\n`)
    }
  }
  if (alinan === 0) {
    /**
     * ⛔SESSIZ ATLAMA YOK. Eskiden burada çıkış 0 vardı ve "yedek alınmadı" cümlesi başarı
     * gibi okunuyordu. Ölçülen arıza: worktree'den koşumda kaynak HER ZAMAN bulunamıyordu.
     * Artık kök ana ağaca bağlı; orada da hiçbir depo yoksa bu ya gerçek bir kayıptır ya da
     * hiçbiri kurulmamıştır — ikisi de "yedeğim var" demenin karşıtıdır, kırmızıdır.
     */
    process.stderr.write(
      `sage-yedek: ⛔KAYNAK YOK — HICBIR yedek ALINMADI (bu satir BASARI DEGILDIR)\n` +
        `  ana agac : ${kok()}  (git --git-common-dir ile cozuldu)\n` +
        `  aranan   : ${sonuclar.map((s) => s.sebep).join(' · ')}\n`,
    )
    process.exit(2)
  }
  process.exit(kirmizi ? 1 : 0)
}
