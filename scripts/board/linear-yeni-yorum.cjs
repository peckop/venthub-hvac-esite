#!/usr/bin/env node
'use strict'
/**
 * LINEAR YENİ-YORUM SAYACI (REC-329) — kanca için tek amaçlı, süreçsiz.
 *
 * NİÇİN VAR (ölçülmüş olaylar): Design şeritleri kararlarını Linear PROJE yorumlarına
 * yazıyor ve o yüzey PASİF — kimse bakmazsa bekler. 2026-09-09'da iki Design mesajı
 * 1,5 saat geç görüldü; 2026-09-13 18:23Z'deki DESIGN-KATALOG teslim yorumları
 * 2026-09-14 07:4xZ'ye kadar (13+ saat) cevapsız kaldı. Emekli edilen gözcü üçlüsü
 * (REC-328) Linear'a hiç bakmıyordu; bu boşluk yeni değil, hiç kapatılmamıştı.
 *
 * ⭐MEKANİZMA SEÇİMİ, cetvel gereği (fleet-mechanism-standard v2.0):
 * PASİF kanal mekanizma ister, İTİCİ kanal istemez. Linear yorumu pasif bir kutudur,
 * o yüzden bir mekanizma hak ediyor — ama bu mekanizma GÖZCÜ DEĞİL: süreç kurmaz,
 * cron kurmaz, Monitor kurmaz. Zaten koşan bir kancanın içinde TEK sorgu, TEK satır.
 * "Linear yorum sayacı = kanca, gözcü değil."
 *
 * ⛔ANAHTAR HİÇBİR YERE BASILMAZ (depo PUBLIC). Varlığı yalnız uzunlukla ölçülür.
 *
 * FAIL-OPEN ve SESSİZ: anahtar yok → satır yok · ağ yok → satır yok · 3 sn aşıldı →
 * satır yok · Linear hata döndürdü → satır yok. Hiçbir durumda hata basmaz, çünkü bu
 * satır bir KAPI değil, bir HATIRLATMADIR; gürültüsü faydasından büyük olmamalı.
 */

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

/** Sayılacak projeler: dört Design + ALTYAPI'nın kendi projesi (OPS oraya emir yazıyor). */
const PROJELER = [
  { id: 'd160826f-9a6b-40c7-b9b5-2cc2e523daa3', kisa: 'MENU' },
  { id: '2301323a-ffa0-4f26-9b71-4f79648b3b4b', kisa: 'KATALOG' },
  { id: 'bf2506a2-6e9e-47e4-b271-d38a22374c7e', kisa: 'MARKA' },
  { id: 'af5831c7-92be-4cd6-95da-7a87b05427e9', kisa: 'BELGE' },
  { id: '9c2ecb27-6e6c-48df-b4bb-85d188e0dfb6', kisa: 'ALTYAPI' },
]

const ZAMAN_ASIMI_MS = 3000

/**
 * ⭐DAMGA DOSYASININ YERİ — ölçümle seçildi, tahminle değil.
 *
 * `git rev-parse --git-common-dir` worktree'ler arasında PAYLAŞILAN `.git` dizinini
 * verir (ana kopya ve bütün worktree'ler aynı yolu görür), ve o dizinin içi git
 * tarafından İZLENMEZ — yani `.gitignore`'a satır eklemeye gerek yok.
 *
 * ⚠NİÇİN `docs/proje-takip/` DEĞİL: orası OPS şeridinin claim alanı; ALTYAPI orayı
 * OKUR, YAZMAZ. İş kaydı o yolu öneriyordu ama sahiplik sınırı öncelikli.
 * ⚠NİÇİN depo içinde izlenen bir dosya değil: damga her okumada değişir, yani
 * izlenen bir dosya olsa her turda kirli ağaç üretirdi.
 */
