#!/usr/bin/env node
/**
 * DEPARTMAN ORTAK KÜTÜPHANESİ — `departman-ac.cjs` ve `departman-kapat.cjs` AYNI çözümlemeyi kullanır.
 *
 * NİÇİN AYRI: "rol adı → şerit → son sid → pencere açık mı → durum dosyası" zinciri iki betikte de gerekir. İki kopya
 * bir gün ayrışır ("aç" bir rolü tanır, "kapat" tanımaz); bu depoda o sınıf tekrar tekrar kaybettirdi. Tek kaynak burası;
 * rol tablosu da tek kaynaktan gelir (`pencere-adlari.cjs`, burada tablo YOK). Bu modül süreç BAŞLATMAZ ve KAPATMAZ.
 *
 * Test kancaları (üretimde ayarlı olmaz): VENTHUB_BOARD_DIR · VENTHUB_OTURUM_KAYIT_DIZINI · VENTHUB_CLAUDE_EXE ·
 * VENTHUB_ANA_KOK · VENTHUB_CANLILIK_HAM / VENTHUB_CANLILIK_KAPALI (canlilik.cjs).
 */
const fs = require('fs')
const path = require('path')

const board = require('./board.cjs')
const canlilik = require('./canlilik.cjs')
const pencereAdlari = require('./pencere-adlari.cjs')
const { katla } = require('../belge/konu-yonlendirici.cjs')

const SID_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Aynı anda açık tutulacak EN ÇOK departman penceresi. OPS penceresi SAYILMAZ (Recep 09-30: "OPS hariç 5"). */
const PENCERE_TAVANI = 5
/** Ops'un pano şerit adı (tablo anahtarı). Görünen adı tablodan alınır (`pencereAdlari.ad`). */
const OPS_SERIT = 'OPS'
/** Durum dosyası bu süreden eskiyse "günlük BAYAT" sayılır (kapatma kapısı). */
const DURUM_TAZE_DK = 10

/** Türkçe katlamalı eşitlik (ı/İ/ş/ğ/ü/ö/ç → ASCII, küçük harf). Boşlukları kırpar; boş/tip dışı → false. */
function ayniMi(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const x = katla(a.trim())
  return x !== '' && x === katla(b.trim())
}

/** Rol argümanı → `{serit, ad}` (pencere-adlari TABLO'sundan; pano şerit adıyla da görünen adla da eşleşir) ya da null. */
function rolCoz(arg) {
  for (const [serit, ad] of pencereAdlari.TABLO) {
    if (ayniMi(arg, serit) || ayniMi(arg, ad)) return { serit, ad }
  }
  return null
}

/** Tablodaki geçerli rollerin görünen adları (hata mesajı için). */
function gecerliRoller() {
  return pencereAdlari.TABLO.map(([, ad]) => ad).join(', ')
}

/**
 * Pano olay dosyalarındaki TÜM claim olayları. PRUNE_MS BURADA UYGULANMAZ: bir departman gün(ler) sonra da
 * açılabilmeli/kapatılabilmeli; 24 saatten eski dosya da okunur. Bozuk satır atlanır ve SAYILIR (sessiz geçilmez).
 * @returns {{claims:Array<{sid:string,lane:string,ts:string}>, uyarilar:string[]}}
 */
function panoTara(panoDizini = board.BOARD_DIR) {
  const uyarilar = []
  let dosyalar
  try {
    dosyalar = fs.readdirSync(panoDizini).filter((f) => f.startsWith('events.') && f.endsWith('.jsonl'))
  } catch (e) {
    uyarilar.push(`pano dizini okunamadi (${(e && e.code) || 'hata'}: ${panoDizini}) — rollerin son oturumu BILINMIYOR`)
    return { claims: [], uyarilar }
  }
  const claims = []
  let bozuk = 0
  for (const f of dosyalar) {
    let ham
    try { ham = fs.readFileSync(path.join(panoDizini, f), 'utf8') } catch { uyarilar.push(`${f} okunamadi`); continue }
    for (const satir of ham.split('\n')) {
      if (!satir.trim()) continue
      let e
      try { e = JSON.parse(satir) } catch { bozuk++; continue }
      if (!e || e.type !== 'claim' || typeof e.sid !== 'string') continue
      claims.push({ sid: e.sid, lane: String(e.lane || ''), ts: String(e.ts || '') })
    }
  }
  if (bozuk > 0) uyarilar.push(`olay dosyalarinda ${bozuk} bozuk satir atlandi`)
  return { claims, uyarilar }
}

/** Şeridin en yeni claim'inin sid'i. UUID olmayan sid (elle kimlik: recep-manual…) `--resume` edilemez → yok sayılır. */
function sonSid(claims, serit) {
  let en = null
  for (const c of claims) {
    if (!SID_UUID.test(c.sid) || !ayniMi(c.lane, serit)) continue
    if (!en || c.ts > en.ts) en = c
  }
  return en ? { sid: en.sid, ts: en.ts } : null
}

