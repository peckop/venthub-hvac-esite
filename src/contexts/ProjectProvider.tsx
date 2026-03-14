'use client'

import React, { useState, useEffect, useCallback, ReactNode } from 'react'
import { 
  listUserProjects, 
  createProject, 
  deleteProject, 
  addProductToProject, 
  removeProductFromProject, 
  listProjectItems,
  UserProject
} from '../lib/supabase'
import { ProjectContext } from './ProjectContext'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<UserProject[]>([])
  const [loading, setLoading] = useState(false)

  const refreshProjects = useCallback(async () => {
    if (!user) {
      setProjects([])
      return
    }
    setLoading(true)
    try {
      const data = await listUserProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error refreshing projects:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  const addProject = async (name: string, description?: string) => {
    try {
      const newProject = await createProject(name, description)
      setProjects(prev => [newProject, ...prev])
      toast.success('Proje başarıyla oluşturuldu.')
      return newProject
    } catch (error) {
      toast.error('Proje oluşturulamadı.')
      throw error
    }
  }

  const removeProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      toast.success('Proje silindi.')
    } catch (error) {
      toast.error('Proje silinemedi.')
      throw error
    }
  }

  const addItemToProject = async (projectId: string, productId: string, quantity = 1) => {
    try {
      await addProductToProject(projectId, productId, quantity)
      toast.success('Ürün projeye eklendi.')
    } catch (error) {
      toast.error('Ürün eklenemedi.')
      throw error
    }
  }

  const removeItemFromProject = async (projectId: string, productId: string) => {
    try {
      await removeProductFromProject(projectId, productId)
      toast.success('Ürün projeden çıkarıldı.')
    } catch (error) {
      toast.error('Ürün çıkarılamadı.')
      throw error
    }
  }

  const getProjectItems = async (projectId: string) => {
    return await listProjectItems(projectId)
  }

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      refreshProjects,
      addProject,
      removeProject,
      addItemToProject,
      removeItemFromProject,
      getProjectItems
    }}>
      {children}
    </ProjectContext.Provider>
  )
}
