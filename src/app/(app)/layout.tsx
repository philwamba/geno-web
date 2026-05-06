'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, isLoading, initializeAuth } = useAuthStore()

    useEffect(() => {
        const unsubscribe = initializeAuth()
        return () => unsubscribe?.()
    }, [initializeAuth])

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen app-shell-bg pb-20">
            {children}
            <BottomNav />
        </div>
    )
}