function damgaYolu() {
  try {
    const ortak = execFileSync('git', ['rev-parse', '--git-common-dir'], {
      encoding: 'utf8',
      timeout: 2000,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (ortak) return path.join(ortak, 'venthub-linear-son-okuma.json')
  } catch {
    /* git yok ya da depo değil: aşağıdaki yedeğe düş */
  }
  return path.join(os.tmpdir(), 'venthub-linear-son-okuma.json')
}

/** Son okuma damgasını okur. Dosya yoksa: 24 saat öncesi (ilk kurulumda tsunami olmasın). */
function sonOkuma() {
  try {
    const ham = JSON.parse(fs.readFileSync(damgaYolu(), 'utf8'))
    if (ham && typeof ham.damga === 'string') return ham.damga
  } catch {
    /* yok ya da bozuk: yedeğe düş */
  }
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
}

/**
 * ⭐ŞERİT İMZASINI GÖVDENİN SON SATIRINDAN ÇIKARIR — ve niçin SON satır, ölçüldü.
 *
 * 2026-09-14 ölçümü: DESIGN-KATALOG projesindeki 18 yorumun HEPSİNİN `author.name`
 * alanı "recep varlık". Tek Linear hesabı var; Design, OPS ve ALTYAPI aynı API
 * anahtarıyla yazıyor. Yani iş kaydındaki "yazarı OPS olmayan" süzgeci
 * UYGULANAMAZ — ölçüm bunu gösterdi, tahmin değil.
 *
 * Uygulanabilir ayırt edici: gövdenin sonundaki İMZA. Ölçüm: 10 yorum
 * "— DESIGN-KATALOG (Opus) …", 8 yorum "— OPS …" ile bitiyor; bu bizim yazılı
 * imza kuralımız (proje açıklamalarında da yazılı).
 *
 * ⚠TUZAK, ÖLÇÜLDÜ: metin ORTASINDA da tire geçiyor ("— OPS hükmü: …", "— KATALOG bu
 * turda …"). Bu yüzden imza YALNIZ gövdenin SON imza-benzeri satırından alınır;
 * herhangi bir geçiş sayılmaz. Anchor olmadan sayaç kendi kayıtlarımızı yanlış
 * sınıflandırırdı.
 */
function imzaSerit(govde) {
  if (typeof govde !== 'string' || !govde.trim()) return null
  const satirlar = govde
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  for (let i = satirlar.length - 1; i >= 0; i--) {
    const m = /^[—–-]{1,2}\s*([A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9-]{1,20})\b/.exec(satirlar[i])
    if (m) return m[1]
  }
  return null
}

/** OPS'un kendi yazdığı yorum sayılmaz — hatırlatma OPS İÇİN üretiliyor. */
function opsMu(serit) {
  return serit === 'OPS'
}

/**
 * Sayımı tek satıra çevirir. Hiç yeni yorum yoksa `null` döner (satır BASILMAZ).
 * Biçim: `LINEAR: 3 yeni yorum (KATALOG 2 · MENU 1), en eski 18:23Z`
 */
function ozetle(kalemler) {
  if (!Array.isArray(kalemler) || kalemler.length === 0) return null
  const sayac = new Map()
  let enEski = null
  for (const k of kalemler) {
    const ad = k.proje || '?'
    sayac.set(ad, (sayac.get(ad) || 0) + 1)
    if (!enEski || k.createdAt < enEski) enEski = k.createdAt
  }
  const dagilim = [...sayac.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'))
    .map(([ad, n]) => `${ad} ${n}`)
    .join(' · ')
  const saat = enEski ? `${enEski.slice(11, 16)}Z` : '?'
  return `LINEAR: ${kalemler.length} yeni yorum (${dagilim}), en eski ${saat} — okudum: node scripts/board/linear-okundu.cjs`
}

/**
 * TEK GraphQL sorgusu, SÜZGEÇ SUNUCUDA.
 *
 * ⚠İLK YAZIMIM SESSİZCE BOŞ DÖNÜYORDU ve bu kayda geçti: `project(id:…){ comments }`
 * alanı HTTP 200 + `errors` YOK + `nodes: []` veriyor, oysa o projede 18 yorum var.
 * Yani sorgu yanlış alanı okuyordu ve hata BASMIYORDU — "yeni yorum yok" ile "sorgu
 * kör" hâlleri AYIRT EDİLEMİYORDU. Doğrusu KÖK `comments` sorgusu + proje süzgeci
 * (ölçüldü 2026-09-14: aynı proje için 5 düğüm döndü).
 *
 * ⭐Bu yüzden `--tani` kipi var: sessizliğin sebebini her zaman sorabilmek için.
 * Sessiz bir fail-open'ın bedeli, sessizliğin TEŞHİS EDİLEBİLİR olmamasıdır.
 *
 * Süzgeç (proje + `createdAt > eşik`) SUNUCUDA uygulanıyor: yük küçük, cevap hızlı.
 */
const SORGU = `query($ids: [ID!], $esik: DateTimeOrDuration!) {
  comments(first: 50, filter: { project: { id: { in: $ids } }, createdAt: { gt: $esik } }) {
    nodes { id createdAt body project { id } }
  }
}`

/** Ham sorgu. `{ hata }` döner ya da `{ kalemler }`. Teşhis bunun üstüne kurulu. */
async function cek() {
  const anahtar = process.env.LINEAR_API_KEY
  // ⛔Varlık yalnızca UZUNLUKLA ölçülür; değer hiçbir yere yazılmaz/basılmaz.
  if (!anahtar || anahtar.length < 10) return { hata: 'anahtar yok' }

  const esik = sonOkuma()
  const kontrol = new AbortController()
  const saat = setTimeout(() => kontrol.abort(), ZAMAN_ASIMI_MS)
  try {
    const cevap = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: anahtar },
      body: JSON.stringify({
        query: SORGU,
        variables: { ids: PROJELER.map((p) => p.id), esik },
      }),
      signal: kontrol.signal,
    })
    if (!cevap.ok) return { hata: `HTTP ${cevap.status}`, esik }
    const veri = await cevap.json()
    if (veri && veri.errors) return { hata: 'GraphQL hatasi', esik }
    const dugumler = veri?.data?.comments?.nodes
    if (!Array.isArray(dugumler)) return { hata: 'beklenen alan yok (comments.nodes)', esik }

    const harita = new Map(PROJELER.map((p) => [p.id, p.kisa]))
    const kalemler = []
    for (const d of dugumler) {
      if (!d || typeof d.createdAt !== 'string') continue
      const serit = imzaSerit(d.body)
      if (opsMu(serit)) continue
      kalemler.push({ proje: harita.get(d.project?.id) || '?', createdAt: d.createdAt, serit })
    }
    return { kalemler, esik, hamSayi: dugumler.length }
  } catch (e) {
    return { hata: e && e.name === 'AbortError' ? `zaman asimi (${ZAMAN_ASIMI_MS}ms)` : 'ag/cozumleme' , esik }
  } finally {
    clearTimeout(saat)
  }
}

