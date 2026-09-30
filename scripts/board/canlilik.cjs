#!/usr/bin/env node
/**
 * PANO CANLILIĞI — `claude agents --json --all` çıktısını pano claim'leriyle birleştirir (REC-524).
 *
 * NİÇİN VAR: pano canlılığı şimdiye kadar CLAIM ATIŞINDAN türetiliyordu (kalp atışı + 4 saatlik kira).
 * Atış oturumun YAŞADIĞINI değil, en son ne zaman atış YAZDIĞINI söyler. İki kör nokta ölçüldü:
 *   (a) pencere kapandı, claim kirası dolmadı → pano şeridi 4 saat "canlı" gösterir (HAYALET);
 *   (b) pencere açık ama hiç claim almadı → pano onu HİÇ göstermez (F8'in "kayıp pencere"si).
 * Gerçek kaynak Claude Code'un kendisi: `claude agents --json --all` açık TÜM interaktif pencereleri
 * verir (pid, cwd, kind, startedAt, sessionId, name, status busy/idle). Daemon gerekmez; ölçüldü
 * 2026-09-30, bu makine, ~0,65 sn. Cetvel: docs/standards/fleet-mechanism-standard.md (pano = claim +
 * canlılık).
 *
 * TASARIM — ince kablo: bu dosya SAF mantık + tek küçük süreç çağrısıdır. `board.cjs` yalnız çağırır.
 * `claude` çıktısı ENJEKTE edilebilir (`calistir` parametresi) → test gerçek `claude`a bağlı değildir
 * ve zaman aşımı / ENOENT / bozuk JSON yolları GERÇEK yorumlama koduyla koşar (sahte ara katman yok).
 *
 * FAIL-OPEN AMA SESSİZ DEĞİL: ölçüm başarısızsa (claude yok · 8 sn'de dönmedi · JSON bozuk) pano eski
 * çıktısını korur ve TEK satır "canlılık ölçülemedi (sebep)" ekler. "Ölçemedim" asla "hepsi canlı"
 * gibi okunmaz ve asla "hepsi kapalı" gibi de okunmaz — durum `bilinmiyor` kalır.
 *
 * ⚠ÇAĞRI MALİYETİ: her `who`/SessionStart çağrısı süreç açmasın diye 30 sn önbellek (pano dizininde
 * küçük json). Önbellek BAŞARISIZLIĞI da tutulur (8 sn'lik zaman aşımı her çağrıda tekrarlanmasın).
 */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

/** `claude` süreci bu sürede dönmezse öldürülür ve ölçüm "ölçülemedi" sayılır. */
const ZAMAN_ASIMI_MS = 8000
/** Önbellek ömrü. */
const ONBELLEK_MS = 30 * 1000
const ONBELLEK_ADI = 'canlilik-onbellek.json'
/** Alt ajan / gözlemci süreçlerin adı (`vh-arac-12`, `vh-…-xx`). Ana pencereler `venthub-hvac-xx` / serbest ad taşır. */
const ALT_SUREC_AD = /^vh-/i

/**
 * Ham metni pencere listesine çevirir. SAF.
 * @param {string} ham `claude agents --json --all` stdout'u
 * @returns {{ok:true, pencereler:Array<object>}|{ok:false, sebep:string}}
 */
function ayristir(ham) {
  const metin = String(ham == null ? '' : ham).trim()
  if (!metin) return { ok: false, sebep: 'çıktı boş (JSON bekleniyordu)' }
  let j
  try { j = JSON.parse(metin) } catch (e) { return { ok: false, sebep: `JSON bozuk: ${(e && e.message) || 'ayrıştırılamadı'}`.slice(0, 120) } }
  if (!Array.isArray(j)) return { ok: false, sebep: 'JSON dizi değil' }
  const pencereler = []
  for (const p of j) {
    if (!p || typeof p !== 'object') continue
    pencereler.push({
      pid: typeof p.pid === 'number' ? p.pid : null,
      cwd: typeof p.cwd === 'string' ? p.cwd : '',
      kind: typeof p.kind === 'string' ? p.kind : '',
      startedAt: typeof p.startedAt === 'number' ? p.startedAt : null,
      sessionId: typeof p.sessionId === 'string' ? p.sessionId : '',
      name: typeof p.name === 'string' ? p.name : '',
      status: typeof p.status === 'string' ? p.status : '',
    })
  }
  return { ok: true, pencereler }
}

