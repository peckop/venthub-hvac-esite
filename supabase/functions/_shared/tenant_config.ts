// T028-VH: pin ZORUNLU. Pin'siz `@2` esm.sh tarafından DEPLOY ANINDA çözülür — aynı kaynak
// iki farklı zamanda deploy edilince iki farklı sürüm çalışır. Ölçülmüş kanıt: `deno.lock`
// bu spec'i 2.101.1'e çözmüştü, yani kayma teorik değil gerçekleşmişti. Burası PAYLAŞILAN
// modül olduğu için pin'siz kalması, onu import eden her fonksiyonun çalışma zamanına
// İKİNCİ ve floating bir supabase-js kopyası sokuyordu.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

export interface TenantBranding {
  brandName: string
  brandLogoUrl: string
  brandPrimaryColor: string
  emailFrom: string
}

const DEFAULT_TENANT_ID = 'd3b07384-d113-495f-a558-8c38634e0000'

/**
 * Extracts the tenant_id from either the Authorization Header JWT claims,
 * a query parameter (e.g. ?tenant_id=xxx), or parsed request body.
 */
export function resolveTenantId(req: Request, parsedBody?: any): string {
  try {
    // 1. Try URL search params
    const url = new URL(req.url)
    const queryTenantId = url.searchParams.get('tenant_id')
    if (queryTenantId) return queryTenantId

    // 2. Try Authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const jwtParts = token.split('.')
      if (jwtParts.length === 3) {
        const payload = JSON.parse(atob(jwtParts[1]))
        const tenantId = payload?.app_metadata?.tenant_id
        if (tenantId) return tenantId
      }
    }

    // 3. Try parsed request body
    if (parsedBody && typeof parsedBody === 'object') {
      const bodyTenantId = parsedBody.tenant_id || parsedBody.tenantId
      if (bodyTenantId) return String(bodyTenantId)
    }
  } catch (err) {
    console.error('[tenant-config] Error parsing tenant_id context:', err)
  }

  return DEFAULT_TENANT_ID
}

/**
 * Dynamically fetches branding configurations for a given tenant_id.
 * Falls back sequentially: Tenant DB Config -> Deno Environment Variables -> Hardcoded System Defaults.
 */
export async function getTenantBranding(tenantId: string): Promise<TenantBranding> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

  let dbConfig: Record<string, string> = {}

  if (supabaseUrl && serviceKey && tenantId) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false }
      })
      const { data, error } = await supabase
        .from('tenants')
        .select('config')
        .eq('id', tenantId)
        .single()

      if (!error && data?.config) {
        dbConfig = data.config as Record<string, string>
      } else if (error) {
        console.warn(`[tenant-config] Failed to fetch tenant ${tenantId} config:`, error.message)
      }
    } catch (err) {
      console.error('[tenant-config] Database fetch error:', err)
    }
  }

  // Hierarchical Resolving & Fallbacks
  const brandName = 
    dbConfig.brand_name || 
    dbConfig.brandName || 
    Deno.env.get('BRAND_NAME') || 
    'VentHub'

  const brandLogoUrl = 
    dbConfig.brand_logo_url || 
    dbConfig.brandLogoUrl || 
    Deno.env.get('BRAND_LOGO_URL') || 
    'https://venthub-hvac-esite.vercel.app/images/logo.png'

  const brandPrimaryColor = 
    dbConfig.brand_primary_color || 
    dbConfig.brandPrimaryColor || 
    Deno.env.get('BRAND_PRIMARY_COLOR') || 
    '#2563eb'

  const emailFrom = 
    dbConfig.email_from || 
    dbConfig.EMAIL_FROM || 
    Deno.env.get('EMAIL_FROM') || 
    'VentHub <onboarding@resend.dev>'

  return {
    brandName,
    brandLogoUrl,
    brandPrimaryColor,
    emailFrom
  }
}
