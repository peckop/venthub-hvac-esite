import fs from 'fs';
import path from 'path';

const migrationsDir = 'c:\\Users\\alize\\venthub-hvac\\supabase\\migrations';
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

let tables = new Set();
let policies = {}; // table -> set of policies

function clean(str) {
  if (!str) return '';
  return str.replace(/['"`]/g, '').trim().toLowerCase();
}

for (const file of files) {
  const filePath = path.join(migrationsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse CREATE TABLE statements
  const createTableRegex = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\s*\.\s*)?(?:"([^"]+)"|([a-zA-Z0-9_]+))/gi;
  let match;
  while ((match = createTableRegex.exec(content)) !== null) {
    const tableName = clean(match[1] || match[2]);
    tables.add(tableName);
    if (!policies[tableName]) {
      policies[tableName] = new Set();
    }
  }

  // Parse DROP TABLE statements
  const dropTableRegex = /drop\s+table\s+(?:if\s+exists\s+)?(?:public\s*\.\s*)?(?:"([^"]+)"|([a-zA-Z0-9_]+))/gi;
  while ((match = dropTableRegex.exec(content)) !== null) {
    const tableName = clean(match[1] || match[2]);
    tables.delete(tableName);
    delete policies[tableName];
  }

  // Parse CREATE POLICY statements
  const createPolicyRegex = /create\s+policy\s+(?:if\s+not\s+exists\s+)?(?:"([^"]+)"|([a-zA-Z0-9_-]+))\s+on\s+(?:public\s*\.\s*)?(?:"([^"]+)"|([a-zA-Z0-9_-]+))/gi;
  while ((match = createPolicyRegex.exec(content)) !== null) {
    const policyName = match[1] || match[2];
    const tableName = clean(match[3] || match[4]);
    if (!policies[tableName]) {
      policies[tableName] = new Set();
    }
    policies[tableName].add(policyName);
  }

  // Parse DROP POLICY statements
  const dropPolicyRegex = /drop\s+policy\s+(?:if\s+exists\s+)?(?:"([^"]+)"|([a-zA-Z0-9_-]+))\s+on\s+(?:public\s*\.\s*)?(?:"([^"]+)"|([a-zA-Z0-9_-]+))/gi;
  while ((match = dropPolicyRegex.exec(content)) !== null) {
    const policyName = match[1] || match[2];
    const tableName = clean(match[3] || match[4]);
    if (policies[tableName]) {
      policies[tableName].delete(policyName);
    }
  }

  // Parse dynamic policy helper _create_select_policy_if_absent
  const dynamicPolicyRegex = /_create_select_policy_if_absent\s*\(\s*'public'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/gi;
  while ((match = dynamicPolicyRegex.exec(content)) !== null) {
    const tableName = clean(match[1]);
    const policyName = match[2];
    if (!policies[tableName]) {
      policies[tableName] = new Set();
    }
    policies[tableName].add(policyName);
  }
  
  // Parse alternative dynamic helper enabling RLS
  const enableRlsRegex = /_enable_rls_if_exists\s*\(\s*'public\.([^']+)'\s*\)/gi;
  while ((match = enableRlsRegex.exec(content)) !== null) {
    const tableName = clean(match[1]);
    tables.add(tableName);
    if (!policies[tableName]) {
      policies[tableName] = new Set();
    }
  }
}

// Write outputs to JSON
const output = {
  tables: Array.from(tables).sort(),
  policies: {}
};
for (const table of Object.keys(policies).sort()) {
  if (policies[table].size > 0 && tables.has(table)) {
    output.policies[table] = Array.from(policies[table]).sort();
  }
}

fs.writeFileSync('c:\\Users\\alize\\venthub-hvac\\.agents\\sub_orch_m1\\parsed_schema.json', JSON.stringify(output, null, 2));
console.log(`Success! Parsed ${tables.size} tables and policies for active tables.`);
