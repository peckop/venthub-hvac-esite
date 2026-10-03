#!/usr/bin/env node
'use strict'

/**
 * KART-PLAN KAPISI (HRT-14, OPS-13 karar 241/243/244; cetvel: docs/standards/kart-plani-standard.md).
 *
 * NİÇİN VAR: plan karta, konuyu hiç bilmeyen birinin uygulayabileceği açıklıkta yazılmalı (karar 241); "yazıldı"
 * demek ölçü değildir, bu betik planın iskeletinin eksiksiz olduğunu ölçer (karar 244: kontrolü yazılamayan kural girmez).
 * Ölçtüğü şey İSKELETtir (yedi etiket + ÖNCEKİ ÇALIŞMA satırı, asgari uzunluk, numaralı adım, etki alanı); planın DOĞRU olduğunu ölçmez.
 *
 * KULLANIM (yerelde; CI'da KOŞMAZ: Kanban verisi git dışıdır, depo public):
 *   node scripts/belge/kart-plan-kapisi.cjs --kart HRT-14
 *   node scripts/belge/kart-plan-kapisi.cjs --dosya <aciklama.txt>
 *   node scripts/belge/kart-plan-kapisi.cjs --pr-govde-dosyasi <govde.md>     (gövdedeki "Kanban: <NO>" satırlarını okur)
 *
 * KANBAN VERİSİ (2026-10-02 ölçüldü): ana deponun `.wrongstack/kanbans/_kanban.sqlite` dosyası (ya da VENTHUB_KANBAN_DB),
 * tablo `kanban_boards(id, payload, revision, updated_at)`; `payload` bir pano JSON'u, kartlar `payload.tasks[]`
 * ({id, title, description, ...}). Dosya YALNIZ OKUNUR açılır; betik hiçbir şey yazmaz.
 *
 * ÇIKIŞ KODU: 0 geçti ya da plan-gerekmez · 1 eksik var (her eksik ayrı satırda) · 2 veri okunamadı ya da kart
 * bulunamadı/belirsiz (sessizlik "geçti" sayılmaz).
 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const REPO = path.resolve(__dirname, '..', '..')

/** Yedi zorunlu etiket ve asgari uzunluk (boşluksuz karakter). Adımlar için ayrıca en az 2 numaralı adım aranır. */
const ETIKETLER = [
  { ad: 'Amaç', min: 20 },
  { ad: 'Adımlar', min: 40 },
  { ad: 'Dosyalar', min: 10 },
  { ad: 'Bitti ölçütü', min: 20 },
  { ad: 'Ölçülmeyenler', min: 3 },
  { ad: 'Sor-noktaları', min: 3 },
  { ad: 'Etki alanı', min: 1 },
]
const RECEP_OZETI = 'Recep özeti'
/**
 * ÖNCEKİ ÇALIŞMA (HRT-26, OPS-30): işe başlamadan önce "bu iş daha önce yapıldı mı" aramasının yazılı kanıtı. Cetvel §Önceki çalışma;
 * aranan beş yer wrongstack-kanban skill §B.1 ve ARC-30 ile AYNI (YETENEK ile 10-03 eşitlendi). Ölçülen şey satırın İSKELETİdir
 * (beş yer adı + arama ifadesi + sonuç); aramanın gerçekten yapıldığını değil, yazıldığını ölçer.
 */
const ONCEKI_CALISMA = 'ÖNCEKİ ÇALIŞMA'
/** Aranan beş yer: [gösterim adı, ASCII katlanmış metinde aranan kalıp]. "docs/plans + docs/audits" tek yer sayılır ama iki yol da adı geçmeli. */
const ARANAN_YERLER = [
  ['Kanban search_tasks', /search_tasks/],
  ['git log', /git log/],
  ['docs/plans', /docs\/plans/],
  ['docs/audits', /docs\/audits/],
  ['sage', /(^|[^a-z0-9])sage([^a-z0-9]|$)/],
  ['Linear', /linear/],
]
/** Yürürlük: bu tarihten (UTC) ÖNCE açılan kartlarda eksik satır yalnız UYARI verir (OPS 10-03: yalnız YENİ kartlar). createdAt'i olmayan girdi (--dosya) yeni sayılır. */
const ONCEKI_CALISMA_YURURLUK = '2026-10-04T00:00:00.000Z'
const MIN_ADIM = 2
const ETKI_DEGERLERI = ['yok', 'müşteriye-görünen', 'veritabanı', 'site-yapısı']
const MIN_ISTISNA_SEBEBI = 8
/** "PLAN: gerekmez" sebebi bu köklerden birini içeriyorsa istisna kullanılamaz (karar 243); ASCII katlamalı, sözcük başı eşleşmesi. */
const ISTISNA_YASAK_KOKLER = ['veritabani', 'sema', 'migration', 'musteri', 'vitrin', 'site yapisi', 'rota', 'url', 'menu', 'fiyat', 'odeme']

