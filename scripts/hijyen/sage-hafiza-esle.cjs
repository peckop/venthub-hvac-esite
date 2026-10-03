#!/usr/bin/env node
/**
 * SAGE HAFIZA EŞLEME — konu hafızası .md dosyalarını sage'e DOSYA ÇAPALI kısa kayıt olarak taşır (ARC-23a).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR
 * ══════════════════════════════════════════════════════════════════════════════
 * Sage'de aday/ders üretimi yalnız WrongStack ajan sürecinde çalışır. Claude Code tarafında hiçbir
 * betik `remember` çağırmıyordu; sage'e 2026-09-20'den beri yeni ders girmedi. Konu hafızası ise
 * `memory/*.md` dosyalarında yaşıyor ve bir dosyaya dokunulurken (`sage-dosya-dersi.cjs`) ya da
 * bir konu açılırken (`hafiza-enjeksiyonu.cjs`) GÖRÜNMÜYOR. Bu betik köprüdür: dosyanın içinde
 * adı geçen GERÇEK depo yollarını çapa yapar, kısa bir özet kaydı yazar; sage o kaydı çapalı
 * dosyaya dokunulunca kendisi gösterir.
 *
 * ⛔GÖVDE KOPYALANMAZ: kayıt ≤700 karakterdir (kısa özet + kaynak .md adı). 700, konu kancasının
 * `DERS_BASINA_KARAKTER` tavanıdır; tavanı aşan ders kancada HİÇ BASILMAZ. Tam metin zaten .md
 * dosyasındadır; kayıt oraya işaret eder.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * KAPSAM (OPS hükmü)
 * ══════════════════════════════════════════════════════════════════════════════
 *   · `memory/` altındaki KONU dosyaları + `memory/olcum/*.md`.
 *   · HARİÇ: MEMORY.md · dizin-*.md · ops-cycle-audit-state* · son-konusma-* · günlük/durum dosyaları
 *     (`*-serit-durumu.md`, `*lane-day*`). Alt klasörler (arsiv/, belge-yonetimi-devir/, gunluk/)
 *     taranmaz; yalnız `olcum/` girer.
 *   · ÇAPASIZ kayıt köprüye GİRMEZ (atlanan sayısı raporda görünür). Çapa = dosyanın gövdesinde
 *     backtick içinde geçen ve depoda ŞU AN gerçekten var olan dosya/dizin yolu (büyük-küçük harf
 *     de tutmalı: Windows'ta `Docs/` ile `docs/` aynı dizindir, çapa yalan olurdu).
 *   · `node_modules`, `.git`, `.next`, `graphify-out`, `.wrongstack` çapa olmaz (üretilmiş/ikili).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * İDEMPOTENSİ
 * ══════════════════════════════════════════════════════════════════════════════
 * Anahtar = kaynak dosya adı (etiket `kaynak:<ad>`) + çapa kümesi. Kayıt `ozet:<sha1-12>` etiketi
 * taşır (metin + kind + sıralı çapalar). İkinci koşumda kaynak etiketiyle bulunan kaydın özeti
 * aynıysa ATLANIR (değişmedi), değiştiyse `updateSage` ile güncellenir; YENİ KAYIT AÇILMAZ.
 * Mevcut kayıtlar SİLİNMİŞ/arşivlenmiş/yerine geçilmiş durumda ise yeniden YAZILMAZ — biri
 * (hijyen ya da insan) onu bilerek kaldırdı; köprü onu diriltmez. Kayıt listesi okunamazsa HİÇ
 * YAZILMAZ (listesiz yazmak, her koşumda yinelenen kayıt demektir).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * KİPLER VE GÜVENLİK
 * ══════════════════════════════════════════════════════════════════════════════
 *   node scripts/hijyen/sage-hafiza-esle.cjs         # KURU KİP: hiçbir şey yazmaz; sayılar + ilk 5 örnek
 *   node scripts/hijyen/sage-hafiza-esle.cjs --yaz   # gerçekten yazar
 *
 * ⛔DAEMON BAŞLATMAZ (`hafiza-enjeksiyonu.cjs` ile AYNI kural): `server.json` yoksa ya da pid ölüyse
 * stdout'a TEK satır yazıp çıkış 0 ile döner; sage paketi hiç yüklenmez. Port, spawn etmeyen
 * `connection.status()` ile açılır. Yazma yalnız daemon portundan geçer; doğrudan sqlite yazımı YOK.
 * Port ENJEKTE edilir (`esle({ portAc })`) ki gerçek daemon olmadan sabotajlı test koşabilsin.
 * Hafıza İÇERİĞİ bu dosyada tutulmaz; yalnız mekanizma (repo PUBLIC).
 *
 * Ortam: VENTHUB_HAFIZA_DIZINI (kaynak dizin) · VENTHUB_REPO_KOKU (çapa var-olma denetiminin kökü).
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md.
 */
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { anaKok } = require('./ana-kok.cjs')
const { daemonCanliMi } = require('./hafiza-enjeksiyonu.cjs')