/**
 * ⭐`--durum` KİPİ (ARC kartı 6edd47ed, olay 2026-10-04) — "ölçülemedi" ile "haber yok"u AYIRIR.
 *
 * OLAY: Design'dan Linear'a 21 saat hiçbir şey gelmedi (son yorum 10-03 12:55Z, arkasından OPS yorumları
 * cevapsız), zil "Okunmamış yorum yok" gösterdi. Sebep iki katmandı: (1) `satir()` anahtar yok / ağ hatası /
 * HTTP hatası / istisna durumlarında `null` döner ve çağıran bunu "yeni yorum yok"tan AYIRAMAZ; (2) sayaç
 * yalnız "okunmamış yeni yorum" sayar, "Design uzun süredir sessiz" bilgisi hiçbir yerde üretilmez.
 *
 * ⭐GERİYE UYUM: varsayılan çıktı (`satir()` / boş çıktı = yok) DEĞİŞMEZ; yüklü zil boş olmayan her
 * çıktıyı "yeni yorum" sayar, yani yeni bir metin o çıktıya EKLENSEYDİ yanlış alarm verirdi. Bu yüzden yeni
 * bilgi AYRI bayrakla (`--durum`) ve TEK satır JSON olarak verilir.
 *
 * ⭐PROJEDEN BAĞIMSIZ: sorgu proje listesine (PROJELER) bakmaz; çalışma alanının son yorumlarını çeker ve
 * Design/OPS ayrımını İMZADAN yapar. Yeni bir Design projesi açılsa bile kör kalmaz.
 *
 * ⭐DESIGN İMZASI = `DESIGN` ile başlayan şerit (DESIGN-MENU, DESIGN-KATALOG…). Ölçüm (2026-10-04): imza
 * çıkarımı gürültülüdür (SSS, PNG, INSERT, AMA gibi sahte "imza"lar çıkıyor), bu yüzden yalnız `DESIGN*` ve
 * `OPS` tanınır, geri kalanı yok sayılır.
 *
 * ⭐PROJE BAŞINA DEĞERLENDİRME: bir projede en az bir Design yorumu varsa o proje "Design kanalı"dır; onun
 * son Design yorumundan SONRA yazılmış OPS yorumları "yanıtsız"dır. Design yorumu olmayan proje (ör. OPS'un
 * emir yazdığı ALTYAPI projesi) kanal sayılmaz, yoksa her OPS yorumu sahte "yanıtsız" olurdu.
 *
 * ⚠SINIR, ADIYLA: pencere son 100 yorumdur. Bir projede pencere içinde hiç Design yorumu yoksa o proje
 * kanal sayılmaz. Hiçbir projede Design yorumu yoksa sonuç "belirsiz"dir, "sessiz" DEĞİL.
 */
