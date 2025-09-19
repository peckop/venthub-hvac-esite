# OPERATIONS & STOCK PLAN — VentHub HVAC

Last updated: 2025-09-19

Scope
- Minimal, user-friendly stock management for you (admin) and clear stock UX for customers.
- Safe inventory foundation: atomic, idempotent updates; audit trail with inventory_movements.
- “Stokta / Stokta yok” badges on customer side; “Stok sor” action (mailto now, WhatsApp link next).
- Minimal shipping ops: carrier + tracking number entry and status updates.

Milestones
- M1 (this sprint)
  - Inventory schema: products.stock_qty, inventory_movements, inventory_settings, products.low_stock_threshold
  - RPCs: set_stock, adjust_stock
  - RLS policies (admin-only writes via RPC)
  - Admin UI: Operasyon > Stok page with search, +/−, Set, reason presets, per-product threshold override
  - Customer UI: “Stokta / Stokta yok”, Add to cart disabled when out of stock, “Stok sor” mailto
  - Checkout stock revalidation
- M2
  - WhatsApp deeplink (wa.me) via config (VITE_SHOP_WHATSAPP)
  - Low-stock notifications (email or Slack) when crossing threshold
- M3
  - Minimal returns: restock on approved return (positive movement)
  - Shipments skeleton (optional): table and UI read-only, manual entry kept in order fields for now
- M4+
  - Advanced Admin (bulk ops, labels, roles), Carriers API integrations

Database changes (SQL outline)

Batch Undo Extensions (Migrations)
- inventory_movements: `batch_id` (uuid), metadata columns `original_movement_id`, `reversed_by_movement_id`, `undo_by_user_id`, `undo_at`
- RPC: `reverse_inventory_batch(p_batch_id uuid, p_max_minutes int default 30)` — creates compensating movements and reverts stock; enforces a default 30‑minute window
- Grants: execute to authenticated/service_role
- Columns and tables
  - venthub_products
    - stock_qty int not null default 0
    - low_stock_threshold int null
  - inventory_settings (single-row settings)
    - id boolean primary key default true
    - default_low_stock_threshold int not null default 5
    - updated_at timestamptz not null default now()
  - venthub_inventory_movements
    - id uuid pk default gen_random_uuid()
    - product_id uuid not null references venthub_products(id)
    - order_id uuid null references venthub_orders(id)
    - delta int not null  -- positive adds stock, negative removes
    - reason text not null check (char_length(reason) between 3 and 32)
    - created_at timestamptz not null default now()
    - unique (order_id, product_id, reason) where order_id is not null  -- prevents double-deduct for same order+reason

- RLS (high-level)
  - venthub_products: update of stock fields only via RPC or admin role
  - venthub_inventory_movements: insert via RPC; select allowed to admin; optionally read-only aggregate to other roles
  - inventory_settings: select all; update admin only

RPCs (security definer)
- set_stock(p_product_id uuid, p_new_qty int, p_reason text)
  - Lock row FOR UPDATE, compute delta = new_qty − current, update, insert movement if delta != 0
- adjust_stock(p_product_id uuid, p_delta int, p_reason text)
  - Lock row FOR UPDATE, update by delta, insert movement
- Purchase hook (order fulfillment)
  - Within payment success flow, perform atomic deduction per order with idempotent guard (unique key)

Admin UI — Operasyon > Stok (UX spec)

CSV Import Flow (with Batch Undo)
1) Import modal: select CSV (SKU,Qty). Preview renders current/new/delta and a Status column (OK/Kritik/Tükenecek) per row.
2) Dry‑run: validate without writing.
3) Apply: a single `batch_id` is generated; each movement written with this batch.
4) Success toast: “Hareketleri Gör” (opens /admin/movements?batch=...) and “Geri Al” (invokes reverse_inventory_batch) actions.
5) Time window: reverse allowed by default for 30 minutes after batch creation; after that, function raises UNDO_WINDOW_EXPIRED.

