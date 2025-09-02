-- Products tablosuna stok management kolonları ekle
-- Hızlı fix: stock_qty ve low_stock_threshold kolonları eksik

begin;

-- Stok kolonlarını ekle (idempotent - çoktan varsa hata vermez)
DO $$
BEGIN
  -- stock_qty kolonu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'stock_qty'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN stock_qty integer NOT NULL DEFAULT 0;
    
    RAISE NOTICE 'Added stock_qty column to products table';
  ELSE
    RAISE NOTICE 'stock_qty column already exists';
  END IF;

  -- low_stock_threshold kolonu ekle  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN low_stock_threshold integer NULL DEFAULT 5;
    
    RAISE NOTICE 'Added low_stock_threshold column to products table';
  ELSE
    RAISE NOTICE 'low_stock_threshold column already exists';
  END IF;
END $$;

-- Mevcut ürünlere test stok değerleri ver (sadece 0 olanlar için)
UPDATE public.products 
SET stock_qty = 50, low_stock_threshold = 5 
WHERE stock_qty = 0 OR stock_qty IS NULL;

-- Kontrol query
SELECT 
  count(*) as product_count,
  avg(stock_qty) as avg_stock,
  min(stock_qty) as min_stock,
  max(stock_qty) as max_stock
FROM public.products;

commit;
