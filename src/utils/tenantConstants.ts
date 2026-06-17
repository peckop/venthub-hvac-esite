/**
 * Client-safe tenant sabitleri — `next/headers` İÇERMEZ, client bundle'a güvenle girer.
 * (tenantServer.ts server-only'dir; client 3D katmanı DEFAULT_TENANT_ID'yi BURADAN alır.)
 * SSOT: tenantServer.ts bu değeri re-export eder, böylece tek tanım kalır.
 */
export const DEFAULT_TENANT_ID = 'd3b07384-d113-495f-a558-8c38634e0000';
