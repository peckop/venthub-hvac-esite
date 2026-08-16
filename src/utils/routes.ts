
/**
 * Merkezi URL Yönetimi (Route Authority)
 * Sistem genelindeki tüm link oluşturma işlemleri (href, router.push vb.) bu dosya üzerinden yapılmalıdır.
 */

/**
 * Ürün slug değerini doğrular. Eğer ID/UUID geçerse Development ortamında hata fırlatır (fail-fast),
 * Production ortamında ise sistemi ayakta tutmak için sessizce loglar ve Middleware'in 308 mekanizmasını kullanması için değeri geri döner.
 */
function assertProductSlug(slug: string): string {
  if (!slug) return '';

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(slug)) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`[Route Error] Bir ürün UUID'si slug olarak kullanılıyor: ${slug}. Bu durum performans ve SEO sorunlarına yol açabilir. Lütfen veri tabanındaki 'slug' alanını kullanın.`);
    } else {
      // Production ortamında component'i patlatıp tüm ekranı beyaz/hata yapmamak için graceful fallback:
      console.error(`[Route Error] UUID Sızıntısı Tespiti (Graceful Fallback devrede): ${slug}`);
      // UUID'nin geçmesine izin veriyoruz ki, arkada kuracağımız Edge Middleware onu yakalayıp asıl slug'a 308 (kalıcı) yönlendirme yapsın.
      return slug;
    }
  }

  return slug;
}

import type { Route } from 'next';

