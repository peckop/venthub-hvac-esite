'use client';

import React, { createContext, useCallback,useContext, useEffect, useMemo, useState } from 'react';

import { getCategories } from '@/lib/services/category.service';
import { useSupabaseClient } from '@/providers/SupabaseProvider';

import { DomainCategory,toUICategoryList } from '../lib/type-converters';
import type { CategoryMetadata } from '../types/db-rows';

interface CategoryContextType {
  categories: DomainCategory[];
  categoryTree: DomainCategory[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getCategoryBySlug: (slug: string) => DomainCategory | undefined;
  getSubCategories: (_parentId: string) => DomainCategory[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

/**
 * @provider CategoryProvider
 * @description Merkezi Kategori Otoritesi. Tüm uygulama genelinde kategori hiyerarşisini yönetir.
 */
export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabase } = useSupabaseClient();
  const [allCategories, setAllCategories] = useState<DomainCategory[]>([]);
  const [countMap, setCountMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [data, countRes] = await Promise.all([
        getCategories(supabase),
        supabase.rpc('get_category_counts'),
      ]);
      const domainCats = toUICategoryList(data);
      const map = new Map<string, number>();
      for (const row of countRes.data ?? []) {
        map.set(row.category_id, row.product_count ?? 0);
      }
      setAllCategories(domainCats);
      setCountMap(map);
    } catch (err) {
      console.error('Failed to load global categories:', err);
      setError('Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Müşteriye yalnız ÜRÜNÜ OLAN kategoriler gösterilir. Boş iskele kategoriler (gelecekteki ürün
  // ailesi için bilinçli oluşturulmuş) DB'de KALIR ama navigasyonda gizlenir. Filtre TEK NOKTADA
  // burada; tüm tüketici yüzeyleri (mega menü, footer, kategori hub, arama, anasayfa) otomatik
  // miras alır — admin bu context'i kullanmaz. Slug lookup'ı TAM set üzerinden (aşağıda) → boş bir
  // kategoriye direkt-URL ile gidilse bile çözülür, sayfa kırılmaz; yalnız gezinmede görünmez.
  const categories = useMemo(
    () => allCategories.filter((c) => (countMap.get(c.id) ?? 0) > 0),
    [allCategories, countMap]
  );

  // Yardımcı: Ağaç Yapısını Oluştur (Memoized)
  const categoryTree = useMemo(() => {
    const mainCats = categories.filter(c => !c.parent_id);
    // İleride burada daha derin nesting mantığı eklenebilir
    return mainCats.sort((a, b) => {
        const orderA = (a.metadata as CategoryMetadata | null)?.sort_order ?? 0;
        const orderB = (b.metadata as CategoryMetadata | null)?.sort_order ?? 0;
        return orderA - orderB;
    });
  }, [categories]);

  // Lookup maps for O(1) access. Slug lookup TAM set üzerinden (allCategories) — boş kategoriye
  // direkt-URL ile gelindiğinde de kategori çözülsün (sayfa boş-durum gösterir, kırılmaz).
  const categoriesSlugMap = useMemo(() => {
    const map = new Map<string, DomainCategory>();
    for (const c of allCategories) {
      if (c.slug) {
        map.set(c.slug, c);
      }
    }
    return map;
  }, [allCategories]);

  const categoriesParentMap = useMemo(() => {
    const map = new Map<string, DomainCategory[]>();
    for (const c of categories) {
      if (c.parent_id) {
        let siblings = map.get(c.parent_id);
        if (!siblings) {
          siblings = [];
          map.set(c.parent_id, siblings);
        }
        siblings.push(c);
      }
    }

    // Pre-sort the arrays
    for (const [, siblings] of map.entries()) {
      siblings.sort((a, b) => ((a.metadata as CategoryMetadata | null)?.sort_order ?? 0) - ((b.metadata as CategoryMetadata | null)?.sort_order ?? 0));
    }
    return map;
  }, [categories]);

  const getCategoryBySlug = useCallback((slug: string) => categoriesSlugMap.get(slug), [categoriesSlugMap]);
  const getSubCategories = useCallback((parentId: string) => categoriesParentMap.get(parentId) || [], [categoriesParentMap]);

  const value = useMemo(() => ({
    categories,
    categoryTree,
    loading,
    error,
    refresh: loadCategories,
    getCategoryBySlug,
    getSubCategories
  }), [
    categories,
    categoryTree,
    loading,
    error,
    loadCategories,
    getCategoryBySlug,
    getSubCategories
  ]);

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
