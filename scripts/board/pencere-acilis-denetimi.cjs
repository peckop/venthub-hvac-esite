#!/usr/bin/env node
'use strict'
/**
 * PENCERE AÇILIŞ DENETİMİ (ARC-245, OPS 3 Kasım) — `start_session` ile departman penceresi açıldıktan sonra.
 *
 * OLAY (3 Kasım): OPS, MEVZUAT penceresini `start_session` ile açtı. Pencere Opus modelle açıldı (departmanlar
 * Sonnet), `settings.local.json` agent anahtarı `ops-pencere` kaldı (pencere kendini OPS sandı), durum dosyası
 * kurulmadı; üstelik `.claude/agents/mevzuat-pencere.md` tanımı hiç yoktu. Recep açılış adımlarının kendiliğinden
 * tetiklenmesini istedi (26 Ekim'de Yetenek penceresinde aynı model hatası olmuştu).
 *
 * NE DENETLER (hepsi SALT-OKUMA): (1) başlık/ad bir departmana SIKI çözülüyor mu (`departmanAdindan`; sıradan
 * oturum başlığı sessiz geçer); (2) o departmanın `.claude/agents/<rol>-pencere.md` tanımı var mı (yeni açılan
 * ağacın KENDİ kopyasında); (3) `start_session`a verilen `model` tanımdaki modelle aynı mı (verilmediyse açanın
 * modelini devralır); (4) açılan ağacın `settings.local.json` `agent` anahtarı `<rol>-pencere` mi;
 * (5) durum dosyası (`*<rol>*durum*.md`) hafıza dizininde var mı (bilgi).
 *
 * NE YAPMAZ: kimliği/izinleri değiştirmez; kapıyı gevşetmez. Eksik agent anahtarı için hazır komutu basar
 * (`pencere-rol-yaz.cjs ... --yaz`). Kendisi YAZAR yalnız vana açıksa (`VENTHUB_PENCERE_ACILIS_YAZ=1`); varsayılan
 * salt-okumadır (ARAÇ kuralı: yeni kanca varsayılan salt-okuma, fail-open, çıktı tavanlı, vanalı).
 *
 * `start_session` sonucu YALNIZ metindir ("Started session … (session_id: local_…)"): worktree yolu ve model
 * dönmez. Bu yüzden aday worktree, `.claude/worktrees` altında son 5 dakikada doğan dizinlerden bulunur;
 * bulunamazsa (oturum henüz oluşturmamış olabilir) komutla sonradan tekrar sorulur.
 *
 * CLI: `node scripts/board/pencere-acilis-denetimi.cjs <rol> [<model>]` (elle tekrar denetim, aynı çekirdek).
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { departmanAdindan } = require('./pencere-adlari.cjs')
const { planla, uygula, tanimModeli } = require('./pencere-rol-yaz.cjs')

const ADAY_PENCERESI_MS = 5 * 60 * 1000
const ADAY_TAVANI = 3
const CIKTI_TAVANI = 1200

/** Tam kimlik birebir eşit ya da takma ad (rakamsız: "sonnet") beklenen kimliğin içinde. */
function modelUyumlu(verilen, beklenen) {
  const v = String(verilen || '').trim().toLowerCase()
  const b = String(beklenen || '').trim().toLowerCase()
  if (!v || !b) return false
  if (v === b) return true
  // Takma ad (sayı içermeyen: "sonnet", "opus"): beklenen kimlik o aileyi içeriyorsa uyumlu.
  return !/\d/.test(v) && b.includes(v)
}

function agentOku(worktree) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(worktree, '.claude', 'settings.local.json'), 'utf8'))
    return j && typeof j.agent === 'string' ? j.agent : ''
  } catch {
    return ''
  }
}

/** `.claude/worktrees` altında son 5 dakikada doğmuş dizinler (en yeni önce, en çok ADAY_TAVANI). */
function adayWorktreeler(worktreeKok, simdi) {
  try {
    return fs.readdirSync(worktreeKok, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => {
        const yol = path.join(worktreeKok, d.name)
        const st = fs.statSync(yol)
        return { yol, t: st.birthtimeMs > 0 ? st.birthtimeMs : st.mtimeMs }
      })
      .filter((x) => simdi - x.t <= ADAY_PENCERESI_MS && simdi >= x.t - 60000)
      .sort((a, b) => b.t - a.t)
      .slice(0, ADAY_TAVANI)
      .map((x) => x.yol)
  } catch {
    return []
  }
}

function durumDosyasiVar(hafizaDizini, rol) {
  const k = rol.toLowerCase()
  const tara = (dizin, derinlik) => {
    let girdiler = []
    try { girdiler = fs.readdirSync(dizin, { withFileTypes: true }) } catch { return false }
    for (const g of girdiler) {
      if (g.isFile() && /durum[^/]*\.md$/i.test(g.name) && g.name.toLowerCase().includes(k)) return true
      if (g.isDirectory() && derinlik > 0 && tara(path.join(dizin, g.name), derinlik - 1)) return true
    }
    return false
  }
  return tara(hafizaDizini, 2)
}

/**
 * SAF karar (yalnız okur; vana açıksa yalnız agent anahtarını yazar).
 * @param {{tool_input?: object}} girdi
 * @param {{depo: string, worktreeKok?: string, simdi?: number, hafizaDizini?: string|null, yaz?: boolean}} o
 * @returns {null | {rol: string, ajan: string, bulgular: string[], komutlar: string[], yazildi: string[]}}
 */
