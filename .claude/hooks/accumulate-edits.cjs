#!/usr/bin/env node
/**
 * PostToolUse hook — edit accumulator.
 * Bu turda düzenlenen JS/TS dosya yollarını geçici bir dosyaya ekler;
 * Stop hook'u (verify-on-stop) bunu okuyup tek seferde lint+typecheck koşar.
 * Burada hiçbir ağır kontrol koşmaz — ucuz.
 *
 * stdin: { session_id, tool_name, tool_input: { file_path, ... }, ... }
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

let input = {};
try { input = JSON.parse(readStdin() || '{}'); } catch { process.exit(0); }

const filePath = (input && input.tool_input && input.tool_input.file_path) || '';
const sessionId = (input && input.session_id) || 'nosession';
if (!filePath) process.exit(0);
if (!/\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(filePath)) process.exit(0);

const acc = path.join(os.tmpdir(), `venthub-edited-${sessionId}.txt`);
try { fs.appendFileSync(acc, filePath + '\n'); } catch { /* sessizce geç */ }
process.exit(0);
