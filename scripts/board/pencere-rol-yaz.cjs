#!/usr/bin/env node
'use strict'
/**
 * PENCERE ROL YAZICI (ARC-224, 27 Ekim) — OPS'un `start_session` açılış yolunun parçası.
 *
 * NİÇİN: `start_session` rastgele adlı bir worktree açar (`.claude/worktrees/clever-mayer-b2d2d2`), rol vermez ve açan
 * oturumun `settings.local.json`'ını kopyalar. Sonuç: pencere ya OPS'un anahtarını miras alır (ARC-223 bunu artık kimlik
 * saymaz) ya da hiç rol almaz ("KIMLIK YOK"), model de açanın modeli olur. Bu araç, pencere AÇILDIKTAN SONRA ve ilk
 * mesajından ÖNCE OPS tarafından koşulur: worktree'nin `settings.local.json`'ına `agent: <ad>-pencere` yazar ve
 * `start_session` için rolün modelini söyler (OPS dersi 26 Ekim: Yetenek Opus'ta açıldı, tanım Sonnet diyordu).
 * Anahtar yeniden başlatmada etkilidir (açık oturum ayarı açılışta okur).
 *
 * KULLANIM:
 *   node scripts/board/pencere-rol-yaz.cjs <worktree-dizini> <rol>          plan (YAZMAZ)
 *   node scripts/board/pencere-rol-yaz.cjs <worktree-dizini> <rol> --yaz     yazar
 *   <rol>: `yetenek` ya da `yetenek-pencere`. Seçenek: --zorla (başka bir pencere rolünün anahtarını değiştirir).
 *
 * KURALLAR (hepsi reddeder, sessiz düzeltmez):
 *   · hedef `.claude/worktrees/<ad>` içinde olmalı; `ops-pencere` worktree'si ve ana depo reddedilir (OPS'un anahtarını
 *     bu araç yazmaz, o elle/kendi yolunda durur);
 *   · rolün ajan tanımı (`.claude/agents/<rol>-pencere.md`) var olmalı; `ops` rolü reddedilir;
 *   · mevcut `settings.local.json` bozuksa reddedilir; diğer tüm anahtarlar AYNEN korunur (izin dahil, yalnız `agent` yazılır);
 *   · mevcut `agent` bu rol ise "zaten"; `ops-pencere` (miras) ise değiştirilir; başka bir rol ise --zorla ister.
 * İZİN AYARINA DOKUNMAZ: `agent` anahtarı izin içermez. Yazım atomiktir (geçici dosya + rename).
 */

const fs = require('node:fs')
const path = require('node:path')

const OPS_AJANI = 'ops-pencere'

/** `yetenek` ya da `yetenek-pencere` → `yetenek-pencere`; geçersizse ''. */
function ajanAdi(rol) {
  const s = String(rol || '').trim().toLowerCase().replace(/-pencere$/, '')
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length > 0 ? s + '-pencere' : ''
}

function depoKoku(baslangic = __dirname) {
  let d = path.resolve(baslangic)
  for (let i = 0; i < 10; i += 1) {
    if (fs.existsSync(path.join(d, '.claude', 'agents'))) return d
    const ust = path.dirname(d)
    if (ust === d) break
    d = ust
  }
  return path.resolve(__dirname, '..', '..')
}

