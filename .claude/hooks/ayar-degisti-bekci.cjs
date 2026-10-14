#!/usr/bin/env node
'use strict'
/**
 * AYAR DEĞİŞTİ BEKÇİSİ — ARC-118 (REC-529 madde 1; ConfigChange olayı).
 *
 * ── NİÇİN VAR ──
 * `protect-config.cjs` yalnız Edit/Write aracını izler; ayar dosyası Bash ile (ya da başka pencereden) değişirse
 * haberimiz olmuyordu (12 Ekim 13:07 dersi). Claude Code `ConfigChange` olayı, dosya KİM tarafından değiştirirse
 * değiştirsin (oturum içinde) settings dosyası ya da skill dosyası değişince kanca çalıştırır.
 *
 * ── ⛔ BELGE SINIRI (code.claude.com/docs/en/hooks, 14 Ekim ölçüldü) ──
 * ConfigChange kancası kullanıcıya ya da Claude'a MESAJ GÖSTEREMEZ: systemMessage ve continue atılır, engellenen
 * değişiklik bile yalnız hata ayıklama günlüğüne bir satır yazar. Bu yüzden uyarı iki parçadır:
 *   1) ConfigChange olayında bu dosya KAYIT tutar (`ayar-degisti.jsonl`), sessiz, çıkış 0, ASLA engellemez
 *      (engel kararı OPS'a sorulur; policy_settings zaten engellenemez).
 *   2) Her mesajda defter-tazelik-satiri.cjs `satir()` çağırır: son 30 dakikada değişen ve BU oturuma henüz
 *      gösterilmemiş bir kayıt varsa tek satır basar, sonra susar.
 *
 * ── KAPSAM (dürüst) ──
 * ConfigChange yalnız: user/project/local/policy settings + `.claude/skills/` dosyalarını görür. `.mcp.json`,
 * `CLAUDE.md` ve kanca .cjs dosyalarının KENDİSİ görülmez (kancanın settings.json'daki KAYDI görülür).
 * Aynı değişiklik her açık pencerede ayrı olay üretir; kayıtlar (dosya, 10 sn dilimi) ile tekilleştirilir.
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const PENCERE_MS = 30 * 60 * 1000
const AZAMI_SATIR = 200
const TEKIL_MS = 10 * 1000

function kayitYolu() {
  if (process.env.VH_AYAR_DEGISTI_DOSYASI) return process.env.VH_AYAR_DEGISTI_DOSYASI
  return path.join(os.homedir(), '.claude', 'mod-durum', 'ayar-degisti.jsonl')
}

function okunduYolu() {
  return kayitYolu().replace(/\.jsonl$/, '') + '-okundu.json'
}

/** ConfigChange girdisinden bir kayıt satırı yazar. Dönen: yazılan kayıt ya da null (ilgisiz/geçersiz). */
function kaydet(girdi, simdi = Date.now()) {
  if (!girdi || girdi.hook_event_name !== 'ConfigChange') return null
  const kayit = {
    ts: simdi,
    sid: typeof girdi.session_id === 'string' ? girdi.session_id : null,
    source: typeof girdi.source === 'string' ? girdi.source : 'bilinmiyor',
    file: typeof girdi.file_path === 'string' ? girdi.file_path.replace(/\\/g, '/') : null,
  }
  const yol = kayitYolu()
  fs.mkdirSync(path.dirname(yol), { recursive: true })
  let satirlar = []
  try {
    satirlar = fs.readFileSync(yol, 'utf8').split('\n').filter(Boolean)
  } catch {
    /* ilk kayıt */
  }
  satirlar.push(JSON.stringify(kayit))
  if (satirlar.length > AZAMI_SATIR) satirlar = satirlar.slice(-AZAMI_SATIR)
  fs.writeFileSync(yol, satirlar.join('\n') + '\n', 'utf8')
  return kayit
}

function kayitlariOku() {
  let ham = ''
  try {
    ham = fs.readFileSync(kayitYolu(), 'utf8')
  } catch {
    return []
  }
  const cikti = []
  for (const s of ham.split('\n')) {
    if (!s) continue
    try {
      const k = JSON.parse(s)
      if (k && typeof k.ts === 'number') cikti.push(k)
    } catch {
      /* bozuk satır atlanır */
    }
  }
  return cikti
}

function saat(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * Bu oturuma gösterilecek satır ('' = sus). Gösterilen son kayıt zamanı oturum başına işaretlenir; böylece her
 * değişiklik oturuma BİR KEZ görünür. Yalnız `sid` geçerli bir oturum kimliğiyse işaret yazılır (testler/ham çağrı).
 */
function satir(sid, simdi = Date.now()) {
  const kayitlar = kayitlariOku().filter((k) => simdi - k.ts <= PENCERE_MS)
  if (kayitlar.length === 0) return ''
  let okundu = {}
  try {
    okundu = JSON.parse(fs.readFileSync(okunduYolu(), 'utf8')) || {}
  } catch {
    /* ilk gösterim */
  }
  const son = typeof sid === 'string' && sid ? Number(okundu[sid]) || 0 : 0
  const yeni = kayitlar.filter((k) => k.ts > son)
  if (yeni.length === 0) return ''
  // Aynı dosya + 10 sn dilimi = tek değişiklik (her pencere ayrı olay üretir).
  const tekil = new Map()
  for (const k of yeni) tekil.set(`${k.file || k.source}|${Math.floor(k.ts / TEKIL_MS)}`, k)
  const liste = [...tekil.values()].sort((a, b) => a.ts - b.ts)
  const son3 = liste.slice(-3)
  const parca = son3.map((k) => `${k.source}${k.file ? ' (' + path.posix.basename(k.file) + ')' : ''} ${saat(k.ts)}`).join(' · ')
  if (typeof sid === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sid)) {
    try {
      okundu[sid] = Math.max(...yeni.map((k) => k.ts))
      // Eski oturum işaretleri şişmesin: yalnız en yeni 50 oturum.
      const girdiler = Object.entries(okundu).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 50)
      fs.writeFileSync(okunduYolu(), JSON.stringify(Object.fromEntries(girdiler)), 'utf8')
    } catch {
      /* işaret yazılamadı: satır bir daha görünür, zararsız */
    }
  }
  return `⚠AYAR DEGISTI (oturum icinde, son 30 dk): ${parca}${liste.length > 3 ? ` · +${liste.length - 3} daha` : ''} — kim degistirdi bilinmez; git diff ile bak`
}

function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  kaydet(girdi)
}

if (require.main === module) {
  try {
    main()
  } catch {
    /* kanca asla engellemez */
  }
  process.exit(0)
}

module.exports = { kaydet, satir, kayitYolu, PENCERE_MS }
