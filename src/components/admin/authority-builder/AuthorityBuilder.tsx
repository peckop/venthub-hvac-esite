'use client';

import { 
  ChevronDown, 
  ChevronUp, 
  Code, 
  Eye, 
  GripVertical, 
  Layers,
  LucideIcon,
  Plus, 
  Trash2} from 'lucide-react';
import React, { useState } from 'react';

import { useI18n } from '@/i18n/I18nProvider';
import { 
  AuthorityBlock, 
  AuthorityBlockType, 
  AuthorityContent 
} from '@/types/authority';

import { BlockEditor } from './BlockEditor';

// Proje genelindeki standart admin bileşen sınıfları
const btnBase = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-border disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
const btnGhost = `${btnBase} hover:bg-admin-surface-2 hover:text-admin-fg-subtle`;
const btnOutline = `${btnBase} border border-admin-border bg-admin-surface shadow-admin-sm hover:bg-admin-surface-2 hover:text-admin-fg-subtle`;
const btnSecondary = `${btnBase} bg-admin-surface-2 text-admin-fg-subtle shadow-admin-sm hover:bg-admin-surface-2`;
const cardClass = "rounded-admin-md border border-admin-border bg-admin-surface text-admin-fg-subtle shadow";
const badgeClass = "inline-flex items-center rounded-md border border-admin-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-border focus-visible:ring-offset-2 text-admin-fg-subtle";

interface AuthorityBuilderProps {
  value: AuthorityContent | null;
  onChange: (value: AuthorityContent) => void;
}

const BLOCK_TYPES: Array<{ type: AuthorityBlockType; labelKey: string; icon: LucideIcon }> = [
  { type: 'hero', labelKey: 'admin.authority.blockTypeHero', icon: Layers },
  { type: 'specs', labelKey: 'admin.authority.blockTypeSpecs', icon: Code },
  { type: 'media', labelKey: 'admin.authority.blockTypeMedia', icon: Eye },
  { type: 'rich-text', labelKey: 'admin.authority.blockTypeRichText', icon: Code },
  { type: 'features-grid', labelKey: 'admin.authority.blockTypeFeaturesGrid', icon: Layers },
  { type: 'comparison', labelKey: 'admin.authority.blockTypeComparison', icon: Layers },
  { type: 'cta-banner', labelKey: 'admin.authority.blockTypeCtaBanner', icon: Plus },
];

const blockTypeLabels: Record<AuthorityBlockType, string> = {
  hero: 'admin.authority.blockTypeHero',
  specs: 'admin.authority.blockTypeSpecs',
  media: 'admin.authority.blockTypeMedia',
  performance: 'admin.authority.blockTypePerformance',
  'rich-text': 'admin.authority.blockTypeRichText',
  'features-grid': 'admin.authority.blockTypeFeaturesGrid',
  comparison: 'admin.authority.blockTypeComparison',
  'cta-banner': 'admin.authority.blockTypeCtaBanner',
};

export const AuthorityBuilder: React.FC<AuthorityBuilderProps> = ({ 
  value = [], 
  onChange 
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'json'>('editor');
  const blocks = Array.isArray(value) ? value : [];

  const addBlock = (type: AuthorityBlockType) => {
    const newBlock: AuthorityBlock = {
      id: crypto.randomUUID(),
      type,
      order: blocks.length,
      config: {
        theme: 'light',
        padding: 'medium',
      },
      content: getInitialContent(type)
    } as AuthorityBlock;

    onChange([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks.map((b, i) => ({ ...b, order: i })));
  };

  const updateBlock = (index: number, updatedBlock: AuthorityBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  };

  return (
    <div className="space-y-6 bg-admin-surface-2 p-6 rounded-admin-md border border-admin-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-admin-md bg-admin-accent flex items-center justify-center text-admin-accent-fg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-admin-fg-subtle">{t('admin.authority.builderTitle')}</h3>
            <p className="text-sm text-admin-fg-muted">{t('admin.authority.builderSubtitle')}</p>
          </div>
        </div>

        <div className="flex bg-admin-surface p-1 rounded-admin-md border border-admin-border shadow-admin-sm">
          <button type="button" className={activeTab === 'editor' ? btnSecondary : btnGhost} onClick={() => setActiveTab('editor')}>{t('admin.authority.tabEditor')}</button>
          <button type="button" className={activeTab === 'preview' ? btnSecondary : btnGhost} onClick={() => setActiveTab('preview')}>{t('admin.authority.tabPreview')}</button>
          <button type="button" className={activeTab === 'json' ? btnSecondary : btnGhost} onClick={() => setActiveTab('json')}>{t('admin.authority.tabJson')}</button>
        </div>
      </div>

      {activeTab === 'editor' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt.type}
                type="button"
                className={`${btnOutline} h-auto py-3 flex-col gap-2 border-dashed hover:border-admin-accent hover:bg-admin-accent relative z-raised`}
                onClick={() => addBlock(bt.type)}
              >
                <bt.icon className="w-5 h-5 text-admin-fg-muted" />
                <span className="text-xs font-medium">{t(bt.labelKey)}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3 mt-8">
            {blocks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-admin-border rounded-admin-md bg-admin-surface">
                <p className="text-admin-fg-muted italic">{t('admin.authority.noBlocks')}</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div key={block.id} className={`${cardClass} group overflow-hidden border-admin-border shadow-admin-sm hover:shadow-admin-md transition-shadow`}>
                  <div className="flex items-center bg-admin-surface-2 px-4 py-2 border-b border-admin-border">
                    <GripVertical className="w-4 h-4 text-admin-fg mr-2 cursor-grab" />
                    <span className={badgeClass}>{t(blockTypeLabels[block.type])}</span>
                    <div className="flex-1 px-4 truncate text-xs font-medium text-admin-fg-muted">{t('admin.authority.idLabel')} {block.id.slice(0, 8)}</div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" className="h-8 w-8 flex items-center justify-center hover:bg-admin-surface-2 rounded" onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveBlock(index, 'up'); }}><ChevronUp className="w-4 h-4" /></button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center hover:bg-admin-surface-2 rounded" onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveBlock(index, 'down'); }}><ChevronDown className="w-4 h-4" /></button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center hover:bg-admin-danger text-admin-danger rounded" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeBlock(block.id); }}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="p-4 bg-admin-surface">
                    <BlockEditor block={block} onChange={(u) => updateBlock(index, u)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'json' && (
        <div className="p-4 bg-admin-surface-3 text-admin-accent font-mono text-xs overflow-auto max-h-500px rounded-admin-md">
          <pre>{JSON.stringify(blocks, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

function getInitialContent(type: AuthorityBlockType): AuthorityBlock['content'] {
  switch (type) {
    case 'hero': return { title: 'Yeni Başlık', subtitle: 'Alt Başlık', description: 'Kısa açıklama metni...' };
    case 'specs': return { title: 'Teknik Detaylar', rows: [{ label: 'Örnek', value: 'Değer' }] };
    case 'media': return { mediaId: '', mediaType: 'video', aspectRatio: '16:9' };
    case 'rich-text': return { html: '<p>Metin buraya gelecek...</p>' };
    case 'features-grid': return { items: [{ title: 'Önerilen Özellik', description: 'Kısa açıklama...', icon: 'zap' }] };
    case 'comparison': return { title: 'Önce/Sonra', leftLabel: 'Eski Sistem', rightLabel: 'VentHub Çözümü', leftImage: '', rightImage: '' };
    case 'cta-banner': return { title: 'Bize Ulaşın', buttonLabel: 'Teklif Al', buttonLink: '/contact' };
    default: return {} as AuthorityBlock['content'];
  }
}
