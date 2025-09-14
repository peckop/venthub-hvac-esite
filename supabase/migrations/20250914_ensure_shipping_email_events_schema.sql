BEGIN;

-- Ensure shipping_email_events table and schema are present and consistent
-- Idempotent: safe to run multiple times

-- 1) Create table if missing
CREATE TABLE IF NOT EXISTS public.shipping_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NULL,
  email_to text NOT NULL,
  subject text NOT NULL,
  provider text NOT NULL,
  provider_message_id text NULL,
  carrier text NULL,
  tracking_number text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Add missing columns if any (types match our write path)
ALTER TABLE public.shipping_email_events
  ADD COLUMN IF NOT EXISTS order_id uuid NULL,
  ADD COLUMN IF NOT EXISTS email_to text,
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS provider_message_id text,
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz;

-- 3) Ensure defaults are set for id and created_at
ALTER TABLE public.shipping_email_events
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.shipping_email_events
  ALTER COLUMN created_at SET DEFAULT now();

-- 4) Optional: lightweight index for recent queries
CREATE INDEX IF NOT EXISTS shipping_email_events_created_at_idx ON public.shipping_email_events(created_at DESC);

COMMIT;
