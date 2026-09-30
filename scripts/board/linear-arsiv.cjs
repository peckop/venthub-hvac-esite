#!/usr/bin/env node
'use strict'
/**
 * LINEAR ARŞİV ADIMI (karar 187, REC-433). Kapanmış (completed / canceled, kopya dahil) ve `GUN_ESIGI`
 * günden eski Linear kayıtlarını ARŞİVLER. Linear ücretsiz planı 250 arşivlenmemiş kayıtta doluyor
 * ve dolunca yeni alt kayıt açılamıyor; bu yüzden düzenli arşiv sistem bakımıdır, iş değil.
 *
 * ⭐GEÇERLİ ŞARTLAR (Ops emri):
 *  - Yeni depo sırrı YOK: `LINEAR_API_KEY` yalnız YEREL ortam değişkeni (depo PUBLIC; anahtar hiçbir
 *    yere basılmaz). Anahtar yoksa sessiz çık ("ölçülemedi"), oturumu bloklama.
 *  - LLM YOK, Claude kotası harcamaz: yalnız iki GraphQL çağrı türü (liste + `issueArchive`).
 *  - GÜNDE EN ÇOK BİR KEZ: gün damgası `~/.claude/linear-arsiv/gun.txt`; başarısız koşum damga
 *    yazmaz, ertesi oturumda yeniden denenir. Aynı anda iki oturum koşmasın diye 15 dk kilidi var.
 *  - GERİ ALINABİLİR, SİLME YOK: arşiv Linear'da geri alınır (`issueUnarchive`); arşivlenen her kaydın
 *    kimliği `~/.claude/linear-arsiv/gunluk.jsonl`'a yazılır.
 *
 * NEDEN AYRI BETİK (seçim, Ops'a bildirildi): mevcut Linear çağıran kancalar (`board-brief.cjs`,
 * `linear-yeni-yorum.cjs`) UserPromptSubmit'te koşar ve 3 sn zaman aşımlı SESSİZ okuyuculardır; yazma
 * eylemi onlara eklenirse okuyucunun "fail-open ve sessiz" sözleşmesi bozulur, üstelik `board-brief.cjs`
 * ALTYAPI'nın şeridindedir. Tetik `session-board.cjs`'te (SessionStart), kopuk ve gizli süreçle.
 *
 * Kullanım:  node scripts/board/linear-arsiv.cjs            → KURU koşum (yalnız listeler)
 *            node scripts/board/linear-arsiv.cjs --calistir → arşivler (günde bir kez damgalar)
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const GUN_ESIGI = 2
const SAYFA = 100
const TAVAN = 300
const PARCA = 20
const KILIT_DAKIKA = 15
const ZAMAN_ASIMI_MS = 15000
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function dizin() {
  return process.env.VENTHUB_LINEAR_ARSIV_DIZIN || path.join(os.homedir(), '.claude', 'linear-arsiv')
}

/** `now` ISO dizesi; sınır = now − gün. Test için `now` dışarıdan verilir. */
function sinirTarihi(now, gun = GUN_ESIGI) {
  return new Date(new Date(now).getTime() - gun * 86400000).toISOString()
}

function listeSorgusu(sinir) {
  return {
    query:
      'query($sinir: DateTimeOrDuration!, $n: Int!){ issues(first: $n, filter: { state: { type: { in: ["completed","canceled"] } }, ' +
      'or: [ { completedAt: { lt: $sinir } }, { canceledAt: { lt: $sinir } } ] }) { nodes { id identifier } } }',
    variables: { sinir, n: SAYFA },
  }
}

function arsivMutasyonu(idler) {
  const gecersiz = idler.filter((i) => !UUID.test(i))
  if (gecersiz.length) throw new Error('kayit kimligi UUID degil')
  return {
    query: 'mutation{ ' + idler.map((id, i) => `a${i}: issueArchive(id: "${id}") { success }`).join(' ') + ' }',
  }
}

function parcala(liste, n) {
  const out = []
  for (let i = 0; i < liste.length; i += n) out.push(liste.slice(i, i + n))
  return out
}

async function graphql(anahtar, govde, fetchFn) {
  const f = fetchFn || fetch
  const r = await f('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: anahtar },
    body: JSON.stringify(govde),
    signal: AbortSignal.timeout(ZAMAN_ASIMI_MS),
  })
  if (!r.ok) throw new Error('Linear HTTP ' + r.status)
  const j = await r.json()
  if (j.errors) throw new Error('Linear sorgu hatasi: ' + String(j.errors[0] && j.errors[0].message).slice(0, 120))
  return j.data
}

/**
 * @returns {Promise<{ arsivlenen: {id:string, identifier:string}[], aday: number, hata?: string }>}
 * `kuru` doğruysa yazma çağrısı YAPILMAZ.
 */
