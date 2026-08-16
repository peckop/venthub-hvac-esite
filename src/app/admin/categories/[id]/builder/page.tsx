'use client';

export const dynamic = 'force-dynamic';

import nextDynamic from 'next/dynamic';
import React, { use } from 'react';

import { useI18n } from '@/i18n/I18nProvider';

const Loading = () => {
  const { t } = useI18n();
  return (
    <div className="h-screen flex items-center justify-center bg-admin-bg text-admin-fg-muted font-mono text-xs">
      {t('admin.common.loading')}
    </div>
  );
};

const CategoryBuilderView = nextDynamic(
  () => import('@/views/admin/CategoryBuilderView'),
  { ssr: false, loading: Loading }
);

/**
 * @page CategoryBuilderPage
 * @description Kategori bazlı tam ekran Page Builder (Otorite Editörü) rotası.
 */
export default function CategoryBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();

  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center bg-admin-bg text-admin-fg-muted font-mono text-xs">
        {t('admin.common.invalidCategory')}
      </div>
    );
  }

  return <CategoryBuilderView categoryId={id} />;
}


