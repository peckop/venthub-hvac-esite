#!/usr/bin/env node
/**
 * SAGE DOSYA DERSİ — bir dosyaya dokunulurken o dosyaya ÇAPALANMIŞ dersleri görünür kılar.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR (Recep sorusu, 2026-09-18: "çapalı hafıza kullanılmıyor mu?")
 * ══════════════════════════════════════════════════════════════════════════════
 * Ölçüldü: sage veritabanında 26 kayıt var ve bir kısmı dosya/dizin çapalı. Ama hiçbir
 * pencere bir dosyaya dokunurken onları GÖRMÜYORDU — çünkü okumak için bir aracı KASITLI
 * çağırmak gerekiyordu ve kimse çağırmıyordu. Yani hafıza yazılıyor, okunmuyordu.
 * "Bir kapının var olması, kararın verildiği yerde göründüğü anlamına gelmez" dersinin
 * hafıza hâli budur (REC-342).
 *
 * ── ⭐YUKARI AKIM TASARIMI ÖLÇÜLDÜ, TAKLİT EDİLMEDİ ──
 *
 * WrongStack'in kendi ajanı bunu bir ara katmanla yapıyor
 * (`@wrongstack/sage/middleware/tool-call-memory.js`). Ölçülen varsayılanları:
 *
 *   | Ayar                    | Yukarı akım | BİZ  | Niçin farklı |
 *   |-------------------------|-------------|------|--------------|
 *   | araç başına ders        | 8           | 2    | bizim yüzeyimiz tur başı bağlam, yan kanal değil |
 *   | araç başına karakter    | 2800        | 1024 | Recep'in bütçesi; uzun blok okunmaz |
 *   | tekrar bekleme süresi   | 0 ms        | —    | biz süre değil DOSYA BAŞINA BİR KEZ sayıyoruz |
 *   | getirme bütçesi         | 5000 ms     | 800  | kanca her araç çağrısında koşar, 5 sn turu keser |
 *   | asgari önem             | 0.5         | 0.5  | aynı (ölçülen varsayılan korundu) |
 *   | asgari puan             | 0.72        | 0.45 | bizim puanımız çapa gücü × önem; ölçeği farklı |
 *
 * Yukarı akım ayrıca `containsMemoryText` ile bağlamda GÖRÜNEN dersi yeniden basmıyor ve
 * `selectDiverseMemories` ile çeşitlilik arıyor. İkisi de bizde YOK ve bu bilinçli bir
 * eksiktir: bizim kolumuz dosya başına bir kez konuştuğu için tekrar riski zaten düşük.
 *
 * ── ÇAPA GÜCÜ SAYILARI NEREDEN (ölçüm, varsayım değil) ──
 * `memory_for_file` gerçek çıktısı ölçüldü: dosya çapası `matchStrength 0.9`, dizin çapası
 * `0.5`. Aynı sayılar burada kullanılıyor ki iki yüzey aynı sırayı üretsin.
 *
 * ── ⛔BÜTÇE VE FAIL-OPEN ──
 * Kanca HER Read/Edit/Write çağrısında koşar. Bu yüzden: 800 ms duvar saati bütçesi, salt-okuma
 * bağlantı, hata hâlinde SESSİZ çıkış (kanca turu bloklamaz). "Ölçemedim" ile "ders yok" ayrı
 * şeydir ama burada ikisi de SESSİZDİR — çünkü her araç çağrısında uyarı basan bir kanca üç
 * turda görmezden gelinir (bu depoda ölçülmüş kusur sınıfı).
 *
 * ── DOSYA BAŞINA BİR KEZ, COMPACT'TA SIFIRLANIR ──
 * Recep: "gün içinde defalarca compact oluyor." Compact bağlamı kırpar; kırpılmış bağlamda ders
 * BİR DAHA görünmezse hafıza yine okunmamış olur. Bu yüzden işaretler oturum + NESİL ile
 * anahtarlanır; nesil compact dönüşünde artar (`isaretleriTemizle`, oturum açılışından çağrılır).
 *
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md
 */
const fs = require('fs')
const path = require('path')

