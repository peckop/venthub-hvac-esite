'use strict'
/**
 * DIŞ KAYNAK SATIRLARI (ARC-216 kalan kollar: Claude Code sürümü, açık güncelleme PR sayısı, MCP bağlantı sağlığı,
 * dış kaynak sapması; KARAR 417, OPS eki) — defter-tazelik-satiri.cjs'in EŞİKLİ bloğu.
 *
 * ── NİÇİN VAR ──
 * TAKİP'in "MCP bağlantı sağlığı" ve "dış kaynak izleme" düzenli görevleri kalktı (TAKİP penceresi/panosu yok, ALT-45).
 * notebooklm-py 09-09'dan beri kimse fark etmeden kopuktu (ARC-70): açılıştaki "WRONGSTACK MCP: 4/4 sunucu tanımlı" satırı
 * yalnız AYARI ölçüyor, BAĞLANTIYI değil. İzleme hatırlamaya kalmasın diye satıra bağlandı. Zamanlayıcı/cron YOK (karar 53).
 *
 * ── NE ÖLÇER (hepsi ÖNBELLEKTEN okunur; ağ ve alt süreç YALNIZ arka plan işçisinde, günde en çok bir kez) ──
 *   1. ⚠CLAUDE CODE   : kurulu `claude --version` ↔ npm son sürüm. Eşik: minor fark ≥ 1 ya da patch fark ≥ 10.
 *   2. ⚠GUNCELLEME PR : açık Dependabot/Renovate PR sayısı. Eşik: ≥ 8 (ARAÇ önerisi; env VENTHUB_GUNCELLEME_PR_ESIK).
 *   3. ⚠MCP BAGLANTI  : `claude mcp list` → BAĞLANAMAYAN sunucu adları; kimlik bekleyenler AYRI sayılır ve yalnız
 *                       SAYI DEĞİŞİNCE konuşur (sürekli bekleyenler gürültüdür). Bağlanamayan varsa her zaman konuşur.
 *   4. ⚠DIS KAYNAK    : claude-seo kurulu sürüm ↔ GitHub son sürüm; addyosmani/agent-skills'ten aldığımız skill'lerin
 *                       `Kaynak: ... @<sha>` satırı ↔ o skill dosyasının GitHub'daki son commit'i (fark varsa hangi skill).
 * Hiçbiri eşiği geçmezse SATIR YOK. Ölçüm hiç yapılamadıysa konuşur (ölçülemedi ≠ güncel). Güncellemeyi yapan yok:
 * satır yalnız haber verir, OPS okur, Yetenek işler.
 *
 * ⛔ENJEKSİYON SINIRI: bağlama giden her değer DIŞ VERİDİR; sürüm yalnız rakamlardan, sha yalnız hex'ten, ad yalnız
 * [a-z0-9-]'dan yeniden kurulur, serbest metin sabit sözlükten seçilir.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')

const ONBELLEK_ADI = '.dis-kaynak-onbellek.json'
const TAZELE_SAAT = 24
const HATA_YENIDEN_SAAT = 2
const BAYAT_SAAT = 72
const KILIT_DK = 10
const PR_ESIK = Number(process.env.VENTHUB_GUNCELLEME_PR_ESIK || 8)
const AGENT_SKILLS_DEPO = 'addyosmani/agent-skills'
const KAYNAK_RE = /Kaynak:\s*addyosmani\/agent-skills\s+([a-z0-9-]+)\s+@([0-9a-f]{7,40})/gi

function onbellekYolu(pano) {
  return path.join(pano, ONBELLEK_ADI)
}

function surumAyir(s) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(s == null ? '' : s).trim())
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}
function surumTemiz(s) {
  const a = surumAyir(s)
  return a ? a.join('.') : null
}
function shaTemiz(s) {
  const m = /^[0-9a-f]{7,40}$/i.exec(String(s == null ? '' : s).trim())
  return m ? m[0].toLowerCase() : null
}
function adTemiz(s) {
  return /^[a-z0-9][a-z0-9-]{0,60}$/i.test(String(s == null ? '' : s)) ? String(s).toLowerCase() : null
}
function sayiTemiz(n) {
  return Number.isInteger(n) && n >= 0 && n < 100000 ? n : null
}

/** ÖLÇÜM 1 eşiği: a<b ve (minor fark ≥ 1 ya da patch fark ≥ 10). Çözülemezse false. */
function claudeGeride(kurulu, son) {
  const a = surumAyir(kurulu)
  const b = surumAyir(son)
  if (!a || !b) return false
  if (a[0] !== b[0]) return a[0] < b[0]
  if (a[1] !== b[1]) return a[1] < b[1]
  return b[2] - a[2] >= 10
}

