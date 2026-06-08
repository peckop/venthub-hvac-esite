import { createContext } from 'react'

import type { Product,ProjectItem, UserProject } from '@/types/ui-models'

export interface ProjectContextType {
  projects: UserProject[]
  loading: boolean
  refreshProjects: () => Promise<void>
  addProject: (name: string, description?: string) => Promise<UserProject>
  removeProject: (projectId: string) => Promise<void>
  addItemToProject: (projectId: string, _productId: string, quantity?: number) => Promise<void>
  removeItemFromProject: (projectId: string, _productId: string) => Promise<void>
  getProjectItems: (projectId: string) => Promise<(ProjectItem & { product: Product })[]>
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined)
