import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) {
    await supabase.auth.signOut()
  }
  
  revalidatePath('/', 'layout')
  
  const requestUrl = new URL(request.url)
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin), 302)
}
