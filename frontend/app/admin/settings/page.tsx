"use client"

import { useState, useEffect } from "react"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import api from "@/lib/api"
import { Loader2, Lock, CreditCard, Settings as SettingsIcon, Save, AlertTriangle, Zap, Shield, ChevronDown } from "lucide-react"

interface PlatformSettings {
    id: number
    active_gateway: string
    use_test_mode: boolean
    platform_fee_percent: string
    min_platform_fee: string
    max_platform_fee: string
    fee_payer: string
    dispute_window_days: number
    auto_release_days: number
    support_email: string
    whatsapp_link: string
    paystack_public_key: string
    paystack_secret_key: string
    flutterwave_public_key: string
    flutterwave_secret_key: string
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form state
    const [activeGateway, setActiveGateway] = useState("")
    const [testMode, setTestMode] = useState(true)
    const [feePercent, setFeePercent] = useState("")
    const [minFee, setMinFee] = useState("")
    const [maxFee, setMaxFee] = useState("")
    const [feePayer, setFeePayer] = useState("")
    const [disputeWindowDays, setDisputeWindowDays] = useState("")
    const [autoReleaseDays, setAutoReleaseDays] = useState("")
    const [supportEmail, setSupportEmail] = useState("")
    const [whatsappLink, setWhatsappLink] = useState("")

    // API Keys (only show when updating)
    const [showPaystackKeys, setShowPaystackKeys] = useState(false)
    const [showFlutterwaveKeys, setShowFlutterwaveKeys] = useState(false)
    const [paystackPublic, setPaystackPublic] = useState("")
    const [paystackSecret, setPaystackSecret] = useState("")
    const [flutterwavePublic, setFlutterwavePublic] = useState("")
    const [flutterwaveSecret, setFlutterwaveSecret] = useState("")

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings/')
            const data = res.data
            setSettings(data)

            // Populate form
            setActiveGateway(data.active_gateway)
            setTestMode(data.use_test_mode)
            setFeePercent(data.platform_fee_percent)
            setMinFee(data.min_platform_fee || "0.00")
            setMaxFee(data.max_platform_fee || "0.00")
            setFeePayer(data.fee_payer)
            setDisputeWindowDays(data.dispute_window_days.toString())
            setAutoReleaseDays(data.auto_release_days.toString())
            setSupportEmail(data.support_email || "")
            setWhatsappLink(data.whatsapp_link || "")
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const updateSettings = async (payload: any) => {
        setSaving(true)
        try {
            const res = await api.patch('/admin/settings/', payload)
            toast.success(res.data.message || "Updated successfully")
            fetchSettings()
            return true
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Update failed")
            return false
        } finally {
            setSaving(false)
        }
    }

