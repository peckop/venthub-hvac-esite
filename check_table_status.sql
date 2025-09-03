-- venthub_orders tablosunun mevcut durumunu kontrol et
SELECT 'venthub_orders table structure:' as info;

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'venthub_orders' AND table_schema = 'public' 
ORDER BY ordinal_position;

-- Tablonun var olup olmadığını kontrol et
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'venthub_orders' AND table_schema = 'public'
        ) THEN 'venthub_orders tablosu mevcut'
        ELSE 'venthub_orders tablosu MEVCUT DEĞİL!'
    END as table_status;

-- Eksik kolonları kontrol et
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'venthub_orders' 
            AND column_name = 'shipping_method'
            AND table_schema = 'public'
        ) THEN 'shipping_method kolonu EKSİK'
        ELSE 'shipping_method kolonu mevcut'
    END as shipping_method_status,
    
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'venthub_orders' 
            AND column_name = 'subtotal_snapshot'
            AND table_schema = 'public'
        ) THEN 'subtotal_snapshot kolonu EKSİK'
        ELSE 'subtotal_snapshot kolonu mevcut'
    END as subtotal_snapshot_status,
    
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'venthub_orders' 
            AND column_name = 'conversation_id'
            AND table_schema = 'public'
        ) THEN 'conversation_id kolonu EKSİK'
        ELSE 'conversation_id kolonu mevcut'
    END as conversation_id_status;
