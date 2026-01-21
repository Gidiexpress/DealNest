
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Briefcase, Wallet, ShieldAlert, Settings, LogOut, Puzzle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Deals", href: "/admin/deals", icon: Briefcase },
    { name: "Financials", href: "/admin/financials", icon: Wallet },
    { name: "Disputes", href: "/admin/disputes", icon: ShieldAlert },
    { name: "Integrations", href: "/admin/integrations", icon: Puzzle },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
    return (
        <div className="hidden border-r bg-white border-gray-100 lg:block w-64 min-h-screen fixed left-0 top-0 z-30">
            <AdminSidebarContent />
        </div>
    )
}

export function MobileAdminSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden mr-2 text-gray-500">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-white">
                <SheetTitle className="hidden">Admin Menu</SheetTitle>
                <AdminSidebarContent />
            </SheetContent>
        </Sheet>
    )
}

function AdminSidebarContent() {
    const pathname = usePathname()

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-20 items-center px-8">
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
            <div className="flex-1 overflow-auto py-4 px-6 space-y-2 mt-4">
                <div className="text-xs font-semibold text-gray-400 mb-4 px-3">ADMIN PANEL</div>
                <nav className="space-y-2">
                    {navItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-3 transition-all",
                                    isActive
                                        ? "bg-green-500 text-white shadow-lg shadow-green-200"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto p-6 border-t border-gray-100">
                <Link
                    href="/auth/logout"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-red-50 hover:text-red-500"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                </Link>
            </div>
        </div>
    )
}
