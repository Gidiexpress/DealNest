"use client"

import { useRequireAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
    children: React.ReactNode
}

/**
 * Wrapper component that requires authentication
 * Shows loading state while checking auth
 * Redirects to login if not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useRequireAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Verifying authentication...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        // Will redirect via useRequireAuth hook
        return null
    }

    return <>{children}</>
}