/** `claude mcp list` çıktısını ayrıştırır → { baglanamayan: [ad], kimlik: n, toplam: n }; satır tanınmazsa sayılmaz. */
function mcpAyristir(metin) {
  const baglanamayan = []
  let kimlik = 0
  let toplam = 0
  for (const satir of String(metin || '').split(/\r?\n/)) {
    // Canlı biçim (2.1.296): `<ad>: <hedef> - ✔ Connected` | `- ✗ Failed to connect` | `- ! Needs authentication`. Ad boşluk ve ':' içerebilir
    // (`claude.ai Gmail`, `plugin:sentry:sentry`); adın sonu ilk ": " (iki nokta + boşluk).
    const m = /^(.+?):\s.*\s-\s(?:✔|✗|!)\s*(Connected|Failed to connect|Needs authentication)\s*$/.exec(satir.trim())
    if (!m) continue
    toplam += 1
    const ad = String(m[1]).toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
    if (/Failed/.test(m[2]) && ad) baglanamayan.push(ad)
    else if (/Needs/.test(m[2])) kimlik += 1
  }
  return { baglanamayan, kimlik, toplam }
}

/** Depodaki skill dosyalarından `Kaynak: addyosmani/agent-skills <skill> @<sha>` kayıtları → { <kaynak-skill>: sha }. */
function skillKaynaklari(depo) {
  const sonuc = {}
  let adlar = []
  try {
    adlar = fs.readdirSync(path.join(depo, '.claude', 'skills'))
  } catch {
    return sonuc
  }
  for (const ad of adlar) {
    let metin
    try {
      metin = fs.readFileSync(path.join(depo, '.claude', 'skills', ad, 'SKILL.md'), 'utf8')
    } catch {
      continue
    }
    for (const m of metin.matchAll(KAYNAK_RE)) {
      const skill = adTemiz(m[1])
      const sha = shaTemiz(m[2])
      if (skill && sha) sonuc[skill] = sha
    }
  }
  return sonuc
}

/** Önbellek verisinden satırlar. Eşik altında hiçbir şey. @returns {string[]} */
function satirlar(veri, simdi = Date.now()) {
  const v = veri || {}
  const cikti = []
  const c = v.claude || {}
  const ck = surumTemiz(c.kurulu)
  const cs = surumTemiz(c.son)
  if (ck && cs && claudeGeride(ck, cs)) {
    const a = surumAyir(ck)
    const b = surumAyir(cs)
    cikti.push('⚠CLAUDE CODE: bizde ' + ck + ', son ' + cs + (a[0] === b[0] && a[1] === b[1] ? ' · ' + (b[2] - a[2]) + ' surum geride' : ' · geride'))
  }
  const pr = sayiTemiz(v.guncellemePr)
  if (pr !== null && pr >= PR_ESIK) cikti.push('⚠GUNCELLEME PR: ' + pr + ' acik bagimlilik PR (esik ' + PR_ESIK + ')')
  const m = v.mcp
  if (m && Array.isArray(m.baglanamayan)) {
    const kopuk = m.baglanamayan.map((x) => (/^[a-z0-9][a-z0-9.-]{0,39}$/.test(String(x)) ? String(x) : null)).filter(Boolean)
    const kimlik = sayiTemiz(m.kimlik)
    const onceki = sayiTemiz(m.oncekiKimlik)
    const parca = []
    if (kopuk.length > 0) parca.push('baglanamayan ' + kopuk.slice(0, 6).join(', ') + (kopuk.length > 6 ? ' +' + (kopuk.length - 6) : ''))
    if (kimlik !== null && onceki !== null && kimlik !== onceki) parca.push('kimlik bekleyen ' + onceki + ' → ' + kimlik)
    if (parca.length > 0) cikti.push('⚠MCP BAGLANTI: ' + parca.join(' · '))
  }
  const dis = []
  const sk = surumTemiz(v.seo && v.seo.kurulu)
  const ss = surumTemiz(v.seo && v.seo.son)
  if (sk && ss) {
    const a = surumAyir(sk)
    const b = surumAyir(ss)
    if (a[0] < b[0] || (a[0] === b[0] && (a[1] < b[1] || (a[1] === b[1] && a[2] < b[2])))) dis.push('claude-seo ' + sk + ' → son ' + ss)
  }
  const degisen = Array.isArray(v.skills) ? v.skills.filter((s) => s && s.degisti === true && adTemiz(s.skill)) : []
  if (degisen.length > 0) {
    dis.push('agent-skills degisti: ' + degisen.slice(0, 5).map((s) => adTemiz(s.skill)).join(', ') + (degisen.length > 5 ? ' +' + (degisen.length - 5) : ''))
  }
  if (dis.length > 0) cikti.push('⚠DIS KAYNAK: ' + dis.join(' · '))
  // Önbellek bayatsa ya da son ölçüm hata verdiyse ayrıca söyle: ölçemedim ≠ güncel.
  const yas = Math.floor((simdi - Date.parse(v.olculdu)) / 3600000)
  if (Number.isFinite(yas) && yas >= BAYAT_SAAT) cikti.push('⚠DIS KAYNAK: onbellek ' + yas + ' saat bayat (olcum calismiyor olabilir)')
  else if (v.hata) cikti.push('⚠DIS KAYNAK: son olcum OLCULEMEDI (' + String(v.hata).replace(/[^a-z0-9 ._-]/gi, '').slice(0, 40) + ')')
  return cikti
}

