'use server'

import { supabase } from '../lib/supabase'
import { revalidatePath } from 'next/cache'

export interface AuthActionState {
  success?: boolean
  error?: string | null
}

export async function loginAction(_prevState: AuthActionState | null, formData: FormData): Promise<AuthActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email ve şifre zorunludur.' }
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch {
    return { error: 'Beklenmedik bir hata oluştu.' }
  }
}
