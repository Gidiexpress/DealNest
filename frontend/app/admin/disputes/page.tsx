
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
    ShieldAlert,
    Gavel,
    AlertCircle,
    CheckCircle2,
    Clock,
    MessageSquare,
    Search,
    ChevronRight,
    Scale
} from "lucide-react"
import Link from "next/link"

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDisputes = async () => {
        try {
            const res = await api.get('/admin/disputes/')
            setDisputes(res.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDisputes()
    }, [])

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
                        Resolution Center
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Adjudicate disputes and maintain platform integrity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-rose-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-rose-100">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700">
                            {disputes.filter(d => d.status === 'Open').length} ACTIVE CASES
                        </span>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden">
                <CardHeader className="border-b border-gray-50 p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl">
                            <Scale className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">Judicial Queue</CardTitle>
                            <CardDescription className="text-xs font-medium text-gray-500">Awaiting final verdict from administrators</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-gray-50">
                                <TableHead className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Case ID</TableHead>
                                <TableHead className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Disputed Deal</TableHead>
                                <TableHead className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Reason for Dispute</TableHead>
                                <TableHead className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</TableHead>
                                <TableHead className="py-5 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {disputes.map((dispute) => (
                                <TableRow key={dispute.id} className="group hover:bg-gray-50 border-b border-gray-50 transition-colors">
                                    <TableCell className="py-6 px-8">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${dispute.status === 'Open' ? 'bg-rose-500 animate-pulse' : 'bg-gray-200'}`} />
                                            <span className="font-mono text-[11px] font-bold text-gray-400 uppercase tracking-tighter">REF: {dispute.reference_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900 text-base group-hover:text-rose-600 transition-colors uppercase tracking-tight">{dispute.deal_title}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[8px] h-4 px-1 border-gray-100 text-gray-400 uppercase font-bold tracking-tighter bg-gray-50">Opened By</Badge>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{dispute.opened_by}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <div className="flex items-start gap-3 max-w-[280px]">
                                            <MessageSquare className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
                                            <p className="text-xs font-medium text-gray-500 line-clamp-2 italic leading-relaxed">
                                                "{dispute.reason}"
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <Badge
                                            className={`rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase border-none shadow-none ${dispute.status === 'Open'
                                                ? 'bg-rose-50 text-rose-700'
                                                : 'bg-green-50 text-green-700'
                                                }`}
                                        >
                                            {dispute.status === 'Open' ? 'ACTIVE CASE' : 'RESOLVED'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <Link href={`/admin/disputes/${dispute.id}`}>
                                            <Button
                                                variant="ghost"
                                                className={`h-10 px-4 rounded-xl transition-all group/btn font-bold text-xs ${dispute.status === 'Open'
                                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-none'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-900 hover:text-white border-none'
                                                    }`}
                                            >
                                                <span className="mr-2">
                                                    {dispute.status === 'Open' ? 'ADJUDICATE' : 'VIEW VERDICT'}
                                                </span>
                                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {disputes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-5 bg-green-50 rounded-full">
                                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Peace reigns! No active disputes found.</p>
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