/** Ölçülen çapa güçleri (`memory_for_file` çıktısı, 2026-09-18). */
const CAPA_GUCU = { file: 0.9, directory: 0.5, test: 0.9, package: 0.5 }
/** Yukarı akımın `DEFAULT_MIN_IMPORTANCE` değeri — ölçüldü, korundu. */
const ASGARI_ONEM = 0.5
/** Bizim ölçeğimizde (çapa gücü × önem) eşik. 0.5×0.5=0.25 geçmez, 0.9×0.5=0.45 geçer. */
const ASGARI_PUAN = 0.45
const EN_FAZLA_DERS = 2
const DERS_KARAKTER = 300
const TOPLAM_BAYT = 1024
const BUTCE_MS = 800

const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'

/** Sage verisi PROJENİN İÇİNDE yaşar (ana ağaç); worktree'de yoktur. */
function dbYolu(kok) {
  return path.join(kok, '.wrongstack', 'memories', 'sage.db')
}

/** Proje köküne göreli, ileri eğik çizgili yol — çapalar bu biçimde yazılır. */
function goreliYol(kok, dosya) {
  const r = path.relative(kok, dosya)
  if (!r || r.startsWith('..')) return null
  return r.split(path.sep).join('/')
}

/** Dosyanın kendisi + bütün üst dizinleri (çapa eşleşmesi için). */
function yolAdaylari(goreli) {
  const parcalar = goreli.split('/')
  const liste = [goreli]
  for (let i = parcalar.length - 1; i > 0; i--) liste.push(parcalar.slice(0, i).join('/'))
  return liste
}

/**
 * Bir kaydın çapaları verilen yola nasıl değiyor → en yüksek güç. Değmiyorsa 0.
 * Çapa tipi bilinmiyorsa 0 döner: tanımadığım tipe puan vermem (fail-closed puanlama).
 */