/** Ajan tanımının frontmatter `model:` değeri ya da ''. */
function tanimModeli(tanimYolu) {
  try {
    const m = fs.readFileSync(tanimYolu, 'utf8').slice(0, 1500).match(/^model:[ \t]*([^\s#]+)/m)
    return m ? m[1].replace(/^["']|["']$/g, '') : ''
  } catch {
    return ''
  }
}

/**
 * SAF karar: dosyaya yazmaz. { ok, sebep, hedef, ajan, onceki, model, yazilacak }.
 * @param {{ worktree: string, rol: string, zorla?: boolean, depo?: string }} o
 */
function planla({ worktree, rol, zorla = false, depo } = {}) {
  const ajan = ajanAdi(rol)
  const red = (sebep) => ({ ok: false, sebep })
  if (!ajan) return red('rol geçersiz (örnek: yetenek ya da yetenek-pencere)')
  if (ajan === OPS_AJANI) return red('ops rolü bu araçla yazılmaz (OPS kendi yolunda durur)')
  if (!worktree) return red('worktree dizini verilmedi')
  const kok = path.resolve(worktree)
  const ust = path.basename(path.dirname(kok))
  const ustUst = path.basename(path.dirname(path.dirname(kok)))
  if (ust !== 'worktrees' || ustUst !== '.claude') return red('hedef `.claude/worktrees/<ad>` içinde değil (ana depoya yazılmaz)')
  if (path.basename(kok) === OPS_AJANI) return red('ops-pencere worktree\'sine yazılmaz')
  if (!fs.existsSync(kok) || !fs.statSync(kok).isDirectory()) return red('worktree dizini yok')

  const tanim = path.join(depo || depoKoku(), '.claude', 'agents', ajan + '.md')
  if (!fs.existsSync(tanim)) return red('ajan tanımı yok: .claude/agents/' + ajan + '.md')

  const hedef = path.join(kok, '.claude', 'settings.local.json')
  let mevcut = {}
  if (fs.existsSync(hedef)) {
    try {
      mevcut = JSON.parse(fs.readFileSync(hedef, 'utf8'))
    } catch {
      return red('mevcut settings.local.json bozuk (JSON değil); elle bakılmalı')
    }
    if (!mevcut || typeof mevcut !== 'object' || Array.isArray(mevcut)) return red('mevcut settings.local.json nesne değil')
  }
  const onceki = typeof mevcut.agent === 'string' ? mevcut.agent : ''
  const model = tanimModeli(tanim)
  const taban = { hedef, ajan, onceki, model }
  if (onceki === ajan) return { ok: true, zaten: true, ...taban, yazilacak: null }
  if (onceki && onceki !== OPS_AJANI && !zorla) {
    return { ok: false, sebep: 'mevcut agent başka bir rol (' + onceki + '); değiştirmek için --zorla', ...taban }
  }
  return { ok: true, zaten: false, ...taban, yazilacak: { ...mevcut, agent: ajan } }
}

/** Planı atomik yazar (geçici dosya + rename). Yalnız ok ve yazılacak doluyken. */
function uygula(plan) {
  if (!plan || !plan.ok || !plan.yazilacak) return false
  fs.mkdirSync(path.dirname(plan.hedef), { recursive: true })
  const gecici = plan.hedef + '.rol-yaz.tmp'
  fs.writeFileSync(gecici, JSON.stringify(plan.yazilacak, null, 2) + '\n', 'utf8')
  fs.renameSync(gecici, plan.hedef)
  return true
}

function ozet(plan, yazildi) {
  if (!plan.ok) return '[pencere-rol-yaz] REDDEDILDI: ' + plan.sebep
  if (plan.zaten) return '[pencere-rol-yaz] ZATEN: ' + plan.hedef + ' agent=' + plan.ajan + ' (değişiklik yok)'
  const diger = Object.keys(plan.yazilacak).filter((k) => k !== 'agent')
  return (
    '[pencere-rol-yaz] ' + (yazildi ? 'YAZILDI' : 'PLAN (yazılmadı; --yaz ile yazılır)') + ': ' + plan.hedef +
    ' agent: ' + (plan.onceki || '(yok)') + ' → ' + plan.ajan +
    '\n  start_session model önerisi: ' + (plan.model || '(tanımda model yok)') +
    '\n  korunan diğer anahtarlar: ' + (diger.length ? diger.join(', ') : '(yok)') +
    (yazildi ? '\n  Etki: pencere yeniden başlatılınca (açık oturum ayarı açılışta okur).' : '')
  )
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const konum = args.filter((a) => !a.startsWith('--'))
  const plan = planla({ worktree: konum[0], rol: konum[1], zorla: args.includes('--zorla') })
  const yazdi = args.includes('--yaz') && uygula(plan)
  process.stdout.write(ozet(plan, yazdi) + '\n')
  process.exit(plan.ok ? 0 : 1)
}

module.exports = { ajanAdi, planla, uygula, ozet, tanimModeli }