/**
 * spawnSync benzeri sonucu (`{status, stdout, error, signal}`) ham metne ya da sebebe çevirir. SAF.
 * ENOENT · zaman aşımı · sıfırdan farklı çıkış AYRI sebeplerdir; hepsi "ölçülemedi"dir, hiçbiri hüküm değildir.
 */
function sonucuYorumla(r) {
  if (!r) return { ok: false, sebep: 'süreç sonucu yok' }
  const e = r.error
  if (e) {
    if (e.code === 'ENOENT') return { ok: false, sebep: 'claude bulunamadı (ENOENT)' }
    if (e.code === 'ETIMEDOUT') return { ok: false, sebep: `${ZAMAN_ASIMI_MS / 1000} sn'de dönmedi (zaman aşımı)` }
    return { ok: false, sebep: `süreç hatası: ${e.code || e.message || 'bilinmeyen'}`.slice(0, 120) }
  }
  if (r.signal) return { ok: false, sebep: `${ZAMAN_ASIMI_MS / 1000} sn'de dönmedi (${r.signal})` }
  if (typeof r.status === 'number' && r.status !== 0) return { ok: false, sebep: `claude çıkış kodu ${r.status}` }
  return { ok: true, ham: r.stdout == null ? '' : String(r.stdout) }
}

/**
 * Varsayılan çalıştırıcı: gerçek `claude agents --json --all`.
 * Test kancaları (yalnız ortam değişkeni; kural `gercekKaynakKapaliMi`de): `VENTHUB_CANLILIK_HAM=<dosya>` ham
 * çıktıyı dosyadan okur (CLI düzeyi uçtan uca test için); `VENTHUB_CANLILIK_KAPALI=1` ölçümü kapatır.
 */
function gercekCalistir() {
  const ham = process.env.VENTHUB_CANLILIK_HAM
  if (ham) {
    try { return { status: 0, stdout: fs.readFileSync(ham, 'utf8') } } catch (error) { return { status: null, error } }
  }
  return spawnSync('claude', ['agents', '--json', '--all'], {
    encoding: 'utf8',
    timeout: ZAMAN_ASIMI_MS,
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
  })
}

/**
 * GERÇEK `claude` kaynağı ne zaman KAPALI?
 *  - `VENTHUB_CANLILIK_HAM` (dosyadan ham çıktı) verilmişse HER ZAMAN açık: kaynak sahte ama bilinçli.
 *  - `VENTHUB_CANLILIK_KAPALI=1` → kapalı; `=0` → izole pano olsa da AÇIK (uçtan uca ölçüm için).
 *  - `VENTHUB_BOARD_DIR` verilmişse (İZOLE pano: test / deneme) kapalı. NİÇİN: izole panonun sid'leri sahtedir;
 *    gerçek `claude` listesiyle birleşince hepsi "hayalet" görünür ve yalan söyler. Gerçek pano varsayılan
 *    dizindedir; orada kaynak her zaman açıktır.
 */
function gercekKaynakKapaliMi() {
  if (process.env.VENTHUB_CANLILIK_HAM) return false
  const k = process.env.VENTHUB_CANLILIK_KAPALI
  if (k === '1') return true
  if (k === '0') return false
  return !!process.env.VENTHUB_BOARD_DIR
}

function onbellekOku(yol, simdi, ttlMs) {
  try {
    const j = JSON.parse(fs.readFileSync(yol, 'utf8'))
    if (j && typeof j.ts === 'number' && simdi - j.ts >= 0 && simdi - j.ts < ttlMs && typeof j.ok === 'boolean') return j
  } catch { /* yok/bozuk önbellek = önbellek yok */ }
  return null
}

