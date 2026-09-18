#!/usr/bin/env node
/**
 * KANCA — bir dosyaya dokunulurken o dosyaya çapalı sage derslerini bağlama koyar.
 *
 * Olay: PreToolUse · matcher `Read|Edit|Write|MultiEdit`
 * stdin: { session_id, cwd, tool_name, tool_input: { file_path } }
 * stdout: hookSpecificOutput.additionalContext (ders varsa) — yoksa HİÇBİR ŞEY
 *
 * ⛔NİÇİN PreToolUse (PostToolUse DEĞİL): ders, düzenlemeden ÖNCE görünmezse kararı
 * etkilemez; düzenleme bittikten sonra gelen ders yalnız bir dipnottur.
 *
 * ⛔NİÇİN SESSİZ VE BLOKLAMAZ: kanca her araç çağrısında koşar. Bütçe, puanlama, "dosya
 * başına bir kez" ve compact sıfırlaması `scripts/hijyen/sage-dosya-dersi.cjs` içinde
 * yazılı ve ölçülüdür; burada yalnız kablo var. Herhangi bir hata → çıkış 0, çıktı yok.
 */
const path = require('path')

let girdi = {}
try {
  girdi = JSON.parse(require('fs').readFileSync(0, 'utf8') || '{}')
} catch {
  process.exit(0)
}

try {
  const dosya = girdi?.tool_input?.file_path
  if (typeof dosya !== 'string' || !dosya) process.exit(0)

  // Sage verisi PROJENİN İÇİNDE (ana ağaç) yaşar; worktree'de yoktur. Kancalar da ana
  // ağaçtan yüklenir, bu yüzden CLAUDE_PROJECT_DIR doğru kök.
  const kok = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..')
  const { satir } = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-dosya-dersi.cjs'))
  const metin = satir({ kok, dosya: path.resolve(dosya), oturum: girdi.session_id })
  if (!metin) process.exit(0)

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: metin },
    }),
  )
} catch {
  /* fail-open ve SESSİZ: her araç çağrısında uyarı basan kanca üç turda görmezden gelinir */
}
process.exit(0)
