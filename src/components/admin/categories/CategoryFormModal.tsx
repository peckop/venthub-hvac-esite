import { VentImage } from '@/components/ui/VentImage'
import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Trash2, Save, Loader2, Layout } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { Database } from '../../../types/database.types'
import type { DbCategory, CategoryMetadata } from '../../../types/db-rows'
import type { AuthorityContent } from '../../../types/authority'
import { AuthorityBuilder } from '../authority-builder/AuthorityBuilder'
type CategoryUpdate = Database['public']['Tables']['categories']['Update']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
import { useI18n } from '../../../i18n/I18nProvider'
import { adminButtonPrimaryClass } from '../../../utils/adminUi'
import { compressImage } from '../../../utils/imageUtils'

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
    categoryId?: string | null
    onSuccess: () => void
    categories: { id: string; name: string }[]
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ open, onOpenChange, categoryId, onSuccess, categories }) => {
    const { t: _t } = useI18n()
    const [activeTab, setActiveTab] = useState('info')
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [authorityContent, setAuthorityContent] = useState<AuthorityContent | null>(null)
    const [image, setImage] = useState<{ url: string; file?: File; isNew?: boolean } | null>(null)
    const [initialData, setInitialData] = useState<DbCategory | null>(null)

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            is_featured: false,
            sort_order: 0
        }
    })

    const loadCategory = React.useCallback(async (id: string) => {
        setLoading(true)
        try {
            const { data, error } = await supabase.from('categories').select('*').eq('id', id).single()
            if (error) throw error
            const cat = data as unknown as DbCategory
            setInitialData(cat)

            const metadata = cat.metadata as unknown as CategoryMetadata | null
            setAuthorityContent(cat.authority_content as unknown as AuthorityContent)

            reset({
                name: cat.name,
                slug: cat.slug,
                parent_id: cat.parent_id || '',
                description: cat.description,
                seo_title: cat.seo_title,
                seo_desc: cat.seo_desc,
                is_featured: cat.is_featured ?? false,
                sort_order: cat.sort_order ?? 0,
                image_url: cat.image_url,
                metric1_value: ((metadata?.metric1 as unknown as Record<string, string>)?.value) || '',
                metric1_label: ((metadata?.metric1 as unknown as Record<string, string>)?.label) || '',
                metric2_value: ((metadata?.metric2 as unknown as Record<string, string>)?.value) || '',
                metric2_label: ((metadata?.metric2 as unknown as Record<string, string>)?.label) || ''
            })

            if (data.image_url) {
                setImage({
                    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${data.image_url}`,
                    isNew: false
                })
            } else {
                setImage(null)
            }

        } catch (e) {
            console.error('Category load error:', e)
            alert('Kategori yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }, [reset])

    useEffect(() => {
        if (open && categoryId) {
            loadCategory(categoryId)
        } else if (open && !categoryId) {
            reset({ is_featured: false, sort_order: 0 })
            setImage(null)
            setInitialData(null)
            setAuthorityContent(null)
            setActiveTab('info')
        }
    }, [open, categoryId, loadCategory, reset])

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImage({
                url: URL.createObjectURL(file),
                file,
                isNew: true
            })
        }
    }

    const removeImage = () => {
        setImage(null)
        setValue('image_url', null)
    }

    const onSubmit = async (data: CategoryFormValues) => {
        setLoading(true)
        try {
            let imgPath = data.image_url

            if (image?.isNew && image.file) {
                setUploading(true)
                try {
                    const compressedBlob = await compressImage(image.file)
                    const ext = 'webp'
                    const filename = `cat_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
                    const path = `${filename}`
                    const { error: upErr } = await supabase.storage.from('category-images').upload(path, compressedBlob, { contentType: 'image/webp' })
                    if (upErr) throw upErr
                    imgPath = path
                } finally {
                    setUploading(false)
                }
            } else if (!image) {
                imgPath = null
            }

            const metadata: CategoryMetadata = {
                ...(initialData?.metadata as unknown as Record<string, unknown> || {}),
                metric1: { value: data.metric1_value || '', label: data.metric1_label || '' },
                metric2: { value: data.metric2_value || '', label: data.metric2_label || '' }
            } as unknown as CategoryMetadata

            const payload: Partial<DbCategory> & { authority_content?: AuthorityContent | null } = {
                name: data.name,
                slug: data.slug,
                parent_id: data.parent_id === '' ? null : data.parent_id,
                description: data.description,
                seo_title: data.seo_title,
                seo_desc: data.seo_desc,
                is_featured: data.is_featured,
                sort_order: data.sort_order,
                image_url: imgPath,
                metadata: metadata as unknown as CategoryMetadata,
                authority_content: authorityContent
            }

            let currentId = categoryId

            if (currentId) {
                const updateData: CategoryUpdate = Object.fromEntries(
                    Object.entries(payload).filter(([_, v]) => v !== undefined)
                ) as CategoryUpdate
                const { error } = await supabase.from('categories').update(updateData).eq('id', currentId)
                if (error) throw error
            } else {
                const insertData: CategoryInsert = Object.fromEntries(
                    Object.entries(payload).filter(([_, v]) => v !== undefined)
                ) as CategoryInsert
                const { data: newCat, error } = await supabase.from('categories').insert(insertData).select('id').single()
                if (error) throw error
                currentId = newCat.id
            }

            onSuccess()
            onOpenChange(false)

        } catch (e) {
            console.error('Save error:', e)
            alert('Kaydetme başarısız: ' + (e as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const TabTrigger = ({ value, label, icon: Icon }: { value: string, label: string, icon?: React.ElementType }) => (
        <Tabs.Trigger
            value={value}
            className="px-6 py-3 text-sm font-bold text-slate-500 border-b-2 border-transparent data-[state=active]:border-primary-navy data-[state=active]:text-primary-navy hover:text-slate-900 transition-all uppercase tracking-tight flex items-center gap-2"
        >
            {Icon && <Icon size={14} />}
            {label}
        </Tabs.Trigger>
    )

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 animate-in fade-in duration-300" />
                <Dialog.Content aria-describedby={undefined} className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-[70] flex flex-col outline-none overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">

                    <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                        <Dialog.Title className="text-xl font-bold text-primary-navy">
                            {categoryId ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
                        </Dialog.Title>
                        <Dialog.Close
                            className="p-2 hover:bg-white hover:shadow-sm rounded-full text-slate-400 hover:text-primary-navy transition-all"
                        >
                            <X size={20} />
                        </Dialog.Close>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading && !uploading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                        ) : (
                            <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
                                <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                                    <Tabs.List className="flex border-b border-gray-200 mb-6 sticky top-0 bg-white z-10 overflow-x-auto">
                                        <TabTrigger value="info" label="Genel Bilgiler" />
                                        <TabTrigger value="builder" label="Page Builder" icon={Layout} />
                                        <TabTrigger value="image" label="Görsel" />
                                        <TabTrigger value="seo" label="SEO" />
                                        <TabTrigger value="metrics" label="3D Metrikleri" />
                                    </Tabs.List>

                                    <Tabs.Content value="info" className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Ad *</label>
                                            <input {...register('name')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all font-semibold text-slate-900" />
                                            {errors.name && <span className="text-xs text-rose-500 font-bold">{errors.name.message}</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Slug</label>
                                            <input {...register('slug')} placeholder="Otomatik" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Üst Kategori</label>
                                            <select {...register('parent_id')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all appearance-none cursor-pointer font-medium text-slate-700">
                                                <option value="">(Ana Kategori)</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Açıklama</label>
                                            <textarea {...register('description')} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all resize-none" />
                                        </div>
                                        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" {...register('is_featured')} id="is_featured" className="w-4 h-4 rounded border-slate-300 text-primary-navy focus:ring-primary-navy/20" />
                                                <label htmlFor="is_featured" className="text-sm font-bold text-slate-700 uppercase tracking-tight cursor-pointer">Öne Çıkan</label>
                                            </div>
                                            <div className="flex items-center gap-3 ml-auto">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-tight">Sıralama:</label>
                                                <input type="number" {...register('sort_order', { valueAsNumber: true })} className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all font-bold text-center" />
                                            </div>
                                        </div>
                                    </Tabs.Content>

                                    <Tabs.Content value="builder" className="space-y-4 min-h-[400px]">
                                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs text-indigo-700 flex items-start gap-3 mb-4">
                                            <Layout size={16} className="shrink-0 mt-0.5" />
                                            <p className="font-medium leading-relaxed">Page Builder ile dinamik bloklar ekleyebilirsiniz. Bu içerikler ürün listesinin üzerinde görünecektir.</p>
                                        </div>
                                        <AuthorityBuilder value={authorityContent} onChange={setAuthorityContent} />
                                    </Tabs.Content>

                                    <Tabs.Content value="image" className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer relative">
                                            <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            <Upload size={32} className="mb-2" />
                                            <p className="text-sm font-medium">Görsel Seç veya Sürükle</p>
                                        </div>
                                        {image && (
                                            <div className="relative border rounded-lg overflow-hidden w-full h-64 bg-gray-50 flex items-center justify-center">
                                                <VentImage src={image.url} alt="Kategori" className="max-w-full max-h-full object-contain"  />
                                                <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                    </Tabs.Content>

                                    <Tabs.Content value="seo" className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">SEO Başlığı</label>
                                            <input {...register('seo_title')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">SEO Açıklaması</label>
                                            <textarea {...register('seo_desc')} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                        </div>
                                    </Tabs.Content>

                                    <Tabs.Content value="metrics" className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Metrik 1 Değer</label>
                                                <input {...register('metric1_value')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Metrik 1 Etiket</label>
                                                <input {...register('metric1_label')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Metrik 2 Değer</label>
                                                <input {...register('metric2_value')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Metrik 2 Etiket</label>
                                                <input {...register('metric2_label')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                            </div>
                                        </div>
                                    </Tabs.Content>
                                </Tabs.Root>
                            </form>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80 backdrop-blur-sm">
                        <button type="button" onClick={() => onOpenChange(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">Vazgeç</button>
                        <button type="submit" form="category-form" disabled={loading || uploading} className={`${adminButtonPrimaryClass} flex items-center gap-2 px-8 py-2.5 rounded-xl shadow-lg shadow-primary-navy/10 transition-transform active:scale-95 disabled:opacity-50`}>
                            {(loading || uploading) ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Kaydet
                        </button>
                    </div>

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
