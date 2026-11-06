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

function pgTls() {
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

module.exports = { pgTls, VARSAYILAN_CA }
