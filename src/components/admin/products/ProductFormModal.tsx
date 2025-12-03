import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Trash2, Plus, Save, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useI18n } from '../../../i18n/I18nProvider'
import { adminButtonPrimaryClass } from '../../../utils/adminUi'

// --- Zod Schema ---
const productSchema = z.object({
    name: z.string().min(1, 'Ürün adı zorunludur'),
    sku: z.string().min(1, 'SKU zorunludur'),
    brand: z.string().optional(),
    model_code: z.string().optional(),
    category_id: z.string().optional(),
    status: z.enum(['active', 'inactive', 'out_of_stock']).default('active'),
    price: z.number().min(0).optional().nullable(),
    purchase_price: z.number().min(0).optional().nullable(),
    stock_qty: z.number().int().min(0).optional().nullable(),
    low_stock_threshold: z.number().int().min(0).optional().nullable(),
    description: z.string().optional().nullable(),
    slug: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    is_featured: z.boolean().default(false),
    technical_specs: z.record(z.string(), z.any()).default({}),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    productId?: string | null
    onSuccess: () => void
    categories: { id: string; name: string }[]
}

// --- Image Compression Helper ---
const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 1200
                const scaleSize = MAX_WIDTH / img.width
                const newWidth = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width
                const newHeight = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height
                canvas.width = newWidth
                canvas.height = newHeight
                const ctx = canvas.getContext('2d')
                if (!ctx) { reject(new Error("Canvas context failed")); return }
                ctx.drawImage(img, 0, 0, newWidth, newHeight)
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob)
                    else reject(new Error("Compression failed"))
                }, 'image/webp', 0.8)
            }
        }
        reader.onerror = (error) => reject(error)
    })
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ open, onOpenChange, productId, onSuccess, categories }) => {
    const { t: _t } = useI18n()
    const [activeTab, setActiveTab] = useState('info')
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Images state (separate from form for easier handling)
    const [images, setImages] = useState<{ id?: string; path?: string; url: string; file?: File; isNew?: boolean }[]>([])

    // Technical Specs State (Key-Value pairs for UI)
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])
    const [initialData, setInitialData] = useState<ProductFormValues | null>(null)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            status: 'active',
            is_featured: false,
            technical_specs: {}
        }
    })

    const loadProduct = React.useCallback(async (id: string) => {
        setLoading(true)
        try {
            // Fetch product
            const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()
            if (error) throw error
            setInitialData(product)

            // Fetch images
            const { data: imgs, error: imgError } = await supabase
                .from('product_images')
                .select('*')
                .eq('product_id', id)
                .order('sort_order')

            if (imgError) throw imgError

            // Set Form
            reset({
                name: product.name,
                sku: product.sku,
                brand: product.brand || '',
                model_code: product.model_code || '',
                category_id: product.category_id || '',
                status: product.status || 'active',
                price: product.price,
                purchase_price: product.purchase_price,
                stock_qty: product.stock_qty,
                low_stock_threshold: product.low_stock_threshold,
                description: product.description,
                slug: product.slug,
                meta_title: product.meta_title,
                meta_description: product.meta_description,
                is_featured: product.is_featured,
                technical_specs: product.technical_specs || {}
            })

            // Set Images
            const loadedImages = (imgs || []).map(img => ({
                id: img.id,
                path: img.path,
                url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${img.path}`,
                isNew: false
            }))
            setImages(loadedImages)

            // Set Specs
            const loadedSpecs = Object.entries(product.technical_specs || {}).map(([key, value]) => ({
                key,
                value: String(value)
            }))
            setSpecs(loadedSpecs)

        } catch (e) {
            console.error('Error loading product:', e)
            alert('Ürün yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }, [reset])

    // Load Data
    useEffect(() => {
        if (open && productId) {
            loadProduct(productId)
        } else if (open && !productId) {
            reset({ status: 'active', is_featured: false, technical_specs: {} })
            setImages([])
            setSpecs([])
            setInitialData(null)
            setActiveTab('info')
        }
    }, [open, productId, loadProduct, reset])

    // --- Handlers ---

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const newImages = files.map(file => ({
                url: URL.createObjectURL(file),
                file,
                isNew: true
            }))
            setImages(prev => [...prev, ...newImages])
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
        const newSpecs = [...specs]
        newSpecs[index][field] = val
        setSpecs(newSpecs)
    }

    const addSpec = () => setSpecs([...specs, { key: '', value: '' }])
    const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index))

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true)
        try {
            // 1. Prepare Specs JSON
            const specsJson = specs.reduce((acc, curr) => {
                if (curr.key.trim()) acc[curr.key.trim()] = curr.value
                return acc
            }, {} as Record<string, string>)

            data.technical_specs = specsJson

            let currentProductId = productId

            // 2. Insert/Update Product
            if (currentProductId) {
                const { error } = await supabase.from('products').update(data).eq('id', currentProductId)
                if (error) throw error

                // Audit Log
                const { logAdminAction } = await import('../../../lib/audit')
                await logAdminAction(supabase, {
                    table_name: 'products',
                    row_pk: currentProductId,
                    action: 'UPDATE',
                    before: initialData,
                    after: data,
                    comment: 'Updated via Modal'
                })

            } else {
                const { data: newProd, error } = await supabase.from('products').insert(data).select('id').single()
                if (error) throw error
                currentProductId = newProd.id

                // Audit Log
                const { logAdminAction } = await import('../../../lib/audit')
                await logAdminAction(supabase, {
                    table_name: 'products',
                    row_pk: currentProductId,
                    action: 'INSERT',
                    before: null,
                    after: data,
                    comment: 'Created via Modal'
                })
            }

            // 3. Handle Images
            if (images.some(img => img.isNew) || images.length < (await fetchExistingImageCount(currentProductId))) {
                await processImages(currentProductId, data.name)
            }

            onSuccess()
            onOpenChange(false)

        } catch (e: unknown) {
            console.error('Save error:', e)
            alert(`Kaydetme hatası: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}`)
        } finally {
            setLoading(false)
        }
    }

    const fetchExistingImageCount = async (pid: string) => {
        const { count } = await supabase.from('product_images').select('*', { count: 'exact', head: true }).eq('product_id', pid)
        return count || 0
    }

    const processImages = async (pid: string, productName: string) => {
        setUploading(true)
        try {
            // 1. Delete removed images from DB (and storage if possible)
            // For simplicity in this hybrid approach, we'll just sync the list.
            // Actually, a better way is to delete all and re-insert or diff.
            // Let's do a diff based on ID.

            const { data: existingImgs } = await supabase.from('product_images').select('id, path').eq('product_id', pid)
            const keptIds = images.filter(i => !i.isNew && i.id).map(i => i.id)
            const toDelete = existingImgs?.filter(ei => !keptIds.includes(ei.id)) || []

            for (const del of toDelete) {
                await supabase.from('product_images').delete().eq('id', del.id)
                await supabase.storage.from('product-images').remove([del.path])
            }

            // 2. Upload New Images
            let sortOrder = 0
            for (const img of images) {
                sortOrder++
                if (img.isNew && img.file) {
                    // Compress
                    const compressedBlob = await compressImage(img.file)
                    const ext = 'webp'
                    const filename = `prod_${pid}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
                    const path = `product/${pid}/${filename}`

                    // Upload
                    const { error: upErr } = await supabase.storage.from('product-images').upload(path, compressedBlob, { contentType: 'image/webp' })
                    if (upErr) throw upErr

                    // Insert DB
                    await supabase.from('product_images').insert({
                        product_id: pid,
                        path: path,
                        sort_order: sortOrder,
                        alt: productName
                    })
                } else if (img.id) {
                    // Update sort order for existing
                    await supabase.from('product_images').update({ sort_order: sortOrder }).eq('id', img.id)
                }
            }

        } catch (e) {
            console.error('Image process error:', e)
            throw e
        } finally {
            setUploading(false)
        }
    }

    // --- UI Components ---
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
                <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col outline-none">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <Dialog.Title className="text-xl font-bold text-gray-900">
                            {productId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                        </Dialog.Title>
                        <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </Dialog.Close>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                        ) : (
                            <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
                                <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                                    <Tabs.List className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                                        <TabTrigger value="info" label="Genel Bilgiler" />
                                        <TabTrigger value="pricing" label="Fiyat & Stok" />
                                        <TabTrigger value="images" label="Görseller" />
                                        <TabTrigger value="specs" label="Teknik Özellikler" />
                                        <TabTrigger value="seo" label="SEO" />
                                    </Tabs.List>

                                    {/* INFO TAB */}
                                    <Tabs.Content value="info" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Ürün Adı *</label>
                                                <input {...register('name')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">SKU (Stok Kodu) *</label>
                                                <input {...register('sku')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                                {errors.sku && <span className="text-xs text-red-500">{errors.sku.message}</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Marka</label>
                                                <input {...register('brand')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Model Kodu</label>
                                                <input {...register('model_code')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Kategori</label>
                                                <select {...register('category_id')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                                    <option value="">Seçiniz</option>
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Durum</label>
                                                <select {...register('status')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                                    <option value="active">Aktif</option>
                                                    <option value="inactive">Pasif</option>
                                                    <option value="out_of_stock">Stok Yok</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Açıklama</label>
                                            <textarea {...register('description')} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" {...register('is_featured')} id="is_featured" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Öne Çıkan Ürün</label>
                                        </div>
                                    </Tabs.Content>

                                    {/* PRICING TAB */}
                                    <Tabs.Content value="pricing" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Satış Fiyatı (TL)</label>
                                                <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Alış Fiyatı (TL)</label>
                                                <input type="number" step="0.01" {...register('purchase_price', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Stok Adedi</label>
                                                <input type="number" {...register('stock_qty', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Kritik Stok Seviyesi</label>
                                                <input type="number" {...register('low_stock_threshold', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                    </Tabs.Content>

                                    {/* IMAGES TAB */}
                                    <Tabs.Content value="images" className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer relative">
                                            <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            <Upload size={32} className="mb-2" />
                                            <p className="text-sm font-medium">Resimleri buraya sürükleyin veya seçin</p>
                                            <p className="text-xs text-gray-400 mt-1">Otomatik WebP sıkıştırma uygulanır</p>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 mt-4">
                                            {images.map((img, idx) => (
                                                <div key={idx} className="relative group border rounded-lg overflow-hidden aspect-square bg-gray-50">
                                                    <img src={img.url} alt="Product" className="w-full h-full object-contain" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    {idx === 0 && (
                                                        <div className="absolute bottom-0 inset-x-0 bg-blue-600 text-white text-[10px] py-1 text-center">
                                                            Kapak Görseli
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Tabs.Content>

                                    {/* SPECS TAB */}
                                    <Tabs.Content value="specs" className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-sm font-medium text-gray-700">Teknik Özellikler (JSON)</h3>
                                            <button type="button" onClick={addSpec} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
                                                <Plus size={16} /> Özellik Ekle
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {specs.map((spec, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <input
                                                        placeholder="Özellik Adı (örn. Güç)"
                                                        value={spec.key}
                                                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                                                        className="flex-1 border rounded px-3 py-2 text-sm"
                                                    />
                                                    <input
                                                        placeholder="Değer (örn. 5kW)"
                                                        value={spec.value}
                                                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                                                        className="flex-1 border rounded px-3 py-2 text-sm"
                                                    />
                                                    <button type="button" onClick={() => removeSpec(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            {specs.length === 0 && (
                                                <div className="text-center py-8 text-gray-400 text-sm border rounded-lg border-dashed">
                                                    Henüz teknik özellik eklenmemiş.
                                                </div>
                                            )}
                                        </div>
                                    </Tabs.Content>

                                    {/* SEO TAB */}
                                    <Tabs.Content value="seo" className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">SEO URL (Slug)</label>
                                            <input {...register('slug')} placeholder="Otomatik oluşturulur" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Meta Başlık</label>
                                            <input {...register('meta_title')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Meta Açıklama</label>
                                            <textarea {...register('meta_description')} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                        </div>
                                    </Tabs.Content>
                                </Tabs.Root>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            form="product-form"
                            disabled={loading || uploading}
                            className={`${adminButtonPrimaryClass} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {(loading || uploading) ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {productId ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
                        </button>
                    </div>

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
