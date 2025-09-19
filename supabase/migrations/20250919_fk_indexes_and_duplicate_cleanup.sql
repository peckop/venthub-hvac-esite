-- Add missing foreign key indexes and drop duplicate index per performance advisor
BEGIN;

-- Missing FK indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_coupons_created_by ON public.coupons (created_by);
CREATE INDEX IF NOT EXISTS idx_order_attachments_created_by ON public.order_attachments (created_by);
CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON public.order_attachments (order_id);
CREATE INDEX IF NOT EXISTS idx_order_email_events_order_id ON public.order_email_events (order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_user_id ON public.order_notes (user_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_price_list_id ON public.product_prices (price_list_id);
CREATE INDEX IF NOT EXISTS idx_user_invoice_profiles_user_id ON public.user_invoice_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_order_id ON public.venthub_order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_product_id ON public.venthub_order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_user_id ON public.venthub_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_venthub_returns_order_id ON public.venthub_returns (order_id);
CREATE INDEX IF NOT EXISTS idx_venthub_returns_user_id ON public.venthub_returns (user_id);

-- Duplicate index cleanup (keep cart_items_cart_product_unique, drop the duplicate)
DROP INDEX IF EXISTS public.cart_items_cart_product_uniq;

COMMIT;
