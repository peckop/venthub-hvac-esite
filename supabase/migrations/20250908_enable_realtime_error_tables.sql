-- Ensure Realtime publication includes error tables (idempotent)
-- Created: 2025-09-08

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'error_groups'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.error_groups;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'client_errors'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.client_errors;
    END IF;
  END IF;
END $$;
