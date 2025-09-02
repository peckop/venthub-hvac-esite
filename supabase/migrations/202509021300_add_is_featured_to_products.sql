-- Add is_featured column to products for homepage highlighting
begin;

-- Add is_featured column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;
END$$;

-- Add index for performance
create index if not exists products_is_featured_idx on public.products (is_featured);

commit;
