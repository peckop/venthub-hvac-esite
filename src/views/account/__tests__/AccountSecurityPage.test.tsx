vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}))

import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock toast (default export function with .error/.success methods)
vi.mock('react-hot-toast', () => {
  const toastFn = Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn()
  })
  return { default: toastFn }
})

// Mock supabase auth API used by AccountSecurityPage
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}))

// Mock HIBP checker to avoid external network and allow updates in tests
vi.mock('../../../utils/passwordSecurity', () => ({
  hibpPwnedCount: vi.fn().mockResolvedValue(0)
}))

// Provide minimal Auth and I18n contexts
import { AuthContext } from '../../../contexts/AuthContextDefinition'
import { I18nProvider } from '../../../i18n/I18nProvider'
import AccountSecurityPage from '../AccountSecurityPage'
import { supabase } from '../../../lib/supabase'
import toast from 'react-hot-toast'

function renderWithProviders(ui: React.ReactElement, { userEmail = 'u@example.com' } = {}) {
  const authValue: React.ContextType<typeof AuthContext> = {
    user: Object.assign({} as import('@supabase/supabase-js').User, { email: userEmail, id: '123' }),
    session: null,
    role: null,
    loading: false,
    roleLoading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    refreshSession: vi.fn()
  }
  return render(
    <I18nProvider>
      <AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>
    </I18nProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('AccountSecurityPage', () => {
  it('shows validation errors for empty current password', async () => {
    const { getByPlaceholderText, getByRole } = renderWithProviders(<AccountSecurityPage />)

    const newInput = getByPlaceholderText('New password')
    const confirmInput = getByPlaceholderText('New password (confirm)')
    const saveBtn = getByRole('button', { name: 'Save' })

    await userEvent.type(newInput, '123456')
    await userEvent.type(confirmInput, '123456')
    await userEvent.click(saveBtn)

    expect(toast.error).toHaveBeenCalledWith('Please enter your current password')
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('shows validation error for short new password', async () => {
    const { getByPlaceholderText, getByRole } = renderWithProviders(<AccountSecurityPage />)

    const currentInput = (screen.getAllByPlaceholderText('Current password')[0] as HTMLInputElement)
    const newInput = getByPlaceholderText('New password')
    const confirmInput = getByPlaceholderText('New password (confirm)')
    const saveBtn = getByRole('button', { name: 'Save' })

    await userEvent.type(currentInput, 'oldpass')
    await userEvent.type(newInput, '12345')
    await userEvent.type(confirmInput, '12345')
    await userEvent.click(saveBtn)

    expect(toast.error).toHaveBeenCalledWith(expect.any(String))
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('shows validation error when passwords do not match', async () => {
    const { getByPlaceholderText, getByRole } = renderWithProviders(<AccountSecurityPage />)

    const currentInput = (screen.getAllByPlaceholderText('Current password')[0] as HTMLInputElement)
    const newInput = getByPlaceholderText('New password')
    const confirmInput = getByPlaceholderText('New password (confirm)')
    const saveBtn = getByRole('button', { name: 'Save' })

    await userEvent.type(currentInput, 'oldpass')
    await userEvent.type(newInput, 'Aa1!12345')
    await userEvent.type(confirmInput, '87654321')
    await userEvent.click(saveBtn)

    expect(toast.error).toHaveBeenCalledWith(expect.any(String))
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('handles wrong current password (re-auth failure)', async () => {
    const { getByPlaceholderText, getByRole } = renderWithProviders(<AccountSecurityPage />)

    vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(() => 
      Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { name: 'AuthError', status: 400, message: 'Invalid login credentials' } as import('@supabase/supabase-js').AuthError
      })
    )

    const currentInput = (screen.getAllByPlaceholderText('Current password')[0] as HTMLInputElement)
    const newInput = getByPlaceholderText('New password')
    const confirmInput = getByPlaceholderText('New password (confirm)')
    const saveBtn = getByRole('button', { name: 'Save' })

    await userEvent.type(currentInput, 'wrongpass')
    await userEvent.type(newInput, 'Aa1!12345')
    await userEvent.type(confirmInput, 'Aa1!12345')
    await userEvent.click(saveBtn)

    expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    expect(supabase.auth.updateUser).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(expect.any(String))
  })

  it('updates password successfully', async () => {
    const { getByPlaceholderText, getByRole } = renderWithProviders(<AccountSecurityPage />)

    vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(() => 
      Promise.resolve({ 
        data: { user: {} as import('@supabase/supabase-js').User, session: {} as import('@supabase/supabase-js').Session }, 
        error: null 
      })
    )
    vi.mocked(supabase.auth.updateUser).mockImplementationOnce(() => 
      Promise.resolve({ 
        data: { user: {} as import('@supabase/supabase-js').User }, 
        error: null 
      })
    )

    const currentInput = (screen.getAllByPlaceholderText('Current password')[0] as HTMLInputElement)
    const newInput = getByPlaceholderText('New password')
    const confirmInput = getByPlaceholderText('New password (confirm)')
    const saveBtn = getByRole('button', { name: 'Save' })

    await userEvent.type(currentInput, 'oldpass')
    await userEvent.type(newInput, 'Aa1!12345')
    await userEvent.type(confirmInput, 'Aa1!12345')
    await userEvent.click(saveBtn)

    expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'Aa1!12345' })
    expect(toast.success).toHaveBeenCalledWith('Your password has been updated')
  })

  it('shows error when update fails', async () => {
    const { getByPlaceholderText, getByRole } = renderWithProviders(<AccountSecurityPage />)

    vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(() => 
      Promise.resolve({ 
        data: { user: {} as import('@supabase/supabase-js').User, session: {} as import('@supabase/supabase-js').Session }, 
        error: null 
      })
    )
    vi.mocked(supabase.auth.updateUser).mockImplementationOnce(() => 
      Promise.resolve({ 
        data: { user: null }, 
        error: { name: 'AuthError', status: 400, message: 'update failed' } as import('@supabase/supabase-js').AuthError
      })
    )

    const currentInput = (screen.getAllByPlaceholderText('Current password')[0] as HTMLInputElement)
    const newInput = getByPlaceholderText('New password')
    const confirmInput = getByPlaceholderText('New password (confirm)')
    const saveBtn = getByRole('button', { name: 'Save' })

    await userEvent.type(currentInput, 'oldpass')
    await userEvent.type(newInput, 'Aa1!12345')
    await userEvent.type(confirmInput, 'Aa1!12345')
    await userEvent.click(saveBtn)

    expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    expect(supabase.auth.updateUser).toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('An error occurred while updating password')
  })
})




