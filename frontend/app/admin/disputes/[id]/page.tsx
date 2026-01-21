
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Loader2,
    Gavel,
    User,
    FileText,
    ExternalLink,
    ChevronLeft,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    Scale,
    History
} from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function DisputeDetailPage() {
    const params = useParams()
    const id = params.id
    const router = useRouter()

    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [verdictNotes, setVerdictNotes] = useState("")
    const [processing, setProcessing] = useState(false)

    const fetchDispute = async () => {
        try {
            const res = await api.get(`/admin/disputes/${id}/`)
            setData(res.data)
        } catch (err) {
            toast.error("Failed to load dispute details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchDispute()
    }, [id])

    const handleVerdict = async (decision: string) => {
        setProcessing(true)
        try {
            await api.post(`/admin/disputes/${id}/resolve/`, {
                decision,
                notes: verdictNotes
            })
            toast.success("Verdict Delivered successfully")
            fetchDispute()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Could not process verdict")
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-rose-600" />
            </div>
        )
    }

    if (!data) return <div className="p-12 text-center text-rose-500 font-bold uppercase tracking-widest">Case Not Found</div>

    const { dispute, deal, submissions, chat_history } = data
    const isResolved = dispute.status === 'Resolved'

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                            <h1 className="text-2xl font-black uppercase tracking-tight">Case {dispute.reference_id}</h1>
                            <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase border ${isResolved
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                }`}>
                                {dispute.status === 'Open' ? 'ACTIVE ADJUDICATION' : 'RESOLVED'}
                            </Badge>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            DEAL: <span className="text-slate-900 dark:text-white">{deal.title}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                            VAL: <span className="text-emerald-500">₦{deal.amount.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                {isResolved && (
                    <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 shadow-sm border-l-4 border-l-emerald-500">
                        <CardContent className="py-3 px-6 flex items-center gap-4">
                            <div className="p-2 bg-emerald-500 rounded-lg">
                                <Gavel className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-widest leading-none mb-1">Final Verdict</p>
                                <p className="font-black capitalize text-slate-900 dark:text-white">{dispute.admin_decision?.replace(/_/g, ' ')}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left: arguments & History */}
                <div className="col-span-12 lg:col-span-8">
                    <Tabs defaultValue="arguments" className="space-y-6">
                        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <TabsTrigger value="arguments" className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-rose-500">
                                Case Arguments
                            </TabsTrigger>
                            <TabsTrigger value="chat" className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-rose-500">
                                Communication History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="arguments" className="space-y-8">
                            <Card className="border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden border-l-4 border-l-blue-500">
                                <CardHeader className="py-4 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                            <User className="w-4 h-4" /> Client: {deal.client}
                                        </CardTitle>
                                        <Badge className="bg-blue-600 text-white border-none font-black text-[9px] uppercase tracking-widest">Plaintiff</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6 group hover:border-blue-500/30 transition-all">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Claim Statement</p>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">"{dispute.reason}"</p>
                                    </div>

                                    {dispute.evidence && dispute.evidence.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Filed Evidence</p>
                                            <div className="flex flex-wrap gap-2">
                                                {dispute.evidence.map((file: any, i: number) => (
                                                    <a key={i} href={file.url} target="_blank" className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                                        <FileText className="w-3 h-3" />
                                                        EVIDENCE_LOG_{i + 1}.PDF
                                                        <ExternalLink className="w-2.5 h-2.5 ml-1" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden border-l-4 border-l-purple-500">
                                <CardHeader className="py-4 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                            <User className="w-4 h-4" /> Freelancer: {deal.freelancer}
                                        </CardTitle>
                                        <Badge className="bg-purple-600 text-white border-none font-black text-[9px] uppercase tracking-widest">Respondent</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Work Deliverables</p>
                                    {submissions.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No work submitted prior to dispute</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {submissions.map((sub: any, i: number) => (
                                                <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 group hover:border-purple-500/30 transition-all shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-lg">Round #{sub.round}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">{new Date(sub.time).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4 leading-relaxed">{sub.notes}</p>
                                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                                        {sub.links?.map((link: any, j: number) => (
                                                            <a key={j} href={link} target="_blank" className="text-[10px] font-bold text-purple-600 hover:text-purple-500 underline flex items-center gap-1">
                                                                <ExternalLink className="w-2.5 h-2.5" />
                                                                DELIVERABLE_{j + 1}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="chat">
                            <Card className="border-none shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden">
                                <CardHeader className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/50 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <History className="w-5 h-5 text-slate-400" />
                                        <CardTitle className="text-sm font-black uppercase tracking-widest">Platform Escrow Chat</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-slate-200 text-slate-400">Read Only Mode</Badge>
                                </CardHeader>
                                <CardContent className="p-6 max-h-[600px] overflow-y-auto space-y-8 custom-scrollbar">
                                    {chat_history.map((msg: any, i: number) => (
                                        <div key={i} className={`flex flex-col ${msg.user === deal.client ? 'items-start' : 'items-end'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.user === deal.client
                                                ? 'bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800'
                                                : 'bg-rose-500 dark:bg-rose-600 text-white'
                                                }`}>
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 opacity-70">
                                                    <User className="w-3 h-3" />
                                                    {msg.user}
                                                </p>
                                                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 mt-2 px-2 uppercase tracking-tighter">{new Date(msg.time).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right: Adjudication Panel */}
                <div className="col-span-12 lg:col-span-4">
                    <Card className="border-none shadow-2xl bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-8 border-t-4 border-t-rose-600">
                        <CardHeader className="bg-slate-900 dark:bg-slate-950 text-white rounded-t-lg pb-6">
                            <CardTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                <Scale className="w-6 h-6 text-rose-500" />
                                ADJUDICATION
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs font-bold font-mono">
                                CASE_REF: {dispute.id.toString().padStart(6, '0')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {isResolved ? (
                                <div className="space-y-6 pt-4">
                                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm uppercase tracking-widest">Case Permanently Closed</p>
                                        </div>
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-white dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                            DECISION: {dispute.admin_decision?.replace(/_/g, ' ').toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Judge's Final Notes</Label>
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                                "{dispute.decision_notes || "No additional notes provided."}"
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" onClick={() => router.push('/admin/disputes')}>
                                        Return to Queue
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-100 dark:border-rose-900/40 flex gap-4">
                                        <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
                                        <p className="text-[10px] leading-relaxed font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight">
                                            WARNING: YOUR DECISION IS FINAL. ALL FUND TRANSFERS ARE IRREVERSIBLE ONCE EXECUTED.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verdict Justification</Label>
                                        <Textarea
                                            placeholder="Enter the rationale for your decision. This will be visible to both parties..."
                                            className="h-40 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-rose-500/20 resize-none font-medium leading-relaxed p-4"
                                            value={verdictNotes}
                                            onChange={(e) => setVerdictNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 pt-4">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button disabled={processing || !verdictNotes} className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/10 active:scale-[0.98] transition-all border-none">
                                                    Release Funds to Freelancer
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-3xl border-none shadow-2xl bg-white dark:bg-slate-900">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Confirm Verdict</DialogTitle>
                                                    <DialogDescription className="font-medium text-slate-500 py-2">
                                                        You are authorizing the release of <span className="text-emerald-500 font-bold tracking-tight">₦{deal.amount.toLocaleString()}</span> to the Freelancer (<span className="text-slate-900 dark:text-white font-bold">{deal.freelancer}</span>).
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter className="pt-6">
                                                    <Button className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-xs tracking-widest border-none" onClick={() => handleVerdict('release_to_freelancer')}>EXECUTE RELEASE</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button disabled={processing || !verdictNotes} variant="outline" className="h-14 rounded-2xl border-rose-200 dark:border-rose-900 text-rose-500 font-black uppercase text-[10px] tracking-widest bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-500 hover:text-white active:scale-[0.98] transition-all shadow-sm">
                                                    Execute Full Refund to Client
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-3xl border-none shadow-2xl bg-white dark:bg-slate-900">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Confirm Verdict</DialogTitle>
                                                    <DialogDescription className="font-medium text-slate-500 py-2">
                                                        You are authorizing a full refund of <span className="text-rose-500 font-bold tracking-tight">₦{deal.amount.toLocaleString()}</span> to the Client (<span className="text-slate-900 dark:text-white font-bold">{deal.client}</span>).
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter className="pt-6">
                                                    <Button variant="destructive" className="h-12 w-full rounded-xl font-black uppercase text-xs tracking-widest border-none" onClick={() => handleVerdict('full_refund')}>EXECUTE REFUND</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
