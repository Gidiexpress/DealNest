import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ShieldCheck, Send, Edit2, Wallet, CreditCard, ChevronRight, Paperclip } from "lucide-react";
import { Deal, User } from "@/types";

interface DealModalsProps {
    deal: Deal;
    user: User | null;
    // Funding
    showFundModal: boolean;
    setShowFundModal: (val: boolean) => void;
    initPaymentData: any;
    handleWalletPayment: () => void;
    // Submission
    showSubmitModal: boolean;
    setShowSubmitModal: (val: boolean) => void;
    submissionLinks: { url: string; label: string }[];
    setSubmissionLinks: (links: any) => void;
    submissionNotes: string;
    setSubmissionNotes: (val: string) => void;
    submissionFiles: string[];
    handleSubmissionFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmitWork: () => void;
    // Revision
    showRevisionModal: boolean;
    setShowRevisionModal: (val: boolean) => void;
    revisionFeedback: string;
    setRevisionFeedback: (val: string) => void;
    handleAction: (action: string) => void;
    // Dispute
    showDisputeModal: boolean;
    setShowDisputeModal: (val: boolean) => void;
    disputeReason: string;
    setDisputeReason: (val: string) => void;
    handleDispute: () => void;
    // Common
    actionLoading: boolean;
}

export function DealModals({
    deal,
    user,
    showFundModal,
    setShowFundModal,
    initPaymentData,
    handleWalletPayment,
    showSubmitModal,
    setShowSubmitModal,
    submissionLinks,
    setSubmissionLinks,
    submissionNotes,
    setSubmissionNotes,
    submissionFiles,
    handleSubmissionFileUpload,
    handleSubmitWork,
    showRevisionModal,
    setShowRevisionModal,
    revisionFeedback,
    setRevisionFeedback,
    handleAction,
    showDisputeModal,
    setShowDisputeModal,
    disputeReason,
    setDisputeReason,
    handleDispute,
    actionLoading
}: DealModalsProps) {
    return (
        <>
            {/* Funding Modal */}
            <Dialog open={showFundModal} onOpenChange={setShowFundModal}>
                <DialogContent className="sm:max-w-md bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="p-8 bg-[#050b14] text-white shrink-0">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-[#00d166]" /> Complete Funding
                        </DialogTitle>
                        <p className="text-sm text-gray-400 mt-2">Secure your funds in DN-Escrow. Funds are only released when you approve the work.</p>
                    </DialogHeader>
                    <div className="p-8 space-y-6 overflow-y-auto flex-1">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total to Pay</p>
                                <p className="text-3xl font-black text-gray-900">₦{initPaymentData?.breakdown?.total_to_pay?.toLocaleString() || '...'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase mb-1 inline-block">Secure</p>
                                <p className="text-xs text-gray-400 block italic">Includes BNPlatform Fees</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-gray-700 font-bold flex items-center gap-2 uppercase tracking-wider text-[10px]">Select Payment Method</Label>

                            <div className="p-4 rounded-2xl border-2 border-[#00d166]/20 bg-[#00d166]/5 hover:bg-[#00d166]/10 transition-all cursor-pointer flex justify-between items-center"
                                onClick={handleWalletPayment}
                            >
                                <div className="flex gap-3 items-center">
                                    <div className="w-10 h-10 bg-[#00d166]/20 rounded-full flex items-center justify-center">
                                        <Wallet className="w-5 h-5 text-[#00d166]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Pay from Wallet</p>
                                        <p className="text-[10px] text-gray-500">Available: ₦{parseFloat(user?.balance || "0").toLocaleString()}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>

                            <div className="p-4 rounded-2xl border-2 border-blue-500/10 bg-blue-50/30 hover:bg-blue-50/50 transition-all cursor-pointer flex justify-between items-center"
                                onClick={() => {
                                    if (initPaymentData?.data?.authorization_url) window.location.href = initPaymentData.data.authorization_url;
                                    else if (initPaymentData?.data?.link) window.location.href = initPaymentData.data.link;
                                }}
                            >
                                <div className="flex gap-3 items-center">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Pay with Card / Bank</p>
                                        <p className="text-[10px] text-gray-500">Fast & secure via {initPaymentData?.data?.gateway || 'Paystack'}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Submit Work Modal */}
            <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
                <DialogContent className="sm:max-w-md bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="p-8 bg-[#050b14] text-white shrink-0">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Send className="w-6 h-6 text-green-500" /> Submit Your Work
                        </DialogTitle>
                        <p className="text-sm text-gray-400 mt-2">Submit your deliverables for the client to review.</p>
                    </DialogHeader>
                    <div className="p-8 space-y-6 overflow-y-auto flex-1">
                        <div className="space-y-4">
                            <Label className="text-gray-700 font-bold flex items-center gap-2 uppercase tracking-wider text-[10px]">Demo Links (e.g. GitHub, Drive)</Label>
                            {submissionLinks.map((link, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        placeholder="Label (e.g. Website)"
                                        className="w-1/3 text-sm h-11 rounded-xl"
                                        value={link.label}
                                        onChange={(e) => {
                                            const newLinks = [...submissionLinks];
                                            newLinks[idx].label = e.target.value;
                                            setSubmissionLinks(newLinks);
                                        }}
                                    />
                                    <Input
                                        placeholder="URL (https://...)"
                                        className="flex-1 text-sm h-11 rounded-xl"
                                        value={link.url}
                                        onChange={(e) => {
                                            const newLinks = [...submissionLinks];
                                            newLinks[idx].url = e.target.value;
                                            setSubmissionLinks(newLinks);
                                        }}
                                    />
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" className="text-blue-500" onClick={() => setSubmissionLinks([...submissionLinks, { url: "", label: "" }])}>
                                + Add another link
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-gray-700 font-bold flex items-center gap-2 uppercase tracking-wider text-[10px]">Delivery Notes</Label>
                            <Textarea
                                placeholder="Explain what has been delivered..."
                                className="min-h-[100px] rounded-2xl resize-none p-4 bg-gray-50 border-gray-100"
                                value={submissionNotes}
                                onChange={(e) => setSubmissionNotes(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <input type="file" id="submission-file" className="hidden" aria-label="Upload submission file" onChange={handleSubmissionFileUpload} />
                            <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-2 border-gray-200" onClick={() => (document.getElementById('submission-file') as HTMLInputElement)?.click()}>
                                <Paperclip className="w-4 h-4 mr-2" /> {submissionFiles.length > 0 ? `${submissionFiles.length} File(s) attached` : 'Upload Documents (PDF, ZIP...)'}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-gray-50 flex gap-3 shrink-0">
                        <Button variant="ghost" onClick={() => setShowSubmitModal(false)} className="flex-1 h-12">Cancel</Button>
                        <Button onClick={handleSubmitWork} className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl" disabled={actionLoading}>
                            {actionLoading ? 'Submitting...' : 'Submit Work'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Revision Modal */}
            <Dialog open={showRevisionModal} onOpenChange={setShowRevisionModal}>
                <DialogContent className="sm:max-w-md bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="p-8 bg-blue-600 text-white shrink-0">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Edit2 className="w-6 h-6" /> Request Revision
                        </DialogTitle>
                        <p className="text-sm text-blue-100 mt-2">Explain what needs to be changed in the current delivery.</p>
                    </DialogHeader>
                    <div className="p-8 space-y-4 flex-1">
                        <div className="space-y-2">
                            <Label htmlFor="revision-feedback" className="text-sm font-bold text-gray-700">Detailed Feedback</Label>
                            <Textarea
                                id="revision-feedback"
                                placeholder="Please list specific changes needed..."
                                value={revisionFeedback}
                                onChange={(e) => setRevisionFeedback(e.target.value)}
                                className="min-h-[150px] rounded-2xl border-gray-100 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none p-4"
                            />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800 leading-relaxed">Your feedback will be shared with the freelancer to guide their next submission.</p>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-3 shrink-0">
                        <Button variant="ghost" onClick={() => setShowRevisionModal(false)} className="flex-1 h-12 rounded-xl text-gray-400 hover:bg-gray-50">Cancel</Button>
                        <Button onClick={() => handleAction('request_revision')} disabled={actionLoading || !revisionFeedback.trim()} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 font-bold">
                            {actionLoading ? "Sending..." : "Send Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dispute Modal */}
            <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
                <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-0 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-gray-900">Open a Dispute</DialogTitle>
                        <p className="text-gray-500 text-sm mt-2">Please explain why you are opening a dispute. Our team will review this and get back to you.</p>
                    </DialogHeader>
                    <div className="p-8 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="dispute-reason" className="text-sm font-bold text-gray-700">Reason for Dispute</Label>
                            <Textarea
                                id="dispute-reason"
                                placeholder="Describe the issue in detail..."
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                className="min-h-[120px] rounded-2xl border-gray-100 bg-gray-50 focus:ring-red-500 focus:border-red-500 transition-all resize-none p-4"
                            />
                        </div>
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Fair Resolution:</strong> We will review chat history and deliverables. Try to resolve issues through chat first!
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
                        <Button variant="ghost" onClick={() => setShowDisputeModal(false)} className="flex-1 h-12 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</Button>
                        <Button onClick={handleDispute} disabled={actionLoading || !disputeReason.trim()} className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 font-bold transition-all">
                            {actionLoading ? "Processing..." : "Submit Dispute"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
