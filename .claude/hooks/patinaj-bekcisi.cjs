#!/usr/bin/env node
'use strict'

/**
 * PostToolUse hook — PATİNAJ BEKÇİSİ (REC-467, ARC-109 satır 5).
 *
 * NİÇİN: ajan aynı komutu aynı girdiyle tekrar tekrar deneyip aynı sonucu aldığında (patinaj) en pahalı hatalardan
 * birine düşer ve hiçbir yerde ölçülmüyordu. WrongStack `core` içinde bir `agent-loop-detector` var, ama o yalnız
 * WrongStack ajan çalışma zamanında çalışır; Claude Code yolunda hiçbir karşılığı yoktu. Yalnız FİKİR alındı.
 *
 * NE YAPAR: her araç çağrısının imzasını (araç adı + normalize girdi) ve sonuç özetini oturum başına küçük bir
 * halka kütüğe yazar. Son PENCERE çağrı içinde AYNI girdi ve AYNI sonuç ESIK kez ya da daha çok geçtiyse modele TEK
 * satırlık uyarı verir. ESIK'in katlarında (4, 8, 12 …) yeniden uyarır; arada sessizdir.
 *
 * NE YAPMAZ: BLOKLAMAZ (çıkış her zaman 0), kullanıcıya yazmaz, dosya düzenlemez. Aynı girdi ama FARKLI sonuç
 * (ör. CI bitince `gh pr view` değişti) patinaj değildir ve sayılmaz.
 *
 * FAIL-OPEN VE SESSİZ: stdin okunamaz/bozuksa ya da kütük yazılamazsa hiçbir şey basmaz; bekçi tek bir araç çağrısını
 * bile geciktirmemeli. Ölçüm kanıtı yok = uyarı yok (yanlış alarm "bakılmayan alarma" döner).
 *
 * stdin: { session_id, tool_name, tool_input, tool_response? }
 * Çıkış: DAİMA 0. Uyarı varsa stdout'a { hookSpecificOutput: { hookEventName, additionalContext } } (modele ulaşan
 * kanal; çıkış 0 stderr'i modele gitmez — modele-ilet.cjs başlığındaki ölçüm).
 *
 * Ayarlar (hepsi isteğe bağlı): VENTHUB_PATINAJ_ESIK (varsayılan 4), VENTHUB_PATINAJ_PENCERE (varsayılan 12),
 * VENTHUB_PATINAJ_DIR (varsayılan <geçici dizin>/venthub-patinaj).
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')

const MUAF_ARACLAR = new Set(['TodoWrite', 'ToolSearch', 'ScheduleWakeup'])
const SONUC_KIRPMA = 4000

const sayi = (deger, varsayilan, alt) => {
  const n = Number.parseInt(String(deger ?? ''), 10)
  return Number.isFinite(n) && n >= alt ? n : varsayilan
}

/** Anahtarları sıralı, dizeleri kırpılmış, boşlukları tekleştirilmiş kararlı metin. */
function kararli(deger) {
  if (typeof deger === 'string') return deger.trim().replace(/\s+/g, ' ')
  if (Array.isArray(deger)) return '[' + deger.map(kararli).join(',') + ']'
  if (deger && typeof deger === 'object') {
    return (
      '{' +
      Object.keys(deger)
        .sort()
        .map((k) => JSON.stringify(k) + ':' + kararli(deger[k]))
        .join(',') +
      '}'
    )
  }
  return JSON.stringify(deger ?? null)
}

const ozet = (metin) => crypto.createHash('sha1').update(metin).digest('hex').slice(0, 16)

/** Araç sonucunu kararlı bir metne çevirir; yoksa boş dize (yalnız-girdi sayımı yapılmaz, bkz. calistir). */
function sonucMetni(sonuc) {
  if (sonuc === undefined || sonuc === null) return ''
  const metin = typeof sonuc === 'string' ? sonuc : kararli(sonuc)
  return metin.slice(0, SONUC_KIRPMA)
}

/**
 * Saf çekirdek (test bunu çağırır): kütüğe `kayit` eklenir, uyarı gerekiyorsa metni döner.
 * @param {{ s: string, r: string, ad: string }[]} kutuk önceki kayıtlar (en eski → en yeni)
 * @param {{ s: string, r: string, ad: string }} kayit
 * @param {{ esik: number, pencere: number }} ayar
 * @returns {{ kutuk: object[], uyari: string | null }}
 */
function degerlendir(kutuk, kayit, ayar) {
  const yeni = [...kutuk, kayit].slice(-ayar.pencere)
  const sayim = yeni.filter((k) => k.s === kayit.s && k.r === kayit.r).length
  // Yalnız eşiğin katlarında uyarılır: aynı patinajda her çağrıda tekrar eden uyarı üç turda görmezden gelinir.
  if (sayim < ayar.esik || sayim % ayar.esik !== 0) return { kutuk: yeni, uyari: null }
  return {
    kutuk: yeni,
    uyari:
      `PATINAJ: ${kayit.ad} aynı girdiyle ${sayim} kez çağrıldı ve sonuç hiç değişmedi (son ${yeni.length} çağrı içinde). ` +
      'Değişmeyen bir sonucu bilerek bekliyorsan bu uyarıyı yok say; beklemiyorsan yaklaşımı değiştir ' +
      '(farklı argüman, farklı araç, ya da dur ve nedenini yaz).',
  }
}

function calistir() {
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  const sid = String(girdi.session_id || '')
  const ad = String(girdi.tool_name || '')
  if (!/^[0-9a-f-]{8,64}$/i.test(sid) || !ad || MUAF_ARACLAR.has(ad)) return
  const sonuc = sonucMetni(girdi.tool_response)
  // Sonuç alanı hiç gelmediyse (eski kanca biçimi) "sonuç değişmedi" iddiası ölçülemez: sayma.
  if (!sonuc) return

  const ayar = {
    esik: sayi(process.env.VENTHUB_PATINAJ_ESIK, 4, 2),
    pencere: sayi(process.env.VENTHUB_PATINAJ_PENCERE, 12, 4),
  }
  const dizin = process.env.VENTHUB_PATINAJ_DIR || path.join(os.tmpdir(), 'venthub-patinaj')
  const dosya = path.join(dizin, sid + '.json')
  let kutuk = []
  try {
    fs.mkdirSync(dizin, { recursive: true })
    const okunan = JSON.parse(fs.readFileSync(dosya, 'utf8'))
    if (Array.isArray(okunan)) kutuk = okunan.filter((k) => k && typeof k.s === 'string' && typeof k.r === 'string')
  } catch {
    // ilk çağrı ya da bozuk kütük: boştan başla
  }

  const kayit = { ad, s: ozet(ad + '\u0000' + kararli(girdi.tool_input)), r: ozet(sonuc) }
  const { kutuk: yeni, uyari } = degerlendir(kutuk, kayit, ayar)
  try {
    fs.writeFileSync(dosya, JSON.stringify(yeni))
  } catch {
    // yazılamadı: sayım bir sonraki çağrıda kaybolur, uyarı yine de verilebilir
  }
  if (uyari) {
    try {
      fs.writeSync(
        1,
        JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: uyari } }) + '\n',
      )
    } catch {
      // stdout kapalı: uyarı verilemedi, araç çağrısı etkilenmez
    }
  }
}

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open: bekçi hiçbir koşulda araç çağrısını bozmaz
  }
  process.exit(0)
}

module.exports = { degerlendir, kararli, sonucMetni }
