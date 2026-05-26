'use client';

import React, { use } from 'react';
import CategoryBuilderView from '@/views/admin/CategoryBuilderView';

/**
 * @page CategoryBuilderPage
 * @description Kategori bazlı tam ekran Page Builder (Otorite Editörü) rotası.
 */
export default function CategoryBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-deep text-slate-400 font-mono text-xs uppercase tracking-widest">
        Geçersiz Kategori Kimliği (ID Not Found)
      </div>
    );
  }

  return <CategoryBuilderView categoryId={id} />;
}
