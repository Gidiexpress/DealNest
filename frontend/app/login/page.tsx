"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050b14] flex items-center justify-center text-green-500">Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextUrl = searchParams.get("next") || "/dashboard"

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)

    // Check if user is already logged in
    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem('access_token')

            if (!token) {
                setCheckingAuth(false)
                return
            }

            try {
                const res = await api.get('/auth/me/')
                const user = res.data

                // Already logged in - redirect based on role
                if (user.is_staff || user.is_superuser) {
                    router.push('/admin')
                } else {
                    router.push(nextUrl)
                }
            } catch (err) {
                // Token invalid - clear it and show login
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                setCheckingAuth(false)
            }
        }

        checkAuthentication()
    }, [router, nextUrl])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const { data } = await api.post("/auth/login/", { username: email, password })
            localStorage.setItem("access_token", data.access)
            localStorage.setItem("refresh_token", data.refresh)

            // Fetch user profile to check if admin
            try {
                const userRes = await api.get("/auth/me/")
                const user = userRes.data

                // If user is admin/staff, redirect to admin dashboard
                if (user.is_staff || user.is_superuser) {
                    toast.success("Welcome back, Administrator!")
                    router.push("/admin")
                } else {
                    toast.success("Login successful!")
                    router.push(nextUrl)
                }
            } catch (profileErr) {
                // If profile fetch fails, use default routing
                toast.success("Login successful!")
                router.push(nextUrl)
            }
        } catch (err) {
            const error = err as any
            const message = error.response?.data?.detail || "Login failed"
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    // Show loading while checking authentication
    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050b14] text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Checking authentication...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#050b14] text-white">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0A101A] relative overflow-hidden border-r border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-20">
                        <Image
                            src="/logo.png"
                            alt="DealNest Logo"
                            width={150}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                    </div>
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Secure payments for <br />
                        <span className="text-green-500">peace of mind.</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">Join thousands of freelancers and clients who trust DealNest for their transaction security.</p>
                </div>

                <div className="relative z-10 space-y-4">
                    {["Escrow Protection", "Instant Payouts", "Fair Dispute Resolution"].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-300">
                            <CheckCircle className="text-green-500 w-5 h-5" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col justify-center p-8 md:p-24 relative">
                <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="max-w-md w-full mx-auto space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
                        <p className="text-gray-400">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Username / Email</Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="Enter your username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-[#0A101A] border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl focus:border-green-500 focus:ring-green-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-[#0A101A] border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl focus:border-green-500 focus:ring-green-500/20"
                            />
                        </div>

                        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">{error}</div>}

                        <Button type="submit" className="w-full h-12 bg-green-500 hover:bg-green-400 text-black text-base font-bold rounded-xl" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <div className="text-center text-gray-500">
                        Don't have an account? <Link href="/register" className="text-green-500 hover:underline">Create free account</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
