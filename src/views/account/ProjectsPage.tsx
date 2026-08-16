'use client'

import { ChevronDown, ChevronRight, FolderKanban, Loader2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import VentImage from '@/components/ui/VentImage'
import { useI18n } from '@/i18n/I18nProvider'
import { resolveProductImageUrl } from '@/lib/images/productImage'
import type { Product, ProjectItem } from '@/types/ui-models'

import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useProjectLists } from '../../hooks/useProjectLists'

type LoadedItem = ProjectItem & { product: Product }

/**
 * Proje listeleri — ürün detayındaki "Projeye Ekle" modalının hesap tarafı karşılığı.
 * Veri teli ProjectProvider üzerinden (context SSOT'u ProjectContext.tsx; INV-AUTH-2 R2).
 */
export default function ProjectsPage() {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()
  const { projects, loading, addProject, removeProject, removeItemFromProject, getProjectItems } = useProjectLists()
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [items, setItems] = useState<Record<string, LoadedItem[]>>({})
  const [itemsLoading, setItemsLoading] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || creating) return
    setCreating(true)
    try {
      await addProject(newName.trim())
      setNewName('')
    } catch {
      // toast provider'da gösterildi
    } finally {
      setCreating(false)
    }
  }

  async function toggleOpen(projectId: string) {
    if (openId === projectId) {
      setOpenId(null)
      return
    }
    setOpenId(projectId)
    setItemsLoading(projectId)
    try {
      const loaded = await getProjectItems(projectId)
      setItems(prev => ({ ...prev, [projectId]: loaded as LoadedItem[] }))
    } finally {
      setItemsLoading(null)
    }
  }

  async function handleRemoveItem(projectId: string, productId: string) {
    await removeItemFromProject(projectId, productId)
    setItems(prev => ({ ...prev, [projectId]: (prev[projectId] || []).filter(i => i.product_id !== productId) }))
  }

  async function handleDeleteProject(projectId: string) {
    if (!window.confirm(t('account.projects.deleteConfirm'))) return
    await removeProject(projectId)
    if (openId === projectId) setOpenId(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-primary-navy" />
          {t('account.projects.title')}
        </h2>
        <p className="text-sm text-slate-500 mt-1">{t('account.projects.subtitle')}</p>
      </div>

      {/* Yeni proje */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t('products.addToProject.projectNamePlaceholder')}
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="shrink-0 bg-primary-navy hover:bg-secondary-blue text-white font-semibold px-5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {t('account.projects.create')}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-10 text-center">
          <div className="bg-slate-100 text-slate-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <FolderKanban size={26} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{t('account.projects.emptyTitle')}</h3>
          <p className="text-sm text-slate-500">{t('account.projects.emptyDesc')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map(p => {
            const isOpen = openId === p.id
            const projectItems = items[p.id] || []
            return (
              <li key={p.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 p-4">
                  <button
                    onClick={() => toggleOpen(p.id)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0 group"
                    aria-expanded={isOpen}
                  >
                    <span className="text-slate-400 group-hover:text-primary-navy transition-colors">
                      {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 truncate group-hover:text-primary-navy transition-colors">{p.name}</span>
                      {p.description && <span className="block text-xs text-slate-500 truncate mt-0.5">{p.description}</span>}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    aria-label={t('account.projects.deleteProject')}
                    title={t('account.projects.deleteProject')}
                    className="shrink-0 w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                    {itemsLoading === p.id ? (
                      <div className="flex items-center justify-center py-6 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : projectItems.length === 0 ? (
                      <p className="text-sm text-slate-400 italic py-2">{t('account.projects.noItems')}</p>
                    ) : (
                      <ul className="space-y-2">
                        {projectItems.map(item => (
                          <li key={item.id} className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-2.5">
                            <Link href={Routes.product(item.product.slug || '', item.product.sku)} className="shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                                <VentImage
                                  src={resolveProductImageUrl(item.product)}
                                  alt={item.product.name}
                                  width={40}
                                  height={40}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                            </Link>
                            <Link href={Routes.product(item.product.slug || '', item.product.sku)} className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-slate-800 truncate hover:text-primary-navy transition-colors">{item.product.name}</span>
                              {item.quantity != null && item.quantity > 1 && (
                                <span className="block text-xs text-slate-400">{t('account.projects.qty', { count: String(item.quantity) })}</span>
                              )}
                            </Link>
                            <button
                              onClick={() => handleRemoveItem(p.id, item.product_id)}
                              aria-label={t('account.projects.removeItem')}
                              title={t('account.projects.removeItem')}
                              className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
