import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, FileText, Link as LinkIcon, X, History, MessageSquare, ChevronRight } from "lucide-react";
import { Deal } from "@/types";

interface DealOverviewProps {
    deal: Deal;
    isEditing: boolean;
    editData: any;
    setEditData: (data: any) => void;
    isFreelancer: boolean;
    isClient: boolean;
    mounted: boolean;
    addingLink: boolean;
    linkUrl: string;
    linkName: string;
    setAddingLink: (val: boolean) => void;
    setLinkUrl: (val: string) => void;
    setLinkName: (val: string) => void;
    handleAddLink: () => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'deal') => void;
    renderAttachment: (att: any, index: number) => React.ReactNode;
}

export function DealOverview({
    deal,
    isEditing,
    editData,
    setEditData,
    isFreelancer,
    isClient,
    mounted,
    addingLink,
    linkUrl,
    linkName,
    setAddingLink,
    setLinkUrl,
    setLinkName,
    handleAddLink,
    handleFileUpload,
    renderAttachment
}: DealOverviewProps) {
    return (
        <Card className="border-none shadow-sm rounded-[1.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-100 bg-white">
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant={deal.status === 'completed' ? 'default' : 'secondary'} className="capitalize px-3 py-1 rounded-full">
                                {deal.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-gray-400">Created {mounted ? new Date(deal.created_at).toLocaleDateString() : '...'}</span>
                        </div>
                        {isEditing ? (
                            <Input
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                className="font-bold text-2xl mb-2"
                            />
                        ) : (
                            <CardTitle className="text-3xl font-bold text-gray-900">{deal.title}</CardTitle>
                        )}
                    </div>
                    <div className="text-right">
                        {isEditing ? (
                            <div className="flex items-center">
                                <span className="text-2xl font-bold text-green-600 mr-1">₦</span>
                                <Input
                                    type="number"
                                    value={editData.amount}
                                    onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                                    className="font-bold text-xl w-32 text-right"
                                />
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-green-600">₦{Number(deal.amount).toLocaleString()}</div>
                        )}
                        <div className="text-sm text-gray-400">Fixed Price</div>
                        {isFreelancer && deal.fee_breakdown && (
                            <div className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-wider">
                                Est. Net: ₦{deal.fee_breakdown.total_to_receive.toLocaleString()}
                            </div>
                        )}
                        {isClient && deal.fee_breakdown && (
                            <div className="text-[10px] font-bold text-amber-600 mt-1 uppercase tracking-wider">
                                Total Cost: ₦{deal.fee_breakdown.total_to_pay.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 bg-white min-h-[300px]">
                <h3 className="font-bold text-gray-800 mb-4">Deal Description</h3>
                {isEditing ? (
                    <Textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="min-h-[200px]"
                    />
                ) : (
                    <div className="prose prose-gray max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {deal.description}
                    </div>
                )}

                {/* Attachments Section */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <Paperclip className="w-4 h-4" /> Attachments
                        </h4>
                        {isClient && (
                            <div className="flex gap-2">
                                {!addingLink ? (
                                    <>
                                        <div className="relative">
                                            <input type="file" id="deal-upload" className="hidden" aria-label="Upload deal attachment" onChange={(e) => handleFileUpload(e, 'deal')} />
                                            <Button variant="outline" size="sm" onClick={() => document.getElementById('deal-upload')?.click()}>
                                                <FileText className="w-4 h-4 mr-2" /> Add File
                                            </Button>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setAddingLink(true)}>
                                            <LinkIcon className="w-4 h-4 mr-2" /> Add Link
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
                                        <Button size="sm" className="h-8" onClick={handleAddLink} disabled={!linkUrl}>Add</Button>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setAddingLink(false)}><X className="w-4 h-4" /></Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {deal.attachments && deal.attachments.length > 0 ? (
                            deal.attachments.map((att, i) => renderAttachment(att, i))
                        ) : (
                            <p className="text-sm text-gray-400 italic">No attachments yet.</p>
                        )}
                    </div>
                </div>

                {/* Submissions History - Assuming deal.submissions exists */}
                {(deal as any).submissions && (deal as any).submissions.length > 0 && (
                    <div className="mt-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2 px-2">
                            <History className="w-5 h-5 text-gray-400" />
                            <h4 className="font-bold text-gray-800">Iteration History</h4>
                            <Badge variant="outline" className="ml-auto font-bold border-gray-200">{(deal as any).submissions.length} Items</Badge>
                        </div>

                        {(deal as any).submissions.map((sub: any, idx: number) => (
                            <Card key={sub.id} className={`border-none shadow-sm rounded-3xl overflow-hidden ${idx === 0 ? 'ring-2 ring-[#00d166]/20' : 'opacity-90 hover:opacity-100 transition-opacity'}`}>
                                <CardHeader className={`p-5 flex-row items-center justify-between space-y-0 ${idx === 0 ? 'bg-[#050b14] text-white' : 'bg-gray-100 text-gray-700'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-[#00d166] text-black shadow-lg shadow-green-500/20' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                            #{sub.revision_round}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold">
                                                {idx === 0 ? 'Current Delivery' : `Revision Round ${sub.revision_round}`}
                                            </CardTitle>
                                            <p className={`text-[10px] uppercase tracking-wider font-semibold ${idx === 0 ? 'text-gray-400' : 'text-gray-400'}`}>
                                                {mounted ? new Date(sub.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '...'}
                                            </p>
                                        </div>
                                    </div>
                                    {idx === 0 && deal.status === 'delivered' && (
                                        <Badge className="bg-[#00d166] text-black border-none px-3 py-1 font-bold text-[10px] uppercase animate-pulse">Action Required</Badge>
                                    )}
                                </CardHeader>
                                <CardContent className="p-6 bg-white">
                                    {sub.notes && (
                                        <div className="mb-6">
                                            <p className="text-sm text-gray-600 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 italic">
                                                "{sub.notes}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {sub.links?.map((link: any, i: number) => (
                                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#00d166]/50 hover:shadow-lg hover:shadow-green-500/5 transition-all group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-[#00d166] group-hover:text-white transition-colors">
                                                        <LinkIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-bold text-gray-900 truncate">{link.label || 'Direct Link'}</p>
                                                        <p className="text-[10px] text-gray-400 truncate tracking-tight">{link.url}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#00d166] group-hover:translate-x-1 transition-all" />
                                            </a>
                                        ))}
                                        {sub.files?.map((file: string, i: number) => (
                                            <a key={i} href={file} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-bold text-gray-900 truncate">Delivery File {i + 1}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
