'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronLeft, 
  Eye,
  Layout,
  Loader2, 
  Monitor, 
  PanelRight,
  Save, 
  Smartphone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback,useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AuthorityBuilder } from '@/components/admin/authority-builder/AuthorityBuilder';
import { useConfirm } from '@/components/admin/overlay/ConfirmProvider'
import { AuthorityRenderer } from '@/components/authority/AuthorityRenderer';
import { useRole } from '@/hooks/useRole';
import { useI18n } from '@/i18n/I18nProvider';
import { mutateWithAudit } from '@/lib/admin/mutateWithAudit';
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client';
import { AuthorityBlock, SpecsBlock } from '@/types/authority';
import { CategoryMetadata, DbCategory, DbJson } from '@/types/db-rows';
import {
  adminContentMaxWidthClass,
  adminMobilePreviewClass,
  adminSidebarWidthClass,
} from '@/utils/adminUi';

const BRAND_NAME = 'VentHub';
const ENGINE_VERSION = 'v2.4';


interface CategoryBuilderViewProps {
  categoryId: string;
}

interface CategoryFormValues {
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  description: string;
  is_active: boolean;
}

const CategoryBuilderView: React.FC<CategoryBuilderViewProps> = ({ categoryId }) => {
  const router = useRouter();
  const { canWrite } = useRole();
  const { t } = useI18n();
  const confirm = useConfirm();
  const hasWriteAccess = canWrite('categories');
  const [category, setCategory] = useState<DbCategory | null>(null);
  const [blocks, setBlocks] = useState<AuthorityBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [parentIdOptions, setParentIdOptions] = useState<{ id: string, name: string }[]>([]);

  const categorySchema = React.useMemo(() => z.object({
    name: z.string().min(1, t('admin.categories.nameRequired')),
    slug: z.string().min(1, t('admin.categories.slugRequired')),
    parent_id: z.string().optional().nullable(),
    sort_order: z.number().int().optional().default(0),
    description: z.string().optional().nullable(),
    is_active: z.boolean().optional().default(true),
  }), [t]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      parent_id: null,
      sort_order: 0,
      description: '',
      is_active: true,
    }
  });

  // Fetch parent category options
  useEffect(() => {
    const fetchParents = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .is('parent_id', null)
        .neq('id', categoryId);
      
      if (data) setParentIdOptions(data);
    };
    fetchParents();
  }, [categoryId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content').eq('id', categoryId).single();
      if (error) throw error;
      const cat = data as DbCategory;
      setCategory(cat);
      
      form.reset({
        name: cat.name || '',
        slug: cat.slug || '',
        parent_id: cat.parent_id,
        sort_order: cat.sort_order || 0,
        description: cat.description || '',
        is_active: cat.is_active ?? true,
      });
      
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
              content: { title: t('admin.categories.technicalSummary'), rows } as SpecsBlock['content'],
              config: { theme: 'light', padding: 'medium' }
            } as AuthorityBlock);
          }
        }
        
        if (legacyBlocks.length > 0) {
          initialBlocks = legacyBlocks;
          toast.success(t('admin.categories.toasts.legacyMigrationSuccess'));
        }
      }

      setBlocks(initialBlocks);
    } catch (e) {
      console.error('Builder load error:', e);
      toast.error(t('admin.categories.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  }, [categoryId, t, form]);

  useEffect(() => { load(); }, [load]);

  const isFormDirty = form.formState.isDirty || JSON.stringify(blocks) !== JSON.stringify(category?.authority_content || []);
  const isSaveDisabled = !isFormDirty || saving || !hasWriteAccess;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFormDirty]);

  /**
   * Kirli-form guard'i — window.confirm yerine ConfirmDialog (cetvel §4.7).
   * Kapatma AKISI DEGISTI: eskiden confirm senkron blokluyordu; artik kapatma
   * ISTEGI once yakalanir, onay beklenir, ancak onaylanirsa gercekten kapatilir.
   * Degisiklikleri atmak GERI ALINAMAZ -> tone:'danger'.
   */
  const handleBack = async () => {
    if (!isFormDirty) {
      router.back();
      return;
    }
    const ok = await confirm({
      description: t('admin.categories.unsavedChangesConfirm'),
      confirmLabel: t('admin.confirm.discardChanges'),
      tone: 'danger',
    });
    if (ok) router.back();
  };

  const onSubmit = async (values: CategoryFormValues) => {
    if (!hasWriteAccess) {
      toast.error(t('admin.categories.toasts.noWritePermission'));
      return;
    }
    setSaving(true);
    try {
      await mutateWithAudit(supabase, {
        resource: 'categories',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: categoryId,
        before: {
          name: category?.name,
          slug: category?.slug,
          parent_id: category?.parent_id,
          sort_order: category?.sort_order,
          description: category?.description,
          is_active: category?.is_active,
          authority_content: category?.authority_content,
        },
        after: {
          name: values.name,
          slug: values.slug,
          parent_id: values.parent_id,
          sort_order: values.sort_order,
          description: values.description,
          is_active: values.is_active,
          authority_content: blocks,
        },
        auditedByEdge: false,
        fn: async () => {
          const { error } = await supabase
            .from('categories')
            .update({
              name: values.name,
              slug: values.slug,
              parent_id: values.parent_id,
              sort_order: values.sort_order,
              description: values.description,
              is_active: values.is_active,
              authority_content: blocks as DbJson,
            })
            .eq('id', categoryId);
          if (error) throw error;
        },
      });

      const updatedCategory: DbCategory = {
        ...(category as DbCategory),
        name: values.name,
        slug: values.slug,
        parent_id: values.parent_id,
        sort_order: values.sort_order,
        description: values.description,
        is_active: values.is_active,
        authority_content: blocks,
      };
      setCategory(updatedCategory);
      form.reset(values);

      toast.success(t('admin.categories.toasts.saveSuccess'));
    } catch (e) {
      console.error('Save error:', e);
      toast.error(t('admin.categories.toasts.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-400px flex flex-col items-center justify-center bg-surface-deep space-y-6">
        <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-xs font-black text-slate-500 uppercase tracking-hvac-loose animate-pulse">
          {t('admin.categories.studioInitialization')}
        </span>
      </div>
    );
  }

  return (
    /*
      Bu görünüm KENDİ tam-ekran kabuğunu kurmaz — `AdminLayout`'un içine oturur.
      Eskiden burada `h-screen` + kendi `h-16` başlığı + `overflow-hidden` vardı;
      dış kabuk zaten 100vh olduğu için toplam ~190px taşıyor ve dış `overflow-hidden`
      bunu kesiyordu (iki başlık üst üste, iki dikey scrollbar, builder'ın alt kısmı
      hiç görünmüyordu). Denetim 2026-08-15 / D1.
      Cetvel: docs/standards/admin-design-standard.md §2.1
    */
    <div className="flex flex-col bg-surface-darkest text-slate-200 font-sans">
      {/* Sayfa-içi araç çubuğu — kabuk başlığının ALTINA yapışır (§2.7) */}
      <header className="sticky top-admin-header z-raised border-b border-white/5 flex items-center justify-between px-6 py-3 bg-surface-deep">
        <div className="flex items-center gap-6">
          <button onClick={handleBack} type="button" className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                <ChevronLeft size={18} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest leading-none">
                  {t('admin.common.goBack')}
                </span>
                <span className="text-xs font-bold text-white mt-1">{category?.name}</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 bg-white/5 p-1 rounded-xl border border-white/5">
             <button 
                onClick={() => setShowPreview(!showPreview)} 
                type="button"
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${showPreview ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <Eye size={14} />
                {showPreview ? t('admin.categories.previewOn') : t('admin.categories.previewOff')}
             </button>
          </div>

          <button
            type="submit"
            form="category-builder-form"
            disabled={isSaveDisabled}
            title={!hasWriteAccess ? t('admin.categories.toasts.noWritePermission') : undefined}
            className="flex items-center gap-3 bg-white text-slate-900 hover:bg-cyan-400 hover:text-white disabled:opacity-50 px-8 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-xl transition-transform active:scale-95"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {t('admin.common.saveChanges')}
          </button>
        </div>
      </header>

      {/* İç scroll konteyneri YOK — belge kaydırır (§2.1) */}
      <div className="flex-1 flex">

        {/* --- CENTER: MAIN EDITOR (Studio Area) --- */}
        <main className="flex-1 min-w-0 bg-surface-darkest relative">
            <form id="category-builder-form" onSubmit={form.handleSubmit(onSubmit)} className={`${adminContentMaxWidthClass} mx-auto py-12 px-6`}>
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight italic">
                          {t('admin.categories.pageStudio')}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          {t('admin.categories.pageStudioDesc')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                              {t('admin.categories.liveSyncActive')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- CATEGORY BASIC INFO FORM --- */}
                <div className="bg-white/2 border border-white/5 rounded-2xl p-6 mb-8 space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                        <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">
                            {t('admin.categories.tabGeneral')}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                {t('admin.categories.formName')}
                            </label>
                            <input 
                                {...form.register('name')}
                                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600 text-white"
                                placeholder={t('admin.categories.formName') + '...'}
                            />
                            {form.formState.errors.name && (
                                <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter px-1">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                {t('admin.categories.formSlug')}
                            </label>
                            <input 
                                {...form.register('slug')}
                                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600 font-mono text-white"
                                placeholder="slug..."
                            />
                            {form.formState.errors.slug && (
                                <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter px-1">
                                    {form.formState.errors.slug.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Parent ID */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                {t('admin.categories.formParent')}
                            </label>
                            <select 
                                {...form.register('parent_id')}
                                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors appearance-none cursor-pointer text-white"
                            >
                                <option value="" className="bg-surface-deep">{t('admin.categories.parentNone')}</option>
                                {parentIdOptions.map(p => (
                                    <option key={p.id} value={p.id} className="bg-surface-deep">{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                {t('admin.categories.formSortOrder')}
                            </label>
                            <input 
                                type="number"
                                {...form.register('sort_order', { valueAsNumber: true })}
                                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors text-white"
                            />
                        </div>

                        {/* Is Active */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                {t('admin.common.status')}
                            </label>
                            <div className="flex items-center py-3 bg-white/2 px-4 rounded-xl border border-white/10">
                                <input 
                                    type="checkbox"
                                    {...form.register('is_active')}
                                    id="is_active"
                                    className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-0 cursor-pointer"
                                />
                                <label htmlFor="is_active" className="text-xs font-bold text-slate-400 ml-3 cursor-pointer select-none">
                                    {t('admin.categories.statusLabels.active')}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                            {t('admin.categories.formDescription')}
                        </label>
                        <textarea 
                            {...form.register('description')}
                            rows={3}
                            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600 resize-none text-white"
                            placeholder={t('admin.categories.formDescription') + '...'}
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <AuthorityBuilder value={blocks || []} onChange={setBlocks} />
                </div>

                {/* Bottom Guide */}
                <div className="mt-20 pt-12 border-t border-white/5 text-center">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-hvac-relaxed">
                      {BRAND_NAME} {t('admin.categories.engineTitle')} {ENGINE_VERSION}
                    </p>
                </div>
            </form>
        </main>

        {/* --- RIGHT: FLOATING PREVIEW SIDEBAR --- */}
        {showPreview && (
          <aside className={`${adminSidebarWidthClass} border-l border-white/5 flex flex-col bg-surface-deep animate-in slide-in-from-right duration-500`}>
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/2">
                <div className="flex items-center gap-2">
                    <PanelRight size={16} className="text-cyan-400" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {t('admin.categories.livePreview')}
                    </span>
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
                    ${previewMode === 'mobile' ? `${adminMobilePreviewClass} rounded-hvac-xl border-8 border-slate-800` : 'w-full h-full rounded-lg'}
                    `}
                >
                    <AuthorityRenderer content={blocks || []} />
                    {(!blocks || blocks.length === 0) && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                            <Layout size={32} className="opacity-10" />
                            <p className="text-xs uppercase font-bold tracking-widest opacity-20 text-center px-8">
                              {t('admin.categories.waitingForContent')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default CategoryBuilderView;
