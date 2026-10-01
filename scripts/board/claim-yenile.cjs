#!/usr/bin/env node
/**
 * CLAIM YENİLEME — SessionStart (startup/resume) açılışında, KENDİ süresi dolmuş şerit talebini yeniden almak.
 *
 * NİÇİN VAR (Ops 09-30): makine kapanıp pencereler `resume` ile geri gelince talep kirası (4 saat) çoktan dolmuştur.
 * Pano o şeridi "BAYAT/SAHİPSİZ" gösterir, `findConflict` onu artık korumaz ve pencere şerit adını/adını taşımasına
 * rağmen panoda yokmuş gibi davranır; ajan claim'i elle tazelemeyi HATIRLAMAK zorundadır (bu depoda "hatırlamaya bağlı
 * adım"ın tipik biçimi). Burası o adımı mekanizmaya çevirir: aynı şerit + aynı desenlerle yeniden al.
 *
 * KURALLAR (her biri bir kapı testinde ölçülür — src/__tests__/conformance/claim-yenile.test.ts):
 *  · TEK SAHİPLİK: bir sid YALNIZ kendi geçmişini yeniler (`board.gecmisTalep(sid)`); başkasının dosyasına dokunulmaz.
 *  · GEÇMİŞİ OLMAYAN oturuma dokunulmaz (claim'siz pencere şerit "icat edilerek" claim'lenmez).
 *  · BİLİNÇLİ KAPANIŞ (release) yenilenmez: şerit bilerek bırakıldıysa sahibi olmayan bir claim geri getirmek yanlıştır.
 *  · Talep hâlâ CANLI ise (kira dolmamış) yapılacak bir şey yoktur; kalp atışı `board-brief`in işi.
 *  · ÇAKIŞMA: canlı BAŞKA bir oturum aynı şerit adını ya da çakışan bir deseni tutuyorsa ALINMAZ; sebep UYARI satırı olur.
 *    Muhafazakâr: emin olmadığında "çakışır" (yanlış-pozitif yalnız uyarıdır, yanlış-negatif iki sahiptir).
 *  · Yeniden alma `exact: true` claim'idir: geçmişte birleşmiş TAM globlar aynen döner, kıdem (ilk ts) korunur.
 *  · FAIL-OPEN: her hata → `{islem:'hata'}`; çağıran (kanca) oturum açılışını ASLA bozmaz.
 *
 * SAF KARAR + İNCE UYGULAMA: `karar()` saf (girdi: geçmiş + canlı talepler), `yenile()` board'u okur/yazar.
 * ⚠BİLİNEN SINIR (dürüst liste): iki pencere AYNI ANDA açılıp aynı şeridi yenilemeye kalkarsa ikisi de "canlı başka
 * sahip yok" görebilir (kontrol-yazma arası yarış penceresi, milisaniyeler). Pano bir KİLİT değildir (board.cjs başlığı);
 * ikinci yazımı `who`daki "AYNI ŞERİT ADI" uyarısı görünür kılar. Sessiz kalmaz ama önlenmez.
 */

/** Yenilemenin geçerli olduğu SessionStart kaynakları. clear/compact/fork'ta dokunulmaz (talep zaten yaşıyor / sid yeni). */
const YENILE_KAYNAKLARI = new Set(['startup', 'resume'])

/** board.cjs'in adsız talep için yazdığı yer tutucu — gerçek bir şerit adı değildir, ada göre çakışma sayılmaz. */
const YER_TUTUCU = 'lane'

const kucuk = (s) => String(s == null ? '' : s).trim().toLowerCase()

/**
 * SAF karar.
 * @param {object} p
 * @param {string} p.sid
 * @param {object} p.gecmis `board.gecmisTalep(sid)` sonucu
 * @param {Array<{sid:string,lane:string,globs:string[],yasDk?:number}>} p.canli `board.liveClaims()` (kendi sid dahil olabilir)
 * @param {(a:string,b:string)=>boolean} p.cakisir `board.globCakisir`
 * @returns {{islem:'dokunma'|'yenile'|'uyari', sebep:string, lane?:string, globs?:string[], sahip?:object, glob?:string}}
 */
