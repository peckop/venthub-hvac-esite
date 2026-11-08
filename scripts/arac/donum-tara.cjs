#!/usr/bin/env node
'use strict'
/**
 * DÖNÜM TARAYICI (ARC-280, OPS-257; ölçüm tanımı ARC-276): departman ve gün başına iki sayı.
 *   · yeniden yazılan betik: oturum dökümünde Write ile yazılan KALICI OLMAYAN betik (scratchpad/tmp; depodaki scripts/, tools/,
 *     .claude/hooks/ altı sayılmaz) ve adının kökü (sayı/v2/yeni/son eki atılmış) o departmanda daha önce görülmüş.
 *   · elle komut: Bash komutu, var olan ya da aday bir araçla karşılanabilen kategoriye giriyor (KATEGORILER).
 * Çıktı: depo dışı iki dosya (~/.claude/mod-durum/donum-tara.json önbellek, donum-tara-son.json son satır) + tek satır.
 *
 * SALT-OKUMA (dökümlere dokunmaz), ARTIMLI (dosya başına kaldığı bayttan devam; tam tarama dakikalar sürdü), SÜRE TAVANLI,
 * FAIL-OPEN. 300 MB üstü döküm geçmişiyle okunmaz (ilk koşuda canlıysa son 64 MB, ölüyse dosya sonundan artımlı); satır eksik günleri söyler. Vana: VENTHUB_DONUM_TARA_KAPAT=1.
 * Günlük koruma: aynı gün ikinci koşu taramaz, son satırı döner (açılış kancası günün ilk açılışında tetikler).
 * Kullanım: node scripts/arac/donum-tara.cjs [--yaz] [--zorla]   (argümansız: son satırı yazar, taramaz)
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const BUYUK_SINIR = 300 * 1024 * 1024
const SON_BAYT = 64 * 1024 * 1024 // büyük canlı dökümde ilk koşuda geriye okunan miktar
const TAVAN_MS = 20 * 1000
const PARCA = 8 * 1024 * 1024
const KOK_TAVANI = 5000
const BETIK_UZANTI = /\.(cjs|mjs|js|py|sh|ps1)$/i
const KALICI_YOL = /(^|\/)(scripts|tools|\.claude\/hooks|\.githooks)\//

const KATEGORILER = [
  ['ci-bakış', /check-runs|mergeable_state/],
  ['ritüel-hazırlık', /switch -C [^\s]*gecici-merge/],
  ['durum-ekle', />>\s*\S*durum/],
  ['sabotaj-elle', /\b(?:cp\b[^\n]*(?:yedek|\.bak|sabotaj)|sed -i\b)/],
  ['döküm-tarama', /\.claude[\\/]projects|\bprojects\/\S*\.jsonl\b/],
]

const evSayfa = () => process.env.VENTHUB_DONUM_DIZINI || path.join(os.homedir(), '.claude', 'mod-durum')
const onbellekYolu = () => path.join(evSayfa(), 'donum-tara.json')
const sonYolu = () => path.join(evSayfa(), 'donum-tara-son.json')
const projeKok = () => process.env.VENTHUB_DONUM_PROJELER || path.join(os.homedir(), '.claude', 'projects')

/** Proje dizin adı → departman. `...--claude-worktrees-arac-pencere` → 'arac'; worktree değilse 'ana'. SAF. */
function departman(dizinAdi) {
  const m = /--claude-worktrees-(.+)$/.exec(String(dizinAdi || ''))
  if (!m) return 'ana'
  return m[1].replace(/-pencere$/, '')
}

/** Betik adının kökü: uzantı, sayılar, v2/yeni/eski/son/tmp/b ekleri atılır. SAF. */
function kok(ad) {
  return String(ad || '')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[-_]?\d+[a-z]?(?=$|[-_])/g, '')
    .replace(/^[_-]+/, '')
    .replace(/[-_](v\d+|yeni|eski|son|tmp|b)$/g, '')
}