    const handleSaveAll = async () => {
        const payload: any = {
            active_gateway: activeGateway,
            use_test_mode: testMode,
            platform_fee_percent: parseFloat(feePercent),
            min_platform_fee: parseFloat(minFee),
            max_platform_fee: parseFloat(maxFee),
            fee_payer: feePayer,
            dispute_window_days: parseInt(disputeWindowDays),
            auto_release_days: parseInt(autoReleaseDays),
            support_email: supportEmail,
            whatsapp_link: whatsappLink,
        }
        if (paystackPublic) payload.paystack_public_key = paystackPublic
        if (paystackSecret) payload.paystack_secret_key = paystackSecret
        if (flutterwavePublic) payload.flutterwave_public_key = flutterwavePublic
        if (flutterwaveSecret) payload.flutterwave_secret_key = flutterwaveSecret

        const success = await updateSettings(payload)
        if (success) {
            setPaystackPublic("")
            setPaystackSecret("")
            setFlutterwavePublic("")
            setFlutterwaveSecret("")
            setShowPaystackKeys(false)
            setShowFlutterwaveKeys(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    const selectClassName = "h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-none mb-2">Platform Settings</h1>
                    <p className="text-gray-500 font-medium">Configure payment gateways, fees, and platform rules</p>
                </div>
                <Button
                    onClick={handleSaveAll}
                    disabled={saving}
                    size="lg"
                    className="bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 border-none transition-all active:scale-95 h-14 px-8 uppercase tracking-widest text-xs"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                            Synchronizing...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-3" />
                            Commit All Changes
                        </>
                    )}
                </Button>
            </div>

            {/* Warning Alert */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-[1.5rem] p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-100 rounded-xl">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1">Critical Integrity Settings</h4>
                        <p className="text-sm text-gray-500 font-medium">
                            Changes to these parameters affect global transaction logic and financial calculations immediately. All modifications are logged in the immutable audit ledger.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8">
                {/* Payment Gateway */}
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden group">
                    <div className="h-1.5 bg-green-500" />
                    <CardHeader className="p-8 pb-4 relative">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                <CreditCard className="w-6 h-6 text-gray-900" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">Payment Gateway</CardTitle>
                                <CardDescription className="text-gray-500 font-medium">Configure payment processing and platform fees</CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={saving}
                            onClick={() => updateSettings({
                                active_gateway: activeGateway,
                                use_test_mode: testMode,
                                platform_fee_percent: parseFloat(feePercent),
                                min_platform_fee: parseFloat(minFee),
                                max_platform_fee: parseFloat(maxFee),
                                fee_payer: feePayer
                            })}
                            className="absolute top-8 right-8 text-green-600 hover:bg-green-50 font-bold rounded-xl h-10 px-4"
                        >
                            <Save className="w-4 h-4 mr-2" /> Quick Sync
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Active Gateway</Label>
                                    <div className="relative">
                                        <select
                                            value={activeGateway}
                                            onChange={(e) => setActiveGateway(e.target.value)}
                                            className="h-14 w-full rounded-2xl bg-gray-50 border-none px-4 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-green-500/20 appearance-none cursor-pointer"
                                            title="Active Payment Gateway"
                                        >
                                            <option value="paystack">🇳🇬 PAYSTACK GATEWAY</option>
                                            <option value="flutterwave">🌍 FLUTTERWAVE GLOBAL</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Environment</Label>
                                    <div className="relative">
                                        <select
                                            value={testMode ? "test" : "live"}
                                            onChange={(e) => setTestMode(e.target.value === "test")}
                                            className="h-14 w-full rounded-2xl bg-gray-50 border-none px-4 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-green-500/20 appearance-none cursor-pointer"
                                            title="Payment Environment"
                                        >
                                            <option value="test">🧪 SANDBOX TEST MODE</option>
                                            <option value="live">🚀 PRODUCTION LIVE</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Platform Commission (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={feePercent}
                                        onChange={(e) => setFeePercent(e.target.value)}
                                        className="h-14 rounded-2xl bg-gray-50 border-none transition-all focus-visible:ring-green-500 shadow-none font-bold text-gray-900"
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide px-1">Percentage fee charged per successful deal release</p>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Fee Obligation</Label>
                                    <div className="relative">
                                        <select
                                            value={feePayer}
                                            onChange={(e) => setFeePayer(e.target.value)}
                                            className="h-14 w-full rounded-2xl bg-gray-50 border-none px-4 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-green-500/20 appearance-none cursor-pointer"
                                            title="Fee Payer"
                                        >
                                            <option value="client">CLIENT PAYS FULL FEE</option>
                                            <option value="freelancer">FREELANCER ABSORBS FEE</option>
                                            <option value="split">SPLIT 50/50 OBLIGATION</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Minimum Platform Fee (₦)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={minFee}
                                        onChange={(e) => setMinFee(e.target.value)}
                                        className="h-14 rounded-2xl bg-gray-50 border-none transition-all focus-visible:ring-green-500 shadow-none font-bold text-gray-900"
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide px-1">Floor cap for platform revenue (0 = No Floor)</p>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Maximum Platform Fee (₦)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={maxFee}
                                        onChange={(e) => setMaxFee(e.target.value)}
                                        className="h-14 rounded-2xl bg-gray-50 border-none transition-all focus-visible:ring-green-500 shadow-none font-bold text-gray-900"
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide px-1">Ceiling cap for platform revenue (0 = Unlimited)</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* API Keys */}
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden group">
                    <div className="h-1.5 bg-blue-500" />
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                <Lock className="w-6 h-6 text-gray-900" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">Critical API Credentials</CardTitle>
                                <CardDescription className="text-gray-500 font-medium">Securely manage payment gateway authentication</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-2 space-y-8">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Paystack */}
                            <div className="space-y-6 p-8 bg-gray-50/50 rounded-3xl border border-gray-100 group/item hover:bg-white hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 uppercase tracking-tight text-sm">Paystack Vault</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">RSA Encrypted Storage</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPaystackKeys(!showPaystackKeys)}
                                        className="rounded-xl h-10 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-green-50 text-green-700"
                                    >
                                        {showPaystackKeys ? "Lock Vault" : "Manage Keys"}
                                    </Button>
                                </div>
                                {!showPaystackKeys && (
                                    <div className="space-y-4 font-mono text-xs">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Public Identifier</span>
                                            <span className="text-gray-900 bg-white p-3 rounded-xl border border-gray-50 truncate">{settings?.paystack_public_key || "UNCONFIGURED"}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secret Key (Redacted)</span>
                                            <span className="text-gray-900 bg-white p-3 rounded-xl border border-gray-50 truncate">••••••••••••••••••••••••••••••</span>
                                        </div>
                                    </div>
                                )}
                                {showPaystackKeys && (
                                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">PK_TEST_ / PK_LIVE_ </Label>
                                            <Input
                                                type="password"
                                                placeholder="pk_test_..."
                                                value={paystackPublic}
                                                onChange={(e) => setPaystackPublic(e.target.value)}
                                                className="h-12 rounded-2xl bg-white border-gray-100 font-mono text-xs shadow-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">SK_TEST_ / SK_LIVE_</Label>
                                            <Input
                                                type="password"
                                                placeholder="sk_test_..."
                                                value={paystackSecret}
                                                onChange={(e) => setPaystackSecret(e.target.value)}
                                                className="h-12 rounded-2xl bg-white border-gray-100 font-mono text-xs shadow-none"
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            disabled={saving}
                                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl uppercase tracking-widest text-[10px]"
                                            onClick={async () => {
                                                const success = await updateSettings({
                                                    paystack_public_key: paystackPublic,
                                                    paystack_secret_key: paystackSecret
                                                })
                                                if (success) {
                                                    setPaystackPublic("")
                                                    setPaystackSecret("")
                                                    setShowPaystackKeys(false)
                                                }
                                            }}
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Paystack Transition"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Flutterwave */}
                            <div className="space-y-6 p-8 bg-gray-50/50 rounded-3xl border border-gray-100 group/item hover:bg-white hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 uppercase tracking-tight text-sm">Flutterwave Hub</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Global Link Encryption</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFlutterwaveKeys(!showFlutterwaveKeys)}
                                        className="rounded-xl h-10 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-50 text-orange-700"
                                    >
                                        {showFlutterwaveKeys ? "Lock Vault" : "Manage Keys"}
                                    </Button>
                                </div>
                                {!showFlutterwaveKeys && (
                                    <div className="space-y-4 font-mono text-xs">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Public Identifier</span>
                                            <span className="text-gray-900 bg-white p-3 rounded-xl border border-gray-50 truncate">{settings?.flutterwave_public_key || "UNCONFIGURED"}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secret Key (Redacted)</span>
                                            <span className="text-gray-900 bg-white p-3 rounded-xl border border-gray-50 truncate">••••••••••••••••••••••••••••••</span>
                                        </div>
                                    </div>
                                )}
                                {showFlutterwaveKeys && (
                                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">FLWPUBK- ENVIRONMENT KEY</Label>
                                            <Input
                                                type="password"
                                                placeholder="FLWPUBK_TEST-..."
                                                value={flutterwavePublic}
                                                onChange={(e) => setFlutterwavePublic(e.target.value)}
                                                className="h-12 rounded-2xl bg-white border-gray-100 font-mono text-xs shadow-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">FLWSECK- ENVIRONMENT KEY</Label>
                                            <Input
                                                type="password"
                                                placeholder="FLWSECK_TEST-..."
                                                value={flutterwaveSecret}
                                                onChange={(e) => setFlutterwaveSecret(e.target.value)}
                                                className="h-12 rounded-2xl bg-white border-gray-100 font-mono text-xs shadow-none"
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            disabled={saving}
                                            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl uppercase tracking-widest text-[10px]"
                                            onClick={async () => {
                                                const success = await updateSettings({
                                                    flutterwave_public_key: flutterwavePublic,
                                                    flutterwave_secret_key: flutterwaveSecret
                                                })
                                                if (success) {
                                                    setFlutterwavePublic("")
                                                    setFlutterwaveSecret("")
                                                    setShowFlutterwaveKeys(false)
                                                }
                                            }}
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Flutterwave Transition"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Platform Rules */}
                <Card className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden group">
                    <div className="h-1.5 bg-purple-500" />
                    <CardHeader className="p-8 pb-4 relative">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                <SettingsIcon className="w-6 h-6 text-gray-900" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">Platform Governance</CardTitle>
                                <CardDescription className="text-gray-500 font-medium">Configure ecosystem logic and support protocols</CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={saving}
                            onClick={() => updateSettings({
                                dispute_window_days: parseInt(disputeWindowDays),
                                auto_release_days: parseInt(autoReleaseDays),
                                support_email: supportEmail,
                                whatsapp_link: whatsappLink
                            })}
                            className="absolute top-8 right-8 text-purple-600 hover:bg-purple-50 font-bold rounded-xl h-10 px-4"
                        >
                            <Save className="w-4 h-4 mr-2" /> Quick Sync
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8 pt-2 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Dispute Resolution Window (Days)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="365"
                                    value={disputeWindowDays}
                                    onChange={(e) => setDisputeWindowDays(e.target.value)}
                                    className="h-14 rounded-2xl bg-gray-50 border-none transition-all focus-visible:ring-purple-500 shadow-none font-bold text-gray-900"
                                />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide px-1">Window for opening disputes after submission</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Auto-Settlement Period (Days)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="365"
                                    value={autoReleaseDays}
                                    onChange={(e) => setAutoReleaseDays(e.target.value)}
                                    className="h-14 rounded-2xl bg-gray-50 border-none transition-all focus-visible:ring-purple-500 shadow-none font-bold text-gray-900"
                                />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide px-1">Days before escrow auto-releases to source</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Official Support Channel</Label>
                                <Input
                                    type="email"
                                    placeholder="support@dealnest.com"
                                    value={supportEmail}
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                    className="h-14 rounded-2xl bg-gray-50 border-none transition-all focus-visible:ring-purple-500 shadow-none font-bold text-gray-900"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-1">Escalation WhatsApp Bridge</Label>
                                <Input
                                    type="url"
                                    placeholder="https://wa.me/..."
                                    value={whatsappLink}
                                    onChange={(e) => setWhatsappLink(e.target.value)}
                                    className="h-14 rounded-2xl bg-gray-50 border-none transition-all focus-visible:ring-purple-500 shadow-none font-bold text-gray-900"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
