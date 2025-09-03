-- Add shipping_method column to venthub_orders table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venthub_orders' 
        AND column_name = 'shipping_method'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.venthub_orders 
        ADD COLUMN shipping_method TEXT DEFAULT 'standard';
        
        -- Add a comment to the column
        COMMENT ON COLUMN public.venthub_orders.shipping_method IS 'Shipping method for the order';
        
        -- Output confirmation
        RAISE NOTICE 'shipping_method column added to venthub_orders table';
    ELSE
        RAISE NOTICE 'shipping_method column already exists in venthub_orders table';
    END IF;
END $$;
