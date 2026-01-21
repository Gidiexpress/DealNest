"use client"

import { AdminSidebar, MobileAdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Link from "next/link"
import AdminRoute from "@/components/AdminRoute"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminRoute>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                    <header className="h-20 border-b border-gray-100 bg-white/50 backdrop-blur-sm px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
                        <div className="flex items-center gap-2">
                            <MobileAdminSidebar />
                            <h1 className="font-bold text-xl text-gray-900">Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-500 hidden sm:inline">Logged in as Administrator</span>
                            <Link href="/auth/logout">
                                <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </Button>
                            </Link>
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminRoute>
    )
}


