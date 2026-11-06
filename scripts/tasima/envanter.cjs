'use strict'
/**
 * MAKİNE TAŞIMA — ENVANTER TANIMI VE TARAYICI (ALT-165).
 * Cetvel: docs/standards/makine-tasima-standard.md (envanter tablosu bu dosyanın insan okunur karşılığıdır;
 * ikisi ayrışırsa DOSYA kazanır, tablo güncellenir).
 *
 * Kökler (kullanıcı adı kodda yok):
 *   ev       os.homedir() ya da --ev
 *   tmp      <sürücü kökü>/tmp ya da --tmp-kok   (UnoPim compose klasörü ve şifre anahtarı burada)
 *   appdata  %APPDATA% ya da --appdata           (Claude Desktop ayarları)
 *   depo     ana depo (venthub-hvac); ana-kok.cjs ya da --ana-depo
 * Arşivdeki mantıksal yol 'etiket/göreli/yol' biçimindedir (ör. ev/.claude/settings.json).
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const GENEL_HARIC = [/(^|\/)node_modules(\/|$)/, /(^|\/)__pycache__(\/|$)/, /\.pyc$/]
const GIT_HARIC = /(^|\/)\.git(\/|$)/
const SQLITE_ANA = /\.(sqlite3?|db)$/i
const SQLITE_YAN = /\.(sqlite3?|db)-(wal|shm|journal)$/i

const o = (x) => ({ tur: 'dizin', zorunlu: false, haric: [], sqlite: false, gitDahil: false, ...x })

// Çalışma anı durumu: süreç numarası/port taşır, yeni makinede YANLIŞTIR (sunucular açılışta yeniden yazar).
const CALISMA_ANI = [/(^|\/)(kanban-server|server|\.mailbox-server)\.json$/, /\.log$/]

/**
 * Parçalar: ayar, hafiza, wrongstack, gorsel, arsiv, ingestor, db, sirlar (şifreli).
 * `zorunlu`: yoksa paket KIRMIZI (taşıma günü eksik paketle çıkılmaz). Diğerleri yoksa "YOK" yazılır.
 */