const DURUM_SORGU = `query {
  comments(first: 100, orderBy: createdAt) {
    nodes { createdAt body project { id name } }
  }
}`

/** Yanıtsız OPS yorumu için eşikler: 6 saatten sonra amber, 24 saatten sonra kırmızı. */
const ESIK_AMBER_MS = 6 * 60 * 60 * 1000
const ESIK_KIRMIZI_MS = 24 * 60 * 60 * 1000

function seritTuru(govde) {
  const s = imzaSerit(govde)
  if (!s) return null
  if (s === 'OPS') return 'ops'
  if (s.startsWith('DESIGN')) return 'design'
  return null
}

/** "5 dk", "21 saat", "3 gün" — okunur yaş. */
function yasYaz(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '?'
  const dk = Math.floor(ms / 60000)
  if (dk < 60) return `${dk} dk`
  const saat = Math.floor(dk / 60)
  if (saat < 48) return `${saat} saat`
  return `${Math.floor(saat / 24)} gün`
}

/**
 * Saf hesap: yorum düğümlerinden durumu çıkarır. Ağ yok, saat DIŞARIDAN verilir (test edilebilir).
 * Dönüş: `{ durum: 'olculdu', seviye, ozet, ... }` ya da `{ durum: 'belirsiz', seviye: 'belirsiz', ... }`.
 */
function durumHesapla(dugumler, simdiMs) {
  const projeler = new Map()
  for (const d of Array.isArray(dugumler) ? dugumler : []) {
    if (!d || typeof d.createdAt !== 'string' || !d.project || !d.project.id) continue
    const zaman = Date.parse(d.createdAt)
    if (!Number.isFinite(zaman)) continue
    const tur = seritTuru(d.body)
    if (!tur) continue
    let p = projeler.get(d.project.id)
    if (!p) {
      p = { ad: d.project.name || '?', design: [], ops: [] }
      projeler.set(d.project.id, p)
    }
    p[tur].push(zaman)
  }

  const kanallar = []
  for (const [id, p] of projeler) {
    if (p.design.length === 0) continue
    const sonDesign = Math.max(...p.design)
    const yanitsiz = p.ops.filter((z) => z > sonDesign).sort((a, b) => a - b)
    kanallar.push({
      id,
      ad: p.ad,
      sonDesignMs: sonDesign,
      sonDesignYas: simdiMs - sonDesign,
      yanitsizSayi: yanitsiz.length,
      enEskiYanitsizYas: yanitsiz.length > 0 ? simdiMs - yanitsiz[0] : null,
    })
  }

  if (kanallar.length === 0) {
    return {
      durum: 'belirsiz',
      seviye: 'belirsiz',
      ozet: 'Design yorumu son 100 yorumda yok: sessizlik ölçülemedi',
    }
  }

  // ⭐SEVİYE YALNIZ ETKİN KANALA BAĞLIDIR (en son Design yorumu olan proje). Ölçüm (2026-10-04): MARKA
  // kanalında OPS en son yazmış ve 5 gündür cevap yok; o eski konuşma seviyeyi kalıcı kırmızı yapıp zili
  // gürültüye çevirirdi. Diğer kanallar BİLGİ olarak ozet'e yazılır, seviyeyi etkilemez.
  const enSon = kanallar.reduce((a, b) => (b.sonDesignMs > a.sonDesignMs ? b : a))
  const digerleri = kanallar.filter((k) => k !== enSon && k.yanitsizSayi > 0)

  let seviye = 'iyi'
  if (enSon.enEskiYanitsizYas !== null && enSon.enEskiYanitsizYas >= ESIK_KIRMIZI_MS) seviye = 'kirmizi'
  else if (enSon.enEskiYanitsizYas !== null && enSon.enEskiYanitsizYas >= ESIK_AMBER_MS) seviye = 'amber'

  let ozet = `Design son yorum: ${yasYaz(enSon.sonDesignYas)} önce (${kisaAd(enSon.ad)})`
  if (enSon.yanitsizSayi > 0) {
    ozet += ` · OPS ${enSon.yanitsizSayi} yorum yanıtsız (en eski ${yasYaz(enSon.enEskiYanitsizYas)})`
  }
  if (digerleri.length > 0) {
    ozet += ` · eski kanal: ${digerleri.map((k) => `${kisaAd(k.ad)} ${k.yanitsizSayi} yanıtsız (${yasYaz(k.enEskiYanitsizYas)})`).join(', ')}`
  }

  return {
    durum: 'olculdu',
    seviye,
    ozet,
    sonDesignYasMs: enSon.sonDesignYas,
    sonDesignProje: enSon.ad,
    yanitsizSayi: enSon.yanitsizSayi,
    enEskiYanitsizYasMs: enSon.enEskiYanitsizYas,
    eskiKanallar: digerleri.map((k) => ({ ad: k.ad, yanitsizSayi: k.yanitsizSayi, enEskiYanitsizYasMs: k.enEskiYanitsizYas })),
  }
}

