#!/usr/bin/env node
/**
 * MEVZUAT HAM ÇEKİM — bir resmî adresi ham bayt olarak çeker; ham ve etiketsiz metnin sha256'sını
 * hesaplar; verilen alıntıların metinde BİREBİR bulunup bulunmadığını söyler.
 *
 * NİÇİN VAR (OPS-256, MVZ-10, 2026-11-08, ölçüldü): MEVZUAT penceresi aynı kabuğu (adres çek →
 * kodla çöz → etiket soy → NFC → sha256 → alıntı ara) bir günde 6'dan fazla kez yeniden yazdı;
 * üstelik `curl/*` kullanıcı etmeni resmigazete.gov.tr ve mevzuat.gov.tr'de TLS sonrası sessizce
 * düşer (0 bayt, ALT-174). Kullanıcı etmeni ve başlıklar artık tek yerde.
 *
 * SÖZLEŞME (docs/standards/mevzuat-kaydi-standard.md M3):
 *   - ham sha = sunucunun döndürdüğü baytın sha256 ilk 12'si
 *   - metin sha = betik/stil atılmış, etiketler soyulmuş, &nbsp; boşluk, boşluk tekil, NFC, trim
 *   - alıntı doğrulaması birebirdir (büyük/küçük harf ve noktalama dahil); bulunmazsa dogrulandi=false
 *   - robots.txt bu araçta OKUNMAZ: kaynak girdisine `robots: 'ölçülmedi'` yazılır; okumak çağıranın işi
 *
 * KULLANIM:
 *   node scripts/mevzuat/ham-cekim.cjs <adres> [--kodlama=auto|utf-8|windows-1254]
 *        [--accept=<başlık>] [--dil=<başlık>] [--alinti="..."]... [--kaydet=<dosya-öneki>]
 *        [--kaynak] [--yontem="..."] [--bugun=YYYY-AA-GG]
 *   Çıktı JSON: --kaynak ile kanıt dosyasına girecek kaynak girdisi (kanit-ekle.cjs girdisi olarak
 *   kullanılır), yoksa ölçüm özeti. --kaydet=<önek> ham baytı <önek>.ham ve metni <önek>.txt yazar.
 *   TOPLU (yeniden doğrulama, çok kalem): node scripts/mevzuat/ham-cekim.cjs --toplu=<is.json> [--cikti=<ekle-girdisi.json>]
 *   is.json: { "bugun", "isler": [ { "kimlik", "url", "alintiKanittan": true | "alinti": "...", ... } ] } →
 *   kanit-ekle.cjs girdisini üretir (bkz. topluHazirla).
 *
 * İTME YOK, DOSYA YAZMA YALNIZ --kaydet İLE.
 */
const fs = require('fs')
const crypto = require('crypto')

const VARSAYILAN_UA = 'VentHub-mevzuat/1.0'
const NORMALIZASYON = 'ham: sunucunun döndürdüğü bayt; metin: çözülüp betik/stil atılmış, etiketler soyulmuş, &nbsp; boşluk, boşluk tekil, NFC'

function sha12(veri) {
  return crypto.createHash('sha256').update(veri).digest('hex').slice(0, 12)
}

