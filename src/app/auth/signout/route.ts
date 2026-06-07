import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { clearClaimsCacheCookie } from '@/utils/router'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) {
    await supabase.auth.signOut()
  }
  
  revalidatePath('/', 'layout')
  
  const requestUrl = new URL(request.url)
  const cookieStore = await cookies()
  const lang = cookieStore.get('NEXT_LOCALE')?.value || 'tr'
  
  const response = NextResponse.redirect(new URL(`/${lang}/auth/login`, requestUrl.origin), 302)
  
  // Clear the claims cache cookie on logout
  clearClaimsCacheCookie(response)
  
  return response
}