/** "Vitrin 15A Yeniden Tasarım (DESIGN-MENU)" → "DESIGN-MENU"; parantez yoksa adın ilk 24 harfi. */
function kisaAd(ad) {
  const m = /\(([^)]+)\)\s*$/.exec(String(ad))
  return m ? m[1] : String(ad).slice(0, 24)
}

/** Ham sorgu, `cek()` ile AYNI hata sözlüğü. `{ hata }` ya da `{ dugumler }`. */
async function cekDurum() {
  const anahtar = process.env.LINEAR_API_KEY
  if (!anahtar || anahtar.length < 10) return { hata: 'anahtar yok' }

  const kontrol = new AbortController()
  const saat = setTimeout(() => kontrol.abort(), ZAMAN_ASIMI_MS)
  try {
    const cevap = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: anahtar },
      body: JSON.stringify({ query: DURUM_SORGU }),
      signal: kontrol.signal,
    })
    if (!cevap.ok) return { hata: `HTTP ${cevap.status}` }
    const veri = await cevap.json()
    if (veri && veri.errors) return { hata: 'GraphQL hatasi' }
    const dugumler = veri?.data?.comments?.nodes
    if (!Array.isArray(dugumler)) return { hata: 'beklenen alan yok (comments.nodes)' }
    return { dugumler }
  } catch (e) {
    return { hata: e && e.name === 'AbortError' ? `zaman asimi (${ZAMAN_ASIMI_MS}ms)` : 'ag/cozumleme' }
  } finally {
    clearTimeout(saat)
  }
}

/**
 * `--durum` çıktısı: HER durumda bir sonuç döner, asla boş değil.
 * `olculemedi` (anahtar/ağ/HTTP/şema hatası) ile `belirsiz` ile `olculdu` birbirinden AYRIDIR.
 */
async function durum(simdiMs = Date.now()) {
  try {
    const c = await cekDurum()
    if (c.hata) {
      return { durum: 'olculemedi', seviye: 'olculemedi', sebep: c.hata, ozet: `ölçülemedi: ${c.hata}` }
    }
    return durumHesapla(c.dugumler, simdiMs)
  } catch {
    return { durum: 'olculemedi', seviye: 'olculemedi', sebep: 'istisna', ozet: 'ölçülemedi: istisna' }
  }
}

/**
 * ⭐ÖNBELLEK — niçin var: bu satır HER TURDA koşan bir kancanın içinden çağrılıyor ve
 * canlı ölçüm bir sorgunun ~1,3 sn sürdüğünü gösterdi. Her tura 1,3 sn eklemek, bu
 * satırın faydasından büyük bir bedeldir; üstüne üstlük hızlı ard arda turlarda aynı
 * cevabı yeniden sormak boşa istek demektir.
 *
 * 60 saniyelik önbellek bu bedeli neredeyse sıfıra indiriyor ve KURAL BOZULMUYOR:
 * süreç yok, cron yok, gözcü yok — yalnız zaten koşan bir kancanın kendi sonucunu
 * kısa süre hatırlaması. "Linear yorum sayacı = kanca, gözcü değil."
 *
 * ⚠SINIR, ADIYLA: en fazla 60 saniyelik gecikme. 13 saatlik gecikmeyi onarmak için
 * yazılmış bir araçta 60 saniye önemsizdir; ama önemsiz OLDUĞU yazılmalı, sessizce
 * kabul edilmemeli.
 */