const ENVANTER = [
  // ── ayar ──────────────────────────────────────────────────────────────────
  o({ id: 'claude-json', parca: 'ayar', kok: 'ev', yol: '.claude.json', tur: 'dosya', zorunlu: true }),
  o({ id: 'settings', parca: 'ayar', kok: 'ev', yol: '.claude/settings.json', tur: 'dosya', zorunlu: true }),
  o({ id: 'settings-local', parca: 'ayar', kok: 'ev', yol: '.claude/settings.local.json', tur: 'dosya' }),
  o({ id: 'claude-md', parca: 'ayar', kok: 'ev', yol: '.claude/CLAUDE.md', tur: 'dosya' }),
  o({ id: 'hafiza-commit', parca: 'ayar', kok: 'ev', yol: '.claude/hafiza-commit.sh', tur: 'dosya' }),
  o({ id: 'agent-memory', parca: 'ayar', kok: 'ev', yol: '.claude/agent-memory' }),
  o({ id: 'scheduled-tasks', parca: 'ayar', kok: 'ev', yol: '.claude/scheduled-tasks' }),
  o({ id: 'zamanli', parca: 'ayar', kok: 'ev', yol: '.claude/zamanli' }),
  o({ id: 'hooks-kisisel', parca: 'ayar', kok: 'ev', yol: '.claude/hooks' }),
  o({ id: 'commands', parca: 'ayar', kok: 'ev', yol: '.claude/commands' }),
  o({ id: 'output-styles', parca: 'ayar', kok: 'ev', yol: '.claude/output-styles' }),
  // skills/gstack = garrytan/gstack'in git klonu + node_modules (1,2 GB): yeniden kurulur, taşınmaz.
  o({ id: 'skills', parca: 'ayar', kok: 'ev', yol: '.claude/skills', haric: [/^gstack(\/|$)/] }),
  // skills altındaki dört bağın hedefi (ölçüldü 1,6 MB); bağ kendisi atlanır, hedef taşınır.
  o({ id: 'agents', parca: 'ayar', kok: 'ev', yol: '.agents' }),
  o({ id: 'recep-sozu-defterleri', parca: 'ayar', kok: 'ev', yol: '.claude/recep-sozu-defteri*.jsonl', tur: 'glob' }),
  o({ id: 'recep-sozu-imlec', parca: 'ayar', kok: 'ev', yol: '.claude/recep-sozu-imlec' }),
  o({ id: 'desktop-config', parca: 'ayar', kok: 'appdata', yol: 'Claude/claude_desktop_config.json', tur: 'dosya' }),
  o({ id: 'desktop-config2', parca: 'ayar', kok: 'appdata', yol: 'Claude/config.json', tur: 'dosya' }),
  o({ id: 'side-session-notes', parca: 'ayar', kok: 'appdata', yol: 'Claude/side-session-notes' }),
  // ── hafıza (ayrıca çözülür: her ~/.claude/projects/*/memory; .git DAHİL — uzak: venthub-ops-hafiza) ──
  { id: 'proje-hafizalari', parca: 'hafiza', ozel: 'projeHafizalari', kok: 'ev', kategori: 'hafiza' },
  // ── yerel veri: .wrongstack (kanban + sage + posta). SQLite dosyaları tutarlı anlık görüntüyle girer ──
  o({
    id: 'wrongstack-depo',
    parca: 'wrongstack',
    kok: 'depo',
    yol: '.wrongstack',
    sqlite: true,
    zorunlu: true,
    haric: [...CALISMA_ANI, /(^|\/)logs(\/|$)/, /(^|\/)codebase-index(\/|$)/],
  }),
  o({
    id: 'wrongstack-posta',
    parca: 'wrongstack',
    kok: 'ev',
    yol: '.wrongstack',
    sqlite: true,
    haric: [...CALISMA_ANI, /^ipc-endpoint\.secret$/, /^logs(\/|$)/, /^diagnostics(\/|$)/, /(^|\/)codebase-index(\/|$)/],
  }),
  // ── arşivler ─────────────────────────────────────────────────────────────
  o({ id: 'gorsel-arsiv', parca: 'gorsel', kok: 'ev', yol: 'VentHub-Gorsel-Arsiv' }),
  o({ id: 'olcum-arsiv', parca: 'arsiv', kok: 'ev', yol: 'VentHub-Olcum-Arsiv' }),
  o({ id: 'blog-calisma', parca: 'arsiv', kok: 'ev', yol: 'blog-calisma' }),
  o({ id: 'mevzuat-calisma', parca: 'arsiv', kok: 'ev', yol: 'mevzuat-calisma' }),
  // ── ingestor: izsiz/ignore'lu veri ───────────────────────────────────────
  o({ id: 'ing-gorseller', parca: 'ingestor', kok: 'ev', yol: 'venthub-pdf-ingestor/kaynak-dizini/gorseller' }),
  o({ id: 'ing-egriler', parca: 'ingestor', kok: 'ev', yol: 'venthub-pdf-ingestor/kaynak-dizini/egriler.jsonl', tur: 'dosya' }),
  o({ id: 'ing-egri-profilleri', parca: 'ingestor', kok: 'ev', yol: 'venthub-pdf-ingestor/kaynak-dizini/egri-profilleri.json', tur: 'dosya' }),
  o({ id: 'ing-staging', parca: 'ingestor', kok: 'ev', yol: 'venthub-pdf-ingestor/staging' }),
  // ── corpus-callosum veritabanları (SQLite anlık görüntü) ─────────────────
  o({ id: 'cc-db', parca: 'db', kok: 'ev', yol: 'corpus-callosum/.cc/*.db', tur: 'glob', sqlite: true }),
  o({ id: 'orion-db', parca: 'db', kok: 'ev', yol: 'corpus-callosum/.orion/*.db', tur: 'glob', sqlite: true }),
  // ── SIRLAR: yalnız gpg ile şifreli parçaya girer ─────────────────────────
  o({ id: 'depo-env', parca: 'sirlar', kategori: 'sir', kok: 'depo', yol: '.env', tur: 'dosya' }),
  o({ id: 'depo-env-local', parca: 'sirlar', kategori: 'sir', kok: 'depo', yol: '.env.local', tur: 'dosya' }),
  o({ id: 'credentials', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: '.claude/.credentials.json', tur: 'dosya' }),
  o({ id: 'env-global', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: '.claude/.env.global', tur: 'dosya' }),
  o({ id: 'gsc-anahtar', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: '.claude/gsc-anahtar.json', tur: 'dosya' }),
  o({ id: 'gsc-oauth', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: '.claude/gsc-oauth-client.json', tur: 'dosya' }),
  o({ id: 'bing', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: '.claude/bing-webmaster-anahtar.txt', tur: 'dosya' }),
  o({ id: 'byteplus', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: '.claude/.byteplus_key', tur: 'dosya' }),
  // ~/.secrets = Windows DPAPI ile sarılı XML: yeni makinede AÇILMAYABİLİR (kitapta uyarı).
  o({ id: 'secrets-dpapi', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: '.secrets' }),
  o({ id: 'ssh', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: '.ssh' }),
  o({ id: 'mcp-auth', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: '.mcp-auth' }),
  o({ id: 'pim-anahtar', parca: 'sirlar', kategori: 'sir', kok: 'tmp', yol: 'pim-anahtar/yedek.key', tur: 'dosya' }),
  o({ id: 'pim-env', parca: 'sirlar', kategori: 'sir', kok: 'tmp', yol: 'pim-unopim/.env', tur: 'dosya' }),
  o({ id: 'pim-sirlar', parca: 'sirlar', kategori: 'sir', kok: 'tmp', yol: 'pim-unopim/.sirlar' }),
  o({ id: 'cc-env', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: 'corpus-callosum/.env', tur: 'dosya' }),
  o({ id: 'cc-env-keys', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: 'corpus-callosum/.cc/.env.keys', tur: 'dosya' }),
  o({ id: 'orion-env-keys', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: 'corpus-callosum/.orion/.env.keys', tur: 'dosya' }),
  o({ id: 'registry-env', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: 'orion-registry/.env', tur: 'dosya' }),
  o({ id: 'ingestor-env', parca: 'sirlar', kategori: 'sir', kok: 'ev', yol: 'venthub-pdf-ingestor/.env', tur: 'dosya' }),
]

