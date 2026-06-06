'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ChevronLeft, 
  Loader2, 
  Monitor, 
  Smartphone,
  Layout,
  Eye,
  PanelRight,
} from 'lucide-react';
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client';
import { AuthorityBuilder } from '@/components/admin/authority-builder/AuthorityBuilder';
import { AuthorityRenderer } from '@/components/authority/AuthorityRenderer';
import { AuthorityBlock, SpecsBlock } from '@/types/authority';
import { DbCategory, CategoryMetadata, DbJson } from '@/types/db-rows';
import { toast } from 'sonner';

interface CategoryBuilderViewProps {
  categoryId: string;
}

const CategoryBuilderView: React.FC<CategoryBuilderViewProps> = ({ categoryId }) => {
  const router = useRouter();
  const [category, setCategory] = useState<DbCategory | null>(null);
  const [blocks, setBlocks] = useState<AuthorityBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content').eq('id', categoryId).single();
      if (error) throw error;
      const cat = data as DbCategory;
      setCategory(cat);
      
      let initialBlocks: AuthorityBlock[] = (cat.authority_content as AuthorityBlock[]) || [];

      // --- LEGACY MIGRATION ENGINE ---
      // Eğer yeni blok yapısı boşsa, eski statik verileri bloklara çevir
      if (initialBlocks.length === 0) {
        const legacyBlocks: AuthorityBlock[] = [];
        
        // 1. Eski Açıklamayı 'Rich Text' bloğuna çevir
        if (cat.description) {
          legacyBlocks.push({
            id: 'legacy-desc',
            type: 'rich-text',
            order: 0,
            content: { html: `<p>${cat.description}</p>` },
            config: { theme: 'light', padding: 'medium' }
          } as AuthorityBlock);
        }

        // 2. Eski Metrikleri 'Specs' bloğuna çevir
        const meta = cat.metadata as CategoryMetadata | null;
        if (meta?.metric1 || meta?.metric2) {
          const rows: SpecsBlock['content']['rows'] = [];
          
          if (meta.metric1?.label) rows.push({ label: meta.metric1.label, value: meta.metric1.value || '' });
          if (meta.metric2?.label) rows.push({ label: meta.metric2.label, value: meta.metric2.value || '' });
          
          if (rows.length > 0) {
            legacyBlocks.push({
              id: 'legacy-specs',
              type: 'specs',
              order: 1,
              content: { title: 'Teknik Özet', rows } as SpecsBlock['content'],
              config: { theme: 'light', padding: 'medium' }
            } as AuthorityBlock);
          }
        }
        
        if (legacyBlocks.length > 0) {
          initialBlocks = legacyBlocks;
          toast.success('Eski veriler bloklara dönüştürüldü. Kaydetmeyi unutmayın.');
        }
      }

      setBlocks(initialBlocks);
    } catch (e) {
      console.error('Builder load error:', e);
      toast.error('Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Use DbJson (re-exported Json) to satisfy Supabase requirement without 'any'
      const { error } = await supabase
        .from('categories')
        .update({ authority_content: blocks as DbJson })
        .eq('id', categoryId);
      if (error) throw error;
      toast.success('Değişiklikler sisteme mühürlendi.');
    } catch (e) {
      console.error('Save error:', e);
      toast.error('Kaydetme hatası!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-surface-deep space-y-6">
        <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-xs font-black text-slate-500 uppercase tracking-hvac-loose animate-pulse">Studio Initialization...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-darkest text-slate-200 overflow-hidden font-sans">
      {/* --- PLATINUM HEADER --- */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface-deep z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                <ChevronLeft size={18} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest leading-none">Geri Dön</span>
                <span className="text-xs font-bold text-white mt-1">{category?.name}</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 bg-white/5 p-1 rounded-xl border border-white/5">
             <button 
                onClick={() => setShowPreview(!showPreview)} 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${showPreview ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <Eye size={14} />
                {showPreview ? 'Önizleme Açık' : 'Önizleme Kapalı'}
             </button>
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-3 bg-white text-slate-900 hover:bg-cyan-400 hover:text-white disabled:opacity-50 px-8 py-2.5 rounded-xl text-xs font-black tracking-widest shadow-xl transition-transform active:scale-95"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            DEĞİŞİKLİKLERİ KAYDET
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* --- CENTER: MAIN EDITOR (Studio Area) --- */}
        <main className="flex-1 overflow-y-auto bg-surface-darkest custom-scrollbar relative">
            <div className="max-w-content mx-auto py-12 px-6">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight italic">Page Studio</h2>
                        <p className="text-sm text-slate-500 mt-1">Blokları yönetin, içerikleri düzenleyin ve sayfanızı inşa edin.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Live Sync Active</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <AuthorityBuilder value={blocks || []} onChange={setBlocks} />
                </div>

                {/* Bottom Guide */}
                <div className="mt-20 pt-12 border-t border-white/5 text-center">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-hvac-relaxed">VentHub Content Authority Engine v2.4</p>
                </div>
            </div>
        </main>

        {/* --- RIGHT: FLOATING PREVIEW SIDEBAR --- */}
        {showPreview && (
          <aside className="w-480px border-l border-white/5 flex flex-col bg-surface-deep animate-in slide-in-from-right duration-500">
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/2">
                <div className="flex items-center gap-2">
                    <PanelRight size={16} className="text-cyan-400" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Canlı Önizleme</span>
                </div>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 scale-75">
                    <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-white/10 text-cyan-400' : 'text-slate-500'}`}>
                        <Monitor size={16} />
                    </button>
                    <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-white/10 text-cyan-400' : 'text-slate-500'}`}>
                        <Smartphone size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-slate-950 p-4 relative overflow-hidden flex items-center justify-center">
                {/* Device Frame */}
                <div 
                    className={`
                    bg-white shadow-2xl transition-colors duration-500 overflow-y-auto custom-scrollbar-light relative
                    ${previewMode === 'mobile' ? 'w-320px h-568px rounded-hvac-xl border-8 border-slate-800' : 'w-full h-full rounded-lg'}
                    `}
                >
                    <AuthorityRenderer content={blocks || []} />
                    {(!blocks || blocks.length === 0) && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                            <Layout size={32} className="opacity-10" />
                            <p className="text-xs uppercase font-bold tracking-widest opacity-20 text-center px-8">İçerik bekleniyor...</p>
                        </div>
                    )}
                </div>
            </div>
          </aside>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar-light::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CategoryBuilderView;