/** Kodlama adı: başlıktan, sonra <meta charset>tan, yoksa utf-8. 'auto' dışında verilen aynen kullanılır. */
function kodlamaBul(bayt, contentType, istenen) {
  if (istenen && istenen !== 'auto') return istenen
  const baslik = /charset\s*=\s*["']?([\w-]+)/i.exec(contentType || '')
  if (baslik) return baslik[1].toLowerCase()
  const bas = Buffer.from(bayt.subarray(0, 4096)).toString('latin1')
  const meta = /<meta[^>]+charset\s*=\s*["']?([\w-]+)/i.exec(bas)
  if (meta) return meta[1].toLowerCase()
  return 'utf-8'
}

function metinNormalize(bayt, kodlama) {
  let ham
  try {
    ham = new TextDecoder(kodlama).decode(bayt)
  } catch {
    throw new Error(`bilinmeyen kodlama: ${kodlama}`)
  }
  return ham
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .normalize('NFC')
    .trim()
}

/**
 * @param {{url:string, kodlama?:string, accept?:string, dil?:string, ua?:string, alinti?:string[], zamanAsimiMs?:number}} secenek
 */
async function hamCek(secenek) {
  const { url, kodlama = 'auto', accept, dil, ua = VARSAYILAN_UA, alinti = [], zamanAsimiMs = 60000 } = secenek
  if (!url || !/^https?:\/\//i.test(url)) throw new Error('adres http(s) ile başlamalı')
  const basliklar = { 'User-Agent': ua }
  if (accept) basliklar.Accept = accept
  if (dil) basliklar['Accept-Language'] = dil
  const yanit = await fetch(url, { headers: basliklar, redirect: 'follow', signal: AbortSignal.timeout(zamanAsimiMs) })
  const bayt = Buffer.from(await yanit.arrayBuffer())
  const kod = kodlamaBul(bayt, yanit.headers.get('content-type'), kodlama)
  const metin = metinNormalize(bayt, kod)
  const alintilar = alinti.map((a) => ({ metin: a, bulundu: metin.includes(a) }))
  return {
    url,
    son_url: yanit.url || url,
    http: yanit.status,
    bayt: bayt.length,
    kodlama: kod,
    sha256_ilk12: sha12(bayt),
    sha256_metin_ilk12: sha12(metin),
    alintilar,
    ham: bayt,
    metin,
  }
}

/** kanit-ekle.cjs girdisi olan kaynak girdisi. Alıntı yoksa alinti_dogrulandi=false ve alinti ''. */
function kaynakGirdisi(sonuc, ek = {}) {
  const bugun = ek.bugun || new Date().toISOString().slice(0, 10)
  const ilk = sonuc.alintilar[0]
  return {
    url: sonuc.url,
    son_url: sonuc.son_url,
    http: sonuc.http,
    robots: 'ölçülmedi',
    erisim_tarihi: bugun,
    yayinci: new URL(sonuc.son_url).hostname,
    resmi: ek.resmi !== false,
    yontem: ek.yontem || `Node fetch, User-Agent ${VARSAYILAN_UA}; ölçüm ${bugun}`,
    durum_satiri: ek.durum_satiri || '',
    bayt: sonuc.bayt,
    sha256_ilk12: sonuc.sha256_ilk12,
    sha256_metin_ilk12: sonuc.sha256_metin_ilk12,
    sha256_normalizasyon: NORMALIZASYON,
    alinti: ilk ? ilk.metin : '',
    alinti_dogrulandi: Boolean(ilk && ilk.bulundu),
  }
}

/**
 * TOPLU: yeniden doğrulama (M5) için çok kalemi tek koşumda çeker ve kanit-ekle.cjs girdisini üretir.
 * Her iş: { kimlik, url, kodlama?, accept?, dil?, alinti? (metin ya da dizi), alintiKanittan?: true,
 *           yontem?, durum_satiri?, kanitOlustur?, izinDogrulanmamis?, iliski_notlari?, acik_sorular?, tarihler?, durum? }
 * `alintiKanittan: true` → alıntı, kalemin kanıt dosyasındaki AYNI adresli son kaynağın alıntısıdır (yeniden doğrulama).
 * Alıntısız iş doğrulanmamış sayılır; kanit-ekle onu reddeder (izinDogrulanmamis olmadıkça).
 * @param {{bugun?:string, isler:Array<Record<string, any>>}} girdi
 * @param {{kok?:string}} secenek
 */
async function topluHazirla(girdi, secenek = {}) {
  const kok = secenek.kok || process.cwd()
  const bugun = girdi.bugun || new Date().toISOString().slice(0, 10)
  const kayit = JSON.parse(fs.readFileSync(`${kok}/docs/mevzuat/kayit.json`, 'utf8'))
  const cikti = { bugun, isler: [] }
  for (const is of girdi.isler) {
    let alinti = is.alinti === undefined ? [] : Array.isArray(is.alinti) ? is.alinti : [is.alinti]
    if (is.alintiKanittan) {
      const kalem = kayit.kalemler.find((x) => x.kimlik === is.kimlik)
      if (!kalem) throw new Error(`kalem yok: ${is.kimlik}`)
      const kanit = JSON.parse(fs.readFileSync(`${kok}/${kalem.kaynaklar_kanit}`, 'utf8'))
      const eski = [...kanit.kaynaklar].reverse().find((x) => x.url === is.url && x.alinti)
      if (!eski) throw new Error(`${is.kimlik}: kanıt dosyasında bu adreste alıntılı kaynak yok`)
      alinti = [eski.alinti]
    }
    const sonuc = await hamCek({ url: is.url, kodlama: is.kodlama, accept: is.accept, dil: is.dil, alinti })
    const kaynak = kaynakGirdisi(sonuc, { bugun, yontem: is.yontem, durum_satiri: is.durum_satiri })
    const { kimlik, kodlama, accept, dil, url, alinti: _a, alintiKanittan, yontem, durum_satiri, ...gerisi } = is
    void [kodlama, accept, dil, url, _a, alintiKanittan, yontem, durum_satiri]
    cikti.isler.push({ kimlik, kaynak, ...gerisi })
  }
  return cikti
}

function argumanlar(argv) {
  const o = { alinti: [], konum: [] }
  for (const a of argv) {
    const m = /^--([\w-]+)(?:=([\s\S]*))?$/.exec(a)
    if (!m) { o.konum.push(a); continue }
    if (m[1] === 'alinti') o.alinti.push(m[2] ?? '')
    else o[m[1]] = m[2] === undefined ? true : m[2]
  }
  return o
}

async function main() {
  const a = argumanlar(process.argv.slice(2))
  if (a.toplu) {
    const cikti = await topluHazirla(JSON.parse(fs.readFileSync(a.toplu, 'utf8')), { kok: a.kok })
    const metin = JSON.stringify(cikti, null, 2)
    if (a.cikti) fs.writeFileSync(a.cikti, metin)
    else console.log(metin)
    const dogrulanmamis = cikti.isler.filter((x) => x.kaynak.alinti_dogrulandi !== true).map((x) => x.kimlik)
    if (dogrulanmamis.length) { console.error(`UYARI: alıntısı doğrulanmayan kalemler: ${dogrulanmamis.join(', ')}`); process.exitCode = 3 }
    return
  }
  const url = a.konum[0]
  if (!url) {
    console.error('Kullanım: node scripts/mevzuat/ham-cekim.cjs <adres> [--kodlama=auto] [--accept=..] [--dil=..] [--alinti="..."]... [--kaydet=<önek>] [--kaynak] [--yontem=".."] [--bugun=YYYY-AA-GG]')
    process.exit(2)
  }
  const sonuc = await hamCek({ url, kodlama: a.kodlama, accept: a.accept, dil: a.dil, alinti: a.alinti })
  if (a.kaydet) {
    fs.writeFileSync(`${a.kaydet}.ham`, sonuc.ham)
    fs.writeFileSync(`${a.kaydet}.txt`, sonuc.metin)
  }
  if (a.kaynak) {
    console.log(JSON.stringify(kaynakGirdisi(sonuc, { yontem: a.yontem, bugun: a.bugun, durum_satiri: a['durum-satiri'] }), null, 2))
  } else {
    const { ham, metin, ...ozet } = sonuc
    console.log(JSON.stringify({ ...ozet, metin_uzunluk: metin.length }, null, 2))
  }
  const eksik = sonuc.alintilar.filter((x) => !x.bulundu)
  if (eksik.length) { console.error(`UYARI: ${eksik.length} alıntı metinde birebir bulunamadı`); process.exitCode = 3 }
  if (sonuc.http !== 200) { console.error(`UYARI: HTTP ${sonuc.http}`); process.exitCode = process.exitCode || 4 }
}

if (require.main === module) {
  main().catch((e) => { console.error('HATA:', e.message); process.exit(1) })
}

module.exports = { VARSAYILAN_UA, NORMALIZASYON, sha12, kodlamaBul, metinNormalize, hamCek, kaynakGirdisi, topluHazirla }
