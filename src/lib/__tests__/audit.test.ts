import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logAdminAction } from '../audit'
import type { SupabaseClient } from '@supabase/supabase-js'

describe('logAdminAction', () => {
  let mockSupabase: {
    auth: {
      getSession: ReturnType<typeof vi.fn>;
      getUser: ReturnType<typeof vi.fn>;
    };
    from: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
  }

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [{ id: 'mocked-id' }], error: null }),
    }
  })

  it('should insert a single row and try to fetch user id from session first', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: { id: 'session-user-id' } } } })

    const input = { table_name: 'test', action: 'INSERT' as const }
    await logAdminAction(mockSupabase as never as SupabaseClient, input)

    expect(mockSupabase.auth.getSession).toHaveBeenCalled()
    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled()
    expect(mockSupabase.from).toHaveBeenCalledWith('admin_audit_log')
    expect(mockSupabase.insert).toHaveBeenCalledWith([{ ...input, actor: 'session-user-id' }])
  })

  it('should fall back to getUser if session is missing user id', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } })
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'get-user-id' } } })

    const input = { table_name: 'test', action: 'UPDATE' as const }
    await logAdminAction(mockSupabase as never as SupabaseClient, input)

    expect(mockSupabase.auth.getSession).toHaveBeenCalled()
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    expect(mockSupabase.insert).toHaveBeenCalledWith([{ ...input, actor: 'get-user-id' }])
  })

  it('should use provided actor over fetched user id', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: { id: 'session-user-id' } } } })

    const input = { table_name: 'test', action: 'DELETE' as const, actor: 'custom-actor' }
    await logAdminAction(mockSupabase as never as SupabaseClient, input)

    expect(mockSupabase.insert).toHaveBeenCalledWith([{ ...input }])
  })

  it('should handle array of inputs', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: { id: 'batch-user-id' } } } })

    const inputs = [
      { table_name: 'test1', action: 'INSERT' as const },
      { table_name: 'test2', action: 'DELETE' as const, actor: 'provided-actor' }
    ]
    await logAdminAction(mockSupabase as never as SupabaseClient, inputs)

    expect(mockSupabase.insert).toHaveBeenCalledWith([
      { ...inputs[0], actor: 'batch-user-id' },
      { ...inputs[1] } // Keeps 'provided-actor'
    ])
  })

  it('should fail gracefully (swallow errors) if insert throws exception', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockSupabase.auth.getSession.mockRejectedValueOnce(new Error('Auth failed'))

    // It should proceed and just use actor: null
    await logAdminAction(mockSupabase as never as SupabaseClient, { table_name: 'test', action: 'INSERT' })

    expect(mockSupabase.insert).toHaveBeenCalledWith([{ table_name: 'test', action: 'INSERT', actor: null }])

    // Now test if insert itself throws an exception
    mockSupabase.select.mockRejectedValueOnce(new Error('Insert failed DB'))

    await expect(logAdminAction(mockSupabase as never as SupabaseClient, { table_name: 'test', action: 'INSERT' })).resolves.not.toThrow()
    expect(consoleWarnSpy).toHaveBeenCalledWith('audit log insert exception', expect.any(Error))

    consoleWarnSpy.mockRestore()
  })

  it('should log warning if insert returns error object', async () => {
     const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
     mockSupabase.select.mockResolvedValueOnce({ data: null, error: { message: 'Some DB error' } })

     await logAdminAction(mockSupabase as never as SupabaseClient, { table_name: 'test', action: 'INSERT' })

     expect(consoleWarnSpy).toHaveBeenCalledWith('audit log insert failed', { message: 'Some DB error' })

     consoleWarnSpy.mockRestore()
  })
})
