const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const norm = p => String(p).split('\\').join('/');
const base = p => norm(p).split('/').slice(-2).join('/');

const fail = [];

// 1) Read findings.json (can be a file or a directory of JSON analyst outputs)
const findingsPath = process.argv[2];
let findings = [];

if (!findingsPath || !fs.existsSync(findingsPath)) {
  fail.push(`Findings path not found: ${findingsPath}`);
} else {
  try {
    const stat = fs.statSync(findingsPath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(findingsPath).filter(f => f.endsWith('.json'));
      if (files.length === 0) {
        fail.push(`No JSON findings found in directory: ${findingsPath}`);
      }
      for (const file of files) {
        const filePath = path.join(findingsPath, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            findings.push(...parsed);
          } else {
            findings.push(parsed);
          }
        } catch (err) {
          fail.push(`[Malformed output] Analyst output file "${file}" is not valid JSON: ${err.message}`);
        }
      }
    } else {
      try {
        const content = fs.readFileSync(findingsPath, 'utf8');
        findings = JSON.parse(content);
        if (Array.isArray(findings)) {
          findings = findings.flat();
        } else {
          findings = [findings];
        }
      } catch (err) {
        fail.push(`[Malformed output] Findings file "${findingsPath}" is not valid JSON: ${err.message}`);
      }
    }
  } catch (err) {
    fail.push(`Error reading findings: ${err.message}`);
  }
}

let plan = {};
const planPath = process.argv[3];
if (!planPath || !fs.existsSync(planPath)) {
  fail.push(`Plan path not found: ${planPath}`);
} else {
  try {
    plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  } catch (err) {
    fail.push(`Plan file "${planPath}" is not valid JSON: ${err.message}`);
  }
}

let rules = {};
const rulesPath = process.argv[4];
if (!rulesPath || !fs.existsSync(rulesPath)) {
  fail.push(`Rules path not found: ${rulesPath}`);
} else {
  try {
    rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  } catch (err) {
    fail.push(`Rules file "${rulesPath}" is not valid JSON: ${err.message}`);
  }
}

// Proceed only if findings were successfully loaded
if (findings.length > 0) {
  // 1) Scope check: ensure no empty files and no duplicate files
  const seen = new Set();
  for (const f of findings) {
    if (!f || typeof f !== 'object') continue;
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
    const findingBases = new Set(findings.map(f => f && f.file ? base(f.file) : ''));
    for (const expected of rules.scope.expectedFiles) {
      const expectedBase = base(expected);
      if (!findingBases.has(expectedBase)) {
        fail.push(`Scope omission: Expected file "${expected}" was not analyzed.`);
      }
    }
  }

  // 2) CLI-based deterministic counts validation with seedMode flexibility
  if (rules.cliValidation && rules.cliValidation.commandTemplate) {
    const seedMode = rules.seedMode || rules.cliValidation.seedMode || 'counter';
    if (seedMode !== 'none') {
      const files = [...new Set(findings.map(f => f && f.file).filter(f => f && !f.includes('[lang]')))];
      if (files.length) {
        const cmd = rules.cliValidation.commandTemplate.replace('{files}', files.map(f => JSON.stringify(f)).join(' '));
        let out = '';
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
            if (seedMode === 'counter') {
              fail.push(`Failed to parse CLI validation output: ${err.message}`);
            } else {
              console.warn(`[seedMode: ${seedMode}] Failed to parse CLI validation output: ${err.message}`);
            }
          }
        }
        
        const exactKey = rules.cliValidation.exactKey || 'exactLiteralCount';
        for (const f of findings) {
          if (!f || !f.file) continue;
          const r = real[base(f.file)];
          if (r !== undefined && r !== f[exactKey]) {
            if (seedMode === 'counter') {
              fail.push(`${f.file}: ${exactKey} ${f[exactKey]} != eslint actual ${r}`);
            } else {
              console.warn(`[seedMode: ${seedMode}] ${f.file}: ${exactKey} ${f[exactKey]} != eslint actual ${r}`);
            }
          }
        }
      }
    }
  }

  // 3) Per-file arithmetic and enum checks
  for (const f of findings) {
    if (!f) continue;
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
      const expected = findings.reduce((acc, f) => acc + Number((f && f[rule.findingKey]) || 0), 0);
      if (Number(plan[rule.planKey] || 0) !== expected) {
        fail.push(`Synthesizer summation mismatch: plan.${rule.planKey} (${plan[rule.planKey]}) !== sum of findings.${rule.findingKey} (${expected})`);
      }
    });
  }

  // 5) Sibling file parity validation (generalized group-based + metric-delta)
  if (rules.siblingParity && rules.siblingParity.pattern) {
    const parity = rules.siblingParity;
    const rx = new RegExp(parity.pattern);
    const groupIdx = parity.groupIndex !== undefined ? parity.groupIndex : 2;
    const variantIdx = parity.variantIndex !== undefined ? parity.variantIndex : 1;
    const metricKey = parity.metric || parity.key;
    const maxDelta = parity.maxDelta !== undefined ? parity.maxDelta : (parity.maxDifference !== undefined ? parity.maxDifference : 2);
    
    const groups = {};
    
    findings.forEach(f => {
      if (!f || !f.file) return;
      const m = norm(f.file).match(rx);
      if (m) {
        const groupName = m.groups?.group || m[groupIdx];
        const variantName = m.groups?.variant || m[variantIdx];
        if (groupName && variantName) {
          (groups[groupName] ??= {})[variantName] = f[metricKey];
        }
      }
    });
    
    for (const [name, p] of Object.entries(groups)) {
      const keys = Object.keys(p);
      for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
          const v1 = p[keys[i]];
          const v2 = p[keys[j]];
          if (v1 !== undefined && v2 !== undefined && Math.abs(v1 - v2) > maxDelta) {
            fail.push(`Sibling parity mismatch for "${name}": "${keys[i]}" (${v1}) vs "${keys[j]}" (${v2}) exceeds limit of ${maxDelta}`);
          }
        }
      }
    }
  }

  // 6) Exclusions validation (prevent trivial/done files in waves)
  const excludedRecs = (rules.exclusions && rules.exclusions.recommendations) || [];
  const excludedFiles = new Set(
    findings.filter(f => f && excludedRecs.includes(f.recommendation)).map(f => base(f.file))
  );
  
  for (const w of (plan.waves || [])) {
    for (const wf of (w.files || [])) {
      if (excludedFiles.has(base(wf))) {
        fail.push(`Wave "${w.name}" contains excluded file: ${wf}`);
      }
    }
  }

  // 7) Wave-completeness validation
  const expectedFilesForWaves = findings
    .filter(f => f && f.file && !excludedRecs.includes(f.recommendation))
    .map(f => base(f.file));
  
  const waveAssignments = {};
  for (const w of (plan.waves || [])) {
    for (const wf of (w.files || [])) {
      const wfBase = base(wf);
      (waveAssignments[wfBase] ??= []).push(w.name);
    }
  }
  
  for (const file of expectedFilesForWaves) {
    const assignments = waveAssignments[file] || [];
    if (assignments.length === 0) {
      fail.push(`Wave completeness: File "${file}" is audited but missing from implementation waves.`);
    } else if (assignments.length > 1) {
      fail.push(`Wave completeness: File "${file}" is assigned to multiple waves: [${assignments.join(', ')}].`);
    }
  }
}

console.log(JSON.stringify({ verdict: fail.length ? 'FAIL' : 'PASS', failures: fail }, null, 2));
process.exit(fail.length ? 1 : 0);
