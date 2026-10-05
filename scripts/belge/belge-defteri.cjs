#!/usr/bin/env node
'use strict'

/**
 * BELGELER DEFTERİ — "VentHub Belgeler" NotebookLM defterini depodaki elle yazılmış belgelerden üretir
 * ve tazeler (REC-473, H5/D8; cetvel: docs/standards/belge-yonetimi-standard.md).
 *
 * NİÇİN VAR: defteri 09-25'te elle kurdum; üç geçici betik hafıza klasöründe yaşıyordu ("oturum ölür, araç
 * ölür"). Defter belge değiştikçe bayatlıyor ve bayat defter yalan söyleyen defterdir. Bu betik üretimi
 * ve yüklemeyi kalıcı yapar; gün kapanışı (scripts/nlm/gun_kapanisi.py, ARAÇ) `yukle`yi tek komut olarak çağırır.
 *
 * KOMUTLAR (grup kuralları: belge-gruplari.json):
 *   uret  [--cikti <klasor>]   Belgeleri gruplar, grup başına tek .md üretir (varsayılan: geçici klasör).
 *   yukle [--kuru]             uret + defterdeki AYNI ADLI kaynağı değiştirir (önce yeni yüklenir, hazır olunca
 *                              eski silinir; yeni hazır olmadıysa eski KALIR). Mükerrer üretmez.
 *   olc                        Son eşitleme yaşı (durum dosyasından; ağa çıkmaz).
 *   tara  [--cikti <klasor>]   LLM tutarlılık taraması. ZAMANLANMAZ; çıktı "HAM, DOĞRULANMAMIŞ" damgalıdır
 *                              (ilk taramada 163 bulgunun %56'sı yanlış çıktı).
 *
 * ÇIKIŞ KODU SÖZLEŞMESİ (gun_kapanisi.py bunu okur):
 *   yukle: 0 = hepsi yüklendi, hazır, eskiler silindi, durum yazıldı · 1 = oturum/ağ ÖLÇÜLEMEDİ, HİÇBİR ŞEY
 *          yazılmadı · 2 = KISMİ (bazı gruplar yüklenemedi/hazır olmadı/silinemedi; durum dosyası yazılmaz) ·
 *          3 = --kuru (yalnız plan basıldı)
 *   olc:   0 = taze · 1 = bayat (> DEFTER_BAYAT_GUN) · 2 = ölçülemedi (durum dosyası yok/bozuk)
 *
 * ORTAM: NOTEBOOKLM_KOMUT (varsayılan `notebooklm`; testte sahte komut için JSON dizi da olabilir),
 *        VENTHUB_BELGE_DEFTERI_STATE (durum dosyası; varsayılan ~/.claude/belge-defteri-durum.json — depo DIŞI),
 *        NLM_ZAMAN (hazır olma bekleme üst sınırı, sn, varsayılan 900).
 *
 * BİLİNEN KUSUR (kasıtlı): dosya adı grup adından ASCII'ye indirilerek üretilir ('Çekirdek' → 'ekirdek');
 * defterdeki 15 kaynak bu adlarla duruyor. Adı düzeltmek tüm kaynakları yeniden yükletir ve eskiler yetim kalır.
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const AYAR = require('./belge-gruplari.json')

/** Gün kapanışı günlük tazeler; iki günü kaçıran defter bayat sayılır. */
const DEFTER_BAYAT_GUN = 2

function depoKoku() {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error('git deposu bulunamadi')
  return r.stdout.trim()
}

// ───────────────────────── GRUPLAMA (saf işlevler) ─────────────────────────

