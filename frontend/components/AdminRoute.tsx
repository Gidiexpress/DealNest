"use client"

import { useRequireAdmin } from "@/lib/auth"
import { Shield, Loader2 } from "lucide-react"

interface AdminRouteProps {
    children: React.ReactNode
}

/**
 * Wrapper component that requires admin permissions
 * Shows loading state while checking auth
 * Redirects to login if not authenticated
 * Redirects to dashboard if authenticated but not admin
 */
export default function AdminRoute({ children }: AdminRouteProps) {
    const { user, loading, isAdmin } = useRequireAdmin()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Verifying admin access...</p>
                </div>
            </div>
        )
    }

    if (!user || !isAdmin) {
        // Will redirect via useRequireAdmin hook
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center max-w-md">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-600">Redirecting...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
