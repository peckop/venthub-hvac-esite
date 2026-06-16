const { execSync } = require('child_process');
const fs = require('fs');

const norm = p => String(p).split('\\').join('/');
const base = p => norm(p).split('/').slice(-2).join('/');

const findings = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).flat();
const plan = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const rules = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
const fail = [];

// 1) Scope check: ensure no empty files and no duplicate files
const seen = new Set();
for (const f of findings) {
  if (!f.file) {
    fail.push('A finding is missing the "file" property.');
  } else {
    const fileBase = base(f.file);
    if (seen.has(fileBase)) {
      fail.push(`Duplicate file entry: ${f.file}`);
    }
    seen.add(fileBase);
  }
}

// 1.1) Expected files scope check (ensures no files are omitted from findings)
if (rules.scope && Array.isArray(rules.scope.expectedFiles)) {
  const findingBases = new Set(findings.map(f => f.file ? base(f.file) : ''));
  for (const expected of rules.scope.expectedFiles) {
    const expectedBase = base(expected);
    if (!findingBases.has(expectedBase)) {
      fail.push(`Scope omission: Expected file "${expected}" was not analyzed.`);
    }
  }
}

// 2) CLI-based deterministic counts validation
if (rules.cliValidation && rules.cliValidation.commandTemplate) {
  const files = [...new Set(findings.map(f => f.file).filter(f => f && !f.includes('[lang]')))];
  if (files.length) {
    const cmd = rules.cliValidation.commandTemplate.replace('{files}', files.map(f => JSON.stringify(f)).join(' '));
    let out;
    try {
      out = execSync(cmd, { maxBuffer: 1e8 }).toString();
    } catch (e) {
      out = (e.stdout || '').toString();
    }
    
    const real = {};
    if (rules.cliValidation.parserType === 'eslint-jsx-literals') {
      try {
        const parsed = JSON.parse(out);
        for (const r of parsed) {
          real[base(r.filePath)] = r.messages.filter(m => m.ruleId === 'react/jsx-no-literals').length;
        }
      } catch (err) {
        fail.push(`Failed to parse CLI validation output: ${err.message}`);
      }
    }
    
    const exactKey = rules.cliValidation.exactKey || 'exactLiteralCount';
    for (const f of findings) {
      const r = real[base(f.file)];
      if (r !== undefined && r !== f[exactKey]) {
        fail.push(`${f.file}: ${exactKey} ${f[exactKey]} != eslint actual ${r}`);
      }
    }
  }
}

// 3) Per-file arithmetic and enum checks
for (const f of findings) {
  // Arithmetic validation
  if (rules.arithmetic) {
    rules.arithmetic.forEach(rule => {
      const match = rule.equation.match(/^([a-zA-Z0-9_]+)\s*\+\s*([a-zA-Z0-9_]+)\s*===\s*([a-zA-Z0-9_]+)$/);
      if (match) {
        const [_, k1, k2, k3] = match;
        if ((Number(f[k1] || 0) + Number(f[k2] || 0)) !== Number(f[k3] || 0)) {
          fail.push(`${f.file}: equation failed: ${k1} + ${k2} (${f[k1]} + ${f[k2]}) !== ${k3} (${f[k3]})`);
        }
      }
    });
  }

  // Enum validation
  if (rules.enums) {
    for (const [field, allowedValues] of Object.entries(rules.enums)) {
      if (f[field] && !allowedValues.includes(f[field])) {
        fail.push(`${f.file}: invalid enum value "${f[field]}" for field "${field}". Allowed: [${allowedValues.join(', ')}]`);
      }
    }
  }
}

// 4) Plan summation validation
if (rules.summation) {
  rules.summation.forEach(rule => {
    const expected = findings.reduce((acc, f) => acc + Number(f[rule.findingKey] || 0), 0);
    if (Number(plan[rule.planKey] || 0) !== expected) {
      fail.push(`Synthesizer summation mismatch: plan.${rule.planKey} (${plan[rule.planKey]}) !== sum of findings.${rule.findingKey} (${expected})`);
    }
  });
}

// 5) Sibling file parity validation (e.g. tr vs en file parity)
if (rules.siblingParity && rules.siblingParity.pattern) {
  const parity = rules.siblingParity;
  const rx = new RegExp(parity.pattern);
  const groups = {};
  
  findings.forEach(f => {
    const m = norm(f.file).match(rx);
    if (m) {
      const lang = m[1];
      const key = m[2];
      (groups[key] ??= {})[lang] = f[parity.key];
    }
  });
  
  for (const [name, p] of Object.entries(groups)) {
    const keys = Object.keys(p);
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const v1 = p[keys[i]];
        const v2 = p[keys[j]];
        if (v1 !== undefined && v2 !== undefined && Math.abs(v1 - v2) > parity.maxDifference) {
          fail.push(`Sibling parity mismatch for "${name}": "${keys[i]}" (${v1}) vs "${keys[j]}" (${v2}) exceeds limit of ${parity.maxDifference}`);
        }
      }
    }
  }
}

// 6) Exclusions validation (prevent trivial/done files in waves)
if (rules.exclusions && rules.exclusions.recommendations) {
  const excludedRecs = rules.exclusions.recommendations;
  const excludedFiles = new Set(findings.filter(f => excludedRecs.includes(f.recommendation)).map(f => base(f.file)));
  
  for (const w of (plan.waves || [])) {
    for (const wf of (w.files || [])) {
      if (excludedFiles.has(base(wf))) {
        fail.push(`Wave "${w.name}" contains excluded file: ${wf}`);
      }
    }
  }
}

console.log(JSON.stringify({ verdict: fail.length ? 'FAIL' : 'PASS', failures: fail }, null, 2));
process.exit(fail.length ? 1 : 0);
