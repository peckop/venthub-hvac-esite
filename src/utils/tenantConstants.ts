/**
 * Client-safe tenant sabitleri — `next/headers` İÇERMEZ, client bundle'a güvenle girer.
 * (tenantServer.ts server-only'dir; client 3D katmanı DEFAULT_TENANT_ID'yi BURADAN alır.)
 * SSOT: tenantServer.ts bu değerleri re-export eder, böylece tek tanım kalır.
 *
 * ⭐`TenantConfig` ve `DEFAULT_TENANT_CONFIG` 2026-09-14'te BURAYA TAŞINDI (REC-59 adım 2).
 * NİÇİN: ana sayfa artık kiracıyı derleme sabitinden okuyor, ama sabiti `tenantServer`'dan
 * import ettiği sürece `next/headers` taşıyan modül vitrin rotasının modül grafiğinde kalır.
 * Bugün bu tek başına dinamikleştirmiyor (yalnız ÇAĞRI dinamikleştirir, import değil —
 * 2026-09-14 build'inde `/[lang]` prerender edildi) ama kırılgan: o modüle sonradan eklenen
 * modül-düzeyi bir `headers()` okuması ana sayfayı SESSİZCE dinamiğe düşürürdü. Sabitin
 * başlık okumayan dosyada durması bu yolu tamamen kapatır.
 */
export const DEFAULT_TENANT_ID = 'd3b07384-d113-495f-a558-8c38634e0000';

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

/**
 * ÖLÇÜLDÜ, VARSAYILMADI (prod SELECT, 2026-09-09): `tenants` tablosunda TEK satır var ve
 * alanları bu nesneyle BİREBİR aynı (id, name, subdomain, custom_domain, is_active,
 * features, styles). Yani sabiti kullanmak bugün hiçbir DEĞERİ değiştirmez, yalnız okuma
 * YOLUNU değiştirir. Çok-kiracılı yapı PARK'ta (REC-88); geri açılırsa doğru yol kiracı
 * başına ayrı yayındır, RSC render yolunda başlık okumak değil.
 */
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
