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
 * Ölçüm YALNIZ varsayılan dalın (VARSAYILAN_DAL = master) koşularına bakar: başka dalın elle tetiklenmiş yeşil
 * koşusu master'ın kırmızısını örtemez.
 * EŞİKLİ: her şey yolundayken susar (hiçbir şey söylemeyen satır gürültüdür). Şu hâllerde konuşur:
 *   · son zamanlı koşu KIRMIZI (failure / timed_out / startup_failure) ya da İPTAL,
 *   · son BAŞARILI/bitmiş koşu 18 saatten eski: zamanlı iş akışı SESSİZCE ÖLMÜŞ olabilir (GitHub 60 gün
 *     hareketsiz depoda zamanlanmış işi kapatır; cron geciktirilir). "Susan alarm" en tehlikeli hâldir,
 *   · son BAŞARILI/bitmiş koşunun bitiş damgası OKUNAMIYORSA (ya da tolerans aşılarak GELECEKTE kalıyorsa) yaş
 *     hesaplanamaz ve bu da konuşur: yaşı bilinmeyen koşu "yeni" sayılmaz, yoksa ölü bir iş akışı damga bozukluğunun
 *     arkasında sessizce yeşil görünürdü,
 *   · iş akışı dosyası bu depoda 24 saatten eski ama hiç koşu yok,
 *   · son başarılı ölçüm 36 saatten eski YA DA yaşı hesaplanamıyor (ölçemedim ≠ yeşil; ölçüm hata verirken
 *     `olculdu` damgası bozuksa "bayat değil" sanılıp susulmaz).
 * İş akışı dosyası yerel depoda YOKSA (henüz birleşmemiş) satır susar.
 *
 * ⛔404 BİLİNEN DURUMU SİLMEZ: GitHub depo/iş akışı için geçici 404 verebilir (depo private yapılırsa, iş akışı yeniden
 * adlandırılırsa, kısa süreli yönlendirme hatası). Önbellekte bir koşu sonucu zaten BİLİNİYORSA 404 "iş akışı yok"
 * kanıtı sayılmaz, ÖLÇEMEDİM sayılır: bilinen (belki KIRMIZI) durum korunur ve 36 saat sonra OLCULEMEDI diye
 * görünür. Önceden hiç koşu bilinmiyorsa 404 olduğu gibi "varsayılan dalda YOK" kaydıdır.
 *
 * ⛔GELECEK TARİHLİ DAMGA: yerel saat GitHub'dan geride kalırsa (uykudan dönen, senkronsuz makine) GitHub'ın `bitis` damgası
 * "şimdi"den İLERİDE görünür ve yaş negatif çıkar. ≤ 5 dk sapma normaldir (yaş 0 sayılır); daha fazlası damgayı ÇÖZÜLEMEDİ
 * sayar (yaşı bilinmeyen damga ile aynı yol): kırmızı satır "(-1 saat once)" YAZMAZ (yaş eklenmez), başarılı koşu "yaşı
 * OLCULEMEDI" der, ölçüm hata verirken `olculdu` gelecekteyse "yasi bilinmiyor" eki yazılır. `gerekirseTazele` de gelecekteki
 * damgayı taze SAYMAZ: saat geri sarılınca ölçüm, damganın gününe kadar hiç yenilenmeden donmasın.
 *
 * ⛔ENJEKSİYON SINIRI: GitHub yanıtı DIŞ VERİDİR ve satır her mesajın bağlamına yazılır. Sonuç adı sabit sözlükten
 * seçilir (serbest metin girmez), koşu numarası yalnız rakamdan, saat sayıdan yeniden kurulur.
 */
const fs = require('fs')
const path = require('path')

const ONBELLEK_ADI = '.dunya-durumu-onbellek.json'
const IS_AKISI = 'dunya-durumu.yml'
const DEPO_SLUG = 'peckop/venthub-hvac-esite'
// ALT-38a B6: GitHub zamanlanmış işi YALNIZ varsayılan dalda koşturur; ölçüm de yalnız o dalın koşularına bakar.
// Dal süzgeci yoksa "son tamamlanan koşu" herhangi bir dalın elle tetiklenmiş (workflow_dispatch) yeşil koşusu olabilir
// ve master'ın kırmızısını örter: koruma düşer, satır susar, kimse görmez.
const VARSAYILAN_DAL = 'master'
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

