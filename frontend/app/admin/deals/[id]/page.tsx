"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Loader2,
    ChevronLeft,
    Briefcase,
    User,
    MessageCircle,
    FileText,
    ShieldAlert,
    Ban,
    CheckCircle2,
    Clock,
    DollarSign,
    ExternalLink,
    AlertTriangle
} from "lucide-react"
import { toast } from "sonner"

export default function AdminDealDetailPage() {
    const params = useParams()
    const id = params.id
    const router = useRouter()

    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [reason, setReason] = useState("")

    const fetchDeal = async () => {
        try {
            const res = await api.get(`/admin/deals/${id}/`)
            setData(res.data)
        } catch (error) {
            toast.error("Failed to load deal details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchDeal()
    }, [id])

    const handleAction = async (action: string) => {
        setActionLoading(true)
        try {
            await api.post(`/admin/deals/${id}/`, { action, reason })
            toast.success(`Action ${action} processed`)
            fetchDeal()
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to process action")
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'funded': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'disputed': return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!data) return <div className="p-12 text-center text-rose-500 font-bold uppercase tracking-widest">Deal Not Found</div>

    const { deal, messages, submissions } = data

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="h-11 w-11 rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 p-0"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-black uppercase tracking-tight">{deal.title}</h1>
                        <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase border ${getStatusVariant(deal.status)}`}>
                            {deal.status}
                        </Badge>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">ID: {deal.reference_id}</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <FileText className="w-5 h-5 text-emerald-500" />
                                Deal Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {deal.description}
                            </p>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="activity" className="space-y-6">
                        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <TabsTrigger value="activity" className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-500">
                                Communication Log
                            </TabsTrigger>
                            <TabsTrigger value="submissions" className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-500">
                                Work Submissions
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="activity">
                            <Card className="border-none shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-md">
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {messages.length === 0 ? (
                                            <div className="py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No messages recorded for this deal</div>
                                        ) : (
                                            messages.map((msg: any, i: number) => (
                                                <div key={i} className={`flex flex-col ${msg.user === deal.client ? 'items-start' : 'items-end'}`}>
                                                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.user === deal.client ? 'bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800' : 'bg-emerald-500 dark:bg-emerald-600 text-white'}`}>
                                                        <div className="flex items-center gap-2 mb-2 opacity-70">
                                                            <User className="w-3 h-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{msg.user}</span>
                                                        </div>
                                                        <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 mt-2 px-2">{new Date(msg.time).toLocaleString()}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="submissions">
                            <Card className="border-none shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-md">
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {submissions.length === 0 ? (
                                            <div className="py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No work has been submitted yet</div>
                                        ) : (
                                            submissions.map((sub: any, i: number) => (
                                                <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 group hover:border-emerald-500/30 transition-all">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Badge className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                                                            Round #{sub.round}
                                                        </Badge>
                                                        <span className="text-[10px] font-bold text-slate-400">{new Date(sub.time).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4">{sub.notes}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {sub.links?.map((link: any, j: number) => (
                                                            <a key={j} href={link} target="_blank" className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                                                                <ExternalLink className="w-3 h-3" />
                                                                VIEW ASSET
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar: Metrics & Actions */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-xl bg-slate-900 dark:bg-slate-950 text-white overflow-hidden">
                        <CardHeader className="bg-emerald-600/10 border-b border-white/5 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                ESCROW STATUS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-8 space-y-8">
                            <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Platform Held</p>
                                    <h2 className="text-3xl font-black text-white">₦{deal.amount.toLocaleString()}</h2>
                                </div>
                                <div className="p-4 bg-emerald-600/20 rounded-2xl">
                                    <ShieldAlert className="w-8 h-8 text-emerald-500" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                {deal.fee_breakdown && (
                                    <div className="space-y-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/10">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-slate-500 uppercase">Base Deal</span>
                                            <span className="font-bold text-slate-300">₦{deal.fee_breakdown.base_amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-slate-500 uppercase">Client Fee</span>
                                            <span className="font-bold text-amber-500">+₦{deal.fee_breakdown.client_fee.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-slate-500 uppercase">Freelancer Fee</span>
                                            <span className="font-bold text-rose-500">-₦{deal.fee_breakdown.freelancer_fee.toLocaleString()}</span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                                            <span className="font-black text-emerald-500 uppercase">Est. Revenue</span>
                                            <span className="font-black text-emerald-500">₦{deal.fee_breakdown.platform_revenue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Client</span>
                                    <span className="font-black text-white">{deal.client}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Freelancer</span>
                                    <span className="font-black text-emerald-500">{deal.freelancer || "UNASSIGNED"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Deadline</span>
                                    <span className="font-black text-white">{deal.deadline ? new Date(deal.deadline).toLocaleDateString() : "NONE"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden border-l-4 border-l-rose-500">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                                    <Ban className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Admin Overrides</CardTitle>
                                    <CardDescription className="text-[10px] uppercase font-bold text-rose-500">Danger Zone</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-rose-50 dark:bg-rose-900/10 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] leading-relaxed font-bold text-rose-700 dark:text-rose-400">
                                    Use these tools to resolve stalled deals. Cancelling will refund the client. Completing will release funds to the freelancer.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Reason</Label>
                                <Input
                                    placeholder="Brief explanation for the override..."
                                    className="h-10 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    disabled={actionLoading || !reason}
                                    onClick={() => handleAction('cancel_deal')}
                                    className="h-11 rounded-xl border-rose-200 dark:border-rose-900/50 text-rose-500 font-bold uppercase text-[9px] tracking-widest bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                >
                                    Cancel & Refund
                                </Button>
                                <Button
                                    disabled={actionLoading || !reason}
                                    onClick={() => handleAction('force_complete')}
                                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[9px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all border-none"
                                >
                                    Force Complete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
