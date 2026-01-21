import { Paperclip, Link as LinkIcon, FileText } from "lucide-react";

export function renderAttachment(att: any, index: number) {
    // Handle legacy string URLs
    if (typeof att === 'string') {
        return (
            <a key={index} href={att} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Paperclip className="w-5 h-5" /></div>
                <span className="text-sm truncate text-blue-600 underline">Attachment {index + 1}</span>
            </a>
        )
    }

    // Handle objects
    const isLink = att.type === 'link';
    return (
        <a key={index} href={att.url} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 group">
            <div className={`p-2 rounded-lg ${isLink ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {isLink ? <LinkIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{att.name}</p>
                <p className="text-xs text-gray-400 truncate">{att.url}</p>
            </div>
        </a>
    )
}
