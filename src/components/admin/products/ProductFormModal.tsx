'use client';

import React, { useState, useEffect, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '../../../lib/supabase'
import type { DbCategory } from '../../../types/db-rows'
import toast from 'react-hot-toast'

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
    technical_specs: z.record(z.any()).optional()
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormModalProps {
    _productId?: string | null
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ _productId, open, onClose, onSuccess }) => {
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
            const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()
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
            const { data } = await supabase.from('categories').select('*').order('name')
            setCategories((data as unknown as DbCategory[]) || [])
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
                const { error } = await supabase.from('products').update(values).eq('id', _productId)
                if (error) throw error
            } else {
                const { error } = await supabase.from('products').insert([values])
                if (error) throw error
            }

            toast.success(_productId ? 'Ürün güncellendi' : 'Ürün oluşturuldu')
            onSuccess()
            onClose()
        } catch {
            toast.error('İşlem başarısız')
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-[1001] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-bold text-industrial-gray">
                            {_productId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                        </Dialog.Title>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Ürün Adı</label>
                                <input {...register('name')} className="w-full px-4 py-2 border rounded-lg" />
                                {errors.name && <p className="text-red-500 text-[10px]">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">SKU</label>
                                <input {...register('sku')} className="w-full px-4 py-2 border rounded-lg" />
                                {errors.sku && <p className="text-red-500 text-[10px]">{errors.sku.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                                <select {...register('category_id')} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="">Seçiniz</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Durum</label>
                                <select {...register('status')} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="active">Aktif</option>
                                    <option value="out_of_stock">Stok Yok</option>
                                    <option value="inactive">Pasif</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Fiyat</label>
                                <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg font-bold">Vazgeç</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-navy text-white rounded-lg font-bold flex items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Kaydet
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default ProductFormModal