function denetle(girdi, o = {}) {
  const ti = (girdi && girdi.tool_input) || {}
  const rol = departmanAdindan(ti.name) || departmanAdindan(ti.title)
  if (!rol || rol === 'OPS') return null
  const ajan = rol.toLowerCase() + '-pencere'
  const simdi = o.simdi || Date.now()
  const bulgular = []
  const komutlar = []
  const yazildi = []

  // Hedef ağaç: açılan ağacın KENDİ kopyası. Elle cwd + use_worktree:false ise o dizin.
  const ozelDizin = ti.use_worktree === false && typeof ti.cwd === 'string' && ti.cwd ? [path.resolve(ti.cwd)] : null
  const adaylar = ozelDizin || adayWorktreeler(o.worktreeKok || path.join(anaDepo(o.depo), '.claude', 'worktrees'), simdi)

  const tanimDepolari = adaylar.length ? adaylar : [o.depo]
  let istenenModel = ''
  for (const d of tanimDepolari) {
    const tanim = path.join(d, '.claude', 'agents', ajan + '.md')
    if (!fs.existsSync(tanim)) {
      bulgular.push('TANIM YOK: ' + path.join('.claude', 'agents', ajan + '.md') + ' (' + path.basename(d) + '); pencere rolsüz/yanlış rolle açılır')
    } else if (!istenenModel) {
      istenenModel = tanimModeli(tanim)
    }
  }

  if (istenenModel) {
    if (!ti.model) {
      bulgular.push('MODEL VERİLMEDİ: start_session açanın modelini devralır; tanım ' + istenenModel + ' (model parametresiyle yeniden aç)')
    } else if (!modelUyumlu(ti.model, istenenModel)) {
      bulgular.push('MODEL FARKLI: verilen ' + ti.model + ', tanım ' + istenenModel + ' (yeniden aç)')
    }
  }

  if (!adaylar.length) {
    bulgular.push('WORKTREE BULUNAMADI (oturum henüz oluşmamış olabilir): 1 dk sonra `node scripts/board/pencere-acilis-denetimi.cjs ' + rol.toLowerCase() + '` koş')
  }
  for (const wt of adaylar) {
    const mevcut = agentOku(wt)
    if (mevcut === ajan) continue
    const plan = planla({ worktree: wt, rol: ajan, depo: wt })
    const komut = 'node scripts/board/pencere-rol-yaz.cjs "' + wt + '" ' + rol.toLowerCase() + ' --yaz'
    if (o.yaz && plan.ok && !plan.zaten && uygula(plan)) {
      yazildi.push(path.basename(wt) + ': agent ' + (mevcut || '(yok)') + ' → ' + ajan)
      continue
    }
    bulgular.push('AGENT ANAHTARI: ' + path.basename(wt) + ' → ' + (mevcut || '(yok)') + ', beklenen ' + ajan + (plan.ok ? '' : ' [rol-yaz reddeder: ' + plan.sebep + ']'))
    if (plan.ok) komutlar.push(komut)
  }

  if (o.hafizaDizini && fs.existsSync(o.hafizaDizini) && !durumDosyasiVar(o.hafizaDizini, rol)) {
    bulgular.push('DURUM DOSYASI YOK (bilgi): hafızada *' + rol.toLowerCase() + '*durum*.md bulunamadı; pencere ilk turunda kurmalı')
  }
  return { rol, ajan, bulgular, komutlar, yazildi }
}

/** Sonuç → tek blok metin (≤ CIKTI_TAVANI). */
function blok(s) {
  if (!s) return ''
  const bas = '[pencere-acilis] ' + s.rol + ' penceresi'
  const yaz = s.yazildi.length ? '\n  YAZILDI: ' + s.yazildi.join('; ') + ' (yeniden başlatınca etkili)' : ''
  let m
  if (!s.bulgular.length) {
    m = bas + ': tanım, model, agent anahtarı tamam.' + yaz
  } else {
    m = bas + ' — ' + s.bulgular.length + ' eksik:\n' + s.bulgular.map((b, i) => '  ' + (i + 1) + '. ' + b).join('\n') + yaz
    if (s.komutlar.length) m += '\n  Düzelt: ' + s.komutlar.join(' ; ')
    m += '\n  Kural: HARİTA OPS-kurallar "açılış kontrol listesi" (ARC-245).'
  }
  return m.length > CIKTI_TAVANI ? m.slice(0, CIKTI_TAVANI - 3) + '...' : m
}

/** Worktree içindeysek ana depo kökü (`…/.claude/worktrees/<ad>` → `…`); değilse aynı yol. */
function anaDepo(depo) {
  const p = path.resolve(depo)
  const i = p.split(path.sep).lastIndexOf('worktrees')
  const parcalar = p.split(path.sep)
  return i > 0 && parcalar[i - 1] === '.claude' ? parcalar.slice(0, i - 1).join(path.sep) || path.sep : p
}

function varsayilanHafizaDizini(depo) {
  const slug = anaDepo(depo).replace(/[^A-Za-z0-9]/g, '-')
  return path.join(os.homedir(), '.claude', 'projects', slug, 'memory')
}

if (require.main === module) {
  const [rol, model] = process.argv.slice(2)
  const depo = path.resolve(__dirname, '..', '..')
  const s = denetle({ tool_input: { name: rol || '', model: model || '' } }, { depo, hafizaDizini: null })
  process.stdout.write((s ? blok(s) : 'rol çözülemedi: ' + (rol || '(verilmedi)')) + '\n')
  process.exit(s && !s.bulgular.length ? 0 : 1)
}

module.exports = { denetle, blok, modelUyumlu, anaDepo, adayWorktreeler, varsayilanHafizaDizini, ADAY_PENCERESI_MS }
