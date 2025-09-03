-- COMPLETE Migration: VentHub Payment System Database Schema
-- Date: 2025-09-03
-- Purpose: Complete restore of payment system tables and schema
-- This migration will recreate everything from scratch if needed

-- ========================================
-- 1. CREATE VENTHUB_ORDERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.venthub_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT,
    user_id UUID REFERENCES auth.users(id),
    conversation_id TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    subtotal_snapshot DECIMAL(10,2),
    shipping_address JSONB,
    billing_address JSONB,
    customer_email TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    payment_method TEXT DEFAULT 'iyzico',
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    invoice_type TEXT,
    invoice_info JSONB,
    legal_consents JSONB,
    shipping_method TEXT DEFAULT 'standard',
    payment_debug JSONB,
    payment_token TEXT,
    carrier TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints for venthub_orders
DO $$
BEGIN
    -- Order status constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'venthub_orders_status_check'
    ) THEN
        ALTER TABLE public.venthub_orders 
        ADD CONSTRAINT venthub_orders_status_check 
        CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]));
    END IF;
    
    -- Payment status constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'venthub_orders_payment_status_check'
    ) THEN
        ALTER TABLE public.venthub_orders 
        ADD CONSTRAINT venthub_orders_payment_status_check 
        CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text]));
    END IF;
END $$;

-- ========================================
-- 2. CREATE VENTHUB_ORDER_ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.venthub_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.venthub_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    product_sku TEXT,
    product_brand TEXT,
    product_image_url TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    -- Snapshot fields (optional)
    unit_price_snapshot DECIMAL(10,2),
    price_list_id_snapshot UUID,
    product_name_snapshot TEXT,
    product_sku_snapshot TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE public.venthub_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venthub_order_items ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. CREATE RLS POLICIES
-- ========================================

-- venthub_orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.venthub_orders;
CREATE POLICY "Users can view their own orders" 
ON public.venthub_orders FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.venthub_orders;
CREATE POLICY "Users can insert their own orders" 
ON public.venthub_orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can do everything on orders" ON public.venthub_orders;
CREATE POLICY "Service role can do everything on orders" 
ON public.venthub_orders 
USING (auth.jwt() ->> 'role' = 'service_role');

-- venthub_order_items policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.venthub_order_items;
CREATE POLICY "Users can view their own order items" 
ON public.venthub_order_items FOR SELECT 
USING (order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role can do everything on order items" ON public.venthub_order_items;
CREATE POLICY "Service role can do everything on order items" 
ON public.venthub_order_items 
USING (auth.jwt() ->> 'role' = 'service_role');

-- ========================================
-- 5. CREATE INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_venthub_orders_user_id ON public.venthub_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_status ON public.venthub_orders(status);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_payment_status ON public.venthub_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_created_at ON public.venthub_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_conversation_id ON public.venthub_orders(conversation_id);

CREATE INDEX IF NOT EXISTS idx_venthub_order_items_order_id ON public.venthub_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_product_id ON public.venthub_order_items(product_id);

-- ========================================
-- 6. CREATE UPDATE TRIGGERS
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_venthub_orders_updated_at ON public.venthub_orders;
CREATE TRIGGER update_venthub_orders_updated_at
    BEFORE UPDATE ON public.venthub_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venthub_order_items_updated_at ON public.venthub_order_items;
CREATE TRIGGER update_venthub_order_items_updated_at
    BEFORE UPDATE ON public.venthub_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ========================================
COMMENT ON TABLE public.venthub_orders IS 'Complete payment system orders table - recreated 2025-09-03';
COMMENT ON TABLE public.venthub_order_items IS 'Order items with all required fields - recreated 2025-09-03';
COMMENT ON COLUMN public.venthub_orders.status IS 'Order status: pending, confirmed, processing, shipped, delivered, cancelled';
COMMENT ON COLUMN public.venthub_orders.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN public.venthub_order_items.total_price IS 'unit_price * quantity - calculated field';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ VentHub Payment System database schema created successfully!';
    RAISE NOTICE '📋 Tables: venthub_orders, venthub_order_items';  
    RAISE NOTICE '🔐 RLS policies enabled and configured';
    RAISE NOTICE '📊 Indexes and triggers created';
END $$;
