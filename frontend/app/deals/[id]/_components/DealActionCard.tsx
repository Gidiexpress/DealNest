import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Wallet, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Deal } from "@/types";

interface DealActionCardProps {
    deal: Deal;
    isClient: boolean;
    isFreelancer: boolean;
    handleAction: (action: string) => void;
    actionLoading: boolean;
    setShowSubmitModal: (val: boolean) => void;
    setShowRevisionModal: (val: boolean) => void;
}

export function DealActionCard({
    deal,
    isClient,
    isFreelancer,
    handleAction,
    actionLoading,
    setShowSubmitModal,
    setShowRevisionModal
}: DealActionCardProps) {
    return (
        <Card className="border-none shadow-lg rounded-[1.5rem] bg-[#050b14] text-white overflow-hidden">
            <div className={`h-2 w-full animate-pulse ${deal.status === 'completed' ? 'bg-green-500' : 'bg-green-500'}`}></div>
            <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-green-500" />
                    Action Required
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
                {isClient && deal.status === 'created' && (
                    <>
                        <p className="text-sm text-gray-400">To start this deal, you need to fund it.</p>
                        <Button onClick={() => handleAction('fund')} disabled={actionLoading} className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-bold">
                            Fund Deal
                        </Button>
                    </>
                )}

                {isFreelancer && deal.status === 'created' && (
                    <div className="space-y-3 py-4 text-center">
                        <div className="w-16 h-16 bg-gray-100/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="font-bold text-gray-300">Waiting for Funding</h4>
                        <p className="text-xs text-gray-400 px-4">You have accepted the deal. Waiting for client to release funds before you can start.</p>
                    </div>
                )}

                {isFreelancer && deal.status === 'funded' && (
                    <>
                        <p className="text-sm text-gray-400">The client has funded this deal. Ready to start?</p>
                        <Button onClick={() => handleAction('start_work')} disabled={actionLoading} className="w-full h-12 bg-[#00d166] hover:bg-[#00d166]/90 text-black font-bold">
                            Start Work
                        </Button>
                    </>
                )}

                {isFreelancer && deal.status === 'in_progress' && (
                    <>
                        <p className="text-sm text-gray-400">Once completed, submit for approval.</p>
                        <Button onClick={() => setShowSubmitModal(true)} disabled={actionLoading} className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-bold">
                            Submit Work
                        </Button>
                    </>
                )}

                {isClient && deal.status === 'delivered' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                            <p className="text-sm font-bold text-green-400 mb-1">Freelancer has delivered!</p>
                            <p className="text-[11px] text-gray-400">Review the submission below and decide whether to approve or request changes.</p>
                        </div>
                        <Button onClick={() => handleAction('approve')} disabled={actionLoading} className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-bold text-sm shadow-lg shadow-green-500/20">
                            Approve & Release Funds
                        </Button>
                        <Button onClick={() => setShowRevisionModal(true)} disabled={actionLoading} variant="outline" className="w-full h-12 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-sm">
                            Request Revision
                            {deal.revision_count > 0 && <span className="ml-1 opacity-60">({deal.revision_count}/3)</span>}
                        </Button>
                        <Button onClick={() => handleAction('dispute')} disabled={actionLoading} variant="outline" className="w-full h-12 border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm">
                            Open Dispute
                        </Button>
                    </div>
                )}

                {isClient && deal.status === 'disputed' && (
                    <div className="space-y-3 animate-in zoom-in-95 duration-300">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <p className="text-sm font-bold text-red-400 mb-1">Dispute Under Review</p>
                            <p className="text-[11px] text-gray-300">Our team is investigating. You can still settle this by approving the delivery if an agreement is reached.</p>
                        </div>
                        <Button onClick={() => handleAction('approve')} disabled={actionLoading} className="w-full h-12 bg-[#00d166] hover:bg-[#00d166]/90 text-black font-bold text-sm">
                            Approve & Close Dispute
                        </Button>
                        <p className="text-[10px] text-center text-gray-400">Resolution may take up to 48 hours.</p>
                    </div>
                )}

                {isClient && deal.status === 'funded' && (
                    <div className="space-y-3 py-4 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-blue-500" />
                        </div>
                        <h4 className="font-bold text-blue-100">Deal Funded</h4>
                        <p className="text-xs text-gray-400 px-4">Funds are secured. Waiting for freelancer to start working on the deal.</p>
                    </div>
                )}

                {isClient && deal.status === 'in_progress' && (
                    <div className="space-y-3 py-4 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-blue-500 animate-pulse" />
                        </div>
                        <h4 className="font-bold text-blue-100">Work in Progress</h4>
                        <p className="text-xs text-gray-400 px-4">The freelancer is currently working on your deal. You'll be notified once they submit for review.</p>
                        <Button onClick={() => handleAction('dispute')} variant="ghost" className="text-red-400 text-xs mt-4">Report Issue</Button>
                    </div>
                )}

                {isFreelancer && deal.status === 'delivered' && (
                    <div className="space-y-3 py-4 text-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-green-500" />
                        </div>
                        <h4 className="font-bold text-green-100">Submitted</h4>
                        <p className="text-xs text-gray-400 px-4">Your work is under review by the client. They have up to 5 days to respond.</p>
                    </div>
                )}

                {isFreelancer && deal.status === 'disputed' && (
                    <div className="space-y-3 py-4 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                        </div>
                        <h4 className="font-bold text-red-100">Dispute Opened</h4>
                        <p className="text-xs text-gray-400 px-4">The client has opened a dispute. Please wait for an admin to contact you or discuss resolution in the chat.</p>
                    </div>
                )}

                {deal.status === 'completed' && (
                    <div className="text-center py-4 animate-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h4 className="font-bold text-green-400">Deal Completed</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Funds have been released.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
