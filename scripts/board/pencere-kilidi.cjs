#!/usr/bin/env node
'use strict'

/**
 * PENCERE KİLİDİ (ARC-212, OPS emri 26 Ekim 2026) — "başka pencere açma" sözünün makine karşılığı.
 *
 * NİÇİN: OPS iki gün üst üste Recep'in pencere yasağını çiğnedi (yeniden başlatma öncesi ve Ürün'e giden mesaj). Kural
 * hafızada yazılıydı ama mesaj gönderilirken önüne gelmedi. Karar: tekrarlanan hata aynı gün kancaya bağlanır.
 *
 * NE: Recep yasağı söyleyince OPS `--koy ARAC` yazar; kilit dosyası izinli departmanları tutar. SendMessage kancası
 * (.claude/hooks/pencere-kilidi-kapisi.cjs) alıcıyı bir departmana çevirir; izinli değilse gönderimi REDDEDER.
 * Dosya yoksa davranış değişmez. `--kaldir` dosyayı siler.
 *
 * ALICI → DEPARTMAN EŞLEMESİ (2026-10-26'da 20 canlı kayıtta ölçüldü): SendMessage `to` alanı üç biçimde gelir.
 *  · çıplak ad ("ARAC", "Araç", "arac-pencere", "ops-arastirmaci") → ad tablosu (pencere-adlari.cjs) + `-pencere` ve
 *    çalışan sonekleri atılır;
 *  · oturum kimliği (UUID) → rol-kimlikleri.json (güncel ve önceki kimlikler);
 *  · `local_<uuid>` → uygulamanın oturum kaydındaki `cliSessionId` → rol-kimlikleri.json. DİKKAT: `local_` ön eki,
 *    `cliSessionId` ön ekiyle AYNI DEĞİLDİR (OPS: local_54395ed4 ↔ 69c8cf17); doğrudan karşılaştırma yanlış olur.
 *
 * KARAR (saf işlev `karar`): kilit yoksa izin. Kilit varken ZORUNLU izinliler: kilitteki liste + OPS (Recep ile konuşan
 * pencere; departmanlar ona rapor verir) + göndericinin kendi rolü. Rolü çözülen alıcı bu kümede değilse RED; kimliği
 * (local_/UUID) çözülemeyen ya da rolü olmayan bir pencereye RED (izinli olduğu kanıtlanamaz); `*` yayını RED; yalnız
 * çıplak ad olup hiçbir departmana çözülmeyen alıcı (alt ajan adı) GEÇER — bilinen bir pencere değildir.
 *
 * Kullanım:
 *   node scripts/board/pencere-kilidi.cjs --koy ARAC [URUN ...] [--not "metin"]
 *   node scripts/board/pencere-kilidi.cjs --kaldir
 *   node scripts/board/pencere-kilidi.cjs --goster          (varsayılan)
 *
 * Yollar test için değişir: VH_PENCERE_KILIDI_DOSYASI, VH_OTURUM_KAYIT_DIZINI (+ pencere-kimligi.cjs'in
 * VENTHUB_ROL_KIMLIK_DOSYASI'). FAIL-OPEN okuma tarafında (kanca asla çökmez); YAZMA tarafı geçersiz rolde reddeder.
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const pk = require('./pencere-kimligi.cjs')
const pa = require('./pencere-adlari.cjs')

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LOCAL = /^local_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
/** Çalışan ve pencere soneki: `ops-arastirmaci`, `arac-pencere` → rol adı. */
const SONEK = /-(?:pencere|arastirmaci|curutucu|dogrulayici|uygulayici)$/
/** OPS her zaman izinlidir: Recep onunla konuşur, departmanlar ona rapor verir. */
const DAIMA_IZINLI = 'OPS'

function kilitDosyasi() {
  return process.env.VH_PENCERE_KILIDI_DOSYASI || path.join(os.homedir(), '.claude', 'mod-durum', 'pencere-kilidi.json')
}

function oturumKaydiDizini() {
  return (
    process.env.VH_OTURUM_KAYIT_DIZINI ||
    path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Claude', 'claude-code-sessions')
  )
}

/**
 * Pencere başlığındaki süsleri atar: "(yeni düzen)" parantezi VE ListAgents'in eklediği "[d83e92]" köşeli ref.
 * Ref atılmazsa "Ürün (yeni düzen) [d83e92]" departmana çözülmez, alt ajan sayılıp kilitten GEÇERDİ (OPS bulgusu).
 */
function basliktanSusAt(metin) {
  return String(metin).replace(/\[[^\]]*\]/g, ' ').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Tablodaki geçerli rol anahtarları (ASCII, büyük harf). */
function bilinenRoller() {
  return pa.TABLO.map((s) => s[0])
}

