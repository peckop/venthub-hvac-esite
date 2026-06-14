#!/usr/bin/env node
/**
 * Stop hook (async) — verify-on-stop.
 * Bu turda JS/TS düzenlendiyse:
 *   1) `pnpm exec eslint --fix <dosyalar>`  (format + autofix — VentHub'da Prettier yok)
 *   2) `pnpm exec tsc --noEmit --pretty false`  (proje-geneli tip kontrolü)
 * Sonra tip hatalarını YALNIZCA bu turda düzenlenen dosyalara filtreler ve
 * varsa kullanıcıya systemMessage olarak gösterir. Bloklamaz (exit 0).
 *
 * Neden filtre: projede önceden var olan tip hataları sonsuz uyarıya yol açmasın
 * diye sadece bu turda dokunulan dosyalardaki hatalar raporlanır.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

let input = {};
try { input = JSON.parse(readStdin() || '{}'); } catch { /* yoksay */ }
const sessionId = (input && input.session_id) || 'nosession';

const acc = path.join(os.tmpdir(), `venthub-edited-${sessionId}.txt`);
let raw = '';
try { raw = fs.readFileSync(acc, 'utf8'); } catch { process.exit(0); } // accumulator yok → bu turda TS edit yok → sessiz
try { fs.unlinkSync(acc); } catch { /* geç */ }

const repoRoot = process.cwd();
const uniq = [...new Set(raw.split('\n').map((s) => s.trim()).filter(Boolean))]
  .filter((f) => /\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(f) && fs.existsSync(f));
if (uniq.length === 0) process.exit(0);

// 1) eslint --fix (best-effort; hook'u asla düşürmesin)
spawnSync('pnpm', ['exec', 'eslint', '--fix', ...uniq], { shell: true, stdio: 'ignore' });

// 2) tsc --noEmit --pretty false (8GB; parse edilebilir tek-satır hata çıktısı)
const tsc = spawnSync('pnpm', ['exec', 'tsc', '--noEmit', '--pretty', 'false'], {
  shell: true,
  encoding: 'utf8',
  env: Object.assign({}, process.env, { NODE_OPTIONS: '--max-old-space-size=8192' }),
});

const out = ((tsc.stdout || '') + (tsc.stderr || '')).toString();
const editedRel = new Set(uniq.map((f) => path.relative(repoRoot, f).replace(/\\/g, '/')));

const typeErrors = out
  .split('\n')
  .map((line) => line.replace(/\r$/, ''))
  .filter((line) => {
    const m = line.match(/^(.+?)\(\d+,\d+\):\s+error TS/);
    if (!m) return false;
    return editedRel.has(m[1].replace(/\\/g, '/'));
  });

if (typeErrors.length > 0) {
  const summary =
    `⚠️ verify-on-stop: bu turda düzenlenen dosyalarda tip hatası var:\n` +
    typeErrors.slice(0, 20).join('\n') +
    (typeErrors.length > 20 ? `\n… (+${typeErrors.length - 20} daha)` : '');
  process.stdout.write(JSON.stringify({ systemMessage: summary }) + '\n');
}
process.exit(0);
