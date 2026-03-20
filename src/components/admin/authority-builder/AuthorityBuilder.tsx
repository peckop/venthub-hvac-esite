'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Code, 
  Layers,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AuthorityBlock, 
  AuthorityBlockType, 
  AuthorityContent 
} from '@/types/authority';
import { BlockEditor } from './BlockEditor';

interface AuthorityBuilderProps {
  value: AuthorityContent | null;
  onChange: (value: AuthorityContent) => void;
}

const BLOCK_TYPES: Array<{ type: AuthorityBlockType; label: string; icon: LucideIcon }> = [
  { type: 'hero', label: 'Hero / Banner', icon: Layers },
  { type: 'specs', label: 'Teknik Özellikler', icon: Code },
  { type: 'media', label: 'Medya (Video/3D)', icon: Eye },
  { type: 'rich-text', label: 'Zengin Metin', icon: Code },
  { type: 'features-grid', label: 'Özellik Tablosu', icon: Layers },
  { type: 'comparison', label: 'Karşılaştırma', icon: Layers },
  { type: 'cta-banner', label: 'CTA Banner', icon: Plus },
];

/**
 * @component AuthorityBuilder
 * @description Admin tarafında kategori otorite içeriğini (blokları) yöneten ana editör.
 */
export const AuthorityBuilder: React.FC<AuthorityBuilderProps> = ({ 
  value = [], 
  onChange 
}) => {
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
    
    // Düzen sonrası 'order' alanlarını güncelle
    const updatedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
    onChange(updatedBlocks);
  };

  const updateBlock = (index: number, updatedBlock: AuthorityBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  };

  return (
    <div className="space-y-6 bg-slate-50/50 p-6 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Authority Builder</h3>
            <p className="text-sm text-slate-500">Blok tabanlı sayfa oluşturucu</p>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <Button 
            variant={activeTab === 'editor' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('editor')}
          >
            Editör
          </Button>
          <Button 
            variant={activeTab === 'preview' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('preview')}
          >
            Önizleme
          </Button>
          <Button 
            variant={activeTab === 'json' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('json')}
          >
            JSON
          </Button>
        </div>
      </div>

      {activeTab === 'editor' && (
        <div className="space-y-4">
          {/* Blok Ekleme Paneli */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {BLOCK_TYPES.map((bt) => (
              <Button
                key={bt.type}
                variant="outline"
                className="h-auto py-3 flex-col gap-2 border-dashed hover:border-indigo-400 hover:bg-indigo-50"
                onClick={() => addBlock(bt.type)}
              >
                <bt.icon className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-medium uppercase tracking-wider">{bt.label}</span>
              </Button>
            ))}
          </div>

          {/* Blok Listesi */}
          <div className="space-y-3 mt-8">
            {blocks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                <p className="text-slate-400 italic">Henüz blok eklenmemiş. Yukarıdaki panelden başlayın.</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <Card key={block.id} className="group overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center bg-slate-50/80 px-4 py-2 border-b border-slate-100">
                    <GripVertical className="w-4 h-4 text-slate-300 mr-2 cursor-grab" />
                    <Badge variant="outline" className="bg-white font-mono text-[10px] uppercase">
                      {block.type}
                    </Badge>
                    <div className="flex-1 px-4 truncate text-xs font-medium text-slate-500">
                      ID: {block.id.slice(0, 8)}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveBlock(index, 'up')}>
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveBlock(index, 'down')}>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeBlock(block.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <BlockEditor 
                      block={block} 
                      onChange={(updatedBlock) => updateBlock(index, updatedBlock)} 
                    />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'json' && (
        <Card className="p-4 bg-slate-900 text-indigo-300 font-mono text-xs overflow-auto max-h-[500px]">
          <pre>{JSON.stringify(blocks, null, 2)}</pre>
        </Card>
      )}

      {activeTab === 'preview' && (
        <div className="p-12 text-center border-2 border-dashed rounded-xl">
          <Eye className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-slate-900">Önizleme Modu</h4>
          <p className="text-slate-500">Görsel Renderer inşa edildikten sonra burada aktif olacaktır.</p>
        </div>
      )}
    </div>
  );
};

// Yardımcı Fonksiyon: Blok tipine göre varsayılan içerik oluşturur
function getInitialContent(type: AuthorityBlockType): AuthorityBlock['content'] {
  switch (type) {
    case 'hero':
      return { title: 'Yeni Başlık', subtitle: 'Alt Başlık', description: 'Kısa açıklama metni...' };
    case 'specs':
      return { title: 'Teknik Detaylar', rows: [{ label: 'Örnek', value: 'Değer' }] };
    case 'media':
      return { mediaId: '', mediaType: 'video', aspectRatio: '16:9' };
    case 'rich-text':
      return { html: '<p>Metin buraya gelecek...</p>' };
    case 'features-grid':
      return { items: [{ title: 'Önerilen Özellik', description: 'Kısa açıklama...', icon: 'zap' }] };
    case 'comparison':
      return { title: 'Önce/Sonra', leftLabel: 'Eski Sistem', rightLabel: 'VentHub Çözümü', leftImage: '', rightImage: '' };
    case 'cta-banner':
      return { title: 'Bize Ulaşın', buttonLabel: 'Teklif Al', buttonLink: '/contact' };
    default:
      return {} as AuthorityBlock['content'];
  }
}