/** Serbest yazımı ("Araç", "arac", "GEO-SEO") rol anahtarına çevirir; tanınmazsa ''. */
function rolCoz(yazim) {
  const x = pa.katla(yazim)
  if (!x) return ''
  for (const [anahtar, ad] of pa.TABLO) {
    if (pa.katla(anahtar) === x || pa.katla(ad) === x) return anahtar
  }
  return ''
}

/** Kilidi okur. Dönüş: { durum: 'yok' | 'var' | 'bozuk', kilit?, sebep? } — hata fırlatmaz. */
function kilitOku(dosya = kilitDosyasi()) {
  let ham
  try {
    ham = fs.readFileSync(dosya, 'utf8')
  } catch (e) {
    if (e && e.code === 'ENOENT') return { durum: 'yok' }
    return { durum: 'bozuk', sebep: 'okunamadı' }
  }
  try {
    const j = JSON.parse(ham)
    const liste = j && Array.isArray(j.izinliler) ? j.izinliler : null
    if (!liste || liste.some((r) => typeof r !== 'string')) return { durum: 'bozuk', sebep: 'izinliler listesi yok' }
    return { durum: 'var', kilit: { ...j, izinliler: [...new Set(liste.map((r) => rolCoz(r) || String(r).toUpperCase()))] } }
  } catch {
    return { durum: 'bozuk', sebep: 'JSON değil' }
  }
}

/** Atomik yazım (tmp + rename). Dönüş: kilit nesnesi. Geçersiz rol → fırlatır (yazma tarafı sıkıdır). */
function kilitYaz({ roller, koyan = 'OPS', not, simdi = Date.now(), dosya = kilitDosyasi() }) {
  const izinliler = []
  for (const r of roller) {
    const rol = rolCoz(r)
    if (!rol) throw new Error(`bilinmeyen departman: "${r}" (geçerli: ${bilinenRoller().join(', ')})`)
    if (!izinliler.includes(rol)) izinliler.push(rol)
  }
  if (izinliler.length === 0) throw new Error('en az bir izinli departman gerekir (örn. --koy ARAC)')
  const kilit = { surum: 1, izinliler, koyan, koyulma: new Date(simdi).toISOString() }
  if (typeof not === 'string' && not.trim()) kilit.not = not.trim().slice(0, 200)
  fs.mkdirSync(path.dirname(dosya), { recursive: true })
  const gecici = `${dosya}.${process.pid}.tmp`
  fs.writeFileSync(gecici, JSON.stringify(kilit, null, 2) + '\n')
  fs.renameSync(gecici, dosya)
  return kilit
}

/** Kilidi kaldırır. Dönüş: true = dosya vardı ve silindi. */
function kilitKaldir(dosya = kilitDosyasi()) {
  try {
    fs.unlinkSync(dosya)
    return true
  } catch (e) {
    if (e && e.code === 'ENOENT') return false
    throw e
  }
}

/** UUID oturum kimliğini role çevirir (güncel ve önceki kimlikler). Bulunamazsa ''. */
function rolOturumdan(sid, rolKayitDosyasi) {
  const x = String(sid || '').toLowerCase()
  if (!UUID.test(x)) return ''
  const kayit = rolKayitDosyasi ? pk.kayitOku(rolKayitDosyasi) : pk.kayitOku()
  for (const [rol, k] of Object.entries(kayit)) {
    if (!k || typeof k !== 'object') continue
    const hepsi = [k.sid, ...(Array.isArray(k.oncekiler) ? k.oncekiler : [])].map((s) => String(s || '').toLowerCase())
    if (hepsi.includes(x)) return rol
  }
  return ''
}

/** `local_<uuid>` için uygulamanın oturum kaydı ({cliSessionId, title,...}) ya da null. İki seviye klasör taranır. */
function localKayit(localId, kok = oturumKaydiDizini()) {
  const dosyaAdi = `${localId}.json`
  try {
    for (const a of fs.readdirSync(kok, { withFileTypes: true })) {
      if (!a.isDirectory()) continue
      const altKok = path.join(kok, a.name)
      for (const b of fs.readdirSync(altKok, { withFileTypes: true })) {
        if (!b.isDirectory()) continue
        const f = path.join(altKok, b.name, dosyaAdi)
        if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'))
      }
    }
  } catch {
    /* kayıt dizini yok ya da okunamadı: bulunamadı sayılır */
  }
  return null
}

/**
 * Alıcıyı çözer.
 * @returns {{tip:'rol', rol:string} | {tip:'rolsuz-pencere'} | {tip:'kimlik-cozulemedi'} | {tip:'yayin'} | {tip:'ad'}}
 */
