'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CategoryBuilderView from '@/views/admin/CategoryBuilderView';

/**
 * @page CategoryBuilderPage
 * @description Kategori bazlı tam ekran Page Builder (Otorite Editörü) rotası.
 */
export default function CategoryBuilderPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0F1E] text-slate-400 font-mono text-xs uppercase tracking-widest">
        Geçersiz Kategori Kimliği (ID Not Found)
      </div>
    );
  }

  return <CategoryBuilderView categoryId={id} />;
}
