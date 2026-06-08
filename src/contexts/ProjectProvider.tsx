'use client'

import React, { createContext,  useCallback,useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { addProductToProject, createProject, deleteProject, listProjectItems,listUserProjects, removeProductFromProject } from '@/lib/services/project.service'
import { useSupabaseClient } from '@/providers/SupabaseProvider'
import type { ProjectItem,UserProject } from '@/types/ui-models'

import { useAuth } from '../hooks/useAuth'

interface ProjectContextType {
  projects: UserProject[]
  loading: boolean
  refreshProjects: () => Promise<void>
  addProject: (name: string, description?: string) => Promise<UserProject | null>
  removeProject: (id: string) => Promise<void>
  addItem: (projectId: string, _productId: string, quantity?: number) => Promise<void>
  removeItem: (projectId: string, _productId: string) => Promise<void>
  getProjectItems: (projectId: string) => Promise<ProjectItem[]>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabase } = useSupabaseClient()
  const [projects, setProjects] = useState<UserProject[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const refreshProjects = React.useCallback(async () => {
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
      toast.error('Oturum açmanız gerekiyor.')
      return null
    }
    try {
      const newProject = await createProject(supabase, { name, description, user_id: user.id })
      setProjects(prev => [newProject, ...prev])
      toast.success('Proje başarıyla oluşturuldu.')
      return newProject
    } catch {
      toast.error('Proje oluşturulamadı.')
      return null
    }
  }, [user?.id, supabase])

  const removeProject = useCallback(async (id: string) => {
    try {
      await deleteProject(supabase, id)
      setProjects(prev => prev.filter(p => p.id !== id))
      toast.success('Proje silindi.')
    } catch {
      toast.error('Proje silinemedi.')
    }
  }, [supabase])

  const addItem = useCallback(async (projectId: string, _productId: string, quantity: number = 1) => {
    try {
      await addProductToProject(supabase, projectId, _productId, quantity)
      toast.success('Ürün projeye eklendi.')
    } catch {
      toast.error('Ürün eklenemedi.')
    }
  }, [supabase])

  const removeItem = useCallback(async (projectId: string, _productId: string) => {
    try {
      await removeProductFromProject(supabase, projectId, _productId)
      toast.success('Ürün projeden çıkarıldı.')
    } catch {
      toast.error('Ürün çıkarılamadı.')
    }
  }, [supabase])

  const getProjectItems = useCallback(async (projectId: string): Promise<ProjectItem[]> => {
    try {
      const items = await listProjectItems(supabase, projectId)
      return items as ProjectItem[]
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
    addItem,
    removeItem,
    getProjectItems
  }), [projects, loading, refreshProjects, addProject, removeProject, addItem, removeItem, getProjectItems])

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}
