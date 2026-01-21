
"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCcw } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminFinancialsPage() {
    const [stats, setStats] = useState<any>(null)
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, txRes] = await Promise.all([
                    api.get('/admin/financials/stats/'),
                    api.get('/admin/financials/transactions/')
                ])
                setStats(statsRes.data)
                setTransactions(txRes.data)
            } catch (error) {
                console.error("Failed to load financials", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>

    // Mock data for chart since we don't have historical aggregation endpoint yet
    const chartData = [
        { name: 'Mon', revenue: stats?.revenue * 0.1 },
        { name: 'Tue', revenue: stats?.revenue * 0.2 },
        { name: 'Wed', revenue: stats?.revenue * 0.15 },
        { name: 'Thu', revenue: stats?.revenue * 0.25 },
        { name: 'Fri', revenue: stats?.revenue * 0.3 },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                <p className="text-gray-500 font-medium">Detailed tracking of platform revenue and escrow holdings</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-[#0b3d1d] text-white rounded-[1.5rem]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-100 uppercase tracking-wider">Total Revenue</CardTitle>
                        <div className="bg-white/10 p-2 rounded-xl">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">₦{stats?.revenue.toLocaleString()}</div>
                        <p className="text-xs text-green-200">5% Platform commission</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Escrow Holdings</CardTitle>
                        <div className="bg-blue-50 p-2 rounded-xl">
                            <Wallet className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 mb-1">₦{stats?.escrow.toLocaleString()}</div>
                        <p className="text-xs text-gray-400">Funds currently secured</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Payout</CardTitle>
                        <div className="bg-rose-50 p-2 rounded-xl">
                            <ArrowUpRight className="h-4 w-4 text-rose-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 mb-1">₦{stats?.total_payout?.toLocaleString() || '0'}</div>
                        <p className="text-xs text-gray-400">Settled withdrawals</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Payout</CardTitle>
                        <div className="bg-orange-50 p-2 rounded-xl">
                            <RefreshCcw className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 mb-1">₦{stats?.pending_payout?.toLocaleString() || '0'}</div>
                        <p className="text-xs text-gray-400">Release queue</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[1.5rem]">
                    <CardHeader>
                        <CardTitle className="font-bold text-gray-900">Revenue Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} stroke="#94a3b8" />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="font-bold text-gray-900">Recent Flows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {transactions.slice(0, 5).map((tx, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${tx.type === 'deposit' ? 'bg-green-50 text-green-600' :
                                            tx.type === 'withdrawal' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> :
                                                tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold capitalize text-gray-900">{tx.type}</p>
                                            <p className="text-xs text-gray-500 font-medium">{tx.user}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                                            {tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="font-bold text-gray-900 text-xl">Transaction Ledger</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-gray-50">
                                <TableHead className="pl-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Reference</TableHead>
                                <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Type</TableHead>
                                <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">User</TableHead>
                                <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Gateway</TableHead>
                                <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount</TableHead>
                                <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</TableHead>
                                <TableHead className="pr-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id} className="hover:bg-gray-50 border-gray-50 transition-colors">
                                    <TableCell className="pl-8 py-6 font-mono text-[10px] text-gray-500 uppercase">{tx.reference}</TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-xl px-3 py-1 text-[10px] font-bold uppercase shadow-none border-none ${tx.type === 'deposit' ? 'bg-green-50 text-green-700' :
                                                tx.type === 'withdrawal' ? 'bg-rose-50 text-rose-700' :
                                                    'bg-blue-50 text-blue-700'
                                            }`}>
                                            {tx.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-gray-900 text-xs">{tx.user}</TableCell>
                                    <TableCell className="capitalize text-xs text-gray-500 font-medium">{tx.gateway}</TableCell>
                                    <TableCell className="font-bold text-gray-900">₦{tx.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={tx.status === 'success' ? 'outline' : 'secondary'} className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${tx.status === 'success' ? 'border-green-500 text-green-700 bg-green-50' : 'text-gray-400 bg-gray-50'
                                            }`}>
                                            {tx.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-8 text-right text-xs text-gray-500 font-medium">
                                        {new Date(tx.date).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
