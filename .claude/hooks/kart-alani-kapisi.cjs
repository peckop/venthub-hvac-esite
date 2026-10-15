#!/usr/bin/env node
'use strict'

/**
 * PreToolUse hook (kanban_manage add_task) — KART ALANI KAPISI (ARC-32, ARC-109 satır 7).
 *
 * NİÇİN: 4 Ekim olayı — OPS mod işini YETENEK'e açtı, oysa görev tanımı ARAÇ'ındı ("sen işi dağıtansın ama neye
 * göre? Verimiz var ama veriyi bulamıyoruz"). Veri `docs/roller/DEPARTMAN-HARITASI.md` tablosunda hazırdı
 * (üretilmiş: rol kartlarının Görev + Dosyalar bölümleri), kart açılırken kimse önüne getirmiyordu.
 *
 * NE YAPAR (bloklamaz, uyarır):
 *   1. Kartın atandığı departmanın Görev + Dosya alanı satırını additionalContext olarak gösterir.
 *   2. Kart metninde geçen dosya yolları BAŞKA departmanın dosya alanına düşüyorsa "bu iş X'in alanına benziyor".
 *   3. Departman çözülemezse (assignee yok/bilinmiyor, başlıkta tanınan önek yok) tek satır "departman bilinmiyor".
 *   4. (ARC-138, karar 369) Kart BAŞLIĞI, atanan departmanın rol kartındaki "Görev değil" satırından bir ifadeyi tam
 *      sözcük olarak geçiriyorsa "görev dışı" UYARISI. Satır biçimi rol-karti-uret.cjs GOREV_DEGIL_BASLIK sabitidir
 *      (testle kilitli); rol kartı ya da satır yoksa bu kol SESSİZ kalır. Yol içeren öğeler (3d/**) yol kolunun işi.
 * Departman: önce `assignee`, yoksa başlık önekinden (ARC-109 · … → ARAC).
 *
 * NE YAPMAZ: reddetmez (çıkış hep 0), kartı değiştirmez, ağ/DB'ye gitmez. Veri dosyası yoksa ya da ayrıştırılamazsa
 * hiçbir şey basmaz (fail-open, sessiz). Yol eşlemesi sezgiseldir: yalnız `/` içeren dosya alanı belirteçleri sayılır.
 *
 * stdin: { tool_name, tool_input: { action, title, description, assignee } }
 * Çıkış: DAİMA 0. Gösterilecek bir şey varsa stdout'a { hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext } }.
 */

const fs = require('fs')
const path = require('path')

const ARAC_ADI = 'mcp__wrongstack-kanban__kanban_manage'
const ROL_KARTLARI = path.resolve(__dirname, '..', '..', 'docs', 'roller')
const HARITA = path.join(ROL_KARTLARI, 'DEPARTMAN-HARITASI.md')
// Rol kartındaki satır: "Görev değil (emir buraya ... "görev dışı: <satır>" yaz): <öğe>; <öğe>." Parantez içinde ":" var;
// bu yüzden ilk "):" değil, tembel eşleşmeyle satırdaki "):" ayracı aranır.
const GOREV_DEGIL_SATIRI = /^Görev değil\b[^\n]*?\):\s+(.+)$/m
const KAC_UYARI = 3

// Başlık öneki → departman (docs/standards/is-kayit-duzeni-standard.md önek tablosu).
const ONEK = {
  ARC: 'ARAC',
  ALT: 'ALTYAPI',
  HRT: 'HARITA',
  URN: 'URUN',
  ADM: 'ADMIN',
  KTL: 'KATALOG',
  SEO: 'GEO-SEO',
  BLG: 'BLOG',
  MVZ: 'MEVZUAT',
  STS: 'SATIS',
  TSR: 'TASARIM',
  EDG: 'EDGE',
  YTN: 'YETENEK',
  TKP: 'TAKIP',
  OPS: 'OPS',
}

const HARF = 'a-zçğıöşüâîû'
const ANAHTAR_ARAC = new RegExp(
  `(?<![${HARF}])(?:kanca|hook|eklenti|wrongstack|claude-mem|mods?(?![${HARF}]))`,
)

/** "Araç", "ARAÇ", "arac" → "ARAC". */
function ad(ham) {
  return String(ham || '')
    .trim()
    .toLocaleUpperCase('tr')
    .replace(/Ç/g, 'C')
    .replace(/Ğ/g, 'G')
    .replace(/İ/g, 'I')
    .replace(/Ö/g, 'O')
    .replace(/Ş/g, 'S')
    .replace(/Ü/g, 'U')
}