/** GitHub'dan VARSAYILAN dalın son tamamlanan koşusunu ölçer. Hata olursa { hata } döner, FIRLATMAZ. */
async function olc(secenek = {}) {
  const fetchFn = secenek.fetchFn || globalThis.fetch
  if (typeof fetchFn !== 'function') return { hata: 'fetch yok' }
  try {
    const adres = `https://api.github.com/repos/${DEPO_SLUG}/actions/workflows/${IS_AKISI}/runs?per_page=5&status=completed&branch=${VARSAYILAN_DAL}`
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

// Yerel saat GitHub'dan geride kalırsa damga "gelecekte" görünür. ≤ GELECEK_TOLERANS_DK sapma normaldir ve yaş 0 sayılır;
// fazlası damgayı ÇÖZÜLEMEDİ sayar (NaN: bozuk damgayla aynı "yaşı bilinmiyor" yolları). Eskiden negatif yaş kırmızı satıra
// "(-1 saat once)" yazdırır, yeşil koşuyu ve OLCULEMEDI ekini ise `-3 >= 18` gibi false karşılaştırmalarla SUSTURURDU.
const GELECEK_TOLERANS_DK = 5

/** Damganın yaşı (ms). Çözülemeyen ya da tolerans aşılarak gelecekteki damga NaN (yaşı bilinmiyor); 0 ile -tolerans arası 0. */
function damgaYasiMs(simdi, iso) {
  const fark = simdi - Date.parse(iso)
  if (!(fark >= -GELECEK_TOLERANS_DK * 60000)) return NaN // NaN ve tolerans aşan gelecek: karşılaştırma false verir
  return Math.max(fark, 0)
}

const saatFarki = (simdi, iso) => Math.floor(damgaYasiMs(simdi, iso) / 3600000)

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
  // Yaş çözülemezse (`olculdu` bozuk metin ya da tolerans aşılarak GELECEKTE: bkz. damgaYasiMs) NaN olur ve `NaN >= 36` false
  // verir: eskiden bu "bayat değil" sayılıp OLCULEMEDI ekini SUSTURUYORDU. Yaşı bilinmeyen ölçüm 36 saati aşmadığı da
  // bilinmeyen ölçümdür (ölçemedim ≠ yeşil).
  const yasBilinmiyor = !Number.isFinite(olcumYasi)
  const bayat = olcumYasi >= BAYAT_OLCUM_SAAT // yaş bilinmiyorsa false; o hâl aşağıda ayrıca konuşturulur
  // Ölçüm HATA verse bile bilinen son durum değerlendirilir: çevrimdışı kalmak kırmızıyı GİZLEMEZ.
  const olcumEki =
    v.hata && (bayat || yasBilinmiyor)
      ? ' · OLCULEMEDI (' + hataTemiz(v.hata) + '), son basarili olcum ' + (yasBilinmiyor ? 'yasi bilinmiyor' : olcumYasi + ' saat once')
      : ''
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
    } else if (!Number.isFinite(kosuYasi)) {
      // Bitiş damgası boş/okunamayan BAŞARILI (ya da bitmiş) koşu: yaş hesaplanamaz. Eskiden `NaN >= 18` false verip
      // satırı SUSTURUYORDU; oysa ölü bir iş akışının son kaydı tam böyle bozuk damgayla durabilir. Susmak yerine
      // "yaşı ölçülemedi" denir. Metne dış veri girmez: sabit cümle + yalnız rakamdan kurulan koşu adresi.
      ana = '⚠DUNYA: zamanli kosu yasi OLCULEMEDI (bitis damgasi okunamadi)' + adres
    } else if (kosuYasi >= YASLI_KOSU_SAAT) {
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
  let o = await olc(secenek)
  // 404 + önbellekte BİLİNEN koşu sonucu: "iş akışı yok" kanıtı değil, ÖLÇEMEDİM. `{ yok: true }` yazılsaydı bilinen
  // (belki KIRMIZI) kayıt silinir ve satır susardı; hata yoluna çevrilince eski kayıt, eski `olculdu` damgası korunur.
  // Önceden hiç koşu bilinmiyorsa (`eski.sonuc` yok) 404 aynen "yok" kaydıdır.
  if (o.yok && eski.sonuc) o = { hata: 'GitHub 404' }
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
  // Gelecekteki (tolerans aşan) damga taze SAYILMAZ: `simdi - damga` negatif olup "taze" çıkarsa saat geri sarıldığında
  // ölçüm damganın gününe kadar hiç yenilenmez ve satır donmuş veriyle konuşur.
  const yas = s.durum === 'tamam' ? damgaYasiMs(simdi, s.veri.denendi || s.veri.olculdu) : NaN
  if (Number.isFinite(yas) && yas < TAZELE_DK * 60000) return false
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
  VARSAYILAN_DAL,
  GELECEK_TOLERANS_DK,
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
