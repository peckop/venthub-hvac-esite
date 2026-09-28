#!/usr/bin/env node
'use strict'
/**
 * SON KONUŞMA DÖKÜMÜ — compact'te konuşmanın son kısmı AYNEN korunur (Ops 09-28, Recep).
 *
 * ── NİÇİN VAR ──
 *
 * JEV sıkıştırması %25 azaltma bulamazsa Claude Code'un yerleşik özetleyicisine devrediyor; hangisinin
 * koşacağını Recep önceden bilemiyor. Özet (JEV ya da yerleşik) Recep'in kelimelerini değiştirir ya
 * da atar; durum dosyası ise yalnız ajanın yazmayı hatırladığını taşır. Bu kanca ikisinden bağımsız:
 * PreCompact anında konuşma kaydından Recep'in son 30 mesajını ve son 5 cevabı ÖZETSİZ, modelsiz
 * `memory/son-konusma-<sid>.md` dosyasına yazar; SessionStart(compact) (session-board.cjs) onu
 * durum bloğunun yanında ajanın önüne koyar.
 *
 * ── NE "RECEP MESAJI" SAYILIR (ölçüldü 09-28, bu oturumun kaydı) ──
 *
 * `type:user`, yan ajan değil, `isMeta`/`isCompactSummary` değil, içerik düz metin (tool_result
 * değil). Bunların arasında `<command-name>`, `<local-command-stdout>`, `<task-notification>` ile
 * başlayanlar sistem üretimidir, atılır. Pencerelerden gelen mesajlar bu satırlarda DEĞİL (ekler),
 * yani kendiliğinden dışarıda kalır. Metnin içindeki `<system-reminder>` blokları silinir.
 *
 * ── CEVAP ──
 *
 * Her Recep mesajından sonraki SON ana konuşma metni o turun cevabıdır. 09-28'den beri compact
 * sonrası kayıtta eski cevapların kopyaları var (usage=0); aynı metin iki kez sayılmasın diye
 * mesaj kimliği + metin ile tekilleştirilir.
 *
 * ── SIR SÜZGECİ ──
 *
 * Hafıza klasörü ayrı bir depo; dosya yine de .gitignore'da tutulmalı ve içinde anahtar kalmamalı.
 * Bilinen anahtar biçimleri ve `ANAHTAR=değer` kalıbı `[SIR-SUZULDU]` ile değiştirilir.
 *
 * GÜVENLİK: hiçbir durumda compact'i engellemez (exit 0); hata yalnız tek satır uyarıdır.
 */
const fs = require('fs')
const path = require('path')

const RECEP_SAYI = 30
const CEVAP_SAYI = 5
const DOSYA_UST_SINIR = 60_000 // dosyada tutulan
const ENJEKTE_UST_SINIR = 12_000 // açılışta ajanın önüne konan (Ops: ~12k)
const OKUMA_BAYT = 16 * 1024 * 1024

const SISTEM_ONEKLERI = ['<command-name>', '<command-message>', '<local-command-stdout>', '<local-command-caveat>', '<task-notification>']