function oku(yol) {
  let metin
  try {
    metin = fs.readFileSync(yol, 'utf8')
  } catch {
    return { durum: 'yok' }
  }
  try {
    const v = JSON.parse(metin)
    if (!v || typeof v.olculdu !== 'string') return { durum: 'bozuk' }
    return { durum: 'tamam', veri: v }
  } catch {
    return { durum: 'bozuk' }
  }
}

/** Hook çağrısı: önbellek durumuna göre satırlar (yok/bozuk → tek "OLCULMEDI" satırı). */
function satir(sonuc, simdi = Date.now()) {
  if (sonuc.durum === 'yok') return ['⚠DIS KAYNAK: OLCULMEDI (onbellek yok)']
  if (sonuc.durum === 'bozuk') return ['⚠DIS KAYNAK: OLCULEMEDI (onbellek bozuk)']
  return satirlar(sonuc.veri, simdi)
}

// ───────────────────────────── ÖLÇÜM İŞÇİSİ (yalnız `--yaz` ile, arka planda) ─────────────────────────────

async function getir(fetchFn, adres, zamanAsimiMs = 8000) {
  // npm kaydı GitHub'ın accept başlığına 406 verir (canlıda ölçüldü): başlık adrese göre.
  const accept = adres.startsWith('https://api.github.com') ? 'application/vnd.github+json' : 'application/json'
  const y = await fetchFn(adres, { headers: { accept, 'user-agent': 'venthub-dis-kaynak' }, signal: AbortSignal.timeout(zamanAsimiMs) })
  if (!y.ok) throw new Error('HTTP ' + y.status)
  return y.json()
}

/**
 * Tüm ölçümler; her biri bağımsız ve hatası YALNIZ kendi alanını boş bırakır (biri düşünce diğerleri yaşar).
 * `girdi`: { fetchFn, calistir(komut, argumanlar, ms) → Promise<string>, depo, kurulumDosyasi, oncekiKimlik, bellekGB }
 */
async function olc(girdi) {
  const { fetchFn, calistir, depo } = girdi
  const hatalar = []
  const sonuc = {}
  try {
    const cikti = await calistir('claude', ['--version'], 20000)
    sonuc.claude = { kurulu: surumTemiz((/\d+\.\d+\.\d+/.exec(cikti) || [])[0]) }
    const n = await getir(fetchFn, 'https://registry.npmjs.org/@anthropic-ai/claude-code/latest')
    sonuc.claude.son = surumTemiz(n && n.version)
  } catch (e) {
    hatalar.push('claude ' + String(e && e.message).slice(0, 20))
  }
  try {
    const cikti = await calistir('gh', ['pr', 'list', '--repo', 'peckop/venthub-hvac-esite', '--state', 'open', '--limit', '100', '--json', 'author'], 30000)
    const liste = JSON.parse(cikti)
    sonuc.guncellemePr = liste.filter((p) => /dependabot|renovate/i.test(String(p && p.author && p.author.login))).length
  } catch (e) {
    hatalar.push('gh ' + String(e && e.message).slice(0, 20))
  }
  try {
    if (typeof girdi.bellekGB === 'number' && girdi.bellekGB < 3) throw new Error('bellek dusuk, mcp atlandi')
    const m = mcpAyristir(await calistir('claude', ['mcp', 'list'], 120000))
    sonuc.mcp = { baglanamayan: m.baglanamayan, kimlik: m.kimlik, toplam: m.toplam, oncekiKimlik: girdi.oncekiKimlik }
    if (m.toplam === 0) throw new Error('mcp cikti taninmadi')
  } catch (e) {
    delete sonuc.mcp
    hatalar.push('mcp ' + String(e && e.message).slice(0, 24))
  }
  try {
    const kayit = JSON.parse(fs.readFileSync(girdi.kurulumDosyasi, 'utf8'))
    const kurulular = ((kayit.plugins || kayit)['claude-seo@agricidaniel-claude-seo'] || []).map((k) => k && k.version).filter((x) => surumAyir(x))
    if (kurulular.length > 0) {
      kurulular.sort((a, b) => (surumAyir(a)[0] - surumAyir(b)[0]) || (surumAyir(a)[1] - surumAyir(b)[1]) || (surumAyir(a)[2] - surumAyir(b)[2]))
      const son = await getir(fetchFn, 'https://api.github.com/repos/AgriciDaniel/claude-seo/releases/latest')
      sonuc.seo = { kurulu: surumTemiz(kurulular[0]), son: surumTemiz(son && son.tag_name) }
    }
  } catch (e) {
    hatalar.push('seo ' + String(e && e.message).slice(0, 20))
  }
  try {
    const kaynaklar = skillKaynaklari(depo)
    const skills = []
    for (const [skill, kaynak] of Object.entries(kaynaklar)) {
      const k = await getir(fetchFn, 'https://api.github.com/repos/' + AGENT_SKILLS_DEPO + '/commits?per_page=1&path=' + encodeURIComponent('skills/' + skill + '/SKILL.md'))
      const son = shaTemiz(Array.isArray(k) && k[0] && k[0].sha)
      if (!son) continue
      // ⭐`kaynak` deponun O ANKİ HEAD'idir, dosyayı değiştiren commit değil: "son commit ≠ kaynak" HER ZAMAN fark gösterirdi
      // (canlıda 13/13 yanlış alarm). Doğru soru: dosyanın son commit'i kaynak sha'nın ATASI mı? compare son...kaynak:
      // 'ahead' (kaynak ilerde) ya da 'identical' = dosya kaynaktan sonra DEĞİŞMEMİŞ; 'diverged'/'behind' = değişmiş.
      const c = await getir(fetchFn, 'https://api.github.com/repos/' + AGENT_SKILLS_DEPO + '/compare/' + son + '...' + kaynak)
      skills.push({ skill, kaynak, son, degisti: !(c && (c.status === 'ahead' || c.status === 'identical')) })
    }
    sonuc.skills = skills
  } catch (e) {
    hatalar.push('skills ' + String(e && e.message).slice(0, 20))
  }
  return { ...sonuc, olculdu: new Date().toISOString(), ...(hatalar.length ? { hata: hatalar.join(',') } : {}) }
}

