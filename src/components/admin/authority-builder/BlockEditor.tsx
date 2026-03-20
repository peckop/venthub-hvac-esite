'use client';

import React from 'react';
import { 
  AuthorityBlock,
  HeroBlock,
  MediaBlock,
  RichTextBlock
} from '@/types/authority';

// Standart Form Sınıfları
const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
const inputClass = "flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50";
const textareaClass = "flex min-h-[60px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50";
const selectClass = "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50";

interface BlockEditorProps {
  block: AuthorityBlock;
  onChange: (updatedBlock: AuthorityBlock) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onChange }) => {
  const handleContentChange = (fields: Partial<Record<string, unknown>>) => {
    const updatedBlock = {
      ...block,
      content: { ...block.content, ...fields }
    } as AuthorityBlock;
    
    onChange(updatedBlock);
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'hero': {
        const heroContent = block.content as HeroBlock['content'];
        return (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className={labelClass}>Ana Başlık</label>
              <input 
                className={inputClass} 
                value={heroContent.title || ''} 
                onChange={(e) => handleContentChange({ title: e.target.value || 'Yeni Başlık' })} 
              />
            </div>
            <div className="grid gap-2">
              <label className={labelClass}>Alt Başlık</label>
              <input 
                className={inputClass} 
                value={heroContent.subtitle || ''} 
                onChange={(e) => handleContentChange({ subtitle: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <label className={labelClass}>Açıklama</label>
              <textarea 
                className={textareaClass} 
                value={heroContent.description || ''} 
                onChange={(e) => handleContentChange({ description: e.target.value })} 
              />
            </div>
          </div>
        );
      }

      case 'media': {
        const mediaContent = block.content as MediaBlock['content'];
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className={labelClass}>Medya Tipi</label>
              <select 
                className={selectClass} 
                value={mediaContent.mediaType || 'video'}
                onChange={(e) => handleContentChange({ mediaType: e.target.value })}
              >
                <option value="video">Video</option>
                <option value="3d">3D Model</option>
                <option value="drawing">Teknik Çizim</option>
                <option value="image">Görsel</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className={labelClass}>Medya ID / URL</label>
              <input 
                className={inputClass} 
                value={mediaContent.mediaId || ''} 
                onChange={(e) => handleContentChange({ mediaId: e.target.value })} 
              />
            </div>
          </div>
        );
      }

      case 'rich-text': {
        const rtContent = block.content as RichTextBlock['content'];
        return (
          <div className="grid gap-2">
            <label className={labelClass}>HTML İçerik</label>
            <textarea 
              className={`${textareaClass} font-mono h-32`}
              value={rtContent.html || ''} 
              onChange={(e) => handleContentChange({ html: e.target.value })} 
            />
          </div>
        );
      }

      default:
        return (
          <div className="p-4 bg-slate-50 rounded text-slate-500 text-center italic text-sm">
            Bu blok tipi ({block.type}) için henüz editör arayüzü eklenmedi.
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderEditor()}
    </div>
  );
};