/** Türkçe harfleri ASCII'ye katlar (İ/I/ı → i, ç → c ...), küçük harfe çevirir, boşlukları teke indirir. */
function asciiKatla(metin) {
  return String(metin)
    .replace(/İ/g, 'i')
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c])
    .replace(/\s+/g, ' ')
}

/** Sebepte yasak kök geçiyorsa o kökü döndürür (sözcük başı: "protokol" içindeki "rota" sayılmaz, "rotası" sayılır). */
function yasakKok(sebep) {
  const k = asciiKatla(sebep)
  return ISTISNA_YASAK_KOKLER.find((kok) => new RegExp(`(^|[^a-z0-9])${kok}`).test(k)) || null
}

/** Kod çitleri ve HTML yorumlarındaki satırlar sayılmaz (şablon örneği kapıyı geçirmesin; scripts/board/pr-kayit-kapisi.cjs ile aynı mantık). */
function govdeyiTemizle(metin) {
  return String(metin || '')
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
}

function bosluksuz(s) {
  return String(s || '').replace(/\s+/g, '').length
}

function kacis(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Satır başındaki "<Etiket>:" kalıbı (büyük/küçük harf serbest; Markdown süsü `sus` ile önceden atılmış satırda aranır). */
function etiketKalibi(ad) {
  return new RegExp(`^${kacis(ad)}[ \\t]*:`, 'i')
}

/** Markdown süsünü tolere eder: `**`/`__` çiftleri silinir, baştaki `#`, `>`, `*`, `_`, `-` ve boşluklar atılır (`## PLAN`, `**Amaç:** x`, `- Amaç: x`). */
function sus(satir) {
  return satir.replace(/\*\*|__/g, '').replace(/^[ \t#>*_-]*/, '')
}

/**
 * Açıklamayı değerlendirir.
 * @param {string} aciklama
 * @param {{onceki?: 'zorunlu'|'uyari'}} [secenek] ÖNCEKİ ÇALIŞMA satırı eksikse: 'zorunlu' (varsayılan, yeni kart) eksiklere yazar;
 *   'uyari' (yürürlükten önce açılmış kart) `uyarilar` alanına yazar, geçti değişmez. `uyarilar` yalnız doluysa sonuçta bulunur.
 * @returns {{gecti: boolean, tur: 'plan'|'plan-yok'|'plan-gerekmez', eksikler: string[], uyarilar?: string[]}}
 */
function degerlendir(aciklama, secenek = {}) {
  const temiz = govdeyiTemizle(aciklama)
  const ham = temiz.split('\n')
  const susluSatirlar = ham.map(sus)

  // PLAN başlığı da varsa "PLAN: gerekmez" satırı yok sayılır (plan değerlendirilir).
  const baslikIdx = susluSatirlar.findIndex((s) => /^PLAN[ \t]*:?[ \t]*$/.test(s))
  if (baslikIdx < 0) {
    const istisna = susluSatirlar.map((s) => s.match(/^PLAN[ \t]*:[ \t]*gerekmez[ \t]*[—–-]+[ \t]*(.*)$/i)).find(Boolean)
    if (istisna) {
      const sebep = istisna[1].trim()
      const eksikIstisna = []
      if (bosluksuz(sebep) < MIN_ISTISNA_SEBEBI) eksikIstisna.push(`"PLAN: gerekmez" sebebi çok kısa (${bosluksuz(sebep)}/${MIN_ISTISNA_SEBEBI} karakter)`)
      if (yasakKok(sebep)) eksikIstisna.push('istisna kullanılamaz: sebep müşteriye görünen/veritabanı/site yapısı etkisi anıyor (karar 243: Recep özeti gerekir)')
      return { gecti: eksikIstisna.length === 0, tur: 'plan-gerekmez', eksikler: eksikIstisna }
    }
    return {
      gecti: false,
      tur: 'plan-yok',
      eksikler: ['açıklamada satır başında "PLAN" başlığı yok (ya da "PLAN: gerekmez — <sebep>" satırı)'],
    }
  }

  // Başlıktan sonraki satırlar etiket bölümlerine ayrılır; bir bölüm sonraki etikete (Recep özeti dahil) kadar sürer.
  // Bölümde her satırın hem süssüz hali (değer/uzunluk için) hem ham hali (numaralı adım sayımı için) tutulur.
  const kalipler = [...ETIKETLER.map((e) => e.ad), RECEP_OZETI].map((ad) => ({ ad, kalip: etiketKalibi(ad) }))
  // JS /i bayrağı Türkçe İ/ı çiftini katlamaz ("Önceki çalışma:" eşleşmezdi); bu etiket için büyük/küçük ve noktalı/noktasız yazım açıkça sayılır.
  kalipler.push({ ad: ONCEKI_CALISMA, kalip: /^[Öö][Nn][Cc][Ee][Kk][iİıI][ \t]+[Çç][Aa][Ll][iİıI][Şş][Mm][Aa][ \t]*:/ })
  const bolumler = new Map()
  let akis = null
  for (let i = baslikIdx + 1; i < ham.length; i++) {
    const eslesen = kalipler.find((k) => k.kalip.test(susluSatirlar[i]))
    if (eslesen) {
      akis = bolumler.has(eslesen.ad) ? null : eslesen.ad // ikinci tekrar yok sayılır, ilk bölüm geçerli
      if (akis) bolumler.set(akis, [{ sus: susluSatirlar[i].replace(eslesen.kalip, ''), ham: '' }])
    } else if (akis) {
      bolumler.get(akis).push({ sus: susluSatirlar[i], ham: ham[i] })
    }
  }
  const degerOku = (ad) => bolumler.get(ad).map((s) => s.sus).join('\n')

  const eksikler = []
  for (const { ad, min } of ETIKETLER) {
    if (!bolumler.has(ad)) {
      eksikler.push(`${ad}: etiketi yok`)
      continue
    }
    if (ad === 'Etki alanı') continue // değer aşağıda ayrıca denetlenir
    const n = bosluksuz(degerOku(ad))
    if (n < min) eksikler.push(`${ad}: çok kısa (${n}/${min} karakter)`)
    if (ad === 'Adımlar') {
      const adim = bolumler.get(ad).filter((s) => /^[ \t]*\d+\.[ \t]+\S/.test(s.ham)).length
      if (adim < MIN_ADIM) eksikler.push(`Adımlar: en az ${MIN_ADIM} numaralı adım gerekir ("1." "2." ile başlayan satır; ${adim} bulundu)`)
    }
  }

  if (bolumler.has('Etki alanı')) {
    // Değer YALNIZ etiketin kendi satırıdır (sonraki satırlar katılmaz). Noktalı ("yok.") ve virgüllü ("veritabanı, site-yapısı") yazım kabul;
    // karşılaştırma Türkçe küçük harfle (VERİTABANI, İ/ı doğru çözülür). "yok" başka değerle birleşmez.
    const deger = bolumler.get('Etki alanı')[0].sus.replace(/\s+/g, ' ').trim()
    const parcalar = deger
      .replace(/\.$/, '')
      .split(',')
      .map((p) => p.trim().replace(/\.$/, '').toLocaleLowerCase('tr'))
    const gecerli = parcalar.every((p) => ETKI_DEGERLERI.includes(p)) && (parcalar.length === 1 || !parcalar.includes('yok'))
    if (!gecerli) {
      eksikler.push(`Etki alanı: değer "${deger}" geçersiz; yalnız ${ETKI_DEGERLERI.join(' | ')} (çoklu etki virgülle, "yok" tek başına)`)
    } else if (!(parcalar.length === 1 && parcalar[0] === 'yok')) {
      if (!bolumler.has(RECEP_OZETI) || bosluksuz(degerOku(RECEP_OZETI)) === 0) {
        eksikler.push(`Recep özeti: Etki alanı "${deger}" iken dolu "Recep özeti:" satırı gerekir (karar 243)`)
      } else if (!/\d/.test(degerOku(RECEP_OZETI))) {
        eksikler.push('Recep özeti: karar numarası ya da tarih (en az bir rakam) gerekir')
      }
    }
  }

  const oncekiSorunlar = oncekiCalismaSorunlari(bolumler.has(ONCEKI_CALISMA) ? degerOku(ONCEKI_CALISMA) : null)
  const uyarilar = []
  if (secenek.onceki === 'uyari') uyarilar.push(...oncekiSorunlar)
  else eksikler.push(...oncekiSorunlar)

  return { gecti: eksikler.length === 0, tur: 'plan', eksikler, ...(uyarilar.length > 0 ? { uyarilar } : {}) }
}

/**
 * ÖNCEKİ ÇALIŞMA satırının sorunları ([] = tamam). `deger` null ise etiket hiç yok.
 * Kural: beş aranan yerin HEPSİ adıyla geçer, "ifade:" ile arama ifadesi yazılıdır (en az 3 karakter) ve sonuç ya "yok"tur ya da
 * en az bir bulgu (kart numarası, commit özeti ya da dosya yolu) yazılıdır. İfadesiz ya da yersiz "yok" geçersizdir.
 */
function oncekiCalismaSorunlari(deger) {
  if (deger === null) return [`${ONCEKI_CALISMA}: etiketi yok (aranan beş yer + arama ifadesi + sonuç yazılır; cetvel §Önceki çalışma)`]
  const katli = asciiKatla(deger)
  const sorunlar = []
  if (bosluksuz(deger) < 20) sorunlar.push(`${ONCEKI_CALISMA}: çok kısa (${bosluksuz(deger)}/20 karakter)`)
  const eksikYerler = ARANAN_YERLER.filter(([, kalip]) => !kalip.test(katli)).map(([ad]) => ad)
  if (eksikYerler.length > 0) sorunlar.push(`${ONCEKI_CALISMA}: aranan yer(ler) yazılmamış: ${eksikYerler.join(', ')} (beşi de aranmadan "yok" geçmez)`)
  // ASCII-katlı metinde aranır: JS /i bayrağı "İFADE:" (noktalı büyük İ) yazımını "ifade" ile eşleştirmez.
  const ifade = katli.match(/ifade(?:si)?[ \t]*:[ \t]*(\S.*)/)
  if (!ifade || bosluksuz(ifade[1]) < 3) sorunlar.push(`${ONCEKI_CALISMA}: arama ifadesi yok ("ifade: <aranan sözcükler>" yazılır; ifadesiz sonuç geçersiz)`)
  const bulgu = /\b[A-Z]{2,5}-\d+\b|\b(?=[0-9a-f]*\d)[0-9a-f]{7,40}\b|\b(docs|scripts|src|supabase)\/[\w./-]+/.test(deger.replace(/docs\/(plans|audits)\b(?![\w./-]*\.)/g, ''))
  const yok = /(^|[^\p{L}])yok([^\p{L}]|$)/iu.test(deger)
  if (!bulgu && !yok) sorunlar.push(`${ONCEKI_CALISMA}: sonuç yok (bulunan kart/commit/dosya ya da "yok" yazılır)`)
  return sorunlar
}

/** PR gövdesindeki `Kanban: HRT-14` / `Kanban: ARC-3, HRT-12` satırlarından numaralar (kod çiti/yorum içindekiler sayılmaz). */
function prGovdesindenNumaralar(govde) {
  const temiz = govdeyiTemizle(govde)
  const numaralar = new Set()
  const satirKalibi = /^[ \t>*_-]*kanban[ \t]*:[ \t]*(.*)$/gim
  let e
  while ((e = satirKalibi.exec(temiz)) !== null) {
    for (const n of e[1].match(/\b[A-Z]{2,5}-\d+\b/g) || []) numaralar.add(n)
  }
  return [...numaralar]
}

/** --db > VENTHUB_KANBAN_DB > ana deponun .wrongstack/kanbans/_kanban.sqlite (worktree'den de ana depo; scripts/nlm/kanban_disa_aktar.py pano_dosyasi() mantığı). */
function panoDosyasi(ortam = process.env) {
  if (ortam.VENTHUB_KANBAN_DB) return ortam.VENTHUB_KANBAN_DB
  let kok = REPO
  const r = spawnSync('git', ['-C', REPO, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8', timeout: 10000 })
  if (r.status === 0 && r.stdout.trim()) kok = path.dirname(r.stdout.trim())
  return path.join(kok, '.wrongstack', 'kanbans', '_kanban.sqlite')
}

/**
 * `node:sqlite`'ı yükler. Deneysel-uyarı (SQLite) zararsız ama CLI çıktısını kirletiyor (stderr): yalnız yükleme süresince ve
 * yalnız bu uyarı süzülür; `process.emitWarning` hemen geri konur, başka uyarılar ve süreç dinleyicileri etkilenmez.
 */
function sqliteYukle() {
  const orijinal = process.emitWarning
  process.emitWarning = function (uyari, ...argumanlar) {
    if (/SQLite/.test(String(uyari)) && argumanlar[0] === 'ExperimentalWarning') return undefined
    return orijinal.call(process, uyari, ...argumanlar)
  }
  try {
    return require('node:sqlite')
  } finally {
    process.emitWarning = orijinal
  }
}

/**
 * Kartı numarasıyla bulur. Aşama 1: başlığın BAŞI (`HRT-14 · …`); bulunamazsa aşama 2: başlığın ilk 60 karakterinde
 * `\bNO\b` ("URUN REC-411: …"). Her aşamada tek eşleşme gerekir; birden fazlası "belirsiz" (istisna).
 * Okunamazsa, bulunamazsa ya da belirsizse istisna fırlatır (mesaj aşamayı söyler).
 */
function kartBul(no, yol) {
  if (!fs.existsSync(yol)) throw new Error(`Kanban veri dosyası yok: ${yol}`)
  const { DatabaseSync } = sqliteYukle()
  const db = new DatabaseSync(yol, { readOnly: true })
  let satirlar
  try {
    satirlar = db.prepare('SELECT payload FROM kanban_boards').all()
  } finally {
    db.close()
  }
  const kartlar = []
  for (const { payload } of satirlar) {
    const pano = JSON.parse(payload)
    for (const kart of pano.tasks || []) kartlar.push({ pano: pano.title, baslik: String(kart.title || ''), aciklama: kart.description || '', etiketler: Array.isArray(kart.labels) ? kart.labels : [], olusturuldu: typeof kart.createdAt === 'string' ? kart.createdAt : undefined })
  }
  const asamalar = [
    { ad: 'aşama 1: başlığın başı', kalip: new RegExp(`^${kacis(no)}(?![A-Za-z0-9-])`), kart: (k) => k.baslik },
    { ad: 'aşama 2: başlığın ilk 60 karakteri', kalip: new RegExp(`\\b${kacis(no)}\\b`), kart: (k) => k.baslik.slice(0, 60) },
  ]
  for (const asama of asamalar) {
    const bulunan = kartlar.filter((k) => asama.kalip.test(asama.kart(k)))
    if (bulunan.length === 1) return bulunan[0]
    if (bulunan.length > 1) throw new Error(`kart numarası belirsiz: ${no} ${bulunan.length} kartta geçiyor (${asama.ad}; ${bulunan.map((b) => b.pano).join('; ')})`)
  }
  throw new Error(`kart bulunamadı: ${no} (başlığın başında ya da ilk 60 karakterinde aranmıştı)`)
}

/** Kartın açıklaması (bulunamazsa/belirsizse/okunamazsa istisna; ayrıntı için `kartBul`). */
function kartiOku(no, yol) {
  return kartBul(no, yol).aciklama
}

/** Kartın Kanban `labels` alanındaki sınıf etiketleri (küçük harf); karar 244 adım 2: kart açılırken tek sınıf yazılır. */
const SINIF_ETIKETLERI = ['bu-ay', 'ilk-satistan-once', 'rafta']

function sinifUyarisi(etiketler) {
  const sinif = (etiketler || []).map((e) => String(e).toLocaleLowerCase('tr')).filter((e) => SINIF_ETIKETLERI.includes(e))
  const tekil = [...new Set(sinif)]
  if (tekil.length === 1 && sinif.length === 1) return null
  if (tekil.length === 0) return `UYARI: kartta sınıf etiketi yok (${SINIF_ETIKETLERI.join('/')}); tek biri yazılmalı`
  return `UYARI: kartta birden fazla sınıf etiketi var (${tekil.join(', ')}; ${SINIF_ETIKETLERI.join('/')}); tek biri yazılmalı`
}

/** Kart yürürlük tarihinden önce açıldıysa 'uyari', yeni kart ya da tarihsiz girdi (--dosya) ise 'zorunlu'. Karşılaştırma ISO dizgesiyle (UTC). */
function oncekiKipi(olusturuldu) {
  return typeof olusturuldu === 'string' && olusturuldu < ONCEKI_CALISMA_YURURLUK ? 'uyari' : 'zorunlu'
}

function argumanlar(argv) {
  const s = { kart: [], dosya: [], prGovde: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--kart') s.kart.push(argv[++i])
    else if (a === '--dosya') s.dosya.push(argv[++i])
    else if (a === '--pr-govde-dosyasi') s.prGovde.push(argv[++i])
    else throw new Error(`bilinmeyen argüman: ${a}`)
  }
  return s
}

function main(argv) {
  let girdiler
  try {
    girdiler = argumanlar(argv)
  } catch (e) {
    console.error(`HATA: ${e.message}`)
    return 2
  }
  const { kart, dosya, prGovde } = girdiler
  if (kart.some((k) => !k) || dosya.some((d) => !d) || prGovde.some((d) => !d) || kart.length + dosya.length + prGovde.length === 0) {
    console.error('Kullanım: kart-plan-kapisi.cjs --kart <NO> | --dosya <yol> | --pr-govde-dosyasi <yol>')
    return 2
  }

  const isler = [] // {ad, aciklama, etiketler?} (etiketler yalnız --kart ile okunan kartta)
  let kod = 0
  const kartNolari = [...kart]
  try {
    for (const d of dosya) isler.push({ ad: d, aciklama: fs.readFileSync(d, 'utf8') })
    for (const d of prGovde) {
      const govde = fs.readFileSync(d, 'utf8')
      const numaralar = prGovdesindenNumaralar(govde)
      // Yalnız uyarı (çıkış kodu değişmez): `Fixes REC-nn` karar 187 ile geçiş döneminde kasıtlı olarak meşru olabilir.
      // "Kanban: REC-411" satırı geçerli bir kart numarasıdır (taşınan Linear kaydı); yalnız diğer satırlardaki REC-nn uyarır.
      const linear = [
        ...new Set(
          govdeyiTemizle(govde)
            .split('\n')
            .filter((satir) => !/^[ \t>*_-]*kanban[ \t]*:/i.test(satir))
            .flatMap((satir) => satir.match(/\bREC-\d+\b/g) || []),
        ),
      ]
      if (linear.length > 0) {
        console.error(`UYARI: PR gövdesinde Linear numarası ${linear.join(', ')} var; kapanmaması gerekiyorsa sil, yalnız Kanban: <no> yaz`)
      }
      if (numaralar.length === 0) {
        console.log(`EKSİK ${d}: PR gövdesinde "Kanban: <NO>" satırı yok, kart okunamadı`)
        kod = Math.max(kod, 1)
      }
      kartNolari.push(...numaralar)
    }
    if (kartNolari.length > 0) {
      const yol = panoDosyasi()
      for (const no of [...new Set(kartNolari)]) {
        const k = kartBul(no, yol)
        isler.push({ ad: no, aciklama: k.aciklama, etiketler: kart.includes(no) ? k.etiketler : undefined, olusturuldu: k.olusturuldu })
      }
    }
  } catch (e) {
    console.error(`HATA: ${e.message}`)
    return 2
  }

  for (const { ad, aciklama, etiketler, olusturuldu } of isler) {
    // Yalnız uyarı (çıkış kodu değişmez): yeni açılan kart sınıfsız doğar, kapı kırmızı vermesin.
    if (etiketler !== undefined) {
      const uyari = sinifUyarisi(etiketler)
      if (uyari) console.error(`${uyari} (${ad})`)
    }
    const s = degerlendir(aciklama, { onceki: oncekiKipi(olusturuldu) })
    for (const u of s.uyarilar || []) console.error(`UYARI: ${u} (${ad}; yürürlükten önce açılmış kart, yalnız uyarı)`)
    if (s.gecti) {
      console.log(`GEÇTİ ${ad}: ${s.tur}`)
    } else {
      console.log(`EKSİK ${ad}: ${s.tur}`)
      for (const e of s.eksikler) console.log(`  - ${e}`)
      kod = Math.max(kod, 1)
    }
  }
  return kod
}

module.exports = { degerlendir, oncekiKipi, ONCEKI_CALISMA_YURURLUK, govdeyiTemizle, prGovdesindenNumaralar, panoDosyasi, kartiOku, kartBul, sinifUyarisi, ETIKETLER, ETKI_DEGERLERI }

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2))
}
