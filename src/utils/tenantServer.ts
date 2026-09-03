// ⚠ ÖLÇÜM DALI: `next/headers` importu kaldırıldı — aşağıdaki deneyin bir parçası.
// Import kalsaydı kullanılmayan-değişken kapısı düşerdi; ayrıca deneyin amacı tam olarak
// bu modülün istek-başına başlık okumasını KESMEK.
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

export const getTenantConfig = cache(async function getTenantConfig(): Promise<TenantConfig> {
  // ⚠⚠ ÖLÇÜM DALI — BU DEĞİŞİKLİK MERGE EDİLMEYECEK (REC-59 Adım A, 2026-09-04) ⚠⚠
  //
  // NE ÖLÇÜYOR: canlıda `getTenantConfig`'i çağıran dört yüzey (ana sayfa, ürün listesi,
  // kategori, alt kategori) `X-Vercel-Cache: MISS` + `no-store` veriyor; çağırmayan iki
  // yüzey (PDP, marka) `PRERENDER` + `public` veriyor. Ayrışma bu fonksiyonda.
  // Buradaki `await headers()` istek-başına başlık okur ve sayfayı istek-zamanına düşürür.
  //
  // DENEY: satırı yapı-zamanı sabitiyle değiştir, preview'da aynı dört yüzeyi ölç.
  //  · Dördü de HIT olursa  → tek tıkaç buymuş.
  //  · Ana sayfa HIT ama liste/kategori MISS kalırsa → ikinci tıkaç `await searchParams`
  //    (o iki yüzeyde ayrıca var) ve tek düzeltme YETMİYOR demektir.
  //
  // NİÇİN DAVRANIŞ AÇISINDAN BUGÜN NÖTR: `src/lib/tenantResolver.ts:44-47` her host için
  // zaten `DEFAULT_TENANT_ID` döndürüyor; okunan başlık da aşağıda (eski satırlarda) her
  // hâlükârda ona düşürülüyordu. Yani bugün okunan değer sabitin ta kendisiydi.
  //
  // KALICI ÇÖZÜM DEĞİL: kalıcı hâli Recep'in SORU-1 cevabına bağlı (yetenek env ile korunur).
  let tenantId: string | null = DEFAULT_TENANT_ID;

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