async function calistir({ anahtar, now, kuru, fetchFn }) {
  if (!anahtar) return { arsivlenen: [], aday: 0, hata: 'LINEAR_API_KEY yok' }
  const sinir = sinirTarihi(now)
  const arsivlenen = []
  let toplamAday = 0
  try {
    for (let tur = 0; tur < 3 && arsivlenen.length < TAVAN; tur += 1) {
      const veri = await graphql(anahtar, listeSorgusu(sinir), fetchFn)
      const adaylar = (veri.issues && veri.issues.nodes) || []
      if (tur === 0) toplamAday = adaylar.length
      if (adaylar.length === 0) break
      if (kuru) {
        arsivlenen.push(...adaylar)
        break
      }
      for (const grup of parcala(adaylar, PARCA)) {
        const cevap = await graphql(anahtar, arsivMutasyonu(grup.map((g) => g.id)), fetchFn)
        grup.forEach((g, i) => {
          if (cevap['a' + i] && cevap['a' + i].success) arsivlenen.push({ id: g.id, identifier: g.identifier })
        })
      }
      // Arşivlenenler bir sonraki sorguda çıkmaz; hiçbiri arşivlenemediyse döngüyü kır (sonsuz döngü koruması).
      if (adaylar.length < SAYFA) break
    }
    return { arsivlenen, aday: toplamAday }
  } catch (e) {
    return { arsivlenen, aday: toplamAday, hata: e && e.message ? e.message : 'bilinmeyen hata' }
  }
}

function bugunDamgasi(now) {
  return String(new Date(now).toISOString()).slice(0, 10)
}

/** Bugün için damga var mı, ya da başka bir oturum 15 dk içinde başlattı mı? */
function gunlukGerekli(now, dir = dizin()) {
  try {
    const gun = fs.readFileSync(path.join(dir, 'gun.txt'), 'utf8').trim()
    if (gun === bugunDamgasi(now)) return false
  } catch { /* damga yok: gerekli */ }
  try {
    const basladi = Number(fs.readFileSync(path.join(dir, 'basladi.txt'), 'utf8').trim())
    if (Number.isFinite(basladi) && new Date(now).getTime() - basladi < KILIT_DAKIKA * 60000) return false
  } catch { /* kilit yok */ }
  return true
}

function damgaYaz(now, dir = dizin()) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'gun.txt'), bugunDamgasi(now) + '\n')
}

function kilitYaz(now, dir = dizin()) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'basladi.txt'), String(new Date(now).getTime()) + '\n')
}

function gunlugeYaz(now, sonuc, dir = dizin()) {
  fs.mkdirSync(dir, { recursive: true })
  const satir = JSON.stringify({ t: new Date(now).toISOString(), aday: sonuc.aday, arsivlenen: sonuc.arsivlenen, hata: sonuc.hata || null })
  fs.appendFileSync(path.join(dir, 'gunluk.jsonl'), satir + '\n')
}

/**
 * SessionStart tetiği: gerekliyse betiği KOPUK ve gizli başlatır. Anahtar yoksa ya da bugün koşulduysa
 * hiçbir şey yapmaz. @returns {boolean} başlatıldı mı
 */
function gunlukBaslat({ anahtar, now = new Date().toISOString(), baslat, dir = dizin() }) {
  if (!anahtar || typeof baslat !== 'function') return false
  if (!gunlukGerekli(now, dir)) return false
  kilitYaz(now, dir)
  baslat(__filename, ['--calistir'])
  return true
}

module.exports = {
  GUN_ESIGI,
  sinirTarihi,
  listeSorgusu,
  arsivMutasyonu,
  parcala,
  calistir,
  gunlukGerekli,
  gunlukBaslat,
  damgaYaz,
  gunlugeYaz,
}

if (require.main === module) {
  ;(async () => {
    const now = new Date().toISOString()
    const anahtar = process.env.LINEAR_API_KEY || ''
    const kuru = !process.argv.includes('--calistir')
    const s = await calistir({ anahtar, now, kuru })
    if (s.hata && !s.arsivlenen.length) {
      console.log('LINEAR ARSIV: OLCULEMEDI (' + s.hata + ')')
      return
    }
    if (kuru) {
      console.log('LINEAR ARSIV (kuru koşum): ' + s.arsivlenen.length + ' aday' + (s.arsivlenen.length ? ' — ' + s.arsivlenen.slice(0, 10).map((a) => a.identifier).join(', ') : ''))
      return
    }
    gunlugeYaz(now, s)
    if (!s.hata) damgaYaz(now)
    console.log('LINEAR ARSIV: ' + s.arsivlenen.length + '/' + s.aday + ' kayit arsivlendi' + (s.hata ? ' (kismi, hata: ' + s.hata + ')' : ''))
  })().catch(() => process.exit(0))
}
