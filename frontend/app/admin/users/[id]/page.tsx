"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import api from "@/lib/api"
import {
    Loader2, User, Mail, Shield, CreditCard,
    Ban, CheckCircle, AlertCircle, ArrowLeft,
    TrendingUp, Calendar, History, Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserDetail {
    id: number
    reference_id: string
    username: string
    email: string
    first_name: string
    last_name: string
    role: string
    kyc_status: string
    is_active: boolean
    balance: number
    date_joined: string
    last_login: string
    deals_count: number
    disputes_count: number
    recent_deals: {
        id: number
        title: string
        amount: number
        status: string
        role: string
        date: string
    }[]
}

export default function AdminUserDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [user, setUser] = useState<UserDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // Form state
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("")
    const [kycStatus, setKycStatus] = useState("")
    const [balanceAdjustment, setBalanceAdjustment] = useState("")
    const [balanceReason, setBalanceReason] = useState("")
    const [modReason, setModReason] = useState("")

    useEffect(() => {
        fetchUser()
    }, [id])

    const fetchUser = async () => {
        try {
            const res = await api.get(`/admin/users/${id}/`)
            setUser(res.data)
            setEmail(res.data.email)
            setRole(res.data.role)
            setKycStatus(res.data.kyc_status)
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load user")
            router.push("/admin/users")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        setUpdating(true)
        try {
            await api.patch(`/admin/users/${id}/`, {
                email,
                role,
                kyc_status: kycStatus
            })
            toast.success("User updated successfully")
            fetchUser()
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Update failed")
        } finally {
            setUpdating(false)
        }
    }

    const handleAction = async (action: string, extraData: any = {}) => {
        const actionReason = action === 'adjust_balance' ? balanceReason : (modReason || "Administrative action")

        if (action === 'adjust_balance' && !balanceReason) {
            toast.error("Please provide a reason for the balance adjustment")
            return
        }

        setActionLoading(true)
        try {
            await api.post(`/admin/users/${id}/action/`, {
                action,
                reason: actionReason,
                ...extraData
            })
            toast.success(`Action ${action} successful`)
            if (action === 'adjust_balance') {
                setBalanceReason("")
                setBalanceAdjustment("")
            } else {
                setModReason("")
            }
            fetchUser()
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Action failed")
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!user) return null

    const selectClassName = "h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer font-medium"

    return (
        <div className="space-y-6 max-w-6xl pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full h-10 w-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                                {user.username}
                                <span className="block text-[10px] font-mono font-bold text-slate-400 mt-1">{user.reference_id}</span>
                            </h1>
                            <Badge
                                variant={user.is_active ? "outline" : "destructive"}
                                className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${user.is_active ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
                            >
                                {user.is_active ? "Active" : "Banned"}
                            </Badge>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">User ID: #{user.id} • Joined {new Date(user.date_joined).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Management */}
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="h-1.5 bg-emerald-500" />
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                    <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <CardTitle className="text-lg font-bold">Profile Management</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</Label>
                                    <Input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 rounded-xl border-slate-200 dark:border-slate-800 focus:ring-emerald-500/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Account Role</Label>
                                    <div className="relative">
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className={selectClassName}
                                            title="Account Role"
                                        >
                                            <option value="client">Client</option>
                                            <option value="freelancer">Freelancer</option>
                                            <option value="both">Both</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <TrendingUp className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">KYC Verification</Label>
                                    <div className="relative">
                                        <select
                                            value={kycStatus}
                                            onChange={(e) => setKycStatus(e.target.value)}
                                            className={selectClassName}
                                            title="KYC Verification Status"
                                        >
                                            <option value="unverified">Unverified</option>
                                            <option value="basic">Basic Verification</option>
                                            <option value="full">Verified Professional</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleUpdate}
                                        disabled={updating}
                                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 border-none"
                                    >
                                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                        Update Details
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Access Control */}
                    <Card className={`border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden ${user.is_active ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-emerald-500'}`}>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${user.is_active ? 'bg-red-50 dark:bg-red-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30'}`}>
                                    {user.is_active ? <Ban className="w-5 h-5 text-red-600 dark:text-red-400" /> : <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Account Access Control</CardTitle>
                                    <CardDescription className="text-xs">Manage user permissions and system access</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Moderation Reason (Optional)</Label>
                                <Input
                                    placeholder={user.is_active ? "Specify violation (optional)..." : "Reason for restoring access (optional)..."}
                                    value={modReason}
                                    onChange={(e) => setModReason(e.target.value)}
                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            {user.is_active ? (
                                <Button
                                    onClick={() => handleAction('ban')}
                                    disabled={actionLoading}
                                    className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20 font-black uppercase tracking-widest text-xs border-none"
                                >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Suspend Account
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleAction('unban')}
                                    disabled={actionLoading}
                                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-black uppercase tracking-widest text-xs border-none"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Restore Account
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Log */}
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                        <CardHeader className="pb-4 border-b border-slate-50 dark:border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                    <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-lg font-bold">Activity Log</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {user.recent_deals.length > 0 ? (
                                    user.recent_deals.map((deal) => (
                                        <div key={deal.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${deal.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{deal.title}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{deal.role} • {new Date(deal.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-sm text-slate-900 dark:text-white">₦{deal.amount.toLocaleString()}</p>
                                                <Badge variant="outline" className="text-[9px] h-5 font-black uppercase border-slate-200 dark:border-slate-700">{deal.status}</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400 font-medium italic text-sm">
                                        No recent deals recorded.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6 lg:sticky lg:top-20">
                    {/* Wallet */}
                    <Card className="border-none shadow-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <CreditCard className="w-3 h-3" /> Available Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h2 className="text-4xl font-black tracking-tighter">₦{user.balance.toLocaleString()}</h2>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                        <CardContent className="p-0">
                            <div className="grid grid-cols-2 divide-x divide-slate-50 dark:divide-slate-800">
                                <div className="p-6 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deals</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{user.deals_count}</p>
                                </div>
                                <div className="p-6 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Disputes</p>
                                    <p className="text-2xl font-black text-red-500">{user.disputes_count}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-50 dark:border-slate-800 text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    Last Activity: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Inactive'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Control */}
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900 border-t-4 border-t-blue-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Financial Override</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase opacity-60">Manual Balance adjustment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Amount (₦)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 5000 or -5000"
                                    value={balanceAdjustment}
                                    onChange={(e) => setBalanceAdjustment(e.target.value)}
                                    className="h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Audit Reason</Label>
                                <Input
                                    placeholder="Adjustment reason..."
                                    value={balanceReason}
                                    onChange={(e) => setBalanceReason(e.target.value)}
                                    className="h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                                />
                            </div>
                            <Button
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20"
                                onClick={() => handleAction('adjust_balance', { amount: parseFloat(balanceAdjustment) })}
                                disabled={actionLoading || !balanceReason || !balanceAdjustment}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                                Apply Change
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