const yerelGun = (ts) => {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function bos() {
  return { surum: 1, dosyalar: {}, gunler: {}, kokler: {} }
}

function sayac(durum, gun, dept) {
  const g = (durum.gunler[gun] ||= {})
  return (g[dept] ||= { betik: 0, yeniden: 0, elle: 0 })
}

/** Tek döküm satırını durumda sayar. SAF (durumu değiştirir); bozuk satır sessiz atlanır. */
function satirSay(satir, dept, durum) {
  if (!satir.includes('"tool_use"')) return
  let o
  try {
    o = JSON.parse(satir)
  } catch {
    return
  }
  const gun = yerelGun(o && o.timestamp)
  const ic = o && o.message && o.message.content
  if (!gun || !Array.isArray(ic)) return
  for (const c of ic) {
    if (!c || c.type !== 'tool_use' || !c.input) continue
    if (c.name === 'Write' && typeof c.input.file_path === 'string') {
      const yol = c.input.file_path.replace(/\\/g, '/')
      if (!BETIK_UZANTI.test(yol) || KALICI_YOL.test(yol)) continue
      const k = kok(path.posix.basename(yol))
      const s = sayac(durum, gun, dept)
      s.betik += 1
      const kume = (durum.kokler[dept] ||= [])
      if (k.length < 3) continue // jenerik ad (1.py, x.js): yeniden sayılmaz, kümeye girmez
      if (kume.includes(k)) s.yeniden += 1
      else if (kume.length < KOK_TAVANI) kume.push(k)
    } else if (c.name === 'Bash' && typeof c.input.command === 'string') {
      if (KATEGORILER.some(([, re]) => re.test(c.input.command))) sayac(durum, gun, dept).elle += 1
    }
  }
}

/** Bir dosyayı kaldığı bayttan okur; son tam satıra kadar ilerler. Döner: ilerleyen bayt. */
function dosyaTara(yol, ofset, dept, durum, bitisi, parca = PARCA) {
  const fd = fs.openSync(yol, 'r')
  try {
    const boyut = fs.fstatSync(fd).size
    let pos = ofset
    const tampon = Buffer.alloc(parca)
    while (pos < boyut) {
      if (bitisi()) break
      const n = fs.readSync(fd, tampon, 0, Math.min(parca, boyut - pos), pos)
      if (n <= 0) break
      const kisim = tampon.subarray(0, n)
      const son = kisim.lastIndexOf(10) // \n
      if (son < 0) {
        // shortcut: PARCA'dan uzun tek satır (≈8MB) atlanır; parçanın sonu dosya sonuysa yazılmakta olan satır sonraki koşuya kalır
        if (pos + n >= boyut) break
        pos += n
        continue
      }
      for (const s of kisim.toString('utf8', 0, son).split('\n')) satirSay(s, dept, durum)
      pos += son + 1 // yalnız tam satırlar tüketilir; kalan kuyruk sonraki turda ya da sonraki koşuda okunur
    }
    return pos
  } finally {
    fs.closeSync(fd)
  }
}

/**
 * Tüm projeleri artımlı tarar. Döner: { durum, eksik: bool }.
 * `simdi` ve `tavanMs` test için enjekte edilir; tavan dolarsa kalan dosyalar sonraki koşuya kalır (eksik=true).
 */
function tara({ kok: proje = projeKok(), durum = bos(), simdi = Date.now, tavanMs = TAVAN_MS, buyukSinir = BUYUK_SINIR, sonBayt = SON_BAYT, parca } = {}) {
  const baslangic = simdi()
  const bitisi = () => simdi() - baslangic >= tavanMs
  let eksik = false
  let dizinler = []
  try {
    dizinler = fs.readdirSync(proje, { withFileTypes: true }).filter((e) => e.isDirectory())
  } catch {
    return { durum, eksik: true }
  }
  for (const d of dizinler) {
    const dept = departman(d.name)
    let dosyalar = []
    try {
      dosyalar = fs.readdirSync(path.join(proje, d.name)).filter((f) => f.endsWith('.jsonl'))
    } catch {
      continue
    }
    for (const f of dosyalar) {
      const yol = path.join(proje, d.name, f)
      if (bitisi()) {
        eksik = true
        break
      }
      try {
        const boyut = fs.statSync(yol).size
        if (boyut > buyukSinir && !durum.dosyalar[yol]) {
          // BÜYÜK DÖKÜM, İLK KARŞILAŞMA (ARC-285): geçmişi okunmaz. Canlıysa (son 3 günde yazılmış) son SON_BAYT; ölüyse dosya sonu
          // (yeni bayt gelirse artımlı sayılır). Başlangıç günü kayıtlıdır; satır o günden önceki sayının eksik olduğunu söyler.
          const canli = fs.statSync(yol).mtimeMs > simdi() - 3 * 86400000
          durum.dosyalar[yol] = { boyut, ofset: canli ? Math.max(0, boyut - sonBayt) : boyut, buyuk: true, baslangic: yerelGun(new Date(simdi()).toISOString()) }
        }
        const onceki = durum.dosyalar[yol] || { boyut: 0, ofset: 0 }
        // dosya küçüldüyse baştan; büyük dökümde baştan değil dosya sonundan (300 MB geçmişi yeniden okunmaz, çift sayım olmaz)
        const ofset = boyut < onceki.ofset ? (onceki.buyuk ? boyut : 0) : onceki.ofset
        if (ofset >= boyut) continue
        const yeni = dosyaTara(yol, ofset, dept, durum, bitisi, parca)
        durum.dosyalar[yol] = { ...durum.dosyalar[yol], boyut, ofset: yeni }
        if (yeni < boyut && bitisi()) eksik = true // kuyruktaki yarım satır (açık oturum) eksiklik sayılmaz
      } catch {
        // okunamayan dosya: sonraki koşuda yeniden denenir
      }
    }
  }
  return { durum, eksik }
}

const gunEkle = (gun, n) => {
  const d = new Date(gun + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return yerelGun(d.toISOString())
}

/**
 * Büyük (>300MB) dökümler geçmişleriyle okunmaz (ARC-285): ilk koşuda canlıysa son 64MB, ölüyse dosya sonundan başlanır.
 * Sayım başlangıcı `gun`dan SONRAYSA o günün sayısı bu dökümler için eksik olabilir; satır bunu departman adıyla söyler. SAF.
 */
function buyukNotu(durum, gun) {
  const kismi = Object.entries(durum.dosyalar).filter(([, v]) => v && v.buyuk && v.baslangic > gun)
  if (!kismi.length) return ''
  const say = {}
  for (const [y] of kismi) {
    const d = departman(path.basename(path.dirname(String(y))))
    say[d] = (say[d] || 0) + 1
  }
  const ozet = Object.entries(say).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([d, n]) => `${d} ${n}`).join(', ')
  const ilk = kismi.map(([, v]) => v.baslangic).sort()[0]
  return `${kismi.length} büyük döküm (${ozet}) ${ilk}'den itibaren sayılıyor, geçmişi okunmaz: önceki günler eksik olabilir`
}

/** Tek satır. `bugun`'den önceki en son veri günü ile ondan önceki veri günü karşılaştırılır; boşluk yazılır. SAF. */
function satirUret(durum, bugun, { eksik = false } = {}) {
  const gunler = Object.keys(durum.gunler).filter((g) => g < bugun).sort()
  const son = gunler[gunler.length - 1]
  if (!son) {
    const n = []
    const bn0 = buyukNotu(durum, '')
    if (bn0) n.push(bn0)
    if (eksik) n.push('tarama tamamlanmadı (süre tavanı), sayılar eksik olabilir')
    return 'DÖNÜM: önceki güne ait veri yok' + (n.length ? ' [' + n.join('; ') + ']' : '')
  }
  const onceki = gunler[gunler.length - 2]
  const a = durum.gunler[son]
  const b = (onceki && durum.gunler[onceki]) || {}
  const parcalar = Object.keys(a)
    .filter((d) => a[d].yeniden || a[d].elle)
    .sort((x, y) => a[y].yeniden + a[y].elle - (a[x].yeniden + a[x].elle))
    .map((d) => `${d} yeniden-betik ${a[d].yeniden} (önceki ${(b[d] || {}).yeniden || 0}), elle ${a[d].elle} (${(b[d] || {}).elle || 0})`)
  const notlar = []
  if (son !== gunEkle(bugun, -1)) notlar.push(`dün verisi yok, son veri ${son}`)
  if (onceki && onceki !== gunEkle(son, -1)) notlar.push(`önceki karşılaştırma ${onceki} (${Math.round((new Date(son) - new Date(onceki)) / 86400000) - 1} gün boşluk)`)
  const bn = buyukNotu(durum, son)
  if (bn) notlar.push(bn)
  if (eksik) notlar.push('tarama tamamlanmadı (süre tavanı), sayılar eksik olabilir')
  const metin = `DÖNÜM ${son}: ${parcalar.length ? parcalar.join('; ') : 'yeniden betik ve elle komut yok'}${notlar.length ? ' [' + notlar.join('; ') + ']' : ''}`
  return metin.length > 600 ? metin.slice(0, 599) + '…' : metin
}

function oku(yol) {
  try {
    return JSON.parse(fs.readFileSync(yol, 'utf8'))
  } catch {
    return null
  }
}

function yaz(yol, veri) {
  try {
    fs.mkdirSync(path.dirname(yol), { recursive: true })
    const gecici = `${yol}.${process.pid}.tmp`
    fs.writeFileSync(gecici, JSON.stringify(veri))
    fs.renameSync(gecici, yol)
  } catch {
    // yazılamadı: sonraki koşu yeniden dener
  }
}

/** Günlük koşu: aynı günde ikinci kez taramaz. Döner: satır metni. */
function gunluk({ bugun = yerelGun(new Date().toISOString()), zorla = false, tarayici = tara, simdi, tavanMs } = {}) {
  const son = oku(sonYolu())
  if (!zorla && son && son.gun === bugun && typeof son.satir === 'string') return son.satir
  const onbellek = oku(onbellekYolu())
  const durum = onbellek && onbellek.surum === 1 ? onbellek : bos()
  const r = tarayici({ durum, ...(simdi ? { simdi } : {}), ...(tavanMs ? { tavanMs } : {}) })
  const satir = satirUret(r.durum, bugun, r)
  yaz(onbellekYolu(), r.durum)
  yaz(sonYolu(), { gun: bugun, satir, olculdu: new Date().toISOString() })
  return satir
}

module.exports = { departman, kok, yerelGun, satirSay, dosyaTara, tara, satirUret, gunluk, bos, KATEGORILER, BUYUK_SINIR, TAVAN_MS, sonYolu, onbellekYolu }

if (require.main === module) {
  if (process.env.VENTHUB_DONUM_TARA_KAPAT === '1') process.exit(0)
  try {
    const arg = process.argv.slice(2)
    if (arg.includes('--yaz') || arg.includes('--zorla')) {
      process.stdout.write(gunluk({ zorla: arg.includes('--zorla') }) + '\n')
    } else {
      const son = oku(sonYolu())
      process.stdout.write((son && son.satir ? son.satir : 'DÖNÜM: henüz ölçülmedi (node scripts/arac/donum-tara.cjs --yaz)') + '\n')
    }
  } catch {
    // fail-open
  }
}
