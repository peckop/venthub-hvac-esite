-- Create Enums
DO $$ BEGIN
    CREATE TYPE contact_department AS ENUM ('sales', 'support', 'consulting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contact_status AS ENUM ('new', 'read', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    department contact_department NOT NULL DEFAULT 'sales',
    status contact_status NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT -- Security auditing
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Allow public inserts (Anyone can contact)
CREATE POLICY "Public can insert contact messages" 
ON contact_messages 
FOR INSERT 
WITH CHECK (true);

-- 2. Allow admins to view messages (assuming user_profiles has role column check, otherwise strictly service_role)
-- For safety/simplicity initially, we restrict to service_role or we can add a basic check.
-- We'll allow 'service_role' (implicit override) and authenticated admins.
CREATE POLICY "Admins can view messages" 
ON contact_messages 
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Grant permissions needed for anon/authenticated to insert
GRANT INSERT ON contact_messages TO anon, authenticated;
GRANT SELECT ON contact_messages TO authenticated; -- needed for admin policy
