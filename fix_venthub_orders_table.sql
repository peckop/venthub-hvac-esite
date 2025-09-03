tr-- Fix venthub_orders table schema to match what the Edge Function expects
-- This script will add any missing columns and ensure the table structure is correct

DO $$ 
DECLARE
    column_exists BOOLEAN;
BEGIN 
    -- Check if the table exists first
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'venthub_orders' AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'venthub_orders table does not exist!';
    END IF;
    
    -- Add shipping_method column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'shipping_method'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE public.venthub_orders 
        ADD COLUMN shipping_method TEXT DEFAULT 'standard';
        RAISE NOTICE 'Added shipping_method column';
    END IF;
    
    -- Add subtotal_snapshot column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'subtotal_snapshot'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE public.venthub_orders 
        ADD COLUMN subtotal_snapshot DECIMAL(10,2);
        RAISE NOTICE 'Added subtotal_snapshot column';
    END IF;
    
    -- Add invoice_type column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'invoice_type'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE public.venthub_orders 
        ADD COLUMN invoice_type TEXT;
        RAISE NOTICE 'Added invoice_type column';
    END IF;
    
    -- Add invoice_info column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'invoice_info'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE public.venthub_orders 
        ADD COLUMN invoice_info JSONB;
        RAISE NOTICE 'Added invoice_info column';
    END IF;
    
    -- Add legal_consents column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'legal_consents'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE public.venthub_orders 
        ADD COLUMN legal_consents JSONB;
        RAISE NOTICE 'Added legal_consents column';
    END IF;
    
    -- Add conversation_id column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'conversation_id'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE public.venthub_orders 
        ADD COLUMN conversation_id TEXT;
        RAISE NOTICE 'Added conversation_id column';
    END IF;
    
    -- Add payment_token column if it doesn't exist (used later in the function)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'payment_token'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE public.venthub_orders 
        ADD COLUMN payment_token TEXT;
        RAISE NOTICE 'Added payment_token column';
    END IF;
    
    RAISE NOTICE 'venthub_orders table schema check completed successfully!';
END $$;

-- Show the final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'venthub_orders' AND table_schema = 'public' 
ORDER BY ordinal_position;
