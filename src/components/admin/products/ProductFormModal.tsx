'use client';

import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, Save,X } from 'lucide-react'
import React, { useCallback,useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { useI18n } from '@/i18n/I18nProvider';
import { VARIANT_DETAIL_COLUMNS } from '@/lib/services/product.columns'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import type { DbCategory, DbJson,DbProductInsert, DbProductUpdate } from '../../../types/db-rows'

// Form schema
const getProductSchema = (t: (key: string) => string) => z.object({
    name: z.string().min(3, t('admin.products.errors.nameMin')),
    sku: z.string().min(3, t('admin.products.errors.skuRequired')),
    brand: z.string().min(1, t('admin.products.errors.brandRequired')),
    model_code: z.string().optional(),
    category_id: z.string().min(1, t('admin.products.errors.categoryRequired')),
    status: z.enum(['active', 'out_of_stock', 'inactive']),
    // W4b: `price` alanı BİLİNÇLİ olarak yok. Satış fiyatını artık fiyat motoru üretiyor
    // (/admin/pricing → marj kuralı → product_prices cache). Buraya elle yazılan bir sayıyı
    // vitrin OKUMUYOR; formda tutmak "fiyatı değiştirdim ama değişmedi" tuzağı olurdu.
    purchase_price: z.number().optional(),
    stock_qty: z.number().min(0),
    low_stock_threshold: z.number().min(0),
    description: z.string().optional(),
    technical_specs: z.record(z.unknown()).optional()
})

type ProductFormValues = z.infer<ReturnType<typeof getProductSchema>>

interface ProductFormModalProps {
    _productId?: string | null
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ _productId, open, onClose, onSuccess }) => {
    const { t } = useI18n();
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<DbCategory[]>([])
    // D4: legacy description kolonu DROP edildi; form TR açıklamayı düzenler,
    // mevcut EN çevirisi (varsa) kaybolmasın diye yüklenen JSONB burada tutulur.
    const [descriptionI18n, setDescriptionI18n] = useState<{ tr?: string | null; en?: string | null }>({})

    const productSchema = React.useMemo(() => getProductSchema(t), [t])

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            status: 'active',
            stock_qty: 0,
            low_stock_threshold: 5
        }
    })

    const loadProduct = useCallback(async (id: string) => {
        setLoading(true)
        try {
            const { data: product, error } = await supabase.from('products').select(VARIANT_DETAIL_COLUMNS).eq('id', id).single()
            if (error) throw error

            reset({
                name: product.name,
                sku: product.sku,
                brand: product.brand || '',
                model_code: product.model_code || '',
                category_id: product.category_id || '',
                status: (product.status as 'active' | 'out_of_stock' | 'inactive') || 'active',
                purchase_price: Number(product.purchase_price) || 0,
                stock_qty: product.stock_qty || 0,
                low_stock_threshold: product.low_stock_threshold || 5,
                description: (() => {
                    // Ham sorgu satırında description_i18n jenerik Json tipindedir — runtime daralt.
                    const raw = product.description_i18n
                    const obj = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
                    return typeof obj.tr === 'string' ? obj.tr : ''
                })(),
                technical_specs: (product.technical_specs as Record<string, unknown>) || {}
            })
            {
                const raw = product.description_i18n
                const obj = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
                setDescriptionI18n({
                    tr: typeof obj.tr === 'string' ? obj.tr : null,
                    en: typeof obj.en === 'string' ? obj.en : null,
                })
            }
        } catch {
            toast.error(t('admin.products.errors.loadFailed'))
        } finally {
            setLoading(false)
        }
    }, [reset, t])

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content').order('name').returns<DbCategory[]>()
            setCategories(data || [])
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        if (open && _productId) {
            loadProduct(_productId)
        } else if (open && !_productId) {
            reset({
                status: 'active',
                stock_qty: 0,
                low_stock_threshold: 5
            })
            // Modal parent'ta kosulsuz render edilir (unmount olmaz) — onceki
            // urunun EN cevirisi state'te kalip yeni urune sizmasin.
            setDescriptionI18n({})
        }
    }, [open, _productId, reset, loadProduct])

    const onSubmit = async (values: ProductFormValues) => {
        setLoading(true)
        try {
            // D4: legacy description kolonu yok — form değeri description_i18n.tr'ye
            // yazılır, mevcut EN çevirisi korunur.
            const { description, ...rest } = values
            const description_i18n = { ...descriptionI18n, tr: description ?? '' } as DbJson

            if (_productId) {
                const payload: DbProductUpdate = {
                    ...rest,
                    description_i18n,
                    technical_specs: values.technical_specs as DbJson
                }
                const { error } = await supabase.from('products').update(payload).eq('id', _productId)
                if (error) throw error
            } else {
                const payload: DbProductInsert = {
                    ...rest,
                    description_i18n,
                    technical_specs: values.technical_specs as DbJson
                }
                const { error } = await supabase.from('products').insert([payload])
                if (error) throw error
            }

            toast.success(_productId ? t('admin.products.toasts.updateSuccess') : t('admin.products.toasts.createSuccess'))
            onSuccess()
            onClose()
        } catch {
            toast.error(t('admin.common.error'))
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-modal" />
                <Dialog.Content
                  // Radix `aria-modal` BASMIYOR (dist dogrulandi) -> elle veriliyor (cetvel §4.8).
                  aria-modal="true" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-90vh overflow-y-auto bg-admin-surface rounded-admin-lg shadow-admin-lg z-modal p-6">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-bold text-industrial-gray">
                            {_productId ? t('admin.common.edit') : t('admin.common.addNewProduct')}
                        </Dialog.Title>
                        <button onClick={onClose} className="p-2 hover:bg-admin-surface-2 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-admin-fg-muted">{t('admin.products.form.name')}</label>
                                <input {...register('name')} className="w-full px-4 py-2 border rounded-admin-md focus-visible:outline-none" />
                                {errors.name && <p className="text-admin-danger text-xs">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-admin-fg-muted">{t('admin.products.form.sku')}</label>
                                <input {...register('sku')} className="w-full px-4 py-2 border rounded-admin-md focus-visible:outline-none" />
                                {errors.sku && <p className="text-admin-danger text-xs">{errors.sku.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Faz 5 bulgusu: şema brand'i zorunlu istiyordu ama formda alan YOKTU ve
                                hata hiçbir yerde gösterilmiyordu — yeni ürün kaydı sessizce hiç
                                çalışmıyordu. Alan + hata metni eklendi. */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-admin-fg-muted">{t('admin.products.form.brand')}</label>
                                <input {...register('brand')} className="w-full px-4 py-2 border rounded-admin-md focus-visible:outline-none" />
                                {errors.brand && <p className="text-admin-danger text-xs">{errors.brand.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-admin-fg-muted">{t('admin.products.form.category')}</label>
                                <select {...register('category_id')} className="w-full px-4 py-2 border rounded-admin-md focus-visible:outline-none">
                                    <option value="">{t('admin.products.form.select')}</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.category_id && <p className="text-admin-danger text-xs">{errors.category_id.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-admin-fg-muted">{t('admin.common.status')}</label>
                                <select {...register('status')} className="w-full px-4 py-2 border rounded-admin-md focus-visible:outline-none">
                                    <option value="active">{t('admin.common.active')}</option>
                                    <option value="out_of_stock">{t('admin.products.form.outOfStock')}</option>
                                    <option value="inactive">{t('admin.common.passive')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-admin-md font-bold hover:bg-admin-surface-2 transition-colors">{t('admin.common.cancel')}</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-admin-accent text-admin-accent-fg rounded-admin-md font-bold flex items-center gap-2 hover:bg-admin-accent transition-colors">
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {t('admin.common.save')}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default ProductFormModal