const KATEGORI = { ayar: 'ayar', hafiza: 'hafiza', wrongstack: 'yerel-veri', gorsel: 'arsiv', arsiv: 'arsiv', ingestor: 'yerel-veri', db: 'yerel-veri', sirlar: 'sir' }

/** Uzakta olmayan işi taşıyan depolar. `kok`+`yol` yeni makinede klonlanacak yerdir. */
const GIT_DEPOLARI = [
  { ad: 'venthub-hvac', kok: 'depo', yol: '' },
  { ad: 'venthub-pdf-ingestor', kok: 'ev', yol: 'venthub-pdf-ingestor' },
  { ad: 'orion', kok: 'ev', yol: 'orion' },
  { ad: 'orion-registry', kok: 'ev', yol: 'orion-registry' },
  { ad: 'orion-cortex', kok: 'ev', yol: 'orion-cortex' },
  { ad: 'corpus-callosum', kok: 'ev', yol: 'corpus-callosum' },
  { ad: 'mods', kok: 'ev', yol: 'mods' },
]

/** Yeni makinede yol dönüşümü uygulanacak yapılandırma dosyaları (ev'e göre, / ile). */
const YOL_YENIDEN_YAZILACAK = [
  { desen: /^\.claude\.json$/, json: true },
  { desen: /^\.claude\/settings(\.local)?\.json$/, json: true },
  { desen: /^AppData\/Roaming\/Claude\/(claude_desktop_config|config)\.json$/, json: true },
  { desen: /^\.claude\/zamanli\/[^/]+\.(cmd|bat|ps1)$/, json: false },
  { desen: /^\.claude\/hafiza-commit\.sh$/, json: false },
  { desen: /^\.claude\/scheduled-tasks\/.+\.(md|json)$/, json: false },
]

function kokleriCoz(a = {}) {
  const evVerildi = Boolean(a.ev)
  const ev = path.resolve(a.ev || os.homedir())
  const tmp = path.resolve(a.tmp || path.join(path.parse(ev).root, 'tmp'))
  const appdata = path.resolve(a.appdata || (evVerildi ? path.join(ev, 'AppData', 'Roaming') : process.env.APPDATA || path.join(ev, 'AppData', 'Roaming')))
  let depo = a.anaDepo
  if (!depo) {
    if (evVerildi) depo = path.join(ev, 'venthub-hvac')
    else {
      try {
        depo = require('../hijyen/ana-kok.cjs').anaKok()
      } catch {
        depo = path.join(ev, 'venthub-hvac')
      }
    }
  }
  return { ev, tmp, appdata, depo: path.resolve(depo) }
}

