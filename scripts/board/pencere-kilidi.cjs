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
/** Kart numarası kalıbı: kartsız emir kancasıyla TEK kaynak (departman önekleri orada). */
const KART_NO = new RegExp(require('../../.claude/hooks/kartsiz-emir-uyarisi.cjs').KART_NO.source, 'g')
/** Bir departman OPS'a yazdıysa OPS ona bu süre boyunca kilitten bağımsız cevap verebilir. */
const CEVAP_PENCERESI_MS = 30 * 60 * 1000

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
    const kilit = { ...j, izinliler: [...new Set(liste.map((r) => rolCoz(r) || String(r).toUpperCase()))] }
    // kartlar: ARC-213. Yoksa kart kuralı YOK (yalnız departman kuralı); VARSA (boş liste dahil) OPS'un departmana
    // mesajı yalnız bu kart numaralarını anabilir.
    if (Array.isArray(j.kartlar)) kilit.kartlar = [...new Set(j.kartlar.map((k) => String(k).toUpperCase()))]
    return { durum: 'var', kilit }
  } catch {
    return { durum: 'bozuk', sebep: 'JSON değil' }
  }
}

/** Atomik yazım (tmp + rename). Dönüş: kilit nesnesi. Geçersiz rol → fırlatır (yazma tarafı sıkıdır). */
function kilitYaz({ roller, kartlar, koyan = 'OPS', not, ifade, simdi = Date.now(), dosya = kilitDosyasi() }) {
  const izinliler = []
  for (const r of roller) {
    const rol = rolCoz(r)
    if (!rol) throw new Error(`bilinmeyen departman: "${r}" (geçerli: ${bilinenRoller().join(', ')})`)
    if (!izinliler.includes(rol)) izinliler.push(rol)
  }
  // Recep sözüyle otomatik konan kilit (koyan 'recep-sozu') izinlisiz olabilir: herkes kapalı, yalnız OPS ve cevaplar.
  if (izinliler.length === 0 && koyan !== 'recep-sozu') throw new Error('en az bir izinli departman gerekir (örn. --koy ARAC)')
  const kilit = { surum: 2, izinliler, koyan, koyulma: new Date(simdi).toISOString() }
  if (Array.isArray(kartlar)) {
    kilit.kartlar = []
    for (const k of kartlar) {
      const no = String(k).trim().toUpperCase()
      if (!/^[A-Z0-9]{2,4}-\d{1,5}$/.test(no)) throw new Error(`geçersiz kart numarası: "${k}" (örn. ARC-212)`)
      if (!kilit.kartlar.includes(no)) kilit.kartlar.push(no)
    }
  }
  if (typeof not === 'string' && not.trim()) kilit.not = not.trim().slice(0, 200)
  if (typeof ifade === 'string' && ifade.trim()) kilit.ifade = ifade.trim().slice(0, 120)
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
function karar({ kilit, alici, gonderenRol, cozum, mesaj, gelen, simdi = Date.now() }) {
  if (!kilit) return { izin: true, sebep: 'kilit yok', izinliler: [] }
  const izinliler = [...new Set([...kilit.izinliler, DAIMA_IZINLI, ...(gonderenRol ? [gonderenRol] : [])])]
  const c = cozum || aliciCoz(alici)
  if (c.tip === 'ad') return { izin: true, sebep: 'departman adına çözülmedi (alt ajan adı)', izinliler }
  if (c.tip === 'rol') {
    // CEVAP (ARC-213): departman OPS'a yazdıysa OPS ona kilitten bağımsız cevap verir (yalnız son 30 dk).
    if (gonderenRol === DAIMA_IZINLI && gelen && Number.isFinite(gelen[c.rol]) && simdi - gelen[c.rol] <= CEVAP_PENCERESI_MS && gelen[c.rol] >= Date.parse(kilit.koyulma || 0)) {
      return { izin: true, sebep: `${c.rol} OPS'a yazdı: cevap serbest`, izinliler }
    }
    if (!izinliler.includes(c.rol)) return { izin: false, sebep: `${c.rol} izinli değil`, izinliler }
    // KART KURALI (ARC-213): kilitte `kartlar` varsa OPS'un departmana mesajı yalnız izinli kart numaralarını anar.
    if (Array.isArray(kilit.kartlar) && gonderenRol === DAIMA_IZINLI && c.rol !== DAIMA_IZINLI) {
      const anilan = [...new Set((String(mesaj || '').match(KART_NO) || []).map((k) => k.toUpperCase()))]
      const yabanci = anilan.filter((k) => !kilit.kartlar.includes(k))
      if (anilan.length === 0) return { izin: false, sebep: `${c.rol} için mesajda izinli bir kart numarası yok (izinli kartlar: ${kilit.kartlar.join(', ') || 'yok'})`, izinliler }
      if (yabanci.length > 0) return { izin: false, sebep: `izinli olmayan kart numarası: ${yabanci.join(', ')} (izinli kartlar: ${kilit.kartlar.join(', ') || 'yok'})`, izinliler }
    }
    return { izin: true, sebep: `${c.rol} izinli`, izinliler }
  }
  if (c.tip === 'yayin') return { izin: false, sebep: 'yayın (*) tüm pencerelere ulaşır', izinliler }
  if (c.tip === 'rolsuz-pencere') return { izin: false, sebep: 'alıcı bir departmana bağlı değil', izinliler }
  return { izin: false, sebep: 'alıcının kimliği bir departmana çözülemedi', izinliler }
}

// ── ARC-213: kilidi RECEP'İN SÖZÜ açar/kaldırır; departmandan gelen mesaj "cevap hakkı" doğurur ──

function gelenDosyasi() {
  return process.env.VH_PENCERE_GELEN_DOSYASI || path.join(os.homedir(), '.claude', 'mod-durum', 'pencere-gelen.json')
}

/** { ROL: epochMs } — OPS'a en son mesaj yazan departmanlar. Okunamazsa {}. */
function gelenOku(dosya = gelenDosyasi()) {
  try {
    const j = JSON.parse(fs.readFileSync(dosya, 'utf8'))
    return j && typeof j === 'object' && !Array.isArray(j) ? j : {}
  } catch {
    return {}
  }
}

/** Departmanın OPS'a yazdığı anı kaydeder (atomik). Hata fırlatmaz. */
function gelenKaydet(roller, simdi = Date.now(), dosya = gelenDosyasi()) {
  try {
    if (!roller.length) return
    const k = gelenOku(dosya)
    for (const r of roller) k[r] = simdi
    fs.mkdirSync(path.dirname(dosya), { recursive: true })
    const gecici = `${dosya}.${process.pid}.tmp`
    fs.writeFileSync(gecici, JSON.stringify(k) + '\n')
    fs.renameSync(gecici, dosya)
  } catch {
    /* kayıt yazılamadı: cevap hakkı doğmaz, kilit daha sıkı kalır */
  }
}

// Recep'in OLMAYAN metin blokları: kanca/araç/yardımcı enjeksiyonları. Bunlar Recep sözü sayılmaz.
const ENJEKSIYON_BLOKLARI = [
  /<system-reminder[\s\S]*?<\/system-reminder[^>]*>/gi,
  /<cross-session-message[\s\S]*?<\/cross-session-message[^>]*>/gi,
  /<task-notification[\s\S]*?<\/task-notification>/gi,
  /<local-command-caveat[\s\S]*?<\/local-command-caveat>/gi,
  /<local-command-stdout[\s\S]*?<\/local-command-stdout>/gi,
  /<command-(?:name|message|args)>[\s\S]*?<\/command-(?:name|message|args)>/gi,
  /<ci-monitor-event[\s\S]*?<\/ci-monitor-event>/gi,
  /<side-sessions-event[\s\S]*?<\/side-sessions-event>/gi,
]

/**
 * İstemden Recep'in kendi yazdığı kısmı bırakır.
 *  · `<cross-session-message` AÇILIŞ etiketinden itibaren HER ŞEY Recep sayılmaz. Tembel regex ile blok kesmek, mesaj
 *    gövdesine gömülmüş sahte bir kapanış etiketinden sonrasını "Recep metni" yapardı (güvenlik incelemesi, ARC-213);
 *    başka bir departman mesajı bile kilidi koyup kaldıramaz. Bedel: Recep'in sözü departman mesajından SONRA gelirse
 *    kaçırılır (kilit konmaz); aynı istemde sözü önce yazıldığında yakalanır.
 *  · Diğer enjeksiyon blokları (sistem hatırlatması, görev bildirimi vb.) tam blok olarak atılır.
 */
function recepMetni(istem) {
  let m = String(istem || '')
  // Önce TAM enjeksiyon blokları atılır, sonra ilk departman mesajı açılışından kesilir, sonra kapanmamış herhangi bir
  // enjeksiyon açılışından itibaren her şey atılır (kapanmamış blok Recep metni olarak sızmasın; güvenlik incelemesi turu 2).
  const ilk = m.search(/<cross-session-message\b/i)
  if (ilk >= 0) m = m.slice(0, ilk)
  for (const re of ENJEKSIYON_BLOKLARI) m = m.replace(re, ' ')
  const acik = m.search(/<(?:system-reminder|task-notification|local-command-caveat|local-command-stdout|command-(?:name|message|args)|ci-monitor-event|side-sessions-event)\b/i)
  if (acik >= 0) m = m.slice(0, acik)
  return m.replace(/\s+/g, ' ').trim()
}

// Katlanmış (ASCII, küçük harf) metin üzerinde. "dokunmadan" gibi ekli sözcükler yakalanmasın diye sözcük sınırı.
const HARF = 'a-z0-9'
const kelime = (s) => new RegExp(`(?<![${HARF}])${s}(?![${HARF}])`)
const YASAK_IFADELERI = [kelime('pencere acma'), kelime('baska pencere'), kelime('dokunma'), /(?<![a-z0-9])yola cik/, kelime('simdi degil'), kelime('baslamasin')]
const KALDIRMA_SOZCUK_TAVANI = 8
const SERBEST_IFADELERI = [kelime('yasak kalkti'), kelime('yasak yok'), kelime('baslat'), kelime('baslatabilirsin'), kelime('devam'), kelime('serbest'), kelime('izin verdim')]

/**
 * Recep'in sözünden kilit kararı. Yasak ifadesi serbest ifadesinden ÖNCE bakılır ("devam et ama başka pencere açma" = yasak).
 * @returns {{tip:'koy'|'kaldir'|null, ifade:string}}
 */
function recepSozu(istem) {
  const m = pa.katla(recepMetni(istem))
  if (!m) return { tip: null, ifade: '' }
  for (const re of YASAK_IFADELERI) {
    const e = re.exec(m)
    if (e) return { tip: 'koy', ifade: e[0] }
  }
  // Kaldırma yalnız KISA mesajda (en çok 8 sözcük): uzun bir metindeki rastgele "devam" kilidi kaldırmasın.
  if (m.split(' ').length <= KALDIRMA_SOZCUK_TAVANI) {
    for (const re of SERBEST_IFADELERI) {
      const e = re.exec(m)
      if (e) return { tip: 'kaldir', ifade: e[0] }
    }
  }
  return { tip: null, ifade: '' }
}

/** İstemdeki departman mesajlarının göndericileri (rol). `from-name` önce, yoksa `from-session` (local_) çözülür. */
function gelenMesajlar(istem, secenek = {}) {
  const roller = []
  const metin = String(istem || '')
  const ac = /<cross-session-message\b([^>]*)>/gi
  const kapa = /<\/cross-session-message[^>]*>/gi
  let konum = 0
  // YALNIZ en dıştaki başlıklar. Gönderenin kontrol ettiği kapanış etiketine güvenilmez: iki başlık arasında kapanış
  // etiketi bulunsa da, gövdede (ilk kapanıştan sonra) başka bir kapanış daha varsa ya da araya gömülü açılış girerse
  // sonraki başlık SAYILMAZ (güvenlik incelemesi, tur 1 ve 2). Sonuç: yalnız ilk başlık güvenilir; sonrakiler yalnız
  // aralarında hiçbir ek kapanış/açılış etiketi yoksa kabul edilir.
  let ilkMi = true
  for (;;) {
    ac.lastIndex = konum
    const e = ac.exec(metin)
    if (!e) break
    kapa.lastIndex = ac.lastIndex
    const k = kapa.exec(metin)
    konum = k ? kapa.lastIndex : metin.length
    const govde = metin.slice(ac.lastIndex, k ? k.index : metin.length)
    const sahteIc = /<\/?cross-session-message\b/i.test(govde)
    if (!ilkMi) break // yalnız İLK başlık güvenilir: sonrası sahte kapanış etiketiyle üretilmiş olabilir
    ilkMi = false
    if (sahteIc) continue
    const ad = /from-name="([^"]*)"/.exec(e[1])
    const oturum = /from-session="([^"]*)"/.exec(e[1])
    // Kimlik OTURUM numarasından (uygulamanın kaydıyla doğrulanır); from-name yalnız çapraz kontrol. İkisi çelişirse ya
    // da oturum çözülemezse kayıt YOK (cevap hakkı doğmaz: sıkı yön).
    if (!oturum) continue
    const c = aliciCoz(oturum[1], secenek)
    if (c.tip !== 'rol') continue
    const adRol = ad ? rolCoz(basliktanSusAt(ad[1])) : ''
    if (adRol && adRol !== c.rol) continue
    if (!roller.includes(c.rol)) roller.push(c.rol)
  }
  return roller
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
    const kartlar = []
    let not
    for (let i = 0; i < kalan.length; i += 1) {
      if (kalan[i] === '--not') {
        not = kalan[i + 1]
        i += 1
      } else if (kalan[i] === '--kart') {
        kartlar.push(kalan[i + 1])
        i += 1
      } else roller.push(kalan[i])
    }
    try {
      const k = kilitYaz({ roller, kartlar: kartlar.length ? kartlar : undefined, not })
      const kartMetni = k.kartlar ? ` Yalnız şu kart numaralarını anan mesajlar gider: ${k.kartlar.join(', ')}.` : ''
      process.stdout.write(`Pencere kilidi KONDU. İzinli: ${k.izinliler.join(', ')} (+ OPS her zaman).${kartMetni} Kaldırmak için: --kaldir\n`)
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
    else {
      const kart = o.kilit.kartlar ? ` Kartlar: ${o.kilit.kartlar.join(', ') || 'yok'}.` : ''
      const kim = o.kilit.koyan === 'recep-sozu' ? ` Recep sözüyle kondu ("${o.kilit.ifade || ''}").` : ''
      process.stdout.write(`Kilit VAR. İzinli: ${o.kilit.izinliler.join(', ') || 'yok'} (+ OPS).${kart}${kim} Koyulma: ${saatOnce(o.kilit.koyulma) || 'bilinmiyor'}.\n`)
    }
    return 0
  }
  process.stderr.write('Kullanım: pencere-kilidi.cjs --koy ROL [ROL...] [--kart ARC-NN ...] [--not metin] | --kaldir | --goster\n')
  return 2
}

if (require.main === module) {
  process.exit(cli(process.argv.slice(2)))
}

module.exports = {
  kilitDosyasi,
  kilitOku,
  kilitYaz,
  kilitKaldir,
  aliciCoz,
  karar,
  rolCoz,
  rolOturumdan,
  localKayit,
  saatOnce,
  DAIMA_IZINLI,
  gelenDosyasi,
  gelenOku,
  gelenKaydet,
  recepMetni,
  recepSozu,
  gelenMesajlar,
  CEVAP_PENCERESI_MS,
}
