
"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Loader2,
    Briefcase,
    Search,
    Filter,
    MoreHorizontal,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    Clock
} from "lucide-react"
import Link from "next/link"

export default function AdminDealsPage() {
    const [deals, setDeals] = useState<any[]>([])
    const [stats, setStats] = useState({ total_escrow: 0, active_deals: 0, open_disputes: 0 })
    const [loading, setLoading] = useState(true)

    const fetchDeals = async () => {
        try {
            const res = await api.get('/admin/deals/')
            setDeals(res.data.deals)
            setStats(res.data.stats)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDeals()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
            case 'funded': case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
            case 'disputed': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
            case 'delivered': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
            default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-none mb-2">
                        Deal Oversight
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Monitor and manage all active transactions across the platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 rounded-xl font-bold uppercase text-[10px] tracking-widest border-gray-100 bg-white transition-all hover:bg-gray-50">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button className="h-11 rounded-xl bg-[#0b3d1d] text-white font-bold uppercase text-[10px] tracking-widest px-6 shadow-lg active:scale-95 transition-all">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Escrow Reports
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Escrow", value: `₦${stats.total_escrow.toLocaleString()}`, icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Active Deals", value: stats.active_deals, icon: Clock, color: "text-green-500", bg: "bg-green-50" },
                    { label: "Open Disputes", value: stats.open_disputes, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden group">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden">
                <CardHeader className="border-b border-gray-50 p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-2xl">
                            <Briefcase className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">Transaction Ledger</CardTitle>
                            <CardDescription className="text-xs font-medium text-gray-500">Recent deals and their current platform status</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-gray-50">
                                <TableHead className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Deal Information</TableHead>
                                <TableHead className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Participants</TableHead>
                                <TableHead className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Financials</TableHead>
                                <TableHead className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</TableHead>
                                <TableHead className="py-5 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deals.map((deal) => (
                                <TableRow key={deal.id} className="group hover:bg-gray-50 border-b border-gray-50 transition-colors">
                                    <TableCell className="py-6 px-8">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900 text-base group-hover:text-green-600 transition-colors uppercase tracking-tight">{deal.title}</p>
                                            <p className="text-[10px] font-mono text-gray-400">REF: {deal.reference_id}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[8px] h-4 px-1 border-blue-100 text-blue-600 uppercase font-bold tracking-tighter bg-blue-50">Client</Badge>
                                                <span className="text-xs font-bold text-gray-700">{deal.client}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[8px] h-4 px-1 border-purple-100 text-purple-600 uppercase font-bold tracking-tighter bg-purple-50">Freelancer</Badge>
                                                <span className="text-xs font-bold text-gray-700">{deal.freelancer || "Unassigned"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900 text-lg">₦{deal.amount.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(deal.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <Badge className={`rounded-full px-4 py-1 text-[10px] font-bold tracking-wider uppercase shadow-none border-none ${getStatusColor(deal.status)}`}>
                                            {deal.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <Link href={`/admin/deals/${deal.id}`}>
                                            <Button variant="ghost" className="h-10 px-4 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all group/btn font-bold text-xs">
                                                Manage
                                                <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {deals.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-5 bg-gray-50 rounded-full">
                                                <Search className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No transactions found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
