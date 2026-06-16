import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest';

import { localizedHref, Routes } from '../routes';

describe('Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('product', () => {
    it('should encode and return a normal product slug', () => {
      expect(Routes.product('my-product')).toBe('/products/my-product');
    });

    it('should handle UUIDs in development environment by throwing an error', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(() => Routes.product(uuid)).toThrow(/Bir ürün UUID'si slug olarak kullanılıyor/);
    });

    it('should gracefully fallback when a UUID is passed in production environment', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(Routes.product(uuid)).toBe(`/products/${encodeURIComponent(uuid)}`);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('UUID Sızıntısı Tespiti'));
    });

    it('should return empty route if slug is empty', () => {
      expect(Routes.product('')).toBe('/products/'); // encodeURIComponent('') -> ''
    });
  });

  describe('products', () => {
    it('should return base products route if no params provided', () => {
      expect(Routes.products()).toBe('/products');
    });

    it('should append brand param', () => {
      expect(Routes.products({ brand: 'venthub' })).toBe('/products?brand=venthub');
    });

    it('should append limit param', () => {
      expect(Routes.products({ limit: 10 })).toBe('/products?limit=10');
    });

    it('should append both brand and limit params', () => {
      expect(Routes.products({ brand: 'test', limit: 20 })).toBe('/products?brand=test&limit=20');
    });
  });

  describe('category', () => {
    it('should encode standard category route', () => {
      expect(Routes.category('hvac')).toBe('/category/hvac');
    });

    it('should include subSlug if provided and valid', () => {
      expect(Routes.category('hvac', 'fans')).toBe('/category/hvac/fans');
    });

    it('should ignore subSlug if it is same as slug', () => {
      expect(Routes.category('hvac', 'hvac')).toBe('/category/hvac');
    });

    it('should ignore subSlug if it is string undefined', () => {
      expect(Routes.category('hvac', 'undefined')).toBe('/category/hvac');
    });
  });

  describe('paymentSuccess', () => {
    it('should return base route when no orderId is provided', () => {
      expect(Routes.paymentSuccess()).toBe('/payment-success');
    });

    it('should append orderId', () => {
      expect(Routes.paymentSuccess('123')).toBe('/payment-success?orderId=123');
    });

    it('should append orderId and status', () => {
      expect(Routes.paymentSuccess('123', 'paid')).toBe('/payment-success?orderId=123&status=paid');
    });
  });

  describe('contact', () => {
    it('should return base route when no dept is provided', () => {
      expect(Routes.contact()).toBe('/contact');
    });

    it('should encode dept when provided', () => {
      expect(Routes.contact('support&sales')).toBe('/contact?dept=support%26sales');
    });
  });

  describe('account.returns', () => {
    it('should return base returns route', () => {
      expect(Routes.account.returns()).toBe('/account/returns');
    });

    it('should append newOrderId when provided', () => {
      expect(Routes.account.returns('ord-123')).toBe('/account/returns?new=ord-123');
    });
  });

  describe('admin.products', () => {
    it('should return base products route', () => {
      expect(Routes.admin.products()).toBe('/admin/products');
    });

    it('should append id when provided', () => {
      expect(Routes.admin.products('prod-1')).toBe('/admin/products?id=prod-1');
    });
  });

  describe('auth.login', () => {
    it('should return base login route', () => {
      expect(Routes.auth.login()).toBe('/auth/login');
    });

    it('should append redirect param', () => {
      expect(Routes.auth.login('/checkout')).toBe('/auth/login?redirect=%2Fcheckout');
    });

    it('should append error param', () => {
      expect(Routes.auth.login(undefined, 'failed')).toBe('/auth/login?error=failed');
    });

    it('should append both redirect and error params', () => {
      expect(Routes.auth.login('/home', 'expired')).toBe('/auth/login?redirect=%2Fhome&error=expired');
    });
  });
});

// SSOT kilit taşı: tüm nav linkleri buna dayanır. Davranış (kapı DEĞİL) testi.
describe('localizedHref', () => {
  it('normal yola dil öneki ekler', () => {
    expect(localizedHref('/category/x', 'tr')).toBe('/tr/category/x');
    expect(localizedHref('/category/x', 'en')).toBe('/en/category/x');
  });

  it('kök yolu (/) dil köküne çevirir, sondaki slash olmadan', () => {
    expect(localizedHref('/', 'tr')).toBe('/tr');
    expect(localizedHref('/', 'en')).toBe('/en');
  });

  it('/admin ve /api rotalarına dokunmaz (dil-öneki almazlar)', () => {
    expect(localizedHref('/admin/users', 'tr')).toBe('/admin/users');
    expect(localizedHref('/admin', 'en')).toBe('/admin');
    expect(localizedHref('/api/health', 'en')).toBe('/api/health');
  });

  it('zaten locale-önekli URL\'e mükerrer önek eklemez (idempotent)', () => {
    expect(localizedHref('/tr/category/x', 'tr')).toBe('/tr/category/x');
    expect(localizedHref('/en/category/x', 'tr')).toBe('/en/category/x');
    expect(localizedHref('/tr', 'en')).toBe('/tr');
    expect(localizedHref('/en', 'tr')).toBe('/en');
  });

  it('locale-prefix gibi GÖRÜNEN ama olmayan yolları yine de localize eder (/trends tuzağı)', () => {
    expect(localizedHref('/trends', 'tr')).toBe('/tr/trends');
    expect(localizedHref('/enterprise', 'en')).toBe('/en/enterprise');
  });

  it('Routes builder ile SSOT zinciri doğru localize URL üretir', () => {
    expect(localizedHref(Routes.category('hvac', 'fans'), 'tr')).toBe('/tr/category/hvac/fans');
    expect(localizedHref(Routes.products(), 'en')).toBe('/en/products');
    expect(localizedHref(Routes.legal.cerez(), 'tr')).toBe('/tr/legal/cerez-politikasi');
    expect(localizedHref(Routes.account.profile(), 'en')).toBe('/en/account/profile');
  });
});
