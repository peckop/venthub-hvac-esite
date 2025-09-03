-- Sipariş tablolarını oluştur
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Venthub orders tablosu (ana sipariş tablosu)
CREATE TABLE IF NOT EXISTS public.venthub_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    
    -- Müşteri bilgileri
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Teslimat adresi
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Fatura bilgileri
    invoice_type VARCHAR(50) DEFAULT 'individual',
    invoice_info JSONB,
    
    -- Ödeme bilgileri
    payment_method VARCHAR(50) DEFAULT 'iyzico',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_reference VARCHAR(255),
    
    -- Tarihler
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- İyzico için
    conversation_id VARCHAR(255),
    iyzico_payment_id VARCHAR(255)
);

-- 2. Venthub order items tablosu (sipariş kalemleri)
CREATE TABLE IF NOT EXISTS public.venthub_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.venthub_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Ürün anlık bilgileri (snapshot)
    product_name VARCHAR(255),
    product_sku VARCHAR(100),
    product_image_url TEXT,
    
    -- Fiyat bilgileri snapshot
    price_at_time DECIMAL(10,2),
    unit_price_snapshot DECIMAL(10,2),
    price_list_id_snapshot UUID,
    product_name_snapshot VARCHAR(255),
    product_sku_snapshot VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Updated at trigger'lar
DROP TRIGGER IF EXISTS venthub_orders_updated_at ON public.venthub_orders;
CREATE TRIGGER venthub_orders_updated_at
    BEFORE UPDATE ON public.venthub_orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS venthub_order_items_updated_at ON public.venthub_order_items;
CREATE TRIGGER venthub_order_items_updated_at
    BEFORE UPDATE ON public.venthub_order_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. RLS ayarları
ALTER TABLE public.venthub_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venthub_order_items ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi siparişlerini görebilir
DROP POLICY IF EXISTS "Users can view their own orders" ON public.venthub_orders;
CREATE POLICY "Users can view their own orders" ON public.venthub_orders
FOR ALL USING (user_id = auth.uid());

-- Kullanıcılar sadece kendi sipariş kalemlerini görebilir
DROP POLICY IF EXISTS "Users can view their own order items" ON public.venthub_order_items;
CREATE POLICY "Users can view their own order items" ON public.venthub_order_items
FOR ALL USING (
    order_id IN (
        SELECT id FROM public.venthub_orders WHERE user_id = auth.uid()
    )
);

-- Admin'ler tüm siparişleri görebilir
DROP POLICY IF EXISTS "Admins can view all orders" ON public.venthub_orders;
CREATE POLICY "Admins can view all orders" ON public.venthub_orders
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can view all order items" ON public.venthub_order_items;
CREATE POLICY "Admins can view all order items" ON public.venthub_order_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. İndeksler
CREATE INDEX IF NOT EXISTS idx_venthub_orders_user_id ON public.venthub_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_status ON public.venthub_orders(status);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_payment_status ON public.venthub_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_venthub_orders_created_at ON public.venthub_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_order_id ON public.venthub_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_product_id ON public.venthub_order_items(product_id);

-- 6. Order number sequence için fonksiyon
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    order_num VARCHAR(50);
BEGIN
    -- Format: VH-YYYYMMDD-NNNN
    order_num := 'VH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                 LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- 7. Order number otomatik atama trigger'ı
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number_trigger ON public.venthub_orders;
CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON public.venthub_orders
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- 8. Kontrol et
SELECT 'venthub_orders' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'venthub_orders' AND table_schema = 'public'
ORDER BY ordinal_position;
