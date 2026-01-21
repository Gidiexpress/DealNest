"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Shield, CreditCard, CheckCircle, AlertTriangle, Building, Save } from "lucide-react"
import { toast } from "sonner"
import { DepositModal } from "@/components/wallet/DepositModal"
import { WithdrawModal } from "@/components/wallet/WithdrawModal"

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("profile")

    // Wallet Modals state
    const [showDepositModal, setShowDepositModal] = useState(false)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)

    // Form States
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        phone_number: "",
        bank_name: "",
        bank_account: "",
        bank_account_name: "",
    })

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            const { data } = await api.get("/auth/me/")
            setUser(data)
            setFormData({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                bio: data.bio || "",
                phone_number: data.phone_number || "",
                bank_name: data.bank_name || "",
                bank_account: data.bank_account || "",
                bank_account_name: data.bank_account_name || "",
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data } = await api.patch("/auth/me/", formData)
            setUser(data)
            toast.success("Profile updated successfully")
        } catch (err) {
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    const handleVerifyEmail = async () => {
        setSaving(true)
        try {
            await api.post('/users/verify_email/')
            fetchUser()
            toast.success("Email verified successfully!")
        } catch (err) {
            toast.error("Verification failed. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8">Loading settings...</div>

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>

            <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white p-1 rounded-xl border border-gray-100">
                    <TabsTrigger value="profile" className="rounded-lg gap-2 data-[state=active]:bg-gray-100"><User className="w-4 h-4" /> Profile</TabsTrigger>
                    <TabsTrigger value="verification" className="rounded-lg gap-2 data-[state=active]:bg-gray-100"><Shield className="w-4 h-4" /> Verification</TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-lg gap-2 data-[state=active]:bg-gray-100"><CreditCard className="w-4 h-4" /> Wallet & Billing</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile">
                    <Card className="border-none shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your public profile details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Bio</Label>
                                <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="h-24" placeholder="Tell us about yourself..." />
                            </div>

                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-500">
                                    {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* VERIFICATION TAB */}
                <TabsContent value="verification">
                    <Card className="border-none shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle>Identity Verification (KYC)</CardTitle>
                            <CardDescription>Verify your identity to unlock higher limits and build trust.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${user.email_verified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {user.email_verified ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Email Verification</h4>
                                        <p className="text-sm text-gray-500">{user.email_verified ? `Verified as ${user.email}` : "Your email is not verified yet."}</p>
                                    </div>
                                </div>
                                {!user.email_verified && (
                                    <Button onClick={handleVerifyEmail} disabled={saving} size="sm" variant="outline">Verify Now</Button>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${user.kyc_status === 'full' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Identity Document</h4>
                                        <p className="text-sm text-gray-500">{user.kyc_status === 'full' ? "ID Verified" : "Upload National ID / Passport"}</p>
                                    </div>
                                </div>
                                {user.kyc_status !== 'full' && (
                                    <Button disabled size="sm" variant="outline">Coming Soon</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BILLING TAB */}
                <TabsContent value="billing">
                    <div className="grid gap-6">
                        {/* Wallet Card */}
                        <Card className="bg-[#050b14] text-white border-none shadow-xl rounded-xl overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-gray-400 font-medium mb-1">Total Balance</p>
                                        <h2 className="text-4xl font-bold text-white">₦{user.balance ? parseFloat(user.balance).toLocaleString() : '0.00'}</h2>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-xl">
                                        <CreditCard className="w-6 h-6 text-green-400" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => setShowDepositModal(true)}
                                        className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold h-12"
                                    >
                                        Add Funds
                                    </Button>
                                    <Button
                                        onClick={() => setShowWithdrawModal(true)}
                                        variant="outline"
                                        className="flex-1 border-white/20 text-white hover:bg-white/10 h-12"
                                    >
                                        Withdraw
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Bank Details */}
                        <Card className="border-none shadow-sm rounded-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" /> Bank Details</CardTitle>
                                <CardDescription>For withdrawals. Ensure name matches your ID.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bank Name</Label>
                                        <Input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} placeholder="e.g. GTBank" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Account Number</Label>
                                        <Input value={formData.bank_account} onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })} placeholder="0123456789" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Name</Label>
                                    <Input value={formData.bank_account_name} onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })} />
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <Button onClick={handleSave} disabled={saving} variant="secondary">Update Bank Info</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Wallet Modals */}
            <DepositModal
                open={showDepositModal}
                onOpenChange={setShowDepositModal}
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
