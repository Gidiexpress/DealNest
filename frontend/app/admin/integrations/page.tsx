"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    Save,
    Shield,
    Mail,
    MessageSquare,
    Cloud,
    CreditCard,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    XCircle
} from "lucide-react"
import { toast } from "sonner"

interface BetterIntegration {
    id: number
    service: string
    service_name: string
    public_key: string
    secret_key: string
    is_active: boolean
    config: any
    updated_at: string
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<BetterIntegration[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [formData, setFormData] = useState<Record<string, any>>({})

    const fetchIntegrations = async () => {
        try {
            const res = await api.get("/admin/integrations/")
            setIntegrations(res.data)
            const initialData: Record<string, any> = {}
            res.data.forEach((int: BetterIntegration) => {
                initialData[`${int.service}_public`] = ""
                initialData[`${int.service}_secret`] = ""
                initialData[`${int.service}_active`] = int.is_active
            })
            setFormData(initialData)
        } catch (error) {
            toast.error("Failed to load integrations")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIntegrations()
    }, [])

    const handleUpdate = async (service: string) => {
        setSaving(service)
        try {
            const data: any = {
                service,
                is_active: formData[`${service}_active`]
            }
            if (formData[`${service}_public`]) data.public_key = formData[`${service}_public`]
            if (formData[`${service}_secret`]) data.secret_key = formData[`${service}_secret`]

            await api.patch("/admin/integrations/", data)
            toast.success(`${service.toUpperCase()} updated successfully`)
            fetchIntegrations()
        } catch (error) {
            toast.error(`Failed to update ${service}`)
        } finally {
            setSaving(null)
        }
    }

    const toggleActive = (service: string) => {
        setFormData(prev => ({ ...prev, [`${service}_active`]: !prev[`${service}_active`] }))
    }

    const getIcon = (service: string) => {
        switch (service) {
            case 'resend': return <Mail className="w-5 h-5 text-indigo-500" />
            case 'termii': return <MessageSquare className="w-5 h-5 text-emerald-500" />
            case 'cloudinary': return <Cloud className="w-5 h-5 text-sky-500" />
            case 'paystack': return <CreditCard className="w-5 h-5 text-blue-600" />
            case 'flutterwave': return <CreditCard className="w-5 h-5 text-orange-500" />
            default: return <Shield className="w-5 h-5" />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-none mb-2">
                    Services Hub
                </h1>
                <p className="text-gray-500 font-medium">
                    Configure and monitor third-party connections powering the platform.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {integrations.map((integration) => (
                    <Card key={integration.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300 rounded-[1.5rem]">
                        <div className={`h-1.5 ${formData[`${integration.service}_active`] ? 'bg-green-500' : 'bg-gray-100'}`} />
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                        {getIcon(integration.service)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-gray-900">{integration.service_name}</CardTitle>
                                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">
                                            Last Updated: {new Date(integration.updated_at).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <Badge
                                        variant={integration.is_active ? "outline" : "secondary"}
                                        className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase shadow-none border-none ${integration.is_active ? 'text-green-700 bg-green-50' : 'text-gray-400 bg-gray-50'}`}
                                    >
                                        {integration.is_active ? "CONNECTED" : "DISCONNECTED"}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleActive(integration.service)}
                                        className={`h-8 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${formData[`${integration.service}_active`] ? 'text-rose-600 hover:bg-rose-50' : 'text-green-600 hover:bg-green-50'}`}
                                    >
                                        {formData[`${integration.service}_active`] ? "Disable Link" : "Enable Link"}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Public Gateway Key</Label>
                                        <span className="text-[10px] font-mono text-gray-300 tracking-tighter uppercase">{integration.public_key ? '••••' + integration.public_key.slice(-4) : 'NOT SET'}</span>
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Paste new public key..."
                                        value={formData[`${integration.service}_public`]}
                                        onChange={(e) => setFormData(prev => ({ ...prev, [`${integration.service}_public`]: e.target.value }))}
                                        className="h-12 rounded-2xl bg-gray-50 border-none transition-all focus-visible:ring-green-500 shadow-none placeholder:text-gray-300"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Secret Authentication Key</Label>
                                        <span className="text-[10px] font-mono text-gray-300 tracking-tighter uppercase">{integration.secret_key ? '••••' + integration.secret_key.slice(-4) : 'NOT SET'}</span>
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Paste new secret key..."
                                        value={formData[`${integration.service}_secret`]}
                                        onChange={(e) => setFormData(prev => ({ ...prev, [`${integration.service}_secret`]: e.target.value }))}
                                        className="h-12 rounded-2xl bg-gray-50 border-none transition-all focus-visible:ring-green-500 shadow-none placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={() => handleUpdate(integration.service)}
                                disabled={saving === integration.service}
                                className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 border-none transition-all active:scale-95 text-xs uppercase tracking-widest"
                            >
                                {saving === integration.service ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-3" />
                                        Syncing Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-3" />
                                        Commit Configuration
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm bg-[#050b14] text-white overflow-hidden relative rounded-[1.5rem]">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Shield className="w-48 h-48" />
                </div>
                <CardContent className="p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <AlertCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold uppercase tracking-tight">Security & Encryption</h3>
                        </div>
                        <p className="text-gray-400 font-medium max-w-xl leading-relaxed text-sm">
                            Platform credentials are stored using AES-256 encryption at rest.
                            Every modification is recorded in our <span className="text-white font-bold underline decoration-green-500 decoration-2 underline-offset-4 cursor-help" title="Audit logs track every change">Audit Ledger</span> to ensure strict compliance and accountability.
                        </p>
                    </div>
                    <Button variant="secondary" className="h-16 px-12 rounded-2xl font-bold text-gray-900 bg-white hover:bg-gray-50 shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest shrink-0">
                        Integration Docs
                        <ExternalLink className="w-5 h-5 ml-4 opacity-30" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
