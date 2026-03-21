'use client';

import React from 'react';
import { 
  AuthorityContent, 
  HeroBlock as HeroBlockType, 
  SpecsBlock as SpecsBlockType,
  MediaBlock as MediaBlockType,
  RichTextBlock as RichTextBlockType
} from '@/types/authority';
import { cn } from '@/lib/utils';
import VideoAuthority from './VideoAuthority';
import ThreeDAuthority from './ThreeDAuthority';
import TechnicalDrawingAuthority from './TechnicalDrawingAuthority';

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
        <img src={block.content.imageUrl} alt="" className="w-full h-full object-cover" />
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

// --- RENDERER ANA BİLEŞEN ---

export const AuthorityRenderer: React.FC<{ content: AuthorityContent | null }> = ({ content }) => {
  if (!content || !Array.isArray(content) || content.length === 0) return null;

  return (
    <div className="authority-content-wrapper space-y-0">
      {content.map((block) => {
        if (block.config?.isHidden) return null;

        switch (block.type) {
          case 'hero':
            return <HeroBlock key={block.id} block={block as HeroBlockType} />;
          
          case 'specs':
            return <SpecsBlock key={block.id} block={block as SpecsBlockType} />;
          
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
                    <ThreeDAuthority 
                      metadata={{
                        modelId: mediaBlock.content.mediaId,
                        modelUrl: mediaBlock.content.mediaId,
                        format: 'glb'
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
                    <img 
                      src={mediaBlock.content.mediaId} 
                      alt={mediaBlock.content.title || ''} 
                      className="w-full h-full object-cover" 
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
                dangerouslySetInnerHTML={{ __html: rtBlock.content.html }}
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
