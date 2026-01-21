"use client"

import { useState } from "react"
import { Wallet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DepositModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    callbackUrl?: string
}

export function DepositModal({ open, onOpenChange, callbackUrl }: DepositModalProps) {
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) < 100) {
            toast.error("Minimum deposit is ₦100")
            return
        }

        setLoading(true)
        try {
            const res = await api.post("/payments/deposit/initiate/", {
                amount: amount,
                callback_url: callbackUrl || window.location.href
            })

            if (res.data.status && res.data.data?.authorization_url) {
                // Redirect to Paystack
                window.location.href = res.data.data.authorization_url
            } else {
                toast.error(res.data.message || "Could not initialize deposit")
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Deposit failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl border-none bg-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-green-600" /> Deposit Funds
                    </DialogTitle>
                    <DialogDescription>
                        Add funds to your DealNest wallet via Paystack.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="deposit-amount" className="text-sm font-medium">Amount (₦)</Label>
                        <Input
                            id="deposit-amount"
                            type="number"
                            placeholder="Enter amount (min ₦100)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-2 h-12 rounded-xl"
                        />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500">
                        You will be redirected to Paystack to complete your payment securely.
                    </div>
                    <Button
                        onClick={handleDeposit}
                        disabled={loading}
                        className="w-full h-12 bg-[#00d166] hover:bg-[#00d166]/90 text-black font-bold rounded-xl"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                        {loading ? "Processing..." : "Proceed to Payment"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
