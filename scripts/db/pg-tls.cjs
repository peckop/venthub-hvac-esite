'use strict'
/**
 * pg bağlantıları için TLS ayarı — doğrulama DAİMA açık (C10, güvenlik karnesi 2026-11).
 *
 * NİÇİN: eski DB betikleri `ssl: { rejectUnauthorized: false }` yazıyordu. Bu bağlantılar prod DB
 * kimlik bilgisi taşıyor ve depo herkese açık; doğrulama kapalıyken aradaki bir taraf bağlantıyı
 * dinleyebilir ve hiçbir çıktı bunu göstermez. Kapı: INV-TLS-BETIK-1 (`pg-tls-kapisi.test.ts`).
 *
 * Desen `scripts/katalog/katalog-sayim.mjs` `resolveTls` ile aynı: kök sertifika `PGSSLROOTCERT`
 * ile verilir, verilmezse depodaki Supabase kökü kullanılır (ve bu BASILIR). Sistem kökleri de
 * eklenir: `ca` verilince Node varsayılan depoyu devre dışı bırakır; doğrudan bağlantı Supabase'in
 * özel kökünü, havuz ucu kamu CA'sını kullanabilir. Bozuk kök dosyası → hata (fail-closed).
 */
const fs = require('node:fs')
const path = require('node:path')
const tls = require('node:tls')

const VARSAYILAN_CA = path.join(__dirname, 'checks', 'supabase-root-2021-ca.pem')

/**
 * ⛔BAĞLANTI DİZGESİ TLS'İ EZEMEZ (ALT-164, OPS-234 m3, 2026-11-06). Ölçüldü (pg 8.23.1,
 * ConnectionParameters): dizgedeki parametreler `ssl` ayarının ÜZERİNE yazılır:
 *   sslmode=disable → ssl false (TLS YOK) · sslmode=no-verify → rejectUnauthorized false ·
 *   sslmode=require/prefer → {} (bizim kök sertifikamız düşer) · ssl=0 → false · sslrootcert=… → dosya okur.
 * Bu yüzden dizgede TLS'e dokunan parametre varsa bağlantı REDDEDİLİR (fail-closed); TLS yalnız buradan gelir.
 */
const TLS_EZEN_PARAMETRELER = ['sslmode', 'ssl', 'sslrootcert', 'sslcert', 'sslkey', 'sslpassword', 'uselibpqcompat']

/** Bağlantı dizgesinde TLS'i ezebilecek sorgu parametrelerini döner (küçük harf). Ayrıştırılamazsa hata. */
function tlsEzenParametreler(baglanti) {
  let url
  try {
    url = new URL(baglanti)
  } catch {
    throw new Error('pg-tls: baglanti dizgesi URL olarak ayristirilamadi (TLS parametreleri denetlenemez)')
  }
  const adlar = [...url.searchParams.keys()].map((a) => a.toLowerCase())
  return [...new Set(adlar.filter((a) => TLS_EZEN_PARAMETRELER.includes(a)))]
}

/**
 * @param {string} [baglanti] Client'a `connectionString` olarak verilen dizge. connectionString kullanan
 *   her çağıran bunu VERMELİ (kapı: pg-tls-kapisi.test.ts); yalnız alan alan yapılandırma (host/user/...) verilmez.
 */
function pgTls(baglanti) {
  if (baglanti !== undefined) {
    if (typeof baglanti !== 'string' || baglanti === '') {
      throw new Error('pg-tls: baglanti dizgesi bos ya da metin degil')
    }
    const ezen = tlsEzenParametreler(baglanti)
    if (ezen.length) {
      throw new Error(
        `pg-tls: baglanti dizgesinde TLS ayarini ezen parametre var (${ezen.join(', ')}); ` +
          'dizgeden cikar, TLS yalniz pgTls() ile verilir',
      )
    }
  }
  const verilen = process.env.PGSSLROOTCERT
  const caYol = verilen || VARSAYILAN_CA
  if (!fs.existsSync(caYol)) {
    throw new Error(`pg-tls: kok sertifika bulunamadi: ${caYol} (PGSSLROOTCERT ile ver)`)
  }
  const pem = fs.readFileSync(caYol, 'utf8')
  const blok = (pem.match(/-----BEGIN CERTIFICATE-----/g) || []).length
  if (blok === 0) {
    throw new Error(`pg-tls: kok sertifika bir PEM degil (BEGIN CERTIFICATE blogu yok, ${pem.length} bayt): ${caYol}`)
  }
  console.error(`pg-tls: kok sertifika ${verilen ? 'PGSSLROOTCERT' : 'depodaki varsayilan'} (${caYol})`)
  return { ca: [...tls.rootCertificates, pem], rejectUnauthorized: true }
}

module.exports = { pgTls, tlsEzenParametreler, TLS_EZEN_PARAMETRELER, VARSAYILAN_CA }
