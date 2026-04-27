import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listUserProjects, createProject, deleteProject, addProductToProject, removeProductFromProject, listProjectItems } from '../project.service'
import { supabase } from '../../supabase'

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis()
    }))
  }
}))

vi.mock('../../type-converters', () => ({
  mapDatabaseProductToDomain: vi.fn((p) => p)
}))

describe('project.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listUserProjects', () => {
    it('should fetch user projects ordered by updated_at', async () => {
      const mockProjects = [{ id: 'proj-1', name: 'Project 1' }]
      const mockOrder = vi.fn().mockResolvedValue({ data: mockProjects, error: null })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: mockSelect
      }))

      const result = await listUserProjects()

      expect(result).toEqual(mockProjects)
      expect(supabase.from).toHaveBeenCalledWith('user_projects')
      expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false })
    })

    it('should throw error if fetch fails', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: new Error('Fetch error') })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: mockSelect
      }))

      await expect(listUserProjects()).rejects.toThrow('Fetch error')
    })
  })

  describe('createProject', () => {
    it('should create and return a project', async () => {
      const mockProject = { id: 'proj-1', name: 'New Project' }
      const payload = { name: 'New Project', user_id: 'user-1' }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockProject, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        insert: mockInsert
      }))

      const result = await createProject(payload)

      expect(result).toEqual(mockProject)
      expect(mockInsert).toHaveBeenCalledWith(payload)
    })
  })

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        delete: mockDelete
      }))

      const result = await deleteProject('proj-1')

      expect(result).toBe(true)
      expect(mockEq).toHaveBeenCalledWith('id', 'proj-1')
    })
  })

  describe('addProductToProject', () => {
    it('should add product to a project and return the item', async () => {
      const mockItem = { project_id: 'proj-1', product_id: 'prod-1', quantity: 2 }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockItem, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        insert: mockInsert
      }))

      const result = await addProductToProject('proj-1', 'prod-1', 2)

      expect(result).toEqual(mockItem)
      expect(mockInsert).toHaveBeenCalledWith({ project_id: 'proj-1', product_id: 'prod-1', quantity: 2 })
    })
  })

  describe('removeProductFromProject', () => {
    it('should remove product from a project', async () => {
      const mockMatch = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ match: mockMatch })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        delete: mockDelete
      }))

      const result = await removeProductFromProject('proj-1', 'prod-1')

      expect(result).toBe(true)
      expect(mockMatch).toHaveBeenCalledWith({ project_id: 'proj-1', product_id: 'prod-1' })
    })
  })

  describe('listProjectItems', () => {
    it('should list mapped project items', async () => {
      const mockItems = [{ project_id: 'proj-1', product_id: 'prod-1', product: { id: 'prod-1', name: 'Product 1' } }]

      const mockEq = vi.fn().mockResolvedValue({ data: mockItems, error: null })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: mockSelect
      }))

      const result = await listProjectItems('proj-1')

      expect(result).toEqual([{ project_id: 'proj-1', product_id: 'prod-1', product: { id: 'prod-1', name: 'Product 1' } }])
      expect(supabase.from).toHaveBeenCalledWith('project_items')
      expect(mockSelect).toHaveBeenCalledWith('*, product:products(*)')
      expect(mockEq).toHaveBeenCalledWith('project_id', 'proj-1')
    })
  })
})
