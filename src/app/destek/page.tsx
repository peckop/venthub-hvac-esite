'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * /destek route fallback.
 * Redirects users to the Knowledge Hub (destek-merkezi) or general Support page.
 * In EliteMegaMenu, /destek was linked as 'Support Center'.
 */
export default function DestekPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to /support which is the actual Support Center home
        router.replace('/support')
    }, [router])

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-blue"></div>
        </div>
    )
}
