"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "./api"
import type { User } from "@/types"

/**
 * Hook to get current authenticated user
 * Returns null if not authenticated
 */
export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('access_token')

            if (!token) {
                setUser(null)
                setLoading(false)
                return
            }

            try {
                const res = await api.get('/auth/me/')
                setUser(res.data)
            } catch (error) {
                // Token invalid or expired
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    return { user, loading, isAuthenticated: !!user }
}

/**
 * Hook that requires authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && !user) {
            router.push(redirectTo)
        }
    }, [user, loading, router, redirectTo])

    return { user, loading }
}

/**
 * Hook that requires admin permissions
 * Redirects to login if not authenticated
 * Redirects to dashboard if authenticated but not admin
 */
export function useRequireAdmin() {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not authenticated - go to login
                router.push('/login')
            } else if (!user.is_staff && !user.is_superuser) {
                // Authenticated but not admin - go to user dashboard
                router.push('/dashboard')
            }
        }
    }, [user, loading, router])

    return { user, loading, isAdmin: user?.is_staff || user?.is_superuser }
}

/**
 * Check if user is admin (for conditional rendering)
 */
export function useIsAdmin() {
    const { user, loading } = useAuth()
    return {
        isAdmin: user?.is_staff || user?.is_superuser,
        loading
    }
}