/**
 * DEPARTMAN-HARITASI.md tablosunu ayrıştırır: { AD: { gorev, alan, desenler: [{ onek, tam }] } }.
 * Başlık ve ayraç satırları atlanır; üç hücreden azı olan satır atlanır.
 */
function haritayiOku(metin) {
  const sonuc = {}
  for (const satir of String(metin).split(/\r?\n/)) {
    if (!satir.startsWith('|')) continue
    const hucre = satir.split('|').slice(1, -1).map((h) => h.trim())
    if (hucre.length < 3 || /^-+$/.test(hucre[0]) || hucre[0] === 'Departman') continue
    const dept = ad(hucre[0].replace(/\s*\(.*$/, ''))
    if (!dept) continue
    const desenler = []
    for (const parca of hucre[2].split(',')) {
      const t = parca.trim().replace(/`/g, '').replace(/\.$/, '')
      if (!t.includes('/') || /[\s{}]/.test(t)) continue
      const yildiz = t.indexOf('*')
      desenler.push(yildiz === -1 ? { onek: t, tam: true } : { onek: t.slice(0, yildiz), tam: false })
    }
    sonuc[dept] = { gorev: hucre[1], alan: hucre[2], desenler }
  }
  return sonuc
}

/** Metindeki dosya yolu adayları: en az bir `/` içeren, harf ile başlayan ya da `.` ile başlayan parçalar. */
function yollar(metin) {
  const bulunan = new Set()
  for (const m of String(metin).matchAll(/(?<![\w./-])(\.?[A-Za-z0-9_][\w.-]*(?:\/[\w.*-]+)+)/g)) {
    bulunan.add(m[1].replace(/[.,;:)]+$/, ''))
  }
  return [...bulunan]
}

/** Yolun sahibi departman (en uzun önek kazanır); yoksa null. */
function sahibi(yol, harita) {
  let en = null
  let enUzunluk = 0
  for (const [dept, v] of Object.entries(harita)) {
    for (const d of v.desenler) {
      const eslesir = d.tam ? yol === d.onek : d.onek.length >= 4 && yol.startsWith(d.onek)
      if (eslesir && d.onek.length > enUzunluk) {
        en = dept
        enUzunluk = d.onek.length
      }
    }
  }
  return en
}

/**
 * Rol kartı metnindeki "Görev değil" satırını öğelere ayırır: [{ ifadeler: string[], sahip: string|null, ham }].
 * Öğeler ";" ile ayrılır; sondaki "(SAHİP)" sahip olarak alınır; ifadeler "," / " ve " / " ya da " ile bölünür, küçük
 * harfe çevrilir, 4 harften kısa ifade (CI, kod…) atlanır (gürültü). Yol/glob içeren öğe (3d/**) atlanır.
 * Satır yoksa boş liste (sessiz).
 */
function gorevDegilOku(metin) {
  const m = GOREV_DEGIL_SATIRI.exec(String(metin || ''))
  if (!m) return []
  const sonuc = []
  for (const ham of m[1].split(';')) {
    const parca = ham.trim().replace(/\.$/, '')
    if (!parca || /[/*]/.test(parca)) continue
    const sahip = /\(([^)]+)\)\s*$/.exec(parca)
    const govde = parca.replace(/\s*\([^)]*\)\s*$/, '').trim()
    const ifadeler = govde
      .split(/,|\s+ve\s+|\s+ya da\s+/)
      .map((x) => x.trim().toLocaleLowerCase('tr'))
      .filter((x) => x.length >= 4)
    if (ifadeler.length) sonuc.push({ ifadeler, sahip: sahip ? sahip[1].trim() : null, ham: parca })
  }
  return sonuc
}

function kacis(ifade) {
  return ifade.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Başlıkta (tam sözcük) geçen "Görev değil" ifadeleri: [{ ifade, sahip }]. */
function gorevDisi(baslik, ogeler) {
  const b = String(baslik || '').toLocaleLowerCase('tr')
  const bulunan = []
  for (const o of ogeler) {
    for (const ifade of o.ifadeler) {
      const re = new RegExp(`(?<![${HARF}\\d])${kacis(ifade)}(?![${HARF}\\d])`)
      if (re.test(b)) {
        bulunan.push({ ifade, sahip: o.sahip })
        break
      }
    }
  }
  return bulunan
}

function departman(girdi, harita) {
  const atanan = ad(girdi.assignee)
  if (atanan && harita[atanan]) return atanan
  const onek = /^\s*([A-Z0-9]{2,4})-\d+/.exec(String(girdi.title || ''))
  const dept = onek ? ONEK[onek[1]] : null
  return dept && harita[dept] ? dept : null
}

/**
 * Saf çekirdek (test bunu çağırır).
 * @param {(dept: string) => (string|null)} [kartOku] departmanın rol kartı metni; yoksa "Görev değil" kolu sessiz
 * @returns {string[]} modele gidecek satırlar (boşsa sessiz)
 */
function incele(girdi, harita, kartOku = () => null) {
  if (!girdi || girdi.action !== 'add_task') return []
  const satirlar = []
  const dept = departman(girdi, harita)
  if (!dept) {
    satirlar.push(
      'KART ALANI: departman çözülemedi (assignee yok/bilinmiyor, başlıkta tanınan önek yok). Kartı açmadan önce ' +
        'docs/roller/DEPARTMAN-HARITASI.md tablosundan işin sahibini seç.',
    )
  } else {
    const v = harita[dept]
    satirlar.push(`KART ALANI (${dept}): Görev: ${v.gorev} · Dosya alanı: ${v.alan}`)
    // ARC-138 (karar 369): başlık, atanan departmanın rol kartındaki "Görev değil" ifadesini geçiriyorsa UYARI (engel yok).
    // Rol kartı/satır yoksa gorevDegilOku [] verir → kol sessiz.
    let kart = null
    try {
      kart = kartOku(dept)
    } catch {
      kart = null
    }
    for (const b of gorevDisi(girdi.title, gorevDegilOku(kart)).slice(0, KAC_UYARI)) {
      satirlar.push(
        `KART ALANI UYARI (görev dışı): kart başlığı "${b.ifade}" geçiriyor; ${dept} rol kartının "Görev değil" satırında ` +
          `yazıyor${b.sahip ? ` (sahibi: ${b.sahip})` : ''}. Bu iş ${dept} rol kartında görev dışı görünüyor; sahibi doğru mu? ` +
          `Doğruysa OPS'a "görev dışı: <satır>" yaz.`,
      )
    }
  }
  const metin =`${girdi.title || ''}\n${girdi.description || ''}`
  // Anahtar kelime sezgisi (4 Ekim olayı: "mod/kanca/eklenti" işi ARAÇ'ındı, YETENEK'e açılmıştı). Yalnız ARAÇ için,
  // yalnız harita ARAC'ı tanıyorsa; "model/modül" gibi sözcükleri yakalamasın diye `mod` TAM sözcük aranır.
  if (dept !== 'ARAC' && harita.ARAC && ANAHTAR_ARAC.test(metin.toLocaleLowerCase('tr'))) {
    satirlar.push(
      "KART ALANI UYARI: kart metni kanca/hook/eklenti/mod/WrongStack/claude-mem geçiriyor: bu iş ARAC'ın alanına " +
        `benziyor (${harita.ARAC.gorev})` +
        (dept ? `; kart ${dept}'e atanmış, sahibi doğru mu?` : '.'),
    )
  }
  const baskalari = new Map()
  for (const y of yollar(metin)) {
    const s = sahibi(y, harita)
    if (s && s !== dept) baskalari.set(s, [...(baskalari.get(s) || []), y])
  }
  for (const [s, ys] of baskalari) {
    satirlar.push(
      `KART ALANI UYARI: ${ys.slice(0, 3).join(', ')} ${s} dosya alanına düşüyor ` +
        (dept ? `(kart ${dept}'e atanmış): bu iş ${s}'in alanına benziyor, sahibi doğru mu?` : `: bu iş ${s}'in alanına benziyor.`),
    )
  }
  return satirlar
}

function calistir() {
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  if (girdi.tool_name !== ARAC_ADI) return
  let harita
  try {
    harita = haritayiOku(fs.readFileSync(HARITA, 'utf8'))
  } catch {
    return
  }
  if (!Object.keys(harita).length) return
  const kartOku = (dept) => {
    if (!/^[A-Z0-9-]+$/.test(dept)) return null
    try {
      return fs.readFileSync(path.join(ROL_KARTLARI, `${dept}.md`), 'utf8')
    } catch {
      return null
    }
  }
  const satirlar = incele(girdi.tool_input, harita, kartOku)
  if (!satirlar.length) return
  try {
    fs.writeSync(
      1,
      JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: satirlar.join('\n') } }) + '\n',
    )
  } catch {
    // stdout kapalı: bilgi verilemedi, kart yine açılır
  }
}

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open
  }
  process.exit(0)
}

module.exports = { haritayiOku, yollar, sahibi, departman, incele, ad, gorevDegilOku, gorevDisi, GOREV_DEGIL_SATIRI, HARITA }
