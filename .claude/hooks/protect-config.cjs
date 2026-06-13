#!/usr/bin/env node
/**
 * PreToolUse hook — KALİTE AĞI (config-protection + içerik taraması).
 *
 * Bu bir KALİTE AĞI'dır, jail DEĞİL: Claude Bash ile aşabilir; gerçek sınır
 * kullanıcının commit incelemesidir. Amaç: kazara/dalgınlıkla kural ihlalini
 * yazım anında yüzeye çıkarmak.
 *
 * İKİ KATMAN:
 *  A) Lint/TS zorlayan config dosyalarını ajan-düzenlemesine kapatır (kuralı zayıflatma karşıtı):
 *     eslint.config.cjs · tsconfig*.json · .lintstagedrc.json.
 *  B) Kod dosyalarına yazılan içerikte VentHub'ın YASAK kalıplarını bloklar
 *     (twin/CONTEXT.md kaynaklı): any kestirmeleri, @ts-ignore ailesi, eslint-disable,
 *     raw_user_meta_data (auth), PCFSoftShadowMap (3D).
 *
 * KALDIRILDI (ECC GateGuard dersi + güvenlik bulgusu):
 *  - guard'ın KENDİNİ koruması (self-lock) → ters tepti, false-positive üretti.
 *  - ON/OFF toggle (guard.state) → fail-open idi.
 *  - .claude/settings.json kilidi → self-lock'un parçasıydı.
 *  Hook'u/ayarı düzeltmek artık serbest; sınır = kullanıcının commit incelemesi.
 *
 * stdin: { tool_name, tool_input: { file_path, content?, new_string?, edits? }, ... }
 * Çıkış: exit 2 = blokla (stderr Claude'a döner) · exit 0 = izin ver.
 * Not: yalnızca Claude'u bloklar — kullanıcı her dosyayı elle düzenleyebilir.
 */
const fs = require('fs');
const path = require('path');

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

let input = {};
try { input = JSON.parse(readStdin() || '{}'); } catch { process.exit(0); } // bozuk JSON → bloklama

const ti = (input && input.tool_input) || {};
const filePath = ti.file_path || '';
if (!filePath) process.exit(0);

const base = path.basename(filePath).toLowerCase();
const rel = filePath.replace(/\\/g, '/').toLowerCase();

/* ---- KATMAN A: lint/TS zorlayan config dosyaları (kuralı zayıflatma karşıtı) ---- */
const protectedExact = new Set(['eslint.config.cjs', '.lintstagedrc.json']);
const isTsconfig = /(^|\/)tsconfig(\.[\w.-]+)?\.json$/.test(rel);

if (protectedExact.has(base) || isTsconfig) {
  process.stderr.write(
    `[guard] "${path.basename(filePath)}" düzenlemesi BLOKLANDI.\n` +
    `Bu dosya VentHub kalite kurallarını zorluyor (DI, no-arbitrary-Tailwind, no-console, strict TS).\n` +
    `Kuralı sağlamak için CONFIG'i değil KODU düzelt. Gerçek config değişikliği gerekiyorsa ` +
    `kullanıcıdan elle yapmasını iste.\n`
  );
  process.exit(2);
}

/* ---- KATMAN B: kod içeriği taraması ---- */
const isCodeFile = /\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(rel);
const isUnderClaude = rel.includes('/.claude/') || rel.startsWith('.claude/');
if (!isCodeFile || isUnderClaude) process.exit(0); // sadece kod dosyaları, .claude/ hariç

// Yazılan içeriği topla (Write/Edit/MultiEdit)
let incoming = '';
if (typeof ti.content === 'string') incoming += ti.content + '\n';
if (typeof ti.new_string === 'string') incoming += ti.new_string + '\n';
if (Array.isArray(ti.edits)) {
  for (const e of ti.edits) if (e && typeof e.new_string === 'string') incoming += e.new_string + '\n';
}
if (!incoming.trim()) process.exit(0);

// VentHub YASAK kalıpları (twin kaynaklı). Her biri: ad · regex · neden.
const FORBIDDEN = [
  { name: 'as any',            re: /\bas\s+any\b/,              why: 'strict TS deler; any KESİNLİKLE yasak' },
  { name: 'as unknown as',     re: /\bas\s+unknown\s+as\b/,     why: 'tip güvenliğini deler (any dökümünün eşdeğeri)' },
  { name: ': any',             re: /:\s*any\b/,                 why: 'any tip ataması yasak' },
  { name: '| any / & any',     re: /[|&]\s*any\b/,              why: 'union/intersection içinde any yasak' },
  { name: 'any[]',             re: /\bany\[\]/,                 why: 'any dizisi yasak' },
  { name: '<… any …>',         re: /<[^>]*\bany\b[^>]*>/,       why: 'generic içinde any yasak' },
  { name: '@ts-ignore',        re: /@ts-ignore/,                why: 'tip hatasını susturma yasak — kodu düzelt' },
  { name: '@ts-expect-error',  re: /@ts-expect-error/,          why: 'tip hatasını susturma yasak — kodu düzelt' },
  { name: '@ts-nocheck',       re: /@ts-nocheck/,               why: 'dosya tip kontrolünü kapatma yasak' },
  { name: 'eslint-disable',    re: /eslint-disable/,            why: 'lint kuralını (DI/token/no-console) inline kapatma yasak' },
  { name: 'raw_user_meta_data',re: /\braw_user_meta_data\b/,    why: 'kullanıcı düzenleyebilir; yetki için app_metadata kullan' },
  { name: 'PCFSoftShadowMap',  re: /\bPCFSoftShadowMap\b/,      why: '3D performans; gölge yalnızca \'percentage\' olmalı' },
];

const hits = FORBIDDEN.filter((p) => p.re.test(incoming));
if (hits.length > 0) {
  process.stderr.write(
    `[guard] "${path.basename(filePath)}" yazımı BLOKLANDI — yasak kalıp(lar):\n` +
    hits.map((h) => `  • ${h.name} — ${h.why}`).join('\n') + '\n' +
    `Kestirme yok. Kuralı sağlayan gerçek çözümü yaz. Gerçekten gerekliyse kullanıcıdan onay/elle düzenleme iste.\n`
  );
  process.exit(2);
}
process.exit(0);
