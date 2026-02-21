import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Trash2, Save, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useI18n } from '../../../i18n/I18nProvider'
import { adminButtonPrimaryClass } from '../../../utils/adminUi'
import { compressImage } from '../../../utils/imageUtils'

// --- Zod Schema ---
const categorySchema = z.object({
    name: z.string().min(1, 'Kategori adı zorunludur'),
    slug: z.string().optional(),
    parent_id: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    seo_title: z.string().optional().nullable(),
    seo_desc: z.string().optional().nullable(),
    is_featured: z.boolean().default(false),
    sort_order: z.number().int().default(0),
    image_url: z.string().optional().nullable(),
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
    const { t: _t } = useI18n() // Placeholder for i18n
    const [activeTab, setActiveTab] = useState('info')
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Image state
    const [image, setImage] = useState<{ url: string; file?: File; isNew?: boolean } | null>(null)
    const [initialData, setInitialData] = useState<CategoryFormValues | null>(null)

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
            setInitialData(data)

            reset({
                name: data.name,
                slug: data.slug,
                parent_id: data.parent_id || '',
                description: data.description,
                seo_title: data.seo_title,
                seo_desc: data.seo_desc,
                is_featured: data.is_featured,
                sort_order: data.sort_order,
                image_url: data.image_url
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

            // 1. Upload Image if new
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
                // If cleared
                imgPath = null
            }

            const payload = { ...data, image_url: imgPath }
            if (payload.parent_id === '') payload.parent_id = null

            let currentId = categoryId

            if (currentId) {
                const { error } = await supabase.from('categories').update(payload).eq('id', currentId)
                if (error) throw error

                // Audit
                const { logAdminAction } = await import('../../../lib/audit')
                await logAdminAction(supabase, {
                    table_name: 'categories',
                    row_pk: currentId,
                    action: 'UPDATE',
                    before: initialData,
                    after: payload,
                    comment: 'Update category via Modal'
                })
            } else {
                const { data: newCat, error } = await supabase.from('categories').insert(payload).select('id').single()
                if (error) throw error
                currentId = newCat.id

                const { logAdminAction } = await import('../../../lib/audit')
                await logAdminAction(supabase, {
                    table_name: 'categories',
                    row_pk: currentId,
                    action: 'INSERT',
                    before: null,
                    after: payload,
                    comment: 'Create category via Modal'
                })
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

    const TabTrigger = ({ value, label }: { value: string, label: string }) => (
        <Tabs.Trigger
            value={value}
            className="px-4 py-2 text-sm font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-900 transition-colors"
        >
            {label}
        </Tabs.Trigger>
    )

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <Dialog.Content aria-describedby={undefined} className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col outline-none">

                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <Dialog.Title className="text-xl font-bold text-gray-900">
                            {categoryId ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
                        </Dialog.Title>
                        <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
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
                                    <Tabs.List className="flex border-b border-gray-200 mb-6">
                                        <TabTrigger value="info" label="Genel Bilgiler" />
                                        <TabTrigger value="image" label="Görsel" />
                                        <TabTrigger value="seo" label="SEO" />
                                    </Tabs.List>

                                    <Tabs.Content value="info" className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Ad *</label>
                                            <input {...register('name')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Slug</label>
                                            <input {...register('slug')} placeholder="Otomatik (boş bırakılabilir)" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Üst Kategori</label>
                                            <select {...register('parent_id')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                                <option value="">(Ana Kategori)</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Açıklama</label>
                                            <textarea {...register('description')} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" {...register('is_featured')} id="is_featured" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Öne Çıkan</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium text-gray-700">Sıralama:</label>
                                                <input type="number" {...register('sort_order', { valueAsNumber: true })} className="w-20 border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                    </Tabs.Content>

                                    <Tabs.Content value="image" className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer relative">
                                            <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            <Upload size={32} className="mb-2" />
                                            <p className="text-sm font-medium">Görsel Seç veya Sürükle</p>
                                        </div>
                                        {image && (
                                            <div className="relative border rounded-lg overflow-hidden w-full h-64 bg-gray-50 flex items-center justify-center">
                                                <img src={image.url} alt="Kategori" className="max-w-full max-h-full object-contain" />
                                                <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </Tabs.Content>

                                    <Tabs.Content value="seo" className="space-y-4">
                                        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-2">
                                            Bu bilgiler arama motorlarında (Google) kategori sayfasının nasıl görüneceğini belirler.
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">SEO Başlığı (Title)</label>
                                            <input {...register('seo_title')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Örn: En Kaliteli Fan Modelleri - VentHub" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">SEO Açıklaması (Description)</label>
                                            <textarea {...register('seo_desc')} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Sayfa içeriğini özetleyen kısa bir açıklama..." />
                                        </div>
                                    </Tabs.Content>
                                </Tabs.Root>
                            </form>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                        <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Vazgeç</button>
                        <button type="submit" form="category-form" disabled={loading || uploading} className={`${adminButtonPrimaryClass} flex items-center gap-2 disabled:opacity-50`}>
                            {(loading || uploading) ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Kaydet
                        </button>
                    </div>

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}



