/**
 * @file src/types/authority.ts
 * @description Visual Page Builder (Otorite İçeriği) için dinamik blok tabanlı tip tanımları.
 * Bu şema categories.authority_content JSONB alanı ile %100 uyumludur.
 */

export type AuthorityBlockType = 
  | 'hero' 
  | 'specs' 
  | 'performance' 
  | 'media' 
  | 'rich-text'
  | 'features-grid'
  | 'comparison'
  | 'cta-banner';

export interface BaseAuthorityBlock {
  id: string;
  type: AuthorityBlockType;
  order: number;
  config?: {
    fullWidth?: boolean;
    theme?: 'light' | 'dark' | 'glass' | 'accent';
    padding?: 'none' | 'small' | 'medium' | 'large';
    spacing?: 'none' | 'overlap' | 'default';
    isHidden?: boolean;
    className?: string;
  };
}

export interface HeroBlock extends BaseAuthorityBlock {
  type: 'hero';
  content: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    ctaLabel?: string;
    ctaLink?: string;
    overlayOpacity?: number;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface SpecsBlock extends BaseAuthorityBlock {
  type: 'specs';
  content: {
    title: string;
    description?: string;
    rows: Array<{
      label: string;
      value: string;
      unit?: string;
      icon?: string;
      isHighlighted?: boolean;
    }>;
    columns?: 2 | 3 | 4;
  };
}

export interface MediaBlock extends BaseAuthorityBlock {
  type: 'media';
  content: {
    title?: string;
    description?: string;
    mediaId: string; // P01-012 Medya Otoritesi ile eşleşen ID
    mediaType: 'video' | '3d' | 'drawing' | 'image';
    aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    thumbnailUrl?: string;
  };
}

export interface PerformanceBlock extends BaseAuthorityBlock {
  type: 'performance';
  content: {
    title: string;
    description?: string;
    chartType: 'curve' | 'bars' | 'radar';
    datasetId: string; // Veri kaynağından çekilecek ID
    unitX?: string;
    unitY?: string;
    showLegend?: boolean;
  };
}

export interface RichTextBlock extends BaseAuthorityBlock {
  type: 'rich-text';
  content: {
    title?: string;
    html: string;
    columns?: 1 | 2;
  };
}

export interface FeaturesGridBlock extends BaseAuthorityBlock {
  type: 'features-grid';
  content: {
    title?: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
      link?: string;
    }>;
  };
}

export interface ComparisonBlock extends BaseAuthorityBlock {
  type: 'comparison';
  content: {
    title: string;
    leftLabel: string;
    leftImage: string;
    rightLabel: string;
    rightImage: string;
    differenceText?: string;
  };
}

export interface CtaBannerBlock extends BaseAuthorityBlock {
  type: 'cta-banner';
  content: {
    title: string;
    description?: string;
    buttonLabel: string;
    buttonLink: string;
    backgroundColor?: string;
    backgroundImage?: string;
  };
}

export type AuthorityBlock = 
  | HeroBlock 
  | SpecsBlock 
  | MediaBlock 
  | PerformanceBlock
  | RichTextBlock
  | FeaturesGridBlock
  | ComparisonBlock
  | CtaBannerBlock;

export type AuthorityContent = AuthorityBlock[];
