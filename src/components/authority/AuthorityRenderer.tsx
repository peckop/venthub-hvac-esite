'use client';

import DOMPurify from 'isomorphic-dompurify';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { cn } from '@/lib/utils';
import { 
  AuthorityContent, 
  ComparisonBlock as ComparisonBlockType,
  CtaBannerBlock as CtaBannerBlockType,
  FeaturesGridBlock as FeaturesGridBlockType,
  HeroBlock as HeroBlockType, 
  MediaBlock as MediaBlockType,
  RichTextBlock as RichTextBlockType,
  SpecsBlock as SpecsBlockType} from '@/types/authority';

import LazyInView from '../LazyInView';
import TechnicalDrawingAuthority from './TechnicalDrawingAuthority';
import VideoAuthority from './VideoAuthority';

// --- YARDIMCI BİLEŞENLER ---

const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
  const iconName = (name.charAt(0).toUpperCase() + name.slice(1)) as keyof typeof LucideIcons;
  const Icon = (LucideIcons[iconName] as React.ComponentType<{ className?: string }>) || LucideIcons.Zap;
  return <Icon className={className} />;
};

// --- BLOK BİLEŞENLERİ ---

const HeroBlock: React.FC<{ block: HeroBlockType }> = ({ block }) => (
  <section className={cn(
    "relative py-24 px-6 overflow-hidden",
    block.config?.fullWidth ? "w-full" : "max-w-7xl mx-auto rounded-3xl my-12",
    block.config?.theme === 'dark' ? "bg-slate-900 text-white" : "bg-white text-slate-900 border border-slate-100 shadow-xl"
  )}>
    <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
       {block.content.eyebrow && (
         <span className="text-indigo-500 font-bold tracking-widest uppercase text-xs">
           {block.content.eyebrow}
         </span>
       )}
       <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">{block.content.title}</h2>
       {block.content.description && (
         <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">{block.content.description}</p>
       )}
       {block.content.ctaLabel && (
         <div className="pt-4">
           <a 
             href={block.content.ctaLink || '#'} 
             className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
           >
             {block.content.ctaLabel}
           </a>
         </div>
       )}
    </div>
    {block.content.imageUrl && (
       <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <Image 
           src={block.content.imageUrl} 
           alt="" 
           fill 
           sizes="100vw"
           className="object-cover" 
         />
       </div>
    )}
  </section>
);

