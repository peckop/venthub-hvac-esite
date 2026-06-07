import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
  
  return NextResponse.redirect(new URL(`/${lang}/auth/login`, requestUrl.origin), 302)
}
