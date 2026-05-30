/* eslint-disable */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMockRequest, MockNextResponse } from './helpers/mockRequest'
import { MockDatabaseEngine } from './helpers/mockDb'
import { NextRequest } from 'next/server'

// ── Shared Configs & Interfaces ──

interface TenantConfig {
  id: string
  subdomain: string
  customDomain?: string
  status: 'active' | 'suspended'
}

interface FeatureConfig {
  id: string
  name: string
  features: {
    enable3DViewer: boolean
    enableCalculators: boolean
    enableAdvancedAnalytics: boolean
  }
}

interface UserProfile {
  id: string
  role: 'admin' | 'sales' | 'customer'
  email: string
  tenant_id: string
}

const TENANT_REGISTRY: TenantConfig[] = [
  { id: 'tenant-eng-123', subdomain: 'engineering', status: 'active' },
  { id: 'tenant-sales-456', subdomain: 'sales', status: 'active' },
  { id: 'tenant-suspended-789', subdomain: 'suspended', status: 'suspended' },
  { id: 'tenant-custom-999', subdomain: 'custom', customDomain: 'custom-hvac.com', status: 'active' }
]

const FEATURE_REGISTRY = new Map<string, FeatureConfig>([
  ['tenant-eng-123', {
    id: 'tenant-eng-123',
    name: 'Engineering Workspace',
    features: { enable3DViewer: true, enableCalculators: true, enableAdvancedAnalytics: false }
  }],
  ['tenant-sales-456', {
    id: 'tenant-sales-456',
    name: 'Sales Center',
    features: { enable3DViewer: false, enableCalculators: false, enableAdvancedAnalytics: true }
  }]
])

// ── Shared Helper Implementations ──

function resolveTenant(req: NextRequest): { tenantId: string | null; error?: string } {
  const host = req.headers.get('host') || ''
  const isDev = process.env.NODE_ENV === 'development'
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')

  if (isDev && isLocalhost) {
    return { tenantId: 'default' }
  }

  if (!host) {
    return { tenantId: null, error: 'Empty Host Header' }
  }

  const cleanHost = host.toLowerCase().trim()
  const parts = cleanHost.split(':')
  const hostname = parts[0]

  const customMatch = TENANT_REGISTRY.find(t => t.customDomain && hostname === t.customDomain)
  if (customMatch) {
    if (customMatch.status === 'suspended') return { tenantId: null, error: 'Tenant Suspended' }
    return { tenantId: customMatch.id }
  }

  const domainParts = hostname.split('.')

  if (domainParts.length > 2) {
    const subdomain = domainParts[0]

    if (/[^a-zA-Z0-9\-]/.test(subdomain)) {
      return { tenantId: null, error: 'Malformed Subdomain' }
    }

    const subMatch = TENANT_REGISTRY.find(t => t.subdomain === subdomain)
    if (subMatch) {
      if (subMatch.status === 'suspended') return { tenantId: null, error: 'Tenant Suspended' }
      return { tenantId: subMatch.id }
    }
  }

  return { tenantId: 'default' }
}

interface CacheEntry {
  tags: string[]
  value: any
  createdAt: number
}

class MultiTenantCacheEngine {
  public store = new Map<string, CacheEntry>()

  private buildKey(key: string, lang: string, tenantId: string): string {
    return JSON.stringify([key, lang, tenantId])
  }

  async getCachedData(
    key: string,
    lang: string,
    tenantId: string,
    fetchFn: () => Promise<any> | any,
    options: { tags?: string[]; bypassCache?: boolean } = {}
  ): Promise<any> {
    if (options.bypassCache) {
      return await fetchFn()
    }

    const cacheKey = this.buildKey(key, lang, tenantId)
    const existing = this.store.get(cacheKey)

    if (existing) {
      return JSON.parse(JSON.stringify(existing.value))
    }

    const freshValue = await fetchFn()
    const boundTags = (options.tags || []).map(t => `${t}:${tenantId}`)

    this.store.set(cacheKey, {
      tags: boundTags,
      value: freshValue,
      createdAt: Date.now()
    })

    return freshValue
  }

