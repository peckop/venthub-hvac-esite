'use client';

import React from 'react';
import { 
  AuthorityBlock,
  HeroBlock,
  MediaBlock,
  RichTextBlock,
  FeaturesGridBlock,
  AuthorityBlockType,
  ComparisonBlock,
  CtaBannerBlock,
  SpecsBlock
} from '@/types/authority';
import { Plus, Trash2, LayoutGrid, Type, Image as ImageIcon, Video, Box, Table, ArrowRightLeft, MousePointer2 } from 'lucide-react';

// Standart Form Sınıfları
const labelClass = "text-sm font-black uppercase tracking-widest text-slate-400 mb-1 block";
const inputClass = "flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900";
const textareaClass = "flex min-h-[60px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900";
const selectClass = "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900";

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
            <div className="grid gap-1">
              <label className={labelClass}>Ana Başlık</label>
              <input 
                className={inputClass} 
                value={heroContent.title || ''} 
                onChange={(e) => handleContentChange({ title: e.target.value || 'Yeni Başlık' })} 
              />
            </div>
            <div className="grid gap-1">
              <label className={labelClass}>Alt Başlık</label>
              <input 
                className={inputClass} 
                value={heroContent.subtitle || ''} 
                onChange={(e) => handleContentChange({ subtitle: e.target.value })} 
              />
            </div>
            <div className="grid gap-1">
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

      case 'specs': {
        const specsContent = block.content as SpecsBlock['content'];
        const rows = specsContent.rows || [];

        const updateRow = (i: number, field: string, val: string) => {
          const newRows = [...rows];
          newRows[i] = { ...newRows[i], [field]: val };
          handleContentChange({ rows: newRows });
        };

        const addRow = () => {
          handleContentChange({ rows: [...rows, { label: 'Yeni Özellik', value: '-' }] });
        };

        const removeRow = (i: number) => {
          handleContentChange({ rows: rows.filter((_, idx) => idx !== i) });
        };

        return (
          <div className="space-y-6">
            <div className="grid gap-1">
              <label className={labelClass}>Tablo Başlığı</label>
              <input 
                className={inputClass} 
                value={specsContent.title || ''} 
                onChange={(e) => handleContentChange({ title: e.target.value })} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Teknik Satırlar</label>
                <button 
                  type="button" 
                  onClick={addRow}
                  className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                >
                  <Plus size={12} /> Satır Ekle
                </button>
              </div>

              <div className="grid gap-2 border border-slate-100 p-3 rounded-xl bg-slate-50/30">
                {rows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-start group bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex-1 grid gap-2">
                        <input 
                        placeholder="Özellik (Örn: Ses Seviyesi)" 
                        className={inputClass} 
                        value={row.label} 
                        onChange={(e) => updateRow(i, 'label', e.target.value)} 
                        />
                        <div className="flex gap-2">
                            <input 
                            placeholder="Değer" 
                            className={`${inputClass} flex-1`} 
                            value={row.value} 
                            onChange={(e) => updateRow(i, 'value', e.target.value)} 
                            />
                            <input 
                            placeholder="Birim" 
                            className={`${inputClass} w-20`} 
                            value={row.unit || ''} 
                            onChange={(e) => updateRow(i, 'unit', e.target.value)} 
                            />
                        </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeRow(i)}
                      className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'features-grid': {
        const fgContent = block.content as FeaturesGridBlock['content'];
        const items = fgContent.items || [];

        const updateItem = (i: number, field: string, val: string) => {
          const newItems = [...items];
          newItems[i] = { ...newItems[i], [field]: val };
          handleContentChange({ items: newItems });
        };

        const addItem = () => {
          handleContentChange({ items: [...items, { title: 'Özellik Başlığı', description: 'Detay metni...', icon: 'zap' }] });
        };

        const removeItem = (i: number) => {
          handleContentChange({ items: items.filter((_, idx) => idx !== i) });
        };

        return (
          <div className="space-y-6">
            <div className="grid gap-1">
              <label className={labelClass}>Grup Başlığı</label>
              <input 
                className={inputClass} 
                value={fgContent.title || ''} 
                onChange={(e) => handleContentChange({ title: e.target.value })} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Özellik Kartları</label>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                >
                  <Plus size={12} /> Kart Ekle
                </button>
              </div>

              <div className="grid gap-3">
                {items.map((item, i) => (
                  <div key={i} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeItem(i)}
                      className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors bg-white rounded-lg shadow-sm border border-slate-100"
                    >
                      <Trash2 size={12} />
                    </button>
                    
                    <div className="grid gap-3">
                        <div className="grid gap-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">İkon Adı (Lucide)</label>
                            <input 
                                className={inputClass} 
                                value={item.icon || 'zap'} 
                                onChange={(e) => updateItem(i, 'icon', e.target.value)} 
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Başlık</label>
                            <input 
                                className={inputClass} 
                                value={item.title || ''} 
                                onChange={(e) => updateItem(i, 'title', e.target.value)} 
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Açıklama</label>
                            <textarea 
                                className={textareaClass} 
                                value={item.description || ''} 
                                onChange={(e) => updateItem(i, 'description', e.target.value)} 
                            />
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'comparison': {
        const compContent = block.content as ComparisonBlock['content'];
        return (
          <div className="space-y-6">
            <div className="grid gap-1">
              <label className={labelClass}>Karşılaştırma Başlığı</label>
              <input 
                className={inputClass} 
                value={compContent.title || ''} 
                onChange={(e) => handleContentChange({ title: e.target.value })} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sol Taraf (Eski)</label>
                    <div className="grid gap-2">
                        <input className={inputClass} placeholder="Etiket (Örn: Geleneksel)" value={compContent.leftLabel} onChange={(e) => handleContentChange({ leftLabel: e.target.value })} />
                        <input className={inputClass} placeholder="Görsel URL" value={compContent.leftImage} onChange={(e) => handleContentChange({ leftImage: e.target.value })} />
                    </div>
                </div>
                <div className="space-y-3 p-3 bg-indigo-50/20 rounded-xl border border-indigo-100/50">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Sağ Taraf (Yeni)</label>
                    <div className="grid gap-2">
                        <input className={inputClass} placeholder="Etiket (Örn: VentHub Farkı)" value={compContent.rightLabel} onChange={(e) => handleContentChange({ rightLabel: e.target.value })} />
                        <input className={inputClass} placeholder="Görsel URL" value={compContent.rightImage} onChange={(e) => handleContentChange({ rightImage: e.target.value })} />
                    </div>
                </div>
            </div>
          </div>
        );
      }

      case 'cta-banner': {
        const ctaContent = block.content as CtaBannerBlock['content'];
        return (
          <div className="grid gap-4">
            <div className="grid gap-1">
              <label className={labelClass}>CTA Başlığı</label>
              <input className={inputClass} value={ctaContent.title || ''} onChange={(e) => handleContentChange({ title: e.target.value })} />
            </div>
            <div className="grid gap-1">
              <label className={labelClass}>Açıklama</label>
              <textarea className={textareaClass} value={ctaContent.description || ''} onChange={(e) => handleContentChange({ description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                    <label className={labelClass}>Buton Metni</label>
                    <input className={inputClass} value={ctaContent.buttonLabel || ''} onChange={(e) => handleContentChange({ buttonLabel: e.target.value })} />
                </div>
                <div className="grid gap-1">
                    <label className={labelClass}>Buton Linki</label>
                    <input className={inputClass} value={ctaContent.buttonLink || ''} onChange={(e) => handleContentChange({ buttonLink: e.target.value })} />
                </div>
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
              className={`${textareaClass} font-mono h-32 text-xs`}
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