Single Undo (Last Movement)
- In the right drawer, a “Geri Al (10 dk)” button reverts the very latest movement (if younger than 10 minutes and not itself an “undo”).
- List/table
  - Columns: Image, Name, SKU, Stock, Threshold (effective), Status badge (Low stock)
  - Search by name; pagination and virtualization for performance
- Row actions
  - +1 / −1 buttons
  - Set quantity (direct number) ve Kaydet; optimistic update ile “Satılabilir” anında güncellenir
  - Inline threshold edit: use default or override per product (rozet + input + Kaydet + Varsayılan)
  - Row click = select; selection context panel (Hızlı Eşik Ayarları) yalnızca seçim olduğunda görünür
- Mini movement history: last 5 changes (enabled)
- Undo (single): revert the latest change within 10 minutes (enabled)
  - Safeguard: “undo” movements themselves cannot be undone
  - Reason format: `undo:<shortId>` to respect DB reason length
- CSV preview: shows delta and status warnings (will become 0 → “Out”, or <= effective threshold → “Critical”)
- Bulk actions
  - Multi-select rows for bulk adjust/set
- CSV import/export (SKU, qty) + batch undo
- Settings
  - Global default_low_stock_threshold input

Customer UI — Stock & Contact
- Badge: “Stokta” (green) when stock_qty > 0; “Stokta yok” (red) otherwise
- Add to cart disabled when out of stock
- “Stok sor” button when out of stock
  - Phase 1: mailto link with prefilled subject/body
  - Phase 2: WhatsApp deeplink (wa.me/{phone}) if configured
- Checkout: server-side revalidation before payment authorization/capture

WhatsApp integration plan
- Phase 1 (no API): wa.me deeplink
  - Config: VITE_SHOP_WHATSAPP=90XXXXXXXXXX
  - Frontend builds link with product name/SKU prefilled
- Phase 2 (Cloud API, optional)
  - Secure token storage (server-side only), templated messages for stock inquiry and order updates
  - Opt-in and compliance (KVKK/GDPR)

Shipping operations (minimal)
- Email notification (Resend)
  - Flow: admin-update-shipping → shipping-notification (authorized server-to-server)
  - Derivation: customer email/name via Auth Admin API (service role)
  - Test flags: EMAIL_TEST_MODE/EMAIL_TEST_TO; BCC: SHIP_EMAIL_BCC
  - From fallback: onboarding@resend.dev if custom domain not verified yet
- Future: branded HTML template + per‑carrier tracking CTA (Initialized)
- Persist email logs: shipping_email_events (kargo) ve order_email_events (sipariş onayı) — order_id, to, subject, provider id (ve kargo için carrier/tracking); RLS ENABLE + policy (INSERT: service_role, SELECT: admin/superadmin)
- Order detail/admin operations allow entering/updating: carrier_name, tracking_number, shipped_at
- Status transition to shipped triggers optional email notification
- Future: shipments table with shipment_items; carrier webhooks/polling moves status automatically

Acceptance criteria
- Admin can quickly adjust/set stock with minimal clicks and keyboard shortcuts
- Every stock change creates exactly one movement row, with correct reason and delta
- Customer sees clear “Stokta / Stokta yok”; cannot add out-of-stock items to cart
- Checkout prevents oversell (revalidation)
- Low-stock badge appears when stock_qty <= effective_threshold (COALESCE(product.low_stock_threshold, settings.default))

Rollout steps
1) DB migration
   - Add columns/tables and indexes; enable RLS and policies
2) RPC deploy
   - set_stock, adjust_stock; grant execute to authenticated/admin
3) Edge/Server update
   - Payment success flow deducts stock atomically with idempotent guard
4) Admin UI
   - Implement Operasyon > Stok page and Settings panel
5) Customer UI
   - Badges and Stok sor (mailto); wire up revalidation on checkout
6) QA
   - Concurrency tests; idempotency (double-callback) test; UI smoke tests; a11y/lighthouse pass

Future extensibility (no-regret)
- Multi-warehouse: add warehouses and inventory_levels; maintain stock_qty via trigger or view
- Variants: move stock to product_variants; same movement model applies
- Returns/exchanges: positive movement with reason='return'
- Shipments: additive schema; today’s tracking fields migrate naturally to shipments table

