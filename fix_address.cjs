/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const file = 'src/lib/supabase.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /address_line: payload\.full_address,\n    street_address: payload\.full_address,\n    address_type: payload\.is_default_shipping \? 'shipping' : 'billing',/,
  "street_address: payload.full_address,"
);

fs.writeFileSync(file, content);
console.warn('Fixed duplicate keys');
