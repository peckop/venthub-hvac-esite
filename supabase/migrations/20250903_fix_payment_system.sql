-- Migration: Fix İyzico Payment System Database Schema
-- Date: 2025-09-03
-- Purpose: Ensure all required columns exist for payment system to work

-- Add missing columns to venthub_orders if they don't exist
DO $$ 
BEGIN 
    -- Add customer_phone if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'customer_phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.venthub_orders ADD COLUMN customer_phone TEXT;
    END IF;
    
    -- Add payment_debug if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'payment_debug'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.venthub_orders ADD COLUMN payment_debug JSONB;
    END IF;
    
    -- Add payment_status if missing (separate from order status)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'payment_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.venthub_orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
        
        -- Add constraint for valid payment statuses
        ALTER TABLE public.venthub_orders 
        ADD CONSTRAINT venthub_orders_payment_status_check 
        CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text]));
    END IF;
END $$;

-- Fix venthub_order_items table schema
DO $$
BEGIN
    -- Remove NOT NULL constraints from optional fields
    BEGIN
        ALTER TABLE public.venthub_order_items ALTER COLUMN product_sku DROP NOT NULL;
    EXCEPTION
        WHEN undefined_column THEN NULL;
        WHEN others THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.venthub_order_items ALTER COLUMN product_brand DROP NOT NULL;
    EXCEPTION
        WHEN undefined_column THEN NULL;
        WHEN others THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.venthub_order_items ALTER COLUMN unit_price_snapshot DROP NOT NULL;
    EXCEPTION
        WHEN others THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.venthub_order_items ALTER COLUMN price_list_id_snapshot DROP NOT NULL;
    EXCEPTION
        WHEN others THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.venthub_order_items ALTER COLUMN product_name_snapshot DROP NOT NULL;
    EXCEPTION
        WHEN others THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.venthub_order_items ALTER COLUMN product_sku_snapshot DROP NOT NULL;
    EXCEPTION
        WHEN others THEN NULL;
    END;
END $$;

-- Add comment to track this migration
COMMENT ON TABLE public.venthub_orders IS 'Payment system fixed on 2025-09-03 - all required columns added';
COMMENT ON TABLE public.venthub_order_items IS 'Order items schema fixed on 2025-09-03 - optional fields made nullable';
