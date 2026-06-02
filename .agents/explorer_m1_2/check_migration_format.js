import fs from 'fs';

const applied = JSON.parse(fs.readFileSync('c:\\Users\\alize\\venthub-hvac\\.agents\\explorer_m1_2\\all_applied_migrations.json', 'utf8'));

console.log('Total applied:', applied.length);

const dateBased = applied.filter(v => v.length === 8 || v.includes('_') || !/^\d{14}$/.test(v));
console.log('Non-standard format migrations in database:', dateBased);

const search = applied.filter(v => v.includes('20250909') || v.includes('20250909_debug'));
console.log('Search for 20250909:', search);
