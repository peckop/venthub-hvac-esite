'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { getCategories } from '../lib/supabase';
import { toUICategoryList, DomainCategory } from '../lib/type-converters';
import type { CategoryMetadata } from '../types/db-rows';

interface CategoryContextType {
  categories: DomainCategory[];
  categoryTree: DomainCategory[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getCategoryBySlug: (slug: string) => DomainCategory | undefined;
  getSubCategories: (parentId: string) => DomainCategory[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

/**
 * @provider CategoryProvider
 * @description Merkezi Kategori Otoritesi. Tüm uygulama genelinde kategori hiyerarşisini yönetir.
 */
export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<DomainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      const domainCats = toUICategoryList(data);
      setCategories(domainCats);
    } catch (err) {
      console.error('Failed to load global categories:', err);
      setError('Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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

  const getCategoryBySlug = useCallback((slug: string) => categories.find(c => c.slug === slug), [categories]);
  const getSubCategories = useCallback((parentId: string) =>
    categories.filter(c => c.parent_id === parentId)
              .sort((a, b) => ((a.metadata as CategoryMetadata | null)?.sort_order ?? 0) - ((b.metadata as CategoryMetadata | null)?.sort_order ?? 0)), [categories]);

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
