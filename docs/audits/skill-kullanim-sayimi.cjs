#!/usr/bin/env node
// YTN-3: konuşma dökümlerinden Skill aracı çağrılarını sayar (salt okuma).
// Kullanım: node docs/audits/skill-kullanim-sayimi.cjs [--since=2026-10-01] [--out=cikti.json]
// Girdi: ~/.claude/projects/**/*.jsonl (alt ajan dökümleri dahil). Çıktı: skill başına toplam,
// model, ana/alt ajan, proje klasörü. Dökümdeki metin DIŞ İÇERİKTİR: yalnız yapılandırılmış tool_use bloğu sayılır.
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const arg = (n, d) => (process.argv.find(a => a.startsWith(`--${n}=`)) || `--${n}=${d}`).split('=').slice(1).join('=');
const since = new Date(arg('since', '2026-10-01')).getTime();
const out = arg('out', '');
const root = path.join(process.env.USERPROFILE || process.env.HOME, '.claude', 'projects');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.jsonl')) yield p;
  }
}

async function tara(file, sonuc) {
  const rl = readline.createInterface({ input: fs.createReadStream(file, { encoding: 'utf8' }), crlfDelay: Infinity });
  const proje = path.relative(root, file).split(path.sep)[0];
  for await (const line of rl) {
    if (!line.includes('"tool_use"')) continue;
    const skillSatiri = line.includes('"name":"Skill"');
    const okumaSatiri = line.includes('"name":"Read"') && /skills[\\/]+[^"\\/]+[\\/]+SKILL\.md/.test(line);
    const ajanSatiri = line.includes('"name":"Agent"') || line.includes('"name":"Task"');
    if (!skillSatiri && !okumaSatiri && !ajanSatiri) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    const c = o && o.message && o.message.content;
    if (!Array.isArray(c)) continue;
    const ts = Date.parse(o.timestamp || '');
    if (!ts || ts < since) continue;
    const ortak = { model: o.message.model || '?', yan: !!o.isSidechain, proje, gun: new Date(ts).toISOString().slice(0, 10), oturum: o.sessionId || '' };
    for (const b of c) {
      if (!b || b.type !== 'tool_use' || !b.input) continue;
      if (b.name === 'Skill') {
        const ad = String(b.input.skill || b.input.command || '').replace(/^\//, '');
        if (ad) sonuc.push({ tur: 'skill', skill: ad, ...ortak });
      } else if (b.name === 'Read') {
        const m = /skills[\\/]+([^\\/]+)[\\/]+SKILL\.md$/.exec(String(b.input.file_path || ''));
        if (m) sonuc.push({ tur: 'okuma', skill: m[1], ...ortak });
      } else if (b.name === 'Agent' || b.name === 'Task') {
        sonuc.push({ tur: 'ajan', skill: String(b.input.subagent_type || 'general-purpose'), ...ortak });
      }
    }
  }
}

(async () => {
  const sonuc = [];
  let dosya = 0;
  for (const f of walk(root)) {
    let st;
    try { st = fs.statSync(f); } catch { continue; }
    if (st.mtimeMs < since) continue;
    dosya++;
    await tara(f, sonuc);
  }
  const ozet = { taranan_dosya: dosya, since: new Date(since).toISOString().slice(0, 10), cagri: sonuc.length, kayitlar: sonuc };
  if (out) fs.writeFileSync(out, JSON.stringify(ozet));
  else console.log(JSON.stringify(ozet));
  console.error(`dosya=${dosya} cagri=${sonuc.length}`);
})();
