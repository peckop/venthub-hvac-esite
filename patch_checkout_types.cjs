/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const file = 'src/views/checkout/buildPaymentRequest.ts';
let content = fs.readFileSync(file, 'utf8');

content = "import { safeNumber, safeString } from '../../utils/type-converters'\n" + content;

content = content.replace(
  /price: Number\(it\.product\.price \|\| 0\),/g,
  "price: safeNumber(it.product.price),"
);

content = content.replace(
  /const shippingAddress = normalizeAddress\(shipping\)/,
  "const shippingAddress = { ...normalizeAddress(shipping), address_type: 'shipping' }"
);

content = content.replace(
  /const billingAddress = sameAsShipping \? shippingAddress : normalizeAddress\(billing\)/,
  "const billingAddress = sameAsShipping ? { ...shippingAddress, address_type: 'billing' } : { ...normalizeAddress(billing), address_type: 'billing' }"
);

fs.writeFileSync(file, content);
console.warn('src/views/checkout/buildPaymentRequest.ts patched for types');
