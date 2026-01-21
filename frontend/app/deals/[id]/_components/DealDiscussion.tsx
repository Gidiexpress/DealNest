import { useRef, useEffect } from "react";
import { MessageSquare, Paperclip, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Message, User } from "@/types";

interface DealDiscussionProps {
    messages: Message[];
    user: User;
    mounted: boolean;
    newMessage: string;
    setNewMessage: (val: string) => void;
    handleSendMessage: () => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'chat') => void;
}

export function DealDiscussion({
    messages,
    user,
    mounted,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleFileUpload
}: DealDiscussionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const wasAtBottom = useRef(true);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // Consider "at bottom" if within 100px of the actual bottom
            wasAtBottom.current = scrollHeight - scrollTop - clientHeight < 100;
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            const lastMessage = messages[messages.length - 1];
            const isLastMessageMe = lastMessage?.user.id === user.id;

            // Auto-scroll if we were already at bottom OR if the new message is from us
            if (wasAtBottom.current || isLastMessageMe) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [messages, user.id]);

    return (
        <div className="max-h-[600px] flex flex-col bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">Start the conversation...</div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user.id === user.id;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isMe ? 'bg-[#00d166] text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                                    {msg.files && msg.files.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {msg.files.map((f, i) => (
                                                <a key={i} href={f} target="_blank" className={`block text-[11px] font-bold underline flex items-center gap-1 ${isMe ? 'text-green-100' : 'text-blue-500'}`}>
                                                    <Paperclip className="w-3 h-3" /> View Attachment
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className={`mt-1.5 px-1 flex items-center gap-2 text-[10px] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <span className="font-bold text-gray-900 uppercase tracking-wider">{msg.user.username}</span>
                                    <span className="text-gray-400">
                                        {mounted ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <div className="relative">
                        <input type="file" id="chat-upload" className="hidden" aria-label="Upload chat attachment" onChange={(e) => handleFileUpload(e, 'chat')} />
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-green-600" onClick={() => (document.getElementById('chat-upload') as HTMLInputElement)?.click()}>
                            <Paperclip className="w-5 h-5" />
                        </Button>
                    </div>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 border-none focus:ring-1 focus:ring-green-500 rounded-xl"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} className="bg-green-500 hover:bg-green-600 rounded-xl px-4">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
