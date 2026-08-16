'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useI18n } from '@/i18n/I18nProvider'
import { addProductToProject, createProject, deleteProject, listProjectItems, listUserProjects, removeProductFromProject } from '@/lib/services/project.service'
import { useSupabaseClient } from '@/providers/SupabaseProvider'
import type { Product, ProjectItem, UserProject } from '@/types/ui-models'

import { useAuth } from '../hooks/useAuth'
// SSOT: context nesnesi TEK yerde (ProjectContext.tsx) yaratılır. Bu dosyada ikinci bir
// createContext çağrısı YASAK — 2026-08-16'ya kadar burada yerel bir kopya vardı ve
// useProjectLists başka nesneyi okuduğu için "projeye ekle" sessiz no-op'tu (INV-AUTH-2 R2).
import { ProjectContext } from './ProjectContext'

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabase } = useSupabaseClient()
  const { t } = useI18n()
  const [projects, setProjects] = useState<UserProject[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const refreshProjects = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await listUserProjects(supabase)
      setProjects(data as UserProject[])
    } catch {
      console.error('Error refreshing projects')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      refreshProjects()
    } else {
      setProjects([])
      setLoading(false)
    }
  }, [user, refreshProjects])

  const addProject = useCallback(async (name: string, description?: string) => {
    if (!user?.id) {
      toast.error(t('account.projects.toasts.authRequired'))
      throw new Error('auth required')
    }
    try {
      const newProject = await createProject(supabase, { name, description, user_id: user.id })
      setProjects(prev => [newProject, ...prev])
      toast.success(t('account.projects.toasts.created'))
      return newProject
    } catch (error) {
      toast.error(t('account.projects.toasts.createError'))
      throw error
    }
  }, [user?.id, supabase, t])

  const removeProject = useCallback(async (id: string) => {
    try {
      await deleteProject(supabase, id)
      setProjects(prev => prev.filter(p => p.id !== id))
      toast.success(t('account.projects.toasts.deleted'))
    } catch {
      toast.error(t('account.projects.toasts.deleteError'))
    }
  }, [supabase, t])

  const addItemToProject = useCallback(async (projectId: string, productId: string, quantity: number = 1) => {
    try {
      await addProductToProject(supabase, projectId, productId, quantity)
      toast.success(t('account.projects.toasts.itemAdded'))
    } catch (error) {
      toast.error(t('account.projects.toasts.itemAddError'))
      throw error
    }
  }, [supabase, t])

  const removeItemFromProject = useCallback(async (projectId: string, productId: string) => {
    try {
      await removeProductFromProject(supabase, projectId, productId)
      toast.success(t('account.projects.toasts.itemRemoved'))
    } catch {
      toast.error(t('account.projects.toasts.itemRemoveError'))
    }
  }, [supabase, t])

  const getProjectItems = useCallback(async (projectId: string): Promise<(ProjectItem & { product: Product })[]> => {
    try {
      const items = await listProjectItems(supabase, projectId)
      // Ürünü silinmiş öğeler listeden düşer (context sözleşmesi product'ı zorunlu tutar).
      return items.filter((i): i is ProjectItem & { product: Product } => !!i.product)
    } catch {
      console.error('Error getting project items')
      return []
    }
  }, [supabase])

  const value = useMemo(() => ({
    projects,
    loading,
    refreshProjects,
    addProject,
    removeProject,
    addItemToProject,
    removeItemFromProject,
    getProjectItems
  }), [projects, loading, refreshProjects, addProject, removeProject, addItemToProject, removeItemFromProject, getProjectItems])

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}