const SpecsBlock: React.FC<{ block: SpecsBlockType }> = ({ block }) => (
  <div className="max-w-7xl mx-auto py-16 px-6">
    <div className="mb-12">
      <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">{block.content.title}</h3>
      {block.content.description && <p className="text-slate-500">{block.content.description}</p>}
    </div>
    <div className={cn(
      "grid gap-4",
      block.content.columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : 
      block.content.columns === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
    )}>
      {block.content.rows?.map((row, i: number) => (
        <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-medium text-slate-400 mb-1">{row.label}</div>
          <div className="text-2xl font-black text-slate-900">
            {row.value}
            {row.unit && <span className="text-sm font-bold text-slate-400 ml-1">{row.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FeaturesGridBlock: React.FC<{ block: FeaturesGridBlockType }> = ({ block }) => (
    <div className="max-w-7xl mx-auto py-20 px-6">
        {block.content.title && (
            <h3 className="text-3xl font-black text-center mb-16 tracking-tight text-slate-900">{block.content.title}</h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {block.content.items.map((item, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
                        <IconRenderer name={item.icon} className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                    <p className="text-slate-500 leading-relaxed text-sm">{item.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const ComparisonBlock: React.FC<{ block: ComparisonBlockType }> = ({ block }) => (
    <div className="max-w-7xl mx-auto py-24 px-6">
        {block.content.title && (
            <h3 className="text-3xl font-black text-center mb-16 tracking-tight text-slate-900">{block.content.title}</h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 px-4 md:px-0 bg-slate-100 rounded-hvac-2xl overflow-hidden border-8 border-slate-100">
            <div className="relative aspect-video bg-white flex flex-col items-center justify-center p-8 text-center group">
                <span className="absolute top-6 left-6 px-4 py-1 rounded-full bg-slate-100 text-xs font-black uppercase tracking-widest text-slate-400">{block.content.leftLabel}</span>
                {block.content.leftImage ? (
                    <Image 
                      src={block.content.leftImage} 
                      alt={block.content.leftLabel || ""} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain" 
                    />
                ) : (
                    <LucideIcons.AlertCircle className="w-12 h-12 text-slate-200" />
                )}
            </div>
            <div className="relative aspect-video bg-indigo-600 flex flex-col items-center justify-center p-8 text-center group">
                <span className="absolute top-6 right-6 px-4 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest text-white">{block.content.rightLabel}</span>
                {block.content.rightImage ? (
                    <Image 
                      src={block.content.rightImage} 
                      alt={block.content.rightLabel || ""} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain brightness-0 invert" 
                    />
                ) : (
                    <LucideIcons.CheckCircle2 className="w-12 h-12 text-white/20" />
                )}
                {block.content.differenceText && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-2xl shadow-xl">
                        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">{block.content.differenceText}</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const CtaBannerBlock: React.FC<{ block: CtaBannerBlockType }> = ({ block }) => (
    <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="relative rounded-hvac-2xl bg-indigo-600 p-12 md:p-20 overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="relative z-10 max-w-2xl">
                <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">{block.content.title}</h3>
                <p className="text-indigo-100 text-lg md:text-xl font-medium opacity-80">{block.content.description}</p>
            </div>
            <div className="relative z-10 shrink-0">
                <a 
                    href={block.content.buttonLink} 
                    className="inline-flex h-16 items-center justify-center rounded-3xl bg-white px-10 text-lg font-black text-indigo-600 hover:bg-indigo-50 hover:scale-105 transition-transform shadow-2xl shadow-black/20 active:scale-95"
                >
                    {block.content.buttonLabel}
                    <LucideIcons.ArrowRight className="ml-3 w-6 h-6" />
                </a>
            </div>
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
        </div>
    </div>
);

// --- RENDERER ANA BİLEŞEN ---

export const AuthorityRenderer: React.FC<{ content: AuthorityContent | null }> = ({ content }) => {
  if (!content || !Array.isArray(content) || content.length === 0) return null;

  return (
    <div className="authority-content-wrapper space-y-0 bg-white">
      {content.map((block) => {
        if (block.config?.isHidden) return null;

        switch (block.type) {
          case 'hero':
            return <HeroBlock key={block.id} block={block as HeroBlockType} />;
          
          case 'specs':
            return <SpecsBlock key={block.id} block={block as SpecsBlockType} />;

          case 'features-grid':
            return <FeaturesGridBlock key={block.id} block={block as FeaturesGridBlockType} />;

          case 'comparison':
            return <ComparisonBlock key={block.id} block={block as ComparisonBlockType} />;

          case 'cta-banner':
            return <CtaBannerBlock key={block.id} block={block as CtaBannerBlockType} />;
          
          case 'media': {
            const mediaBlock = block as MediaBlockType;
            return (
              <div key={mediaBlock.id} className={cn(
                "py-12 px-6",
                mediaBlock.config?.fullWidth ? "w-full" : "max-w-7xl mx-auto"
              )}>
                {mediaBlock.content.title && (
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">{mediaBlock.content.title}</h3>
                )}
                <div className="rounded-3xl overflow-hidden bg-slate-50 border border-slate-200 shadow-2xl aspect-video relative group">
                  {mediaBlock.content.mediaType === 'video' && (
                    <VideoAuthority 
                      metadata={{
                        id: mediaBlock.content.mediaId,
                        provider: 'youtube',
                        title: mediaBlock.content.title || 'Video',
                        aspectRatio: (mediaBlock.content.aspectRatio as string) === 'vertical' ? 'vertical' : '16:9'
                      }}
                    />
                  )}
                  {mediaBlock.content.mediaType === '3d' && (
                    <LazyInView
                      loader={() => import('./ThreeDAuthority')}
                      placeholder={<div className="min-h-hvac-section w-full bg-slate-900/10 animate-pulse rounded-hvac-lg" />}
                      componentProps={{
                        metadata: {
                          modelId: mediaBlock.content.mediaId,
                          modelUrl: mediaBlock.content.mediaId,
                          format: 'glb' as const
                        }
                      }}
                    />
                  )}
                  {mediaBlock.content.mediaType === 'drawing' && (
                    <TechnicalDrawingAuthority 
                      drawings={[{
                        id: mediaBlock.id,
                        title: mediaBlock.content.title || 'Teknik Çizim',
                        url: mediaBlock.content.mediaId,
                        format: 'pdf',
                        category: 'dimensions'
                      }]}
                    />
                  )}
                  {mediaBlock.content.mediaType === 'image' && (
                    <Image 
                      src={mediaBlock.content.mediaId} 
                      alt={mediaBlock.content.title || ''} 
                      fill
                      sizes="100vw"
                      className="object-cover" 
                    />
                  )}
                </div>
                {mediaBlock.content.description && (
                  <p className="mt-4 text-slate-500 text-sm italic text-center">{mediaBlock.content.description}</p>
                )}
              </div>
            );
          }

          case 'rich-text': {
            const rtBlock = block as RichTextBlockType;
            return (
              <div 
                key={rtBlock.id} 
                className="max-w-4xl mx-auto py-16 px-6 prose prose-slate prose-lg md:prose-xl"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rtBlock.content.html) }}
              />
            );
          }
          
          default:
            return (
              <div key={block.id} className="p-8 border-2 border-dashed border-red-100 text-red-300 text-xs text-center m-8 rounded-3xl">
                Bilinmeyen Blok Tipi: {block.type}
              </div>
            );
        }
      })}
    </div>
  );
};
