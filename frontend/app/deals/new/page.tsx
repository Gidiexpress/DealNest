"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { JobType } from "@/types"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CreateDealPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [jobType, setJobType] = useState("")
    const [deadline, setDeadline] = useState("")
    const [requirements, setRequirements] = useState("")
    const [jobTypes, setJobTypes] = useState<JobType[]>([])
    const [loading, setLoading] = useState(false)

    // Attachments
    const [attachments, setAttachments] = useState<Array<{ type: 'file' | 'link', url: string, name: string }>>([])
    const [addingLink, setAddingLink] = useState(false)
    const [linkUrl, setLinkUrl] = useState("")
    const [linkName, setLinkName] = useState("")

    useEffect(() => {
        // Fetch job types (mock for now if API not ready, or actual)
        // For MVP we can just use hardcoded if backend is empty
        const types = [
            { id: 1, name: 'Web Development', slug: 'web-dev' },
            { id: 2, name: 'Graphic Design', slug: 'design' },
            { id: 3, name: 'Writing', slug: 'writing' },
            { id: 4, name: 'Marketing', slug: 'marketing' }
        ]
        setJobTypes(types as any)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await api.post("/deals/", {
                title,
                description,
                amount: parseFloat(amount),
                job_type_id: jobType,
                deadline: deadline || null,
                requirements,
                attachments
            })
            toast.success("Deal created successfully!")
            router.push(`/deals/${data.id}`)
        } catch (err: any) {
            const message = err.response?.data?.error || "Failed to create deal"
            toast.error(message)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <Link href="/dashboard" className="hover:text-green-600 transition-colors">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="font-semibold text-gray-900">New Deal</span>
            </div>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Create New Deal</h1>
            </div>

            <Card className="border-none shadow-lg rounded-[1.5rem] bg-white overflow-hidden">
                <div className="h-2 bg-green-500 w-full"></div>
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl text-gray-800">Deal Details</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-gray-700 font-medium">Deal Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. E-commerce Website Redesign"
                                required
                                className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 bg-gray-50/50"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-gray-700 font-medium">Amount (₦)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="50000"
                                    required
                                    className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 bg-gray-50/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-gray-700 font-medium">Job Category</Label>
                                <Select onValueChange={setJobType} required>
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-green-500 bg-gray-50/50">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobTypes.map(type => (
                                            <SelectItem key={type.id} value={String(type.id)}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="deadline" className="text-gray-700 font-medium">Deadline (Optional)</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="h-12 rounded-xl border-gray-200 focus:border-green-500 bg-gray-50/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the deal deliverables and context..."
                                required
                                className="min-h-[120px] rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 bg-gray-50/50 resize-y p-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements" className="text-gray-700 font-medium">Key Requirements / Deliverables</Label>
                            <Textarea
                                id="requirements"
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                placeholder="- Responsive design&#10;- SEO Optimization&#10;- Fast load times"
                                className="min-h-[120px] rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 bg-gray-50/50 resize-y p-4 font-mono text-sm"
                            />
                        </div>

                        {/* Attachments Section */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <Label className="text-gray-700 font-medium">Deal Attachments (Optional)</Label>
                                <div className="flex gap-2">
                                    {!addingLink ? (
                                        <>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="deal-file-upload"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        if (!e.target.files?.[0]) return;
                                                        const file = e.target.files[0];
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        try {
                                                            const uploadRes = await api.post('/upload/', formData, {
                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                            });
                                                            setAttachments([...attachments, {
                                                                type: 'file',
                                                                url: uploadRes.data.url,
                                                                name: uploadRes.data.name
                                                            }]);
                                                            toast.success(`File "${file.name}" uploaded successfully!`)
                                                        } catch (err) {
                                                            toast.error("Upload failed")
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById('deal-file-upload')?.click()}
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    Add File
                                                </Button>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setAddingLink(true)}
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                Add Link
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
                                            <Input
                                                placeholder="URL e.g. github.com"
                                                className="h-8 w-40 text-xs"
                                                value={linkUrl}
                                                onChange={(e) => setLinkUrl(e.target.value)}
                                            />
                                            <Input
                                                placeholder="Name (optional)"
                                                className="h-8 w-32 text-xs"
                                                value={linkName}
                                                onChange={(e) => setLinkName(e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-8"
                                                onClick={() => {
                                                    if (linkUrl) {
                                                        setAttachments([...attachments, {
                                                            type: 'link',
                                                            url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
                                                            name: linkName || linkUrl
                                                        }]);
                                                        setLinkUrl("");
                                                        setLinkName("");
                                                        setAddingLink(false);
                                                    }
                                                }}
                                                disabled={!linkUrl}
                                            >
                                                Add
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => {
                                                    setAddingLink(false);
                                                    setLinkUrl("");
                                                    setLinkName("");
                                                }}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {attachments.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {attachments.map((att, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border group">
                                            <div className={`p-2 rounded-lg ${att.type === 'link' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {att.type === 'link' ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{att.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{att.url}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                                onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-4">
                            <Button type="button" variant="ghost" onClick={() => router.back()} className="h-12 px-6 rounded-xl hover:bg-gray-100 text-gray-600">
                                Cancel
                            </Button>
                            <Button type="submit" className="h-12 px-8 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl shadow-lg shadow-green-200" disabled={loading}>
                                {loading ? "Creating..." : "Create Deal"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}