/** Son claim'inin şerit adı OPS olan oturumlar. Ops penceresi tavan sayımına girmez. */
function opsSidleri(claims) {
  const sonSerit = new Map()
  for (const c of claims) {
    const o = sonSerit.get(c.sid)
    if (!o || c.ts > o.ts) sonSerit.set(c.sid, c)
  }
  const s = new Set()
  for (const [sid, c] of sonSerit) if (ayniMi(c.lane, OPS_SERIT)) s.add(sid)
  return s
}

/**
 * Rolün BİLİNEN tüm sid'leri: her sid'in SON claim'inin şeridi bu rolün şeridi olan oturumlar. Yaş sınırı YOK (bilinçli):
 * canlılık açık pencere listesinden ölçülür; 4 günlük claim'li ama hâlâ açık bir pencere de görülmeli.
 * @returns {Set<string>}
 */
function rolSidleri(claims, serit) {
  const sonSerit = new Map()
  for (const c of claims) {
    const o = sonSerit.get(c.sid)
    if (!o || c.ts > o.ts) sonSerit.set(c.sid, c)
  }
  const s = new Set()
  for (const [sid, c] of sonSerit) if (ayniMi(c.lane, serit)) s.add(sid)
  return s
}

/**
 * Rolün şu an AÇIK pencereleri. İKİ kanıt, herhangi biri yeter:
 *  (a) `sid`: pencerenin sid'i rolün BİLİNEN sid'lerinden biri (eski sid canlı + yeni sid kapalı durumu yakalanır);
 *  (b) `ad`: ana pencerenin adı rol adıyla Türkçe katlamalı eşit ("Araç") — `--taze` ile claim'siz açılmış pencere
 *      panoda görünmez, yalnız adıyla yakalanır. Alt süreç/gözlemci pencereleri ad eşleşmesine girmez.
 * "En yeni claim'in sid'i" seçimi canlılığa bakmaz; bu yüzden "zaten açık" ve "kapat" kararı BURADAN verilir.
 * @returns {Array<object>} pencere kayıtları (`acikPencereler().liste` biçimi) + `eslesme: 'sid'|'ad'`; sid eşleşmeleri önde.
 */
function rolPencereleri(liste, claims, rol) {
  const sidler = rolSidleri(claims, rol.serit)
  const sonuc = []
  for (const p of liste) if (p.sid && sidler.has(p.sid)) sonuc.push({ ...p, eslesme: 'sid' })
  for (const p of liste) {
    if (p.altSurec || (p.sid && sidler.has(p.sid))) continue
    if (ayniMi(p.name, rol.ad)) sonuc.push({ ...p, eslesme: 'ad' })
  }
  return sonuc
}

/** Bu açık pencere OPS'un mu? Pano claim'inin şerit adı YA DA pencere adı (tablo eşlemesi: OPS → "Ops"). */
function opsMi(p, opsSids) {
  return opsSids.has(p.sid) || ayniMi(p.name, pencereAdlari.ad(OPS_SERIT))
}

function pidCanliMi(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try { process.kill(pid, 0); return true } catch (e) { return !!(e && e.code === 'EPERM') }
}

/**
 * AÇIK pencereler. `claude agents --json` ölçülebiliyorsa YETKİLİ kaynak (pid yeniden kullanımı yanlış "canlı" üretemez);
 * ölçülemiyorsa `~/.claude/sessions/<pid>.json` kaydı + pid canlılığı. Alt süreç / gözlemci pencereleri (`vh-…`,
 * kind ≠ interactive) `altSurec: true` ile işaretlenir.
 * @returns {{ok:boolean, kaynak:string, liste:Array<{sid:string,name:string,kind:string,cwd:string,pid:number|null,status:string,altSurec:boolean}>, uyarilar:string[]}}
 */