function capaGucu(anchors, goreli) {
  let en = 0
  for (const a of anchors || []) {
    if (!a || typeof a.path !== 'string') continue
    const p = a.path.split(path.sep).join('/').replace(/^\.\//, '')
    const g = CAPA_GUCU[a.type] || 0
    if (!g) continue
    if (p === goreli) en = Math.max(en, g)
    else if (a.type !== 'file' && (goreli === p || goreli.startsWith(p + '/'))) en = Math.max(en, g)
  }
  return en
}

/** Ders metnini tek satıra indirir ve kırpar — "sage dersi TEK İŞ söyler" (cetvel kuralı). */
function kisalt(metin, sinir = DERS_KARAKTER) {
  const tek = String(metin || '').replace(/\s+/g, ' ').trim()
  return tek.length <= sinir ? tek : tek.slice(0, sinir - 1) + '…'
}

/**
 * Verilen dosyaya çapalı aktif dersleri puanlayıp sıralar.
 * @returns {{id:string, kind:string, puan:number, metin:string}[]}
 * Ölçemezse FIRLATIR — çağıran sessiz düşer, "ders yok" DEMEZ.
 */
function dersleriBul(kok, dosya, simdi = Date.now()) {
  const goreli = goreliYol(kok, dosya)
  if (!goreli) return []
  const yol = dbYolu(kok)
  if (!fs.existsSync(yol)) return []

  // ⚠node:sqlite deneysel: uyarı stderr'e düşer ve kanca gürültüsü olur. Dinleyici
  // require'DAN ÖNCE kaldırılır (sonra kaldırmak uyarıyı engellemez).
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  const { DatabaseSync } = require('node:sqlite')

  const db = new DatabaseSync(yol, { readOnly: true })
  try {
    const adaylar = yolAdaylari(goreli)
    // LIKE ÖN SÜZGEÇ: çapalar `data` JSON'unun içinde yaşıyor (şema ölçüldü — ayrı çapa
    // tablosu YOK). Süzgeç kabadır; gerçek karar capaGucu() ile JSON okunarak verilir.
    const kosul = adaylar.map(() => 'data LIKE ?').join(' OR ')
    const satirlar = db
      .prepare(
        `select id, data, kind, importance from memories
          where status = 'active' and importance >= ? and (${kosul})
          limit 200`,
      )
      .all(ASGARI_ONEM, ...adaylar.map((a) => `%"path":"${a}"%`))

    const dersler = []
    for (const s of satirlar) {
      if (Date.now() - simdi > BUTCE_MS) break
      let d
      try {
        d = JSON.parse(s.data)
      } catch {
        continue // bozuk kayıt dersi engellemez
      }
      const g = capaGucu(d.anchors, goreli)
      if (!g) continue
      const puan = g * Number(s.importance || 0)
      if (puan < ASGARI_PUAN) continue
      dersler.push({ id: s.id, kind: s.kind, puan, metin: kisalt(d.text) })
    }
    dersler.sort((a, b) => b.puan - a.puan)
    return dersler.slice(0, EN_FAZLA_DERS)
  } finally {
    try {
      db.close()
    } catch {
      /* kapanmazsa süreç zaten bitiyor */
    }
  }
}

/** Görünür satırlar; toplam bayt tavanı AŞILMAZ (son ders gerekirse hiç basılmaz). */
function bicimlendir(goreli, dersler) {
  if (!dersler.length) return ''
  const bas = `SAGE DERSI (${goreli}):\n`
  let cikti = bas
  for (const d of dersler) {
    const satir = `  · [${d.kind}] ${d.metin}\n`
    if (Buffer.byteLength(cikti + satir, 'utf8') > TOPLAM_BAYT) break
    cikti += satir
  }
  return cikti === bas ? '' : cikti
}

/** İşaret dosyası: oturum + NESİL ile anahtarlanır (compact nesli artırır). */
function isaretYolu(oturum, nesil) {
  const ad = `.sage-dersi-${String(oturum || 'oturumsuz').slice(0, 24)}-${nesil}.json`
  return path.join(PANO, ad)
}

function nesilYolu(oturum) {
  return path.join(PANO, `.sage-dersi-nesil-${String(oturum || 'oturumsuz').slice(0, 24)}`)
}

function nesil(oturum) {
  try {
    const n = Number(fs.readFileSync(nesilYolu(oturum), 'utf8').trim())
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

/**
 * Compact dönüşünde çağrılır: nesli artırır, yani bütün işaretler geçersizleşir ve dersler
 * KIRPILMIŞ bağlamda bir kez daha görünür. Eski işaret dosyası SİLİNMEZ (silme riski yok,
 * pano dizini geçici) — yalnız artık okunmaz.
 */
function isaretleriTemizle(oturum) {
  try {
    fs.mkdirSync(PANO, { recursive: true })
    fs.writeFileSync(nesilYolu(oturum), String(nesil(oturum) + 1), 'utf8')
    return true
  } catch {
    return false
  }
}

/** Bu dosya bu oturumda (bu nesilde) gösterildi mi? */
function gorulduMu(oturum, goreli) {
  try {
    const liste = JSON.parse(fs.readFileSync(isaretYolu(oturum, nesil(oturum)), 'utf8'))
    return Array.isArray(liste) && liste.includes(goreli)
  } catch {
    return false
  }
}

function isaretle(oturum, goreli) {
  try {
    const y = isaretYolu(oturum, nesil(oturum))
    let liste = []
    try {
      const v = JSON.parse(fs.readFileSync(y, 'utf8'))
      if (Array.isArray(v)) liste = v
    } catch {
      /* ilk dosya */
    }
    if (!liste.includes(goreli)) liste.push(goreli)
    fs.mkdirSync(PANO, { recursive: true })
    fs.writeFileSync(y, JSON.stringify(liste.slice(-500)), 'utf8')
  } catch {
    /* işaretleyemediysek en kötü hâl: ders ikinci kez görünür. Sessiz kalmaktan iyidir. */
  }
}

/**
 * Kancanın tek girişi. Ölçemezse ya da ders yoksa BOŞ dize döner (sessizlik kuralı).
 * @param {{kok:string, dosya:string, oturum:string}} girdi
 */
function satir({ kok, dosya, oturum }) {
  const t0 = Date.now()
  const goreli = goreliYol(kok, dosya)
  if (!goreli) return ''
  if (gorulduMu(oturum, goreli)) return ''
  let dersler
  try {
    dersler = dersleriBul(kok, dosya, t0)
  } catch {
    return '' // fail-open: ölçemedik, turu bloklamıyoruz
  }
  // Ders bulunmasa da işaretle: aynı dosya için her turda DB açmanın bedeli boşa gider.
  isaretle(oturum, goreli)
  return bicimlendir(goreli, dersler)
}

module.exports = {
  CAPA_GUCU,
  ASGARI_ONEM,
  ASGARI_PUAN,
  EN_FAZLA_DERS,
  DERS_KARAKTER,
  TOPLAM_BAYT,
  BUTCE_MS,
  dbYolu,
  goreliYol,
  yolAdaylari,
  capaGucu,
  kisalt,
  dersleriBul,
  bicimlendir,
  isaretleriTemizle,
  gorulduMu,
  isaretle,
  satir,
}
