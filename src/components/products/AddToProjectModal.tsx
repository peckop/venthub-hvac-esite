'use client'

import { VentImage } from '@/components/ui/VentImage'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, FolderPlus, ChevronRight, Loader2 } from 'lucide-react'
import { useProjectLists } from '../../hooks/useProjectLists'
import type { Product } from '../../lib/supabase'

interface AddToProjectModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export const AddToProjectModal: React.FC<AddToProjectModalProps> = ({ product, isOpen, onClose }) => {
  const { projects, addProject, addItemToProject } = useProjectLists()
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleCreateAndAdd = async () => {
    if (!newProjectName.trim()) return
    setIsAdding(true)
    try {
      const project = await addProject(newProjectName)
      await addItemToProject(project.id, product.id)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleAddToExisting = async (projectId: string) => {
    setSelectedProjectId(projectId)
    setIsAdding(true)
    try {
      await addItemToProject(projectId, product.id)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsAdding(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-project-title"
    >
      <motion.button
        type="button"
        aria-label="Modalı kapat"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-slate-900/60 backdrop-blur-sm cursor-default border-none outline-none"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-light-gray flex items-center justify-between bg-primary-navy text-white">
          <h3 id="add-to-project-title" className="font-bold text-lg">Proje Listesine Ekle</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-light-gray rounded-lg flex-shrink-0 overflow-hidden border border-light-gray">
              <VentImage src={product.image_url || '/images/vortice_lineo_futuristic.png'} 
                alt={product.name} 
                className="w-full h-full object-contain p-1"
               />
            </div>
            <div>
              <div className="text-[10px] font-bold text-secondary-blue uppercase tracking-wider">{product.brand}</div>
              <h4 className="text-sm font-bold text-industrial-gray line-clamp-2 leading-tight">{product.name}</h4>
            </div>
          </div>

          {/* List existing projects */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-steel-gray uppercase tracking-widest">Mevcut Projelerim</label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-light-gray">
              {projects.length === 0 ? (
                <div className="text-sm text-steel-gray italic py-4 text-center border border-dashed border-light-gray rounded-xl">
                  Henüz bir projeniz bulunmuyor.
                </div>
              ) : (
                projects.map(project => (
                  <button
                    key={project.id}
                    disabled={isAdding}
                    onClick={() => handleAddToExisting(project.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-light-gray hover:border-primary-navy hover:bg-air-blue group transition-all"
                  >
                    <span className="text-sm font-semibold text-industrial-gray group-hover:text-primary-navy">
                      {project.name}
                    </span>
                    {selectedProjectId === project.id && isAdding ? (
                      <Loader2 size={16} className="animate-spin text-primary-navy" />
                    ) : (
                      <ChevronRight size={16} className="text-steel-gray group-hover:text-primary-navy transition-transform group-hover:translate-x-0.5" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Create new project toggle */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-light-gray text-industrial-gray hover:bg-secondary-blue hover:text-white transition-all font-bold text-sm"
            >
              <Plus size={18} />
              <span>Yeni Proje Oluştur</span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-2"
            >
              <div className="relative">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Proje Adı (Örn: Hilton Otel Renovasyonu)"
                  className="w-full px-4 py-3 rounded-xl border border-light-gray focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/10 outline-none text-sm transition-all pr-12"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                />
                <button
                  onClick={handleCreateAndAdd}
                  disabled={!newProjectName.trim() || isAdding}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-navy text-white rounded-lg disabled:opacity-50"
                >
                  {isAdding ? <Loader2 size={18} className="animate-spin" /> : <FolderPlus size={18} />}
                </button>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="text-xs text-steel-gray hover:text-primary-navy font-medium underline px-1"
              >
                İptal Et
              </button>
            </motion.div>
          )}
        </div>

        <div className="px-6 py-4 bg-light-gray/30 text-[10px] text-steel-gray leading-relaxed">
          Projelerinizi hesabım sayfasından yönetebilir, ürün listelerini PDF olarak indirebilir veya teklif isteyebilirsiniz.
        </div>
      </motion.div>
    </div>
  )
}