export const Routes = {
  home: () => '/' as Route,
  
  // Eşsiz Link Yönetimi — F5-B: slug artık AİLE slug'ıdır; sku verilirse ?sku= ile
  // belirli varyant ön-seçilir (canonical'a girmez, VariantSelector okur).
  product: (slug: string, sku?: string) => {
    const validSlug = assertProductSlug(slug);
    const base = `/products/${encodeURIComponent(validSlug)}`;
    return (sku ? `${base}?sku=${encodeURIComponent(sku)}` : base) as Route;
  },
  
  // Tüm Ürünler ve Filtreleme
  products: (params?: { brand?: string, limit?: number }) => {
    if (!params) return '/products' as Route;
    const query = new URLSearchParams();
    if (params.brand) query.set('brand', params.brand);
    if (params.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return (qs ? `/products?${qs}` : '/products') as Route;
  },

  // Sadece ID'si bilinen ürünler (Eski sipariş vs.) için, Middleware 308 Redirect bekleyen Legacy yönlendirme.
  legacyProduct: (idOrSlug: string) => {
    if (!idOrSlug) return '/products' as Route;
    return `/products/${encodeURIComponent(idOrSlug)}` as Route;
  },
  
  // Kategoriler
  category: (slug: string, subSlug?: string) => {
    if (subSlug && subSlug !== slug && subSlug !== 'undefined') {
      return `/category/${encodeURIComponent(slug)}/${encodeURIComponent(subSlug)}` as Route;
    }
    return `/category/${encodeURIComponent(slug)}` as Route;
  },

  // Markalar
  brand: (slug: string) => {
    return `/brands/${encodeURIComponent(slug)}` as Route;
  },
  brands: () => '/brands' as Route,
  
  // Sepet & Satın Alma & Ödeme
  cart: () => '/cart' as Route,
  checkout: () => '/checkout' as Route,
  paymentSuccess: (orderId?: string, status?: string) => {
    if (!orderId) return '/payment-success' as Route;
    const query = new URLSearchParams();
    query.set('orderId', orderId);
    if (status) query.set('status', status);
    return `/payment-success?${query.toString()}` as Route;
  },

  // Temel Sayfalar
  about: () => '/about' as Route,
  contact: (dept?: string) => (dept ? `/contact?dept=${encodeURIComponent(dept)}` : '/contact') as Route,

  // Kullanıcı Hesabı
  account: {
    overview: () => '/account' as Route,
    orders: () => '/account/orders' as Route,
    orderDetail: (orderId: string) => `/account/orders/detail?id=${encodeURIComponent(orderId)}` as Route,
    shipments: () => '/account/shipments' as Route,
    returns: (newOrderId?: string) => (newOrderId ? `/account/returns?new=${encodeURIComponent(newOrderId)}` : '/account/returns') as Route,
    addresses: () => '/account/addresses' as Route,
    invoices: () => '/account/invoices' as Route,
    profile: () => '/account/profile' as Route,
    favorites: () => '/account/favorites' as Route,
    projects: () => '/account/projects' as Route,
    security: () => '/account/security' as Route
  },
  
  // Yönetici
  admin: {
    dashboard: () => '/admin' as Route,
    products: (id?: string) => (id ? `/admin/products?id=${encodeURIComponent(id)}` : '/admin/products') as Route,
    orders: (query?: string) => (query ? `/admin/orders?q=${encodeURIComponent(query)}` : '/admin/orders') as Route,
    categories: (id?: string) => (id ? `/admin/categories/${encodeURIComponent(id)}/builder` : '/admin/categories') as Route,
    users: () => '/admin/users' as Route
  },

  // Destek / Bilgi Merkezi
  destek: {
    home: () => '/destek/merkez' as Route,
    hesaplayicilar: (slug?: string) => (slug ? `/destek/hesaplayicilar/${encodeURIComponent(slug)}` : '/destek/hesaplayicilar') as Route,
    konular: (slug?: string) => (slug ? `/destek/konular/${encodeURIComponent(slug)}` : '/destek/konular') as Route,
    sss: () => '/destek/sss' as Route,
    iadeDegisim: () => '/destek/iade-degisim' as Route,
    teslimatKargo: () => '/destek/teslimat-kargo' as Route,
    garantiServis: () => '/destek/garanti-servis' as Route,
  },

  // Yasal Bilgiler
  legal: {
    kvkk: () => '/legal/kvkk' as Route,
    mesafeliSatis: () => '/legal/mesafeli-satis-sozlesmesi' as Route,
    onBilgilendirme: () => '/legal/on-bilgilendirme-formu' as Route,
    cerez: () => '/legal/cerez-politikasi' as Route,
    gizlilik: () => '/legal/gizlilik-politikasi' as Route,
    kullanimKosullari: () => '/legal/kullanim-kosullari' as Route
  },

  // Auth
  auth: {
    login: (redirect?: string, error?: string) => {
      const url = '/auth/login';
      const params = new URLSearchParams();
      if (redirect) params.append('redirect', redirect);
      if (error) params.append('error', error);
      const qs = params.toString();
      return (qs ? `${url}?${qs}` : url) as Route;
    },
    register: () => '/auth/register' as Route,
    forgotPassword: () => '/auth/forgot-password' as Route,
    resetPassword: () => '/auth/reset-password' as Route,
    callback: () => '/auth/callback' as Route
  }
};

/**
 * Dilsiz bir taban URL'e aktif dil önekini ekleyen SAF fonksiyon — `useLocalizedRoutes`
 * proxy'sinin sunucu-güvenli (RSC) çekirdeği. Hook kullanamayan Server Component'ler,
 * route handler'lar ve paylaşılan render bileşenleri (Breadcrumb gibi) dil önekini bununla
 * ekler; böylece elle `/${lang}/...` birleştirme (SSOT kaçağı) gerekmez.
 *
 * Idempotent ve güvenli: zaten `/tr`/`/en` ile başlayan URL'lere mükerrer önek eklemez,
 * `/admin` ve `/api` rotalarına hiç dokunmaz. (Aynı kural `useLocalizedRoutes`'taki proxy'de.)
 */
export function localizedHref(url: string, lang: string): Route {
  if (url.startsWith('/admin') || url.startsWith('/api')) return url as Route;
  // Zaten locale-önekli mi? Yalnız TAM segment ('/tr', '/en', '/tr/...', '/en/...').
  // startsWith('/tr') KULLANMA — '/trends' gibi yolları yanlışlıkla localize-dışı bırakır.
  if (url === '/tr' || url === '/en' || url.startsWith('/tr/') || url.startsWith('/en/')) return url as Route;
  return `/${lang}${url === '/' ? '' : url}` as Route;
}
