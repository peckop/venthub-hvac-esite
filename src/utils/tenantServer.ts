import { SupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { cache } from 'react';

import { supabaseStaticClient as supabase } from '@/lib/supabase/static';
import type { Database } from '@/types/database.types';

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

type ExtendedDatabase = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Tables'> & {
    Tables: Database['public']['Tables'] & {
      tenants: {
        Row: {
          id: string;
          name: string;
          subdomain: string | null;
          custom_domain: string | null;
          is_active: boolean;
          features: unknown;
          styles: unknown;
        };
        Insert: never;
        Update: never;
        Relationships: never[];
      };
    };
  };
};

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
    const { data, error } = await (supabase as SupabaseClient<ExtendedDatabase>)
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
