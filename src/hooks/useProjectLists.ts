import { useContext } from 'react'
import { ProjectContext } from '../contexts/ProjectContext'

/**
 * Safely consumes the ProjectContext to provide project list state and management actions.
 * If used outside of a ProjectProvider (e.g., in static builds or isolated tests),
 * it returns a safe, no-op fallback object to prevent runtime errors.
 *
 * @returns The current project context containing user projects, loading state, and project management functions.
 *
 * @example
 * const { projects, addProject, loading } = useProjectLists();
 * if (!loading && projects.length > 0) {
 *   console.log(`User has ${projects.length} active projects.`);
 * }
 */
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
