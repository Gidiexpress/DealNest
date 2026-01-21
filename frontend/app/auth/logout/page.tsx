"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function LogoutPage() {
    const router = useRouter()

    useEffect(() => {
        // Clear all auth data
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        // Redirect to login after a brief moment
        setTimeout(() => {
            router.push('/login')
        }, 500)
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Logging Out...</h2>
                <p className="text-slate-600">You'll be redirected to login shortly.</p>
            </div>
        </div>
    )
}
