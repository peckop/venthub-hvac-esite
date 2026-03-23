'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  listUserProjects, 
  createProject, 
  deleteProject, 
  addProductToProject, 
  removeProductFromProject, 
  listProjectItems,
  UserProject,
  ProjectItem
} from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

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
  const [projects, setProjects] = useState<UserProject[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const refreshProjects = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await listUserProjects()
      setProjects(data as UserProject[])
    } catch {
      console.error('Error refreshing projects')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      refreshProjects()
    } else {
      setProjects([])
      setLoading(false)
    }
  }, [user, refreshProjects])

  const addProject = async (name: string, description?: string) => {
    try {
      const newProject = await createProject({ name, description, user_id: user?.id })
      setProjects(prev => [newProject, ...prev])
      toast.success('Proje başarıyla oluşturuldu.')
      return newProject
    } catch {
      toast.error('Proje oluşturulamadı.')
      return null
    }
  }

  const removeProject = async (id: string) => {
    try {
      await deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      toast.success('Proje silindi.')
    } catch {
      toast.error('Proje silinemedi.')
    }
  }

  const addItem = async (projectId: string, _productId: string, quantity: number = 1) => {
    try {
      await addProductToProject(projectId, _productId, quantity)
      toast.success('Ürün projeye eklendi.')
    } catch {
      toast.error('Ürün eklenemedi.')
    }
  }

  const removeItem = async (projectId: string, _productId: string) => {
    try {
      await removeProductFromProject(projectId, _productId)
      toast.success('Ürün projeden çıkarıldı.')
    } catch {
      toast.error('Ürün çıkarılamadı.')
    }
  }

  const getProjectItems = async (projectId: string): Promise<ProjectItem[]> => {
    try {
      const items = await listProjectItems(projectId)
      return items as ProjectItem[]
    } catch {
      console.error('Error getting project items')
      return []
    }
  }

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      refreshProjects,
      addProject,
      removeProject,
      addItem,
      removeItem,
      getProjectItems
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}
