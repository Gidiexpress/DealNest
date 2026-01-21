import Link from "next/link";
import { ChevronRight, Edit2, Trash2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Deal } from "@/types";

interface DealHeaderProps {
    deal: Deal;
    isClient: boolean;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    setEditData: (data: any) => void;
    handleAction: (action: string) => void;
    saveEdit: () => void;
}

export function DealHeader({
    deal,
    isClient,
    isEditing,
    setIsEditing,
    setEditData,
    handleAction,
    saveEdit
}: DealHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <Link href="/dashboard" className="hover:text-green-600 transition-colors">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/deals" className="hover:text-green-600 transition-colors">Deals</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="font-semibold text-gray-900 truncate max-w-[200px]">{deal.title}</span>
            </div>

            {isClient && deal.status === 'created' && (
                <div className="flex gap-2">
                    {!isEditing ? (
                        <>
                            <Button variant="outline" size="sm" onClick={() => {
                                setIsEditing(true);
                                setEditData({ title: deal.title, description: deal.description, amount: deal.amount })
                            }}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleAction('delete')}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button size="sm" onClick={saveEdit}>
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