function aliciCoz(alici, secenek = {}) {
  const ham = typeof alici === 'string' ? alici.trim() : ''
  if (!ham) return { tip: 'ad' }
  if (ham === '*') return { tip: 'yayin' }

  const local = LOCAL.exec(ham)
  if (local) {
    const kayit = localKayit(ham, secenek.oturumKok)
    if (!kayit) return { tip: 'kimlik-cozulemedi' }
    const rol = rolOturumdan(kayit.cliSessionId, secenek.rolKayit) || rolCoz(basliktanSusAt(String(kayit.title || '')))
    return rol ? { tip: 'rol', rol } : { tip: 'rolsuz-pencere' }
  }
  if (UUID.test(ham)) {
    const rol = rolOturumdan(ham, secenek.rolKayit)
    return rol ? { tip: 'rol', rol } : { tip: 'kimlik-cozulemedi' }
  }
  const ad = pa.katla(basliktanSusAt(ham)).replace(SONEK, '')
  const rol = rolCoz(ad)
  return rol ? { tip: 'rol', rol } : { tip: 'ad' }
}

/**
 * Saf karar. @returns {{izin:boolean, sebep:string, izinliler:string[]}}
 * `kilit` null ise (dosya yok) izin verilir.
 */
function karar({ kilit, alici, gonderenRol, cozum }) {
  if (!kilit) return { izin: true, sebep: 'kilit yok', izinliler: [] }
  const izinliler = [...new Set([...kilit.izinliler, DAIMA_IZINLI, ...(gonderenRol ? [gonderenRol] : [])])]
  const c = cozum || aliciCoz(alici)
  if (c.tip === 'ad') return { izin: true, sebep: 'departman adına çözülmedi (alt ajan adı)', izinliler }
  if (c.tip === 'rol') {
    return izinliler.includes(c.rol)
      ? { izin: true, sebep: `${c.rol} izinli`, izinliler }
      : { izin: false, sebep: `${c.rol} izinli değil`, izinliler }
  }
  if (c.tip === 'yayin') return { izin: false, sebep: 'yayın (*) tüm pencerelere ulaşır', izinliler }
  if (c.tip === 'rolsuz-pencere') return { izin: false, sebep: 'alıcı bir departmana bağlı değil', izinliler }
  return { izin: false, sebep: 'alıcının kimliği bir departmana çözülemedi', izinliler }
}

function saatOnce(isoMetin, simdi = Date.now()) {
  const t = Date.parse(isoMetin)
  if (!Number.isFinite(t)) return ''
  const dk = Math.max(0, Math.round((simdi - t) / 60000))
  return dk < 90 ? `${dk} dakika önce` : `${Math.round(dk / 60)} saat önce`
}

function cli(argv) {
  const [komut = '--goster', ...kalan] = argv
  if (komut === '--kaldir') {
    const silindi = kilitKaldir()
    process.stdout.write(silindi ? 'Pencere kilidi kaldırıldı: tüm pencerelere mesaj gider.\n' : 'Kilit zaten yoktu.\n')
    return 0
  }
  if (komut === '--koy') {
    const roller = []
    let not
    for (let i = 0; i < kalan.length; i += 1) {
      if (kalan[i] === '--not') {
        not = kalan[i + 1]
        i += 1
      } else roller.push(kalan[i])
    }
    try {
      const k = kilitYaz({ roller, not })
      process.stdout.write(`Pencere kilidi KONDU. İzinli: ${k.izinliler.join(', ')} (+ OPS her zaman). Kaldırmak için: --kaldir\n`)
      return 0
    } catch (e) {
      process.stderr.write(`${e.message}\n`)
      return 2
    }
  }
  if (komut === '--goster') {
    const o = kilitOku()
    if (o.durum === 'yok') process.stdout.write('Kilit yok: tüm pencerelere mesaj gider.\n')
    else if (o.durum === 'bozuk') process.stdout.write(`Kilit dosyası BOZUK (${o.sebep}): ${kilitDosyasi()}\n`)
    else process.stdout.write(`Kilit VAR. İzinli: ${o.kilit.izinliler.join(', ')} (+ OPS). Koyulma: ${saatOnce(o.kilit.koyulma) || 'bilinmiyor'}.\n`)
    return 0
  }
  process.stderr.write('Kullanım: pencere-kilidi.cjs --koy ROL [ROL...] [--not metin] | --kaldir | --goster\n')
  return 2
}

if (require.main === module) {
  process.exit(cli(process.argv.slice(2)))
}

module.exports = { kilitDosyasi, kilitOku, kilitYaz, kilitKaldir, aliciCoz, karar, rolCoz, rolOturumdan, localKayit, saatOnce, DAIMA_IZINLI }
