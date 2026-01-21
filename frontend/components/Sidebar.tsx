"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckSquare, Calendar, BarChart3, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: CheckSquare, label: "My Deals", href: "/deals" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
]

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Sidebar() {
    return (
        <aside className="w-64 bg-white h-screen border-r border-gray-100 hidden md:flex flex-col fixed left-0 top-0 z-30">
            <SidebarContent />
        </aside>
    )
}

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                    <Menu className="w-5 h-5 text-gray-500" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-white">
                <SheetTitle className="hidden">Menu</SheetTitle>
                <SidebarContent />
            </SheetContent>
        </Sheet>
    )
}

function SidebarContent() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-8 h-20 flex items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="DealNest Logo"
                        width={180}
                        height={40}
                        className="h-8 w-auto object-contain"
                    />
                </Link>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-6 space-y-2 mt-4 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-400 mb-4 px-3">MENU</div>
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.href) && item.href !== '/dashboard' || pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive
                                ? "bg-green-500 text-white shadow-lg shadow-green-200"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}

                <div className="mt-8 text-xs font-semibold text-gray-400 mb-4 px-3">GENERAL</div>
                <Link href="/settings" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${pathname === '/settings' ? "bg-green-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                </Link>
                <button
                    onClick={() => {
                        localStorage.removeItem('access_token')
                        window.location.href = '/login'
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </nav>

            {/* Banner / CTA */}
            <div className="p-6">
                <div className="bg-[#050b14] rounded-2xl p-4 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="font-bold mb-1">Get Mobile App</h4>
                        <p className="text-xs text-gray-400 mb-3">Manage deals on the go.</p>
                        <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg h-8 text-xs">Download</Button>
                    </div>
                    {/* Abstract circles */}
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-500/20 rounded-full blur-xl"></div>
                </div>
            </div>
        </div>
    )
}
