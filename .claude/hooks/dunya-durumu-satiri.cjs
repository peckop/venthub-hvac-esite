'use strict'
/**
 * DÜNYA DURUMU SATIRI (ALT-38) — defter-tazelik-satiri.cjs'in EŞİKLİ bloğu.
 *
 * ── NİÇİN VAR ──
 *
 * Dünya durumu testleri (scripts/ci/dunya-durumu-testleri.json) `ci` işinin PR koşusundan ÇIKTI: PR'ı bloklamazlar.
 * Çıkan test silinmez; master push'ta ve zamanlı `dunya-durumu.yml` iş akışında (6 saatte bir) koşar. Zamanlı koşu
 * kırmızı biterse kimse bakmazsa koruma sessizce düşmüş olur (REC-342 dersi: kapının var olması kararın verildiği
 * yerde GÖRÜNDÜĞÜ anlamına gelmez). Bu satır o kırmızıyı OPS'un her mesajında görünür kılar. PR'ı BLOKLAMAZ.
 *
 * ── NASIL ──
 *
 * Son tamamlanan zamanlı koşu GitHub'dan (kimliksiz, kamuya açık depo) arka planda ölçülüp önbelleğe yazılır
 * (pano dizininde `.dunya-durumu-onbellek.json`; en çok 30 dakikada bir). Satır YALNIZ önbellekten okunur.
 * EŞİKLİ: her şey yolundayken susar (hiçbir şey söylemeyen satır gürültüdür). Şu hâllerde konuşur:
 *   · son zamanlı koşu KIRMIZI (failure / timed_out / startup_failure) ya da İPTAL,
 *   · son BAŞARILI/bitmiş koşu 18 saatten eski: zamanlı iş akışı SESSİZCE ÖLMÜŞ olabilir (GitHub 60 gün
 *     hareketsiz depoda zamanlanmış işi kapatır; cron geciktirilir). "Susan alarm" en tehlikeli hâldir,
 *   · iş akışı dosyası bu depoda 24 saatten eski ama hiç koşu yok,
 *   · son başarılı ölçüm 36 saatten eski (ölçemedim ≠ yeşil).
 * İş akışı dosyası yerel depoda YOKSA (henüz birleşmemiş) satır susar.
 *
 * ⛔ENJEKSİYON SINIRI: GitHub yanıtı DIŞ VERİDİR ve satır her mesajın bağlamına yazılır. Sonuç adı sabit sözlükten
 * seçilir (serbest metin girmez), koşu numarası yalnız rakamdan, saat sayıdan yeniden kurulur.
 */
const fs = require('fs')
const path = require('path')

const ONBELLEK_ADI = '.dunya-durumu-onbellek.json'
const IS_AKISI = 'dunya-durumu.yml'
const DEPO_SLUG = 'peckop/venthub-hvac-esite'
const TAZELE_DK = 30
const KILIT_DK = 10
const YASLI_KOSU_SAAT = 18
const ILK_KOSU_BEKLEME_SAAT = 24
const BAYAT_OLCUM_SAAT = 36
const KIRMIZI = new Set(['failure', 'timed_out', 'startup_failure'])
const SOZLUK = new Set(['success', 'failure', 'timed_out', 'startup_failure', 'cancelled', 'skipped', 'neutral', 'action_required', 'stale'])

function onbellekYolu(pano) {
  return path.join(pano, ONBELLEK_ADI)
}

/** Sonuç adı yalnız sabit sözlükten; sözlük dışı her şey 'bilinmeyen'. */
function sonucTemiz(s) {
  return SOZLUK.has(String(s)) ? String(s) : 'bilinmeyen'
}
function idTemiz(s) {
  return /^\d{1,15}$/.test(String(s)) ? String(s) : ''
}
function hataTemiz(s) {
  const m = /^(ag|zaman asimi|GitHub \d{3}|JSON bozuk|fetch yok)/.exec(String(s == null ? '' : s))
  return m ? m[1] : 'sebep tanimsiz'
}

/** GitHub'dan son tamamlanan koşuyu ölçer. Hata olursa { hata } döner, FIRLATMAZ. */
async function olc(secenek = {}) {
  const fetchFn = secenek.fetchFn || globalThis.fetch
  if (typeof fetchFn !== 'function') return { hata: 'fetch yok' }
  try {
    const adres = `https://api.github.com/repos/${DEPO_SLUG}/actions/workflows/${IS_AKISI}/runs?per_page=5&status=completed`
    const yanit = await fetchFn(adres, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'venthub-dunya-durumu-satiri' },
      signal: AbortSignal.timeout(secenek.zamanAsimiMs || 8000),
    })
    if (yanit.status === 404) return { yok: true } // iş akışı henüz varsayılan dalda yok
    if (!yanit.ok) return { hata: 'GitHub ' + yanit.status }
    const v = await yanit.json()
    const kosular = Array.isArray(v && v.workflow_runs) ? v.workflow_runs : []
    if (kosular.length === 0) return { kosuYok: true }
    const k = kosular[0]
    return { id: idTemiz(k.id), sonuc: sonucTemiz(k.conclusion), bitis: String(k.updated_at || k.created_at || '') }
  } catch (e) {
    const ad = e && e.name === 'TimeoutError' ? 'zaman asimi' : 'ag'
    return { hata: ad }
  }
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

