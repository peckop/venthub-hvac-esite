import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { Loader2,Save, Trash2, Upload, X } from 'lucide-react'
import React, { useEffect,useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useI18n } from '@/i18n/I18nProvider';
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { toSupabaseJson } from '../../../lib/type-converters'
import type { Database } from '../../../types/database.types'
import type { CategoryMetadata,DbCategory } from '../../../types/db-rows'
import { adminButtonPrimaryClass } from '../../../utils/adminUi'
import { compressImage } from '../../../utils/imageUtils'
import VentImage from '../../ui/VentImage'
import { useConfirm } from '../overlay/ConfirmProvider'


type CategoryUpdate = Database['public']['Tables']['categories']['Update']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']

// --- Zod Schema ---
const categorySchema = z.object({
    name: z.string().min(1, 'Kategori adı zorunludur'),
    slug: z.string().min(1, 'Slug zorunludur'),
    parent_id: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    seo_title: z.string().optional().nullable(),
    seo_desc: z.string().optional().nullable(),
    is_featured: z.boolean().optional().default(false),
    sort_order: z.number().int().optional().default(0),
    image_url: z.string().optional().nullable(),
    metric1_value: z.string().optional().nullable(),
    metric1_label: z.string().optional().nullable(),
    metric2_value: z.string().optional().nullable(),
    metric2_label: z.string().optional().nullable(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: DbCategory | null
    onSuccess: () => void
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    open,
    onOpenChange,
    category,
    onSuccess
}) => {
    const { t } = useI18n();
    const confirm = useConfirm();
    const resolutionVal = '800x800px';
    const formatsVal = 'WebP, PNG, JPG';
    const dot = '.';
    const [loading, setLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [parentIdOptions, setParentIdOptions] = useState<{ id: string, name: string }[]>([])

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            slug: '',
            parent_id: null,
            description: '',
            seo_title: '',
            seo_desc: '',
            is_featured: false,
            sort_order: 0,
            image_url: null,
            metric1_value: '',
            metric1_label: '',
            metric2_value: '',
            metric2_label: '',
        }
    })

    // Fetch parent category options
    useEffect(() => {
        const fetchParents = async () => {
            const { data } = await supabase
                .from('categories')
                .select('id, name')
                .is('parent_id', null)
                .neq('id', category?.id || '00000000-0000-0000-0000-000000000000') // Avoid self-parenting
            
            if (data) setParentIdOptions(data)
        }
        if (open) fetchParents()
    }, [open, category])

    // Load category data when editing
    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name || '',
                slug: category.slug || '',
                parent_id: category.parent_id,
                description: category.description || '',
                seo_title: category.seo_title || '',
                seo_desc: category.seo_desc || '',
                is_featured: category.is_featured || false,
                sort_order: category.sort_order || 0,
                image_url: category.image_url,
                metric1_value: category.metadata?.metric1?.value || '',
                metric1_label: category.metadata?.metric1?.label || '',
                metric2_value: category.metadata?.metric2?.value || '',
                metric2_label: category.metadata?.metric2?.label || '',
            })
            setPreviewImage(category.image_url)
        } else {
            form.reset({
                name: '',
                slug: '',
                parent_id: null,
                description: '',
                seo_title: '',
                seo_desc: '',
                is_featured: false,
                sort_order: 0,
                image_url: null,
                metric1_value: '',
                metric1_label: '',
                metric2_value: '',
                metric2_label: '',
            })
            setPreviewImage(null)
        }
    }, [category, form])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingImage(true)
        try {
            // Compress image before upload
            const compressedFile = await compressImage(file);
            
            const fileExt = file.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `category-images/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, compressedFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            form.setValue('image_url', publicUrl)
            setPreviewImage(publicUrl)
            toast.success('Görsel yüklendi')
        } catch (error: unknown) {
            toast.error('Görsel yüklenemedi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
        } finally {
            setUploadingImage(false)
        }
    }

    const onSubmit = async (values: CategoryFormValues) => {
        setLoading(true)
        try {
            const metadata: CategoryMetadata = {
                metric1: { label: values.metric1_label || '', value: values.metric1_value || '' },
                metric2: { label: values.metric2_label || '', value: values.metric2_value || '' }
            }

            if (category) {
                // Update
                const updateData: CategoryUpdate = {
                    name: values.name,
                    slug: values.slug,
                    parent_id: values.parent_id,
                    description: values.description,
                    seo_title: values.seo_title,
                    seo_desc: values.seo_desc,
                    is_featured: values.is_featured,
                    sort_order: values.sort_order,
                    image_url: values.image_url,
                    metadata: toSupabaseJson(metadata)
                }

                const { error } = await supabase
                    .from('categories')
                    .update(updateData)
                    .eq('id', category.id)

                if (error) throw error
                toast.success('Kategori güncellendi')
            } else {
                // Insert
                const insertData: CategoryInsert = {
                    name: values.name,
                    slug: values.slug,
                    parent_id: values.parent_id,
                    description: values.description,
                    seo_title: values.seo_title,
                    seo_desc: values.seo_desc,
                    is_featured: values.is_featured,
                    sort_order: values.sort_order,
                    image_url: values.image_url,
                    metadata: toSupabaseJson(metadata),
                    authority_content: []
                }

                const { error } = await supabase
                    .from('categories')
                    .insert(insertData)

                if (error) throw error
                toast.success('Kategori oluşturuldu')
            }

            onSuccess()
            onOpenChange(false)
        } catch (error: unknown) {
            toast.error('Hata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
        } finally {
            setLoading(false)
        }
    }

  /**
   * Kirli-form guard'i — window.confirm yerine ConfirmDialog (cetvel §4.7).
   * Kapatma AKISI DEGISTI: eskiden confirm senkron blokluyordu; artik kapatma
   * ISTEGI once yakalanir, onay beklenir, ancak onaylanirsa gercekten kapatilir.
   * Degisiklikleri atmak GERI ALINAMAZ -> tone:'danger'.
   */
    const handleClose = async () => {
        if (!form.formState.isDirty) {
            onOpenChange(false)
            return
        }
        const ok = await confirm({
            description: t('admin.categories.unsavedChangesConfirm'),
            confirmLabel: t('admin.confirm.discardChanges'),
            tone: 'danger',
        })
        if (ok) onOpenChange(false)
    }

    const handleOpenChange = (openVal: boolean) => {
        if (!openVal) {
            handleClose()
        } else {
            onOpenChange(true)
        }
    }

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (form.formState.isDirty) {
                e.preventDefault()
                e.returnValue = ''
                return ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [form.formState.isDirty])

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal" />
                <Dialog.Content
                  // Radix `aria-modal` BASMIYOR (dist dogrulandi) -> elle veriliyor (cetvel §4.8).
                  aria-modal="true" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-90vh overflow-hidden bg-surface-deep border border-white/10 rounded-2xl shadow-2xl z-modal flex flex-col">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/2">
                        <div>
                            <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                                {category ? t('admin.categories.editCategory') : t('admin.categories.createNewCategory')}
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-slate-400 mt-1">
                                {t('admin.categories.modalDesc')}
                            </Dialog.Description>
                        </div>
                        <Dialog.Close className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <X size={20} />
                        </Dialog.Close>
                    </div>

                    <Tabs.Root defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                        <Tabs.List className="px-6 py-2 border-b border-white/5 flex gap-4 bg-white/1">
                            <Tabs.Trigger 
                                value="general"
                                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b-2 border-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 transition-colors"
                            >
                                {t('admin.categories.tabGeneral')}
                            </Tabs.Trigger>
                            <Tabs.Trigger 
                                value="seo"
                                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b-2 border-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 transition-colors"
                            >
                                {t('admin.categories.tabSeo')}
                            </Tabs.Trigger>
                            <Tabs.Trigger 
                                value="content"
                                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b-2 border-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 transition-colors"
                            >
                                {t('admin.categories.tabMetrics')}
                            </Tabs.Trigger>
                        </Tabs.List>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <Tabs.Content value="general" className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.formName')}</label>
                                            <input 
                                                {...form.register('name')}
                                                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600"
                                                placeholder={t('admin.categories.formName') + '...'}
                                            />
                                            {form.formState.errors.name && <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter px-1">{form.formState.errors.name.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.formSlug')}</label>
                                            <input 
                                                {...form.register('slug')}
                                                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600 font-mono"
                                                placeholder="slug..."
                                            />
                                            {form.formState.errors.slug && <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter px-1">{form.formState.errors.slug.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.formParent')}</label>
                                            <select 
                                                {...form.register('parent_id')}
                                                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-surface-deep">{t('admin.categories.parentNone')}</option>
                                                {parentIdOptions.map(p => (
                                                    <option key={p.id} value={p.id} className="bg-surface-deep">{p.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.formSortOrder')}</label>
                                            <input 
                                                type="number"
                                                {...form.register('sort_order', { valueAsNumber: true })}
                                                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.formDescription')}</label>
                                        <textarea 
                                            {...form.register('description')}
                                            rows={4}
                                            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600 resize-none"
                                            placeholder={t('admin.categories.formDescription') + '...'}
                                        />
                                    </div>
                                </Tabs.Content>

                                <Tabs.Content value="seo" className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.formSeoTitle')}</label>
                                        <input 
                                            {...form.register('seo_title')}
                                            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors"
                                            placeholder="SEO title..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.formSeoDesc')}</label>
                                        <textarea 
                                            {...form.register('seo_desc')}
                                            rows={3}
                                            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors"
                                            placeholder="SEO description..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/2 p-6 rounded-2xl border border-white/5">
                                        <input 
                                            type="checkbox"
                                            {...form.register('is_featured')}
                                            id="is_featured"
                                            className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-0"
                                        />
                                        <label htmlFor="is_featured" className="text-sm font-bold text-white cursor-pointer select-none">
                                            {t('admin.categories.formFeatured')}
                                            <span className="block text-xs font-normal text-slate-500 mt-1 uppercase tracking-tight">{t('admin.categories.formFeaturedDesc')}</span>
                                        </label>
                                    </div>
                                </Tabs.Content>

                                <Tabs.Content value="content" className="space-y-8">
                                    {/* Image Selection */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.imageLabel')}</label>
                                        <div className="flex items-start gap-8">
                                            <div className="w-48 h-48 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 overflow-hidden flex items-center justify-center relative group">
                                                {previewImage ? (
                                                    <>
                                                        <VentImage 
                                                            src={previewImage} 
                                                            alt={t('admin.categories.imagePreviewAlt')} 
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button 
                                                                type="button"
                                                                onClick={() => { setPreviewImage(null); form.setValue('image_url', '') }}
                                                                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform transform hover:scale-110 shadow-xl"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center p-6">
                                                        <Upload size={32} className="mx-auto text-slate-600 mb-2" />
                                                        <span className="text-xs font-bold text-slate-500 leading-tight">{t('admin.categories.clickToUpload')}</span>
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    disabled={uploadingImage}
                                                />
                                                {uploadingImage && (
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-2 flex flex-col items-center justify-center">
                                                        <Loader2 className="animate-spin text-cyan-400 mb-2" />
                                                        <span className="text-xs font-black text-white uppercase tracking-widest">{t('admin.categories.uploading')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    {t('admin.categories.imageDesc')} <br/>
                                                    {t('admin.categories.resolutionLabel')} <span className="text-white font-bold">{resolutionVal}</span>{dot} <br/>
                                                    {t('admin.categories.supportedFormatsLabel')} <span className="text-white font-bold">{formatsVal}</span>{dot}
                                                </p>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.common.imageUrlWithManual')}</label>
                                                    <input 
                                                        {...form.register('image_url')}
                                                        className="w-full bg-white/3 border border-white/10 rounded-xl px-3 py-2 text-xs focus-visible:outline-none focus-visible:border-cyan-500/50 font-mono"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics (Technical specs summary for cards) */}
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                                            <label className="text-xs font-black text-white uppercase tracking-widest">{t('admin.categories.quickMetrics')}</label>
                                        </div>
                                        <p className="text-xs text-slate-500 uppercase font-medium tracking-tight mt-1">{t('admin.categories.quickMetricsDesc')}</p>
                                        
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.metric1Label')}</label>
                                                    <input 
                                                        {...form.register('metric1_label')}
                                                        className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 transition-colors font-medium"
                                                        placeholder={t('admin.categories.metric1LabelPlaceholder')}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.metric1Value')}</label>
                                                    <input 
                                                        {...form.register('metric1_value')}
                                                        className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 transition-colors font-bold text-cyan-400"
                                                        placeholder={t('admin.categories.metric1ValuePlaceholder')}
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.metric2Label')}</label>
                                                    <input 
                                                        {...form.register('metric2_label')}
                                                        className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 transition-colors font-medium"
                                                        placeholder="Örn: Güç Aralığı"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('admin.categories.metric2Value')}</label>
                                                    <input 
                                                        {...form.register('metric2_value')}
                                                        className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 transition-colors font-bold text-cyan-400"
                                                        placeholder="Örn: 0.75 - 45 kW"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tabs.Content>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/10 flex items-center justify-between bg-white/2">
                            <button 
                                type="button" 
                                onClick={handleClose}
                                className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                {t('admin.categories.cancel')}
                            </button>
                            <button 
                                type="submit" 
                                form="category-form"
                                disabled={loading || uploadingImage}
                                className={`${adminButtonPrimaryClass} flex items-center gap-2 group`}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <Save size={16} className="group-hover:-translate-y-px transition-transform" />
                                )}
                                {category ? t('admin.categories.updateCategory') : t('admin.categories.createCategory')}
                            </button>
                        </div>
                    </Tabs.Root>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default CategoryFormModal;
