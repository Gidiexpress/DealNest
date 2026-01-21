"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, MessageSquare, CheckCircle, AlertTriangle } from "lucide-react"
import { User, Notification } from "@/types"
import { MobileSidebar } from "@/components/Sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Header() {
    const [user, setUser] = useState<User | null>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const router = useRouter()

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications/")
            const data = res.data.results || res.data
            setNotifications(data)
            setUnreadCount(data.filter((n: any) => !n.is_read).length)
        } catch (err) { }
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userRes = await api.get("/auth/me/")
                setUser(userRes.data)
            } catch (err) { }
        }
        fetchUser()
        fetchNotifications()

        // Background Polling every 10 seconds for notifications
        const interval = setInterval(fetchNotifications, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkRead = async (id: number, type: string, dealId?: number) => {
        try {
            await api.post(`/notifications/${id}/mark_read/`)
            fetchNotifications()
            if (dealId) {
                const tab = type === 'message' ? '?tab=discussion' : ''
                router.push(`/deals/${dealId}${tab}`)
            }
        } catch (err) { }
    }

    const handleMarkAllRead = async () => {
        try {
            await api.post(`/notifications/mark_all_read/`)
            fetchNotifications()
        } catch (err) { }
    }

    const renderIcon = (type: string) => {
        switch (type) {
            case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />
            case 'deal_accepted':
            case 'deal_approved':
            case 'deal_delivered':
            case 'deal_funded': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'dispute': return <AlertTriangle className="w-4 h-4 text-red-500" />
            default: return <Bell className="w-4 h-4 text-gray-500" />
        }
    }

    const [searchQuery, setSearchQuery] = useState("")

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/deals?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <header className="h-20 border-b border-gray-100 bg-white/50 backdrop-blur-sm px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <MobileSidebar />
            </div>
            <div className="flex-1"></div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search deals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="pl-10 w-64 bg-white border-gray-200 rounded-xl focus-visible:ring-green-500/20"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl border-gray-200 relative">
                            <Bell className="w-5 h-5 text-gray-500" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-0 rounded-2xl shadow-2xl border border-gray-100 bg-white mt-2" align="end">
                        <DropdownMenuLabel className="p-4 bg-gray-50/50 rounded-t-2xl flex items-center justify-between">
                            <span className="font-bold text-gray-900">Notifications</span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                                >
                                    Mark all read
                                </button>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="m-0" />
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">No notifications yet</div>
                            ) : (
                                notifications.map((n: any) => (
                                    <DropdownMenuItem
                                        key={n.id}
                                        onSelect={() => handleMarkRead(n.id, n.type, n.deal)}
                                        className={`p-4 border-b border-gray-50 focus:bg-gray-50 cursor-pointer flex gap-3 items-start transition-colors relative ${!n.is_read ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : 'pl-[1.25rem]'}`}
                                    >
                                        <div className="mt-1 shrink-0">{renderIcon(n.type)}</div>
                                        <div className="flex-1">
                                            <p className={`text-sm leading-snug ${!n.is_read ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>{n.content}</p>
                                            <span className="text-[10px] text-gray-400 mt-1 block">
                                                {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {!n.is_read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/settings">
                    <div className="flex items-center gap-3 hover:bg-gray-50 py-2 px-3 rounded-xl transition-all group cursor-pointer">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-gray-800 group-hover:text-green-600 transition-colors">{user?.username}</div>
                            <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-green-200 transition-all">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                            <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                </Link>
            </div>
        </header>
    )
}
