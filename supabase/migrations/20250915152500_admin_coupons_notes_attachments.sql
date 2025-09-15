-- 2025-09-15 Create coupons, order_notes, order_attachments with RLS and grants
-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

SET LOCAL search_path = public, extensions;

-- Helper trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  code text UNIQUE NOT NULL CHECK (length(code) >= 3 AND length(code) <= 50),
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage','fixed_amount')),
  discount_value decimal(10,2) NOT NULL CHECK (discount_value > 0),
  minimum_order_amount decimal(10,2) DEFAULT 0 CHECK (minimum_order_amount >= 0),
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit > 0),
  used_count integer DEFAULT 0 CHECK (used_count >= 0),
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_date_range CHECK (valid_until IS NULL OR valid_until > valid_from),
  CONSTRAINT usage_limit_check CHECK (usage_limit IS NULL OR used_count <= usage_limit)
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active_valid ON public.coupons(is_active, valid_from, valid_until) WHERE is_active = true;

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can manage coupons" ON public.coupons;
CREATE POLICY "Admin users can manage coupons" ON public.coupons
  FOR ALL TO authenticated USING (is_admin_user(auth.uid())) WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons" ON public.coupons
  FOR SELECT TO anon, authenticated USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Order notes
CREATE TABLE IF NOT EXISTS public.order_notes (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.venthub_orders(id) ON DELETE CASCADE,
  note text NOT NULL CHECK (length(note) >= 1),
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON public.order_notes(order_id);
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can manage order notes" ON public.order_notes;
CREATE POLICY "Admin users can manage order notes" ON public.order_notes
  FOR ALL TO authenticated USING (is_admin_user(auth.uid())) WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Order owners can view non-internal notes" ON public.order_notes;
CREATE POLICY "Order owners can view non-internal notes" ON public.order_notes
  FOR SELECT TO authenticated USING (
    NOT is_internal AND order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid())
  );

-- Order attachments
CREATE TABLE IF NOT EXISTS public.order_attachments (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.venthub_orders(id) ON DELETE CASCADE,
  filename text NOT NULL CHECK (length(filename) >= 1),
  file_path text NOT NULL,
  file_size bigint CHECK (file_size > 0),
  mime_type text,
  description text,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON public.order_attachments(order_id);
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can manage order attachments" ON public.order_attachments;
CREATE POLICY "Admin users can manage order attachments" ON public.order_attachments
  FOR ALL TO authenticated USING (is_admin_user(auth.uid())) WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Order owners can view non-internal attachments" ON public.order_attachments;
CREATE POLICY "Order owners can view non-internal attachments" ON public.order_attachments
  FOR SELECT TO authenticated USING (
    NOT is_internal AND order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid())
  );

-- Grants required by PostgREST even with RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_attachments TO authenticated;

-- Refresh PostgREST cache after DDL
NOTIFY pgrst, 'reload schema';
