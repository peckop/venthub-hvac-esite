-- Migration: Add tenant branding config columns and seed default tenant
-- Location: supabase/migrations/20260530223000_add_tenant_branding_config.sql

BEGIN;

-- Add config, theme_config, and features columns to public.tenants table if they do not exist
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS config JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS theme_config JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Seed the default tenant 'd3b07384-d113-495f-a558-8c38634e0000' with branding configurations in JSONB
UPDATE public.tenants
SET config = jsonb_build_object(
  'brand_name', 'VentHub',
  'brand_logo_url', 'https://venthub-hvac-esite.vercel.app/images/logo.png',
  'brand_primary_color', '#2563eb',
  'email_from', 'VentHub <onboarding@resend.dev>'
)
WHERE id = 'd3b07384-d113-495f-a558-8c38634e0000';

COMMIT;