function onbellekYaz(yol, kayit) {
  try {
    fs.mkdirSync(path.dirname(yol), { recursive: true })
    const gecici = `${yol}.${process.pid}.tmp`
    fs.writeFileSync(gecici, JSON.stringify(kayit), 'utf8')
    fs.renameSync(gecici, yol)
  } catch { /* önbellek yazılamadı: ölçüm yine döner, yalnız bir sonraki çağrı yeniden ölçer */ }
}

/**
 * Canlılığı ÖLÇER (önbellek → süreç). Asla fırlatmaz.
 * @param {object} [o]
 * @param {() => object} [o.calistir] spawnSync benzeri sonuç döndüren çalıştırıcı (test enjekte eder)
 * @param {number} [o.simdi] ms
 * @param {string} [o.onbellekYolu] verilmezse önbellek KULLANILMAZ (saf çağrı)
 * @param {number} [o.ttlMs]
 * @returns {{ok:true, pencereler:Array<object>, kaynak:'canli'|'onbellek', sureMs:number}|{ok:false, sebep:string, kaynak:'canli'|'onbellek'}}
 */
function olc(o = {}) {
  const simdi = typeof o.simdi === 'number' ? o.simdi : Date.now()
  const ttlMs = typeof o.ttlMs === 'number' ? o.ttlMs : ONBELLEK_MS
  if (!o.calistir && gercekKaynakKapaliMi()) return { ok: false, sebep: 'kapalı (izole pano ya da VENTHUB_CANLILIK_KAPALI=1)', kaynak: 'canli', kapali: true }
  if (o.onbellekYolu) {
    const c = onbellekOku(o.onbellekYolu, simdi, ttlMs)
    if (c) return c.ok ? { ok: true, pencereler: c.pencereler, kaynak: 'onbellek', sureMs: 0 } : { ok: false, sebep: c.sebep, kaynak: 'onbellek' }
  }
  const t0 = Date.now()
  let sonuc
  try {
    const yorum = sonucuYorumla((o.calistir || gercekCalistir)())
    sonuc = yorum.ok ? ayristir(yorum.ham) : yorum
  } catch (e) {
    sonuc = { ok: false, sebep: `ölçüm hatası: ${(e && e.message) || 'bilinmeyen'}`.slice(0, 120) }
  }
  const sureMs = Date.now() - t0
  if (o.onbellekYolu) {
    onbellekYaz(o.onbellekYolu, sonuc.ok ? { ts: simdi, ok: true, pencereler: sonuc.pencereler } : { ts: simdi, ok: false, sebep: sonuc.sebep })
  }
  return sonuc.ok
    ? { ok: true, pencereler: sonuc.pencereler, kaynak: 'canli', sureMs }
    : { ok: false, sebep: sonuc.sebep, kaynak: 'canli' }
}

/** Listede olup claim'i olmayan pencere ALT SÜREÇ mi (ana pencere değil mi)? SAF. */
function altSurecMi(p) {
  if (p.kind && p.kind !== 'interactive') return true
  if (ALT_SUREC_AD.test(p.name)) return true
  // Worktree: çalışma dizininin son parçası `vh-…` (C:/tmp/vh-arac-12). Ana ağaç `venthub-hvac` değildir.
  const son = String(p.cwd).replace(/\\/g, '/').replace(/\/+$/, '').split('/').pop() || ''
  return ALT_SUREC_AD.test(son)
}

/**
 * Claim'leri pencere listesiyle birleştirir. SAF.
 *  - claim var + listede var  → `canli` (ad + meşgul/boşta)
 *  - claim var + listede yok  → `hayalet` (pencere kapalı, claim duruyor)
 *  - listede var + claim yok  → `seritsiz` (şeritsiz açık pencere) ya da `altSurec`
 *  - claim'i olan pencere ASLA alt süreç sayılmaz (ana pencere; adı/dizini `vh-` olsa bile)
 * @param {Array<{sid:string}>} claimler
 * @param {Array<object>} pencereler `ayristir().pencereler`
 * @returns {{serit:Map<string,{durum:'canli'|'hayalet', ad:string, calisma:string}>, seritsiz:Array<object>, altSurec:Array<object>}}
 */