const ONBELLEK_MS = 60 * 1000

function onbellekYolu() {
  return damgaYolu().replace(/\.json$/, '-onbellek.json')
}

function onbellektenOku() {
  try {
    const o = JSON.parse(fs.readFileSync(onbellekYolu(), 'utf8'))
    if (!o || typeof o.zaman !== 'number') return undefined
    if (Date.now() - o.zaman > ONBELLEK_MS) return undefined
    // `satir` null da olabilir (N=0) — o da geçerli bir önbellek değeridir.
    return { satir: typeof o.satir === 'string' ? o.satir : null }
  } catch {
    return undefined
  }
}

function onbellegeYaz(s) {
  try {
    fs.writeFileSync(onbellekYolu(), JSON.stringify({ zaman: Date.now(), satir: s }) + '\n')
  } catch {
    /* yazılamadı: bir dahaki tur yeniden sorar, zararsız */
  }
}

/** Kancadan çağrı için: hiçbir hata dışarı sızmaz, dönen şey ya satır ya `null`. */
async function satir() {
  try {
    // ⭐ANAHTAR KONTROLÜ ÖNBELLEKTEN ÖNCE — ve niçin, kabul sınavı bunu buldu:
    // önbellek anahtarın gidip gitmediğini BİLMEZ. Anahtar kaldırıldıktan sonra
    // sayaç 60 saniye boyunca eski satırı basmaya devam ediyordu, yani
    // "anahtar yok → satır yok" kabul maddesi önbellek penceresinde SAĞLANMIYORDU.
    // Doğru sıra: önce yetki, sonra önbellek.
    const anahtar = process.env.LINEAR_API_KEY
    if (!anahtar || anahtar.length < 10) return null

    const onbellek = onbellektenOku()
    if (onbellek !== undefined) return onbellek.satir

    const s = await cek()
    if (s.hata) {
      // ⚠HATA ÖNBELLEĞE YAZILMAZ: ağ bir saniye kopmuşsa 60 saniye boyunca kör
      // kalmayı seçmek, sessiz fail-open'ı gereksizce uzatmak olurdu.
      return null
    }
    const cikti = ozetle(s.kalemler)
    onbellegeYaz(cikti)
    return cikti
  } catch {
    return null
  }
}

module.exports = {
  imzaSerit,
  ozetle,
  opsMu,
  satir,
  cek,
  damgaYolu,
  PROJELER,
  ZAMAN_ASIMI_MS,
  SORGU,
  durum,
  durumHesapla,
  seritTuru,
  yasYaz,
  ESIK_AMBER_MS,
  ESIK_KIRMIZI_MS,
}

if (require.main === module) {
  const tani = process.argv.includes('--tani')
  if (process.argv.includes('--durum')) {
    // Tek satır JSON; çıkış kodu HER ZAMAN 0 (ölçülemedi de bir sonuçtur, çağıran kendi hatasıyla karıştırmasın).
    durum().then((d) => console.log(JSON.stringify(d)))
  } else if (!tani) {
    satir().then((s) => {
      if (s) console.log(s)
    })
  } else {
    cek().then((s) => {
      const a = process.env.LINEAR_API_KEY
      // ⛔Anahtarın DEĞERİ değil, yalnız uzunluğu.
      console.log(`[tani] anahtar    : ${a ? `uzunluk=${a.length}` : 'YOK'}`)
      console.log(`[tani] damga yolu : ${damgaYolu()}`)
      console.log(`[tani] esik       : ${s.esik || '(okunamadi)'}`)
      if (s.hata) {
        console.log(`[tani] SONUC      : SESSIZ KALDI — sebep: ${s.hata}`)
        return
      }
      console.log(`[tani] sunucudan  : ${s.hamSayi} yorum (proje + tarih suzgeci SUNUCUDA)`)
      console.log(`[tani] OPS disi   : ${s.kalemler.length}`)
      for (const k of s.kalemler) console.log(`         ${k.proje.padEnd(8)} ${k.createdAt} imza=${k.serit}`)
      console.log(`[tani] SATIR      : ${ozetle(s.kalemler) || '(yok — N=0, satir BASILMAZ)'}`)
    })
  }
}
