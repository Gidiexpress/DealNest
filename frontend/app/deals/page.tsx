"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Deal } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function MyDealsContent() {
    const searchParams = useSearchParams()
    const urlSearchQuery = searchParams.get('search') || ""
    const [localSearch, setLocalSearch] = useState(urlSearchQuery)
    const [user, setUser] = useState<any>(null)
    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setLocalSearch(urlSearchQuery)
    }, [urlSearchQuery])

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, dealsRes] = await Promise.all([
                    api.get("/auth/me/"),
                    api.get("/deals/")
                ])
                setUser(userRes.data)
                setDeals(dealsRes.data.results || dealsRes.data)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredDeals = deals.filter(deal =>
        deal.title.toLowerCase().includes(localSearch.toLowerCase()) ||
        deal.description?.toLowerCase().includes(localSearch.toLowerCase())
    )

    if (loading) return <div className="p-8 text-center text-gray-400">Loading deals...</div>

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Deals</h1>
                    <p className="text-gray-500 text-sm">Manage all your ongoing and past transactions.</p>
                </div>
                <Link href="/deals/new">
                    <Button className="bg-[#050b14] text-white hover:bg-[#050b14]/90 hover:text-white rounded-full px-6">
                        <Plus className="w-4 h-4 mr-2" /> Post New Deal
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by title..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="pl-10 bg-white border-none shadow-sm rounded-xl"
                    />
                </div>
                <Button variant="outline" className="rounded-xl border-none shadow-sm bg-white text-gray-600">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
            </div>

            <div className="space-y-3">
                {filteredDeals.map(deal => (
                    <Link key={deal.id} href={`/deals/${deal.id}`} className="block">
                        <div className="bg-white hover:bg-gray-50 transition-colors p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                {/* Compact Status Indicator */}
                                <div className={`w-2 h-12 rounded-full shrink-0 ${deal.status === 'completed' ? 'bg-green-500' :
                                    deal.status === 'delivered' ? 'bg-orange-500 animate-pulse' :
                                        deal.status === 'funded' ? 'bg-blue-500' :
                                            'bg-gray-300'
                                    }`}></div>

                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">{deal.title}</span>
                                        {user && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                                                {deal.client.id === user.id ? "Outsourced" : "Recieved"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                        <span>Created {mounted ? new Date(deal.created_at).toLocaleDateString() : '...'}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className={`capitalize ${deal.status === 'delivered' && deal.client.id === user?.id ? 'text-orange-600 font-bold' : ''}`}>
                                            {deal.status === 'delivered' && deal.client.id === user?.id ? 'Needs Review' : deal.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-6 sm:pl-0">
                                <div className="text-right">
                                    <div className="text-lg font-extrabold text-gray-900">₦{Number(deal.amount).toLocaleString()}</div>
                                    <div className="text-xs text-gray-400">Fixed Price</div>
                                </div>
                                <div className="hidden md:block">
                                    <Badge variant="outline" className="rounded-lg border-gray-200 text-gray-500 font-normal">
                                        Details
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {filteredDeals.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        No deals found matching your search.
                    </div>
                )}
            </div>
        </div>
    )
}

export default function MyDealsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading platform...</div>}>
            <MyDealsContent />
        </Suspense>
    )
}
