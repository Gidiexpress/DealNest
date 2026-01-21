"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Bell, Plus, ArrowUpRight, Clock, CheckCircle2, Shield, Wallet, Building2, Loader2, Check, ChevronsUpDown, Lock as LockIcon, LogOut } from "lucide-react"
import { User, Deal } from "@/types"
import Link from "next/link"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useRequireAuth } from "@/lib/auth"
import { DepositModal } from "@/components/wallet/DepositModal"
import { WithdrawModal } from "@/components/wallet/WithdrawModal"

function DashboardContent() {
    const router = useRouter()
    const { user: authUser } = useRequireAuth() // Use auth hook
    const [user, setUser] = useState<User | null>(authUser)
    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    // Sync auth user with local state
    useEffect(() => {
        if (authUser) {
            setUser(authUser)
        }
    }, [authUser])

    // Fund Management States
    const [showDepositModal, setShowDepositModal] = useState(false)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const fetchUser = async () => {
        try {
            const userRes = await api.get("/auth/me/")
            setUser(userRes.data)
        } catch (err) { }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchUser()
                const dealsRes = await api.get("/deals/")
                setDeals(dealsRes.data.results || dealsRes.data)
            } catch (err) { } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="text-green-500 animate-pulse font-medium">Loading Dashboard...</div>
        </div>
    )

    const isClient = user?.role === 'client'
    const isFreelancer = user?.role === 'freelancer'

    const activeDeals = deals.filter(d => ['created', 'funded', 'in_progress', 'delivered'].includes(d.status))
    const completedDeals = deals.filter(d => d.status === 'completed')

    // Logic for Earned / Spent / Pending
    const totalSpent = deals
        .filter(d => d.client.id === user?.id && d.status === 'completed')
        .reduce((sum, d) => sum + Number(d.amount), 0)

    const totalEarned = deals
        .filter(d => d.freelancer?.id === user?.id && d.status === 'completed')
        .reduce((sum, d) => sum + Number(d.amount), 0)

    const pendingBalance = deals
        .filter(d => d.freelancer?.id === user?.id && ['funded', 'in_progress', 'delivered', 'disputed'].includes(d.status))
        .reduce((sum, d) => sum + Number(d.amount), 0)

    const escrowBalance = deals
        .filter(d => d.client.id === user?.id && ['funded', 'in_progress', 'delivered', 'disputed'].includes(d.status))
        .reduce((sum, d) => sum + Number(d.amount), 0)

    // Dynamic stats based on user's involvement
    const hasSpending = totalSpent > 0 || escrowBalance > 0;
    const hasEarnings = totalEarned > 0 || pendingBalance > 0;

    const statsGrid = [];

    // Always show available balance (from user profile)
    statsGrid.push({
        label: "Available",
        value: `₦${parseFloat(user?.balance || "0").toLocaleString()}`,
        sub: "Available for withdrawal",
        icon: <ArrowUpRight className="w-4 h-4" />,
        highlight: true
    });

    // Show Escrow if user has active outsourced deals
    if (escrowBalance > 0) {
        statsGrid.push({
            label: "In Escrow",
            value: `₦${escrowBalance.toLocaleString()}`,
            sub: "Committed to active deals",
            icon: <Shield className="w-4 h-4 text-emerald-400" />
        });
    }

    // Show Pending if they have any active freelance projects
    if (hasEarnings) {
        if (pendingBalance > 0) {
            statsGrid.push({
                label: "Pending",
                value: `₦${pendingBalance.toLocaleString()}`,
                sub: "Locked in active deals",
                icon: <Clock className="w-4 h-4 text-orange-400" />
            });
        }
        statsGrid.push({
            label: "Total Earned",
            value: `₦${totalEarned.toLocaleString()}`,
            sub: "Total completed earnings",
            icon: <CheckCircle2 className="w-4 h-4 text-green-400" />
        });
    }

    // Show Spent if they have created deals
    if (totalSpent > 0 || isClient) {
        statsGrid.push({
            label: "Total Spent",
            value: `₦${totalSpent.toLocaleString()}`,
            sub: "Released funds",
            icon: <Plus className="w-4 h-4 text-blue-400" />
        });
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header (Title) */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isClient ? "Client Dashboard" : isFreelancer ? "Freelancer Dashboard" : "Combined Dashboard"}
                    </h1>
                    <p className="text-gray-500">
                        {isClient ? "Manage your deals and payments." : "Track your active deals and earnings."}
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    {(isClient || deals.some(d => d.client.id === user?.id)) && (
                        <Link href="/deals/new">
                            <Button className="bg-[#0b3d1d] hover:bg-[#0b3d1d]/90 text-white rounded-xl px-6 h-12 shadow-lg hover:shadow-xl transition-all">
                                <Plus className="w-5 h-5 mr-2" /> Post New Deal
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {statsGrid.map((stat, i) => (
                    <Card key={i} className={`border-none shadow-sm rounded-[1.5rem] ${stat.highlight ? 'bg-[#0b3d1d] text-white' : 'bg-white'}`}>
                        <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
                            <div className="flex justify-between items-start">
                                <span className={`font-medium ${stat.highlight ? 'text-green-100' : 'text-gray-500'}`}>{stat.label}</span>
                                <div className={`${stat.highlight ? 'bg-white/10' : 'bg-gray-50'} p-2 rounded-full`}>{stat.icon}</div>
                            </div>
                            <div>
                                <div className={`text-4xl font-bold mb-1 ${stat.highlight ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                                <div className={`text-xs ${stat.highlight ? 'text-green-200' : 'text-gray-400'}`}>{stat.sub}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-xl text-gray-800">
                            {isClient ? "Your Deals" : "Active Deals"}
                        </h3>
                        <Button variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">View All</Button>
                    </div>

                    <div className="grid gap-3">
                        {deals.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-400 mb-4">No deals found.</p>
                                <Link href="/deals/new">
                                    <Button className="bg-green-600 text-white hover:bg-green-500">Post your first deal</Button>
                                </Link>
                            </div>
                        ) : (
                            deals.slice(0, 5).map(deal => (
                                <Link key={deal.id} href={`/deals/${deal.id}`} className="block">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-all hover:translate-x-1 group gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0
                                                ${deal.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}
                                            `}>
                                                {deal.title.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-900 text-base group-hover:text-green-600 transition-colors truncate">
                                                    {deal.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <Badge
                                                        variant={deal.status === 'completed' ? 'default' : 'secondary'}
                                                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border-gray-200 ${deal.status === 'delivered' && deal.client.id === user?.id
                                                            ? 'bg-orange-500 text-white border-none animate-pulse'
                                                            : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {deal.status === 'delivered' && deal.client.id === user?.id ? 'Needs Review' : deal.status.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                                                        {deal.client.id === user?.id ? "Outsourced" : "Recieved"}
                                                    </span>
                                                    <span className="text-xs text-gray-400 truncate hidden sm:inline">
                                                        {deal.client.id === user?.id ? `Freelancer: ${deal.freelancer?.username || 'Unassigned'}` : `Client: ${deal.client.username}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right w-full sm:w-auto flex justify-between sm:block pl-[4rem] sm:pl-0">
                                            <div className="text-lg font-extrabold text-gray-900">₦{Number(deal.amount).toLocaleString()}</div>
                                            <div className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                                                <Clock className="w-3 h-3" /> {mounted ? new Date(deal.created_at).toLocaleDateString() : '...'}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-[#050b14] text-white border-none rounded-[1.5rem] overflow-hidden">
                        <div className="p-6 bg-gradient-to-br from-gray-900 to-black">
                            <CardTitle className="text-lg mb-4">Account Overview</CardTitle>
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                                        <div>
                                            <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Available</p>
                                            <p className="text-xl font-extrabold text-[#00d166]">₦{parseFloat(user?.balance || "0").toLocaleString()}</p>
                                        </div>
                                        <div className="bg-green-500/10 p-2 rounded-xl">
                                            <Wallet className="w-4 h-4 text-green-500" />
                                        </div>
                                    </div>
                                    {escrowBalance > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                                            <div>
                                                <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">In Escrow</p>
                                                <p className="text-lg font-bold text-emerald-400">₦{escrowBalance.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-emerald-500/10 p-2 rounded-xl">
                                                <Shield className="w-4 h-4 text-emerald-500" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => setShowDepositModal(true)} className="flex-1 bg-white text-black hover:bg-gray-100 h-11 text-xs font-bold rounded-xl">
                                        <Wallet className="w-4 h-4 mr-1" /> Deposit
                                    </Button>
                                    <Button onClick={() => setShowWithdrawModal(true)} className="flex-1 bg-white text-black hover:bg-gray-100 h-11 text-xs font-bold rounded-xl">
                                        <Building2 className="w-4 h-4 mr-1" /> Withdraw
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[1.5rem] bg-white p-6">
                        <CardTitle className="text-base mb-4">Quick Tips</CardTitle>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {isClient ? "Fund your deals upfront to attract top freelancers quickly." : "Always communicate within DealNest to stay protected."}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Wallet Modals */}
            <DepositModal
                open={showDepositModal}
                onOpenChange={setShowDepositModal}
                callbackUrl={`${mounted ? window.location.origin : ""}/dashboard`}
            />
            <WithdrawModal
                open={showWithdrawModal}
                onOpenChange={setShowWithdrawModal}
                balance={user?.balance || 0}
                onSuccess={fetchUser}
            />
        </div>
    )
}

// Export wrapped with authentication protection
export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    )
}
