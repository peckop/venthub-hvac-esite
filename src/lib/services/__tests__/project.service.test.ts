import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listUserProjects,
  createProject,
  deleteProject,
  addProductToProject,
  removeProductFromProject,
  listProjectItems
} from '../project.service'
import { supabase } from '../../supabase'

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
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
    it('should return projects', async () => {
      const mockProjects = [{ id: 'p1', name: 'Project 1' }];
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProjects, error: null })
      }));
      const res = await listUserProjects();
      expect(res).toEqual(mockProjects);
    });

    it('should throw error on failure', async () => {
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') })
      }));
      await expect(listUserProjects()).rejects.toThrow('DB Error');
    });
  });

  describe('createProject', () => {
    it('should return created project', async () => {
      const mockProj = { id: 'p1', name: 'New Proj' };
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProj, error: null })
      }));
      const res = await createProject({ name: 'New Proj', user_id: 'u1' });
      expect(res).toEqual(mockProj);
    });

    it('should throw error on failure', async () => {
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Insert Error') })
      }));
      await expect(createProject({ name: 'New Proj', user_id: 'u1' })).rejects.toThrow('Insert Error');
    });
  });

  describe('deleteProject', () => {
    it('should delete project and return true', async () => {
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }));
      const res = await deleteProject('p1');
      expect(res).toBe(true);
    });

    it('should throw error on failure', async () => {
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: new Error('Delete Error') })
      }));
      await expect(deleteProject('p1')).rejects.toThrow('Delete Error');
    });
  });

  describe('addProductToProject', () => {
    it('should add product and return item', async () => {
      const mockItem = { id: 'i1', project_id: 'p1', product_id: 'prod1', quantity: 2 };
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockItem, error: null })
      }));
      const res = await addProductToProject('p1', 'prod1', 2);
      expect(res).toEqual(mockItem);
    });
  });

  describe('removeProductFromProject', () => {
    it('should remove product and return true', async () => {
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        match: vi.fn().mockResolvedValue({ error: null })
      }));
      const res = await removeProductFromProject('p1', 'prod1');
      expect(res).toBe(true);
    });
  });

  describe('listProjectItems', () => {
    it('should return project items with mapped products', async () => {
      const mockItems = [
        { id: 'i1', project_id: 'p1', product: { id: 'prod1', name: 'Product 1' } },
        { id: 'i2', project_id: 'p1', product: null }
      ];
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockItems, error: null })
      }));
      const res = await listProjectItems('p1');
      expect(res[0].product).toEqual({ id: 'prod1', name: 'Product 1' });
      expect(res[1].product).toBeUndefined();
    });
  });
});
