'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AuthorityBlock } from '@/types/authority';

interface BlockEditorProps {
  block: AuthorityBlock;
  onChange: (updatedBlock: AuthorityBlock) => void;
}

/**
 * @component BlockEditor
 * @description Belirli bir bloğun içeriğini ve yapılandırmasını düzenleyen form bileşeni.
 */
export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onChange }) => {
  const updateContent = (fields: Partial<AuthorityBlock['content']>) => {
    onChange({
      ...block,
      content: { ...block.content, ...fields } as AuthorityBlock['content']
    });
  };

  const updateConfig = (fields: Partial<AuthorityBlock['config']>) => {
    onChange({
      ...block,
      config: { ...block.config, ...fields }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* İÇERİK EDİTÖRÜ */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
          <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
          İçerik Ayarları
        </h4>
        
        {block.type === 'hero' && (
          <>
            <div className="space-y-2">
              <Label>Başlık</Label>
              <Input 
                value={block.content.title} 
                onChange={(e) => updateContent({ title: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea 
                value={block.content.description || ''} 
                onChange={(e) => updateContent({ description: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Görsel URL</Label>
                <Input 
                  value={block.content.imageUrl || ''} 
                  onChange={(e) => updateContent({ imageUrl: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input 
                  value={block.content.ctaLink || ''} 
                  onChange={(e) => updateContent({ ctaLink: e.target.value })} 
                />
              </div>
            </div>
          </>
        )}

        {block.type === 'media' && (
          <>
            <div className="space-y-2">
              <Label>Medya ID (Supabase / Media Auth)</Label>
              <Input 
                placeholder="Örn: product-3d-model-01"
                value={block.content.mediaId} 
                onChange={(e) => updateContent({ mediaId: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select 
                  value={block.content.mediaType} 
                  onValueChange={(val) => updateContent({ mediaType: val })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="3d">3D Model</SelectItem>
                    <SelectItem value="drawing">Teknik Çizim</SelectItem>
                    <SelectItem value="image">Görsel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Oran (Aspect Ratio)</Label>
                <Select 
                  value={block.content.aspectRatio || '16:9'} 
                  onValueChange={(val) => updateContent({ aspectRatio: val })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="4:3">4:3</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                    <SelectItem value="21:9">21:9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {block.type === 'rich-text' && (
          <div className="space-y-2">
            <Label>HTML İçerik</Label>
            <Textarea 
              className="font-mono text-xs h-32"
              value={block.content.html} 
              onChange={(e) => updateContent({ html: e.target.value })} 
            />
          </div>
        )}
        
        {/* Diğer blok tipleri için editörler buraya eklenecek... */}
      </div>

      {/* YAPILANDIRMA (CONFIG) EDİTÖRÜ */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
          <span className="w-1 h-4 bg-slate-400 rounded-full"></span>
          Blok Stili & Yapılandırma
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select 
              value={block.config?.theme || 'light'} 
              onValueChange={(val) => updateConfig({ theme: val })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Aydınlık (Light)</SelectItem>
                <SelectItem value="dark">Karanlık (Dark)</SelectItem>
                <SelectItem value="glass">Cam (Glass)</SelectItem>
                <SelectItem value="accent">Vurgu (Accent)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Padding</Label>
            <Select 
              value={block.config?.padding || 'medium'} 
              onValueChange={(val) => updateConfig({ padding: val })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yok</SelectItem>
                <SelectItem value="small">Küçük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="large">Geniş</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <input 
            type="checkbox" 
            id={`full-width-${block.id}`}
            checked={block.config?.fullWidth}
            onChange={(e) => updateConfig({ fullWidth: e.target.checked })}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <Label htmlFor={`full-width-${block.id}`} className="cursor-pointer">Tam Genişlik (Full Width)</Label>
        </div>
      </div>
    </div>
  );
};