// ── SAYILAR (kapı bunları DEĞERLERİYLE ölçer) ─────────────────────────────────
/** Kayıt metni (kaynak satırı dahil) bu kadar karakteri AŞMAZ — konu kancasının ders başına tavanı. */
const METIN_TAVANI = 700
/** Bir kayıt en çok bu kadar çapa taşır (ilk geçiş sırasıyla): çok çapa, kaydı her dosyada görünür kılar. */
const EN_FAZLA_CAPA = 8
/** Özete, açıklamanın ardından en çok bu kadar gövde cümlesi eklenir. */
const EN_FAZLA_GOVDE_CUMLESI = 3
/**
 * Köprü kayıtlarının önem/güven değeri. Süzgeç eşiği 0.5'tir (`sage-dosya-dersi.cjs` ASGARI_ONEM);
 * 0.6 kaydı görünür kılar ama elle yazılmış 0.9'luk derslerin önüne geçirmez. ⚠Ölçülmüş bir
 * optimum DEĞİL, bir yargıdır; kullanımla yeniden ölçülecek.
 */
const ONEM = 0.6
const GUVEN = 0.7
const KAYNAK_ETIKETI = 'kaynak:'
const OZET_ETIKETI = 'ozet:'
const ESLE_ETIKETI = 'hafiza-esle'
/** Kayıt listesi için TÜM durumlar: kaldırılmış kaydı görmeden "yok" sanıp diriltmeyelim. */
const TUM_DURUMLAR = ['active', 'stale', 'superseded', 'contradicted', 'archived', 'deleted']
/** Güncellenebilir (canlı) durumlar. Diğerleri bilerek kaldırılmıştır. */
const CANLI_DURUMLAR = new Set(['active', 'stale'])
const ORNEK_SAYISI = 5
/** Çapa olamayacak üretilmiş/ikili üst dizinler. */
const CAPA_DISI_KOKLER = new Set(['node_modules', '.git', '.next', 'graphify-out', '.wrongstack'])

// ── KAPSAM ────────────────────────────────────────────────────────────────────

/** Köprü kapsamı DIŞINDAKİ dosya adı mı (taban ad, büyük-küçük harf duyarsız). */
function haricMi(ad) {
  const k = String(ad).toLowerCase()
  return (
    k === 'memory.md' ||
    k.startsWith('dizin-') ||
    k.startsWith('ops-cycle-audit-state') ||
    k.startsWith('son-konusma-') ||
    k.startsWith('gunluk') ||
    k.endsWith('-serit-durumu.md') ||
    k.includes('lane-day')
  )
}

/**
 * Kaynak dizindeki .md dosyaları: üst düzey + `olcum/`. Alt klasörlerin geri kalanı taranmaz.
 * @returns {{kabul: string[], haric: number}} kabul: dizine göreli ileri eğik çizgili adlar
 */
