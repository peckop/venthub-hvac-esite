import { headers } from 'next/headers';
import { cache } from 'react';

import { supabaseStaticClient as supabase } from '@/lib/supabase/static';

import { DEFAULT_TENANT_ID } from './tenantConstants';

export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string | null;
  custom_domain: string | null;
  is_active: boolean;
  features: {
    viewer3d?: boolean;
    engineeringCalculators?: boolean;
    pdfExports?: boolean;
    [key: string]: unknown;
  };
  styles: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    [key: string]: unknown;
  };
}

export { DEFAULT_TENANT_ID };

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  id: DEFAULT_TENANT_ID,
  name: 'Default Tenant',
  subdomain: 'default',
  custom_domain: null,
  is_active: true,
  features: {
    viewer3d: true,
    engineeringCalculators: true,
    pdfExports: true,
  },
  styles: {
    primaryColor: '#0f172a',
    secondaryColor: '#3b82f6',
  },
};

/**
 * Fetches and returns the configuration for the current tenant in a Next.js Server Component environment.
 * Extracts the tenant ID from the 'x-tenant-id' HTTP header (typically set by middleware).
 * Fallbacks to a default configuration if the header is missing, the tenant is inactive, or a fetch error occurs.
 * The result is cached per request using React's cache.
 *
 * @returns A promise that resolves to the TenantConfig object containing features, styles, and metadata
 * @throws {never} This function catches and suppresses database/header errors, always returning a valid config
 *
 * @example
 * // Inside a Server Component
 * const tenantConfig = await getTenantConfig()
 * if (tenantConfig.features.viewer3d) {
 *   // render 3D viewer
 * }
 */
export const getTenantConfig = cache(async function getTenantConfig(): Promise<TenantConfig> {
  let tenantId: string | null = null;
  
  try {
    const headersList = await headers();
    tenantId = headersList.get('x-tenant-id');
  } catch (error) {
    console.warn('[Tenant Server] Failed to read headers, using default tenant ID.', error);
  }

  if (!tenantId || tenantId === DEFAULT_TENANT_ID || tenantId === 'default') {
    tenantId = DEFAULT_TENANT_ID;
  }

  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, subdomain, custom_domain, is_active, features, styles')
      .eq('id', tenantId)
      .maybeSingle();

    if (error || !data) {
      console.warn(`[Tenant Server] Tenant config not found for ID: ${tenantId}, using default fallback.`);
      return DEFAULT_TENANT_CONFIG;
    }

    if (!data.is_active) {
      console.warn(`[Tenant Server] Tenant ID: ${tenantId} is inactive, using default fallback.`);
      return DEFAULT_TENANT_CONFIG;
    }

    const features = typeof data.features === 'string' ? JSON.parse(data.features) : (data.features || {});
    const styles = typeof data.styles === 'string' ? JSON.parse(data.styles) : (data.styles || {});

    return {
      id: data.id,
      name: data.name,
      subdomain: data.subdomain || null,
      custom_domain: data.custom_domain || null,
      is_active: data.is_active,
      features,
      styles,
    };
  } catch (err) {
    console.error(`[Tenant Server] Error fetching tenant config:`, err);
    return DEFAULT_TENANT_CONFIG;
  }
});
