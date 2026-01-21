"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Deal, Message } from "@/types"
import { MessageSquare } from "lucide-react"
import { toast } from "sonner"

// Components
import { DealHeader } from "./_components/DealHeader"
import { DealOverview } from "./_components/DealOverview"
import { DealActionCard } from "./_components/DealActionCard"
import { DealDiscussion } from "./_components/DealDiscussion"
import { DealSidebar } from "./_components/DealSidebar"
import { DealModals } from "./_components/DealModals"
import { renderAttachment } from "./_components/AttachmentRenderer"

export default function DealDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab')

    const [activeTab, setActiveTab] = useState(tabParam || "overview")
    const [deal, setDeal] = useState<Deal | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Modals & Editing State
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<Partial<Deal>>({})
    const [addingLink, setAddingLink] = useState(false)
    const [linkUrl, setLinkUrl] = useState("")
    const [linkName, setLinkName] = useState("")
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const [submissionLinks, setSubmissionLinks] = useState<{ url: string; label: string }[]>([{ url: "", label: "" }])
    const [submissionNotes, setSubmissionNotes] = useState("")
    const [submissionFiles, setSubmissionFiles] = useState<string[]>([])
    const [showRevisionModal, setShowRevisionModal] = useState(false)
    const [revisionFeedback, setRevisionFeedback] = useState("")
    const [showFundModal, setShowFundModal] = useState(false)
    const [initPaymentData, setInitPaymentData] = useState<any>(null)
    const [showDisputeModal, setShowDisputeModal] = useState(false)
    const [disputeReason, setDisputeReason] = useState("")

    const fetchMessages = async () => {
        try {
            const msgRes = await api.get(`/deals/${id}/messages/`)
            setMessages(msgRes.data)
        } catch (err) { }
    }

    const fetchDeal = async () => {
        try {
            const [userRes, dealRes] = await Promise.all([
                api.get("/auth/me/"),
                api.get(`/deals/${id}/`)
            ])
            setUser(userRes.data)
            setDeal(dealRes.data)
            fetchMessages()
        } catch (err) {
            console.error("Error fetching deal:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDeal()
        const interval = setInterval(fetchMessages, 5000)
        return () => clearInterval(interval)
    }, [id])

    useEffect(() => {
        if (tabParam) setActiveTab(tabParam)
        const trxref = searchParams.get('trxref') || searchParams.get('reference')
        if (trxref && deal?.status === 'created') {
            handleVerifyPayment(trxref)
        }
    }, [tabParam, searchParams, deal?.status])

    const handleVerifyPayment = async (reference: string) => {
        const toastId = toast.loading("Verifying payment...")
        try {
            await api.get(`/payments/verify/?reference=${reference}`)
            toast.success("Payment verified!", { id: toastId })
            fetchDeal()
            const newUrl = window.location.pathname
            window.history.replaceState({}, '', newUrl)
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Verification failed", { id: toastId })
        }
    }

    const handleAction = async (action: string) => {
        setActionLoading(true)
        try {
            if (action === 'fund') {
                const { data } = await api.post(`/deals/${id}/fund/`)
                if (data.status === false) {
                    toast.error(data.message || "Failed to initialize payment")
                    return
                }
                setInitPaymentData(data)
                setShowFundModal(true)
            } else if (action === 'delete') {
                if (!confirm("Are you sure you want to delete this deal?")) return;
                await api.delete(`/deals/${id}/`)
                router.push('/deals')
            } else if (action === 'request_revision') {
                await api.post(`/deals/${id}/request_revision/`, { feedback: revisionFeedback })
                setRevisionFeedback("")
                setShowRevisionModal(false)
                fetchDeal()
            } else if (action === 'dispute') {
                setShowDisputeModal(true)
            } else {
                await api.post(`/deals/${id}/${action}/`)
                fetchDeal()
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleWalletPayment = async () => {
        setActionLoading(true)
        const toastId = toast.loading("Processing wallet payment...")
        try {
            const res = await api.post(`/deals/${id}/fund/`, { payment_method: 'wallet' })
            if (res.data.status === 'success') {
                toast.success(res.data.message, { id: toastId })
                setShowFundModal(false)
                fetchDeal()
            } else {
                toast.error(res.data.error || "Wallet payment failed", { id: toastId })
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Wallet payment failed", { id: toastId })
        } finally {
            setActionLoading(false)
        }
    }

    const handleSubmitWork = async () => {
        setActionLoading(true)
        try {
            await api.post(`/deals/${id}/deliver/`, {
                links: submissionLinks.filter(l => l.url),
                files: submissionFiles,
                notes: submissionNotes
            })
            fetchDeal()
            setShowSubmitModal(false)
            setSubmissionLinks([{ url: "", label: "" }])
            setSubmissionFiles([])
            setSubmissionNotes("")
            toast.success("Work submitted successfully!")
        } catch (err: any) {
            toast.error("Submission failed")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDispute = async () => {
        if (!disputeReason.trim()) return;
        setActionLoading(true)
        try {
            await api.post(`/deals/${id}/dispute/`, { reason: disputeReason })
            fetchDeal()
            setShowDisputeModal(false)
            setDisputeReason("")
            toast.success("Dispute opened successfully.")
        } catch (err: any) {
            toast.error("Failed to open dispute")
        } finally {
            setActionLoading(false)
        }
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const res = await api.post(`/deals/${id}/messages/`, { message: newMessage })
            setMessages([...messages, res.data])
            setNewMessage("")
        } catch (err) { }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'chat' | 'deal') => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        try {
            const res = await api.post('/upload/', formData);
            if (target === 'chat') {
                const chatRes = await api.post(`/deals/${id}/messages/`, {
                    message: "Sent an attachment",
                    files: [res.data.url]
                })
                setMessages([...messages, chatRes.data])
            } else if (deal) {
                const updated = [...(deal.attachments || []), { type: 'file', url: res.data.url, name: res.data.name }];
                await api.patch(`/deals/${id}/`, { attachments: updated });
                fetchDeal();
            }
        } catch (err) { toast.error("Upload failed") }
    }

    const handleAddLink = async () => {
        if (!linkUrl || !deal) return;
        const newAtt = {
            type: 'link' as const,
            url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
            name: linkName || linkUrl
        };
        const updated = [...(deal.attachments || []), newAtt];
        await api.patch(`/deals/${id}/`, { attachments: updated });
        fetchDeal();
        setAddingLink(false);
        setLinkUrl(""); setLinkName("");
    }

    const saveEdit = async () => {
        try {
            await api.patch(`/deals/${id}/`, editData);
            setIsEditing(false);
            fetchDeal();
        } catch (err) { toast.error("Update failed") }
    }

    const copyLink = () => {
        if (deal?.unique_shareable_url) {
            const url = `${window.location.origin}/d/${deal.unique_shareable_url}`
            navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (loading) return <div className="p-8 text-center text-green-600 animate-pulse">Loading deal details...</div>
    if (!deal || !user) return <div className="p-8 text-center">Deal not found or not logged in.</div>

    const isClient = user.id === deal.client.id
    const isFreelancer = user.id === deal.freelancer?.id

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <DealHeader
                deal={deal}
                isClient={isClient}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                setEditData={setEditData}
                handleAction={handleAction}
                saveEdit={saveEdit}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100 rounded-xl">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="discussion" className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Discussion
                                {messages.length > 0 && <span className="bg-green-500 text-white text-[10px] px-1.5 rounded-full">{messages.length}</span>}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <DealOverview
                                deal={deal} isEditing={isEditing} editData={editData} setEditData={setEditData}
                                isFreelancer={isFreelancer} isClient={isClient} mounted={mounted}
                                addingLink={addingLink} linkUrl={linkUrl} linkName={linkName}
                                setAddingLink={setAddingLink} setLinkUrl={setLinkUrl} setLinkName={setLinkName}
                                handleAddLink={handleAddLink} handleFileUpload={handleFileUpload} renderAttachment={renderAttachment}
                            />
                        </TabsContent>

                        <TabsContent value="discussion">
                            <DealDiscussion
                                messages={messages} user={user} mounted={mounted}
                                newMessage={newMessage} setNewMessage={setNewMessage}
                                handleSendMessage={handleSendMessage} handleFileUpload={handleFileUpload}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <DealActionCard
                        deal={deal} isClient={isClient} isFreelancer={isFreelancer}
                        handleAction={handleAction} actionLoading={actionLoading}
                        setShowSubmitModal={setShowSubmitModal} setShowRevisionModal={setShowRevisionModal}
                    />
                    <DealSidebar deal={deal} copyLink={copyLink} copied={copied} />
                </div>
            </div>

            <DealModals
                deal={deal} user={user}
                showFundModal={showFundModal} setShowFundModal={setShowFundModal}
                initPaymentData={initPaymentData} handleWalletPayment={handleWalletPayment}
                showSubmitModal={showSubmitModal} setShowSubmitModal={setShowSubmitModal}
                submissionLinks={submissionLinks} setSubmissionLinks={setSubmissionLinks}
                submissionNotes={submissionNotes} setSubmissionNotes={setSubmissionNotes}
                submissionFiles={submissionFiles} handleSubmissionFileUpload={(e) => handleFileUpload(e, 'chat')}
                handleSubmitWork={handleSubmitWork}
                showRevisionModal={showRevisionModal} setShowRevisionModal={setShowRevisionModal}
                revisionFeedback={revisionFeedback} setRevisionFeedback={setRevisionFeedback}
                handleAction={handleAction}
                showDisputeModal={showDisputeModal} setShowDisputeModal={setShowDisputeModal}
                disputeReason={disputeReason} setDisputeReason={setDisputeReason}
                handleDispute={handleDispute} actionLoading={actionLoading}
            />
        </div>
    )
}
