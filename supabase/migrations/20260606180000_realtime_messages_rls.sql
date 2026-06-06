-- Enable RLS on realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Idempotently create the SELECT policy checking tenant ID
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'realtime' 
          AND tablename = 'messages' 
          AND policyname = 'realtime_messages_select_policy'
    ) THEN
        CREATE POLICY "realtime_messages_select_policy" ON realtime.messages
          FOR SELECT TO authenticated
          USING (realtime.topic() LIKE '%' || public.jwt_tenant_id()::text || '%');
    END IF;

    -- Idempotently create the INSERT policy checking tenant ID
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'realtime' 
          AND tablename = 'messages' 
          AND policyname = 'realtime_messages_insert_policy'
    ) THEN
        CREATE POLICY "realtime_messages_insert_policy" ON realtime.messages
          FOR INSERT TO authenticated
          WITH CHECK (realtime.topic() LIKE '%' || public.jwt_tenant_id()::text || '%');
    END IF;
END
$$;
