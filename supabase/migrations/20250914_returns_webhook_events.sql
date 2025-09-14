BEGIN;

-- 1) Returns webhook audit/dedup table
CREATE TABLE IF NOT EXISTS public.returns_webhook_events (
  id bigserial PRIMARY KEY,
  event_id text NOT NULL UNIQUE,
  return_id uuid NULL,
  order_id uuid NULL,
  carrier text NULL,
  tracking_number text NULL,
  status_raw text NULL,
  status_mapped text NULL,
  body_hash text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz NULL
);
CREATE INDEX IF NOT EXISTS returns_webhook_events_return_id_idx ON public.returns_webhook_events(return_id);
CREATE INDEX IF NOT EXISTS returns_webhook_events_received_at_idx ON public.returns_webhook_events(received_at DESC);
ALTER TABLE public.returns_webhook_events ENABLE ROW LEVEL SECURITY;

-- 2) Minimal policy: Service role only (edge functions). No public access.
-- (RLS defaults to deny; functions use service role.)

COMMIT;
