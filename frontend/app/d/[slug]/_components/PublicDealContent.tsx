"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Shield, Clock, AlertCircle, ArrowRight, User, Calendar } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

interface PublicDealContentProps {
    initialDeal: any;
    slug: string;
}

export default function PublicDealContent({ initialDeal, slug }: PublicDealContentProps) {
    const router = useRouter()
    const [deal, setDeal] = useState<any>(initialDeal)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [isAccepting, setIsAccepting] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get("/auth/me/")
                setCurrentUser(data)

                // Check if we were redirected here to auto-accept
                const shouldAutoAccept = sessionStorage.getItem('auto_accept_deal')
                if (shouldAutoAccept === slug) {
                    sessionStorage.removeItem('auto_accept_deal')
                    handleAutoAccept(data)
                }
            } catch (e) { }
        }
        checkUser()
    }, [slug])

    const handleAutoAccept = async (user: any) => {
        if (!user) return;
        setIsAccepting(true)
        try {
            await api.post(`/deals/${deal.id}/accept/`)
            toast.success("Deal accepted!")
            router.push(`/deals/${deal.id}`)
        } catch (err: any) {
            toast.error("Failed to accept: " + (err.response?.data?.error || err.message))
        } finally {
            setIsAccepting(false)
        }
    }

    const handleAccept = async () => {
        if (!currentUser) {
            sessionStorage.setItem('auto_accept_deal', slug as string)
            router.push(`/login?next=/d/${slug}`)
            return
        }

        setIsAccepting(true)
        try {
            await api.post(`/deals/${deal.id}/accept/`)
            toast.success("Deal accepted!")
            router.push(`/deals/${deal.id}`)
        } catch (err: any) {
            toast.error("Failed to accept: " + (err.response?.data?.error || err.message))
        } finally {
            setIsAccepting(false)
        }
    }

    if (!deal) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h1 className="text-xl font-bold">Deal not found</h1>
                <Button variant="link" onClick={() => router.push('/')}>Go Home</Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans">
            <nav className="w-full bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
                <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">
                    <Image
                        src="/logo.png"
                        alt="DealNest Logo"
                        width={120}
                        height={32}
                        className="h-8 w-auto object-contain"
                    />
                </Link>
                <div className="text-sm text-gray-500 hidden md:block">
                    Secure Deal Payments
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
                <div className="grid md:grid-cols-12 gap-12 items-start">
                    <div className="md:col-span-8 space-y-12">
                        <div className="space-y-4">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                {deal.job_type_details?.name || "Deal"}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                                {deal.title}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <User className="w-4 h-4" />
                                <span>Posted by <span className="font-semibold text-gray-900">{deal.client.username}</span></span>
                                <span className="mx-2">•</span>
                                <Clock className="w-4 h-4" />
                                <span>{new Date(deal.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">About the Deal</h3>
                            <div className="prose prose-gray max-w-none text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {deal.description}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {deal.requirements && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Key Requirements</h3>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-gray-600 whitespace-pre-wrap text-sm leading-7">
                                        {deal.requirements}
                                    </div>
                                </div>
                            )}
                            {deal.deadline && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                        <div className="bg-yellow-100 p-3 rounded-xl text-yellow-700">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Target Delivery</p>
                                            <p className="text-gray-500">{new Date(deal.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-4 sticky top-24">
                        <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2rem] overflow-hidden bg-white">
                            <div className="h-2 bg-gradient-to-r from-green-400 to-green-600 w-full"></div>
                            <CardHeader className="p-8 pb-4 text-center">
                                <p className="text-gray-500 font-medium uppercase text-xs tracking-widest mb-2">Fixed Price</p>
                                <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
                                    ₦{deal.amount.toLocaleString()}
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-6">
                                {deal.status === 'created' || deal.status === 'funded' ? (
                                    deal.freelancer ? (
                                        <div className="bg-gray-100 p-4 rounded-xl text-center text-gray-500 font-medium">
                                            This deal has been accepted
                                        </div>
                                    ) : (
                                        <Button
                                            size="lg"
                                            disabled={isAccepting}
                                            onClick={handleAccept}
                                            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isAccepting ? "Accepting..." : "Accept Deal"} <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    )
                                ) : (
                                    <Button disabled variant="outline" className="w-full">
                                        Status: {deal.status.replace('_', ' ')}
                                    </Button>
                                )}

                                <div className="pt-6 border-t border-gray-100 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">Payment Protection</p>
                                            <p className="text-xs text-gray-500 leading-relaxed">Funds are held securely until you deliver the work and the client approves it.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">Verified Client</p>
                                            <p className="text-xs text-gray-500 leading-relaxed">Identity and payment method verified.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50/50 p-6 text-center justify-center">
                                <p className="text-xs text-gray-400 font-medium">
                                    Powered by DealNest • Secure Transactions
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