const saatFarki = (simdi, iso) => Math.floor((simdi - Date.parse(iso)) / 3600000)

/**
 * Satırı üretir; konuşacak bir şey yoksa null (eşikli). `depo`: iş akışı dosyasının yerel varlığı ve yaşı için.
 * `dosyaMtime` test için enjekte edilir (ms; dosya yoksa null).
 */
function satir(sonuc, depo, simdi = Date.now(), dosyaMtime = () => {
  try {
    return fs.statSync(path.join(depo, '.github', 'workflows', IS_AKISI)).mtimeMs
  } catch {
    return null
  }
}) {
  const dosya = dosyaMtime()
  if (dosya === null) return null // iş akışı bu depoda yok (birleşmemiş ya da kaldırılmış): susar
  if (sonuc.durum !== 'tamam') return null // önbellek henüz yok/bozuk: ölçüm arka planda başlatıldı, ilk turda susar
  const v = sonuc.veri
  const olcumYasi = saatFarki(simdi, v.olculdu)
  const bayat = Number.isFinite(olcumYasi) && olcumYasi >= BAYAT_OLCUM_SAAT
  // Ölçüm HATA verse bile bilinen son durum değerlendirilir: çevrimdışı kalmak kırmızıyı GİZLEMEZ.
  const olcumEki = v.hata && bayat ? ' · OLCULEMEDI (' + hataTemiz(v.hata) + '), son basarili olcum ' + olcumYasi + ' saat once' : ''
  let ana = null
  if (v.yok || v.kosuYok) {
    const yas = Math.floor((simdi - dosya) / 3600000)
    if (yas >= ILK_KOSU_BEKLEME_SAAT) {
      ana = '⚠DUNYA: dunya-durumu.yml ' + (v.yok ? 'varsayilan dalda YOK' : 'hic KOSMADI') + ' (dosya ' + yas + ' saattir depoda): dunya durumu testleri PR disinda hicbir yerde kosmuyor olabilir'
    }
  } else if (v.sonuc) {
    const sonuc_ = sonucTemiz(v.sonuc)
    const kosuYasi = saatFarki(simdi, v.bitis)
    const adres = idTemiz(v.id) ? ' · https://github.com/' + DEPO_SLUG + '/actions/runs/' + idTemiz(v.id) : ''
    if (KIRMIZI.has(sonuc_) || sonuc_ === 'cancelled') {
      const ad = sonuc_ === 'cancelled' ? 'IPTAL' : 'KIRMIZI'
      const sayi = Number.isFinite(kosuYasi) ? ' (' + kosuYasi + ' saat once)' : ''
      ana = '⚠DUNYA: son zamanli kosu ' + ad + sayi + " — PR'i bloklamaz; kirmizi bir dunya durumu testi var" + adres
    } else if (Number.isFinite(kosuYasi) && kosuYasi >= YASLI_KOSU_SAAT) {
      ana = '⚠DUNYA: zamanli kosu ' + kosuYasi + ' saattir YOK (6 saatte bir bekleniyor): zamanli is akisi sessizce olmus olabilir' + adres
    }
  }
  if (ana) return ana + olcumEki
  return olcumEki ? '⚠DUNYA:' + olcumEki.slice(2) : null
}

async function yaz(pano, secenek = {}) {
  const simdi = (secenek.simdi || Date.now)()
  const onceki = oku(onbellekYolu(pano))
  const eski = onceki.durum === 'tamam' ? onceki.veri : {}
  const o = await olc(secenek)
  let yeni
  if (o.hata) {
    // Ölçemedim: eski bilinen değeri KORU (ve hata yanında yaz); `olculdu` ESKİ damgayı korur ki bayatlık görünsün.
    yeni = { ...eski, hata: o.hata, olculdu: eski.olculdu || new Date(simdi).toISOString(), denendi: new Date(simdi).toISOString() }
  } else {
    yeni = { ...o, olculdu: new Date(simdi).toISOString() }
  }
  fs.mkdirSync(pano, { recursive: true })
  const yol = onbellekYolu(pano)
  const gecici = yol + '.' + process.pid + '.tmp'
  fs.writeFileSync(gecici, JSON.stringify(yeni))
  fs.renameSync(gecici, yol)
  return yeni
}

/** Önbellek yok / 30 dakikadan eski ise ölçümü arka planda başlatır. Başlatıldıysa true. */
function gerekirseTazele(pano, simdi = Date.now()) {
  const s = oku(onbellekYolu(pano))
  const damga = s.durum === 'tamam' ? Date.parse(s.veri.denendi || s.veri.olculdu) : NaN
  if (Number.isFinite(damga) && simdi - damga < TAZELE_DK * 60000) return false
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

module.exports = {
  ONBELLEK_ADI,
  IS_AKISI,
  DEPO_SLUG,
  YASLI_KOSU_SAAT,
  ILK_KOSU_BEKLEME_SAAT,
  BAYAT_OLCUM_SAAT,
  gerekirseTazele,
  olc,
  oku,
  onbellekYolu,
  satir,
  yaz,
}

if (require.main === module && process.argv.includes('--yaz')) {
  const pano = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
  yaz(pano, { simdi: () => Date.now() }).then(
    () => process.exit(0),
    () => process.exit(0),
  )
}
