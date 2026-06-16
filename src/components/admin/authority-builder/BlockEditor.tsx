'use client';

import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

import { useI18n } from '@/i18n/I18nProvider';
import { 
  AuthorityBlock,
  ComparisonBlock,
  CtaBannerBlock,
  FeaturesGridBlock,
  HeroBlock,
  MediaBlock,
  RichTextBlock,
  SpecsBlock
} from '@/types/authority';

// Standart Form Sınıfları
const labelClass = "text-sm font-black uppercase tracking-widest text-slate-400 mb-1 block";
const inputClass = "flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900";
const textareaClass = "flex min-h-[60px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900";
const selectClass = "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900";

interface BlockEditorProps {
  block: AuthorityBlock;
  onChange: (updatedBlock: AuthorityBlock) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onChange }) => {
  const { t } = useI18n();
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
              <label className={labelClass}>{t('admin.authority.mainTitle')}</label>
              <input 
                className={inputClass} 
                value={heroContent.title || ''} 
                onChange={(e) => handleContentChange({ title: e.target.value || 'Yeni Başlık' })} 
              />
            </div>
            <div className="grid gap-1">
              <label className={labelClass}>{t('admin.authority.subtitle')}</label>
              <input 
                className={inputClass} 
                value={heroContent.subtitle || ''} 
                onChange={(e) => handleContentChange({ subtitle: e.target.value })} 
              />
            </div>
            <div className="grid gap-1">
              <label className={labelClass}>{t('admin.authority.description')}</label>
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
              <label className={labelClass}>{t('admin.authority.tableTitle')}</label>
              <input 
                className={inputClass} 
                value={specsContent.title || ''} 
                onChange={(e) => handleContentChange({ title: e.target.value })} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-hvac-normal text-indigo-400">{t('admin.authority.technicalRows')}</label>
                <button 
                  type="button" 
                  onClick={addRow}
                  className="flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                >
                  <Plus size={12} /> {t('admin.common.addLine')}
                </button>
              </div>

              <div className="grid gap-2 border border-slate-100 p-3 rounded-xl bg-slate-50/30">
                {rows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-start group bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex-1 grid gap-2">
                        <input 
                        placeholder={t('admin.authority.featurePlaceholder')} 
                        className={inputClass} 
                        value={row.label} 
                        onChange={(e) => updateRow(i, 'label', e.target.value)} 
                        />
                        <div className="flex gap-2">
                            <input 
                            placeholder={t('admin.authority.valuePlaceholder')} 
                            className={`${inputClass} flex-1`} 
                            value={row.value} 
                            onChange={(e) => updateRow(i, 'value', e.target.value)} 
                            />
                            <input 
                            placeholder={t('admin.authority.unitPlaceholder')} 
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
              <label className={labelClass}>{t('admin.authority.groupTitle')}</label>
              <input 
                className={inputClass} 
                value={fgContent.title || ''} 
                onChange={(e) => handleContentChange({ title: e.target.value })} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-hvac-normal text-indigo-400">{t('admin.authority.featureCards')}</label>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                >
                  <Plus size={12} /> {t('admin.common.addCard')}
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
                            <label className="text-xs font-bold text-slate-400 uppercase">{t('admin.authority.iconName')}</label>
                            <input 
                                className={inputClass} 
                                value={item.icon || 'zap'} 
                                onChange={(e) => updateItem(i, 'icon', e.target.value)} 
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">{t('admin.authority.title')}</label>
                            <input 
                                className={inputClass} 
                                value={item.title || ''} 
                                onChange={(e) => updateItem(i, 'title', e.target.value)} 
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">{t('admin.authority.description')}</label>
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
              <label className={labelClass}>{t('admin.authority.comparisonTitle')}</label>
              <input 
                className={inputClass} 
                value={compContent.title || ''} 
                onChange={(e) => handleContentChange({ title: e.target.value })} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <label className="text-xs font-black text-indigo-400 uppercase tracking-widest">{t('admin.authority.leftSideEski')}</label>
                    <div className="grid gap-2">
                        <input className={inputClass} placeholder={t('admin.authority.labelTraditional')} value={compContent.leftLabel} onChange={(e) => handleContentChange({ leftLabel: e.target.value })} />
                        <input className={inputClass} placeholder={t('admin.common.imageUrl')} value={compContent.leftImage} onChange={(e) => handleContentChange({ leftImage: e.target.value })} />
                    </div>
                </div>
                <div className="space-y-3 p-3 bg-indigo-50/20 rounded-xl border border-indigo-100/50">
                    <label className="text-xs font-black text-indigo-600 uppercase tracking-widest">{t('admin.authority.rightSideYeni')}</label>
                    <div className="grid gap-2">
                        <input className={inputClass} placeholder={t('admin.authority.labelVenthub')} value={compContent.rightLabel} onChange={(e) => handleContentChange({ rightLabel: e.target.value })} />
                        <input className={inputClass} placeholder={t('admin.common.imageUrl')} value={compContent.rightImage} onChange={(e) => handleContentChange({ rightImage: e.target.value })} />
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
              <label className={labelClass}>{t('admin.authority.ctaTitle')}</label>
              <input className={inputClass} value={ctaContent.title || ''} onChange={(e) => handleContentChange({ title: e.target.value })} />
            </div>
            <div className="grid gap-1">
              <label className={labelClass}>{t('admin.authority.description')}</label>
              <textarea className={textareaClass} value={ctaContent.description || ''} onChange={(e) => handleContentChange({ description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                    <label className={labelClass}>{t('admin.authority.buttonText')}</label>
                    <input className={inputClass} value={ctaContent.buttonLabel || ''} onChange={(e) => handleContentChange({ buttonLabel: e.target.value })} />
                </div>
                <div className="grid gap-1">
                    <label className={labelClass}>{t('admin.authority.buttonLink')}</label>
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
              <label className={labelClass}>{t('admin.authority.mediaType')}</label>
              <select 
                className={selectClass} 
                value={mediaContent.mediaType || 'video'}
                onChange={(e) => handleContentChange({ mediaType: e.target.value })}
              >
                <option value="video">{t('admin.authority.mediaTypeVideo')}</option>
                <option value="3d">{t('admin.authority.mediaType3d')}</option>
                <option value="drawing">{t('admin.authority.mediaTypeDrawing')}</option>
                <option value="image">{t('admin.authority.mediaTypeImage')}</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className={labelClass}>{t('admin.authority.mediaIdUrl')}</label>
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
            <label className={labelClass}>{t('admin.authority.htmlContent')}</label>
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
            {t('admin.authority.noEditorForType', { type: block.type })}
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
