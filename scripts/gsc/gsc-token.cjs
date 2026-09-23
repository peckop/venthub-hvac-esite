#!/usr/bin/env node
'use strict'
/**
 * Google Search Console erişim jetonu — HİZMET HESABI ile (süresi dolmayan kalıcı yol).
 *
 * NİÇİN: `~/.claude/.env.global`'daki OAuth yenileme jetonu 2026-09-23'te `invalid_grant` verdi. OAuth
 * uygulaması "Testing" kipindeyken Google yenileme jetonlarını 7 günde düşürür (dosya 09-07 tarihliydi).
 * Hizmet hesabı kullanıcı onayı istemez; Recep hesabın e-postasını Search Console'a BİR KEZ kullanıcı olarak
 * ekler, sonra jeton her istekte anahtardan yeniden üretilir.
 *
 * Kullanım: GSC_SA_ANAHTAR=<hizmet-hesabı JSON anahtar dosyası (depo DIŞINDA)> node scripts/gsc/gsc-token.cjs
 *   → stdout'a YALNIZ erişim jetonu (1 saat geçerli). `--dene <site>` : sites listesini çekip siteye erişimi doğrular.
 * ⛔Anahtar dosyası sırdır: depo içindeyse betik REDDEDER (repo PUBLIC). İçeriği asla basılmaz.
 * Bağımlılık yok: JWT (RS256) Node `crypto` ile imzalanır.
 */
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const KAPSAM = 'https://www.googleapis.com/auth/webmasters.readonly'

function depoIcindeMi(dosya) {
  let d = path.dirname(path.resolve(dosya))
  for (;;) {
    if (fs.existsSync(path.join(d, '.git'))) return true
    const ust = path.dirname(d)
    if (ust === d) return false
    d = ust
  }
}

const b64url = (b) => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')

/** Saf: hizmet hesabı anahtarı + an → imzalı JWT onayı (test edilebilir). */
function jwtOlustur(anahtar, simdiSn = Math.floor(Date.now() / 1000)) {
  if (!anahtar?.client_email || !anahtar?.private_key) throw new Error('anahtar dosyasi hizmet hesabi JSON\'u degil (client_email/private_key yok)')
  const bas = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const govde = b64url(JSON.stringify({ iss: anahtar.client_email, scope: KAPSAM, aud: 'https://oauth2.googleapis.com/token', iat: simdiSn, exp: simdiSn + 3600 }))
  const imza = crypto.createSign('RSA-SHA256').update(`${bas}.${govde}`).sign(anahtar.private_key)
  return `${bas}.${govde}.${b64url(imza)}`
}

async function jeton() {
  const yol = process.env.GSC_SA_ANAHTAR
  if (!yol) throw new Error('GSC_SA_ANAHTAR tanimli degil')
  if (depoIcindeMi(yol)) throw new Error('anahtar dosyasi bir git deposunun icinde — reddedildi (repo PUBLIC)')
  const anahtar = JSON.parse(fs.readFileSync(yol, 'utf8'))
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwtOlustur(anahtar) }),
  })
  const j = await r.json()
  if (!r.ok || !j.access_token) throw new Error(`token ${r.status}: ${j.error || ''} ${j.error_description || ''}`.trim())
  return { token: j.access_token, hesap: anahtar.client_email }
}

async function main(argv) {
  const { token, hesap } = await jeton()
  const i = argv.indexOf('--dene')
  if (i === -1) return process.stdout.write(token)
  const site = argv[i + 1]
  const r = await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers: { authorization: `Bearer ${token}` } })
  const siteler = ((await r.json()).siteEntry || []).map((s) => `${s.siteUrl} (${s.permissionLevel})`)
  console.log(`hesap ${hesap} · erisilen site ${siteler.length}: ${siteler.join(', ') || 'YOK — Search Console\'da kullanici olarak eklenmemis'}`)
  if (site && !siteler.some((s) => s.startsWith(site))) process.exitCode = 1
}

if (require.main === module) main(process.argv.slice(2)).catch((e) => { console.error(`HATA: ${e.message}`); process.exitCode = 1 })

module.exports = { jwtOlustur, depoIcindeMi, KAPSAM }