function birlestir(claimler, pencereler) {
  const sidleri = new Set((claimler || []).map((c) => c.sid))
  const pencereSid = new Map()
  for (const p of pencereler || []) if (p.sessionId) pencereSid.set(p.sessionId, p)
  const serit = new Map()
  for (const c of claimler || []) {
    const p = pencereSid.get(c.sid)
    serit.set(c.sid, p
      ? { durum: 'canli', ad: p.name, calisma: p.status }
      : { durum: 'hayalet', ad: '', calisma: '' })
  }
  const seritsiz = []
  const altSurec = []
  for (const p of pencereler || []) {
    if (p.sessionId && sidleri.has(p.sessionId)) continue
    ;(altSurecMi(p) ? altSurec : seritsiz).push(p)
  }
  return { serit, seritsiz, altSurec }
}

/** Meşgul/boşta sözcüğü; bilinmeyen değer olduğu gibi (uydurma çeviri yok). */
function calismaSozu(status) {
  if (status === 'busy') return 'meşgul'
  if (status === 'idle') return 'boşta'
  return status || '?'
}

/** Şerit satırının ucuna eklenen işaret. `null` = ölçüm yok, satır eskisi gibi kalır. */
function seritEtiketi(bilgi) {
  if (!bilgi) return ''
  if (bilgi.durum === 'hayalet') return ' ○KAPALI(hayalet: pencere yok, claim duruyor)'
  return ` ●canlı/${calismaSozu(bilgi.calisma)}`
}

function kisaSid(sid) { return sid ? String(sid).slice(0, 8) : '—' }
function dizinSonu(cwd) { return String(cwd || '').replace(/\\/g, '/').replace(/\/+$/, '').split('/').pop() || '?' }

/**
 * Şerit satırlarının ALTINA eklenecek satırlar (şeritsiz pencere · alt süreç · ölçüm başlığı). SAF.
 * @param {string} [benSid] çağıranın oturumu — şeritsizse "(sen)" işaretlenir
 */
function ekSatirlar(birlesim, olcum, benSid) {
  const out = []
  for (const p of birlesim.seritsiz) {
    const sen = benSid && p.sessionId === benSid ? ' (sen)' : ''
    out.push(`  ⚠ŞERİTSİZ AÇIK PENCERE${sen}: ${p.name || '(adsız)'} [${p.sessionId || 'sid yok'}] ${calismaSozu(p.status)}, ${dizinSonu(p.cwd)} — panoda claim yok`)
  }
  if (birlesim.altSurec.length > 0) {
    const liste = birlesim.altSurec.map((p) => `${p.name || dizinSonu(p.cwd)}(${calismaSozu(p.status)}, ${kisaSid(p.sessionId)})`).join(', ')
    out.push(`  ◦ALT SÜREÇ ${birlesim.altSurec.length} (ana pencere sayılmaz): ${liste}`)
  }
  if (olcum && olcum.ok) {
    const anaPencere = olcum.pencereler.length - birlesim.altSurec.length
    const kaynak = olcum.kaynak === 'onbellek' ? 'önbellek ≤30sn' : `ölçüldü ${olcum.sureMs}ms`
    out.push(`  canlılık: claude agents — ${anaPencere} açık pencere + ${birlesim.altSurec.length} alt süreç (${kaynak})`)
  }
  return out
}

/** Ölçüm başarısızsa eklenecek TEK satır (sessiz değil). */
function olculemediSatiri(olcum) {
  return `  canlılık ölçülemedi (${olcum.sebep}) — yukarıdaki durum yalnız claim atışına dayanıyor`
}

/**
 * Pano dizinindeki varsayılan önbellek yolu.
 * @param {string} panoDizini
 */
function onbellekYolu(panoDizini) { return path.join(panoDizini, ONBELLEK_ADI) }

module.exports = {
  ZAMAN_ASIMI_MS, ONBELLEK_MS, ONBELLEK_ADI,
  ayristir, sonucuYorumla, olc, birlestir, altSurecMi,
  seritEtiketi, ekSatirlar, olculemediSatiri, calismaSozu, onbellekYolu,
}