function dosyalariListele(dizin) {
  const kabul = []
  let haric = 0
  for (const alt of ['', 'olcum']) {
    let girdiler
    try {
      girdiler = fs.readdirSync(path.join(dizin, alt), { withFileTypes: true })
    } catch {
      continue // olcum/ yoksa yoktur; üst düzey okunamazsa çağıran boş liste görür
    }
    for (const g of girdiler.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (!g.isFile() || !/\.md$/i.test(g.name)) continue
      if (haricMi(g.name)) {
        haric++
        continue
      }
      kabul.push(alt ? `${alt}/${g.name}` : g.name)
    }
  }
  return { kabul, haric }
}

// ── AYRIŞTIRMA ────────────────────────────────────────────────────────────────

const tekSatir = (metin) =>
  String(metin || '')
    .replace(/\s+/g, ' ')
    .trim()

/** Frontmatter'dan `name`, `description`, `metadata.type`; geri kalanı gövde. Bozuksa meta boş. */
function frontmatterAyir(icerik) {
  const t = String(icerik).replace(/^﻿/, '').replace(/\r\n/g, '\n')
  const m = t.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/)
  if (!m) return { meta: {}, govde: t }
  const meta = {}
  for (const satir of m[1].split('\n')) {
    const a = satir.match(/^(name|description):\s*(.*)$/)
    if (a) {
      let v = a[2].trim()
      if (/^".*"$/.test(v)) v = v.slice(1, -1).replace(/\\"/g, '"')
      else if (/^'.*'$/.test(v)) v = v.slice(1, -1)
      meta[a[1]] = v
      continue
    }
    const tip = satir.match(/^\s+type:\s*(\S+)\s*$/)
    if (tip) meta.type = tip[1]
  }
  return { meta, govde: m[2] }
}

