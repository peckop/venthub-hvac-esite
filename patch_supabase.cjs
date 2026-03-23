/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const file = 'src/lib/supabase.ts';
let content = fs.readFileSync(file, 'utf8');

// The error mentioned: "InvoiceProfile and Address modellerinde type ve address_line gibi zorunlu alanlar sağlanmadığı için TypeScript hataları veriyor."
// Let's check `createInvoiceProfile` and `createAddress`
content = content.replace(
  /export async function createInvoiceProfile\(payload: Partial<InvoiceProfile>\): Promise<InvoiceProfile> \{/,
  "export async function createInvoiceProfile(payload: Partial<InvoiceProfile>): Promise<InvoiceProfile> {\n  if (!payload.type) payload.type = 'individual';"
);

content = content.replace(
  /export interface CreateAddressInput \{/,
  "export interface CreateAddressInput {\n  address_type?: string;\n  address_line?: string;"
);

content = content.replace(
  /const dbPayload: DbUserAddressInsert = \{/g,
  "const dbPayload: DbUserAddressInsert = {\n    address_type: payload.address_type || (payload.is_default_shipping ? 'shipping' : 'billing'),\n    address_line: payload.address_line || payload.full_address || '',"
);

fs.writeFileSync(file, content);
console.warn('src/lib/supabase.ts updated');
