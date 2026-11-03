#!/usr/bin/env node
/**
 * DÖKÜM SIR TARAMASI — şema dökümü artefakt olarak yüklenmeden ÖNCE sır ve kimlik biçimi arar
 * (güvenlik karnesi 2026-11 S3, OPS-211). Bekçi: INV-SEMA-TABAN-1 "sır taraması upload'dan önce" kolu
 * (`src/__tests__/conformance/sema-tabani-is-akisi.test.ts`) + `scripts/security/__tests__/dokum-sir-taramasi.test.ts`.
 *
 * NİÇİN: `sema-tabani-uret.yml` prod şemasını döküp artefakt yapar; depo HERKESE AÇIK olduğu için artefakt da
 * herkese açıktır ve döküm sonradan PR ile depoya girer. Şema dökümü fonksiyon gövdelerini ve varsayılan
 * değerleri taşır: bir fonksiyona gömülmüş anahtar (`pg_net` çağrısında service_role JWT, webhook sırrı) ya da
 * bağlantı dizesi dökümle birlikte dışarı çıkar. Bugünkü döküm temiz (ölçüldü: 19 taban dosyası, 0 bulgu);
 * bu adım TEMİZLİĞİN GERİ GELMEMESİNİ engeller.
 *
 * KURALLAR: `depo-dokum-kapisi.cjs` R7 imzaları (özel anahtar, JWT, canlı ödeme, AWS, GitHub, Slack, Google,
 * Supabase gizli anahtar, sağlamalı TCKN, mod-97 IBAN) + bu dosyadaki ek imzalar (Postgres bağlantı dizesinde
 * parola, webhook sırrı, LLM sağlayıcı anahtarları, Twilio SID). Biçime bakar, değere değil.
 *
 * ⛔DEĞER BASMAZ: çıktıda yalnız dosya adı, imza adı ve sayı.
 *
 * KULLANIM: node scripts/security/dokum-sir-taramasi.cjs <dosya> [<dosya> ...]
 * ÇIKIŞ: 0 temiz · 1 bulgu · 2 ölçülemedi (dosya yok, boş, okunamadı, argüman yok). 2 de KIRMIZIDIR.
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const { belgeKimlikTara } = require('./depo-dokum-kapisi.cjs')

/** R7'de olmayan, döküm bağlamında anlamlı ek imzalar. Hepsi sınırlı uzunluk; doğrusal. */
const EK_IMZALAR = Object.freeze([
  // Parola taşıyan bağlantı dizesi: `postgres://kullanici:parola@` (parolasız `postgres://host` takılmaz).
  { ad: 'Postgres bağlantı dizesinde parola', desen: /postgres(?:ql)?:\/\/[^:@/\s'"]+:[^@/\s'"]{4,}@/g },
  { ad: 'Webhook sırrı (whsec_)', desen: /\bwhsec_[A-Za-z0-9_]{16,}/g },
  { ad: 'Anthropic API anahtarı', desen: /\bsk-ant-[A-Za-z0-9_-]{20,}/g },
  { ad: 'OpenAI API anahtarı', desen: /\bsk-proj-[A-Za-z0-9_-]{20,}/g },
  { ad: 'OpenRouter API anahtarı', desen: /\bsk-or-v1-[A-Za-z0-9]{16,}/g },
  { ad: 'Twilio hesap/anahtar SID', desen: /\b(?:AC|SK)[0-9a-f]{32}\b/g },
])

/** @param {string} metin @returns {string[]} 'imza (sayı)' satırları; boşsa temiz. Değer içermez. */
function dokumTara(metin) {
  const bulgular = belgeKimlikTara(metin)
  for (const { ad, desen } of EK_IMZALAR) {
    const n = (metin.match(desen) || []).length
    if (n > 0) bulgular.push(`${ad} (${n})`)
  }
  return bulgular
}

/**
 * @param {string[]} argv @param {{yaz?:(s:string)=>void, hata?:(s:string)=>void}} [ortam]
 * @returns {0|1|2}
 */
function calistir(argv, ortam = {}) {
  const yaz = ortam.yaz || ((s) => process.stdout.write(`${s}\n`))
  const hata = ortam.hata || ((s) => process.stderr.write(`${s}\n`))
  if (argv.length === 0) {
    hata('Çalıştırma hatası: taranacak dosya verilmedi. (kullanım: node scripts/security/dokum-sir-taramasi.cjs <dosya>...)')
    return 2
  }
  let ihlal = false
  for (const dosya of argv) {
    const ad = path.basename(dosya)
    let metin
    try {
      metin = fs.readFileSync(dosya, 'utf8')
    } catch {
      hata(`ÖLÇÜLEMEDİ: ${ad} okunamadı (yok ya da erişilemiyor). Kapı YEŞİL VERMEZ.`)
      return 2
    }
    if (metin.trim().length === 0) {
      hata(`ÖLÇÜLEMEDİ: ${ad} boş (boş evren ölçüm değildir). Kapı YEŞİL VERMEZ.`)
      return 2
    }
    const bulgular = dokumTara(metin)
    if (bulgular.length > 0) {
      ihlal = true
      for (const b of bulgular) hata(`::error::${ad}: ${b}`)
    } else {
      yaz(`${ad}: temiz (${metin.length} karakter tarandı, değer basılmadı)`)
    }
  }
  if (ihlal) {
    hata('Döküm SIR/KİMLİK BİÇİMİ taşıyor: artefakt YÜKLENMEDİ. Kaynağı (fonksiyon gövdesi, varsayılan değer) bul,')
    hata('sırrı Vault/ortam değişkenine taşı, eski değeri döndür (rotate). Değer bu günlükte YOK; dökümü yerelde aç.')
    return 1
  }
  return 0
}

module.exports = { EK_IMZALAR, dokumTara, calistir }

if (require.main === module) process.exit(calistir(process.argv.slice(2)))
