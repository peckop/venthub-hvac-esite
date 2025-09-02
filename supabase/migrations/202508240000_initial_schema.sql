-- Initial schema: Core tables creation (idempotent)
-- This migration creates the foundational tables referenced by subsequent migrations

begin;

-- Products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  price numeric,
  status text default 'active' check (status in ('active', 'inactive', 'draft')),
  category_id uuid,
  brand_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  parent_id uuid references public.categories(id),
  created_at timestamptz default now()
);

-- Brands table
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  description text,
  logo_url text,
  created_at timestamptz default now()
);

-- VentHub Orders table (core e-commerce)
create table if not exists public.venthub_orders (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled','refunded')),
  total_amount numeric not null default 0,
  currency text not null default 'TRY',
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded','partial')),
  conversation_id text,
  notes text,
  shipping_address jsonb,
  billing_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- VentHub Order Items
create table if not exists public.venthub_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.venthub_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric not null default 0,
  total_price numeric generated always as (quantity * unit_price) stored,
  product_name text, -- snapshot
  product_sku text,  -- snapshot
  created_at timestamptz default now()
);

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_category_fkey'
  ) THEN
    ALTER TABLE public.products 
      ADD CONSTRAINT products_category_fkey 
      FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_brand_fkey'
  ) THEN
    ALTER TABLE public.products 
      ADD CONSTRAINT products_brand_fkey 
      FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Basic indexes
create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists venthub_orders_user_idx on public.venthub_orders (user_id);
create index if not exists venthub_orders_status_idx on public.venthub_orders (status);
create index if not exists venthub_order_items_order_idx on public.venthub_order_items (order_id);
create index if not exists venthub_order_items_product_idx on public.venthub_order_items (product_id);

-- Updated at trigger function (reusable)
create or replace function public.trigger_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Price lists table
create table if not exists public.price_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Product images table
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Product documents table
create table if not exists public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  document_url text not null,
  document_name text not null,
  document_type text,
  created_at timestamptz default now()
);

-- Technical specifications table
create table if not exists public.technical_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  spec_name text not null,
  spec_value text not null,
  spec_unit text,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Turkey cities table
create table if not exists public.turkey_cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  plate_code integer unique,
  region text,
  created_at timestamptz default now()
);

-- User profiles table
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cart items table  
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Additional indexes
create index if not exists product_images_product_idx on public.product_images (product_id);
create index if not exists product_documents_product_idx on public.product_documents (product_id);
create index if not exists technical_specifications_product_idx on public.technical_specifications (product_id);
create index if not exists cart_items_user_idx on public.cart_items (user_id);
create index if not exists cart_items_product_idx on public.cart_items (product_id);

-- Updated at triggers (idempotent)
DO $$
BEGIN
  -- Drop and recreate triggers to ensure idempotency
  DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
  CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
    
  DROP TRIGGER IF EXISTS trg_venthub_orders_updated_at ON public.venthub_orders;
  CREATE TRIGGER trg_venthub_orders_updated_at
    BEFORE UPDATE ON public.venthub_orders
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
    
  DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
  CREATE TRIGGER trg_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
    
  DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
  CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
END$$;

commit;
