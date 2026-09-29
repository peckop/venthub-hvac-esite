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
 * konuşma kaydından Recep'in son 30 mesajını ve son 5 cevabı ÖZETSİZ, modelsiz
 * `memory/son-konusma-<sid>.md` dosyasına yazar; SessionStart(compact) (session-board.cjs) onu
 * durum bloğunun yanında ajanın önüne koyar.
 *
 * ── NEDEN İKİ OLAY: PreCompact + Stop (Ops 09-29, ölçüldü) ──
 *
 * İlk sürüm yalnız PreCompact'teydi ve iki gerçek compact'te (Ops ve ARAÇ, 09-29 07:00Z / 07:02Z)
 * HİÇ dosya yazmadı. Gerçek compact'ler ~1 sn sürdü (JEV eklentisinin `session.compact` işlevi
 * sıkıştırmayı kendisi yapıyor); yerleşik yolda (tek kullanımlık oturumda `claude -p /compact`,
 * 43 sn, compactSummary satırı var) kanca koştu ve dosyayı yazdı. En olası sebep: PreCompact komut
 * kancaları yerleşik yolun parçası, JEV yolunda koşmuyor (kesin kanıt değil: kancanın kendi
 * çalışma izi yok). Bu yüzden döküm ARTIK Stop'ta da yenilenir: her cevap bitiminde, kayıttan eskiyse,
 * sessizce. Stop, compact yoluna bağlı değildir ve en son cevabı da içerir. PreCompact kaydı yerleşik
 * yol için kalır. Dosyanın `yazildi:` saati compact sınırından ESKİ olmalı — ölçüm bu.
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
const SUPURME_GUN = 14 // başka oturumların bayat dökümü bu kadar gün sonra silinir

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

function dokumUret(kayitYolu, simdi = new Date(), kaynak = 'PreCompact') {
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
      `yazildi: ${simdi.toISOString()} · kaynak ${kaynak} · Recep mesajı ${son.length} · cevap ${Math.min(CEVAP_SAYI, son.length)}\n\n` +
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

/**
 * SessionStart için KISA enjeksiyon (REC-433 alt işi, Ops 09-29). Bir SessionStart kancasının çıktısı
 * 10.000 karakteri aşınca bağlama yalnız ilk ~2.000 karakter girer; 12.000'lik `enjeksiyon` tek başına
 * bu sınırı aşıyordu. Burada: yalnız Recep'in SON mesajları (sonN), her biri mesajTavan'a kadar AYNEN,
 * toplam tavan'ı aşmaz; cevaplar ve eski mesajlar dosyada kalır, yolu satırda yazılır.
 */
function enjeksiyonKisa(memoryDir, sid, { sonN = 6, mesajTavan = 600, tavan = 3600 } = {}) {
  const y = dosyaYolu(memoryDir, sid)
  if (!sid || !fs.existsSync(y)) return null
  const s = fs.readFileSync(y, 'utf8')
  const bas = s.split('\n').slice(0, 2).join('\n')
  const govde = s.split('\n').slice(2).join('\n')
  const mesajlar = govde
    .split(/^### Recep \(/m)
    .slice(1)
    .map((p) => {
      const ust = p.indexOf(')\n')
      const zaman = ust > -1 ? p.slice(0, ust) : 'saat yok'
      let metin = ust > -1 ? p.slice(ust + 2) : p
      const cevap = metin.indexOf('\n#### Cevap')
      if (cevap > -1) metin = metin.slice(0, cevap)
      metin = metin.trim()
      if (metin.length > mesajTavan) metin = metin.slice(0, mesajTavan) + ' […mesaj kırpıldı, tamamı dosyada]'
      return `### Recep (${zaman})\n${metin}\n`
    })
    .slice(-sonN)
  const not = `(yalnız Recep'in son ${mesajlar.length} mesajı; cevaplar ve eski kısım dosyada — tamamı: ${path.basename(y)})\n`
  let kabul = mesajlar
  const topla = (l) => bas.length + not.length + l.reduce((n, m) => n + m.length + 1, 0)
  while (kabul.length > 1 && topla(kabul) > tavan) kabul = kabul.slice(1)
  return bas + '\n' + not + kabul.join('\n')
}

/** Stop turunda dökümü yenilemek gerekir mi: dosya yok ya da kayıttan eski. */
function dokumGerekli(kayitYolu, hedef) {
  try {
    return !fs.existsSync(hedef) || fs.statSync(hedef).mtimeMs < fs.statSync(kayitYolu).mtimeMs
  } catch {
    return true
  }
}

/** Her oturum kendi dosyasını bırakır; SUPURME_GUN'den eski ve başkasına ait dökümler silinir. */
function eskiDokumleriSil(memoryDir, sid, simdi = Date.now()) {
  try {
    const kendi = path.basename(dosyaYolu(memoryDir, sid))
    for (const ad of fs.readdirSync(memoryDir)) {
      if (ad === kendi || !/^son-konusma-.+\.md$/.test(ad)) continue
      const y = path.join(memoryDir, ad)
      if (simdi - fs.statSync(y).mtimeMs > SUPURME_GUN * 86_400_000) fs.unlinkSync(y)
    }
  } catch {
    // temizlik dökümü engellemez
  }
}

function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    girdi = {}
  }
  // Stop her turun sonunda koşar ve sessizdir; PreCompact'te tek satır çıktı verilir.
  const olay = girdi.hook_event_name === 'Stop' ? 'Stop' : 'PreCompact'
  const yaz = (m) => {
    if (olay !== 'Stop') process.stdout.write(m)
  }
  try {
    const sid = girdi.session_id || ''
    const kayit = girdi.transcript_path || ''
    if (!sid || !kayit || !fs.existsSync(kayit)) {
      yaz('[son-konusma] kayit yolu yok — dokum yazilmadi.\n')
      return
    }
    const kapi = require(path.join(__dirname, 'precompact-durum-kapisi.cjs'))
    const proje = kapi.projeDiziniBul(sid, kayit)
    if (!proje) {
      yaz('[son-konusma] proje dizini cozulemedi — dokum yazilmadi.\n')
      return
    }
    const memoryDir = path.join(proje, 'memory')
    const hedef = dosyaYolu(memoryDir, sid)
    if (olay === 'Stop' && !dokumGerekli(kayit, hedef)) return
    // Yarım dosya SessionStart'ın okuduğu yerde kalmasın: önce geçici dosya, sonra yeniden adlandır.
    const gecici = path.join(memoryDir, `son-konusma-${sid}.yaz.md`)
    fs.writeFileSync(gecici, dokumUret(kayit, new Date(), olay))
    fs.renameSync(gecici, hedef)
    eskiDokumleriSil(memoryDir, sid)
    yaz(`[son-konusma] dokum yazildi: ${path.basename(hedef)}\n`)
  } catch (e) {
    yaz(`[son-konusma] dokum BASARISIZ (${(e && (e.code || e.message)) || 'bilinmeyen'}) — compact engellenmedi.\n`)
  }
}

module.exports = { sirSuz, turlar, dokumUret, enjeksiyon, enjeksiyonKisa, dosyaYolu, dokumGerekli, eskiDokumleriSil, RECEP_SAYI, CEVAP_SAYI, ENJEKTE_UST_SINIR }
if (require.main === module) main()