const SIR_DESENLERI = [
  /\bsk-[A-Za-z0-9_-]{16,}/g, // OpenAI/Anthropic tarzı
  /\bsk-ant-[A-Za-z0-9_-]{16,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/g, // GitHub
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  /\blin_api_[A-Za-z0-9]{20,}/g, // Linear
  /\bnvapi-[A-Za-z0-9_-]{20,}/g, // NVIDIA
  /\bAKIA[0-9A-Z]{16}\b/g, // AWS
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g, // Slack
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, // JWT
  /\bBearer\s+[A-Za-z0-9._~+/-]{16,}=*/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
]
// Yalnız BÜYÜK HARFLİ ortam değişkeni adları: `/i` ile "parola: kısa" gibi düz Türkçe cümleler de
// siliniyordu (testte yakalandı) — Recep'in sözünü bozmak, dökümün var oluş sebebine aykırı.
const ANAHTAR_DEGER = /\b([A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD)[A-Z0-9_]*)\s*[=:]\s*("[^"\n]{4,}"|'[^'\n]{4,}'|[^\s"'`]{4,})/g

function sirSuz(metin) {
  let s = String(metin)
  for (const d of SIR_DESENLERI) s = s.replace(d, '[SIR-SUZULDU]')
  s = s.replace(ANAHTAR_DEGER, (_, ad) => ad + '=[SIR-SUZULDU]')
  return s
}

function temizle(metin) {
  return String(metin)
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .trim()
}

function metinOf(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return null
  if (content.some((p) => p && p.type === 'tool_result')) return null
  const t = content.filter((p) => p && p.type === 'text').map((p) => p.text || '')
  return t.length ? t.join('\n') : null
}

function kayitSatirlari(kayitYolu) {
  const boy = fs.statSync(kayitYolu).size
  const n = Math.min(boy, OKUMA_BAYT)
  const tampon = Buffer.alloc(n)
  const fd = fs.openSync(kayitYolu, 'r')
  try {
    fs.readSync(fd, tampon, 0, n, boy - n)
  } finally {
    fs.closeSync(fd)
  }
  const out = []
  for (const l of tampon.toString('utf8').split('\n')) {
    try {
      out.push(JSON.parse(l))
    } catch {
      // kesilmiş ilk satır ya da boş satır
    }
  }
  return out
}

/** Kayıttan turlar: [{ recep, zaman, cevap }] — eski → yeni. */
function turlar(satirlar) {
  const liste = []
  const gorulen = new Set()
  const turAnahtari = new Map() // compact sonrası Recep mesajlarının da kopyası var (ölçüldü: 33)
  let cari = null
  for (const o of satirlar) {
    if (!o || o.isSidechain) continue
    // İş sürerken gelen mesajlar ek (attachment) olarak düşer (ölçüldü 09-28): pencere mesajı ve
    // bildirim turu KAPATIR (sonraki cevap Recep'e ait değil); düz `prompt` ise Recep'in iş
    // sürerken yazdığı mesajdır ve kendisi bir turdur.
    let ham = null
    if (o.type === 'user' && o.isMeta) {
      // Boşta gelen pencere mesajı `isMeta` kullanıcı satırıdır (ölçüldü 09-28) → turu kapatır.
      const m = metinOf(o.message && o.message.content) || ''
      if (/cross-session-message|agent-message|task-notification|Another Claude session/.test(m)) cari = null
      continue
    }
    if (o.type === 'attachment' && o.attachment && o.attachment.type === 'queued_command') {
      const a = o.attachment
      const p = typeof a.prompt === 'string' ? a.prompt : ''
      if (a.commandMode !== 'prompt' || /cross-session-message|agent-message|task-notification/.test(p)) {
        cari = null
        continue
      }
      ham = p
    } else if (o.type === 'user' && !o.isMeta && !o.isCompactSummary) {
      ham = metinOf(o.message && o.message.content)
    }
    if (ham != null) {
      const t = temizle(ham)
      if (!t) continue
      if (SISTEM_ONEKLERI.some((p) => t.startsWith(p))) {
        cari = null
        continue
      }
      const a = (o.timestamp || '') + '|' + t
      cari = turAnahtari.get(a)
      if (!cari) {
        cari = { recep: t, zaman: o.timestamp || '', cevap: '' }
        turAnahtari.set(a, cari)
        liste.push(cari)
      }
      continue
    }
    if (o.type === 'assistant' && cari) {
      const t = metinOf(o.message && o.message.content)
      if (!t || !t.trim()) continue
      const anahtar = ((o.message && o.message.id) || '') + '|' + t
      if (gorulen.has(anahtar)) continue
      gorulen.add(anahtar)
      cari.cevap = t.trim() // turun SON metni kazanır
    }
  }
  return liste
}

function dokumUret(kayitYolu, simdi = new Date()) {
  const t = turlar(kayitSatirlari(kayitYolu))
  const son = t.slice(-RECEP_SAYI)
  const cevapBaslangic = son.length - CEVAP_SAYI
  const parcalar = son.map((tur, i) => {
    let p = `### Recep (${tur.zaman || 'saat yok'})\n${tur.recep}\n`
    if (i >= cevapBaslangic && tur.cevap) p += `\n#### Cevap\n${tur.cevap}\n`
    return p
  })
  let govde = parcalar.join('\n')
  if (govde.length > DOSYA_UST_SINIR) govde = '…(eski kısım kesildi)\n' + govde.slice(-DOSYA_UST_SINIR)
  return sirSuz(
    `# Son konuşma dökümü (özetsiz)\n` +
      `yazildi: ${simdi.toISOString()} · Recep mesajı ${son.length} · cevap ${Math.min(CEVAP_SAYI, son.length)}\n\n` +
      govde,
  )
}

function dosyaYolu(memoryDir, sid) {
  return path.join(memoryDir, `son-konusma-${sid}.md`)
}

/** Açılış enjeksiyonu: en yeni kısım kalır, üst sınırı aşan ESKİ kısım kesilir. */
function enjeksiyon(memoryDir, sid, sinir = ENJEKTE_UST_SINIR) {
  const y = dosyaYolu(memoryDir, sid)
  if (!sid || !fs.existsSync(y)) return null
  const s = fs.readFileSync(y, 'utf8')
  const bas = s.split('\n').slice(0, 2).join('\n')
  if (s.length <= sinir) return s
  return bas + '\n…(eski kısım kesildi — tamamı: ' + path.basename(y) + ')\n' + s.slice(-(sinir - bas.length - 80))
}

function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    girdi = {}
  }
  try {
    const sid = girdi.session_id || ''
    const kayit = girdi.transcript_path || ''
    if (!sid || !kayit || !fs.existsSync(kayit)) {
      process.stdout.write('[son-konusma] kayit yolu yok — dokum yazilmadi.\n')
      return
    }
    const kapi = require(path.join(__dirname, 'precompact-durum-kapisi.cjs'))
    const proje = kapi.projeDiziniBul(sid, kayit)
    if (!proje) {
      process.stdout.write('[son-konusma] proje dizini cozulemedi — dokum yazilmadi.\n')
      return
    }
    const memoryDir = path.join(proje, 'memory')
    fs.writeFileSync(dosyaYolu(memoryDir, sid), dokumUret(kayit))
    process.stdout.write(`[son-konusma] dokum yazildi: ${path.basename(dosyaYolu(memoryDir, sid))}\n`)
  } catch (e) {
    process.stdout.write(`[son-konusma] dokum BASARISIZ (${(e && (e.code || e.message)) || 'bilinmeyen'}) — compact engellenmedi.\n`)
  }
}

module.exports = { sirSuz, turlar, dokumUret, enjeksiyon, dosyaYolu, RECEP_SAYI, CEVAP_SAYI, ENJEKTE_UST_SINIR }
if (require.main === module) main()
