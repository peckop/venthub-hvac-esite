import { useContext } from 'react'
import { ProjectContext } from '../contexts/ProjectContext'

export function useProjectLists() {
  const context = useContext(ProjectContext)
  if (!context) {
    return {
      projects: [],
      loading: false,
      refreshProjects: async () => {},
      addProject: async () => ({ id: '', user_id: '', name: '' }),
      removeProject: async () => {},
      addItemToProject: async () => {},
      removeItemFromProject: async () => {},
      getProjectItems: async () => []
    }
  }
  return context
}
