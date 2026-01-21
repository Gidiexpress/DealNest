"use client"

import { useState, useEffect } from "react"
import { Building2, Loader2, ChevronsUpDown, Check, Lock as LockIcon } from "lucide-react"
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
import { cn } from "@/lib/utils"

interface WithdrawModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    balance: string | number
    onSuccess?: () => void
}

export function WithdrawModal({ open, onOpenChange, balance, onSuccess }: WithdrawModalProps) {
    const [amount, setAmount] = useState("")
    const [selectedBank, setSelectedBank] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [accountName, setAccountName] = useState("")
    const [banks, setBanks] = useState<any[]>([])
    const [openBankList, setOpenBankList] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)

    // OTP Flow
    const [showOTPModal, setShowOTPModal] = useState(false)
    const [otp, setOtp] = useState("")
    const [pendingTransferCode, setPendingTransferCode] = useState("")
    const [verifyingOtp, setVerifyingOtp] = useState(false)

    const filteredBanks = banks.filter(bank =>
        bank.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Fetch banks when open
    useEffect(() => {
        if (open && banks.length === 0) {
            api.get("/payments/banks/").then(res => {
                if (res.data.status && res.data.data) {
                    const bankList = res.data.data;
                    bankList.unshift({ name: "TEST BANK (Providus - Use 9999999999)", code: "101", active: true });
                    setBanks(bankList)
                }
            }).catch(() => toast.error("Could not load banks"))
        }
    }, [open, banks.length])

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) < 100) {
            toast.error("Minimum withdrawal is ₦100")
            return
        }
        if (!selectedBank || accountNumber.length !== 10) {
            toast.error("Please select a bank and enter a valid 10-digit account number")
            return
        }
        if (parseFloat(amount) > parseFloat(balance.toString() || "0")) {
            toast.error("Insufficient balance")
            return
        }

        setLoading(true)
        try {
            const res = await api.post("/payments/withdraw/", {
                amount: amount,
                bank_code: selectedBank,
                account_number: accountNumber
            })

            if (res.data.status === 'success') {
                if (res.data.requires_otp) {
                    toast.info("Authentication Required", {
                        description: "We've sent an OTP to your phone. Please verify to complete the transfer.",
                    })
                    setPendingTransferCode(res.data.transfer_code)
                    setShowOTPModal(true)
                } else {
                    toast.success("Withdrawal initiated successfully!")
                    onOpenChange(false)
                    if (onSuccess) onSuccess()
                    resetForm()
                }
            } else {
                toast.error(res.data.error || "Withdrawal failed")
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Withdrawal failed")
        } finally {
            setLoading(false)
        }
    }

    const handleFinalizeWithdrawal = async () => {
        if (!otp || !pendingTransferCode) return
        setVerifyingOtp(true)
        try {
            const response = await api.post(`/payments/withdraw/finalize/`, {
                transfer_code: pendingTransferCode,
                otp: otp
            })

            if (response.data.status === 'success') {
                toast.success("Transfer Verified", {
                    description: "Funds have been successfully released.",
                })
                setShowOTPModal(false)
                onOpenChange(false)
                if (onSuccess) onSuccess()
                resetForm()
            } else {
                toast.error(response.data.error || "Verification Failed")
            }
        } catch (error: any) {
            toast.error("Verification Failed", {
                description: error.response?.data?.error || "Invalid OTP. Please try again.",
            })
        } finally {
            setVerifyingOtp(false)
        }
    }

    const resetForm = () => {
        setAmount("")
        setSelectedBank("")
        setAccountNumber("")
        setAccountName("")
        setOtp("")
        setPendingTransferCode("")
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none bg-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" /> Withdraw Funds
                        </DialogTitle>
                        <DialogDescription>
                            Transfer funds to your bank account. Available: ₦{parseFloat(balance.toString() || "0").toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="withdraw-amount" className="text-sm font-medium">Amount (₦)</Label>
                            <Input
                                id="withdraw-amount"
                                type="number"
                                placeholder="Enter amount (min ₦100)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="mt-2 h-12 rounded-xl"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Bank</Label>
                            <Button
                                variant="outline"
                                role="combobox"
                                onClick={() => setOpenBankList(true)}
                                className="mt-2 w-full justify-between h-12 rounded-xl text-left font-normal"
                            >
                                {selectedBank
                                    ? banks.find((bank) => bank.code === selectedBank)?.name
                                    : "Select your bank..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </div>
                        <div>
                            <Label htmlFor="account-number" className="text-sm font-medium">Account Number</Label>
                            <Input
                                id="account-number"
                                type="text"
                                placeholder="10-digit account number"
                                maxLength={10}
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                className="mt-2 h-12 rounded-xl"
                            />
                        </div>
                        {accountName && (
                            <div className="bg-green-50 p-3 rounded-xl text-sm text-green-700 font-medium">
                                ✓ {accountName}
                            </div>
                        )}
                        <Button
                            onClick={handleWithdraw}
                            disabled={loading || !selectedBank || accountNumber.length !== 10}
                            className="w-full h-12 bg-[#050b14] hover:bg-[#050b14]/90 text-white font-bold rounded-xl"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Building2 className="w-4 h-4 mr-2" />}
                            {loading ? "Processing..." : "Withdraw Funds"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bank Selection Inner Dialog */}
            <Dialog open={openBankList} onOpenChange={setOpenBankList}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none bg-white shadow-2xl z-[300]">
                    <DialogHeader>
                        <DialogTitle>Select Bank</DialogTitle>
                    </DialogHeader>
                    <div className="p-1">
                        <Input
                            placeholder="Search bank..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 mb-2"
                        />
                        <div className="max-h-[300px] overflow-y-auto space-y-1">
                            {filteredBanks.length === 0 ? (
                                <div className="py-6 text-center text-sm text-gray-500">No bank found.</div>
                            ) : (
                                filteredBanks.map((bank: any, i: number) => (
                                    <div
                                        key={`${bank.code}-${i}`}
                                        onClick={() => {
                                            setSelectedBank(bank.code)
                                            setOpenBankList(false)
                                        }}
                                        className={cn(
                                            "flex items-center px-2 py-3 text-sm cursor-pointer rounded-md hover:bg-gray-100 transition-colors",
                                            selectedBank === bank.code ? "bg-gray-100 font-medium" : ""
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedBank === bank.code ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {bank.name}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* OTP Verification Modal */}
            <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
                <DialogContent className="sm:max-w-sm rounded-[2rem] border-none bg-white shadow-2xl z-[300]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <LockIcon className="w-5 h-5 text-green-600" /> Verify Transfer
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-sm">
                            Enter the OTP sent to your phone to complete the withdrawal.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 space-y-4">
                        <Input
                            placeholder="Enter OTP Code"
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="h-12 rounded-xl text-center text-lg tracking-widest font-bold"
                        />
                        <Button
                            onClick={handleFinalizeWithdrawal}
                            disabled={verifyingOtp || otp.length < 4}
                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                        >
                            {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {verifyingOtp ? "Verifying..." : "Confirm & Send Funds"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
