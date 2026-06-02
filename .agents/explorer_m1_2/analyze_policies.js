import fs from 'fs';

const r4Policies = [
  { table: 'coupons', name: 'coupons_public_select' },
  { table: 'coupons', name: 'coupons_admin_all' },
  { table: 'inventory_movements', name: 'inventory_movements_select_admin' },
  { table: 'inventory_settings', name: 'inventory_settings_select_all' },
  { table: 'inventory_settings', name: 'inventory_settings_update_admin' },
  { table: 'order_attachments', name: 'order_attachments_admin_all' },
  { table: 'order_attachments', name: 'order_attachments_view_policy' },
  { table: 'order_notes', name: 'order_notes_admin_all' },
  { table: 'order_notes', name: 'order_notes_view_policy' },
  { table: 'order_refund_events', name: 'order_refund_events_admin_select' },
  { table: 'price_lists', name: 'Anyone can view price lists' },
  { table: 'price_lists', name: 'price_lists_admin_all' },
  { table: 'price_lists', name: 'price_lists_select' },
  { table: 'product_prices', name: 'Anyone can view product prices' },
  { table: 'product_prices', name: 'product_prices_admin_all' },
  { table: 'product_prices', name: 'product_prices_select' },
  { table: 'tenants', name: 'tenants_select' },
  { table: 'user_addresses', name: 'user_addresses_delete' },
  { table: 'user_addresses', name: 'user_addresses_insert' },
  { table: 'user_addresses', name: 'user_addresses_select' },
  { table: 'user_addresses', name: 'user_addresses_update' },
  { table: 'user_profiles', name: 'user_profiles_insert_policy' },
  { table: 'user_profiles', name: 'user_profiles_update_policy' },
  { table: 'venthub_orders', name: 'orders_delete_policy' },
  { table: 'venthub_orders', name: 'orders_insert_policy' },
  { table: 'venthub_orders', name: 'orders_update_policy' },
  { table: 'venthub_returns', name: 'returns_update_policy' }
];

const scan = JSON.parse(fs.readFileSync('c:\\Users\\alize\\venthub-hvac\\.agents\\explorer_m1_2\\policies_scan.json', 'utf8'));

console.log('=== Current State of R4 Obsolete/Duplicate Policies ===');
r4Policies.forEach(p => {
  const found = scan.find(s => s.tablename === p.table && s.policyname === p.name);
  if (found) {
    console.log(`[PRESENT] Table: ${p.table} | Policy: "${p.name}" | Roles: {${found.roles.join(',')}} | Cmd: ${found.cmd}`);
  } else {
    console.log(`[ABSENT]  Table: ${p.table} | Policy: "${p.name}"`);
  }
});

console.log('\n=== Merged Policies (merged_*) active on these tables ===');
const tablesOfInterest = Array.from(new Set(r4Policies.map(p => p.table)));
tablesOfInterest.forEach(t => {
  const merged = scan.filter(s => s.tablename === t && s.policyname.startsWith('merged_'));
  if (merged.length > 0) {
    console.log(`Table: ${t} has merged policies:`);
    merged.forEach(m => {
      const rolesStr = Array.isArray(m.roles) ? m.roles.join(',') : m.roles;
      console.log(`  - "${m.policyname}" | Roles: ${rolesStr}`);
    });
  } else {
    console.log(`Table: ${t} has NO merged_* policies.`);
  }
});
