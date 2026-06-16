import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { I18nProvider } from '../../i18n/I18nProvider';
import { useLocalizedRoutes } from '../useLocalizedRoutes';

// CLIENT yol kilidi: useLocalizedRoutes proxy'si. localizedHref birim testi (utils/routes.test.ts)
// saf fonksiyonu kanıtlar; bu test proxy'nin AYRI mantığını pinler — iç-içe obje recurse'ü ve
// fonksiyon-sarma. Gerçek I18nProvider ile sarılır (mock yok); initialLang useState'e senkron
// gider ve effect'ler initialLang varken dili sabit tutar → dalga geçmeden gerçek dil okunur.
function wrapper(lang: 'tr' | 'en') {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <I18nProvider lang={lang}>{children}</I18nProvider>;
  };
}

describe('useLocalizedRoutes (proxy)', () => {
  it('üst-seviye builder\'ı aktif dile localize eder', () => {
    const { result } = renderHook(() => useLocalizedRoutes(), { wrapper: wrapper('tr') });
    expect(result.current.products()).toBe('/tr/products');
    expect(result.current.product('my-product')).toBe('/tr/products/my-product');
    expect(result.current.category('hvac', 'fans')).toBe('/tr/category/hvac/fans');
  });

  it('iç-içe obje builder\'ını da localize eder (proxy recurse)', () => {
    const { result } = renderHook(() => useLocalizedRoutes(), { wrapper: wrapper('tr') });
    // account.* ve legal.* iç-içe objelerdir → proxy bir alt seviyeye inmeli.
    expect(result.current.account.orders()).toBe('/tr/account/orders');
    expect(result.current.account.profile()).toBe('/tr/account/profile');
    expect(result.current.legal.cerez()).toBe('/tr/legal/cerez-politikasi');
  });

  it('kök yolu dil köküne çevirir (sondaki slash olmadan)', () => {
    const { result } = renderHook(() => useLocalizedRoutes(), { wrapper: wrapper('tr') });
    expect(result.current.home()).toBe('/tr');
  });

  it('/admin rotalarına dil öneki EKLEMEZ (iç-içe + muafiyet birlikte)', () => {
    const { result } = renderHook(() => useLocalizedRoutes(), { wrapper: wrapper('tr') });
    expect(result.current.admin.dashboard()).toBe('/admin');
    expect(result.current.admin.products()).toBe('/admin/products');
    expect(result.current.admin.products('prod-1')).toBe('/admin/products?id=prod-1');
  });

  it('aktif dile göre önek değişir (en sağlayıcısı)', () => {
    const { result } = renderHook(() => useLocalizedRoutes(), { wrapper: wrapper('en') });
    expect(result.current.products()).toBe('/en/products');
    expect(result.current.account.orders()).toBe('/en/account/orders');
    expect(result.current.admin.products()).toBe('/admin/products'); // dil-nötr kalır
  });
});
