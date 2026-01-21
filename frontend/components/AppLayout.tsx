import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <main className="md:ml-64 min-h-screen flex flex-col">
                <Header />
                <div className="p-4 md:p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    )
}