function projeHafizalari(ev) {
  const kok = path.join(ev, '.claude', 'projects')
  let adlar = []
  try {
    adlar = fs.readdirSync(kok, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  } catch {
    return []
  }
  const sonuc = []
  for (const ad of adlar) {
    try {
      if (fs.statSync(path.join(kok, ad, 'memory')).isDirectory()) {
        sonuc.push(o({ id: `hafiza:${ad}`, parca: 'hafiza', kategori: 'hafiza', kok: 'ev', yol: `.claude/projects/${ad}/memory`, gitDahil: true }))
      }
    } catch {
      /* memory klasörü yok */
    }
  }
  return sonuc
}

/** ENVANTER'i kök bilgisiyle somut öğelere açar ('ozel' çözücüler genişler). */
function ogeleriAc(kokler) {
  const sonuc = []
  for (const e of ENVANTER) {
    if (e.ozel === 'projeHafizalari') sonuc.push(...projeHafizalari(kokler.ev))
    else sonuc.push({ kategori: KATEGORI[e.parca], ...e })
  }
  return sonuc.map((e) => ({ ...e, kategori: e.kategori || KATEGORI[e.parca] }))
}

const posix = (p) => p.split(path.sep).join('/')

/**
 * Bir öğeyi tarar. Bağlantılar (symlink/junction) AYNEN takip edilmez; `atlanan`a sebep+hedefle yazılır.
 * @returns {{dosyalar: {kaynak:string, mantiksal:string, bayt:number, mtimeMs:number, sqlite:boolean}[], atlanan: object[], var: boolean}}
 */
function ogeTara(oge, kokler) {
  const kokDizin = kokler[oge.kok]
  const etiket = oge.kok
  const sonuc = { dosyalar: [], atlanan: [], var: false }
  const haricMi = (goreli) => {
    if (!oge.gitDahil && GIT_HARIC.test(goreli)) return true
    if (GENEL_HARIC.some((r) => r.test(goreli))) return true
    if (oge.sqlite && SQLITE_YAN.test(goreli)) return true
    return oge.haric.some((r) => r.test(goreli))
  }
  const ekle = (kaynak, mantiksal) => {
    let st
    try {
      st = fs.statSync(kaynak)
    } catch (e) {
      sonuc.atlanan.push({ kaynak, sebep: `okunamadi:${e.code || e.message}` })
      return
    }
    sonuc.dosyalar.push({ kaynak, mantiksal, bayt: st.size, mtimeMs: st.mtimeMs, sqlite: oge.sqlite && SQLITE_ANA.test(kaynak) })
  }

  if (oge.tur === 'dosya') {
    const k = path.join(kokDizin, ...oge.yol.split('/'))
    try {
      const l = fs.lstatSync(k)
      if (l.isSymbolicLink()) sonuc.atlanan.push({ kaynak: k, sebep: 'baglanti' })
      else if (l.isFile()) {
        sonuc.var = true
        ekle(k, `${etiket}/${oge.yol}`)
      }
    } catch {
      /* yok */
    }
    return sonuc
  }

  if (oge.tur === 'glob') {
    const parcalar = oge.yol.split('/')
    const son = parcalar.pop()
    const ust = path.join(kokDizin, ...parcalar)
    const re = new RegExp(`^${son.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`)
    let adlar = []
    try {
      adlar = fs.readdirSync(ust, { withFileTypes: true })
    } catch {
      return sonuc
    }
    for (const d of adlar) {
      if (!re.test(d.name)) continue
      const k = path.join(ust, d.name)
      if (d.isSymbolicLink()) sonuc.atlanan.push({ kaynak: k, sebep: 'baglanti' })
      else if (d.isFile() && !haricMi(d.name)) {
        sonuc.var = true
        ekle(k, [etiket, ...parcalar, d.name].join('/'))
      }
    }
    return sonuc
  }

  const taban = path.join(kokDizin, ...oge.yol.split('/'))
  try {
    if (!fs.lstatSync(taban).isDirectory()) return sonuc
  } catch {
    return sonuc
  }
  sonuc.var = true
  const yigin = ['']
  while (yigin.length) {
    const goreli = yigin.pop()
    const dizin = goreli ? path.join(taban, ...goreli.split('/')) : taban
    let girdiler
    try {
      girdiler = fs.readdirSync(dizin, { withFileTypes: true })
    } catch (e) {
      sonuc.atlanan.push({ kaynak: dizin, sebep: `okunamadi:${e.code || e.message}` })
      continue
    }
    for (const g of girdiler) {
      const gGoreli = goreli ? `${goreli}/${g.name}` : g.name
      const kaynak = path.join(dizin, g.name)
      if (haricMi(gGoreli)) continue
      if (g.isSymbolicLink()) {
        let hedef = null
        try {
          hedef = fs.readlinkSync(kaynak)
        } catch {
          /* okunamadı */
        }
        sonuc.atlanan.push({ kaynak, sebep: 'baglanti', hedef })
      } else if (g.isDirectory()) yigin.push(gGoreli)
      else if (g.isFile()) ekle(kaynak, `${etiket}/${oge.yol}/${gGoreli}`)
      else sonuc.atlanan.push({ kaynak, sebep: 'ozel-dosya' })
    }
  }
  sonuc.dosyalar.sort((a, b) => (a.mantiksal < b.mantiksal ? -1 : a.mantiksal > b.mantiksal ? 1 : 0))
  return sonuc
}

module.exports = {
  ENVANTER,
  GIT_DEPOLARI,
  YOL_YENIDEN_YAZILACAK,
  KATEGORI,
  kokleriCoz,
  ogeleriAc,
  ogeTara,
  posix,
}
