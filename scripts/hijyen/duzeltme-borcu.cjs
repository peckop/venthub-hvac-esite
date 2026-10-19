'use strict'

/**
 * DÜZELTME ALGILAYICI — işaret + ders borcu (ARC-202, HRT-68, OPS 19 Ekim).
 *
 * ── NİÇİN ──
 * HRT-68 kanıtı: Recep'in "dersler alınmıyor mu" sorusunun gününde OPS'un iki tekrar vakasının dersi
 * sage'de HİÇ yoktu. Ders, hatayı yaşayan pencerenin ELİNDE doğar; o an yazılmazsa kaybolur.
 *
 * ── AKIŞ ──
 *  1. UserPromptSubmit (`duzeltme-isaretle.cjs`): Recep'in KENDİ mesajı düzeltme/tekrar kalıbına
 *     uyuyorsa depo dışı panoya işaret yazılır ve model bağlamında tek satır görür: bu turda davranış
 *     dersi yaz.
 *  2. Stop (`duzeltme-dersi-kapisi.cjs`): turun konuşma kaydında işaretten SONRA bir sage `remember`
 *     (audience.roles DOLU) çağrısı var mı? Varsa işaret silinir. Yoksa DERS BORCU doğar.
 *  3. Borç, sonraki her istemde `⚠DERS-BORCU` satırıyla görünür; ders yazılana kadar kalır.
 *
 * ── KIRMIZI ÖNCE UYARI (OPS kuralı, kart metni) ──
 * Kalıbın yanlış pozitif oranı ölçüldü (kart ARC-202: ~%22). Bu yüzden VARSAYILAN kip UYARIDIR (tur
 * bloklanmaz). `VENTHUB_DUZELTME_KAPISI=blok` kipinde Stop kancası turu bloklar (exit 2, tek kez:
 * `stop_hook_active` ise bir daha bloklanmaz). Oran düşerse OPS kipi değiştirir.
 *
 * ── GARANTİLER ──
 * Çıkış DAİMA 0 (blok kipi hariç); transkript yalnız kuyruk yardımcısıyla okunur (INV-KANCA-KUYRUK-3);
 * ölçemezse sessiz değil "ölçülemedi" yazılır; işaret ve borç depo DIŞINDA (pano). Vana:
 * `VENTHUB_DUZELTME_KAPISI=kapali`.
 */

const fs = require('node:fs')
const path = require('node:path')

const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
/** İşaretin geçerlilik süresi: bundan eski işaret borca dönüşmez (kapanmamış eski oturum gürültüsü). */
const ISARET_OMRU_MS = 6 * 60 * 60 * 1000

function kip(env = process.env) {
  const k = String(env.VENTHUB_DUZELTME_KAPISI || 'uyari').toLowerCase()
  return k === 'blok' || k === 'kapali' ? k : 'uyari'
}

function guvenliSid(sid) {
  return String(sid || 'bilinmiyor').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64)
}

function isaretYolu(sid, pano = PANO) {
  return path.join(pano, `duzeltme-isaret-${guvenliSid(sid)}.json`)
}

function borcYolu(sid, pano = PANO) {
  return path.join(pano, `duzeltme-borc-${guvenliSid(sid)}.json`)
}

function oku(yol) {
  try {
    return JSON.parse(fs.readFileSync(yol, 'utf8'))
  } catch {
    return null
  }
}

function yaz(yol, nesne) {
  fs.mkdirSync(path.dirname(yol), { recursive: true })
  fs.writeFileSync(yol, JSON.stringify(nesne))
}

function sil(yol) {
  try {
    fs.unlinkSync(yol)
  } catch {
    /* yoksa sorun değil */
  }
}

/** Bir konuşma kaydı satırı sage `remember` çağrısı mı ve audience.roles dolu mu? */
function dersYazanCagri(j) {
  if (!j || j.type !== 'assistant' || !j.message || !Array.isArray(j.message.content)) return false
  return j.message.content.some((b) => {
    if (!b || b.type !== 'tool_use' || !b.input) return false
    if (/wrongstack-sage__remember$/.test(String(b.name))) {
      const roller = b.input.audience && b.input.audience.roles
      return Array.isArray(roller) && roller.some((r) => String(r).trim())
    }
    if (b.name === 'Bash' && typeof b.input.command === 'string') {
      const c = b.input.command
      return /wrongstack-sage\s+remember/.test(c) && /\broles\b/.test(c)
    }
    return false
  })
}

/**
 * Satırlar (JSON dizeleri) içinde işaret anından (ms) SONRA ders yazan çağrı var mı.
 * Zaman damgası olmayan satır atlanır (belirsizse "yazılmadı" saymak yerine ölçülemedi dönülmez:
 * damgasız satır zaten ders çağrısı taşımaz).
 */
function dersYazildiMi(satirlar, isaretMs) {
  for (const s of satirlar) {
    if (!s.includes('remember')) continue
    let j
    try {
      j = JSON.parse(s)
    } catch {
      continue
    }
    const t = Date.parse(j.timestamp)
    if (!Number.isFinite(t) || t < isaretMs) continue
    if (dersYazanCagri(j)) return true
  }
  return false
}

/** Kancanın bağlama yazacağı satırlar: bekleyen borç ve (yeni işaret varsa) o turun görevi. */
function satirlar(sid, simdi = Date.now(), pano = PANO) {
  const cikti = []
  const borc = oku(borcYolu(sid, pano))
  if (borc && Number.isFinite(borc.ts)) {
    cikti.push(
      `⚠DERS-BORCU: ${new Date(borc.ts).toISOString().slice(11, 16)} UTC'deki Recep düzeltmesine (${(borc.kaliplar || []).join(', ')}) sage'e davranış dersi YAZILMADI. ` +
        'Şimdi yaz: wrongstack-sage remember, audience.roles=[<ROL>] dolu; yazılana kadar bu satır kalır.',
    )
  }
  const isaret = oku(isaretYolu(sid, pano))
  if (isaret && simdi - isaret.ts < ISARET_OMRU_MS) {
    cikti.push(
      `DUZELTME-ALGILANDI (${(isaret.kaliplar || []).join(', ')}): Recep düzeltme/tekrar uyarısı yazdı. Bu turda davranış dersini sage'e yaz ` +
        '(remember, audience.roles=[<ROL>] dolu); yazılmazsa tur sonunda DERS-BORCU doğar.',
    )
  }
  return cikti
}

module.exports = {
  PANO,
  ISARET_OMRU_MS,
  kip,
  isaretYolu,
  borcYolu,
  oku,
  yaz,
  sil,
  dersYazanCagri,
  dersYazildiMi,
  satirlar,
}