async function yaz(pano, girdi) {
  const eski = oku(onbellekYolu(pano))
  const oncekiKimlik = eski.durum === 'tamam' && eski.veri.mcp ? sayiTemiz(eski.veri.mcp.kimlik) : null
  const yeni = await olc({ ...girdi, oncekiKimlik })
  // Alan ölçülemediyse eski bilinen değer korunur (hata alanı bunu söyler).
  if (eski.durum === 'tamam') for (const k of ['claude', 'guncellemePr', 'mcp', 'seo', 'skills']) if (yeni[k] === undefined && eski.veri[k] !== undefined) yeni[k] = eski.veri[k]
  fs.mkdirSync(pano, { recursive: true })
  const yol = onbellekYolu(pano)
  const gecici = yol + '.' + process.pid + '.tmp'
  fs.writeFileSync(gecici, JSON.stringify(yeni))
  fs.renameSync(gecici, yol)
  return yeni
}

/** Önbellek yok/bayat ise ölçümü arka planda başlatır (kopuk-baslat.cjs). Başlatıldıysa true. */
function gerekirseTazele(pano, simdi = Date.now()) {
  const s = oku(onbellekYolu(pano))
  if (s.durum === 'tamam') {
    const limit = (s.veri.hata ? HATA_YENIDEN_SAAT : TAZELE_SAAT) * 3600000
    if (simdi - Date.parse(s.veri.olculdu) < limit) return false
  }
  const kilit = onbellekYolu(pano) + '.kilit'
  try {
    if (simdi - fs.statSync(kilit).mtimeMs < KILIT_DK * 60000) return false
  } catch {
    /* kilit yok */
  }
  try {
    fs.mkdirSync(pano, { recursive: true })
    fs.writeFileSync(kilit, String(simdi))
    require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kopuk-baslat.cjs')).kopukBaslat(__filename, ['--yaz'], {
      env: { ...process.env, VENTHUB_BOARD_DIR: pano },
    })
    return true
  } catch {
    return false
  }
}

module.exports = { onbellekYolu, claudeGeride, mcpAyristir, skillKaynaklari, satirlar, satir, oku, olc, yaz, gerekirseTazele, PR_ESIK, BAYAT_SAAT }

if (require.main === module && process.argv.includes('--yaz')) {
  const { execFile } = require('child_process')
  const pano = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
  const calistir = (komut, args, ms) =>
    new Promise((coz, red) => execFile(komut, args, { encoding: 'utf8', timeout: ms, windowsHide: true, shell: process.platform === 'win32' }, (e, o) => (e ? red(e) : coz(String(o)))))
  yaz(pano, {
    fetchFn: globalThis.fetch,
    calistir,
    depo: path.resolve(__dirname, '..', '..'),
    kurulumDosyasi: path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json'),
    bellekGB: os.freemem() / 1073741824,
  }).then(
    () => process.exit(0),
    () => process.exit(0),
  )
}
