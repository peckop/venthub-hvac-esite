begin;

-- Add purchase_price column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='purchase_price'
  ) THEN
    ALTER TABLE public.products ADD COLUMN purchase_price numeric(12,2) NULL;
  END IF;
END $$;

-- Add slug column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='slug'
  ) THEN
    ALTER TABLE public.products ADD COLUMN slug text NULL;
  END IF;
END $$;

-- Add meta_title column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='meta_title'
  ) THEN
    ALTER TABLE public.products ADD COLUMN meta_title text NULL;
  END IF;
END $$;

-- Add meta_description column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='meta_description'
  ) THEN
    ALTER TABLE public.products ADD COLUMN meta_description text NULL;
  END IF;
END $$;

-- Unique index on lower(slug) for case-insensitive uniqueness
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='slug'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='products' AND indexname='uq_products_slug_lower'
  ) THEN
    CREATE UNIQUE INDEX uq_products_slug_lower ON public.products (lower(slug));
  END IF;
END $$;

commit;

