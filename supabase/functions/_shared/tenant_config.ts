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

// T026-VH Adım 6 (2026-08-15): `resolveTenantId` BURADAN SİLİNDİ.
//
// Tenant sınırını üç ayrı İSTEK alanından çiziyordu — `?tenant_id=` query'si (her şeyden
// önce, yani doğrulanmış kimliği EZEREK), imzası doğrulanmadan `atob` ile çözülmüş JWT
// payload'ı, ve gövde. Üçü de saldırganın yazdığı yerler; değer PostgREST filtresine
// (`tenant_id=eq.…`) girdiği için etki "başka tenant'ın satırını oku/yaz"a kadar gidiyordu.
//
// Yerine geçen: `_shared/tenant.ts` (istek nesnesini GÖREMEYEN saf modül) + `_shared/caller.ts`
// (getUser'ı en fazla bir kez çağıran ortak kapı). 12 çağıranın hepsi Adım 2–5'te göçtü.
// Sırayı çevirmek yetmezdi: `atob` kaldıkça saldırı query'den sahte-JWT'ye taşınırdı.
// Detay: docs/plans/tenant-id-hardening-2026-08-15.md · cetvel §3.9
//
// `DEFAULT_TENANT_ID` artık TEK yerde: `_shared/tenant.ts`.
// Bu dosyada yalnız `getTenantBranding` kaldı — 5 bildirim ucu onu kullanıyor.

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