function acikPencereler(kayitDizini = board.OTURUM_KAYIT_DIZINI) {
  const uyarilar = []
  const bicim = (p) => ({
    sid: p.sessionId || p.sid || '', name: p.name || '', kind: p.kind || '', cwd: p.cwd || '',
    pid: Number.isInteger(p.pid) ? p.pid : null, status: p.status || '',
    altSurec: canlilik.altSurecMi({ kind: p.kind || '', name: p.name || '', cwd: p.cwd || '' }),
  })
  let olcum
  try { olcum = canlilik.olc({}) } catch (e) { olcum = { ok: false, sebep: String((e && e.message) || e) } }
  if (olcum.ok) return { ok: true, kaynak: 'claude agents', liste: olcum.pencereler.map(bicim), uyarilar }

  let dosyalar = null
  try { dosyalar = fs.readdirSync(kayitDizini) } catch { /* dizin yok: aşağıda uyarı */ }
  if (dosyalar === null) {
    uyarilar.push(`sessions dizini yok (${kayitDizini}) ve claude agents olculemedi (${olcum.sebep}) — pencere canliligi KANITSIZ, acik pencere olmadigi varsayildi`)
    return { ok: false, kaynak: 'yok', liste: [], uyarilar }
  }
  const liste = []
  for (const f of dosyalar) {
    if (!/^\d+\.json$/.test(f)) continue
    try {
      const j = JSON.parse(fs.readFileSync(path.join(kayitDizini, f), 'utf8'))
      const pid = Number.isInteger(j.pid) ? j.pid : Number(f.replace('.json', ''))
      if (j && typeof j.sessionId === 'string' && pidCanliMi(pid)) liste.push(bicim({ ...j, pid }))
    } catch { /* bozuk/yarım kayıt: atla */ }
  }
  return { ok: true, kaynak: 'sessions pid', liste, uyarilar }
}

/**
 * Departman penceresi tavanı: açık ana pencere sayısı (alt süreçler ve OPS HARİÇ). Tavan `PENCERE_TAVANI`.
 * @returns {{sayi:number, tavan:number, doldu:boolean}}
 */
function tavanDurumu(liste, opsSids) {
  const sayi = liste.filter((p) => !p.altSurec && !opsMi(p, opsSids)).length
  return { sayi, tavan: PENCERE_TAVANI, doldu: sayi >= PENCERE_TAVANI }
}

/** Oturumun durum dosyası: mevcut kancanın çözümlemesi (precompact-durum-kapisi.durumDosyasiBul). Yoksa null; hata fırlatmaz. */
function durumBul(sid, simdi = Date.now(), projeDizini = '') {
  try {
    const kapi = require('../../.claude/hooks/precompact-durum-kapisi.cjs')
    // projeDizini (yalnız test enjeksiyonu): kancanın "transcript yolu proje dizininin içindedir" kolunu kullanır;
    // os.homedir() worker iş parçacığında süreç ortamını izlemez, bu yüzden HOME ile yönlendirme yetmez.
    const d = kapi.durumDosyasiBul(sid, projeDizini ? path.join(projeDizini, `${sid}.jsonl`) : undefined)
    if (!d) return null
    return { ad: d.ad, tam: d.tam, mt: d.mt, yasDk: Math.max(0, Math.round((simdi - d.mt) / 60000)) }
  } catch {
    return null
  }
}

/** PATH'te (ya da VENTHUB_CLAUDE_EXE ile verilen yolda) claude yürütülebilirini arar. Bulunamazsa null. */
function claudeExeBul() {
  const ozel = process.env.VENTHUB_CLAUDE_EXE
  if (ozel) return fs.existsSync(ozel) ? path.resolve(ozel) : null
  const adlar = process.platform === 'win32' ? ['claude.exe'] : ['claude']
  for (const d of String(process.env.PATH || process.env.Path || '').split(path.delimiter)) {
    if (!d) continue
    for (const ad of adlar) {
      const yol = path.join(d.replace(/^"|"$/g, ''), ad)
      try { if (fs.statSync(yol).isFile()) return yol } catch { /* yok */ }
    }
  }
  return null
}

/** Windows komut satırı için tek argüman kaçışı (boşluk/tırnak içeriyorsa çift tırnak; içteki tırnak `\"`). */
function tirnakla(arg) {
  const s = String(arg)
  return /[\s"]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s
}

/** JSON'u ASCII'ye kaçırır (\uXXXX): PowerShell 5.1 / konsol kod sayfası "Ürün" adını bozamaz. */
function asciiJson(nesne) {
  return JSON.stringify(nesne).replace(/[\u0080-￿]/g, (ch) => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'))
}

/** CLI bayrak/konum ayrıştırma: `--x`, `--x değer` (DEGER_BAYRAKLARI) ve konumlar. */
function argvAyristir(argv, degerBayraklari = []) {
  const bayrak = new Map()
  const konum = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      if (degerBayraklari.includes(a)) { bayrak.set(a, argv[i + 1]); i++ } else bayrak.set(a, true)
    } else konum.push(a)
  }
  return { bayrak, konum }
}

module.exports = {
  SID_UUID, PENCERE_TAVANI, OPS_SERIT, DURUM_TAZE_DK,
  ayniMi, rolCoz, gecerliRoller, panoTara, sonSid, rolSidleri, rolPencereleri, opsSidleri, opsMi, pidCanliMi,
  acikPencereler, tavanDurumu, durumBul, claudeExeBul, tirnakla, asciiJson, argvAyristir,
}