function slug(grup) {
  return grup.replace(/[^\x00-\x7F]/g, '').replace(/[^0-9a-zA-Z]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

function dosyaAdi(grup) {
  return AYAR.dosya_oneki + slug(grup) + '.md'
}

function turBul(yol) {
  for (const [k, t] of Object.entries(AYAR.klasor_tur)) if (yol.startsWith(k + '/')) return t
  return AYAR.kok_dosyalar.includes(yol) ? 'cekirdek' : 'diger'
}

/** Ad (uzantısız, küçük harf) ve yola göre grup; ilk eşleşen kazanır. */
function grupBul(yol, tur) {
  if (tur === 'cekirdek') return AYAR.cekirdek_grup
  if (AYAR.elle[yol]) return AYAR.elle[yol]
  for (const [onek, g] of Object.entries(AYAR.yol_oneki_grup)) if (yol.startsWith(onek)) return g
  const ad = path.posix.basename(yol).replace(/\.md$/i, '').toLowerCase()
  for (const [onek, g] of Object.entries(AYAR.ad_oneki_grup)) if (ad.startsWith(onek)) return g
  for (const [g, rx] of AYAR.kural) if (new RegExp(rx).test(ad)) return g
  return AYAR.atanmamis
}

/** 06/09 grupları kural/diğer diye ikiye; eski bitmiş planlar tarihçe grubuna. */
function bol(grup, tur, tarih) {
  let g = grup
  for (const [onek, [kural, diger]] of Object.entries(AYAR.bol)) {
    if (g.startsWith(onek)) g = tur === 'kural' ? kural : diger
  }
  if (tur === AYAR.tarihce.tur && tarih && tarih !== '?' && tarih < AYAR.tarihce.oncesi) g = AYAR.tarihce.grup
  return g
}

function belgeleriTopla(kok) {
  const r = spawnSync('git', ['ls-files', '-z'], { cwd: kok, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (r.status !== 0) throw new Error('git ls-files basarisiz')
  const izli = r.stdout.split('\0').filter(Boolean)
  const klasorler = Object.keys(AYAR.klasor_tur)
  return izli
    .filter((d) => d.endsWith('.md') && (AYAR.kok_dosyalar.includes(d) || klasorler.some((k) => d.startsWith(k + '/'))))
    .sort()
}

/** Tek git geçişi: dosya → son değişiklik günü. */
function tarihleriTopla(kok) {
  const r = spawnSync('git', ['log', '--format=@%ad', '--date=short', '--name-only', '--', '*.md'], {
    cwd: kok, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
  })
  const tarih = {}
  let gun = null
  for (const s of (r.stdout || '').split('\n')) {
    if (s.startsWith('@')) gun = s.slice(1)
    else if (s && !(s in tarih)) tarih[s] = gun
  }
  return tarih
}

function grupla(kok, oku = (y) => fs.readFileSync(path.join(kok, y), 'utf8')) {
  const tarih = tarihleriTopla(kok)
  const gruplar = new Map()
  const atanmayan = []
  for (const yol of belgeleriTopla(kok)) {
    const tur = turBul(yol)
    const t = tarih[yol] || '?'
    const grup = bol(grupBul(yol, tur), tur, t)
    if (grup === AYAR.atanmamis) atanmayan.push(yol)
    if (!gruplar.has(grup)) gruplar.set(grup, [])
    gruplar.get(grup).push({ yol, tur, tarih: t, metin: oku(yol) })
  }
  for (const ks of gruplar.values()) ks.sort((a, b) => (b.tarih > a.tarih ? 1 : b.tarih < a.tarih ? -1 : a.yol.localeCompare(b.yol)))
  return { gruplar, atanmayan }
}

function grupMetni(grup, belgeler) {
  const ad = (t) => AYAR.tur_ad[t] || t
  const parca = [
    `# VentHub Belgeler — ${grup}\n`,
    'Bu dosya depodaki elle yazılmış belgelerin birleşimidir; betikle üretilir, elle düzenlenmez.',
    "Her belge kendi başlığıyla başlar: YOL, TÜR, SON GÜNCELLEME. İki belge çelişirse SON GÜNCELLEME",
    'tarihi yeni olan ve TÜRÜ KURAL olan önce gelir; TARİHÇE dosyasındakiler geçerli kural değildir.\n',
    '## İçindekiler\n',
    ...belgeler.map((k) => `- ${k.tarih} · ${ad(k.tur)} · ${k.yol}`),
  ]
  for (const k of belgeler) {
    const metin = k.metin.replace(/^(#{1,5}) /gm, (_, h) => '#' + h + ' ') // başlık bir kademe iner
    parca.push(`\n\n---\n\n## BELGE: ${k.yol}\n\n**TÜR:** ${ad(k.tur)} · **SON GÜNCELLEME:** ${k.tarih} · **GRUP:** ${grup}\n\n${metin}`)
  }
  return parca.join('\n')
}

function uret(kok, cikti) {
  fs.mkdirSync(cikti, { recursive: true })
  const { gruplar, atanmayan } = grupla(kok)
  const sonuc = []
  for (const [grup, belgeler] of [...gruplar.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const metin = grupMetni(grup, belgeler)
    const dosya = dosyaAdi(grup)
    fs.writeFileSync(path.join(cikti, dosya), metin, 'utf8')
    sonuc.push({ grup, dosya, belge: belgeler.length, kelime: metin.split(/\s+/).length })
  }
  return { sonuc, atanmayan }
}

// ───────────────────────── NOTEBOOKLM KABUĞU ─────────────────────────

function nlmKomut() {
  const ham = process.env.NOTEBOOKLM_KOMUT
  if (!ham) return ['notebooklm']
  if (ham.trim().startsWith('[')) return JSON.parse(ham)
  return [ham]
}

function nlm(args, { zaman = 600000 } = {}) {
  const [komut, ...on] = nlmKomut()
  const r = spawnSync(komut, [...on, ...args], { encoding: 'utf8', timeout: zaman, maxBuffer: 64 * 1024 * 1024 })
  return { kod: r.status === null ? -1 : r.status, cikti: (r.stdout || '') + (r.stderr || ''), stdout: r.stdout || '' }
}

/** JSON sözleşmesi: başarıda { sources: [...] }, hatada { error:true, code, message } (canlıdan ölçüldü 2026-09-30). */
function kaynakListesi(defter, deneme = 3, bekle = () => spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},20000)'])) {
  let son = 'bilinmeyen'
  for (let i = 0; i < deneme; i++) {
    const r = nlm(['source', 'list', '-n', defter, '--json'], { zaman: 180000 })
    try {
      const j = JSON.parse(r.stdout)
      if (j && j.error) son = `${j.code}: ${j.message}`
      else if (Array.isArray(j.sources)) return { ok: true, kaynaklar: j.sources }
      else son = 'beklenmeyen biçim'
    } catch (e) {
      son = 'JSON okunamadi: ' + r.cikti.slice(-160).replace(/\s+/g, ' ')
    }
    if (i < deneme - 1) bekle()
  }
  return { ok: false, hata: son }
}

// ───────────────────────── DURUM DOSYASI ─────────────────────────

function durumYolu(ortam = process.env, home = os.homedir()) {
  return ortam.VENTHUB_BELGE_DEFTERI_STATE || path.join(home, '.claude', 'belge-defteri-durum.json')
}

function durumYaz(veri, yol = durumYolu()) {
  fs.mkdirSync(path.dirname(yol), { recursive: true })
  fs.writeFileSync(yol, JSON.stringify(veri, null, 2), 'utf8')
}

/** { gun, kaynak, esitleme } ya da null (dosya yok/bozuk: sayı UYDURULMAZ). */
function durumOku(simdi = Date.now(), yol = durumYolu()) {
  try {
    const j = JSON.parse(fs.readFileSync(yol, 'utf8'))
    const t = Date.parse(j.esitleme)
    if (!Number.isFinite(t)) return null
    return { gun: Math.floor((simdi - t) / 86400000), kaynak: j.kaynak, esitleme: j.esitleme }
  } catch (e) {
    return null
  }
}

// ───────────────────────── YÜKLE ─────────────────────────

function yukle(secenek = {}) {
  const cikti = fs.mkdtempSync(path.join(os.tmpdir(), 'venthub-belgeler-'))
  try {
    return yukleIc(cikti, secenek)
  } finally {
    fs.rmSync(cikti, { recursive: true, force: true })
  }
}

function yukleIc(cikti, { kuru = false, kok = depoKoku(), simdi = Date.now(), uyu = (sn) => spawnSync(process.execPath, ['-e', `setTimeout(()=>{},${sn * 1000})`]) }) {
  const log = (s) => console.log(s)
  const { sonuc, atanmayan } = uret(kok, cikti)
  log(`uretildi: ${sonuc.length} grup, ${sonuc.reduce((a, s) => a + s.belge, 0)} belge`)
  if (atanmayan.length) log(`UYARI: ${atanmayan.length} belge hicbir kurala uymadi (belge-gruplari.json'a kural ekle): ${atanmayan.slice(0, 5).join(', ')}`)

  const defter = AYAR.defter
  const onceki = kaynakListesi(defter, 3, () => uyu(20))
  if (!onceki.ok) {
    log(`KIRMIZI: defter okunamadi (${onceki.hata}); HICBIR SEY YAZILMADI. Once: notebooklm login, sonra notebooklm list ile kanitla.`)
    return 1
  }
  const eskiId = new Set(onceki.kaynaklar.map((k) => k.id))
  const hedef = new Set(sonuc.map((s) => s.dosya))
  const yetim = onceki.kaynaklar.filter((k) => String(k.title).startsWith(AYAR.dosya_oneki) && !hedef.has(k.title))
  if (yetim.length) log(`yetim (silinmez): ${yetim.map((k) => k.title).join(', ')}`)
  if (kuru) {
    for (const s of sonuc) log(`  [kuru] ${s.dosya}: ${s.belge} belge, ${s.kelime} kelime; defterde ${onceki.kaynaklar.filter((k) => k.title === s.dosya).length} eski kaynak`)
    return 3
  }

  const basarisiz = []
  for (const s of sonuc) {
    let r
    for (let i = 0; i < 2; i++) {
      r = nlm(['source', 'add', path.join(cikti, s.dosya), '-n', defter, '--type', 'file'])
      if (r.kod === 0) break
      uyu(10)
    }
    if (r.kod !== 0) { basarisiz.push(`${s.dosya}: yuklenemedi (${r.cikti.slice(-120).replace(/\s+/g, ' ')})`); continue }
    log(`  yuklendi: ${s.dosya}`)
  }

  // Hazır olana dek bekle: yeni id'li, aynı adlı, status=ready.
  const sinir = Date.now() + (Number(process.env.NLM_ZAMAN) || 900) * 1000
  let liste = onceki
  const yeniHazir = (l, ad) => l.kaynaklar.filter((k) => k.title === ad && !eskiId.has(k.id) && k.status === 'ready')
  for (;;) {
    const l = kaynakListesi(defter, 2, () => uyu(20))
    if (l.ok) liste = l
    const bekleyen = sonuc.filter((s) => !basarisiz.some((b) => b.startsWith(s.dosya)) && yeniHazir(liste, s.dosya).length === 0)
    if (!bekleyen.length || Date.now() > sinir) {
      for (const s of bekleyen) basarisiz.push(`${s.dosya}: hazir olmadi (eski kaynak KORUNDU)`)
      break
    }
    uyu(30)
  }

  // Budama: yalnız yeni hazır olan gruplarda, aynı adlı ESKİ kaynaklar silinir.
  for (const s of sonuc) {
    if (basarisiz.some((b) => b.startsWith(s.dosya))) continue
    for (const k of liste.kaynaklar.filter((x) => x.title === s.dosya && eskiId.has(x.id))) {
      const r = nlm(['source', 'delete', k.id, '-n', defter, '-y'])
      if (r.kod !== 0) basarisiz.push(`${s.dosya}: eski kaynak silinemedi (${k.id})`)
    }
  }

  if (basarisiz.length) {
    log('KISMI: ' + basarisiz.join(' | '))
    return 2
  }
  durumYaz({ esitleme: new Date(simdi).toISOString(), defter, grup: sonuc.length, belge: sonuc.reduce((a, s) => a + s.belge, 0), kaynak: sonuc.length })
  log(`TAMAM: ${sonuc.length} kaynak tazelendi, durum yazildi (${durumYolu()})`)
  return 0
}

// ───────────────────────── TARA (LLM, zamanlanmaz) ─────────────────────────

function tara({ cikti = process.cwd(), kok = depoKoku() } = {}) {
  const { gruplar } = grupla(kok)
  const T = AYAR.tara_sorulari
  const sorular = [
    ...[...gruplar.keys()].sort().map((g) => [`Grup: ${g}`, T.grup.replace('{grup}', g) + ' ' + T.bicim]),
    ...T.capraz.map(([b, s]) => [b, s + ' ' + T.bicim]),
  ]
  const satirlar = ['# VentHub Belgeler — tutarlılık taraması: HAM, DOĞRULANMAMIŞ (her satır dosyada kontrol edilmeden yazılmaz)\n']
  let ardisikBos = 0
  for (const [baslik, soru] of sorular) {
    const r = nlm(['ask', '-n', AYAR.defter, soru])
    const cevap = r.kod === 0 && r.stdout.includes('Answer:') ? r.stdout.split('Answer:').slice(1).join('Answer:').trim() : ''
    ardisikBos = cevap ? 0 : ardisikBos + 1
    satirlar.push(`\n## ${baslik}\n\n${cevap || 'BOS/HATA: ' + r.cikti.slice(-160)}\n`)
    if (ardisikBos >= 2) { satirlar.push('\nDURDU: art arda iki bos cevap (sohbet sinir penceresi olabilir, ~5 saat bekle).'); break }
  }
  const dosya = path.join(cikti, `belge-tarama-${new Date().toISOString().slice(0, 10)}.md`)
  fs.writeFileSync(dosya, satirlar.join('\n'), 'utf8')
  console.log('yazildi: ' + dosya)
  return ardisikBos >= 2 ? 1 : 0
}

// ───────────────────────── CLI ─────────────────────────

function bayrak(argv, ad) {
  const i = argv.indexOf(ad)
  return i >= 0 ? argv[i + 1] : undefined
}

function main(argv) {
  const komut = argv[0]
  if (komut === 'uret') {
    const cikti = bayrak(argv, '--cikti') || fs.mkdtempSync(path.join(os.tmpdir(), 'venthub-belgeler-'))
    const { sonuc, atanmayan } = uret(depoKoku(), cikti)
    for (const s of sonuc) console.log(`${s.dosya.padEnd(64)} ${String(s.belge).padStart(4)} belge ${String(s.kelime).padStart(8)} kelime`)
    if (atanmayan.length) console.log(`UYARI: ${atanmayan.length} belge hicbir kurala uymadi: ${atanmayan.join(', ')}`)
    console.log('cikti: ' + cikti)
    return 0
  }
  if (komut === 'yukle') return yukle({ kuru: argv.includes('--kuru') })
  if (komut === 'olc') {
    const d = durumOku()
    if (!d) { console.log('BELGELER DEFTERI: OLCULEMEDI (durum dosyasi yok/bozuk; sayi uydurulmaz)'); return 2 }
    const bayat = d.gun > DEFTER_BAYAT_GUN
    console.log(`BELGELER DEFTERI: son esitleme ${d.esitleme.slice(0, 10)} (${d.gun} gun) · ${d.kaynak} kaynak${bayat ? ' · BAYAT' : ''}`)
    return bayat ? 1 : 0
  }
  if (komut === 'tara') return tara({ cikti: bayrak(argv, '--cikti') || process.cwd() })
  console.error('kullanim: node scripts/belge/belge-defteri.cjs uret|yukle [--kuru]|olc|tara')
  return 64
}

if (require.main === module) process.exit(main(process.argv.slice(2)))

module.exports = {
  DEFTER_BAYAT_GUN, slug, dosyaAdi, turBul, grupBul, bol, grupla, grupMetni, uret,
  kaynakListesi, durumYolu, durumYaz, durumOku, yukle,
}
