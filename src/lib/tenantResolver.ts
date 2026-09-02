export interface TenantInfo {
  tenantId: string;
  slug: string;
}

/**
 * Resolves the tenant context (ID and slug) based on the HTTP Host header.
 * Determines the tenant by extracting subdomains, handling local development environments,
 * and falling back to a default tenant for bare domains or specific system subdomains (like www, api).
 *
 * @param host - The raw Host header string (e.g. 'tenant1.venthub.com:3000' or 'localhost')
 * @returns A TenantInfo object containing the resolved tenantId and slug
 *
 * @example
 * const info1 = resolveTenant('tenantA.venthub.com')
 * console.log(info1.slug) // 'tenantA'
 *
 * const info2 = resolveTenant('www.venthub.com')
 * console.log(info2.slug) // 'default'
 */
export function resolveTenant(host: string | null | undefined): TenantInfo {
  const DEFAULT_TENANT_ID = 'd3b07384-d113-495f-a558-8c38634e0000';
  const DEFAULT_SLUG = 'default';

  if (!host) {
    return { tenantId: DEFAULT_TENANT_ID, slug: DEFAULT_SLUG };
  }

  // Clean host from port (e.g. localhost:3000 -> localhost)
  const cleanHost = host.split(':')[0].trim().toLowerCase();

  // In development/localhost (or empty/missing host), return default tenant and slug 'default'
  if (!cleanHost || cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    return { tenantId: DEFAULT_TENANT_ID, slug: DEFAULT_SLUG };
  }

  const parts = cleanHost.split('.');
  let subdomain: string | undefined;

  if (cleanHost.endsWith('.localhost')) {
    // e.g. tenant1.localhost -> parts are ['tenant1', 'localhost']
    if (parts.length > 1) {
      subdomain = parts[0];
    }
  } else {
    // e.g. tenant1.venthub.com -> parts are ['tenant1', 'venthub', 'com']
    // venthub.com -> parts are ['venthub', 'com']
    if (parts.length >= 3) {
      subdomain = parts[0];
    }
  }

  // If subdomain is 'www' or 'api', return the default tenant
  if (!subdomain || subdomain === 'www' || subdomain === 'api') {
    return { tenantId: DEFAULT_TENANT_ID, slug: DEFAULT_SLUG };
  }

  // Otherwise, return default tenant ID but return the extracted slug in the return object
  return {
    tenantId: DEFAULT_TENANT_ID,
    slug: subdomain,
  };
}
