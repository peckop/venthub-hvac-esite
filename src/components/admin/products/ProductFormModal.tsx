'use client';

import React, { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/i18n/I18nProvider';
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import type { DbCategory, DbProductInsert, DbProductUpdate, DbJson } from '../../../types/db-rows'
import { toast } from 'sonner'

// Form schema
const productSchema = z.object({
    name: z.string().min(3, 'İsim en az 3 karakter olmalı'),
    sku: z.string().min(3, 'SKU gereklidir'),
    brand: z.string().min(1, 'Marka seçiniz'),
    model_code: z.string().optional(),
    category_id: z.string().min(1, 'Kategori seçiniz'),
    status: z.enum(['active', 'out_of_stock', 'inactive']),
    price: z.number().min(0),
    purchase_price: z.number().optional(),
    stock_qty: z.number().min(0),
    low_stock_threshold: z.number().min(0),
    description: z.string().optional(),
    technical_specs: z.record(z.unknown()).optional()
})

type ProductFormValues = z.infer<typeof productSchema>

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

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            status: 'active',
            stock_qty: 0,
            low_stock_threshold: 5,
            price: 0
        }
    })

    const loadProduct = useCallback(async (id: string) => {
        setLoading(true)
        try {
            const { data: product, error } = await supabase.from('products').select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price').eq('id', id).single()
            if (error) throw error

            reset({
                name: product.name,
                sku: product.sku,
                brand: product.brand || '',
                model_code: product.model_code || '',
                category_id: product.category_id || '',
                status: (product.status as 'active' | 'out_of_stock' | 'inactive') || 'active',
                price: Number(product.price) || 0,
                purchase_price: Number(product.purchase_price) || 0,
                stock_qty: product.stock_qty || 0,
                low_stock_threshold: product.low_stock_threshold || 5,
                description: product.description || '',
                technical_specs: (product.technical_specs as Record<string, unknown>) || {}
            })
        } catch {
            toast.error('Ürün yüklenemedi')
        } finally {
            setLoading(false)
        }
    }, [reset])

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
                low_stock_threshold: 5,
                price: 0
            })
        }
    }, [open, _productId, reset, loadProduct])

    const onSubmit = async (values: ProductFormValues) => {
        setLoading(true)
        try {
            if (_productId) {
                const payload: DbProductUpdate = {
                    ...values,
                    technical_specs: values.technical_specs as DbJson
                }
                const { error } = await supabase.from('products').update(payload).eq('id', _productId)
                if (error) throw error
            } else {
                const payload: DbProductInsert = {
                    ...values,
                    technical_specs: values.technical_specs as DbJson
                }
                const { error } = await supabase.from('products').insert([payload])
                if (error) throw error
            }

            toast.success(_productId ? 'Ürün güncellendi' : 'Ürün oluşturuldu')
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
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-90vh overflow-y-auto bg-white rounded-2xl shadow-2xl z-modal p-6">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-bold text-industrial-gray">
                            {_productId ? t('admin.common.edit') : t('admin.common.addNewProduct')}
                        </Dialog.Title>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.products.form.name')}</label>
                                <input {...register('name')} className="w-full px-4 py-2 border rounded-lg focus-visible:outline-none" />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">SKU</label>
                                <input {...register('sku')} className="w-full px-4 py-2 border rounded-lg focus-visible:outline-none" />
                                {errors.sku && <p className="text-red-500 text-xs">{errors.sku.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.products.form.category')}</label>
                                <select {...register('category_id')} className="w-full px-4 py-2 border rounded-lg focus-visible:outline-none">
                                    <option value="">{t('admin.products.form.select')}</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.common.status')}</label>
                                <select {...register('status')} className="w-full px-4 py-2 border rounded-lg focus-visible:outline-none">
                                    <option value="active">{t('admin.common.active')}</option>
                                    <option value="out_of_stock">{t('admin.products.form.outOfStock')}</option>
                                    <option value="inactive">{t('admin.common.passive')}</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.products.form.price')}</label>
                                <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full px-4 py-2 border rounded-lg focus-visible:outline-none" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg font-bold hover:bg-slate-50 transition-colors">{t('admin.common.cancel')}</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-navy text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
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
