"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, Briefcase, User } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { toast } from "sonner"
import Image from "next/image"

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050b14] flex items-center justify-center text-green-500">Loading...</div>}>
            <RegisterForm />
        </Suspense>
    )
}

function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextUrl = searchParams.get("next")

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "client"
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            await api.post("/auth/register/", formData)

            // Auto Login
            const loginRes = await api.post("/auth/login/", {
                username: formData.username,
                password: formData.password
            })
            localStorage.setItem("access_token", loginRes.data.access)
            localStorage.setItem("refresh_token", loginRes.data.refresh)

            toast.success("Registration successful! You are now logged in.")

            // Redirect to login, preserving the next param
            if (nextUrl) {
                router.push(nextUrl)
            } else {
                router.push("/dashboard")
            }
        } catch (err: any) {
            const errorData = err.response?.data
            let displayError = "Registration failed. Please try again."

            if (errorData) {
                const firstError = Object.values(errorData)[0]
                if (Array.isArray(firstError)) {
                    displayError = firstError[0] as string
                } else if (typeof errorData === 'string') {
                    displayError = errorData
                } else {
                    displayError = JSON.stringify(errorData)
                }
            }

            setError(displayError)
            toast.error(displayError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#050b14] text-white">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-[#0A101A] relative overflow-hidden border-r border-white/5 text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]"></div>
                <div className="relative z-10">
                    <div className="flex justify-center mb-10">
                        <Image
                            src="/logo.png"
                            alt="DealNest Logo"
                            width={200}
                            height={50}
                            className="h-12 w-auto object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-bold mb-6">Start your journey.</h1>
                    <p className="text-gray-400 text-lg max-w-lg mx-auto">
                        Whether you're hiring top talent or offering your services, DealNest ensures you get paid fairly and securely.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col justify-center p-8 md:p-24 relative overflow-y-auto">
                <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="max-w-md w-full mx-auto space-y-8 mt-12 mb-12">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold mb-2">Create an account</h2>
                        <p className="text-gray-400">Enter your details to get started.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-gray-300">I am a...</Label>
                            <RadioGroup
                                defaultValue="client"
                                onValueChange={(val) => setFormData({ ...formData, role: val })}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem value="client" id="client" className="peer sr-only" />
                                    <Label
                                        htmlFor="client"
                                        className="flex flex-col items-center justify-between rounded-xl border-2 border-white/10 bg-[#0A101A] p-4 hover:bg-white/5 hover:text-white peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:text-green-500 cursor-pointer transition-all"
                                    >
                                        <User className="mb-3 h-6 w-6" />
                                        Client
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="freelancer" id="freelancer" className="peer sr-only" />
                                    <Label
                                        htmlFor="freelancer"
                                        className="flex flex-col items-center justify-between rounded-xl border-2 border-white/10 bg-[#0A101A] p-4 hover:bg-white/5 hover:text-white peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:text-green-500 cursor-pointer transition-all"
                                    >
                                        <Briefcase className="mb-3 h-6 w-6" />
                                        Freelancer
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-gray-300">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Choose a unique username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="bg-[#0A101A] border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl focus:border-green-500 focus:ring-green-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="bg-[#0A101A] border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl focus:border-green-500 focus:ring-green-500/20"
                            />
                        </div>

                        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>}

                        <Button type="submit" className="w-full h-12 bg-green-500 hover:bg-green-400 text-black text-base font-bold rounded-xl" disabled={loading}>
                            {loading ? "Creating account..." : "Sign up"}
                        </Button>
                    </form>

                    <div className="text-center text-gray-500">
                        Already have an account? <Link href="/login" className="text-green-500 hover:underline">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
