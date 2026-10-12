'use strict'
/**
 * OPS OTURUM KİMLİĞİ — TEK KAYNAK (ARC-99, 2026-10-12).
 *
 * ⭐NİÇİN: kokpit düğmeleri (ops-kokpit modu), linear-zil bildirimi ve session-board'un "lider" testi OPS
 * penceresinin oturum kimliğini kodda sabit tutuyordu (cb0467f1...). OPS penceresi değişince (yeni OPS) Recep'in
 * kokpit düğmesi eski pencereye düşüyordu. Kimlik artık TEK dosyada: `~/.claude/mod-durum/ops-oturumu.json`
 * (`{ sid, ts, kaynak }`); modlar ve kancalar buradan okur.
 *
 * ⭐KİM YAZAR: yalnız OPS penceresinin KENDİSİ, açılışta (session-board.cjs, SessionStart). OPS penceresi
 * `.claude/settings.local.json` içindeki `"agent": "ops-pencere"` ayarıyla tanınır (şerit/CC_LANE'e bağlı değil:
 * yeni OPS şerit almaz). Aday kimliği taşımayan pencere (eski OPS, departman pencereleri) HİÇ yazmaz.
 *
 * ⭐ÜZERİNE YAZMA KURALI ("son yazan kazanır" yeni OPS'u ezmesin): dosya yoksa, aynı kimlikse ya da pencere SIFIRDAN
 * açılıyorsa (`startup`) yazılır; başka bir kimlik dosyadayken `resume`/`compact`/`clear` yazmaz. Elle düzeltme:
 * `node scripts/board/ops-oturumu.cjs --yaz <oturum-kimliği>`.
 *
 * FAIL-OPEN/GÜVENLİ: okunamayan/bozuk dosya = kimlik YOK (kokpit düğmesi gizlenir, mesaj yanlış pencereye gitmez).
 */
const fs = require('fs')
const os = require('os')
const path = require('path')

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AJAN_ADI = 'ops-pencere'

function dosyaYolu() {
  return process.env.VH_OPS_OTURUMU_DOSYASI || path.join(os.homedir(), '.claude', 'mod-durum', 'ops-oturumu.json')
}

/** Kayıtlı OPS oturum kimliği; yok/bozuk → ''. */
function oku(dosya = dosyaYolu()) {
  try {
    const j = JSON.parse(fs.readFileSync(dosya, 'utf8'))
    return j && typeof j.sid === 'string' && UUID.test(j.sid) ? j.sid.toLowerCase() : ''
  } catch {
    return ''
  }
}

/** Bu oturum kayıtlı OPS mi? Kayıt yoksa HAYIR (güvenli). */
function kimlikMi(sid, dosya = dosyaYolu()) {
  const k = oku(dosya)
  return Boolean(k) && String(sid || '').toLowerCase() === k
}

/** Pencere OPS adayı mı: kök `settings.local.json` agent = ops-pencere (ya da kancaya gelen agent_type). */
function opsAdayiMi({ cwd, agentType } = {}) {
  if (agentType === AJAN_ADI) return true
  try {
    let d = path.resolve(cwd || process.cwd())
    for (let i = 0; i < 6; i += 1) {
      const f = path.join(d, '.claude', 'settings.local.json')
      if (fs.existsSync(f)) {
        const j = JSON.parse(fs.readFileSync(f, 'utf8'))
        return Boolean(j) && j.agent === AJAN_ADI
      }
      const ust = path.dirname(d)
      if (ust === d) break
      d = ust
    }
  } catch {
    /* okunamadı: aday değil */
  }
  return false
}

/** Yazma kararı (saf): mevcut kimlik, bu oturum, açılış kaynağı → { yaz, sebep }. */
function yazmaKarari({ mevcut, sid, kaynak }) {
  if (!UUID.test(String(sid || ''))) return { yaz: false, sebep: 'gecersiz-sid' }
  if (!mevcut) return { yaz: true, sebep: 'kayit-yok' }
  if (mevcut === String(sid).toLowerCase()) return { yaz: true, sebep: 'ayni-sid' }
  if (kaynak === 'startup') return { yaz: true, sebep: 'yeni-pencere' }
  return { yaz: false, sebep: 'baska-kimlik-var-' + (kaynak || 'bilinmiyor') }
}

/** Açılışta çağrılır: aday ve karar uygunsa yazar. Hata yutulur (açılışı bozmaz). */
function acilistaYaz({ sid, kaynak, cwd, agentType, dosya = dosyaYolu(), simdi = Date.now() } = {}) {
  try {
    if (!opsAdayiMi({ cwd, agentType })) return { yazildi: false, sebep: 'aday-degil' }
    const k = yazmaKarari({ mevcut: oku(dosya), sid, kaynak })
    if (!k.yaz) return { yazildi: false, sebep: k.sebep }
    fs.mkdirSync(path.dirname(dosya), { recursive: true })
    fs.writeFileSync(dosya, JSON.stringify({ sid: String(sid).toLowerCase(), ts: simdi, kaynak: kaynak || '' }) + '\n')
    return { yazildi: true, sebep: k.sebep }
  } catch (e) {
    return { yazildi: false, sebep: 'hata-' + ((e && e.code) || 'bilinmiyor') }
  }
}

if (require.main === module) {
  const i = process.argv.indexOf('--yaz')
  if (i >= 0) {
    const sid = process.argv[i + 1]
    if (!UUID.test(String(sid || ''))) {
      process.stderr.write('kullanim: node scripts/board/ops-oturumu.cjs --yaz <oturum-kimligi (uuid)>\n')
      process.exit(2)
    }
    const dosya = dosyaYolu()
    fs.mkdirSync(path.dirname(dosya), { recursive: true })
    fs.writeFileSync(dosya, JSON.stringify({ sid: sid.toLowerCase(), ts: Date.now(), kaynak: 'elle' }) + '\n')
    process.stdout.write('ops-oturumu yazildi: ' + sid.toLowerCase() + '\n')
  } else {
    process.stdout.write((oku() || '(kayit yok)') + '\n')
  }
}

module.exports = { dosyaYolu, oku, kimlikMi, opsAdayiMi, yazmaKarari, acilistaYaz, AJAN_ADI }