function karar({ sid, gecmis, canli, cakisir }) {
  if (!gecmis || gecmis.durum === 'yok') return { islem: 'dokunma', sebep: 'gecmis-yok' }
  if (gecmis.durum === 'birakildi') return { islem: 'dokunma', sebep: 'birakilmis' }
  if (gecmis.durum !== 'talep') return { islem: 'dokunma', sebep: 'bilinmeyen-durum' }
  if (gecmis.canli) return { islem: 'dokunma', sebep: 'zaten-canli' }
  const globs = Array.isArray(gecmis.globs) ? gecmis.globs.filter((g) => typeof g === 'string' && g.trim()) : []
  if (globs.length === 0) return { islem: 'dokunma', sebep: 'glob-yok' }
  const digerleri = (canli || []).filter((c) => c && c.sid !== sid)
  const lane = String(gecmis.lane || YER_TUTUCU)
  if (kucuk(lane) !== YER_TUTUCU) {
    const ayniAd = digerleri.find((c) => kucuk(c.lane) === kucuk(lane))
    if (ayniAd) return { islem: 'uyari', sebep: 'ayni-serit-adi', lane, globs, sahip: ayniAd }
  }
  for (const c of digerleri) {
    for (const mine of globs) {
      for (const theirs of c.globs || []) {
        if (cakisir(mine, theirs)) return { islem: 'uyari', sebep: 'cakisan-desen', lane, globs, sahip: c, glob: `${mine} ~ ${theirs}` }
      }
    }
  }
  return { islem: 'yenile', sebep: 'kira-dolmus', lane, globs }
}

/** Tek satırlık bağlam metni (additionalContext'e girer); kancadaki diğer uyarı satırları gibi ASCII gövde + `⚠` işareti. */
function satir(sonuc, kaynak) {
  if (sonuc.islem === 'yenile') {
    return `CLAIM YENILENDI (${kaynak}): ${sonuc.lane} — kira dusmustu, AYNI serit + AYNI desenlerle yeniden alindi (${sonuc.globs.join(', ')}).\n`
  }
  if (sonuc.islem === 'uyari') {
    const s = sonuc.sahip || {}
    const kim = `${s.lane || '?'} [${String(s.sid || '').slice(0, 8)}${typeof s.yasDk === 'number' ? `, ${s.yasDk}dk once` : ''}]`
    const ne = sonuc.sebep === 'ayni-serit-adi'
      ? `ayni serit adini (${sonuc.lane}) CANLI baska oturum tutuyor`
      : `desenlerin cakisiyor (${sonuc.glob}) — CANLI baska oturum tutuyor`
    return `⚠CLAIM YENILENMEDI (${kaynak}): ${ne}: ${kim}. Serit talebin DUSMUS durumda; panoyu oku (node scripts/board/board.cjs who), cakismayi coz, sonra claim al.\n`
  }
  return ''
}

/**
 * Board'u okuyup karar verir, gerekiyorsa claim yazar. ASLA fırlatmaz.
 * @param {object} board `require('./board.cjs')` (test enjekte edebilir)
 * @param {string} sid
 * @param {{source?:string, simdi?:number}} [o]
 * @returns {{islem:string, sebep:string, satir:string, lane?:string, globs?:string[]}}
 */
function yenile(board, sid, o = {}) {
  const kaynak = o.source || 'startup'
  try {
    if (!YENILE_KAYNAKLARI.has(kaynak)) return { islem: 'dokunma', sebep: 'kaynak-disi', satir: '' }
    if (!sid || typeof sid !== 'string') return { islem: 'dokunma', sebep: 'sid-yok', satir: '' }
    const simdi = typeof o.simdi === 'number' ? o.simdi : Date.now()
    const gecmis = board.gecmisTalep(sid, simdi)
    // Geçmiş yoksa/bırakılmışsa/canlıysa panonun geri kalanını OKUMAYA gerek yok (açılışı yavaşlatma).
    if (gecmis.durum !== 'talep' || gecmis.canli) {
      const k = karar({ sid, gecmis, canli: [], cakisir: board.globCakisir })
      return { ...k, satir: '' }
    }
    const k = karar({ sid, gecmis, canli: board.liveClaims(simdi), cakisir: board.globCakisir })
    if (k.islem === 'yenile') {
      board.append(sid, {
        type: 'claim', lane: k.lane, globs: k.globs, exact: true,
        yenileme: kaynak, // olay dosyasında elle claim ile AYIRT edilir
      })
    }
    return { islem: k.islem, sebep: k.sebep, lane: k.lane, globs: k.globs, satir: satir(k, kaynak) }
  } catch (e) {
    return { islem: 'hata', sebep: String((e && (e.code || e.message)) || e).slice(0, 120), satir: '' }
  }
}

module.exports = { YENILE_KAYNAKLARI, karar, satir, yenile }
