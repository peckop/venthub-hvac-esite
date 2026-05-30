-- Migration: Add tenant config columns and update default tenant config
-- Location: supabase/migrations/20260530222000_add_tenant_config_columns.sql

BEGIN;

-- Add features and styles columns to public.tenants table if they do not exist
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS styles JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Update the default tenant with active features and styles
UPDATE public.tenants
SET 
  features = '{"viewer3d": true, "engineeringCalculators": true, "pdfExports": true}'::jsonb,
  styles = '{"primaryColor": "#0f172a", "secondaryColor": "#3b82f6"}'::jsonb
WHERE id = 'd3b07384-d113-495f-a558-8c38634e0000';

COMMIT;
