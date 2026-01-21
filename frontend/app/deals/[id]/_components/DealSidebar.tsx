import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy } from "lucide-react";
import { Deal } from "@/types";

interface DealSidebarProps {
    deal: Deal;
    copyLink: () => void;
    copied: boolean;
}

export function DealSidebar({
    deal,
    copyLink,
    copied
}: DealSidebarProps) {
    return (
        <div className="space-y-6">
            {/* Action Card should be placed above this in the parent grid or passed as a child */}

            {/* Parties Card */}
            <Card className="border-none shadow-sm rounded-[1.5rem] bg-white">
                <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-lg">Parties</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                            {deal.client.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-gray-900">{deal.client.username}</p>
                            <p className="text-gray-500">Client</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold 
                            ${deal.freelancer ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                            {deal.freelancer ? deal.freelancer.username.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-gray-900">{deal.freelancer?.username || "Pending"}</p>
                            <p className="text-gray-500">Freelancer</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Share Card */}
            {deal.unique_shareable_url && (
                <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-bold uppercase">Invite Link</p>
                    <div className="flex items-center gap-2">
                        <code className="text-[10px] text-gray-600 truncate flex-1 block bg-gray-50 p-2 rounded">
                            {typeof window !== 'undefined' ? `${window.location.host}/d/${deal.unique_shareable_url}` : `.../d/${deal.unique_shareable_url}`}
                        </code>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400" onClick={copyLink}>
                            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
