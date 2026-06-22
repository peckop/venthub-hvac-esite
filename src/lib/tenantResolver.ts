export interface TenantInfo {
  tenantId: string;
  slug: string;
}

/**
 * Resolves the tenant context (ID and slug) based on the HTTP host header.
 * Designed to extract subdomain slugs from custom domains or localhost aliases.
 * Defaults to the primary system tenant if no subdomain is present, or if 'www'/'api' is used.
 *
 * @param host - The raw HTTP host string (e.g., 'tenant1.venthub.com', 'localhost:3000')
 * @returns An object containing the resolved `tenantId` and string `slug`
 *
 * @example
 * resolveTenant('tenant1.venthub.com') // returns { tenantId: 'd3b0...', slug: 'tenant1' }
 * resolveTenant('www.venthub.com') // returns { tenantId: 'd3b0...', slug: 'default' }
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