/** İlk `# başlık` (yoksa boş). */
function ilkBaslik(govde) {
  const m = String(govde).match(/^#\s+(.+)$/m)
  return m ? tekSatir(m[1]) : ''
}

/** metadata.type → sage kind. Bilinmiyorsa başlık/ad anahtar sözcüğüne, o da yoksa `fact`. */
function kindBelirle(meta, govde) {
  switch (meta.type) {
    case 'feedback':
      return 'convention'
    case 'project':
    case 'reference':
      return 'fact'
    case 'user':
      return 'preference'
    default: {
      const baslik = `${ilkBaslik(govde)} ${meta.name || ''}`
      return /\b(kural|yasak|standart|cetvel|asla|zorunlu)/i.test(baslik) ? 'convention' : 'fact'
    }
  }
}

// ── ÇAPA ÇIKARMA ──────────────────────────────────────────────────────────────

/** Backtick belirtecini depoya göreli yol adayına çevirir; yol benzeri değilse null. */
function adayYol(ham) {
  let t = String(ham).trim().replace(/\\/g, '/')
  t = t.replace(/(?::\d+(?:-\d+)?|#L\d+(?:-L?\d+)?)$/, '') // dosya.ts:42 · dosya.ts#L10
  t = t.replace(/^\.\//, '').replace(/\/+$/, '')
  if (!t || t.length > 200) return null
  if (/\s/.test(t) || t.includes('://') || t.includes('..')) return null
  if (t.startsWith('/') || /^[a-z]:/i.test(t)) return null // mutlak yol çapa olmaz
  if (/[*<>{}$~|?"'=;,:]/.test(t)) return null // glob, şablon, komut, anahtar=değer
  const yolBenzeri = t.includes('/') || /\.[A-Za-z0-9]{1,6}$/.test(t)
  if (!yolBenzeri) return null
  if (CAPA_DISI_KOKLER.has(t.split('/')[0])) return null
  return t
}

/**
 * Varsayılan var-olma denetimi: yol depoda şimdi VAR mı ve BÜYÜK-KÜÇÜK HARFİ TUTUYOR mu?
 * Windows'ta `existsSync` harf duyarsızdır; gerçek yol (`realpath.native`) ile karşılaştırılır.
 * @returns {(rel: string) => 'file'|'directory'|null}
 */
function varsayilanYolTuru(repoKoku) {
  let gercekKok = null
  try {
    gercekKok = fs.realpathSync.native(repoKoku)
  } catch {
    return () => null // kök okunamıyorsa hiçbir yol çapa olamaz (uydurma çapa YOK)
  }
  return (rel) => {
    try {
      const tam = path.join(repoKoku, rel)
      const st = fs.statSync(tam)
      const bag = path.relative(gercekKok, fs.realpathSync.native(tam)).split(path.sep).join('/')
      if (bag !== rel) return null
      return st.isDirectory() ? 'directory' : 'file'
    } catch {
      return null
    }
  }
}

/**
 * Gövdedeki backtick belirteçlerinden, depoda var olanları (ilk geçiş sırasıyla, benzersiz) çapa yapar.
 * @param {string} govde
 * @param {(rel: string) => 'file'|'directory'|null} yolTuru
 * @returns {{type: 'file'|'directory', path: string}[]}
 */
function capalariCikar(govde, yolTuru) {
  const gorulen = new Set()
  const capalar = []
  for (const m of String(govde).matchAll(/`([^`\n]+)`/g)) {
    const yol = adayYol(m[1])
    if (!yol || gorulen.has(yol)) continue
    gorulen.add(yol)
    const tur = yolTuru(yol)
    if (!tur) continue
    capalar.push({ type: tur, path: yol })
    if (capalar.length >= EN_FAZLA_CAPA) break
  }
  return capalar
}

// ── KAYIT METNİ ───────────────────────────────────────────────────────────────

/** Metni sınıra kadar kelime sınırında keser; kesilmişse `…` ekler. Sınırı ASLA aşmaz. */
function kes(metin, sinir) {
  if (metin.length <= sinir) return metin
  const kirp = metin.slice(0, Math.max(0, sinir - 1))
  const bosluk = kirp.lastIndexOf(' ')
  return (bosluk > sinir * 0.6 ? kirp.slice(0, bosluk) : kirp).trimEnd() + '…'
}

/** Gövdenin anlamlı cümleleri: başlık/tablo/kod bloğu/ayraç atılır, işaretler temizlenir. */
function govdeCumleleri(govde) {
  const parca = []
  let kodBlogu = false
  for (const ham of String(govde).split('\n')) {
    const s = ham.trim()
    if (s.startsWith('```')) {
      kodBlogu = !kodBlogu
      continue
    }
    if (kodBlogu || !s || /^#{1,6}\s/.test(s) || s.startsWith('|') || /^[-*_]{3,}$/.test(s)) continue
    parca.push(
      s
        .replace(/^(?:>\s*)+/, '')
        .replace(/^(?:[-*]\s+|\d+\.\s+)/, '')
        .replace(/\*\*|__/g, ''),
    )
  }
  return tekSatir(parca.join(' '))
    .split(/(?<=[.!?])\s+(?=\S)/u)
    .map(tekSatir)
    .filter((c) => c.length >= 12)
}

/**
 * Kısa özet + kaynak satırı; toplam ≤ METIN_TAVANI. `description` önce, sonra en çok üç gövde
 * cümlesi (bütün cümle sığıyorsa; kırpılmış cümle eklenmez). Açıklama tek başına sığmazsa
 * kelime sınırında kesilir.
 * @returns {string} boş ise dosyada özetlenecek metin yok
 */
function ozetKur(ad, meta, govde) {
  const kaynak = `\nKaynak: ${ad}`
  const sinir = METIN_TAVANI - kaynak.length
  const acik = tekSatir(meta.description)
  let govdeCumlesi = govdeCumleleri(govde)
  let metin = ''
  if (acik) {
    if (acik.length > sinir) return kes(acik, sinir) + kaynak
    metin = acik
    govdeCumlesi = govdeCumlesi.filter((c) => !acik.includes(c))
  } else if (govdeCumlesi.length) {
    metin = kes(govdeCumlesi.shift(), sinir)
  } else if (meta.name) {
    metin = kes(tekSatir(meta.name), sinir)
  }
  if (!metin) return ''
  for (const c of govdeCumlesi.slice(0, EN_FAZLA_GOVDE_CUMLESI)) {
    if (metin.length + 1 + c.length > sinir) break
    metin += ' ' + c
  }
  return metin + kaynak
}

/** Özet kimliği: metin + kind + sıralı çapalar. Biri değişirse kayıt güncellenir. */
function ozetKimligi(metin, kind, capalar) {
  const sirali = capalar.map((c) => `${c.type}:${c.path}`).sort()
  return crypto
    .createHash('sha1')
    .update(JSON.stringify({ metin, kind, capalar: sirali }))
    .digest('hex')
    .slice(0, 12)
}

/**
 * Bir kaynak dosyadan köprü kaydını kurar.
 * @returns {{durum: 'hazir', kayit: object} | {durum: 'capasiz'|'bos'}}
 */
function kayitKur(ad, icerik, yolTuru) {
  const { meta, govde } = frontmatterAyir(icerik)
  const capalar = capalariCikar(govde, yolTuru)
  if (!capalar.length) return { durum: 'capasiz' }
  const metin = ozetKur(ad, meta, govde)
  if (!metin) return { durum: 'bos' }
  const kind = kindBelirle(meta, govde)
  const kaynakEtiketi = `${KAYNAK_ETIKETI}${ad}`
  const ozet = ozetKimligi(metin, kind, capalar)
  return {
    durum: 'hazir',
    kayit: {
      ad,
      kaynakEtiketi,
      ozet,
      kind,
      text: metin,
      anchors: capalar,
      tags: [kaynakEtiketi, ESLE_ETIKETI, `${OZET_ETIKETI}${ozet}`],
    },
  }
}

// ── EŞLEME ────────────────────────────────────────────────────────────────────

const kucukEtiket = (t) => String(t).trim().toLowerCase() // sage etiketleri küçük harfe çevirir

/** Etiketle bulunan kayıtlardan canlı olanı (active > stale), yoksa ilkini tercih eder. */
function mevcutBul(harita, kaynakEtiketi) {
  const liste = harita.get(kucukEtiket(kaynakEtiketi)) || []
  return liste.find((k) => k.status === 'active') || liste.find((k) => CANLI_DURUMLAR.has(k.status)) || liste[0] || null
}

function kayitHaritasi(kayitlar) {
  const harita = new Map()
  for (const k of kayitlar || []) {
    for (const t of k.tags || []) {
      if (!String(t).toLowerCase().startsWith(KAYNAK_ETIKETI)) continue
      const a = kucukEtiket(t)
      if (!harita.has(a)) harita.set(a, [])
      harita.get(a).push(k)
    }
  }
  return harita
}

/**
 * Eşlemenin tek girişi. Daemon yoksa HİÇBİR ŞEY yapmaz (sessiz, fırlatmaz).
 *
 * @param {object} p
 * @param {string} p.hafizaDizini
 * @param {(rel: string) => 'file'|'directory'|null} p.yolTuru çapa var-olma denetimi (enjekte)
 * @param {() => boolean} p.daemonCanli
 * @param {() => Promise<{listSage: Function, rememberSage: Function, updateSage: Function}|null>} p.portAc
 * @param {boolean} [p.yaz] false (varsayılan) = KURU KİP, hiçbir yazma çağrısı yapılmaz
 */
async function esle({ hafizaDizini, yolTuru, daemonCanli, portAc, yaz = false }) {
  const sayilar = {
    taranan: 0,
    eklendi: 0,
    guncellendi: 0,
    degismedi: 0,
    capasiz: 0,
    haric: 0,
    kaldirilmis: 0,
    bos: 0,
    hata: 0,
  }
  const ornekler = []
  const hatalar = []

  const { kabul, haric } = dosyalariListele(hafizaDizini)
  sayilar.haric = haric

  // Daemon kapısı: yoksa port açılmaz, hiçbir şey okunmaz/yazılmaz.
  if (!daemonCanli()) return { durum: 'daemon-yok', yaz, sayilar, ornekler, hatalar }

  const hazirlar = []
  for (const ad of kabul) {
    sayilar.taranan++
    let icerik
    try {
      icerik = fs.readFileSync(path.join(hafizaDizini, ...ad.split('/')), 'utf8')
    } catch (e) {
      sayilar.hata++
      hatalar.push(`${ad}: okunamadi — ${String((e && e.message) || e).slice(0, 80)}`)
      continue
    }
    const r = kayitKur(ad, icerik, yolTuru)
    if (r.durum === 'capasiz') sayilar.capasiz++
    else if (r.durum === 'bos') sayilar.bos++
    else hazirlar.push(r.kayit)
  }

  let port = null
  try {
    port = await portAc()
  } catch {
    port = null
  }
  if (!port) return { durum: 'port-yok', yaz, sayilar, ornekler, hatalar }

  let mevcutlar
  try {
    mevcutlar = await port.listSage(TUM_DURUMLAR)
  } catch (e) {
    // Listesiz yazmak her koşumda yinelenen kayıt demektir: HİÇ yazılmaz.
    hatalar.push(`kayit listesi okunamadi — ${String((e && e.message) || e).slice(0, 120)}`)
    return { durum: 'liste-hatasi', yaz, sayilar, ornekler, hatalar }
  }
  const harita = kayitHaritasi(mevcutlar)

  for (const k of hazirlar) {
    const var_ = mevcutBul(harita, k.kaynakEtiketi)
    if (var_ && !CANLI_DURUMLAR.has(var_.status)) {
      sayilar.kaldirilmis++ // bilerek kaldırılmış kaydı diriltmeyiz
      continue
    }
    if (var_ && (var_.tags || []).some((t) => kucukEtiket(t) === `${OZET_ETIKETI}${k.ozet}`)) {
      sayilar.degismedi++
      continue
    }
    const islem = var_ ? 'GUNCELLE' : 'EKLE'
    if (ornekler.length < ORNEK_SAYISI) {
      ornekler.push({ islem, ad: k.ad, kind: k.kind, capalar: k.anchors.map((c) => c.path), metin: k.text })
    }
    if (yaz) {
      try {
        if (var_) {
          await port.updateSage(var_.id, { text: k.text, kind: k.kind, tags: k.tags, anchors: k.anchors })
        } else {
          await port.rememberSage({
            text: k.text,
            kind: k.kind,
            scope: 'project',
            persistence: 'long_lived',
            importance: ONEM,
            confidence: GUVEN,
            tags: k.tags,
            anchors: k.anchors,
          })
        }
      } catch (e) {
        sayilar.hata++
        hatalar.push(`${k.ad}: yazilamadi — ${String((e && e.message) || e).slice(0, 120)}`)
        continue
      }
    }
    if (var_) sayilar.guncellendi++
    else sayilar.eklendi++
  }
  return { durum: 'tamam', yaz, sayilar, ornekler, hatalar }
}

// ── DAEMON / PORT KABLOSU ─────────────────────────────────────────────────────

/**
 * Gerçek daemon portunu açar — SPAWN ETMEZ (`connection.status()` yalnız var olana bağlanır).
 * Sage paketi ANA AĞAÇTAN yüklenir. Yazma yüzeyi `getSageSurface` (listSage/rememberSage/updateSage).
 */
async function gercekPortAc(dbKok) {
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  const { createRequire } = require('node:module')
  const sage = createRequire(path.join(dbKok, 'tools', 'wrongstack-mcp', 'package.json'))('@wrongstack/sage')
  const port = new sage.ProjectSageMemoryPort({
    projectRoot: dbKok,
    clientId: `claude-code-esle-${process.pid}`,
  })
  const durum = await port.connection.status()
  if (!durum) return null
  const yuzey = sage.getSageSurface(port)
  if (!yuzey) return null
  return {
    listSage: (durumlar) => yuzey.listSage(durumlar),
    rememberSage: (girdi) => yuzey.rememberSage(girdi),
    updateSage: (id, yama) => yuzey.updateSage(id, yama),
  }
}

/** Kaynak dizin: ortam değişkeni, yoksa Claude Code proje klasörü (`belge-tazelik.cjs` ile aynı türetme). */
function hafizaDizinBul(kok, ortam = process.env, home = os.homedir()) {
  if (ortam.VENTHUB_HAFIZA_DIZINI) return ortam.VENTHUB_HAFIZA_DIZINI
  const ad = path.resolve(kok).replace(/[:\\/]/g, '-')
  for (const a of [ad, ad.charAt(0).toLowerCase() + ad.slice(1)]) {
    const y = path.join(home, '.claude', 'projects', a, 'memory')
    if (fs.existsSync(y)) return y
  }
  return null
}

// ── RAPOR ─────────────────────────────────────────────────────────────────────

function raporMetni(r) {
  const s = r.sayilar
  const fiil = r.yaz ? ['eklendi', 'guncellendi'] : ['eklenecek', 'guncellenecek']
  const satirlar = [
    `sage-hafiza-esle: ${r.yaz ? 'YAZ KIPI' : 'KURU KIP — hicbir sey yazilmadi'}`,
    `  taranan konu dosyasi : ${s.taranan}`,
    `  ${fiil[0].padEnd(20)} : ${s.eklendi}`,
    `  ${fiil[1].padEnd(20)} : ${s.guncellendi}`,
    `  degismedi            : ${s.degismedi}`,
    `  atlandi (capasiz)    : ${s.capasiz}`,
    `  atlandi (haric)      : ${s.haric}`,
    `  atlandi (kaldirilmis): ${s.kaldirilmis}`,
    `  atlandi (bos)        : ${s.bos}`,
    `  hata                 : ${s.hata}`,
  ]
  for (const h of r.hatalar) satirlar.push(`  HATA: ${h}`)
  if (r.ornekler.length) {
    satirlar.push(`ilk ${r.ornekler.length} ornek kayit:`)
    r.ornekler.forEach((o, i) => {
      satirlar.push(`--- ${i + 1}. [${o.islem}] ${o.ad} · kind ${o.kind} · capa ${o.capalar.join(', ')}`)
      satirlar.push(o.metin)
    })
  }
  return satirlar.join('\n') + '\n'
}

async function main(argv = process.argv.slice(2), ortam = process.env) {
  const dbKok = anaKok()
  const repoKoku = ortam.VENTHUB_REPO_KOKU || dbKok
  const hafizaDizini = hafizaDizinBul(dbKok, ortam)
  if (!hafizaDizini || !fs.existsSync(hafizaDizini)) {
    process.stderr.write('sage-hafiza-esle: hafiza dizini bulunamadi (VENTHUB_HAFIZA_DIZINI ile ver)\n')
    return 2
  }
  const r = await esle({
    hafizaDizini,
    yolTuru: varsayilanYolTuru(repoKoku),
    daemonCanli: () => daemonCanliMi(dbKok),
    portAc: () => gercekPortAc(dbKok),
    yaz: argv.includes('--yaz'),
  })
  if (r.durum === 'daemon-yok') {
    // Fail-open ve TEK satır: daemon başlatılmaz, hata değildir.
    process.stdout.write('sage-hafiza-esle: sage daemon canli degil (server.json yok ya da pid olu) — hicbir sey yapilmadi\n')
    return 0
  }
  if (r.durum === 'port-yok') {
    process.stdout.write('sage-hafiza-esle: sage daemon baglantisi acilamadi — hicbir sey yapilmadi\n')
    return 0
  }
  if (r.durum === 'liste-hatasi') {
    process.stderr.write(`sage-hafiza-esle: ${r.hatalar.join(' · ')} — HICBIR sey yazilmadi\n`)
    return 1
  }
  process.stdout.write(raporMetni(r))
  return r.sayilar.hata > 0 ? 1 : 0
}

module.exports = {
  METIN_TAVANI,
  EN_FAZLA_CAPA,
  ONEM,
  TUM_DURUMLAR,
  haricMi,
  dosyalariListele,
  frontmatterAyir,
  kindBelirle,
  adayYol,
  varsayilanYolTuru,
  capalariCikar,
  govdeCumleleri,
  ozetKur,
  ozetKimligi,
  kayitKur,
  esle,
  gercekPortAc,
  hafizaDizinBul,
  raporMetni,
  main,
}

if (require.main === module) {
  main().then(
    (kod) => process.exit(kod),
    (e) => {
      process.stderr.write(`sage-hafiza-esle: beklenmeyen hata — ${String((e && e.message) || e)}\n`)
      process.exit(1)
    },
  )
}