  revalidateTag(tag: string, tenantId: string) {
    const targetTag = `${tag}:${tenantId}`
    const keysToDelete: string[] = []

    for (const [k, entry] of this.store.entries()) {
      if (entry.tags.includes(targetTag)) {
        keysToDelete.push(k)
      }
    }

    keysToDelete.forEach(k => this.store.delete(k))
  }
}

function renderUIFeatures(user: UserProfile, config: FeatureConfig): string[] {
  const allowedFeatures: string[] = []
  if (config.features.enable3DViewer) {
    allowedFeatures.push('3D_VIEWER_WIDGET')
  }
  if (config.features.enableCalculators) {
    if (user.role === 'admin' || user.role === 'sales') {
      allowedFeatures.push('CALCULATORS_TOOL')
    }
  }
  if (config.features.enableAdvancedAnalytics) {
    if (user.role === 'admin') {
      allowedFeatures.push('ANALYTICS_DASHBOARD')
    }
  }
  return allowedFeatures
}

// ── Tests ──

describe('Pairwise Feature Interaction E2E Suite (6 Test Cases)', () => {
  let db: MockDatabaseEngine
  let cache: MultiTenantCacheEngine

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
    db = new MockDatabaseEngine()
    cache = new MultiTenantCacheEngine()

    // Seed database tables with tenant-specific schemas
    db.setTableData('products', [
      { id: 'prod-eng-1', tenant_id: 'tenant-eng-123', name: 'Engineering Valve', stock: 10 },
      { id: 'prod-sales-1', tenant_id: 'tenant-sales-456', name: 'Sales Fan', stock: 5 }
    ])

    db.setTableData('user_profiles', [
      { id: 'user-eng-admin', tenant_id: 'tenant-eng-123', role: 'admin', email: 'admin@eng.com' },
      { id: 'user-sales-salesperson', tenant_id: 'tenant-sales-456', role: 'sales', email: 'sales@sales.com' }
    ])
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('1. Case 1: Tenant Resolution (F1) + Database Isolation (F2)', async () => {
    // 1. Create a request with engineering subdomain
    const reqEng = createMockRequest({
      url: 'https://engineering.venthub.local/api/resource',
      headers: { host: 'engineering.venthub.local' }
    })

    const { tenantId: tenantIdEng, error: errEng } = resolveTenant(reqEng)
    expect(errEng).toBeUndefined()
    expect(tenantIdEng).toBe('tenant-eng-123')

    // Set DB security context to resolved tenant
    db.setSecurityContext({ tenantId: tenantIdEng, userRole: 'customer' })
    const clientEng = db.createClient()

    // Query products
    const { data: dataEng, error: dbErrEng } = await clientEng.from('products').select()
    expect(dbErrEng).toBeNull()
    expect(dataEng).toHaveLength(1)
    expect(dataEng[0].id).toBe('prod-eng-1')

    // 2. Create a request with sales subdomain
    const reqSales = createMockRequest({
      url: 'https://sales.venthub.local/api/resource',
      headers: { host: 'sales.venthub.local' }
    })

    const { tenantId: tenantIdSales, error: errSales } = resolveTenant(reqSales)
    expect(errSales).toBeUndefined()
    expect(tenantIdSales).toBe('tenant-sales-456')

    // Set DB security context to resolved tenant
    db.setSecurityContext({ tenantId: tenantIdSales, userRole: 'customer' })
    const clientSales = db.createClient()

    // Query products under sales context
    const { data: dataSales, error: dbErrSales } = await clientSales.from('products').select()
    expect(dbErrSales).toBeNull()
    expect(dataSales).toHaveLength(1)
    expect(dataSales[0].id).toBe('prod-sales-1')
  })

  it('2. Case 2: Database Isolation (F2) + Auth JWT/Profiles (F3)', async () => {
    // Simulate user session for user-eng-admin (tenant-eng-123)
    db.setSecurityContext({ tenantId: 'tenant-eng-123', userRole: 'admin' })
    const client = db.createClient()

    // 1. Attempt to update own profile (should succeed)
    const { data: updatedSelf, error: errSelf } = await client
      .from('user_profiles')
      .eq('id', 'user-eng-admin')
      .update({ email: 'new-admin@eng.com' })

    expect(errSelf).toBeNull()
    expect(updatedSelf).toHaveLength(1)
    expect(updatedSelf[0].email).toBe('new-admin@eng.com')

    // 2. Attempt to update another tenant's user profile (should be blocked by RLS)
    const { data: updatedOther, error: errOther } = await client
      .from('user_profiles')
      .eq('id', 'user-sales-salesperson')
      .update({ email: 'hacked@sales.com' })

    // RLS filters out non-matching rows, so update affects 0 rows
    expect(errOther).toBeNull()
    expect(updatedOther).toHaveLength(0)

    // Switch context to Sales and verify profile was NOT altered
    db.setSecurityContext({ tenantId: 'tenant-sales-456', userRole: 'sales' })
    const { data: profileSales } = await client.from('user_profiles').eq('id', 'user-sales-salesperson').single()
    expect(profileSales.email).toBe('sales@sales.com')
  })

  it('3. Case 3: Tenant Resolution (F1) + Feature Flags (F5)', async () => {
    // 1. Resolve engineering subdomain request and fetch its feature configuration
    const reqEng = createMockRequest({
      url: 'https://engineering.venthub.local/dashboard',
      headers: { host: 'engineering.venthub.local' }
    })
    const { tenantId: tenantIdEng } = resolveTenant(reqEng)
    const configEng = FEATURE_REGISTRY.get(tenantIdEng!)
    
    expect(configEng).toBeDefined()
    expect(configEng?.name).toBe('Engineering Workspace')
    expect(configEng?.features.enable3DViewer).toBe(true)
    expect(configEng?.features.enableCalculators).toBe(true)
    expect(configEng?.features.enableAdvancedAnalytics).toBe(false)

    // 2. Resolve sales subdomain request and fetch its feature configuration
    const reqSales = createMockRequest({
      url: 'https://sales.venthub.local/dashboard',
      headers: { host: 'sales.venthub.local' }
    })
    const { tenantId: tenantIdSales } = resolveTenant(reqSales)
    const configSales = FEATURE_REGISTRY.get(tenantIdSales!)

    expect(configSales).toBeDefined()
    expect(configSales?.name).toBe('Sales Center')
    expect(configSales?.features.enable3DViewer).toBe(false)
    expect(configSales?.features.enableCalculators).toBe(false)
    expect(configSales?.features.enableAdvancedAnalytics).toBe(true)
  })

  it('4. Case 4: Cache Key Isolation (F4) + Webhooks/Realtime (F6)', async () => {
    let fetchCountA = 0
    let fetchCountB = 0

    const fetchA = () => { fetchCountA++; return { data: 'Tenant A Cached Value' } }
    const fetchB = () => { fetchCountB++; return { data: 'Tenant B Cached Value' } }

    // Cache products portals for Tenant A and Tenant B
    await cache.getCachedData('portals', 'en', 'tenant-eng-123', fetchA, { tags: ['products'] })
    await cache.getCachedData('portals', 'en', 'tenant-sales-456', fetchB, { tags: ['products'] })

    expect(fetchCountA).toBe(1)
    expect(fetchCountB).toBe(1)

    // Simulate database change webhook event in Tenant A context invalidating cache
    cache.revalidateTag('products', 'tenant-eng-123')

    // Read cache again
    const resA = await cache.getCachedData('portals', 'en', 'tenant-eng-123', fetchA, { tags: ['products'] })
    const resB = await cache.getCachedData('portals', 'en', 'tenant-sales-456', fetchB, { tags: ['products'] })

    // Tenant A cache must be re-fetched (count increases)
    expect(fetchCountA).toBe(2)
    expect(resA.data).toBe('Tenant A Cached Value')

    // Tenant B cache must be hits (count stays same)
    expect(fetchCountB).toBe(1)
    expect(resB.data).toBe('Tenant B Cached Value')
  })

  it('5. Case 5: Feature Flags (F5) + Auth JWT/Profiles (F3)', () => {
    const configEng = FEATURE_REGISTRY.get('tenant-eng-123')!
    const configSales = FEATURE_REGISTRY.get('tenant-sales-456')!

    // User 1: Admin on Engineering tenant
    const user1: UserProfile = { id: 'u1', role: 'admin', email: 'a@eng.com', tenant_id: 'tenant-eng-123' }
    const featuresU1 = renderUIFeatures(user1, configEng)
    expect(featuresU1).toContain('3D_VIEWER_WIDGET')
    expect(featuresU1).toContain('CALCULATORS_TOOL')
    expect(featuresU1).not.toContain('ANALYTICS_DASHBOARD')

    // User 2: Sales employee on Engineering tenant
    const user2: UserProfile = { id: 'u2', role: 'sales', email: 's@eng.com', tenant_id: 'tenant-eng-123' }
    const featuresU2 = renderUIFeatures(user2, configEng)
    expect(featuresU2).toContain('3D_VIEWER_WIDGET')
    expect(featuresU2).toContain('CALCULATORS_TOOL')
    expect(featuresU2).not.toContain('ANALYTICS_DASHBOARD')

    // User 3: Customer on Engineering tenant
    const user3: UserProfile = { id: 'u3', role: 'customer', email: 'c@eng.com', tenant_id: 'tenant-eng-123' }
    const featuresU3 = renderUIFeatures(user3, configEng)
    expect(featuresU3).toContain('3D_VIEWER_WIDGET')
    expect(featuresU3).not.toContain('CALCULATORS_TOOL')
    expect(featuresU3).not.toContain('ANALYTICS_DASHBOARD')

    // User 4: Admin on Sales tenant (has analytics flag enabled)
    const user4: UserProfile = { id: 'u4', role: 'admin', email: 'a@sales.com', tenant_id: 'tenant-sales-456' }
    const featuresU4 = renderUIFeatures(user4, configSales)
    expect(featuresU4).not.toContain('3D_VIEWER_WIDGET')
    expect(featuresU4).not.toContain('CALCULATORS_TOOL')
    expect(featuresU4).toContain('ANALYTICS_DASHBOARD')
  })

  it('6. Case 6: Cache Key Isolation (F4) + Database Isolation (F2)', async () => {
    const client = db.createClient()

    // 1. Under tenant-eng-123, fetch products through cache
    db.setSecurityContext({ tenantId: 'tenant-eng-123', userRole: 'customer' })
    const fetchEng = async () => {
      const { data } = await client.from('products').select()
      return data
    }
    const cachedEng = await cache.getCachedData('prod-list', 'en', 'tenant-eng-123', fetchEng)
    expect(cachedEng).toHaveLength(1)
    expect(cachedEng[0].id).toBe('prod-eng-1')

    // 2. Under tenant-sales-456, fetch products through cache
    db.setSecurityContext({ tenantId: 'tenant-sales-456', userRole: 'customer' })
    const fetchSales = async () => {
      const { data } = await client.from('products').select()
      return data
    }
    const cachedSales = await cache.getCachedData('prod-list', 'en', 'tenant-sales-456', fetchSales)
    expect(cachedSales).toHaveLength(1)
    expect(cachedSales[0].id).toBe('prod-sales-1')

    // Verify cache has separated entries
    expect(cache.store.size).toBe(2)

    // 3. Test Cache Bypass (bypassCache: true) respects DB RLS
    db.setSecurityContext({ tenantId: 'tenant-eng-123', userRole: 'customer' })
    const bypassedEng = await cache.getCachedData('prod-list', 'en', 'tenant-eng-123', fetchEng, { bypassCache: true })
    expect(bypassedEng).toHaveLength(1)
    expect(bypassedEng[0].id).toBe('prod-eng-1')

    db.setSecurityContext({ tenantId: 'tenant-sales-456', userRole: 'customer' })
    const bypassedSales = await cache.getCachedData('prod-list', 'en', 'tenant-sales-456', fetchSales, { bypassCache: true })
    expect(bypassedSales).toHaveLength(1)
    expect(bypassedSales[0].id).toBe('prod-sales-1')
  })
})
