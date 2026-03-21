'use client';

import React from 'react';
import { AuthorityContent } from '@/types/authority';
import { AuthorityRenderer } from '@/components/authority/AuthorityRenderer';

interface CategoryAuthoritySectionProps {
  content: AuthorityContent | null;
  brandImage?: string;
}

/**
 * @component CategoryAuthoritySection
 * @description Kategori sayfasında otorite içeriğini (blokları) render eden sarmalayıcı.
 */
export const CategoryAuthoritySection: React.FC<CategoryAuthoritySectionProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="mt-12">
       <AuthorityRenderer content={content} />
    </div>
  );
};
