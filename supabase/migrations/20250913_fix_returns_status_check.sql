BEGIN;

-- Normalize legacy statuses to the canonical set used by UI and notifications
UPDATE public.venthub_returns SET status = 'in_transit' WHERE status = 'processing';
UPDATE public.venthub_returns SET status = 'refunded'  WHERE status = 'completed';

-- Recreate the CHECK constraint with the canonical allowed values
ALTER TABLE public.venthub_returns DROP CONSTRAINT IF EXISTS venthub_returns_status_check;
ALTER TABLE public.venthub_returns
  ADD CONSTRAINT venthub_returns_status_check
  CHECK (status IN ('requested','approved','rejected','in_transit','received','refunded','cancelled'));

COMMIT;
