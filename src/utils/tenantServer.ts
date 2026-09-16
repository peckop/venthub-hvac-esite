import { headers } from 'next/headers';
import { cache } from 'react';

import { supabaseStaticClient as supabase } from '@/lib/supabase/static';

import { DEFAULT_TENANT_CONFIG, DEFAULT_TENANT_ID, type TenantConfig } from './tenantConstants';

/**
 * ⭐TANIMLAR `tenantConstants.ts`'E TAŞINDI (REC-59 adım 2, 2026-09-14) — burası yalnız
 * yeniden dışa aktarır, böylece mevcut tüketiciler (`admin/layout`, `urunler` rotası,
 * `useTenant`) hiç değişmeden çalışmaya devam eder. NİÇİN taşındı: bu dosya modül
 * düzeyinde `next/headers` import eder; vitrin rotası sabiti buradan alırsa o modül
 * vitrinin grafiğinde kalır ve sonradan eklenecek bir modül-düzeyi başlık okuması ana
 * sayfayı SESSİZCE dinamiğe düşürebilir. Tek tanım hâlâ TEK yerde.
 */
export { DEFAULT_TENANT_CONFIG, DEFAULT_TENANT_ID };
export type { TenantConfig };

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
