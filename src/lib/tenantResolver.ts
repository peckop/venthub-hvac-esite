export interface TenantInfo {
  tenantId: string;
  slug: string;
}

/**
 * Resolves the appropriate tenant details by parsing the request's host string.
 * Extracts the subdomain from complex hosts and maps infrastructure domains (like `api` and `www`) or local development domains back to the default tenant.
 *
 * @param host - The raw host string (e.g., 'tenant1.venthub.com:3000') from the incoming request.
 * @returns The resolved tenant's ID and identifier slug.
 *
 * @example
 * resolveTenant('b2b.venthub.com'); // returns { tenantId: '...', slug: 'b2b' }
 * resolveTenant('localhost'); // returns { tenantId: '...', slug: 'default' }
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
