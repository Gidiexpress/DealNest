"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, DollarSign, Wallet, TrendingUp, Activity, Shield } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { toast } from "sonner"

interface AdminStats {
    users: { total: number, freelancers: number, clients: number }
    deals: { total: number, active: number, completed: number }
    financials: { escrow_balance: number, total_volume: number, estimated_revenue: number }
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/admin/stats/')
            .then(res => setStats(res.data))
            .catch(err => toast.error("Failed to load admin stats"))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading Command Center...</p>
            </div>
        </div>
    )

    if (!stats) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center max-w-md">
                <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                <p className="text-slate-600 mb-4">Error loading data. You need admin permissions.</p>
                <p className="text-sm text-slate-500">Please log out and log back in to refresh your session token.</p>
            </div>
        </div>
    )

    const dealData = [
        { name: 'Active', value: stats.deals.active, color: COLORS[0] },
        { name: 'Completed', value: stats.deals.completed, color: COLORS[1] },
        { name: 'Other', value: Math.max(0, stats.deals.total - (stats.deals.active + stats.deals.completed)), color: COLORS[2] }
    ].filter(d => d.value > 0);

    // Mock trend data
    const trendData = [
        { name: 'Mon', revenue: stats.financials.estimated_revenue * 0.15 },
        { name: 'Tue', revenue: stats.financials.estimated_revenue * 0.18 },
        { name: 'Wed', revenue: stats.financials.estimated_revenue * 0.16 },
        { name: 'Thu', revenue: stats.financials.estimated_revenue * 0.22 },
        { name: 'Fri', revenue: stats.financials.estimated_revenue * 0.29 },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
                <p className="text-gray-500">Real-time platform oversight & analytics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue Card */}
                <Card className="border-none shadow-sm bg-[#0b3d1d] text-white rounded-[1.5rem] overflow-hidden relative group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-100 uppercase tracking-wider">Platform Revenue</CardTitle>
                        <div className="bg-white/10 p-2 rounded-xl">
                            <DollarSign className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-1">₦{stats.financials.estimated_revenue.toLocaleString()}</div>
                        <div className="text-xs text-green-200">5% Platform commission</div>
                    </CardContent>
                </Card>

                {/* Escrow Card */}
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">In Escrow</CardTitle>
                        <div className="bg-gray-50 p-2 rounded-xl">
                            <Wallet className="h-4 w-4 text-gray-900" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900 mb-1">₦{stats.financials.escrow_balance.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Funds in active deals</div>
                    </CardContent>
                </Card>

                {/* Active Deals Card */}
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Deals</CardTitle>
                        <div className="bg-gray-50 p-2 rounded-xl">
                            <Briefcase className="h-4 w-4 text-gray-900" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900 mb-1">{stats.deals.active}</div>
                        <div className="text-xs text-gray-400">Contracts in progress</div>
                    </CardContent>
                </Card>

                {/* Total Users Card */}
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</CardTitle>
                        <div className="bg-gray-50 p-2 rounded-xl">
                            <Users className="h-4 w-4 text-gray-900" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900 mb-1">{stats.users.total}</div>
                        <div className="text-xs text-gray-400">{stats.users.freelancers} Freelancers • {stats.users.clients} Clients</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Revenue Trend */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[1.5rem]">
                    <CardHeader>
                        <CardTitle className="text-gray-900 font-bold">Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" axisLine={false} tickLine={false} />
                                <YAxis fontSize={12} stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Deal Distribution */}
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem]">
                    <CardHeader>
                        <CardTitle className="text-gray-900 font-bold">Deal Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dealData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {dealData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats Banner */}
            <Card className="border-none shadow-sm bg-[#050b14] text-white rounded-[1.5rem] overflow-hidden">
                <CardContent className="py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                        <div className="py-2">
                            <div className="text-3xl font-bold mb-1 text-green-500">₦{stats.financials.total_volume.toLocaleString()}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Volume</div>
                        </div>
                        <div className="py-2">
                            <div className="text-3xl font-bold mb-1">{stats.deals.completed}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Completed Deals</div>
                        </div>
                        <div className="py-2">
                            <div className="text-3xl font-bold mb-1">{((stats.deals.completed / stats.deals.total) * 100 || 0).toFixed(1)}%</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Success Rate</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
