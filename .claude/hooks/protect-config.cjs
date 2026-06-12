#!/usr/bin/env node
/**
 * PreToolUse hook — config-protection.
 * Claude'un kalite-zorlama config dosyalarını "check'ler geçsin" diye
 * zayıflatmasını engeller. Korunan bir dosya düzenlenmeye çalışılırsa
 * exit 2 (blokla) + stderr mesajı döner; aksi halde exit 0 (izin ver).
 *
 * stdin: { tool_name, tool_input: { file_path, ... }, ... }
 * Not: yalnızca Claude'u bloklar — kullanıcı bu dosyaları elle düzenleyebilir.
 */
const fs = require('fs');
const path = require('path');

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

let input = {};
try { input = JSON.parse(readStdin() || '{}'); } catch { process.exit(0); } // bozuk JSON → bloklama

const filePath = (input && input.tool_input && input.tool_input.file_path) || '';
if (!filePath) process.exit(0);

const base = path.basename(filePath).toLowerCase();
const rel = filePath.replace(/\\/g, '/').toLowerCase();

// Korunan: ESLint flat config, tsconfig(ler), lint-staged, ve bu hook config'i.
const protectedExact = new Set(['eslint.config.cjs', '.lintstagedrc.json']);
const isTsconfig = /(^|\/)tsconfig(\.[\w.-]+)?\.json$/.test(rel);
const isClaudeSettings = rel.endsWith('.claude/settings.json');

if (protectedExact.has(base) || isTsconfig || isClaudeSettings) {
  process.stderr.write(
    `[config-protection] "${path.basename(filePath)}" düzenlemesi BLOKLANDI.\n` +
    `Bu dosya VentHub kalite kurallarını zorluyor (DI, no-arbitrary-Tailwind, no-console, strict TS).\n` +
    `Kuralı sağlamak için CONFIG'i değil KODU düzelt. Gerçekten config değişikliği gerekiyorsa ` +
    `kullanıcıdan elle yapmasını iste.\n`
  );
  process.exit(2);
}
process.exit(0);
