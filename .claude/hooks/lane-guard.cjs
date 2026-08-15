#!/usr/bin/env node
/**
 * PreToolUse hook — ŞERİT KORUMASI (çok-oturumlu çakışma engeli).
 *
 * Başka bir Claude Code oturumunun canlı olarak talep ettiği yola yazmayı engeller.
 * Bugüne kadar çakışmayı ancak MERGE anında (ya da hiç) görüyorduk; bu kapı yazmadan
 * ÖNCE söyler.
 *
 * FAIL-OPEN — bilinçli sapma: VentHub kuralı "yeni kapıya geçiş modu koyma" der ama o kural
 * GÜVENLİK kapıları içindir. Bu bir KOORDİNASYON kapısı: pano okunamazsa fail-closed olmak
 * üç oturumu birden durdurur (kendi kendine kesinti). Pano bozulursa yazma serbest kalır ve
 * son emniyet git'tir. Sessiz de değil: hata stderr'e düşer.
 *
 * stdin: { session_id, tool_name, tool_input: { file_path, ... }, cwd? }
 * Çıkış: exit 2 = blokla (stderr Claude'a döner) · exit 0 = izin ver.
 */
const fs = require('fs')
const path = require('path')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { process.exit(0) }

const filePath = (input.tool_input && input.tool_input.file_path) || ''
const sid = input.session_id || ''
if (!filePath || !sid) process.exit(0)

let board
try {
  board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
} catch (e) {
  process.stderr.write(`[lane-guard] pano yüklenemedi (fail-open): ${e && e.message}\n`)
  process.exit(0)
}

let conflict = null
try {
  /**
   * KALP ATIŞI BURADA DA — ölçülmüş bir arıza sonucu eklendi: atış yalnız
   * `UserPromptSubmit`'e bağlıyken, kullanıcı mesaj yazmadan geçen uzun otonom
   * çalışma boyunca hiç atış olmuyor ve 4 saatlik TTL dolunca oturum KENDİ şeridini
   * kaybediyor (5 saatlik bir koşuda üç oturumun üçü de düştü). Yazma anı, "bu oturum
   * yaşıyor"un en doğrudan kanıtıdır; aralık board.cjs'te kısılı olduğu için maliyeti yok.
   */
  board.touch(sid)
  conflict = board.findConflict(filePath, sid, input.cwd || process.cwd())
} catch (e) {
  process.stderr.write(`[lane-guard] pano okunamadı (fail-open): ${e && e.message}\n`)
  process.exit(0)
}

if (!conflict) process.exit(0)

const { claim, glob, rel } = conflict
const isSubagent = Boolean(input.agent_id)
process.stderr.write(
  `[lane-guard] "${rel}" BAŞKA bir oturumun şeridinde — yazma bloklandı.\n` +
  `  Şerit: ${claim.lane} · oturum ${String(claim.sid).slice(0, 8)} · kural: ${glob}\n` +
  (isSubagent
    // Alt-ajan ebeveyninin `session_id`'siyle koşar (ölçüldü) — yani bu blok "alt-ajan
    // tanınmadı" DEĞİL, gerçekten yabancı bir şerit. Doğru çıkış yazmak değil raporlamak.
    ? `  SEN BİR ALT-AJANSIN: yazmayı deneme, dosyanın TAM İÇERİĞİNİ raporunda döndür —\n` +
      `  seni başlatan oturum kendi kapısından geçirip yazar. Bash ile kapıyı AŞMA.\n`
    : '') +
  `  Yapılacaklar: (a) şerit sahibine not bırak —\n` +
  `      node scripts/board/board.cjs note --sid <senin-sid> --to ${claim.lane} --text "…"\n` +
  `  (b) sahip bayatsa (kalp atışı yoksa TTL düşürür) Recep'e sor — Bash ile aşma.\n` +
  `  UYARI: yeniden claim etmek SENİ AÇMAZ; "en erken kazanır", geç gelen talep hep bloklu.\n` +
  `  Not: bu bir kilit değil kalite ağıdır; kullanıcı dosyayı elle düzenleyebilir.\n`
)
process.exit(2)
